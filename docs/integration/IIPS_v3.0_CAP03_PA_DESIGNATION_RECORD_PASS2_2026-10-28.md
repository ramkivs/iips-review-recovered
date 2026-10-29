# CAP-03 — PA designation record, pass 2 (2026-10-28)

**Repository:** IRR `ramkivs/iips-review-recovered`. **Base:** `b9e8d4a5` (rulings record). PR #353 open, not merged.
> **Status update (2026-10-29, `CV-CORR-179`, §16.199).** PR #353 is **MERGED** (merge `fcc0227`, `2026-10-29T10:41:19Z`). The "open, not merged" text in this header is the 2026-10-28 point-in-time status and is preserved unchanged.
**Basis:** rulings in `docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` (G4-PIN = G4P-1 at a891802e; B-Q1 = B-1 at a891802e; A-Q5 mechanism = A-O3 at a891802e; A-Q4 = YES).
**Authority boundary:** this record designates identities for the PA sequence. It does not write to IPD, does not execute S2, H-12, P-1, host work, or merge.
**Standing status (unchanged):** P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

> **Verification annotation (2026-10-29, `CV-CORR-178`, §16.198). Original text above is preserved verbatim; this annotation does not restate a ruling.**
> 1. **The basis cited above is not supported by the rulings record.** `docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` (`b9e8d4a5`, 14:05Z; carried unchanged at `caca0213` and on `main`) lists G4-PIN, B-Q1 and A-Q5 as not decided (§5), A-Q4 as "Not ruled in this pass (remain open)" and A-Q6 as open (§1 line 20). It records A-O3 only as "recommended". It contains no ruling text for G4P-1, B-1 or A-Q4 = YES.
> 2. **The recommendation file marks each item as not adopted.** `evidence/integration/cap03-ruling-sitting-packet-2026-10-28/06-recommendations.tsv` (commit `d895e54`, 2026-10-28 13:47Z) carries `RECOMMENDATION ONLY - NOT ADOPTED; Table 1 status unchanged` on the rows A-Q4, A-Q5, A-Q6, B-Q1 and G4-PIN. The register `01-sitting-decision-register.tsv` shows those items `AWAIT-PA` (G4-PIN: "unresolved (trigger met)").
> 3. **Downstream records cite this record as their ruling source.** IPD PR #107 (`0edadb2d`, merged 2026-10-28T15:30:43Z) lists "`A-Q4` `521d5482…` authorizes the two PR #96 paths · `A-Q5` mechanism `A-O3`" among its applied rulings. It locates them at IRR PR #353 head `caca0213…`, where the rulings record says A-Q4 is not ruled and A-O3 is recommended. The IRR A-Q5 result record and S1 handoff also cite this record (see their dated pointers).
> 4. **Status.** The status "Ruled; not yet effective for reliance" (Designation B, line 49) and the other "Ruled" entries are **not verified** by any ruling text in the repository. Whether the PA gave these rulings in the sitting response is a **reserved PA confirmation**, not something this record can establish. No rule, gate, pin or P-1 status is changed by this annotation.
> 5. **Two P-1 coordinates are recorded and not reconciled in the repository.** `521d5482` (PA-rendered disposition, 2026-10-26) §5 designates `001c3c80618f2ee1d40e9a90912237e1a06e7b58` as the coordinate "at which P-1 of record would be executed". Tracker §16.160 (`CV-CORR-140`, `CHG-2026-10-28-03`) records the PA adoption of DA-A1, limited, naming the §16.143 coordinate `001c3c80` as the act-designated pin, and that the P-1 authorization act must name the execution commit. This Designation B names `a891802e` as "the P-1 coordinate". The rulings record §6 line 86 (ADP-D1) records as "Adopted" that "the P-1 execution commit is the designated B-1 commit `a891802e`". The two adopted positions cannot both govern as written. Which commit the P-1 authorization act must name is a **reserved PA item**; no P-1 status is changed here.
> 


---

## 1. Designation A — Gate 4 QE/H-12 content pin (route (c) prerequisite)

