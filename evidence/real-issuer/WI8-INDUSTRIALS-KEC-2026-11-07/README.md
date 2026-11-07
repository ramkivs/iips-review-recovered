# WI-8 — Industrials sector, KEC International Limited: three audited consolidated periods read, ingested, assessed and persisted

**Work item.** WI-8 of IIPS v3.0 IID: the first real-issuer validation in **Industrials**. The issuer is **KEC
International Limited** (CIN `L45200MH2005PLC152061`, ISIN `INE389H01022`, NSE `KEC`).

**What this bundle is.** The primary bytes (hashed), the fifteen printed pages every ingested fact and figure comes
from, the governed ingestion input, the pipeline run that persisted the artifact, and a separate-process readback. It is
evidence, not a summary: every number here can be re-checked against the extracts in `source/`, and every figure in
`ingest-input/periods.csv` is traced to a printed page in `ingest-input/data-extraction.json`.

**What the run concluded, in one line.** Industrials measured `G2_PARTIAL` at **100 % statement coverage** with
`DCF_FCFF` and `EV_EBITDA` declared usable and `EV_REVENUE` withheld for a missing mandatory operating metric; the
assessment is `SUFFICIENT` / `MATERIAL_CONCERNS` at confidence **0.3199**; and the enterprise-to-equity bridge
**refused** — `grossDebt` resolved to ₹5,377.76 crore but `netDebt` did not, so no per-share intrinsic value and no
margin of safety were published. The refusal is the finding, not a failure of the work item.

---

## 1. Why this issuer, and which issuers were rejected

Industrials is the sector whose governed method matrix is `DCF_FCFF` (PRIMARY), `EV_EBITDA` (SECONDARY) and `EV_REVENUE`
(CROSS_CHECK, mandatory metric `IN_BOOK_TO_BILL`), and which **declares no `PE_RELATIVE` at all**
(`iips-platform/src/investment/coverage/methodMatrix.ts`). A candidate therefore had to supply a full three-period
consolidated record, a print-level debt decomposition and an order book, or fail visibly on all three.

| Candidate | Considered | Outcome |
|---|---|---|
| **KEC International Ltd** | Yes | **Selected.** Two consecutive integrated annual reports fetched byte-verified; three audited consolidated periods; Note 30 decomposes current borrowings into demand loans, other short-term borrowings *and* current maturities; order intake and order book printed. |
| Larsen & Toubro | Yes | Rejected: the annual-report URLs tried returned 404; no primary bytes, so no candidate record could be built. |
| Thermax | Yes | Rejected: only one annual report reachable, so a three-period consecutive record could not be established from primary sources. |
| ABB India | Yes | Rejected: host unreachable from the retrieval environment (no HTTP response). |
| Cummins India | Yes | Rejected: 403 on the annual-report paths tried. |
| Bharat Forge | Yes | Rejected: 403. |
| Siemens India | Yes | Rejected: no annual-report links exposed in server-rendered HTML. |
| AIA Engineering | Yes | Rejected: no annual-report links exposed in server-rendered HTML. |

KEC was **not** selected to obtain a nil declaration, and none was obtained: the run declares no component nil and
publishes one refusal and one withholding instead. Selection turned on legibility and completeness of the printed
statements, which is a different property from a comfortable answer — the issuer's operating cash flow is *negative* in
the newest year and the pipeline says so.

## 2. Source bytes

| Document | URL | bytes | sha256 | pages | HTTP |
|---|---|---|---|---|---|
| Integrated Annual Report 2025-26 | `https://www.kecrpg.com/public/media/annualReportMedia/KEC_Annual_Report_2025-26.pdf` | 18,566,481 | `ba638897313ac1fe5b7da42d7a95dac5f9efec1d1a203f88d9f963622ba3c820` | 215 | 200 |
| Integrated Annual Report 2024-25 | `https://www.kecrpg.com/public/media/annualReportMedia/KEC_Annual_Report_2024-25.pdf` | 14,873,309 | `29dfdf83bd8e7915500a7fd9447a0782af651cc0f2ea43bd8e05ee9ea46ce1c6` | 206 | 200 |
| Integrated Annual Report 2023-24 (**requested, not available**) | `https://www.kecrpg.com/public/media/annualReportMedia/KEC_Annual_Report_2023-24.pdf` | — | — | — | **404** |

