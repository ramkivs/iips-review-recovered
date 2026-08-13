# IES-011 — Energy Sector Engine

## Document 18 — ENERGY DATA DICTIONARY

**Document ID:** IES-011-D18
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the energy data fields used by the metric library.

# Data fields

| Field | Type | Source | Metric |
|---|---|---|---|
| productionGrowth | number | operator data | EM-006 |
| liftingCost | number | operator data | EM-007 |
| reserveReplacement | number | operator data | EM-008 |
| reserveLife | number | operator data | EM-009 |
| realizedPrice | number | market/operator | EM-010 |
| transitionMix | number | operator data | EM-011 |
| ebitdaMargin | number | financials | EM-001 |
| revenueGrowth | number | financials | EM-002 |
| debtEbitda | number | balance sheet | EM-003 |
| evEbitda | number | market/financials | EM-004 |
| roce | number | financials | EM-005 |
| fcfYield | number | financials | EM-012 |
| segment | enum | profile | calibration |
| commodityExposure | enum | profile | calibration |
| governanceFlag | boolean | override input | override |
| strandedAssetFlag | boolean | override input | override |
| reserveWriteDownFlag | boolean | override input | override |
| costBlowoutFlag | boolean | override input | override |
| priceCollapseFlag | boolean | override input | override |

# Data quality

- All inputs are deterministic and versioned.
- Missing metric → neutral handling (per platform convention).

# Status

**IES-011-D18 · Version 1.0 · Status SPECIFICATION**
