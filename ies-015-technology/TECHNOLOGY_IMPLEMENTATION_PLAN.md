# IES-015 — Technology Implementation Plan

**Standard:** IES-015 — Technology Sector Engine
**Milestone:** IES-015.2 (gated work packages)
**Status:** PLAN — execution roadmap (not code)
**Date:** 2026-08-09
**Baseline:** IES-005 + IES-005.1 (contracts) + nine released engines v1.0 + **IES-015 v1.0 (frozen, tag `ies-015-v1.0.0`, D15 v1.3)** + CSIP (ontology registration, zero change)
**Reuse:** `iips-platform` runtime/framework (validated by ten sectors incl. CSIP — no platform change)

---

## 0. Guiding rules

- Two-repository separation.
- Frozen spec is the target; deviations are implementation bugs.
- Reuse, don't rebuild. Determinism. Staged & gated. DoD per WP.
- Produce `TECHNOLOGY_IMPLEMENTATION_REUSE_REPORT.md` at completion.
- **Frozen assets are immutable; implementation conforms to them.** Disagreement with golden outputs = implementation defect.

---

## WP-1 — Platform Reuse Verification (evidence gathering)

**Objective:** Confirm `sector.technology` registers/executes via existing runtime with **zero platform changes**.

| Task | Notes |
|---|---|
| 1.1 Verify `SectorPlugin` + `PluginLoader` host the engine | Reuse unchanged |
| 1.2 Verify runtime/registry/snapshot/replay accept the engine | Reuse unchanged |
| 1.3 Confirm no platform/engine/CSIP modification | Contracts Review concluded No change |

**Deliverables:** Technology plugin skeleton registered/executed; reuse evidence.
**Acceptance:** engine hosts with zero platform changes; prior 10-plugin regression unchanged; `tsc --strict` clean.
**Risk:** Low (validated 10×).

---

## WP-2 — Framework Integration (verify reuse)

**Objective:** Wire engine through existing framework services — all reused.

| Task | Notes |
|---|---|
| 2.1 Manifest loading | `ManifestLoader` reuse |
| 2.2 Evidence pipeline | `EvidencePipeline` reuse |
| 2.3 Transport | generic DTO |
| 2.4 Diagnostics/Qualification/Activation | reuse |
| 2.5 Coexistence | 9 sectors + CSIP + Technology |

**Deliverables:** engine registered through all framework services; coexistence regression.
**Acceptance:** same services serve all eleven plugins without branching; `tsc --strict` clean; tests pass.
**Risk:** Low.

---

## WP-3 — Technology Engine (sector-specific)

**Objective:** Implement Technology logic using **frozen assets only**, reproducing the D15 v1.3 contract exactly.

| Task | Notes |
|---|---|
| 3.1 Metric evaluation | TM-001..TM-012 (frozen) |
| 3.2 Effective band-table resolution | `effectiveBandTable = calibrated ?? baseline` (boundaries + scores together); metric-specific cardinality (TM-009 = 3); conservativeBandTable() on conflict |
| 3.3 D15 v1.3 scoring | band→score→pillar→composite (boundary semantics, round-half-to-even at composite) |
| 3.4 Subsegment + archetype calibration | `technology-calibration-1.0.0` (subsegment weights + archetype risk multiplier; calibration staging) |
| 3.5 Hybrid / multi-subsegment resolution | `hybridDominant` / `subsegmentDominant` / most-conservative-risk (single profile, no branch) |
| 3.6 Decision pipeline + overrides + precedence | D10 + min-rank operator + missing-primitive/derived-component rule |
| 3.7 Evidence generation | technology evidence packages |
| 3.8 Ontology registration | 8-dimension metadata for CSIP (zero CSIP change) |

**Deliverables:** Technology Engine plugin (`sector.technology`) reproducing frozen outputs.
**Acceptance:** **Golden Dataset Reproducibility (13/13)**, **Replay Determinism**, **Calibration Isolation**, **Effective Band-Table Resolution**, **Metric Cardinality Integrity**, **Conservative Operator**, **Evidence Completeness**, **Override Precedence**, **Ontology Registration**, **Contract Boundary Matrix pass**. `tsc --strict` clean; tests pass.
**Risk:** Medium (frozen assets authoritative; D15 v1.3 contract must be reproduced exactly).

---

## WP-4 — Validation, Replay, Regression, Release

**Objective:** Prove implementation matches the frozen baseline + release.

| Task | Notes |
|---|---|
| 4.1 Golden dataset regression | vs `technology-expected-outputs-1.0.0` (13/13) |
| 4.2 Replay verification | identical composites/verdicts/pillars/overrides/evidence |
| 4.3 Fixture acceptance | 21 validation fixtures |
| 4.4 Traceability + reuse report | `TECHNOLOGY_ENGINE_ACCEPTANCE_MATRIX.md` + reuse report |
| 4.5 Release candidate + independent verification | mirror prior sectors |

**Deliverables:** regression report, replay report, fixture acceptance, traceability, reuse report, release candidate, final readiness report.
**Acceptance:** 100% match vs frozen outputs; replay byte-identical; all 21 fixtures; contract matrix pass; independent clean-clone reproduction; release candidate.
**Risk:** Low–Medium.

---

## Execution order & gating

```
WP-1 Reuse → (approve) → WP-2 Framework → (approve) → WP-3 Engine → (approve) → WP-4 Release → (approve) → Release
```

Each WP stops for approval. Nearly all new engineering effort is in WP-3.

## Reuse expectation

WP-1/WP-2 are evidence gathering + reuse verification; platform/framework/engine/CSIP modifications = **0** (recorded in reuse report).

## Out of scope

No new methodology, no edits to frozen assets, no engine/platform/CSIP changes, no performance optimization without approval.

## Status

**PLAN COMPLETE** — awaiting approval before WP-1 execution.
