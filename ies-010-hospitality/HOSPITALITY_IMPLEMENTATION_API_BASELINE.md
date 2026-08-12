# IES-010 — Hospitality Implementation API Baseline

**Standard:** IES-010 — Hospitality Sector Engine
**Purpose:** Freezes the implementation interfaces that WP-3 (Hospitality Engine) must consume — preventing interface drift during implementation.
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

Hospitality registers its 8-dimension ontology metadata (engine-declared) so CSIP can consume it with **zero CSIP change**:

```text
Hospitality Engine → {
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

- Hospitality Engine **must** implement `SectorPlugin` and consume the interfaces above.
- **Must not** bypass or re-implement runtime/framework/transport/registry/snapshot/replay/evidence/qualification/activation.
- Must load frozen calibration from `hospitality-calibration-1.0.0`.
- No `Math.random`/`Date.now` in business logic.
- **Frozen layers must not be modified.** If WP-3 needs a change, stop and raise an architecture issue.

## 4. Frozen specification consumed

- IES-010 v1.0 (frozen, tag `ies-010-v1.0.0`)
- `hospitality-calibration-1.0.0`, golden dataset, expected outputs, replay dataset, validation fixtures, D15 appendix

## 5. Change procedure

Any change is a versioned, review-gated event.
