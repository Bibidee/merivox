# Merivox reviewer evidence

## Release-candidate boundary

The historical default branch and development pair are retained as superseded reference evidence. The corrected release is on `remediation/post-submission-security-remediation`; its final commit, current pair and Vercel deployment are recorded in [`DEPLOYMENT.md`](DEPLOYMENT.md) and [`LIVE_EVIDENCE.md`](LIVE_EVIDENCE.md).

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

- The corrected source labels a binding result `APPROVED` only after the deterministic eligibility predicate passes; `DECIDED` remains separate from action authorization.
- Publication verification reads the exact finalized announcement ID and checks the community, author, digest and authorization version.
- Per-community bounded pagination, replay protection and parent/child provenance are covered by tests and the live final deployment evidence.
