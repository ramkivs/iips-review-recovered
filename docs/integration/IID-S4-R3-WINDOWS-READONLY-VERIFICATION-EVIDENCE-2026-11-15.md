# IID S4-R3 — Windows-Host Read-Only Candidate Verification Evidence (VERIFY-ONLY)

**Recording date:** 2026-11-15 (UTC) — repository-side recording clock, `date -u` observed `2026-11-15T16:20:33Z`
**Execution timestamp:** **NOT SUPPLIED.** The operator transcript carries no timestamp; none is asserted here.
**Branch:** `arena/53ff9276-iips-review-recovered`
**Mode:** `-VerifyOnly` — read-only verification of an existing candidate; **no build, no installation**
**Host worktree / script source:** `C:\iips-worktrees\S4-R3-preflight-7ef0f10` at `7ef0f10f593e6d5449900b61f7bf74d0c3daaa01`
**Candidate verified:** `C:\iips-candidates\S4-R3-preflight-7ef0f10`
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION — evidence recording and governance-tracker update; documentation only
**Production:** OUT OF SCOPE

> **WINDOWS READ-ONLY CANDIDATE VERIFICATION: `VERIFY-PASS; 46 passed, 0 failed; ExitCode=0`.**
> **NO BUILD WAS STARTED BY THIS INVOCATION. NO INSTALLATION. NO RUNTIME STATE CHANGE.**
> **PORTFOLIO DATABASE NOT ACCESSED. OVERALL IID READINESS REMAINS NOT READY.**

This document records a **second, separate** operator host act: a read-only re-verification of the already-built
S4-R3 candidate. It does not supersede `IID-S4-R3-WINDOWS-HOST-BUILD-AND-VERIFICATION-EVIDENCE-2026-11-15.md`,
which remains the record of the BUILD act, and it does not supersede the O3 admission decisions, which remain the
governing authority. Stage 4 remains **PARTIALLY COMPLETE**.

## 1. Provenance of this record

The transcript in §3 was supplied by the operator from the Windows host and is transcribed **verbatim**. The
repository-side session that recorded it performed **no** Windows execution, **no** candidate build, **no**
re-verification of the candidate, **no** installation and **no** dataset access. Every host result below is
**operator-supplied evidence**, not an Arena sandbox measurement.

The transcript contains no date or time field. Therefore no execution timestamp is recorded. What *is*
establishable from authoritative evidence is the **ordering**: the run reports
`recorded-windows-evidence` PASS and `optional Windows evidence=True`, and
`verification/windows-local-verification.json` is written only by the driver's BUILD path. This VERIFY-ONLY run
therefore happened **after** the BUILD act recorded at host timestamps `2026-11-15T12:17:32.193Z` /
`2026-11-15T12:17:33.716Z`. That is an ordering fact, not an invented timestamp. The candidate's own measurement
clock is unchanged: as-of `2026-11-14`.

Only procedure references, code locators and non-content verification metadata are published here. No normalized
dataset file, source excerpt, candidate archive or derived dataset content is committed or pushed.

## 2. Execution facts as supplied

