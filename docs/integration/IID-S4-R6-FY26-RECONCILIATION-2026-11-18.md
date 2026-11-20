# S4-R6 / G-4 — FY26 evidence reconciliation, ingestion and closure readiness

**Result:** supported partial completion; **S4-R6 OPEN; G-4 OPEN**. No owner closure decision.

Repository `ramkivs/iips-review-recovered`; branch `arena/5461e5b5-iips-review-recovered`; PR **#597 OPEN/unmerged**. Before changes, local HEAD, fetched remote branch and PR head all equalled **`29a225cdaa5e041ab4d08de004e86ab46f52d6f2`**, with a clean tree. This is additive to that publication and `0782328`, not a rewrite of their historical observations. Assessment clock remains the explicitly requested **2026-11-18**. This document's date labels that assessment/evidence continuation; the session-date observation/entry fields are **2026-11-17**, not the May/August filing dates. Neither field is used to make period-end data fresh.

## 1. Executive result — five separate stages

| Target | Evidence / disposition | Canonical admission | Actual assessment result | Formal closure |
|---|---|---|---|---|
| Infosys `TM_NRR` | `NOT_REPORTED` on supplied examination plus independently reviewed sections; whole-document certification not claimed | No numeric record; semantically `MISSING / NOT_REPORTED / null`, UNAVAILABLE | Technology `EV_REVENUE` withheld; actual basis **FY24**, not FY26 | Not closed |
| Infosys `TM_RECURRING_REVENUE_PCT` | Same | Same | Same method needs **both** metrics | Not closed |
| KEC `IN_BOOK_TO_BILL` | FY26 consolidated operands corroborated; ratio **1.075491139535615859…**, rounds **1.08** | **YES in the new ignored local CLI dataset**, `VALID / PRESENT`; **NO new committed dataset or verified owner-runtime installation** | Metric gate passes; Industrials `EV_REVENUE` still **WITHHELD** for unavailable net debt. Certified-engine field qualification separately returns `FIELD_STALE` | Not closed |

**Important correction to any proposed unlock:** CLI input coverage labels KEC `EV_REVENUE` **AVAILABLE**, but `assessCompany` returns `applicable:false`, output absent. These are different contracts, not two spellings of the same assessment result. No method is claimed newly AVAILABLE in the actual valuation assessment.

## 2. Infosys — remaining primary-source review and bounded NOT_REPORTED disposition

### Official identity and reliable locators

Original report/PDF identity and the earlier business-highlights/repeat-business review are reused from the [previous publication](IID-S4-R6-COMBINED-DISPOSITION-2026-11-18.md); they were not rerun as a new investigation. This continuation adds original SEC HTML access and specific official annual-report extracts:

