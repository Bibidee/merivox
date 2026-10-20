# CODEX EXECUTION PROMPT — MERIVOX V1 FULL BUILD

You are receiving the **Merivox V1 partial source handoff**. Your job is to independently inspect, complete, harden, test, deploy and verify the entire product through a genuine live GenLayer lifecycle, leaving an original, production-quality frontend and submission-ready repository.

**This is not an invitation to redesign the product.** The user has already chosen Merivox: a collective decision application that reconciles materially equivalent member proposals before the group votes. Treat `docs/SPEC.md`, `docs/ARCHITECTURE.md` and the product rules below as authoritative. Where existing starter code is incomplete or defective, fix it. Do not preserve bugs merely because they were supplied in the ZIP.

## A. HARD BOUNDARIES

- Product name: **Merivox** only. Repository, UI, docs, tests and demo must contain no names or references to unrelated prior projects. No comparative or brainstorming history in the finished documentation.
- Network: **GenLayer Studionet, chain ID 61999**.
- RPC: **https://studio.genlayer.com/api**.
- Toolchain: repository-local **genlayer CLI 0.39.1**. Do not use globally installed tools, newer RC packages or substitute chains.
- Frontend: **Next.js App Router + TypeScript** with static-compatible routes and a unique, premium, responsive UI.
- Wallet: ordinary **injected EIP-1193** (MetaMask, Rabby). No browser snaps, browser-generated private signing keys, embedded keys, custody or backend signing service.
- Architecture: **frontend → injected wallet → ONE GenLayer Intelligent Contract → validator consensus / deterministic state → frontend**.
- **NO APPLICATION BACKEND**: no Supabase, Firebase, Cloudflare Workers, Express, Railway, database, server API, server actions that decide outcomes, cron, queues, centralized AI or trust-bearing off-chain operator.
- **NO FINANCIAL CUSTODY**: no escrow, tokens, liquidity, rewards, bonds or payout logic. Any necessary GenLayer transaction fees are normal chain fees, not project custody.
- Do not mark `ACCEPTED` as final. Do not claim a release is finished on a demo, mock, unit test or deployment alone.
- Do not invent on-chain addresses, CI results, transaction hashes, timestamps or hosted URLs.
- If a transaction requires the human's injected-wallet confirmation, use computer/browser interaction up to that exact point and request the human to sign. Do not use their secrets. Continue all non-human steps normally.

## B. READ WHAT ACTUALLY EXISTS

This archive is a PARTIAL STARTER, not a finished system.

Already authored: original landing design, Choice Map illustration, guided round creation screen, round/nomination workspace, wallet and transaction starter, activity and method pages, incomplete alignment/ballot/outcome screens, partial Python contract supporting create/nominate/begin alignment/read operations, static checks and documentation.

NOT implemented: **semantic validator consensus, canonical choice assignment, alignment timeout fallback, frozen ballot, actual voting, deterministic results, correct read APIs for all states, Direct Mode suite, end-to-end browser verification, hosted deployment**.

Do not confuse provisional UI placeholders with live network data. Replace all incomplete stage pages with genuine chain-backed functionality before release. Treat `lib/chain.ts` as unaudited: SDK compatibility, receipts, failures and readback must be verified, not assumed correct. The existing contract may need method signatures or data-structure corrections to run with the pinned toolchain.

Start by inspecting every repository file, original UI, config, contract, tests and docs. Create a gap report and implementation plan, then execute it. Keep design choices consistent across frontend, contract, tests and documentation.

## C. BINDING PRODUCT SEMANTICS

**Problem:** Similar descriptions of the same actionable proposal can fragment support across ballot choices; a central organizer can manipulate ballot merging.

**Primary users:** Small groups with a known public wallet roster and repeated collective decisions.

**Core product loop:**
1. Organizer creates a decision round with immutable question, roster (3–25 unique wallets including organizer), quorum and future deadlines.
2. Eligible members nominate immutable actionable alternatives (1 nomination per eligible wallet, max 8 per round).
3. At nomination deadline, anyone enters independent reconciliation.
4. GenLayer validators independently judge candidate alternatives against frozen canonical choice anchors, returning a narrow consensus-critical classification.
5. Equivalent proposals share a canonical ballot choice; distinct proposals become new choices; ambiguous/unresolved proposals remain separate and visibly marked, never fabricated as equivalent or confidently distinct.
6. The canonical ballot freezes BEFORE voting. No later merge or alteration is allowed.
7. Each eligible wallet casts precisely one on-chain vote for a valid canonical choice before the voting deadline.
8. After voting deadline, anyone finalizes deterministic result: `DECIDED`, `TIED` or `NO_QUORUM`.
9. Public views preserve original proposals, resolved mappings, participation, result and transaction provenance. Users return to create other rounds.

