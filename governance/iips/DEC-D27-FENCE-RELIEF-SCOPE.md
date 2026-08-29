# DEC-D27-FENCE-RELIEF-SCOPE — Minimum Fence-4 and Fence-8 Relief Scope for Tier-3 A1 Closure

- **Record ID:** `DEC-D27-FENCE-RELIEF-SCOPE`
- **Title:** D27 — Minimum Fence-4 and Fence-8 Relief Scope Determination for the Four A1 Evidence Limbs (Tier 3)
- **Class:** `DECISION`
- **Status:** `RECORDED — RELIEF SCOPE DETERMINED. **NO RELIEF IS GRANTED OR EXERCISED BY THIS RECORD.**`
- **Date:** 2026-08-29
- **Authority relationship:** gate `D27 — Fence-4 and Fence-8 Relief Scope Determination`,
  conducted **governance-only**. This record **determines and records a proposed relief scope**.
  It **grants nothing and exercises nothing**. It depends on `DEC-D5-EVIDENCE-MATURITY` (the
  authoritative four-limb A1 definition), `DEC-D5-S1-REGRESSION-EVIDENCE` (the four-kind
  regression rule), `DEC-A2-A1-CLOSURE-STRATEGY` §5 (what closure requires per capability) and
  `DEC-D25-TIER3-EVIDENTIARY-STANDARD` (methodology acceptance). It follows the **COL-1 … COL-4**
  precedent for the *form* any future relief must take.
- **Scope:** determination of the **minimum necessary** fence-4 and fence-8 relief scope, the
  architecture-review convention question, fence-9 separation, and explicit exclusions. **No
  product mutation, no test creation or execution, no independent-verification execution, no
  freeze-manifest creation, no readiness-certificate issuance, no A2 → A1 promotion, no matrix
  amendment, no certification.**
- **Provenance:** every path, count and schema field was measured this turn from
  `origin/phase13-next` at `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` and from `origin/arena`.
  Nothing was inferred from what the A1 engines merely happen to contain where a governance rule
  exists.
- **Supersession / revision relationship:** amends **nothing**. `D21`, `D22`, `D23`, `D25` and all
  prior records are **unmodified**. `SPEC-G-AI-IMPL` §5 is **unmodified**. `D-21 §7` remains
  **B — PATHWAY AUTHORIZED / NO RELIEF GRANTED**.

---

## 1. EVIDENCE BASIS

### 1.1 The authoritative A1 definition (`DEC-D5-EVIDENCE-MATURITY` §2)

> **A1 — Full evidence** = Independent verification **+** final readiness **+** freeze /
> provenance evidence **+** required regression evidence

### 1.2 The authoritative per-capability closure map (`DEC-A2-A1-CLOSURE-STRATEGY` §5)

| Capability | Missing regression kind(s) | Missing documents | Route |
|---|---|---|---|
| IES-016 telecommunications | framework-integration, reuse-verification | independent verification, final readiness, freeze manifest | New evidence production (+ independence decision) |
| IES-017 automobile | framework-integration, reuse-verification | independent verification, final readiness, freeze manifest | New evidence production (+ independence decision) |
| IES-020 materials-metals | framework-integration, reuse-verification | independent verification, final readiness, freeze manifest | New evidence production (+ independence decision) |

**That record already states: *"No implementation change is required for any of it."*** D27 adds
only what that record did not map: **which fence each artifact sits behind, and the minimum
scope.**

### 1.3 Measured current state

| Limb | IES-016 | IES-017 | IES-020 | A1 reference (IES-010 / IES-015) |
|---|---|---|---|---|
| Independent verification | **ABSENT** | **ABSENT** | **ABSENT** | `iips-platform/IES010_/IES015_INDEPENDENT_VERIFICATION_REPORT.md` present |
| Final readiness | file present, **no `Issuer`, no `Issued`, no `Status`** | same | same | `Issuer: IIPS Engineering Standards Maintainer`; `Status: AUTHORIZED — implementation may begin against the frozen baseline` |
| Freeze / provenance | **0** | **0** | **0** | `IES-010_/IES-015_FREEZE_MANIFEST.json`, `approver: IIPS Engineering Standards Maintainer`, `status: FROZEN` |
| Regression (D5-S1 four kinds) | **2 of 4** — has `acceptance`, `wp4-validation` | same | same | **4 of 4** |

**All six missing regression test files are strictly required.** `DEC-D5-S1` §1: *"A capability
satisfies the regression limb **if and only if** all four kinds are present."* Tier 3 lacks
`framework-integration` and `reuse-verification`; there is no substitution or waiver mechanism.

