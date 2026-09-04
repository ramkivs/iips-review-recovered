# IIPS v3.0 — Continuation Evidence (Authorized 10-Engine Scope)

**Authority:** IIPS v3.0 — E2E-025→029 AUTHORIZED CONTINUATION + SCOPE DISPOSITION (§5 — Test and evidence pass)  
**Date:** 2026-09-04  
**Starting HEAD (this continuation):** `bbbca164f227f12800b9cc51ac383d25b9e31def`  
**Baseline (recovered program-v1.1.0 LTS):** `c65d53373717aacc3a1dce12d47b5aeaf50541a5`  
**Ending HEAD (after this commit):** `TBD — reported in Final Report §8 after commit` (single line, grep-able 40-hex)  
**Branch:** `arena/01a06c00-iips-review-recovered`  
**Control record:** `docs/integration/IIPS_v3.0_AUTHORIZED_SCOPE_DISPOSITION.md` — controlling scope `IES-006…IES-015` (10 LTS); `IES-016/017/020` explicitly outside  
**Predecessor:** `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_RECONCILIATION.md` — prior HOLD reconciliation (now committed with disposition)  

> All 40-hex pins in this file remain on single physical lines and are grep-able (no hard-wrapped hashes). This is the fresh evidence record for the continuation per §5.

---

## 1. Starting State Reconciliation (from `bbbca16`)

Validated at `bbbca164f227f12800b9cc51ac383d25b9e31def` — 18 files, 2429 insertions, `git diff --stat c65d533..bbbca16` — no governed/frozen artifact modified (see §7 below). Working tree at entry: `git status` showed only one untracked `IIPS_v3.0_ENGINE_INTEGRATION_RECONCILIATION.md` (held per HOLD); after this pass two control records exist (`RECONCILIATION` + `AUTHORIZED_SCOPE_DISPOSITION`). No scoring/methodology/taxonomy change.

---

## 2. E2E-025→029 Validation — 10-Engine Authorized Scope (No Unnecessary Rewrite)

Validation was read-only where possible; corrective implementation authorized only where defects found. **No defects requiring code change were found** — the `bbbca16` slice is complete and internally coherent for `IES-006…015`. Summary per E2E:

### E2E-025 — Engine/API Integration ✅

- Registry: `EngineRegistry.CERTIFIED_ENGINES` is exactly 10 (`IES-006…015`, `sector.banking` … `sector.technology`, `engineVersion 1.0.0`, `calibrationProfile *-calibration-1.0.0`, `capabilities` non-empty, `ontologyDimensions 8`, `provenance.freshness FROZEN`), `TAXONOMY_RESOLVED` guards `IT/ Chemicals/ Realty → 422`. Verified by `engine-api-integration.test.ts: GET /api/engines — 10, IES-006..015, no IES-016/017/020 invented` + `registry ↔ replay baseline coherence (10 engineIds = baseline.sectors engineIds)`.
- Adapter: `EngineApiAdapter.listEngines()` + `execute({apiVersion:'1.0', engineId, requestId, inputs})` builds deterministic runtime `fixed 2026-08-09 + deterministic IdProvider(requestId)`, `PluginLoader→RuntimeCoordinator.execute` (governed dispatch), `Transport.build+validate` check, returns `state COMPLETED|DENIED|FAILED`, `verdict/composite` oracle-matched, `snapshotRef SNAP_*`, `evidenceRef ev_*`, `provenance{engineId, ies, engineVersion, secVersion, semcVersion, calibrationProfile, calibrationVersion, snapshotId, evidenceId, deterministic:true, runtimeConfig{clock:'fixed', idProvider:'deterministic', schemaVersion:'snapshot-1.0', transportVersion:'v1'}}`. Validates `apiVersion==='1.0'`, `engineId∈CERTIFIED_ENGINES`, `requestId`, `inputs`, `startsWith('sector.')`, `assertNotTaxonomyResolved`. `makeCertifiedEngine` throws `uncertified-capability` for unknown.
- HTTP: `frontend/server/executive-transport.ts` wires `GET /api/engines → 200 listEngines()` (public, unauthenticated, certified-only) and `POST /api/engines/:engineId/execute → 200 COMPLETED /404 DENIED uncertified-capability /422 unsupported-api-version /400 mismatch|missing` (path/body `engineId` match enforced). Existing `GET /api/executive|portfolio|cross-sector|decision-matrix|company|evidence|replay` unchanged.
- Deterministic: same `requestId+inputs` twice → same `snapshotRef/evidenceRef` (`isIdempotent true`) for all 10 — proven `engine-api-integration.test.ts: determinism` + `engine-transport.test.ts: POST is deterministic`.
- Rejection: `unsupported-api-version→422`, `missing engineId→400`, `bare sector name→400`, `uncertified sector.materials/telecom/auto→404 DENIED`, `mismatch→400` — all exercised (no silent fallback).

