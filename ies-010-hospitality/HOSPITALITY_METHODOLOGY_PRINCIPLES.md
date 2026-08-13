# IES-010 — Hospitality Methodology Principles (Phase 1)

**Standard:** IES-010 — Hospitality Sector Engine
**Stage:** Phase 1 — Methodology Principles
**Status:** PRINCIPLES (conceptual foundation — precedes Engineering Standard)
**Date:** 2026-08-08
**Prior:** IES-010 Gate 0 — Discovery Pack (Approved)

---

## 1. Purpose

The conceptual foundation for the Hospitality metric library and methodology — answers *why* metrics are chosen, not just *what* they are.

## 2. What creates durable investment value

- **RevPAR growth that compounds** — the core operating engine (Occupancy × ADR) with pricing power.
- **Asset-light, fee-based earnings quality** — recurring management/franchise/royalty income that is less volatile than owned operations.
- **Demand-quality revenue** — direct bookings, corporate contracts, loyalty-driven repeat guests (revenue durability).
- **Brand + distribution moat** — loyalty ecosystems, network density, direct-booking capability, premium positioning.
- **Operating leverage** — incremental GOP per incremental occupied room expands margins on recovery.
- **Efficient capital** — return on invested capital on owned assets, low capital intensity for asset-light operators.

## 3. What destroys value

- **Occupancy collapse / demand shock** — high fixed costs → severe downside operating leverage.
- **Over-leverage on owned assets** — debt service stress in cyclical downturns.
- **ADR discounting / rate dilution** — revenue growth via rate cuts that erode margin.
- **High OTA dependence** — commission drag + loss of direct customer relationship.
- **Revenue concentration** — dependence on one segment (leisure) or one geography.
- **Cost inflation** (labor, utilities) not recoverable in rates.

## 4. Leading vs lagging indicators

| Indicator | Type |
|---|---|
| RevPAR / ADR / Occupancy trend | Leading (operating engine trajectory) |
| Direct-booking ratio / OTA dependence trend | Leading (revenue durability) |
| Business vs leisure mix trend | Leading (demand stability) |
| Asset-light / fee-mix trend | Leading (earnings quality) |
| Pipeline / new openings | Leading (future supply/growth) |
| GOP margin trend | Leading (operating leverage realization) |
| Current revenue / EBITDA / ROIC | Lagging |
| Same-store vs total growth | Leading (organic demand vs expansion) |

Methodology weights **RevPAR growth + demand quality + asset-light earnings quality + operating efficiency** (leading) and uses profitability/ROIC to confirm.

## 5. Universal vs hospitality-specific principles

**Universal:** revenue growth, EBITDA margin, debt/leverage, working capital, valuation multiples.

**Hospitality-specific (core):**
- **Occupancy %** — utilization of room inventory.
- **ADR** — pricing power.
- **RevPAR** — the core operating metric (Occupancy × ADR).
- **GOP margin** — gross operating profit efficiency.
- **Asset-light mix / fee income** — earnings quality + cyclicality.

## 6. How Hospitality Sector Profiles should be expressed

```text
Sector: Hospitality
  Sub-sectors: Luxury, Upscale, Midscale, Economy, Serviced Apartments, Resorts, Heritage/Boutique
  Business models: Owned, Leased, Managed, Franchised, Mixed/Asset-light
  Applicable Metrics (universal + sector set)
  Applicable Overrides (demand shock, occupancy collapse, leverage breach, brand/quality failure)
  Applicable Calibration (segment thresholds + weights)
  Asset-light emphasis
  Operating-leverage / cyclicality profile
```

Lives in the **methodology**, not the platform.

## 7. How cyclicality and seasonality should be treated

- **Cyclicality is structural** (macro travel cycle). It should be recognized as a **risk dimension** and handled via **calibration** (segment/asset-light thresholds), not by changing scoring logic.
- **Seasonality** (peak/off-peak) is normalized in annualized metrics (e.g., annual RevPAR, full-year GOP), so it does not distort scoring.
- Asset-light operators have lower cyclicality → reflected in calibration, not scoring.

