# CAP-03 — S2 Evidence-Manifest Verification Receipt (`2026-10-26`)

> ## STATUS: **EVIDENCE-PUBLICATION RECEIPT — USER-REPORTED WINDOWS VERIFICATION RECORDED; ARENA RAW-BYTE READ-BACK PENDING. NO S2 RERUN, NO TEST RERUN, NO BUILD, NO MANIFEST REGENERATION.**
>
> This receipt durably records the user-reported Windows final-manifest verification (`PASS`, 47 entries, nine required S2 filenames present and verified) and the remote repository facts independently verified by Arena on `2026-10-26`. It does **not** claim that Arena inspected or recomputed files on `desktop-no0nhtp`, does **not** mark full S2 evidence acceptance as accepted, and does **not** reopen completed S2 execution work. The raw Windows evidence bytes remain on external host storage outside Git; independent raw-byte read-back remains **PENDING** until those bytes are made available through an authorized, read-only channel and independently checked (see §4–§5).

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-S2-EVIDENCE-MANIFEST-VERIFICATION-RECEIPT-2026-10-26-01` (census: `0` prior occurrences in IRR and IPD at publication) |
| Tracker registration | Master tracker §16.138; `CV-CORR-118`; `CHG-2026-10-26-17` (publication receipt `CHG-2026-10-26-18` follows at §16.138.7); verification rows `V881`–`V888` |
| Record type | Dated S2 evidence-publication receipt — records user-reported Windows verification with provenance preserved and independently re-verifies remote repository facts; **not** a re-execution, qualification, acceptance, admission, or pin-designation act |
| Governing locus | IRR `ramkivs/iips-review-recovered`, `refs/heads/main`; IPD `ramkivs/iips-production-market-data` inspected read-only (`0` IPD writes in this pass) |
| Receipt date | `2026-10-26` (UTC) |
| Windows host | `desktop-no0nhtp` (designated native-Windows host; Arena has no access route to this host — see §4) |
| Evidence root (host, outside every worktree) | `C:\iips-evidence\cap03-s2\` (runbook `$EvidenceRoot`; files outside Git by governance design) |
| Evidence bundle (this publication) | `evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/` |
| Upstream records (unchanged) | Tracker §16.132 (`CV-CORR-112`), §16.133 (`CV-CORR-113`), §16.134 (`CV-CORR-114`), §16.135.4 (`CV-CORR-115`); S2 operator runbook `IIPS-V3-CAP03-S2-OPERATOR-RUNBOOK-2026-10-26-01` at `docs/integration/IIPS_v3.0_CAP03_S2_OPERATOR_RUNBOOK_2026-10-26.md` |
| Publication completeness rule | **S2 evidence receipt publication is COMPLETE only after** this receipt and tracker §16.138 are published to IRR `main` by the normal PR process (green exact-head CI, regular merge, green post-merge `main` CI) **and** independently read back from the remote. The satisfaction of that rule is recorded at tracker §16.138.7, not asserted by the local presence of this file. |

---

## 1. User-reported Windows verification (reported `2026-10-26`)

The following results were **reported by the user from the Windows host** and are recorded verbatim. Arena did not execute these steps, did not observe the Windows session, and did not recompute these hashes. The "source" of each row is the user's `2026-10-26` S2 evidence-publication report (the execution directive carrying this closure), read with the previously published records cited in the final two rows.

| Item | Reported result | Evidence classification | Source |
|---|---|---|---|
| Final manifest verification | `PASS` | User-reported Windows verification | User report, `2026-10-26` |
| Manifest entries | 47 | User-reported Windows verification | User report, `2026-10-26` |
| Required S2 filenames | All nine present and verified (listed in §2) | User-reported Windows verification | User report, `2026-10-26` |
| File existence and hash checks | All listed files existed and recomputed hashes matched | User-reported Windows verification | User report, `2026-10-26` |
| Locked session transcript | `windows-session-transcript.txt` **excluded from the manifest because it was locked during hashing** — it is **not** one of the 47 entries and must not be implied to be included | User-reported Windows verification | User report, `2026-10-26` |
| Post-run pin | Approved baseline commit/tree matched; working tree clean | User-reported Windows verification | User report, `2026-10-26` |
| Distribution inventory | Expected and actual counts matched at 1,140 | User-reported Windows verification | User report, `2026-10-26` |
| Corrected-candidate suite | 924 total, 920 passed, 0 failed, 4 skipped | Previously recorded validation result (tracker §16.132.3, §16.134.3) | Published IRR tracker; hash in §3 |
| Package-consumer check | `PASS` | Previously recorded validation result (tracker §16.132.3) | Published IRR tracker; hash in §3 |

**No failure of the user's Windows verification is inferred from Arena's lack of host access.** Arena's access limitation is recorded in §4 as a limitation on independent read-back only; it does not convert the reported `PASS` into a failure, a rerun requirement, or a reopening of completed execution work.

If the actual Windows manifest-verification output becomes available through an approved artifact channel, it must be included or referenced **without altering the original evidence**. At the date of this receipt no such copy is available to Arena: the IRR tree contains no copy of the nine files (see §4), and both repositories report `0` GitHub Actions artifacts. This receipt therefore records the reported output by transcription (§1–§3 and evidence file `01-user-reported-windows-manifest-verification.json`) and states the raw-byte limitation explicitly rather than blocking publication.

## 2. Required S2 filenames (nine)

All nine filenames below were reported present in, and verified against the final 47-entry manifest. They are reproduced exactly, in order:

1. `s2-01-npm-ci.txt`
2. `s2-02-tsc-noemit.txt`
3. `s2-03-build.txt`
4. `s2-03-dist-count.txt`
5. `s2-03-dist-sha256-before.txt`
6. `s2-04-guarded-npm-test.txt`
7. `s2-05-package-consumer.txt`
8. `s2-post-run-pin.txt`
9. `s2-dist-sha256-after.txt`

Excluded (not counted above, not in the 47-entry manifest): `windows-session-transcript.txt` — locked during hashing (§1).

## 3. Previously recorded hashes (preserved exactly)

These hashes are preserved exactly as previously recorded (uppercase hex, no normalization). Recording them here does not constitute Arena recomputation (see §4).

| Evidence | SHA-256 (exact) | Previously recorded at |
|---|---|---|
| Corrected-candidate suite output (`924` total / `920` passed / `0` failed / `4` skipped) | `C5DDFFA24393AED2E391EF8A72E8BFF1F8ECD9576C4349E182B288785F1B2941` | Tracker §16.132.3 (`C:\iips-evidence\cap03-s2\s2-npm-launch-fix-suite-20261026T095613Z.txt`) |
| Consumer output (`PASS`) | `9F7C64073A849E57D472C9CA30BB7616D04D1951626E90587241D61A470A85B1` | Tracker §16.132.3 (`C:\iips-evidence\cap03-s2\s2-npm-launch-fix-consumer-20261026T095613Z.txt`) |

Relevant commit identifiers (independently re-verified at the remote in §4): approved baseline commit `8eec74ae27cda09f3c368b9c299895eae41554db` (tree `4eba29029f8d95cfe483e615a7047426b298ce50`); corrected candidate commit `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (tree `399fa44a5f1953c0f61b452420fefb5985426ef1`). The approved-baseline and corrected-candidate records remain **distinct**; no re-pin is made or implied by this receipt (see tracker §16.132.5, §16.134.2).

