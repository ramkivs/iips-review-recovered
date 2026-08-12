# IES-011 — Energy Sector Engine

## Document 13 — ARENA IMPLEMENTATION SPECIFICATION

**Document ID:** IES-011-D13
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Specifies the Energy Engine implementation as a `SectorPlugin` reusing the IES-005 platform, consistent with Banking/Insurance/Capital Markets/Healthcare/Hospitality.

# 1. Plugin identity

```text
engineId: 'sector.energy'
sectorFamily: 'Energy'
engineVersion: '1.0.0'
```

# 2. Module layout

```text
iips-platform/src/sector-engines/energy/
  metrics/EnergyMetrics.ts
  scoring/EnergyScoreEngine.ts
  calibration/EnergyCalibration.ts
  decision/EnergyDecision.ts
  evidence/EnergyEvidence.ts
  EnergyEngine.ts
```

# 3. Platform reuse

- `SectorPlugin` + `PluginLoader` — host.
- `EvidencePipeline`, `SnapshotService`, `ReplayService`, `Transport` — reused.
- `RuntimeCoordinator` — orchestration.

# 4. Ontology registration

Energy registers its 8-dimension ontology metadata so CSIP can consume it with **no CSIP logic change**.

# 5. Zero-modification

No changes to platform runtime/framework/contracts or the five released sector engines.

# Status

**IES-011-D13 · Version 1.0 · Status SPECIFICATION**
