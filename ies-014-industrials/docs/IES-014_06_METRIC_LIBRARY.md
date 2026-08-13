# IES-014 — Industrials Sector Engine

## Document 06 — INDUSTRIALS METRIC LIBRARY

**Document ID:** IES-014-D06
**Version:** 1.1 (DRAFT — contract-hardened)
**Status:** SPECIFICATION (Phase 2 — frozen metric definitions)

---

# Purpose

Defines the canonical industrials metrics (frozen in Phase 2). D15 resolves metric scores against **this document (v1.1)**.

# Boundary semantics (global)

All bands use **lower-inclusive / upper-exclusive**, except the terminal band which includes its upper boundary. See D15 §3.

# Universal metrics (all subsegments)

| Metric | ID | Formula | Direction |
|---|---|---|---|
| EBITDA Margin | IM-001 | EBITDA ÷ Revenue | Higher better |
| Revenue Growth | IM-002 | YoY revenue growth | Higher better |
| Debt/EBITDA (leverage) | IM-003 | Net Debt ÷ EBITDA | Lower better |
| Valuation | IM-004 | EV/EBITDA (mid-cycle) | Lower better |
| Return on Capital | IM-005 | ROCE / ROIC | Higher better |

# Industrials-specific metrics

| Metric | ID | Formula | Direction |
|---|---|---|---|
| Backlog / Order Book | IM-006 | contracted future revenue (÷ revenue) | Higher better |
| Book-to-Bill | IM-007 | orders ÷ shipments | Higher (>1) |
| Aftermarket / Services % | IM-008 | service revenue ÷ total | Higher (quality) |
| FCF Yield | IM-009 | FCF ÷ market cap | Higher better |
| Order Growth | IM-010 | YoY new orders change | Higher better |
| Operating Margin | IM-011 | op income ÷ revenue | Higher better |
| Project Risk Exposure | IM-012 | EPC/project share of revenue | Lower (risk) |

# Band tables (lower-inclusive / upper-exclusive)

## IM-001 EBITDA Margin (higher better)
| Condition | Score |
|---|---|
| `x < 8` | 40 |
| `8 ≤ x < 15` | 60 |
| `15 ≤ x < 25` | 75 |
| `25 ≤ x` | 90 |

## IM-002 Revenue Growth (higher better)
| Condition | Score |
|---|---|
| `x < 2` | 40 |
| `2 ≤ x < 5` | 60 |
| `5 ≤ x < 10` | 75 |
| `10 ≤ x` | 90 |

## IM-003 Debt/EBITDA (lower better)
| Condition | Score |
|---|---|
| `x < 1.5` | 90 |
| `1.5 ≤ x < 2.5` | 75 |
| `2.5 ≤ x < 3.5` | 55 |
| `3.5 ≤ x` | 30 |

## IM-004 Valuation EV/EBITDA (mid-cycle) (lower better)
| Condition | Score |
|---|---|
| `x < 8` | 90 |
| `8 ≤ x < 12` | 75 |
| `12 ≤ x < 16` | 60 |
| `16 ≤ x` | 40 |

## IM-005 Return on Capital (higher better)
| Condition | Score |
|---|---|
| `x < 8` | 40 |
| `8 ≤ x < 15` | 60 |
| `15 ≤ x < 25` | 75 |
| `25 ≤ x` | 90 |

## IM-006 Backlog (÷ revenue) (higher better)
| Condition | Score |
|---|---|
| `x < 1` | 40 |
| `1 ≤ x < 2` | 60 |
| `2 ≤ x < 3` | 75 |
| `3 ≤ x` | 90 |

## IM-007 Book-to-Bill (higher better)
| Condition | Score |
|---|---|
| `x < 0.9` | 40 |
| `0.9 ≤ x < 1.0` | 60 |
| `1.0 ≤ x < 1.1` | 75 |
| `1.1 ≤ x` | 90 |

## IM-008 Aftermarket % (higher better)
| Condition | Score |
|---|---|
| `x < 15` | 40 |
| `15 ≤ x < 30` | 60 |
| `30 ≤ x < 50` | 75 |
| `50 ≤ x` | 90 |

## IM-009 FCF Yield (higher better)
| Condition | Score |
|---|---|
| `x < 3` | 40 |
| `3 ≤ x < 6` | 60 |
| `6 ≤ x < 10` | 75 |
| `10 ≤ x` | 90 |

## IM-010 Order Growth (higher better)
| Condition | Score |
|---|---|
| `x < 0` | 40 |
| `0 ≤ x < 5` | 60 |
| `5 ≤ x < 10` | 75 |
| `10 ≤ x` | 90 |

## IM-011 Operating Margin (higher better)
| Condition | Score |
|---|---|
| `x < 10` | 40 |
| `10 ≤ x < 18` | 60 |
| `18 ≤ x < 28` | 75 |
| `28 ≤ x` | 90 |

## IM-012 Project Risk Exposure (lower better)
| Condition | Score |
|---|---|
| `x < 15` | 90 |
| `15 ≤ x < 30` | 75 |
| `30 ≤ x < 50` | 60 |
| `50 ≤ x` | 40 |

# Status

**IES-014-D06 · Version 1.1 · Status SPECIFICATION (frozen metric definitions + band tables)**
