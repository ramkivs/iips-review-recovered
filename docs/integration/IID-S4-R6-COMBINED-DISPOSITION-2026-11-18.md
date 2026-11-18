# S4-R6 / G-4 — combined source verification and data dispositions

Date/assessment clock: **2026-11-18**. Baseline: `078232863bfa300759023549b02d9b81f9a6137b`.
Designated branch: `arena/5461e5b5-iips-review-recovered`; publication PR #597.
**Supported partial result; no new metric admission; S4-R6 OPEN / G-4 OPEN.**

## A. Infosys — no qualifying numeric observation verified

Requested period is FY26, year ended 2026-03-31, consolidated. Original issuer sources were accessed independently, not treated as established by the supplied analysis:

| Original issuer document | Verified locator / scope | Finding and limitation |
|---|---|---|
| [Integrated Annual Report 2025–26](https://www.infosys.com/investors/reports-filings/annual-report/annual/documents/infosys-ar-26.pdf) | Cover; official [report download centre](https://www.infosys.com/investors/reports-filings/annual-report/annual-reports/ar-2025-26.html); separate [Business highlights](https://www.infosys.com/investors/reports-filings/annual-report/annual/documents/2025-26/business-highlights.pdf), printed pp30–31 (p31 footer visible; preceding page identified by sequence) | Confirms FY26 context: revenue/growth, large-deal TCV/net-new share, and client tiers. These do not supply fixed-cohort NRR or recurring-revenue share. |
| Same annual report, [Management’s discussion and analysis](https://www.infosys.com/investors/reports-filings/annual-report/annual/documents/2025-26/managements-discussion-and-analysis.pdf) | Overview, I–III; [Consolidated statements](https://www.infosys.com/investors/reports-filings/annual-report/annual/documents/2025-26/consolidated.pdf), index locates note2.18 Revenue from operations at printed p363 | Sections located; **p363 and the full notes were not independently read**. Index location is not evidence of what that page discloses. |
| [FY26 Form20-F](https://www.infosys.com/investors/reports-filings/annual-report/form20f/documents/form20f-2026.pdf) | Cover: fiscal year ended March31,2026; Item3.D risk subsection “Our engagements with clients are typically singular in nature and do not necessarily provide for subsequent engagements” (reader chunks5–6; physical page not exposed) | Describes repeat business by prior-year client participation, not a fixed-cohort revenue-retention calculation or a quantified recurring-revenue percentage. No page number invented. |

**Verification boundary:** the source reader parses PDFs up to 30 pages. It supplied navigable sections and the separate official extracts above, not complete original-report bytes. Shell outbound access is restricted to the configured code/package hosts; no issuer PDF byte download, full-document text search, byte digest, or page-complete negative verification was obtained. Search snippets/third-party mirrors were not promoted to original full-report evidence. Thus **the supplied NOT_DISCLOSED findings remain provisional at full-document level**, not independently certified absence across both entire filings. Source access is partial, not proof the filings themselves are unavailable. Completing the original-document review (including note2.18 and the 20-F financial notes/operating review) is the precise evidence blocker; a source file accessible within the workspace would permit local inspection without changing policy.

### Data disposition

| Metric | Operational disposition | Contract representation / numeric admission |
|---|---|---|
| `TM_NRR` | No qualifying number verified; provisional NOT_DISCLOSED in the reviewed scope | `MISSING / NOT_REPORTED / value:null`; blank-value parser result `UNVALIDATED`, issue `MISSING_VALUE`. No numeric row admitted. |
| `TM_RECURRING_REVENUE_PCT` | Same | Same. |

NOT_DISCLOSED is an evidence/disposition label, not a new enum. `NOT_REPORTED` is the existing closed-vocabulary missing reason. It is **not ZERO**, `NIL_BY_DISCLOSURE`, a validated observation, or a claim of completed whole-filing verification. Blank-value representations were exercised in memory only and not added to the dataset. Growth, client-tier counts, TCV, repeat-business descriptions, contract-type mix, segments and RPO cannot be substituted for these metric definitions. No estimate was constructed.

### Actual assessment, explicitly not FY26

Read-only `assessCompany` on the existing S4-R2 Infosys input bundle at 2026-11-18 has annual valuation basis **2024-03-31**, age **962 days**, `staleBeyondPolicy:true`, flag `STALE_STATEMENTS`. This is repository evidence in memory, **not a statement about installed host state** and not a FY26 assessment. `EV_REVENUE`: `applicable:false`, output absent, exact reason:

`MANDATORY_METRIC_MISSING: TM_NRR, TM_RECURRING_REVENUE_PCT`

Zero invariant violations. A future FY26 metric would also require an admitted, matching FY26 annual statement basis; refreshing statements is not silently performed by this metrics task.

## B. KEC — supplied ratio is FY25, not FY26

Independent original-source verification contradicts the supplied period label:

- [Issuer release, May26,2025](https://www.kecrpg.com/press-release/earnings/financial-performance-for-quarter-&-year-ended-31-march-2025-26-05-25), sections **Consolidated Financial Performance** and **Consolidated Order Intake and Order Book**: supplied order intake/revenue belong to **FY25**. The closing order book is separately dated March31,2025; FY26 year-to-date orders are separately discussed.
- [Original Q4FY25 presentation, May26,2025](https://www.kecrpg.com/media/investorAnalystsFilesMedia/Investors%20Presentation%20Q4%20FY25.pdf), headings **Profit and Loss Summary (Consolidated)** and **Order Intake & Order Book (Consolidated)**: corroborates period/scope; order intake is distinct from closing order book and L1. Reader does not reliably expose slide numbers; headings are the exact locators. Its disclaimer prohibits copying/dissemination; no slides or text are republished.
- Existing admitted-source metadata: `evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/source/source-bytes.json` and `page-map.json`. FY26 annual report PDF p117, printed pp230–231, consolidated P&L, revenue-from-operations row: FY26 **23,505.54**, FY25 comparative **21,846.70** crore. FY25 report PDF p110 corroborates audited FY25 revenue. FY26 report PDF p6, printed pp8–9, labels different FY26 order-intake/book figures. These existing page files were inspected without copying them into this publication. A new original FY26 annual-PDF reader fetch failed; existing provenance is not mislabeled as a successful new byte retrieval.

Arithmetic on the **supplied rounded FY25 figures**:

`24,689 / 21,847 = 3527 / 3121 = 1.1300865107337392… → 1.13`.

That is arithmetically correct but **not a FY26 metric**. The rounded presentation denominator also differs from the audited FY25 row's two-decimal precision; no silent substitution of denominator or period. Confirmed order intake is the appropriate concept, not closing order book/L1. That conceptual match does not cure the source-period conflict. No replacement FY26 ratio has been sought or admitted under cover of this supplied candidate.

### Admission/disposition decision

`BLOCKED_SOURCE_PERIOD_MISMATCH`: source period2025-03-31 versus requested2026-03-31. **No FY26 canonical numeric record constructed; no ingestion, VALID claim or availability unlock.** Do not put a falsely dated candidate through the parser and cite its structural result as source validation. Mandatory source-period verification fails before that step. The field-level requirements remain `IN_BOOK_TO_BILL`, `RATIO`, range0–10, consolidated annual issuer/period match, source class at least `OPERATOR_ENTERED`, precise source/derivation locator, observation/entry timestamps and all validation checks. No canonical CSV is committed, and no historical FY25 record is silently admitted instead.

### Freshness — actual rule, no invented rejection

2026-03-31 → 2026-11-18 = **232 days**, **32 over the 200-day P&L window**. The actual supplied FY25 period would be **597 days** old. `assessment/policy.ts` specifies P&L200, balance-sheet250; these are **not a universal 200-day metric-CSV admission validator**. `assessment/freshness.ts` anchors statement age to **period end**, not publication, `observed_at`, or `entered_at`. No existing authorized publication-date exception was found.

`parseOperatingMetricsCsv` (`ingestion/builder.ts`, operating-metrics section) has no assessment-clock/200-day freshness rejection. `assessment/methods.ts:metricFor/metricGap` checks VALID/PRESENT, latest annual period, scope, source floor; no separate age test. Statement freshness feeds flags/confidence, and must not be described as an emitted metric validation failure. No fresh-value probe, parser bypass, backdating, policy/threshold change or defect reopening was performed.

Actual read-only KEC assessment on existing WI8 committed inputs: valuation basis2026-03-31, age232, `staleBeyondPolicy:true`, `STALE_STATEMENTS`; `EV_REVENUE` is `applicable:false`, output absent, reason **`MANDATORY_METRIC_MISSING: IN_BOOK_TO_BILL`**, zero invariant violations. **Withholding reason is missing metric, not a fabricated `STALE_METRIC` error.** No basis to claim AVAILABLE. The existing freshness behavior is retained; if different metric-age admission semantics are desired, the application owner must explicitly decide that prospectively, not have the agent invent an exception. That decision would not repair a mislabeled source period.

## C. Remaining requirements and closure

Reuse, not recomputation: original `evidence/real-issuer/S4-R6-OPERATING-METRICS-2026-11-18/runs/metric-requirement-matrix.json` (14/38 metric-gated slots). The two live slots above remain unresolved; the other twelve remain unmeasured in their sectors:

| Sector | Method | All mandatory metrics |
|---|---|---|
| Materials | NAV_RESERVES | MM_RESERVE_LIFE; MM_COST_POSITION |
| Utilities | REGULATED_ASSET_BASE | UM_RAB; UM_ALLOWED_ROE |
| Auto | EV_REVENUE | AU_CAPACITY_UTILISATION; AU_MARKET_SHARE |
| Energy | EV_EBITDAX | EM_LIFTING_COST |
| Energy | NAV_RESERVES | EM_RESERVE_REPLACEMENT |
| Healthcare | EV_EBITDA | HC_OCCUPANCY; HC_ARPOB |
| Hospitality | EV_EBITDA | HM_REVPAR |
| Banking | RESIDUAL_INCOME | BM_NIM; BM_GNPA; BM_CET1 |
| Banking | PB_RELATIVE | BM_GNPA |
| Insurance | P_EMBEDDED_VALUE | IM_EMBEDDED_VALUE; IM_VNB_MARGIN; IM_SOLVENCY |
| Capital Markets | P_AUM | CM_AUM; CM_COST_TO_INCOME |
| Telecom | EV_SUBSCRIBER | TL_SUBSCRIBERS; TL_ARPU |

For exact definitions, units, ranges and source floor **reuse each slot's `metricDefinitions` in that unchanged matrix**, not a new census. Every required metric must be real, source-supported, VALID/PRESENT, match the issuer's qualifying annual scope/period (assessment uses latest annual), meet at least OPERATOR_ENTERED source quality, and accompany other method prerequisites. A structurally valid metric does not prove method availability. None of the twelve slots is claimed resolved by examining these three metric IDs.

[Prior closure requirements](IID-S4-R6-CLOSURE-REQUIREMENTS-2026-11-17.md) remain unchanged: numeric route needs qualifying real observations **and actual AVAILABLE named methods for an explicitly bounded scope**. Current results fail that test. Accepted-limitation closure instead requires **Ramki's explicit S4-R6-only criterion reconciliation, scope and final acceptance**, under PA-01 §1/§3 G-6/G-8 and O1 §1 authority. This report makes no owner decision and creates no new approval ceremony. Keeping withheld is honest operation, not numeric completion or automatic closure.

## D. Execution, publication and rights boundary

Evidence: `evidence/iid/S4-R6-COMBINED-DISPOSITION-2026-11-18/` contains a reproducible bounded read-only verifier, metadata-only assessment/disposition receipt, original-matrix/preserved-file identities, new scoped checks and checksums. Actual assessment output is projected to statuses/reasons/age/invariant verification only; valuation payloads, source PDFs/page text, datasets and canonical numeric rows are not redistributed. [Infosys terms](https://www.infosys.com/terms-of-use.html), Limited License/use restrictions, and the KEC presentation disclaimer were checked; no new redistribution right inferred. Existing O3/W05 local-analysis boundary is preserved. Search-returned exchange links were not fetched or published as source evidence.

New assertions cover only these actual assessments, missing-value representation, arithmetic/age and publication/preservation. **No PR591 capability-probe, 25-test gating suite, old matrix/census, completed Stage4 audit, scoring or product-policy rerun/change.** No host installation, source/dataset writes, merge or owner acceptance. Exact command/result is in `validation.txt`; final remote read-back is recorded in the PR comment after push.

## E. Final status

**S4-R6 OPEN. G-4 OPEN.**

Genuine blockers: Infosys whole-original-document negative verification incomplete and its current repository basis is FY24; no qualifying numeric observations for either technology metric; KEC supplied numerator/denominator are FY25, not requested FY26; actual FY26 basis is stale under unchanged P&L policy; no actual method unlock; no explicit accepted-limitation owner closure. This publishes supported partial work without converting any blocker into a false PASS.
