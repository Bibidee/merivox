"""Focused post-submission governance and envelope regression coverage.

These tests run in Direct Mode. They exercise deterministic contract state
after the validator boundary; mocked model responses are never live evidence.
"""

from __future__ import annotations

import pytest


BASE = 1_799_971_200
QUESTION = 'Which publisher action should this community authorize?'
DETAILS = 'Authorize a roster member to publish bounded official community announcements.'


def text_address(value) -> str:
    if isinstance(value, bytes):
        return '0x' + value.hex()
    return value.as_hex.lower() if hasattr(value, 'as_hex') else str(value).lower()


def binding_setup(contract, vm, owner, roster):
    vm.warp('2027-01-15T00:00:00Z')
    contract.create_space('builders', 'Builder community', [text_address(item) for item in roster])
    with vm.prank(owner):
        return contract.create_binding_round('builders', QUESTION, BASE + 1200, BASE + 7200)


def nominate_action(contract, vm, sender, round_id, recipient, action='GRANT_PUBLISHER', expiry=BASE + 20000, scope='PUBLISHER', title='Publish official notice'):
    with vm.prank(sender):
        return contract.nominate_binding(
            round_id, title, DETAILS, 'Community members', 'Official feed',
            'This week', action, text_address(recipient), scope, expiry,
        )


def open_distinct_ballot(contract, vm, round_id, nomination_count):
    vm.warp('2027-01-15T00:20:00Z')
    contract.begin_alignment(round_id)
    assert contract.reconcile_next(round_id) == 'DISTINCT'
    for _ in range(nomination_count - 1):
        vm.mock_llm(r'BEGIN_UNTRUSTED_JSON', '{"classification":"DISTINCT","choice_id":""}')
        assert contract.reconcile_next(round_id) == 'DISTINCT'
        vm.clear_mocks()
    contract.open_ballot(round_id)
    return contract.get_canonical_ballot(round_id)


def finalize_at_deadline(contract, vm, round_id):
    vm.warp('2027-01-15T02:00:00Z')
    return contract.finalize(round_id), contract.get_round(round_id)


def vote(contract, vm, round_id, sender, choice_id):
    with vm.prank(sender):
        contract.vote(round_id, choice_id)


