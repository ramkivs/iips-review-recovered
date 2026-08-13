# CSIP — Freeze Regression Baseline

**Capability:** CSIP — Cross-Sector Intelligence Platform
**Program:** v1.1 Track 5
**Date:** 2026-08-08
**Purpose:** The frozen regression baseline that CSIP implementation must reproduce exactly — the implementation target for portfolio intelligence, ranking, allocation, diversification, opportunity, correlation, and reporting.

---

## 1. Frozen baseline

| Artifact | Version | SHA-256 |
|---|---|---|
| Universal Investment Ontology | 1.0.0 | `8cb22dd4…` (see Freeze Manifest) |
| Cross-Sector Intelligence Standard | 1.0.0 | `7462b761…` |
| Portfolio Architecture | 1.0.0 | `a6fa1542…` |
| Portfolio Reference Data | 1.0.0 | `2def0bab…` |
| Allocation Decision Matrix | 1.0.0 | `55d10cae…` |
| Cross-Sector Evidence Model | 1.0.0 | `a1dd4261…` |
| Portfolio Golden Dataset | 1.0.0 | `f70002b3…` |
| Portfolio Expected Outputs | 1.0.0 | `a6a341d0…` |
| Portfolio Replay Dataset | 1.0.0 | `b4cda9d8…` |
| Allocation Fixtures | 1.0.0 | `a8e31bbc…` |
| Diversification Fixtures | 1.0.0 | `a4e7ae2c…` |
| Architecture Review (verdict) | 1.0.0 | `43022c88…` |

## 2. Portfolio expected outputs (implementation target)

| Portfolio | Concentration | Diversification | Avg Conviction | Avg Quality | Avg Risk |
|---|---|---|---|---|---|
| PF-01 Conservative | 33.3 | 72.7 | 75.3 | 77.7 | 25.0 |
| PF-02 Growth | 50.0 | 53.0 | 83.5 | 81.0 | 37.5 |
| PF-03 Income | 50.0 | 53.0 | 72.0 | 76.5 | 22.5 |
| PF-04 Over-concentrated | 100.0 | 6.0 | 51.0 | 56.0 | 50.0 |
| PF-05 Balanced | 25.0 | 84.0 | 77.0 | 78.0 | 27.5 |
| PF-06 Crisis | 50.0 | 53.0 | 34.0 | 45.0 | 62.5 |

*(Full details incl. sector exposure + per-portfolio rankings in `expected-outputs/PORTFOLIO_EXPECTED_OUTPUTS.json`.)*

## 3. Implementation must

- Reproduce all 6 portfolio expected outputs exactly (deterministic formulas verified in Architecture Review).
- Pass all 8 allocation fixtures + 5 diversification fixtures.
- Reproduce identical rankings / allocations / reports / diversification scores / evidence on replay (Portfolio Replay Dataset, PF-05).
- Consume **only** normalized engine outputs via the ontology — never raw sector metrics.
- Introduce **zero changes** to Banking/Insurance/Capital Markets/Healthcare engines and zero runtime/framework changes.
- Remain replay-deterministic (injectable Clock/IdProvider only; no randomness).

## 4. Status

**FROZEN** — this is the implementation target.
