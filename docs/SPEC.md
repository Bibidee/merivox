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

## Binding V1 limits

- One Python Intelligent Contract; no custody, admin judge, escrow, backend, database or server scheduler.
- 3–25 distinct eligible wallet addresses per round, roster fixed at creation; creator must be included.
- 1 nomination per eligible wallet, at most 8 per round.
- Question: 15–320 characters. Title: 8–100. Details: 30–800. Audience, delivery and timing: at most 180 characters each.
- All times are absolute chain-time comparisons, not browser-clock authority.
- Round creator chooses nomination deadline, final ballot deadline and quorum. An explicit deterministic alignment deadline must be derived/frozen on creation, leaving enough time to vote. **Codex must review and harden creation constraints before deployment.**
- One wallet gets one vote. Ballots are public; anonymous or private voting is not claimed.
- No administrator may override reconciliation, edit original submissions, rewrite votes or choose a winner.

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

`SIGNING`, `SUBMITTED`, `ACCEPTED`, `FINALIZED`, `FAILED`, `UNDETERMINED` must be distinct in UI. Never mark voting, alignment, or final results complete on transaction acceptance. After finalization read the contract again and verify the expected transition. All illustrative graphics are labelled as examples; do not use fabricated contract addresses, votes or transactions.

## Non-goals

No treasury, asset allocations, human identity verification, voter privacy, agreement completion judgment, token layer, AI-selected winners, reputation system or automatic monitoring.
