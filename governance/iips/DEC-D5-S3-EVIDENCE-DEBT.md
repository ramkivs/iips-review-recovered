# DEC-D5-S3-EVIDENCE-DEBT â€” D5-S3 A2 Disposition

- **Record ID:** `DEC-D5-S3-EVIDENCE-DEBT`
- **Title:** D5-S3 â€” A2 Evidence Maturity Recorded as Evidence-Debt Requiring Eventual A1 Closure
- **Class:** `DECISION` / `AUTHORITY`
- **Status:** `RECORDED â€” D5-S3 = OPTION B`
- **Date:** 2026-08-28
- **Authority relationship:** gate `PROGRAM v3.0 / IES CAPABILITY RE-BASELINE â€” D2 + D5-S3
  AUTHORITY GATE`. The maintainer was presented with the A2 disposition options and
  explicitly selected **B â€” require eventual A1 closure**, recorded as evidence-debt.
  Governance recording authority was granted separately and explicitly, scoped to
  `governance/iips/` on `arena` only.
- **Scope:** the status of A2 only. **No evidence artifact is created. No capability status
  is changed. No deadline, target date or numeric threshold is invented.**

**Provenance:** pre-existing governance record; provenance reconstructed from the authoritative governance record and execution lineage available at the time of D33-C1 amendment. This metadata amendment records provenance only and does not alter the record's substantive decision, authorization, scope, or evidentiary determination.

---

## 1. DECISION â€” OPTION B

**A2 is a transitional evidence-maturity state, not a permanent one.** The seven A2
capabilities are recorded as **evidence-debt requiring eventual closure to A1**.

This decision changes **nothing** about capability status:

> **Class A capability status remains unchanged for all 14 capabilities.** Recording
> evidence-debt is **not** a capability downgrade, **not** a de-certification, and **not** an
> evidence-blocked classification. Every one of the 14 capabilities remains implemented,
> certified, runtime-integrated and UI-integrated.

## 2. THE EVIDENCE-DEBT REGISTER

Per `DEC-D5-EVIDENCE-MATURITY`, A1 requires: independent verification **+** final readiness
**+** freeze/provenance evidence **+** required regression evidence. Verified by `git ls-tree`
against `origin/phase13-next` (`357b34dac1bdâ€¦`):

| Capability | Independent verification | Final readiness | Freeze manifest | Regression `.test.ts` | Source files | Missing |
|---|---|---|---|---|---|---|
| IES-006.2A `sector.banking` | **Y** (`reports/`) | â€” | â€” | 1 | 11 | final-readiness, freeze-manifest |
| IES-007 `sector.insurance` | **Y** (`reports-insurance/`) | â€” | â€” | 3 | 11 | final-readiness, freeze-manifest |
| IES-008 `sector.capital-markets` | **Y** (`reports-capital-markets/`) | â€” | â€” | 3 | 10 | final-readiness, freeze-manifest |
| IES-009 `sector.healthcare` | **Y** (`reports-healthcare/`) | â€” | â€” | 3 | 10 | final-readiness, freeze-manifest |
| IES-016 `sector.telecommunications` | â€” | â€” | â€” | 2 | 11 | independent-verification, final-readiness, freeze-manifest |
| IES-017 `sector.automobile` | â€” | â€” | â€” | 2 | 11 | independent-verification, final-readiness, freeze-manifest |
| IES-020 `sector.materials-metals` | â€” | â€” | â€” | 2 | 11 | independent-verification, final-readiness, freeze-manifest |

**A1 (no debt): IES-010, IES-011, IES-012, IES-013, IES-014, IES-015, CSIP â€” 7.**

Two distinct debt tiers are recorded, because they have different causes:

| Tier | Members | Nature |
|---|---|---|
| **Tier 2** | IES-006.2A, 007, 008, 009 | Carry independent verification but predate the final-readiness-certificate and freeze-manifest convention |
| **Tier 3** | IES-016, 017, 020 | Postdate the full-bundle convention established by IES-010â€¦015 but did not follow it; carry **none** of the three artifacts |

