# DEC-D14-TIER3-PREREQUISITE-RESOLUTION — Tier-3 A1 Pathway: Documentation-Parity Programme Scoped

- **Record ID:** `DEC-D14-TIER3-PREREQUISITE-RESOLUTION`
- **Title:** D14 — Tier-3 A1 Prerequisite Resolution: Documentation-Parity Programme Authorized as Scope Only; Independence Prerequisite Recorded as Unresolved
- **Class:** `DECISION`
- **Status:** `RECORDED — §1 = B (PROGRAMME SCOPE ONLY) · LABELLING FINDING RECORDED · NO EVIDENCE CREATED`
- **Date:** 2026-08-28
- **Authority relationship:** gate `D14 — Tier-3 A1 Prerequisite-Resolution Gate`. The maintainer
  selected **§1 = B**, dispositioned the newly surfaced labelling finding as **record only**, and
  granted **durable recording authority on `arena`** separately and explicitly. **No
  evidence-creation, A1-transition, matrix-amendment, verifier-engagement or product-branch
  authority was granted or inferred.**
- **Scope:** resolution of the two Tier-3 A1 prerequisites, definition of the authorized
  programme's scope, and recording of one new finding. **No evidence created, no documentation
  authored, no A1 transition, no matrix change, no engine or implementation change, no
  certification change, no release or tag change, no P7 reopening.**
- **Provenance:** read-only discovery against `origin` in the same turn. Document counts were
  taken from `git ls-tree` on `origin/phase13-next`; verifier labels from `git show` on each of
  the 11 reports.
- **Supersession / revision relationship:** amends nothing. Carries forward **D7-3 = A**
  unchanged and `D7-TIER3-INDEPENDENCE` (resolved as a negative). **Records a correction to the
  scope statement in `DEC-A2-A1-TIER3-CREATION-AUTHORITY` §3**, which is a dated record and is
  therefore **not** edited.

---

## 1. SELECTIONS

| Question | Selected |
|---|---|
| **§1** — Tier-3 A1 pathway | **B — authorize a documentation-parity programme (scope/plan only)** |
| **New finding** — unqualified independence claims in the A1/CSIP reports | **Record only, no amendment** |
| **§5** — Recording authority | **GRANTED** — this record, on `arena` only |

Options **A** (permanent dormancy), **C** (methodology gate) and **D** (defer) were presented and
**not** selected.

---

## 2. PRECHECK STATE — AND A TENTH RE-PROVISION

`git ls-remote origin` → **8 refs**, identical to the D13 end-state: `arena`
`f52c56cd955f9e1c60cf3e2a60f00777aac0aea7` · `phase13-next`
`357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` · `main` `c65d533…` · `gai-impl-canonical`
`f63a9b49…` · `phase13-hardening-delivery` `254e4723…` · tag pair `a975b0dc…` / `7325aeda…`.
`governance/iips/` = **40 records** before this commit. Matrix =
`cada0451400409b0fe9ff0d62309b756c7b45e43`.

**Disclosure:** the sandbox **re-provisioned during this gate**, destroying the working clone
`iips-gov9` mid-discovery. A fresh clone (`iips-gov10`) was taken and discovery completed from
`origin`. This is the **10th** re-provision observed. The durable store was unaffected — further
empirical confirmation of `DEC-D6-DURABLE-RECORDING-POLICY`.

**Tier-3 population, verified from the matrix:** the 7 A2 rows are Banking, Insurance, Capital
Markets, Healthcare (Tier 2) and **Telecommunications (IES-016), Automobile (IES-017), Materials
& Metals (IES-020)** (Tier 3).

---

## 3. PREREQUISITE 1 — THE PREMISE IS INVERTED (finding recorded, not amended)

The gate asked whether *"the existing programme convention of verification labelled **SIMULATED**"*
is acceptable for a future Tier-3 pathway. All **11** independent-verification reports at
`phase13-next` were examined:

