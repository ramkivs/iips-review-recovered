# DEC-D21-FENCE8-DETERMINATION — Fence-8 Determination: Narrow Future Relief Pathway Authorized, No Relief Granted

- **Record ID:** `DEC-D21-FENCE8-DETERMINATION`
- **Title:** D-21 §7 — Fence-8 Determination: Pathway Authorized in Principle, Fence-8 Intact, No Relief and No Mutation Granted
- **Class:** `DECISION`
- **Status:** `RECORDED — D-21 §7 = B — PATHWAY AUTHORIZED / NO RELIEF GRANTED`
- **Date:** 2026-08-28 (decision) · restored 2026-08-29
- **Authority relationship:** the maintainer selected **B — authorize a narrowly scoped future
  relief pathway** at the `D-21 §7 Fence-8 Determination` gate, in **governance-only mode**.
  Recording was directed as a file-creation operation with **no commit and no push**. **No
  fence-relief, product-branch-mutation, evidence-creation, acceptance, certification or matrix
  authority was granted or inferred.**
- **Scope:** the fence-8 determination and the pre-computed minimum-relief map. **No correction
  implemented, no product/source/test/schema/persistence/parser/UI code created or modified, no
  documentation files created, no fence-8 relief exercised, `SPEC-G-AI-IMPL` §5 not amended, no
  mutation authority granted, no housekeeping performed, no unrelated governance decision
  altered.**
- **Provenance:** **RESTORED RECORD.** The original working-tree copy was destroyed by sandbox
  re-provisioning before it was committed. This is a faithful reconstruction from the contents
  established at the gate; every factual assertion was **re-verified against `origin` at
  restoration time** — the fence text and the COL precedent from `origin/arena`, the tree facts
  from `origin/phase13-next` at `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`. **No new finding is
  introduced and no authority is altered by the restoration.**
- **Supersession / revision relationship:** amends nothing. `SPEC-G-AI-IMPL` §5 is **unchanged**.
  All ten fences remain in force exactly as written.

---

## 1. NUMBERING NOTE — RECORDED TO PREVENT FUTURE AMBIGUITY

This programme has a documented history of namespace collision
(`DEC-D16-TIER3-DOCUMENTATION-PARITY-EXECUTION` §10, `D-NS-COLLISION`), so the numbering is stated
explicitly:

| Fact | Value |
|---|---|
| This decision was designated by the maintainer as | **D-21 §7** |
| The gate at which §7 was presented in-session was labelled | **D20** |
| Does a `DEC-D20-*` record exist? | **NO — 0 records.** D20's recording step was skipped, so the determination this decision rests on was never separately captured |
| Consequence | The durable store runs `DEC-D19-PRODUCT-BRANCH-STATE` → **this record**, with no `DEC-D20`. The §1–§6 determination is therefore reproduced in §3 below so this record is self-contained |
| The successor gate identified in-session as *"D21 — Tier-3 Methodology-Acceptance Recording Gate"* | **Renumbered by this record's designation**, and identified in §8 **descriptively** rather than by a bare number |

---

## 2. DECISION

# **D-21 §7 — B — PATHWAY AUTHORIZED / NO RELIEF GRANTED**

The following are recorded as **binding**:

1. **Fence-8 remains intact.** All ten must-not-touch boundaries stand exactly as written in
   `SPEC-G-AI-IMPL` §5.
2. **No fence-8 relief or mutation is granted by this record.**
3. A **narrowly scoped future relief pathway is authorized in principle.**
4. The pathway shall follow the established **COL-1 … COL-4 precedent**:
   - **explicit maintainer authorization**;
   - authorization **recorded as a `DECISION`**;
   - the `DECISION` may amend **`SPEC-G-AI-IMPL` §5 only**;
   - **no broader fence-8 relaxation is authorized.**
5. The **minimum-relief map** is recorded as **pre-computed scope** for a later dedicated relief
   gate (§4 below):
   - **correction: 3 files**;
   - **documentation: new-file creation under the 3 Tier-3 directories.**
6. **This decision does not authorize execution of that future relief.**
7. **Actual mutation remains subject to a separate dedicated relief authorization gate.**

---

## 3. THE DETERMINATION THIS DECISION RESTS ON

### 3.1 The authoritative fence-8 text, exactly as written

From `governance/iips/SPEC-G-AI-IMPL.md` §5, heading *"## 5. Must-not-touch boundaries — 10"*:

> `| 8 | `ies-010 … ies-020`, `iips-cross-sector` — certification baselines; CSIP excluded per D5 |`

| Element | From the text |
|---|---|
| Protected paths | `ies-010 … ies-020` and `iips-cross-sector` |
| Prohibition | "Must-not-touch" (the §5 heading); the text does not distinguish create / modify / delete |
| Stated rationale | "certification baselines" |
| Exception | "CSIP excluded per D5" — the only one stated |
| Authority required for relief | **Not stated in the fence text.** No record defines a relief mechanism |
| Product-branch invariant vs governance convention | A **governance specification** naming **product-branch paths**. `AUTH-G-AI-IMPL:12` states it *"Binds the implementation scope only."* **The text does not state whether it persists beyond that implementation** — not inferred here |

