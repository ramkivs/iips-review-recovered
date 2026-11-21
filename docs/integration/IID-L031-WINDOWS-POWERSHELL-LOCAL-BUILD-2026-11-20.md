# IID L-031 — Windows PowerShell Local Build & Verification Path for Candidate `d2b65bcc…`

**Date:** 2026-11-20 · **Repository:** `ramkivs/iips-review-recovered` · **Status:** PUBLISHED (repository-owned); **Windows host execution: NOT EXECUTED** (no PowerShell engine exists in the implementation environment; validation is static conformance plus the TypeScript wrapper's deterministic build evidence on Linux).

This document publishes a **separate, independently pinned** Windows build/verification path for the authorised IID S4-R3 successor candidate admitted under O3 on 2026-11-20:

| Property | Pinned value |
|---|---|
| Candidate `datasetVersion` / `contentDigest` | `sha256:d2b65bccd5d8ff289119068eb1c03f094a232c9ea6a754b060b76f9386f509bd` |
| Population | 3 issuers; 17 periods (13 ANNUAL + 4 QUARTER); **2 corporate actions**; 0 ingestion issues |
| Build clock | `2026-11-20T00:00:00.000Z` (fixed; not a wall-clock claim) |
| TS wrapper | `iips-platform/src/investment/cli/build-l031-candidate.ts` — SHA-256 `92296780f9cbf244dec6ac83a3d123d0d5ee7b7f81fa94b8794ca1e89abc6307`, Git blob `ef9d574df8c50856cdbe75a93120ebf62bba61d2` |
| PowerShell driver | `tools/windows/IID-L031-CANDIDATE-LOCAL-BUILD.ps1` (Windows PowerShell 5.1 Desktop) |
| Admission record | `docs/integration/IID-O3-L031-INFOSYS-WINDOW-SUCCESSOR-ADMISSION-2026-11-20.md` |

The existing `bdfb2527…` builder (`build-s4-r3-candidate.ts` + `IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1`) is **untouched**; its pins were not modified. The new path has its own source identity and pins and will fail closed if presented with the older candidate's inputs.

## 1. Pinned source inputs (every byte verified before any output is created)

| Role | Input directory (repository-relative) | `inputDigest` | Files (SHA-256 pinned individually) |
|---|---|---|---|
| Infosys window-coverage successor | `evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20/ingest-input/infosys` | `sha256:c8dd4666…3b7f` | `corporate-actions.json` `9364d39d…`, `periods.csv` `87728ec8…`, `roster.json` `426e8478…` |
| Marico quarterly successor (unchanged) | `evidence/real-issuer/S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19/ingest-input/marico` | `sha256:bf670d6e…91c` | `periods.csv` `59464d49…`, `roster.json` `259c2f09…` |
| KEC successor (unchanged) | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec` | `sha256:22ea5018…81a` | `periods.csv` `ff6e62fd…`, `roster.json` `d36b2770…` |

The Infosys input carries **both admitted corporate actions**: `CA-INFY-BONUS-2018-09-06` (`BONUS`, factor 0.5) and `CA-INFY-BUYBACK-TENDER-2025-12-04` (`BUYBACK_TENDER`, factor 1, `perShareComparable: true`). The enclosing L-031 evidence ledger (`digests.json`, SHA-256 `0a3e0664…`) is also verified, including its recorded `successorInputDigest` and `candidateDatasetVersion`.

Expected content-file hashes (manifest `files` map) are pinned in the wrapper (`EXPECTED_CONTENT_FILE_SHA256`): `corporateActions.json f118919b…`, `issuers.json b67da870…`, `issues.json 37517e5f…`, `listings.json 77f8d134…`, `operatingMetrics.json 37517e5f…`, `periods.json 50fee979…`, `prices.json 37517e5f…`, `securities.json d25abfde…`. Manifest identity is governed by the exact candidate digest plus these hashes — never by raw manifest bytes, because absolute input audit paths differ by checkout. (No recorded candidate-manifest file exists for this candidate; none was fabricated.)

## 2. Windows commands (Windows PowerShell 5.1, from the repository checkout)

Prerequisites (never installed by the driver): Node.js ≥ 18, Git, and `npm ci` already run inside `iips-platform`. The candidate parent directory must already exist; the candidate leaf must be new for a build.

```powershell
# 1) Read-only preflight (default; creates nothing)
.\tools\windows\IID-L031-CANDIDATE-LOCAL-BUILD.ps1 -OutputDir 'C:\iips-candidates\L031-d2b65bcc'

# 2) Build (asks for the exact typed phrase: BUILD L031 d2b65bcc)
.\tools\windows\IID-L031-CANDIDATE-LOCAL-BUILD.ps1 -OutputDir 'C:\iips-candidates\L031-d2b65bcc' -Build

# 3) Verify-only (strictly read-only; writes no evidence)
.\tools\windows\IID-L031-CANDIDATE-LOCAL-BUILD.ps1 -OutputDir 'C:\iips-candidates\L031-d2b65bcc' -VerifyOnly
```

## 3. Outputs and evidence

A successful build produces, under the chosen candidate root only:

- `investment\dataset\` — the 8 content files + `manifest.json` + `coverage-report.json`;
- `verification\file-digests.json` — machine-readable per-file digest ledger (10 entries);
- `verification\verification.json` — the wrapper's 16-check report (`tool: build-l031-candidate`, result `PASS`, exact digest);
- `verification\windows-local-verification.json` — written **only** on a successful `-Build` run on the Windows host (verify-only never writes).

The PowerShell result object is also exposed as `$global:IIDL031CandidateLocalBuild` with an `ExitCode` field (0 pass, 1 failure/refusal, 2 usage). The driver additionally runs the authoritative `verify-installed-dataset` CLI against the candidate (expecting 3 issuers, 3 sectors, 13 annual + 4 quarterly periods, input dirs `infosys`/`marico`/`kec`, as-of `2026-11-20`).

## 4. Failure conditions (all fail closed)

Missing, altered, or unexpected input files; any input-digest mismatch; evidence-ledger mismatch; wrapper blob/canonical-hash mismatch against the committed checkout; dirty tracked implementation/inputs vs `HEAD`; Node/tsx lockfile mismatch; non-fixed or low-space drive; destination inside the repository or overlapping `C:\iips-data` (active dataset, identity directory, portfolio database — path-guarded, never probed); existing build destination (never overwritten — choose a new leaf); digest, manifest, census, corporate-action-count, or period-count mismatch after build. A failed build is preserved for diagnosis and is never installed.

## 5. Boundaries

This path **builds and verifies a candidate package only**. It is not an installer: it never touches the active dataset, provisions identity, opens a portfolio database, or changes host state. **D8 (active dataset verification) and G-2 (installed dataset) remain outstanding** — local candidate reproduction, here or on Windows, does not close them; independent host installation read-back is still required. Window coverage remains operator-declared; independent PDF verification is `NOT_CLAIMED`.