| Item | Value |
|---|---|
| Shell | Windows PowerShell 5.1 Desktop — `5.1.26100.9818` |
| Driver | `tools/windows/IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1`, invoked with `-VerifyOnly` |
| Invocation prompt directory | `C:\iips-worktrees\S4-R3-preflight-dbb9545` (see §6, observation O-1) |
| `-RepoRoot` | `C:\iips-worktrees\S4-R3-preflight-7ef0f10` |
| `-OutputDir` | `C:\iips-candidates\S4-R3-preflight-7ef0f10` |
| Resolved git worktree root | `C:/iips-worktrees/S4-R3-preflight-7ef0f10` |
| Host HEAD | `7ef0f10f593e6d5449900b61f7bf74d0c3daaa01`; required ancestor `3c4789618b88689e269ce177ff50649545ef6e33` |
| Node.js | `C:\Program Files\nodejs\node.exe v24.14.0` |
| tsx | `4.23.9`; locked `4.23.9`; native Windows esbuild present |
| Candidate digest | `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` |
| Driver result | **`VERIFY-PASS; 46 passed, 0 failed; ExitCode=0`** |
| Build wrapper (`--verify-only`) | **PASS**, `checks=16`, `comparable-manifest matches=1`, exit 0 |
| Authoritative dataset verifier | **PASS**, `checks=31`, `failed=0`, exit 0, read-only attestation `1` |
| Diagnostics emitted | 2 (`wrapper-working-tree-raw-sha256`, `manifest-raw-byte-diagnostic`) — not counted as checks |
| Read-only attestation | `powershell-verify-read-only` PASS — names, sizes, mtimes and SHA-256 compared before/after; no evidence written |
| Free space observed | `5182836736` bytes free; reserve `67108864` bytes; drive type `Fixed` |
| Candidate package census | `files=13`; directories `investment`, `investment/dataset`, `verification`; optional Windows evidence `True` |

Admitted input digests — all three matched their expected values on the host:

| Issuer bundle | Expected = authoritative actual |
|---|---|
| Infosys (`REL-1-INFOSYS-2026-11-06/ingest-input`) | `sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c` |
| Marico (`S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico`) | `sha256:31d8e5039c502cae98e9c68f6d8fb47aaec44712f81c7005f5f9b8bd4d09c63d` |
| KEC (`S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec`) | `sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a` |

Protected boundaries, as stated by the driver on the host: active dataset `C:\iips-data\investment\dataset`
— no runtime probe or write; identity directory `C:\iips-data\investment\identity` — no provisioning or probe;
portfolio database `C:\iips-data\iips\user-portfolio.sqlite` — **path guard only, never opened/read/hashed**.

## 3. Operator transcript — verbatim, immutable

Preserved exactly as supplied: every line, command, path, digest, diagnostic, PASS result and final status.
Nothing is paraphrased, truncated, normalized or silently corrected, **including the two anomalous hex strings
on the `pinned-wrapper-sha256` line** (see §6, D-1). This section is immutable; corrections belong in a later
addendum, never in an edit to the block below.

**Integrity pin.** SHA-256 of the exact bytes between the fences (104 lines, LF endings, one trailing LF,
8958 bytes): `4b7aad4978d40fc368fe54832c7632deef757a769bf2c63c5f926a5b70bd0550`. Any future change to this
block changes that digest and is detectable.