## 8. How asset-light vs owned models should be treated

- This is a **calibration** consideration, not a scoring-logic change.
- **Owned/leased:** higher capital intensity, higher risk, more operating leverage; ROIC and leverage matter more.
- **Managed/franchised/asset-light:** recurring fee income, lower risk, higher earnings quality; fee growth and royalty durability matter more.
- Asset-light earnings are weighted higher on quality/risk dimensions; owned assets on capital efficiency.

## 9. How operating leverage should be treated

- Recognized via **GOP margin + occupancy break-even** reasoning.
- During recovery, margin expansion is a **positive leading signal** (incremental GOP).
- During downturns, margin compression is a **negative risk signal** (downside operating leverage).
- Deterministic: modeled through occupancy/GOP relationships, never random.

## 10. The Hospitality economic moat

The Hospitality moat is **brand + distribution + loyalty**, not property ownership:
- Loyalty ecosystems and repeat guests.
- Distribution network and geographic density.
- Direct-booking capability (owns the guest relationship, lower OTA cost).
- Premium brand positioning (ADR premium).
- Conference/event ecosystem.
- Asset-light brand strength (royalty stream durability).

This maps cleanly to the Universal Investment Ontology's **Moat** dimension, so CSIP can consume Hospitality outputs via ontology registration with no CSIP change.

## 12. Revenue Quality Hierarchy

Define a deterministic ranking of revenue durability — the foundation for demand-quality scoring:

```text
Loyalty / Corporate Contract
        >
Direct Booking
        >
Travel Agency
        >
OTA
        >
One-off Promotional Demand
```

Higher durability = higher revenue quality. This provides a deterministic, ordinal basis for demand-quality scoring in the Metric Library/Score Engine.

## 13. Capacity Expansion Principles

Hospitality growth differs from many industries. Distinguish growth sources:

- **Organic RevPAR growth** — same-store rate/occupancy improvement (highest quality, durable).
- **New hotel openings** — new-build supply (capital-intensive).
- **Managed property additions** — fee income without capital.
- **Franchise expansion** — royalty growth, asset-light.
- **Acquisition-led growth** — inorganic, integration risk.

This distinction supports the **Growth** pillar (organic/asset-light growth weighted higher).

## 14. Asset Utilization Philosophy

Beyond occupancy, define the broader utilization philosophy consistent across sub-sectors:

- **Room inventory utilization** — occupancy of rooms.
- **Conference/event utilization** — meeting/banquet space usage.
- **Ancillary asset utilization** — F&B, spa, parking, retail capacity.
- **Seasonal capacity management** — rate/availability optimization across peak/off-peak.

Total asset utilization (not just rooms) is the basis for the operating-efficiency dimension.

## 15. Capital Recycling

Hospitality companies frequently recycle capital through asset sales + transition toward asset-light:

- **Sale-and-manage** — sell asset, retain management fee income.
- **Sale-and-franchise** — sell asset, retain royalty stream.
- **Capital recycling quality** — proceeds redeployed at higher ROIC.
- **ROIC improvement through portfolio optimization** — shifting owned → managed/franchised.

This complements the capital-efficiency framework and is a **calibration/quality** consideration (asset-light earnings weight higher), not a scoring-logic change.

## 16. Invariant principles

1. **RevPAR quality > revenue size** — durable, high-quality demand.
2. **Asset-light earnings quality > owned volatility.**
3. **Demand quality (direct/corporate/loyalty) > gross occupancy.**
4. **Operating leverage is double-edged** — recognized in both growth and risk.
5. **Brand + distribution moat is foundational.**
6. **Deterministic, replayable, explainable** — platform-neutral.

## 17. Status

**PHASE 1 COMPLETE (Principles)** — awaiting approval before IES-010 Phase 2 (Engineering Standard).
