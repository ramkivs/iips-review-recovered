# CAP-03 — P-1 Program Authority Decision Package: execution pin, capture-instrument identity, native-harness prerequisite (`2026-10-28`)

> ## STATUS: **DECISION PACKAGE PREPARED — NOT ADOPTED.** No decision in this record is effective. Each proposed decision is a text for Program Authority (Ramki) to adopt, amend, or reject. Nothing here is recorded as approved, and no signature or approval is supplied on the PA's behalf.
>
> **P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED.** This package does not authorize P-1, does not authorize or perform a fresh capture or host diagnostic, does not satisfy PF-17, does not accept P-1-C or P-1-D, does not change PF-11 acceptance, and does not advance any gate.

| Field | Value |
|---|---|
| Package ID (proposed) | `IIPS-V3-CAP03-P1-PA-DECISION-PACKAGE-2026-10-28-01` (census: 0 prior occurrences in IRR `origin/main`) |
| Decisions | **DA** `IIPS-V3-CAP03-P1-DA-EXECUTION-PIN-OF-RECORD-2026-10-28-01` · **DB** `IIPS-V3-CAP03-P1-DB-CAPTURE-INSTRUMENT-IDENTITY-2026-10-28-01` · **DC** `IIPS-V3-CAP03-P1-DC-NATIVE-HARNESS-PREREQUISITE-2026-10-28-01` |
| Tracker registration | Master tracker §16.159 · `CV-CORR-139` · `CHG-2026-10-28-02` (proposed; `V1089`–`V1096`) |
| Repository / branch | `ramkivs/iips-review-recovered`, `main`; prepared on `arena/3b872c0b-iips-review-recovered` |
| Authority that must adopt | Ramki, Program Authority (sole PA, per the master tracker header). Standing one-pass authorization does not cover reserved governance decisions, capture, or P-1 (task scope). |

---

## 0. Authoritative baseline (verified 2026-10-28)

| Item | Verified value | Method |
|---|---|---|
| IRR `main` = `origin/main` | `b657e15f4fdef559820729d006176e4ebd8aa77f`; tree `72eda346c9692cd8e12ce321173769eaa13adf7f` | `git fetch origin --prune`; `git ls-remote`; `git rev-parse` |
| IRR working tree before this pass | clean; branch `arena/3b872c0b-iips-review-recovered` (not on `origin` before this pass) | `git status --short` (empty) |
| Master tracker (`origin/main`) | blob `de2ac3ecb4ea4f6b9c9c72ad881def2c8a188d33`; 13,977 lines | `git rev-parse origin/main:<path>` |
| §16.143 disposition (`origin/main`) | blob `521d5482a331a9d7e4f50a1649ba93700f848df5` | same |
| CAP-03 fresh-capture procedure (`origin/main`) | blob `f585cd3a8a3ff8f68422336b66956b085a646392` | same |
| PF-11 correction supplement (`origin/main`) | blob `b2a2aa8086563f137f3f34324b5abb3509eb867e` | same |
| IPD `main` (read-only) | `888eb375eebee01640e44ccdcbb138a71e8c4513`; tree `cf3b90482fa7ed1f9780f20a9286164686885d2b` | GitHub API, read-only |
| IPD successor act | `evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md`, blob `528de6aeddbc8e5f3191be8792f3937d77de4037`, SHA-256 `df8e44f704814e2321b5134206b04f25097830bdc5dd53c4d907d1256e4c788d` | blob read; SHA-256 re-computed; matches archived authority parameters |
| IPD S1 identity determination | `evidence/cross-repository/IIPS_V3_CAP02_S1_IDENTITY_VALUE_DETERMINATION_EFFECTIVE_2026-10-24.md`, blob `b7746b5ed955abcf689ec57ca4a0748c0241ed09`, SHA-256 prefix `554741c70e3a24a7` | blob read |
| IPD execution tracker | `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md`, blob `8a2a4e45615b84e517b65fe2700d4a09cde8c3f7`, SHA-256 prefix `8f85ca5e1e4acc10` | blob read; matches archived `CurrentIPDTrackerSHA256` |
| IPD commits | `5fc74085ade980846ff4a07b36415b6d49446486` (tree `7226ef0033b3a7049169d8fcf9bcbc9908e2590b`) — the act's `BASIS_COMMIT`; `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (tree `399fa44a5f1953c0f61b452420fefb5985426ef1`, parent `8eec74ae27cda09f3c368b9c299895eae41554db`) — the §16.143 coordinate | GitHub API |
| Relationship of the two IPD commits | `001c3c80` is **50 commits ahead** and **0 behind** `5fc74085` (`5fc74085` is an ancestor) | `compare` API |
| P-1 execution status | No P-1 execution receipt; IPD tracker records Gate A′ provisioning as "not performed, not authorised, no store, no row" (one older line in that tracker still reads "successor PROPOSED"; stale, not relied on) | IPD tracker read; §16.156 |

**Historical correction to the prior investigation (verified in this pass).** The earlier readiness report stated that both 27 October archived captures showed `Get-FileHash` working "within the instrument's execution session". That statement is **not accurate for the required engine**. See DC §3.3: the one archive that records its session (`cap03-p1-20261027T110433Z`) ran under **PowerShell 7.6.8 Core**, not the Windows PowerShell 5.1 session the procedure requires; the other archive (`cap03-p1-20261027T133547Z`) records no session at all.

---

## 1. Decision DA — P-1 execution-pin of record

### 1.1 Question

Which IPD commit is the execution-pin coordinate for a P-1 attempt, given that the successor act's literal pin is `5fc74085` while the §16.143 disposition designates `001c3c80`?

