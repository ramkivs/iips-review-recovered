# WI-11 — `L-038` contract decisions recorded and implemented (2026-11-08)

This bundle is the evidence for one thing: **the register owner decided the two capital-structure period-alignment
questions, and the code now does what the owner decided.** It is not an investigation, and it closes no limitation.

## The decisions

| | Decision | Selected | Effect on the governed contract |
|---|---|---|---|
| **A** | `DEBT-COMPONENT-PERIOD-ALIGNMENT` | **Option A** — retain the strict same-instant invariant | none: `grossDebtOf()` already required one instant and still does. No anchoring, no latest-complete selection, no fallback. |
| **B** | `CASH-SIDE-PERIOD-ALIGNMENT` | **Option B** — enforce alignment | **implemented**: `cashAndInvestments` requires cash and current investments at one instant; `netDebt` requires the debt side and the cash side at one instant; a mismatch is `NOT_COMPUTABLE / PERIOD_MISMATCH`. |

- **Owner:** the designated register owner for the R-4.1/IID-2 capital-structure aggregation contract.
- **Decision date:** 2026-11-08, recorded in `decision-owner-authorization.json`.
- **Source of the questions and the options:** `IIPS-V3-IID-L038-DECISION-DOCKET-2026-11-08` v1.1
  (`/home/user/L038-decision-docket-2026-11-08.md`), §5 (Decision A), §6 (Decision B), §7 (interaction).
- **Authority exercised:** explicitly. These are decisions, not recommendations awaiting another approval.

## What changed in the contract

`iips-platform/src/investment/assessment/capitalStructure.ts` only:

1. `sum()` → `sumAtOneInstant(entries)`: the cash side now compares the two components' reporting instants, not
   merely their presence. A mismatch returns `NOT_COMPUTABLE: PERIOD_MISMATCH` with a note naming each
   `component@instant`.
2. `subtract()` → `subtractAtOneInstant(...)`: net debt is refused when the debt-side instant and the cash-side
   instant differ, with a note naming both. A blocked operand is still returned unchanged, so `NOT_REPORTED`,
   `FILING_UNAVAILABLE` and a declared nil are never overwritten by a period complaint.
3. `commonPeriod(periods)`: the single instant a component set resolved to, or `null` when it is missing or mixed.
4. Header documentation: both owner decisions are stated in the contract itself, with the case that motivated
   Decision B named.

**Deliberately not done.** No new field was added to any already-published aggregate, so every existing payload and
the structural digests the IX evidence package pins are byte-for-byte unchanged (`runs/06`). No new persistence
mechanism, table, cache, journal or data source. No change to D-2 grammar, IX policy, valuation formulas, datasets
or issuer evidence.

## Before and after, on the real Marico dataset

`runs/01-probe-after-decision.txt` re-runs the pre-decision probe (`WI7-L038-RESIDUAL-2026-11-08/probe/probe.ts`)
against the committed dataset after the change. `runs/02-diff-vs-pre-decision-run.txt` compares it with the committed
pre-decision run: **one line differs.**

```
<     netDebt                  -257 crore
---
>     netDebt                  NOT_COMPUTABLE:PERIOD_MISMATCH
```

That line is the synthetic two-instant fixture (`B-1`: debt complete @2024-03-31, cash only @2023-03-31). It used to
publish a net-debt figure built from two balance sheets; it now publishes none. The other two configurations are
unchanged in every figure:

| Case | Before | After |
|---|---|---|
| `A-1` Marico as published | `grossDebt` / `netDebt` `PERIOD_MISMATCH`, `cashAndInvestments` 487 crore | identical |
| `A-2` Marico anchored at 2023-03-31 | 608 / 785 / −177 crore | identical |
| `B-1` synthetic cross-period | `netDebt` **−257 crore** | **`NOT_COMPUTABLE: PERIOD_MISMATCH`** |

The probe's own header line still says "unmodified" because that script is preserved historical evidence in the
WI-7 residual bundle and was not edited; the run in this bundle is what the current code produces.

## Verification

| Run | Result |
|---|---|
| `runs/03-targeted-tests.txt` — 5 files, 92 tests | **92 / 92 pass** |
| `runs/04-typecheck.txt` — `tsc --noEmit` | exit 0 |
| `runs/05-full-investment-suite.txt` — `tests/investment/*.test.ts` | **759 tests, 178 suites, 0 fail** |
| `runs/06-existing-outputs-unchanged.txt` — `ixAuthorizedPolicy` (committed package regenerates exactly) | **11 / 11 pass** |

New guard: `iips-platform/tests/investment/l038CashSideAlignment.test.ts` (11 tests) covers same-instant and
mixed-period debt, same-instant and mixed-period cash, same-instant and mixed-period debt-versus-cash, component
survival after an aggregate is withheld, absence that must stay absent rather than become zero or a period
complaint, the declared-nil path inside gross debt, and the classification of the committed Marico and KEC payloads.

## What did not change

- `L-038` stays **`OPEN`**. Both decisions close *policy questions*; the limitation's completion standard is unmet
  because Marico's **preference capital remains `MISSING / NOT_REPORTED`**, an independent blocker to the
  enterprise-to-equity bridge under every option.
- `L-039` stays **`OPEN`** and independent; KEC's **current investments remain `MISSING / NOT_REPORTED`**. The new
  guard does not reclassify it: absence is `NOT_REPORTED`, not `PERIOD_MISMATCH`, and the KEC guard test still passes.
- Bridge-wide period equality for minority interest, preference capital and associates/JV remains **undecided** and
  is not implemented.
- No dataset, payload, register finding or historical evidence was altered.

## Files

```
README.md                              this file
decision-owner-authorization.json      the decisions, their boundaries and their verification, machine-readable
runs/01-probe-after-decision.txt       the pre-decision probe re-run against the post-decision contract
runs/02-diff-vs-pre-decision-run.txt   exactly one changed line, and which
runs/03-targeted-tests.txt             five targeted files, 92 tests
runs/04-typecheck.txt                  tsc --noEmit
runs/05-full-investment-suite.txt      the investment suite
runs/06-existing-outputs-unchanged.txt the committed IX package regenerating exactly
digests.json                           every other file in this bundle, re-hashable
```
