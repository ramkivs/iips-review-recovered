# IID-3 — Acceptance matrix

Every row names the acceptance criterion, what the criterion actually requires, and the test that would **fail** if
the implementation regressed. "Evidence" means a runnable check, not prose.

| Criterion | Requirement | Test (file → case) | Observed |
|-----------|-------------|--------------------|----------|
| **AC-3.1** | A scope token is validated **before any store call**: empty, whitespace-only, malformed, unrecognised prefix, over-long subject, and report-type/prefix mismatch are all rejected with the port receiving **zero** calls. | `iips-platform/tests/investment/scope-token.test.ts` (11 cases) · `frontend/server/investment/investment-artifacts.test.ts` → "never touches the port for an empty, whitespace-only, malformed or unrecognised scope" (7 tokens × read + record, `calls === 0`), "refuses a report type that does not belong to the scope prefix, before the port is called" · `investment-transport.test.ts` → "answers 400 without resolving an owner or loading a port" (`portLoaded === 0`, `ownerResolved === 0`) | 400/error with zero port calls |
| **AC-3.2** | Three appended versions are contiguous and chain-valid; a **scope-drifted** or corrupted chain is rejected **on read**. | `investment-artifacts.test.ts` → "keeps three versions contiguous and chain-valid…", "rejects a chain whose MIDDLE version was moved into another scope" (`CHAIN_SCOPE_DRIFT`), "refuses to serve a scope whose head was moved away" (`CHAIN_NOT_FOUND`), "rejects a store edit that changes a stored payload", "refuses to choose between two chain heads" · `investment-transport.test.ts` → "answers a sanitized integrity 503 for a corrupted chain, with no data" · M-1 point 8 | versions `[1,2,3]` valid; drift → 503 `investment-artifact-integrity-failure` |
| **AC-3.3** | An unchanged re-run writes **nothing** and reports `UNCHANGED`. | `investment-artifacts.test.ts` → "creates version 1, reads it back, and reports UNCHANGED on an identical re-run" (`wrote === false`, version count unchanged) · `cli/generate-investment-artifacts.test.ts` → "reports UNCHANGED and writes nothing when the same inputs are re-run" (row count unchanged) · M-1 point 4 | `UNCHANGED`, `wrote=false`, 1 version |
| **AC-3.4** | A stored `canonicalPayload` is **byte-identical** after two further appends. | `investment-artifacts.test.ts` → "keeps three versions contiguous…" (version 1 digest and payload string compared after v2 and v3) · M-1 point 6 (digest **and** byte length, re-read in a separate process) | v1 payload 66,726 bytes before and after; digest `ecc09e630d16…` unchanged |
| **AC-3.5** | No store construction and no SQLite import in the module graph; the port is **injected**. | `investment-artifacts.test.ts` → "imports no store, no SQLite and no filesystem writer" (source scan for `node:sqlite`, `openDatabase`, `new GovernedArtifactStore`, the package specifier, `node:fs`; asserts the one allowed reuse import) · "refuses to construct when the injected object is not the five-operation boundary" | source contains none of them |
| **AC-3.6** | An unresolvable NP-04 boundary makes every investment route answer a **static 503**, with **no substitute store**. | `investment-transport.test.ts` → "answers the static persistence-unavailable 503 when the boundary cannot be resolved" (exact body equality), "answers the same 503 when the injected object is not a port at all" · `cli/generate-investment-artifacts.test.ts` → "stops with PERSISTENCE_UNAVAILABLE when the boundary cannot be resolved" (no database file created) · M-1 point 9 (byte-exact body) | `503 {"error":"investment-persistence-unavailable",…}` |
| **AC-3.7** | **No mutating method** on any investment route. | `investment-transport.test.ts` → route-table test (every route `methods === ['GET','HEAD']`, `mutating === false`, zero `mutatingOperations`) · "answers 405 and never reaches the owner or the store for a mutating method" (POST/PUT/PATCH/DELETE → 405, `Allow: GET, HEAD`, `portLoaded === 0`) · `src/features/investment/CompanyAssessmentPage.test.tsx` → "renders no order, trade, disposition or change-intelligence control" (only `v1`/`v2` buttons, no `input`/`select`/`textarea`/`form`) · M-1 point 10 (8/8 → 405) | 8/8 answered 405 `Allow: GET, HEAD` |
| **AC-3.8** | No partition literal, owner pair, path, SQL or stack trace in any response or DOM node. | `investment-transport.test.ts` → `assertSanitized` on every success **and** every failure body (store path, db filename, tenant, user, `select `, table name, `node_modules`, stack frames) · `src/api/investment.test.ts` → "never surfaces server prose, even when the server sends a path or a stack" · `CompanyAssessmentPage.test.tsx` → "shows fixed copy for an unavailable boundary, and none of the server body" · M-1 sanitization sweep | 4 bodies checked, 0 leaks |

