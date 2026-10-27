# CAP-03 — P-1-C / P-1-D Evidence Handoff and Independent Acceptance Review (`2026-10-27`)

> **STATUS: EVIDENCE-HANDOFF ATTEMPT + INDEPENDENT ACCEPTANCE REVIEW ONLY — NO HOST CONTACT BY ARENA;
> NO RAW OPERATOR BYTES RECEIVED; NO ACCEPTANCE; NO EXECUTION.** This record attempts the evidence
> handoff left as the single narrow next action by §16.151.6, records its outcome, applies the operator's
> supersession decision, resolves the generator-integrity gap by designating the published read-only
> instrument for the next capture, fixes the exact expected values for that capture, and renders the
> criterion-by-criterion acceptance review on what was actually received. It changes **no** PA-rendered
> value, **no** path, **no** pin, **no** fence, **no** ACL, **no** environment flag and **no** gate. It
> does **not** execute `P-1`, does **not** create/delete/modify the F4 parent directories, the store or
> any SQLite sidecar, and does **not** advance `S3`, `QE`, `DQ-4`, Gate 4 or Gate 5. `P-1` remains
> **UNSPENT / UNEXECUTED / NOT AUTHORIZED**.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1C-P1D-EVIDENCE-HANDOFF-ACCEPTANCE-REVIEW-2026-10-27-01` |
| **Record type** | Evidence-handoff attempt + independent acceptance review. **Not** a PA act, not an acceptance, not an execution receipt, not a host observation by Arena |
| **Authority locus** | `ramkivs/iips-review-recovered`, `refs/heads/main` |
| **Reviewed baseline / exact head** | `c3a014fe74fc4bb5d253957f060c8f4c2e4a6662`, tree `dcb6707fef93ebe4fe02393cac75cf7ba4bfae1e` (merge of PR #326, the §16.151.8 receipt, `2026-10-27T06:18:26Z`); `0` open IRR PRs and no push after that merge at verification (`2026-10-27T07:25:54Z`) |
| **IPD read-only head** | `ramkivs/iips-production-market-data` `main@888eb375eebee01640e44ccdcbb138a71e8c4513`, tree `cf3b90482fa7ed1f9780f20a9286164686885d2b`; `0` open IPD PRs; `0` IPD writes |
| **Governing prior record** | `IIPS-V3-CAP03-P1C-P1D-HOST-EVIDENCE-RECONCILIATION-2026-10-27-01` (§16.151, `CV-CORR-131`), whose blockers `B-1`–`B-6` and single narrow next action this pass executes |
| **Governing reconciliation (unchanged)** | `IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-RECONCILIATION-2026-10-27-01` (blob `8e35986afffcb5187a68347fd2f6209b4e259275`) — `DISP-01`–`03`, `OBS-01` stand |
| **Effective PF-15 act** | `IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02`, blob `3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d` |
| **Effective F4 (unchanged)** | `C:\iips-data\iips\user-portfolio.sqlite` — 39 bytes, 3 × `U+005C`, hex `433a5c696970732d646174615c696970735c757365722d706f7274666f6c696f2e73716c697465` |
| **New operator input** | (i) the handoff task instruction; (ii) the operator decision of `2026-10-27` (this session): the `B5D58F7F…` generator **cannot be reproduced**; a fresh attempt-session capture using the published read-only instrument (`85AC7271…`) verbatim will follow. **Zero raw evidence bytes were received with either** |
| **Tracker registration** | §16.152, `CV-CORR-132`, `CHG-2026-10-27-09`, `V1026`–`V1035`; publication receipt `CHG-2026-10-27-10`, `V1036` |
| **Evidence bundle** | `evidence/integration/cap03-p1c-p1d-evidence-handoff-acceptance-review-2026-10-27/` (`00`–`05`, `INDEX.md`, `SHA256SUMS.txt`, `verify_review.py`) |

---

## 1. The evidence handoff, attempted and closed as non-receipt

The §16.151.6 single narrow next action was: *Ramki supplies, from `C:\IIPS-EVIDENCE\cap03-p1-20261027-02`
in the intended P-1 session, the complete raw transcript set, the separate read-only host assessment, the
exact generator bytes and their SHA-256 manifest, the ancestor `.git` result, and the directory listing;
Arena then performs independent byte read-back and a criterion-by-criterion acceptance review.* This pass
executed the receiving half of that action exactly, and no more.

**Channels checked (ten; methods and results in bundle `00`).** IRR `main@c3a014f` working tree
(repository-wide search); all IRR refs (branches API paginated + `git fetch --prune`); IRR issues
(zero non-PR issues); PR comments on #325/#326 (none); all IRR PRs in every state (0 open; the three
closed-unmerged PRs and the two non-arena-head PRs are old and unrelated); releases and tags (one
2026-09-05 release, 0 assets); GitHub code search on both repositories (0 IPD hits; IRR hits are
§16.151's own references); the IPD repository read-only (pushed_at `2026-10-26T14:34:09Z` — **before**
the capture existed; `main@888eb375` unchanged; 0 open PRs); the Arena workspace (only the IRR checkout,
no attachments); and the Arena session input itself (task instruction; structured operator question —
no bytes attached).

**Outcome.** Raw bytes received **0**. CAP-B (the fresh preflight capture `cap03-p1-20261027-02`), CAP-C
(the separate read-only host assessment) and CAP-D (the generator bytes hashing to
`B5D58F7FFF78C34DFFCD189EAC46A27889775F44ABF60F1A8ABD905224093C95`) were **not supplied through any
channel**, no host-generated directory listing or SHA-256 manifest exists on the Arena side, and Arena
continues to claim **no** Windows verification. The Arena-authored prose transcription preserved at
§16.151's bundle `04` remains what it declares itself to be — a transcription of operator prose, **not**
a raw host transcript — and is **not** treated as raw host evidence here.

## 2. The operator decision and its exact supersession scope

Asked how the handoff should proceed, the operator side of this session selected: *the `B5D58F7F…`
generator cannot be reproduced; a fresh attempt-session capture using the published read-only instrument
(`85AC7271…`) verbatim will be supplied later; the existing `20261027-02` capture is superseded rather
than curable by depositing its generator.* Recorded verbatim in bundle `01`.

**Superseded, for acceptance purposes only:** CAP-B and CAP-C as acceptance evidence, and the
`B5D58F7F` deposit limb of blocker B-4. **Preserved unchanged:** the operator-local files themselves
(Arena has no route and deletes/modifies nothing); tracker §16.151 and its bundle byte-identically as
history; the §16.151 reported-state findings (host `DESKTOP-NO0NHTP`; non-elevated
`DESKTOP-NO0NHTP\USER`, SID `S-1-5-21-1872737340-673410177-2240931581-1001`; `C:\iips-data` and
`C:\iips-data\iips` ordinary non-reparse directories, creation `2026-10-26` with **UNKNOWN** provenance;
C: local fixed healthy NTFS; outside the configured OneDrive root; `Authenticated Users`
`Modify, Synchronize`; store + `-wal`/`-shm`/`-journal` absent) — all still **REPORTED, not read back**;
and the §16.148 affirmative wrong-pin finding (`8eec74ae…`/`4eba2902…` vs §16.143's
`001c3c80…`/`399fa44a…`), which is not cured, not repeated and not re-investigated.

**Non-inferences (binding).** No adverse inference is drawn from the digest mismatch, from the
non-reproducibility, or from the supersession; the superseded capture's reported content is neither
impeached nor upgraded — it is simply not independently verifiable and not attempt-session fresh.
No new authority blocker is created: supersession converts B-4's either/or limb into the single
designated path (the published instrument). F4/F5, PF-15 act `-02`, `DISP-01`–`03`, `OBS-01`, the
§16.143 pin, §16.148/§16.149 findings and every gate remain untouched.

## 3. Generator-integrity gap resolved by designation (blocker B-4)

**The published instrument, re-verified at this baseline.**
`evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1`,
blob `eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb`, **10,231 B, LF (0 CRLF)**, SHA-256
`85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b` — reproduced from the local file,
from the git object database, and from the GitHub Git Blobs API (re-verified again at publication
read-back). Its safety contract stands: no store file, no `-wal`/`-shm`/`-journal`, no directory on
`$StorePath` or any ancestor, writes only under `$EvidenceRoot`, never `--mode=execute`. `Stop-Report`
is defined and never called, so a missing `STOP.txt` remains an expected outcome of every run and **not
a verdict**. The instrument is **not** substituted, edited, republished or modified by this record.

**The rule for the next capture.** The next capture **must** be generated by the published instrument
**as published**. The published bytes carry the two checkout paths as explicit designated placeholders
(`$IpdRoot`, `$IrrRoot`) that cannot execute as literal strings, so "verbatim" is made verifiable rather
than asserted: the executing copy may differ from blob `eaea3f7f…` **only** at the designated parameter
assignments (`$IpdRoot`, `$IrrRoot`, and `$RunId`/`$EvidenceRoot` if a dated run identity is chosen) —
**no** logic line, safety-contract line, check, output filename, ordering, or `$StorePath` value (which
must remain the F4 literal) may differ. The deposit must prove it: the executing script's exact bytes;
the self-recorded `99-script-digest.txt` `ScriptSHA256` (the instrument hashes the file as executed, so
the digest is machine-recorded, not transcribed); a byte-level diff against the published blob confined
to the designated lines; and `00-run-parameters.txt` showing every parameter as executed. The
`B5D58F7F` limb is closed as **NOT APPLICABLE** (superseded); no digest is asserted for it.

## 4. Expected values for the next capture, fixed repository-side (IPD read-only)

So the next deposit can be checked without inference, the exact expected values are now fixed (bundle
`03`; IPD inspected read-only via its git object database at `main@888eb375…`; **0 IPD writes**):

| Item | Exact expected value |
|---|---|
| IPD execution basis (PF-07/PF-09) | HEAD `001c3c80618f2ee1d40e9a90912237e1a06e7b58`, tree `399fa44a5f1953c0f61b452420fefb5985426ef1` (parent `8eec74ae…`), porcelain empty, diff clean, `is-shallow-repository=false` |
| Successor §8 step-0 source SHA-256 (PF-16) | `src/persistence/gateAPrimeProvisioning.ts` = `0bd6d134405dbcab27f5639c3e22a856c778daa9fd414d2cb0e26e5b03919aa3` (15,727 B, blob `2cbce83f…`); `src/persistence/provisioning.ts` = `7f04f86a9c23bd0c94def29d829bb0c54033bed941a8c77e35365c30bdbdba30` (4,330 B, blob `dc844189…` = act §2.1 item 1); `src/persistence/binding.ts` = `5e9e3dd8fe705f0235baeab77894636e94cdfbc0df7dd5d42037100ae114a61b` (4,112 B, blob `96d0079d…` = act §2.1 item 2). **The published instrument does not hash these files** — the operator captures them in the same session (e.g. `Get-FileHash`) as a supplemental line |
| IRR consumer pin (PF-08) | the designation in force at the attempt, stated in run parameters; standing §16.122 designation `ba64b2d5927c2f872560710cf1474c25a5cde0d5`/tree `5e4262f1…` recorded as fact (current IRR `main@c3a014f…` is documentation-only movement, not a re-designation) |
| F4 / F5 | F4 `C:\iips-data\iips\user-portfolio.sqlite` (39 B, 3 separators, hex unchanged from act `-02`); F5 `C:\iips-evidence\cap03-gate4` — neither reopened, and the run's evidence root is never F5 |
| PF-11 `.git`-walk line (B-3) | `11-pf11-12-13-store-path.txt` must show `AncestorChain=C:\iips-data\iips -> C:\iips-data -> C:\`, the nearest existing ancestor, and the explicit **`InsideGitWorktree=False`** result of the per-ancestor `.git` walk — walkability alone is not the predicate |
| PF-12 | four verbatim `Test-Path … = False` lines (store, `-wal`, `-shm`, `-journal`), re-observed in the attempt session — point-in-time observations are not reusable |
| PF-14 | chosen root recorded in `00-run-parameters.txt` and evidenced absolute / writable / not-the-store-path / not-synchronized / outside-every-worktree in `14-pf14-evidence-root.txt`; any deviation from the published default `D:\iips-evidence\cap03-p1-20261027-01` documented; F5 unaffected |
| PF-17 | register state **VERIFIED** repository-side as unspent; the attempt session must still capture a dedicated consumption-register observation line |

## 5. Criterion-by-criterion independent acceptance review

Full machine-readable detail in bundle `04` (36 rows). The four-way vocabulary: **VERIFIED**
(independently read back by Arena from bytes Arena holds), **NOT VERIFIED** (reported/previously
captured but not establishable from bytes, or a prior affirmative mismatch stands), **NOT EVIDENCED**
(no evidence exists yet for the attempt session), **NOT APPLICABLE** (not a criterion at this scope, or
a limb closed by the supersession decision).

### 5.1 What is VERIFIED (repository-side, this pass)

F4 identity (39 B / 3 separators / hex identical to act `-02`); F5 unchanged; PF-15 crosscheck (act
`-02` effective; F4/F2/F3 not reopened); the published instrument's identity (blob `eaea3f7f…`,
10,231 B LF, `85AC7271…`, safety contract and `Stop-Report` semantics); the §16.143 pin coordinates
read from the IPD git object database (`001c3c80…`/`399fa44a…`, parent `8eec74ae…`); the successor
§8 step-0 source hashes at that pin (three exact values above); PF-11a (absolute path syntax — path
facts are fully determined repository-side per §16.146's reuse determination); the `DISP-01` rule as
the governing PF-13 reading (existence is not a STOP; S3 wording unchanged); and the P-1 register
state (unspent — no execution receipt, no `--mode=execute`, no store/sidecar/row artifact in any
governed channel).

### 5.2 What is NOT VERIFIED (superseded capture and prior mismatch)

The generator identity of `cap03-p1-20261027-02` (`B5D58F7F…` — bytes never supplied, now declared
not reproducible); CAP-B's and CAP-C's raw bytes, directory listing and host manifest (0 bytes
received; files operator-local); and PF-07's prior affirmative wrong-pin finding (§16.148:
`8eec74ae…` vs the §16.143 `001c3c80…` — stands uncured; nothing in the superseded capture addressed
it; the next capture must evidence the pin).

### 5.3 What is NOT EVIDENCED (the attempt session)

PF-01 (hostname), PF-02 (OS caption), PF-03 (non-elevation + SID), PF-04 (runtime), PF-05 (flag-free
`node:sqlite`), PF-06 (node path), PF-07 (IPD pin observation), PF-08 (IRR pin observation), PF-09
(full history), PF-10 (flag enumeration), PF-11b (explicit per-ancestor `.git` result), PF-11c–e
(volume / non-sync / writability — reported only in the superseded capture, which is point-in-time),
PF-12 (store + sidecar absence, re-observed), PF-13 (the observation limb; the rule limb is VERIFIED),
PF-14 (evidence-root properties), PF-15 (the in-session `15-pf15-designation.txt` capture line; the
act-identity limb is VERIFIED), PF-16 (authority text + step-0 hashes in-session), PF-17 (the
capture limb; the register limb is VERIFIED), and attempt-session freshness itself. **Not one of these
is inferred from anything**: no missing `STOP.txt`, zero error-scan matches, a walkable ancestor
chain, existing capture files, or the operator prose summary is treated as proof of any criterion —
each remains exactly the non-proof §16.151.5 already recorded.

### 5.4 What is NOT APPLICABLE

Directory creation provenance (not a criterion under successor §8 step 1 / PF-11–PF-13 / PF-15 §4;
recorded **UNKNOWN** exactly as §16.151.2 left it; not re-investigated); and the `B5D58F7F` deposit
limb of B-4 (closed by the operator supersession decision; the requirement continues on the
published-instrument limb).

### 5.5 Conclusions

**P-1-C: `NOT ESTABLISHED`.** The attempt-session capture that would establish it does not exist yet;
the superseded capture cannot establish it (generator unidentifiable and non-reproducible, not
attempt-session fresh, zero raw bytes read back).

**P-1-D: `DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT`.**
The structural `DISP-01` reading stands with **no new authority blocker**; every host-observed limb
remains reported-only and must be re-observed in the attempt session.

**P-1: `UNSPENT / UNEXECUTED / NOT AUTHORIZED TO EXECUTE`.**

## 6. Residual evidence needed — exact, and nothing else

Blockers B-1…B-6 are carried onto the next capture as R-1…R-7 (bundle `05`): **R-1** complete raw
attempt-session capture (all fifteen instrument outputs) + full directory listing + host-generated
SHA-256 manifest + Arena independent byte read-back (names, completeness, sizes, digests, manifest
consistency); **R-2** attempt-session freshness (declared session, immediately-before timing, the
instrument's own UTC start/end per command); **R-3** the explicit `InsideGitWorktree=False` /
per-ancestor `.git` line; **R-4** generator identity per §3 (executing bytes + self-recorded
`ScriptSHA256` + confined byte-diff + run parameters); **R-5** IPD `001c3c80…`/`399fa44a…` clean
observation, IRR at the stated designated pin, the three §8 step-0 source hashes in-session, and a
dedicated PF-17 register line; **R-6** PF-14 root properties + documented deviation; **R-7** the
separate read-only host assessment's raw bytes, if one accompanies the new capture. **Not required
and not requested:** re-analysis of §16.148/§16.149/§16.151 findings; any new provenance
investigation; any broad renewed approval; any PA instrument, pin or gate change; any `P-1` execution.

## 7. Boundaries and verification register (`V1026`–`V1035`)

No P-1 execution; no `--mode=execute`; no create/delete/rename/modify of `C:\iips-data`,
`C:\iips-data\iips`, the store or `-wal`/`-shm`/`-journal`; no ACL, environment-flag, pin, existing
manifest, application-code or safety-fence change; no new F4 designation; no acceptance inferred from
capture-file existence, `STOP.txt` absence, zero error-scan matches, walkability or prose; no host
verification claimed by Arena; `0` IPD writes; the §16.151 bundle and all earlier evidence preserved
verbatim.

| ID | Check | Result |
|---|---|---|
| `V1026` | Live baseline verified: IRR `main@c3a014f…`/tree `dcb6707f…` (0 open PRs, no push after the §16.151 receipt merge); IPD read-only `main@888eb375…` (0 open PRs); identifier census (§16.152/`CV-CORR-132`/`CHG-2026-10-27-09`/`V1026`–`V1035` unused at live head); primary blobs resolved | **PASS** — §1, `00` |
| `V1027` | Handoff attempted across ten governed channels with methods and results recorded; zero raw bytes received; directory listing and host manifest absent; prose transcription excluded as evidence | **PASS** — §1, `00` |
| `V1028` | Operator decision recorded (generator not reproducible; new capture with the published instrument); supersession scope exact; operator-local files preserved; no adverse inference, no allegation, no new authority blocker, no reopened matter | **PASS** — §2, `01` |
| `V1029` | Generator-integrity resolution: published instrument identity reproduced three ways (local, git ODB, remote API); verbatim-use rule fixed (designated parameter lines only) with four identity deposits; `B5D58F7F` limb closed NOT APPLICABLE; instrument itself unmodified | **PASS** — §3, `02` |
| `V1030` | Expected values fixed read-only at the §16.143 pin: `001c3c80…`/`399fa44a…`/parent `8eec74ae…`; three §8 step-0 source hashes with blob ids matching successor act §2.1; F4 hex re-read from act `-02`; F5 unchanged; PF-11/PF-12/PF-14/PF-17 capture expectations enumerated | **PASS** — §4, `03` |
| `V1031` | 36 criterion rows assessed individually with the four-way vocabulary; repository-side items VERIFIED; superseded items NOT VERIFIED; attempt-session items NOT EVIDENCED; non-criteria NOT APPLICABLE; no pass inferred from any exit signal or prose | **PASS** — §5, `04` |
| `V1032` | Conclusions: P-1-C `NOT ESTABLISHED`; P-1-D `DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT`; P-1 `UNSPENT/UNEXECUTED/NOT AUTHORIZED`; residual evidence enumerated exactly (R-1…R-7) with an explicit not-required list | **PASS** — §5–6, `04`–`05` |
| `V1033` | Boundaries: no execution/store/sidecar/parent mutation, no code/flag/pin/ACL/manifest/fence change, `0` IPD writes; §16.151 bundle reproduces its own digests unedited | **PASS** — §7, verifier `PRIOR-1` |
| `V1034` | Documentation integrity: single `## §16.152` heading; all identifiers registered (changelog row + section); JSON parses; bundle digests recompute; §16.151 and all prior sections unedited; `git diff --check` clean; change scope confined to tracker, this record and this bundle | **PASS** — verifier |
| `V1035` | Scope discipline: no completed investigation repeated (§16.148/§16.149/§16.151 findings carried, not re-derived); no broad renewed approval requested; no new authority blocker created; single narrow next action preserved for the operator | **PASS** — §6 |

## 8. Publication protocol (coordinates not self-embedded)

Effectiveness follows the established chain: governed PR → **green exact-head CI** → **regular
2-parent merge** to IRR `main` → **green post-merge `main` CI** → **independent remote Git-Blobs-API
byte read-back** of this record, the tracker update and every evidence-bundle file, on identity,
decoded-byte SHA-256 and size. The companion receipt (`CHG-2026-10-27-10`, `V1036`) is populated in a
separate update after the merge and does not self-embed its own carrying coordinates.

*End of `IIPS-V3-CAP03-P1C-P1D-EVIDENCE-HANDOFF-ACCEPTANCE-REVIEW-2026-10-27-01`. Handoff attempted
across ten channels; zero raw bytes received; capture `cap03-p1-20261027-02` and its companion
assessment superseded for acceptance with no adverse inference; the published read-only instrument
designated verbatim for the next capture with exact expected values fixed; P-1-C `NOT ESTABLISHED`;
P-1-D `NOT VERIFIED` for the attempt; residual evidence enumerated exactly; F4 unchanged; `P-1`
**UNSPENT, UNEXECUTED and NOT AUTHORIZED**.*
