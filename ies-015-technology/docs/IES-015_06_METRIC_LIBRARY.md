# IES-015 — Technology Sector Engine

## Document 06 — TECHNOLOGY METRIC LIBRARY

**Document ID:** IES-015-D06
**Version:** 1.1 (DRAFT — TM-009 corrected to inherent 3-band cardinality)
**Status:** SPECIFICATION (Phase 2 — frozen metric definitions)

---

# Purpose

Defines the canonical technology metrics (frozen in Phase 2). D15 resolves metric scores against **this document (v1.0)**.

# Boundary semantics (global)

All bands use **lower-inclusive / upper-exclusive**, except the terminal band which includes its upper boundary.

# Calibrated band tables

The band tables below are the **baseline**. A calibration profile may override them via calibrated band tables (D09 §6), resolved by the Effective Band-Table Resolution operator (D15 §6a): `effectiveBandTable = calibratedBandTable ?? baselineBandTable` (boundaries AND score values resolve together). **Band cardinality is metric-specific and immutable** (D15 §6a.2): every metric except TM-009 has **4 bands**; TM-009 (R&D Intensity) is **inherently 3 bands**. A calibrated table must preserve the baseline band cardinality for its metric; it may modify boundaries and score values but never the number of bands. Each band is `(lowerBound, upperBound, score)`, preserving the global boundary semantics and monotonic ordering.

# Universal metrics (all subsegments)

| Metric | ID | Formula | Direction |
|---|---|---|---|
| EBITDA Margin | TM-001 | EBITDA ÷ Revenue | Higher better |
| Revenue Growth | TM-002 | YoY revenue growth | Higher better |
| Debt/EBITDA (leverage) | TM-003 | Net Debt ÷ EBITDA | Lower better |
| Valuation | TM-004 | EV/Revenue or EV/EBITDA (context) | Contextual |
| Cash Conversion / FCF Yield | TM-005 | FCF ÷ market cap | Higher better |

# Technology-specific metrics

| Metric | ID | Formula | Direction |
|---|---|---|---|
| Recurring Revenue % | TM-006 | recurring ÷ total revenue | Higher (quality) |
| Net Revenue Retention (NRR) | TM-007 | (ARPU expansion − churn) | Higher (>100) |
| Gross Margin | TM-008 | gross profit ÷ revenue | Higher (quality) |
| R&D Intensity | TM-009 | R&D ÷ revenue | Contextual |
| Customer Concentration | TM-010 | top-customer revenue share | Lower (risk) |
| Capex Intensity | TM-011 | capex ÷ revenue | Contextual (semis/hardware) |
| Usage / Platform Growth | TM-012 | usage/transaction growth | Higher (growth) |

# Band tables (lower-inclusive / upper-exclusive)

## TM-001 EBITDA Margin (higher better)
| Condition | Score |
|---|---|
| `x < 10` | 40 |
| `10 ≤ x < 20` | 60 |
| `20 ≤ x < 30` | 75 |
| `30 ≤ x` | 90 |

## TM-002 Revenue Growth (higher better)
| Condition | Score |
|---|---|
| `x < 5` | 40 |
| `5 ≤ x < 15` | 60 |
| `15 ≤ x < 25` | 75 |
| `25 ≤ x` | 90 |

## TM-003 Debt/EBITDA (lower better)
| Condition | Score |
|---|---|
| `x < 1.0` | 90 |
| `1.0 ≤ x < 2.0` | 75 |
| `2.0 ≤ x < 3.0` | 55 |
| `3.0 ≤ x` | 30 |

## TM-004 Valuation EV/Revenue (growth) or EV/EBITDA (lower better in cyclical/mature)
| Condition | Score |
|---|---|
| `x < 8` (EV/Revenue) | 90 |
| `8 ≤ x < 12` | 75 |
| `12 ≤ x < 16` | 60 |
| `16 ≤ x` | 40 |

## TM-005 FCF Yield (higher better)
| Condition | Score |
|---|---|
| `x < 2` | 40 |
| `2 ≤ x < 4` | 60 |
| `4 ≤ x < 7` | 75 |
| `7 ≤ x` | 90 |

## TM-006 Recurring Revenue % (higher better)
| Condition | Score |
|---|---|
| `x < 30` | 40 |
| `30 ≤ x < 50` | 60 |
| `50 ≤ x < 75` | 75 |
| `75 ≤ x` | 90 |

## TM-007 NRR (higher better)
| Condition | Score |
|---|---|
| `x < 95` | 40 |
| `95 ≤ x < 105` | 60 |
| `105 ≤ x < 115` | 75 |
| `115 ≤ x` | 90 |

## TM-008 Gross Margin (higher better)
| Condition | Score |
|---|---|
| `x < 30` | 40 |
| `30 ≤ x < 50` | 60 |
| `50 ≤ x < 70` | 75 |
| `70 ≤ x` | 90 |

## TM-009 R&D Intensity (contextual — higher is growth-positive but not unbounded; **inherently 3-band**)
| Condition | Score |
|---|---|
| `x < 5` | 40 |
| `5 ≤ x < 10` | 60 |
| `10 ≤ x` | 75 |

## TM-010 Customer Concentration (lower better)
| Condition | Score |
|---|---|
| `x < 10` | 90 |
| `10 ≤ x < 25` | 75 |
| `25 ≤ x < 50` | 60 |
| `50 ≤ x` | 40 |

## TM-011 Capex Intensity (contextual — semis/hardware higher; software lower)
| Condition | Score |
|---|---|
| `x < 5` | 90 |
| `5 ≤ x < 15` | 75 |
| `15 ≤ x < 30` | 60 |
| `30 ≤ x` | 40 |

## TM-012 Usage / Platform Growth (higher better)
| Condition | Score |
|---|---|
| `x < 5` | 40 |
| `5 ≤ x < 15` | 60 |
| `15 ≤ x < 30` | 75 |
| `30 ≤ x` | 90 |

# Status

**IES-015-D06 · Version 1.0 · Status SPECIFICATION (frozen metric definitions + band tables)**
