# Merivox — deployment evidence

This ledger contains observed repository, contract, production and browser evidence. Values below are recorded from the actual build and Studionet reads; unavailable explorer data is explicitly marked.

## Preflight

- [x] Repository-local `npx genlayer --version` reports `0.39.1`
- [x] `npm run preflight` PASS: network check, typecheck, lint, frontend tests and build
- [x] Pinned Direct Mode suite PASS: `8 passed` with `genlayer-py==0.16.3`, `genlayer-test==0.29.2`
- [x] Network/static audit found Studionet `61999` and no application backend or tracked secret
- [ ] Separate `genvm-lint` executable: unavailable in the repository-local CLI/runtime; Direct Mode and static AST checks passed
- [ ] Injected-wallet signature flow: requires a browser wallet and human approval

## Contract

- Network: Studionet / 61999
- RPC: https://studio.genlayer.com/api
- Address: `0xA026BA6f6588186b9F07625b3e355FF7Afbd25a2`
- Deploy transaction: `0x815f868ac3ef34be0ac4d6699c8370f2e4a9c090985133f43d3f4fa8416c3bec`
- Finality: `FINALIZED`, `MAJORITY_AGREE`, 5 validator votes (verified with `npx genlayer receipt`)
- Deployed source SHA-256: `1E1B061858A7897867972600EF9306E1F81D6A0CB3E68001957C98D12C2378DB`
- Corresponding Git commit: `09f610c878d34db2eb19e86ce2d40f492ab33f94`; `contracts/merivox.py` is unchanged through frontend commit `9831ed0e2d6e4436ca6d9f31dfeaef98f6f0e715`
- Explorer URL: no public explorer URL was returned by the Studionet RPC/CLI; receipt evidence is recorded above

## Frontend

- Vercel production URL: [https://merivox.vercel.app](https://merivox.vercel.app)
- Configured canonical contract address: the address above
- Production commit: `9831ed0e2d6e4436ca6d9f31dfeaef98f6f0e715`
- Vercel deployment: READY, `dpl_FvFu38xRfAi2QcXsCHDVghak8YNY`
- Responsive checks: `320`, `375`, `430`, `768`, `1024`, `1440` widths; mobile topbar and desktop rail verified

## Live lifecycle A: equivalent mapping and winning vote

- Round ID: `1`
- Creation tx: present in the live round record; hash not exposed by the read API used for this evidence
- Nomination tx hashes: four immutable nominations; per-nomination hashes are not exposed by the read API
- Alignment tx and observed validator result: live alignment state has `1 DISTINCT` and `3 UNRESOLVED` entries with `ALIGNMENT_TIMEOUT`; deployment receipt finalized with `MAJORITY_AGREE` and 5 validator votes
- Frozen ballot mapping: 4 canonical choices; choice `1` is canonical and the remaining three remain explicit uncertain fallbacks, each retaining one original submission
- Vote tx hashes: two public votes are recorded; per-vote hashes are not exposed by the read API
- Deterministic result tx: `0x936cd526a91c870f1ebb4e1d5d3c241b622790b228b44e3c9653889e5f0da128`
- Final canonical outcome: `TIED`, reason `EQUAL_HIGHEST_TALLIES`, choices `1` and `2`, 2 voters, quorum 2

## Live lifecycle B: distinct and ambiguous alternatives

- Round ID: `1`
- Materially distinct alternatives: live proposal tickets remain separate; the first anchor is `DISTINCT`
- Ambiguous/inconclusive classifier evidence: three entries are `UNRESOLVED` with `ALIGNMENT_TIMEOUT`
- Recovery action: explicit fallback kept each unresolved entry visible and independently selectable
- Resulting ballot grouping: four canonical choices, no silent merges

## Live lifecycle C: negative, tie, no-quorum

- Unauthorized nomination/vote: covered by Direct Mode rejection assertions
- Duplicate nomination/vote: covered by Direct Mode rejection assertions
- Invalid transition: covered by Direct Mode rejection assertions
- Tie result: live round `1` finalized with 2 votes and quorum 2
- No-quorum result: covered by Direct Mode (`NO_QUORUM`, `TURNOUT_BELOW_QUORUM`)
- Refresh/returning-user readback: production round, alignment, ballot and outcome routes reconstructed round `1` from chain state

## Browser integrity

- [x] Site routes load from home through create, round, alignment, ballot and outcome
- [ ] Wallet signing, wrong-chain switching, account changes and rejected signatures: manual wallet required
- [x] Submitted, accepted (provisional), finalized, failed and undetermined are distinct in the transaction UI
- [x] Canonical states survive route reload and live reads; no mock decision is shown as live
- [x] Production Vercel build is READY and Vercel error-log scan returned no logs
- [x] Local responsive/keyboard validation completed; a too-short question displayed the expected inline error
