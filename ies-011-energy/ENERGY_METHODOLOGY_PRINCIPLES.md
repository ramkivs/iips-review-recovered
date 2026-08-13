# IES-011 — Energy Methodology Principles (Phase 1)

**Standard:** IES-011 — Energy Sector Engine
**Stage:** Phase 1 — Methodology Principles
**Status:** PRINCIPLES (conceptual foundation — precedes Engineering Standard)
**Date:** 2026-08-08
**Prior:** IES-011 Gate 0 — Discovery Pack (Approved) + Resource Sector Common Principles

---

## 1. Purpose

The conceptual foundation for the Energy metric library and methodology — answers *why* metrics are chosen, not just *what* they are, grounded in the reusable Resource Sector Common Principles.

## 2. What creates durable investment value

- **High-quality, long-life reserves/assets** — reserve life, quality resource base.
- **Low-cost position** — lifting cost / cash cost per unit, cost advantage.
- **Capital discipline** — counter-cyclical capex, sustaining vs growth allocation.
- **Reserve/asset replacement** — replacing depletion at favorable cost.
- **Diversified / integrated cash flows** — across commodity and segment (upstream/downstream/midstream).
- **Energy transition positioning** — gas/renewables exposure with a clear path.
- **Strong balance sheet** — low leverage to weather price cycles.

## 3. What destroys value

- **Commodity price collapse** — severe cyclical downside.
- **Cost overruns / project delays** — capital destruction.
- **Reserve write-downs** — impairments from uneconomic projects.
- **Over-leverage** — debt stress in downturns.
- **Pro-cyclical over-investment** — buying high at cycle peak.
- **Stranded assets** — transition-related obsolescence.

## 4. Leading vs lagging indicators

| Indicator | Type |
|---|---|
| Production/volume growth trend | Leading (output trajectory) |
| Lifting cost / cash cost trend | Leading (cost position) |
| Reserve replacement ratio trend | Leading (sustainability) |
| Exploration success / discoveries | Leading (future supply) |
| Capital expenditure discipline | Leading (future returns) |
| Renewables/transition capex mix | Leading (future positioning) |
| Current revenue / EBITDA / ROCE | Lagging |
| Realized price | Lagging (cyclical) |

Methodology weights **production growth + cost position + reserve replacement + capital discipline + transition positioning** (leading) and uses profitability/ROCE to confirm.

## 5. Universal vs energy-specific principles

**Universal (resource common):** commodity-cycle valuation, capital intensity, reserve/asset replacement, regulatory/environmental exposure, operating leverage, capital discipline, cyclical valuation (per Resource Sector Common Principles).

**Energy-specific (core):**
- Production growth / output volumes.
- Lifting cost / unit cash cost.
- Reserve life & replacement ratio.
- Realized commodity price.
- Energy transition mix (gas/renewables vs legacy).

## 6. How Energy Sector Profiles should be expressed

```text
Sector: Energy
  Sub-sectors: Integrated, E&P, Oilfield Services, Midstream, Refining & Marketing, IPP, Utilities, Renewables
  Commodity exposure: oil / gas / power / LNG / carbon
  Applicable Metrics (universal resource + energy set)
  Applicable Overrides (price collapse, cost blowout, reserve write-down, leverage breach, transition/stranded-asset)
  Applicable Calibration (segment thresholds + weights, commodity-cycle normalization)
  Energy-transition emphasis
  Cyclicality / capital-duration profile
```

Lives in the **methodology**, not the platform.

## 7. How cyclicality and commodity price should be treated

- **Commodity price cyclicality is structural** — a **risk** dimension handled via **calibration** (segment thresholds), not scoring-logic change.
- **Valuation must be normalized across the cycle** (mid-cycle, not peak/trough) per Resource Sector Common Principles.
- Realized price is a lagging cyclical input; cost position and volume growth are leading quality signals.

## 8. How capital allocation and reserve replacement should be treated

- **Reserve replacement** and **depletion** are foundational quality/growth signals (sustaining vs growth capex).
- **Capital discipline** (counter-cyclical investment) is a quality signal.
- **Project payback / long-duration decisions** recognized in risk and quality, deterministically.

## 9. How the energy transition should be treated

- Transition positioning (gas/renewables mix, carbon exposure) is a **leading quality** consideration.
- Stranded-asset/transition risk is a **risk** consideration.
- Expressed via calibration/segments, not scoring-logic change.

## 10. The Energy economic moat

- **Reserve/resource base** and long-life assets.
- **Cost position** (low-cost producer advantage).
- **Scale and infrastructure** (midstream, integrated, regulated utility moats).
- **Project/technical capability** (exploration success, execution).

Maps to the Universal Investment Ontology's **Moat** dimension — CSIP-compatible via ontology registration.

## 11. Energy Value Chain Position

Economics differ materially across the Energy value chain. This is why Phase 2 needs **different calibration profiles** while sharing a **common scoring engine**.

| Value chain position | Primary economic driver | Principal risks | Dominant quality metrics | Capital allocation | Calibration implications |
|---|---|---|---|---|---|
| **Upstream (E&P)** | commodity price × production volumes | price collapse, reserve depletion, drilling risk | reserve life, lifting cost, production growth, reserve replacement | long-payback drilling/development, exploration | high commodity-cycle risk, cost-position emphasis |
| **Midstream (pipelines/storage)** | tariff/throughput revenue | volume/utilisation, regulatory | contracted cash flows, utilization, EBITDA stability | infrastructure build, FCF | lower price risk, contracted-revenue profile |
| **Downstream (refining/marketing)** | refining margin (crack spread) × throughput | margin volatility, utilisation | margin, cost per barrel, utilization | maintenance + selective growth | margin-cycle normalization |
| **Integrated majors** | diversified (upstream + downstream) cash flows | combined exposure, price + margin | diversification, cost position, FCF, capital discipline | balanced portfolio, buybacks | blended profile |
| **Renewable developers** | power sale (PPA/merchant) × capacity | buildout, merchant price, financing | project pipeline, cost/MW, contracted revenue, ROCE | growth capex, project financing | lower cyclicality, transition upside |
| **Regulated utilities** | rate base × allowed return | regulatory, rate cases | rate base growth, ROE stability, balance sheet | regulated capex, low risk | regulated-return, low price risk |

## 12. Commodity Exposure Classification (reusable taxonomy)

A consistent vocabulary for future resource-sector calibration:

- **Price taker** — full commodity-price exposure (e.g., merchant E&P, merchant power).
- **Partial hedger** — some production contracted/hedged.
- **Regulated return business** — returns set by regulation (e.g., utilities).
- **Contracted revenue business** — long-term PPAs/tariffs (e.g., renewables, midstream).
- **Diversified commodity business** — exposure across multiple commodities/segments (e.g., integrated).

This gives future calibration documents a consistent vocabulary without embedding business-model logic into the platform.

## 13. Invariant principles

1. **Cost position > size** — low-cost producers win across cycles.
2. **Reserve replacement sustains value** — depletion must be replaced.
3. **Capital discipline > growth** — counter-cyclical capex beats pro-cyclical over-spend.
4. **Commodity cycle is structural** — risk via calibration, normalized valuation.
5. **Energy transition is a real quality/risk signal.**
6. **Deterministic, replayable, explainable** — platform-neutral.

## 14. Status

**PHASE 1 COMPLETE (Principles)** — awaiting approval before IES-011 Phase 2 (Engineering Standard).
