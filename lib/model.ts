export type RoundStatus =
  | 'NOMINATING'
  | 'RECONCILING'
  | 'BALLOT_READY'
  | 'VOTING'
  | 'DECIDED'
  | 'TIED'
  | 'NO_QUORUM'
  | 'CANCELLED';

export type Judgment = 'EQUIVALENT' | 'DISTINCT' | 'AMBIGUOUS' | 'UNRESOLVED' | 'UNREVIEWED';
export type TxPhase = 'IDLE' | 'SIGNING' | 'SUBMITTED' | 'ACCEPTED' | 'FINALIZED' | 'FAILED' | 'UNDETERMINED';

export interface Round {
  id: string;
  creator: string;
  question: string;
  status: RoundStatus;
  members: string[];
  member_count: number;
  quorum: number;
  nomination_close: number;
  alignment_close: number;
  ballot_close: number;
  created_at: number;
  ballot_opened_at: number;
  finalized_at: number;
  nomination_ids: string[];
  choice_ids: string[];
  tie_choice_ids: string[];
  alignment_cursor: number;
  voter_count: number;
  nomination_count: number;
  choice_count: number;
  last_alignment_at: number;
  last_judgment: Judgment | string;
  winner_choice_id: string;
  result_reason: string;
}

export interface Nomination {
  id: string;
  round_id: string;
  author: string;
  title: string;
  details: string;
  audience: string;
  delivery: string;
  timing: string;
  choice_id: string;
  judgment: Judgment;
  attempts: number;
  last_attempt_at: number;
  last_error: string;
  created_at: number;
}

export interface Choice {
  id: string;
  round_id: string;
  anchor_nomination_id: string;
  anchor_title: string;
  anchor_details: string;
  anchor_audience: string;
  anchor_delivery: string;
  anchor_timing: string;
  nomination_ids: string[];
  votes: number;
  uncertain: boolean;
  created_at: number;
}

export interface AlignmentState {
  status: RoundStatus;
  cursor: number;
  total: number;
  pending_id: string;
  alignment_close: number;
  last_alignment_at: number;
  last_judgment: string;
}

export interface MemberStatus {
  eligible: boolean;
  nominated: boolean;
  voted: boolean;
  choice_id: string;
}

export interface TallyItem {
  choice_id: string;
  votes: number;
  nomination_ids: string[];
}

export interface Tally {
  items: TallyItem[];
  voter_count: number;
  quorum: number;
}

export interface Result {
  finalized: boolean;
  status: RoundStatus;
  winner_choice_id?: string;
  tie_choice_ids?: string[];
  voter_count?: number;
  quorum?: number;
  finalized_at?: number;
  reason?: string;
}

export interface ChainPage<T> {
  items: T[];
  next: number;
  total: number;
}

export type Transaction = { hash: string; label: string; phase: TxPhase; detail?: string; at: number };

const STATUSES: RoundStatus[] = ['NOMINATING', 'RECONCILING', 'BALLOT_READY', 'VOTING', 'DECIDED', 'TIED', 'NO_QUORUM', 'CANCELLED'];

export function normalizeStatus(value: unknown): RoundStatus {
  return typeof value === 'string' && STATUSES.includes(value as RoundStatus) ? value as RoundStatus : 'NOMINATING';
}

export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function shortAddress(value: string) {
  return value && value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value || 'Not connected';
}

export function remaining(end: number, now: number) {
  const delta = end - now;
  if (delta <= 0) return 'Deadline reached';
  const days = Math.floor(delta / 86400);
  const hours = Math.floor((delta % 86400) / 3600);
  return days ? `${days}d ${hours}h remaining` : `${hours}h ${Math.floor((delta % 3600) / 60)}m remaining`;
}

export function isWallet(value: string) { return /^0x[0-9a-fA-F]{40}$/.test(value); }

export function validateQuestion(question: string) {
  const value = question.trim();
  return value.length < 15 || value.length > 320 ? 'Question must have 15–320 characters.' : null;
}

export function validateNomination(title: string, details: string) {
  if (title.trim().length < 8 || title.trim().length > 100) return 'Title must have 8–100 characters.';
  if (details.trim().length < 30 || details.trim().length > 800) return 'Details must have 30–800 characters.';
  return null;
}
