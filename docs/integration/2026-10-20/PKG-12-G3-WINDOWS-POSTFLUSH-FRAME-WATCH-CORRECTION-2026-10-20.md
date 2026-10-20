# PKG-12 — Gate 3 Native-Windows Post-Flush Frame Watch Correction (2026-10-20)

| Field | Value |
|---|---|
| Packet | PKG-12 (successor record to PKG-11) |
| Date | 2026-10-20 (Asia/Calcutta) |
| Subject | Diagnose and correct the single remaining native-Windows IPD Gate 3 failure: a second frame delivered in a separate write/event after the response flush produced an empty diagnostic sink (`undefined` reason) instead of the required `MALFORMED_FRAME`; deliver a complete checksum-verified replacement patch rooted at the authorized parent |
| Implementation repository | IPD (`ramkivs/iips-production-market-data` working clone) |
| Target branch | `g3/gate3-node-sqlite-ipc-correction-d30003d` (local only; IPD write remains credential-blocked, HTTP 403, exit 128 — exact response captured) |
| Authorized root parent | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` (unchanged) |
| Arena local commit | `c7dab9f506bd603b69853ad443dbd41c7da0c426` (reconstructed Gate 3 manifest with this correction folded in; a clean-worktree `git am` of the distributed patch re-hashed it to `3db9ddf`; no SHA here exists on any remote and none must be cited as published) |
| Artifact set | `g3-ipd-postflush-20261020` (new dated set; fresh checksums; the `wincorr`/`14e2f5a`/`af04df1`/`1477bd3` sets are superseded and were destroyed by a second environment reset) |
| Arena environment | Linux, Node `v22.22.3`, npm `10.9.8`; target user environment remains native Windows, Node `v22.22.0`, npm `10.9.4` |
| Native-Windows acceptance | **NOT VERIFIED** — no new real windows-latest/native run exists for this set; Linux evidence and labeled transport emulation are never presented as native evidence |
| Status | Root cause established from primary sources; smallest invariant-preserving correction implemented; 756 tests, 755 pass, 0 fail, 1 intentional platform skip, guarded exit 0; clean-worktree `git am` re-validated identically; IPD publication still 403; Gate 3 decision unchanged (no advancement, no merge, no production activation) |

---

## 0. Provenance: second reset, single commit, spec-derived reconstruction

A second environment reset destroyed the IPD worktree and the `wincorr`
artifact set (validated patch SHA-256
`74c3e5fe1411825403b9bf82a8cade9cbbe46b5b7a768830aea4fcf882e5b9e6`). The IPD
credential is read-only, so no remote copy existed. The 23-path Gate 3
manifest was re-authored from PKG-07..PKG-11 onto `be32d8c9`, and the
post-flush correction documented here is folded into the one reviewable
commit `c7dab9f`. The reconstruction is spec-derived, not byte-identical to
any destroyed commit. Reconstruction defects found while re-establishing
green, all fixed and retained under test:

1. `src/persistence/connection.ts` — `openDatabase` now creates the operator
   state directory owner-only (`mkdirSync(..., { recursive: true, mode: 0o700 })`)
   before opening `ipd.db`; an existing directory is never chmod-repaired
   (the endpoint layer validates it).
2. `src/persistence/migrations/002_audit_event_sequence.ts` — removed the
   self-referential `FOREIGN KEY (prev_hash) REFERENCES audit_events
   (record_hash)`: the target column is not a unique/PK column, so SQLite
   raised "foreign key mismatch" on every audit write. The hash chain
   remains application-enforced (`appendAuditEvent`/`verifyAuditChain`).
3. `src/persistence/migration_ledger.ts` and `src/ipc/entrypoint.ts` — the
   ledger is `WITHOUT ROWID`; ordering now uses the zero-padded
   `migration_id` lexical/application order instead of `ORDER BY rowid`.
4. `src/ipc/entrypoint.ts` — the database path is validated with host-native
   `path.isAbsolute` rather than the injected endpoint platform, because the
   DB lives on the host filesystem even when the endpoint simulates a win32
   pipe (keeps the simulated-pipe tests honest; production behavior
   unchanged).

## 1. The native-Windows evidence being corrected

Authoritative user-run evidence against the destroyed `wincorr` patch on a
native Windows host (checkout
`G:\IIPS-IPD-GATE3-WINCORR-20261020-112600`): 751 tests, 746 pass, 1 fail,
4 skips; the failure was

> `a second frame delivered in a separate write/event is refused over a real
> socket` — expected `MALFORMED_FRAME`, actual `undefined`
> (`dist/tests/g3_ipc_framing.test.js:312:16`).

Exactly one ~85-byte response was delivered, so the framing logic worked;
the failure was observability of the post-response violation: the bounded
diagnostic sink held no record. The four skips are platform-conditional,
not failures. No further user-run diagnostics were requested or used: this
packet is source-derived.

## 2. Root cause established from primary sources (transport cannot be blamed)

The trace this round used libuv v1.51.0 (the version bundled in Node
v22.22.0) and Node v22.22.0 primary sources plus Win32 API documentation:

- Node `Socket.prototype.end` → `_final` (`lib/net.js`) →
  `handle.shutdown()` → `LibuvStreamWrap::DoShutdown`
  (`src/stream_wrap.cc`) → `uv_shutdown`. There is **no `readStop`**; the
  handle is not destroyed while the readable side is open, and
  `autoDestroy` waits for both sides to settle.
- libuv `src/win/pipe.c`: a byte-mode named pipe has no half-close
  primitive. `uv__pipe_shutdown` issues `FlushFileBuffers` on a thread-pool
  request; on a duplex (readable) connection
  `uv__process_pipe_shutdown_req` arms a fixed **50 ms eof timer**
  (`static const int64_t eof_timeout = 50;`). When it fires,
  `eof_timer_cb` runs `close_pipe()` (`CloseHandle`), `uv_read_stop` and
  reports `UV_EOF` — the server-side forced break. Buffered bytes are not
  cancelled.
- Win32 named-pipe operation ordering (`DisconnectNamedPipe`,
  `FlushFileBuffers`): after the server disconnect/close the client's later
  write fails `ERROR_NO_DATA`/`ERROR_BROKEN_PIPE`, and no server `ReadFile`
  can complete for it; disconnect discards unread data.
- Corroborating engineering accounts document the same behavior: Windows
  named pipes have no half-close; `socket.end()` maps to the libuv pipe
  shutdown and later peer writes become EPIPE once the two-way teardown
  runs.

Consequence for the PKG-11 flush-guard dispatcher: the response was sent
with **`socket.end(frame)`**. On a Windows pipe that initiates
FlushFileBuffers → 50 ms eof timer → forced handle close. A second frame
written ~25 ms later can be transport-delivered *only* inside that
scheduling-dependent 50 ms window; once the break fires it is physically
undeliverable to the server's reader, so no userspace `'data'` event — and
no `MALFORMED_FRAME` record — is possible. The observed run landed outside
a usable window, hence the empty sink (`undefined`). The Linux emulation
fake used in earlier rounds did not model shutdown-induced closure (its
`end()` only queued bytes), which is exactly why Linux stayed green while
native Windows failed. Transport non-delivery *after the forced break* is
real; the defect is that the application deliberately forced the break
before its own post-flush watch could observe anything.

## 3. The correction (smallest change; invariant preserved, not weakened)

Production surface: `src/ipc/dispatch.ts` only.

1. **Flush-guard responses use `socket.write(frame, cb)`** — no `end()`.
   The pipe instance stays open and readable, so a late second frame is
   deterministically observable rather than racing a forced close. The
   writer's drain callback still gates the write-error teardown path.
2. **`attachPostFlushWatch`** attaches after the response flush only when
   `!socket.readableEnded`: one trailing `'data'` event records
   `MALFORMED_FRAME` ("a second frame delivered after the response flush is
   refused; the frame is never dispatched") and destroys the socket;
   terminal `'end'`/`'close'`/`'error'` tear the bounded listener set down
   via a single `detach()` (named listeners only — no
   `removeAllListeners`, preserving caller-owned listeners).
3. **Bounded lifecycle without a half-close**: a well-behaved reference
   client disconnects and the server teardown fires; a silent peer is
   reclaimed by an unref'd idle timer (`IDLE_TIMEOUT`), also through
   `detach()`. No pipe instance can leak and no timer outlives the socket.
4. **AF_UNIX `half-close-required` is byte-for-byte unchanged**: it still
   awaits the clean client FIN and then writes with `socket.end()`; the
   POSIX zero-byte contract and all existing tests are untouched.
5. The pre-flush/coalesced guard is unchanged: the frame reader refuses a
   second frame before any response, the response write is raced against
   the guard trip and a guard trip destroys the socket so the pending
   write never lands — zero bytes, `MALFORMED_FRAME`, every time.

The frozen IRR reference-client contract
(`frontend/server/user-portfolio/ipcClient.ts`: one frame, one response,
then close) is unchanged. No test is skipped, deleted, genericized or
weakened; the unconditional cross-platform zero-byte assertion for a
response already flushed is **not** restored (it was never correct on a
pipe where one response has physically left the process).

## 4. Regression design: labeled emulation plus a real-socket green

`tests/g3_ipc_framing.test.ts` (34 tests; the destroyed set had 30).

- The `FakeSocket` now models the libuv byte-mode pipe lifecycle
  faithfully and is labeled "Windows named-pipe transport emulation" in
  every suite/comment: `end()` arms a forced EOF timer after which
  `peerSend` returns false and writes surface EPIPE; `write()` does not
  arm that timer and the server stays observable. This is deterministic
  harness behavior, never presented as native evidence.
- Four Round-6 regressions: (a) a defect pin proving the old `end()`
  design leaves the post-break frame undeliverable and the sink empty —
  the exact native symptom; (b) a transport-selection pin
  (`write()`-not-`end()` under flush-guard, `end()` under half-close);
  (c) the write-based handler observing a late frame before any EOF with
  `MALFORMED_FRAME`; (d) idle-timer reclamation of a silent peer.
- The real-socket separate-write test now asserts the behavior the design
  can actually guarantee on either OS: exactly one response, frame 2 never
  dispatched, and a `MALFORMED_FRAME` record. On a POSIX host the
  zero-byte pre-flush variants remain exact zero-byte assertions.
- `tests/g3_no_network_listener.test.ts` (12 tests; was 11) adds a native
  `windowsOnly` named-pipe test that skips on POSIX and runs for real on
  the windows-latest CI leg.
- A standalone real-`net.Socket` AF_UNIX probe (flush-guard policy, frame 2
  at +25 ms) returned: one 85-byte response,
  `sink reason MALFORMED_FRAME`, connection closed — the corrected code
  path works on a genuine Node socket, not only on the fake.

CI: `.github/workflows/ci.yml` now runs the typecheck/build/guarded-test
job on a matrix `[ubuntu-latest, windows-latest]` (`fail-fast: false`,
bash shell, Ubuntu-only check-run publish to avoid duplicate names). A
real windows-latest run of this workflow is the only authoritative native
acceptance for this packet.

## 5. Exact Linux results (evidence class A)

Node `v22.22.3`, npm `10.9.8`, Arena Linux sandbox.

```
npx tsc --noEmit                       exit 0
rm -rf dist && npm run build           exit 0
npm test
  [test-guard] files=57 (source suite files: 57)
  # tests 756
  # pass 755
  # fail 0
  # cancelled 0
  # skipped 1
  [test-guard] OK — 756 test(s) executed, 755 passed, exit 0
