# IES-013 — Consumer Sector Engine

## Document 13 — ARENA IMPLEMENTATION SPECIFICATION

**Document ID:** IES-013-D13
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Specifies the Consumer Engine implementation as a `SectorPlugin` reusing the IES-005 platform, consistent with Banking/Insurance/Capital Markets/Healthcare/Hospitality/Energy/Utilities.

# 1. Plugin identity

```text
engineId: 'sector.consumer'
sectorFamily: 'Consumer'
engineVersion: '1.0.0'
```

# 2. Module layout

```text
iips-platform/src/sector-engines/consumer/
  metrics/ConsumerMetrics.ts
  scoring/ConsumerScoreEngine.ts
  calibration/ConsumerCalibration.ts
  decision/ConsumerDecision.ts
  evidence/ConsumerEvidence.ts
  ConsumerEngine.ts
```

# 3. Platform reuse

- `SectorPlugin` + `PluginLoader` — host.
- `EvidencePipeline`, `SnapshotService`, `ReplayService`, `Transport` — reused.
- `RuntimeCoordinator` — orchestration.

# 4. Ontology registration

Consumer registers its 8-dimension ontology metadata so CSIP can consume it with **no CSIP logic change**.

# 5. Zero-modification

No changes to platform runtime/framework/contracts or the seven released sector engines.

# Status

**IES-013-D13 · Version 1.0 · Status SPECIFICATION**
