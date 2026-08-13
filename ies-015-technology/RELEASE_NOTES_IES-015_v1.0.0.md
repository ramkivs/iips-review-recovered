# Release Notes — IES-015 Technology v1.0.0 (Engineering Standard)

**Tag:** `ies-015-v1.0.0`
**Release date:** 2026-08-09
**Status:** Frozen Engineering Standard (specification — implementation follows)

---

## Major scope

- **IES-015 Technology Sector Engine** — tech methodology: metric library (TM-001..TM-012 incl. recurring revenue %, NRR, gross margin, R&D intensity, customer concentration, capex intensity, usage growth), D15 v1.3 normative contract (band→score→pillar→composite→override→verdict; lower-inclusive/upper-exclusive boundaries; **metric-specific immutable band cardinality** — TM-009 is inherently 3-band; **effective band-table resolution** `calibrated ?? baseline` with boundaries+scores together; **conservativeBandTable()** operator for conflicting complete tables; round-half-to-even at composite; derived-component/missing-primitive renormalization; calibration staging; min-rank override operator), 9 subsegments × 9 business-model-archetype calibration, decision engine + override families (governance, disruption/obsolescence, churn collapse, customer-concentration loss, capex overrun, margin compression, leverage breach), evidence framework.
- **Reference assets** — calibration profile, golden dataset (13 providers across all 9 subsegments + 9 archetypes), expected outputs (13), replay dataset, validation fixtures (21), ontology metadata, contract test suite.
- **Architecture review** — 11/11 PASS, expected outputs cross-checked 13/13 vs fixtures/replay; byte-identical generation.
- Reference assets are the **authoritative test oracle**.

## Platform position

- Consumes `iips-platform` unchanged; zero platform/framework/engine/CSIP modification.
- CSIP ontology compatible (zero change).
- Coexists with IES-006..014 (Banking, Insurance, Capital Markets, Healthcare, Hospitality, Energy, Utilities, Consumer, Industrials).

## Compatibility

- Platform v1.x · ARM compliant · CSIP ontology compatible · coexists with IES-006..014.

## Known limitations

- R&D intensity is inherently 3-band (no 4th band invented).
- Qualitative dimensions (retention/usage growth/competitive position) are calibration-dependent.
- Subsegment cyclicality (semiconductors/hardware capital intensity) handled via calibration.

## Next steps

- Implementation Plan → WP-1 → WP-2 → WP-3 → WP-4 → Independent Verification → `technology-engine-v1.0.0` production release.
