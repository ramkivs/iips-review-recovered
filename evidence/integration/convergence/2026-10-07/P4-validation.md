# P4 — TEST / TYPECHECK / BUILD — VALIDATION REPORT

**IIPS SINGLE-PLATFORM INTEGRATION & CONVERGENCE — P4 only.**
NON-PRODUCTION · READ-ONLY · no test/fixture/config modification (all deviations disclosed below)

- **Evidence date (UTC):** 2026-10-07
- **Environment:** Linux 6.1.158+; Node v22.22.3; npm 10.9.8; Python 3.11.2; gcc 12.2.0 (Debian 12.2.0-14); GNU Make 4.3. Loader for TypeScript where the repos' `.js`-specifier convention defeats Node type-stripping: **tsx 4.19.2** (installed in a disposable tool dir, not in any repo). All suites executed at exact pinned commits in disposable git worktrees; **tracked-file modifications after all runs: 0 in every worktree** (verified `git status --porcelain -uno`).

## 0. Commit identity per run

| Lineage | Repository | Commit | Tree | Working tree |
|---|---|---|---|---|
| IRR main | ramkivs/iips-review-recovered | `17e234a1d6a5e1629cdf98b5c5f241a663cf9901` | `c6fb24d9093ee49e813561ba849c6c26d9da9805` | clean (0 tracked mods) |
| IPD main | ramkivs/iips-production-market-data | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | `db853dc21d01162e69b0e1211dbea1cb5c5f72b1` | clean |
| NP-04 pin | IPD | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | `7c1d516a43153f9c4e1b09bfa259d16da1704bb0` | clean |
| G-2 (G24) | IPD | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` | `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5` | clean |
| IPD exec (special) | IPD | `ea70a8c4fdb52a1378953b2d249a315c9e68ca77` | `1cd05157a7423e89d1686e149786ab90cf57a8fd` | clean |
| IRR restart (special) | IRR | `5eba01b6e818a261230725761b7797b68782e883` | `3573fcc0f8f415438e5bcb034c4bc45f57ae45ec` | clean |

## 1. IRR main @ `17e234a1`

### iips-platform (`npm run typecheck`, `npm test` — repo's own scripts, lockfile toolchain via `npm ci`)
- **Typecheck: PASS** — `tsc --noEmit`, 0 errors.
- **Full suite (`tsx --test` per package script): 642 tests → 599 PASS / 43 FAIL.**
- Failure taxonomy (all deterministic; wp0 re-run alone reproduced 2 pass / 4 fail):
  - `Unknown engine: sector.telecom` × 29
  - `makeEngine is not a function` × 7; `make is not a function` × 1
  - `ENGINE_FACTORY[sec.engineId] is not a function` × 5
  - Protected-surface violation × 1 — `np12-n4-screen-producer.test.ts:1137`: *"Protected surface violation vs `5ca181c…`: unexpected modified file `NP-12-A8-S-03-FAILED-BRANCH-AUTHORITY-DECISION-RECORD.md`"* (main's own history has modified that file since the test's pinned baseline).
- Failing files (count): `program-v2.0-wp11-performance` 9, `wp13-dr` 8, `wp14-migration` 5, `wp1-distributed-runtime` 5, `wp0-constitutional-guard` 4, `final-certification` 4, `wp2-cloud-ha` 3, `wp3-live-data` 1, `wp4-enterprise` 1, `wp10-observability` 1, `wp12-data-governance` 1, `np12-n4-screen-producer` 1.
- **Classification: FAIL (genuine, at the authoritative commit with the repo's own toolchain).** The 43 failures sit in the legacy `program-v2.0-*` regression family + one NP-12 protected-surface guard.

### frontend (disposable full-repo run copy — see §6 deviations)
- **Typecheck: PASS** — `tsc --noEmit`, 0 errors.
- **Full vitest suite (`vitest run`): 998 tests → 973 PASS / 25 SKIPPED / 0 FAIL** (63 files pass, 3 skipped, 1 file failed in the instrumented run — see below). Skips are the live-IdP certification tests self-skipping (`live/live-tenant-engine` 8, `live/admin-live-certification` 13, `live/ai-advisory-live-certification` 4) — **BLOCKED — DEPENDENCY ABSENT (live IdP)**, by design.
  - The single instrumented-run failure (`server/reports/reports-persistence.test.ts` manifest assertion, expecting the `github:…#2e11fa3b` dependency string in `package.json`) was **introduced by this investigation's dependency-materialization workaround**: re-run with the pristine `package.json` restored → **38/38 PASS**. Recorded as PASS with disclosed cause, not counted as a repo failure.
- **Build: PASS** — `tsc -b && vite build`, 89 modules, `dist/` emitted (index-Jwhvudml.js 272.95 kB).
- Cross-repo runtime integration tests on IRR main **pass** against the real pin package: `pitRuntimeIntegration`, `pitD114RuntimeIntegration`, `reports-persistence` (incl. dynamic `./persistence` import).

## 2. IPD main @ `4d3e1cdc`

- **Typecheck: PASS** — `tsc --noEmit`, 0 errors.
- **Build: PASS** — `tsc && vite build` (467 ms; chunk-size warning only).
- **Primary suite `npm test` (their dist-based script, after successful build): 542/542 PASS** (node `--test` over `dist/tests/*.test.js`).
- **Secondary script `npm run test:direct` (`node --test --experimental-strip-types tests/*.test.ts`): BLOCKED — ENVIRONMENT** — Node v22.22 type-stripping does not resolve this repo's `.js`-specifier TS imports (`ERR_MODULE_NOT_FOUND` on intra-repo imports); 48 test files error at load, 0 pass. The identical suite executed with the tsx loader: **542/542 PASS** — so the blockage is the script's loader assumption, not the tests.

