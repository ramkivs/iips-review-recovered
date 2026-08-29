# DEC-D31-MAINTAINER-ISSUANCE-AND-RELEASETAG-RESOLUTION — Issuance Pending, ReleaseTag Not Mandatory

- **Record ID:** `DEC-D31-MAINTAINER-ISSUANCE-AND-RELEASETAG-RESOLUTION`
- **Title:** D31 — Maintainer-Issuance Mechanism (Six Acts Pending Explicit Maintainer Performance) and ReleaseTag Determination (Not Mandatory for Tier-3 A1)
- **Class:** `DECISION`
- **Status:** `RECORDED — MAINTAINER ISSUANCE = PENDING EXPLICIT MAINTAINER PERFORMANCE (NOT PERFORMED, NOT FABRICATED). RELEASETAG = NOT MANDATORY FOR TIER-3 A1; FIELD VALUE null/DEFERRED. **NO D28 RELIEF EXECUTED. NO TAG CREATED.**`
- **Date:** 2026-08-29
- **Authority relationship:** gate `D31 — Maintainer Issuance + ReleaseTag Resolution`, conducted
  **governance-only**. The maintainer selected **releaseTag outcome 4** and granted recording
  authority with commit and push on `arena`. **No issuance was performed, no tag was created, no
  product file was modified, and no D28 relief was executed.**
- **Scope:** determination of the legitimate maintainer-issuance mechanism and of the `releaseTag`
  requirement, plus the dependency impact of both. **Executes nothing.**
- **Provenance:** the `releaseTag` requirement was traced to its authoritative sources this turn —
  `DEC-D5-EVIDENCE-MATURITY` §2, `DEC-A2-A1-CLOSURE-STRATEGY` §5, `governance/VERSIONING_POLICY.md`,
  `governance/RELEASE_CHECKLIST.md`, and a repository-wide search. Tag ancestry was verified with
  `git merge-base --is-ancestor`. **No value was invented.**
- **Supersession / revision relationship:** amends **nothing**. **`DEC-D28-FENCE-RELIEF-AUTHORIZATION`
  and `DEC-D30-EXECUTION-LINEAGE-AND-ISSUANCE-AUTHORITY` are preserved unchanged.** Resolves the
  `releaseTag` gap that D30 §7 recorded as open. Does **not** record any maintainer act that has
  not occurred.

---

## 1. DECISIONS

| Matter | Determination |
|---|---|
| **A. Maintainer issuance** | **PENDING EXPLICIT MAINTAINER PERFORMANCE.** The mechanism is identified; the six acts have **not** been performed. **Not fabricated.** |
| **B. `releaseTag`** | **Outcome 4 — NOT MANDATORY for Tier-3 A1.** Field value = **`null` / explicitly deferred, with the reason recorded**. **No tag created. No tag-creation gate required for A1.** |
| **Recording** | Granted — this record, committed and pushed to `arena` |

---

## 2. MAINTAINER ISSUANCE

### 2.1 The mechanism, traced

| Element | Finding |
|---|---|
| What constitutes the maintainer act | An **explicit act by the maintainer** — an authorization/approval given at a gate |
| What artifact records it | A governance `DECISION` record that transcribes the act verbatim |
| Which fields it supplies | `Issuer`, `Issued`, `Status` (readiness certificates) and `approver` (freeze manifests) |
| The A1 form, measured | `Issuer: IIPS Engineering Standards Maintainer` · `Issued: <date>` · `Status: AUTHORIZED — implementation may begin against the frozen baseline` · `approver: IIPS Engineering Standards Maintainer` |
| Repository mechanism? | **NONE** — `CODEOWNERS`, `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`, `SECURITY.md` all absent; no signature or approval-token convention; `CONTRIBUTING.md` defines principles only |
| Precedent | The gate pattern used for COL-1 … COL-5 and for every authority act from D10 through D30 |
| Can Arena record it? | **YES, once performed** — Arena may transcribe a maintainer act into a `DECISION`; it **cannot originate** one |
| Is an actual maintainer interaction still required? | **YES** |

### 2.2 Issuance matrix

| Engine | Certificate issuance | Manifest `approver` | Mechanism | Current status |
|---|---|---|---|---|
| **IES-016** | `Issuer` / `Issued` / `Status` required | `approver` required | Explicit maintainer act, recorded in a `DECISION` | **PENDING EXPLICIT MAINTAINER PERFORMANCE** |
| **IES-017** | same | same | same | **PENDING EXPLICIT MAINTAINER PERFORMANCE** |
| **IES-020** | same | same | same | **PENDING EXPLICIT MAINTAINER PERFORMANCE** |

