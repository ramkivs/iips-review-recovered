# DEC-D5-S1-REGRESSION-EVIDENCE â€” D5-S1 Regression-Evidence Standard

- **Record ID:** `DEC-D5-S1-REGRESSION-EVIDENCE`
- **Title:** D5-S1 â€” A1 "Required Regression Evidence" Defined as an Objective Kind-Set (No Numeric Threshold)
- **Class:** `DECISION` / `METHODOLOGY AUTHORITY`
- **Status:** `RECORDED â€” D5-S1 = OPTION D (KIND-SET)`
- **Date:** 2026-08-28
- **Authority relationship:** gate `PROGRAM v3.0 / IES CAPABILITY RE-BASELINE â€” D5-S1
  REGRESSION-EVIDENCE THRESHOLD AUTHORITY GATE`. Options A / B / C / D were presented
  **without recommendation**, each analysed against the required criteria, with the explicit
  finding that **the durable evidence does not support any numeric threshold**. The
  maintainer explicitly selected **D**. Recording authority was granted separately and
  explicitly, scoped to `governance/iips/` on `arena` only.
- **Scope:** the meaning of A1's fourth limb only. **No numeric threshold is authorized.**
  No capability status changes. No A2â†’A1 closure is performed. No evidence artifact is
  created.

**Provenance:** pre-existing governance record; provenance reconstructed from the authoritative governance record and execution lineage available at the time of D33-C1 amendment. This metadata amendment records provenance only and does not alter the record's substantive decision, authorization, scope, or evidentiary determination.

---

## 1. DECISION â€” OPTION D, FORMULATED AS AN OBJECTIVE KIND-SET

A1's fourth limb, *"required regression evidence"*, is defined as the presence of the
following **four kinds** of regression test file for the capability, under
`iips-platform/tests/regression/`:

| # | Required kind | Filename form |
|---|---|---|
| 1 | **acceptance** | `<engine>-acceptance.test.ts` |
| 2 | **framework-integration** | `<engine>-framework-integration.test.ts` |
| 3 | **reuse-verification** | `<engine>-reuse-verification.test.ts` |
| 4 | **wp4-validation** | `<engine>-wp4-validation.test.ts` |

**A capability satisfies the regression limb if and only if all four kinds are present.**

### 1.1 This standard is objective and reproducible

It is evaluated by **listing files** â€” no judgement, no interpretation, no threshold. Any
reviewer running the same listing obtains the same result. It is **not** vague wording
standing in for an absent number: each of the four kinds is a named, checkable artifact.

### 1.2 No numeric threshold is authorized, and none may be inferred

- **No numeric regression threshold is authorized by this record or by any prior record.**
- **No threshold may be inferred from test-file counts.** The observed counts (1, 2, 3, 4)
  are the *output* of past practice, not a requirement. Selecting a number that matches the
  A1 group and then using it to govern that group would reverse-engineer a threshold from
  the data it evaluates â€” the inference D5-S1 prohibited, and it is **not** made here.
- **A count of four test files is NOT equivalent to satisfying this standard.** A capability
  with four test files of the wrong kinds would fail; a capability with the four required
  kinds satisfies it regardless of any additional test files. Helper modules
  (e.g. `banking-helpers.ts`) are **not** test files and do not count toward any kind.

## 2. EVIDENCE BASIS

Established at the D5-S1 discovery gate against `origin/phase13-next`
`357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`:

| Capability | Tier | Kinds present | Missing kind(s) | Test files |
|---|---|---|---|---|
| IES-010 hospitality | **A1** | all four | â€” | 4 |
| IES-011 energy | **A1** | all four | â€” | 4 |
| IES-012 utilities | **A1** | all four | â€” | 4 |
| IES-013 consumer | **A1** | all four | â€” | 4 |
| IES-014 industrials | **A1** | all four | â€” | 4 |
| IES-015 technology | **A1** | all four | â€” | 4 |
| CSIP cross-sector | **A1** | all four | â€” | 4 |
| IES-007 insurance | A2 | acceptance, framework-integration, reuse-verification | **wp4-validation** | 3 |
| IES-008 capital-markets | A2 | acceptance, framework-integration, reuse-verification | **wp4-validation** | 3 |
| IES-009 healthcare | A2 | acceptance, framework-integration, reuse-verification | **wp4-validation** | 3 |
| IES-006.2A banking | A2 | acceptance | **framework-integration, reuse-verification, wp4-validation** | 1 |
| IES-016 telecommunications | A2 | acceptance, wp4-validation | **framework-integration, reuse-verification** | 2 |
| IES-017 automobile | A2 | acceptance, wp4-validation | **framework-integration, reuse-verification** | 2 |
| IES-020 materials-metals | A2 | acceptance, wp4-validation | **framework-integration, reuse-verification** | 2 |

**The kind-set reproduces the recorded 7 / 7 A1/A2 split exactly**: all seven A1 capabilities
satisfy all four kinds, and every A2 capability lacks at least one. The classification in
`DEC-D5-EVIDENCE-MATURITY` and in the Integration Verification Matrix is therefore
**unchanged** by this decision.

### 2.1 Why Option A was not selected â€” recorded for completeness

No authority record defines a regression count anywhere in the repository; an exhaustive
search for a required count returns only the matrix's own statement that the threshold is
unquantified. A WP-4 coverage definition (`ies-011-energy/ENERGY_VERIFICATION_COVERAGE_MATRIX.md`,
8 criteria WP4-ACC1â€¦8) exists for **IES-011 only â€” 1 of 14**, so there is no program-wide
authoritative coverage definition from which a number could be derived. **Any number would
have been manufactured.**

## 3. THIS IS A METHODOLOGY CHANGE â€” RECORDED AS SUCH

This record **changes** the operative meaning of A1's fourth limb, from an undefined phrase
to a defined kind-set. It is recorded as a **methodology change made under explicit
authority**, **not** as a clarification of something already defined. `DEC-D5-EVIDENCE-MATURITY`
is **not amended** by this record; where the two are read together, **this record governs the
regression limb**.

## 4. EFFECT ON THE RECORDED CLASSIFICATION

| Item | Effect |
|---|---|
| The recorded **7 A1 / 7 A2** split | **UNCHANGED** â€” the kind-set reproduces it exactly (Â§2) |
| **Class A capability status** | **UNCHANGED** â€” all 14 remain Class A. A1/A2 remains evidence maturity only; A2 is **not** capability failure, de-certification, or evidence-blocked |
| The Integration Verification Matrix | **Not modified by this record.** Its `Evidence` column and Â§3.1 wording remain valid; the D5-S1 sentence stating the threshold is unquantified is now **superseded in meaning** by this record, and any future matrix amendment should cross-reference this record. **No amendment is made here** |
| **D5-S3 = B** (evidence-debt requiring eventual A1 closure) | **Now operable.** Closure can be evaluated objectively, per capability, against the four-kind set and the three non-regression limbs |

## 5. CLOSURE WORKLIST â€” derived, not scheduled

Under D5-S3 = B, A1 closure for each A2 capability requires the artifacts it lacks. Recorded
as a worklist; **nothing is scheduled, prioritized or authorized here**, and **no artifact is
created by this record**.

| Capability | Missing regression kind(s) | Missing non-regression artifact(s) |
|---|---|---|
| IES-007 insurance | wp4-validation | final readiness, freeze manifest |
| IES-008 capital-markets | wp4-validation | final readiness, freeze manifest |
| IES-009 healthcare | wp4-validation | final readiness, freeze manifest |
| IES-006.2A banking | framework-integration, reuse-verification, wp4-validation | final readiness, freeze manifest |
| IES-016 telecommunications | framework-integration, reuse-verification | independent verification, final readiness, freeze manifest |
| IES-017 automobile | framework-integration, reuse-verification | independent verification, final readiness, freeze manifest |
| IES-020 materials-metals | framework-integration, reuse-verification | independent verification, final readiness, freeze manifest |

