# IID Stage 3 — Windows install and verify scripts: construction, validation and test evidence

**Work item:** Task 12 — operator scripts for installing and verifying the admitted three-bundle investment
fundamentals dataset on a Windows host.
**Branch:** `arena/94a53bb3-iips-review-recovered`
**Base at time of writing:** `b0d15335`
**Observed clock:** `2026-11-13T16:51:18Z`
**Dataset under test:** `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`

---

## 0. Read this first: what was executed and what was not

**Neither PowerShell script was executed anywhere. There is no PowerShell engine in this environment.**
That is the one unresolved blocker for this work item, and it is stated here rather than buried, because a
script that has never run has not been verified in the sense the acceptance criteria use that word.

Every attempt to obtain an engine failed, and each failure was observed rather than assumed:

| Route attempted | Result observed |
|---|---|
| `pwsh` on `PATH`, and a filesystem sweep for `pwsh`, `pwsh.dll`, `powershell`, `dotnet`, `wine`, `mono` | absent — nothing found outside a downloader shim |
| GitHub release asset `powershell-7.4.6-linux-x64.tar.gz` | HTTP 302 to `release-assets.githubusercontent.com`; that host returns HTTP `000` (TLS/connection failure). Outbound access is allowlisted and this host is not on it |
| npm `pwsh@0.3.0` | a **downloader**: its `bin/pwsh` is a shim that prints "Installation should have replaced this file with a symlink" and exits 1. No engine in the tarball |
| npm `@dsh-ops/pwsh-linux-x64`, `pwsh-linux-x64` | HTTP 404. Only a `win32-x64` runtime is published, which cannot run in this Linux sandbox |
| npm `node-powershell`, `powershell-utils`; PyPI `pwsh` | bindings and wrappers with no engine; PyPI `powershell` 404 |
| npm `tree-sitter-wasms@0.1.13` | 36 WASM grammars, **no PowerShell** |
| Building PowerShell from source | requires the .NET SDK from hosts that are not allowlisted |

So the scripts were **written against the real implementation**, then validated by every means available
short of execution, and the product-side behaviour they depend on was executed for real. Section 2 states
exactly which of those means proves what.

---

## 1. Deliverables

| Path | Bytes | Lines | sha256 (first 16) |
|---|---|---|---|
| `tools/windows/IID-STAGE3-WINDOWS-INSTALL.ps1` | 22 319 | 402 | `1faaaf7b19f4d988` |
| `tools/windows/IID-STAGE3-WINDOWS-VERIFY.ps1` | 29 112 | 487 | `c6d745aa3a2b10e6` |
| `iips-platform/src/investment/cli/verify-installed-dataset.ts` | 29 380 | 644 | `d24869a10ab4cbf5` |
| `iips-platform/tests/investment/verifyInstalledDataset.test.ts` | 33 552 | 595 | `e0505bb752fdef9f` |

`tools/windows/` is the existing house location for operator PowerShell scripts; the two files join
`diagnose-personal-portfolio.ps1` and `diagnose-broker-import-owner-context.ps1`.

The third file is not decoration. The verification script had to check the installed dataset through **the
actual exported reader and the actual runtime coverage API** — `readDataset`,
`investmentCoverageFromLocalDataset`, `computeInputDigest` — and there was no existing command that did that
and reported a machine-readable result. `verify-installed-dataset.ts` is that command: 32 checks, exit `0`
pass / `1` a check failed / `2` the dataset could not be read or the arguments were unusable, `--json` for a
parsed report. The fourth file is its permanent regression suite (29 tests).

Nothing else in the repository was modified. The two protected records
(`IID-STAGE-3-INVESTMENT-DATASET-READINESS-2026-11-13.md`,
`IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md`) are untouched.

---

## 2. Mandatory PowerShell rules — how each was validated

The rules are structural, so they were checked **structurally**: the scripts were parsed with the real
`tree-sitter-powershell` grammar (v0.26.6, `src/parser.c` + `src/scanner.c`) compiled against the vendored
tree-sitter runtime into a purpose-built AST inspector, and a checker evaluated the parse tree rather than
the text.

This matters. A first attempt at this checker used regular expressions over the file text and produced
**false positives on both scripts** — it found `exit` inside the string `'cli-exit-code'` and `git fetch`
inside a comment. Regex-over-prose cannot answer "is there an `else` clause in this program"; only a parse
tree can. The checker was therefore rewritten to classify *only the text of nodes the parser had already
identified*, and its own correctness was proven on three negative fixtures before it was allowed to certify
anything: a script whose `else` appears only in prose, one whose body is not a `try`, and one with a real
`else_clause`. Each was correctly reported as failing.