## 3. NP-04 pin @ `2e11fa3b`

- **Targeted persistence/PIT-boundary suite (np04 + wsj/wsk/wsi/wsh): 178/178 PASS.**
- **Full suite (`tsx --test tests/*.test.ts`): 720/720 PASS.**
- **Typecheck: FAIL — 4 errors, all in `tests/wsj_iu3_pit_read_boundary.test.ts`** (TS2345 ×2, TS2339 ×2 — `MarketQuotePayload` vs `OHLCVCandle` mismatches in test code; tests pass at runtime).
- **Build (`build:pit-package`, the pin's prepare step): PASS** — emits `dist/package/{pit,d114-non-production,persistence,contracts,normalization}`; all three consumed subpaths verified to resolve from a consumer.

## 4. G-2 (G24) @ `6828155`

- **Full G24 suite (`tsx --test tests/g24_*.test.ts`): 84/84 PASS** (`# tests 84 / # pass 84 / # fail 0`).
- **Historical claim verification:** IRR `userPortfolioContract.ts` states *"G24 suite 84/84 PASS at this tip"* — **INDEPENDENTLY RE-EXECUTED AND VERIFIED (exactly 84 tests, 0 failures) at `6828155`.**
- **Typecheck: FAIL — the same 4 `wsj_iu3` test-code errors** (the G24 lineage carries that test file).
- Native dependency note: `better-sqlite3@13.0.3` — prebuilt binary download blocked by the sandbox proxy (`objects.githubusercontent.com` unreachable) and node-gyp header download blocked (`nodejs.org` unreachable); **built from source using the local Node headers at `/usr/local/include/node` (`npm_config_nodedir=/usr/local`)**; resulting binary verified functional (loads, executes SQL).

## 5. Special lineages

- **IPD exec `ea70a8c`:** `tests/executive_recovery_integration.test.ts` → **18/18 PASS** (run in place; the branch carries a full `iips-platform/` copy inside IPD — see P5 §C).
- **IRR restart `5eba01b`:** native two-process restart proof executed (writer + recoverer, separate PIDs) → **PROVEN** (see P3 §4). The vitest orchestrator was not re-run (would require a full frontend install in that worktree); the proof artifacts themselves were executed directly.

## 6. Environment deviations (all disclosed; none alter test semantics)

1. **IRR frontend dependency materialization:** the sandbox proxy blocks npm's GitHub tarball endpoint (`codeload.github.com`, TLS interception) and npm refuses git-clone fallback for the `github:` spec. In the disposable run copy only: the pin package was **materialized from the exact pinned commit** (worktree `ipd-np04` @ `2e11fa3b`, verified by `git rev-parse`) with its own `prepare` build executed, and the `package.json` dependency entry was removed for install and **restored pristine** before the manifest test re-run. The authoritative worktree was never modified.
2. **IRR frontend layout:** `frontend/server/*` imports `../../iips-platform/src/*` (repo-root sibling); the run was executed in a full-repo copy to preserve those relative imports (an initial frontend-only copy produced 26 spurious file-level failures — discarded, root-caused, and re-run faithfully).
3. **better-sqlite3 source build** with local Node headers (§4).
4. `git insteadOf` ssh→https rewrite configured at sandbox scope for installs (git clone works; npm tarball fetch does not).
5. tsx loader used where Node type-stripping cannot resolve `.js`-specifier TS imports (both IPD `test:direct`-style suites); the repos' primary scripts were still run and recorded as-specified.

## 7. Summary table

| Lineage | Smoke/targeted | Full suite | Typecheck | Build |
|---|---|---|---|---|
| IRR main · iips-platform | — | **599/642 (43 FAIL — genuine)** | PASS | n/a (library) |
| IRR main · frontend | pit/reports integration PASS (within suite) | **973 PASS / 25 skipped (live IdP) / 0 FAIL** | PASS | PASS |
| IPD main | — | **542/542 PASS** (`npm test` dist) | PASS | PASS |
| IPD main · `test:direct` script | — | **BLOCKED — ENVIRONMENT** (loader; same tests 542/542 via tsx) | — | — |
| NP-04 pin `2e11fa3b` | 178/178 | **720/720 PASS** | **FAIL (4 test-code errors)** | PASS (`build:pit-package`) |
| G24 `6828155` | 27/27 (a/c/g) | **84/84 PASS — claim verified** | **FAIL (same 4 test-code errors)** | n/a |
| IPD exec `ea70a8c` | 18/18 | — | — | — |
| IRR restart `5eba01b` | two-process proof PROVEN | — | — | — |

## 8. P4 Disposition

## **P4 — VALIDATION PARTIALLY ESTABLISHED**

- Fully green: IPD main (542/542 + typecheck + build); NP-04 pin suite (720/720) and G24 suite (84/84, historical claim verified) — both with 4 disclosed test-code type errors.
- Genuine failures at the authoritative IRR main: 43/642 in `iips-platform` (legacy `program-v2.0-*` regression family + 1 NP-12 protected-surface guard whose baseline predates main's own file change).
- IRR frontend: effectively 973/973 (25 live-IdP tests self-skip) + typecheck + build.
- No test, fixture, or configuration was modified to alter any result; all environment workarounds are disclosed in §6.

**END P4**
