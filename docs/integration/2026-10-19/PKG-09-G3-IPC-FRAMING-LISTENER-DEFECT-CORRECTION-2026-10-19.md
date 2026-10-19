# PKG-09 — Gate 3 IPC Framing/Listener-Ownership Defect Correction (2026-10-19)

| Field | Value |
|---|---|
| Packet | PKG-09 (successor record to PKG-08) |
| Date | 2026-10-19 (UTC) |
| Subject | Correct two IPC defects in the Gate 3 patch (`1477bd3`): (A) one-request-per-connection framing was enforced only within a single buffered chunk, so a second frame in a later stream event was silently ignored while a success response could still be written; (B) `socket.removeAllListeners()` wiped caller-owned error handlers, making post-cleanup transport errors throw as unhandled `error` events |
| Implementation repository | `ramkivs/iips-production-market-data` (IPD) |
| Target branch | `g3/gate3-node-sqlite-ipc-correction-d30003d` (local only; IPD write remains credential-blocked) |
| Authorized root parent | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` (unchanged; still an ancestor of current IPD `main`) |
| Superseded local commit | `1477bd3` (PKG-08 delivery; artifacts retained but removed from the served preview set) |
| New Arena local commit | `af04df1a21958f6a42dfb8f00ce8af05f17b28c1` (parent `1477bd3`; complete correction vs `be32d8c9` = same 23 files, 4248 insertions / 4 deletions) |
| Arena environment | Linux, Node `v22.22.3`, npm `10.9.8`; target user environment remains native Windows, Node `v22.22.0`, npm `10.9.4` |
| Status | Corrected, 740/740 tests accounted for (739 pass, 0 fail, 1 intentional platform skip), red-on-old/green-on-new demonstrated; preview artifacts checksum-verified; IPD publication still blocked by read-only integration token (403); no native-Windows run claimed |

---

## 1. Defect evidence (before the fix)

Both defects were demonstrated against the compiled `1477bd3` distribution with
deterministic `EventEmitter` fake sockets. A real AF_UNIX loopback coalesces two
immediate `write()` calls into one `data` event, so it cannot exercise the
separate-event path; the fake socket makes event ordering explicit and was used
only as a test double for the socket's EventEmitter surface.

### 1.1 Defect A — framing/pipelining across stream events

`readSingleFrame` resolved its promise and detached all listeners as soon as one
complete frame parsed. Frame 2 arriving in a *later* `data` event therefore had
no listener: it was silently ignored, and the dispatcher remained free to write a
success response. The one-request-per-connection contract (T-2) held only when
both frames happened to land in the same buffered chunk (where
`parseSingleFrame` rejects trailing bytes). Observed on the defective build:

```
DEFECT PRESENT (A): separate-event second frame ignored, success response writable
```

### 1.2 Defect B — listener ownership

Cleanup called `socket.removeAllListeners()`, which removed not only the
reader's own listeners but also the dispatcher's caller-owned `socket.on('error')`
handler. After cleanup, emitting an `error` found zero listeners and threw as an
unhandled `error` event — a process-crash path — and the caller's handler never
ran. Observed on the defective build:

```
DEFECT PRESENT (B): caller error listener removed; error becomes unhandled
```

## 2. Correction design

### 2.1 FrameReader handle and guard phase (Defect A)

`readSingleFrame(socket, idleTimeoutMs?)` now returns a `FrameReader`:

```ts
interface FrameReader {
  readonly envelope: RequestEnvelope;
  readonly whenSettled: Promise<void>;
  release(): void;
}
```

The reader runs three phases — `reading → guarding → done`:

- **reading**: bytes are buffered across arbitrary chunk boundaries (write
  boundaries never need to map to chunks); oversize, truncated, malformed and
  premature-close faults reject the reader promise with the existing Class P
  reasons.
- **guarding**: entered immediately after one complete, alone-in-the-buffer
  frame parses. The reader stays attached. A clean peer half-close with no
  trailing data resolves `whenSettled`; any further `data` byte — a whole second
  frame, a partial length prefix or stray trailing data — rejects
  `whenSettled` with `MALFORMED_FRAME`; a transport error rejects with
  `MALFORMED_FRAME`; expiry without a half-close rejects with `IDLE_TIMEOUT`.
- **done**: terminal; all events become no-ops and the timer is cleared.

The dispatcher writes nothing until `whenSettled` resolves, so a pipelined peer
can never receive a successful response; a settle rejection is the existing
zero-byte Class P refusal (`socket.destroy()`, reason only in the bounded
diagnostic sink).

### 2.2 Explicitly specified edge case (no protocol invention)

A peer that sends one valid frame but never half-closes receives no response and
is refused with `IDLE_TIMEOUT` once the idle deadline passes (5000 ms production
default; 2000 ms in tests). The accepted IRR reference client always
half-closes after its single request frame. This was previously implicit; it is
now a documented, tested rule. No other wire behavior changed — envelope keys,
64 KiB / 256 KiB caps, the seven closed operations plus reserved
`portfolio.analytics`, and Class P zero-byte semantics are untouched.

### 2.3 Named-listener ownership (Defect B)

The reader registers three named listeners (`onData`, `onEnd`, `onError`) and
removes only those via `socket.off(...)` in a single `detach()` used by every
exit path. No `removeAllListeners` call remains in production source (the only
textual occurrence is an explanatory comment). `release()` is idempotent and
runs in the dispatcher's `finally` on success, C7 refusal, binding refusal,
settle refusal and Class A errors alike. The dispatcher's own
`socket.on('error')` handler is caller-owned and stays attached through response
transmission. A defensive `.catch` on the internal settle promise prevents
unhandled rejections when an early Class P destroy releases the reader without
awaiting settlement.

### 2.4 `allowHalfOpen: true` (consequence of the gate)

The production server now creates sockets with `{ allowHalfOpen: true }`. With
Node's default (`false`), the client's half-close FIN auto-ends the server's
writable side, so the response write — now correctly deferred until after the
clean half-close is observed — failed with "write after end" and zero bytes
reached the client. Half-open mode keeps the writable side under explicit server
control; the guard-phase idle timeout still closes peers that never
half-close, so no lingering-connection path is opened. The injected test
`serverFactory` (EADDRINUSE seam, no data flow) is unchanged.

## 3. Files changed (5 of the 23 manifest paths)

| File | Change |
|---|---|
| `src/ipc/protocol.ts` | FrameReader API; reading/guarding/done phases; named-listener ownership; guard IDLE_TIMEOUT; defensive settle-promise catch |
| `src/ipc/dispatch.ts` | Awaits `whenSettled` before any wire write; Class P refusal on settle rejection; `finally release()` on every path |
| `src/ipc/endpoint.ts` | `createServer({ allowHalfOpen: true })` with rationale comment |
| `tests/g3_ipc_framing.test.ts` | One real-socket separate-write regression (macrotask gap) plus a new 7-test deterministic fake-socket suite |
| `tests/g3_no_network_listener.test.ts` | Direct frame-reader handler migrated to `whenSettled`/`release` |

The other 18 manifest paths (persistence, migrations, CI matrix, remaining g3
suites and entry point) are byte-identical to the PKG-08 delivery. The Windows
CI matrix (`ubuntu-latest` + `windows-latest`, bash shell, Ubuntu-only check-run
publish) is retained unchanged.

## 4. Regression inventory (8 new tests; 732 → 740)

Real socket (`g3 / T-A ipc framing`):

1. Frame 1 written, macrotask gap, frame 2 in a separate write → zero response
   bytes, `MALFORMED_FRAME` in the local diagnostic sink.

Deterministic fake socket (`g3 / T-A frame reader internals (deterministic
event ordering)`):

2. Separate-event second frame rejects `whenSettled` (`MALFORMED_FRAME`).
3. Partial trailing bytes after the complete frame reject.
4. A single frame delivered byte-at-a-time, then half-close, settles cleanly
   (legitimate chunk-boundary behavior preserved).
5. Guard-phase `IDLE_TIMEOUT` when the peer never half-closes.
6. `release()` removes only reader listeners (exact counts while guarding and
   after release); a post-release `error` reaches the caller handler without
   throwing.
7. A transport error after frame parse rejects `whenSettled`, the caller
   handler still fires, and zero bytes are written.
8. `release()` is idempotent and leaves no reader listeners behind.

## 5. Validation evidence (Arena Linux, exact commands and results)

```
npx tsc --noEmit ............................................... exit 0
rm -rf dist && npm run build (tsc && vite build) ............... exit 0
```

Targeted suites (`node --test --test-timeout=30000 dist/tests/<suite>.test.js`):

| Suite | Tests | Pass | Fail | Skip |
|---|---|---|---|---|
| g3_ipc_framing | 20 | 20 | 0 | 0 |
| g3_no_network_listener | 11 | 10 | 0 | 1* |
| g3_caller_authority | 103 | 103 | 0 | 0 |
| g3_binding_resolution | 10 | 10 | 0 | 0 |
| g3_portfolio_read_isolation | 6 | 6 | 0 | 0 |
| g3_startup_validation | 19 | 19 | 0 | 0 |
| g3_write_gate | 9 | 9 | 0 | 0 |
| g3_durability_vocabulary | 6 | 6 | 0 | 0 |

\*The same intentional Linux skip as PKG-08: "the Windows endpoint is a named
pipe with no filesystem artifact" — meaningful only on a native win32 host.

Full guarded run:

```
npm test
[test-guard] files=57 (source suite files: 57)
# tests 740   # suites 93   # pass 739   # fail 0
# cancelled 0 # skipped 1   # todo 0
[test-guard] OK — 740 test(s) executed, 739 passed, exit 0
```

Baseline change explanation: +8 tests (framing suite 12 → 20; suites 92 → 93),
no production feature change beyond the two defect corrections and the
half-open server option. No assertion weakened, no test suppressed.

### 5.1 Red-on-old / green-on-new

- Red: the defective `1477bd3` sources were restored and rebuilt; an old-API
  behavioral probe reproduced both defects deterministically (quoted in §1).
  The new test files cannot compile against the old sources (they reference the
  new `FrameReader` API), which is why the red run uses an old-API probe rather
  than the new suite — a deliberate, documented limitation, not a skipped
  check.
- Green: restored `af04df1`, rebuilt; framing 20/20 and the full suite
  739/0/1. A second fixed-build probe confirmed separate-event rejection,
  chunk-split acceptance, named-listener cleanup and caller-handler survival
  directly.

## 6. Artifacts, checksums and preview distribution

Served from the Arena preview (zero-dependency path-traversal-guarded server,
`0.0.0.0:8137`; browser-facing host
`https://8137-i5odx2thpcdlqz2zfo10y.e2b.app`):

