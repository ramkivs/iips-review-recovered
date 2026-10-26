# CAP-03 — S2 Published-Evidence Verification Addendum (Continuation) (`2026-10-26`)

> ## STATUS: **ORIGINAL FILES FOUND AND DIGEST-VERIFIED — `47/47` TRANSFERRED FILES PRESENT, `46/47` DIGESTS REPRODUCED, `9/9` REQUIRED FILES VERIFIED, ONE MISMATCH; THE REPORTED `47`-ENTRY `PASS` OUTPUT IS ABSENT; **FORMAL S2 EVIDENCE ACCEPTANCE CANNOT BE RENDERED** AND ITS RECORD IS THEREFORE NOT PUBLISHED. NO RERUN, NO REBUILD, NO MANIFEST REGENERATION, NO PR/MERGE, NO `main` CHANGE, NO GATE MOVEMENT.**
>
> This addendum continues `IIPS-V3-CAP03-S2-PUBLISHED-EVIDENCE-READBACK-2026-10-26-01` (§16.141) by
> re-inspecting the already-published evidence instead of asking for another transfer. It answers four
> questions from the repository itself: are the **original** files there (not just checksum-list
> entries), do their **contents** reproduce the manifest, is the **manifest-verification output** there,
> and do the governing criteria now permit **formal S2 acceptance**. The first is answered yes, the
> second yes for 46 of 47, the third no, and the fourth no — for a reason that is independent of file
> availability (§5).
>
> `IIPS-V3-CAP03-S2-EVIDENCE-MANIFEST-VERIFICATION-RECEIPT-2026-10-26-01`, §16.141 and §§16.132–16.140
> are left **byte-unchanged**. No captured transcript is edited.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-S2-EVIDENCE-PRESENCE-AND-DIGEST-VERIFICATION-2026-10-26-01` (census: `0` prior occurrences in IRR and IPD at publication) |
| Tracker registration | Master tracker §16.142; `CV-CORR-122`; `CHG-2026-10-26-24`; verification rows `V927`–`V936` |
| Record type | Verification addendum + acceptance assessment — repository-side evidence verification; **not** an execution record, qualification, acceptance, admission, or authority act |
| Governing locus | IRR `ramkivs/iips-review-recovered`; IPD inspected read-only (`0` IPD writes) |
| Verified target | branch `cap03-s2-evidence-publication` @ **`54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0`** (re-confirmed live, unchanged since §16.141), directory `evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/` |
| Method | Git object read of the published commit; per-file presence check against the actual tree; SHA-256 recomputation of each committed file with disclosed line-terminator restoration; content scan for the verification output. No network execution, no host access, no rebuild |
| This addendum's evidence | `evidence/integration/cap03-s2-published-evidence-readback-2026-10-26/` (`audit_published_evidence.py` → `03`/`05`, `assess_s2_acceptance.py` → `04`, plus the §16.141 artifacts `00`–`02`) |
| Prior addendum | `IIPS-V3-CAP03-S2-PUBLISHED-EVIDENCE-READBACK-2026-10-26-01` (§16.141) — unchanged; this record extends it |

---

## 1. Live state re-confirmed before any verification (`V927`)

| Fact | Verified value |
|---|---|
| Branch tip | `refs/heads/cap03-s2-evidence-publication` = **`54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0`** — unchanged since §16.141 |
| IRR `main` | `1059f96fc75dd6c748091ad4549fe2b8f4522790` — the published commit's only parent; `main` has not moved |
| Review / CI | **`0`** PRs from the branch, **`0`** open PRs, **`0`** check runs, **`0`** workflow runs |
| GitHub Actions artifacts | **`0`** in IRR and **`0`** in IPD — no artifact-channel copy exists |

No transfer was requested: the verification below reads the repository content that is already published.

## 2. Files found — actual names and contents (`V928`)

The directory holds **57** files at the published commit. The manifest of record is the single sorted
`SHA256SUMS.txt` carrying **53** entries: the **6** files `§16.138` authored inside IRR plus **47**
entries describing the transferred Windows evidence. **No standalone 47-entry manifest file exists**;
its content is reconstructible exactly from those 47 lines.

**All 47 transferred originals are present and are read as content, not inferred from the list:**
`47/47` present, `0` absent. The nine required S2 step files are all present (`9/9`). The reported
locked file `windows-session-transcript.txt` is genuinely absent from the tree, consistent with the
recorded exclusion. Four repository-authored files are present but not in the manifest
(`NON_AUTHORITATIVE_TRANSFER.md`, `SHA256SUMS.txt`, `s2-04-sha256-manifest-generation.txt`,
`s2-evidence-manifest-verification.txt`).

### 2.1 Verified that the manifest-verification output is the gap, not the evidence

Targeted content scan of the published directory and of the IRR default branch for a `47`-entry
verification artifact:

| Probe | Result |
|---|---|
| Any blob in the published directory containing `Manifest entries: 47` or `Result: PASS` | **none** |
| IRR tree paths matching a manifest/verification output beyond the `§16.138` bundle | **none** |
| Code search for `"Manifest entries: 47"` in IRR | **0** results (code search indexes the default branch only — a disclosed limitation, so the branch scan above is the controlling check) |
| Artifacts API, both repositories | **0** |

The only verification artifact in existence is the mis-invoked `1148`-entry run already diagnosed at
§16.141.3. **The output that produced the reported `PASS` has never been transferred.** This is the
specific access limitation, and it is not the same as "all the evidence is missing".

## 3. Independent digest recomputation (`V929`–`V931`)

Every committed file was hashed and compared with the manifest. Recorded digests are of the host's
**CRLF** bytes while the transfer committed **LF**, so reproduction applies line-terminator
restoration as an explicit, disclosed transformation — never as an assumption, and never by rewriting
a stored file.

| Result | Count |
|---|---|
| Transferred files present | **47/47** |
| Transferred digests reproduced | **46/47** |
| Required S2 step files reproduced | **9/9** |
| Digests **not** reproduced | **1** — `s2-checkout-verification.txt` (`1,427` B, blob `918764b836ef4d188326caabec4a44b1ad48f86c`; recorded `3FD31FE6…`, not reproduced by any of the tested transformations) |
| IRR-authored entries reproduced | 6/6 (as committed) |

`MATCH` here means **content equality modulo line termination**; it does **not** assert byte identity
with the files still on `desktop-no0nhtp`. The single mismatch is an auxiliary checkout record, not one
of the nine required files, and it is reported as a mismatch rather than normalised.

### 3.1 Per-file matrix (transferred set)

| # | File | Bytes | What it is | Digest vs manifest |
|---|---|---|---|---|
| 1 | `00-preflight-results-provided-in-chat.txt` | 1,363 | declaration | MATCH |
| 2 | `s2-01-npm-ci.sha256.txt` | 73 | digest sidecar | MATCH |
| 3 | `s2-01-npm-ci.txt` *(required)* | 790 | S2 step | MATCH |
| 4 | `s2-02-tsc-noemit.sha256.txt` | 73 | digest sidecar | MATCH |
| 5 | `s2-02-tsc-noemit.txt` *(required)* | 358 | S2 step | MATCH |
| 6 | `s2-03-build.sha256.txt` | 73 | digest sidecar | MATCH |
| 7 | `s2-03-build.txt` *(required)* | 1,593 | S2 step | MATCH |
| 8 | `s2-03-dist-count.txt` *(required)* | 22 | S2 step | MATCH |
| 9 | `s2-03-dist-sha256-before.txt` *(required)* | 175,316 | S2 step | MATCH |
| 10 | `s2-04-guarded-npm-test.sha256.txt` | 73 | digest sidecar | MATCH |
| 11 | `s2-04-guarded-npm-test.txt` *(required)* | 4,821,572 | S2 step | MATCH |
| 12 | `s2-05-package-consumer-baseline-failure-20261026.txt` | 1,032 | host transcript | MATCH |
| 13 | `s2-05-package-consumer.txt` *(required)* | 2,885 | S2 step | MATCH |
| 14 | `s2-authoritative-correction-20261026T100850Z.txt` | 2,448 | host transcript | MATCH |
| 15 | `s2-authoritative-merge-20261026T101205Z.txt` | 4,420 | host transcript | MATCH |
| 16 | `s2-candidate-publish-20261026T100148Z.txt` | 6,781 | host transcript | MATCH |
| 17 | `s2-candidate-publish-summary-20261026T100148Z.txt` | 550 | host transcript | MATCH |
| 18 | `s2-checkout-verification.txt` | 1,427 | host transcript | **MISMATCH** |
| 19 | `s2-dist-sha256-after.txt` *(required)* | 123,165 | S2 step | MATCH |
| 20 | `s2-failure-diagnostic.sha256.txt` | 274 | digest sidecar | MATCH |
| 21 | `s2-failure-diagnostic.txt` | 2,884 | host transcript | MATCH |
| 22 | `s2-fix-01-npm-ci.txt` | 454 | host transcript | MATCH |
| 23 | `s2-fix-02-typecheck.txt` | 116 | host transcript | MATCH |
| 24 | `s2-fix-03-build.txt` | 1,260 | host transcript | MATCH |
| 25 | `s2-fix-04-focused-package-test.txt` | 8,424 | host transcript | MATCH |
| 26 | `s2-fix-05-guarded-npm-test.txt` | 4,975,914 | host transcript | MATCH |
| 27 | `s2-fix-06-package-consumer.txt` | 851 | host transcript | MATCH |
| 28 | `s2-fix-dist-inventory-20261026T093342Z.txt` | 128,576 | host transcript | MATCH |
| 29 | `s2-fix-package-consumer-diagnostic.sha256.txt` | 252 | digest sidecar | MATCH |
| 30 | `s2-fix-package-consumer-diagnostic.txt` | 2,125 | host transcript | MATCH |
| 31 | `s2-fix-validation-20261026T093342Z.txt` | 3,267 | host transcript | MATCH |
| 32 | `s2-fix-validation-20261026T093342Z.txt.sha256.txt` | 147 | digest sidecar | MATCH |
| 33 | `s2-ipd-pr-body-20261026T100850Z.md` | 1,050 | host transcript | MATCH |
| 34 | `s2-node22-npm-launcher-inspection.txt` | 942 | host transcript | MATCH |
| 35 | `s2-npm-launch-fix-20261026T095613Z.txt` | 2,227 | host transcript | MATCH |
| 36 | `s2-npm-launch-fix-consumer-20261026T095613Z.txt` | 2,885 | host transcript | MATCH |
| 37 | `s2-npm-launch-fix-suite-20261026T095613Z.txt` | 4,975,799 | host transcript | MATCH |
| 38 | `s2-npm-launch-fix-summary-20261026T095613Z.txt` | 3,052 | host transcript | MATCH |
| 39 | `s2-package-consumer-launch-inspection.sha256.txt` | 149 | digest sidecar | MATCH |
| 40 | `s2-package-consumer-launch-inspection.txt` | 28,544 | host transcript | MATCH |
| 41 | `s2-post-run-pin.txt` *(required)* | 446 | S2 step | MATCH |
| 42 | `s2-tracker-reconciliation-20261026T100434Z.txt` | 4,357 | host transcript | MATCH |
| 43 | `s2-tracker-recovery-20261026T154814Z.txt` | 1,395 | host transcript | MATCH |
| 44 | `s2-windows-esm-fix-patch-record.sha256.txt` | 143 | digest sidecar | MATCH |
| 45 | `s2-windows-esm-fix-patch-record.txt` | 2,007 | host transcript | MATCH |
| 46 | `s2-windows-esm-investigation.sha256.txt` | 316 | digest sidecar | MATCH |
| 47 | `s2-windows-esm-investigation.txt` | 7,951 | host transcript | MATCH |

## 4. What the verified contents show (`V932`–`V933`)

- **The nine required files were not captured as one coherent passing run.** `s2-04-guarded-npm-test.txt`
  reproduces from committed bytes and reads `[test-guard] FAIL — 924 test(s) executed, runner exit code 1`
  with `# tests 924 / # pass 919 / # fail 1 / # skipped 4` at approved baseline
  `8eec74ae…` / `4eba2902…`, `09:19:59Z`–`09:20:48Z`.
