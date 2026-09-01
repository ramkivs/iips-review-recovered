# DEC-D5-EVIDENCE-MATURITY â€” Class-A Evidence Sub-Classification (A1 / A2)

- **Record ID:** `DEC-D5-EVIDENCE-MATURITY`
- **Title:** D5 â€” Evidence Parity / Class-A Definition: Evidence Maturity Sub-Classification Authorized
- **Class:** `DECISION` / `METHODOLOGY AUTHORITY`
- **Status:** `RECORDED â€” OPTION A AUTHORIZED`
- **Date:** 2026-08-28
- **Authority relationship:** gate `PROGRAM v3.0 / IES CAPABILITY RE-BASELINE AUTHORITY GATE`,
  decision **D5**. The maintainer was presented with options **A / B / C / D** and explicitly
  selected **A â€” define evidence maturity explicitly**. Recording authority (record +
  authority-only commit + push to `origin/arena/01a03e3b-iips-review-recovered`) was granted
  separately and explicitly at the same gate; it was **not** inferred.
- **Scope:** the meaning of Class A with respect to evidence depth, and the resulting
  classification of the 14 capabilities. It authorizes **no** matrix modification, **no**
  evidence-artifact creation, **no** engine change, **no** merge, **no** certification change
  and **no** release or version promotion.

**Provenance:** pre-existing governance record; provenance reconstructed from the authoritative governance record and execution lineage available at the time of D33-C1 amendment. This metadata amendment records provenance only and does not alter the record's substantive decision, authorization, scope, or evidentiary determination.

---

## 1. THE PROBLEM

`docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` (blob `4967b0232afc`) assigns class **A**
â€” *"IMPLEMENTED + CERTIFIED + RUNTIME INTEGRATED + UI INTEGRATED"* â€” uniformly to all 14
capabilities. The read-only re-baseline discovery established that the **supporting evidence
behind that uniform class letter spans three distinct depths**, and that **no authority rule
exists** stating whether Class A requires the full evidence bundle. Absent such a rule,
"parity incomplete" could not be asserted as a violation, and "all 14 class A" could not be
read as a statement about evidence uniformity.

## 2. DECISION â€” OPTION A AUTHORIZED

Class A is sub-classified by **evidence maturity**:

| Sub-class | Definition |
|---|---|
| **A1 â€” Full evidence** | Independent verification **+** final readiness **+** freeze / provenance evidence **+** required regression evidence |
| **A2 â€” Partial evidence** | Capability and implementation validated, but **one or more** full-evidence artifacts absent |

**Capability status is NOT changed by this decision.** All 14 capabilities remain Class A â€”
implemented, certified, runtime-integrated and UI-integrated. A1/A2 describes the **depth of
the evidence supporting** that status, not the status itself. No capability is downgraded,
de-certified or evidence-blocked by this record.

## 3. THE 14 CAPABILITIES RE-TIERED

Every row below was verified by `git ls-tree` / `git grep` against canonical
`85bbd49cd31c215a8fd0e7651b718861944dfe45`. Counts are artifacts found, not inferred.

| IES | Engine | Indep. verif. | Final readiness | Freeze manifest | Regression test files | Source files | **Tier** |
|---|---|---|---|---|---|---|---|
| IES-006.2A | banking | 1 | â€” | â€” | 1 | 11 | **A2** |
| IES-007 | insurance | 1 | â€” | â€” | 3 | 11 | **A2** |
| IES-008 | capital-markets | 1 | â€” | â€” | 3 | 10 | **A2** |
| IES-009 | healthcare | 1 | â€” | â€” | 3 | 10 | **A2** |
| IES-010 | hospitality | 1 | 1 | 1 | 4 | 11 | **A1** |
| IES-011 | energy | 1 | 1 | 1 | 4 | 11 | **A1** |
| IES-012 | utilities | 1 | 1 | 1 | 4 | 11 | **A1** |
| IES-013 | consumer | 1 | 1 | 1 | 4 | 11 | **A1** |
| IES-014 | industrials | 1 | 1 | 1 | 4 | 11 | **A1** |
| IES-015 | technology | 1 | 1 | 1 | 4 | 11 | **A1** |
| IES-016 | telecommunications | â€” | â€” | â€” | 2 | 11 | **A2** |
| IES-017 | automobile | â€” | â€” | â€” | 2 | 11 | **A2** |
| IES-020 | materials-metals | â€” | â€” | â€” | 2 | 11 | **A2** |
| CSIP | cross-sector | 1 | 1 | 1 | 4 | 13 | **A1** |

