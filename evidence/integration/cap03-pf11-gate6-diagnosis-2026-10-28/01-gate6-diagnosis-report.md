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
