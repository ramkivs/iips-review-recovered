# IES-011 — Energy Sector Engine

## Document 08 — ENERGY FORMULA LIBRARY

**Document ID:** IES-011-D08
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the deterministic formulas used by the Energy Score Engine.

# EF-001 — Production Growth
```text
Production Growth = (Output(t) − Output(t−1)) ÷ Output(t−1)
```

# EF-002 — Lifting / Cash Cost
```text
Lifting Cost = Operating Cash Cost ÷ Production Volume (per boe / MWh)
```

# EF-003 — Reserve Replacement Ratio
```text
RRR = Reserves Added ÷ Reserves Produced
```

# EF-004 — Reserve Life
```text
Reserve Life = Proved Reserves ÷ Annual Production
```

# EF-005 — Transition / Renewables Mix
```text
Renewables Mix = Clean Capacity (or Revenue) ÷ Total
```

# EF-006 — Composite Score
```text
Composite = Σ(Pillar × Weight)
Weights: Quality 0.25, Growth 0.20, Risk 0.15, Profitability 0.20, CapitalEff 0.10, Valuation 0.10
Composite = round_half_to_even(Composite, 1)
```

# EF-007 — FCF Yield
```text
FCF Yield = Free Cash Flow ÷ Market Cap
```

# EF-008 — Cyclical-normalized valuation
```text
Normalized EBITDA = mid-cycle EBITDA (not peak/trough)
EV/EBITDA_normalized = EV ÷ Normalized EBITDA
```

# Status

**IES-011-D08 · Version 1.0 · Status SPECIFICATION**