The AI does NOT choose the winner, rank the proposals, determine eligible voters, count votes, resolve ties or promise delivery of the winning proposal.

**Material equivalence, not topic similarity:** A workshop and a hackathon on the same topic are not equivalent. Audience, action, deliverable, timeframe and binding conditions are all material. If substituting one proposal for the other changes the action the group approves, classify `DISTINCT` or `AMBIGUOUS`, not `EQUIVALENT`.

**Consensus-critical classification:** `EQUIVALENT` (with EXACTLY ONE valid existing canonical choice ID), `DISTINCT` (new canonical choice) or `AMBIGUOUS` (new separate option with uncertainty marker). Invalid JSON/schema, nonsensical IDs, contradictory results and genuinely unavailable model output must not fabricate decisions.

Validator functions MUST independently reproduce the meaningful interpretation, not simply accept a leader's model response. Use normalized classification and referenced choice ID as the comparison identity, excluding stylistic prose. Use bounded prompts and exact schema checks. Consider malicious wording in nominations as UNTRUSTED DATA; keep system instructions outside participant-controlled text. Do not follow external links or execute embedded instructions. Consult actual GenLayer stable runtime APIs for `run_nondet_unsafe` on Studionet 61999 and pin compatible versions.

**Transitivity attack:** Do not let the assignment of an alias change the canonical comparison anchor. A may be equivalent to B, B to C, but A to C need not be equivalent. Compare against frozen canonical anchors, not arbitrarily inherited aliases. If a candidate plausibly maps to multiple anchors, explicitly `AMBIGUOUS`, never choose by random order.

## D. CONTRACT WORK — ONE INTELLIGENT CONTRACT

Complete `contracts/merivox.py` after verifying its runtime/storage compatibility.

Required state:
- Round identity, immutable question/roster/quorum/deadlines and status.
- Original nomination identity and full frozen fields.
- Canonical ballot choices; each choice has an immutable anchor and an array of original nomination IDs.
- Individual final assignment/judgment and any bounded unresolved attempt metadata.
- Voting record keyed by round and wallet, deterministic counts per canonical choice, voting participation count.
- Final terminal outcome, winner if unique, all ties if applicable, timestamps.
- Paginated indexes and read methods, bounded to avoid storage/read blowup.

Required writes:
- Create round, nominate, begin alignment, reconcile next pending nomination, close/timed-out reconciliation safely, open frozen ballot, vote, finalize, pre-nomination cancel where justified.

Required reads:
- Read round/participants, paginated nominations, canonical ballot with all original mappings, reconciliation progress/last outcome, eligibility/voted state, tally, result and paginated public rounds.

Invariants to prove:
- Only roster members nominate/vote; creator is on immutable roster.
- One nomination and one vote per wallet per round.
- Exactly one assignment for every submitted alternative before ballot freeze, or an explicit conservative unresolved fallback.
- Every non-unknown assignment is valid; aliases are retained and traceable.
- Canonical anchors and frozen ballot cannot be modified once voting begins.
- No late nomination, early vote, post-deadline vote, invalid choice vote, repeated finalization, privilege override or replay.
- Vote totals sum to actual distinct voting wallets.
- `NO_QUORUM` when turnout is too low. No AI tie-breaking.
- All terminal results immutable.
- Timeouts and retries must not lead to indefinite lock, arbitrary forced merges or a concealed trusted operator.
- Snapshot/deadline alignment window leaves a practical voting window. Define and test exact boundary times; fail early at round creation if not enough time is available.

Question the starter's use of date APIs, storage serialization, address representations, Map/DynArray behavior and returned values. Correct them where actual Direct Mode evidence demands. Never use an unreviewed contract merely because it parses as Python.

## E. FRONTEND — VISUAL QUALITY IS A RELEASE BLOCKER

Do not replace the current Merivox visual direction with a generic Web3 dashboard. The approved visual concept is **The Decision Studio**: luminous white background, electric blue, soft lemon, pale mint, dark navy; premium typography, human-centered wording, ample whitespace, carefully restrained motion and a product-specific visual system.