(Independent verification is already held by IES-006.2A, 007, 008 and 009 via
`iips-platform/reports*/`.)

## 6. WHAT THIS RECORD DOES NOT DO

| Item | Status |
|---|---|
| Authorize a numeric regression threshold | **NOT DONE** â€” explicitly refused |
| Infer a threshold from observed test counts | **NOT DONE** |
| Modify the Integration Verification Matrix | **NOT DONE** |
| Modify `DEC-D5-EVIDENCE-MATURITY` or any historical record | **NOT DONE** |
| Change any capability's Class or A1/A2 designation | **NOT DONE** |
| Perform A2â†’A1 closure | **NOT DONE** |
| Create any evidence artifact (test, verification report, readiness certificate, freeze manifest) | **NOT DONE** |
| Modify `phase13-next`, `gai-impl-canonical`, `program-v3-matrix-rebaseline`, `main` | **NOT DONE** |
| Modify engines or implementation | **NOT DONE** |
| Perform H/I/J validation | **NOT DONE** â€” remain Option-D limitations |
| Reopen P7 or claim it as PASS | **NOT DONE** |
| Alter certification | **NOT DONE** |
| Promote any version/release/tag | **NOT DONE** |
| Merge or rebase any branch | **NOT DONE** |
| Resolve the dangling matrix citations | **NOT DONE** |
| Amend `AUTH-G-AI-IMPL` or `SPEC-G-AI-IMPL` | **NOT DONE** |
| Restore pruned `ies-005â€¦009` packs | **NOT DONE** |

## 7. NEXT GATE IDENTIFIED

Per the recording grant, the single gate that follows is named here. **It is not executed by
this record and requires its own authority.**

# Next: **A2 â†’ A1 EVIDENCE-DEBT CLOSURE AUTHORITY GATE**

**Why this one.** D5-S3 = B recorded the seven A2 capabilities as evidence-debt requiring
eventual A1 closure, and that closure was **blocked** solely because A1's regression limb was
undefined. D5-S1 now removes that blocker, so closure becomes objectively evaluable. No other
open item blocks a downstream decision.

**What it must decide.** For each capability in the Â§5 worklist, whether to authorize
creation of the missing artifacts, in what order, and whether **Tier 2** (IES-006.2A, 007,
008, 009 â€” predate the convention, already hold independent verification) and **Tier 3**
(IES-016, 017, 020 â€” postdate it, hold none of the three non-regression artifacts) are
treated alike or differently.

**Authority needed.** **Evidence-artifact creation authority** â€” new regression test files of
the missing kinds, independent-verification reports, final-readiness certificates and freeze
manifests â€” plus authority to update the A1/A2 designations in the Integration Verification
Matrix as each capability closes. That is a **matrix-amendment** authority, separate from
this record. **None of it is granted here.**

**Explicitly not pre-decided.** This record neither schedules closure, nor prioritizes
capabilities, nor treats Tier 2 and Tier 3 alike or differently, nor authorizes any artifact.

**Sequenced after it**, each requiring its own authority: **`program-v3-matrix-rebaseline`
disposition** (its content is already on `phase13-next` via `33dc1a7dâ€¦`) Â· **dangling-citation
annotation** (per `DEC-D6-DURABLE-RECORDING-POLICY` Â§3) Â· **`AUTH-G-AI-IMPL` Â§4 annotation**
(still names three referent-less artifacts per `DEC-D2-DANGLING-VOCABULARY`) Â· **H/I/J
closure** (infrastructure, not authority; not self-clearing) Â· **P7 referent** (identify, or
record permanently that it has no referent; never claimed as PASS).

## 8. CLASSIFICATION

# **D5-S1 â€” OPTION D RECORDED (KIND-SET)**

A1's regression limb is defined as the four-kind set
{acceptance, framework-integration, reuse-verification, wp4-validation}, objectively
checkable by listing files. **No numeric threshold is authorized and none may be inferred.**
The recorded 7 / 7 A1/A2 split and all 14 Class A statuses are unchanged. D5-S3 = B closure
is now operable.
