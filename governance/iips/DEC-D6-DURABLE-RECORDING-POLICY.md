# DEC-D6-DURABLE-RECORDING-POLICY â€” D6 Durable Recording Policy

- **Record ID:** `DEC-D6-DURABLE-RECORDING-POLICY`
- **Title:** D6 â€” Authoritative Durable Recording Location for the Program v3.0 / IES Capability Re-Baseline
- **Class:** `DECISION` / `POLICY`
- **Status:** `RECORDED â€” D6 = OPTION A`
- **Date:** 2026-08-28
- **Authority relationship:** gate `PROGRAM v3.0 / IES CAPABILITY RE-BASELINE â€” D6 DURABLE
  RECORDING POLICY AUTHORITY GATE`. Options A / B / C / D were presented **without
  recommendation**, with the evidence and consequences of each. The maintainer explicitly
  selected **A**. Recording authority was granted separately and explicitly, scoped to
  `governance/iips/` on `arena` only.
- **Scope:** recording policy only. No matrix, engine, implementation, certification,
  release/tag or P7 change. No migration, duplication or deletion of any existing record.

**Provenance:** pre-existing governance record; provenance reconstructed from the authoritative governance record and execution lineage available at the time of D33-C1 amendment. This metadata amendment records provenance only and does not alter the record's substantive decision, authorization, scope, or evidentiary determination.

---

## 1. DECISION â€” OPTION A

> **`governance/iips/` on `origin/arena/01a03e3b-iips-review-recovered` is the
> authoritative durable record for all future program-level authority and gate decisions of
> the Program v3.0 / IES capability re-baseline.**
>
> Reports written outside the repository are **convenience copies only** and are
> **explicitly non-authoritative**. Where an out-of-repo report and a `governance/iips/`
> record differ, **the `governance/iips/` record governs**.

### 1.1 Rules established

1. Every program-level authority decision, gate outcome and amendment is recorded as a
   `governance/iips/DEC-*.md` (or `AUTH-`/`SPEC-`/`GATE-` where the existing convention
   applies) and committed to `arena`.
2. A decision that is **not** recorded in `governance/iips/` is **not durable authority**,
   regardless of how thoroughly it was reasoned or reported elsewhere.
3. Out-of-repo reports may be produced for readability but carry **no authority** and are
   expected to be destroyed by sandbox re-provision.
4. **Governance records are not placed on implementation or product branches**
   (`gai-impl-canonical`, `program-v3-matrix-rebaseline`, `phase13-next`, `main`) unless a
   separate authority explicitly says so.
5. Product and program artifacts continue to live on the product line (`phase13-next`,
   `docs/v3.0/**`); `governance/iips/` holds authority, not product artifacts.

## 2. EVIDENCE RELIED ON

### 2.1 Out-of-repo reports do not survive â€” 13 of 13 destroyed

Every named out-of-repo gate report from earlier gates is now absent, destroyed by sandbox
re-provisions: `IIPS-G-AI-IMPL-WORKTREE-UNBLOCKING{,-EXECUTION}`,
`IIPS-G-AI-IMPL-VALIDATION-S1-STOP`, `IIPS-G-AI-IMPL-VALIDATION-COMMIT-RESULT`,
`IIPS-G-AI-IMPL-DISPATCH-COVERAGE-{RESULT,COMMIT-RESULT,PUSH-RESULT}`,
`IIPS-G-AI-IMPL-FINAL-CERTIFICATION`, `IIPS-G-AI-IMPL-CERTIFICATION-READINESS`,
`IIPS-G-AI-IMPL-CERTIFICATION-PRECONDITION-RESULT`, `E2E-013-DISCOVERY-RECORD`,
`PROGRAM-V3-IES-CAPABILITY-REBASELINE-DISCOVERY`, `PROGRAM-V3-IES-D3-DISCOVERY-RECORD` â€”
plus the `gate-wt-unblocking/` manifest directory and the earlier `IIPS-RECOVERY-*`,
`IIPS-G-AI-*` and `IIPS-G1-*` families. Only 5 out-of-repo files survived to this gate, all
written within the preceding few turns â€” i.e. their survival is luck, not policy.

### 2.2 `governance/iips/` on `origin/arena` has survived

26 records durable and verified at the time of this decision, with a consistent convention:
22 `DEC-`, 1 `AUTH-`, 1 `SPEC-`, 1 `GATE-`, 1 `README.md`.

### 2.3 The separation is clean

| Location | `governance/iips/` | Product/program artifacts |
|---|---|---|
| `origin/arena/â€¦` | **26 records** | recovery-lineage tree |
| `origin/phase13-next` | **0** | `governance/` (4 product-side files) + `docs/v3.0/**` incl. the matrix |
| `origin/gai-impl-canonical` | **0** | implementation |
| `origin/program-v3-matrix-rebaseline` | **0** | matrix amendment |

## 3. KNOWN ACCEPTED CONSEQUENCE â€” four dangling citations

This decision was taken **with full knowledge** of the following, which is recorded as an
**accepted, unresolved consequence**, not as a resolved item.

The matrix on `phase13-next` (`cada0451400409b0fe9ff0d62309b756c7b45e43`) cites four
governance records that **do not exist on `phase13-next`**:

| Citation | On `phase13-next`? |
|---|---|
| `governance/iips/DEC-D3-MATRIX-REBASELINE.md` | **NO â€” DANGLING** |
| `governance/iips/DEC-D5-EVIDENCE-MATURITY.md` | **NO â€” DANGLING** |
| `governance/iips/DEC-G-AI-IMPL-CERT-CRITERIA.md` | **NO â€” DANGLING** |
| `governance/iips/DEC-G-AI-IMPL-CERTIFICATION.md` | **NO â€” DANGLING** |

