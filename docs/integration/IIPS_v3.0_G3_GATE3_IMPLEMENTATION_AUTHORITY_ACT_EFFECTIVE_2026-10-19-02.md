# IIPS v3.0 — Gate 3 Implementation-Authority Act
## Effective bounded act — successor to `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-01`

> **Authority statement.** This act grants Gate 3 implementation authority **only** for the exact repositories, immutable bases, files, tests, commands, runtime and dependency boundaries enumerated below. It is not Gate A′ execution, not Gate 4 qualification, not a Gate 4 result acceptance, not Gate 5 admission, not a `503` lift, not a `durable:true` claim, and not production eligibility. Anything not enumerated is outside this act.

| Field | Value |
|---|---|
| **Act ID** | `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` |
| **Act type** | Gate 3 implementation authority — cross-repository, bounded, fail-closed |
| **Status** | **EFFECTIVE** — bounded implementation authority is granted on publication to IRR `refs/heads/main` with CI success and remote read-back (§15). No implementation has been performed under it. |
| **Prepared date** | 2026-10-19 (UTC) |
| **Predecessor** | `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-01` — **PROPOSED / NOT EFFECTIVE**, superseded for effectiveness purposes only; its prohibitions and its §5/§6 restrictions are carried forward in full |
| **Governing implementation request** | IPD `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md`, blob `ac4b402573b165faa771e451bbce6faeeaa4d2e0`, at IPD `main` |
| **PA decision inputs (unchanged, not reopened)** | G3-D2 `B` `node:sqlite`; G3-D3 `3b`; G3-D4 `INCLUDE CODE`; G3-D5 `REFERENCE ONLY`; G3-D6 `CONFIRM`; G3-D7 `ACCEPT WITH CHANGES` |
| **Decision records** | `docs/integration/IIPS_v3.0_G3_D2_STORAGE_TECHNOLOGY_PA_DECISION_2026-10-19.md`; `…_G3_D3_WRITE_SLICE_…`; `…_G3_D4_PROVISIONING_CODE_SCOPE_…`; `…_G3_D5_REFERENCE_ONLY_…`; `…_G3_D6_G2_SECTION_3_CONFIRMATION_…`; `…_G3_D7_IRR_SCOPE_…` |
| **Readiness investigation** | `docs/integration/2026-10-18/PKG-02G-G3-READINESS-INVESTIGATION-2026-10-19.md` |
| **IPD basis (immutable)** | `ramkivs/iips-production-market-data` `refs/heads/main` @ `be32d8c95a86b3f03bd382ccde5b6398efb351c6` |
| **IRR basis (observed at rendering)** | `ramkivs/iips-review-recovered` `refs/heads/main` @ `ef5ba83ca1bb79947d888ad3070593715f056461` |
| **Label** | `non-production, single-principal, same-host IPC` |
| **Production status** | `NON_PRODUCTION` — production **NOT AUTHORIZED** |

---

## 1. Rendering basis, delegation, and non-inferences

### 1.1 Why this act may fix the exact manifest

The predecessor act was blocked on three IPD-side fields. That block was a **manifest-pinning** gap, not an authority gap. The governing record expressly delegates the pinning to this instrument:

| Source | Exact delegation |
|---|---|
| Request §3 | "**Names are proposals for the Gate 3 act to fix.**" (host locations table) |
| Request §6 heading | "Files, tests and observable acceptance criteria (**proposed; the Gate 3 act fixes the exact list**)" |
| Request §6.1 | `package.json` / lockfile changes "only if G3-D2 selects a driver, under a separate line item" |
| G3-D3 §3.4 | "The future Gate 3 act must state the exact implementation files and tests." |
| G3-D4 §3 | "The separate Gate 3 act must name the exact IPD-main file set and tests, including the bounded provisioning code." |
| G3-D6 §2 | "Exact schema/property names remain for the Gate 3 act." |
| PKG-02G §9.1 | "the separate effective act itself is the authority that fixes it; no extra PA decision beyond the five already rendered is *in principle* needed" |

**Consequence.** Fixing bounded file names inside the already-approved scope is an exercise of delegated authority, not an invention of evidence. This act therefore distinguishes, throughout, three evidence classes:

- **[V] VERIFIED** — observed by direct repository inspection at the pinned bases this pass (§2, §4.1, §5.3, §5.7).
- **[D] DELEGATED DESIGN FIX** — a name or boundary this act fixes under the delegation above, within the approved scope. Never presented as pre-existing.
- **[A] AUTHORITY-RECORDED** — an obligation or prohibition already fixed by an accepted record (request, G-2, Gate E, contract v1, L-IPC-1 rev 2, G3-D2–D7).

No implementation detail that the accepted records do **not** establish and that exceeds the delegation is decided here. Section 5.7 states exactly where implementation latitude remains and what it may not do.

### 1.2 Non-inferences preserved from the predecessor act

- a PA scope/architecture disposition is not implementation authority (§1.1 above is the narrow exception the records themselves created);
- this act is not Gate A′ execution;
- Gate 3 CI is not Gate 4 qualification;
- Gate 4 result acceptance is not Gate 5 admission;
- Gate 5 admission is the only later act that can lift the named IRR `503` operations;
- effectiveness of this act creates **no** code, store, endpoint, migration, binding, route, CORS, listener or dependency change. It authorizes writing them.

---

## 2. Live baseline verification at rendering

### 2.1 Remote state

