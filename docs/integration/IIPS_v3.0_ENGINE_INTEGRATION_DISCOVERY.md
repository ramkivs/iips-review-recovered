# IIPS v3.0 Engine Integration — Phase 0 Read-Only Discovery

**Track:** E2E-025 → E2E-029 Parallel Engine Integration  
**Date:** 2026-09-04  
**Arena Branch:** `arena/01a06c00-iips-review-recovered`  
**Baseline Tag:** `program-v1.1.0` (LTS)  
**Authority:** IES-005 / IES-005.1 / IES-006…015 (all frozen), Program v1.1 LTS Baseline  

> Read-only discovery only. No files were modified during discovery. Environment is Arena/Linux; `G:\IIPS` is not mounted (recorded as environment dependency where referenced).

---

## 1. Repository / Branch State

| Attribute | Evidence |
|-----------|----------|
| Repository root | `/home/user/iips-review-recovered` (git: `ramkivs/iips-review-recovered`) |
| Mounted workspace | Verified: `iips-platform/`, `ies-010…015/`, `frontend/`, `iips-cross-sector/`, `program-v1.1-certification/`, `governance/` |
| Current branch | `arena/01a06c00-iips-review-recovered` (branched from `main` at `c65d533`) |
| HEAD | `c65d53373717aacc3a1dce12d47b5aeaf50541a5` — *Import recovered IIPS workspace* |
| Working tree | `clean` (`git status: nothing to commit`) |
| Remote | `origin https://github.com/ramkivs/iips-review-recovered.git` |
| Existing integration branches | **None** — only `main` and `arena/01a06c00…` exist (`git branch -a`) |
| `G:\IIPS` Windows checkout | **Not available** in Arena/Linux — all discovery uses the mounted repo only |

---

## 2. Engine Registry (Ground Truth from Repository)

### 2.1 Canonical certified engines (Program v1.1 — all frozen, all PRODUCTION READY)

All 10 sector engines implement `SectorPlugin` (`src/plugin-loader/PluginContract.ts`) and consume ONLY the frozen platform APIs listed in `iips-platform/IMPLEMENTATION_API_BASELINE.md`. Each is verified independently with **zero** modification to `iips-platform`, `framework`, or `CSIP`.

| # | Sector | IES | Engine ID (`engineId`) | Sector Family | Calib. | Golden Ref. | Expected Outputs | Replay Dataset | Ontology (8/8) | Readiness Certificate |
|---|--------|-----|------------------------|---------------|--------|-------------|------------------|---------------|-----------------|----------------------|
| 1 | Banking | IES-006 | `sector.banking` | `Banking` | `banking-calibration-1.0.0.json` (frozen-assets/) | `banking-golden-reference-1.0.0.json` | `banking-expected-outputs-1.0.0.json` | `replay-datasets/banking-replay-1.0.0.json` | `CONSUMER_ONTOLOGY` not (banking uses CSIP mapper) | `CSIP_IMPLEMENTATION_REUSE_REPORT` + program v1.1 Track cert |
| 2 | Insurance | IES-007 | `sector.insurance` | `Insurance` | `insurance-calibration-1.0.0.json` | `insurance-golden-reference…` | `insurance-expected…` | `insurance-replay…` | same | — |
| 3 | Capital Markets | IES-008 | `sector.capital-markets` | `Capital Markets` | `capital-markets-calibration-1.0.0.json` | `capital-markets-golden…` | `…-expected…` | `…-replay…` | — | — |
| 4 | Healthcare | IES-009 | `sector.healthcare` | `Healthcare` | `healthcare-calibration-1.0.0.json` | `healthcare-golden…` | `…-expected…` | `…-replay…` | — | — |
| 5 | Hospitality | IES-010 | `sector.hospitality` | `Hospitality` | `hospitality-calibration-1.0.0.json` | `hospitality-golden-reference-1.0.0.json` | `hospitality-expected-outputs-1.0.0.json` | `hospitality-replay-dataset-1.0.0.json` | — | `IES010_FINAL_READINESS_CERTIFICATE.md` |
| 6 | Energy | IES-011 | `sector.energy` | `Energy` | `energy-calibration-1.0.0.json` | `energy-golden…` | `…-expected…` | `…-replay…` | — | `IES011_FINAL_READINESS_CERTIFICATE.md` |
| 7 | Utilities | IES-012 | `sector.utilities` | `Utilities` | `utilities-calibration-1.0.0.json` | `utilities-golden…` | `…-expected…` | `…-replay…` | — | `IES012_FINAL_READINESS_CERTIFICATE.md` |
| 8 | Consumer | IES-013 | `sector.consumer` | `Consumer` | `consumer-calibration-1.0.0.json` | `consumer-golden…` | `…-expected…` | `…-replay…` | `consumer-ontology-metadata-1.0.0.json` (8/8) | `IES013_FINAL_READINESS_CERTIFICATE.md` |
| 9 | Industrials | IES-014 | `sector.industrials` | `Industrials` | `industrials-calibration-1.0.0.json` | `industrials-golden…` | `…-expected…` | `…-replay…` | `industrials-ontology-metadata-1.0.0.json` (8/8) | `IES014_FINAL_READINESS_CERTIFICATE.md` |
| 10 | Technology | IES-015 | `sector.technology` | `Technology` | `technology-calibration-1.0.0.json` | `technology-golden…` | `…-expected…` | `…-replay…` | `technology-ontology-metadata-1.0.0.json` (8/8) | `IES015_FINAL_READINESS_CERTIFICATE.md` |

