# IES-011 — Energy Sector Engine

## Document 15 — NORMATIVE CALCULATION APPENDIX

**Document ID:** IES-011-D15
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION (becomes NORMATIVE at freeze)

---

# 1. Purpose

Defines the exact transformation from raw energy metrics to final verdict so any independent implementation reproduces identical outputs.

# 2. Transformation pipeline

```text
Metric → Band → Score → Pillar → Composite → (Overrides) → Verdict
```

# 3. Band → Score mapping (baseline)

## EM-001 EBITDA Margin (higher better)
| Condition | Score |
|---|---|
| > 40% | 90 |
| 25–40% | 75 |
| 15–25% | 60 |
| < 15% | 40 |

## EM-006 Production Growth (higher better)
| Condition | Score |
|---|---|
| > 10% | 90 |
| 5–10% | 75 |
| 0–5% | 60 |
| < 0% | 40 |

## EM-007 Lifting Cost (lower better)
| Condition | Score |
|---|---|
| < 20 | 90 |
| 20–35 | 75 |
| 35–50 | 60 |
| > 50 | 40 |

## EM-008 Reserve Replacement (higher better)
| Condition | Score |
|---|---|
| > 1.2 | 90 |
| 1.0–1.2 | 75 |
| 0.8–1.0 | 60 |
| < 0.8 | 40 |

## EM-003 Debt/EBITDA (lower better; segment alert)
| Condition | Score |
|---|---|
| < 1.5x | 90 |
| 1.5–2.5x | 75 |
| 2.5–3.5x | 55 |
| > 3.5x | 30 |

## EM-011 Transition/Renewables Mix (higher better)
| Condition | Score |
|---|---|
| > 40% | 90 |
| 20–40% | 75 |
| 10–20% | 60 |
| < 10% | 40 |

# 4. Pillar construction

| Pillar | Composition |
|---|---|
| Quality / Cost Position | weighted (EM-007 + reserve/asset quality) |
| Growth | EM-006 + EM-011 |
| Risk | EM-003 inverse + commodity-cycle exposure |
| Profitability | weighted (EM-001 + EM-005) |
| Capital Efficiency | EM-012 + EM-005 |
| Valuation | EM-004 (cyclical-normalized) |

# 5. Composite Score (segment baseline)

```text
Composite = Quality×0.25 + Growth×0.20 + Risk×0.15 + Profitability×0.20 + CapitalEff×0.10 + Valuation×0.10
Composite = round_half_to_even(Composite, 1)
```

# 6. Overrides (after composite)

| Override | Trigger | Effect |
|---|---|---|
| Governance/regulatory | compliance failure | cap ≤ Avoid |
| Stranded asset | material transition risk | cap ≤ Watch |
| Reserve write-down | material impairment | cap ≤ Watch |
| Cost blowout | project cost overrun | cap ≤ Watch |
| Price collapse | commodity price collapse | cap ≤ Watch |
| Leverage breach | Debt/EBITDA above alert | cap ≤ Watch |

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

**IES-011-D15 · Version 1.0 · Status SPECIFICATION**