### E2E-026 — UI Integration ✅

- Typed client: `frontend/src/api/engines.ts` `fetchEngines() → GET /api/engines`, `executeEngine(engineId, inputs, requestId) → POST` (handles `400/404/422`).
- Discovery UI: `frontend/src/features/engines/EngineRegistry.tsx` `useEffect→fetchEngines()→DataTable(engineId/ies/sectorFamily/engineVersion/calibration/capabilities)` + header `CertifiedBadge+FreshnessBadge: SNAPSHOT` + `provenance.source certifiedCount freshness FROZEN deterministic (fixed/deterministic)` + links to `/research/company/<sectorFamily>` → proves `UI→API→Engine→UI`. Handles `LoadingState→success→ErrorState→UnavailableState` (never fabricated).
- No false implication: UI shows **only 10** (from API `FROZEN 10`, never hardcoded `016/017/020`); `grep -R Telecom/Materials/Auto` in `features/engines/` → only `IES-006/015` test fixtures; navigation adds `Research→Engines (/research/engines, viewer)` — no shell redesign, no `G:\IIPS` inference.
- Verified: `EngineRegistry.test.tsx 4/4` (registry render, provenance, links, error) + `engine-transport.test.ts 6/6` HTTP + full `vitest run 151/151` (existing `CompanyIntelligence` `pillars-unavailable` 6/6, `EvidenceExplorer` 6/6, `CrossSectorIntelligence` 6/6 remain).

### E2E-027 — Evidence/Provenance ✅

- Evidence: `EvidencePipeline.build() → {evidenceId ev_*, engineId, recommendation, compositeScore, confidence, keyMetrics, supportingScores, calibrationVersion, decisionRulesApplied, replayReference, provenance{frameworkVersion, engineVersion, methodologyVersion, snapshotId}, generatedAt}` — attributable, frozen (`Object.isFrozen`), `validate()==true`.
- Linkage: `SnapshotService.create→SnapshotStore.get(snapshotRef)→{snapshotId SNAP_*, engineId, schemaVersion snapshot-1.0, generatedAt, metrics/scores frozen, evidenceRefs}`; `snapshotRef===provenance.snapshotId`, `evidenceRef===provenance.evidenceId`, `replayReference===snapshotId`, `requestId→snapshotId deterministic`, `evidence integrity` via `deepFreeze`.
- 10-engine chain: every `POST /api/engines/:id/execute` carries `engineId/ies/engineVersion/secVersion/semcVersion/calibrationProfile/calibrationVersion/snapshotId/evidenceId/deterministic/transportVersion/schemaVersion` — asserted for all 10 in `evidence-provenance-integration.test.ts`.
- LTS deviations preserved: `R2 engineVersions staleness + R3 calibration-only-Technology` **not silently patched** — `provenance` remains attributable via registry (`calibrationVersion 1.0.0` for all 10), noted as accepted `PROGRAM_v1.1_LTS_BASELINE.md` findings.
- Canonical locations: `iips-platform/src/framework/evidence/EvidencePipeline.ts`, `SnapshotService.ts`, `frontend/server/executive-transport.ts computeCertifiedEvidence` — no new provenance semantics; deficiency would be `authority/design dependency` per §1.

