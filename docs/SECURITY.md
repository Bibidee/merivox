# Merivox threat model

This document defines the security invariants and audit scope for the deployed V1. The contract and frontend were checked against these invariants with the pinned Direct Mode suite and live Studionet readback.

## Assets and trust

Canonical assets are ballot composition integrity and immutable group choice history, not money. The contract is the sole authority on rosters, nominations, equivalence mappings, votes, quorum, deadlines and outcomes. User-supplied proposal language may be adversarial. Validators have independent execution, but semantic convergence is not guaranteed.

## Must-defend invariants

1. No wallet not in a frozen roster may nominate or vote.
2. No wallet nominates or votes twice per round.
3. Once frozen, canonical choices, IDs, anchors, aliases and group assignments cannot change.
4. Materially ambiguous classification cannot be silently presented as confirmed equivalence.
5. Malformed model output and failed validator consensus do not create a classification.
6. Invalid or repeated write calls cannot progress the state incorrectly.
7. The organizer cannot manipulate the roster, quorum or choices after round creation.
8. No one can finalize early, vote late, vote for a nonexistent option, or finalize twice.
9. Tally conservation: sum of recorded votes equals count of distinct eligible votes.
10. Read-only clients must never treat ACCEPTED as finalized execution; the UI distinguishes FINALIZED from VERIFIED application state.
11. No private keys, signing seeds or backend authority are introduced.
12. A wallet cannot call ActionGate's permission mutation as if it were Merivox; immediate caller authentication is enforced in the gate.
13. A stale, replayed, duplicate or superseded authorization cannot overwrite the current publisher permission.
14. An announcement is append-only, bounded, and publishable only while the canonical grant version remains effective.
15. Merivox and ActionGate are reciprocally bound once at deployment; no later admin rebinding exists.

## Adversarial cases

- Prompt injection embedded in title or details.
- Same topic but differing material deliverable.
- A title designed to match two unrelated choices.
- Similarity transitivity (A resembles B, B resembles C, but A and C differ).
- Unexpected JSON keys, malformed schema, oversized model text.
- Timing boundary abuse, replayed transaction, concurrent reconciliation.
- Wrong wallet, wrong chain, signature rejection.
- Validator divergence or no consensus, expiry without anyone operating a keeper.
- Source/frontend contract ABI mismatch.
- RPC data unavailable while the frontend is refreshing.
- Duplicate questions and concurrent creators must resolve through the canonical transaction return value, never a question-text search.
- A public round directory must paginate until the contract returns a short page; it must not silently stop at 25 records.
- Forged child messages, origin/sender confusion, stale grant replay, expiry-boundary abuse and ActionGate-to-Merivox binding mismatch.

## Known risk

One wallet does not equal one person. Rosters are public and wallet-voting is not a private election. This V1 should be used for consenting small groups, not high-stakes government or shareholder elections.
