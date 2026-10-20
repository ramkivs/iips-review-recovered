# PKG-08 — Row 4 Sector Research Surface: Qualification Record

**Record ID:** `PKG-08-ROW4-QUAL-01`
**Date:** 2026-10-20 (UTC)
**Commission:** `PKG-08-ROW4-COMMISSION-01`
**Implementation authority:** `PKG-08-ROW4-IMPL-AUTH-01`
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Session branch:** `arena/759192ef-iips-review-recovered`
**Base:** `0231e162717c9c7bf8b14b304307231fa5c84a5e` (current `main`)
**Recording agent:** Arena Agent Mode — evidence execution and record preparation only

**Status:** **QUALIFIED — NON-PRODUCTION / IRR**

> **This record grants QUALIFICATION only.**
> **ACCEPTANCE IS NOT GRANTED by this record.** Acceptance is granted by the separate act `PKG-08-ROW4-ACCEPT-01`.
> **CERTIFICATION IS NOT GRANTED by this record.**
> **PRODUCTION READINESS IS NOT GRANTED by this record.**

---

## 1. Qualified implementation

| Coordinate | Value |
|---|---|
| **Qualified ref** | `arena/759192ef-iips-review-recovered` (session branch) |
| **Commit** | Pending (this record committed alongside implementation) |
| **Base** | `0231e162717c9c7bf8b14b304307231fa5c84a5e` (`main`) |
| **Scope** | Sector Research Surface at `/research/sector/:id` |

## 2. Implementation surface

### 2.1 New files

| File | SHA-256 | Size |
|---|---|---|
| `frontend/src/features/sector/SectorIntelligence.tsx` | committed with this record | governed sector research component |
| `frontend/src/features/sector/SectorIntelligence.test.tsx` | committed with this record | 12 component tests |
| `docs/integration/2026-10-20/PKG-08-ROW4-CONTRACT-PROPOSAL-PA-APPROVAL-2026-10-20.md` | committed with this record | PA contract approval |
| `docs/integration/2026-10-20/PKG-08-ROW4-IMPLEMENTATION-AUTHORITY-DECISION-ACT-2026-10-20.md` | committed with this record | implementation authority act |
| `docs/integration/2026-10-20/PKG-08-ROW4-QUALIFICATION-RECORD-2026-10-20.md` | this file | qualification record |

### 2.2 Modified files

| File | Change |
|---|---|
| `frontend/src/app/App.tsx` | Import `SectorIntelligence`; replace `FeaturePlaceholder` at `/research/sector/:id` |
| `frontend/src/app/navigation.ts` | Sector nav child path → `/research/sector/Banking` (concrete default); added to `AVAILABLE_CHILD_PATHS` |
| `frontend/src/app/App.test.tsx` | Remove `'Sector'` from parameterised-child exclusion list |

### 2.3 No new endpoints, DTOs, schemas, or server-side changes

All data comes from five existing governed endpoints consumed via existing typed clients.

## 3. Executed qualification evidence

| Run | Command | Result |
|---|---|---|
| R1 | `npx vitest run src/features/sector/SectorIntelligence.test.tsx` | **12/12 passed**, exit 0 |
| R2 | `npx vitest run src/app/App.test.tsx` | **18/18 passed**, exit 0 |
| R3 | `npx vitest run` (full suite) | **78 files / 947 tests passed**, 0 failed, 0 skipped, exit 0 |
| R4 | `npx tsc --noEmit` | **PASS**, exit 0 |
| R5 | `npm run build` | **PASS**, exit 0 (`280.88 kB`, gzip `80.19 kB`) |

### 3.1 Server-level E2E probes

Transport booted with `npx tsx server/executive-transport.ts` on `127.0.0.1:8787`:

| Probe | Result |
|---|---|
| `GET /api/company/Banking` | 200 — sector-keyed result, full provenance, `freshness: "SNAPSHOT"` |
| `GET /api/evidence/Banking` | 200 — evidence chain with `evidenceId: "ev_Banking"` |
| `GET /api/replay/Banking` | 200 — `reproduced: true, byteIdentical: true, differenceAvailable: false` |
| `GET /api/decision-matrix` | 200 — 13 sectors, `matrixType: "scatter"` |
| `GET /api/engines` | 200 — 13 engines, `freshness: "FROZEN"` |
| `GET /api/company/NotASector` | 404 — fail-closed for unknown sector |

## 4. Qualification dimensions

| Dimension | Verified behaviour | Evidence |
|---|---|---|
| **Sector identity and engine info** | Displays sector name, engine ID, IES, versions, calibration from `/api/engines` | R1, E2E probes |
| **Certified decision** | Verdict, composite, confidence from `/api/company/:sector` | R1 |
| **Null confidence** | "unavailable" rendered (never 0) | R1 |
| **Pillars** | Shown when exposed; `pillars-unavailable` panel when null (never derived) | R1 |
| **Frozen inputs** | SNAPSHOT input metrics displayed | R1 |
| **Universe position** | Quality/valuation from `/api/decision-matrix`; null → "unavailable" | R1 |
| **Evidence chain** | Evidence ID, recommendation, key metrics, supporting scores, decision rules | R1 |
| **Replay verification** | Reproduced, byte-identical, differenceAvailable:false; no field-level diff implied | R1 |
| **Provenance** | SNAPSHOT freshness, calibrated-at date, data source, frozen-baseline disclosure | R1 |
| **Selector** | Options sourced from `/api/decision-matrix`; navigation on change | R1 |
| **Company link** | Mandatory link to `/research/company/:sector` present | R1 |
| **Error handling** | Honest error state on fetch failure or unknown sector | R1 |
| **Sector-level semantics** | Data labelled as sector-level; `${sector}-H1` synthetic ID not presented as company | R1, component source |
| **No fabrication** | No computation, ranking, scoring, or derivation in React | R3, component source |
| **Regression** | All 935 pre-existing tests still pass; 12 new sector tests added (947 total) | R3 |

## 5. Existing surfaces preserved

| Surface | Status |
|---|---|
| Company Intelligence (`/research/company/:id`) | Unchanged |
| Cross-Sector Intelligence (`/research/cross-sector`) | Unchanged |
| Engine Registry (`/research/engines`) | Unchanged |
| Macro Research (`/research/macro`) | Unchanged |
| NP-07 accepted scope | Unchanged |

## 6. Operator-transferred checks (not performed by Arena)

| Check | Status |
|---|---|
| Real browser rendering | NOT VERIFIED |
| Windows-host execution | NOT VERIFIED |
| Responsive layout (multiple viewport widths) | NOT VERIFIED |
| Unassisted reader comprehension | NOT VERIFIED |

---

> ## **PKG-08 ROW 4 — QUALIFIED — NON-PRODUCTION / IRR**
>
> **This act does not grant acceptance, certification, promotion, or production readiness.**
