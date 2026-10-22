import { ROUND_RULES, type Nomination, type Round } from './model';

export interface AnnouncementVerificationInput {
  returnedId: unknown;
  expectedSpaceId: string;
  expectedAuthor: string;
  expectedContent: string;
  expectedAuthorizationVersion: number;
  readAnnouncement: (announcementId: string) => Promise<unknown>;
}

function normalizeAnnouncementId(value: unknown): string {
  const id = typeof value === 'number' && Number.isSafeInteger(value)
    ? String(value)
    : typeof value === 'string' ? value.trim() : '';
  if (!/^[1-9]\d*$/.test(id)) throw new Error('Finalized publication did not return a valid announcement ID.');
  return id;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Verify the exact ActionGate record named by the finalized write return. */
export async function verifyAnnouncementReadback(input: AnnouncementVerificationInput): Promise<string> {
  const announcementId = normalizeAnnouncementId(input.returnedId);
  const raw = await input.readAnnouncement(announcementId);
  if (!raw || typeof raw !== 'object') throw new Error('The finalized publication returned no readable announcement record.');
  const record = raw as Record<string, unknown>;
  const content = input.expectedContent.trim();
  const expectedDigest = await sha256Hex(content);
  if (String(record.id ?? '') !== announcementId) throw new Error('Announcement readback returned the wrong identifier.');
  if (String(record.space_id ?? '') !== input.expectedSpaceId) throw new Error('Announcement readback returned the wrong community.');
  if (String(record.author ?? '').toLowerCase() !== input.expectedAuthor.toLowerCase()) throw new Error('Announcement readback returned the wrong author.');
  if (String(record.content ?? '') !== content) throw new Error('Announcement readback returned different content.');
  if (String(record.content_digest ?? '').toLowerCase() !== expectedDigest) throw new Error('Announcement readback returned an invalid content digest.');
  const authorizationVersion = Number(record.authorization_version);
  if (!Number.isSafeInteger(authorizationVersion) || authorizationVersion <= 0 || authorizationVersion !== input.expectedAuthorizationVersion) {
    throw new Error('Announcement readback returned an invalid authorization version.');
  }
  return `Announcement ${announcementId} finalized and verified in the ActionGate log`;
}

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
