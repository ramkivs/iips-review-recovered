# CAP-03 — IPD `8eec74ae…` S2-equivalent sequence, Linux clean-build baseline (2026-10-26)

> **CLASSIFICATION: LINUX REPOSITORY EVIDENCE — NOT NATIVE-WINDOWS HOST QUALIFICATION, NOT `S2`, NOT QE, NOT ACCEPTANCE.**
>
> These logs were produced in a full-history scratch clone of
> `ramkivs/iips-production-market-data` pinned at exactly
> `8eec74ae27cda09f3c368b9c299895eae41554db` (tree
> `4eba29029f8d95cfe483e615a7047426b298ce50`), inside a Linux Debian 12 sandbox
> (`e2b.local`, Node `v22.22.3`). They validate the **command sequence, expected
> outputs, guarded-runner behaviour and deterministic build inventory** that the
> designated operator must reproduce on `desktop-no0nhtp` (native Windows 11,
> non-elevated, operator-supplied Node `>=22.13.0 <23`, flag-free `node:sqlite`).
> Under the effective Gate 4 act and the H-12 R5 adoption act, Linux/CI runs carry
> **zero** Gate 4 operational acceptance or QE credit. No value here may be cited
> as host evidence.

## Files

| File | S2 step mirrored | Exit | Headline measured value |
|---|---|---:|---|
| `01-npm-ci.txt` / `01-npm-ci.exit` | 1. `npm ci --no-audit --no-fund` | 0 | clean locked install (second run: 33 packages; first install populated `node_modules` from `package-lock.json`) |
| `02-tsc-noemit.txt` / `02-tsc-noemit.exit` | 2. `npx tsc --noEmit` | 0 | no output (clean typecheck) |
| `03-build.txt` / `03-build.exit` | 3. `npm run build` | 0 | `tsc && vite build && build:portfolio-ui-package && build:pit-package` all clean |
| `03-dist-file-count.txt` | 3. expected `1,140` `dist/**` files | — | **`1140`** — matches the H-12 R5 bound exactly |
| `04-guarded-npm-test.txt` / `04-guarded-npm-test.exit` | 4. canonical guarded `npm test` (`node scripts/run-tests.mjs`) | 0 | **`[test-guard] OK — 924 test(s) executed, 923 passed, exit 0`**; TAP summary `# pass 923 / # fail 0 / # skipped 1` |
| `05-package-consumer.txt` / `05-package-consumer.exit` | 5. `npm run test:package-consumer` | 0 | **`"result": "PASS"`**; pack `121` files, `239,032` packed bytes, shasum `cc2aa70186b8fd7bc7255452ac8d8b00d094f53e` — identical to the H-12 R5 bound `npm_pack_tarball_shasum_sha1` |
| `06-dist-inventory-byte-verification.txt` | 3. deterministic inventory | — | **`1,140/1,140 BYTE-IDENTICAL`** to bound `runtime_dist_set` (`IIPS-V3-CAP03-G4-H12-R5-AMENDED-S8-SUPPLEMENT-2026-10-25-01`; 0 missing, 0 extra, 0 content mismatch) |
| `07-p1-validator-failclosed-probe.txt` | P-1 harness only (not provisioning) | 1 / 1 | read-only `--mode=validate` on a non-existent store fail-closes (`the validation store file does not exist`, nothing created); `--mode=execute` on Linux refuses `PLATFORM_UNSUPPORTED` before any SQL; zero files/rows created |

## Boundary statements

1. The guarded runner (`scripts/run-tests.mjs`) is the only canonical `npm test`
   path: it discovers compiled counterparts, refuses stale/missing compiled
   tests and zero-test runs, invokes Node's test runner with
   `--test-reporter=tap`, and propagates child exit codes. Direct TAP remains
   supplemental and can never replace this result (Gate 4 act §4.1).
2. The `1,140`-file count and byte identity reproduce the **Linux clean-build
   reproducibility baseline** bound at H-12 R5 adoption
   (`runtime_dist_set.classification = LINUX_CLEAN_BUILD_REPRODUCIBILITY_BASELINE
   — NOT_NATIVE_WINDOWS_QE_CREDIT`). The Windows host must rebuild `dist/**` from
   its own clean checkout and record pre-QE/post-QE SHA-256 inventories (Q11).
3. The P-1 probes exercise refusal paths only. The single bounded provisioning
   execution is unspent, host-gated, and may occur exactly once strictly after
   `S2` passes; nothing here consumes it.
4. Node `v22.22.3` on Linux emits `ExperimentalWarning: SQLite is an experimental
   feature` when loading `node:sqlite` without a flag. The designated host's
   flag-free/warning behaviour is an on-host PF-05 observation and remains
   **UNVERIFIED ON HOST**.
