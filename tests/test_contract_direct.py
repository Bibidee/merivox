"""Direct Mode contract tests.

These tests execute the contract in the pinned GenLayer Direct Mode runner.
LLM responses are mocked only to exercise the contract's validator boundary;
the assertions never treat a mock as live Studionet evidence.
"""

from __future__ import annotations

from typing import Any


QUESTION = 'What should our community build together next?'
DETAILS = 'A hands-on session with a defined deliverable, audience and schedule.'


def address(value: Any) -> str:
    if isinstance(value, bytes):
        return '0x' + value.hex()
    return str(value)


def members(owner: Any, *others: Any) -> list[str]:
    return [address(owner), *(address(x) for x in others)]


def create_round(contract: Any, vm: Any, roster: list[str], quorum: int = 2) -> str:
    base = 1_799_971_200
    vm.warp('2027-01-15T00:00:00Z')
    return contract.create_round(QUESTION, roster, base + 1200, base + 7200, quorum)


def nominate(contract: Any, vm: Any, sender: Any, round_id: str, title: str) -> str:
    with vm.prank(sender):
        return contract.nominate(round_id, title, DETAILS, 'Small local builder group', 'Written workshop outcome', 'Saturday morning')


def test_round_creation_and_boundaries(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob, direct_accounts):
    contract = direct_deploy('contracts/merivox.py')
    roster = members(direct_owner, direct_alice, direct_bob)
    round_id = create_round(contract, direct_vm, roster)
    record = contract.get_round(round_id)
    assert record['status'] == 'NOMINATING'
    assert record['members'] == [x.lower() for x in roster]
    assert record['quorum'] == 2
    assert record['alignment_close'] == 1_799_971_200 + 7200 - 900
    assert record['choice_count'] == 0

    with direct_vm.expect_revert('Duplicate member'):
        contract.create_round(QUESTION, [roster[0], roster[1], roster[1]], 1_800_001_200, 1_800_007_200, 2)
    with direct_vm.expect_revert('Malformed wallet address'):
        contract.create_round(QUESTION, [roster[0], '0x123', roster[2]], 1_800_001_200, 1_800_007_200, 2)
    with direct_vm.expect_revert('Creator must be an eligible member'):
        with direct_vm.prank(direct_alice):
            contract.create_round(QUESTION, [roster[0], roster[2], address(direct_accounts[0])], 1_800_001_200, 1_800_007_200, 2)
    with direct_vm.expect_revert('Quorum must be between 1 and member count'):
        contract.create_round(QUESTION, roster, 1_800_001_200, 1_800_007_200, 4)
    with direct_vm.expect_revert('Ballot deadline must leave at least 15 minutes'):
        contract.create_round(QUESTION, roster, 1_800_001_200, 1_800_001_500, 2)


def test_nomination_membership_uniqueness_and_limits(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob, direct_charlie, direct_accounts):
    contract = direct_deploy('contracts/merivox.py')
    roster = members(direct_owner, direct_alice, direct_bob, direct_charlie, *direct_accounts[4:9])
    round_id = create_round(contract, direct_vm, roster, quorum=3)
    nominate(contract, direct_vm, direct_owner, round_id, 'First actionable option')
    with direct_vm.expect_revert('Wallet already nominated'):
        nominate(contract, direct_vm, direct_owner, round_id, 'Second actionable option')
    outsider = direct_accounts[0]
    with direct_vm.expect_revert('Only eligible members'):
        nominate(contract, direct_vm, outsider, round_id, 'Outsider actionable option')
    with direct_vm.expect_revert('Title or details outside permitted bounds'):
        with direct_vm.prank(direct_alice):
            contract.nominate(round_id, 'tiny', DETAILS, '', '', '')

    for index, sender in enumerate([direct_alice, direct_bob, direct_charlie, *direct_accounts[4:8]], start=2):
        nominate(contract, direct_vm, sender, round_id, f'Option {index:02d} actionable')
    assert contract.get_round(round_id)['nomination_count'] == 8
    with direct_vm.expect_revert('Alternative limit reached'):
        with direct_vm.prank(direct_accounts[8]):
            contract.nominate(round_id, 'Ninth actionable option', DETAILS, '', '', '')


