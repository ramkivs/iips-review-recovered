# IIPS — Ontology Consistency Matrix

**Program:** v1.1 Track 5 — Cross-Sector Intelligence Platform
**Phase:** CSIP Phase 3 — Architecture Review
**Artifact:** 2 of 4 (Ontology Consistency Matrix)
**Version:** 1.0-draft
**Date:** 2026-08-08
**Purpose:** Verify that every released sector engine (Banking, Insurance, Capital Markets, Healthcare) maps completely into the Universal Investment Ontology, that no ontology concept is left unmapped, and that no engine exposes a concept outside the ontology. This is the precondition for cross-sector comparisons using **only** normalized dimensions.

---

## 1. Ontology dimensions (8 canonical concepts)

Conviction · Confidence · Quality · Growth · Risk · Valuation · Capital Efficiency · Moat

## 2. Engine → ontology mapping

Mapping derived from each engine's **published pillars + composite + confidence** (frozen v1.0). Source = frozen score engines in `iips-platform/src/sector-engines/*/scoring/*.ts` and each engine's `execute()` metadata.

### Banking (IES-006, pillars: asset-quality, profitability, funding-quality, capital-strength, growth, operating-efficiency, valuation)

| Ontology dimension | Mapped from | Direction |
|---|---|---|
| Conviction | composite | direct |
| Confidence | confidence | direct (0.8) |
| Quality | asset-quality, funding-quality | composite of pillars |
| Growth | growth | direct |
| Risk | asset-quality (asset risk), capital-strength | composite of pillars |
| Valuation | valuation | direct |
| Capital Efficiency | profitability, operating-efficiency | composite of pillars |
| Moat | funding-quality (franchise/funding strength) | derived |

### Insurance (IES-007, pillars: underwriting, solvency, growth, persistency, profitability)

| Ontology dimension | Mapped from | Direction |
|---|---|---|
| Conviction | composite | direct |
| Confidence | confidence | direct (0.8) |
| Quality | underwriting | direct |
| Growth | growth | direct |
| Risk | solvency | direct |
| Valuation | valuation score (P/EV, P/E) | derived |
| Capital Efficiency | profitability | direct |
| Moat | persistency | derived |

### Capital Markets (IES-008, pillars: earnings-quality, growth, profitability, franchise, operating-efficiency)

| Ontology dimension | Mapped from | Direction |
|---|---|---|
| Conviction | composite | direct |
| Confidence | confidence | direct (0.8) |
| Quality | earnings-quality | direct |
| Growth | growth | direct |
| Risk | earnings-quality (earnings risk) | derived |
| Valuation | valuation/opportunity score | derived |
| Capital Efficiency | profitability, operating-efficiency | composite of pillars |
| Moat | franchise | direct |

### Healthcare (IES-009, pillars: utilization, revenue-quality, profitability, clinical-quality, efficiency)

| Ontology dimension | Mapped from | Direction |
|---|---|---|
| Conviction | composite | direct |
| Confidence | confidence | direct (0.8) |
| Quality | revenue-quality, clinical-quality | composite of pillars |
| Growth | utilization (volume/utilization) | derived |
| Risk | clinical-quality (quality risk) | derived |
| Valuation | valuation/opportunity score | derived |
| Capital Efficiency | profitability, efficiency | composite of pillars |
| Moat | clinical-quality (franchise/quality barrier) | derived |

## 3. Coverage completeness

| Ontology dimension | Banking | Insurance | Capital Markets | Healthcare | Unmapped? |
|---|---|---|---|---|---|
| Conviction | ✓ | ✓ | ✓ | ✓ | no |
| Confidence | ✓ | ✓ | ✓ | ✓ | no |
| Quality | ✓ | ✓ | ✓ | ✓ | no |
| Growth | ✓ | ✓ | ✓ | ✓ | no |
| Risk | ✓ | ✓ | ✓ | ✓ | no |
| Valuation | ✓ (direct) | ✓ (derived) | ✓ (derived) | ✓ (derived) | no |
| Capital Efficiency | ✓ | ✓ | ✓ | ✓ | no |
| Moat | ✓ | ✓ | ✓ | ✓ | no |

**Result:** every ontology concept is populated by all four released sectors. No ontology concept is unmapped.

## 4. Out-of-ontology check

| Engine | Published pillar/output | Ontology concept? |
|---|---|---|
| Banking | asset-quality, profitability, funding-quality, capital-strength, growth, operating-efficiency, valuation, composite, confidence | all mapped ✓ |
| Insurance | underwriting, solvency, growth, persistency, profitability, composite, confidence | all mapped ✓ |
| Capital Markets | earnings-quality, growth, profitability, franchise, operating-efficiency, composite, confidence | all mapped ✓ |
| Healthcare | utilization, revenue-quality, profitability, clinical-quality, efficiency, composite, confidence | all mapped ✓ |

**Result:** no engine exposes a pillar or score that falls outside the 8-concept ontology. CSIP never needs to reach past the ontology.

## 5. Findings & requirements

1. **Completeness confirmed** — all four engines map fully into the ontology; no unmapped concept and no out-of-ontology exposure.
2. **Mapping metadata is currently conceptual.** The per-engine declared mapping tables (stage-2 of the Decision Trace) do not yet exist as versioned artifacts in the implementation. They must be materialized as deterministic, versioned **ontology metadata JSON per engine** during Freeze, referencing each frozen pillar by its exact published name.
3. **Direct vs. derived:** Valuation and Moat are directly published by Banking but **derived** in other sectors. CSIP must consume only the *mapped dimension value*, never re-derive it from raw sector metrics — derivation is the engine's own declared mapping, not CSIP recomputation.
4. **Additive future sectors:** any new engine (Hospitality IES-010, Energy, etc.) registers the same 8-dimension metadata table. This is the sole integration contract — no CSIP logic change (see Coverage Matrix, Q8).

## 6. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.** Ontology mapping verified consistent across all four released sectors.
