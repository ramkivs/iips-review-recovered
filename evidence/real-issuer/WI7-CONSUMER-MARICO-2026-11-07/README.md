# WI-7 — Consumer sector, Marico Limited: three audited consolidated periods read, ingested and persisted

**Work item.** WI-7 of IIPS v3.0 IID: the first real-issuer validation outside Technology. Consumer was selected
because it is the only remaining sector whose entire governed method matrix — `DCF_FCFF`, `PE_RELATIVE`,
`EV_EBITDA` — declares **no mandatory operating metric**, so every method it considers can be exercised on audited
filings alone. The issuer is **Marico Limited** (CIN `L15140MH1988PLC049208`, ISIN `INE196A01026`, BSE `531642`,
NSE `MARICO`).

**What this bundle is.** The primary bytes (hashed), the twelve printed pages every ingested fact and figure comes from, the
governed ingestion input, the pipeline run that persisted the artifact, and a separate-process readback. It is
evidence, not a summary: the numbers here can be re-checked against the extracts in `source/`.

## Source bytes

| Document | URL | bytes | sha256 | pages | HTTP |
|---|---|---|---|---|---|
| Integrated Annual Report 2023-24 | `https://marico.com/investorspdf/Marico_Annual_Report_FY24.pdf` | 21,087,675 | `03cb0db78289cdda4ffcd4b4e9f14f3b444a52a4fd64d6265578180fa9857595` | 259 | 200 |
| Integrated Annual Report 2022-23 | `https://marico.com/investorspdf/Marico_Annual_Report_FY23.pdf` | 28,505,144 | `0f41759d903f2f9e1185d1bd52228a1653592583ca729abe75edf430b9332b0a` | 224 | 200 |
| Integrated Annual Report 2021-22 (fetched, hash recorded, **no figure taken from it**) | `https://marico.com/investorspdf/Marico_Annual_Report_FY22.pdf` | 27,915,655 | `cd8855e5f03ce8c6081684586a24e3e533bdae3716a989ef7c11e7db8237a993` | 200 | 200 |

`https://www.marico.com/investorspdf/Marico_Annual_Report_FY24.pdf` serves the identical bytes and hash. Two
candidate FY2022-23 URLs returned HTTP 404 and are recorded in `source/source-bytes.json` rather than hidden.

The FY2023-24 auditor's report spans two PDF pages here, because the paragraph that names the reporting
framework does not sit on the same page as the opinion: PDF p.169 carries the title *Report on the Audit of the
Consolidated Financial Statements*, and PDF p.170 carries the basis paragraph, which reads `Indian Accounting
Standards (Ind AS) specified under Section 133 of the Companies Act, 2013`. Both are extracted verbatim;
`source/identity-verified.json` cites the pair for the `INDAS`/consolidated claim, and no other page is made to
carry it.

## Three audited consolidated periods, and which document supplies each

| Period end | Column read from | Filing reference | Audited by |
|---|---|---|---|
| 2024-03-31 | FY2023-24 report, current column | `MARICO-INDAS-CONSOL-FY24-AR` | B S R & Co. LLP, opinion at PDF p.169 |
| 2023-03-31 | FY2023-24 report, comparative column | `MARICO-INDAS-CONSOL-FY24-AR-COMPARATIVE` | same opinion |
| 2022-03-31 | FY2022-23 report, comparative column | `MARICO-INDAS-CONSOL-FY23-AR-COMPARATIVE` | B S R & Co. LLP, opinion at PDF p.125 |

The two reports print one **printed sheet per PDF page, carrying two printed pages**; every citation gives both.
The FY2023-24 report reclassifies the prior year's investing and financing sections against the FY2022-23 report's
own FY2023 column (investing `(865)` vs `(929)`, net increase in cash `(69)` vs `(133)`; operating cash flow 1,419 in
both). Each row is taken from **one** statement — never averaged, never blended — and the difference is recorded in
`ingest-input/data-extraction.json`.

