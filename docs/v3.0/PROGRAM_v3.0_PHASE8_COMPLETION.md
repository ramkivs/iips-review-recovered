# Program v3.0 — Phase 8: Cross-Sector Intelligence (Completion Report)

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** Phase 8 — Cross-Sector Intelligence
**Location:** `frontend/` + `frontend/server/executive-transport.ts`
**Status:** COMPLETE — certified CSIP cross-sector outputs, no ranking/scoring logic in React, no v2.0/v1.1 change.
**Date:** 2026-08-09

---

## 1. Cross-sector architecture

`React` → `fetchCrossSectorData` (typed client) → `/api/cross-sector` (Vite proxy) → **v3.0 transport/adapter** → **certified CSIP cross-sector engine** over frozen v1.1 Replay Baseline inputs.

Answers **"Where are the strongest opportunities, risks and decision patterns across sectors?"**

## 2. Routes

`/research/cross-sector` renders `<CrossSectorIntelligence/>`. (`/intelligence/*` remain placeholders for later phases.)

## 3. CSIP / API data-flow

Transport `computeCertifiedCrossSector()` runs the certified CSIP engine and maps 1:1:
- universe overview → certified CSIP `PortfolioIntelligenceReport`
- sector ranking → certified CSIP `RankedOpportunity[]`
- opportunities → certified CSIP `OpportunitySet`
- risk/correlation → certified CSIP `CorrelationReport` + `DiversificationAnalysis`
- decisions → certified sector-engine outputs

## 4. Complete UI-field → certified-source mapping

| UI field | API DTO | CSIP/platform contract | Certified source |
|---|---|---|---|
| Sectors, avg conviction/quality/risk, concentration, diversification | `portfolio` | `PortfolioIntelligenceReport` | Certified CSIP |
| Sector ranking | `ranking` | `RankedOpportunity[]` | Certified CSIP |
| Decision distribution | `decisions` (grouped) | certified engine outputs | Certified engines |
| Opportunities | `opportunity` | `OpportunitySet` | Certified CSIP |
| Risk flags / concentration | `correlation` | `CorrelationReport` | Certified CSIP |
| Composite-by-sector chart | `decisions[].composite` | certified engine outputs | Certified engines |
| Provenance / freshness | `provenance` | transport | SNAPSHOT |

## 5. G2 transport additions (minimum)

Added `/api/cross-sector` + `computeCertifiedCrossSector`. Semantically inert; 1:1 DTO mapping.

## 6. Components reused (Phase 4)

`MetricCard/MetricGroup` · `DataTable` · `DecisionBadge` · `ChartContainer`/`SimpleBarChart`/`LegendConventions` · `Accordion` · `CertifiedBadge`/`FreshnessBadge` · `LoadingState`/`ErrorState`/`UnavailableState`.

## 7. New reusable components

**None.** All reuse Phase 4; sorting controls are page-local presentational state.

## 8. Confirmation — no ranking/scoring logic in React

- **No** ranking/normalization/percentile/opportunity/risk/confidence/comparison/threshold/allocation logic.
- Only **presentational** operations: sorting (conviction/sector), grouping (decision distribution counts), formatting.
- Decision distribution is a **presentational count** of certified verdicts (not a computed score).

## 9. Decision authority

- All values marked **CERTIFIED RESULT** (`CertifiedBadge`).
- **No AI on this surface.**

## 10. Evidence / provenance

- Evidence entry via links to company pages → evidence/replay surfaces.
- Provenance shown in header + footer.

## 11. Freshness semantics

- **SNAPSHOT** badge; **SNAPSHOT ≠ STALE** preserved.
- Unavailable → `UnavailableState`/`ErrorState`, never `0`/fabricated.

## 12. Accessibility

Semantic HTML, `aria-label`, `role="group"`/`aria-pressed` sort, non-color-only badges, tables `th scope`, charts `figure`/`figcaption` + `role="img"`, focus (global).

## 13. Responsive

Grids `repeat(auto-fill, minmax(...))`; inherits global breakpoints.

## 14. Tests

- **75/75 tests pass** (69 + 6 Cross-Sector) across 14 files.
- `tsc --noEmit` (strict) → clean.

## 15. Production build

`vite build` succeeds (196 kB JS, 61 kB gzip).

## 16. G3 limitations (unchanged)

- Serves the **certified reference universe (SNAPSHOT)**, not live tenant data.
- Auth/session remains the minimal dev-mode mechanism; **real auth/session/tenant boundary is a separate, pending, governed requirement**.

## 17. v2.0/v1.1 boundary verification

- No changes outside `frontend/`.
- Transport runs the certified CSIP engine in-process; semantically inert.
- **Brand Economics** framework NOT introduced as frontend scores (consumed only via governed sector methodology, per the constraint).

## 18. Commit hash

See the Phase 8 commit (below).

## Golden-outputs provenance (frozen in Phase 7)

The frozen expected-output artifacts serve the certified **reference/SNAPSHOT** experience only. They are **not** the permanent live analytical source; the production path remains `LIVE/SNAPSHOT INPUT → v1.1 ENGINE → GOVERNED OUTPUT → v2.0 PLATFORM → v3.0 UI` (recorded in `transport-boundary.md` §8).

## Status

**PHASE 8 COMPLETE.** Awaiting approval before Phase 9 (Decision Matrix — NOT yet authorized).