## M-1 verification points

| # | Point | Expected | Observed (`m1-demonstration.json`) | Pass |
|---|-------|----------|-----------------------------------|------|
| 1 | create | `CREATED`, version 1, one version | `CREATED` v1 (1 version) | ✅ |
| 2 | independent read in a separate process | exit 0, 1 version, same `reportKey` | exit 0, 1 version, key `fcf992e0a131…` | ✅ |
| 3 | payload and evidence intact | payload readable, evidence > 0, `datasetClass` synthetic | payload 66,726 bytes, evidence 7, `SYNTHETIC_REFERENCE` | ✅ |
| 4 | unchanged re-run writes nothing | `UNCHANGED`, `wrote=false`, still 1 version | `UNCHANGED`, `wrote=false`, 1 version | ✅ |
| 5 | changed input appends version 2 | `APPENDED`, v2, same `reportKey` | `APPENDED` v2, key unchanged | ✅ |
| 6 | version 1 byte-identical and readable | digest + byte length unchanged | `ecc09e630d16…`, 66,726 bytes | ✅ |
| 7 | both versions chain-valid | versions `[1,2]` | versions `[1,2]`, root digest unchanged | ✅ |
| 8 | corrupted / scope-drifted chain refused on read | 503, static integrity body, no data | 503 `investment-artifact-integrity-failure` | ✅ |
| 9 | boundary unavailable | 503, static body | 503, byte-exact body | ✅ |
| 10 | no mutating route | 405 with `Allow: GET, HEAD` | 8/8 | ✅ |

The demonstration is re-run by `server/investment/cli/m1-demonstration.test.ts`, so this table cannot drift from the
code: if any point stops holding, that suite fails.

## Regressions run because the change touches them

| Area | Why | Result |
|------|-----|--------|
| `frontend/server/reports/**` (9 files) | `toCanonicalArtifact` was exported for reuse; the persistence binding is the layer IID-3 mounts on | 130/130 pass |
| `iips-platform` full investment suite | `AssessmentParameters` was redefined to the stable-only set (`§B.A` supersedes the earlier sketch); new `artifacts` module | 286/286 pass |
| `iips-platform` NP-12 sector-reference population | frozen-population regression, unaffected by IID-3 but cheap to confirm | 42/42 pass |
| `frontend` `tsc -p tsconfig.replay-server.json` | the transport is mounted in `executive-transport.ts` | no new errors (16 pre-existing, all unresolved external package subpaths / broker-import cache) |
| `frontend` `tsc --noEmit` (`src`) | new client + view + routes | no new errors (pre-existing broker-import resolution errors only) |
| `frontend/src/app/App.test.tsx` | mounts the new route | **cannot run in this sandbox**: it imports `src/api/brokerHoldingsPreview.ts`, which resolves `../../.cache/broker-import/...`; that cache was never materialised here (pre-existing, unrelated to IID-3) |

## What is *not* claimed

No real issuer has been assessed (`L-009`). The dataset is synthetic (`L-004`). Bank dividends remain withheld
(`L-005`), restricted cash is not computable (`L-006`), dilution is a capped proxy (`L-007`), SOTP is not
implemented (`L-008`), 3 of 13 sectors are measured (`L-001`), 20 XBRL tags are mapped (`L-002`) and 8 derivations
exist (`L-003`). IID-3 closes none of them; every response and the view carry them forward.
