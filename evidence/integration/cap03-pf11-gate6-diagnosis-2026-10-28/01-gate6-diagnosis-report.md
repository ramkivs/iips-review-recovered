# PF-11 Gate 6 `Get-FileHash` failure — one-pass read-only diagnosis

Record: `IIPS-V3-CAP03-PF11-GATE6-GETFILEHASH-DIAGNOSIS-2026-10-28-01`
Investigation date: 2026-10-28 (Asia/Kolkata). Mode: **static, read-only, IRR only**.
No PowerShell runtime exists in this environment (`which pwsh`/`which powershell` — neither found), so nothing here is a new execution result.

---

## A. Authoritative evidence

| Item | Value |
|---|---|
| Repository | `ramkivs/iips-review-recovered` (IRR) — the only writable repo |
| Branch | `main` |
| Commit (verified live: `git ls-remote origin refs/heads/main`) | **`bb427aea8897d438329adda41175f9ff2a91817e`** |
| Tree | `32096cc6ac0905bbb2ae48db7fcc9a0ecdd38da9` |
| Clone state | shallow at session start → **unshallowed** this pass (`git fetch --unshallow`, 888 commits reachable) |
| Tracker | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`, blob `e6851fdfa55c…`, 2,766,767 B; last section §16.159 |
| IPD | **read-only, not accessed** — no PF-11/Gate 6 fact is IPD-locus |

Run record under diagnosis — `handoff/evidence/pf11-root-safe/`:

| File | Git blob | Bytes/content |
|---|---|---|
| `execution.log` | `1e4b1dc18a8d` | 37 lines, PowerShell transcript (start **22:58:10**, end **22:58:11**) |
| `execution-result.txt` | `caaf911fc987` | 23:01:48 +05:30, exit 1, `Final status: NOT PASSED` |
| `harness-output.txt` | `4fcd25211d38` | **6 lines, all `PASS`; no fingerprint line, no success marker** |
| `harness-compat-output.txt` | `15e329f96e16` | 23:07:39, fingerprint PASS, 12 entries |
| `harness-compat-result.txt` | `197dd6134373` | exit 0 |
| `PF11-FINAL-EVIDENCE-SUMMARY.txt` | `47005728a02d` | compatibility-assisted PASS summary |

Harness and helper at `main`, `evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/`:

| File | Git blob | Bytes | SHA-256 (recomputed from `main`) |
|---|---|---|---|
| `03-test_pf11_root_safe.ps1` | `504470e1e59a` | 4,014 | `0e56dae1ed1cf91772144422cf3f30704f271bd9ebb6b95043937dd0af8862cb` |
| `01-Find-GitWorktreeAncestor.ps1` | `c522b62370cd` | 909 | `65dde9a1a8fc79d295baffdc24b6dc163744d1e70ce6a08056e201939ca6d382` |
| `02-…-pf11-root-safe-v2.ps1` (instrument) | `191f58284612` | 10,990 | `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e` |

Harness identity check: 78 LF, **0 CR**, 4,014 B, SHA-256 `0e56dae1…` — byte-identical to the identity the native run and the tracker cite. (Note: §16.154/§16.158 label `0e56dae1…` a *blob*; it is the **SHA-256**. The Git blob is `504470e1e5`. Recorded as a documentation label defect, not a content defect.)

**Absent from the repository (verified, not assumed):** `git grep` for `GATE 6: SHA-256 VERIFICATION` and `DOWNLOAD AUTHORITATIVE FILES` matches **only** `execution.log`. There is **no** Gate 5/Gate 6 orchestrator, **no** `run-pf11-hash-compat.ps1`, and **no** `harness-error.txt` anywhere in IRR at `bb427ae`. `git ls-tree -r | grep -i pf11` is exhausted.

---

## B. Failure reconstruction

**Chain.** An interactive `powershell.exe` console session was started as:

```
C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -NoLogo -NoProfile -NoExit -Command
  "Write-Host PowerShell version: $PSVersionTable.PSVersion; Write-Host Edition: $PSVersionTable.PSEdition"
