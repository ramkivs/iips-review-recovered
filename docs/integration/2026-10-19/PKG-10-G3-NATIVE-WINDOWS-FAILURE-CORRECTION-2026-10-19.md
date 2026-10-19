# PKG-10 — Gate 3 Native-Windows Failure Correction (2026-10-19)

| Field | Value |
|---|---|
| Packet | PKG-10 (successor record to PKG-09) |
| Date | 2026-10-19 (UTC) |
| Subject | Diagnose and correct the 25 failures from the native-Windows guarded run of the Gate 3 patch: zero-byte IPC responses (11), a named-pipe filesystem-artifact assertion (1), and startup-validation/sqlite lifecycle failures (13) |
| Implementation repository | `ramkivs/iips-production-market-data` (IPD) |
| Target branch | `g3/gate3-node-sqlite-ipc-correction-d30003d` (local only; IPD write remains credential-blocked) |
| Authorized root parent | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` (unchanged; still an ancestor of current IPD `main`) |
| Windows-applied history | `be32d8c` -> `831b202` (Gate 3 Windows tests) -> `6fe8251` (frame contract fix); the Windows run executed 740 tests: 711 pass, 25 fail, 4 skip, exit 1 |
| New Arena local commit | `14e2f5a77ebbcce3ed8984e7e9c91207aa7381a9` (parent `af04df1`; complete correction vs `be32d8c9` = same 23 files, 4729 insertions / 4 deletions) |
| Arena environment | Linux, Node `v22.22.3`, npm `10.9.8`; target user environment remains native Windows, Node `v22.22.0`, npm `10.9.4` |
| Status | All three demonstrated causes corrected; 747 tests, 746 pass, 0 fail, 1 intentional Linux skip; no native-Windows run claimed; preview artifacts checksum-verified; IPD publication still 403 |

---

## 1. Failure classification (25 failures, not a single root cause)

| Class | Count | Classification | Mechanism |
|---|---|---|---|
| A. Zero-byte IPC responses | 11 | Confirmed production defect (af04df1 design vs Windows transport) | Pipe half-close EOF is only delivered by a forced pipe break 50 ms after client shutdown; a response gated on `'end'` is then unwritable |
| B. Named-pipe artifact assertion | 1 | Confirmed Windows-specific test defect | `existsSync('\\\\.\\pipe\\…')` answers from the kernel pipe namespace (true for a live pipe), not from the filesystem |
| C. Startup validation | 13 | Test-isolation/resource-lifecycle defect (1 origin + 12 cascades) | `rmSync` ran before `closeDatabase()`; Windows EBUSY skipped the close and leaked the sqlite singleton, so later tests received a prior test's tampered handle under a new path |

Items not reproducible on Linux are explicitly labeled Windows-only; none of the 25
failures were attributed to the migration ledger, dispatch authorization or the
frame parser, and none of those components were weakened.

## 2. Category A — zero-byte responses: primary-source transport evidence

From Node v22.22.0 `deps/uv/src/win/pipe.c` (libuv 1.51.0, byte-mode pipes
`PIPE_TYPE_BYTE | PIPE_READMODE_BYTE`, no `FILE_WRITE_FINISHED` path):

1. Client `socket.end()` reaches `uv__pipe_shutdown`, whose thread routine is only
   `FlushFileBuffers(handle->handle)` — no EOF is signaled to the server.
2. `uv__process_pipe_shutdown_req` then arms an eof timer
   (`static const int64_t eof_timeout = 50; /* ms */`) because the client stays
   readable awaiting a response.
3. `eof_timer_cb` calls `close_pipe(pipe)`; the server's pending `ReadFile` returns
   `ERROR_BROKEN_PIPE`, mapped by `uv__pipe_read_error_or_eof` to `UV_EOF` — the
   only server-visible `'end'`, arriving on a now-broken pipe.
4. Any server write after that fails (`ERROR_NO_DATA`/EPIPE).

The PKG-09 correction made every response wait for `whenSettled`, which resolves on
that `'end'`. On Windows the response therefore could never be delivered: the exact
11-test symptom (`byteLength 0`, `ERR_BUFFER_OUT_OF_BOUNDS` in `parseResponse`).
On AF_UNIX a FIN is delivered while the writable side stays open, so Linux never
exposed the incompatibility.

Deterministic Linux reproduction (socket fake modeling the libuv event order, run
against the pre-fix build through the real `createConnectionHandler`):
`REPRODUCED: legitimate request receives zero bytes`. Post-fix probe on the same
harness: full 70-byte response frame delivered before the broken-pipe EOF.

## 3. The correction: transport-selected settlement policy

`readSingleFrame` accepts a `FrameSettlementPolicy`:

- `half-close-required` (AF_UNIX; unchanged airtight behavior): the response waits
  for a clean half-close; any later data/error rejects `whenSettled` → zero-byte
  Class P refusal.
- `flush-guard` (Windows named pipe; selected by `startIpcServer` from
  `target.kind === 'windows-named-pipe'`): the response is written immediately
  while the named guard listeners remain attached through the flush.
  `FrameReader.whenGuardTripped` resolves with the Class P fault on any trailing
  byte or transport error; dispatch races `socket.end(frame)` against it and
  destroys the socket (canceling the pending write) if it trips — zero bytes.

Why pipelining still cannot receive a successful response (requirement trace):

1. A reference client that half-closes after one frame cannot transmit further
   bytes; its write side is shut, so under `flush-guard` the guard can only be
   tripped by a prohibited peer that pipelines.
2. Frames already in the pipe when frame 1 parses arrive in the same or an
   immediately following data event before the response write flushes; the guard
   race destroys the connection before acknowledgement, deterministically covered
   by two regressions (immediate second event and mid-write second event).
3. AF_UNIX retains the airtight half-close gate and all PKG-09 regressions.
4. Explicitly documented residual (platform limit, not a protocol change): on a
   pipe, a non-conforming peer that keeps the pipe open and delivers frame 2 only
   after frame 1's response has flushed to the OS cannot be stopped, because no
   pre-break half-close signal exists; it still receives exactly one response and
   frame 2 is never dispatched.

The IRR reference-client contract (write one frame, half-close, read until close)
is unchanged and requires no client modification.

## 4. Category B — pipe-namespace assertion

`fs.existsSync` on a live `\\.\pipe\` name performs a kernel attribute probe of the
flat, non-persistent pipe namespace (Node documentation: pipes "will not persist"
and "are removed when the last reference is closed"). It cannot answer whether an
on-disk artifact exists. The rewritten `windowsOnly` test asserts the actual
invariant:

- `target.kind === 'windows-named-pipe'` and the new
  `isWindowsPipeNamespaceOnly(target)` namespace regex;
- no state directory and no `.sock` file is created on disk for a pipe bind;
- `server.address()` remains a string in the pipe namespace (no `{host, port}`).

No assertion was inverted or skipped; the same corrected predicate replaced the
`existsSync` check in the successful-startup subtest.

## 5. Category C — sqlite lifecycle and cascades

Origin defect: `afterEach` removed every temp tree before calling
`closeDatabase()`. Linux allows unlinking open files; Windows throws EBUSY, the
cleanup aborted, and the process-wide singleton in `persistence/connection.ts`
survived. Because `openDatabase` returned that singleton for ANY requested path,
subsequent tests silently operated on the previous test's database — including the
deliberately tampered migration ledger — producing checksum mismatches and
migrate-vs-connect/bind phase failures. Deterministic Linux reproduction before the
fix:

```
openDatabase(new path) returned the leaked singleton? true
test B outcome: { ok: false, phase: 'migrate',
  error: 'checksum mismatch for migration 001_initial_schema …' }
