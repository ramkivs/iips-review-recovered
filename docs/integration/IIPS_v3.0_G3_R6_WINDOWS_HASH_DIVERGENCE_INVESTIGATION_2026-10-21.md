# IIPS v3.0 — Gate 3: R6 Windows Three-File SHA-256 Divergence Investigation

**Date:** 2026-10-21 (UTC). **Author:** Arena Agent. **Session branch:** `arena/17d363e9-iips-review-recovered`.
**Mode:** READ-ONLY investigation. No source file modified, no patch applied, no reset / clean / stash / commit / push / merge / PR.
**Gate 3 status: BLOCKED / NOT ACCEPTED** (unchanged by this report).

**Boundary statement.** Arena did **not** inspect the Windows filesystem at
`G:\IIPS-IPD-R6-WINDOWS-VALIDATION-20261020-192257`. Every Windows-side input below is a SHA-256
**reported by the operator**. Everything else is derived from live repository evidence in
`ramkivs/iips-production-market-data` (IPD) and `ramkivs/iips-review-recovered` (IRR).

---

## 1. Provenance of the reported base and target hashes

### 1.1 BASE hashes — CONFIRMED, single commit, byte-exact

All four reported base hashes reproduce exactly from commit
`3eb13ed637ac61bd971da1a06883da4b4564447b`, the head of branch
`g3/gate3-node-sqlite-ipc-correction-d30003d` and the head of IPD **PR #34**
("Gate 3: WINCORR IPC framing correction", opened 2026-10-20T09:12:39Z, **still OPEN / unmerged**).

| File | Reported base SHA-256 | Git blob (SHA-1) | Bytes | Reproduces from |
|---|---|---|---|---|
| `scripts/run-tests.mjs` | `a677c7da…0ecf2` | `fe1ab1a3` | 4 974 | `be32d8c` = `673ec75` = `3eb13ed` (identical) |
| `src/ipc/dispatch.ts` | `26c75d56…da3a0faa` | `827f7d78` | 12 174 | **`3eb13ed` only** |
| `src/ipc/endpoint.ts` | `e0675f46…8399734e` | `e565aa5b` | 13 292 | `673ec75` = `3eb13ed` (identical) |
| `tests/g3_binding_resolution.test.ts` | `db784de3…d277a5a4` | `56b007bf` | 8 419 | **`3eb13ed` only** |

Material facts that qualify this:

* **`be32d8c` contains none of the three Gate 3 paths.** `src/ipc/dispatch.ts`, `src/ipc/endpoint.ts`
  and `tests/g3_binding_resolution.test.ts` do not exist in the tree at `be32d8c`. They first appear
  in `673ec75` ("g3: reconstructed Gate 3 manifest on the authorized parent", 2026-10-20T04:44:40Z).
  The recorded Windows HEAD `be32d8c` therefore cannot be the source of any of the three base hashes.
* **The reported "base" is `3eb13ed`, not `be32d8c`.** Two of the four base hashes are *only*
  reproducible at `3eb13ed`; the other two are common to both `673ec75` and `3eb13ed`.
* `scripts/run-tests.mjs` was last changed at `ac10bc61` (2026-10-17) and is byte-identical across all
  three commits, so its base hash carries **no** discriminating information.

### 1.2 TARGET hashes — NOT VERIFIABLE; no repository provenance exists

Exhaustive scan: **3 773 blobs** across **all 57 remote branches plus all 35 `refs/pull/*` refs** of
`ramkivs/iips-production-market-data`. Result:

> **Zero** blobs match any of the four reported target hashes — `28964b43…`, `c4fe1434…`,
> `b0df0d3a…`, `7d168396…`.

Corroborating negatives:

* No occurrence of any target hash anywhere in the IRR repository (full-text grep).
* PR #34 has **zero** issue comments and zero review comments — no patch artifact is attached to it.
* No IPD branch or PR other than PR #34 carries a Gate 3 *code* patch. PRs #35, #36, #37 are
  documentation / decision records (Group B workbook, P11 DEC-06, P11 main-admission).