| Repository | Ref | Resolved SHA (this pass) | Method | Reported baseline | Drift |
|---|---|---|---|---|---|
| IRR `ramkivs/iips-review-recovered` | `refs/heads/main` | `ef5ba83ca1bb79947d888ad3070593715f056461` | `git ls-remote origin refs/heads/main`; local `HEAD` identical; worktree clean | `ef5ba83c…` | **None** |
| IPD `ramkivs/iips-production-market-data` | `refs/heads/main` | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` | `git ls-remote`; full clone `git rev-parse HEAD`; `git log` tip | `be32d8c9…` | **None** |
| IPD request blob | `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md` | `ac4b402573b165faa771e451bbce6faeeaa4d2e0` | `git rev-parse HEAD:<path>` in the IPD clone | same | **None** |
| Gate E policy blob | `evidence/cross-repository/IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md` | `4a9501bffb49abbbc0ba5b5c4f81d2841812913e` | same method | same | **None** |
| Consumer contract blob | `evidence/cross-repository/IIPS_V3_G2_IPD_IRR_PORTFOLIO_CONSUMER_CONTRACT_V1_2026-10-18.md` | `163eb1f18ce023bb9a06917de99ca279fdb86bf7` | same method | same | **None** |
| L-IPC-1 accepted text | `evidence/np04/IIPS_v3.0_G2_IPD_LOCAL_PRINCIPAL_OS_IPC_SECURITY_CONTRACT_PROPOSAL_2026-10-16.md` | `cab04b6f94618c9afad1440882ebf63437fdf6f8` | `git rev-parse HEAD:<path>` | same | **None** |

**No material drift.** Both remote heads equal the reported baselines exactly. No IPD commit exists after `be32d8c9`; the only IRR movement since PKG-02G is the merge of PR #147 (`c3c5ca2…` → `ef5ba83…`, documentation-only read-back), which is ancestor-preserving for every record this act relies on.

### 2.2 Record integrity at IRR `ef5ba83`

| Record | Blob at `ef5ba83` | Disposition |
|---|---|---|
| G3-D2 storage | `a81fdff3…` (per §16.60 manifest) | `B — node:sqlite` SELECTED AND APPROVED |
| G3-D3 write slice | `dd39af55…` | `3b` APPROVED |
| G3-D4 provisioning code | `7a20a2c5…` | `INCLUDE CODE` APPROVED |
| G3-D5 historical line | `2b40b214…` | `REFERENCE ONLY` APPROVED |
| G3-D6 G-2 §3 | `39565cd1…` | `CONFIRM` APPROVED |
| G3-D7 IRR scope | `d0f8a3be…` | `ACCEPT WITH CHANGES` APPROVED |
| Predecessor act | `c67bb544…` | PROPOSED / NOT EFFECTIVE (superseded for effectiveness only) |
| PKG-02F package | `dd2ae658…` | Publication record |

Each disposition was re-read from the merge tree; none is reopened, re-asked, or reinterpreted by this act.

### 2.3 CI state of the bases

| Repository | Head | CI workflow | Run | Result |
|---|---|---|---|---|
| IRR | `ef5ba83` | `CI` (`Typecheck · Test · Build`) | `39207948186` (2026-10-19T06:05:46Z) | `success` |
| IPD | `be32d8c9` | `CI` (`typecheck · build · test`) | `39157664430` (2026-10-18T19:12:03Z) | `success` |

### 2.4 Local reproduction performed this pass (POSIX, supplementary only)

These are **not** Gate 4 evidence and are **not** the Gate 3 acceptance evidence; they establish that the manifest below is executable and that the baselines are green before it is applied.

| Check | Command | Result |
|---|---|---|
| IPD typecheck | `npx tsc --noEmit` (IPD `be32d8c9`, `npm ci` locked) | exit `0` |
| IPD build | `npm run build` | exit `0` |
| IPD guarded tests | `npm test` | `49` suite files, `# tests 556`, `# pass 556`, `# fail 0`, guard `OK` |
| IRR typecheck | `npm run typecheck` (IRR `ef5ba83`, `frontend/`) | exit `0` |
| IRR full suite | `npm run test:ci` | `73` files, `814` tests, `814` passed, `0` failed |
| IRR guarded assertion | `node .ci/assert-tests.js .vitest-report.json` | `OK — 73 test file(s), 814 test(s), 0 failed` |
| IRR build | `npm run build` | exit `0` |
| `node:sqlite` type availability | `@types/node` `22.20.4` (locked) contains `sqlite.d.ts` with `class DatabaseSync` | present |
| `node:sqlite` typecheck probe | IPD `tsconfig`-equivalent flags, `import { DatabaseSync } from 'node:sqlite'` | exit `0` |
| `node:sqlite` runtime probe | Node `v22.22.3`, flag-free: `CREATE` / `BEGIN IMMEDIATE` / `INSERT` / `COMMIT` / `SELECT` / `close` | rows `{"n":1}`; emits `ExperimentalWarning: SQLite is an experimental feature…` |

**Install-method note (IRR).** The sandbox's TLS interception blocked `codeload.github.com`, so the IRR dependency pinned at `2e11fa3b` was installed from a locally built copy of that exact commit rather than the registry tarball. The suite ran inside the real Git working tree; the GitHub CI run of the same commands at the same commit (run `39207948186`, `success`, 73 files / 814 tests) is the authoritative baseline, and the local counts agree with it. No repository file was changed for this.

**Environment boundary (explicit).** Arena is Linux only. Nothing in §2.4 establishes Windows, browser, localhost, deployment-host, ACL/SDDL, named-pipe, crash-atomicity or restart-durability behaviour. Those remain Gate 4 (§11).

---

## 3. Preserved PA decisions G3-D2–D7

| Decision | Disposition (unchanged) | Effect preserved by this act |
|---|---|---|
| **G3-D2** | `B` — `node:sqlite` SELECTED AND APPROVED | §8 binds the implementation to `node:sqlite` only; `better-sqlite3` and every off-main lineage remain reference-only |
| **G3-D3** | `3b` — write code may exist, disabled by default, all four W-1 conditions required | §7 and the `g3_write_gate` test family enforce `WRITE_NOT_AUTHORIZED` with zero store effect |
| **G3-D4** | `INCLUDE CODE` — bounded A-2/A-3 provisioning **code** may be included; execution is a separate Gate A′ act | §5.2 includes `provisioning.ts` as a library-only module; §11 preserves `APPROVED / P-1 / NOT EXECUTED` |
| **G3-D5** | `REFERENCE ONLY` — historical 2026-10-07 durable line | §12 forbids promotion, cherry-pick, re-pin or admission of `470cc698`/`6828155e`/`cec70802` or any off-main ref |
| **G3-D6** | `CONFIRM` — all thirteen G-2 §3 requirements apply in full | §6 maps all thirteen; none is waived for single-user scope |
| **G3-D7** | `ACCEPT WITH CHANGES` in IRR capacity | §5.1 fixes exactly the D7 bounded set; §4 preserves the `503` fence, C8, and the certified-surface exclusions |

No G3-D2–D7 item is reopened. No re-approval is sought.

---

## 4. Exact IPD manifest

**Repository basis:** `ramkivs/iips-production-market-data`, `refs/heads/main`, `be32d8c95a86b3f03bd382ccde5b6398efb351c6`. Implementation must be authored and merged on `main` only. No off-main ref may be merged, cherry-picked, re-pinned or promoted.

### 4.1 Existing files permitted to be modified — **NONE**

This act authorizes **zero** modifications to existing IPD files. Every authorized change is an addition. The following are therefore byte-stable under this act and are listed with their exact blobs at `be32d8c9` as the verification anchors:

