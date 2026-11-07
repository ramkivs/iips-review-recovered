# WI-7 / L-038 — Marico Limited: the debt components, the caption WI-7 said was absent, and why the bridge still cannot close

**Work item.** The continuation of WI-7 (Consumer) that investigates `L-038`: the enterprise-to-equity bridge needs
four borrowing components — short-term borrowings, current maturities of long-term debt, long-term borrowings and lease
liabilities — each carrying a number or a quoted nil, **all at one balance-sheet instant**.

**Question this bundle answers.** Does Marico's audited consolidated disclosure support a complete, period-aligned
breakdown of that partition, so that gross debt, net debt and the enterprise-to-equity bridge can be computed on the
existing governed path without inferring anything?

**Answer: no — but the reason on record was wrong.** WI-7 recorded that the filing prints *no current-maturity line
anywhere*. It does: Note 13(a) carries a table headed *"The scheduled maturity of long term borrowings is summarized
as under"*, and its first row is exactly **"Within one year (Current maturities of long term debt)"** — in both
reports, for both period columns. What that row prints matters:

| Period | Non-current borrowings | Current maturities | Short-term borrowings | Lease liabilities | Complete at one instant? |
|---|---|---|---|---|---|
| **2024-03-31** | `-` (dash) | `-` (dash) | 383 | 145 | **no** — two dashes |
| **2023-03-31** | 2 | 0 (printed zero) | 473 | 133 | **yes** |
| **2022-03-31** | `-` (dash) | `-` (dash) | 345 | 134 | **no** — two dashes |

So the newest period — the instant the valuation runs on — is two dashes short, the only complete period is the prior
one, and the governed aggregation refuses to mix balance-sheet instants (`PERIOD_MISMATCH`). **`L-038` stays `OPEN`.**
No gross debt, no net debt, no enterprise-to-equity conversion, no per-share value from an enterprise value.

**What did change.** One dataset cell, on primary evidence: FY2023 current maturities = the printed `0`. The record no
longer asserts an absence the filing does not have, and the payload's refusal now names the real obstacle instead of
"not reported".

---

## 1. What the filings print

Both reports were re-fetched and hash-verified on a hosted runner (`marico.com` is not reachable from the development
sandbox), and **all 483 pages searched** for the debt captions.

| Document | bytes | sha256 | pages |
|---|---|---|---|
| Marico Limited Integrated Annual Report 2023-24 | 21,087,675 | `03cb0db78289cdda4ffcd4b4e9f14f3b444a52a4fd64d6265578180fa9857595` | 259 |
| Marico Limited Integrated Annual Report 2022-23 | 28,505,144 | `0f41759d903f2f9e1185d1bd52228a1653592583ca729abe75edf430b9332b0a` | 224 |

Both hashes, byte counts and page counts are identical to the bytes WI-7 read on the same day — the primary evidence is
the same evidence, re-read and re-searched. `source/caption-search-log.txt` is the page-by-page result.

### 1.1 The caption, where it is printed

| Where | What it prints |
|---|---|
| **FY2023-24 report, PDF p.191** (printed 378-379), Note 13(a) I — the scheduled-maturity table | *Within one year (Current maturities of long term debt)* **`-` / `0`**; *After 1 year but within 2 years* `-` / `2`; *Total* `-` / `2` (FY2024 / FY2023) |
| **FY2022-23 report, PDF p.149**, Note 13(a) I — the same table | *Within one year (Current maturities of long term debt)* **`0` / `-`**; *After 1 year but within 2 years* `-` / `-`; *Total* `0` / `-` (FY2023 / FY2022) |
| **FY2022-23 report, PDF p.150**, Note 13(a) II — the current-borrowings reconciliation | *Total current borrowings* **477 / 345**; *Add : Current maturities of long-term debt (refer note 13(a))* **nothing added**; *Less: Interest accrued* 4 / 0; *Current borrowings as per balance sheet* **473 / 345** |
| **FY2023-24 report, PDF p.192**, Note 13(a) II | *Total current borrowings* 396 / 477; *Less: Interest accrued* 13 / 4; *Current borrowings* 383 / 473 — this year's presentation carries no "Add: current maturities" line, and does not need one |

The reconciliation is the strongest single piece of arithmetic in the bundle: **477 + 0 − 4 = 473** reconciles to the
printed current borrowings, so the FY2023 zero is corroborated by a second, independent statement in the same note
rather than asserted by us.

