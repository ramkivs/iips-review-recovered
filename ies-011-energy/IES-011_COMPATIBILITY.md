# IES-011 — Energy Compatibility Statement

**Standard:** IES-011 — Energy Sector Engine
**Date:** 2026-08-08
**Purpose:** Explicit compatibility expectations as sectors evolve independently.

---

## 1. Compatibility statement

| Component | Compatible with |
|---|---|
| IES-011 v1.0 (methodology) | Platform v1.x |
| Calibration Profile 1.0 | Engine v1.0 |
| Reference Assets 1.0 | IES-011 v1.0 |
| Validation Suite 1.0 | Reference Assets 1.0 |

## 2. Platform compatibility

- IES-011 requires **no platform change** — reuses IES-005 runtime/framework/contracts/replay/evidence.
- **ARM compatible** — conforms to the 3-layer architecture.
- **CSIP ontology compatible** — registers 8-dimension ontology metadata; **zero CSIP change**.
- Coexists with Banking (IES-006), Insurance (IES-007), Capital Markets (IES-008), Healthcare (IES-009), Hospitality (IES-010).

## 3. Zero-modification declaration

| Component | Modification |
|---|---|
| Platform runtime/framework/contracts | 0 |
| Banking/Insurance/Capital Markets/Healthcare/Hospitality engines | 0 |
| CSIP capability | 0 |

## 4. Version policy

- Methodology/calibration/reference-asset versions evolve independently via additive, versioned increments.
- Calibration/reference-asset changes require regression re-validation + version increment.
- Breaking changes require a major version + compatibility review.

## 5. Statement

IES-011 v1.0 is compatible with Platform v1.x and coexists with the five released sector engines + CSIP, with zero platform, framework, engine, or CSIP modification.

## 6. Reuse

Reusable format for all future sector standards (IES-012+).