| Rule | How checked | INSTALL | VERIFY |
|---|---|---|---|
| R1 valid PowerShell syntax | parse tree has zero `ERROR` and zero `MISSING` nodes | **PASS** (8 852 nodes) | **PASS** (13 291 nodes) |
| R2 entire executable logic in one top-level `try/catch` | the single executable body node *is* a `try_statement` with ≥1 `catch_clause` | **PASS** (3 catch, 2 nested) | **PASS** (5 catch, 4 nested) |
| R3 no `else` / `elseif` / `finally` | count of `else_clause`, `elseif_clause`, `finally_clause` nodes | **PASS** (0 / 0 / 0) | **PASS** (0 / 0 / 0) |
| R4 no `exit`, nothing that closes the terminal | `flow_control_statement` nodes inspected by text; command names checked against a session-killing vocabulary | **PASS** (2 flow-control, both `return`; 0 killing) | **PASS** (2, `continue`+`return`; 0 killing) |
| R5 no automatic Git synchronisation | zero `git` command invocations in the tree | **PASS** (0) | **PASS** (0) |
| R6 no portfolio database access | zero database commands; zero code lines opening the store | **PASS** (0 / 0) | **PASS** (0 / 0) |
| R7 no unauthorised filesystem mutation | zero mutating commands (`New-Item`, `Remove-Item`, `Move-Item`, `Set-Content`, `Out-File`, `Export-Csv`, `mkdir`, `rd`, `del`, `cp`, `mv`, …) and zero `[System.IO.File\|Directory]::(Write\|Delete\|Move\|Copy\|Create\|Append)` calls | **PASS** (0 / 0) | **PASS** (0 / 0) |
| R8 control returns to the session | last line is `}` and the program contains no `exit` | **PASS** | **PASS** |

**Commands invoked** — the complete vocabulary, from the parse tree, neither script reaching outside it:

* INSTALL (15): `Add-Check`, `ForEach-Object`, `Get-ChildItem`, `Get-Command`, `Get-Date`, `Join-Path`,
  `New-Object`, `Out-String`, `Read-Host`, `Resolve-Path`, `Resolve-RepoRoot`, `Split-Path`, `Test-Path`,
  `Where-Object`, `Write-Host`.
* VERIFY (16): `Add-Check`, `ConvertFrom-Json`, `ForEach-Object`, `Get-ChildItem`, `Get-Command`,
  `Get-Content`, `Get-Date`, `Get-FileHash`, `Join-Path`, `New-Object`, `Resolve-Path`, `Sort-Object`,
  `Split-Path`, `Test-Path`, `Where-Object`, `Write-Host`.

Not one is mutating. `Get-FileHash` is the only hashing primitive and it reads.

R7 for the INSTALL script needs one qualification that the static count cannot express: with `-Install` and
the typed confirmation the script *does* cause a dataset to be published. It causes that by invoking the
authoritative writer and nothing else — it never creates, deletes, renames or cleans a directory itself, not
even the staging area (which the writer creates as a *sibling*, `…dataset.iips-staging`). The static result
is "this script contains no filesystem mutation", and the design behind it is "all publication and all
recovery is the writer's act".

**Install script behaviour, as written** (each item is a rule from the work order, and each is implemented as
a gate rather than a comment):

* default run is a **read-only preflight**; nothing is invoked and nothing is written;
* installation needs `-Install` **and** a case-sensitive typed phrase, `INSTALL IID STAGE 3`, read with
  `Read-Host` and compared with `-cne`; any other phrase produces `ABORTED-CONFIRMATION`;
* all three admitted bundles are passed in **one** invocation, as three `--input` arguments to a single
  `node …/ingest.ts` call — never three runs;
* it **refuses** if `<DataRoot>\investment\dataset` already exists, and refuses if any precondition failed
  (`REFUSED-PRECONDITIONS`), before the CLI is reached;
* it never passes `--allow-errors`. The string appears exactly once in the file, at line 45, inside the prose
  promise that it is never passed; it appears in **zero** argument arrays;