| Path | Blob at `be32d8c9` | Why frozen |
|---|---|---|
| `frontend/src/features/portfolio/portfolioStorePort.ts` | `d61f18dfdce12a7f0c4377a3c6d410026d454089` | `PortfolioStorePort`, 29-key `CALLER_SUPPLIED_IDENTITY_KEYS`, `findCallerSuppliedIdentityKeys`, `evaluatePortSaveGuard`, `SessionPortfolioStorePort` `SESSION_ONLY`/`durable:false` |
| `frontend/src/features/portfolio/portfolio-store.ts` | `3bf852b99e300a8dfa71d3b1b04ed0f7b947b4a5` | Existing in-memory `PortfolioStore`; MERGE/REPLACE, `contentDigest` idempotency, weight 100.0000 %, SHA-256 lineage, `provenanceDigest` empty-value `e3b0c442…` |
| `frontend/src/features/portfolio/portfolioStorePort.ts` / `portfolio-store.ts` / `import/*` / `*.tsx` / `index.ts` | (whole directory) | UI session capability is extended, never replaced, re-labelled or repurposed |
| `src/identity/mapping_store.ts` | `eec60c09e08ec45a29979abf25b21efddef448ae` | W-6 canonical identity authority; `UNMAPPED_IDENTIFIER` / `AMBIGUOUS_COLLISION` |
| `src/identity/security_master.ts` | `e260fd90d05e5bfcd4bdc037524722c6fccee16d` | D05 Security Master |
| `src/identity/quarantine.ts` | `70c6f6580f6ade66eb31e7dee3adc4b52b10b010` | Quarantine evidence |
| `package.json` | `0a3eec22a39048498601aa7b5672a40ede840d34` | See §8.2 — **no dependency, script, `engines` or `exports` change** |
| `package-lock.json` | `d3d7b12b6f7c378456c0fd45a82c0416b7d7778b` | No install-graph change |
| `tsconfig.json` | `6d696ec21b50beddd063376c6f4cdb4463993c23` | Already includes `src/**/*`, `tests/**/*`, `frontend/**/*`; `types: ["node"]`, `module/moduleResolution: NodeNext`, `rootDir: ./`, `outDir: ./dist` |
| `.github/workflows/ci.yml` | `aeee464feb76e2d1e9d104e1cae4e5dde37700ad` | Existing gate is sufficient; new tests are discovered automatically |
| `vite.config.ts` | `5563e1bcfadda4b9d443522481029e7f092851ad` | `npm run build` bundles only the `index.html` graph; the Node-side modules are not in it |
| every other IPD path | — | Out of scope |

### 4.2 New files permitted to be added — exact list (14)

All are **[D] DELEGATED DESIGN FIX** inside the approved `src/persistence/*` and `src/ipc/*` boundaries (request §6.1, G3-D3, G3-D4, PKG-02G §3.3). No file outside `src/persistence/` and `src/ipc/` may be added.

| # | Path (exact) | Single responsibility | Source obligation |
|---|---|---|---|
| 1 | `src/persistence/connection.ts` | Open `node:sqlite` `DatabaseSync` against the operator-local database file; set `foreign_keys=ON`, `journal_mode=DELETE` (rollback journal), `synchronous=FULL`; enforce the runtime guard of §8.3; expose one connection per process. No network, no HTTP, no URL. | Request §5.2; Gate E W-11/W-12; G3-D2; journal/synchronous posture carried from PKG-02G §4 and fixed here |
| 2 | `src/persistence/migration_ledger.ts` | Append-only, checksummed migration ledger: record migration id + SHA-256, verify every applied/expected migration at startup, apply only pending migrations, refuse tampered/unknown/unverified state. | G-2 §3(5)(6); Gate E W-12; C2/C5.3 |
| 3 | `src/persistence/migrations/001_initial_schema.ts` | Initial schema: `portfolios`, `portfolio_revisions`, `portfolio_holdings`, `portfolio_contributions` (names fixed by request §5.3; required data elements in §5.7). | G-2 §3(3)(7)(9)(13) |
| 4 | `src/persistence/migrations/002_audit_event_sequence.ts` | A-3 local audit-event sequence/table. No cross-system sink. | G3-D4; Gate E W-14; G-2 §3(12) |
| 5 | `src/persistence/migrations/003_local_principal_bindings.ts` | A-2 `local_principal_bindings` + membership table (single-`ACTIVE` invariant). | G3-D4; Gate E W-2/W-3; OC-2 |
| 6 | `src/persistence/portfolio_store.ts` | Durable domain operations behind the accepted contract: `portfolio.list/get/revisions/create/save/reset/delete`; one request = one `BEGIN IMMEDIATE` transaction = at most one immutable revision; commit-on-acknowledge; tombstone semantics; content-idempotency; lineage persistence. | Request §5.3–§5.8; Gate E W-4/W-5/W-8/W-10/W-11/W-13/W-16 |
| 7 | `src/persistence/binding.ts` | Per-request resolution of the single `ACTIVE` A-2 binding + membership with **no cache**; re-read inside the mutating transaction; absent, multiple, malformed or non-`ACTIVE` (including `REVOKED`) binding/membership handling. | OC-2; Gate E W-2/W-3; C5.2 |
| 8 | `src/persistence/audit.ts` | A-3 audit-line writer for binding/membership lifecycle and mutation events (revision records are the mutation audit). | Gate E W-14; G3-D4 |
| 9 | `src/persistence/provisioning.ts` | **Library only.** Bounded A-2/A-3 provisioning functions (create/inspect the single `ACTIVE` binding and its membership plus audit line). Must not be invoked at startup, must not be reachable from any IPC operation, and must expose no executable entrypoint. | G3-D4 `INCLUDE CODE`; §11 |
| 10 | `src/persistence/durablePortfolioStorePort.ts` | Additive adapter implementing the existing `PortfolioStorePort` over `portfolio_store.ts`: `getPortfolio`, `getAnalytics`, `getRevision`, `saveHoldings`. Declares `durability`/`durable` honestly (§8.4). Must reuse the existing pure helpers (`findCallerSuppliedIdentityKeys`, `evaluatePortSaveGuard`, `computeLineageHash`) rather than duplicating the domain model. | Request §3/§6.1; G-2 §2; G3-D6 §3.2 |
| 11 | `src/ipc/protocol.ts` | Frame codec: `uint32` big-endian length prefix + UTF-8 JSON object; request ≤ 64 KiB, response ≤ 256 KiB; envelope keys exactly `v`/`op`/`payload`/`requestId`; `v = 1` only; one request and at most one response per connection; pipelined frames refused. | Contract v1 T-2/T-3/T-4; L-IPC-1 |
| 12 | `src/ipc/endpoint.ts` | Same-host endpoint only: UNIX domain socket in an owner-only (`0700`) directory with `0600` socket mode on POSIX; Windows named pipe on the deployment host (verified only at Gate 4). Refuses to create an endpoint on name/path collision. **Creates no TCP, HTTP or URL listener.** | Contract v1 T-1; C1; T-F |
| 13 | `src/ipc/dispatch.ts` | Closed operation dispatch over §4.2 item 6; Class P refusals with **zero bytes and connection close**; Class A typed non-disclosing outcomes; C7 rejection of every caller-authority, tenant, scope and identity key (the 29 IPD keys at top level **and** inside `options`, plus `companyId`, `runtimeCompanyId`, `identityStatus`, `resolutionDisposition`, `tenantHint`, `tenantId`); `portfolio.analytics` refused as `UNKNOWN_OPERATION`. | Contract v1 §5, §6; Gate E W-1/W-6/W-15; C6/C7 |
| 14 | `src/ipc/entrypoint.ts` | Process entrypoint: `validate → connect → migrate → verify → bind`; on unverified migration, store fault, runtime-guard failure or endpoint collision, create no endpoint and exit non-zero; no fallback, no retry, no downgrade. | Request §5.1; C2/C5.3; T-E |