| Reports | Verifier line | `simulated` occurrences |
|---|---|---|
| `IES010`–`IES015`, `CSIP` — **7 reports** | **`Verifier: Arena AI (independent, clean-clone, from committed repository state)`** | **0** |
| `reports-insurance`, `-healthcare`, `-capital-markets` — **3** | `Reviewer role: Independent verification (Arena as reviewer)` | **0** |
| `reports/` (banking) — **1** | `Reviewer role: … (Arena acting as reviewer, not implementer)` and `## 1. Methodology (simulated independent engineer)` | **1** |

**`simulated independent engineer` appears in exactly 1 of 11 reports** —
`iips-platform/reports/INDEPENDENT_VERIFICATION_REPORT.md:10`. `git grep` across all of
`phase13-next` confirms **one file**, that one.

### 3.1 What is and is not corrected

- `DEC-A2-A1-TIER3-CREATION-AUTHORITY` §3's **specific citation** of the banking report is
  **accurate** and was verified verbatim.
- Its **generalization** at line 78 to an *"established convention"* is **not supported by the
  repository**. Ten of eleven reports carry no such label, and **seven — all six A1 sector
  engines plus CSIP — affirmatively assert independence** without qualification.

That record is **dated** and is **not edited**. **This record is the correction.**

### 3.2 Why this inverts the question

Requiring Tier-3 verification to be labelled `SIMULATED` would make Tier 3 **more candid than the
seven A1/CSIP reports**. The inconsistency does not run "Tier 3 must catch up to A1"; it runs the
other way — the A1 evidence carries **unqualified independence claims** while
`D7-TIER3-INDEPENDENCE` is resolved as a **negative**: no genuinely independent verifier exists.

**No capability class, evidence maturity or certification result is affected by this finding.**
It concerns how existing evidence is **labelled**, not what was verified. Per the maintainer's
selection it is **recorded only** — no repository file and no existing record is amended, and the
reports in question are **product-branch files on `phase13-next`**, which this gate holds no
authority to change.

---

## 4. PREREQUISITE 2 — A1 PARITY CONFIRMED AND QUANTIFIED

| Engine | `docs/` | `ARCHITECTURE_REVIEW` | Review-type document | Total files |
|---|---|---|---|---|
| `ies-010-hospitality` | **19** | **1** | `HOSPITALITY_ONTOLOGY_REGISTRATION_REVIEW.md` | 54 |
| `ies-011-energy` | **19** | **1** | — | 56 |
| `ies-012-utilities` | **19** | **1** | — | 51 |
| `ies-013-consumer` | **19** | **1** | `CONSUMER_CALIBRATION_BOUNDARY_REVIEW_MATRIX.md` | 50 |
| `ies-014-industrials` | **19** | **1** | — | 46 |
| `ies-015-technology` | **19** | **1** | — | 48 |
| `ies-016-telecommunications` | **0** | **0** | — | **12** |
| `ies-017-automobile` | **0** | **0** | — | **12** |
| `ies-020-materials-metals` | **0** | **0** | — | **12** |

The A1 set is uniform across all six sector engines: **19 numbered documents**
(`IES-0xx_01_README` … `IES-0xx_19_REFERENCE_DATA_SOURCES`) plus `IES-0xx_ARCHITECTURE_REVIEW.md`.

### 4.1 Correction — "review matrices" are **not** part of the A1 standard

Only **2 of 6** A1 sector engines hold any review-type document, and they are **different**
documents; **4 of 6 hold none**. Including review matrices in the parity definition would require
Tier 3 to **exceed** the A1 baseline — the opposite of parity.

**Parity is therefore defined as: 19 numbered documents + `ARCHITECTURE_REVIEW`. Nothing more.**

---

## 5. §1 = B — WHAT IS AUTHORIZED, EXACTLY

### 5.1 The contradiction in the option as drafted, and how it is resolved here

Option B as drafted authorized *"producing the required engineering documentation and
architecture-review evidence"* while also stating that *"no … evidence creation … is implied."*
Producing that documentation **is** evidence creation. The two halves cannot both hold.

**Resolved in favour of the narrower, express limitation:** this gate authorizes the
**programme's scope and plan only**. **Authoring any document is evidence creation and requires
its own separate authority.** No document is authored by this record.

### 5.2 Authorized programme scope

