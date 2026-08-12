# IES-015 — Technology Calibration Independence Matrix

**Standard:** IES-015 — Technology Sector Engine
**Phase:** 4 — Architecture Review
**Version:** 1.0
**Date:** 2026-08-09
**Status:** ARCHITECTURE REVIEW ARTIFACT

> **Purpose.** Demonstrate that the scoring engine remains **common**; calibration selects Technology-specific parameters (subsegment weights, archetype risk multiplier, and metric band tables) only; the effective band-table operator, conservative resolution, and overrides stay deterministic and do **not** create scoring-engine branches.

---

## 1. Calibration independence (13 golden providers)

| Scenario | Subsegment | Archetype | Profile | Score engine | Effective band-table resolution | Override path | Expected result |
|---|---|---|---|---|---|---|---|
| SaaS leader | software-saas | subscription | C-SS | common | TM-007 calibrated (boundaries+scores) | none | Buy |
| IT services integrator | it-services | services-project | C-IS | common | baseline fallback | none | Accumulate |
| Semiconductor foundry | semiconductors | foundry-manufacturing | C-SC | common | TM-008 + TM-011 calibrated | none | Buy |
| Electronics hardware OEM | electronics-hardware | hardware | C-EH | common | baseline fallback | none | Accumulate |
| Digital marketplace | digital-platforms | transaction-platform | C-DP | common | TM-006 calibrated | none | Strong Buy |
| Consumer internet app | internet-consumer-tech | usage-based | C-IC | common | baseline fallback | leverage-breach + margin-compression | Watch |
| Cybersecurity vendor | cybersecurity | license | C-CY | common | baseline fallback | none | Strong Buy |
| Data infrastructure | data-infrastructure | managed-services | C-DI | common | baseline fallback (missing primitives) | none | Accumulate |
| Tech-enabled hybrid | tech-enabled-services | managed-services (hybridDominant) | C-TE | common | baseline fallback | none | Accumulate |
| Platform+SaaS multi-subsegment | digital-platforms (subsegmentDominant) | subscription | C-DP | common | TM-006 calibrated | none | Buy |
| Multi-subsegment no dominant | digital-platforms (most conservative) | usage-based | C-DP | common | TM-006 calibrated | none | Buy |
| Rounding half-even boundary | it-services | license | C-IS | common | baseline fallback | none | Watch |
| Governance-risk startup | software-saas | subscription | C-SS | common | TM-007 calibrated | governance (+ leverage-breach) | Avoid |

## 2. Independence findings

- **Score engine is common** across all 13 scenarios / all 9 subsegments / all 9 archetypes. No subsegment or archetype introduces a scoring-logic branch.
- **Calibration selects only permitted Technology parameters:**
  - subsegment composite weights (wQ..wV) + leverage alert,
  - archetype risk multiplier (applied to Risk weight only),
  - metric band tables (calibrated `??` baseline, boundaries + scores together).
- **Effective band-table operator** (`effectiveBandTable = calibrated ?? baseline`) is calibration-only and immutable; it does not alter the common Metric→Band→Score→Pillar→Composite pipeline.
- **Band-table isolation:** a calibrated table is a single immutable `(lowerBound, upperBound, score)` object; boundaries and score values always resolve together — never mixed with baseline.
- **Metric-cardinality integrity:** band cardinality is metric-specific and immutable; TM-009 = **3 bands**; a band-count-mismatched calibrated table is rejected and falls back to baseline (defect → alert).
- **Conservative band operator:** `conservativeBandTable()` is deterministic and composite-lowering (min score in both directions) — a pure resolution function, not a branch.
- **Overrides remain deterministic:** `finalVerdict = min_rank(baseVerdict, all applicable caps)`; evaluation order is audit-only (governance → disruption → churn → customer-loss → capex-overrun → margin → leverage).
- **Subsegment/archetype** differences affect calibration only, never scoring-logic or platform behavior.
- **CSIP compatibility:** ontology registration only; zero CSIP change.

## 3. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.**
