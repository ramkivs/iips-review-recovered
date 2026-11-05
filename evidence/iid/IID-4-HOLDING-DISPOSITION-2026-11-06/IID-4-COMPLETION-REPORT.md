# IID-4 — Holding Disposition: completion report

**Phase:** IID-4 (holding disposition / IID-02) · **Date:** 2026-11-06 · **Repository:** `ramkivs/iips-review-recovered`
**Branch:** `arena/c39a5d68-iips-review-recovered` · **Base:** `origin/main` = `d37ac14` (PR #468, merged
2026-11-05T20:00:01Z)
**Feature commit:** `3bc70c3` · **Pull request:** [#471](https://github.com/ramkivs/iips-review-recovered/pull/471)
**Independent verification:** fresh clone of the branch at `3bc70c3` — see §9 and `INDEPENDENT-VERIFICATION.md`.

---

## 1. Outcome

Every assessable subject now carries a decision-support disposition: **RETAIN / ACCUMULATE / REDUCE / AVOID** for a
held position, **INITIATE / WATCH / AVOID_CANDIDATE** for a candidate. Each carries a rationale with counter-arguments
and falsifiers, named gate outcomes, applied limits with their provenance, and a portfolio implication that states
what it is not. Subjects the evidence cannot support get a **withheld** disposition naming exactly what was missing —
never a weak verdict, never a fabricated holding, never a zero standing in for an unknown.

Nothing in the phase can execute. There is no order, size, price, timing or brokerage field anywhere in the payload or
the surface, and a test walks the payload to prove it.

**IID-5 (change intelligence / ★M-2) — NOT STARTED. IID-6 (product surface / ★M-3) — NOT STARTED.**

## 2. What was built

### 2.1 Engine — `iips-platform/src/investment/disposition/` (pure; no I/O, clock, network or store)

| Module | Responsibility |
|---|---|
| `types.ts` | the payload contract (`disposition-engine/1.0.0`), the subject union, gate ids, closed withholding vocabulary |
| `policy.ts` | thresholds (MoS +15 / −5 / −10 / −25 points), hysteresis (5 pp MoS, 2 pp weight-vs-cap), verb adequacy and horizon, gate-failure reasons |
| `limits.ts` | `SYSTEM_DEFAULT` and `OPERATOR_CONFIG` limits, strict parse, effective dating, digest, cap evaluation |
| `subject.ts` | `HELD` (derived `positionKey`, observations required) and `CANDIDATE` (no position facts, `quantities: NOT_APPLICABLE`), chain-scope agreement |
| `gates.ts` | G-1 … G-6 in order; the first failure decides and later gates are `SKIP` with a stated reason |
| `verbs.ts` | the R-9 selector, downward-only caps, hysteresis last, with a `decisionPath` |
| `portfolioImplication.ts` | R-10 bands and projected exposures; `null` band for AVOID and WATCH |
| `rationale.ts` | claims, counter-arguments, falsifiers, synthesised portfolio/limits evidence |
| `engine.ts` | `buildDispositionPayload`, facts derivation, disqualifiers, integrity refusals, citation closure |

### 2.2 Composition, persistence and transport — `frontend/server/investment/`

| Module | Responsibility |
|---|---|
| `dispositionComposition.ts` | payload → canonical `ReportContent` for `investment.holding-disposition`; stable-only parameters; verb, digests, limits and assessment reference in provenance |
| `dispositionService.ts` | `record` / `readHolding` / `readCandidate` / `listPortfolio` over the existing artifact service; fail-closed limits resolution |
| `portfolioContext.ts` | the context block built from the existing portfolio read model: weights reused, unmeasured weight disclosed, sector coverage disclosed, no fabricated scores |
| `disposition-transport.ts` | three GET/HEAD routes; 405 before owner or store; sanitized fail-closed bodies |
| `cli/disposition-demonstration.ts` | the operator path, with eight verification points |
| `investmentArtifacts.ts` **(extended)** | a shared `recordComposed` path; `recordAssessment` and `recordDisposition` are two entry points to it |
| `iips-platform .../scopeToken.ts` **(extended)** | `hd` and `hc` are both admissible prefixes for the disposition report type |

## 3. Design decisions, and why

1. **Gate order is an order, not a checklist.** `evaluateGates` derives `failedGate` from the recorded outcomes, turns
   every later gate into `SKIP` with `not adjudicated: <gate> failed first`, and restricts `withheld.reasons` to the
   first failing gate. A withheld disposition therefore names one cause. Before this change the reason list named
   every downstream failure, which read like five problems when there was one.
2. **Cap evaluation happens at the band the evidence would support, before caps clamp it.** Clamping the band first
   made the sector cap unreachable by construction — a test would have passed while proving nothing. The band is now
   the evidence's own implication; the cap is recorded in `limits.applied` and in `deltaNotes` as the binding
   constraint when it binds.
3. **Units are converted once, at one boundary.** The IID-2 payload stores `mosVsMid` and `roicSpread` as fractions;
   every disposition threshold is in percentage points. `deriveFacts` converts, with the conversion written down
   where it happens. (A probe caught the alternative: `−0.6455` read as −0.65 *points* would have dispositioned a
   64 % premium as roughly fair.)
4. **Trend direction is read from period order, not array position.** The payload's annual series is newest-first; an
   `[n-1] < [n-2]` comparison therefore reads the oldest pair and reported a company growing 30 %/yr as declining.
   `ascendingPeriods` sorts by `periodEnd` and the reason is in the comment.
5. **Citation closure is enforced, not assumed.** Any rationale citation the assessment does not cover is synthesised
   as a labelled `disposition/rationale-citation` entry; anything still unresolved throws
   `RATIONALE_CITATION_UNRESOLVED`.
6. **Integrity on write as well as on read.** `buildDispositionPayload` re-runs the IID-2 validator and refuses a
   payload that violates its own invariants (`ASSESSMENT_INVALID`), and refuses a reference that disagrees with the
   payload it claims to describe (`SUBJECT_ASSESSMENT_MISMATCH`).
7. **The disposition input digest excludes the clock.** Content identity cannot (the payload contains
   `artifact.generatedAt`), so the *input* digest is the clock-free half of the pair — which is what makes an
   `APPENDED` + unchanged-`inputDigest` combination legible instead of mysterious.
8. **`hc:` had to be an admissible prefix.** R-8 gives a candidate an `hc:` chain while the closed registry mapped the
   report type to `hd:` only. The registry gained `admissiblePrefixes` (additive; `scopePrefix` unchanged) so the
   binding check accepts both without weakening anything else.
9. **No fabricated portfolio analytics.** The frozen CSIP analyzers need normalized, scored holdings that a user
   portfolio does not carry. Rather than invent scores, `diversificationBand` is `null`, `correlationFlags` is empty
   and `concentrationBand` is `NOT_COMPUTABLE` with a note (`L-027`).

## 4. Acceptance criteria — status

Every row is `PASS`, and every row names the test that would fail if it regressed. Full detail in
`ACCEPTANCE-MATRIX.md`.

| ID | Status | Carried by |
|---|---|---|
| AC-4.1 evidence matrix for every verb | **PASS** (31 rows, all boundaries) | `disposition-matrix.test.ts` |
| AC-4.2 no exposure increase on PARTIAL; WATCH for a PARTIAL candidate | **PASS** | `disposition-matrix.test.ts` |
| AC-4.3 corrected subject model and scope agreement | **PASS** | `disposition-subject.test.ts`, `disposition-composition.test.ts` |
| AC-4.4 portfolio context reused, unmeasured never zero, sector reference labelled | **PASS** | `disposition-portfolio.test.ts`, `portfolio-context.test.ts` |
| AC-4.5 versioned limits, named caps, downward only | **PASS** | `disposition-limits.test.ts` |
| AC-4.6 rationale, counter-arguments, falsifiers, resolvable citations | **PASS** | `disposition-rationale.test.ts` |
| AC-4.7 no order-shaped field or prose | **PASS** | `disposition-rationale.test.ts`, demonstration point 7 |
| AC-4.8 `INVESTMENT_ASSESSMENT` semantics, no band for AVOID/WATCH | **PASS** | `disposition-matrix.test.ts`, `disposition-rationale.test.ts` |
| AC-4.9 limits provenance and fail-closed resolution | **PASS** | `disposition-limits.test.ts`, `disposition-records.test.ts` |
| AC-4.10 determinism, stable chain identity, composer-side idempotency | **PASS** | `disposition-rationale.test.ts`, `disposition-composition.test.ts`, `disposition-records.test.ts` |

The ten additional scenarios are mapped test-by-test in `ACCEPTANCE-MATRIX.md` §2.

## 5. Verification runs

| Check | Command | Result |
|---|---|---|
| platform typecheck | `cd iips-platform && ./node_modules/.bin/tsc --noEmit` | exit 0 |
| platform suite | `./node_modules/.bin/tsx --test tests/investment/*.test.ts` | **377 / 377 pass** (91 new) |
| frontend server typecheck | `cd frontend && ./node_modules/.bin/tsc -p tsconfig.investment-server.json --noEmit` | exit 0 |
| frontend server suite | `./node_modules/.bin/vitest run server/investment` | **112 / 112 pass** (57 new) |
| demonstration | `./node_modules/.bin/tsx server/investment/cli/disposition-demonstration.ts --out demo` | **8 / 8 points PASS** |

Raw output: `logs/`, `demo/`.

## 6. Boundaries respected

- **No IPD writes, no IPD changes.** The phase uses the existing `adaptNp04Store` adapter and the existing
  `investmentArtifacts` service. `git diff` over `frontend/server/user-portfolio/**`, `frontend/server/reports/**` and
  every IPD-owned file is empty.
- **No new persistence store.** One SQLite store (the existing NP-04 one), reached only through the boundary. No
  `node:sqlite` import in product code — the test harness and the demonstration's tamper helper use it through
  `createRequire`, exactly as IID-3 does.
- **No frozen sector engine touched.** `iips-platform/src/sector-engines/**` is unchanged.
- **No new dependency, no pin changed.** `package.json` and the lockfile are unchanged.
- **No order path.** No brokerage, order-entry, quantity, price or timing capability was added anywhere.
- **No IID-5/IID-6 work.** No change comparison, no schedule, no UI, no product surface.
- **Preserved user data.** Every database in the tests and the demonstration is created in a fresh temporary
  directory and removed; no pre-existing store was opened, written or recreated.

## 7. Limitations

**Carried forward, unchanged:** `L-001` … `L-016`. No status was improved, no entry closed, no numbering moved.

**`L-014` — the one that constrains the next phase.** Disposition payloads contain `artifact.generatedAt`, so a
clock-only re-run appends a version. IID-4 discloses it (the input digest excludes the clock), pins it with a test,
and does **not** resolve it: resolution requires either a second content digest excluding generation metadata or an
operator decision that refreshes are versions, and that decision belongs before IID-5's scheduled refresh and
historical comparison. IID-4 could proceed under `L-014` because nothing in it depends on a clock-stable content
identity.

**Opened by IID-4:** `L-017` portfolio context is a snapshot, not a risk model · `L-018` unresolved holdings
understate exposures · `L-019` the 10 %/30 % defaults are placeholders · `L-020` non-equity and unresolvable subjects
get no verb · `L-021` thin evidence gets no conclusion · `L-022` sector exposure depends on a sector reference ·
`L-023` a citation is resolved or refused · `L-024` hysteresis can hold a verb briefly · `L-025` no history beyond the
chain · `L-026` the IID-3 chain constraints apply unchanged · `L-027` no diversification band or correlation.

## 8. Documents updated

| Document | Change |
|---|---|
| `docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` | §2 rows and §6 entries `L-017` … `L-027`; §7 records what changed and what did not, including `L-014`'s impact |
| `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` | new §B.J5 (IID-4 criteria and actual status); §B.L rewritten to record IID-5/IID-6 **NOT STARTED** |
| `docs/OPERATOR_RUNBOOK.md` | new §15 (dispositions: chains, limits policy, reading a withheld disposition, what must never be inferred) |

## 9. Independent verification

A fresh clone of the pushed branch (`3bc70c3`) into `/home/user/verify/iid4`, with its own installs and its own
temporary databases: platform **377/377**, frontend **112/112**, both typechecks exit 0, demonstration **8/8**.

Both `reportKey` values, both digests and both payload bodies reproduce **exactly** across the two independent runs. A
field-by-field diff of the payloads yields exactly one difference — `companyAssessmentRef.reportId`, the
store-assigned instance identity — which is by design and matches IID-3's finding. Full record:
`INDEPENDENT-VERIFICATION.md`.

Verification of the **merged** `main` is not claimed: the pull request has not merged. When it does, the same commands
should be re-run against `main` before IID-5 begins.

## 10. Honest gaps

- **No real company was dispositioned.** The demonstration's subject is the IID-2 synthetic reference company
  (`L-004`, `L-009`). Every verb in this evidence package is a statement about a fixture.
- **No real portfolio was read.** The context in the demonstration is a synthetic `G2PortfolioView`; the builder is
  tested against hand-built views, not against a live IPD read.
- **The demonstration's verbs are AVOID and AVOID_CANDIDATE.** That is what the synthetic company's numbers imply
  (a 64 % premium and deteriorating fundamentals). ACCUMULATE and INITIATE are exercised by tests, not by the
  demonstration — a reader should not read the demo as evidence that the positive path has been seen end to end in a
  store.
- **The surface is routes and a CLI, not a product.** There is no page, no panel, no candidate flow in the UI.
- **Hysteresis is exercised with a caller-supplied `previous`.** Nothing in the product supplies it yet (`L-025`).
- **`L-014` remains open**, and IID-5 must decide it before scheduled refresh.

## 11. What comes next

**IID-5 — change intelligence — NOT STARTED.** It is blocked on nothing in IID-4, but it must begin by recording the
`L-014` decision, because a change report over versions that differ only in their timestamp is not a change report.
It will also want the disposition history read path that `L-025` names.

**IID-6 — product surface — NOT STARTED.** It inherits the display duties this phase names but did not build:
withheld reasons, hysteresis disclosure, unmeasured weight, sector coverage, and the absence of any risk metric.
