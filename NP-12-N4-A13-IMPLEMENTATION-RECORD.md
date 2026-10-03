# NP-12 N4-A13 — Increment 2 Screen Producer Implementation & Verification Record

- **Document ID:** `NP-12-N4-A13-IMPLEMENTATION-RECORD`
- **Program:** IIPS Increment 2 — Governed 13-Engine Screen Producer Convergence (`NP12MBR` / `NP12EXE` / `NP12RES` v01)
- **Stage:** `N4-A13` (Increment 2 Producer Implementation Investigation & Controlled Execution)
- **Date:** `2026-10-03`
- **Authoritative Baseline (`origin/main`):** `5ca181c7564a063a01265efdfdc5996563888d49` (root tree `d428cdd6afa7f91ccf8f8301a312b35540ec2ca3`)
- **Controlling Authority Record (`origin/main:NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md`):**
  - Git blob SHA: `e37433d8eb4bf5436bbb4fffc8a873e3538df057`
  - Content SHA-256: `fe85b3904cfbd4009355c80a2c46d748cb7a8463eb4a680ff6bb7031b7350d43`
  - Byte length: `28,925` bytes
- **Implementation Scope Status:** `IMPLEMENTED & LOCALLY VERIFIED (ZERO REGRESSIONS / ZERO PROTECTED-SURFACE DIFFS)`

---

## 1. Phase A & Phase B — Authoritative Baseline & N4-A12 Authority Verification

1. **Repository & Remote Baseline (`Phase A`):**
   - Repository: `https://github.com/ramkivs/iips-review-recovered.git`
   - `git rev-parse origin/main`: `5ca181c7564a063a01265efdfdc5996563888d49`
   - `git rev-parse origin/main^{tree}`: `d428cdd6afa7f91ccf8f8301a312b35540ec2ca3`
   - Worktree status prior to implementation: clean (`git status --porcelain` empty).
2. **N4-A12 Authority Record Verification (`Phase B`):**
   - `git rev-parse origin/main:NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md`: `e37433d8eb4bf5436bbb4fffc8a873e3538df057`
   - `sha256sum NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md`: `fe85b3904cfbd4009355c80a2c46d748cb7a8463eb4a680ff6bb7031b7350d43` (`28,925` bytes)
   - All 12 governance decisions (`GDS-01` through `GDS-12`) and `A12-D01` through `A12-D03` verified as `CLOSED / ACCEPTED`.

---

## 2. Phase C — Read-Only Producer Boundary Investigation Findings

Prior to writing any code, all 13 certified sector engines (`*Engine.ts`, `*Metrics.ts`, `*ScoreEngine.ts`, `*Calibration.ts`, calibration JSONs), `RuntimeCoordinator.ts`, `SnapshotService.ts`, `SnapshotStore.ts`, `EvidencePipeline.ts`, `EngineRegistry.ts`, `EngineApiAdapter.ts`, CSIP (`OntologyMapper.ts`, `ScreeningPopulation.ts`, `CrossSectorEngine.ts`, `CrossSectorPlugin.ts`), and the 8 frozen N4-A10 Screen runtime files (`ScreenMemberInput.ts`, `CanonicalFormats.ts`, `ScreenEvaluator.ts`, `ScreenExecution.ts`, `ScreenResult.ts`, `screen/index.ts`, `np12-n4-a9-screen-runtime.test.ts`, `np12-n4-a9-screen-runtime-format1.json`) were inspected at `5ca181c7564a063a01265efdfdc5996563888d49`:

| Area | Live Codebase Verification at `5ca181c7564a063a01265efdfdc5996563888d49` | Producer Boundary Disposition |
|---|---|---|
| **1. Snapshot Pillar Storage (`SnapshotService.ts:19,41`)** | All 13 engines invoke `this.runtime.recordSnapshot(ENGINE_ID, metrics, score.pillars as unknown as Record<string, number>, decision.verdict)`. `SnapshotService.create` stores `score.pillars` on `snapshot.scores: Readonly<Record<string, number>>`. | `extractSnapshotSupportingScores(snapshot)` reads `snapshot.supportingScores ?? snapshot.scores` and also supports `{ id, value }[]` arrays, failing closed (`PRODUCER_SUPPORTING_SCORES_MISSING`) if absent or empty. |
| **2. Engine Registry Lookup (`EngineRegistry.ts:62-75`)** | `src/integration/EngineRegistry.ts` exports `CERTIFIED_ENGINES`, `getEngineEntry(engineId)`, and `getEngineForSector(sectorFamily)`. | `DEFAULT_ENGINE_REGISTRY` wraps `getEngineEntry` as `getEngine(engineId)` and `getEngineForSector(sectorFamily)` without modifying `EngineRegistry.ts`, and supports injectable `EngineRegistryLookup` for fail-closed testing. |
| **3. Snapshot/Evidence Determinism (`SnapshotService.ts:39`, `EvidencePipeline.ts:41`)** | `snapshotId` and `evidenceId` participate in the `NP12MBR` v01 `inputHash` preimage (`CanonicalFormats.ts:154-169`). `SnapshotService` and `EvidencePipeline` derive IDs from `Clock` and `IdProvider`. | `produceScreenMember` constructs an isolated `FixedClock('2026-08-09T00:00:00.000Z')` and `DeterministicIdProvider(\`${canonicalSector}:${companyId}\`)` independent of caller audit-only `timestamp` and `requestId`, guaranteeing `A6-DR-02` / `A6-DR-03` invariance. |
| **4. Growth Constituents in `AutoScoreEngine.ts:55`** | `AutoScoreEngine.ts:55` computes `growth` from `['AU-002', 'AU-003']` (`renorm(pair(m('AU-002', ...), 0.5), pair(m('AU-003', ...), 0.5))`), while `AU-001` is in `quality`/`valuation` and `AU-004` is in `profitability`. | `GROWTH_CONSTITUENT_INPUT_KEYS_BY_ENGINE_ID['sector.auto']` binds `['AU-002', 'AU-003']`, matching the live `AutoScoreEngine.ts:55` growth pillar calculation. |
| **5. Live Missing-Input Behavior Across the 11 Input-Backed Engines** | When all growth constituent inputs are omitted during live `Engine.execute()`: `Insurance` fabricates `50`, `Capital Markets` fabricates `60`, and `Technology`, `Telecommunications`, `Automobile`, `Materials & Metals` collapse to `renorm() = 0`; `Hospitality`, `Energy`, `Utilities`, `Consumer` throw `no band for ... value undefined` inside frozen `band()`; `Industrials` returns `NaN` from `band()` into `pair()`. | `evaluateEngineGrowthDisposition` and `adaptExecutionResultToScreenMember` enforce `GDS-05` (`UNAVAILABLE / null` when all growth constituent inputs are `undefined`/`null`) across all 11 input-backed engines; `produceScreenMember` converts all 6 live-completing engines (`50`/`60`/`0`) to `UNAVAILABLE / null` and fails closed on the 5 engines whose frozen `score()` rejects `undefined`. |
| **6. IEEE-754 Float to 6dp Half-to-Even (`GDS-06`)** | Converting `x.toPrecision(15)` back to binary `Number(...)` before `.toFixed(15)` re-introduces binary64 representation error (e.g. `50.1234565` -> `"50.123456500000003"`), breaking exact half-to-even ties. | `canonicalizeRuntimeDecimal` parses the string `value.toPrecision(15)` directly into exact scaled `BigInt` digits (`10^24` scale) and performs integer round-half-to-even to `10^6` scale (`q`), then formats via `canonicalDecimalText(q)` and verifies via `requireCanonicalDecimal`. |
| **7. N4-A10 `screen/index.ts` Zero-Touch Invariant** | `np12-n4-a9-screen-runtime.test.ts` Subtest 2 asserts that `src/sector-engines/cross-sector/screen/index.ts` exports only the frozen N4-A10 symbols. | `ScreenProducerAdapter.ts` is added as a standalone module `src/sector-engines/cross-sector/screen/ScreenProducerAdapter.ts`; `screen/index.ts` and all other N4-A10 files remain 100% untouched. |

---

## 3. Phases D–I — Governance Decision Implementation Summary (`GDS-01`..`GDS-12`)

