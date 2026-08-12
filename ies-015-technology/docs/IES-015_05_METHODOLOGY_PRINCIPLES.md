# IES-015 — Technology Sector Engine

## Document 05 — METHODOLOGY PRINCIPLES

**Document ID:** IES-015-D05
**Version:** 1.1 (DRAFT — metric-specific band cardinality)
**Status:** SPECIFICATION

---

# 1. Purpose

The conceptual foundation for the Technology metric library and score engine. Full principles in `TECHNOLOGY_METHODOLOGY_PRINCIPLES.md` (Phase 1, approved).

# 2. Invariant principles (recap)

1. Durable recurring economics × growth × capital discipline over growth/cyclical/mature bases.
2. Recurring revenue + retention/NRR are leading quality signals.
3. Network effects + switching costs = moat (not just growth).
4. Semis/hardware cyclicality is calibration, not scoring-logic change.
5. Disruption/obsolescence is a risk dimension + override.
6. Deterministic, replayable, explainable — platform-neutral.

# 3. Calibration vs scoring

Subsegment, business-model archetype, cyclicality are **calibration** concerns (thresholds/weights), not scoring-logic changes.

# 3a. Effective band-table resolution (deterministic contract invariant)

- Calibrated band tables **supersede** the complete D15 baseline band table per metric via `effectiveBandTable = calibratedBandTable ?? baselineBandTable` (nullish-coalescing). **Boundaries AND score values resolve together** — never mixed across tables.
- Calibration modifies **band boundaries + score values** within a band table — never **band cardinality** (metric-specific and immutable; 4 for all metrics except TM-009 which is inherently 3), score ordering, or boundary semantics.
- Band-table resolution occurs **after** subsegment/archetype selection and **before** Metric → Band → Score.
- Hybrid/multi-subsegment selection yields **one unambiguous profile**; conflicting tables resolve to the **most conservative** (complete boundaries+scores).
- The resolved calibration profile version is part of the **replay identity** (D15 §6a.4).

# 4. Calibration selection precedence (normative)

```text
Subsegment
     +
Business-model archetype
     ↓
Calibration profile
     ↓
Frozen metric thresholds / weights
     ↓
Common score engine
```

# 5. Ontology mapping direction

| Ontology dimension | Technology mapping |
|---|---|
| Conviction | composite |
| Confidence | engine confidence |
| Quality | recurring revenue + retention + gross margin + IP |
| Growth | recurring revenue growth + usage + network effects |
| Risk | customer concentration + cyclicality + disruption |
| Valuation | EV/Revenue, EV/EBITDA, FCF multiple (growth/cyclical/mature) |
| Capital Efficiency | FCF yield + cash conversion |
| Moat | network effects + switching costs + IP + platform lock-in |

# Status

**IES-015-D05 · Version 1.0 · Status SPECIFICATION**