```

Gate 3 per-suite: startup 20/20; no-network 12 (11 pass, 1 intentional
native-pipe skip on POSIX); framing 34/34; write-gate 9/9;
caller-authority 103/103; binding 10/10; read-isolation 6/6;
durability 6/6. Gate 3 total 200 tests (199 pass, 1 skip) on top of the
unchanged 556-test baseline (556 + 200 = 756). A clean worktree created
at `be32d8c9`, `git am --whitespace=error-all` of the distributed patch,
then tsc/build/`npm test` reproduced the identical result
(756/755/0/1, guard exit 0).

## 6. Invariants and boundaries preserved

Zero-byte Class P refusals; W-1 `WRITE_NOT_AUTHORIZED` with zero row delta
and no environment override; caller-owned listeners and named-listener
cleanup; Node `<22.13.0` guard before any file open; 64 KiB request /
256 KiB response caps; envelope whitelist (`v`, `op`, `payload`,
`requestId`); C7 deep key scan (34 keys × 3 depths = 102 refusals plus a
clean control, with `REFUSED_WIRE_KEYS`/`CALLER_SUPPLIED_IDENTITY_KEYS`
parity); closed op set with reserved `portfolio.analytics`; Gate A′
private-brand provisioning refusal before any SQL plus the static
no-import-edge regression; string-path AF_UNIX/pipe listeners only, never
TCP; hash-chained audit; checksummed, tamper-refusing migration ledger;
provisioning isolation. Gate 4 items (DACL/SDDL, second account, SMB,
lifecycle, real-pipe zero-byte) remain out of scope and unclaimed. The
disclosed entrypoint fail-path database-handle leak remains unchanged
(process-local singleton, reclaimed at exit).

## 7. Publication blocker (exact response) and decision

```
$ git push origin g3/gate3-node-sqlite-ipc-correction-d30003d
remote: Permission to ramkivs/iips-production-market-data.git denied to ramkivs.
fatal: unable to access 'https://github.com/ramkivs/iips-production-market-data.git/':
       The requested URL returned error: 403
