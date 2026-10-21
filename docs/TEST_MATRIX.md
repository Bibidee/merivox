# Merivox V1 verification matrix

| Layer | Coverage | Command or evidence | Status |
|---|---|---|---|
| Frontend type safety | TypeScript compilation | `npm run typecheck` | Passing |
| Frontend lint | ESLint | `npm run lint` | Passing |
| Frontend unit/model | 14 tests including bounded `RETRY_REQUIRED` readback | `npm run test` | Passing |
| Frontend production | Next.js build including `/community` and governed routes | `npm run build` | Passing |
| Network configuration | Studionet chain 61999 and RPC | `npm run network:check` | Passing |
| Contract static | Both contracts, public methods, no ActionGate admin grant | `pytest tests/test_contract_static.py` | Passing |
| Contract direct | Immutability, isolation and unauthorized gate calls | `pytest tests/test_contract_direct.py` | Passing |
| Cross-contract runtime | Grant, revoke, applied state, unauthorized publication and stale replay | `pytest tests/test_cross_contract.py` | Passing |
| GenVM validation | Pinned Direct Mode and live receipt/schema validation | `GENVM_VERSION=v0.6.0-rc3 python -m pytest -q` | Passing; no separate `genvm-lint` binary exists in the pinned toolchain |
| Browser E2E | Premium routes, Choice Map, community publisher view and governed action readback | Computer Use against `https://merivox.vercel.app` | Passing for tested routes |
| Live Studionet grant | Grant, child application, authorized and unauthorized publication | `docs/LIVE_EVIDENCE.md`, round 1 | Passing |
| Live Studionet revoke | Revoke, child application and revoked publication rejection | `docs/LIVE_EVIDENCE.md`, round 2 | Passing |
| CI | Frontend and contract jobs on the submitted default branch | [Merivox CI #20](https://github.com/Bibidee/merivox/actions/runs/39670667483), commit `42731ec1e20ee13874a9fd63c256c1d4fcfd2aac` | Passing |

Mocked or compatible-runtime results are never represented as live GenLayer evidence. Every live claim includes a transaction hash, finality, canonical readback and source/deployment context.
