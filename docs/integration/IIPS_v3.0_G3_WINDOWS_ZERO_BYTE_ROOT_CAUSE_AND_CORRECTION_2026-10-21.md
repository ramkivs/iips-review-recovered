# IIPS v3.0 — Gate 3: Native-Windows Zero-Byte IPC Failure — Root Cause and Correction

**Date:** 2026-10-21 (UTC). **Author:** Arena Agent. **Session branch:** `arena/17d363e9-iips-review-recovered`.
**Gate 3 status: BLOCKED / NOT ACCEPTED.** Native-Windows acceptance has not been performed.

**Boundary statement.** Arena has not inspected the Windows filesystem. Windows-side hashes, byte
sizes, backup comparisons and source markers are taken from the operator's report. Repository
evidence comes from `ramkivs/iips-production-market-data`; the correction was developed and verified
on a Linux sandbox against the declared base `3eb13ed`.

---

## 1. Root-cause conclusion

**CONFIRMED — the failure is deterministic connection-slot exhaustion, not a timing race.**

The failing assertion is not caused by `maxConnections` *"temporarily"* considering the server full.
It is caused by the server never releasing the connection at all. Two facts establish this:

**Fact 1 — Node releases a connection slot only on socket destruction.**
`lib/net.js` (v22.x), `Socket._destroy`:

```js
if (this._server) {
  debug('has server');
  this._server._connections--;
  if (this._server._emitCloseIfDrained) this._server._emitCloseIfDrained();
}
```

There is no other decrement path. Half-closing, `end()`, `FIN`, or a peer disconnect do **not** free
the slot — only `destroy()`/`_destroy` does.

**Fact 2 — the capacity check runs before the connection is handed to the handler.**
`lib/net.js`, `onconnection`, in this order:

```js
if (self.maxConnections != null && self._connections >= self.maxConnections) {
  ... self.emit('drop', data); clientHandle.close(); return;   // ← returns here
}
const socket = new Socket({ handle: clientHandle, allowHalfOpen: self.allowHalfOpen, ... });
...
self._connections++;
socket.server = self; socket._server = self;
self.emit('connection', socket);
```

`listenIpc` sets `server.maxConnections = options.maxConnections ?? 1` (C5.4 capacity 1). So the
**second and every subsequent connection is closed by the runtime before the `'connection'` event is
ever emitted** — the application handler is never invoked, nothing is read, nothing is written, and
the peer observes a closed socket with **zero bytes**. This exactly matches the reported assertion
failure (`response.byteLength > 0` → received 0) with normal process exit in ~400 ms and no timeout.

### Controlled experiment (run in this iteration)

A purpose-built harness modelled the flush-guard path: `maxConnections = 1`, `allowHalfOpen: true`,
one framed response per connection, client helper identical in shape to the current Windows helper.
Node v22.22.3, AF_UNIX.

| Scenario | Server action after writing the response | Client results | Accepted | `drop` events |
|---|---|---|---|---|
| A | leaves the socket open, no close | 15, **0, 0, 0** bytes | 1 | 3 |
| B | same, **150 ms gap** between clients | 15, **0, 0, 0** bytes | 1 | 3 |
| C | same, but data listener kept (watchdog shape) | 15, **0, 0, 0** bytes | 1 | 3 |
| D | **`destroy()` after the write flushes** | **15, 15, 15, 15** bytes | 4 | 0 |
| E | `end()` (half-close), no destroy, AF_UNIX | 15, 15, 15, 15 bytes | 4 | 0 |

Scenario **B** refutes the "asynchronous close accounting" hypothesis directly: waiting 150 ms does
not help, because the slot is never released at all. Scenario **A** also shows the dependency is
permanent for the lifetime of the server — not transient, not a race.

Scenario **E** is the important qualifier: on **AF_UNIX**, `socket.end()` really does close the
socket, so the slot is freed. That is why this defect is invisible on Linux.

### Reproduced end-to-end on the real product code

`createConnectionHandler` was driven with `settlement: 'flush-guard'` (the Windows named-pipe policy)
forced onto an AF_UNIX endpoint, using a real `listenIpc` server and the real dispatch path:

