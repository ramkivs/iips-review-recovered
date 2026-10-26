# IRR review and late registration — CAP-02 + CAP-03 unified reconciliation (`2026-10-26`)

> **Dated receipt and current-state overlay only.** This is not a Program Authority decision, S2 rerun, P-1 execution, S3/QE action, pin change, gate movement, fence change, or production authorization. It is published under the existing F-3 §1.2 standing authorization for corrections, governance records and publication; it selects or changes no PA-owned value.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP02-CAP03-UNIFIED-RECONCILIATION-IRR-REVIEW-2026-10-26-01` |
| Tracker registration | §16.139, late and adapted (`CV-CORR-119` proposed block / `CV-CORR-126` late registration; `CHG-2026-10-26-28`) |
| Reviewed authoritative baseline | IRR `main@16e215cb30603ecf1058d0e3392a9c6bff15ed7a`, tree `6e07ddef01d1505d1081d5e81421dd6fc8d803e7`; tracker blob `413eb9d21f0cc17b37c1f98286a2afea1cab9d56`, `2,546,975` B, SHA-256 `40b206f8396a6107256b800e6e6ab52a7c8b7d7e6d0e43706ed27a359f01941f` |
| Purpose | Answer only the IRR-publication, PF-15 literal-integrity, and immediate-action questions using the existing report and later authoritative records |

## 1. IRR publication status

**Verified before this registration:** authoritative IRR `main` had no `## §16.139` section. It contained only historical references to the proposal in §16.140.0 and related records. Therefore the reconciliation was **not published in the authoritative IRR tracker** by IPD PR #98.

The full reconciliation was published in IPD PR **#98** (`MERGED` `2026-10-26T14:27:39Z`; head `8388c6178309c023c1158f14d53f5880b6ada7ea`; merge `4bb9a6541ed636ed4ad5c4895ad506dade01fdba`):

- `evidence/cross-repository/IIPS_V3_CAP02_CAP03_UNIFIED_AUTHORITATIVE_STATUS_RECONCILIATION_2026-10-26.md` — blob `5bcc25a2234bed3c67d93f1b02fc9fbc0047360b`, `35,474` B;
- `evidence/cross-repository/IIPS_V3_CAP02_CAP03_UNIFIED_RECONCILIATION_IPD_MIRROR_RECEIPT_2026-10-26.md` — blob `ea18e9578ee4d0ecccb89282a65fa9ba6f2579e9`, `7,352` B;
- `evidence/cross-repository/cap02_cap03_unified_reconciliation_2026-10-26/TRACKER_PATCH_PROPOSED.diff` — blob `f1ccc3828999abef539632c148738e8da1e718a2`, `115,592` B. IPD PR #99 subsequently made the replayable 44-check bundle ancestry-safe; the copies published here are read from IPD `888eb375eebee01640e44ccdcbb138a71e8c4513`.

IPD PR #98's body and mirror receipt state that all IRR `git push` and GitHub REST blob/ref/comment writes returned **HTTP 403 `Resource not accessible by integration`** because that session's integration was scoped to IPD. That is why IRR was not updated. Durability of the report on IPD `main` is not durability of the IRR tracker.

**Exact required action:** an IRR-capable session must apply or adapt `TRACKER_PATCH_PROPOSED.diff` in `ramkivs/iips-review-recovered`: add the §16.139 registration, the `CHG-2026-10-26-19` change-log record, the full report and verification bundle; use a governed PR with green exact-head and post-merge `main` CI, a regular merge, independent Git-Blobs byte read-back, then populate the §16.139.7 companion receipt (`CHG-2026-10-26-20`, `V906`). This pass performs that action in an **adapted late form**: it publishes the exact IPD report/evidence bytes as a dated historical baseline and adds a current-state overlay, rather than re-asserting the proposal's stale current-state matrix. §§16.140–16.145 remain authoritative for later events.

## 2. PF-15 issue and decision boundary

