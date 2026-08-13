# IES-013 — Consumer Sector Engine

## Document 08 — CONSUMER FORMULA LIBRARY

**Document ID:** IES-013-D08
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the deterministic formulas used by the Consumer Score Engine.

# CF-001 — Pricing Power / Volume Mix
```text
Price Contribution = price-driven growth ÷ total growth
```

# CF-002 — Brand / Loyalty
```text
Brand Loyalty = repeat-purchase % (or market-share stability)
```

# CF-003 — Margin Resilience
```text
Margin Resilience = margin stability index (volatility-adjusted)
```

# CF-004 — Distribution / Channel Mix
```text
DTC/Direct Share = direct channel revenue ÷ total revenue
```

# CF-005 — FCF Yield
```text
FCF Yield = Free Cash Flow ÷ Market Cap
```

# CF-006 — Composite Score
```text
Composite = Σ(Pillar × Weight)
Weights: Quality 0.30, Growth 0.20, Risk 0.15, Profitability 0.20, CapitalEff 0.10, Valuation 0.05
Composite = round_half_to_even(Composite, 1)
```

# CF-007 — Innovation Intensity
```text
Innovation Intensity = new-product revenue ÷ total revenue
```

# Status

**IES-013-D08 · Version 1.0 · Status SPECIFICATION**
