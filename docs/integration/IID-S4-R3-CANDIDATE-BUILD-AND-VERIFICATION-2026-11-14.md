# IID S4-R3 — Exact O3-Admitted Candidate Build and Verification

**Date:** 2026-11-14 (task date, UTC)
**Branch:** `arena/53ff9276-iips-review-recovered`
**Verified build baseline:** `de65180577d1b79b9056974fc02a5000bc1baa39`
**Scope:** candidate generation and integrity verification only
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION; no Windows installation

> **Result:** the exact O3-admitted S4-R3 candidate digest was reproduced from the exact admitted inputs through the existing authoritative ingestion pipeline. **CANDIDATE BUILD AND DIGEST VERIFICATION: PASS.** This is not runtime installation and not overall IID readiness.

> **Subsequent host execution (host report date 2026-11-15):** the same exact candidate digest has now also been built and verified on the operator's Windows host at `7ef0f10f593e6d5449900b61f7bf74d0c3daaa01`, outside the repository. That host result — including the authoritative verifier's PASS 31/0 — is recorded in `IID-S4-R3-WINDOWS-HOST-BUILD-AND-VERIFICATION-EVIDENCE-2026-11-15.md`. Everything below remains the historical repository-side sandbox record; §8's transfer limitation is satisfied for that host by the operator building locally, and no dataset content was transferred or published. Runtime installation remains **NOT AUTHORIZED**; overall IID readiness remains **NOT READY**.

## 1. Authority and preserved decisions

The operator separately authorized this candidate build, including the ingestion/build operations needed to generate the normalized dataset from the exact O3-admitted inputs. The governing admission records remain unchanged:

- `docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md`
- `docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md`

The original O3 restrictions remain binding: local personal investment analysis only; no commercial or production use; no SaaS or multi-user deployment; no redistribution of source bundles, normalized datasets or derived dataset contents; no claim of independent legal verification of source licensing. This document publishes only build procedure, code references and non-content verification metadata.

## 2. Authoritative pipeline

No new dataset-generation pipeline was invented. The build uses:

```text
iips-platform/src/investment/cli/ingest.ts
  -> loadInputBundle / mergeInputBundles
  -> buildDatasetContent
  -> computeContentDigest
  -> writeDataset (stage, verify, publish)
```

Verification uses the repository’s own `readDataset`, `verifyManifest`, `computeContentDigest`, `listingConflicts`, `measureCoverage` and `investmentCoverageFromLocalDataset`. The existing read-only harness `iips-platform/src/investment/cli/verify-installed-dataset.ts` was also run against the generated candidate.

A small repository-owned wrapper is added at:

```text
iips-platform/src/investment/cli/build-s4-r3-candidate.ts
```

It pins the admitted inputs and expected digest, refuses existing/in-repository destinations, invokes the existing ingestion CLI once, writes a complete file-level digest ledger beside the candidate, and supports read-only verification. It does not install, provision identity, open a database, access Windows, or publish dataset contents.

## 3. Exact admitted inputs verified before build

| Issuer | Input directory | Verified `inputDigest` |
|---|---|---|
| Infosys | `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input` | `sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c` |
| Marico | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico` | `sha256:31d8e5039c502cae98e9c68f6d8fb47aaec44712f81c7005f5f9b8bd4d09c63d` |
| KEC International | `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec` | `sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a` |

All six consumed files were re-hashed. The enclosing S4-R3 evidence ledger also verified: 26/26 entries, ledger SHA-256 `b41b0b106fe731d1b2420f72f05b2efa7e44e1a39ef185b4af063f441be92c63`. The ledger digest is not the candidate dataset digest.

The input bytes must remain byte-exact, including LF line endings. A checkout that converts the admitted CSV/JSON files to CRLF will fail the input-digest gate. Do not normalize, re-transcribe or edit inputs to force a match.

## 4. Exact build performed

From `iips-platform`, with a new output directory outside the repository:

```bash
./node_modules/.bin/tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input \
  --input ../evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico \
  --input ../evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec \
  --dataset-dir /home/user/iips-candidates/S4-R3-de65180/investment/dataset \
  --now 2026-11-14T00:00:00.000Z