The **Choice Map** is the signature interaction. Turn the current illustrative component into a polished, truthful visualization of ORIGINAL nominations → consensus-confirmed canonical groupings → frozen ballot. Each mapped canonical choice expands to show every original alternative, attribution, material context and applicable interpretation status. `AMBIGUOUS` and `UNRESOLVED` must be visually distinct from confirmed matching. Never let visual dragging alter contract authority.

Required routes (static-export compatible):
- `/` Discover / product identity / recent real rounds.
- `/new` guided creation wizard with validation, fixed roster and clear immutable preview.
- `/round?id=...` actual round and nomination workspace.
- `/align?id=...` real reconciliation status, confirmations, retry/timeout and grouping visualization.
- `/ballot?id=...` usable authentic frozen choices with eligibility and one-vote interaction.
- `/outcome?id=...` accurate results, quorum, ties and original-to-final mapping.
- `/activity` searchable/paginated public rounds if feasible without an indexer.
- `/method` precise trust boundary and GenLayer explanation.

Deep links and refresh must work on static deployment. Prefer direct contract reads with bounded pagination and modest caching; never assume local storage is canonical state.

Premium UX requirements:
- 320px to ultrawide layouts, touch targets >=44px, no horizontal scroll, keyboard navigation, visible focus and reduced-motion support.
- Clear, contextual primary actions with no dead buttons; labels explain user impact.
- Full wallet connect/disconnect, provider changes, wrong-network detection, switching to 61999, signature rejection and unauthorized-action explanations.
- Transaction phases: `SIGNING`, `SUBMITTED`, `ACCEPTED (provisional)`, `FINALIZED`, `FAILED`, `UNDETERMINED`. Maintain explorer links and recover after refresh. Only display product success after FINALIZED and fresh canonical contract readback, not only transaction hash submission.
- Honest empty states, loading/skeletons, source/RPC unavailable, deadline elapsed but on-chain transition not executed, stale data, one vote already cast and quorum/tie outcomes.
- Do not claim that wallet votes are private. Show that one eligible address ≠ one unique person.
- Illustrative brand graphics may remain if visibly labelled; NEVER show fake votes, consensus or transaction data in a live context.
- Verify actual desktop/mobile interfaces in a browser and fix visual/functional problems. Avoid pixel overlap and layout jumps.

## F. TOOLCHAIN AND TESTS

Run installation for real and commit package lock. Verify `npx genlayer --version` resolves to **local 0.39.1**. Never silently upgrade. Check GenLayer stable package and SDK compatibility, including the exact receipt API available for Studionet.

Run and record actual results for:
- `npm run network:check`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- GenVM contract lint on the final contract
- Python GenLayer Direct Mode contract suite (install from pinned requirements, adjust only for justified compatibility)
- Browser automation and real frontend-to-contract integration tests

Write meaningful tests, not inflated totals. At minimum cover:
1. Valid round creation and frozen roster/quorum/deadlines.
2. Duplicate wallet, malformed address, missing creator and invalid quorum refusal.
3. Nonmember nomination refused; one nomination per wallet.
4. Nomination size limits, deadline boundaries and max eight alternatives.
5. Successful semantically equivalent grouping.
6. Genuinely distinct alternative grouping.
7. Ambiguous, multiple-match and transitivity adversaries.
8. Validator disagreement, malformed model output and bounded retry.
9. Reconciliation cooldown, timeout fallback, failure recovery.
10. Exact membership, ballot freeze and no merge after voting begins.
11. Invalid vote, double vote, nonmember vote and expired vote refused.
12. Equal tallies yield TIED, not an AI-chosen winner.
13. Missing quorum produces NO_QUORUM; turnout conservation holds.
14. Terminal-state immutability, replay, unauthorized writes.
15. Two wallets and account switching, injected provider events.
16. Wrong network and rejected wallet signature.
17. SUBMITTED / ACCEPTED / FINALIZED / failure / indeterminate display.
18. Refresh during transaction and canonical state reconstruction.
19. Query-route deep linking on production static frontend.
20. Mobile, desktop, accessibility basics and browser console.

Use proper browser automation with real app interactions rather than screenshot-only claims. Tests against mocks must be explicitly labeled, and live chain proofs must be clearly separated.

## G. REAL STUDIONET DEPLOYMENT

ONLY once the contract and all local verification are sound, deploy the FINAL audited contract source to Studionet **61999** using the pinned local CLI. Do not deploy an older file. Track lifecycle honestly; capture final address, deploy transaction, explorer URL, deployed source SHA-256, exact matching local source hash and Git commit. Any post-deployment contract source change requires a new deployment and evidence update.

