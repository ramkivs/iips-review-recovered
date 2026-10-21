# IIPS v3.0 — Gate 3: IPC Connection-Release Correction (flush-guard / Windows named-pipe)

**Date:** 2026-10-21 (UTC). **Author:** Arena Agent. **Session branch:** `arena/17d363e9-iips-review-recovered`.
**Gate 3 status: BLOCKED / NOT ACCEPTED.** Native-Windows acceptance has not been performed.

**Scope.** Records the root cause of the native-Windows zero-byte failure on the second and later
IPC requests, the contract position taken, the correction, and its validation. It supersedes the
candidate recorded in `IIPS_v3.0_G3_PATCH_RETRIEVAL_AND_WINDOWS_ACCEPTANCE_2026-10-21.md` §2.

**Environment boundary.** Arena has no access to the user's Windows filesystem, checkout, localhost
services or native Windows runtime. Every Windows-side observation quoted here is the operator's
reported evidence. Product-code conclusions are derived from repository sources and POSIX execution.

---

## 1. Root cause — CONFIRMED

The failure is **deterministic connection-slot exhaustion**, not a timing race.

Three facts, each verified against source:

1. **`listenIpc` sets `server.maxConnections = options.maxConnections ?? 1`** (C5.4 capacity 1).
2. **Node decrements `server._connections` in exactly one place** — `Socket.prototype._destroy`:

   ```js
   if (this._server) {
     this._server._connections--;
     if (this._server._emitCloseIfDrained) this._server._emitCloseIfDrained();
   }
   ```

   Half-close, `end()`, FIN and peer disconnect do **not** release the slot. Only `destroy()` does.
3. **`net.js onconnection` checks capacity before emitting `'connection'`**:

   ```js
   if (self.maxConnections != null && self._connections >= self.maxConnections) {
     ... self.emit('drop', data); clientHandle.close(); return;   // handler never runs
   }
   ```

At the base (`3eb13ed`) the flush-guard path wrote its single response with `socket.end(frame)`. On a
libuv Windows pipe that is a `FlushFileBuffers` with **no half-close primitive** (`uv__pipe_shutdown`
in `libuv/src/win/pipe.c`); the handle stays open and the peer receives no EOF. The server therefore
never closed the socket, `_connections` never fell from 1, and **every later connection was dropped by
the runtime before the application handler existed** — nothing read, nothing written, zero bytes.

That is exactly the reported observation: normal exit in ~400 ms, no timeout, `byteLength > 0`
receiving 0.

### Why the whole file failed while the isolated test passed

`tests/g3_binding_resolution.test.ts` opens **one** server in `before()` and shares it across ten
tests:

| # | Test | IPC | Expects | Windows (base) |
|---|---|---|---|---|
| 5 | `re-resolves per request with no cache` | **first call** | `> 0` | passes — **leaks the slot here** |
| 5 | (second call) | yes | `0` | passes — *for the wrong reason* |
| 6 | `an absent binding over IPC` | yes | `0` | passes — *for the wrong reason* |
| 7 | **`restoring an ACTIVE binding…`** | yes | `> 0` | **FAILS — 0 bytes** |
| 8–10 | (no IPC) | — | — | pass |

9 passes / 1 failure, and precisely the reported failing test. With `--test-name-pattern`, tests 5–6
never run, the server is fresh, and the first connection is accepted — 1/1 pass. No race is required.

**Test-integrity consequence.** Every `byteLength === 0` assertion in that suite was passing because
the connection was *dropped by capacity*, not because the Class P refusal path ran. On Windows the
suite was masking the defect.

---

## 2. Contract decision

### 2.1 Governing text (verified at source)

| Source | Requirement |
|---|---|
| Act §4.2 item 11 (`src/ipc/protocol.ts`) | "one request and at most one response per connection; pipelined frames refused" |
| Act §4.2 item 13 (`src/ipc/dispatch.ts`) | "Class P refusals with **zero bytes and connection close**" |
| Act §4.3, row `tests/g3_ipc_framing.test.ts` (T-A) | "Oversize (> 64 KiB), malformed, `v ≠ 1`, unknown `op`, truncated frame and pipelined frames each produce **zero bytes** and connection close; plus audit-line assertions for refused frames recorded only in the bounded local diagnostic sink, never on the wire" |
| Implementation-authority request §6.2, row T-A | "Framing: oversize, malformed, `v ≠ 1`, unknown op, pipelined frames — **Zero bytes; connection closed (Class P)**" |
| Act §4.3 preamble | "**No test-runner, script or configuration change is required or authorized.**" The test set is fixed at **8** files |

