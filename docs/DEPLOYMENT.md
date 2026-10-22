# Merivox V1 — deployment and verification ledger

This ledger separates the historical development deployment from the final V1 release candidate. Earlier one-contract and superseded-pair evidence remains historical and is not used as current proof. No final-readiness contract or frontend was deployed during this audit.

## Historical development deployment

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

## Final-readiness release candidate

- Branch: `remediation/post-submission-security-remediation` (legacy branch name retained for PR history)
- Governance/pagination/publication code commit: `7a6e1b2b06fc8183cd44cd2ae7b6ef0aeb849f32`
- Dependency patch commit: `e57dbeaa37e7d5a25e44d91cb604cde30c3379c5`
- Status: local tests and production build pass; not deployed, not merged, no production configuration changed
- Proposed Merivox SHA-256: `8AA20FFB54103B2F467CC6C0CC71C80BE1DAA52243881F9020FA690BFD5402D1`
- Proposed ActionGate SHA-256: `E9B7E904624C4860F1BCCD0F72FC2D96794B617E33E91F73204576AEF2ADA305`

A new compatible Merivox/ActionGate pair is required to correct the on-chain `action_status` semantics and add the per-space announcement index. Existing production state is not rewritten.

## Historical deployment verification result

The historical live release demonstrates:

- immutable community and frozen roster;
- two validator-backed binding rounds with `DISTINCT` and `EQUIVALENT` classifications;
- finalized grant delivery through `emit(on='finalized')` and ActionGate application;
- unauthorized publication rejection and authorized append-only publication;
- finalized revoke delivery through a separate child transaction;
- ActionGate `effective=false`, `reason=REVOKED`, and finalized rejection of the formerly authorized publisher;
- production browser readback of the Merivox Decision Studio, Choice Map, community workspace and governed action outcome.

The historical contract pair remains safe against unauthorized ActionGate dispatch because `dispatch_binding()` already rechecks quorum, majority, certainty, envelope integrity and grant expiry. However, the deployed source can expose `APPROVED` for a unique binding tally that does not satisfy those dispatch conditions, and its deployed frontend still has the older limited-page publication verification. These are disclosed pre-submission release-candidate limitations; the final-readiness branch corrects them but is not live.

The live grant and revoke rounds each reached `DECIDED` with three votes and a three-wallet quorum. The compatible-runtime suite additionally covers duplicate delivery, recovery and stale authorization replay; those paths are not mislabeled as live receipts.

## CI and tooling disclosure

Local frontend checks, Direct Mode contract tests and the cross-contract suite pass. [Historical CI #21](https://github.com/Bibidee/merivox/actions/runs/39670892329) passed on default-branch commit `22a7c2a4c268955185d4cee57c767ca90c963091`; final-readiness CI is recorded on PR #2 and must be rerun after this branch update. The pinned repository toolchain contains no separate `genvm-lint` executable, so verification uses Direct Mode execution, AST/static checks, contract schema inspection and live finalized receipt/readback verification instead.

## Remediation deployment decision

The final-readiness candidate should not be deployed as an in-place mutation: Intelligent Contracts are immutable and the existing pair contains historical communities, decisions and publisher versions. If approved, deploy a new mutually bound pair, verify reciprocal bootstrap binding, recreate or explicitly migrate only the desired community state under a documented policy, and update Vercel addresses only after source-parity and lifecycle verification. No deployment or wallet transaction was initiated for this audit.

## Historical releases

The original one-contract deployment and the earlier incorrect ActionGate pair are superseded. Their addresses and transactions remain in Git history only; no migration or source parity is claimed for them. The corrected pair above is the only current live release target; the remediation pair is proposed only.
