# IES-013 — Consumer Sector Engine

## Document 10 — CONSUMER DECISION ENGINE

**Document ID:** IES-013-D10
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
| 1 | Governance/regulatory | compliance/food-safety failure | Cap at Avoid |
| 2 | Brand erosion | material brand/quality failure | Cap at Avoid |
| 3 | Category disruption | material disruption / share collapse | Cap at Watch |
| 4 | Input-cost squeeze | severe margin compression without pricing power | Cap at Watch |
| 5 | Channel loss | major distribution/channel loss | Cap at Watch |
| 6 | Leverage breach | Debt/EBITDA above segment alert | Cap at Watch |

# 3. Override precedence

Overrides apply in order above (harder caps first); the most restrictive cap wins. Applied **after** composite computation.

# 4. Determinism

Identical composite + overrides + calibration → identical verdict.

# Status

**IES-013-D10 · Version 1.0 · Status SPECIFICATION**