```

Corrections:

- Test cleanup closes the handle first, then removes trees; removal retries
  EBUSY/EPERM/ENOTEMPTY with a bounded 5 × 10 ms wait and still rethrows after
  exhaustion, so genuine leaks remain visible.
- `openDatabase` now records its path: same-path open stays idempotent; a
  different path while open throws `DatabasePathError`. Post-fix the same
  reproduction fails loudly at the second open instead of contaminating state.
- Migration checksum enforcement, ledger ordering and the validate → connect →
  migrate → verify → bind phase sequence are unchanged and still enforced.

## 6. Files changed (8 of 23 manifest paths; 527 insertions, 46 deletions)

| File | Change |
|---|---|
| `src/ipc/protocol.ts` | `FrameSettlementPolicy`, `ReadFrameOptions`, `whenGuardTripped`, `isGuardIntact`; guard fault recording; reader semantics otherwise unchanged |
| `src/ipc/dispatch.ts` | Handler options; policy-specific settlement; single guarded response writer raced against guard trips; zero-byte fallback for pre-writer throws |
| `src/ipc/entrypoint.ts` | Selects `flush-guard` for pipe targets, `half-close-required` otherwise |
| `src/ipc/endpoint.ts` | `isWindowsPipeNamespaceOnly` predicate |
| `src/persistence/connection.ts` | Path-tracked singleton; distinct-path open refused |
| `tests/g3_ipc_framing.test.ts` | Acknowledgement-aware fake socket with broken-pipe emulation; 6 flush-guard regressions through the real handler |
| `tests/g3_no_network_listener.test.ts` | Rewritten Windows invariant test; policy-aware direct reader handler |
| `tests/g3_startup_validation.test.ts` | Close-first cleanup with lock retry; distinct-path isolation regression; corrected startup assertion |

The other 15 manifest paths are byte-identical to PKG-09; the Windows CI matrix
(`ubuntu-latest` + `windows-latest`, bash shell, Ubuntu-only check-run publish) is
retained unchanged.

## 7. Validation evidence (Arena Linux, exact results)

```
npx tsc --noEmit                         exit 0
rm -rf dist && npm run build             exit 0
npm test (guarded runner)
[test-guard] files=57 (source suite files: 57)
# tests 747  # suites 94  # pass 746  # fail 0
# cancelled 0  # skipped 1  # todo 0
[test-guard] OK — 747 test(s) executed, 746 passed, exit 0
```

Targeted suites: framing 26/26, no-network 10 pass + 1 Linux skip, binding 10/10,
read isolation 6/6, write gate 9/9, startup 20/20, caller authority 103/103,
durability 6/6. Baseline change: 740 → 747 (+7; framing 20 → 26, startup 19 → 20,
suites 93 → 94). No assertion weakened, no test skipped or suppressed.

Red/green: pre-fix behavioral probes reproduced both the zero-byte pipe timeline
and the singleton cascade; the corrected build delivers the full response and
throws on the cross-path open. The new tests use new API surface and cannot compile
against older trees, so red runs use behavioral probes against rebuilt older
sources — a documented limitation, not a skipped check.

## 8. Artifacts, checksums and preview distribution

Served from the Arena preview (`0.0.0.0:8137`; browser host
`https://8137-i5odx2thpcdlqz2zfo10y.e2b.app`):