The four pages of Note 13(a) and two balance sheets are in `source/`, with provenance headers and a page map. Four of
them are the same pages WI-7 shipped: their bodies are **byte-identical** to WI-7's extracts, which the guard test
asserts — the re-read reproduces the original evidence exactly.

### 1.2 Where it is *not* printed, and what that means

* **A net-debt figure in the bridge's sense:** none. The FY2022-23 report does print a **"net financial debt"**, and
  defines it in the same sentence: *"Net financial debt is defined as current and non current borrowings."* It is
  **borrowing-only** — it subtracts no cash, carries no leases — so it is **not** the governed net debt, and it is not
  used. Consolidated Note 29 (PDF p.163) prints only the ratio row that survives the layout extraction
  (`Net debt to equity ratio 0.12 / 0.10`); the amounts (`Net debt 59 / 95`, `Total equity 3,677 / 3,049`,
  ratio `0.02 / 0.03`) are in the **company** statements' version of the note (p.209), a different reporting entity.
  The FY2023-24 report carries the string on **no page at all**. Multiplying the consolidated ratio by equity would
  *imply* ≈475 crore for FY2023 — an inference from a ratio, recorded and not used.
* **A preference share capital line:** one exists, but only in the **authorised** capital table. Note 12(a) lists
  *Preference shares of ₹10/- each 7 / 65* beside the two equity classes under *I Authorised share capital*, while
  *II Issued, subscribed and paid-up* prints equity shares only (1,29,41,01,828 shares, total `129 / 129`) and no
  preference row at all — not even a dash. So there is no issued preference capital to map and nothing in words
  declares it nil; reading zero out of "issued total equals the equity line" would be an inference from a total.
  `PREFERENCE_CAPITAL` stays `NOT_REPORTED`, and it is a **second blocker** on the enterprise-to-equity conversion,
  independent of net debt: even a closed debt side would still meet `MISSING: NOT_REPORTED` here.
* **A total-borrowings figure:** the only `Total Borrowings` strings are column heads of the lease reconciliation.
  The filing's "net financial debt" is the nearest thing to one, and it is exactly the measure register §17.15
  reserved as an *option* — an explicit "total borrowings as filed" component with an incompleteness flag — which is
  a contract decision, not an evidence question, and is not taken here.
* **The caption's two other appearances** (FY2023-24 p.209, FY2022-23 p.170) are checklist item *"(v) Current
  maturities of long term borrowings"* inside the Schedule III additional-information sheet, with no group amount
  beside them. Nothing is taken from those pages.

## 2. The dataset correction, and its exact size

The corrected input is WI-7's input with **one cell** changed, and the change is stated in
`ingest-input/data-extraction.json` (`corrections`), which also quotes the superseded WI-7 sentence.

| Cell | WI-7 | This run | Why |
|---|---|---|---|
| FY2023 `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | *(blank)* → `MISSING: NOT_REPORTED` | **`0`** → `PRESENT` | the digit is printed in both reports' maturity tables and the reconciliation adds nothing for it. A printed zero is a reported amount, not a nil and not an absence |
| FY2024 / FY2022 `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | *(blank)* | *(blank)* | both print a dash. Register §17.14: a dash is neither a number nor a declaration, so it stays `NOT_REPORTED` |
| every other cell | — | unchanged | `periods.csv` differs from WI-7's in exactly this one character; `roster.json` and the three identity files are byte-identical copies |

**That is the whole of the mapping.** Nothing was inferred from totals, prior periods, market data or arithmetic
residuals, and no dash was turned into a zero.

## 3. What the governed run now says — and what it refuses

| | WI-7 (before) | This run (after) |
|---|---|---|
| datasetVersion | `sha256:04c96303…6bd0` | `sha256:433358f3…f9fc` |
| payloadDigest | `3fd27a98…2343` (54,705 B) | `1a873047…6d59` (54,705 B) |
| `currentMaturities` | `MISSING` / `NOT_REPORTED` | **`PRESENT` 0**, periodEnd **2023-03-31** |
| `grossDebt` | `MISSING` / `NOT_REPORTED` | **`NOT_COMPUTABLE` / `PERIOD_MISMATCH`** |
| `netDebt` | `MISSING` / `NOT_REPORTED` | **`NOT_COMPUTABLE` / `PERIOD_MISMATCH`** |
| the note it now carries | — | *"debt components resolve to different period ends (shortTermBorrowings@2024-03-31, currentMaturities@2023-03-31, longTermBorrowings@2023-03-31, leaseLiabilities@2024-03-31), so no single balance-sheet instant is established"* |
| `cashAndInvestments` | `PRESENT` 487 crore | identical |
| `intrinsic` | `null` | `null` |
| DCF per-share legs | `NOT_COMPUTABLE` | `NOT_COMPUTABLE` |
| sensitivity grid | **nine per-share cells published** (see §5) | **nine cells, every `value` null**, grid-level `withheld` |
| `EV_EBITDA` | not applicable — `CAPITAL_STRUCTURE_INCOMPLETE` | identical |
| P/E band | 181.69 / 227.11 / 272.54 | identical (it does not use net debt) |
| margin of safety | `NO_PRICE_OBSERVATION` | identical |
| `netDebtToEbitda`, `FINANCIAL_LEVERAGE` | `NOT_COMPUTABLE`, `NOT_EVALUABLE` | identical, with the reason now `PERIOD_MISMATCH` |