And because `merge-base(phase13-next, arena)` = **NONE (unrelated histories)**, these
citations **cannot be resolved by traversing history from `phase13-next`**. A reader of
`phase13-next` alone cannot reach the authority behind the matrix amendment or the AI
Advisory certification.

**Recorded interpretation, so no future gate has to guess:** these citations are
**cross-repository-lineage references**. They resolve against
`origin/arena/01a03e3b-iips-review-recovered`, path `governance/iips/<name>`. They are **not
broken references to be repaired by adding files to `phase13-next`** â€” that would violate
rule 1.1.4 above. Any future resolution must be an **annotation** (a cross-ref note stating
where the authority lives), not a duplication, and requires its own matrix-amendment
authority. **No annotation is made by this record.**

## 4. OPTIONS CONSIDERED AND NOT SELECTED

| Option | Consequence that led to non-selection |
|---|---|
| **B â€” product-branch recording** | Requires commits to `phase13-next`, which holds 0 `governance/iips/` records today; either migrates 26 records (relocating established authority) or duplicates them (two copies of the same authority); mixes gate records into product history; `arena` would cease to be the single store or become a stale copy |
| **C â€” dual record** | Two commits on two unrelated lineages per decision; divergence risk; "which copy is authoritative" would itself need defining; still requires `phase13-next` commits; highest ongoing cost |
| **D â€” defer** | The 13-of-13 out-of-repo destruction pattern and the four dangling citations would both persist, and every future gate would re-litigate where its record belongs |

No option was selected silently; all four were presented with evidence before selection.

## 5. WHAT THIS RECORD DOES NOT DO

| Item | Status |
|---|---|
| Migrate, duplicate or delete any existing record | **NOT DONE** â€” all 26 pre-existing records byte-identical |
| Modify `phase13-next`, `program-v3-matrix-rebaseline`, `gai-impl-canonical` or `main` | **NOT DONE** |
| Modify the Integration Verification Matrix | **NOT DONE** â€” still `cada04514004â€¦` |
| Modify `AUTH-G-AI-IMPL` or `SPEC-G-AI-IMPL` | **NOT DONE** |
| Annotate or repair the four dangling citations | **NOT DONE** â€” requires separate matrix-amendment authority |
| Modify engines or implementation | **NOT DONE** |
| Create evidence artifacts | **NOT DONE** |
| Define the D5-S1 regression threshold | **NOT DONE** â€” remains explicitly undefined |
| Change D5-S3 | **NOT DONE** â€” remains Option B |
| Reopen P7 or claim it as PASS | **NOT DONE** |
| Perform H/I/J live validation | **NOT DONE** â€” remain Option-D limitations |
| Promote a release/version/tag | **NOT DONE** |

## 6. NEXT GATE IDENTIFIED

Per the recording grant, the single gate that should follow is named here. **It is not
executed by this record and requires its own authority.**

# Next: **D5-S1 â€” REGRESSION-EVIDENCE THRESHOLD AUTHORITY GATE**

**Why this one first.** It is the only open item that **blocks another decision**. Under
D5-S3 = Option B, the seven A2 capabilities are recorded as evidence-debt requiring eventual
A1 closure â€” but A1's fourth limb, *"required regression evidence"*, is **explicitly
unquantified** (`DEC-D5-EVIDENCE-MATURITY`, sub-gap **D5-S1**), so **closure to A1 cannot
currently be evaluated against that limb**. Every other open item is independent and can be
sequenced afterwards.

**Decision required.** Either:
- **(a)** authorize a numeric regression-evidence threshold, on stated evidence; or
- **(b)** record that A1's regression limb is permanently evaluated on the **three
  non-regression artifacts alone** (independent verification, final readiness,
  freeze/provenance), and that regression depth is recorded but not gating.

**Authority needed.** Methodology authority only, recorded as a new
`governance/iips/DEC-D5-S1-*.md` on `arena`. **No** matrix, engine, implementation,
evidence-artifact, certification, release or P7 change. **No threshold may be inferred from
the observed 1/2/3/4 regression-test counts** â€” they are evidence, not a threshold.

**Explicitly not pre-decided here.** This record neither selects (a) nor (b), nor proposes a
number.

**Sequenced after it**, each requiring its own authority: **A2â†’A1 evidence-debt closure**
(needs D5-S1 for the regression limb; the three non-regression artifacts could close
independently) Â· **`program-v3-matrix-rebaseline` disposition** (its content is already on
`phase13-next` via `33dc1a7dâ€¦`) Â· **dangling-citation annotation** (per Â§3) Â·
**`AUTH-G-AI-IMPL` Â§4 annotation** (still names three referent-less artifacts per
`DEC-D2-DANGLING-VOCABULARY`) Â· **H/I/J closure** (infrastructure, not authority; not
self-clearing) Â· **P7 referent** (identify, or record permanently that it has no referent;
never claimed as PASS).

## 7. CLASSIFICATION

# **D6 â€” OPTION A RECORDED**

`governance/iips/` on `origin/arena/01a03e3b-iips-review-recovered` is the authoritative
durable program record. Out-of-repo reports are explicitly non-authoritative. The four
dangling matrix citations on `phase13-next` are recorded as a known accepted consequence
with their correct interpretation, not silently repaired.
