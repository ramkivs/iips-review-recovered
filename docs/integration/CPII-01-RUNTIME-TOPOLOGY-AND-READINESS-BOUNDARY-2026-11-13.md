# CPII-01 — Runtime Topology and Readiness Boundary

**Record ID:** `IIPS-CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13`
**Work item:** CPII-01 — confirm runtime topology and readiness boundary (read-only investigation and documentation)
**Repository:** IRR `ramkivs/iips-review-recovered` · IPD `ramkivs/iips-production-market-data` (read-only; not modified)
**Investigated at:** `origin/main` = `a835d4af019ab4f677ab238ec42d44326f06a771`
**Operating model:** personal, single-user, local Windows, non-production
**Focus:** IID Identity Coverage and Investment Coverage operationalisation
**Outcome:** topology and both coverage execution paths established from repository evidence and **confirmed by a
read-only in-sandbox HTTP observation at head**; the readiness boundary is **NOT satisfied** for either coverage
surface; the named 11 November readiness assessment **was located on an unmerged branch** and is reconciled here as
the primary baseline; the named 12 November master roadmap **does not exist on any of the repository's 440 branch
trees**, so requirement 6 is **blocked**; **no implementation, no code change, no data provisioning**.

> **Correction notice (v2).** Version 1 of this record was published at commit `ec0aa26` and stated that *both* named
> baselines were absent. That statement was **wrong for the 11 November assessment**: the search behind it covered the
> working tree, `origin/main`, GitHub code search (which indexes the default branch only) and `git log --all` — which
> sees only **locally fetched** refs. The assessment lives on a remote branch that had never been fetched. The search
> was then extended to **all 442 remote branches** and the document was found. Version 1's conclusion about the master
> roadmap **stands**, on much stronger evidence than before (§2.2). The correction lands as a follow-up commit rather
> than a history rewrite, following the convention the baseline itself records in its §31: *"Material factual errors
> should be raised as issues on the publication branch; corrections land as follow-up commits, not rewrites."*
> Two of version 1's findings were also claimed as new when the baseline had already recorded them (§3.1 T-2, §6 O-1);
> both claims are corrected below.

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
behaviour of both surfaces, and the eight-finding readiness boundary are established from repository source and — for
the fail-closed behaviour and the readiness output — **observed at head**, not inferred (§6). The observed empty-state
figures **independently reproduce** the baseline's direct-call measurement taken one commit-generation earlier
(§9 R-A). Every host-only dependency is listed and marked unavailable (§7).

**Not claimed.** No inspection of, connection to, or statement about the operator's Windows host. No CI result. No
browser journey. No IPD runtime behaviour. No readiness for IID-01/02/03. Nothing was implemented, changed,
installed, provisioned or minted (§11). CPII-02…CPII-06 were not executed, and their prerequisites are **not**
derived here, because the roadmap that defines them does not exist (§2.2, §10).

---

## 2. Authoritative baseline availability

CPII-01 names two authoritative baselines. **One was found; one does not exist.** Both results are stated with the
search that produced them.

### 2.1 FOUND — the 11 November IID readiness assessment

`docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md`

| Field | Value |
|---|---|
| Title | *"IID — Identity Coverage & Investment Coverage: End-to-end investigation, operational readiness and decision-support assessment"* |
| Location | branch **`arena/iid-coverage-readiness-report-2026-11-11`**, tip `31a9b01e574f2911cc2685e3d63dddcfb1194d62` (committed `2026-11-11T14:23:49Z`), parent `08cdf491b3b6daedab997e1b51f81675a5ae984b` |
| Blob | git blob `e6f756238089c6795c8568b37321f3e55ba60cb2`; sha256 `baac4427e543ff7749694e7fb59a4b147cb415b2f7fe3330544ce22a5d0835b6`; 871 lines / 122,093 bytes |
| **Merged into `origin/main`?** | **NO.** `git ls-tree -r --name-only origin/main` returns 0 matches. It exists only on that dedicated publication branch |
| Its own publication model (its §31) | dedicated branch off `origin/main` for the document alone; *"No pull request is opened by default; the branch is the designated publication location"* |
| Investigated at (its §30.1/§30.6) | `72b5d0a` on `arena/6012214c-iips-review-recovered` (PR #554); publication tree `origin/main` @ `08cdf49` |
| Its environment | Arena **Linux** sandbox, Node 22.22.3, `IIPS_DATA_DIR` unset, `<cwd>/.iips-data` absent — **the same class of environment as this record's probe**, and explicitly *"Not the operator's Windows host"* |

**Why version 1 missed it.** The absence search behind version 1 used: the working tree; `git grep`; `git log --all
--name-only`; GitHub code search; and `git/trees` on `HEAD` of both repos. Every one of those is scoped to **refs
already present locally** or to the **default branch**. This assessment is on a remote-only branch that had never been
fetched, and was never merged, so all five methods were blind to it. This is recorded because it is a **method
lesson, not an excuse**: an absence claim about a repository must enumerate remote refs, not local ones. §2.2's
roadmap search was rebuilt accordingly.

**Status of this record relative to that baseline.** It is used in §9 as the **primary** reconciliation baseline. It
was **not** altered, amended, re-published or merged. Its own §31 review stance is honoured: it is an assessment, not
an authority act.

### 2.2 ABSENT — `IIPS-CPII-MASTER-ROADMAP-2026-11-12`

This conclusion is unchanged from version 1, but the evidence is now exhaustive over **every** branch rather than
over locally fetched refs.

| Search | Scope | Result |
|---|---|---|
| `git ls-remote --heads origin` | **442** remote branches of IRR | enumerated; **no** branch name contains `cpii`, `roadmap` or `master-roadmap` |
| GraphQL bulk read of all 442 branch tips | commit date per branch | date range `2026-08-16` … `2026-11-12`; **15** branches have a commit on/after `2026-11-11` |
| `git/trees/<tip>?recursive=1` on **all 440 distinct branch tips** | every path in every branch tree | **exactly one** path in the entire repository matches `CPII\|MASTER-ROADMAP`: `docs/integration/CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md` — **this record itself** |
| the 15 post-`2026-11-11` branch trees, inspected individually | a document dated `2026-11-12` cannot predate its own commit | no roadmap on any of them |
| IPD: all branches + all branch trees | `ramkivs/iips-production-market-data` | 0 matches for `CPII`, `MASTER-ROADMAP` |
| GitHub code search `CPII` (both repos) | default branches | 13 matches in IRR, **all** the substring `C-P-I-I` inside `getCPIIndex` (the MoSPI macro indicator endpoint — `docs/OPERATOR_RUNBOOK.md:348`, `frontend/server/macro/mospi-source.ts:58`); 0 in IPD |
| `git log --all --name-only` (after fetching the 11-11 branch) | all locally known history | no `CPII`/`MASTER-ROADMAP` path ever committed |

**Conclusion: the CPII master roadmap does not exist in IRR or IPD, on any branch, at any commit.**

**A related artefact that *does* exist, and must not be confused with it.** The baseline's §22 names the authoritative
**IID implementation** roadmap: `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` — present at head
(101,349 bytes), and containing **no `CPII` token**. Per that same §22 it sequences implementation phases IID-0…IID-6,
*"all are implementation-complete and closed"*. So the repository has a **closed implementation roadmap** and **no
operationalisation roadmap**; CPII-01's "master roadmap" is a third artefact that was never written. **Requirement 6
and the roadmap-aligned next step are therefore blocked**, and no CPII-02…CPII-06 sequence may be invented (§10).

### 2.3 Supplementary baselines used

Two further actual IID baselines, both merged and readable at head, are cited in §9 as **secondary**:

- `docs/integration/IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09.md` (**P6A**) — D1–D10 dependency matrix
- `docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-SEPARATION-2026-11-10.md` (**SEP**) — the coverage separation

Version 1 described these as *substitutes* for both missing baselines. That is corrected: they are **not** substitutes
for the 11 November assessment, which exists. They remain legitimate secondary baselines — the 11 November assessment
itself cites both (its §22, §24, §25).

---

## 3. Verified component and runtime topology

### 3.1 Two local processes, one loopback boundary

| Process | Started by | Bind | Port | Evidence |
|---|---|---|---|---|
| **Vite dev server** (SPA shell) | `npm run dev` → `vite` | `0.0.0.0` | `5173` | `frontend/vite.config.ts:12` (`host`), `:13` (`allowedHosts: ['localhost','127.0.0.1','.e2b.app']`), `:14` (`port`) |
| **Executive transport** (backend HTTP) | `npm run server:dev` → `tsx --env-file-if-exists=../.env.local --env-file-if-exists=.env.local server/executive-transport.ts` | **`127.0.0.1` only** | `EXEC_TRANSPORT_PORT ?? 8787` | `frontend/server/executive-transport.ts:558` (port), `:721` (`EXEC_TRANSPORT_BIND_HOST = '127.0.0.1'`) |

The browser reaches the SPA on 5173; the SPA reaches the backend **only** through Vite's proxy, which forwards
**`/api` alone** to `http://localhost:8787` (`frontend/vite.config.ts:15-18`). The transport never binds a public
interface, consistent with the personal single-user local non-production model. Observed startup line:
`Executive transport listening on 127.0.0.1:8790` (§6).

**T-1 — the proxy forwards `/api` only, so the credential-free JS-free view is unreachable through the dev server.
*(New; not recorded in any baseline — the 11 Nov assessment contains no reference to Vite, the proxy or port 5173.)* **
`COVERAGE_ROUTES.html = '/investment/coverage'` (`iips-platform/src/investment/identity/coverageEndpoint.ts:22`) is
served by the transport but is **not** under `/api`, so Vite does not proxy it. The server-rendered identity report is
reachable **only** directly on the transport (`127.0.0.1:8787/investment/coverage`). This **refines** the baseline's
G-10 consequence: G-10 warns that *"a bookmarked/JS-disabled view claims identity failure while the SPA shows the
honest dataset position"*. In the dev topology that misleading view is **not reachable from the SPA origin at all** —
an operator on `:5173` with JS disabled gets the SPA shell, not the identity HTML. The misleading view requires
deliberately addressing the transport port. Recorded as a refinement of G-10, **not** a contradiction and **not** a
fix: G-10's substance (the raw transport path serves the wrong capability's HTML) is untouched.

