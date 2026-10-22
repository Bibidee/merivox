# Merivox security model and pre-submission final audit

This document covers both the historical development deployment and the proposed final-readiness branch. The deployed addresses and finalized transactions remain historical evidence; final-readiness changes are not live.

## Remediation findings and disposition

| Severity | Finding | Remediation | Historical deployment impact |
|---|---|---|---|
| High | `finalize()` marked every unique binding winner `APPROVED` before checking quorum, full-roster affirmative majority, certainty, resolution and envelope validity | Shared deterministic eligibility predicate now drives both approval state and dispatch; result finality remains separate from action authorization | Dispatch already failed closed, but the deployed state/UI could mislabel an ineligible round |
| Medium | Binding `EQUIVALENT` could merge incompatible typed action envelopes | Exact `space_id`, action type, recipient, scope, expiry and digest comparison; conflict becomes conservative `AMBIGUOUS` while recording validator provenance | Existing deployed source requires replacement to enforce this on-chain |
| Medium | Spaces and announcements were limited to first-page reads; ActionGate filtered after global pagination | Complete space pages, per-community bounded announcement index, consistent offset/limit semantics and exact-ID publication readback | Existing deployed frontend/source retain the older omission and false-match risks |
| Tooling | Fresh audit found runtime advisories in Next 16.3.2 and tsx/esbuild | Upgraded Next and eslint-config-next to 16.4.2 and tsx to 4.23.15; production audit is now zero | Historical Vercel deployment remains on its older dependency set until an approved frontend deploy |

The remediation deliberately does not replace GenLayer `0.39.1`. Its remaining full-tree advisories are dev-only and are listed below with their root package and exploitability assessment.

## Dependency audit (exact remediation lockfile)

Fresh `npm audit --json` after the safe updates reports 11 dev-tree findings: 5 high, 2 critical and 4 moderate; `npm audit --omit=dev --json` reports zero. The high findings are the `eslint-config-next@16.4.2` → `@next/eslint-plugin-next` → `fast-glob`/`micromatch`/`braces` chain (`GHSA-vfj7-8cjw-p6xm`), used only by lint tooling and not shipped in the static production bundle. The two critical findings are the GenLayer 0.39.1 bundled Vitest/tinypool path (`GHSA-5gmw-xhrv-c9v3`, `GHSA-85c8-ppgw-ccpr`); they affect local test/CLI tooling, not browser runtime or Vercel output. Moderate findings are the same GenLayer Vitest path (`GHSA-82fw-gwwq-j7x9`, `GHSA-qxg6-89mg-rqv8`) and its `dockerode`/nested `uuid` dependency (`GHSA-w5hq-g745-h8pq`).

The registry's suggested replacement for the GenLayer finding is an incompatible `genlayer` major/version change, so it was not applied. No `npm audit fix --force` was used. The remaining risk is confined to trusted developer/CI execution; do not run the CLI or test runner on untrusted project code without the normal CI isolation controls. Re-audit is required before any remediation deployment.

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
