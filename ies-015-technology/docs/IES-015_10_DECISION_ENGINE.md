# IES-015 — Technology Sector Engine

## Document 10 — TECHNOLOGY DECISION ENGINE

**Document ID:** IES-015-D10
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION (Phase 2 — frozen override + verdict contract)

---

# Purpose

Maps the composite score + overrides to a final verdict, deterministically. D15 resolves override precedence + verdict mapping against **this document (v1.0)**.

# 1. Verdict mapping (lower-inclusive / upper-exclusive)

| Condition | Verdict |
|---|---|
| `80 ≤ score < 100` | Strong Buy |
| `70 ≤ score < 80` | Buy |
| `60 ≤ score < 70` | Accumulate |
| `50 ≤ score < 60` | Hold |
| `40 ≤ score < 50` | Watch |
| `0 ≤ score < 40` | Avoid |

Composite 0–100; `100` maps to Strong Buy (terminal band includes upper boundary). **No overlapping boundaries.**

# 2. Override families

| Override | Trigger | Cap |
|---|---|---|
| Governance / regulatory | compliance/export/privacy failure | Avoid |
| Disruption / obsolescence | material product/category disruption | Watch |
| Churn collapse | material retention/NRR collapse | Watch |
| Customer-concentration loss | material top-customer loss | Watch |
| Capex overrun | material capital overrun (semis/hardware) | Watch |
| Margin compression | severe margin compression | Watch |
| Leverage breach | Debt/EBITDA above subsegment alert | Watch |

# 3. Override precedence (explicit, ordered)

When multiple overrides trigger simultaneously, apply **min_rank over all applicable caps**:

**Formal operator:** `finalVerdict = min_rank(baseVerdict, all applicable override caps)`. The final verdict is the **lowest verdict rank** (most restrictive) among the base verdict and the caps of **all** simultaneously-triggered overrides. The ordered list below is the **audit/evaluation order** (deterministic, documented); it does NOT select which cap survives.

| Priority | Override | Cap |
|---|---|---|
| 1 | Governance / regulatory | Avoid |
| 2 | Disruption / obsolescence | Watch |
| 3 | Churn collapse | Watch |
| 4 | Customer-concentration loss | Watch |
| 5 | Capex overrun | Watch |
| 6 | Margin compression | Watch |
| 7 | Leverage breach | Watch |

# 4. Determinism

Identical composite + overrides + calibration → identical verdict.

# Status

**IES-015-D10 · Version 1.0 · Status SPECIFICATION (frozen override + verdict contract)**
