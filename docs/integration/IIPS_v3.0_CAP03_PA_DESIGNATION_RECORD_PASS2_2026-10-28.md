# CAP-03 — PA designation record, pass 2 (2026-10-28)

**Repository:** IRR `ramkivs/iips-review-recovered`. **Base:** `b9e8d4a5` (rulings record). PR #353 open, not merged.
**Basis:** rulings in `docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md` (G4-PIN = G4P-1 at a891802e; B-Q1 = B-1 at a891802e; A-Q5 mechanism = A-O3 at a891802e; A-Q4 = YES).
**Authority boundary:** this record designates identities for the PA sequence. It does not write to IPD, does not execute S2, H-12, P-1, host work, or merge.
**Standing status (unchanged):** P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

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
