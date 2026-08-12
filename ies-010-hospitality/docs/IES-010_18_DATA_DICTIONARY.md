# IES-010 — Hospitality Sector Engine

## Document 18 — HOSPITALITY DATA DICTIONARY

**Document ID:** IES-010-D18
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the hospitality data fields used by the metric library.

# Data fields

| Field | Type | Source | Metric |
|---|---|---|---|
| roomsAvailable | number | operator data | HM-005 |
| roomsSold | number | operator data | HM-005 |
| roomRevenue | number | operator data | HM-006, HM-007 |
| totalRevenue | number | operator data | HM-001, HM-008 |
| ebitda | number | financials | HM-001, HM-003 |
| netDebt | number | balance sheet | HM-003 |
| gop | number | operator data | HM-008 |
| feeIncome | number | financials | HM-010 |
| directBookingRevenue | number | operator data | HM-011 |
| corporateLoyaltyRevenue | number | operator data | HM-011 |
| revparPriorYear | number | operator data | HM-009 |
| investedCapital | number | balance sheet | HM-012 |
| nopat | number | financials | HM-012 |
| businessModel | enum | profile | calibration |
| demandShockFlag | boolean | override input | override |
| occupancyCollapseFlag | boolean | override input | override |
| leverageBreachFlag | boolean | computed | override |
| brandDeteriorationFlag | boolean | override input | override |
| governanceFlag | boolean | override input | override |

# Data quality

- All inputs are deterministic and versioned.
- Missing metric → neutral handling (per platform convention).

# Status

**IES-010-D18 · Version 1.0 · Status SPECIFICATION**
