# CAP-03 — P-1 Program Authority decision adoption record (`2026-10-28`)

> **STATUS: DA-A1, DB-B1, and DC-C2 ADOPTED as written, limited to their stated scope, and recorded additively. P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED.** This record authorizes no P-1 execution, no capture, no host diagnostic or PowerShell harness run, no PF-17 satisfaction, no P-1-C or P-1-D acceptance, no QE, Gate 4, or Gate 5 movement, no IPD write, and no change to `BASIS_COMMIT`.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1-PA-DECISION-ADOPTION-2026-10-28-01` |
| **Record type** | Additive adoption record and procedure revision. **Not** a P-1 authorization act, a host receipt, an acceptance, or an execution authorization |
| **Tracker registration** | §16.160, `CV-CORR-140`, `CHG-2026-10-28-03`, `V1097`–`V1103` |
| **Authority** | Ramki, as sole Program Authority. Adoption is recorded from the Program Authority direction of `2026-10-28` in the session that prepared this record (recorded in substance: adopt DA-A1, DB-B1, and DC-C2 as written in the package, limited to their stated scope, and complete the authorized one-pass IRR work without requesting renewed approval). No approval or signature is supplied on the PA's behalf |
| **Source package** | `docs/integration/IIPS_v3.0_CAP03_P1_PA_DECISION_PACKAGE_2026-10-28.md` (`IIPS-V3-CAP03-P1-PA-DECISION-PACKAGE-2026-10-28-01`; blob `62954f67`). **Unchanged.** It keeps its historical status `NOT ADOPTED`; adoption is recorded here, not by editing the package |
| **Procedure revised** | `docs/integration/IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md` (revision `2026-10-28`; historical blob `f585cd3a`) |
| **IRR base** | `origin/main` = `bb427aea8897d438329adda41175f9ff2a91817e` at the start of this pass |
| **IPD read-only** | `ramkivs/iips-production-market-data` `main` = `888eb375eebee01640e44ccdcbb138a71e8c4513`; no IPD write |

## 1. Adopted decisions and their limits

| Decision | Adopted text (package section) | Limits recorded with adoption |
|---|---|---|
| **DA-A1** — execution-pin of record | Package §1.6 and proposed text §1.7 (A-1 with A-2 as a requirement): for the successor act's §8 step 0 and §8.2, "the act-designated pin" is read as the §16.143 coordinate `001c3c80618f2ee1d40e9a90912237e1a06e7b58` / tree `399fa44a5f1953c0f61b452420fefb5985426ef1`, candidate-scoped. `BASIS_COMMIT` `5fc74085ade980846ff4a07b36415b6d49446486` and `BASIS_TREE` `7226ef0033b3a7049169d8fcf9bcbc9908e2590b` are unchanged compiled constants. Executing HEAD and tree are recorded separately. The 42-file interval `5fc74085…`→`001c3c80…` (ahead 50, behind 0) is acknowledged. The P-1 authorization act, when rendered, **must name the execution commit explicitly** | Acknowledgement is not a grant. Any other execution commit needs a new PA decision and fresh S2 evidence at that commit. **Does not authorize P-1** |
| **DB-B1** — capture-instrument identity | Package §2.7: the sole capture-instrument identity is the PF-11 root-safe v2 instrument, `evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1`, blob `191f5828461286b0f6fcb688b023da5dfc68a265`, 10,990 bytes, SHA-256 `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e`. The v1 identity (blob `eaea3f7f…`, 10,231 bytes, SHA-256 `85ac7271…`) is superseded for all future capture | Historical v1 record, the 27 October captures, and all historical evidence are preserved unchanged and are not reclassified. **Does not authorize a capture** |
| **DC-C2** — native-harness prerequisite, next capture only | Package §3.6: the PF-11 supplement §5 item 2 native PowerShell 5.1 harness prerequisite does **not** apply to the next capture; it is replaced for that capture only by pre-invocation checks (a) PSEdition `Desktop`, major 5; (b) `Get-FileHash` resolves to `Microsoft.PowerShell.Utility`; (c) the v2 source hash from Git blob `191f5828…` equals `13783385…`; (d) any failure is a STOP before invocation with output preserved | Native run `92d931fb…` remains **NOT PASSED**. The compatibility-assisted pass remains a traversal-logic pass only. **Does not waive PF-11 acceptance, does not satisfy PF-17, does not accept P-1-C or P-1-D, and does not authorize a capture or any host diagnostic.** Applies to the next capture attempt only |

## 2. Disposition of the DA ambiguities (package §1.4, DA ambiguity list)

| # | Question | Verified record | Disposition in this record |
|---|---|---|---|
| 1 | Which artifact is "the final execution commit", and does a manifest have to be regenerated at it before P-1? | Determination `IIPS-V3-CAP02-S1-IDENTITY-VALUE-DETERMINATION-2026-10-24-01` (IPD blob `b7746b5e…`) §7 says no commit is declared to be the final execution commit; it "is fixed only when the provisioning/QE sequence actually runs". Its §9 states that the H-12 manifest is still NOT ADOPTED and authorizes no manifest promotion; §9 does not itself describe a regenerated manifest. The successor act (IPD blob `528de6ae…`) contains **no manifest requirement** (its two occurrences of "manifest" are a principal-label note and a documentation-only clause). The manifest-at-final-commit rule is in the Gate 4 act §8 (IPD `evidence/cross-repository/IIPS_V3_CAP02_GATE4_TARGET_HOST_QUALIFICATION_ACT_EFFECTIVE_2026-10-23.md`): H-12 v3 must be generated "at the final Limb A commit", and its adoption is "a separate express PA act … before host preflight/QE" | **Discrepancy D1 recorded.** The phrase "provisioning/QE sequence" does not say whether the final execution commit belongs to P-1 or to the QE/Gate 4 chain, and the successor act does not say it. Manifest regeneration is **not** a successor-act step for P-1 on the present record. Whether H-12 adoption must precede P-1 execution is **OPEN** for the PA. The tracker places S3 (host/runtime preflight) after P-1, so "host preflight" in the Gate 4 act most plausibly refers to S3; this is an inference only. The P-1 authorization act must state the answer. No IPD edit was made |
| 2 | Does the provisioning receipt record the executing commit? | IPD `src/persistence/gateAPrimeProvisioning.ts` at `001c3c80` returns `basisCommit: BASIS_COMMIT` (line 317) with no HEAD comparison. Literal §8.2 would STOP at `001c3c80`, and the receipt would record `5fc74085` | **Discrepancy D2 recorded; OPEN for P-1.** DA requires any provisioning receipt to record both the compiled basis and the executing HEAD and tree. The IPD module does not do that. Fixing it would change IPD code, which is outside this IRR pass and is not authorized. P-1 cannot be authorized until the PA accepts the receipt content or the act is amended |
| 3 | Composition of the 42 changed files | DA §1.7 acknowledges the composition (including DR-2 Option A provider and S2 fix) | Acknowledged as DA states. Not a grant |
| 4 | Literal "act-designated pin" wording | The procedure has **no** literal occurrence of "act-designated" (verified: 0 matches). The phrase lives in the successor act's step 0 | Reading recorded in procedure §4.2 as DA states; no literal replacement was needed |
| 5 | Supplement §4 supersession reaching the v1 STOP literals | Supplement §4 designates v2 and "supersedes only the source-identity/derivative instructions" | Applied to the procedure as DB-B1 (Appendix A A1–A5). Historical v1 record kept (A12) |
| 6 | Determination §7/§9: `BASIS_COMMIT` and fixed final execution commit | Determination §7 keeps `BASIS_COMMIT`/`BASIS_TREE` unchanged and says the final execution commit is fixed only when the sequence runs | Unchanged. DA's pin of record is recorded separately from the compiled basis |

## 3. Discrepancies and contradictions found (documented, not improvised)

- **D1** — The determination's "final execution commit" wording (§7) does not say whether it belongs to P-1 or to the QE/Gate 4 chain, and no manifest-timing text appears in the successor act; the manifest rule is only in the Gate 4 act §8 (table §2, item 1). Not resolved by this record; OPEN for the PA.
- **D2** — Provisioning receipt records the compiled `BASIS_COMMIT` regardless of HEAD (table §2, item 2). OPEN for the PA and any future IPD act; no IPD change made.
- **D3** — Procedure line 60 requires Windows PowerShell 5.1; DC-C2 wording says "5.x". **Reconciled:** the procedure now requires PSEdition `Desktop` and major version 5 (§4.3a), which is the 5.1 family. The historical runtime of native run `92d931fb` is recorded as 5.1.26100.9444 Desktop.
- **D4** — The capture `cap03-p1-20261027T110433Z` ran under PowerShell 7.6.8 Core (contrary to line 60). The engine of `cap03-p1-20261027T133547Z` is unknown (no transcript). Neither is re-classified as 5.1 evidence.
- **D5** — The native `Get-FileHash` failure (`92d931fb…`, "not recognized") is **undiagnosed**. This record neither explains nor passes it. DC-C2 substitutes a pre-invocation check for the next capture only; the historical result stays NOT PASSED.

## 4. Procedure revision — Appendix A mapping (package Appendix A, rows A1–A12)

| Row | Requirement | Implementation in revision `2026-10-28` | Status |
|---|---|---|---|
| A1 | `$InstrumentRel` → v2 path | §4.1 | **Applied** |
| A2 | `$InstrumentBlob` → `191f5828…` | §4.1 | **Applied** |
| A3 | `$InstrumentSha256` → `13783385…` | §4.1 (plus `$InstrumentBytes = 10990`) | **Applied** |
| A4 | STOP texts naming v1 → v2 (lines 208, 236, 342) | §4.4 source checks and §4.5 pre-invocation re-read name v2 | **Applied** |
| A5 | `source_bytes` `10231` → `10990` | §4.4 `diffDoc` uses `$InstrumentBytes` | **Applied** |
| A6 | Read source bytes from the Git blob; assert LF-only (zero CR); size; SHA-256; STOP on CRLF | §4.4: `Get-GitBlobBytes` reads `git cat-file blob` through a binary process stream; CR, length, and SHA-256 are asserted; the working-tree `git hash-object --no-filters` must equal the blob. **Method note:** the row's parenthetical suggests writing `git cat-file -p` output to a file. The bytes are instead held in memory through the binary stream, because PowerShell redirection and text pipelines alter bytes. Every required property is implemented | **Applied** (static tests only; see §6) |
| A7 | DC §3.6 checks (a)–(d) as a STOP gate before any capture directory | §4.3a: (a) and (b) as written; (c) is the blob SHA-256 in §4.4; (d) STOP before invocation; §4.3a runs before the evidence directory is created | **Applied**. Runtime not executed here |
| A8 | Keep the "5.1" text; enforce it through A7 | §4 runtime sentence kept, with enforcement cross-referenced to §4.3a | **Applied** |
| A9 | Replace "act-designated pin" wording with the DA coordinate; record HEAD separately from `BASIS_COMMIT` | No literal occurrence exists. §4.2 records the DA reading and the separate pins; §4.4 authority parameters record `IPDExecutionPinOfRecord`, `IPDCompiledBasisCommit`, and `IPDCompiledBasisTree` | **Applied as a record rule** |
| A10 | Byte-diff expectation confined to lines 22/27/28 — unchanged | The parameter `$edits` list is unchanged. Verified: those lines are identical in v1 and v2 | **Unchanged, as specified** |
| A11 | Cross-reference supplement §5; DC applies to the next capture only | §1 item 6 and §4.3a cite PF-11 supplement §5 item 2 | **Applied** |
| A12 | Historical register rows preserved; supersession note only | `V1042` keeps its content and gains a supersession note. No other historical row changed | **Applied** |

Verification required by the package before publication: a textual diff against the historical blob (`V1097`), PowerShell parsing of each changed fragment (`V1098`), and an exercise of the new gate against v2 (PASS) and a deliberately wrong SHA (STOP) in a separately authorized non-capture test (`V1101`, **OPEN**).

## 5. P-1 readiness matrix after adoption (verified against the record; unchanged except where stated)

| Item | Status after this record | Basis |
|---|---|---|
| P-1-A | SATISFIED (candidate-scoped) | Tracker header row 21; §16.143/§16.144 — unchanged |
| P-1-B | SATISFIED — `001c3c80618f2ee1d40e9a90912237e1a06e7b58`, tree `399fa44a5f1953c0f61b452420fefb5985426ef1` | §16.143 — unchanged |
| P-1-C | **NOT ESTABLISHED** — unchanged. A future fresh capture is now procedurally possible, but it has not been performed or authorized | §16.152 — unchanged |
| P-1-D | **DESIGNATED, not verified for the attempt** — unchanged | §16.152 — unchanged |
| P-1-E | SATISFIED (PF-15 act `-02`) — unchanged | Tracker |
| P-1-F | **UNSPENT**; authority chain complete, conditions incomplete. The P-1 authorization act is not rendered and must name the execution commit (DA). Open items D1 and D2 apply | Tracker §16.140.4 / §16.153 |
| Identity prerequisite | SATISFIED — unchanged | Determination `…-2026-10-24-01` |
| DA | **ADOPTED** (DA-A1), with the limits in §1 and open items D1–D2 | This record |
| DB | **ADOPTED** (DB-B1); procedure revision applied; static checks only | This record; procedure §§1, 3.2, 4, 6.1 |
| DC | **ADOPTED** for the next capture only; DC-a and DC-b are **not executed** in this environment; native run `92d931fb` remains **NOT PASSED** | This record; procedure §4.3a |
| PF-11 | Acceptance under §16.158 **unchanged**; native run NOT PASSED | §16.158 — unchanged |
| PF-17 | Register limb VERIFIED; capture limb **NOT EVIDENCED** — unchanged | §16.156 — unchanged |
| Option (B) waiver | Recorded under §16.158; **does not extend to any later capture** | §16.158.5 — unchanged |
| S3, QE-1…QE-11, DQ-4, Gate 4, Gate 5 | **Not advanced** | Unchanged |

## 6. Verification (this record and the procedure revision)

The verification register is in procedure §6.1 (`V1097`–`V1103`) and is registered in the tracker as §16.160. Summary:

- **Static only.** No PowerShell or Windows runtime exists in the verifying environment. The Windows PowerShell 5.1 Desktop runtime could not be obtained, and the PowerShell release host is not reachable from this sandbox.
- **PASS (static):** textual diff against the historical procedure is confined to the Appendix A areas and the intended header, §1, §3.2, §4, and `V1042` changes (`V1097`); all seven PowerShell blocks parse with zero error nodes (`V1098`); the v2 blob is 10,990 bytes, SHA-256 `13783385…`, with zero CR bytes and `text eol=lf` (`V1099`); each derivation substitution matches once and the F4 `$StorePath` line is preserved (`V1100`); the gate logic accepts v2 and rejects v1, a single flipped byte, CRLF drift, and working-tree drift (`V1101`, simulation only).
- **NOT EXECUTED (OPEN):** DC-a and DC-b on the Windows host (`V1102`); the PowerShell-run exercise of the gate (`V1101`).

## 7. Non-grants and scope confirmation

This record does **not**: execute P-1; authorize or create a capture; run a host diagnostic or any PowerShell harness; satisfy PF-17; accept P-1-C or P-1-D; change PF-11 acceptance, PF-15, F4, F5, `DISP-01`–`03`, or `OBS-01`; move S3, QE, DQ-4, Gate 4, or Gate 5; change `BASIS_COMMIT`; create a replacement IPD act; write to IPD or any repository other than IRR; alter the six `handoff/evidence/pf11-root-safe/` files or any historical evidence; or change the package or the historical v1 record. **P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED.**

*End of `IIPS-V3-CAP03-P1-PA-DECISION-ADOPTION-2026-10-28-01`.*

---

## 8. Additive record — revision 2026-10-28b (`CV-CORR-143`; `CHG-2026-10-28-06`; `V1122`–`V1131`)

This section is additive. Sections 1–7 are unchanged and remain the record of the 2026-10-28 adoption directive as applied by PR #339.

**8.1 Corrections to the record in §1 and the DC-C2 row.** The statement that the procedure adopts DC-C2 (a) and (b) "as written" was inaccurate in two respects, both introduced by the 2026-10-28 procedure revision and not by the PA:

- **(b)** the revision added `CommandType -eq 'Cmdlet'`, which is not in the adopted text. No governing artifact requires it.
- **(c)** the revision used a `System.Security.Cryptography` substitution for `Get-FileHash`. That substitution was disclosed only in an in-code comment and was not disclosed in this record.

**8.2 Applied in revision 2026-10-28b (within the adopted text; no new PA decision).**

- DC-C2 (b): conformed to the adopted Source-only test.
- DC-C2 (c): the literal `Get-FileHash -Algorithm SHA256 -InputStream` check over a `MemoryStream` of the designated v2 bytes, compared with `13783385…`, is now present in §4.4.
- L-1: `ProcessId` equality is now compared at §4.5, under the adopted "single non-elevated … session" requirement.

**8.3 Not applied; PA-reserved.** PA-1, PA-2, PA-3b (ratification of the stricter clause, if the PA wants it), PA-3d (diagnostics), and PA-5 (D2 receipt semantics). Each is recorded with its status in `IIPS_v3.0_CAP03_P1_PA_STATUS_MATRIX_2026-10-28.md`. No approval is inferred from the conformance in §8.2.

**8.4 Host execution.** `V1102` (DC-a and DC-b on the Windows host, recording the actual `CommandType` and `Source`) is **NOT EXECUTED**. The DC-C2 (c) literal check is likewise **NOT EXECUTED**. No capture is authorized by this section.

**8.5 Non-grants.** P-1 is NOT EXECUTED / UNSPENT / NOT AUTHORIZED. No capture, host diagnostic, PowerShell or harness run, IPD write, `BASIS_COMMIT` change, PF-11 or PF-17 change, or gate movement. The package `IIPS_v3.0_CAP03_P1_PA_DECISION_PACKAGE_2026-10-28.md` remains NOT ADOPTED as a historical record and is unchanged.

---

## 9. Additive authority reconciliation — revision 2026-10-28b (PR #342; `CV-CORR-143`; `V1132`–`V1137`)

This section is additive. It establishes which adopted text authorized the PR #342 procedure changes, classifies each change, and corrects §8.1. It makes **no new PA decision** and infers **no PA approval**.

**9.1 Governing text (verbatim, from the package on `origin/main`, blob `62954f67`, unchanged).**

- Package §3.6(b): "`Get-Command Get-FileHash -ErrorAction Stop` resolves to Source `Microsoft.PowerShell.Utility`".
- Package §3.6(c): "`Get-FileHash` of the v2 instrument's source bytes, read from Git blob `191f5828461286b0f6fcb688b023da5dfc68a265`, equals `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e`".
- Package §3.6 preamble: checks "all performed in a single non-elevated Windows PowerShell 5.1 session".
- Package §4 consolidated decision: "(2) adopts DB as stated in §2.7 and **authorizes the procedure revision described in Appendix A**, … (3) adopts DC as stated in §3.6."
- Appendix A, row A7: "Add the DC §3.6 checks (a)–(d) as a STOP gate, **before** any capture directory is created."
- Appendix A, row A8: "Keep the text and enforce it through A7."

**9.2 Change history (verified by `git show`).** The 2026-10-27 procedure (`2d83030`) contains none of `CommandType`, `Get-Sha256Hex`, or `Assert-AttemptEngine`. Commit `6ba9d71` (PR #339, merged as `4e9cc40e`) introduced `Assert-AttemptEngine` with the extra `CommandType -ne 'Cmdlet'` clause, the `System.Security.Cryptography` (c) check, and a `ProcessId` capture that was not compared. No package or Appendix A text specifies those forms.

**9.3 Classification.**

| Item | Class | Authority | Result |
|---|---|---|---|
| DC-b Source-only test (`Source -eq Microsoft.PowerShell.Utility`) | **1 — implementing an adopted requirement** | §3.6(b); §4 items (2)–(3); A7 | Applied in `0fb7979c`. The `CommandType` clause was an IRR addition that the adopted text does not contain; removing it restores the adopted text |
| DC-c literal `Get-FileHash` check over the v2 bytes | **1 — implementing an adopted requirement** | §3.6(c); §4 items (2)–(3); A7 | Applied. `-InputStream` over a `MemoryStream` is an implementation choice within "read from Git blob". It creates no file. It does not resolve the A6 method note (9.5) |
| L-1 `ProcessId` equality at the §4.5 recheck | **1 — implementing an adopted requirement** | §3.6 preamble ("single … session"); A8 | Applied. Fails closed |
| Re-adding the stricter `CommandType -eq 'Cmdlet'` clause | **2 — new substantive governance choice** | None. Would need a PA amendment | **Not made.** The PA may choose to add it by amendment |
| Ratifying the `.NET` SHA-256 substitution as the (c) check | **2 — new substantive governance choice** | None. Would need a PA amendment | **Not made.** Superseded by the literal check |
| PA-3d diagnostics (`$PID`, `CommandLine`, `PSModulePath`) | **3 — unresolved, PA-reserved** | Not in the adopted text | **Not applied** |
| A6 method: bytes held in memory through a binary stream, not written to a file | **3 — unresolved conflict with a governing artifact** | Appendix A A6 parenthetical ("written to a file"); disclosed in §4 as a "Method note" | **Not reconciled. Not changed in this pass.** The PA must either ratify the method or direct the file-write form. Documented as a blocker for capture, not improvised |

**9.4 Correction to earlier records.** Addendum §3.1 (PR #341) and §8.1 of this record (PR #342) say the `.NET` (c) substitution was "not disclosed" in this record. That is **inaccurate**. Row A7 of §4 does state "(c) is the blob SHA-256 in §4.4", but describes it as applied "as written" and does not flag it as a deviation. The §1 DC-C2 summary paraphrases (c) without the words `Get-FileHash`. Separately, §8.1 is correct that the (a)/(b) "as written" statement was inaccurate for (b). The historical text is unchanged. This section is the correction of record.

**9.5 Consequences and residual boundaries.**

- The adopted decision (§4 items (2)–(3), with A7) already authorizes the procedure to carry DC §3.6 checks (a)–(d) as written. The 2026-10-28b changes implement that text. No further PA adoption is needed for them. The addendum §3.5 rule that changes to §4.3a/§4.4 need PA adoption is satisfied for implementation of the adopted text. It does not extend to anything beyond it.
- Removing the `CommandType` clause reduces the procedure's check to the adopted strength. That the Source-only check distinguishes a shadowing function or alias from the cmdlet is an inference. It is **host-gated** and **not verified**. `V1102` must record the actual `CommandType` and `Source`.
- The A6 method conflict (9.3) is a residual PA-reserved item. It is not a precondition that IRR can close by editing. It must be resolved, or accepted by PA, before any capture.
- Capture still requires the host run (`V1102`) and a separate PA capture authorization. P-1 is NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

**9.6 Non-grants.** No PowerShell run, harness or compat-script run, host diagnostic, capture, P-1 execution or authorization, PF-11 or PF-17 change, P-1-C or P-1-D acceptance, QE, Gate 4, Gate 5, S3, or DQ-4 movement, IPD write, `BASIS_COMMIT` or `BASIS_TREE` change, or PA approval or signature supplied or inferred.
