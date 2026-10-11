# IIPS Integrated Verification — Remediation Report (2026-10-11)

Scope: three authorized defect groups behind the 49 Windows platform-test failures.
Authority: user-authorized remediation, plus `npm ci --no-audit --no-fund` in `iips-platform` (lockfile-exact; `package.json` and the lockfile are unchanged).
Certification: **unchanged**. No certification record, governance record, or protected source was edited. Passing tests here are not certification approval, and no 13-engine certification is asserted.

Commits on `arena/2034893d-iips-review-recovered`:
- `6704c4d` — remediation (12 test files and `.gitattributes`). This is the commit verified in section 6.
- second commit — this evidence folder.

## 1. Starting identity

- Repository `ramkivs/iips-review-recovered`, branch `arena/2034893d-iips-review-recovered`.
- HEAD `3064a90f181d37b50b08b333989926826ff28880` = `origin/main` = remote `refs/heads/main` (checked with `git ls-remote`).
- Working tree clean. The workspace is a shallow clone, so the baseline `5ca181c` is not present there.

## 2. Changes

| File | Group | Change |
|---|---|---|
| `.gitattributes` (new) | A | Exact-path `text eol=lf` for the 8 byte-asserted files only. No globs and no repo-wide policy. |
| `iips-platform/tests/regression/program-v2.0-final-certification.test.ts` | B | `ENGINE_FACTORY` gained telecom, auto and materials (13 total). |
| `…-wp0-constitutional-guard.test.ts` | B | Same factory completion. Plugin-count assertion uses `BASELINE.sectors.length`. |
| `…-wp1-distributed-runtime.test.ts` | B | Same factory completion. Count assertions use `BASELINE.sectors.length`. |
| `…-wp14-migration.test.ts` | B | Same factory completion. |
| `…-wp2-cloud-ha.test.ts` | B | `ALL_ENGINES` completed to 13. Count assertion uses `BASELINE.sectors.length`. |
| `…-wp3-live-data.test.ts`, `…-wp4-enterprise.test.ts`, `…-wp10-observability.test.ts`, `…-wp11-performance.test.ts`, `…-wp12-data-governance.test.ts`, `…-wp13-dr.test.ts` | B | `ALL_ENGINES` completed to 13. Count assertions use `BASELINE.sectors.length`. |
| `iips-platform/tests/regression/np12-n4-screen-producer.test.ts` | C | A13 check rescoped to protected pathspecs, baseline `5ca181c` kept, only an *added* `ScreenProducerAdapter.ts` permitted. `execSync` → `execFileSync`. |

What changed in the test files, exactly:
- Test titles (`test('…')`) are unchanged.
- Assertion **messages** were changed where they named the count (for example `'common plugin contract hosts all 10'` → `'… all baseline sectors'`). This is cosmetic. It does not change pass or fail behavior, but it does change message text.
- Hard-coded `10` counts became `BASELINE.sectors.length` (13). No assertion was removed without a replacement.
- The `warmMs < 10` threshold (wp0) is a time bound and was not changed.

No `src/`, fixture, expected hash, baseline, certification record, `package.json` or lockfile was changed.

## 3. Remediation A — byte-sensitive failures

- Mechanism (reproduced in simulation): with `core.autocrlf=true`, working files are CRLF, so raw SHA-256 and git-blob identities no longer match committed LF bytes.
- Fix: `.gitattributes` `text eol=lf` for exactly four calibration JSONs, `ScreenDefinition.ts`, `cross-sector/index.ts`, `cross-sector/population/ScreeningPopulation.ts`, and `NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD.md`.
- `index.ts` and `ScreeningPopulation.ts` are included because the A10 zero-touch test also reads them. Under simulated CRLF they have 14 and 239 CR bytes, so they would fail once `ScreenDefinition.ts` passes.
- Evidence (`raw-byte-check-pre-fix.txt`, `raw-byte-check-post-fix.txt`):
  - Pre-fix (CRLF): the four calibration SHA-256 values mismatch the freeze manifests. `ScreenDefinition.ts`, the grammar record, `index.ts` and `ScreeningPopulation.ts` mismatch their committed blob IDs.
  - Post-fix (CRLF): calibration SHA-256 values match, blob IDs match committed content, and CR count is 0 on all eight files.
- Committed bytes of these files are unchanged. Git blob IDs under `attr/text eol=lf` are unchanged.

## 4. Remediation B — Family A factories

- The production registry already has 13 engines (`src/integration/EngineApiAdapter.ts` lines 42–44 imports and 71–73 mappings). The defect was in the test-local maps, so no production code was edited.
- Added `TelecomEngine`, `AutoEngine` and `MaterialsEngine` (imported from `../../src/sector-engines/{telecom,auto,materials}/`) to the 11 affected test files.

## 5. Remediation C — A13 protected-surface check

- The defect was scope. The original check diffed the whole repository against `5ca181c`. That diff contains 225 changed paths; 223 are outside the two files the old allowlist permitted (`np12-n4-screen-producer.test.ts` and the A13 record).
- New scope: `iips-platform/src/sector-engines`, `iips-platform/src/integration`, `iips-cross-sector`, `program-v1.1-certification`, and `ies-*`. Protected paths may only have status `A` (added), and only for `ScreenProducerAdapter.ts`. Any `M` or `D` on a protected path fails.
- Negative controls, run on the committed `6704c4d` (full-history CRLF clone; each probe reverted):

