# W03 — Reports Inventory: Read-Only Method and Windows Collector

| | |
|---|---|
| Date | 2026-11-13 |
| Repository | `ramkivs/iips-review-recovered` (IRR) |
| Baseline | IRR `main` `08411bcd6d782a601fe5c82cc9983d076831148d` |
| Roadmap | `iips-production-market-data`, `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`, work item W03 |
| Deliverable | A tested, read-only Windows collector for the Reports half of W03 |
| Windows execution | **Not performed.** Built and tested in a Linux sandbox against synthetic NP-04 stores. PowerShell was not available there: the `.ps1` has been checked statically only. |
| W03 | **Not complete.** The portfolio half rests on the host capture of revision 1. The Reports half is complete only when the collector has run on the host and its sanitized inventory has been reviewed. |

## 1. Why the previous collection returned `UNKNOWN / UNKNOWN / []`

The earlier attempt was not a repository utility: no Reports collector exists on IRR `main` at the baseline.
Its result is explained by the two facts below. Neither was a host fault.

**1. Every existing Reports read path opens NP-04 for writing.**

| Path | What it does to NP-04 |
|---|---|
| `frontend/server/reports/persistence-port.ts` `loadAuthoritativeNp04Persistence()` | `openDatabase({ path, createDirectory: true, migrate: true })`: creates the directory if absent, creates or verifies the migration ledger, applies pending migrations. |
| NP-04 `openDatabase` (any options, including `migrate: false`) | Executes `PRAGMA journal_mode = WAL` on every open. |
| `GET /api/reports…` through `reports-transport.ts`, the IID artifact service, `persist-real-reports.ts --verify` | All reach NP-04 through the loader above. |

So "load the reports" was never a read-only operation, and a collector that is forbidden to initialize or
migrate cannot use any of them.

**2. A read-only SQLite connection is not read-only toward a WAL database.**

Measured in the sandbox (Node 22, built-in SQLite) on a closed NP-04 store whose directory held one file:

| Step | Files in the store directory |
|---|---|
| Before | `np04.db` |
| After opening with `readOnly: true` and running one `SELECT` | `np04.db`, `np04.db-shm`, `np04.db-wal` |
| After closing that connection | `np04.db`, `np04.db-shm`, `np04.db-wal` (left behind) |

A read-only connection has to build the wal-index, so it creates `-shm` (and `-wal`) beside the database. The
alternative, opening the file as `immutable`, writes nothing but ignores the WAL: every artifact committed
since the last checkpoint is invisible, and the result looks like a valid, smaller inventory. A helper limited
to "do not write" therefore has no safe way to read a live NP-04 through SQLite, and reporting nothing was the
correct behaviour for it.

This measurement is a sandbox observation of SQLite's documented behaviour. It was not repeated on Windows.

## 2. The read-only method: `VERIFIED_PRIVATE_COPY`

SQLite never opens the NP-04 files. The collector:

1. reads `np04.db` and, when present, `np04.db-wal` **as plain bytes with read access only**, in the order
   main, wal, main, wal;
2. accepts the pair only if both reads of each file are byte-identical and neither size nor modification time
   moved. A commit or a checkpoint inside the window changes at least one of the four reads, so the attempt is
   repeated (default 3 attempts, 500 ms apart; limits 5 and 10 000 ms). A store that never holds still is
   reported `SOURCE_CHANGED_DURING_COPY`; it is never read torn;
3. writes those bytes to a **private copy** under the run's `LOCAL-ONLY-DO-NOT-PUBLISH` directory;
4. opens **the copy** with Node's built-in SQLite. SQLite replays the copied WAL there, exactly as it would
   after a crash, so committed-but-uncheckpointed artifacts are visible. The copy is opened with
   `query_only` and checked with `quick_check`;
5. reads artifact **metadata** only. The report content column is never selected; the query reads its length;
6. removes the copy and re-describes the source to record whether its bytes still equal what was copied.

What this guarantees toward NP-04: no SQLite connection, no lock taken through SQLite, no `-shm` opened or
created, no migration, no ledger write, no directory or file created. The store directory is the same set of
files with the same bytes before and after.

What it does not do:

- It does not stop the IRR transport or any writer, and it does not need them stopped.
- It refuses a store that has a `-journal` file beside it (`ROLLBACK_JOURNAL_PRESENT`): that is a different
  journal mode or an interrupted transaction, and it is not NP-04's normal state.