```text
PS C:\iips-worktrees\S4-R3-preflight-dbb9545> & 'C:\iips-worktrees\S4-R3-preflight-7ef0f10\tools\windows\IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1' -RepoRoot 'C:\iips-worktrees\S4-R3-preflight-7ef0f10' -OutputDir 'C:\iips-candidates\S4-R3-preflight-7ef0f10' -VerifyOnly
IID S4-R3 local candidate tool - Windows PowerShell 5.1 - NOT an installer
Expected candidate digest: sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
  [PASS] windows-powershell-5.1
         requires Windows PowerShell 5.1 Desktop; found 5.1.26100.9818 Desktop
  [PASS] repo-root
         C:\iips-worktrees\S4-R3-preflight-7ef0f10
  [PASS] destination-outside-repository
         C:\iips-candidates\S4-R3-preflight-7ef0f10
  [PASS] active-dataset-protected
         C:\iips-data\investment\dataset; no runtime probe or write
  [PASS] identity-directory-protected
         C:\iips-data\investment\identity; no provisioning or probe
  [PASS] portfolio-database-protected
         C:\iips-data\iips\user-portfolio.sqlite; path guard only, never opened/read/hashed
  [PASS] authoritative-dataset-layout
         C:\iips-candidates\S4-R3-preflight-7ef0f10\investment\dataset
  [PASS] local-fixed-drive-free-space
         5182836736 bytes free; conservative reserve 67108864 bytes; drive type Fixed
  [PASS] destination-build-state
         C:\iips-candidates\S4-R3-preflight-7ef0f10; existing candidate required for read-only verification
  [PASS] git-worktree-root
         C:/iips-worktrees/S4-R3-preflight-7ef0f10
  [PASS] implementation-commit-present
         HEAD=7ef0f10f593e6d5449900b61f7bf74d0c3daaa01; required ancestor=3c4789618b88689e269ce177ff50649545ef6e33; no fetch/checkout/switch
  [PASS] pinned-wrapper-present
         C:\iips-worktrees\S4-R3-preflight-7ef0f10\iips-platform\src\investment\cli\build-s4-r3-candidate.ts
  [DIAGNOSTIC] wrapper-working-tree-raw-sha256
         raw working-tree bytes sha256=5f3ad17b507c31e30220e96f5717a0b5fbb817b2def62417f91651acde2ba5f7
  [PASS] pinned-wrapper-git-blob
         committed=b807c7f227bbc99228d5ac78bcaa385c4c63b9cc; clean working-tree=b807c7f227bbc99228d5ac78bcaa385c4c63b9cc; expected=b807c7f227bbc99228d5ac78bcaa385c4c63b9cc
  [PASS] pinned-wrapper-sha256
         canonical committed-content sha256=5f3ad17b507c31e30220e96f5717a0b5fbb817b2def62417f91651acde2ba5f7; expected=5f3ad17b507c31e30220e96f5717a0b5f5b5fbb817b2def62417f91651acde2ba5f7; raw=5f3ad17b507c31e30220e96f5717a0b5f5b5fbb817b2def62417f91651acde2ba5f7; line-ending conversion=NONE
  [PASS] implementation-and-inputs-match-commit
         tracked investment implementation, dependency lock and admitted evidence match the required commit; exit=0
  [PASS] node-version
         C:\Program Files\nodejs\node.exe v24.14.0
  [PASS] local-tsx-dependencies
         tsx=4.23.9; locked=4.23.9; native esbuild=C:\iips-worktrees\S4-R3-preflight-7ef0f10\iips-platform\node_modules\@esbuild\win32-x64\esbuild.exe; if absent run npm ci separately inside iips-platform
  [PASS] authoritative-verifier-available
         C:\iips-worktrees\S4-R3-preflight-7ef0f10\iips-platform\src\investment\cli\verify-installed-dataset.ts
  [PASS] Infosys-input-census
         C:\iips-worktrees\S4-R3-preflight-7ef0f10\evidence\real-issuer\REL-1-INFOSYS-2026-11-06\ingest-input
  [PASS] Infosys-input-file-hashes
         periods.csv=e2cdba2042a55fc3352e85b8384e014f669e1472deb9011e7be2babd4fbc745c; roster.json=426e8478bca1ffc3fd47a6a24995230cfbfc05ccd1df4b92fa774ba15c60f8b4
  [PASS] Infosys-input-digest
         expected sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c; authoritative actual sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c
  [PASS] Marico-input-census
         C:\iips-worktrees\S4-R3-preflight-7ef0f10\evidence\real-issuer\S4-R3-FILING-REFRESH-2026-11-14\ingest-input\marico
  [PASS] Marico-input-file-hashes
         periods.csv=df2e1d7182b9aa9d50ab2907342dc2f17330a1ac13fec5ad96a44fff68e41669; roster.json=259c2f093b611af8e1541a78ea5e151cc2ab41cf93ef32bbfaa54fcb18c2cadb
  [PASS] Marico-input-digest
         expected sha256:31d8e5039c502cae98e9c68f6d8fb47aaec44712f81c7005f5f9b8bd4d09c63d; authoritative actual sha256:31d8e5039c502cae98e9c68f6d8fb47aaec44712f81c7005f5f9b8bd4d09c63d
  [PASS] KEC-input-census
         C:\iips-worktrees\S4-R3-preflight-7ef0f10\evidence\real-issuer\S4-R3-FILING-REFRESH-2026-11-14\ingest-input\kec
  [PASS] KEC-input-file-hashes
         periods.csv=ff6e62fde3ec80143a759d2200cdd0f8fae64fc7113b9cb1da691b2baa37e46b; roster.json=d36b27705ef67fccacb3a3a71812556144a52d447a46cef87e3961b39335c0c6
  [PASS] KEC-input-digest
         expected sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a; authoritative actual sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a
  [PASS] recorded-evidence-hashes
         ledger=b41b0b106fe731d1b2420f72f05b2efa7e44e1a39ef185b4af063f441be92c63; manifest=b921741942d4674ed968f2938917b588b07ae9dc6db12f2998cb7361727d90ba
  [PASS] wrapper-verify-exit
         exit=0;
  [PASS] verify-only-authoritative-report
         result=PASS; digest=sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b; checks=16; comparable-manifest matches=1
  [DIAGNOSTIC] manifest-raw-byte-diagnostic
         DIFFERENT_RAW_BYTES; sha256=b0c888a86d44dcc7e79dde817ff4157ddfe590d64b324600d736d385e8fd6799; recorded=b921741942d4674ed968f2938917b588b07ae9dc6db12f2998cb7361727d90ba; identity is governed by the passed authoritative comparable-fields check, never by raw audit-path equality
  [PASS] eight-content-files-declared
         corporateActions.json, issuers.json, issues.json, listings.json, operatingMetrics.json, periods.json, prices.json, securities.json
  [PASS] content-hash-corporateActions.json
         actual=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570; manifest=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570; recorded=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570
  [PASS] content-hash-issuers.json
         actual=b67da8709e7044312c5ef2db5fd92c416dc349bfdaff54f08f2d4194a5bc4014; manifest=b67da8709e7044312c5ef2db5fd92c416dc349bfdaff54f08f2d4194a5bc4014; recorded=b67da8709e7044312c5ef2db5fd92c416dc349bfdaff54f08f2d4194a5bc4014
  [PASS] content-hash-issues.json
         actual=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570; manifest=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570; recorded=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570
  [PASS] content-hash-listings.json
         actual=77f8d13490332c05589d3ebbdb59bda98ef7cebc853371d652698824ab992130; manifest=77f8d13490332c05589d3ebbdb59bda98ef7cebc853371d652698824ab992130; recorded=77f8d13490332c05589d3ebbdb59bda98ef7cebc853371d652698824ab992130
  [PASS] content-hash-operatingMetrics.json
         actual=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570; manifest=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570; recorded=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570
  [PASS] content-hash-periods.json
         actual=9b44cfffe23a05db0a5a288df26fe25dcdc2451f672c92a1bed2399f66ab6d47; manifest=9b44cfffe23a05db0a5a288df26fe25dcdc2451f672c92a1bed2399f66ab6d47; recorded=9b44cfffe23a05db0a5a288df26fe25dcdc2451f672c92a1bed2399f66ab6d47
  [PASS] content-hash-prices.json
         actual=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570; manifest=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570; recorded=37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570
  [PASS] content-hash-securities.json
         actual=d25abfdede4a4bb89f44babcf8a3690f294e5c2bd93651109ddebe6590abc5ab; manifest=d25abfdede4a4bb89f44babcf8a3690f294e5c2bd93651109ddebe6590abc5ab; recorded=d25abfdede4a4bb89f44babcf8a3690f294e5c2bd93651109ddebe6590abc5ab
  [PASS] manifest-exact-admitted-identity
         sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
  [PASS] candidate-package-census
         files=13; directories=investment, investment/dataset, verification; optional Windows evidence=True
  [PASS] recorded-ledger-and-evidence
         ledger entries=10; ledgerSha256=6e4586b65f937308140b3b7b71d31b20f63e99adf29a250e19a4cf0777cddfa5
  [PASS] recorded-windows-evidence
         optional local Windows build attestation inspected read-only; never rewritten
  [PASS] authoritative-verifier-exit
         exit=0;
  [PASS] authoritative-dataset-verifier
         PASS checks=31; failed=0; read-only attestation=1
  [PASS] powershell-verify-read-only
         candidate names, sizes, mtimes and SHA-256 hashes compared before/after; no evidence written

RESULT VERIFY-PASS; 46 passed, 0 failed; ExitCode=0
  No build was started by this script.
  Candidate only: no installation. Active IID dataset and identity directory are not targets.
  PORTFOLIO DATABASE NOT ACCESSED. OVERALL IID READINESS REMAINS NOT READY.
```
## 4. What this run establishes — and what it does not

