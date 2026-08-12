# IES-013 — Consumer Sector Engine

## Document 11 — CONSUMER EVIDENCE FRAMEWORK

**Document ID:** IES-013-D11
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the evidence produced for every consumer decision — deterministic, traceable, explainable.

# 1. Evidence record

Every decision produces:
- **engineId** — `sector.consumer`
- **verdict** — final verdict
- **composite** — composite score
- **pillars** — quality, growth, risk, profitability, capital efficiency, valuation
- **overridesApplied** — any override + rationale
- **calibrationVersion** — segment/portfolio calibration profile
- **methodologyVersion** — IES-013 v1.0

# 2. Why-rationale

Every recommendation explains:
- Why this brand/pricing-power/quality is attractive.
- Why this demand durability / growth.
- Which calibration profile (segment + business model) applies.
- Which engine produced it (`sector.consumer`).
- Confidence + supporting evidence.

# 3. Determinism

Evidence is deterministic + versioned; replay reproduces identical evidence.

# Status

**IES-013-D11 · Version 1.0 · Status SPECIFICATION**
