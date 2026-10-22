# Merivox V1 — Final Pre-Submission Release — deployment and verification ledger

This ledger describes the corrected immutable contract pair, the Vercel production deployment, and the live Studionet lifecycle evidence. The earlier development pair is retained only as historical context; the release is merged into `main` and production-ready, but Merivox has not been submitted externally.

## Current release target

- Network: GenLayer Studionet, chain `61999`
- RPC: `https://studio.genlayer.com/api`
- Repository-local CLI: `genlayer@0.39.1`
- Default branch: `main`
- Contract implementation commit: `541b8b797226da1e5d6bca85a0435a7d156ef8bd`
- Production implementation commit: `778489c93f3c9269b21e53c9ad7204b2706faf37`
- Current documentation head: `6b2d856b89d9fd9a4d54c53598c957bb8e45f955`
- Frontend hardening commit: `dfd9640ff2501e05571d1d7fd58f4120543d83c0`
- Merivox: `0xB81D80f2661a78a0742B190fE44f15149156a6DF`
- ActionGate: `0x5DE12E4E0a80A621Af8Cb4c453FaE569df857206`
- Merivox source SHA-256: `98C1A343C29C600F1BC44B8B0B48BCBCD10648EDB6DFE4F6782CAA715AADC4CE`
- ActionGate source SHA-256: `E9B7E904624C4860F1BCCD0F72FC2D96794B617E33E91F73204576AEF2ADA305`
- Production frontend: [https://merivox.vercel.app](https://merivox.vercel.app)
- Current deployment: `dpl_GGxgQhpHFWXY9k1HUCz1Ve3sUwyf`, [inspect](https://vercel.com/bibidees-projects/merivox/GGxgQhpHFWXY9k1HUCz1Ve3sUwyf), `READY`

Deployment and lifecycle receipts are recorded in [`LIVE_EVIDENCE.md`](LIVE_EVIDENCE.md).

## Deployment and bootstrap verification

Both contracts were deployed with the repository-local CLI and explicit receipts reached `FINALIZED` with `MAJORITY_AGREE`. The reciprocal bootstrap binding transaction also reached `FINALIZED`; canonical reads report the ActionGate address from Merivox, the Merivox address from ActionGate, `configured=true` and `bootstrap_closed=true`.

## Vercel verification

The Vercel project `bibidees-projects/merivox` is deployed to the production alias as `dpl_GGxgQhpHFWXY9k1HUCz1Ve3sUwyf` and is `READY`. Vercel metadata identifies the production implementation commit as `778489c93f3c9269b21e53c9ad7204b2706faf37`; the later `6b2d856b89d9fd9a4d54c53598c957bb8e45f955` commit is documentation-only and does not change the shipped frontend. The post-hardening outcome route reads the corrected chain state at 375px. No application backend was introduced; the frontend reads the Intelligent Contracts directly.

## Verification status

The live grant lifecycle is complete through `APPLIED` and authorized publication. The live revoke lifecycle is complete through validator-backed `DISTINCT` and `EQUIVALENT` alignment, three finalized votes, deadline-gated finalization, finalized parent/child delivery, `APPLIED`/`REVOKED` readback, rejected post-revoke publication and stale grant supersession. The exact receipts and canonical reads are in [`LIVE_EVIDENCE.md`](LIVE_EVIDENCE.md).

Local verification includes the frontend test suite, lint, typecheck, production build, Python contract suite under the compatible Python runtime, static checks and the repository preflight. GitHub Actions is the authoritative remote CI record; main-branch [CI #43](https://github.com/Bibidee/merivox/actions/runs/39777522684) passed both frontend and contract jobs. Computer Use verified the required production routes at 375px, 390px, 768px and 1440px with no horizontal overflow; one transient RPC read error recovered on isolated retry. Rejected-wallet-signature remains a disclosed unexercised live UI path.

## Historical deployment

The superseded development pair was Merivox `0xe201A351b898D15eF8ACDfFF22f62aFabC834C3C` and ActionGate `0x263c5bAE66CcFcc04bA3546C3fa191F573C5D46b`. It is not the current frontend configuration or release target. Its known limitations are documented only for audit traceability.
