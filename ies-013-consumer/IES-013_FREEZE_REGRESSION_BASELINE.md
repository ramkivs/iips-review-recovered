# IES-013 — Freeze Regression Baseline

**Standard:** IES-013 — Consumer Sector Engine
**Date:** 2026-08-08
**Purpose:** The frozen regression baseline that Consumer implementation must reproduce exactly — the WP-3 implementation target.

---

## 1. Frozen baseline

| Artifact | Version | SHA-256 |
|---|---|---|
| Consumer Calibration Profile | 1.0.0 | `2c25fa39…` (see Freeze Manifest) |
| Golden Dataset | 1.0.0 | `4044130b…` |
| Frozen Expected Outputs | 1.0.0 | `5ae32bcd…` |
| Replay Dataset | 1.0.0 | `c3657943…` |
| Validation Fixtures | 1.0.0 | `4b6acc44…` |
| Normative Calculation Appendix (D15) | 1.0 | `23edc9d5…` |

## 2. Expected outputs (implementation target)

| Provider | Segment | Composite | Verdict |
|---|---|---|---|
| CS-001 | luxury | 79.5 | Buy |
| CS-002 | staples | 74.6 | Buy |
| CS-003 | discretionary | 48.2 | Watch (category disruption + leverage) |
| CS-004 | staples | 81.0 | Strong Buy |
| CS-005 | discretionary | 53.2 | Avoid (brand erosion) |
| CS-006 | discretionary | 60.4 | Watch (channel loss) |
| CS-007 | staples | 68.3 | Watch (input-cost squeeze) |
| CS-008 | staples | 64.6 | Watch (input-cost squeeze) |
| CS-009 | discretionary | 77.2 | Buy |
| CS-010 | luxury | 60.8 | Avoid (brand erosion + leverage) |

## 3. Implementation must

- Reproduce all 10 frozen outputs exactly (composite + verdict).
- Pass all 10 validation fixtures (incl. override paths).
- Reproduce byte-identical replay.
- Consume platform unchanged; register ontology metadata for CSIP (zero CSIP change).

## 4. Status

**FROZEN** — this is the implementation target.
