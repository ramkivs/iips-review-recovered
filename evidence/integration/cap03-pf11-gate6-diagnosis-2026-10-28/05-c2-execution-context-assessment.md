# C-2 technical assessment — execution-context equivalence

Record: `IIPS-V3-CAP03-PF11-GATE6-C2-ASSESSMENT-2026-10-28-03`
Mode: **static technical review**. No PowerShell runtime, no host contact, no capture, no P-1 execution.
Status: **TECHNICAL RECOMMENDATION ONLY — NO GOVERNANCE DECISION ADOPTED, REVISED OR REINTERPRETED.**

Scope note: DC-C2 is **already adopted** by Program Authority (`§16.160`, `CV-CORR-140`, `CHG-2026-10-28-03`, adoption record `docs/integration/IIPS_v3.0_CAP03_P1_PA_DECISION_ADOPTION_2026-10-28.md`) and implemented in the revised fresh-capture procedure §4.3a and §4.5. This document does not reopen, rewrite or reinterpret that decision. It assesses whether the adopted decision, as implemented, is technically sufficient, and records one limitation and a defensible alternative for the PA's consideration.

---

## 1. What C-2 does, exactly

- **Adopted text (DC-C2).** For the **next capture attempt only**, the native Windows PowerShell 5.1 harness prerequisite (PF-11 supplement §5 item 2; §16.154.5 / §16.156.6 / §16.157.5) does not apply and is replaced by pre-invocation checks in a single non-elevated Windows PowerShell 5.1 session on `desktop-no0nhtp`: (a) `PSEdition` `Desktop`, major 5; (b) `Get-Command Get-FileHash -ErrorAction Stop` resolves to **Source `Microsoft.PowerShell.Utility`**; (c) `Get-FileHash` of the v2 source bytes read from Git blob `191f5828…` equals `13783385…`; (d) any failure is a STOP before invocation, with the output preserved.
- **Implementation (§4.3a, `Assert-AttemptEngine`).** (a) and (b) as adopted, plus an **additional** clause not present in the adopted text: `$cmd.CommandType -ne 'Cmdlet'` is a STOP; it records `PSEdition`, `PSVersion`, `GetFileHashModule` and `ProcessId`.
- **Implementation (§4.5).** `Assert-AttemptEngine` is re-run as `$EngineCheckNow` **immediately before** `& $ExecutingScript`, and a STOP fires unless `PSEdition`, `PSVersion` and `GetFileHashModule` equal the §4.3a record.

Two facts about the invocation that govern the whole assessment: the instrument is invoked with `& $ExecutingScript` — the **call operator on a `.ps1` path**, which runs in the **same process and the same runspace** as the checking block, in a child scope; and the v2 instrument itself calls `Get-FileHash` during execution (v2 line 211, `ScriptSHA256`), so cmdlet availability is required *after* the check, not only before it.

## 2. Coverage of the plausible failure mechanisms

| # | Mechanism | Would C-2 intercept it? | Basis |
|---|---|---|---|
| M1 | Per-session command-discovery failure — `Microsoft.PowerShell.Utility` not imported, not discoverable on `$env:PSModulePath`, auto-loading unavailable (**the mechanism this investigation holds most likely**) | **YES** | The check runs in the same process and session as the invocation and throws (`-ErrorAction Stop`) before `& $ExecutingScript`. The historical symptom class is reproduced as a STOP at a named gate instead of at a mid-run call. |
| M2 | Shadowing: a `function Get-FileHash` defined in the session, as in recovered Artifact A | **YES, doubly** | Command precedence is alias > function > cmdlet, so a shadow would be returned first. Under the adopted text alone the shadow's `Source` is empty (functions defined outside a module report no source), so check (b) STOPs. The implementation's extra `CommandType -eq 'Cmdlet'` clause STOPs as well. |
| M3 | The check being performed in a *different* session from the invocation | **N/A by construction** | §4.5 runs the check and `& $ExecutingScript` in the same block, so the checked session *is* the invoking session. A separate `powershell.exe` launched *after* the check would break this, and the procedure forbids it ("single, non-elevated … session"), but see L-1. |
| M4 | A spawned child process that itself resolves `Get-FileHash` | **NOT COVERED — and not applicable** | Static scan of v2: **no** `Start-Process`, `powershell.exe`, `pwsh`, or `Invoke-Expression` anywhere; the instrument spawns only `git`. No in-scope child process performs hashing. |
| M5 | Module unloaded between the check and the call | **NOT COVERED** | The check is point-in-time. Residual risk is negligible: nothing in the procedure unloads `Microsoft.PowerShell.Utility`, and the check is re-run immediately before invocation. |
| M6 | Hashing errors proper — permissions, missing path, algorithm, malformed hash | **NOT COVERED, correctly** | These are a different error class (they cannot produce "term not recognized"). The capture's own hash gates (procedure lines 208, 236, 275, 342, 352) cover them as STOPs. |

## 3. Limitations