* With the flush-guard path writing via `socket.write()` and never closing (the shape described for
  the Windows-local `dispatch.ts`):

  ```
  request #1: bytes= 70  resolved_by=timeout     ← response delivered, connection never closed
  request #2: bytes=  0  resolved_by=error
  request #3: bytes=  0  resolved_by=error
  request #4: bytes=  0  resolved_by=error
  ```

* With the correction applied: `70, 70, 70, 70`, each `resolved_by=close`.

Note request #1 resolving by **timeout** rather than `close`: this is the same "no EOF is delivered"
symptom recorded in the Stage-2 report, and it is a direct consequence of the handle never closing.

### Why the whole file fails but the isolated test passes — confirmed from test ordering

`tests/g3_binding_resolution.test.ts` starts **one** server in `before()` and shares it across all
ten `it()` blocks. The call sequence is:

| # | Test | IPC call | Expects | Windows outcome |
|---|---|---|---|---|
| 5 | `re-resolves per request with no cache` | **yes — first call** | `> 0` bytes | **passes**, and leaks the slot here |
| 5 | (same test, second call) | yes | `0` bytes | passes — *for the wrong reason* |
| 6 | `an absent binding over IPC` | yes | `0` bytes | passes — *for the wrong reason* |
| 7 | **`restoring an ACTIVE binding makes the next IPC request succeed again`** | yes | `> 0` bytes | **FAILS — 0 bytes** |
| 8–10 | (no IPC) | — | — | pass |

That is **9 passes, 1 failure, and precisely the reported failing test**. With
`--test-name-pattern`, tests 5 and 6 never run, so the server has zero prior connections and the
first connection is accepted — **1/1 pass**, exactly as observed. The reported asymmetry is fully
explained; no race is required.

**Secondary finding (test integrity).** Tests 5(b), 6 and others that assert `byteLength === 0` were
passing *because the connection was dropped by capacity*, not because the Class P refusal path ran.
On Windows the suite was silently masking the defect: a zero-byte expectation cannot distinguish
"refused by policy" from "never connected".

### What remains inferred (not demonstrated here)

Which exact statement leaves the handle open on Windows is inferred, because Arena cannot execute a
Windows named pipe:

* **`src/ipc/dispatch.ts` writes the flush-guard response with `writeFrame()` (`socket.write`) and
  never closes** — per the operator's §6.2 marker listing. `write()` alone is guaranteed to leak on
  **every** platform; this is high confidence.
* **The base `3eb13ed` uses `endFrame()` (`socket.end(frame)`)**, which on libuv/Windows is
  `FlushFileBuffers` — `uv__pipe_shutdown` in `libuv/src/win/pipe.c` performs a flush and returns
  success; there is no half-close primitive on a byte-mode pipe. Windows discards a pipe instance
  only on `CloseHandle`. So `end()` is also expected to leave the handle open on Windows, which
  would mean the defect predates the Windows-local edit.

Both paths are fixed by the same correction, so the choice between them does not block the fix. The
native run will settle it: if the corrected build passes 10/10 on Windows, both are closed; if the
pre-correction build also leaked with `end()`, the defect is confirmed as pre-existing.

---

## 2. Failure sequence (step by step)

1. `before()` opens one database and one IPC server with `maxConnections = 1`, `allowHalfOpen: true`.
2. Test 5 sends request 1. `onconnection` sees `_connections (0) < maxConnections (1)`, creates the
   socket, increments `_connections` to 1, emits `'connection'`.
3. The handler reads one frame, resolves the binding, writes one response over the flush-guard path.
4. **The handle is never closed.** `_connections` stays at 1, because only `_destroy` decrements it.
5. The client (Windows helper) observes the frame and calls `socket.destroy()` on **its own** end —
   that releases the *client* handle, not the server's. Server `_connections` remains 1.
6. Requests 2, 3, … connect; `onconnection` evaluates `1 >= 1`, emits `'drop'`, calls
   `clientHandle.close()` and returns **before** `'connection'`.
7. The application handler never runs. Nothing is read, nothing is written. The client's
   `error`/`close` handler fires with an empty buffer → **zero bytes**.
8. The test that needs a real response after a previous successful one asserts
   `response.byteLength > 0` and fails — in ~400 ms, with no timeout, because the socket closes
   immediately rather than hanging.

The "server may temporarily consider capacity exhausted" hypothesis is therefore **refuted in its
temporal part** (it is permanent, not temporary) and **confirmed in its structural part** (the
capacity accounting is indeed the mechanism that produces the zero bytes).

