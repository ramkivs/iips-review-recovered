# IES-012 — Utilities Sector Engine

## Document 15 — NORMATIVE CALCULATION APPENDIX

**Document ID:** IES-012-D15
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION (becomes NORMATIVE at freeze)

---

# 1. Purpose

Defines the exact transformation from raw utilities metrics to final verdict so any independent implementation reproduces identical outputs.

# 2. Transformation pipeline

```text
Metric → Band → Score → Pillar → Composite → (Overrides) → Verdict
```

# 3. Band → Score mapping (baseline)

## UM-001 EBITDA Margin (higher better)
| Condition | Score |
|---|---|
| > 45% | 90 |
| 30–45% | 75 |
| 20–30% | 60 |
| < 20% | 40 |

## UM-006 Rate Base Growth (higher better)
| Condition | Score |
|---|---|
| > 8% | 90 |
| 5–8% | 75 |
| 2–5% | 60 |
| < 2% | 40 |

## UM-008 FFO/Debt (higher better)
| Condition | Score |
|---|---|
| > 20% | 90 |
| 15–20% | 75 |
| 10–15% | 60 |
| < 10% | 40 |

## UM-009 O&M Efficiency (lower better)
| Condition | Score |
|---|---|
| < 15% | 90 |
| 15–25% | 75 |
| 25–35% | 60 |
| > 35% | 40 |

## UM-011 Reliability SAIDI (lower better)
| Condition | Score |
|---|---|
| < 100 | 90 |
| 100–200 | 75 |
| 200–300 | 60 |
| > 300 | 40 |

## UM-003 Debt/EBITDA (lower better; segment alert)
| Condition | Score |
|---|---|
| < 3.0x | 90 |
| 3.0–4.5x | 75 |
| 4.5–6.0x | 55 |
| > 6.0x | 30 |

# 4. Pillar construction

| Pillar | Composition |
|---|---|
| Quality / Regulatory | weighted (regulatory quality + O&M + reliability) |
| Growth | UM-006 + demand + transition |
| Risk | UM-003 inverse + regulatory risk |
| Profitability | weighted (UM-001 + UM-005) |
| Capital Efficiency | UM-008 + UM-005 |
| Valuation | UM-004 (defensive) |

# 5. Composite Score (regulated electric baseline)

```text
Composite = Quality×0.30 + Growth×0.20 + Risk×0.15 + Profitability×0.20 + CapitalEff×0.10 + Valuation×0.05
Composite = round_half_to_even(Composite, 1)
```

# 6. Overrides (after composite)

| Override | Trigger | Effect |
|---|---|---|
| Governance/regulatory | compliance failure | cap ≤ Avoid |
| Adverse rate case | material disallowance / low ROE | cap ≤ Watch |
| Regulatory lag | severe unrecovered cost inflation | cap ≤ Watch |
| Capex overrun | material cost overrun | cap ≤ Watch |
| Stranded asset | transition write-down | cap ≤ Watch |
| Leverage breach | FFO/Debt below threshold | cap ≤ Watch |

# 7. Verdict mapping

| Range | Verdict |
|---|---|
| 80–100 | Strong Buy |
| 70–80 | Buy |
| 60–70 | Accumulate |
| 50–60 | Hold |
| 40–50 | Watch |
| 0–40 | Avoid |

# 8. Determinism

Identical inputs + calibration version + methodology version → identical composite + verdict. Replay-identical.

# Status

**IES-012-D15 · Version 1.0 · Status SPECIFICATION**
