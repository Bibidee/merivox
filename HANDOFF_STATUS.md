# MERIVOX V1 — starter handoff inventory

The archive is a deliberately partial implementation. The existing source and the complete Codex task live together in this ZIP.

## Authored foundation

- Original premium landing page, responsive Choice Map and visual style.
- Guided decision-round creation form, roster validation and unsigned preview.
- Round workspace with contract reads, nomination submission and transition request.
- Public activity list and transparent method page.
- Dedicated alignment, ballot and outcome pages **visibly gated until implemented**, no fake live data.
- Injected-wallet integration starter and transaction status dock.
- Python contract starter with immutable round, roster and bounded nomination storage.
- Configuration fixed to Studionet 61999 and repository-local CLI 0.39.1.
- Source/spec/security/deployment documentation and complete Codex build prompt.

## Checks actually run during handoff creation

- `node scripts/network-check.mjs`: passed.
- `node --experimental-strip-types --test tests/*.test.ts`: 6 passed.
- `python -m pytest -q tests/test_contract_static.py`: 2 passed.
- `python -m compileall -q contracts`: passed.
- Case-insensitive scan for unrelated project names in all authored source/docs: zero hits.

## Not run or verified

- `npm install`, because the npm registry could not be resolved from the handoff runtime.
- `npm run typecheck`, `npm run lint`, `npm run build` (frontend dependencies unavailable here).
- GenLayer Direct Mode, GenVM lint, any consensus or wallet integration test.
- Contract deployment, Vercel deployment, hosted browser tests or live outcomes.

## Important known missing work

GenLayer semantic reconciliation and validator reproduction; ballot freezing; voting; tie and quorum finalization; retry/fail-safe handling; finality decoding and state-readback hardening; comprehensive tests; final deployment and source parity verification.

The project must not be submitted or used as a live protocol in its present state.
