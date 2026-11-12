# Snapshot-to-Live W07 — Financial Limitation Resolution Report (`L-038`, `L-039`, and `L-040` Preservation)

- **Work Item:** Snapshot-to-Live `W07` — Issuer Limitation Semantics / Financial Limitation Resolution
- **Date:** `2026-11-12`
- **Implementation Repository:** `ramkivs/iips-review-recovered` (`IRR`)
- **Read-Only Counterpart Inspected:** `ramkivs/iips-production-market-data` (`IPD`, commit `a624d06`, read-only inspection only; zero IPD modifications)
- **Active Branch:** `arena/e8f9f3d2-iips-review-recovered` (branched from `main` @ `a835d4af019ab4f677ab238ec42d44326f06a771`, atop W05 qualification commit `6ae09ac087cd8f89feb5f7c519bedac1858bd2c1`)
- **Roadmap Traceability:** `IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md` (`W07`, `GD-3`, `B03`, `B08`; dependencies `W05 -> W07 -> W10, W15, W20`)

---

## 1. Executive Summary and Authoritative Dispositions

W07 investigated the two open issuer-specific financial-data limitations carried forward from the IID real-issuer campaign and W05 qualification dossier — **`L-038`** (Marico Limited consolidated preference share capital) and **`L-039`** (KEC International Limited consolidated `CURRENT_INVESTMENTS` zero / XBRL taxonomy / rounding semantics) — while preserving **`L-040`** (`RESOLVED`) and all accepted **W05** source-rights and coverage-qualification corrections (`6ae09ac087cd8f89feb5f7c519bedac1858bd2c1`).

| ID | Subject / Issuer | W07 Disposition | Frozen IID Register (`2026-11-06`) | Summary Basis |
|---|---|---|---|---|
| **`L-038`** | **Marico Limited** (`IN:CIN:L15140MH1988PLC049208`, `INE196A01026`, BSE `531642`, NSE `MARICO`) — consolidated issued/paid-up `PREFERENCE_CAPITAL` | **`UNRESOLVED_PENDING_EXTERNAL_EVIDENCE`** | `OPEN` (unchanged in historical register) | Audited FY24, FY25, and FY26 Integrated Annual Reports disclose `₹65 Crore` (`6,50,00,000` shares of ₹10 each, printed as rounded `"7 Crore"` shares) under *Authorised share capital* in Note 12(a), print **only** Equity Share Capital (`₹129 cr` FY24; `₹130 cr` FY25–FY26) under *Issued, subscribed and paid-up share capital*, use non-exhaustive `"includes::"` in Note 12(a)(v), and contain **no audited statement or note sentence declaring issued preference capital nil**. Supplementary statutory filings published on `marico.com` (`Draft_MGT-7_-_FY24.pdf`, `Draft_MGT-7_-_FY25.pdf`) show `0` issued/subscribed/paid-up preference shares for standalone `MARICO LIMITED`, **but** (1) are explicitly unsigned pre-AGM drafts (*"This is draft MGT-7 prepared before holding of AGM"*), (2) have no verifiable signed post-AGM MCA filing or FY26 signed MGT-7 in public sources, and (3) cover `STANDALONE_COMPANY` only rather than `CONSOLIDATED_GROUP` (21 subsidiaries including partially owned subsidiaries). Absence of consolidated disclosure is never converted into `0`; `PREFERENCE_CAPITAL` remains `MISSING('NOT_REPORTED')` (`value: null`), withholding EV-to-equity intrinsic value while preserving EV-only and price-free outputs. |
| **`L-039`** | **KEC International Limited** (`IN:CIN:L45200MH2005PLC152061`, `INE389H01022`, NSE `KEC`, BSE `532714`) — consolidated `CURRENT_INVESTMENTS` zero / source / taxonomy / rounding | **`UNRESOLVED_PENDING_EXTERNAL_EVIDENCE`** | `OPEN` (unchanged in historical register) | SEBI's official `in-capmkt` taxonomy (`core/in-capmkt.xsd`, `in-capmkt-lab.xml`, `in-capmkt-cal-2025-01-31.xml`, `in-capmkt-ref-2025-01-31.xml`, published on NSE S.No. 6 and BSE S.No. 7) defines `in-capmkt:CurrentInvestments` as `xbrli:monetaryItemType` (`instant`, `debit`, `nillable="true"`), referencing SEBI LODR Reg 33 Annexure IX and MCA Schedule III Division II Part I Assets `(2)(b)(i)`, summing with weight `+1.0` into `CurrentFinancialAssets` (`₹19,390.60 cr` at `2026-03-31`). However, two independent blockers prevent treating `<in-capmkt:CurrentInvestments contextRef="OneI" unitRef="INR" decimals="-7">0</in-capmkt:CurrentInvestments>` in `march-consolidated-xbrl.gz` as a verified zero: **(1)** NSE/BSE/SEBI publish only the `2025-01-31` taxonomy ZIP (`in-capmkt-ent-2025-01-31.xsd`), whereas the 2026 NSE Excel utility emits `in-capmkt-ent-2026-01-31.xsd` (`HTTP 404` on NSE, `HTTP 530` on `sebi.gov.in`, unpublished in NSE/BSE ZIPs as of `2026-11-12`); and **(2)** every zero monetary tag in `OneI` carries `decimals="-7"` (`10^7` INR = ₹1 crore tolerance), **including `NoncurrentInvestments = 0` (`decimals="-7"`)** where audited Note 10 proves the actual carrying value is **non-zero (`₹49,000` / `₹0.0049 cr`, printed as `*-`)**. Audited FY24–FY26 statements and notes print neither a `Current investments` caption nor any nil statement. `CURRENT_INVESTMENTS` therefore cannot safely feed `NET_DEBT` or `enterpriseToEquity` as `0`; it remains `MISSING('NOT_REPORTED')`, withholding `NET_DEBT` and per-share intrinsic value while keeping `GROSS_DEBT` (`₹5,103.23 cr`), `ENTERPRISE_VALUE`, and price-free ratios valid. |
| **`L-040`** | **IRR Valuation Bridge (`enterpriseToEquity`)** — zero-substitution on `MISSING` capital-structure claims | **`RESOLVED`** *(preserved)* | `RESOLVED` (`2026-11-07`) | Preserved intact. `enterpriseToEquity` in `iips-platform/src/investment/valuation/methods.ts` fails closed on `MISSING` / `NOT_COMPUTABLE` `netDebt`, `preferenceCapital`, and `minorityInterest` (`MISSING_NET_DEBT`, `MISSING_PREFERENCE_CAPITAL`, `MISSING_NON_CONTROLLING_INTEREST`) and never substitutes `0`. Regression suite `l040ValuationZeroSubstitution.test.ts` and committed corrected KEC payload (`fc50c53e08814d7851d7b9bb569ddf1eb4eec19ad7508c3c16db9b13a943f370`) pass unchanged. |

### Narrow IRR Code Corrections Authorized and Shipped in W07

