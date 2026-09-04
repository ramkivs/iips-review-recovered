# IIPS v3.0 — Product E2E Discovery (Authorized 10-Engine LTS Baseline)

**Authority:** IIPS v3.0 — PRODUCT E2E TRACK CONTINUATION FROM MERGED 10-ENGINE BASELINE  
**Date:** 2026-09-04  
**Baseline (merged main):** `6628aef67d1fdbf27ac8da31758bd60589c2e440`  
**Source lineage:** `c65d53373717aacc3a1dce12d47b5aeaf50541a5 → bbbca164f227f12800b9cc51ac383d25b9e31def → 3a610f0604354c97dbe3b9fb953dd4766d74c343 → f866364b3ead3b24474cc654ac3aa9582f072696 → e47dc4ce7a0347a5e8cf9b498b0a0833aae7565d → 6628aef67d1fdbf27ac8da31758bd60589c2e440` (merge --no-ff, 22 files 3018 insertions preserved)  
**Branch:** `arena/01a06c00-iips-review-recovered` (now at `6628aef`, synchronized with `main`)  
**Engine scope:** `IES-006…IES-015` (10 LTS, `sector.banking` … `sector.technology`, 1.0.0 FROZEN, `PROGRAM_v1.1_REPLAY_BASELINE.json` 10 sectors, `Watch 47.1` … `Buy 76.3`) — **authoritative**  
**Blocked outside scope:** `IES-016 Telecom`, `IES-017 Auto`, `IES-020 Materials` — **BLOCKED / OUTSIDE SCOPE** (no directory/engine/manifest, `POST 404 DENIED`)  
**Taxonomy frozen:** `IT→IES-015`, `Chemicals→IES-014`, `Realty→IES-015` — `TAXONOMY_RESOLVED` guard `422`  
**E2E-030:** `PENDING / NOT CLAIMED` (no certification claim)

> Read-only discovery. No code modified. All 40-hex pins single-line grep-able. This document is the required pre-implementation Product E2E Discovery + Current-State Matrix (§2).

---

## 1. Existing Product E2E Work Packages and Status (at `6628aef`)

### 1.1 Engine → CSIP (already verified at `bbbca16`/`e47dc4c`)

- **Engine integration:** `iips-platform/src/integration/EngineRegistry.ts` (10 FROZEN entries, `TAXONOMY_RESOLVED`), `EngineApiAdapter.ts` (deterministic `fixed 2026-08-09 + deterministic IdProvider`, `PluginLoader→RuntimeCoordinator`, provenance `snapshotRef/ev_*`), `GET /api/engines` + `POST /api/engines/:id/execute` in `frontend/server/executive-transport.ts` + `engine-transport.test.ts` (14 engine-api + 6 HTTP) — **TECHNICALLY COMPLETE** for 10, evidenced `274/274` at `e47dc4c`.
- **CSIP:** `iips-platform/src/sector-engines/cross-sector/CrossSectorEngine.ts` (OntologyMapper → PortfolioIntelligence → Ranking → Allocation → Diversification → Opportunity → Correlation → Evidence → Reporting) — deterministic, `csip-product-e2e.test.ts` 3/3 (10 holdings, ranking 10==source, allocation/diversification/correlation/opportunity/evidence deterministic), `program-v1.1-track6-csip-certification` etc. — **COMPLETE**.

### 1.2 CSIP → Product APIs (at `6628aef` — transport layer)

**Transport file:** `frontend/server/executive-transport.ts` (665 lines, imports certified platform in-process, `computeCertifiedPlatform()` builds `Container→PluginLoader→SnapshotService→ReplayService→RuntimeCoordinator` on `PROGRAM_v1.1_REPLAY_BASELINE.json` frozen inputs, `GOLDEN_PILLARS` from `*-expected-outputs-1.0.0.json`).