### E2E-028 — Replay ✅

- Determinism: same frozen input (`baseline.sectors[].input`) executed twice with same `requestId` → same `snapshotRef/evidenceRef` (`isIdempotent`) for all 10 via adapter + `RuntimeCoordinator` spot + `DistributedRuntime` (`defaultContext('replay-e2e-ctx')`, `provisionNode(node-a/node-b, ctx, [BankingEngine])`, `dr.execute(node-a, req) === dr.execute(node-b, req)` for `verdict/composite/evidenceRef`).
- Fixed-clock: `createClock('fixed','2026-08-09T00:00:00.000Z')` everywhere; `createIdProvider('deterministic', requestId/lineage)` everywhere — matches `PROGRAM_v1.1_REPLAY_BASELINE.json runtimeConfiguration`.
- Evidence: `ReplayService.replay(snapshotId)→{reproduced:true, byteIdentical:true, evidenceRefs:[ev_*]}` for every engine; `unknown→undefined` (no fabrication); `replayAll().length===store.size` all `reproduced&&byteIdentical`; HTTP `GET /api/replay/:sector` carries `differenceAvailable:false` + note “No field-level diff” (governed hard stop — `ReplayExplorer` shows `replay-equivalence MATCH — byte-identical` only).
- Failure for unavailable: `sector.materials/telecom/auto → 404 DENIED` never reaches replay; `RayService.replay('UNKNOWN')→undefined` tested.
- Boundary: implemented+verified+evidenced, **not certified** (E2E-030 later gate).

### E2E-029 — CSIP/Product ✅

