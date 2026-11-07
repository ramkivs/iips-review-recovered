# IIPS v3.0 — IID Work Item 8: Industrials, and the first issuer whose gross debt resolves

**Record ID:** `IIPS-V3-IID-WI8-INDUSTRIALS-KEC-2026-11-07`
**Work item:** WI-8 — real-issuer validation in the Industrials sector (IRR scope only)
**Date:** 2026-11-07
**Baseline:** `6575d68fbe5e3ef4951063d9886b3192ae9c0089` (the verified merge of PR #504, which closed WI-7)
**Sector:** Industrials · **Issuer:** KEC International Limited · **Outcome:** validated end to end,
**no intrinsic value and no margin of safety**, stage `G2_PARTIAL`, two new limitations (`L-039`, `L-040`) — `L-039`
still `OPEN`, `L-040` **found here and corrected the same day** — one withheld method, one blocked bridge, all of it
published rather than filled.

---

## 1. What was asked, and what is claimed

The brief asked for one Indian listed Industrials issuer, validated end to end through the existing governed pipeline:
primary-source acquisition and provenance, three consecutive audited consolidated periods, extraction with
reconciliation, ingestion and validation, sector eligibility and method availability, financial assessment, the
debt/equity bridge, applicable valuation methods, confidence, limitations, governed persistence, a separate-process
readback, and dataset/source/payload/chain digests — with D-2 intact, no policy change, no new persistence mechanism,
and no manufactured value, margin of safety, debt figure or nil declaration.

**Claimed.** All of that was done, and the pipeline's two refusals are the substantive result: on a filing that is
fully read, fully audited and fully legible, **gross debt resolves for the first time in this programme (₹5,377.76
crore)** while **net debt does not**, because the cash side of the enterprise-to-equity bridge requires a
current-investments line this balance sheet does not print. Consequently `DCF_FCFF` computed an enterprise value and
refused every per-share leg, `EV_EBITDA` reported `CAPITAL_STRUCTURE_INCOMPLETE`, `EV_REVENUE` was withheld for a
missing mandatory metric, `intrinsic` is `null`, and the margin of safety refuses with `NO_PRICE_OBSERVATION`.

**Not claimed.** No CI result is asserted that a real run did not produce; no valuation, MoS, debt value or nil
declaration is invented; no earlier bundle, policy parameter, validator or persistence mechanism is changed.

## 2. Sector and issuer selection

### 2.1 Why Industrials

Industrials is the sector whose governed matrix is entirely enterprise-value based — `DCF_FCFF` (PRIMARY),
`EV_EBITDA` (SECONDARY), `EV_REVENUE` (CROSS_CHECK, mandatory metric `IN_BOOK_TO_BILL`) — and which declares **no
`PE_RELATIVE`** (`iips-platform/src/investment/coverage/methodMatrix.ts`, L67–71). It therefore tests the one thing
Consumer could not: whether the debt/equity bridge, and not the earnings multiple, can be exercised on a real filing.
Choosing it was also a deliberate stress test, because an Industrials balance sheet is where borrowings are most likely
to be presented in a shape a four-line bridge cannot accept.

### 2.2 Rejected issuers, and why

| Candidate | Rejection |
|---|---|
| Larsen & Toubro | annual-report URLs returned HTTP 404; no primary bytes |
| Thermax | only one annual report reachable; three consecutive periods unobtainable from primary sources |
| ABB India | host unreachable (no HTTP response) |
| Cummins India | HTTP 403 |
| Bharat Forge | HTTP 403 |
| Siemens India | no annual-report links in server-rendered HTML |
| AIA Engineering | no annual-report links in server-rendered HTML |

### 2.3 Why this issuer

KEC International was selected because its **Note 30** decomposes current borrowings into demand loans, other
short-term borrowings, financial-institution commercial paper *and* current maturities — the exact four-component shape
the governed bridge wants — while its balance sheet simultaneously omits a current-investments line. That combination
exercises both halves of the bridge on one issuer. Two consecutive annual reports were fetched byte-verified; the third
year comes from a comparative column, and that is stated wherever it is used.

**The selection was not made to obtain a nil.** No nil was declared: the run publishes one blocked bridge, one withheld
method and one unavailable operating metric. The issuer's operating cash flow is *negative* in the newest year and the
quality verdict says so.

## 3. Identity — a filing fact, with one gap left open

| Identifier | Value | Verification |
|---|---|---|
| CIN | `L45200MH2005PLC152061` | FY2025-26 report PDF p.119 (Note 1, General Information) |
| ISIN | `INE389H01022` | FY2025-26 report PDF p.107 (printed 210-211) |
| Exchanges | BSE Limited and NSE | same page |
| NSE symbol | `KEC` | NSE's own `get-quotes/equity?symbol=KEC` payload, 2026-11-07 (`symbol: "KEC"`, `companyName: "KEC-International-Limited"`) |
| BSE scrip code | **not established** | no filing prints it; BSE returned a 16,912-byte JavaScript shell with no company content |

The listing map carries **one** leg — NSE `KEC` — and its `sourceRef` says in terms that (a) the identifier window is an
operator record, (b) the NSE corroboration is the exchange's own payload, and (c) the BSE leg is absent because it could
not be verified, not because the shares are unlisted. Inventing `532714` to make the identity look symmetric is exactly
the failure mode this programme rejects.

## 4. Coverage and provenance

| Period end | Column | `filingRef` | `filedAt` |
|---|---|---|---|
| 2026-03-31 | FY2025-26 report, current | `KEC-INDAS-CONSOL-FY26-AR` | 2026-05-16 (verified at PDF p.115) |
| 2025-03-31 | FY2025-26 report, comparative | `KEC-INDAS-CONSOL-FY26-AR-COMPARATIVE` | 2026-05-16 (same block) |
| 2024-03-31 | FY2024-25 report, comparative | `KEC-INDAS-CONSOL-FY25-AR-COMPARATIVE` | 2025-05-16 (carried in the dataset; that report's signature block is not among the committed extracts) |

Auditor: Price Waterhouse Chartered Accountants LLP (FRN `012754N/N500016`, Sumit Seth M.No. `105869`, UDIN
`26105869EWAMYH2371`, Mumbai, 2026-05-16 — signature block at PDF p.115), opinion on the **consolidated** statements at
PDF p.111; framework Ind AS (PDF p.120). The FY2023-24 report is a **404** and is not used. Fourteen verbatim page
extracts carry a nine-line provenance header each (source PDF, bytes, sha256, URL, PDF page, printed pages, extractor,
whitespace-normalisation statement); `source/page-map.json` digests them; `ingest-input/data-extraction.json` maps every
ingested figure to the page it is printed on, `REPORTED` or `DERIVED`, with the arithmetic for the derived rows.

## 5. D-2 in a new sector

No cell in the dataset is a nil. Nothing on the fifteen pages read declares borrowings, leases, current investments,
non-controlling interest or preference capital to be nil.

**The one representation decision, stated.** The consolidated balance sheet prints one current-borrowings line
(`4,441.86` / `3,342.64` / `3,552.27`) and Note 30 decomposes it: section I `2,638.96`, section II `1,122.54`,
financial-institution commercial paper `444.76`, section III current maturities `235.60` — total `4,441.86`. The dataset
records the **partition**: `SHORT_TERM_BORROWINGS = 4,206.26` and `CURRENT_MATURITIES_OF_LONG_TERM_DEBT = 235.60`, which
add back to the printed line to the paisa. Declaring the printed total in `SHORT_TERM_BORROWINGS` *and* filling section
III would count ₹235.60 crore twice; declaring the total and leaving section III blank would say the filing does not print
current maturities, which it does. The partition is the only representation that is both complete and non-duplicating,
and every component of it is printed.

**Absences stay absences.** `CURRENT_INVESTMENTS` is `NOT_REPORTED` (no such line exists; Note 10's single non-current
investment is marked `*`, which the page defines as "less than rounding off norms", and that sub-rounding mark is not
converted into a nil); `NON_CONTROLLING_INTEREST` and `PREFERENCE_CAPITAL` are `NOT_REPORTED` (no line, no note — the
"100 % preference shares" sentence on PDF p.54 is a *subsidiary holding*); the FY2024 materials line was not read and is
blank rather than back-solved. Business acceptances (`2,120.74` / `1,507.27`) are a separate balance-sheet line and are
**not** inside borrowings: Note 30's total equals the borrowings line and excludes them.

## 6. The governed run

```
datasetVersion  sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab
issues          []                       periods 3 (37 reported + 6 derived items each)
Industrials     G2_PARTIAL  usable 2  withheld 1  statement coverage 100 %  metric coverage 0 %
adequacy        SUFFICIENT  required-field coverage 100 %  missingFields []
identity        RESOLVED via ISIN        scope co:IN:CIN:L45200MH2005PLC152061
assessment      SUFFICIENT / MATERIAL_CONCERNS / confidence 0.3199
reportKey       15b68ca53f900918b1953f53119ac90f1b9ec4b30fc325a4b4d259b71991712e
reportId        head v1 = 85809cbd-895e-4c9e-b2fc-580fc53fb1c2   chain valid, 1 version
inputDigest     sha256:513993f2eb1de1ab2bf67d17a8e96fc062a971f484d594f4fab54a4e29cdf22b
payloadDigest   sha256:4f89f0ec514890f30bce1960d4a9e8302fad9ddfeb28c13bbc4f22b59072e351  (52,357 bytes)
idempotency     second run: compare "content and input identical" -> persist "UNCHANGED (no write)"
readback        separate process: recomputed digest == stored == chain head
```

### 6.1 The debt and equity bridge

| Component | ₹ crore | Presence |
|---|---|---|
| short-term borrowings | 4,206.26 | `PRESENT` |
| current maturities | 235.60 | `PRESENT` |
| long-term borrowings | 661.37 | `PRESENT` |
| lease liabilities | 274.53 | `PRESENT` |
| **gross debt** | **5,377.76** | **`PRESENT`** |
| cash and cash equivalents | 411.26 | `PRESENT` |
| current investments | — | `MISSING: NOT_REPORTED` |
| **cash and investments** | — | `MISSING: NOT_REPORTED` |
| **net debt** | — | `MISSING: NOT_REPORTED` |
| minority interest / preference capital | — | `MISSING: NOT_REPORTED` |
| associates / JV | — | `NOT_COMPUTABLE: NOT_REPORTED` (`L-036`, `REVIEW_DUE` from 2026-09-27) |

WI-7's Consumer issuer could not close the **debt** side (`L-038`: the current-maturity component carried nothing). KEC
closes it. What it cannot close is the **cash** side: `cashAndInvestments = sum([cash, currentInvestments])` and the
filing prints no current-investments line, so the sum refuses and net debt with it. This is `L-039`, and it is the
binding constraint on everything downstream.

### 6.2 What computed, and what each refusal says

| Item | Outcome |
|---|---|
| `DCF_FCFF` | applicable; FCFF base ₹918.42 crore, WACC 10.68 %, g 4.00 %, 5-year horizon; every per-share leg `NOT_COMPUTABLE` — *"enterprise-to-equity conversion blocked by netDebt"* |
| `EV_EBITDA` | not applicable — `CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable` |
| `EV_REVENUE` | withheld — `MANDATORY_METRIC_MISSING: IN_BOOK_TO_BILL` |
| `PE_RELATIVE` | **not declared for Industrials at all** — the brief's P/E requirement is unsatisfiable by matrix design, and no policy was changed to satisfy it |
| `intrinsic` | `null` |
| margin of safety | refusal `NO_PRICE_OBSERVATION`; band, `mosVsLow`, `mosVsMid` all `NOT_COMPUTABLE: POLICY_INPUTS_UNAVAILABLE` |
| quality | `MATERIAL_CONCERNS` — `CASH_FLOW_EARNINGS_DIVERGENCE` (OCF −68 % of profit), `STALE_STATEMENTS` (period end 221 days before the run clock) |
| risk | `PARTIAL`: 4 applicable, 3 evaluated (1 passed, 2 concerns), 1 `NOT_EVALUABLE` (`FINANCIAL_LEVERAGE`, because net debt is unavailable) |
| moat | `INSUFFICIENT_EVIDENCE` (EBITDA-margin stability 7.02 % vs a 15 % threshold; ROIC–WACC spread positive in 0 consecutive years) |
| dividends | 3 consecutive years paid, payout 0.2417, FCF coverage **−5.07**, `netDebtToEbitda` `NOT_COMPUTABLE`, reconciliation `NOT_COMPARABLE` (schema V1 carries no dividend declaration) |
| confidence | 0.3199 = `0.6 × 0.70 + 0.4 × 0.0833`, then `×0.9` `STALE_DATA` `×0.98` `DILUTION_PROXY` `×0.8` R-4.3 policy-default-WACC |

**The operating metric, explicitly.** Order intake ₹25,280 crore and order book ₹36,267 crore are printed (PDF p.6, p.28)
for FY2026 only. No book-to-bill ratio and no prior-year intake are printed, so `IN_BOOK_TO_BILL` is recorded
unavailable rather than derived by division: one year's intake is not a ratio, and D-2 forbids the inference. That is
what withholds `EV_REVENUE` — the *only* method Industrials loses to a missing metric, and the reason the sector lands on
`G2_PARTIAL` rather than `G1_ENABLED`.

## 7. New limitations

### 7.1 `L-039` (`OPEN`) — the bridge's cash half needs a line a balance sheet need not print

`cashAndInvestments` is the sum of cash and cash equivalents and **current investments**, and the aggregation refuses
unless both carry a number or a quoted nil. A consolidated balance sheet is under no obligation to print a
current-investments line — many Industrials hold bank balances other than cash equivalents instead — so a company that
reports cash, borrowings, leases and current maturities in full can still have no net debt, no enterprise-to-equity
conversion, no enterprise-derived per-share value, no `FINANCIAL_LEVERAGE` risk dimension and no `netDebtToEbitda`. This
is the mirror image of `L-038` on the other side of the same subtraction, and neither entry subsumes the other. No
grammar change is proposed here: the honest resolutions (a governed "no such line" state distinct from `NOT_REPORTED`, or
declaring the cash side complete from a printed footnote) are decisions for the register's owner.

### 7.2 `L-040` (`RESOLVED` 2026-11-07) — the sensitivity grid and the DCF evidence claim substituted zero for unavailable bridge terms

**As found by this run.** Two surfaces published DCF per-share arithmetic that the headline refused:

* `buildSensitivity` (`iips-platform/src/investment/assessment/intrinsic.ts`) evaluated
  `(EV − (netDebt ?? 0) − (minorityInterest ?? 0) − (preferenceCapital ?? 0) + (associatesAndJV ?? 0)) / shares`. On
  this issuer every one of those terms is unavailable, so each `??` substituted **zero** and the grid's base point read
  **₹488.34 per share** — enterprise value over diluted shares with net debt treated as nil.
* Evidence `EV-DCF_FCFF` claimed *"DCF_FCFF produced a per-share value from 3 present input(s)"* and declared
  `supports: valuation.methods[0].output.perShareMid`, which is `NOT_COMPUTABLE`.

Both are the "zero in place of `NOT_REPORTED`" that D-2 forbids, one level up from the dataset: the grid had
re-implemented the enterprise-to-equity bridge inline rather than calling the governed conversion, and the evidence
claim was written from the method's *applicability* rather than from its *output*.

**Corrected the same day, in this work item.** The grid now converts through `equityValueFromEnterprise()` and
`perShare()` — the same governed functions the DCF method's own per-share leg uses — so a per-share cell exists only
where that conversion could compute one. When it refuses, every cell publishes `value: null` and the grid carries
`withheld: { presence: NOT_COMPUTABLE, reason, note }` naming the blocking component; the discounted enterprise value is
retained per cell as `enterpriseValue`, **quarantined diagnostic arithmetic** labelled *"(diagnostic)"* in the rendered
view and never published as a per-share value. The evidence claim now states the refusal, its reason and the blocking
component. A healthy grid serializes in the unchanged `{ waccBps, growthBps, value }` shape, so no committed payload
digest moved — the IX authorized-policy artifact still rebuilds byte-identically.

**On this issuer the corrected grid publishes no per-share value at all**, which is now the same answer the headline
gives: `DCF_FCFF` computes an enterprise value (₹918.42 crore at base) and refuses the conversion, and the grid says so
in nine cells instead of inventing nine numbers. Guard:
`iips-platform/tests/investment/l040ValuationZeroSubstitution.test.ts` (17 tests covering missing net debt, missing
current investments, incomplete capital structure, withheld-grid behaviour, the evidence claim, prevention of
zero-derived per-share output, valid-case preservation, and explicit zero vs unavailable). Full record:
`docs/integration/IIPS_V3_IID_L040_VALUATION_OUTPUT_CORRECTION_2026-11-07.md`.

## 8. Statuses after WI-8

`L-039` **`OPEN`** (new) and `L-040` **`RESOLVED`** (new, corrected 2026-11-07 — the correction is recorded in §7.2 and
in `IIPS_V3_IID_L040_VALUATION_OUTPUT_CORRECTION_2026-11-07.md`; the underlying bridge gap stays open as `L-039`).
`L-038` stays **`OPEN`** — the debt half did not bite here, but
the entry describes issuers that print a single `Borrowings` line and this run produces no evidence about them.
`L-036` stays **`PARTIALLY RESOLVED`** (the `REVIEW_DUE` control fires again; no filed carrying value exists).
`L-035` and `L-037` stay **`OPEN`**; nothing here tests them. `L-034` stays `RESOLVED`. `L-001` is **unchanged**: the
ingest records "1 of 13 sectors measured" in *this dataset*, a dataset-scoped fact, while one Industrials issuer is not
the twelve outstanding sectors of the sector-analytics frame — and the frame's outstanding list still names Industrials,
because nothing in this work item promotes a sector.

## 9. Evidence and guard

`evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/` — `README.md`, `determination-wi8.json`,
`source/source-bytes.json`, `source/page-map.json`, `source/identity-nse-corroboration.json`, fifteen verbatim page
extracts, `ingest-input/` (roster, periods, identity sources, extraction provenance), `runs/` (ingest, generate,
idempotency, chain read, readback, findings, guard test, typecheck, clean clone, CI check), `artifact/assessment-payload-kec-wi8.json`,
`artifact/assessment-payload-kec-wi8-l040-corrected.json`, `determination-l040-correction.json`, `runs/09`–`runs/12`
(the correction run, readback and payload diff) and `digests.json` — guarded by
`iips-platform/tests/investment/wi8IndustrialsKec.test.ts` and
`iips-platform/tests/investment/l040ValuationZeroSubstitution.test.ts`, which together also verify that the WI-3, WI-5,
WI-6, WI-6A, WI-6A-S1 and WI-7 bundles remain digest-unchanged.

`artifact/assessment-payload-kec-wi8.json` is the **original run of record**, kept byte-identical
(`4f89f0ec…`, 52,357 bytes). It is **superseded and not authoritative**: its nine sensitivity per-share cells and its
`EV-DCF_FCFF` claim are the defect this record describes. The corrected payload
`artifact/assessment-payload-kec-wi8-l040-corrected.json` (`fc50c53e…`, 52,760 bytes, same datasetVersion
`0df73ead…`, same reportKey `15b68ca5…`, same inputDigest) is the payload that reflects the shipped code; it differs
from the original in exactly 20 paths (`runs/12-l040-payload-diff.json`): one evidence claim, nine `value → null`
cells each gaining a diagnostic `enterpriseValue`, and one grid-level `withheld` block. Neither payload is a valuation
of the issuer: both refuse one, and the corrected one refuses without publishing a number.

**Tracker.** The master tracker carries this work item at **§16.274**, with no CV-CORR / CHG / V number because WI-8
performed no IPD work and spends no IPD act reference. It follows the WI-4 … WI-7 pattern: one pointer, nothing
reinterpreted, no earlier entry reopened.

**CI.** The repository configures one check for the paths this pull request changes — `CAP-03 Revision 7 IRR-only static
checks` (`Python compile · source/evidence/tracker validation`). This record claims **only** what the run transcript in
`runs/08-ci-check.txt` shows for the head it names. No npm, frontend or IPD CI runs for these paths, and none is claimed.
Local verification is reported separately from CI in the pull request body.

**Hygiene.** The throwaway workflow `.github/workflows/temp-wi8-discover.yml` and the scratch trees
`evidence/real-issuer/_wi8-discovery/`, `_wi8-fulltext/`, `_wi8-cols/` and `_wi8-identity/` were deleted before the pull
request; the temporary readback harness `frontend/.tmp-wi8-readback.ts` was deleted after `runs/readback.json` was
written. No validator, policy parameter, persistence mechanism or historical bundle was modified.
