# DEC-D19-PRODUCT-BRANCH-STATE — Phase13-Next Current State and Authority Boundary

- **Record ID:** `DEC-D19-PRODUCT-BRANCH-STATE`
- **Title:** D19 — Product-Branch Resumption: Re-Measured `phase13-next` State, Acceptance-Record Verification, and the Nine-Part Authority Boundary
- **Class:** `DECISION`
- **Status:** `RECORDED — READ-ONLY DISCOVERY ONLY. NO PRODUCT-BRANCH MUTATION. NO EVIDENCE CREATED. NO METHODOLOGY ACCEPTED.`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D19 — PRODUCT-BRANCH RESUMPTION / CURRENT-STATE AUTHORITY
  GATE`, conducted **read-only**. Durable recording authority on `arena` was granted separately
  and explicitly at the close of discovery. **No product-branch, fence-relief, evidence-creation,
  acceptance, certification, matrix or release authority was granted or inferred.**
- **Scope:** re-measurement of the `phase13-next` tree; verification of every cited
  methodology-acceptance record; re-evaluation of `D-AUTHCLAIM-UNSUPPORTED` with exact
  file-and-line locations; recalculation of documentation parity; the actual fence-8 position; a
  nine-part authority matrix; and identification of the smallest executable next gate. **No
  product file amended, no acceptance record created, no documentation authored, no evidence
  created, no fence altered, no certification or matrix change, no push of `phase13-next`.**
- **Provenance:** measured from a **detached checkout of `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`**
  (`git symbolic-ref -q HEAD` → detached; no branch created; worktree clean; 1005 files). Every
  count and line number was taken from the working tree, not carried forward from D8–D18.
- **Supersession / revision relationship:** amends nothing. Sharpens `D-AUTHCLAIM-UNSUPPORTED`
  as recorded at D17 and refines the 60-artifact figure scoped at D14.

---

## 1. WORKSPACE CAVEAT — RECORDED FIRST BECAUSE IT QUALIFIES EVERYTHING BELOW

The gate stated that a clean persistent product-branch workspace is available at
`G:\IIPS\phase13-next-authority`. **That path is not reachable from the executing session.**

| Probe | Result |
|---|---|
| Environment | `Linux 6.1.158+ x86_64` |
| `G:\IIPS\phase13-next-authority` | **No such file or directory** |
| `/mnt/g`, `/g`, `G:` | **No such file or directory** |

**Consequence:** no product-branch mutation is executable by this session **even if it were
authorized**. All discovery was therefore performed against `origin/phase13-next`, whose HEAD
**exactly matches** the stated `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`. The tree measured is
the tree described.

**Disclosure:** the sandbox **re-provisioned during this gate** (the **11th** observed),
destroying the prior working clone. A detached read-only checkout survived and was used for the
remainder. `DEC-D6-DURABLE-RECORDING-POLICY` remains the operative mitigation.

---

## 2. §1 — `phase13-next` STATE, RE-MEASURED

| Item | Measured |
|---|---|
| HEAD | `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` — detached, clean |
| Total files | **1005** |
| `ies-016-telecommunications` | **12** files |
| `ies-017-automobile` | **12** files |
| `ies-020-materials-metals` | **12** files |
| Matrix | `cada0451400409b0fe9ff0d62309b756c7b45e43` — **7 A1 / 7 A2**, Tier 3 all **A2** |

Each engine's 12 files, uniform across all three:

| Artifact | Present |
|---|---|
| Discovery pack (`*_DISCOVERY_PACK.md`) | ✓ |
| Acceptance matrix (`*_ENGINE_ACCEPTANCE_MATRIX.md`) | ✓ |
| Implementation-readiness certificate (`IES-0xx_IMPLEMENTATION_READINESS_CERTIFICATE.md`) | ✓ |
| Release notes (`RELEASE_NOTES_IES-0xx_v1.0.0.md`) | ✓ |
| Risk register (`*_IMPLEMENTATION_RISK_REGISTER.md`) | ✓ |
| `calibration/*-calibration-1.0.0.json` | ✓ |
| `expected-outputs/*-expected-outputs-1.0.0.json` | ✓ |
| `fixtures/*-golden-reference-1.0.0.json` | ✓ |
| `fixtures/*-validation-fixtures-1.0.0.json` | ✓ |
| `replay-datasets/*-replay-dataset-1.0.0.json` | ✓ |
| `*-ontology-metadata-1.0.0.json` | ✓ |
| `contract-tests/generate_expected_outputs.py` | ✓ |

**Regression tests (6):** `{telecommunications,automobile,materials-metals}-{acceptance,wp4-validation}.test.ts`
· **engine implementations:** 11 files each under `iips-platform/src/sector-engines/`.

---

## 3. §2 — METHODOLOGY ACCEPTANCE STATUS

| Engine | Exact citation(s) | Record exists? | Pack's own status statements |
|---|---|---|---|
| **IES-016** (`D16 v1.0`) | `D16_AUTHORITY_REVIEW.md` — line **272** | **NO — 0 in tree** | **PROPOSED** (`:8`, `:294`) · **PENDING** (`:24`, `:204`) · *"this is a **proposal**"* (`:272`) · *"**Frozen ≠ authoritative**"* (`:142`) |
| **IES-017** (`D17 v1.0`) | `D17_AUTHORITY_REVIEW.md` — lines **5, 8, 229, 238**; generator `:17` | **NO — 0 in tree** | **ACCEPTED** (`:5`, `:245`) · **PROPOSED** (`:8`) · *"M1–M15 (**all PENDING** …)"* (`:238`) · **PENDING** (`:24`) |
| **IES-020** (`D20 v1.0`) | `D20_AUTHORITY_REVIEW.md` (`:140`, generator `:18`) + `D20_CERTIFICATION_DATA_ACCEPTANCE.md` (`:8`) | **NO — 0 for both** | **ACCEPTED** (`:6`, `:221`) · **FROZEN** (`:8`, `:221`) · **PROPOSED** (`:16`) · **PENDING** (`:31`) |

**No cited acceptance record exists anywhere in the `phase13-next` tree.** Acceptance was **not**
inferred from generated outputs, calibration files, discovery packs, `arena` governance records, or
prior chat decisions.

**Two further dangling citations:** `IES-016` lines **8** and **266** cite
`/home/user/IIPS-IES-016-DISCOVERY.md` — a **path outside the repository**, absent from the tree.
By contrast `IES-015_COMPATIBILITY.md`, also cited by the IES-016 pack, **does exist** at
`ies-015-technology/IES-015_COMPATIBILITY.md`.

---

## 4. §3 — `D-AUTHCLAIM-UNSUPPORTED` REMAINS, WITH EXACT LOCATIONS

| Category | Persists | Exact locations |
|---|---|---|
| Unsupported **METHODOLOGY ACCEPTED** | **YES** | `ies-017-automobile/AUTOMOBILE_DISCOVERY_PACK.md:5` and `:245` · `ies-020-materials-metals/MATERIALS_METALS_DISCOVERY_PACK.md:6` and `:221` |
| Contradictory **PROPOSED / PENDING** | **YES** | IES-017 `:8` PROPOSED vs `:5`/`:245` ACCEPTED vs `:238` *"M1–M15 (all **PENDING**)"* · IES-020 `:16` PROPOSED vs `:6`/`:221` ACCEPTED |
| Unsupported **FROZEN / data-authority** | **YES** | IES-020 `:8` *"Certification data is FROZEN"* and `:221` vs `:31` *"Data authority: **PENDING**"* and `:140` *"**Proposed** confidence / evidence treatment"* |
| Citations to **nonexistent** records | **YES** | `D16_AUTHORITY_REVIEW.md`, `D17_AUTHORITY_REVIEW.md`, `D20_AUTHORITY_REVIEW.md`, `D20_CERTIFICATION_DATA_ACCEPTANCE.md` — plus the non-repo `/home/user/IIPS-IES-016-DISCOVERY.md` |
| **Generator** acceptance claims | **YES — 1 of 3** | `ies-020-materials-metals/contract-tests/generate_expected_outputs.py:18` *"derives from the **ACCEPTED** calibration"* — unsupported. `ies-017`'s generator `:17` correctly says **PROPOSED**; `ies-016`'s makes no acceptance claim |

**IES-016 is internally consistent** — PROPOSED/PENDING throughout, with an explicit
*"Frozen ≠ authoritative"* disclaimer at `:142`. The contradictions are confined to **IES-017** and
**IES-020**.

**Not corrected**, per the gate's instruction. **8 distinct locations** are recorded above.

---

## 5. §4 — DOCUMENTATION PARITY, RECALCULATED

| Engine | `docs/` | `ARCHITECTURE_REVIEW` | Required | Missing |
|---|---|---|---|---|
| `ies-016-telecommunications` | **0** | **0** | 20 | 20 |
| `ies-017-automobile` | **0** | **0** | 20 | 20 |
| `ies-020-materials-metals` | **0** | **0** | 20 | 20 |
| *A1 reference:* `ies-010 … ies-015` | **19 each** | **1 each** | 20 | 0 |

**Legitimate counterpart identified:** each Tier-3 engine holds
`IES-0xx_IMPLEMENTATION_READINESS_CERTIFICATE.md`, corresponding to A1 document **16**
(`IES-0xx_16_IMPLEMENTATION_READINESS_CERTIFICATE.md`) — same document type, different location and
naming.

**Refinement of the D14 figure:** the **target** of 60 artifacts is correct, but **57 require
authoring** and **3 already exist in substance**, needing relocation into `docs/` rather than
authoring. The four non-A1 Tier-3 artifacts (discovery pack, acceptance matrix, risk register,
release notes) have **no A1 counterpart** and are **not** substitutes for any of the 19.

**No documentation created.**

---

## 6. §5 — FENCE 8

**`phase13-next` contains no fence definition at all** — **0** files matching `must-not-touch` or
`fence N`. Fence 8 is defined only in `governance/iips/SPEC-G-AI-IMPL.md` §5 on `arena`:

> `| 8 | ies-010 … ies-020, iips-cross-sector — certification baselines; CSIP excluded per D5 |`

| Question | Answer |
|---|---|
| Protected pattern | `ies-010 … ies-020` and `iips-cross-sector` |
| Are `ies-016/017/020` inside it? | **YES** |
| Which proposed changes violate it? | **All of them** — creating 57 `docs/` files · creating 3 `ARCHITECTURE_REVIEW` files · **and correcting `D-AUTHCLAIM-UNSUPPORTED`**, since the affected packs and generators live at `ies-017-automobile/` and `ies-020-materials-metals/` |
| Existing relief? | **NONE.** D16 §2 = B · D18 §4 = A · `DEC-G-AI-IMPL-CERTIFICATION:247` records *"Alter methodology or any fence — **NO**"* |
| Open interpretive question | `AUTH-G-AI-IMPL:12` — the authorization *"Binds the implementation scope only."* Whether fences 1–10 survive that implementation's **certified completion** is **undetermined** |

---

## 7. §6 — AUTHORITY MATRIX (nine separate authorities, not combined)

| # | Work | Current state | Prerequisites | Authority required | Executable now? |
|---|---|---|---|---|---|
| 1 | Methodology acceptance | Deferred at D17; all 4 cited records absent | Maintainer decision; the cited-record precondition fails | Methodology / acceptance authority | **NO** |
| 2 | Correct `D-AUTHCLAIM-UNSUPPORTED` | 8 locations, uncorrected | Fence-8 relief + product-branch authority | Product-branch amendment **+ fence-8 relief** | **NO** |
| 3 | Documentation / evidence creation | 57 to author, 3 to relocate | Fence-8 relief + product-branch authority; ideally #1 first | Evidence creation **+ fence-8 relief** | **NO** |
| 4 | Fence-8 relief | No relief; scope after certification undetermined | A governance decision | Fence-relief authority | **NO** |
| 5 | Verification | None performed | #3 complete | Verification authority (D15 methodology) | **NO** |
| 6 | A2 → A1 transition | 7 A1 / 7 A2 | #3 and #5 complete | Certification **+ matrix amendment** | **NO** |
| 7 | Certification change | Unchanged | #5 | Certification authority | **NO** |
| 8 | Matrix amendment | `cada04514004…` | #6 | Matrix-amendment authority | **NO** |
| 9 | Release / tag changes | Unchanged | #7 | Release authority | **NO** |

**No authority is combined with any other. No authority is granted by this record.**

---

## 8. §7 — SMALLEST EXECUTABLE NEXT GATE

**Not the 60-document programme.** Every product-branch action — including the **smallest**
correction of `D-AUTHCLAIM-UNSUPPORTED` — lies **inside fence 8**, and **no relief exists**. Fence
treatment therefore precedes everything else.

# **`D20 — FENCE-8 SCOPE AND RELIEF DETERMINATION`**

A **governance-only** decision, recordable on `arena`, requiring **no product-branch mutation**. It
would resolve:

1. whether fences 1–10 remain in force after the AI Advisory implementation was certified —
   `AUTH-G-AI-IMPL:12` *"binds the implementation scope only"* against
   `DEC-G-AI-IMPL-CERTIFICATION:247` *"Alter … any fence — **NO**"*; and
2. if they stand, the **minimum** fence-8 relief required. For the correction alone that is exactly
   **3 files**: `ies-017-automobile/AUTOMOBILE_DISCOVERY_PACK.md`,
   `ies-020-materials-metals/MATERIALS_METALS_DISCOVERY_PACK.md`, and
   `ies-020-materials-metals/contract-tests/generate_expected_outputs.py`.

**Methodology acceptance remains blocked, and exactly one thing blocks it:** all four cited
acceptance records are **absent from the tree**, so D17's acceptance precondition cannot be
satisfied. **No mutation was performed in D19.**

---

## 9. §8 — D18 RECONCILIATION: **B — PARTIALLY RESOLVED**

| Blocker | Status |
|---|---|
| **Reachability / topology** | **PARTIALLY RESOLVED.** A `phase13-next` workspace is reported to exist and `origin/phase13-next` is unchanged at the stated HEAD — but `G:\…` is **not reachable from this session**, so product-branch work remains **not executable by this agent** |
| **Governance / authority** | **STILL PRESENT — and separate.** D18 §1 = B / §2 = E granted **no** product-branch authority, and that decision stands until a gate expressly supersedes it. **Availability of a workspace does not confer authority** |

The two are recorded as **distinct questions**, as the gate required.

---

## 10. INVARIANTS PRESERVED — VERIFIED, NOT ASSERTED

| Invariant | Status |
|---|---|
| Product-branch mutation | **NONE — `phase13-next` not pushed, not amended** |
| Branches created | **NONE — detached checkout only** |
| Evidence artifacts created | **NONE** |
| Acceptance records created | **NONE** |
| Documentation authored | **NONE — 0 of 57** |
| Methodology accepted, rejected or altered | **NONE** |
| All ten fences, including 4 and 8 | **INTACT — no relief** |
| A1 / A2 status of all 14 capabilities | **UNCHANGED — 7 A1 / 7 A2** |
| All capabilities Class A | **UNCHANGED** |
| **D7-3 = A** | **PRESERVED** |
| Matrix `cada04514004…` | **UNTOUCHED** |
| Certification results, releases, tags | **UNTOUCHED** |
| All dated `DEC-*` records | **UNTOUCHED** |
| H/I/J · P7 | **NOT executed · NOT reopened** |

---

## 11. WHAT THIS RECORD DOES NOT DO

No product-branch mutation · no push of `phase13-next` or any ref other than `arena` · no branch
created, switched to, merged, rebased, moved or deleted · no acceptance record created · no
documentation authored · no artifact created · no evidence created · no correction of
`D-AUTHCLAIM-UNSUPPORTED` · no fence relief and no relaxation of any fence · no methodology
accepted, rejected or altered · no A1 transition · no evidence-maturity change · no matrix
amendment · no engine or implementation change · no certification-result change · no release,
version or tag change · no verifier engaged, invented or simulated · no Tier-3 exception created ·
no Class A capability status change · no P7 reopening and no P7 status claim · no H/I/J execution
and no browser, container or Keycloak setup · no amendment of any existing record · no restoration
of historical artifacts · no D5-S1 threshold change · no force-push.

## 12. CLASSIFICATION

# **D19 RECORDED — READ-ONLY DISCOVERY ONLY**

`phase13-next` re-measured from a detached checkout of `357b34dac1bd…`: 1005 files; `ies-016/017/020`
**12 files each**; matrix `cada04514004…` at **7 A1 / 7 A2**. **All four cited acceptance records
are absent from the tree** — `D16_/D17_/D20_AUTHORITY_REVIEW.md` and
`D20_CERTIFICATION_DATA_ACCEPTANCE.md` — so **no methodology is accepted** and D17's acceptance
precondition remains unsatisfiable. `D-AUTHCLAIM-UNSUPPORTED` **persists at 8 exact locations**,
confined to IES-017 and IES-020; **IES-016 is internally consistent**. Documentation parity: **0 of
20 per engine**, refined to **57 to author + 3 existing counterparts**. **Fence 8 contains every
proposed product-branch target — including the smallest correction — and no relief exists.** The
nine authorities are separated and **none is granted**. Smallest executable next gate identified as
**`D20 — FENCE-8 SCOPE AND RELIEF DETERMINATION`**, a governance-only decision. **D18 is
partially resolved**: reachability in principle, **not** for this session (`G:\…` unreachable);
the governance/authority blocker is **separate and still present**. **No product-branch mutation,
no evidence creation, no push.** All 14 capabilities remain **Class A**, **7 A1 / 7 A2**.
**STOP after recording — no further authority is held or inferred.**
