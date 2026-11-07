# WI-6A supplemental — the consolidated wording was reported; this run could not read it

**Outcome: the determination does not move.** The supplemental pass was asked to verify two consolidated
capital-management sentences — one in the FY2023-24 report (printed pp.304-305) and one in the FY2022-23 report
(printed pp.320-321) — and to run the governed pipeline on them if they qualified. **The sentences were not read**
in this environment. They are recorded as `OWNER_REPORTED_NOT_READ_BY_THIS_RUN`, and because D-2 requires the
wording to be read at its audited page, **no nil was declared, no dataset was ingested, no assessment was generated
and nothing was persisted.** Zensar remains `INVESTIGATED_UNSUCCESSFUL`.

The original WI-6A bundle is preserved byte-identical. This supplement adds to it; it does not replace it.

## What was reported

| | FY2023-24 report | FY2022-23 report |
| --- | --- | --- |
| Source | `nsearchives.nseindia.com/.../AR_24514_ZENSARTECH_2023_2024_1507202421929.pdf` | `bseindia.com/xml-data/corpfiling/AttachHis//f1a251aa-69c1-4a16-baad-67c3b12cde24.pdf` |
| Note | 27 — Capital Management | 27 — Capital Management |
| Printed pages | 304-305 | 320-321 |
| Scope | CONSOLIDATED | CONSOLIDATED |
| Wording | "The Group didn’t have any external borrowings during the current and previous year." | same sentence |
| Read by this run | **no** | **no** |

Wording digest (identical for both): `sha256:3c04662681a405bc869cc4c1c2dff93cd1417b30c6371282c296322ede6597cb`, 83
characters. A digest of the *source files* is not computable here — this shell has no route to nseindia.com or
bseindia.com and the reader returns text, not bytes — so the wording, which is the object that would enter a
dataset cell, is what is hashed.

## What this run did establish

1. **Both documents are the right issuer, right year.** The FY2023-24 transmittal letter (15 July 2024, 61st AGM,
   Rajiv Mundhra) and the FY2022-23 transmittal letter (17 July 2023, 60th AGM, Gaurav Tongia) were read in full.
2. **Both cited page ranges fall inside the consolidated statements of their own reports** — the FY2023-24 index
   places consolidated statements at pp.248-321, the FY2022-23 index at pp.262-345. Necessary condition met; not
   sufficient, and not treated as sufficient.
3. **The CIN.** `L72200PN1963PLC012621`, read from the letterhead of Zensar's Q2 FY2026-27 Regulation 33 filing.
   **No ISIN appears on any page this environment could render**, so ISIN stays `NOT_VERIFIED_FROM_FILING`.
4. **The boundary is the reader's, and it is general.** The 30-page parse limit was re-measured on the second,
   independent filing (stops at printed p.32) and reproduced through a third fetching path — Google's translate
   proxy returns the file, and the parser still stops at 30 pages. The proxy that paginates whole documents works
   fine on an 11-page Zensar filing and returns empty on the 10.1 MB integrated reports. Fourteen attempts are
   logged in `source/retrieval-log-supplemental.txt`.

## Why "reported" is not "verified", and why that is not pedantry

A page-range check catches a wrong report; it cannot catch a right-looking sentence on a real page. The failure
mode this work item exists to prevent is precisely the plausible sentence: WI-5 was withdrawn because a real,
correctly quoted sentence about *equity* shares had been mapped onto *preference* capital. A sentence that has not
been read cannot be checked for its subject ("Group" versus "Company"), its tense, its qualifiers, or its note
number — and those are exactly the features that decide whether it is a nil.

## The second blocker, which would survive verification

Gross debt is the sum of **four** components: short-term borrowings, current maturities of long-term debt,
long-term borrowings **and lease liabilities** (`capitalStructure.ts`, `grossDebtOf`). The reported sentence covers
borrowings only. Lease liabilities are a separate line, and the work item forbids mapping the sentence onto them, so
`LEASE_LIABILITIES` would stay `NOT_REPORTED` — and the aggregation contract returns the first component that
carries no information unchanged. **Gross debt and net debt would remain `NOT_REPORTED` even under a verified nil,
and the intrinsic chain would stay withheld.** The missing input is the consolidated lease-liability figure, which
sits on the same unreadable pages as the balance sheet.

So a verified sentence would complete three of four debt components and still not produce a debt position. That is
worth knowing before anyone treats these pages as the last obstacle.

## What would close it

* **A readable rendering of the four pages** — pp.304-305 and pp.320-321, as text or as a page extract placed in the
  workspace. D-2 anchors a quotation to a page, so a two-page extract of the primary document is sufficient
  evidence; a byte-for-byte copy of both 10 MB reports is not required.
* **The consolidated lease-liability figure** for 31 March 2024, 2023 and 2022, without which the debt block cannot
  close.
* Then the existing governed path, unchanged: ingest → generate → persist → separate-process readback → digest
  verification → three-period confirmation.

## Contents

| Path | What it is |
| --- | --- |
| `source/quotes-owner-reported.json` | both quotations verbatim, hashed, with locators, periods, scope, the verification status of each, the source-digest limitation, and the pre-reasoned D-2 mapping (not applied) |
| `source/retrieval-log-supplemental.txt` | fourteen attempts with exact outcomes, the measured boundary, and what the log does and does not establish |
| `source/index-locator-corroboration.txt` | the two index pages verbatim, showing the consolidated page ranges that contain the cited locators |
| `determination-supplemental.json` | the structured finding: status unchanged, the second blocker, the L-037 update, and what would close it |
| `runs/commands.txt` | commands performed, including the test, typecheck and clean-clone verification |
| `runs/02-guard-test.txt`, `runs/03-typecheck.txt`, `runs/04-clean-clone.txt` | this bundle's own run logs, excluded from the manifest by name |
| `digests.json` | sha256 + byte count of every substantive file (6); it never records itself |
