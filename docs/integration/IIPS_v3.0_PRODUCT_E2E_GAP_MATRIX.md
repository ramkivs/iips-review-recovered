# IIPS v3.0 — Product E2E Gap Matrix (10-Engine LTS, from merged `main@6628aef`)

**Authority:** IIPS v3.0 — PRODUCT E2E TRACK CONTINUATION FROM MERGED 10-ENGINE BASELINE  
**Baseline:** `6628aef67d1fdbf27ac8da31758bd60589c2e440` (merge `c65d533 → bbbca16 → 3a610f0 → f866364 → e47dc4c → 6628aef`, 22 files 3018 insertions)  
**Engine scope:** `IES-006…IES-015` (10 LTS FROZEN) — **authoritative**; `IES-016/017/020` **BLOCKED / OUTSIDE SCOPE**  
**Taxonomy frozen:** `IT→IES-015`, `Chemicals→IES-014`, `Realty→IES-015` (`TAXONOMY_RESOLVED 422`)  
**E2E-030:** `PENDING / NOT CLAIMED`  
**Date:** 2026-09-04  
**Predecessor discovery:** `docs/integration/IIPS_v3.0_PRODUCT_E2E_DISCOVERY.md` (`6628aef`) — read-only, 15 packages

> This gap matrix is the required §5 artifact before bounded implementation. It separates already complete / prerequisite infrastructure / implementation required / evidence required / authority blocked. No frozen engine/CSIP/taxonomy/E2E-013 change is authorized.

---

## 1. Gap Matrix (Minimum Template + Separation)

