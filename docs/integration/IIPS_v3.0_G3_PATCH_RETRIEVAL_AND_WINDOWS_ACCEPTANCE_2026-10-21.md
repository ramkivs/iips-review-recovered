# Gate 3 IPC Correction — Artifact Retrieval, Verification, and Native-Windows Acceptance

**Date:** 2026-10-21 (UTC). **Author:** Arena Agent.
**Status:** No correction reimplemented, no file modified, nothing committed or pushed.
**Gate 3: BLOCKED / NOT ACCEPTED** pending native-Windows acceptance.

---

## 1. Retrieval

The existing artifact is served read-only over the Arena preview port.

| | |
|---|---|
| **Preview URL** | `https://8080-i3kznk2bculw31bq3g3nh.e2b.app/` |
| **Direct download** | `https://8080-i3kznk2bculw31bq3g3nh.e2b.app/g3-flush-guard-release.patch` |
| **Served from** | `docs/integration/artifacts/g3-flush-guard-release.patch` (unmodified, no copy made) |
| **Server** | `python3 /tmp/serve_artifact.py`, bound `0.0.0.0:8080` |

The index page reports live size and SHA-256 of the bytes actually being served. The download
response carries `Content-Type: application/octet-stream`,
`Content-Disposition: attachment; filename="g3-flush-guard-release.patch"`, and an
`X-Artifact-SHA256` header.

Fetch without a browser:

```bash
curl -fLO https://8080-i3kznk2bculw31bq3g3nh.e2b.app/g3-flush-guard-release.patch
```

```powershell
Invoke-WebRequest -Uri "https://8080-i3kznk2bculw31bq3g3nh.e2b.app/g3-flush-guard-release.patch" `
  -OutFile "G:\g3-flush-guard-release.patch"
```

---

## 2. Identity of the artifact

| Field | Value |
|---|---|
| File | `g3-flush-guard-release.patch` |
| **Size** | **18,701 bytes** |
| **SHA-256** | `a9e0ebd673ea90741eef545b3ef9d567ede066a0cea4aa25978ead787cfcc6ed` |
| Patch base | `3eb13ed637ac61bd971da1a06883da4b4564447b` |
| Files changed | 3 |
| Diffstat | 230 insertions(+), 62 deletions(−) |

Changed files:

| Path | Change |
|---|---|
| `src/ipc/dispatch.ts` | modified, +38 / −42 |
| `tests/g3_ipc_framing.test.ts` | modified, +20 / −20 |
| `tests/g3_flush_guard_connection_release.test.ts` | **new**, 172 lines |

---

## 3. Integrity verification performed

| Check | Result |
|---|---|
| Size on disk | 18,701 bytes ✔ |
| SHA-256 recomputed | `a9e0ebd6…7cfcc6ed` ✔ |
| NUL bytes | **0** ✔ |
| CRLF sequences | **0** ✔ |
| UTF-8 decodable | yes ✔ |
| Files touched | exactly the 3 declared, no unrelated paths ✔ |
| `git apply --stat` vs pristine `3eb13ed` | 3 files changed, 230(+), 62(−) ✔ |
| **`git apply --check -v` vs pristine `3eb13ed`** | **CLEAN** — all three files checked ✔ |
| HTTP-transported copy re-checked | `cmp` byte-identical; `git apply --check` CLEAN ✔ |

Procedure: a fresh clone of `ramkivs/iips-production-market-data` was checked out at
`3eb13ed637ac61bd971da1a06883da4b4564447b` with a verified clean tree, then `git apply --check -v`
run against that pristine tree. The file was then downloaded back through the preview port and
re-hashed and re-checked, confirming the HTTP path is lossless.

**Not verified — and cannot be:** that this patch applies to the Windows working tree. It does not.
See §4.

---

## 4. PowerShell — preserve, classify, reconcile, apply

> **Read this first.** The patch applies to the base `3eb13ed`, where `dispatch.ts` is 12,174 bytes.
> The Windows `src/ipc/dispatch.ts` is a **16,153-byte** local file, so `git apply` will not match
> there. The safe procedure is: preserve everything, materialise a clean reference tree at the
> declared base, apply the patch *there*, diff the local files against that reference, and only then
> copy across what the diff review justifies. Nothing is deleted or overwritten before a backup
> exists.

Run in an elevated PowerShell, adjusting the two paths at the top if required.

### Step 0 — Variables

```powershell
$W      = "G:\IIPS-IPD-R6-WINDOWS-VALIDATION-20261020-192257"
$STAMP  = Get-Date -Format "yyyyMMdd-HHmmss"
$SAFE   = "G:\IIPS-G3-SAFE-$STAMP"          # backup destination
$P      = "G:\IIPS-G3-BASE-3eb13ed"          # clean reference worktree
$PATCH  = "G:\g3-flush-guard-release.patch"
$BASE   = "3eb13ed637ac61bd971da1a06883da4b4564447b"
$WANT   = "A9E0EBD673EA90741EEF545B3EF9D567EDE066A0CEA4AA25978EAD787CFCC6ED"
```

### Step 1 — Preserve the existing checkout (non-destructive)

```powershell
New-Item -ItemType Directory -Force -Path $SAFE, "$SAFE\_state" | Out-Null
robocopy $W $SAFE /E /COPY:DAT /R:1 /W:1 /NFL /NDL /NJH /NJS

