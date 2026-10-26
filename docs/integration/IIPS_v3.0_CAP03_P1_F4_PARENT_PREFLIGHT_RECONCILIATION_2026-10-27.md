# CAP-03 — P-1 F4 Parent-Directory Preflight Reconciliation and P-1-C/P-1-D Capture Instrument (`2026-10-27`)

> **STATUS: PROCEDURE RECONCILIATION RENDERED; NO HOST CONTACT; NO EXECUTION.** This record resolves one
> self-referential preflight deadlock at P-1-session scope, publishes the read-only capture instrument for
> `P-1-C`/`P-1-D`, and records what may and may not be reused. It changes **no** PA-rendered value, **no**
> path, **no** pin, **no** fence and **no** gate. It does not execute `P-1`, does not create the F4 parent
> directory or the store, and does not advance `S3`, `QE`, `DQ-4`, Gate 4 or Gate 5. `P-1` remains
> **UNSPENT** and **not authorized to execute**.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-RECONCILIATION-2026-10-27-01` |
| **Record type** | Procedure reconciliation + preparation instrument. Not an execution receipt, not a host observation, not an acceptance |
| **Prepared by** | Arena Agent Mode — preparation and publication only; never host execution |
| **Governing locus** | `ramkivs/iips-review-recovered`, `refs/heads/main` |
| **Reviewed baseline (IRR)** | `fd5dd32b3dd269c840efdd13fcd0f90317ef27e4` |
| **Reviewed baseline (IPD, read-only)** | `ramkivs/iips-production-market-data` `main@888eb375eebee01640e44ccdcbb138a71e8c4513` |
| **F4 value under review** | `C:\iips-data\iips\user-portfolio.sqlite` — **unchanged, not reopened, not restated as a new selection** |
| **F4 effective act** | `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02`, blob `3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d` |
| **Host contact** | **NONE.** Arena has no route to `desktop-no0nhtp` and claims no Windows verification |
| **IPD writes** | **0** |
| **Store-path creation** | **0 files, 0 directories** |

---

## 1. Scope and non-grants

**In scope.** The single inconsistency between (a) the preflight condition that the F4 parent directory must
already exist, (b) the preflight prohibition on creating anything on the store path, and (c) the shipped
implementation that creates the parent itself. Plus the preparation of the read-only `P-1-C`/`P-1-D` capture
instrument and the reuse determination for each `PF` item.

**Explicitly not in scope, not reopened and not re-investigated by this record:**

- The F4 path value, the F2 endpoint literal, the F5 evidence root and the F1–F6 determinations. Settled at §16.137 / §16.140.4 **P-1-E**; not reopened.
- The F4 literal-integrity question. Settled — the `-01`/`-02` code spans are byte-identical and canonically well-formed (39 bytes, 3 separators); recorded previously and not revisited here.
- The three-drive/`H:` application layout compatibility. Settled in the immediately preceding investigation; the present record assumes it and does not restate it.
- Operator permissions and elevation of directory creation. The PA has confirmed the personal-laptop, non-elevated-create premise; **no permission investigation is repeated here**.
- `P-1-B` execution-basis pin disposition (tracker §16.143). Referenced only as the source of `PF-07`'s expected coordinate; **not re-derived, not re-designated, not reopened**.
- `S2` acceptance (§16.144), residuals `R-1`–`R-4`, `PF-08`, `S3`, `QE-1`…`QE-11`, `DQ-4`, Gate 4, Gate 5, and any CAP-02 workstream.

## 2. The inconsistency, stated exactly

### 2.1 The three conflicting statements

| # | Source | Statement |
|---|---|---|
| 1 | IPD `evidence/cross-repository/IIPS_V3_CAP03_HOST_READINESS_PACKET_2026-10-24.md` **PF-13** (blob `9d9c5970…`) | "parent exists and is local fixed NTFS; not a cloud-synced or network path" |
| 2 | Same packet, **PF-12** | "**False**; the path is recorded verbatim; **no directory/file is created by preflight**" |
| 3 | IPD `src/persistence/connection.ts` line 84 (blob `5169e402…`) | `mkdirSync(dirname(filePath), { recursive: true });` |

Statement 3 executes only inside `openDatabase`, which is reached by the **single `P-1` execution**. So the
terminal parent `C:\iips-data\iips` is created **by `P-1` itself**, after the preflight that would require it
to already exist.

### 2.2 Why this is a deadlock rather than a strict-but-satisfiable check

- To satisfy PF-13 at `P-1` time the operator would have to create `C:\iips-data\iips` **before** the attempt.
- PF-12 forbids the preflight from creating any directory or file on the store path.
- Therefore PF-13 as literally worded can only be satisfied by violating PF-12, or by waiting for the very
  execution that PF-13 is gating. **Neither order is lawful.**

### 2.3 The PA-level act does not impose the condition

The authoritative `P-1` path condition is the successor Gate A′ act step 1
(IPD `evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md`,
blob `528de6ae…`, lines 260–262). Its complete list of conditions is:

> absolute; outside every Git working tree; local fixed NTFS; not a synchronized folder; operator-writable
> without elevation; **file must not pre-exist** (`Test-Path` = `False`, recorded verbatim).

**"Parent exists" is not among them.** The condition reads on the *file*, not on its parent directory.

The effective PF-15 act §4 is consistent with that reading. It declines to claim the parent's filesystem
characteristics and requires those **characteristics** to be checked on the host:

> The PA act does not claim the path's parent filesystem characteristics or that the DB/sidecars are absent.
> Those facts must be checked on the designated host under the governing P-1 procedure immediately before
> execution.

*Characteristics*, not *existence*.

### 2.4 Provenance of the defective condition

The packet declares its own character:

> **Record type** — Readiness checklist, procedure template, evidence template and blocker record. Not an
> execution receipt, qualification result or acceptance (line 16)
>
> **Prepared by** — Arena Agent Mode — preparation and publication only; never host execution (line 18)

PF-13's existence clause is therefore a **preparing-capacity checklist condition**, not a PA-rendered value,
determination, pin or fence. It is stricter than the PA act and stricter than the implementation, and it is
unsatisfiable. It is corrected here under the preparing capacity's own competence, exactly as the §16.130.2
precedent repaired a published-record defect disclosed by the same capacity.

## 3. Authority analysis — what may be disposed of here, and what may not

| Item | Who rendered it | May the preparing capacity dispose of it? |
|---|---|---|
| F1–F6 values (F4 path, F2 pipe, F5 evidence root) | **PA act** `…-02` | **No.** Untouched. |
| `P-1` authorization / single-use consumption | **PA acts** + §16.140.4 `P-1-F` | **No.** Untouched. |
| Execution-basis pin (§16.143) | **PA direction** | **No.** Untouched. |
| S2 acceptance (§16.144) | **PA determination** | **No.** Untouched. |
| PF-13 wording / PF-12 scope (readiness checklist) | **Preparing capacity** (Arena), by the packet's own declaration | **Yes**, provided no safety content is lost and no PA value moves. |
| `P-1` step-2 pre-state *interpretation* | Procedure reading of the successor act | **Yes, interpretively only** — the reading adopted is *stricter*, never weaker. |
| CLI invocation syntax | Technical fact of the shipped parser | **Yes**, as a disclosed observation; no text is amended. |

**Conclusion:** the minimum authoritative procedure-level disposition is a **dated IRR-locus procedure
reconciliation** that (i) removes the unsatisfiable existence clause **only at `P-1` scope**, (ii) confines
PF-12 to the store path so PF-14 stays executable, and (iii) fixes the step-2 pre-state reading. **No new PA
act is required for the disposition itself**, because no PA-rendered value, determination, pin, fence or gate
is altered and no safety condition is relaxed. The conditional instrument that *would* be required if the PA
declines this disposition is named at §10.

## 4. Dispositions

### DISP-01 — PF-13 at `P-1`-session scope is evaluated at the nearest existing ancestor

**Rule.** At `P-1`-session scope, PF-13 is satisfied when the **nearest existing ancestor** of `$StorePath`
is local fixed NTFS and is not a cloud-synchronized or network location. The terminal parent
`C:\iips-data\iips` **need not pre-exist**, and its absence is **not** a STOP.

**Who creates it.** The terminal parent is created by the authorized single `P-1` execution — `connection.ts`
line 84, recursive `mkdirSync` — **and by nothing else**. Pre-creating it remains **unauthorized** and remains
a STOP.

**`S3` scope is unchanged.** At `S3`, PF-13 retains its original text: after `P-1` the terminal parent **MUST**
exist, and it is then inspected directly. This disposition does not relax `S3`.

**Safety content preserved.** Everything protective in the F4 check is carried by:
- **PF-11** — absolute, outside every worktree, not synchronized, local fixed NTFS, operator-writable without elevation;
- **PF-12** — store, `-wal`, `-shm` and `-journal` absent; nothing created on the store path by preflight.

The existence clause added no protection that these two do not already carry; it only made the check
unsatisfiable.

**Repository-side path facts (no host contact needed).** Under `path.win32`, the ancestor chain is
`C:\iips-data\iips → C:\iips-data → C:\`. Under the stated absence of the terminal parent, the nearest
existing ancestor is `C:\`. The chain contains no `.git` directory at any level, so the store is outside every
Git worktree by construction — which is also what the implementation's `isInsideGitWorktree` walk reports
(`gateAPrimeProvisioning.ts` lines 124–132, 137–141).

### DISP-02 — PF-12 binds the store path, not the evidence root

**Rule.** PF-12's "no directory/file is created by preflight" binds `$StorePath` and its ancestor chain. It
does **not** prohibit creating the PF-14 evidence root or writing capture transcripts there.

**Rationale.** PF-12 and PF-14 would otherwise be jointly unsatisfiable — capturing a transcript requires
somewhere to write it, and PF-14 is the sanctioned location. The standing `S2` practice already creates
`$EvidenceRoot` with `New-Item -ItemType Directory -Force` (CAP-02 runbook §3), which confirms this reading.

**Not relaxed.** No store file, no sidecar and no store-path ancestor may be created by preflight.

### DISP-03 — step-2 pre-state on a correctly absent store is the `STORE_NOT_FOUND` refusal

**Rule.** Because PF-12 requires `$StorePath` to be absent, `--mode=validate` at step 2 refuses with
`STORE_NOT_FOUND` (`gateAPrimeValidation.ts` lines 371–372, exit 1). **That refusal, recorded verbatim, is the
pre-state evidence** and satisfies successor-act step 2's intent: an absent store cannot contain a
pre-existing `ACTIVE` row, so `bindings = 0` and `memberships = 0` hold *a fortiori*.

**Anomaly rule — this direction is stricter, not weaker.** A **successful** `validate` report at step 2 is the
anomaly: it proves the store pre-existed, contradicts PF-12, and is a **STOP before any `--mode=execute`
invocation**.

### OBS-01 (disclosed, not a disposition) — the `P-1` CLI accepts only `--flag=value`

`parseGateAPrimeArguments` / `requiredOption` (`gateAPrimeProvisioning.ts` lines 376–382) split on `=` and
throw `ARGUMENT_INVALID` for a space-separated form. The CAP-02 runbook `P-1` block (lines 84–89) writes
`--act-id <ACT_ID>`, `--store <ABS_PATH>`, `--principal-label <v>`, … in space-separated form and would fail on
substitution. The capture instrument therefore uses the `=` form exclusively.

**This record does not amend the runbook.** The observation is disclosed so the single-use attempt is not
consumed by an invocation error. It changes no value and no gate.

## 5. What does not change

F4 · F2 · F5 · F1/F3/F6 · `P-1` authorization, consumption and single-use state · `P-1-A` · `P-1-B` · PF-11 ·
PF-12 · PF-14 · PF-15 · PF-16 · PF-17 · every baseline pin · the H-12 manifest · every `503` fence ·
`WRITE_NOT_AUTHORIZED` · `durable:false` · `S3` · `QE` · `DQ-4` · Gate 4 · Gate 5 · IPD contents (0 writes).

## 6. `P-1-C` / `P-1-D` capture instrument and reuse determination

### 6.1 Reuse determination

The governing prior determination stands: prior `S2` host activity is user-reported and **does not establish a
future `P-1` session's state** (tracker §16.140.4 `P-1-C`; identity-prerequisite receipt line 118). It is not
overturned here.

| PF | Reusable? | What may be reused | Owner |
|---|---|---|---|
| PF-01…PF-06, PF-10 | **No** — session state | expected values only | Ramki |
| PF-07, PF-08, PF-09 | **No** — live worktree state | expected coordinate only, read from the effective basis at §16.143; **not re-derived here** | Ramki |
| PF-11 | **Partly** | path string and syntax facts fully determined repository-side (39 bytes, 3 separators, absolute, outside every worktree) | Arena (done) + Ramki (volume/ACL) |
| PF-12 | **No** | nothing — `Test-Path` False must be captured verbatim | Ramki |
| PF-13 | **Rule resolved; observation outstanding** | ancestor chain and nearest-existing-ancestor computation (repository-side) | Ramki |
| PF-14 | **No** | operator selection at attempt time | Ramki |

### 6.2 The instrument

`evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1`

It is read-only with respect to the store by construction: it creates **no** store file, **no** `-wal`, `-shm`
or `-journal`, and **no** directory on `$StorePath` or any of its ancestors; it writes only under
`$EvidenceRoot`; it **never** invokes `--mode=execute`. It implements DISP-01's nearest-existing-ancestor walk,
DISP-02's evidence-root separation and DISP-03's step-2 reading, and it documents OBS-01's `=` form for the
operator's later authorised steps without invoking them.

**It has not been executed.** Arena cannot run it, and running it is `P-1-C`/`P-1-D` work owned by the
operator.

### 6.3 What this pass completed, and what it cannot

**Completed (repository-side, lawful for the preparing capacity):** the disposition removing the deadlock; the
scoped PF-12 reading; the step-2 pre-state reading; the CLI-form disclosure; the capture instrument; the reuse
determination; the repository-side PF-11/PF-13 path facts.

**Not completable here:** the verbatim host capture of PF-01…PF-14 on `desktop-no0nhtp`. There is no P-1-session
transcript and Arena has no route to the host. `P-1-C` therefore remains `NOT ESTABLISHED` and `P-1-D` remains
`NOT VERIFIED` — with its **structural blocker now removed**, so the capture is the only thing standing
between the current state and eligibility for the single attempt.

## 7. Status after this record

| Item | Before | After | Change |
|---|---|---|---|
| **`P-1-A`** formal S2 acceptance | `SATISFIED` (§16.144) | `SATISFIED` | none |
| **`P-1-B`** execution-basis pin | `SATISFIED` candidate-scoped (§16.143) | `SATISFIED` candidate-scoped | none |
| **`P-1-C`** host preflight | `NOT ESTABLISHED` | **`NOT ESTABLISHED`** — capture instrument prepared; no transcript exists | preparedness only |
| **`P-1-D`** F4 store-path facts | `NOT VERIFIED`, structurally blocked by the PF-13/PF-12 deadlock | **`DESIGNATED; NOT VERIFIED`** — structural blocker removed by DISP-01; host capture outstanding | **blocker removed** |
| **`P-1`** provisioning | `UNSPENT`, not authorized | **`UNSPENT`**, not authorized | none |
| F4 | designated, effective | designated, effective, unchanged | none |
| `S3` / `QE` / `DQ-4` / Gate 4 / Gate 5 | `NOT REACHED` / `0/11` / `8/10` / `AUTHORIZED — NOT STARTED` / `NOT INITIATED` | identical | none |

## 8. Verification register

| ID | Check | Result |
|---|---|---|
| `V971` | Live remote re-read: IRR `main@fd5dd32…`, IPD `main@888eb375…`; both act blobs and the cited packet/source blobs resolved at those commits | **PASS** |
| `V972` | F4 literal recorded verbatim: 39 bytes, 3 × `U+005C`, hex `433a5c696970732d…73716c697465`, byte-identical to the effective act `-02` span | **PASS** — unchanged, not normalized |
| `V973` | PF-13 / PF-12 / `mkdirSync` conflict reproduced from primary sources, not from a prior summary | **PASS** — deadlock confirmed |
| `V974` | PA-level successor act step 1 enumerated in full; parent existence absent from its conditions | **PASS** |
| `V975` | Packet provenance confirmed as preparing-capacity checklist, not a PA act (lines 16, 18) | **PASS** |
| `V976` | Ancestor chain computed under `path.win32`; no `.git` at any level; nearest existing ancestor `C:\` | **PASS** |
| `V977` | Capture instrument is non-creating on the store path and never invokes `--mode=execute` | **PASS** — static inspection |
| `V978` | Reuse determination is consistent with §16.140.4 `P-1-C` and does not overturn it | **PASS** |
| `V979` | No PA value, pin, fence, gate or F1–F6 item altered; `P-1` unspent; `0` IPD writes; `0` store-path artifacts | **PASS** |
| `V980` | Documentation integrity: unique record ID, cited line numbers resolve, JSON evidence parses, `git diff --check` clean | **PASS** |

## 9. Publication protocol (coordinates not self-embedded)

This record becomes effective on the established chain: green exact-head CI → regular 2-parent merge to IRR
`main` → green post-merge `main` CI → independent remote Git-Blobs-API read-back of this record, the tracker
update and the evidence bundle, on both identity and completeness. The companion receipt is populated in a
separate update after the merge and does not self-embed its own carrying coordinates.

## 10. Authority boundary and the conditional instrument

**Determination.** The disposition in §4 is within the preparing capacity's competence and requires **no new
PA instrument**, for the reasons at §3: PF-13 is a checklist condition authored by that capacity; it is stricter
than the PA act; it is unsatisfiable; and correcting it removes no protective content and moves no PA-rendered
value.

**The exact instrument that would be required, if the PA declines this disposition**, is a single narrow act:

> `IIPS-V3-CAP03-P1-PREFLIGHT-PROCEDURE-PA-ADOPTION-2026-10-27-01` — a PA act adopting or rejecting
> `DISP-01`, `DISP-02` and `DISP-03` as the governing `P-1`-session reading of PF-12/PF-13, without changing
> F4 or any F1–F6 value.

Until such an act exists or this record is superseded, `P-1` must not be executed on any other reading:
the strict PF-13 existence clause is unsatisfiable without breaching PF-12, and pre-creating
`C:\iips-data\iips` outside the authorized execution is **unauthorized**.

*End of `IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-RECONCILIATION-2026-10-27-01`. One preflight deadlock resolved
at `P-1` scope; F4 unchanged; `P-1` unspent and unauthorized; no host contact, no store or directory created,
no IPD write, no gate advanced.*
