# WI-3 — Borrowings declared nil: the evidence that unblocks gross debt, net debt and the intrinsic chain (2026-11-06)

**Issuer:** Infosys Limited · CIN `L85110KA1981PLC013115` · ISIN `INE009A01021`.
**Baseline:** the Work Item 2 payload `06be8f66…` on branch `arena/e62e22d2-iips-review-recovered`.
**Question:** Work Item 2 left `intrinsic` and the margin of safety withheld with `INTRINSIC_WITHHELD`, because gross
and net debt were `NOT_REPORTED`. Does primary evidence support gross debt, net debt and the intrinsic chain?

**Answer in one sentence:** yes — the FY2024 consolidated statements state that the Group has no outstanding
borrowings and that the Company has only one class of shares, and those statements are declared as four
`NIL_BY_DISCLOSURE` observations, so net debt resolves to a **net-cash position of −₹19,342 crore**, every weighted
valuation method produces a per-share value, and the **intrinsic range and the margin of safety are now computed**
(₹875.34 / ₹1,088.97 / ₹1,399.81 against ₹1,180.65, band `FAIR`).

| Question | Work Item 2 | Now |
|---|---|---|
| Price accepted? | yes (₹1,180.65, 2026-11-06) | **yes — unchanged, same record** |
| Gross / net debt published? | no (`NOT_REPORTED`) | **yes** — ₹8,359 crore / **−₹19,342 crore** |
| Intrinsic computable? | no (`null`) | **yes** — ₹875.34 / ₹1,088.97 / ₹1,399.81 per share |
| Margin of safety computable? | no (`INTRINSIC_WITHHELD`) | **yes** — −8.42 % vs mid, band `FAIR`, `refusal: null` |
| Verdict published? | no | **no — decision support only; `disclosure.noTradeExecution: true`** |

---

## 1. The four components, individually

The capital-structure block sums four debt components and needs all four at one balance-sheet instant. Work Item 2 had
three of them `NOT_REPORTED`, and a fourth claim (`PREFERENCE_CAPITAL`) that blocks the enterprise-to-equity bridge even
when net debt resolves. All four are declared here, from two sentences in the same audited document.

| # | Component | Reported value & currency | Period / statement date | Source & locator | Direct or derived | Acceptance |
|---|---|---|---|---|---|---|
| 1 | `LONG_TERM_BORROWINGS` | **nil** — no amount; statement currency INR | FY2024, balance sheet 2024-03-31, statements dated 2024-04-18 | Note 2.11 *Financial instruments* → *Financial risk management* → *Liquidity risk*: “The Group has no outstanding borrowings.” | direct group-level statement; applied per component by mapping | `NIL_BY_DISCLOSURE` / `DECLARED_NIL_IN_SOURCE` |
| 2 | `SHORT_TERM_BORROWINGS` | **nil** — no amount | same | same sentence | same | `NIL_BY_DISCLOSURE` |
| 3 | `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | **nil** — no amount | same | same sentence (a maturity is a slice of a long-term borrowing; none is outstanding) | same | `NIL_BY_DISCLOSURE` |
| 4 | `PREFERENCE_CAPITAL` | **nil** — no amount | same | Note 2.12 *Equity* → *Equity share capital*: “The Company has only one class of shares referred to as equity shares having a par value of ₹5/-.” | direct share-class statement (parent); applied to the consolidated block by mapping, disclosed in §2 | `NIL_BY_DISCLOSURE` |

Corroboration in the same document, for the same date: *“As of March 31, 2024, the Company has only one class of
equity shares and has no debt.”* (Note 2.12, capital management). The audited balance sheet itself carries no
borrowings line, and the contractual-maturity table in Note 2.11 lists only trade payables and other financial
liabilities — no borrowing maturity.

Nothing is estimated, interpolated or borrowed from another issuer. A component with no statement behind it would have
stayed `NOT_REPORTED`; the four that are declared each carry the filer's own words in the payload
(`components[*].note`), the filing reference (`INFY-INDAS-CONSOL-FY24`) and the period end (`2024-03-31`).

**The two scope nuances, stated rather than buried.**

1. *Group vs Company.* The borrowings sentence is a **Group** statement inside the consolidated notes. The share-class
   sentence speaks of “the Company” (the parent). It is applied to the consolidated block because consolidated owners'
   equity contains only equity share capital (₹2,071 crore) and other equity (₹86,045 crore), with non-controlling
   interests (₹345 crore) presented separately, and the authorised capital is equity shares only.
2. *Nil ≠ zero.* A declared nil is not a reported zero: `value` is `null`, `presence` is `NIL_BY_DISCLOSURE`, and the
   gross-debt note names the three components the filer declared nil. The aggregation contract still refuses a
   `MISSING` or `NOT_COMPUTABLE` component — the WI-3 test keeps the Work Item 1 dataset (no declarations) at
   `NOT_REPORTED` to prove that.

## 2. Evidence, provenance and integrity

| Field | Value |
|---|---|
| Document | Infosys Limited and Subsidiaries — Consolidated Financial Statements under Ind AS for the year ended March 31, 2024 |
| URL | `https://www.infosys.com/investors/reports-filings/quarterly-results/2023-2024/q4/documents/consolidated/consol-fy24-annual-finstatement.pdf` |
| Auditor | Deloitte Haskins & Sells LLP, Chartered Accountants (FRN 117366W/W-100018) |
| Publication / availability | statements signed and dated **2024-04-18**; Q4/FY24 results announced that day |
| Retrieval | 2026-11-06, bounded by ordering rather than by a clock reading: after the Work Item 2 price retrieval closed (`2026-11-06T13:44:25Z`) and before the ingest at `2026-11-06T14:05:00.000Z`. The fetch tool stamps no per-request time, so a bound the bundle can defend is recorded instead of an invented instant |
| Locator granularity | the PDF parser emits transport chunks, not printed page numbers: each quote is anchored by **note + section + chunk index** (2.11 → chunk 13 of 17; 2.12 → chunk 14; 2.9 → chunk 9), and the document's own index places Notes 2.11 and 2.12 at pages 20–26 and 26–31 |
| Raw extracts | `source/consol-fy24-note-2.11-liquidity-risk.txt`, `...-2.12-equity-share-capital.txt`, `...-2.9-cash-restricted.txt` |
| Machine-readable provenance | `source/quotes.json` — per-component value/nature/period/date/locator/direct-or-derived/validation, plus `sha256` of each quoted sentence and of each extract file |
| Quote digests | “The Group has no outstanding borrowings.” and the share-class sentence are each hashed verbatim in `source/quotes.json`; the extracts are hashed in `digests.json` |
| Dataset identity | `sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847` (was `sha256:0ef4299d…`) |
| Payload identity | `83644bc68e3d68f3f714fb205179eae63c6da2ff9d5cdcf77d0a3d5c573d493d` (was `06be8f66…`), 51,196 B |