- **The passing bytes are candidate-scoped.** `s2-npm-launch-fix-suite-20261026T095613Z.txt`
  (`# tests 924 / # pass 920 / # fail 0 / # skipped 4`, guard `OK`) and
  `s2-05-package-consumer.txt` (`"result": "PASS"`, shasum `cc2aa701…`) sit in the corrected-candidate
  window `09:56–09:58Z` already recorded at §16.132.4/§16.134.3.
- **Steps 1–3 are baseline-pinned and green** (`s2-01`/`s2-02`/`s2-03` at `8eec74ae…`, exit `0`,
  `dist` count `1140`); `s2-post-run-pin.txt` states the **baseline** checkout clean at `12:34:42Z`.
- **Generation bookkeeping does not close:** `s2-04-sha256-manifest-generation.txt` records
  `Files included: 48` against the 47-entry transferred manifest. Recorded, not rationalised.
- **The reported manifest `PASS` therefore remains user-reported**, and the verified bundle now shows
  *why* it cannot be promoted on this evidence: the passing step set and the failing step-4 transcript
  belong to different commits/platform windows.

## 5. Can formal S2 evidence acceptance now be rendered? (`V934`)

**No.** The criteria were transcribed from their governing records and evaluated against the facts
above (`04-s2-acceptance-assessment.json`).