| Decision ID | Governed Rule | Implementation in `ScreenProducerAdapter.ts` |
|---|---|---|
| **`GDS-01`** | Runtime pillar source via `ExecutionResult.snapshotRef -> SnapshotStore.get(snapshotRef)` | `adaptExecutionResultToScreenMember` verifies `result.state === 'COMPLETED'`, resolves `snapshotStore.get(result.snapshotRef)`, verifies `snapshot.snapshotId === result.snapshotRef` and `snapshot.engineId === engineId`, and extracts runtime pillar scores via `extractSnapshotSupportingScores(snapshot)`. Zero fixture reads. |
| **`GDS-02`** | 13-engine `score.pillars -> Screen quality` mapping | `QUALITY_PILLAR_BY_ENGINE_ID` maps `Banking` -> `'asset-quality'`, `Insurance` -> `'underwriting'`, `Capital Markets` -> `'earnings-quality'`, `Healthcare` -> `'clinical-quality'`, `Hospitality` -> `'earningsQuality'`, and the remaining 8 engines -> `'quality'`. |
| **`GDS-03`** | Banking growth availability (**Option B: `UNAVAILABLE` / `null`**) | `GROWTH_CONSTITUENT_INPUT_KEYS_BY_ENGINE_ID['sector.banking'] = null`. `evaluateEngineGrowthDisposition` unconditionally emits `growthAvailability: 'UNAVAILABLE'`, `growth: null` (omitted on `ScreenMemberInput`), ignoring `BankingScoreEngine`'s hardcoded `50`. |
| **`GDS-04`** | Healthcare growth availability (`UNAVAILABLE` / `null`) | `GROWTH_CONSTITUENT_INPUT_KEYS_BY_ENGINE_ID['sector.healthcare'] = null`. `evaluateEngineGrowthDisposition` unconditionally emits `growthAvailability: 'UNAVAILABLE'`, `growth: null`. |
| **`GDS-05`** | 11 input-backed engines growth availability & zero vs unavailable distinction | `evaluateEngineGrowthDisposition` inspects the governed growth constituent input keys for each engine: if all are `undefined` or `null`, emits `growthAvailability: 'UNAVAILABLE'`, `growth: null`; if at least one is present, emits `growthAvailability: 'AVAILABLE'` with `canonicalizeRuntimeDecimal(supportingScores.growth).text` (preserving legitimate numeric `'0'`). |
| **`GDS-06`** | 6dp round-half-to-even canonical decimal serialization (**Option A**) | `canonicalizeRuntimeDecimal` rejects non-finite (`PRODUCER_DECIMAL_NON_FINITE`) and `< 0` / `> 100` (`PRODUCER_DECIMAL_OUT_OF_RANGE`) values, normalizes `-0` to `'0'`, parses `value.toPrecision(15)` into `BigInt`, rounds half-to-even at `10^6` scale, strips trailing fractional zeroes via `canonicalDecimalText(q)`, and verifies grammar via `requireCanonicalDecimal`. |
| **`GDS-07`** | Caller-bound `companyId` & sector-scoped `(sector, referenceId)` composite identity (**Option 2**) | `resolveCallerMemberIdentity` requires `request.companyId` or `inputs.companyId`, rejects missing/blank/padded/non-ASCII/synthetic `${sector}-H1` tokens and any mismatch with `referenceId` or `inputs.id`, and constructs `(sector, referenceId)`. Retains `("Insurance", "IN-001")` and `("Industrials", "IN-001")` as distinct governed identities. |
| **`GDS-08`** | Authoritative `engineVersion` and `calibrationVersion` from `EngineRegistry` (**Option A**) | `resolveEngineAndSector` queries `registry.getEngine(engineId)` / `getEngineForSector(sector)`, verifies non-empty `engineId`, `engineVersion`, `calibrationVersion`, and cross-checks `plugin.identity` and `result.metadata.calibrationVersion`. |
| **`GDS-09`** | Runtime provenance preservation & hash exclusion of `timestamp`/`requestId` | `ScreenProducerProvenance` binds `snapshotId`, `evidenceId`, `engineId`, `engineVersion`, `calibrationVersion`, `(sector, referenceId)`, and audit-only `timestamp` / `requestId`. `timestamp` and `requestId` never enter `NP12MBR`, `NP12EXE`, or `NP12RES`. |
| **`GDS-10`..`GDS-12`** | Direct producer construction outside CSIP/`OntologyMapper`, `iips-platform/src/**` boundary, IPD reference-only | Implemented wholly inside `iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter.ts` with zero changes to CSIP, `executive-transport.ts`, `frontend/tsconfig.json`, or IPD. |

