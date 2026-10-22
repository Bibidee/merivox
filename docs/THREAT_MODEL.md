# Merivox governed-actions threat model

This is the pre-submission final security audit of the governed-action path. The corrected pair is live on Studionet 61999; the earlier pair remains historical and is not used as current proof.

## Scope

This review covers the browser, the Merivox Intelligent Contract, the MerivoxActionGate Intelligent Contract, and the finalized-only message path between them on Studionet `61999`. It does not treat wallet ownership as proof of human identity or organizational ownership.

## Trust boundaries

- The browser and wallet are untrusted clients. UI visibility never authorizes publication.
- Merivox is authoritative for frozen communities, semantic ballot state, action envelopes and governance order.
- ActionGate is authoritative for applied publisher permissions and append-only announcements, but it synchronously checks Merivox's current version and digest before publication.
- Validator output is untrusted until independently normalized and consensus-finalized. Deterministic storage updates happen outside the nondeterministic judgment path.

## Principal attacks and controls

| Attack | Control | Evidence |
|---|---|---|
| Outsider creates or changes a community roster | Founder-selected roster is frozen at `create_space`; binding rounds reuse it | Direct and cross-contract tests |
| Wallet calls gate permission mutation directly | ActionGate checks immediate `gl.message.sender_address` against immutable Merivox address | Direct gate rejection test |
| Old grant arrives after revocation | Version/digest comparison against Merivox current authorization returns `SUPERSEDED` | Cross-contract replay regression |
| Duplicate child delivery | Same version and digest is idempotent and recorded through a delivery key | Cross-contract duplicate path |
| Ambiguous or injected nomination becomes authority | Prompt treats proposal text as data; unresolved/ambiguous results cannot authorize binding execution | Static/direct consensus tests and live evidence when available |
| Parent finality is mistaken for child application | Merivox lifecycle distinguishes `DISPATCHED`, `APPLIED` and recovery; frontend rereads both contracts | Frontend verifier and lifecycle tests |
| Expired publisher publishes | Gate checks expiry, active grant, current Merivox version and digest at publication | ActionGate direct tests |
| Unique tally is mistaken for executable approval | Finalization now applies two-thirds turnout, strict full-roster affirmative majority, certain winner, resolved nominations and valid envelope checks before `APPROVED` | `tests/test_security_remediation.py` |
| Validator-equivalent nominations merge different protected actions | Deterministic typed-envelope equality is required; conflicts become `AMBIGUOUS` and retain `validator_judgment=EQUIVALENT` | Five envelope-conflict regression cases |
| Unrelated announcements consume a filtered page | Per-space announcement index makes offset local to the community and bounded to 25 records | Interleaved 60-announcement cross-contract test |
| Duplicate publication text is mistaken for a new write | Frontend extracts the finalized return ID and reads exactly that record | Frontend verification tests |

## Residual risks

Wallets are pseudonymous, RPC availability can delay readback, and validator semantic judgment can remain unavailable. Those conditions must remain visible as uncertainty or pending state; they are not grounds to fabricate success. The current frontend and pair are hardened, while the historical pair retains its documented limitations and is not presented as the final release.