- It refuses a file larger than 256 MiB (`STORE_TOO_LARGE_FOR_SAFE_COPY`) instead of holding it in memory.
- It does not validate report content, and it does not call the Reports API.

## 3. What is enumerated

One table holds every persisted report: NP-04 `governed_artifacts`. Columns read: `report_id`, `chain_id`,
`tenant_id`, `user_id`, `report_key`, `report_type`, `portfolio_id`, `parameters_json`, `schema_version`,
`artifact_version`, `supersedes_report_id`, `generated_at`, `provenance_json`, `created_at`, and
`length(canonical_payload)`. The migration ledger (`schema_migrations`) is read for ordinal, name and checksum.

### 3.1 Report types and their producer class (a statement about the repository, not about the host)

| Report type | Producer class | Basis |
|---|---|---|
| `Executive`, `Portfolio Summary` | `TRANSIENT_UNLESS_OPERATOR_PERSISTED` | Computed per request by the certified baseline. Persisted only by `persist-real-reports.ts --commit`. A test pins this set to what `computeCertifiedPlatform()` actually produces. |
| `Investment Committee`, `Allocation Recommendation`, `Sector Dashboard` | `DECLARED_NOT_PRODUCED` | Declared in the reporting engine's type union; the certified baseline does not produce them. |
| `investment.company-assessment`, `investment.holding-disposition`, `investment.change-report` | `PERSISTED_ONLY` | IID artifacts; they exist only as persisted artifacts. |
| anything else found in the store | `UNREGISTERED` | Published as `UNREGISTERED_TYPE_n`; the stored name stays local. |

### 3.2 The four states the roadmap asks for

| State | Where it appears | Meaning |
|---|---|---|
| **Persisted** | per type `PERSISTED`, with versions, chains, head version range, schema versions | Rows read and structurally valid. |
| **Transient** | per type `TRANSIENT_ONLY` | The store was read, holds no row of this type, and the repository computes this type per request. A transient report leaves nothing on disk, so this is a source-derived classification and is labelled so. |
| **Unavailable** | store `UNAVAILABLE` (`NOT_CONFIGURED`, `PATH_NOT_ABSOLUTE`, `STORE_FILE_ABSENT`, `SCHEMA_NOT_INITIALIZED`); every type `UNAVAILABLE` | There is no initialized store to read. Nothing is created to change that. |
| **Unreadable** | store `UNREADABLE` (e.g. `SOURCE_READ_REFUSED`, `SOURCE_CHANGED_DURING_COPY`, `SQLITE_MODULE_UNAVAILABLE`, `SNAPSHOT_INTEGRITY_CHECK_FAILED`, `SCHEMA_UNRECOGNISED`); or per row, counted by defect | The store or a row exists but could not be read safely. Unreadable rows are counted, never repaired and never counted as persisted. |

`NOT_PRESENT` is the fifth per-type value: the store was read, has no row of the type, and the type is not
computed per request. A read store with zero rows is a valid inventory (`INVENTORY_COLLECTED`), distinct from
an unavailable one.

### 3.3 Versions

Per type: persisted versions (rows), chains, broken chains (versions that do not run 1..n with matching
supersession links), the minimum and maximum head `artifact_version`, the distribution of `schema_version`, and
the distribution of provenance version labels (`modelVersion`, `datasetClass` and similar) when the value is a
short version-like token. Any other value is published as `VALUE_WITHHELD`.

## 4. Reconciliation against the captured revision

The collector reads three facts from the LOCAL exact capture (`exact-owner-bound-portfolio-capture.json`):
portfolio id, revision, provenance digest. The file is read in place; it is not copied and none of the three is
published. With `-ExpectedCaptureSha256` the file is used only if its SHA-256 equals the digest recorded in
the sanitized capture summary.

The persisted model supports exactly this linkage, and nothing more is asserted:

| Persisted evidence | Present in |
|---|---|
| A portfolio id inside the artifact scope | `hd:<portfolio>/<security>` (held position), `hc:<portfolio>/…` (portfolio or candidate), a plain `portfolio_id` |
| `provenance.portfolioRevision` (integer) | `investment.holding-disposition` only |