`IRR PKG-11 §E` and `PKG-12` are **not present as documents in either repository** (exhaustive
`grep` over `*.md` in both). They are cited in earlier reports but cannot be consulted; the operative
instrument is the effective act above. No rule has been invented in their absence.

### 2.2 The three cases, decided

| Case | Requirement | Disposition |
|---|---|---|
| **A. Second frame detected before the first response flushes** | Zero bytes; connection closed (Class P); `MALFORMED_FRAME` in the bounded sink | **Unchanged.** The guard race trips, `refuseClassP` records the reason and destroys the socket. This is the case T-A governs and it is fully covered. |
| **B. Second frame arriving after the response has irreversibly flushed** | One request / at most one response per connection; connection closed | **Enforced structurally.** The handle is closed immediately after the flush, so the frame cannot reach the server. Exactly one response is emitted; the second frame is never dispatched and never answered. Zero-byte refusal does **not** apply — a valid response was already delivered — and a post-flush sink record is unobservable. |
| **C. Second frame that cannot reach the server because the connection is closed** | Same as B | The invariant is satisfied by non-existence of the connection, which is a stronger guarantee than an observation of it. |

**Why B and C cannot retain the post-flush diagnostic.** To *observe* a post-flush frame the server
must keep reading, which requires the handle to stay open, which consumes the only capacity slot.
Holding it for a bounded window does not help: a client that issues its next request promptly (the
normal case, and precisely what `g3_binding_resolution` does) would find the slot still taken and be
dropped — reinstating the very zero-byte defect. Capacity release and post-flush observation are
mutually exclusive under a capacity of one. Capacity release is the required behaviour; the
diagnostic yields.

This is recorded as a **design decision under act §4.2 item 11 + §4.3 T-A**, not as a protocol change:
the refusal duty attaches to a frame the server can still observe, and that path (`case A`) is
untouched and remains fully asserted.

**Honesty note on verification.** The window trade-off could not be *demonstrated* on POSIX: AF_UNIX
delivers a real FIN, so its `end()` closes the socket and masks the difference. The conclusion rests
on the Windows handle-open behaviour that is itself the proven root cause, plus the fact that an open
handle demonstrably blocks subsequent connections.

---

## 3. Implementation

Three files, all inside the act's manifest. **No new file** (act §4.3 fixes the set at 8); no
test-runner, script or configuration change.

| Path | Manifest basis | Change |
|---|---|---|
| `src/ipc/dispatch.ts` | §4.2 item 13 | Flush-guard response written with `writeFrame` (`socket.write`) instead of `endFrame`; the handle is **closed as soon as the frame has flushed**; `attachPostFlushWatch` and the now-unused `responded` flag removed; `finally` closes any remaining flush-guard exit path |
| `tests/g3_ipc_framing.test.ts` | §4.3 T-A | Three emulation assertions re-pointed from "the socket stays open" to "the handle is released"; the real-socket Windows branch asserts exactly one response frame and **no second response bytes** instead of an unachievable post-flush sink record |
| `tests/g3_binding_resolution.test.ts` | §4.3 T-C | New describe: five sequential requests across one server lifetime, capacity released to zero, and recovery to a successful request after a zero-byte Class P refusal |

Why `write()` rather than `end()` on this path: the transport has no half-close, so `end()` states a
guarantee the pipe cannot keep. Writing and then closing the handle describes what actually happens,
and it makes the POSIX emulation faithful to Windows.

Why this fixes the cause and closes no new gap: every flush-guard exit now destroys the socket —
successful flush (in `writeGuarded`), Class P refusal or transport fault (`refuseClassP`), and any
remainder (`finally`). No path can hold the slot. The frame is already flushed when the callback
fires, so the peer drains it before observing `ERROR_BROKEN_PIPE`. Exactly one response is ever
written; `destroy()` is idempotent.

---

## 4. Validation (POSIX only — not native Windows)

| Command | Result |
|---|---|
| `npx tsc` | exit `0` |
| `npx vite build` | success (pre-existing chunk-size warning only) |
| `npm test` (guarded runner) | **`# tests 754` · `# pass 753` · `# fail 0` · `# skipped 1` · 95 suites** — `[test-guard] OK — 754 test(s) executed, 753 passed, exit 0` |
| `node --test dist/tests/g3_*.test.js` | **198 tests, 197 pass, 0 fail, 1 skip** (11 suites) |
| `node --test dist/tests/g3_binding_resolution.test.js` | **13 / 13 pass** (10 pre-existing + 3 new) |
| `node --test dist/tests/g3_ipc_framing.test.js` | **30 / 30 pass** |
| Sequential-request probe, flush-guard forced on AF_UNIX, real `listenIpc` + `createConnectionHandler` | 5/5 requests served (70 bytes each), `accepted = closed = 5`, `getConnections() = 0` |