The issuer's investor-relations index (`https://www.kecrpg.com/investor-relations/annual-reports`, HTTP 200) exposes only
the newest two years. The FY2023-24 report was therefore **not read**, and the FY2024 column is taken from the
**comparative column** of the two reports that were read. That provenance is stated per row in
`ingest-input/data-extraction.json` (`locators.FY24`) and is not dressed up as a third independent document.

## 3. Three audited consolidated periods, and which document supplies each

| Period end | Column read from | Dataset `filingRef` | Dataset `filedAt` |
|---|---|---|---|
| 2026-03-31 | FY2025-26 report, current column | `KEC-INDAS-CONSOL-FY26-AR` | 2026-05-16 (signature block, PDF p.115) |
| 2025-03-31 | FY2025-26 report, comparative column | `KEC-INDAS-CONSOL-FY26-AR-COMPARATIVE` | 2026-05-16 (same signature block) |
| 2024-03-31 | FY2024-25 report, comparative column | `KEC-INDAS-CONSOL-FY25-AR-COMPARATIVE` | 2025-05-16 (carried in the dataset; the FY2024-25 signature block is **not** among the committed extracts) |

**Framework and scope.** The auditor's report on the *consolidated* financial statements opens
`Independent Auditor's Report — To the Members of KEC International Limited — REPORT ON THE AUDIT OF THE CONSOLIDATED
FINANCIAL STATEMENTS` (FY2025-26 report, PDF p.111, printed 218-219), and the statements declare compliance with
`Indian Accounting Standards (Ind AS)` (basis-of-preparation note, PDF p.120, printed 236-237). Auditor: **Price
Waterhouse Chartered Accountants LLP**, FRN `012754N/N500016`, signed by Sumit Seth, M.No. `105869`. The key audit
matter is construction-contract revenue and cost recognition. Standalone statements exist in both reports and were
**not** used: every figure in this bundle is consolidated.

Each of the three periods is on a **two-printed-pages-per-PDF-sheet** layout in the FY2025-26 report; the FY2024-25 report
prints no page numbers on these sheets. Every citation therefore carries the PDF page, the printed pages where they exist,
and the extract's sha256 (`source/page-map.json`).

## 4. Identity: what the filings print, and what they do not

| Identifier | Value | Where it was verified | Status |
|---|---|---|---|
| CIN | `L45200MH2005PLC152061` | FY2025-26 report PDF p.119, Note 1 General Information | Printed in the filing |
| ISIN (equity) | `INE389H01022` | FY2025-26 report PDF p.107, printed 210-211: "Identification Number allotted to the Equity Shares of the Company is INE389H01022" | Printed in the filing |
| Exchanges | BSE Limited **and** National Stock Exchange of India Limited | Same page | Printed in the filing |
| NSE symbol | `KEC` | `https://www.nseindia.com/get-quotes/equity?symbol=KEC`, retrieved 2026-11-07, 147,213 bytes: the page's own routing payload carries `symbol: "KEC"` and `companyName: "KEC-International-Limited"` (`source/identity-nse-corroboration.json`) | Corroborated by the exchange's own page; **not** printed in either annual report |
| BSE scrip code | — | **Not established** | Omitted, deliberately |

**Where the identity stops, and why that is stated rather than filled.** Neither annual report prints a trading symbol
or a BSE scrip code anywhere in its 215 and 206 pages (grepped end to end). BSE's `stock-share-price` and
`corporates/ann` pages for the scrip returned, on 2026-11-07, an identical 16,912-byte JavaScript shell containing
neither the scrip code nor the company name, so they corroborate nothing. The operator record in
`ingest-input/identity/listing-map.json` therefore carries **one** listing (NSE `KEC`), and the `sourceRef` says in
terms that the identifier is an operator record, that the corroboration is NSE's own payload, and that the BSE leg is
absent because it could not be verified — not because the shares are unlisted. The dataset's `listings.json` is
correspondingly single-legged; nothing was invented to make the identity look complete.