* failed preconditions and ingestion errors stop it safely: `FAILED-INGESTION`, `FAILED-DIGEST-MISMATCH`,
  `FAILED-EXCEPTION`, each with control returned to the session and a result object left in
  `$global:IIDStage3Install`.

**Verify script behaviour, as written:** two independent layers. Layer 1 is pure PowerShell — it reads
`manifest.json`, re-hashes every declared file with `Get-FileHash -Algorithm SHA256`, and checks the digest,
the population, the provenance and the derived coverage report without importing any product code. Layer 2
invokes `verify-installed-dataset.ts --json` with the full expectation set and re-emits each of its 32 checks.
`-SkipProductHarness` runs Layer 1 alone. Both layers must agree for the result to be `PASS`; disagreement is
`FAIL-LAYER1`, `FAIL-LAYER2` or `FAIL-BOTH-LAYERS`. No report file is ever written.

---

## 3. Test matrix — what was actually executed

All of this ran, for real, in this environment. The dataset used is the **authoritative three-bundle dataset
published by the real writer from the real admitted bundles** in `evidence/real-issuer/`, installed into a
scratch data root laid out as a Windows host would be (`<root>/investment/dataset`).

### T-A — the exact command line the install script builds

The argument array the script assembles was reconstructed and executed verbatim:

```
node <repo>/iips-platform/node_modules/tsx/dist/cli.mjs \
     <repo>/iips-platform/src/investment/cli/ingest.ts \
     --input <repo>/evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input \
     --input <repo>/evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/ingest-input \
     --input <repo>/evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input \
     --dataset-dir <root>/investment/dataset
```

**exit 0**, stdout 37 lines, **stderr 0 bytes**, 10 files published, **0 markers** left behind.

### T-A2 — the install script's stdout parsing, applied to that real output

The script's `Where-Object` patterns were applied to the genuine CLI output:

| Pattern the script uses | Matched | Extracted |
|---|---|---|
| `^datasetVersion\s+(\S+)` | 1 line | `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83` |
| `^recovery\s+` | 0 lines | reported as "none — no interrupted publication to resolve" |
| `^completed\s+` | 1 line | `completed        3/13 sectors measured` |

The script's post-run checks therefore evaluate as: `cli-exit-code` PASS, `cli-stderr-empty` PASS,
`observed-dataset-version` PASS (observed `-ceq` expected), `sectors-measured` 3/13, `dataset-published`
PASS, `markers-cleared` PASS → result `INSTALLED`.

### T-C — Layer 1 of the verify script, mirrored

Every comparison Layer 1 performs was executed in the same order over the same files by a faithful mirror,
because the PowerShell engine is unavailable. This validates Layer 1's *semantics* — that each claim it makes
about a correctly installed dataset is true of a real one, and that the comparisons are the right ones
(bare-hex lowercase digest comparison against `Get-FileHash` output lowercased, bundle name taken from the
*parent* of `ingest-input`, declared files + `manifest.json` + derived `coverage-report.json`, annual and
quarterly counted via `period.periodType`).

**23 / 23 PASS.** The mirror's check ids were diffed against the script's own Layer-1 ids: **22 of 23 match
one-to-one in the same order.** The two differences are explained and are not gaps — the script additionally
emits a `repo-root` prerequisite check (the mirror is handed the target directly and has no repository to
locate), and the mirror additionally emits a `layer1-read-only-mirror` self-attestation (the script needs no
such attestation because it contains no write at all, and its read-onlyness is proven by T-F instead).

Results, including: 8 of 8 declared files re-hash to the recorded sha256; `datasetVersion`
`-ceq` `contentDigest`; the combined digest equals the admitted value; exactly 10 files on disk with none
unexpected and none absent; no subdirectory; 3 issuers with the three admitted CINs; 3 distinct sectors with
each issuer tied to its own (Infosys→Technology, Marico→Consumer, KEC→Industrials); 9 ANNUAL of 9 periods and
0 QUARTER; 0 recorded issues; 3 provenance entries naming exactly the admitted bundles; `sourceRights`
`OPERATOR_ASSERTED`; derived coverage report agreeing on version and measuring 3 sectors.

### T-D — Layer 2 of the verify script: the exact argv, executed

41 argv elements, assembled exactly as the script assembles them (`--data-dir`, `--dataset-dir`, `--json`,
every `--expect-*`, `--as-of`):

**exit 0, stderr 0 bytes, `result PASS`, 32 passed, 0 failed, `exitCode 0`.**