```
A1 â€” FULL EVIDENCE    (7):  IES-010, IES-011, IES-012, IES-013, IES-014, IES-015, CSIP
A2 â€” PARTIAL EVIDENCE (7):  IES-006.2A, IES-007, IES-008, IES-009, IES-016, IES-017, IES-020
```

Artifact locations, for auditability: the independent-verification reports and
final-readiness certificates for IES-010â€¦015 and CSIP live in `iips-platform/`
(`IES010â€¦IES015_INDEPENDENT_VERIFICATION_REPORT.md`, `IES010â€¦IES015_FINAL_READINESS_CERTIFICATE.md`,
`CSIP_INDEPENDENT_VERIFICATION_REPORT.md`, `CSIP_FINAL_READINESS_CERTIFICATE.md`); those for
IES-006.2Aâ€¦009 live in `iips-platform/reports/`, `reports-insurance/`,
`reports-capital-markets/`, `reports-healthcare/`. Freeze manifests live inside the
`ies-0xx-*/` packs (IES-010â€¦015) and `iips-cross-sector/`. **There are no `IES016_*`,
`IES017_*` or `IES020_*` artifacts anywhere**, and those three packs hold **zero** artifacts
outside their own directories.

### 3.1 Missing artifacts per A2 member

| Capability | Missing |
|---|---|
| IES-006.2A banking | final-readiness, freeze-manifest; regression depth 1 (the lowest of all 14) |
| IES-007 insurance | final-readiness, freeze-manifest |
| IES-008 capital-markets | final-readiness, freeze-manifest |
| IES-009 healthcare | final-readiness, freeze-manifest |
| IES-016 telecommunications | independent-verification, final-readiness, freeze-manifest; regression depth 2 |
| IES-017 automobile | independent-verification, final-readiness, freeze-manifest; regression depth 2 |
| IES-020 materials-metals | independent-verification, final-readiness, freeze-manifest; regression depth 2 |

### 3.2 The tiering is insensitive to the undefined regression threshold

The A1 definition's fourth limb â€” *"required regression evidence"* â€” has **no quantified
threshold in any authority record**. That sub-gap is recorded rather than silently filled.
It does **not** affect this tiering:

| Regression threshold | A1 set size | A1 membership identical to threshold 3? |
|---|---|---|
| â‰¥ 0 | 7 | YES |
| â‰¥ 1 | 7 | YES |
| â‰¥ 2 | 7 | YES |
| â‰¥ 3 | 7 | YES |
| â‰¥ 4 | 7 | YES |
| â‰¥ 5 | 0 | no (no capability has 5+ regression test files) |

**Every A2 member already fails at least one non-regression limb**, so the 7/7 split holds
for any threshold from 0 to 4. The regression limb should still be quantified by a later
authority decision (see Â§6).

## 4. IMPLEMENTATION PARITY IS UNAFFECTED

Source-file counts under `iips-platform/src/sector-engines/`: banking 11, insurance 11,
capital-markets 10, healthcare 10, hospitality 11, energy 11, utilities 11, consumer 11,
industrials 11, technology 11, **telecommunications 11, automobile 11, materials-metals 11**,
cross-sector 13.