| ID | Criterion (governing source) | Status |
|---|---|---|
| `A1` | Deposit through the governed workflow — IRR PR, green exact-head CI, regular merge, green post-merge CI, read-back (runbook §5.1; matrix §2.3) | **NOT MET** — unmerged, `0` PR, `0` CI |
| `A2` | Independent read-back of the original bytes (receipt §16.138.4; §16.140.4 `P-1-A`) | **PARTIAL** — `46/47` digests reproduced; `1` mismatch; host-byte identity not established |
| `A3` | The `47`-entry verification output that reported `PASS` is available (receipt §5) | **NOT MET** — absent (§2.1) |
| `A4` | S2 passes as a coherent single-pin five-command sequence (runbook §3; matrix §7) | **NOT MET** — step 4 failed at the approved baseline (§4) |
| `A5` | Evidence is accepted into the record (runbook §5.2) | **NOT MET** — no deposit, no determination |
| `A6` | DQ-4 criterion 7 — host sequence S2 → P-1 → S3 (freeze manifest §7) | **NOT MET** |
| `A7` | DQ-4 criterion 8 — native-Windows canonical worktree evidence (freeze manifest §7) | **NOT MET** |
| `A8` | Execution-baseline pin disposition (Gate 4 §6/Q5; §16.140.4 `P-1-B`) | **NOT SATISFIED** |
| `A9` | Formal acceptance determination rendered by the PA (§16.138.4; §16.140.4) | **NOT RENDERED** |
| `A10` | PF-15 designation effective (S3/QE prerequisite, **not** an S2 criterion) | **SATISFIED** — act `…-02` EFFECTIVE |