| Linkage class | Assigned when |
|---|---|
| `PORTFOLIO_AND_REVISION_MATCH` | The scope names the captured portfolio **and** the artifact records the captured revision. |
| `PORTFOLIO_MATCH_OTHER_REVISION` | Same portfolio, a different recorded revision. |
| `PORTFOLIO_MATCH_REVISION_NOT_RECORDED` | Same portfolio, no integer revision recorded. |
| `OTHER_PORTFOLIO_REFERENCE` | The scope names a different portfolio (including the certified reference portfolio). |
| `NO_PORTFOLIO_REFERENCE` | Issuer scope, change-report scope, or a candidate without a portfolio. A revision number alone establishes nothing. |
| `NOT_EVALUATED` | No accepted capture was supplied. |

Three limits follow from the model and are stated in the output:

- **No stored field carries the IPD provenance digest.** The collector counts artifacts whose provenance
  contains the captured digest verbatim; with the current producers that count is expected to be 0, and 0 is
  reported as 0, not as a mismatch.
- **The CSIP reports (`Executive`, `Portfolio Summary`) record no portfolio revision at all.** When persisted
  they are scoped to the certified reference portfolio, so they classify as `OTHER_PORTFOLIO_REFERENCE`.
- **A match shows what the artifact records.** It does not show that the artifact was computed from the
  captured holdings. Nothing is inferred from time, type, issuer or holdings overlap.

The roadmap acceptance "counts reconcile to captured revision" is therefore answered for Reports by the
linkage table: how many persisted artifacts record the captured portfolio and revision, how many record
something else, and how many record no portfolio at all. If the host holds no artifact for revision 1, the
reconciled count is 0 and that is the finding.

## 5. Output and privacy

```
<root>\<run>\
  LOCAL-ONLY-DO-NOT-PUBLISH\
    README-LOCAL-ONLY.txt
    reports-inventory-detail.json     per artifact: report id, chain id, type, scope token, versions,
                                      instants, linkage class. No content, no owner identifiers.
  SANITIZED-INVENTORY\
    w03-reports-inventory.json        the publishable inventory
    w03-reports-inventory.md          the same, readable
```

Default root: `%LOCALAPPDATA%\IIPS\w03-reports-inventory`. The root must be outside every git working tree and
must not share a directory tree with the NP-04 store; both are refused before anything is read.

The sanitized inventory holds counts, closed-vocabulary codes, version labels, stored instants, the ledger
entry, and SHA-256 digests and sizes of the store files. It never holds a report id, chain id, scope token,
portfolio id, issuer or security id, owner identifier, path or report content. Before the two files are
written, a leak guard searches them for every identifier read from the store, the store path, the capture path
and the output root; a hit aborts the run with exit code 70 and nothing is published.

Two disclosures to be aware of before publishing:

- The digests of the store files identify one exact state of the store. They reveal nothing about its content.
- Rows of **every** owner partition in the store are counted. The count of distinct owner partitions is
  published; the owners are not.

`evidenceEligibility` is `HOST_INVENTORY_SUBJECT_TO_REVIEW` at best. It is `NOT_EVIDENCE_NOT_A_WINDOWS_HOST`
off Windows and `NOT_EVIDENCE_SYNTHETIC_CAPTURE` when the capture is a synthetic one. It is never an acceptance.

## 6. Running it on the Windows host