```

The fixed `--now` value is the recorded S4-R3 measurement clock. It is excluded from candidate content identity and is used here to reproduce the recorded manifest exactly; it is not a claim about the current wall-clock time.

**Session-local candidate build directory:** `/home/user/iips-candidates/S4-R3-de65180`

Generated dataset files:

```text
/home/user/iips-candidates/S4-R3-de65180/investment/dataset/corporateActions.json
/home/user/iips-candidates/S4-R3-de65180/investment/dataset/issuers.json
/home/user/iips-candidates/S4-R3-de65180/investment/dataset/issues.json
/home/user/iips-candidates/S4-R3-de65180/investment/dataset/listings.json
/home/user/iips-candidates/S4-R3-de65180/investment/dataset/operatingMetrics.json
/home/user/iips-candidates/S4-R3-de65180/investment/dataset/periods.json
/home/user/iips-candidates/S4-R3-de65180/investment/dataset/prices.json
/home/user/iips-candidates/S4-R3-de65180/investment/dataset/securities.json
```

Candidate manifest:

```text
/home/user/iips-candidates/S4-R3-de65180/investment/dataset/manifest.json
```

Complete package file-level digest ledger and verification evidence:

```text
/home/user/iips-candidates/S4-R3-de65180/verification/file-digests.json
/home/user/iips-candidates/S4-R3-de65180/verification/verification.json
```

The ledger covers all ten files under `investment/dataset` (eight content files, manifest, coverage report). It excludes the `verification/` metadata directory and explicitly states that scope.

## 5. Digest and validation result

| Check | Result |
|---|---|
| Expected O3 candidate digest | `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` |
| Actual recomputed candidate digest | `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` |
| Eight declared content-file hashes | **8/8 match** |
| Generated manifest vs recorded candidate manifest | **byte-identical**; SHA-256 `b921741942d4674ed968f2938917b588b07ae9dc6db12f2998cb7361727d90ba` |
| Package ledger | **10/10 entries**; ledger SHA-256 `3647c9397bc7e1577ea1255aa6fcbe72418a3bc0fe23c439269c55a6891265bc` |
| Authoritative read-only harness | **PASS — 32 checks, 0 failures, exit 0** |
| Wrapper verification | **PASS — 16 checks, 0 failures** |
| Population | 3 issuers, 3 securities, 5 listings, 13 periods = 11 `ANNUAL` + 2 `QUARTER`, 0 issues |
| Identity / listing / period validation | PASS through the authoritative builder and wrapper checks |
| Corporate actions / operating metrics / prices | empty admitted tables preserved; no unsupported records fabricated |
| Runtime coverage read | loads the exact candidate; 3/13 sectors measured; this is not installation or overall readiness |

Non-content verification metadata is published at:

```text
evidence/integration/iid-s4-r3-candidate-build-2026-11-14/verification.json
```

No normalized dataset file, source excerpt, candidate archive or derived dataset content is committed or pushed by this work item.

## 6. Repeatable local build and verify procedure

The wrapper requires an explicit mode and an output directory. For `--build`, the output leaf must not exist, its parent must exist, and the output must be outside the repository working tree. For `--verify-only`, the package must already exist and no writes are performed.

### Linux / macOS shell

```bash
cd iips-platform
npm ci
./node_modules/.bin/tsx src/investment/cli/build-s4-r3-candidate.ts \
  --build --output-dir /absolute/operator-controlled/new-candidate-directory
./node_modules/.bin/tsx src/investment/cli/build-s4-r3-candidate.ts \
  --verify-only --output-dir /absolute/operator-controlled/new-candidate-directory
