# W05 — reusable issuer-level financial-data lifecycle (implementation record)

**Date:** 2026-11-17 (UTC)
**Roadmap item:** W05, "Financial coverage and source rights" (IPD `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`, read-only for this work).
**Type:** implementation, tests and this record inside IRR (`ramkivs/iips-review-recovered`) only. No IPD change, no dataset installed or downloaded, no source document or filing text added, nothing run on the Windows host, no production deployment or data operation.
**W05 status:** **IN PROGRESS — NOT COMPLETE — NOT ACCEPTED.** This record documents the reusable lifecycle mechanism and its tests. It does not establish actual portfolio coverage, does not approve a qualification threshold, and changes no decision, authorization or limitation disposition.

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

Known W05 position, unchanged by this work: the 2026-11-12 qualification record shows **0/65 portfolio holdings covered** and five evidence-only issuers stale with UNKNOWN rights; θF (the qualification threshold) is unestablished; source selection and repository-exposure dispositions (D1/D2/D3 as recorded on 2026-11-17) remain Principal decisions; O3 admissions remain limited to Infosys, Marico and KEC.

## 2. What was implemented

New module area `iips-platform/src/investment/lifecycle/` (additive only; no existing file modified):

| File | W05 requirement | What it does |
|---|---|---|
| `lifecycle/rightsRecord.ts` | B — dataset-level source/usage rights | Records source identity/type, document reference, acquisition method/date, evidence references (metadata/digests only, never filing text), and the seven purposes (acquisition, local storage, processing, analysis, display, retention, redistribution) as separate permission states. Derives status `ELIGIBLE_LOCAL_PERSONAL_USE` / `RESTRICTED` / `UNKNOWN` with a reason. Unknown/unsupported rights fail closed: closed source-type and acquisition-method vocabularies (no automated-retrieval member exists), a bare assertion without evidence is refused, inconsistent evidence vs declaration is refused, and redistribution is recorded but never authorised (`redistributionAuthorisation: 'NOT_AUTHORISED'`, matching `AuthorizationReference`). `rightsRecordFromManifest` is the fail-closed default for datasets with no fuller evidence. |
| `lifecycle/qualification.ts` | C — dataset qualification | Per issuer-dataset assessment of freshness, period coverage/continuity (sequence gaps), annual/quarterly identification, consolidated vs standalone basis (substitution and scope exclusions disclosed), statement completeness, distinct value semantics (present/zero/nil-by-disclosure/missing-not-reported/missing-not-tagged/…), accounting limitations (quality flags retained with severity), rights eligibility, and integrity/provenance. Named gates (`INTEGRITY_VERIFIED`, `PROVENANCE_RECORDED`, `RIGHTS_ELIGIBLE`, `FRESH_WITHIN_POLICY`, `PERIODS_IDENTIFIED`, `STATEMENTS_ADEQUATE`, `NO_BLOCKING_ACCOUNTING_LIMITATIONS`). `technicallyValid` (import level) is separate from qualification: a dataset never qualifies merely because it imported. The result records a `QualificationEvidenceSnapshot` and an `evidenceDigest`; `qualificationFromEvidence` re-derives the identical result from the snapshot alone (pure function). |
| `lifecycle/threshold.ts` | D — qualification threshold | A documented, testable, configurable threshold mechanism: named gates per analysis purpose, numeric configuration drawn from governed `valuation-policy/1.0.0` values (no new invented numbers), reproducible and explainable applications, and a `CONFIGURATION_MISMATCH` refusal when the threshold's policy differs from the policy the evidence was recorded under. The threshold VALUE is carried as `PROPOSED_NOT_APPROVED` with rationale, impact and the exact outstanding product-owner decision (θF). Meeting it is a technical result with `approvalEffect: 'NONE'`. There is no `APPROVED` status in this build and none may be added by a caller. |
| `lifecycle/issuerLifecycle.ts` | A — reusable issuer-level coverage | Resolves holdings through the established identity resolver; groups by distinct issuer; checks the dataset catalog for an existing suitable dataset (issuer, basis, periods, rights, qualification); REUSES one dataset per issuer across all holdings and portfolios (deterministic choice, no duplicates); records missing/stale/incomplete/rights-unknown/rights-restricted/unavailable coverage distinctly (`states` vocabulary); issues a `ProvisioningRequest` for gaps through the authorized manual ingestion path (`cli/ingest.ts --authorization-record`; no automated retrieval); links coverage back to every holding and portfolio revision; never throws for missing data and never gates portfolio creation or use. Also: `catalogEntryFromReadPort` and `tryCatalogEntryFromDatasetDir` (fail-closed reads). |
| `lifecycle/reporting.ts` | E — status and reporting | Issuer- and portfolio-level report: eligible holdings and distinct issuers, issuers with datasets / needing provisioning, qualified and unqualified (explicitly "under the proposal"), rights unknown/restricted, stale/incomplete/unavailable/missing counts, periods covered, accounting limitations, and coverage percentages each carrying `numerator`, `denominator`, basis (`DISTINCT_ISSUERS` / `ELIGIBLE_HOLDINGS`) and named exclusions. Unresolved holdings are itemised, never hidden in aggregates. `renderLifecycleSummary` for evidence use. |

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