**IES-016, IES-017 and IES-020 have implementation parity with the A1 engines** (11 source
files each), and each carries the full frozen-asset set â€” `calibration/`,
`fixtures/â€¦golden-reference`, `expected-outputs/`, `fixtures/â€¦validation-fixtures`,
`replay-datasets/`, `contract-tests/generate_expected_outputs.py`,
`*-ontology-metadata-1.0.0.json` â€” plus a discovery pack, an acceptance matrix, an
implementation risk register, an `IES-0XX_IMPLEMENTATION_READINESS_CERTIFICATE.md` and
release notes.

**A2 is therefore an evidence statement, not a capability or implementation statement.** No
capability gap and no implementation gap is created or implied by this record.

## 5. IMPLICATIONS FOR D3 AND D4

### 5.1 D3 â€” matrix re-baselining

**D3's scope changes.** Before this decision, D3 was a header-basis refresh only. Under
option A, applying the classification to the authoritative matrix requires:

1. an **evidence-maturity column** (or equivalent annotation) on the matrix's per-engine
   table;
2. the **7 A1 / 7 A2 designations** from Â§3 recorded against the corresponding rows;
3. the **header basis correction** already identified (the stated basis `7f6b27d5` is a
   commit at which the matrix does not exist; it was added at `9a92015` 2026-08-17 and
   extended at `3514d47` 2026-08-20; from `3514d47` to canonical only **one** engine-surface
   file changed, and it does not touch engine registration);
4. an explicit statement that **class A is unchanged** for all 14 and that A1/A2 denotes
   evidence depth only.

**This record does not make those amendments.** Modifying
`docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` requires separate **matrix-amendment
authority**, which is **not granted here**. Until D3 is executed, the authoritative
classification is **this record**, and the matrix continues to show an undifferentiated
class A â€” a known, recorded divergence.

D3 remains **documentation-only**: no capability claim, classification, threshold or
methodology in the matrix needs to change, because every existing capability claim was
verified to still hold at canonical.

### 5.2 D4 â€” AI Advisory matrix / merge treatment

**D4 is structurally unaffected but gains a classification obligation.**

- The certified AI Advisory surface at `f63a9b493118643725568a95b86405a5835a30a0` is **not
  an engine** and is not one of the 14; this decision does not classify it.
- If D4 authorizes a matrix row for AI Advisory, that row must carry its **own evidence
  maturity designation**. On the recorded evidence it would be **A2-partial**: criteria Aâ€“F,
  K, L, M1â€“M3 PASS, with **H (authenticated live 200), I (real Keycloak) and J (live
  browser) NOT PERFORMED** under the Option-D limitation in
  `DEC-G-AI-IMPL-CERTIFICATION` Â§5. That is precisely the A2 condition â€” capability and
  implementation validated, one or more full-evidence artifacts absent.
- The two D4 decisions remain **separate and both ungranted**: the merge
  (`phase13-next` is an ancestor of `f63a9b49` with merge-base exactly `85bbd49`, so it
  would be a pure 2-commit fast-forward) and the matrix-row addition.
- **Nothing was merged and `phase13-next` was not modified by this gate.**

## 6. SUB-GAP CREATED BY THIS DECISION

| ID | Sub-gap | Why | Required action |
|---|---|---|---|
| **D5-S1** | The A1 "required regression evidence" limb is **not quantified** | No authority record defines a regression-count or regression-coverage threshold | Quantify it at a later authority decision. **Non-blocking** â€” Â§3.2 proves the current 7/7 split is insensitive to any threshold 0â€“4 |
| **D5-S2** | The matrix does not yet carry the A1/A2 designations | Matrix amendment requires separate authority, not granted here | Execute **D3** under its own matrix-amendment authority |
| **D5-S3** | Whether A2 members should be brought to A1 is **not decided** | Option A defines the tiers; it does not mandate closing them | A later decision may require the missing artifacts for some or all A2 members. **Not decided here** |

## 7. OPTIONS NOT SELECTED, AND WHY IT MATTERS

