# IIPS v3.0 — Work Item 3: Infosys borrowings declared nil, and the intrinsic chain (2026-11-06)

**Baseline:** Work Item 2 payload `06be8f66…` on `arena/e62e22d2-iips-review-recovered` (PR #492).
**Question:** Work Item 2 left `valuation.intrinsic = null` and the margin of safety at `INTRINSIC_WITHHELD` because
gross and net debt were `NOT_REPORTED` (defect D-2's evidence limb). Does primary, issuer-matched evidence support
gross debt → net debt → intrinsic?

**Outcome:** yes. Four components are declared nil from two sentences of the FY2024 audited consolidated statements;
gross debt resolves to ₹8,359 crore of lease liabilities, net debt to **−₹19,342 crore**; the intrinsic range
(₹875.34 / ₹1,088.97 / ₹1,399.81) and the margin of safety (−8.42 % vs mid, band `FAIR`, `refusal: null`) are now
computed against the unchanged Work Item 2 price of ₹1,180.65. No valuation formula, threshold, weight, confidence
cap or policy version changed. No verdict is published.

**Evidence bundle:** `evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/` (`README.md` is the full report,
`source/quotes.json` the per-component provenance, `artifact/payload-diff-vs-wi2.json` the attributed 96-path diff).

---

## 1. The exact components that were missing, and why the aggregate was blocked

`capitalStructure` sums long-term borrowings, short-term borrowings and current maturities, then subtracts cash and
liquid investments. Work Item 2 published:

| Component | Work Item 2 state |
|---|---|
| `longTermBorrowings` | `MISSING` / `NOT_REPORTED` |
| `shortTermBorrowings` | `MISSING` / `NOT_REPORTED` |
| `currentMaturities` | `MISSING` / `NOT_REPORTED` |
| `preferenceCapital` | `MISSING` / `NOT_REPORTED` |

The first three block gross debt, and therefore net debt, and therefore the enterprise-to-equity bridge every
valuation method needs. The fourth blocks the bridge even when net debt resolves. All four were missing for the same
reason: dataset schema v1 has no column for them, and the ingestion grammar had — until defect D-2 was corrected — no
way to represent "the filer says this is nil" other than as a zero.

## 2. What the filing actually says

Both sentences are in the same audited document — Infosys Limited, consolidated Ind AS statements, year ended
**2024-03-31**, signed **2024-04-18**, Deloitte Haskins & Sells LLP:

- Note 2.11 *Financial instruments* → *Financial risk management* → *Liquidity risk*:
  **“The Group has no outstanding borrowings.”**
- Note 2.12 *Equity* → *Equity share capital*:
  **“The Company has only one class of shares referred to as equity shares having a par value of ₹5/-.”**
  and, in capital management, “As of March 31, 2024, the Company has only one class of equity shares and has no debt.”

The first sentence is the declaration for the three borrowing components; the second is the declaration for
preference capital. Both are quoted verbatim in the dataset cells and repeated in the payload
(`components[*].note`), with `filingRef = INFY-INDAS-CONSOL-FY24` and `filedAt = 2024-04-18`.

**This is the difference from the withdrawn Work Item 1 reading.** The D-2 withdrawal was correct: the balance sheet's
silence about borrowings is *absence*, not a declaration. Here the filer writes the sentence. The distinction is now
enforced in the grammar — a cell with `NIL:` and no quoted wording is refused (`NIL_WITHOUT_QUOTED_WORDING`), a nil
without a `filing_ref` is refused (`NIL_WITHOUT_PROVENANCE`), and a nil on a derived item is refused
(`NIL_ON_DERIVED_ITEM`).

## 3. Two scope decisions, disclosed rather than hidden

1. **Group vs Company.** The borrowings sentence is a Group statement in the consolidated notes and is applied to the
   consolidated capital block directly. The share-class sentence speaks of “the Company”; it is applied to the
   consolidated block because consolidated owners' equity carries only equity share capital (₹2,071 crore) and other
   equity (₹86,045 crore), with NCI (₹345 crore) separate, and the authorised capital is equity shares only.
2. **Nil is not zero.** `value` stays `null`; `presence` is `NIL_BY_DISCLOSURE`; `reason` is `DECLARED_NIL_IN_SOURCE`.
   The gross-debt note names the three components counted as zero. A component that is `MISSING` or `NOT_COMPUTABLE`
   would still block the aggregate — the Work Item 1 dataset, which has no declarations, still publishes
   `NOT_REPORTED`, and the WI-3 test pins that.

## 4. What the run produced

| Output | Work Item 2 | Work Item 3 |
|---|---|---|
| `grossDebt` | `NOT_REPORTED` | **₹8,359 crore** (`PRESENT`, leases only, nils named) |
| `cashAndInvestments` | ₹27,701 crore | unchanged |
| `netDebt` | `NOT_REPORTED` | **−₹19,342 crore** (`PRESENT`) |
| `preferenceCapital` | `NOT_REPORTED` | `NIL_BY_DISCLOSURE` |
| `DCF_FCFF` | applicable, no output | **₹990.75** mid (798.01 – 1,345.50) |
| `EV_EBITDA` | `applicable: false` | **₹1,133.95** mid |
| `PE_RELATIVE` | ₹1,270.43 | ₹1,270.43 |
| `EV_REVENUE` | not applicable | not applicable |
| `intrinsic` | `null` | **875.34 / 1,088.97 / 1,399.81** (spread 48.16 %) |
| `marginOfSafety` | `INTRINSIC_WITHHELD` | **`refusal: null`**, −8.42 % vs mid, −34.88 % vs low, band `FAIR` |
| risk evaluation | `PARTIAL` / `INDETERMINATE` | `COMPLETE` / `PASSED` (3/3 applicable) |
| dividend verdict | `INSUFFICIENT_EVIDENCE` | `COVERED` (net debt / EBITDA −0.47×) |
| moat | `INSUFFICIENT_EVIDENCE` | `NARROW` (ROIC − WACC 28.79 %, 3 consecutive years) |
| confidence | 0.4939 | **0.6736** (model 0.125 → 0.6342; data 0.85; caps `STALE_DATA`, `DILUTION_PROXY`) |

Dataset `sha256:0ef4299d…` → `sha256:21cf2522…`; payload `06be8f66…` → `83644bc6…` (51,196 B); chain head `v1`
verified. A structural comparison against the Work Item 2 payload finds 96 changed paths, every one of which is
attributed by prefix to the declaration, a block downstream of it, the dataset identity, the run clock or the
narrative list — an unattributed path aborts the comparison, so nothing else moved.

## 5. What is now computable, and what is still not

**Computable:** intrinsic per share, the margin of safety against the accepted price, the leverage risk dimension,
the dividend coverage verdict, the moat classification, and every stated confidence component.

**Still not computable, by policy or by missing evidence** — each separately named in the payload:

- `restrictedCash` and `associatesAndJV` remain `NOT_COMPUTABLE: NOT_REPORTED` (schema v1 has no line item). The
  filing's own Note 2.9 says cash includes ₹348 crore of restricted balances, so net cash is overstated by that
  amount — **₹8.40 per share, 0.77 % of intrinsic mid** (register `L-006`).
- Dividend reconciliation stays `NOT_COMPARABLE` (no declaration record), so `COVERED` rests on the cash-flow figure.
- The diluted count remains an EPS-implied proxy (`DILUTION_PROXY` cap).
- The statements are 950 days old against a 2026 price (`staleBeyondPolicy: true`, `STALE_DATA` cap).
- The price is single-exchange (register `L-030`).
- Share-base continuity from 2024-03-31 to 2026-11-06 is unverified because the corporate-action table is empty
  (register `L-031`) — this now sits underneath a *published* margin of safety rather than a withheld one.

## 6. Policy relevance established, policy unchanged

- **`L-031`** (empty corporate-action table): no longer latent. The published margin of safety assumes no per-share-
  affecting action between the statements' share base and the price date, and nothing in the dataset tests that
  assumption. Status unchanged (`OPEN`); no action is invented, `adjustment` stays `null`.
- **`L-033`** (5 trading days in the design vs 7 calendar days in `policy.ts`): **no effect** on this item — the price
  is 0 days old at the run instant and lies inside both windows.
- **`mos-policy/1.0.0`**, **`valuation-policy/1.0.0`**, **`risk-taxonomy/1.1.0`** and every threshold, weight and cap
  are byte-identical to Work Item 2.
- One new limitation is registered (§17, `L-034`): the newly published valuation rests entirely on **policy-default**
  inputs (WACC 10.678 %, multiples 22× and 12×), while the design requires a confidence cap for a `POLICY_DEFAULT`
  basis that the confidence module does not implement. The penalty is therefore absent from 0.6736. Recording it was
  in scope; changing it was not.

## 7. Verification performed

47 platform tests (`assessment-{capital,valuation,dividends,moat,price}`) and 30 frontend tests (10 new WI-3, 6 WI-2,
14 real-issuer/artifact-CLI) pass; both typechecks are clean; ingestion raises no issues; the payload re-read through
the service hashes to the chain head; a second run into an empty store reproduces the same steps and digests. Details
in the bundle's `runs/05-verification.txt`, `runs/06-payload-verify.json` and `README.md` §8.

## 8. Register impact

Register §17 appended. **No entry in `L-001` … `L-033` was closed, renumbered, softened, reinterpreted or
re-statused.** Two entries are added (`L-034`, `L-035`), both observations that this work item surfaced and neither
actionable inside it.