### 4.3 Exact test files to add (8)

`[D]` — inside the approved `tests/*` addition area. Baselines: `tests/` uses the `*.test.ts` suffix, is compiled to `dist/tests/*.js` by `npm run build`, and is discovered by directory scan in `scripts/run-tests.mjs`. **No test-runner, script or configuration change is required or authorized.**

| Test file (exact) | Request ID | Required observable result |
|---|---|---|
| `tests/g3_ipc_framing.test.ts` | T-A | Oversize (> 64 KiB), malformed, `v ≠ 1`, unknown `op`, truncated frame and pipelined frames each produce **zero bytes** and connection close; plus audit-line assertions for refused frames recorded only in the bounded local diagnostic sink, never on the wire |
| `tests/g3_caller_authority.test.ts` | T-B | Each of the 29 IPD caller-identity keys, each C7 key, and `tenantHint`/`tenantId` — at top level **and** inside `options` — refused as Class P with zero bytes and **no store access** |
| `tests/g3_binding_resolution.test.ts` | T-C | Zero, two, malformed, and `REVOKED` binding/membership → Class P, zero bytes, no owner disclosure; per-request re-resolution with no cache; A-3 audit line written for binding lifecycle events |
| `tests/g3_portfolio_read_isolation.test.ts` | T-D | Missing, foreign, tenant-mismatched and tombstoned portfolios → byte-identical `RESOURCE_UNAVAILABLE` envelope with no identifiers; `portfolio.analytics` → `UNKNOWN_OPERATION` |
| `tests/g3_startup_validation.test.ts` | T-E | Unverified/tampered migration, store fault, endpoint-name collision and sub-`22.13.0` runtime guard each create **no endpoint** and exit non-zero |
| `tests/g3_no_network_listener.test.ts` | T-F | No TCP, HTTP or URL listener is created by the IPD process; the endpoint is a local socket/pipe only |
| `tests/g3_write_gate.test.ts` | T-G | `3b` default-disabled writes: `WRITE_NOT_AUTHORIZED` for `portfolio.create/save/reset/delete` while any W-1 predicate is unmet; each missing W-1 predicate independently; zero database row delta (before/after row counts equal); `REVISION_CONFLICT` and `INVALID_REQUEST` semantics; `ALREADY_IMPORTED_NO_OP` creates no revision; audit/revision assertions for refused and accepted transitions |
| `tests/g3_durability_vocabulary.test.ts` | T-H | Session adapter remains `SESSION_ONLY` / `durable:false`; `DURABLE` / `durable:true` is reported **only** for a result served from or committed to the durable store; no durable claim before `COMMIT`; lineage/`contentDigest` preserved across `REPLACE`/`RESET` |

No new fixture files are authorized. Tests must create and remove their own temporary directories under the OS temporary directory; **no database file, journal, socket or artifact may be written inside either repository worktree**.

### 4.4 Required existing regression suites (must pass unchanged)

| Test file | Why required |
|---|---|
| `tests/bi07_portfolio_store_port.test.ts` | DP-2 2F refusal, 29-key caller-authority refusal, session revision, `ALREADY_IMPORTED_NO_OP` (T-I) |
| `tests/bi07_portfolio_ui_integration.test.ts` | UI integration through the port (T-I) |
| `tests/bi07_react_host_integration.test.ts` | React host integration unchanged |
| `tests/bi07_repeat_import_lifecycle.test.ts` | Repeat-import lifecycle unchanged |
| `tests/bi07_browser_runtime_compatibility.test.ts` | Browser runtime compatibility unchanged |
| `tests/bi08_idempotent_ingress.test.ts` | BI-08 `contentDigest` idempotency and lineage unchanged |
| **entire IPD suite** | `npm test` must report at least the verified baseline `49` suite files / `556` tests, with `0` failures, and a non-zero executed count |

### 4.5 Exact IPD test commands

Run from the IPD repository root at the implementation commit. These are the existing `ci.yml` steps; no substitution is authorized.

```bash
npm ci --no-audit --no-fund
npx tsc --noEmit
npm run build
npm test
```

Acceptance reading: `npm test` must print `# tests <n>` with `n ≥ 556`, `# fail 0`, and the guard line `[test-guard] OK — <n> test(s) executed, <p> passed, exit 0`. The new files must appear in `[test-guard] files=<n> (source suite files: <n>)` with `n ≥ 57`.

### 4.6 Dependencies, lockfile, runtime engine, configuration — **no changes**

| Item | Decision |
|---|---|
| `package.json` dependencies / devDependencies | **No change.** `node:sqlite` is a Node built-in; G3-D2 selected no native driver. `better-sqlite3` must not be added. |
| `package-lock.json` | **No change.** |
| `package.json` `scripts` | **No change.** Existing `test` (`node scripts/run-tests.mjs`) already discovers new tests. |
| `package.json` `engines` | **No change.** Current `main` has no `engines` field. This act does not add one — see §8.3 for how the runtime constraint is enforced instead. |
| `package.json` `exports` | **No change.** |
| `tsconfig.json` / `vite.config.ts` / `.github/workflows/ci.yml` | **No change.** |
| Any new npm package, provider, credential, service, native module or engine | **Not authorized.** |

### 4.7 Data elements fixed by reference, and remaining implementation latitude

**Table names fixed** (request §5.3): `portfolios`, `portfolio_revisions`, `portfolio_holdings`, `portfolio_contributions`, `local_principal_bindings`, audit-event storage from migration `002_audit_event_sequence`.

**Migration identifiers fixed** (carried from PKG-02G §3.3/§4, fixed here): `001_initial_schema`, `002_audit_event_sequence`, `003_local_principal_bindings` — exactly three, append-only, checksummed, verified at startup.

**Wire property names are not decided here — they are already fixed by accepted contract v1** and must be implemented exactly: envelope `v`, `ok`, `op`, `requestId`, `result`, `outcome`, `detail`; `PortfolioSummary` = `portfolioId`, `portfolioName`, `revision`, `holdingsCount`, `totalMarketValue`, `lastUpdated`; `PortfolioDetail` adds `holdings`, `contributions`, `weightSumPercentage`, `provenanceDigest`, `durability`, `durable`; `RevisionEntry` = `revision`, `operation` (`INITIAL|MERGE|REPLACE|RESET|DELETE`), `committedAt`, `contentDigest?`; save result = `disposition` (`SAVED_NEW_BATCH|MERGED_INTO_EXISTING|ALREADY_IMPORTED_NO_OP`), `revision`, `durability`, `durable`; delete result = `portfolioId`, `deletedAt`; outcome codes exactly as contract v1 §5.2.

