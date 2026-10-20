# PKG-14 — Gate 3 Round-7: Flush-Guard Watchdog Arming and end()-Based Delivery Correction (2026-10-21)

| Field | Value |
|---|---|
| Packet | PKG-14 (successor to PKG-13; supersedes the unpublished `93a5834` write-only design where the two diverge) |
| Date | 2026-10-21 (Asia/Calcutta) |
| Authority | `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` (EFFECTIVE); authorized parent `be32d8c95a86b3f03bd382ccde5b6398efb351c6` unchanged; work confined to the 22 in-manifest paths |
| Implementation repository | IPD (`ramkivs/iips-production-market-data`), fresh read-then-write clone at `/home/user/iipd-work` |
| Baseline verified remotely | PR #34 OPEN, head `3eb13ed637ac61bd971da1a06883da4b4564447b`, base `main` `3d44e0a1…`, mergeable/clean, **0 check runs, 0 statuses, 0 reviews**; commit API 422 for `93a5834…` (absent from every remote ref — re-verified this round) |
| New local commit | **`7563d541d4163102368d96d475af2d2b6f24339d`** on branch `g3/gate3-node-sqlite-ipc-correction-d30003d`, direct child of `3eb13ed` (3 commits over `be32d8c9`: `673ec75`, `3eb13ed`, `7563d54`). Not on any remote; do not cite as published |
| Files changed vs `3eb13ed` | Exactly two, both inside the act manifest: `src/ipc/dispatch.ts`, `tests/g3_ipc_framing.test.ts` (+192/−23). No `ci.yml`, dependency, script, path-add or path-delete |
| Arena environment | Linux `6.11.158+`, Node `v22.22.3`, npm `10.9.8`; external native evidence from Windows PowerShell 5.1 / Git 2.55 / Node 24.14 |
| Native-Windows acceptance | **NOT VERIFIED.** No Windows command was run by Arena; all Linux results below are Linux/real-socket or labeled emulation evidence only |
| Gate 3 status | **BLOCKED / NOT ACCEPTED.** No Gate 4/QE act, result acceptance, Gate 5 admission, 503 lift (`blob 51704c12…` fence untouched), `durable:true`, or production eligibility is created or implied. CV-52 remains BLOCKED |

---

## 1. Baseline and candidate reconciliation (verified, not assumed)

Live GitHub API and a fresh clone established before any edit:

- Remote PR head `3eb13ed` is the strict two-commit descendant of the authorized parent `be32d8c9` and is the near-passing candidate of record (recorded native run: 751 tests, 746 pass, 1 fail, 4 platform skips).
- `93a5834b85fa4380c0450d25e66d77c5a275015f` exists in no remote ref (commit API: 422 No commit found) and no longer exists in any Arena object store after the environment resets. Its content is attested only by PKG-12/PKG-13 narrative. **No Git ancestry is fabricated:** `7563d54` was built directly on the verifiable `3eb13ed`, and its design consciously rejects the write-only element of the `93a5834` design for the evidence in §2.
- Baseline re-run on the untouched `3eb13ed` tree (after `npm ci`, exit 0): `npx tsc --noEmit` exit 0; `npm run build` exit 0; canonical `npm test` → **751 tests, 750 pass, 0 fail, 1 skip, guard exit 0, 9.3 s wall, process exits**.
- The `.github/workflows/ci.yml` matrix hunk (+10/−2) remains part of the published lineage but outside the act manifest (frozen blob `aeee464f…`; §4.6 no-change). It was not touched again; the formal amendment requirement stands and was not created.

## 2. Root causes: confirmed vs hypothesis

### Confirmed from source plus the external native diagnostic

