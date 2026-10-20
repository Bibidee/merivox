# Merivox architecture and UI design

## Architecture

Browser-served Next.js App Router static export → injected EIP-1193 wallet → GenLayer Studionet 61999 → one Python Intelligent Contract → validator semantic judgment and deterministic storage → direct contract reads → browser-rendered result.

No custom server, hosted database, API route, server action deciding outcomes, indexing authority, cron, external AI proxy or private-key-managed service. Local storage may remember transaction hashes or UI preferences only; canonical data comes from finalized contract state.

## UI identity

A bright premium “Decision Studio” identity with electric blue `#315AF5`, lemon `#FFE36A`, cloud white `#F7F9FD`, deep navy `#172840` and fresh mint `#B7EFDB`. Use bold editorial sans typography, large typographic scales, spacious navigation and subtle semantic motion. No heavy neon, financial-dashboard chrome, random stat blocks or oversized technical jargon.

## UX signature

The Choice Map shows separate participant nominations becoming canonical choices. It is a **visualization of finalized mappings**, not a drag interface that could change canonical equivalence. Preserve original submissions visibly under each canonical ballot choice. Ambiguous or inconclusive classifications receive explicit marks and their own selectable choices.

## Routes

- `/`: Decision Floor with the original premium identity, live recent rounds and a clearly labelled Choice Map concept preview.
- `/new`: Three-step creator wizard with live unsigned preview.
- `/round?id=123`: View original nominations and round state, submit a nomination if eligible.
- `/align?id=123`: Inspect real validator consensus, canonical assignments and explicit uncertainty.
- `/ballot?id=123`: Display frozen choices and cast one vote if eligible.
- `/outcome?id=123`: Deterministic tally, quorum, tie and provenance replay.
- `/activity`: List actual public rounds from contract.
- `/method`: Transparent semantics and trust limitations.

The query-parameter pattern supports static export; browser reads do not rely on runtime Next server dynamic routes. Production navigation must restore full state on refresh.

## Engineering priorities

1. Typed encoding/decoding of GenLayer contract returns and stable compatible client versions.
2. Wallet connect, disconnect, account changes and wrong-chain behavior.
3. Transaction readback after actual FINALIZED, not merely accepted.
4. Correct visibility of round eligibility, deadlines and response errors.
5. Chain-backed voting, alignment and outcome components; no fabricated example data in live views.
6. Responsive 320px to ultrawide layouts; semantic contrast, keyboard focus, reduced motion and no horizontal overflow.
7. Proper WCAG-oriented testing, automated browser coverage, and source parity against deployed contract.

## Verification state

Live Choice Maps are reconstructed from finalized contract reads. Illustrative content is labelled as a concept preview and is never used as live round state. The transaction helper distinguishes signing, submission, provisional acceptance, finality, failure and indeterminate states; writes require an injected wallet and chain `61999`.
