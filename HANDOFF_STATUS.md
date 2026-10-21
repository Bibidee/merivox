# MERIVOX V1 — remediation handoff

This branch is the remediation release candidate. [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) separates historical production evidence from the release gates still required for this source.

## Current verified state

- Premium Decision Studio frontend and Choice Map identity are preserved.
- This branch adds a contract/frontend reconciliation window, prompt/data hardening, canonical round-return handling, verified application readback and complete activity pagination.
- Local TypeScript tests, lint, typecheck, build, static checks and Direct Mode tests pass after the remediation changes.
- The committed branch is pushed to GitHub and tracked by [draft PR #1](https://github.com/Bibidee/merivox/pull/1); the current Vercel production deployment is READY and its route smoke checks pass.
- The remediation contract is finalized on Studionet with byte-for-byte source parity; deployment details are in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
- A fresh browser lifecycle with live `EQUIVALENT`, `DISTINCT` and `AMBIGUOUS` evidence remains required before a READY verdict; no private key is accessed by the agent.

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
