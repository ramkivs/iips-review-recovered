# Supplied evidence register and schema mapping

This record preserves the user's supplied audit **as supplied**, not an independently certified full-filing negative finding. `supplied-infosys-payload.json` preserves the entire intended semantic JSON including its exhaustive/sections-verified claims; those claims are not assigned to the runtime parser or this agent. Independent verification is bounded by the execution report. No hidden schema extension is introduced.

## Supplied audit identity

Infosys Limited; NSE INFY; BSE 500209; NYSE INFY; SEC CIK0001067491. Target FY26, April1,2025–March31,2026; CONSOLIDATED; frameworks IFRS / Ind AS. Primary1 Infosys Integrated Annual Report2025–26 (`infosys-ar-26.pdf`); primary2 Infosys Annual Report on Form20-F for Fiscal2026, accession0001193125-26-270520. Audit date2026-11-18. Legacy runtime anchor FY24, intended current FY26. Metrics TM_NRR and TM_RECURRING_REVENUE_PCT. **Supplied scope EXHAUSTIVE — full structural inspection across narrative, MD&A, risk factors, ESG/relationship capital and audited financial notes.** Supplied final: both NOT_REPORTED→UNAVAILABLE, affected gates WITHHELD. This scope claim is preserved but independent exhaustiveness remains NOT ESTABLISHED.

## Complete supplied filing-coverage matrix

| Filing / section | Supplied artifact or structural contents | Supplied finding (both metrics) |
|---|---|---|
| Integrated Annual Report / Corporate Overview & Business Highlights | business-highlights.pdf; FY26 ₹1,78,650cr / USD20,158m; +9.6% INR / +3.1% CC; USD14.9bn Large Deal TCV,55% net new; client-tier counts | Aggregate growth/net-new TCV share reported; no cohort retention table or recurring split. |
| Annual / Value Creation Model & Six Capitals | value-creation-model.pdf; Social & Relationship Capital;443 new client accounts; net active-client movement; satisfaction/CSAT | Gross new accounts/qualitative CSAT not starting-to-ending dollar-retention bridge for fixed prior-year cohort, including expansion/contraction/churn. |
| Annual / Management's Discussion and Analysis | Geography, industry, client concentration, fixed-price and T&M billing structures | Aggregate billing shares/concentration disclosed, no recurring-revenue definition or quantification. |
| Annual / Consolidated Financial Statements — Ind AS and IFRS | P&L; revenue-from-operations note; RPO; segment reporting | IFRS15/IndAS115 service/product/geography/contract disaggregation, without recurring vs non-recurring classification. |
| Form20-F / Item3.D Risk Factors | Client concentration; discretionary IT spending; renewal/termination risks | Period revenue varies and depends on client budgets; concentration discussed, cohort NRR absent. |
| Form20-F / Item4 Information on the Company | Business/go-to-market; fixed-price/T&M/outcome pricing; relationships | MSA/SOW mechanics, discrete projects and multi-year engagements rather than standardized subscription ARR base. This characterization is supplied, not an independently established exclusion of every subscription offering. |
| Form20-F / Item5 Operating and Financial Review and Prospects | USD19,277m FY25→USD20,158m FY26; CC+3.1%; segment/vertical performance | Volume/pricing/FX variance, not existing-cohort expansion vs contraction/churn decomposition. |
| Form20-F / Item18 Consolidated Financial Statements | Audited IFRS notes; IFRS15; contract balances; unbilled/unearned revenue; transaction price allocated to RPO | Supplied audit finds no issuer-defined recurring classification or NRR in audited disclosures. |

## Complete supplied business/revenue evidence

| Disclosure | Supplied figure / finding | Independent status |
|---|---|---|
| INR consolidated revenue | ₹1,78,650cr | Newly verified official P&L printed318–319; admitted as INR through CRORE scaling |
| USD consolidated revenue | USD20,158m | Previous SEC Item5 review retained; no FX conversion into the INR runtime row |
| INR growth | +9.6% | Official MD&A §6 segment/geography table verified |
| CC growth | +3.1% | Official Value Creation Model outcomes verified; previous SEC review retained |
| Large Deal TCV | USD14.9bn | Supplied and previous business-highlights review retained; not newly re-investigated |
| Net-new Large Deal share |55% | Supplied/previous business-highlights review; no cohort inference |
| New accounts |443 | Newly independently verified official value-creation-model.pdf / Social & Relationship Capital |
| Client-tier counts | Disclosed; $1M+, $10M+, $50M+, $100M+ buckets | Supplied client-health evidence retained; no numeric counts supplied for those tiers and none invented |
| Client concentration | Top1/5/10/25 percentages disclosed | Supplied; previous SEC Our Clients concentration review retained; no unexamined tier percentages asserted |
| Offerings | Services (IT & BPM), Products & Platforms incl EdgeVerve/Finacle | Previous SEC note2.11 / Item5 sections retained |
| Billing structures | Fixed-price / T&M | SEC Item3.D pricing/termination subsection checked; previous Item5 retained |
| RPO | Disclosed; not recurring numerator | Previous SEC note2.11 RPO review retained |

Four supplied statutory disaggregation axes: (1) offering: Services IT/BPM vs Products/Platforms incl EdgeVerve/Finacle; (2) industry: Financial Services, Retail, Communication, Energy/Utilities/Resources/Services, Manufacturing, Hi-Tech, Life Sciences; (3) geography: North America, Europe, Rest of World, India; (4) contract type: Fixed-Price vs T&M. None is reclassified as recurring revenue. The supplied axis description is retained without claiming all four occur in one single note/table.

