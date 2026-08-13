# IES-011 — Energy Sector Engine

## Document 11 — ENERGY EVIDENCE FRAMEWORK

**Document ID:** IES-011-D11
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the evidence produced for every energy decision — deterministic, traceable, explainable.

# 1. Evidence record

Every decision produces:
- **engineId** — `sector.energy`
- **verdict** — final verdict
- **composite** — composite score
- **pillars** — quality, growth, risk, profitability, capital efficiency, valuation
- **overridesApplied** — any override + rationale
- **calibrationVersion** — segment calibration profile used
- **methodologyVersion** — IES-011 v1.0

# 2. Why-rationale

Every recommendation explains:
- Why this cost position / reserve quality is attractive.
- Why this production/transition growth.
- Which calibration profile (segment + commodity exposure) applies.
- Which engine produced it (`sector.energy`).
- Confidence + supporting evidence.

# 3. Determinism

Evidence is deterministic + versioned; replay reproduces identical evidence.

# Status

**IES-011-D11 · Version 1.0 · Status SPECIFICATION**
