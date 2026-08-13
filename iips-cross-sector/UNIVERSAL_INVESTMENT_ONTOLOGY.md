# IIPS — Universal Investment Ontology (CSIP Foundation)

**Program:** v1.1 Track 5 — Cross-Sector Intelligence Platform
**Status:** FOUNDATION (specification — precedes CSIP implementation)
**Date:** 2026-08-06
**Purpose:** A canonical, sector-independent model of investment concepts. Each sector engine maps its own methodology to this ontology through metadata, enabling CSIP to compare outputs consistently without understanding sector-specific formulas.

---

## 1. Purpose

Existing engines answer: *"How attractive is this company?"*
CSIP answers: *"Given ALL attractive companies across ALL sectors, how should capital be allocated?"*

The Universal Investment Ontology makes the second question answerable by providing a **sector-independent vocabulary** for comparing engine outputs. It keeps each engine's methodology private while exposing comparable dimensions.

## 2. Core ontology concepts

| Concept | Definition (sector-independent) | Maps from sector engine |
|---|---|---|
| **Quality** | Durable franchise strength + earnings quality | Banking: franchise; Insurance: underwriting; Capital Markets: earnings quality; Healthcare: clinical quality |
| **Growth** | Sustainability of value-accretive expansion | sector growth pillar/score |
| **Risk** | Downside / fragility of the business | sector risk dimension |
| **Valuation** | Attractiveness of current price vs value | sector valuation score / opportunity |
| **Capital Efficiency** | Return on capital deployed | ROE/ROCE/EBITDA margin (normalized) |
| **Moat** | Durability of competitive position | sector moat/franchise factor |
| **Confidence** | Data quality + signal consistency | engine confidence score |
| **Conviction** | Normalized composite attractiveness | engine composite score (normalized) |

## 3. Normalization principle

- Each engine publishes a **composite score** (0–100) and **confidence** (0–1).
- CSIP maps these to ontology dimensions via engine-declared **ontology metadata** (a mapping table), never by reading internal scoring logic.
- Engines are treated as **black boxes**.

## 4. Ontology metadata (per engine)

Each sector engine declares an ontology mapping:

```text
Engine → {
  composite → Conviction
  confidence → Confidence
  qualityScore → Quality
  growthScore → Growth
  riskScore → Risk
  valuationScore → Valuation
  capitalEfficiency → Capital Efficiency
  franchiseScore → Moat
  calibrationVersion, methodologyVersion, replayMetadata
}
```

## 5. Sector-independence

- CSIP consumes **only** these published, normalized dimensions.
- Adding Hospitality/Energy/Utilities/etc. requires **no CSIP change** — the new engine simply registers its ontology metadata and participates in ranking/portfolio intelligence.

## 6. Determinism & replay

- Ontology mappings are deterministic (engine-declared metadata).
- All derived dimensions are deterministic → replayable.

## 7. Status

**FOUNDATION COMPLETE** — this is the conceptual basis for the Cross-Sector Intelligence Standard.
