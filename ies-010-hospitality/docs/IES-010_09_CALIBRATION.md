# IES-010 — Hospitality Sector Engine

## Document 09 — HOSPITALITY CALIBRATION

**Document ID:** IES-010-D09
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines calibration thresholds and weights **by business model** — where cyclicality, seasonality, and asset-light vs owned differences are expressed (per methodology principles).

# 1. Business-model calibration profiles

| Profile | Occupancy weight | Demand/RevPAR weight | Growth weight | Profitability weight | Earnings-quality (fee) weight | Capital/Risk weight |
|---|---|---|---|---|---|---|
| Owned | 0.25 | 0.20 | 0.15 | 0.20 | 0.05 | 0.15 |
| Leased | 0.25 | 0.20 | 0.15 | 0.20 | 0.05 | 0.15 |
| Managed | 0.15 | 0.25 | 0.20 | 0.15 | 0.15 | 0.10 |
| Franchised | 0.10 | 0.20 | 0.20 | 0.10 | 0.30 | 0.10 |
| Asset-light/Mixed | 0.10 | 0.20 | 0.20 | 0.15 | 0.25 | 0.10 |

# 2. Risk thresholds by business model

| Profile | Leverage (Debt/EBITDA) alert |
|---|---|
| Owned | > 5.0x |
| Leased | > 4.5x |
| Managed | > 3.5x |
| Franchised | > 3.0x |
| Asset-light | > 3.0x |

# 3. Cyclicality/seasonality handling

- Annualized metrics normalize seasonality.
- Cyclicality reflected via risk calibration per business model, never scoring-logic change.

# Status

**IES-010-D09 · Version 1.0 · Status SPECIFICATION**
