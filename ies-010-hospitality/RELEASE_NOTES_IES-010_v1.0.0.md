# Release Notes — IES-010 Hospitality v1.0.0 (Engineering Standard)

**Tag:** `ies-010-v1.0.0`
**Release date:** 2026-08-08
**Status:** Frozen Engineering Standard (specification — implementation follows)

---

## Major scope

- **IES-010 Hospitality Sector Engine** — RevPAR-centric methodology: metric library (Occupancy, ADR, RevPAR, GOP margin, RevPAR growth, fee mix, demand quality, ROIC), score engine (6 pillars), business-model calibration, decision engine + overrides (demand shock, occupancy collapse, leverage breach, brand deterioration, governance), evidence framework.
- **Reference assets** — calibration profile, golden dataset (9 providers), expected outputs (9), replay dataset, validation fixtures (9).
- **Architecture review** — 8/8 PASS, 9/9 expected outputs verified, CSIP ontology compatible.

## Platform position

- First sector standard designed after CSIP exists → verifies ontology registration with **zero CSIP change**.
- Consumes `iips-platform` unchanged; zero platform/framework/engine modification.

## Compatibility

- Platform v1.x · ARM compliant · CSIP ontology compatible · coexists with IES-006..009.

## Known limitations

- Absolute RevPAR thresholds are calibration-dependent (business model).
- Owned-property leverage sensitivity is higher (per methodology).

## Next steps

- Implementation Plan → WP-1 → WP-2 → WP-3 → WP-4 → Independent Verification → `hospitality-engine-v1.0.0` production release.
