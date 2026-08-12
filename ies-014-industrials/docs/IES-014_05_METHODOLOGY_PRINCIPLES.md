# IES-014 — Industrials Sector Engine

## Document 05 — METHODOLOGY PRINCIPLES

**Document ID:** IES-014-D05
**Version:** 1.1 (DRAFT — contract-hardened)
**Status:** SPECIFICATION

---

# 1. Purpose

The conceptual foundation for the Industrials metric library and score engine. Full principles in `INDUSTRIALS_METHODOLOGY_PRINCIPLES.md` (Phase 1, approved). This document (D05) is a **principles recap**; the frozen normative contract is D15 + D06–D10 v1.1.

# 2. Invariant principles (recap)

1. Visible demand (backlog/orders) × execution quality × capital discipline over a cyclical base.
2. Aftermarket/service conversion drives durable value.
3. Cyclicality is a calibration concern, not scoring-logic change.
4. Valuation/margin normalized across the cycle.
5. EPC/project and defense/aerospace risk are risk dimensions + overrides.
6. Deterministic, replayable, explainable — platform-neutral.

# 3. Deterministic contract invariants (frozen)

- **Boundary semantics:** all bands/verdicts use lower-inclusive / upper-exclusive; terminal band includes upper bound.
- **Rounding:** round-half-to-even at the composite only; no intermediate pillar rounding.
- **Primitive missing metrics:** contribute 0; pillar renormalized to available subset.
- **Derived-component missing rule:** derived components computed from available constituents with renormalized weights; all-unavailable → derived unavailable → parent renormalizes (D15 §5.2).
- **Calibration parameter order:** band thresholds BEFORE scoring; weights/risk multipliers AFTER pillar construction, BEFORE composite (D15 §6).
- **Override precedence:** explicit ordered list; most restrictive cap wins (see D10).
- **Normative resolution:** D15 resolves definitions against D06–D10 v1.2.

# 3. Calibration vs scoring

Subsegment, business-model archetype, cyclicality are **calibration** concerns (thresholds/weights), not scoring-logic changes.

# 4. Ontology mapping direction

| Ontology dimension | Industrials mapping |
|---|---|
| Conviction | composite |
| Confidence | engine confidence |
| Quality | aftermarket mix + cost position + execution |
| Growth | backlog + orders + volume growth |
| Risk | cyclicality + project/program risk |
| Valuation | P/E, EV/EBITDA, FCF yield, PEG |
| Capital Efficiency | ROCE, FCF yield, capital return |
| Moat | aftermarket lock-in + technology + scale + defense franchise |

# Status

**IES-014-D05 · Version 1.0 · Status SPECIFICATION**