## 3. How the declarations enter the pipeline

`ingest-input/periods.csv` is the Work Item 1 file with four columns appended. The 2024-03-31 CONSOLIDATED row carries
`NIL: <the filer's sentence>` in each new cell; the FY23 and FY22 rows carry nothing, so older periods stay
`NOT_REPORTED` and the newest period is the one that resolves. The ingester's guards are not bypassed:

- a bare `NIL` (no wording) → `NIL_WITHOUT_QUOTED_WORDING`, and the cell degrades to `MISSING`, never to zero;
- a nil with no `filing_ref` → `NIL_WITHOUT_PROVENANCE`;
- a nil on a derived item → `NIL_ON_DERIVED_ITEM`;
- a nil and a number for the same item/period → `CONFLICTING_OBSERVATION`.

The WI-3 test exercises the first of these against a mutated copy of the committed CSV, so the declaration path cannot
become a back door for a zero.

## 4. What resolves

| Output | Before | Now | Where it comes from |
|---|---|---|---|
| `grossDebt` | `MISSING / NOT_REPORTED` | **₹8,359 crore** (`PRESENT`) | three nils (counted as zero, named in the note) + Ind AS 116 lease liabilities ₹8,359 crore at 2024-03-31 |
| `cashAndInvestments` | ₹27,701 crore | unchanged | cash ₹14,786 crore + current investments ₹12,915 crore |
| `netDebt` | `MISSING / NOT_REPORTED` | **−₹19,342 crore** (`PRESENT`) | gross debt − cash and liquid investments = **net cash**, ₹46.66 per share |
| `preferenceCapital` | `MISSING / NOT_REPORTED` | `NIL_BY_DISCLOSURE` | the single-share-class statement |
| enterprise → equity bridge | blocked | **open** | net debt present, NCI ₹345 crore present, preference nil; associates/JV enter as a policy zero that the payload does **not** state — see caveat 7 |
| `DCF_FCFF` | applicable, no output | **₹990.75** mid (low 798.01, high 1,345.50) | EV = 5-year FCFF DCF at WACC 10.678 % (policy default), g 4 %; base FCFF ₹26,849 crore |
| `EV_EBITDA` | `applicable: false` | **₹1,133.95** mid (12× mid-cycle EBITDA of ₹37,584 crore) | needed net debt for the equity bridge |
| `PE_RELATIVE` | ₹1,270.43 | unchanged ₹1,270.43 (22× normalised EPS ₹57.75) | unaffected |
| `EV_REVENUE` | not applicable | **still not applicable** | unchanged rule |
| `intrinsic` | `null` | **₹875.34 / ₹1,088.97 / ₹1,399.81**, spread 48.16 % | INV-5 blend: DCF 0.60, EV_EBITDA 0.10, PE 0.30 — every weighted method has an output, which is the exact condition that was missing |
| `marginOfSafety` | `INTRINSIC_WITHHELD` | **`refusal: null`**, −8.42 % vs mid, −34.88 % vs low, band `FAIR` | `(mid − price) / mid` against the Work Item 2 close ₹1,180.65 |

