# Program v3.0 — Phase 7: Company Intelligence (Completion Report)

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** Phase 7 — Company Intelligence
**Location:** `frontend/` + `frontend/server/executive-transport.ts`
**Status:** COMPLETE — real certified company data, traceable sources, no frontend analytical calculations, no v2.0/v1.1 change.
**Date:** 2026-08-09

---

## 1. Company page architecture

`React` → `fetchCompanyData(sector)` (typed client) → `/api/company/:id` (Vite proxy) → **v3.0 transport/adapter** → **certified sector engine + golden expected-outputs** → frozen v1.1 Replay Baseline inputs.

Answers **"What does the certified platform say about this company, why, and can I verify/replay it?"**

## 2. Route implementation

`/research/company/:id` renders `<CompanyIntelligence/>` (was placeholder). `/research`, `/research/sector/:id`, `/research/cross-sector` remain placeholders (later phases).

## 3. Data-flow / API mappings

- Live engine execution → composite + verdict (all sectors).
- **Pillar scores** → certified golden expected-outputs (`*expected-outputs-1.0.0.json`), sector-specific keys.
- **Confidence** → certified golden expected-outputs where present; else null.
- **Input metrics** → frozen Replay Baseline inputs (SNAPSHOT).
- CSIP feed → governed golden pillars via the certified OntologyMapper mapping.

## 4. Complete UI-field → source mapping

| UI field | API DTO | v2.0/platform contract | Engine output/source |
|---|---|---|---|
| Verdict / composite | `decision.verdict/composite` | `ExecutionResult.metadata` | Live certified sector engine |
| Confidence | `decision.confidence` | Golden expected-outputs `confidence` | Frozen reference (or null) |
| Overrides | `overrides` | `metadata.overridesApplied` | Live engine (6 later sectors) |
| Business Quality/Growth/Valuation/Risk pillars | `pillars` (sector-specific) | Golden expected-outputs `pillars` | Frozen reference |
| Company inputs | `inputs` | Replay Baseline input fields | Frozen reference (SNAPSHOT) |
| Evidence | `evidence` | `EvidencePackage` mapping | 1:1 |
| Provenance/freshness | `provenance` | Transport | SNAPSHOT |

**Pillars are displayed with their certified sector-specific labels** (e.g., Banking `asset-quality`, `funding-quality`, `capital-strength`; Healthcare `clinical-quality`). Where a pillar is not exposed (e.g., confidence absent), it shows **unavailable** — never fabricated.

## 5. G2 transport additions (minimum)

Added `/api/company/:id` + `computeCertifiedCompany`, and `loadGoldenPillars()`/`csipInputs()` to source governed golden pillars. Semantically inert; 1:1 DTO mapping.

## 6. Components reused (Phase 4)

`CompanyHeader` (new reusable) · `MetricCard/MetricGroup` · `DataTable` · `DecisionBadge` · `EvidenceCard` · `StatusBadge` · `CertifiedBadge`/`FreshnessBadge` · `LoadingState`/`ErrorState`/`UnavailableState`.

## 7. New reusable components

- `CompanyHeader` (added to `components/company/` — reusable, tested).

## 8. Confirmation — no frontend analytical calculations

- **No** score/confidence/weight/ranking/threshold/valuation/quality/risk/recommendation logic in React.
- **No** derived "health"/quality indicator computed from raw inputs.
- Every value traced to a governed certified source; missing metrics show unavailable.

## 9. Decision authority handling

- All investment values marked **CERTIFIED RESULT** (`CertifiedBadge`).
- **No AI on this surface** — no AI text could be mistaken for a decision.

## 10. Evidence / replay integration

- Evidence entry (`EvidenceCard`) per company + **Open replay** link → `/evidence/replay/:id`.
- Path: Decision → Factors → Metrics → Snapshot → Evidence → Replay.

## 11. Freshness / provenance

- **SNAPSHOT** badge; provenance shown; **SNAPSHOT ≠ STALE**.
- Unavailable values → `UnavailableState`/`ErrorState`, never `0`/fabricated.

## 12. Historical-data source

- **None fabricated.** Historical/trend comparisons are **not** computed from frontend math. (No governed historical contract was introduced; the surface shows current certified snapshot + replay entry.)

## 13. Accessibility

Semantic HTML, `aria-label`, `role="status"`/`alert`, non-color-only badges, tables `th scope`, focus (global).

## 14. Responsive

Grids `repeat(auto-fill, minmax(...))`; inherits global breakpoints.

## 15. Tests

- **69/69 tests pass** (61 + 6 Company + 2 CompanyHeader) across 13 files.
- `tsc --noEmit` (strict) → clean.

## 16. Production build

`vite build` succeeds (192 kB JS, 61 kB gzip).

## 17. G3 limitations (unchanged)

- Serves the **certified reference portfolio/company (SNAPSHOT)**, not live tenant data.
- Auth/session is the minimal dev-mode mechanism; **real auth/session/tenant boundary remains a separate, pending, governed requirement** (not solved opportunistically).

## 18. v2.0/v1.1 semantics unchanged

- No changes outside `frontend/`.
- Transport runs the certified platform + reads frozen golden expected-outputs; semantically inert.

## 19. Commit hash

See the Phase 7 commit (below).

## Status

**PHASE 7 COMPLETE.** Awaiting approval before Phase 8 (Cross-Sector Intelligence — NOT yet authorized).
