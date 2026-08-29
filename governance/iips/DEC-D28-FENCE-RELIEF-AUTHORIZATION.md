# DEC-D28-FENCE-RELIEF-AUTHORIZATION — Fence-4 and Fence-8 Relief Authorized (D27 Scope)

- **Record ID:** `DEC-D28-FENCE-RELIEF-AUTHORIZATION`
- **Title:** D28 — Fence-4 and Fence-8 Relief Authorization for the Tier-3 A1 Evidence Limbs, Exactly as Scoped by D27
- **Class:** `DECISION`
- **Status:** `RECORDED — RELIEF **AUTHORIZED**. **NOT YET EXECUTED.** Scope limited exactly to `DEC-D27-FENCE-RELIEF-SCOPE`.`
- **Date:** 2026-08-29
- **Authority relationship:** gate `D28 — Fence-4 + Fence-8 Relief Authorization`. **Explicit
  authorization source: the maintainer/user authorized *"Authorize D28 relief exactly as scoped by
  D27."*** The scope authority is **`DEC-D27-FENCE-RELIEF-SCOPE`** (`6bc413d12f38ad99866fc08ec71f8792a42129d5`).
  Commit and push of this governance authorization record were separately and explicitly
  authorized. **No product-mutation, evidence-creation, execution, certification, matrix or A1/A2
  authority is granted or inferred by this record.**
- **Scope:** authorization of narrow, path-specific fence-4 and fence-8 relief for the enumerated
  Tier-3 A1 evidence artifacts, and the minimum `SPEC-G-AI-IMPL` §5 amendment required by the
  COL-1 … COL-4 mechanism to encode it. **This record authorizes the relief. It does NOT execute
  it.**
- **Provenance:** scope transcribed exactly from `DEC-D27-FENCE-RELIEF-SCOPE` §9; every target path
  re-verified this turn against `origin/phase13-next` at
  `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`. **No path was added, removed or broadened.**
- **Supersession / revision relationship:** supersedes the *"NO RELIEF GRANTED"* state of
  `DEC-D21-FENCE8-DETERMINATION` §7 **as to the enumerated paths only**; D21's pathway framing and
  all its exclusions remain in force. Amends `SPEC-G-AI-IMPL` §5 (fence-4 and fence-8 rows
  annotated; §5.2 added) — the same mechanism used for COL-1 … COL-4. Amends **no other** record.
  `D21`, `D22`, `D23`, `D25` and `D27` are **unmodified**.
- **SPEC amendment:** `SPEC-G-AI-IMPL` §5 fence 4 and fence 8 rows annotated and §5.2 added.
  Prior blob `8e3e60719b2f077b4beb643d2d6e7f6c6e930037`; amended blob recorded in the commit.

---

## 1. AUTHORIZATION SOURCE

| Item | Value |
|---|---|
| Authorizing party | **The maintainer / user** |
| Authorization, verbatim | *"Authorize D28 relief exactly as scoped by D27."* |
| Scope authority | `DEC-D27-FENCE-RELIEF-SCOPE` at `6bc413d12f38ad99866fc08ec71f8792a42129d5` |
| Scope discipline | **Exactly D27's minimum scope. No broadening. No path outside D27 §9 receives relief.** |

---

## 2. AUTHORIZED FENCE-4 SCOPE — `iips-platform/**`

**9 files, creation only. 0 amended. 0 deleted.**

| # | Exact path | Action |
|---|---|---|
| 1 | `iips-platform/IES016_INDEPENDENT_VERIFICATION_REPORT.md` | CREATE |
| 2 | `iips-platform/IES017_INDEPENDENT_VERIFICATION_REPORT.md` | CREATE |
| 3 | `iips-platform/IES020_INDEPENDENT_VERIFICATION_REPORT.md` | CREATE |
| 4 | `iips-platform/tests/regression/telecommunications-framework-integration.test.ts` | CREATE |
| 5 | `iips-platform/tests/regression/telecommunications-reuse-verification.test.ts` | CREATE |
| 6 | `iips-platform/tests/regression/automobile-framework-integration.test.ts` | CREATE |
| 7 | `iips-platform/tests/regression/automobile-reuse-verification.test.ts` | CREATE |
| 8 | `iips-platform/tests/regression/materials-metals-framework-integration.test.ts` | CREATE |
| 9 | `iips-platform/tests/regression/materials-metals-reuse-verification.test.ts` | CREATE |

