# Merivox V1 verification matrix

| Layer | Coverage | Command or evidence | Status |
|---|---|---|---|
| Frontend type safety | TypeScript compilation | `npm run typecheck` | Passing |
| Frontend lint | ESLint | `npm run lint` | Passing |
| Frontend unit/model | 18 tests including bounded `RETRY_REQUIRED`, exact publication-ID readback, duplicate content, temporary-RPC failure handling and governed lifecycle presentation | `npm run test` | Passing |
| Frontend production | Next.js build including `/community` and governed routes | `npm run build` | Passing |
| Network configuration | Studionet chain 61999 and RPC | `npm run network:check` | Passing |
| Contract static | Both contracts, public methods, no ActionGate admin grant | `pytest tests/test_contract_static.py` | Passing |
| Contract direct | Immutability, isolation, unauthorized gate calls and 26-space pagination | `pytest tests/test_contract_direct.py tests/test_security_remediation.py` | Passing |
| Cross-contract runtime | Grant, revoke, applied state, unauthorized publication, stale replay and 60 interleaved announcements | `pytest tests/test_cross_contract.py` | Passing |
| Governance remediation | Four-member approval thresholds, tie/no-quorum, uncertainty, unresolved nominations, expired grant, zero-expiry revoke and envelope conflicts | `pytest tests/test_security_remediation.py` | Passing; 16 focused tests |
| GenVM validation | Pinned Direct Mode and live receipt/schema validation | `GENVM_VERSION=v0.6.0-rc3 python -m pytest -q` | Passing; 31 tests; no separate `genvm-lint` binary exists in the pinned toolchain |
| Browser E2E | Premium routes, Choice Map, community workspace, roster permission view, governed-round history and governed action readback | Computer Use against the local final-readiness build with the historical verified pair; read-only comparison against `https://merivox.vercel.app` | Passing for tested routes; no wallet or write transaction |
| Live Studionet grant | Grant, child application, authorized and unauthorized publication | `docs/LIVE_EVIDENCE.md`, round 1 | Passing |
| Live Studionet revoke | Revoke, child application and revoked publication rejection | `docs/LIVE_EVIDENCE.md`, round 2 | Passing |
| Dependency audit | Exact remediation lockfile, production/runtime scope separated from dev tooling | `npm audit --json`; `npm audit --omit=dev --json` | Production 0; dev-only 11 disclosed in `docs/SECURITY.md` |
| CI | Frontend and contract jobs on the historical default branch | [Historical CI #21](https://github.com/Bibidee/merivox/actions/runs/39670892329), commit `22a7c2a4c268955185d4cee57c767ca90c963091` | Passing |
| Final-readiness CI | Frontend and contract jobs on PR #2 current head | [CI #25](https://github.com/Bibidee/merivox/actions/runs/39748228616), commit `5eef3f08cff9b64f6a693a433f8f898d5fcf5384` | Passing |
| Final-readiness branch | Local build/test evidence before release review | `remediation/post-submission-security-remediation`, final commit `2aee80e5a30096c312c8453df2edbeaf44929a4f`, with hardening and dependency commits preserved | Passing locally; no deployment |

Mocked or compatible-runtime results are never represented as live GenLayer evidence. Every live claim includes a transaction hash, finality, canonical readback and source/deployment context.