**Establishes.** On the operator's Windows PowerShell 5.1 host, the existing candidate at
`C:\iips-candidates\S4-R3-preflight-7ef0f10` re-verified read-only at the exact O3-admitted digest
`sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b`. Both authoritative layers passed
independently: the pinned build wrapper in `--verify-only` mode (16 checks, comparable manifest matched) and
`verify-installed-dataset` (31 checks, 0 failed, exit 0). All three admitted issuer input digests matched. The
driver started no build and wrote no evidence; the package was byte-, size- and mtime-identical before and after.

**Does not establish.** This is **not** an installation, **not** a runtime acceptance, and **not** a readiness
declaration. The verifier's target was the candidate package, not `C:\iips-data`. The active dataset, the identity
directory and the portfolio database were protected and untouched. It does not close `S4-R3`, does not lift
`STALE_STATEMENTS` / `STALE_DATA`, does not resolve `IDENTITY_SOURCE_MISSING`, does not close `L-041` or `L-042`,
and does not make Stage 4 complete or Stage 5 ready.

**Source rights remain `OPERATOR_ASSERTED`.** No independent or legal source-rights verification is claimed, and
no PDF-to-transcription verification is claimed. The O3 restrictions remain binding: local personal investment
analysis only; no commercial, production, SaaS or multi-user use; no redistribution.

