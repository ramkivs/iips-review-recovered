# IES-010 — Freeze Regression Baseline

**Standard:** IES-010 — Hospitality Sector Engine
**Date:** 2026-08-08
**Purpose:** The frozen regression baseline that Hospitality implementation must reproduce exactly — the WP-3 implementation target.

---

## 1. Frozen baseline

| Artifact | Version | SHA-256 |
|---|---|---|
| Hospitality Calibration Profile | 1.0.0 | `0869096c…` (see Freeze Manifest) |
| Golden Dataset | 1.0.0 | `bcc0b9c9…` |
| Frozen Expected Outputs | 1.0.0 | `9615fc98…` |
| Replay Dataset | 1.0.0 | `9099bad9…` |
| Validation Fixtures | 1.0.0 | `411cc916…` |
| Normative Calculation Appendix (D15) | 1.0 | `a040fee4…` |

## 2. Expected outputs (implementation target)

| Provider | Business model | Composite | Verdict |
|---|---|---|---|
| HP-001 | owned | 79.0 | Buy |
| HP-002 | managed | 76.4 | Buy |
| HP-003 | owned | 76.0 | Buy |
| HP-004 | franchised | 77.9 | Buy |
| HP-005 | owned | 72.9 | Buy |
| HP-006 | asset-light | 78.6 | Buy |
| HP-007 | asset-light | 54.2 | Watch (demand shock) |
| HP-008 | franchised | 73.0 | Avoid (brand deterioration) |
| HP-009 | owned | 38.9 | Avoid (occupancy collapse) |

## 3. Implementation must

- Reproduce all 9 frozen outputs exactly (composite + verdict).
- Pass all 9 validation fixtures (incl. override paths).
- Reproduce byte-identical replay (composites, verdicts, pillars, overrides, evidence).
- Consume platform unchanged; register ontology metadata for CSIP (zero CSIP change).

## 4. Status

**FROZEN** — this is the implementation target.