---

## 2. FOUR-LIMB A1 SCOPE

| A1 limb | IES-016 | IES-017 | IES-020 | Required action |
|---|---|---|---|---|
| **Independent verification** | Missing | Missing | Missing | **CREATE** `iips-platform/IES01x_INDEPENDENT_VERIFICATION_REPORT.md` ×3 — **and EXECUTE** the clean-clone verification it records |
| **Final readiness** | Present but **not maintainer-issued** | same | same | **AMEND** the 3 existing certificates to add `Issuer` / `Issued` / `Status` — **plus a maintainer issuance act**, which cannot be self-performed |
| **Freeze / provenance** | Missing | Missing | Missing | **CREATE** `ies-0xx-*/IES-0xx_FREEZE_MANIFEST.json` ×3 — **all referenced data artifacts already exist** |
| **Regression** | 2 of 4 | 2 of 4 | 2 of 4 | **CREATE + EXECUTE** 6 test files (2 kinds × 3 engines) |

---

## 3. FENCE-4 MINIMUM-RELIEF MAP (`iips-platform/**`)

| Exact path | Action | Why required | Existing substitute? | Fence |
|---|---|---|---|---|
| `iips-platform/IES016_INDEPENDENT_VERIFICATION_REPORT.md` | **CREATE** (+ execute verification) | A1 limb 1 | **NO** — the 11 existing reports cover IES-010…015, CSIP and 4 Tier-2 engines; none covers Tier 3. They establish the **pattern** only | **4** |
| `iips-platform/IES017_INDEPENDENT_VERIFICATION_REPORT.md` | **CREATE** (+ execute) | A1 limb 1 | **NO** | **4** |
| `iips-platform/IES020_INDEPENDENT_VERIFICATION_REPORT.md` | **CREATE** (+ execute) | A1 limb 1 | **NO** | **4** |
| `iips-platform/tests/regression/telecommunications-framework-integration.test.ts` | **CREATE** (+ execute) | A1 limb 4, kind 2 of 4 | **NO** | **4** |
| `iips-platform/tests/regression/telecommunications-reuse-verification.test.ts` | **CREATE** (+ execute) | A1 limb 4, kind 3 of 4 | **NO** | **4** |
| `iips-platform/tests/regression/automobile-framework-integration.test.ts` | **CREATE** (+ execute) | A1 limb 4 | **NO** | **4** |
| `iips-platform/tests/regression/automobile-reuse-verification.test.ts` | **CREATE** (+ execute) | A1 limb 4 | **NO** | **4** |
| `iips-platform/tests/regression/materials-metals-framework-integration.test.ts` | **CREATE** (+ execute) | A1 limb 4 | **NO** | **4** |
| `iips-platform/tests/regression/materials-metals-reuse-verification.test.ts` | **CREATE** (+ execute) | A1 limb 4 | **NO** | **4** |

**Fence-4 total: 9 files created. 0 amended. 0 deleted.** No existing `iips-platform/**` file
needs modification — the reports and tests are **new paths**.

---

## 4. FENCE-8 MINIMUM-RELIEF MAP (`ies-010 … ies-020`)

| Exact path | Action | Why required | Existing substitute? | Fence |
|---|---|---|---|---|
| `ies-016-telecommunications/IES-016_FREEZE_MANIFEST.json` | **CREATE** | A1 limb 3 | **Partially** — every data field it references already exists (see §4.1); the manifest itself does not | **8** |
| `ies-017-automobile/IES-017_FREEZE_MANIFEST.json` | **CREATE** | A1 limb 3 | Same | **8** |
| `ies-020-materials-metals/IES-020_FREEZE_MANIFEST.json` | **CREATE** | A1 limb 3 | Same | **8** |
| `ies-016-telecommunications/IES-016_IMPLEMENTATION_READINESS_CERTIFICATE.md` | **AMEND** — add `Issuer`, `Issued`, `Status` | A1 limb 2 | **YES — the file already exists** at the correct path and name. **Amendment is the minimum scope; creation is not required** | **8** |
| `ies-017-automobile/IES-017_IMPLEMENTATION_READINESS_CERTIFICATE.md` | **AMEND** — same | A1 limb 2 | **YES** | **8** |
| `ies-020-materials-metals/IES-020_IMPLEMENTATION_READINESS_CERTIFICATE.md` | **AMEND** — same | A1 limb 2 | **YES** | **8** |

**Fence-8 total: 3 files created + 3 files amended = 6 files. 0 deleted.**