| Item | Definition |
|---|---|
| **Population** | IES-016 (Telecommunications), IES-017 (Automobile), IES-020 (Materials & Metals) |
| **Target per engine** | **19 numbered documents** following the A1 naming pattern `IES-0xx_NN_<TITLE>.md`, plus **`IES-0xx_ARCHITECTURE_REVIEW.md`** |
| **The 19 titles** | `01_README`, `02_EXECUTIVE_SUMMARY`, `03_INDUSTRY_MODEL`, `04_BUSINESS_MODEL`, `05_METHODOLOGY_PRINCIPLES`, `06_METRIC_LIBRARY`, `07_SCORE_ENGINE`, `08_FORMULA_LIBRARY`, `09_CALIBRATION`, `10_DECISION_ENGINE`, `11_EVIDENCE_FRAMEWORK`, `12_VALIDATION`, `13_ARENA_IMPLEMENTATION_SPECIFICATION`, `14_REFERENCE_ASSET_GOVERNANCE`, `15_NORMATIVE_CALCULATION_APPENDIX`, `16_IMPLEMENTATION_READINESS_CERTIFICATE`, `17_MASTER_INDEX`, `18_DATA_DICTIONARY`, `19_REFERENCE_DATA_SOURCES` |
| **Excluded** | **Review matrices** — not an A1 invariant (§4.1) |
| **Scale** | 20 artifacts per engine × 3 engines = **60 artifacts** |

### 5.3 What Tier 3 already holds

Each Tier-3 engine holds **5** markdown artifacts, uniform across all three:
`IES-0xx_IMPLEMENTATION_READINESS_CERTIFICATE.md`, `RELEASE_NOTES_IES-0xx_v1.0.0.md`,
`<SECTOR>_DISCOVERY_PACK.md`, `<SECTOR>_ENGINE_ACCEPTANCE_MATRIX.md`,
`<SECTOR>_IMPLEMENTATION_RISK_REGISTER.md`.

**One** member of the A1 set — the implementation readiness certificate — has a Tier-3 counterpart
in substance. The remaining **18 documents and the `ARCHITECTURE_REVIEW` are absent**. Whether the
four non-A1 Tier-3 artifacts map into the numbered set is a **scoping question for the programme**
and is **not** asserted here.

### 5.4 The limitation that must not be lost

**Completing this programme would NOT by itself make IES-016/017/020 A1-eligible.**

The programme resolves **prerequisite 2 (document parity)**. It does **not** resolve
**prerequisite 1 (independence)**, because the 60 artifacts would be authored by the same party
that implemented the engines. Document parity achieved without independence parity yields **more
documentation at A2**, not A1.

**An A1 transition therefore requires both prerequisites resolved, plus its own separate
authority, plus a matrix amendment under its own separate authority. None of these is granted
here.**

---

## 6. D7-3 = A IS PRESERVED

| Constraint | Status |
|---|---|
| The A1 standard is **not** lowered for Tier 3 | **PRESERVED** |
| No **Tier-3 exception** to the A1 definition | **PRESERVED — none created** |
| Any methodology change must affect the **applicable Class-A population**, not Tier 3 alone | **PRESERVED** |
| All 14 capabilities remain **Class A** | **UNCHANGED** |
| The seven A2 capabilities remain **A2** | **UNCHANGED** |

---

## 7. AUTHORITY SEPARATION

Stated separately. **Nothing below is authorized by this gate.**

| Authority | Granted by D14? |
|---|---|
| Programme **scope and plan** | **YES — the only grant** |
| Authoring documentation / **evidence creation** | **NO** |
| **A1 transition** for IES-016/017/020 | **NO** |
| **Matrix amendment** | **NO** |
| Verifier engagement (real or simulated) | **NO** |
| Methodology change to the A1 definition | **NO** |
| Product-branch mutation (incl. the 11 verification reports) | **NO** |
| Certification or release/tag change | **NO** |
| P7 reopening | **NO** |

**No authority not explicitly granted has been inferred** — not from configured credentials, not
from write capability, not from technical convenience, and not from any prior GO.

---

## 8. THE SINGLE NEXT GATE

Identified from the resulting state. **Not pre-authorized and not executed by this record.**

