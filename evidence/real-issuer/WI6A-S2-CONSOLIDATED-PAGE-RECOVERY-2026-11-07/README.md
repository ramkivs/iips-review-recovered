# WI-6A-S2 — the consolidated pages were read, the nil holds, and the debt block closes — except where the filing is silent

**Issuer.** Zensar Technologies Limited — CIN `L72200PN1963PLC012621`, ISIN `INE520A01027` (both now
**read out of the filings**: the ISIN is printed as “ISIN in NSDL and CDSL INE520A01027” on PDF p.60 of the
FY2023-24 report and PDF p.66 of the FY2022-23 report; see `source/fy24-isin-and-listing-identifiers.txt` and
`source/fy23-isin-and-listing-identifiers.txt`). NSE `ZENSARTECH`, BSE `504067`, printed on those same pages.

**Question this bundle answers.** WI-6A found that the standalone sentence “The Company does not have any
outstanding borrowings …” cannot be used as consolidated evidence, and WI-6A-S1 recorded — but could not read —
a consolidated sentence in Note 27 of each annual report, while identifying a second, independent blocker:
gross debt also needs *lease liabilities*, which no route had produced. S2 asks: **can the pages be read, and if
they can, what do they entitle the pipeline to conclude?**

**Answer.** The pages were read, from the bytes of both reports. Both Note 27 sentences are exactly the string
reported in S1 (83 characters, sha256 `3c04662681a405bc869cc4c1c2dff93cd1417b30c6371282c296322ede6597cb`), and
both say the same thing about the same subject:

> The Group didn’t have any external borrowings during the current and previous year.
> — Consolidated Note 27 *Capital management*, FY2023-24 report, **printed pp.304-305 (PDF page 154 of 167)**;
>   FY2022-23 report, **printed pp.320-321 (PDF page 163 of 180)**.

Lease liabilities are on the consolidated balance sheet for all three dates, so the second blocker falls away.
The three borrowing components take `NIL_BY_DISCLOSURE`, `LEASE_LIABILITIES` is `PRESENT`, and gross debt /
net debt become **computable for the first time** for this issuer:

| | FY2024 | FY2023 | FY2022 |
| --- | --- | --- | --- |
| lease liabilities, non-current (Note 11(b)) | 1,228 | 1,904 | 2,348 |
| lease liabilities, current (Note 11(b)) | 637 | 826 | 1,005 |
| **lease liabilities, total** | **1,865** | **2,730** | **3,353** |
| borrowings / current maturities | nil by disclosure | nil by disclosure | nil by disclosure |
| **gross debt** | **1,865** | **2,730** | **3,353** |

`grossDebt` and `netDebt` are `PRESENT` in the persisted payload: gross debt ₹1,865 million, cash and
investments ₹10,938 million, **net debt −₹9,073 million** (net cash) at 31 March 2024.

**What still blocks, and this is the honest headline: the valuation.** The margins and the multi-year series now
work, but no intrinsic value is published — the primary DCF refuses for `INSUFFICIENT_HISTORY` (the FY2022
capital-expenditure line was not captured from the FY2022-23 cash-flow sheet), the EV/EBITDA per-share leg is
blocked by `minorityInterest` being `NOT_REPORTED` (the filing prints a dash, and a dash is not a declaration),
and the margin of safety refuses with `NO_PRICE_OBSERVATION` because no market price was obtained and none was
invented. A P/E relative band of ₹362.56–₹543.84 is produced; it is a *relative* range, not an intrinsic value.

## What changed relative to WI-6A and WI-6A-S1 — and what did not

| | WI-6A | WI-6A-S1 | **WI-6A-S2 (this bundle)** |
| --- | --- | --- | --- |
| determination | `INVESTIGATED_UNSUCCESSFUL` / `CONSOLIDATED_NIL_NOT_ESTABLISHED` | unchanged | **`NIL_ESTABLISHED_AND_INGESTED`** |
| Note 27 wording | not read | reported, **not read** | **read, verbatim, at both locators** |
| lease liabilities | not obtained | not obtained | **read for all three dates** |
| dataset / assessment / persistence | none | none | **dataset `sha256:a71498da…`, assessment `SUFFICIENT`/`MATERIAL_CONCERNS`/0.4032, persisted report `28b3e5d6-…`** |
| `L-037` | OPEN (generalised) | OPEN (generalised) | **OPEN — not closed; see §L-037 below** |

The WI-6A and S1 bundles are untouched and still verify. Nothing in them is retracted: S1 said the wording was
*reported but unread*, which was true when it was written, and its “second independent blocker” analysis was
correct as an analysis of what would happen under a verified nil with leases missing.

## The D-2 mapping, component by component

The sentence is a consolidated statement about **external borrowings**; it is not a statement about leases,
preference shares or minority interests, and it is not stretched to them.

