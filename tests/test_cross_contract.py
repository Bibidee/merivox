"""Compatible-runtime cross-contract lifecycle tests.

These tests run against the repository's glsim engine. They are not live
Studionet evidence; live evidence is recorded separately after deployment.
"""

from __future__ import annotations

import pytest
import sys

from glsim.engine import SimEngine
from glsim.state import StateStore


OWNER = '0x' + '11' * 20
ALICE = '0x' + '22' * 20
BOB = '0x' + '33' * 20
OUTSIDER = '0x' + '44' * 20
QUESTION = 'Which official announcement should the community publish next?'
DETAILS = 'Authorize a roster member to publish a bounded official community announcement.'


@pytest.fixture
def sim_engine():
    # This suite exercises contract-to-contract views/messages, not the
    # optional embedding helper. The glsim runner otherwise imports its
    # optional NumPy-backed patch even though Merivox uses prompt consensus.
    import gltest.direct.loader as direct_loader
    direct_loader._mock_embeddings_for_direct_mode = lambda: None
    state = StateStore(chain_id=61999, seed='merivox-cross-contract')
    engine = SimEngine(state)
    engine.activate()
    original_set_context = engine._set_message_context
    original_sync_contract = engine._sync_message_contract_address

    def sync_gl_message(contract_address, sender=None):
        gl_module = sys.modules.get('genlayer.gl')
        if gl_module is None or getattr(gl_module, 'message', None) is None:
            return
        from genlayer.py.types import Address, u256

        def as_address(value):
            if isinstance(value, Address):
                return value
            if isinstance(value, bytes):
                return Address(value)
            if hasattr(value, 'as_bytes'):
                return Address(value.as_bytes)
            return Address(value)

        address = as_address(contract_address)
        current = gl_module.message
        sender_address = as_address(sender) if sender is not None else current.sender_address
        origin_address = current.origin_address or sender_address
        gl_module.message = gl_module.MessageType(
            contract_address=address,
            sender_address=sender_address,
            origin_address=origin_address,
            value=u256(0),
            chain_id=u256(61999),
        )
        if isinstance(getattr(gl_module, 'message_raw', None), dict):
            gl_module.message_raw['contract_address'] = address
            gl_module.message_raw['sender_address'] = sender_address
            gl_module.message_raw['origin_address'] = origin_address

    def set_context(contract_address, sender):
        original_set_context(contract_address, sender)
        sync_gl_message(contract_address, sender)

    def sync_contract(contract_address):
        original_sync_contract(contract_address)
        sync_gl_message(contract_address)

    engine._set_message_context = set_context
    engine._sync_message_contract_address = sync_contract
    engine.vm.warp('2027-01-15T00:00:00Z')
    try:
        yield engine
    finally:
        engine.deactivate()


def deploy_bound_pair(engine: SimEngine) -> tuple[str, str]:
    merivox, _ = engine.deploy('contracts/merivox.py', sender=OWNER)
    import gltest.direct.loader as direct_loader
    import glsim.engine as sim_engine_module
    from gltest.direct.sdk_compat import sync_message_context
    sim_engine_module.import_calldata = direct_loader.import_calldata
    sim_engine_module.import_address = direct_loader.import_address
    sim_engine_module.sync_message_context = sync_message_context
    # genlayer-test's registry is process-global; glsim's path-based loader
    # resets the legacy registry but rc3 also tracks the active class here.
    import genlayer.gl.genvm_contracts as contract_registry
    contract_registry.__known_contract__ = None
    gate, _ = engine.deploy('contracts/merivox_action_gate.py', args=[merivox], sender=OWNER)
    assert engine.call_method(merivox, 'configure_action_gate', [gate], sender=OWNER) == gate.lower()
    return merivox, gate