| Area | Current State (6628aef) | Required State | Gap | Authority Basis | Action |
|---|---|---|---|---|---|
| **Engine → CSIP** | `10 EngineOutputs(sector.banking…technology, 1.0.0, Watch 47.1…Buy 76.3) → CrossSectorEngine.run(Balanced)` deterministic (`holdings 10, ranking 10==source, allocation/diversification/correlation/opportunity/evidence deterministic`, `freshness SNAPSHOT`); `csip-product-e2e 3/3` pass | Same — 10 holdings, deterministic, `provenance{dataSource, freshness SNAPSHOT, calibratedAt 2026-08-09}` preserved | **None** | Merged `main@6628aef` + `csip-product-e2e` + `PROGRAM_v1.1_REPLAY_BASELINE.json` | **Already complete** — no implementation; preserve |
| **CSIP → Executive API** | `GET /api/executive` implemented (`computeCertifiedExecutive` 1:1 DTO, `portfolio.holdings 10, diversification, ranking 10, opportunity, correlation, decisions 10, provenance SNAPSHOT`); **no dedicated HTTP transport test** | Same DTO + **HTTP contract validated**: `200` with `holdings 10, ranking 10, provenance.freshness SNAPSHOT, calibratedAt 2026-08-09, transportSemantics 1:1`, deterministic rerun identical, no `016/017/020` | **Evidence gap: missing product HTTP test** | `frontend/server/executive-transport.ts:204` + `api/executive.ts` + CSIP contract | **Implementation required:** `frontend/server/product-transport.test.ts` (executive) + evidence bundle |
| **CSIP → Portfolio API** | `GET /api/portfolio` implemented (`holdings 10 with weight from sectorExposure, allocation{strategy,recommendation,rulesApplied}, evidenceRefs 10, provenance SNAPSHOT`); no transport test | Same + **HTTP validated** (`holdings 10, allocation.strategy Balanced, evidenceRefs 10, provenance SNAPSHOT`, deterministic) | **Evidence gap** | `executive-transport.ts:243` + `api/portfolio.ts` | **Implementation required:** portfolio HTTP test |
| **CSIP → Cross-Sector API** | `GET /api/cross-sector` implemented (`ranking 10, opportunity, decisions 10, provenance SNAPSHOT`); no transport test | Same + **HTTP validated** (`ranking 10, opportunity, provenance SNAPSHOT`, deterministic, `sector.telecom` never present) | **Evidence gap** | `executive-transport.ts:437` + `api/crossSector.ts` | **Implementation required:** cross-sector HTTP test |
| **API → Executive UI** | `ExecutiveDashboard.tsx` consumes `fetchExecutiveData`, `CertifiedBadge+SNAPSHOT`, `Loading→Error→data`, 10 decisions `DataTable`, no fabrication | Same — UI consumes governed contract, only 10, preserves `SNAPSHOT`, handles `Error/Unavailable` | **None** (already complete, 4 mocked tests) | `ExecutiveDashboard.tsx` + `api/executive.ts` | **Already complete** — no rewrite; preserve |
| **API → Portfolio UI** | `PortfolioWorkspace.tsx` consumes `fetchPortfolioData`, presentational sort, `SNAPSHOT` | Same | **None** (6 mocked tests) | `PortfolioWorkspace.tsx` | **Already complete** |
| **API → Cross-Sector UI** | `CrossSectorIntelligence.tsx` consumes `fetchCrossSectorData`, presentational sort, `SNAPSHOT` | Same | **None** (6 mocked tests) | `CrossSectorIntelligence.tsx` | **Already complete** |
| **Evidence / provenance** | Product DTOs carry `provenance{dataSource:'certified v2.0 platform…', freshness:SNAPSHOT, calibratedAt:2026-08-09, transportSemantics:'1:1'}`; engine evidence via `EvidencePipeline→Snapshot→Replay` (engine 25/25) — **product provenance not HTTP-evidenced** | Same + **HTTP evidence**: each product `GET` returns `provenance.freshness SNAPSHOT, calibratedAt 2026-08-09, dataSource certified`, `evidenceRefs` traceable to `ev_<sector>` / `snap_<sector>` | **Evidence required** (product provenance via HTTP) | `executive-transport.ts` provenance literals + `EvidencePipeline` | **Implementation required:** provenance assertions in product HTTP tests |
| **Replay** | `GET /api/replay/:id` returns `{original, replay{reproduced:true, byteIdentical:true, evidenceRefs}, differenceAvailable:false, provenance SNAPSHOT}` (hard stop); engine replay tested `replay-e2e 4/4`, product replay not HTTP-tested | Same + **HTTP validated**: `replay reproduced+byteIdentical` for all 10 sectors, `UNKNOWN→404`, `differenceAvailable:false` note | **Evidence required** | `ReplayService` + `executive-transport.ts:334` | **Implementation required:** replay HTTP test |
| **Determinism** | `computeCertifiedPlatform()` uses `fixed 2026-08-09 + deterministic IdProvider`; CSIP deterministic (`csip-product-e2e`); product DTOs rerun identical | Same + **HTTP deterministic**: `GET /api/executive` twice → same `portfolio.holdings/ranking/provenance`, `GET /api/portfolio` twice → same `allocation.holdings`, `GET /api/cross-sector` twice → same `ranking` | **Evidence required** | `Clock fixed + IdProvider deterministic` | **Implementation required:** determinism assertions in product HTTP tests |
| **Freshness** | All product DTOs `freshness:SNAPSHOT` (frozen reference, not `STALE/LIVE`); UI shows `SNAPSHOT` badge, `StaleDataState` only if `STALE` | Same — preserve `SNAPSHOT` (frozen), never `STALE` for reference portfolio | **None** | `executive-transport.ts` provenance literals | **Already complete** — verify via product HTTP tests |
| **Error/unavailable behavior** | Engine `POST 404 DENIED` for `sector.materials/telecom/auto` (tested), `GET /api/engines 10 only`; product `GET /api/company/:id|evidence/:id|replay/:id` returns `404` for unknown (implemented) but **not tested**; product UIs handle `ErrorState` via mocked `fetch` rejection | Same + **HTTP validated**: `GET /api/company/Unknown→404`, `GET /api/evidence/Unknown→404`, `GET /api/replay/Unknown→404`, `GET /api/company/telecom→404` (never certified), product `GET /api/executive|portfolio|cross-sector` never `404` for authorized 10 | **Implementation required:** negative/boundary product HTTP tests (404) + existing UI error states preserved |
| **Screenshot/evidence parity** | No automated screenshots; prior engine evidence `CONTINUATION_EVIDENCE 274`; product evidence via DTO provenance + UI badges; no screenshot authority requiring pixel parity | Same — **product HTTP evidence bundle is the required parity** (no screenshot fabrication); screenshot parity only where existing authority explicitly requires it (none for product) | **Evidence required** (bundle, not screenshot) | Discovery §1.7 | **Evidence required:** `PRODUCT_E2E_EVIDENCE.md` bundle + regression counts |
| **Product E2E certification boundary** | `E2E-030` pending, `E2E-025→029` technically complete for 10 at `e47dc4c`, now merged | Same — product technically complete but **still uncertified**, boundary `implemented≠certified` | **Authority blocked** — do not claim `E2E-030` | `FINAL_CONTINUATION_REPORT §9` | **Already complete** — report boundary explicitly |