**T-2 — one path, two servers, two capabilities. *(Confirms the baseline's G-10 at head; version 1 wrongly called this
new.)* ** `/investment/coverage` is simultaneously:

- the **SPA client route** for **Investment** coverage — `routes.ts:66` `investmentCoverage: '/investment/coverage'`
  → `InvestmentCoveragePage.tsx`, reading `/api/investment/coverage/investment`; and
- the **transport's server-rendered** *Identity* coverage HTML view — `COVERAGE_ROUTES.html`.

Observed in §6: the same path returned the *identity*-unavailable HTML (503, 1553 B) on the transport while
`/api/investment/coverage/investment` returned a 200 investment report. **This is already recorded**: baseline §24
**G-10** pins the root cause by code inspection (*"`COVERAGE_ROUTES.html = '/investment/coverage'`,
`renderUnavailableHtml` … `investmentCoverageEndpoint.ts` (JSON-only); `coverage-transport.ts` falls through to the
identity binder"*), §25.3 records it as the separation record's known exception with the root cause *"now pinned"*,
and §28 **O9** is the owner decision on it — recommended: *"leave as-is and document"*. **This work item therefore
adds only (a) confirmation that G-10 still holds at head `a835d4a`, and (b) the runtime observation.** It changes
nothing, proposes no HTML renderer (that is O9's to decide, and would be a new surface), and does not reopen SEP.
Note additionally that the `identityCoverage` doc comment (`routes.ts:18-19`, "the server also renders the same
report at `/investment/coverage`") now points at a path the SPA uses for the *other* capability — the same fact G-10
describes, from the client side.

### 3.2 Module composition

`iips-platform` (`@iips/platform`) is a **library with no server**: its scripts are `typecheck`, `test`, `test:iid`
only. The frontend server imports it by **relative path**, not as a package —
`../../../iips-platform/src/investment/...` (`frontend/server/investment/sources.ts`, `coverage-transport.ts`,
`runtimeReadiness.ts`). The platform deliberately exposes runtime adapters through one module so the transport does
not reach into its internal layout (`iips-platform/src/investment/identity/runtime.ts:1-10`).

Three IPD-pinned GitHub dependencies (`frontend/package.json`):

| Package | Pin |
|---|---|
| `iips-np04-governed-persistence` | `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` |
| `iips-production-market-data` | `github:ramkivs/iips-production-market-data#1aee57fe093b4fb15eaf3a9ac67532ee40262fe2` |
| `iips-broker-import` | `github:ramkivs/iips-production-market-data#1aee57fe093b4fb15eaf3a9ac67532ee40262fe2` |

No pin was advanced, changed or evaluated for advancement. **No IPD change was made or proposed.** (Baseline §30.3
independently verified that both pins resolve into the same IPD repository via the `./persistence` subpath.)

### 3.3 Routes relevant to the two coverage capabilities

| Route | Server | Capability | Handler |
|---|---|---|---|
| `GET /api/investment/coverage?asOf=` | transport | **Identity** coverage JSON | `coverageEndpoint.ts` `COVERAGE_ROUTES.json:21` |
| `GET /investment/coverage?asOf=` | transport | **Identity** coverage server-rendered HTML | `COVERAGE_ROUTES.html:22` |
| `POST /api/investment/coverage/preview` | transport | broker-preview rows held by the client; nothing persisted | `COVERAGE_ROUTES.previewEvaluation` |
| `GET /api/investment/coverage/investment?asOf=` | transport | **Investment** coverage JSON | `investmentCoverageEndpoint.ts` `INVESTMENT_COVERAGE_ROUTES.json:30` |
| `/identity-coverage`, `/investment/coverage` | SPA | the two separate pages | `routes.ts:26`, `routes.ts:66` |

This mapping is **identical to the baseline's §2 capability table** (endpoint, page, fail-closed behaviour, owner) —
independently derived here from source at head, and agreeing.

All four transport paths are matched in one block at `executive-transport.ts:831-854`, which lazily imports
`coverage-transport` and `sources` and answers `503 {"error":"investment-coverage-unavailable"}` if the handler
itself throws. The investment route is matched **before** the identity route deliberately, because the identity
handler matches `/api/investment/coverage` exactly and would otherwise swallow it
(`frontend/server/investment/coverage-transport.ts:124-132`). `COVERAGE_TRANSPORT_SEMANTICS` declares
`writes: 'none'` and `failureMode: '503 with file-level or surface-level issues; never a partial classification'`
(`coverage-transport.ts:175-180`).

The IID-3 assessment surface (`investment-transport.ts:38-62`) declares exactly three read-only route entries —
`company-assessment`, `company-assessment-version`, `investment-coverage` — with no mutating entry in the table.

### 3.4 Configuration and data-directory resolution

**One rule, two consumers, identical precedence:**

```
identity  : resolveIdentityDir(dataRoot)   → <root>/investment/identity      sources.ts:557-559
dataset   : resolveDatasetDir(options)     → <root>/investment/dataset       localSnapshotStore.ts:41-46
root      : explicit dataDir/dataRoot  >  IIPS_DATA_DIR  >  resolve(process.cwd(), '.iips-data')
```

`FUNDAMENTALS_BOUNDARY` (`port/fundamentalsReadPort.ts:38-46`) is the single frozen statement of that convention:
`dataDirEnv: 'IIPS_DATA_DIR'`, `defaultSubdir: 'investment'`, `datasetSubdir: 'dataset'`,
`manifestFile: 'manifest.json'`, `blocker: '…No analysis is produced and no substitute dataset is used.'` The
precedence is implemented once per consumer; the readiness module repeats the same resolution rather than importing
it and says so — *"Mirrors the governed default without importing a second resolver for the same convention"*
(`runtimeReadiness.ts:437`). The two resolvers must be read together: a change to the convention has to be made in
both places.

**T-3 — the effective data domain depends on the transport's working directory.** When `IIPS_DATA_DIR` is unset the
root resolves to `<process.cwd()>/.iips-data`. The resolved directory is therefore a property of *how and where the
operator starts the transport*, not of the repository. Nothing commits a default: `.env.example:49` carries
`# IIPS_DATA_DIR=/abs/path/iips-data` **commented out**, and neither `.env.local` nor any `.iips-data/` directory is
committed (verified absent). This is the single most consequential host-only unknown (§7 H-1).

The baseline reaches the same conclusion independently and adds two facts this record adopts: its §5 observes the
fallback resolving to `frontend/.iips-data/investment/identity` when run from `frontend/`, and its §25.9 records that
**`frontend/.iips-data` is not git-ignored** — so a probe that wrote there on a dev machine could accidentally commit
artefacts. This record's probe used an isolated `IIPS_DATA_DIR` outside the repository precisely to keep that
fallback out of the tree (§11).

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

Each file is **content-addressed**: its version is the sha256 of its canonical content (`digestOf`), so *"a silently
edited roster cannot masquerade as the same roster"* (`sources.ts:4-7`, `:524-526`). The loaded set exposes
`rosterVersion`, `listingMapVersion`, `corporateActionTableVersion` and `rosterDataClass`
(`identity/coverage.ts:73-79`).

`rosterDataClass` is derived at `sources.ts:542-544`:
`texts.dataClass ?? (/synthetic/i.test(roster.rosterLabel) ? 'SYNTHETIC_FIXTURE' : 'OPERATOR_SUPPLIED')`.

### 4.2 Loading, validation and exact fail-closed behaviour

`loadIdentitySourcesFromDir(dir)` (`sources.ts:563`) → `loadIdentitySources(texts)` (`sources.ts:510-511`). The
contract is **total and fail-closed**: *"Any issue in any file rejects the whole set"* — *"a partially trusted roster
is exactly how a wrong identity gets manufactured"* (`sources.ts:4-7`, `:510-511`).

| Stage | Refusal |
|---|---|
| file presence | any of the three absent → `IDENTITY_SOURCE_MISSING`, listing the missing keys; **no partial load** (`sources.ts:569-578`) |
| JSON parse | `INVALID_JSON` |
| schema | `schemaVersion !== IDENTITY_SCHEMA` → `SCHEMA_MISMATCH`, immediate return |
| roster | `ISSUER_ID_MISSING/INVALID`, `DUPLICATE_ISSUER`, `CIN_INVALID`, `ISIN_INVALID`, `ISSUER_KEY_CONFLICT` (id must equal its CIN/ISIN key; a CIN or equity ISIN claimed by two issuers), `INVALID_STATUS` (`ELIGIBLE\|EXCLUDED`), `SECURITY_INCOMPLETE`, `DUPLICATE_SECURITY`, `DUPLICATE_ISIN`, `UNKNOWN_ISSUER`, `INVALID_INSTRUMENT_TYPE`, `ASSESSABLE_NON_EQUITY`; **AC-1.5**: an issuer declaring `equityIsin` must own a security with that ISIN |
| listing map | `LISTING_ID_MISSING/INVALID` (must equal its canonical recomposition), `EXCHANGE_NOT_SUPPORTED`, `INVALID_SERIES`, `UNKNOWN_SECURITY`, `INSTRUMENT_MISMATCH`, `EFFECTIVE_FROM_MISSING`, `WINDOW_INVERTED`, **`AMBIGUOUS_LISTING`** (two windows of one `listingId` must not overlap — "two identities for one key") |
| corporate actions | `ACTION_INCOMPLETE`, `DUPLICATE_ACTION`, `UNKNOWN_ACTION_TYPE` (closed 13-member set, `sources.ts:52-66`), `UNKNOWN_ISSUER`, `INVALID_FACTOR` (`adjustmentFactor > 0`), `SUCCESSOR_INVALID`, `SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE` (ratios must sum to 1 ±1e-6), `SUCCESSORS_REQUIRED` (`MERGER`/`DEMERGER`) |

Every code above was verified present in `identity/sources.ts`. Resolution states
(`identity/resolver.ts:10-16`, `:121`, `:154`): `RESOLVED`, `INELIGIBLE` (`ISSUER_NOT_ELIGIBLE`),
`OUT_OF_SCOPE_SECURITY`, `AMBIGUOUS`, `AMBIGUOUS_LISTING`, `STALE_REFERENCE`; `assessable` is true only for
`RESOLVED` (`resolver.ts:531`).

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
`coverage source surface unavailable (<surface>: …)` and answers **503 naming the surface**, *"because a coverage
total that silently omits a surface would be a wrong total"* (`coverage-transport.ts:1-15`, `:80-97`).

UI: `IdentityCoveragePage.tsx` at SPA route `/identity-coverage`, client `frontend/src/api/investmentCoverage.ts:9-10`
(`json: '/api/investment/coverage'`, `preview: '/api/investment/coverage/preview'`).

> **IC-1 — Identity Coverage cannot be operationalised by IRR alone.** It requires **IPD** to provision the active
> owner binding and run the IPC peer (surface 1), plus two operator-owned carrier files (surface 2), plus the three
> authoritative identity files. The baseline states the same conclusion as its gap **G-3** (*"Holdings lane unusable:
> IPD active binding not provisioned; IPC peer not listening"*, class 3/7, owner **IPD**) and as its §0 blocker (c).
> Its Stage 5 honest note is worth quoting: *"IPD's binding is not on this side of the fence — no amount of IRR work
> substitutes for it."*

---

## 5. Investment Coverage — data and execution path

### 5.1 Dataset location and installation mechanism

Location: `<IIPS_DATA_DIR>/investment/dataset` (§3.4). Installation is the **existing IID-0 ingestion CLI** — nothing
else, and no new store:

```
tsx src/investment/cli/ingest.ts --input <dir> --dataset-dir <dir> [--now <iso>] [--allow-errors] [--dataset-schema <schema>]
```
(`iips-platform/src/investment/cli/ingest.ts:5`, `:55-71`, `:128-144` → `writeDataset`, `ingestion/writer.ts:81`).
`now` defaults to `new Date().toISOString()`. Ingestion errors abort the write unless `--allow-errors` is passed, in
which case a partial dataset is written **that records them** (`ingest.ts:137-140`). The CLI writes `manifest.json`
plus the content files and the coverage report.

### 5.2 Local snapshot discovery and integrity verification

`openLocalSnapshot(options)` (`port/localSnapshotStore.ts:123`) → `readDataset(dir)` (`ingestion/writer.ts:118`):

1. `manifest.json` must exist, else **`DatasetMissingError`** (`writer.ts:121-123`);
2. every file named in `manifest.files` must exist, else **`DatasetIntegrityError`** naming the file;
3. each is sha256-hashed and `verifyManifest` checks **both** the per-file digests **and** the recomputed content
   digest, else **`DatasetIntegrityError`** — `dataset file digest mismatch (<file>)` or `recomputed content digest
   does not match the manifest` (`writer.ts:155-163`);
4. `datasetSchema` travels **with** the dataset, because *"a reader that dropped it would assess a V2 dataset as V1
   and refuse the one item V2 introduces (`L-036`)"* (`writer.ts:139-141`).

Both errors are wrapped into `FundamentalsBoundaryError` carrying `{dataDir, reason}`
(`localSnapshotStore.ts:139-144`); `resolveFundamentalsPort` converts that into
`{available:false, reason, boundary, dataDir}` — *"the caller gets a port, or the precise reason it has none"*
(`localSnapshotStore.ts:147-148`). The store is **read-only by construction**: no write method exists and state is an
ECMAScript private `#state`, so *"there is no data property for a caller to mutate"*
(`localSnapshotStore.ts:1-9`, `:69-72`).

### 5.3 Coverage measurement and report

`investmentCoverageFromLocalDataset(asOf, dataRoot)` (`identity/runtime.ts:91`) opens the snapshot and reads manifest,
issuers, securities, periods, prices, operatingMetrics and issues, then calls `buildInvestmentCoverageReport`
(`coverage/investmentCoverage.ts`). Sector measurement comes from `coverage/measure.ts` `measureCoverage`; the IID-0
disclosure from `identity/coverage.ts:117` `buildFinancialCoverageDisclosure`. The sibling
`financialCoverageFromLocalDataset` (`runtime.ts:39-44`) additionally extracts `UNMAPPED_XBRL_TAG` issues.

The report (`investmentCoverage.ts:91-132`) carries `dataset{datasetVersion, contentDigest, provider, licence,
dataAsOf, knownAsOf, lastImportAt, importRunId, quality, completenessPct, datasetClass, issuers, securities,
listings, annualPeriods, quarterlyPeriods, prices, operatingMetricRecords, corporateActions, earliest/latestPeriodEnd}`,
`sectors[]`, `measuredSectors`/`totalSectors`/`outstandingSectors`, per-issuer `issuers[]`, `counts`, `issues[]`,
`financialCoverage` (carried verbatim) and `statusLine`.

**Absent dataset is a truthful answer, never an error and never an estimate:** `runtime.ts` catches and reports
`datasetClass: 'NONE'` (`:78-89`, `:116-125`); `financialClass(null)` → `'NONE'` (`investmentCoverage.ts:165-170`);
the UI keys off it — `datasetAbsent = report.dataset.datasetClass === 'NONE'` (`InvestmentCoveragePage.tsx:149`).

### 5.4 Independence from Identity Coverage — by construction

`investmentCoverageFromLocalDataset` loads the identity sources for **one purpose only**: to disclose whether they
could be loaded. *"INDEPENDENT OF THE IDENTITY SOURCES, BY CONSTRUCTION … their absence never prevents the dataset
position from being computed"* (`identity/runtime.ts:78-89`). The report carries `identitySourcesAvailable`,
`identitySourceDetail`, and `issuerIdentityState: null` — where `null` means **"not evaluated"** and *"is never
reported as 'no dependency'"* (`runtime.ts:137-144`; SEP §3.6). Route ordering enforces it (§3.3).

> **IC-2 — Investment Coverage depends on one thing only**: a verified dataset at
> `<IIPS_DATA_DIR>/investment/dataset`. It needs **no** IPD binding, **no** IPC peer, **no** carrier file and **no**
> identity file. It is therefore the capability that can be operationalised entirely inside IRR plus one operator host
> action. The baseline agrees: its §21 Stage 3 is marked *"Independent: of Stage 2 (can run in parallel); of IPD"*,
> and its §18 assigns dataset installation to the **user host** with no IPD dependency. **This asymmetry is the most
> operationally useful fact this investigation established.**

### 5.5 A live classifier divergence on this path *(new; recorded, not changed)*

Two shipped rules classify the same dataset differently:

| Path | Rule | Vocabulary |
|---|---|---|
| Investment Coverage read model — `coverage/investmentCoverage.ts:165-170` `financialClass()` | substring test `/synthetic\|test-fixture\|fixture/i` over `provider + licence` | `SYNTHETIC_FIXTURE \| OPERATOR_SUPPLIED \| NONE` — **no fail-closed member** |
| Assessment path — `fundamentals/datasetClass.ts:78-88` `classifyDataset()` | declared `sourceRights.state` | `SYNTHETIC_REFERENCE \| OPERATOR_SUPPLIED \| UNKNOWN` — **fail-closed default `UNKNOWN`** |

Both exist at `origin/main` `a835d4a`. The baseline lists `financialClass` among the coverage symbols (its §4) but
never compares it to `classifyDataset`, so the divergence is **not recorded there**. This record documents it as a
repository fact affecting how Investment Coverage labels a dataset; it does not correct it, choose between the
vocabularies, or treat it as in scope. It is flagged because any item that operationalises Investment Coverage will
publish `datasetClass` to an operator, and the two rules can disagree on the same bytes — the read model has **no**
`UNKNOWN`, so it must always assert one of two positive classes. (Separately recorded as `L-041` on the WI-13 branch;
that record is **not** a prerequisite for anything here, and PR #562 was not reopened.)

### 5.6 Baseline-recorded constraints on what an installed dataset can actually deliver

Installed data does **not** by itself produce full coverage. Four constraints recorded in the baseline's §24 bound any
Investment Coverage operationalisation and are adopted here rather than re-derived:

| Baseline gap | Constraint | Consequence for coverage |
|---|---|---|
| **G-4** | Operating metrics are `OPERATOR_ENTERED` everywhere (zero `VENDOR`); every committed bundle carries an empty `operating-metrics.csv` | **14 of the 38** sector×method slots require at least one operating metric and stay `WITHHELD` regardless of how complete the statements are; **24** are statement-only and unlock with data alone |
| **G-6** | No quarterly data anywhere | all methods remain calibrated on annual figures; no intra-year freshness |
| **G-7** | **Sector spelling split-brain — mechanism re-pinned at head.** Two vocabularies coexist: the certified baseline universe uses `Automobile`, `Materials & Metals`, `Telecommunications`; the closed `SectorName` union (`contracts/operatingMetrics.ts:11-24`, **verified**: 13 members ending `'Telecom'`, `'Auto'`, `'Materials'`) uses the short forms. **Neither side is validated at runtime.** On the roster side `RosterIssuer.sector` is plain `string`, not `SectorName` (`identity/types.ts:166`), and `identity/sources.ts` has no sector check. On the dataset side `IssuerRecord.sector` *is* typed `SectorName` (`fundamentals/types.ts:19`) — but a TypeScript type is erased at runtime, and the entire ingestion path (`cli/ingest.ts`, `ingestion/builder.ts`, `ingestion/csv.ts`, `ingestion/xbrl.ts`) contains **zero** references to `SectorName`, `SECTORS` or any sector-membership check. Measurement then does `const sectors = (Object.keys(SECTOR_METHODS) as SectorName[]).sort()` (`coverage/measure.ts:186` — a compile-time cast, not a validation) and matches `issuer.sector === sector` **exactly** (`coverage/measure.ts:191`) | a dataset or roster carrying `Automobile` where `SECTOR_METHODS` keys `Auto` yields **zero sector measurement with issuers present, and raises no error** — the single most dangerous silent-failure shape on this path. *The baseline records the gap; this record pins the exact unvalidated seam.* |
| **G-12** | No price observation for any holding | margin-of-safety stays unusable operationally |

**G-7 is called out specifically because it interacts with IC-2.** IC-2 says one operator action unblocks Investment
Coverage; G-7 says that action can *appear* to succeed — dataset installed, readiness flips to valid, issuers listed —
while `measuredSectors` stays `0/13` because a sector string did not match. Nothing in the read path reports that as
an error. Any operationalisation must therefore verify `measuredSectors > 0`, not merely `datasetClass !== 'NONE'`.

---

## 6. Observed readiness boundary — the eight findings

`npm run iid:readiness` → `tsx server/investment/cli/iid-readiness.ts` (`frontend/package.json`). The CLI is
**read-only by construction**: *"It opens no database, contacts no IPC peer, writes nothing, and changes no
environment"* (`frontend/server/investment/cli/iid-readiness.ts:7-9`). It delegates to `assessIidReadiness`
(`runtimeReadiness.ts:466`), which calls the **existing** resolvers and constructs nothing. It deliberately does
**not** call `loadAuthoritativeNp04Persistence()`, because that resolver opens the database with
`createDirectory: true, migrate: true` — *"calling it from a diagnostic would CREATE and MIGRATE a database as a side
effect of asking a question"* (`runtimeReadiness.ts:10-15`).

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

The D1 row reproduces the baseline's §5 observation verbatim in substance (`identity-files |
user-host-provisioning-required | configured:false | readable:false | IDENTITY_SOURCE_MISSING (3 of 3 files absent)`)
— one commit-generation later, at head, on a different sandbox instance.

**Exit-code semantics, observed:** default `0` even with everything outstanding (*"this is a REPORT, and a non-zero
default would make it look like a failed operation rather than an honest inventory"*); `--strict` → `1`; invalid
invocation → `2` (`frontend/server/investment/cli/iid-readiness.ts:11-18`; verified 0 / 1 / 2).

**Observed HTTP fail-closed behaviour** (transport started read-only on isolated port `8790` with an **empty**
isolated `IIPS_DATA_DIR=/tmp/cpii01-probe/data`; startup line `Executive transport listening on 127.0.0.1:8790`):

| Probe | Result |
|---|---|
| `GET /api/investment/coverage/investment?asOf=2026-11-13` | **200** — `datasetClass: NONE`, `datasetVersion: NONE`, `quality: unavailable`, `measuredSectors: 0 / 13`, `identitySourcesAvailable: false`, `identitySourceDetail: "eligible-roster.json: IDENTITY_SOURCE_MISSING"`, `statusLine: "No investment dataset is installed: no issuer is covered."` → **IC-2 confirmed at runtime** |
| `GET /api/investment/coverage?asOf=2026-11-13` | **503** `identity-sources-unavailable` — "No identity is established and no row is classified", with file-level `issues[]` → **fail-closed confirmed** |
| `GET /investment/coverage?asOf=2026-11-13` | **503** `text/html`, 1553 B, "Identity coverage is unavailable" → **T-1/T-2 confirmed** |
| `GET /api/health` | **200** `{"status":"ok","transport":"program-v3.0 executive (dev)"}` regardless of every finding above → **health is not a readiness check** (the baseline's §21 Stage 1 makes the same point: the readiness CLI exists so an operator need not *"start a transport and read 503 bodies one route at a time"*) |

**O-1 — the identity 503 body discloses the resolved filesystem path, and that is deliberate. *(Version 1 framed this
as a new inconsistency; corrected.)* ** The probe's `issues[0].subject` was `/tmp/cpii01-probe/data/investment/identity`
(`sources.ts:572-578`, where `subject` **is** the directory). **The baseline already records this exact observation** —
its §5 shows `subject: '/home/user/iips-review-recovered/frontend/.iips-data/investment/identity'` and explains
*"The subject path is the expected directory … The loader is not misconfigured … the files are simply not there"*.
Its §5 further directs that *"the UI's reported subject path should be checked there to confirm it is the intended
directory"* on the Windows host.

So the path disclosure is **intentional and operationally useful**, not a leak, and the contrast with the readiness
CLI's no-path discipline (`runtimeReadiness.ts:21-24`: *"Paths are reduced to a presence/kind fact so the report is
safe to paste into a review record"*) is **two different tools with two different jobs** — one tells the operator
*where the runtime looked*, the other is safe to *paste into a record*. The genuinely additive consequence for
CPII-01: **the identity 503 body is the cheapest available mechanism for settling H-1 on the Windows host** — it
prints the resolved directory without the operator having to reason about `IIPS_DATA_DIR` and the transport's CWD.
Recorded as a refinement, not a defect. Nothing was changed.

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
- G-10/T-2 route overlap still holding at head (§3.1).

### 7.2 Host-only unknowns — **explicitly unavailable; not inspected, not inferred**

**Arena did not access, connect to, or inspect the operator's Windows machine, and makes no claim about it.** The
readiness module states the same discipline about itself: *"This report describes only the process environment it ran
in. An absent setting here is NOT evidence about any other host, including the operator Windows machine"*
(disclosure 4) and *"An Arena sandbox absence is NOT evidence about the user's Windows host, so nothing here infers a
host limitation from this process's environment"* (`runtimeReadiness.ts:55-58`). The baseline's §27 **U-1** says the
same: *"Any 'works on my host' claim beyond this Linux sandbox would be fabrication; this report makes none."*

| # | Host-only fact | Why it cannot be established here | How the operator establishes it | Baseline ref |
|---|---|---|---|---|
| H-1 | **Effective `IIPS_DATA_DIR`** | No default is committed (`.env.example:49` commented out); the fallback depends on the transport's CWD (T-3) | `echo %IIPS_DATA_DIR%` in the shell that starts the transport, plus that shell's CWD — **or simply read the identity 503 `issues[].subject`, which prints the resolved directory (O-1)** | U-1; §5 |
| H-2 | **Actual running process environment and working directory** | Process state of a machine Arena cannot reach | `npm run iid:readiness -- --json` on the host; the report names every setting without echoing values | U-1 |
| H-3 | **Actual installed identity files** (three JSONs, and whether authoritative rather than fixtures) | Filesystem of the host | readiness D1 → `IDENTITY_SOURCES_VALID`; the resolver refuses the whole set on any defect | U-1, U-3, G-1 |
| H-4 | **Actual installed fundamentals dataset** and whether it passes digest verification | Filesystem of the host | readiness D7 reports **directory presence only** (§8 B-2); real verification needs `openLocalSnapshot`/`readDataset` via the coverage endpoint — and per **G-7**, `measuredSectors > 0` must be checked, not just `datasetClass !== 'NONE'` | U-1, G-2 |
| H-5 | **`iid:readiness` output on the Windows host**, and the `--strict` exit code | Must run in the host's environment | `npm run iid:readiness -- --strict`; baseline Stage 1 makes exactly this its remaining work, and P6-B prerequisite #6 requires exit `0` | U-1; Stage 1 |
| H-6 | Whether the NP-04 store exists and **contains assessment versions** | The diagnostic deliberately will not open a database | `show-investment-chain` CLI (readiness disclosure 2 assigns exactly this; baseline G-11 records that no chain has ever been served) | U-5, G-11 |
| H-7 | Whether **IPD** has provisioned the active binding and is listening on the IPC target | IPD-owned; IRR can only read a declaration, and "a declaration is not a verified binding" | an actual portfolio read through the transport; IPD adjudicates per request | U-2, G-3 |
| H-8 | Windows named-pipe resolvability (`\\.\pipe\…`) | On POSIX a socket is statable, a Windows named pipe is not — `readiness` returns `readable: null` by design (`runtimeReadiness.ts:382-388`) | host-side `resolveIpcEndpoint` plus a live peer | U-2 |
| H-9 | Any **browser** journey | No browser verification performed; none claimed | baseline Stage 5 acceptance; P6-B prerequisite #7 | §1, §23 |

**Every sandbox observation in §6 is labelled sandbox evidence and is not host evidence.** The baseline draws the
identical line in its own header and §1.

---

## 8. Current readiness findings and exact blockers

**Overall: NOT READY for either coverage capability.** Read-path ready = **NO** (observed at head). This **agrees
with the baseline**, whose §0 verdict is that both empty states are *"one structural fact each"*, that *"neither
empty state is a bug, and neither is fixable by code in this repository alone"*, and whose §18 records the same
blocker classes. The blockers differ sharply between the two capabilities.

### 8.1 Investment Coverage — one blocker, IRR-plus-operator only

| Blocker | Exact evidence | Owner | Baseline ref |
|---|---|---|---|
| **B-1** No verified fundamentals dataset at `<IIPS_DATA_DIR>/investment/dataset` | readiness D7 `DATASET_DIRECTORY_ABSENT`; HTTP 200 with `datasetClass: NONE`, `measuredSectors: 0/13`, `statusLine: "No investment dataset is installed: no issuer is covered."` | USER_HOST | **G-2** (class 2, C) |
| **B-2** *Boundary weakness, not a data blocker:* readiness D7 verifies **directory existence only** | `runtimeReadiness.ts:435-462` uses `existsSync(dir)`; reason `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED`, `readable: null`. The runtime path is stronger — `readDataset` verifies every digest (§5.2) | IRR (diagnostic scope) | **not recorded in any baseline** — see §9 R-D |

**Action for B-1 requires no IRR code change**: run the existing ingestion CLI (§5.1) against operator-supplied
fundamentals. The baseline names the concrete candidates — the committed real-issuer bundles (Infosys REL-1/WI2/WI3,
Marico WI7, KEC WI8) — and is explicit that admitting them as *operational* inputs is owner decision **O3**, not an
engineering call. **No IPD dependency, no carrier, no identity file** stands between the operator and a working
Investment Coverage surface (IC-2, observed).

**But B-1 alone is not sufficient**, per §5.6: G-4 keeps 14 of 38 method slots withheld without operator-entered
operating metrics, G-6 leaves no quarterly data, and **G-7 can silently zero the sector measurement** if roster sector
spellings do not match `SectorName` exactly.

### 8.2 Identity Coverage — four independent blockers, one of them IPD-owned

| Blocker | Exact evidence | Owner | Baseline ref |
|---|---|---|---|
| **B-3** Three authoritative identity files absent | readiness D1 `IDENTITY_SOURCE_MISSING (3 of 3)`; HTTP 503 `identity-sources-unavailable` | USER_HOST | **G-1** (class 1, C) |
| **B-4** IPD active owner binding not provisioned | readiness D5 `BINDING_NOT_PROVISIONED`, `ipd-owned-unavailable`; `createHoldingsProvider` throws before constructing the port | **IPD** | **G-3** |
| **B-5** Same-host IPC endpoint unconfigured / peer not live | readiness D6 `ENDPOINT_NOT_RESOLVED (ENDPOINT_NOT_CONFIGURED)` | USER_HOST (setting) + **IPD** (peer) | **G-3** |
| **B-6** F-3 owner-context carrier absent (watchlist surface) | readiness D4 `OWNER_CONTEXT_UNAVAILABLE (path-not-configured)`; `createWatchlistProvider` throws when `resolveOwnerContext` is null | USER_HOST | §18 watchlist row |

Because all observation surfaces are **mandatory and jointly fatal** (§4.3), B-4/B-5/B-6 each independently produce
`503 coverage source surface unavailable`, regardless of B-3. **Identity Coverage therefore cannot be
operationalised by IRR or by the operator alone** (IC-1).

**B-3 has a governance precondition, not just a file-placement step.** The baseline's §18 and §28 record that no
full-universe identity reference set exists anywhere (G-1), that authoring the roster is **owner decision O1** (a
data-governance act: which issuers, what eligibility rules, who owns edits), and that the three committed operator
sets are single-issuer evidence bundles. Its Stage 2 "Do not" list is explicit: *"copy synthetic fixtures into the
operational domain; invent identifiers; widen resolver rules to force `RESOLVED`."* This record adopts that
prohibition unchanged.

### 8.3 Shared / downstream

- **B-7** No stored assessment records (needed for IID-01/IID-03, and for any assessment-linked coverage context).
  Readiness **does not assess this at all** (§9 R-A); baseline **G-11** records that `/investment/company/:issuerId`
  *"has never served a real chain"* and returns 404 everywhere. Host-only unknown H-6.
- `/api/health` returns static `ok` and must not be used as a readiness signal (observed; agrees with baseline).

---

## 9. Reconciliation against the baselines

**No baseline was altered.** Primary: the **11 November assessment** (§2.1), cited by section because it lives on
another branch, pinned by blob `e6f75623…` / sha256 `baac4427…`. Secondary: **P6A** (9 Nov) and **SEP** (10 Nov), both
merged at head. Discrepancies are recorded; nothing was silently changed on either side.

### 9.1 Against the 11 November assessment (primary)

| # | Result | Baseline position | Observed at `a835d4a` | Disposition |
|---|---|---|---|---|
| **R-A** | **Independent reproduction of the empty state at head, by a different method** | §11 measured `datasetClass:'NONE'`, `quality:'unavailable'`, `measuredSectors 0/13`, `withheldMethods: 38`, `xbrlMappedTags: 22`, `derivationItems: 8` by **direct function call** at `72b5d0a`/main `08cdf49` | Same figures via the **HTTP endpoint** at head `a835d4a`, plus `statusLine: "No investment dataset is installed: no issuer is covered."` | **Consistent — and now confirmed one commit-generation later, over HTTP rather than in-process.** The empty state has not drifted |
| **R-B** | **Identity fail-closed reproduction** | §5: `IDENTITY_SOURCE_MISSING (3 of 3 files absent)`; §2: identity endpoint returns `503 identity-sources-unavailable` until files validate | readiness D1 identical; HTTP `503 identity-sources-unavailable` observed | **Consistent** |
| **R-C** | **Topology and capability table agree exactly** | §2 table: endpoints, pages (`/identity-coverage`, `/investment/coverage`), fail-closed behaviour (identity 503 / investment 200 NONE), owners | Derived independently from source at head (§3.1, §3.3) | **Consistent.** Two independent derivations, same result |
| **R-D** | **New: readiness D7 is weaker than the path it reports on** | §18 records dataset serving as *"Implemented; reports NONE when absent"* and dataset installation as blocked; §24 G-2 records the absence. **Neither compares the diagnostic's check to the runtime's check** | `runtimeReadiness.ts:435-462` uses `existsSync(dir)` only → `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED`, while `readDataset` sha256-verifies every manifest file **and** the recomputed content digest (§5.2) | **Additive finding (B-2), recorded.** A present-but-corrupt or partial dataset can report `irr-owned-operational` at readiness and then fail closed at request time. Contrast D1, which calls the real loader and validates content. Not a contradiction of the baseline — a gap it did not examine |
| **R-E** | **New: readiness assesses 8 of P6A's 10 dependencies** | §21 Stage 1 acceptance requires *"the eight findings"*; §24 G-11 separately cites *"P6-A D2/D9"*. **The baseline uses both numbers without reconciling them** | `assessIidReadiness` returns exactly **8** findings = P6A D1–D8. **D9 (stored assessment records) and D10 (real-issuer browser acceptance) are not assessed**; D9 is acknowledged only in disclosure 2 and delegated to `show-investment-chain` | **Additive finding, recorded.** `iid:readiness --strict` exiting `0` does **not** establish P6A D9 or D10, so baseline Stage 5's acceptance (`--strict` exits 0 **and** a chain renders **and** no 503 on the read path) correctly demands more than the CLI — but the *reason* is now explicit. Neither baseline changed |
| **R-F** | **T-2 is the baseline's G-10, not a new finding** | §24 **G-10** pins the root cause by code inspection; §25.3 records it as SEP's known exception, *"root cause now pinned"*; §28 **O9** is the owner decision, recommended *"leave as-is and document"* | Same overlap observed live at head (§6: 503 text/html on the transport path) | **Corrected.** Version 1 called this new; it is a **confirmation** of G-10 plus a runtime observation. No HTML renderer is proposed — that is O9's decision and would be a new surface |
| **R-G** | **T-1 refines G-10's stated consequence** | G-10 consequence: *"a bookmarked/JS-disabled view claims identity failure while the SPA shows the honest dataset position; misinforms exactly the no-JS operator"* | Vite proxies **`/api` only** (`vite.config.ts:15-18`), so through the SPA origin that path resolves to the SPA route; the misleading HTML is reachable **only** by addressing the transport port directly | **Additive refinement, recorded.** It *narrows* G-10's exposure in the dev topology rather than contradicting it: the misleading view needs a deliberate direct hit on `127.0.0.1:8787`. G-10's substance is untouched |
| **R-H** | **O-1 is already recorded, and is intentional** | §5 shows the same `subject` path disclosure, explains it as *"the expected directory"*, and directs that it be checked on the Windows host | Same disclosure observed (§6) | **Corrected.** Version 1 framed this as a disclosure-discipline inconsistency; the baseline establishes it as deliberate and operator-useful. The additive point is narrower: it is the **cheapest mechanism for settling H-1** on the host |
| **R-I** | **New: classifier divergence** | §4 lists `financialClass` among coverage symbols; `classifyDataset` is never compared to it | §5.5: two rules, two vocabularies, the read model has no fail-closed member | **Additive finding, recorded** (also `L-041` on the WI-13 branch). Not attributed to the baseline; not corrected |
| **R-J** | **Fixture-verified versus fixture-forbidden** | §18 records that installing *"a synthetic governed fixture"* makes the surface report `available`, while §21 Stage 2 forbids copying fixtures into the operational domain; §23 requires fixtures to carry a `SYNTHETIC_FIXTURE` chip | readiness D1 can reach `IDENTITY_SOURCES_VALID` from a fixture install | **Tension, recorded — and the baseline already resolves it** by labelling: a fixture satisfies the *diagnostic* but not *operation*. Any host claim of D1 readiness must state authoritative vs fixture. This record adopts the baseline's O1/O3 framing rather than restating it |
| **R-K** | **SEP's limitations all still hold at head** | §25.3 + SEP §5: no browser verification; no IPD change; no identity file provisioned; HTML `/investment/coverage` still renders identity-unavailable; investment coverage is dataset-level, not per-holding | All confirmed (§6 probes; §11) | **Consistent.** No drift |
| **R-L** | **SEP §3.6 disclosure-not-enforcement now runtime-confirmed** | SEP §3.6 / baseline §2: `identitySourcesAvailable:false` + detail; `identityDependency: null` = "not evaluated", never "no dependency" | Investment endpoint returned **200** with `identitySourcesAvailable:false` and the detail string while the identity endpoint returned 503 | **Consistent — confirmed over HTTP at head**, where the baselines confirmed it by test and code inspection |

### 9.2 Against P6A and SEP (secondary)

| # | Result | Detail |
|---|---|---|
| **R-M** | **P6A D1–D10 versus the 8 readiness findings** | See R-E. P6A §3 enumerates D1–D10; the readiness module implements D1–D8. Recorded without changing either |
| **R-N** | **P6A §4 "no path leaked in any HTTP body inspected" versus O-1** | Not a contradiction, dated precisely: P6A (9 Nov) **predates** the investment-coverage endpoint and page split (SEP, 10 Nov), and its claim covers the bodies it inspected (owner-context / binding / assessment). Per R-H the identity path disclosure is intentional anyway |
| **R-O** | **P6A §9 status agrees** | *"IRR-owned enablement: COMPLETE"*; *"P6-A overall: NOT COMPLETE"* — IID-01 blocked (no stored assessments, no minting dataset), IID-02 blocked (IPD binding/peer), IID-03 blocked (no chain versions); `404`/`503` are **correct fail-closed refusals, not defects**. This record's §8 reaches the same verdict at head |
| **R-P** | **P6A §8 ownership split agrees** | IPD owns binding provisioning + IPC peer; the user host owns identity files (never copy test fixtures), both carriers, the NP-04 path, dataset import + first mint, env settings, and restart after any env change. Matches §4.3/§8 exactly |
| **R-Q** | **P6A §10 P6-B gate still unmet** | P6-B may begin only when 7 conditions hold, including `npm run iid:readiness -- --strict` exiting `0` **on the operator host**. Per R-E that condition is necessary but **not sufficient**. Unmet: H-5 |

---

## 10. Dependencies and evidence required for CPII-02 … CPII-06 — **BLOCKED**

**This requirement cannot be satisfied, and the reason is evidentiary rather than analytical.** CPII-02…CPII-06 are
defined **only** by `IIPS-CPII-MASTER-ROADMAP-2026-11-12`, which does not exist on **any of the 440 branch trees** of
IRR or anywhere in IPD (§2.2). Their titles, scopes, sequencing, acceptance criteria and owners are therefore unknown.
Any list produced here would be **invented**, and inventing a roadmap is exactly what this work item's exclusions
forbid.

**Not done:** no CPII-02…CPII-06 item was executed, scoped, estimated or guessed; no substitute roadmap was authored;
no identifier was allocated.

### 10.1 What the located baseline does supply — authoritative, and adopted as the forward-looking evidence

Version 1 could offer only P6A §10. Now that the 11 November assessment is located, its **§21 sequenced stages** are
the authoritative operationalisation sequence, and its §28 is the owner decision register. This record adopts them by
reference rather than restating or re-sequencing them:

| Baseline stage | Objective | Independence | Maps to this record's blockers |
|---|---|---|---|
| **Stage 1** — runtime and source discovery | deterministic per-host truth about what the runtime needs, who owns it, what is missing — *before* any provisioning or code change | **independent; no prerequisites** | Its "Remaining" work **is** H-1/H-2/H-5: run `--strict` on the Windows host and compare `IIPS_DATA_DIR` resolution to the directory the operator believes holds the files. **Still open** |
| **Stage 2** — identity readiness | an installed, validated identity reference set for the intended population | independent of Stage 3 and of IPD; **gated on owner decision O1** | B-3 |
| **Stage 3** — investment dataset readiness | ≥1 real, digest-verified dataset installed, plus the ingestion habit | independent of Stage 2 and **of IPD**; gated on **O3** | **B-1** |
| **Stage 4** — coverage readiness | coverage, completeness, method usability and sector measurement verified on **installed** data; the §23 ten-scenario demo passing | needs Stages 2–3; independent of IPD | B-1 + §5.6 constraints (G-4/G-6/**G-7**) |
| **Stage 5** — end-to-end integration | holdings → identity → dataset → assessment → disposition as one loop on the host | needs Stages 2–4 **plus IPD binding + IPC peer**; not independent | B-4, B-5, B-6, B-7 |
| **Stage 6** — investment intelligence | routine use: review loop, change detection, dispositions, persisted comparable reports | needs Stage 5 + operator limits policy (O5) | B-7 |

**Evidence each stage requires** is specified in the baseline itself (host readiness capture; directory listing +
digests; page captures; manifest listings; NP-04 query evidence showing the empty→nonempty transition; assessment
readback logs). **Every one of those is a host artefact** — §7.2 H-1…H-9. This record supplies none of them and
claims none.

### 10.2 What remains genuinely unavailable

| Item | Status |
|---|---|
| CPII-02…CPII-06 titles, scopes, sequence, acceptance criteria, owners | **Unknown — the defining roadmap does not exist** |
| Whether the baseline's Stage 1–6 *is* the intended CPII sequence, or whether CPII re-scopes it | **Unknown.** The baseline's own §28 **O10** puts exactly this to the owner — *"Acceptance of this report's Stage 1–6 as the operationalization track vs treating it as informational only"*, recommended *"adopt Stage 1–4 immediately; Stages 5–6 when IPD confirms binding"*. **O10 is unanswered**, and only the owner can answer it |
| Any host fact (H-1…H-9) | **Unavailable** |
| IPD provisioning intent and timeline (baseline U-2) | **Unavailable; IPD-owned** |

---

## 11. Explicit confirmation — no implementation and no provisioning

**Confirmed: this work item performed no implementation and no provisioning.**

- **No application code changed.** No source file in `frontend/` or `iips-platform/` was edited. The only file this
  work item adds is this report; the published commit's diff is **one file, +579 lines, no deletions** (§12
  verification).
- **No runtime data provisioned or installed.** No identity file, no dataset, no manifest, no carrier, no database, no
  journal was created. The HTTP probe ran against an **empty** isolated data root outside the repository
  (`/tmp/cpii01-probe/data`, verified **0 files** before and after), and that root plus all probe output were deleted
  afterwards. Per baseline §25.9 (`frontend/.iips-data` is **not** git-ignored), the isolated `IIPS_DATA_DIR` also
  kept the `<cwd>/.iips-data` fallback out of the tree.
- **No synthetic fixture presented as operational data.** None was installed. The baseline's Stage 2 prohibition
  (*"do not copy synthetic fixtures into the operational domain; do not invent identifiers; do not widen resolver
  rules to force `RESOLVED`"*) is adopted unchanged, and R-J records the fixture/authoritative distinction as a live
  hazard rather than exploiting it.
- **No new identity resolver, no new fundamentals store, no new persistence, no new startup path, no HTML renderer**
  (O9 was not decided or pre-empted). Existing resolvers, ports and CLIs were read and, where noted, executed
  read-only.
- **No IPD change.** IPD was searched read-only (§2.2); no pin was advanced.
- **No baseline altered.** The 11 November assessment was **read from a fetched remote ref only** — objects were
  downloaded, the branch was **never checked out**, and the working branch never changed. P6A and SEP were not
  edited. `origin/main` is unchanged at `a835d4a`.
- **Excluded work not touched:** no Snapshot-to-Live W01–W20 execution, no Dhan Live Integration work, no IPO
  Screening Engine work. Broker Import, Reports persistence architecture and PR #562 were **not** reopened, and
  PR #562 was **not** treated as a prerequisite (§5.5 notes only that a divergence is separately recorded there).
- **Repository state verified clean.** `git status --porcelain` was empty immediately before and immediately after the
  transport probe; the probe port was released on stop.
- The readiness CLI and the transport were executed **read-only**, which is their documented construction
  (`frontend/server/investment/cli/iid-readiness.ts:7-9`; `runtimeReadiness.ts:10-15`; `localSnapshotStore.ts:1-9`).

---

## 12. Recommended next roadmap item — **not executed**

### 12.1 The roadmap-aligned recommendation cannot be made

"Keep the next step aligned with the authoritative master roadmap" is unsatisfiable while
`IIPS-CPII-MASTER-ROADMAP-2026-11-12` is absent from all 440 branch trees (§2.2). **This record does not fake one.**

**Recommended next item (an authority act, not an engineering act):** **obtain or publish the CPII master roadmap** —
either commit `IIPS-CPII-MASTER-ROADMAP-2026-11-12` to IRR, or issue a correction naming the intended authoritative
planning document. Two related authority acts belong with it:

- **Answer O10** — whether the located baseline's Stage 1–6 *is* the operationalisation track. Until then there is no
  agreed sequence to align a next step to.
- **Decide the publication status of the 11 November assessment.** It sits on an unmerged branch with no PR, by its
  own §31 design (*"If the owner wants it merged, that is a separate act"*). A primary baseline that is not on `main`
  is invisible to every default-branch search — which is precisely how version 1 of this record missed it. Merging it
  is the owner's act, not this work item's, and was **not** performed.

### 12.2 The engineering next step the located baseline already authorises

Version 1 could offer only an unauthorised candidate. The baseline's §0 states one explicitly, and this record adopts
it rather than inventing a successor:

> *"The single highest-leverage next step: provision the identity reference set and install one real fundamentals
> dataset into the local data domain (the committed Infosys REL-1 bundle is the natural candidate, or Marico/KEC),
> then re-run `npm run iid:readiness` on the Windows host."* — baseline §0

Ordered by what this investigation established, and **all of it operator/owner work, none of it IRR code**:

1. **Stage 1 first — it is the only stage with no prerequisites and it is still open.** Run
   `npm run iid:readiness -- --strict` on the Windows host and record the output (H-5); establish the effective
   `IIPS_DATA_DIR` (H-1) — cheapest via the identity 503 `issues[].subject` path (O-1/R-H). Everything else in this
   record is conditional on facts only that run can supply.
2. **Then Stage 3 (Investment Coverage), before Stage 2.** IC-2 is the verified asymmetry: Stage 3 is independent of
   Stage 2 **and of IPD** (baseline §21), so one operator action (B-1, the existing ingestion CLI) turns
   `datasetClass: NONE` / `measuredSectors: 0/13` into a measured position. Identity Coverage cannot be unblocked by
   IRR or the operator alone — B-4/B-5 are IPD-owned (IC-1, baseline G-3).
   **Verification must be `measuredSectors > 0`, not `datasetClass !== 'NONE'`** — G-7's sector-spelling split-brain
   can silently zero the measurement with issuers present and raise no error (§5.6).
3. **Stage 2 needs O1 before it needs files.** Rostering is a data-governance decision (which issuers, what
   eligibility rules, who owns edits), not a file-placement task. The three committed sets are single-issuer evidence
   bundles; admitting them operationally is **O3**.
4. **Before relying on `--strict`, note R-E and R-D.** A strict exit `0` certifies 8 of P6A's 10 dependencies, and D7
   certifies directory presence rather than the digest verification the runtime performs. Both are **recorded, not
   fixed** — fixing either is an implementation act outside CPII-01.

**None of the above was executed, scheduled, implemented or provisioned.** Production admission remains
**NOT ADMITTED**; nothing here grants authority, admits data, or enables a write. The baseline's own closing stance
applies to this record too: it is an assessment, not an authority act.

---

## 13. Evidence index

### 13.1 Repository source (all anchors verified to resolve at `a835d4a`; 63 line/range anchors machine-checked)

| Evidence | Location |
|---|---|
| Runtime topology, bind/port/proxy | `frontend/vite.config.ts:12-18`; `frontend/server/executive-transport.ts:558`, `:721`, `:831-854` |
| Route tables | `iips-platform/src/investment/identity/coverageEndpoint.ts:20-22`; `iips-platform/src/investment/coverage/investmentCoverageEndpoint.ts:29-31`; `frontend/server/investment/investment-transport.ts:38-62`; `frontend/src/app/routes.ts:18-19`, `:26`, `:66` |
| Data-directory resolution | `iips-platform/src/investment/identity/sources.ts:557-559`; `iips-platform/src/investment/port/localSnapshotStore.ts:41-46`; `iips-platform/src/investment/port/fundamentalsReadPort.ts:38-46`; `frontend/server/investment/runtimeReadiness.ts:437`; `.env.example:49` |
| Identity loading / validation / fail-closed | `iips-platform/src/investment/identity/sources.ts:1-13`, `:4-7`, `:52-66`, `:510-511`, `:524-526`, `:542-544`, `:549-554`, `:563`, `:569-578`; `identity/resolver.ts:10-16`, `:121`, `:154`, `:531` |
| Identity Coverage composition and fatal-surface rule | `frontend/server/investment/sources.ts:196-205` (+ `createHoldingsProvider`, `createWatchlistProvider`); `frontend/server/investment/coverage-transport.ts:1-15`, `:80-97`, `:124-132`, `:175-180` |
| Dataset install / discovery / integrity | `iips-platform/src/investment/cli/ingest.ts:5`, `:55-71`, `:128-144`; `iips-platform/src/investment/ingestion/writer.ts:81`, `:118-124`, `:139-141`, `:155-163`; `port/localSnapshotStore.ts:1-9`, `:69-72`, `:123`, `:139-148` |
| Investment Coverage read model and independence | `iips-platform/src/investment/identity/runtime.ts:1-10`, `:39-44`, `:78-89`, `:91`, `:116-125`, `:137-144`; `coverage/investmentCoverage.ts:91-132`, `:165-170`; `coverage/measure.ts`; `identity/coverage.ts:69-88`, `:117` |
| Classifier divergence (§5.5) | `coverage/investmentCoverage.ts:165-170` vs `fundamentals/datasetClass.ts:78-88` |
| Baseline-recorded coverage constraints (§5.6) | `iips-platform/src/investment/contracts/operatingMetrics.ts:11-24` (13-member closed `SectorName`); `iips-platform/src/investment/fundamentals/types.ts:19` (`IssuerRecord.sector: SectorName`, type-only); `iips-platform/src/investment/identity/types.ts:166` (`RosterIssuer.sector: string`, free text); `iips-platform/src/investment/coverage/measure.ts:186` (`as SectorName[]` cast) and `:191` (exact string match); `cli/ingest.ts`, `ingestion/builder.ts`, `ingestion/csv.ts`, `ingestion/xbrl.ts` — **zero** sector-membership checks in the whole ingestion path. The G-7 shape, re-verified and re-pinned at head |
| Readiness boundary | `frontend/server/investment/cli/iid-readiness.ts:5`, `:7-9`, `:11-18`; `frontend/server/investment/runtimeReadiness.ts:10-15`, `:21-24`, `:55-58`, `:382-388`, `:435-462`, `:466`, `:487-492`; `frontend/package.json` (`iid:readiness`) |
| UI consumption | `frontend/src/features/investment/IdentityCoveragePage.tsx`; `InvestmentCoveragePage.tsx:149`; `frontend/src/api/investmentCoverage.ts:9-10`; `investmentCoverageInvestment.ts:18-20` |

### 13.2 Baselines

| Baseline | Location / pin | Used for |
|---|---|---|
| **11 Nov assessment (PRIMARY)** | `docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md` on branch `arena/iid-coverage-readiness-report-2026-11-11` @ `31a9b01e`; blob `e6f756238089c6795c8568b37321f3e55ba60cb2`; sha256 `baac4427e543ff7749694e7fb59a4b147cb415b2f7fe3330544ce22a5d0835b6`; **not merged to `origin/main`**. Sections cited: §0, §1, §2, §4, §5, §11, §18, §19, §20, §21, §22, §23, §24 (G-1…G-15), §25, §26, §27 (U-1…U-10), §28 (O1…O10), §29, §30, §31 | §9.1 R-A…R-L; §5.6; §8; §10.1; §12.2 |
| **P6A** (secondary) | `docs/integration/IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09.md` §3 (D1–D10), §4, §8, §9, §10 — merged at head | §9.2 R-M…R-Q |
| **SEP** (secondary) | `docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-SEPARATION-2026-11-10.md` §2, §3.6, §5 — merged at head | §9.1 R-K, R-L |
| **IID implementation roadmap** (context) | `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md`, present at head, **no `CPII` token**; IID-0…IID-6 implementation-complete and closed per baseline §22 | §2.2 — distinguishes the closed *implementation* roadmap from the absent *CPII* roadmap |

### 13.3 Baseline-availability search (§2)

442 remote branches enumerated via `git ls-remote --heads origin`; all 442 tips' commit dates read via one paginated
GraphQL query; `git/trees/<tip>?recursive=1` read for **all 440 distinct branch tips** and filtered for
`CPII|MASTER-ROADMAP` → exactly one path, this record; the 15 post-`2026-11-11` trees inspected individually; IPD
branches and trees likewise → 0 matches; GitHub code search `CPII` both repos → 13 matches, all `getCPIIndex`
(`docs/OPERATOR_RUNBOOK.md:348`, `frontend/server/macro/mospi-source.ts:58`); `MASTER-ROADMAP` → 0;
`git log --all --name-only` after fetching the 11-11 branch → no such path ever committed.

### 13.4 Observed sandbox output (§6) — **sandbox evidence, never host evidence**

Readiness CLI text and `--json` output; exit codes 0 / 1 / 2; four HTTP probes against a read-only transport on
isolated port `8790` with an empty isolated `IIPS_DATA_DIR`; post-probe verification that the repository was clean,
the probe root held 0 files, no `.iips-data` was created, the port was released and the probe artefacts were deleted.

**Reproduction** (read-only; provisions nothing — use an isolated empty data root **outside** the repository so the
`<cwd>/.iips-data` fallback cannot write into the tree, and note §25.9: that fallback path is not git-ignored):

```
cd frontend
npm run iid:readiness                       # exit 0, READ-PATH READY: NO, 8 findings
npm run iid:readiness -- --strict           # exit 1
IIPS_DATA_DIR=<empty-dir-outside-repo> EXEC_TRANSPORT_PORT=8790 npx tsx server/executive-transport.ts
curl -s  'http://127.0.0.1:8790/api/investment/coverage/investment?asOf=2026-11-13'   # 200, datasetClass NONE
curl -s  'http://127.0.0.1:8790/api/investment/coverage?asOf=2026-11-13'               # 503 identity-sources-unavailable
curl -si 'http://127.0.0.1:8790/investment/coverage?asOf=2026-11-13'                   # 503 text/html identity view
curl -s  'http://127.0.0.1:8790/api/health'                                            # 200 static ok
git status --porcelain                      # empty — nothing provisioned or changed
```

Reading the primary baseline without checking out its branch (objects only; no branch switch):

```
git fetch origin arena/iid-coverage-readiness-report-2026-11-11
git show FETCH_HEAD:docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md
```