| File | SHA-256 |
|---|---|
| `g3-windows-correction-14e2f5a.patch` | `f4177e4255e6384bd2686887cc7b580a5da532f95bd8ffa22429752aba3e0348` |
| `g3-windows-manifest-14e2f5a.tar.gz` | `9b5af54f0da22f2e08161f4753ee06294cea1a0f83a0381d1dd01ca53b0256b4` |
| `VERIFICATION.txt` | `3430b862c03865d7cfa66263489b598640350a0d3e5fc8863f06b007bfaa1d8e` |

Integrity: three-commit `git format-patch be32d8c9..14e2f5a` applied with
`git am --whitespace=error` on a pristine `be32d8c9` worktree → exit 0 and
`git diff --quiet 14e2f5a HEAD` byte-identical; tarball per-file diff all 23 paths
identical, `gzip -t` clean; all four downloads re-fetched over HTTP and verified
with `sha256sum -c`; superseded filenames return 404; traversal probes return 404.
The public proxy terminates TLS browser-side, so byte verification ran against the
loopback listener it fronts.

## 9. Publication state (re-verified)

- `git push origin g3/gate3-node-sqlite-ipc-correction-d30003d` → HTTP 403
  "Permission to ramkivs/iips-production-market-data.git denied", exit 128.
- `gh api -X POST repos/.../git/refs` at `14e2f5a` → HTTP 403 "Resource not
  accessible by integration"; branch lookup afterward → 404 (no remote ref).
- No fork, mirror, permission change or unrelated-repo publication; preview
  distribution is not repository publication.

## 10. Boundaries and remaining blockers

- No gate merged or advanced. Gate 4 remains unverified and out of scope:
  DACL/SDDL contents, second-account denial, SMB reachability, collision/clean-
  shutdown lifecycle, real-pipe zero-byte behavior.
- Native-Windows validation of `14e2f5a` still requires a real `windows-latest`
  or native Windows run; the corrected `windowsOnly` tests and retained CI leg are
  the validation path, and no Windows pass is claimed from Linux.
- Standing invariants preserved: W-1 `WRITE_NOT_AUTHORIZED` zero-row-delta
  refusals with no env override; Class P zero-byte semantics; Node <22.13.0
  guard; provisioning pre-Gate-A′ refusal and the no-import-edge regression;
  string-path AF_UNIX/named-pipe binding only (no TCP/HTTP/URL listener).
