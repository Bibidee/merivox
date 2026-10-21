# Merivox live evidence ledger

This ledger is intentionally conservative. It is updated only with receipts and canonical reads from the current two-contract source.

## Target

- Network: GenLayer Studionet, chain `61999`
- RPC: `https://studio.genlayer.com/api`
- CLI: repository-local `genlayer@0.39.1`
- Frontend: `https://merivox.vercel.app`

## Current release

Fresh deployment addresses, source hashes, parent/child transaction hashes and publication/revocation readbacks are recorded here after they are independently verified. Historical one-contract evidence in the prior deployment ledger is not reused as proof for this release.

## Required evidence rows

| Step | Contract/readback | Transaction | Finality | Source commit |
|---|---|---|---|---|
| Merivox deployment | pending | pending | pending | pending |
| ActionGate deployment | pending | pending | pending | pending |
| Reciprocal bootstrap binding | pending | pending | pending | pending |
| Community creation | pending | pending | pending | pending |
| Binding grant round and votes | pending | pending | pending | pending |
| Grant dispatch parent | pending | pending | pending | pending |
| Grant child applied | pending | pending | pending | pending |
| Authorized publication | pending | pending | pending | pending |
| Unauthorized publication rejection | pending | rejected as expected | n/a | pending |
| Revocation round and dispatch | pending | pending | pending | pending |
| Revoked publication rejection | pending | rejected as expected | n/a | pending |
| Delayed old grant replay | pending | `SUPERSEDED` | finalized | pending |

No row is complete until the receipt is `FINALIZED` and the expected contract state is read back.
