# IID Stage 5 — IPD-side response-contract verification (2026-11-21)

Companion to `IID-STAGE-5-IRR-CONSUMER-COMPATIBILITY-VERIFICATION-2026-11-21.md` (IRR `979c1c6`).
**Supersedes** the first revision of this file (IRR `ad58043`, "CONDITIONAL / NOT VERIFIED — IPD repository
unreadable"). The IPD repository was made public after that revision; this pass inspected the actual merged
implementation and executed its real dispatch/serialization path.

## Decision

**COMPATIBILITY CONFIRMED** for the existing IRR consumer against IPD `main@4716d0bc…`, at source level and
at executed-production-code level (real IPD dispatch + store + SQLite + endpoint, real IRR client/adapter/HTTP
transport, disposable synthetic fixture). All four wire conditions documented in `979c1c6` §6 are verified.
**Not** live-host evidence; **not** Stage 5 acceptance.

Two scope findings accompany the confirmation and must not be lost (§6): **(F-1)** the S1 → D02 read
relationship is implemented on IPD's **v2** read path only, and IRR speaks **v1** only, so the current IRR
consumer never exercises that relationship — it is compatible because v1 is unchanged, not because it uses
the new path; **(F-2)** v1 `portfolio.get` passes IRR's DR-4r contributions rule only when IPD runs with
`IIPS_LOCAL_PERSONAL_USE=1` (pre-existing, both sides document it).

## 1. Remote state and identities established this pass

| Item | Value | How established |
|---|---|---|
| IPD remote `main` | `4716d0bc123e5fb3e8e72f74bada257d08d76ba2` | `git ls-remote` after clone; repo `visibility: public` |
| IPD implementation commit | `e7ded933ae289ee6bb8310f3ff68f5d965886056` — "Implement approved read-only S1 to D02 portfolio relationship" (2026-11-21) | `git cat-file`, `git log` |
| IPD implementation merge | `2dec72618d194f6207e9f9fed5cc031c3461d922` = PR #184, parents `c7c726bc…` + `e7ded933…` | `git log --format=%P` |
| Ancestry | `e7ded933 ∈ ancestors(4716d0bc)` and `2dec7261 ∈ ancestors(4716d0bc)`: **true** | `git merge-base --is-ancestor` |
| `main` beyond the merge | `4716d0bc` = PR #185, **docs only** (`IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`, D02 evidence pack); zero `src/`/`tests/` delta vs `2dec7261` | `git diff --stat 2dec7261..4716d0bc` |
| Implementation footprint | `src/ipc/dispatch.ts` (+37/−19), `src/persistence/binding.ts` (+45), `src/persistence/portfolio_store.ts` (+15), `tests/s1_d02_read_relationship.test.ts` (+241), 3 docs | `git show --stat e7ded933` |
| IPD branch `arena/d1c19f24-…` | `ecfda9a5…` (ahead of `main`; not the authority; not inspected further) | `git ls-remote` |
| IRR `main` | `6254399777b1877bfb3634bf8d4ba2769678d002` (unchanged) | `git rev-parse`, `git fetch` |
| IRR consumer inspected | `frontend/server/user-portfolio/{ipcClient,ipcPortAdapter,ownerContextFromBinding}.ts`, `frontend/server/user-portfolio-transport.ts`, `frontend/server/investment/{sources,holding-identity-transport}.ts` — unchanged since `979c1c6`; `IPC_PROTOCOL_VERSION = 1`; `IPC_CALLER_IDENTITY_KEYS` = 29 | source read |
| IRR dependency pin | `iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be` — **not advanced** (59 commits behind `4716d0bc` on `main`) | `package.json`, `package-lock.json`, `git rev-list --count` |

## 2. What the merged implementation actually does (source level, `main@4716d0bc`)

- `src/ipc/dispatch.ts` L440–444: `holdingsRead = envelope.v === 2 && IPC_V2_READ_OPERATIONS.includes(op)`.
  Only for such requests is owner resolution deferred into the store; **v1 requests keep
  `resolveActiveBinding(db)`** (generic sole-ACTIVE binding) and then L584–607 `store.list(owner)`,
  `store.get(owner, …)` / `personalGet(…)`, `store.revisions(owner, …)` — the pre-existing v1 path, unchanged.
- `src/ipc/dispatch.ts` L536–566 (v2 branch): `store.readHoldingsPortfolio(op, portfolioId)`; v2 writes refuse
  `WRITE_NOT_AUTHORIZED` before any store access.
- `src/persistence/portfolio_store.ts` L756–766 `readHoldingsPortfolio`: one `withReadSnapshot` transaction →
  `resolveHoldingsReadContextInCurrentTransaction(db)` → `list|getV2|revisions(context.storageOwner)`.
- `src/persistence/binding.ts` L174–212 `resolveHoldingsReadContextInCurrentTransaction`: resolves the
  authenticated binding; if it is native D02 (`owner-4dc756b3` / `ipd-personal-local`) → `NATIVE_D02_READ`;
  otherwise **all five S1 components must match exactly** (`ramki-personal-local`, binding
  `c5808abaffd072d6401ce63ad86c6ac0`, membership `d25dcc5370100b00766efc5166f65cf3`, tenant
  `ipd-personal-local`, owner `ipd-owner-ramki-personal`) and binding + membership must be unrevoked →
  `S1_D02_PERSONAL_READ` with `effectiveDomainOwner = D02`, `storageOwner = S1`. Anything else →
  `BindingInvalidError` (Class P, zero bytes). The context is not an `ActiveOwner` and cannot reach a mutation.
- Serialization: `successFrame` emits exactly `{v, ok:true, op, requestId?, result}`; `classAFrame` exactly
  `{v, ok:false, op, requestId?, outcome, detail?}`. Rows are built by explicit projection
  (`projectPortfolioBase`, `projectCurrentRevision`, `revisionsSnapshot`, `holdingFromRow`,
  `contributions`/`contributionsValidated`, `personalGet.importEvidence`); no row spread, so
  `canonical_owner_id` / `tenant_id` / binding / membership columns are never serialized. The `HoldingsReadContext`
  is never placed in a result.

## 3. The four wire conditions (verbatim from `979c1c6` §6) — verified

| # | Condition | Evidence | Result |
|---|---|---|---|
| WC-1 | The response envelope key set is still exactly `{v, ok, op, requestId?, result}` / `{v, ok:false, op, requestId?, outcome, detail?}`. | Source: `protocol.ts` `successFrame`/`classAFrame`. Executed: every captured v1 and v2 frame has envelope keys exactly `[ok, op, requestId, result, v]`; IRR `parseResponseFrame` accepts the v1 frames and refuses the v2 frames (`v` pinned to 1) | **VERIFIED** |
| WC-2 | No summary, view, holding or revision row carries any key in `IPC_CALLER_IDENTITY_KEYS` (`ipcClient.ts` L213–243). In particular the D02 effective owner and the historical storage owner must not be surfaced as `owner`/`ownerId`/`tenant`/`tenantId`/`userId`. | Executed: IRR's own `findResponseDisclosedKeys` over each complete parsed frame (depth-unbounded) → `[]` for list/get/revisions, v1 and v2, both IPD env modes; regex scan of the raw UTF-8 bodies for any of the 29 keys as a JSON key → no match; bodies contain neither `owner-4dc756b3`, `ipd-owner-ramki-personal`, the binding id nor the membership id. Complete deep key inventories in §4 | **VERIFIED** |
| WC-3 | Historical `ipd-owner-ramki-personal` portfolios and native D02 portfolios are served through one resolver path for the single ACTIVE binding — IRR will faithfully render whatever set IPD returns for `portfolio.list`, so the union/no-union property is decided entirely in IPD. | Source: §2 (`storageOwner` is exactly one owner; `list(storageOwner)` only). Executed: fixture holds S1 `SHARED` (price 11), D02 `SHARED` (22), D02 `D02_ONLY` (23), foreign `FOREIGN` (33); with the S1 binding ACTIVE, v1 and v2 `portfolio.list` return `[SHARED]` only, `portfolio.get SHARED` returns price **11**, `D02_ONLY` and `FOREIGN` → `RESOURCE_UNAVAILABLE` → IRR 404 `not-found`. IPD's own `s1_d02_read_relationship` tests 2 and 4 (no leak / no union; native D02 separate) pass | **VERIFIED** |
| WC-4 | Required read fields remain present: `weightSumPercentage`, `provenanceDigest`, `isSaved` on summary and view; `holdings`, `contributions` (empty) on view; `committedAt`, `holdingsCount`, `totalMarketValue`, `provenanceDigest` on revisions. Missing any one is refused by IRR (7-missing matrix). | Executed: all present in every captured frame (§4); IRR adapter mapped list and revisions to G2 without refusal in both modes, and the view in personal-use mode. `contributions` is empty **only** under `IIPS_LOCAL_PERSONAL_USE=1` (F-2) | **VERIFIED** (with F-2) |

## 4. Actual serialized responses (real IPD build, synthetic fixture)

Build: `/tmp/ipd` = clone of `main@4716d0bc`, `npm ci --ignore-scripts`, `tsc -p tsconfig.json`; served by
`listenIpc(createConnectionHandler(db, {settlement, env}))` on an AF_UNIX socket, real migrations
(`GATE3_MIGRATIONS`), fixture identical to IPD's `tests/s1_d02_read_relationship.test.ts`. Full bodies:
`artifacts/iid-s5-real-ipd-captured-frames-2026-11-21.json` (sha256 `46c92a85…`); driver:
`artifacts/iid-s5-real-ipd-consumer-probe-2026-11-21.mts` (sha256 `fc7a8cf3…`, run with `tsx --test`).

| Response | Protocol | Complete deep key inventory of the frame | Reserved keys |
|---|---|---|---|
| `portfolio.list` | v1 and v2 identical | `holdingsCount, isSaved, lastUpdated, ok, op, portfolioId, portfolioName, provenanceDigest, requestId, result, revision, totalMarketValue, v, weightSumPercentage` | none |
| `portfolio.get` (IPD env `{}`) | v1 = `store.get`; v2 = `getV2` | summary keys + `holdings[]`: `active, availableQty, averageBuyPrice, companyId, currentPrice, dpQty, identityStatus, lineageDigest, marketValue, pnlPercentage, profitLoss, quantity, reconciliationState, resolutionDisposition, securityIdentity, sourceBroker, symbol, weightPercentage`; `contributions[]`: `amount, contentDigest, contributedAt, contributionId, createdAt, fileName, importId, importedAt, lineageDigest, semantics, snapshotState, sourceBroker, unresolvedCount` | none |
| `portfolio.get` (IPD env `IIPS_LOCAL_PERSONAL_USE=1`) | v1 = `personalGet` | as above but `contributions: []` and additional `importEvidence[]`: `contentDigest, contributedAt, fileName, importedAt, lineageDigest, semantics, sourceBroker` (v2 is unaffected by this switch) | none |
| `portfolio.revisions` | v1 and v2 identical | `committedAt, contentDigest, holdingsCount, ok, op, operation, provenanceDigest, requestId, result, revision, totalMarketValue, v` | none |
| nested `securityIdentity` (when non-null) | — | `securityId, isin, series, isinAuthority` (`D114SecurityIdentity`, source) | none |

Note `isSaved:false` for an `INITIAL` revision is IPD's defined semantics (`isSavedForCurrentOperation`), not a defect.

## 5. Reconciliation table

| Work item / response | Category | Owner | Actual fields and structure | Reserved identity keys present? | Verification method and evidence | Result | Remaining work / blocker |
|---|---|---|---|---|---|---|---|
| `portfolio.list` → `PortfolioSummary[]` | Response contract | IPD | 9 keys per row (§4); result is the bare array | **No** | Source (`list`, `projectPortfolioBase/CurrentRevision`); executed real build, v1+v2; IRR scanner `[]`; IRR adapter → G2 OK; HTTP `GET /api/user-portfolios` 200 | PASS | Live-host capture (operator) |
| `portfolio.get` → `PortfolioDetail` incl. nested `holdings[]`, `contributions[]` (+ `importEvidence[]` in personal mode) | Response contract | IPD | §4; 18 holding keys; `durability`/`durable` absent | **No** | Source (`getSnapshot`, `holdingFromRow`, `personalGet`); executed real build; IRR scanner `[]`; IRR adapter → G2 OK **in personal-use mode**; refused (`UPSTREAM_UNAVAILABLE`, DR-4r) in governed mode because `contributions` is non-empty (F-2); HTTP 200 / 503 respectively | PASS (F-2) | Host must run IPD with `IIPS_LOCAL_PERSONAL_USE=1` (already required for the write path) |
| `portfolio.revisions` → `RevisionEntry[]` | Response contract | IPD | 7 keys per row (§4) | **No** | Source (`revisionsSnapshot`); executed real build; IRR scanner `[]`; IRR adapter → G2 (`committedAt→createdAt`) OK; HTTP 200 | PASS | Live-host capture (operator) |
| Reserved-key scanning (29 keys, deep, `TRANSPORT_FAULT`) | Consumer policy | IRR | `findResponseDisclosedKeys` applied to whole frame | n/a | Executed against 12 real frames (3 ops × v1/v2 × 2 env modes): `[]` every time; independent regex on raw bytes agrees | PASS | None |
| WC-1 envelope key set | Wire condition | IPD | `{v, ok, op, requestId, result}` | — | §3 | VERIFIED | None |
| WC-2 no reserved key in any row | Wire condition | IPD | §4 | **No** | §3 | VERIFIED | None |
| WC-3 single resolver path, no union | Wire condition | IPD | `storageOwner` = exactly one owner; `D02_ONLY`/`FOREIGN` → `RESOURCE_UNAVAILABLE` | — | §2, §3; IPD tests 2/4 | VERIFIED | None |
| WC-4 required read fields | Wire condition | IPD | all present | — | §3, §4 | VERIFIED (F-2) | None |
| Ancestry `e7ded933 → 2dec7261 → 4716d0bc` | Publication | IPD | — | — | §1 | VERIFIED | None |
| IRR consumer end-to-end vs real IPD | Integration | BOTH | `callIpc` → `IpcUserPortfolioPort` → `handleUserPortfolioRequest`; caller-supplied `?ownerId=`, `x-owner-id`, bearer ignored | — | Probe test 3 ×2 modes: list 200, revisions 200, detail 200 (personal) / 503 (governed), `D02_ONLY` 404, `FOREIGN` 404, `PUT …/holdings` 503 `operation-not-admitted` with zero frames sent | PASS | Windows host run (separately authorised) |
| **F-1** S1 → D02 relationship reachability from IRR | Scope | BOTH / PA-PO | Relationship lives on `v === 2` only; IRR sends `v: 1` and refuses `v: 2` responses | — | `dispatch.ts` L440, L536; IRR `IPC_PROTOCOL_VERSION = 1`; IPD evidence pack: "Confirm consumer v2/projection compatibility through the responsible consumer owner; no IRR modification or automatic v1→v2 upgrade is presumed." | **NOT EXERCISED** by current IRR | PA/PO decision whether IRR must adopt v2 reads; out of this task's authority |

## 6. Findings (not defects)

- **F-1 — the headline relationship is v2-only.** With the S1 binding ACTIVE, IRR's v1 reads succeed via the
  **generic** `resolveActiveBinding` and read S1 storage — the same rows the v2 `S1_D02_PERSONAL_READ` path
  returns (probe: identical `result` bodies for list and revisions; identical holdings for get). So the
  user-visible data is the same today, but Stage 5 criterion 1 ("S1-authenticated requests accessing the
  approved D02-scoped read relationship") is **not** satisfied by the IRR consumer as built; it would require
  IRR to send `v: 2` and accept `v: 2` frames, which is a contract change outside this verification task and
  explicitly not presumed by IPD's own record. Note also that if the host's ACTIVE binding were ever the
  native D02 owner, v1 reads would resolve it generically as well; nothing in v1 distinguishes the two.
- **F-2 — DR-4r contributions.** Governed-mode v1 `portfolio.get` carries the full contribution ledger;
  IRR's `toG2View` refuses non-empty `contributions` (authorised DR-4r scope). IPD's `personalGet` exists
  precisely to send `contributions: []` under `IIPS_LOCAL_PERSONAL_USE=1`. Pre-existing on both sides; a
  deployment precondition for host verification, not a D02 regression.
- **Observation carried from `979c1c6`:** the HTTP transport echoes holding rows unprojected, so the new
  nullable broker fields (`dpQty`, `availableQty`, `profitLoss`, `pnlPercentage`, `reconciliationState`) and
  `securityIdentity` reach the browser as-is. None is reserved; no action.

## 7. Source-level vs test-level vs live-runtime

| Layer | Status |
|---|---|
| Source (merged IPD `main@4716d0bc`) | Done — §2 |
| IPD's own tests at `main` | `s1_d02_read_relationship` **6/6**; `q1_ipc_read_contract_conformance` + `g3_portfolio_read_isolation` + `g3_ipc_framing` + `g3_caller_authority` + `durable_holdings_contract_v1` **174/174** (compiled `dist/`, `node --test`) |
| Executed production code path, synthetic DB | Done — probe **6/6**, 12 real frames captured (§4). This is the "narrowest faithful test"; it is **not** live-runtime evidence |
| IRR side | Unchanged since `979c1c6` (262 reused tests); real-IPD probe adds end-to-end evidence |
| Live runtime / Windows host / real persisted holdings | **Not performed** (out of scope; no provisioning or runtime change made) |

## 8. Can the conditional verdict be closed?

**Yes, at the level this task can reach.** The actual merged IPD responses satisfy the IRR consumer contract;
all four wire conditions are verified; no genuine defect exists in either repository. What remains is not a
compatibility question: (a) the PA/PO decision on F-1 (whether IRR must move to v2 to *use* the D02
relationship), (b) the F-2 deployment precondition, (c) the pin advance `1ce6a829…` → `4716d0bc…` as a
separate deliberate act, and (d) controlled Windows host verification with real persisted holdings.