| Surface | Route | Handler | DTO | Freshness/Provenance | State |
|---|---|---|---|---|---|
| Executive | `GET /api/executive` | `computeCertifiedExecutive()` → `engineOutputs(10) + pr(CSIP)` | `ExecutiveData {portfolio, diversification, ranking(10), opportunity, correlation, decisions(10), provenance{dataSource:'certified v2.0 platform…', freshness:'SNAPSHOT', calibratedAt:'2026-08-09T00:00:00.000Z', transportSemantics:'1:1 mapping'}}` | `SNAPSHOT` (frozen reference, not live) | **Implemented** (no dedicated transport test) |
| Portfolio | `GET /api/portfolio` | `computeCertifiedPortfolio()` | `PortfolioData {portfolio, diversification, allocation{strategy,recommendation,rulesApplied}, holdings(10, weight from sectorExposure), opportunity, correlation, evidenceRefs(10), provenance SNAPSHOT}` | `SNAPSHOT` | **Implemented** (no transport test) |
| Cross-Sector | `GET /api/cross-sector` | `computeCertifiedCrossSector()` | `CrossSectorData {portfolio, diversification, ranking(10), opportunity, correlation, decisions(10), provenance SNAPSHOT}` | `SNAPSHOT` | **Implemented** (no transport test) |
| Decision-Matrix | `GET /api/decision-matrix` | `computeCertifiedDecisionMatrix()` | `DecisionMatrix {matrixType:'scatter', companies(10, quality/valuation), universe, provenance SNAPSHOT}` | `SNAPSHOT` | Implemented (presentational, no separate UI) |
| Company | `GET /api/company/:id` | `computeCertifiedCompany(id)` | `{companyId, sector, decision{verdict,composite,confidence}, overrides, pillars, inputs, evidence, provenance SNAPSHOT}` | `SNAPSHOT` | Implemented (CompanyIntelligence consumes) |
| Evidence | `GET /api/evidence/:id` | `computeCertifiedEvidence(id)` | `{decision, evidence{ev_*, supportingScores, keyMetrics, calibrationVersion, replayReference}, snapshot, replay{reproduced,byteIdentical}, provenance SNAPSHOT}` | `SNAPSHOT` | Implemented |
| Replay | `GET /api/replay/:id` | `computeCertifiedReplay(id)` | `{original{snapshotId, verdict, composite}, replay{reproduced,byteIdentical, evidenceRefs}, differenceAvailable:false, provenance SNAPSHOT}` | `SNAPSHOT` | Implemented |
| Health | `GET /api/health` | static `{status:'ok'}` | — | — | Implemented |
| Engines | `GET /api/engines`, `POST /api/engines/:id/execute` | `EngineApiAdapter` | `EngineListData, EngineExecuteResponse` with `provenance{ies, engineVersion, calibrationVersion, snapshotId, evidenceId, deterministic:true, runtimeConfig{clock:'fixed', idProvider:'deterministic'}}` | `FROZEN` | **Complete + tested** (engine-transport 14+6) |

**Product API tests existing:** `frontend/server/engine-transport.test.ts` covers **only** `GET /api/engines` + `POST /api/engines/:id/execute` (10 engines, 404/422/400, determinism). **No** `frontend/server/executive-transport.test.ts` for `/api/executive|portfolio|cross-sector|decision-matrix|company|evidence|replay` — **gap**. No product negative/boundary tests for those surfaces. No deterministic replay test for product DTOs.

### 1.3 Engine Provenance / Evidence Contract

- `EvidencePipeline.build() → {evidenceId ev_*, recommendation, compositeScore, confidence, keyMetrics, supportingScores, calibrationVersion, decisionRulesApplied, replayReference, provenance{frameworkVersion, engineVersion, methodologyVersion, snapshotId}, generatedAt}` — frozen, `validate()` true.
- `SnapshotService→SnapshotStore.get(snapshotRef) → {snapshotId SNAP_*, engineId, schemaVersion snapshot-1.0, frozen metrics, evidenceRefs}`.
- `ReplayService.replay(snapshotId) → {reproduced:true, byteIdentical:true, evidenceRefs:[ev_*]}`; `differenceAvailable:false` hard stop.
- Product DTOs propagate `provenance{dataSource, freshness:SNAPSHOT, calibratedAt:2026-08-09, transportSemantics:1:1}` — **preserved** in executive/portfolio/cross-sector/evidence/replay/company.

### 1.4 Replay Contract

