# REL-1 — Real-issuer validation: Infosys Limited (Work Item 1, IIPS v3.0)

**Disposition: VALIDATED WITH QUALIFICATIONS.**

The path from a filed, audited Indian annual report to a persisted, versioned, re-readable investment artifact was
executed end to end on one real issuer, using primary exchange/issuer disclosures only, with zero ingestion errors,
byte-verified digests and an independent chain read in a separate process. The engine's *judgement* pieces did not all
run: valuation, margin of safety, moat classification and the risk aggregate were withheld, each with a specific,
checkable reason. Two of those reasons are product defects rather than data problems, and both are recorded here
rather than worked around.

**No investment conclusion is stated in this bundle, and none should be read out of it.** The engine produced no
intrinsic value, no margin of safety and no moat classification for this issuer. This document does not state what
Infosys shares are worth, whether they are cheap or expensive, or whether anyone should own them. It reports what the
product did with real disclosures and where it stopped.

---

## 1. Issuer and why this one

| Field | Value |
| --- | --- |
| Legal name | Infosys Limited |
| Issuer id | `IN:CIN:L85110KA1981PLC013115` |
| CIN | `L85110KA1981PLC013115` |
| ISIN | `INE009A01021` |
| Listings | `IN:NSE:INFY:EQ:EQUITY`, `IN:BSE:500209:EQ:EQUITY` |
| Sector (canonical) | `Technology` |
| Fiscal year end | 03-31 |
| Reporting currency | INR |

Selection against the criteria fixed before the work started:

- **Audited annual reports, official exchange-filed disclosures.** The consolidated Ind AS financial statements for
  FY2023-24 and FY2022-23 are the issuer's own published results filings, each including the statutory auditor's
  report (Deloitte Haskins & Sells LLP, FRN 117366W/W-100018) and the board signatures. Nothing here comes from an
  aggregator, a broker note or a third-party estimates service.
- **Already-measured sector.** `Technology` is one of the three sectors the product had already measured (`L-001` is
  unchanged at 3 of 13). Choosing a measured sector keeps *real-data validation* from being contaminated by *sector
  expansion*, which this work item explicitly excludes.
- **Sufficient history for the derivations that exist.** Three annual periods is the minimum the DCF requires
  (≥ 3 EBIT / D&A / capex observations). FY2022 comes from the FY2022-23 filing's comparative column, which is the
  filed presentation of that year — not a reconstruction.
- **Fields the existing mappings and derivations ask for.** The issuer's Schedule III presentation carries 33 of the
  52 closed line items, which is enough to exercise identity, ingestion, mapping, the derivation set and the whole
  assessment pipeline.
- **Reproducible source and extraction.** Public PDFs at stable URLs; every figure below is transcribed from the page
  printed in the filing, and the transcription is committed as `ingest-input/periods.csv` so that any reader can
  check a number against the source page instead of trusting this document.

---

## 2. Sources and periods

| Period (fiscal year) | Period end | Filing ref | Filed on | Figures taken from |
| --- | --- | --- | --- | --- |
| FY2024 | 2024-03-31 | `INFY-INDAS-CONSOL-FY24` | 2024-04-18 | `consol-fy24-annual-finstatement.pdf` — balance sheet p.1, P&L p.2, cash flow p.5 |
| FY2023 | 2023-03-31 | `INFY-INDAS-CONSOL-FY23` | 2023-04-13 | `consol-fy23-annual-finstatement.pdf` — balance sheet p.1, P&L p.2, cash flow p.5 |
| FY2022 | 2022-03-31 | `INFY-INDAS-CONSOL-FY23` | 2023-04-13 | the **comparative column** of the FY2022-23 filing, printed p.1–p.2 |

- Statement scope: `CONSOLIDATED`. Taxonomy: `INDAS`. Basis: `AS_FILED` (no restatement, no reclassification).
- Source scale: `CRORE` as printed; the only transformation applied to a monetary figure is the declared scale
  (× 10⁷), performed by the ingestion path, not by hand.
