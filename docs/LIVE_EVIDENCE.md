# Merivox live evidence ledger

This ledger records only the already-submitted two-contract release and its canonical Studionet readbacks. Historical one-contract deployments are superseded and are not used as proof for this release. The post-submission remediation branch is not represented as live evidence.

## Target

- Network: GenLayer Studionet, chain `61999`
- RPC: `https://studio.genlayer.com/api`
- CLI: repository-local `genlayer@0.39.1`
- Frontend: [merivox.vercel.app](https://merivox.vercel.app)
- Implementation commit: `38a2a8d84d7df26edafa5143ed4cf48268f0f1e3`
- Merivox source SHA-256: `E4FEAA9896140A283A3B7A2A349BCB4D675A4F0C1540A6B129B832EC67EA7645`
- ActionGate source SHA-256: `A047D22FBD568B29ABBB949417FDBCFBD86DBC645D6D37EB9B16E2F0CD26A652`

## Submission boundary

The live addresses and receipts below are historical facts for the submitted release. The remediation branch (`remediation/post-submission-security-remediation`) is local-only and has no live contract addresses, deployment receipts or Vercel deployment. Its local correctness evidence is recorded in `docs/TEST_MATRIX.md`; it must not be inferred from these live receipts.

## Deployments and binding

| Item | Address / transaction | Verified result |
|---|---|---|
| Merivox deployment | `0xe201A351b898D15eF8ACDfFF22f62aFabC834C3C` / [`0x3b9015b3acbb3bb5e20e33f0dcf3aee793136da61f82dfa19da8c2e80e58b38f`](https://explorer-studio.genlayer.com/tx/0x3b9015b3acbb3bb5e20e33f0dcf3aee793136da61f82dfa19da8c2e80e58b38f) | `FINALIZED`, `MAJORITY_AGREE`, five execution receipts observed |
| ActionGate deployment | `0x263c5bAE66CcFcc04bA3546C3fa191F573C5D46b` / [`0x816e0b6315b4185fd6b56f8d0c39e30bb0e69d97b8bef7abf58b0ba5705f7274`](https://explorer-studio.genlayer.com/tx/0x816e0b6315b4185fd6b56f8d0c39e30bb0e69d97b8bef7abf58b0ba5705f7274) | `FINALIZED`, `MAJORITY_AGREE`, five execution receipts observed |
| Reciprocal bootstrap binding | [`0xc58afd530c6625fdf7f309179feed7eec1820b8e05a2eb9eb5d5a548380ae6ac`](https://explorer-studio.genlayer.com/tx/0xc58afd530c6625fdf7f309179feed7eec1820b8e05a2eb9eb5d5a548380ae6ac) | `FINALIZED`, Merivox `configured=true`, ActionGate address reciprocal |

## Grant lifecycle — round 1

Community: `studio-builders-final-20261021`; frozen roster of four wallets; quorum `3`.

| Step | Transaction / canonical readback |
|---|---|
| Space creation | [`0xf9d2790ca94eedec12433f2a1bcc6936c9306dd33639e2f5ff0b992d8241d034`](https://explorer-studio.genlayer.com/tx/0xf9d2790ca94eedec12433f2a1bcc6936c9306dd33639e2f5ff0b992d8241d034), finalized with the expected space ID |
| Binding round creation | [`0xf12fe92a168560a4857f28b41d5b73ee98675c82eba6a4b9e4918a341af056bd`](https://explorer-studio.genlayer.com/tx/0xf12fe92a168560a4857f28b41d5b73ee98675c82eba6a4b9e4918a341af056bd), round `1`, finalized |
| Grant nominations | [`0x0ca7b520ac17466c2d3f411666acba06db20100ec228d724b53f18a211a95601`](https://explorer-studio.genlayer.com/tx/0x0ca7b520ac17466c2d3f411666acba06db20100ec228d724b53f18a211a95601) and [`0x7cab4663c367bfc511af12435e69a1fb6a537523c43dabeb2c0055649db20ef0`](https://explorer-studio.genlayer.com/tx/0x7cab4663c367bfc511af12435e69a1fb6a537523c43dabeb2c0055649db20ef0), finalized; same grant digest `a5ffbedc02ffd5c93a8ee5de13316077c000c2769c7072722468f4689119faf2` |
| Alignment | [`0x172b2f21a8007e7d71241bd352073ca37a87dd3565942db3a57e8990a5b10957`](https://explorer-studio.genlayer.com/tx/0x172b2f21a8007e7d71241bd352073ca37a87dd3565942db3a57e8990a5b10957) and [`0x8c941d663362bce0ba85c455ef30b3c70765081df3260960a93fc8ae65166504`](https://explorer-studio.genlayer.com/tx/0x8c941d663362bce0ba85c455ef30b3c70765081df3260960a93fc8ae65166504) = `DISTINCT`; [`0x1f273687eb79a7f88b21ae56a6e8aed5a2ba638c415d52c10a7f681653eb4802`](https://explorer-studio.genlayer.com/tx/0x1f273687eb79a7f88b21ae56a6e8aed5a2ba638c415d52c10a7f681653eb4802) = `EQUIVALENT` |
| Ballot and votes | Open [`0x5755fe3386ca140e2f048319d4520ce5da7b61f4adfb825a49a5aaf56103150b`](https://explorer-studio.genlayer.com/tx/0x5755fe3386ca140e2f048319d4520ce5da7b61f4adfb825a49a5aaf56103150b); votes [`0x8bdfdece1fa161ab060b547fc236610d8a8015a2d87fc425d04c512d93f935dc`](https://explorer-studio.genlayer.com/tx/0x8bdfdece1fa161ab060b547fc236610d8a8015a2d87fc425d04c512d93f935dc), [`0x09ba7a166c440529a9d03723526833b8849eb0f175151391ac15f542d52dec3c`](https://explorer-studio.genlayer.com/tx/0x09ba7a166c440529a9d03723526833b8849eb0f175151391ac15f542d52dec3c), [`0xcca9214de9576a4a5cafc61d3c115ebb76fb3d5dac045466fe73c9a37ac369ef`](https://explorer-studio.genlayer.com/tx/0xcca9214de9576a4a5cafc61d3c115ebb76fb3d5dac045466fe73c9a37ac369ef), all finalized |
| Finalization | [`0x09f0cd210578b8c0f6852f7bd7621ba4ea6cd07bef63cc69e2c4124c7ed2c4a0`](https://explorer-studio.genlayer.com/tx/0x09f0cd210578b8c0f6852f7bd7621ba4ea6cd07bef63cc69e2c4124c7ed2c4a0), `DECIDED`, winner `1`, quorum `3`, voter count `3` |
| Grant dispatch and child | Parent [`0xa1deb2aee1baa3739663878145e6de6858fa123bbea3c9df2854365fb783c14a`](https://explorer-studio.genlayer.com/tx/0xa1deb2aee1baa3739663878145e6de6858fa123bbea3c9df2854365fb783c14a), child [`0x08005cf2cf35453aebe3bde21d6abdf181dab99dbe53164df951d48a9134b3ad`](https://explorer-studio.genlayer.com/tx/0x08005cf2cf35453aebe3bde21d6abdf181dab99dbe53164df951d48a9134b3ad), both finalized; child return `APPLIED` |
| Grant readback | ActionGate permission `active=true`, `effective=true`, `reason=ACTIVE`, version `1792609064000001` |
| Publication boundary | Bob publication [`0x60cd892b93c30bb2b2e71ba8d48c3cd4dc1be88c25221aa7d01df43b1d49142c`](https://explorer-studio.genlayer.com/tx/0x60cd892b93c30bb2b2e71ba8d48c3cd4dc1be88c25221aa7d01df43b1d49142c) finalized with expected rejection; Alice publication [`0x3d57d252b2f73be444e0b19a54a14457f5c6492794932e6ce0274e963ca30bbd`](https://explorer-studio.genlayer.com/tx/0x3d57d252b2f73be444e0b19a54a14457f5c6492794932e6ce0274e963ca30bbd) finalized successfully as announcement `1` |

## Revoke lifecycle — round 2

The same frozen community produced a second binding round with the exact typed envelope `REVOKE_PUBLISHER`, recipient Alice, scope `PUBLISHER`, expiry `0`.

| Step | Transaction / canonical readback |
|---|---|
| Round and nominations | Round creation [`0xbdc0c15b2e1179dd3c79649a0c9f11e525fcba8a289321145825f699ff062974`](https://explorer-studio.genlayer.com/tx/0xbdc0c15b2e1179dd3c79649a0c9f11e525fcba8a289321145825f699ff062974); nominations [`0x54aade3875147c79e3fb1e9158f1721d4b14624680b51193cf539d0b42f4f322`](https://explorer-studio.genlayer.com/tx/0x54aade3875147c79e3fb1e9158f1721d4b14624680b51193cf539d0b42f4f322) and [`0xa65b7fd0fba716e2629b2f919ab757bb4321f40fdb2a44ef61df28f9aeaa0ae8`](https://explorer-studio.genlayer.com/tx/0xa65b7fd0fba716e2629b2f919ab757bb4321f40fdb2a44ef61df28f9aeaa0ae8), all finalized |
| Validator alignment | Begin [`0x52052449df6e0e642ea69a4506d34450f039f0ede6f23cd060e8d545248ebd4b`](https://explorer-studio.genlayer.com/tx/0x52052449df6e0e642ea69a4506d34450f039f0ede6f23cd060e8d545248ebd4b); [`0x413862e5a6bfcfa5e93fb2cb49ca69ab0cb5847df18c68fde47c72c8af8995c2`](https://explorer-studio.genlayer.com/tx/0x413862e5a6bfcfa5e93fb2cb49ca69ab0cb5847df18c68fde47c72c8af8995c2) = `DISTINCT`; [`0xd3ee613fd59699883c1656a0d7c571201b052de8ea14277f507e7cd29f1f8ea0`](https://explorer-studio.genlayer.com/tx/0xd3ee613fd59699883c1656a0d7c571201b052de8ea14277f507e7cd29f1f8ea0) = `EQUIVALENT` |
| Ballot and finalization | Open [`0xed94573455d3ccd550b15e22bc619fc150983e35ff039b2c0cd397104564571f`](https://explorer-studio.genlayer.com/tx/0xed94573455d3ccd550b15e22bc619fc150983e35ff039b2c0cd397104564571f); corrected votes Bob [`0xbd322268fd85ba7cc1b4d59d180998f66887075a4ebc8ff14ed7f4641aee2b1e`](https://explorer-studio.genlayer.com/tx/0xbd322268fd85ba7cc1b4d59d180998f66887075a4ebc8ff14ed7f4641aee2b1e), Alice [`0xf2ef9a5807d0c0b23dec1057f8db2dbb33101aa22ebffb8db8476c2da6b4cdcd`](https://explorer-studio.genlayer.com/tx/0xf2ef9a5807d0c0b23dec1057f8db2dbb33101aa22ebffb8db8476c2da6b4cdcd), Carol [`0x5210400a5d0746fed1b6109b64d8b9dd5f955ac593cca434952c9d8203a81c24`](https://explorer-studio.genlayer.com/tx/0x5210400a5d0746fed1b6109b64d8b9dd5f955ac593cca434952c9d8203a81c24), all finalized; finalization [`0x315ae7ced308b3c7cc725082364ad375d40a4e2c9412a9888e7c683722c27f8e`](https://explorer-studio.genlayer.com/tx/0x315ae7ced308b3c7cc725082364ad375d40a4e2c9412a9888e7c683722c27f8e) finalized as `DECIDED`, winner `2`, quorum `3`, voter count `3` |
| Revoke dispatch and child | Parent [`0xf4e9e25a8993dd5043c6f5533bd491e771bdef69d0d6050c3249044fe726d66f`](https://explorer-studio.genlayer.com/tx/0xf4e9e25a8993dd5043c6f5533bd491e771bdef69d0d6050c3249044fe726d66f), child [`0x1a6e175a11ba3edf3be2405d950fe96e5dcfa92d9206b7e5fc2b98713d553479`](https://explorer-studio.genlayer.com/tx/0x1a6e175a11ba3edf3be2405d950fe96e5dcfa92d9206b7e5fc2b98713d553479), both finalized; child return `APPLIED` |
| Revoke readback | Binding action `APPLIED`, digest `07680f198b8a9136c76724826ff0d39b42d6442d7e0dcd5af2a1d7d7d995821d`, version `1792614076000002`; ActionGate permission `active=false`, `effective=false`, `reason=REVOKED` |
| Revoked publication | Alice publication [`0x7cd64f0d03428a677f4281b989bc5ea7c4ff3fe62bc1f75ff2118c4dbd4f55ee`](https://explorer-studio.genlayer.com/tx/0x7cd64f0d03428a677f4281b989bc5ea7c4ff3fe62bc1f75ff2118c4dbd4f55ee) finalized with `MAJORITY_AGREE` and execution error `Wallet is not an active publisher for this community` |

## Additional verification

- The compatible-runtime cross-contract suite covers revoke, duplicate delivery, stale replay (`SUPERSEDED`) and per-community interleaved pagination; these are not represented as live GenLayer receipts.
- A live unpermissioned `get_permission` read returned `exists=false`, `effective=false`, `reason=NO_PERMISSION` on the corrected pair, validating the Address normalization regression fix.
- Production browser verification confirmed `/community/`, `/round/?id=1` and `/outcome/?id=1` render the corrected community, validator classifications and `APPLIED` governed action after a fresh read.
- Vercel production deployment: `dpl_HguQZeewPHpU7EarDNQLaSS6NjnQ`, `READY`, aliased to [merivox.vercel.app](https://merivox.vercel.app).
- No private key was read, exported or revealed. Account switching used only the existing unlocked CLI accounts.

The submitted release has two disclosed correctness limitations found after submission: its deployed Merivox source can expose `APPROVED` for a unique but ineligible binding tally (dispatch still fails closed), and its deployed frontend uses the older limited-page publication check. The remediation corrects both in source and requires a new compatible pair before those fixes can be live.
