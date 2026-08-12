# IES-013 — Consumer Calibration Boundary Review Matrix

**Standard:** IES-013 — Consumer Sector Engine
**Phase:** 4 — Architecture Review
**Version:** 1.0
**Date:** 2026-08-08
**Status:** ARCHITECTURE REVIEW ARTIFACT

> **Purpose.** Explicitly document calibration boundaries — making calibration assignment independently auditable.

---

## 1. Calibration boundary review

| Boundary | Calibration profile | Metrics identical | Weights changed | Override applicability | Ontology impact |
|---|---|---|---|---|---|
| Staples ↔ Discretionary | C-staples vs C-disc | identical (CM-001..012) | quality/growth/risk weights | all applicable | none |
| Premium ↔ Value | luxury vs staples | identical | margin/quality emphasis | all | none |
| Branded ↔ Retailer | branded vs retailer | identical | growth/risk weights | all | none |
| DTC ↔ Traditional Distribution | dtc vs retailer | identical | growth/quality weights | all | none |
| Luxury ↔ Mass Market | luxury vs staples/disc | identical | quality emphasis | all | none |

## 2. Boundary findings

- **Calibration profile** selects segment/business-model weights + leverage alert.
- **Metrics remain identical** (CM-001..CM-012) across all boundaries — only weights differ.
- **Override applicability is uniform** across boundaries.
- **Ontology impact is none** — all map to the same 8-dimension ontology.

## 3. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.** Calibration boundaries auditable.