| File | SHA-256 |
|---|---|
| `g3-windows-correction-af04df1.patch` | `30a1f31e33a6adcbe629cdc4cb694daf780768c698c0bb80c1ae5cbece89892d` |
| `g3-windows-manifest-af04df1.tar.gz` | `7d2099efc16fc79a10e7e66631c90cf175af863845d3e728ae98579b1f0ba2ca` |
| `VERIFICATION.txt` | `1b6544aa74f57e649c5b1979e0779996bd3178c5f6f610bf228fac0462a9a89c` |

Download URLs (attachment routes):

- `https://8137-i5odx2thpcdlqz2zfo10y.e2b.app/g3-windows-correction-af04df1.patch?download=1`
- `https://8137-i5odx2thpcdlqz2zfo10y.e2b.app/g3-windows-manifest-af04df1.tar.gz?download=1`
- `https://8137-i5odx2thpcdlqz2zfo10y.e2b.app/VERIFICATION.txt?download=1`
- `https://8137-i5odx2thpcdlqz2zfo10y.e2b.app/SHA256SUMS.txt?download=1`

Integrity proofs performed inside the sandbox over the loopback listener:

- `git format-patch be32d8c9..af04df1` patch applied with
  `git am --whitespace=error` onto a pristine `be32d8c9` worktree → exit 0,
  and `git diff --quiet af04df1 HEAD` confirmed the resulting tree is
  byte-identical to `af04df1`.