**Measured coverage on `phase13-next` (`357b34dac1bd…`):** the range resolves to **9 existing
directories** — `ies-010-hospitality`, `ies-011-energy`, `ies-012-utilities`, `ies-013-consumer`,
`ies-014-industrials`, `ies-015-technology`, `ies-016-telecommunications`, `ies-017-automobile`,
`ies-020-materials-metals` (**no `ies-018`/`ies-019` exist**) — plus `iips-cross-sector`
(**29 files**). **`governance/` appears in 0 of the 10 fence rows.**

### 3.2 Conflict classification

| Action | Exact path(s) | Inside fence 8? |
|---|---|---|
| **A.** Correct `D-AUTHCLAIM-UNSUPPORTED` | the 3 files in §4.1 | **YES — all 3** |
| **B.** 60 documentation-parity artifacts | `ies-016/017/020-*/docs/*.md` (57) + `ies-0xx_ARCHITECTURE_REVIEW.md` (3) | **YES — all 60** |
| **C.** Methodology acceptance records | `governance/iips/` on `arena` **or** `ies-0xx/…` | **Only if placed in an engine dir** |
| **D.** Verification evidence | engine dirs and/or `iips-platform/**` | **YES — fence 8 and/or fence 4** |
| **E.** A2 → A1 transition | matrix `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` | **NO — that is fence 9** |
| **F.** Certification / matrix | matrix → fence 9; certification record in `governance/iips/` → unfenced | **NO — fence 9, not 8** |

**Key finding:** methodology acceptance recorded in `governance/iips/` on `arena` requires **no
fence-8 relief** — that path is inside no fence. It is the only proposed action entirely
fence-8-free.

---

## 4. MINIMUM-RELIEF MAP — PRE-COMPUTED FUTURE SCOPE

Recorded as scope only. **No relief is granted and nothing here may be executed under this
record.**

### 4.1 Correction of `D-AUTHCLAIM-UNSUPPORTED` — **3 files**

The unsupported claims occupy **6 lines in exactly 3 distinct files**:

| File | Lines |
|---|---|
| `ies-017-automobile/AUTOMOBILE_DISCOVERY_PACK.md` | 5, 245 |
| `ies-020-materials-metals/MATERIALS_METALS_DISCOVERY_PACK.md` | 6, 8, 221 |
| `ies-020-materials-metals/contract-tests/generate_expected_outputs.py` | 18 |

**Minimum relief: narrow, path-specific relief for exactly these 3 files** — not the 9
directories, not the whole `ies-010 … ies-020` range.

### 4.2 Documentation-parity programme — new-file creation under 3 directories

| Item | Value |
|---|---|
| Tier-3 directories | **3** (`ies-016-telecommunications`, `ies-017-automobile`, `ies-020-materials-metals`) |
| Current `docs/` contents | **0** |
| Artifacts in scope | 57 numbered documents + 3 `ARCHITECTURE_REVIEW` = **60** |
| **Minimum relief** | **New-file creation only** under those 3 directories, expressly **excluding** modification of the existing certified artifacts |

### 4.3 Actions requiring **no** fence-8 relief

- Methodology acceptance recorded in `governance/iips/` on `arena`
- The governance-side determination of any A2 → A1 transition (the **matrix** amendment is
  fence **9**, a separate matter)
- The certification record itself, which lives in `governance/iips/` and is unfenced

---

## 5. THE COL-1 … COL-4 PRECEDENT, VERBATIM

`DEC-G-AI-IMPL-COL-RESOLUTION` records:

> *"Authorized explicitly by the maintainer as outcome **A — AUTHORIZE COL-1 THROUGH COL-5**, with
> separate recording authority granted for the specification amendment and this record."*
> *"**Scope:** resolves the contradiction between the 13-path implementation surface and fence 10.
> **Amends `SPEC-G-AI-IMPL` §5 only.** Does **not** authorize implementation, checkout, deletion,
> worktree unblocking, commit target, or certification."*

This is the mechanism §2.4 adopts: **explicit maintainer authorization, recorded as a `DECISION`,
amending `SPEC-G-AI-IMPL` §5 only, with no collateral authority.**

### 5.1 Relief forms assessed

| Form | Supported? |
|---|---|
| 1. Temporary / narrow path-specific relief | **YES — precedented** (COL-1 … COL-4) |
| 2. Permanent fence amendment | **Not supported by precedent and not necessary** |
| 3. Exception to the fence | **YES — precedented**; COL-1 reinterpreted fence 10 as *"evidence-preservation … not a permanent pathname reservation"* |
| 4. Methodology / convention change | **Not required** — nothing about the A1 standard needs to change |

**D7-3 is untouched.** Fence relief concerns **paths**, not the A1 evidentiary standard. Granting
path relief would **not** lower A1 and would **not** create a Tier-3 exception to it.

---

## 6. REJECTED OPTIONS, RECORDED EXPLICITLY

