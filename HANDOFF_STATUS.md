# MERIVOX V1 — completion handoff

The original handoff implementation has been completed, hardened and deployed. [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) is the detailed evidence ledger.

## Current verified state

- Premium Decision Studio frontend preserves Merivox identity and Choice Map semantics.
- Direct, backendless contract reads and injected-wallet writes run on Studionet `61999`.
- Immutable nominations, validator reconciliation, conservative unresolved fallback, frozen canonical ballot, one-wallet-one-vote tallying, quorum, tie and no-quorum outcomes are implemented.
- Production deployment: [merivox.vercel.app](https://merivox.vercel.app).
- Pinned Direct Mode suite: 8 passed. Live round `1`: four nominations, two public votes and a finalized tie.
- A real injected wallet was not available in the browser test environment; signing a new round remains a human action.

## Historical starter inventory (superseded)

- Original premium landing page, responsive Choice Map and visual style.
- Guided decision-round creation form, roster validation and unsigned preview.
- Round workspace with contract reads, nomination submission and transition request.
- Public activity list and transparent method page.
- Dedicated alignment, ballot and outcome pages **visibly gated until implemented**, no fake live data.
- Injected-wallet integration starter and transaction status dock.
- Python contract starter with immutable round, roster and bounded nomination storage.
- Configuration fixed to Studionet 61999 and repository-local CLI 0.39.1.
- Source/spec/security/deployment documentation and complete Codex build prompt.

## Historical checks run during handoff creation

- `node scripts/network-check.mjs`: passed.
- `node --experimental-strip-types --test tests/*.test.ts`: 6 passed.
- `python -m pytest -q tests/test_contract_static.py`: 2 passed.
- `python -m compileall -q contracts`: passed.
- Case-insensitive scan for unrelated project names in all authored source/docs: zero hits.

## Historical items not run during handoff creation

- `npm install`, because the npm registry could not be resolved from the handoff runtime.
- `npm run typecheck`, `npm run lint`, `npm run build` (frontend dependencies unavailable here).
- GenLayer Direct Mode, GenVM lint, any consensus or wallet integration test.
- Contract deployment, Vercel deployment, hosted browser tests or live outcomes.

## Historical missing-work list (superseded)

GenLayer semantic reconciliation and validator reproduction; ballot freezing; voting; tie and quorum finalization; retry/fail-safe handling; finality decoding and state-readback hardening; comprehensive tests; final deployment and source parity verification.

The current verified deployment and limitations are recorded above and in `docs/DEPLOYMENT.md`.
