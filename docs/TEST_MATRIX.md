# Merivox V1 verification matrix

| Layer | Coverage | Command or evidence | Status |
|---|---|---|---|
| Frontend type safety | TypeScript compilation | `npm run typecheck` | Passing |
| Frontend lint | ESLint | `npm run lint` | Passing |
| Frontend unit/model | 19 tests including bounded `RETRY_REQUIRED`, exact publication-ID readback, duplicate content, temporary-RPC failure handling, governed lifecycle presentation and wallet rejection detail | `npm run test` | Passing |
| Frontend production | Next.js build including `/community` and governed routes | `npm run build` | Passing |
| Network configuration | Studionet chain 61999 and RPC | `npm run network:check` | Passing |
| Contract static | Both contracts, public methods, no ActionGate admin grant | `pytest tests/test_contract_static.py` | Passing |
| Contract direct | Immutability, isolation, unauthorized gate calls and 26-space pagination | `pytest tests/test_contract_direct.py tests/test_security_remediation.py` | Passing |
| Cross-contract runtime | Grant, revoke, applied state, unauthorized publication, stale replay and 60 interleaved announcements | `pytest tests/test_cross_contract.py` | Passing |
| Governance remediation | Four-member approval thresholds, tie/no-quorum, uncertainty, unresolved nominations, expired grant, zero-expiry revoke and envelope conflicts | `pytest tests/test_security_remediation.py` | Passing; 16 focused tests |
| GenVM validation | Pinned Direct Mode and live receipt/schema validation | `py -3.13 -m pytest -q tests` | Passing; 31 tests; no separate `genvm-lint` binary exists in the pinned toolchain |
| Browser E2E | Home, creator, community, round, Choice Map/alignment, ballot, outcome replay and activity directory at 375px, 390px, 768px and 1440px | Computer Use against `https://merivox.vercel.app`; all required production routes | Passing: no horizontal overflow; responsive permissions/announcements and route content rendered. One transient RPC read failure recovered on isolated retry; rejected-signature UI remains unexercised live |
| Wallet/adversarial review | Signing, submission, provisional acceptance, finality, verification, failure, indeterminate, duplicate-write guard, wrong-chain/account checks and refresh recovery | Source review, 19 frontend tests, controlled readback cases and `docs/SECURITY.md` | Passing for implemented fail-closed paths; no live wallet-rejection transaction was requested or claimed |
| Live Studionet grant | Grant, child application, authorized and unauthorized publication | `docs/LIVE_EVIDENCE.md`, round 1 | Passing |
| Live Studionet revoke | Revoke, child application and revoked publication rejection | `docs/LIVE_EVIDENCE.md`, round 2 | Passing |
| Dependency audit | Exact remediation lockfile, production/runtime scope separated from dev tooling | `npm audit --json`; `npm audit --omit=dev --json` | Production 0; dev-only 11 disclosed in `docs/SECURITY.md` |
| Historical CI | Frontend and contract jobs on the superseded default branch | [Historical CI #21](https://github.com/Bibidee/merivox/actions/runs/39670892329), commit `22a7c2a4c268955185d4cee57c767ca90c963091` | Passing; historical only |
| Production implementation CI | Frontend and contract jobs on the merged implementation | [CI #42](https://github.com/Bibidee/merivox/actions/runs/39776259796), commit `778489c93f3c9269b21e53c9ad7204b2706faf37` | Passing |
| Current main CI | Frontend and contract jobs on the documentation head | [CI #43](https://github.com/Bibidee/merivox/actions/runs/39777522684), commit `6b2d856b89d9fd9a4d54c53598c957bb8e45f955` | Passing |
| Final release branch | Local build/test and live release evidence | `main`, current head recorded in `HANDOFF_STATUS.md` | Passing; live final pair and both lifecycle paths verified |

Mocked or compatible-runtime results are never represented as live GenLayer evidence. Every live claim includes a transaction hash, finality, canonical readback and source/deployment context. Browser observations are release evidence, while transient RPC recovery and unexercised wallet rejection remain disclosed limitations.
