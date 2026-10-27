# CAP-03 P-1 — Adoption Reconciliation Addendum (D1 reassessment, DC-C2 conformance review) — 2026-10-28

> **STATUS: ADDITIVE RECONCILIATION RECORD — NO ADOPTION, NO AUTHORIZATION, NO DECISION MADE HERE.**
> **P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED.** This record does not authorize P-1, any capture, any host diagnostic, any PowerShell or harness run, any PF-17 or P-1-C/P-1-D acceptance, any PF-11 change, any QE, Gate 4, Gate 5, S3, or DQ-4 movement, any IPD write, or any change to `BASIS_COMMIT`. It does not alter the historical package (`IIPS_v3.0_CAP03_P1_PA_DECISION_PACKAGE_2026-10-28.md`, NOT ADOPTED, unedited), the adoption record (`IIPS_v3.0_CAP03_P1_PA_DECISION_ADOPTION_2026-10-28.md`, unedited), or the procedure (unedited in this pass).

| Item | Value |
|---|---|
| Parent adoption record | `docs/integration/IIPS_v3.0_CAP03_P1_PA_DECISION_ADOPTION_2026-10-28.md` (PR #339, merge `4e9cc40e`); open items D1–D5 |
| Procedure reviewed | `docs/integration/IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md`, revision 2026-10-28 (`origin/main`) |
| Tracker registration | IRR tracker `§16.162`, `CV-CORR-142`, `CHG-2026-10-28-05`, verification `V1113`–`V1121` |
| IRR `origin/main` at verification | `3777dae4a0e87ce1b4251d1c64eb2e9fd0d777e5` (PR #340); no open PRs |
| IPD `main` at verification | `888eb375eebee01640e44ccdcbb138a71e8c4513` (read-only) |
| Scope of this pass | Read-only verification, reconciliation, and recommendation. No repository content outside this addendum and the tracker append changed. |

Terms: "H-12" = the Gate 4 H-12 mandatory-file manifest. "QE" = Gate 4 QE-1…QE-11. "Binding commit" = the S1 commit that sets the three compiled identity constants (determination §7, §9). "Basis" = `BASIS_COMMIT` `5fc74085…` / `BASIS_TREE` `7226ef00…`, the successor act's compiled constants, which the procedure states are not the execution pin (procedure §4.2, DA-A1).

---

## 1. D1 — manifest timing and "final commit" wording

### 1.1 Question carried from the adoption record

Does a manifest (H-12) have to be regenerated at a designated commit **before P-1**? And which artifact defines "the final execution commit"?

### 1.2 Source-by-source reconciliation (IPD `888eb375`, read-only)

| # | Source | What it says on timing / commit | Verified statement |
|---|---|---|---|
| S-a | S1 identity-value determination (`…DETERMINATION_EFFECTIVE_2026-10-24.md`) §7 (≈ line 211), §9 (≈ line 259) | "No commit is declared to be that final execution commit; it is fixed only when the provisioning/QE sequence actually runs." §9: H-12 is "STILL NOT ADOPTED"; no explicit manifest-regeneration requirement. | Uses "final execution commit". Does not place H-12 relative to P-1. |
| S-b | Successor provisioning act (`…SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md`) §8 step 0 (line 258), §8.2 (line 283) | Preflight requires `HEAD` equal to "the act-designated pin" and sha256 of three source files. | **0** occurrences of "manifest" or "H-12" in §8. No manifest precondition. |
| S-c | Gate 4 act (`…GATE4_TARGET_HOST_QUALIFICATION_ACT_EFFECTIVE_2026-10-23.md`) §3.2 item 2 | QE pin = "final post-merge Limb A commit", recorded "before host preflight and before QE-1". | Uses "final post-merge Limb A commit". |
| S-d | Gate 4 act §6 (ordering table) | S1 = Gate A′ provisioning (P-1); S2 = Limb A; S2a = regenerate H-12 at "final IPD commit" + separate PA adoption; S3 = "Host/runtime preflight", BLOCKED until S1 and S2a; S4 = QE-1…QE-11. | Places P-1 (S1) **before** H-12 adoption (S2a), and H-12 adoption before S3/S4. |
| S-e | Gate 4 act §8 (≈ lines 241–266) | H-12 v3 must contain "at the final Limb A commit" 33 paths (corrected to 32 by G4 Amend-01); adoption is a separate PA act "after full validation at the exact final commit and before preflight". | Source of the manifest-at-commit rule. "Preflight" is not defined here. |
| S-f | G4 Amend-01 (`…2026-10-24.md`) | 32 mandatory paths; Limb A reference `a52b47b0…`. | Identifies `a52b47b0…` as the final Limb A merge. |
| S-g | S1 readiness request (`…H12_READINESS_DECISION_REQUEST_2026-10-24.md`) §9 item 2 (line 359) and §9 item 4 (line 372); §6 item 4 (line 242) | §9 item 2: the binding commit makes a commit whose blobs "differ from `a52b47b0…`". §9 item 4 sequence: S1 determination → binding commit → regenerate H-12 "at that final commit" → PA adoption → host preflight (S3) → QE (S4). §6 item 4: the binding commit "moves the final execution commit (§9)". | The §9 item 4 sequence omits P-1 provisioning from its list; it does not contradict S-d. |
| S-h | IPD execution tracker (`…EXECUTION_TRACKER_2026-10-23.md`) row 7 (line 902) | "H-12 regeneration at the final execution commit"; source cited as "successor act §8; Gate 4 act §8 (amended)". | **Citation inaccurate for "successor act §8"** — see §1.4(C). |
| S-i | IPD execution tracker row 8 (line 903) | "H-12 adoption" depends on "7 + S2 native-Windows `npm test` + **S1 P-1 provisioning**". | Lists P-1 provisioning as an **input to** H-12 adoption. |
| S-j | IRR tracker §16.140.4 (P-1-A…P-1-F) | P-1 prerequisites: S2 acceptance, P-1-B pin, P-1-C preflight capture, P-1-D F4 facts, P-1-E PF-15, P-1-F single attempt. | **No H-12 item.** P-1-E: PF-15 "Blocks S3/QE only, never S2/P-1". |

### 1.3 Commit ancestry and content (verified this pass)

| Relation | Result (GitHub compare / contents API, read-only) |
|---|---|
| `a52b47b0…` vs basis `5fc74085…` | Basis is **behind by 4**: `5fc74085` is 4 commits older than `a52b47b0`. |
| `a52b47b0…` vs P-1 pin `001c3c80…` | `001c3c80` is **ahead by 46, behind 0**: `a52b47b0` is an ancestor of the P-1 pin. |
| `a52b47b0…` vs IPD `main` `888eb375…` | `main` ahead by 63. |
| `5fc74085…` vs `001c3c80…` | Ahead by 50, behind 0 (as previously recorded). Consistent with the chain `5fc74085 → 4 → a52b47b0 → 46 → 001c3c80`. |
| `gateAPrimeValidation.ts` constants | At `a52b47b0…`: `PRINCIPAL_LABEL`, `TENANT_ID`, `CANONICAL_OWNER_ID` are **`null`**. At `001c3c80…`: non-null (`'ramki-personal-local'`, `'ipd-personal-local'`, `'ipd-owner-ramki-personal'`). At `5fc74085…`: file absent (404). |
| `gateAPrimeProvisioning.ts` at `001c3c80…` | Line 317: `basisCommit: BASIS_COMMIT,` (no HEAD comparison). |

**Consequence (verified):** the binding change is present at `001c3c80` and absent at `a52b47b0`. The Gate 4 act's "final Limb A commit" (`a52b47b0`) is therefore **pre-binding**. The determination, the S1 request, and IPD row 7 all require H-12 regeneration **after** the binding change.

### 1.4 Findings

**(A) Does H-12 adoption precede P-1? — Record-supported reading: NO. Literal text leaves one reading open.**

- Supporting the NO reading: S-b (no manifest precondition in successor §8); S-d (S1 P-1 precedes S2a H-12 adoption); S-i (P-1 provisioning is an input to H-12 adoption); S-j (no H-12 prerequisite in §16.140.4).
- The open reading: S-c and S-e say adoption is "before host preflight" and the successor act §8 step 0 is itself titled a "Preflight capture" on the host, and it is P-1-C in the IRR register. If "host preflight" in S-e means P-1-C, the literal text would make H-12 adoption a P-1 precondition. The record does not support that reading, because S-d labels the host preflight as S3, which comes after S1 and S2a. The distinction is not explicit in the text.
- **Status: D1-A is a record-supported reading, not a PA determination. PA confirmation is requested before any P-1 authorization act relies on it (PA-1).** Nothing here authorizes or delays P-1 on this basis.

**(B) Which commit is the H-12 regeneration / QE pin? — OPEN; PA designation required (PA-2).**

The governing texts conflict:

| Text | Pin it names | Problem |
|---|---|---|
| Gate 4 act §3.2(2), §8; G4 Amend-01 | "final (post-merge) Limb A commit" = `a52b47b0` | Pre-binding (§1.3). The determination and S1 request require regeneration after the binding change, so H-12 generated at `a52b47b0` would be stale against S-5/S-6. |
| Determination §7/§9; S1 request §6 item 4; IPD row 7 | "final execution commit" — post-binding, "fixed only when the sequence runs", not declared | Not declared in any document. |
| DA-A1 / procedure §4.2 / S2 §5 | P-1 execution pin `001c3c80…` / `399fa44a…` (execution pin of record for the P-1 attempt) | Designated for P-1 only. Does not designate the H-12 or QE pin. |

The Gate 4 act's "no SHA asserted, guessed, or inferred here" rule means no document can supply the H-12/QE pin. Only the PA can designate it, by an express act, before H-12 is regenerated.

**(C) IPD row 7 citation — inaccurate.** Row 7 cites "successor act §8" as a source for H-12 regeneration. Successor §8 contains no manifest or H-12 text (0 matches). The rule is in Gate 4 act §8 alone. This is an IPD-side defect. IRR cannot write IPD, so it is recorded here and not corrected.

**(D) Terminology discrepancy (recorded; not corrected).**

| Term | Where used | Referent in the record |
|---|---|---|
| "final Limb A commit" / "final post-merge Limb A commit" | Gate 4 §3.2(2), §8; G4 Amend-01 | `a52b47b0…` (pre-binding) |
| "final IPD commit" | Gate 4 §6 S2a | Not defined; read as the Limb A pin |
| "final execution commit" | Determination §7, §9; S1 request §6 item 4; IPD row 7 | Post-binding; not declared |
| "act-designated pin" | Successor §8 step 0 | Not defined in the successor act; the procedure (§4.2) reads it as the P-1 execution pin set by the P-1 authorization act (DA-A1) |
| "S3" / "S4" | IPD Gate 4 §6: S3 = host/runtime preflight, S4 = QE | IRR register: "S3/QE" (P-1-E), S3 = host pipe/DACL/filesystem evidence. Label correspondence not stated in either corpus. |

---

## 2. D2 — provisioning receipt records `BASIS_COMMIT` regardless of HEAD

Verified (§1.3): `gateAPrimeProvisioning.ts` at `001c3c80…` returns `basisCommit: BASIS_COMMIT` (line 317) with no HEAD comparison, so a receipt from an execution at `001c3c80` would name the basis `5fc74085…`. Status unchanged: **OPEN for the PA (PA-5)**. No IPD change is made or authorized. P-1 authorization remains blocked until the PA accepts this receipt semantics or amends them by an IPD act. Under the successor §8 step 0 literal text, a HEAD of `001c3c80` is checked against "the act-designated pin", which is not defined in that act (§1.4(D)).

---

## 3. DC-C2 reassessment — conformance to adopted text, in-process probes, and the R-2 correction

### 3.1 Conformance of procedure §4.3a and §4.4 to the adopted DC-C2 text (package §3.6)

| Element | Adopted text (package §3.6, as adopted) | Current procedure (`origin/main`) | Status |
|---|---|---|---|
| (a) edition | `PSEdition` is `Desktop`; major version 5 | Line 177: `PSEdition -ne 'Desktop' -or PSVersion.Major -ne 5` → STOP DC-a | **Conforms** |
| (b) command source | `Get-Command Get-FileHash -ErrorAction Stop` resolves to Source `Microsoft.PowerShell.Utility` | Line 179: adds `CommandType -ne 'Cmdlet'` → STOP DC-b | **Deviates (stricter)** — extra clause not in the adopted text. Recorded as L-2 in PR #340 and §16.161.4; not in the adoption record's D-list. |
| (c) functional hash | "`Get-FileHash` of the v2 instrument's source bytes, read from Git blob `191f5828…`, equals `13783385…`" | Lines 248–255: `Get-Sha256Hex` uses `System.Security.Cryptography.SHA256` over `Get-GitBlobBytes` output. **`Get-FileHash` is not called in the DC gate.** | **Deviates.** Disclosed only in an in-code comment (line 253: "DC-c … yields the same digest"). **Not disclosed in the adoption record** (its DC-C2 summary and D1–D5 do not mention the substitution). |
| (d) STOP before invocation | Any failure is a STOP before invocation; output preserved | Line 182 `$EngineCheck = Assert-AttemptEngine` precedes evidence-directory creation (line 304); line 411 repeats the check before invocation | **Conforms** |

**Conformance status: (b) and (c) do not match the adopted text literally.** The adoption record states the procedure adopts DC-C2 "as written" (adoption record, §1 and DC-C2 row). Under the Appendix A rule ("applied only as written; any conflict … a blocker, not improvised"), (c) is a **conformance blocker for the next capture** until the PA either directs conformance or ratifies the deviation as an amendment. No change is made here.

**Literal conformance for (c), for PA consideration:** Windows PowerShell 5.1 `Get-FileHash` has a `-InputStream <Stream>` parameter set, and Microsoft's 5.1 reference (Example 4) hashes a `System.IO.MemoryStream` through it ([Microsoft Learn — Get-FileHash, 5.1](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-filehash?view=powershell-5.1)). A conformant (c) would therefore compute `Get-FileHash -Algorithm SHA256 -InputStream` over a `MemoryStream` of the blob bytes, with no temp file, and compare to `13783385…`. **Unverified on the host (V1102).** Making (c) literal also makes it a real in-process functional probe, which the current substitution is not.

### 3.2 Where `Get-FileHash` is already called in-process (verified line numbers)

| Line | Use | Ordering relative to the DC gate (line 182) and evidence directory (line 304) |
|---|---|---|
| 69 | `$ErrorActionPreference = 'Stop'` | Before everything; makes a missing cmdlet terminating |
| 178 | `Get-Command -Name Get-FileHash -ErrorAction Stop` (inside `Assert-AttemptEngine`) | Before 304 — the DC gate |
| 263–265 | `Get-FileHash -LiteralPath …` on the IRR tracker and IPD act/tracker (recorded, no constant compared) | **Before** 304; a missing cmdlet would already terminate here |
| 324 | `Get-FileHash -LiteralPath $ExecutingScript` | After 304 |
| 406–410 | `Get-FileHash` on the three IPD successor-§8 step-0 files (`gateAPrimeProvisioning.ts`, `provisioning.ts`, `binding.ts`) at the §4.5 recheck, compared to recorded constants; mismatch throws | After 304. **Constant-compared, but not the v2 instrument.** |
| 411 | `Assert-AttemptEngine` repeated | Before invocation |

So the procedure already contains in-process `Get-FileHash` calls before evidence creation (lines 263–265), which record values without comparing them to constants. The DC gate's only `Get-FileHash`-related content is the `Get-Command` resolution check at line 178. Lines 406–410 do compare `Get-FileHash` output to constants, but for the three IPD step-0 files. For the v2 instrument, the only constant comparisons are the .NET-based checks at lines 255, 285 and 396. So DC-C2(c), as adopted, would add the first `Get-FileHash` constant comparison for the instrument itself.

### 3.3 Correction to the R-2 analysis (PR #340 `05-c2-execution-context-assessment.md` and tracker §16.161.4)

Both documents state that R-2's constant-hash control is a "positive functional control that a shadow cannot satisfy". **That is incorrect.** A shadow `function Get-FileHash` that returns the correct SHA-256 passes a constant-compare check, because the check compares output bytes and never inspects the producer. A constant-hash control detects a **broken or wrong-output** hashing path, not a **shadowed** command. Shadow detection rests on command metadata: a function defined in the session has an empty `Source`, so the adopted Source check (b) STOPs it. The extra `CommandType` clause is not needed for that purpose. This follows from PowerShell command-resolution semantics and is **unverified on the host (V1102)**.

**Consequence:** any future DC-C2 text must not rely on the hash probe for shadow detection. R-2 is **not adopted** and is not applied here. The two earlier documents are left unedited (append-only); this section is the correction of record.

### 3.4 L-1 and L-2 status

- **L-1 (single-session rule not enforced): OPEN.** `ProcessId=$PID` is captured at line 180 (`$EngineCheck`). The §4.5 comparison at line 412 tests `PSEdition`, `PSVersion`, and `GetFileHashModule` only. `ProcessId` is not compared. Recommendation R-3 (add `$EngineCheckNow.ProcessId -ne $EngineCheck.ProcessId`) is not applied.
- **L-2 (CommandType clause): OPEN, host-gated.** Whether Windows PowerShell 5.1 reports `Get-FileHash` as `Cmdlet` or `Function` from `Microsoft.PowerShell.Utility` is unverified; V1102 remains NOT EXECUTED.

### 3.5 Recommended PA decisions (none applied)

| ID | Decision | Options | Recommendation |
|---|---|---|---|
| PA-3a | DC-C2 (c) conformance | (i) Conform: `Get-FileHash -InputStream` over `MemoryStream`, compared to `13783385…`. (ii) Ratify the .NET substitution as an amendment and record it in the adoption record. | (i). It is the adopted text, it is verifiable on the host, and it adds a real in-process probe. |
| PA-3b | DC-C2 (b) conformance | (i) Conform to the adopted Source-only test, pending V1102. (ii) Ratify the `CommandType -eq 'Cmdlet'` clause as an amendment. | Decide after V1102 records the actual `CommandType`/`Source` (R-1). Do not change before that value is known. |
| PA-3c | L-1 | (i) Add the `ProcessId` equality to §4.5 (R-3). (ii) Keep as documented. | (i). One line, no behaviour change. |
| PA-3d | Diagnostics | (i) Record `$PID`, `[Environment]::CommandLine`, and `$env:PSModulePath` at §4.3a as read-only metadata. (ii) None. | (i), for the native-failure investigation. Not gating. |

Any change to §4.3a or §4.4 is a procedure change and requires PA adoption. This pass applies none.

---

## 4. Native `Get-FileHash` failure (run `92d931fb…`) — unchanged

NOT PASSED. Not explained. Not rewritten as passed or resolved. The compatibility-assisted pass remains a traversal-logic pass only. Nothing in this addendum or in DC-C2 explains the historical failure. The "PowerShell 5.1 test" and "function wrapper" explanation cited in PR #340 §C have no published artifact and are not used here as evidence.

---

## 5. Decision requests for the Program Authority (not decided here)

| ID | Question | Recommendation (for PA) |
|---|---|---|
| **PA-1** | Confirm the D1-A reading: H-12 adoption is **not** a precondition of P-1 execution; "host preflight" means Gate 4 S3, after S1 and S2a; P-1-C is the P-1 session preflight and is not the "host preflight" of Gate 4 §3.2/§8. | Confirm, with the reasoning in §1.2–§1.4(A). If the PA reads "host preflight" as P-1-C, H-12 adoption becomes a P-1 prerequisite and P-1 authorization is blocked until H-12 is adopted. |
| **PA-2** | Designate the H-12 regeneration commit and the QE pin. The Gate 4 literal pin (`a52b47b0`) is pre-binding; the record requires post-binding regeneration. | Designate by a separate express act: the post-binding P-1 execution pin `001c3c80…` (after confirming it is the intended QE pin), or another exact commit. Do not use `a52b47b0`. |
| **PA-3** | DC-C2 (b) and (c) conformance; L-1; diagnostics (§3.5). | As in §3.5. |
| **PA-5** | D2 receipt semantics: `basisCommit` records `BASIS_COMMIT`, not HEAD. | Accept with a documented IPD-side note, or amend by IPD act. P-1 authorization is blocked until one of these occurs. |

**Blocker summary for P-1 authorization (none removed here):** PA-5 (D2); the act-designated pin (§2); PA-1 (if the alternate reading is adopted). PA-2 and PA-3 block H-12/QE and the next capture's conformance, not the P-1 pin itself.

---

## 6. Verification register (this pass; read-only; static)

| ID | Check | Result |
|---|---|---|
| V1113 | IRR `origin/main` = `3777dae`; no open PRs | PASS |
| V1114 | IPD `main` = `888eb375`; nine documents read into scratch, not the repository | PASS |
| V1115 | Compare: `a52b47b0` vs `5fc74085` (behind 4); vs `001c3c80` (ahead 46, behind 0); vs `888eb375` (ahead 63) | PASS (API) |
| V1116 | `gateAPrimeValidation.ts`: constants null at `a52b47b0`, non-null at `001c3c80`; 404 at `5fc74085` | PASS (API) |
| V1117 | `gateAPrimeProvisioning.ts` at `001c3c80` line 317 `basisCommit: BASIS_COMMIT` | PASS (API) |
| V1118 | Successor §8: 0 matches for manifest/H-12; IPD row 7 (line 902) and row 8 (line 903) text | PASS (text) |
| V1119 | Procedure line map: 69, 177–182, 248–255, 263–265, 304, 324, 406, 411–412 | PASS (grep) |
| V1120 | Adoption record: no mention of the .NET SHA-256 substitution | PASS (grep) — **gap confirmed** |
| V1121 | Microsoft Learn Get-FileHash 5.1: `-InputStream` parameter set; Example 4 (`MemoryStream`) | PASS (external doc); **not executed on host** |
| — | PowerShell execution, harness run, capture, host diagnostic, V1102 (DC-a/DC-b on host) | **NOT EXECUTED — OPEN** |

---

## 7. Changes in this pass, and non-grants

Changes: this addendum (new file); tracker `§16.162` (append-only) and one `CHG-2026-10-28-05` row (append-only). **Nothing else changed.** The adoption record, package, procedure, PF-11 files, `handoff/evidence/pf11-root-safe/`, and the IPD repository are unchanged.

Non-grants (unchanged): no P-1 execution or authorization; no `BASIS_COMMIT` change; no capture; no host diagnostic or PowerShell or harness run; no PF-11 reopening or acceptance change; no PF-17 satisfaction; no P-1-C or P-1-D acceptance; no change to PF-15, F4, F5, `DISP-01`–`03`, `OBS-01`, S3, QE, DQ-4, Gate 4, or Gate 5; no IPD write, branch, or PR; no PA approval or signature supplied or inferred.

*End of addendum (CV-CORR-142; CHG-2026-10-28-05; V1113–V1121).*