### 2.3 No maintainer act is recorded as having occurred

**The maintainer has not performed these six acts.** Selecting gate options is **not** the same as
performing an issuance. Per the strict rule, this record states the acts as **pending** and
**fabricates no issuer identity, issuance date, approval identity, signature or authorization.**

**Consequence:** until the maintainer performs them, **limb 2 (final readiness)** and the
**`approver` field of limb 3 (freeze/provenance)** cannot be legitimately satisfied. A freeze
manifest asserting `status: FROZEN` without a legitimate `approver` would be incomplete, so the
three manifests should be created **after** issuance.

---

## 3. RELEASETAG DETERMINATION — OUTCOME 4

### 3.1 The requirement, traced to authoritative sources

| Question | Evidence | Finding |
|---|---|---|
| Is `releaseTag` named in the authoritative A1 definition? | `DEC-D5-EVIDENCE-MATURITY` §2: *"A1 — Full evidence = Independent verification **+** final readiness **+** freeze / provenance evidence **+** required regression evidence"* | **NO** |
| Is it listed among Tier-3's missing A1 items? | `DEC-A2-A1-CLOSURE-STRATEGY` §5: *"independent verification, final readiness, freeze manifest"* | **NO** |
| Do the governance convention documents mandate it? | `governance/VERSIONING_POLICY.md` and `governance/RELEASE_CHECKLIST.md` **never mention `releaseTag`**; they govern **releases** (*"Git tag planned"*, *"Git tag created"*), not A1 evidence maturity | **NO** |
| Where does it actually appear? | Repository-wide search: **only 7 files** — the 6 A1 engine freeze manifests + `CSIP_FREEZE_MANIFEST.json` | **A de facto manifest schema, not a mandated requirement** |
| Does A1 depend on release status at all? | `DEC-D5`: *"A1/A2 describes the **depth of the evidence supporting** that status, not the status itself"* | **NO** |

### 3.2 The existing tag cannot legitimately satisfy it

| Check | Result |
|---|---|
| Only tag on `origin` | `v3.0-phase12-certified` → `7325aeda8c9881ebdf2b96f64323998f1c46ba26`, *"chore: establish durable Phase 12 certified baseline"*, **2026-08-12** |
| IES-016 (`9bf91d1`) relative to the tag | tag **IS an ancestor** → engine added **after** the tag |
| IES-017 (`d51b120`) relative to the tag | tag **IS an ancestor** → engine added **after** the tag |
| IES-020 (`6355949`) relative to the tag | tag **IS an ancestor** → engine added **after** the tag |

**The tag predates all three Tier-3 engines and therefore cannot accurately represent their
release.** Using it would record a falsehood. **It is rejected as a value.**

### 3.3 Determination

# **`releaseTag` IS NOT MANDATORY FOR TIER-3 A1**

- The **freeze manifest itself remains required** — it is limb 3.
- The `releaseTag` **field** should be present in the manifest, and its **only legitimate value is
  `null` / explicitly deferred, with this record cited as the reason.**
- **No tag is created by this record.** Creating one is **not required for A1**.
- If a Tier-3 **release** is ever made, that is a **separate release gate** with its own authority;
  `DEC-D28` §9 already excludes release/tag changes.

**This is not a reinterpretation of the A1 convention** — the A1 convention (`DEC-D5` §2) never
mentioned `releaseTag`. The finding is that the field belongs to a de facto manifest schema, not to
the A1 evidence definition.

### 3.4 ReleaseTag determination table

| Engine | Current tag | A1 requirement | Legitimate value | Tag creation required? | Authority |
|---|---|---|---|---|---|
| IES-016 | none | **Not mandated** | **`null` / deferred, reason recorded** | **NO** for A1 | None for A1; a future release needs its own gate |
| IES-017 | none | same | same | **NO** | same |
| IES-020 | none | same | same | **NO** | same |

---

## 4. DEPENDENCY IMPACT

| Limb / activity | Blocked by maintainer issuance? | Blocked by `releaseTag`? |
|---|---|---|
| Limb 1 — independent verification (3 files) | **NO** | **NO — resolved** |
| Limb 4 — regression, 2 missing kinds × 3 engines (6 files) | **NO** | **NO — resolved** |
| Limb 3 — freeze manifests (3 files) | **YES** — `approver`, and `status: FROZEN` implies approval | **NO — resolved as `null`/deferred** |
| Limb 2 — final readiness (3 amendments) | **YES** — `Issuer` / `Issued` / `Status` | **NO** |
| Eventual A2 → A1 authority | Indirectly — requires all four limbs | **NO** |

