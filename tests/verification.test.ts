import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyReconciliationReadback } from '../lib/verification.ts';
import type { Nomination, Round } from '../lib/model.ts';

const round = (overrides: Partial<Round> = {}): Round => ({
  id: '4', creator: '0xcreator', question: 'A sufficiently long decision question?', status: 'RECONCILING',
  members: ['0xcreator'], member_count: 1, quorum: 1, nomination_close: 100, alignment_close: 200,
  ballot_close: 300, created_at: 0, ballot_opened_at: 0, finalized_at: 0, nomination_ids: ['a1'],
  choice_ids: ['c1'], tie_choice_ids: [], alignment_cursor: 1, voter_count: 0, nomination_count: 1,
  choice_count: 1, last_alignment_at: 150, last_judgment: 'DISTINCT', winner_choice_id: '', result_reason: '',
  ...overrides,
});

const nomination = (overrides: Partial<Nomination> = {}): Nomination => ({
  id: 'a1', round_id: '4', author: '0xmember', title: 'A valid title', details: 'A sufficiently detailed proposal.',
  audience: 'Members', delivery: 'A public session', timing: 'This month', choice_id: '', judgment: 'UNREVIEWED',
  attempts: 0, last_attempt_at: 0, last_error: '', created_at: 0, ...overrides,
});

test('accepts a bounded RETRY_REQUIRED reconciliation readback', () => {
  const before = round({ alignment_cursor: 0, last_judgment: 'DISTINCT' });
  const after = round({ alignment_cursor: 0, last_judgment: 'UNRESOLVED' });
  const result = verifyReconciliationReadback(
    before,
    after,
    nomination({ attempts: 1 }),
    nomination({ attempts: 2, last_error: 'CONSENSUS_UNAVAILABLE' }),
  );
  assert.equal(result, 'Application state verified: RETRY_REQUIRED (2/3 attempts used)');
});

test('rejects an unchanged reconciliation readback without the retry state', () => {
  const before = round({ alignment_cursor: 0 });
  const after = round({ alignment_cursor: 0, last_judgment: 'DISTINCT' });
  assert.throws(
    () => verifyReconciliationReadback(before, after, nomination({ attempts: 1 }), nomination({ attempts: 1 })),
    /no valid RETRY_REQUIRED state/,
  );
});

test('accepts an assignment that advances the cursor', () => {
  const before = round({ alignment_cursor: 0 });
  const after = round({ alignment_cursor: 1, last_judgment: 'EQUIVALENT' });
  assert.equal(
    verifyReconciliationReadback(before, after, nomination(), null),
    'Application state verified: RECONCILING',
  );
});
