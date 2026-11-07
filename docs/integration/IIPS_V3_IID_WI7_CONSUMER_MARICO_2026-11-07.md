# IIPS v3.0 — IID Work Item 7: the first real issuer outside Technology

**Record ID:** `IIPS-V3-IID-WI7-CONSUMER-MARICO-2026-11-07`
**Work item:** WI-7 — cross-sector real-issuer validation (IRR scope only)
**Date:** 2026-11-07
**Baseline:** `cfc197105e9d0a0c0a0056ee5bb4a2af1bac98d6` (the verified merge of PR #503, which closed WI-6A)
**Sector:** Consumer · **Issuer:** Marico Limited · **Outcome:** validated end to end, **no intrinsic value**, new
limitation `L-038` opened and left `OPEN`
**Later:** re-read for `L-038` on 2026-11-07 — see §10. This record's payload stays byte-identical and is **superseded**
(not overwritten) by `evidence/real-issuer/WI7-L038-DEBT-COMPLETENESS-2026-11-07/`; `determination-wi7.json` carries
both supersession reasons.

---

## 1. What was asked, and what is claimed

WI-7 asked for the first real-issuer validation outside Technology: pick the strongest next sector, pick an issuer,
read its primary filings, run the existing governed pipeline over three consecutive audited consolidated periods,
persist the artifact, read it back in a separate process, and say what the run does and does not license.

What is claimed: three consecutive audited consolidated periods were read from two hash-identified annual reports,
ingested through the existing grammar, assessed by the existing engine, persisted through the existing store, and
read back by a different process whose recomputed payload digest equals the stored digest and the chain head.

What is **not** claimed: no intrinsic value, no margin of safety, no debt position, no claim that anything is nil,
and no claim about any issuer other than this one. The run refuses three of its four possible per-share figures, and
the reason is a property of the filing, not a defect in the reading.

---

## 2. Sector selection

### 2.1 Why Consumer is the strongest next sector

The governed method matrix (`iips-platform/src/investment/coverage/methodMatrix.ts`) is the authority on what a
sector *considers*. Consumer declares three methods:

| Method | Role | Mandatory line items | Mandatory operating metrics |
|---|---|---|---|
| `DCF_FCFF` | PRIMARY | `REVENUE_FROM_OPERATIONS`, `EBITDA`, `OPERATING_CASH_FLOW`, `CAPITAL_EXPENDITURE`, `TOTAL_EQUITY`, `NET_PROFIT` | **none** |
| `PE_RELATIVE` | SECONDARY | `EPS_DILUTED` | **none** |
| `EV_EBITDA` | CROSS_CHECK | `EBITDA`, `NET_DEBT` | **none** |

Consumer is the **only** sector still unmeasured after Technology whose entire method matrix declares no mandatory
operating metric. That matters because an operating metric is exactly the kind of input a filing does not supply in
governed form: every other sector's matrix contains at least one method that cannot become applicable without an
operator-entered or vendor observation. A cross-sector validation on such a sector would test the pipeline's ability
to be *withheld*, not its ability to compute.

Consumer also carries a documented policy exclusion — `EV_REVENUE` is excluded for the sector ("margin heterogeneity
across staples, discretionary and luxury makes a revenue multiple uninformative") — so the run exercises the
exclusion path as well as the compute path.

### 2.2 Rejected sectors, and why

| Sector | Why not now |
|---|---|
| Banking | `RESIDUAL_INCOME` needs `BM_NIM`, `BM_GNPA`, `BM_CET1`; the sector's exclusion list removes `DCF_FCFF` and `EV_EBITDA`. No method can become applicable from statements alone. |
| Insurance | `P_EMBEDDED_VALUE` needs `IM_EMBEDDED_VALUE`, `IM_VNB_MARGIN`, `IM_SOLVENCY` — none is a statement line. |
| Capital Markets | `P_AUM` needs `CM_AUM`, `CM_COST_TO_INCOME`; `DCF_FCFF` is excluded for the sector. |
| Utilities | `REGULATED_ASSET_BASE` needs `UM_RAB`, `UM_ALLOWED_ROE`; `PB_RELATIVE` is excluded. |
| Energy | `EV_EBITDAX` needs `EM_LIFTING_COST`; `NAV_RESERVES` needs `EM_RESERVE_REPLACEMENT`; two methods excluded. |
| Materials | `DCF_FCFF` is excluded for the sector; the rest need `MM_RESERVE_LIFE` / `MM_COST_POSITION`. |
| Telecom | `EV_SUBSCRIBER` needs `TL_SUBSCRIBERS`, `TL_ARPU`; `PB_RELATIVE` is excluded. |
| Auto | `EV_REVENUE` needs `AU_CAPACITY_UTILISATION` / `AU_MARKET_SHARE` and is itself excluded for the sector. |
| Healthcare | `EV_EBITDA` needs `HC_OCCUPANCY`, `HC_ARPOB`. |
| Hospitality | `EV_EBITDA` needs `HM_REVPAR`; `PB_RELATIVE` is excluded. |
| **Industrials** | `EV_REVENUE` needs `IN_BOOK_TO_BILL`. **Closest rival**: with a governed order-book source, Industrials becomes the second statement-only sector, and it is the recommended next target. |

### 2.3 Issuer selection, and the issuers not selected

Marico Limited was selected because it satisfied every testable criterion on bytes actually obtained:

1. three consecutive audited consolidated periods inside two documents (FY2023-24 carries FY2024 and FY2023;
   FY2022-23 carries FY2022);
2. both documents served directly by the issuer over HTTPS with stable, hash-verifiable bytes;
3. consolidated statements prepared under Ind AS, audited by a named firm, printed with a comparative column;
4. a capital structure that is *not* trivial — real borrowings, `IND AS 116` leases, a reported non-controlling
   interest, goodwill and intangibles — so that D-2 and the equity bridge are genuinely exercised;
5. category leadership, so the result reads as evidence about the sector rather than about an obscure issuer.

Considered and **not** fetched: Hindustan Unilever, Nestlé India, Dabur India, Godrej Consumer Products, Britannia
Industries, Colgate-Palmolive (India). **No page of any of their filings was read in this work item, and no finding
about any of them is asserted here.** They were set aside because the work item's evidence budget was spent on a
candidate that satisfied every criterion rather than on a survey; that is an operator reason, and it is recorded as
one.

**The selection was not made to obtain a nil.** Marico's borrowing disclosure turned out to be the thing that blocks
the bridge, which is the opposite of a convenient selection.

---

## 3. Identity — a filing fact, not an operator assertion

| Fact | Value | Locator |
|---|---|---|
| Legal name | Marico Limited | FY2023-24 AR, PDF p.115 (printed 226-227), BRSR item I-2 |
| CIN | `L15140MH1988PLC049208` | same page, item I-1 |
| ISIN | `INE196A01026` | same AR, PDF p.159 (printed 314-315), Listing Details |
| BSE scrip code | `531642` | same page, Listing Details |
| NSE symbol | `MARICO` | same AR, PDF p.5, About page (`Marico (BSE 531642, NSE "MARICO")`) |
| Auditor of the consolidated statements | B S R & Co. LLP (FRN 101248W/W-100022) | same AR, PDF p.169 (printed 334-335) |
| Basis and taxonomy | consolidated, Indian Accounting Standards (Ind AS) | same AR, PDF p.169-170 |

No listing or admission date is asserted: no page read states one. The listing-identifier window in the roster
(`effectiveFrom 2021-04-01`) is an **operator record** and is labelled as such in `sourceRef`, exactly as WI-6A did.

---

## 4. Source bytes and the three-period coverage

| Document | URL | Bytes | sha256 | Pages |
|---|---|---|---|---|
| Integrated Annual Report 2023-24 | `marico.com/investorspdf/Marico_Annual_Report_FY24.pdf` | 21,087,675 | `03cb0db78289cdda4ffcd4b4e9f14f3b444a52a4fd64d6265578180fa9857595` | 259 |
| Integrated Annual Report 2022-23 | `marico.com/investorspdf/Marico_Annual_Report_FY23.pdf` | 28,505,144 | `0f41759d903f2f9e1185d1bd52228a1653592583ca729abe75edf430b9332b0a` | 224 |
| Integrated Annual Report 2021-22 | `marico.com/investorspdf/Marico_Annual_Report_FY22.pdf` | 27,915,655 | `cd8855e5f03ce8c6081684586a24e3e533bdae3716a989ef7c11e7db8237a993` | 200 |

The FY2021-22 report is fetched and hashed but **no figure is taken from it**: the FY2021-22 audited column is read
from the FY2022-23 report's comparative, which is the document carrying that year's auditor's report. All three
documents returned HTTP 200; two candidate FY2022-23 URLs returned HTTP 404 and are recorded rather than dropped.

Each PDF page is a printed sheet carrying two printed pages; every citation in this record gives **both** the PDF
page and the printed numbers, and the calibration is stored per page in `source/page-map.json`.

The FY2023-24 report **reclassifies** the prior year's investing and financing sections against the FY2022-23
report's own FY2023 column — investing `(865)` vs `(929)`, net increase in cash `(69)` vs `(133)`, with operating
cash flow `1,419` in both. Each row is taken from **one** statement; nothing is averaged across the two printings,
and the difference is recorded in `ingest-input/data-extraction.json` under `reclassification`.

---

## 5. D-2 in a new sector — the grammar is not used, and a dash is still not a number

No cell in this dataset is a `NIL:` cell. Nothing on the twelve pages read declares borrowings, leases, preference
capital or non-controlling interest nil, so the nil grammar has **zero** uses here. That is the honest outcome for a
company that carries real debt.

| Item | What the filing prints | Treatment |
|---|---|---|
| `SHORT_TERM_BORROWINGS` | `383` / `473` / `345` (balance sheet, Note 13(a) II) | `PRESENT` |
| `LONG_TERM_BORROWINGS` | dash for FY2024 and FY2022; `2` for FY2023 (Note 13(a) I) | `NOT_REPORTED`, `2`, `NOT_REPORTED` |
| `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | no such line in the balance sheet, Note 13(a) or Note 13(b) | `NOT_REPORTED`, all three periods |
| `LEASE_LIABILITIES` | non-current `104` + current `41` = `145`; the financing reconciliation prints `145` | `PRESENT` |
| `PREFERENCE_CAPITAL` | no preference share capital line (Note 12(a) is equity share capital) | `NOT_REPORTED`, all three periods |
| `NON_CONTROLLING_INTEREST` | `337` / `157` / `57`; Note 12(c) closes at `337` | `PRESENT` |

The dash reading is the one this register already fixed at §17.14 for the same glyph: **a dash is neither a number
nor a quoted declaration**. It is not upgraded to a nil, and it is not silently typed as a zero.

**One consequence is recorded rather than smoothed.** The component resolver takes the newest period that carries
information, so the published `longTermBorrowings` is `₹2 crore` with `periodEnd 2023-03-31` — a **prior-year**
figure carrying its own period label, not a current one. The payload says so because the component says so.

---

## 6. The governed run

| Step | Result |
|---|---|
| ingest | datasetVersion `sha256:04c96303e269108803b2a5efef565eae2940ecb649b4f34998d01106a9cc6bd0`; `issues.json` `[]` |
| coverage | Consumer **G1_ENABLED**, three annual periods, all three methods `AVAILABLE`, statement coverage 91.7 %, operating-metric coverage 100 %; outstanding sectors unchanged at twelve |
| adequacy | **`SUFFICIENT`** (required-field coverage 100 %); statement coverage balance sheet 76.19 %, cash flow 88.89 %, profit and loss 68.18 % |
| assessment | **`SUFFICIENT` / `MATERIAL_CONCERNS`**, confidence **0.3306** (data 0.85, model 0.125; caps `STALE_DATA`, `DILUTION_PROXY`, `POLICY_DEFAULT_WACC` 0.20, `POLICY_DEFAULT_MULTIPLE` 0.15, additive and capped once at 0.35) |
| compose | reportKey `01af3264e085…`, payloadDigest `3fd27a98313d853704e864df6d1228566053be43f49c4d2c011371615ced2343` |
| validate | scope `co:IN:CIN:L15140MH1988PLC049208` (ISSUER) |
| chain-head | no chain for this scope |
| compare | `SKIPPED` — no head to compare against |
| persist | **`CREATED`**, one version, head v1 |
| verify | chain valid, 1 version, `reportId f110608f-f63b-4e7d-95bc-ad4f6222c17a` |

**Separate-process readback.** A second process loaded the governed store, resolved the owner carrier, read the head
version and its payload, and recomputed the digest from the payload text: recomputed `sha256:3fd27a98…2343` equals
the stored digest and the chain head, `digestMatch: true`, `chainLength: 1`.

### 6.1 What computed

| Figure | Value | Source |
|---|---|---|
| EBIT | 20,100,000,000 | derived: profit before tax 19,370,000,000 + finance costs 730,000,000 |
| D&A / capex | 1,580,000,000 / 1,530,000,000 | consolidated cash-flow statement, PDF p.176 |
| FCFF base (3-year mean) | 13,541,622,333 | engine, `DCF_FCFF` |
| WACC / terminal growth / horizon | 10.68 % / 4.00 % / 5 years | authorised policy defaults, declared in the payload |
| P/E relative band | **₹181.69 / ₹227.11 / ₹272.54** | normalised EPS 10.3233 × policy-default multiple 22 |
| Cash and investments | 4,870,000,000 `PRESENT` | cash 2,280,000,000 + current investments 2,590,000,000 |
| Lease liabilities | 1,450,000,000 `PRESENT` | balance sheet, Note 13(a) |
| Minority interest | 3,370,000,000 `PRESENT` | balance sheet, Note 12(c) |

### 6.2 What did not compute, and the exact reason each one gives

| Figure | Result | Reason as published |
|---|---|---|
| `grossDebt` | `MISSING` / `NOT_REPORTED` | the current-maturity component carries no information in any period, so the aggregation returns the blocking observation |
| `netDebt` | `MISSING` / `NOT_REPORTED` | depends on gross debt |
| `DCF_FCFF` per-share legs | `NOT_COMPUTABLE` | *"enterprise-to-equity conversion blocked by netDebt"* |
| `EV_EBITDA` | `applicable: false` | `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable` |
| `EV_REVENUE` | `NOT_APPLICABLE` | Consumer policy exclusion: margin heterogeneity |
| `intrinsic` | `null` | two applicable methods have no per-share output |
| margin of safety | `NO_PRICE_OBSERVATION` | no price was obtained, and none was invented |

The distinction the payload keeps — *available* at coverage time, *withheld* at runtime — is the point of the run:
all three Consumer methods are `AVAILABLE` on this dataset (the coverage question), and `EV_EBITDA` is then withheld
by the capital structure (the valuation question). Coverage is not a valuation.

`L-036`'s associates review control fires **`REVIEW_DUE`** again — clock from 2024-03-31, due 2024-09-27, age 180
days, treatment `POLICY_ZERO` under schema V1. It fires here for the same reason it fired for Zensar: the schema
cannot carry an associates/JV carrying value, and no figure for one was read.

---

## 7. New limitation — `L-038` (`OPEN`)

**The enterprise-to-equity bridge needs three borrowing components that a consolidated balance sheet need not print.**

> **Narrowed late on 2026-11-07 (see §10).** A re-read of the same reports found the current-maturities caption after all,
> in Note 13(a) I (*"Within one year (Current maturities of long term debt)"*), printing `0` for FY2023 and dashes for
> FY2024 and FY2022. That closes one component at one period end and changes nothing about the outcome: `L-038` stays
> `OPEN`, now with two named blockers — no period at which all four debt components coexist with that period's cash, and
> `PREFERENCE_CAPITAL` `NOT_REPORTED` (authorised preference shares exist; issued preference shares are not printed and
> are not declared nil). The sentence below about "no current-maturity row anywhere" is retained as what this work item
> concluded; §10 is the correction.

Gross debt is the sum of long-term borrowings, short-term borrowings, current maturities of long-term debt and lease
liabilities, and **every** component must carry information — a number or a quoted nil. Marico's consolidated balance
sheet supplies one current `Borrowings` line, a dash in the non-current row, and no current-maturity row anywhere.
The result is that a company which reports cash, leases, minority interest and its borrowings in full still gets **no
debt figure at all**, and every enterprise-derived per-share figure is withheld.

This is not `L-036` (which is about an associates term the schema cannot hold) and not `L-037` (which is about pages
that could not be read). It is a gap in what the *bridge* requires of a filing, and it is the second structural
reason a real issuer can be fully read and still not valued. It is opened **`OPEN`** and no grammar change is proposed
here: the honest options — a governed representation of a filed dash with a distinct provenance grade, or an optional
"total borrowings as filed" component with an explicit incompleteness flag — are decisions for the register's owner,
not for a work item that is meant to validate, not extend, the pipeline.

---

## 8. Statuses after WI-7

| Entry | Status | Change |
|---|---|---|
| `L-001` — 3 of 13 sectors measured | `OPEN` | **unchanged**: the sector-analytics frame is not this milestone's, and one Consumer issuer is not twelve sectors. The ingest's own coverage record is dataset-scoped ("1 of 13 sectors measured" *in this dataset*). |
| `L-034` | `RESOLVED` (IX) | untouched |
| `L-035` — the nil declaration link is documentary | `OPEN` | untouched — no independent evidence about it was produced |
| `L-036` — associates/JV policy zero | `PARTIALLY RESOLVED` | untouched; the review control fires again |
| `L-037` — deep-page retrieval cap | `OPEN` | untouched |
| `L-038` | **`OPEN`** | **opened by this work item** |

No policy, no valuation parameter, no D-2 semantic, no persistence mechanism and no historical artefact is changed
by WI-7. The only files it writes outside this evidence bundle and its guard test are this record and the register
section that cites it.

---

## 9. Evidence and guard

`evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/` — `README.md`, `determination-wi7.json`,
`source/source-bytes.json`, `source/page-map.json`, `source/identity-verified.json`, twelve verbatim page extracts,
`ingest-input/` (roster, periods, identity sources, extraction provenance), `runs/` (ingest, generate, readback,
commands, guard test, typecheck, clean clone, CI check), `artifact/assessment-payload-marico-wi7.json`, `digests.json` — guarded
by `iips-platform/tests/investment/wi7ConsumerMarico.test.ts`, which also verifies that the WI-3, WI-5, WI-6, WI-6A,
WI-6A-S1 and WI-6A-S2 bundles are digest-unchanged.

**Verification actually run**, with the transcripts committed beside this record:

* `runs/03-guard-test.txt` — the WI-7 guard file plus the six earlier WI guard files: **104 tests, 104 pass, 0 fail**.
  (WI-7's own file is 27 tests in 4 suites; the rest belong to WI-4 … WI-6A-S2 and are run to show the new sector did
  not disturb them.)
* `runs/04-typecheck.txt` — `tsc --noEmit` on the package project (exit 0) and, because `tsconfig.json` includes only
  `src/**/*.ts`, a second strict invocation over the guard file itself (exit 0).
* `runs/05-clean-clone.txt` — a fresh clone of the pushed branch: `npm ci`, re-ingest of the committed
  `ingest-input/` into an empty dataset directory reproduces `sha256:04c96303…6bd0`; all 30 digested files re-hash
  clean; the canonical payload re-digest reproduces the chain head `sha256:3fd27a98…2343`; guard tests 104/104; both
  typechecks exit 0.

**Tracker.** The master tracker carries this work item at **§16.273**, with no CV-CORR / CHG / V number because WI-7
performed no IPD work and does not spend the next free IPD act reference quoted at the end of §16.272. WI-4 … WI-6A-S2
were recorded in this register only; §16.273 therefore follows that pattern for the tracker (one pointer, nothing
reinterpreted) rather than reopening earlier entries.

**CI.** One check is configured for the paths this pull request changes — the repository's own `CAP-03 Revision 7
IRR-only static checks` (`Python compile · source/evidence/tracker validation`). It has passed on every head pushed so far — run
`42353056595` (job `128345111486`) on the preceding head, run `42353279839` (job `128345791007`) on head
`d977cf8` — and re-runs on each further push
— and it **passes** on the pull-request head; `runs/06-ci-check.txt` records what GitHub reported. No npm, frontend or
IPD CI runs for these paths, and none is claimed. Making that check green required two content-neutral adjustments,
both recorded rather than hidden: the extract file names carried a `-p1NN` token that the CAP-03 validator reads as a
P-1 artifact path, so they are now `…-pdf-pageNNN.txt`; and `git diff --check` rejected the tabs and trailing blanks of
the raw layout-preserving extraction, so the extracts are whitespace-normalised with the normalisation stated in every
header and no non-whitespace character changed.

---

## 10. Later — the `L-038` re-read, and what it corrected (2026-11-07)

A second pass over the same two audited consolidated reports asked whether the *complete* disclosure set across FY2024,
FY2023 and FY2022 supports a period-aligned four-component debt breakdown, and whether any caption had been missed rather
than truly absent. Full record: register **§17.18**, evidence bundle
`evidence/real-issuer/WI7-L038-DEBT-COMPLETENESS-2026-11-07/`, guard
`iips-platform/tests/investment/l038MaricoDebtCompleteness.test.ts` (25 tests).

**One caption was missed, and it closes one cell.** Note 13(a) I carries *"Within one year (Current maturities of long
term debt)"*: FY2023 prints `0` (PDF p.150), FY2024 and FY2022 print dashes (pp.191, 149). A printed zero is a
qualifying disclosure and maps, so `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` moves from `MISSING` to
**`PRESENT 0 @ 2023-03-31`** — this record's §7 statement that there was "no current-maturity row anywhere" was wrong and
is corrected here. `grossDebt` moves from `MISSING`/`NOT_REPORTED` to **`NOT_COMPUTABLE`/`PERIOD_MISMATCH`**: all four
components exist at 2023-03-31 only, and the FY2024 numbers belong to a different date.

**A second blocker was found behind the first.** Note 12(a) prints a preference class — *Preference shares of ₹10/- each
7 / 65* — but only under *I Authorised share capital*; *II Issued, subscribed and paid-up* prints equity only
(1,29,41,01,828 shares, `129 / 129`) with no preference row and no dash. So `PREFERENCE_CAPITAL` stays `NOT_REPORTED`, and
even a closed debt side would not have produced a per-share value.

**A net-debt figure exists, and is not the governed one.** The FY2022-23 report defines *"Net financial debt … as current
and non current borrowings"* (Note 29, consolidated, PDF p.163) — borrowing-only, no cash subtracted, no leases. Only its
ratio row (0.12 / 0.10) survives layout extraction; the amounts printed at company level (p.209: `59 / 95`, equity
`3,677 / 3,049`, ratio 0.02 / 0.03) belong to a different reporting entity and were shipped for context only. Rejected
mappings, and the reason no number was manufactured anywhere: this record's `determination-l038.json` counterpart in the
new bundle lists all of them.

**What did not change.** The dataset correction is exactly one cell; `cashAndInvestments` is still 4,870,000,000; the DCF
still computes an enterprise value and still withholds every per-share leg; `EV_EBITDA` is still
`CAPITAL_STRUCTURE_INCOMPLETE`; the P/E band is still **₹181.69 / ₹227.11 / ₹272.54**; leverage stays `NOT_EVALUABLE`.
The sensitivity grid degrades from nine published values to nine `null`s with `enterpriseValue` diagnostics and
`withheld` — because those values had used the pre-correction `NCI = 0` substitution, which is `L-040`'s finding, so this
record's grid is superseded on that ground too. `L-040` stays `RESOLVED`; `L-039` is not touched; `capitalStructure.ts`
and every policy constant are byte-identical. This record's payload `3fd27a98…2343` and all 30 of its digested files
are byte-identical and still pass its own guard — superseded, never rewritten.