- **L-1 — the single-session rule is recorded but not enforced.** `$EngineCheck.ProcessId` is captured, but the §4.5 STOP condition compares only `PSEdition`, `PSVersion` and `GetFileHashModule`. If an operator ran §4.3a in one window and §4.5 in another, the equality test could pass while the two records came from different processes. This is *mitigated* by construction (the last check and the invocation are in one block), so the guarantee that matters is preserved; the PID comparison would only add enforcement of the procedure's own "single session" instruction.
- **L-2 — the `CommandType -eq 'Cmdlet'` clause is stricter than the adopted decision, and its behaviour in Windows PowerShell 5.1 is unverified.** The adopted text requires only Source `Microsoft.PowerShell.Utility`; §4.3a additionally requires `Cmdlet`. If a healthy Windows PowerShell 5.1 session reports `Get-FileHash` as a **Function** from `Microsoft.PowerShell.Utility`, §4.3a would STOP a working session — a fail-safe but capture-blocking false negative. Status: **UNVERIFIED**. No Windows PowerShell 5.x runtime exists in this environment, and `V1102` (DC-a/DC-b on the designated host) is already recorded as **NOT EXECUTED — OPEN**. Note that the only in-session 5.1 command-type observation available to this diagnostic series reported `Function`; that observation is not published in IRR, was not captured with the exact `Get-Command` output, and must not be treated as established. This limitation is a *risk to be retired by the already-required host step*, not a defect to be fixed blind.
- **L-3 — C-2 is a substitution, not an explanation.** It removes the dependency on the historical harness session without diagnosing it. The native run `92d931fb…` remains NOT PASSED and unexplained; the compatibility-assisted pass remains a traversal-logic pass only. C-2 cannot make either record a pass, and this document does not.
- **L-4 — C-2 does not test the harness at all.** It establishes that the *attempt session* can resolve and use `Get-FileHash`, which is what the v2 instrument needs. The PF-11 harness is not invoked by the capture, so its native behaviour remains untested — accepted by the PA in §16.160 and not changed here.
- **L-5 — scope is one attempt.** DC-C2 is capture-scoped to the next attempt only. A subsequent attempt reverts to the native prerequisite unless the PA acts again.

## 4. Verdict

**CONDITIONALLY SUFFICIENT** — for the purpose for which it was adopted.

Sufficient for: protecting the next capture against the observed failure class (a `Get-FileHash` command-resolution failure in the invoking session), including the shadowing variant demonstrated by recovered Artifact A, because the check runs in the same process immediately before a same-process invocation, is fail-safe on every branch (`Get-Command … -ErrorAction Stop`, Source equality, command-type equality), and no in-scope child process resolves the command independently.

Not sufficient for: proving the native harness prerequisite satisfied; explaining or converting native run `92d931fb…`; discharging §16.157.5 beyond the single adopted attempt; or guaranteeing the next attempt is not stopped spuriously if L-2 resolves against `Cmdlet`.

## 5. Recommendation (technical; none of R-1…R-3 is applied, adopted or authorized here)

- **R-1 (retires L-2, already an open step).** Execute the already-required `V1102` host step (DC-a/DC-b on the designated host) and record the **actual** `CommandType` and `Source` that Windows PowerShell 5.1 reports for `Get-FileHash`. No change should be made to §4.3a before that value is known.
- **R-2 (only if R-1 shows `Function`).** Align §4.3a to the adopted text's condition — Source `Microsoft.PowerShell.Utility`, command type in `{Cmdlet, Function}` — **and** add a positive functional control that a shadow cannot satisfy: hash a file whose content the check itself fixes and compare against a precomputed constant (for example the empty file, SHA-256 `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`). Comparing to a constant proves the resolved command *actually hashes to a known value*, which metadata inspection alone does not. Any such edit is a procedure change and requires PA adoption.
- **R-3 (retires L-1).** Add `$EngineCheckNow.ProcessId -ne $EngineCheck.ProcessId` to the §4.5 STOP condition, thereby enforcing the single-session rule that the procedure already states. One-line, additive, no behavioural change to the instrument.
- **R-4 (done in this pass, no authority needed).** Record both recovered artifacts with full content, digests and provenance in the durable evidence record (`04-recovered-artifact-manifest.md`, `SHA256SUMS.txt`).

Rejected as recommendations: pinning an engine or version; blanket `Import-Module Microsoft.PowerShell.Utility`; redefining `Get-FileHash` (the compatibility technique itself); replacing the harness's hashing with .NET calls. The first three pre-suppose the undiagnosed mechanism; the last two would change the executed harness identity and manufacture a passing result.

## 6. Non-grants

This assessment does not authorize or perform: any host contact or PowerShell diagnostic; any PF-11 or harness run; execution of the compatibility script or the instrument; a capture; P-1 execution, consumption or authorization; any IPD write or `BASIS_COMMIT` change; any change to PF-11 acceptance, its waiver, PF-17, P-1-C, P-1-D, S3, QE, DQ-4, Gate 4 or Gate 5; any edit to the PA decision package or to the adoption record.

---

*End of C-2 technical assessment.*