Set-Location $W
git rev-parse HEAD                        | Tee-Object "$SAFE\_state\head.txt"
git status --porcelain=v1 -uall           >  "$SAFE\_state\status.txt"
git log --oneline -5                      >  "$SAFE\_state\log.txt"
git stash list                            >  "$SAFE\_state\stash.txt"
git for-each-ref                          >  "$SAFE\_state\refs.txt"
git fsck --lost-found                     >  "$SAFE\_state\fsck.txt" 2>&1
git bundle create "$SAFE\r6-windows-$STAMP.bundle" --all
```

Hash manifest of every non-`.git` file — this is the record that proves nothing was lost:

```powershell
Get-ChildItem -Path $W -Recurse -File -Force |
  Where-Object { $_.FullName -notmatch '\\\.git\\' } |
  ForEach-Object {
    "{0}`t{1}`t{2}" -f (Get-FileHash $_.FullName -Algorithm SHA256).Hash,
                        $_.Length,
                        $_.FullName.Substring($W.Length + 1)
  } | Sort-Object { ($_ -split "`t")[2] } |
  Set-Content "$SAFE\_state\sha256-manifest.tsv" -Encoding UTF8
```

Confirm the four known files reproduce their recorded hashes before going further:

```powershell
"scripts/run-tests.mjs","src/ipc/dispatch.ts","src/ipc/endpoint.ts","tests/g3_binding_resolution.test.ts" |
  ForEach-Object { "{0}  {1}" -f (Get-FileHash (Join-Path $W $_) -Algorithm SHA256).Hash, $_ }
```

### Step 2 — Verify the downloaded patch

```powershell
(Get-Item $PATCH).Length                                        # expect 18701
(Get-FileHash $PATCH -Algorithm SHA256).Hash.ToUpper()          # expect $WANT
if ((Get-FileHash $PATCH -Algorithm SHA256).Hash -ne $WANT) { throw "PATCH HASH MISMATCH — stop" }
```

### Step 3 — Materialise a clean reference tree at the declared base

This creates a **separate directory**. It does not touch the checkout or its untracked files.

```powershell
Set-Location $W
git fetch origin --prune
git worktree add $P $BASE
Set-Location $P
git rev-parse HEAD                                    # expect $BASE
git status --porcelain                                # expect empty
```

Apply and check the patch **in the reference tree only**:

```powershell
git apply --stat  $PATCH
git apply --check -v $PATCH                           # expect: no output, exit 0
git apply $PATCH
git status --porcelain                                # expect exactly 3 paths
```

### Step 4 — Classify the divergent files before touching them

Review each diff. **Do not copy anything yet.**

```powershell
Set-Location $W
$pairs = @(
  @{ n = "dispatch";                 r = "$P\src\ipc\dispatch.ts";                     l = "$W\src\ipc\dispatch.ts" },
  @{ n = "endpoint";                 r = "$P\src\ipc\endpoint.ts";                     l = "$W\src\ipc\endpoint.ts" },
  @{ n = "binding-test";             r = "$P\tests\g3_binding_resolution.test.ts";     l = "$W\tests\g3_binding_resolution.test.ts" },
  @{ n = "ipc-framing-test";         r = "$P\tests\g3_ipc_framing.test.ts";            l = "$W\tests\g3_ipc_framing.test.ts" }
)
foreach ($x in $pairs) {
  if (Test-Path $x.l) {
    git diff --no-index --stat -- $x.r $x.l | Tee-Object "$SAFE\_state\diff-$($x.n)-stat.txt"
    git diff --no-index --      $x.r $x.l > "$SAFE\_state\diff-$($x.n).diff" 2>$null
  } else {
    "MISSING in checkout: $($x.l)" | Tee-Object "$SAFE\_state\diff-$($x.n)-MISSING.txt"
  }
}
```

Expected readings:

| File | Expected diff vs patched reference | Action |
|---|---|---|
| `dispatch.ts` | local adds `writeFrame` / routes flush-guard through it; larger by ~3,979 B | **superseded** by the patch — replace, after confirming the diff contains nothing else |
| `endpoint.ts` | local adds the single `activeSockets` tracking block (~450 B) | **keep the local file** — not in the patch, harmless, does not fix this defect |
| `g3_binding_resolution.test.ts` | local improves the `call()` helper (~713 B) | **keep the local file** — not in the patch; compatible and beneficial |
| `g3_ipc_framing.test.ts` | unknown — no Windows hash for this file was ever recorded | **review the diff carefully**; the patch rewrites three assertions in it |

If `diff-dispatch.diff` shows local changes **other than** the flush-guard write/close extension, stop
and carry those forward rather than replacing the file.

### Step 5 — Apply to the checkout

Only after Step 4 review and the Step 1 backup:

```powershell
Copy-Item "$P\src\ipc\dispatch.ts"                       "$W\src\ipc\dispatch.ts"                       -Force
Copy-Item "$P\tests\g3_ipc_framing.test.ts"              "$W\tests\g3_ipc_framing.test.ts"              -Force
Copy-Item "$P\tests\g3_flush_guard_connection_release.test.ts" "$W\tests\g3_flush_guard_connection_release.test.ts" -Force
```

Leave `src/ipc/endpoint.ts` and `tests/g3_binding_resolution.test.ts` exactly as they are, and leave
`scripts/run-tests.mjs` untouched (outside the authorized manifest).

Record the post-apply hashes so the state is auditable:

```powershell
"src/ipc/dispatch.ts","tests/g3_ipc_framing.test.ts","tests/g3_flush_guard_connection_release.test.ts" |
  ForEach-Object { "{0}  {1}" -f (Get-FileHash (Join-Path $W $_) -Algorithm SHA256).Hash, $_ } |
  Tee-Object "$SAFE\_state\post-apply-hashes.txt"
