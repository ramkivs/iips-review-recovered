# IES-010 — Business Model Calibration Matrix

**Standard:** IES-010 — Hospitality Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSET — the canonical calibration reference

> **Purpose.** Single authoritative matrix of per-business-model calibration: active/inactive metrics, pillar weights, override thresholds.

---

## 1. Active / inactive metrics by business model

| Metric | Owned | Leased | Managed | Franchised | Asset-light |
|---|---|---|---|---|---|
| Occupancy (HM-005) | active | active | active | less-weighted | less-weighted |
| ADR (HM-006) | active | active | active | active | active |
| RevPAR (HM-007) | active | active | active | active | active |
| GOP Margin (HM-008) | active | active | active | active | active |
| RevPAR Growth (HM-009) | active | active | active | active | active |
| Asset-light/Fee Mix (HM-010) | inactive | inactive | active | primary | primary |
| Demand Quality (HM-011) | active | active | active | active | active |
| ROIC (HM-012) | primary | active | less-weighted | inactive | less-weighted |
| Debt/EBITDA (HM-003) | primary | active | active | less-weighted | less-weighted |

## 2. Pillar weights by business model

| Business model | Occupancy | Demand/RevPAR | Growth | Profitability | Earnings Quality (fee) | Capital/Risk |
|---|---|---|---|---|---|---|
| Owned | 0.25 | 0.20 | 0.15 | 0.20 | 0.05 | 0.15 |
| Leased | 0.25 | 0.20 | 0.15 | 0.20 | 0.05 | 0.15 |
| Managed | 0.15 | 0.25 | 0.20 | 0.15 | 0.15 | 0.10 |
| Franchised | 0.10 | 0.20 | 0.20 | 0.10 | 0.30 | 0.10 |
| Asset-light/Mixed | 0.10 | 0.20 | 0.20 | 0.15 | 0.25 | 0.10 |

## 3. Override thresholds (Debt/EBITDA alert)

| Business model | Leverage alert |
|---|---|
| Owned | > 5.0x |
| Leased | > 4.5x |
| Managed | > 3.5x |
| Franchised | > 3.0x |
| Asset-light | > 3.0x |

## 4. Status

**REFERENCE ASSET — COMPLETE.** Canonical calibration reference for all business models.
