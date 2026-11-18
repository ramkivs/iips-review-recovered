# W05 roadmap reconciliation — seven corrections from the authoritative IPD source

**Date:** 2026-11-17 (UTC)
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
| 1 | Coverage denominator 65 vs W04 rev-1's 64; identity-gated numerator | Yes | Documentation + coverage reporting | Origin of 65 explained (§4); coverage restated **0 of 64 holdings**; the financial ratio is now reported with its identity rule on the face of it (`threshold.financialRatio`, `reporting.financialRatio`) and inputs that would count a holding whose own identity failed are refused, never clamped. Historical records were not altered. |
| 2 | θF is a portfolio-wide ratio gating W20, not a per-dataset threshold, not a W05 condition, set from observed evidence under the standing grant; no defensible value yet; no product-owner approval dependency | Yes | Implementation + tests + documentation | `threshold.ts` re-modelled: θF = `THETA_F` (`W05-THF-PORTFOLIO-RATIO`) with `semantics: PORTFOLIO_WIDE_RATIO`, `gates: W20`, `isW05Condition: false`, `isPerDatasetQualificationThreshold: false`, `assertionStatus: NO_DEFENSIBLE_VALUE_ASSERTED`, `value: null`, `settingRule: SET_FROM_OBSERVED_EVIDENCE_UNDER_THE_STANDING_GRANT`; `evaluateW20Gate` fails closed. The per-dataset mechanism is kept as `DATASET_QUALIFICATION_THRESHOLD` (`W05-DATASET-RULESET-1`) with the entire approval axis REMOVED (`approvalStatus`/`approvalEffect`/`outstandingDecision` are gone; decisions are `MEETS_THRESHOLD`/`BELOW_THRESHOLD`/`CONFIGURATION_MISMATCH`, technical only). Reporting carries θF's standing and the closed W20 gate. |
| 3 | Coverage by issuer, sector AND acquisition method | Yes | Implementation + coverage reporting + tests | `reporting.ts` now emits `coverageBySector` and `coverageByAcquisitionMethod` (`CoverageDimensionEntry`) beside the by-issuer figures; the recorded acquisition method travels in the qualification evidence snapshot (`rights.acquisitionMethod`, taken from the rights record); unprovisioned issuers sit under `NOT_PROVISIONED`; dimension entries cover identity-passed holdings only, with unresolved holdings itemised. |
| 4 | Required-metric set depends on W10, which is not established; do not present it as settled | Yes | Documentation + implementation marker + tests | `MetricCompletenessBlock.requiredSetStatus: 'PROVISIONAL_PENDING_W10'`; every metric-completeness note and the module/fixture comments say the set is provisional pending W10. The mechanics (reported vs missing/nil/zero) are unchanged — the SET's standing is what was corrected. |
| 5 | Verify retention alongside entitlement in the rights assessment | Yes | Implementation + tests + documentation | `rightsRecord.ts` now derives `entitlementStatus`/`retentionStatus` separately — each fail closed — and combines them by fail-closed worst-of; retention covers the RETENTION purpose and the expiry/review window. The combined `status` semantics and accepted reason wording are preserved exactly. |
| 6 | W05 execution belongs to IRR and the operator; IPD's role is limited to its roadmap and supporting records | Yes | Documentation | The handoff's "IPD owns next" framing was wrong and is restructured: execution items (provisioning, coverage evidence, observed-evidence θF work) are IRR + operator items; the IPD side owns roadmap and supporting records only. |
| 7 | W05 does not require integration into a served application flow or IPD endpoint; coverage display belongs to W17 in IRR | Yes | Documentation | "Name the integration surface" is removed as a W05 prerequisite/open item. The modules remain standalone and that is not a W05 gap; coverage display is W17 (IRR). |

## 4. Point 1 detail — the origin of 65, and the restated coverage

- **Where 65 came from:** the 2026-11-12 record `W05-ACTUAL-FINANCIAL-DATASET-QUALIFICATION-2026-11-12.md`
  states "0/65 holdings" and "2 holdings admitted, 63 not admitted" (2 + 63 = 65). Every later IRR
  doc that quoted "0/65" — the implementation record, the handoff, and the threshold module's
  impact note — inherited that record's denominator. It does not reconcile with W04 revision 1.
- **Restated against the correct denominator:** W04 revision 1 has **64 holdings**. Current
  financial-data coverage is therefore **0 of 64 holdings** (the 2026-11-12 provisioning evidence,
  restated). Per the authoritative reconciliation, a holding contributes to the financial ratio
  only if its own identity passes, and for revision 1 the numerator is therefore **at most one**.
- **In the mechanism:** `financialRatio` enforces the rule structurally
  (`holdingsWithFinancialData ≤ identityPassedHoldings ≤ totalHoldings`, violations refused);
  the lifecycle routes only identity-passed holdings into issuer rows and itemises the rest under
  `unresolved`, so the numerator is identity-gated by construction and by test.
- The 2026-11-12 record itself is date-stamped history and is not altered; its superseded
  denominator is recorded here.

## 5. Point 2 detail — what the branch said before, and what it says now

Before: `PROPOSED_QUALIFICATION_THRESHOLD` (`W05-THF-PROPOSAL-1`) with
`approvalStatus: 'PROPOSED_NOT_APPROVED'` and `provenance.outstandingDecision` = "PRODUCT-OWNER
DECISION OUTSTANDING: approve (or amend) qualification threshold θF…" — i.e. θF presented as a
per-dataset qualification threshold with a W05 product-owner approval dependency. Both halves of
that framing are contradicted by the roadmap and are removed.

Now: two separate things — the per-dataset technical ruleset (no approval axis anywhere) and θF
(the portfolio-wide ratio gating W20, value not asserted, set from observed evidence under the
standing grant, explicitly `isW05Condition: false`). No θF decision is requested for W05.

## 6. Verification (all run on the corrected branch)

- `npm run typecheck` — clean.
- `npm run test:iid` — 1638 tests / 341 suites / 0 fail (was 1629/339; +9 from the new
  reconciliation tests: θF semantics ×4, coverage dimensions ×2, financial-ratio identity gate
  (included in the θF set), retention ×3).
- `npm test` — 678 / 0 fail (after `git fetch --unshallow origin`, the known environmental
  prerequisite for the A13 tests).
- `w05RightsRecord.test.ts` test 13 (pinned accepted-behaviour expectations) runs unchanged.
- Re-verify the branch remotely: `gh pr view 598 --json state,headRefOid,files` and
  `git ls-tree origin/arena/dd0a8542-iips-review-recovered` (per-file blob SHAs) — the IPD side can
  compare these against GitHub's UI once IRR reads are available to it.

## 7. Boundaries held

- PR #598 is NOT merged and is left open for the Principal. Accepted behaviour is unchanged.
- **W05 remains IN PROGRESS — NOT ACCEPTED.** No θF decision is requested for W05; no application
  integration is requested for W05; no bulk acquisition or automated retrieval is authorised by
  this reconciliation (D3 stands; D1 manual provisioning only).
- No IPD modification; no cross-repository writes; no invented values or thresholds; missing is
  never zero; redistribution remains `NOT_AUTHORISED`; O3/PA-01/D1–D3/Q7 and the limitation
  dispositions untouched; W07/W10 scope unchanged (and W10's non-established status is now
  recorded in the metric-completeness block).