```

Host facts from the transcript header (`execution.log` lines 2–17): ConsoleHost; `PSVersion 5.1.26100.9444`; `PSEdition Desktop`; `BuildVersion 10.0.26100.9444`; `CLRVersion 4.0.30319.42000`; `WSManStackVersion 3.0` (**no remoting configuration**); process 18072; machine `DESKTOP-NO0NHTP`, `Microsoft Windows NT 10.0.26300.0`.

Inside that one session an **unpublished** script (not in IRR) printed:

```
Run ID: 92d931fbb5204f74870aedf78610e29a
Repository: C:\iips-work\iips-review-recovered-cap03-s2-authoritative-20261026T101205Z
Remote commit: 115394724f7852544b90715d48b1c73a8dfecc52
Evidence directory: C:\Users\USER\Documents\CAP03-PF11-Results\92d931fbb5204f74870aedf78610e29a

=== GATE 5: DOWNLOAD AUTHORITATIVE FILES ===
PASS: both files downloaded to the separate evidence directory.

=== GATE 6: SHA-256 VERIFICATION ===

STOP: The term 'Get-FileHash' is not recognized as the name of a cmdlet, function, script file, or
operable program. Check the spelling of the name, or if a path was included, verify that the path is
correct and try again.
PS C:\iips-work\iips-review-recovered-cap03-s2-authoritative-20261026T101205Z>
```

Then the interactive prompt plus an echoed `if ($TranscriptStarted) { Stop-Transcript … }` block and `transcript end 20261027225811` — **one second after start**. The orchestrator's error trap caught the exception and re-threw it as `STOP: <message>`; the transcript never recorded the failing statement itself (the orchestrator's `Get-FileHash` call is unprintable from the published log).

**The failure is a `CommandNotFoundException`** — error category **command resolution**, not hashing. Distinguishing the two explicitly:

| Symptom class | Message shape | Present here? |
|---|---|---|
| Command resolution | *"The term 'X' is not recognized as the name of a cmdlet, function, script file, or operable program"* | **YES — both call sites, verbatim** |
| Hashing/permission/file | `UnauthorizedAccessException`, `ItemNotFoundException`, `Cannot find path`, `FileNotFoundException` | No |
| Algorithm/parameter | `Cannot validate argument on parameter 'Algorithm'` / `NotSupportedException` | No |
| Malformed-hash comparison | a hash *mismatch*, i.e. `expected […] actual […]` | No — no comparison was ever reached |

**Second, independent call site.** The published `harness-output.txt` has all six `Assert-Equal` verdicts PASS (lines 1–6: ordinary parent, missing intermediate, filesystem root, `.git` directory, `.git` file, outside any worktree) and then stops. The harness is `03-test_pf11_root_safe.ps1`: `$ErrorActionPreference = 'Stop'` (line 1), the **only** `Get-FileHash` is line 16 inside `Get-TreeFingerprint`, and `Get-TreeFingerprint` is first invoked at **line 64** — after every assertion. With `Stop`, that throw terminates the script before the fixture fingerprint, the mutate/recheck, and the success marker. This matches `execution-result.txt` (`Harness started: True / Harness passed: False / Harness exit code: 1 / Failure: STOP: harness returned exit code 1`).

So **the identical `CommandNotFoundException` occurred twice in the same host session, in two different scripts, at two different call sites**, with no hashing, permission, path, or algorithm error anywhere in the record. The harness was launched as a **child** process outside the transcript window (23:01:48 result vs 22:58:11 transcript end); the child's own launch line, engine and `PSModulePath` are **not** in any published file.

**Governance-adjacent fact for the record:** the run's `Remote commit` was `115394724…` (the CAP-03 S2 authoritative checkout), not `bb427ae`; the harness bytes in that checkout hash to the same `0e56dae1…` as `main`, so the code under test is the same code, but the *checkout* differs from the current baseline.

---

## C. Comparison table

| Dimension | Historical failure (27 Oct, run `92d931fb…`) | PowerShell 7.6.8 test | PowerShell 5.1 test |
|---|---|---|---|
| Executable | `C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe` | `pwsh` (VS Code terminal, `pwsh.dll -noexit`, per `98-operator-session.txt` of capture `T110433Z`) | `powershell.exe` (separate process) |
| Version | **5.1.26100.9444**, Desktop, CLR 4.0.30319.42000 | **7.6.8**, Core | **5.1.26100.9444**, Desktop |
| Host | ConsoleHost, PID 18072, interactive | ConsoleHost, interactive | ConsoleHost, interactive |
| Profile behavior | `-NoProfile` (explicit) | `-NoProfile` | `-NoProfile` |
| Command type resolved | **none — CommandNotFound at both call sites** | cmdlet, `Microsoft.PowerShell.Utility` | **function**, `Microsoft.PowerShell.Utility` |
| Module-session init | **unrecorded** — no `$env:PSModulePath`, no `Get-Module -ListAvailable`, no `Import-Module` | default/autoload, recorded in session evidence | default/autoload; resolved by the module's function wrapper |
| Invocation mechanism | interactive `-NoLogo -NoProfile -NoExit -Command "Write-Host …"` → **unpublished orchestrator** → `Get-FileHash`; harness later in a **child** process | direct interactive statement against a temp file | direct interactive statement against a temp file |
| Result | **FAIL** — exit 1, no fingerprint, no success marker | **PASS** — SHA-256 of temp file computed | **PASS** — SHA-256 of temp file computed |

Classification of the differences:

**Causally relevant (candidate mechanisms, not established):**
1. **Module discovery state of the failing session** — the only dimension on which the failing session is known to differ *in an unobserved way*. `Get-FileHash` lives in `Microsoft.PowerShell.Utility`; if that module was neither imported, nor discoverable on `$env:PSModulePath`, nor reachable by auto-loading, resolution fails with exactly this message. Nothing published records the failing session's `PSModulePath`, module cache, or language mode. **Unverified for the failing session.**
2. **The unpublished orchestration/launch layer** — the outer `STOP` path and the child harness launch are both invisible. A launch that replaced `$env:PSModulePath`, used `-NonInteractive` with a constrained `-Command`, or ran the harness under a host that suppressed auto-loading would explain both call sites with one cause. **Unverified — the orchestrator and `run-pf11-hash-compat.ps1` are not in IRR.**

**Merely observational (cannot explain it):**
- **cmdlet vs function** as the resolved *type*: in the PS 5.1 test the same cmdlet legitimately resolves as a *function* (the `Utility` module exports a function wrapper in 5.1). Command type differs *because* resolution succeeded, not as a cause of failure. It is a consequence marker, not a mechanism.
- **Host / ConsoleHost**: all three cases are ConsoleHost.
- **`-NoProfile`**: used in the failing run *and* in both passing tests — it is not a differentiator. (It does mean a profile could not have *added* a definition; equally it could not have *removed* one.)
- **`-NoExit` / `-NoLogo`**: affect lifetime and banner only; the failing session demonstrably reached Gate 5 and executed code.
- **7.6.8 vs 5.1 engine**: the user's 5.1 test passes on the same machine at the same version, so edition is not the discriminator.
- **Filesystem permissions / file existence / algorithm**: never reached — no hashing error was emitted.
- **Machine identity / OS build**: `DESKTOP-NO0NHTP`, NT 10.0.26300.0 — the same host family as the passing 5.1 test.

**Cannot be evaluated (evidence absent):**
- the failing session's `$env:PSModulePath`, `Get-Module -ListAvailable Microsoft.PowerShell.Utility`, `$ExecutionContext.SessionState.LanguageMode`;
- whether the harness child inherited the parent's environment and module state;
- whether the outer Gate 6 and the harness used the same resolution mechanism (`&`/call operator, dot-sourcing, or `Invoke-Expression`);
- whether a job, runspace, or remoting hop existed (no `WSMan` evidence in the header; `PSRemotingProtocolVersion 2.3` is a default field and is **not** evidence of remoting);
- the exact outer `Get-FileHash` statement (orchestrator unpublished).

**Counter-evidence against a host-wide or version-inherent defect (all recomputed this pass):**
1. The user's **PowerShell 5.1.26100.9444** test — the *same version and edition* as the failure — resolves `Get-FileHash` and computes a SHA-256: **PASS**.
2. The root-safe capture `cap03-p1-20261027T133547Z` (13:36Z = 19:06 local, ~4 hours after the failure) records `ScriptSHA256 = 804A8322…`, which I recomputed from `02-executed-instrument.ps1` (11,257 B) and **matched**; the v2 instrument's own `Get-FileHash -LiteralPath $PSCommandPath` (line 211) therefore **worked** on this machine. That capture records no session, so its engine is **UNKNOWN** — it corroborates "the cmdlet exists on the host", not "5.1 resolves it".
3. Capture `cap03-p1-20261027T110433Z` ran in **pwsh 7.6.8 Core**; `ScriptSHA256 = DE763BA2…` recomputed from source (10,285 B) and **matched**.
4. The compatibility run at **23:07:39**, same host and same `Run ID`, produced fixture-file hash `37CD8B00…`, which I independently reproduced as the SHA-256 of the blob `gitdir: C:\git-metadata\worktree` — a **real** computation, not a stub. The harness and helper logic are sound; the compat result does not impugn them and does not explain the native failure.

---

## D. Root-cause classification

> **MOST LIKELY CAUSE — NOT PROVEN**

The failure was a **genuine `CommandNotFoundException`**: in that one Windows PowerShell 5.1 session, command discovery could not find `Get-FileHash` — the same failure at the outer Gate 6 *and* inside the harness's `Get-TreeFingerprint`. The most likely mechanism is a **per-session command-discovery/module-state condition** (module not imported and not resolvable on that session's `$env:PSModulePath`, or auto-loading suppressed by the unpublished launch layer), not a defect in the harness, the helper, the OS, or PowerShell 5.1 generally. It is **not reproducible from the published evidence** and it is **contradicted** as a host-wide or version-inherent defect by the same-version 5.1 pass and by the 19:06-local capture whose `ScriptSHA256` was computed successfully. It is **not a hashing error** and **not** a `cmdlet`-vs-`function` defect: had resolution succeeded, either command type would have hashed.

What would raise this to CONFIRMED: the failing session's `$env:PSModulePath` and `Get-Module -ListAvailable Microsoft.PowerShell.Utility` output, plus the outer orchestrator's Gate 6 statement. Both are **already-created artifacts held by the operator** — no host rerun is required.

---

## E. Minimum remediation

**No code correction is justified today.** The harness, helper and instrument are byte-identical to what was executed and their hashing logic is independently confirmed (`37CD8B00…`). There is no repository defect to fix.

The **minimum** defensible remediation is *diagnostic*, not corrective:

1. **(Earliest, zero-risk, no host run)** Obtain from the operator the three unpublished artifacts: the Gate 5/Gate 6 orchestrator script, `run-pf11-hash-compat.ps1`, and `harness-error.txt` — plus the unrun remainder of §16.157.6 item 1 (`$PSVersionTable`, `Get-Command Get-FileHash`, `Get-Module -ListAvailable Microsoft.PowerShell.Utility`, `$env:PSModulePath`) from **that** session if it still exists. Publication into IRR would need a fresh session/branch; this investigation does not write them.
2. **(Optional, only if a future capture is authorized and only as a pre-invocation assertion)** A cheap, non-mutating in-session guard — `if (-not (Get-Command Get-FileHash -ErrorAction SilentlyContinue)) { throw }` — placed *before* any work, so a discovery failure stops at a named diagnostic rather than at Gate 6. This is a **recommendation only**; it does not implement the native prerequisite and must not be read as satisfying it.
3. **Rejected as remediation:** pinning an engine/version, `Import-Module Microsoft.PowerShell.Utility` as a blanket fix, or replacing `Get-FileHash` with a .NET hashing call. Each pre-supposes the mechanism, and (3) would alter the executed harness identity.

---

## F. Actions completed vs recommendations

**Completed this pass (all read-only, IRR only):**
- Re-verified `main` live at `bb427aea8897d438329adda41175f9ff2a91817e` via `git ls-remote`; unshallowed the clone to full history (888 commits).
- Exhausted the PF-11 path inventory at `main`; confirmed **no** orchestrator, **no** compat runner, **no** `harness-error.txt` in the repository (banner-string `git grep`, `ls-tree`).
- Read all six published PF-11 files verbatim; recomputed blob IDs (all six match).
- Recomputed harness/helper/instrument SHA-256 from `main`: `0e56dae1…` / `65dde9a1…` / `13783385…`; harness 4,014 B, 78 LF, 0 CR.
- Located the sole `Get-FileHash` in the harness (line 16) and its first invocation (line 64) — establishing the failure is *after* all six assertions, consistent with `harness-output.txt`.
- Extracted both 27 Oct captures; recomputed `02-executed-instrument.ps1` digests — `804A8322…` (root-safe, MATCH) and `DE763BA2…` (earlier, MATCH); recovered the `pwsh 7.6.8 / Core` session record for `T110433Z` and confirmed `T133547Z` records no session.
- Independently reproduced the compat run's `37CD8B00…` hash from the fixture bytes, proving the compat run really hashed.
- Confirmed the procedure imposes Windows PowerShell 5.1 (line 60) but neither the procedure nor the v2 instrument contains **any** engine check or `Import-Module` — i.e. the prerequisite is stated, unenforced, and unrecorded.
- Classified term-not-recognized vs hashing errors against the actual message text.

**Recommended, not performed (no authority or no evidence):** obtaining the unpublished operator artifacts; any host diagnostic; any harness modification; any native prerequisite satisfaction; any capture; any gate advancement.

**Explicitly NOT done:** PF-11 rerun; new capture; P-1 execution/consumption/authorization; PF-15/S3/QE/DQ-4/Gate 4/Gate 5 movement; any edit to historical logs, the native failure record, or the §16.158 waiver; any IPD write.

---

## G. Governance implications

- **§16.157.5 native prerequisite:** remains **NOT SATISFIED / OUTSTANDING**. Nothing in this diagnosis changes it, and the likely-cause finding does **not** constitute satisfaction.
- **§16.158 waiver:** stands exactly as written — it waived the prerequisite **for PF-11 acceptance only**, on the basis of the compatibility-assisted pass, **without diagnosing the cause**, and it explicitly does **not extend to any subsequent capture**. It authorizes nothing here.
- **§16.159 PA decision package:** remains **PREPARED, NOT ADOPTED**. Note for the record: its `DC` option proposes replacing the native prerequisite with *in-session 5.1 pre-invocation checks*. That substitution is **not effective against this failure class** unless the check itself runs in the same session the harness will run in — and the failure occurred at two call sites in two different scripts, one of them a child process. A pre-check in the wrong session would pass while the harness still fails. This is an observation, not a decision.
- **This investigation explicitly does not decide the native-harness prerequisite for any future capture.** Whether a future capture must be native-harness is a Program Authority question, unaffected by this finding.
- **P-1:** remains **NOT EXECUTED / UNSPENT / NOT AUTHORIZED**. No gate advanced. No historical record altered. Authority granted here was investigation-only and conferred no implementation, admission, or governance authority.
- **Provenance caveat:** the failing run was against checkout commit `115394724…`, not today's `bb427ae`; the harness bytes are identical, so the finding transfers, but the checkout difference is recorded rather than elided.

---

## H. Final disposition

> **PARTIALLY DIAGNOSED — ADDITIONAL EVIDENCE REQUIRED**

The failure class is established (per-session command resolution / `CommandNotFoundException`, reproducible at two call sites from the log and the harness source), the range of possible mechanisms is narrowed to two, and the rejected hypotheses (host-wide or version defect; cmdlet-vs-function; hashing error; harness logic) are each positively excluded. The surviving mechanism cannot be selected between without artifacts the operator already holds.

**Single earliest next action:** obtain from the operator the **two unpublished scripts** — the Gate 5/Gate 6 orchestrator and `run-pf11-hash-compat.ps1` — plus `harness-error.txt` and, if the session is still available, its `$env:PSModulePath` / `Get-Module -ListAvailable Microsoft.PowerShell.Utility`. No host run, no capture, no P-1, no rerun of PF-11.

*End of report. Static analysis only; no PowerShell runtime available; no historical record modified.*

---

# Addendum 2026-10-28-B — recovered-artifact evidence and reconciliation

Record: `IIPS-V3-CAP03-PF11-GATE6-DIAGNOSIS-ADDENDUM-2026-10-28-02`.
Additive: sections A–H above are **not rewritten**. Two statements in them are corrected here by explicit supersession (§I.1). No historical file, log, waiver or acceptance is altered.
Mode: static, read-only. No PowerShell runtime exists in this environment.

## I.1 Supersessions of the A–H text (explicit, minimal)

- **S-1 — process identity (supersedes §B, §C "Invocation mechanism").** Section B stated that the harness "ran as a **child** process outside the transcript window". That is **not established by any published evidence and is withdrawn**. What is established is only that the harness's outputs are timestamped `23:01:48 +05:30`, *after* the transcript's `22:58:11` end. The call operator on a `.ps1` path (`& script.ps1`, the form used by recovered Artifact A) runs in the **same process and runspace**, in a child scope. Whether the historical launch used `&`, a child `powershell.exe`, or something else is **UNKNOWN**; the process identity of the native harness run is **UNVERIFIED**.
- **S-2 — weight of the compatibility run (refines §C counter-evidence item 4 and §D).** Section C/D used the compatibility run's real digest (`37CD8B00…`) to conclude that "harness/helper logic is sound". The recovered Artifact A supplies the mechanism: a script-scope `function Get-FileHash` substituted for the cmdlet, computing `[BitConverter]::ToString(…).Replace('-','')` over `[IO.File]::ReadAllBytes`. That conclusion therefore narrows to: **the harness's traversal and fingerprint logic are sound given *some* working `Get-FileHash` implementation** — it is **not** evidence that the real cmdlet resolves in any session, and **not** evidence of a native pass. Everything else in §C stands.

## I.2 Recovered artifacts (full content stored in this directory)

| Artifact | Copy | Bytes | SHA-256 | Source |
|---|---|---|---|---|
| A — `run-pf11-hash-compat.ps1` | `02-recovered-run-pf11-hash-compat.ps1` | 1,858 | `f8f330612dad73d7444f5da18e89a01529f3f25b74b66b5ab989f4a17868b0d8` | recovered from the user's ChatGPT session library; **original Windows provenance not established** |
| B — `harness-error.txt` | `03-recovered-harness-error.txt` | 721 | `a9c36adccc702b0b3ea91bf266f684631ab7b43094b392cdaaa3e26959f16551` | recovered from the user's ChatGPT session library; **not** from the original results directory |

Full provenance treatment, consistency findings and remaining uncertainty: `04-recovered-artifact-manifest.md`. Static syntax check of Artifact A with `tree-sitter-powershell`: **0 error nodes** (syntax only, not runtime validation).

## I.3 Static analysis of Artifact A

1. **What the function implements.** A script-scope replacement for `Get-FileHash` with two parameter sets (`Path`, default; `LiteralPath`), an `Algorithm` `ValidateSet` defaulting to `SHA256`, `Resolve-Path -LiteralPath` for path resolution, and `[System.Security.Cryptography.HashAlgorithm]::Create($Algorithm)` over `[IO.File]::ReadAllBytes(...)`, emitting `[pscustomobject]@{Algorithm; Hash; Path}` with the digest upper-cased via `[BitConverter]::ToString(...).Replace('-','')`. It reimplements the *contract* the harness consumes (`.Hash` on a file path); it does not implement the cmdlet's provider generality, `-InputStream`, streaming, or non-filesystem behavior.
2. **Defined before the harness is invoked?** **Yes** — the function occupies lines 4–50 and `& $PublishedHarness` is the last statement (line 58). The token `Get-FileHash` occurs **once** in the whole file: at the function definition on line 4. The script never calls the real cmdlet itself; its only call is the harness's, in the harness's own scope chain.
3. **Does it launch a new `powershell.exe`/`pwsh`?** **No.** Static scan finds no `Start-Process`, no `powershell.exe`, no `pwsh`, no `Invoke-Expression`, and no exit-code capture. It is a same-process script.
4. **What `& $PublishedHarness` expresses.** The call operator applied to a `.ps1` **path** runs that script **in the current process and runspace**, in a **child scope** of the calling scope. It is not a child process, not a job, not a remoting hop, and not dot-sourcing (so the harness's variables do not leak back, while the caller's functions remain visible to it).
5. **Function visibility across that boundary.** Command lookup walks the current scope and then its **parent** scopes, and command precedence is **alias > function > cmdlet > external**. The harness's scope is a child of the compat script's scope, so the compat `Get-FileHash` **function** is found before the real **cmdlet** and services the harness's line-16 call. That is the mechanism by which the compatibility run reached a fingerprint at all.
6. **What would establish that this script was used in the historical failing execution.** It cannot be established from the present evidence. Needed: the original file's digest (none was recorded), the original file itself from `…\92d931fb…\`, or the outer wrapper's invocation line showing `run-pf11-hash-compat.ps1` being launched for the *compatibility* step and the harness being launched separately for the *native* step. `harness-compat-result.txt` line 11 names the runner path, which fixes the filename and directory — **not** the bytes, and **not** that it was involved in the failing native execution.
7. **Could the function definition explain a successful compatibility run without proving the original Gate 5/Gate 6 launch path was correct?** **Yes, decisively.** The compat run never exercised the cmdlet: the substituted function satisfied line 16. A PASS under a substituted implementation says nothing about whether `Get-FileHash` resolves in that session, nothing about the orchestrator, and nothing about the native prerequisite. This is a *narrower and more accurate* reading than "the harness works"; it is also the reason the compatibility basis for the §16.158 waiver was recorded as non-native.

**Additional finding — Artifact A is not the outer orchestrator and is not a complete compat runner.** `harness-compat-result.txt` records `Original harness SHA-256`, `Original helper SHA-256`, and a `Stderr:` path to `harness-compat-error.txt`. Artifact A prints no digest, redirects no stream, writes no result file, creates no run ID, starts no transcript, and prints no Gate banner. It therefore cannot have produced `execution.log`, `execution-result.txt` or `harness-error.txt`, and as recovered it does not contain the code that produced the compat result file. Either the operator reproduced only the program body, or an **unpublished outer wrapper** performed digesting, redirection and result writing. Either way the outer wrapper remains unpublished — the same gap the A–H report identified.

## I.4 What Artifact B proves, and what it does not

Proved (all five items requested, each checkable in the recovered text):

- the missing command was **`Get-FileHash`** — `ObjectNotFound: (Get-FileHash:String)`, `FullyQualifiedErrorId : CommandNotFoundException,Microsoft.PowerShell.Commands.ForEachObjectCommand`;
- the error surfaced **while processing the `ForEach-Object` pipeline** (`ForEach-Object :` message prefix, caret under `ForEach-Object`);
- the reported location is **`03-test_pf11_root_safe.ps1:13` char `56`**, and the quoted statement is `Get-ChildItem -LiteralPath $Path -Force -Recurse | ForEach-Object {`;
- the category is **`CommandNotFoundException`** — a command-resolution failure, not a hashing error;
- execution failed at resolution, **before any hash comparison could complete**.

**Corroboration of the harness bytes (new).** In the published harness at `main`, line 13 is exactly `    Get-ChildItem -LiteralPath $Path -Force -Recurse | ForEach-Object {` (71 characters, 4-space indent) and `ForEach-Object` begins at **1-based character 56** — an exact match to the recorded `char:56`. Line 16 of that same function is the only `Get-FileHash` in the harness. The recovered error is therefore **structurally identical** to the published harness in the region it quotes. This is strong corroboration of the published harness identity; it is **not** a byte proof (only the digested copy in the results directory could establish that, and it was never hashed).

Not proved, and not to be inferred from Artifact B:

- **the cause.** The message is the *symptom* of a failed command lookup; it records no `$env:PSModulePath`, no `Get-Module -ListAvailable`, no language mode and no engine state.
- **whether the compatibility function was available in the process that invoked the harness.** It was not: had the compat function been visible to that invocation, line 16 would have resolved and no such error could appear. Artifact B therefore also **excludes** the shadowing mechanism from the *native* run, which is exactly why the compat run needed its own wrapper.
- **the behaviour of the original unpublished orchestrator** — including whether it continued past its own Gate 6 STOP, and whether the harness was launched from the same session.
- **whether any preflight in a parent session protects a separately launched child process.** A preflight proves resolution only in the session that ran it. If the instrument is invoked in that same session (`& $ExecutingScript`, as the revised procedure does), the check is context-equivalent; if a future step reintroduces a separate launcher, it is not.

## I.5 Revised reconstruction

The union of the two published records and the two recovered artifacts supports exactly one description that is evidence-backed at every step:

1. `22:58:10` — Windows PowerShell 5.1.26100.9444 Desktop, ConsoleHost, an interactive session under an **unpublished** orchestrator; Gate 5 PASS printed; at Gate 6 a `Get-FileHash` call failed as `CommandNotFoundException` and the orchestrator printed `STOP:` with the message.
2. `22:58:11` — transcript stopped; `execution.log` closes.
3. `23:01:48` — some **unpublished wrapper** launched `03-test_pf11_root_safe.ps1` (the copy at `…\92d931fb…\`), captured stdout to `harness-output.txt`, stderr to `harness-error.txt`, exit code to `execution-result.txt`. The six assertions passed; `Get-TreeFingerprint`'s `ForEach-Object` (line 13, col 56) threw the **same** `CommandNotFoundException` from line 16; `$ErrorActionPreference = 'Stop'` ended the script with exit 1.
4. `23:07:39` — a compatibility run started the harness under a substituted `Get-FileHash` **function**; traversal logic passed and a fingerprint was produced; recorded as PASS, exit 0, **non-native**.

Step 3 and step 1 may have been the same process/session or different ones; **the record cannot decide it** (S-1). Either way the two failures share one command-resolution mechanism, and the compat success in step 4 is explained entirely by the substitution (S-2).

## I.6 Disposition after the addendum

> **PARTIALLY DIAGNOSED — ADDITIONAL EVIDENCE REQUIRED** *(unchanged)*

The classification in §D — **MOST LIKELY CAUSE — NOT PROVEN**, a per-session command-discovery/module-state condition — is unchanged and is now *better* supported: the two failures are the same message at two call sites, the compat pass is fully explained by substitution rather than by host repair, and no host-wide or version-inherent defect is consistent with the same-version 5.1 pass.

What narrowed: the recovered evidence closes the "cause is in the harness" question and the "a compat function explains the pass" question. What remains: **the outer orchestrator/wrapper and the harness's session module state** — still unpublished, still the only route from *most likely* to *confirmed*.

**Single earliest next action (unchanged in kind, narrowed in scope):** obtain the **outer orchestrator/wrapper** that printed `=== GATE 5 ===`/`=== GATE 6 ===` and that wrote `execution-result.txt` and redirected `harness-error.txt` (together with its invocation lines for the native and compatibility steps), and, if the session is still available, that session's `$env:PSModulePath` and `Get-Module -ListAvailable Microsoft.PowerShell.Utility`. The compatibility runner is no longer the priority: its salient content is recovered and its provenance limitation is recorded.

*End of Addendum 2026-10-28-B.*