**All 9 verified absent this turn** — the relief authorizes creation of new paths only, so **no
existing `iips-platform/**` file is modified**.

## 3. AUTHORIZED FENCE-8 SCOPE — `ies-010 … ies-020`

**3 files created + 3 files amended. 0 deleted.**

| # | Exact path | Action |
|---|---|---|
| 1 | `ies-016-telecommunications/IES-016_FREEZE_MANIFEST.json` | CREATE |
| 2 | `ies-017-automobile/IES-017_FREEZE_MANIFEST.json` | CREATE |
| 3 | `ies-020-materials-metals/IES-020_FREEZE_MANIFEST.json` | CREATE |
| 4 | `ies-016-telecommunications/IES-016_IMPLEMENTATION_READINESS_CERTIFICATE.md` | **AMEND** — add `Issuer` / `Issued` / `Status` |
| 5 | `ies-017-automobile/IES-017_IMPLEMENTATION_READINESS_CERTIFICATE.md` | **AMEND** — same |
| 6 | `ies-020-materials-metals/IES-020_IMPLEMENTATION_READINESS_CERTIFICATE.md` | **AMEND** — same |

**Verified this turn:** all 3 create-targets **absent**; all 3 amend-targets **present and
unamended** (`Issuer` field count = 0 in each). **Amendment, not reissuance**, is the authorized
minimum, because the files already exist at the correct paths and names.

---

## 4. REQUIRED EXECUTION AND ISSUANCE ACTS

Authorization of the paths is **not** sufficient to complete the A1 limbs. The following acts are
additionally required and are **authorized in principle but not performed by this record**:

| # | Act | Why required | Can it be self-performed? |
|---|---|---|---|
| 1 | **Clean-clone independent verification** for each of IES-016 / 017 / 020 | A1 limb 1 — a report without an executed verification would be unsupported | Yes, but per `D7-TIER3-INDEPENDENCE` it must be labelled role-separated, **not** organizationally independent |
| 2 | **Author and execute** the 6 regression test files | A1 limb 4 — `DEC-D5-S1`: the limb is satisfied *iff* all four kinds are present and passing | Yes |
| 3 | **Create** the 3 freeze manifests | A1 limb 3 | Yes — all referenced data artifacts already exist |
| 4 | **Maintainer issuance** of the 3 readiness certificates (`Issuer`, `Issued`, `Status`) and of the 3 manifest `approver` fields | A1 limb 2 — `DEC-D25` established the existing certificates are **not** maintainer-issued | **NO — a party cannot issue its own authorization** |

**Sequencing:** the freeze manifests must precede the readiness-certificate amendments, because the
A1 certificates certify *"reference assets frozen"*, for which the manifest is the evidence.

---

## 5. ARCHITECTURE-REVIEW BOUNDARY

Per `DEC-D27-FENCE-RELIEF-SCOPE` §5:

> **Architecture review is NOT an A1 limb.** It is required only as a condition of the
> readiness-certificate convention.

**Accordingly this authorization:**

- **does NOT authorize** the 60-artifact documentation programme;
- **does NOT require** creation of any `ARCHITECTURE_REVIEW` artifact;
- **uses the reduced convention** identified by D27 §5.3 form (a) — the freeze manifests'
  `engineeringDocs` and `reviewArtifacts` fields reference **existing** artifacts (the discovery
  pack, the engine acceptance matrix and the implementation risk register), requiring **zero** new
  documentation.

**No existing authoritative convention was found that requires an additional artifact.** Measured:
`DEC-D5-EVIDENCE-MATURITY` §2 names four limbs and no documentation; its §3 table has no
documentation or review column; `DEC-A2-A1-CLOSURE-STRATEGY` §5 lists Tier-3's missing documents as
*independent verification, final readiness, freeze manifest* only; matrix §3.1 evidence provenance
does not list `docs/`.

