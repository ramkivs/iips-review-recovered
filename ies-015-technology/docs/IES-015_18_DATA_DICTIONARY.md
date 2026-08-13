# IES-015 — Technology Sector Engine

## Document 18 — TECHNOLOGY DATA DICTIONARY

**Document ID:** IES-015-D18
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the technology data fields used by the metric library.

# Data fields

| Field | Type | Source | Metric |
|---|---|---|---|
| ebitdaMargin | number | financials | TM-001 |
| revenueGrowth | number | financials | TM-002 |
| debtEbitda | number | balance sheet | TM-003 |
| valuation | number | market/financials | TM-004 |
| fcfYield | number | financials | TM-005 |
| recurringRevenueShare | number | operator data | TM-006 |
| nrr | number | operator data | TM-007 |
| grossMargin | number | financials | TM-008 |
| rdIntensity | number | financials | TM-009 |
| customerConcentration | number | operator data | TM-010 |
| capexIntensity | number | financials | TM-011 |
| usageGrowth | number | operator data | TM-012 |
| subsegment | enum | profile | calibration |
| archetype | enum | profile | calibration |
| hybridDominant | enum | profile | calibration (hybrid resolution) |
| subsegmentDominant | enum | profile | calibration (multi-subsegment resolution) |
| governanceFlag | boolean | override input | override |
| disruptionFlag | boolean | override input | override |
| churnCollapseFlag | boolean | override input | override |
| customerLossFlag | boolean | override input | override |
| capexOverrunFlag | boolean | override input | override |
| marginCompressionFlag | boolean | override input | override |

# Data quality

- All inputs are deterministic and versioned.
- Missing metric → neutral handling (per platform + D15 missing-data rule).

# Status

**IES-015-D18 · Version 1.0 · Status SPECIFICATION**
