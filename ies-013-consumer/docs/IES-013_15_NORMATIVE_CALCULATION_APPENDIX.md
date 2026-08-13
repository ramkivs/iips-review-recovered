# IES-013 — Consumer Sector Engine

## Document 15 — NORMATIVE CALCULATION APPENDIX

**Document ID:** IES-013-D15
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION (becomes NORMATIVE at freeze)

---

# 1. Purpose

Defines the exact transformation from raw consumer metrics to final verdict so any independent implementation reproduces identical outputs.

# 2. Transformation pipeline

```text
Metric → Band → Score → Pillar → Composite → (Overrides) → Verdict
```

# 3. Band → Score mapping (baseline)

## CM-001 EBITDA Margin (higher better)
| Condition | Score |
|---|---|
| > 25% | 90 |
| 15–25% | 75 |
| 8–15% | 60 |
| < 8% | 40 |

## CM-002 Revenue Growth (higher better)
| Condition | Score |
|---|---|
| > 10% | 90 |
| 5–10% | 75 |
| 2–5% | 60 |
| < 2% | 40 |

## CM-006 Pricing Power (higher better)
| Condition | Score |
|---|---|
| > 70% price-led | 90 |
| 50–70% | 75 |
| 30–50% | 60 |
| < 30% | 40 |

## CM-007 Brand / Loyalty (higher better)
| Condition | Score |
|---|---|
| > 80% | 90 |
| 60–80% | 75 |
| 40–60% | 60 |
| < 40% | 40 |

## CM-008 Margin Resilience (higher better)
| Condition | Score |
|---|---|
| > 0.8 | 90 |
| 0.6–0.8 | 75 |
| 0.4–0.6 | 60 |
| < 0.4 | 40 |

## CM-003 Debt/EBITDA (lower better; segment alert)
| Condition | Score |
|---|---|
| < 1.5x | 90 |
| 1.5–2.5x | 75 |
| 2.5–3.5x | 55 |
| > 3.5x | 30 |

# 4. Pillar construction

| Pillar | Composition |
|---|---|
| Quality / Brand | weighted (pricing power + brand/loyalty + margin resilience) |
| Growth | CM-002 + innovation |
| Risk | CM-003 inverse + private-label + cyclicality |
| Profitability | weighted (CM-001 + CM-005) |
| Capital Efficiency | CM-010 + CM-005 |
| Valuation | CM-004 |

# 5. Composite Score (staples baseline)

```text
Composite = Quality×0.35 + Growth×0.15 + Risk×0.15 + Profitability×0.20 + CapitalEff×0.10 + Valuation×0.05
Composite = round_half_to_even(Composite, 1)
```

# 6. Overrides (after composite)

| Override | Trigger | Effect |
|---|---|---|
| Governance/regulatory | compliance/food-safety failure | cap ≤ Avoid |
| Brand erosion | material brand/quality failure | cap ≤ Avoid |
| Category disruption | material disruption / share collapse | cap ≤ Watch |
| Input-cost squeeze | severe margin compression | cap ≤ Watch |
| Channel loss | major distribution loss | cap ≤ Watch |
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

**IES-013-D15 · Version 1.0 · Status SPECIFICATION**