While `L-038` and `L-039` remain `UNRESOLVED_PENDING_EXTERNAL_EVIDENCE` on primary external issuer/taxonomy evidence, W07's deep inspection of `iips-platform/src/investment/ingestion/xbrl.ts` and `builder.ts` against SEBI `in-capmkt` instance structure (`march-consolidated-xbrl.gz`) demonstrated **five reproducible XBRL ingestion defects** in IRR:

1. **`W07-D1` — Empty / `xsi:nil="true"` XBRL fact zero-fabrication (`Number("") === 0`):** `extractPeriodValues` evaluated `Number(fact.value.replace(/,/g, ''))` without checking `xsi:nil="true"` or empty string `""`, fabricating `PRESENT(0)` in violation of D-2 (`in-capmkt.xsd` declares `CurrentInvestments`, `CashAndCashEquivalents`, `BorrowingsNoncurrent`, `InvestmentsInAssociates`, etc. with `nillable="true"`). Fixed to emit warning `EMPTY_OR_NIL_FACT` and preserve `MISSING('NOT_TAGGED_IN_FILING')` (`value: null`).
2. **`W07-D2` — Duration `periodStart` ignored on multi-horizon XBRL filings (`FourD` Q4 shadowing `OneD` annual):** `extractPeriodValues` matched duration contexts solely on `context.endDate === options.periodEnd` and `builder.ts` omitted `periodStart` when invoking `extractPeriodValues`. On KEC's real NSE filing (`march-consolidated-xbrl.gz`), Q4 3-month context `FourD` (`2026-01-01..2026-03-31`, revenue `₹6,389.75 cr`) preceded full-year 12-month context `OneD` (`2025-04-01..2026-03-31`, revenue `₹23,505.54 cr`), corrupting all 8 mapped P&L / EPS items with 3-month figures alongside 12-month cash flows and emitting 8 false `DUPLICATE_FACT` warnings. Fixed by threading optional `periodStart` through `XbrlExtractionOptions` and `XbrlFileInput`.
3. **`W07-D3` — Dimensional `<segment>` / `<scenario>` contexts colliding with primary statement totals:** `parseXbrlInstance` ignored `<xbrli:segment>` and `<xbrli:scenario>` (`explicitMember` / `typedMember`), allowing dimensional breakdown contexts (such as `I_OtherCurrentFinancialAssets1..2`, `D_OtherExpenses1..5`, `D_Audited`, `I_Audited`) to shadow or collide with undimensioned consolidated/standalone totals. Fixed by flagging `dimensional: true` on contexts with non-empty `<segment>` or `<scenario>` and skipping them during primary line-item extraction.
4. **`W07-D4` — Dataset schema `V3` (`CURRENT_DATASET_SCHEMA`) falsely rejecting V2 item `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES`:** `xbrl.ts` hardcoded `datasetSchema !== 'IIPS_INVESTMENT_FUNDAMENTALS_V2'` rather than checking `itemsPermittedBy(datasetSchema)`, causing `V3` builds to reject `InvestmentsInAssociates` / `InvestmentsInJointVentures` with `LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2` and omit the V2/V3 `MISSING` slot. Fixed via `itemsPermittedBy(datasetSchema)` while preserving `V1` refusal behavior.
5. **`W07-D5` — Non-INR `unitRef` check (`UNIT_NOT_INR`) bypassed on all `INSTANT` balance-sheet items:** `xbrl.ts` gated `UNIT_NOT_INR` behind `!isInstant`, allowing non-INR balance-sheet facts (e.g., `USD` or `shares`) to populate INR balance-sheet items. Fixed to validate INR measure on both `INSTANT` and `DURATION` items expecting `INR` or `INR_PER_SHARE`.

---

## 2. Prior Investigation Baseline Preserved (No Redundant Re-Execution)

W07 inspected and preserved the following committed IRR records and artifacts without mutating historical frozen digests:

- **W05 Qualification Baseline:** `docs/integration/W05-ACTUAL-FINANCIAL-DATASET-QUALIFICATION-2026-11-12.md` (`6ae09ac087cd8f89feb5f7c519bedac1858bd2c1`) — `W05-D1` (`datasetCoverage.ts`) and `W05-D2` (`runAll.ts`) preserved intact (`w05CoverageSourceRights.test.ts` green).
- **WI-7 / WI-11 / WI-12 Marico (`L-038`) Records:**
  - `evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/` (initial FY22–FY24 extraction; SHA-256 manifest intact).
  - `evidence/real-issuer/WI7-L038-DEBT-COMPLETENESS-2026-11-07/` (Note 13(a) borrowings & Note 13(b) lease liabilities; dataset `sha256:433358f3968616b89d89dc551f34660252f8be355866526495baaa93f764f9fc`, payload `1a873047087d9ba40431289ed6705b26a47cf0273edb3055fddf3352d3bc6d59`).
  - `evidence/WI11-L038-CONTRACT-DECISION-2026-11-08/` (Owner Decision Record: Option A strict same-instant `GROSS_DEBT`, Option B strict period-aligned `CASH_AND_EQUIVALENTS` and `NET_DEBT`).
  - `evidence/real-issuer/WI7-L038-RESIDUAL-2026-11-08/` & `evidence/real-issuer/WI12-L038-PREFERENCE-CAPITAL-2026-11-08/` (FY24, FY25, FY26 Annual Report share-capital note probes).
- **WI-8 / L-040 / WI-12 KEC (`L-039`) Records:**
  - `evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/` (FY24–FY26 dataset `sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab`; L-040 corrected payload `fc50c53e08814d7851d7b9bb569ddf1eb4eec19ad7508c3c16db9b13a943f370`).
  - `docs/integration/IIPS_V3_IID_L040_VALUATION_OUTPUT_CORRECTION_2026-11-07.md` (`L-040` `RESOLVED`).
  - `evidence/real-issuer/WI8-L039-CASH-SIDE-2026-11-07/` & `evidence/real-issuer/WI12-L039-CURRENT-INVESTMENTS-2026-11-05/` (Annual Report balance-sheet/notes/cash-flow inspection + compressed NSE `in-capmkt` filings).

---

## 3. Detailed Investigation — `L-038` (Marico Limited Preference Capital)

### 3.1 Audited FY24–FY26 Annual Report Disclosures (Question 1)

Three consecutive audited Integrated Annual Reports of **Marico Limited** (`CIN: L15140MH1988PLC049208`, `ISIN: INE196A01026`, BSE `531642`, NSE `MARICO`, `INDAS`, scale `₹ Crore`) were verified across consolidated and standalone financial statements:

