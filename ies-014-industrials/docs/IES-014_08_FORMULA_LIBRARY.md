# IES-014 — Industrials Sector Engine

## Document 08 — INDUSTRIALS FORMULA LIBRARY

**Document ID:** IES-014-D08
**Version:** 1.2 (DRAFT — contract-hardened)
**Status:** SPECIFICATION (Phase 2 — frozen formulas)

---

# Purpose

Defines the deterministic formulas used by the Industrials Score Engine. D15 resolves formulas against **this document (v1.1)**.

# IF-001 — Book-to-Bill
```text
Book-to-Bill = New Orders ÷ Shipments (revenue)
```

# IF-002 — Backlog / Order Book
```text
Backlog = contracted future revenue; normalized as Backlog ÷ trailing revenue (for banding)
```

# IF-003 — Aftermarket / Services %
```text
Aftermarket % = Services/Aftermarket Revenue ÷ Total Revenue
```

# IF-004 — Order Growth
```text
Order Growth = (New Orders(t) − New Orders(t−1)) ÷ New Orders(t−1)
```

# IF-005 — FCF Yield
```text
FCF Yield = Free Cash Flow ÷ Market Cap
```

# IF-006 — Mid-cycle normalization
```text
Normalized EBITDA = mid-cycle EBITDA (not peak/trough)
EV/EBITDA_normalized = EV ÷ Normalized EBITDA
```

# IF-007 — Composite Score
```text
Composite = Quality×wQ + Growth×wG + Risk×wR + Profitability×wP + CapitalEff×wC + Valuation×wV
(wQ..wV from subsegment calibration, D09)
Composite = round_half_to_even(Composite, 1)
```

# IF-008 — Pillar computations (full precision, no intermediate rounding)
```text
Quality  = IM-008×0.40 + CostPosition×0.35 + Execution×0.25   (CostPosition=IM-011, Execution=(IM-001+IM-011)/2)
Growth   = IM-006×0.40 + IM-010×0.35 + IM-002×0.25
Risk     = IM-003×0.70 + IM-012×0.30
Profitability = IM-001×0.40 + IM-011×0.40 + IM-005×0.20
CapitalEff = IM-009×0.50 + IM-005×0.50
Valuation = IM-004×1.00
```

# IF-009 — Derived component missing-data rule
A derived component (e.g. `Execution`, `CostPosition`) is computed from its **available constituent metrics** using constituent weights **renormalized to the available subset** (single constituent available → that constituent alone, weight 1.0). If **all** constituents are unavailable, the derived component is unavailable and the parent pillar applies the global missing-component rule (D15 §5.2). This is deterministic and global; an independent implementation must not choose an interpretation.

# Status

**IES-014-D08 · Version 1.2 · Status SPECIFICATION (frozen formulas)**