**Remaining latitude — bounded.** Column spelling and internal module decomposition within the authorized files are implementation latitude, provided that: (a) every property name in contract v1 §6 is produced exactly; (b) no additional wire field, operation, header or envelope key is introduced (that is a contract revision requiring separate authority); (c) no durable field carries caller-supplied owner/tenant/scope authority; (d) the persistence boundary stays behind `PortfolioStorePort`/domain types so the storage technology remains replaceable (G-2 §3 closing paragraph). Introducing a new wire field, operation, migration beyond the three fixed above, or a fourth storage concern requires a separate act.

---

## 5. Exact IRR manifest

**Repository basis:** `ramkivs/iips-review-recovered`, `refs/heads/main`. Implementation must land on `main` only.

### 5.1 New files permitted to be added — exact list (8)

Exactly the G3-D7 §2.2 set; no addition, no substitution.

| # | Path (exact) | Bounded change |
|---|---|---|
| 1 | `frontend/server/user-portfolio/ipcClient.ts` | Same-host IPC client: framing, 64 KiB request / 256 KiB response caps, 5 s timeout, no authority/owner/tenant/scope/principal field on the wire, re-enforces OC-7/C7 before send, never auto-retries a write, treats timeout as outcome-unknown |
| 2 | `frontend/server/user-portfolio/ownerContextFromBinding.ts` | Binding-sourced owner context with fail-closed tenant hint; **no** header/cookie/query/body reading; no caller substitution |
| 3 | `frontend/server/user-portfolio/ipcPortAdapter.ts` | Adapter onto the existing `UserPortfolioPort` contract; Class P → zero bytes/close; Class A → typed refusal; **no mutation on refusal**; no fallback surface, no cache of record |
| 4 | `frontend/server/user-portfolio/firstPartySignal.ts` | C9 cross-site hardening only (first-party signal: non-simple header/JSON content type plus `Origin`/`Sec-Fetch-Site` consistency). **Never authentication.** |
| 5 | `frontend/server/user-portfolio/ipcClient.test.ts` | Framing, caps, timeouts, no authority fields on the wire, no write retry |
| 6 | `frontend/server/user-portfolio/ownerContextFromBinding.test.ts` | Binding-derived context + fail-closed hint; no caller substitution |
| 7 | `frontend/server/user-portfolio/ipcPortAdapter.test.ts` | Refusal/no-mutation, `revisions` operation, V5 contract supersession, **and the C9 first-party-signal assertions for `firstPartySignal.ts`** (see §5.4) |
| 8 | `frontend/server/user-portfolio/fenceUnchanged.test.ts` | Byte-stable read-back of `owner-context-unavailable.ts` and `user-portfolio-transport.ts`; asserts the six route paths / twelve route-method pairs still return `503` and the boundary never calls the port |

### 5.2 Existing IRR files permitted to be modified — exact list (3), bounded

| Path | Blob at basis | Permitted change | Prohibited |
|---|---|---|---|
| `frontend/server/user-portfolio/userPortfolioContract.ts` | `0dec72eb750206603196c67f6b27947420d7e6ac` | **Additive only:** (a) one new exported endpoint-setting constant whose value is the already-established name `IIPS_G2_IPC_ENDPOINT` (contract v1 OC-3); (b) dated documentation comments marking the G24 HTTP lineage (`G2_LINEAGE`, `G2_PERSISTENCE`) as historical for the IPC path. | No change to any existing export, value, type, interface or behaviour — in particular `G2_CONTRACT_VERSION` stays `'2'`, `G2_LINEAGE` stays pinned to `6828155e…`, `G2_PERSISTENCE` is **not** rewritten; no invented numeric bump; no new wire/schema field; no tenant-hint transmission constant |
| `frontend/server/executive-transport.ts` | `d1c52fe678b34295820fea0f2eac5cf408365310` | **C8 only:** remove `Access-Control-Allow-Origin: *` on owner-scoped routes; bind the server to loopback (`127.0.0.1`) instead of an unbound `listen(port)` | No route admission; no `503` lift; no scoring/analytics wiring; no change to certified `/api/portfolio` or any other route's behaviour; no new dependency |
| `frontend/vite.config.ts` | `56fd482685203dc39ec03ccaa0315528a0352893` | **C8 only:** replace `host: '0.0.0.0'` with a loopback bind and restrict `allowedHosts` to loopback hostnames | No dev-server feature addition; no proxy-target change beyond what C8 requires; no product behaviour change |

### 5.3 Byte-stable IRR files (0 bytes changed)

| Path | Blob at basis | Assertion required |
|---|---|---|
| `frontend/server/owner-context-unavailable.ts` | `cb8db45d668d28cee7e0a52721001d579a872733` | Unchanged; still returns `503` + `error: 'owner-context-unavailable'` |
| `frontend/server/user-portfolio-transport.ts` | `51704c12a467cd2f718a030b5036bc55c9afa73f` | Unchanged; all six route paths / twelve route-method pairs map to `respondOwnerContextUnavailable`; never constructs a port |

Also preserved unchanged: `frontend/server/user-portfolio/userPortfolioPort.ts` (`ba0001e88c83b070e4f16a3cdb35d34c82ec0200`), `option2F.test.ts`, `userPortfolioContract.test.ts`, `user-portfolio-transport.test.ts`, `translationBoundary.*`, `userPortfolioBoundary.*`, `frontend/src/**`, `iips-platform/**`, `frontend/package.json`, `frontend/package-lock.json`, `.github/workflows/ci.yml`.

### 5.4 Reconciliation item fixed by this act

G3-D7 §2.2 names four new implementation files but only four test files, and no dedicated test file for `firstPartySignal.ts`, while D7 §3 requires the named tests to cover C9 hardening. Adding a ninth file would exceed the D7 set; omitting coverage would breach D7 §3. **This act allocates the C9 first-party-signal assertions to `ipcPortAdapter.test.ts`** — inside the D7 set — and forbids creating an additional test file for it. This is a manifest allocation, not a scope expansion.

### 5.5 Exact IRR test commands

Run from `frontend/` at the implementation commit.

```bash
npm ci --no-audit --no-fund
npm run typecheck
npm run test:ci
node .ci/assert-tests.js .vitest-report.json
npm run build
```

Acceptance reading: `assert-tests` prints `assert-tests: OK — <files> test file(s), <n> test(s), 0 failed` with `n ≥ 814`; `npm run typecheck` and `npm run build` exit `0`.

### 5.6 IRR restrictions preserved

- All `/api/user-portfolios*` routes remain HTTP `503 owner-context-unavailable` until a separate Gate 5 admission act names qualified commits and lifts **named** operations. The `GET`/`HEAD …/context` route maps to no v1 operation.
- Certified `/api/portfolio`, the certified reference portfolio, scoring and analytics remain untouched; no user-owned portfolio input enters the certified engine without separate authority. `portfolio.analytics` stays reserved/refused.
- No retry, cache, fallback, second store, caller-supplied identity authority, or mutation on refusal.
- C8 remains **NOT MET** until the remediation above is implemented, merged and source-verified at the resulting commit. This act authorizes the remediation; it does not evidence it.
- IRR PR #114 is unrelated and remains untouched.
- No dependency change: the existing `iips-production-market-data` pin remains exactly `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`.

