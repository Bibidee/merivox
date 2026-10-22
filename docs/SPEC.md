# Merivox V1 — Product and Protocol Specification

## Purpose

Safeguard small-group decisions against vote splitting caused by semantically equivalent alternatives. Users decide which alternative wins; GenLayer validators determine whether differently worded proposed actions should belong to the same canonical ballot choice. The contract stores ballot mapping and enforces deterministic voting.

## Intended users

Communities and small groups with recurring decisions, a known membership roster and public wallet-based participation. Not a secret-ballot election platform; each wallet is a pseudonym, not a proof of unique human identity.

## Main interpretation problem

Question for validators: *Does this candidate describe substantially the same actionable outcome, with the same material audience, deliverable, timeframe and conditions, as exactly one currently established canonical choice?*

Accept `EQUIVALENT` only when substituting one alternative for the other would not materially change what the group is approving. Shared topics or broad themes are not sufficient. Proposed deliverables and constraints matter. The output is a normalized classification (`EQUIVALENT`, `DISTINCT`, `AMBIGUOUS`) and a strictly valid canonical choice index for an equivalent result; no free text influences consensus or on-chain control.

Only on-chain frozen nomination fields are evidence. No arbitrary web fetch is necessary. Validators independently interpret the same immutable structured proposal text, which is untrusted **data**, never instructions.

### Case examples

- “Hands-on beginner session about deploying a GenLayer Intelligent Contract” versus “Introductory practical deployment tutorial for first-time builders”: potentially equivalent when timing, outcome and audience align.
- A beginner workshop versus a weekend competition: distinct despite subject overlap.
- Two suggestions that use similar language but specify incompatible delivery dates or target participants: distinct.
- Inadequately specified or mutually inconsistent objectives: ambiguous, not forced equivalent.

## Governed action extension

Merivox has two Intelligent Contracts. `Merivox` owns immutable communities, rounds, nominations, consensus classifications, ballots and the authoritative action envelope. `MerivoxActionGate` owns publisher permissions and append-only announcements. There is no application backend or administrator grant path.

- A community space has a unique immutable ID, name, founder and frozen 3–25 wallet roster. Only a frozen member may initiate a binding round.
- A binding nomination carries exact `space_id`, `action_type`, `recipient_wallet`, `permission_scope`, `expires_at` and a deterministic `action_digest`. The envelope is part of validator comparison and cannot be edited after nomination.
- Only a finalized, decided, quorum-satisfying binding round with a unique certain winner, an affirmative tally greater than half of the full frozen roster, no unresolved or ambiguous nomination, and a valid immutable envelope can become `APPROVED`; the Merivox contract then dispatches the exact envelope to ActionGate through a finalized child transaction. Result finality (`DECIDED`) never implies action authorization.
- When a validator returns `EQUIVALENT` for binding nominations, the contract independently requires exact equality of `space_id`, `action_type`, `recipient_wallet`, `permission_scope`, `expires_at` and `action_digest`. A conflict is recorded as effective `AMBIGUOUS` with the original validator judgment retained, so the nomination cannot authorize protected execution.
- ActionGate accepts permission changes only when the immediate transaction sender is its configured Merivox address and the message matches the current Merivox authorization version and digest. The original wallet is not treated as the internal caller.
- Publisher permission reads are authoritative only when the version and digest still match Merivox. Announcement publication requires an effective grant, is append-only, and is verified by a post-finality readback.
- Binding lifecycle values are `NOT_AUTHORIZED`, `APPROVED`, `DISPATCHED`, `APPLIED`, `PENDING_RECOVERY`, `SUPERSEDED` and `EXPIRED`. `APPROVED` means the finalized governance result is eligible for dispatch but has not yet been sent to ActionGate; it never means applied. Recovery is bounded by a cooldown and cannot revive an expired or superseded envelope.
- Community reads use offset/limit pages capped at 25. `list_spaces` offsets the immutable global space directory; ActionGate `list_announcements` offsets a per-community immutable index, so interleaved activity from other communities cannot shorten a page. Clients continue until a short authoritative page and never treat a short filtered global scan as end-of-data.

