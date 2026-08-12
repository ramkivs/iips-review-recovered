# Program v3.0 — Phase 6: Portfolio Workspace (Completion Report)

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** Phase 6 — Portfolio Workspace
**Location:** `frontend/` + `frontend/server/executive-transport.ts`
**Status:** COMPLETE — real certified portfolio data, no fabrication, no v2.0/v1.1 change.
**Date:** 2026-08-09

---

## 1. Portfolio Workspace architecture

`React` → `fetchPortfolioData` (typed client) → `/api/portfolio` (Vite proxy) → **v3.0 transport/adapter** → **certified CSIP + sector engines** → frozen v1.1 Replay Baseline inputs.

Answers **"What is happening in my portfolio, and what deserves investigation?"** with navigation `Executive → Portfolio → Holding → Evidence → Replay`.

## 2. Routes

`/portfolio` and `/portfolio/*` render `<PortfolioWorkspace/>` (was `NotYetAuthorized`).

## 3. Data-flow / API mappings

Transport `computeCertifiedPortfolio()` runs the certified platform and maps 1:1:
- portfolio intelligence → certified CSIP `PortfolioIntelligenceReport`
- allocation recommendation + rulesApplied → certified CSIP `AllocationRecommendation`
- holdings (per-sector decision/composite/confidence/quality/risk/weight) → certified sector-engine outputs + CSIP sector exposure
- diversification/risk/correlation → certified CSIP
- opportunities → certified CSIP `OpportunitySet`
- evidence refs → 1:1 mapping

## 4. Source of every displayed investment value

| Value | Source |
|---|---|
| Holdings count, avg conviction/quality/risk, concentration, diversification | Certified CSIP |
| Sector exposure (%) | Certified CSIP `sectorExposure` |
| Allocation recommendation + rules | Certified CSIP `AllocationRecommendation` |
| Per-holding decision/composite/confidence | Certified sector-engine `ExecutionResult.metadata` |
| Per-holding weight | Certified CSIP sector exposure |
| Opportunities | Certified CSIP `OpportunitySet` |
| Risk/correlation flags | Certified CSIP |

All values genuinely computed; composites match the frozen Replay Baseline.

## 5. G2 transport additions (minimum)

Added `/api/portfolio` to the existing inert transport (refactored `computeCertifiedPlatform()` shared by executive + portfolio). Semantically inert — 1:1 DTO mapping only.

## 6. Components reused (Phase 4)

`MetricCard/MetricGroup` · `DataTable` · `DecisionBadge` · `ChartContainer`/`SimpleBarChart`/`LegendConventions` · `EvidenceCard` · `Accordion` · `CertifiedBadge`/`FreshnessBadge` · `LoadingState`/`ErrorState`/`UnavailableState`.

## 7. New reusable components

**None.** All reuse Phase 4; sorting controls are page-local presentational state.

## 8. Decision/business-logic boundary verification

- **No** rebalance/risk/quality/priority/limits/thresholds/confidence/ranking logic in React.
- Only **presentational** operations: sorting (by weight/composite/sector), grouping, formatting.
- All investment values come from governed platform contracts.

## 9. Freshness / provenance

- Labeled **SNAPSHOT** (`FreshnessBadge`); provenance shown in header.
- **SNAPSHOT never displayed as STALE.** Stale warning only on `STALE`.
- Unavailable values → `UnavailableState`/`ErrorState`, never `0`/fabricated.

## 10. G3 limitations (unchanged, documented)

- Serves the **certified reference portfolio (SNAPSHOT)**, not live tenant data.
- Auth/session is the minimal dev-mode mechanism. **Real auth/session/tenant boundary remains a separate, pending, governed requirement** (not solved opportunistically here).

## 11. Accessibility

Semantic HTML, `aria-label`, `role="group"`/`aria-pressed` for sorting, `aria-pressed` filters, non-color-only badges, tables `th scope`, charts `figure`/`figcaption` + `role="img"`.

## 12. Responsive

Grids use `repeat(auto-fill, minmax(...))` for reflow; inherits global breakpoints.

## 13. Tests

- **61/61 tests pass** (55 + 6 Portfolio) across 11 files.
- `tsc --noEmit` (strict) → clean.

## 14. Production build

`vite build` succeeds (187 kB JS, 60 kB gzip).

## 15. v2.0/v1.1 semantics unchanged

- No changes outside `frontend/`.
- Transport runs the certified platform in-process, semantically inert.

## 16. Commit hash

See the Phase 6 commit (below).

## Status

**PHASE 6 COMPLETE.** Awaiting approval before Phase 7 (Company Intelligence — NOT yet authorized).