### 4.1 Can D29 execution now proceed?

**Partially — and not yet in practice.**

| Requirement | Status |
|---|---|
| Execution-lineage authority (`phase13-next`) | **GRANTED by D30** |
| A mechanism with `phase13-next` write access | **STILL NOT SUPPLIED** — D30 §5; this Arena session cannot write there |
| 9 fence-4 files (3 reports + 6 regression tests) | **Not blocked by issuance** — executable once a write mechanism exists |
| 6 fence-8 operations (3 manifests + 3 certificate amendments) | **BLOCKED — pending the six maintainer acts** |
| `releaseTag` | **RESOLVED** |

**So the `releaseTag` blocker is cleared, but the issuance blocker is not, and the write-mechanism
blocker is not. No D28 relief is executed by this record.**

---

## 5. WHAT REMAINS PENDING, AND WHAT AUTHORITY IS STILL REQUIRED

| # | Item | Status | Authority still required |
|---|---|---|---|
| 1 | Execution lineage | **RESOLVED** — `phase13-next` (D30) | — |
| 2 | `releaseTag` | **RESOLVED** — not mandatory; `null`/deferred | None for A1 |
| 3 | **Six maintainer issuance acts** | **PENDING EXPLICIT MAINTAINER PERFORMANCE** | **The maintainer's own act** — cannot be delegated to Arena |
| 4 | A mechanism with `phase13-next` write access | **NOT SUPPLIED** | A session or mechanism with that access |
| 5 | A2 → A1 promotion | **NOT AUTHORIZED** | Separate authority, after all four limbs |
| 6 | Fence-9 / matrix amendment | **NOT AUTHORIZED** | Separate authority |
| 7 | Any Tier-3 release tag | **NOT REQUIRED for A1** | A future release gate, if ever |

**Is a separate tag-creation gate required?** **NO — not for A1.** Only if a Tier-3 release is ever
made.

---

## 6. WHAT THIS RECORD DOES NOT DO

No maintainer act recorded as performed · no issuer, date, approval identity, signature or
authorization invented · no readiness certificate issued or amended · no freeze manifest created ·
no tag created, moved or modified · no independent-verification report created · no regression test
created or executed · no D28 relief exercised · no fence-4 or fence-8 relief exercised · no product
/ source / test / schema / persistence / parser / UI file created or modified · no `phase13-next`
modification or push · no matrix amendment · no A2 → A1 promotion · no certification · no amendment
of `DEC-D28-FENCE-RELIEF-AUTHORIZATION` or `DEC-D30-EXECUTION-LINEAGE-AND-ISSUANCE-AUTHORITY` · no
change to methodology acceptance (`D25`) · no change to A1/A2 authority · no P7 reopening · no H/I/J
execution · no reinterpretation of the A1 convention · no branch merged, rebased, created, moved or
deleted other than the single named `arena` refspec · no force-push.

## 7. CLASSIFICATION

# **D31 RECORDED — ISSUANCE PENDING · RELEASETAG NOT MANDATORY**

The maintainer-issuance mechanism is the programme's established gate pattern — an explicit
maintainer act transcribed into a `DECISION`. **The six required acts (3 readiness issuances and 3
manifest `approver` values) have NOT been performed and are recorded as PENDING EXPLICIT MAINTAINER
PERFORMANCE.** No issuer identity, date, approval identity, signature or authorization is
fabricated. Until performed, **limb 2 and the `approver` field of limb 3 cannot be satisfied.**

**`releaseTag` is NOT MANDATORY for Tier-3 A1.** Traced to authoritative sources: `DEC-D5` §2 names
four limbs and does not include it; `DEC-A2-A1-CLOSURE-STRATEGY` §5 does not list it;
`VERSIONING_POLICY.md` and `RELEASE_CHECKLIST.md` never mention it; it appears in only **7** de
facto manifests. The existing tag `v3.0-phase12-certified` (2026-08-12) **predates all three
Tier-3 engines** and is therefore **rejected as inaccurate**. The field's only legitimate value is
**`null` / deferred with the reason recorded**. **No tag is created; no tag-creation gate is
required for A1.**

**Net effect: the `releaseTag` blocker is cleared. The issuance blocker and the `phase13-next`
write-mechanism blocker are not. No D28 relief is executed. A1/A2 remains 7 / 7.** **STOP.**
