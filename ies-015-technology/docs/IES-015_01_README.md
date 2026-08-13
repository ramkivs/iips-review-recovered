# IES-015 — Technology Sector Engine

## Document 01 — README

**Document ID:** IES-015-D01
**Version:** 1.0 (DRAFT — pre-freeze)
**Status:** ENGINEERING STANDARD (Phase 2)

---

# IES-015 — Technology Sector Engine

**Standard:** IES-015
**Title:** Technology Sector Engine
**Program:** Program v1.1 — Track 6 (New Sector Standards)
**Version:** 1.0
**Status:** SPECIFICATION (Phase 2 — Engineering Standard)

> **Phase boundary (per Phase-1 approval instruction):** Phase 1 = conceptual principles; Phase 2 = **frozen engineering contract** (metric definitions, thresholds, bands, weights, calibration, override precedence, rounding, evidence contract, golden-output contract). Phase 1 principles do NOT automatically become frozen rules — this standard is the authoritative engineering contract.

> **Determinism contract:** All bands/verdicts use **lower-inclusive / upper-exclusive** (terminal band includes upper bound); rounding is **round-half-to-even at the composite only**; D15 resolves definitions against the named D06–D10 versions; calibration is split into **band thresholds (pre-scoring)** vs **weights/risk multipliers (post-pillar, pre-composite)**; effective band-table resolution uses **`calibratedBandTable ?? baselineBandTable`** (boundaries+scores resolve together, D15 §6a); derived-component missing-data rules are frozen; override precedence uses **min_rank(baseVerdict, all applicable caps)**.

# Purpose

Define the Technology Sector Engine methodology: metric library, score engine, formula library, calibration, decision engine, evidence framework, and validation — deterministic, platform-neutral, grounded in the Technology Methodology Principles and the Universal Investment Ontology.

# Relationship to platform

```text
IES-005 Platform ─ IES-005.1 Contracts
   └── IES-015 Technology (this standard)
   └── IES-006..014 (existing sector engines)
   └── CSIP (consumes Technology via ontology registration)
```

Technology expresses its differences through **methodology and calibration**, never platform changes.

# Document map

| Doc | Content |
|---|---|
| 01 | README |
| 02 | Executive Summary |
| 03 | Industry Model |
| 04 | Business Model |
| 05 | Methodology Principles |
| 06 | Metric Library |
| 07 | Score Engine |
| 08 | Formula Library |
| 09 | Calibration |
| 10 | Decision Engine |
| 11 | Evidence Framework |
| 12 | Validation |
| 13 | Arena Implementation Specification |
| 14 | Reference Asset Governance |
| 15 | Normative Calculation Appendix |
| 16 | Implementation Readiness Certificate |
| 17 | Master Index |
| 18 | Data Dictionary |
| 19 | Reference Data Sources |

# Status

**IES-015-D01 · Version 1.0 · Status SPECIFICATION (Phase 2)**
