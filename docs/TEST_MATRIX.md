# Merivox V1 verification matrix

| Layer | Coverage | Command or evidence | Status |
|---|---|---|---|
| Frontend type safety | TypeScript compilation | `npm run typecheck` | Passing locally |
| Frontend lint | ESLint | `npm run lint` | Passing locally |
| Frontend unit/model | 14 tests including bounded retry readback | `npm run test` | Passing locally |
| Frontend production | Static Next.js build including `/community` | `npm run build` | Passing locally |
| Network configuration | Studionet chain 61999 and RPC | `npm run network:check` | Passing locally |
| Contract static | Both contracts, public methods, no ActionGate admin grant | `pytest tests/test_contract_static.py` | Passing locally |
| Contract direct | Immutability, isolation and unauthorized gate calls | `pytest tests/test_contract_direct.py` | Passing locally |
| Cross-contract compatible runtime | Grant, revoke, applied state, unauthorized publication and stale replay | `pytest tests/test_cross_contract.py` | Passing locally |
| GenVM semantic validation | Official linter/validator availability and output | Repository-local CLI check | Record exact result in release ledger |
| Browser E2E | Existing premium routes plus community/publisher views | Production browser session | Record exact result in release ledger |
| Live Studionet | Two-contract deployment and grant/revoke lifecycle | Repository-local CLI `0.39.1` | Pending fresh deployment evidence |

Mocked or compatible-runtime results are not represented as live GenLayer evidence. Every live claim must include transaction hash, finality, canonical readback and source commit.
