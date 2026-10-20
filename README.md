# Merivox — The Decision Studio

**SOURCE HANDOFF / PARTIAL IMPLEMENTATION / NOT DEPLOYMENT-READY**

Merivox is a backendless GenLayer application for forming more representative community ballots. Eligible members propose actionable alternatives; independent validators will classify whether those alternatives are materially equivalent before the ballot freezes. Members, not AI, vote on the final choices.

## Status of this handoff

This archive contains an original Next.js App Router + TypeScript interface and an initial Python Intelligent Contract. It is meant for Codex to audit and complete, **not to deploy unchanged**.

| Area | Status |
|---|---|
| Original visual system, landing page, Choice Map | Source implemented; runtime build not verified here |
| Guided decision creator | UI implemented; writes mapped to existing starter method; not live-tested |
| Wallet connect, disconnect and chain awareness | Source implemented; not browser-tested |
| Transaction dock | Source implemented; finality integration requires audit |
| Round and nomination pages | Source implemented; not live-tested |
| Deterministic contract registration and nomination | Initial source implemented; Direct Mode not run here |
| Validator-backed semantic reconciliation | **NOT IMPLEMENTED** |
| Frozen canonical ballot, voting and result | **NOT IMPLEMENTED** |
| Hosted testnet lifecycle proofs | **NOT RUN** |
| GitHub, Vercel, actual deployment | **NOT PERFORMED** |

Everything missing is a launch blocker. Do not claim completion until the full build prompt is executed and evidence has been recorded.

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

- `contracts/merivox.py`: partial contract for round creation, nominations and entering reconciliation.
- `app/`: static Next.js routes for the landing, wizard, round workspace, alignment, ballot, outcome, activity and method.
- `components/ChoiceMap.tsx`: original responsive visual demonstration. Explicitly **illustrative**.
- `components/AppProviders.tsx`: injected-wallet state; **audit and test** before production.
- `lib/chain.ts`: direct GenLayer client and transaction lifecycle helper; **audit SDK compatibility, receipt interpretation and canonical readback**.
- `docs/SPEC.md`: binding product semantics and state-machine requirements.
- `docs/ARCHITECTURE.md`: no-backend model and frontend design system.
- `docs/SECURITY.md`: threat model and invariants.
- `docs/DEPLOYMENT.md`: real-evidence checklist, empty until proven.
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

The package lockfile is not included because npm registry access was unavailable in the handoff environment. Generate and commit `package-lock.json` through a genuine `npm install` in the build environment; do not claim dependencies were installed here.

For contract verification:

```bash
python -m venv .venv
python -m pip install -r requirements-dev.txt
python -m pytest tests
```

Only static Python checks are bundled initially. Codex must add and run comprehensive GenLayer Direct Mode tests. These existing commands are not evidence that the current contract can be deployed.

Copy `.env.example` to `.env.local` and set a real **final** address only after source verification and deployment:

```
NEXT_PUBLIC_MERIVOX_CONTRACT=0x...
```

The current zero address is deliberately non-operational. Static pages display a prominent predeployment notice; mock consensus and voting may not be presented as real.

## What is not yet decided

The exact validator prompt, full semantic comparison implementation, consensus recovery logic and finalized ballot/vote storage need a hostile audit and completed implementation. Keep the narrow equivalence criteria and conservative uncertainty model in `docs/SPEC.md` rather than expanding into unrelated product features.

## Deployment evidence

There is **no** deployed contract address, finalized on-chain lifecycle, GitHub repository, completed CI run or production Vercel URL for this handoff. Fill `docs/DEPLOYMENT.md` with actual evidence after successful verification; never invent values.
