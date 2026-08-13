# IES-014 — Industrials Sector Engine

## Document 13 — ARENA IMPLEMENTATION SPECIFICATION

**Document ID:** IES-014-D13
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Specifies the Industrials Engine implementation as a `SectorPlugin` reusing the IES-005 platform, consistent with Banking/Insurance/Capital Markets/Healthcare/Hospitality/Energy/Utilities/Consumer.

# 1. Plugin identity

```text
engineId: 'sector.industrials'
sectorFamily: 'Industrials'
engineVersion: '1.0.0'
```

# 2. Module layout

```text
iips-platform/src/sector-engines/industrials/
  metrics/IndustrialsMetrics.ts
  scoring/IndustrialsScoreEngine.ts
  calibration/IndustrialsCalibration.ts
  decision/IndustrialsDecision.ts
  evidence/IndustrialsEvidence.ts
  IndustrialsEngine.ts
```

# 3. Platform reuse

- `SectorPlugin` + `PluginLoader` — host.
- `EvidencePipeline`, `SnapshotService`, `ReplayService`, `Transport` — reused.
- `RuntimeCoordinator` — orchestration.

# 4. Ontology registration

Industrials registers its 8-dimension ontology metadata so CSIP can consume it with **no CSIP logic change**.

# 5. Zero-modification

No changes to platform runtime/framework/contracts or the eight released sector engines.

# Status

**IES-014-D13 · Version 1.0 · Status SPECIFICATION**
