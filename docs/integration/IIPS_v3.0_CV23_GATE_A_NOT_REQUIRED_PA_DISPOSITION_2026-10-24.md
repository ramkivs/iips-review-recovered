# IIPS v3.0 — CV-23 Program Authority Disposition: Gate A Convergence Not Required

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-CV23-GATE-A-NOT-REQUIRED-PA-DISPOSITION-2026-10-24-01` |
| **Existing work item** | `CV-23` — no new CV work-item identifier is created |
| **Decision-maker** | Program Authority (PA) |
| **Decision date** | `2026-10-24` (Asia/Kolkata; no time-of-day supplied) |
| **Decision source** | The PA's explicit approved disposition, issued as a one-pass execution authorization to the operating session on 2026-10-24, prepared against decision package §1 of the same date |
| **Status** | **DECIDED — GATE A RECORDED NOT REQUIRED FOR THE CURRENT PRODUCT** |
| **Governing loci** | IRR `ramkivs/iips-review-recovered` (this record + tracker); IPD `ramkivs/iips-production-market-data` is **read-only** and is not modified by this record |
| **IRR baseline verified before preparation** | `main@4cd343704bca039610c9217eaeece35ff0b621f4` (tree `0af9ddcd13984f4a4b1ff367dd63d7c78e60426a`) |
| **IPD baseline verified before preparation (read-only)** | `main@5a34fa880c441cc21c1dee653784308beb2265d3` (tree `5e239c7338c2016ce12fc7d3ae9254cbdbfadd60`) |
| **Tracker registration** | Master tracker §16.103 (`CV-CORR-85`, `CHG-2026-10-24-14`); verification rows `V549`–`V556` |

> **Rendered PA decision — CV-23: GATE A IS NOT REQUIRED FOR THE CURRENT PRODUCT.**
>
> The NP-04 and G24 lineages are **retained unchanged and reference-only**. Gate A is **not** marked passed, satisfied, satisfied-by-default, accepted or waived.

## 1. Decision

1. **Gate A** (IPD `src/persistence` convergence, tracker §7.2) is **NOT REQUIRED for the current product**. It remains *defined* in §7.2 and may be re-opened only by a later express PA act that names the capability requiring it. It is not deleted, not marked passed, not marked satisfied, and not waived.
2. The **NP-04 lineage** (`2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`, `refs/heads/np04-governed-persistence-windows`) and the **G24 lineage** (`6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`, reachable through `refs/heads/arena/01a0e6d9-iips-production-market-data` and the two later G24-derived refs) are **retained unchanged and reference-only**.
3. **No convergence work is authorized.** No merge, cherry-pick, rebase, promotion, re-pin, branch deletion, path migration, package-export addition, or `AD-20` re-opening is authorized by this record.
4. The accepted **Gate 3 persistence line already on IPD `main`** is the persistence implementation of record for the current product. This record neither amends, re-accepts, nor re-baselines it.
5. **No future capability is named as requiring convergence.** Reports / certified analytics is recorded as the only foreseeable claimant; it would require its own act and is **not** authorized, scoped or scheduled here. `REG-11` Option C stands unchanged.
6. `CV-23` is **CLOSED by this dated disposition**. It is a scope decision, not a capability completion.

## 2. Evidence basis (recorded, plus one dated re-measurement)

The investigation was completed before this record. It is **not repeated** here. What follows is the recorded evidence plus the freshness re-measurement required to state current values.

| # | Evidence | Verified value (2026-10-24) |
|---|---|---|
| E1 | `CV-23` register row | `DECISION REQUIRED`; "convergence is currently **consumed by nothing** in the running application" (§16.4) |
| E2 | `XV-5` as recorded | Two lineages, *"neither on IPD `main` (0 files at `main`)"*, each 26 ahead / 0 behind, non-ancestral (`§16.6`) |
| E3 | **Re-measured:** IPD `main@5a34fa88…` | Carries **14** `src/persistence` files (incl. `migrations/001`–`004` and `migration_ledger.ts`) and **4** `src/ipc` files — the accepted Gate 3 line |
| E4 | **Re-measured:** NP-04 `2e11fa3…` | **8** `src/persistence` files; **26 ahead / 207 behind** IPD `main@5a34fa88…` (full history) |
| E5 | **Re-measured:** G24 `6828155e…` (tip `c1b955b4…` via `arena/01a0e6d9…`) | **11** `src/persistence` files; **28 ahead / 207 behind** IPD `main@5a34fa88…` (full history) |
| E6 | **Re-measured:** path collision | `migrations/001_initial_schema.ts` main `f594a182…` vs G24 `48fcf4d9…`; `migrations/002_audit_event_sequence.ts` main `932af8e6…` vs G24 `dfe9f027…`; `connection.ts` main `5169e402…` vs G24 `49c86725…`; `errors.ts` G24 `56c9a42c…` vs NP-04 `ab0188d0…` (absent on `main`) — **add/add collisions on live paths** |
| E7 | **Re-measured:** IRR consumer census | IRR imports of any IPD `./persistence` export: **0**. The live IRR adapter is `frontend/server/user-portfolio/ipcPortAdapter.ts` + `ipcClient.ts` (IPC to the Gate 3 line). `ipdUserPortfolioAdapter.ts` is **absent** from IRR `main` |
| E8 | **Re-measured:** IPD export map | `package.json` exports `./portfolio-ui`, `./pit`, `./d114-non-production` — **no `./persistence`**. The NP-04 lineage is the only lineage exporting `./persistence` |
| E9 | Gate A acceptance criteria (§7.2) | Design record with layout + export map; both `np04_governed_persistence` and `g24_*` suites re-run on the converged tree; explicitly **"not a prerequisite for Gates B or C"** |
| E10 | `AD-20` | `BOUNDED DISPOSITION` (2026-10-13): the two lineages are **distinct domain stores that may coexist**; all other portions retained open. This record does not re-open it |

**Consequence recorded by the measurement.** Convergence is not merely an unconsumed convenience. Because IPD `main` now carries an accepted migration ledger at the same paths, merging either lineage would produce **add/add collisions against accepted Gate 3 bytes** and would change the consumed package's export map — forcing a re-pin determination, fresh qualification, and re-running both legacy suites. The benefit to any current consumer is **zero** (E7).

## 3. Explicit non-grants

This record does **not** grant, imply, or schedule:

- Gate A satisfaction, completion, acceptance or waiver;
- any merge, cherry-pick, rebase, promotion, re-pin, branch deletion or export-map change;
- any admission of NP-04 or G24 bytes to IPD `main`, or any change to the Gate 3 accepted line;
- any `AD-20` re-opening, `REG-03` re-decision, or `P2`/`P3` ratification (`a0ab5a34` remains unratified);
- Reports work of any kind; `REG-11` **Option C** stands;
- Gate C, Gate 4, Gate 5, `durable:true`, result acceptance, any `503` fence lift, production eligibility;
- `CV-52` admission (unchanged; separately blocked on qualification);
- any host or operator execution, and any Windows claim.

## 4. Durable status and effectiveness

This record is effective only when **all** of the following exist: the PA-rendered determination text above; merge to IRR `main` with green exact-head CI; independent remote read-back of the merged blob; and the dated tracker registration (§16.103) with its publication receipt. Until then it is a branch/PR record and the `CV-23` row keeps its recorded state.

The tracker reconciliation performed in the same act is exactly: §16.4 `CV-23` row; §2 `REG-03`; §7 / §7.2 Gate A row; §16.12 counts; §18 rows 20/32/36; §19; §20 row 7. **No other register item moves.**

## 5. Re-entry condition

A later convergence decision requires an express PA act naming (a) the capability that cannot be served by the accepted Gate 3 line, (b) the exact surviving lineage, (c) the migration-ledger reconciliation approach, and (d) a re-pin and qualification path. Nothing in this record anticipates that act's outcome.

---

*Prepared by Arena Agent Mode from the PA's approved disposition; recording and publication only. No independent authority is rendered by the recording agent.*