- Headline figures as printed (₹ crore):

| | FY2024 | FY2023 | FY2022 |
| --- | --- | --- | --- |
| Revenue from operations | 153,670 | 146,767 | 121,641 |
| Profit before tax | 35,988 | 33,322 | 30,110 |
| Profit for the year | 26,248 | 24,108 | 22,146 |
| EPS basic (₹) | 63.39 | 57.63 | 52.52 |
| Total assets | 137,814 | 125,816 | 117,885 |
| Total equity | 88,461 | 75,795 | 75,736 |
| Cash and cash equivalents | 14,786 | 12,173 | 17,472 |
| Operating cash flow | 25,210 | 22,467 | 23,885 |
| Capital expenditure | 2,201 | 2,579 | 2,161 |
| Dividends paid | 14,692 | 13,631 | 12,652 |

What was **not** used: no analyst estimates, no consensus numbers, no vendor fundamentals, no price series, no
news-derived figures. Identity facts (CIN, ISIN, listings) come from the issuer's investor FAQ page and the filings'
cover pages; they are identity data, not financial data.

---

## 3. Execution: end-to-end outcome

Sequence actually run, with the observed result at each step (exact commands in `runs/commands.txt`):

| Step | Observed |
| --- | --- |
| Ingest filed disclosures (snapshot v1) | `datasetVersion sha256:9be1a83e…`, **zero** issues, 3 periods, 32 filed + 5 derived per period |
| Identity resolution | `RESOLVED via ISIN` → listing `IN:BSE:500209:EQ:EQUITY`; roster `ccabcc87…`, listing map `7b458fb9…`, corporate-action table `0b1d3cbf…` |
| Assessment | `SUFFICIENT` / `MATERIAL_CONCERNS` / confidence `0.4939` |
| Compose + validate | scope `co:IN:CIN:L85110KA1981PLC013115` (`ISSUER`), payload sealed |
| Persist | `CREATED (wrote)`, artifact v1, chain 1 version |
| Verify | `chain valid: 1 version(s), head v1` |
| Re-run, unchanged inputs | `UNCHANGED (wrote=false)` — idempotent, no new version |
| Snapshot v2 (filed lease liabilities added) | `datasetVersion sha256:ca29c835…`, still zero issues |
| Re-run on v2 | `content changed` → `APPENDED (wrote)`, artifact v2, chain 2 versions |
| Re-run on v2, identical | `content and input identical` → `UNCHANGED (no write)`, still 2 versions |
| Read back, separate process | `versionCount 2`, head `7220cfa4-…` at v2, both versions listed, `failure null` |

Two stored versions, both readable, both digest-verifiable:

| | Artifact v1 | Artifact v2 |
| --- | --- | --- |
| reportId | `9a29e7bc-33ba-4dbc-9f8e-dd989a32dfb7` | `7220cfa4-fabd-4054-9b82-f0124a6c75e3` |
| chain key (`reportKey`) | `ed1e54b03e5e…` | `ed1e54b03e5e…` (same chain) |
| payloadDigest | `610eca02a651fc04f013d92cdc14e547bec8649ae102f89386ef3b63000cb1b0` | `cc91f239197a1ed8aca52600ca25ec9c62cd78863e224756c21dfff7ba57cfcd` |
| inputDigest | `sha256:5328f326880f…` | `sha256:799b720377eb…` |
| datasetVersion | `sha256:9be1a83ef198…` | `sha256:ca29c8357fd3…` |
| payload size | 41,835 B | 42,800 B |

Both payload digests are **independently reproducible**: `sha256sum` over the committed payload files
(`artifact/assessment-payload-v1.json`, `…-v2.json`) returns exactly the chain head's digest — so the read path is
verified against bytes a reader can hash, not against a claim in this document. The store itself is not committed
(ephemeral path); its digest is recorded in `digests.json` and the store is reproducible from the committed dataset
plus the commands.