## 4. Remote repository facts independently verified by Arena (`2026-10-26`)

Verified live against the authoritative remotes via the GitHub REST / Git APIs on `2026-10-26` (evidence file `00-remote-state-reverification.json`). Only the facts in this section are claimed as Arena-independent verification.

| # | Fact | Verified value |
|---|---|---|
| 1 | IRR authoritative `main` at re-verification | `ramkivs/iips-review-recovered` `refs/heads/main` @ **`d9345004f5897ecb33fa532599b51a6ec799aa7a`**, root tree `8d1b820c8f892064bd7946becde43bdeb92942c4` (2-parent merge of PR #305, `2026-10-26T13:46:12Z`); latest `main` push CI run `40333508495` `completed / success`; **0 open PRs** |
| 2 | Movement since the supplied `11270b85…` snapshot | `11270b85db1354d8bce9c8278ff97a93e81c66f0` (merge of PR #301) is an ancestor; IRR `main` advanced **8 commits** via PRs #302–#305 touching exactly 3 paths (tracker + the two PF-15 PA-act files) — **0 S2 evidence paths changed**. This pass reconciles against live `d9345004…`, not the stale snapshot. |
| 3 | IPD `main` at re-verification | `ramkivs/iips-production-market-data` `main` @ **`f97b17e7d04a0c5c4573c0dbe51da2c4c595d829`**, root tree `6da6f82970fd3fb836500776708bbb6ea206baa1` (merge of PR #97); latest `main` push CI run `40315422170` `completed / success`; **0 open PRs** |
| 4 | Approved baseline commit | `8eec74ae27cda09f3c368b9c299895eae41554db`, tree `4eba29029f8d95cfe483e615a7047426b298ce50` (IPD locus) — exists at the remote; ancestor of IPD `main` (14 commits behind) |
| 5 | Corrected candidate commit / tree / parent | `001c3c80618f2ee1d40e9a90912237e1a06e7b58`, tree `399fa44a5f1953c0f61b452420fefb5985426ef1`, single parent `8eec74ae27cda09f3c368b9c299895eae41554db` (compare `ahead_by: 1, behind_by: 0`); ancestor of IPD `main` (13 commits behind) |
| 6 | Two-file change set | Exactly `scripts/verify-public-package.mjs` (+7/−3) and `tests/portfolio_ui_package.test.ts` (+2/−2) across `8eec74ae…...001c3c80…` — no other paths |
| 7 | IPD PR #96 | **MERGED** `2026-10-26T10:12:18Z`; head `001c3c80618f2ee1d40e9a90912237e1a06e7b58` → merge commit `1e76f4cf9e9ca7d385a8345c9b6f438ae1ad6745`; title "Fix native Windows CAP-03 S2 package validation"; head CI run `40305148754` `pass` |
| 8 | Published tracker S2 records | Tracker §16.132.3, §16.132.7, §16.134.3–§16.134.6 and §16.135.4 on live IRR `main` contain the corrected-candidate validation results and the two hashes in §3 verbatim (published via IRR PRs #298/#299/#300 with remote receipts) |
| 9 | Windows evidence bytes location | No copy of the nine files in §2, of the 47-entry manifest, or of `windows-session-transcript.txt` exists in the IRR tree at `d9345004…`; GitHub Actions artifacts total `0` in both repositories. The bytes remain on host storage `C:\iips-evidence\cap03-s2\` outside Git (consistent with tracker §16.135.4). **Read-only access to the raw bytes was not established in this pass.** |

**Verification boundary (binding on this receipt):**

- **Remote repository facts independently verified by Arena:** §4 rows 1–9 only (plus, after publication, the remote read-back of this receipt itself at tracker §16.138.7).
- **Windows results reported by the user:** §1–§2, and the two "previously recorded" rows re-cited in §1/§3. Arena must not claim to have independently recomputed hashes or inspected files on `desktop-no0nhtp`, and does not.
- **Raw-byte verification still outstanding:** independent existence/hash/content read-back of the 47 manifest-listed files (including the nine in §2) and of the manifest-verification output itself, because the Windows evidence bytes are not accessible. Raw Windows transcript verification is **NOT COMPLETE** and is not marked complete by this receipt.

## 5. Status reconciliation and remaining acceptance limitation

| Status | Disposition under this receipt |
|---|---|
| **S2 execution** | **Complete as reported from Windows** (user-reported; not re-executed, not reopened) |
| **Final manifest verification** | **Complete and closed** based on the user's reported Windows `PASS` for 47 entries (nine required filenames present and verified; `windows-session-transcript.txt` excluded as locked — §1–§2) |
| **S2 evidence receipt publication** | **Complete only after** durable publication to IRR `main` and remote read-back (rule in the field table above; satisfaction recorded at tracker §16.138.7) |
| **Raw Windows evidence-byte read-back** | **PENDING** until the actual evidence bytes are accessible through an authorized, read-only channel and independently checked |
| **Full S2 evidence acceptance** | **NOT ACCEPTED by this receipt.** Publication alone does not satisfy the existing acceptance criteria. Outstanding under the current records: the raw-byte read-back above; DQ-4 final QE freeze remains `PREPARED AND VALIDATED — NOT ESTABLISHED (8/10)` (criteria 7–8, tracker §16.132.5/§16.133); Gate 4 remains `AUTHORIZED — NOT STARTED`, QE `0/11`; the corrected-candidate validations remain component validation, not full CAP-03 qualification (§16.132.5). No gate, freeze, or acceptance movement is claimed. |

**Exact next action to resolve the remaining limitation (no rerun required):** the operator provides read-only copies of the 47 manifest-listed files from `C:\iips-evidence\cap03-s2\` — at minimum the nine files in §2, the final manifest itself, and the manifest-verification output — through an approved artifact channel (for example, deposit during a future host evidence deposit under the PF-15 `$EvidenceRoot` discipline, without altering the originals), after which Arena independently recomputes SHA-256 for each file, compares against the manifest, and records the result as a dated addendum to this receipt. **No S2 rerun, test rerun, build, or manifest regeneration is needed or authorized for this step.**

## 6. Preservation and non-claims

- **Nothing was re-executed:** no S2 run, no test run, no build, and no manifest generation or regeneration was performed for this receipt. Local validation was limited to documentation integrity checks of the new files (tracker evidence `verify_s2_receipt.py`, `git diff --check`).
- **Upstream evidence untouched:** tracker §§16.132–16.137, the S2 runbook, and all prior evidence bundles are unmodified; the original S2 failure at the approved baseline remains preserved as historical diagnostic evidence (§16.132.4) and is neither overwritten nor combined with the corrected-candidate results.
- **Pins distinct:** approved baseline `8eec74ae27cda09f3c368b9c299895eae41554db` / `4eba29029f8d95cfe483e615a7047426b298ce50` and corrected candidate `001c3c80618f2ee1d40e9a90912237e1a06e7b58` / `399fa44a5f1953c0f61b452420fefb5985426ef1` remain distinct records; no silent re-pin.
- **No downstream movement:** no P-1 consumption, no S3/QE execution, no Gate 4/Gate 5 movement, no acceptance or admission, no `CV-*` register-count movement, and `0` IPD writes. PF-15 disposition is governed by §§16.136–16.137 and is unchanged by this receipt.

---

*End of `IIPS-V3-CAP03-S2-EVIDENCE-MANIFEST-VERIFICATION-RECEIPT-2026-10-26-01` — user-reported Windows 47-entry manifest `PASS` and nine-file verification recorded with provenance preserved; Arena-independent verification limited to remote repository facts (§4); raw Windows evidence-byte read-back PENDING; full S2 evidence acceptance NOT rendered; no execution work repeated.*