---

## 3. Provenance reconciliation

Remote state re-verified this iteration: a fresh fetch of all 58 branch refs plus all
`refs/pull/*/head` refs, followed by a full re-scan of **all 3,773 blob objects**, computing SHA-256
of each.

| Artifact | Status |
|---|---|
| Base hashes (all four) | **AUTHENTICATED** — byte-exact to `3eb13ed`, PR #34 head |
| Target hashes (`28964b43…`, `c4fe1434…`, `b0df0d3a…`, `7d168396…`) | **UNAUTHENTICATED** — match 0 of 3,773 blobs |
| Actual Windows hashes (`dbfa2703…`, `ccc25726…`, `46bd8e60…`) | Not in the repository — **untracked Windows work**, as stated |
| Backup `f606654b…` (`endpoint.ts.before-deduplication.bak`) | Not in the repository — **backup-only content** |
| Failed-transfer patch hashes (`1ad6386…`, `83b38a3…`) | Not in the repository — confirms the corruption was introduced **in transfer**, not in repository content |
| `93a5834b…` (Round-6 commit) | Not resolvable in the remote |

### New provenance findings from the byte sizes

| File | Base (`3eb13ed`) | Windows current | Delta | Reading |
|---|---|---|---|---|
| `scripts/run-tests.mjs` | 4,974 | 4,974 | 0 | **tracked at `be32d8c`** — identical; carries no provenance information |
| `src/ipc/endpoint.ts` | 13,292 | 13,742 | +450 | Consistent with the base plus one `activeSockets` tracking block (~450 B). Underived from any candidate branch. |
| `tests/g3_binding_resolution.test.ts` | 8,419 | 9,132 | +713 | **Provenance now established**: `.before-call-helper-fix.bak` hashes exactly to `db784de3…` = the reported base. Chain: base → backup → current. The delta is exactly the described helper rewrite. |
| `src/ipc/dispatch.ts` | 12,174 | 16,153 | +3,979 | Local extension. Described as adding `writeFrame` and routing flush-guard through it — **the change that makes the leak unconditional**. Exact content still unverified. |

**Material correction to the earlier assessment.** The binding-resolution test file is no longer
"unestablished provenance": its backup hashes to the base exactly, so it is a **known local
derivation from the authenticated base**. The `endpoint.ts` delta is likewise consistent with a
single additive block, matching the operator's §6.1 marker. Only `dispatch.ts` (+3,979 B) remains
content-unverified, and it is the only file with a divergent semantic role in this failure.

**The `?`/mojibake encoding note** (`â€”` for `—`) is a separate encoding discrepancy in a comment.
It has no runtime effect and is not linked to this failure. It should be normalised (UTF-8) when
the file is next edited, but it is not a defect in the code path.

### Authority note — why the target hashes are no longer on the critical path

The correction below is derived from the **authenticated base `3eb13ed`**, not from the
unauthenticated target. No content from the failed transfer or from the unreachable `24b70f8` /
`1353cfe` lineage is used. The target patch remains unattributable and must not be applied on the
strength of its description or its claimed hash.

---

## 4. Correction

Three semantic changes, all in `src/ipc/dispatch.ts`, plus test updates.

**C1 — flush-guard writes without half-closing.** New `writeFrame()` uses `socket.write(frame, cb)`.
`socket.end()` is removed from the flush-guard path because on a libuv Windows pipe it is a
`FlushFileBuffers` with no half-close, not a close.

**C2 — the handle is closed once the response has flushed (the actual fix).**
Immediately after the guard race resolves successfully:

```ts
responded → socket.destroy();
```

This is the single change that resolves the reported failure. Two consequences, one required by the
C5.4 capacity invariant and one required by the client contract:

* `_destroy` runs → `server._connections--` → the single slot is free for the next request. **This is
  the demonstrated root cause.**
* the peer observes `ERROR_BROKEN_PIPE` as EOF → the client's read terminates → the observed "no EOF
  / never closes / resolves by timeout" symptom disappears.

The frame has already been flushed to the pipe when the write callback fires, so the peer drains the
buffered response and only then sees the broken pipe. Exactly one response is emitted.