### 1.2 Controlling evidence

**(E1) IRR §16.143 / disposition `IIPS-V3-CAP03-S2-CANDIDATE-SCOPED-BASELINE-DISPOSITION-2026-10-26-01`** (`docs/integration/IIPS_v3.0_CAP03_S2_CANDIDATE_SCOPED_BASELINE_DISPOSITION_2026-10-26.md`, blob `521d5482…`):
- Authority line: "Ramki, Program Authority … direction given `2026-10-26`", with the PA direction quoted verbatim in §1.
- §2 scope row: the candidate is designated for "the S2 execution/evidence basis **and** the P-1 execution-pin coordinate for the P-1 attempt of record, **candidate-scoped**".
- §5: "P-1 execution is not authorised. The single attempt remains `UNSPENT`."

**(E2) IPD successor act** (`IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01`, IPD `main`, blob `528de6ae…`, effective on publication, PR #67):
- §2: the "successor implementation basis (selected)" is `5fc74085…`, tree `7226ef00…`.
- §5.2: "`BASIS_COMMIT` = `5fc74085…` … (fixed by this act; **changed only by a later act**)".
- §8 step 0: preflight must show "`git rev-parse HEAD HEAD^{tree}` equal to the act-designated pin".
- §8.2: stop on "**Basis commit/tree** or any designated blob differs".
- §9: one execution; consumed on completion, success or failure.

**(E3) IPD S1 identity determination** (blob `b7746b5e…`, effective 2026-10-24):
- §7: "`BASIS_COMMIT` (`5fc74085…`) and `BASIS_TREE` (`7226ef00…`) also remain exactly as the successor act fixed them — … **not a pointer to the current tip; changing them would require a new act**."
- §7: "**No commit is declared here to be that final execution commit; it is fixed only when the provisioning/QE sequence actually runs (§9).**"
- §9: "A regenerated manifest must be produced at the final execution commit (successor act §8 / Gate 4 act §8 …)."

**(E4) Source at each commit (verified via the contents API, read-only):**

| File | At `5fc74085` (basis) | At `001c3c80` (designated) |
|---|---|---|
| `src/persistence/gateAPrimeValidation.ts` (identity constants `PRINCIPAL_LABEL`, `TENANT_ID`, `CANONICAL_OWNER_ID`; `BASIS_COMMIT`, `BASIS_TREE`) | **Absent** (contents API 404, read in this pass). The act's §5.1 file set adds it after the basis. | Present. Identity constants `'ramki-personal-local'`, `'ipd-personal-local'`, `'ipd-owner-ramki-personal'`. `BASIS_COMMIT = '5fc74085…'`, `BASIS_TREE = '7226ef00…'` (unchanged constants). |
| `src/persistence/gateAPrimeProvisioning.ts` (entrypoint) | **Absent** (contents API 404, read in this pass); consistent with the act's GA-V5 ("no provisioning entrypoint exists at the basis") | Present, blob `2cbce83f6572d211630ce0620dae49fa02fe4622` (step-0 identity) |
| `src/persistence/provisioning.ts`, `binding.ts` | present; blobs `dc844189…`, `96d0079d…` | same blobs (neither appears in the interval's changed-file list) |
| `execute` return value | — | `basisCommit: BASIS_COMMIT` (compiled `5fc74085…`); the file contains **no HEAD/git check** |

**(E5) Composition of the interval `5fc74085…` → `001c3c80…`** (`compare` API, 42 changed files): the act's own implementation and binding commits (`c62dee81`, `f9ec0c5f`); the DR-2 Option A IPD provider (`bc144b95`, IPD PR #89, changes `src/persistence/portfolio_store.ts`); the S2 Windows package-consumer fix (`001c3c80`, PR #91/#96 lineage); plus governance/evidence commits. The P-1 module's direct imports (`audit.js`, `connection.js`, `migration_ledger.js`, `gateAPrimeValidation.js`) are **not** among the changed files except `gateAPrimeValidation.ts`, which is the act's own binding change. `dist/` is **not tracked** in git at `001c3c80` (contents API returns 404), so the compiled "built entrypoint" cannot be verified from the repository.

### 1.3 Verified facts

1. §16.143 designates `001c3c80`/`399fa44a` as the P-1 execution-pin coordinate of record, candidate-scoped, by PA direction dated `2026-10-26`. It is later than the successor act (`2026-10-23`) and the determination (`2026-10-24`).
2. The successor act's §8 step 0 literally requires HEAD to equal "the act-designated pin", and §8.2 treats a basis-commit mismatch as a stop. The act's designated basis is `5fc74085`.
3. `5fc74085` cannot be executed as written: the provisioning entrypoint and the validation module that holds the identity constants are **absent** at that commit (contents API 404, verified in this pass; act GA-V5 states that no provisioning entrypoint exists at the basis). The act's §5.2 specifies the identity constants as `null` at the act's effective date, to be resolved by a later act. Executing at the basis is not a viable option.
4. The compiled `BASIS_COMMIT` at `001c3c80` is `5fc74085`. The determination expressly keeps it that way.
5. The `execute` return value records `basisCommit = 5fc74085…`, not the executing commit. A commit cannot contain its own hash, so no code commit can make `basisCommit` equal its own commit.
6. The determination says the final execution commit "is fixed only when the … sequence actually runs" (§7). §16.143 fixed a coordinate in advance.

### 1.4 Unresolved ambiguity

- **Literal conflict:** successor act §8 step 0 and §8.2 name the act-designated pin as `5fc74085`, while §16.143 designates `001c3c80` for the same purpose. No later IPD act amends step 0. The IRR disposition is later and states its own scope, but it is an IRR record that does not amend an IPD act.
- **Timing:** the determination (§7) contemplates fixing the execution commit when the sequence runs. §16.143 fixed it earlier. The record does not say which governs.
- **Receipt provenance:** the V-A2 receipt field `basisCommit` will show `5fc74085`, not `001c3c80`. The receipt therefore needs the executing HEAD recorded separately.
- **Composition:** the designated commit carries changes from other authorities (DR-2 provider, S2 fix). The P-1 module's direct imports are unchanged, but no PA record says the composition is accepted for P-1 purposes.
- **Scope of "final execution commit":** determination §9 ties the regenerated manifest to the "final execution commit". The record does not say whether that means the P-1 commit or the QE/Gate 4 commit.

### 1.5 Options

| Option | Description | Consequences | Assessment |
|---|---|---|---|
| **A-1 (recommended)** | PA written interpretation, recorded in the IRR register: the successor act's "act-designated pin" for §8 step 0 and §8.2 means the execution-pin coordinate of record designated under §16.143 (`001c3c80` / `399fa44a`). `BASIS_COMMIT`/`BASIS_TREE` are unchanged and record the act's basis. The execution HEAD is recorded separately in the receipt. Composition is acknowledged. The coordinate is candidate-scoped. | No IPD write. No change to compiled constants or S2 evidence basis. Operator preflight and receipt have a single stated rule. Resolves the literal conflict without a new act. | Smallest valid resolution. Matches the determination's §7 contemplation that the PA fixes the commit. |
| A-2 | Defer: leave the §16.143 coordinate as-is and require the future P-1 authorization act to name the execution commit explicitly. | Consistent with determination §7 literal wording. Leaves step 0 literal conflict open until authorization. Preflight still needs clarity. | Acceptable as a complement to A-1: the P-1 authorization act should name the commit in any case. |
| A-3 | Execute at literal `5fc74085`. | The entrypoint and validation module are absent at that commit, so no identity constants exist there. §8.2 stops on basis mismatch. | **Rejected.** |
| A-4 | New IPD act setting `BASIS_COMMIT` to `001c3c80`. | Impossible to self-embed. Any change to compiled constants creates a new commit, invalidates the S2 basis, and requires a new S2 chain. IPD write. | **Rejected.** |
| A-5 | Designate a new later commit (for example after manifest regeneration). | New pin; S2 and PF chain would need re-evidence. | **Rejected for P-1.** May be considered for the QE/Gate 4 chain under its own act. |

### 1.6 Recommendation

**A-1, with A-2 as a requirement.** The PA interprets step 0 and §8.2 as referring to the §16.143 coordinate, states that `BASIS_COMMIT` is unchanged, requires the executing HEAD to be recorded separately, and records acceptance of the 50-commit composition. The P-1 authorization act, when it is rendered, must name the execution commit explicitly and must not rely on this interpretation alone.

**Required authority:** Ramki as Program Authority. This is a reserved PA determination on which commit is the P-1 pin of record. It cannot be decided by an agent or by documentation work.

### 1.7 Proposed decision text (DA) — NOT ADOPTED

> **DA — P-1 execution-pin of record (proposed).** For CAP-03 P-1 and the IPD successor provisioning act `IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01`, the execution-pin coordinate of record is IPD commit `001c3c80618f2ee1d40e9a90912237e1a06e7b58`, tree `399fa44a5f1953c0f61b452420fefb5985426ef1`, as designated by §16.143 (`CV-CORR-123`) on `2026-10-26`, candidate-scoped. For the purposes of the act's §8 step 0 and §8.2, "the act-designated pin" is read as that coordinate. The act's `BASIS_COMMIT` `5fc74085ade980846ff4a07b36415b6d49446486` and `BASIS_TREE` `7226ef0033b3a7049169d8fcf9bcbc9908e2590b` are unchanged and remain the compiled constants recording the act's basis. Any provisioning receipt must record both the compiled basis and the executing HEAD and tree. The composition of `5fc74085…` → `001c3c80…` (42 changed files, including the DR-2 Option A provider and the S2 fix) is acknowledged; this acknowledgement is not a grant of any further authority. Any other execution commit requires a new PA decision and fresh S2 evidence at that commit. The P-1 authorization act, when rendered, must name the execution commit explicitly. **This decision does not authorize P-1, a capture, or any execution.** [PA adoption: pending — Ramki]

### 1.8 Downstream effects

- Permissible after adoption: the operator's capture-only preflight may check HEAD = `001c3c80` against this coordinate (subject to DB and DC).
- Still blocked: P-1 authorization; P-1-C acceptance; P-1-D verification for the attempt.
- Not changed: `BASIS_COMMIT`; the successor act; the determination; S2 evidence basis; the compiled `dist/` artifacts (not git-tracked).

### 1.9 Execution boundary

Not authorized by DA: any IPD write or act amendment; any change to `BASIS_COMMIT`; any S2 rerun; any build or test on the host; any manifest regeneration (which belongs to the Gate 4 / QE chain).

---

## 2. Decision DB — capture-instrument identity

### 2.1 Question

Which instrument revision must the fresh-capture procedure enforce: v1 (`85AC…`, 10,231 bytes) as the procedure literally states, or v2 as designated by the PF-11 correction supplement?

### 2.2 Controlling evidence

| Revision | Path (IRR `origin/main`) | Git blob | Size | SHA-256 (full) |
|---|---|---|---|---|
| **v1** (published, defective PF-11 loop) | `evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1` | `eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb` | 10,231 B | `85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b` |
| **v2** (corrected PF-11 root-safe) | `evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1` | `191f5828461286b0f6fcb688b023da5dfc68a265` | 10,990 B | `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e` |

All hashes were re-computed in this pass from Git object content (`git cat-file -p <blob> | sha256sum`) and match. Both files are LF-only in the object database (`\r` count 0).

**(E6) PF-11 supplement** (`docs/integration/IIPS_v3.0_CAP03_PF11_ROOT_SAFE_INSTRUMENT_CORRECTION_2026-10-27.md`, §4):
- "this supplement is the governed source/procedure update: it designates the new v2 artifact for a future attempt and **supersedes only the source-identity/derivative instructions in the earlier procedure that pointed to the defective instrument**. All unrelated pins, PF responsibilities, **stop gates**, evidence requirements, ordering, F4/F5 values, and scope remain governed by the existing procedure and are unchanged."
- "The v2 source identity in the final publication receipt is authoritative; an older `85AC…` digest or any previously generated derivative is not a substitute."

**(E7) Procedure** (`docs/integration/IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md`, blob `f585cd3a…`) still hard-codes v1 at these lines (read in this pass):

| Line | Text (abridged) |
|---|---|
| 60 | "Run these steps in a single, non-elevated **Windows PowerShell 5.1** session" |
| 71 | `$InstrumentRel` = v1 path |
| 77 | `$InstrumentBlob` = `eaea3f7f…` |
| 78 | `$InstrumentSha256` = `85ac7271…` |
| 208 | STOP if SHA ≠ `85ac…` or length ≠ `10231` |
| 236 | STOP if length ≠ `10231` |
| 325 | `source_bytes=10231` |
| 342 | STOP if SHA ≠ `85ac…` |
| 440 | `V1042` (historical register row) |

**(E8) Structure of v2 versus v1 (verified by diff in this pass):** v2 inserts `Find-GitWorktreeAncestor` after line 98 and replaces the PF-11 loop (v1 lines 128–134 → v2 lines 154–155). **Parameter lines 22, 27, and 28 are byte-identical in v1 and v2.** The procedure's "byte diff confined to lines 22/27/28" check therefore remains valid for v2.

**(E9) Residual host-locus issue (§16.156, R-4, narrowed but not closed):** the captured root-safe derivative was CRLF (11,257 B), while v2 is LF, protected by `text eol=lf`. The record states that a raw-byte substitution "cannot by itself produce CRLF" and that "this does not … close `R-4`".

### 2.3 Verified facts

1. v2 is the designated, current PF-11 root-safe instrument on `origin/main`. Its identity is independently verified (Git blob and SHA-256).
2. The supplement explicitly supersedes the procedure's source-identity instructions that point to the defective instrument, and states that an older `85AC…` digest is not a substitute. The supersession therefore already exists.
3. The procedure's STOP gates and manifest references still literally require v1. Followed verbatim, the procedure rejects v2 at line 208. That is a real contradiction at the level of executable instructions, though it is safe: it fails before invocation.
4. The byte-diff rule for lines 22/27/28 remains correct for v2.
5. Separately from identity, the procedure contains other gaps that the supplement does not resolve: (a) no PowerShell-edition gate despite the 5.1 requirement at line 60; (b) the source-byte read-back does not yet specify git-blob (rather than working-tree) reading, which is the R-4 mitigation; (c) the cross-reference to the supplement's §5 acceptance conditions is absent.

### 2.4 Unresolved ambiguity

Whether the supplement's supersession reaches the procedure's executable STOP literals, or only the "instructions" in prose, is not explicit. The safe reading is that it reaches the literals as "source-identity instructions", but the PA should confirm it, because the same procedure revision must also address DA, DC, and R-4.

### 2.5 Options

| Option | Description | Consequences | Assessment |
|---|---|---|---|
| **B-1 (recommended)** | PA affirms v2 (blob `191f5828…`, 10,990 B, SHA-256 `13783385…`) as the **sole** instrument identity for any future capture. Arena then publishes **one** procedure revision implementing Appendix A (identity literals, path, byte-diff expectations unchanged, git-blob source read-back, PowerShell-edition gate, supplement §5 cross-reference), as a documentation PR after DA and DC are adopted. | One coherent operator-facing revision. Historical v1 record and register rows preserved with a supersession note. | Recommended. The identity itself is already supplied by the supplement; the PA affirmation removes doubt about the STOP literals. |
| B-2 | Publish the identity-literal alignment **now** as a documentation-only PR, leaving the other gaps for later. | Authority arguably present under supplement §4. But the procedure would be revised twice, and R-4 and edition gates would remain open after the first revision. | Viable if the PA prefers an early fix. Not preferred. |
| B-3 | Keep v1 as authoritative. | Contradicts the supplement and §16.156 (v1 is the defective instrument). | **Rejected.** |
| B-4 | Rewrite the procedure from scratch. | Heavier than needed; discards reviewed evidence structure. | **Rejected for now.** |

### 2.6 Recommendation

**B-1.** The PA affirms v2 identity. The procedure revision is prepared and published as a single documentation PR after DA and DC are adopted, through exact-head CI and remote read-back. The correction is documentation-only in form but **substantive in effect** (it changes executable operator STOP gates and adds new checks), so it requires the PA's explicit authorization. It is not an unprompted documentation edit.

**Required authority:** Ramki as Program Authority (identity affirmation), plus the PA's explicit authorization of the procedure revision PR.

### 2.7 Proposed decision text (DB) — NOT ADOPTED

> **DB — capture-instrument identity (proposed).** The authoritative CAP-03 P-1 capture instrument is the PF-11 root-safe v2 instrument: IRR `origin/main` path `evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1`, Git blob `191f5828461286b0f6fcb688b023da5dfc68a265`, 10,990 bytes, SHA-256 `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e`. The v1 identity (`eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb`, 10,231 bytes, SHA-256 `85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b`) is superseded for all future capture, consistent with the PF-11 supplement §4. The v1 record, the 2026-10-27 captures, and all historical evidence are preserved unchanged and are not reclassified. The procedure revision implementing this identity is authorized to be prepared and published as a documentation PR after DA and DC are adopted, subject to exact-head CI and remote read-back. **This decision does not authorize a capture.** [PA adoption: pending — Ramki]

### 2.8 Downstream effects

- Permissible after adoption: preparation of the procedure revision (Appendix A) for review.
- Still blocked: any capture; P-1-C acceptance; PF-17 satisfaction.
- Not changed: v1 and v2 bytes; the existing captures `cap03-p1-20261027T110433Z-…` and `cap03-p1-20261027T133547Z-…`, which remain preserved and not accepted.

### 2.9 Execution boundary

Not authorized by DB: any change to the instrument bytes; any capture; any host run; any use of the 27 October run IDs.

---

## 3. Decision DC — native-harness prerequisite for the next capture

### 3.1 Question

Does the native PowerShell 5.1 harness prerequisite apply to the next capture? If so, what evidence satisfies it? If not, what replaces it?

### 3.2 Controlling evidence

**(E10) Supplement §5 — acceptance conditions before a subsequent capture** (`IIPS_v3.0_CAP03_PF11_ROOT_SAFE_INSTRUMENT_CORRECTION_2026-10-27.md`): "This correction does not authorize or initiate the next capture. Before a subsequent capture may be considered, all of the following must be verified: … 2. On the designated Windows host, the **native PowerShell 5.1 harness** passes all six required path cases without empty-path errors; its test-fixture fingerprint is unchanged. A Windows drive-root result and `.git` file result are explicitly evidenced."

**(E11) §16.154.5 and §16.156.6 / §16.157.5**: the same native prerequisite, described as "an outstanding prerequisite before any subsequent capture". §16.157.5 states: "Any failure, missing line, or substituted function is a FAIL of the prerequisite and must be published as such."

**(E12) §16.158 PA waiver (`CV-CORR-138`, `CHG-2026-10-28-01`)**: PF-11 was accepted with "the native Windows PowerShell 5.1 run required by §16.154.5 item 2 and §16.156.6 **WAIVED** by PA", on a compatibility-assisted basis. Its §16.158.5 scope text: "**The waiver does not extend to any subsequent capture.** Any future capture still requires its own PA decision and procedure run, and **the PA decides separately whether the native prerequisite applies to that capture.**"

**(E13) Native run `92d931fbb5204f74870aedf78610e29a`** (`handoff/evidence/pf11-root-safe/`, unchanged):
- `execution-result.txt`: `Harness passed: False`, `Harness exit code: 1`, `Final status: NOT PASSED`; timestamp `2026-10-27T23:01:48+05:30`.
- `execution.log`: Windows PowerShell transcript; `Username: DESKTOP-NO0NHTP\USER`; **`PSVersion: 5.1.26100.9444`, `PSEdition: Desktop`**; host `powershell.exe -NoLogo -NoProfile -NoExit -Command …`; transcript start `2026-10-27 22:58:10`. Gate 5 PASS. Gate 6 "SHA-256 VERIFICATION": **"The term 'Get-FileHash' is not recognized as the name of a cmdlet, function, script file, or operable program."**
- `harness-output.txt`: six `PASS` lines (ordinary parent, missing intermediate, filesystem root termination, `.git` directory, `.git` file, outside any worktree); **no fixture-fingerprint line; no success marker.**

**(E14) Compatibility run** (`harness-compat-result.txt`, 23:07:39 +05:30): `Final status: PASSED`, exit 0; the runner `run-pf11-hash-compat.ps1` is **not published** in the repository. §16.157 records "Get-FileHash substituted by a runner not in the record".

**(E15) Harness code** (`evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/03-test_pf11_root_safe.ps1`): the fixture fingerprint function `Get-TreeFingerprint` calls `Get-FileHash` for every file. So the native harness depends on the cmdlet in its own code path, in addition to the outer Gate 6 check.

**(E16) The two 27 October archives** (`evidence/integration/cap03-p1c-p1d-evidence-reconciliation-2026-10-27/`):
- `cap03-p1-20261027T110433Z-…`: `98-operator-session.txt` records **`PSVersion: 7.6.8`, `PSEdition: Core`, `Host Application: …pwsh.dll -noexit -command …`** (VS Code terminal), transcript start `2026-10-27 16:34:50`. Its `99-script-digest.txt` contains a computed `ScriptSHA256`.
- `cap03-p1-20261027T133547Z-…`: `99-script-digest.txt` contains a computed `ScriptSHA256=804A8322…`. **No session or transcript record is included in the archive.** Its runtime edition is therefore **unknown**.
- Both 27 October captures are **earlier** than the native failure (`16:34` and `19:05` local, versus `22:58` local).

**(E17) Procedure line 60** requires a Windows PowerShell 5.1 session. The procedure contains **no `$PSVersionTable` or `PSEdition` check** (verified by grep), so this requirement is not enforced by any STOP gate.

### 3.3 Verified facts and limits

1. **The prerequisite is in force.** Supplement §5 item 2 and §16.157.5 impose it on the next capture. The §16.158 waiver is explicitly limited to PF-11 and does not extend to the next capture. Absent a new PA decision, the native prerequisite still applies.
2. **The native failure is established as a fact of one run:** in a Windows PowerShell 5.1 Desktop session on the designated host, the cmdlet `Get-FileHash` was not recognized at the outer Gate 6 check, and the harness produced no fixture fingerprint. The run exited 1.
3. **What the native failure does not establish:** it does not establish that the cause is host-wide, that `Get-FileHash` is absent from Windows PowerShell 5.1 on that host generally, or the cause of the failure. The cause is undiagnosed (§16.158.2 item 1). It also cannot be attributed to the harness code versus the outer runner, because both call the cmdlet and the transcript shows only the outer check's error.
4. **What the 27 October captures do not establish for the required engine:** the verified capture ran in **PowerShell 7.6.8**, not 5.1. The other capture's engine is unrecorded. Neither result proves that the cmdlet resolves in a 5.1 session. Their `Get-FileHash` successes are therefore evidence about PowerShell 7 (and possibly 5.1 for the second capture, which is unknown), **not** about the required session. The earlier report's inference that the cmdlet "worked within the instrument's execution session" should be read as applying to the PowerShell 7 session only.
5. **The compatibility pass** proves traversal logic under a substituted hash function. It is not a native pass and does not evidence cmdlet resolution in 5.1 (§16.157).
6. **Whether a successful `Get-FileHash` proves the native harness is operational:** no. The harness has a different host command line (`-NoExit -Command`), a different runner, a different test fixture, and a different (5.1) engine. The only way to show command resolution in the required engine is an in-session check in that engine.
7. **The procedure already STOPs before invocation** if the step-0 and self-digest hashes fail (lines 208, 236, 275, 342, 352, 361), so a `Get-FileHash` failure in the attempt session would stop the capture before the sole invocation. However, the instrument itself also calls `Get-FileHash` during execution (v2 line 211, `ScriptSHA256`); a pre-invocation engine check is therefore required for safety, not merely for hygiene.

### 3.4 Options

| Option | Description | Evidence it would produce | Authority needed | Assessment |
|---|---|---|---|---|
| **C-1** | The prerequisite applies as written. Run `03-test_pf11_root_safe.ps1` natively on the host in Windows PowerShell 5.1, six cases plus fingerprint, under a fresh run ID. | A native pass or fail. A fail would be inconclusive about cause. | **New host run.** It is a diagnostic/test execution on the host, not a capture. Requires PA authorization. | Strict and literal. Costly in host time. A second native failure would not diagnose the first. |
| **C-2 (recommended)** | PA decides that the native harness prerequisite does **not** apply to the next capture, and substitutes these pre-invocation STOP checks inside the same operator session, all in **Windows PowerShell 5.1**: (a) `$PSVersionTable.PSEdition -eq 'Desktop'` and `PSVersion` major 5; (b) `Get-Command Get-FileHash -ErrorAction Stop` resolves with Source `Microsoft.PowerShell.Utility`; (c) `Get-FileHash` of the v2 source bytes, read from the Git blob, equals `13783385…`; (d) any failure STOPs before invocation, and the failure output is preserved. The capture's own PF-11 output must show `InsideGitWorktree` lines without empty-path errors (an acceptance criterion, not a pre-invocation gate). | Engine and cmdlet resolution in the attempt session, recorded before invocation. | PA decision (waiver for next capture only). Procedure revision (DB) carries the checks. | Narrow and explicit. It removes the unverified dependency on the historical harness session without claiming the native harness passed. |
| C-3 | Authorize a read-only native 5.1 diagnostic first (for example `Get-Command Get-FileHash`, `$env:PSModulePath`, `Get-Module -ListAvailable Microsoft.PowerShell.Utility`) to diagnose the historical failure before any capture. | Diagnostic evidence; cause may or may not be found. | New host diagnostic. PA authorization. | Optional. Not needed for C-2. Would be needed only if the PA wants the root cause before any capture. |
| C-4 | Treat the 27 October captures as proof that the cmdlet works in 5.1. | None for 5.1. | — | **Rejected.** One is verified PowerShell 7 and the other is unrecorded. |
| C-5 | Keep the prerequisite and defer all capture indefinitely. | None. | — | Safe but blocks P-1-C with no defined path. Not preferred. |

### 3.5 Recommendation

**C-2.** The PA decides that the native-harness prerequisite is replaced for the next capture by the pre-invocation 5.1 checks above. The historical native failure remains recorded as NOT PASSED. The waiver does not accept PF-11 further, does not satisfy PF-17, and does not accept P-1-C or P-1-D. If the PA prefers root-cause diagnosis before any capture, C-3 may be authorized separately, but C-2 does not depend on it.

**Required authority:** Ramki as Program Authority. The supplement §5 condition and §16.158.5 both reserve this decision to the PA.

### 3.6 Proposed decision text (DC) — NOT ADOPTED

> **DC — native-harness prerequisite for the next capture (proposed).** The native Windows PowerShell 5.1 harness prerequisite in PF-11 supplement §5 item 2 and §16.154.5 / §16.156.6 / §16.157.5 **does not apply** to the next CAP-03 P-1-C/P-1-D capture, and is replaced for that capture only by the following pre-invocation checks, all performed in a single non-elevated Windows PowerShell 5.1 session on `desktop-no0nhtp`: (a) `$PSVersionTable.PSEdition` is `Desktop` and the major version is 5; (b) `Get-Command Get-FileHash -ErrorAction Stop` resolves to Source `Microsoft.PowerShell.Utility`; (c) `Get-FileHash` of the v2 instrument's source bytes, read from Git blob `191f5828461286b0f6fcb688b023da5dfc68a265`, equals `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e`; (d) any failure is a STOP before invocation, and its output is preserved unchanged. The native run `92d931fbb5204f74870aedf78610e29a` remains NOT PASSED. The compatibility-assisted pass remains a traversal-logic pass only. This decision does not waive PF-11 acceptance, does not satisfy PF-17, does not accept P-1-C or P-1-D, and does not authorize a capture or any host diagnostic. [PA adoption: pending — Ramki]

### 3.7 Downstream effects

- Permissible after adoption: the procedure revision (DB) may carry checks (a)–(d); a separate PA capture authorization would still be needed before any capture.
- Still blocked: the capture itself, P-1-C acceptance, P-1-D verification, PF-17 satisfaction, and P-1 authorization.

### 3.8 Execution boundary

Not authorized by DC: any native harness run; any host diagnostic; any capture; any rerun of PF-11; any change to the historical native or compatibility records.

---

## 4. Consolidated Program Authority decision (proposed package — NOT ADOPTED)

The three proposed decisions are separable. The PA may adopt, amend, or reject each. The package is designed so that adopting it authorizes **none** of: P-1 execution, a P-1 authorization, a fresh capture, a host diagnostic, PF-17 satisfaction, P-1-C or P-1-D acceptance, a gate movement, or any IPD write.

> **Consolidated decision (proposed).** Program Authority: (1) adopts DA as stated in §1.7; (2) adopts DB as stated in §2.7 and authorizes the procedure revision described in Appendix A, to be prepared and published only after DA and DC are adopted and through the established IRR documentation workflow; (3) adopts DC as stated in §3.6. **Non-grants:** P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED; no capture is authorized; no host diagnostic is authorized; PF-11 acceptance under §16.158 is unchanged and the native run remains NOT PASSED; PF-15, F4, F5, `DISP-01`–`03`, `OBS-01`, S3, QE, DQ-4, Gate 4, and Gate 5 are unchanged; no IPD write, commit, branch, or PR is authorized; `BASIS_COMMIT` is unchanged; the 27 October captures remain preserved and unaccepted and their run IDs are not reusable. [PA adoption: pending — Ramki]

---

## 5. Remaining prerequisites (reconciled matrix, verified 2026-10-28)

| Item | Status | Basis |
|---|---|---|
| P-1 | **NOT EXECUTED / UNSPENT / NOT AUTHORIZED** | §16.158.5; §16.153.5 |
| P-1-A S2 acceptance | SATISFIED, candidate-scoped (R-1–R-4 unwaived) | §16.144 |
| P-1-B pin disposition | SATISFIED, candidate-scoped; **execution-commit wording requires DA** | §16.143 |
| P-1-C host preflight | **NOT ESTABLISHED**; requires the next capture, which requires DB, DC, and a separate capture authorization | §16.153.5; §16.156 |
| P-1-D F4 store path | Designated; **NOT VERIFIED for the attempt**; host-bound | §16.153.5; §16.155 |
| P-1-E PF-15 | SATISFIED, EFFECTIVE (act `…-02`) | tracker |
| P-1-F single attempt | UNSPENT; no P-1 authorization act; requires a separate PA act naming the execution commit | §16.158; successor act §9 |
| Identity values | SATISFIED (determination `b7746b5e…`) | IPD determination |
| Native-harness prerequisite | Waived for PF-11 only; **applicability to the next capture is DC** | §16.158.5; supplement §5 |
| PF-17 | Register limb VERIFIED repo-side; **capture limb NOT EVIDENCED** | §16.156 |
| Built-artifact check ("S1 constants in the built entrypoint") | **UNVERIFIED.** Source constants verified at `001c3c80`; `dist/` not tracked in git; no host build | §1.2 E4–E5 |
| Instrument identity (procedure) | **Procedure still v1 literal**; v2 authoritative per supplement §4; **DB** | §2 |
| R-4 host eol / source read-back | **OPEN** (narrowed by §16.156; not closed) | §16.156 |
| Attempt-session engine and `Get-FileHash` | **UNVERIFIED** in the required 5.1 session; **DC** | §3 |
| Gate states | S3 NOT REACHED · QE 0/11 · DQ-4 8/10 · Gate 4 AUTHORIZED — NOT STARTED · Gate 5 NOT INITIATED | §16.153.5 |

---

## 6. Actions completed in this pass

**Read-only (no writes anywhere except this IRR document and its tracker registration, see §8):**
- Live IRR refs fetched and verified; IPD refs read through the GitHub API (no IPD writes, commits, branches, or PRs).
- Read §16.143 disposition, §16.153–§16.158 tracker sections, the fresh-capture procedure, and the PF-11 supplement.
- Read the successor act and determination (IPD blobs), the IPD execution tracker, and the P-1 provisioning source at `001c3c80` and `5fc74085`.
- Read the native and compatibility PF-11 evidence in `handoff/evidence/pf11-root-safe/`.
- Inspected the two 27 October capture archives (`98-operator-session.txt`, `99-script-digest.txt`, `00-run-authority-parameters.txt`) in `/tmp`.
- Compared v1 and v2 instruments with `diff` and checked the parameter-line positions.
- No host contact. No PowerShell or Node run on any host. No P-1, no capture, no PF-11 rerun, no harness run, no diagnostic.

**Documentation (this pass):**
- Created this decision package (`docs/integration/IIPS_v3.0_CAP03_P1_PA_DECISION_PACKAGE_2026-10-28.md`), status NOT ADOPTED.
- Tracker registration §16.159 and change row `CHG-2026-10-28-02` are described in §8 below and are performed in the same commit.

**Not performed:** procedure edit (deferred to a single revision after DA and DC; see DB §2.6); any tracker status change to P-1, PF-15, PF-17, S3, QE, DQ-4, Gate 4, or Gate 5; any PA decision record marked adopted.

---

## 7. Immediate next action

**Program Authority decision (Ramki) on the consolidated package in §4.** This is a PA decision. It requires no documentation correction and no host action. Until it is adopted:
- DA's interpretation is not in force, and the operator must not treat `5fc74085` or `001c3c80` as a settled step-0 pin beyond the §16.143 coordinate already in place;
- the procedure still carries the v1 literals, which is safe because it fails before invocation;
- no capture may be considered.

After adoption, the earliest next steps are: (1) Arena prepares and publishes the procedure revision (Appendix A) via PR, exact-head CI, merge, and read-back; (2) a separate PA capture authorization is considered; (3) only then the designated operator may run the single capture-only preflight.

---

## 8. Final disposition and tracker registration

**Disposition: DECISION PACKAGE READY.** The evidence and proposed decision text are complete and ready for Program Authority review. P-1 remains unauthorized. No decision has been adopted.

Outstanding items that do not block PA review, and are dispositioned by the package: the 133547Z capture engine (unknown; not relied on), R-4 (addressed in Appendix A), the built-artifact check (requires a host build, which is outside this pass), and the attempt-session engine check (DC).

Tracker registration (performed in this commit): §16.159 with status "PREPARED — NOT ADOPTED", pointer to this package, `V1089`–`V1096` verification rows, and a change row `CHG-2026-10-28-02`; the header "Last Updated" row is updated to point to §16.159. No other tracker row is changed.

---

## Appendix A — Proposed procedure revision (NOT APPLIED; for use only after DA and DC are adopted)

Target: `docs/integration/IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md` (blob `f585cd3a…`). The historical text is preserved; the revision adds a supersession note and replaces the following identity and gate expressions.

| # | Procedure location | Current | Proposed |
|---|---|---|---|
| A1 | line 71 `$InstrumentRel` | v1 path | `evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1` |
| A2 | line 77 `$InstrumentBlob` | `eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb` | `191f5828461286b0f6fcb688b023da5dfc68a265` |
| A3 | line 78 `$InstrumentSha256` | `85ac7271…a30b` | `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e` |
| A4 | lines 208, 236, 342 | STOP texts with `10231` / `85ac…` | `10990` / `13783385…`; reword the STOP text to name v2 |
| A5 | line 325 `source_bytes` | `10231` | `10990` |
| A6 | §4.2–§4.4 source read | working-tree read | **Read the source bytes from the Git blob** (`git cat-file -p 191f5828…` written to a file), assert LF-only (zero `\r`), assert size and SHA-256, and STOP on any CRLF. Addresses §16.156 R-4 (i). Must be tested before publication. |
| A7 | §4.3 session checks | none for PowerShell edition | Add the DC §3.6 checks (a)–(d) as a STOP gate, **before** any capture directory is created. |
| A8 | line 60 | "Windows PowerShell 5.1 session" (unenforced) | Keep the text and enforce it through A7. |
| A9 | step-0 "act-designated pin" wording (§4.2 and the successor-act reference) | literal wording | Replace with the DA execution-pin coordinate of record (`001c3c80618f2ee1d40e9a90912237e1a06e7b58` / `399fa44a5f1953c0f61b452420fefb5985426ef1`), and record HEAD separately from the compiled `BASIS_COMMIT`. |
| A10 | §4.4 byte-diff expectation "confined to lines 22/27/28" | — | **Unchanged** (verified: parameter lines are identical in v1 and v2). |
| A11 | §16.153.4 / supplement §5 cross-reference | none | Add a cross-reference to supplement §5, with the DC replacement noted as applying to the next capture only. |
| A12 | V1042 and other historical register rows | v1 identity | **Preserved unchanged**; a supersession note only. |

Verification before publication: the revised procedure must be checked by a textual diff against the historical blob (only the rows above change); any PowerShell fragment changed must be parsed; and any new gate must be exercised against both the v2 bytes (PASS) and a deliberately wrong SHA (STOP) in a non-capture test that is authorized separately.

---

## Appendix B — Verification register (this pass)

| ID | Check | Result |
|---|---|---|
| `V1089` | Live IRR `origin/main` = `b657e15`; working tree clean; tracker SHA-256 equals the copy used in the prior pass | **PASS** |
| `V1090` | v1 instrument: blob `eaea3f7f…`, 10,231 B, SHA-256 `85ac7271…` (recomputed from Git object) | **PASS** |
| `V1091` | v2 instrument: blob `191f5828…`, 10,990 B, SHA-256 `13783385…` (recomputed from Git object); LF-only | **PASS** |
| `V1092` | Parameter lines 22/27/28 identical in v1 and v2 | **PASS** |
| `V1093` | IPD successor act and determination blob identities and SHA-256 prefixes re-read at IPD `888eb375` | **PASS** |
| `V1094` | `001c3c80` vs `5fc74085`: `BASIS_COMMIT` value, identity constants, ancestry (`compare`: 50 ahead, 0 behind), changed-file list, `dist/` untracked | **PASS** — recorded in §1.2 |
| `V1095` | Native run (`execution.log`, `execution-result.txt`, `harness-output.txt`) and compatibility run values as stated | **PASS** |
| `V1096` | 27 October archives: PowerShell edition of `110433Z` = 7.6.8 Core; `133547Z` edition not recorded | **PASS** (as stated; `133547Z` remains UNKNOWN) |

No check ran a PowerShell or Node process on any host. No tests were run because no code changed.