## Both metric dispositions and required evidence

TM_NRR requires beginning revenue T0 of a defined cohort, expansion, contraction, churn and ending same-cohort revenue T1. Supplied evidence is client-health counts/tier buckets,443 gross new accounts, concentration and USD14.9bn TCV/55% net new, not that bridge. No proxy from growth/CC growth/TCV/net-new share/client counts/tier movement/top-client share/repeat-client commentary. Preserve **NOT_REPORTED; UNAVAILABLE; null; WITHHELD**.

TM_RECURRING_REVENUE_PCT requires issuer-authorised recurring definition, recurring numerator, consolidated revenue denominator and compatible period/scope. Supplied audit finds only the four classifications, no recurring numerator/definition. No inference from fixed-price, Products/Platforms, EdgeVerve/Finacle, repeat clients, multi-year deals, RPO, unearned revenue, contract balances or historical recurring-business commentary. Preserve **NOT_REPORTED; UNAVAILABLE; null; WITHHELD**.

## Semantic payload → existing contract (no discarded fields)

| Supplied field | Canonical representation / evidence retention |
|---|---|
| entity_id INFY; entity_name | Existing roster canonical CIN issuer and ISIN security; INFY remains existing NSE listing symbol, not a new issuerId. BSE/NYSE/CIK identification retained here, not fabricated as new canonical listings. |
| dataset_fiscal_year FY26; period_start/end; scope | periods.csv ANNUAL/fiscal_year2026/2025-04-01/2026-03-31/CONSOLIDATED → NormalizedPeriod.period; runtime selectSeries picks newest consolidated annual. |
| IFRS / IndAS | Both source frameworks retained; new canonical statement row uses independently inspected IndAS INR statements, not a blend with USD IFRS numbers. |
| audit_date; review_completeness; supersedes_anchor | Complete supplied payload retained separately with attribution. Canonical schema has no audit-completeness slot; immutable evidence sidecar plus source_ref binding, not unknown CSV columns or a fake validated audit flag. FY24 row retained, never deleted. |
| sources_audited titles/artifact/accession/sections_verified | Entire supplied list retained in JSON; independent verification and locators in report/source-review.json. No claim canonical reader consumes an audit sidecar. |
| metric_code | operating-metrics.csv metric_id. |
| numeric_value null | Empty CSV value → observation MISSING/NOT_REPORTED/value:null. Parser sets validation UNVALIDATED/issues[MISSING_VALUE]; successful ingestion does NOT mark absent numbers VALID. |
| disposition NOT_REPORTED | Existing observation.reason NOT_REPORTED. |
| iid_status UNAVAILABLE; method_gate_status WITHHELD | Evidence-sidecar disposition; actual assessCompany must establish gate (not writable input flags). Runtime metric gate rejects missing/unvalidated records. |
| rationale (each full supplied string) | Preserved verbatim in supplied JSON; metric source_ref points to this audit record, with filing/section locators. Canonical metric contract has no rationale/auditMetadata slots, so they are not silently dropped or falsely claimed inside the record. |

No schema/validator changes needed. FY26 missing-metric rows are real explicit canonical records, not numeric observations. UNAVAILABLE is not a new observation-presence enum; WITHHELD is not an ingestion command. The audit sidecar remains repository evidence rather than parser-controlled verification.

## Every supplied KEC candidate retained (none assumed contract-supported)

FY26 consolidated period2025-04-01→2026-03-31; established intake₹25,280cr / revenue₹23,505.54cr =1.075491… rounds1.08; third band1.0–1.1, broadly matching revenue. Closing book₹36,267cr, book+L1>₹40,000cr excluded. FY25 intake₹24,689cr / revenue₹21,846.70cr never FY26. Existing VALID/PRESENT metric and prior missing-net-debt refusal retained.

| Supplied capital candidate | Supplied source description / integration interpretation | Adoption status |
|---|---|---|
| Total debt borrowings plus leases ₹5,103.20cr (also rounded₹5,103cr) | Audited consolidated balance sheet; intended to fill EV inputs | Contradicted as an inclusive total: exact balance-sheet borrowings₹5,103.23cr exclude separate leases₹274.53cr |
| Cash/cash equivalents/bank balances/short-term investments ₹411.30cr (also rounded₹411cr) | Audited cash/bank/current investments at March31 | Composition not established; exact reported cash₹411.26cr, other banks₹100.67cr separate; investments unverified |
| Calculated net debt excluding acceptances ₹4,691.90cr | Supplied5103.20−411.30 | Arithmetic correct on supplied operands, not a canonical net-debt observation |
| Management net debt incl acceptances ₹6,722.00cr | Official release/earnings disclosure; working-capital acceptances included | Headline verified, not a substitute for canonical bridge; presentation separately reports4601+2121=6722 |

Supplied interpretation preserved: adding debt/cash intended to resolve EV missing variables; acceptance treatment depends on IID buyer's-credit/working-capital classification; supplied alternatives4691.90 excluding acceptances vs6722 including. Neither is chosen without source/contract reconciliation. Required component review includes current/non-current borrowings, leases (no duplicate addition), cash/banks/deposits/investments/restrictions, acceptances/bills/buyer's credit/LC obligations, and management definition/bridge. Exact verified/missing components and residual differences appear in the main report. No contract accounting decision is made from a summary or valuation preference.