---

## 4. Live 13-Sector Golden Baseline Producer Convergence Table

Executed via `produceScreenMembers` and `executeProducedScreen` at `DEFAULT_PRODUCER_CLOCK_EPOCH = '2026-08-09T00:00:00.000Z'` against the 13 sectors in `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json`:

| # | Canonical Sector (`G1`) | `referenceId` (`GDS-07`) | `engineId` (`GDS-08`) | `conviction` (`GDS-06`) | Quality Pillar (`GDS-02`) | `quality` (`GDS-06`) | `growthAvailability` (`GDS-03..05`) | `growth` (`GDS-06`) |
|---|---|---|---|---|---|---|---|---|
| 1 | `Banking` | `BK-001` | `sector.banking` | `"47.1"` | `asset-quality` | `"15"` | `UNAVAILABLE` | `null` (omitted) |
| 2 | `Insurance` | `IN-001` | `sector.insurance` | `"72.3"` | `underwriting` | `"72.2"` | `AVAILABLE` | `"72.5"` |
| 3 | `Capital Markets` | `CM-001` | `sector.capital-markets` | `"84.6"` | `earnings-quality` | `"90"` | `AVAILABLE` | `"82.5"` |
| 4 | `Healthcare` | `HC-001` | `sector.healthcare` | `"75.5"` | `clinical-quality` | `"90"` | `UNAVAILABLE` | `null` (omitted) |
| 5 | `Hospitality` | `HP-001` | `sector.hospitality` | `"79"` | `earningsQuality` | `"40"` | `AVAILABLE` | `"75"` |
| 6 | `Energy` | `EN-001` | `sector.energy` | `"66.9"` | `quality` | `"75"` | `AVAILABLE` | `"60"` |
| 7 | `Utilities` | `UT-001` | `sector.utilities` | `"74.1"` | `quality` | `"79.5"` | `AVAILABLE` | `"75"` |
| 8 | `Consumer` | `CS-001` | `sector.consumer` | `"79.5"` | `quality` | `"90"` | `AVAILABLE` | `"75"` |
| 9 | `Industrials` | `IN-001` | `sector.industrials` | `"77.2"` | `quality` | `"75"` | `AVAILABLE` | `"75"` |
| 10 | `Technology` | `TE-001` | `sector.technology` | `"76.3"` | `quality` | `"85.5"` | `AVAILABLE` | `"75"` |
| 11 | `Telecommunications` | `TL-001` | `sector.telecom` | `"68.4"` | `quality` | `"68.4"` | `AVAILABLE` | `"68.4"` |
| 12 | `Automobile` | `AU-001` | `sector.auto` | `"71.6"` | `quality` | `"71.6"` | `AVAILABLE` | `"71.6"` |
| 13 | `Materials & Metals` | `MM-001` | `sector.materials` | `"74.9"` | `quality` | `"74.9"` | `AVAILABLE` | `"74.9"` |

---

## 5. Phase L & Phase M — Pre/Post Baseline Test Accounting & Changed-Path Audit

### 5.1 Pre/Post Baseline Test Accounting (`Phase L`)

| Verification Suite | Pre-Implementation (`5ca181c`) | Post-Implementation (`N4-A13`) | Delta |
|---|---|---|---|
| `npm run typecheck` (`tsc --noEmit`) | `0` errors | `0` errors | `0` errors |
| `tests/regression/np12-n4-a9-screen-runtime.test.ts` (N4-A10) | `45` total / `45` pass / `0` fail | `45` total / `45` pass / `0` fail | `0` regressions |
| `tests/regression/np12-n4-screen-producer.test.ts` (N4-A13) | *(not present)* | `14` total / `14` pass / `0` fail | `+14` passing tests |
| Full `npm test` (`iips-platform`) | `628` total / `586` pass / `42` pre-existing fail | `642` total / `600` pass / `42` pre-existing fail | **`+14` pass / `0` new failures** |