def test_four_member_two_of_three_is_decided_but_not_approved(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy('contracts/merivox.py')
    roster = [direct_owner, direct_alice, direct_bob, direct_charlie]
    round_id = binding_setup(contract, direct_vm, direct_owner, roster)
    nominate_action(contract, direct_vm, direct_owner, round_id, direct_alice)
    nominate_action(contract, direct_vm, direct_alice, round_id, direct_bob, title='Publish alternate notice')
    ballot = open_distinct_ballot(contract, direct_vm, round_id, 2)
    vote(contract, direct_vm, round_id, direct_owner, ballot[0]['id'])
    vote(contract, direct_vm, round_id, direct_alice, ballot[0]['id'])
    vote(contract, direct_vm, round_id, direct_bob, ballot[1]['id'])
    status, result = finalize_at_deadline(contract, direct_vm, round_id)
    assert status == 'DECIDED'
    assert result['action_status'] == 'NOT_AUTHORIZED'
    with direct_vm.expect_revert('not uniquely approved'):
        contract.dispatch_binding(round_id)


def test_four_member_three_and_four_affirmative_votes_are_approved(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy('contracts/merivox.py')
    roster = [direct_owner, direct_alice, direct_bob, direct_charlie]
    round_id = binding_setup(contract, direct_vm, direct_owner, roster)
    nominate_action(contract, direct_vm, direct_owner, round_id, direct_alice)
    ballot = open_distinct_ballot(contract, direct_vm, round_id, 1)
    for sender in roster[:3]:
        vote(contract, direct_vm, round_id, sender, ballot[0]['id'])
    status, result = finalize_at_deadline(contract, direct_vm, round_id)
    assert status == 'DECIDED'
    assert result['action_status'] == 'APPROVED'


def test_four_member_four_affirmative_votes_are_approved(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy('contracts/merivox.py')
    roster = [direct_owner, direct_alice, direct_bob, direct_charlie]
    round_id = binding_setup(contract, direct_vm, direct_owner, roster)
    nominate_action(contract, direct_vm, direct_owner, round_id, direct_alice)
    ballot = open_distinct_ballot(contract, direct_vm, round_id, 1)
    for sender in roster:
        vote(contract, direct_vm, round_id, sender, ballot[0]['id'])
    status, result = finalize_at_deadline(contract, direct_vm, round_id)
    assert status == 'DECIDED'
    assert result['action_status'] == 'APPROVED'


def test_four_member_two_one_one_has_no_affirmative_majority(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy('contracts/merivox.py')
    roster = [direct_owner, direct_alice, direct_bob, direct_charlie]
    round_id = binding_setup(contract, direct_vm, direct_owner, roster)
    nominate_action(contract, direct_vm, direct_owner, round_id, direct_alice)
    nominate_action(contract, direct_vm, direct_alice, round_id, direct_bob, title='Publish second notice')
    nominate_action(contract, direct_vm, direct_bob, round_id, direct_charlie, title='Publish third notice')
    ballot = open_distinct_ballot(contract, direct_vm, round_id, 3)
    vote(contract, direct_vm, round_id, direct_owner, ballot[0]['id'])
    vote(contract, direct_vm, round_id, direct_alice, ballot[0]['id'])
    vote(contract, direct_vm, round_id, direct_bob, ballot[1]['id'])
    vote(contract, direct_vm, round_id, direct_charlie, ballot[2]['id'])
    status, result = finalize_at_deadline(contract, direct_vm, round_id)
    assert status == 'DECIDED'
    assert result['action_status'] == 'NOT_AUTHORIZED'


def test_binding_tie_and_insufficient_quorum_are_not_approved(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    contract = direct_deploy('contracts/merivox.py')
    roster = [direct_owner, direct_alice, direct_bob]
    tie_round = binding_setup(contract, direct_vm, direct_owner, roster)
    nominate_action(contract, direct_vm, direct_owner, tie_round, direct_alice)
    nominate_action(contract, direct_vm, direct_alice, tie_round, direct_bob, title='Publish tie notice')
    tie_ballot = open_distinct_ballot(contract, direct_vm, tie_round, 2)
    vote(contract, direct_vm, tie_round, direct_owner, tie_ballot[0]['id'])
    vote(contract, direct_vm, tie_round, direct_alice, tie_ballot[1]['id'])
    status, result = finalize_at_deadline(contract, direct_vm, tie_round)
    assert status == 'TIED'
    assert result['action_status'] == 'NOT_AUTHORIZED'



def test_binding_insufficient_quorum_is_not_approved(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    contract = direct_deploy('contracts/merivox.py')
    roster = [direct_owner, direct_alice, direct_bob]
    round_id = binding_setup(contract, direct_vm, direct_owner, roster)
    nominate_action(contract, direct_vm, direct_owner, round_id, direct_alice)
    ballot = open_distinct_ballot(contract, direct_vm, round_id, 1)
    vote(contract, direct_vm, round_id, direct_owner, ballot[0]['id'])
    status, result = finalize_at_deadline(contract, direct_vm, round_id)
    assert status == 'NO_QUORUM'
    assert result['action_status'] == 'NOT_AUTHORIZED'


def test_uncertain_unresolved_and_expired_grants_are_not_approved(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    roster = [direct_owner, direct_alice, direct_bob]

    contract = direct_deploy('contracts/merivox.py')
    uncertain_round = binding_setup(contract, direct_vm, direct_owner, roster)
    nominate_action(contract, direct_vm, direct_owner, uncertain_round, direct_alice)
    nominate_action(contract, direct_vm, direct_alice, uncertain_round, direct_bob, title='Publish uncertain notice')
    direct_vm.warp('2027-01-15T00:20:00Z')
    contract.begin_alignment(uncertain_round)
    contract.reconcile_next(uncertain_round)
    direct_vm.mock_llm(r'BEGIN_UNTRUSTED_JSON', '{"classification":"AMBIGUOUS","choice_id":""}')
    assert contract.reconcile_next(uncertain_round) == 'AMBIGUOUS'
    direct_vm.clear_mocks()
    ballot = contract.get_canonical_ballot(uncertain_round)
    contract.open_ballot(uncertain_round)
    vote(contract, direct_vm, uncertain_round, direct_owner, ballot[1]['id'])
    vote(contract, direct_vm, uncertain_round, direct_alice, ballot[1]['id'])
    status, result = finalize_at_deadline(contract, direct_vm, uncertain_round)
    assert status == 'DECIDED'
    assert result['action_status'] == 'NOT_AUTHORIZED'



def test_unresolved_binding_nomination_is_not_approved(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    roster = [direct_owner, direct_alice, direct_bob]
    contract = direct_deploy('contracts/merivox.py')
    unresolved_round = binding_setup(contract, direct_vm, direct_owner, roster)
    nominate_action(contract, direct_vm, direct_owner, unresolved_round, direct_alice)
    pending = nominate_action(contract, direct_vm, direct_alice, unresolved_round, direct_bob, title='Publish unresolved notice')
    direct_vm.warp('2027-01-15T00:20:00Z')
    contract.begin_alignment(unresolved_round)
    contract.reconcile_next(unresolved_round)
    direct_vm.mock_llm(r'BEGIN_UNTRUSTED_JSON', 'not-json')
    assert contract.reconcile_next(unresolved_round) == 'RETRY_REQUIRED'
    direct_vm.clear_mocks()
    direct_vm.warp('2027-01-15T01:50:00Z')
    contract.close_alignment(unresolved_round)
    ballot = contract.get_canonical_ballot(unresolved_round)
    contract.open_ballot(unresolved_round)
    vote(contract, direct_vm, unresolved_round, direct_owner, ballot[0]['id'])
    vote(contract, direct_vm, unresolved_round, direct_alice, ballot[0]['id'])
    status, result = finalize_at_deadline(contract, direct_vm, unresolved_round)
    assert contract.get_alternative(pending)['judgment'] == 'UNRESOLVED'
    assert status == 'DECIDED'
    assert result['action_status'] == 'NOT_AUTHORIZED'


def test_expired_grant_is_not_approved(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    roster = [direct_owner, direct_alice, direct_bob]
    contract = direct_deploy('contracts/merivox.py')
    expired_round = binding_setup(contract, direct_vm, direct_owner, roster)
    nominate_action(contract, direct_vm, direct_owner, expired_round, direct_alice, expiry=BASE + 1800)
    ballot = open_distinct_ballot(contract, direct_vm, expired_round, 1)
    for sender in roster:
        vote(contract, direct_vm, expired_round, sender, ballot[0]['id'])
    status, result = finalize_at_deadline(contract, direct_vm, expired_round)
    assert status == 'DECIDED'
    assert result['action_status'] == 'NOT_AUTHORIZED'


def test_revoke_with_zero_expiry_can_be_approved(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    contract = direct_deploy('contracts/merivox.py')
    roster = [direct_owner, direct_alice, direct_bob]
    round_id = binding_setup(contract, direct_vm, direct_owner, roster)
    nominate_action(contract, direct_vm, direct_owner, round_id, direct_alice, action='REVOKE_PUBLISHER', expiry=0)
    ballot = open_distinct_ballot(contract, direct_vm, round_id, 1)
    for sender in roster:
        vote(contract, direct_vm, round_id, sender, ballot[0]['id'])
    status, result = finalize_at_deadline(contract, direct_vm, round_id)
    assert status == 'DECIDED'
    assert result['action_status'] == 'APPROVED'


def test_space_directory_pagination_returns_every_space(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    contract = direct_deploy('contracts/merivox.py')
    roster = [text_address(direct_owner), text_address(direct_alice), text_address(direct_bob)]
    direct_vm.warp('2027-01-15T00:00:00Z')
    for index in range(26):
        assert contract.create_space(f'builders-{index:02d}', f'Builder community {index:02d}', roster) == f'builders-{index:02d}'
    first_page = contract.list_spaces(0, 25)
    second_page = contract.list_spaces(25, 25)
    assert len(first_page) == 25
    assert len(second_page) == 1
    assert first_page[0]['space_id'] == 'builders-00'
    assert second_page[0]['space_id'] == 'builders-25'


@pytest.mark.parametrize('mutation', ['recipient', 'action', 'expiry', 'scope', 'digest'])
def test_equivalent_binding_nomination_with_incompatible_envelope_is_ambiguous(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob, mutation
):
    contract = direct_deploy('contracts/merivox.py')
    roster = [direct_owner, direct_alice, direct_bob]
    round_id = binding_setup(contract, direct_vm, direct_owner, roster)
    first = nominate_action(contract, direct_vm, direct_owner, round_id, direct_alice)
    second = nominate_action(contract, direct_vm, direct_alice, round_id, direct_alice, title='Same words different envelope')
    direct_vm.warp('2027-01-15T00:20:00Z')
    contract.begin_alignment(round_id)
    contract.reconcile_next(round_id)
    alternative = contract.alternatives[second]
    if mutation == 'recipient':
        alternative.recipient_wallet = text_address(direct_bob)
    elif mutation == 'action':
        alternative.action_type = 'REVOKE_PUBLISHER'
        alternative.expires_at = 0
    elif mutation == 'expiry':
        alternative.expires_at = BASE + 19000
    elif mutation == 'scope':
        alternative.permission_scope = 'ADMIN'
    else:
        alternative.action_digest = '0' * 64
    direct_vm.mock_llm(r'BEGIN_UNTRUSTED_JSON', '{"classification":"EQUIVALENT","choice_id":"1"}')
    assert contract.reconcile_next(round_id) == 'AMBIGUOUS'
    state = contract.get_alternative(second)
    assert state['judgment'] == 'AMBIGUOUS'
    assert state['validator_judgment'] == 'EQUIVALENT'
    assert state['last_error'] == 'INCOMPATIBLE_ACTION_ENVELOPE'
    ballot = contract.get_canonical_ballot(round_id)
    assert ballot[0]['nomination_ids'] == [first]
    assert ballot[1]['nomination_ids'] == [second]


def test_equivalent_binding_nomination_with_matching_envelope_preserves_validator_consensus(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    contract = direct_deploy('contracts/merivox.py')
    round_id = binding_setup(contract, direct_vm, direct_owner, [direct_owner, direct_alice, direct_bob])
    first = nominate_action(contract, direct_vm, direct_owner, round_id, direct_alice, title='First wording')
    second = nominate_action(contract, direct_vm, direct_alice, round_id, direct_alice, title='Different wording')
    direct_vm.warp('2027-01-15T00:20:00Z')
    contract.begin_alignment(round_id)
    contract.reconcile_next(round_id)
    direct_vm.mock_llm(r'BEGIN_UNTRUSTED_JSON', '{"classification":"EQUIVALENT","choice_id":"1"}')
    assert contract.reconcile_next(round_id) == 'EQUIVALENT'
    state = contract.get_alternative(second)
    assert state['judgment'] == 'EQUIVALENT'
    assert state['validator_judgment'] == 'EQUIVALENT'
    assert contract.get_canonical_ballot(round_id)[0]['nomination_ids'] == [first, second]