Three outputs that were blocked on the same missing input also resolve, by the published rules rather than by any
change of policy: the **leverage risk dimension** (`net debt / EBITDA = −0.47×`, `PASSED`), the **dividend coverage
verdict** (`INSUFFICIENT_EVIDENCE` → `COVERED`), and the **moat classification** (`INSUFFICIENT_EVIDENCE` → `NARROW`,
ROIC − WACC spread 28.79 % for three consecutive years). Confidence moves `0.4939 → 0.6736` (`modelConfidence`
0.125 → 0.6342; `dataConfidence` 0.85 unchanged; the caps `STALE_DATA` and `DILUTION_PROXY` still apply).

## 5. What this change does **not** do

- **No policy, formula, threshold, weight, confidence cap or schema change.** `valuation-policy/1.0.0`,
  `mos-policy/1.0.0`, `risk-taxonomy/1.1.0` and the derivation set are untouched; the dataset schema is the same one
  the ngil grammar already had.
- **No nil invented.** Every declaration quotes the filer; a component without a quote stayed `NOT_REPORTED`
  (Work Item 1 and 2 datasets are unchanged and still refuse).
- **No verdict.** The payload publishes `disclosure.decisionSupportOnly: true` and `noTradeExecution: true`. A band
  (`FAIR`) is a distance from a midpoint, not a recommendation, and the symmetric reference is published with it.
- **No price change.** The observation is still the Work Item 2 BSE close; the MoS arithmetic is verifiable from the
  two published numbers and `mos/1.0.0`.

## 6. Remaining blockers and caveats — the ones that still matter

The intrinsic and the margin of safety are computable. That is not the same as unqualified, and these are the
qualifications a reader must carry:

| # | Caveat | Size / effect | Register |
|---|---|---|---|
| 1 | **Corporate-action continuity is unverified.** The dataset's corporate-action table is empty, so the engine cannot test whether any per-share-affecting action lies between 2024-03-31 (the statements' share base) and 2026-11-06 (the price). The margin of safety is now *published* on that unverified continuity, where before it was withheld. | not quantified — needs an action feed; no split/bonus is recorded or claimed here | **`L-031` — now material, still `OPEN`** |
| 2 | **Restricted cash cannot be separated.** The filed cash line (₹14,786 crore) includes ₹348 crore the filing calls restricted (Note 2.9), and schema v1 has no such line item, so net cash is overstated by that amount. | ₹348 crore = **₹8.40/share = 0.77 % of intrinsic mid** | `L-006 — OPEN` |
| 3 | **Diluted share count is an EPS-implied proxy** (4,144,888,608 shares); ESOP/convertible detail is not in schema v1. | `DILUTION_PROXY` cap applied (0.98) | `L-007 — OPEN` |
| 4 | **The statements are 950 days old** at the run date; the valuation is a FY2024 valuation against a 2026 price. | `staleBeyondPolicy: true`, `STALE_DATA` cap (0.9) | freshness policy — unchanged |
| 5 | **The price is a single-exchange observation** with no second feed (Work Item 2). | BSE only; NSE unreachable | `L-030 — OPEN` |
| 6 | **The discount rate is a policy default** (₹ Rf 6.9 %, ERP 5.5 %, β 1.0, 70/30 weights → 10.678 %), not an issuer-specific WACC. | published in `assumptions.discountRate` with components | valuation policy — unchanged |
| 7 | **Associates/JV enter the enterprise-to-equity bridge as a policy zero, and the payload does not say so.** `equityValueFromEnterprise` adds `associatesAndJV` at carrying value; schema v1 has no such line item, so the function's own code comment calls it "a declared policy zero … disclosed", and it builds that disclosure note — but the note is attached to the intermediate equity observation, which `perShare()` replaces, so the composed payload carries no such sentence. What the payload does publish is `associatesAndJV: NOT_COMPUTABLE / NOT_REPORTED`; nothing states that the bridge substituted zero for it. | **unquantified here**: obtaining a carrying value needs the non-current investment schedule, which schema v1 has no field for | **`L-036` — OPEN** |
| 8 | **Dividend reconciliation is `NOT_COMPARABLE`** — no declaration record in schema v1 — so the `COVERED` verdict rests on the cash-flow figure alone. | verdict published with the reconciliation status beside it | as published |
| 9 | Buyback activity (₹9,300 crore, completed February 2023) changed the share count before the statement date, not after it; the FY24 count is the filed, post-buyback count. | — | as filed |

