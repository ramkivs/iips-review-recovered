# IIPS v3.0 Engine Integration — Evidence Record (E2E-025 → E2E-029)

**Date:** 2026-09-04T00:00:00.000Z (fixed-clock provenance)  
**Branch:** `arena/01a06c00-iips-review-recovered`  
**HEAD:** `c65d53373717aacc3a1dce12d47b5aeaf50541a5` (plus uncommitted integration slice — see §1)  
**Authority baseline:** Program v1.1 LTS `program-v1.1.0` (10 engines IES-006…015) — no freeze-manifest amendment  

---

## 1. Files changed (this integration slice — narrow scope, additive only)

> No governance record, freeze manifest, readiness certificate, verification report, or regression expectation was modified. Only additive integration code + tests + docs.

| # | Path | Change | E2E |
|---|------|--------|-----|
| 1 | `iips-platform/src/integration/EngineRegistry.ts` | **New** — frozen certified-engine registry (10 entries IES-006…015, engineId↔IES↔sectorFamily↔capabilities, taxonomy-resolved guard for IT/Chemicals/Realty) | E2E-025 |
| 2 | `iips-platform/src/integration/EngineApiAdapter.ts` | **New** — additive engine API adapter (listEngines + execute(engineId, inputs) via governed RuntimeCoordinator/PluginLoader/Snapshot/Replay/Evidence/Transport; version gate 1.0, deterministic clock/id, TRANSPORT validation, DENIED/FAILED provenance) | E2E-025, E2E-027, E2E-028 |
| 3 | `iips-platform/src/integration/index.ts` | **New** — barrel export for the integration layer | E2E-025 |
| 4 | `frontend/src/api/engines.ts` | **New** — typed API client for `GET /api/engines` + `POST /api/engines/:engineId/execute` (semantically inert) | E2E-025, E2E-026 |
| 5 | `frontend/src/features/engines/EngineRegistry.tsx` | **New** — Engine Registry workspace (UI→API→Engine→response→UI, loading/success/error, CertifiedBadge/FreshnessBadge, provenance) | E2E-026 |
| 6 | `frontend/src/features/engines/EngineRegistry.test.tsx` | **New** — 4 vitest unit tests (registry render, provenance, links, error) | E2E-026 |
| 7 | `frontend/server/engine-transport.test.ts` | **New** — 6 vitest HTTP tests for `/api/engines` (registry 10, dispatch, 422/404/400, determinism) | E2E-025 |
| 8 | `iips-platform/tests/integration/engine-api-integration.test.ts` | **New** — 14 node:test integration tests (registry 10, baseline coherence, 10× execute with frozen oracle verdict/composite, error/validation, determinism/idempotency) | E2E-025 |
| 9 | `iips-platform/tests/integration/evidence-provenance-integration.test.ts` | **New** — 4 node:test tests (EvidencePipeline attributable+frozen, snapshot↔evidence traceability, 10-engine provenance chain, LTS R2/R3 preserved) | E2E-027 |
| 10 | `iips-platform/tests/integration/replay-e2e.test.ts` | **New** — 4 node:test tests (10-engine byte-identical replay, ReplayService governed surface, DistributedRuntime determinism, certification boundary) | E2E-028 |
| 11 | `iips-platform/tests/integration/csip-product-e2e.test.ts` | **New** — 3 node:test tests (10-engine CSIP aggregation determinism, taxonomy integrity no duplicate engines, product-E2E provenance shape) | E2E-029 |
| 12 | `frontend/server/executive-transport.ts` | **Modified (additive, 45 lines)** — imports `EngineApiAdapter`, wires `GET /api/engines` and `POST /api/engines/:engineId/execute` (governed dispatch, path/body engineId match, 400/404/422 + provenance) — no existing route changed | E2E-025 |
| 13 | `frontend/src/app/navigation.ts` | **Modified (additive, 1 child)** — adds `Research → Engines (/research/engines)` nav entry (viewer) | E2E-026 |
| 14 | `frontend/src/app/App.tsx` | **Modified (additive, 2 imports+route)** — imports `EngineRegistry`, adds `Route /research/engines` | E2E-026 |
| 15 | `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_DISCOVERY.md` | **New** — Phase 0 read-only discovery (repo/branch, 10-engine registry, infrastructure map, G:\IIPS env block) | Phase 0 |
| 16 | `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_GAP_MATRIX.md` | **New** — E2E-025…030 gap matrix (classification IMPLEMENTATION/TEST/EVIDENCE/AUTHORITY BLOCK/ENVIRONMENT BLOCK) | Phase 1 |
| 17 | `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_EVIDENCE.md` | **New** — this file | Phase 7 |
| 18 | `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_REPORT.md` | **New** — final deliverable A-H (see §7) | Phase 8 |

