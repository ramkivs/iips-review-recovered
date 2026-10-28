# CAP-03 S2 — Post-Publication Evidence Reconciliation (`2026-10-28`)

> **Record ID:** `IIPS-V3-CAP03-S2-POST-PUBLICATION-EVIDENCE-RECONCILIATION-2026-10-28-01`
> **Type:** Documentation-only reconciliation. Not a Program-Authority (PA) decision. Not formal S2 acceptance. Does not move any gate, pin, fence, manifest or P-1 status.
> **Branch:** `arena/b776c15a-iips-review-recovered` (not `main`). Not merged by this pass.
> **Evidence:** `evidence/integration/cap03-s2-post-publication-reconciliation-2026-10-28/` (`verify_reconciliation.py`, `01-…json`, `02-…json`, `03-…json`, `SHA256SUMS.txt`).

**Required status (exact):** P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

---

## 0. Summary

| Question | Result | Basis |
|---|---|---|
| Is the recovered archive correctly published? | **Verified.** Branch `evidence-cap03-s2-original-recovery-20261028` → `e43476eb…`; archive SHA-256 `86C46B79…` matches sidecar, receipt and recomputation; not on `main`. | §2 |
| Do the 47 recovered originals match the 47-entry manifest? | **Verified** for all 47 (recomputed). The manifest hash matches the audit's claim (`2192AD31…`). | §3.1 |
| Is the `1,148`-entry report resolved? | **Resolved as a tooling mis-invocation.** Its input was the 1,148-line `s2-dist-sha256-after.txt`, not a manifest. | §3.2 |
| Is the `48`-entry generation report resolved? | **Not resolved.** No 48-entry list exists in any available artifact. A candidate explanation exists but is not demonstrated. | §3.3 |
| Overall manifest discrepancy | **PARTIALLY RESOLVED.** 47-entry content: resolved. `1,148`: resolved. `48`: unresolved. | §3.4 |
| Original S2 run | **FAILED at step 4** (`924 / 919 pass / 1 fail / 4 skip`, exit `1`). Step 5 was not run in the original sequence; a later baseline step-5 run at `12:35:34Z` also failed (exit `1`). | §4.1 |
| Later fix / candidate checks | **PASSED** at candidate `001c3c80` (consumer `PASS`; guarded `924 / 920 / 0 / 4`, exit `0`). Shown separately; they do not change the original result. | §4.2 |
| Formal acceptance | **Recorded as candidate-scoped (`ACCEPTED — CANDIDATE-SCOPED`, CV-CORR-124), but the PA ruling on acceptance scope (Q-S2-1) is not recorded.** Formal acceptance is therefore **NOT ESTABLISHED** as an unqualified PA decision. | §5 |
| Next action | PA ruling on Q-S2-1 (whether residual R-1 is an absolute prerequisite) and on the D1 disposition. | §7 |

---

## 1. Sources and what was verified

