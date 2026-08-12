# IES-010 — Business Model Consistency Matrix

**Standard:** IES-010 — Hospitality Sector Engine
**Phase:** 4 — Architecture Review
**Version:** 1.0
**Date:** 2026-08-08
**Status:** ARCHITECTURE REVIEW ARTIFACT

> **Purpose.** Canonical review artifact demonstrating calibration consistency across hospitality business models (per Phase 4 recommendation).

---

## 1. Business model consistency

| Business model | Active metrics | Inactive/less-weighted | Pillar composition | Calibration profile | Override applicability |
|---|---|---|---|---|---|
| **Owned** | Occupancy, ADR, RevPAR, GOP, RevPAR growth, ROIC, Debt/EBITDA | Fee mix (inactive) | Full 6-pillar, capital/risk weighted 0.15 | owned | demand shock, occupancy collapse, leverage (>5.0x), brand, governance |
| **Leased** | Occupancy, ADR, RevPAR, GOP, growth, ROIC, Debt/EBITDA | Fee mix (inactive) | Full 6-pillar | leased | demand shock, occupancy collapse, leverage (>4.5x), brand, governance |
| **Managed** | RevPAR, ADR, GOP, growth, fee mix, demand quality | ROIC (less-weighted) | Earnings quality 0.15 | managed | demand shock, occupancy collapse, leverage (>3.5x), brand, governance |
| **Franchised** | RevPAR, ADR, growth, fee mix (primary), demand quality | ROIC (inactive), occupancy (less) | Earnings quality 0.30 | franchised | demand shock, occupancy collapse, leverage (>3.0x), brand, governance |
| **Asset-light/Mixed** | RevPAR, ADR, GOP, growth, fee mix (primary), demand quality | ROIC (less-weighted) | Earnings quality 0.25 | asset-light | demand shock, occupancy collapse, leverage (>3.0x), brand, governance |

## 2. Consistency findings

- **Every business model** maps to a consistent active/inactive metric set and a distinct calibration profile.
- **Pillar composition** is uniform (6 pillars); weights differ by business model (calibration), never scoring logic.
- **Override applicability** is uniform across models; only the **leverage alert threshold** differs by calibration profile.
- No metric or override is applied inconsistently within a model.

## 3. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.** Calibration consistency confirmed.