### 4.1 Freeze-manifest data fields — all already present

Measured for each engine: `calibrationProfile` · `goldenDataset` · `expectedOutputs` ·
`replayDataset` · `validationFixtures` — **all five exist with the established naming**
(e.g. `telecommunications-calibration-1.0.0.json`, `…-golden-reference-1.0.0.json`,
`…-expected-outputs-1.0.0.json`, `…-replay-dataset-1.0.0.json`, `…-validation-fixtures-1.0.0.json`).

**The certified replay baseline can serve as a provenance input:**
`PROGRAM_v1.1_REPLAY_BASELINE.json` already records, per Tier-3 sector, `contractVersion`
(*"IES-01x v1.0 (D1x normative)"*), `calibrationVersion`, `calibrationProfile`, frozen `input` and
`expectedOutput`. That is authoritative provenance for the manifest's `status: FROZEN` claim.

**But the manifest also requires `approver`** — and per `DEC-D25`, that is a **maintainer act**,
not a file operation.

### 4.2 Final readiness — the amendment, not reissuance, is the minimum

The three certificates already exist at the correct paths with the correct names. The **minimum**
action is therefore **amendment** to add the three missing fields:

| Field | A1 value (measured) |
|---|---|
| `**Issuer:**` | `IIPS Engineering Standards Maintainer` |
| `**Issued:**` | a date |
| `**Status:**` | `AUTHORIZED — implementation may begin against the frozen baseline` |

**Reissuance must occur AFTER the freeze manifests**, because the A1 certificates certify
*"reference assets frozen"* — a condition that the freeze manifest is the evidence for.

**Minimum files affected: 3** (amended in place). **A maintainer issuance act is additionally
required and cannot be self-performed** — `DEC-D25` established that the existing certificates are
not maintainer-issued, and a party cannot issue its own authorization.

---

## 5. ARCHITECTURE-REVIEW DETERMINATION

# **Required only as a condition of the readiness-certificate convention — NOT mandatory as an A1 limb**

### 5.1 Evidence

| Source | Finding |
|---|---|
| `DEC-D5-EVIDENCE-MATURITY` §2 (the authoritative A1 definition) | Four limbs: independent verification, final readiness, freeze/provenance, required regression evidence. **Architecture review is not named. Documentation is not named.** |
| `DEC-D5-EVIDENCE-MATURITY` §3 table columns | *Indep. verif. · Final readiness · Freeze manifest · Regression test files · Source files* — **no documentation or architecture-review column** |
| `DEC-A2-A1-CLOSURE-STRATEGY` §5 (authoritative closure map) | Tier-3 "Missing documents" = **independent verification, final readiness, freeze manifest**. **Architecture review is not listed. The 19-document set is not listed.** |
| Matrix §3.1 evidence-depth provenance | `iips-platform/IES0xx_*`, `iips-platform/reports*/`, `ies-0xx-*/IES-0xx_FREEZE_MANIFEST.json`, `iips-platform/tests/regression/` — **`docs/` is not listed** |
| A1 readiness certificates (**all 6**) | Each certifies *"architecture review passed (8/8 / 11/11) ✅"* — **universal** (measured: 1 of 1 in each) |
| A1 freeze manifests (**all 6**) | Each has `reviewArtifacts` including `IES-0xx_ARCHITECTURE_REVIEW.md`, and `engineeringDocs: "IES-0xx-D01..D19 (19 documents)"` — **universal** |

### 5.2 Conclusion

**Architecture review is NOT an A1 limb.** No governance rule requires it. It appears **only**
inside the established *form* of limbs 2 and 3 — the readiness certificate certifies it, and the
freeze manifest lists it under `reviewArtifacts`.

**Therefore it is a condition of the readiness-certificate / freeze-manifest convention, not of
the A1 definition.**

### 5.3 Consequence for minimum scope — and the one open convention question

Because it is a convention condition rather than a limb, there are two possible minimum forms:

| Form | `engineeringDocs` | `reviewArtifacts` | New artifacts required |
|---|---|---|---|
| **(a) Reduced — reference existing artifacts** | the discovery pack (which contains the normative calculation contract, calibration, evidence and data-authority sections) | the existing `*_ENGINE_ACCEPTANCE_MATRIX.md` + `*_IMPLEMENTATION_RISK_REGISTER.md` | **NONE** |
| **(b) Full A1 pattern** | a 19-document set | `ARCHITECTURE_REVIEW.md` + review matrices | **The 60-artifact programme** |

