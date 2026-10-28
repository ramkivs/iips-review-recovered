# CAP-03 — Consolidated PA Decision Package: A6, PA-1, PA-2, PA-5, PA-3d (`2026-10-28`)

> **STATUS: DECISION FINDINGS AND OPTIONS ONLY. NO PA DECISION IS MADE OR IMPLIED. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.** This package does not authorize P-1, a P-1 authorization act, a capture, a host run or diagnostic, PF-17 satisfaction, acceptance of P-1-C or P-1-D, any IPD write, any change to `BASIS_COMMIT` or `BASIS_TREE`, any Gate 4, S3, QE, or DQ-4 movement, or H-12 adoption. Program Authority alone decides PA-1, PA-2, PA-3d, and PA-5. Nothing in this record is an approval, signature, or acceptance.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1-PA-CONSOLIDATED-DECISION-PACKAGE-2026-10-28-01` |
| **Record type** | Successor-consolidated PA decision package (additive). It does not replace or duplicate the package `IIPS_v3.0_CAP03_P1_PA_DECISION_PACKAGE_2026-10-28.md` (blob `62954f67`, NOT ADOPTED, unchanged), the adoption record, or the D2 handoff. |
| **Items covered** | A6 (method conflict); PA-1 (H-12 / P-1 sequencing and the meaning of "host preflight"); PA-2 (H-12 regeneration and QE pin); PA-5 (D2 provisioning-receipt semantics); PA-3d (diagnostics) |
| **IRR baseline at pass start** | `origin/main` = `e9cc38b3` (merge of PR #343). Local clone was shallow (depth 1) and was unshallowed for ancestry checks; no open IRR PR at start |
| **IPD baseline (read-only)** | `main` = `888eb375eebee01640e44ccdcbb138a71e8c4513`, tree `cf3b90482fa7ed1f9780f20a9286164686885d2b`; no open IPD PR at start. No IPD write |
| **Governing records** | Gate 4 act `IIPS_V3_CAP02_GATE4_TARGET_HOST_QUALIFICATION_ACT_EFFECTIVE_2026-10-23.md` (effective); successor provisioning act `IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md` (`528de6ae…`, effective); S1 identity-value determination `…S1_IDENTITY_VALUE_DETERMINATION_EFFECTIVE_2026-10-24.md` (effective); S1 H-12 readiness decision request `…S1_IDENTITY_VALUE_AUTHORITY_H12_READINESS_DECISION_REQUEST_2026-10-24.md` (**decision request, not an act**); IRR adoption record and D2 handoff (IRR, `2026-10-28`) |

---

## 1. Summary

| Item | Status after this pass | What is needed | Owner |
|---|---|---|---|
| **A6** method conflict | **CONFORMED to the adopted text** (procedure rev `2026-10-28c`, §4.4 and §6.3; tracker §16.164). The bytes are written to a file, read back, and checked there. Runtime test **NOT RUN** (no PowerShell in the sandbox) | Nothing further for conformance. A PA act would be needed only to ratify the old in-memory method as a deviation; none was requested or inferred | IRR (done); host test before any capture |
| **PA-1** H-12 / P-1 sequencing; meaning of "host preflight" | **RESERVED — open.** The effective Gate 4 act and the S1 decision request state different sequencing criteria, and the term "host preflight" is used for two different events | PA must state the order of H-12 adoption relative to P-1 and define "host preflight" | PA |
| **PA-2** H-12 regeneration commit and QE pin | **RESERVED — open.** The Gate 4 literal pin `a52b47b0` is pre-binding. The only post-binding candidate in the record, `001c3c80`, also carries non-Limb-A changes. An IRR consumer pin must also be designated | PA must designate the IPD QE/H-12 commit (explicit re-designation under Gate 4 §3.2(4)) and the IRR consumer commit | PA |
| **PA-5** D2 receipt semantics | **RESERVED — open; adopted-requirement gap confirmed** (DA-A1 receipt element unmet at IPD `main` `888eb375`). Three options; none chosen | PA must choose Option A (amend DA-A1), B (IPD correction at a new commit `C′`), or C (hold) | PA; then IPD owner for B |
| **PA-3d** diagnostics | **RESERVED — open; non-gating.** Not in adopted DC-C2 text | PA may adopt, decline, or defer. Nothing on the P-1 path depends on it | PA |

**Adopted (authoritative):** DA-A1 (adopted as written, including its receipt element), DB-B1, and DC for the next capture only (adoption record §1; procedure rev `2026-10-28b`). **Not adopted:** H-12 v3 (`NOT ADOPTED`, S1 determination §9), P-1 (`NOT AUTHORIZED`), the consolidated package `62954f67` (`NOT ADOPTED`).

---

## 2. Verified baselines and identities

All identities below were verified in this pass by `git` ancestry and tree reads. IPD objects were read from a read-only blobless clone; IRR objects from the unshallowed IRR clone.

| Identity | Commit | Tree | Role in the record | Source |
|---|---|---|---|---|
| Compiled basis | `5fc74085ade980846ff4a07b36415b6d49446486` | `7226ef0033b3…` | `BASIS_COMMIT` / `BASIS_TREE` (immutable here) | Gate 4 §3.1; `gateAPrimeValidation.ts` at this commit has the constants with `BASIS_COMMIT` = `5fc74085…` |
| Limb A final merge (pre-binding) | `a52b47b0f8ca448c8c9c195cf261e83ecf813ba3` | `1467802e9b94…` | Gate 4 literal QE pin (`§3.2(2)`: "final post-merge Limb A commit"); S1 request names it the "Final Limb A / QE-content pin" | Gate 4 §3.1, §3.2(2); S1 request §8 |
| S1 binding commit | `f9ec0c5…` (parent `6d8f161`) | — | "CAP-02: S1 identity-value determination and binding commit"; non-null identity constants; touches `gateAPrimeProvisioning.ts`, `gateAPrimeValidation.ts`, and `g3_gate_a_prime_successor_provisioning.test.ts` (+284 / −33 non-evidence) | IPD history; S1 determination §7 |
| P-1 execution pin of record (DA-A1, candidate-scoped) | `001c3c80618f2ee1d40e9a90912237e1a06e7b58` | `399fa44a5f1953c0f61b452420fefb5985426ef1` | "Act-designated pin" per the DA-A1 reading; P-1-A/P-1-B satisfied candidate-scoped at this commit (tracker §16.153) | IRR adoption record §1; D2 handoff §1 |
| IRR QE consumer pin, Gate 4 designation | `4740ba21ea6103f1a7ebc9768269ae7795920698` | `23c5ca4ae1bf…` | Gate 4 §3.1 "IRR consumer pin (QE)"; IRR `main` on `2026-10-23`; ancestor of current IRR `main` | Gate 4 §3.1 |
| IRR standing consumer pin (IRR side) | `ba64b2d5927c2f872560710cf1474c25a5cde0d5` | `5e4262f1cd75…` | Cited by the procedure and tracker as the "standing IRR consumer pin"; a descendant of `4740ba21` (99 commits later); ancestor of current IRR `main` | Tracker §16.153 and §16.163 context; procedure §4 |
| IPD `main` (this pass) | `888eb375eebee01640e44ccdcbb138a71e8c4513` | `cf3b90482fa7…` | Read-only baseline | This pass |
| IRR `main` (this pass) | `e9cc38b3…` (PR #343) | — | Read-only baseline (143 commits after `ba64b2d5`) | This pass |

**Ancestry (verified).** `5fc74085` → `a52b47b0` (4 commits) → `f9ec0c5` → `001c3c80` (50 commits after `5fc74085`; 46 after `a52b47b0`); `001c3c80` is an ancestor of IPD `main`. `4740ba21` is an ancestor of `ba64b2d5`, which is an ancestor of IRR `main`.

**Stale measurements (not reused as current).** The S1 request's H-12 measurements were taken at IPD `main` `5e4e54d…` (18 commits after `a52b47b0`, zero non-evidence drift at that time). IPD `main` is now `888eb375` (63 commits after `a52b47b0`), and non-evidence drift is present (§3.3). Any H-12 measurement must be taken again at the designated commit.

---

## 3. Findings by item

### 3.1 A6 — method conflict (CONFORMED; no reserved decision required)

- **Adopted text.** Appendix A row A6 of package `62954f67` reads: "Read the source bytes from the Git blob (`git cat-file -p 191f5828…` written to a file), assert LF-only (zero `\r`), assert size and SHA-256, and STOP on any CRLF. Addresses §16.156 R-4 (i). Must be tested before publication."
- **Conflict.** Procedure rev `2026-10-28b` §4.4 held the blob bytes in memory (`Get-GitBlobBytes` → `MemoryStream`) and never wrote them to a file. The adoption record §4 disclosed this as a "method note" and marked row A6 "Applied". The note was a deviation from the adopted parenthetical, not an adopted alternative.
- **Governing rule applied.** A documented conflict with adopted text is not approval to keep the deviation. The adopted text is specific, the correction is a procedure change that conforms to it, and no reserved decision is needed to make it. The correction therefore was made in this pass.
- **Conformance applied (revision `2026-10-28c`, tracker §16.164).** §4.4 now (1) writes the designated blob bytes to a staged file by a raw binary write; (2) reads that file back; (3) STOPs on any CR byte, a wrong length, or a wrong SHA-256 at the file; (4) derives from the file's bytes; and (5) after the evidence directory is created, copies the file byte-for-byte to `01-source-blob-v2.bin` and re-checks its SHA-256. The A7 gate (§4.3a) still precedes the evidence directory. The adopted DC-C2(c) check stays on its MemoryStream input, as adopted.
- **Residual.** The change is static only. The runtime test that package Appendix A requires ("must be tested before publication") is **NOT RUN**, because no PowerShell or `pwsh` exists in the sandbox. It must run on the host before any capture. A host test is not a PA decision.
- **Effect.** A6 no longer blocks capture on a method conflict. Capture remains blocked by other items (§6).

### 3.2 PA-1 — H-12 / P-1 sequencing and the meaning of "host preflight" (RESERVED)

**Findings (verbatim where quoted).**

1. **Effective Gate 4 act (§6, step table).** The steps are: S1 Gate A′ provisioning execution (BLOCKED); S2 Limb A (AUTHORIZED — NOT STARTED); S2a "Regenerate H-12 at the final IPD commit + fixed IRR commit; full validation; separate express PA adoption" (AUTHORIZED — NOT STARTED); S3 "Host/runtime preflight … BLOCKED until S1 and S2a"; S4 QE (BLOCKED until S3).
2. **Effective Gate 4 act (§6, dependency paragraph).** "H-12 adoption follows Limb A (the mandatory test must exist to be hashed) and precedes preflight." This paragraph does not list P-1 (S1) as a precondition of H-12 adoption.
3. **Effective Gate 4 act (§3.2(2) and §8).** The QE pin is recorded "before host preflight and before QE-1"; H-12 v3 must be adopted "before host preflight/QE" and as "a separate express PA act".
4. **S1 decision request §7.6 (not an act).** States that H-12 adoption requires "the S1 identity-value act + binding commit, an executed P-1 provisioning with V-A2 evidence, a native-Windows canonical `npm test` and a separate express PA adoption act". This is a requirement set in a request document. No act adopts it.
5. **Successor act §8 step 0** (for the provisioning sequence) is a "preflight capture" on the provisioning host. It is a different event from the Gate 4 S3 host preflight.
6. **Term collision.** The CAP-03 procedure is titled a "read-only preflight" capture for P-1-C and P-1-D (the procedure's authority block records `CapturePurpose=P-1-C/P-1-D read-only preflight only`, procedure line 344). Gate 4 §6 uses "Host/runtime preflight" for S3, with its own criteria (`win32`, non-elevated, Node range, flag-free `node:sqlite`, clean trees at designated commits).

**Consequence.** Under the effective act, H-12 adoption is not expressly preceded by P-1. Under the S1 request's §7.6, it would be. The record does not settle which reading governs, and the S1 request cannot settle it by itself. The term "host preflight" is also ambiguous between S3 and the P-1-C/P-1-D capture.

**Decisions reserved to PA.**
- **PA-1(a):** Must H-12 adoption (S2a) follow the executed P-1 (S1), or may it precede it? Options: (i) follow the effective Gate 4 dependency text (no P-1 precondition); (ii) follow the S1 request §7.6 criterion (P-1 with V-A2 evidence first). PA must state the order.
- **PA-1(b):** Does "host preflight" in Gate 4 §3.2(2) and §8 mean S3 (as defined in Gate 4 §6), or the CAP-03 P-1-C/P-1-D capture? Options: (i) S3 only; (ii) P-1-C/P-1-D capture; (iii) both, stated separately.

### 3.3 PA-2 — H-12 regeneration commit and QE pin (RESERVED)

**Findings.**

1. **The Gate 4 literal pin is pre-binding.** Gate 4 §3.1 and §3.2(2) make the IPD QE execution pin "the final post-merge Limb A commit", which the S1 request identifies as `a52b47b0`. At `a52b47b0`, `gateAPrimeValidation.ts` has `PRINCIPAL_LABEL`, `TENANT_ID`, and `CANONICAL_OWNER_ID` set to `null`. The S1 binding commit `f9ec0c5` set them to non-null values. The S1 determination §7 and §9 say the binding changes `post_g3_cap02_qualified_surface_entries[4..6]` and 10 of the 1,140 `runtime_dist_set` files.
2. **Drift is non-documentary.** `f9ec0c5` is a source change after the Gate 4 act date. Gate 4 §3.2(4) makes "any non-documentary drift … a stop condition requiring explicit PA re-designation" and forbids silent re-pin. A new pin therefore needs a PA act. It cannot be inferred from the newest commit.
3. **Candidate `001c3c80` is not Limb A alone.** `001c3c80` (DA-A1 P-1 pin) is post-binding, but between `a52b47b0` and `001c3c80` the non-evidence changes are:
   - the S1 binding (`f9ec0c5`): `gateAPrimeProvisioning.ts` (+58 / −17), `gateAPrimeValidation.ts` (+25 / −4), the g3 test (+201 / −12);
   - the DR-2 Option A provider change (`bc144b9`, "feat(cap03): implement DR-2 Option A IPD provider read envelope"): `src/persistence/portfolio_store.ts` (274 lines changed) and `tests/q1_ipc_read_contract_conformance.test.ts` (1,385 lines changed);
   - a PA disposition document (87 lines);
   - the S2 package-consumer fix (`001c3c80`): `scripts/verify-public-package.mjs` (10 lines) and `tests/portfolio_ui_package.test.ts` (4 lines).
   Total non-evidence delta from `a52b47b0`: 8 files, +1,861 / −216 lines. The DR-2 change and the S2 fix are outside the Gate 4 §4.2 Limb A boundary. They have to be accepted explicitly or excluded explicitly.
4. **The IRR consumer pin has two values in the record.** Gate 4 §3.1 names `4740ba21` as the IRR consumer pin (QE). The procedure and tracker cite `ba64b2d5` as the "standing IRR consumer pin". Gate 4 §3.1 forbids silent substitution. Both are ancestors of current IRR `main` `e9cc38b3`. No designation has been made for the H-12 and QE stage.
5. **H-12 regeneration and QE pin.** Gate 4 S2a regenerates H-12 "at the final IPD commit + fixed IRR commit". Gate 4 §8 requires the runtime `dist/**` set to be "captured at build time" at the final Limb A commit. The record therefore points to one IPD commit for both H-12 and QE. That is an observation about the text, not a designation.
6. **Coupling with PA-5.** The D2 handoff (§3, Option B) moves the execution commit to a new commit `C′`, which needs a new PA execution-pin designation, fresh S2 evidence at `C′`, and PA-2 re-examined.

**Options (no option is selected).**

| Option | What it designates | Record-supported consequence |
|---|---|---|
| **P2-A** Keep `a52b47b0` as the QE pin | The Gate 4 literal commit | Pre-binding: the provisioning identity constants are `null` there, so H-12 and QE would qualify code that cannot provision. H-12 generated there would not cover the binding's changed entries or `dist` files. Requires an explicit §3.2(4) re-designation to be consistent with the binding having happened. Least consistent with the S1 determination |
| **P2-B** Designate `001c3c80` as the IPD QE/H-12 commit | The DA-A1 P-1 pin, which is also the only post-binding candidate in the record | Matches the DA-A1 designation. Requires an express PA acceptance of the non-Limb-A delta in §3.3(3) (DR-2 and S2 fix), a fresh H-12 at `001c3c80`, and a fresh Limb A native `npm test` at that commit |
| **P2-C** Designate a new commit `C′` | Commit not yet created | Needs a separate IPD authorization and a PA designation. Same as PA-5 Option B. Fresh S2 evidence and H-12 at `C′` |

Plus the **IRR consumer pin** designation (`4740ba21` per Gate 4, or `ba64b2d5`, or a new IRR commit). This is reserved to PA and must be stated with its tree and blob identities (Gate 4 §3.2(2)).

**Recorded limitation.** Any P2 option needs a new H-12 measurement at the designated commit. The S1 request's R2 measurements (`9382d4b0…`, `10` of `1,140` dist files) describe `5e4e54d` and are not reused.

### 3.4 PA-5 — D2 provisioning-receipt semantics (RESERVED; adopted-requirement gap)

**Adopted requirement.** DA-A1 (adopted as written 2026-10-28): "Any provisioning receipt must record both the compiled basis and the executing HEAD and tree."

**Verified current behaviour (IPD `main` `888eb375`; D2 handoff §1).** `executeWithAuthorization` never reads the executing checkout's `HEAD` or tree. The receipt records `basisCommit` (`5fc74085…`) and `basisTree` (`7226ef00…`) only. The receipt cannot evidence that the executing HEAD equalled the act-designated pin.

**Related facts.**
- Successor act §8 step 0 requires a host preflight capture of `git rev-parse HEAD HEAD^{tree}` "equal to the act-designated pin". That term is not defined in the successor act. DA-A1 reads it as `001c3c80…`. So the HEAD is captured on the host as raw output, but not in the receipt.
- Under Option B, the receipt change is a new commit, which changes the execution commit from `001c3c80` to `C′`, which in turn reopens PA-2.

**Options (reserved; none chosen).**

| Option | What happens | Record-supported consequence |
|---|---|---|
| **A** Operator-recorded bundle | IPD unchanged. The operator records `HEAD` and `HEAD^{tree}` beside the unchanged receipt | Keeps `001c3c80` as the execution commit. **Requires an amendment to DA-A1**, because DA-A1 says the receipt must record HEAD and tree. The module does not enforce it |
| **B** IPD correction at a new commit `C′` | A separate IPD authorization; the receipt records HEAD and tree (D2 handoff §4) and optionally enforces the pin | The receipt meets DA-A1 as written, but `C′` needs a new PA execution-pin designation, fresh S2 evidence at `C′`, PA-2 re-examined, and a P-1 authorization naming `C′` |
| **C** Hold P-1 | No IPD change, no amendment | No progress toward P-1 |

**Note.** Option B's changed commit is the only route on which the receipt meets DA-A1 unamended. Option A is cheaper but changes adopted text. The choice is for PA. The D2 handoff states that no default is inferred, and this package does not infer one.

### 3.5 PA-3d — diagnostics (RESERVED; non-gating)

- **Proposed item.** Record `$PID`, `[Environment]::CommandLine`, and `$env:PSModulePath` at §4.3a as read-only metadata.
- **Status.** Not in the adopted DC-C2 text. The addendum §3.5 says a procedure change needs PA adoption. Not applied.
- **Gating.** None of the P-1 path depends on it (PA status matrix). The native-failure investigation (run `92d931fb`, NOT PASSED) remains open without it.
- **Options.** (i) Decline or defer; (ii) adopt as §4.3a read-only metadata, which needs a further procedure revision. No option is selected.

---

## 4. Decision table

| ID | Question for PA | Options presented | Status | Authoritative basis |
|---|---|---|---|---|
| **A6** | Ratify the in-memory method as a deviation? | (i) No decision (conformance applied, rev `2026-10-28c`); (ii) ratify the in-memory method | **CONFORMED** (no decision requested). Runtime test NOT RUN | Package Appendix A row A6; adoption record §4; procedure rev `2026-10-28c` |
| **PA-1(a)** | Order of H-12 adoption (S2a) relative to P-1 (S1) | (i) Gate 4 dependency text, no P-1 precondition; (ii) S1 request §7.6, P-1 first | **RESERVED** | Gate 4 §6 (table and dependency paragraph), §8; S1 request §7.6 |
| **PA-1(b)** | Meaning of "host preflight" | (i) Gate 4 S3; (ii) P-1-C/P-1-D capture; (iii) both, separately named | **RESERVED** | Gate 4 §3.2(2), §6, §8; CAP-03 procedure purpose line |
| **PA-2(a)** | IPD QE / H-12 commit | P2-A `a52b47b0`; P2-B `001c3c80` with explicit acceptance of the §3.3(3) delta; P2-C new `C′` | **RESERVED** | Gate 4 §3.1, §3.2(2), (4), §5 S2a, §8; S1 determination §7, §9 |
| **PA-2(b)** | IRR consumer pin for H-12 and QE | `4740ba21` (Gate 4); `ba64b2d5` (IRR standing); a new IRR commit | **RESERVED** | Gate 4 §3.1; tracker §16.153, §16.163 |
| **PA-5** | Receipt semantics for DA-A1 | Option A (operator bundle, DA-A1 amended); Option B (IPD `C′`); Option C (hold P-1) | **RESERVED** (adopted-requirement gap) | DA-A1; D2 handoff §§1–5 |
| **PA-3d** | Diagnostic metadata at §4.3a | (i) Decline or defer; (ii) adopt as read-only metadata | **RESERVED** (non-gating) | Addendum §3.5; PA status matrix |

---

## 5. Dependency map

```
A6 (conformed, rev 2026-10-28c; host test NOT RUN)
  └─► next capture (P-1-C / P-1-D) ── needs: PA capture authorization (separate), PF-17 current-register confirmation,
                                          host run (NOT EXECUTED). Not authorized by this package.

PA-5 (Option A: DA-A1 amended | Option B: IPD C′ | Option C: hold)
  └─► P-1 authorization act ── needs: PA-5 resolved; act-designated pin defined (successor §8 step 0 term);
        │                       PA-2 if Option B (C′ designation)
        └─► P-1 execution (single-use; win32, Node >=22.13.0 <23; non-existent store path; NOT AUTHORIZED)

PA-1(a) (H-12 vs P-1 order) ─┐
PA-1(b) ("host preflight")   ├─► S2a H-12 adoption ─► S3 host preflight ─► S4 QE-1…QE-11 ─► S5 evidence ─► S6 dispositions
PA-2 (QE / H-12 commit, IRR pin) ┘   (S2a needs: Limb A native npm test at the designated commit; H-12 v3 generated
                                        at that commit with dist/** built there; express PA adoption, separate act)

PA-3d (diagnostics) ── none. Not gating on any path above.
```

Structural facts (Gate 4 §6): Limb A precedes the QE pin; H-12 adoption follows Limb A and precedes preflight; acceptance follows execution; admission follows acceptance. S3 is BLOCKED until S1 and S2a.

---

## 6. Readiness matrix

Legend: **NOT SATISFIED** = a reserved decision or external act is still needed; **SATISFIED** = authoritative record establishes it; **NOT RUN** = not executable here.

| Action | A6 | PA-1 | PA-2 | PA-3d | PA-5 | Other prerequisites | Readiness |
|---|---|---|---|---|---|---|---|
| Next capture (P-1-C / P-1-D) | SATISFIED for the procedure text (rev `2026-10-28c`); host test NOT RUN | Needed only if PA-1(b)(ii) or (iii) classes the capture as "host preflight" | Not gating | Not gating | Not gating | Separate PA capture authorization; PF-17 current-register confirmation; host execution | **BLOCKED** (no capture authorization exists) |
| P-1 authorization act | n/a | n/a | Not gating under DA-A1 (`001c3c80`) unless Option B | Not gating | **NOT SATISFIED** (Options A/B/C) | Act-designated pin defined; separate express act | **BLOCKED** |
| P-1 execution (S1) | n/a | n/a | n/a (`001c3c80` is the DA-A1 pin) | Not gating | Must be satisfied first | Host `desktop-no0nhtp`; store path; single use; `win32`; Node range | **BLOCKED** |
| H-12 v3 generation and adoption (S2a) | n/a | **NOT SATISFIED** (order) | **NOT SATISFIED** (commit and IRR pin) | Not gating | Not gating unless Option B | Limb A native `npm test` at the designated commit; H-12 generated there; express PA act | **BLOCKED** |
| S3 host preflight | n/a | **NOT SATISFIED** (definition) | **NOT SATISFIED** | Not gating | Not gating | S1 and S2a; clean trees at the designated commits | **BLOCKED** |
| S4 QE-1…QE-11 | n/a | Not gating | **NOT SATISFIED** | Not gating | Not gating | S3 | **BLOCKED** |
| IPD D2 correction (Option B) | n/a | n/a | **NOT SATISFIED** if Option B (`C′`) | n/a | **NOT SATISFIED** (choice) | Separate IPD authorization naming the files and CLI arguments | **HANDOFF READY, NOT AUTHORIZED** |
| Gate 5 / DQ-4 / Gate 4 result | n/a | n/a | n/a | n/a | n/a | Separate acts after S4 | **NOT GRANTED** |

---

## 7. Work completed in this pass

1. **Baselines and read-only verification.** IRR and IPD `main`, open PRs, the Gate 4 act, the S1 request and determination, the successor act §8, the D2 handoff, and the tracker §16.156 and §16.163 context were read and checked. IPD was read through a blobless read-only clone; no IPD write, no PowerShell, no harness, no host contact.
2. **Pin reconciliation (§2).** The Gate 4, S1, DA-A1, and procedure pins were reconciled by ancestry and tree reads. The IRR shallow clone was unshallowed for the ancestry checks (no commits created).
3. **A6 conformance (`IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md`, rev `2026-10-28c`).** Header row; §4.4 A6 read-back and file copy; §6.3 register `V1138`–`V1142`. The change is additive in effect: 22 insertions, 1 deletion (the `$originalBytes` line replaced).
4. **This consolidated package** (new file; additive). It does not duplicate or replace the historical package, the adoption record, or the D2 handoff.
5. **Additive pointers and tracker receipt.** Adoption record §10 (A6 method note withdrawn; the rest of the record is unchanged); status matrix §10 (pointer and status); tracker §16.164 with `CV-CORR-144` and `CHG-2026-10-28-07`. The tracker receipt for this PR's own merge is deferred to the next substantive update, as instructed.

---

## 8. Blocked work

- All capture, P-1 authorization, P-1 execution, H-12 generation or adoption, S3, S4, S5, S6, Gate 5, DQ-4, and any IPD write. Each is listed in §6 with its reason.
- **P-1 is BLOCKED** until PA-5 is resolved (Option A amendment, or Option B with the `C′` designation and fresh evidence, or a decision to stay on `001c3c80` with DA-A1 unamended and the receipt gap accepted expressly). The record does not resolve this choice.
- **H-12 adoption and QE are BLOCKED** until PA-1 and PA-2 are resolved, the Limb A native `npm test` runs at the designated commit, and H-12 v3 is regenerated and validated at that exact commit. None of this can run from this sandbox (Windows, `desktop-no0nhtp`, Ramki-run).
- **Procedure runtime test (A6)** is NOT RUN: it must run on the host before any capture.

---

## 9. Decisions requested of Program Authority

PA is asked to decide, in whatever order PA chooses, and each answer must name the commit and tree identities where a commit is involved:

1. **A6:** nothing is requested unless PA wishes to ratify the old in-memory method as a deviation. Conformance is already applied.
2. **PA-1(a)** and **PA-1(b)** (§3.2).
3. **PA-2(a)** IPD QE / H-12 commit (§3.3), including, for P2-B, express acceptance of the non-Limb-A delta; and **PA-2(b)** IRR consumer pin.
4. **PA-5** Option A, B, or C (§3.4). If Option B, the new commit `C′` and its designation are a separate PA act with fresh S2 evidence.
5. **PA-3d** (§3.5): decline, defer, or adopt.

**No decision is made by this package. Any decision must be recorded in a separate PA act with the authority of Program Authority. Until then, all items above remain RESERVED.**

---

## 10. Validation and non-grants

- **Static checks (this pass).** New and edited files are LF-only with no CR bytes, and `git diff --check` is clean. The UTF-8 typographic characters (section sign, dash, arrow) follow the existing documents. Tables and relative links are checked. The procedure's seven PowerShell blocks were checked for bracket and quote balance by script; the counts before and after the revision differ by the same amount, so the edit is balanced. The check cannot parse PowerShell, and no `pwsh` exists, so the parse and any runtime test are **NOT RUN**.
- **Non-grants (exhaustive).** No P-1 authorization, execution, or receipt; no capture; no host run or diagnostic; no PF-17 satisfaction; no acceptance of P-1-C or P-1-D; no IPD write; no change to `BASIS_COMMIT` or `BASIS_TREE`; no H-12 adoption or manifest promotion; no Gate 4, S3, QE, DQ-4, or Gate 5 movement; no PF-11 change; no PA decision made, inferred, or signed.

*End of consolidated PA decision package (`2026-10-28`). P-1 remains NOT EXECUTED, UNSPENT, and NOT AUTHORIZED.*


## Post-D2 status pointer (`CV-CORR-146`; `CHG-2026-10-28-09`; additive)

- **Existence correction.** After IPD PR #100 (D2) merged to IPD `main` as `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` (PR head `f722d7d46e056d4eb3039e9d3df8045b1cce4e1c`; tree `76f083d7058e170d8212455c03bad1033136ee68`; exact-head CI `40639983508` and post-merge CI `40640127958`, both SUCCESS), the post-correction commit `C′` **exists as a candidate**. The statements above that it "does not yet exist", "not existing", or "commit not yet created" were accurate on their dates and are superseded **as to existence only**.
- **Designation unchanged.** No commit is designated as `C′` or as any execution pin. The Gate 4 QE/H-12 pin is undesignated. D2 is not reviewed here for correctness.
- **Detail and decisions.** `IIPS_v3.0_CAP03_P1C_P1D_ONE_PASS_RECONCILIATION_AND_PA_PACKET_2026-10-28.md` (§§2, 6, 7.A–7.D) and tracker §16.166.
- **P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED.** P-1-C remains NOT ESTABLISHED; P-1-D remains DESIGNATED; NOT VERIFIED FOR THE ATTEMPT.

- **Post-D2 follow-up (`CV-CORR-146` addendum).** IPD PR #101 merged to `main` as `db84ac12f297eec2bb159ae785c3cc584f7d7e34` (head `d2782f2`; tree `831f00e0…`; CI `40642066409` and `40642196820`, SUCCESS). The D2 candidate identity has moved. It is still **undesignated**. See the packet §11 and tracker §16.166.7.

**Supersession pointer (2026-10-28, IPD PR #102).** IPD `main` is now `a9cd18e8ef3ad0543794da0a1abaaae5814c0bfe` (tree `546c8cea…`); PR #102 changed only the IPD tracker. The `db84ac12` statements above were correct as of PR #101 and are superseded as current. See packet §14 (`IIPS_v3.0_CAP03_P1C_P1D_PA_DECISION_PACKET_A-F_2026-10-28.md`) and tracker §16.168. No decision, designation, or P-1 status changes.
