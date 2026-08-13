# IES-010 — Hospitality Sector Engine

## Document 15 — NORMATIVE CALCULATION APPENDIX

**Document ID:** IES-010-D15
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION (becomes NORMATIVE at freeze)

---

# 1. Purpose

Defines the exact transformation from raw hospitality metrics to final verdict so any independent implementation reproduces identical outputs.

# 2. Transformation pipeline

```text
Metric → Band → Score → Pillar → Composite → (Overrides) → Verdict
```

# 3. Band → Score mapping (baseline, per metric)

## HM-005 Occupancy (higher better)
| Condition | Score |
|---|---|
| > 80% | 90 |
| 70–80% | 75 |
| 60–70% | 60 |
| < 60% | 35 |

## HM-007 RevPAR (higher better; calibration-dependent)
| Condition | Score |
|---|---|
| > 8,000 | 90 |
| 5,000–8,000 | 75 |
| 3,000–5,000 | 60 |
| < 3,000 | 40 |

## HM-008 GOP Margin (higher better)
| Condition | Score |
|---|---|
| > 35% | 90 |
| 25–35% | 75 |
| 15–25% | 60 |
| < 15% | 40 |

## HM-009 RevPAR Growth (higher better)
| Condition | Score |
|---|---|
| > 15% | 90 |
| 8–15% | 75 |
| 3–8% | 60 |
| < 3% | 40 |

## HM-010 Asset-light / Fee Mix (higher better)
| Condition | Score |
|---|---|
| > 50% | 90 |
| 30–50% | 75 |
| 15–30% | 60 |
| < 15% | 40 |

## HM-003 Debt/EBITDA (lower better; business-model alert)
| Condition | Score |
|---|---|
| < 2.0x | 90 |
| 2.0–3.5x | 75 |
| 3.5–5.0x | 55 |
| > 5.0x | 30 |

# 4. Pillar construction

| Pillar | Composition |
|---|---|
| Occupancy / Utilization | HM-005 score |
| Demand / RevPAR | weighted (HM-007 score × 0.7 + demand-quality score × 0.3) |
| Growth | HM-009 score (+ capacity score) |
| Profitability | weighted (HM-008 × 0.6 + HM-001 × 0.4) |
| Earnings Quality | HM-010 score |
| Capital / Risk | weighted (HM-003 inverse + HM-012 score) |

# 5. Composite Score (asset-light / mixed baseline)

```text
Composite = Occupancy×0.10 + Demand/RevPAR×0.20 + Growth×0.20 + Profitability×0.15 + EarningsQuality×0.25 + CapitalRisk×0.10
Composite = round(Composite, 1)
```

# 6. Overrides (after composite)

| Override | Trigger | Effect |
|---|---|---|
| Demand shock | Occupancy collapse or severe cyclical downturn | cap verdict ≤ Watch |
| Occupancy collapse | Occupancy < 40% sustained | cap ≤ Avoid |
| Leverage breach | Debt/EBITDA above business-model alert | cap ≤ Watch |
| Brand deterioration | brand/quality failure | cap ≤ Avoid |
| Governance/regulatory | compliance failure | cap ≤ Avoid |

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

**IES-010-D15 · Version 1.0 · Status SPECIFICATION**
