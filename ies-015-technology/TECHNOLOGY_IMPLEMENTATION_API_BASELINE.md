# IES-015 — Technology Implementation API Baseline

**Standard:** IES-015 — Technology Sector Engine
**Purpose:** Freezes the implementation interfaces that WP-3 (Technology Engine) must consume — preventing interface drift during implementation.
**Date:** 2026-08-09

---

## 1. Frozen interfaces (WP-3 consumption surface)

| Interface | Module |
|---|---|
| `SectorPlugin` (contract) | `plugin-loader/PluginContract.ts` |
| `PluginLoader` | `plugin-loader/PluginLoader.ts` |
| `RuntimeCoordinator` | `runtime/RuntimeCoordinator.ts` |
| `Container` (DI) | `di/Container.ts` |
| `SnapshotService` / `SnapshotStore` | `snapshot/` |
| `ReplayService` | `replay/ReplayService.ts` |
| `EvidencePipeline` | `framework/evidence/EvidencePipeline.ts` |
| `ManifestLoader` | `framework/manifest/ManifestLoader.ts` |
| `Transport` | `framework/transport/Transport.ts` |
| `DiagnosticsService` | `framework/diagnostics/` |
| `QualificationService` | `framework/qualification/` |
| `ActivationService` | `framework/activation/` |
| `Clock` / `IdProvider` / `deepFreeze` | `infrastructure/` |

## 2. Ontology registration metadata

Technology registers its 8-dimension ontology metadata (from `technology-ontology-metadata-1.0.0.json`) so CSIP can consume it with **zero CSIP change**:

```text
Technology Engine → {
  composite → Conviction
  confidence → Confidence
  qualityScore → Quality
  growthScore → Growth
  riskScore → Risk
  profitabilityScore → Profitability
  capitalEfficiency → Capital Efficiency
  valuationScore → Valuation
  calibrationVersion, methodologyVersion, replayMetadata
}
```

## 3. WP-3 consumption rules

- Technology Engine **must** implement `SectorPlugin` and consume the interfaces above.
- **Must not** bypass or re-implement runtime/framework/transport/registry/snapshot/replay/evidence/qualification/activation.
- Must load frozen calibration from `technology-calibration-1.0.0`.
- Must implement the D15 v1.3 contract exactly:
  - lower-inclusive / upper-exclusive boundaries (terminal band includes upper bound);
  - **metric-specific immutable band cardinality** (TM-009 = 3 bands; band-count-mismatched calibrated table rejected → baseline + alert);
  - **effective band-table resolution** `effectiveBandTable = calibrated ?? baseline` (boundaries + scores together, never mixed);
  - **conservativeBandTable()** operator for conflicting complete tables (boundaries elementwise max/min; scores min in both directions);
  - hybrid (`hybridDominant`) / multi-subsegment (`subsegmentDominant` / most-conservative-risk) resolution;
  - round-half-to-even at composite only (no intermediate pillar rounding);
  - missing-primitive → 0 + renormalization; derived-component missing rule (D15 §5.2);
  - calibration staging (band thresholds pre-scoring; weights/risk post-pillar pre-composite);
  - **min_rank**(baseVerdict, all applicable caps) override operator (governance → disruption → churn-collapse → customer-loss → capex-overrun → margin-compression → leverage-breach, audit order only).
- No `Math.random`/`Date.now` in business logic.
- **Frozen layers must not be modified.** If WP-3 needs a change, stop and raise an architecture issue.
- **Frozen assets are immutable; implementation conforms to them.** Disagreement with golden outputs = implementation defect.

## 4. Frozen specification consumed

- IES-015 v1.0 (frozen, tag `ies-015-v1.0.0`), D15 v1.3
- `technology-calibration-1.0.0`, golden dataset (13), expected outputs (13), replay dataset, validation fixtures (21), ontology metadata

## 5. Change procedure

Any change is a versioned, review-gated event.