def test_binding_grant_revoke_publication_and_replay_protection(sim_engine):
    engine = sim_engine
    merivox, gate = deploy_bound_pair(engine)
    roster = [OWNER, ALICE, BOB]
    engine.call_method(merivox, 'create_space', ['builders', 'Builder community', roster], sender=OWNER)
    grant_round = engine.call_method(
        merivox, 'create_binding_round', ['builders', QUESTION, 1799972400, 1799978400], sender=OWNER
    )
    grant_expiry = 1799982000
    first = engine.call_method(
        merivox, 'nominate_binding', [grant_round, 'Publish the weekly notice', DETAILS, 'Members', 'Official feed', 'Saturday', 'GRANT_PUBLISHER', ALICE, 'PUBLISHER', grant_expiry], sender=OWNER
    )
    second = engine.call_method(
        merivox, 'nominate_binding', [grant_round, 'Publish the weekly notice', DETAILS, 'Members', 'Official feed', 'Saturday', 'GRANT_PUBLISHER', ALICE, 'PUBLISHER', grant_expiry], sender=ALICE
    )
    assert first != second
    engine.vm.warp('2027-01-15T00:20:00Z')
    engine.call_method(merivox, 'begin_alignment', [grant_round], sender=BOB)
    engine.vm.mock_llm(r'BEGIN_UNTRUSTED_JSON', '{"classification":"EQUIVALENT","choice_id":"1"}')
    assert engine.call_method(merivox, 'reconcile_next', [grant_round], sender=BOB) == 'DISTINCT'
    assert engine.call_method(merivox, 'reconcile_next', [grant_round], sender=BOB) == 'EQUIVALENT'
    engine.vm.clear_mocks()
    engine.call_method(merivox, 'open_ballot', [grant_round], sender=OWNER)
    engine.call_method(merivox, 'vote', [grant_round, '1'], sender=OWNER)
    engine.call_method(merivox, 'vote', [grant_round, '1'], sender=ALICE)
    engine.vm.warp('2027-01-15T02:00:00Z')
    assert engine.call_method(merivox, 'finalize', [grant_round], sender=BOB) == 'DECIDED'
    assert engine.call_method(merivox, 'dispatch_binding', [grant_round], sender=BOB) == 'DISPATCHED'
    permission = engine.call_method(gate, 'get_permission', ['builders', ALICE])
    assert permission['effective'] is True
    assert permission['action_type'] == 'GRANT_PUBLISHER'
    assert engine.call_method(merivox, 'refresh_binding_action', [grant_round], sender=BOB) == 'APPLIED'
    with pytest.raises(Exception, match='not an active publisher'):
        engine.call_method(gate, 'publish_announcement', ['builders', 'Unauthorized post'], sender=OUTSIDER)
    announcement_id = engine.call_method(gate, 'publish_announcement', ['builders', 'The authorized weekly update'], sender=ALICE)
    assert engine.call_method(gate, 'get_announcement', [announcement_id])['author'].lower() == ALICE.lower()

    engine.vm.warp('2027-01-15T03:00:00Z')
    revoke_round = engine.call_method(
        merivox, 'create_binding_round', ['builders', 'Should we revoke the publisher permission?', 1799983200, 1799989200], sender=BOB
    )
    engine.call_method(
        merivox, 'nominate_binding', [revoke_round, 'Revoke publisher access', 'Remove the same publisher permission from the community feed.', 'Members', 'Permission registry', 'Immediately', 'REVOKE_PUBLISHER', ALICE, 'PUBLISHER', 0], sender=BOB
    )
    engine.vm.warp('2027-01-15T03:20:00Z')
    engine.call_method(merivox, 'begin_alignment', [revoke_round], sender=OWNER)
    engine.call_method(merivox, 'reconcile_next', [revoke_round], sender=OWNER)
    engine.call_method(merivox, 'open_ballot', [revoke_round], sender=OWNER)
    engine.call_method(merivox, 'vote', [revoke_round, '2'], sender=OWNER)
    engine.call_method(merivox, 'vote', [revoke_round, '2'], sender=ALICE)
    engine.vm.warp('2027-01-15T05:00:00Z')
    assert engine.call_method(merivox, 'finalize', [revoke_round], sender=BOB) == 'DECIDED'
    assert engine.call_method(merivox, 'dispatch_binding', [revoke_round], sender=BOB) == 'DISPATCHED'
    revoked = engine.call_method(gate, 'get_permission', ['builders', ALICE])
    assert revoked['effective'] is False
    with pytest.raises(Exception, match='not an active publisher'):
        engine.call_method(gate, 'publish_announcement', ['builders', 'Post after revocation'], sender=ALICE)

    old = engine.call_method(merivox, 'get_binding_action', [grant_round])
    assert old['lifecycle'] == 'APPLIED'
    with pytest.raises(Exception, match='not recoverable'):
        engine.call_method(merivox, 'recover_binding_action', [grant_round], sender=OWNER)
    old_replay = engine.call_method(
        gate,
        'apply_authorization',
        ['builders', 'GRANT_PUBLISHER', ALICE, 'PUBLISHER', grant_expiry, old['version'], old['action_digest']],
        sender=merivox,
    )
    assert old_replay == 'SUPERSEDED'
