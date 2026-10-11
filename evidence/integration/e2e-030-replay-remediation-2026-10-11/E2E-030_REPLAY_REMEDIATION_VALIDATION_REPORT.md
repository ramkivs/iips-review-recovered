# E2E-030 — 13-Engine Replay Remediation and Technical Validation Report

- **Date:** 2026-10-11
- **Repository:** `ramkivs/iips-review-recovered` (`/home/user/iips-review-recovered`)
- **Development Branch:** `arena/17a2c787-iips-review-recovered`
- **Starting `HEAD` / Base Commit:** `1c873ed5cd57b769abeff4ee92160a71914fe513` (`origin/main`)
- **Governance & Scope Boundary:** Technical remediation and validation only. Does **not** issue or imply E2E-030 13-engine certification, does **not** create the D42 governance decision, and does **not** authorize P15/P16 progression, release, tagging, or production. The existing 10-engine LTS certification (`286f3da6f20080e9bd13cf76cd8dd1608b89debd`) remains the sole operative certified boundary.
- **Technical Readiness Verdict:** **`TECHNICALLY VALIDATED`**

---

## 1. Canonical 13-Engine Scope

- **Original 10 Certified LTS Engines (`IES-006`–`IES-015`):**
  1. `sector.banking` (`IES-006`)
  2. `sector.insurance` (`IES-007`)
  3. `sector.capital-markets` (`IES-008`)
  4. `sector.healthcare` (`IES-009`)
  5. `sector.hospitality` (`IES-010`)
  6. `sector.energy` (`IES-011`)
  7. `sector.utilities` (`IES-012`)
  8. `sector.consumer` (`IES-013`)
  9. `sector.industrials` (`IES-014`)
  10. `sector.technology` (`IES-015`)
- **3 Deferred Canonical Engines (`IES-016`, `IES-017`, `IES-020`):**
  11. `sector.telecom` (`IES-016`)
  12. `sector.auto` (`IES-017`)
  13. `sector.materials` (`IES-020`)

No IPD engine identifiers (`sector.telecommunications`, `sector.automobile`, `sector.materials-metals`) were introduced or substituted.

---

## 2. Confirmed Root Cause

### 2.1 `ReplayService` Literal-Return Defect (`M-2`) at Base Commit `1c873ed5`
At `1c873ed5cd57b769abeff4ee92160a71914fe513`, `iips-platform/src/replay/ReplayService.ts` (lines 14–23) was a 32-line stub that retrieved the snapshot from `SnapshotStore` and unconditionally returned literal `{ snapshotId, reproduced: true, byteIdentical: true, evidenceRefs: snapshot.evidenceRefs }` without registering or invoking an executor, without storing or reading execution context on snapshots, and without recomputing or hashing outputs.

### 2.2 Why Prior IPD Remediation (`83c098b9a9f7b81bfb1b146fb65348ab71e121ad`) Failed 44 Tests
1. **Unbound Execution Context in `RuntimeCoordinator`:** `RuntimeCoordinator.execute(engineId, request)` stored `this.lastRequest`, but `RuntimeCoordinator.recordSnapshot(engineId, metrics, scores, verdict)` never attached `this.lastRequest` when called by sector engines during `execute()`, leaving `snapshot.provenance` without `engineId`/`requestId`/`input.*` and causing `ReplayService.replay()` to return `reproduced: false, byteIdentical: false` (`No execution context available for replay`).
2. **Asymmetric Input Serialization in `SnapshotService` vs. `ReplayService`:** `SnapshotService.create()` serialized inputs via `JSON.stringify(value)` into `provenance['input.<key>']`, while `ReplayService.extractExecutionContext()` read the raw string without `JSON.parse()`, corrupting numeric, boolean, array, and object inputs on replay.
3. **Unintercepted `recordSnapshot` During Replay Re-Execution:** When `RuntimeCoordinator`'s replay executor re-executed `this.plugins.execute(engineId, { requestId, inputs })` under a deterministic `FixedClock` and `DeterministicIdProvider`, the sector engine called `this.runtime.recordSnapshot(...)`, which generated the identical `snapshotId` and called `this.snapshotStore.append(snapshot)`, throwing `Error: Snapshot already exists: SNAP_...`.
4. **Direct `recordSnapshot` and Direct `PluginLoader.execute` Paths:** Tests invoking `plugins.execute(engineId, request)` directly or calling `runtime.recordSnapshot(engineId, metrics, scores, verdict)` outside `runtime.execute()` lacked active request tracking or direct-snapshot replay context.

