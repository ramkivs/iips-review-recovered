# IES-010 — Hospitality Sector Engine

## Document 10 — HOSPITALITY DECISION ENGINE

**Document ID:** IES-010-D10
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
| 1 | Demand shock | Occupancy collapse (>40% fall) OR severe cyclical downturn | Cap at Watch |
| 2 | Occupancy collapse | Occupancy < 40% sustained | Cap at Avoid |
| 3 | Leverage breach | Debt/EBITDA above business-model alert | Cap at Watch |
| 4 | Brand deterioration | brand/quality failure flag | Cap at Avoid |
| 5 | Governance/regulatory | compliance failure | Cap at Avoid |

# 3. Override precedence

Overrides apply in the order above (harder overrides cap first); the most restrictive cap wins. Applied **after** composite computation.

# 4. Determinism

Identical composite + overrides + calibration → identical verdict.

# Status

**IES-010-D10 · Version 1.0 · Status SPECIFICATION**
