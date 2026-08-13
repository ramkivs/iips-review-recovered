# IES-012 — Utilities Sector Engine

## Document 08 — UTILITIES FORMULA LIBRARY

**Document ID:** IES-012-D08
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the deterministic formulas used by the Utilities Score Engine.

# UF-001 — Rate Base Growth
```text
Rate Base Growth = (RateBase(t) − RateBase(t−1)) ÷ RateBase(t−1)
```

# UF-002 — FFO/Debt
```text
FFO/Debt = Funds From Operations ÷ Total Debt
```

# UF-003 — O&M Efficiency
```text
O&M Efficiency = O&M Expense ÷ Revenue (or per customer)
```

# UF-004 — Reliability
```text
SAIDI = total outage minutes ÷ customers
```

# UF-005 — Transition / Capex Intensity
```text
Transition Intensity = Grid/Renewables Capex ÷ Total Capex
```

# UF-006 — Composite Score
```text
Composite = Σ(Pillar × Weight)
Weights: Quality 0.30, Growth 0.20, Risk 0.15, Profitability 0.20, CapitalEff 0.10, Valuation 0.05
Composite = round_half_to_even(Composite, 1)
```

# UF-007 — Regulated return
```text
Regulated Earnings = Rate Base × Allowed ROE
```

# Status

**IES-012-D08 · Version 1.0 · Status SPECIFICATION**
