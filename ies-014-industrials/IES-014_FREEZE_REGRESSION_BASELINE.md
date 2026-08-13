# IES-014 — Freeze Regression Baseline

**Standard:** IES-014 — Industrials Sector Engine
**Date:** 2026-08-09
**Purpose:** The frozen regression baseline that Industrials implementation must reproduce exactly — the WP-3 implementation target.

---

## 1. Frozen baseline

| Artifact | Version | SHA-256 |
|---|---|---|
| Industrials Calibration Profile | 1.0.0 | `abaa02d0…` (see Freeze Manifest) |
| Golden Dataset | 1.0.0 | `59fcbd48…` |
| Frozen Expected Outputs | 1.0.0 | `57777333…` |
| Replay Dataset | 1.0.0 | `98380dc5…` |
| Validation Fixtures | 1.0.0 | `9ca65f64…` |
| Normative Calculation Appendix (D15 v1.2) | 1.2 | `2179ce3c…` |
| Ontology Metadata | 1.0.0 | `industrials-ontology-metadata-1.0.0` |

## 2. Expected outputs (implementation target)

| Provider | Subsegment | Composite | Verdict |
|---|---|---|---|
| IN-001 | capital-goods | 77.2 | Buy |
| IN-002 | aero-defense | 75.1 | Buy |
| IN-003 | transportation | 69.1 | Accumulate |
| IN-004 | eandc | 62.0 | Accumulate |
| IN-005 | electrical-equipment | 75.3 | Buy |
| IN-006 | diversified | 72.0 | Buy |
| IN-007 | capital-goods | 49.6 | Watch (order cancellation) |
| IN-008 | aero-defense | 68.7 | Watch (defense program) |
| IN-009 | eandc | 60.8 | Watch (EPC overrun) |
| IN-010 | capital-goods | 54.6 | Watch (margin compression + leverage) |

## 3. Implementation must

- Reproduce all 10 frozen outputs exactly (composite + verdict).
- Pass all 10 validation fixtures (incl. override paths).
- Reproduce byte-identical replay.
- Consume platform unchanged; register ontology metadata for CSIP (zero CSIP change).
- Treat reference assets as the **authoritative test oracle** (implementation disagreement = implementation defect).

## 4. Status

**FROZEN** — this is the implementation target.
