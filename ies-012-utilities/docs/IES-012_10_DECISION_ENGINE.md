# IES-012 — Utilities Sector Engine

## Document 10 — UTILITIES DECISION ENGINE

**Document ID:** IES-012-D10
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
| 2 | Adverse rate case | material disallowance / low allowed ROE | Cap at Watch |
| 3 | Regulatory lag | severe unrecovered cost inflation | Cap at Watch |
| 4 | Capex overrun | material cost overrun not recovered | Cap at Watch |
| 5 | Stranded asset | transition asset write-down | Cap at Watch |
| 6 | Leverage breach | FFO/Debt below threshold / high leverage | Cap at Watch |

# 3. Override precedence

Overrides apply in order above (harder caps first); the most restrictive cap wins. Applied **after** composite computation.

# 4. Determinism

Identical composite + overrides + calibration → identical verdict.

# Status

**IES-012-D10 · Version 1.0 · Status SPECIFICATION**
