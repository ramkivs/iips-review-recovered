# Recovered artifact manifest and provenance record

Record: `IIPS-V3-CAP03-PF11-GATE6-RECOVERED-ARTIFACTS-2026-10-28-02`
Parent report: `01-gate6-diagnosis-report.md` (sections A–H) and its `Addendum 2026-10-28-B` (section I).
Investigation mode: **static, read-only**. No PowerShell runtime exists in this environment; nothing in this record is an execution result.

---

## 1. Artifact A — `run-pf11-hash-compat.ps1`

| Field | Value |
|---|---|
| Published copy (this record) | `evidence/integration/cap03-pf11-gate6-diagnosis-2026-10-28/02-recovered-run-pf11-hash-compat.ps1` |
| Content | Stored in full, byte-for-byte as supplied. Not reformatted, not corrected, not annotated inline. |
| Bytes | **1,858** |
| Lines | 58 (57 line terminators + final newline); **CR = 0**, LF only; trailing space on line 1 preserved where present |
| SHA-256 | **`f8f330612dad73d7444f5da18e89a01529f3f25b74b66b5ab989f4a17868b0d8`** |
| Source | **Recovered from the user's ChatGPT session library.** Supplied in full by the user in the `2026-10-28` directive. |
| Original Windows filesystem provenance independently established? | **NO.** No file from `C:\Users\USER\Documents\CAP03-PF11-Results\92d931fb…\` has been produced, and no digest of the original runner was recorded at the time. |
| Location asserted by the historical record | `harness-compat-result.txt` line 11 records `Compatibility runner: C:\Users\USER\Documents\CAP03-PF11-Results\92d931fbb5204f74870aedf78610e29a\run-pf11-hash-compat.ps1`. That establishes the **filename and directory** the compatibility run named; it does **not** establish that the recovered bytes are the bytes that ran. |
| Relation to the historical execution | **NOT ESTABLISHED** as the historical launcher, not the outer Gate 5/Gate 6 orchestrator, and not shown to have run in the same process or session as native run `92d931fb…`. |
| Remaining uncertainty | (i) byte identity with the executed runner — unproven; (ii) the artifact is **behaviourally incomplete** relative to the recorded compatibility run (see §3 below); (iii) whether the recovered content is the original program text, an excerpt, or a reconstruction, and (iv) whether any wrapper supplied the missing behaviour. |

Static syntax check: parsed with `tree-sitter-powershell` (local Python, no PowerShell runtime) — **0 error nodes, `has_error = false`**. This is a syntax check only; it is not a runtime validation.

## 2. Artifact B — `harness-error.txt`

| Field | Value |
|---|---|
| Published copy (this record) | `evidence/integration/cap03-pf11-gate6-diagnosis-2026-10-28/03-recovered-harness-error.txt` |
| Content | Stored in full, verbatim. The mid-word line break and trailing space on line 1 (console wrapping) are preserved. |
| Bytes | **721** |
| Lines | 7; **CR = 0**, LF only |
| SHA-256 | **`a9c36adccc702b0b3ea91bf266f684631ab7b43094b392cdaaa3e26959f16551`** |
| Source | **Recovered from the user's ChatGPT session library**, not from the original Windows results directory. |
| Original Windows filesystem provenance independently established? | **NO.** The path recorded by the historical run — `execution-result.txt` line 8: `Harness stderr: C:\Users\USER\Documents\CAP03-PF11-Results\92d931fb…\harness-error.txt` — is where the original would have been created. No original file and no digest from that directory exists in IRR or in this investigation. |
| Relation to the historical execution | **CORROBORATIVE, not chain-of-custody.** It is consistent with the published six-file record in every checkable respect (§`Addendum 2026-10-28-B` §I.3), including an exact line-**13**, char-**56** alignment against the published harness bytes. |
| Remaining uncertainty | Whether the recovered text is the complete original file (it has 7 lines and no visible truncation), and whether it was emitted by the same invocation that produced `execution-result.txt` at 23:01:48 +05:30. |

---

## 3. Consistency test against the recorded compatibility run (finding)

`handoff/evidence/pf11-root-safe/harness-compat-result.txt` records six fields, including `Original harness SHA-256`, `Original helper SHA-256`, and a `Stderr:` path to `harness-compat-error.txt`. The recovered Artifact A contains **no** statement that would produce any of them. A feature scan of the stored bytes finds **no** occurrence of any of: `Transcript`, `Out-File`, `Set-Content`, `Add-Content`, `Start-Process`, `powershell.exe`, `pwsh`, `exit`, `LASTEXITCODE`, `2>`, `Write-Host`, `Write-Output`, `RunId`, `GATE`.

Therefore:

- Artifact A **cannot** be the outer Gate 5/Gate 6 orchestrator: it prints no Gate banner, starts no transcript, creates no evidence directory, records no run ID, redirects no stream, and captures no exit code. It cannot have produced `execution.log`, `execution-result.txt`, or `harness-error.txt`.
- Artifact A, **as recovered**, is not a complete reproduction of whatever produced `harness-compat-result.txt`, because that run recorded the original harness and helper digests and redirected the harness's stderr.
- Two readings remain open and are **not** resolved here: (a) Artifact A is the runner minus code that the operator omitted when reproducing it; (b) Artifact A is the runner as it was, and an **unpublished outer wrapper** computed the digests, redirected stderr and wrote the result file. Either way the outer wrapper remains unpublished.
- What Artifact A **does** establish, as a static fact about the code shown: a compatibility technique existed in which a script-scope `function Get-FileHash` is defined and the published harness is then invoked in the same process, so that the function — not the cmdlet — services the harness's calls. That technique is consistent with the compatibility run's PASS and with its fingerprint value.

## 4. Hash computation method

Digests in this record were computed with `sha256sum` (repository-approved non-runtime tooling used throughout IRR evidence records). No PowerShell, no harness, no instrument, and no capture was executed to produce any value here. `SHA256SUMS.txt` in the parent directory carries the digests of every file in this record.

---

*End of recovered artifact manifest.*