**Counts:** 18 artifacts — 14 code/test, 4 docs. Zero deletions of governed content. Working-tree status at evidence capture: all above `??`/`M` (see `git status` §2).

---

## 2. Repository state (captured 2026-09-04)

```
Branch: arena/01a06c00-iips-review-recovered
HEAD c65d533  (origin/main: c65d533 Import recovered IIPS workspace)
git status: M frontend/server/executive-transport.ts
             M frontend/src/app/App.tsx
             M frontend/src/app/navigation.ts
            ?? docs/integration/
            ?? frontend/server/engine-transport.test.ts
            ?? frontend/src/api/engines.ts
            ?? frontend/src/features/engines/
            ?? iips-platform/src/integration/
            ?? iips-platform/tests/integration/
```

**Deterministic providers in all tests/transport:** `Clock: fixed (2026-08-09T00:00:00.000Z)`, `IdProvider: deterministic` (instanceSeed = requestId or ctx lineage) — matches LTS `PROGRAM_v1.1_REPLAY_BASELINE.json` runtimeConfiguration.

---

## 3. Tests executed

### 3.1 Platform integration (node:test via `iips-platform/node_modules/.bin/tsx --test`)

| Suite | File | Tests | Pass | Fail | Evidence |
|-------|------|-------|------|------|----------|
| E2E-025 Engine API Integration | `iips-platform/tests/integration/engine-api-integration.test.ts` | 14 | 14 | 0 | §3.1.1 |
| E2E-027 Evidence/Provenance | `iips-platform/tests/integration/evidence-provenance-integration.test.ts` | 4 | 4 | 0 | §3.1.2 |
| E2E-028 Replay E2E | `iips-platform/tests/integration/replay-e2e.test.ts` | 4 | 4 | 0 | §3.1.3 |
| E2E-029 CSIP Product E2E | `iips-platform/tests/integration/csip-product-e2e.test.ts` | 3 | 3 | 0 | §3.1.4 |
| **New integration subtotal** | | **25** | **25** | **0** | |
| Regression (spot — unchanged contracts) | `tests/regression/banking-acceptance.test.ts` | 4 | 4 | 0 | pre-existing |
| | `tests/regression/technology-acceptance.test.ts` | 36 | 36 | 0 | pre-existing |
| | `tests/regression/industrials-acceptance.test.ts` | (incl. in 36) | — | — | pre-existing |
| | `tests/regression/program-v1.1-track3-replay-certification.test.ts` | — | pass | — | pre-existing |
| | `tests/regression/program-v1.1-track6-csip-certification.test.ts` | 36 | 36 | 0 | pre-existing |
| | `tests/regression/snapshot-replay.test.ts` + `cross-sector-acceptance` | 37 | 37 | 0 | pre-existing |

**Full platform regression (reported in program cert: 325/325) was not re-run wholesale in this slice** — spot regressions listed above passed and no platform/framework/CSIP file was modified (invariant: `git diff --stat` shows 0 files under `iips-platform/src/*` except `src/integration/` additive).

#### 3.1.1 E2E-025 — Engine API Integration (14)

```
[registry] GET /api/engines — certified registry (10, frozen, no fabrication) — PASS
[registry↔baseline] no drift — PASS
[execute] POST /api/engines/sector.banking/execute — Banking — PASS (verdict Watch, composite 47.1, oracle match)
[execute] Insurance — PASS (Buy, 72.3)
[execute] Capital Markets — PASS (Strong Buy, 84.6)
[execute] Healthcare — PASS
[execute] Hospitality — PASS
[execute] Energy — PASS
[execute] Utilities — PASS
[execute] Consumer — PASS
[execute] Industrials — PASS
[execute] Technology — PASS (Buy, 76.3)
[error] validation → deterministic semantics (422/400/404 DENIED) — PASS
[determinism] same requestId+inputs → same snapshotRef/evidenceRef — PASS
```

**Oracle traceability:** every execute asserts `res.verdict === baseline.sectors[i].expectedOutput.verdict` and `res.composite === expected composite` — the frozen `PROGRAM_v1.1_REPLAY_BASELINE.json` is the authoritative oracle; no expected value is changed to make a test green.

#### 3.1.2 E2E-027 — Evidence / Provenance (4)