### 5.7 IRR basis files that must remain byte-stable

| Path | Blob at `ef5ba83` |
|---|---|
| `frontend/package.json` (pins `iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`) | `db536bd09f01f37f55f5ce9f8d901a8c3fec0552` |
| `frontend/package-lock.json` | `4f068d98cfeb538e55fb937170c0c246f41c6b63` |
| `frontend/tsconfig.json` | `900b1774c679ad887f3fa50aa172228da33f2a4e` |
| `.github/workflows/ci.yml` | `2d25176d40a15d79064574660f7cb067706d6bf9` |
| `frontend/.ci/assert-tests.js` | `fc26093b588be6e27a0568f117d91990fb5f3df3` |
| `frontend/server/user-portfolio/userPortfolioPort.ts` | `ba0001e88c83b070e4f16a3cdb35d34c82ec0200` |

---

## 6. Mapping to all thirteen G-2 §3 requirements

G3-D6 `CONFIRM` applies in full; single-user scope waives nothing.

| # | G-2 §3 requirement | IPD implementation (exact file) | Gate 3 test | Gate 4 item (not executed) |
|---|---|---|---|---|
| 1 | Explicit owner/principal identity | `binding.ts`, `migrations/003_local_principal_bindings.ts`, `dispatch.ts` | `g3_binding_resolution.test.ts`, `g3_caller_authority.test.ts` | QE-1, QE-8 |
| 2 | Explicit tenant/company context | `binding.ts` (tenant from the single `ACTIVE` membership); `src/identity/*` reused unchanged for `companyId` | `g3_caller_authority.test.ts`, `g3_binding_resolution.test.ts` | QE-1 |
| 3 | Stable durable portfolio identity | `portfolio_store.ts` (UUID assigned IPD-side; `create` never caller-assigned) | `g3_portfolio_read_isolation.test.ts`, `g3_durability_vocabulary.test.ts` | QE-3, QE-4 |
| 4 | Restart-durable persistence | `connection.ts` + `portfolio_store.ts` (commit-on-acknowledge) | `g3_durability_vocabulary.test.ts` (`DURABLE` only after `COMMIT`) | **QE-4** — create → commit → stop both IRR and IPD → restart both → byte-equal read-back (G2-D3 option (b)) |
| 5 | Versioned serialization/deserialization | `protocol.ts` (`v = 1` only) + migrations | `g3_ipc_framing.test.ts`, `g3_startup_validation.test.ts` | QE-4, QE-7 |
| 6 | Schema/version migration capability | `migration_ledger.ts` + the three fixed migrations | `g3_startup_validation.test.ts` | QE-7 (tampered migration refusal; no downgrade) |
| 7 | Lifecycle and retention | `portfolio_store.ts` (`INITIAL/MERGE/REPLACE/RESET/DELETE`; indefinite retention, no purge) | `g3_write_gate.test.ts` | QE-3, QE-9 |
| 8 | Reset and deletion semantics | `portfolio_store.ts` (`reset` preserves identity/history; `delete` is a tombstone) | `g3_portfolio_read_isolation.test.ts`, `g3_write_gate.test.ts` | QE-3, QE-9 |
| 9 | Concurrency and version semantics | `portfolio_store.ts` (`expectedRevision` mandatory; immutable revisions; +1 per commit) | `g3_write_gate.test.ts` | QE-3, QE-7 |
| 10 | Server-side authorization | `dispatch.ts` + `binding.ts` (authorization inside the transaction) | `g3_caller_authority.test.ts`, `g3_binding_resolution.test.ts` | QE-1, QE-8, QE-10 |
| 11 | Tenant/owner isolation | `portfolio_store.ts` + `dispatch.ts` (missing ≡ foreign ≡ tombstoned ≡ `RESOURCE_UNAVAILABLE`) | `g3_portfolio_read_isolation.test.ts` | QE-1, QE-8, QE-9 |
| 12 | Governed auditability | `audit.ts`, `migrations/002_audit_event_sequence.ts`, immutable revisions | `g3_binding_resolution.test.ts` (A-3 lifecycle), `g3_write_gate.test.ts` (revision audit) | QE-9 |
| 13 | Durable contribution/lineage/idempotency | `portfolio_store.ts` + `durablePortfolioStorePort.ts` (SHA-256 lineage, `contentDigest`, `ALREADY_IMPORTED_NO_OP`) | `g3_write_gate.test.ts`, `g3_durability_vocabulary.test.ts` | QE-5, QE-6, QE-10 |

Gate 3 evidence proves the code and tests pass in CI at the named commits. It does **not** prove any row above on the deployment host.

---

## 7. W-1 conjunctive guard and zero-store-effect

The accepted Gate E policy W-1 is carried verbatim. A write (`portfolio.create`, `portfolio.save`, `portfolio.reset`, `portfolio.delete`) may succeed **only** when all four hold:

| Predicate | Required content | Status at this act |
|---|---|---|
| **W-1(1)** Gate E policy accepted | `IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md`, rev 1, blob `4a9501bf…`, ACCEPTED under G2-D2 | **TRUE** as an accepted policy |
| **W-1(2)** Separate Gate 3 act naming exact repository, IPD-`main` basis, file set and tests | **This act** — §§2, 4, 5 | **SATISFIED on publication** of this act (§15) |
| **W-1(3)** Gate 4 qualification covering Gate E §4 executed on the deployment host and accepted by a separate result-acceptance act | QE-1…QE-11, QE-4 per G2-D3 option (b) | **NOT EXECUTED / NOT ACCEPTED** |
| **W-1(4)** Gate 5 admission act naming qualified commits and lifting the named IRR `503` operations | Separate act | **NOT GRANTED** |

Because W-1(3) and W-1(4) remain false, **every write is refused with zero store effect** notwithstanding W-1(2) becoming satisfied. The required behaviour is `WRITE_NOT_AUTHORIZED` (Class A, after authorization) or an earlier Class P refusal, with **no revision, holding row, contribution row, audit-success row or success response**, verified by `tests/g3_write_gate.test.ts`. No local flag, environment variable, test result, default configuration or operator assertion substitutes for any predicate. G3-D3 `3b` is a disabled-by-default code-slice disposition, not write enablement.

---

## 8. Runtime and dependency boundaries

### 8.1 Supported runtime

