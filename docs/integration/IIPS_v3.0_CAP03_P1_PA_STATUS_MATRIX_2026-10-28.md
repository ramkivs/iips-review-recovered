# CAP-03 P-1 — Program Authority Item Status Matrix, DC-C2 Conformance, PF-11 Reconciliation, and Readiness (`2026-10-28`)

> **STATUS: RECORD ONLY. P-1 IS NOT EXECUTED / UNSPENT / NOT AUTHORIZED.** This matrix records the status of each Program Authority (PA) item accurately. It does not decide any PA-reserved item, and it does not infer any approval or signature. No PowerShell or harness run, host diagnostic, capture, IPD write, `BASIS_COMMIT` change, PF-11 change, PF-17 change, or gate movement occurred or is implied.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1-PA-STATUS-MATRIX-2026-10-28-01` |
| **Tracker** | §16.163 (`CV-CORR-143`, `CHG-2026-10-28-06`), `V1122`–`V1131` |
| **Related** | Adoption record `IIPS_v3.0_CAP03_P1_PA_DECISION_ADOPTION_2026-10-28.md` (§8 additive); addendum `IIPS_v3.0_CAP03_P1_ADOPTION_RECONCILIATION_2026-10-28.md`; procedure `IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md` (revision 2026-10-28b); D2 handoff `IIPS_v3.0_CAP03_D2_IPD_RECEIPT_HANDOFF_2026-10-28.md`; package `IIPS_v3.0_CAP03_P1_PA_DECISION_PACKAGE_2026-10-28.md` (**historical, NOT ADOPTED, unchanged**) |

---

## 1. Verified baselines (this pass, read-only)

| Item | Verified value | Method |
|---|---|---|
| IRR `origin/main` before this pass | `41f77b1d172e80c7653f972daf15ccb0b8f713c7` (PR #341 merge) | `git ls-remote origin refs/heads/main` |
| IPD `main` | `888eb375eebee01640e44ccdcbb138a71e8c4513` (unchanged; no IPD write) | `git ls-remote` of `ramkivs/iips-production-market-data` |
| Open PRs (IRR) | none | `gh pr list --state open` |
| Open PRs (IPD) | none | `gh pr list -R ramkivs/iips-production-market-data --state open` (re-run this pass) |
| PR #339 | MERGED, merge `4e9cc40e`, head `6ba9d719` | `gh pr view` |
| PR #340 | MERGED, merge `3777dae4`, head `3ecabdc7` | `gh pr view` |
| PR #341 | MERGED, merge `41f77b1d`, head `cf88e50a` | `gh pr view` |
| Six published PF-11 files `handoff/evidence/pf11-root-safe/` | 6 files; `git diff 41f77b1d origin/main --` on the directory is empty | `git diff --stat` |
| PF-11 diagnosis directory (PR #340) | `sha256sum -c SHA256SUMS.txt`: all OK (00–05) | `sha256sum -c` |
| v2 instrument | blob `191f5828461286b0f6fcb688b023da5dfc68a265`; 10,990 bytes; SHA-256 `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e`; zero CR bytes; worktree bytes equal `origin/main` | `git hash-object --no-filters`, `wc -c`, `sha256sum`, `tr`, `cmp` |

## 2. PA item status matrix

Key: **Adopted** = adopted as written by the 2026-10-28 directive. **Reserved** = a PA decision that this pass has not made. **Applied** = implemented in IRR within the adopted text, with no new decision.

| ID | Question | Basis | Status now | Who decides | Blocks |
|---|---|---|---|---|---|
| **PA-1** | Is H-12 adoption a P-1 precondition? Does "host preflight" mean Gate 4 S3 (after S1 and S2a), or P-1-C? | Gate 4 §6 order: S1 P-1 → S2 Limb A → S2a H-12 → S3 host/runtime preflight → S4 QE. Act §3.2(2)/§8: H-12 "before host preflight and before QE-1". | **OPEN — record-supported reading only** (H-12 is not a P-1 precondition). "Before host preflight" is still ambiguous. Not decided. | **PA** (reserved) | P-1 only if the alternate reading is adopted |
| **PA-2** | Designate the H-12 regeneration commit and the QE pin. | `a52b47b0…` is the Gate 4 literal pin and is **pre-binding** (`gateAPrimeValidation.ts` null there). `001c3c80…` is **post-binding** (non-null; the addendum's proposed candidate). | **OPEN — no pin designated.** This pass does not designate one. | **PA** (reserved) | H-12 adoption; QE. Does not by itself block the P-1 pin |
| **PA-3a** | DC-C2 (c) conformance: literal `Get-FileHash` or the .NET substitution. | DC-C2 (c) as adopted: `Get-FileHash` of the v2 bytes equals `13783385…`. | **APPLIED to the procedure (rev. 2026-10-28b) as the adopted literal text**: `Get-FileHash -Algorithm SHA256 -InputStream` over a `MemoryStream`. Ratification of the .NET substitution as an amendment was **not** requested or inferred. Host execution **NOT EXECUTED** (`V1102`). | PA may reverse by amendment; no PA decision is inferred | Next capture (with V1102) |
| **PA-3b** | DC-C2 (b) conformance: Source-only, or the stricter `CommandType -eq 'Cmdlet'` clause. | DC-C2 (b) as adopted: Source `Microsoft.PowerShell.Utility`. The `CommandType` clause was **added by the 2026-10-28 procedure revision (PR #339), not by the adopted text**. Tracker V1111 describes it as an implementation addition. No governing artifact requires it (verified by search this pass, `V1128`). | **APPLIED — conformed to the adopted Source-only test** (rev. 2026-10-28b). This corrects an IRR deviation from adopted text; it is not a new PA decision. **Recorded as a PA option:** the PA may instead ratify the stricter clause (option ii) by amendment. The addendum's advice to delay until `V1102` reports the actual values is superseded by "adopt as written"; `V1102` must still record `CommandType` and `Source`. | PA may reinstate by amendment | Next capture (with V1102) |
| **PA-3c** | L-1: enforce single-session `ProcessId` equality at §4.5. | The DC-C2 preamble requires "a single non-elevated Windows PowerShell 5.1 session"; procedure line 62 states the same. | **APPLIED** (rev. 2026-10-28b, §4.5): `ProcessId` equality added to the engine recheck. Fails closed; no behaviour change on a conforming run. | Applied within the adopted text | Next capture |
| **PA-3d** | Diagnostics: record `$PID`, `[Environment]::CommandLine`, and `$env:PSModulePath` at §4.3a as read-only metadata. | Not in the adopted DC-C2 text. Addendum §3.5: a procedure change needs PA adoption. | **NOT APPLIED — PA-reserved.** Not gating. The native-failure investigation (run `92d931fb`) remains open without it. | **PA** (reserved) | Nothing gating; investigation only |
| **PA-5** | D2 receipt semantics: `basisCommit` records `BASIS_COMMIT`, not the executing HEAD. | DA-A1 (adopted as written): "Any provisioning receipt must record both the compiled basis and the executing HEAD and tree." IPD `main` (`888eb375`) records the basis only (§3 of the D2 handoff). | **OPEN — adopted-requirement gap, confirmed.** Three options (A: operator bundle plus amendment; B: IPD correction, new execution pin, fresh S2 evidence; C: hold). The choice is not made here. | **PA** (reserved); IPD work needs separate IPD authorization | **P-1 authorization** |
| **DA-A1** | P-1 execution-pin of record `001c3c80…` (candidate-scoped). | Adopted as written 2026-10-28. | **ADOPTED. Receipt-recording element not met in IPD `main`** (see PA-5). | — | P-1 authorization (via PA-5) |
| **DB-B1** | v2 as the sole instrument identity (LF-only; 10,990 B; SHA-256 `13783385…`). | Adopted as written. Procedure revision 2026-10-28 applied it; 2026-10-28b unchanged. | **ADOPTED and applied** (DB check in §4.4 retained). | — | — |
| **DC-C2** | Native-harness prerequisite replaced for the next capture by checks (a)–(d). | Adopted as written. | **ADOPTED. Procedure conformance status in §3 below.** Execution on the host **NOT EXECUTED** (`V1102`). | — | Next capture |

## 3. DC-C2 (a)–(d) conformance status

| Element (adopted text) | Before 2026-10-28b (rev. 2026-10-28) | After 2026-10-28b | Host execution |
|---|---|---|---|
| **(a)** `PSEdition` `Desktop`, major 5 | Conforms (§4.3a, `Assert-AttemptEngine`) | Conforms (unchanged) | **NOT EXECUTED** (`V1102`) |
| **(b)** `Get-Command Get-FileHash` resolves to Source `Microsoft.PowerShell.Utility` | **Deviated** (extra `CommandType -eq 'Cmdlet'` clause) | **Conforms** (clause removed; PA-3b) | **NOT EXECUTED** (`V1102`) |
| **(c)** `Get-FileHash` of the v2 bytes equals `13783385…` | **Deviated** (`.NET` `Get-Sha256Hex` substitution; disclosed only in an in-code comment; not disclosed in the adoption record) | **Conforms** (literal `Get-FileHash -InputStream` over `MemoryStream`) | **NOT EXECUTED** (`V1102`) |
| **(d)** Any failure is a STOP before invocation | Conforms | Conforms (§4.5 recheck, now with `ProcessId`) | **NOT EXECUTED** |

The adoption record's statement (§1, and the DC-C2 row) that the procedure adopts (a) and (b) "as written" was **inaccurate for (b)**, and its silence on the (c) substitution was **inaccurate by omission**. Both are corrected by the additive adoption-record §8 and by tracker §16.163. Both deviations were introduced by IRR's 2026-10-28 procedure revision, not by the PA. That is why they are corrected here, not treated as a new decision.

## 4. L-1, L-2, and the native `Get-FileHash` failure

| Item | Status now |
|---|---|
| **L-1** (single-session `ProcessId` not compared) | **APPLIED** (rev. 2026-10-28b, §4.5). |
| **L-2** (`CommandType` of `Get-FileHash` under 5.1 unverified) | **OPEN, host-gated.** The `CommandType` clause is removed (§3 (b)), so L-2 no longer gates the procedure. `V1102` must still record the actual `CommandType` and `Source` for the record. NOT EXECUTED. |
| **Native `Get-FileHash` failure** (run `92d931fb`: harness exit 1; `Get-FileHash` `CommandNotFound` at harness line 16 via `Get-TreeFingerprint`; Windows PowerShell 5.1.26100.9444 Desktop) | **NOT PASSED. UNDIAGNOSED.** Not explained, not converted, and not rewritten as passed or resolved. The compat-run success (see §5) is not an explanation of it. |

## 5. PF-11 reconciliation and diagnosis limits (no change this pass)

| Item | Status |
|---|---|
| **PF-11 acceptance** | Accepted under tracker §16.158 as **compat-assisted**. Unchanged. Not reopened. |
| **Native PF-11 result** | **NOT PASSED.** Run `92d931fb` remains a failure. |
| **Compat run** (23:07:39 +05:30) | Reported as PASSED through an **unpublished** runner. Not native evidence. |
| **Recovered artifacts** (PR #340, `evidence/integration/cap03-pf11-gate6-diagnosis-2026-10-28/`) | Recovered from a ChatGPT session library; **original Windows provenance NOT established**. Digests verified (`sha256sum -c` OK). Contents are recorded as recovered, not as Windows evidence. |
| **Published six files** `handoff/evidence/pf11-root-safe/` | Unchanged since `41f77b1d` (verified). |
| **Diagnosis limits** | (i) The compat script defines `function Get-FileHash`, which can shadow the cmdlet in the harness session (inference; `V1102` would test it). (ii) The harness-compat error artifact is unpublished. (iii) The capture `…133547Z` has no transcript and an unknown engine. (iv) The capture `…110433Z` ran PowerShell 7.6.8 Core (PID 1556), contrary to procedure line 60; it is **not** 5.1 evidence. (v) The earlier "R-2" claim that a constant-hash control defeats a shadow is **incorrect** (addendum §3.3); the R-2 text in PR #340 is not edited (append-only). |
| **What this does not show** | No native pass. No explanation of the native failure. No evidence that Windows PowerShell 5.1 reports `Get-FileHash` as a cmdlet. No evidence that any capture would pass. |

## 6. Blocker and readiness matrix

| Workstream | Readiness | Blocker(s) | Owner of next step |
|---|---|---|---|
| **P-1 authorization** | **BLOCKED** | PA-5 (D2); DA-A1 receipt element unmet; act-designated pin mechanics (§8 step 0 undefined term); PA-1 if the alternate reading is adopted | PA (reserved) |
| **P-1 execution** | **NOT AUTHORIZED** | Everything above; plus separate authorization | PA |
| **Next capture (P-1-C / P-1-D preflight)** | **BLOCKED** | `V1102` host execution (separately authorized, not an IRR step); separate PA capture authorization; DC-C2 literal text now in procedure (rev. 2026-10-28b) | PA + operator (host) |
| **PF-17 capture limb** | **NOT SATISFIED** (register limb verified; capture limb NOT EVIDENCED) | Capture not performed | PA + operator |
| **P-1-C** | **NOT ESTABLISHED** | Capture not performed | — |
| **P-1-D** | **DESIGNATED, NOT VERIFIED** | Capture not performed | — |
| **H-12 adoption (Gate 4 S2a)** | **BLOCKED** | PA-2 (pin); PA-1 (sequencing reading); S2 Limb A not in this pass | PA |
| **QE (Gate 4 S4)** | **BLOCKED** | PA-2; S3 not performed | PA |
| **IPD D2 correction** | **HANDOFF READY, NOT AUTHORIZED** | PA-5; separate IPD authorization; a correction commit moves the execution commit away from `001c3c80…`, so a new PA designation and fresh S2 evidence are needed (DA-A1) | PA, then IPD owner |
| **PF-11 (accepted, compat-assisted)** | **UNCHANGED** | Native not passed; not reopened | — |
| **S3 / QE / DQ-4 / Gate 4 / Gate 5** | **UNCHANGED — NOT ADVANCED** | All of the above | — |
| **`BASIS_COMMIT` `5fc74085…`** | **UNCHANGED** (IRR may not change it) | — | — |

**P-1 status (header row 21; §§16.143/144/153):** P-1-A SATISFIED (candidate-scoped). P-1-B SATISFIED (`001c3c80618f2ee1d40e9a90912237e1a06e7b58`). P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, not verified. P-1-E SATISFIED (PF-15 act `-02`). P-1-F UNSPENT. **Unchanged by this pass.**

## 7. Changes made in this pass (IRR only)

| Artifact | Change |
|---|---|
| Procedure `IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md` | Revision 2026-10-28b: header row; §4.3a DC-b → Source-only; §4.4 literal DC-C2(c) block plus corrected comment; §4.5 `ProcessId` equality; §6.2 register `V1122`–`V1125`. Parse: 7 blocks, 0 error nodes. |
| Adoption record `IIPS_v3.0_CAP03_P1_PA_DECISION_ADOPTION_2026-10-28.md` | Additive §8 only (corrections and the 2026-10-28b revision). Existing text unchanged. |
| This matrix | New. |
| D2 handoff | New. |
| Tracker | Append-only: §16.162.5 publication receipt for PR #341; §16.163 (`CV-CORR-143`); CHG row `CHG-2026-10-28-06`. |
| Package, PF-11 directories, `handoff/evidence/pf11-root-safe/`, historical procedure revision | **Unchanged.** |
| IPD | **Unchanged. No write, ref, branch, or PR.** |

## 8. Non-grants (restated)

No P-1 execution or authorization. No capture. No host diagnostic. No PowerShell, harness, or compat-script execution. No PF-11 reopening or acceptance change. No PF-17 satisfaction and no change to its requirement. No P-1-C or P-1-D acceptance. No S3, QE, DQ-4, Gate 4, or Gate 5 movement. No IPD write, branch, or PR. No `BASIS_COMMIT` change. No PA approval, decision, or signature supplied or inferred. No native pass claimed. No conversion or explanation of the native `Get-FileHash` failure.

---

## 9. Authority reconciliation pointer and correction (PR #342)

Authoritative reconciliation: adoption record §9 (`V1132`–`V1137`). Summary of what changes in §§2–3 of this matrix:

- **PA-3a and PA-3b.** The applied procedure text is the adopted text (package §3.6(b) and (c); §4 items (2)–(3); Appendix A A7). These are **implementations of an adopted requirement**, not open PA decisions. The only remaining PA options are optional amendments to ratify a deviation: re-adding the `CommandType` clause, or ratifying the `.NET` substitution. Neither was requested or made.
- **Correction.** §3 above says the `.NET` (c) substitution was "not disclosed in the adoption record". That is inaccurate. Adoption record §4 row A7 discloses it, but describes it as applied "as written". The statement is corrected in adoption record §9.4.
- **New residual item.** Appendix A A6 method: the bytes are held in memory, not written to a file. This is disclosed in adoption record §4 and is **unresolved PA-reserved**. It blocks capture until resolved.
- Unchanged: PA-1, PA-2, PA-3d, PA-5 (PA-reserved). L-2 host-gated. DC-C2 host execution NOT EXECUTED (`V1102`). P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

*End of record `IIPS-V3-CAP03-P1-PA-STATUS-MATRIX-2026-10-28-01`. P-1 remains NOT EXECUTED, UNSPENT, and NOT AUTHORIZED.*