**All artifacts required by form (a) already exist** — measured per engine: discovery pack,
acceptance matrix, risk register.

**This record does not select between (a) and (b).** That is a **convention decision** which
belongs to the subsequent relief-authorization gate, because choosing (b) would expand the relief
scope by 60 artifacts. **What this record establishes is that (b) is NOT required by the A1
definition** — so the minimum-necessary principle points to (a) unless the maintainer decides the
convention requires otherwise.

---

## 6. FENCE-9 — SEPARATE, NOT BUNDLED

`DEC-A2-A1-CLOSURE-STRATEGY` §6 establishes **four separate authority actions**, of which
*"Updating the matrix from A2 → A1"* is **#4 — a separate matrix-amendment authority**.

**The eventual matrix update is therefore NOT included in this fence-4/fence-8 relief scope.** It
is recorded separately as **fence-9-bound**: `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`.

---

## 7. EXCLUSIONS — NOT IN THIS RELIEF SCOPE

| Excluded | Why |
|---|---|
| **The 60-artifact documentation programme** | Not an A1 limb. `DEC-D5` §2 and `DEC-A2-A1-CLOSURE-STRATEGY` §5 do not require it. Included only if the §5.3 convention decision selects form (b) |
| `D-AUTHCLAIM-UNSUPPORTED` correction (4 files) | A truthfulness correction, **not** an A1 prerequisite |
| IES-016 `:281` / `:295` false factual claims | Same — not an A1 prerequisite |
| IES-016 `M1–M15` boilerplate restatement | Template defect; not an A1 prerequisite |
| **IES-020 Q1 aluminium placement** | **Not required for A1** — not exercised by the frozen dataset, no effect on certified outputs |
| Unrelated methodology changes | Out of scope; D25 closed methodology acceptance |
| Certification work beyond the A1 evidence prerequisites | Out of scope |
| **Matrix modification** | **Fence 9 — separate authority** (§6) |
| **A1 / A2 promotion itself** | Separate authority — `DEC-A2-A1-CLOSURE-STRATEGY` §6 action #4 |
| Dangling-citation corrections (*Amendment v1.1*, `/home/user/IIPS-IES-016-DISCOVERY.md`, the four absent primary records) | Truthfulness items, not A1 prerequisites |

---

## 8. CROSS-ENGINE PARALLELISM

**The three engines' relief scopes are structurally identical** — the same three artifact types per
engine, at parallel paths, with no cross-engine dependency.

| Relationship | Determination |
|---|---|
| IES-016 ↔ IES-017 ↔ IES-020 | **Fully parallel** — one relief authorization can cover all three; execution can proceed concurrently |
| Freeze manifest → readiness certificate | **Sequential within an engine** — the certificate certifies *"reference assets frozen"*, for which the manifest is the evidence |
| Independent verification | **Independent** of both, but requires the implementation to be final (it is — `DEC-A2-A1-CLOSURE-STRATEGY`: *"No implementation change is required"*) |
| Regression tests | **Independent** of all the above |
| A2 → A1 promotion | **After all four limbs**, and under separate fence-9 / matrix authority |

---

## 9. MINIMUM RELIEF DECISION