## 5. D-2 in a new sector: nothing declared nil, and a dash is not a number

No cell in `ingest-input/periods.csv` is a `NIL:` cell. Nothing on the fifteen pages read declares borrowings, leases,
current investments, non-controlling interest or preference capital to be nil.

| Item | What the filing prints | Treatment in the dataset |
|---|---|---|
| Current borrowings | Balance-sheet line `4,441.86`, decomposed by Note 30 into I `2,638.96` + II `1,122.54` + FI `444.76` + III `235.60` | Recorded as the Note 30 **partition**: `SHORT_TERM_BORROWINGS = 4,206.26`, `CURRENT_MATURITIES_OF_LONG_TERM_DEBT = 235.60`. They add back to the printed line to the paisa, so the governed gross-debt sum neither double counts nor loses a component. |
| Current investments | **No such line exists** in the consolidated balance sheet; Note 10 lists one non-current investment marked `*`, and the footnote defines `*` as "less than rounding off norms" | `NOT_REPORTED` for all three periods. The `*` is a sub-rounding positive amount, and it is not converted into a nil and not into a zero. |
| Non-controlling interest | **No line** in the balance sheet or in the statement of changes in equity; note 3.3 lists every subsidiary at 100 % | `NOT_REPORTED`. The filing never says the balance is nil. |
| Preference capital | **No line, no note.** Note 23 states "The Company has only one class of Equity shares having face value of ₹ 2 each", which describes equity classes | `NOT_REPORTED`. The report also refers to "100 % preference shares held by the Company in its wholly owned subsidiary" (PDF p.54) — a holding by the subsidiary, not capital of the issuer. |
| Associates / JV | Joint arrangements are disclosed as a jointly controlled operation, consolidated proportionately; no associates/JV carrying value is a balance-sheet line | Not representable in schema V1 (`L-036`); the payload publishes `NOT_COMPUTABLE: NOT_REPORTED` and the policy-zero bridge term, with the `REVIEW_DUE` control. |
| Business acceptances | `2,120.74` / `1,507.27`, a **separate** current-liability line | Not inside borrowings: Note 30's total is `4,441.86`, which equals the borrowings line and excludes acceptances. Not counted in gross debt; no line item carries them. |
| Material cost (P&L) | Not read for FY2024 | Left blank rather than derived as a residual. |

**Material cost and the FY2024 profit-and-loss column.** The FY2024 cost lines were read from the FY2024-25 report's
comparative column; the materials line for that year was not, so the cell is blank and the derivation set leaves it alone.
Nothing was back-solved from total expenses.

## 6. Extraction inventory and how it verifies

`ingest-input/periods.csv` carries **3 rows × 37 reported line items**, `issues.json` is `[]`, and each period also
carries **6 derived items** computed by the governed derivation set (`in-fin/1.0.0`).

`ingest-input/data-extraction.json` records, for every ingested figure: the field, the printed label, the value, the
citation (document, PDF page, printed pages, and whether the column read is the current or the comparative one), the
printed form, and whether the row is `REPORTED` or `DERIVED`. For the derived rows it states the arithmetic and each
printed component. The checks that were run:

- **Printed-form check.** Every `REPORTED` value's printed form (with thousands separators and brackets for negatives,
  e.g. `(414.12)`) was matched against the text of its own cited page. 34 of 34 items verified on first pass except the
  two FY2024 current-maturity rows, which are *derived* and are recorded as such (the FY2024-25 note prints `108.33` and
  `200.00` as separate lines, not `308.33`).
- **Reconciliation check.** `4,206.26 + 235.60 = 4,441.86` (balance-sheet current borrowings) and
  `2,638.96 + 1,122.54 + 444.76 + 235.60 = 4,441.86` (Note 30 total). FY2024: `1,625.14 + 1,618.80 + 308.33 = 3,552.27`.
