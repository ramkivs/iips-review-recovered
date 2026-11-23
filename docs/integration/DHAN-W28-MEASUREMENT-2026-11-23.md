# W-28 — Measure Mapping Coverage Against Actual Persisted Holdings — measurement implementation

**Status: MEASUREMENT INFRASTRUCTURE COMPLETE; FINAL COVERAGE NUMBER PENDING WINDOWS CAPTURE.** This record is not a final coverage report and does not substitute synthetic counts for the owner's real holdings. See `DHAN-W28-COVERAGE-BLOCKER-2026-11-15.md` for the underlying holdings-access blocker, which remains applicable in this Linux sandbox.

## 1. What was built

**IRR-owned measurement (consumes IPD registry, does not re-implement it):**

| Artifact | Path | Purpose |
|---|---|---|
| Measurement core | `frontend/server/w28/coverageMeasurement.ts` | Strict exact ISIN+exchange+series match; proposed ≠ qualified; ambiguous stays unresolved; no name/symbol/fuzzy/company-level match; one result per holding; deterministic; privacy helpers (`maskIsin`, `sanitizeForPublication`, `buildHoldingsSnapshotRef`) |
| Registry snapshot loader | `frontend/server/w28/registrySnapshot.ts` | Loads IPD-immutable `evidence/dhan-p7/qualification-manifest.json` (manifest `371bf3bd4bb3eba49bbf6ae614d3edaaa04793ed`, pipeline `325266d684f857a377d55b147e7306e02c7a495a`, SHA-256 `69a918f78791114e8fb036ddfd2a2005facdddf785a7496bc28f541fd4964769`) with SHA/pipeline/counts/shape validation; reuses `scripts/w28_verify_manifest.py` logic |
| CLI | `frontend/server/w28/measureCoverageCli.ts` | `w28:measure` — captures actual persisted holdings via existing W11-Dep1 `captureOwnerBoundPortfolio` (read-only `list/get/revisions/get`, bounded, consistent), runs `measureCoverage`, writes owner-local detailed report (raw ISINs, local-only) and publishable sanitized summary (masked ISINs, aggregates) |
| Synthetic coverage tests | `frontend/server/w28/coverageMeasurement.test.ts` (vitest) + `frontend/server/w28/run-w28-tests.mjs` (no-vitest runner) | Covers 11 required conditions (see §3) |
| Existing artifact verifier | `scripts/w28_verify_manifest.py` + `tests/test_w28_verify_manifest.py` | Unchanged; validates digest/pipeline/counts/registry shape |
| Evidence placeholder | `evidence/w28-coverage-summary.json` | Blocker-form summary produced in this sandbox (no holdings available); replaced by real sanitized summary after Windows capture |

**Scripts (added):**

- `frontend/package.json`: `w28:measure` → `tsx --env-file-if-exists=… server/w28/measureCoverageCli.ts`
- `frontend/package.json`: `w28:test` → `tsx server/w28/run-w28-tests.mjs`
- `frontend/tsconfig.w28.json`: type scope for `server/w28` + `server/user-portfolio`

**No IPD mapping logic duplicated, no new mappings introduced, no live vendor qualification (W-14 owns that).** Coverage is exact security/listing `ISIN:isin:series @ exchangeSegment`; `companyId` is suffix-checked, never matched by name.

## 2. Holdings and registry sources