## 7. L-031 and L-033 — relevance to this work item, established and not changed

- **`L-031` (empty corporate-action table): now directly material.** While the margin of safety was withheld the empty
  table cost nothing; now that a number is published, it rests on share-base continuity from FY2024 to 2026-11-06 that
  nothing in the dataset verifies. The declaration does not change: `adjustment` stays `null`, no action is invented,
  and the limitation stays `OPEN`. Closing it needs a corporate-action feed plus the acceptance test that today only
  synthetic fixtures exercise.
- **`L-033` (5 trading days in the design vs 7 calendar days in `policy.ts`): does not affect this work item.** The
  price is 0 days old at the run instant, so it is inside both readings; no refusal boundary is near. The divergence
  is recorded, unchanged, and still a policy decision for a later item.
- Neither policy was edited. `mos-policy/1.0.0` and `freshness.priceMaxAgeDays` are exactly as they were.

## 8. Verification

| Check | Result |
|---|---|
| `npx tsx --test assessment-{capital,valuation,dividends,moat,price}.test.ts` (platform) | **47 passed**, 0 failed |
| `npx vitest run server/investment/cli/wi3BorrowingsNil.test.ts` (new) | **10 passed** — nil-not-zero, bare-`NIL` refusal, committed-cell-to-quote identity (hash for hash), the retrieval bound, gross/net debt, INV-5 blend, MoS arithmetic, "evidence is the difference", no verdict |
| Work Item 2 price test + real-issuer + artifact-CLI regressions | **6 + 14 passed** |
| `npx tsc --noEmit` (platform) · `npm run typecheck:investment-server` (frontend) | clean |
| ingest | `issues.json = []`, `coverage.prices = 1`, three annual periods unchanged |
| payload re-read through the service | `sha256` = chain head `83644bc68e3d…` |
| determinism | identical run into a second empty store: identical steps and digests |
| independent clean clone of the published branch | `git clone` of `90cd713…`, all 29 pinned files match `digests.json`, fresh ingest reproduces `21cf2522…` with `issues: []`, the CLI reproduces **payloadDigest `83644bc6…`**, and the WI-3 test passes 8/8 from the clone (`runs/07-clean-clone.txt`) |
| structural diff vs Work Item 2 | **96 paths, all attributed** (46 DEBT_DECLARATION, 15 VALUATION_UNBLOCKED, 9 MOAT_UNBLOCKED, 8 RISK_EVALUATION_UNBLOCKED, 7 DIVIDEND_COVERAGE_UNBLOCKED, 3 NARRATIVE, 3 RUN_CLOCK, 2 CONFIDENCE, 2 DATASET_IDENTITY, 1 DERIVED_SERIES), none unattributed |

Reproduction: `runs/commands.txt` (§1–§8). Re-running §2 and §4 must reproduce `21cf2522…` and `83644bc6…`.
`payloadDigest` is content-derived and reproduces exactly; **`reportId` is a UUID minted per persist** and differs on
every write (published `29658038…`, in-tree replay `6b2a5a1a…`, clean clone `a780a5f4…`) — it identifies a version,
it is not a hash, and nothing here compares it.

## 9. File inventory

| Path | What it is |
|---|---|
| `ingest-input/periods.csv` | the Work Item 1 statements with the four `NIL:` cells on the 2024-03-31 row |
| `ingest-input/roster.json`, `ingest-input/prices.json`, `identity/` | byte-identical to the earlier bundles (the price is the Work Item 2 record) |
| `source/*.txt`, `source/quotes.json` | the quoted statement text, the locators, and the per-component provenance record |
| `dataset/` | the dataset the run consumed (10 files, `manifest.json` → `21cf2522…`) |
| `artifact/assessment-payload-wi3.json` | the full assessment payload, hash-verified against the chain head |
| `artifact/payload-diff-vs-wi2.json` | the 96-path diff with attribution and the headline numbers |
| `runs/` | ingest + generate stdout, the CLI summary and its replay, the verification log, the payload check, and `commands.txt` |
| `digests.json` | `sha256` and size of every committed file in this bundle |