- **Cash-flow check.** The three sections were agreed line by line against the printed statement, including the
  issuer's own financing reconciliation (PDF p.119): borrowings `3,701.10 → 5,113.14`, leases `256.38 → 274.53`. The
  note's borrowings closing figure differs from the balance-sheet sum (`5,103.23`) by `9.91`, which the note does not
  explain; the reconciliation is therefore cited as a **cross-check for leases only** and not as the source of borrowings.
  The difference is recorded in `data-extraction.json` rather than smoothed away.

## 7. Dataset quality

| Measure | Value |
|---|---|
| datasetVersion | `sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab` |
| Periods / periods with issues | 3 / 0 (`issues.json` `[]`) |
| Statement coverage (Industrials) | **100 %** (3 of 3 periods carry all three statements) |
| Adequacy | `SUFFICIENT`, required-field coverage **100 %**, `missingFields` `[]` |
| Statement coverage inside the assessment | balance sheet 80.95 %, cash flow 88.89 %, profit and loss 68.18 % (of the adequacy frame's fields) |
| Operating-metric coverage (Industrials) | **0 %** — the one declared metric, `IN_BOOK_TO_BILL`, is not printed |
| Sector stage | **`G2_PARTIAL`** (2 methods usable, 1 withheld) |

**The operating metric, explicitly.** The FY2025-26 report prints order intake **₹25,280 crore** and an order book of
**₹36,267 crore** (PDF p.6, printed 8-9; MD&A PDF p.28, printed 52-53). It prints **no book-to-bill ratio** and **no
prior-year order intake**, so `IN_BOOK_TO_BILL` cannot be taken from the page and is not derived by division: D-2 forbids
arithmetic invention of a metric, and one year's intake is not a ratio. The metric is recorded unavailable with its
reason, which is what withholds `EV_REVENUE`.

## 8. Sector eligibility and method availability

Industrials declares three methods and no `PE_RELATIVE`:

| Method | Role | Declaration | Outcome in this run |
|---|---|---|---|
| `DCF_FCFF` | PRIMARY | no mandatory metric | **AVAILABLE** — ran; blocked at the per-share leg (see §10) |
| `EV_EBITDA` | SECONDARY | no mandatory metric | **AVAILABLE** as a declaration; not applicable in the run: `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable` |
| `EV_REVENUE` | CROSS_CHECK | mandatory `IN_BOOK_TO_BILL` | **WITHHELD**: `MANDATORY_METRIC_MISSING: IN_BOOK_TO_BILL` |

The P/E request in the work item's brief is **unsatisfiable by matrix design**: Industrials has no `PE_RELATIVE` method,
so no P/E band can be produced for this issuer without changing valuation policy, which this work item does not do. (The
Consumer run in WI-7 could publish a P/E band because Consumer declares that method; the difference is policy, not
coverage.)

`G2_PARTIAL` is a stage the programme has not recorded before: it means the sector has a measured issuer whose statement
coverage is complete while at least one of its declared methods is withheld for a missing metric. It is not
`G1_ENABLED` (WI-7's Consumer stage, all methods available) and not `UNMEASURED`.

## 9. The financial assessment

- **Adequacy** `SUFFICIENT`; **quality verdict** `MATERIAL_CONCERNS`, with two HIGH flags:
  `CASH_FLOW_EARNINGS_DIVERGENCE` ("operating cash flow is −68 % of attributable profit") and `STALE_STATEMENTS`
  ("the latest period end is beyond the freshness policy window"). Both are the issuer's facts, not pipeline artefacts:
  FY2026 operating cash flow is **−₹414.12 crore** against ₹605.59 crore of profit, and the newest audited period end
  (2026-03-31) is 221 days before the run clock.
- **Risk evaluation** — `PARTIAL`: 4 applicable dimensions, 3 evaluated (1 passed, 2 concerns), 1 `NOT_EVALUABLE`.
  `CAPITAL_ALLOCATION_CAPEX_INTENSITY` **PASSED** (capex 1 % of revenue, ceiling 20 %); `EARNINGS_QUALITY_CASH_CONVERSION`
  **CONCERN** (−68 %); `CYCLICALITY` **CONCERN** (Industrials demand is cyclical, so one year's margin is not a
  sustainable base); `REGULATORY_FRAMEWORK` `NOT_APPLICABLE`; `FINANCIAL_LEVERAGE` **`NOT_EVALUABLE`** because
  `capitalStructure.netDebt` is `NOT_REPORTED` — a downstream consequence of §10, recorded as such.
- **Moat** `INSUFFICIENT_EVIDENCE`: EBITDA-margin stability 7.02 % against a 15 % threshold, ROIC–WACC spread positive
  in 0 consecutive years.
- **Dividends** — 3 consecutive years paid, payout ratio 0.2417, FCF coverage **−5.07** (negative free cash flow, so cash
  does not cover the dividend in the newest year), `netDebtToEbitda` `NOT_COMPUTABLE` for the same reason as above.
  The dividend reconciliation is `NOT_COMPARABLE`: schema V1 carries no dividend-declaration record, so R-15
  corroboration is unavailable — the payload states this in its own limitation list, and no register entry is created
  for it here because it is a known schema bound rather than new evidence.

## 10. The debt and equity bridge: ₹5,377.76 crore of gross debt, and a refusal on the cash side

| Component | Value (₹ crore) | Presence |
|---|---|---|
| `shortTermBorrowings` | 4,206.26 | `PRESENT` |
| `currentMaturities` | 235.60 | `PRESENT` |
| `longTermBorrowings` | 661.37 | `PRESENT` |
| `leaseLiabilities` | 274.53 | `PRESENT` |
| **`grossDebt`** | **5,377.76** | **`PRESENT`** |
| `cashAndCashEquivalents` | 411.26 | `PRESENT` |
| `currentInvestments` | — | **`MISSING: NOT_REPORTED`** |
| **`cashAndInvestments`** | **—** | **`MISSING: NOT_REPORTED`** |
| **`netDebt`** | **—** | **`MISSING: NOT_REPORTED`** |
| `minorityInterest` / `preferenceCapital` | — | `MISSING: NOT_REPORTED` |
| `associatesAndJV` | — | `NOT_COMPUTABLE: NOT_REPORTED` (schema V1, `L-036`) |

This is the first run in the programme whose **gross debt resolves** on a real filing: WI-7's Consumer issuer left the
current-maturity component empty and gross debt was `MISSING` (`L-038`). KEC's Note 30 prints the current maturities, so
the debt side of `L-038` is satisfied while the **cash side** of the same bridge is not: `cashAndInvestments` is
`sum([cash, currentInvestments])` and a balance sheet need not print a current-investments line at all. This is a new,
distinct limitation (`L-039` in the register), and it is the binding constraint on this issuer's valuation.

## 11. Valuation: an enterprise value, no per-share value, no margin of safety

- **`intrinsic` is `null`.** `DCF_FCFF` is applicable and ran: FCFF base **₹918.42 crore**, WACC **10.68 %**
  (policy default: risk-free 6.9 %, ERP 5.5 %, beta 1.0, post-tax cost of debt 6.66 %, 70/30 weights), terminal growth
  **4.00 %**, horizon 5 years. Every per-share leg is `NOT_COMPUTABLE` with the note *"enterprise-to-equity conversion
  blocked by netDebt"*.
- **`EV_EBITDA`** is not applicable: `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable`.
- **`EV_REVENUE`** is not applicable: `MANDATORY_METRIC_MISSING: IN_BOOK_TO_BILL`.
- **Margin of safety** refuses with `NO_PRICE_OBSERVATION`: the dataset carries no price observation, so there is no
  price to compare against, and none was obtained or invented. `mosVsLow`, `mosVsMid` and the band are all
  `NOT_COMPUTABLE: POLICY_INPUTS_UNAVAILABLE`.
- **Confidence 0.3199** = `0.6 × 0.70 + 0.4 × 0.0833`, then `×0.9` (`STALE_DATA`) `×0.98` (`DILUTION_PROXY`) `×0.8`
  (R-4.3 policy-default-WACC penalty, applied once). Caps: `STALE_DATA`, `DILUTION_PROXY`, `POLICY_DEFAULT_WACC`.

**Two payload behaviours this run exposes, recorded and not fixed.** Neither is repaired here — WI-8 changes no policy, no
validator and no payload grammar — but both are published because a reader of this artifact would otherwise be misled:

1. **The sensitivity grid publishes per-share numbers the headline refuses.** `buildSensitivity` computes
   `(EV − (netDebt ?? 0) − (minorityInterest ?? 0) − (preferenceCapital ?? 0) + (associatesAndJV ?? 0)) / shares`
   (`iips-platform/src/investment/assessment/intrinsic.ts`). On this issuer every one of those terms is unavailable, so
   each `??` substitutes **zero**: the grid's base point therefore reads **₹488.34 per share**, which is enterprise value
   divided by diluted shares with net debt treated as nil. That number is **not** an intrinsic value, is **not** used
   anywhere in this work item's conclusions, and is precisely the "zero in place of NOT_REPORTED" that D-2 forbids one
   level up. Register `L-040` is OPEN.
2. **The evidence claim outruns the output.** Evidence `EV-DCF_FCFF` states *"DCF_FCFF produced a per-share value from 3
   present input(s)"* and declares it `supports: valuation.methods[0].output.perShareMid`, while `perShareMid` is
   `NOT_COMPUTABLE`. The claim is the same class of overstatement as (1) and is recorded with it under `L-040`.

Because of (1), the sensitivity values in `artifact/assessment-payload-kec-wi8.json` must be read as *arithmetic
evidence about the DCF formula*, not as valuations of this issuer.

## 12. Persistence and separate-process readback

| Item | Value |
|---|---|
| scope | `co:IN:CIN:L45200MH2005PLC152061` |
| reportKey | `15b68ca53f900918b1953f53119ac90f1b9ec4b30fc325a4b4d259b71991712e` |
| reportId (chain root, head v1) | `85809cbd-895e-4c9e-b2fc-580fc53fb1c2` |
| inputDigest | `sha256:513993f2eb1de1ab2bf67d17a8e96fc062a971f484d594f4fab54a4e29cdf22b` |
| payloadDigest | `sha256:4f89f0ec514890f30bce1960d4a9e8302fad9ddfeb28c13bbc4f22b59072e351` |
| datasetVersion | `sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab` |
| chain | valid, 1 version, head v1 |
| idempotency | a second generate run reported `compare: content and input identical` → `persist: UNCHANGED (no write)` |
| readback | separate process, `readVersionWithPayload` → recomputed `sha256:4f89f0ec…e351` **equals** the stored digest and the chain head; payload 52,357 bytes |

`runs/03-chain-read.txt` is the governed `show-investment-chain` CLI reading the same chain in a third process; it
reports the same reportId, digests and counts.

## 13. Limitations raised, and the ones that stay open

| Entry | Status | What this run adds |
|---|---|---|
| `L-038` (bridge needs borrowing components a balance sheet need not print) | stays **OPEN** | The *debt* half did not bite here — Note 30 printed the current maturities — so gross debt resolved. The entry stays open for issuers that print a single `Borrowings` line. |
| **`L-039` (new)** — the bridge's *cash* half requires a `CURRENT_INVESTMENTS` line | **OPEN** | A fully read, fully audited consolidated balance sheet with no current-investments line yields no `netDebt`, hence no enterprise-to-equity conversion, no enterprise-derived per-share value, no leverage risk dimension, and no `netDebtToEbitda`. |
| **`L-040` (new)** — the sensitivity grid and the `EV-DCF_FCFF` evidence claim substitute zero for unavailable bridge terms | **OPEN** | The grid publishes ₹488.34 per share while the headline refuses; the evidence claims a per-share value that does not exist. |
| `L-036` associates/JV policy zero | stays `PARTIALLY RESOLVED` | `REVIEW_DUE` fires again (clock 2026-03-31, due 2026-09-27); no filing figure exists. |
| `L-035`, `L-037`, others | unchanged | Nothing in this run tests them. |

## 14. Reproduction

```bash
# 1 — the two source PDFs (bytes and hashes as in §2)
curl -sSLO https://www.kecrpg.com/public/media/annualReportMedia/KEC_Annual_Report_2025-26.pdf
curl -sSLO https://www.kecrpg.com/public/media/annualReportMedia/KEC_Annual_Report_2024-25.pdf
sha256sum KEC_Annual_Report_2025-26.pdf KEC_Annual_Report_2024-25.pdf

# 2 — the cited pages, verbatim
pdftotext -layout -f 107 -l 107 KEC_Annual_Report_2025-26.pdf …   # and the other pages in source/page-map.json

# 3 — ingest, generate, read back (see runs/commands.txt for the full block)
cd iips-platform && npm ci --no-audit --no-fund --strict-ssl=false
npx tsx src/investment/cli/ingest.ts --input ../evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input \
  --dataset-dir /tmp/wi8/data/investment/dataset --now 2026-11-07T08:30:00.000Z

cd ../frontend && npm ci --no-audit --no-fund --strict-ssl=false
IIPS_NP04_DATABASE_PATH=/tmp/wi8/data/investment/investment.db \
  npx tsx server/investment/cli/generate-investment-artifacts.ts \
  --issuer IN:CIN:L45200MH2005PLC152061 --data-dir /tmp/wi8/data/investment/dataset \
  --identity-dir /tmp/wi8/data/investment/identity --db /tmp/wi8/data/investment/investment.db \
  --owner-carrier /tmp/wi8/owner.json --generated-at 2026-11-07T08:30:00.000Z --out runs/cli-wi8.json
```

The ingest is deterministic given `--now`: re-running it over the same input reproduces
`sha256:0df73ead…82ab`, and the generate step over that dataset reproduces reportKey `15b68ca5…`, the same
payloadDigest `4f89f0ec…` and the same inputDigest `sha256:513993f2…`. A clean clone of the branch reproduces the same digests
(`runs/07-clean-clone.txt`).

## 15. Verification recorded in this bundle

| File | What it records |
|---|---|
| `runs/01-ingest.txt` | ingest → datasetVersion, Industrials `G2_PARTIAL` (usable 2, withheld 1, statement coverage 100 %, metric 0 %) |
| `runs/02-generate.txt` | snapshot → identity → assessment → compose → validate → chain-head → persist → verify, all `OK` |
| `runs/03-generate-again.txt` | second run: `compare: content and input identical`, `persist: UNCHANGED (no write)` |
| `runs/03-chain-read.txt` | governed `show-investment-chain` CLI, separate process, same digests |
| `runs/readback.json`, `runs/readback-stdout.txt` | separate-process payload readback: digest recomputed = stored = chain head |
| `runs/04-payload-findings.json` | the capital-structure, method, quality, risk, dividend and evidence blocks quoted in §9–§11 |
| `runs/cli-wi8.json`, `runs/cli-wi8-unchanged.json` | the generator's own JSON output for the creating and the idempotent run |
| `runs/05-guard-test.txt` | targeted guard test `wi8IndustrialsKec.test.ts` |
| `runs/06-typecheck.txt` | `tsc --noEmit` over the platform project |
| `runs/07-clean-clone.txt` | clean clone of the branch, ingest re-run, digests compared |
| `runs/08-ci-check.txt` | what the configured CI actually reported, quoted from the run — no claim beyond it |
| `digests.json` | sha256 + byte length of every file in this bundle |

## 16. Hygiene

The retrieval and page-hunting scratch directories (`evidence/real-issuer/_wi8-discovery/`, `_wi8-fulltext/`,
`_wi8-cols/`, `_wi8-identity/`) and the temporary GitHub Actions workflow that fetched the PDFs and probed the exchanges
(`.github/workflows/temp-wi8-discover.yml`) were **deleted before the pull request**; nothing temporary remains in the
tree. The temporary readback harness lived in `frontend/.tmp-wi8-readback.ts`, outside the build, and was deleted after
`runs/readback.json` was written. No validator, policy parameter, persistence mechanism, curator rule or historical
bundle was modified: the WI-3, WI-5, WI-6A, WI-6A-S1, WI-6A-S2 and WI-7 bundles are byte-identical to `main` and their
guard tests still pass.
