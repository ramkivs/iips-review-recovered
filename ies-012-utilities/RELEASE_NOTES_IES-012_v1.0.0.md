# Release Notes — IES-012 Utilities v1.0.0 (Engineering Standard)

**Tag:** `ies-012-v1.0.0`
**Release date:** 2026-08-08
**Status:** Frozen Engineering Standard (specification — implementation follows)

---

## Major scope

- **IES-012 Utilities Sector Engine** — regulated-return methodology: metric library (rate base growth, allowed ROE, FFO/Debt, O&M efficiency, demand growth, reliability/SAIDI, transition capex, EBITDA margin, leverage, ROE), score engine (6 pillars), regulated-vs-merchant + segment calibration, decision engine + overrides (adverse rate case, regulatory lag, capex overrun, stranded asset, leverage breach, governance), evidence framework.
- **Reference assets** — calibration profile, golden dataset (11 providers), expected outputs (11), replay dataset, validation fixtures (11).
- **Architecture review** — 8/8 PASS, 11/11 expected outputs verified, CSIP ontology compatible.
- Grounded in Regulated Infrastructure Common Principles (reusable).

## Platform position

- Consumes `iips-platform` unchanged; zero platform/framework/engine/CSIP modification.
- CSIP ontology compatible (zero change).
- Coexists with IES-006..011.

## Compatibility

- Platform v1.x · ARM compliant · CSIP ontology compatible · coexists with IES-006..011.

## Known limitations

- Calibration thresholds are segment/regulatory dependent.
- Regulatory economics handled via calibration (regulated vs merchant) + overrides.

## Next steps

- Implementation Plan → WP-1 → WP-2 → WP-3 → WP-4 → Independent Verification → `utilities-engine-v1.0.0` production release.
