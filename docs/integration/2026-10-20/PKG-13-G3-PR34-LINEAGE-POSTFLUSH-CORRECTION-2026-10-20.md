# PKG-13 — Gate 3 Correction Applied to the Actual Published PR #34 Lineage (2026-10-20)

| Field | Value |
|---|---|
| Packet | PKG-13 (successor record to PKG-12) |
| Date | 2026-10-20 (Asia/Calcutta) |
| Subject | After a third environment reset, re-clone IPD, re-verify the authoritative remote state, and apply the PKG-12 post-flush observability correction onto the **actual published PR #34 lineage** (not a spec reconstruction); keep the disputed `ci.yml` hunk separated as a manifest discrepancy; re-validate on a clean worktree; preserve every governance boundary |
| Authority | `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` (EFFECTIVE), act blob `4744e6f44e0caea55e980756aeef90a5046ec87e`; authorized parent `be32d8c95a86b3f03bd382ccde5b6398efb351c6` unchanged |
| Implementation repository | IPD (`ramkivs/iips-production-market-data`), fresh working clone at `/home/user/iipd-work` |
| Target branch | `g3/gate3-node-sqlite-ipc-correction-d30003d` (local continuation only; IPD write remains credential-blocked, HTTP 403, exit 128) |
| Verified remote PR head | `3eb13ed637ac61bd971da1a06883da4b4564447b` (PR #34 OPEN, mergeable/clean, 0 reviews, 0 checks, 0 comments at verification time) |
| Local continuation commit | `93a5834b85fa4380c0450d25e66d77c5a275015f` — exists only in the Arena worktree; not on any remote and never to be cited as published |
| Artifact set | `g3-ipd-round6-pr34-20261020/` (served via the resumed read-only preview on port 8731; supersedes all destroyed sets — `g3-ipd-postflush-20261020`, `wincorr`, `14e2f5a`, `af04df1`, `1477bd3`) |
| Arena environment | Linux `6.11.158+`, Node `v22.22.3`, npm `10.9.8`; target user environment remains native Windows, Node `v22.22.0`, npm `10.9.4` |
| Native-Windows acceptance | **NOT VERIFIED** — no new real windows-latest/native run exists for this set; Linux real-socket tests and labeled transport emulations are never presented as native evidence |
| Status | Correction implemented on the true PR lineage with two in-manifest files; 756 tests, 755 pass, 0 fail, 1 intentional platform skip, guarded exit 0; independent clean-worktree and `git am` tree-identity re-validation green; IPD publication still 403; `ci.yml` amendment still required; Gate 3 decision unchanged (no advancement, no merge, no production activation) |

---

## 0. Provenance: third reset, and why this round is different

A third environment reset destroyed the IPD worktree (local commit
`c7dab9f`), all prior artifact sets and the 8731 preview process. Because
the IPD credential is read-only, no remote copy of the PKG-12 work
existed. This round therefore did **not** re-author the 23-file
manifest from specifications again. Instead IPD was re-cloned and the
real published PR #34 head `3eb13ed` was fetched
(`refs/pull/34/head`) and checked out. The Round-6 correction was then
authored against that actual tree, whose module shapes differ from the
destroyed reconstruction (e.g. `attachPostFlushWatch(socket)` with no
idle parameter, `endFrame()` as the only transport primitive,
`FakeSocket` exposing `forceBrokenPipeEof` rather than the
shutdown-timer model). The fix design is the PKG-12 design; the code is
newly applied and tested against the real lineage.

## 1. Verified authoritative starting state (read-only, before any edit)

Live GitHub API results at the start of the round:

- PR #34: state OPEN, `mergeable: true`, `mergeable_state: clean`, head
  `3eb13ed637ac61bd971da1a06883da4b4564447b`, base `main`
  (`3d44e0a123f2495f3b88ce0ab8b47fbc5bf072db`), zero reviews, zero
  check runs, zero issue comments.
- Compare `be32d8c9...3eb13ed`: ahead 2, behind 0, zero divergence. The
  head is a strict two-commit descendant of the act's authorized parent:
  `673ec75c38` (reconstructed 23-file Gate 3 manifest) and
  `3eb13ed637` (native-Windows empty-response/post-flush one-frame
  correction).
- Current IPD `main` is 19 commits beyond `be32d8c9`; its changes are
  docs/evidence/dependency-security and unrelated source — no
  `src/ipc` or `src/persistence` files exist on `main`. GitHub reports
  the PR CLEAN against that base.
- The 23 diff paths match the act §4.2/§4.3 manifest (14 `src`
  additions, 8 test additions, plus `.github/workflows/ci.yml`
  modification, which §4.1 freezes at blob `aeee464f…` and §4.6 lists
  under "no change").

## 2. Baseline re-established on the actual published lineage

After `npm ci --no-audit --no-fund` (exit 0), the exact act §4.5
commands on the untouched `3eb13ed` tree:

```
npx tsc --noEmit   -> exit 0
npm run build      -> exit 0
npm test           -> [test-guard] files=57
                      # tests 751, # pass 750, # fail 0, # skipped 1
                      guard exit 0
```

This reproduces the published Linux numbers (PKG-11) on the real remote
lineage rather than on a spec-derived reconstruction.

## 3. Root cause confirmed against the actual code

`src/ipc/dispatch.ts` at `3eb13ed` routes both settlement policies
through `endFrame()`, i.e. `socket.end(frame)`. On a Windows byte-mode
named pipe (libuv v1.51 `src/win/pipe.c`, bundled in Node 22.22):
`socket.end` → `_final` → `uv_shutdown` → `FlushFileBuffers`; on a
readable duplex pipe the shutdown handler arms a fixed 50 ms eof timer;
`eof_timer_cb` then calls `close_pipe` (`CloseHandle`) plus
`uv_read_stop` and delivers `UV_EOF`. After that forced break the
client's later `WriteFile` fails (`ERROR_NO_DATA`/EPIPE), so no server
`ReadFile`/`data` event can complete and `attachPostFlushWatch` can
never observe the +25 ms second frame — the diagnostic sink stays empty
and the native test sees `undefined`. The published `FakeSocket` did
not model shutdown-induced closure (its `end()` only queued bytes),
which is why the emulation tests passed on Linux while native Windows
failed. The AF_UNIX half-close-required path has a real FIN primitive
and remains correctly `end()`-based.

## 4. Correction surface (commit `93a5834`, two in-manifest files)

No path was added or deleted; no dependency, lockfile, package script or
manifest file was touched; the failing acceptance test's text is
unchanged and was not skipped, weakened, relabeled or deleted.

`src/ipc/dispatch.ts`:

1. New `writeFrame()` uses `socket.write` (no half-close); the
   flush-guard policy now responds through it, keeping the pipe open and
   readable so the post-flush watchdog can actually observe trailing
   data. `endFrame()` is retained exclusively for the AF_UNIX
   half-close-required policy.
2. `attachPostFlushWatch(socket, idleTimeoutMs)` gains an `unref()`'d
   idle timer (constant `POST_FLUSH_IDLE_TIMEOUT_MS = 5000`, equal to
   the reader default; option override honored): a silent peer produces
   an `IDLE_TIMEOUT` sink record and `destroy()`; trailing data still
   produces `MALFORMED_FRAME` and destruction; terminal
   `end`/`close`/`error` events remain cleanup-only and cannot create a
   second record.
3. The pre-flush `Promise.race` guard, zero-byte Class P refusals, C7
   deep scan, W-1 refusals and the closed operation set are unchanged.

`tests/g3_ipc_framing.test.ts` (30 → 35 tests):

- `FakeSocket` gains `endCalled`/`writeCalled` counters,
  `armShutdownEof(delayMs = 30)` (the libuv shutdown → eof-timer forced
  break, shortened deterministically) and `peerSend(chunk)` (returns
  false / undeliverable after the break).
- Four tests explicitly labeled **"Windows-transport emulation"**:
  defect pin of the old `end()` behavior (empty sink = the native
  `undefined` symptom); `write()`-not-`end()` transport selection with
  half-close still using `end()`; pre-break late-frame
  `MALFORMED_FRAME` observation; silent-peer idle reclamation.
- One real AF_UNIX `net.Socket` flush-guard test (Linux real-socket
  evidence, explicitly not native-Windows evidence): frame 2 at +25 ms
  yields exactly one length-prefix-verified response, the second frame
  is never dispatched, and the sink records `MALFORMED_FRAME`.

## 5. Exact validation commands and results

```
npx tsc --noEmit   -> exit 0
npm run build      -> exit 0
npm test           -> [test-guard] files=57
                      # tests 756, # pass 755, # fail 0,
                      # cancelled 0, # skipped 1
                      [test-guard] OK — 756 test(s) executed, 755 passed, exit 0
```

Per-suite Gate 3 results (`node --test dist/tests/g3_<suite>.test.js`,
all exit 0): startup_validation 20/20; no_network_listener 11 (10 pass,
1 POSIX-only mode-bit skip); ipc_framing 35/35; write_gate 9/9;
caller_authority 103/103; binding_resolution 10/10;
portfolio_read_isolation 6/6; durability_vocabulary 6/6. Gate 3 subtotal
200 tests (199 pass, 1 intentional platform skip); the 556 pre-existing
tests across 49 suites remain green inside the same guarded run
(556 + 200 = 756). Red/green evidence: the defect-pin emulation fails
the old transport exactly as native Windows reported, then passes under
the corrected `write()`-based transport; no existing assertion changed.

## 6. The `ci.yml` manifest discrepancy, separated rather than amended

The single `.github/workflows/ci.yml` hunk (+10/-2) adds an
`ubuntu-latest`/`windows-latest` strategy matrix, `shell: bash`, and an
Ubuntu-only guard around the check-run publish step. No act amendment
authorizing it exists, and none is created here. Its separability is
now empirically established three ways:

1. The implementation was exported as a plain unified diff containing
   **exactly the 22 addition paths** of the act manifest
   (`g3-ipd-round6-authorized-22paths.patch`; zero modifications to
   existing files); the CI hunk was exported alone
   (`g3-ipd-round6-ci-matrix-requires-amendment.patch`).
2. In a fresh `git worktree` at `be32d8c9`, with the base
   Ubuntu-only `ci.yml` still in place, the 22-path patch applied with
   `--whitespace=error-all`, then `tsc`, `build` and the full guarded
   run produced identical 756/755/0/1 results, guard exit 0.
3. Re-applying the CI patch on top and diffing the sorted governed
   path sets against the full `be32d8c9..HEAD` diff showed exactly the
   same 23 paths (the only worktree difference was the `node_modules`
   symlink used for the build). The base workflow was also restored
   temporarily in the main worktree with identical results, then the PR
   version was restored.

**Decision required (named, not taken):** a formal amendment to the act
(or an equivalent authority decision) is needed before the windows-matrix
`ci.yml` hunk can be treated as manifest-conformant — including before
any CI `windows-latest` leg could serve as the native-Windows evidence
gate. Until then it stays quarantined in its own patch.

## 7. Transfer integrity and artifact checksums

Three patches are published in the artifact set:

- `g3-ipd-round6-full-lineage-be32d8c9.mbox.patch` — `git format-patch`
  of all three commits (31 diff hunks across 23 file paths, including
  `ci.yml`), reproducing the complete local branch from `be32d8c9`.
- `g3-ipd-round6-authorized-22paths.patch` — act-conformant
  implementation set (22 `diff --git` hunks; 4,943 lines).
- `g3-ipd-round6-ci-matrix-requires-amendment.patch` — the quarantined
  CI hunk (31 lines).

Strongest transfer proof: in a clean worktree at `be32d8c9`,
`git am --whitespace=error-all` on the mailbox patch applied all three
commits and produced a tree whose hash is **identical** to
`93a5834^{tree}` (commit hashes differ only because of the committer
identity in the throwaway worktree). The 22-path + CI patches recombine
to the same 23 governed paths.

Fresh SHA-256 values (`SHA256SUMS.txt` inside the set; old destroyed-set
checksums must not be compared):

| File | SHA-256 |
|---|---|
| `g3-ipd-round6-authorized-22paths.patch` | `9713e74b08560f4bb79726389a28b5f8884450ebcac498d86c695edafef6688b` |
| `g3-ipd-round6-ci-matrix-requires-amendment.patch` | `33d0fb7bb7351791985af520f6118aba705fe79d105b094ca07221f1d0afe047` |
| `g3-ipd-round6-full-lineage-be32d8c9.mbox.patch` | `c45ea6a68484be44452c51b8e2ab9fb912e8c447285db8fe4d664b72c665f5db` |
| `linux-guarded-run.log` | `4168b8b6366d999940c0da17b3360aad052c08f4f9ad4321c8ccd382bce49084` |
| `g3-suites.log` | `125866b02486eb6f6fcadd69d0224c13774233461e18ed32d584872136ae792a` |
| `typecheck.log` | `17b271b273286f3f06b8ca009385ec8ac047ec15669076f914aa6de145300504` |
| `build.log` | `90cc04f868913e7e7cca87c88abfb83868b57a7998fa60024666775812887ec3` |
| `MANIFEST.txt` | `de2e31bf0528aed3575e714f1eecbd6ff165eaa2b6413226cd0840d56db10588` |
| `VERIFICATION.txt` | `8fdbf9580dff7cf447772f6f64d03b5f548428dbd6bcea342eb08961d863960a` |
| `publication-blocker.log` | `3deb649290b1e4e7f6de420a77124599633f8dccd847e32f9b995a07ca5ec6b9` |

## 8. Publication blocker (unchanged, exact response retained)

```
$ git push origin g3/gate3-node-sqlite-ipc-correction-d30003d
remote: Permission to ramkivs/iips-production-market-data.git denied to ramkivs.
fatal: unable to access 'https://github.com/ramkivs/iips-production-market-data.git/':
       The requested URL returned error: 403
push exit: 128
```

A post-attempt API re-read confirmed the remote PR head is still
`3eb13ed`; no fork, mirror or permission change was attempted. An IPD
actor with write credentials can `git am` the mailbox patch (or apply
the two separated patches) to publish the work.

## 9. Preview distribution (not authoritative publication)

The reset destroyed the prior preview process. A dependency-free
read-only Node static server (`artifacts/preview-server.mjs`, GET/HEAD
only, root containment guard, `x-content-type-options: nosniff`) again
serves `/home/user/artifacts` on `0.0.0.0:8731` through the Arena
preview proxy; the current set is
`/g3-ipd-round6-pr34-20261020/`. A download-and-`sha256sum -c` round
trip of all ten files through HTTP returned ten `OK` lines matching
`SHA256SUMS.txt`. This convenience channel does not alter publication
status: the 403 stands and the checksum-verified patches plus this
packet remain the authoritative transfer mechanisms.

## 10. What remains and the exact decisions at the boundary

1. **Native-Windows T-A acceptance — NOT VERIFIED.** Only a real
   `windows-latest`/native run of the published `93a5834`-equivalent
   commit can close the one-frame post-flush criterion (and QE/Q items
   such as host `node:sqlite`, DACL/SDDL). Emulation and Linux results
   can never supply PASS. If such a run fails, the failing test stays
   and gets another correction; it is never weakened.
2. **Formal `ci.yml` amendment/decision** as scoped in §6 — required
   before the matrix hunk or its Windows leg is manifest-conformant.
3. **IPD publication decision** — an authorized pusher applies the
   patches; the integration token cannot.
4. **PR #34 merge** — the PR description disclaims merge authority; no
   merge is attempted or implied; a separate established merge
   authorization is required.
5. Gate 3 is **NOT ACCEPTED**; no Gate 4/QE qualification, no
   result-acceptance act, no Gate 5 admission, no IRR 503 lift (fence
   blob `51704c12…` untouched; the IRR repository received only this
   evidence packet on the session branch), no `durable:true` or
   production-eligibility claim, and CV-52 remains **BLOCKED** with its
   hard transitive acceptance dependency intact.
