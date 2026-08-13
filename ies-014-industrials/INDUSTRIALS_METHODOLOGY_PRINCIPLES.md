# IES-014 — Industrials Methodology Principles (Phase 1)

**Standard:** IES-014 — Industrials Sector Engine
**Stage:** Phase 1 — Methodology Principles
**Status:** PRINCIPLES (conceptual foundation — precedes Engineering Standard)
**Date:** 2026-08-09
**Prior:** IES-014 Gate 0 — Discovery Pack (Approved)

> **Scope boundary (per Phase 1 guardrails):** This document defines **methodology, not implementation**. It establishes the conceptual investment framework that will guide the Metric Library, Score Engine, Calibration, and Decision Engine in Phase 2, while remaining platform-neutral and implementation-independent.

---

## 1. Industrials economic thesis

Industrials value is driven by **visible demand (backlog/orders) × execution quality (margins/aftermarket mix) × capital discipline (returns/allocation)**, all over a **cyclical demand base**. Durable value comes from converting a cyclical top-line into a **recurring, high-margin service/aftermarket stream** and from **low-cost manufacturing with operating leverage**, rather than from peak-cycle volume alone.

## 2. Sector / subsegment taxonomy

| Subsegment | Description | Cyclicality |
|---|---|---|
| Capital Goods | machinery, equipment, tools | High |
| Aerospace & Defense | civil aero, defense primes | Moderate (long backlogs) |
| Transportation | rail, trucking, logistics, airlines | High |
| Engineering & Construction (E&C) | project/EPC | High (project) |
| Electrical Equipment | components, electrification | Moderate |
| Conglomerates / Diversified | multi-business | Moderate |

## 3. Business-model archetypes

| Archetype | Economics | Recurring revenue |
|---|---|---|
| OEM | equipment sale, volume/price | Low |
| Aftermarket / Service | high-margin, sticky, counter-cyclical | High |
| Project / EPC | lump-sum, execution risk | Low |
| Distributor | volume, working capital | Moderate |
| Diversified portfolio | mix of the above | Varies |

## 4. Metric library (candidate — not frozen)

- **Revenue growth** — organic volume + price.
- **Backlog / Order book** — future revenue visibility.
- **Book-to-bill** — demand vs shipments.
- **Aftermarket / Services revenue %** — recurring, high-margin mix.
- **EBITDA / Operating margin** — profitability + operating leverage.
- **FCF yield** — cash conversion.
- **Order growth** — new orders trend.
- **Debt/EBITDA** — leverage.

## 5. Metric directionality & normalization

- **Higher better:** revenue growth, backlog, book-to-bill, aftermarket %, EBITDA margin, FCF yield, order growth.
- **Lower better:** debt/EBITDA, project risk.
- **Normalization:** cyclical metrics (revenue/margin) normalized across the cycle (mid-cycle), not peak/trough.

## 6. Quality / Growth / Risk / Valuation / Capital Efficiency / Moat dimensions

| Dimension | Industrials mapping |
|---|---|
| Quality | aftermarket mix, cost position, program execution |
| Growth | backlog, orders, volume growth |
| Risk | cyclicality, project/program risk, leverage |
| Valuation | P/E, EV/EBITDA, FCF yield, PEG |
| Capital Efficiency | ROCE, FCF yield, capital return |
| Moat | aftermarket/service lock-in, technology, scale, defense franchise |

## 7. Cyclicality treatment

- Industrials is **not homogeneous/defensive**; cyclicality varies by subsegment.
- Cyclicality is a **calibration** concern (subsegment risk weighting), not a scoring-logic change.
- Valuation/margin normalization across the cycle (mid-cycle) avoids peak/trough distortion.

## 8. Backlog and book-to-bill semantics

- **Backlog/order book** = contracted future revenue → revenue visibility (a leading quality/growth signal).
- **Book-to-bill** = orders ÷ shipments; >1 implies growing backlog; <1 implies shrinkage.

## 9. Aftermarket / service economics

- Recurring, high-margin, counter-cyclical service revenue is a **leading quality signal** (diversifies cyclical equipment sales).
- Higher aftermarket mix → higher earnings quality + moat (installed-base lock-in).

## 10. Project / EPC risk treatment

- EPC/project revenue carries **execution risk** (overruns, delays, contract disputes).
- Project risk is a **risk dimension** + potential override (cost overrun), not part of base scoring.

## 11. Defense / aerospace-specific risk treatment

- Long, visible backlogs but **program risk** (schedule, cost, certification, export control).
- Defense/aerospace is **moderate-cyclical** with high visibility; program risk is a risk dimension + potential override.

## 12. Capital-efficiency treatment

- ROCE, FCF yield, and capital return (buyback/dividend) are quality signals.
- M&A and capex discipline matter (value-destructive M&A = risk).

## 13. Valuation methodology

- Cyclical-normalized multiples (mid-cycle EBITDA/earnings): P/E, EV/EBITDA, FCF yield, PEG.
- Never peak- or trough-cycle multiples.

## 14. Hard gates / overrides (if justified)

Candidate override families (to be finalized in Phase 2 / Decision Engine):
- Order cancellation / demand shock.
- Project / EPC cost overrun.
- Defense program failure (schedule/certification).
- Margin compression.
- Leverage breach.
- Governance / compliance.

## 15. Universal Investment Ontology mapping

Industrials registers the 8 ontology dimensions (Conviction, Confidence, Quality, Growth, Risk, Valuation, Capital Efficiency, Moat) via ontology registration — **zero CSIP change**.

## 16. Deterministic calculation requirements

- Deterministic band→score→pillar→composite→override→verdict pipeline.
- Round-half-to-even composite rounding.
- Replay byte-identical; no `Math.random`/`Date.now`.

## 17. Evidence requirements

- Every decision: engineId, verdict, composite, pillars, overrides, calibration version, methodology version.
- Why-rationale (why this backlog/aftermarket/cyclicality).

## 18. Golden-dataset requirements

- Providers across subsegments (capital goods, aero/defense, transport, E&C, electrical, diversified) + business-model archetypes + override scenarios.
- Deterministic, versioned, evidence-backed.

## 19. What is explicitly NOT part of the methodology

- **Implementation logic** (module structure, plugin wiring) — deferred to WP-3.
- **Specific threshold values** — finalized in Phase 2 calibration.
- **Frozen metric weights** — finalized in Phase 2 calibration.
- **Golden-dataset rows** — built in Phase 3.
- **Any platform/runtime/CSIP change** — never part of sector methodology.
- **Price-based correlation / market data** — out of scope (platform metadata only).

---

## Status

**PHASE 1 COMPLETE (Principles)** — awaiting approval before IES-014 Phase 2 (Engineering Standard).
