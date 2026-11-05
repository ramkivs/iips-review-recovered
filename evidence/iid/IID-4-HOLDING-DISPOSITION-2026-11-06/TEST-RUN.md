# IID-4 — test run record

All commands were run from the repository root on 2026-11-06, in this order. The raw output of each is in `logs/`.

| # | Command | Result | Log |
|---|---|---|---|
| 1 | `cd iips-platform && ./node_modules/.bin/tsc --noEmit` | exit 0, no diagnostics | `logs/typecheck-platform.txt` |
| 2 | `cd iips-platform && ./node_modules/.bin/tsx --test tests/investment/*.test.ts` | **377 tests, 377 pass, 0 fail** (97 suites) | `logs/platform-tests.txt` |
| 3 | `cd frontend && ./node_modules/.bin/tsc -p tsconfig.investment-server.json --noEmit` | exit 0, no diagnostics | `logs/typecheck-frontend-server.txt` |
| 4 | `cd frontend && ./node_modules/.bin/vitest run server/investment` | **9 files, 112 tests, 112 pass** | `logs/frontend-tests.txt` |
| 5 | `cd frontend && ./node_modules/.bin/tsx server/investment/cli/disposition-demonstration.ts --out <evidence>/demo` | exit 0, **8 of 8 verification points PASS** | `logs/demonstration.txt`, `demo/` |

## Why these commands and no others

The phase touched two suites and one CLI:

- **Platform** (`iips-platform/tests/investment/`): the whole investment suite, not only the new files, because the
  engine shares contracts (`observation`, `ids`, `disposition` contracts, `scopeToken`) with IID-0 … IID-3. Running
  only the new files would not have caught a contract regression. 377/377 includes every pre-existing assessment and
  artifact test unchanged.
- **Frontend server** (`server/investment/`): includes the IID-3 composition, artifact and transport suites (which
  exercise the shared write path the disposition records now use) plus the four new disposition files.
- **Demonstration**: the only end-to-end path in the phase — create, re-run, version, candidate, read through the
  transport.

Not run, deliberately: `frontend/src/**` UI suites (no UI was built — IID-6 owns that), `server/broker-import/**` (not
touched), the broad repository suite (out of scope for a phase that adds two modules and one route family). The
repository-wide suites were green at the IID-3 baseline and nothing outside the investment namespaces was modified.

## Counts, per file

| File | Tests | What it covers |
|---|---|---|
| `iips-platform/tests/investment/disposition-matrix.test.ts` | 38 | AC-4.1 table (31 rows), AC-4.2, AC-4.8 |
| `iips-platform/tests/investment/disposition-limits.test.ts` | 11 | AC-4.5, AC-4.9, cap behaviour |
| `iips-platform/tests/investment/disposition-subject.test.ts` | 11 | AC-4.3 |
| `iips-platform/tests/investment/disposition-rationale.test.ts` | 11 | AC-4.6, AC-4.7, AC-4.10 |
| `iips-platform/tests/investment/disposition-portfolio.test.ts` | 9 | AC-4.4, gate ordering |
| `iips-platform/tests/investment/disposition-behaviour.test.ts` | 11 | hysteresis, refusals, labelling, policy change, multi-security |
| `frontend/server/investment/disposition-composition.test.ts` | 16 | chain scope, content identity, refusals, input identity |
| `frontend/server/investment/disposition-records.test.ts` | 15 | persistence, idempotency, independent chains, integrity, L-014, limits resolution |
| `frontend/server/investment/disposition-transport.test.ts` | 15 | route table, parsing, success shapes, fail-closed paths |
| `frontend/server/investment/portfolio-context.test.ts` | 11 | weight reuse, unmeasured weight, sector coverage, no fabrication |