```
[EvidencePipeline] attributable + frozen (evidenceId ev_*, engineId, provenance, calibrationVersion, replayReference, generatedAt, Object.isFrozen, validate) — PASS
[Snapshot↔evidence] snapshotId === replayReference ↔ evidenceRef (store.get) — PASS
[10-engine provenance chain] every engine carries engineId/IES/engineVersion/secVersion/semcVersion/calibrationProfile/snapshotId/evidenceId/deterministic/transportVersion/schemaVersion — PASS
[LTS deviations] R2 engineVersions stale + R3 calibration only-for-Technology preserved (no silent patch; attributable via registry) — PASS
```

#### 3.1.3 E2E-028 — Replay (4)

```
[10-engine deterministic] same engineId+inputs twice → same snapshotRef/evidenceRef (fixed-clock/deterministic-id) — PASS
[ReplayService governed] reproduced:true byteIdentical:true evidenceRefs[] ; unknown → undefined ; replayAll() — PASS
[DistributedRuntime] node-a == node-b (same verdict/composite/evidenceRef for same distributed ctx) — PASS
[boundary] implemented+verified+evidenced NOT certified (E2E-030 later gate; no field-level diff invented) — PASS
```

#### 3.1.4 E2E-029 — CSIP (3)

```
[CSIP aggregation] 10 outputs → CrossSectorEngine.run determinism (holdings==10, avgConviction/avgQuality/concentration, ranking 10 sectors, allocation/diversification/correlation/opportunity/evidence/reports, rerun identical) — PASS
[taxonomy] sector.materials DENIED; registry has no sector.it/chemicals/realty — PASS
[product shape] DTO provenance SNAPSHOT + certified source label + sectorExposure — PASS
```

### 3.2 Frontend (vitest)

| Suite | File | Tests | Pass | Fail |
|-------|------|-------|------|------|
| Engine Registry UI (E2E-026) | `frontend/src/features/engines/EngineRegistry.test.tsx` | 4 | 4 | 0 |
| Engine transport HTTP (E2E-025) | `frontend/server/engine-transport.test.ts` | 6 | 6 | 0 |
| Company Intelligence (existing, E2E-026 verification) | `frontend/src/features/company/CompanyIntelligence.test.tsx` | 6 | 6 | 0 |
| Evidence Explorer (E2E-027) | `frontend/src/features/evidence/EvidenceExplorer.test.tsx` | 6 | 6 | 0 |
| Cross-Sector Intelligence (E2E-029) | `frontend/src/features/cross-sector/CrossSectorIntelligence.test.tsx` | 6 | 6 | 0 |
| **Full frontend** | `frontend: vitest run` (all 29 files) | **151** | **151** | **0** (25 skipped) |

**Engine HTTP detail (6):**

```
GET /api/engines — 10 engines with provenance FROZEN — PASS
POST /api/engines/sector.technology/execute — COMPLETED IES-015 with snapshotRef/evidenceRef — PASS
POST unsupported apiVersion 2.0 → 422 — PASS
POST unknown sector.materials → 404 DENIED uncertified-capability — PASS
POST engineId mismatch path vs body → 400 — PASS
POST determinism same inputs → same snapshotRef — PASS
```

---

## 4. API / UI verification (manual + automated)

### 4.1 API — Engine dispatch chain (E2E-025)

```
Method   Path                                      Validates                           Result
GET      /api/engines                              —                                   200 { apiVersion:'1.0', engines:[10× engineId/ies/sectorFamily/engineVersion/calibrationProfile/capabilities ], provenance:{certifiedCount:10, freshness:'FROZEN'} }
POST     /api/engines/:engineId/execute            apiVersion==='1.0', engineId∈CERTIFIED_ENGINES, requestId, inputs | engineId.startsWith('sector.') | taxonomy-resolved guard   200 COMPLETED { verdict, composite, snapshotRef: SNAP_*, evidenceRef: ev_*, provenance:{ engineId, ies, engineVersion, secVersion, semcVersion, calibrationProfile, calibrationVersion, snapshotId, evidenceId, deterministic:true, runtimeConfig:{clock:'fixed', idProvider:'deterministic', schemaVersion:'snapshot-1.0', transportVersion:'v1'} } }
GET      /api/executive, /api/portfolio, /api/cross-sector, /api/decision-matrix   (unchanged) 200 (certified CSIP DTOs, provenance freshness: SNAPSHOT) — still verified
GET      /api/company/:sector, /api/evidence/:sector, /api/replay/:sector         (unchanged) 200/404 — still verified
```