From the IRR checkout, in the same kind of session the IRR transport is started from (so the same settings
are in effect):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\windows\collect-reports-inventory.ps1 -ExpectedCaptureSha256 <exact-capture SHA-256 from the sanitized capture summary>
```

Preflight without reading or writing anything: add `-ValidateOnly`.

Requirements: Windows, Node.js 22.9 or newer, `frontend` dependencies installed (`npm ci`; the script reports
this and installs nothing). For Node 22.9–22.12 the script adds `--experimental-sqlite` for its own process.
The IRR transport and IPD may be running or stopped.

The script prints setting **names** and whether each is defined, never a value. `IIPS_NP04_DATABASE_PATH`
is read by the CLI from the session environment and from `.env.local` (repository root, then `frontend`), the
same sources and order as `npm run server:dev`. If the host supplies it another way, define it in the session
the same way before running; the script sets nothing.

| Exit | Outcome | Sanitized inventory written |
|---|---|---|
| 0 | `INVENTORY_COLLECTED` | yes |
| 2 | `CONFIGURATION_INVALID` | no; nothing read |
| 3 | `STORE_UNAVAILABLE` | yes, with the reason |
| 4 | `STORE_UNREADABLE` | yes, with the reason |
| 5 | `CAPTURE_INPUT_REJECTED` | yes, without reconciliation |
| 15 | `OUTPUT_WRITE_FAILURE` | no |
| 70 | `INTERNAL_ERROR` | no |

Publish only the two files under `SANITIZED-INVENTORY`.

## 7. Files

| Path | Role |
|---|---|
| `tools/windows/collect-reports-inventory.ps1` | Operator entry point. Checks prerequisites, selects the capture by digest, runs the CLI, exits with its code. |
| `frontend/server/reports/inventory/collect-reports-inventory.ts` | CLI: arguments, output-root checks, output files, exit codes. |
| `frontend/server/reports/inventory/reportsInventory.ts` | Core: verified private copy, metadata read, validation, aggregation, linkage, sanitized inventory, leak guard. |
| `frontend/server/reports/inventory/reportsInventory.test.ts` | Method and model tests (53). |
| `frontend/server/reports/inventory/collectReportsInventoryCli.test.ts` | CLI tests against synthetic stores (16). |
| `frontend/server/reports/inventory/collectReportsInventoryScript.test.ts` | Static contract tests of the PowerShell entry point (22). |
| `frontend/server/reports/inventory/testing/np04Fixture.ts` | Test fixture only: builds a synthetic NP-04 store with the pinned NP-04 package. Never imported by the collector. |
| `frontend/tsconfig.reports-inventory.json` | Typecheck scope for the inventory files. |
| `frontend/package.json` | Two scripts added: `reports:inventory`, `typecheck:reports-inventory`. No dependency change. |
| `.gitignore` | Second barrier for the local-only file names. |

No existing source file is modified. The collector imports no NP-04 package code and no Reports persistence
code; from the existing server it uses only `resolveReportsOwnerContext` to count how many rows belong to the
declared Reports owner.

## 8. Verification performed (sandbox, 2026-11-13)

| Check | Result |
|---|---|
| `npx vitest run server/reports/inventory/` | 3 files, 91 tests, 91 passed |
| `npm run typecheck:reports-inventory` | exit 0 (also clean for the inventory files with `--noUnusedLocals --noUnusedParameters`) |
| `npm run typecheck`, `npm run typecheck:replay-server` | exit 0 |
| Full suite `npm run test:ci`, then `node .ci/assert-tests.js` | 203 test files, 3010 tests: 3009 passed, 1 skipped, 0 failed; guard OK. The suite rewrites two tracked files under `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/` (existing behaviour); they were restored and are not part of this change. |
| CLI through the installed runner on Node 22.11.0 with `--experimental-sqlite`, as the `.ps1` passes it | exit 0, `INVENTORY_COLLECTED`; without the flag `STORE_UNREADABLE / SQLITE_MODULE_UNAVAILABLE`, exit 4 |
| CLI on Node 22.22 against a synthetic store whose writer was still open (WAL 181 312 bytes) | exit 0; store directory names, sizes and modification times identical before and after; private copy removed |

What the tests establish about the method: rows that exist only in the WAL are enumerated while a writer is
open; the main file alone holds fewer rows; the store directory is byte-identical afterwards, with a WAL and
without one, and no `-shm` or `-wal` appears beside a closed store; a store changed during the copy is retried
and a store that keeps changing is refused; an absent store is reported without creating its directory; the
source of the collector contains no NP-04 open, no migration and no write statement. As a check on the tests
themselves, the WAL copy was temporarily removed from the implementation: the WAL, aggregation and CLI tests
failed, and the change was reverted.

## 9. Not verified

- **The PowerShell script has not been executed or parsed by PowerShell.** Its guarantees are asserted from
  its text.
- **Windows file sharing.** The method relies on reading the two files while another process has them open.
  SQLite opens its files shareable for reading on Windows, and its locks do not cover the bytes of a file
  below 1 GiB, so the reads are expected to succeed; this has not been observed on the host. If Windows
  refuses a read, the outcome is `STORE_UNREADABLE / SOURCE_READ_REFUSED` with the system error code, and the
  remediation is to run the collector while the IRR transport is stopped.
- **The host's NP-04 configuration.** Whether `IIPS_NP04_DATABASE_PATH` is defined on the host, and where, is
  unknown here. `STORE_UNAVAILABLE / NOT_CONFIGURED` is a possible and valid finding.
- No host inventory exists yet. Every store used above was synthetic.
