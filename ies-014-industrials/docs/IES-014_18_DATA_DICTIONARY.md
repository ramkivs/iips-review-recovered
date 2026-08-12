# IES-014 — Industrials Sector Engine

## Document 18 — INDUSTRIALS DATA DICTIONARY

**Document ID:** IES-014-D18
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the industrials data fields used by the metric library.

# Data fields

| Field | Type | Source | Metric |
|---|---|---|---|
| revenueGrowth | number | financials | IM-002 |
| backlog | number | operator data | IM-006 |
| bookToBill | number | operator data | IM-007 |
| aftermarketShare | number | operator data | IM-008 |
| fcfYield | number | financials | IM-009 |
| orderGrowth | number | operator data | IM-010 |
| operatingMargin | number | financials | IM-011 |
| projectRiskExposure | number | operator data | IM-012 |
| ebitdaMargin | number | financials | IM-001 |
| debtEbitda | number | balance sheet | IM-003 |
| evEbitda | number | market/financials | IM-004 |
| roce | number | financials | IM-005 |
| subsegment | enum | profile | calibration |
| businessModel | enum | profile | calibration |
| governanceFlag | boolean | override input | override |
| orderCancellationFlag | boolean | override input | override |
| epcCostOverrunFlag | boolean | override input | override |
| defenseProgramFailFlag | boolean | override input | override |
| marginCompressionFlag | boolean | override input | override |

# Data quality

- All inputs are deterministic and versioned.
- Missing metric → neutral handling (per platform convention).

# Status

**IES-014-D18 · Version 1.0 · Status SPECIFICATION**