Two prerequisites stand between Tier 3 and A1. They are **not** independent in effect:

| Prerequisite | State after D14 | Blocking what |
|---|---|---|
| **2 — document parity** | **Programme scoped, unexecuted** | A1 eligibility |
| **1 — independence / labelling** | **UNRESOLVED**, and now shown to affect the **A1 population itself** | the **value** of prerequisite 2's output |

Because prerequisite 1 determines whether 60 newly authored documents could **ever** support an A1
transition, resolving it **first** avoids authoring evidence that cannot reach its purpose.

# **`D15 — VERIFICATION-INDEPENDENCE LABELLING AND METHODOLOGY GATE`**

It would decide whether *"role separation plus clean-workspace reproducibility"* is the
programme's verification methodology **programme-wide**, and what becomes of the **unqualified
independence claims** in the 7 A1/CSIP reports — a question that reaches the A1 population, not
Tier 3 alone. Any resulting correction to those reports is a **product-branch** matter requiring
its own authority.

**This record pre-authorizes nothing in D15.** It selects no outcome, creates no evidence, engages
no verifier, and changes no capability class or maturity.

---

## 9. INVARIANTS PRESERVED — VERIFIED, NOT ASSERTED

| Invariant | Status |
|---|---|
| No evidence artifact created | **PRESERVED — 0 documents authored** |
| No A1 transition | **PRESERVED — IES-016/017/020 remain A2** |
| Matrix `cada04514004…` | **UNTOUCHED** |
| `phase13-next` and all product branches | **UNTOUCHED** |
| The 11 verification reports | **UNTOUCHED** |
| All 14 capabilities Class A, 7 A1 / 7 A2 | **UNCHANGED** |
| D7-3 = A · D7-TIER3-INDEPENDENCE | **UNCHANGED** |
| All dated `DEC-*` records | **UNTOUCHED** |
| Root `README.md` fence `0d759fbdd751…` | **UNTOUCHED** |
| Engines, implementation, certification, releases, tags | **UNTOUCHED** |
| P7 | **NOT reopened, no status claimed** |
| H/I/J | **NOT executed — remain `NOT PERFORMED`** |

---

## 10. WHAT THIS RECORD DOES NOT DO

No documentation authored · no evidence artifact created · no `docs/` directory created · no
`ARCHITECTURE_REVIEW` authored · no A1 transition · no evidence-maturity change · no matrix
amendment · no product-branch mutation · no amendment of any verification report · no engine or
implementation change · no certification-result change · no release, version or tag change · no
verifier engaged, invented or simulated · no methodology change to the A1 definition · no Tier-3
exception created · no Class A capability status change · no P7 reopening and no P7 status claim ·
no H/I/J execution · no amendment of any existing record · no restoration of historical artifacts ·
no D5-S1 threshold change · no branch merged, rebased, created, moved or deleted · no ref other
than `arena` moved · no force-push.

## 11. CLASSIFICATION

# **D14 RECORDED — §1 = B (SCOPE ONLY) · NO EVIDENCE CREATED**

Prerequisite 2 **confirmed and quantified**: A1 = **19 numbered documents + `ARCHITECTURE_REVIEW`**,
uniform across 6/6; Tier 3 = **0 + 0**, 12 files each. **"Review matrices" excluded** from the
parity definition as not an A1 invariant. Prerequisite 1 **recorded as unresolved**, with the
premise corrected: `simulated independent engineer` appears in **1 of 11** reports, while **7
A1/CSIP reports assert independence unqualified**. A documentation-parity programme for
IES-016/017/020 is **scoped** at **60 artifacts** — and expressly **does not** confer A1
eligibility, authorship authority, or any transition. **D7-3 = A is preserved: the A1 standard is
not lowered and no Tier-3 exception exists.** Next gate identified as
**`D15 — VERIFICATION-INDEPENDENCE LABELLING AND METHODOLOGY GATE`** and **not** pre-authorized.
`phase13-next` and the matrix are **unchanged**. All 14 capabilities remain **Class A**,
**7 A1 / 7 A2**. **STOP after recording — no further authority is held or inferred.**