**C3 — the post-flush watchdog is replaced by the deterministic close.** The `attachPostFlushWatch`
observer existed *because* the handle was left open after the flush. With the handle closed, a
post-flush second frame cannot reach the server at all, so the observer is unreachable. The `finally`
block now closes any flush-guard socket that is still open (covers the no-response paths).

**Trade-off, stated explicitly.** This removes the post-flush `MALFORMED_FRAME` sink record on the
Windows transport. That record was only ever diagnostic: the Stage-2 report already classifies
post-flush zero-byte refusal as a platform impossibility, and PR #34's failing assertion
(`MALFORMED_FRAME` expected, `undefined` received) is precisely that unachievable expectation. The
enforced invariant — *a second frame is never dispatched and never answered* — is strictly stronger
now: the connection no longer exists. Pre-flush second frames are still refused with zero bytes and
recorded as `MALFORMED_FRAME` in the bounded sink (unchanged). **No fail-closed semantics are
weakened**; the AF_UNIX airtight half-close gate is untouched.

**Why this does not introduce a new lifecycle or framing gap.** Capacity is released exactly once
per connection (`.destroy()` is idempotent; `refuseClassP` may already have destroyed). Every exit
path destroys the socket: Class P refusal → `refuseClassP`; transport/write fault → `refuseClassP`;
successful flush → C2; any remaining flush-guard path → the `finally` guard. There is no path that
leaves a flush-guard socket open, which is what produced the leak. Client-side helpers and the
`run-tests.mjs` parser are unchanged.

---

## 5. Changed-file inventory

| Path | Change | Purpose | Provenance |
|---|---|---|---|
| `src/ipc/dispatch.ts` | modified, +38/−42 | C1–C3: write-then-close on the flush-guard path; watchdog removed | Derived from `3eb13ed` (`skeletonSettle`/flush-guard path). **In the authorized manifest** (act §4.2 item 13) |
| `tests/g3_ipc_framing.test.ts` | modified, +20/−20 | Three emulation tests re-pointed from "socket stays open" to "socket is released"; assertions strengthened, no test deleted | Derived from `3eb13ed`. **In the authorized manifest** (§4.3 T-A) |
| `tests/g3_flush_guard_connection_release.test.ts` | **new**, 172 lines | Focused regression: 4 sequential requests on one server under flush-guard; capacity slot returns to 0; refusal (0 bytes) followed by a successful request | New file. **Requires a manifest amendment** (same class as `scripts/run-tests.mjs`) |

`scripts/run-tests.mjs` and `.github/workflows/ci.yml` are **not** touched.

The three rewritten assertions, for review:

* `a successful response never destroys the socket` → `the handle is closed after the single response
  so the peer sees EOF and the capacity slot is released`
* `a well-behaved single-frame peer is not torn down` → `... is released, which frees the server
  connection slot`
* post-flush second frame: now asserts the connection is closed and no post-flush record is produced
  (the frame is unreachable), instead of asserting an unachievable `MALFORMED_FRAME` record.

**Regression value, honestly stated.** The third assertion set (`g3_ipc_framing.test.ts`) is the
**discriminating** guard: on the unmodified base those tests fail with
`a successful response never destroys the socket — true !== false`, and they pass after the fix. The
new end-to-end suite passes on *both* base and fix **on Linux**, because AF_UNIX `end()` happens to
close the socket (experiment E). Its discriminating power is on **native Windows**, where `end()`
does not close the handle. This was measured, not assumed.

---

## 6. Patch verification

| Field | Value |
|---|---|
| Declared base | `3eb13ed637ac61bd971da1a06883da4b4564447b` |
| Target file list | exactly the 3 files above |
| Byte size | **18,701** |
| SHA-256 | **`a9e0ebd673ea90741eef545b3ef9d567ede066a0cea4aa25978ead787cfcc6ed`** |
| NUL bytes | **0** (the failed transfer had 2) |
| CRLF sequences | **0** |
| `git apply --check -v` vs pristine base | **CLEAN** (all three files checked) |
| Diffstat | 3 files changed, **230 insertions(+), 62 deletions(−)** |
| Unrelated files | none |
| Artifact location | `docs/integration/artifacts/g3-flush-guard-release.patch` (session workspace, uncommitted) |