| Fiscal Year | Period End | Primary Source Document | Bytes & SHA-256 | Consolidated Note 12(a) Citation | Standalone Note 12(a) & SoCE Citations | Authorised Preference Capital | Issued / Subscribed / Paid-up Preference Capital |
|---|---|---|---|---|---|---|---|
| **FY2023-24** (with FY23 comparative) | `2024-03-31` (`2023-03-31`) | `Marico_AR_FY2023-24.pdf` (`marico.com/investorspdf/Consolidated_Annual_Report_FY_2023-24.pdf`) | `21,087,675` bytes `03cb0db78289cdda4ffcd4b4e9f14f3b444a52a4fd64d6265578180fa9857595` | PDF pp. 189–190 (`fy24-page189-tail-note12a-share-capital.txt`, `fy24-page190-note12b-reserves-and-surplus.txt`) | Standalone Note 12(a) PDF p. 233; Standalone SoCE PDF p. 254 (`fy24-page254-statement-of-changes-capital-history.txt`) | `7 Crore Preference shares of ₹10 each = ₹65 Crore` (`31-03-2024` & `31-03-2023`) | **No row printed** (only `129 Crore Equity shares of Re. 1 each = ₹129 Crore` printed) |
| **FY2024-25** (with FY24 comparative) | `2025-03-31` (`2024-03-31`) | `Annual_Report_FY2024-25.pdf` (`marico.com/investorspdf/Annual_Report_FY2024-25.pdf`) | `16,803,546` bytes `74e0f6c239f6b611a1d66f361988a65f52bdfb51956ada929de3f4857b1e3474` | PDF pp. 185–186 (`fy25-page185-note12a-consolidated-equity-share-capital.txt`, `fy25-page186-note12a-continued.txt`) | Standalone Note 12(a) PDF pp. 229–230; Standalone SoCE PDF p. 252 | `7 Crore Preference shares of ₹10 each = ₹65 Crore` (`31-03-2025` & `31-03-2024`) | **No row printed** (only `130 Crore Equity shares of Re. 1 each = ₹130 Crore` at `31-03-2025`, `₹129 Crore` at `31-03-2024`) |
| **FY2025-26** (with FY25 comparative) | `2026-03-31` (`2025-03-31`) | `Integrated_Annual_Report_FY2025-26.pdf` (`marico.com/investorspdf/Integrated_Annual_Report_FY2025-26.pdf`, created `2026-07-08`) | `14,757,660` bytes `7ea5e097b415f4fa226d32cad95cdc6435a88c58e43c2db10d4de7b31103ec4f` | PDF p. 205 (`fy26-page205-note12a-consolidated-equity-share-capital.txt`) | Standalone Note 12(a) PDF pp. 250–251; Standalone SoCE PDF p. 275 | `7 Crore Preference shares of ₹10 each = ₹65 Crore` (`31-03-2026` & `31-03-2025`) | **No row printed** (only `130 Crore Equity shares of Re. 1 each = ₹130 Crore` at `31-03-2026` & `31-03-2025`) |

Exact findings in the FY24–FY26 audited statements and notes:

1. **Authorised vs. Issued Share Capital asymmetry (Note 12(a)):** Every year from FY22 through FY26 prints `7 Crore Preference shares of ₹10 each = ₹65 Crore` inside *Authorised share capital* (total authorised capital `₹295 Crore` = `₹150 cr` Re. 1 equity + `₹80 cr` ₹10 equity + `₹65 cr` ₹10 preference), and immediately below under *Issued, subscribed and paid-up share capital* prints **only** the Re. 1 equity share row (`₹129 cr` / `₹130 cr`) with total equal to that single row — printing neither a `0`, `—`, `Nil` preference row nor a footnote stating no preference shares are issued.
2. **Internal inconsistency in Rights sub-note `12(a)(ii)`:** Titled *"Rights, preferences and restrictions attached to equity shares"*, sub-note `12(a)(ii)` states *"The Company has authorised capital of 150 Crores equity shares of Re. 1 each and 8 Crores equity shares of Rs. 10 each"* — omitting the `₹65 Crore` authorised preference shares printed in the table ten lines above and providing no preference-share terms or non-issuance statement.
3. **Non-exhaustive sub-note `12(a)(v)` and Note `12(b)` check:** Sub-note `12(a)(v)` (*"Shares allotted as fully paid-up pursuant to contract(s) without payment being received in cash / bonus shares / shares bought back"*) uses non-exhaustive `"includes::"` grammar covering 5-year WEOMA ESOP equity allotments. Consolidated PDF p. 190 (`fy24-consolidated-note12a-pdf-page190.txt`) confirms Note `12(a)` ends at `12(a)(v)` and is immediately followed by `12(b) Reserves and surplus`.
4. **Historical existence of preference share capital in Marico:** Standalone Statement of Changes in Equity (FY24 PDF p. 254, FY25 PDF p. 252, FY26 PDF p. 275) records `"September, 2002 — 2.92 Crore Bonus Preference shares of ₹10 each (Ratio 1:1) — ₹2,925 Lakh"` and `"March, 2004 — Redemption of 2.92 Crore Preference shares — (₹2,925 Lakh)"`, proving preference capital has historically been issued by Marico and that silent table omission is not structural impossibility.

### 3.2 Classification Analysis Under Ind AS 32 / Schedule III (Question 2)

- **Explicitly reported on balance sheet or Note 12(a)?** **No.** Only *Authorised* preference share capital (`₹65 Crore`) is reported; *Issued, subscribed and paid-up* preference share capital has no row.
- **Presented under another classification?** Under **Ind AS 32** (*Financial Instruments: Presentation*), preference shares with mandatory redemption or non-discretionary dividends are classified as **financial liabilities** (`Note 13(a) Borrowings`), whereas non-redeemable discretionary preference shares are classified within **equity** (`Share capital` / `Other equity`, or `Non-controlling interests` if issued by a subsidiary to external holders). Inspection of Consolidated Balance Sheet (FY24 PDF p. 176), Note 12(b) *Reserves and surplus* (`₹3,702 cr` FY24), Note 12(c) *Non-controlling interests* (`₹337 cr` FY24), and Note 13(a) *Borrowings* (`₹0 cr` non-current and `₹383 cr` current at `31-03-2024`; `₹120 cr` non-current and `₹355 cr` current at `31-03-2023`, itemized as term loans, working-capital demand loans, commercial paper, and export packing credit in `WI7-L038-DEBT-COMPLETENESS-2026-11-07`) shows **no** preference-share liability or equity line item under any alternative caption.
- **Genuinely nil vs. unavailable at consolidated scope?** As shown in §3.3 below, standalone parent `MARICO LIMITED` has `0` issued preference shares in its draft Form MGT-7 returns, **but** no audited consolidated financial statement, note, or signed group-wide statutory schedule establishes that consolidated preference capital across Marico and its 21 consolidated subsidiaries is nil. Under governed IRR rules (D-2 and `L-035`), **absence of an audited consolidated line item is `MISSING('NOT_REPORTED')`, never `0`**.

### 3.3 Supplementary Statutory & Exchange Disclosures — New W07 Evidence (Question 3)

W07 extended the search beyond the Annual Reports to Marico's statutory Companies Act and SEBI LODR exchange disclosures:

1. **Form No. MGT-7 (Annual Return under Section 92(3) of the Companies Act, 2013) — FY2023-24 & FY2024-25:**
   - Retrieved from `https://marico.com/investorspdf/Draft_MGT-7_-_FY24.pdf` and `https://marico.com/investorspdf/Draft_MGT-7_-_FY25.pdf` (`CIN: L15140MH1988PLC049208`, `MARICO LIMITED`).
   - **Section `IV.(i)(b) Preference share capital` (verbatim in both FY24 and FY25 returns):**
     - `Number of classes`: **`1`**
     - `Class description`: `Preference Shares of Rs. 10/- each` (`Nominal value per share (in INR): 10`)
     - `Number of shares`: `Authorised = 65,000,000` | **`Issued = 0`** | **`Subscribed = 0`** | **`Paid-up = 0`**
     - `Total amount of shares (in INR)`: `Authorised = 650,000,000` (`₹65.00 Crore` — explaining Note 12(a)'s whole-crore rounded share count `"7 Crore"` for `6.50 Crore` shares) | **`Issued = 0`** | **`Subscribed = 0`** | **`Paid-up = 0`**.
   - **Section `IV.(i)(d) Details of stock split / consolidation / movement in Preference shares`:** `At the beginning of the year: 0 | Increase during the year: 0 | Decrease during the year: 0 | At the end of the year: 0`.
   - **Section `VI.(a)/(b)` Promoter & Public shareholding:** `Preference shares = 0` (`0.00%`).
2. **SEBI LODR Regulation 31 Shareholding Pattern & Regulation 10(c) ESOP Filings:**
   - `https://marico.com/investorspdf/Shareholding_Pattern_March_31,_2024.pdf` (`Class of Security: Equity Shares`, BSE `531642` / NSE `MARICO`, `INE196A01026`): reports `1,29,40,78,078` fully paid equity shares and states `"Whether the Listed Entity has issued any Convertible Securities? No"` and `"Whether the Listed Entity has issued any Warrants? No"`. BSE Regulation 10(c) filings through September 2026 (`666626ee-...pdf`, `d76c8841-...pdf`) record only Re. 1 ESOP equity allotments (`INE196A01026`).

**Why these supplementary filings do NOT authorize closing `L-038` as `RESOLVED` (three independent disqualifiers):**

1. **Explicit Uncertified Pre-AGM Draft Status:** Item `I.(viii)(f)` of both `Draft_MGT-7_-_FY24.pdf` and `Draft_MGT-7_-_FY25.pdf` states verbatim: *"Whether complete list of shareholders, debenture holders has been enclosed as an attachment — No (`This is draft MGT-7 prepared before holding of AGM as per Companies Act, 2013`)"*, with empty digital-signature fields at the end of the form. No signed post-AGM MCA-filed Form MGT-7 (carrying MCA SRN/challan) and no FY2025-26 signed MGT-7 were retrievable from public authoritative sources.
2. **Entity Scope Mismatch (`STANDALONE_COMPANY` vs. `CONSOLIDATED_GROUP`):** Form MGT-7 is a statutory return of the standalone parent (`MARICO LIMITED`) only. Item `III` of the same MGT-7 lists **21 subsidiaries** consolidated into Marico's group balance sheet, including **partially owned subsidiaries** (`Marico Bangladesh Limited` `90%`, `Apcos Naturals Private Limited` `60%` in FY24 / `100%` in FY25, `HW Wellness Solutions Private Limited` `53.98%`, `Satiya Nutraceuticals Private Limited` `51.36%`, `Juizo Advisory Private Limited` `51.36%`). Under `contracts/nilBinding.ts` (`L-035`), a `STANDALONE_COMPANY` disclosure is rejected on a `CONSOLIDATED` period row (`NIL_SCOPE_NUANCE_UNACKNOWLEDGED`) unless backed by an explicit cross-scope operator acceptance grounded in audited group-wide evidence ruling out subsidiary preference shares.
3. **Prohibition on Zero-Inference:** Converting an unsigned standalone pre-AGM draft and an omitted consolidated annual-report row into consolidated `PREFERENCE_CAPITAL = 0` or `NIL_BY_DISCLOSURE` would violate D-2 and the explicit W07 constraint (*"Do not convert absence of disclosure into zero"*).

### 3.4 Canonical Ingestion, Mapping, and Valuation Impact (Question 4)

- **Canonical representation:** Existing IRR contracts (`LINE_ITEMS.PREFERENCE_CAPITAL`, `observation.ts`, `nilBinding.ts`, `capitalStructure.ts`, and `enterpriseToEquity`) represent `L-038` **accurately without code changes**:
  - In `periods.csv`, an empty `PREFERENCE_CAPITAL` cell ingests as `{ value: null, presence: 'MISSING', reason: 'NOT_REPORTED' }`.
  - If a future audited consolidated filing states an explicit nil sentence, V3 `NIL[section=BS;class=PREFERENCE_SHARE_CAPITAL;scope=CONSOLIDATED_GROUP]: <quote>` binds it as `NIL_BY_DISCLOSURE` without fabricating `PRESENT(0)`.
  - `XBRL_TAG_MAP` in `xbrl.ts` rightly omits a face balance-sheet mapping for `PREFERENCE_CAPITAL` because SEBI's `in-capmkt` Ind AS balance sheet only exposes `EquityShareCapital` and `OtherEquity` on the face (redeemable preference shares sit in `Borrowings` under Ind AS 32).
- **Assessment & valuation impact on Marico (`WI7-L038-DEBT-COMPLETENESS-2026-11-07`):**
  - Under WI-11 Owner Decision Option A (`capitalStructure.ts`), Marico's `2024-03-31` `GROSS_DEBT` is also independently `NOT_COMPUTABLE` (`PERIOD_MISMATCH`) because FY24 `LONG_TERM_BORROWINGS` and `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` are absent at `2024-03-31` (`₹120 cr` / `₹103 cr` exist only at `2023-03-31`).
  - Under `L-040` (`enterpriseToEquity`), `EQUITY_VALUE` and `PER_SHARE_INTRINSIC_VALUE` are **withheld** (`MISSING_NET_DEBT`, `MISSING_PREFERENCE_CAPITAL`), while `ENTERPRISE_VALUE` (where EV inputs are complete) and price-free operating metrics (`EBITDA`, `FREE_CASH_FLOW`, `ROCE`) remain valid and unblocked.

---

## 4. Detailed Investigation — `L-039` (KEC International Limited `CURRENT_INVESTMENTS`)

### 4.1 Exact Source and SEBI `in-capmkt` Taxonomy Meaning (Question 1)

W07 inspected all four committed primary NSE exchange filings in `evidence/real-issuer/WI12-L039-CURRENT-INVESTMENTS-2026-11-05/source/`, both audited Annual Reports in `evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/`, and the official SEBI `Integrated Filing - Financial - Ind AS` (`in-capmkt`) taxonomy package:

| Source Artifact | Scope & Period | Size / Digest | Relevant Content |
|---|---|---|---|
| `march-consolidated-xbrl.gz` (`INTEGRATED_FILING_INDAS_1668450_16052026105416_WEB.xml`) | Consolidated Q4 & FY26 (`OneI` = `2026-03-31`, `OneD` = `2025-04-01..2026-03-31`, `FourD` = `2026-01-01..2026-03-31`) | `.gz` SHA-256 `a7defc017d0d0f50d42e4fd940625be4c7141b9f26fefcf0f64b7adc554301ee`; raw XML `190,118` bytes, SHA-256 `133f0cf14a5bbdecf055affc046e5aa73097f8d9793bf423942933b037f19d21` | `LevelOfRounding = 'Crores'`, `unitRef = 'INR'`; `<in-capmkt:CurrentInvestments contextRef="OneI" unitRef="INR" decimals="-7">0</in-capmkt:CurrentInvestments>` |
| `march-standalone-xbrl.gz` | Standalone Q4 & FY26 (`OneI` = `2026-03-31`) | Compressed NSE XML | `NoncurrentInvestments = 14226900000` (`₹1,422.69 cr`, `decimals="-5"`); `CurrentInvestments = 0` (`decimals="-7"`) |
| `march-rendered.gz` | NSE exchange-rendered HTML sheet (`₹ Lakh`) for FY26 consolidated filing | Compressed NSE HTML | Renders `Non-current investments = 0.00` and `Current investments = 0.00` alongside `Trade receivables, current = 6,47,421.00` Lakh (`₹6,474.21 cr`) |
| `september-consolidated-xbrl.gz` | Consolidated H1 FY26 (`OneI` = `2025-09-30`) | Compressed NSE XML | `NoncurrentInvestments = 0` (`decimals="-7"`); `CurrentInvestments = 0` (`decimals="-7"`); `CashAndCashEquivalents = 3,154,700,000` (`₹315.47 cr`, `decimals="-5"`) |
| `KEC_Annual_Report_2025-26.pdf` & `KEC_Annual_Report_2024-25.pdf` | Audited Consolidated Financial Statements (`FY26`, `FY25`, `FY24` comparative) | FY26: `18,566,481` bytes (`ba638897313ac1fe5b7da42d7a95dac5f9efec1d1a203f88d9f963622ba3c820`); FY25: `14,873,309` bytes (`29dfdf83bd8e7915500a7fd9447a0782af651cc0f2ea43bd8e05ee9ea46ce1c6`) | Consolidated Balance Sheet PDF p. 117 (printed p. 230), Note 10 p. 129, Notes 16–20 pp. 131–132, Note 54 p. 145, Cash Flow pp. 118–119 |

**SEBI `in-capmkt` Taxonomy Specification for `CurrentInvestments`** (verified from `core/in-capmkt.xsd`, `core/in-capmkt-lab.xml`, `IntegratedFinance_IndAS/in-capmkt-cal-2025-01-31.xml`, and `IntegratedFinance_IndAS/in-capmkt-ref-2025-01-31.xml`):

- **Element declaration (`core/in-capmkt.xsd`):** `name="CurrentInvestments"`, `id="in-capmkt_CurrentInvestments"`, `type="xbrli:monetaryItemType"`, `substitutionGroup="xbrli:item"`, `periodType="instant"`, `balance="debit"`, **`nillable="true"`**, `abstract="false"`.
- **Standard label (`core/in-capmkt-lab.xml`):** `"Current investments"` (`http://www.xbrl.org/2003/role/label`).
- **Authoritative statutory references (`in-capmkt-ref-2025-01-31.xml`):**
  1. `Publisher: SEBI | Name: Listing Regulations | Section: Regulation 33 | Paragraph: Annexure IX`.
  2. `Publisher: MCA | Name: Schedule III | Paragraph: Part I of - Balance sheet - Assets (2) (b) (i)` (*Current assets -> Financial assets -> (i) Investments*).
- **Calculation linkbase (`in-capmkt-cal-2025-01-31.xml`, role `[200100] Statement of Assets and Liabilities`):** `in-capmkt:CurrentFinancialAssets` is the weighted `+1.0` sum of exactly six child concepts:
  1. `in-capmkt:CurrentInvestments` (`order="10.0"`, `weight="1.0"`)
  2. `in-capmkt:TradeReceivablesCurrent` (`order="20.0"`, `weight="1.0"`)
  3. `in-capmkt:CashAndCashEquivalents` (`order="30.0"`, `weight="1.0"`)
  4. `in-capmkt:BankBalanceOtherThanCashAndCashEquivalents` (`order="40.0"`, `weight="1.0"`)
  5. `in-capmkt:LoansCurrent` (`order="50.0"`, `weight="1.0"`)
  6. `in-capmkt:OtherCurrentFinancialAssets` (`order="60.0"`, `weight="1.0"`)

### 4.2 Complete Balance-Sheet Reconciliation & Proof of `decimals="-7"` Rounding / Template Ambiguity (Question 2)

Reconciling `march-consolidated-xbrl.gz` (`OneI`, `2026-03-31`) line-by-line against the audited Consolidated Balance Sheet (`KEC_Annual_Report_2025-26.pdf`, PDF p. 117 / printed p. 230) establishes both the exact arithmetic and the decisive `decimals="-7"` defect:

| SEBI `in-capmkt` Tag (`OneI`, `2026-03-31`) | XBRL Raw Value (`INR`) | XBRL `decimals` | Equivalent (`₹ Crore`) | Audited Consolidated Balance Sheet (`PDF p. 117`) | Reconciliation Note |
|---|---:|---:|---:|---|---|
| `CurrentInvestments` | `0` | **`-7`** | `0.00` (tol. `±0.50 cr`) | *(Caption omitted on face & notes)* | Uncorroborated `decimals="-7"` zero |
| `TradeReceivablesCurrent` | `64,742,100,000` | `-5` | `6,474.21` | `(2)(b)(i) Trade receivables` (Note 16): **`6,474.21`** | Exact (`10^5` INR = `₹0.01 cr`) |
| `CashAndCashEquivalents` | `4,112,600,000` | `-5` | `411.26` | `(2)(b)(ii) Cash and cash equivalents` (Note 17): **`411.26`** | Exact |
| `BankBalanceOtherThanCashAndCashEquivalents` | `1,006,700,000` | `-5` | `100.67` | `(2)(b)(iii) Bank balances other than (ii)` (Note 18): **`100.67`** | Exact |
| `LoansCurrent` | `0` | **`-7`** | `0.00` (tol. `±0.50 cr`) | *(Caption omitted on face & notes)* | Uncorroborated `decimals="-7"` zero |
| `OtherCurrentFinancialAssets` | `124,044,600,000` | `-5` | `12,404.46` | `(2)(b)(iv) Other financial assets` (Note 19): **`276.90`** + `(2)(c) Contract assets` (Note 20): **`12,127.56`** | Exact sum (`276.90 + 12,127.56 = 12,404.46`); itemized in dimensional contexts `I_OtherCurrentFinancialAssets1` (`'Other financial assets' = 2,769,000,000`, `dec="-6"`) and `I_OtherCurrentFinancialAssets2` (`'Contract assets' = 121,275,600,000`, `dec="-5"`) because `in-capmkt` has no separate face tag for `ContractAssets` |
| **`CurrentFinancialAssets` (Total)** | **`193,906,000,000`** | `-6` | **`19,390.60`** | Subtotal `(2)(b)` `7,263.04` + `(2)(c)` `12,127.56` = **`19,390.60`** | **Exact calculation-linkbase sum (`0 + 6,474.21 + 411.26 + 100.67 + 0 + 12,404.46 = 19,390.60`)** |

**Decisive empirical proof from `NoncurrentInvestments` in the SAME XBRL instance (`march-consolidated-xbrl.gz`):**

- In context `OneI` (`2026-03-31`) of `march-consolidated-xbrl.gz`, **every single reported non-zero figure** carries `decimals="-5"` (`10^5` INR = `₹0.01 cr`, two decimal places in Crore) or `decimals="-6"` (`10^6` INR = `₹0.10 cr`, when trailing hundredths digit is zero, e.g., `276.90 cr` -> `-6`, `19,390.60 cr` -> `-6`).
- Conversely, **every single `0` monetary tag across all 13 zero-valued balance-sheet tags in `OneI` carries `decimals="-7"` (`10^7` INR = `₹1.00 crore`)** — **including `<in-capmkt:NoncurrentInvestments contextRef="OneI" unitRef="INR" decimals="-7">0</in-capmkt:NoncurrentInvestments>`**!
- Yet on the **Audited Consolidated Balance Sheet (PDF p. 117)** and **Note 10 — Non-Current Investments (PDF p. 129, `fy26-notes-09-to-10-intangible-assets-and-investments-pdf-page129.txt`)**, KEC's consolidated non-current investments are **explicitly NOT zero**:
  - Balance Sheet PDF p. 117 prints **`*-`** under `(1)(e)(i) Investments` (Note 10), defined in the bottom footnote as **`*less than rounding off norms adopted by the Company`**.
  - Note 10 (PDF p. 129) discloses: **`4,900 fully paid Equity Shares of ₹10 each of RP Goenka Group of Companies Employees Welfare Association` = ₹49,000 (`₹0.0049 crore`)** at both `31-03-2026` and `31-03-2025`!
- This proves from KEC's own filing that the NSE Excel XBRL utility (`Integrated_Filing_Finance_Ind_AS`) emits `<... decimals="-7">0</...>` **both** when a non-zero sub-rounding balance exists (`NoncurrentInvestments` = ₹49,000 -> `0` at `decimals="-7"`) **and** when an unprinted Schedule III caption (`CurrentInvestments`, `LoansCurrent`, `BiologicalAssetsOtherThanBearerPlants`, `InvestmentProperty`) is left blank/zero in the Excel workbook rather than marked `xsi:nil="true"`. Neither genuine `₹0` nor a non-zero sub-rounding amount may be inferred from `<CurrentInvestments decimals="-7">0</CurrentInvestments>` alone.

### 4.3 NSE Schema Retrieval Failure (`in-capmkt-ent-2026-01-31.xsd`) & Authoritative Exchange Taxonomy Sources (Question 3)

1. **Why direct URL resolution failed (`HTTP 404` / `HTTP 530`):**
   - `march-consolidated-xbrl.gz` declares `xmlns:in-capmkt="http://www.sebi.gov.in/xbrl/2026-01-31/in-capmkt"` and `<link:schemaRef xlink:type="simple" xlink:href="in-capmkt-ent-2026-01-31.xsd"/>`.
   - Under the XBRL Taxonomy Packages 1.0 specification, Indian exchange filings use a **relative** `schemaRef` intended to be resolved locally through `META-INF/taxonomyPackage.xml` and `META-INF/catalog.xml`; neither `https://nsearchives.nseindia.com/corporate/xbrl/in-capmkt-ent-2026-01-31.xsd` (`HTTP 404`) nor `http://www.sebi.gov.in/xbrl/2026-01-31/...` (`HTTP 530`) hosts `.xsd` files at those URIs.
2. **Authoritative exchange taxonomy download locations verified on `2026-11-12`:**
   - **NSE Official XBRL Information Page** (`https://www.nseindia.com/static/companies-listing/xbrl-information`, updated `06/11/2026`, Table Row 6 *"Regulation 33 - Financial Results - Ind AS / Integrated Filing - Financial - Ind AS"*):
     - SEBI Taxonomy Package ZIP (`227 KB`): `https://nsearchives.nseindia.com/web/sites/default/files/inline-files/Taxonomy%20Integrated%20filing%20finance%20%28IndAS%29.zip`
     - Excel XBRL Filing Utility (`896 KB`, July 2026): `https://nsearchives.nseindia.com//web/mediaattachment/2026-07/Integrated_Filing_Finance_Ind_AS_20260706165729.zip`
     - Taxonomy Archives ZIP (`July 2026`): `https://nsearchives.nseindia.com//web/mediaattachment/2026-07/Taxonomy_Archives_20260731164437.zip`
   - **BSE Official XBRL Information Page** (`https://www.bseindia.com/static/about/xbrl_info`, Taxonomy Item 7 *"Integrated Filing - Financial - Ind AS"*):
     - SEBI Taxonomy Package ZIP: `https://www.bseindia.com/downloads1/Integrated_Filing_Financial_Ind_AS.zip`
3. **Unresolved upstream `2025-01-31` vs. `2026-01-31` publication skew:**
   - Inspection of SEBI's published `Taxonomy Integrated filing finance (IndAS)` package (`META-INF/taxonomyPackage.xml` and `META-INF/catalog.xml`) shows `<tp:identifier>http://www.sebi.gov.in/xbrl/2025-01-31</tp:identifier>`, `<tp:publicationDate>2025-01-31</tp:publicationDate>`, and entry point `http://www.sebi.gov.in/xbrl/2025-01-31/IntegratedFinance_IndAS/in-capmkt-ent-2025-01-31.xsd`.
   - While NSE updated the Excel filing utility macro (`Integrated_Filing_Finance_Ind_AS_20260706165729.zip`) to emit namespace `2026-01-31` and `schemaRef="in-capmkt-ent-2026-01-31.xsd"`, **SEBI/NSE/BSE have not published a `2026-01-31` taxonomy package containing `in-capmkt-ent-2026-01-31.xsd`**. Date-substituting `2025-01-31` confirms the `CurrentInvestments` concept semantics (§4.1), but does **not** supply an authoritative `2026-01-31` schema file — and even with DTS validation, `CurrentInvestments` is `nillable="true"` and its `decimals="-7"` `0` remains indistinguishable from a sub-rounding (`*-`) or template-default zero (§4.2).

### 4.4 Audited Financial Statement Notes Evaluation (Question 4)

All relevant statements and notes in `KEC_Annual_Report_2025-26.pdf` and `KEC_Annual_Report_2024-25.pdf` were checked for independent corroboration:

- **Consolidated Balance Sheet (FY26 PDF p. 117; FY25 PDF p. 110):** Under `(2) Current assets -> (b) Financial assets`, prints `(i) Trade receivables` (Note 16), `(ii) Cash and cash equivalents` (Note 17), `(iii) Bank balances other than (ii) above` (Note 18), and `(iv) Other financial assets` (Note 19). Schedule III's standard `(i) Investments` caption is omitted without footnote or nil statement.
- **Note 3.19 (Accounting Policy — Cash and cash equivalents):** Defines cash and cash equivalents as cash on hand, demand deposits, and short-term highly liquid investments with original maturity of three months or less (`₹411.26 cr` in Note 17); does not state that current investments outside cash equivalents (`> 3 months` and `≤ 12 months`, mutual funds, commercial paper, bonds) are nil.
- **Note 10 (Non-current investments, PDF p. 129):** Covers only `(1)(e)(i)` non-current equity shares (`₹49,000` -> `*-`).
- **Notes 17, 18, 19, 20 (PDF pp. 131–132):** Itemize `Cash and cash equivalents` (`₹411.26 cr`), `Other bank balances` (`₹100.67 cr`), `Other financial assets` (`₹276.90 cr`), and `Contract assets` (`₹12,127.56 cr`); none mentions current investments.
- **Note 54 (Financial Instruments — Fair Value and Risk Management under Ind AS 107, PDF p. 151):** Tabulates financial assets by measurement category (`FVTPL`, `FVTOCI`, `Amortised cost`). Only `Non-current investments` (`*-`), derivative assets, trade receivables, cash & bank balances, loans, and other financial assets appear — no `Current investments` row and no prose stating current investments are nil.
- **Consolidated Cash Flow Statement — Investing Activities (PDF p. 118):** Lists capital expenditure (`-₹328.68 cr`), disposal proceeds, bank-deposit movements, and interest received, with no purchase/sale of current investments row (which proves only no separately material gross/net cash flow line was presented, not whether a sub-rounding balance existed or whether nil was declared).

**Conclusion on Notes:** The financial statement notes **do not** provide sufficient independent evidence to declare `CURRENT_INVESTMENTS` either `0` or `NIL_BY_DISCLOSURE` without violating D-2 and `L-035`.

### 4.5 Net-Debt and Valuation Consumption Safety (Question 5)

- **Can `NET_DEBT` and valuation calculations safely consume `CURRENT_INVESTMENTS = 0` for KEC?** **No.**
  - Under governed R-4.1 (`iips-platform/src/investment/assessment/capitalStructure.ts`, WI-11 Option B), `CASH_AND_EQUIVALENTS = CASH_AND_CASH_EQUIVALENTS + OTHER_BANK_BALANCES + CURRENT_INVESTMENTS`, and `NET_DEBT = GROSS_DEBT - CASH_AND_EQUIVALENTS`. Consuming an uncorroborated `decimals="-7"` XBRL zero as `PRESENT(0)` would silently treat `CURRENT_INVESTMENTS` as verified zero and ungate `NET_DEBT` (and, if `PREFERENCE_CAPITAL`/`MINORITY_INTEREST` were also bound, equity valuation) on unproven source semantics.
  - Keeping `CURRENT_INVESTMENTS` as `MISSING('NOT_REPORTED')` (`value: null`) produces the exact governed, fail-closed result verified in `WI8-INDUSTRIALS-KEC-2026-11-07` (`determination-l040-correction.json`):
    - **`GROSS_DEBT` (`PRESENT`):** `₹5,103.23 cr` (`51,032,300,000` INR at `2026-03-31` = `661.37` LT + `4,441.86` ST + `0` nil-bound current maturities; `₹3,517.40 cr` FY25; `₹3,816.82 cr` FY24).
    - **`CASH_AND_EQUIVALENTS` & `NET_DEBT` (`NOT_COMPUTABLE`):** Withheld with `MISSING_CASH_SIDE:CURRENT_INVESTMENTS` (`CASH_AND_CASH_EQUIVALENTS = ₹411.26 cr` and `OTHER_BANK_BALANCES = ₹100.67 cr` remain individually visible and auditable).
    - **`ENTERPRISE_VALUE` (`PRESENT` when EV method inputs suffice) vs. `EQUITY_VALUE` / `PER_SHARE_INTRINSIC_VALUE` (`WITHHELD` under `L-040`):** `enterpriseToEquity` refuses equity conversion (`MISSING_NET_DEBT`, `MISSING_PREFERENCE_CAPITAL`, `MISSING_NON_CONTROLLING_INTEREST`) and emits **no** fabricated intrinsic value.
    - **Unaffected price-free operating metrics (`PRESENT`):** `EBITDA` (`₹1,659.78 cr` FY26), `FREE_CASH_FLOW` (`-₹742.82 cr` FY26), `ROCE`, `OPERATING_MARGIN`, and `DEBT_TO_EBITDA` (computed from `GROSS_DEBT / EBITDA`) proceed cleanly.
- **Deliberate `XBRL_TAG_MAP` boundary preserved:** `XBRL_TAG_MAP` in `iips-platform/src/investment/ingestion/xbrl.ts` intentionally continues **not** to map `in-capmkt:CurrentInvestments` blindly to `CURRENT_INVESTMENTS`, because doing so on `march-consolidated-xbrl.gz` would ingest `<CurrentInvestments decimals="-7">0</CurrentInvestments>` as `PRESENT(0)` and violate D-2 / `L-039`.

---

## 5. Narrow IRR Code Corrections Implemented (`xbrl.ts` & `builder.ts`)

| Defect ID | File(s) Modified | Reproducible Defect Before W07 | Surgical Fix Implemented | Verification on Real & Synthetic Filings |
|---|---|---|---|---|
| **`W07-D1`** | `iips-platform/src/investment/ingestion/xbrl.ts` | `Number(fact.value.replace(/,/g, ''))` evaluated `Number("") === 0` for `xsi:nil="true"` or empty-string XBRL facts, fabricating `PRESENT(0)` on `nillable="true"` `in-capmkt` tags. | `parseXbrlInstance` records `nil: true` on `xsi:nil="true"` attributes; `extractPeriodValues` emits warning `EMPTY_OR_NIL_FACT` on `fact.nil === true \|\| fact.value.length === 0` and leaves the item `MISSING('NOT_TAGGED_IN_FILING')` (`value: null`). | Covered in `w07FinancialLimitationResolution.test.ts`; zero-fabrication impossible on nil/empty XML facts. |
| **`W07-D2`** | `iips-platform/src/investment/ingestion/xbrl.ts`, `builder.ts` | `extractPeriodValues` matched duration contexts only by `endDate === periodEnd` and `builder.ts` did not pass `periodStart`. On KEC's `march-consolidated-xbrl.gz`, Q4 `FourD` (`2026-01-01..2026-03-31`, `Revenue = ₹6,389.75 cr`) overwrote annual `OneD` (`2025-04-01..2026-03-31`, `Revenue = ₹23,505.54 cr`) and triggered 8 false `DUPLICATE_FACT` warnings. | Added optional `periodStart` to `XbrlExtractionOptions` and `XbrlFileInput`; `builder.ts` passes `periodStart` (`YYYY-04-01` default) to `extractPeriodValues`; duration contexts with `startDate !== options.periodStart` are skipped when `periodStart` is specified. | On `march-consolidated-xbrl.gz`, all 16 mapped FY26 annual items extract with `0` issues and match `KEC_Annual_Report_2025-26.pdf` to `₹0.01 cr` (`235,055,400,000` INR revenue, `6,055,900,000` INR PAT, `22.75` EPS). |
| **`W07-D3`** | `iips-platform/src/investment/ingestion/xbrl.ts` | `parseXbrlInstance` ignored `<xbrli:segment>` and `<xbrli:scenario>` (`explicitMember` / `typedMember`), allowing dimensional breakdown contexts (`I_OtherCurrentFinancialAssets1..2`, `D_OtherExpenses1..5`, `D_Audited`, `I_Audited`) to collide with undimensioned primary totals. | `parseXbrlInstance` sets `dimensional: true` when `<segment>` or `<scenario>` has child elements; `extractPeriodValues` skips `context.dimensional === true`. | Verified on dimensional breakdown contexts and `march-consolidated-xbrl.gz` (`42` contexts). |
| **`W07-D4`** | `iips-platform/src/investment/ingestion/xbrl.ts` | `xbrl.ts` checked `datasetSchema !== 'IIPS_INVESTMENT_FUNDAMENTALS_V2'` instead of `itemsPermittedBy(datasetSchema)`, rejecting V2 item `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` under `CURRENT_DATASET_SCHEMA` (`V3`). | Replaced hardcoded `!== 'IIPS_INVESTMENT_FUNDAMENTALS_V2'` checks with `!permittedItems.has(...)` derived from `itemsPermittedBy(datasetSchema)`. | `V1` still refuses with `LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2`; both `V2` and `V3` accept and sum `InvestmentsInAssociates` + `InvestmentsInJointVentures`. |
| **`W07-D5`** | `iips-platform/src/investment/ingestion/xbrl.ts` | `UNIT_NOT_INR` check ran only when `!isInstant`, allowing non-INR `INSTANT` balance-sheet facts (e.g., `USD` or `shares`) to populate INR balance-sheet items. | Enforced `UNIT_NOT_INR` across both `INSTANT` and `DURATION` items whose contract unit is `INR` or `INR_PER_SHARE`. | Verified in `w07FinancialLimitationResolution.test.ts`; `BODHI-FY26.xml` and all existing fixtures remain byte-identical. |

---

## 6. External Dependencies to Close `L-038` and `L-039`, and Next Dependency-Ready Activity

### Remaining External Blockers (Outside IRR Code)

1. **To move `L-038` (`Marico Limited`) from `UNRESOLVED_PENDING_EXTERNAL_EVIDENCE` to `RESOLVED`:**
   - Either **(a)** a published, audited Marico Limited consolidated financial statement or note printing an explicit issued/subscribed/paid-up preference share capital row (`Nil` / `0` / numeric) or prose declaration covering the consolidated group, **or** **(b)** a signed, post-AGM MCA-filed Form MGT-7 (for standalone parent) **combined with** audited subsidiary-level share-capital evidence covering all non-wholly-owned consolidated subsidiaries and an explicit V3 cross-scope `NilBinding` operator acceptance.
2. **To move `L-039` (`KEC International Limited`) from `UNRESOLVED_PENDING_EXTERNAL_EVIDENCE` to `RESOLVED`:**
   - **(a)** Publication by SEBI / NSE / BSE of the authoritative `2026-01-31` `Integrated Filing - Financial - Ind AS` taxonomy package (`in-capmkt-ent-2026-01-31.xsd`), **and** **(b)** an audited KEC International financial statement or note (or exchange corrigendum) explicitly stating whether consolidated `Current investments` (`Schedule III Part I Assets (2)(b)(i)`) is genuinely nil vs. a sub-rounding (`< ₹0.50 cr`) balance masked by `decimals="-7"`.

### Downstream Unblocking Impact (`IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`)

- Under Roadmap §B (`W07`) and §I (`B08`), W07's acceptance condition is **contextualized filed values or documented permitted fail-closed retention when uncertain, with affected outputs withheld and unaffected valid methods allowed to proceed**. That contract is now formally established, regression-tested, and published in IRR.
- Under Roadmap §D–E (`W07 -> W10, W15, W20`):
  - **Immediate dependency-ready IRR activities (design / repo-level execution without host personal data):**
    - **`W10` — Issuer-to-engine mapping** (schema-to-metric mapping matrix and eligible/withheld disposition design in IRR; final actual-holder binding awaits `W04`/`W05`/`W06` host & source-rights unblocking).
    - **`W12` — Valuation methodology** (value-weighting formula, denominator, inclusion, currency, time-alignment, and partial/stale vector specification in IRR).
    - **`W16` — Lineage, staleness and comparison** (contract design in IRR) and **`W18` — Independent surfaces and scope** (route-by-route retain/extend disposition and truthful UI labels in IRR).
  - **Parallel IPD / host-data foundation activities:** **`W02`** (synthetic two-connection revision/race test execution in IPD) and **`W03` -> `W04` -> `W06`** (once authorized non-production host access `B02` and market/financial source-rights `B03` are supplied).

---

## 7. Reproducibility and Verification Commands

Run from `/home/user/iips-review-recovered`:

```bash
# 1. Targeted W07, L-038, L-039, L-040, XBRL ingestion, V2/V3 schema, nil-binding, and W05 regression suites
(cd iips-platform && PATH="$PWD/../frontend/node_modules/.bin:$PATH" tsx --test \
  tests/investment/w07FinancialLimitationResolution.test.ts \
  tests/investment/l038CashSideAlignment.test.ts \
  tests/investment/l038MaricoDebtCompleteness.test.ts \
  tests/investment/l039CashSideEvidence.test.ts \
  tests/investment/l040ValuationZeroSubstitution.test.ts \
  tests/investment/ingestion.test.ts \
  tests/investment/dataset-schema-v2.test.ts \
  tests/investment/nil-binding.test.ts \
  tests/investment/w05CoverageSourceRights.test.ts)

# 2. Full iips-platform typecheck, core test suite, and IID test suite
PATH="$PWD/frontend/node_modules/.bin:$PATH" npm --prefix iips-platform run typecheck
PATH="$PWD/frontend/node_modules/.bin:$PATH" npm --prefix iips-platform test
PATH="$PWD/frontend/node_modules/.bin:$PATH" npm --prefix iips-platform run test:iid

# 3. Full frontend typecheck, server typechecks, unit/integration suite, and production build
npm --prefix frontend run typecheck
npm --prefix frontend run typecheck:investment-server
npm --prefix frontend run typecheck:replay-server
npm --prefix frontend test
npm --prefix frontend run build
```
