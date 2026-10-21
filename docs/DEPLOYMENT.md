# Merivox V1 — deployment and verification ledger

This is the factual release ledger for the corrected two-contract implementation. Earlier one-contract and superseded-pair evidence remains historical and is not used as current proof.

## Current release

- Network: GenLayer Studionet, chain `61999`
- RPC: `https://studio.genlayer.com/api`
- Repository-local CLI: `genlayer@0.39.1`
- Implementation commit: `38a2a8d84d7df26edafa5143ed4cf48268f0f1e3`
- Merivox: `0xe201A351b898D15eF8ACDfFF22f62aFabC834C3C`
- ActionGate: `0x263c5bAE66CcFcc04bA3546C3fa191F573C5D46b`
- Merivox source SHA-256: `E4FEAA9896140A283A3B7A2A349BCB4D675A4F0C1540A6B129B832EC67EA7645`
- ActionGate source SHA-256: `A047D22FBD568B29ABBB949417FDBCFBD86DBC645D6D37EB9B16E2F0CD26A652`
- Production frontend: [https://merivox.vercel.app](https://merivox.vercel.app)
- Vercel deployment: `dpl_HguQZeewPHpU7EarDNQLaSS6NjnQ`, `READY`, production alias verified

Deployment transactions, complete grant/revoke lifecycle hashes, parent-child receipts and canonical readbacks are recorded in [`LIVE_EVIDENCE.md`](LIVE_EVIDENCE.md).

## Verification result

The corrected live release now demonstrates:

- immutable community and frozen roster;
- two validator-backed binding rounds with `DISTINCT` and `EQUIVALENT` classifications;
- finalized grant delivery through `emit(on='finalized')` and ActionGate application;
- unauthorized publication rejection and authorized append-only publication;
- finalized revoke delivery through a separate child transaction;
- ActionGate `effective=false`, `reason=REVOKED`, and finalized rejection of the formerly authorized publisher;
- production browser readback of the Merivox Decision Studio, Choice Map, community workspace and governed action outcome.

The live grant and revoke rounds each reached `DECIDED` with three votes and a three-wallet quorum. The compatible-runtime suite additionally covers duplicate delivery, recovery and stale authorization replay; those paths are not mislabeled as live receipts.

## CI and tooling disclosure

Local frontend checks, Direct Mode contract tests and the cross-contract suite pass. The pinned repository toolchain contains no separate `genvm-lint` executable, so the release uses Direct Mode execution, AST/static checks, contract schema inspection and live finalized receipt/readback verification instead. The final GitHub Actions run will be added after the evidence commit is pushed and the default branch is aligned.

## Historical releases

The original one-contract deployment and the earlier incorrect ActionGate pair are superseded. Their addresses and transactions remain in Git history only; no migration or source parity is claimed for them. The corrected pair above is the only current release target.