---

## 4. Mapping and derivation coverage

Measured against the product's own closed tables (52 line items, 20 XBRL tags, 8 derivations), not against an
aspiration. Per-item detail in `mapping-coverage/line-item-coverage-v{1,2}.json`.

| Bucket | Count | Meaning |
| --- | --- | --- |
| Filed, all 3 periods | **33** | transcribed from the statements and mapped to canonical ids |
| Derived only | **5** | `EBIT`, `EBITDA`, `FREE_CASH_FLOW`, `DILUTED_SHARES`, `BOOK_VALUE_PER_SHARE` — produced by the closed set, never filed |
| Not available | **14** | listed and classified in §6 |
| Total | 52 | |

XBRL tag coverage on what was actually filed: **18 of 33** filed items have a tag in the existing map (the map holds
20 tags; `BorrowingsCurrent` / `BorrowingsNoncurrent` point at items this issuer does not present). The other **15**
filed items — `TOTAL_INCOME`, `OTHER_EXPENSES`, `EQUITY_ATTRIBUTABLE_TO_OWNERS`, `NON_CONTROLLING_INTEREST`,
`CURRENT_INVESTMENTS`, `TRADE_RECEIVABLES`, `TRADE_PAYABLES`, `CAPITAL_WORK_IN_PROGRESS`, `GOODWILL`,
`INTANGIBLE_ASSETS`, `LEASE_LIABILITIES`, `INVESTING_CASH_FLOW`, `FINANCING_CASH_FLOW`, `INCOME_TAX_PAID`,
`NET_CASH_FLOW` — have no tag
and are not unmappable: the Ind AS taxonomy defines local names for them; the map simply does not carry them yet.
That is `L-002` in the field, not a new limitation. It also has a sharp consequence: `LEASE_LIABILITIES` has no tag,
so the *XBRL ingestion path* could not have populated the lease line that the CSV path now carries.

Derivations applied **unchanged** (no local edits, no re-parameterisation):

| Derivation | FY2024 | FY2023 | FY2022 |
| --- | --- | --- | --- |
| `EBIT` = PBT + finance costs | 36,458 | 33,606 | 30,310 |
| `EBITDA` = EBIT + D&A | 41,136 | 37,831 | 33,786 |
| `FREE_CASH_FLOW` = OCF − capex | 23,009 | 19,888 | 21,724 |
| `DILUTED_SHARES` (EPS-implied proxy) | 414.49 cr | 418.75 cr | 421.87 cr |
| `BOOK_VALUE_PER_SHARE` (₹) | 212.59 | 180.08 | 178.61 |
| `NET_DEBT` | **not derived** — see D-2 | | |

Every derived figure checks out against the filed arithmetic by hand: e.g. FY2024 EBITDA 36,458 + 4,678 = 41,136,
and free cash flow 25,210 − 2,201 = 23,009.

---

## 5. Assessment, valuation and risk findings

**Adequacy — `SUFFICIENT`, and the reason it is credible is that the engine also says what is thin.** Required-field
coverage 100 %, `missingFields` empty. Statement coverage is not 100 % and is published as such (snapshot v2):
P&L 68.2 %, balance sheet 71.4 %, cash flow 88.9 % — the shortfall is exactly the 14 items in §6, mostly lines this issuer does
not present.

**Quality — `MATERIAL_CONCERNS`, from one HIGH flag: `STALE_STATEMENTS`.** The latest period end is 2024-03-31 and
the run date is 2026-11-06, so the engine is being asked to assess statements more than two and a half years old and
correctly refuses to call that a clean bill of health. This is the honest result of running today's clock against
FY2022–FY2024 data; the figures were not re-dated to flatter the output.

**Confidence — `0.4939`** = 0.6 × 0.85 (data) + 0.4 × 0.125 (model), then capped by `STALE_DATA` (×0.9) and
`DILUTION_PROXY` (×0.98). Both caps are earned: the staleness is real, and the diluted share count is an EPS-implied
proxy because dataset schema v1 carries no dilutive-instrument counts.

