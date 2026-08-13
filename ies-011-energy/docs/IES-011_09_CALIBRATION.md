# IES-011 — Energy Sector Engine

## Document 09 — ENERGY CALIBRATION

**Document ID:** IES-011-D09
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines calibration thresholds and weights **by value-chain segment and commodity exposure** — where cyclicality, commodity price, and segment differences are expressed (per methodology principles).

# 1. Segment calibration profiles

| Segment | Quality weight | Growth weight | Risk weight | Profitability weight | CapitalEff weight | Valuation weight |
|---|---|---|---|---|---|---|
| Upstream (E&P) | 0.30 | 0.15 | 0.20 | 0.15 | 0.10 | 0.10 |
| Midstream | 0.20 | 0.15 | 0.15 | 0.20 | 0.15 | 0.15 |
| Downstream | 0.20 | 0.15 | 0.20 | 0.25 | 0.10 | 0.10 |
| Integrated | 0.25 | 0.15 | 0.15 | 0.20 | 0.10 | 0.15 |
| Renewables | 0.20 | 0.30 | 0.10 | 0.15 | 0.15 | 0.10 |
| Regulated Utilities | 0.20 | 0.10 | 0.10 | 0.25 | 0.20 | 0.15 |

# 2. Commodity exposure risk

| Classification | Risk weight multiplier |
|---|---|
| Price taker | high (1.2x) |
| Partial hedger | medium (1.0x) |
| Contracted revenue | low (0.8x) |
| Regulated return | low (0.7x) |
| Diversified | medium (1.0x) |

# 3. Cyclicality handling

- Valuation uses **mid-cycle normalized EBITDA** (not peak/trough).
- Commodity-price cyclicality reflected via risk calibration, never scoring-logic change.

# Status

**IES-011-D09 · Version 1.0 · Status SPECIFICATION**