## D-2 in a new sector: nothing is declared nil, and a dash is not a number

No cell in `ingest-input/periods.csv` is a `NIL:` cell. Nothing on the pages read declares borrowings, leases,
preference capital or non-controlling interest nil.

| Item | What the filing prints | Treatment |
|---|---|---|
| `LONG_TERM_BORROWINGS` | balance sheet dash for FY2024; Note 13(a) "Total non-current borrowings – 2"; FY2023 prints `2`; FY2022 prints a dash | **NOT_REPORTED** for FY2024 and FY2022; `2` crore for FY2023 |
| `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | no such line in the balance sheet, Note 13(a) or Note 13(b) | **NOT_REPORTED**, all three periods |
| `PREFERENCE_CAPITAL` | no preference share capital line (Note 12(a) is equity share capital) | **NOT_REPORTED**, all three periods |
| `SHORT_TERM_BORROWINGS` | `383` / `473` / `345` | **PRESENT** |
| `LEASE_LIABILITIES` | non-current `104`+ current `41` = `145` (and the financing reconciliation prints 145) | **PRESENT** |
| `NON_CONTROLLING_INTEREST` | `337` / `157` / `57` (Note 12(c) closes at 337) | **PRESENT** |

The dash reading is the one already fixed at register §17.14: a dash is neither a number nor a quoted declaration.
It is not upgraded to a nil here, and it is not silently typed as a zero.

## What the governed run produced

* datasetVersion `sha256:04c96303e269108803b2a5efef565eae2940ecb649b4f34998d01106a9cc6bd0`, `issues.json` `[]`
* Consumer measured: **G1_ENABLED**, three annual periods, all three of the sector's methods AVAILABLE, statement
  coverage 91.7 %, operating-metric coverage 100 % (the sector mandates none)
* adequacy **SUFFICIENT** (required-field coverage 100 %); statement coverage balance sheet 76.19 %, cash flow
  88.89 %, profit and loss 68.18 %
* assessment **SUFFICIENT / MATERIAL_CONCERNS**, confidence **0.3306** (data 0.85, model 0.125, caps
  `STALE_DATA`, `DILUTION_PROXY`, `POLICY_DEFAULT_WACC` 0.20, `POLICY_DEFAULT_MULTIPLE` 0.15)
* capital structure: `grossDebt` **`MISSING` / `NOT_REPORTED`**, `netDebt` **`MISSING` / `NOT_REPORTED`** — the
  current-maturity component carries nothing in any period, so the aggregation returns the blocking observation
  instead of a number. Cash and investments `PRESENT` 4,870,000,000; leases `PRESENT` 1,450,000,000; minority
  interest `PRESENT` 3,370,000,000.
* valuation: `DCF_FCFF` **applicable** (EBIT 20,100,000,000; D&A 1,580,000,000; capex 1,530,000,000; FCFF base
  13,541,622,333; WACC 10.68 %; g 4.00 %; 5-year horizon) but every per-share leg `NOT_COMPUTABLE` —
  *"enterprise-to-equity conversion blocked by netDebt"*. `EV_EBITDA` **not applicable** —
  `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable`. `EV_REVENUE` **excluded** by the Consumer policy
  ("margin heterogeneity across staples, discretionary and luxury"). `PE_RELATIVE` produces
  **₹181.69 / ₹227.11 / ₹272.54** from normalised EPS 10.3233 × policy-default multiple 22.
* `intrinsic` **null**; margin of safety `NO_PRICE_OBSERVATION` — no price was obtained and none was invented.
* `L-036`'s associates control fires **REVIEW_DUE** again (clock from 2024-03-31, due 2024-09-27, 180 days),
  unchanged at `POLICY_ZERO` under schema V1.
* persistence: reportId `f110608f-f63b-4e7d-95bc-ad4f6222c17a`, one version, head v1, payloadDigest
  `3fd27a98313d853704e864df6d1228566053be43f49c4d2c011371615ced2343`, recomputed from the read payload in a
  separate process and **equal** to the stored digest and the chain head.

## New limitation, opened and left open

**L-038** — the enterprise-to-equity bridge needs three borrowing components that a consolidated balance sheet need
not print. This issuer reports cash, leases, minority interest and a current borrowing line in full, and still gets
no debt figure, because the current-maturity component is not disclosed and the non-current row is a dash. The
limitation is **`OPEN`**; no grammar change is proposed in this work item.

## Files

```
README.md                         this file
determination-wi7.json            the machine-readable determination (selection, D-2, run results, register status)
                                  — superseded 2026-11-07 by WI7-L038-DEBT-COMPLETENESS-2026-11-07
                                  (two reasons recorded in the file; the payload itself is byte-identical)
