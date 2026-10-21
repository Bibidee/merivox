# Merivox — The Decision Studio

**Production V1 — GenLayer Studionet 61999**

Merivox is a backendless GenLayer application for forming more representative community ballots. Eligible members propose actionable alternatives; independent validators will classify whether those alternatives are materially equivalent before the ballot freezes. Members, not AI, vote on the final choices.

## Current status

The remediation release is deployed at [merivox.vercel.app](https://merivox.vercel.app) against a byte-for-byte verified Studionet contract. Fresh live CLI evidence records genuine `EQUIVALENT`, `DISTINCT` and `AMBIGUOUS` validator classifications, four votes, and terminal `DECIDED` readback; remaining limitations are browser interaction coverage. The architecture remains backendless: the browser reads and writes the contract directly through an injected EIP-1193 wallet.

| Area | Status |
|---|---|
| Decision Studio frontend and Choice Map | Redesigned, responsive and deployed |
| Guided decision creator and wallet gating | Implemented against the live contract ABI |
| Validator-backed semantic reconciliation | Implemented with conservative uncertainty/fallback behavior |
| Frozen ballot, voting, quorum and tie result | Implemented and covered by Direct Mode tests |
| Historical Studionet lifecycle evidence | Live round `1` finalized a tie; later validator calls required explicit fallback |
| Remediation release | Deployed with exact source parity; live alignment, voting and terminal result evidence recorded |

## Non-negotiable product definition

- Target: GenLayer Studionet, chain ID `61999`, RPC `https://studio.genlayer.com/api`.
- CLI: repository-local `genlayer` `0.39.1`; do not use a global CLI.
- Stack: Next.js App Router, TypeScript, injected EIP-1193 wallet, one Python Intelligent Contract.
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

## Existing structure

- `contracts/merivox.py`: Intelligent Contract for immutable rounds, nominations, validator reconciliation, frozen ballots, voting and deterministic outcomes.
- `app/`: static Next.js routes for the landing, wizard, round workspace, alignment, ballot, outcome, activity and method.
- `components/ChoiceMap.tsx`: contract-backed Choice Map with explicit live, canonical and uncertain states; the home preview is labelled illustrative.
- `components/AppProviders.tsx`: injected-wallet state and network handling.
- `lib/chain.ts`: direct GenLayer client and transaction lifecycle helper with canonical readback.
- `docs/SPEC.md`: binding product semantics and state-machine requirements.
- `docs/ARCHITECTURE.md`: no-backend model and frontend design system.
- `docs/SECURITY.md`: threat model and invariants.
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

The Direct Mode suite uses the pinned `genlayer-py==0.16.3` and `genlayer-test==0.29.2` environment. Run it with Python 3.12 or newer where those packages are available.

For local development, copy `.env.example` to `.env.local` and set the final address:

```
NEXT_PUBLIC_MERIVOX_CONTRACT=0x...
```

The browser never contains private keys, and no application backend or database is required.

## Evidence

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for exact deployment, source-parity, live lifecycle and verification evidence.

