# IES-010 — Hospitality Sector Engine

## Document 13 — ARENA IMPLEMENTATION SPECIFICATION

**Document ID:** IES-010-D13
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Specifies the Hospitality Engine implementation as a `SectorPlugin` reusing the IES-005 platform, consistent with Banking/Insurance/Capital Markets/Healthcare.

# 1. Plugin identity

```text
engineId: 'sector.hospitality'
sectorFamily: 'Hospitality'
engineVersion: '1.0.0'
```

# 2. Module layout

```text
iips-platform/src/sector-engines/hospitality/
  metrics/HospitalityMetrics.ts
  scoring/HospitalityScoreEngine.ts
  calibration/HospitalityCalibration.ts
  decision/HospitalityDecision.ts
  evidence/HospitalityEvidence.ts
  HospitalityEngine.ts
```

# 3. Platform reuse

- `SectorPlugin` + `PluginLoader` — host.
- `EvidencePipeline`, `SnapshotService`, `ReplayService`, `Transport` — reused.
- `RuntimeCoordinator` — orchestration.

# 4. Ontology registration

Hospitality registers its 8-dimension ontology metadata (Conviction, Confidence, Quality, Growth, Risk, Valuation, Capital Efficiency, Moat) so CSIP can consume it with **no CSIP logic change**.

# 5. Zero-modification

No changes to platform runtime/framework/contracts or the four released sector engines.

# Status

**IES-010-D13 · Version 1.0 · Status SPECIFICATION**
