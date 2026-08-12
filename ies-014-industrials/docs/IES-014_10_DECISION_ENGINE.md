# IES-014 — Industrials Sector Engine

## Document 10 — INDUSTRIALS DECISION ENGINE

**Document ID:** IES-014-D10
**Version:** 1.1 (DRAFT — contract-hardened)
**Status:** SPECIFICATION (Phase 2 — frozen override + verdict contract)

---

# Purpose

Maps the composite score + overrides to a final verdict, deterministically. D15 resolves override precedence + verdict mapping against **this document (v1.1)**.

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
| Governance/regulatory | compliance/export-control failure | Avoid |
| Order cancellation / demand shock | material cancellation / demand collapse | Watch |
| EPC cost overrun | material project overrun | Watch |
| Defense program failure | material schedule/certification failure | Watch |
| Margin compression | severe margin compression | Watch |
| Leverage breach | Debt/EBITDA above subsegment alert | Watch |

# 3. Override precedence (explicit, ordered)

When multiple overrides trigger simultaneously, apply in **exact order**; the most restrictive cap (lowest verdict rank) that is reached wins.

| Priority | Override | Cap |
|---|---|---|
| 1 | Governance / regulatory | Avoid |
| 2 | Defense program failure | Watch |
| 3 | EPC cost overrun | Watch |
| 4 | Order cancellation / demand shock | Watch |
| 5 | Margin compression | Watch |
| 6 | Leverage breach | Watch |

**Formal operator:** `finalVerdict = min_rank(baseVerdict, all applicable override caps)`. The final verdict is the **lowest verdict rank** (most restrictive) among the base verdict and the caps of **all** simultaneously-triggered overrides. The 1→6 priority ordering is the **audit/evaluation order** (deterministic, documented); it does NOT select which cap survives — min-rank over all applicable caps does.

# 4. Determinism

Identical composite + overrides + calibration → identical verdict.

# Status

**IES-014-D10 · Version 1.1 · Status SPECIFICATION (frozen override + verdict contract)**