**Decisive blocker — `A8`, not evidence availability.** The approved baseline's own step-4 transcript
shows the guarded suite failing. No amount of additional transfer, hashing, or read-back changes that
fact: a passing S2 at `8eec74ae…` did not occur, and the corrected candidate `001c3c80…`/`399fa44a…` is
expressly **not** promoted by any governing act. Whether the candidate-scoped passing evidence may
constitute the S2 record is a **Program Authority** determination, so this record stops at that
boundary.

**Consequence for publication:** per the execution instruction, the verification addendum is published
(this document) and the **distinct S2 evidence-acceptance record is deliberately not created**, because
the acceptance criteria do not pass.

## 6. PF-15 boundary — preserved, nothing normalized (`V935`)

PF-15 is **not** an S2 criterion and is **not** reopened here. Corrected act
`IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02` remains **EFFECTIVE**
(blob `3fe9a2dd…` at IRR `main`, size `11,860` B; receipt §16.137.6). Its **F1–F6 values are PA-owned
literals**: they are neither restated, reformatted, escaped, nor normalised anywhere in this record, and
no value is invented. The stale header row `Current PF-15 status` is already dispositioned as
state-at-rendering by §16.140.3 and is left unedited, as is act `…-01` in its historical form.

## 7. Tracker reconciliation performed

The authoritative tracker is `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`.
Changed, minimally and additively: the header S2 evidence-publication row (appended verification
result), the §5 change register (`CHG-2026-10-26-24`), and this new §16.142. §16.141's own text is
preserved; where it said the next step was to provide the transfer, this record supersedes that **as
current state** because the transfer has now been inspected in place. No prior section, receipt, or
evidence file is modified.

