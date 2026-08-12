# IES-014 — Industrials Sector Engine

## Document 11 — INDUSTRIALS EVIDENCE FRAMEWORK

**Document ID:** IES-014-D11
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION (Phase 2 — frozen evidence contract)

---

# Purpose

Defines the evidence produced for every industrials decision — deterministic, traceable, explainable.

# 1. Evidence record

Every decision produces:
- **engineId** — `sector.industrials`
- **verdict** — final verdict
- **composite** — composite score
- **pillars** — quality, growth, risk, profitability, capital efficiency, valuation
- **overridesApplied** — any override + rationale
- **calibrationVersion** — subsegment/archetype calibration profile
- **methodologyVersion** — IES-014 v1.0

# 2. Why-rationale

Every recommendation explains:
- Why this backlog/aftermarket/quality is attractive.
- Why this order/volume growth.
- Which calibration profile (subsegment + archetype) applies.
- Which engine produced it (`sector.industrials`).
- Confidence + supporting evidence.

# 3. Determinism

Evidence is deterministic + versioned; replay reproduces identical evidence.

# Status

**IES-014-D11 · Version 1.0 · Status SPECIFICATION (frozen evidence contract)**
