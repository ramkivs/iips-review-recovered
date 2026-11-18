# W05 — reusable issuer-level financial-data lifecycle (implementation record)

**Date:** 2026-11-17 (UTC); final targeted review corrections added 2026-11-18 (§4.3)
**Roadmap item:** W05, "Financial coverage and source rights" (IPD `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`, read-only for this work).
**Type:** implementation, tests and this record inside IRR (`ramkivs/iips-review-recovered`) only. No IPD change, no dataset installed or downloaded, no source document or filing text added, nothing run on the Windows host, no production deployment or data operation.
**W05 status:** **IN PROGRESS — NOT COMPLETE — NOT ACCEPTED.** This record documents the reusable lifecycle mechanism and its tests. It does not establish actual portfolio coverage, asserts no θF value (no defensible value can yet be asserted), and changes no decision, authorization or limitation disposition.

## 1. What already existed (reused, not reimplemented)

The W05 source-rights classification work already on `main` was preserved untouched. The lifecycle builds on it:

| Existing mechanism | Where | Used for |
|---|---|---|
| `DatasetManifest.sourceRights` declaration + `assertSourceRights` (SYNTHETIC / OPERATOR_ASSERTED-with-basis / absent-equals-UNKNOWN; malformed refused) | `fundamentals/manifest.ts` | rights semantics, unchanged |
| Rights-driven dataset class (`SYNTHETIC_REFERENCE` / `OPERATOR_SUPPLIED` / `UNKNOWN`), provider strings never consulted | `fundamentals/datasetClass.ts` | class derivation, unchanged |
| Authorization-record citation (O3 closed list, per-digest) | `fundamentals/authorizationRecords.ts` | cited by the ingestion path; not extended |
| Fail-closed dataset reads (per-file digests + content digest) | `ingestion/writer.ts` `readDataset` | integrity gate |
| Security-to-issuer resolution ladder (identity fields only) | `identity/resolver.ts` | issuer identification |
| Period/scope algebra (consolidated-preferred, restatement preference, discrete quarters, TTM) | `assessment/periods.ts` | series selection |
| Freshness windows (`freshness-policy/1.0.0`: P&L 200 d, balance sheet 250 d) and sequence gaps | `assessment/freshness.ts` | freshness gate |
| Completeness/adequacy (required items × 3 annual periods; SUFFICIENT/PARTIAL/INSUFFICIENT) and quality flags | `assessment/adequacy.ts` | completeness + limitations |
| Presence semantics (PRESENT / MISSING / NIL_BY_DISCLOSURE / NOT_APPLICABLE / NOT_COMPUTABLE / IMPUTED; closed missing reasons) | `contracts/observation.ts` | value semantics |
| `valuation-policy/1.0.0` governed numbers | `assessment/policy.ts` | threshold defaults |
| Ingestion CLI with `--authorization-record` (the authorized acquisition path) | `cli/ingest.ts` | provisioning process reference |

Known W05 position (see `W05-ROADMAP-RECONCILIATION-2026-11-17.md` §4): financial-data coverage of W04 revision 1 (**64 holdings**) is **unmeasured** — none of those holdings has been processed. The only measurement on record is the historical 2026-11-12 one over a different census: **0 of 65 ISIN-resolved rows of the published 68-row Dhan CSV** matched an issuer with a dataset. The two censuses are not interchangeable and "0 of 64" is not a measured result. A holding contributes to the financial ratio only if its own identity passes; the IPD W04 record shows a stored security identity on 1 of the 64 holdings, which bounds the revision-1 numerator at one — a property of that census which this code does not enforce. Five evidence-only issuers are stale with UNKNOWN rights. θF is the **portfolio-wide financial ratio that gates W20** — not a per-dataset qualification threshold and not a W05 condition — set from observed evidence under the standing grant, with no defensible value asserted yet. Source selection and repository-exposure dispositions (D1/D2/D3 as recorded on 2026-11-17) remain Principal decisions; O3 admissions remain limited to Infosys, Marico and KEC.

## 2. What was implemented

