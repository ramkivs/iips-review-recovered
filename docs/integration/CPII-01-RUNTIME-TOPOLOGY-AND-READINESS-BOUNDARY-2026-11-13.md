# CPII-01 — Runtime Topology and Readiness Boundary

**Record ID:** `IIPS-CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13`
**Work item:** CPII-01 — confirm runtime topology and readiness boundary (read-only investigation and documentation)
**Repository:** IRR `ramkivs/iips-review-recovered` · IPD `ramkivs/iips-production-market-data` (read-only; not modified)
**Investigated at:** `origin/main` = `a835d4af019ab4f677ab238ec42d44326f06a771`
**Operating model:** personal, single-user, local Windows, non-production
**Focus:** IID Identity Coverage and Investment Coverage operationalisation
**Outcome:** topology and both coverage execution paths established from repository evidence and confirmed by a
read-only in-sandbox observation; **the readiness boundary is NOT satisfied** for either coverage surface; two named
authoritative baselines are **absent from both repositories**, so requirement 5 is reconciled against explicitly
labelled substitutes and requirement 6 is **blocked**; **no implementation, no code change, no data provisioning**.

> **Date note.** The session run date is 2026-11-12. The deliverable filename carries `2026-11-13` exactly as the work
> item specifies and is retained verbatim; it is not a claim about when the investigation ran. The HTTP probe passed
> `asOf=2026-11-13` as an arbitrary query parameter.

---

## 1. What was asked, what is claimed, what is not claimed

**Asked.** An evidence-backed view of the existing local IIPS runtime topology and readiness boundary for IID
Identity Coverage and Investment Coverage operationalisation, using existing implementation and contracts; every
host-only dependency identified and marked; findings reconciled against the 11 November readiness assessment and the
12 November master roadmap; prerequisites for CPII-02…CPII-06 identified. Read-only. No fixes, no provisioning.

**Claimed.** The two-process runtime topology, the Identity Coverage execution path, the Investment Coverage
execution path, the data-directory resolution rule, the integrity-verification mechanism, the exact fail-closed
behaviour of both surfaces, and the eight-finding readiness boundary are all established from repository source and
— for the fail-closed behaviour and the readiness output — **observed**, not inferred (§6, §8). Every host-only
dependency is listed and marked unavailable (§7).

**Not claimed.** No inspection of, connection to, or statement about the operator's Windows host. No CI result. No
browser journey. No IPD runtime behaviour. No readiness for IID-01/02/03. Nothing was implemented, changed,
installed, provisioned or minted (§11). CPII-02…CPII-06 were not executed and their prerequisites are **not**
derived here, because the roadmap that defines them does not exist in either repository (§2, §10).

---

## 2. Authoritative baseline availability — a blocking absence, evidenced

CPII-01 names two authoritative baselines. **Neither exists.** This was established by exhaustive search, not
assumed:

| Baseline named by CPII-01 | Search performed | Result |
|---|---|---|
| `IIPS-CPII-MASTER-ROADMAP-2026-11-12` | filename search across IRR working tree (excluding `node_modules`/`.git`); `git grep -l -i CPII`; `git log --all --name-only` across **every** branch; GitHub code search `CPII` and `MASTER-ROADMAP` in **both** repos; full recursive git-tree path listing for **both** repos; installed IPD dependency tree | **absent everywhere.** `MASTER-ROADMAP`: 0 matches in both repos. No `CPII`/`MASTER-ROADMAP` path in either tree. Never committed on any IRR branch. Not shipped in the installed IPD package |
| the "11 November IID readiness assessment" | filename search for `*2026-11-11*` in both repos; `*IID*` × readiness/assessment/status; `git grep -l -i "iid readiness\|readiness assessment"` | **absent.** IRR's only 2026-11-11 documents are `DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` and `DHAN-LIVE-MARKET-DATA-CURRENT-STATE-INVESTIGATION-2026-11-11.md`; IPD's are `2026-11-11-broker-import-stage4-class-p.md` and `2026-11-11-live-class-p-retrieval-feasibility.md`. **All four are Dhan Live / Broker Import — explicitly excluded from this scope** |

**The "CPII" grep hits are false positives and are recorded as such.** Every case-insensitive `cpii` match in IRR is
the substring `C-P-I-I` inside **`getCPIIndex`** — the MoSPI macro indicator endpoint (e.g.
`docs/OPERATOR_RUNBOOK.md:348`, `frontend/server/macro/mospi-source.ts:58`). There is no `CPII` work-item token
anywhere in tracked content. IPD returns 0 matches.

**Consequence, stated rather than papered over.** Requirement 5 cannot reconcile against the named baselines, and
requirement 6 cannot derive prerequisites for CPII-02…CPII-06, because **those work items are defined only by the
absent roadmap**. Neither baseline was altered, reconstructed, inferred or silently replaced. Per the operator's
decision, the reconciliation in §9 uses the two nearest **actual** IID baselines, labelled as substitutes at every
use:

- **`IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09.md`** (9 Nov) — the runtime dependency assessment
- **`IID-IDENTITY-AND-INVESTMENT-COVERAGE-SEPARATION-2026-11-10.md`** (10 Nov) — the Identity/Investment coverage separation

These are **substitutes, not the named baselines.** No claim in this record is roadmap-aligned, because no roadmap
was available to align to.

---

## 3. Verified component and runtime topology

### 3.1 Two local processes, one loopback boundary

| Process | Started by | Bind | Port | Evidence |
|---|---|---|---|---|
| **Vite dev server** (SPA shell) | `npm run dev` → `vite` | `0.0.0.0` | `5173` | `frontend/vite.config.ts:12` (`host`), `:14` (`port`), `:13` (`allowedHosts: ['localhost','127.0.0.1','.e2b.app']`) |
| **Executive transport** (backend HTTP) | `npm run server:dev` → `tsx --env-file-if-exists=../.env.local --env-file-if-exists=.env.local server/executive-transport.ts` | **`127.0.0.1` only** | `EXEC_TRANSPORT_PORT ?? 8787` | `frontend/server/executive-transport.ts:558` (port), `:721` (`EXEC_TRANSPORT_BIND_HOST = '127.0.0.1'`) |

The browser reaches the SPA on 5173; the SPA reaches the backend **only** through Vite's proxy, which forwards
**`/api` alone** to `http://localhost:8787` (`frontend/vite.config.ts:17`). The transport never binds a public
interface, which is consistent with the personal single-user local non-production model. Observed startup line:
`Executive transport listening on 127.0.0.1:8790` (§6).

