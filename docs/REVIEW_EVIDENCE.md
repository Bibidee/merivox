# Merivox reviewer evidence

## Release-candidate boundary

The historical default branch is `main` commit `22a7c2a4c268955185d4cee57c767ca90c963091`, with live development pair `0xe201A351b898D15eF8ACDfFF22f62aFabC834C3C` / `0x263c5bAE66CcFcc04bA3546C3fa191F573C5D46b`. The final-readiness corrections are on `remediation/post-submission-security-remediation`, commits `7a6e1b2b06fc8183cd44cd2ae7b6ef0aeb849f32` and `e57dbeaa37e7d5a25e44d91cb604cde30c3379c5`; no replacement pair or Vercel deployment exists yet.

## GenLayer fit

The product uses GenLayer validator consensus for semantic classification of material proposal terms. The decision contract keeps nondeterministic classification separate from deterministic ballot and authorization state. Binding proposals include the exact action envelope in the validator material, and ambiguous or unresolved outcomes fail closed for protected execution.

## Contract quality

The source includes immutable communities, frozen rosters, typed action digests, two-thirds quorum and affirmative-majority approval for binding actions, finalized-only cross-contract dispatch, immediate-caller authentication in ActionGate, version/digest replay protection, bounded recovery and append-only publication records. The remediation makes the full-roster majority and envelope checks authoritative at finalization instead of only at dispatch.

## Engineering

The frontend is backendless and reads both contracts directly. Transaction state distinguishes signing, submission, provisional acceptance, finality, verification, failure and indeterminate states. CI runs frontend checks plus static, direct and compatible-runtime cross-contract tests. Current release addresses and receipts must be copied from `docs/LIVE_EVIDENCE.md`, never inferred from historical deployments.

## Frontend and UX

The original Merivox Decision Studio, Choice Map, activity directory, round workspace, ballot and outcome replay remain the primary experience. `/community` and governed-action mode extend that language with frozen roster, permission and announcement views; they do not replace the application with a generic dashboard.

## Strict-review limitations

Wallet identities are pseudonymous, validator availability can require bounded retries, and hosted RPC/browser verification can encounter transient read failures. Live evidence must disclose any unexercised mobile, rejected-signature or in-flight recovery paths.

## Final-readiness findings

- The deployed source can label a unique but ineligible binding tally `APPROVED`; current dispatch checks prevent unauthorized ActionGate delivery, but the label is misleading until redeployment.
- The deployed publication view used a limited-page content/author search; the remediation verifies the exact finalized announcement ID and digest.
- The remediation branch fixes both issues, adds per-space bounded pagination and regression coverage, passes the local frontend build plus 31 contract/cross-contract tests, and remains unmerged pending review.