Negative tests included: tampered dataset file refused at read (`DatasetIntegrityError`); malformed manifest rights declaration fails closed; rights record contradicting the manifest fails closed; inconsistent synthetic provenance refused; malformed evidence/permissions refused; expired permission restricts.

## 4. Test and check results

Run from `iips-platform/` (2026-11-17):

- `npm run test:iid` — **1625 tests, 338 suites, 0 failures** (includes all prior W05 suites: `w05SourceRights`, `w05CoverageSourceRights`, coverage/identity/freshness suites).
- `npm test` (platform + regression) — **678 tests, 0 failures**. (An initial 30 failures in the A13 protected-surface suite were caused by the sandbox's shallow clone missing the pinned baseline object `5ca181c7…`; `git fetch --unshallow` restored it and the suite passes. Unrelated to this change.)
- `npm run typecheck` (tsc `--noEmit`, strict) — clean.
- `git diff --check` — clean.

New tests: 36 (11 lifecycle, 14 qualification/threshold, 11 rights-record).

## 5. What this does NOT do (boundaries preserved)

- No real filing collection downloaded or ingested; tests build synthetic datasets in scratch directories only.
- No automated exchange retrieval or scraping; provisioning is the existing authorized manual ingestion path only.
- No claim of actual portfolio coverage — the 2026-11-12 position (0/65) stands and is not updated by mechanism work.
- No invented financial values; missing is never converted to zero; no approved numerical threshold invented or implied.
- No automatic rights approval; provider names and operator assertions are not independent permission; redistribution remains `NOT_AUTHORISED` everywhere.
- No change to O3 authorizations, PA-01, D1/D2/D3 dispositions, or any limitation-register disposition; no W07/W10 scope change; no dataset installation on the Windows host; no IPD write.
- Source documents and filing text remain out of repository commits; only metadata, references and digests are recorded.

## 6. Remaining decisions and outstanding coverage

1. **θF — qualification threshold approval (product owner).** The mechanism and the proposal exist (`lifecycle/threshold.ts`, `W05-THF-PROPOSAL-1`); every result is `PROPOSED_NOT_APPROVED`. Exact decision wording is in the threshold's `provenance.outstandingDecision`. W05 Qualification is not accepted until this is decided and actual datasets are assessed under it.
2. **Actual issuer coverage (operator, under D1).** No eligible portfolio issuer has a provisioned financial dataset yet. The lifecycle reports the gaps and issues provisioning requests; provisioning proceeds issuer by issuer through the authorized manual process, progressively — nothing blocks portfolio use meanwhile.
3. **Source-rights evidence per dataset (operator).** Each provisioned dataset needs its rights record (source identity/type, document reference, acquisition method/date, evidence digests, per-purpose permissions). Unknown rights will fail closed by design.
4. **D1/D2/D3 and PA-01 remain Principal decisions** and are untouched here.

## 7. Next roadmap step

With the mechanism in place, the next W05 step is **progressive provisioning for the eligible portfolio issuers under D1** (manual acquisition + evidence package + rights record + ingestion with authorization reference where applicable), then assessment of those datasets under the threshold mechanism once θF is approved. That work continues W05; it does not accept it. W20 remains blocked on θF as recorded.

---

Evidence for this pass: the module sources and tests named in §2–§4 in this repository; test transcripts reproducible with the commands in §4. No other evidence file is created, and no existing evidence, decision or manifest file is modified by this record's change set.
