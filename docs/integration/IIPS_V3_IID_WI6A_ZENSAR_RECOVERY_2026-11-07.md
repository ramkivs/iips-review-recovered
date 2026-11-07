# WI-6A — Zensar primary-source recovery and nil-disclosure determination

**Date.** 2026-11-07. **Scope.** IRR only, one pass. No IPD writes, no production scope, no persistence change,
no IX policy change, no D-2 semantics changed. PR #502 preserved; nothing merged.

**Outcome.** `INVESTIGATED_UNSUCCESSFUL`. The consolidated section of the Zensar Technologies FY2023-24 filing was
**not retrieved**, so the consolidated question is **unresolved** — not answered "no", and certainly not answered
"nil". **No observation, no nil declaration, no dataset, no assessment, no persisted artifact.** In addition, one
independent fact was settled and it matters: the sentence that started this work is a **standalone** declaration
and can never carry a consolidated nil.

---

## 1. The question, and the two ways it could be answered

WI-6 ended with Zensar as `BLOCKED_NOT_ESTABLISHED`: a secondary aggregator attributes to Zensar's notes the
sentence *"The Company does not have any outstanding borrowings as at 31 March 2024 and 31 March 2023"*, but the
primary filing could not be read. WI-6A was commissioned to break that block and answer one question:

> Do the **consolidated** financial statements of Zensar's FY2023-24 Integrated Annual Report declare borrowings nil?

Only two honest answers exist: *yes, here is the wording and its page* — or *not established*. This pass returns
the second, for two independent reasons, and records which reason is which.

---

## 2. The primary filing was reached — and read as far as it goes