```

Clean up the reference tree when done (it is disposable — the checkout is not):

```powershell
git -C $W worktree remove $P --force
```

---

## 5. Native-Windows acceptance

```powershell
Set-Location $W
npx tsc                                   # rebuild dist from the reconciled sources
```

**5.1 The failure that started this — run the file whole, unfiltered**

```powershell
node --test --test-timeout=10000 .\dist\tests\g3_binding_resolution.test.js
```

Expected: **10 tests, 10 pass, 0 fail**, process exits normally. Specifically
`restoring an ACTIVE binding makes the next IPC request succeed again` must pass with
`response.byteLength > 0`.

> Do **not** use `--test-name-pattern` for acceptance. It passed 1/1 even while the file as a whole
> failed, because filtering removes the earlier IPC calls that exhausted the connection slot.

**5.2 The new regression suite**

```powershell
node --test --test-timeout=10000 .\dist\tests\g3_flush_guard_connection_release.test.js
```

Expected: **3 tests, 3 pass, 0 fail** — four sequential requests on one server, capacity slot back
to 0, and a zero-byte refusal followed by a successful request.

**5.3 Framing suite (assertions changed by the patch)**

```powershell
node --test --test-timeout=10000 .\dist\tests\g3_ipc_framing.test.js
```

Expected: **30 tests, 30 pass, 0 fail**. Note the deliberate absence of a post-flush
`MALFORMED_FRAME` assertion — with the handle closed after the flush that record is unobservable on
this transport, and asserting it is what produced PR #34's
`MALFORMED_FRAME` expected / `undefined` received.

**5.4 All Gate 3 suites**

```powershell
node --test --test-timeout=10000 .\dist\tests\g3_*.test.js
```

Expected: **198 tests, 194 pass, 4 skipped, 0 fail.**

The 4 skips are the `posixOnly` tests in `g3_no_network_listener.test.ts` (2) and
`g3_startup_validation.test.ts` (2), which are skipped by design on Windows. Linux shows 1 skip
instead — `the Windows endpoint is a named pipe with no filesystem artifact` — which runs on Windows.
The invariant to hold onto is **`# fail 0`**; total/pass/skip counts should match 198 / 194 / 4.

**Do not run `npm test` for acceptance.** It routes through `scripts/run-tests.mjs`, whose
`^# tests` parser is CRLF- and `ℹ`-marker fragile on Windows, and that file is outside the
authorized manifest.

Capture the full transcript — including the names of all four skipped tests — and file it as the
Gate 3 acceptance evidence.

---

## 6. What would falsify the correction

If §5.1 still returns a zero-byte response, then the server-side handle was already being closed on
Windows and the leak lies elsewhere. The next diagnostic is one line in the client helper of
`g3_binding_resolution.test.ts`, immediately after the failing call:

```powershell
node -e "const n=require('net');n.createServer().close()"
```

— and, in the test, reading `handle.server.connections` (or `.getConnections`) before and after the
failing request. A non-zero value across requests confirms the leak; zero would redirect the
investigation to the client read path.

---

## 7. Status

**Gate 3 remains BLOCKED / NOT ACCEPTED.** This document records artifact transmission, integrity
verification and a procedure. It is not acceptance evidence. Acceptance requires the §5 transcripts
from the native-Windows host.