---

## 3. Exact Files Modified and Why

1. `iips-platform/src/plugin-loader/PluginLoader.ts`
   - Tracks the active `ExecutionRequest` per `engineId` (`activeRequest(engineId)`) during `PluginLoader.execute(engineId, request)` so `RuntimeCoordinator.recordSnapshot` can bind the executing request context whether invoked via `runtime.execute()` or `plugins.execute()`.
2. `iips-platform/src/snapshot/SnapshotService.ts`
   - Extends `SnapshotInput` with optional `executionContext` (`requestId`, `inputs`, `contractVersion`, `calibrationVersion`) and serializes JSON-serializable execution inputs (excluding circular host-injected `__engine_*` references) into immutable `snapshot.provenance` while preserving `Snapshot` structure, `deepFreeze`, and `SNAP_*` ID generation.
3. `iips-platform/src/replay/ReplayService.ts`
   - Replaces the literal-return stub with actual replay recomputation via a registered `ReplayExecutor`, `JSON.parse` input reconstruction in `extractExecutionContext()`, deterministic sorted-entry SHA-256 comparison (`hashRecord`) across `metrics`, `scores`, and `verdict`, and explicit failure reporting (`reproduced: false, byteIdentical: false` with diagnostic when executor/context is missing or execution fails; `reproduced: true, byteIdentical: false` when recomputed output diverges).
4. `iips-platform/src/runtime/RuntimeCoordinator.ts`
   - Registers a governed replay executor in the constructor, binds active execution context in `recordSnapshot()`, intercepts `recordSnapshot()` in replay-capture mode during replay re-execution so `SnapshotStore` is not mutated or duplicated during replay, and supports replay recomputation for both full plugin executions and direct `recordSnapshot()` calls.
5. `iips-platform/src/replay/ReplayService.test.ts`
   - Adds V-C1 through V-C6 unit and mutation-proof tests verifying computed `reproduced`/`byteIdentical` results, divergent output detection (`byteIdentical: false`), missing snapshot (`undefined`), missing executor (`reproduced: false`), missing execution context (`reproduced: false`), multi-engine `replayAll()`, and 3 mutation proofs.
6. `iips-platform/tests/regression/snapshot-replay.test.ts`
   - Wires the standalone `ReplayService` regression test with a deterministic executor and `executionContext` so it exercises real recomputation.
7. `iips-platform/tests/integration/replay-e2e.test.ts`
   - Wires all 13 canonical sector engine plugins (`sector.banking`..`sector.technology` + `sector.telecom`, `sector.auto`, `sector.materials`) through `RuntimeCoordinator -> ReplayService` in `[E2E-028]` and adds golden-reference snapshot/replay acceptance coverage across all frozen golden cases of `IES-016` (`sector.telecom`), `IES-017` (`sector.auto`), and `IES-020` (`sector.materials`).

---

## 4. Validation Commands and Results

| Suite / Scope | Command (in `iips-platform/`) | Total | Pass | Fail |
|---|---|---:|---:|---:|
| `ReplayService` unit & V-C1..V-C6 mutation proofs | `npx tsx --test src/replay/ReplayService.test.ts` | 7 | 7 | 0 |
| Track 3 Replay Certification (`T3-CERT-01`..`T3-CERT-11`, incl. `T3-CERT-05` & `T3-CERT-09`) | `npx tsx --test tests/regression/program-v1.1-track3-replay-certification.test.ts` | 11 | 11 | 0 |
| `E2E-025`–`E2E-029` integration & 13-engine + `IES-016/017/020` golden replay | `npx tsx --test tests/integration/*.test.ts` | 29 | 29 | 0 |
| 10-Engine LTS + CSIP acceptance, framework-integration, reuse-verification, WP4 | `npx tsx --test tests/regression/{banking,insurance,capital-markets,healthcare,hospitality,energy,utilities,consumer,industrials,technology,cross-sector}-*.test.ts` | 239 | 239 | 0 |
| Standard platform regression command (`npm test`) | `npm test` (`tsx --test src/**/*.test.ts tests/regression/*.test.ts`) | 648 | 648 | 0 |
| Full platform + integration suite (all 72 test files) | `npx tsx --test $(find src tests -name '*.test.ts' \| sort)` | 690 | 690 | 0 |
| TypeScript compiler check | `npm run typecheck` (`tsc --noEmit`) | — | PASS | 0 |