**Topology finding T-1 — the proxy forwards `/api` only, so the credential-free JS-free view is unreachable through
the dev server.** `COVERAGE_ROUTES.html = '/investment/coverage'` (`iips-platform/src/investment/identity/coverageEndpoint.ts:22`)
is served by the transport but is **not** under `/api`, so Vite does not proxy it. The server-rendered identity
report is reachable **only** directly on the transport (`127.0.0.1:8787/investment/coverage`). Any operator
instruction that implies reaching it through the SPA origin is wrong.

**Topology finding T-2 — one path, two different servers, two different capabilities.** `/investment/coverage` is
simultaneously:

- the **SPA client route** for **Investment** coverage — `routes.ts:66` `investmentCoverage: '/investment/coverage'`
  → `InvestmentCoveragePage.tsx`, reading `/api/investment/coverage/investment`; and
- the **transport's server-rendered** *Identity* coverage HTML view — `COVERAGE_ROUTES.html`.

Through Vite (5173) that path renders the **Investment** SPA page; directly on the transport it renders the
**Identity** HTML report. Observed in §6: the same path returned the *identity*-unavailable HTML (503) on the
transport while `/api/investment/coverage/investment` returned a 200 investment report. This overlap is **already
disclosed** by the separation baseline (§5, "stated rather than silently changed"), so it is recorded here as a
confirmed characteristic and an operator-confusion risk — **not** as a new defect and **not** as something this work
item changed. Note additionally that the `identityCoverage` doc comment (`routes.ts:18-19`, "the server also renders
the same report at `/investment/coverage`") now points at a path the SPA uses for the *other* capability.

### 3.2 Module composition

`iips-platform` (`@iips/platform`) is a **library with no server**: its scripts are `typecheck`, `test`,
`test:iid` only. The frontend server imports it by **relative path**, not as a package —
`../../../iips-platform/src/investment/...` (`frontend/server/investment/sources.ts`, `coverage-transport.ts`,
`runtimeReadiness.ts`). The platform deliberately exposes runtime adapters through one module so the transport does
not reach into its internal layout (`iips-platform/src/investment/identity/runtime.ts:1-12`).

Three IPD-pinned GitHub dependencies (`frontend/package.json`):

| Package | Pin |
|---|---|
| `iips-np04-governed-persistence` | `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` |
| `iips-production-market-data` | `github:ramkivs/iips-production-market-data#1aee57fe093b4fb15eaf3a9ac67532ee40262fe2` |
| `iips-broker-import` | `github:ramkivs/iips-production-market-data#1aee57fe093b4fb15eaf3a9ac67532ee40262fe2` |

No pin was advanced, changed or evaluated for advancement. **No IPD change was made or proposed.**

### 3.3 Routes relevant to the two coverage capabilities

| Route | Server | Capability | Handler |
|---|---|---|---|
| `GET /api/investment/coverage?asOf=` | transport | **Identity** coverage JSON | `coverageEndpoint.ts` `COVERAGE_ROUTES.json:21` |
| `GET /investment/coverage?asOf=` | transport | **Identity** coverage server-rendered HTML | `COVERAGE_ROUTES.html:22` |
| `POST /api/investment/coverage/preview` | transport | broker-preview rows held by the client; nothing persisted | `COVERAGE_ROUTES.previewEvaluation` |
| `GET /api/investment/coverage/investment?asOf=` | transport | **Investment** coverage JSON | `investmentCoverageEndpoint.ts` `INVESTMENT_COVERAGE_ROUTES.json:30` |
| `/identity-coverage`, `/investment/coverage` | SPA | the two separate pages | `routes.ts:26`, `routes.ts:66` |

All four transport paths are matched in one block at `executive-transport.ts:831-854`, which lazily imports
`coverage-transport` and `sources` and answers `503 {"error":"investment-coverage-unavailable"}` if the handler
itself throws. The investment route is matched **before** the identity route deliberately, because the identity
handler matches `/api/investment/coverage` exactly and would otherwise swallow it
(`frontend/server/investment/coverage-transport.ts:124-132`).

The IID-3 assessment surface (`investment-transport.ts:38-62`) declares exactly three read-only route entries —
`company-assessment`, `company-assessment-version`, `investment-coverage` — with no mutating entry in the table.

### 3.4 Configuration and data-directory resolution

**One rule, two consumers, identical precedence:**

```
identity  : resolveIdentityDir(dataRoot)   → <root>/investment/identity      sources.ts:557
dataset   : resolveDatasetDir(options)     → <root>/investment/dataset       localSnapshotStore.ts:42
root      : explicit dataDir/dataRoot  >  IIPS_DATA_DIR  >  resolve(process.cwd(), '.iips-data')
```

`FUNDAMENTALS_BOUNDARY` (`port/fundamentalsReadPort.ts:38-46`) is the single frozen statement of that convention:
`dataDirEnv: 'IIPS_DATA_DIR'`, `defaultSubdir: 'investment'`, `datasetSubdir: 'dataset'`,
`manifestFile: 'manifest.json'`. The precedence is implemented once per consumer
(`localSnapshotStore.ts:41-46`); the readiness module repeats the same resolution rather than importing it and says
so — "Mirrors the governed default without importing a second resolver for the same convention"
(`runtimeReadiness.ts:437`). The two resolvers must therefore be read together: a change to either convention has to
be made in both places.

**Topology finding T-3 — the effective data domain depends on the transport's working directory.** When
`IIPS_DATA_DIR` is unset the root resolves to `<process.cwd()>/.iips-data`. The resolved directory is therefore a
property of *how and where the operator starts the transport*, not of the repository. Nothing commits a default:
`.env.example:49` carries `# IIPS_DATA_DIR=/abs/path/iips-data` **commented out**, and neither `.env.local` nor any
`.iips-data/` directory is committed (verified absent). This is the single most consequential host-only unknown
(§7 H-1).

---

## 4. Identity Coverage — data and execution path

### 4.1 Data

Three plain JSON files in the existing local data domain — **no database, no new store**
(`iips-platform/src/investment/identity/sources.ts:1-13`, `:549-554`):

```
<IIPS_DATA_DIR>/investment/identity/eligible-roster.json
<IIPS_DATA_DIR>/investment/identity/listing-map.json
<IIPS_DATA_DIR>/investment/identity/corporate-actions.json
```

Each file is **content-addressed**: its version is the sha256 of its canonical content (`digestOf`), so "a silently
edited roster cannot masquerade as the same roster" (`sources.ts:4-7`, `:524-526`). The loaded set exposes
`rosterVersion`, `listingMapVersion`, `corporateActionTableVersion` and `rosterDataClass`
(`identity/coverage.ts:73-79`).

`rosterDataClass` is derived at `sources.ts:542-544`:
`texts.dataClass ?? (/synthetic/i.test(roster.rosterLabel) ? 'SYNTHETIC_FIXTURE' : 'OPERATOR_SUPPLIED')`.

### 4.2 Loading, validation and exact fail-closed behaviour

`loadIdentitySourcesFromDir(dir)` (`sources.ts:563`) → `loadIdentitySources(texts)` (`sources.ts:510-511`). The contract
is **total and fail-closed**: *"Any issue in any file rejects the whole set"* — "a partially trusted roster is
exactly how a wrong identity gets manufactured" (`sources.ts:4-7`, `:510-511`).

| Stage | Refusal |
|---|---|
| file presence | any of the three absent → `IDENTITY_SOURCE_MISSING`, listing the missing keys; **no partial load** |
| JSON parse | `INVALID_JSON` |
| schema | `schemaVersion !== IDENTITY_SCHEMA` → `SCHEMA_MISMATCH`, immediate return |
| roster | `ISSUER_ID_MISSING/INVALID`, `DUPLICATE_ISSUER`, `CIN_INVALID`, `ISIN_INVALID`, `ISSUER_KEY_CONFLICT` (id must equal its CIN/ISIN key; a CIN or equity ISIN claimed by two issuers), `INVALID_STATUS` (`ELIGIBLE\|EXCLUDED`), `SECURITY_INCOMPLETE`, `DUPLICATE_SECURITY`, `DUPLICATE_ISIN`, `UNKNOWN_ISSUER`, `INVALID_INSTRUMENT_TYPE`, `ASSESSABLE_NON_EQUITY`; **AC-1.5**: an issuer declaring `equityIsin` must own a security with that ISIN |
| listing map | `LISTING_ID_MISSING/INVALID` (must equal its canonical recomposition), `EXCHANGE_NOT_SUPPORTED`, `INVALID_SERIES`, `UNKNOWN_SECURITY`, `INSTRUMENT_MISMATCH`, `EFFECTIVE_FROM_MISSING`, `WINDOW_INVERTED`, **`AMBIGUOUS_LISTING`** (two windows of one `listingId` must not overlap — "two identities for one key") |
| corporate actions | `ACTION_INCOMPLETE`, `DUPLICATE_ACTION`, `UNKNOWN_ACTION_TYPE` (closed 13-member set, `sources.ts:52-66`), `UNKNOWN_ISSUER`, `INVALID_FACTOR` (`adjustmentFactor > 0`), `SUCCESSOR_INVALID`, `SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE` (ratios must sum to 1 ±1e-6), `SUCCESSORS_REQUIRED` (`MERGER`/`DEMERGER`) |

Resolution states (`identity/resolver.ts:13-14`, `:121`, `:154`): `RESOLVED`, `INELIGIBLE`
(`ISSUER_NOT_ELIGIBLE`), `OUT_OF_SCOPE_SECURITY`, `AMBIGUOUS`, `AMBIGUOUS_LISTING`, `STALE_REFERENCE`;
`assessable` is true only for `RESOLVED` (`resolver.ts:531`).

### 4.3 API and UI consumption — three surfaces, all mandatory

`createCoverageProviders` (`frontend/server/investment/sources.ts:196-205`) wires four reads:

1. **holdings** — `createHoldingsProvider` → `IpcUserPortfolioPort` over the established **same-host IPC** path.
   Throws *before* constructing the port unless the server-owned binding precondition is established
   (`readBindingPrecondition` → `ownerContextFromBinding` → `isOwnerContextEstablished`). Scope is deliberately
   empty so **IPD** resolves the owner from its own active binding.
2. **watchlist** — `createWatchlistProvider` → `listWatchlists(tenantId, ownerUserId)`; throws unless
   `resolveOwnerContext(env)` is non-null.
3. **identity files** — `loadRuntimeIdentitySources(dataRoot)`.
4. **financialCoverage** — disclosure only, from the dataset (§5).

Surfaces 1 and 2 are collected together and **any failure is deliberately fatal**: the transport throws
`coverage source surface unavailable (<surface>: …)` and answers **503 naming the surface**, "because a coverage
total that silently omits a surface would be a wrong total" (`coverage-transport.ts:80-97`, `:1-15`).

UI: `IdentityCoveragePage.tsx` at SPA route `/identity-coverage`, client `frontend/src/api/investmentCoverage.ts`
(`json: '/api/investment/coverage'`, `preview: '/api/investment/coverage/preview'`).

> **Identity Coverage readiness consequence — IC-1.** Identity Coverage cannot be operationalised by IRR alone. It
> requires **IPD** to provision the active owner binding and run the IPC peer (surfaces 1), plus two operator-owned
> carrier files (surfaces 2), plus the three authoritative identity files. This is the structural difference between
> the two capabilities (§5.4).

---

## 5. Investment Coverage — data and execution path

### 5.1 Dataset location and installation mechanism

Location: `<IIPS_DATA_DIR>/investment/dataset` (§3.4). Installation is the **existing IID-0 ingestion CLI** —
nothing else, and no new store:

```
tsx src/investment/cli/ingest.ts --input <dir> --dataset-dir <dir> [--now <iso>] [--allow-errors] [--dataset-schema <schema>]
```
(`iips-platform/src/investment/cli/ingest.ts:5`, `:55-71`, `:128-144` → `writeDataset`, `ingestion/writer.ts:81`).
`now` defaults to `new Date().toISOString()`. The CLI writes `manifest.json` plus the content files and the
coverage report (`COVERAGE_FILE_NAME`).

### 5.2 Local snapshot discovery and integrity verification

`openLocalSnapshot(options)` (`port/localSnapshotStore.ts:123`) → `readDataset(dir)` (`ingestion/writer.ts:118`):

1. `manifest.json` must exist, else **`DatasetMissingError`**;
2. every file named in `manifest.files` must exist, else **`DatasetIntegrityError`** naming the file;
3. each is sha256-hashed and `verifyManifest` checks **both** the per-file digests **and** the recomputed content
   digest, else **`DatasetIntegrityError`** (`dataset file digest mismatch (<file>)` or `recomputed content digest
   does not match the manifest`);
4. `datasetSchema` travels **with** the dataset, "a reader that dropped it would assess a V2 dataset as V1 and refuse
   the one item V2 introduces (`L-036`)" (`writer.ts:139-141`).

Both errors are wrapped into `FundamentalsBoundaryError` carrying `{dataDir, reason}`
(`localSnapshotStore.ts:139-144`); `resolveFundamentalsPort` converts that into
`{available:false, reason, boundary, dataDir}` — "the caller gets a port, or the precise reason it has none". The
store is **read-only by construction**: no write method exists and state is an ECMAScript private `#state`, so
"there is no data property for a caller to mutate" (`localSnapshotStore.ts:69-72`, `:1-9`).

### 5.3 Coverage measurement and report

`investmentCoverageFromLocalDataset(asOf, dataRoot)` (`identity/runtime.ts:91`) opens the snapshot and reads
manifest, issuers, securities, periods, prices, operatingMetrics and issues, then calls
`buildInvestmentCoverageReport` (`coverage/investmentCoverage.ts`). Sector measurement comes from
`coverage/measure.ts` `measureCoverage`; the IID-0 disclosure from `identity/coverage.ts`
`buildFinancialCoverageDisclosure`. The sibling `financialCoverageFromLocalDataset` (`runtime.ts:39-44`) additionally
extracts `UNMAPPED_XBRL_TAG` issues.

The report (`investmentCoverage.ts:91-132`) carries `dataset{datasetVersion, contentDigest, provider, licence,
dataAsOf, knownAsOf, lastImportAt, importRunId, quality, completenessPct, datasetClass, issuers, securities,
listings, annualPeriods, quarterlyPeriods, prices, operatingMetricRecords, corporateActions, earliest/latestPeriodEnd}`,
`sectors[]`, `measuredSectors`/`totalSectors`/`outstandingSectors`, per-issuer `issuers[]`, `counts`, `issues[]`,
`financialCoverage` (carried verbatim) and `statusLine`.

**Absent dataset is a truthful answer, never an error and never an estimate:** `runtime.ts` catches and reports
`datasetClass: 'NONE'` (`:78-89`, `:116-125`); `financialClass(null)` → `'NONE'`
(`investmentCoverage.ts:165-170`); the UI keys off it — `datasetAbsent = report.dataset.datasetClass === 'NONE'`
(`InvestmentCoveragePage.tsx:149`).

### 5.4 Independence from Identity Coverage — by construction

`investmentCoverageFromLocalDataset` loads the identity sources for **one purpose only**: to disclose whether they
could be loaded. "Their absence never prevents the dataset position from being computed"
(`identity/runtime.ts:78-89`). The report carries `identitySourcesAvailable`, `identitySourceDetail`, and
`issuerIdentityState: null` — where `null` means **"not evaluated"** and "is never reported as 'no dependency'"
(`runtime.ts:137-144`; separation baseline §3.6). Route ordering enforces it (§3.3).

> **Investment Coverage readiness consequence — IC-2.** Investment Coverage depends on **one** thing: a verified
> dataset at `<IIPS_DATA_DIR>/investment/dataset`. It needs **no** IPD binding, **no** IPC peer, **no** carrier file
> and **no** identity file. It is therefore the capability that can be operationalised entirely inside IRR plus one
> operator host action. This is the single most useful asymmetry this investigation established.

### 5.5 A live classifier divergence on this path (recorded, not changed)

Two shipped rules classify the same dataset differently:

| Path | Rule | Vocabulary |
|---|---|---|
| Investment Coverage read model — `coverage/investmentCoverage.ts:165-170` `financialClass()` | substring test `/synthetic\|test-fixture\|fixture/i` over `provider + licence` | `SYNTHETIC_FIXTURE \| OPERATOR_SUPPLIED \| NONE` — **no fail-closed member** |
| Assessment path — `fundamentals/datasetClass.ts:78-88` `classifyDataset()` | declared `sourceRights.state` | `SYNTHETIC_REFERENCE \| OPERATOR_SUPPLIED \| UNKNOWN` — **fail-closed default `UNKNOWN`** |

Both exist at `origin/main` `a835d4a`. This record **documents** the divergence as a repository fact affecting how
Investment Coverage labels a dataset; it does not correct it, choose between the vocabularies, or treat it as in
scope for CPII-01. It is flagged because any CPII item that operationalises Investment Coverage will publish
`datasetClass` to an operator, and the two rules can disagree on the same bytes. (This divergence is separately
recorded as `L-041` on the WI-13 branch; that record is **not** a prerequisite for anything here and PR #562 was not
reopened.)

---

## 6. Observed readiness boundary — the eight findings

`npm run iid:readiness` → `tsx server/investment/cli/iid-readiness.ts` (`frontend/package.json`). The CLI is
**read-only by construction**: "It opens no database, contacts no IPC peer, writes nothing, and changes no
environment" (`frontend/server/investment/cli/iid-readiness.ts:7-9`). It delegates to `assessIidReadiness` (`runtimeReadiness.ts:466`), which
calls the **existing** resolvers and constructs nothing. It deliberately does **not** call
`loadAuthoritativeNp04Persistence()`, because that resolver opens the database with
`createDirectory: true, migrate: true` — "calling it from a diagnostic would CREATE and MIGRATE a database as a side
effect of asking a question" (`runtimeReadiness.ts:10-15`).

`ready` is claimed only for the **read path**, excluding the enablement finding: every read-critical finding must be
`irr-owned-operational` or `ipd-owned-operational` (`runtimeReadiness.ts:487-492`).

**Observed in this sandbox, unconfigured environment** (all `IIPS_*` unset; `platform=linux node=22.22.3`;
`READ-PATH READY: NO`; summary `user-host-provisioning-required: 4`, `irr-owned-not-configured: 3`,
`ipd-owned-unavailable: 1`; 8 findings, 7 read-critical, 6 disclosures):

| # | Finding id | Gates | Ownership observed | Reason observed | Setting(s) | Action owner |
|---|---|---|---|---|---|---|
| D1 | `identity-files` | IID-01/02/03 | user-host-provisioning-required | `IDENTITY_SOURCE_MISSING (3 of 3 files absent)` | `IIPS_DATA_DIR` | USER_HOST |
| D2 | `np04-assessment-store` | IID-01/03 | irr-owned-not-configured | `DATABASE_PATH_NOT_CONFIGURED` | `IIPS_NP04_DATABASE_PATH` | USER_HOST |
| D3 | `reports-owner-context` | IID-01/03 | user-host-provisioning-required | `REPORTS_OWNER_CONTEXT_UNAVAILABLE (path-not-configured)` | `IIPS_REPORTS_OWNER_PATH` | USER_HOST |
| D4 | `owner-context-carrier` | IID-02 | user-host-provisioning-required | `OWNER_CONTEXT_UNAVAILABLE (path-not-configured)` | `IIPS_OWNER_CONTEXT_PATH` | USER_HOST |
| D5 | `ipd-binding-precondition` | IID-02 | **ipd-owned-unavailable** | `BINDING_NOT_PROVISIONED` | `IIPS_G3_IPC_BINDING_PROVISIONED` | **IPD** |
| D6 | `ipc-endpoint` | IID-02 | irr-owned-not-configured | `ENDPOINT_NOT_RESOLVED (ENDPOINT_NOT_CONFIGURED)` | `IIPS_G2_IPC_ENDPOINT` | USER_HOST |
| D7 | `fundamentals-dataset` | IID-01/03 | user-host-provisioning-required | `DATASET_DIRECTORY_ABSENT` | `IIPS_DATA_DIR` | USER_HOST |
| D8 | `local-personal-use-enablement` | IID-02 | irr-owned-not-configured | `LOCAL_PERSONAL_USE_ABSENT` | `IIPS_LOCAL_PERSONAL_USE` | USER_HOST |

**Exit-code semantics, observed:** default `0` even with everything outstanding ("this is a REPORT, and a non-zero
default would make it look like a failed operation rather than an honest inventory"); `--strict` → `1`; invalid
invocation → `2` (`frontend/server/investment/cli/iid-readiness.ts:11-18`; verified 0 / 1 / 2).

**Observed HTTP fail-closed behaviour** (transport started read-only on an isolated port `8790` with an **empty**
isolated `IIPS_DATA_DIR=/tmp/cpii01-probe/data`; startup line `Executive transport listening on 127.0.0.1:8790`):

| Probe | Result |
|---|---|
| `GET /api/investment/coverage/investment?asOf=2026-11-13` | **200** — `datasetClass: NONE`, `datasetVersion: NONE`, `quality: unavailable`, `measuredSectors: 0 / 13`, `identitySourcesAvailable: false`, `identitySourceDetail: "eligible-roster.json: IDENTITY_SOURCE_MISSING"`, `statusLine: "No investment dataset is installed: no issuer is covered."` → **IC-2 confirmed at runtime: Investment Coverage answers despite identity being absent** |
| `GET /api/investment/coverage?asOf=2026-11-13` | **503** `identity-sources-unavailable` — "No identity is established and no row is classified", with file-level `issues[]` → **fail-closed confirmed** |
| `GET /investment/coverage?asOf=2026-11-13` | **503** `text/html`, 1553 B, "Identity coverage is unavailable" → **T-1/T-2 confirmed: this path is the identity HTML view, not the investment page** |
| `GET /api/health` | **200** `{"status":"ok","transport":"program-v3.0 executive (dev)"}` regardless of every finding above → **health is not a readiness check** |

**Observation O-1 — the identity 503 body discloses a resolved filesystem path.** Its `issues[0].subject` was
`/tmp/cpii01-probe/data/investment/identity` (from `sources.ts:572-578`, where `subject` **is** the directory). The
readiness CLI is explicitly engineered never to do this — "Paths are reduced to a presence/kind fact so the report is
safe to paste into a review record" (`runtimeReadiness.ts:21-24`). Recorded as an **inconsistency between two
surfaces' disclosure discipline**, not as a security claim: this is a local single-user non-production app and the
path is the operator's own. Nothing was changed.

---

## 7. Repository-established facts versus host-only unknowns

### 7.1 Established from the repository (verifiable by any reader at `a835d4a`)

- The two-process topology, bind addresses, ports and the `/api`-only proxy (§3.1).
- The complete data-directory resolution rule and its `<cwd>/.iips-data` fallback (§3.4).
- The three identity files, their content-addressing, the full validation grammar and total fail-closed refusal (§4).
- The dataset location, the ingestion CLI as the **only** installation mechanism, and the manifest/digest integrity
  verification in `readDataset` (§5.1–5.2).
- Investment Coverage's structural independence from the identity sources (§5.4), confirmed at runtime (§6).
- Identity Coverage's hard dependency on IPD binding + IPC peer + two carriers (§4.3).
- The eight-finding readiness boundary, its `ready` rule, its exit-code semantics and its six disclosures (§6).
- The `financialClass` / `classifyDataset` divergence (§5.5).

### 7.2 Host-only unknowns — **explicitly unavailable; not inspected, not inferred**

**Arena did not access, connect to, or inspect the operator's Windows machine, and makes no claim about it.** The
readiness module states the same discipline about itself: *"This report describes only the process environment it
ran in. An absent setting here is NOT evidence about any other host, including the operator Windows machine"*
(`runtimeReadiness.ts` disclosure 4) and *"An Arena sandbox absence is NOT evidence about the user's Windows host,
so nothing here infers a host limitation from this process's environment"* (`runtimeReadiness.ts:55-58`).

| # | Host-only fact | Why it cannot be established here | How the operator establishes it |
|---|---|---|---|
| H-1 | **Effective `IIPS_DATA_DIR`** | No default is committed (`.env.example:49` commented out); the fallback depends on the transport's CWD (T-3) | `echo %IIPS_DATA_DIR%` in the shell that starts the transport, plus that shell's CWD |
| H-2 | **Actual running process environment and working directory** | Process state of a machine Arena cannot reach | `npm run iid:readiness -- --json` on the host; the report names every setting without echoing values |
| H-3 | **Actual installed identity files** (three JSONs, and whether they are authoritative rather than fixtures) | Filesystem of the host | readiness D1 → `IDENTITY_SOURCES_VALID`; the resolver refuses the whole set on any defect |
| H-4 | **Actual installed fundamentals dataset** and whether it passes digest verification | Filesystem of the host | readiness D7 reports **directory presence only** (§8 B-1); real verification needs `openLocalSnapshot`/`readDataset` via the coverage endpoint or the dataset reader |
| H-5 | **`iid:readiness` output on the Windows host**, and `--strict` exit code | Must run in the host's environment | `npm run iid:readiness -- --strict`; P6-B prerequisite #6 requires exit `0` |
| H-6 | Whether the NP-04 store exists and **contains assessment versions** | The diagnostic deliberately will not open a database | `show-investment-chain` CLI (readiness disclosure 2 assigns exactly this) |
| H-7 | Whether **IPD** has provisioned the active binding and is listening on the IPC target | IPD-owned; IRR can only read a declaration, and "a declaration is not a verified binding" | an actual portfolio read through the transport; IPD adjudicates per request |
| H-8 | Windows named-pipe resolvability (`\\.\pipe\…`) | On POSIX a socket is statable, a Windows named pipe is not — `readiness` returns `readable: null` by design (`runtimeReadiness.ts:382-388`) | host-side `resolveIpcEndpoint` plus a live peer |
| H-9 | Any **browser** journey | No browser verification performed; none claimed | P6-B prerequisite #7 |

**Every sandbox observation in §6 is labelled sandbox evidence and is not host evidence.**

---

## 8. Current readiness findings and exact blockers

**Overall: NOT READY for either coverage capability.** Read-path ready = **NO** (observed). The blockers differ
sharply between the two capabilities, which is the operationally important result.

### 8.1 Investment Coverage — one blocker, IRR-plus-operator only

| Blocker | Exact evidence | Owner | Action |
|---|---|---|---|
| **B-1** No verified fundamentals dataset at `<IIPS_DATA_DIR>/investment/dataset` | readiness D7 `DATASET_DIRECTORY_ABSENT`; HTTP 200 with `datasetClass: NONE`, `measuredSectors: 0/13`, `statusLine: "No investment dataset is installed: no issuer is covered."` | USER_HOST | run the existing ingestion CLI (§5.1) against operator-supplied fundamentals. **No IRR code change is required** |
| **B-2** *Boundary weakness, not a data blocker:* readiness D7 verifies **directory existence only** | `runtimeReadiness.ts:435-462` uses `existsSync(dir)`; reason `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED`, `readable: null`. The runtime path is stronger — `readDataset` verifies every digest (§5.2) | IRR (diagnostic scope) | **Recorded, not fixed.** A present-but-corrupt or incomplete dataset reports `irr-owned-operational` at readiness and then fails closed at request time. Contrast D1, which calls the real loader and validates content |

**No IPD dependency, no carrier, no identity file** stands between the operator and a working Investment Coverage
surface (IC-2, observed).

### 8.2 Identity Coverage — four independent blockers, one of them IPD-owned

| Blocker | Exact evidence | Owner |
|---|---|---|
| **B-3** Three authoritative identity files absent | readiness D1 `IDENTITY_SOURCE_MISSING (3 of 3)`; HTTP 503 `identity-sources-unavailable` | USER_HOST |
| **B-4** IPD active owner binding not provisioned | readiness D5 `BINDING_NOT_PROVISIONED`, `ipd-owned-unavailable`; `createHoldingsProvider` throws before constructing the port | **IPD** |
| **B-5** Same-host IPC endpoint unconfigured / peer not live | readiness D6 `ENDPOINT_NOT_RESOLVED (ENDPOINT_NOT_CONFIGURED)` | USER_HOST (setting) + **IPD** (peer) |
| **B-6** F-3 owner-context carrier absent (watchlist surface) | readiness D4 `OWNER_CONTEXT_UNAVAILABLE (path-not-configured)`; `createWatchlistProvider` throws when `resolveOwnerContext` is null | USER_HOST |

Because all observation surfaces are **mandatory and jointly fatal** (§4.3), B-4/B-5/B-6 each independently produce
`503 coverage source surface unavailable`, regardless of B-3. **Identity Coverage therefore cannot be
operationalised by IRR or by the operator alone.**

### 8.3 Shared / downstream

- **B-7** No stored assessment records (needed for IID-01/IID-03, and for any assessment-linked coverage context).
  Readiness **does not assess this at all** (§9 R-1); disclosure 2 assigns it to `show-investment-chain`. Host-only
  unknown H-6.
- `/api/health` returns static `ok` and must not be used as a readiness signal (observed; matches the 9 Nov baseline).

---

## 9. Reconciliation against the labelled substitute baselines

**Neither baseline was altered, and neither is claimed to be the CPII-named baseline.** Substitutes:
`IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09` (**P6A**) and
`IID-IDENTITY-AND-INVESTMENT-COVERAGE-SEPARATION-2026-11-10` (**SEP**). Discrepancies are recorded; nothing was
silently changed on either side.

| # | Discrepancy | P6A / SEP claim | Observed at `a835d4a` | Disposition |
|---|---|---|---|---|
| **R-1** | **Readiness covers 8 of the baseline's 10 dependencies** | P6A §3 enumerates **D1–D10**, including **D9 assessment records (chain versions)** and **D10 real-issuer browser acceptance** | `assessIidReadiness` returns exactly **8** findings = P6A D1–D8. **D9 and D10 are not assessed.** D9 is acknowledged only in disclosure 2 and delegated to `show-investment-chain`; D10 is out of scope for a diagnostic | **Gap, recorded.** `iid:readiness --strict` exiting `0` does **not** establish P6A D9 or D10. P6-B prerequisite #6 (strict exit 0) is therefore necessary but **not sufficient** for #4 (a stored real-issuer version) or #7 (browser journey). Neither baseline changed |
| **R-2** | **D7 is weaker than the path it reports on** | P6A D7 evidence: "Directory absent; assessment minting cannot run" — i.e. presence-level | Confirmed: `existsSync` only (B-2), while the runtime verifies every digest via `readDataset` | **Asymmetry, recorded.** Not a contradiction of P6A, which also claimed only presence; but the diagnostic is weaker than D1, which calls the real loader |
| **R-3** | **Fixture-verified versus fixture-forbidden** | P6A D1: "Absent by default; **valid when the governed fixture set is installed**", evidence `IDENTITY_SOURCES_VALID` | The readiness required action forbids exactly that: "**Do not copy test fixtures** and do not author identity data by hand"; P6A §8.1 repeats the prohibition | **Tension, recorded.** A fixture install can produce `IDENTITY_SOURCES_VALID` and thus satisfy a *diagnostic*, while remaining invalid for *operation*. Any host claim of D1 readiness must state whether the source was authoritative or a fixture — otherwise R-1-style over-reading follows |
| **R-4** | **Path disclosure in an HTTP body** | P6A §4: "No path, owner pair or SQL leaked in any HTTP body inspected" | The identity-coverage 503 body carries the resolved directory in `issues[0].subject` (O-1) | **Not a contradiction, dated precisely.** P6A (9 Nov) **predates** the investment-coverage endpoint and page split (SEP, 10 Nov), and its claim covers the bodies it inspected (owner-context / binding / assessment). O-1 is a newer surface. Recorded as a disclosure-discipline inconsistency between the HTTP surface and the readiness CLI |
| **R-5** | **SEP §5 limitations all still hold at head** | server-rendered `/investment/coverage` still renders the identity-unavailable page; the investment read is dataset-level, not per-holding; no browser verification; no identity file provisioned | All four **confirmed** — the HTML probe returned 503 "Identity coverage is unavailable"; the investment report is dataset/sector/issuer level; no browser journey performed; nothing provisioned | **Consistent.** No drift |
| **R-6** | **SEP §3.6 disclosure-not-enforcement holds exactly** | `identitySourcesAvailable:false` + `identitySourceDetail`; per-issuer `identityDependency: null` = "not evaluated", never "no dependency"; never replaces the page with an identity error | Confirmed at runtime: investment endpoint returned **200** with `identitySourcesAvailable:false` and the detail string, while the identity endpoint returned 503 | **Consistent, and now runtime-confirmed** rather than test-confirmed |
| **R-7** | **Classifier divergence post-dates both baselines' subject matter** | neither baseline addresses `financialClass` vs `classifyDataset` | Live at `a835d4a` (§5.5) | **New observation, recorded.** Not attributed to either baseline; not corrected |

---

## 10. Dependencies and evidence required for CPII-02 … CPII-06 — **BLOCKED**

**This requirement cannot be satisfied, and the reason is evidentiary rather than analytical.** CPII-02…CPII-06 are
defined **only** by `IIPS-CPII-MASTER-ROADMAP-2026-11-12`, which does not exist in IRR or IPD on any branch, in any
tree, in the installed IPD dependency, or in git history (§2). Their titles, scopes, sequencing, acceptance criteria
and owners are therefore unknown. Any list produced here would be **invented**, and inventing a roadmap is exactly
what this work item's exclusions forbid.

**Not done:** no CPII-02…CPII-06 item was executed, scoped, estimated or guessed; no substitute roadmap was authored;
no identifier was allocated.

**What the repository does establish — offered as input to the roadmap owner, explicitly *not* as CPII-derived
prerequisites.** The nearest authoritative forward-looking list is **P6A §10 (prerequisites for P6-B)**, and the
evidence this investigation adds to it:

| Prerequisite (P6A §10) | Evidence now available | Owner | Blocks |
|---|---|---|---|
| 1. IPD binding provisioned, IPC peer live, a real portfolio read returns holdings | readiness D5/D6 (B-4, B-5); H-7, H-8 | **IPD** + USER_HOST | Identity Coverage |
| 2. Authoritative identity files installed, `IDENTITY_SOURCES_VALID` against **real** issuer data | readiness D1 (B-3); H-3; **see R-3** — the claim must state authoritative vs fixture | USER_HOST | Identity Coverage |
| 3. Both carriers materialised and accepted on the host | readiness D3/D4 (B-6); H-2 | USER_HOST | Identity Coverage; assessment reads |
| 4. NP-04 path configured **and ≥1 real-issuer assessment version stored and read back in a separate process** | readiness D2 reports presence only; **R-1** — D9 is not assessed by the CLI; H-6 via `show-investment-chain` | USER_HOST | IID-01 / IID-03 |
| 5. Fundamentals dataset imported **and measured** for the issuer under test | readiness D7 (B-1) reports **directory presence only**; real verification is `readDataset` digests (§5.2) / the coverage endpoint's `measuredSectors` (**R-2**, B-2); H-4 | USER_HOST | **Investment Coverage** |
| 6. `npm run iid:readiness -- --strict` exits `0` on the host | exit semantics verified in sandbox (0/1/2); **R-1** — strict `0` covers 8 of 10 dependencies only; H-5 | USER_HOST | all |
| 7. A real browser journey executed and recorded | not attempted; no browser claim; H-9 | USER_HOST | P6-B acceptance |

**Evidence CPII-01 could not supply and no repository reading can:** every row above whose owner is USER_HOST or IPD
is a host/IPD fact (§7.2). Until H-1…H-9 are supplied by the operator, no readiness claim for either coverage
capability is admissible.

---

## 11. Explicit confirmation — no implementation and no provisioning

**Confirmed: this work item performed no implementation and no provisioning.**

- **No application code changed.** No source file in `frontend/` or `iips-platform/` was edited. The only file this
  work item adds is this report.
- **No runtime data provisioned or installed.** No identity file, no dataset, no manifest, no carrier, no database,
  no journal was created. The HTTP probe ran against an **empty** isolated data root outside the repository
  (`/tmp/cpii01-probe/data`, verified **0 files** before and after), and that root plus all probe output were
  deleted afterwards.
- **No synthetic fixture presented as operational data.** None was installed, and R-3 records the fixture/authoritative
  distinction as a live hazard rather than exploiting it.
- **No new identity resolver, no new fundamentals store, no new persistence, no new startup path.** Existing
  resolvers, ports and CLIs were read and, where noted, executed read-only.
- **No IPD change.** The IPD repository was searched read-only (§2); no pin was advanced.
- **Excluded work not touched:** no Snapshot-to-Live W01–W20 execution, no Dhan Live Integration work, no IPO
  Screening Engine work. Broker Import, Reports persistence architecture and PR #562 were **not** reopened, and
  PR #562 was **not** treated as a prerequisite (§5.5 notes only that a divergence is separately recorded there).
- **Repository state verified clean.** `git status --porcelain` was empty immediately before and immediately after
  the transport probe; no `.iips-data/` was created inside the repository (the isolated `IIPS_DATA_DIR` kept the
  `<cwd>/.iips-data` fallback out of the tree); the probe port was released on stop.
- The readiness CLI and the transport were executed **read-only**, which is their documented construction
  (`frontend/server/investment/cli/iid-readiness.ts:7-9`; `runtimeReadiness.ts:10-15`; `localSnapshotStore.ts:1-9`).

---

## 12. Recommended next roadmap item — **not executed**

**The roadmap-aligned recommendation cannot be made, and this record does not fake one.** "Keep the next step aligned
with the authoritative master roadmap" is unsatisfiable while `IIPS-CPII-MASTER-ROADMAP-2026-11-12` is absent (§2).

**Recommended next item (an authority act, not an engineering act):** **obtain or publish the CPII master roadmap** —
either commit `IIPS-CPII-MASTER-ROADMAP-2026-11-12` to IRR, or issue a correction naming the intended authoritative
planning document. Until then CPII-02…CPII-06 have no definition, and any successor work item would be guessing its
own scope. This is the **only** genuine blocker to continuing the CPII sequence, and it is documentary.

**Conditionally, and only if the roadmap owner confirms the intent** — the repository evidence points at one
highest-leverage engineering sequence, stated here as a *candidate* with no authority behind it:

1. **Operationalise Investment Coverage first.** It is the only IID coverage capability with **no IPD dependency**
   (IC-2, observed): one operator action (B-1, the existing ingestion CLI) turns `datasetClass: NONE` /
   `measuredSectors: 0/13` into a measured position. Identity Coverage cannot be unblocked by IRR or the operator
   alone (B-4/B-5 are IPD-owned).
2. **Close R-1/B-2 before relying on `--strict`.** A strict exit `0` currently certifies 8 of the baseline's 10
   dependencies, and D7 certifies directory presence rather than the digest verification the runtime actually
   performs. Both are recorded, **not fixed**; fixing either is an implementation act outside CPII-01.
3. **Settle R-3 in writing.** Require that any D1 readiness claim state whether the installed identity source is
   authoritative or a fixture, so `IDENTITY_SOURCES_VALID` cannot be read as operational readiness.

**None of the above was executed, scheduled, implemented or provisioned.** Production admission remains
**NOT ADMITTED**; nothing here grants authority or enables a write.

---

## 13. Evidence index

| Evidence | Location |
|---|---|
| Runtime topology, bind/port/proxy | `frontend/vite.config.ts:12-18`; `frontend/server/executive-transport.ts:558`, `:721`, `:831-854` |
| Route tables | `iips-platform/src/investment/identity/coverageEndpoint.ts:20-22`; `iips-platform/src/investment/coverage/investmentCoverageEndpoint.ts:29-31`; `frontend/server/investment/investment-transport.ts:38-62`; `frontend/src/app/routes.ts:26`, `:66` |
| Data-directory resolution | `iips-platform/src/investment/identity/sources.ts:557`; `iips-platform/src/investment/port/localSnapshotStore.ts:41-46`; `iips-platform/src/investment/port/fundamentalsReadPort.ts:38-46`; `.env.example:49` |
| Identity loading / validation / fail-closed | `iips-platform/src/investment/identity/sources.ts:4-7`, `:52-66`, `:510-511`, `:524-526`, `:542-544`, `:549-554`, `:563`, `:572-578`; `identity/resolver.ts:13-14`, `:121`, `:154`, `:531` |
| Identity Coverage composition and fatal-surface rule | `frontend/server/investment/sources.ts:196-205` (+ `createHoldingsProvider`, `createWatchlistProvider`); `frontend/server/investment/coverage-transport.ts:1-15`, `:80-97`, `:124-132`, `:175-180` |
| Dataset install / discovery / integrity | `iips-platform/src/investment/cli/ingest.ts:5`, `:55-71`, `:128-144`; `iips-platform/src/investment/ingestion/writer.ts:81`, `:118-124`, `:139-141`, `:155-163`; `port/localSnapshotStore.ts:1-9`, `:69-72`, `:123-144` |
| Investment Coverage read model and independence | `iips-platform/src/investment/identity/runtime.ts:39-44`, `:78-89`, `:91`, `:116-125`, `:137-144`; `coverage/investmentCoverage.ts:91-132`, `:165-170`; `coverage/measure.ts`; `identity/coverage.ts:69-88`, `:117` |
| Classifier divergence | `coverage/investmentCoverage.ts:165-170` vs `fundamentals/datasetClass.ts:78-88` |
| Readiness boundary | `frontend/server/investment/cli/iid-readiness.ts:7-18`; `frontend/server/investment/runtimeReadiness.ts:10-24`, `:55-58`, `:382-388`, `:435-437`, `:462`, `:466`, `:487-492`; `frontend/package.json` (`iid:readiness`) |
| UI consumption | `frontend/src/features/investment/IdentityCoveragePage.tsx`; `InvestmentCoveragePage.tsx:149`; `frontend/src/api/investmentCoverage.ts:9-10`; `investmentCoverageInvestment.ts:19` |
| Substitute baselines | `docs/integration/IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09.md` §3, §4, §8, §9, §10; `docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-SEPARATION-2026-11-10.md` §3.6, §5 |
| Baseline-absence search | §2 (filename search, `git grep`, `git log --all`, GitHub code search in both repos, recursive tree listings for both repos, installed IPD dependency tree) |
| Observed sandbox output | §6 — readiness text/JSON and exit codes 0/1/2; four HTTP probes against a read-only transport on an isolated port with an empty isolated data root |

**Reproduction of the observations** (read-only; provisions nothing — use an isolated empty data root outside the
repository so the `<cwd>/.iips-data` fallback cannot write into the tree):

```
cd frontend
npm run iid:readiness                       # exit 0, READ-PATH READY: NO, 8 findings
npm run iid:readiness -- --strict           # exit 1
IIPS_DATA_DIR=<empty-dir-outside-repo> EXEC_TRANSPORT_PORT=8790 npx tsx server/executive-transport.ts
curl -s 'http://127.0.0.1:8790/api/investment/coverage/investment?asOf=2026-11-13'   # 200, datasetClass NONE
curl -s 'http://127.0.0.1:8790/api/investment/coverage?asOf=2026-11-13'               # 503 identity-sources-unavailable
curl -si 'http://127.0.0.1:8790/investment/coverage?asOf=2026-11-13'                  # 503 text/html identity view
curl -s 'http://127.0.0.1:8790/api/health'                                           # 200 static ok
git status --porcelain                      # empty — nothing provisioned or changed
```
