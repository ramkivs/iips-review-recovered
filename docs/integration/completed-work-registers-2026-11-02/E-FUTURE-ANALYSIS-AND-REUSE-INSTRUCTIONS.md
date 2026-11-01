<!-- IRR-owned record. Additive dated consolidation. No historical record is edited or deleted. -->
# Register E — Future Analysis and Reuse Instructions (IRR)

**Record ID:** `IIPS-V3-COMPLETED-WORK-AND-AUTHORITY-REGISTERS-IRR-2026-11-02-01` · **Date:** `2026-11-02` · **Owning repository:** IRR
**Applies to:** any future review, audit, gap analysis, readiness assessment or handoff touching IIPS v3.0 in IRR or IPD.

## E.1 Mandatory consultation before four specific actions

Before you do any of the following, you **must** consult Registers A–D and the cited source record, and record which row you relied on:

| Before you… | Consult | And check |
|---|---|---|
| **Recommend a rerun / re-execution** | Register A, field *Re-execution required?* | 63 items are recorded; the large majority say **No** with a reason. If the row says No, do not propose a rerun. |
| **Report a gap or outstanding item** | Register D, then Register C | If it is not in Register D, it is not a genuine residual. Register C explains why the text you found looks open but is not. |
| **Reopen a decision** | Register B and the cited act | An effective authorization, waiver, deferral or scope correction is a rendered decision. Only the PA may revisit it, and only with contradictory evidence. |
| **Re-request deposited evidence** | Register A *Evidence* + Register C | S2-DEP-A, the P-2 amended one-artifact deposit, the S2 recovery release and the 51×17 bundle are already deposited and verified. |

## E.2 Hard prohibitions

1. **Do not request or perform another Direct P1 provisioning run.** It was already successfully executed by the user on Windows (`CW-P1-02`). The database exists and is protected. Never delete, move, truncate or reprovision it.
2. **Do not rerun S2.** It is executed and conditionally accepted at its exact pin (`CW-S2-01`). A second run would be a different S2, not evidence for this one.
3. **Do not re-establish P-2 or re-request its ten designation values.** Closed for in-scope criteria (`CW-P2-01`…`CW-P2-04`).
4. **Do not run P1-F, a P1-F retry, a claim/marker action, or a standalone Preflight** to resolve the historical consumption question (`CW-P1-06`, `RS-05`).
5. **Do not start S3, QE-1…QE-11, Gate 4 or Gate 5.** They are genuinely outstanding and separately gated; this register is not authority to begin them.
6. **Do not reconstruct the waived S04 original verification-output file**, and never relabel a transcript as that file (`WA-04`).
7. **Do not seek redundant PA approval** for routine in-scope documentation, correction, publication or verification already covered by `WA-01` / `WA-18`.
8. **Do not edit, delete, reorder or "tidy" historical records.** Add a dated overlay or an index pointer instead.

## E.3 Provenance discipline

- Keep **user-reported execution** (`COMPLETED — USER-REPORTED EXECUTION`) separate from **repository-verified** facts (`COMPLETED — REPOSITORY-VERIFIED`). Never merge them into a single "verified" claim.
- A green CI run, a merged PR, a unit test, an integration test against a synthetic peer, or a documentation-conformance test is **never** Windows UI E2E verification and never native-host qualification.
- Quote acceptance boundaries verbatim. `S2-ACC-A1` covers **five commands and their counts at one pin** — nothing else.
- Do not transfer an acceptance to a different commit or tree.

## E.4 Waiver discipline

- State **what is waived** and **what is not waived** every time you cite a waiver.
- `WA-07` (Direct P1 discontinuation) is scoped to *prerequisites for Direct P1 local provisioning*. It does **not** waive P1-F, Gate A′, Gate 4 or Gate 5.
- `PA-19` / `PA-20` waive governance, documentary and workflow blockers. They establish **no technical fact** and waive **no** qualification criterion.
- `WV-01`…`WV-05` leave the underlying factual statuses (`PARTIAL`, `BLOCKED`, `NOT RUN`) unchanged. Report both the status and the waiver.
- A waiver is never a PASS.

## E.5 False blockers that must not be reintroduced

| Do not report as open | Because |
|---|---|
| PF-15 not designated | `CW-PF-15` / `WA-14` — DESIGNATED and EFFECTIVE since 2026-10-26 |
| H-12 not adopted | `CW-OT-23` — R5 ADOPTED for its recorded baseline (PA-09 final pin is the *separate* open item) |
| S2 not accepted | `CW-S2-01`/`CW-S2-02` — conditionally accepted at the designated pin |
| S2-DEP-A blocked on operator transfer | `CW-S2-03` — deposited; transfer/read-back PA-waived |
| P-2 deposit 0-of-4 | `CW-P2-03` — contract amended to one artifact; deposited and merged |
| REG-06 deferred | `CW-OT-01` — admitted and implemented; the deferral is superseded |
| O-05 implementation missing | `CW-OT-03` — the O5-A code limb is satisfied; only admission is open |
| O-06 / O-07 / D-9 open | `CW-OT-19`/`CW-OT-20`/`CW-OT-05` — all CLOSED |
| P-11 / P-18 / P-19 / P-20 pending | `CW-OT-21` — all COMPLETE; the current pending register has 40 rows |
| P1-F state blocks Direct P1 | `WA-07` — expressly not a prerequisite |
| Direct P1 handoff schema discrepancy | `CW-P1-03` — corrected on IPD main by PR #119 |
| P-4 / P-6 / P-8 outstanding | `CW-P2-05` — closed by H-18 scope |
| Gate A not passed | `CW-OT-13` — recorded NOT REQUIRED (not passed, not waived) |
| Branch-only lineages are missing work | `CW-OT-30` — not main capability and not an open task |

## E.6 How to extend these registers

1. Re-census the tracker's next-free allocation and the identifier before use. Never reuse or reassign an identifier.
2. Add a **new dated section / new dated file**. Do not rewrite a prior register in place.
3. Every new row needs all 18 fields and an identifiable evidence citation.
4. If a later record contradicts a row, add a superseding row and a Register C pointer; keep the original.
5. Publish IRR-owned records in IRR and IPD-owned records in IPD, through PRs, with independent remote read-back.
6. Never claim publication or remote verification unless it actually happened.

## E.7 Relationship to the ongoing project-wide E2E audit

The project-wide application E2E audit runs independently and was not disturbed by this consolidation. Where its findings are already published they are cited here (notably the G14 reconciliation and the 51×17 reassessment). This register does **not** duplicate that audit's broader investigation, and the audit should consume these registers rather than re-deriving the statuses in them.

## E.8 Counts at publication

Register A: **63** · Register B: **22** · Register C: **28** · Register D: **22**.
