# IID-6 — requirement → implementation → test

Every row names the requirement in the words of the work item or the roadmap, the file that implements it, and the
test that **fails if it regresses**. Rows that are only partly met say so in the status column; nothing here is marked
PASS because it was reviewed by eye.

Paths are relative to `frontend/` unless they start with `docs/`, `evidence/` or `iips-platform/`.

## 1. Surfaces

| # | Requirement | Implementation | Test | Status |
|---|---|---|---|---|
| S1 | `/investment/company/:issuerId` renders the full assessment: identity, adequacy, fundamentals, valuation, sensitivity, dividends, moat, risk taxonomy, assumptions, confidence + caps, evidence/provenance/freshness, version history | `src/features/investment/CompanyAssessmentPage.tsx`; view types extended in `src/api/investment.ts` | `src/features/investment/iid6CompanyAssessment.test.tsx` (14); `src/features/investment/CompanyAssessmentPage.test.tsx` (8, kept) | PASS |
| S2 | Company surface never recomputes a value | the page formats stored fields only; `numeric()`/`observed()` are formatters, not calculators | `iid6CompanyAssessment.test.tsx` › "prints every absent value … never as a zero"; the version-selector test asserts the request the reader's click produces | PASS |
| S3 | Disposition panel: verb, confidence, rationale + evidence, counter-arguments, falsifiers, limits/policy in force, portfolio context, portfolio implication + target band, withheld state + reason | `src/features/investment/DispositionPanel.tsx`; client `src/api/investmentDisposition.ts` | `src/features/investment/iid6Disposition.test.tsx` (11) | PASS |
| S4 | `HELD` vs `CANDIDATE` respected; never invent a disposition when the read model is missing or withheld | `DispositionPanel` (`isCandidate`, `withheld` branch); `DISPOSITION_UNAVAILABLE_COPY` | `iid6Disposition.test.tsx` › withheld block, not-recorded block, candidate block; `src/api/iid6InvestmentClients.test.ts` (19) | PASS |
| S5 | Change timeline + version comparison: timeline, selection, eight categories, numeric/categorical rendering, prev/current + direction, materiality, review flags/reasons/focus, attribution, missing boundary state | `src/features/investment/ChangeTimeline.tsx`; client `src/api/investmentChanges.ts` | `src/features/investment/iid6ChangeTimeline.test.tsx` (13) | PASS |
| S6 | Both versions' `dataAsOf`, `knownAsOf`, model versions side by side; never imply a data change when it is a model change | `ChangeTimeline` › `VersionContext` table; `CLASSIFICATION_COPY` | `iid6ChangeTimeline.test.tsx` › "prints dataAsOf, knownAsOf and the model version for the previous and the current version"; › "labels the pair as a freshness transition" | PASS |
| S7 | Boundary coverage: missing explanation shown, reconciliation exposed as an **operator** action only | `ChangeTimeline` › `BoundaryCoverage`; `InvestmentCoveragePage` › boundary section | `iid6ChangeTimeline.test.tsx` › "names the unexplained pairs and offers no control that could fill them"; `iid6Coverage.test.tsx` › boundary section | PASS |
| S8 | `/investment/coverage`: unresolved, ambiguous, ineligible, stale reference, out-of-scope, rejected/malformed, dataset freshness, boundary coverage + missing explanations; counts only when the read model supports them | `src/features/investment/InvestmentCoveragePage.tsx` (extended); `src/api/investmentCoverage.ts` (corrected) | `src/features/investment/iid6Coverage.test.tsx` (7) | PASS |
| S9 | Candidate flow reachable without a portfolio; `CANDIDATE` subject; `INITIATE`/`WATCH`/`AVOID_CANDIDATE` or a real withheld state; never fabricate holding/key/position/quantity/weight/implication | `src/features/investment/CandidateAssessmentPage.tsx`; route `ROUTES.candidateAssessment` | `iid6Disposition.test.tsx` › candidate block (3 tests); `src/app/iid6Routes.test.tsx` (9) | PASS |
| S10 | Portfolio integration in `UserPortfolioDetail`: per eligible resolved holding an entry point to company intelligence + disposition; current disposition with confidence/status; link to change timeline; existing navigation preserved; unresolved/ambiguous/ineligible/out-of-scope handled without fabricated values; **no portfolio persistence or IPD change** | `src/features/user-portfolios/UserPortfolioDetail.tsx` (two columns added); no change to `src/api/userPortfolios.ts` | `src/features/user-portfolios/iid6PortfolioIntegration.test.tsx` (6) | PASS |
| S11 | Sector-reference block: visually distinct, labelled, links to `/research/company/:id`, no issuer-specific hierarchy, never fed into assessments/dispositions (C-2) | `src/features/investment/SectorReferenceDisclosure.tsx` | `iid6CompanyAssessment.test.tsx` › sector containment (2 tests) | PASS |