* The Stage-2 corrected candidate (`24b70f8` → `1353cfe`, branch `g3-r6-root-cause-correction`) is
  **not on the IPD remote** — neither commit resolves. Per the Stage-2 report §7/§8 it existed only
  as a local clone at `/home/user/iipd` in the earlier Arena session `arena/b9288e60-…`, a workspace
  that is no longer available.

**Assessment — hypothesis (medium-low confidence, not a fact).** The target set is *not* the Stage-2
correction. Stage-2 report §3 records exactly three changed files — `src/ipc/dispatch.ts`,
`tests/g3_ipc_framing.test.ts`, `scripts/run-tests.mjs` — and states "No other files were touched."
The target set here is **four** files, includes `src/ipc/endpoint.ts` and
`tests/g3_binding_resolution.test.ts`, and **excludes** `tests/g3_ipc_framing.test.ts`. The target is
therefore a **different, later patch** (a Round-7 / Stage-3 WINCORR follow-on) whose content is not
present in any evidence source available to this investigation.

**Do not treat the target hashes as authenticated.** They are unverifiable from repository evidence.
The exact command/serialization that produced them must be recovered before any patch is trusted.

### 1.3 The Windows checkout — its recorded identity explains the `run-tests.mjs` match

The IRR Stage-2 report §1 (merged to IRR `main` via PR #167) records the checkout directly:

| Field | Recorded value |
|---|---|
| Branch | `validation/g3-r6-native-windows-20261020-192257` |
| HEAD | `be32d8c9` |
| Gate 3 files | **22 untracked files** matching the authorized 22-path patch |
| Round-6 commit | `93a5834b85fa4380c0450d25e66d77c5a275015f` — **unavailable** |

The directory name `IIPS-IPD-R6-WINDOWS-VALIDATION-20261020-192257` carries the identical distinctive
token `20261020-192257`, and the recorded HEAD `be32d8c9` matches the reported Windows HEAD
(**hypothesis, high confidence — established by naming convention, not verified against the disk**).

Verified independently: `93a5834b…` is **not** an object in the IPD repository, and no `validation/*`
branch exists on the IPD remote.

**This explains the single matching hash.** If the 22 Gate 3 paths are *untracked* in that checkout,
then `scripts/run-tests.mjs` — which **is** tracked at `be32d8c` — necessarily hashes to the committed
content. Its match is a **consequence of the file being tracked, not evidence that the checkout is at
the reported base.** It provides no support whatsoever for the other three files.

---

## 2. Per-file divergence analysis

Line-ending and encoding hypotheses were **eliminated**, not assumed away. For each of the three
divergent files, the following variants of both `3eb13ed` (base) and `673ec75` (reconstruction) content
were hashed and compared against the reported Windows values: LF, CRLF, CR, BOM+LF, BOM+CRLF,
LF-without-trailing-newline, CRLF-without-trailing-newline. **No variant matched.** This is consistent
with the repository `.gitattributes` (`* text=auto eol=lf`) and with the clean `run-tests.mjs` match.

| File | Reported Windows SHA-256 | vs `673ec75` | vs `3eb13ed` (base) | vs target | vs any git object | vs LF/CRLF/CR/BOM variants | Classification |
|---|---|---|---|---|---|---|---|
| `scripts/run-tests.mjs` | `a677c7da…` | identical | identical | differs | **matches** `fe1ab1a3` | n/a | **Tracked file at `be32d8c`. Expected match. No divergence — and no corroborating value.** |
| `src/ipc/dispatch.ts` | `dbfa2703…` | differs (`166db192…`, 9 917 B) | differs (`26c75d56…`, 12 174 B) | differs | **not found** | no match | **Provenance not established** |
| `src/ipc/endpoint.ts` | `ccc25726…` | differs (`e0675f46…`) | differs (`e0675f46…`) | differs | **not found** | no match | **Provenance not established** |
| `tests/g3_binding_resolution.test.ts` | `46bd8e60…` | differs (`2ca042a7…`, 8 335 B) | differs (`db784de3…`, 8 419 B) | differs | **not found** | no match | **Provenance not established** |

### Findings against the four required categories

**Confirmed — the three files are NOT any of:**
* a committed state of the authoritative repository (no blob matches, 3 773 blobs searched);
* the Arena `673ec75` reconstruction;
* the `3eb13ed` / PR #34 head (the reported base);
* the reported target;
* a line-ending or encoding variant of any of the above.

**Not established — which of the four permitted categories applies.** Ranked by the evidence
available:

1. **Earlier/independent candidate of the Round-6 recovery lineage (most likely).** The Round-6
   commit `93a5834b…` is recorded as *unavailable*, its 22 paths are recorded as *untracked*, and the
   three files match no reconstruction. This is the only hypothesis that explains all three
   divergences with a single cause. **Medium confidence.**
2. **Known prior local edits by the operator or an earlier session.** Plausible; indistinguishable
   from (1) without the file contents. Cannot be excluded.
3. **An incomplete version of the intended correction.** *Not supported.* Neither `3eb13ed` nor the
   Stage-2 shape is a superset or subset relationship that could be inferred; no prefix/partial-match
   evidence exists.
4. **Content whose provenance cannot be established from available evidence.** **This is the correct
   current disposition.** None of (1)–(3) can be confirmed without the bytes.

**No file is declared safe, incorrect, or disposable.** In particular the three files must **not** be
overwritten on the assumption that they are a stale copy of the base.

---

## 3. Confirmed intended correction, and unresolved implementation differences

### 3.1 Root cause — CONFIRMED by two independent records

`3eb13ed`'s own commit message and the Stage-2 report §2 (RC-1) agree, and the agreement is
substantive rather than circular:

> On a Windows byte-mode named pipe, `socket.end()` / `uv_shutdown` does **not** signal EOF to the
> peer. libuv's client shutdown is `FlushFileBuffers` only; `UV_EOF` arrives when the 50 ms EOF timer
> force-breaks the pipe, by which time every write fails with `EPIPE`. The peer's read therefore never
> terminates.

Consequence for the harnesses: `call()` in the g3 tests resolves only on `error`/`close`. With no EOF,
the client round-trip never completes → zero-byte observation, assertion failure, and suite timeout.
This single mechanism accounts for the recorded Windows failures in `g3_binding_resolution`,
`g3_caller_authority`, `g3_portfolio_read_isolation` and `g3_write_gate`.

### 3.2 The confirmed Windows test result at the reported base

PR #34's body records a native-Windows run **at `3eb13ed`** — i.e. at exactly the reported base:

* Full suite: **FAIL — 751 total, 746 passed, 1 failed, 4 skipped**.
* Failing test: *"a second frame delivered in a separate write/event is refused over a real socket"*,
  suite `g3 / T-A ipc framing`. Expected `MALFORMED_FRAME`, actual `undefined`.

**Discrepancy to flag (not reconciled):** the Stage-2 report §1/§3 records the Round-7 Windows run as
"749 passes / 1 failure / 4 skips" and "754 tests ran". 746+1+4 = 751; 749+1+4 = 754. These are two
different totals, so either two distinct Windows runs/candidates were recorded, or one figure is
mis-recorded. This must be resolved before either number is cited as Gate evidence.

### 3.3 The two competing corrections for the same root cause — UNRESOLVED

`3eb13ed` (the reported base) and the Stage-2 candidate `1353cfe` fix RC-1 in **mutually exclusive**
ways.

| | `3eb13ed` (reported base) | `1353cfe` (Stage-2) |
|---|---|---|
| Flush-guard write | `socket.end(frame)` — unchanged for both policies | `socket.write(frame)`, then `socket.destroy()` **in the write callback** |
| AF_UNIX write | `socket.end(frame)` | `socket.end(frame)` — unchanged |
| Post-flush second frame | `attachPostFlushWatch()`: on trailing `data`, record `MALFORMED_FRAME` in the bounded sink + `socket.destroy()` | Not applicable — handle already closed after flush; Windows branch of the test asserts one response / no second response / terminated connection instead |
| Guard race | `Promise.race([endFrame, whenGuardTripped])` | Both arms settle with plain strings so the losing arm cannot raise an unhandled rejection |
| Native-Windows outcome | **FAILED** — expected `MALFORMED_FRAME`, got `undefined` (PR #34) | **Never run on native Windows** (Linux + labeled `FakeSocket` emulation only) |

**Unresolved difference #1 (blocking).** `3eb13ed` leaves `end()` in place, so the peer-EOF defect
(RC-1) is **not** fixed by it; it only adds a post-flush observer. The recorded Windows failure
(`undefined` instead of `MALFORMED_FRAME`) is the residual that Stage-2 §2 attributes to the race
letting the write win while the handle is never closed. The two corrections cannot both be right, and
`3eb13ed` — the reported base — is the one with a recorded Windows failure.

### 3.4 Active connection tracking and `maxConnections` — UNCONFIRMED defect

At `3eb13ed`, `src/ipc/endpoint.ts` contains:

```ts
server.maxConnections = options.maxConnections ?? 1;
```

There is **no** active-connection set, no increment/decrement, no per-socket registry. Enforcement is
delegated entirely to Node's `net.Server`.

* **Confirmed fact:** that is the current implementation.
* **Hypothesis (unconfirmed — no evidence found):** on libuv named pipes, Node's `maxConnections`
  accounting may not refuse a second connection in the same way it does for TCP, and there is no
  application-level accounting that could prove a refused second connection left the first untouched.
  Named pipes are multi-instance by default; the `FILE_FLAG_FIRST_PIPE_INSTANCE` guarantee claimed in
  `windowsPipeDescriptor()` is a **bind-time** name-collision control, not a per-connection cap.
* **Not claimed as a defect.** No failing Windows test, log line or artifact in any available evidence
  source attributes a symptom to `maxConnections`. `src/ipc/endpoint.ts` *is* inside the authorized
  22-path manifest (act §4.2 item 12, per the file's own header), so a change there is authorized — but
  the intended content of the target's `endpoint.ts` is unknown.

### 3.5 The refusal → restore ACTIVE binding → next request sequence — CONFIRMED mechanism

At `3eb13ed`, `tests/g3_binding_resolution.test.ts` runs three ordered `it()` blocks:

1. seed `b-2/m-2` → `call()` expects `byteLength > 0` and `body.ok === true`; then revoke → `call()`
   expects **0 bytes**;
2. binding absent → `call()` expects **0 bytes**;
3. seed `b-3/m-3` → `call()` expects `byteLength > 0` and `body.ok === true`.

The `673ec75` → `3eb13ed` diff for this file is **exactly two hunks**: import
`settlementPolicyForEndpoint`, and pass `{ settlement: settlementPolicyForEndpoint(target) }` into
`createConnectionHandler`. Nothing else about the sequence changed.

**Confirmed:** before `3eb13ed` the handler was constructed with no settlement policy and therefore
defaulted to `half-close-required`, which on a Windows pipe can never open. `3eb13ed` fixes *that*
defect. It does **not** fix RC-1: under `flush-guard` the response is written, but the handle is never
closed, so `call()` still never terminates. Step 1's `first.byteLength > 0` / `body.ok === true` is
precisely the assertion that hangs.

**Unresolved difference #2.** The restore-ACTIVE step can only pass on Windows if either (a) the
server terminates the handle after flush (the `1353cfe` approach), or (b) the test client is changed to
resolve on a complete frame rather than on `error`/`close`. Option (b) weakens the client contract and
is not evidenced as intended. This is why `g3_binding_resolution` still appears among the Windows
failures/skips at the reported base.

**Open gap:** 4 tests skipped on Windows vs 1 on Linux. The identity of the 3 extra skips is not
recorded anywhere available.

### 3.6 The test-runner summary parser — CONFIRMED defect, plus an authority boundary

At `3eb13ed`, `scripts/run-tests.mjs` (unchanged since `ac10bc61`, 2026-10-17) parses:

```js
const reported = output.match(/^# tests (\d+)$/m);
```

Anchored to line start, **no CRLF normalization**, no failure-count check, no outcome-sum consistency
check. Stage-2 §3 records the observed Windows failure: the guard found no test count although 754
tests ran — attributed to the Unicode `ℹ` summary marker prefixing the line and/or CRLF line endings
from the child process.

Two further confirmed findings:

* **`scripts/run-tests.mjs` is OUTSIDE the authorized 22-path manifest.** The Gate 3 act §4.3 states
  "No test-runner, script or configuration change is required or authorized." The Stage-2 report §6
  already flagged this: the change was task-mandated and must be **amended by independent authority**
  before it is treated as authorized. This is a governance finding, not only a technical one.
* **The CI leg has the same defect and cannot see it.** `.github/workflows/ci.yml` at `3eb13ed` uses
  the identical regex (`'^# ' + k + ' (\\d+)$'`, `m` flag) in its "Publish executed test count" step,
  and that step is gated `if: always() && matrix.os == 'ubuntu-latest'`. The **Windows leg's counts are
  never published at all**, so CI cannot detect this class of Windows divergence. `ci.yml` is likewise
  outside the authorized manifest.

---

## 4. Safe, minimal reconciliation plan (preserves all existing Windows work)

Nothing in steps 1–3 mutates the Windows tree.

**Step 1 — Preserve (non-destructive, do this first).**
1. Take a full recursive copy of `G:\IIPS-IPD-R6-WINDOWS-VALIDATION-20261020-192257` to a sibling
   directory suffixed with the current timestamp. Do not delete or move the original.
2. From inside the original directory, create a git bundle of every ref:
   `git bundle create ..\r6-windows-<timestamp>.bundle --all`
   This captures any unpushed/unreachable objects (including `93a5834b…` **if** it survives locally)
   without stashing, resetting or cleaning.
3. Record `git rev-parse HEAD`, `git status --porcelain=v1 -uall`, `git branch -a`,
   `git reflog --date=iso -n 40`, `git stash list`, and `git fsck --lost-found` output to a text file.

**Step 2 — Identify (still read-only).**
1. For each of the three divergent files, capture byte length, `git hash-object` (SHA-1) and SHA-256.
2. Compare against the four known reference points: `673ec75`, `3eb13ed`, the reported target, and
   `1353cfe` if the Stage-2 bundle can be recovered.
3. Resolve `93a5834b…`: `git cat-file -t 93a5834b…`. If it exists, `git show 93a5834b --stat` and
   `git show 93a5834b:<path>` for the three files, then hash and compare. **If it matches, the
   divergence is fully explained and the reconciliation is a clean re-point to a known candidate.**
4. Produce a unified `git diff` of each divergent file against its nearest reference. Review the delta
   line by line **before** any decision to keep or replace.

**Step 3 — Classify and dispose.**
* If the contents resolve to a known candidate → re-point that file only; leave the rest untouched.
* If the contents contain operator edits not present in any candidate → extract those edits as a
  patch, quarantine the originals by copy, and carry the edits forward deliberately.
* If the contents remain unresolvable → quarantine by copy, do **not** overwrite, and escalate. Under
  no circumstances overwrite an unclassified file on the assumption that it is a stale copy of the base.

**Step 4 — Only after the above, and only under separate authority.**
1. Reconcile the `end()`-vs-`write()`+`destroy()` choice (§3.3) against the PR #34 Windows failure
   before applying any dispatch change. Do not apply `3eb13ed`'s watchdog on top of `1353cfe`'s
   write-then-destroy without a stated reason — they are alternative fixes, not complements.
2. Treat the `endpoint.ts` / `maxConnections` change as unspecified until the intended target content
   is produced (§3.4).
3. Obtain an explicit authority amendment for `scripts/run-tests.mjs` (and for `ci.yml` if touched),
   per §3.6, before merging those changes.
4. Re-run the full `g3_*` suites on the Windows host and record the full transcript, including the
   identity of every skipped test.

**Gate 3 stays BLOCKED / NOT ACCEPTED through all of the above.**

---

## 5. Exact evidence still required from the Windows checkout

Required, in priority order. Items 1–3 alone will most likely close the divergence.

1. **The three file contents** — `src/ipc/dispatch.ts`, `src/ipc/endpoint.ts`,
   `tests/g3_binding_resolution.test.ts`. Minimum viable substitute if the files cannot be shared:
   **byte length + `git hash-object` (SHA-1) + SHA-256** for each. Byte length alone discriminates
   against the known reference sizes — base 12 174 / 13 292 / 8 419 B, `673ec75` 9 917 / 13 292 / 8 335 B.
2. **`git cat-file -t 93a5834b85fa4380c0450d25e66d77c5a275015f`**, and if it resolves,
   `git show 93a5834b --stat` plus `git show 93a5834b:<path>` for the three files.
3. **`git status --porcelain=v1 -uall`** and **`git rev-parse HEAD`** from the checkout — to confirm
   HEAD is `be32d8c9…` and to establish whether the 22 Gate 3 paths are untracked, modified, or staged.
   This is the single highest-value item: it confirms or refutes the "untracked" mechanism that
   explains the `run-tests.mjs` match.
4. **`git for-each-ref`** — confirm whether `validation/g3-r6-native-windows-20261020-192257` still
   exists locally, and list any other `validation/*` or `g3*` branches.
5. **`git reflog --date=iso -n 40`** and **`git fsck --lost-found`** — to find any surviving pre-reset
   objects that the earlier environment reset was recorded as having discarded.
6. **`git config --get core.autocrlf`** and **`git check-attr text eol -- <each of the three files>`** —
   closes the line-ending hypothesis definitively at source, rather than by inference.
7. **The full `npm test` transcript** from the Windows host, including the names of all **4 skipped**
   tests and the complete output of the failing real-socket second-frame test.
8. **The provenance of the four target hashes** — the exact file set, command and serialization used to
   produce `28964b43…`, `c4fe1434…`, `b0df0d3a…`, `7d168396…`. They match nothing in the repository, so
   the patch behind them cannot be authenticated without this.
9. **Which run is authoritative** — the PR #34 figures (751 / 746 / 1 / 4) or the Stage-2 Round-7
   figures (754 / 749 / 1 / 4). See §3.2.

---

## 6. Summary of dispositions

| Claim | Disposition |
|---|---|
| Reported base hashes are authentic | **CONFIRMED** — byte-exact to `3eb13ed` (PR #34 head) |
| Reported base is `be32d8c` | **REFUTED** — `be32d8c` lacks three of the four paths |
| Reported target hashes are authentic | **NOT VERIFIABLE** — match zero of 3 773 blobs across all refs |
| Target == Stage-2 correction | **REFUTED** — different file set (Stage-2 touched 3 files, incl. `g3_ipc_framing.test.ts`, excl. `endpoint.ts`) |
| Windows divergence is CRLF / BOM / encoding | **REFUTED** — all seven variants tested |
| `run-tests.mjs` match validates the checkout | **REFUTED** — it is tracked at `be32d8c`; the match is automatic and carries no information |
| The 3 divergent files are the base | **REFUTED** |
| The 3 divergent files are `673ec75` | **REFUTED** |
| The 3 divergent files are an incomplete correction | **UNSUPPORTED** |
| The 3 divergent files are safe / disposable | **NOT DECLARED** — provenance unestablished |
| RC-1 (`end()` gives no peer EOF on Windows) | **CONFIRMED** by two independent records |
| `3eb13ed` fails on native Windows | **CONFIRMED** — PR #34: 1 failure, `MALFORMED_FRAME` expected / `undefined` received |
| Summary-parser defect | **CONFIRMED** — plus an authority boundary and a blind CI leg |
| `maxConnections` defect on Windows | **UNCONFIRMED — HYPOTHESIS ONLY** |
| Gate 3 | **BLOCKED / NOT ACCEPTED** |
