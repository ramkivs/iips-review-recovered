# CAP-03 — P-1 Read-Only Preflight Capture Acceptance Assessment: complete 11-file set reviewed; preflight **NOT ACCEPTED** (`2026-10-27`)

> ## STATUS: **EVIDENCE ASSESSMENT ONLY — PREFLIGHT NOT ACCEPTED; NO EXECUTION; NO AUTHORIZATION.**
>
> This record assesses the complete published capture `cap03-p1-reconcile-20261026T201328Z` (11 files)
> against the governing PF criteria. It renders **no** preflight acceptance, authorizes **no** P-1
> execution, invokes **no** provisioning, creates **no** store, and moves **no** gate. The capture's
> verdict is preserved verbatim: **“PREFLIGHT CAPTURED — NOT AUTHORIZATION TO EXECUTE P-1.”**

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-P1-PREFLIGHT-CAPTURE-ACCEPTANCE-ASSESSMENT-2026-10-27-01` (census: `0` prior occurrences in IRR at publication) |
| Tracker registration | Master tracker §16.148; `CV-CORR-128`; `CHG-2026-10-27-03`; verification rows `V982`–`V991` (publication receipt `V992` follows) |
| Record type | Acceptance assessment of published host evidence — preparation/read-back capacity only. **Not** a PA act, not an acceptance, not an execution receipt |
| Assessed evidence | `evidence/integration-/cap03-p1-reconcile-20261026T201328Z/` — 11 files (`00`–`08`, `98`, `99`), run `2026-10-26T20:13:28.3346687Z`–`20:13:34.0506351Z`, at IRR `main` commit `ff29734b877f018b207385e0e375a8d0bbf5b3e0`, tree `e96fa8ac60f97e8111a9c46d456473464fb047a3`, parent `ad09fdeae39d8582582d199b26032b812794e8ee` |
| Prior finding reassessed | Tracker §16.147 (four-file read-back: full P-1 preflight `BLOCKED`; PF-11–PF-13 partial observation acknowledged) |
| Governing criteria | Master tracker §§16.140.4, 16.143, 16.144, 16.146 (`DISP-01`–`03`, `OBS-01`), 16.147; CAP-03 S2/P-1/S3/QE matrix `IIPS-V3-CAP03-S2-P1-S3-QE-READINESS-MATRIX-2026-10-26-01` §§5, 7; CAP-02 host runbook `IIPS-V3-CAP02-HOST-EXECUTION-RUNBOOK-AND-EVIDENCE-STRUCTURE-2026-10-26-01` §§2, 4; published instrument `02-p1c-p1d-readonly-preflight.ps1`; effective PF-15 act `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02` (blob `3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d`) |
| Machine record | `evidence/integration/cap03-p1-preflight-capture-assessment-2026-10-27/` (`00-capture-inventory.json`, `01-acceptance-mapping.json`, `verify_assessment.py`, `INDEX.md`, `SHA256SUMS.txt`) |
| Host contact / writes | **NONE.** No recapture, no republishing, no re-verification of the completed evidence publication; `0` IPD writes; `0` store-path actions |

## 1. Inputs and method

Seven files supplemented the four read back at §16.147 (`00`, `06`, `98`, `99`): `01-pf01-hostname.txt`,
`02-pf02-pf03-os-identity.txt`, `03-pf04-pf05-pf06-runtime.txt`, `04-pf07-pf08-pf09-repositories.txt`,
`05-pf10-enabling-flags.txt`, `07-pf14-evidence-root.txt`, `08-pf15-designation-crosscheck.txt`. Each file's
published bytes were inventoried and digested (`00-capture-inventory.json`), and every PF item was mapped to
its governing criterion (`01-acceptance-mapping.json`). `CaptureStatus=PASS` in a transcript records only that
the REV2 capture step ran; it is **not** treated as acceptance of the associated criterion (per §16.147 and
the assessment charter). Existing IDs and terminology (`PF-01…PF-17`, `P-1-A…P-1-F`, `DISP-01…03`,
`SATISFIED` / `NOT SATISFIED` / evidence `INSUFFICIENT` / `NOT APPLICABLE`) are preserved; no criterion was
invented and no scope widened.

Two standing scope facts shape every row below. First, the generating script is
`CAP03_P1_ReadOnly_Preflight_Reconciliation_REV2.ps1` (`C:\Users\USER\Downloads\…`, SHA-256
`CB7E674ED8E4DDFDB6F185204E1024743704623AD356632A7AAFE7BE6ED5C8B7`, file `98`); its bytes are **not**
published, so — exactly as §16.147 held — its implementation cannot be independently checked against the
hash, and the outputs are assessed on their face against the PF criteria and the published §16.146
instrument's design. Second, P-1-C/P-1-D evidence is **session-bound**: successor step 0 and §§16.140.4,
16.146.4, 16.147 require capture immediately before the intended attempt, and the §16.146.3 reuse
determination classifies PF-01…PF-06/PF-10 as session state and PF-07…PF-09 as live worktree state. Rows
marked “satisfied at capture” therefore establish host state **only** at `2026-10-26T20:13Z`; they cannot
by themselves establish a future attempt session.

## 2. Requirement-by-requirement mapping

| Requirement / gate | Authoritative acceptance criterion | Evidence reviewed | Finding | Status | Remaining action / dependency |
|---|---|---|---|---|---|
| `PF-01` host identity | `hostname` exactly `desktop-no0nhtp` (matrix §5) | `01` (`DESKTOP-NO0NHTP`) | Exact designated host (Windows hostname case-insensitive) | **SATISFIED at capture** | Attempt-session re-observation (session state) |
| `PF-02` OS edition | Windows 11 Home Single Language caption | `02` (`Microsoft Windows 11 Home Single Language`, `10.0.26300`, build `26300`) | Caption exact; version/build recorded | **SATISFIED at capture** | Attempt-session re-observation |
| `PF-03` non-elevation | `IsInRole(Administrator)` = False; account SID recorded | `02` (`IsAdministrator=False`; `DESKTOP-NO0NHTP\USER`; SID `S-1-5-21-1872737340-673410177-2240931581-1001`) | Non-elevated; account + SID recorded verbatim | **SATISFIED at capture** | Attempt-session re-observation |
| `PF-04` platform/runtime | `win32`; Node `>=22.13.0 <23`; arch recorded | `03` (`win32`, `v22.22.0`, `x64`, execPath) | All elements match | **SATISFIED at capture** | Attempt-session re-observation |
| `PF-05` flag-free SQLite | `node:sqlite` loads without experimental flag; full output incl. warning verbatim | `03` probe (`{"v":"ok"}`; `ExperimentalWarning` recorded verbatim) | Loads flag-free; warning preserved, not normalized | **SATISFIED at capture** | Attempt-session re-observation |
| `PF-06` no runtime switch/install | Invoked node path inspected; no install/switch evidence | `00` + `03` (single consistent operator-local `node-v22.22.0-win-x64\node.exe` path) | One inspected path used throughout; no switch evidence in set | **SATISFIED at capture** | Attempt-session re-observation |
| `PF-07` IPD clean tree | Clean checkout at the designated execution pin — current designation is the §16.143 candidate `001c3c80618f2ee1d40e9a90912237e1a06e7b58` / `399fa44a5f1953c0f61b452420fefb5985426ef1` (“the coordinate at which P-1 of record would be executed”); porcelain empty; diffs clean. Any PF mismatch = STOP | `04` IPD block: `HEAD=8eec74ae…`, `TREE=4eba2902…`, porcelain empty, `Unstaged/StagedDiffExit=0`; script's `ExpectedHEAD/TREE` = baseline | Cleanliness passes **at the wrong pin**: captured checkout is the approved baseline `8eec74ae…`/`4eba2902…` (parent of the designated basis), whose S2 run **FAILED** and which §16.143 superseded as execution basis. The two pins are not equivalent and are not treated so | **NOT SATISFIED — STOP condition (blocker T-1)** | Attempt-session capture with the IPD worktree clean at `001c3c80…`/`399fa44a…` |
| `PF-08` IRR clean tree | Designated IRR consumer pin, same cleanliness checks (runbook pins: `ba64b2d5…` / `5e4262f1…`) | `04` IRR block | `HEAD`/`TREE` equal the designated consumer pin exactly; porcelain empty; diffs `0` | **SATISFIED at capture** | Attempt-session re-observation |
| `PF-09` full history | `is-shallow-repository` = `false` | `04` (`IsShallow=false`, IPD) | Matches governing instrument scope (IPD) | **SATISFIED at capture** | Attempt-session re-observation |
| `PF-10` no enabling flags | `IIPS_G3_IPC_BINDING_PROVISIONED`, `IIPS_ENABLE_WRITES`, `IIPS_G3_ENABLE_WRITES`, `GATE_E_OVERRIDE` absent (successor act additionally: no `GATE_A_PRIME_*`) | `05` (all 4 + 5 `GATE_A_PRIME_*` = `<ABSENT>`) | Superset of the criterion; nothing enabled | **SATISFIED at capture** | Attempt-session re-observation; no write flag may be enabled by this assessment |
| `PF-11` store-path syntax/location | Absolute; outside **every** worktree; local fixed NTFS; non-synced; writable without elevation | `00`, `06`, `07` | Absolute verbatim F4 ✔; local fixed **NTFS** now shown (`07`: drive `C`, `NTFS`, `Fixed`, `Healthy` — same volume as store) ✔; non-synced (`UnderConfiguredOneDriveRoot=False`) ✔; writable without elevation (`EffectiveWriteProbe=PASS`, cleanup `PASS`) ✔; **outside-every-worktree shown only against enumerated IPD/IRR + S2-fix worktrees** (`OutsideEnumeratedIPDIRRWorktrees=True`, scope self-disclaimed in `06`/`99`) — no ancestor-`.git` walk result, which is the governing operational test (instrument; `isInsideGitWorktree`) | **INSUFFICIENT on the worktree limb (blocker T-2)**; other limbs satisfied at capture | Attempt-session ancestor-`.git` absence capture for `C:\iips-data\iips → C:\iips-data → C:\` (published instrument does this); no host-wide census needed |
| `PF-12` store absence | `Test-Path` False for store/`-wal`/`-shm` (`-journal` incl. by instrument); nothing created on store path by preflight (`DISP-02`) | `06` (all four `False`; `ProbeFileRemains=False`) | Absence verbatim; probe created no store/sidecar/ancestor and was removed | **SATISFIED at capture** | Attempt-session re-observation “immediately before” execution |
| `PF-13` parent location (P-1 scope) | Per `DISP-01`: nearest existing ancestor local fixed NTFS, not synced/network; terminal parent need not pre-exist; S3 wording unchanged | `06` + `07` (`StoreParentExists=True`; ancestors listed, `IsReparsePoint=False` ×3) | Nearest existing ancestor is the terminal parent itself, on the NTFS Fixed volume, non-synced. **Premise delta recorded:** §16.146 reasoned under stated *absence* of the parent; the parent in fact exists. Existence is not a STOP under `DISP-01` (absence is not required), and §16.147 credited parent existence as observation. Who/when created the parent is **not evidenced**; no evidence the preflight created it; store/sidecars remain absent, so `PF-12` safety content is intact | **SATISFIED at capture** (provenance unevidenced; noted, not a blocker) | Attempt-session re-observation; pre-creation by preflight remains prohibited |
| `PF-14` raw evidence location | Absolute, writable, outside every worktree, distinct from store | `07` (`IsPathRooted=True`, `Exists=True`, `EvidenceRootIsNotStore=True`, NTFS Fixed volume; transcripts deposited there) | Run-scoped root `C:\iips-evidence\cap03-p1-reconcile-…` at governing-instrument parity; writability demonstrated by the deposited transcripts; distinct from F4 and from S2/F5 roots | **SATISFIED at capture** | Operator selection at attempt time |
| `PF-15` designation (crosscheck; `P-1-E`) | Rendered designation read verbatim; blocks S3/QE, not P-1 | `08` (act `…-02`, blob `3fe9a2dd…`, F4/F2 verbatim, `F3=N/A for Option A`) | Blob verified equal to the effective act blob in this repository; F4 (`C:\iips-data\iips\user-portfolio.sqlite`) and F2 (`\\.\pipe\iips-user-portfolio-v1`) verbatim. `P-1-E` remains SATISFIED (§16.137.6) | **SATISFIED** | None for P-1; host pipe/DACL facts remain S3 evidence |
| `PF-16` authority text | Exact act IDs, pins, store, order, adoption digests confirmed; no placeholder | `00`, `04`, `08` + authoritative records | Store/act elements present; **pin element fails** (see `PF-07`); no dedicated PF-16 transcript in set. Register-side values: successor act `IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01`, §16.143 basis, IRR `ba64b2d5…`, H-12 R5 adopted (`0/56` affected) | **NOT SATISFIED** (consequential to T-1) | Clears with T-1 + attempt-session confirmation |
| `PF-17` no prior consumption (`P-1-F`) | Register/receipt confirms single execution unspent | `00`/`99` (script-scope `P1Executed=False`) + tracker register (§§16.146.4, 16.147: UNSPENT; no execution/V-A2 receipt in either locus) | Register fact confirmed from authoritative records; no dedicated consumption-check transcript in the capture set | **SATISFIED as register state; INSUFFICIENT as capture-set evidence** | Re-confirm register at attempt time (runbook §2 authority check) |
| Capture integrity envelope | Run parameters, script identity, verdict preserved; independently checkable procedure | `00`, `98`, `99` | Parameters consistent (`ProvisioningInvoked=False`, `P1Executed=False`, `Failures=0`, `StopConditions=0` — script-relative only); verdict line exact. REV2 script bytes unpublished → procedure not independently reproducible (**T-3**) | **INSUFFICIENT** (outputs reviewable; generator not) | Deposit REV2 bytes matching `CB7E674E…`, or supersede by attempt-session capture with the published instrument (preferred; also clears T-1/T-2/T-4) |
| Session freshness (`P-1-C`/`P-1-D` establishment) | Fresh raw capture on `desktop-no0nhtp` immediately before the attempt; session/live state not reusable (§§16.140.4, 16.146.3–.4, 16.147) | Run timestamps `2026-10-26T20:13Z` | Point-in-time observation only; no attempt session exists | **NOT ESTABLISHED for any future attempt (T-4)** | Fresh attempt-session capture (separate requirement, not a rerun — §16.147) |
| Successor §8 step-0 source hashes | `Get-FileHash` of provisioning sources in the execution-session preflight file (runbook §4) | Not in set; not in published P-1-C/P-1-D instrument scope | Execution-session item, not a criterion of this read-only reconciliation | **NOT APPLICABLE** to this assessment | Capture in the attempt session per runbook §4 |
| `P-1-A` / `P-1-B` / identity gates | Formal S2 acceptance; PA pin disposition; S1 identity determination | §§16.144, 16.143, 16.140 | All **SATISFIED** (candidate-scoped where recorded); untouched by this assessment — and it is precisely `P-1-B`'s satisfied designation that `PF-07` fails against | **SATISFIED** (upstream, unchanged) | None |

## 3. The two determinations the charter reserved

**Worktree-exclusion limitation — a real, narrow evidence blocker, not a mere disclaimer and not a demand
for a host-wide census.** The criterion is “outside *every* Git working tree” (successor step 1; PF-11;
PF-15 F4). Operationally — in the shipped `isInsideGitWorktree` walk and in the published instrument — that
predicate is decided by the store's ancestor chain: an unrelated repository can falsify it only if one of
`C:\iips-data\iips`, `C:\iips-data`, `C:\` carries its `.git` marker. File `06` inventories the IPD/IRR
worktrees and records ancestor attributes/reparse status, but contains no ancestor-`.git` result; §16.147
therefore correctly held exclusion “not shown”, and the seven new files do not cure that specific limb.
Under the verbatim-evidence, stop-on-ambiguity standard (matrix §5), PF-11 cannot be accepted on this limb.
Minimum closure is one attempt-session ancestor walk (the published instrument already implements it) —
**not** an enumeration of every repository on the host.

**IPD pin reconciliation — the captured pin is the wrong pin, determinately.** File `04` evidences a clean,
full-history checkout at the approved baseline `8eec74ae…`/`4eba2902…` and the REV2 script *expected* that
pin (`ExpectedHEAD`/`ExpectedTREE`). The applicable P-1 execution pin, however, is the §16.143 PA-designated
candidate-scoped basis `001c3c80…`/`399fa44a…` — “the coordinate at which P-1 of record would be executed”
(disposition §5; `P-1-B` SATISFIED on exactly that basis, §16.144 `A8`); §16.146.3 and the published
instrument both direct PF-07 at “the effective basis at §16.143”, and §16.147 expressly required the
checkout check “at the §16.143 execution pin”. The baseline is the candidate's parent and the provisioning
blobs are byte-identical across both (recorded technical fact, “without authority effect”) — but baseline S2
**FAILED** and exact-pin discipline prohibits silent substitution. Executing from the captured checkout
would execute from a coordinate that is no longer the designated basis. PF-07 is therefore **not satisfied**;
this is an affirmative mismatch (a STOP), not missing paperwork, and it propagates to PF-16.

## 4. Decision, readiness, and next action

1. **Overall preflight acceptance decision: NOT ACCEPTED.** One criterion affirmatively fails (PF-07, with
   PF-16 consequential) and three evidential conditions remain insufficient (PF-11 worktree limb, REV2
   script reproducibility, attempt-session freshness). `P-1-C` remains **NOT ESTABLISHED**; `P-1-D` is
   **DESIGNATED; NOT VERIFIED** for the attempt (host facts observed at capture except the every-worktree
   limb). The outcome is determinate, so `INDETERMINATE` is not the correct classification. No acceptance
   is rendered by this capacity; consistent with §16.147, recording this non-acceptance requires no new PA
   decision, and none is made.
2. **Previously reported gaps (§16.147): closed** — PF-01…PF-06 transcripts; PF-10 flags (superset);
   PF-14 transcript; fixed/local **NTFS identity** for the store/evidence volume; clean full-history
   checkout *mechanics*; PF-15 crosscheck added. **Transformed** — “clean full-history checkout at the
   §16.143 pin” is now evidenced as an affirmative pin mismatch, not an absence. **Still open** —
   every-worktree exclusion; PF-16 (transcript absent + pin element fails); PF-17 as capture-set evidence
   (register state itself confirmed UNSPENT); REV2 script bytes; attempt-time freshness. §16.146's “no
   P-1-session transcript exists” is closed as to existence only.
3. **Dependencies and blockers.** *Technical/evidence:* T-1 wrong-pin checkout (PF-07/PF-16); T-2
   ancestor-`.git` evidence (PF-11); T-3 generator bytes (integrity envelope); T-4 session freshness.
   *Governance/authorization:* none newly required to record this outcome; `DISP-01`–`03` stand as
   preparing-capacity dispositions (the conditional PA adoption instrument remains required **only if**
   the PA declines them, §16.146 §10); execution itself would still require P-1-C/P-1-D satisfied and
   evidenced in order, then the single successor-act §§8–9 attempt. Downstream unchanged: DQ-4 `8/10`
   (criteria 7–8 unmet), Gate 4 `AUTHORIZED — NOT STARTED`, S3 `NOT REACHED`, QE `0/11`, Gate 5
   `NOT INITIATED`; `WRITE_NOT_AUTHORIZED`, twelve `503` fences, `durable:false` preserved.
4. **P-1 execution readiness.** Preflight acceptance conditions are **not satisfied**; separately, P-1
   execution remains **not authorized** (UNSPENT, single-use). Neither `CaptureStatus=PASS`, nor
   `Failures=0`, nor successful publication of the 11 files alters either statement.
5. **Single next action.** Ramki, as designated non-elevated operator, in the intended P-1 session
   immediately before the attempt — with the IPD worktree clean at the §16.143 basis
   `001c3c80…`/`399fa44a…` — runs the **published** read-only instrument
   `evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1`
   on `desktop-no0nhtp` and supplies the transcripts for acceptance review; any STOP aborts the attempt.
   This one action clears T-1/T-2/T-3/T-4 together and repeats no completed investigation (fresh
   attempt-time observation is a separate requirement, §16.147). **Do not execute P-1 on the REV2 set.**
6. **Durable outcome.** This assessment is recorded in the existing master tracker as §16.148
   (`CV-CORR-128`, `CHG-2026-10-27-03`) with the machine bundle above — findings recorded, no acceptance
   rendered, no competing tracker or decision record created. Effectiveness follows the established chain
   (PR → green exact-head CI → regular merge → green post-merge CI → independent remote read-back);
   carrying coordinates are recorded by the companion receipt (`V992`) and are not self-embedded.

## 5. Boundaries

No P-1 execution; no provisioning invocation; no store/sidecar/parent created or deleted; no write-related
flag enabled; no pin, F1–F6 value, fence, manifest or gate changed; no host capture repeated; the completed
evidence publication not republished or re-verified; `0` IPD writes; no native-Windows verification claimed
by Arena.

*End of `IIPS-V3-CAP03-P1-PREFLIGHT-CAPTURE-ACCEPTANCE-ASSESSMENT-2026-10-27-01` — complete 11-file
preflight capture assessed; PF-01…PF-06, PF-08…PF-10, PF-12…PF-15 satisfied at capture; PF-07 failed at the
superseded baseline pin; PF-11 every-worktree limb, script reproducibility and session freshness
insufficient; preflight NOT ACCEPTED; P-1 UNSPENT and not authorized. Verdict preserved: “PREFLIGHT
CAPTURED — NOT AUTHORIZATION TO EXECUTE P-1.”*
