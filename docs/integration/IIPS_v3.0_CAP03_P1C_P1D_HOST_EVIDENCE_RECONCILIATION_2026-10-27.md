# CAP-03 — P-1-C / P-1-D Host-Evidence Reconciliation, `DISP-01` Application and Criterion Assessment (`2026-10-27`)

> **STATUS: GOVERNANCE / EVIDENCE RECONCILIATION ONLY — NO HOST CONTACT BY ARENA; NO ACCEPTANCE; NO EXECUTION.**
> This record reconciles newly reported operator-captured host measurements with the authoritative
> F4 parent-preflight reconciliation, applies the existing effective `DISP-01`/PF-13 reading, and assesses
> every PF condition individually. It changes **no** PA-rendered value, **no** path, **no** pin, **no**
> fence, **no** ACL, **no** environment flag and **no** gate. It does **not** execute `P-1`, does **not**
> create/delete/modify the F4 parent directories, the store or any SQLite sidecar, and does **not** advance
> `S3`, `QE`, `DQ-4`, Gate 4 or Gate 5. `P-1` remains **UNSPENT / UNEXECUTED / NOT AUTHORIZED**.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1C-P1D-HOST-EVIDENCE-RECONCILIATION-2026-10-27-01` |
| **Record type** | Dated procedure/evidence reconciliation and criterion assessment. **Not** a PA act, not an acceptance, not an execution receipt, not a host observation by Arena |
| **Authority locus** | `ramkivs/iips-review-recovered`, `refs/heads/main` |
| **Reviewed baseline / exact head** | `f74af6d4f488ebf6d3e3a94f612a0d831b6b765a`, tree `ed424ffbe4e3b3863ff00a47aa25fa0ca4e0c62f`, `2026-10-27T04:48:21Z` (merge of PR #320, §16.149); `0` open IRR PRs at verification (`2026-10-27T05:45:35Z`). **Publication base (re-verified live):** `064e9f1fd038c2e81db90058e30dfa2a637331d3`, tree `7ddcb80863cf07b55cace8e406c767ae09df68ba`, `2026-10-27T06:05:29Z` (after concurrent CAP-04 PRs #321–#324) — see §1 reallocation note |
| **IPD read-only head** | `ramkivs/iips-production-market-data` `main@888eb375eebee01640e44ccdcbb138a71e8c4513`, tree `cf3b90482fa7ed1f9780f20a9286164686885d2b`; `0` open IPD PRs; `0` IPD writes |
| **Governing reconciliation (unchanged)** | `IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-RECONCILIATION-2026-10-27-01` (blob `8e35986afffcb5187a68347fd2f6209b4e259275`) — `DISP-01`–`03`, `OBS-01` stand; F4 designation not reopened or replaced |
| **Effective PF-15 act** | `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02`, blob `3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d` |
| **Effective F4 (unchanged)** | `C:\iips-data\iips\user-portfolio.sqlite` — 39 bytes, 3 × `U+005C`, hex `433a5c696970732d646174615c696970735c757365722d706f7274666f6c696f2e73716c697465`; **not** restated as a new selection |
| **New evidence provenance** | Operator-captured host measurements relayed as prose; raw bytes **not** supplied to Arena; Arena has **no** route to `C:\IIPS-EVIDENCE\cap03-p1-20261027-02` and claims **no** Windows verification |
| **Tracker registration** | §16.151, `CV-CORR-131`, `CHG-2026-10-27-07`, `V1015`–`V1024`; publication receipt `CHG-2026-10-27-08`, `V1025` |
| **Evidence bundle** | `evidence/integration/cap03-p1c-p1d-host-evidence-reconciliation-2026-10-27/` (`00`–`06`, `INDEX.md`, `SHA256SUMS.txt`, `verify_reconciliation.py`) |

---

## 1. Inputs re-read, live branch verification, and non-grants

Before editing, the following were re-read from the live authoritative branch (not from a cached summary).
The IRR default branch is `main`; the working branch `arena/e7cbbda2-iips-review-recovered` starts at the
same commit `f74af6d…` in a shallow checkout. The single authoritative tracker at that head is blob
`83c30df1be265385736f0380a3ec9a9abc798fd7` (`2,609,724` B, SHA-256 `815faa3a9850…8c`), with §§16.140.4,
16.146, 16.147, 16.148, 16.149 present and unedited.

| Source | Identity at the reviewed head | What was re-read |
|---|---|---|
| Authoritative reconciliation bundle | record `…-01`, blob `8e35986afffcb5187a68347fd2f6209b4e259275` (`18,975` B) | §§2–4 (`DISP-01`–`03`, `OBS-01`), §6 reuse determination, §7 status, §9 publication protocol, §10 authority boundary |
| Tracker P-1-C/P-1-D locus | §16.140.4 `P-1-C`/`P-1-D`/`P-1-F`; §§16.146.3–.4, 16.147, 16.148, 16.149.8 | session-freshness rule, reuse determination, `NOT ACCEPTED` assessment, current-state pointer |
| Effective PF-15 act `-02` | blob `3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d` (`11,860` B) | F4/F5 rows, §4 "P-1 path" clause: parent filesystem characteristics and DB/sidecar absence must be checked on the host immediately before execution |
| IPD host-readiness packet | IPD blob `9d9c5970f66b1c901a2b5d28c02e8c9562078cf2` (`20,923` B) | PF-01…PF-17 criteria, especially PF-11 "absolute; outside every Git worktree; not synchronized; local fixed NTFS; operator-writable without elevation", PF-12, PF-13 |
| IPD successor provisioning act | IPD blob `528de6aeddbc8e5f3191be8792f3937d77de4037` (`29,856` B) | §8 step 0 (fresh raw preflight capture) and step 1 (**complete** P-1 store-path condition list); §8.1 evidence; §8.2 stop conditions; §9 single execution |
| CAP-03 S2/P-1/S3/QE matrix | IRR blob `10bf69c972e0cf206a1dd9c70bf98dca5b8049b2` | §§3.1–3.3, §5 PF table, §7 P-1 prerequisite summary |
| CAP-02 host runbook | IRR blob `f6fd8cd78a7e47a60901e715915dd7047dd80903` | §2 preconditions, §4 attempt-session preflight capture |
| Published read-only instrument | blob `eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb`, SHA-256 `85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b` (`10,231` B LF) | nearest-existing-ancestor walk, `.git` ancestor walk, PF-12 `Test-Path` loop, `Stop-Report` definition, evidence-root default, `=` CLI form |
| Earlier 11-file REV2 capture | `evidence/integration-/cap03-p1-reconcile-20261026T201328Z/` (11 digests at bundle `03`) | `00`, `02`–`08`, `98`, `99`; still **NOT ACCEPTED** per §16.148 |

**Live-branch re-verification and identifier reallocation.** After the first live read, a concurrent
CAP-04 documentation pass merged IRR PR **#321** at `2026-10-27T05:56:51Z` as
`52f295a2f0d1475e4040dd673002853c120dfe8a` (tree `aad064a5a920a49f841221d865fd3ea9cbfe9f86`), adding
tracker §16.150 / `CV-CORR-130` / `CHG-2026-10-27-06` / `V1003`–`V1014` (a 51 × 17 capability-matrix
reconstruction). Subsequent CAP-04 PRs #322/#323/#324 advanced `main` to `064e9f1fd038c2e81db90058e30dfa2a637331d3` (tree `7ddcb80863cf07b55cace8e406c767ae09df68ba`,
`2026-10-27T06:05:29Z`) with docs/evidence-only changes and **no tracker change**. The live
authoritative tracker was re-read again at that head before editing; CAP-04's section and
change-log row are preserved **byte-identically** and this pass is based on `064e9f1fd038c2e81db90058e30dfa2a637331d3`. Following the §16.140.0 identifier
collision precedent, this pass is **reallocated** to §16.151 / `CV-CORR-131` /
`CHG-2026-10-27-07` (receipt `CHG-2026-10-27-08`) / `V1015`–`V1024` (receipt `V1025`); no CAP-04
identifier is reused or edited. CAP-04 §16.150.4 finding **C-08** independently recorded the same
F4 parent-exists discrepancy as "not reconciled by inference"; this record supplies the dated provenance
reconciliation (§2) without editing C-08. The IPD head is unchanged at `888eb375…`.

**Successor act §8 step 1, enumerated exactly:** *absolute; outside every Git working tree; local fixed
NTFS; not a synchronized folder; operator-writable without elevation; file must not pre-exist
(`Test-Path` = `False`, recorded verbatim).* **"Parent exists" is not among them** — confirmed again at
this pass. Nothing here reopens F1–F6, `P-1-A`/`P-1-B`, `S2` residuals, the §16.143 pin, or DISP-01's
authority analysis. No new PA instrument is created; the conditional adoption act named at reconciliation
§10 remains the only instrument that would be needed **if** the PA declined `DISP-01`–`03`.

## 2. Reconciling the "terminal parent was absent" premise with host-captured existence

### 2.1 Provenance, stated precisely

- The authoritative reconciliation reasoned under the **stated absence** of `C:\iips-data\iips`:
  "Under the stated absence of the terminal parent, the nearest existing ancestor is `C:\`" (record §4).
  That premise was **earlier operator-reported state**. Arena performed **no** host measurement and
  explicitly claimed none (record header "Host contact: NONE"). The ancestor chain was computed
  **repository-side under `path.win32`**, conditionally on that premise; it was never a Windows observation.
- A **premise delta was already recorded** at tracker §16.148.2 and assessment §2: the published 11-file
  REV2 capture of `2026-10-26T20:13Z` contains `StoreParentExists=True` and lists all three ancestors with
  `IsReparsePoint=False`. §16.148 classified that delta as *recorded, not a blocker*. This pass does **not**
  repeat that investigation and does **not** supersede the disposition.
- The **new state is host-captured**: operator-captured preflight evidence plus a separate read-only host
  assessment report `C:\iips-data` and `C:\iips-data\iips` as ordinary directories (neither a reparse
  point), both reporting creation on `2026-10-26`. The summary was relayed to Arena as prose; **no raw
  bytes** were supplied, so Arena has independently read back **none** of these measurements.

**Result.** The earlier operator-reported premise is superseded **as current reported state** by the new
host-captured observation. It is not rewritten as a measurement Arena made. `DISP-01` is a rule about
*which ancestor to evaluate*; its validity never depended on the parent being absent. The F4 designation,
the effective PF-15 act and the reconciliation's dispositions are **unchanged**.

### 2.2 Creation provenance: unknown, and not silently converted

Who created the two directories, which action created them, and whether any governed procedure was
involved are **NOT ESTABLISHED**. The `2026-10-26` creation dates are measurements, not attributions. This
record draws **no** causal explanation from the creation dates, the earlier REV2 capture, the corrected
ancestor traversal, the instrument digest mismatch, or the fact that `P-1` remains unexecuted. It makes
**no allegation of unauthorized creation**. The provenance is recorded as **UNKNOWN** — neither converted
into a pass nor into an assumed failure, and not used to invent a new authority blocker.

### 2.3 Materiality under the actual governing criteria

The effective criteria test **current filesystem characteristics and store absence**: absolute path,
outside every Git worktree, local fixed NTFS, non-synchronized/non-network, operator-writable without
elevation, and `Test-Path = False` for the store and sidecars (successor §8 step 1; PF-11/PF-12; PF-13 as
read by `DISP-01`; PF-15 act §4). **Directory creation provenance is not one of them.** It would become
material only if there were evidence that the P-1 preflight itself created a store-path ancestor in breach
of PF-12 / `DISP-01`'s "pre-creating remains unauthorized" clause. No such evidence is supplied: the
preflight is reported read-only, and the store, `-wal`, `-shm` and `-journal` are all absent. Therefore
PF-12's safety content is intact and the unknown provenance remains a recorded open fact.

## 3. `DISP-01` applied correctly — no new authority blocker

**Rule applied (unchanged).** At P-1-session scope PF-13 is satisfied when the **nearest existing
ancestor** of `$StorePath` is local fixed NTFS and is not a cloud-synchronized or network location. The
terminal parent **need not pre-exist**, and its *absence* is not a STOP. S3 retains the original PF-13
wording (parent MUST exist after P-1 and is then inspected directly).

**With the new state.** Both ancestors exist, so the nearest existing ancestor is the terminal parent
`C:\iips-data\iips` itself; the chain is still `C:\iips-data\iips → C:\iips-data → C:\`. The reported C:
volume is local, fixed, healthy NTFS; the parent is outside the configured `C:\Users\USER\OneDrive` root;
neither directory is a reparse point; a local fixed volume is not a network location. On the reported
measurements the PF-13 limb is **supported at capture**, and the corrected traversal reaching `C:\`
without errors is consistent with the chain being walkable.

**Existence is not a blocker.** `DISP-01`'s sentence "pre-creating it remains unauthorized and remains a
STOP" governs a **deliberate preflight/workaround action** whose purpose would be to satisfy the old,
unsatisfiable existence clause. It is not a rule that a directory of unknown provenance becomes a STOP
merely because it exists — that would re-create the very deadlock `DISP-01` removed, and the PA-level
successor act step 1 does not require parent absence. With no evidence that the preflight or an operator
workaround created the directories, no unauthorized-creation finding is made and **no new authority
blocker is created** by their existence.

**No new designation.** F4 remains `C:\iips-data\iips\user-portfolio.sqlite`, byte-identical to effective
act `-02`; PF-15 is not reopened; F5 `C:\iips-evidence\cap03-gate4` is unchanged and is **not** replaced by
the run's evidence root.

## 4. Evidence bundle, digests, and the files that must be supplied

### 4.1 What is actually in the governed bundle

`evidence/integration/cap03-p1c-p1d-host-evidence-reconciliation-2026-10-27/` contains
`00-baseline-and-primary-sources.json`, `01-prior-assertion-provenance.json`,
`02-pf-criterion-assessment.json`, `03-evidence-manifest.json`,
`04-operator-host-evidence-verbatim.md` (verbatim transcription of the operator's prose summary, labelled
**not** a raw host transcript), `05-prior-capture-relevant-transcripts.md` (full relevant raw transcripts
of the earlier capture, verbatim), `06-prior-capture-verbatim/` (byte-identical copies of all 11 earlier
files), `INDEX.md`, `SHA256SUMS.txt` and `verify_reconciliation.py`. Every digest is recomputable by
`python3 verify_reconciliation.py` and `shasum -a 256 -c SHA256SUMS.txt`.

**The two original evidence captures.** CAP-B (`cap03-p1-20261027-02` fresh preflight capture) and CAP-C
(the separate read-only host assessment) are the two operator-captured evidence sets to be preserved
verbatim. **Arena cannot access `C:\IIPS-EVIDENCE\cap03-p1-20261027-02`**: raw bytes read `0`, raw bytes
deposited `0`, no Windows verification claimed. Their per-file SHA-256 values are `null` in
`03-evidence-manifest.json` (`null` = **NOT SUPPLIED / NOT VERIFIED**), not fabricated. CAP-A — the earlier
11-file REV2 capture — **is** preserved verbatim (originals unedited; copies byte-identical), with all 11
SHA-256 digests recorded, e.g. `06-pf11-pf12-pf13-store-path.txt`
`51a7c2d4f8aace6e2eeb2b4ee59e88e592d126bee8739797b636c0d3c5211571` (`1,312` B, blob `a63c6fb4…`) and
`99-final-verdict.txt` `b3ff1b20d1484029accd844d6ccec5d664e7f173eb255653362a3dbcd57c7423` (`321` B).

### 4.2 Digests — verified vs merely reported

| Item | SHA-256 | Status |
|---|---|---|
| Published read-only instrument (LF) | `85AC7271C73469B6D5E454A3173FF3AAD944A645A2352BB77EE36BAEE976A30B` | **Arena-verified** from blob `eaea3f7f…` (`10,231` B) |
| New run's instrument | `B5D58F7FFF78C34DFFCD189EAC46A27889775F44ABF60F1A8ABD905224093C95` | **Operator-reported only**; bytes not supplied; **does not equal** the published instrument |
| Earlier REV2 generator | `CB7E674ED8E4DDFDB6F185204E1024743704623AD356632A7AAFE7BE6ED5C8B7` | operator-reported; bytes unpublished (§16.148 T-3) |
| Effective PF-15 act `-02` | `1f5c9e1d9d69cf15a51ec77e41bd70f07ba69516d6a944bf3a79678c6c19a033` | **Arena-verified** (`11,860` B) |
| Tracker at baseline | `815faa3a98500fb56b55cc6592f3097f339b234c4896cffccc1194fd612bfc8c` | **Arena-verified** (`2,609,724` B) |
| CAP-B / CAP-C files | `null` | **NOT SUPPLIED**; must be deposited with a host-generated manifest |

The digest mismatch means the new run used a **different or modified generator** whose scope, safety
properties and `STOP.txt` semantics cannot be independently checked until its bytes are supplied. No
adverse inference is drawn from the mismatch; it is an evidence gap.

### 4.3 Files that must be supplied (explicit, not deposited)

From `C:\IIPS-EVIDENCE\cap03-p1-20261027-02`, verbatim with a full directory listing and a host-generated
SHA-256 manifest: `00-run-parameters.txt`, `01-pf01-hostname.txt`, `02-pf02-os.txt`,
`03-pf03-elevation.txt`, `04-pf04-runtime.txt`, `05-pf05-sqlite.txt`, `06-pf06-node-path.txt`,
`07-pf07-ipd-tree.txt`, `08-pf08-irr-tree.txt`, `09-pf09-shallow.txt`, `10-pf10-flags.txt`,
`11-pf11-12-13-store-path.txt`, `14-pf14-evidence-root.txt`, `15-pf15-designation.txt`,
`99-script-digest.txt` (or every actual filename if the generator used different names); **plus** the raw
ancestor-traversal transcript including the per-ancestor `.git` result, the error-scan command, pattern
list and zero-match output, UTC start/end timestamps per command, the volume/ACL/reparse-point/OneDrive
outputs, `Test-Path = False` lines for store + `-wal`/`-shm`/`-journal`, IPD/IRR HEAD+tree+porcelain+diff
lines, successor §8 step-0 provisioning-source hashes, and the directory listing proving no `STOP.txt`.
Also required: **CAP-C** — the separate read-only host assessment's actual filename(s) and full raw bytes;
and **CAP-D** — the exact generator bytes hashing to `B5D58F7F…` (or a reconciliation showing the published
`85AC7271…` instrument was used). Until supplied, no digest is asserted for any of them.

## 5. Criterion-by-criterion assessment

Two columns are deliberately separated: the **substantive finding** on the operator-reported host
measurements, and the **acceptance/evidence status** for a P-1 attempt. A reported measurement is never
silently upgraded into independently read-back evidence. Full machine-readable detail is in
`02-pf-criterion-assessment.json`.

### 5.1 Why exit signals are not proof

- **No `STOP.txt`.** The published instrument defines `function Stop-Report` but **never calls it**. Its
  absence is expected regardless of whether any criterion went unobserved; it is not a positive verdict.
  With a different generator (`B5D5…`), even this weak semantic is unknown.
- **Zero error-scan matches.** A limited pattern scan over a transcript establishes only that those
  patterns did not match. It does not evaluate PF-01…PF-17, pin equality, `.git` absence, ACLs or store
  absence.
- **Corrected ancestor traversal reached `C:\` without errors.** This evidences a walkable chain, not
  that no ancestor carries a `.git` marker, and not the NTFS/non-sync/non-network predicates, unless the
  raw transcript says so.
- **Capture files exist.** §16.148 and §16.149.8 already hold that capture existence is not acceptance.

### 5.2 P-1-C — session preflight and capture integrity

| PF / gate | Governing requirement | New reported evidence | Finding | Status |
|---|---|---|---|---|
| PF-01 | `hostname` = `desktop-no0nhtp` | `DESKTOP-NO0NHTP` | Matches designated host | **Satisfied at reported capture; not read back** |
| PF-02 | Windows 11 Home Single Language caption | absent from supplied summary | Not evidenced for this run; prior capture is session state and not reusable | **NOT EVIDENCED** |
| PF-03 | non-elevated; account SID recorded | non-elevated; `DESKTOP-NO0NHTP\USER`; SID `S-1-5-21-1872737340-673410177-2240931581-1001`; confirmed by separate assessment | Supported at reported level | **Satisfied at reported capture; not read back** |
| PF-04 | `win32`; Node `>=22.13.0 <23`; arch | absent from supplied summary | Not evidenced for this run | **NOT EVIDENCED** |
| PF-05 | flag-free `node:sqlite`, full output verbatim | absent from supplied summary | Not evidenced for this run | **NOT EVIDENCED** |
| PF-06 | invoked node path; no install/switch | absent from supplied summary | Not evidenced for this run | **NOT EVIDENCED** |
| PF-07 | clean full-history IPD checkout at §16.143 basis `001c3c80…`/`399fa44a…` | no pin observation; corrected traversal is unrelated | Unverified. Prior §16.148 finding was an affirmative **wrong-pin** capture at `8eec74ae…`/`4eba2902…`; nothing supplied cures it | **UNVERIFIED — prior mismatch not cured** |
| PF-08 | IRR clean at designated consumer pin | absent from supplied summary | Not evidenced for this run | **NOT EVIDENCED** |
| PF-09 | `is-shallow-repository=false` (IPD) | absent from supplied summary | Not evidenced for this run | **NOT EVIDENCED** |
| PF-10 | write/binding flags and `GATE_A_PRIME_*` absent | absent from supplied summary | Not evidenced for this run; this pass changed no flag | **NOT EVIDENCED** |
| PF-14 | absolute, writable, outside every worktree, non-synced, ≠ store | run at `C:\IIPS-EVIDENCE\cap03-p1-20261027-02`; differs from published default `D:\iips-evidence\cap03-p1-20261027-01` and from F5 `C:\iips-evidence\cap03-gate4` | No root-property transcript; PF-14 permits operator selection at attempt time, but the deviation and the root's properties must be documented. **F5 unchanged** | **INSUFFICIENT** |
| PF-16 | exact act IDs/pins/store/order/digests; successor §8 step-0 source hashes | no authority-text or source-hash capture | Unverified; PF-07 pin element remains open | **UNVERIFIED** |
| PF-17 | single attempt unspent | no dedicated consumption transcript; tracker and this pass show no receipt, no `--mode=execute`, no store | Register state unspent | **Satisfied as register state; insufficient as capture evidence** |
| Capture envelope | reproducible generator + raw verdicts | `B5D58F7F…` reported ≠ published `85AC7271…`; no `STOP.txt`; zero error matches | Generator bytes unpublished; procedure not independently reproducible (§16.148 T-3 class) | **INSUFFICIENT** |
| Session freshness / read-back | complete raw capture **immediately before the intended attempt** + independent remote byte read-back | fresh run `cap03-p1-20261027-02` exists; no UTC timestamps, no declared attempt session, no raw bytes, no read-back | A fresh capture existing is not the governing requirement | **NOT ESTABLISHED** |

**P-1-C conclusion: `NOT ESTABLISHED`.** The fresh capture is a real advance in host observation, but the
governing requirement is a **complete raw attempt-session capture immediately before the intended P-1
attempt, independently read back**. No attempt session or timing is declared, Arena has zero raw bytes,
the generator is unidentified, and PF-02/PF-04…PF-10/PF-14/PF-16/PF-17 are not evidenced in the supplied
summary.

### 5.3 P-1-D — F4 host properties against the exact effective criteria

| Limb | Exact criterion | New reported evidence | Finding | Status |
|---|---|---|---|---|
| F4 identity | effective PF-15 F4 verbatim, unchanged | act `-02` blob `3fe9a2dd…` re-read; 39 B, 3 separators, hex `433a5c69…` | No drift; not a new selection | **SATISFIED (repository-side)** |
| Local fixed NTFS | local, fixed NTFS volume | C: reported local, fixed, healthy NTFS; both directories ordinary, not reparse points | Supported | **Satisfied at reported capture; not read back** |
| Outside every worktree | no `.git` on `C:\iips-data\iips → C:\iips-data → C:\` | corrected traversal reached `C:\` without errors; no explicit `InsideGitWorktree=False` / per-ancestor `.git` result reported | Walkability ≠ predicate. Narrow transcript line required (§16.148 T-2 class) | **INSUFFICIENT on worktree limb** |
| Non-synchronized / non-network | not a synchronized folder; not network | outside `C:\Users\USER\OneDrive`; C: fixed local (not network); no reparse point | Supported, subject to raw transcript (one configured OneDrive root; other sync clients not evidenced). `Synchronize` in the ACL right is a Windows access right, **not** cloud sync | **Satisfied at reported capture; not read back** |
| Writable without elevation | operator-writable, non-elevated | `Authenticated Users` → `Modify, Synchronize`; identity is a member and non-elevated; separate assessment confirms ACL/identity | Strong non-mutating support; no direct effective-access probe / full SDDL supplied | **Satisfied at reported capture; not read back** |
| Store + sidecars absent (PF-12) | `Test-Path = False` for store, `-wal`, `-shm`, `-journal` verbatim; preflight creates nothing on store path | all four absent, confirmed by separate read-only assessment | Satisfied at capture; session-bound, must be re-observed immediately before the attempt. No evidence preflight created anything; PF-12 safety content intact | **Satisfied at reported capture; not read back** |
| PF-13 (`DISP-01`) | nearest existing ancestor local fixed NTFS, non-synced/non-network; parent need not pre-exist | nearest existing ancestor is now `C:\iips-data\iips`; C: local fixed NTFS; outside OneDrive; chain walkable | Satisfied at reported capture under `DISP-01`; **existence is not a STOP**; S3 wording unchanged | **Satisfied at reported capture; not read back** |
| PF-15 crosscheck | effective designation read verbatim | act `-02` effective and unchanged | F4/F2/F3 not reopened | **SATISFIED (repository-side)** |
| Directory provenance | **not a criterion** | creation dates `2026-10-26`; creator/action unknown | **RECORDED AS UNKNOWN**; immaterial to the exact criteria; no new blocker | **UNKNOWN (neither pass nor failure)** |

**P-1-D conclusion: `DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE
ATTEMPT`.** The structural PF-13/PF-12 deadlock remains removed by `DISP-01`; parent existence and unknown
provenance create **no new authority blocker**. What remains is evidential, not a new failure: independent
byte read-back of the raw transcripts, attempt-session re-observation, the explicit ancestor-`.git` result,
and the full non-sync/ACL/volume transcript.

## 6. Status, remaining blockers, and the single narrow next action

| Item | State after this record |
|---|---|
| `P-1-A` / `P-1-B` / `P-1-E` | `SATISFIED` (candidate-scoped §16.144) / `SATISFIED` candidate-scoped `001c3c80…`/`399fa44a…` (§16.143) / `SATISFIED EFFECTIVE` — all unchanged |
| **`P-1-C`** | **`NOT ESTABLISHED`** — fresh capture reported; no raw bytes, no independent read-back, no generator bytes, no attempt-session timing |
| **`P-1-D`** | **`DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT`** — no new blocker |
| **`P-1`** | **`UNSPENT / UNEXECUTED / NOT AUTHORIZED TO EXECUTE`** — single-use attempt intact; `0` store/sidecar/row artifacts; no `--mode=execute` |
| F4 / PF-15 / F5 | unchanged; effective act `-02` not reopened; no new designation |
| `S3` / `QE` / `DQ-4` / Gate 4 / Gate 5 | `NOT REACHED` / `0/11` / `8/10` / `AUTHORIZED — NOT STARTED` / `NOT INITIATED` — unchanged |
| `WRITE_NOT_AUTHORIZED`, twelve `503` fences, `durable:false` | preserved; no code, fence, pin, ACL, flag or existing manifest modified |

**Genuine remaining prerequisites (precise, not broad):**

- **B-1** — raw host evidence bytes and independent remote byte read-back unavailable. *Action:* deposit
  CAP-B + CAP-C verbatim with per-file SHA-256 manifest and directory listing.
- **B-2** — attempt-session freshness / "immediately before the intended P-1 attempt" not established.
  *Action:* capture in the declared attempt session with UTC start/end timestamps; no reinvestigation.
- **B-3** — PF-11 every-worktree limb: no explicit ancestor `.git` result. *Action:* supply the raw
  ancestor-walk line for the three ancestors.
- **B-4** — capture generator bytes unavailable (`B5D58F7F…` ≠ `85AC7271…`). *Action:* deposit the exact
  script bytes (or use the published instrument verbatim) with its run parameters, traversal and error-scan
  transcripts.
- **B-5** — PF-07 / PF-16 execution-basis evidence at the §16.143 pin missing for this run. *Action:*
  include IPD HEAD/tree/porcelain/diff and successor §8 step-0 source hashes at
  `001c3c80618f2ee1d40e9a90912237e1a06e7b58` / `399fa44a5f1953c0f61b452420fefb5985426ef1`.
- **B-6** — PF-14 evidence-root properties and its deviation from the published default / F5 undocumented.
  *Action:* record the chosen root in run parameters and evidence its absolute/writable/non-synced/
  outside-worktree/NTFS properties; F5 unchanged.

**Single narrow next action.** Ramki (designated non-elevated operator) supplies, from
`C:\IIPS-EVIDENCE\cap03-p1-20261027-02` in the intended P-1 session, the complete raw transcript set, the
separate read-only host assessment, the exact generator bytes and their SHA-256 manifest, the ancestor
`.git` result, and the directory listing; Arena then performs independent byte read-back and a
criterion-by-criterion acceptance review. **No broad new approval is requested and no already-completed
investigation is repeated.** No `P-1` execution is authorized by this record.

## 7. Boundaries and verification register (`V1015`–`V1024`)

No P-1 execution; no `--mode=execute`; no create/delete/rename/modify of `C:\iips-data`,
`C:\iips-data\iips`, the store or `-wal`/`-shm`/`-journal`; no ACL, environment-flag, pin, existing
manifest, application-code or safety-fence change; no new F4 designation; no acceptance inferred from
capture-file existence, `STOP.txt` absence or zero error-scan matches; no host verification claimed by
Arena; `0` IPD writes; earlier captures preserved verbatim.

| ID | Check | Result |
|---|---|---|
| `V1015` | Live authoritative branch verified at `f74af6d…` / tree `ed424ffb…` and **re-verified** after concurrent PR #321 at `52f295a…` / tree `aad064a…`; IPD `main@888eb375…`; CAP-04 §16.150 preserved byte-identically; ID block reallocated; primary blobs resolved | **PASS** — §1, `00` |
| `V1016` | Governing sources re-read: reconciliation `-01`, tracker §§16.140.4/16.146/16.148/16.149, PF-15 act `-02`, host packet, successor act, matrix, runbook, instrument | **PASS** — §1 |
| `V1017` | Prior absence assertion provenance recorded as earlier operator-reported state; §16.148.2 premise delta preserved; new state host-captured, Arena claims no host contact | **PASS** — §2.1, `01` |
| `V1018` | Directory creation provenance recorded as UNKNOWN; no allegation of unauthorized creation; no causal explanation; no conversion into pass/failure; materiality analysed | **PASS** — §§2.2–2.3 |
| `V1019` | `DISP-01` applied at P-1 scope to nearest existing ancestor `C:\iips-data\iips`; existence not a STOP; no new authority blocker; S3 wording unchanged; F4/F5 not reopened | **PASS** — §3 |
| `V1020` | Criterion-by-criterion PF assessment; `STOP.txt` absence, zero error-scan matches, walkability and capture existence explicitly not treated as proof | **PASS** — §5, `02` |
| `V1021` | Evidence manifest: CAP-A preserved verbatim (`11/11` digests), CAP-B/C/D bytes explicitly missing with `null` digests; required files enumerated; operator-reported vs Arena-verified digests separated | **PASS** — §4, `03` |
| `V1022` | P-1-C `NOT ESTABLISHED`; P-1-D `DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT`; P-1 `UNSPENT`/unauthorized; downstream unchanged | **PASS** — §6, `02` |
| `V1023` | Boundaries: no code/flag/pin/ACL/manifest/fence change, no store/sidecar/parent mutation, no P-1, `0` IPD writes; `git diff --check` clean | **PASS** — §7 |
| `V1024` | Documentation integrity: identifier census after reallocation (no collision with CAP-04), unique record ID / §16.151 / `CV-CORR-131` / `CHG-2026-10-27-07`, JSON parses, bundle digests recompute, single `## §16.151` heading, prior sections unedited, `git diff --check` clean | **PASS** |

## 8. Publication protocol (coordinates not self-embedded)

Effectiveness follows the established chain: governed PR → **green exact-head CI** → **regular 2-parent
merge** to IRR `main` → **green post-merge `main` CI** → **independent remote Git-Blobs-API byte
read-back** of this record, the tracker update and every evidence-bundle file, on identity, decoded-byte
SHA-256 and size. The companion receipt (`CHG-2026-10-27-08`, `V1025`) is populated in a separate update
after the merge and does not self-embed its own carrying coordinates.

*End of `IIPS-V3-CAP03-P1C-P1D-HOST-EVIDENCE-RECONCILIATION-2026-10-27-01`. New host-captured measurements
reconciled with an earlier operator-reported premise; `DISP-01` applied without a new authority blocker;
unknown directory provenance preserved as unknown; P-1-C `NOT ESTABLISHED`; P-1-D supported at reported
capture but `NOT VERIFIED` for the attempt; both operator evidence captures explicitly awaited verbatim;
F4 unchanged; `P-1` **UNSPENT, UNEXECUTED and NOT AUTHORIZED**.*
