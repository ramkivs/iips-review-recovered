# CAP-03 — S2 Published-Evidence Read-Back Addendum (`2026-10-26`)

> ## STATUS: **READ-BACK PERFORMED ON THE TRANSFERRED COPIES — EXECUTION PROVENANCE AND ONE MANIFEST ENTRY NOT ESTABLISHED; FORMAL S2 ACCEPTANCE NOT RENDERED; EVIDENCE NOT YET IN THE GOVERNED RECORD; NO RERUN, NO BUILD, NO TEST, NO MANIFEST REGENERATION, NO GATE MOVEMENT.**
>
> This addendum performs the dated read-back that tracker §16.138.4 (§5) and §16.140.5 designated as
> the next authorized step: the operator supplied the raw Windows evidence through the branch
> `cap03-s2-evidence-publication`, and Arena independently recomputed SHA-256 over the committed
> bytes and compared each digest with the recorded manifest. It is the addendum contemplated by
> `IIPS-V3-CAP03-S2-EVIDENCE-MANIFEST-VERIFICATION-RECEIPT-2026-10-26-01` §5; that receipt is left
> **byte-unchanged**, as are §§16.132–16.140.
>
> It does **not** claim that Arena observed `desktop-no0nhtp`, executed S2, or recomputed the
> Windows host's bytes in the host's own form. It does **not** accept S2 evidence, mark S2 accepted,
> or advance P-1/S3/QE/Gate 5.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-S2-PUBLISHED-EVIDENCE-READBACK-2026-10-26-01` (census: `0` prior occurrences in IRR and IPD at publication) |
| Tracker registration | Master tracker §16.141; `CV-CORR-121`; `CHG-2026-10-26-23`; verification rows `V917`–`V926` |
| Record type | Dated evidence read-back addendum — repository-side verification of a published evidence transfer; **not** an execution record, not a qualification, not an acceptance, not an admission, not an authority act |
| Governing locus | IRR `ramkivs/iips-review-recovered`; IPD inspected read-only (`0` IPD writes this pass) |
| Read-back date | `2026-10-26` (UTC) |
| Published branch / commit | `refs/heads/cap03-s2-evidence-publication` @ **`54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0`** (single parent `1059f96fc75dd6c748091ad4549fe2b8f4522790` = IRR `main`; `51` files added or changed) |
| Evidence directory | `evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/` (`57` entries at the published commit) |
| Method | Git object read of the published commit; every digest in the directory's `SHA256SUMS.txt` recomputed; line-terminator restoration applied as an **explicit, disclosed** transformation (see §2.2). No network execution, no host access, no rebuild |
| This addendum's evidence | `evidence/integration/cap03-s2-published-evidence-readback-2026-10-26/` (`collect_publication_state.py` → `00`, `verify_manifest_reproduction.py` → `01`, `collect_content_findings.py` → `02`, `verify_readback_record.py`, `INDEX.md`, `SHA256SUMS.txt`) |
| Upstream records (unchanged) | Receipt `IIPS-V3-CAP03-S2-EVIDENCE-MANIFEST-VERIFICATION-RECEIPT-2026-10-26-01`; tracker §§16.132–16.140; S2 operator runbook; all prior evidence bundles |

---

## 1. Remote publication state — verified

Independently verified live on `2026-10-26` (`00-remote-publication-state.json`; `git ls-remote` + GitHub REST reads):

| # | Fact | Verified value |
|---|---|---|
| 1 | Branch exists and points at the published commit | `refs/heads/cap03-s2-evidence-publication` = **`54d5a56fc8ffda72fa98020aaeb7b8a71bd6c5e0`**; branch unprotected |
| 2 | Authority baseline | Parent `1059f96fc75dd6c748091ad4549fe2b8f4522790` = live IRR `main` (merge of PR #309, `2026-10-26T14:48:53Z`); commit authored `2026-10-26T15:59:12Z`, `51` changed files |
| 3 | Evidence directory intact | `57` entries present at the published commit — identical set to the locally fetched tree |
| 4 | Review/publication chain | **`0`** pull requests ever opened from the branch; **`0`** open PRs repository-wide; **`0`** check runs on the commit; **`0`** workflow runs for the branch |
| 5 | Consequence | No CI has run on this commit and no review has occurred. The chain required by runbook §5.1 (green exact-head CI → regular merge → green post-merge `main` CI → independent read-back) has **not** been entered |

The transfer is durably preserved on the remote and is retrievable — that is all fact 1–3 establish.
Remote preservation is not deposit into the governed record (§7).

## 2. Manifest reproduction — verified, with one exception

### 2.1 Result

The directory's `SHA256SUMS.txt` carries **53** entries: the 6 pre-existing IRR-authored entries of
`§16.138` plus **47** entries describing the transferred Windows evidence (`01-manifest-reproduction-readback.json`).

| Classification | Count | Meaning |
|---|---|---|
| `REPRODUCED` — `crlf_restored` | **43** | Committed LF copy converted back to CRLF reproduces the recorded digest exactly |
| `REPRODUCED` — `as_committed` | **7** | Recorded digest reproduces the committed bytes unchanged (the 6 pre-existing IRR files + `s2-tracker-reconciliation-20261026T100434Z.txt`, which was already LF on the host) |
| `REPRODUCED` — `lf_body_with_single_trailing_crlf` | **2** | `00-preflight-results-provided-in-chat.txt`, `s2-ipd-pr-body-20261026T100850Z.md` — content identical; the committed copy additionally carries a trailing blank line |
| **`NOT_REPRODUCED`** | **1** | `s2-checkout-verification.txt` (`1,427` B, blob `918764b836ef4d188326caabec4a44b1ad48f86c`) — **no** tested transformation reproduces `3FD31FE6D3186C1DC76C1407656BFC72A1987118F8912687702662F8C7B84B2F` |

- **All nine required S2 filenames reproduce** (`required_files.all_present = true`, `all_reproduced = true`).
- Manifests of record: `4` files are present in the directory but **not** listed (`NON_AUTHORITATIVE_TRANSFER.md`, `SHA256SUMS.txt`, `s2-04-sha256-manifest-generation.txt`, `s2-evidence-manifest-verification.txt`); `0` listed files are absent; `windows-session-transcript.txt` is absent from the tree, consistent with the reported locked-file exclusion.

### 2.2 What the reproduction does and does not establish

The recorded digests are of the **Windows host's CRLF bytes**; the transfer committed the
Unix-normalized (LF) form. Reproduction therefore required explicit line-terminator restoration.
The equality established is **content equality modulo line termination**, not byte identity with the
originals on `desktop-no0nhtp`. This is a genuine strengthening of the earlier position (the two
hashes previously carried only as user-reported values now reproduce from repository content), but it
does not substitute for byte-level read-back of the host originals, and it is not asserted to.

The single non-reproducing entry is **not** among the nine required files; it is an auxiliary
checkout record, and its divergence is recorded rather than explained away. Its original host bytes
are required to resolve it.

### 2.3 Cross-check that does not depend on the manifest

`s2-failure-diagnostic.txt` independently cites the guarded-test log digest
`7DD2A1EFC3A3EA9D3EDA2A619E29BD2FDB240D6820C05F3FDC9BB21729B16EDA`; that value is also the
manifest entry for `s2-04-guarded-npm-test.txt` and reproduces under §2.1. Two artifacts of separate
origin agree on the bytes of a 4,821,572-byte transcript.

## 3. The preserved manifest-verification artifact reports `FAIL` — cause identified

The bundle's own manifest-generation and manifest-verification outputs record:

| Artifact | Recorded content |
|---|---|
| `s2-04-sha256-manifest-generation.txt` (`2026-10-26T12:47:40.490Z`) | `Files included: 48`; `Result: GENERATED; independent verification: FAIL` |
| `s2-evidence-manifest-verification.txt` (`2026-10-26T12:47:40.371Z`) | `Manifest entries: 1148`; `Required evidence files: 9`; `Result: FAIL` |

**Cause (verified):** `1148` is exactly the line count of `s2-dist-sha256-after.txt` — 7 metadata
lines + the `SHA256 INVENTORY:` header + the `1140` `dist/**` entries. The verifier consumed the
post-run **distribution inventory** as if it were the evidence manifest, which is also why every
finding is of the form `Missing file: frontend/src/app/App.d.ts` and why eight
`Malformed manifest entry:` lines quote that file's own header. It is a **tooling mis-invocation**,
not a Windows qualification failure: it neither corroborates nor refutes the reported `47`-entry `PASS`.

**What remains unestablished:** no artifact in the bundle records a `47`-entry manifest verification,
and no artifact records that verification's `PASS`. The reported `PASS` therefore remains
user-reported; the retained transcript is not contradicting evidence, but it is also not the
supporting evidence the record asks for. The generation record says `48` files where the transferred
manifest describes `47`; that one-entry difference is **recorded, not rationalised** — it is not
resolvable from the bundle alone.

## 4. Pin coherence of the nine required files — verified from content

Every row below is read from the committed bytes of a file whose digest reproduces (§2). No row is
inferred from the receipt's narrative.

| Required file | Pin / window stated in the transcript | Recorded outcome |
|---|---|---|
| `s2-01-npm-ci.txt` | `8eec74ae…` / `4eba2902…`; `09:15:34.195Z`–`09:16:19.230Z` | `npm ci exit code: 0` |
| `s2-02-tsc-noemit.txt` | `8eec74ae…` / `4eba2902…`; `09:17:21.212Z`–`09:17:33.374Z` | `tsc exit code: 0` |
| `s2-03-build.txt` | `8eec74ae…`; `09:18:08.884Z`–`09:18:37.569Z` | build completed |
| `s2-03-dist-count.txt` | — | `dist file count: 1140` |
| `s2-03-dist-sha256-before.txt` | `dist/**` inventory, `1140` lines | Q11-before basis, `1,140` entries |
| `s2-04-guarded-npm-test.txt` | `8eec74ae…`; `09:19:59.946Z`–`09:20:48.935Z` | **guard `FAIL`** — `# tests 924 / # pass 919 / # fail 1 / # skipped 4`; `exit code: 1` |
| `s2-05-package-consumer.txt` | no pin line; `09:56:14.269Z`–`09:57:42.994Z` | `"result": "PASS"`, shasum `cc2aa701…`; blob identical to `s2-npm-launch-fix-consumer-20261026T095613Z.txt` |
| `s2-post-run-pin.txt` | `12:34:42.488Z`; `ACTUAL COMMIT: 8eec74ae…`, `ACTUAL TREE: 4eba2902…` | `WORKING TREE CLEAN: True` |
| `s2-dist-sha256-after.txt` | `12:35:02.843Z`; commit `8eec74ae…` | `EXPECTED FILE COUNT: 1140`, `ACTUAL FILE COUNT: 1140` |

**Verified consequence:** the nine required files are **not** one coherent passing five-command run at
a single pin. Step 4 failed at the approved baseline `8eec74ae…`; the passing suite bytes
(`s2-npm-launch-fix-suite-…`, `# tests 924 / # pass 920 / # fail 0 / # skipped 4`, guard `OK`) and the
passing consumer bytes belong to the corrected-candidate window already recorded at §§16.132.4 and
16.134.3 (`001c3c80…`), and the post-run pin row states the **baseline** checkout. The transferred
bundle therefore **corroborates the recorded history** — baseline S2 failed at step 4, corrected
candidate validated as component evidence — and does **not** establish a passing S2 at the approved
baseline.

## 5. Evidence classification

| Class | Items |
|---|---|
| **Independently verified by Arena (repository/remote)** | §1 rows 1–5; §2.1 reproduction for `52` of `53` entries including all nine required files; the absence of the four unlisted files from the manifest; the absence of `windows-session-transcript.txt`; §3 cause of the `FAIL`; the `48` vs `47` generation difference; §4 pin/window/result statements and the resulting pin-coherence finding; the two previously recorded digests `C5DDFFA2…` and `9F7C6407…` reproduced from repository bytes |
| **User-reported (not Arena-observed)** | that the S2 sequence ran on `desktop-no0nhtp` under PF-01…PF-10 as non-elevated Ramki on operator-supplied Node 22; that a final `47`-entry manifest verification returned `PASS`; that all listed files existed and hash-matched on the host; that `windows-session-transcript.txt` was locked during hashing; the chat-transcribed preflight (`00-preflight-results-provided-in-chat.txt` is explicitly a retrospective transcription, not a raw host transcript) |
| **Not independently established** | byte identity between the committed LF copies and the host originals; the original bytes of `s2-checkout-verification.txt`; the `47`-entry `PASS` output; the `48`-vs-`47` reconciliation; host-side execution provenance for every transcript; the host evidence root's final state |

## 6. Effect on the governing acceptance criteria

| Governing record | Requirement | Effect of this read-back |
|---|---|---|
| Runbook `IIPS-V3-CAP03-S2-OPERATOR-RUNBOOK-2026-10-26-01` §5.1 | Deposit the raw evidence "through the governed evidence workflow (IRR PR …)"; publication chain = green exact-head CI → regular merge → green post-merge CI → independent remote blob/byte read-back | **NOT SATISFIED** — the evidence sits on an unmerged branch with `0` CI runs. A **PR and merge are explicitly required** for deposit; this addendum does not create one |
| Receipt §16.138 "Publication completeness rule" | A record is COMPLETE only after publication to IRR `main` by the normal PR process plus independent remote read-back | Applies by analogy to this evidence deposit; **NOT SATISFIED** for the raw evidence (it *was* satisfied for the receipt itself at PR #306, §16.138.7) |
| Tracker §16.140.4 `P-1-A` (formal S2 evidence acceptance) | Read-only raw-byte provision → read-back addendum → formal acceptance determination | Provision **partially** performed; addendum **rendered here**; acceptance determination **NOT RENDERED** — and the §4 finding (passing evidence is candidate-scoped) is a further input the determination must address |
| Tracker §16.140.4 `P-1-B` (execution-baseline pin disposition) | PA act designating the exact execution commit/tree | **Unaffected and still outstanding** — the §4 finding makes it more, not less, necessary; no promotion is made or implied |
| DQ-4 freeze criteria 7–8 | Host sequence and native-Windows canonical evidence | **Unchanged: NOT MET** |
| Gate 4 / S3 / QE / Gate 5 | separate rendered acts | **Unchanged** — `AUTHORIZED — NOT STARTED`, `NOT REACHED`, `0/11`, `NOT INITIATED` |

## 7. Exact next action (single)

The operator supplies the two artifacts that are still missing, through the same governed channel and
without rerunning anything: **(a)** the `47`-entry manifest-verification output that produced the
reported `PASS`, and **(b)** the original host bytes of `s2-checkout-verification.txt`. Arena then
re-runs `verify_manifest_reproduction.py` as a dated continuation of this addendum.

Deliberately **not** done here, and not to be treated as done: no PR, no merge, no CI dispatch, no
`main` modification, no re-execution of any S2 step, no manifest regeneration, no rewrite of any
captured transcript, no reclassification of any non-reproducing digest as a match.

## 8. Verification register

| ID | Check | Result |
|---|---|---|
| `V917` | Published branch + commit exist remotely and point at `54d5a56…`; parent = live `main@1059f96…` — `git ls-remote` + REST | **PASS** — §1, `00` |
| `V918` | Evidence directory intact at the published commit (`57` entries, identical to the fetched tree) | **PASS** — §1, `00`/`01` |
| `V919` | Review/CI state: `0` PRs from the branch, `0` open PRs, `0` check runs, `0` workflow runs | **PASS** — §1 rows 4–5, `00` |
| `V920` | Manifest reproduction: `52/53` entries reproduce under disclosed transformations; `1` (`s2-checkout-verification.txt`) does not | **PASS (finding recorded)** — §2, `01` |
| `V921` | All nine required S2 filenames present and reproduced; `0` listed-but-absent; `4` present-but-unlisted; `windows-session-transcript.txt` absent | **PASS** — §2.1, `01` |
| `V922` | Independent cross-check of the step-04 log digest `7DD2A1EF…` against `s2-failure-diagnostic.txt` | **PASS** — §2.3, `02` |
| `V923` | Cause of the preserved `Result: FAIL` (`1148` = `8` + `1140` dist entries) established; no `47`-entry `PASS` artifact present | **PASS (finding recorded)** — §3, `02` |
| `V924` | Pin/window/result table read from bytes; nine-file pin coherence finding recorded | **PASS** — §4, `02` |
| `V925` | Boundaries: no code/test/pin/fence/manifest change, no S2/test/build/manifest rerun, no PR/merge/CI dispatch, `main` unmodified, `0` IPD writes, no captured transcript edited, receipt + §§16.132–16.140 byte-unchanged | **PASS** — this pass adds only the addendum, tracker §16.141 and the `cap03-s2-published-evidence-readback-2026-10-26/` evidence bundle |
| `V926` | Documentation integrity: `verify_readback_record.py` (recomputed counts, identifier presence, JSON agreement), single `§16.141` heading, identifier census (`§16.141`/`CV-CORR-121`/`CHG-2026-10-26-23`/`V917`–`V926`/record ID: `0` prior occurrences) | **PASS** |

---

*End of `IIPS-V3-CAP03-S2-PUBLISHED-EVIDENCE-READBACK-2026-10-26-01` — the transferred raw evidence is remotely published and `52/53` manifest entries reproduce from committed bytes (all nine required files among them); `s2-checkout-verification.txt` does not reproduce; the only preserved verification artifact is a mis-invoked `FAIL`, so the reported `47`-entry `PASS` stays user-reported; the nine files show step 4 failing at the approved baseline with the passing evidence candidate-scoped; evidence is unmerged with no CI, so deposit under runbook §5.1 is not satisfied; formal S2 acceptance NOT RENDERED; no gate moved; no rerun; `0` IPD writes.*