source/source-bytes.json          the three PDFs: URL, HTTP status, bytes, sha256, page count, rejected routes
source/page-map.json              PDF page ↔ printed page, per-cited-page digest
source/identity-verified.json     identity facts with their filing locators
source/*.txt                      twelve page extracts with provenance headers (verbatim text, whitespace
                                  normalised as each header explains)
ingest-input/periods.csv          the governed dataset input, three consolidated annual periods
ingest-input/data-extraction.json where each figure is printed, including the derived and not-reported items
ingest-input/roster.json          issuer / security / listing records, with the operator-record caveat
ingest-input/identity/*.json      IID-1 identity sources
runs/01-ingest.txt                ingest stdout (datasetVersion, coverage table)
runs/02-generate.txt              generate stdout (the nine governed steps)
runs/cli-wi7.json                 machine summary of the run that CREATED version 1
runs/readback.json                separate-process readback record
runs/readback-stdout.txt          the same record as printed
runs/commands.txt                 the exact commands, and what they were run against
runs/03-guard-test.txt            targeted guard run: WI-7 plus the six earlier WI guard files, all green
runs/04-typecheck.txt             tsc on the package project, and separately on the WI-7 guard file
runs/05-clean-clone.txt           reproduction from a fresh clone of the pushed branch
runs/06-ci-check.txt              the one configured check, as GitHub reported it on the pull request
artifact/assessment-payload-marico-wi7.json   the persisted canonical payload, read back
digests.json                      sha256 of every file above except itself and the 03-06 transcripts
                                  (they record a tree state at a moment and are quoted in the pull request)
```

Guarded by `iips-platform/tests/investment/wi7ConsumerMarico.test.ts`.

## Verification, and what the check is

Targeted only — no full backend regression. `runs/03-guard-test.txt`: the WI-7 guard file plus the six earlier WI
guard files, **104 tests, 104 pass, 0 fail**. `runs/04-typecheck.txt`: `tsc --noEmit` on the package project and, since
`tsconfig.json` includes only `src/**/*.ts`, a second strict invocation over the guard file — both exit 0.
`runs/05-clean-clone.txt`: a fresh clone of this branch re-ingests to the same dataset version, re-hashes all 30
digested files clean and recomputes the chain head.

`runs/06-ci-check.txt`: **one** check is configured for the paths this pull request changes — the repository's own
`CAP-03 Revision 7 IRR-only static checks`, job `Python compile · source/evidence/tracker validation`. It has passed on
every head pushed so far (runs `42353056595` and `42353279839`) and re-runs on each further push. That check is Python-standard-library only: it compiles the CAP-03 validator, runs two routing
suites, validates Revision 7 source/evidence/tracker, verifies the pinned recovery-release assets and runs
`git diff --check`. No npm, frontend or IPD CI runs for these paths.

Two adjustments were needed to make that check green, and both are recorded rather than hidden: the extract file names
carried a `-p1NN` token that the CAP-03 validator reads as a P-1 artifact path (they are now `…-pdf-pageNNN.txt`), and
`git diff --check` rejected the tabs and trailing blanks of the raw layout-preserving extraction (the extracts are now
whitespace-normalised, with the normalisation stated in every header and no non-whitespace character changed).
