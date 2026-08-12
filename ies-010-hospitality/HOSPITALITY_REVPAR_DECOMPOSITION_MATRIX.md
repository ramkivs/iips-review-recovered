# IES-010 — RevPAR Decomposition Matrix

**Standard:** IES-010 — Hospitality Sector Engine
**Phase:** 3 — Reference Assets
**Version:** 1.0
**Date:** 2026-08-08
**Status:** REFERENCE ASSET

> **Purpose.** Since RevPAR is the sector's defining KPI, explicit decomposition scenarios simplify golden dataset design.

---

## 1. RevPAR ↑ (improvement)

```text
RevPAR ↑
 ├─ Occupancy-driven   (Occupancy up, ADR flat)
 ├─ ADR-driven         (ADR up, Occupancy flat)
 └─ Balanced           (Occupancy + ADR both up)
```

## 2. RevPAR ↓ (deterioration)

```text
RevPAR ↓
 ├─ Occupancy decline   (Occupancy down, ADR flat)
 ├─ ADR discounting     (ADR down, Occupancy flat)
 └─ Combined            (both down)
```

## 3. Scenario examples

| Scenario | Occupancy | ADR | RevPAR | Type |
|---|---|---|---|---|
| Recovery via occupancy | ↑ | flat | ↑ | occupancy-driven ↑ |
| Rate-led pricing power | flat | ↑ | ↑ | ADR-driven ↑ |
| Balanced recovery | ↑ | ↑ | ↑ | balanced ↑ |
| Demand loss | ↓ | flat | ↓ | occupancy decline ↓ |
| Discounting pressure | flat | ↓ | ↓ | ADR discounting ↓ |
| Combined deterioration | ↓ | ↓ | ↓ | combined ↓ |

## 4. Status

**REFERENCE ASSET — COMPLETE.** Basis for golden dataset design.
