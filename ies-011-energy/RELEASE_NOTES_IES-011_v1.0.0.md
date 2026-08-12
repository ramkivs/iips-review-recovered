# Release Notes — IES-011 Energy v1.0.0 (Engineering Standard)

**Tag:** `ies-011-v1.0.0`
**Release date:** 2026-08-08
**Status:** Frozen Engineering Standard (specification — implementation follows)

---

## Major scope

- **IES-011 Energy Sector Engine** — commodity/volume methodology: metric library (production growth, lifting cost, reserve replacement, reserve life, realized price, transition mix, EBITDA margin, leverage, ROCE, FCF yield), score engine (6 pillars), segment + commodity-exposure calibration, decision engine + overrides (price collapse, cost blowout, reserve write-down, leverage breach, stranded asset, governance), evidence framework.
- **Reference assets** — calibration profile, golden dataset (9 providers across all segments), expected outputs (9), replay dataset, validation fixtures (9).
- **Architecture review** — 8/8 PASS, 9/9 expected outputs verified, CSIP ontology compatible.
- Grounded in Resource Sector Common Principles (reusable).

## Platform position

- Consumes `iips-platform` unchanged; zero platform/framework/engine/CSIP modification.
- CSIP ontology compatible (zero change).
- Coexists with IES-006..010.

## Compatibility

- Platform v1.x · ARM compliant · CSIP ontology compatible · coexists with IES-006..010.

## Known limitations

- Absolute valuation/calibration thresholds are segment-dependent.
- Commodity-price cyclicality handled via calibration + mid-cycle normalization.

## Next steps

- Implementation Plan → WP-1 → WP-2 → WP-3 → WP-4 → Independent Verification → `energy-engine-v1.0.0` production release.