`ConvertFrom-Json` on that output yields the report the script then re-emits check by check. Notable checks:
`reader-verifies` (the product's own `readDataset` verified every digest and recomputed the content digest),
`provenance-input-digests` "3/3 recorded input digest(s) recompute exactly", `provenance-bundle-bytes` "3
bundle(s) re-hashed from the bytes on disk, 0 mismatch(es)", `coverage-api-reads`
(`investmentCoverageFromLocalDataset` answered for `asOf 2026-11-13`: 3 of 3 issuers covered),
`coverage-usable-methods` (Consumer `G1_ENABLED` usable 3; Industrials `G2_PARTIAL` usable 2; Technology
`G2_PARTIAL` usable 2), `coverage-outstanding-listed` (10 unmeasured sectors listed explicitly),
`coverage-identity-disclosure` (`identitySourcesAvailable false` — a disclosure, never a gate),
`read-only-attestation`.

### T-E — failure matrix

| # | Injected condition | Observed | Script result |
|---|---|---|---|
| E1 | dataset already exists at the target | `Test-Path` true ⇒ the `dataset-absent` check fails | `REFUSED-PRECONDITIONS`; the CLI is never invoked |
| E1b | *(control)* re-run the CLI directly over an existing dataset | exit 0 and it **replaces** the dataset | proves the script-level refusal is load-bearing, not decorative |
| E2 | an admitted bundle directory missing | reached the CLI in a control run: exit 1, `roster.json is required in …`, **dataset directory NOT created** | `REFUSED-PRECONDITIONS` before that point |
| E3 | wrong expected digest | Layer 2 exit 1, `result FAIL`, exactly one failing check `expected-version` with `FOUND`/`EXPECTED`; Layer 1 `combined-digest` fails on the same comparison | `FAIL-BOTH-LAYERS` |
| E4 | one space appended to `issuers.json` in a copy | Layer 2 exit 2, `DatasetIntegrityError: dataset file digest mismatch (issuers.json)`; Layer 1 mirror exit 1, "7 of 8 re-hash, mismatched: issuers.json" — **two independent layers agree** | `FAIL-BOTH-LAYERS` |
| E5 | a **bare empty** `investment/dataset` | Layer 2 exit 2 `DatasetMissingError`; Layer 1 `manifest-present` FAIL. For contrast, the shipped readiness diagnostic reports the *same* directory `[ok] fundamentals-dataset — irr-owned-operational`, reason `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED` | refused — presence alone can never pass |
| E6 | `.iips-previous` marker present | reported as `previous PRESENT`, exit 1; the marker is **still there afterwards** | reported, never resolved |
| E7 | target that is not a dataset directory | exit 2 with no report for a file at the path, for a path inside the store domain, and for a wrong parent segment | `REFUSED-TARGET` before any read |
| E8 | an ingestion error (a mutated copy: sector lowercased) | CLI exit 1, 704 bytes of stderr, **dataset directory NOT created**, 0 markers | `FAILED-INGESTION`; nothing created |
| E9 | `--allow-errors` | 1 occurrence in the install script, all of it prose; **0 occurrences in any argument array** | never passed |
| E10 | a single-bundle run over the installed three-issuer dataset | CLI exit 1: "refusing to replace an existing dataset with a run that would silently remove 2 issuer(s) and 2 …"; 3 issuers still present | even if the script's refusal were bypassed, the product refuses to shrink the dataset |

### T-F — non-destructive proof

Snapshot → run every read-only operation → snapshot, inside one shell so the comparison is real:

* BEFORE tree digest `01413d982e1f7820e33e6355e9c16f2b`, directory mtimes `1794587594,1794587594`, 13 entries.
* Ran: Layer 2 harness (exit 0, 32/32), Layer 1 mirror (exit 0, 23/23), and the shipped `iid-readiness`
  diagnostic (exit 0) for contrast.
* AFTER tree digest `01413d982e1f7820e33e6355e9c16f2b`, directory mtimes `1794587594,1794587594`, 13 entries.
* **Tree digest identical, entry list identical, directory mtimes unchanged, 0 markers created.** The
  verifier's own `read-only-attestation` check independently reported the same.

An earlier attempt at this proof compared a digest captured in a previous shell invocation, which had been
lost; the result was correctly discarded and the test re-run inside a single shell. The numbers above are
from the valid run.

### T-G — the two guards agree

The PowerShell Layer-1 guard and the TypeScript guard were transcribed faithfully and evaluated over the same
nine paths, including the real host path `C:\iips-data\investment\dataset`, the portfolio store path, a
similarly named directory, a wrong parent segment, a nested store-domain path and two prefixes.

**9 / 9 agree** on accept-versus-refuse. They sometimes name different reasons for the same refusal (the
PowerShell side evaluates its domain rule last and reports it, the TypeScript side reports the first rule
that fires); the decision is identical in every case, which is what the cross-layer comparison requires.

---

## 4. Two defects found and fixed while testing

Both were found by executing, not by reading. Both would have been wrong on the Windows host.

**D-1 — the target guard split paths on `sep` only.** On Linux, `resolve('C:\iips-data\investment\dataset')`
produces one opaque segment, so the guard refused the real host path with a misleading reason — and did so
only on the platform where nobody runs it, which is exactly how such a bug survives. `ingest.ts` already
establishes the precedent of normalising separators so that a bundle's digest is identical on both platforms;
the guard now splits on both separators, making its refusal identical on Windows and Linux. This is also what
makes the Linux testing above meaningful evidence for the Windows host rather than a different program.

**D-2 — the guard named a persistence technology, breaching the IID module boundary.**
`tests/investment/constraints.test.ts` asserts that no file under `src/investment` matches
`/sqlite|better-sqlite3|node:sqlite/i`. The first version of the guard blacklisted `.sqlite` and `.sqlite3`
extensions, and the full suite failed: `cli/verify-installed-dataset.ts must not touch SQLite`. The published
boundary test was **not** weakened. The guard was rewritten to be structural instead — derived from the
product's own `FUNDAMENTALS_BOUNDARY` constants (`defaultSubdir` `investment`, `datasetSubdir` `dataset`), so
a target must be a *directory* whose last two path segments are exactly those two names. That single rule
refuses the portfolio store (a file, whatever its extension), `dataset-old`, `dataset-backup`, a wrong parent
segment, and anything inside the store domain — strictly more than the blacklist refused, with no forbidden
vocabulary. Both scripts' guards were then aligned to it (T-G).

Three further failures during this work were bugs in the *new tests*, not in the product, and were fixed as
such: a fixture written before its parent directory existed (`ENOENT`); a "wrong parent segment" case whose
parent segment was in fact `investment`; and a case that appended a second `--expect-annual-periods` flag
which the argument parser ignores, because it resolves each flag at its **first** occurrence — so the test
passed for the wrong reason. That last one is a real property of the CLI's argument parsing and is now
documented in the test rather than papered over.

---

## 5. Permanent regression coverage

`iips-platform/tests/investment/verifyInstalledDataset.test.ts` — **29 tests, 29 pass, exit 0**, in six
groups:

1. *a correctly installed admitted dataset* — every check passes and returns 0; the admitted digest, three
   issuers, three sectors and nine annual periods are reported; each issuer is tied to its own sector;
   human-readable mode prints the same checks without `--json`.
2. *presence alone can never pass* — a bare empty directory is refused with exit 2 **where the shipped
   readiness diagnostic reports `[ok]`**; a tampered file is caught by the reader; a wrong digest fails exactly
   one check; an unexpected extra file is named; a fourth expected issuer fails the population check; wrong
   sector and period expectations are enforced.
3. *provenance is checked with the product's own function* — a single-bundle dataset carries no
   `manifest.inputs` and fails a three-bundle expectation; recorded input digests recompute exactly and every
   bundle byte is re-hashed; **a bundle that is no longer readable is disclosed as NOT VERIFIED rather than
   silently passed or failed**; a provenance entry naming an unadmitted bundle is reported.
4. *the runtime coverage API is exercised, not reimplemented* — the coverage read answers and agrees with the
   manifest; the served class is `OPERATOR_SUPPLIED`; three sectors measured with usable methods each; ten
   unmeasured sectors listed; absent identity sources disclosed and never a failure.
5. *target guard, markers and read-only behaviour* — a non-dataset target refused with exit 2 before any
   read; a **file** at the target refused whatever its extension; the store domain refused; the conventional
   Windows layout `C:\iips-data\investment\dataset` accepted, with refusal distinguished from absence;
   markers reported and **never resolved**; the run read-only by an independent tree fingerprint;
   `sourceRights` reported verbatim as an attestation with its limitation attached.
6. *argument handling* — with no expectation flags it still verifies integrity and invents no unasserted
   checks; `--as-of` reaches the coverage read; `--dataset-dir` must agree with `--data-dir` or the
   disagreement is caught rather than passed.

**Full suites, after these changes:**

| Suite | Result |
|---|---|
| `npm run test:iid` (platform) | **949 / 949 pass, 0 fail, exit 0** (was 920 at `b0d15335`; +29) |
| `npm test` (platform) | **678 / 678 pass, 0 fail, exit 0** |
| `npm run typecheck` (platform) | clean, 0 errors |
| `constraints.test.ts` (IID boundary, incl. the SQLite-vocabulary rule) | 6 / 6 pass |
| `sectorValidation` / `multiInputIngestion` / `publicationAtomicity` | 44 / 41 / 28 pass, each exit 0 |

---

## 6. Exact commands for the Windows host

Run from an ordinary PowerShell session. Neither script closes it; both return control on success and on
failure. Nothing is synchronised to Git by either script.

**Preflight (read-only, the default — run this first):**

```powershell
cd C:\path\to\iips-review-recovered
.\tools\windows\IID-STAGE3-WINDOWS-INSTALL.ps1 -RepoRoot C:\path\to\iips-review-recovered -DataRoot C:\iips-data
```

**Install (only after the preflight passes; it will ask for the typed phrase `INSTALL IID STAGE 3`):**

```powershell
.\tools\windows\IID-STAGE3-WINDOWS-INSTALL.ps1 -RepoRoot C:\path\to\iips-review-recovered -DataRoot C:\iips-data -Install
```

**Verify (read-only):**

```powershell
.\tools\windows\IID-STAGE3-WINDOWS-VERIFY.ps1 -RepoRoot C:\path\to\iips-review-recovered -DataRoot C:\iips-data -AsOf 2026-11-13
```

**Verify with Layer 1 only, no Node needed:**

```powershell
.\tools\windows\IID-STAGE3-WINDOWS-VERIFY.ps1 -DataRoot C:\iips-data -SkipProductHarness
```

Result objects are left in `$global:IIDStage3Install` and `$global:IIDStage3Verify` for inspection, e.g.
`$global:IIDStage3Verify.Checks | Where-Object { -not $_.Ok }`. Both scripts write to the console only; no
report file is created.

Expected on a correct host: preflight `PREFLIGHT-ONLY`; install `INSTALLED` with
`DatasetVersion sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`; verify `PASS`.
The counts that were measured here are Layer 2's **32 / 32** (executed, T-D) and the **22** Layer-1
comparisons the mirror shares with the script (executed, T-C). The script's Layer 1 emits those 22 plus its
own `repo-root` prerequisite — **23 checks** — and Layer 2 emits its 32 re-emitted harness checks plus
invocation checks (`harness-present`, `tsx-runner-present`, `node-available`, `harness-exit-code`,
`harness-report-parsed`, `harness-read-only-attestation`). Those Layer-1 and invocation counts are read from
the source, not from a run; the first host execution is what will confirm them. If the dataset already exists, install reports `REFUSED-PRECONDITIONS` and
does not run the writer — remove nothing by hand; that decision belongs to the operator, not to the script.

---

## 7. What remains unproven

Stated plainly, because the acceptance criteria require verification and not the appearance of it:

1. **The two `.ps1` files have never been executed.** Their syntax is proven against a real PowerShell
   grammar and their structure against the mandatory rules; their semantics were reasoned through and their
   product-side dependencies were executed for real. PowerShell's *runtime* behaviour — parameter binding,
   `Read-Host` interaction, `$ErrorActionPreference` propagation, `Get-FileHash` output shape on Windows,
   backslash path handling in the actual host shell — is unverified here. **A first run on the host is still
   required, and its output is the evidence that closes this item.**
2. **Win32 filesystem behaviour is not exercised.** Publication atomicity and marker recovery were proven on
   the platform the suite runs on (see `publicationAtomicity.test.ts`); `MoveFileEx` semantics are reasoned
   about in `ingestion/writer.ts`, not measured.
3. **The dataset is still not installed on the host.** Nothing at `C:\iips-data\investment\dataset` was
   touched, created or inspected from this environment, by instruction. Blocker `S3-B3` is unaffected by this
   work item: these scripts are the means of closing it, not the closing of it.
4. **`identitySourcesAvailable` remains `false`.** Disclosed by both layers as a disclosure, never a gate.
