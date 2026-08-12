# IES-011 — Energy Sector Engine

## Document 10 — ENERGY DECISION ENGINE

**Document ID:** IES-011-D10
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Maps the composite score + overrides to a final verdict, deterministically.

# 1. Verdict mapping

| Range | Verdict |
|---|---|
| 80–100 | Strong Buy |
| 70–80 | Buy |
| 60–70 | Accumulate |
| 50–60 | Hold |
| 40–50 | Watch |
| 0–40 | Avoid |

# 2. Overrides (deterministic, precedence order)

| # | Override | Trigger | Effect |
|---|---|---|---|
| 1 | Governance/regulatory | compliance/license failure | Cap at Avoid |
| 2 | Stranded asset / transition | material stranded-asset/transition risk | Cap at Watch |
| 3 | Reserve write-down | material impairment | Cap at Watch |
| 4 | Cost blowout | project cost overrun / cash-cost spike | Cap at Watch |
| 5 | Price collapse | commodity price collapse / severe downturn | Cap at Watch |
| 6 | Leverage breach | Debt/EBITDA above segment alert | Cap at Watch |

# 3. Override precedence

Overrides apply in order above (harder caps first); the most restrictive cap wins. Applied **after** composite computation.

# 4. Determinism

Identical composite + overrides + calibration → identical verdict.

# Status

**IES-011-D10 · Version 1.0 · Status SPECIFICATION**