**Program-level certification:** `program-v1.1-certification/PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` — all 9 Tracks approved, 10/10 engines released, tags verified (`program-v1.1.0` LTS), `325/325` platform tests, `270/270` Technology tests.

### 2.2 Prompt authority claim vs. repository evidence (AUTHORITY CONFLICT)

The execution prompt treats these as authoritative unless disproved:

| Prompt claim | Repository evidence | Resolution |
|--------------|---------------------|------------|
| E2E-019 Materials / IES-020 — COMPLETED/CERTIFIED | **Not found.** No `ies-020-materials/`, no `sector.materials` engine, no `IES-020` freeze manifest exists. `ROADMAP.md` lists IES-020 as *Planned*, not certified. | **Authority block — implementation will not create a Materials engine.** Use the 10 certified engines above. |
| E2E-023 Telecom / IES-016 — COMPLETED/CERTIFIED | **Not found.** No `ies-016-telecom/`, no `sector.telecom` engine. Listed as *Planned* in `ROADMAP.md`. | **Authority block** — same. |
| E2E-024 Auto / IES-017 — COMPLETED/CERTIFIED | **Not found.** No `ies-017-auto/`, no `sector.auto` engine. Listed as *Planned*. | **Authority block** — same. |
| E2E-020 IT → IES-015 Technology (taxonomy-resolved) | **Consistent** with repository: IES-015 is Technology (`ies-015-technology/`), and `CROSS_SECTOR_INTELLIGENCE_STANDARD` notes Real Estate / Telecom / Automotive as future sectors that register via ontology. No separate IT engine exists — correct that IT is within IES-015 Technology. | **No issue.** No IT engine will be created. |
| E2E-021 Chemicals → IES-014 Industrials | **Consistent:** IES-014 is `Industrials` (includes industrials/chemicals processing per `IES-014_04_BUSINESS_MODEL.md`). No separate Chemicals engine exists — correctly taxonomy-resolved. | **No issue.** |
| E2E-022 Realty → IES-015 Technology | **Inconsistent mapping per docs.** Realty / Real Estate is a distinct future sector per `CSIP_COMPATIBILITY.md` and `CROSS_SECTOR_INTELLIGENCE_STANDARD.md` (listed separately from Technology). However, the prompt's taxonomy resolution that Realty maps into IES-015 is treated as a *current program-control directive* for this track. | **Record as authority decision** — do not create a Realty engine; treat as taxonomy-resolved per prompt. No Realty work package created. |

**Control-plane implication:** The prompt's E2E-013 control baseline is not present in this recovery repository (no `E2E-013` artifact found). The existing control plane is the Program v1.1 LTS Baseline (`PROGRAM_v1.1_LTS_BASELINE.md`) + IES freeze manifests. Integration proceeds against those frozen contracts, consistent with the governance boundary ("must stop and surface an authority conflict rather than silently resolving it").

---

## 3. Existing Integration Infrastructure (as found — not invented)

### 3.1 Platform / Engine Tier (`iips-platform/src/`)

