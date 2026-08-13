# IES-010 — Hospitality Ontology Registration Review

**Standard:** IES-010 — Hospitality Sector Engine
**Phase:** 4 — Architecture Review
**Version:** 1.0
**Date:** 2026-08-08
**Status:** ARCHITECTURE REVIEW ARTIFACT

> **Purpose.** Verify Hospitality's ontology registration covers all 8 Universal Investment Ontology dimensions **without any CSIP modification** — a key architectural proof point, since Hospitality is the first sector designed after CSIP exists.

---

## 1. Ontology registration coverage

| Ontology dimension | Hospitality source | Mapped | CSIP change needed? |
|---|---|---|---|
| **Conviction** | composite score | ✅ | No |
| **Confidence** | engine confidence | ✅ | No |
| **Quality** | asset-light earnings quality + demand quality | ✅ | No |
| **Growth** | RevPAR growth + capacity expansion | ✅ | No |
| **Risk** | leverage + cyclicality | ✅ | No |
| **Valuation** | EV/EBITDA, P/RevPAR multiples | ✅ | No |
| **Capital Efficiency** | ROIC + capital recycling | ✅ | No |
| **Moat** | brand + distribution + loyalty | ✅ | No |

**Result:** all 8 ontology dimensions covered; **zero CSIP modification required**.

## 2. Ontology metadata (engine-declared)

Hospitality registers its ontology metadata like other engines (Ontology Consistency Matrix pattern):

```text
Hospitality Engine → {
  composite → Conviction
  confidence → Confidence
  qualityScore → Quality
  growthScore → Growth
  riskScore → Risk
  valuationScore → Valuation
  capitalEfficiency → Capital Efficiency
  franchiseScore → Moat
  calibrationVersion, methodologyVersion, replayMetadata
}
```

## 3. CSIP compatibility proof

- CSIP consumes only normalized ontology dimensions (never raw sector metrics).
- A new engine (Hospitality) registers its 8-dimension metadata → immediately participates in ranking + portfolio intelligence.
- **No CSIP logic change** — verified conceptually against the CSIP Ontology Mapper (default registration row covers new sectors).
- Hospitality's Moat maps to the ontology's Moat dimension, so CSIP can rank it cross-sector.

## 4. Result

**HOSPITALITY ONTOLOGY REGISTRATION — COMPLETE AND COMPATIBLE.** All 8 dimensions covered; CSIP unchanged.

## 5. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.** Ontology + CSIP compatibility confirmed.