All 42 pre-existing failures (`FC-CORE`, `FC-CORE-2`, `FC-0`, `FC-10`, `WP0-A1..A4`, `D-CERT-01/04/06/07/10`, `O2-CERT-08`, `P-CERT-02..10`, `DG-CERT-10`, `DR-CERT-01..08`, `M-CERT-01/02/03/06/10`, `H-CERT-01/03/06`, `L-CERT-11`, `E-CERT-07`) were diffed pre- vs post-implementation and confirmed 100% unchanged (`new failures = 0`).

### 5.2 Changed-Path & Protected-Surface Zero-Diff Audit (`Phase J` & `Phase M`)

- **Added Files (3 total):**
  1. `iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter.ts`
     - Git blob SHA: `2bb7864f930699b16789bbd0ac971a5a342fad67`
     - SHA-256: `bf9caa24ea91041a13611c5090adbaa0fc96a392cbaa38204e874449b402b948`
     - Byte length: `43,907` bytes
  2. `iips-platform/tests/regression/np12-n4-screen-producer.test.ts`
     - Git blob SHA: `ae3bf707e751b92b94cce6470100c860eeec6d5d`
     - SHA-256: `ca9def39fd393c6b0a0909ad83041b93dd71f9a25a187fe2ea3f4d37dae1434c`
     - Byte length: `45,296` bytes
  3. `NP-12-N4-A13-IMPLEMENTATION-RECORD.md`
- **Modified Existing Tracked Files:** `0` (`git diff 5ca181c7564a063a01265efdfdc5996563888d49 --diff-filter=M --name-only` is empty).
- **Protected-Surface Zero-Touch Verification:**
  - All 13 sector engines (`iips-platform/src/sector-engines/{banking,insurance,capital-markets,healthcare,hospitality,energy,utilities,consumer,industrials,technology,telecom,auto,materials}/**`): `0` changes.
  - Frozen N4-SD (`iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition.ts`): `0` changes.
  - Frozen N4-A10 Screen runtime (`ScreenMemberInput.ts`, `CanonicalFormats.ts`, `ScreenEvaluator.ts`, `ScreenExecution.ts`, `ScreenResult.ts`, `screen/index.ts`, `np12-n4-a9-screen-runtime.test.ts`, `np12-n4-a9-screen-runtime-format1.json`): `0` changes.
  - CSIP (`OntologyMapper.ts`, `ScreeningPopulation.ts`, `CrossSectorEngine.ts`, `CrossSectorPlugin.ts`, `cross-sector/index.ts`): `0` changes.
  - `EngineRegistry.ts`, `EngineApiAdapter.ts`, `frontend/server/executive-transport.ts`, `frontend/tsconfig.json`: `0` changes.
  - E2E-030 / D38 / LTS certification artifacts, freeze manifests, and `PROGRAM_v1.1_REPLAY_BASELINE.json`: `0` changes.

---

## 6. Phase N — Certification Boundary & Residual Governance Items

1. **Certification Claim Boundary (`N4-A12 §12.2`):**
   - Existing E2E-030 13-engine certification is preserved untouched (`0` diffs across all 13 certified sector engines and frozen calibration/golden assets).
   - E2E-030 certification does **not** transitively certify `ScreenProducerAdapter.ts` or cross-sector Screen execution. What is verified in N4-A13 is bounded Increment 2 producer-to-Screen (`NP12MBR` / `NP12EXE` / `NP12RES` v01) convergence, determinism, and N4-A10 differential parity across all 13 engines for the `COMPLETED` execution branch.
2. **Open Governance Gap Preserved (`A8-S-03`):**
   - `A8-S-03` (`FAILED`-result semantics and hashing) remains an independent open governance item outside N4-A12 and N4-A13; neither N4-A10 nor `ScreenProducerAdapter.ts` emits or hashes a `FAILED` `ScreenResult`.
