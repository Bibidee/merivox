# Merivox V1 — deployment and verification ledger

This file separates the superseded production evidence from the remediation release. A transaction hash or browser observation is evidence only for the source and deployment it actually belongs to.

## Release status

Verdict: `READY WITH DISCLOSED LIMITATIONS`.

The remediation branch `remediation/merivox-v1-submission` is deployed to Studionet and Vercel production. Contract source parity, the complete live lifecycle, the production browser read path and both CI jobs are verified. No new live transaction was submitted during browser verification because round 3 is already terminal.

Preview deployment evidence:

- Vercel deployment: `dpl_BrpNWvP6msdN7aKz2diQj4tvJnDw`
- Preview URL: [merivox-509yp33qw-bibidees-projects.vercel.app](https://merivox-509yp33qw-bibidees-projects.vercel.app)
- Vercel state: `READY`
- Read-only route checks: `/`, `/new/`, `/activity/`, `/method/` returned HTTP 200 and contained Merivox content.
- The preview was an intermediate build before the final production address was configured.

## Current remediation production release

- Contract: `0x3810f4dF37c5B1C2B5d3C1d6d6a86A40c1171CE5`
- Deployment transaction: [`0x51509ec31a1d52cf13fa3b44fe8031e9d3ff7f84f90aa38a6167285a686f3f97`](https://explorer-studio.genlayer.com/tx/0x51509ec31a1d52cf13fa3b44fe8031e9d3ff7f84f90aa38a6167285a686f3f97)
- Deployment status: `FINALIZED`, result `MAJORITY_AGREE`, five validator receipts observed
- Deployed source SHA-256: `F6B13D6E78442329BAE13C216B62CC9ADF28649AB5F9E832E725E371D6548CC5`
- Local source SHA-256: `F6B13D6E78442329BAE13C216B62CC9ADF28649AB5F9E832E725E371D6548CC5`
- Source comparison: exact byte-for-byte match, 31,660 bytes
- Matching Git commit: `c3dcfcffed93896caf3aaf1e925bb75e8cc1ea43`
- Vercel production deployment: `dpl_7u7jhytKWus4m3hWu7Av1Gi57y8h`, `READY`
- Production alias: [merivox.vercel.app](https://merivox.vercel.app)
- Production environment `NEXT_PUBLIC_MERIVOX_CONTRACT`: updated to the current contract address before deployment
- Read-only production route checks: `/`, `/new/`, `/activity/`, `/method/` returned HTTP 200

### Fresh live lifecycle evidence (repository-local CLI, Studionet 61999)

The following evidence was produced against the remediation contract with the unlocked repository-local GenLayer CLI `0.39.1`; no private key was read or exported.

- Fresh lifecycle round: `3`
- Create-round transaction: `0xdb47135771168504a65676d98fe3f27fb64177bd66d8f71e71ba617703efa198` — finalized `MAJORITY_AGREE`, five validator receipts
- Four distinct unlocked member accounts submitted nominations; nomination transactions finalized with `MAJORITY_AGREE`:
  - `0x1071ba474a4eadf8aede148b879713de67bc6eca918b64106122b5c25698f2ac`
  - `0x11aa4420e364dbf6c4131312670d735ebfa7958d24ac0167dbaea3ed1efcd50f`
  - `0xbe0cb57f1891564767466f0d2fe26f3826a6295a1e35ee9ef098035f44879ba2`
  - `0x6f0d38069ad00894eb2115ae3d0312b4b6f8dd8642221840566719a1b97cc031`
- Alignment start: `0xd8bb39186060d912227515ff2039e45199d1d341f0c2bac5a70c41a3746d4353`
- Finalized validator-backed classifications:
  - `0x8867b29aa61db05ac51c2b1de75ef8105da407cd431fbdb8403b0c5479928d56` — `EQUIVALENT`, merged into choice `1`
  - `0x83ec8c61d48fbddeff1420308f23ab756ffdb76fe8746101730e6bc7eef5f9cc` — `DISTINCT`
  - `0x0777ae54a19b6eff5fefff5c993242cab3c6fc5ce736dcda4eb009df6516ac0f` — `AMBIGUOUS`; the submitted text included a prompt-injection attempt and was stored as an uncertain choice
- Ballot opening: `0x0a7b9260cf374c8c69a7ca0320b8cbd1bf9408fa3be463388f0b4846af1e63a8`
- Four finalized votes produced a live tally of choice `1: 2`, choice `2: 1`, choice `3: 1`; `voter_count: 4`, `quorum: 1`.
- Finalization transaction: `0x0947e360e74b4acb79473279913abab59f7a46d809eaae1d956bbabab715a566` — finalized `MAJORITY_AGREE`, five validator receipts, leader return `DECIDED`.
- Final readback: `DECIDED`, winner choice `1`, reason `UNIQUE_HIGHEST_TALLY`, `finalized: true`, `voter_count: 4`.

### CI verification

- Fix commit: `ece81bff464a23c4f0b3430ac9cf96193e154b7e`
- Workflow run: [Merivox CI #14](https://github.com/Bibidee/merivox/actions/runs/39574133617)
- Contract job: `success`; Direct Mode static and contract suite `9 passed`
- Frontend job: `success`; `npm run preflight` passed
- The failed artifact lookup was corrected by pinning `genlayer-py==0.19.0rc2`, `genlayer-test==0.30.0rc2` and the official GenVM manager runner `v0.6.0-rc3`. The Direct Mode compatibility adapter preserves storage-backed contracts, calldata, sender changes and validator replay under that runner.

### Production browser verification

Computer Use verification was performed against [merivox.vercel.app](https://merivox.vercel.app) on Studionet 61999:

- `/`, `/new`, `/activity`, `/method`, `/round?id=3`, `/align?id=3`, `/ballot?id=3` and `/outcome?id=3` loaded the Merivox experience and contract-backed content.
- The new-round flow accepted a decision question and continued to the roster step without submitting a transaction.
- Activity search and the `Finalized` filter narrowed the live directory correctly to round 3.
- Round 3 showed 4 eligible wallets, 4 alternatives, 3 choices, 4 votes and `DECIDED` status.
- The Choice Map showed the live `EQUIVALENT`, `DISTINCT` and uncertain `AMBIGUOUS` classifications, including the adversarial nomination as uncertain data.
- Ballot readback showed the live `2 / 1 / 1` tally and completion state; outcome readback showed winner choice 1 and `UNIQUE HIGHEST TALLY`.
- A transient RPC `Failed to fetch` state appeared on initial ballot/outcome reads; the visible Retry action followed by a short wait recovered both pages without a code change.
- Wallet UI behavior verified: connected state, disconnect, reconnect, wrong-network warning, and switching to Studionet 61999. No private key was read or exported.

## Binding network and tooling

- Network: GenLayer Studionet, chain `61999` (`0xf22f`)
- RPC: `https://studio.genlayer.com/api`
- Official explorer: `https://explorer-studio.genlayer.com`
- Repository-local CLI: `genlayer 0.39.1`
- Contract architecture: one Python Intelligent Contract, direct browser reads/writes, injected EIP-1193 wallet, no application backend

## Historical production release — superseded

- Contract: `0xA026BA6f6588186b9F07625b3e355FF7Afbd25a2`
- Deployment transaction: `0x815f868ac3ef34be0ac4d6699c8370f2e4a9c090985133f43d3f4fa8416c3bec`
- Deployed source SHA-256: `1E1B061858A7897867972600EF9306E1F81D6A0CB3E68001957C98D12C2378DB`
- Corresponding source commit: `09f610c878d34db2eb19e86ce2d40f492ab33f94`
- Historical production URL: [merivox.vercel.app](https://merivox.vercel.app)
- Historical Vercel deployment: `dpl_FvFu38xRfAi2QcXsCHDVghak8YNY`
- Historical live round: round `1`, four nominations, four canonical choices, two votes, finalized `TIED` with quorum `2`
- Historical alignment evidence: one automatic first-anchor `DISTINCT`; later validator transactions returned `RETRY_REQUIRED` and the round ultimately used explicit `UNRESOLVED` timeout fallbacks. This is not evidence of live `EQUIVALENT` or `AMBIGUOUS` classification.
- Historical finalization transaction: `0x936cd526a91c870f1ebb4e1d5d3c241b622790b228b44e3c9653889e5f0da128`

The historical round remains valuable negative evidence: the chain receipts show real validator participation and validator disagreement around unavailable results, while the contract preserved uncertainty instead of asserting a merge. It does not satisfy the remediation requirement for genuine live `EQUIVALENT`, `DISTINCT` and `AMBIGUOUS` classifications.

## Remediation branch evidence

- Branch: `remediation/merivox-v1-submission`
- Contract source SHA-256 at the current branch state: `F6B13D6E78442329BAE13C216B62CC9ADF28649AB5F9E832E725E371D6548CC5`
- Contract timing rule: `ballot_close > nomination_close + 3,300` seconds; alignment reserves 2,400 seconds for eight alternatives at three bounded attempts, cooldowns and validator grace, and voting reserves 900 seconds.
- Contract boundary coverage: exact-boundary rejection and one-second-after acceptance in Direct Mode.
- Prompt hardening: participant fields are serialized as delimited JSON data; commands, links, role claims and reasoning requests inside data are explicitly untrusted; output is exact-key normalized.
- Lifecycle hardening: `SIGNING → SUBMITTED → ACCEPTED → FINALIZED → VERIFIED`; finality is not reported as application success until expected contract state is read back.
- Round identification: creation uses the finalized transaction return value and reads that exact round ID; it never searches by question text.
- Public directory: reads every `list_rounds` page until a short page instead of silently stopping at 25.
- Automated suites run locally: TypeScript tests, lint, typecheck, build, static contract checks and Direct Mode contract tests.
- GitHub Actions workflow: `.github/workflows/ci.yml` runs frontend preflight and pinned Direct Mode tests on pushes and pull requests.

## Honest limitations

- The historical deployment is not source-parity evidence for the remediation branch.
- A browser wallet signature is a human approval step and cannot be completed without the user’s wallet.
- Account switching, rejected-signature behavior, refresh/recovery during an in-flight transaction, duplicate-submission prevention during an in-flight transaction, and mobile viewport behavior were not exercised in this pass. They remain disclosed browser-coverage limitations; no live write was repeated solely to manufacture those states.
- The browser’s first ballot/outcome read can show a transient RPC fetch error on the hosted Studionet endpoint; the tested Retry flow recovered the pages.
- The repository-local CLI has no separate `genvm-lint` command; Direct Mode, AST parsing and live receipt/trace evidence are the available validation layers.