- Governed `ReplayService` surface only (`reproduced, byteIdentical, evidenceRefs`); `DistributedRuntime` same input → same result on any node (tested in `replay-e2e`).
- Product replay: `GET /api/replay/:sector` returns `original + replay + differenceAvailable:false` — no field-level diff (hard stop). **Implemented but not transport-tested for product.**

### 1.5 Existing Product UI / Workspaces (at `6628aef`)

| Surface | Path | Component | API Consumed | Certified/Rigour | States | Test |
|---|---|---|---|---|---|---|
| Executive | `/executive` | `ExecutiveDashboard.tsx` (Phase 5, 163 lines) — `fetchExecutiveData()` → MetricGroup holdings/avgConviction/quality/risk/concentration/diversification, ranking DataTable, opportunity top, correlation/diversification flags, decisions DecisionBadge, evidenceRefs EvidenceCard, `CertifiedBadge + FreshnessBadge SNAPSHOT`, `StaleDataState` only if `provenance.freshness==='STALE'` | `GET /api/executive` | `CertifiedBadge`, `SNAPSHOT` | `Loading→data\|Error\|Unavailable` | `ExecutiveDashboard.test.tsx` 4/4 (mocked FIXTURE, no fabrication) |
| Portfolio | `/portfolio` | `PortfolioWorkspace.tsx` (Phase 6) — `fetchPortfolioData()` → MetricGroup, allocation Accordion, holdings DataTable sorted by sector/composite/weight (presentational), opportunity, correlation flags, evidenceRefs | `GET /api/portfolio` | `CertifiedBadge SNAPSHOT` | `Loading\|Error\|Unavailable` + presentational sort | `PortfolioWorkspace.test.tsx` 6/6 (mocked) |
| Cross-Sector | `/research/cross-sector` | `CrossSectorIntelligence.tsx` (Phase 8) — `fetchCrossSectorData()` → universe overview, ranking DataTable sorted conviction/sector (presentational), decisionDistribution DecisionBadge, opportunities, risks, composite BarChart, `CertifiedBadge SNAPSHOT` | `GET /api/cross-sector` | `CertifiedBadge SNAPSHOT` | `Loading\|Error\|Unavailable` | `CrossSectorIntelligence.test.tsx` 6/6 (mocked) |
| Company | `/research/company/:id` | `CompanyIntelligence.tsx` — consumes `GET /api/company/:id` | `company.ts` | `CertifiedBadge` | `Loading\|Error` | `CompanyIntelligence.test.tsx` 6/6 |
| Decision-Matrix | `/intelligence/decision-matrix` | `DecisionMatrix.tsx` — scatter quality/valuation | `GET /api/decision-matrix` | presentational | `Loading\|Error` | `DecisionMatrix.test.tsx` 6/6 |
| Evidence | `/evidence/:id` | `EvidenceExplorer.tsx` — `GET /api/evidence/:id` | `evidence.ts` | `CertifiedBadge` | `Loading\|Error` | `EvidenceExplorer.test.tsx` 6/6 |
| Replay | `/evidence/replay/:id` | `ReplayExplorer.tsx` — `GET /api/replay/:id` | `replay.ts` | `reproduced+byteIdentical` | `Loading\|Error` | `ReplayExplorer.test.tsx` 6/6 |
| Engines (registry) | `/research/engines` | `EngineRegistry.tsx` — `GET /api/engines` | `engines.ts` | `FROZEN` | `Loading\|Error\|Unavailable` | `EngineRegistry.test.tsx` 4/4 + `engine-transport` 6/6 |

**All product UIs are presentation-only** (no scoring recomputation, no ranking logic, only sort/filter/group/format), **only the authorized 10-engine universe**, **preserve `SNAPSHOT` freshness**, **never imply 016/017/020 certified**, **handle unavailable explicitly** (`UnavailableState`, `No ... available`).

### 1.6 Existing Product E2E Tests (at `6628aef`)

- **Platform integration:** `engine-api-integration 14, evidence-provenance 4, replay-e2e 4, csip-product-e2e 3` → **25/25** (10-engine, deterministic, provenance, 404/422, taxonomy)
- **Frontend engine HTTP/UI:** `engine-transport 6 + EngineRegistry 4` → **10/10**
- **Frontend full:** `vitest run` 26 files **151/151** (including Executive 4, Portfolio 6, Cross-Sector 6, Company 6, DecisionMatrix 6, Evidence 6, Replay 6, Engines 4)
- **Product transport:** **0** dedicated tests for `/api/executive|portfolio|cross-sector` (gap)
- **Product negative/boundary:** not explicitly tested for product surfaces (gap)
- **Screenshot/evidence parity:** no automated screenshot tests; manual evidence via `docs/integration` reports (gap where authority requires)