Configure the frontend public contract address to that FINAL deployment, rerun all checks, then deploy frontend to Vercel. Browse the deployed application, not only the local build. Verify 61999, wallet, all routes, on-chain data, transaction statuses, mobile layout and no serious browser errors.

Use the human's wallet for required signing interactions, never an assistant-invented private key or insecure signer. Stop at the exact needed wallet confirmation if unavoidable; do not invent results.

### Required live lifecycle evidence

A. **Equivalent mapping:** create round, nominate two materially equivalent alternatives plus a genuinely distinct third, reconcile via actual validators, freeze ballot, cast real votes, finalize unique winner. Capture all relevant transaction hashes and actual final state.

B. **Distinct and uncertain:** demonstrate a distinct interpretation plus an `AMBIGUOUS` or genuinely unresolved path, if deterministically reproducible; otherwise disclose what was only Direct Mode-tested.

C. **Safety:** demonstrate unauthorized/double vote rejections, tie and no-quorum outcomes through live tests where practical, or disclose why live testing is incomplete.

Do not manufacture live outcomes to fill the evidence checklist. If insufficient wallets are available, perform everything possible and list the exact manual transactions required.

## H. DOCUMENTATION, VERSION CONTROL AND HOSTILE AUDIT

All project docs must describe **Merivox only** and reflect final code. Remove speculation, comparisons with other projects, brainstorm remnants, bogus “production” claims and unsupported references. The final README should explain: problem, validator necessity, semantic equivalence limitations, one-contract backendless architecture, network/toolchain, wallet model, routes, exact state machine, test instructions, deployment, live evidence and known limitations.

Do not commit secrets, private keys, seed phrases, `.env.local`, build outputs or caches. Use a clean Git repository, coherent commits and relevant CI workflow under `.github/workflows/` (actual GitHub Actions discovery path). Push to a newly created Merivox repository only when access and user permissions allow. Final branch/merge status must be accurately reported.

Before calling the product ready, independently rerun a hostile audit:
- Check toolchain/network across the complete source tree (no chain substitution or unsupported SDK API).
- Check no hidden backend/central signer or organizer-controlled adjudication.
- Ensure the only AI judgment is substantive and validators reproduce it.
- Attempt semantic merge manipulation, multi-match and prompt injection.
- Attempt role bypass, double nomination/vote, wrong choice, early/late actions, replay and terminal-state writes.
- Verify result tally, quorum, tie behavior and uncertainty disclosures.
- Verify frontend contract bindings and deployed source parity.
- Verify ACCEPTED is never described as final and returning user sees canonical state.
- Confirm all visible “live” claims correspond to actual live evidence.
- Confirm repository docs and UI mention **Merivox only**, apart from necessary third-party technology names such as GenLayer and wallet providers.

Fix material defects and rerun all affected suites.

## I. FINAL OUTPUT FORMAT

Return:

### Final Product
What Merivox now genuinely does.

### Architecture
Exact frontend and contract structure, proof there is no application backend.

### GenLayer Judgment
The substantive validator decision, normalization, comparison logic and uncertainty behavior.

### Repository
URL, branch, exact commit, PR/merge status, CI evidence.

### Toolchain and Network
Versions actually used, exact RPC, chain 61999, local CLI 0.39.1.

### Contract
Final address, deployment transaction, finality, explorer URL.

### Source Integrity
Exact deployed Python source SHA-256 and matching Git commit/source bytes.

### Tests
Every suite actually run and its result, including known skips and failed cases.

### Live Lifecycle Evidence
Real round IDs, nomination IDs, classification results, on-chain votes, outcome and transaction hashes.

### Frontend
Production Vercel URL, page-level and wallet-level browser checks including mobile.

### Security and Network Audit
Concrete invariants tested, network contamination search results and any unresolved risks.

### Documentation Hygiene
Confirm all unrelated project names removed and all docs truthfully describe Merivox.

### Known Limitations
Only genuine, material remaining limitations.

### Manual Actions Required
Precisely what the human must do, and nothing speculative.

### Final Status
Exactly one of: `COMPLETE`, `COMPLETE WITH MANUAL ACTION`, or `NOT COMPLETE`.

**Do not claim COMPLETE until actual deployment, frontend integration and a real GenLayer lifecycle have been verified.**