| Option | Disposition |
|---|---|
| **A — Keep fence-8 intact; no relief** | **NOT SELECTED.** Recorded as **preserving the intact fence-8 baseline**, which this decision also does — the difference is that D-21 additionally establishes the narrow **future** pathway while granting **no present relief**. Fence-8 is intact under both A and B |
| **C — Open a methodology/convention review of fence-8** | **REJECTED.** The evidence does not require reinterpretation of fence-8, and the COL-1 … COL-4 precedent already provides a workable mechanism |
| **D — Defer** | **REJECTED.** The fence-8 scope question is sufficiently determined to establish the future pathway now |

---

## 7. AUTHORITY STATE AND SEPARATION

### 7.1 Authority state

# `D-21 §7 — B — PATHWAY AUTHORIZED / NO RELIEF GRANTED`

### 7.2 Six authorities, separately stated — **none granted**

| Authority | Granted by D-21? |
|---|---|
| Amend the fence / governance definition (`SPEC-G-AI-IMPL` §5) | **NO** |
| Mutate the affected product-branch paths | **NO** |
| Create evidence | **NO** |
| Create / restore methodology acceptance records | **NO** |
| Amend certification | **NO** |
| Amend the matrix | **NO** |

**No authority not explicitly granted has been inferred** — not from configured credentials, not
from write capability, not from technical convenience, and not from any prior GO.

---

## 8. DEPENDENCY CHAIN AND SUCCESSOR GATE

```
methodology acceptance
  → fence-8 determination / relief      ← THIS RECORD (determination only; no relief)
  → product-branch mutation authority
  → evidence creation
  → verification
  → separate A2 → A1 authority
  → certification / matrix decision
```

**Smallest executable successor gate: the Tier-3 methodology-acceptance recording gate** —
identified **descriptively** to avoid the numbering collision noted in §1. It is
**governance-only**, recordable on `arena`, and requires **no product-branch mutation and no
fence-8 relief**, because `governance/iips/` is inside no fence.

**One finding carried forward:** D17 barred an *Accept* outcome unless the cited acceptance records
existed; they do not, and can only come into existence by being created — which **is** the
acceptance act. Read as a permanent bar the precondition is self-defeating. The coherent reading,
recorded here rather than assumed: the verification prevents treating an **unverifiable past**
acceptance as valid; it does **not** preclude a **fresh, explicit** acceptance properly recorded
going forward.

**This record pre-authorizes nothing in that successor gate.**

---

## 9. RESTORATION VERIFICATION

| Check | Result at restoration |
|---|---|
| `origin/arena` before restoration | `824cd7ec51cc844af99bb6d8cfad5a877a9d52f0` — 46 records |
| This record present on `origin/arena` before restoration | **NO** |
| `SPEC-G-AI-IMPL.md` blob | `8e3e60719b2f077b4beb643d2d6e7f6c6e930037` — **unchanged**; fence-8 row byte-identical |
| `phase13-next` | `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` — **unchanged** |
| Matrix | `cada0451400409b0fe9ff0d62309b756c7b45e43` — **unchanged** |
| The 3 correction-target files | **All exist**, **uncorrected** |
| Tier-3 `docs/` files | **0** |
| Fence-8 relief exercised | **NO** |
| Product / source / test / schema / persistence / parser / UI code touched | **NO** |

---

## 10. WHAT THIS RECORD DOES NOT DO

No product-branch mutation · no fence relief and no relaxation of any fence · no amendment of
`SPEC-G-AI-IMPL` §5 · no implementation of the 3-file correction · no documentation file created ·
no evidence created · no methodology accepted, rejected or altered · no acceptance record created ·
no A1 transition · no evidence-maturity change · no matrix amendment · no engine or implementation
change · no certification-result change · no release, version or tag change · no verifier engaged,
invented or simulated · no Tier-3 exception created · no Class A capability status change · no P7
reopening and no P7 status claim · no H/I/J execution and no browser, container or Keycloak setup ·
no amendment of any other existing record · no restoration of historical artifacts · no D5-S1
threshold change · no housekeeping · no branch merged, rebased, created, moved or deleted other
than the single named `arena` refspec used for this restoration · no force-push.

## 11. CLASSIFICATION

# **D-21 §7 RECORDED — B — PATHWAY AUTHORIZED / NO RELIEF GRANTED**

**Fence-8 remains intact** and all ten must-not-touch boundaries stand exactly as written. **No
relief and no mutation are granted.** A **narrowly scoped future relief pathway is authorized in
principle**, to follow the **COL-1 … COL-4** precedent: explicit maintainer authorization, recorded
as a `DECISION`, amending **`SPEC-G-AI-IMPL` §5 only**, with no broader relaxation. The
**minimum-relief map** is recorded as pre-computed future scope — **3 files** for the correction,
**new-file creation under the 3 Tier-3 directories** for documentation. **Options C and D are
rejected; option A is recorded as preserving the intact fence-8 baseline but not selected.**
Execution of the future relief is **not** authorized and remains subject to a separate dedicated
gate. **This is a restored record:** the original working-tree copy was destroyed by sandbox
re-provisioning before commit, and this reconstruction introduces no new finding and alters no
authority. **STOP.**