### 1.7 Existing Screenshots/Evidence Requirements

- Prior evidence: `IIPS_v3.0_ENGINE_INTEGRATION_EVIDENCE.md` (25+151), `CONTINUATION_EVIDENCE.md` (274), `FINAL_CONTINUATION_REPORT.md` (274) — all at `e47dc4c`.
- No product-specific screenshot parity artifact required by engine authority; product evidence is via API DTO + UI provenance badges. **No screenshot gap unless product authority explicitly requires it.**

### 1.8 Existing Certification/Readiness Artifacts (at `6628aef`)

- `program-v1.1-certification/` (15 files: `PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md 10/10 ies-006..015`, `REPLAY_BASELINE.json` 10 sectors, `TRACK1/3/6` etc.) — **LTS baseline, frozen, not modified by merge** (`git diff c65d533..6628aef -- program-v1.1-certification/ → 0` via parent, only additive docs).
- `ies-010…015/IES-0*_FREEZE_MANIFEST.json` + `IES010…015_FINAL_READINESS_CERTIFICATE.md` — **FROZEN**.
- No `IES-016/017/020` manifests.

### 1.9 Existing Product E2E Authority/Control Records (at `6628aef`)

- `IIPS_v3.0_AUTHORIZED_SCOPE_DISPOSITION.md` — controlling 10-engine LTS, 016/017/020 blocked.
- `IIPS_v3.0_ENGINE_INTEGRATION_RECONCILIATION.md` — HOLD reconciliation (engine identity, 6-point absence proof).
- `IIPS_v3.0_CONTINUATION_EVIDENCE.md` — 274-test fresh evidence (e47dc4c).
- `IIPS_v3.0_FINAL_CONTINUATION_REPORT.md` — 10-engine technically complete, E2E-030 pending, remaining dependency for 016/017/020.
- **No** `PRODUCT_E2E_DISCOVERY/GAP/EVIDENCE` yet — **this document is the first product discovery**.

---

## 2. Current-State Matrix (Product E2E, `main@6628aef`)

