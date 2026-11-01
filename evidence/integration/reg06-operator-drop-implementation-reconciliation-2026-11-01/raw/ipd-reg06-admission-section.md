## CAP-02 — `REG-06` Operator Drop **product admission executed** on express PA authorization, and the durable PIT market-data capability implemented (2026-11-01)

| Field | Value |
|---|---|
| Record | `IIPS_V3_REG06_OPERATOR_DROP_PRODUCT_ADMISSION_2026-11-01` |
| Change id | `CHG-2026-11-01-01` |
| Decision date | **2026-11-01** |
| Authority | **PA (Ramki)** — express authorization for full one-pass execution |
| Execution owner | IPD |
| Disposition | `REG-06` product admission **GRANTED — SUPERSEDES the 2026-10-13 `DEFERRED` disposition** |
| Scope | IPD only. IRR read-only. Production deployment **out of scope** |

### 1. The admission act

PA explicitly authorized the Operator Drop manual-ingestion **product** capability and the complete
`REG-06` admission plus implementation sequence. That express act is the **"Express `REG-06`
promotion/admission act"** that the `P-08` pending-register row named as the required decision, and it
is the **"approved manual-ingestion product requirement"** whose absence `GOV-REC-2026-NON-PROD-
OPERATOR-BYPASS-01` and the 2026-10-13 register entry cited as the reason for deferral.