```

### Windows PowerShell 5.1-compatible local build example

This is a **candidate build** example, not an installation command. The destination is an operator-chosen new local package directory, not `C:\iips-data\investment\dataset`.

```powershell
Set-Location -LiteralPath 'C:\path\to\iips-review-recovered\iips-platform'
npm ci
$CandidateParent = Join-Path $env:USERPROFILE 'Documents\IIPS-Candidates'
$CandidateRoot = Join-Path $CandidateParent 'S4-R3-de65180'
New-Item -ItemType Directory -Path $CandidateParent -Force | Out-Null
npx tsx src/investment/cli/build-s4-r3-candidate.ts --build --output-dir $CandidateRoot
npx tsx src/investment/cli/build-s4-r3-candidate.ts --verify-only --output-dir $CandidateRoot
```

If the candidate leaf already exists, choose a new leaf. Do not delete, overwrite or retry-over an existing package. Dependency installation (`npm ci`) is separate from the authoritative build; the ingestion/build itself performs no network calls.

## 7. Tests and checks run

| Gate | Result |
|---|---|
| New wrapper suite `tests/investment/s4R3CandidateBuild.test.ts` | **10 tests / 2 suites / 0 fail** |
| Selected IID regression batch A | **291 tests / 62 suites / 0 fail / exit 0** |
| Selected IID regression batch B | **208 tests / 52 suites / 0 fail / exit 0** |
| Selected IID regression total | **499 tests / 114 suites / 0 fail** |
| Platform typecheck `npm run typecheck` | **exit 0** |
| Frontend typecheck `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt npm run typecheck` | **exit 0** |
| `git diff --check` | **exit 0** |

The selected regression batches cover ingestion, multi-input merge, publication atomicity, installed-dataset verification, dataset identity/schema, contracts/constraints, CLI/boundary, sector validation/read path, investment coverage, assessment periods/valuation, identity resolution/sources/corporate actions, security-to-issuer bridge and nil binding/disclosure. They do not perform Stage 2 identity provisioning. No Windows-host execution is claimed.

## 8. Local retention and operator transfer limitation

The generated package is outside Git and outside the repository working tree. **No compliant durable operator-controlled retention/transfer channel was established by this session.** The path `/home/user/iips-candidates/S4-R3-de65180` is session-local sandbox storage, not the operator’s Windows personal-use location. No candidate archive was uploaded to a GitHub release, and no dataset content was transferred to Windows.

The operator can obtain the package without redistribution by running the pinned local build procedure above on their own operator-controlled personal-use host, using the exact admitted inputs already present in their authorized local checkout. The resulting package must remain local and personal-use only. If a different transfer channel is desired, it requires a separate operator-approved local/personal-use mechanism; this work item does not substitute a public repository release or upload.

## 9. Boundaries and outstanding limitations

| Boundary | Status |
|---|---|
| Windows installation | **NOT EXECUTED** |
| Existing Windows dataset `C:\iips-data\investment\dataset` | **UNTOUCHED** |
| Windows identity data | **UNTOUCHED** |
| Personal Portfolio database | **NOT ACCESSED** |
| Stage 2 identity provisioning | **NOT EXECUTED** |
| IPD | **NOT MODIFIED** |
| PR #562 merge status | **NOT CHANGED** |
| Original/additive O3 decisions and S4-R3 handover | **PRESERVED** |
| Normalized dataset/source/archive GitHub publication | **NOT PERFORMED** |

Unresolved items remain:

- **L-041: OPEN**
- **L-042: OPEN**
- Infosys, Marico and KEC: **`STALE_STATEMENTS` / `STALE_DATA`**
- No PDF-to-transcription verification claim.
- No independent source-rights verification claim.
- **OVERALL IID READINESS: NOT READY** until all outstanding acceptance criteria are satisfied.

Successful candidate generation and candidate integrity verification do not resolve these limitations.
