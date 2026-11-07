# WI-8 / L-039 — KEC International Limited: the cash side of the enterprise-to-equity bridge

**Work item.** The continuation of WI-8 (Industrials) that investigates `L-039`: the enterprise-to-equity bridge needs a
**current-investments** amount, and KEC International's consolidated balance sheet does not print one.

**Question this bundle answers.** Does the issuer's audited consolidated financial statements disclose a
current-investments amount that would let `cashAndInvestments` and `netDebt` be computed on the existing governed path?

**Answer: no.** The caption is not merely unread — it is **not printed anywhere**, in any of the three periods. The only
`Investments` caption is non-current (Note 10), it carries an amount below the Group's rounding-off norms in all three
years, and the only other liquid captions are Note 17 cash and cash equivalents and Note 18 bank balances other than cash
and cash equivalents — an unpaid-dividend earmarking, a 3-to-12-month bank deposit and margin money. None of those is an
investment, and the bridge excludes all of them by the definition of the two items it subtracts.

**Consequence.** `CURRENT_INVESTMENTS` stays `MISSING: NOT_REPORTED`, `cashAndInvestments` and `netDebt` stay
unavailable, every dependent output stays withheld, and **`L-039` stays `OPEN`**. Nothing is mapped, no zero is
substituted, and no dataset, payload or historical artifact changes: the dataset version is still
`sha256:0df73ead…82ab` and the payload is still `fc50c53e…f370`, re-verified below.

---

## 1. What the statements actually print

Consolidated balance sheet, FY2026 (FY2025-26 report, PDF p.117 / printed pp. 230–231), FY2025 and FY2024 (FY2024-25
report, PDF p.110):

| Block | Captions printed | FY2026 | FY2025 | FY2024 |
|---|---|---|---|---|
| Non-current financial assets | (i) **Investments** (Note 10) | `*-` | `*-` | `*-` |
| | (ii) Trade receivables | 31.45 | 214.93 | 288.34 |
| | (iii) Other financial assets | 65.38 | 66.07 | 61.94 |
| Current financial assets | (i) Trade receivables | 6,474.21 | 5,051.10 | 4,136.62 |
| | (ii) Cash and cash equivalents | 411.26 | 545.69 | 205.10 |
| | (iii) Bank balances other than (ii) above | 100.67 | 110.24 | 68.18 |
| | (iv) Other financial assets | 276.90 | 144.42 | 148.51 |

`₹ crore`, as printed. **There is no “(v) Investments” and no “Loans” caption** in the current block: the Schedule III
current-asset presentation enumerates four financial-asset sub-items, and investments is not one of them.

## 2. The notes, caption by caption

| Note | What it contains | Printed page | Disposition for `CURRENT_INVESTMENTS` |
|---|---|---|---|
| **Note 10 — Investments** | headed **`Non-current:`** only: *Investment in equity shares (at fair value through OCI), Unquoted — 4900 fully paid equity shares of ₹10 each of RP Goenka Group of Companies Employees Welfare Association*; aggregate book value `*`; footnote *“less than rounding off norms adopted by the Group”* | 254–255 | **Rejected.** Wrong caption, non-current, and sub-rounding. There is no current section in the note that carries investments. |
| **Note 17 — Cash and cash equivalents** | balances with banks in current accounts; deposits with original maturity below 3 months; cash on hand; **411.26 / 545.69**; a sentence noting ₹1.54 crore of repatriation restrictions (2025: ₹3.48 crore) | 258–259 | Accepted as `CASH_AND_CASH_EQUIVALENTS` — already ingested, already `PRESENT`. Not an investment. |
| **Note 18 — Bank balances other than cash and cash equivalents** | (i) earmarked balances — unpaid dividend accounts **3.06 / 3.02**; (ii) bank deposits with original maturity >3 months and <12 months **3.20 / 27.48**; (iii) balances held as margin money or security **94.41 / 79.74**; total **100.67 / 110.24** | 258–259 | **Rejected.** Bank balances, not investments; margin money is exactly what R-4.1 excludes from available cash. Mapping it would relabel a restricted balance as a liquid investment. |
| **Note 19 — Other financial assets** | sundry deposits 107.53; interest accrued on fixed deposits 7.59; insurance claims 1.25; mark-to-market gain on forwards and commodity contracts 104.19; contractually reimbursable expenses 63.60; less allowance for expected credit losses 7.26; net **276.90 / 144.42** | 260–261 | **Rejected.** Deposits, accrued interest, insurance claims, derivatives, reimbursable expenses — no investment instrument. |
| **Note 54 — Ind AS 107 classification** | every financial asset by measurement category. Non-current: trade receivables, other financial assets, **non-current investment — investment in equity instruments (FVOCI) `*`**. Current: trade receivables 6,505.66, **cash and bank balances 511.93**, other financial assets (derivatives 1.82 / OTC 67.90 / others 238.09) | 286–287 (FY2026), 270–271 (FY2025/FY2024) | **Rejected.** The instrument-level classification of the whole balance sheet names exactly one investment line, and it is non-current. |
| **Cash-flow statement, investing activities** | capital expenditure; sale-and-leaseback proceeds; sale of PPE; bank balances not considered as cash and cash equivalents | 232–233 | **Corroborates.** No investment purchase or sale line exists either, for either year. |