Negative paths (deterministic error semantics, no silent fallback):

```
POST  /api/engines/sector.technology/execute  {apiVersion:'2.0'}        → 422 unsupported-api-version
POST  /api/engines/sector.materials/execute   {apiVersion:'1.0'}        → 404 DENIED uncertified-capability (provenance ies:'UNKNOWN')
POST  /api/engines/sector.banking/execute     {engineId:'sector.technology' body/path mismatch} → 400
POST  /api/engines/Banking/execute            (bare sector name)        → 400 must be a certified engineId
```

### 4.2 UI — Company / Evidence / Replay / CSIP (E2E-026…029) — already verified, harness run again

- **Engine Registry** (`/research/engines`): renders 10-row DataTable (engineId IES sectorFamily version calibration capabilities), header `CertifiedBadge` + `FreshnessBadge: SNAPSHOT`, provenance footer `deterministic (fixed/deterministic)`, links to `/research/company/<sectorFamily>` — 4/4 tests + HTTP 6/6.
- **Company Intelligence** (`/research/company/:id`): decision badge+composite, overrides, pillars-or-`pillars-unavailable` (never fabricated), SNAPSHOT input table, EvidenceCard + replay link — 6/6 tests (existing).
- **Evidence Explorer** (`/evidence/:id`): decision→drivers→metrics→evidence→snapshot→provenance→replay (`ProvenanceChain`, `SnapshotMetadataPanel`, `ReplaySummary MATCH`) — 6/6.
- **Replay Explorer** (`/evidence/replay/:id`): original result + `ReplaySummary` + `replay-equivalence MATCH — byte-identical` + note "no field-level diff" (governed hard stop) — existing + newly exercised via API.
- **Cross-Sector Intelligence** (`/research/cross-sector`): universe overview, sector ranking (certified, presentational sort), decision distribution, opportunities/risks, composite-by-sector chart — 6/6.

All workspaces preserve **loading** (`state-loading`), **success** (governed DTO), **error** (`state-error`), **unavailable** (`state-unavailable`/`pillars-unavailable`) states and show **engine/domain identity** (engineId/sectorFamily), **version** (engineVersion/calibrationProfile), and **freshness** (`FRESHNESS=SNAPSHOT/FROZEN`) — no fabricated version.

---

## 5. Provenance / Replay verification

### 5.1 Provenance (E2E-027)

Every `EngineApiAdapter.execute()` response was asserted to carry:

```
provenance: {
  engineId:      'sector.<family>'              // engine identity (certified)
  ies:            'IES-006'…'IES-015'            // canonical IES mapping (registry)
  engineVersion:  '1.0.0'                         // engine version (frozen)
  secVersion:     '1.0'   // Sector Engine Contract
  semcVersion:    '1.0'   // Sector Engine Methodology Contract
  calibrationProfile: '<sector>-calibration-1.0.0'  // calibration identity
  calibrationVersion: '1.0.0'
  snapshotId:     'SNAP_<8hex>'                   // execution context (deterministic)
  evidenceId:     'ev_<engineId>_<fixed-now>'     // evidence identity
  deterministic:  true
  runtimeConfig:  { clock:'fixed', idProvider:'deterministic', schemaVersion:'snapshot-1.0', transportVersion:'v1' }
}
+ top-level: snapshotRef === provenance.snapshotId, evidenceRef === provenance.evidenceId, apiVersion:'1.0', requestId, ies, verdict, composite
```

Cross-checked against frozen reference: `PROGRAM_v1.1_REPLAY_BASELINE.json` `runtimeConfiguration: { clock:'fixed', idProvider:'deterministic', frameworkVersion:'1.0', snapshotSchema:'snapshot-1.0', rounding:'round-half-to-even at composite only', boundarySemantics:'lower-inclusive/upper-exclusive' }`.

### 5.2 Replay (E2E-028)

- **Determinism:** same (`engineId`, frozen input, fixed clock, deterministic id) executed twice → same `snapshotRef` and `evidenceRef` (adapter isIdempotent true) — exercised for all 10 engines (adapter) + spot `RuntimeCoordinator` + `DistributedRuntime` (node-a == node-b `verdict/composite/evidenceRef`).
- **ReplayService:** `snapshotStore.get(snapshotId) → replay(snapshotId) { reproduced:true, byteIdentical:true, evidenceRefs:[ev_*] }` for every engine; `replay('UNKNOWN') === undefined`; `replayAll().length === store.size` and all `reproduced&&byteIdentical`.
- **Governed surface:** `replayedifferenceAvailable: false` + note "No field-level/metric-level diff" — honored in `computeCertifiedReplay` and `ReplayExplorer` (byteIdentical MATCH/DIFFERENCE only, no invented metric diff).
- **Certification boundary:** replay is IMPLEMENTED+VERIFIED+EVIDENCED (this record); **not** claimed as CERTIFIED (E2E-030 later gate).