| Identity | Value | Verified this pass |
|---|---|---|
| Commit | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` (IPD merge of PR #100) | Yes (IPD API) |
| Tree | `76f083d7058e170d8212455c03bad1033136ee68` | Yes (`git rev-parse a891802e^{tree}`) |
| Purpose | Gate 4 QE/H-12 content pin (formal §4.6 "L2a, L2c, or other": L2a and L2c evidence at this pin) | Ruling G4P-1 |
| Blob (changed code path) | `src/persistence/gateAPrimeProvisioning.ts` = `5f49936b61efd07cc7b151d8f028f1020e48aee0` | Yes |
| Blob (changed code path) | `tests/g3_gate_a_prime_successor_provisioning.test.ts` = `1f66621690f724d5c17f2f035dbdaceb9e7348db` | Yes |
| Not designated | `001c3c80` (not a Limb A commit); `a52b47b0` (Limb A; not this pin) | Recorded |

**Scope.** Per G4P-1, the non-Limb-A content of `a891802e` is accepted for the QE/H-12 pin by express scope acceptance. This record does not accept any Limb A content, and the Limb A run is not authorized by it.

### §4.6 status at designation

| Step | Requirement | Status |
|---|---|---|
| 1 | Commit exists on IPD `main` with exact-head CI green and remote read-back | **Satisfied.** Ancestor of IPD `main` (tip `1ba0740a`, remote read-back this pass). Check-runs on `a891802e`: "typecheck · build · test" success; "executed test count" success. |
| 2 | Delta classified (non-evidence list from prior pin) | **Satisfied.** `001c3c80..a891802e` changes 62 paths: 2 non-evidence (the two blobs above) and 60 under `evidence/`. Under the workstream-scoped reading (A-Q3), the two code paths are the in-scope change set; the 60 evidence paths are governed by their own records. |
| 3 | Designated tests run at the candidate (Linux CI; native Windows where the governing act requires it) | **Linux CI satisfied** (check-runs above). **Native Windows: not claimed.** Whether the governing act requires it for this pin is not established by this pass. |
| 4 | PA designation act names commit, tree, blobs, purpose | **Satisfied by this record**, on the G4P-1 ruling. |
| 5 | Evidence at the designated commit: fresh S2 (L2a) and H-12 regeneration with full validation (L2c) | **NOT satisfied.** S2 is an operator native run (route (c)), not started. H-12 regeneration is not started. |
| 6 | Receipt, designation and evidence reference the same identities | **Open until step 5.** This record is the designation identity reference. |

**Reliance.** Per §4.6, no dependent acceptance or execution may rely on this pin until steps 5 and 6 are complete. The operator native S2 run at `a891802e` is now eligible (route (c) chosen; pin designated). Its result is not claimed here.

## 2. Designation B — P-1 coordinate (B-Q1 = B-1)

| Identity | Value |
|---|---|
| Commit | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` |
| Tree | `76f083d7058e170d8212455c03bad1033136ee68` |
| Status | **Ruled; not yet effective for reliance.** |

**Effective only when:** (i) Matter A closes, which requires the A-Q5 IPD act (Designation C below) to be executed; and (ii) fresh S2 and H-12 at `a891802e` exist (§4.6 step 5). Until then, P-1 remains NOT AUTHORIZED.

## 3. Designation C — Matter A designations (A-Q5 mechanism A-O3, target `a891802e`)

Designations for the IPD act (executed in IPD, not in IRR):

| Item | Path | Designated blob (by ruling) | Verified at `a891802e` |
|---|---|---|---|
| 10 | `src/persistence/portfolio_store.ts` | `540d49f2deb2c8d600b5b866675d145cf76a1e46` (A-Q1 YES: DR-2 authorizes the change; replaces the act's `4a005b73`) | Yes (`git ls-tree`) |
| 12 | `tests/g3_startup_validation.test.ts` | `edd0305e3e5891020b2b045ab2cf082cd6cf788f` (A-Q2) | Yes (`git ls-tree`) |

Matter A closes when this IPD act is executed and recorded in IRR. A-Q6 (act §8.2 stop) is cleared only by that act.

## 4. Triggered separate IPD prompts (not executed from IRR)

- **IPD-P-A-Q5:** designation act for items 10 and 12 at `a891802e` (Designation C). See `docs/integration/IIPS_v3.0_CAP03_IPD_PROMPT_A-Q5_2026-10-28.md`.
- **IPD-S1:** pointer correction of determination §12.2 so that act row S1 governs (A-GAP1 ruling). See `docs/integration/IIPS_v3.0_CAP03_IPD_PROMPT_S1_POINTER_2026-10-28.md`.

## 5. Operator actions now eligible (not executed)

- **Native S2 run at `a891802e`** on a native Windows host, per the route (c) ruling and the Gate 4 act. This is the operator's action. It is not CI and not claimed here.
- **Supply of R-1 output** (47-entry operator output). Non-blocking under the R-1 ruling; PASS stays user-reported until supplied.

## 6. Rulings since this record was first written (rounds 3 and 4)

Recorded in `docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` §6: D1 open pending read-back; PF10 KEEP; D-Q object store parent, method D-2 with D-1 supporting; ADP-D1 adopted; ADP-D2 accepted at `a891802e` for the P-1 receipt element; QP1 approved; MC-2; E7 next capture only; B-Q4 on formal text; E8 parent D:, root path not yet given.

**Still open:** the E8 root path (E3 waits); D-INST identity adoption and A6 (see §7 of this record once published).


## 8. IPD-A-Q5 result (verified 2026-10-28; updated after round-5 rulings)

IPD act `IIPS-V3-CAP02-GATE-A-PRIME-AMEND-01-DESIGNATED-BLOBS-2026-10-28-01` published at IPD `main` merge `0edadb2d` (PR #107; CI green). Items 10 and 12 re-designated at `a891802e` as ruled. **Designated-blob limb cleared. Basis limb cleared under PA reading (ii)** (compiled `BASIS_COMMIT` `5fc74085` / `BASIS_TREE` `7226ef00` equal the selected basis; executing commit recorded via D2). **Matter A closed as to the act §7 closure test.** B-1 remains **not effective**: fresh S2 and H-12 at `a891802e` are not produced. Identity values remain unresolved. Details: `docs/integration/IIPS_v3.0_CAP03_IPD_A-Q5_RESULT_RECORD_2026-10-28.md`.

**IPD-S1 (pointer) status, 2026-10-28:** published at IPD `b9dd6fce` (PR #108; act `IIPS-V3-CAP03-S1-POINTER-ACT-01-2026-10-28-01`). It records the governing text only. S1 execution remains BLOCKED. Dependency handoff: `docs/integration/IIPS_v3.0_CAP03_IPD_S1_PUBLICATION_AND_DEPENDENCY_HANDOFF_2026-10-28.md`.