```text
Fence 4  (iips-platform/**) — 9 files CREATED, 0 amended, 0 deleted:
  CREATE  iips-platform/IES016_INDEPENDENT_VERIFICATION_REPORT.md
  CREATE  iips-platform/IES017_INDEPENDENT_VERIFICATION_REPORT.md
  CREATE  iips-platform/IES020_INDEPENDENT_VERIFICATION_REPORT.md
  CREATE  iips-platform/tests/regression/telecommunications-framework-integration.test.ts
  CREATE  iips-platform/tests/regression/telecommunications-reuse-verification.test.ts
  CREATE  iips-platform/tests/regression/automobile-framework-integration.test.ts
  CREATE  iips-platform/tests/regression/automobile-reuse-verification.test.ts
  CREATE  iips-platform/tests/regression/materials-metals-framework-integration.test.ts
  CREATE  iips-platform/tests/regression/materials-metals-reuse-verification.test.ts
  EXECUTE the clean-clone independent verification and the 6 regression suites

Fence 8  (ies-010 … ies-020) — 3 files CREATED + 3 files AMENDED, 0 deleted:
  CREATE  ies-016-telecommunications/IES-016_FREEZE_MANIFEST.json
  CREATE  ies-017-automobile/IES-017_FREEZE_MANIFEST.json
  CREATE  ies-020-materials-metals/IES-020_FREEZE_MANIFEST.json
  AMEND   ies-016-telecommunications/IES-016_IMPLEMENTATION_READINESS_CERTIFICATE.md
          (add Issuer / Issued / Status — after the freeze manifest exists)
  AMEND   ies-017-automobile/IES-017_IMPLEMENTATION_READINESS_CERTIFICATE.md   (same)
  AMEND   ies-020-materials-metals/IES-020_IMPLEMENTATION_READINESS_CERTIFICATE.md   (same)
  PLUS    a maintainer issuance act for the 3 certificates and the 3 manifest
          `approver` fields — cannot be self-performed

Fence 9  (docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md):
  DEFERRED — separate matrix-amendment authority, per DEC-A2-A1-CLOSURE-STRATEGY §6
  action #4. NOT bundled into this relief.

Other — explicit exclusions:
  EXCLUDED  the 60-artifact documentation programme (not an A1 limb)
  EXCLUDED  D-AUTHCLAIM-UNSUPPORTED and IES-016 factual/boilerplate corrections
  EXCLUDED  IES-020 Q1 aluminium placement
  EXCLUDED  unrelated methodology changes
  EXCLUDED  certification beyond the A1 evidence prerequisites
  EXCLUDED  matrix modification and A1/A2 promotion itself

Open convention question carried to the relief-authorization gate:
  §5.3 form (a) reduced — reference existing artifacts, 0 new documentation
  §5.3 form (b) full A1 pattern — would add the 60-artifact programme
  This record establishes that (b) is NOT required by the A1 definition.
```

**Totals: 12 files created + 3 files amended + 3 maintainer issuance acts. Nothing else.**

---

## 10. AUTHORITY BOUNDARY

**This record grants and exercises nothing.**

| Authority | Granted by D27? |
|---|---|
| Fence-4 relief | **NO** |
| Fence-8 relief | **NO** |
| Amendment of `SPEC-G-AI-IMPL` §5 | **NO** |
| Product mutation | **NO** |
| Test creation | **NO** |
| Test execution | **NO** |
| Independent-verification execution | **NO** |
| Freeze-manifest creation | **NO** |
| Readiness-certificate issuance | **NO** |
| A2 → A1 promotion | **NO** |
| Matrix amendment | **NO** |
| Certification | **NO** |

**Dependency:** every item above requires a **subsequent dedicated relief-authorization
`DECISION`**, taking the COL-1 … COL-4 form — explicit maintainer authorization, recorded as a
`DECISION`, amending `SPEC-G-AI-IMPL` §5 only, minimum necessary scope, no broader relaxation.
`D-21 §7` (**B — PATHWAY AUTHORIZED / NO RELIEF GRANTED**) remains in force until then.

---

## 11. WHAT THIS RECORD DOES NOT DO

No relief granted or exercised · no fence broadened, narrowed or relaxed · no amendment of
`SPEC-G-AI-IMPL` §5 · no product / source / test / schema / persistence / parser / UI file created
or modified · no test created or executed · no independent verification performed · no freeze
manifest created · no readiness certificate issued or modified · no architecture review created ·
no documentation created · no A2 → A1 promotion · no matrix amendment · no certification · no
release or tag change · no methodology accepted, rejected or altered · no amendment of `D21`,
`D22`, `D23`, `D25` or any prior governance record · no P7 reopening · no H/I/J execution · no
branch merged, rebased, created, moved or deleted · no force-push.

## 12. CLASSIFICATION

# **D27 RECORDED — RELIEF SCOPE DETERMINED · NO RELIEF GRANTED OR EXERCISED**

The **minimum necessary** scope for Tier-3 A1 closure is **12 files created + 3 amended + 3
maintainer issuance acts**: fence 4 covers **9 new files** (3 independent-verification reports and
6 regression tests, all strictly required by the D5-S1 four-kind rule); fence 8 covers **3 freeze
manifests created** and **3 readiness certificates amended in place** — amendment, not reissuance,
being the minimum because the files already exist at the correct paths. **Architecture review is
NOT an A1 limb**; it is a condition of the readiness-certificate convention only, and the reduced
form referencing existing artifacts requires **zero** new documentation. **The 60-artifact
documentation programme is excluded**, as are all non-A1 corrections, IES-020 Q1, matrix
modification and A1/A2 promotion. **Fence 9 is separate and unbundled.** The three engines' scopes
are structurally identical and may proceed in parallel. **No relief is granted or exercised by this
record**; everything remains dependent on a subsequent dedicated relief-authorization `DECISION` in
COL-1 … COL-4 form. **STOP.**
