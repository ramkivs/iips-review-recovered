> **STATUS (2026-10-28):** EXECUTED on IPD `main` at `0edadb2d` (act `IIPS-V3-CAP02-GATE-A-PRIME-AMEND-01-DESIGNATED-BLOBS-2026-10-28-01`). This prompt is retained for the record only; do not run it again. Result: `docs/integration/IIPS_v3.0_CAP03_IPD_A-Q5_RESULT_RECORD_2026-10-28.md`.

# IPD prompt — A-Q5 designation act (items 10 and 12, mechanism A-O3, commit a891802e)

**Target repository:** `ramkivs/iips-production-market-data` (IPD). **Not executed from IRR.** Run in a separate IPD session with IPD write authority.
**Trigger:** PA rulings A-Q1 (YES), A-Q2 (`edd0305e`), A-Q3 (workstream-scoped), A-GAP1 (act row S1 governs), A-Q5 (A-O3 at `a891802e`). Recorded in `docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` and `docs/integration/IIPS_v3.0_CAP03_PA_DESIGNATION_RECORD_PASS2_2026-10-28.md`.

## Action

Issue an IPD act, in the IPD evidence convention, that amends the designated blob list of the Gate A-prime successor provisioning act (`evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md`, blob `528de6aeddbc8e5f3191be8792f3937d77de4037`) for **items 10 and 12 only**:

| Item | Path | Current designation in the act | New designation |
|---|---|---|---|
| 10 | `src/persistence/portfolio_store.ts` | `4a005b73…` | `540d49f2deb2c8d600b5b866675d145cf76a1e46` |
| 12 | `tests/g3_startup_validation.test.ts` | `9a5fd9e3…` | `edd0305e3e5891020b2b045ab2cf082cd6cf788f` |

The amended designations are valid at IPD commit **`a891802e2691bd9c65a67d6abff20d8ce0c26d7d`** (tree `76f083d7058e170d8212455c03bad1033136ee68`). Both blobs were verified at that commit.

## Do not

- Do not change any other designated item.
- Do not change code. Do not restore the act's `4a005b73` or `9a5fd9e3` (A-O5 is not chosen; it would undo the effective DR-2 change and the `c62dee8` change).
- Do not change the tracker status cells beyond the amendment pointer.

## Prerequisites (confirm before writing)

1. `a891802e` is on IPD `main` (ancestor of tip; verified in IRR this pass).
2. CI on `a891802e` is green (check-runs verified in IRR this pass; re-confirm at execution).
3. The `540d49f2` and `edd0305e` blobs match `git ls-tree a891802e` (verified in IRR this pass).

## Expected evidence (return to IRR for recording)

- IPD commit hash and tree hash of the amendment, exact-head CI result, remote read-back of the amended designation list.
- A statement that items other than 10 and 12 are unchanged.
- Remote verification that `a891802e` remains an ancestor of `main`.

## After execution (IRR, separate pass)

IRR records the executed A-Q5 act and closes Matter A. A-Q6 (act §8.2 stop) clears on this act only. Designation B (P-1 coordinate) remains conditional on fresh S2 and H-12 at `a891802e`.
