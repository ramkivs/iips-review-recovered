# Program v3.0 — Phase 9: Decision Matrix (Completion Report)

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** Phase 9 — Decision Matrix
**Location:** `frontend/` + `frontend/server/executive-transport.ts`
**Status:** COMPLETE — presentational scatter of CERTIFIED axes; no classification/quadrant/threshold logic in React; no v2.0/v1.1 change.
**Date:** 2026-08-09

---

## 1. Contract inspection results (the critical gate)

Inspected the certified platform/CSIP contracts for Business Quality × Valuation Opportunity:

| Sought | Found in certified platform |
|---|---|
| Business Quality (per company) | ✅ Certified `NormalizedHolding.quality` (0–100), sourced from sector-specific quality pillar (asset-quality, underwriting, earnings-quality, quality, occupancy, etc.) |
| Valuation (per company) | ⚠️ Certified `NormalizedHolding.valuation` (0–100) for **6 sectors** (banking, energy, utilities, consumer, industrials, technology); **null for 4** (insurance, capital-markets, healthcare, hospitality — no valuation pillar exposed) |
| Matrix/quadrant/band classification object | ❌ **Does NOT exist** in the certified platform |
| Decision classification | ✅ Certified verdict per company |
| Confidence | ✅ Where golden exposes it; else null |
| Company/sector identity, evidence/provenance | ✅ Certified |

## 2. Exact certified source for Business Quality

`NormalizedHolding.quality` (CSIP OntologyMapper) ← sector-specific certified quality pillar from golden expected-outputs (e.g., Banking `asset-quality`, Insurance `underwriting`, Healthcare `revenue-quality`).

## 3. Exact certified source for Valuation Opportunity

`NormalizedHolding.valuation` (CSIP OntologyMapper) ← certified `valuation` pillar from golden expected-outputs. **Null for the 4 sectors that do not expose a valuation pillar** (shown unavailable, never fabricated/derived).

## 4. Matrix classification source

**There is NO certified matrix/quadrant classification object.** Per the Phase 9 HARD STOP condition, the UI does **NOT** reconstruct quadrants, bands, or thresholds. It presents a **presentational scatter** of the two certified axis scores (Business Quality × Valuation) and lets the user inspect each point's certified decision — without computing any classification.

## 5. Architecture

`React` → `fetchDecisionMatrixData` → `/api/decision-matrix` (Vite proxy) → **v3.0 transport** → certified CSIP/engine pillars.

## 6. Route(s)

`/intelligence/decision-matrix` renders `<DecisionMatrix/>`.

## 7. API/DTO mapping

`computeCertifiedDecisionMatrix()` maps per-company certified quality + valuation + verdict + composite (1:1), plus universe overview + provenance.

## 8. Complete UI-field → certified-source mapping

| UI element | API DTO | Platform contract | Certified source |
|---|---|---|---|
| Scatter x (Business Quality) | `quality` | `NormalizedHolding.quality` | Certified quality pillar |
| Scatter y (Valuation) | `valuation` | `NormalizedHolding.valuation` | Certified valuation pillar (or null) |
| Point verdict | `verdict` | certified engine output | Certified engine |
| Point composite | `composite` | certified engine output | Certified engine |
| Universe overview | `universe` | `PortfolioIntelligenceReport` | Certified CSIP |
| Provenance/freshness | `provenance` | transport | SNAPSHOT |

## 9. G2 additions (minimum)

Added `/api/decision-matrix` + `computeCertifiedDecisionMatrix`. Semantically inert; 1:1 DTO mapping.

## 10–11. Components reused / new

Reused: `MetricCard/MetricGroup`, `DecisionBadge`, `CertifiedBadge`/`FreshnessBadge`, `LoadingState`/`ErrorState`/`UnavailableState`. **No new reusable components** (scatter is page-local presentational state).

## 12. Confirmation — zero frontend analytical calculations

- **No** business-quality score, valuation score, band, quadrant, decision class, confidence, opportunity score, ranking, or threshold computation in React.
- The scatter **positions certified values only**; valuation-null points are pinned with an explicit "unavailable" marker, not inferred.

## 13. Decision authority

- All values marked **CERTIFIED RESULT**. No AI surface.

## 14. Evidence / provenance

- Selected company links to Company → Evidence/Replay. Provenance shown.

## 15. Freshness

- **SNAPSHOT** badge; **SNAPSHOT ≠ STALE**; unavailable (valuation-null) shown explicitly, never `0`/fabricated.

## 16–17. Accessibility / responsive

- `role="img"` + aria-labels on scatter; focusable points (buttons); non-color-only (valuation-null uses pattern + "unavailable"). Responsive via inherited grid/breakpoints.

## 18–19. Tests / build

- **81/81 tests pass** (75 + 6 Decision Matrix) across 15 files; `tsc --noEmit` clean; `vite build` succeeds.

## 20. G3 limitations

- Serves the **certified reference universe (SNAPSHOT)**, not live tenant data. Auth/session remains the minimal dev-mode mechanism (separate pending requirement).

## 21. v2.0/v1.1 boundary verification

- No changes outside `frontend/`. Transport runs certified platform in-process; semantically inert. **Golden-outputs provenance rule honored** (golden outputs = SNAPSHOT reference only).

## 22. Commit hash

See the Phase 9 commit (below).

## Key governance note (contract gap, honestly reported)

The certified platform does **not** expose a Business Quality × Valuation **classification** (quadrant/band). Per the Phase 9 hard stop, this UI presents a **presentational scatter** of the two certified axis scores and does **not** reconstruct the matrix. This is the boundary-respecting implementation. If a certified matrix classification is later required, it belongs in the governed v2.0 layer, not React.

## Status

**PHASE 9 COMPLETE.** Awaiting approval before Phase 10 (Evidence Explorer — NOT yet authorized).