**Historical preservation.** The 2026-10-13 `REG-06` disposition (*"Internal IPD library primitive
preserved; product admission `DEFERRED`"*), the `P-08` continued-deferral record and the all-branch
re-verification record above are **retained verbatim and unmodified**. Per the governing principle
already recorded at `IRR §16.206` row 48 — *"dated overlays govern historical text"* — this section is
a **dated superseding overlay**, not a rewrite. The earlier records were correct as at their date: no
approved manual-ingestion requirement existed then. One now does.

### 2. Reconciliation of earlier findings

Two corrections to the earlier technical record are established by this work:

1. **Series-qualified ISIN resolution already existed on `main`.** The `P-08` register row listed
   *"series-qualified ISIN resolution"* as a prerequisite yet to be met. It was in fact implemented,
   exported through `./pit` and covered by `tests/cap02_pit_d114_package.test.ts`
   (`buildD114SecurityIdentity` / `isD114SecurityIdentity` / `PitReadService`). What was genuinely
   absent was the **wiring from Operator Drop to that resolver** — `src/operator_drop/**` held **zero**
   ISIN references and keyed records by `companyId` only. This work adds exactly that wiring and
   reuses the existing resolver without reimplementing it.
2. **Durable PIT market-data persistence did *not* exist** and was correctly identified as absent.
   `PointInTimeStore` is in-memory. The NP-04 `GovernedArtifactStore` persists governed **report
   artifacts** (`report_id`, `artifact_version`), not PIT market data, and is unmerged. This capability
   was therefore implemented rather than assumed.

### 3. What was implemented

| Capability | Implementation |
|---|---|
| Durable PIT market-data persistence | `src/pit/pit_durable_store.ts` — `DurablePointInTimeStore<T>`, SQLite, `WITHOUT ROWID` primary key, `UNIQUE (pit_key, as_of_ms)`, own migration ledger |
| Migration isolation | `pit001_market_data_snapshots` in `PIT_MARKET_DATA_MIGRATIONS`. **`GATE3_MIGRATIONS` and `DESIGNATED_MIGRATION_BLOBS` untouched** — check `V-A2-1` requires exactly four rows, so the Gate A′ / P-1 chain is undisturbed |
| Operator Drop → series identity | `src/operator_drop/drop_ingestion.ts` — `OperatorDropIngestionService`, `resolveDropSecurityIdentity` reusing `buildD114SecurityIdentity` / `isD114SecurityIdentity` |
| Operator Drop → durable PIT writes | Same module; `PitSnapshotSink` port satisfied by `DurablePointInTimeStore` |
| Product runtime caller | `src/operator_drop/product_runtime.ts` — `OperatorDropProductRuntime`: drop → checksum → identity → durable write → point-in-time screening read |
| Package-export admission | `./operator-drop` added to the export map; `src/operator_drop/package.ts`; `tsconfig.pit-package.json`; `scripts/verify-public-package.mjs` authorized map |

**Identity is required, never inferred.** A record with no explicit `securityIdentity` (or explicit
`isin` + `series`) is rejected with a named reason and is **never** silently admitted under
`companyId`. No cross-series fallback exists.

**Idempotency key — a design finding.** `IngestionPipeline` stamps every envelope with time-derived
identity (`envelopeId` as `env-<epoch>-<nonce>`, `provenance.evaluatedAt`, `provenance.dataVersion` and
therefore `provenance.lineageHash`). Digesting the whole envelope therefore can **never** report a
duplicate: a byte-identical replay would be misclassified as a conflicting snapshot.
`computeSnapshotDigest` keys on the **admitted data** — `[pitKey, asOf, payload]` — so a replay is
idempotent while genuinely different market data at the same identity and instant still fails closed
as `SNAPSHOT_CONFLICT`.

### 4. Authorized API-contract change

Three pre-existing **exact-contract** assertions were updated to the newly authorized surface. They
were not weakened, deleted or skipped — each still pins its contract exactly:

| Test | Was | Now |
|---|---|---|
| `tests/cap02_pit_d114_package.test.ts` — `./pit` surface | 2 symbols | 6 symbols (durable store added) |
| `tests/cap02_pit_d114_package.test.ts` — export map | 3 subpaths | 4 subpaths |
| `tests/portfolio_ui_package.test.ts` — export map | 3 subpaths | 4 subpaths |

### 5. Verification

| Check | Command | Outcome |
|---|---|---|
| Type check (strict) | `npx tsc --noEmit` | **clean** |
| Full build | `npm run build` | **success** |
| Full suite | `npm test` | **987 tests / 986 passed / 0 failed / 1 skipped** (baseline 941 / 940 / 0) |
| Public package contract | `npm run test:package-consumer` | **PASS** — 6 PASS, 0 FAIL; `verbatimCopies: true`; `productionModuleRuntime: PASS`; **`browser.forbiddenHits: []`** |
| Browser closure | included above | `./operator-drop` reaches `node:sqlite` / `node:fs` but did **not** enter the browser closure |

New tests added (46) covering all eight required categories: durable writes and restart recovery;
duplicate ingestion and idempotency; invalid or ambiguous identity rejection; the same ISIN across
different series without cross-series fallback; historical-date correctness and point-in-time
retrieval; persistence failure and partial-write recovery; package exports and public API
compatibility; and the actual product runtime caller with end-to-end ingestion-to-screening.

### 6. Boundaries preserved

- **IRR: read-only.** No IRR file was created, modified or pushed. IRR-side reconciliation of this
  admission is a **separate IRR work item** and is **not** established by this IPD change.
- **Production: out of scope.** No deployment, activation, provisioning or host execution.
- Unchanged: `GATE3_MIGRATIONS` (4 migrations), `DESIGNATED_MIGRATION_BLOBS`, check `V-A2-1`, the
  Gate A′ / P-1 chain, write guards, dispatch's closed write-operation set, authorization guards and
  production eligibility.
- `O-05` remains **OPEN**. `P-1-C` **NOT ESTABLISHED**. `P-1-D` **DESIGNATED, NOT VERIFIED FOR THE
  ATTEMPT**. `P-1` authorized by IRR P1-F (2026-10-29) — **ONE ATTEMPT ONLY — NOT EXECUTED — UNSPENT**.

**`REG-06` Operator Drop product admission is GRANTED and technically executed on IPD `main`. This is
not production admission, not `AD-17 / M-2` authorization, and confers no IRR acceptance.**
