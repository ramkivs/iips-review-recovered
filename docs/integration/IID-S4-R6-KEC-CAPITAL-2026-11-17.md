# S4-R6 / G-4 — KEC FY26 financial evidence and net-debt reconciliation

**Disposition: S4-R6 OPEN; G-4 OPEN. No definitive IID net debt, new capital admission, owner-runtime installation, accepted-limitation decision or closure.** This is an additive correction to the [prior FY26 adoption report](IID-S4-R6-FY26-ADOPTION-2026-11-18.md), not a rewrite of historical execution. Work executed on **2026-11-17 UTC**; November 18 is the explicitly requested assessment scenario, not today's date. Neither date changes filing/period anchors.

> **Current additive update:** [Section H](#h-uploaded-statutory-extract--additional-reconciliation) records the newly supplied statutory extract, resolves the Note34 interest sublines and buyer-credit/supplier-finance gaps, and verifies actual assessments without a BTB ingestion. Earlier A–G access-limit statements are historical where Section H explicitly supersedes them. Canonical net debt and S4-R6/G-4 remain unavailable/open.

## A. Repository and execution boundary

Starting published head `187783d047ed63da31fd00276d41423ba318b91d`, tree `4cfb5090d4936e4bc3669bd876cf7baff2ffdc55`, PR **597 OPEN**, branch `arena/5461e5b5-iips-review-recovered`. Recovered checkout initially pointed at `2ec2e75`; all 60 recovered changed/untracked files were verified byte-identical to remote head, backed up under the ignored local directory, then safely fast-forwarded. No unrelated edits were discarded. Prior CI `44304624869` is historical, not this patch's CI. Final commit/tree/changed blobs and exact-head CI are recorded in the PR publication receipt after push; no merge is requested.

Prior private dataset was absent after recovery. A **new, isolated KEC verification fixture**, not a replacement/shrink of the historical three-issuer dataset, was therefore built from byte-identical existing statement/roster inputs and the already-admitted BTB semantics. No new economic observation was admitted; only one copy of the existing BTB observation is present in this fixture. Infosys FY24/FY26 preservation, supplied identifiers/coverage/findings/proposed dispositions and both KEC candidates remain in the [prior complete preservation sidecar](../../evidence/iid/S4-R6-FY26-ADOPTION-2026-11-18/supplied-review-and-mapping.md), unchanged. Infosys/Marico are not re-investigated or reassessed here.

All new CSV, datasets, logs and full assessment/qualification payloads remain under `LOCAL-ONLY-DO-NOT-PUBLISH/kec-final-source/`, ignored. Published artifacts are this reconciliation and verification metadata/tests only. Existing source extracts are referenced, not copied again. Public retrieval is not a licence. [W05 rights boundary](W05-RIGHTS-QUESTIONS-Q1-Q7-ADDENDUM-2026-11-17.md) and PA-01 remain unchanged; no direct NSE filing link or new automated NSE collection is published.

## B. Financial evidence, definition and admission

Unless stated otherwise, amounts are ₹ crore, consolidated FY26 **2025-04-01–2026-03-31**. Sources inspected: issuer May 16 FY26 earnings release (sections Consolidated Financial Performance, Order Intake and Order Book, Net Debt/NWC, Dividend); issuer Q4 FY26 presentation (Profit and Loss Summary — Consolidated/Standalone; Borrowings & Working Capital — Consolidated); retained audited annual-report extracts with original-byte hash `ba638897313ac1fe5b7da42d7a95dac5f9efec1d1a203f88d9f963622ba3c820`; and the official RPG parent mirror of the May 16 audited results, consolidated results/statement of assets and liabilities/notes 3–5. Web retrieval does not establish original PDF byte identity for the mirror or independently certify the whole annual report.

| Supplied observation, preserved | Finding / exact locator | Admission treatment |
|---|---|---|
| Revenue **23,506**, growth **8%** | Release consolidated FY26; audited consolidated results annual column **23,505.54**, FY25 21,846.70 | Exact revenue already canonical; no rounded duplicate |
| Standalone revenue **19,047** | Presentation standalone FY26; different scope (filed precise 19,046.58 was previously located, not newly byte-verified here) | Not consolidated denominator; no admission |
| EBITDA **1,659**, growth **10%**, margin **7.1%**, improvement **20 bps** | Presentation consolidated FY26 versus FY25 1,504 / 6.9%; audited results note 5 total segment results **1,658.57**, before other income, finance, D&A and exceptional items | Operating measure, not IID derived EBITDA; evidence only |
| PBT **789**, PAT **606** | Audited consolidated results **789.14 / 605.59** after exceptional expense 58.78; release rounded | Exact fields already canonical; no duplicate |
| Intake **25,280**, approximately **70% T&D** | Release Order Intake confirms amount; supplied ~70% intake mix preserved, **not independently verified by the inspected sections**. Do not substitute presentation's 68% FY26 revenue mix, Q4 70% revenue mix or annual 63% closing-book mix | Intake used only through existing BTB observation; mix evidence only |
| Closing order book **36,267** | Release Order Book as at March 31; annual Financial Performance printed pp.16–17 | Preserved; no new order-book metric; not BTB numerator or book+L1 |
| EPS **22.75**, face value **₹2** | Audited consolidated results annual EPS / paid-up capital captions; annual Financial Performance | EPS already canonical; face value context, no duplicate |
| NWC **137 days** | Release/presentation Net Debt and Working Capital | No new supported metric mapping; evidence only |
| Equity / supplied “net worth” **6,160** | Audited assets/liabilities **total equity 6,159.69 = 53.24 + 6,106.45**. Results note 4 separately defines net worth excluding OCI and reports **5,682.05** | Preserve supplied wording but do not equate issuer-defined net worth to total equity or debt; total equity already canonical |
| Recommended dividend **₹5.50 / 275%** | Board letter / results note 3 / release Dividend, face ₹2; recommendation subject to shareholder approval | Not dividends-paid; no new canonical fact |

**EBITDA definition resolved:** `789.14 + 663.60 + 197.38 = 1,650.12` is the existing IID derived `EBITDA` (`fundamentals/derive.ts`; line-item contract marks it derived). Management operating EBITDA is `1,658.57`; `1,658.57 + 50.33 − 58.78 = 1,650.12`. Thus the **8.45** difference is explained by other income and exceptional expense, not rounding. The actual replay asserts IID's 1,650.12 and no filed EBITDA override. Rounded presentation bridge 1,659 + 50 − 197 − 664 = operating PBT 848; exceptional −59 → PBT 789, PAT 606 (operating PAT 650). Do not ingest headline 1,659 into the derived field.

**BTB unchanged:** `25,280 / 23,505.54 = 1.075491139535616`, ≈ **1.08**, existing **1–1.1** band. Same period/scope numerator and denominator only. Neither 36,267 book, book+L1 >40,000, standalone revenue nor old FY25 24,689 / 21,846.70 is substituted. Arithmetic, ingestion, qualification and method availability are different claims.

Source URLs (no new source-text redistribution):
- Issuer annual: `https://www.kecrpg.com/public/media/annualReportMedia/KEC_Annual_Report_2025-26.pdf`
- Issuer presentation: `https://www.kecrpg.com/media/corporatePresentationFilesMedia/Corporate%20Presentation%20Q4%20FY26.pdf`
- Issuer release: `https://www.kecrpg.com/press-release/earnings/financial-performance-for-quarter-&-year-ended-31-march-2026`
- Official parent mirror, May 16 results: `https://www.rpggroup.com/assets/investors/pdfs/kec-international-statement-of-consolidated-financial-results-q4-fy25-261779694519.pdf`, parsed chunks 2–4, consolidated annual results, assets/liabilities and notes 3–5. The exchange filing's indexed 2,120.73 was corroborated in this fetched mirror; not asserted as a fresh exchange PDF-byte audit.

## C. Thirteen-row capital reconciliation

Retained sources: `evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/source/` (BS PDF117, note30 PDF136); `evidence/real-issuer/WI8-L039-CASH-SIDE-2026-11-07/source/` (notes16–18 PDF131, note19 PDF132, note54 PDF145), also retained under `L039-DELTA-2026-11-17/source/`. Page numbers below distinguish PDF leaves from printed pages.

| # | Component / amount | Source and overlap finding | Existing IID eligibility / action |
|---|---|---|---|
| 1 | Current borrowings **4,441.86** | Note30 PDF136 / printed269: demand bank secured 2,538.96 + other unsecured 100 = 2,638.96; other short-term bank 597.54 secured + 525 unsecured = 1,122.54; FI unsecured 444.76; current maturities 235.60 (10.78 + 224.82) | `SHORT_TERM_BORROWINGS` **4,206.26** + `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` **235.60**, already canonical. Never add maturities twice |
| 2 | Non-current borrowings **661.37** | BS PDF117 / printed230; note25 referenced. Full note25 schedule not retained/independently inspected in this pass | Existing `LONG_TERM_BORROWINGS`; no new breakdown asserted |
| 3 | Leases **274.53** | BS non-current **220.60** + current **53.93**, notes26/31 references; note54 confirms aggregate. Full lease movement/terms not independently inspected | Existing `LEASE_LIABILITIES` included **once**; borrowings 5,103.23 exclude it |
| 4 | Cash/equivalents **411.26** | Note17 PDF131 / printed259: current accounts 306.35, original-maturity <3-month deposits 92.89, bank subtotal399.24, cash-on-hand10.82. Extract components sum **410.06**, not411.26: **1.20 extraction/source-table discrepancy unresolved pending original visual check** | Existing filed total retained, not reconstructed from inconsistent extract; no “unrestricted411.26” claim |
| 5 | Other bank balances **100.67** | Note18 same page: unpaid dividend **3.06** + >3<12-month deposits **3.20** + margin/security **94.41** against borrowings, guarantees and commitments =100.67 | Separate bank caption, not current investments/cash equivalents; not folded into available cash. 3.20 eligibility not established |
| 6 | Current investments **unknown** | L039 delta determination remains authoritative; no reported canonical amount or explicit nil established. Old absence-as-zero interpretations are superseded | **MISSING / NOT_REPORTED / null**; no zero, non-current holding or bank-deposit substitution |
| 7 | Restrictions / pledged deposits | Note17 repatriation restriction **1.54** within CCE. Note18 unpaid3.06 and margin/security94.41 are known restrictions/earmarking; BG versus LC split, overlap with1.54 and unencumbered3.20 not established | Contract component `restrictedCash` remains **NOT_COMPUTABLE / NOT_REPORTED**: schema/path does not separately represent this detail. Evidence is known; runtime status is not an assertion of no restrictions. No new subtraction/eligibility policy |
| 8 | Trade acceptances **2,120.74 annual** / **2,120.73 May results** | Annual BS/note54 PDF145 / printed286 separately lists acceptances from borrowings/payables; results consolidated assets/liabilities prints2,120.73. Presentation labels rounded2,121 “Interest Bearing Acceptances” | Preserve both precise versions and source identities. Difference **0.01 crore = ₹100,000**, both round2,121; cause not established, **not a material adjustment**. No closed-contract extra debt input |
| 9 | Buyer's credit **unknown separately** | Note30 totals inspected, but note30.2 continuation and note33 full procurement-finance terms not available in retained pages/first30-page fetch. Cannot determine inclusion in597.54/other borrowings or acceptances | Unknown ≠ zero. Do not add separate inferred amount or assert no overlap |
| 10 | Bills discounted / other supplier finance **unknown generally** | Note16.1 PDF131 explicitly reports **Nil FY26 non-recourse receivable carrying amount and cash proceeds**, prior63.14/62.41. This covers that receivables arrangement only, not all bills/buyer credit | Do not use narrow nil to infer procurement finance nil or add it to debt |
| 11 | Other financial liabilities **115.68** | BS PDF117 / note34 reference. Note54 borrowings **including interest accrued5,113.14**, versus BS5,103.23 gives **9.91** classification difference. Full note34 allocation not independently verified. Note19 current other financial assets276.90 is not cash | No wholesale other-liabilities-to-debt mapping; no additional9.91 debt admission. Classification-level explanation, not proof of exact note34 subline or management treatment |
| 12 | Management net debt **4,601 + 2,121 = 6,722** | Presentation Borrowings & Working Capital — Consolidated labels base “Net Debt”, separate “Interest Bearing Acceptances”, total; release says including acceptances. ~450 April collections explanation is post-period, not March cash | Separate management measure, evidence only; full audited cash/interest/lease offset bridge still absent |
| 13 | Historical supplied candidate **4,691.90**, debt **5,103.20 “including leases”**, cashlike **411.30** | Preserve supplied arithmetic5,103.20−411.30. Audited borrowings5,103.23 are **before** leases; correct existing gross debt5,377.76 | Neither this candidate nor6,722 admitted as IID net debt. Source/scope/definition inconsistencies cannot be repaired by choosing the more plausible number |

**Corrections to prior report:** cash/bank detail was already retained and is now inspected; saying it was unavailable is superseded. The9.91 difference is no longer wholly unexplained: note54 expressly includes accrued interest. This does not establish a management cash-offset bridge or authorize mapping all interest/acceptances into IID. No old L039 census/probe or L038 investigation was repeated. Full notes25/26/30 continuation/31/33/34 remain a specific source-review gap, not claimed complete.

## D. Exact contract, partial bridges and residuals

The actual runtime path is `assessment/capitalStructure.ts`, **not** the legacy v0 NET_DEBT derivation:

- Gross debt = same-instant short-term4,206.26 + maturities235.60 + long-term661.37 + leases274.53 = **5,377.76**.
- Cash/investments = same-instant CCE411.26 + **reported current investments**. Current investments missing → aggregate missing → **net debt missing**.
- No direct management-NET_DEBT override, other bank-caption offset, extra-acceptances term or restricted-cash numeric field exists in this path. The1.54 known restriction highlights a representational limitation; do not silently claim all recorded CCE is eligible or invent a formula change. No double subtraction is authorized either.
- Equity conversion also carries minority, preference and associates/JV under existing rules; none is repaired here. Missing current investments alone suffices to withhold EV methods.

Diagnostics only, not admitted net-debt alternatives:

| Calculation | Result / unresolved comparison (₹ crore) |
|---|---|
| 5,103.23 − 411.26 | **4,691.97**, versus management base4,601: **90.97** residual |
| 5,103.23 − 411.26 − all other banks100.67 | **4,591.30**, **9.70 below** management base; not permissible proof that all bank balances offset debt |
| Including note54 interest:5,113.14−411.26−100.67 | **4,601.21**, rounds4,601, residual**0.21** versus rounded base. **Arithmetic compatibility only**, not a verified management definition; notably would include restricted bank balances |
| Above4,601.21 + annual acceptances2,120.74 | **6,721.95**, rounds6,722; residual**−0.05** versus rounded headline. Using results2,120.73 gives6,721.94 (−0.06). Neither resolves source classifications |
| 6,722 − supplied4,691.90 | **2,030.10**, not2,120.74; remaining difference**90.64** |
| 4,691.97 + annual2,120.74 | **6,812.71**, **90.71 above** management6,722 (using results2,120.73 gives6,812.70 /90.70) |
| Contract gross5,377.76 − CCE411.26 | **4,966.50**, **365.50 above** management base4,601; not IID net debt without current investments |
| 4,966.50 + annual2,120.74 | **7,087.24**, **365.24 above** management total6,722 |

Thus9.91 accrued interest and100.67 banks give a strong **candidate arithmetic bridge**, not authority to assert management nets every restricted balance or excludes leases in exactly this fashion. Exact published management component definition and the1.20 cash-component discrepancy remain unresolved. No unexplained residual is silently declared zero.

## E. Supported CLI execution, actual assessment and validation

Normal CLI (exit0, no `--allow-errors`, no policy override):

```text
iips-platform/node_modules/.bin/tsx iips-platform/src/investment/cli/ingest.ts --input LOCAL-ONLY-DO-NOT-PUBLISH/kec-final-source/input/kec --dataset-dir LOCAL-ONLY-DO-NOT-PUBLISH/kec-final-source/dataset --now 2026-11-17T00:00:00.000Z
iips-platform/node_modules/.bin/tsx evidence/iid/S4-R6-KEC-CAPITAL-2026-11-17/verify.ts
```

Digest-verified read-back **`sha256:a62f95f81a923e72fb6b4e0220bb8852d08191d14e94b1997a12bbfe8d4a0daf`**; isolated one-issuer/one-metric fixture. This is **not** the absent historical combined adoption digest `sha256:590b3ea9602248ca63be2701144c492cc00e0d252285be2c5b816159e462e1cf`. Changing fixture population/provenance produces a different digest; no successor/adoption claim is made. Statement/roster hashes equal prior receipts. Source-rights state **OPERATOR_ASSERTED**, not owner-admitted. Canonical/parser/port BTB equality verified, no error issues; FY26 annual row unique; existing history preserved.

Actual `assessCompany` **and** `qualifyIssuerToEngines` executed at both UTC execution-date November17 (**231 days**) and requested November18 scenario (**232 days**):

- BTB parser/canonical **VALID/PRESENT** ≠ fresh: `bookToBill` **STALE / FIELD_STALE**, PNL **200** days, no value forwarded. `debtEbitda` **RESOLVED**, balance-sheet **250** days. No changed threshold, publication-date anchor, observation-date refresh or backdating.
- Certified Industrials **NOT_QUALIFIED**, **1/14** required inputs resolved. No scoring verdict or closure from one metric.
- Gross debt **PRESENT**, current investments **MISSING/NOT_REPORTED/null**, restrictedCash **NOT_COMPUTABLE/NOT_REPORTED**, cash/investments and net debt **MISSING**.
- Actual **EV_REVENUE / EV_EBITDA not applicable**, null outputs: `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable`.
- DCF enterprise calculation is applicable with an output object; **that does not mean a per-share valuation**. Net-debt conversion remains blocked. No all-methods-withheld overclaim.
- Confidence **data0.7 / model0.0833 / combined0.3199**, caps `STALE_DATA`, `DILUTION_PROXY`, `POLICY_DEFAULT_WACC`; existing WACC assumption penalty preserved. **Zero invariant violations** at both clocks.

Automatic CLI coverage is an input-coverage side effect, **not** a certified assessment or new census. Published **14/38 matrix** hash `49ba845c83cc6a2f0fc82a01fcc1a30e6d34de7ad4f06291cd37f782d82b1d62` and **twelve unmeasured** remain unchanged; the isolated fixture's coverage must not replace that matrix. Existing 12 probes/25 tests were not repeated. Targeted validation metadata and focused regression tests are in [the evidence bundle](../../evidence/iid/S4-R6-KEC-CAPITAL-2026-11-17/README.md).

## F. Completed, remaining and closure status

Completed: canonical contract inspected; original management labels and operating-EBITDA distinction verified; detailed retained cash/bank/restriction and current-borrowing schedules consolidated; accrued-interest difference explained at classification level; both precise acceptance amounts preserved without materiality invention; all supplied performance/capital observations retained; zero speculative admissions; supported CLI replay/digest/read-back, actual issuer/certified assessments and targeted checks.

Remaining: authoritative management cash/interest/lease/acceptance definition, detailed borrowing/buyer-credit/bill overlap and full notes25/26/30/31/33/34 review, original visual verification of note17 arithmetic, and a contract-supported current-investment observation. These are real source/representation gaps, not proof of nil. Independent Infosys missing NRR/recurring-share limitations and owner-adoption gaps remain as previously recorded, not reinvestigated or waived.

**Numeric closure not met:** EV_REVENUE/EV_EBITDA are not actually AVAILABLE and no application-owner closure criterion is adopted. **Accepted-limitation closure not adopted:** requires an explicit ordinary PA-01 application-owner decision naming criterion, population, local scope, accepted withholding and final status. Agent does not supply it. **S4-R6 OPEN / G-4 OPEN**; no G-9/G-15, new policy or unrelated limitation work.

## G. Single next required action

**Obtain one authoritative issuer reconciliation package**: March31 management net-debt calculation with gross borrowings/accrued interest/leases, eligible versus restricted cash/banks/current investments, acceptances/buyer-credit/bills overlap, supported by full relevant audited notes and the original note17 table. Do not repeat the completed absence-as-zero search, re-ingest unchanged facts or select a net-debt candidate on arithmetic compatibility. Without that package, only an explicit application-owner accepted-limitation decision—not an agent inference—can adopt a different closure route.

## H. Uploaded statutory extract — additional reconciliation

### H.1 Source provenance and current execution

**Additional evidence, not a competing investigation.** Starting remote PR597 head **`d9a68b02629e421c75f409ca5abdfd19592a0f1d`**, tree **`368a2aaddffc13bec44ea8ec1588302bc474e3c0`**, same designated branch. The recovered checkout again contained70 restored files at base2ec2e75: each was byte-compared to remote, backed up ignored, and safely fast-forwarded. No unrelated work was lost. The existing private runtime snapshot was absent again; recovery is described in H.8. No owner/Windows installation or merge.

The user supplied **`KEC_Consolidated_Notes_Verified_Extract.txt`**, SHA-256 **`5b1c7244fdbc22182e42b174b2d726b0897a2cd8ad58ef8a2dd7f48f4aeafd0e`**. Complete supplied page sections **PDF126,131,134–138,144–147** were inspected, not just selected search snippets. Reporting scope is explicitly **consolidated**, year ended **March31,2026**, FY25 comparatives, INR crore; the May16,2026 audit/signature date remains supported by retained PDF119. No standalone substitution or annual-publication freshness anchor.

**Verification boundary:** this is a user-supplied text extraction labelled “Verified”, not the original PDF or rendered page images. Its title is not an independent certificate. We verified its contents and cross-checked overlapping tables against retained issuer-report extracts; we do not claim a new original-PDF byte/visual audit or whole-report inspection. Note19 is not in this upload: its existing complete PDF132 extract was inspected instead. The raw upload, split-page text, reconstructed dataset and full computed payloads stay private/ignored. Only hash-bound evidence summaries and verification code/results are published; the attachment is not republished or treated as a redistribution licence.

Full41-row source-reference/classification inventory: [statutory-source-review.json](../../evidence/iid/S4-R6-KEC-CAPITAL-2026-11-17/statutory-source-review.json). Material rows follow (all monetary values ₹ crore):

| Statutory reference | PDF / printed page | FY26 | FY25 | Source finding / distinction |
|---|---|---:|---:|---|
| Note25 non-current borrowings |134 /265|661.37|358.46|Term loans net of current maturities |
| Note30 current borrowings |136 /269|4,441.86|3,342.64|Not4,451.77; includes maturities235.60/120.10 |
| Notes25+30 arithmetic |134,136|5,103.23|3,701.10|Before separate accrued-interest classification |
| Note34(a) accrued interest, borrowings |138 /273|9.91|5.56|Exact previously unverified subline now inspected |
| Note54A borrowings including accrued interest |145 /286|5,113.14|3,706.66|Carrying amount, not principal-only |
| Note26 non-current leases |135 /266|220.60|211.48|Included once |
| Note31 current leases |137 /271|53.93|44.90|Included once |
| Note52 total leases |144 /284|274.53|256.38|Current + non-current |
| Note17 cash/equivalents |131 /259|411.26|545.69|Contains repatriation restriction1.54/3.48; do not call wholly unrestricted |
| Note18 other banks |131 /259|100.67|110.24|Components below; not all unrestricted |
| Note19 current other financial assets |132 /260, retained|276.90|144.42|Not a cash aggregate |
| Note33 interest-bearing trade acceptances |138 /273|2,120.74|1,507.27|Separate liability;0–180day payment range |
| Note33(iii) non-interest-bearing supplier finance |138 /273|1,737.37|Not provided|FY25 comparative omitted under explicitly disclosed transitional relief, **not zero** |
| Note34(b) accrued interest, acceptances |138 /273|6.22|8.01|Explains liquidity carrying amount |
| Note34 other financial liabilities |138 /273|115.68|97.28|Includes both interest sublines; no wholesale debt admission |
| Note53 debt |144 /285|5,387.67|3,963.04|Borrowings including accrued borrowing interest + leases |
| Note53 cash deduction |144 /285|(411.26)|(545.69)|Only Note17 deducted in gearing table |
| Note53 reported net debt |144 /285|4,976.41|3,417.35|Issuer-reported figure, not IID-admitted NET_DEBT |
| Note53 equity |144 /285|6,159.69|5,347.45|Not a debt input |
| Note53 net debt/equity |144 /285|0.81|0.64|Ratios, not ₹ crore |
| Note54B.2 borrowing undiscounted contractual total |147 /291|5,292.97|3,824.10|Not carrying amount5,113.14/3,706.66 |
| Note54B.2 acceptance carrying amount |147 /291|2,126.96|1,515.28|Principal plus Note34(b) accrued interest |

### H.2 Corrected borrowing, interest and lease bridge

**FY26 audited-caption reconciliation:**

```text
Note25 secured term loans103.12 − current portion10.78       =   92.34
Note25 unsecured term loans793.85 − current portion224.82    =  569.03
Non-current borrowings                                    =  661.37
Note30 demand loans                                       =2,638.96
Other short-term bank borrowings597.54 +525.00              =1,122.54
Commercial papers (financial institutions)                 =  444.76
Current maturities10.78 +224.82                            =  235.60
Current borrowings                                        =4,441.86
Notes25+30                                                =5,103.23
Add Note34(a) accrued interest, separately classified       =    9.91
Note54A/B.2 carrying amount                                =5,113.14
Add Note26/31 leases220.60 +53.93                           =  274.53
Note53 issuer-defined debt                                =5,387.67
Less Note17 cash                                          = (411.26)
Note53 reported net debt                                  =4,976.41
```

Thus **₹4,451.77 is rejected as Note30 current borrowings**; **₹5,113.14 is not all principal**. Do not silently fold9.91 into current borrowings, or add current maturities/leases twice. FY25 independently reconciles **358.46+3,342.64=3,701.10; +5.56=3,706.66; +256.38=3,963.04; −545.69=3,417.35**. The separate interest-rate exposure table on PDF147 prints3,701.11: its0.01 difference from notes25+30 is preserved as a source-table discrepancy, not “fixed” by changing a canonical comparative. Retained cash-flow reconciliation PDF119 uses3,701.10 for its FY25 borrowings balance; it must not be silently relabelled as the FY25 interest-inclusive carrying amount.

**Maturity amounts are different measurements.** PDF147 expressly includes principal and interest in undiscounted cash flows. FY26 borrowing buckets **4,505.53 +661.44 +126.00 +dash =5,292.97**, versus carrying5,113.14; dash is the source's >5year entry, not a newly admitted nil/zero observation. Likewise lease contractual455.72 is not lease carrying274.53. Do not ingest buckets/totals as outstanding principal.

### H.3 Cash, bank balances and Note19 eligibility

Note17 filed total **411.26** stays as reported, with **1.54 repatriation-restricted within it**. Existing IID uses the filed cash caption and has no separate restriction-adjustment input: **do not deduct1.54 again** or call411.26 wholly unrestricted. The upload reproduces the old extracted306.35+92.89+10.82=410.06 versus411.26 total: **1.20 remains unresolved in the text**, not corrected by an invented cash component. Original visual page/issuer explanation is still needed for that narrow discrepancy.

| Note18 component | FY26 | FY25 | Existing IID treatment |
|---|---:|---:|---|
| Unpaid-dividend earmarked bank accounts |3.06|3.02|Not operating available cash; no additional offset |
| Original maturity >3months and <12months deposits |3.20|27.48|Not stated earmarked in this row; not Note17 <3month cash equivalent or a current investment. No maturity/liquidity evidence establishing a supported extra offset |
| Margin/security against borrowings, guarantees and commitments |94.41|79.74|Restricted/security balance; no additional offset or relabelling as investments |
| Total |100.67|110.24|No blanket unrestricted-cash assertion |

No new rule decides that all deposits qualify, or that no Note18 instrument could ever qualify under some other contract. Under **this existing closed IID path**, none has a supported new offset mapping; eligibility cannot be inferred from inclusion in an issuer narrative.

| Note19 current asset | FY26 | FY25 | Classification / cash eligibility |
|---|---:|---:|---|
| Sundry deposits |107.53|68.73|Asset, but no established bank instrument, original maturity, withdrawal terms or unrestricted liquidity; no additional cash offset |
| Interest accrued on fixed deposits |7.59|4.38|Interest receivable, not deposit principal; no cash offset |
| Insurance claims |1.25|0.94|Claim receivable, not cash |
| MTM forward/commodity gain |104.19|23.94|Derivative asset, not cash |
| Contractually reimbursable gross |63.60|51.24|Receivable; deduct ECL7.26/5.68 →net56.34/45.56, neither cash |
| Others |dash|0.87|No eligible deposit established |
| Total |276.90|144.42|No cash-aggregate admission |

These remain assets in their disclosed accounting classifications/evidence; no existing canonical period asset totals are removed or overwritten. There is no supported new deposit/cash-equivalent observation. **Unknown current investments remain MISSING/NOT_REPORTED/null**, not a residual from these assets.

### H.4 Note33 acceptances, supplier finance and the6.22 difference

**Source verification now resolves the earlier classification gap:** Note3.21.7 (PDF126 / printed248) describes direct bank/FI payment of suppliers for materials/services, later repayment by the Group, extended credit and **interest charged to the Group**. Settlement is presented as **operating cash flow**, which is not proof the liability is interest-free or included in borrowing captions.

Note33 (PDF138 / printed273) explicitly reports:

- **2,120.74 interest-bearing trade acceptances**, payment range **0–180days**, all of which suppliers have received from finance providers. FY25 is1,507.27. This is separately presented from Note32 trade payables and Note25/30 borrowings.
- **1,737.37 non-interest-bearing supplier-finance arrangements**, payment range0–180days, **included in trade payables**, not additional trade acceptances. The note says the Group incurs no interest cost for these arrangements, suppliers benefit from early payment, and their nature/function remains consistent with other trade payables. FY25 comparative information is explicitly withheld under first-adoption transitional relief, not nil. Provider payments to suppliers are disclosed as non-cash transactions. This is a payment arrangement disclosure, not authority to add another1,737.37 financing-debt amount.

**Exact acceptance bridge (not a plug):** Note34(b) separately reports interest accrued on trade acceptances **6.22** (FY25 **8.01**). Therefore **2,120.74+6.22=2,126.96** (FY25 **1,507.27+8.01=1,515.28**), matching PDF147's liquidity table. That table prints2,126.96 in **both** contractual-total and carrying-amount columns. Do not describe it merely as future interest: it reconciles to the separately reported **accrued** interest. The liquidity row groups principal and accrued interest; it does not change the Note33 principal caption.

Cross-check: Note34 total115.68−borrowing interest9.91−acceptance interest6.22=**99.55**, exactly liquidity “other financial liabilities”; FY25 **97.28−5.56−8.01=83.71**. Both accrued-interest sublines are regrouped in liquidity disclosures, not added twice. Other Note34 items are unpaid dividends3.06, PPE creditor43.29, derivative loss46.87 and directors' commission6.33; they are not wholesale borrowing inputs.

**Buyer's credit/bills:** Note30.2(a)(ii), PDF137 / printed270–271, identifies **44.65** buyer's credit for the Saudi jointly controlled operation (FY25 **51.91**). It is already in secured short-term bank borrowings **597.54 =552.89 PCFC/FCNR +44.65**, and hence in4,441.86 current borrowings and the IID short-term component. **No additional buyer-credit amount is added.** KEC Asian Cables buyer/packing/FCNR credit and debtors' bill discounting are separately stated Nil FY26 (FY25 **32.43 /1.31**). Those limited nil disclosures and Note16.1 non-recourse receivables nil do not prove every group LC/bill exposure nil. The source supports distinct reported captions and the above inclusion, not a blanket instrument-by-instrument no-overlap certificate for every bank facility. No additional overlap adjustment is inferred.

The separate historical May-results2,120.73 versus annual2,120.74 **0.01** difference remains version-labelled, unrelated to the now-resolved **6.22 interest reclassification**. Neither is called a material adjustment.

### H.5 Note53 reported net debt and the Note18 narrative/table question

The complete supplied Note53 section now confirms its **reported** FY26 gearing table: debt5,387.67, CCE deduction411.26, net debt4,976.41, equity6,159.69, ratio0.81. Its footnote expressly includes interest accrued on borrowings and Note26/31 leases, excluding derivative/financial-guarantee contracts from the borrowing definition. **The reported numerical reconciliation has no unexplained residual.**

The narrative nevertheless names offsets in **Notes17 and18**, whereas the quantitative table deducts only **Note17**. This is verified as a **disclosure difference**, not an agent finding that one is erroneous or that the issuer changed policy. If the full100.67 were also deducted, the arithmetic would be **4,875.74**, **not** the reported4,976.41. The extract provides no further explanation reconciling this wording. Note18 restrictions make blanket unrestricted eligibility inappropriate, but do not by themselves establish why the narrative names all bank balances or why the table uses only CCE. **Issuer intent remains unresolved.**

Report4,976.41 as **issuer-reported statutory Note53 net debt**, with the narrative/table qualification, not as the IID result. Table presentation does not by itself prove that every Note18 component is economically ineligible for every conceivable definition; it does establish what **this table actually deducts**. No formula or source-rights exception is inferred.

### H.6 Management measure remains separately sourced

The existing presentation's **4,601 +2,121 =6,722** is retained unchanged; it is rounded management communication, not the audited Note53 measure. With source components now identified, this **diagnostic bridge** is precise:

```text
Note53 reported net debt                                 4,976.41
Remove leases                                             (274.53)
Deduct all Note18 bank balances                            (100.67)
Add Note33 acceptance principal                           2,120.74
Arithmetic management-compatible total                    6,721.95
```

Equivalently5,113.14−411.26−100.67+2,120.74=6,721.95, rounded6,722; its base4,601.21 rounds4,601. Note53-to-exact-candidate difference **1,745.54 =2,120.74−274.53−100.67**. The0.05 difference to rounded6,722 is rounding compatibility, not a plug or filed precise management observation. Adding accrued acceptance interest6.22 instead would give6,728.17, not the displayed headline. **No new management source has explicitly adopted these exact offsets/lease exclusions**, so the equation is not elevated to verified management policy or canonical debt. Historical supplied4,691.90,5,103.20 “including leases”,411.30 and both management candidates remain preserved, not averaged or selected.

### H.7 Existing IID admission decision — no speculative amendment

The actual `assessment/capitalStructure.ts` path, `contracts/lineItems.ts`, missing-observation contract and existing qualification/freshness rules were inspected again **before** changing evidence. They remain unmodified:

- Existing gross debt **4,206.26 short-term +235.60 maturities +661.37 long-term +274.53 leases =5,377.76**. Buyer's credit44.65 is already included. Note34(a)'s9.91 has no separate admitted accrued-interest slot here; **do not rewrite Note30 as4,451.77** or alter a principal caption to smuggle it in. Thus issuer-defined gross5,387.67 exceeds IID component gross by the explicitly identified9.91. This is a definition/representation distinction, not unexplained arithmetic.
- Current investments must be a supported same-instant **PRESENT** input under the strict existing cash-side contract; missing is not zero and even a declared nil does not count as zero in this cash-side sum. No uploaded note supplies a current-investment amount. Do not relabel Note18/19 or non-current holdings to fill it.
- No additional accrued-interest, trade-acceptance, supplier-finance or other-bank offset term exists in the closed bridge; no reported-NET_DEBT override. These new source facts are **evidence-supported but not new numeric canonical admissions**. Do not misdescribe source verification as ingestion or an engine-policy change.
- Canonical cash remains the existing411.26 input with restriction evidence recorded; there is **no extra1.54 deduction**. `restrictedCash` remainsNOT_COMPUTABLE/NOT_REPORTED as a schema/path status, not a claim that restrictions are absent.
- Therefore **cashAndInvestments and netDebt remain MISSING/NOT_REPORTED/null**. The diagnostic5,377.76−411.26=4,966.50 is **not** IID net debt without current investments. Neither4,976.41 nor6,721.95/6,722 is an automatic replacement.

No accounting definition, cash-offset rule,200/250day policy, scoring/sector/confidence rule, source-rights scope, or acceptance/closure criterion was changed.

### H.8 Actual runtime verification, data preservation and tests

No BTB ingestion was repeated. The private snapshot from the earlier turn was absent after workspace recovery, so `restore-statutory-snapshot.ts` reconstructs the **exact previously published one-issuer content**, restoring its existing canonical BTB record without invoking CLI/metric-CSV ingestion. It refuses to write unless the entire content digest equals historical **`sha256:a62f95f81a923e72fb6b4e0220bb8852d08191d14e94b1997a12bbfe8d4a0daf`**. Statement/identity inputs are the unchanged existing records. This uses existing builder/writer/read APIs, **not a new import/admission or combined-dataset replacement**. Source-rights metadata remains an operator assertion; full payloads/local source stay ignored.

`verify-statutory.ts` then executes **actual assessCompany and qualifyIssuerToEngines**, at November17 UTC execution-date anchor231days and the explicitly requested November18 scenario232days. Before/after content digests and dataset-file hashes are identical; all actual method/qualification/freshness/confidence results are deep-equal to the prior published runtime results. No metric CSV parser is called by either new script, no BTB source/date/period/value is changed, and the FY26 row/BTB record remain unique. The original three-issuer combined dataset is not overwritten or claimed restored. No unrelated issuer is re-assessed.

| Runtime layer | Actual outcome after new evidence review |
|---|---|
| Canonical BTB | Existing VALID/PRESENT1.075491…; unchanged, no new observation |
| Gross debt / current investments | PRESENT5,377.76 / MISSING,NOT_REPORTED,null |
| Net debt | MISSING,NOT_REPORTED,null |
| EV_REVENUE | Not applicable; null output; **CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable** |
| EV_EBITDA | Not applicable; null output; **CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable** |
| DCF | Enterprise calculation applicable; per-shareMid NOT_COMPUTABLE/null; intrinsic null |
| Certified Industrials | **NOT_QUALIFIED**,1of14 required inputs resolved;ENGINE_REQUIRED_INPUT_UNRESOLVED |
| BTB qualification freshness | **STALE/FIELD_STALE**,PNL200days; no value forwarded |
| debtEbitda qualification | **RESOLVED**,balance-sheet250days; distinct from net-debt method eligibility |
| Confidence | data0.7/model0.0833/combined0.3199;STALE_DATA,DILUTION_PROXY,POLICY_DEFAULT_WACC |
| Invariants | **0** at both clocks |

Validation details: [statutory-validation.txt](../../evidence/iid/S4-R6-KEC-CAPITAL-2026-11-17/statutory-validation.txt). Targeted source/arithmetic/classification/preservation regressions, existing capital regressions, strict scoped TypeScript for both new scripts, digest/read-back and actual runtime checks were run. No12probe/25test/census repetition. Original14/38 matrix, twelveunmeasured, Infosys FY26 missing-metric findings, two live missing-metric methods and earlier KEC operating/BTB evidence remain unchanged. All earlier supplied performance figures/identifiers/dispositions remain incorporated through B and the preserved FY26 adoption sidecars. **Source completeness has improved; actual availability has not.**

### H.9 Remaining work and closure boundary

**Resolved from the supplied statutory extract:** full Note25/26/30/31/33/34/52/53 textual disclosure gaps; exact9.91 borrowing-interest classification; exact6.22/8.01 acceptance-interest regrouping; separate non-interest supplier finance; disclosed buyer-credit inclusion; numerical issuer Note53 debt/net-debt reconciliation. These specific completed investigations need not be repeated. Verification remains bounded to supplied extracted pages, not a new rendered-PDF audit.

**Remaining evidence:** (1) authoritative current-investment amount and same-period canonical/source support; (2) issuer explanation of Note53's Note18 narrative/table wording and explicit management bridge definition if that measure is to be characterised beyond arithmetic compatibility; (3) original visual Note17 table or issuer correction for1.20 component discrepancy. No exhaustive current-investment absence search is repeated and unknown is not nil. Further facility-level LC/financing-overlap claims would require actual instrument schedules; no such global claim is made here.

For the **existing IID valuation path**, current investments are the immediate hard blocker; resolving the disclosure questions does not waive that requirement. No change to definition/representability is authorized. A source amount alone also does not imply full-population closure or remove freshness/confidence limits.

**S4-R6 OPEN / G-4 OPEN.** Neither actual AVAILABLE numeric closure nor an authorized alternative closure route has been met. No accepted-limitation decision, new closure criterion, G9/G15 closure, Stage5, production or Windows installation. Next required numeric-route evidence is a supported FY26 current-investment observation; remaining issuer-definition/visual questions stay explicitly open rather than blocking recognition of the completed source reconciliations above. Publication uses this same PR597 branch; exact remote head/tree/changed blobs/CI and clean worktree are recorded in the PR receipt after push, without merge.