- IRR `origin/main` = `82b3f4a5d31134e40fd3a1a23169a0ca8d638dfc` (PR #352 merge), checked with `ls-remote` in this pass.
- Publication branch `evidence-cap03-s2-original-recovery-20261028` = `e43476eb45a58eab130cc43535f2ba61de9e450f`, checked with `ls-remote`, explicitly fetched, and inspected with `git`.
- The archive was read from the commit object (`git show`). It was not re-published, and the originals inside it were not altered.
- Existing records were read at `origin/main`: S2 acceptance record (`8eee2957`), package (`e1219f89`), unified status reconciliation (`5bcc25a2`), tracker (`24451138`, §§16.138–16.145), IPD PR #104 hash record (IPD `0616ba2d`), and the PA disposition record (`CV-CORR-123`).
- IPD `main` = `0616ba2d8466e0a6837ca06073b656486fc84f54`; candidate `001c3c80` is on `work/cap03-s2-windows-esm-url` and is an ancestor of IPD `main`. Read only.
- Not performed: no test, build, `npm ci`, S2 step, manifest regeneration, host access, or IPD write.

**Labels used below.** *Arena-verified* means recomputed in this pass. *Windows-reported* means a statement inside a host-produced transcript or audit that Arena cannot verify against the host.

---

## 2. Publication verification (item A)

| Check | Result |
|---|---|
| Branch → commit | `e43476eb45a58eab130cc43535f2ba61de9e450f` (Arena-verified, `ls-remote` and fetch) |
| Parent / tree | parent `82b3f4a5…` (= `main` at publication); tree `eb1e661a…`; 3 files added, +19 lines |
| Files | `…/CAP03-S2-original-evidence-recovery-20261028T090844Z.zip` (551,087 B), `….zip.sha256`, `PUBLICATION-RECEIPT.txt` |
| Archive SHA-256 | `86C46B79A02DA13EC9D57B891762098B23E49AF7B4AE66CE7FB551DA9B759223`; equals the expected value, the sidecar and the receipt (Arena-verified) |
| ZIP entries | 51; equals the receipt (Arena-verified) |
| On `main`? | No. The publication paths are absent from `main`. Since `9130dead`, `main` changed only the tracker and the package (GitHub compare API, Arena-verified). The `handoff/` tree on `main` contains only the pre-existing `handoff/evidence/pf11-root-safe/` files. |
| Classification | Non-authoritative, per the receipt and this record. Publication is not acceptance. |

Evidence: `01-publication-verification.json`.

---

## 3. Manifest discrepancy (item B)

### 3.1 The 47-entry manifest (demonstrated)

- `SHA256SUMS.txt` in the archive: 47 lines, CRLF, 4,791 bytes, SHA-256 `2192AD317FD33DAC20E4C9009FFDB51786E974BFACF6E9180A397D1E48FC86E2` (Arena-verified; equals the recovery audit's claim).
- Every listed file is present in the archive, and every file's SHA-256 equals its manifest entry: **47 / 47** (Arena-verified). No duplicate names. No listed file is missing.
- The archive also holds `recovery-audit.txt` (post-generation audit), the manifest itself (self-hash excluded by rule), and the two report candidates (excluded by rule). No other unlisted files.
- The IRR deposit (`evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/SHA256SUMS.txt`) is a separate 53-line manifest (47 Windows + 6 IRR-authored). Its 47 Windows lines are a subset, but its digests are of the committed LF copies, so they differ from the Windows digests for CRLF files (Arena-verified).

### 3.2 The `1,148`-entry report (resolved)

`s2-evidence-manifest-verification.txt` reports `Manifest entries: 1148` and `Result: FAIL`. Demonstrated:

- The verifier input equals `s2-dist-sha256-after.txt`, which has **1,148 lines**: 8 metadata lines and **1,140** `dist/` hash lines (Arena-verified).
- The report's 8 "Malformed manifest entry" findings are exactly those 8 metadata lines. Its 1,140 "Missing file" findings are exactly the 1,140 `dist/` paths in that inventory. None of the nine required S2 file names appears among its findings (Arena-verified).
- Conclusion: a tooling mis-invocation. It cannot verify the 47-entry manifest and cannot refute it. This matches tracker §16.141.3.

### 3.3 The `48`-entry generation report (unresolved)

`s2-04-sha256-manifest-generation.txt` reports `Files included: 48`, `Manifest self-hash excluded: True`, `Result: GENERATED; independent verification: FAIL`, timestamp `12:47:40.49Z`.

Demonstrated facts:

- The generation log names no file list. No 48-entry manifest, list or artifact exists in the archive, in the IRR deposit or on `main`. The only manifest is the 47-entry one.
- Timing: the 1,148 verifier output is stamped `12:47:40.37Z`, the generation log `12:47:40.49Z`. The generation step's own "independent verification: FAIL" is therefore consistent with the same mis-invoked verifier (inference; the generation script is not in the archive).
- **Timestamp evidence.** ZIP local stamps are read as IST (UTC+05:30). This is cross-checked: the two report candidates convert to `12:47:40` UTC, equal to their internal `12:47:40Z` stamps, and the recovery audit converts to `09:09:00` UTC, matching its `09:09:01Z` header. On that basis the **manifest file was last written at `12:51:02` UTC**, about 3 min 22 s after the generation log. Every listed file's ZIP-recorded timestamp is `≤ 12:35:44` UTC (Arena-verified, `02-manifest-reconciliation.json`).

Candidate explanation, **not demonstrated**: tracker §16.138 records that `windows-session-transcript.txt` was excluded from the manifest because it was locked during hashing. If the generation counted that locked file (47 + 1 = 48), the count would match. The transcript is not in the archive, and no record shows the generation count included it. The timestamp evidence shows that the manifest file was last written after the log, but not why.

### 3.4 Assessment

| Element | Status | Reason |
|---|---|---|
| 47-entry manifest and file set | **Resolved (content)** | Arena-verified 47 / 47 |
| `1,148` report | **Resolved** | Input was the dist inventory (demonstrated) |
| `48` generation count | **Unresolved** | No 48-entry artifact; candidate explanation unproven; manifest last written after the log (mtime; unexplained) |
| `s2-04-sha256-manifest-generation(1).txt` | **Not examined** | Named in the request, but not present in the archive, the publication commit, the IRR deposit or `main`. The audit copied only two report candidates. |
| Overall | **PARTIALLY RESOLVED** | — |

**Independently demonstrated:** the 47-entry manifest and its file set; the `1,148` mechanism; the committed-copy relation (§3.5); the mtime ordering.
**Historical or Windows-reported:** the host-side source hashes in the audit (`SOURCE=` columns; Arena cannot read the host); the transcript-lock explanation; the user-reported `PASS, 47 entries`.

### 3.5 Recovered originals versus committed IRR copies

- For all 47 files, the committed IRR copy equals the original after CRLF→LF normalisation (46 files), or is byte-identical (1 file: `s2-tracker-reconciliation-20261026T100434Z.txt`) (Arena-verified).
- `s2-checkout-verification.txt` has **5 bare LF line endings alongside 42 CRLFs**. The committed copy therefore cannot be inverted by any simple transform. This is why it was the only file not reproduced in the earlier readback (`NOT_REPRODUCED`). The original bytes now show it matches the manifest digest `3FD31FE6…` (Arena-verified).
- This pass therefore converts the earlier "transform-dependent" reproductions into a direct check: the originals match their manifest digests, and the committed copies are their CRLF→LF forms.

---

## 4. S2 execution status (item C)

Original and later results are listed separately. Counts are parsed from the transcripts in the archive (Arena-verified, `03-execution-outcomes.json`).

### 4.1 Original run — approved baseline `8eec74ae…`

| Step | Window (UTC) | Result | Source |
|---|---|---|---|
| 01 `npm ci` | 09:15:34–09:16:19 | exit `0` | `s2-01-npm-ci.txt` |
| 02 `tsc --noEmit` | 09:17:21–09:17:33 | exit `0` | `s2-02-tsc-noemit.txt` |
| 03 build + `dist` count | 09:18:08–09:18:37 | exit `0`; `dist` = `1140` | `s2-03-build.txt`, `s2-03-dist-count.txt` |
| 04 guarded `npm test` | 09:19:59–09:20:48 | **exit `1`**; `924` total / `919` pass / `1` fail / `4` skip; guard `FAIL` | `s2-04-guarded-npm-test.txt` |
| 05 `npm run test:package-consumer` | — | **Not run in the original sequence.** The failure diagnostic states "S2 STOPPED at step 4. Step 5 not authorized by this diagnostic." | `s2-failure-diagnostic.txt` |
| 05 (later, baseline) | 12:35:34–12:35:44 | **exit `1`**: `spawnSync npm.cmd EINVAL` during `npm pack` | `s2-05-package-consumer-baseline-failure-20261026.txt` |

- **Failing test (step 04):** `CAP-02 Increment A — T-PKG-4`, subtest 7 ("the built entry point loads and exposes the same public names"). Error: `ERR_UNSUPPORTED_ESM_URL_SCHEME`, because an absolute Windows path was passed to dynamic `import()`. The suite-level result is `not ok 43`.
- **Authority for the 12:35 baseline step-5 run:** not documented in the records reviewed. It is recorded here as a gap, not inferred.

### 4.2 Later fix and candidate checks — shown separately

| Run | Window (UTC) | Base and content | Result |
|---|---|---|---|
| Fix validation `20261026T093342Z`, steps 01–05 | 09:33:43–09:35:04 | `8eec74ae` + the recorded **test-file** patch only (script unchanged) | 01 exit `0`; 02 exit `0`; 03 exit `0`, `dist` `1140`; 04 focused test `29/29` exit `0`; 05 guarded `924 / 920 / 0 / 4`, guard `OK`, exit `0` |
| Fix validation, step 06 | 09:35:04–09:35:15 | same | **exit `1`**: `spawnSync npm.cmd EINVAL`; run stopped |
| Launch-fix `20261026T095613Z`, consumer | 09:56:14–09:57:42 | `8eec74ae` + **test patch + script patch** (the two changed paths of `001c3c80`) | **`"result": "PASS"`**, exit `0`; pack shasum `cc2aa701…`; SHA-256 `9F7C6407…` |
| Launch-fix, guarded suite | 09:57:43–09:58:04 | same | **`924 / 920 / 0 / 4`**, guard `OK`, exit `0`; SHA-256 `C5DDFFA2…` |

- **Candidate commit:** `001c3c80618f2ee1d40e9a90912237e1a06e7b58`, parent `8eec74ae…`, tree `399fa44a…`, created `10:01:48Z`. It changes exactly `scripts/verify-public-package.mjs` and `tests/portfolio_ui_package.test.ts` (Arena-verified: `git diff --name-status`).
- **Content check (performed in this pass, scratch repository):** applying the recorded test and script patches to the `8eec74ae` blobs gives blob ids `ecbc365d…` and `e556afde…`, identical to the `001c3c80` blobs. These also match the `index` lines in the patch records. The launch-fix runs therefore used the candidate's content for these two paths. The run worktree's tree hash is not recorded, so this rests on the recorded patch texts and the commit's blob ids.
- The records do not show that any fix-run worktree contained other changes. "Changed files: two" is recorded in the launch-fix summary.

### 4.3 Conflicting or non-harmonised items (kept separate)

| Item | Detail | Treatment |
|---|---|---|
| Same total, different outcome | `924` in both the original run (`919/1/4`) and the candidate run (`920/0/4`). Different commits and different test patch. | Not harmonised. The original result stays **FAILED**. |
| Acceptance A4 wording | Acceptance says conditions 1–3 and 4–5 are "two contiguous captures on that content". Steps 01–03 ran at `09:33–09:34` on `8eec74ae` + test patch, **before** the script change (the consumer at `09:35` still ran the unpatched script). Steps 01–03 do not invoke the changed script (`npm run build` does not run `verify-public-package.mjs`). | Precision gap. R-3 already records "none at the committed SHA". A governed wording correction is needed; no finding of failure. |
| Step 05 at baseline | Ran at `12:35:34Z` (after the `12:34:42Z` pin transcript); exit `1`. | Recorded as a baseline failure. Authority not documented (§4.1). |
| "Nine required files" | The tracker (§16.138.3) lists `s2-05-package-consumer.txt` (the `09:56` candidate file) as required file 7, not the baseline failure file. | Consistent with the acceptance record. Noted for accuracy. |

---

## 5. Acceptance criteria and authority (item D)

### 5.1 What the S2 evidence is intended to satisfy

- CAP-03 S2 gate: the five commands in runbook §3 / matrix §2.2 (`npm ci`, `tsc --noEmit`, build with the `1,140` `dist` set, canonical guarded `npm test`, `npm run test:package-consumer`), with evidence accepted into the record (runbook §5.2). This is the basis of `P-1-A`.
- **Separate: Gate 4 Limb A.** Gate 4 act §6 requires a native-Windows canonical `npm test` at the post-merge Limb A commit. Status: **NOT STARTED**. Whether the `001c3c80` run satisfies it is a reserved ruling (Q-S2-2 = Q-B7). These two requirements are **not** merged in this record. The package (N-2) states that "S2" is used for both.

### 5.2 Status by criterion

| Item | Status | Basis |
|---|---|---|
| Five gate conditions on candidate `001c3c80` | Recorded **SATISFIED (candidate-scoped)** | Acceptance record `8eee2957`; §4.2 above reproduces the results |
| Deposit chain (PR #310 → `47133fe4…`) | **SATISFIED** (recorded) | Acceptance A1 |
| Publication of the recovered archive | **SATISFIED** (verified, §2). Publication is not acceptance. | §2 |
| `R-1` — 47-entry verification output that reported `PASS` | **OPEN.** Not cleared. The archive has no verification output that reports a 47-entry `PASS`. The audit's per-file source-to-manifest result is a different artefact (Windows-reported). Whether it substitutes is a PA question. | §3.2–§3.3; acceptance §4 |
| `R-2` — `s2-checkout-verification.txt` | **Clearing condition met on the record's own terms** ("original bytes supplied"): the archive original's SHA-256 equals the manifest digest `3FD31FE6…`. The residual register itself has not been updated, and this record does not update it. | §3.5 |
| `R-3` — single-run capture | **OPEN** (not required by the PA direction) | Acceptance §5 |
| `R-4` — host-byte identity | **OPEN, permanent boundary** (host CRLF vs committed LF; host originals not accessible) | Acceptance §5 |
| D1 (unified record: per-file raw-byte read-back) | Recomputation of the 47 archive copies done in this pass. Host-byte identity remains R-4. The D1 disposition is a PA choice (D1(i) closed for candidate scope; D1(ii) open pending operator read-back). | Unified record `5bcc25a2`, lines 123–124 |
| D4 (unified record: full acceptance "NOT RENDERED") | Depends on Q-S2-1; the acceptance record does not state whether it closes D4. | Unified record; acceptance record (no D4 reference) |
| DQ-4 criteria 7 and 8 (acceptance A6, A7) | **NOT MET.** Unaffected by this record. | Acceptance §3 |
| P-1-A | Recorded **SATISFIED (candidate-scoped)** (tracker §16.144.4). Depends on the Q-S2-1 ruling for its scope. | Tracker §16.144 |

### 5.3 Who has authorised what

- **PA direction (`2026-10-26`, verbatim in the disposition record §1):** "retain the already-passing S2 candidate run as the operative execution basis … Record this direction … as a candidate-scoped baseline disposition, within my authority. Do not misrepresent the earlier failed approved-baseline run as passing." This **designates the basis**. It does not in its words grant formal acceptance.
- **Acceptance record (`CV-CORR-124`, `8eee2957`):** "rendered on PA direction". It states that acceptance is candidate-scoped and is "not an admission, qualification gate, implementation grant, or P-1 authorisation".
- **Q-S2-1** (acceptance scope: whether R-1 is an absolute prerequisite; the D1 disposition; whether the PASS stays user-reported) is reserved in the `2026-10-28` package. **No PA answer to Q-S2-1 is recorded** in the records reviewed.
- **Conclusion:** the candidate-scoped acceptance is **recorded**, on the PA's basis direction. The PA's ruling on its scope is **not established**. Formal acceptance is therefore **NOT ESTABLISHED** as an unqualified PA decision. This record does not supply that ruling.

---

## 6. Outstanding items and dependencies (item E)

| ID | Item | Depends on | Owner |
|---|---|---|---|
| O-1 | `R-1`: produce the 47-entry verification output, or a PA ruling that R-1 is not an absolute prerequisite | Q-S2-1 | PA; operator (if an artefact exists) |
| O-2 | `48` vs `47`: the generation script, its log and the host manifest history (to explain the 12:51:02Z rewrite and the count), or a PA ruling accepting it as an open residual | Operator access to host artefacts | Operator; PA |
| O-3 | Q-S2-1: acceptance scope | — (reserved) | PA |
| O-4 | D1 disposition: D1(i) or D1(ii) | O-3 | PA |
| O-5 | Residual register update for `R-2` (clearing condition met) | O-3 (governed correction) | IRR governed correction |
| O-6 | Authority and purpose of the `12:35:34Z` baseline step-5 run | Operator or PA statement for the record | PA / operator |
| O-7 | Acceptance A4 wording on steps 01–03 (different tree; §4.3) | Governed correction | IRR governed correction |
| O-8 | Gate 4 Limb A native-Windows `npm test` at the post-merge Limb A commit | Q-S2-2 / Q-B7; Gate 4 owner | PA; Gate 4 owner. **Not started.** |
| O-9 | Tracker line 16 ("COMPLETE AND CLOSED on the user's reported `PASS`") conflicts with R-1 | O-1 | IRR governed correction |
| O-10 | Package §1.1 and F-1 ("closed typo") remain unverified (carried) | — | IRR governed correction |

---

## 7. Changes made, verification, and next action (items F and G)

### 7.1 Changes made in this pass

- **Added:** `docs/integration/IIPS_v3.0_CAP03_S2_POST_PUBLICATION_EVIDENCE_RECONCILIATION_2026-10-28.md` (this record).
- **Added:** `evidence/integration/cap03-s2-post-publication-reconciliation-2026-10-28/` — `verify_reconciliation.py` (read-only; recomputes §2, §3 and §4 from the git object store), `01-publication-verification.json`, `02-manifest-reconciliation.json`, `03-execution-outcomes.json`, `SHA256SUMS.txt`.
- **Not changed:** `main`; the publication branch; the recovered archive and its originals; the S2 acceptance record; the package; the tracker; any IPD repository; any application source, test or build file.
- **Not performed:** no PA decision; no formal acceptance; no merge; no test, build, `npm ci` or S2 step; no host or PowerShell action; no manifest regeneration.

### 7.2 Remote verification

Verified after push (`ls-remote`; explicit fetch of `arena/b776c15a-iips-review-recovered`):
- Branch `arena/b776c15a-iips-review-recovered` = `50d757302c85efc7863f2fdbaa11271a97282b23` at the time of the first push, with parent `82b3f4a5…` (= `main`).
- The six files (this record, `verify_reconciliation.py`, three JSON outputs, `SHA256SUMS.txt`) are byte-identical to the local copies (`cmp`), and `sha256sum -c` on the remote `SHA256SUMS.txt` returns OK for all four listed files.
- `main` = `82b3f4a5…` (unchanged).

### 7.3 Publication status

Pull request **#353** (`arena/b776c15a-iips-review-recovered` → `main`) is open, not draft, and **not merged**. Its head at creation was `50d75730…`. The exact-head check results are not recorded in this record.

### 7.4 Authorisation boundary

Merging this record to `main` is **not** performed here. The request said not to change `main` without the necessary authority, and documentation-only publication was not shown to be authorised for direct merge in the governance records reviewed. The record is on the session branch, with open pull request #353 for review. The PA ruling on Q-S2-1 and D1 is outside this pass.

### 7.5 Next action

**PA ruling on Q-S2-1** (whether residual R-1 is an absolute acceptance prerequisite, and the D1 disposition D1(i) or D1(ii)), taken on this record and the verified facts in §3–§5.

- **Prerequisite:** this record reviewed by the PA (the pull request for the session branch). The record does not authorise itself.
- **Not a prerequisite:** the operator's host artefacts. They would strengthen O-1 and O-2, but the ruling can be made without them, with R-1 and the `48` count recorded as open.

---

*End of record `IIPS-V3-CAP03-S2-POST-PUBLICATION-EVIDENCE-RECONCILIATION-2026-10-28-01`. This record makes no PA decision and does not claim formal acceptance. Original host bytes, the user-reported `47`-entry `PASS`, and IRR branch protection (HTTP 403) were not verified.*