1. **Integrated Annual Report 2025–26**, year ended March31,2026: [official complete report](https://www.infosys.com/investors/reports-filings/annual-report/annual/documents/infosys-ar-26.pdf), `infosys-ar-26.pdf`. Earlier printed Business highlights pp30–31 locators remain as previously qualified.
   - [Official Social and Relationship Capital extract](https://www.infosys.com/investors/reports-filings/annual-report/annual/documents/2025-26/social-and-relationship-capital.pdf), **Creating value for our customers → Client satisfaction**, including the **Client satisfaction: Trend of key outcomes** table. Both extract chunks examined. It reports survey/satisfaction/relationship measures, not customer-cohort revenue or a recurring-revenue classification. No physical page invented where the reader omits it.
   - [Official MD&A extract](https://www.infosys.com/investors/reports-filings/annual-report/annual/documents/2025-26/managements-discussion-and-analysis.pdf), **6. Segmental profitability / Business segments – Consolidated**, geographic revenue table, **10. Key financial ratios** (reader chunk3; continuation chunk4). Segment/geographic growth and profitability are not a fixed-customer-cohort bridge. This is a section review, not a claim all MD&A pages were read.
   - Consolidated Ind AS **note2.18 Revenue from operations**, printed p363, remains an **index-located lead from the previous publication, not independently page-read here**. No claim the entire Ind AS/IFRS annual-report notes were examined.
2. **Annual Report on Form20-F, fiscal2026**: independently reached the original **SEC EDGAR HTML**, not a mirror. [SEC filing index](https://www.sec.gov/Archives/edgar/data/1067491/000119312526270520/0001193125-26-270520-index.htm) identifies **CIK1067491, accession0001193125-26-270520, filed2026-06-15, report period2026-03-31**, primary document `infy-20260331.htm`. [Original filing](https://www.sec.gov/Archives/edgar/data/1067491/000119312526270520/infy-20260331.htm).
   - **Item4 → Our Clients**: geographic/business-segment revenue and largest-client concentration (reader chunks46–47). Client concentration is not the revenue of a fixed prior-year cohort.
   - **Item5 → Management’s Discussion and Analysis → Revenues**: reported consolidated USD20,158m revenue, 4.6% growth and 3.1% constant-currency growth; growth drivers and segment mix (chunk51).
   - **Item5 → Revenues / offering and contract-type discussion**, immediately before **Cost of sales**: services/BPM95.2%, products/platforms4.8%, fixed-price contract share54% (chunk52). These are not recurring-versus-non-recurring classification percentages.
   - **Item18 → note2.11 Revenue from operations**, **Accounting policy**, **Disaggregated revenue information**, **Trade Receivables and Contract Balances**, **Remaining performance obligations**: recognition rules, offering/geographic/contract-type disaggregation, and aggregate future unsatisfied performance obligations (chunks118–120, through start of note2.12). These are reliable document headings; HTML physical page numbers are not asserted.
   - Other navigation chunks0/25/32/43/45/49/60/112/121/123/125/126 were accessed to locate those sections; they are not represented as complete intervening review. Chunk25 also corroborates contract-type/termination discussion, not recurring revenue.

### What is established for each metric

**`TM_NRR`: NOT_REPORTED / UNAVAILABLE.** Supplied review reports no defined beginning-customer-cohort revenue and same-cohort expansion/contraction/churn/ending bridge. The independently examined client/revenue sections provide aggregate revenue, concentration, mix and growth, but no such bridge. The earlier TCV/net-new/client-tier evidence is retained, not converted to cohort revenue. No NRR can be calculated from these disclosures without manufacturing missing cohort information.

**`TM_RECURRING_REVENUE_PCT`: NOT_REPORTED / UNAVAILABLE.** Supplied review reports no defined recurring-revenue classification, numerator or share. The independently examined offering, billing/recognition and RPO sections do not establish that definition/numerator. Product/platform revenue is not automatically recurring; neither fixed-price billing, ratable recognition of some contracts, repeat-business commentary nor RPO defines the requested total recurring share. A total-revenue denominator alone cannot complete the metric.

**Verification limit:** original SEC HTML overcomes the old *PDF first30pages* obstacle for the named SEC sections. It was returned as138 chunks; not all138 were inspected. The annual report's complete original bytes/full notes were not available locally and were not exhaustively examined through the PDF reader (30-page limit). The user supplied an examination summary and file references, not locally attached full PDFs. The operational NOT_REPORTED dispositions are supported by that supplied examination plus the specified independent primary-section checks, **not a certified exhaustive absence search across both entire filings**. No original byte hash or unseen page assertion is fabricated. Full-document negative certification remains outstanding if that standard is required for final acceptance.

### Vocabulary and actual dataset period

- **NOT_REPORTED**: existing canonical reason for a non-reported value; not a new metric value.
- **MISSING**: observation presence state, with `value:null` and the reason above.
- **ZERO**: a reported number0 would be PRESENT and needs evidence; none is inferred here.
- **UNAVAILABLE**: usability disposition; an absent or unvalidated metric cannot satisfy the mandatory gate. It is not an enum replacing MISSING.

The earlier blank-value representation checks are reused, **not rerun**. No numeric Infosys row was admitted; no missing value was disguised as NIL or zero. A targeted lookup of tracked `periods.csv` files found **no FY26 Infosys statement bundle**; all five matching tracked bundles end2024-03-31. See `infosys-bundle-lookup.json` for the bounded lookup, not an installed-host assertion. Actual assessment in this continuation uses the S4-R2 successor's FY24 basis and names both missing metrics. Reviewing FY26 disclosure does not create an FY26 dataset.

## 3. KEC — corrected FY26 operands and source verification

| Evidence | Exact locator and verification |
|---|---|
| [Issuer FY26 results release, May16,2026](https://www.kecrpg.com/press-release/earnings/financial-performance-for-quarter-&-year-ended-31-march-2026) | Fully read original HTML. **Consolidated Order Intake and Order Book → Order Intake** identifies FY26 intake **₹25,280cr**. Separate headings identify closing order book **₹36,267cr**, combined order book/L1 **over₹40,000cr**, and subsequent FY27 orders. Thus the numerator is period orders received, not closing backlog, L1 or subsequent-year orders. |
| [21st Integrated Annual Report2025–26](https://www.kecrpg.com/public/media/annualReportMedia/KEC_Annual_Report_2025-26.pdf), [official annual-report index](https://www.kecrpg.com/financial-annual-results) | Original index and report cover/key FY26 numbers accessed. **Building Excellence / Key numbers for FY26 as on March31,2026**, PDFp6 / printedpp8–9 in preserved WI8 page map, corroborates intake25,280 and rounded revenue23,506. Current reader chunk2 agrees on those key figures; no new byte-equivalence claim to the older pinned PDF. |
| Same annual report, audited consolidated financial statements | Existing source file `WI8-INDUSTRIALS-KEC-2026-11-07/source/fy26-consolidated-balance-sheet-and-profit-and-loss-pdf-page117.txt`, **Consolidated Statement of Profit and Loss / Revenue from operations / FY26**, PDFp117, printedpp230–231: **₹23,505.54cr**. Independently inspected preserved original-page extraction, hash checked against its existing map. `source-bytes.json` pins original report digest `ba638897313ac1fe5b7da42d7a95dac5f9efec1d1a203f88d9f963622ba3c820`; page digest `da5d5f73e3cdcb015636b1bcd576a6c34ba11f6fe5d8f8360a6c7dc3ee93912b`. Consolidated audit-opinion/signature evidence is retained at PDFpp111/115. |
| Supplied Directors’ Report §§1 Financial Results / 2 Performance; audited consolidated results filedMay16,2026 | Supplied locators preserved, but no new separate exchange-results-file or Directors’ Report page retrieval is claimed. Board’s Report starts printedp90 per current annual index; those pages exceed this PDF reader's30-page reach. Exact denominator verified from the preserved audited consolidated annual-page evidence above; May16 original release independently establishes consolidated numerator/period. No automated NSE retrieval performed. |

Annual-report publication **August7,2026** is the supplied publication-date reference (also surfaced as an indexed date), not newly verified original PDF-byte metadata. The source locators above suffice for the FY26 operands without using that date as an admission or freshness anchor.

Period is **April1,2025–March31,2026**, **CONSOLIDATED** on both sides. Amounts use the same INR-crore scale. The audited row excludes other income; total income/standalone revenue is not substituted. FY25 intake24,689/revenue21,846.70 and the previously rounded FY25 ratio remain historical, rejected as FY26; they are not reused.

### Calculation and canonical interpretation

`IN_BOOK_TO_BILL = 25,280 / 23,505.54 = 1,264,000 / 1,175,277 = 1.075491139535615859… → 1.08`.

Stored through existing JavaScript numeric parsing/division precision: approximately **1.075491139535616**, not rounded1.08. Both source operands are crore; the ratio is dimensionless. Canonical normalized statement revenue is INR (`23505.54 × 10^7`), which the verifier checks against the actual imported FY26 denominator. No unit reinterpretation.

`contracts/operatingMetrics.ts` defines **Orders received / revenue**, unit **RATIO**, range **0–10**, minimum source **OPERATOR_ENTERED**. This is an explicitly requested operator-calculated, filing-backed observation, **not a claim the issuer printed the ratio**, and not a new automatic statement derivation. The parser retains its normal OPERATOR_ENTRY/AS_FILED spelling; the local note identifies the operator calculation. `COMPUTED_FROM_STATEMENTS` is not falsely asserted for an order numerator absent from canonical statements.

Existing qualification mapping has identity transformation for `bookToBill`. Existing frozen Industrials `IM-007` bands remain `<0.9 / 0.9–1.0 / 1.0–1.1 / ≥1.1`: this value lies in the third band. This is a band-placement verification, **not an executed certified sector score/verdict**; qualification refuses the stale field before scoring. No calibration changes. Historical WI8 §7/PR591 arithmetic-refusal wording is retained as a historical disposition; this new supplied-and-verified same-year numerator/denominator plus explicit calculation request is recorded prospectively, not retroactively claimed admitted in WI8.

## 4. Actual ingestion, canonical record presence and assessment consumption

**CLI executed successfully, without `--allow-errors`**, through `iips-platform/src/investment/cli/ingest.ts`. New input and all produced data remain under ignored `LOCAL-ONLY-DO-NOT-PUBLISH/s4r6-fy26-reconciliation/`:

- `input/infosys`: byte-for-byte copy of S4-R2 input.
- `input/marico`: byte-for-byte copy of WI7 input, only to preserve the existing three-issuer population; no Marico assessment or remediation in this task.
- `input/kec`: byte-for-byte WI8 roster/statements plus **one** new operating-metrics CSV observation. Existing inputs were not overwritten. Refreshed-quarter candidate bundles were not silently installed or substituted.
- `dataset`: new canonical CLI output, **not** an overwrite of any historical or owner-runtime dataset. Rights declaration is **OPERATOR_ASSERTED**, not independent third-party permission; no old digest-bound authorization is falsely cited for this changed input.
- Local-only source binding and full assessment payloads retained next to the dataset. This is the actual local dataset used below, not a proposed JSON record or only an in-memory injection.

**Dataset version/content digest:**

`sha256:62dc04d1c19fa5824b358a749e554947cda439b3d59b7e6f9bd2f092e5030874`

Canonical KEC record identity: `IN:CIN:L45200MH2005PLC152061 / IN_BOOK_TO_BILL / 2026-03-31 / CONSOLIDATED`, source class `OPERATOR_ENTERED`, source ref `KEC-FY26-BTB-S4R6-RECONCILIATION`, unitRATIO. Actual parser and stored record both **VALID / PRESENT**, empty validation issue list; source binding is §3 plus local `source-binding.json`. Observation/entry date2026-11-17 records this session, not a freshness exception.

`readDataset` verified manifest file hashes and content digest; `openLocalSnapshot(...).operatingMetricsFor(KEC)` returned that exact record. The actual `assessCompany` call receives the **read-back content** and its real dataset identity. No synthetic metric or modified metric array was injected. It passes `metricFor/metricGap` and proceeds to the next refusal. Evidence of that consumption is the actual changed refusal from missing metric to unavailable net debt; source-class/period/scope/identity and exact numeric equality are asserted in the verifier.

**Authoritative-state boundary:** a real local canonical admission occurred. No canonical CSV/dataset is committed or redistributed; therefore the authoritative **committed input bundles still contain no numeric operating metric**, and no installation into the application owner's authoritative Windows runtime is established. That runtime is inaccessible from this sandbox; a local dataset digest is not deployment evidence. No host installer, database mint, active snapshot pointer, IPD write or replacement was performed. Operational adoption/read-back by the owner remains outstanding if runtime admission is part of final acceptance.

## 5. Actual results — not input coverage and not a proposed record

Both assessments use the new digest in §4, generated/known clock2026-11-18. Original source statements and roster are unchanged.

| Company / metric | Dataset basis / actual records | Validation | Actual `EV_REVENUE` | Freshness / confidence | Invariants |
|---|---|---|---|---|---|
| Infosys / TM_NRR | FY24 ending2024-03-31; zero metric rows | No numeric observation to validate; prior missing-value check reused | `applicable:false`, output absent, `MANDATORY_METRIC_MISSING: TM_NRR, TM_RECURRING_REVENUE_PCT` | 962days; STALE_STATEMENTS; STALE_DATA multiplier0.9; also DILUTION_PROXY, POLICY_DEFAULT_WACC, POLICY_DEFAULT_MULTIPLE caps | 0 |
| Infosys / TM_RECURRING_REVENUE_PCT | Same | Same | Same two-metric gate | Same | Same assessment, not counted twice |
| KEC / IN_BOOK_TO_BILL | FY26 ending2026-03-31; one real metric row read from disk | VALID/PRESENT; correct period/scope/source/unit/range; no parser issues | **`applicable:false`, output absent, `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable`** | 232days; STALE_STATEMENTS; STALE_DATA multiplier0.9; also DILUTION_PROXY, POLICY_DEFAULT_WACC caps | 0 |

The KEC cash/investments aggregate cannot produce net debt because **CURRENT_INVESTMENTS remains MISSING / NOT_REPORTED**. This is an existing separate capital-structure limitation; no new value, nil declaration or zero was supplied, and no other item was reopened or repaired. The method's exact refusal is preserved, not relabeled as metric failure or freshness failure.

The CLI automatically emits its normal `coverage-report.json` during ingestion. We projected only the two live target slots from that output, **not a repeated census**: Technology WITHHELD for the two missing metrics; Industrials AVAILABLE with no missing coverage inputs. The actual valuation method still withholds as above. The coverage product can accept its declared inputs while the stricter assessment capital-structure computation cannot proceed. This is the already established coverage-versus-valuation distinction, not a new defect investigation.

## 6. Freshness reconciliation — parser, qualification, assessment and confidence

| Question / actual path | Determination |
|---|---|
| Does the canonical metric have a dedicated age validator? | No separate metric-specific200day rule in `contracts/operatingMetrics.ts` or `parseOperatingMetricsCsv`. The real record validates and ingests at the requested clock. |
| Does any existing path apply200days to this metric input? | **YES: certified-engine qualification**, separate from CSV ingestion and valuation methods. `qualification/mapping.ts` maps `bookToBill` with freshnessKind **PNL**; `qualification/types.ts:DEFAULT_QUALIFICATION_POLICY` sets200days. `qualification/resolve.ts:FieldResolver.resolve/stalenessRefusal` checks the target annual period **before** resolving the metric. Actual targeted resolution returned **STALE / FIELD_STALE**, no value forwarded. This extends the prior parser-only finding; it must not be generalized to “no metric-consuming path has freshness gating.” |
| Does statement freshness apply to the denominator/assessment? | YES, `assessment/freshness.ts` measures valuation-basis period end and `assessment/policy.ts` sets P&L200 / balance sheet250. KEC232days is outside P&L, inside balance-sheet window. Actual reason `VALUATION_BASIS_BEYOND_PNL_WINDOW`, quality flag `STALE_STATEMENTS`. |
| Is the valuation method AVAILABLE with a stale/confidence warning? | **Not on this data.** The method's metric gate passes, but it withholds for capital structure. Separately statements are stale and confidence carries `STALE_DATA`. Staleness is not its emitted method-withholding reason. Input coverage alone says AVAILABLE, not actual assessment. |
| Was the field consumed unchanged by the certified scoring engine? | The mapping is identity, but **actual field qualification refuses FIELD_STALE before resolution/scoring**, so no scoring-engine consumption or score is claimed. The assessment mandatory-metric gate consumed the admitted record; those are separate paths. |
| Is annual-report publication an authorized freshness anchor? | No applicable existing rule identified. Period end remains authoritative. Supplied August7→November18 age103days does not replace March31→November18 age232days. Neither source/entry timestamps nor publication recency cures this. |
| What policy decision would be needed? | If the owner wants publication-based freshness or a different rule for this field, that is a **new explicit prospective policy decision**, not current authorization. None made here. No exception is needed merely to observe the existing parser pass; none was used. |

**232−200=32days**. The stale confidence adjustment is multiplicative **×0.9**, not an absolute confidence ceiling of0.9. No counterfactual fresh-clock run, backdating of financial period, policy override, extra score, synthetic capability test or gate bypass was used. The field qualification check is new targeted validation of the actual admitted observation, not a rerun of PR591 tests.

## 7. Requirement matrix update and closure readiness

`evidence/iid/S4-R6-FY26-RECONCILIATION-2026-11-18/requirement-matrix-update.json` is an **additive evidence-state overlay** pinned to the original matrix SHA-256. Original slot definitions, ranges, requirements, matrix/census bytes and historical results remain unchanged. Reused census: **14 metric-gated of38**; no newly discovered slot or count change. No new census performed.

- **Technology EV_REVENUE:** both metric requirements dispositioned NOT_REPORTED at the documented evidence scope; no qualifying numeric records, method still withheld. No FY26 dataset assessment claimed.
- **Industrials EV_REVENUE:** FY26 IN_BOOK_TO_BILL requirement locally admitted/validated and consumed by the assessment metric gate. **Metric-data gap discharged locally, method availability requirement not discharged**: current investments/net debt still missing, and certified-engine field qualification is stale. Committed/owner-runtime metric adoption not verified.
- **Twelve other metric-gated slots remain UNMEASURED for lack of issuers**, reused unchanged: Materials/NAV_RESERVES; Utilities/REGULATED_ASSET_BASE; Auto/EV_REVENUE; Energy/EV_EBITDAX; Energy/NAV_RESERVES; Healthcare/EV_EBITDA; Hospitality/EV_EBITDA; Banking/RESIDUAL_INCOME; Banking/PB_RELATIVE; Insurance/P_EMBEDDED_VALUE; Capital Markets/P_AUM; Telecom/EV_SUBSCRIBER. The overlay names each original mandatory metric and references its unchanged exact definitions. No population expansion is implied.

**Route A numeric closure: NOT SATISFIED.** Infosys cannot supply the required two numbers on this evidence. KEC's calculation and local admission are real but its actual method has no output; field qualification also refuses stale data. Numeric acceptance needs the applicable real observations, other prerequisites and actual AVAILABLE named methods within an explicit scope; none of those distinctions is waived.

**Route B remains available only by explicit application-owner acceptance**, not by this agent: Ramki must resolve the competing closure criterion, define affected population/scope, accept final continued withholding where metrics are unavailable, state S4-R6/G-4 statuses, and preserve the fact that missing values were not supplied. PA-01 §1 and §3 G-6/G-8 / O1 §1 authority remain unchanged; no committee or new ceremony. Choosing how to treat source-verification limits/runtime adoption and any desired future freshness semantics must be explicit, not inferred from this execution request. No acceptance is recorded here.

## 8. Validation, preservation and publication

New work only: one permitted local CLI ingestion; verified canonical disk/read-port read-back; actual assessments for the two named issuers; specific bookToBill field qualification; target-only coverage projection from normal CLI output; targeted Infosys FY26 bundle lookup; new assertions; source/provenance/unchanged-file checks; matrix-overlay checks; checksums/diff validation. No PR591 twelve probes,25gating tests, census or completed Stage4 audit rerun. No production/scoring/calibration/freshness-policy code changed. Marico was carried unchanged, not reassessed.

The new verification harness initially exposed (a) statement normalization is INR, not crore, and (b) a presumed method unlock was false. The harness was corrected to check canonical normalization and the **actual** capital-structure refusal; no product/data policy was changed to force AVAILABLE. The final assertions pass and preserve these results.

Source rights: existing O3 local personal analysis/transcription scope and PA-01 remain the operating basis. [KEC terms](https://www.kecrpg.com/term-and-conditions) were checked; no redistribution licence inferred. No source PDFs, copied page text, canonical CSV/metric values as data rows, datasets, complete coverage/assessment payloads or newly retrieved exchange files are published. Metadata-only verification, source locators, input/file identities, code and decision/requirement records are published. Full local dataset/assessments remain ignored and are **not durable Git/owner-runtime deployment artefacts**; the receipt and hashes, not the private data, are what travel with this PR.

The evidence directory includes the exact CLI command, final verifier result, source locators, matrix overlay and preservation/checksum records. Final commit/PR-head/tree/CI/clean-tree read-back is posted to PR597 after push. No merge authorized/performed.

## 9. Final classification and exact remaining work

**S4-R6: OPEN. G-4: OPEN. Application-owner decision: OUTSTANDING.**

All supported verification/decision metadata from this pass is published; **not all evidence required for numeric closure or authoritative-runtime admission exists**. Remaining: full-document Infosys certification if required; no real Infosys metric numbers/FY26 input bundle; KEC's separate missing net-debt prerequisite; stale qualification/current statement basis under unchanged rules; owner-runtime metric adoption/read-back unverified; twelve unchanged unmeasured slots outside the two live targets; explicit final owner criterion/scope/status decision if accepted-limitation closure is chosen. No other limitation/status is changed and none is inferred resolved.