| Capability | Implementation | Location | State |
|------------|---------------|----------|-------|
| **Plugin contract** | `SectorPlugin` (engineId, sectorFamily, engineVersion, secVersion, semcVersion, manifest, lifecycle) | `src/plugin-loader/PluginContract.ts` | Frozen (IES-005.1) |
| **Plugin loader** | `PluginLoader` (discover → register → initialize → execute → complete) | `src/plugin-loader/PluginLoader.ts` | Certified |
| **Runtime coordinator** | `RuntimeCoordinator` (state machine READY→INITIALIZED→RUNNING→COMPLETED, snapshot recording, replay delegation) | `src/runtime/RuntimeCoordinator.ts` | Certified |
| **DI container** | `Container` (Clock, IdProvider, evidence/registry/snapshot/replay, runtimeCoordinator) | `src/di/Container.ts` | Certified |
| **Snapshot service** | `SnapshotService` (deterministic `SNAP_*` ids via IdProvider, schema `snapshot-1.0`) + `SnapshotStore` (append-only, replay backing) | `src/snapshot/` | Certified |
| **Replay service** | `ReplayService` (reproduced, byteIdentical, evidenceRefs) — `snapshot-replay.test.ts` verified | `src/replay/ReplayService.ts` | Certified |
| **Evidence pipeline** | `EvidencePipeline` (evidenceId `ev_${engineId}_${now}`, provenance frameworkVersion/engineVersion/methodologyVersion/snapshotId, deepFreeze) | `src/framework/evidence/EvidencePipeline.ts` | Certified |
| **Transport** | `Transport` (DTO, metadata transportVersion/engineId/schemaVersion/generatedAt/checksum, serialize, checksum, validate) | `src/framework/transport/Transport.ts` | Certified |
| **Manifest loader / diagnostics / qualification / activation** | `Framework` modules | `src/framework/` | Certified |
| **Registry manager** | `RegistryManager` (6 immutable registries: taxonomy/metric/score/formula/snapshot/transport) | `src/registry/RegistryManager.ts` | Certified |
| **10 sector engines** | Each `src/sector-engines/<sector>/<Sector>Engine.ts` (+ metrics/scoring/calibration/decision/evidence) | `src/sector-engines/**` | Certified — all 10 pass golden regression |
| **CSIP cross-sector engine** | `CrossSectorEngine` (ontology→intelligence→ranking→allocation→diversification→opportunity→correlation→evidence→reporting) | `src/sector-engines/cross-sector/CrossSectorEngine.ts` | Certified sector-neutral |
| **Program v2.0 distributed layer** | `DistributedRuntime`, `PlatformApi` (thin versioned API facade: authz + rate-limit + marketplace gate → certified runtime), `EnterpriseRuntime`, `LiveDataRuntime`, etc. | `src/distributed/` | Exists, versioned, does NOT alter deterministic core |
| **API validation** | `PlatformApi.execute` validates `apiVersion==='1.0'`, `security.authorize`, rate-limit (100/tenant+user), marketplace certification gate; `Transport.validate`, `EvidencePipeline.validate`, `SnapshotStore` duplicate guard | `src/distributed/PlatformApi.ts`, `src/framework/transport/Transport.ts` | Certified |
| **Engine registry / dispatch** | `ENGINE_FACTORY` map in `frontend/server/executive-transport.ts` + `CrossSectorEngine` ontology — dispatch is via `PluginLoader` + `RuntimeCoordinator` | `frontend/server/executive-transport.ts` | Present but dev-mode (see gap) |
| **Certification artifacts** | Freeze manifests (`IES-0*_FREEZE_MANIFEST.json`), `IES*_FINAL_READINESS_CERTIFICATE.md`, `PROGRAM_v1.1_REPLAY_BASELINE.json` (10 sectors, deterministic runtime config), `PROGRAM_v1.1_PERFORMANCE_BASELINE.json` | `ies-0*/`, `iips-platform/`, `program-v1.1-certification/` | Frozen |

**What is NOT found in the platform tier:**
- No `sector.materials` / `sector.telecom` / `sector.auto` engine module
- No Windows-only artifact (all reference assets are checked-in JSON)
- No `G:\IIPS` dependency beyond the standard `program-v1.1-certification/` JSON

### 3.2 API / Transport Tier (`frontend/server/`)