push exit: 128
```

Read APIs remain usable; the token has no write grant. No fork, mirror or
permission change is attempted; Arena preview is not authoritative
publication. The durable commit exists locally (`c7dab9f`) and the
checksum-verified mailbox patch in artifact set
`g3-ipd-postflush-20261020` is the transfer mechanism. Gate 3 is **not**
advanced, merged or activated; its decision stays open pending a real
windows-latest/native run whose authoritative result must be recorded as
PASS or FAIL — emulation and Linux results can never supply that status.

## 8. Preview distribution (not authoritative publication)

The reset destroyed the PKG-11 preview process and its served directory
(`/g3-ipd-wincorr-20261020/`, port 8731). The preview was repaired and
resumed: a dependency-free read-only Node static server
(`artifacts/preview-server.mjs`, GET/HEAD only, root containment guard,
`x-content-type-options: nosniff`) serves `/home/user/artifacts` on
`0.0.0.0:8731` and is reachable through the Arena preview proxy. The
served set is the current `g3-ipd-postflush-20261020/` (the superseded
`wincorr` directory no longer exists and must not be linked).

A download-and-`sha256sum -c` round trip through the preview server
returned eight `OK` lines for every file listed in `SHA256SUMS.txt`, plus
`SHA256SUMS.txt: OK` against `SHA256SUMS.self.txt`; traversal sequences
return 404 with no path escaping the artifacts root, non-GET methods
return 405, and unknown paths return 404. This convenience distribution
does not alter publication status: IPD remains 403-blocked and the
mailbox patch plus this packet remain the authoritative transfer
mechanisms.
