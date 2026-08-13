# IIPS — Cross-Sector Coverage Matrix

**Program:** v1.1 Track 5 — Cross-Sector Intelligence Platform
**Phase:** CSIP Phase 3 — Architecture Review
**Artifact:** 4 of 4 (Cross-Sector Coverage Matrix)
**Version:** 1.0-draft
**Date:** 2026-08-08
**Purpose:** Demonstrate that every CSIP capability is exercised by the reference assets (golden dataset, expected outputs, replay dataset, allocation fixtures, diversification fixtures). This confirms the acceptance surface is complete before freeze and implementation.

---

## 1. Capability → evidence coverage

| # | CSIP capability | Exercised by (reference asset) | Coverage evidence |
|---|---|---|---|
| 1 | **Portfolio Intelligence** | Golden dataset (PF-01…06) + Expected Outputs | sector exposure, concentration, diversification score, avg conviction/quality/risk per portfolio ✓ |
| 2 | **Ranking** | Expected Outputs → `ranking` per portfolio | deterministic ranking (conviction desc, sector asc) for all 6 portfolios ✓ |
| 3 | **Allocation** | Allocation Fixtures (8 scenarios) | ALLOC-01…08 covering decision matrix + 6 strategies ✓ |
| 4 | **Diversification** | Diversification Fixtures (5 scenarios) + Expected Outputs | DIV-01…05 + diversificationScore per portfolio ✓ |
| 5 | **Opportunity Detection** | Golden dataset (high-conviction holdings) + Decision Matrix | Top-N selection basis (ALLOC-04 Hold concentration) ✓ (rationale export defined by Evidence Model) |
| 6 | **Correlation Analysis** | Platform-metadata-only model + Golden dataset scenarios | single-factor/cyclicality detection surface (DIV-03 growth factor, DIV-04 correlated downside) ✓ |
| 7 | **Reporting** | Replay Dataset (identical reports) + Evidence Model | report shape + PDF-ready JSON assertion ✓ |

## 2. Sector coverage in the golden dataset

| Sector | Present in portfolio(s) |
|---|---|
| Banking | PF-01, PF-03, PF-04, PF-05, PF-06 |
| Insurance | PF-01, PF-03, PF-05, PF-06 |
| Capital Markets | PF-01, PF-02, PF-05 |
| Healthcare | PF-02, PF-05 |

All four released sectors are represented; **PF-05 Multi-sector Balanced** exercises all four simultaneously (Banking, Insurance, Capital Markets, Healthcare) — satisfying the acceptance criterion for the 4-sector case.

## 3. Coverage of the 7 core services by fixtures

| Core service (Standard §5) | Fixture/reference coverage |
|---|---|
| 1. Portfolio Intelligence Service | Expected Outputs: exposure, concentration, diversificationScore, avgConviction/avgQuality/avgRisk ✓ |
| 2. Cross-Sector Ranking Engine | Expected Outputs: `ranking` per portfolio ✓ |
| 3. Capital Allocation Engine | Allocation Fixtures (8) ✓ |
| 4. Diversification Analyzer | Diversification Fixtures (5) + diversificationScore ✓ |
| 5. Opportunity Engine | Decision Matrix (High conviction concentrated → Hold) + Evidence Model rationale; Top-10/25/50 to be asserted in implementation fixtures |
| 6. Correlation Engine | Golden scenarios (factor/cyclicality flags, DIV-03/DIV-04); price-based correlation explicitly prohibited ✓ |
| 7. Reporting Engine | Replay Dataset `identical reports` + Evidence Model; PDF-ready JSON shape |

## 4. Coverage findings

1. **All 7 capabilities are exercised** in the reference assets; every capability maps to at least one frozen fixture/expected output.
2. **Opportunity Detection** is the thinnest surface in the reference assets: Top-10/25/50 selection and its rationale export are specified (Standard §5.5 + Evidence Model) but the specific Top-N fixtures/expected outputs belong to the **implementation fixtures** (Portfolio Regression Suite). This is a defined, not a missing, requirement — to be closed during Implementation Plan.
3. **Correlation Engine** coverage is intentionally platform-metadata-only (Standard §6.6): fixtures assert factor/cyclicality/single-factor flags, never price-based correlation.
4. **4-sector acceptance** is satisfied by PF-05; incremental acceptance (Banking-only → +Insurance → +3 sectors → 4 sectors, Standard §9) will be reproduced at implementation via the replay dataset.

## 5. Status

**ARCHITECTURE REVIEW ARTIFACT — COMPLETE.** CSIP capability coverage confirmed complete across the reference assets; one defined implementation-time gap (Top-N fixtures) noted for the Implementation Plan.
