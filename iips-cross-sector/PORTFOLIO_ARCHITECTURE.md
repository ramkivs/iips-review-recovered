# IIPS — Cross-Sector Intelligence Platform: Portfolio Architecture

**Program:** v1.1 Track 5 — CSIP
**Version:** 1.0-draft
**Status:** ARCHITECTURE (design — precedes reference assets)
**Date:** 2026-08-06
**Predecessors:** Universal Investment Ontology · Cross-Sector Intelligence Standard

---

## 1. Package structure

```text
iips-cross-sector/
  portfolio/          Portfolio Intelligence Service
  ranking/            Cross-Sector Ranking Engine
  allocation/         Capital Allocation Engine
  diversification/    Diversification Analyzer
  opportunity/        Opportunity Engine
  correlation/        Correlation Engine
  reporting/          Reporting Engine
```

No changes inside `banking/`, `insurance/`, `capital-markets/`, `healthcare/`.

## 2. Component architecture

```text
EngineOutputs (SectorPlugin outputs, via ontology mapping)
      │
      ▼
CrossSectorPlugin (platform plugin)
  ├── portfolio/      → Portfolio Intelligence Report
  ├── ranking/        → Ranked opportunities
  ├── allocation/     → Allocation Recommendation (per strategy)
  ├── diversification → Diversification Score
  ├── opportunity/    → Top-N opportunities + rationale
  ├── correlation/    → Correlation/sensitivity report
  └── reporting/      → PDF-ready JSON reports
```

## 3. Data flow

```text
Engines publish outputs (black box)
  → ontology mapping (normalized dimensions)
  → CSIP services consume normalized dimensions
  → portfolio intelligence produced
```

## 4. Determinism & replay

- All CSIP services are pure functions of the normalized engine outputs.
- Identical engine outputs → identical allocation/ranking/reports (replay-identical).
- Deterministic IdProvider/Clock where IDs/timestamps required.

## 5. Plugin model

- CSIP is a **platform plugin** that consumes `SectorPlugin Outputs` and produces `Portfolio Intelligence`.
- No engine depends on CSIP; CSIP depends on engines.

## 6. Extensibility

- New sector registers its ontology metadata → immediately participates in ranking + portfolio intelligence, no CSIP change.

## 7. Status

**ARCHITECTURE COMPLETE** — awaiting approval before Reference Assets.
