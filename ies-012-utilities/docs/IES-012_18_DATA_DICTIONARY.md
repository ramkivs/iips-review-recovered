# IES-012 — Utilities Sector Engine

## Document 18 — UTILITIES DATA DICTIONARY

**Document ID:** IES-012-D18
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the utilities data fields used by the metric library.

# Data fields

| Field | Type | Source | Metric |
|---|---|---|---|
| rateBaseGrowth | number | regulatory/operator | UM-006 |
| allowedRoe | number | regulatory | UM-007 |
| ffoDebt | number | financials | UM-008 |
| omEfficiency | number | operator data | UM-009 |
| demandGrowth | number | operator data | UM-010 |
| saidi | number | operator data | UM-011 |
| transitionCapexIntensity | number | operator data | UM-012 |
| ebitdaMargin | number | financials | UM-001 |
| revenueGrowth | number | financials | UM-002 |
| debtEbitda | number | balance sheet | UM-003 |
| peRatio | number | market/financials | UM-004 |
| roe | number | financials | UM-005 |
| segment | enum | profile | calibration |
| regulatoryPosture | enum | profile | calibration |
| governanceFlag | boolean | override input | override |
| adverseRateCaseFlag | boolean | override input | override |
| regulatoryLagFlag | boolean | override input | override |
| capexOverrunFlag | boolean | override input | override |
| strandedAssetFlag | boolean | override input | override |

# Data quality

- All inputs are deterministic and versioned.
- Missing metric → neutral handling (per platform convention).

# Status

**IES-012-D18 · Version 1.0 · Status SPECIFICATION**
