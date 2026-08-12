# IES-011 — Energy Implementation API Baseline

**Standard:** IES-011 — Energy Sector Engine
**Purpose:** Freezes the implementation interfaces that WP-3 (Energy Engine) must consume — preventing interface drift during implementation.
**Date:** 2026-08-08

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

Energy registers its 8-dimension ontology metadata (engine-declared) so CSIP can consume it with **zero CSIP change**:

```text
Energy Engine → {
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

- Energy Engine **must** implement `SectorPlugin` and consume the interfaces above.
- **Must not** bypass or re-implement runtime/framework/transport/registry/snapshot/replay/evidence/qualification/activation.
- Must load frozen calibration from `energy-calibration-1.0.0`.
- No `Math.random`/`Date.now` in business logic.
- **Frozen layers must not be modified.** If WP-3 needs a change, stop and raise an architecture issue.
- Per Implementation Assumption Register + Risk Register.

## 4. Frozen specification consumed

- IES-011 v1.0 (frozen, tag `ies-011-v1.0.0`)
- `energy-calibration-1.0.0`, golden dataset, expected outputs, replay dataset, validation fixtures, D15 appendix

## 5. Change procedure

Any change is a versioned, review-gated event.
