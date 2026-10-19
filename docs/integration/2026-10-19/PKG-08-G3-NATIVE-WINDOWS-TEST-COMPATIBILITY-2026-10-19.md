# PKG-08 — Gate 3 IPD Native-Windows Test Compatibility Correction (2026-10-19)

| Field | Value |
|---|---|
| Packet | PKG-08 (successor record to PKG-07) |
| Date | 2026-10-19 (UTC) |
| Subject | Diagnose and correct the Gate 3 test failures reported on native Windows (Node v22.22.0, npm 10.9.4): repeated `IIPS_G3_LOCAL_STATE_DIR must be absolute` and wrong startup-phase assertions |
| Implementation repository | `ramkivs/iips-production-market-data` (IPD) |
| Target branch | `g3/gate3-node-sqlite-ipc-correction-d30003d` |
| Operator candidate | `d5e9c59bc6f0c81ad371154ccbf8e3adfd4bd895` — **not present on the remote** (branch 404, commit 422 via `gh api`); exists only on the Windows checkout, which is out of reach |
| Authorized parent | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` (unchanged) |
| Arena local commit | `1477bd3` on `g3/gate3-node-sqlite-ipc-correction-d30003d` (parent `be32d8c9`) |
| Arena environment | Linux, Node `v22.22.3`, npm `10.9.8` |
| Status | Corrected and green in Arena Linux; native Windows execution remains to be run on the user host / the new `windows-latest` CI leg; no Windows result is fabricated |

---

## 1. Confirmed root causes (evidence-backed)

### 1.1 Platform/path mismatch in the live-socket suites — primary cause

`g3_ipc_framing`, `g3_no_network_listener`, `g3_portfolio_read_isolation` and
`g3_binding_resolution` (and, by the same pattern, `g3_caller_authority`,
`g3_write_gate`, `g3_startup_validation`, `g3_durability_vocabulary`) built
temporary paths with Node's **platform-native** `join(tmpdir(), …)` while passing
the platform argument `'linux'` to `resolveEndpointTarget`. On native Windows:

- `join()` yields a `C:\Users\…\Temp\…` path;
- the resolver, instructed to simulate Linux, validates it with
  `posixPath.isAbsolute(...)`, which is false for a drive-letter path;
- it therefore throws `EndpointConfigurationError: IIPS_G3_LOCAL_STATE_DIR must be
  absolute` at the **validate** phase, so startup tests expecting a later phase
  (migrate/verify/bind) reported the wrong phase.

This is a test-side platform/path alignment defect. It is **not** caused by an
unset user environment variable: the same deterministic failure occurs whenever
Windows-native paths are paired with POSIX validation, and a direct simulation in
Arena reproduces and then clears it (§4.3).

### 1.2 POSIX-only assertions embedded in cross-platform suites

`g3_no_network_listener` asserted `stat` mode `0700`/`0600` and `uid`
ownership — semantics that do not exist on Windows, where `chmod` is largely a
no-op and `process.getuid` is undefined. On a Windows host these assertions cannot
pass even when the endpoint is a correctly bound named pipe.

### 1.3 Off-host Windows pipe binding could create a misnamed POSIX socket

A Windows-style target (`\\.\pipe\name`) is a legal literal filename on Linux.
Binding it there would silently create an ordinary AF_UNIX socket with a
backslash name (demonstrated and cleaned up during investigation). The corrected
`listenIpc` refuses to bind a `win32` target on a non-Windows host except through
the injected test server, so simulated Windows tests can never create stray
filesystem sockets.

### 1.4 No native Windows CI leg existed

The workflow ran only on `ubuntu-latest`, so Windows-incompatible tests merged
without any signal.

## 2. Remaining hypotheses (not confirmable from Arena)

- Whether `server.maxConnections = 1` and zero-byte close behavior on a real
  Windows named pipe match the POSIX observations (C5.4/C5.1, Q9) — the logic is
  shared libuv code, but host evidence is Gate 4.
- Effective pipe DACL/SDDL, second-account denial, SMB reachability and
  clean-shutdown collision lifecycle (V-1…V-4, PA-waived) — unchanged status.
- Whether the operator's `d5e9c59` differs textually from this reconstruction:
  unpullable, so no diff can be produced. The manifest obligations it must
  satisfy are the same authority act §4.2/§4.3 set.
- `node:sqlite` behavior on the exact Windows patch level of Node 22.22.0 — the
  runtime guard (≥ 22.13.0) passes by version; functional host evidence is Gate 4.

## 3. Exact files changed and why

23 paths: the 22 Gate 3 manifest files (additive) plus one scoped CI change.

| Path | Change and rationale |
|---|---|
| `tests/g3_ipc_framing.test.ts` | Host-adaptive endpoint (`HOST_PLATFORM` derived from `process.platform`); native `join()` paired with the host platform; pipe/socket family assertions split by host; all framing invariants remain platform-independent. |
| `tests/g3_no_network_listener.test.ts` | Same host adaptation; 0700/0600/uid checks become `posixOnly`; new `windowsOnly` named-pipe namespace + no-filesystem-artifact checks; pure resolver tests keep both simulated platforms with synthetic absolute paths. |
| `tests/g3_caller_authority.test.ts` | Host-adaptive live endpoint; 103 C7/OC-7 refusal cases unchanged in substance and row-count proofs. |
| `tests/g3_binding_resolution.test.ts` | Host-adaptive; binding/membership failure classes, partial-unique-index proofs, no-cache re-resolution and audit-chain checks unchanged. |
| `tests/g3_portfolio_read_isolation.test.ts` | Host-adaptive; byte-identical `RESOURCE_UNAVAILABLE` frames and reserved-op refusal unchanged; requests sequential (C5.4). |
| `tests/g3_startup_validation.test.ts` | Native paths + host platform; occupied-socket and unsafe-dir cases are `posixOnly`; Windows gets F7 `EADDRINUSE` seam collision plus a proof that the pipe branch reaches bind without creating/requiring a state directory; #118 provisioning guard and import-edge regressions retained. |
| `tests/g3_write_gate.test.ts` | Host-adaptive; W-1 zero-row-delta refusals, env-flag impossibility, revision lifecycle/conflict/idempotency/tombstone semantics unchanged. |
| `tests/g3_durability_vocabulary.test.ts` | Native temp paths; `SESSION_ONLY`/`DURABLE` honesty and lineage retention unchanged. |
| `src/ipc/endpoint.ts` | New guard: a `win32` target cannot be bound on a non-Windows host without the injected test server (§1.3). All prior POSIX hardening retained. |
| `src/ipc/entrypoint.ts` | Bind-phase failure outcomes now carry the resolved target, so collision/configuration diagnostics report the intended endpoint. |
| `src/persistence/*` (10 files) and remaining `src/ipc/*` | Same manifest implementations as PKG-07 §10 (node:sqlite boundary, checksum ledger, three fixed migrations, binding resolution, hash-chained audit, library-only provisioning with the private-brand guard, durable store/port, protocol, dispatch); no POSIX-only call exists in the persistence layer. |
| `.github/workflows/ci.yml` | OS matrix `[ubuntu-latest, windows-latest]`, `fail-fast: false`, job-level `shell: bash` (Git Bash on Windows) so the npm/tee invocation is identical; the API check-run is published from the Ubuntu leg only to avoid duplicate check names. |

No other existing file was modified; `package.json`, lockfile, `tsconfig.json`,
`vite.config.ts` and the runner are byte-stable. No dependency was added.

## 4. Validation evidence (Arena Linux)

### 4.1 Exact commands and results

| Command | Result |
|---|---|
| `npm ci --no-audit --no-fund` | exit 0 |
| `npx tsc --noEmit` | exit 0 |
| `rm -rf dist && npm run build` | exit 0 (clean rebuild) |
| `npm test` (guarded runner) | `[test-guard] files=57 (source suite files: 57)`; **# tests 732, # pass 731, # fail 0, # skipped 1**, exit 0 |

The single skip is the Windows-only named-pipe artifact check on a Linux host —
intentional platform gating, not a suppressed failure. Baseline: 556 tests / 49
suites unchanged and green; new g3 coverage: 176 tests (175 pass + 1 skip).

Per-suite g3 counts: framing 12; no_network_listener 11 (10 pass + 1 skip);
caller_authority 103; binding_resolution 10; portfolio_read_isolation 6;
startup_validation 19; write_gate 9; durability_vocabulary 6.

### 4.2 Cross-repository resolver parity

The IPD resolver and the IRR `ipcClient.resolveIpcEndpoint` were executed side by
side: 4/4 endpoint strings byte-identical (POSIX socket, Windows bare-name pipe,
explicit `\\.\pipe\` path, absolute POSIX path) and 6/6 refusals agree
(`tcp://`, `host:port`, relative paths on both platforms), including the exact
Windows `C:\Users\…\Temp\…` state-dir shape from the failure report.

### 4.3 Windows-path simulation on the Linux host

- `C:\…\state` + platform `win32` resolves to `\\.\pipe\iips-ipd-user-portfolio-v1`
  with no "must be absolute" error;
- the same path + platform `linux` is still refused with that error, proving the
  absoluteness rule was not weakened — only platform/path alignment was fixed;
- a `win32` startup with a real native DB path passes
  validate→connect→migrate→verify and stops at bind on the non-Windows host
  without creating any filesystem socket;
- a fresh `be32d8c9` worktree accepts the exported patch via `git am` and
  reproduces the 23-file diff (3,910 insertions, 4 deletions, all in ci.yml).

## 5. Windows-specific coverage and its honest limits

The corrected suite gives native Windows meaningful, non-suppressed coverage:
host-native named-pipe binding through the same `listenIpc` path used in
production; pipe namespace and no-filesystem-artifact assertions; F7 collision
mapping via seam on every host; platform-independent zero-byte/HTTP/capacity
proofs; and full persistence/protocol/auth coverage using only portable SQL and
`node:fs` calls. It does **not** establish DACL contents, cross-account
denial, SMB reachability, host collision lifecycle or C5.1/Q9 zero bytes on a
real pipe. Those remain Gate 4 V-E items. No native Windows test run is claimed;
the `windows-latest` CI leg is the mechanism that will produce it once the branch
is published with write credentials.

## 6. Publication state and blockers

- IPD push remains blocked by the sandbox credential: `git push` → `403 Permission
  denied to ramkivs`; `POST /repos/.../git/refs` → `403 Resource not accessible
  by integration`. The account's repo role includes push, but the issued token
  does not. No PR could be opened remotely by Arena; no fork or mirror was created.
- The authoritative correction is distributed out-of-band through the Arena
  preview server (patch + tarball + verification file + checksums). Application:
  `git checkout -b g3/gate3-node-sqlite-ipc-correction-d30003d be32d8c9… &&
  git am g3-windows-correction-1477bd3.patch && git push -u origin <branch>`.
- This packet is published on the IRR branch where write access exists.

## 7. Boundaries observed

No merge, Gate 3 acceptance advancement, Gate A′ execution, Gate 4/C/5 action,
503-fence lift or production write was performed or authorized. Production
remains `NON_PRODUCTION`. The CI matrix is test infrastructure only; it opens no
product network surface and changes no application behavior.