| # | Package | Current (6628aef) | Verdict |
|---|---|---|---|
| 1 | Engine → CSIP | 10 `sector.banking`…`technology` EngineOutputs → `CrossSectorEngine.run(Balanced)` deterministic (`holdings 10, avgConviction numeric, ranking 10==source, allocation/diversification/correlation/opportunity/evidence`); `R2/R3` preserved | **COMPLETE** |
| 2 | CSIP → Executive API | `GET /api/executive` implemented (`computeCertifiedExecutive` → 1:1 DTO, `holdings 10, freshness SNAPSHOT, provenance dataSource+calibratedAt+transportSemantics`, decisions 10) | **Complete, but HTTP contract not transport-tested** |
| 3 | CSIP → Portfolio API | `GET /api/portfolio` implemented (`holdings 10, allocation, evidenceRefs 10, provenance SNAPSHOT`) | **Complete, but not transport-tested** |
| 4 | CSIP → Cross-Sector API | `GET /api/cross-sector` implemented (`ranking 10, provenance SNAPSHOT`) | **Complete, but not transport-tested** |
| 5 | CSIP → Decision-Matrix/Company/Evidence/Replay | All `GET /api/decision-matrix|company/:id|evidence/:id|replay/:id` implemented (company 10 sectors, evidence `ev_*`, replay `byteIdentical`) | **Complete, but company/evidence/replay not transport-tested for negative 016/017/020** |
| 6 | API → Executive UI | `ExecutiveDashboard` consumes `fetchExecutiveData`, no fabrication, `CertifiedBadge+SNAPSHOT`, 10 decisions | **COMPLETE** (4 mocked tests) |
| 7 | API → Portfolio UI | `PortfolioWorkspace` consumes `fetchPortfolioData`, presentational sort, `SNAPSHOT` | **COMPLETE** (6 mocked tests) |
| 8 | API → Cross-Sector UI | `CrossSectorIntelligence` consumes `fetchCrossSectorData`, presentational sort, `SNAPSHOT` | **COMPLETE** (6 mocked tests) |
| 9 | Evidence/Provenance propagation | Product DTOs carry `provenance{dataSource, freshness:SNAPSHOT, calibratedAt:2026-08-09, transportSemantics:1:1}`; engine evidence via `EvidencePipeline→Snapshot→Replay` (tested at engine layer) | **COMPLETE** |
| 10 | Replay linkage | `GET /api/replay/:id` returns `reproduced, byteIdentical, evidenceRefs, differenceAvailable:false` (hard stop) | **COMPLETE** (engine replay tested, product replay not HTTP-tested) |
| 11 | Determinism | `computeCertifiedPlatform` uses `fixed 2026-08-09 + deterministic IdProvider` via `CrossSectorEngine`; product DTOs are deterministic re-runs of same frozen baseline (no randomness) | **Complete, but not explicitly product-HTTP-tested** |
| 12 | Freshness | All product surfaces surface `provenance.freshness==='SNAPSHOT'` (frozen reference), `STALE` only if platform reports `STALE` (none), `FRESHNESS=FROZEN` at engine registry | **COMPLETE** |
| 13 | Error/unavailable | Engine `POST 404 DENIED` for `sector.materials/telecom/auto`, `GET /api/engines 10 only`, UI `ErrorState/UnavailableState` for product fetch failure (mocked) — **product negative for unavailable sector at `/api/company|evidence|replay` returns 404 (implemented but not tested)** | **Partial — negative for product not covered** |
| 14 | IES-016/017/020 & Taxonomy | `IT/Chemicals/Realty` never separate engine (`TAXONOMY_RESOLVED 422`), product holdings never include `016/017/020` (verified `grep CSIP sector.telecom→0`, `sector.materials→DENIED`) | **COMPLETE** (preserved) |
| 15 | Screenshot/evidence parity | No automated screenshots; evidence via DTO provenance + UI badges; prior engine evidence 274 tests — **product HTTP evidence parity is the gap** | **Evidence required** |

---

## 3. Freshness / Provenance / Determinism Current

- **IES identity:** `engineId sector.banking…technology`, `ies IES-006…015`, `engineVersion 1.0.0`, `calibrationVersion 1.0.0` via `EngineRegistry` + `EngineApiAdapter` provenance chain — preserved in product `decisions` (sector) + `evidenceRefs` (engineId) + `provenance`.
- **Snapshot/Evidence/Replay:** `snapshotId snap_<sector>`, `evidenceId ev_<sector>`, `deterministic:true`, `replayReference snap_*`, `runtimeConfig{clock:'fixed', idProvider:'deterministic'}` — tested at engine, propagated to product via `provenance`.
- **Deterministic:** `computeCertifiedPlatform()` rerun identical `holdings/ranking/allocation` (CSIP deterministic); `crateClock fixed + IdProvider deterministic` — **product determinism is existent but not HTTP-evidence-tested**.

---

## 4. Certification Boundary (Discovery)

- **Implemented:** Engine→CSIP→Product APIs→UI (all 10) — **technically implemented, validated via mocked UI tests, but product transport not HTTP-validated**.
- **Evidenced:** Engine 25/25 + frontend 151/151 at `e47dc4c` — **product HTTP evidence not yet produced**.
- **Formally accepted / Certified:** **NOT** — `E2E-030` remains `PENDING unless independently satisfied — explicitly not claimed` (FINAL_REPORT §9).

---

## 5. Next: Gap Matrix Required

This discovery is read-only. The following **Product E2E Gap Matrix** (separate artifact `IIPS_v3.0_PRODUCT_E2E_GAP_MATRIX.md`) will enumerate gaps per §5 template (already complete / prerequisite / implementation required / evidence required / authority blocked) before any bounded implementation.

**Exact HEAD for next phase:** `6628aef67d1fdbf27ac8da31758bd60589c2e440` (single-line, grep-able) — work must record this baseline before implementation, verify clean working tree, and commit only authorized Product E2E changes.
