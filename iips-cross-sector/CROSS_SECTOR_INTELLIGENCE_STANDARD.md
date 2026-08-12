# IIPS — Cross-Sector Intelligence Standard (CSIP)

**Program:** v1.1 Track 5 — Cross-Sector Intelligence Platform
**Version:** 1.0-draft
**Status:** SPECIFICATION (precedes reference assets, architecture review, freeze, implementation)
**Date:** 2026-08-06
**Predecessor:** Universal Investment Ontology (Foundation)

---

## 1. Purpose & scope

CSIP is the **first platform capability that consumes multiple sector engines simultaneously**. It orchestrates the outputs of Banking, Insurance, Capital Markets, and Healthcare to produce portfolio-level intelligence.

- CSIP is **not** a sector engine. It is a platform capability.
- The four released engines are **immutable** and remain authoritative.
- CSIP never modifies, bypasses, recomputes, or duplicates sector methodology.

## 2. Fundamental principle

- Engines answer: *"How attractive is this company?"*
- CSIP answers: *"Given ALL attractive companies across ALL sectors, how should capital be allocated?"*
- This distinction is absolute.

## 3. Layering

```text
Sector Engines (Banking/Insurance/Capital Markets/Healthcare)
      │
      ▼
Cross-Sector Intelligence Layer (CSIP)
      │
      ▼
Portfolio Intelligence · Capital Allocation · Relative Ranking
Diversification · Risk Analysis · Opportunity Detection
```

No sector engine knows CSIP exists.

## 4. Inputs (engine outputs only — black box)

Each engine exposes: Sector, Composite Score, Verdict, Confidence, Evidence, Risk, Calibration Version, Methodology Version, Replay Metadata.

CSIP consumes **only** these published outputs (via the Universal Investment Ontology mapping). Never internal scoring logic.

## 5. Core services

| # | Service | Responsibility | Output |
|---|---|---|---|
| 1 | Portfolio Intelligence Service | portfolio health, sector exposure, concentration, diversification, quality/convinction distribution | Portfolio Intelligence Report |
| 2 | Cross-Sector Ranking Engine | rank opportunities across all sectors (normalized conviction/confidence/quality/valuation) | Ranked list |
| 3 | Capital Allocation Engine | suggest allocation changes per strategy (Conservative/Balanced/Growth/Aggressive/Income/Value) | Allocation Recommendation |
| 4 | Diversification Analyzer | detect sector/industry/theme concentration, correlated holdings, single-factor exposure | Diversification Score |
| 5 | Opportunity Engine | surface Top 10/25/50 opportunities with rationale | Opportunities |
| 6 | Correlation Engine | detect hidden concentration, macro/economic/interest-rate/regulatory sensitivity, cyclicality (platform metadata only — no price-based correlation) | Correlation Report |
| 7 | Reporting Engine | Executive/Investment Committee/Portfolio Summary/Allocation/Sector Dashboard — PDF-ready JSON | Reports |

## 6. Rules (non-negotiable)

- Never modify Banking/Insurance/Capital Markets/Healthcare.
- Never bypass engine outputs.
- Never recompute sector scores.
- Never duplicate methodology.
- Cross-sector comparisons use **normalized engine outputs only**, never raw sector metrics.
- CSIP is a platform plugin consuming SectorPlugin outputs; no engine depends on CSIP.

## 7. Determinism, replay, evidence

- Deterministic: no randomness; replay-identical allocation/ranking/recommendations/reports.
- Evidence: every recommendation explains Why-stock, Why-sector, Why-allocation, Which-engine, Confidence, Supporting-evidence.

## 8. Future-proofing

New sectors (Hospitality, Energy, Utilities, Consumer, Industrials, Technology, Real Estate, Telecom, Automotive) register via the Universal Investment Ontology and immediately participate in ranking + portfolio intelligence — **no CSIP logic change**.

## 9. Acceptance criteria

Demonstrate identical deterministic outputs for: Banking-only → Banking+Insurance → 3 sectors → 4 sectors.

## 10. Standards-first lifecycle (to follow)

Universal Investment Ontology (✓) → This Standard → Portfolio Architecture → Reference Assets (golden portfolio dataset, replay dataset, regression suite, expected outputs, allocation/diversification fixtures) → Architecture Review → Freeze → Implementation Plan → Implementation → Independent Verification → Release.

## 11. Status

**SPECIFICATION COMPLETE (v1.0-draft)** — awaiting approval before Portfolio Architecture.