## 3. EXPLICIT NON-ACTIONS

| Item | Status |
|---|---|
| Create any missing evidence artifact | **NOT DONE** â€” no independent-verification report, final-readiness certificate or freeze manifest was authored |
| Change any capability's class | **NOT DONE** â€” all 14 remain **A** |
| Change any capability's A1/A2 designation | **NOT DONE** â€” still **7 A1 / 7 A2** |
| Invent a deadline or target date for closure | **NOT DONE** |
| Define the D5-S1 regression threshold | **NOT DONE** â€” see Â§4 |
| Recalculate the 7/7 split using an invented threshold | **NOT DONE** |
| Modify the Integration Verification Matrix | **NOT DONE** â€” its Â§3.1 block remains byte-identical |
| Modify any engine or `iips-platform/**` | **NOT DONE** |
| Add AI Advisory tests or change its implementation | **NOT DONE** |
| Alter certification, release or tag state | **NOT DONE** |
| Reopen P7 | **NOT DONE** |

## 4. D5-S1 REMAINS UNTOUCHED

Confirmed explicitly, as required:

- **No numeric regression threshold is authorized.**
- **No threshold may be inferred from test counts.** The observed counts (1, 2, 3, 4) are
  evidence, not a threshold, and are **not** converted into one.
- **D5-S1 remains open** unless separately authorized.
- **The existing 7/7 A1/A2 classification is NOT recalculated.** It stands exactly as
  recorded in `DEC-D5-EVIDENCE-MATURITY` and as amended into the matrix by
  `DEC-D3-MATRIX-REBASELINE`. As that record establishes, the split is identical for **any**
  threshold from 0 to 4, because every A2 capability already lacks at least one
  non-regression artifact â€” so leaving the threshold undefined does not leave the
  classification indeterminate.

**Consequence for closure:** because the regression limb is unquantified, **closure to A1
cannot currently be evaluated against it.** Any future closure decision must either define
the threshold (a separate methodology authority) or close on the three non-regression
artifacts alone. This is recorded so that no future gate silently assumes a threshold.

## 5. CLOSURE PATH (recorded, not scheduled)

Closure of a capability from A2 to A1 requires, at minimum, the artifacts it lacks as listed
in Â§2 â€” authored and verified under separate authority. **This record schedules nothing and
commits no resource.** It establishes only that A2 is debt rather than a settled state, so
that the debt is visible and cannot be silently treated as permanent.

## 6. PROGRAM-LEVEL IMPACT

| Surface | Impact of this decision |
|---|---|
| Integration Verification Matrix | **None required.** The A1/A2 designations already published are unchanged. A future amendment could cross-reference this debt register, but none is made here |
| `phase13-next` | **No change** |
| AI Advisory certification | **No change** â€” its **A2-partial** designation and Option-D H/I/J limitation are unaffected. Note that AI Advisory is a **non-engine** surface recorded under Â§3.2 of the matrix and is **not** one of the seven capabilities in this register |
| Evidence requirements | **Recorded, not created** |
| Capability classification | **Unchanged** â€” 14 Ã— class A, 7 A1 / 7 A2 |
| D3 / D4 records | **Unaffected** |
| P7 | **Unaffected** â€” still no artifact, still not claimed as PASS |
| Release / version state | **Unaffected** â€” 1 annotated tag, unchanged |

## 7. CLASSIFICATION

# **D5-S3 â€” OPTION B RECORDED**

A2 is a **transitional** evidence-maturity state. Seven capabilities are recorded as
evidence-debt requiring eventual A1 closure, in two tiers. No artifact created, no
capability status changed, no deadline or threshold invented, and the 7/7 classification is
not recalculated. **D5-S1 remains explicitly undefined.**