- **Holdings source:** `frontend/server/user-portfolio/capture/ownerBoundPortfolioCapture.ts` (`captureOwnerBoundPortfolio`) — exact W11-Dep1 sequence (consumer UTC stamps, `portfolio.list` → `portfolio.get` → `portfolio.revisions` → `portfolio.get`, same `revision`/`provenanceDigest`/`holdingsCount` across gets, whole-detail + identity multiset identical, discard+retry bounded 3/5, read-only guard `IPC_READ_OPERATIONS`). Preconditions `IIPS_G2_IPC_ENDPOINT` (absolute path or bare name → `IIPS_G3_LOCAL_STATE_DIR/<name>.sock` / `\\.\pipe\<name>`) and `IIPS_G3_IPC_BINDING_PROVISIONED` unchanged. In this sandbox both are absent (`env | grep IIPS` null, `/tmp/*.sock` null) — no holdings accessible, no synthetic substitution.
- **Registry source:** IPD immutable manifest at `ramkivs/iips-production-market-data` commit `371bf3bd4bb3eba49bbf6ae614d3edaaa04793ed`, path `evidence/dhan-p7/qualification-manifest.json`, SHA `69a918f…4769`, qualified 4680 (NSE:EQ 2390, BSE:A 700, BSE:B 1590; counts from `scripts/w28_verify_manifest.py`). The manifest retains 4680 qualified + 500 sampled non-equity; 19,060 no-P04 rows are not individually retained — when `p04Universe`/`providerUniverse` are absent the matcher reports `NO_QUALIFIED_MAPPING_EVIDENCE_LIMITED`, not a specific cause.
- **Contract:** `frontend/server/user-portfolio/userPortfolioContract.ts` (`G2HoldingView` with `isin?`, `exchange? NSE|BSE`, `identityStatus RESOLVED|UNRESOLVED`, `resolutionDisposition CANONICAL_P04|…`, `securityIdentity {securityId: ISIN:<isin>:<series>, isin, series}`; `G2PortfolioView` with `revision`/`provenanceDigest`/`holdings`).

## 3. Test results (synthetic fixtures, no owner data, no vendor call)

Runner: `npm run w28:test` (or `/tmp/tsx-install/node_modules/.bin/tsx frontend/server/w28/run-w28-tests.mjs` in this sandbox where `npm install` is blocked by egress):

```
✓ 1. exact ISIN and exchange mapping succeeds
✓ 1b. BSE entry resolves via BSE_EQ
✓ 2. missing persisted ISIN remains unresolved
✓ 2b. empty string isin
✓ 3. no P04 correspondence
✓ 4. no provider row
✓ 5. proposed not counted as qualified
✓ 6a. ambiguous invalid grammar
✓ 6b. ambiguous ISIN mismatch
✓ 6c. identity not resolved
✓ 7. same company different series rejected
✓ 8a. symbol match without ISIN does not resolve
✓ 8b. company name similarity never matches
✓ 9. every input holding appears exactly once
✓ 9b. duplicates counted separately
✓ 10. aggregate counts reconcile
✓ 11. deterministic re-run
✓ privacy: maskIsin
✓ privacy: sanitizeForPublication
✓ unsupported exchange
✓ evidence-limited

=== W-28 results: 21 passed, 0 failed ===
All 11 required conditions verified (synthetic fixtures, no owner data).
```

Plus unchanged `python3 -m unittest discover -s tests -p test_w28_verify_manifest.py -v` (5 tests, OK when run; manifest file must be downloaded read-only via GitHub contents API at the exact commit, saved outside the repo, then `python3 scripts/w28_verify_manifest.py <file>` — not executed here because no manifest file is checked in).

Vitest suite `frontend/server/w28/coverageMeasurement.test.ts` covers the same 11 conditions with `vitest run --config vitest.node…` when `node_modules` are present; it was not executed in this sandbox due to missing `vite`/`vitest` installs (egress `UNABLE_TO_VERIFY_LEAF_SIGNATURE` for `iips-production-market-data` tarball), but the no-vitest runner above exercises identical code paths.

## 4. How to produce the final coverage number (authorized Windows host only)

1. On the Windows host where the owner-bound IPD service is already running and `IIPS_G3_IPC_BINDING_PROVISIONED` + `IIPS_G2_IPC_ENDPOINT` are in the server-owned env (same env the IRR transport uses), download the manifest read-only via GitHub contents API at `ramkivs/iips-production-market-data` commit `371bf3bd4bb3eba49bbf6ae614d3edaaa04793ed`, path `evidence/dhan-p7/qualification-manifest.json`, to a local path outside the repo (e.g. `%TEMP%\qualification-manifest.json`). Verify `scripts/w28_verify_manifest.py` passes on that file.
2. Run:
   ```
   npm run w28:measure -- --manifest %TEMP%\qualification-manifest.json
   ```
   Add `--portfolioId <id>` when `portfolio.list` returns multiple portfolios (the CLI will refuse to guess; the failure message points to the LOCAL-ONLY candidates file). Optionally set `IIPS_W28_OWNER_LOCAL_OUTPUT` to choose the owner-local output location.