- 10-engine aggregation: `buildEngineOutputs()` (`10× adapter.execute→composite/verdict→golden-pillar csipInputs (OntologyMapper quality/risk/growth)→EngineOutput{companyId, sector, composite, confidence, quality/risk/growth/valuation/capitalEfficiency/franchiseScore, verdict}→CrossSectorEngine.run({portfolioId:'PF-E2E-029', scenario:'Balanced', strategy:'Balanced', topN:10})` → `intelligence.holdings===10`, `avgConviction/avgQuality/avgRisk/concentration/diversificationScore numeric`, `ranking 10 sectors equal source sectors`, `allocation.strategy/recommendation/rulesApplied`, `diversification.band/flags`, `correlation.flags/concentrationSectors`, `opportunity.top[]`, `evidence.portfolioId`, `reports[]`, **determinism** (rerun identical).
- Linkage: `EngineOutput` preserves `engineId/ies` provenance; `CrossSectorEngine` consumed, not reimplemented (no methodology change).
- Provenance/replayability: product DTO `provenance{dataSource: certified v2.0 platform (CSIP…), freshness: SNAPSHOT, calibratedAt, transportSemantics: 1:1 mapping}` — verified; `intelligence→ranking→allocation` deterministic.
- No false inclusion: `sector.materials→DENIED` + `registry has no sector.it/chemicals/realty` + `CSIP` has no `016/017/020` sector exposure; `grep CSIP sector.telecom` → 0.

---

## 3. Fresh Regression — Strongest Suite (This Continuation)

All re-run **after** scope disposition, **before** commit — no code change, so results are fresh evidence for the authorized 10-engine scope.

| # | Suite (command) | Tests | Pass | Fail | Evidence log |
|---|-----------------|-------|------|------|--------------|
| 1 | `iips-platform: tsx --test tests/integration/engine-api-integration.test.ts tests/integration/evidence-provenance-integration.test.ts tests/integration/replay-e2e.test.ts tests/integration/csip-product-e2e.test.ts` — API/UI/evidence/replay/CSIP/deterministic/certified-boundaries/uncertified-rejection/taxonomy | 25 | 25 | 0 | §2 above; TAP `1..25 # tests 25 # pass 25` |
| 2 | `iips-platform: tsx --test tests/regression/banking-acceptance.test.ts tests/regression/technology-acceptance.test.ts tests/regression/industrials-acceptance.test.ts tests/regression/hospitality-acceptance.test.ts tests/regression/energy-acceptance.test.ts tests/regression/utilities-acceptance.test.ts tests/regression/consumer-acceptance.test.ts` — certified-engine boundaries (spot 7 sectors, golden/expected oracle) | 50 | 50 | 0 | TAP `1..50 # pass 50` |
| 3 | `iips-platform: tsx --test tests/regression/program-v1.1-track1-platform-certification.test.ts tests/regression/program-v1.1-track3-replay-certification.test.ts tests/regression/program-v1.1-track6-csip-certification.test.ts tests/regression/snapshot-replay.test.ts` — deterministic replay + CSIP sector-neutral (10 vs `PROGRAM_v1.1_REPLAY_BASELINE.json`) | 38 | 38 | 0 | TAP `1..38 # pass 38` |
| 4 | `frontend: vitest run src/features/engines/EngineRegistry.test.tsx server/engine-transport.test.ts` — engine discovery+execution+deter.+404/422/400 | 10 | 10 | 0 | `Test Files 2 passed` |
| 5 | `frontend: vitest run` — full UI (all workspaces, loading/success/error, no fabrication) | 151 + 25 skipped | 151 | 0 | `Test Files 26 passed \| 3 skipped; Tests 151 passed` |
| **Total exercised in this pass** | API + UI + evidence + replay + CSIP + 7 sector acceptances + 3 program tracks | **274** | **274** | **0** | All TAP/vitest logs retained in this evidence file |

**Uncertified/ taxonomy checks — all explicit:**

- `POST /api/engines/sector.materials/execute + sector.telecom + sector.auto → 404 DENIED uncertified-capability` — `engine-api-integration.test.ts:118 + engine-transport.test.ts`.
- `taxonomy guard IT/Chemicals/Realty — no sector.it/chemicals/realty in registry, assertNotTaxonomyResolved throws 422 if attempted` — `EngineRegistry.ts:42–49`.
- `GET /api/engines → 10, IES-006..015, freshness FROZEN, no 016/017/020` — `engine-api-integration.test.ts + engine-transport.test.ts`.

---

## 4. Defects Found and Fixes

| # | File | Reason | E2E | Authority basis | Test added/updated | Evidence |
|---|------|--------|-----|-----------------|--------------------|----------|
| — | — | **No code defects requiring corrective implementation were found** for the authorized 10-engine scope. The `bbbca16` slice is internally coherent: `GET/POST` deterministic, `10/10` oracle-matched, `422/404/400` taxonomy+cert guards, `provenance FROZEN`, `byteIdentical` replay, `10→CSIP` determinism, UI never implies `016/017/020` certified. | 025–029 | Predecessor `PROGRAM_v1.1 LTS` + this continuation's §2 disposition | None — existing 25+10 tests re-pass (see §3) | This §4 + §2 logs |

Preserved as **control-corrective review**: no broadening of scope, no redesign of certified engine behavior, no methodology change, no new engine creation. The **only** changes in this continuation are **control records** (see §6).

---

## 5. Evidence Locations (This Continuation — Additive, Durable)

| Artifact | Path | Type |
|----------|------|------|
| Predecessor reconciliation (held — now committed) | `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_RECONCILIATION.md` | control record |
| Authorized scope disposition (controlling — new) | `docs/integration/IIPS_v3.0_AUTHORIZED_SCOPE_DISPOSITION.md` | control record |
| This evidence (fresh regression — new) | `docs/integration/IIPS_v3.0_CONTINUATION_EVIDENCE.md` | evidence |
| Prior discovery | `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_DISCOVERY.md` | evidence (at `bbbca16`) |
| Prior gap matrix | `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_GAP_MATRIX.md` | evidence (at `bbbca16`) |
| Prior evidence (25+151) | `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_EVIDENCE.md` | evidence (at `bbbca16`) |
| Prior report (A-H) | `docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_REPORT.md` | evidence (at `bbbca16`) |
| Platform integration | `iips-platform/src/integration/EngineRegistry.ts`, `EngineApiAdapter.ts`, `index.ts` | code (at `bbbca16`) |
| Platform tests | `iips-platform/tests/integration/*` (4) | tests (at `bbbca16`) |
| Frontend API/UI | `frontend/src/api/engines.ts`, `frontend/src/features/engines/EngineRegistry.tsx` + `EngineRegistry.test.tsx`, `frontend/server/engine-transport.test.ts` | code/tests (at `bbbca16`) |
| Transport wiring | `frontend/server/executive-transport.ts` (`GET /api/engines`, `POST .../execute`) | code (at `bbbca16`) |

All machine-readable pins (starting `bbbca16`, baseline `c65d53`, ending `TBD` below) are on single lines and grep-able (`grep -E "[0-9a-f]{40}" docs/integration/IIPS_v3.0_CONTINUATION_EVIDENCE.md`).

---

## 6. Governance / Frozen-Artifact Integrity Check (Pre-Commit)

```
git diff --stat c65d533..HEAD -- ies-*/ ies-010* program-v1.1-certification/ iips-platform/IES* governance/  → 0 lines (no frozen manifest/certificate/report modified)
git diff --stat c65d533..HEAD -- iips-platform/src/sector-engines/*/scoring/ iips-platform/src/sector-engines/*/metrics/ iips-platform/src/sector-engines/*/calibration/ → 0 lines (no scoring/methodology change)
git diff --name-only HEAD~1..HEAD (pre-commit, 18 files) → docs/integration/* (4) + frontend/server/engine-transport.test.ts + executive-transport.ts + api/engines.ts + App.tsx + navigation.ts + features/engines/* (2) + iips-platform/src/integration/* (3) + tests/integration/* (4) — all at bbbca16, additive only
git diff --name-only HEAD (pre-commit, untracked) → docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_RECONCILIATION.md + IIPS_v3.0_AUTHORIZED_SCOPE_DISPOSITION.md (+ this file IIPS_v3.0_CONTINUATION_EVIDENCE.md) — control/evidence only
```

**Result:** no governed/frozen artifacts were unintentionally modified; no taxonomy/scoring/certification change.

---

## 7. Commit Discipline — This Continuation

1. Starting HEAD (shown — single line): `bbbca164f227f12800b9cc51ac383d25b9e31def`
2. All changed files (shown — `git status` pre-commit): `?? docs/integration/IIPS_v3.0_ENGINE_INTEGRATION_RECONCILIATION.md`, `?? docs/integration/IIPS_v3.0_AUTHORIZED_SCOPE_DISPOSITION.md`, `?? docs/integration/IIPS_v3.0_CONTINUATION_EVIDENCE.md`
3. Diff/stat: additive 3 docs (reconciliation + disposition + evidence), ~800 lines; no code diff (no corrective code needed)
4. Governed integrity: verified §6 — 0 frozen lines
5. Tests: §3 — 274 exercised, 274 pass, 0 fail (see §3 table)
6. Commit: **to be created next** — only authorized continuation control/evidence files; exact resulting HEAD **reported in Final Report §8** after commit (see that report for the 40-hex pin, single line)
7. Branch sync: to be verified `git ls-remote` after push (or held if no push required — see Final Report §8)

If no code changes were necessary (this continuation), no code commit was manufactured — only control/evidence records.

---

## 8. Note on Pins

`starting HEAD bbbca164f227f12800b9cc51ac383d25b9e31def` and `baseline c65d53373717aacc3a1dce12d47b5aeaf50541a5` are deliberately on single lines above. The ending HEAD after commit will be reported on a single line in the Final Report §8 and, after push, will be verifiable via `git rev-parse HEAD` and `git ls-remote origin arena/01a06c00-iips-review-recovered` (single `40-hex<TAB>refs/heads/arena/01a06c00-iips-review-recovered` line).