**Capital structure (v2).** Cash and liquid investments ₹27,701 crore (`CASH_AND_CASH_EQUIVALENTS` 14,786 +
`CURRENT_INVESTMENTS` 12,915, both filed). Lease liabilities ₹8,359 crore, treated `IND_AS_116_CAPITALISED`.
Gross debt and net debt: **not computable** — the capital structure sums four debt components and requires all four,
and this issuer presents no borrowings line at all (D-2).

**Valuation — no intrinsic value, no margin of safety, and the reasons are specific.**

- `DCF_FCFF` (PRIMARY): the model runs and derives a base FCFF of ₹26,849.3 crore at WACC 10.678 %, terminal growth
  4 %, 5-year horizon, tax 25.17 %. It then stops: *"enterprise-to-equity conversion blocked by netDebt"* — reported
  as `NOT_COMPUTABLE`, not as a number.
- `PE_RELATIVE` (SECONDARY): normalised EPS ₹57.7467 × P/E 22 gives ₹1,270.43 per share (band ₹1,016.34–₹1,524.51).
  The engine **does not publish this as intrinsic value**, because one secondary method is not an intrinsic range.
- `EV_EBITDA`, `EV_REVENUE`: withheld (`NOT_APPLICABLE` in this run — enterprise value needs the bridge that net
  debt blocks). `PB_RELATIVE`: not applicable by policy (asset-light).
- `intrinsic`: `null`. `marginOfSafety`: refusal `NO_PRICE_OBSERVATION`, `price MISSING / PRICE_UNAVAILABLE` — no
  price observation was ingested, and none was invented.

**Moat — `INSUFFICIENT_EVIDENCE`.** One dimension is evidenced (cost position: EBITDA margin 26.77 % against a 15 %
threshold) but does not persist across the window, and the primary dimension — ROIC − WACC for ≥ 3 consecutive years
— is unavailable because ROIC needs gross debt (D-2). Withheld, not guessed. A WIDE or NARROW label here would have
been an invention.

**Risk — `factors: []`, aggregate `NOT_COMPUTABLE`.** No published threshold was breached on the dimensions that
could be evaluated: operating cash flow covers 96 % of profit attributable to owners (₹25,210 cr vs ₹26,233 cr, the
threshold is 80 %) and capex is 1.4 % of revenue (threshold 20 %). The leverage dimension could not be evaluated at
all (D-2). See D-3 for why the published reason code under-describes that.

**Dividends.** Paid in each of the 3 periods; payout 56.0 %; free-cash-flow cover 1.57×; derived DPS ₹35.45 / ₹32.89
/ ₹30.52. `netDebtToEbitda` and the R-15 corroboration are `NOT_COMPUTABLE` (no borrowings line; dataset schema v1
carries no dividend-declaration record).

**The one-sentence version of the assessment:** the engine found the inputs adequate and the statements stale, and
then declined to value, rate or grade the company, naming each refusal. That is the behaviour this work item set out
to test and it held on real data.

---

## 6. Missing, unavailable and unsupported data

The 14 line items with no value, classified by cause rather than lumped together:

| Item | Statement | Cause |
| --- | --- | --- |
| `LONG_TERM_BORROWINGS`, `SHORT_TERM_BORROWINGS`, `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | BS | **No borrowings line is presented at all.** The issuer is debt-free by presentation. The dataset has no way to say "nil by disclosure", so these read as `NOT_REPORTED` — never as zero (D-2). |
| `PREFERENCE_CAPITAL` | BS | Not presented: share capital is equity only (₹2,071 crore equity share capital). |
| `INVENTORIES`, `COST_OF_MATERIALS_CONSUMED`, `PURCHASES_OF_STOCK_IN_TRADE`, `CHANGES_IN_INVENTORIES` | BS / P&L | Schedule III lines for a goods business; a services issuer presents none of them. |
| `INTEREST_EARNED`, `INTEREST_EXPENDED`, `FEE_AND_COMMISSION_INCOME` | P&L | Banking/NBFC presentation. The issuer's interest income sits inside `OTHER_INCOME`, net, and its finance cost is a single line. |
| `OPERATING_EXPENSES` | P&L | The issuer decomposes expenses (employee benefit, sub-contractors, travel, software packages, communication, consultancy, D&A, finance cost, other); the canonical single-line total has no filed counterpart, and the components are filed instead. |
| `INTEREST_PAID` | CF | Disclosed in the cash-flow notes but **not entered in this pass**: no derivation or method consumes it, so it stays visibly absent rather than being filled for tidiness. |
| `NET_DEBT` | BS | Derived item; underived because two of its three required inputs are nil-by-disclosure (D-2). |

Beyond line items, what this validation could **not** exercise, stated plainly:

- **A market price.** No price observation was ingested, so nothing downstream of price (margin of safety, price-to-
  value) is validated on real data. This is a data-acquisition gap, not an engine failure.
- **Quarterly and TTM paths.** Three annual periods only; the quarterly path needs ≥ 4 quarters and correctly returns
  null.
- **Operating metrics.** Technology's catalogue for this product holds `TM_NRR` and `TM_RECURRING_REVENUE_PCT`; the
  issuer does not disclose them in a form this dataset can carry, so metric coverage is 0 % and the coverage report
  says `OPERATING_METRIC_MISSING`. Not imputed from a segment note.
- **XBRL ingestion on an Indian instance.** The file-input path was exercised; the XBRL path was not, because no
  Ind AS instance document for this issuer was reachable from this environment, and the SEC's IFRS instance for the
  issuer's 20-F uses a different taxonomy (it would not exercise the Ind AS tag map). The tag map was therefore
  assessed analytically (§4), not executed. Recorded as a gap, not claimed as coverage.
- **Sector expansion.** None attempted: 12 of 13 sectors remain outstanding (`L-001` unchanged).

---

## 7. Defects and corrections

Three defects, classified by where they live. One is corrected in this work item, two are documented with the
decision they need — because correcting them means changing a published contract or a published definition, which is
outside this item's authority and would need its own review.

### D-1 — Documentation/output defect: a real-data run called its own dataset synthetic — **CORRECTED**

*Class: reporting/documentation (not data, mapping, derivation, valuation or assessment logic).*

`generate-investment-artifacts` published a fixed `limitations[]`: `L-004` ("the reference dataset is synthetic…")
and `L-009` ("no real issuer has been assessed…"). Those sentences were true of every run before this item and false
of this one: the run reads operator-supplied real disclosures and its snapshot reports
`datasetClass = APPROVED_LOCAL_INGESTION`. Shipping a machine-readable summary that misdescribes its own input class
is the exact failure mode this programme exists to prevent.

*Correction.* `limitationsForDatasetClass(datasetClass)` restates those **two** sentences for the
`APPROVED_LOCAL_INGESTION` class only. `SYNTHETIC_REFERENCE` keeps the historical wording verbatim, and a run that
fails before the snapshot step (`datasetClass = null`) also keeps it — a broken run must not claim a data class it
never saw. The identifiers, the subject and the direction of both limitations are unchanged; nothing is closed,
renumbered or reinterpreted; the other seven lines are byte-identical across classes.

*Evidence it is narrow.* Re-running the identical command after the change produced `persist UNCHANGED` with the
same `payloadDigest` and `inputDigest`: the correction moves no artifact byte.

*Regression test.* `frontend/server/investment/cli/realIssuerValidation.test.ts` asserts the real-data wording, the
unchanged synthetic wording, the `null`-class wording, and that exactly two lines differ between classes (by
identifier). The pre-fix summary is preserved as `runs/cli-v1-created-pre-fix.json` so the defect stays visible.

### D-2 — Mapping/derivation/assessment defect: a debt-free issuer cannot be valued or graded — **DOCUMENTED, NOT CORRECTED**

*Class: mapping (nil-by-disclosure has no representation) surfacing as derivation, valuation and assessment gaps.*

Infosys presents **no borrowings line at all**. The dataset records absence as `NOT_REPORTED`, which is correct given
schema v1 — an unreported input is never silently zero. But the assessment's capital structure sums four debt
components and requires all four (`sum()` blocks on any missing component), so:

- gross debt and net debt → `NOT_COMPUTABLE`;
- `DCF_FCFF` → cannot bridge enterprise to equity value ("enterprise-to-equity conversion blocked by netDebt");
- `EV_EBITDA` / `EV_REVENUE` → withheld;
- `intrinsic` → `null`; margin of safety has nothing to compare against;
- ROIC − WACC → unavailable → moat withholds;
- the leverage risk factor → skipped.

*Why it is not cosmetic:* a debt-free balance sheet is not an edge case in India, and it is precisely the case the
product is least able to describe. Two different net-debt notions coexist: dataset derivation `NET_DEBT` (v0, which
excludes lease liabilities **and** current maturities by design, and needs borrowings), and the assessment capital
structure (which includes lease liabilities but needs all four components). Adding the only filed debt-like line —
₹8,359 crore of Ind AS 116 lease liabilities, snapshot v2 — changed `leaseTreatment` to `IND_AS_116_CAPITALISED` and
made the lease component `PRESENT`, and still did not unblock the bridge. That is a controlled demonstration: the
blocker is representational, not missing filing data.

*Why not corrected here:* the fix requires a new, explicit representation of "nil by disclosure" (e.g. an
`OBSERVED_NIL` / `NO_BORROWINGS_DISCLOSED` fact with its own provenance and a policy for what nil means for each
derivation), plus revision of derivation `NET_DEBT` and the strict `sum()`. That is a schema/contract and
methodology decision affecting published artifacts and goldens — not a narrow correction, and not this item's
authority. The prohibited shortcut — entering `0` for borrowings — was not taken, and would be wrong even though the
company states it is debt-free: an inferred zero is indistinguishable in the artifact from a filed zero.

*Recommendation:* decide the nil representation before the next sector expansion; every debt-free issuer in every
sector hits this wall.

### D-3 — Assessment reason-code precision: "no factor breached" is reported as "policy inputs unavailable" — **DOCUMENTED, NOT CORRECTED**

*Class: assessment logic / reason vocabulary.*

With no risk factor generated, the aggregate is `NOT_COMPUTABLE` with reason `POLICY_INPUTS_UNAVAILABLE`. On this
issuer two different things are true at once: the leverage dimension genuinely could not be evaluated (D-2), **and**
every other dimension was evaluated and none breached its threshold. The single reason code states only the first,
so a reader can conclude the inputs were missing when in fact the company's leverage was the only gap and the
company's cash conversion and capex intensity were fine. A cleaner vocabulary distinguishes "no factor breached from
available inputs" from "a dimension could not be evaluated".

*Why not corrected here:* reason codes are part of the published payload vocabulary and appear in goldens; adding or
splitting one is an additive contract change with test-surface consequences that belong in a dedicated change, not
folded into a validation item. Low severity, high clarity value.

### Observations that are *not* defects (recorded so they are not re-investigated)

- `STALE_STATEMENTS` firing on 2024-03-31 data at a 2026-11-06 run date is correct behaviour, not a bug; the next
  obvious data step is to add FY2025/FY2026 filings, which changes nothing structurally.
- `DILUTION_PROXY` is correct: schema v1 carries no ESOP/convertible counts, so the share count is EPS-implied.
- `NET_PROFIT_ATTRIBUTABLE_TO_OWNERS` ≠ `NET_PROFIT` (₹26,233 cr vs ₹26,248 cr) is the NCI split, mapped as two
  separate items rather than conflated.
- The FY2022 figures carry `filing_ref` of the FY2022-23 filing because that is the document in which they are
  printed as the comparative; the provenance records where the number was read, not which year it belongs to.

---

## 8. New and changed limitations — with justification

**No limitation was closed, renumbered or reinterpreted. `L-001` … `L-029` remain as they were; `L-004` and `L-009`
are still `OPEN`.**

- **`L-004` and `L-009`: wording restated for one data class, status unchanged.** The CLI now distinguishes the
  shipped reference dataset (synthetic, unchanged) from an operator-supplied run. The *limitation* — the product
  ships no real dataset and offers no general real-issuer coverage — is untouched by this item and remains true.
  Justification is in D-1; the dated note is appended to the register.
- **`L-001` unchanged at 3 of 13 sectors.** No expansion was attempted, so nothing moved.
- **`L-002` unchanged at 20 tags.** The 18-of-33 measurement in §4 quantifies it for this issuer; it does not change
  the map.
- **New, bundle-scoped qualifications (not register limitations):** (a) no market price was ingested, so the price-
  and margin-of-safety path is unvalidated on real data; (b) the XBRL ingestion path was assessed analytically, not
  executed, on an Ind AS instance; (c) the validation covers exactly one issuer and one sector, and is a statement
  about the *path*, not about the product's opinions or about coverage.
- **D-2 and D-3 are product defects, not limitations.** They are recorded in §7 with the decision each needs, so
  that recording them does not quietly become a licence to keep them.

---

## 9. Tests and verification

Targeted, as required — no full backend suite was run.

| Check | Result |
| --- | --- |
| `npx vitest run server/investment/cli/realIssuerValidation.test.ts` | **4 passed** — real-disclosure ingestion, filed figures and derivation set, real-data self-description, limitation restatement |
| `npx vitest run server/investment/cli/generate-investment-artifacts.test.ts` | **10 passed** — the synthetic path, including `CREATED → UNCHANGED → APPENDED` versioning and the fail-closed paths, unaffected by D-1 |
| `npx tsc -p tsconfig.investment-server.json --noEmit` | clean |
| Payload digest recomputation | `sha256sum` of both committed payload files equals the chain's recorded `payloadDigest` |
| Independent chain read | separate process, after both runs: 2 versions, head v2, `failure null` |
| Idempotency | identical inputs re-run → `UNCHANGED`, `wrote=false`, version count unchanged |
| Ingestion integrity | `issues.json` = `[]` on both snapshots; manifest `quality: good`, `completenessPct: 100` |

The new test reads the evidence files committed here, so it fails if the transcriptions, the derivation set or the
ingestion contract drift — it is a real regression test on real data, not a fixture copy. It also pins D-2's visible
consequence (`withheldMethodCount = 2`) with a comment saying to update it when the nil-representation decision lands.

---

## 10. Bundle contents

| Path | What it is |
| --- | --- |
| `ingest-input/roster.json` | issuer, security and listing records actually ingested |
| `ingest-input/periods.csv` | **the authoritative figures** — 3 periods, 33 filed line items, ₹ crore as printed |
| `identity/` | IID-1 identity directory (roster, listing map, corporate-action table) |
| `dataset/` | snapshot v2 written by IID-0 (the dataset artifact v2 consumed) |
| `dataset-v1/` | snapshot v1 (the dataset artifact v1 consumed, kept so v1 stays reproducible) |
| `artifact/assessment-payload-v1.json`, `…-v2.json` | the full assessment payloads, hash-verified against the chain |
| `mapping-coverage/line-item-coverage-v{1,2}.json` | per-item filed/derived/not-available table with tag mapping |
| `runs/commands.txt` | every command run, with observed results |
| `runs/cli-v1-created-pre-fix.json` | run 1 summary — the D-1 evidence (stale limitation text) |
| `runs/cli-unchanged-post-text-fix.json` | re-run after D-1: `UNCHANGED`, digests identical |
| `runs/cli-v2-created-after-lease-addition.json` | run on snapshot v2: `APPENDED`, chain 2 versions |
| `runs/cli-v2-unchanged-final.json` | identical re-run: `UNCHANGED` with the final limitation wording |
| `runs/chain-read-v{1,2}.txt` | chain reads from separate processes |
| `runs/owner-carrier.json` | the Art. XI owner-context bytes the CLI requires |
| `digests.json` | sha256 and size of every committed file **except this README and digests.json itself**, plus the chain digests and the store digest |

**Path note.** `.gitignore` ignores any path component named `coverage` (it is there to keep instrumented test
outputs out of the tree). The per-item coverage tables were first written to `coverage/` and were therefore silently
excluded from a push, while `digests.json` listed them — the remote check caught the disagreement. The directory is
now `mapping-coverage/`, and the lesson is the one the `.gitignore` itself states: an ignored evidence directory
publishes a silent gap.

---

## 11. Commit, pull request, remote verification

- **Branch:** `arena/2ebc5e44-iips-review-recovered` (based on `main` = `ea28399`, the merged AC-X2/AC-X6 head).
- **Commits:** `93abbce` (validation, D-1 fix, regression test, evidence bundle) → `fcd17b6` (coverage tables moved
  out of the ignored `coverage` path; digests regenerated). Code head for CI: **`fcd17b6`**.
- **Pull request:** **#486** — https://github.com/ramkivs/iips-review-recovered/pull/486
- **CI:** `Typecheck · Test · Build` — **success** on `fcd17b6` (the frontend workflow, which includes the new
  regression test). The first push's run was superseded by the second; no run was skipped or bypassed.
- **Remote verification** (fresh `git clone --depth 1` of the PR branch into a clean directory, independent of the
  working tree):
  - the committed tree is byte-identical to the verified local tree (same blob hashes, file by file);
  - `digests.json` self-check in the clone: **37 files, 0 mismatches**, no unlisted file on disk and no listed file
    missing — this is what caught the `.gitignore`d `coverage/` directory, which was invisible locally and absent
    remotely, and is why the tables now live in `mapping-coverage/`;
  - `sha256sum` of both committed payload files equals the chain's recorded `payloadDigest` (`610eca02…` v1,
    `cc91f239…` v2) — the read path is verified against bytes, in a clean clone, not against prose;
  - the limitation register diff against `main` is **42 added / 0 removed** (pure append; `L-001` … `L-029`
    untouched);
  - coverage counts in the clone reproduce this document: 33 filed, 5 derived, 14 not available, 18 of 33 tagged.

**Not claimed anywhere in this bundle:** production acceptance, multi-user or hosted behaviour, sector coverage beyond
`Technology`, a real-dataset product, or any valuation/return expectation for the issuer.

---

## 12. Recommended next step

1. **Decide the nil-by-disclosure representation (D-2).** It is the single highest-leverage fix: it unblocks
   valuation, moat and leverage risk for every debt-free issuer, in every sector, without any new data source. Until
   it exists, a "debt-free Indian large-cap" validation will keep ending at `intrinsic: null`.
2. **Add one more real issuer that *does* carry borrowings** — the cheapest counter-test for the same code path: if
   gross debt is present, DCF per-share, EV methods, ROIC and the leverage factor should all compute, which would
   isolate D-2 as the only blocker. A measured-sector issuer with filed borrowings (e.g. an `Industrials`/`Materials`
   name in a sector already measured) is preferred over opening a new sector.
3. **Acquire a price observation** through the existing `prices.json` input so the margin-of-safety path is exercised
   on real data; that is the last unexercised piece of the assessment surface.
4. **Extend the dataset to FY2025/FY2026 filings** so the staleness flag stops dominating the quality verdict and the
   assessment runs on current statements.
5. Only after 1–4: consider sector expansion (`L-001`), which this item deliberately did not start.
