# PKG-07 — Gate 3 IPD Windows-Validation Failure Investigation and Cross-Platform Correction (2026-10-19)

| Field | Value |
|---|---|
| Packet | PKG-07 |
| Date | 2026-10-19 (UTC) |
| Subject | The 10 failures from the Windows validation of the Gate 3 IPD implementation (`g3/gate3-node-sqlite-ipc-implementation`, local commit `493c8ac8…`): root causes, corrected implementation, regression coverage |
| Implementation repository | `ramkivs/iips-production-market-data` (IPD) |
| Authorized base | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` (IPD `main`, unchanged) |
| Correction branch | `arena/ddcb69ba-g3-ipc-cross-platform-corrections` (IPD) |
| Governing authority | `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` (the "Gate 3 act") |
| Governing contracts | Consumer contract v1.0.0; Gate E write policy rev 1; L-IPC-1 rev 2 (facts F1…F7, clauses C1…C12) |
| Arena environment | Linux, Node `v22.22.3`, npm `10.9.8` |
| Status | **Implementation corrected and green in Arena (Linux). Windows host acceptance remains Gate 4; no Windows result is fabricated or claimed.** |

---

## 1. Evidence basis and provenance

The Windows validation branch and commit `493c8ac8db255606d7f573c1fd8931fc24581b4a`
exist only on the operator's Windows checkout. They are **not present on the IPD
remote** (verified: `gh api` returns 404 for the branch and 422 for the commit SHA;
the remote IPD `main` is at the authorized base `be32d8c9`, which contains zero
Gate 3 code — no `src/ipc`, no `src/persistence`, no `tests/g3_*`). Per the task's
execution boundary, the Windows checkout, PowerShell session and local runtime were
not accessed.

The correction therefore rests on three independently available evidence classes:

1. **Recorded failure evidence** — the ten concrete failures with their observed
   values, treated as fact (e.g. test 69 observed `windows-named-pipe`; test 112
   observed `ENOENT` at `\\.\pipe\iips-ipd-user-portfolio-v1`; test 118 observed no
   exception).
2. **The frozen Gate 3 manifest** — the act's §4.2 fourteen-file implementation set
   and §4.3 eight-file test set, with exact per-file obligations.
3. **Accepted contracts and the IRR reference client** — L-IPC-1 rev 2 (including
   source-verified Windows facts F1…F7), consumer contract v1, Gate E, and the
   already platform-aware IRR `frontend/server/user-portfolio/ipcClient.ts`.

The corrected IPD code is an **authority-manifest reconstruction on the authorized
base**, not a diff against the unavailable `493c8ac`. Where the recorded failures
show the Windows implementation behaving per the platform contract (e.g. selecting a
named pipe), the tests were corrected; where they show a missing control (test 118)
or an unsafe behavior discovered during reconstruction (unsafe-directory repair),
the implementation was corrected. No expected security outcome was weakened to make
a test pass.

---

## 2. The ten failures: exact root causes

### 2.1 `g3_ipc_framing.test.ts`

| # | Recorded failure | Root cause | Class | Correction |
|---|---|---|---|---|
| 69 | Test expects endpoint kind `unix-socket`; implementation reports `windows-named-pipe` | The test hard-coded the POSIX endpoint family. On Windows Node has no AF_UNIX (L-IPC-1 F1); selecting a named pipe is the **correct** platform behavior. The implementation was right; the assertion was Unix-only. | Unix-only test assumption | Platform-aware assertion: `unix-socket` on POSIX, `windows-named-pipe` on win32, exercised through an injected `platform` seam so both branches run in Linux CI. |
| 75 | Test assumes the endpoint is a filesystem socket under the operator-local state directory | A Windows named pipe lives in the kernel pipe namespace (`\\.\pipe\…`), not on the filesystem; no directory entry is or can be created there. | Unix-only test assumption | POSIX asserts `<stateDir>/<name>.sock` exists as a socket; win32 asserts `\\.\pipe\<name>` and that no filesystem artifact is implied by the endpoint. |

### 2.2 `g3_no_network_listener.test.ts`

| # | Recorded failure | Root cause | Class | Correction |
|---|---|---|---|---|
| 77 | Unix-specific endpoint expectation | Same family as failure 69: the kind/path were asserted as POSIX-only. | Unix-only test assumption | Derive kind and path from the target platform; cover both with the injection seam. |
| 81 | POSIX permission-mode assertions applied to the Windows endpoint | `chmod`/stat mode bits do not express Windows pipe access. libuv binds with `lpSecurityAttributes = NULL` (F2), so the **default** pipe DACL applies (F3) and the application cannot narrow it; the only Node knob (`readableAll`/`writableAll`) widens access (F6). Treating POSIX mode checks as Windows proof would be a false security claim. | Invalid cross-platform proof | POSIX: real `0700` state-directory and `0600` socket verification by `stat`, owner-uid checked. Windows: an honest descriptor (`enforcedByApplication: false`, `platform-default-named-pipe-DACL`) listing the controls the app **does** enforce and the DACL/cross-account/remote items that remain Gate 4 V-E. A regression also asserts the bind code never passes `readableAll`/`writableAll` or a numeric port. |
| 82 | Windows named-pipe path assumptions | The expected path shape/namespace was not asserted against the actual contract form. | Test assumption | Exact assertion that the Windows target is `\\.\pipe\iips-ipd-user-portfolio-v1`, that absolute non-pipe Windows paths are refused, and that bind targets that path. |
| 83 | No-TCP-listener invariant under Windows assumptions | The invariant itself is platform-independent and must be preserved and verified on both platforms. | Test hardening | `server.address()` must be a string equal to the IPC path (never an `{address, port}` object); source-level guarantee of path-only `listen`; an HTTP request line receives zero bytes (raw socket, not HTTP); second simultaneous connection is capped and closed. No TCP/HTTP/URL listener is created on either platform. |

### 2.3 `g3_startup_validation.test.ts`

| # | Recorded failure | Root cause | Class | Correction |
|---|---|---|---|---|
| 112 | Creating a regular file at `\\.\pipe\iips-ipd-user-portfolio-v1` fails `ENOENT` | `\\.\pipe\…` is not a filesystem location, so "create a regular file there" is meaningless; the real Windows collision mechanism is an occupied **named pipe**, which libuv fails as `EADDRINUSE` via `FILE_FLAG_FIRST_PIPE_INSTANCE` (F7). | Test defect (wrong collision mechanism) | POSIX regression: a pre-existing entry at the socket path fails startup with `EndpointCollisionError`. Windows regression: an injected server reproducing the F7 `EADDRINUSE` bind error maps to `EndpointCollisionError`, and the bind is observed to target the exact pipe path. Host-level pipe collision remains Gate 4 V-E (V-4 was PA-waived and stays technically unverified). |
| 113 | Expects an exception for an unsafe endpoint directory | During reconstruction a **genuine implementation defect** was found and fixed: an initial design "repaired" an existing unsafe directory by `chmod`-ing it instead of refusing. Startup must not silently change operator filesystem permissions. | Implementation defect (and POSIX-only semantics) | A pre-existing state directory is validated and refused when not owner-owned or not mode `0700` (`UnsafeEndpointDirectoryError`, no endpoint, exit 1); only a directory the process creates is set `0700`. Windows has no endpoint directory, so the equivalent guarantees are pipe-namespace validation, fail-closed collision, and the explicitly documented DACL boundary — POSIX mode semantics are never claimed for Windows. |
| 115 | Expects a Unix socket while the Windows runtime selects a named pipe | Same platform-family assumption as 69. | Unix-only test assumption | Platform-derived family assertion; a family/platform mismatch (e.g. a Unix path on win32 or a pipe path on POSIX) is itself a startup configuration error. |
| 118 | Expects `ProvisioningNotAuthorizedError`, but no exception is thrown | **Genuine implementation defect:** the bounded provisioning code lacked an executable Gate A′ authorization guard, so a mutating call could run without the unexecuted provisioning act. Gate A′ is `APPROVED / NOT EXECUTED`; the act requires the module to expose no executable entrypoint and be unreachable from IPC and startup. | Implementation defect | Every mutating provisioning entrypoint now requires a `GateAPrimeAuthorization` carrying a **module-private symbol brand** that no in-repository code can mint; missing or forged authorization throws `ProvisioningNotAuthorizedError` **before any SQL**, with zero store effect (row counts unchanged). The pure statement builder and read-only inspector remain executable so the included code is testable without opening the path. A static regression asserts no import edge from `entrypoint.ts` or `dispatch.ts` to the provisioning module. |

### 2.4 Defect summary

- **Genuine implementation defects (2):** missing provisioning authorization guard (118); unsafe-directory repair instead of refusal (found while correcting 113).
- **Test defects / Unix-only assumptions (8):** 69, 75, 77, 81, 82, 83, 112, 115. The platform selections they rejected were predominantly correct; the tests assumed POSIX semantics on a Windows runtime.

---

## 3. Windows access-control semantics — what is and is not verified

Per L-IPC-1 §4.2 and the accepted security contract, the corrected code makes
**no false Windows security claim**:

**Enforced by the application on both platforms (CI-verified on Linux; logic is
platform-injected and host-verification of the pipe remains Gate 4):**

- same-host endpoint only; no TCP, HTTP or URL listener (C1, T-F);
- zero bytes before a valid, authorized request — no banner/greeting (C5.1);
- fail-closed name collision on both platforms (F7 on Windows; socket-path
  pre-existence on POSIX);
- single concurrent connection cap (C5.4) and 64 KiB/256 KiB frame caps;
- `readableAll`/`writableAll` are never used (F6 — they only widen access);
- Windows pipe targets are confined to the `\\.\pipe\` namespace;
- caller authority, tenant and canonical-identity keys refused at any depth (C7);
- binding resolved per request, no cache, re-validated in the write transaction.

**Cannot be verified by application code or Linux CI — documented, not assumed
(Gate 4 V-E on `desktop-no0nhtp`):**

- effective named-pipe DACL/SDDL contents (V-1; the V-P measurement was PA-waived
  and remains technically unverified — the default DACL per F3 grants full control
  to SYSTEM/Administrators/creator owner and read to Everyone/anonymous);
- second-account write denial (V-3, PA-waived);
- remote/SMB reachability (V-2, PA-waived; host inbound sharing configuration);
- clean-shutdown pipe disappearance and host collision lifecycle (V-4, PA-waived).

POSIX endpoint security is application-enforced and verified in CI by `stat`:
owner-only `0700` state directory and `0600` socket, both owned by the running uid
(L-IPC-1 E2/E3). These checks are structurally absent from the Windows descriptor
rather than imitated.

---

## 4. Files changed and rationale

### 4.1 IPD — exactly the Gate 3 act §4.2/§4.3 manifest (additive only; zero existing files modified)

**`src/ipc/` (4 files)**

| File | Rationale |
|---|---|
| `protocol.ts` | Frame codec (uint32 BE + UTF-8 JSON), 64/256 KiB caps, closed envelope/operation sets, C7 deep key scan, Class P error + bounded local diagnostic sink, pipelined-frame refusal. |
| `endpoint.ts` | Platform-aware target resolution (identical rules to the IRR client), POSIX `0700`/`0600` creation and verification with unsafe-directory refusal, Windows pipe namespace handling with the honest DACL descriptor, collision fail-closed, connection cap, path-only listen, no-TCP assertion. |
| `dispatch.ts` | Per-connection framing, Class P zero-byte/close handling, per-request binding resolution, closed read/write routing, `WRITE_NOT_AUTHORIZED` before any store mutation, reserved/unknown op refusal. Never imports the provisioning module. |
| `entrypoint.ts` | `validate → connect → migrate → verify → bind`; any fault returns a bounded phase-coded non-zero outcome with no endpoint bound; no fallback/retry/downgrade; never imports the provisioning module. |

**`src/persistence/` (10 files)**

| File | Rationale |
|---|---|
| `connection.ts` | `node:sqlite` only; Node `< 22.13.0` runtime guard that fails before any file is opened; absolute operator-local path; `foreign_keys=ON`, `journal_mode=DELETE`, `synchronous=FULL`; one connection per process. |
| `migration_ledger.ts` | Append-only SHA-256-checksummed ledger; unknown/tampered/out-of-order migrations refuse startup; pending migrations apply inside a transaction. |
| `migrations/001_initial_schema.ts` | Fixed `portfolios`, `portfolio_revisions`, `portfolio_holdings`, `portfolio_contributions` tables. |
| `migrations/002_audit_event_sequence.ts` | A-3 local, checksummed audit sequence; no cross-system sink. |
| `migrations/003_local_principal_bindings.ts` | A-2 `local_principal_bindings` + memberships with partial-unique single-`ACTIVE` indexes. |
| `portfolio_store.ts` | Owner-scoped durable operations; one `BEGIN IMMEDIATE` transaction = at most one immutable revision; tombstone delete; content-idempotency; missing ≡ foreign ≡ tombstoned. |
| `binding.ts` | Per-request ACTIVE binding/membership resolution with no cache and in-transaction re-validation (W-3). |
| `audit.ts` | Local audit-line writer used for lifecycle events; checksummed. |
| `provisioning.ts` | Library-only Gate A′ code with the private-brand authorization guard (fix for 118); pure builder + read-only inspector; no entrypoint, no IPC reachability. |
| `durablePortfolioStorePort.ts` | Additive `PortfolioStorePort` adapter reusing `findCallerSuppliedIdentityKeys`, `evaluatePortSaveGuard`, `computeLineageHash`; honest `DURABLE`/`true`; writes refused while W-1 is unmet. |

**`tests/` (8 files)** — the exact act §4.3 set: `g3_ipc_framing`,
`g3_caller_authority`, `g3_binding_resolution`, `g3_portfolio_read_isolation`,
`g3_startup_validation`, `g3_no_network_listener`, `g3_write_gate`,
`g3_durability_vocabulary`. Each genuine defect carries a named regression:
platform-family and pipe-namespace assertions (69/75/77/82/115), POSIX mode and
Windows descriptor honesty (81/113), real collision semantics per endpoint type
(112), no-TCP/raw-socket/capacity proofs (83), and provisioning authorization with
zero store effect plus the import-edge static check (118). All artifacts are created
under the OS temporary directory; nothing is written in the worktree.

`package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts` and
`.github/workflows/ci.yml` are byte-stable; no dependency is added (`node:sqlite` is
a built-in).

### 4.2 IRR

No IRR source, fence, contract or configuration file is changed by this correction.
The IRR IPC client already implements the same platform-aware resolution; a direct
cross-repository check confirms both resolvers derive identical targets and agree on
every refusal for the same inputs on both platforms. This packet is the only IRR
addition (documentation).

---

## 5. Validation evidence (Arena Linux — Gate 3 CI evidence, not Gate 4 qualification)

### 5.1 IPD (`ramkivs/iips-production-market-data`, correction branch)

Commands are the act §4.5 CI chain, run at the correction commit:

| Command | Result |
|---|---|
| `npm ci --no-audit --no-fund` | exit 0, locked install |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` (`tsc && vite build`) | exit 0 |
| `npm test` (guarded runner) | **files=57 (source suite files: 57); `# tests 705`, `# pass 705`, `# fail 0`; `[test-guard] OK — 705 test(s) executed, 705 passed, exit 0`** |

