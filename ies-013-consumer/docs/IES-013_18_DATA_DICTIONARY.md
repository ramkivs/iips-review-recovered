# IES-013 — Consumer Sector Engine

## Document 18 — CONSUMER DATA DICTIONARY

**Document ID:** IES-013-D18
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the consumer data fields used by the metric library.

# Data fields

| Field | Type | Source | Metric |
|---|---|---|---|
| revenueGrowth | number | financials | CM-002 |
| priceContribution | number | operator data | CM-006 |
| brandLoyalty | number | operator data | CM-007 |
| marginResilience | number | operator data | CM-008 |
| dtcShare | number | operator data | CM-009 |
| fcfYield | number | financials | CM-010 |
| innovationIntensity | number | operator data | CM-011 |
| privateLabelExposure | number | operator data | CM-012 |
| ebitdaMargin | number | financials | CM-001 |
| debtEbitda | number | balance sheet | CM-003 |
| peRatio | number | market/financials | CM-004 |
| roic | number | financials | CM-005 |
| segment | enum | profile | calibration |
| businessModel | enum | profile | calibration |
| governanceFlag | boolean | override input | override |
| brandErosionFlag | boolean | override input | override |
| categoryDisruptionFlag | boolean | override input | override |
| inputCostSqueezeFlag | boolean | override input | override |
| channelLossFlag | boolean | override input | override |

# Data quality

- All inputs are deterministic and versioned.
- Missing metric → neutral handling (per platform convention).

# Status

**IES-013-D18 · Version 1.0 · Status SPECIFICATION**