| Capability | Implementation | State |
|------------|---------------|-------|
| **Executive transport** | `executive-transport.ts` — **already integrates all 10 certified engines** in-process over the frozen `PROGRAM_v1.1_REPLAY_BASELINE.json` inputs; computes `computeCertifiedPlatform() → computeCertifiedExecutive/Portfolio/Company/CrossSector/Replay/Evidence/DecisionMatrix` (all 1:1 DTO mappings, no recomputation). Virtually the whole prompt target chain is implemented. | Existing, working |
| **HTTP API surface** | `GET /api/health`, `/api/executive`, `/api/portfolio`, `/api/decision-matrix`, `/api/cross-sector`, `/api/company/:sector`, `/api/evidence/:sector`, `/api/replay/:sector` (all from `computeCertified*`); `POST /api/admin/*` (12 read surfaces + `POST /api/admin/data-governance/classify` mutation) via `admin-transport.ts` + `secured-executor.ts` (Keycloak → authenticate 401 → EnterpriseRuntime RBAC 403 → tenant-filter → audit); `GET /api/ai-advisory/:id` via `ai-advisory-transport.ts` | Existing |
| **Versioning / provenance** | Every DTO carries `provenance: { dataSource, freshness: SNAPSHOT, calibratedAt, transportSemantics: '1:1 mapping' }` + explicit `evidence.provenance { frameworkVersion, engineVersion, methodologyVersion, snapshotId }` + `snapshot { snapshotId, engineId, schemaVersion, generatedAt }` + `replay { reproduced, byteIdentical, evidenceRefs }` | Existing — governed |
| **Error / validation** | `TransportError(400/404/422)`, `AuthError(401/403)`, rate-limit `THROTTLED`; executive handlers return 404 `company not found: <sector>` for unknown sector | Present |
| **Missing from API tier** | No **public, unauthenticated** `GET /api/engines` registry endpoint (engineId↔IES↔sectorFamily↔capabilities). Admin `GET /api/admin/engines` exists but is auth-gated. No `POST /api/engines/:engineId/execute` direct engine dispatch (today only indirect via the computed baselines). | **Gap — E2E-025** |
| **Techniques preserved** | Deterministic Clock (`fixed`), IdProvider (`deterministic`), FNV-1a checksum, `deepFreeze`, validation `array length>0` + version gates | Existing |

### 3.3 UI / Frontend Tier (`frontend/src/`)

| Capability | Implementation | State |
|------------|---------------|-------|
| **App shell + routing** | `src/app/App.tsx` (nav: Executive, Portfolio, Research/Company/Cross-Sector, Intelligence/Opportunities/Risks/Rankings/Decision-Matrix, Evidence + Snapshots + Replay, Admin) | Present |
| **Typed API clients** | `src/api/executive.ts`, `portfolio.ts`, `crossSector.ts`, `company.ts`, `evidence.ts`, `replay.ts`, `decisionMatrix.ts`, `admin.ts` (with `Freshness` enum, `provenance` typed), `aiAdvisory.ts` | Present — semantically inert |
| **Company Intelligence** | `features/company/CompanyIntelligence.tsx` — decision verdict+composite, overrides, pillars (or `pillars-unavailable` when not exposed — never fabricated), SNAPSHOT input table, `EvidenceCard`, replay link, provenance footer; handles `loading/success/error` (`LoadingState/ErrorState/UnavailableState`) | Integrated + tested (`CompanyIntelligence.test.tsx` — 5 cases) |
| **Cross-Sector Intelligence** | `features/cross-sector/CrossSectorIntelligence.tsx` — portfolio overview cards, ranking table (certified, sort-presentational), decision distribution badges, opportunities/risks lists, composite-by-sector bar chart, detail accordion, provenance | Integrated + tested |
| **Evidence Explorer** | `features/evidence/EvidenceExplorer.tsx` — decision→drivers→metrics→evidence→snapshot→provenance→replay chain (`EvidenceTimeline`, `EvidenceRecordCard`, `ProvenanceChain`, `SnapshotMetadataPanel`, `ReplaySummary`) | Integrated + tested |
| **Replay Explorer** | `features/replay/ReplayExplorer.tsx` — original result (`SnapshotMetadataPanel`, calibration), `ReplaySummary`, `replay-equivalence` (MATCH/DIFFERENCE byteIdentical + note *"no field-level diff"* — governed contract) | Integrated |
| **Executive / Portfolio** | `features/executive/ExecutiveDashboard.tsx` (`metricGroup`, sector exposure chart, ranking), `features/portfolio/PortfolioWorkspace.tsx` (holdings, allocation, diversification) | Integrated |
| **Admin surfaces** | 8 admin features (`AdminOverview/Identity/Tenancy/Engines/Platform/Audit/Data/Operations`) | Integrated — auth-gated |
| **UI states** | `StateComponents` (LoadingState, ErrorState, UnavailableState) used across all workspaces; `Badges` (`CertifiedBadge`, `FreshnessBadge`) | Present |

### 3.4 Evidence / Provenance / Audit / Replay / CSIP