3. The CLI writes:
   - **Owner-local detailed report** (default `/tmp/iips-w28-owner-local-<ts>.json` or `IIPS_W28_OWNER_LOCAL_OUTPUT`) — schema `iips.w28.coverage-detailed-owner-local/v1`, classification `LOCAL-ONLY — CONTAINS RAW ISINs — DO NOT PUBLISH, COMMIT OR UPLOAD`, with `registrySnapshot` (commits, SHA, counts), `holdingsSnapshotRef` (`portfolioIds`, `revisions`, `totalHoldings`, `capturedAt`, `provenanceDigests`), `results[]` (per holding: `holdingReference` `holding:<portfolioId>:0001`, `isin`, `maskedIsin`, `exchange`, `identityStatus`, `resolutionDisposition`, `exactRegistryMatch`, `mappingQualification`, `result`, `reason`, `reasonDetail`), `summary` (counts, `coveragePercentage`, `unresolvedReasons`), `gaps` (prioritised), and capture attempt metadata. **Keep on the host, never commit.**
   - **Publishable sanitized summary** (default `evidence/w28-coverage-summary.json`) — schema `iips.w28.coverage-summary-public/v1`, with `registrySnapshot`, `holdingsSnapshotRef`, `captureSummary` (sanitized W11-Dep1 summary, no portfolio ids/digests), `results[]` with `isin: null` and `maskedIsin` only, `summary`, `gaps`, `privacy` (`rawIsinsPublished: false`, `ownerLocalSha256`), and `limitations`. **This is the only file committed.**
4. If holdings are inaccessible the CLI writes `evidence/w28-coverage-summary.json` in blocker form (schema `iips.w28.coverage-blocked/v1`) with `configurationProblems` and `configuration` endpoint info, and exits with the capture exit code (2/10/11/12/13/14/15).

## 5. Privacy and matching discipline

- **Strict exact identity:** only `isin + exchange + series` (via `securityIdentity.securityId = ISIN:<isin>:<series>` and `exchange → NSE_EQ|BSE_EQ`) against `companyId|exchangeSegment|securityId` registry suffix; same-company different-series rejected; symbol/name similarities never produce a match; ambiguous/`AMBIGUOUS_IDENTITY` stays unresolved; proposed never counted as qualified.
- **Per-holding:** `holdingReference` is `holding:<portfolioId>:<index>` (1-based, zero-padded), stable across re-runs; every input holding appears exactly once even if duplicated ISINs; `reason` is one of `MISSING_PERSISTED_ISIN | UNSUPPORTED_EXCHANGE | IDENTITY_NOT_RESOLVED | AMBIGUOUS_IDENTITY | MISSING_P04_CORRESPONDENCE | NO_PROVIDER_ROW | PROPOSED_MAPPING_NOT_QUALIFIED | NO_QUALIFIED_MAPPING | NO_QUALIFIED_MAPPING_EVIDENCE_LIMITED`; aggregates reconcile exactly with per-holding rows; re-runs identical (deterministic SHA).
- **Privacy:** `maskIsin` (first 3 + last 3), `sanitizeForPublication` (nulls `isin`), owner-local raw report never committed; public evidence has `isin: null`.

## 6. Completion assessment

- Measurement code, registry loader, CLI, and 11-condition synthetic tests are complete and passing in this sandbox.
- Final **holder-count-dependent** coverage number, revision, and gap breakdown remain pending the Windows capture described in §4. The placeholder `evidence/w28-coverage-summary.json` in this change is blocker-form evidence of the attempt (exit 2, configuration invalid — no endpoint/binding in sandbox), not a coverage result.
- W-27 IPD PR #189 reported by task as `arena/0a6b6000` — not directly inspectable in this sandbox (403 `Write access not granted` with `arena-egress-dummy-token`); PR #164 observed MERGED `bcb45d7` 2026-11-15 with artifact `371bf3…` parent `325266d…` (69a918f…) remains the verified immutable manifest.