## 2. Acceptance criteria

**AC-6.1 / AC-U1 — no write affordance.**
No `input`, `select`, `textarea`, `form` or `contenteditable` on any investment surface; the only `button`s are the
version selector and the timeline's pair selector, both of which change *which stored version is read*.
Tests: `iid6CompanyAssessment.test.tsx` › "offers no form control and no write affordance anywhere on the page";
`iid6CompanyAssessment.test.tsx` › "renders no write control and no execution language" (updated from IID-3: the
substring ban on `dispos` was removed because IID-6 exists to render dispositions — the ban on buy/sell/order-ticket
language and on generate/save/record controls is kept and extended);
`src/app/iid6Routes.test.tsx` › "issues GET-only requests from …", "renders no write affordance on a degraded
investment page"; `iid6PortfolioIntegration.test.tsx` › "issues only GETs and offers no mutation control".

**AC-6.2 / AC-U2 — degraded states sanitized, no fabricated values.**
Eleven named reasons across three vocabularies (`ASSESSMENT_UNAVAILABLE_COPY`, `DISPOSITION_UNAVAILABLE_COPY`,
`CHANGE_UNAVAILABLE_COPY`, plus `CoverageUnavailableError`) rendered as fixed client-side copy. Server bodies are never
interpolated; the tests assert that a `/srv/...` path and a `SELECT` statement in a 503 body do not reach the DOM.
Tests: `iid6CompanyAssessment.test.tsx` › degraded block (3); `iid6Disposition.test.tsx` › "shows fixed copy for an
integrity failure and none of the server body", "shows the not-recorded copy …"; `iid6ChangeTimeline.test.tsx` ›
degraded block (2); `iid6Coverage.test.tsx` › "a failed coverage read is sanitized"; `iid6InvestmentClients.test.ts`
reason-mapping table (9 cases).

