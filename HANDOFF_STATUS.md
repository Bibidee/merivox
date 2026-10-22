# MERIVOX V1 — Final Pre-Submission Release

Current verdict: `READY WITH DISCLOSED LIMITATIONS`. Merivox is prepared for submission but has not been submitted or merged. The corrected implementation is deployed, both live binding lifecycles are verified through finalized cross-contract application, and the final evidence is recorded in [`docs/LIVE_EVIDENCE.md`](docs/LIVE_EVIDENCE.md).

## Current verified state

- Merivox’s premium Decision Studio and Choice Map identity are preserved.
- The corrected branch hardens semantic reconciliation, immutable nominations, frozen eligibility, deterministic tallying, bounded retries, cross-contract authorization, stale-action handling and production readback.
- Corrected contracts are deployed on Studionet 61999 and reciprocally bound.
- Vercel production is live at [merivox.vercel.app](https://merivox.vercel.app) with the corrected contract addresses.
- Round 1 grant is finalized, dispatched through a finalized child transaction, read back as `APPLIED` / `ACTIVE`, and used for a successful Bob publication.
- Round 2 contains two same-envelope revoke nominations with validator-backed `DISTINCT` and `EQUIVALENT` alignment, three finalized votes, deadline-gated finalization, finalized parent/child delivery and canonical revoke readback.
- Bob’s post-revoke publication was rejected by a finalized ActionGate transaction, and the previous grant was finalized as `SUPERSEDED` by the current revoke authorization.
- An early `finalize(2)` attempt was correctly rejected by the contract with `Voting deadline has not passed`; the later post-deadline finalization is separately evidenced.

## Release artifacts

- Branch: `remediation/post-submission-security-remediation`
- Corrected Merivox: `0xB81D80f2661a78a0742B190fE44f15149156a6DF`
- Corrected ActionGate: `0x5DE12E4E0a80A621Af8Cb4c453FaE569df857206`
- Merivox source SHA-256: `98C1A343C29C600F1BC44B8B0B48BCBCD10648EDB6DFE4F6782CAA715AADC4CE`
- ActionGate source SHA-256: `E9B7E904624C4860F1BCCD0F72FC2D96794B617E33E91F73204576AEF2ADA305`
- Vercel: [merivox.vercel.app](https://merivox.vercel.app)
- Current Vercel deployment: [AV5U9Xx7Q2Tw1xwZetJzMyikZvHe](https://vercel.com/bibidees-projects/merivox/AV5U9Xx7Q2Tw1xwZetJzMyikZvHe) — `READY`
- PR: [#2](https://github.com/Bibidee/merivox/pull/2) — open for reassessment; do not merge silently.
- Final release commit: `dfd9640ff2501e05571d1d7fd58f4120543d83c0`
- Passing release CI: [#37](https://github.com/Bibidee/merivox/actions/runs/39774221576)

## Final evidence

- Round-2 finalization: `0xf006bfb60f07fff646ccf343a48ee31f48a2e9e856197539aad4d25ee02985e2`
- Revoke dispatch parent / child: `0x87679ec6d1e0b218a498af811af8544030873c9b9492b2096886b7692a931ed8` / `0xf857c738f68d77420f10ce0dc817e47083492d89da3c9707b0ba938ac0ef960b`
- Revoke refresh: `0x8d9e157263c39b7193f66a184c8d5e69b2b0b01a2ef7aff3f786efb6e543f818`
- Post-revoke rejection: `0x83b521cd6c6476fc054139458d8a1d018ecfc16b6ab980f089240e7ab71a6e56`
- Stale grant supersession: `0x8ffd7e89fb7019ffcc045cb15807eaf86f707cfd86f1d72f5415e5c7fe681ec2`

Final evidence ledger commit: `9c1f65ba8f00d1ac642ea0edadeb99bb52ce6908`. The final release head `dfd9640ff2501e05571d1d7fd58f4120543d83c0` passed [CI #37](https://github.com/Bibidee/merivox/actions/runs/39774221576). Computer Use verified the production routes at 375px, 390px, 768px and 1440px with no horizontal overflow; a transient RPC read error recovered on isolated retry. The wallet-rejection path now records `FAILED` locally when signing is rejected, with a focused regression test; no live wallet rejection was requested or claimed.

No private key is accessed by the agent. Wallet signing is not required for the existing unlocked CLI accounts used in this verification.