## Binding V1 limits

- Two Python Intelligent Contracts; no custody, admin judge, administrator grant, escrow, backend, database or server scheduler.
- 3–25 distinct eligible wallet addresses per round, roster fixed at creation; creator must be included.
- 1 nomination per eligible wallet, at most 8 per round.
- Question: 15–320 characters. Title: 8–100. Details: 30–800. Audience, delivery and timing: at most 180 characters each.
- All times are absolute chain-time comparisons, not browser-clock authority.
- Round creator chooses nomination deadline, final ballot deadline and quorum. The contract derives `alignment_close = ballot_close - 900` and requires `ballot_close > nomination_close + 3,300` seconds: 2,400 seconds for eight nominations at three bounded attempts, 60-second cooldowns and a 120-second validator grace per nomination, plus 900 seconds of voting. The frontend uses the same constants and rejects the exact boundary; chain time remains authoritative.
- One wallet gets one vote. Ballots are public; anonymous or private voting is not claimed.
- No administrator may override reconciliation, edit original submissions, rewrite votes or choose a winner.
- No administrator may grant ActionGate permission directly; deployment bootstrap only performs a one-time reciprocal contract binding.

## State machine

`NOMINATING` → `RECONCILING` → `BALLOT_READY` → `VOTING` → `DECIDED | TIED | NO_QUORUM`

Permitted exceptional states: pre-nomination `CANCELLED`; bounded `UNRESOLVED` alignment attempts (per alternative); cancelled/expired round only if deterministic rules permit and never after voting begins. Definitions and status casing must remain consistent across contract, frontend and documentation.

- `NOMINATING`: eligible wallet submissions only until deadline.
- `RECONCILING`: permissionless invocation of the next outstanding candidate; each canonical choice is frozen once created. No manual/organizer override.
- `BALLOT_READY`: each nominee has an assignment or an explicitly disclosed unresolved fallback, all choices frozen.
- `VOTING`: votes only for valid canonical choice IDs while before voting deadline.
- `DECIDED`: one highest valid tally and quorum met.
- `TIED`: highest tally shared and quorum met; do not let AI break the tie.
- `NO_QUORUM`: participation below required threshold at finalization.

## Reconciliation failure behavior

Each attempt uses a bounded prompt, bounded candidate list, normalized machine-readable comparison and independent validator reproduction. Malformed output and failed consensus are not positive decisions; preserve prior contract state and permit a safe retry. Limit retries per alternative and enforce a cooldown to prevent griefing. At alignment timeout, a still-unresolved candidate becomes its own **labelled uncertain choice**, never an asserted `DISTINCT` result. Any participant may progress a timed-out round. The frontend must show the uncertainty before members vote.

Do not silently merge a candidate with more than one plausible matching choice. Use `AMBIGUOUS` in such cases. Keep existing canonical anchors immutable even if later members submit aliases; no transitive merge by pure similarity chain.

## Round and vote integrity

Unique keys must include round ID and sender/alternative identity. Reject duplicate nominations/votes, impossible state transitions, post-ballot merges, invalid choice IDs, deadline bypasses, repeat finalization and replays. Invariants: sum of choices' votes equals recorded voter count; each nomination is assigned once; every assignment points to a valid frozen canonical choice; no aliases are deleted. Read methods must support bounded pagination.

## UX truth rules

`SIGNING`, `SUBMITTED`, `ACCEPTED`, `FINALIZED`, `VERIFIED`, `FAILED`, `UNDETERMINED` must be distinct in UI. `ACCEPTED` is provisional. `FINALIZED` means the protocol completed successfully; `VERIFIED` additionally means the expected application-state transition was read back from the contract. Publication verification must use the finalized transaction's returned announcement ID, then verify exact community, author, content, digest and authorization version; a missing or malformed ID is not success. Never mark voting, alignment, or final results complete on transaction acceptance. All illustrative graphics are labelled as examples; do not use fabricated contract addresses, votes or transactions.

## Non-goals

No treasury, asset allocations, human identity verification, voter privacy, agreement completion judgment, token layer, AI-selected winners, reputation system or automatic monitoring.