**AC-6.3 / AC-U4 — absent values.**
Every absent value is `not available — <reason>`, generated by `notAvailable()` in
`src/features/investment/investmentCopy.ts`; the reason is the payload's own (`NOT_REPORTED`, `NOT_COMPUTABLE`,
`NOT_APPLICABLE`, `POLICY_INPUTS_UNAVAILABLE`) where the payload gives one. Two bare-dash placeholders found during
this phase were removed (the timeline's detail cell, the fundamentals note cell).
Tests: `iid6CompanyAssessment.test.tsx` › "prints every absent value as `not available — <reason>` and never as a
zero" (also iterates every cell of the fundamentals table asserting no `—`/`-`).

**AC-6.4 / AC-U3 — sector-reference containment.**
The block is an `<aside data-disclosure="sector-reference">` with its own heading, outside every assessment
`<section>`, stating in its own text that it is not company-specific and is not an input to the assessment or any
disposition; the sector composite is asserted to appear **only** inside that aside; the link is the existing
`/research/company/Technology` (sector, not issuer).
Tests: `iid6CompanyAssessment.test.tsx` › sector containment (2).

**AC-6.5 / AC-U5 — both versions' as-of/model metadata.**
`VersionContext` renders a `Both versions side by side — clocks and model identity` table with `dataAsOf`,
`knownAsOf`, model version, policy version, dataset, substantive digest and payload digest per column. Where a version
is not in the chain view, the cell reads `not available — version metadata not in this chain view`; it never borrows
the other column. The test asserts the unknown previous version does **not** inherit the known current clock.
Tests: `iid6ChangeTimeline.test.tsx` › both-versions block (2).

**AC-6.6 / AC-U6 — keyboard and non-colour-only.**
Every badge renders its word (`IMMATERIAL`/`NOTABLE`/`MATERIAL`/`CRITICAL`, `IMPROVED`/`WORSENED`/…), with the symbol
marked `aria-hidden` so it is decoration, not the message. All controls are native `button`/`link` elements with
accessible names; selectors expose `aria-pressed`; the version and pair buttons are the only tab stops that change
state. See `accessibility.md`.
Tests: `iid6ChangeTimeline.test.tsx` › "renders numeric and categorical values with direction in words, never by
colour alone"; `iid6CompanyAssessment.test.tsx` version selectors; `iid6Disposition.test.tsx` "shows the rationale for
and against, with directions in words".

**AC-6.7 — candidate without a portfolio, no fabricated position.**
`CandidateAssessmentPage` at `/investment/candidate/:securityId`; the disposition read is a single GET with no
portfolio parameter when none was supplied. A candidate renders no quantity row, no current weight and no projected
weight; the payload's `NOT_APPLICABLE` / `POLICY_INPUTS_UNAVAILABLE` reasons are printed instead.
Tests: `iid6Disposition.test.tsx` › "never renders a quantity, a current weight or a projected weight for a
candidate", "is reachable without a portfolio and issues a GET with no portfolio context"; `iid6Routes.test.tsx`
mounts the route.

## 3. Cross-phase gates (AC-X1 … AC-X7)

| Gate | How IID-6 satisfies it | Evidence |
|---|---|---|
| AC-X1 | `npm run typecheck` clean; `vitest run src` 57 files / 546 passed (+1 skipped); `vitest run server/investment` 14 files / 199 passed | `test-run.txt` |
| AC-X2 | No socket: the surface only calls the local read transport already in use (`/api/investment/...`, `/api/user-portfolios/...`), which IID-6 does not change | `read-only-proof.md` |
| AC-X3 | No dependency added; `package.json`/`package-lock.json` untouched in this phase | `changed-files.txt` |
| AC-X4 | No file under `iips-platform/src/sector-engines/` touched (nor anywhere else in `iips-platform/`) | `changed-files.txt` |
| AC-X5 | No store, table, cache, journal or adapter added; the coverage page names `ChangeService.reconcile` as an operator action and has no control for it | `read-only-proof.md`, `iid6ChangeTimeline.test.tsx` |
| AC-X6 | No dataset or artifact committed; the largest new file is a source module, not a fixture blob | `changed-files.txt` |
| AC-X7 | No artifact is written by this phase at all; the read paths it consumes were validated by IID-3/IID-4/IID-5 | IID-3/IID-4/IID-5 bundles |

## 4. Targeted tests the work item names

| Named test | Where |
|---|---|
| no write affordance | `iid6CompanyAssessment.test.tsx`, `iid6Routes.test.tsx`, `iid6PortfolioIntegration.test.tsx` |
| degraded-state copy | `iid6CompanyAssessment.test.tsx`, `iid6Disposition.test.tsx`, `iid6ChangeTimeline.test.tsx`, `iid6Coverage.test.tsx` |
| absent-value rendering | `iid6CompanyAssessment.test.tsx` |
| sector containment + link | `iid6CompanyAssessment.test.tsx` |
| both versions' metadata | `iid6ChangeTimeline.test.tsx` |
| keyboard/non-colour | `iid6ChangeTimeline.test.tsx`, `iid6Disposition.test.tsx` |
| candidate without portfolio | `iid6Disposition.test.tsx`, `iid6Routes.test.tsx` |
| client GET-only + failure vocabulary | `src/api/iid6InvestmentClients.test.ts` |
| server list facts (the one server edit) | `server/investment/disposition-records.test.ts`, `server/investment/disposition-transport.test.ts` |

## 5. Not delivered / not claimed

| Item | Why | Where it is stated to the user |
|---|---|---|
| Real-issuer coverage | no real issuer exists in the pipeline (L-009) | company page limitations block; bundle README |
| Boundary total across issuers | no cross-issuer boundary read model exists; a total would be fabricated | `InvestmentCoveragePage` boundary section (says so) |
| Scheduled change/review | no scheduler exists (M-2 as a scheduled capability) | change section copy; roadmap §B.N |
| Broker-preview surface | not named in IID-6 ACs; `evaluateBrokerPreview` remains unused | `read-only-proof.md` §4 |
