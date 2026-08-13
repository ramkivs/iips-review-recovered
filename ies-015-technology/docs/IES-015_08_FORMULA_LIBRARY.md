# IES-015 — Technology Sector Engine

## Document 08 — TECHNOLOGY FORMULA LIBRARY

**Document ID:** IES-015-D08
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION (Phase 2 — frozen formulas)

---

# Purpose

Defines the deterministic formulas used by the Technology Score Engine. D15 resolves formulas against **this document (v1.0)**.

# TF-001 — Recurring Revenue %
```text
Recurring % = Recurring Revenue ÷ Total Revenue
```

# TF-002 — Net Revenue Retention (NRR)
```text
NRR = (Retained ARR + Expansion ARR) ÷ (Prior-period ARR) × 100
```

# TF-003 — Gross Margin
```text
Gross Margin = Gross Profit ÷ Revenue
```

# TF-004 — R&D Intensity
```text
R&D Intensity = R&D Expense ÷ Revenue
```

# TF-005 — Customer Concentration
```text
Customer Concentration = Top-10 Customer Revenue ÷ Total Revenue
```

# TF-006 — Capex Intensity
```text
Capex Intensity = Capital Expenditure ÷ Revenue
```

# TF-007 — Usage / Platform Growth
```text
Usage Growth = (Usage(t) − Usage(t−1)) ÷ Usage(t−1)
```

# TF-008 — Composite Score
```text
Composite = Quality×wQ + Growth×wG + Risk×wR + Profitability×wP + CapitalEff×wC + Valuation×wV
(wQ..wV from subsegment+archetype calibration, D09)
Composite = round_half_to_even(Composite, 1)
```

# TF-009 — Derived-component missing-data rule
A derived component is computed from its **available constituent metrics** using renormalized weights (single available → that constituent, weight 1.0). If all constituents unavailable → derived component unavailable → parent pillar renormalizes. (Consistent with D15 §5.2.)

# Status

**IES-015-D08 · Version 1.0 · Status SPECIFICATION (frozen formulas)**
