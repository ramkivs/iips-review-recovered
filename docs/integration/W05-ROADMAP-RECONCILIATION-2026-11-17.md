# W05 roadmap reconciliation — seven corrections from the authoritative IPD source

**Date:** 2026-11-17 (UTC); final targeted review and corrections appended 2026-11-18 (§8)
**Committed by:** the IRR-side W05 session, on `arena/dd0a8542-iips-review-recovered`
**Purpose:** record the comparison of the authoritative IPD roadmap against the ACTUAL IRR branch
and PR #598 (not the handoff description), identify which of the seven supplied corrections touch
implementation / tests / documentation / coverage reporting, and record the corrections applied.

## 1. Authoritative source (IPD side)

| Item | Value |
|---|---|
| IPD `main` commit | `2685562522f1a2fd1d745a7857f771bf21453315` |
| Roadmap blob | `7affba55a5ba568333fdc2961a322c2f76b4c671` |
| Roadmap SHA-256 | `875938b087bca87415c5215283967049d331d609383095ecc93adfe7e5e98e89` |
| W05 location | roadmap lines 148–149, unchanged since 10 November 2026 |
| IPD reconciliation record | commit `d418ce2`; source extract `evidence/integration/w05-roadmap-reconciliation-2026-11-18/roadmap-w05-extract-2026-11-18.md` |

The IPD session could not read IRR (all IRR reads returned HTTP 403), so its statements about
PR #598 were unverified from the IPD side. This record is the IRR-side comparison against the
actual branch contents, and the corrections below are applied to those actual files.

## 2. Comparison method

