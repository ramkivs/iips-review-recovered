# IES-014 — Industrials Implementation API Baseline

**Standard:** IES-014 — Industrials Sector Engine
**Purpose:** Freezes the implementation interfaces that WP-3 (Industrials Engine) must consume — preventing interface drift during implementation.
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

Industrials registers its 8-dimension ontology metadata (from `industrials-ontology-metadata-1.0.0.json`) so CSIP can consume it with **zero CSIP change**:

```text
Industrials Engine → {
  composite → Conviction
  confidence → Confidence
  qualityScore → Quality
  growthScore → Growth
  riskScore → Risk
  valuationScore → Valuation
  capitalEfficiency → Capital Efficiency
  franchiseScore → Moat
  calibrationVersion, methodologyVersion, replayMetadata
}
```

## 3. WP-3 consumption rules

- Industrials Engine **must** implement `SectorPlugin` and consume the interfaces above.
- **Must not** bypass or re-implement runtime/framework/transport/registry/snapshot/replay/evidence/qualification/activation.
- Must load frozen calibration from `industrials-calibration-1.0.0`.
- Must implement the D15 v1.2 contract exactly (band/verdict boundary semantics, round-half-to-even at composite, derived-component missing rule, calibration staging, min-rank overrides).
- No `Math.random`/`Date.now` in business logic.
- **Frozen layers must not be modified.** If WP-3 needs a change, stop and raise an architecture issue.
- **Frozen assets are immutable; implementation conforms to them.** Disagreement with golden outputs = implementation defect.

## 4. Frozen specification consumed

- IES-014 v1.0 (frozen, tag `ies-014-v1.0.0`), D15 v1.2
- `industrials-calibration-1.0.0`, golden dataset, expected outputs, replay dataset, validation fixtures, ontology metadata

## 5. Change procedure

Any change is a versioned, review-gated event.