---

## 6. FENCE-9 SEPARATION

`docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` is **fence 9** and is **NOT** included in this
relief. `DEC-A2-A1-CLOSURE-STRATEGY` §6 makes the A2 → A1 matrix update a **separate** authority
action (#4). **Matrix amendment requires its own authorization and is not granted here.**

---

## 7. THIS IS RELIEF AUTHORIZATION — NOT A2 → A1 PROMOTION

**This record authorizes relief of fences 4 and 8 for the enumerated paths. It does not promote any
capability.**

| Statement | Status |
|---|---|
| Is any capability promoted A2 → A1 by this record? | **NO** |
| Is A1/A2 authority altered? | **NO — remains 7 A1 / 7 A2** |
| Is the matrix amended? | **NO** |
| Is any capability certified by this record? | **NO** |
| Does satisfying all four limbs automatically promote a capability? | **NO** — promotion requires separate A2 → A1 and matrix-amendment authority |

---

## 8. THE AUTHORIZATION DOES NOT ALTER METHODOLOGY ACCEPTANCE

`DEC-D25-TIER3-EVIDENTIARY-STANDARD` recorded IES-016 / IES-017 / IES-020 as **ACCEPT — fresh
forward-looking**. **This record neither grants, revokes, confirms nor alters that acceptance.** It
is **unmodified**. Methodology acceptance and evidence-maturity relief are distinct acts, and this
record performs only the latter's authorization.

---

## 9. EXPLICIT EXCLUSIONS — NOT AUTHORIZED

| Excluded | Basis |
|---|---|
| The 60-artifact documentation programme | Not an A1 limb (`DEC-D27` §5, §7) |
| IES-016 factual corrections (`:281`, `:295`) and `M1–M15` boilerplate restatement | Truthfulness items, not A1 prerequisites |
| IES-020 Q1 aluminium-placement decision | Not required for A1; not exercised by the frozen dataset |
| Dangling-citation corrections (*Amendment v1.1*, `/home/user/IIPS-IES-016-DISCOVERY.md`, the four absent primary records) | Truthfulness items, not A1 prerequisites |
| `D-AUTHCLAIM-UNSUPPORTED` correction (4 files) | Truthfulness item, not an A1 prerequisite |
| Unrelated methodology changes | Out of scope; D25 closed methodology acceptance |
| Certification beyond the A1 evidence prerequisites | Out of scope |
| **Fence-9 matrix modification** | Separate authority (§6) |
| **A2 → A1 promotion** | Separate authority (§7) |
| **Changes to A1/A2 authority** | Not granted (§7) |
| Unrelated product changes | Out of scope |
| Any path not enumerated in §2 or §3 | **No relief** |

---

## 10. THE RELIEF IS LIMITED TO THE EXACT D27 MINIMUM SCOPE

| Check | Result |
|---|---|
| Fence-4 paths authorized | **9** — identical to `DEC-D27` §9 |
| Fence-8 paths authorized | **6** (3 create + 3 amend) — identical to `DEC-D27` §9 |
| Paths added beyond D27 | **0** |
| Paths removed from D27 | **0** |
| General fence-4 relaxation | **NONE** |
| General fence-8 relaxation | **NONE** |
| Unrelated path receiving relief | **NONE** |
| Totals | **12 files (9 + 3 created, 3 amended) + 4 required acts** — nothing else |

---

## 11. COL-1 … COL-4 MECHANISM APPLIED

| COL requirement | How satisfied |
|---|---|
| Authorization represented as a `DECISION` | **This record**, Class `DECISION` |
| Explicit maintainer authorization | §1, quoted verbatim |
| Scope limited to specifically enumerated paths/actions | §2, §3, §10 |
| No general fence relaxation | §10; §5.2 states it in the specification |
| No unrelated path receives relief | §9, §10 |
| Minimum exact §5 amendment encoding only the authorized paths | §12 |

---

## 12. `SPEC-G-AI-IMPL` §5 AMENDMENT — MINIMUM AND NECESSARY

**Determination: a §5 amendment IS required by the established COL mechanism.**

Evidence, verified this turn: `DEC-G-AI-IMPL-COL-RESOLUTION` carries an explicit metadata field
*"**SPEC amendment:** `SPEC-G-AI-IMPL` §5 fence 10 amended and §5.1 added"*; the authorizing commit
`141ca81` is titled *"governance(iips): resolve 3-path collision — authorize COL-1..COL-5, **amend
fence 10**"*; §5.1 exists at line 111; and the fence-10 row carries an inline *"Amended by COL-1 …"*
annotation. **Fences 4 and 8 were unannotated before this record.**

**Minimum amendment made, and nothing more:**

1. Fence-4 row — inline annotation referencing this record and §5.2, stating that relief is narrow
   and that no other path receives relief.
2. Fence-8 row — the same.
3. **§5.2 added** — encoding exactly the 9 fence-4 paths and 6 fence-8 paths/actions, the
   exclusions, and the statement that no general relaxation occurs.

**Not amended:** the fence-1 … fence-3, fence-5 … fence-7, fence-9 and fence-10 rows; §5.1; every
other section of `SPEC-G-AI-IMPL`; every other governance record.

---

## 13. EXECUTION BOUNDARY — RELIEF AUTHORIZED, **NOT EXECUTED**

**This record authorizes the relief. It does not execute any of the underlying work.**

| Not yet performed | Status |
|---|---|
| The 9 fence-4 files | **NOT CREATED** |
| Clean-clone independent verification | **NOT EXECUTED** |
| The 6 regression tests | **NOT CREATED, NOT EXECUTED** |
| The 3 freeze manifests | **NOT CREATED** |
| The 3 readiness-certificate amendments | **NOT MADE** |
| The maintainer issuance acts | **NOT PERFORMED** |
| Product code | **NOT MODIFIED** |
| The matrix | **NOT MODIFIED** |
| A2 → A1 | **NOT PROMOTED** |

**All of these are subsequent execution activities, requiring their own gate.** Verified this turn
before recording: all 12 create/amend targets are in their pre-relief state.

---

## 14. WHAT THIS RECORD DOES NOT DO

No relief executed · no product / source / test / schema / persistence / parser / UI file created or
modified · no test created or executed · no independent verification performed · no freeze manifest
created · no readiness certificate issued or amended · no maintainer issuance act performed · no
architecture review created · no documentation created · no A2 → A1 promotion · no matrix amendment
· no certification · no release, version or tag change · no methodology accepted, rejected or
altered · no alteration of A1/A2 authority · no general relaxation of any fence · no relief for any
path outside §2 and §3 · no amendment of `D21`, `D22`, `D23`, `D25` or `D27` · no P7 reopening · no
H/I/J execution · no branch merged, rebased, created, moved or deleted other than the single named
`arena` refspec · no push to `phase13-next` · no force-push.

## 15. CLASSIFICATION

# **D28 RECORDED — RELIEF AUTHORIZED · NOT YET EXECUTED**

Narrow, path-specific relief of **fence 4** (9 files, creation only) and **fence 8** (3 created + 3
amended) is **authorized exactly as scoped by `DEC-D27-FENCE-RELIEF-SCOPE`**, on the maintainer's
explicit authorization. **No path beyond D27's minimum scope receives relief, and no general fence
relaxation occurs.** The COL-1 … COL-4 mechanism is applied: this `DECISION`, plus the minimum
`SPEC-G-AI-IMPL` §5 amendment (fence-4 and fence-8 rows annotated, §5.2 added) that the precedent
requires. **Architecture review is not authorized and not required**; the reduced convention
referencing existing artifacts applies, so **zero** new documentation is authorized and the
60-artifact programme is **excluded**. **This is relief authorization, not A2 → A1 promotion**; A1/A2
remains **7 / 7** and methodology acceptance (`D25`) is **unaltered**. **Fence 9 is separate.**
**None of the authorized work has been executed** — all 12 target files were verified in their
pre-relief state before recording. **STOP.**