**Verified fact:** PF-15 is `DESIGNATED / EFFECTIVE` under corrected act `...-2026-10-26-02` (IRR PR #304/#305; blob `3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d`). §16.140.4 P-1-E and §16.144.4 leave that designation intact.

**Reported integrity finding, in simple words:** §16.137 says act `...-01` had too many backslashes in the F2 named-pipe, F4 database-path, and F5 evidence-root strings and that act `...-02` re-rendered corrected strings. A direct byte comparison shows the six F1–F6 table rows in `...-01` and `...-02` are identical; only title, status notice, act ID, correction narrative and footer changed. The effective `...-02` code spans themselves are the canonical Windows forms recorded in §16.140.4: F2 length `31` with `4` backslashes, F4 length `39` with `3`, and F5 length `28` with `2`. Both resolvers accept F2 verbatim. Thus the real residual is a **contradictory change-history/document-integrity narrative**, not a missing or undecided F1–F6 designation.

**Decision:** no new Ramki/PA decision is required now. Arena can and did resolve the technical question by comparing the live act bytes and recording the exact code points; §16.140.4 already states that PR #98's additional PA-confirmation `STOP` was preserved for visibility but **not adopted as a blocker**, and that the PF-15 decision is not reopened. No path value is restated as a new selection, normalized, unescaped, or invented. Only if Ramki later asserts that the original approval contained different bytes would a distinct new PA act be required; no such assertion exists in the authoritative record. The effective act `...-02` remains the sole operative source, to be copied verbatim for any later host use.

## 3. Immediate actions, owners and blockers

At the report's `2026-10-26T14:11Z` baseline, its **single critical-path action** was: Ramki, as the Windows operator on `desktop-no0nhtp`, supplies read-only copies of the 47 manifest-listed S2 files from `C:\iips-evidence\cap03-s2\` — at minimum the nine required step files, final manifest and manifest-verification output — through an approved channel without changing originals or rerunning S2. Arena then recomputes SHA-256 for each file, compares every digest with the manifest, publishes a dated read-back addendum and then a distinct S2 evidence-acceptance record. Completion evidence is: `47/47` files present, `9/9` required files, all digests matching, `1,140` `dist` files, clean pin, `924/920/0/4` guarded suite and consumer `PASS` corroborated, plus the two dated records on IRR `main` with green exact-head/post-merge CI and remote read-back.

**Current-state overlay:** that report-baseline action is no longer outstanding. Authoritative §§16.141–16.145 record that the already-published evidence branch was inspected, raw evidence was deposited by PR **#310** → `47133fe489e80de2af5f1b537d67865a6a7235b9`, a candidate-scoped execution basis was designated by §16.143, and S2 evidence was `ACCEPTED — CANDIDATE-SCOPED` by §16.144, effective through PR **#311** → `dbcb95df8bcea1e0ed33bb21fc893c26fca0967e`. Residuals `R-1`–`R-4` remain unwaived. The report's proposed PF-15 PA confirmation is **not** an independently necessary parallel action under §16.140.4. Supplying the missing host-side 47-entry `PASS` output and the original `s2-checkout-verification.txt` bytes can clear `R-1`/`R-2`, but §16.144.3 holds that neither is an absolute acceptance prerequisite.

As a result, P-1 is no longer blocked by S2 evidence acceptance or the execution-basis disposition: `P-1-A` and `P-1-B` are satisfied. The remaining immediate host actions are `P-1-C` (fresh designated-host/non-elevated-operator/Node/clean-checkout preflight) and `P-1-D` (F4 fixed-NTFS, outside-worktree, writability and DB/`-wal`/`-shm` absence checks), both owner-operated on `desktop-no0nhtp`. Until those are evidenced, P-1 stays unspent/unauthorized; S3, QE-1…QE-11, DQ-4 criteria 7–8, DQ-4 freeze establishment, acceptance and Gate 5 remain blocked. Ramki is needed as host operator, not to make a new PF-15 value decision.

## 4. Scope and non-grants

This receipt registers and corrects records only. It does not rerun S2, consume P-1, create a database/endpoint/evidence root, start S3/QE, change a pin/H-12 manifest/fence/production restriction, render an S2 acceptance, or write to IPD. `WRITE_NOT_AUTHORIZED`, all `503` fences and `durable:false` remain intact.

*End of `IIPS-V3-CAP02-CAP03-UNIFIED-RECONCILIATION-IRR-REVIEW-2026-10-26-01`.*