Compared point by point against the branch as it stood (`e527ae6`, PR #598 head): the five
`iips-platform/src/investment/lifecycle/` modules, the four W05 test files and fixture, the
implementation record `W05-ISSUER-LEVEL-FINANCIAL-DATA-LIFECYCLE-2026-11-17.md`, and the handoff
`IPD-WORK-HANDOFF-2026-11-17.md`. Accepted pre-existing behaviour (W05 source-rights
classification, Q1–Q7, O3/PA-01, D1–D3, limitation dispositions, fail-closed reads) was out of
scope for change and is untouched — the pinned test 13 expectations in
`w05RightsRecord.test.ts` run unchanged.

## 3. The seven points — disposition

| # | Point | Required correction? | Kind | What changed |
|---|---|---|---|---|
| 1 | Coverage denominator 65 vs W04 rev-1's 64; identity-gated numerator | Yes | Documentation + coverage reporting | Origin of 65 corrected (§4): it is the ISIN-resolved row count of the published 68-row Dhan CSV — a different census from W04 revision 1 (64 holdings). **No financial-data coverage of revision 1 has been measured**, so no "0 of 64" result is stated. The financial ratio is reported with its identity rule on the face of it (`threshold.financialRatio`, `reporting.financialRatio`) and inputs that would count a holding whose own identity failed are refused, never clamped. The lifecycle's `RESOLVED` is not the same statement as "W04 identity-passed"; the reconciliation to W04 is outstanding (§4, §8 D2). Historical records were not altered. |
| 2 | θF is a portfolio-wide ratio gating W20, not a per-dataset threshold, not a W05 condition, set from observed evidence under the standing grant; no defensible value yet; no product-owner approval dependency | Yes | Implementation + tests + documentation | `threshold.ts` re-modelled: θF = `THETA_F` (`W05-THF-PORTFOLIO-RATIO`) with `semantics: PORTFOLIO_WIDE_RATIO`, `gates: W20`, `isW05Condition: false`, `isPerDatasetQualificationThreshold: false`, `assertionStatus: NO_DEFENSIBLE_VALUE_ASSERTED`, `value: null`, `settingRule: SET_FROM_OBSERVED_EVIDENCE_UNDER_THE_STANDING_GRANT`; `evaluateW20Gate` fails closed. The per-dataset mechanism is kept as `DATASET_QUALIFICATION_THRESHOLD` (`W05-DATASET-RULESET-1`) with the entire approval axis REMOVED (`approvalStatus`/`approvalEffect`/`outstandingDecision` are gone; decisions are `MEETS_THRESHOLD`/`BELOW_THRESHOLD`/`CONFIGURATION_MISMATCH`, technical only). Reporting carries θF's standing and the closed W20 gate. |
| 3 | Coverage by issuer, sector AND method | Yes | Implementation + coverage reporting + tests | The roadmap's "method" is the **analytical** method — the applicable analysis and its method-specific mandatory inputs (roadmap lines 329, 334, 345); the word "acquisition" does not occur in the roadmap. `qualification.ts` records `methodCoverage` (per method the governed method matrix declares for the issuer's sector, whether the dataset holds that method's declared inputs; reuses `SECTOR_METHODS` and `qualificationOf`; disclosure only, `PROVISIONAL_PENDING_W10`) and `reporting.ts` emits `coverageBySector` and `coverageByAnalyticalMethod` beside the by-issuer figures. `coverageByAcquisitionMethod` is kept as a separately labelled **source/rights** breakdown and is explicitly not the method dimension. Unprovisioned issuers sit under `METHOD_NOT_DETERMINABLE` / `NOT_PROVISIONED`; dimension entries cover identity-passed holdings only, with unresolved holdings itemised. (An earlier version of this row read "method" as acquisition method; that was an interpretation error — §8 D3.) |
| 4 | Required-metric set depends on W10, which is not established; do not present it as settled | Yes | Documentation + implementation marker + tests | `MetricCompletenessBlock.requiredSetStatus: 'PROVISIONAL_PENDING_W10'`; every metric-completeness note and the module/fixture comments say the set is provisional pending W10. The mechanics (reported vs missing/nil/zero) are unchanged — the SET's standing is what was corrected. |
| 5 | Verify retention alongside entitlement in the rights assessment | Yes | Implementation + tests + documentation | `rightsRecord.ts` derives `entitlementStatus`/`retentionStatus` separately — each fail closed — and combines them by fail-closed worst-of; retention covers the RETENTION purpose and the expiry/review window. The combined `status` semantics and accepted reason wording are preserved exactly. The two verdicts and their reasons are carried through qualification (`QualificationRightsBlock`, `rightsBlockOf`) and into the report (`rightsAssessments`, `rightsVerdicts`) rather than being dropped after the rights record (§8 D4). |
| 6 | W05 execution belongs to IRR and the operator; IPD's role is limited to its roadmap and supporting records | Yes | Documentation | The handoff's "IPD owns next" framing was wrong and is restructured: execution items (provisioning, coverage evidence, observed-evidence θF work) are IRR + operator items; the IPD side owns roadmap and supporting records only. |
| 7 | W05 does not require integration into a served application flow or IPD endpoint; coverage display belongs to W17 in IRR | Yes | Documentation | "Name the integration surface" is removed as a W05 prerequisite/open item. The modules remain standalone and that is not a W05 gap; coverage display is W17 (IRR). |

## 4. Point 1 detail — the origin of 65, and what has and has not been measured

- **Where 65 came from:** the 2026-11-12 record `W05-ACTUAL-FINANCIAL-DATASET-QUALIFICATION-2026-11-12.md`
  (its coverage table) measures the **published 68-row Dhan CSV** (`B-04` / `§9-A`), of which
  **65 rows are ISIN-resolved**. Its statement is: `0 / 65` (`0.00%`) ISIN-resolved holdings
  (`0 / 68` total rows) match any issuer in `evidence/real-issuer/**` or IPD `src/fundamentals/`.
  So 65 is the ISIN-resolved row count of that CSV. It is not a sum of admitted and not-admitted
  holdings. An earlier version of this section said the record states "2 holdings admitted, 63 not
  admitted"; the record contains no such statement and that explanation was wrong.
- **Two different censuses.** The Dhan CSV measurement (0 of 65 ISIN-resolved rows; 0 of 68 rows)
  and W04 revision 1 (`DHAN_PORTFOLIO` revision 1, **64 holdings**) are different censuses. No
  record maps the rows of one onto the holdings of the other, and none is assumed here.
- **What has been measured:** only the 2026-11-12 measurement above. It is historical and it is a
  measurement of the CSV.
- **What has NOT been measured:** financial-data coverage of the 64 holdings of W04 revision 1.
  Nothing — neither this lifecycle nor any other run — has processed revision 1's holdings.
  "0 of 64" is therefore **not a measured result** and is not stated as one. For IIPS coverage the
  denominator is revision 1's 64 holdings; the numerator is unmeasured.
- **The numerator bound comes from the W04 record, not from this code.** The IPD W04 record
  (`IIPS-W04-EVIDENCE-RECONCILIATION-AND-ACCEPTANCE-ASSESSMENT-2026-11-16.md`) records a stored
  security identity on 1 of the 64 holdings and `NULL` on 63. The roadmap admits a holding to the
  financial ratio only if its own identity passes, so that record bounds the revision-1 numerator
  at one. The bound is a property of the W04 census. The lifecycle does not read that census and
  does not enforce the bound.
- **In the mechanism — what is enforced and what is not:**
  - `financialRatio` enforces arithmetic consistency
    (`holdingsWithFinancialData ≤ identityPassedHoldings ≤ totalHoldings`, violations refused). It
    does not decide which holdings passed identity.
  - The lifecycle routes into issuer rows only the holdings for which the identity resolver returns
    `RESOLVED`, and itemises the rest under `unresolved`. The numerator is therefore gated on the
    **resolver's** result, by construction and by test.
  - `RESOLVED` is **not** the same statement as "W04 identity-passed". The resolver resolves on an
    ISIN and, where a row has no ISIN, on exchange and symbol. A row with a symbol but no ISIN and
    no exchange does not resolve (tested). A row with no ISIN but an exchange and an active symbol
    does resolve, with basis `EXCHANGE_SYMBOL` (tested). The lifecycle also resolves whatever
    observations it is handed; it does not check that they are revision 1's persisted holdings.
  - So no W04 numerator is enforced by this code and none is claimed. The report discloses the
    resolution basis of every resolved holding (`identityBasis`, `HoldingReference.resolutionBasis`)
    so that a reconciliation can be done. **The reconciliation to W04 is outstanding** (§8 D2).
- The 2026-11-12 record itself is date-stamped history and is not altered.

## 5. Point 2 detail — what the branch said before, and what it says now

Before: `PROPOSED_QUALIFICATION_THRESHOLD` (`W05-THF-PROPOSAL-1`) with
`approvalStatus: 'PROPOSED_NOT_APPROVED'` and `provenance.outstandingDecision` = "PRODUCT-OWNER
DECISION OUTSTANDING: approve (or amend) qualification threshold θF…" — i.e. θF presented as a
per-dataset qualification threshold with a W05 product-owner approval dependency. Both halves of
that framing are contradicted by the roadmap and are removed.

Now: two separate things — the per-dataset technical ruleset (no approval axis anywhere) and θF
(the portfolio-wide ratio gating W20, value not asserted, set from observed evidence under the
standing grant, explicitly `isW05Condition: false`). No θF decision is requested for W05.

## 6. Verification

Results for the branch as corrected by the final targeted review of 2026-11-18 (§8), run from
`iips-platform/` in a full (non-shallow, non-partial) clone checked out at
`/home/user/iips-review-recovered`:

- `npm run typecheck` — clean (exit 0). Its scope is `src/**/*.ts`; test files are executed by
  `tsx`, not type-checked by this script.
- `npm run test:iid` — 1651 tests / 344 suites / 1651 pass / 0 fail / 0 skipped.
- `npm test` — 678 tests / 678 pass / 0 fail.
- The four W05 test files: 62 tests (32 qualification, 16 lifecycle, 14 rights record), 0 fail.
- `w05RightsRecord.test.ts` (including the pinned test 13 expectations) is unchanged.
- History of the counts: 1629/339 before the roadmap reconciliation; 1638/341 after it (+9);
  1651/344 after the final targeted review (+13: θF unrounded-ratio and empty-denominator ×1,
  entitlement/retention through qualification ×4, coverage by analytical method ×5, entitlement
  and retention in the report ×1, identity gate ×2).
- Two environmental prerequisites, both unrelated to this change: the A13 tests need full history
  and all blobs (a shallow or blobless clone fails them), and
  `s4R3CandidateBuild.test.ts` pins absolute paths under `/home/user/iips-review-recovered`
  (a clone at any other path fails one subtest).
- Re-verify the branch remotely: `gh pr view 598 --json state,headRefOid,files` and
  `git ls-tree origin/arena/dd0a8542-iips-review-recovered` (per-file blob SHAs).

## 7. Boundaries held

- The merge state of PR #598 is GitHub's to report (`gh pr view 598`), not this document's. A
  merge of the PR is a merge of the mechanism and these records; it is not W05 acceptance.
- **W05 remains IN PROGRESS — NOT ACCEPTED.** No θF decision is requested for W05; no application
  integration is requested for W05; no bulk acquisition or automated retrieval is authorised by
  this reconciliation (D3 stands; D1 manual provisioning only).
- No IPD modification; no cross-repository writes; no invented values or thresholds; missing is
  never zero; redistribution remains `NOT_AUTHORISED`; O3/PA-01/D1–D3/Q7 and the limitation
  dispositions untouched; W07/W10 scope unchanged (and W10's non-established status is recorded
  in the metric-completeness block and in the method-coverage block).

## 8. Final targeted review — 2026-11-18

A review of the whole PR against the roadmap found four discrepancies in the 2026-11-17 state of
this branch. In this section "D1"–"D4" are the review's finding numbers; they are **not** the
governance decisions D1/D2/D3 named elsewhere in this document, which are untouched.

| Finding | What was wrong | Disposition |
|---|---|---|
| D1 — the historical denominator | §4 said the 2026-11-12 record states "2 holdings admitted, 63 not admitted" and restated coverage as "0 of 64". The record says neither: it measures 0 of 65 ISIN-resolved rows of a 68-row Dhan CSV, and revision 1 has never been processed. | **Corrected** in §3 row 1, §4, the handoff, the implementation record and `threshold.ts` (`provenance.impact`). The two censuses are kept apart and "0 of 64" is no longer presented as a measurement. |
| D2 — does `RESOLVED` mean W04 identity-passed? | §4 said the numerator is "identity-gated by construction and by test", which a reader would take as reconciled to W04. | **Not equivalent; limitation documented, no enforced W04 numerator claimed, reconciliation outstanding.** No authoritative mapping supports equivalence: the resolver also resolves on exchange and symbol, and the lifecycle resolves whatever observations it is handed. Two tests state the position exactly (symbol only → `UNMATCHED` / `NO_IDENTIFIER_PROVIDED`, contributes nothing; exchange and symbol → `RESOLVED` with basis `EXCHANGE_SYMBOL`, disclosed). `HoldingReference.resolutionBasis` and the report's `identityBasis` disclose the basis. No revision-1 data was constructed or used. |
| D3 — which "method" | Coverage "by method" was implemented as coverage by **acquisition** method. The roadmap's method is the **analytical** method. | **Corrected.** `methodCoverage` (qualification) and `coverageByAnalyticalMethod` (report) added, reusing the governed method matrix and the existing `qualificationOf` predicate; disclosure only, provisional pending W10, no new gate. The acquisition-method breakdown is kept and relabelled as source/rights evidence. |
| D4 — entitlement and retention beyond the rights record | The qualification evidence kept only the combined status, so the dossier could not show that retention had been assessed. | **Corrected.** `QualificationRightsBlock` carries both verdicts and reasons; the report lists them per issuer and counts them separately. The combined status is unchanged and the `RIGHTS_ELIGIBLE` gate now fails closed on the worst of the three (`effectiveRightsStatus`), so a block missing a verdict is never read as permission. |

Also corrected in the same review, because the roadmap states both rules (coverage methodology,
"round only for display and evaluate the unrounded ratio"; "`|E| = 0` gives not applicable / W20
blocked, never 100%"): `evaluateW20Gate` compared the **rounded** percentage against θF and had
no empty-denominator rule. It now evaluates the unrounded ratio and never opens on a zero
denominator. θF itself is unchanged: no value is asserted and it is not a W05 condition.

**Limitations that remain, stated plainly:**

1. **No reconciliation to W04 exists.** Revision 1's 64 holdings have not been run through the
   lifecycle. Whether a revision-1 holding with a `NULL` stored identity would be `RESOLVED` here
   depends on whether its observation carries an exchange — not established by this work.
2. **The roadmap's eligible set `E` is not modelled.** The financial ratio's denominator is every
   holding supplied to the run. `eligibleHoldings` in the report means "resolved to an issuer",
   which is not the roadmap's `E`.
3. **"Holds financial data" is the per-dataset ruleset, not the roadmap's full financial
   condition.** The roadmap requires all mandatory validated inputs for the applicable analysis.
   Those method-specific inputs are W10's to establish; until then method coverage is disclosed
   per method and is not folded into the ratio.
4. **No actual dossier exists.** Source/rights, filing/period/basis, coverage and dataset digests
   for the actual holdings, and entitlement and retention verified per actual source, are IRR and
   operator work that has not been done.
5. An evidence snapshot recorded before this review has no separate verdicts and now fails the
   rights gate closed. No such snapshot is stored anywhere; the modules are standalone.
6. `w05RightsRecord.test.ts` has 14 type errors under `tsc` (an untyped `permissions()` helper).
   They pre-date this review, lie outside `npm run typecheck`'s scope, do not affect execution,
   and were left alone because the file holds the pinned accepted-behaviour expectations.