| component | decision | why |
| --- | --- | --- |
| `LONG_TERM_BORROWINGS` | `NIL_BY_DISCLOSURE` | “didn’t have **any** external borrowings” is a universal negation over the class; a long-term borrowing is an external borrowing. The consolidated balance sheet presents no non-current borrowings caption in any of the three periods — corroboration, not the evidence. |
| `SHORT_TERM_BORROWINGS` | `NIL_BY_DISCLOSURE` | same sentence, same class; no current borrowings caption in any of the three balance sheets. |
| `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | `NIL_BY_DISCLOSURE` | a current maturity is a slice of a long-term borrowing; with no long-term borrowing there is nothing to reclassify, and the balance sheet presents no such caption. This is the same mapping WI-3 applied to Infosys. Recorded caveat: it is a *deductive* step from a universal negation, not a sentence that names “current maturities”. |
| `LEASE_LIABILITIES` | **`PRESENT` (numbers, as filed)** | the sentence does not speak to leases, and lease liabilities are separately quantified (Note 11(b); Note 27 liquidity table carrying values 1,865 / 2,730 / 3,353; Note 33 movement). Mapping the nil onto leases is forbidden and was not done. |
| `PREFERENCE_CAPITAL` | `NOT_REPORTED` | no sentence addresses preference share capital and no preference line is presented. Presentation completeness is not a declaration (the WI-5 rule). |
| `NON_CONTROLLING_INTEREST` | `NOT_REPORTED` | the consolidated balance sheets print “Non-controlling interests … –”. A dash is not a declaration, so it stays `NOT_REPORTED`, and it is what blocks the enterprise-to-equity conversion. |

Two semantic caveats are recorded rather than smoothed away:

1. **“external”** qualifies the class. At consolidated level intragroup balances are eliminated, so what remains
   is external by construction — but the qualifier is recorded, not assumed away.
2. **Durational, not point-in-time.** The sentence says “during the current and previous year”, while a balance
   sheet item is measured at 31 March. WI-3’s anchor for Infosys was point-in-time (“no outstanding
   borrowings”). The entailment from “never during the year” to “nil at the year end” is deductive: a balance
   held on 31 March is a balance held during the year. The difference from the WI-3 shape is stated here so a
   reviewer can weigh it.

## Three-period validation

| period end | nil sentence relied on | locator | corroboration |
| --- | --- | --- | --- |
| 2024-03-31 | FY2023-24 Note 27 (“current … year”) | printed 304-305 / PDF 154 | no borrowings caption on printed 256-257; Note 27 liquidity table lists only trade payables, lease liabilities, derivative liabilities and other financial liabilities |
| 2023-03-31 | FY2023-24 Note 27 (“previous year”) **and** FY2022-23 Note 27 (“current year”) | printed 304-305 / PDF 154; printed 320-321 / PDF 163 | two independent filings, word for word identical; no borrowings caption on either balance sheet |
| 2022-03-31 | FY2022-23 Note 27 (“previous year”) | printed 320-321 / PDF 163 | no borrowings caption on printed 270-271; Note 27 liquidity table lists lease liabilities 3,353 |

## Lease liabilities — three dates, two independent presentations each

| date | non-current | current | total | presented again as |
| --- | --- | --- | --- | --- |
| 2024-03-31 | 1,228 | 637 | **1,865** | Note 27 liquidity table carrying value 1,865 (printed 304-305); Note 33 closing balance 1,865 (printed 308-309) |
| 2023-03-31 | 1,904 | 826 | **2,730** | Note 27 liquidity table carrying value 2,730 (printed 304-305); Note 33 opening balance 2,730 |
| 2022-03-31 | 2,348 | 1,005 | **3,353** | FY2022-23 Note 27 liquidity table carrying value 3,353 (printed 320-321); FY2023-24 Note 33 prior-year row [3,353] |

Units: INR million, consolidated, Ind AS, as filed. Source pages: `source/fy24-consolidated-note-11b-lease-liabilities.txt`
(printed 288-289) and `source/fy23-consolidated-note-11b-lease-liabilities.txt` (printed 302-303).

## Pipeline result (persisted, then read back in a separate process)

| step | result |
| --- | --- |
| ingest | datasetVersion `sha256:a71498daabb31f23728f408a2a92d3fabe50efee7f2b1de4813e8e2c6a2581c7`; `issues.json` `[]`; Technology `G2_PARTIAL`, statement coverage 83.3 % |
| identity | RESOLVED via ISIN |
| assessment | `SUFFICIENT` / `MATERIAL_CONCERNS` / confidence 0.4032; quality flag `STALE_STATEMENTS` (latest period end beyond the freshness window) |
| compose | reportKey `dc9e4f47571dc3c9fba4d36cfa933cc74efc62a3c2a9b6f429131eed3d61f67f`, payloadDigest `fbfa5564900a0105d286918dd9572f337358c5c4d6eb0d4df5ef94ec18160f9e` |
| persist | `CREATED (wrote)`, chain valid, 1 version, head v1, reportId `28b3e5d6-a53d-4fb8-a073-5ed86e73a65e`, scope `co:IN:CIN:L72200PN1963PLC012621` |
| readback | separate process; digest of the read payload **matches** the stored digest and the chain head |

Numbers that changed because the nil was admitted:

- `grossDebt` `PRESENT` = ₹1,865,000,000 (previously `NOT_REPORTED`), with the aggregation note naming the three
  components the filer declared nil.
- `netDebt` `PRESENT` = **−₹9,073,000,000**; `cashAndInvestments` ₹10,938,000,000; `leaseTreatment`
  `IND_AS_116_CAPITALISED`.
- Net debt / EBITDA becomes usable: **−0.8804** (it was unavailable before).
- Dividend sustainability: 3 consecutive years paid, payout ratio 0.1874, FCF coverage 5.0217.

Numbers that did **not** become available, and the exact reason:

- **intrinsic value: `null`.** The intrinsic blend requires every weighted method to have an output. `DCF_FCFF`
  (PRIMARY) refuses with `INSUFFICIENT_HISTORY` — three annual periods of EBIT, D&A **and capex** are required and
  the FY2022 capex line was not captured (see the retrieval log, §“What could NOT be done”). `EV_EBITDA` runs and
  produces an enterprise value, but its per-share leg is `NOT_COMPUTABLE` with the note “enterprise-to-equity
  conversion blocked by minorityInterest”. `EV_REVENUE` refuses for `MANDATORY_METRIC_MISSING`
  (`TM_NRR`, `TM_RECURRING_REVENUE_PCT`).
- **margin of safety: `NO_PRICE_OBSERVATION`.** No market price was obtained for `INE520A01027`; none was
  invented. The MoS band is therefore absent even though the debt and the dividends are now computable.
- **risk: `NOT_COMPUTABLE` / `NO_RISK_FACTOR_IDENTIFIED`** — D-3 semantics, unchanged.
- **associates/JV: `POLICY_ZERO`** under schema V1, and the 180-day review control fires:
  `status: REVIEW_DUE`, `clockStart 2024-03-31`, `reviewDueOn 2024-09-27`, `reviewAgeDays 180`. The control is
  preserved, not silenced.

## The register: what this does and does not close

- **`L-037` stays OPEN.** Its criterion is that a nil can be established for a real issuer from a real filing
  *and* carried through the governed pipeline; that has now happened for one issuer on one item. One issuer is
  not the general case, and the entry is about the *class* of retrieval failures this environment produced. It is
  updated — the retrieval limitation no longer applies to these two documents — and left OPEN.
- **`L-035` and `L-036` are untouched.** No independent evidence about them was produced here.
- **`L-036`'s associates review control** is preserved and observable in the payload (above).

## Contents

| Path | What it is |
| --- | --- |
| `source/quotes-verified.json` | the two Note 27 sentences, both **read**, with locators, scope, subject, periods covered, and the digest comparison against the S1 owner-reported string |
| `source/source-bytes.json` | the two documents: URL, host class, HTTP status, byte count, sha256, `pdfinfo`, and the corroborating second route |
| `source/page-map.json` | printed-page ↔ PDF-page-index calibration for all eleven evidence pages |
| `source/*.txt` | the eleven pages, verbatim, each with a provenance header (URL, bytes, sha256, PDF index, printed pages) |
| `source/retrieval-log-s2.txt` | what was tried in S2, what worked, what did not, and what was deliberately not retried |
| `ingest-input/periods.csv` | three consecutive audited consolidated periods, INR million, with the three `NIL:` cells and their quoted wording |
| `ingest-input/roster.json`, `ingest-input/identity/` | issuer/security/listing records — ISIN and the exchange identifiers now filing-verified |
| `runs/01-ingest.txt`, `runs/02-generate.txt`, `runs/cli-s2.json` | verbatim CLI output and the machine-readable run summary |
| `runs/readback.json`, `runs/readback-stdout.txt` | the separate-process readback, including the digest comparison and the capital-structure block |
| `artifact/assessment-payload-zensar-s2.json` | the persisted payload as read back from the governed store |
| `runs/commands.txt` | the commands actually run, including the out-of-process fetch that produced the bytes |
| `digests.json` | sha256 + byte count of every committed file in this bundle |

## Limitation this bundle does not hide

The two PDFs could not be fetched by this environment (no general egress) and could not be parsed by it (no PDF
tooling). The bytes were fetched and text-extracted by a throwaway GitHub Actions job on a temporary workflow
file added to this branch for that purpose and deleted again in the same work item. The committed page extracts
are that job's `pdftotext -layout` output, unedited except for the provenance header. A reviewer can re-run the
two `curl` + `pdftotext` lines in `runs/commands.txt` and reproduce every page file byte for byte; the sha256 of
each source PDF is recorded so the bytes themselves can be checked.