| Capability | Implementation | State |
|------------|---------------|-------|
| **Evidence model** | `EvidencePipeline.EvidencePackage` (evidenceId, engineId, recommendation, compositeScore, confidence, keyMetrics, supportingScores, calibrationVersion, decisionRulesApplied, replayReference, provenance) — frozen + validated (`validate()`) | Certified |
| **CSIP contracts** | `iips-cross-sector/CROSS_SECTOR_INTELLIGENCE_STANDARD.md`, `CSIP_COMPATIBILITY.md`, `PORTFOLIO_ARCHITECTURE.md` + frozen `CSIP_FREEZE_MANIFEST.json` (ontology registration 8/8, zero CSIP branch) | Certified |
| **Replay baseline** | `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` — 10 sectors, deterministic runtime config `clock: fixed / idProvider: deterministic / frameworkVersion: 1.0 / snapshotSchema: snapshot-1.0`; replay identity `[input, contractVersion, calibrationVersion, runtimeConfiguration]` → assertions `[identical output/evidence/metadata/replay]` | Frozen |
| **Known v1.1 deviations (accepted)** | v2.0-R1 ontology exposure inconsistency, R2 `engineVersions` staleness, R3 calibration-version exposure (only Technology), R4 banking frozen-asset layout — per `PROGRAM_v1.1_LTS_BASELINE.md` (deferred, not fixed in v1.1) | Documented |

---

## 4. Integration E2E Chain — As Found

```
Certified engine (SectorPlugin, frozen calibration + golden oracle)
  → RuntimeCoordinator + PluginLoader (governed dispatch)
  → ExecutionResult { snapshotRef, evidenceRef, metadata{verdict, composite, …} }
  → SnapshotService/Store (SNAP_*, snapshot-1.0) + EvidencePipeline (ev_*, provenance)
  → Transport/PlatformApi (DTO 1:1, provenance FRESHNESS=SNAPSHOT)
  → HTTP (/api/executive|portfolio|company|evidence|replay|cross-sector|decision-matrix)
  → Typed API client (semantically inert)
  → UI workspace (loading/success/error, CertifiedBadge, FreshnessBadge, ProvenanceChain, ReplaySummary)
  → ReplayService (reproduced/byteIdentical/evidenceRefs) ↔ CSIP CrossSectorEngine (sector-neutral)
```

**This chain already exists and is used in every `computeCertified*()` path.** The discovery proves it is not a green-field build — it is a **parallel hardening/evidence** track.

---

## 5. Tests / Evidence Found

| Tier | Location | Count (files) | Notes |
|------|----------|----------------|-------|
| Platform unit | `iips-platform/src/**/*.test.ts` | 13 | Includes `PluginLoader.test.ts`, `RegistryManager.test.ts`, `ActivationService.test.ts`, etc. |
| Regression | `iips-platform/tests/regression/*.test.ts` | 65 | Per-sector acceptance / framework-integration / reuse-verification + program v1.1 tracks + distributed/runtime |
| Frontend | `frontend/src/**/*.test.tsx` + `frontend/server/*.test.ts` | 27 | Isolated fixtures, G3-boundary auth tests (admin/identity/tenancy/engines/platform/audit) |
| Certification reports | `iips-platform/IES*_FINAL_READINESS_CERTIFICATE.md`, `program-v1.1-certification/` | — | 10 sector certs + 9 Track certs + Final Readiness Cert → LTS |

---

## 6. Environment / Access Dependencies

- `G:\IIPS` Windows checkout: **environment block** — not available in Arena; no attempt to access; all required artifacts are present in the mounted repo; any future requirement tied solely to `G:\IIPS` will be surfaced as `ENVIRONMENT BLOCK`.
- `KEYCLOAK_URL` (live IdP): optional — `--` offline-safe (`admin-transport` skips + returns 401 `authentication unavailable` when absent; tests inject a mock verifier).

---

## 7. Authority Boundary (per prompt §2, §14)

The following are **not modified** by this track (and were not during discovery):

- E2E-013-equivalent control baseline (Program v1.1 LTS Baseline + IES freeze manifests)
- Capability / engine taxonomy, scoring methodology, engine identities
- Freeze manifests / readiness certificates / verification reports / regression expectations
- Certification criteria; no A2→A1 record or E2E-030 certification claim

Any integration requirement that would require creating a new engine, amending a frozen manifest, or redefining a calibrated methodology is **stopped and reported as an authority/ENVIRONMENT block** (see Gap Matrix).

---

## 8. Immediate Next Step

→ **Integration Gap Matrix** (`docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_GAP_MATRIX.md`) — classifies the one public-registry + direct-dispatch API gap (E2E-025) plus the hardening/evidence gaps for E2E-026..029 before any code mutation (prompt §5, §16 Phase 1).
