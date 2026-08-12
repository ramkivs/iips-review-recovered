# CSIP — Execution Pipeline

**Capability:** CSIP — Cross-Sector Intelligence Platform
**Program:** v1.1 Track 5
**Phase:** CSIP Phase 5 — Implementation Planning (per WP-2 approval recommendation)
**Artifact:** Execution Pipeline (implementation counterpart to the Service Dependency Matrix)
**Version:** 1.0-draft
**Date:** 2026-08-08
**Purpose:** Document the deterministic execution flow end-to-end, including inputs, outputs, deterministic guarantees, evidence produced, and replay boundary per stage. This simplifies WP-3 development and WP-4 verification.

---

## 1. Execution flow

```text
Published Engine Outputs
      ↓
Ontology Mapper
      ↓
Portfolio Intelligence
      ↓
Cross-Sector Ranking
      ↓
Capital Allocation
      ↓
Diversification Analysis
      ↓
Opportunity Detection
      ↓
Correlation Analysis
      ↓
Evidence Builder
      ↓
Reporting
```

## 2. Stage detail

| Stage | Inputs | Outputs | Deterministic guarantee | Evidence produced | Replay boundary |
|---|---|---|---|---|---|
| **Ontology Mapper** | Published engine outputs (composite, confidence, pillar scores) | Normalized dimensions: conviction, confidence, quality, growth, risk, valuation, capitalEfficiency, moat | Engine-declared metadata table; no computation | mapping table + per-engine mapping version | All normalized dimensions re-derived identically |
| **Portfolio Intelligence** | Normalized holdings (sector, conviction, quality, risk) | sector exposure, concentration, avg conviction/quality/risk | count/sector ÷ total × 100 (1 dp); mean (1 dp) | exposure, concentration, averages | sector exposure + aggregates byte-identical |
| **Cross-Sector Ranking** | Normalized holdings | ranked list (conviction desc, sector asc) | deterministic sort + tie-break | ranking rationale | ranked order identical |
| **Capital Allocation** | Ranked list + strategy + constraints | allocation weights / recommendations | Allocation Rule Precedence Table (total order) | allocation rationale + rules applied | allocation identical |
| **Diversification Analysis** | Portfolio exposure/concentration | diversificationScore = max(0, 100 − concentration + (n−1)·3) (1 dp) + factor flags | deterministic formula | diversification impact | score identical |
| **Opportunity Detection** | Ranking + diversification | Top-N opportunities + rationale | Top-N selection by normalized conviction | why-this-stock/sector | top-N identical |
| **Correlation Analysis** | Published engine outputs (platform metadata) | concentration / macro / interest-rate / regulatory / cyclicality flags | metadata-only; no price correlation | sensitivity flags | flags identical |
| **Evidence Builder** | All prior stage outputs | Evidence package (Cross-Sector Evidence Model hierarchy) | deterministic assembly | Recommendation → Sector Contribution → Portfolio Impact → Allocation Rationale → Diversification Impact | evidence identical |
| **Reporting** | All outputs + evidence | Executive/IC/Portfolio/Allocation/Sector reports — PDF-ready JSON | deterministic assembly | report payloads | reports byte-identical |

## 3. Replay boundary

The replay boundary is the **entire pipeline**: identical published engine outputs at the top produce byte-identical evidence + reports at the bottom. There is no stochastic step at any stage.

## 4. Dependency compliance

The flow is strictly acyclic and matches the Service Dependency Matrix (Ontology Mapper root → … → Reporting → Evidence). No stage feeds backward.

## 5. Status

**PLAN ARTIFACT — COMPLETE.** This is the implementation target for WP-3 and the verification basis for WP-4.