Baseline for comparison: `3eb13ed` was 751/750/1-skip; the +3 are the new T-C tests. One test is
skipped on Linux by design (`the Windows endpoint is a named pipe with no filesystem artifact`); on
Windows the four `posixOnly` tests skip instead.

**Regression discrimination, measured.** Running the new test expectations against the **unmodified**
base produces **3 failures** in the flush-guard emulation suite
(`delivers exactly one response…`, `a post-flush second frame cannot reach the closed handle…`,
`releases the handle after a clean single-frame exchange…`), all reporting that the handle was not
released. With the correction they pass.

**Limitation, stated plainly.** The new T-C sequential tests pass on the base too *on Linux*, because
the base's `end()` closes an AF_UNIX socket. They are not a POSIX discriminator for the leak; they are
the regression that must hold on native Windows, and they are a guard against a future return to
write-without-close. The POSIX discriminator is the emulation suite.

---

## 5. Publication

| Item | Value |
|---|---|
| Candidate commit | `5fb7efe7b50b73d90651b09bfe2bdd4ff7210787` |
| Branch | `g3/gate3-node-sqlite-ipc-correction-d30003d` (parent `3eb13ed`) |
| Artifact | `docs/integration/artifacts/g3-connection-release.patch` (this repository) |
| Size / SHA-256 | **18,900 bytes** / **`5745647e32b1da67fb984a7748406921aefb495000dfcbfdd9255133cad5fe0a`** |
| `git apply --check` vs `3eb13ed` | **CLEAN** |
| Artifact reproduces the commit | verified — all three files byte-identical after applying to a pristine base |
| Independent rebuild from the artifact | `198 / 197 / 0 / 1` |

**IPD remote publication is BLOCKED — credential boundary, not a technical failure.** The commit
exists locally and is complete, but it could not be pushed:

```
remote: Permission to ramkivs/iips-production-market-data.git denied to ramkivs.
fatal: ... The requested URL returned error: 403
```

and the same boundary via API:

```
POST /repos/ramkivs/iips-production-market-data/git/refs
{"message":"Resource not accessible by integration", "status":"403"}
```

The active token is an App installation token that can read IPD and **write** `ramkivs/iips-review-recovered`
(a probe ref was created and deleted there successfully) but has no `contents:write` on
`ramkivs/iips-production-market-data`. Consequently **PR #34 is unchanged**, the candidate is **not**
on the IPD remote, and the artifact in this repository is the transfer vehicle.

### Supersession

`g3-flush-guard-release.patch` (`a9e0ebd6…`, 18,701 B) is **SUPERSEDED** and must not be used. It
(a) added a ninth test file — outside the act's fixed set of 8 — and (b) asserted connection counts
without synchronising on the release signal, which is the defect the operator's Windows run reported
as *Failure A* (expected 0, actual 1). The corrected regression waits on the server's own `close`
events, bounded so a leak fails loudly rather than passing on timing.

The operator's *Failure B* is **independent of this candidate and of the previous one**: the framing
suite constructs its **own** handler (`readSingleFrame` + `socket.end` + `reader.release()`), never
`createConnectionHandler`, so it has never recorded a post-flush diagnostic. PR #34's own body records
that exact test failing on Windows at the base with `MALFORMED_FRAME` expected / `undefined` received.

---

## 6. Outstanding acceptance evidence

1. **Native-Windows run of the corrected candidate** — required. POSIX results and fake-socket
   emulation are not native named-pipe evidence.
2. **Confirmation that the peer drains the buffered frame** before `ERROR_BROKEN_PIPE` after the
   server closes the handle (expected by Windows pipe semantics; not observed here).
3. Full transcript including the identity of the four tests skipped on Windows.
4. `src/ipc/dispatch.ts` in the Windows checkout remains a 16,153-byte local file with unverified
   content; the artifact applies to `3eb13ed`, not to that working tree.

## 7. Status

**Gate 3 remains BLOCKED / NOT ACCEPTED.** This record documents a corrected, locally validated and
independently verified candidate that is **not published to the IPD remote** and has **not** been run
on native Windows.
