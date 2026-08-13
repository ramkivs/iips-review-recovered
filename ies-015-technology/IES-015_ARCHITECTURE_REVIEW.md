# IES-015 — Phase 4: Architecture Review

**Standard:** IES-015 — Technology Sector Engine
**Phase:** 4 — Architecture Review
**Version:** 1.0
**Date:** 2026-08-09
**Predecessor:** IES-015 Phase 3 — Reference Assets (Approved)
**Review artifacts added:**
- `TECHNOLOGY_CALIBRATION_INDEPENDENCE_MATRIX.md`

---

## 1. Scope

Review whether the frozen Technology methodology (D15 v1.3 normative contract) and reference assets integrate into the existing platform architecture **without sector-specific platform/framework/runtime/CSIP branching**, and confirm the D15 v1.3 contract-hardening properties are genuinely independently executable.

## 2. Review method

- Independently cross-checked expected outputs vs validation fixtures vs replay dataset (13/13 consistent).
- Verified expected outputs are **generated from the D15 v1.3 contract** (reference oracle `generate_expected_outputs.py`), not manually asserted.
- Re-ran the Technology contract boundary matrix (band cardinality, effective band-table operator, conservative operator, boundary epsilon, hybrid/multi-subsegment) — all pass.
- Confirmed byte-identical expected-output generation across runs (determinism).
- Applied the common Sector Architecture Review Checklist.
- Documented calibration independence (Calibration Independence Matrix).

## 3. Answers to the 11 review questions

**1 — Internal consistency (D15 ↔ calibration ↔ golden ↔ expected outputs):** PASS. Baseline bandScores match D15 §7 (TM-009 = 3-band); calibrated band tables match D09 §6 examples; golden inputs map to expected outputs exactly (13/13); fixtures cross-check 13/13.

**2 — D15 traceability:** PASS. Every golden result reproduces through the normative pipeline (Subsegment → Archetype → Calibration Profile → Effective Band-Table Resolution → Metric→Band→Score → Pillar → Effective Weights → Composite → min-rank Overrides → Verdict). No output is hand-asserted.

**3 — Calibration independence:** PASS. Common score engine; calibration selects subsegment weights + archetype risk multiplier + metric band tables only. Subsegment/archetype never branch scoring logic.

**4 — Band-table isolation:** PASS. A calibrated table is a single immutable `(lowerBound, upperBound, score)` object; boundaries and scores resolve together (never calibrated boundaries + baseline scores). Effective operator `calibrated ?? baseline`.

**5 — Metric-cardinality integrity:** PASS. Band cardinality metric-specific and immutable; **TM-009 = 3 bands**; band-count-mismatched calibrated table rejected → baseline applies + alert (fixture TEC-14; contract matrix).

**6 — Hybrid / multi-subsegment isolation:** PASS. Hybrid (`hybridDominant`), multi-subsegment (`subsegmentDominant`), and no-dominant (most conservative risk profile) select a **single** calibration profile — no scoring-engine branch. Conflicting tables resolved by `conservativeBandTable()` at resolution time only.

**7 — Conservative band operator:** PASS. `conservativeBandTable()` deterministic; boundaries elementwise (max higher-better / min lower-better); scores elementwise **min in both directions** (composite-lowering); monotonicity + boundary semantics preserved. Higher- and lower-better fixtures validate.

**8 — Override determinism:** PASS. `finalVerdict = min_rank(baseVerdict, all applicable caps)`; evaluation order audit-only. Simultaneous override case (TE-006: leverage-breach + margin-compression → Watch) and governance case (TE-013 → Avoid) reproduce deterministically.

**9 — Ontology completeness:** PASS. All **8/8** ontology dimensions covered (Conviction, Confidence, Quality, Growth, Risk, Profitability, Capital Efficiency, Valuation); 9 subsegments + 9 archetypes registered; **zero CSIP modification** (ontology registration is the integration boundary, per CSIP Service Dependency Matrix).

**10 — Replay completeness:** PASS. Replay dataset binds the **resolved calibration version** (D15 §6a.4); identical inputs + calibration version → byte-identical composite, verdict, pillars, overrides, evidence (13/13 providers; byte-identical run verified).

**11 — Implementation readiness:** PASS. D15 v1.3 + golden/reference assets are the **immutable test oracle**; any implementation disagreement is treated as an implementation defect, not reference-asset modification.

## 4. Verification evidence

| Check | Result |
|---|---|
| Expected outputs vs fixtures vs replay cross-check (13/13) | ✅ PASS |
| Expected outputs generated from D15 v1.3 (not hand-asserted) | ✅ PASS |
| Calibration independence (common score engine) | ✅ PASS |
| Band-table isolation (boundaries + scores together) | ✅ PASS |
| Metric-cardinality integrity (TM-009 = 3 bands; band-count rejection) | ✅ PASS |
| Hybrid / multi-subsegment isolation (single profile, no branch) | ✅ PASS |
| Conservative band operator deterministic + composite-lowering | ✅ PASS |
| Override precedence deterministic (min-rank) | ✅ PASS |
| Ontology registration (8/8 dimensions, zero CSIP change) | ✅ PASS |
| Replay byte-identical + calibration version binding | ✅ PASS |
| Contract boundary matrix (all checks pass) | ✅ PASS |
| Zero platform/engine/CSIP modification | ✅ PASS |

## 5. Review verdict

**CONDITIONAL APPROVE — PROCEED TO FREEZE.**

All 11 review questions pass. Defined obligations for Freeze:
1. Materialize Technology ontology metadata JSON (`technology-ontology-metadata-1.0.0.json`) at Freeze.
2. Lock the subsegment/archetype calibration profile as frozen `technology-calibration-1.0.0`.
3. Freeze the reference assets (calibration, golden, expected outputs, replay, fixtures) and compute SHA-256 hashes into the freeze manifest.
4. Close any implementation-time fixture details (none blocking).

Reference assets are the **test oracle**; any implementation disagreement is an implementation defect, not reference-asset modification.

Recommended next stage: **IES-015 Freeze** — freeze spec + reference assets, add review artifacts, tag (`ies-015-v1.0.0`), produce freeze manifest / compatibility statement / regression baseline / readiness certificate / release notes.

## 6. Status

**ARCHITECTURE REVIEW COMPLETE (CONDITIONAL APPROVE).** Awaiting approval before Freeze.
