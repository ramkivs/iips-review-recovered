# IES-014 — Industrials Calibration Independence Matrix

**Standard:** IES-014 — Industrials Sector Engine
**Phase:** 4 — Architecture Review
**Version:** 1.0
**Date:** 2026-08-09
**Status:** ARCHITECTURE REVIEW ARTIFACT

> **Purpose.** Demonstrate that the scoring engine remains common; calibration selects weights/thresholds only; overrides stay deterministic; subsegment/archetype differences affect calibration only, never platform behavior.

---

## 1. Calibration independence

| Scenario | Subsegment | Archetype | Calibration profile | Score engine used | Override path | Expected result |
|---|---|---|---|---|---|---|
| Capital goods OEM leader | capital-goods | oem | C-CG | common | none | Buy |
| Aero defense prime | aero-defense | oem | C-AD | common | none | Buy |
| Transportation logistics | transportation | aftermarket | C-TR | common | none | Accumulate |
| E&C project house | eandc | epc | C-EC | common | none | Accumulate |
| Electrical equipment | electrical-equipment | distributor | C-EE | common | none | Buy |
| Diversified conglomerate | diversified | diversified | C-DV | common | none | Buy |
| Demand shock | capital-goods | oem | C-CG | common | order-cancellation | Watch |
| Defense program failure | aero-defense | oem | C-AD | common | defense-program | Watch |
| EPC cost overrun | eandc | epc | C-EC | common | epc-overrun | Watch |
| Margin compression + leverage | capital-goods | oem | C-CG | common | margin-compression (+leverage) | Watch |

## 2. Independence findings

- **Score engine is common** across all scenarios/subsegments/archetypes.
- **Calibration** selects composite pillar weights + archetype risk multiplier only.
- **Overrides** remain deterministic (min-rank over all applicable caps).
- **Subsegment/archetype** differences affect calibration only, never scoring-logic or platform behavior.
- **CSIP compatibility**: ontology registration only; zero CSIP change.

## 3. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.**