def test_validator_grouping_distinct_and_frozen_ballot(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    contract = direct_deploy('contracts/merivox.py')
    round_id = create_round(contract, direct_vm, members(direct_owner, direct_alice, direct_bob))
    first = nominate(contract, direct_vm, direct_owner, round_id, 'Beginner contract workshop')
    second = nominate(contract, direct_vm, direct_alice, round_id, 'Intro deployment learning session')
    third = nominate(contract, direct_vm, direct_bob, round_id, 'Weekend community hackathon')

    direct_vm.warp('2027-01-15T00:20:00Z')
    contract.begin_alignment(round_id)
    assert contract.reconcile_next(round_id) == 'DISTINCT'
    direct_vm.mock_llm(r'DATA: CANDIDATE', '{"classification":"EQUIVALENT","choice_id":"1"}')
    assert contract.reconcile_next(round_id) == 'EQUIVALENT'
    assert direct_vm.run_validator() is True
    direct_vm.clear_mocks()
    direct_vm.mock_llm(r'DATA: CANDIDATE', '{"classification":"DISTINCT","choice_id":""}')
    assert contract.reconcile_next(round_id) == 'DISTINCT'
    ballot = contract.get_canonical_ballot(round_id)
    assert len(ballot) == 2
    assert ballot[0]['nomination_ids'] == [first, second]
    assert ballot[1]['nomination_ids'] == [third]
    assert ballot[0]['uncertain'] is False
    assert contract.get_alternative(second)['judgment'] == 'EQUIVALENT'

    contract.open_ballot(round_id)
    with direct_vm.expect_revert('Round is not reconciling'):
        contract.reconcile_next(round_id)
    with direct_vm.prank(direct_owner):
        contract.vote(round_id, ballot[0]['id'])
    with direct_vm.prank(direct_alice):
        contract.vote(round_id, ballot[0]['id'])
    with direct_vm.prank(direct_bob):
        contract.vote(round_id, ballot[1]['id'])
    direct_vm.warp('2027-01-15T02:00:00Z')
    assert contract.finalize(round_id) == 'DECIDED'
    result = contract.get_result(round_id)
    assert result['status'] == 'DECIDED'
    assert result['winner_choice_id'] == ballot[0]['id']
    assert result['voter_count'] == 3
    assert sum(item['votes'] for item in contract.get_tally(round_id)['items']) == 3
    with direct_vm.expect_revert('already terminal'):
        contract.finalize(round_id)


def test_ambiguous_and_invalid_model_output_are_conservative(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    contract = direct_deploy('contracts/merivox.py')
    round_id = create_round(contract, direct_vm, members(direct_owner, direct_alice, direct_bob))
    nominate(contract, direct_vm, direct_owner, round_id, 'Community learning session')
    second = nominate(contract, direct_vm, direct_alice, round_id, 'Learning session with flexible scope')
    direct_vm.warp('2027-01-15T00:20:00Z')
    contract.begin_alignment(round_id)
    contract.reconcile_next(round_id)
    direct_vm.mock_llm(r'DATA: CANDIDATE', '{"classification":"AMBIGUOUS","choice_id":""}')
    assert contract.reconcile_next(round_id) == 'AMBIGUOUS'
    assert contract.get_alternative(second)['judgment'] == 'AMBIGUOUS'
    assert contract.get_canonical_ballot(round_id)[1]['uncertain'] is True

    round_two = create_round(contract, direct_vm, members(direct_owner, direct_alice, direct_bob))
    nominate(contract, direct_vm, direct_owner, round_two, 'Anchor option for retry')
    retry_id = nominate(contract, direct_vm, direct_alice, round_two, 'Candidate option for retry')
    direct_vm.warp('2027-01-15T00:20:00Z')
    contract.begin_alignment(round_two)
    contract.reconcile_next(round_two)
    direct_vm.clear_mocks()
    direct_vm.mock_llm(r'DATA: CANDIDATE', 'not-json')
    assert contract.reconcile_next(round_two) == 'RETRY_REQUIRED'
    retry_state = contract.get_alternative(retry_id)
    assert retry_state['judgment'] == 'UNREVIEWED'
    assert retry_state['attempts'] == 1
    assert retry_state['last_error'] == 'CONSENSUS_UNAVAILABLE'
    with direct_vm.expect_revert('cooldown'):
        contract.reconcile_next(round_two)

    direct_vm.warp('2027-01-15T00:22:00Z')
    direct_vm.mock_llm(r'DATA: CANDIDATE', 'not-json')
    assert contract.reconcile_next(round_two) == 'RETRY_REQUIRED'
    direct_vm.warp('2027-01-15T00:24:00Z')
    assert contract.reconcile_next(round_two) == 'RETRY_REQUIRED'
    with direct_vm.expect_revert('retry cap'):
        contract.reconcile_next(round_two)
    direct_vm.warp('2027-01-15T01:45:00Z')
    assert contract.close_alignment(round_two) == 'BALLOT_READY'
    assert contract.get_alternative(retry_id)['judgment'] == 'UNRESOLVED'
    assert contract.get_canonical_ballot(round_two)[1]['uncertain'] is True


def test_tie_no_quorum_and_vote_rejections(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    contract = direct_deploy('contracts/merivox.py')
    round_id = create_round(contract, direct_vm, members(direct_owner, direct_alice, direct_bob), quorum=2)
    nominate(contract, direct_vm, direct_owner, round_id, 'Option alpha')
    nominate(contract, direct_vm, direct_alice, round_id, 'Option bravo')
    direct_vm.warp('2027-01-15T00:20:00Z')
    contract.begin_alignment(round_id)
    contract.reconcile_next(round_id)
    direct_vm.mock_llm(r'DATA: CANDIDATE', '{"classification":"DISTINCT","choice_id":""}')
    contract.reconcile_next(round_id)
    ballot = contract.get_canonical_ballot(round_id)
    contract.open_ballot(round_id)
    with direct_vm.expect_revert('Only eligible members'):
        with direct_vm.prank(direct_accounts_for_test(direct_vm)):
            contract.vote(round_id, ballot[0]['id'])
    with direct_vm.prank(direct_owner):
        contract.vote(round_id, ballot[0]['id'])
    with direct_vm.expect_revert('already voted'):
        with direct_vm.prank(direct_owner):
            contract.vote(round_id, ballot[1]['id'])
    with direct_vm.prank(direct_alice):
        contract.vote(round_id, ballot[1]['id'])
    direct_vm.warp('2027-01-15T02:00:00Z')
    assert contract.finalize(round_id) == 'TIED'
    assert len(contract.get_result(round_id)['tie_choice_ids']) == 2

    no_quorum = create_round(contract, direct_vm, members(direct_owner, direct_alice, direct_bob), quorum=3)
    nominate(contract, direct_vm, direct_owner, no_quorum, 'Only option for quorum test')
    direct_vm.warp('2027-01-15T00:20:00Z')
    contract.begin_alignment(no_quorum)
    contract.reconcile_next(no_quorum)
    contract.open_ballot(no_quorum)
    direct_vm.warp('2027-01-15T02:00:00Z')
    assert contract.finalize(no_quorum) == 'NO_QUORUM'
    assert contract.get_result(no_quorum)['reason'] == 'TURNOUT_BELOW_QUORUM'


def direct_accounts_for_test(vm):
    """Use a deterministic non-roster address without importing SDK internals."""
    import hashlib

    return bytes.fromhex(hashlib.sha256(b'not-in-roster').hexdigest()[:40])
