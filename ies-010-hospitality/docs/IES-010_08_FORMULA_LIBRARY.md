# IES-010 — Hospitality Sector Engine

## Document 08 — HOSPITALITY FORMULA LIBRARY

**Document ID:** IES-010-D08
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the deterministic formulas used by the Hospitality Score Engine.

# HF-001 — RevPAR
```text
RevPAR = Occupancy × ADR
        = Room Revenue ÷ Available Rooms
```

# HF-002 — Occupancy
```text
Occupancy = Rooms Sold ÷ Available Rooms
```

# HF-003 — ADR
```text
ADR = Room Revenue ÷ Rooms Sold
```

# HF-004 — GOP Margin
```text
GOP Margin = Gross Operating Profit ÷ Total Revenue
```

# HF-005 — Asset-light / Fee Mix
```text
Fee Mix = (Management Fees + Franchise Fees + Royalties) ÷ Revenue
```

# HF-006 — Composite Score
```text
Composite = Σ(Pillar × Weight)
Weights: Occupancy 0.20, Demand/RevPAR 0.25, Growth 0.15, Profitability 0.20, Earnings Quality 0.10, Capital/Risk 0.10
Composite = round(Composite, 1)
```

# HF-007 — Demand-quality score
Ordinal from Revenue Quality Hierarchy:
```text
Loyalty/Corporate=5, Direct=4, Travel Agency=3, OTA=2, One-off Promo=1
DemandQualityScore = (weighted mix) normalized to 0–100
```

# HF-008 — Leverage
```text
Debt/EBITDA = Net Debt ÷ EBITDA
```

# Status

**IES-010-D08 · Version 1.0 · Status SPECIFICATION**
