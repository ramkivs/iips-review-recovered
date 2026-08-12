# IES-011 — Energy Implementation Plan

**Standard:** IES-011 — Energy Sector Engine
**Milestone:** IES-011.2 (gated work packages)
**Status:** PLAN — execution roadmap (not code)
**Date:** 2026-08-08
**Baseline:** IES-005 + IES-005.1 (contracts) + five released engines v1.0 + **IES-011 v1.0 (frozen, tag `ies-011-v1.0.0`)** + CSIP (ontology registration, zero change)
**Reuse:** `iips-platform` runtime/framework (validated by six sectors incl. CSIP — no platform change)

---

## 0. Guiding rules

- Two-repository separation.
- Frozen spec is the target; deviations are implementation bugs.
- Reuse, don't rebuild. Determinism. Staged & gated. DoD per WP.
- Produce `ENERGY_IMPLEMENTATION_REUSE_REPORT.md` at completion.
- Reference the Energy Implementation Risk Register + Readiness Dashboard.

---

## WP-1 — Platform Reuse Verification (evidence gathering)

**Objective:** Confirm `sector.energy` registers/executes via existing runtime with **zero platform changes**.

| Task | Notes |
|---|---|
| 1.1 Verify `SectorPlugin` + `PluginLoader` host the engine | Reuse unchanged |
| 1.2 Verify runtime/registry/snapshot/replay accept the engine | Reuse unchanged |
| 1.3 Confirm no platform/engine/CSIP modification | Contracts Review concluded No change |

**Deliverables:** Energy plugin skeleton registered/executed; reuse evidence.
**Acceptance:** engine hosts with zero platform changes; prior 6-plugin regression unchanged; `tsc --strict` clean.
**Risk:** Low (validated 6×).

---

## WP-2 — Framework Integration (verify reuse)

**Objective:** Wire engine through existing framework services — all reused.

| Task | Notes |
|---|---|
| 2.1 Manifest loading | `ManifestLoader` reuse |
| 2.2 Evidence pipeline | `EvidencePipeline` reuse |
| 2.3 Transport | generic DTO |
| 2.4 Diagnostics/Qualification/Activation | reuse |
| 2.5 Coexistence | 4 sectors + CSIP + Hospitality + Energy |

**Deliverables:** engine registered through all framework services; coexistence regression.
**Acceptance:** same services serve all seven plugins without branching; `tsc --strict` clean; tests pass.
**Risk:** Low.

---

## WP-3 — Energy Engine (sector-specific)

**Objective:** Implement Energy logic using **frozen assets only**.

| Task | Notes |
|---|---|
| 3.1 Metric evaluation | EM-001..EM-012 (frozen) |
| 3.2 Score calculation | band→score→pillar→composite (D15) |
| 3.3 Segment + commodity calibration | `energy-calibration-1.0.0` |
| 3.4 Decision pipeline + overrides + precedence | D10 + Override Precedence |
| 3.5 Evidence generation | energy evidence packages |
| 3.6 Ontology registration | 8-dimension metadata for CSIP (zero CSIP change) |

**Deliverables:** Energy Engine plugin (`sector.energy`) reproducing frozen outputs.
**Acceptance:** **Golden Dataset Reproducibility (9/9)**, **Replay Determinism**, **Calibration Isolation**, **Evidence Completeness**, **Override Precedence**, **Ontology Registration**. `tsc --strict` clean; tests pass.
**Risk:** Medium (frozen assets authoritative; per Risk Register).

---

## WP-4 — Validation, Replay, Regression, Release

**Objective:** Prove implementation matches the frozen baseline + release.

| Task | Notes |
|---|---|
| 4.1 Golden dataset regression | vs `energy-expected-outputs-1.0.0` (9/9) |
| 4.2 Replay verification | identical composites/verdicts/pillars/overrides/evidence |
| 4.3 Fixture acceptance | 9 validation fixtures |
| 4.4 Traceability + reuse report | `ENERGY_ENGINE_ACCEPTANCE_MATRIX.md` + reuse report |
| 4.5 Release candidate + independent verification | mirror prior sectors |

**Deliverables:** regression report, replay report, fixture acceptance, traceability, reuse report, release candidate, final readiness report.
**Acceptance:** 100% match vs frozen outputs; replay byte-identical; all 9 fixtures; independent clean-clone reproduction; release candidate.
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
