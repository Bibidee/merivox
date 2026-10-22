# Merivox live evidence ledger

This ledger records the corrected Merivox V1 deployment and the live Studionet lifecycle evidence. Every transaction described as finalized was checked through the repository-local GenLayer CLI and its explicit `FINALIZED` receipt. Contract state claims are based on canonical reads after the corresponding receipt.

## Target and release boundary

- Network: GenLayer Studionet, chain `61999`
- RPC: `https://studio.genlayer.com/api`
- CLI: repository-local `genlayer@0.39.1`
- Frontend: [merivox.vercel.app](https://merivox.vercel.app)
- Release branch: `remediation/post-submission-security-remediation`
- Implementation commit before evidence-document updates: `541b8b797226da1e5d6bca85a0435a7d156ef8bd`
- Final pre-submission release commit: `5f76ca98603e3c5e51faf55384030dd5ac3d9cb3`
- Merivox source SHA-256: `98C1A343C29C600F1BC44B8B0B48BCBCD10648EDB6DFE4F6782CAA715AADC4CE`
- ActionGate source SHA-256: `E9B7E904624C4860F1BCCD0F72FC2D96794B617E33E91F73204576AEF2ADA305`
- No private key was read, exported or revealed. All writes used the existing unlocked CLI accounts.

## Corrected deployment and binding

| Item | Address / transaction | Verified result |
|---|---|---|
| Merivox deployment | `0xB81D80f2661a78a0742B190fE44f15149156a6DF` / [`0x69f211ef36624c3c73ce289151d0d0ae02133711cff4343ed1facfbf7423dd83`](https://explorer-studio.genlayer.com/tx/0x69f211ef36624c3c73ce289151d0d0ae02133711cff4343ed1facfbf7423dd83) | `FINALIZED`, `MAJORITY_AGREE` |
| ActionGate deployment | `0x5DE12E4E0a80A621Af8Cb4c453FaE569df857206` / [`0xe5e47381f8ebeefa674233cd16722c136ccd0726b2e6d400bccda759a621edbe`](https://explorer-studio.genlayer.com/tx/0xe5e47381f8ebeefa674233cd16722c136ccd0726b2e6d400bccda759a621edbe) | `FINALIZED`, `MAJORITY_AGREE` |
| Reciprocal bootstrap binding | [`0xe31924db6dfdfd7a5fa6274e15a665b08c5791637ad46da4e4b7592e82095874`](https://explorer-studio.genlayer.com/tx/0xe31924db6dfdfd7a5fa6274e15a665b08c5791637ad46da4e4b7592e82095874) | `FINALIZED`; both contracts read the reciprocal address, `configured=true`, `bootstrap_closed=true` |

## Community and grant lifecycle — round 1

Community: `merivox-final-20261022`; three frozen members; quorum `2`. The typed grant envelope was `GRANT_PUBLISHER`, recipient Bob, scope `PUBLISHER`, expiry `1792665946`, digest `93c57984a73a338e0f0ef9932c4243bb741c3f897f31eda0aa2396d18c349ae6`.

| Step | Evidence |
|---|---|
| Boundary rejection | [`0x3eeec5b9941ff04b381e9bc111af178f5607c445798e127fa73e90f40744a79b`](https://explorer-studio.genlayer.com/tx/0x3eeec5b9941ff04b381e9bc111af178f5607c445798e127fa73e90f40744a79b) finalized, but contract rolled back with `Ballot deadline must leave alignment time for all bounded retries plus 15 minutes of voting`; no round was created. |
| Round creation | [`0x45dfc1f0b97caf755cfb6674704a377a3b66f53b8827e83a6e2a6b1e25b611e0`](https://explorer-studio.genlayer.com/tx/0x45dfc1f0b97caf755cfb6674704a377a3b66f53b8827e83a6e2a6b1e25b611e0) finalized with round `1`. |
| Nomination | [`0xe4c612447bce4a17ce0d4201c53ab8a3e4d09e8f3596ee7ae28a6f145f81c3c5`](https://explorer-studio.genlayer.com/tx/0xe4c612447bce4a17ce0d4201c53ab8a3e4d09e8f3596ee7ae28a6f145f81c3c5) finalized with nomination `1`. |
| Alignment and ballot | [`0x1aaad9162593e884de90f7ce754b4b2bc5f9df420cc3865b19939ccc2c3e7422`](https://explorer-studio.genlayer.com/tx/0x1aaad9162593e884de90f7ce754b4b2bc5f9df420cc3865b19939ccc2c3e7422) finalized as `RECONCILING`; [`0x3d3e74ac201c56f03339b23b7c9e6a4115edd564f22b80025ce9f02a27ddecdc`](https://explorer-studio.genlayer.com/tx/0x3d3e74ac201c56f03339b23b7c9e6a4115edd564f22b80025ce9f02a27ddecdc) finalized as the deterministic one-nomination anchor `DISTINCT`; [`0x6672e3e1041c29a6e84f9d4416451a5c0895c0654d7b210b13eab73e9d25605f`](https://explorer-studio.genlayer.com/tx/0x6672e3e1041c29a6e84f9d4416451a5c0895c0654d7b210b13eab73e9d25605f) opened `VOTING`. |
| Votes and finalization | Alice [`0x97750fcc79875dc0dc9a18ef36124acb1e8481f7830e8ad632b7c302d84a8d4c`](https://explorer-studio.genlayer.com/tx/0x97750fcc79875dc0dc9a18ef36124acb1e8481f7830e8ad632b7c302d84a8d4c), Carol [`0x4ac7f63c755da7f6a97402fd631684a95bae83b915e0f7d12df4403aeb2d09fa`](https://explorer-studio.genlayer.com/tx/0x4ac7f63c755da7f6a97402fd631684a95bae83b915e0f7d12df4403aeb2d09fa), and Bob’s finalized vote produced canonical tally choice `1`, nomination `1`, votes `3`, quorum `2`; finalization [`0x59969c28528f763d50cff978356f0abd653126629bc76bf5f177de35cd87565e`](https://explorer-studio.genlayer.com/tx/0x59969c28528f763d50cff978356f0abd653126629bc76bf5f177de35cd87565e) finalized as `DECIDED`, reason `UNIQUE_HIGHEST_TALLY`. |
| Dispatch and application | Parent [`0xdd3bd8535d7296332d1ff19eef18d36944f72f55b51ce6c245d64a46c987fdc1`](https://explorer-studio.genlayer.com/tx/0xdd3bd8535d7296332d1ff19eef18d36944f72f55b51ce6c245d64a46c987fdc1) finalized and emitted child [`0x0f5b1b50c7e19d5f7c8eff1248c5367cd282843828139d5602ea363a88bf1c1e`](https://explorer-studio.genlayer.com/tx/0x0f5b1b50c7e19d5f7c8eff1248c5367cd282843828139d5602ea363a88bf1c1e), which finalized `APPLIED`. |
| Readback and publication | Refresh [`0x801ef82d14cc2e6f8e7b127b1b1ffe8f6a37cd465358629f2d151faf136c06b4`](https://explorer-studio.genlayer.com/tx/0x801ef82d14cc2e6f8e7b127b1b1ffe8f6a37cd465358629f2d151faf136c06b4) finalized; binding action and ActionGate readbacks were `APPLIED` / `ACTIVE` with version `1792662696000001`. Bob’s publication [`0x69299f0fe7ea011c7c09881734af483f4b9a60ba27c5aae0ac1a87282c5932a4`](https://explorer-studio.genlayer.com/tx/0x69299f0fe7ea011c7c09881734af483f4b9a60ba27c5aae0ac1a87282c5932a4) finalized as announcement `1`. |

## Revoke lifecycle — round 2

Round `2` uses two differently worded nominations with the same typed envelope: `REVOKE_PUBLISHER`, recipient Bob, scope `PUBLISHER`, expiry `0`. The exact ballot deadline is `1792667697` (`2026-10-22 11:14:57 UTC`).

| Step | Evidence |
|---|---|
| Boundary rejection | [`0x3d927549f8cca0ee8e795be7ff6b96adbd2ac24ea0c34bd2649e1cbb44001fb1`](https://explorer-studio.genlayer.com/tx/0x3d927549f8cca0ee8e795be7ff6b96adbd2ac24ea0c34bd2649e1cbb44001fb1) finalized, but round creation correctly rolled back with the bounded-deadline error. |
| Round and nominations | Round creation [`0x83ede78eb05c8a92b82686aa7cabed05f1543f659ccdd038de6621faea0b13dd`](https://explorer-studio.genlayer.com/tx/0x83ede78eb05c8a92b82686aa7cabed05f1543f659ccdd038de6621faea0b13dd) finalized as round `2`; Alice nomination [`0xffc586e082395eb4fed07a6e0bc2aa652ef25098e7484976d0a39253d4529780`](https://explorer-studio.genlayer.com/tx/0xffc586e082395eb4fed07a6e0bc2aa652ef25098e7484976d0a39253d4529780) finalized as nomination `2`; Carol nomination [`0x9a9052517c78ea2cd525a005a4d0d8e4f9b5aa10bd79593d4083bf22ae629c1b`](https://explorer-studio.genlayer.com/tx/0x9a9052517c78ea2cd525a005a4d0d8e4f9b5aa10bd79593d4083bf22ae629c1b) finalized as nomination `3`. |
| Validator alignment | Begin [`0xffe846622561c5b949c75a91a658b0bfffdfafbe07b979fab281a8c76558da32`](https://explorer-studio.genlayer.com/tx/0xffe846622561c5b949c75a91a658b0bfffdfafbe07b979fab281a8c76558da32) finalized as `RECONCILING`; first reconcile [`0xcaab0149f904e788b88d8b2b0c33904f4a7c4a12392006e9151292d4797621aa`](https://explorer-studio.genlayer.com/tx/0xcaab0149f904e788b88d8b2b0c33904f4a7c4a12392006e9151292d4797621aa) finalized as anchor `DISTINCT`; second reconcile [`0xd84505cca38897f8c3d429ee5f7f1e841e6bef30eaa5cb55ec936eca7cc40919`](https://explorer-studio.genlayer.com/tx/0xd84505cca38897f8c3d429ee5f7f1e841e6bef30eaa5cb55ec936eca7cc40919) finalized as validator-backed `EQUIVALENT`. |
| Ballot and current state | `open_ballot(2)` finalized; Alice [`0x3da01de0321da698b42ccf3853b6ff1fca327d7dcaf66c2b339173a52895b9ea`](https://explorer-studio.genlayer.com/tx/0x3da01de0321da698b42ccf3853b6ff1fca327d7dcaf66c2b339173a52895b9ea), Bob [`0x64f6ac1fda49dcbe50674c4091c3343dfb25c263e0f563d3bb563fe9c1427e5d`](https://explorer-studio.genlayer.com/tx/0x64f6ac1fda49dcbe50674c4091c3343dfb25c263e0f563d3bb563fe9c1427e5d), and Carol [`0x92623c9147b7ca03bb86d2e95dd1b4ab16c92533c44367e919a102937a752052`](https://explorer-studio.genlayer.com/tx/0x92623c9147b7ca03bb86d2e95dd1b4ab16c92533c44367e919a102937a752052) finalized. Canonical tally: choice `2`, nominations `2,3`, votes `3`, quorum `2`. |
| Early-finalize negative control | [`0x6c4d292074aee5a6ae528c13da77dedf644097f0672ef4dfc6e08a6610e52546`](https://explorer-studio.genlayer.com/tx/0x6c4d292074aee5a6ae528c13da77dedf644097f0672ef4dfc6e08a6610e52546) finalized at the network level but the contract correctly rejected execution with `Voting deadline has not passed`; canonical state remained `VOTING`. |
| Finalization | [`0xf006bfb60f07fff646ccf343a48ee31f48a2e9e856197539aad4d25ee02985e2`](https://explorer-studio.genlayer.com/tx/0xf006bfb60f07fff646ccf343a48ee31f48a2e9e856197539aad4d25ee02985e2) reached explicit `FINALIZED`, `MAJORITY_AGREE`, and returned `DECIDED` after the ballot deadline. Canonical result: winner choice `2`, reason `UNIQUE_HIGHEST_TALLY`, three votes, quorum `2`. |
| Revoke dispatch and child | Parent [`0x87679ec6d1e0b218a498af811af8544030873c9b9492b2096886b7692a931ed8`](https://explorer-studio.genlayer.com/tx/0x87679ec6d1e0b218a498af811af8544030873c9b9492b2096886b7692a931ed8) reached explicit `FINALIZED`, `MAJORITY_AGREE`, returned `DISPATCHED` and emitted child [`0xf857c738f68d77420f10ce0dc817e47083492d89da3c9707b0ba938ac0ef960b`](https://explorer-studio.genlayer.com/tx/0xf857c738f68d77420f10ce0dc817e47083492d89da3c9707b0ba938ac0ef960b), which reached explicit `FINALIZED`, `MAJORITY_AGREE`, returned `APPLIED`. |
| Revoke readback | Refresh [`0x8d9e157263c39b7193f66a184c8d5e69b2b0b01a2ef7aff3f786efb6e543f818`](https://explorer-studio.genlayer.com/tx/0x8d9e157263c39b7193f66a184c8d5e69b2b0b01a2ef7aff3f786efb6e543f818) reached explicit `FINALIZED`, returned `APPLIED`; canonical binding action is `APPLIED`, lifecycle `APPLIED`, digest `b7812f340a2be43b88afb4dfa86db2981f6d8acdc4a6cfa79489c3b7b51bfef0`, version `1792667739000002`. ActionGate permission is `active=false`, `applied=true`, `effective=false`, `reason=REVOKED`. |
| Revoked publication | Bob publication [`0x83b521cd6c6476fc054139458d8a1d018ecfc16b6ab980f089240e7ab71a6e56`](https://explorer-studio.genlayer.com/tx/0x83b521cd6c6476fc054139458d8a1d018ecfc16b6ab980f089240e7ab71a6e56) reached explicit `FINALIZED`, `MAJORITY_AGREE`, and the contract rejected execution with `Wallet is not an active publisher for this community`. |
| Stale grant supersession | Refresh [`0x8ffd7e89fb7019ffcc045cb15807eaf86f707cfd86f1d72f5415e5c7fe681ec2`](https://explorer-studio.genlayer.com/tx/0x8ffd7e89fb7019ffcc045cb15807eaf86f707cfd86f1d72f5415e5c7fe681ec2) reached explicit `FINALIZED`, returned `SUPERSEDED`; canonical round-1 binding action is now `SUPERSEDED` while round 2 remains `APPLIED`. |

## Additional verification

- Compatible-runtime tests cover `AMBIGUOUS`, `NOT_AUTHORIZED`, duplicate delivery, stale replay (`SUPERSEDED`) and per-community interleaved pagination; those cases are not mislabeled as live GenLayer receipts.
- Production browser verification covered `/`, `/new/`, `/community/`, `/round/?id=2`, `/align/?id=2`, `/ballot/?id=2`, `/outcome/?id=2` and `/activity/` at 375px, 390px, 768px and 1440px. No horizontal overflow was observed; the round-2 workspace visibly reports `DECIDED`, three eligible wallets, two alternatives, one canonical choice, three votes and quorum two. The outcome visibly reports `FINALIZED ON STUDIONET`, `UNIQUE HIGHEST TALLY`, `APPLIED`, the two validator classifications and the exact revoke envelope. The community view visibly reports both governed rounds and the append-only announcement; no active publisher permission remains after revoke. A transient RPC fetch failure during rapid route traversal recovered on an isolated retry and was retained as a disclosed browser/RPC limitation.
- The production deployment is [merivox.vercel.app](https://merivox.vercel.app), currently served by deployment `HCtfWoNnbgCozPZWobcZbZ6cFkV3`, status `READY`.
