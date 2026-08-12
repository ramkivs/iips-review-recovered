# IES-015 — Technology Sector Engine

## Document 13 — ARENA IMPLEMENTATION SPECIFICATION

**Document ID:** IES-015-D13
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Specifies the Technology Engine implementation as a `SectorPlugin` reusing the IES-005 platform, consistent with Banking/Insurance/Capital Markets/Healthcare/Hospitality/Energy/Utilities/Consumer/Industrials.

# 1. Plugin identity

```text
engineId: 'sector.technology'
sectorFamily: 'Technology'
engineVersion: '1.0.0'
```

# 2. Module layout

```text
iips-platform/src/sector-engines/technology/
  metrics/TechnologyMetrics.ts
  scoring/TechnologyScoreEngine.ts
  calibration/TechnologyCalibration.ts
  decision/TechnologyDecision.ts
  evidence/TechnologyEvidence.ts
  TechnologyEngine.ts
```

# 3. Platform reuse

- `SectorPlugin` + `PluginLoader` — host.
- `EvidencePipeline`, `SnapshotService`, `ReplayService`, `Transport` — reused.
- `RuntimeCoordinator` — orchestration.

# 4. Ontology registration

Technology registers its 8-dimension ontology metadata so CSIP can consume it with **no CSIP logic change**.

# 5. Zero-modification

No changes to platform runtime/framework/contracts or the nine released sector engines.

# Status

**IES-015-D13 · Version 1.0 · Status SPECIFICATION**