New module area `iips-platform/src/investment/lifecycle/` (additive only; no existing file modified):

| File | W05 requirement | What it does |
|---|---|---|
| `lifecycle/rightsRecord.ts` | B — dataset-level source/usage rights | Records source identity/type, document reference, acquisition method/date, evidence references (metadata/digests only, never filing text), and the seven purposes (acquisition, local storage, processing, analysis, display, retention, redistribution) as separate permission states. **Retention is verified alongside entitlement**: the record derives an entitlement verdict and a retention verdict separately (each fail closed; retention covers the RETENTION purpose and the expiry/review window) and combines them by fail-closed worst-of. Derives status `ELIGIBLE_LOCAL_PERSONAL_USE` / `RESTRICTED` / `UNKNOWN` with a reason. Unknown/unsupported rights fail closed: closed source-type and acquisition-method vocabularies (no automated-retrieval member exists), a bare assertion without evidence is refused, inconsistent evidence vs declaration is refused, and redistribution is recorded but never authorised (`redistributionAuthorisation: 'NOT_AUTHORISED'`, matching `AuthorizationReference`). `rightsRecordFromManifest` is the fail-closed default for datasets with no fuller evidence. |
| `lifecycle/qualification.ts` | C — dataset qualification | Per issuer-dataset assessment of freshness, period coverage/continuity (sequence gaps), annual/quarterly identification, consolidated vs standalone basis (substitution and scope exclusions disclosed), statement completeness, **required operating-metric completeness** (the requirement set is the governed method-matrix `sectorRequirements` for the issuer's sector, reused; **the set is PROVISIONAL pending W10, which is not established — `requiredSetStatus: 'PROVISIONAL_PENDING_W10'` — and is not presented as settled**; a nil disclosure or reported zero counts as a report, absence does not; an unrecorded or off-vocabulary sector fails closed), distinct value semantics (present/zero/nil-by-disclosure/missing-not-reported/missing-not-tagged/…), accounting limitations (quality flags retained with severity), rights eligibility, and integrity/provenance. Named gates (`INTEGRITY_VERIFIED`, `PROVENANCE_RECORDED`, `RIGHTS_ELIGIBLE`, `FRESH_WITHIN_POLICY`, `PERIODS_IDENTIFIED`, `STATEMENTS_ADEQUATE`, `REQUIRED_METRICS_PRESENT`, `NO_BLOCKING_ACCOUNTING_LIMITATIONS`). `technicallyValid` (import level) is separate from qualification: a dataset never qualifies merely because it imported. The result records a `QualificationEvidenceSnapshot` (including the metric observations) and an `evidenceDigest`; `qualificationFromEvidence` re-derives the identical result from the snapshot alone (pure function). |
| `lifecycle/threshold.ts` | D — qualification threshold (and θF, kept strictly separate) | Two separate things. (1) A documented, testable, configurable **per-dataset ruleset** (`DATASET_QUALIFICATION_THRESHOLD`): named gates per analysis purpose (`REQUIRED_METRICS_PRESENT` is required for `VALUATION_INPUT` and `PRICE_SENSITIVE_ANALYSIS`, which consume operating metrics, and not for `STATEMENT_ANALYSIS`), numeric configuration drawn from governed `valuation-policy/1.0.0` values (no new invented numbers), reproducible and explainable applications, and a `CONFIGURATION_MISMATCH` refusal when the ruleset's policy differs from the policy the evidence was recorded under. It carries **no approval axis of any kind** — meeting it is a per-dataset technical result (`MEETS_THRESHOLD`/`BELOW_THRESHOLD`). (2) **θF** (`THETA_F`): the portfolio-wide financial ratio that gates W20 — not a per-dataset qualification threshold, **not a W05 condition**, set from observed evidence under the standing grant. No defensible value can yet be asserted, so none is (`NO_DEFENSIBLE_VALUE_ASSERTED`, `value: null`) and `evaluateW20Gate` fails closed. `financialRatio` enforces the identity rule (a holding contributes only if its own identity passes; violating inputs are refused). No product-owner approval dependency exists for θF and none may be introduced. |
| `lifecycle/issuerLifecycle.ts` | A — reusable issuer-level coverage | Resolves holdings through the established identity resolver; groups by distinct issuer; checks the dataset catalog for an existing suitable dataset (issuer, basis, periods, rights, qualification); REUSES one dataset per issuer across all holdings and portfolios (deterministic choice, no duplicates); records missing/stale/incomplete/rights-unknown/rights-restricted/unavailable coverage distinctly (`states` vocabulary); issues a `ProvisioningRequest` for gaps through the authorized manual ingestion path (`cli/ingest.ts --authorization-record`; no automated retrieval); links coverage back to every holding and portfolio revision; never throws for missing data and never gates portfolio creation or use. Also: `catalogEntryFromReadPort` and `tryCatalogEntryFromDatasetDir` (fail-closed reads). |
| `lifecycle/reporting.ts` | E — status and reporting | Issuer- and portfolio-level report: eligible holdings and distinct issuers, issuers with datasets / needing provisioning, qualified and unqualified (explicitly "under the per-dataset ruleset"), rights unknown/restricted, stale/incomplete/unavailable/missing counts, periods covered, accounting limitations, and coverage percentages each carrying `numerator`, `denominator`, basis (`DISTINCT_ISSUERS` / `ELIGIBLE_HOLDINGS`) and named exclusions. Coverage is reported **by issuer, by sector and by analytical method** (`coverageBySector` / `coverageByAnalyticalMethod` — the roadmap's "method" is the applicable analysis; the entries come from the qualification's `methodCoverage`, are provisional pending W10, overlap because an issuer appears under every method its sector declares, and put issuers with no nameable method under `METHOD_NOT_DETERMINABLE`). `coverageByAcquisitionMethod` is a separately labelled **source/rights** breakdown (how the material was acquired; unprovisioned issuers under `NOT_PROVISIONED`) and is not the method dimension. The separate **entitlement and retention verdicts** are listed per issuer and counted separately (`rightsAssessments`, `rightsVerdicts`). The **financial ratio** is reported with its identity rule (a holding contributes only if its own identity passes; unresolved holdings itemised, never folded in) and with the basis on which each identity was resolved (`identityBasis`); the report is not a reconciliation to W04 and says so. θF's standing and the fail-closed W20 gate ride on the report verbatim. `renderLifecycleSummary` for evidence use. |

Added by the final targeted review (2026-11-18, §4.3), in the same files: `qualification.ts` — `QualificationRightsBlock` / `rightsBlockOf` / `effectiveRightsStatus` (both rights verdicts kept; the rights gate fails closed on the worst of the combined status and the two verdicts) and `MethodCoverageBlock` (coverage by analytical method, reusing `coverage/methodMatrix.ts` `SECTOR_METHODS` and `coverage/measure.ts` `qualificationOf`; a disclosure, not a gate); `issuerLifecycle.ts` — `HoldingReference.resolutionBasis`; `threshold.ts` — the θF condition is evaluated on the unrounded ratio and never opens on an empty denominator.

Tests (fixtures are synthetic and declare themselves so): `tests/investment/w05LifecycleFixture.ts`, `w05Lifecycle.test.ts`, `w05Qualification.test.ts`, `w05RightsRecord.test.ts`.

## 3. Acceptance test coverage

| # | Requirement | Where demonstrated |
|---|---|---|
| 1 | Multiple holdings/portfolios reuse the same suitable dataset | `w05Lifecycle.test.ts` — three Aarav holdings across two portfolios map to one issuer row and one deterministic reused dataset; two candidates assessed, one selected |
| 2 | Missing dataset does not block portfolio creation/use | `w05Lifecycle.test.ts` — zero-dataset run returns rows, provisioning requests and a report without throwing |
| 3 | Unknown rights cannot qualify | `w05Qualification.test.ts` — technically valid but `RIGHTS_ELIGIBLE` gate fails; below threshold |
| 4 | Unsupported rights declarations fail closed | `w05RightsRecord.test.ts` — unknown state, unsupported source type/acquisition method, assertion without evidence all refused |
| 5 | Stale dataset identified, never silently current | `w05Qualification.test.ts` (dated staleness, HIGH flag) + `w05Lifecycle.test.ts` (stale is never `SUITABLE`) |
| 6 | Missing periods and incomplete statements reported accurately | `w05Qualification.test.ts` — FY2025 sequence gap named; missing fields with period + reason |
| 7 | Standalone/consolidated not interchanged | `w05Qualification.test.ts` — mixed scope excludes standalone by name; standalone substitution disclosed; scopes never merged |
| 8 | Missing/nil/zero/unmapped remain distinct | `w05Qualification.test.ts` — four distinct buckets asserted; observations untouched |
| 9 | Accounting limitations retained and consequential | `w05Qualification.test.ts` — negative equity BLOCKING + restatement LIMITATION retained; valuation refused, statement purpose's gate difference explicit |
| 10 | Reproducible from recorded evidence and rules | `w05Qualification.test.ts` — identical results; `qualificationFromEvidence` deep-equals; stable `evidenceDigest` |
| 11 | Distinct-issuer and eligible-holding denominators | `w05Lifecycle.test.ts` — 5 eligible holdings / 3 distinct issuers; numerators, denominators, basis, exclusions asserted |
| 12 | >200 holdings without all datasets upfront | `w05Lifecycle.test.ts` — 220 holdings + 1 unresolved, one dataset present, 4 provisioning requests, full report |
| 13 | Existing W05 behaviour unchanged | `w05RightsRecord.test.ts` pinned classification expectations; full existing suites run green (below) |

Negative tests included: tampered dataset file refused at read (`DatasetIntegrityError`); malformed manifest rights declaration fails closed; rights record contradicting the manifest fails closed; inconsistent synthetic provenance refused; malformed evidence/permissions refused; expired permission restricts. Beyond the numbered acceptance tests, targeted tests cover requirement C's **required operating-metric completeness**: a sector-required metric with no report fails the gate and is named; a nil disclosure or reported zero counts as a report while absence stays missing; an unrecorded or off-vocabulary sector fails the gate closed; and the metric assessment travels in the reproducible evidence snapshot.

## 4. Test and check results

Run from `iips-platform/` (2026-11-18, after the review correction, the roadmap reconciliation and the final targeted review below):

- `npm run test:iid` — **1651 tests, 344 suites, 1651 pass, 0 failures** (includes all prior W05 suites: `w05SourceRights`, `w05CoverageSourceRights`, coverage/identity/freshness suites).
- `npm test` (platform + regression) — **678 tests, 0 failures**. (The A13 protected-surface suite needs full history and all blobs: a shallow or blobless clone fails it. Unrelated to this change.)
- `npm run typecheck` (tsc `--noEmit`, strict, `src/**/*.ts`) — clean.
- `git diff --check` — clean.
- One IID subtest (`s4R3CandidateBuild.test.ts`) pins absolute paths under `/home/user/iips-review-recovered`; it passes only in a clone at that path. Unrelated to this change.

New tests: 62 (16 lifecycle incl. coverage dimensions, the rights verdicts in the report and the identity gate; 32 qualification/ruleset/θF/metrics/rights verdicts/method coverage; 14 rights-record incl. retention verified alongside entitlement).

### 4.1 Review correction (same-day)

A requirement-by-requirement review of this implementation found one genuine gap against W05 requirement C ("Required statement and metric completeness"): the qualification assessed **statement** completeness but did not assess **operating-metric** completeness. Corrected in this change set: the qualification now computes a `MetricCompletenessBlock` against the governed sector requirement set (`coverage/measure.ts` `sectorRequirements`, reused not re-invented), adds the `REQUIRED_METRICS_PRESENT` gate (required for `VALUATION_INPUT` and `PRICE_SENSITIVE_ANALYSIS`, not for `STATEMENT_ANALYSIS`), records the metric observations in the reproducible evidence snapshot, and reports metric gaps as `INCOMPLETE` coverage in the lifecycle states. Nil disclosures and reported zeros count as reports; absence is missing; an undeterminable sector fails the gate closed. Four targeted tests were added. All previously accepted behaviour is unchanged (pinned regression suites green).

### 4.2 Roadmap reconciliation correction (same-day)

The authoritative IPD roadmap (IPD `main` `2685562522f1a2fd1d745a7857f771bf21453315`, blob `7affba55a5ba568333fdc2961a322c2f76b4c671`, W05 lines 148–149; IPD reconciliation record `d418ce2`) was supplied and compared against the actual branch. Seven corrections were required and are applied in this change set — full disposition in `W05-ROADMAP-RECONCILIATION-2026-11-17.md`:

1. **Coverage denominator** — the "0/65" figure is the 2026-11-12 measurement over the 68-row Dhan CSV (65 ISIN-resolved rows); it is a different census from W04 revision 1's 64 holdings, which remain unmeasured (see §4.3 for the correction of this item). The financial ratio is reported with its identity rule (a holding contributes only if its own identity passes) and violating inputs are refused.
2. **θF** — re-modelled as the portfolio-wide ratio gating W20 (not a per-dataset qualification threshold, not a W05 condition, set from observed evidence under the standing grant, no defensible value asserted); the product-owner approval dependency is removed entirely from the per-dataset ruleset mechanism.
3. **Coverage dimensions** — coverage is reported by issuer, sector AND method. The roadmap's method is the analytical method; this item was first implemented as acquisition method and was corrected on 2026-11-18 (§4.3).
4. **Required metrics** — the required-metric set is marked `PROVISIONAL_PENDING_W10` (W10 is not established) and is not presented as settled.
5. **Retention** — the rights assessment now verifies retention alongside entitlement (separate fail-closed verdicts), and both verdicts are carried through qualification into the report (§4.3).
6. **Ownership** — W05 execution belongs to IRR and the operator; IPD's role is limited to its roadmap and supporting records.
7. **Application integration** — W05 requires none; coverage display belongs to W17 in IRR and integration is no longer a W05 open item.

Nine targeted tests were added (θF semantics, W20 gate, identity-gated ratio, coverage dimensions ×2, retention ×3, plus the ruleset-role assertions). All previously accepted behaviour is unchanged (pinned test 13 expectations run untouched).

### 4.3 Final targeted review correction (2026-11-18)

A review of the whole PR against the roadmap found four discrepancies; full disposition in `W05-ROADMAP-RECONCILIATION-2026-11-17.md` §8. (There the findings are numbered D1–D4; those are review finding numbers, not the governance decisions D1/D2/D3.)

1. **The historical denominator.** The earlier text said the 2026-11-12 record states "2 admitted, 63 not admitted" and restated coverage as "0 of 64". Both were wrong: the record measures 0 of 65 ISIN-resolved rows of a 68-row Dhan CSV, and revision 1 has never been processed. Corrected in the three documents and in `threshold.ts` (`provenance.impact`).
2. **`RESOLVED` is not "W04 identity-passed".** The resolver also resolves on exchange and symbol where a row has no ISIN, and the lifecycle resolves whatever observations it is handed without reading the W04 census. No equivalence is claimed and no W04 numerator is enforced. Two tests state the position (symbol only: `UNMATCHED` / `NO_IDENTIFIER_PROVIDED`, contributes nothing; exchange and symbol: `RESOLVED` with basis `EXCHANGE_SYMBOL`, disclosed). The resolution basis is carried on each holding and totalled in the report. The reconciliation to W04 remains outstanding.
3. **"Method" is the analytical method.** Coverage by analytical method added (`methodCoverage`, `coverageByAnalyticalMethod`), reusing the governed method matrix and the existing predicate; disclosure only, provisional pending W10, no new gate. The acquisition-method breakdown is kept as source/rights evidence and labelled as not the method dimension.
4. **Entitlement and retention beyond the rights record.** The qualification evidence now carries both verdicts with their reasons, the report lists and counts them separately, and the rights gate fails closed on the worst of the combined status and the two verdicts.

In the same review the θF condition was brought into line with two rules the roadmap states: it is evaluated on the unrounded ratio (rounding is display only), and an empty denominator never passes. θF is otherwise unchanged — no value asserted, not a W05 condition.

Thirteen tests were added. All previously accepted behaviour is unchanged (`w05RightsRecord.test.ts`, with the pinned test 13 expectations, is untouched).

## 5. What this does NOT do (boundaries preserved)

- No real filing collection downloaded or ingested; tests build synthetic datasets in scratch directories only.
- No automated exchange retrieval or scraping; provisioning is the existing authorized manual ingestion path only.
- No claim of actual portfolio coverage. Coverage of W04 revision 1's 64 holdings is unmeasured; the 2026-11-12 measurement (0 of 65 ISIN-resolved rows of the 68-row Dhan CSV) is history over a different census (`W05-ROADMAP-RECONCILIATION-2026-11-17.md` §4). Mechanism work changes neither.
- No reconciliation to W04. The lifecycle's identity gate is the resolver's result over the observations supplied; it is not shown to equal W04's identity-passed set, and no revision-1 dataset was constructed to suggest otherwise.
- No invented financial values; missing is never converted to zero; **no numerical threshold invented and none asserted for θF** (which is not a W05 condition and needs no W05 decision).
- No automatic rights approval; provider names and operator assertions are not independent permission; redistribution remains `NOT_AUTHORISED` everywhere.
- No change to O3 authorizations, PA-01, D1/D2/D3 dispositions, or any limitation-register disposition; no W07/W10 scope change; no dataset installation on the Windows host; no IPD write.
- Source documents and filing text remain out of repository commits; only metadata, references and digests are recorded.

## 6. Remaining decisions and outstanding coverage

1. **θF (not a W05 decision).** θF is the portfolio-wide financial ratio that gates W20; it is set from observed evidence under the standing grant and is NOT a W05 condition — no product-owner approval path exists for it and no θF decision is requested for W05. No defensible value can yet be asserted, so none is asserted; the W20 gate fails closed meanwhile.
2. **Actual issuer coverage (operator, under D1).** No portfolio issuer is known to have a provisioned financial dataset, and coverage of W04 revision 1's 64 holdings has not been measured. The lifecycle reports the gaps and issues provisioning requests; provisioning proceeds issuer by issuer through the authorized manual process, progressively — nothing blocks portfolio use meanwhile.
3. **Source-rights evidence per dataset (operator).** Each provisioned dataset needs its rights record (source identity/type, document reference, acquisition method/date, evidence digests, per-purpose permissions, **with retention verified alongside entitlement**). Unknown rights will fail closed by design.
4. **Required-metric set and method requirements (W10).** W10 is not established; the metric-completeness requirement set and the per-method input requirements stay `PROVISIONAL_PENDING_W10` until it is.
5. **Reconciliation to W04 (IRR + operator).** An actual revision-1 run reconciled to the W04 census, holding by holding, has not been done. Until it is, no revision-1 numerator is established. The roadmap's eligible set `E` is also not modelled by the report: its ratio denominator is every holding supplied.
6. **D1/D2/D3 and PA-01 remain Principal decisions** and are untouched here.

## 7. Next roadmap step

With the mechanism in place, the next W05 step is **progressive provisioning for the eligible portfolio issuers under D1** (manual acquisition + evidence package + rights record with retention verified alongside entitlement + ingestion with authorization reference where applicable), then assessment of those datasets under the per-dataset ruleset. θF is set from observed evidence under the standing grant as that evidence accrues and gates W20 — it is not a W05 condition and holds no W05 decision. This work continues W05; it does not accept it. W05 requires no application integration; coverage display belongs to W17 in IRR.

---

Evidence for this pass: the module sources and tests named in §2–§4 in this repository; test transcripts reproducible with the commands in §4. No other evidence file is created, and no existing evidence, decision or manifest file is modified by this record's change set.