| Option | Consequence had it been selected |
|---|---|
| **B â€” require the full bundle for Class A** | Would have made independent-verification + final-readiness + freeze evidence mandatory, rendering **7 of 14 capabilities evidence-blocked** â€” including `banking`, the declared reference baseline, and all of IES-006.2Aâ€¦009. That changes **capability status on evidence grounds**, which option A explicitly avoids. Closing it would have required authoring 7 independent-verification reports, 7 final-readiness certificates, 7 freeze manifests, and additional regression tests for banking / 016 / 017 / 020 |
| **C â€” keep Class A evidence-neutral** | Would have left "all 14 class A" concealing a three-tier evidence reality, and left the IES-006.2Aâ€¦009 and `banking` asymmetries unaddressed â€” the asymmetry is **not** confined to IES-016/017/020 |
| **D â€” remain deferred** | No D5 methodology authority; D3, D4, D2 and D6 could not proceed |

## 8. GUARDRAILS HONOURED

| Prohibited | Status |
|---|---|
| Modify the matrix | **NOT DONE** â€” `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` remains `4967b0232afc5e4044951f03d141f4225e435693` |
| Create or modify evidence artifacts | **NOT DONE** â€” no independent-verification, final-readiness or freeze artifact was authored |
| Merge AI Advisory | **NOT DONE** â€” `origin/gai-impl-canonical` unchanged at `f63a9b49` |
| Modify `phase13-next` | **NOT DONE** â€” unchanged at `85bbd49` |
| Change any engine | **NOT DONE** â€” `iips-platform/**` untouched |
| Restore pruned packs | **NOT DONE** â€” `ies-005â€¦009` remain absent per the recorded Option A prune |
| Reopen P7 | **NOT DONE** â€” and P7 is not claimed as PASS; no P7 artifact exists |
| Alter certification | **NOT DONE** â€” `DEC-G-AI-IMPL-CERTIFICATION` blob `968ad4bf8e8fâ€¦` unchanged |
| Promote a version / release | **NOT DONE** â€” tag `v3.0-phase12-certified` unchanged |

## 9. STATE AT RECORDING

```
origin/arena/01a03e3b-iips-review-recovered  = 06c0613bcd12d53aaa4be263e5a4c2ce3847b2f4   (parent of this record)
origin/gai-impl-canonical                    = f63a9b493118643725568a95b86405a5835a30a0   UNCHANGED
origin/phase13-next                          = 85bbd49cd31c215a8fd0e7651b718861944dfe45   UNCHANGED
origin/main                                  = c65d53373717aacc3a1dce12d47b5aeaf50541a5   UNCHANGED
origin/phase13-hardening-delivery            = 254e47233e639d089c59f07f394e4a6b46d8970f   UNCHANGED
refs/tags/v3.0-phase12-certified             = a975b0dc5d91422a0fd4b24030fa4905712f82e4   UNCHANGED
```

## 10. STATUS FLAGS

| Item | Status |
|---|---|
| D5 | **RESOLVED â€” Option A authorized; A1/A2 defined; 14 capabilities re-tiered 7 / 7** |
| Capability status of any engine | **UNCHANGED â€” all 14 remain Class A** |
| D5-S1 regression threshold | **OPEN, non-blocking** |
| D3 | **OPEN â€” scope now includes the A1/A2 column; requires matrix-amendment authority** |
| D4 | **OPEN â€” merge and matrix-row decisions remain separate; neither granted** |
| D2 / D6 | **OPEN â€” not decided by this gate** |
| Implementation authorized | **NO** |
| P7 | **NOT REOPENED, NOT claimed as PASS** |

## 11. CLASSIFICATION

# **D5 â€” OPTION A AUTHORIZED**

Class A now carries an explicit evidence-maturity sub-classification. All 14 capabilities
remain Class A. Seven are **A1 (full evidence)** â€” IES-010, 011, 012, 013, 014, 015 and
CSIP. Seven are **A2 (partial evidence)** â€” IES-006.2A, 007, 008, 009, 016, 017 and 020.
No capability status was changed, no evidence artifact was created, and the matrix was not
modified.