| Control | Result | Expected | Verdict |
|---|---|---|---|
| C0 clean tree | PASS | PASS | correct |
| C1 modified protected engine file | **FAIL** | FAIL | detected |
| C2 staged new file in a protected engine directory | **FAIL** | FAIL | detected |
| C3 modified out-of-scope A13 record | PASS | PASS | correct (not protected) |
| C4 modified allowlisted `ScreenProducerAdapter.ts` | PASS | PASS (allowed) | **not detected**; see residual 2 |

## 6. Verification results

| Run | Environment | Total | Pass | Fail |
|---|---|---:|---:|---:|
| **Authoritative: committed `6704c4d`, full history, `core.autocrlf=true`, clean checkout** | CRLF clone | **655** | **655** | **0** |
| Pre-fix `main` 3064a90, full suite | CRLF simulation, full history | 655 | 606 | 49 |
| Post-fix, full suite, Arena workspace | shallow (baseline missing) | 655 | 654 | 1 (A13 `bad object 5ca181c`) |
| Post-fix, `npm test` as scripted | Arena workspace | 642 | 641 | 1 (A13) |
| Byte-sensitive tests, pre-fix | CRLF simulation | 108 | 102 | 6 |
| Byte-sensitive tests, post-fix | CRLF simulation | 108 | 108 | 0 |
| Typecheck, `npm run typecheck` | Arena | — | exit 0 | — |

Notes:
- The pre-fix CRLF simulation reproduces the Windows totals (655 / 606 / 49). All 49 failing identities match the inventory (`failure-reconciliation-49.tsv`).
- An earlier post-fix CRLF scratch (`/tmp/win-after`) gave 655/655, but its `HEAD` (`68ec6a7`) lacked five hunks that were only in its worktree. That run tested the worktree, not a commit, so the authoritative row above is the one to rely on.
- `npm test` unquoted: the shell expands `src/**/*.test.ts` one level only, giving 642 tests. The recursive glob gives 655, which matches Windows. This is a runner-glob difference, not a test difference.
- Typecheck covers `src/` only (`tsconfig.include`). The changed test files were checked with a scratch config outside the repo. Two errors exist on lines I did not change: `wp11` line 130 (TS2783, duplicate `nodes` key) and `wp14` line 132 (TS2339, `contractVersion`). They are pre-existing and out of scope, and not fixed here.

## 7. Reconciliation of the 49 original failures

- **Fixed and passing, authoritative run: 49 of 49.** This covers all 42 Family A failures and the 7 others (4 calibration, A10 zero-touch, N4 grammar, A13).
- **Passing in the Arena shallow workspace: 48 of 49.** The exception is A13, which fails only because the shallow clone lacks the baseline object. It passes in a full-history clone.
- **Still failing: 0** in the verified environments.
- **Newly exposed failures: none** in the full-suite runs.
- **Not rerun:** the frontend typecheck, tests and build. They are outside this gate and were not run.
- A changed message or title is not used as proof of resolution. Resolution is shown only by passing status in the runs above.

## 8. Residual limitations and open items

1. **A13 needs full history.** In a shallow clone it fails loudly, not silently. A full-history clone passes. The workspace was not deepened or fetched, to preserve the repository state.
2. **Allowlisted adapter edits are not detected (control C4).** `ScreenProducerAdapter.ts` is absent at `5ca181c`, so it always reports as status `A`. Closing this needs a content pin (blob hash), which is a separate decision.
3. **Untracked files are not compared.** `git diff <commit>` covers tracked files only. The original check had the same gap. A staged new file is detected (C2). An unstaged untracked file is not.
4. **Test titles still say 10.** These are kept deliberately so failure identities are stable. At least these exist: `FC-CORE … across all 10 sectors`, `FC-10 … all 10 engines`, `WP0-A1: 10-sector Replay Baseline`, `D-CERT-01 … all 10 sectors`, `H-CERT-01 … all 10 engines`. The grep is best-effort, so the list may be incomplete. Renaming is a separate decision.
5. **Windows working copies need a refresh after pulling.** `.gitattributes` affects checkout, not existing files. A `core.autocrlf=true` clone keeps CRLF in the eight files until they are re-checked-out. The owner should refresh those files (for example, delete them and run `git checkout -- <paths>`), then confirm with `git ls-files --eol` (`attr/text eol=lf`, `w/lf`). This was not executed here. Do not run a renormalize.
6. **13-engine delta-certification governance decision is outstanding.** The question of whether a separate authority record is required for the 13-engine delta is unresolved. This remediation does not address or claim it.
7. **Frontend not verified** in this remediation.

## 9. Certification and governance boundary

No certification record, governance record, E2E document or protected source was changed. The 10-engine LTS remains the only established certification. The 13-engine delta is not certified by this work.

## 10. Evidence files (this folder)

- `REMEDIATION-REPORT.md`: this report.
- `failure-reconciliation-49.tsv`: 49-row reconciliation (identity, file, line, status per run, source).
- `run-summaries.txt`: totals and every `not ok` identity for each run, plus the authoritative run and controls C0–C4.
- `raw-byte-check.mjs`, `raw-byte-check-pre-fix.txt`, `raw-byte-check-post-fix.txt`: byte, CR-count and hash evidence.

Raw logs are gitignored (`*.log`) and remain outside the repository.
