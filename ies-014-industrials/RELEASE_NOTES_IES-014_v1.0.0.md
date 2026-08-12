# Release Notes — IES-014 Industrials v1.0.0 (Engineering Standard)

**Tag:** `ies-014-v1.0.0`
**Release date:** 2026-08-09
**Status:** Frozen Engineering Standard (specification — implementation follows)

---

## Major scope

- **IES-014 Industrials Sector Engine** — visible-demand methodology: metric library (backlog, book-to-bill, aftermarket/services %, revenue growth, EBITDA/op margin, FCF yield, order growth, leverage, ROCE, project risk), D15 v1.2 normative contract (band→score→pillar→composite→override→verdict, lower-inclusive/upper-exclusive boundaries, round-half-to-even at composite, explicit calibration staging + derived-component missing-data rule), subsegment + business-model-archetype calibration, decision engine + overrides (order cancellation, defense program, EPC overrun, margin compression, leverage, governance; min-rank operator), evidence framework.
- **Reference assets** — calibration profile, golden dataset (10 providers across 6 subsegments + 5 archetypes), expected outputs (10), replay dataset, validation fixtures (10), ontology metadata, contract test suite.
- **Architecture review** — 8/8 PASS, expected outputs cross-checked 10/10 vs fixtures/replay.
- Reference assets are the **authoritative test oracle**.

## Platform position

- Consumes `iips-platform` unchanged; zero platform/framework/engine/CSIP modification.
- CSIP ontology compatible (zero change).
- Coexists with IES-006..013.

## Compatibility

- Platform v1.x · ARM compliant · CSIP ontology compatible · coexists with IES-006..013.

## Known limitations

- Qualitative backlog/aftermarket dimensions are calibration-dependent.
- Subsegment cyclicality (capital goods/transport high, defense moderate) handled via calibration.

## Next steps

- Implementation Plan → WP-1 → WP-2 → WP-3 → WP-4 → Independent Verification → `industrials-engine-v1.0.0` production release.