**Identity rule preserved.** The candidate's identity is governed by the **authoritative comparable-fields
manifest check**, which passed (`comparable-manifest matches=1`), together with the exact content digest and the
8/8 content-file hashes. The `manifest-raw-byte-diagnostic` line reports `DIFFERENT_RAW_BYTES`
(`b0c888a8…` generated vs `b921741942…` recorded). That is a **diagnostic**, caused by absolute `inputs[].inputDir`
audit paths that `comparableManifest()` deliberately excludes — never a blocker, and never an identity criterion.
The two are distinct and are recorded as distinct.

## 5. Reconciliation against committed repository bytes (read-only)

Performed in the repository while recording; no host re-execution, no candidate rebuild.

| Cross-check | Result |
|---|---|
| Infosys `periods.csv` / `roster.json` SHA-256 vs transcript | **2/2 MATCH** committed bytes |
| Marico `periods.csv` / `roster.json` SHA-256 vs transcript | **2/2 MATCH** committed bytes |
| KEC `periods.csv` / `roster.json` SHA-256 vs transcript | **2/2 MATCH** committed bytes |
| Evidence ledger `digests.json` SHA-256 | **MATCH** `b41b0b10…`, 4131 bytes, **26** entries — equals `EVIDENCE_LEDGER_SHA256` |
| Recorded `runs/candidate-manifest.json` SHA-256 | **MATCH** `b921741942…`, 4464 bytes — equals `RECORDED_MANIFEST_SHA256` |
| Three admitted `inputDigest` pins in `build-s4-r3-candidate.ts` | **3/3 MATCH** the transcript's expected values |
| Candidate digest pin `S4_R3_CANDIDATE_DIGEST` | **MATCH** `sha256:bdfb2527…` |
| Pinned wrapper blob | **MATCH** `b807c7f227bbc99228d5ac78bcaa385c4c63b9cc` (repository `git hash-object`) |
| Pinned wrapper canonical SHA-256 | **MATCH** `5f3ad17b507c31e30220e96f5717a0b5fbb817b2def62417f91651acde2ba5f7`, 22435 bytes, 0 CRLF — equals the driver's `$script:WrapperSha256` |
| Driver script blob at `7ef0f10`, at branch head, and locally | **IDENTICAL** `6cbb280400303625260cedd41ee6bb0443869fdd` — the transcript's driver is the committed driver |
| Transcript `[PASS]` line count vs declared result | **46 = 46**; `[FAIL]` lines **0**; diagnostics **2**, excluded from the count by `Complete-Run` (`Class -eq 'check'`) |