| Field | Value |
|---|---|
| Required Node major | **22** (both repositories' CI use `actions/setup-node` with `node-version: '22'` on `ubuntu-latest`) |
| Minimum functional runtime for the implementation | **Node ≥ `22.13.0`** — `node:sqlite` was added in `v22.5.0` and requires no `--experimental-sqlite` flag from `v22.13.0` (Node.js `doc/api/sqlite.md`, as recorded in G3-D2 §4.1) |
| Stability classification | `node:sqlite` is **Stability 1.1 — Active development** at `v22.22.3`. The accepted PA selection carries this risk. |
| Verified sandbox runtime | Node `v22.22.3`, npm `10.9.8` (Linux). Module loads flag-free and emits `ExperimentalWarning: SQLite is an experimental feature and might change at any time`. |
| Type declarations | `@types/node` `22.20.4` (already in the locked IPD install) contains `sqlite.d.ts` with `class DatabaseSync`; a typecheck probe under the IPD compiler flags exits `0` |

### 8.2 Dependency boundary

**No dependency is added, removed, upgraded or re-pinned by this act, in either repository.** `node:sqlite` is a Node built-in (G3-D2 `B`). `better-sqlite3` and every native driver remain excluded. `package.json`, `package-lock.json`, the IRR frontend lockfile and all `scripts` are byte-stable. Any need for a dependency, `engines` or `exports` change discovered during implementation **stops** the work and requires an amendment to this act.

### 8.3 How the minimum runtime is enforced (decision, since `engines` is not modified)

The implementation must enforce the constraint in `src/persistence/connection.ts`: before opening the store it reads `process.versions.node` and **refuses to proceed, exits non-zero and creates no endpoint** when the running Node is below `22.13.0`. This is covered by `tests/g3_startup_validation.test.ts`.

Rationale, stated so it is decided rather than assumed: current IPD `main` has **no** `engines` field, and adding one is a `package.json` change that this act does not authorize. A code-enforced guard is fail-closed, testable in CI, and does not silently rely on a floating `node-version: '22'` resolving to a sufficiently recent patch.

**Still unresolved and deliberately not fabricated:** the exact Node patch level of the Windows deployment host `desktop-no0nhtp`. Arena has no access to that host. The host's `node --version` and the `node:sqlite` availability there are **Gate 4 evidence items** (QE-1 prerequisite). A green POSIX CI run does **not** establish Windows behaviour.

### 8.4 Durability vocabulary

`durability`/`durable` report what the serving store actually is. `'DURABLE'`/`true` only for a result served from, or committed to, the designated durable store after `COMMIT`. The UI `SessionPortfolioStorePort` remains `SESSION_ONLY` / `durable:false` and is never re-labelled. **No `durable:true` claim of any kind — UI, documentation, tracker, evidence or release note — is permitted before the Gate 4 result-acceptance act.**

---

## 9. Restrictions and preserved boundaries (carried forward in full)

- Non-production, H-18 single-user, one-laptop scope only. **No authentication, OIDC, RBAC, multi-user, tenant-directory, enterprise or PostgreSQL capability** may be introduced.
- IPD owns the user-portfolio domain and the durable boundary; IRR is a governed consumer only.
- The existing `PortfolioStore` / `PortfolioStorePort` capability is **extended, not replaced, duplicated or re-labelled**. `src/identity/*` is used unchanged (W-6).
- PIT and the certified IRR reference portfolio are not repurposed; no user-owned portfolio data enters the certified scoring/analytics engine.
- No caller-supplied identity, owner, tenant, portfolio scope or canonical company identity is accepted anywhere.
- All accepted canonical-identity, binding, isolation, audit, lifecycle, retention, concurrency, lineage, idempotency and migration requirements remain in force (Gate E W-2…W-16).
- IRR HTTP `503` remains in force; C8 is **NOT MET** at the basis and remains unmet until the remediation is merged and source-verified.
- Gate A′ execution is separate and remains **APPROVED, P-1 adopted, NOT EXECUTED**.
- Gate 4, separate result acceptance and Gate 5 remain separate acts.
- No off-main implementation may be promoted, merged, cherry-picked, re-pinned or admitted as the G3 basis. The historical 2026-10-07 line and the Gate B `cec70802` line are **reference only**; the `better-sqlite3` implementation is not reusable.
- The 51-row capability baseline, the 13-item inventory, and IRR PR #114 are untouched.

---

## 10. Gate 3 acceptance criteria and evidence required

### 10.1 Gate 3 acceptance (implementation evidence only)

Gate 3 is satisfied for a given implementation commit set only when, at the exact named commits:

1. the IPD manifest of §4.2/§4.3 is present and **no path outside the §4 manifest** differs from `be32d8c9` (diff-stat proof);
2. the IRR manifest of §5.1/§5.2 is present and the §5.3 byte-stable files still hash to `cb8db45d…` / `51704c12…` (read-back proof);
3. IPD `npx tsc --noEmit`, `npm run build`, `npm test` pass with a non-zero executed count, ≥ 556 tests and zero failures;
4. IRR `npm run typecheck`, `npm run test:ci`, `node .ci/assert-tests.js .vitest-report.json`, `npm run build` pass with a non-zero executed count, ≥ 814 tests and zero failures;
5. the new tests of §4.3 and §5.1 are present in the executed sets and are named in the record;
6. `SESSION_ONLY`/`durable:false`, the 29-key guard, the `503` fence and both fence-file blobs are unchanged;
7. the record states the exact commits, commands, counts and CI run identifiers, and states that no Windows, deployment-host, Gate A′, Gate C, QE-1…QE-11, Gate 4, result-acceptance, Gate 5 or production evidence is thereby established.

### 10.2 CI success is not Gate 4 qualification

Both repositories' CI runs `ubuntu-latest` only. Passing CI cannot establish restart durability (QE-4), crash atomicity (QE-7), Windows named-pipe/ACL behaviour, C5.1/Q9 zero-bytes on the host, revocation-after-restart (QE-8), or any host-only behaviour. Those are Gate 4 / Gate C items executed by the operator on `desktop-no0nhtp` and accepted by a separate act.

### 10.3 Evidence required for publication and independent verification of this act

- PR into IRR `main`, PR head SHA, CI `Typecheck · Test · Build` run id and result;
- merge commit SHA and post-merge `main` CI run id and result;
- `git ls-remote origin refs/heads/main` agreement with the merge SHA;
- remote read-back of this file from `main` with SHA-256 matching the published artifact;
- diff-stat proving the publication is documentation-only (Markdown paths only);
- recorded unchanged safeguards at the merge commit (`SESSION_ONLY`/`durable:false`, `503` route table, C8 `NOT MET`, Gate A′ `NOT EXECUTED`, Gate 4/5 not granted, PR #114 untouched).

---

## 11. Downstream acts — status preserved

| Act | Status | Explicitly not implied by this act |
|---|---|---|
| Gate A′ provisioning execution | **APPROVED**, **P-1 adopted**, **NOT EXECUTED** | `provisioning.ts` is code inclusion only; it exposes no executable entrypoint, is never called at startup, and is unreachable from any IPC operation. If Gate A′ later requires an executable invocation entrypoint, that entrypoint is a **separate scope addition** requiring its own authority. P-1 still requires an absolute path outside Git worktrees, on local fixed NTFS, outside sync/temp/removable/network locations, writable without elevation, and absent before execution; a failed precondition stops the act. |
| Gate 4 qualification | **NOT EXECUTED** | QE-1…QE-11 and Gate C Q1–Q4 / Q9–Q11 remain host-only requirements on `desktop-no0nhtp`. Arena cannot execute or verify them. |
| Gate 4 result acceptance | **NOT ACCEPTED** | Requires its own act after a Gate 4 run. |
| Gate 5 admission / `503` lift | **NOT GRANTED** | Only a later act naming qualified IPD and IRR commits may lift the fence for **named** operations. |
| Gate C | **NOT EXECUTED** | Q1–Q4, Q9–Q11 (including C5.1/Q9 zero bytes) remain open. |
| C8 | **NOT MET** at the basis | Authorized to be remediated by §5.2; not established. |
| C8/result/production | — | **Production, release, eligibility, enterprise use: NOT AUTHORIZED.** |

---

## 12. Rollback and fail-closed behaviour

1. **Code rollback.** Revert the implementation PR(s) to restore the §4.1 and §5.3 blobs exactly. No partial revert is acceptable: a state in which a durable store exists but its guard, ledger verification, or fence is missing is not authorized.
2. **Fail-closed defaults.** Write path refuses unless all four W-1 predicates hold; runtime guard refuses Node < `22.13.0`; unverified/tampered migration, store fault or endpoint collision ⇒ no endpoint and non-zero exit; Class P ⇒ zero bytes and connection close; Class A ⇒ typed non-disclosing envelope; refusals perform **zero store effect**; no retry, no fallback, no cache, no downgrade.
3. **Data rollback.** Migrations are additive and non-destructive; no automated backup is claimed. Operator-local backup/restore is the Gate A pattern and is **not** exercised or proven by Gate 3. On any migration-integrity failure the process refuses to start rather than repairing rows.
4. **Fence rollback.** The IRR `503` fence remains the exclusion mechanism; no code change under this act may create a path from a browser to the durable store. If a change would, the change is out of scope and must stop.
5. **Authority rollback.** If any acceptance criterion in §10.1 fails, the implementation is not Gate 3-accepted; the act's authority remains limited to the enumerated files and grants nothing further. Any discovered need to exceed §4/§5 stops the work and requires an amendment.

---

## 13. Explicit exclusions

Not authorized by this act, in any repository: production eligibility or release; any `durable:true` claim before the Gate 4 result-acceptance act; authentication, OIDC, RBAC, multi-user, tenant-directory or enterprise expansion; PostgreSQL or any second storage technology; PIT UI; certified-scoring or analytics integration of user-owned data; `better-sqlite3` or any native driver; promotion/admission of off-main refs (Gate B `cec70802`, G24 `6828155e`, the 2026-10-07 line, or G3-D5's reference-only line); Gate A′ execution; Gate C or Gate 4 execution; result acceptance; Gate 5 admission; any `503` lift; Windows, browser, localhost, hosted-preview or LAN acceptance; `.e2b.app`/reverse-proxy/shared-host serving of owner-scoped operations; changes to the certified IRR reference portfolio, `/api/portfolio`, scoring, analytics, PIT, Reports, Macro, Screener, watchlists, collaboration or settings; IRR PR #114 and any unrelated work; and any file not enumerated in §4 or §5.

---

## 14. Verification index

| ID | Check | Result |
|---|---|---|
| V112 | IRR + IPD `main` resolved live; no drift from reported baselines; request/Gate E/contract/L-IPC-1 blobs re-read | **Verified** — §2.1 (`ef5ba83` / `be32d8c9`) |
| V113 | G3-D2–D7 six records re-read at `ef5ba83`; no contradiction; no re-approval sought | **Verified** — §2.2, §3 |
| V114 | IPD `src/persistence` and `src/ipc` contain **0** files at `be32d8c9`; every preserved blob re-computed | **Verified** — §2.1, §4.1, §5.3 |
| V115 | IPD baseline green: `tsc --noEmit` 0, `build` 0, `npm test` 49 files / 556 tests / 0 fail | **Verified** — §2.4 |
| V116 | IRR baseline green in-repository: typecheck 0, 73 files / 814 tests / 0 fail, `assert-tests` OK, build 0 | **Verified** — §2.4 |
| V117 | `node:sqlite` present and flag-free on Node `v22.22.3`; `@types/node 22.20.4` declares `DatabaseSync`; typecheck probe 0 | **Verified** — §8.1 |
| V118 | IPD `package.json` has no `engines`/`exports`; test runner discovers `tests/*.test.ts` by directory and guards zero-test runs | **Verified** — §4.6 |
| V119 | Every new IPD/IRR path falls inside the authorized scope boundaries and every fixed name is either **[V]** established, or **[D]** delegated by request §3/§6, G3-D3 §3.4, G3-D4 §3, G3-D6 §2, PKG-02G §9.1 | **Verified** — §1.1, §4.2, §4.3, §5.1, §5.2 |
| V120 | No wire field, operation, outcome code or API property is invented: all are taken from accepted contract v1 §5–§6 | **Verified** — §4.7 |
| V121 | Safeguards at the basis: `SESSION_ONLY`/`durable:false`, `503` transport, C8 `NOT MET`, Gate A′ `NOT EXECUTED`, Gate 4/5 not granted, PR #114 open and untouched | **Verified** — §2.2, §5.6, §11 |

---

## 15. Publication and effectiveness record

**Effectiveness rule.** This act is effective on publication of this exact content to `ramkivs/iips-review-recovered` `refs/heads/main` through the repository workflow, with the PR-head and post-merge CI passing and remote read-back matching by SHA-256. Before that, it is not effective and grants nothing.

### 15.1 Pre-publication state

- Rendered on branch `arena/d24d1996-iips-review-recovered` from IRR `main` @ `ef5ba83ca1bb79947d888ad3070593715f056461`.
- IPD basis re-resolved at render time: `be32d8c95a86b3f03bd382ccde5b6398efb351c6`.
- The diff for this publication is Markdown only: this act, the packet-index row, and the tracker/decision-register entry.
- No application, runtime, dependency, lockfile, route, CORS, listener, persistence, fence or configuration path is touched.

### 15.2 Read-back (appended by the read-back commit)

| Field | Value |
|---|---|
| PR | *(pending)* |
| PR head SHA | *(pending)* |
| PR-head CI run / result | *(pending)* |
| Merge commit (`refs/heads/main`) | *(pending)* |
| Post-merge `main` CI run / result | *(pending)* |
| Remote read-back SHA-256 of this file | *(pending)* |
| Independent `git ls-remote` agreement | *(pending)* |

*End of the effective act. Status is controlled by §15: **EFFECTIVE** on publication with the §10.3 evidence; until then, **NOT EFFECTIVE**. The act grants implementation authority for the enumerated files and tests only, and grants no Gate A′ execution, Gate 4 qualification, result acceptance, Gate 5 admission, `503` lift, durability claim, production eligibility, or Windows/browser/localhost acceptance.*