---

## 2. Separation Summary

### Already Complete (Preserve, No Rewrite)
- Engine → CSIP (10 deterministic, `csip-product-e2e 3/3`)
- API → Executive / Portfolio / Cross-Sector UI (all 10, `SNAPSHOT`, `CertifiedBadge`, presentational only, 4+6+6 mocked tests)
- Freshness (`SNAPSHOT` preserved)
- Taxonomy (`IT/Chemicals/Realty` never separate) & `016/017/020` blocked
- Product E2E certification boundary (`E2E-030` pending)

### Prerequisite Infrastructure (Leverage, Do Not Rebuild)
- `computeCertifiedPlatform()` + `Container/PluginLoader/RuntimeCoordinator` on `PROGRAM_v1.1_REPLAY_BASELINE.json` frozen inputs
- `CrossSectorEngine` 9-stage pipeline
- `EvidencePipeline/SnapshotService/ReplayService` (governed)
- `executive-transport.ts` 1:1 DTO mapping (already implemented, semantically inert)
- Typed API clients `executive.ts / portfolio.ts / crossSector.ts`

### Implementation Required (Bounded, Adapter/Contract Wiring Only)
1. **Product API contract integrity** — `GET /api/executive|portfolio|cross-sector` must be HTTP-validated (200, `holdings 10, ranking 10, provenance SNAPSHOT`, no `016/017/020`).
2. **CSIP-to-product data flow** — verify `engineOutputs(10) → CSIP → product DTOs` via HTTP (not mocked fixtures) — holdings/ranking/allocation traceable.
3. **Provenance/evidence propagation** — each product HTTP response carries `provenance{dataSource, freshness:SNAPSHOT, calibratedAt:2026-08-09, transportSemantics:1:1}` + `evidenceRefs`/`snapshotRef` equivalent.
4. **Deterministic behavior** — product `GET` twice → identical `portfolio/ranking/allocation/provenance` (fixed clock + deterministic).
5. **Replay linkage** — `GET /api/replay/:id` for all 10 → `reproduced+byteIdentical+evidenceRefs`, `UNKNOWN→404`, `differenceAvailable:false`.
6. **Unavailable/error states** — `GET /api/company|evidence|replay/Unknown→404`, `sector.telecom→404` never certified; product UIs already handle `ErrorState` (preserve).
7. **Screenshot/evidence parity** — produce HTTP evidence bundle (not screenshot fabrication) where authority requires product parity.

### Evidence Required
- `frontend/server/product-transport.test.ts` (new) — product HTTP tests for executive/portfolio/cross-sector/company/evidence/replay (+ determinism + provenance + negative 404)
- `docs/integration/IIPS_v3.0_PRODUCT_E2E_EVIDENCE.md` — fresh product evidence bundle (HEAD, discovery, gap matrix, implementation, API/UI/provenance/determinism/negative/screenshot parity, regression, changed files, governance integrity)
- `docs/integration/IIPS_v3.0_PRODUCT_E2E_REPORT.md` — final product report (12-item style, matrix, boundary)

### Authority Blocked (Must Remain Outside Scope)
- `IES-016 Telecom`, `IES-017 Auto`, `IES-020 Materials` — creation, exposure as certified, or inclusion in `holdings/ranking/decisions` is **blocked**; `POST sector.telecom→404` preserved, `GET /api/company/telecom→404`, `grep CSIP sector.telecom→0`.
- `E2E-030 certification` — do not claim, even if product technically complete.
- Frozen artifacts (`E2E-013`, freeze manifests, scoring/metrics/calibration, taxonomy) — no change.
- `G:\IIPS` Windows-only artifacts — unverifiable, not inferred.

---

## 3. Implementation Priorities (Bounded)

Per §6, in order:

1. Product API contract integrity (`/api/executive|portfolio|cross-sector` 200 + 10 holdings + `SNAPSHOT`)
2. CSIP-to-product data flow (10 → CSIP → DTO, 1:1, no recomputation)
3. Provenance/evidence propagation (`provenance` + `evidenceRefs` + `snapshotRef` traceability)
4. Deterministic behavior (fixed clock/id, rerun identical)
5. Replay linkage (`byteIdentical`, `differenceAvailable:false`)
6. UI consumption (already complete — verify via existing mocked tests, do not rewrite)
7. Unavailable/error states (404 for `016/017/020` and unknown, `422` preserved for `TAXONOMY_RESOLVED`)
8. Screenshot/evidence parity (HTTP bundle, not fabricated screenshots)
9. End-to-end regression (274 existing + new product HTTP)

Do not rewrite working Engine Integration infrastructure; prefer adapters/contract wiring (`product-transport.test.ts`) over upstream engine changes.

---

## 4. Determinism and Provenance Preservation (Required)

Every Product E2E path must preserve, where already supported:

- `IES` identity (`IES-006…015`)
- `engineId` (`sector.banking`…`technology`)
- `engineVersion` `1.0.0`
- `calibrationVersion` `1.0.0`
- `snapshotId` `snap_<sector>`
- `evidenceId` `ev_<sector>`
- `deterministic:true`
- `freshness:SNAPSHOT`
- `replayReference snap_<sector>`
- `request/lineage deterministic` (for engine dispatch; product is via frozen baseline, `calibratedAt 2026-08-09`)

Repeat same authorized input/context (frozen `BASELINE` sectors) and verify deterministic outputs remain stable. Do not weaken guarantees.

---

## 5. Negative and Boundary Cases (Required)

- **Unsupported/unavailable engines:** `GET /api/company/telecom`, `GET /api/evidence/telecom`, `GET /api/replay/telecom`, `POST /api/engines/sector.telecom/execute` → `404 DENIED` / `404`, never enters `holdings/ranking/decisions`.
- **Taxonomy-resolved:** `GET /api/company/IT`, `sector.it`, `sector.chemicals`, `sector.realty` → `404` (never separate engine), `TAXONOMY_RESOLVED` guard `422` preserved at engine layer.
- **Product API errors:** `GET /api/executive` always `200` for authorized 10 (no malformed product request surface), but `GET /api/company|evidence|replay/:unknown→404` must be governed (`404` not `500`), `unsupported-api-version→422` at engine layer preserved.

---

## 6. Governance-Integrity Preflight (Before Implementation)

Verify before finalizing (§12):

- `E2E-013` unchanged
- Freeze manifests `ies-010…015/IES-0*_FREEZE_MANIFEST.json`, `IES010…015_FINAL_READINESS_CERTIFICATE.md` unchanged
- Scoring/metrics/calibration unchanged (`iips-platform/src/sector-engines/*/scoring|metrics|calibration/`)
- Taxonomy unchanged (`EngineRegistry.TAXONOMY_RESOLVED`)
- Certified engine implementation unchanged (`iips-platform/src/sector-engines/banking…technology`)

If upstream frozen must change, **STOP** and surface dependency.

---

## 7. Commit Discipline for Product E2E (Next Phase)

- **Starting HEAD:** `6628aef67d1fdbf27ac8da31758bd60589c2e440` (single-line, this matrix)
- **Working branch:** `arena/01a06c00-iips-review-recovered` (now at `6628aef`, synchronized with `main`)
- **After implementation:** show `git status`, `git diff --stat`, `git diff --cached --stat`, run strongest regression, verify `git diff c65d533..HEAD -- frozen →0`, commit only authorized Product E2E changes (`product-transport.test.ts` + `PRODUCT_E2E_EVIDENCE.md` + `PRODUCT_E2E_REPORT.md`), push `arena`, verify `ls-remote`, clean working tree.

Do not merge to `main` without separate authorization (STOP after this product pass).

---

## 8. Certification Boundary (Hold)

Do **NOT** claim `E2E-030`. Distinguish:

- *technically implemented* (product `GET` 1:1 DTO exists)
- *technically validated* (product HTTP tests pass)
- *evidenced* (bundle + regression)
- *formally accepted* (requires program authority after product evidence)
- *certified* (separate `E2E-030` gate, not this pass)

If technically complete but certification requires separate gate, report boundary explicitly — **product work remains `technically complete, still uncertified`**.