The refusal is the honest one: **the four components exist, but not at one instant.** The two figures the bridge would
produce if the dashes were read as nil — gross debt **528 crore**, net debt **41 crore** — appear **nowhere** in the
payload; `runs/03-readback.json` walks all 229 numbers in it to prove that.

## 4. Mappings considered and refused

| Candidate | Why refused |
|---|---|
| the FY2024 dash as nil | a dash is not a number and not a declaration (§17.14); no page states it in words. It would yield gross debt 528 crore and net debt 41 crore — a valuation the filing does not support |
| the FY2024 non-current-borrowings dash as nil | same rule; the note prints a dash in the borrowings table and in the schedule's total |
| FY2023 components paired with FY2024 cash and equity | mixes two balance sheets; the contract refuses it (`PERIOD_MISMATCH`), and it would be wrong even if allowed |
| zero-filling the FY2024 rows | the L-040 failure mode — an unavailable input becoming zero |
| Note 13(b)'s *obligation to buy non-controlling interest* (405 crore) as debt | an other financial liability, not a borrowing; gross debt is borrowings plus leases, and the bridge never subtracts it |
| the schedule's *Total* as total borrowings | it covers long-term borrowings only; using it would drop 383 crore of current borrowings |
| the filing's own "net financial debt" | it is defined in the note as *"current and non current borrowings"*: borrowing-only, no cash subtracted, no leases. Adopting it as net debt would silently change what the bridge measures, and adopting it as *gross debt* is the §17.15 "total borrowings as filed" option — a contract decision, not taken here |
| ≈475 crore implied by the 0.12 consolidated ratio | an inference from a ratio and a total; it is not a printed amount for the consolidated group |
| the company-level `Net debt 59 / 95` | a different reporting entity (Marico Limited standalone); the dataset is consolidated |
| an issued preference capital of zero, read from "issued total 129 = equity line 129" | an inference from a total; Note 12(a) prints no issued preference row and no wording declaring it nil |

## 5. A finding about the superseded artifact (`L-040`, resolved, not reopened)

The WI-7 payload publishes **nine per-share sensitivity values** — ₹107.95 to ₹187.23 — computed as
`(EV − NCI) / shares` with **net debt, preference capital and associates/JV substituted as zero**. It was built by the
code that existed *before* the `L-040` correction, and it was never regenerated afterwards. The corrected code, which
produced this bundle's payload, publishes no per-share cell there: every `value` is `null`, each cell keeps its
enterprise value as labelled diagnostic arithmetic, and the grid carries a `withheld` block.

`runs/04-payload-diff.json` lists the nine `value → null` cells exactly. **`L-040` stays `RESOLVED`** — the defect is in
a historical artifact, not in the shipped code — and the WI-7 payload is preserved byte-identical as evidence of the
pre-correction state. It is **superseded for two independent reasons**: the corrected FY2023 dataset cell, and the grid;
`determination-wi7.json` records both, and the payload bytes are untouched.

**Why this matters beyond WI-7.** The nine-cell grid is the **first live rollback candidate** in the estate besides the
KEC artifact that `L-040`'s correction already pins: it is a published per-share block, produced before a corrected
exclusion rule, still on disk and still rendered by anyone who reads the artifact. The guard test asserts that this bundle
publishes no such cell (nine `null`s plus `withheld`), so the superseded state can be recognised from inside the code —
which is the only form of "rolled back" that does not require rewriting history.

## 6. What would close `L-038`

1. a filing that prints an amount (or a zero) for **non-current borrowings *and* current maturities at the valuation's
   instant** — the ordinary route, and the only purely evidentiary one, **or**
