# Merivox V1 verification matrix

| Layer | Coverage | Command or evidence | Status |
|---|---|---|---|
| Frontend type safety | TypeScript compilation | `npm run typecheck` | Passing |
| Frontend lint | ESLint | `npm run lint` | Passing |
| Frontend unit/model | 16 tests including bounded `RETRY_REQUIRED`, exact publication-ID readback, duplicate content and temporary-RPC failure handling | `npm run test` | Passing |
| Frontend production | Next.js build including `/community` and governed routes | `npm run build` | Passing |
| Network configuration | Studionet chain 61999 and RPC | `npm run network:check` | Passing |
| Contract static | Both contracts, public methods, no ActionGate admin grant | `pytest tests/test_contract_static.py` | Passing |
| Contract direct | Immutability, isolation, unauthorized gate calls and 26-space pagination | `pytest tests/test_contract_direct.py tests/test_security_remediation.py` | Passing |
| Cross-contract runtime | Grant, revoke, applied state, unauthorized publication, stale replay and 60 interleaved announcements | `pytest tests/test_cross_contract.py` | Passing |
| Governance remediation | Four-member approval thresholds, tie/no-quorum, uncertainty, unresolved nominations, expired grant, zero-expiry revoke and envelope conflicts | `pytest tests/test_security_remediation.py` | Passing; 16 focused tests |
| GenVM validation | Pinned Direct Mode and live receipt/schema validation | `GENVM_VERSION=v0.6.0-rc3 python -m pytest -q` | Passing; 31 tests; no separate `genvm-lint` binary exists in the pinned toolchain |
| Browser E2E | Premium routes, Choice Map, community publisher view and governed action readback | Computer Use against `https://merivox.vercel.app` | Passing for tested routes |
| Live Studionet grant | Grant, child application, authorized and unauthorized publication | `docs/LIVE_EVIDENCE.md`, round 1 | Passing |
| Live Studionet revoke | Revoke, child application and revoked publication rejection | `docs/LIVE_EVIDENCE.md`, round 2 | Passing |
| Dependency audit | Exact remediation lockfile, production/runtime scope separated from dev tooling | `npm audit --json`; `npm audit --omit=dev --json` | Production 0; dev-only 11 disclosed in `docs/SECURITY.md` |
| CI | Frontend and contract jobs on the submitted default branch | [Merivox CI #21](https://github.com/Bibidee/merivox/actions/runs/39670892329), commit `22a7c2a4c268955185d4cee57c767ca90c963091` | Passing |
| Remediation branch | Local build/test evidence before PR | `remediation/post-submission-security-remediation`, commits `7a6e1b2b06fc8183cd44cd2ae7b6ef0aeb849f32` and `e57dbeaa37e7d5a25e44d91cb604cde30c3379c5` | Passing locally; no deployment |

Mocked or compatible-runtime results are never represented as live GenLayer evidence. Every live claim includes a transaction hash, finality, canonical readback and source/deployment context.
