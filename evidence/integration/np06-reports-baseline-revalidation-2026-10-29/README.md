# NP-06 Reports — one-pass baseline revalidation (2026-10-29)

Scope: read-only revalidation of the IRR Reports baseline at **IRR `main` `63f70682dac7c14250c807cd82f494773339c976`** (tree `457a810733cb6605cac24e129b43c24557a9cb9f`). Recorded in tracker §16.190 (`CV-CORR-170`, `CHG-2026-10-29-12`). Documentation and evidence only: no runtime, pin, UI, status, acceptance, qualification, or IPD change.

## Environment
- Node `v22.22.3`, npm `10.9.8`, Linux sandbox (`/tmp/irr-main`, detached worktree at `63f70682`; `git status` clean at run time).
- `npm ci` required `NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/e2b-ca.crt` (sandbox TLS interception on the codeload git dependency `8eec74ae…`). Environment workaround only; not a repository defect and not a repository change.

## Files
The step logs are committed as `.txt`: the repository's `.gitignore` excludes `*.log`, and existing evidence folders use `.txt`. The bytes are unchanged; the SHA-256 values in `summary.txt` (computed by `run.sh` on the `.log` names) match these files.

| File | Content |
|---|---|
| `00-npm-ci.txt` | `npm ci` output, `NPM_CI_EXIT=0`, 190 packages |
| `run.sh` | The exact verification script. Its header comment still reads "8292fe1c"; that is stale. The worktree HEAD for this run was `63f70682` (verified by `git rev-parse HEAD`). |
| `01-typecheck.txt` | `npm run typecheck`, exit 0 |
| `02-typecheck-replay-server.txt` | `npm run typecheck:replay-server`, exit 0 |
| `03-reports-focused.txt` | Vitest verbose, 11 files, **171/171 passed** (per file: reports-api 3, owner-carrier 4, owner-resolver 5, restart 2, transport 4, artifact 56, canonical 46, persistence-integration 5, `src/api/reports` 13, `App.test.tsx` 21 (includes non-Reports tests), `Reports.test.tsx` 12) |
| `04-full-suite-test-ci.txt` | `npm run test:ci`, **106 files / 1,350 passed / 0 failed**, exit 0 |
| `05-assert-tests.txt` | `node .ci/assert-tests.js .vitest-report.json`: `OK — 106 test file(s), 1350 test(s), 0 failed`, exit 0 |
| `06-build.txt` | `npm run build`, exit 0, 142 modules, pre-existing chunk-size warning only |
| `summary.txt` | Exit code and SHA-256 of each step log (as written by `run.sh`) |
| `SHA256SUMS.txt` | SHA-256 of every file in this folder (excluding itself) |

## Not committed (hash recorded only)
- `frontend/.vitest-report.json` (generated, 486,871 bytes), SHA-256 `207d15fe143f3d07cd68747e33756e60fcb2679b8c7df0d38e4fe1fdbf67e109`, observed at `63f70682` after step 04.

## Known limits
- The test-count baseline in the acceptance record (§2(3) of the Reports acceptance) says 1,346. Measured this run: 1,350. This is recorded as baseline drift, not as a failure.
- The CV-51 browser qualification (Chromium B-1–B-6, 92 checks) was **not** re-run here. Its committed `browser-results.json` records 0 failures; the qualification MANIFEST states 92 PASS / 0 FAIL. Both are source-recorded.
- No raw F-7-specific test output is committed. The F-7 leg-by-leg mapping is recorded in §16.190.3 of the tracker. Leg 5 ("rejects ambient auth tokens") has no test asserting it and the transport does not read an `Authorization` header; this is recorded as a wording gap in the F-7 record. Nothing here changes F-7's acceptance status.
- Protection/ruleset state and IPD job logs were not verified in this pass.