Generated with `git diff --binary --no-color` (binary-safe, no inline transfer, no Base64). Hash and
size were recomputed from the final artifact, not reused from any earlier claim.

**Independent verification performed on the artifact itself.** A pristine clone of the repository was
checked out at `3eb13ed`, the patch applied with `git apply`, `npm ci` + `npx tsc` run, and the Gate 3
suites executed:

```
# tests 198   # pass 197   # fail 0   # skipped 1
```

Baseline at `3eb13ed` was 195 tests (194 pass / 1 platform skip); the +3 are the new regression
suite. No existing test was deleted.

### Transfer caveat — read before applying

**This patch applies to the declared base `3eb13ed`, not to the Windows working tree.** The Windows
`src/ipc/dispatch.ts` is 16,153 B against the base's 12,174 B and its exact content is unavailable to
Arena, so `git apply` will not match there. Two supported options:

1. **Preferred:** send the Windows file (or `git diff` of it against `3eb13ed`) so an exact patch can
   be produced against it; or
2. apply the three semantic changes by hand to the Windows `dispatch.ts` — (i) add `writeFrame`,
   (ii) route the flush-guard branch through it and `socket.destroy()` on success, (iii) remove
   `attachPostFlushWatch` and close any still-open flush-guard socket in `finally`.

Arena does not claim the artifact has been transferred, and does not claim it applies to the Windows
checkout.

---

## 7. Validation performed

**No full regression suite was run in this iteration.** No native-Windows test was run.

Performed:

* Node.js `lib/net.js` source inspection (`_destroy` decrement; `onconnection` drop-before-`connection`).
* libuv `src/win/pipe.c` `uv__pipe_shutdown` inspection (`FlushFileBuffers`, no half-close primitive).
* Five-scenario controlled capacity experiment (A–E), including the 150 ms-gap control that refutes
  the timing hypothesis.
* End-to-end reproduction of the zero-byte sequence through the real `listenIpc` +
  `createConnectionHandler` path with the Windows policy forced.
* Base-vs-fix behavioural comparison, including the deliberate revert-and-retest control.
* Fresh remote fetch; full 3,773-blob SHA-256 re-scan against 10 known hashes.
* `tsc` typecheck (base and patched), and the ten Gate 3 suites: **198 tests, 197 pass, 1 platform
  skip, 0 fail**, on Linux.
* Patch integrity: NUL/CRLF scan, `git apply --check`, clean-clone apply, rebuild, retest.

Not performed: any Windows execution; the full `npm test` regression; any change to
`scripts/run-tests.mjs`.

---

## 8. Remaining blockers

1. **Patch does not apply to the Windows working tree** (see §6 caveat). Exact transfer requires the
   Windows `dispatch.ts` bytes.
2. **Native-Windows confirmation of C2 is outstanding.** Specifically: that a peer draining a pipe
   after the server's `CloseHandle` still receives the complete buffered frame before
   `ERROR_BROKEN_PIPE`. Expected by Windows pipe semantics, but not observed here.
3. **`dispatch.ts` provenance remains content-unverified** (+3,979 B, no backup, no matching blob).
   It is the one file whose exact local content is still unknown.
4. **Window `endpoint.ts` `activeSockets` block**: harmless, but it does not and cannot fix this
   defect — the accounting that matters is inside Node. Retain it; do not treat it as the fix.
5. **Manifest amendments required**: the new test file, and (separately) `scripts/run-tests.mjs` if it
   is ever to be changed. Neither is authorized today.
6. **Identity of the 4 skipped Windows tests** is still unrecorded.
7. **The target hashes remain unauthenticated.** They are no longer on the critical path for this
   correction, but they should still be resolved before any artifact claiming them is trusted.
8. **`run-tests.mjs` parser defect** (CRLF / `ℹ` marker / no failure-count check) is unchanged and
   still outside the authorized manifest; the Windows CI leg still publishes no test counts.

---

## 9. Gate 3 status

**BLOCKED / NOT ACCEPTED.** Unchanged.

A clean patch, a passing Linux run, and a passing emulation suite are **not** native-Windows
acceptance evidence. Gate 3 remains blocked until the corrected build is transferred to the Windows
checkout, its provenance is verified there, and the Gate 3 suites — including
`g3_binding_resolution` executed as a whole file, unfiltered — pass on native Windows with the full
transcript recorded.