**Counters that differ from the BUILD record are scope differences, not conflicts:**

- **46 vs 75.** The BUILD act reported `BUILD-VERIFY-PASS; 75 passed`. `-VerifyOnly` runs one preflight pass and no
  build stage; BUILD re-runs preflight after confirmation and adds build checks. Different modes, different totals.
- **`files=13` vs a 10-file dataset census.** The dataset directory holds 10 files; the package adds
  `verification/file-digests.json`, `verification/verification.json` and the optional
  `verification/windows-local-verification.json` written by the earlier BUILD. 10 + 3 = 13, and the driver's
  census explicitly tolerates exactly that optional file.
- **`ledgerSha256=6e4586b6…` vs pin `b41b0b10…`.** Two different ledgers over two different scopes, already
  resolved in §7 item 2 of the BUILD evidence document: the 26-entry committed evidence ledger (pinned, verified
  by `recorded-evidence-hashes`) and the 10-entry generated package ledger (reported by
  `recorded-ledger-and-evidence`). The host value equals the one recorded for the earlier BUILD on the same
  package. **Not re-investigated, not reconciled away, no pin changed.**

## 6. Discrepancies and observations — disclosed, not silently reconciled

The transcript is preserved unchanged. The following are reported separately, as required.

**D-1 — malformed hex strings on the `pinned-wrapper-sha256` detail line (transcript line 33).**
The `expected=` and `raw=` values on that line are
`5f3ad17b507c31e30220e96f5717a0b5f5b5fbb817b2def62417f91651acde2ba5f7` — **68 hex characters**, containing a
duplicated `b5f5` fragment. A SHA-256 is 64 characters. On the same line the `canonical committed-content sha256=`
value is the correct 64-character `5f3ad17b507c31e30220e96f5717a0b5fbb817b2def62417f91651acde2ba5f7`, and the
separate `wrapper-working-tree-raw-sha256` diagnostic also reports that correct 64-character value. The committed
driver prints `$script:WrapperSha256` (a 64-character literal, line 72) and a computed hash, so it cannot emit a
68-character string. **Assessment: a transcription/copy artefact in the supplied text, not a host measurement and
not a code defect.** It is preserved verbatim rather than corrected. It does not weaken the identity conclusion,
which rests on independent repository-side measurements: the wrapper blob `b807c7f2…` and canonical SHA-256
`5f3ad17b…` both match the committed pin exactly (§5). **No pin, constant or check was altered.** If the operator
can supply an unaltered capture of that line, it belongs in a later addendum.

**D-2 — one expected diagnostic line is absent from the supplied transcript.**
The committed driver emits `wrapper-line-ending-conversion` as a diagnostic immediately after
`pinned-wrapper-sha256` (line 427), unconditionally on this path. The transcript contains only two diagnostics and
omits it. **Assessment: the supplied capture appears to be missing that one line.** It is a `Class = 'diagnostic'`
entry, excluded from the passed/failed totals, so its absence does not affect `46 passed, 0 failed`. Recorded as
observed; nothing was inserted into the transcript to make it match the script.

