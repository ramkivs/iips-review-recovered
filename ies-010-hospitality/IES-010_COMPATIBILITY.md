# IES-010 — Hospitality Compatibility Statement

**Standard:** IES-010 — Hospitality Sector Engine
**Date:** 2026-08-08
**Purpose:** Explicit compatibility expectations as sectors evolve independently.

---

## 1. Compatibility statement

| Component | Compatible with |
|---|---|
| IES-010 v1.0 (methodology) | Platform v1.x |
| Calibration Profile 1.0 | Engine v1.0 |
| Reference Assets 1.0 | IES-010 v1.0 |
| Validation Suite 1.0 | Reference Assets 1.0 |

## 2. Platform compatibility

- IES-010 requires **no platform change** — reuses IES-005 runtime/framework/contracts/replay/evidence.
- **ARM compatible** — conforms to the 3-layer architecture (Platform ↑ Sector ↑ Cross-Sector).
- **CSIP ontology compatible** — registers 8-dimension ontology metadata; **zero CSIP change**.
- Coexists with Banking (IES-006), Insurance (IES-007), Capital Markets (IES-008), Healthcare (IES-009).

## 3. Zero-modification declaration

| Component | Modification |
|---|---|
| Platform runtime/framework/contracts | 0 |
| Banking/Insurance/Capital Markets/Healthcare engines | 0 |
| CSIP capability | 0 |

## 4. Version policy

- Methodology/calibration/reference-asset versions evolve independently via additive, versioned increments.
- Calibration/reference-asset changes require regression re-validation + version increment.
- Breaking changes require a major version + compatibility review.

## 5. Statement

IES-010 v1.0 is compatible with Platform v1.x and coexists with the four released sector engines + CSIP, with zero platform, framework, engine, or CSIP modification.

## 6. Reuse

Reusable format for all future sector standards (IES-011+).