Composition: 49 pre-existing suite files / 556 tests at the authorized base, plus
8 Gate 3 suite files / 149 tests. The runner's zero-test, missing-artifact and
stale-build guards all remain in force.

### 5.2 IRR (regression check; no source changes)

| Command | Result |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run test:ci` | 77 test files, **935 tests, 935 passed, 0 failed** |
| `node .ci/assert-tests.js .vitest-report.json` | `OK — 77 test file(s), 935 test(s), 0 failed` |
| `npm run build` | exit 0 |

Install note: the sandbox TLS interception blocks `codeload.github.com` for the
pinned GitHub dependency (the act §2.4 records the same condition); the install was
performed with `--strict-ssl=false` as a local npm setting. No repository file was
modified, and the GitHub CI run on the locked manifest remains the authoritative
install evidence.

### 5.3 Cross-repository resolver conformance

For identical `IIPS_G2_IPC_ENDPOINT` / `IIPS_G3_LOCAL_STATE_DIR` inputs, the IRR
client resolver and the IPD endpoint resolver return identical `kind` and `path` on
both `linux` and `win32`, and both throw for URL, `host:port` and relative inputs.

---

## 6. Invariants preserved

- **No TCP/HTTP/URL listener** is created by the IPD process on any platform; the
  endpoint is an AF_UNIX socket (POSIX) or named pipe (Windows) only.
- **All writes remain refused.** Gate E W-1(3) (Gate 4 qualification accepted) and
  W-1(4) (Gate 5 admission) are false; every `portfolio.create/save/reset/delete`
  returns `WRITE_NOT_AUTHORIZED` with zero row delta, and no environment flag can
  enable a write.
- **Provisioning stays unexecuted.** Gate A′ code is included but uncallable
  without a separately issued authorization that the repository cannot mint.
- **Class P non-disclosure** is uniform: zero bytes and connection close, with
  reasons confined to the bounded local diagnostic sink.
- **Linux/POSIX behavior and the full pre-existing IPD and IRR suites are green**
  (705/705 and 935/935); the 503 fence, DP-2 Option 2F, `SESSION_ONLY`/`durable:false`
  and all byte-stable files are untouched.
- Migrations are append-only and checksum-verified; tampering or an unknown
  migration prevents startup and creates no endpoint.

## 7. Remaining platform-specific unverified behavior

Nothing here constitutes Windows host evidence. The following remain Gate 4 V-E
items on `desktop-no0nhtp` and are recorded rather than claimed: effective pipe
DACL/SDDL (V-1), second-account access (V-3), remote/SMB reachability (V-2),
clean-shutdown/collision lifecycle on a real pipe (V-4), C5.1 zero-byte behavior on
the host (Q9), crash atomicity (QE-7), restart durability (QE-4) and revocation
after restart (QE-8). The injected-seam Windows tests in CI exercise the platform
branch logic, not the Windows kernel behavior.

## 8. Boundaries observed

This packet and the IPD correction do not merge or advance Gate 3 acceptance, do
not execute Gate A′, do not authorize Gate 4/Gate C or Gate 5, do not lift the IRR
503 fence, do not enable production writes, and do not promote any off-main
reference. Production remains `NON_PRODUCTION` and not authorized.