## 8. Remaining blockers (actual, not generic)

1. **`A8` / `P-1-B` execution-baseline disposition** — PA act. Decisive; controls everything below.
2. **`A1` deposit** — the raw evidence is unmerged with `0` CI; deposit requires PR → green exact-head
   CI → merge → green post-merge CI → read-back (runbook §5.1). Not created: the deposit set is not
   yet evidence of a passing S2 (`A4`).
3. **`A3` the `47`-entry `PASS` output** — absent from both repositories and from CI artifacts.
4. **`A2` residual** — `s2-checkout-verification.txt` digest mismatch; host-byte identity unprovable
   from LF-committed copies.
5. **`P-1-C`/`P-1-D`** host and F4 preflight evidence — `NOT ESTABLISHED` / `NOT VERIFIED`.
6. **Downstream, untouched:** DQ-4 `8/10` (criteria 7–8), Gate 4 `AUTHORIZED — NOT STARTED`, QE `0/11`,
   S3 `NOT REACHED`, Gate 5 `NOT INITIATED`; `WRITE_NOT_AUTHORIZED`, `503` fences and `durable:false`
   preserved; `P-1-E` (PF-15) SATISFIED and not reopened.

## 9. Verification register (`V927`–`V936`)

| ID | Check | Result |
|---|---|---|
| `V927` | Live branch tip unchanged at `54d5a56…`; parent = `main@1059f96…`; `0` PRs, `0` CI runs, `0` artifacts both repos | **PASS** — `00` |
| `V928` | `57` files at the commit; manifest = `53` entries = `6` IRR-authored + **`47` transferred**; no standalone 47-entry manifest file | **PASS** — `03` |
| `V929` | All **47/47** transferred originals present; `0` absent; 4 present-but-unlisted; locked transcript absent | **PASS** — `03`/`05` |
| `V930` | Digests: **46/47** reproduced; **`9/9`** required reproduced; **`1`** mismatch (`s2-checkout-verification.txt`) | **PASS (mismatch recorded)** — `03`/`05` |
| `V931` | No blob in the directory or on IRR `main` records `Manifest entries: 47` or `Result: PASS`; artifacts API `0`/`0` | **PASS** — §2.1 |
| `V932` | Step-4 transcript reads guard `FAIL` `924/919/1/4` exit `1` at `8eec74ae…`; passing suite `924/920/0/4` is candidate-scoped; post-run pin = baseline | **PASS (finding recorded)** — `02` |
| `V933` | Generation records `48` files vs `47`-entry manifest — recorded, not rationalised | **PASS** — `02` |
| `V934` | Acceptance assessment: `A1`,`A3`,`A4`,`A5`,`A6`,`A7` `NOT MET`; `A8` `NOT SATISFIED`; `A9` `NOT RENDERED`; `A2` `PARTIAL`; `A10` `SATISFIED` → acceptance **NOT RENDERED**, acceptance record **not created** | **PASS** — `04` |
| `V935` | PF-15 boundary: act `…-02` EFFECTIVE; no literal restated or normalized; no value invented; act `…-01` and header row preserved | **PASS** |
| `V936` | Boundaries + integrity: no code/test/pin/fence/manifest change, no rerun, no PR/merge/CI dispatch, `main` unmodified, `0` IPD writes, prior records and transcripts unedited; `verify_continuation_record.py` PASS; single `§16.142` heading; identifier census `0` prior occurrences | **PASS** |

---

*End of `IIPS-V3-CAP03-S2-EVIDENCE-PRESENCE-AND-DIGEST-VERIFICATION-2026-10-26-01` — the published branch contains all `47` transferred originals, `46/47` digests reproduce (all nine required step files among them), `s2-checkout-verification.txt` does not, and the `47`-entry `PASS` output is genuinely absent; because the baseline step-4 transcript shows guard FAIL and the corrected candidate is not promoted, formal S2 evidence acceptance is NOT RENDERED and no acceptance record was published; the decisive next action is a PA execution-baseline disposition (`A8`/`P-1-B`); no rerun, no PR, no merge, no gate movement, `0` IPD writes; PF-15 literals untouched.*
