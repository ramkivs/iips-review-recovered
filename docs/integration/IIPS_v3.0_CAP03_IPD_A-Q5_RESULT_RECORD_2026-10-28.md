# CAP-03 — IPD-A-Q5 result record and Matter A reconciliation (2026-10-28)

**IRR repository:** `ramkivs/iips-review-recovered`. **Branch:** `arena/b776c15a-iips-review-recovered` (PR #353, open, not merged).
**Base for this record:** IRR head `caca0213` (E3 procedure revision 2026-10-28d; PA rulings rounds 1–4; designation record).
**Standing status (unchanged):** P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

---

## 1. IPD act and publication (verified remotely in this pass)

| Item | Value | Verification |
|---|---|---|
| Act ID | `IIPS-V3-CAP02-GATE-A-PRIME-AMEND-01-DESIGNATED-BLOBS-2026-10-28-01` | Act file header |
| Act file | `evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_AMEND_01_DESIGNATED_BLOBS_EFFECTIVE_2026-10-28.md`, blob `7b2c3c3b96be5a37f1a37d374462ec92cce56b1e` | `git ls-tree 0edadb2d` |
| IPD merge commit | `0edadb2d128c9cf85e1522f0b7828d9e99d6d5cf` (IPD PR #107; parents `1ba0740a`, `0a8aab95`) | IPD API; equals IPD `main` tip on `ls-remote` |
| CI on merge commit | "typecheck · build · test" success; "executed test count" success | IPD check-runs API |
| Publication receipt | IPD execution tracker, section "CAP-02 — Gate A′ designated-blob amendment act executed" (tracker line ~2439) | `git show 0edadb2d:<tracker>` |
| Basis | commit `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`, tree `76f083d7058e170d8212455c03bad1033136ee68` | `git rev-parse`; ancestry of `0edadb2d` confirmed |
| Mechanism | A-O3 (re-pin §2.1 items 10 and 12); A-O5 not selected | Act header |
| Act amended | successor provisioning act, blob `528de6aeddbc8e5f3191be8792f3937d77de4037` (preserved byte-unchanged) | Act header; successor act at `1ba0740a` |

**Designated blobs (verified this pass):**

| Item | Path | At basis `a891802e` | At IPD `main` `0edadb2d` | Designated |
|---|---|---|---|---|
| 10 | `src/persistence/portfolio_store.ts` | `540d49f2deb2c8d600b5b866675d145cf76a1e46` | same | `540d49f2…` — match |
| 12 | `tests/g3_startup_validation.test.ts` | `edd0305e3e5891020b2b045ab2cf082cd6cf788f` | same | `edd0305e…` — match |

## 2. Reconciliation with the recorded PA rulings and designation

- **A-Q1 (YES), A-Q2 (`edd0305e`), A-Q3 (workstream-scoped), A-GAP1 (act row S1 governs), A-O3 (mechanism), target commit `a891802e`:** the IPD act records each of these exactly. No ruling is reopened. The IPD act does not add a condition.
- **A-O5 not adopted:** neither `4a005b73…` nor `9a5fd9e3…` is restored. Consistent with the rulings.
- **Designation C (designation record §3):** satisfied for items 10 and 12, as recorded in IPD.

## 3. §8.2 stop condition — limb by limb

The stop condition in act §8.2 reads: "Basis commit/tree or any designated blob differs · … In every case: stop, record, do not proceed."

| Limb | Status | Basis |
|---|---|---|
| Designated blobs, items 10 and 12 | **CLEARED** (this pass) | Act §4 states this; both blobs verified at `a891802e` and at `0edadb2d` |
| Basis commit/tree | **NOT CLEARED** | See below |
| Host, Node-version, P-1-condition, pre-existing-row, identity-value, V-A2, store-repair | Unchanged by the act (per act §4). **Not verified by IRR.** | Act §4 |

**Basis limb (verified, not inferred).** The act states that its compiled basis is unchanged: `BASIS_COMMIT = 5fc74085ade980846ff4a07b36415b6d49446486`, `BASIS_TREE = 7226ef0033b3a7049169d8fcf9bcbc9908e2590b` (both re-checked in IPD: `5fc74085^{tree} = 7226ef00…`; `5fc74085` is an ancestor of `a891802e`). The designated basis is `a891802e` / `76f083d7`. The two differ. The act says: "any checkout whose basis differs from those constants still triggers §8.2 exactly as before." **The basis limb is therefore engaged, and the designated-blob result does not clear it.**

**Minimum corrective action:** a separate express PA-authorized act that amends `BASIS_COMMIT` and `BASIS_TREE` to `a891802e` / `76f083d7`, with re-validation of the three identity constants. The A-Q5 act expressly does not do this. No existing ruling authorizes it. This is a genuine PA choice (see the sitting question recorded with this pass).

## 4. Matter A and A-Q6 status

- **Matter A closure:** **NOT CLOSED.** The IPD act's §7 says Matter A closes when the act is executed on IPD `main` and recorded in IRR. The IPD half is executed, and this record is the IRR half. The basis limb remains engaged, so Matter A is not closed and the act does not clear the stop for P-1 use.
- **A-Q6 (§8.2 stop):** **partially cleared** — designated-blob limb only. The basis limb remains open.

## 5. IPD-S1 (A-GAP1 pointer correction)

- **Status: PENDING.** No IPD-S1 pointer is present on IPD `main` at `0edadb2d` (search of `*.md`). The IPD tracker still lists `IPD-S1` as a separate act ("disputed; correction only if PA requires", tracker line ~2383).
- The A-GAP1 ruling is recorded in IRR. Whether it satisfies the tracker's trigger for IPD-S1 is for IPD to decide. IRR does not write IPD.
- The IRR prompt is `docs/integration/IIPS_v3.0_CAP03_IPD_PROMPT_S1_POINTER_2026-10-28.md`. It has not been performed.
- The A-Q5 act is not a substitute for IPD-S1 and does not claim to be one.

## 6. B-1, fresh S2, H-12, and formal §4.6 step 5

- **B-1 (P-1 coordinate, `a891802e`):** ruled, **not effective**. Its effectiveness requires Matter A closed (basis limb open, so not met) and fresh S2 and H-12 at `a891802e` (not produced). **Not advanced.**
- **Fresh S2 at `a891802e`:** **no evidence in the repository.** The Q-S2-2 route (c) is recorded, and the native run is an operator action. **Not run; not claimed.**
- **H-12 regeneration at `a891802e`:** **no evidence in the repository.** Not claimed.
- **Formal §4.6 step 5:** **OPEN.** Not satisfied. The pin `a891802e` is not relied upon.

## 7. Other conditions — unchanged, and stated as such

- **D-INST candidate** (`evidence/integration/cap03-p1-d-inst-d2-candidate-2026-10-28/`): unparsed and unrun. Not ready for use. Requires PA identity adoption and A6 on the host.
- **R-2 transcript integrity:** the `s2-checkout-verification.txt` mismatch (deposited `0df30bc6…`, recorded `3FD31FE6…`) remains open.
- **E8 host root** (`D:\cap03-p1-capture-20261028-01`): existence on the host **unverified** (operator-side evidence required).
- **Successful IPD CI** on `0edadb2d` is not evidence that any of the above passed.

## 8. Tracker note

The IRR master tracker was not edited in this pass. The record above is the IRR-owned pointer for the A-Q5 result. The user's Library tracker was not modified.
