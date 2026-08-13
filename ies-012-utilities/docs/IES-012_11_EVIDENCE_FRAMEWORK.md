# IES-012 — Utilities Sector Engine

## Document 11 — UTILITIES EVIDENCE FRAMEWORK

**Document ID:** IES-012-D11
**Version:** 1.0 (DRAFT)
**Status:** SPECIFICATION

---

# Purpose

Defines the evidence produced for every utilities decision — deterministic, traceable, explainable.

# 1. Evidence record

Every decision produces:
- **engineId** — `sector.utilities`
- **verdict** — final verdict
- **composite** — composite score
- **pillars** — quality, growth, risk, profitability, capital efficiency, valuation
- **overridesApplied** — any override + rationale
- **calibrationVersion** — segment/regulatory calibration profile
- **methodologyVersion** — IES-012 v1.0

# 2. Why-rationale

Every recommendation explains:
- Why this rate-base growth / regulatory quality is attractive.
- Why this balance-sheet resilience / reliability.
- Which calibration profile (segment + regulatory posture) applies.
- Which engine produced it (`sector.utilities`).
- Confidence + supporting evidence.

# 3. Determinism

Evidence is deterministic + versioned; replay reproduces identical evidence.

# Status

**IES-012-D11 · Version 1.0 · Status SPECIFICATION**
