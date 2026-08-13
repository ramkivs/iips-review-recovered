# IES-012 — Utilities Sector Engine

## Document 13 — ARENA IMPLEMENTATION SPECIFICATION

**Document ID:** IES-012-D13
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Specifies the Utilities Engine implementation as a `SectorPlugin` reusing the IES-005 platform, consistent with Banking/Insurance/Capital Markets/Healthcare/Hospitality/Energy.

# 1. Plugin identity

```text
engineId: 'sector.utilities'
sectorFamily: 'Utilities'
engineVersion: '1.0.0'
```

# 2. Module layout

```text
iips-platform/src/sector-engines/utilities/
  metrics/UtilitiesMetrics.ts
  scoring/UtilitiesScoreEngine.ts
  calibration/UtilitiesCalibration.ts
  decision/UtilitiesDecision.ts
  evidence/UtilitiesEvidence.ts
  UtilitiesEngine.ts
```

# 3. Platform reuse

- `SectorPlugin` + `PluginLoader` — host.
- `EvidencePipeline`, `SnapshotService`, `ReplayService`, `Transport` — reused.
- `RuntimeCoordinator` — orchestration.

# 4. Ontology registration

Utilities registers its 8-dimension ontology metadata so CSIP can consume it with **no CSIP logic change**.

# 5. Zero-modification

No changes to platform runtime/framework/contracts or the six released sector engines.

# Status

**IES-012-D13 · Version 1.0 · Status SPECIFICATION**
