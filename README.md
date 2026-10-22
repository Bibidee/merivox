# Merivox — The Decision Studio

**Production V1 — GenLayer Studionet 61999**

Merivox is a backendless GenLayer application for forming more representative community ballots. Eligible members propose actionable alternatives; independent validators will classify whether those alternatives are materially equivalent before the ballot freezes. Members, not AI, vote on the final choices.

## Current status

The submitted release preserves the original decision-studio identity while extending it with a second, contract-enforced ActionGate for governed community announcements. Its Studionet grant and revoke evidence is preserved as historical release evidence. A separate post-submission remediation branch hardens binding approval, typed-envelope reconciliation, pagination and publication readback; it has not been deployed or merged.

| Area | Status |
|---|---|
| Decision Studio frontend and Choice Map | Redesigned, responsive and deployed |
| Guided decision creator and wallet gating | Implemented against the live contract ABI |
| Validator-backed semantic reconciliation | Implemented with conservative uncertainty/fallback behavior |
| Frozen ballot, voting, quorum and tie result | Implemented and covered by Direct Mode tests |
| Current Studionet lifecycle evidence | Corrected pair demonstrates live grant and revoke rounds, validator-backed `DISTINCT`/`EQUIVALENT`, finalized child delivery and publication controls |
| Submitted production release | Live at the documented pair; all significant receipts are recorded in `docs/LIVE_EVIDENCE.md` |
| Remediation branch | `remediation/post-submission-security-remediation`, commits `7a6e1b2` and `e57dbea`; local verification passing, not deployed |
| CI verification | Submitted `main` passed CI #21; the remediation PR is intentionally unmerged and requires review |

## Non-negotiable product definition

- Target: GenLayer Studionet, chain ID `61999`, RPC `https://studio.genlayer.com/api`.
- CLI: repository-local `genlayer` `0.39.1`; do not use a global CLI.
- Stack: Next.js App Router, TypeScript, injected EIP-1193 wallet, Merivox plus a contract-enforced Python ActionGate.
- No API backend, no database, no backend model or operator, no cron/queue, no private keys in browser source.
- No payment custody, no bonds, no token or asset allocation.
- An actual validator equivalence judgment must change the canonical ballot; one-wallet-one-vote and tallying are deterministic.
- `ACCEPTED` is provisional; `FINALIZED` requires successful execution and authoritative state readback.

## V1 user journey

1. An organizer signs a round creation transaction with a question, eligible roster, quorum and deadlines.
2. Members submit bounded, immutable alternatives, maximum one per wallet and eight per round.
3. Nominations close; anyone initiates the on-chain transition into reconciliation.
4. Validators independently interpret frozen proposals; one alternative is classified as materially equivalent to one canonical choice, distinct or ambiguous.
5. Unresolved/ambiguous items remain separately represented with visible uncertainty; they are **not** silently considered equivalent or definitely distinct.
6. A frozen ballot lists canonical choices, while retaining each original nomination and mapping.
7. Eligible wallets cast one on-chain vote each. A deadline and quorum are enforced by the contract.
8. Anyone may finalize. A unique winner, tie or no-quorum result is recorded deterministically.
9. The frontend reconstructs round, votes, mappings and history from final chain state.
10. Communities can create immutable spaces. A governed action round freezes an exact grant/revoke envelope; only the finalized Merivox contract can dispatch it to ActionGate, which verifies the current authorization before changing publisher state.

## Existing structure

- `contracts/merivox.py`: Intelligent Contract for immutable rounds, nominations, validator reconciliation, frozen ballots, voting and deterministic outcomes.
- `contracts/merivox_action_gate.py`: second Intelligent Contract for immediate-caller-authenticated publisher permissions and append-only announcements.
- `app/`: static Next.js routes for the landing, wizard, round workspace, alignment, ballot, outcome, activity and method.
- `components/ChoiceMap.tsx`: contract-backed Choice Map with explicit live, canonical and uncertain states; the home preview is labelled illustrative.
- `components/AppProviders.tsx`: injected-wallet state and network handling.
- `lib/chain.ts`: direct GenLayer client and transaction lifecycle helper with canonical readback.
- `docs/SPEC.md`: binding product semantics and state-machine requirements.
- `docs/ARCHITECTURE.md`: no-backend model and frontend design system.
- `docs/SECURITY.md`: threat model and invariants.
- `docs/THREAT_MODEL.md`: governed-action attack surfaces and mitigations.
- `docs/TEST_MATRIX.md`: required local, cross-contract, browser and live evidence matrix.
- `docs/DEPLOYMENT.md`: recorded deployment, lifecycle and browser evidence.
- `CODEX_BUILD_PROMPT.md`: instructions to complete, test, deploy and harden.

## Local setup (for Codex after auditing)

```bash
npm install
npm run network:check
npm run typecheck
npm run lint
npm run test
npm run build
```

The committed `package-lock.json` is used by the production build. The repository-local GenLayer CLI is pinned to `0.39.1`.

For contract verification:

```bash
python -m venv .venv
python -m pip install -r requirements-dev.txt
python -m pytest tests
```

The Direct Mode suite uses `genlayer-py==0.19.0rc2`, `genlayer-test==0.30.0rc2` and the official GenVM manager runner `v0.6.0-rc3` (the same versions pinned by CI). Run it with Python 3.12 or newer where those packages are available.

For local development, copy `.env.example` to `.env.local` and set the final address:

```
NEXT_PUBLIC_MERIVOX_CONTRACT=0x...
NEXT_PUBLIC_MERIVOX_ACTION_GATE=0x...
```

The browser never contains private keys, and no application backend or database is required.

## Evidence

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for exact deployment, source-parity, live lifecycle and verification evidence.

## Post-submission remediation

The remediation branch is a proposed replacement implementation, not a claim about the currently deployed bytecode. It prevents a unique-but-ineligible binding result from being labelled `APPROVED`, enforces exact typed action-envelope equality before validator-equivalent nominations merge, indexes announcements per community, reads all bounded pages and verifies publication by the finalized announcement ID. It also records the remaining development-tool audit limitations in [`docs/SECURITY.md`](docs/SECURITY.md).

No contract redeployment, Vercel configuration change or merge was performed. A replacement Merivox/ActionGate pair is required before the on-chain approval-state correction can exist in production; existing historical spaces, decisions and permissions would remain on the old pair and would need an explicit migration policy.

