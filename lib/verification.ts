import { ROUND_RULES, type Nomination, type Round } from './model';

/**
 * Verify the two valid post-finality shapes of reconcile_next:
 * an assignment that advances the cursor, or a bounded consensus retry that
 * records the failed attempt without assigning the alternative.
 */
export function verifyReconciliationReadback(
  before: Round | null,
  after: Round,
  beforePending: Nomination | null,
  pending: Nomination | null,
): string {
  if (!before) return `Application state verified: ${after.status}`;

  if (after.alignment_cursor > before.alignment_cursor || after.status === 'BALLOT_READY') {
    return `Application state verified: ${after.status}`;
  }

  const previousAttempts = beforePending?.attempts ?? 0;
  const retryRequired =
    after.status === 'RECONCILING' &&
    after.alignment_cursor === before.alignment_cursor &&
    after.last_judgment === 'UNRESOLVED' &&
    pending?.judgment === 'UNREVIEWED' &&
    pending.choice_id === '' &&
    pending.last_error === 'CONSENSUS_UNAVAILABLE' &&
    pending.attempts === previousAttempts + 1 &&
    pending.attempts <= ROUND_RULES.maxReconciliationAttempts;

  if (retryRequired) {
    return `Application state verified: RETRY_REQUIRED (${pending.attempts}/${ROUND_RULES.maxReconciliationAttempts} attempts used)`;
  }

  throw new Error('alignment cursor did not advance and no valid RETRY_REQUIRED state was recorded');
}