1. **Empty responses / `ERR_BUFFER_OUT_OF_BOUNDS` — delivery-ordering defect of the write-only design.** Every G3 IPC harness (`g3_binding_resolution`, `g3_caller_authority`, `g3_portfolio_read_isolation`, `g3_write_gate`, and the framing real-socket test) resolves a call only on socket `close`/`error` and then unconditionally parses byte 0 with `readUInt32BE`. On a Windows byte-mode named pipe the reference client half-closes after its request; a server response sent with bare `socket.write()` has no ordered write-before-shutdown, and the client-side pipe teardown can full-close the pipe before the server write lands (EPIPE → server catch → zero-byte Class P destroy → empty client buffer → bounds throw). The `3eb13ed` ordered `socket.end(frame)` path (write and shutdown in one libuv sequence) delivered 746/751 natively; the write-only candidate did not. Confirmed by source inspection of the close-driven harnesses and the failure pattern (empty buffers only in suites that assert delivered frames; zero-byte Class P suites unaffected).
2. **`undefined` instead of `MALFORMED_FRAME` — observer placement defect.** At `3eb13ed` the post-flush watchdog is attached in `finally` only after the `end()` callback settles and only when `!socket.readableEnded`. On a real pipe the `_final`/uv_shutdown callback settles at or after libuv's ~50 ms forced break, so a second frame delivered inside that window (the native +25 ms separate-write test) meets no listener: `reader.release()` has detached the reader's listeners and the watchdog was never attached. The sink therefore stays empty.
3. **`EACCES` on a `flush-guard.sock` path under the Windows temp directory — platform-incompatible test.** Node v22 IPC on Windows accepts only `\\?\pipe\`/`\\.\pipe\` paths (Node `doc/api/net.md`); a filesystem `.sock` bind is invalid. The repository already has the correct idiom (`posixOnly`/`windowsOnly` in `g3_no_network_listener.test.ts`). The Round-6 real-socket test lacked that guard. It is **not reintroduced**; the only real bind in the framing suite is the host-adaptive endpoint (named pipe on Windows, AF_UNIX on POSIX), and a `windowsOnly` named-pipe test already exists in the no-network-listener suite.
4. **Database-path singleton conflict — test lifecycle defect.** `openDatabase` is a process singleton that throws on a second distinct path. The Round-6 second describe opened another database while the first handle lived. Round-7 adds no new describe, no new database path and no new listener process; the single flush-guard describe keeps one `before`/`after` pair with `closeDatabase()`.
5. **Non-termination and the silent canonical runner — runner semantics, not a product hang alone.** `scripts/run-tests.mjs` uses `spawnSync` with piped stdio (no output until the child exits) and Node `node:test` defaults test timeout to `Infinity`. The write-only design left connections waiting on the 5 s watchdog/client teardown and `server.close()` waiting on those connections, which the diagnostic's injected 30 s/60 s limits converted into "failures/cancellations". With end()-based delivery the server's own shutdown deterministically forces the pipe break, so every connection closes and every suite terminates (measured below).

### Remaining hypothesis (cannot be closed on Linux)

- Whether the +25 ms second frame physically reaches the Node process before libuv's 50 ms forced break on a native Windows pipe. Primary-source analysis (libuv `win/pipe.c`, Node `net.js`) says reads stay live and buffered bytes survive cancellation inside that window, and the early-armed watchdog now guarantees a listener for the entire window — but only a native run of the host-adaptive real-socket test can confirm `MALFORMED_FRAME` is recorded. If the forced break still wins, that is a transport impossibility to be recorded honestly, not relabeled.

## 3. Implementation (commit `7563d54`, two in-manifest files)

`src/ipc/dispatch.ts`:

1. `attachPostFlushWatch(socket)` now returns a `PostFlushWatch { arm(), isArmed(), cleanup() }` controller. Listeners attach when the connection handler starts (flush-guard only) but stay **unarmed**: pre-response bytes remain exclusively owned by the reader guard, preserving the zero-byte Class P pre-flush refusal.
2. `writeGuarded` calls `postFlushWatch.arm()` **synchronously before** the ordered `endFrame(socket, frame)` shutdown. The named `data` listener is therefore live for the whole libuv post-shutdown read window — no listener gap, no dependence on the late `end()` callback, no `readableEnded` gate. An armed trailing frame is recorded `MALFORMED_FRAME` and the socket destroyed; it is never dispatched and never earns a second response.
3. Terminal `end`/`close`/`error` remain cleanup-only and record nothing. `finally` calls `reader.release()` and, only when the watchdog never armed (pre-write refusal that did not already destroy the socket), reclaims its listeners. An armed watchdog self-cleans on the first terminal event; the caller-owned socket error handler is preserved.
4. **Both settlement policies keep `socket.end(frame)`** (ordered write-then-shutdown). No write-only response path exists. No new timer was introduced: the server shutdown itself supplies the deterministic break, so close-driven clients terminate. The AF_UNIX `half-close-required` branch is byte-for-byte unchanged (no watchdog created).

`tests/g3_ipc_framing.test.ts` (30 → 33 tests; no existing assertion altered, weakened, skipped, relabeled or deleted):

- `FakeSocket` gains an opt-in `{ shutdownEofMs }` Windows-pipe model (`end()` arms a forced EOF/close timer, unref'd; `peerSend()` delivers a `data` event only before the break, then returns false), plus `endCalled`/`writeCalled` counters. Default construction is unchanged, so all 30 prior tests keep their semantics.
- Three new tests, all explicitly labeled **Windows-transport emulation (not native evidence)**: (a) flush-guard delivery is `end()`-based with zero bare `write()` calls, and AF_UNIX delivery remains `end()`-based; (b) a second frame delivered inside the post-end shutdown window is observed by the early-armed watchdog — one response, `MALFORMED_FRAME`, teardown; (c) a forced break with no trailing frame leaves the sink empty and reaps every watchdog listener (deterministic cleanup/termination regression).
- The host-adaptive real endpoint test (real `net.Socket`; named pipe on Windows, AF_UNIX on POSIX) remains the native-coverage candidate; no unconditional `.sock` bind exists anywhere in the suite.

## 4. Invariant preservation

C7 caller-authority refusals and the full refused-key scan are untouched; W-1 write operations still return `WRITE_NOT_AUTHORIZED` before any mutation with no environment override; one request/one response per connection is enforced in both the pre-flush (zero-byte) and post-flush (sink record + teardown) intervals; malformed/oversize/version/unknown frames keep Class P zero-byte semantics; the 64 KiB/256 KiB caps, envelope whitelist, C7 depth scan and closed operation set are unchanged; named-listener cleanup only (never `removeAllListeners`); no TCP/HTTP/URL listener; no dependency, lockfile, package script or manifest change. The IRR 503 fence and the IRR reference client were not modified.

## 5. Validation in Arena's environment (Linux; not native Windows)

Commands and measured results, every run bounded with `timeout` and checked for process exit:

| Validation | Command | Result | Termination |
|---|---|---|---|
| Type checking | `npx tsc --noEmit` | exit 0 | — |
| Build (tsc + vite) | `npm run build` | exit 0, `✓ built in 389ms` | exits |
| IPC framing | `node --test dist/tests/g3_ipc_framing.test.js` | **33 tests, 33 pass, 0 fail, 0 skip** | exit 0, ~0.74 s |
| Binding resolution | same runner, single file | 10/10 pass | exit 0, 155 ms |
| Caller authority | same | **103/103 pass** | exit 0, 191 ms |
| Portfolio-read isolation | same | 6/6 pass | exit 0, 142 ms |
| Write gate | same | 9/9 pass | exit 0, 147 ms |
| Startup validation | same | 20/20 pass | exit 0, 189 ms |
| No-network listener | same | 10 pass + 1 POSIX-only skip | exit 0, 90 ms |
| Durability vocabulary | same | 6/6 pass | exit 0, 101 ms |
| **Canonical full suite** | `timeout 300 npm test` | **754 tests, 753 pass, 0 fail, 0 cancelled, 1 skip; guard exit 0** | **12.6 s wall, clean process exit** |

Totals reconcile exactly: baseline 751/750 + 3 new tests = 754/753; the single skip is the pre-existing POSIX-only mode-bit test. No injected per-test timeout was needed or used; no suite hung, timed out or was cancelled. Raw logs and both transfer patches with SHA-256 checksums are in `docs/integration/2026-10-21/evidence/` (`SHA256SUMS.txt`).

Transfer integrity independently re-verified: (i) `git am` of the full-lineage mailbox patch on a fresh worktree at `be32d8c9` yields a tree **hash-identical to `7563d54^{tree}`**; (ii) the incremental `3eb13ed..7563d54` patch `git apply --check --whitespace=error-all`s on `3eb13ed` and produces blob hashes identical to the `7563d54` blobs for both files.

## 6. Publication and remote verification

- IPD push attempted and refused exactly as in every prior round: `remote: Permission to ramkivs/iips-production-market-data.git denied to ramkivs.` / `error: 403` / exit 128. A post-attempt API read confirms the remote branch head is still `3eb13ed`; no fork, mirror or permission change was attempted.
- Durable preservation (the IRR workspace survives the environment resets that repeatedly destroyed `/home/user/iipd-work` and `/home/user/artifacts`): this packet plus `g3-round7-correction-3eb13ed-to-7563d54.patch`, `g3-round7-full-lineage-be32d8c9-to-7563d54.mbox.patch`, all nine validation logs and `SHA256SUMS.txt` are committed to the IRR session branch `arena/ddcb69ba-iips-review-recovered` and pushed; the remote branch SHA is verified after push. An authorized IPD pusher can apply either patch to publish `7563d54`-equivalent content.
- The unreliability of non-repository storage is the reason no claim rests on `/home/user/artifacts` this round.

## 7. Native-Windows handoff (user-run; Arena cannot execute these)

On `G:\IIPS-IPD-R6-WINDOWS-VALIDATION-20261020-192257` (or a clean clone), after an authorized pusher applies the Round-7 patch:

```powershell
git -C G:\IIPS-IPD-R6-WINDOWS-VALIDATION-20261020-192257 rev-parse HEAD
npm ci --no-audit --no-fund
npx tsc --noEmit
npm run build
node --test --test-reporter=spec dist\tests\g3_ipc_framing.test.js
node --test --test-reporter=spec dist\tests\g3_binding_resolution.test.js
node --test --test-reporter=spec dist\tests\g3_caller_authority.test.js
node --test --test-reporter=spec dist\tests\g3_portfolio_read_isolation.test.js
node --test --test-reporter=spec dist\tests\g3_write_gate.test.js
npm test
```

Expected outcomes if the correction holds natively: each focused file exits 0 with no empty-response or `ERR_BUFFER_OUT_OF_BOUNDS` failures and the process returns to the prompt promptly (no watchdog timeout); framing reports 33 tests with the host-adaptive real-socket test taking its Windows named-pipe branch and recording `MALFORMED_FRAME` for the second frame (the decisive native datapoint); `npm test` completes with 754 tests, 753 pass, 0 fail and the platform skips reported by the runner. Record the exact totals, Node version, wall time and any non-termination. A failure must be captured verbatim — the failing test stays intact and gets another correction; it is never weakened or skipped.

## 8. Governance and outstanding blockers

1. **Native-Windows evidence** for `7563d54`-equivalent content — required; cannot be produced in Arena. Blocking Gate 3 acceptance.
2. **IPD publication** — requires an authorized pusher (integration token remains 403).
3. **Formal `ci.yml` amendment/decision** — unchanged prerequisite for a manifest-conformant Windows CI leg.
4. **PR #34 merge** — no merge authority exists in the act or the PR description; not attempted.
5. Gate 3 NOT ACCEPTED; no Gate 4/QE, result-acceptance, Gate 5, 503 lift, `durable:true` or production claim; CV-52 BLOCKED. The authoritative external tracker is reconciled at the level this repository supports (this packet series); no tracker document was edited without authority.