---

## 6. Engine identity / IES mapping certification dependency

| Sector | IES | engineId | Calibration | Certification artifact | Runtime |
|--------|-----|----------|-------------|------------------------|---------|
| Banking | IES-006 | sector.banking | banking-calibration-1.0.0 | program-v1.1 final cert + replay baseline entry (composite 47.1, Watch) | fixed+deterministic |
| Insurance | IES-007 | sector.insurance | insurance-calibration-1.0.0 | … (72.3, Buy) | same |
| Capital Markets | IES-008 | sector.capital-markets | capital-markets-calibration-1.0.0 | … (84.6, Strong Buy) | same |
| Healthcare | IES-009 | sector.healthcare | healthcare-calibration-1.0.0 | … | same |
| Hospitality | IES-010 | sector.hospitality | hospitality-calibration-1.0.0 | IES010_FINAL_READINESS_CERTIFICATE + … | same |
| Energy | IES-011 | sector.energy | energy-calibration-1.0.0 | IES011_FINAL_READINESS_CERTIFICATE + … | same |
| Utilities | IES-012 | sector.utilities | utilities-calibration-1.0.0 | IES012… | same |
| Consumer | IES-013 | sector.consumer | consumer-calibration-1.0.0 | IES013… | same |
| Industrials | IES-014 | sector.industrials | industrials-calibration-1.0.0 | IES014… (D15 v1.2) | same |
| Technology | IES-015 | sector.technology | technology-calibration-1.0.0 | IES015… (D15 v1.3) | same |

**Taxonomy-resolved (not separate engines — authority guard):** IT → `sector.technology` (IES-015), Chemicals → `sector.industrials` (IES-014), Realty/Real Estate → `sector.technology` (IES-015 per prompt directive). Adapter throws/treats as authority block (see Discovery).

**Uncertified prompt claims (authority block):** Materials IES-020 / Telecom IES-016 / Auto IES-017 — no engineId exists; `POST /api/engines/sector.materials/execute` is DENIED `uncertified-capability` (tested).

---

## 7. Unresolved issues (none silently patched)

| # | Finding | Disposition |
|---|---------|-------------|
| 1 | Prompt's Materials/Telecom/Auto certification claim unverified in repo | **Authority block — not implemented; surfaced in discovery + final status (E2E-025 AUTHORITY BLOCK)** |
| 2 | Known LTS deviations v2.0-R1 (ontology exposure inconsistency), R2 (CSIP engineVersions staleness), R3 (calibration-version only for Technology at evidence-card level), R4 (banking frozen-asset layout) | **Preserved — not patched in integration; documented in LTS baseline; E2E-027/E2E-029 tests assert preservation** |
| 3 | `G:\IIPS` Windows checkout unavailable in Arena/Linux | **Environment block — no Windows-path access attempted; all artifacts from mounted repo** |
| 4 | Production tenancy/RBAC for the new `POST /api/engines/:id/execute` is out of scope (CSIP is SNAPSHOT demo data) | **Design dependency — transport notes `SNAPSHOT` freshness + dev-mode comment; real tenancy is the v3.0 G3 AUTH boundary (Program v3.0 Phase 12/13) and is not weakened here** |

---

## 8. Raw evidence locations

- **This record:** `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_EVIDENCE.md`
- **Discovery:** `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_DISCOVERY.md`
- **Gap matrix:** `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_GAP_MATRIX.md`
- **Final report (A-H):** `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_REPORT.md`
- **Platform integration tests:** `iips-platform/tests/integration/{engine-api-integration,evidence-provenance-integration,replay-e2e,csip-product-e2e}.test.ts`
- **Frontend tests:** `frontend/src/features/engines/EngineRegistry.test.tsx`, `frontend/server/engine-transport.test.ts`
- **Live API (dev):** `frontend/server/executive-transport.ts` (`GET /api/engines`, `POST /api/engines/:id/execute`) — run via `npm run dev` + `tsx` transports
- **Deterministic oracle:** `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json`, `iips-platform/src/sector-engines/*/frozen-assets/*expected-outputs-1.0.0.json`
