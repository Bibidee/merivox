# Merivox — deployment evidence (unfilled)

Never fill this document with guesses. The starter has NOT been deployed.

## Preflight

- [ ] `npm install` completed, audited and package-lock committed
- [ ] repository-local `npx genlayer --version` reports 0.39.1
- [ ] `npm run network:check` PASS
- [ ] `npm run typecheck` PASS
- [ ] `npm run lint` PASS
- [ ] `npm run test` PASS
- [ ] `npm run build` PASS
- [ ] GenVM lint PASS
- [ ] Complete Direct Mode tests PASS
- [ ] Full browser tests PASS
- [ ] No forbidden network settings, server backend or tracked secrets

## Contract

- Network: Studionet / 61999
- RPC: https://studio.genlayer.com/api
- Address: NOT DEPLOYED
- Deploy transaction: NOT DEPLOYED
- Finality: UNVERIFIED
- Deployed source SHA-256: NOT VERIFIED
- Corresponding Git commit: NOT CREATED
- Explorer URL: NOT AVAILABLE

## Frontend

- Vercel production URL: NOT DEPLOYED
- Configured canonical contract address: NOT CONFIGURED
- Production commit: NOT CREATED
- 320px / mobile / tablet / desktop: NOT BROWSER-TESTED

## Live lifecycle A: equivalent mapping and winning vote

- Round ID:
- Creation tx:
- Nomination tx hashes:
- Alignment tx and observed validator result:
- Frozen ballot mapping:
- Vote tx hashes:
- Deterministic result tx:
- Final canonical outcome:

## Live lifecycle B: distinct and ambiguous alternatives

- Round ID:
- Materially distinct alternatives:
- Ambiguous/inconclusive classifier evidence:
- Recovery action:
- Resulting ballot grouping:

## Live lifecycle C: negative, tie, no-quorum

- Unauthorized nomination/vote:
- Duplicate nomination/vote:
- Invalid transition:
- Tie result:
- No-quorum result:
- Refresh/returning-user readback:

## Browser integrity

- [ ] Site navigates from home to create, round, alignment, ballot and outcome
- [ ] Wallet connects and disconnects without local keys
- [ ] Wrong-chain state blocks writes and switch action behaves correctly
- [ ] Account changes update permissions
- [ ] Rejected signatures show no submitted tx
- [ ] Submitted, accepted (provisional), finalized, failed and undetermined are distinct
- [ ] Tx hash/explorer links are genuine
- [ ] Canonical states survive reload
- [ ] No mock decisions or placeholder data represented as live
- [ ] No fatal browser console errors
