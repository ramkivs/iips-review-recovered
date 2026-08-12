# IES-015 — Technology Methodology Principles (Phase 1)

**Standard:** IES-015 — Technology Sector Engine
**Stage:** Phase 1 — Methodology Principles
**Status:** PRINCIPLES (conceptual foundation — precedes Engineering Standard)
**Date:** 2026-08-09
**Prior:** IES-015 Gate 0 — Discovery Pack (Approved)

> **Scope boundary (per Phase-1 guardrail):** This document defines **methodology concepts, not engineering decisions**. It does NOT freeze thresholds, weights, calibration values, override triggers, formulas, golden outputs, or implementation logic — those belong to the Engineering Standard (Phase 2) and later.

---

## 1. Technology investment thesis

Technology value is driven by **durable recurring economics (retention/NRR + gross margin) × growth (usage/network effects/R&D pipeline) × capital discipline (cash conversion)**, over an economic base that varies from **growth-heavy (software/platform/cloud)** to **cyclical (semiconductors/hardware)** to **mature (IT services)**. Durable value comes from high-retention, high-margin, recurring revenue with strong switching costs and a compounding network/platform effect — not from one-time revenue or peak growth alone.

## 2. Subsegment taxonomy & economic differentiation

| Subsegment | Primary economics |
|---|---|
| Software / SaaS | recurring, high margin |
| IT Services | services/project |
| Semiconductors | capital-intensive, cyclical |
| Electronics / Hardware | hardware, volume/margin |
| Digital Platforms | transaction/network effects |
| Internet / Consumer Tech | usage/transaction |
| Cybersecurity | recurring + services |
| Data / Infrastructure | usage/contractual |
| Tech-enabled Services | services + tech leverage |

These are **economically distinct**; they should not be calibrated as generic Technology variants without establishing their economic semantics.

## 3. Nine business-model archetypes

License · Subscription · Usage-based · Transaction/Platform · Hardware · Foundry/Manufacturing · Services/Project · Managed Services · Hybrid.

Subscription vs semiconductor/foundry economics differ materially (recurring margin vs capital-intensity/cyclicality); archetype separation is foundational.

## 4. Recurring-revenue economics

Recurring revenue (subscription/usage/managed) is **durable and high-margin**. It is a leading quality signal and reduces revenue volatility relative to one-time license/hardware.

## 5. Retention / NRR semantics

- **Retention** = customer staying (gross/net retention).
- **NRR (net revenue retention)** = revenue expansion from existing customers (upsell/cross-sell) minus churn. NRR > 100% implies compounding existing-base growth without new-customer spend.

## 6. Gross-margin economics

Gross margin is **the** differentiator between software (high, recurring) and hardware/semis (lower, COGS/capex-heavy). It signals pricing power + scalability.

## 7. R&D / IP economics

R&D intensity funds the innovation pipeline that sustains growth + moat. IP (patents, software, process) underpins switching costs and product differentiation. Over-spend without productization is value-destructive.

## 8. Network effects and switching costs

- **Network effects** — value grows with users/participants → compounding moat + usage growth.
- **Switching costs** — cost/effort to leave → retention + pricing power.
Both are core moat signals (UIO Moat).

## 9. Customer-concentration treatment

High customer concentration is a **risk** signal (revenue dependence on few customers). Diversification of the revenue base improves quality.

## 10. Semiconductor / hardware cyclicality

Semis/hardware are **cyclical** (demand/capex cycles) — treated as a risk dimension via calibration, not scoring-logic change (consistent with platform convention).

## 11. Hardware vs software capital intensity

Software: low capex, high FCF conversion. Hardware/semis: high capex, capital-intensity. Capital-efficiency treatment must differ by archetype (calibration).

## 12. Platform / network-effect economics

Platforms earn **take-rate/transaction** revenue that scales with usage, with strong network effects and high incremental margins. Platform economics differ from both software-license and hardware.

## 13. Technology disruption / obsolescence

Rapid innovation cycles create **disruption/obsolescence risk** — a risk dimension + potential override (product obsolescence / category disruption), not base scoring.

## 14. Valuation philosophy

Valuation must vary by economics:
- **Growth-heavy** (SaaS/platform): EV/Revenue, P/S, FCF multiple, EV/EBITDA (normalized).
- **Cyclical** (semis/hardware): mid-cycle normalized EV/EBITDA, P/E, FCF.
- **Mature** (IT services): P/E, EV/EBITDA, FCF yield, dividend.
Peak growth or trough cycle must not drive valuation.

## 15. Risk architecture

- Cyclicality (semis/hardware), customer concentration, disruption/obsolescence, capex intensity, retention/churn decline, regulatory (privacy/security/antitrust/export).
- Risk is a dimension + overrides (churn collapse, disruption, customer-loss, capex overrun, governance), applied deterministically after composite.

## 16. Calibration philosophy

Subsegment + business-model archetype drive calibration (weights/thresholds). Calibration expresses economic differences; the scoring engine stays common. Thresholds/weights are **not** frozen in Phase 1.

## 17. UIO mapping

Technology registers the 8 ontology dimensions (Conviction, Confidence, Quality, Growth, Risk, Valuation, Capital Efficiency, Moat) via ontology registration — **zero CSIP change**. (Mapping direction per Discovery Pack §10.)

## 18. Deterministic execution principles

- Deterministic band→score→pillar→composite→override→verdict pipeline.
- Round-half-to-even at composite (frozen in Phase 2).
- Replay byte-identical; no `Math.random`/`Date.now`.
- Consistent with the platform-wide Deterministic Engine Execution Standard.

## 19. Explicit non-methodology boundaries

- **Not frozen in Phase 1:** thresholds, weights, calibration values, override triggers, formulas, golden outputs, implementation logic.
- **Not part of any sector methodology:** platform/runtime/CSIP changes; price-based correlation/market data; implementation module structure.
- These are deferred to the Engineering Standard (Phase 2) + Reference Assets (Phase 3) + Implementation (WP-3).

---

## Status

**PHASE 1 COMPLETE (Principles)** — awaiting approval before IES-015 Phase 2 (Engineering Standard).
