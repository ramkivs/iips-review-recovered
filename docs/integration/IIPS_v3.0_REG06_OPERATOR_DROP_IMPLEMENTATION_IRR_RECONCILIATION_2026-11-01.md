# REG-06 / Operator Drop — completed IPD implementation and IRR reconciliation

**Record:** `IIPS-V3-REG06-OPERATOR-DROP-IMPLEMENTATION-IRR-RECONCILIATION-2026-11-01-01`
**Tracker:** §16.242 / `CV-CORR-222` / `CHG-2026-11-01-21` / `V1936`–`V1949`
**Date:** 2026-11-01 (Asia/Calcutta)
**Disposition:** **IPD product admission and implementation COMPLETED; IRR RECONCILED.**

## 1. Supersession, not historical rewriting

The 2026-10-13 DEFERRED decision and the PR #115 continued-deferral assessment were accurate against their cited IPD baselines. They are preserved verbatim. IPD PR #117 subsequently implemented and admitted the capability under `IIPS_V3_REG06_OPERATOR_DROP_PRODUCT_ADMISSION_2026-11-01` / `CHG-2026-11-01-01`. PA §5.6 and tracker §16.242 are the dated current-state overlays.

This IRR work verifies and reconciles that IPD completion. It does not render a new PA decision or a separate IRR product acceptance. Production admission/deployment and AD-17/M-2 remain unauthorized. O-05 remains OPEN; P-1-C is NOT ESTABLISHED; P-1-D is DESIGNATED, NOT VERIFIED FOR THE ATTEMPT; P-1 is AUTHORIZED — ONE ATTEMPT ONLY — NOT EXECUTED — UNSPENT. The separate §16.241 pre-start-retry guard is unchanged and was not exercised.

## 2. Independent remote IPD verification

| Field | Verified value |
|---|---|
| Repository / main | `ramkivs/iips-production-market-data` / `eb9289222e2bdfd0e79381d4d81f7f81715e019b` |
| PR / head | #117 / `5b2c03dc8888aa40a4dd967ef6e7f3b76731c01e` |
| Merged | `2026-11-01T10:48:22Z`; two-parent merge |
| Changed scope | 17 paths, +1811/−12 |
| Governance tracker blob | `c1c666149c2d907026df3d9a2d184d2b9a2383c0` |
| Package manifest blob | `99e262d36341e0bd850ea20d103280131f4f2c71` |
| PR / post-merge CI | `41298988402` / `41299084025`, both success |
| Executed-count check | `124826327985`: 987 executed / 986 passed / 0 failed |
| Remote artifact read-back | 23 changed/protected artifacts: GitHub raw/blob bytes equal Git objects and exact checkout |

### Source and package findings

- `src/pit/pit_durable_store.ts`: SQLite `DurablePointInTimeStore`, append-only snapshots, `UNIQUE (pit_key, as_of_ms)`, strict UTC/identity checks, idempotent replay, conflict rejection, `BEGIN IMMEDIATE`/rollback and isolated migration ledger.
- `src/operator_drop/drop_ingestion.ts`: explicit `securityIdentity` or `isin` + `series`; reuses D114 identity resolver; rejects missing/ambiguous identity and never falls back across series. The unchanged parser still uses `record.companyId` for the company field.
- `src/operator_drop/product_runtime.ts`: actual IPD product composition from drop ingestion through durable PIT writes to screening/history reads. No IRR route or runtime registration is implied.
- `./operator-drop` is present in the exact export map. Clean build emits eight Operator Drop JS/declaration files. The actual tarball has 151 entries, shasum `2f45b5acb12baa7db85c0c73b843375ef20927e2`, and includes all eight files.
- Protected parser, Gate A′ migration/validation, migration-ledger, dispatch and entrypoint paths are unchanged. Gate 3's four-migration contract is not extended by the PIT store.

### Executed validation

| Check | Result |
|---|---|
| Exact Git checkout `npm test` | 987 executed / 986 passed / 0 failed / 1 skipped |
| Compiled focused REG-06 suites | 46 / 46 passed |
| `npm run build`, `npx tsc --noEmit` | PASS |
| `npm run test:package-consumer` | PASS; 151 packed files; verbatim IRR PIT importers; production-module runtime PASS; browser forbidden hits `[]` |
| Independent installed-tarball smoke | PASS; durable append, restart recovery, duplicate replay, separate series reads, historical/missing-identity/conflict fail-closed behavior |

Verification honesty: an initial archive-export full-suite run failed six identity tests because Git metadata was absent; the unchanged source passed in an exact Git checkout. A direct strip-types focused invocation was unsupported for this project's type-only imports; the supported compiled focused invocation passed 46/46. Neither attempt was converted into a pass or used to alter IPD tests.

## 3. IRR artifacts corrected

- PA governance record: new §5.6; historical §§5.1–5.5 preserved.
- Tracker: current REG-06/Operator Drop pointers and register row; §18.1 row 29 reconciled to the living matrix; §16.242 and CHG-2026-11-01-21; historical §16.238 and §6.1 DEFERRED row preserved.
- Living 51×17 bundle: row 29 existence, authority, integration, wiring, data, persistence, recovery, validation, E2E, evidence, governance, acceptance, qualification, release-readiness and evidence anchor updated; capability number/name preserved. P-08 becomes a completed/reconciled entry, not an active pending task or continued deferral.
- Historical P-08 reconciliation and 2026-10-27 reconstruction receive current-state pointers only. Their historical bodies/cells remain intact.
- Evidence indexes and matrix report cross-reference the new bundle. Unrelated matrix rows, register entries, pins and gates are unchanged.

## 4. Boundaries and residuals

No production admission/deployment, AD-17/M-2 authorization, O-05 admission, IRR acceptance, IRR executable consumer, route/runtime registration, package-pin change, host execution or IPD write is created. CV-39 broker/Dhan ingestion remains distinct. The existing P-1, O-05 and production gates remain outstanding for their own recorded reasons; IPD REG-06 completion does not close them.

## 5. Validation and publication

Local validation covers matrix dimensions, worksheets, tables/filters, formula inventory, CSV/XLSX equality, status consistency, historical preservation, evidence references, checksums, Python compilation, the IRR static validator and whitespace. The publication receipt will record the actual IRR PR, exact-head checks, merge commit, post-merge checks and independent remote-main byte read-back. An open PR or local file is not represented as published main.

Evidence: `evidence/integration/reg06-operator-drop-implementation-reconciliation-2026-11-01`.
