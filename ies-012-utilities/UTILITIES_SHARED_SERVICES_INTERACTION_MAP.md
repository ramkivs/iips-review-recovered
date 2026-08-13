# IES-012 — Utilities Shared Services Interaction Map

**Standard:** IES-012 — Utilities Sector Engine
**Phase:** WP-2
**Version:** 1.0
**Date:** 2026-08-08
**Status:** IMPLEMENTATION ARTIFACT — emphasizes interaction flow (unlike the capability-mapping Framework Service Usage Matrix)

---

## 1. Interaction map

```text
Utilities Engine (sector.utilities)
  ├── ManifestLoader        → plugin manifest validation/loading
  ├── PluginLoader          → registration + lifecycle
  ├── RuntimeCoordinator    → execution orchestration
  ├── Snapshot Store        → execution state capture
  ├── Replay Engine         → replay reproduction
  ├── Evidence Pipeline     → evidence package building
  ├── Diagnostics           → execution diagnostics (observational)
  ├── Qualification         → production gate
  ├── Activation            → lifecycle (ACTIVE)
  ├── Transport             → DTO serialization
  └── Ontology Registration → 8-dimension metadata → CSIP
```

## 2. Interaction flow

- Utilities registers via `PluginLoader` + `ManifestLoader`.
- Executes via `RuntimeCoordinator`; records a `SnapshotStore` entry.
- Builds evidence via `EvidencePipeline`; replayable via `Replay`.
- Diagnostics observe; Qualification/Activation gate; Transport serializes.
- Ontology metadata published for CSIP (zero CSIP change).

## 3. Status

**IMPLEMENTATION ARTIFACT — COMPLETE.**
