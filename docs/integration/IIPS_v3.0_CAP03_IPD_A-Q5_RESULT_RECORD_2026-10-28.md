# CAP-03 — IPD-A-Q5 result record and Matter A reconciliation (2026-10-28)

**IRR repository:** `ramkivs/iips-review-recovered`. **Branch:** `arena/b776c15a-iips-review-recovered` (PR #353, open, not merged).
**Standing status (unchanged):** P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.
> **Dated pointer (2026-10-29, `CV-CORR-178`, §16.198; original text preserved).** Line 32 lists "A-O3 (mechanism)" among the rulings this act records. The rulings record (`docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` §1 line 20 and §5) records A-Q4 and the A-Q5 mechanism as open and lists A-O3 as "recommended", not ruled. `evidence/integration/cap03-ruling-sitting-packet-2026-10-28/06-recommendations.tsv` marks the decision rows A-Q4, A-Q5 and A-Q6 `RECOMMENDATION ONLY - NOT ADOPTED`. This act's executed content (designated blobs for items 10 and 12) is not changed by this pointer. Sequencing and mechanism remain PA-reserved (§16.176.9; §16.197; §16.198).


---

## 1. IPD act and publication (verified remotely)

| Item | Value | Verification |
|---|---|---|
| Act ID | `IIPS-V3-CAP02-GATE-A-PRIME-AMEND-01-DESIGNATED-BLOBS-2026-10-28-01` | Act file header |
| Act file | `evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_AMEND_01_DESIGNATED_BLOBS_EFFECTIVE_2026-10-28.md`, blob `7b2c3c3b96be5a37f1a37d374462ec92cce56b1e` | `git ls-tree 0edadb2d` |
| IPD merge commit | `0edadb2d128c9cf85e1522f0b7828d9e99d6d5cf` (IPD PR #107; parents `1ba0740a`, `0a8aab95`) | IPD API; equals IPD `main` tip on `git ls-remote` |
| CI on merge commit | "typecheck · build · test" success; "executed test count" success | IPD check-runs API |
| Publication receipt | IPD execution tracker, section "CAP-02 — Gate A′ designated-blob amendment act executed" (tracker line ~2439 at `0edadb2d`) | `git show 0edadb2d:<tracker>` |
| Designated basis | commit `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`, tree `76f083d7058e170d8212455c03bad1033136ee68` | `git rev-parse`; `a891802e` is an ancestor of `0edadb2d` |
| Mechanism | A-O3 (re-pin §2.1 items 10 and 12); A-O5 not selected | Act header |
| Act amended | successor provisioning act, blob `528de6aeddbc8e5f3191be8792f3937d77de4037` (preserved byte-unchanged) | Act header |

**Designated blobs (verified this pass):**

| Item | Path | At `a891802e` | At IPD `main` `0edadb2d` | Designated | Result |
|---|---|---|---|---|---|
| 10 | `src/persistence/portfolio_store.ts` | `540d49f2deb2c8d600b5b866675d145cf76a1e46` | same | `540d49f2…` | match |
| 12 | `tests/g3_startup_validation.test.ts` | `edd0305e3e5891020b2b045ab2cf082cd6cf788f` | same | `edd0305e…` | match |

## 2. Reconciliation with the recorded PA rulings and designation

- **A-Q1 (YES), A-Q2 (`edd0305e`), A-Q3 (workstream-scoped), A-GAP1 (act row S1 governs), A-O3 (mechanism), target commit `a891802e`:** the IPD act records each of these exactly. No ruling is reopened. The act adds no condition.
- **A-O5 not adopted:** neither `4a005b73…` nor `9a5fd9e3…` is restored.
- **Designation C (designation record §3):** satisfied for items 10 and 12, as recorded in IPD.

## 3. §8.2 stop condition — limb by limb

The stop condition in the successor act §8.2 reads: "Basis commit/tree or any designated blob differs · … In every case: stop, record, do not proceed."

| Limb | Status | Basis |
|---|---|---|
| Designated blobs, items 10 and 12 | **CLEARED** | Act §4; both blobs verified at `a891802e` and `0edadb2d` (§1 above) |
| Basis commit/tree | **CLEARED under PA reading (ii)** | Compiled `BASIS_COMMIT` `5fc74085ade980846ff4a07b36415b6d49446486` and `BASIS_TREE` `7226ef0033b3a7049169d8fcf9bcbc9908e2590b` equal the successor act's selected basis (§5.2). Verified unchanged at `0edadb2d` and `a891802e`; `5fc74085^{tree}` = `7226ef00`; `5fc74085` is an ancestor of `a891802e`. The executing commit is recorded through the D2 receipt (`executingCommit` / `executingTree`), not compared to the constants. |
| Identity values | **NOT CLEARED (unchanged)** | `PRINCIPAL_LABEL`, `TENANT_ID`, `CANONICAL_OWNER_ID` are `null` (successor act §4/§5.2). A separate PA identity-value determination is still required. Not touched by the A-Q5 act. **[Correction CV-CORR-158 (2026-10-28, §16.178): the row above is stale. The three constants are non-null at IPD `main` `b9dd6fce` and at the designated pin `a891802e`, set by binding commit `f9ec0c5` (an ancestor of both), using the values in the PA's S1 identity-value determination of 2026-10-24. S1 provisioning execution remains BLOCKED. See `IIPS_v3.0_CAP03_S2_RECONCILIATION_RECORD_2026-10-28.md` §2.]** |
| Host, Node-version, P-1-condition, pre-existing-row, V-A2, store-repair | Unchanged by the act (act §4). **Not verified by IRR.** Gated host or runtime conditions. | Act §4 |

**Basis reading (PA ruling, round 5).** The compiled-basis question was first answered by option (a), a compiled-basis amendment to `a891802e`. On re-reading the successor act and the D2 text, that answer rested on a reading that needed confirmation. The PA then ruled **reading (ii)**: §8.2 checks that the compiled constants equal the selected basis, and the executing checkout is recorded through the D2 receipt. Under (ii) the basis limb holds and no compiled-basis amendment is required. The earlier option (a) is **superseded** by this ruling and is not executed. Reading (i), where the executing checkout is compared, was not selected.

## 4. Matter A and A-Q6 status

- **Matter A: CLOSED (as to the §7 closure test).** The act's §7 says Matter A closes when the act is executed on IPD `main` and recorded in IRR. Both are now done: the IPD half is executed (`0edadb2d`), and this record is the IRR half. The designated-blob limb is cleared (§1), and the basis limb is cleared under ruling (ii) (§3).
- **A-Q6 (§8.2 stop, designated-blob limb):** **CLEARED**, items 10 and 12 only.
- **Scope of "Matter A closed":** this is not a clearance of the other §8.2 limbs. Identity values were already resolved by the PA's S1 identity-value determination of 2026-10-24 (binding commit `f9ec0c5`); this record's reading of them as unresolved was stale (correction CV-CORR-158, §16.178), and the host, Node, P-1 and V-A2 limbs are gated and unverified by IRR (§3).

## 5. IPD-S1 (A-GAP1 pointer correction) — PUBLISHED (verified 2026-10-28)

- **Status: PUBLISHED.** IPD PR #108 merged; IPD `main` merge `b9dd6fce48fafba8ca6095debefb62fd54234f85`; pre-merge head `bda1f057`. Record `IIPS-V3-CAP03-S1-POINTER-ACT-01-2026-10-28-01`, act `evidence/cross-repository/IIPS_V3_CAP03_S1_POINTER_ACT_01_EFFECTIVE_2026-10-28.md`, pointer under §12.2 of the S1 determination (`+25/-0`, §12.2 preserved), receipt in the IPD execution tracker (`+63/-0`).
- **Distinction.** The pointer identifies the governing text (Gate 4 act §6 row S1). It does not execute S1. S1 remains `BLOCKED`.
- **Full reconciliation and remaining dependencies:** `docs/integration/IIPS_v3.0_CAP03_IPD_S1_PUBLICATION_AND_DEPENDENCY_HANDOFF_2026-10-28.md`.
- The IRR S1 prompt (`IIPS_v3.0_CAP03_IPD_PROMPT_S1_POINTER_2026-10-28.md`) is not edited, because the published act cites its blob.

## 6. B-1, fresh S2, H-12, and formal §4.6 step 5

- **B-1 (P-1 coordinate, `a891802e`):** ruled. Effectiveness requires Matter A closed (**now met**) **and** fresh S2 and H-12 at `a891802e` (**not met**). **Not effective. Not relied upon.**
- **Fresh S2 at `a891802e`:** no evidence in the repository. Operator-side native run on Windows (route (c)). **Not run; not claimed.**
- **H-12 regeneration at `a891802e`:** no evidence in the repository. Owner per matrix is IPD with IRR; tooling not assessed. **Not claimed.**
- **Formal §4.6 step 5:** **OPEN.** The pin `a891802e` is not relied upon until steps 5–6 complete.

## 7. Other conditions — unchanged, stated as such

- **D-INST candidate** (`evidence/integration/cap03-p1-d-inst-d2-candidate-2026-10-28/`): unparsed and unrun. Not ready for use. Requires PA identity adoption and A6 on the host.
- **R-2 transcript integrity:** the `s2-checkout-verification.txt` mismatch (deposited `0df30bc6…`, recorded `3FD31FE6…`) remains open.
- **E8 host root** (`D:\cap03-p1-capture-20261028-01`): existence on the host **unverified** (operator-side evidence required).
- **Successful IPD CI** on `0edadb2d` is not evidence that any of the above passed.

## 8. Tracker note

The IRR master tracker was not edited in this pass. The record above is the IRR-owned pointer for the A-Q5 result. The user's Library tracker was not modified.

## 9. Basis-limb reading history

1. Round 5, first question: option (a), a compiled-basis amendment to `a891802e`. Superseded (see below).
2. Round 5, second question, after the D2 text was re-read: reading (ii), constants vs selected basis. **Selected by the PA.** Basis limb cleared on this reading.
3. No compiled-basis amendment act, no IPD write, and no change to `BASIS_COMMIT` or `BASIS_TREE` are authorized or performed.