2. a filing that declares either nil in its own words, which D-2 can record as `NIL_BY_DISCLOSURE`, **or**
3. a register-owner decision on the **period-alignment question** (below), **or**
4. a register-owner decision to give a filed dash a **governed grade**, the first option §17.15 named.

## 7. A contract question, recorded and left undecided

**`DEBT-COMPONENT-PERIOD-ALIGNMENT`.** When every component is disclosed but not at one instant, the contract refuses
(`PERIOD_MISMATCH`) and the payload can name only one reason. Should the bridge instead be allowed to run entirely on
the newest instant at which all four components carry numbers — here **2023-03-31**, which would give gross debt
**608 crore** and net debt **−177 crore** against 2023 cash — and must the valuation's own inputs move with it? Or is it
right that a valuation dated 2024-03-31 may not use 2023 borrowings?

Either answer changes what the bridge may do with disclosed figures. It is a valuation-contract decision for the
register owner, so it is **recorded and not decided** here, and **no aggregation code was touched**. It is distinct from
`L-039`'s cash-side nil-propagation finding, which this work item neither touches nor relies on.

## 8. Verification

| Check | Result |
|---|---|
| `npx tsx --test tests/investment/l038MaricoDebtCompleteness.test.ts` | 25/25 (`runs/05-tests.txt`) |
| `npx tsx --test tests/investment/*.test.ts` | 679/679, 156 suites (`runs/05-tests.txt`, re-run in `runs/07`) |
| `npx tsc --noEmit -p tsconfig.json` | 0 diagnostics (`runs/06-typecheck.txt`) |
| `digests.json` re-hash | 27 files re-hashed, 0 mismatches, 0 undigested (`runs/07-post-manifest-verification.txt`) |
| separate-process readback | `runs/03-readback.json` — recomputed digest equals stored digest and chain head |
| clean clone of the pushed branch | re-ingests to the same datasetVersion, re-hashes every digested file, guard green |

`runs/07` sits **outside** the manifest by construction — a manifest cannot digest the run that verifies it — and the
guard test asserts that every other shipped file is digested.

## 9. Contents

| Path | What it is |
|---|---|
| `determination-l038.json` | the machine-readable determination: captions, coverage, accepted and rejected mappings, before/after, the `L-040` finding, the undecided contract question |
| `source/source-bytes.json` | both reports: URL, HTTP status, bytes, sha256, pages; the earlier failed attempt; what was not re-fetched and why |
| `source/fetch-log.txt` | what the runner's HTTP layer returned, verbatim |
| `source/caption-search-log.txt` | the 483-page page-by-page caption search |
| `source/page-map.json` | PDF page ↔ printed page per extract, with each extract's sha256 and how a derived folio was derived |
| `source/*.txt` | nine page extracts with provenance headers (four of them byte-identical in body to WI-7's) |
| `ingest-input/periods.csv` | WI-7's input with exactly one cell corrected |
| `ingest-input/data-extraction.json` | where every figure is printed, the correction note, and the quoted WI-7 sentence it supersedes |
| `ingest-input/roster.json`, `ingest-input/identity/*` | byte-identical copies of WI-7's identity inputs |
| `runs/01-ingest.txt`, `runs/02-generate.txt` | the governed run |
| `runs/03-readback.json` | separate-process readback with the L-038 facts and the zero-substitution control |
| `runs/04-payload-diff.json` | WI-7 payload → this payload, path by path |
| `runs/05-tests.txt`, `runs/06-typecheck.txt`, `runs/07-post-manifest-verification.txt` | the suite, the typecheck, and the post-manifest re-run |
| `runs/commands.txt` | the exact command sequence |
| `digests.json` | sha256 and byte length of all 27 shipped files (everything but itself and the three certifying transcripts) |
| `artifact/assessment-payload-marico-l038.json` | the persisted canonical payload, read back |
| `digests.json` | every file above by sha256, except itself and `runs/07` |

**Guard.** `iips-platform/tests/investment/l038MaricoDebtCompleteness.test.ts` pins this bundle's claims: the caption is
printed with those exact cells, the FY2022-23 reconciliation adds nothing and 477 + 0 − 4 = 473, the extracts reproduce
WI-7's bodies byte-for-byte, the corrected input differs in exactly one cell while WI-7's still carries the blank, the
payload refuses with `PERIOD_MISMATCH` and publishes neither 528 crore nor 41 crore, every dependent output stays
withheld, the superseded payload is unchanged and still carries its nine pre-correction cells, and — on the shared
fixture — the same pipeline **does** close the bridge when the four components carry numbers at one instant, so the gate
is the evidence and not the code.
