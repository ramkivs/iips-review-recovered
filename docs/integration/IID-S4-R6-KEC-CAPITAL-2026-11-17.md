# S4-R6 / G-4 — KEC FY26 financial evidence and net-debt reconciliation

**Disposition: S4-R6 OPEN; G-4 OPEN. No definitive IID net debt, new capital admission, owner-runtime installation, accepted-limitation decision or closure.** This is an additive correction to the [prior FY26 adoption report](IID-S4-R6-FY26-ADOPTION-2026-11-18.md), not a rewrite of historical execution. Work executed on **2026-11-17 UTC**; November 18 is the explicitly requested assessment scenario, not today's date. Neither date changes filing/period anchors.

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
