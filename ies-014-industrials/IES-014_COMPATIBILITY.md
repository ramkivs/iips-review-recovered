# IES-014 — Industrials Compatibility Statement

**Standard:** IES-014 — Industrials Sector Engine
**Date:** 2026-08-09
**Purpose:** Explicit compatibility expectations as sectors evolve independently.

---

## 1. Compatibility statement

| Component | Compatible with |
|---|---|
| IES-014 v1.0 (methodology, D15 v1.2) | Platform v1.x |
| Calibration Profile 1.0 | Engine v1.0 |
| Reference Assets 1.0 | IES-014 v1.0 |
| Validation Suite 1.0 | Reference Assets 1.0 |
| Ontology Metadata 1.0 | CSIP (zero change) |

## 2. Platform compatibility

- IES-014 requires **no platform change** — reuses IES-005 runtime/framework/contracts/replay/evidence.
- **ARM compatible** — conforms to the 3-layer architecture.
- **CSIP ontology compatible** — registers 8-dimension ontology metadata; **zero CSIP change** (per CSIP Service Dependency Matrix, ontology is the integration boundary).
- Coexists with Banking (IES-006), Insurance (IES-007), Capital Markets (IES-008), Healthcare (IES-009), Hospitality (IES-010), Energy (IES-011), Utilities (IES-012), Consumer (IES-013).

## 3. Zero-modification declaration

| Component | Modification |
|---|---|
| Platform runtime/framework/contracts | 0 |
| Banking/Insurance/Capital Markets/Healthcare/Hospitality/Energy/Utilities/Consumer engines | 0 |
| CSIP capability | 0 |

## 4. Version policy

- Methodology/calibration/reference-asset versions evolve independently via additive, versioned increments.
- Calibration/reference-asset changes require regression re-validation + version increment.
- Breaking changes require a major version + compatibility review.

## 5. Statement

IES-014 v1.0 is compatible with Platform v1.x and coexists with the eight released sector engines + CSIP, with zero platform, framework, engine, or CSIP modification.

## 6. Reuse

Reusable format for all future sector standards (IES-015+).
