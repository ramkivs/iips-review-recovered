# Release Notes — IES-013 Consumer v1.0.0 (Engineering Standard)

**Tag:** `ies-013-v1.0.0`
**Release date:** 2026-08-08
**Status:** Frozen Engineering Standard (specification — implementation follows)

---

## Major scope

- **IES-013 Consumer Sector Engine** — brand-driven methodology: metric library (pricing power/volume mix, brand/loyalty, margin resilience, distribution/channel mix, FCF yield, innovation intensity, private-label exposure, EBITDA margin, revenue growth, leverage, ROIC), score engine (6 pillars), segment + business-model calibration, decision engine + overrides (brand erosion, category disruption, input-cost squeeze, channel loss, leverage breach, governance), evidence framework.
- **Reference assets** — calibration profile, golden dataset (10 providers), expected outputs (10), replay dataset, validation fixtures (10).
- **Architecture review** — 8/8 PASS, 10/10 expected outputs verified, CSIP ontology compatible.
- Grounded in Intangible Competitive Advantage + Brand Economics Common Principles (reusable).

## Platform position

- Consumes `iips-platform` unchanged; zero platform/framework/engine/CSIP modification.
- CSIP ontology compatible (zero change).
- Coexists with IES-006..012.

## Compatibility

- Platform v1.x · ARM compliant · CSIP ontology compatible · coexists with IES-006..012.

## Known limitations

- Qualitative brand/pricing-power dimensions are calibration-dependent.
- Staples-defensive vs discretionary-cyclical handled via calibration.

## Next steps

- Implementation Plan → WP-1 → WP-2 → WP-3 → WP-4 → Independent Verification → `consumer-engine-v1.0.0` production release.