**O-1 — the prompt directory differs from the script and repo root (observation, not a discrepancy).**
The prompt is `PS C:\iips-worktrees\S4-R3-preflight-dbb9545>` while the invoked script and `-RepoRoot` are under
`S4-R3-preflight-7ef0f10`. This is consistent with invoking a script by absolute path from another worktree.
The authoritative facts are the resolved ones: `git-worktree-root` = `C:/iips-worktrees/S4-R3-preflight-7ef0f10`
and `HEAD=7ef0f10…`, both PASS. The `dbb9545` worktree was neither used as the implementation baseline nor
modified by this record.

**No other conflict was found.** Every digest, count and path in the transcript that is reproducible from
committed repository bytes matched (§5).

## 7. S4-R3 status after this record

| Limb | Status |
|---|---|
| Candidate build and exact-digest verification | **COMPLETE** — built on the host at `7ef0f10`; digest `sha256:bdfb2527…` |
| Windows read-only candidate verification | **COMPLETE — `VERIFY-PASS`, 46/46, ExitCode=0**; wrapper 16/16; authoritative verifier 31/0 |
| Installation / replacement of the active dataset | **NOT PERFORMED.** Requires separate owner authorization and a governed replacement procedure |
| Freshness closure (`STALE_STATEMENTS` / `STALE_DATA`) | **OPEN** — unchanged for all three issuers |
| `G-6` quarterly data | **PARTIALLY DISCHARGED IN CANDIDATE** — operational closure still needs an authorized installation/acceptance act |
| `G-4` / `S4-R6` operating metrics | **OPEN** |
| `S4-R3-Infosys` newer source | **OPEN** |
| `R-1` / `R-2` host readiness and served-surface captures | **OPEN** — a candidate verifier run is neither of these |
| `L-041` / `L-042` | **OPEN** |
| Identity sources | **`IDENTITY_SOURCE_MISSING`** unresolved |
| Sector coverage | **3 of 13** measured |
| Source rights | **`OPERATOR_ASSERTED`** |
| `S4-R3` register row | **OPEN** |
| Stage 4 | **PARTIALLY COMPLETE** |
| Stage 5 | **NOT READY** |
| Overall IID readiness | **NOT READY** |

A repeat read-only verification strengthens the candidate-verification limb only. It adds no installation fact,
no freshness fact and no readiness fact.

## 8. Boundary confirmations for the recording session

| Boundary | Position |
|---|---|
| Windows execution from the Arena sandbox | **NOT PERFORMED** — the transcript is operator-supplied |
| Candidate rebuild or re-verification by IRR | **NOT PERFORMED** |
| Runtime root `C:\iips-data`, active dataset, identity directory | **NOT TOUCHED** |
| Portfolio database | **NOT ACCESSED** |
| Stage 2 identity provisioning | **NOT EXECUTED** |
| Admitted inputs, wrapper pins, ingestion implementation | **NOT CHANGED** |
| IPD or any other repository | **NOT MODIFIED** |
| PR #562 | **NOT MERGED, NOT CLOSED, NOT UPDATED** |
| Dataset contents / source excerpts / candidate archives on GitHub | **NOT PUBLISHED** |
| Windows worktrees | **NOT SYNCHRONIZED** — no fetch/pull/checkout/reset |

## 9. Cross-references

- Authoritative Stage 4 remaining-action register: `IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` §7.
- Current S4-R3 position: `IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md` §8.
- BUILD act on the same candidate: `IID-S4-R3-WINDOWS-HOST-BUILD-AND-VERIFICATION-EVIDENCE-2026-11-15.md`.
- Operator procedure authority: `IID-S4-R3-WINDOWS-POWERSHELL-LOCAL-BUILD-2026-11-14.md`. `-VerifyOnly` against an
  existing candidate is read-only and safe to repeat.
- Governing admission: `IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md`.
