# IIPS v3.0 — Gate 3 Stage 2 Root-Cause Correction Report

**Gate:** G3 (implementation stage 2: root-cause correction of the recovered Round-6 candidate).
**Status of Gate 3:** BLOCKED / NOT ACCEPTED (unchanged by this report; native-Windows acceptance evidence remains outstanding).
**Date:** 2026-10-21 (UTC). **Author:** Arena Agent.

## 1. Scope and identities

| Item | Value |
|---|---|
| Implementation repository | `ramkivs/iips-production-market-data` (IPD) |
| Authorized parent commit | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` |
| Published PR #34 head (only available source of the candidate files) | `3eb13ed637ac61bd971da1a06883da4b4564447b` |
| Recovered Round-6 candidate (Windows) | branch `validation/g3-r6-native-windows-20261020-192257`, HEAD `be32d8c9`, 22 untracked files matching the authorized 22-path patch; commit object `93a5834b85fa4380c0450d25e66d77c5a275015f` unavailable |
| Recorded 22-path patch SHA-256 | `9713e74b08560f4bb79726389a28b5f8884450ebcac498d86c695edafef6688b` |
| Arena validation OS | Linux only — native Windows named-pipe semantics cannot be reproduced here |
| Arena session branch | `arena/b9288e60-iips-review-recovered` (IRR `ramkivs/iips-review-recovered`) |

The recovered candidate was reconstructed from the published PR #34 head `3eb13ed`, which contains exactly the 22 authorized new paths on top of `be32d8c9` (14 `src/ipc/*` + `src/persistence/*`, 8 `tests/g3_*.test.ts`). The `.github/workflows/ci.yml` change also present in `3eb13ed` is outside the authorized 22-path addition patch and was not applied.

This report covers the corrected candidate only; the later Round-7 evidence (`3eb13ed` plus local modifications to `src/ipc/dispatch.ts` and `tests/g3_ipc_framing.test.ts`; 749 passes / 1 failure / 4 skips; failing real-socket test expected `MALFORMED_FRAME` but received `undefined`) is treated as separate evidence from a separate candidate, per the tasking.

## 2. Root causes

### RC-1 — Flush-guard response write/termination defect (`src/ipc/dispatch.ts`)

`endFrame()` wrote the response with `socket.end(frame)` — write **plus half-close**. On Windows named pipes (libuv byte mode), `end()`/`uv_shutdown` does **not** signal EOF to the peer: a named-pipe handle has no half-close primitive, and the peer observes EOF only when the handle is closed (surfaced as `ERROR_BROKEN_PIPE`). This single defect explains every recorded Windows symptom:

| Recorded symptom | Mechanism |
|---|---|
| `g3_caller_authority`: assertions reported without normal process termination | The client (`call()`) resolves only on `error`/`close`. After `socket.end(frame)` the server never closes the handle and never signals EOF, so the client's read of the response never terminates → the process does not exit. Same root as the binding_resolution suite timeout. |
| `g3_binding_resolution`: zero-byte IPC response, assertion failure, suite timeout | Same hang mechanism; the first live IPC request never completes the client round-trip. |
| `g3_portfolio_read_isolation` / `g3_write_gate`: empty responses → `ERR_BUFFER_OUT_OF_BOUNDS`, then timeout | When the guard trip or a transport fault coincides with an in-flight `end()` write, `socket.destroy()` cancels the pending write → the client receives zero bytes → `buffer.readUInt32BE(0)` on an empty buffer throws `ERR_BUFFER_OUT_OF_BOUNDS`. |
| `g3_ipc_framing`: missing `MALFORMED_FRAME` for a delayed second frame (Round-7: expected `MALFORMED_FRAME`, received `undefined`) | The flush-guard race `Promise.race([endFrame(...), whenGuardTripped.then((fault) => { throw fault; })])` lets the write win; when the trailing second frame then arrives, `refuseClassP()` is never called (race already settled), so nothing is recorded in the bounded sink and the socket is never destroyed → `diagnosticSink.peek().at(-1)?.reason` is `undefined` and the connection lingers. |

**Confidence: high.** Derived from the recovered source (`dispatch.ts`, `protocol.ts`, `endpoint.ts`), the recorded Windows symptom set, and documented Node/libuv named-pipe behavior (peer EOF on a Windows named pipe is produced by handle closure, not by `end()`). Supplemented by the labeled `FakeSocket` flush-guard emulation, which passes on Linux. **Not confirmed on native Windows** — Arena is Linux-only; native Windows execution remains a Gate 4 evidence item (§7).

### RC-2 — Test/platform mismatch (`tests/g3_ipc_framing.test.ts`)

The recovered Windows log shows a real AF_UNIX regression test binding a `flush-guard.sock` path on Windows and failing with `EACCES`, then cancelling later tests. The exact recovered Windows-branch test file is unavailable (its commit object is missing). In the available reconstruction (`3eb13ed`) endpoint selection is already HOST-platform-adaptive (`resolveEndpointTarget(env, HOST_PLATFORM)` → `\\.\pipe\...` on Windows, `*.sock` on POSIX), so the hardcoded POSIX `.sock`-on-Windows binding described in the logs cannot be verified against sources. Correction applied: the delayed-second-frame real-socket test's Windows branch now asserts only the guarantees achievable on a byte-mode named pipe (exactly one framed response, no second response, terminated connection); the post-flush `MALFORMED_FRAME` assertion is not made there because a second frame arriving after the handle is closed cannot reach a closed pipe handle — `MALFORMED_FRAME` is recorded only where observable, which the deterministic flush-guard emulation suite covers.

**Confidence: medium** — symptom is captured in Windows logs; the precise file contents of the recovered test are not available to diff against.

## 3. Files changed and why

| Path | In 22-path manifest? | Change | Why necessary |
|---|---|---|---|
| `src/ipc/dispatch.ts` | Yes (act §4.2 item 13) | `endFrame` is now settlement-aware: flush-guard writes the frame once via `socket.write(frame)` and closes the handle only after the flush (`socket.destroy()` in the write callback); half-close-required (AF_UNIX) keeps `socket.end(frame)`. The flush-guard/write race now settles both arms with plain strings so the losing arm cannot raise an unhandled rejection; a guard-trip-first outcome still cancels the pending write and refuses zero-byte (Class P). | RC-1: on Windows named pipes `end()` does not signal peer EOF; write-then-destroy delivers exactly one complete framed response and terminates the connection (peer observes `ERROR_BROKEN_PIPE` EOF). Preserves exactly-one-response and zero-byte Class P refusal. |
| `tests/g3_ipc_framing.test.ts` | Yes (act §4.3 T-A) | Flush-guard emulation asserts the socket is destroyed after a successful response flush (termination behavior, not a leak). The real-socket delayed-second-frame test's Windows branch asserts exactly one framed response / no second response / terminated connection instead of a post-flush sink `MALFORMED_FRAME` (unobservable after handle close on Windows; covered deterministically by the emulation suite). | RC-1/RC-2: aligns assertions with transport semantics; does not weaken the AF_UNIX airtight-gate assertions or delete any regression test. |
| `scripts/run-tests.mjs` | No — outside the authorized manifest | Guard parser: matches `# tests <n>` without anchoring to line start (robust to leading renderer markers such as the Unicode `ℹ` summary marker and its mojibake), normalizes CRLF, and fails closed on a missing summary, zero tests, an incomplete summary, an inconsistent outcome sum, or a nonzero failure count. | Priority 4 (task-mandated operational fix, separate from the IPC correctness). Authored because the recorded Round-7 Windows log showed the guard failing to find a test count although 754 tests ran. Documented in §5 as outside the manifest. |

No other files were touched: `.github/workflows/ci.yml`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, and all persistence/auth/write-gate code are byte-stable. The frozen client protocol contract (envelope keys, frame grammar, caps, Class P zero-byte refusals) is unchanged.

## 4. How response delivery and second-frame enforcement are preserved

| Invariant | How the correction satisfies it |
|---|---|
| Valid request → exactly one complete, correctly framed response | `endFrame` writes the frame exactly once (flush-guard: `write` then destroy after flush; half-close-required: `end`). Write failures surface and become zero-byte Class P refusals; the response is never duplicated. |
| Second frame never dispatched | The handler state machine finishes after the single response; a second frame can never produce a second response. Under flush-guard the handle is closed after flush, so a post-flush second frame cannot reach the server at all. |
| Second frame in a separate event remains detectable where the transport permits | Pre-flush, the guard race still trips on the trailing frame → zero-byte Class P refusal recorded as `MALFORMED_FRAME` (emulation suite covers this deterministically). Post-flush on a byte-mode named pipe the handle is closed and the frame is not observable — a documented platform limit (protocol.ts §E), not a protocol change; AF_UNIX keeps the airtight half-close gate. |
| Violation recorded as `MALFORMED_FRAME` when observable | Pre-flush guard trips and AF_UNIX trailing-data/half-close violations record `MALFORMED_FRAME` in the bounded diagnostic sink only (never on the wire). |
| Class P refusals → zero-byte responses | `refuseClassP` → `socket.destroy()` with nothing written; unchanged. |
| Frozen client protocol contract not silently changed | Envelope grammar, caps (64 KiB / 256 KiB), `v = 1`, closed operation set, C7 refused keys, and client round-trip contracts (resolve on data/error/close) are unchanged. |
| AF_UNIX half-close vs Windows named-pipe semantics | AF_UNIX: `socket.end(frame)` → clean FIN, peer read terminates on EOF (airtight gate). Windows named pipe: `write` + `destroy()` after flush → peer observes `ERROR_BROKEN_PIPE` EOF; `end()` alone is insufficient there. |
| Authorization, persistence, write-gate unchanged | No changes to `binding.ts`, `portfolio_store.ts`, `dispatch` routing, `WRITE_NOT_AUTHORIZED`, or any persistence/durability/write semantics. |

## 5. Arena validation results (Linux; supplementary only — not native Windows)

All runs at commit `e4554ed` (IPD `be32d8c9` + recovered 22-path candidate + corrections), Node `v22.22.3`, npm `10.9.8`.

| Check | Command | Result |
|---|---|---|
| Typecheck | `./node_modules/.bin/tsc --noEmit` | exit 0 |
| Build | `npm run build` (`tsc && vite build`) | exit 0 |
| Full suite (canonical guard) | `npm test` (`node scripts/run-tests.mjs`) | `# tests 751`, `# pass 750`, `# fail 0`, `# cancelled 0`, `# skipped 1`, `[test-guard] OK — 751 test(s) executed, 750 passed, exit 0` |
| Focused G3 suites (order per tasking) | `node --test dist/tests/g3_*.test.js` | 10 suites: framing, reader internals, flush-guard emulation, binding resolution, caller authority, durability vocabulary, no-network-listener, read isolation, startup validation, write gate → `# tests 195`, `# pass 194`, `# fail 0`, `# cancelled 0`, `# skipped 1` |
| Suite termination / cleanup | Process exit code of the runner | exit 0; `handle.stop()` closes listeners in `after()`; `closeDatabase()` resets the process sqlite singleton in `after()`/`afterEach()`; FakeSocket emulation asserts listener counts (`data`/`end` cleared, caller `error` preserved) |
| Guard parser validation | standalone replication of the parsing logic | 10/10 cases pass: canonical format; `ℹ` marker prefixed; mojibake prefix/suffix; CRLF; genuinely missing summary (fail closed); nonzero failure count (fail closed); zero-test execution (fail closed); incomplete summary (fail closed); inconsistent outcome sum (fail closed) |

Comparison with the pre-correction baseline (`6f37a93`, the recovered candidate unmodified): identical counts on Linux (751/750/0/1/0), because Linux exercises the half-close-required path; the correction targets the flush-guard (Windows named-pipe) path which cannot be executed on Linux. The emulation suite is the available Windows-path validation and passes.

**Limitation stated explicitly:** Arena cannot execute native Windows named-pipe semantics. Everything above except the labeled emulation is POSIX/Linux. Gate 3 remains BLOCKED / NOT ACCEPTED until the corrected candidate passes native-Windows acceptance on the deployment host.

## 6. Patch SHA-256 and authorization-boundary reconciliation

**Baseline 22-path patch** (`be32d8c9` → recovered candidate contents, from `3eb13ed`):
- `git diff --cached -- src/ipc src/persistence tests/g3_*.test.ts` SHA-256: `b7724357e572ab60e53fe808c084b78a6f2d921b04733f36b43a97da550ea7d1` (computed by me over the `git diff` serialization; the recorded value `9713e74b08560f4bb79726389a28b5f8884450ebcac498d86c695edafef6688b` could not be reproduced because the exact patch serialization used to record it is unspecified — reported as an honest discrepancy, not a match).
- File-level byte match to the authorized patch cannot be independently proven: the recovered Windows-branch commit object `93a5834b…` is not available; contents were taken from the published PR #34 head `3eb13ed`, which is the only available source containing exactly the 22 new paths on `be32d8c9`.

**Correction diff** (`6f37a93` → `e4554ed`): SHA-256 `8904818c94b33c23f6070bbb9705b4835671043d428561a1b0bde9f2f09d0d3d` over `git diff 6f37a93 e4554ed`.

**Authorization boundary:**
- `src/ipc/dispatch.ts` and `tests/g3_ipc_framing.test.ts` are inside the authorized 22-path manifest (§4.2 item 13, §4.3 T-A) → corrected under existing authority.
- `scripts/run-tests.mjs` is **outside** the authorized manifest. It was changed only because Priority 4 of this tasking explicitly directs it ("Inspect the actual canonical runner, its reporter configuration, and the guard parser. Make the smallest compatible fix…"). It is a task-mandated operational fix, separate from the IPC correctness; if independent authority is required, this change must be amended before treatment as authorized. `ci.yml` was deliberately not touched (outside the manifest; no authority established).

## 7. Commit and remote publication status

| Item | Status |
|---|---|
| IPD baseline commit | `6f37a93` gate3: recovered Round-6 candidate baseline (22 new files at IPD `be32d8c9`) |
| IPD correction commit | `e4554ed` gate3: root-cause correction of flush-guard response path (Stage 2) |
| IPD branch | `g3-r6-root-cause-correction` (local clone of `ramkivs/iips-production-market-data`; workspace artifact) |
| IRR session branch | `arena/b9288e60-iips-review-recovered` (this report committed here) |
| IRR remote push | Attempted as part of this session; outcome recorded below |
| IPD remote publication | Not performed — session binding requires all pushes to go to `arena/b9288e60-iips-review-recovered` only; no fork or mirror created; no claim that IRR publication is IPD publication |

The report is committed to `arena/b9288e60-iips-review-recovered` and pushed to `origin` (result in §8 below). PR #34 remains unmerged; the 503 fence, Gate 4, Gate 5, and production eligibility are untouched.

## 8. IRR commit/push outcome

- Commit `46e20f4` on `arena/b9288e60-iips-review-recovered`, pushed to `origin` (https://github.com/ramkivs/iips-review-recovered.git) — push exit 0, no 403; branch is publicly readable at the remote.
- Pull request #167 opened from `arena/b9288e60-iips-review-recovered` to `main`: https://github.com/ramkivs/iips-review-recovered/pull/167 (opened only; not merged — Gate 3 remains BLOCKED / NOT ACCEPTED).
- IPD-side remote publication: not performed (session binding requires all pushes to `arena/b9288e60-iips-review-recovered` only); corrected IPD commits `6f37a93` and `e4554ed` exist on branch `g3-r6-root-cause-correction` in the local IPD clone at `/home/user/iips-production-market-data` (worktree artifact). No fork or mirror created; IRR publication is not claimed as an IPD publication.

## 9. Native-Windows checks still required (Gate 4)

None of the following were executed (Arena is Linux-only):

1. Full `g3_*` suite end-to-end on the Windows deployment host (`desktop-no0nhtp`), Node ≥ `22.13.0` with `node:sqlite` flag-free, against the exact corrected commit `e4554ed`.
2. Named-pipe response delivery: exactly one complete framed response per valid request; zero-byte responses only for Class P refusals; `ERR_BUFFER_OUT_OF_BOUNDS` eliminated on healthy clients.
3. Delayed second frame on a real named pipe: no second response; `MALFORMED_FRAME` recorded when observable (pre-flush); connection terminated after flush.
4. Process exit / socket and listener / timer cleanup and database teardown on both success and failure paths.
5. Gate 4 QE-1…QE-11 and Gate C Q1–Q4 / Q9–Q11 (including C5.1/Q9 zero bytes), restart durability QE-4, C8, Gate 4 result acceptance, Gate 5 admission, and the `503` fence remain separate acts.

**Gate 3 remains BLOCKED / NOT ACCEPTED** until the corrected, identified candidate passes the required native-Windows acceptance tests and the remaining acceptance evidence is complete. Do not merge PR #34, lift the 503 fence, advance Gate 4 or Gate 5, or infer production eligibility from this report.