The FY2024-25 report repeats the same three notes (17–19) at printed pp. 244–245 with the same captions and the same
absence.

## 3. The search was exhaustive, not impressionistic

Every page of both reports — 421 pages — was converted and tested for the strings that would carry this caption
(`NOTE 10`, `NOTE 17`, `NOTE 18`, `NOTE 19`, `current investment`, `non-current investment`, `mutual fund`). The log is
`source/caption-search-log.txt`. The result:

* **no page carries a “Current investments” caption**;
* the string `current investment` appears only inside Ind AS 107 classification tables, where it classifies the
  *non-current* equity investment and the cash and bank balances;
* the only `mutual fund` hits are the **shareholding pattern** (mutual funds hold KEC shares — an ownership fact about
  the issuer, not an asset of it).

## 4. Mappings considered and refused

| Candidate | Why refused |
|---|---|
| Note 18 bank balances (100.67) | a different Schedule III caption for different instruments; would import margin money the bridge excludes |
| Note 10 non-current investments (`*`) | wrong caption, non-current, sub-rounding |
| Note 19 other financial assets (276.90) | deposits, accrued interest, insurance claims, derivatives, reimbursables |
| **0**, or `grossDebt − cash` (49,665,000,000) as net debt | D-2 and `L-040`: an omitted caption is `NOT_REPORTED`, never zero; and that subtraction is not published anywhere in the payload — asserted below |

No mapping was applied. Nothing was inferred from totals, prior periods, market data or arithmetic residuals.

## 5. What did not change — and the proof

| Item | Before | After |
|---|---|---|
| `datasetVersion` | `sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab` | **identical** (`runs/01`) |
| payload digest | `fc50c53e08814d7851d7b9bb569ddf1eb4eec19ad7508c3c16db9b13a943f370` | **identical** (`runs/02`) |
| `grossDebt` | `PRESENT` 53,777,600,000 | identical |
| `cashAndCashEquivalents` | `PRESENT` 4,112,600,000 | identical |
| `currentInvestments` | `MISSING: NOT_REPORTED` | identical |
| `cashAndInvestments`, `netDebt` | `MISSING: NOT_REPORTED` | identical |
| `grossDebt − cash` published anywhere in the payload | — | **false** (`runs/03`, a walk over every number in it) |
| `intrinsic`, DCF per-share, sensitivity grid | withheld | withheld (`L-040` behaviour intact) |
| `EV_EBITDA` / `EV_REVENUE` | `CAPITAL_STRUCTURE_INCOMPLETE` / `MANDATORY_METRIC_MISSING` | identical |
| `FINANCIAL_LEVERAGE` risk dimension | `NOT_EVALUABLE` | identical |
| `netDebtToEbitda` | `NOT_COMPUTABLE: NOT_REPORTED` | identical |
| margin of safety | `NO_PRICE_OBSERVATION` | identical |
| WI-8 payload, L-040 payload, source extracts | untouched | untouched |

The re-run used the **same** ingest input, the same `--generated-at` instant and the same dataset, so the only possible
cause of a difference would have been a code change; there was none, and both digests are unchanged.

## 6. What would close `L-039`

1. a filing that prints a current-investments caption with an amount (the ordinary route), **or**
2. a filing that declares current investments nil in its own words — D-2 can already record that as
   `NIL_BY_DISCLOSURE`, but the cash sum does not yet accept a declared nil as zero (§8), so this route needs a
   second decision before it closes anything, **or**