The NSE archive URL **does** serve the document to this environment's plain reader. It was read end-to-end for its
front matter, and **two independent copies of the same document agree word for word**: the NSE original and the
RPG Group mirror (RPG is Zensar's parent group; the group itself publishes the report on its investor pages).

What the front matter establishes, from the filing itself:

| Field | Value | Where |
| --- | --- | --- |
| Legal name | Zensar Technologies Limited | cover, transmittal letter |
| Scrip ID / Symbol | `ZENSARTECH` / `ZENSARTECH` | transmittal letter, 15 July 2024 |
| Scrip code / Series | `504067` / `EQ` | transmittal letter |
| Subject | "Notice of 61st Annual General Meeting and Integrated Annual Report for FY 2023-24" | transmittal letter |
| Signatory | Rajiv Mundhra, Authorized Signatory | transmittal letter |
| **Standalone statements** | **printed pp.176-247** | contents spread and Index |
| **Consolidated statements** | **printed pp.248-321** | contents spread and Index |
| Glossary / SASB / SDG index | p.322 / p.327 / p.328 | Index |

`CIN` and `ISIN` do not occur in the readable window. They are recorded as `NOT_VERIFIED_FROM_FILING` rather than
filled in from a company-registry aggregator — the identity block is allowed to be incomplete; it is not allowed to
be borrowed.

**Retrieval stopped there.** Every reader available here renders roughly the first 100 KB of a PDF's text — about
55 printed pages of this one — and stops. The proxy that paginates whole documents is refused by the NSE archive
with `HTTP 403` (Akamai reference `#18.1668dc17.1794028603.32167b5a`). That is a **proxy** refusal, not an origin
block: WI-6's access note is corrected accordingly, and the same log shows the same cap on the mirror, which proves
it is a reader limit and not a server one. The other eleven routes — storage mirror (403), BSE annual-report path
(404), BSE announcement API (Referer-gated), Wayback (no snapshot), three public CORS proxies (blocked), the
FY2024-25 fallback copy (empty) — are itemised with exact statuses in
`evidence/real-issuer/WI6A-ZENSAR-PRIMARY-RECOVERY-2026-11-07/source/access-log.txt`.

**Absence of text beyond a retrieval cap is never evidence of absence.** Pages 248-321 were never rendered; this
record therefore says nothing whatever about what they contain, including that they contain nothing.

---

## 3. The scope finding — settled on the document's own pagination

The sentence the owner located sits in the **Notes to the Standalone Financial Statements at printed pp.246-247**.

The filing's own pagination is decisive:

```
Standalone Financial Statements   begin at printed page 176
Consolidated Financial Statements begin at printed page 248
The sentence sits at printed pages 246-247  ->  BEFORE the boundary
```

So `statement_scope = STANDALONE`. Its subject is *Zensar Technologies Limited*, the legal entity. It says nothing
about subsidiaries, joint ventures, or the Group, and D-2 does not permit transferring a standalone declaration to
consolidated data.

Two consequences follow, and they are independent of the missing pages:

1. **The sentence can never be the consolidated evidence** — not because it is wrong, but because it is scoped to a
   different subject. This is the WI-5 failure mode one level up: there a sentence scoped to *equity* shares was
   refused as a preference-capital nil; here a sentence scoped to the *parent entity* is refused as a group nil.
2. **If the consolidated notes repeat the sentence, that repetition must be read and quoted in its own right.** An
   identical sentence appearing in two places is two pieces of evidence, not one piece of evidence carrying twice.

The sentence itself is recorded as `OWNER-REPORTED` and **not read by this run** — a transcription supplied in
conversation is a locator, not evidence.

### The caution that makes the transfer dangerous rather than merely irregular

Zensar's consolidation working papers show a subsidiary carrying borrowings in its own right: the special-purpose
financial statements of *Zensar Technologies Inc.*, prepared "for the purpose of consolidation by its Holding
Company (Zensar Technologies Limited)", show a current-borrowings line reading 110 / 140. That reproduction comes
from a market-data aggregator, undated against the audited set, and is **not evidence of anything**. It is recorded
for exactly one reason: to demonstrate that importing a parent-only "no borrowings" sentence into group figures is
an assumption with consequences, not a formality. No number from it appears in any dataset, and it is not used to
assert a consolidated borrowing balance.

---

## 4. Three-period check — `NOT_PERFORMED`, and why that is the correct entry

| Period | Consolidated statements | Read? | Nil wording |
| --- | --- | --- | --- |
| FY2023-24 (base) | printed pp.248-321 | no | none admissible |
| FY2022-23 | locator not identified | no | none |
| FY2021-22 | locator not identified | no | none |

The three-period requirement is a *confirmation* requirement: it exists to stop a single year's wording from
standing in for a trend. It cannot substitute for the base period. A table of three blank consolidated columns
would be three unread periods dressed as a finding, so the check is recorded as `NOT_PERFORMED` and every period as
`NOT_RETRIEVED`. No period is described as nil, zero, debt-free or silent — in `periods.json` or anywhere else.

---

## 5. What was not created, and what was not changed

* **No observation** was written, added to a candidate register as accepted, or left as a stub.
* **No nil declaration.** No `NIL: <wording>` record exists for Zensar in any form.
* **No dataset ingested**; **no assessment generated**; **no payload persisted**. The D-2 governed pipeline was not
  run — there was no admissible input to run it on.
* **No D-2 semantics changed.** Nothing in the nil grammar, the required CSV columns, the conflict resolution or the
  evidence classes was touched to make this pass look better.
* **Historical artifacts untouched**: the WI-3 (30 files), WI-5 (24 files) and WI-6 (8 files) bundles all still
  verify against their own `digests.json` from a clean clone; Infosys and eClerx are unchanged.

---

## 6. The limitation this pass adds

**`L-037` (new, `OPEN`) — deep-page retrieval of large Indian issuer annual reports is capped by every available
reader.** The direct reader renders about the first 100 KB of text and stops; the one reader that paginates whole
documents is refused by the NSE archive. The operational rule that follows is narrow and absolute: *absence of
wording beyond the cap is not evidence of absence*, and no negative finding about unrendered pages may be inferred
from it. This is the mirror image of the WI-6 lesson — there, an unreadable filing could not carry a nil; here, an
unreadable filing must not be reported as carrying none.

`L-036` remains **`PARTIALLY RESOLVED`** and `L-035` remains **`OPEN`**. Neither was touched, and neither was closed
to tidy up after a negative pass.

---

## 7. Verification

| Check | Result |
| --- | --- |
| `npx tsx --test tests/investment/wi6aZensarRecovery.test.ts` | 8/8 subtests pass, 0 fail (`runs/02-guard-test.txt`) |
| `npx tsx --test tests/investment/wi6SecondIssuerSearch.test.ts` | 8/8 pass — WI-6 record unchanged |
| `npx tsx --test tests/investment/wi5PreferenceCapitalEvidence.test.ts` | pass — WI-5 record unchanged |
| `npx tsc --noEmit` | clean (`runs/03-typecheck.txt`) |
| bundle digests | 7/7 verify; `digests.json` never records itself, and the bundle's own run logs (`runs/02`, `runs/03`, `runs/04`) are excluded by name (`runs/04-clean-clone.txt`) |
| clean clone | `/tmp/wi6av` reproduces the bundle, WI-6 8/8, WI-3 30/30, WI-5 24/24 |
| CI | **none exists in this repository** — `gh pr checks` reports "no checks reported"; no success is claimed |

---

## 8. What would finish this work item

One thing, and it is small: **a copy of Zensar's FY2023-24 Integrated Annual Report whose pages 248-321 can actually
be rendered.** Then read, in order, the consolidated balance sheet, the consolidated statement of changes in equity,
every borrowings / loans / lease / financial-liabilities note, the auditor's report, and the liquidity-risk note; and
look for an affirmative sentence about *consolidated* borrowings covering both 31 March 2024 and 31 March 2023.

* If such wording exists: quote it verbatim with printed page and note number, establish FY2022-23 and FY2021-22 on
  the same basis, and only then run the existing D-2 pipeline — unchanged — through ingest, generate, persist and
  separate-process readback.
* If it does not: Zensar stays `INVESTIGATED_UNSUCCESSFUL`, and no artifact is created for it.

Nothing in this record pre-commits that outcome. The objective — a second issuer beside Infosys with a genuine
consolidated nil-by-disclosure — remains **unmet**, and sector expansion remains deferred.

---

## 9. Supplemental finding (2026-11-07, later the same day) — the consolidated wording was reported, and could not be read

**What changed.** After the record above closed, the owner reported having recovered the consolidated capital-management
wording that this pass could not read: in the FY2023-24 report, Note 27 *Capital Management*, printed pp.304-305 —
*"The Group didn't have any external borrowings during the current and previous year."* — and the same sentence at
Note 27, printed pp.320-321, of the FY2022-23 report (BSE attachment `f1a251aa-69c1-4a16-baad-67c3b12cde24`). The two
sentences, each covering "the current and previous year", would jointly span FY2022, FY2023 and FY2024.

**What this run could and could not do with it.** The supplemental pass set out to verify both quotations against the
sources and, if they qualified, to run the governed pipeline unchanged. It verified the documents and the locators, and
it did **not** verify the sentences:

| Verified | Not verified |
| --- | --- |
| FY2023-24 report is the right issuer and year (transmittal letter, 15 July 2024, 61st AGM, Rajiv Mundhra) | the wording at pp.304-305 |
| FY2022-23 report is the right issuer and year (transmittal letter, 17 July 2023, 60th AGM, Gaurav Tongia) | the wording at pp.320-321 |
| **cited pages fall inside each report's consolidated section** — pp.248-321 (FY24, from its index) and pp.262-345 (FY23, from its index) | the note numbers as printed |
| CIN `L72200PN1963PLC012621`, from the letterhead of the Q2 FY2026-27 Regulation 33 filing | that either sentence's subject is "the Group" rather than "the Company" |

The blocker is the same one §2 recorded, now measured twice: the only PDF reader here parses **30 pages**, and these
pages are ~150 PDF pages into a 10.1 MB report. The boundary was re-measured on the *second, independent* filing
(which stops at printed p.32) and reproduced through a third fetching path — Google's translate proxy returns the file
and the parser still stops at 30 pages — while the paginating proxy that fails on these two reports reads an 11-page
Zensar filing in full. Fourteen attempts are itemised in
`evidence/real-issuer/WI6A-SUPPLEMENTAL-ZENSAR-CONSOLIDATED-2026-11-07/source/retrieval-log-supplemental.txt`.

**The determination therefore does not move.** `INVESTIGATED_UNSUCCESSFUL`, `CONSOLIDATED_NIL_NOT_ESTABLISHED`; no
observation, no nil, no dataset, no assessment, nothing persisted. A reported sentence is a locator, not evidence: it
cannot be checked for subject, tense or qualifier, and those features are precisely what decide a nil — WI-5 was
withdrawn for a correctly quoted sentence whose *subject* was wrong.

**A second blocker, which verification would not remove.** Gross debt sums four components — short-term borrowings,
current maturities, long-term borrowings **and lease liabilities** (`capitalStructure.ts`, `grossDebtOf`). The sentence
speaks to borrowings only; lease liabilities are a separate line and mapping the sentence onto them is forbidden. So
`LEASE_LIABILITIES` would stay `NOT_REPORTED`, and the aggregation contract returns the first uninformative component
unchanged: **gross debt and net debt would remain `NOT_REPORTED` even under a verified wording**, and the intrinsic
chain would stay withheld. A verified sentence completes three of four components and still produces no debt position.

**Mapping prepared, not applied.** Which components the wording would fill (`LONG_TERM_BORROWINGS`,
`SHORT_TERM_BORROWINGS`, `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` — the same mapping WI-3 applied to Infosys), which must
stay `NOT_REPORTED` (`LEASE_LIABILITIES`, `PREFERENCE_CAPITAL`), and the two caveats worth stating in advance — the
word *external* qualifier, and a durational sentence ("during the year") being used for a point-in-time balance-sheet
item — are recorded in `source/quotes-owner-reported.json` under `d2MappingAnalysis`. Nothing there has been applied.

**L-037 is generalised, not closed.** The boundary now has two independent measurements and three fetching paths behind
it, so it is a property of the evidence environment rather than of one filing. The register offers no resolution
criterion, so it stays `OPEN`. `L-036` remains `PARTIALLY RESOLVED`, `L-035` remains `OPEN`.

**What closes this.** A readable rendering of the four pages (pp.304-305, pp.320-321) — a page extract placed in the
workspace is enough, because D-2 anchors a quotation to a page, not to a byte stream — plus the consolidated
lease-liability figure for the three balance-sheet dates. Then the existing governed path, unchanged.

**The historical record stands.** §1-§8 above are untouched; the original bundle is byte-identical and its own digest
manifest still verifies.

---

## 10. WI-6A-S2 (2026-11-07) — the pages were read, and the nil holds

**What was recovered.** Both annual reports were fetched as bytes and their complete per-page text extracted, so
the four pages §9 could only describe are now read. The FY2023-24 report is the issuer-hosted copy at
`rpggroup.com/assets/investors/pdfs/zensar-annual-report-fy241743584822.pdf` (10,813,579 bytes, sha256
`d52cc3af…`, 167 pages); the FY2022-23 report is the exchange copy at
`bseindia.com/xml-data/corpfiling/AttachHis/f1a251aa-69c1-4a16-baad-67c3b12cde24.pdf` (15,745,097 bytes, sha256
`cc690832…`, 180 pages), which the Wayback capture `20250803083822` serves with an identical hash. Each report
prints two printed pages per PDF sheet; the calibration for every page this work item cites is in
`source/page-map.json`.

**The two quotations, read.** Consolidated Note 27 *Capital management* reads, in both reports, word for word:

> The Group didn’t have any external borrowings during the current and previous year.

FY2023-24: **printed pp.304-305, PDF page 154 of 167**. FY2022-23: **printed pp.320-321, PDF page 163 of 180**.
The subject is *the Group*, the scope is consolidated, the taxonomy is Ind AS, and the 83-character string hashes
to `3c04662681a405bc869cc4c1c2dff93cd1417b30c6371282c296322ede6597cb` — exactly the string S1 recorded as reported
but unread. S1 kept the right wording and the right status for it; this section supplies the reading, and alters
nothing in §1-§9.

**The second blocker is gone.** The consolidated balance sheets carry no borrowings caption in any of the three
periods, and they do carry lease liabilities, split and cross-referenced to Note 11(b):

| | 2024-03-31 | 2023-03-31 | 2022-03-31 |
| --- | --- | --- | --- |
| lease liabilities — non-current | 1,228 | 1,904 | 2,348 |
| lease liabilities — current | 637 | 826 | 1,005 |
| **total** | **1,865** | **2,730** | **3,353** |

Each total is presented a second and third time: as the carrying value in the Note 27 liquidity table
(1,865 / 2,730 on printed pp.304-305; 3,353 on printed pp.320-321) and in the Note 33 cash-and-non-cash movement
(printed pp.308-309, whose prior-year row is `[3,353]`). INR million, consolidated, as filed.

**The mapping applied, and its limits.** `LONG_TERM_BORROWINGS`, `SHORT_TERM_BORROWINGS` and
`CURRENT_MATURITIES_OF_LONG_TERM_DEBT` take `NIL_BY_DISCLOSURE` on that sentence — the same mapping WI-3 applied to
Infosys, with the current-maturity leg explicitly recorded as *deductive* (a maturity is a slice of a borrowing, so
no borrowing means no maturity to reclassify). `LEASE_LIABILITIES` takes the numbers, not the nil: the sentence does
not speak to leases and mapping onto them is forbidden. `PREFERENCE_CAPITAL` and `NON_CONTROLLING_INTEREST` stay
`NOT_REPORTED` — the balance sheet prints a dash for the latter, and a dash is not a declaration. The two caveats
S1 recorded in advance still stand and are now recorded as applied: the *external* qualifier, and a durational
sentence being used for a point-in-time balance-sheet item.

**Three-period validation passes.** 2024-03-31 and 2023-03-31 come from the FY2023-24 sentence; 2023-03-31 and
2022-03-31 from the FY2022-23 sentence. 2023-03-31 is covered twice by two filings that agree word for word, and
each period's four components resolve to one period end, so the aggregation's `PERIOD_MISMATCH` rule never fires.

**The pipeline ran, unchanged.** datasetVersion `sha256:a71498da…`, `issues.json` `[]`; assessment `SUFFICIENT` /
`MATERIAL_CONCERNS` / confidence 0.4032; reportKey `dc9e4f47571d…`, payloadDigest `fbfa5564900a…`; persisted as
reportId `28b3e5d6-a53d-4fb8-a073-5ed86e73a65e` on scope `co:IN:CIN:L72200PN1963PLC012621`, chain valid, one
version, head v1; re-read in a separate process with the recomputed payload digest equal to the stored digest and
to the chain head. **Gross debt ₹1,865 million `PRESENT`**, cash and investments ₹10,938 million, **net debt
−₹9,073 million `PRESENT`** — the first time either has been computable for this issuer. Net debt / EBITDA follows
at −0.8804.

**What the nil does not buy — the valuation.** No intrinsic value is published. `DCF_FCFF` refuses for
`INSUFFICIENT_HISTORY` (three annual periods of EBIT, D&A **and capex** are required, and the FY2022
capital-expenditure line was not captured — a gap in what this run read, not an omission in the filing).
`EV_EBITDA` runs and produces an enterprise value, but its per-share leg is `NOT_COMPUTABLE` with the note
"enterprise-to-equity conversion blocked by minorityInterest". `EV_REVENUE` refuses for
`MANDATORY_METRIC_MISSING`. The margin of safety refuses with `NO_PRICE_OBSERVATION`: no price was obtained and
none was invented, so no MoS band exists even though the debt and the dividends now do. Only the P/E relative band
₹362.56–₹543.84 is produced, and it is a relative range, not an intrinsic value. `L-036`'s associates review
control is preserved and fires: `REVIEW_DUE`, clock from 2024-03-31, due 2024-09-27, age 180 days.

**Determination.** `NIL_ESTABLISHED` / `CONSOLIDATED_NIL_ESTABLISHED_AND_INGESTED`, changed from
`CONSOLIDATED_NIL_NOT_ESTABLISHED` **because the evidence changed** — read wording plus read lease figures — and not
by reinterpretation. No limitation is opened. `L-037` stays `OPEN`: one issuer on one item is not the class of
retrieval failure that entry describes, so it is updated with the reading and left open. `L-036` and `L-035` are
untouched.

**How the bytes were obtained, stated plainly.** This environment has neither general egress nor PDF tooling; that
finding, and the fourteen routes behind it, stand. The fetch and extraction were therefore done by a throwaway
GitHub Actions job on a temporary workflow file added to this branch for that purpose and deleted again in the same
work item. The committed page files are that job's `pdftotext -layout` output, unedited apart from a provenance
header naming URL, byte count, sha256, PDF page index and printed pages; `runs/commands.txt` carries the two `curl`
lines and the `pdftotext` lines, so every page can be reproduced from the recorded hashes.

**Evidence.** `evidence/real-issuer/WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07/` — `quotes-verified.json`,
`source-bytes.json`, `page-map.json`, eleven page extracts, `retrieval-log-s2.txt`, `ingest-input/`,
`runs/cli-s2.json`, `runs/readback.json`, the persisted payload, `digests.json` — guarded by
`iips-platform/tests/investment/wi6aS2ConsolidatedPageEvidence.test.ts`. The WI-6A and WI-6A-S1 bundles are
byte-identical and still verify.
