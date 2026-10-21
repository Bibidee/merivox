# Merivox V1 — deployment and verification ledger

This file separates the superseded production evidence from the remediation release. A transaction hash or browser observation is evidence only for the source and deployment it actually belongs to.

## Release status

The remediation branch `remediation/merivox-v1-submission` contains contract and frontend changes that require a new contract deployment. A Vercel preview has been built successfully from the committed branch, but production remains the historical release below until the new contract is finalized and source parity is verified. The release is not called READY on source-only evidence.

Preview deployment evidence:

- Vercel deployment: `dpl_7hyLi1HjufbzfoRP1rkTAgJi9vxN`
- Preview URL: [merivox-4bgth3hn1-bibidees-projects.vercel.app](https://merivox-4bgth3hn1-bibidees-projects.vercel.app)
- Vercel state: `READY`
- Read-only route checks: `/`, `/new/`, `/activity/`, `/method/` returned HTTP 200 and contained Merivox content.
- This preview still uses the historical contract environment value; it is not production source-parity evidence for the remediation contract.

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

## Required release gates before a READY verdict

1. Deploy this exact contract source through the wallet flow and record a new finalized Studionet deployment transaction and address.
2. Update the Vercel production environment to that address and deploy this exact branch; verify Vercel READY status and production source parity.
3. Create a fresh round through the production browser. The creator must approve each wallet transaction; no private key is accessed by the agent.
4. Exercise live validator-backed alignment and record finalized receipts with genuine `EQUIVALENT`, `DISTINCT` and `AMBIGUOUS` classifications, including independent validator agreement/reproduction and prompt-injection data.
5. Finish ballot opening, one-wallet voting, finalization and canonical result readback. Record transaction hashes and the final contract state.
6. Run browser route, refresh, wrong-chain, rejected-signature, keyboard and mobile checks against the deployed release.

## Honest limitations

- The historical deployment is not source-parity evidence for the remediation branch.
- A browser wallet signature is a human approval step and cannot be completed without the user’s wallet.
- The repository-local CLI has no separate `genvm-lint` command; Direct Mode, AST parsing and live receipt/trace evidence are the available validation layers.