3. a **register-owner decision** to add a governed “the balance sheet presents no such caption” state distinct from
   `NOT_REPORTED` — a D-2 grammar decision, which this work item deliberately does not take.

Options 2 and 3 are the register owner's call, not modelling choices to be made inside a valuation correction, and
neither is taken here. Until then the honest output is the one the payload already produces: gross debt published, the
cash side refused, the blocking component named, and no number invented.

## 7. Contents

| Path | What it is |
|---|---|
| `determination-l039.json` | the machine-readable determination: every caption examined, every rejected mapping, before/after, integrity digests |
| `source/source-bytes.json` | the two reports by sha256, size and page count; the FY2023-24 route recorded as 404 |
| `source/page-map.json` | which PDF page each extract comes from, and its printed page |
| `source/fy26-consolidated-balance-sheet-pdf-page117.txt` | the current-asset block (byte-identical to the WI-8 copy) |
| `source/fy26-notes-09-to-10-intangible-assets-and-investments-pdf-page129.txt` | Note 10, “Non-current:” only (byte-identical to the WI-8 copy) |
| `source/fy26-notes-15-to-18-…-page131.txt` | Notes 17 and 18 with their component amounts |
| `source/fy26-note-19-other-financial-assets-pdf-page132.txt` | Note 19's components |
| `source/fy26-note-54-ind-as-107-…-page145.txt` | the instrument-level classification |
| `source/fy26-consolidated-cash-flow-…-page118.txt`, `…-page119.txt` | the cash-flow statements and the cash reconciliation |
| `source/fy25-…-page110.txt`, `…-page124.txt`, `…-page137.txt`, `…-page111.txt` | FY2025 and FY2024 columns, the same captions and the same absence |
| `source/caption-search-log.txt` | the page-by-page search over all 421 pages |
| `runs/01`, `runs/02` | re-ingest and re-generate on the unchanged input |
| `runs/03-readback.json` | separate-process readback with the L-039 facts and the zero-substitution control |
| `runs/04-tests.txt`, `runs/05-typecheck.txt` | the whole investment suite (654 tests, this bundle's guard included) and the typecheck |
| `runs/06-post-manifest-verification.txt` | the same suite and typecheck re-run **after** the manifest was refreshed, plus a re-hash of all 22 digested files |
| `runs/commands.txt` | the exact command sequence |
| `digests.json` | every file in this bundle by sha256 — everything except itself and `runs/06`, which verifies it |

**Guard.** `iips-platform/tests/investment/l039CashSideEvidence.test.ts` pins this bundle's claims: the extracts carry no
current-investments caption, the current-asset block enumerates four captions, Note 10 is non-current-only, the payload
withholds `currentInvestments`/`cashAndInvestments`/`netDebt` and publishes `grossDebt − cash` nowhere, the dependent
outputs stay withheld, and a dataset that *does* carry the caption closes the bridge — so the gate is the evidence, not
the code. A declared nil is pinned to its present behaviour (§8) rather than asserted to close.

## 8. Verification, and one behavioural finding

| Check | Result |
|---|---|
| `npx tsx --test tests/investment/l039CashSideEvidence.test.ts` | 18/18 |
| `npx tsx --test tests/investment/*.test.ts` | **654/654**, 151 suites (`runs/04`, re-run in `runs/06`) |
| `npx tsc --noEmit -p tsconfig.json` | 0 diagnostics (`runs/05`, `runs/06`) |
| `digests.json` re-hash | 22 files, 0 mismatches (`runs/06`) |

`runs/06` sits **outside** the manifest by construction — a manifest cannot digest the file that verifies it — and the
guard test enforces that boundary by asserting that every other shipped file is digested.

**Finding, recorded but not acted on.** The two governed aggregations treat a declared nil differently. `grossDebtOf`
counts a component the filer declared nil as zero and names it in a note; `sum`, which builds `cashAndInvestments` from
cash and current investments, returns the nil itself, so `cashAndInvestments` and `netDebt` become `NIL_BY_DISCLOSURE`.
A filer who states “no current investments” therefore still gets no net debt. That is the same family of over-refusal as
`L-039` itself, and closing it is a second **register-owner** decision — it changes what the cash-side aggregation
contract may do with a declaration the issuer actually made — so it is not taken here. The guard test pins the present
behaviour, so any future change has to be deliberate. It affects KEC not at all: KEC declares nothing, so its
`currentInvestments` is `NOT_REPORTED`, not nil.