- Tarball extracted and diffed per file against the commit tree: all 23 paths
  byte-identical; `gzip -t` clean.
- Every served file re-downloaded over HTTP and verified with
  `sha256sum -c SHA256SUMS.txt` → all OK; correct `Content-Type` and
  `Content-Disposition: attachment` headers.
- The superseded `1477bd3` filenames now return 404 (old artifacts moved
  outside the served root; their checksum `38860325…c870d` is not reused);
  path-traversal probes (`..%2f…`, encoded dot segments) return 404.

Note: the public preview proxy terminates TLS browser-side; an in-sandbox
curl to the public hostname completes TCP/TLS-SNI setup but the handshake is
not accepted for sandbox-origin traffic, so byte verification was executed
against the loopback listener that the proxy fronts.

## 7. Publication state (re-verified this delivery)

- `git push origin g3/gate3-node-sqlite-ipc-correction-d30003d` →
  `remote: Permission to ramkivs/iips-production-market-data.git denied to
  ramkivs.` / HTTP 403, exit 128.
- `gh api -X POST repos/.../git/refs` for the branch at `af04df1` →
  HTTP 403 `Resource not accessible by integration`; subsequent branch lookup
  → 404, confirming no remote ref exists.
- No fork, mirror, permission change or unrelated-repo publication was
  attempted. Preview distribution is not repository publication.
- Remote observation: IPD `main` advanced beyond `be32d8c9` through unrelated
  PRs #25–#29 (D05 Security Master / governance; head `29b8351`). `be32d8c9`
  remains an ancestor, so the authorized parent is still valid. No rebase was
  performed — the Gate 3 scope and parent were frozen by instruction; a
  rebase decision belongs to the operator at publication time.

## 8. Boundaries observed

- No gate merged or advanced; Gate 4 items remain unverified and out of scope:
  DACL/SDDL inspection, second-account denial, SMB reachability, pipe
  collision/clean-shutdown lifecycle, real-pipe zero-byte behavior.
- No native-Windows result is claimed; only a real `windows-latest` / native
  Windows run against `af04df1` can supply that evidence.
- All standing security invariants retained: W-1 writes refused
  `WRITE_NOT_AUTHORIZED` with zero-row delta and no env override; Class P
  zero-byte refusals; Node `<22.13.0` guard; provisioning mutators refuse
  pre-Gate-A′ and no `src/ipc/* → provisioning` import edge; no TCP/HTTP/URL
  listener; string-path AF_UNIX / named-pipe binding only.
