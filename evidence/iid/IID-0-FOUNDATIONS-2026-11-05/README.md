# IID-0 — Foundations & qualification: acceptance evidence

Branch: `arena/08238a84-iips-review-recovered`
Date: 2026-11-05
Phase: **IID-0 only.** IID-1 … IID-6 were not started.

## What was run

| Command | Result | Log |
|---|---|---|
| `cd iips-platform && ./node_modules/.bin/tsc --noEmit` | exit 0, no output | `tsc-noemit.log` (empty by design) |
| `./node_modules/.bin/tsx --test tests/investment/*.test.ts` | **91 tests, 91 pass, 0 fail** | `targeted-tests.log` |
| `./node_modules/.bin/tsx --test tests/regression/np12-sector-reference-population.test.ts` | **42 tests, 42 pass, 0 fail** (no regression in a frozen-engine consumer) | `np12-regression.log` |
| `tsx src/investment/cli/ingest.ts --input <fixtures> --dataset-dir <tmp> --now 2026-11-05T00:00:00.000Z --allow-errors` | exit 0; dataset written; `datasetVersion sha256:3686c46a…49d5` | `cli-ingest-run.log` |
| same CLI run, without `--allow-errors` | exit 1; nothing written (the fixture's GNPA/NNPA inconsistency is a real error) | asserted in `tests/investment/cli.test.ts` |

Reproducing the dataset run is deterministic: two runs with different `--now` values produce the same
`datasetVersion` and different `lastImportAt` (`tests/investment/cli.test.ts`, third case).

## Evidence files

- `cli-ingest-run.log` — full CLI output: every ingestion issue, the dataset version, and the per-sector
  coverage summary.
- `coverage-report.json` — the R-16 measurement output actually produced by that run (13 sectors reported;
  3 measured, 10 outstanding).
- `dataset-manifest.json` — the manifest of that run, including `contentDigest`, `digestScope` and per-file
  digests.
- `targeted-tests.log`, `np12-regression.log`, `tsc-noemit.log` — the raw captured output.

## Acceptance criteria (IID-0 exit criteria, E-0.1 … E-0.9)

| ID | Criterion | Status | Evidence |
|---|---|---|---|
| E-0.1 | Branded `IssuerId` / `SecurityId` / `ListingId` / `PositionKey`; sector references rejected with a distinct code; ISIN Luhn and CIN structure validated; listing id carries exchange + symbol + series + instrument type and rejects a two-part form | **PASS** | `tests/investment/contracts.test.ts` → `identity` (3 tests) |
| E-0.2 | Observation contract: a missing value is `null` with a closed reason and is never zero; imputation legal only with method + assumption reference | **PASS** | `contracts.test.ts` → `observation` (3 tests) |
| E-0.3 | INV-1 … INV-6 validators reject malformed observations; aggregates are withheld when any declared input is unusable and name that input; CONCL-1/CONCL-2 prevent conclusions from insufficient evidence or from absence | **PASS** | `contracts.test.ts` → `invariants` (5 tests) |
| E-0.4 | Closed line-item table (52 items) with duration, sign rule and unit; derived items (`EBITDA`, `NET_DEBT`, `BOOK_VALUE_PER_SHARE`, `FREE_CASH_FLOW`, `DILUTED_SHARES`, …) are produced by a closed derivation set and **rejected if filed** | **PASS** | `contracts.test.ts` → `line items`; `ingestion.test.ts` → `derived items are produced…`, `a derived item may not be filed by hand` |
| E-0.5 | Financial-period contract: fiscal-year labelling, statement scope, explicit scale conversion (per-share items never scaled), YTD → discrete only by same-year subtraction, TTM refused below four usable quarters | **PASS** | `contracts.test.ts` → `periods` (3 tests) |
| E-0.6 | File-in ingestion v0 (CSV + XBRL, no network): unmapped XBRL tags counted not coerced, instant/duration discipline enforced, unknown line items and unknown metrics rejected, conflicts retained and flagged | **PASS** | `ingestion.test.ts` (27 tests) |
| E-0.7 | `FundamentalsReadPort` + fail-closed resolution: absent dataset → `available:false` with a precise reason and no port; tampered or missing file → `DatasetIntegrityError`; the store exposes read methods only | **PASS** | `boundary.test.ts` (10 tests) |
| E-0.8 | Deterministic dataset identity: `datasetVersion == contentDigest`, independent of clock and input order; changed content → changed version; tamper detected by recomputation | **PASS** | `dataset-identity.test.ts` (10 tests); CLI determinism case |
| E-0.9 | R-16 coverage foundation: 13 sectors reported, completed measurements separated from outstanding sectors, availability per **method** with a closed withheld reason, no sector reported as passing on absent data | **PASS** | `coverage.test.ts` (12 tests); `coverage-report.json` |
| E-0.10 | Standing constraints enforced as tests: no HTTP client, no `fetch`, no endpoint string, no SQLite, no NP-04/Reports/sector-engine import from `src/investment` | **PASS** | `constraints.test.ts` (6 tests) |
| E-0.11 | No regression in an existing consumer of frozen engine vocabulary | **PASS** | `np12-regression.log` (42/42) |

## What is deliberately NOT claimed

- **13-sector coverage is not achieved.** Three sectors (Technology, Banking, Hospitality) carry data and
  were measured; ten are `UNMEASURED` and listed in `outstandingSectors`. That is the R-16 deliverable
  (criteria C-16.1 … C-16.5), which remains open and is not part of IID-0.
- **No assessment exists.** Nothing in this phase produces a valuation, a disposition or a recommendation.
  `INSUFFICIENT` evidence cannot produce one by construction (`checkConclusion`).
- **The reference dataset is synthetic.** Company names, ISINs (`IN00000000xx`) and CINs are placeholders;
  the deliberate defects are documented in `iips-platform/tests/investment/fixtures/`.
- **No persistence.** No NP-04 database, persisted report or IPD artefact was created, modified or read.
  Dataset files are local operator files, written only under the directory the CLI was given.
