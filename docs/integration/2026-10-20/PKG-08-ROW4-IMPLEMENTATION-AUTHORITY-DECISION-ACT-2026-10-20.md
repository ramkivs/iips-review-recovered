# PKG-08 — Row 4 Sector Research Surface Implementation Authority Decision Act

**Record ID:** `PKG-08-ROW4-IMPL-AUTH-01`
**Date:** 2026-10-20 (UTC)
**Commission record:** `PKG-08-ROW4-COMMISSION-01`
**Contract proposal:** `PKG-08-ROW4-CONTRACT-PROPOSAL-01`
**PA approval:** `PKG-08-ROW4-CONTRACT-PROPOSAL-APPROVAL-01`
**Authority basis:** Program Authority — Ramki (Ramakrishnan); standing global authorization for routine in-scope execution; `PKG-08-ROW4-COMMISSION-01` product-scope authorization
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Authoritative ref:** `refs/heads/main` @ `0231e162717c9c7bf8b14b304307231fa5c84a5e`
**Recording agent:** Arena Agent Mode — recording and implementation only; no independent authority rendered
**Status:** **DECIDED AND RECORDED**

---

## 1. Decision

**Grant implementation authority** for the Sector Research Surface under the approved bounded contract.

This decision authorizes implementation of the Sector Research Surface as defined in the approved contract proposal. It does not alter, expand, or grant authority for any other surface, capability, or boundary.

## 2. Scope (authorized)

### 2.1 Files to create

| File | Purpose |
|---|---|
| `frontend/src/features/sector/SectorIntelligence.tsx` | Sector research component — presentational, read-only |
| `frontend/src/features/sector/SectorIntelligence.test.tsx` | Component tests — loading, success, error, unavailable, null cases, navigation, provenance |

### 2.2 Files to modify

| File | Change |
|---|---|
| `frontend/src/app/App.tsx` | Replace `<FeaturePlaceholder surface="Sector" />` with `<SectorIntelligence />` at the `/research/sector/:id` route |
| `frontend/src/app/navigation.ts` | Add `/research/sector/:id` to `AVAILABLE_CHILD_PATHS` so the Sector nav child is visible |
| `frontend/src/app/App.test.tsx` | Update two existing tests that currently assert `'Sector'` is not a rendered nav link; the Sector child is now visible and resolves to a built surface |

### 2.3 Endpoint and component reuse

**Existing endpoints consumed (no new endpoints):**
- `GET /api/company/:sector` via `fetchCompanyData` (`frontend/src/api/company.ts`)
- `GET /api/evidence/:sector` via `fetchEvidenceData` (`frontend/src/api/evidence.ts`)
- `GET /api/replay/:sector` via `fetchReplayData` (`frontend/src/api/replay.ts`)
- `GET /api/decision-matrix` via `fetchDecisionMatrixData` (`frontend/src/api/decisionMatrix.ts`)
- `GET /api/engines` via `fetchEngines` (`frontend/src/api/engines.ts`)

**Existing components reused:**
- `CompanyHeader` (sector-name header with null-confidence handling)
- `MetricGroup`, `MetricCard`, `DataTable` (certified value presentation)
- `DecisionBadge` (verdict display)
- `CertifiedBadge`, `FreshnessBadge`, `StatusBadge` (provenance/freshness/overrides)
- `LoadingState`, `ErrorState`, `UnavailableState` (honest states)
- `EvidenceCard` / `EvidenceReference` (evidence chain)

## 3. Exclusions (not authorized)

- No new API endpoint, DTO, schema, or server-side transport change.
- No AI advisory embedding.
- No cross-sector data consumption.
- No portfolio sector-exposure consumption.
- No change to `/research/company/:id` or `/api/company/:sector` naming.
- No change to the NP-07-accepted Company, Cross-Sector, or Engine Registry surfaces.
- No change to any governed act, fence, or iips-platform file.
- No IPD repository work.
- No sector constituent, time series, taxonomy, ranking, or aggregation capability.
- No inbound cross-links from existing surfaces.

## 4. Required tests and validation

### 4.1 Component tests (`SectorIntelligence.test.tsx`)

| Test | What it asserts |
|---|---|
| Loading state | `state-loading` rendered while fetching |
| Success with pillars | Sector identity, engine info, decision, pillar scores, evidence, replay summary all rendered |
| Success without pillars | `pillars-unavailable` panel rendered (never derived) |
| Null confidence | "unavailable" rendered (never `0`) |
| Error state | `state-error` rendered on fetch failure |
| Unknown sector | `state-error` rendered on 404 response |
| Selector options | 13 options sourced from `/api/decision-matrix` (not hardcoded) |
| Navigation on change | Selector change navigates to `/research/sector/:newId` |
| Provenance footer | Freshness `SNAPSHOT`, calibrated-at date displayed |
| Company link | Mandatory link to `/research/company/:sector` present |
| Universe position | Quality/valuation displayed; `null` axes → "unavailable" |

### 4.2 Application tests (`App.test.tsx` updates)

| Test | Change |
|---|---|
| `does not render parameterised or placeholder children as global links` | `'Sector'` removed from the excluded-names list; the Sector nav child is now visible with `:id` in its path but the nav rendering uses `ROUTES.researchSector` which is parameterised — the existing filter `!href.includes(':')` continues to exclude it from rendered links. The Sector child path `/research/sector/:id` is parameterised, so it remains in the nav data but the test's href filter correctly excludes it. |
| `resolves every clickable nav destination to a built surface` | No change needed — this test already filters out parameterised paths. The Sector surface is reachable by URL but not as a rendered nav link. |

### 4.3 Regression

- All 935+ existing tests must continue to pass.
- `tsc --noEmit` must exit 0.
- `npm run build` must exit 0.

### 4.4 Server-level E2E

At a named commit, the composed transport serves all five endpoints for a canonical sector, and the sector page renders from those responses.

## 5. Qualification and acceptance boundaries

| Boundary | Status |
|---|---|
| Qualification | Separate record required after implementation |
| Acceptance | Separate record required after qualification |
| Browser/Windows/operator checks | Arena cannot perform; must be operator-transferred |
| Production/release authority | Not granted |

## 6. Environmental checks outside Arena's capability

The following cannot be verified by Arena and require the product owner's local environment:

- Real browser rendering (Chromium/Firefox/Safari)
- Windows-host execution
- Responsive layout at multiple viewport widths
- Unassisted reader comprehension

These are recorded as **NOT VERIFIED** until operator-transferred evidence is supplied.

## 7. Effectiveness

This act takes effect when recorded and the implementation is committed. The governance records are committed alongside the implementation changes in a single atomic commit.

---

*Recording agent: Arena Agent Mode — recording and implementation only; no independent authority rendered.*

**End of implementation authority act `PKG-08-ROW4-IMPL-AUTH-01`.**
