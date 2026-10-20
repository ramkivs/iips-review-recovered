# PKG-11 — Gate 3 Native-Windows Empty-Response & Post-Flush One-Frame Correction (2026-10-20)

| Field | Value |
|---|---|
| Packet | PKG-11 (successor record to PKG-10) |
| Date | 2026-10-20 (Asia/Calcutta) |
| Subject | Diagnose and correct the 11 native-Windows failures of the IPD Gate 3 `14e2f5a` correction: ten empty/short IPC responses across four live-socket suites and one 80-byte second-frame case; deliver a complete checksum-verified replacement patch rooted at the authorized parent |
| Implementation repository | IPD (`ramkivs/iips-production-market-data` working clone) |
| Target branch | `g3/gate3-node-sqlite-ipc-correction-d30003d` (local only; IPD write remains credential-blocked, HTTP 403) |
| Authorized root parent | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` (unchanged) |
| Arena local commits | `bb4ebe118a2cfbe4daa016a3bdf55d8eda4541e5` (reconstructed Gate 3 manifest, state equivalent to `14e2f5a`) and `9755ebebbd320335409e6fdf579fc3b8f7f6d238` (this correction). A clean-worktree `git am` of the distributed patch re-hashed them to `224062c`/`78d5b65`; no SHA here exists on any remote |
| Arena environment | Linux, Node `v22.22.3`, npm `10.9.8`; target user environment remains native Windows, Node `v22.22.0`, npm `10.9.4` |
| Status | Both demonstrated causes corrected on Linux; 751 tests, 750 pass, 0 fail, 1 intentional Linux skip, guarded exit 0; clean-worktree `git am` re-validated identically; **no native-Windows run claimed**; preview artifacts checksum-verified; IPD publication still 403; Gate 3 decision unchanged |

---

## 0. Provenance: why this is a replacement patch, not an incremental diff

The environment reset described in PKG-07 §10 destroyed the three local-only IPD
commits (`1477bd3`, `af04df1`, `14e2f5a`); the read-only IPD credential meant no
remote copy existed, and re-push probes returned 422. The Gate 3 manifest was
therefore re-authored from the frozen obligations in PKG-07..PKG-10 onto the
authorized parent `be32d8c9` as commit `bb4ebe1`, and this correction is the
distinct reviewable commit `9755ebe` on top. The reconstruction is
spec-derived, not byte-identical to the lost commits; Linux evidence below
validates the reconstructed tree and the new fixes only. Three reconstruction
defects were found and corrected while re-establishing green (all documented
in commit `bb4ebe1`'s tree and retained under test):

1. `src/ipc/protocol.ts` — envelope-level refused wire keys now classify as
   Class P `CALLER_SUPPLIED_AUTHORITY` before the generic unexpected-key
   `MALFORMED_FRAME` rule (34 top-level caller-authority cases).
2. `src/persistence/portfolio_store.ts` — the C7 key scan excludes `holdings`
   so legitimate holding domain fields (`identityStatus`,
   `resolutionDisposition`, `companyId`) are not rejected.
3. `src/persistence/portfolio_store.ts` — a portfolio row is born at
   `current_revision = 0`; the INITIAL revision moves 0→1 through the normal
   conflict-checked path.
4. One test-sequence correction in `g3_binding_resolution.test.ts` (revoke the
   prior ACTIVE membership before inserting a second, due to the partial-unique
   index; restore it afterwards).

## 1. The native-Windows evidence being explained

User-run native Windows, Node 22.22.0 / npm 10.9.4, HEAD `eda3a1c1…` built from
`be32d8c9` + the three-commit `14e2f5a` patch: **191 tests, 176 pass, 11 fail,
4 skip, exit 1**. Two distinct failure classes, not one cause:

| Class | Count | Suites | Symptom |
|---|---|---|---|
| A. Empty/short framed responses on real round trips | 10 | `g3_binding_resolution` (1), `g3_portfolio_read_isolation` (4), `g3_write_gate` (5); `g3_caller_authority` shares the mechanism | Expected framed response never arrives (zero or truncated bytes) |
| B. Second-frame response length | 1 | `g3_ipc_framing` | An ~80-byte single response instead of the asserted zero bytes when frame 2 is written 25 ms after frame 1 |

Startup validation (20/20), no-network-listener and pipe-namespace assertions
pass on Windows: persistence, migrations, endpoint selection and the
no-TCP/string-path rules are exonerated. The defect surface is response
delivery and settlement-policy propagation, plus the flush-race boundary.

## 2. Section A — settlement-policy selection and propagation trace

`entrypoint.startIpcServer` is the only production construction path:

```ts
const settlement = settlementPolicyForEndpoint(target);      // endpoint.ts
listenIpc(target, createConnectionHandler(db, { settlement }), …);
```

`settlementPolicyForEndpoint` returns `'flush-guard'` for
`windows-named-pipe` targets and `'half-close-required'` for `unix-socket`
targets. The dispatcher's default is deliberately conservative:

```ts
const settlement = options.settlement ?? 'half-close-required';
```

Four g3 suites do not use `startIpcServer`; they inject a handler into a test
server. At `14e2f5a` all four called `createConnectionHandler(db)` with no
options, so every Windows named-pipe connection in those suites ran the
AF_UNIX half-close policy. `g3_ipc_framing` alone built its live server with
an explicit endpoint-derived policy, which is why basic framing passed on
Windows while every real operation in the other suites failed. The
reconstruction commit `bb4ebe1` deliberately retained the bare construction
and a red emulation was captured against it (zero response bytes on the
Windows pipe timeline) before the correction was applied.

### 2.1 Section B — response write and socket lifecycle per operation

Under `half-close-required` the dispatcher `await`s `reader.whenSettled`
before any write. On a libuv Windows byte-mode named pipe the client
shutdown is `FlushFileBuffers` only; no FIN/half-close EOF is delivered.
The only server-visible `'end'` comes from libuv's 50 ms eof timer
force-breaking the pipe (`ERROR_BROKEN_PIPE → UV_EOF`), after which writes
fail with EPIPE. The settlement gate therefore opens at or after the break,
the single response write fails, `refuseClassP()` records the reason in the
bounded sink and destroys the socket — the peer receives zero bytes.

| Operation class | Intended response | Windows outcome under the defect |
|---|---|---|
| Successful read (`portfolio.list/get/revisions`) | one Class A success frame, then half-close | settlement never opens pre-break; write fails at the break → zero bytes |
| Read refusals (`BINDING_ABSENT/INVALID`, `RESOURCE_UNAVAILABLE`) | one typed Class A frame through the same guarded writer | same writer, same failure → zero bytes; the byte-identical `RESOURCE_UNAVAILABLE` proofs in read isolation could never be compared |
| `WRITE_NOT_AUTHORIZED` (W-1) | one Class A frame, zero row delta, no mutation | frame never delivered; the write gate itself still failed closed (no rows changed), only its observable response was lost |
| Binding resolution round trips | success frame proving the resolved owner | empty response; resolution still ran per-request from the database |

The correction restores `settlementPolicyForEndpoint(target)` at all four
direct construction sites, making every handler — production and harness —
select flush-guard on a pipe, under which the response is written immediately
and the guard races the write instead of gating it.

## 3. Section C — deterministic Linux emulations (labeled, not native evidence)

All emulations live in `tests/g3_ipc_framing.test.ts` inside the describe
block `flush-guard settlement (Windows named-pipe transport emulation)` and
use an `EventEmitter` fake whose timing models the documented libuv sequence
(`FlushFileBuffers`-only shutdown; `forceBrokenPipeEof()` = the 50 ms forced
break; queued writes fail EPIPE after the break). Four new emulations were
added by this correction; none is presented as native-Windows evidence:

1. **Default-policy starvation (defect pin):** a handler constructed without
   a policy withholds every response byte on the Windows timeline and fails
   closed with `MALFORMED_FRAME` + teardown. This test stays red against the
   old construction by design.
2. **Endpoint-derived delivery:** the same timeline with
   `settlementPolicyForEndpoint(pipeTarget)` delivers exactly one complete
   response; the test also pins policy derivation for both transport kinds.
3. **Post-flush second frame (Section E boundary):** frame 2 emitted only
   after the frame-1 response flushed → exactly one response, frame 2 never
   dispatched, `MALFORMED_FRAME` recorded, socket destroyed, watchdog
   listeners detached at terminal EOF.
4. **Clean post-flush EOF:** a well-behaved single-frame peer leaves the
   sink empty and the socket intact.

The pre-existing emulations (pre-flush and immediately-coalesced second
frames → zero bytes; transport error before flush → zero bytes, no throw;
harmless broken-pipe EOF after flush) continue to pass unchanged.

## 4. Section D — the 80-byte case: did frame 2 arrive before the irreversible flush?

Deterministic answer from the emulated byte-mode ordering, which the
native-Windows symptom corroborates: **frame 2 arrived after the response
write irreversibly flushed.** Frame 1 is parsed and the flush-guard response
is written immediately (there is no half-close to await); the ~76–80 byte
frame is queued to the pipe and its write callback completes within the
event-loop turn, while frame 2 is delivered by a separate client write 25 ms
later. What is guaranteeable on a Windows named pipe in this ordering:

- at most one response frame is ever emitted;
- frame 2 is never dispatched (the handler state machine is finished);
- the violation is recorded as `MALFORMED_FRAME` in the bounded sink;
- the connection is torn down.

What is not guaranteeable: withdrawing the flushed response to produce zero
bytes. No Windows named-pipe API can un-send flushed bytes, and the frozen
IRR reference-client contract cannot make a non-reference peer's separate
write arrive earlier.

## 5. Section E — impossibility statement and the smallest safe decision

**Impossibility (precise):** on a Windows byte-mode named pipe, when a second
frame is delivered in a separate event after the single permitted response
has flushed, the transport offers no mechanism to make that response
undispatched. Zero-byte refusal is physically available only while the
response write is still pending (the existing flush guard + `Promise.race`
window) or when both frames coalesce before parsing settles. Changing this
would require either altering the frozen IRR reference-client contract or a
transport that Windows named pipes do not provide; neither is permitted.

**Smallest safe decision (implemented; the one-frame invariant is not
weakened):**

- *Pre-flush or coalesced second frame* — unchanged airtight zero-byte Class
  P refusal; nothing in the reader guard or `writeGuarded` race changed.
- *Post-flush second frame* — a new `attachPostFlushWatch()` in
  `src/ipc/dispatch.ts` arms only on flush-guard transports after a
  successful response flush and only while `socket.readableEnded` is false.
  Any trailing data is refused with a `MALFORMED_FRAME` sink record and
  `socket.destroy()`; it is never dispatched and no second response is ever
  written. The watchdog removes exactly its own three listeners on
  end/close/error; caller-owned listeners (the dispatcher error handler) are
  preserved; a terminal EOF before arming simply skips arming because no
  data event can follow a ended readable side.
- *Test correction, not weakening* — the real-socket second-frame test now
  asserts the zero-byte contract on AF_UNIX (unchanged) and, on win32, the
  guaranteeable outcomes: exactly one well-formed frame, frame 2's op never
  dispatched, guard trip recorded. No assertion was deleted, skipped or
  replaced with a generic success; the cross-platform zero-byte assertion
  was impossible to satisfy on Windows and is now split along the transport
  boundary with strictly stronger observable guarantees than the old
  single-frame-only behavior (which previously neither recorded nor tore
  down a post-flush violator after `reader.release()`).

## 6. Change surface and validation

Production: one file (`src/ipc/dispatch.ts`, new watchdog + arming
condition). Tests: five g3 suites (four restore endpoint-derived handler
construction; framing gains the platform-conditional test and four
emulations, +4 tests). CI: `.github/workflows/ci.yml` carries the
`[ubuntu-latest, windows-latest]` matrix, `fail-fast: false`, job-level bash
shell, check-run published from the Ubuntu leg only (already part of the
23-path manifest). The manifest remains 23 paths (1 modified, 22 added;
4576 insertions, 2 deletions vs `be32d8c9`).

Exact Linux evidence (Node v22.22.3, npm 10.9.8):

| Command | Result | Exit |
|---|---|---|
| `npx tsc --noEmit` | clean | 0 |
| `npm run build` | tsc emit + vite bundle | 0 |
| `npm test` (guarded) | files=57; **751 tests, 750 pass, 0 fail, 1 skip** | 0 |

Per-suite, all exit 0: startup_validation 20/20; no_network_listener 11
(10 pass, 1 posixOnly skip); ipc_framing 30/30; write_gate 9/9;
caller_authority 103/103; binding_resolution 10/10;
portfolio_read_isolation 6/6; durability_vocabulary 6/6. Gate 3 total
195 (was 191 at `14e2f5a`; the +4 are the labeled emulations). Full-suite
movement 747→751 tests, 746→750 pass, same single skip. A clean-worktree
`git am --whitespace=error-all` of the distributed patch onto `be32d8c9`
applied both commits without warnings and reproduced every count above
exactly (re-hashed SHAs `224062c`/`78d5b65`).

## 7. Artifacts, checksums and distribution

Arena preview (not authoritative publication), served directory
`/g3-ipd-wincorr-20261020/` (live preview on port 8731):

| File | SHA-256 |
|---|---|
| `g3-ipd-wincorr-20261020-be32d8c9.patch` | `74c3e5fe1411825403b9bf82a8cade9cbbe46b5b7a768830aea4fcf882e5b9e6` |
| `MANIFEST.txt` | `fe6e32738d13a3f8f29449794d8fb1a8b432924572720e8b7153bb5c7cdde0c3` |
| `VERIFICATION.txt` | `d98919e63abec73bb8706274442eb5bfbb81d2da66a39d3848125dd6166cd149` |

A download-and-`sha256sum -c` round trip through the preview server returned
three `OK` lines. Checksums are freshly computed and unique; the destroyed
`1477bd3`/`af04df1`/`14e2f5a` sets are superseded and their old checksums
must not be compared against this set.

## 8. Preserved invariants, limitations, blockers

Preserved and re-validated: zero-byte Class P refusals; W-1
`WRITE_NOT_AUTHORIZED` with zero row delta and no environment override;
caller-owned error listeners and reader-listener cleanup; the Node
<22.13.0 guard before any file open; 64 KiB request / 256 KiB response caps;
envelope key whitelist; C7 deep key scan; the seven-op closed set plus
reserved `portfolio.analytics`; Gate A′ private-brand refusal and the absent
`src/ipc → persistence/provisioning` import edge; string-path AF_UNIX/pipe
listeners only, never TCP; `IDLE_TIMEOUT`; hash-chained audit; checksummed
migration ledger; provisioning isolation.

Outstanding: (1) **native-Windows re-validation is the only acceptable
Windows evidence** and has not been run for this set — the windows-latest CI
leg in the patch or an equivalent real runner is required; (2) IPD push
remains 403 (`Permission denied`, exit 128; ref API 403
`Resource not accessible by integration`); no fork, mirror or permission
change was attempted; (3) Gate 4 items — DACL/SDDL, second-account access,
SMB, pipe lifecycle, real-pipe zero-byte — remain out of scope and
unclaimed; (4) the disclosed open item that entrypoint `fail()` paths do not
close the database handle is unchanged and outside this correction; (5) no
gate advancement, merge or production activation is implied, and the Gate 3
decision remains pending the native-Windows run.
