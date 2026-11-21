# IID Stage 5 — IPD-side response-contract verification (2026-11-21)

Companion to `IID-STAGE-5-IRR-CONSUMER-COMPATIBILITY-VERIFICATION-2026-11-21.md` (IRR commit `979c1c6`).
Purpose: close that record's conditional verdict by inspecting the **actual merged IPD implementation**
and the **actual serialized `portfolio.list` / `portfolio.get` / `portfolio.revisions` responses** against
IRR's reserved caller-identity policy and the four documented wire conditions.

## Decision

**CONDITIONAL / NOT VERIFIED.** The merged IPD implementation is still not readable from this environment,
so no statement in this record about `e7ded933…`, `2dec7261…` or `4716d0bc…` is an inspected fact. Nothing
below upgrades the earlier conditional verdict. No IRR source, pin, lockfile or runtime setting was changed.

## 1. Remote state established this pass

| Item | Result |
|---|---|
| IRR `main` | `6254399777b1877bfb3634bf8d4ba2769678d002` (re-fetched; unchanged since `979c1c6` was written). Working branch `arena/6373b685-iips-review-recovered` = `main` + the two Stage 5 evidence records only |
| IRR consumer inspected | `frontend/server/user-portfolio/ipcClient.ts` (`IPC_CALLER_IDENTITY_KEYS`, **29 keys**, re-counted mechanically this pass), `ipcPortAdapter.ts`, `ownerContextFromBinding.ts`, `frontend/server/user-portfolio-transport.ts`, `frontend/server/investment/sources.ts`, `holding-identity-transport.ts` — unchanged |
| IRR dependency pin | `iips-production-market-data` → `github:ramkivs/iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be` (manifest and lockfile agree) — unchanged, **not advanced** |
| IPD `main` (`4716d0bc123e5fb3e8e72f74bada257d08d76ba2` as reported) | **Not verifiable**: `git ls-remote …iips-production-market-data.git main` → HTTP 403 "Write access to repository not granted"; `GET /repos/ramkivs/iips-production-market-data` → 403 "Resource not accessible by integration" |
| IPD implementation `e7ded933ae289ee6bb8310f3ff68f5d965886056` | **Not verifiable**: `GET /repos/…/commits/<sha>` → 403; `GET /repos/…/tarball/<sha>` → 403; public commit search → 0 results |
| IPD merge `2dec72618d194f6207e9f9fed5cc031c3461d922` and ancestry `e7ded933 ∈ ancestors(4716d0bc)` | **Not verifiable** (same limitation) |
| Token identity | `gh auth status`: logged in as `ramkivs` via `GH_TOKEN`; `GET /installation/repositories` → 403. The failure mode is a **GitHub App installation token whose repository grant excludes `iips-production-market-data`**, not a network fault and not a missing branch |
| Local/offline copies of IPD at any recent commit | None: no `node_modules`, no npm cache, no checkout anywhere on the filesystem |

## 2. What could be examined without IPD access — and why it is not sufficient

The IRR tree carries IPD source **only as historical patches** under `docs/integration/artifacts/`
(`g3-connection-release-conformant.patch` + `q1-broker-import-durability.patch`, Gate 3 / Q1 era, October
2026). They apply cleanly onto an empty tree (reconstructed at `/tmp/ipd-hist`, not committed) and were read
for one purpose: to learn the **serializer design** and the **exact files** a verification bundle must contain.

Findings (historical source level, **pre-D02, pre-pin**):

- `src/ipc/dispatch.ts` returns `store.list(owner)`, `store.get(owner, portfolioId)`,
  `store.revisions(owner, portfolioId)` **directly as `result`**; `src/ipc/protocol.ts` `successFrame` emits
  exactly `{v, ok:true, op, requestId?, result}` and `classAFrame` exactly `{v, ok:false, op, requestId?, outcome, detail?}`.
- `src/persistence/portfolio_store.ts` builds every row by **explicit field projection** (`portfolioId`,
  `portfolioName`, `revision`, `holdingsCount`, `totalMarketValue`, `lastUpdated`, …; holdings via
  `holdingFromRow` with 12 named fields). No `...row` spread, so `canonical_owner_id` / `tenant_id` columns
  are never serialized. A mechanical scan of the historical serializer sources for any of IRR's 29 reserved
  keys as an object-literal key found **none** (the only matches are the `owner: OwnerRef` *parameter*
  annotations).
- This historical tree is **older than the current pin**: its summary lacks `weightSumPercentage`,
  `provenanceDigest`, `isSaved` and its revision rows lack `holdingsCount` / `totalMarketValue` /
  `provenanceDigest`, all of which IRR now requires. It therefore cannot stand in for `1ce6a829…`, let
  alone for the D02 implementation at `e7ded933…`, whose owner-resolution and any row/metadata additions are
  exactly the thing under question. It was **not executed** and is **not** offered as evidence of the merged
  response contract.

The `evidence/integration/durable-holdings-contract-v1-2026-11-06/contracts.schema.json` closed schemas
(`additionalProperties:false` on `Summary`, `Detail`, `ReadHolding`, `Revision`, `*Success`) describe a
**candidate D03 v2** contract per their own `$comment`, not the v1 wire, and were not used as evidence.

## 3. The four wire conditions (verbatim from `979c1c6`, §6) and their status

| # | Condition (as documented) | IPD-side evidence available | Status |
|---|---|---|---|
| WC-1 | The response envelope key set is still exactly `{v, ok, op, requestId?, result}` / `{v, ok:false, op, requestId?, outcome, detail?}`. | None for `e7ded933…` (historical `protocol.ts` matches; superseded) | NOT VERIFIED |
| WC-2 | No summary, view, holding or revision row carries any key in `IPC_CALLER_IDENTITY_KEYS` (`ipcClient.ts` L213–243). In particular the D02 effective owner and the historical storage owner must not be surfaced as `owner`/`ownerId`/`tenant`/`tenantId`/`userId`. | None for `e7ded933…` (historical serializer projects explicit fields with no reserved key; superseded) | NOT VERIFIED |
| WC-3 | Historical `ipd-owner-ramki-personal` portfolios and native D02 portfolios are served through one resolver path for the single ACTIVE binding — IRR will faithfully render whatever set IPD returns for `portfolio.list`, so the union/no-union property is decided entirely in IPD. | None (the D02 resolver does not exist in any source available here) | NOT VERIFIED |
| WC-4 | Required read fields remain present: `weightSumPercentage`, `provenanceDigest`, `isSaved` on summary and view; `holdings`, `contributions` (empty) on view; `committedAt`, `holdingsCount`, `totalMarketValue`, `provenanceDigest` on revisions. Missing any one is refused by IRR (7-missing matrix). | None for `e7ded933…` (these fields post-date the historical patches) | NOT VERIFIED |

## 4. Reconciliation table

| Work item / response | Category | Owner | Actual fields and structure | Reserved identity keys present? | Verification method and evidence | Result | Remaining work / blocker |
|---|---|---|---|---|---|---|---|
| `portfolio.list` → `PortfolioSummary[]` | Response contract | IPD | **Unknown at `e7ded933…`.** IRR requires `portfolioId, portfolioName, revision, holdingsCount, totalMarketValue, lastUpdated, weightSumPercentage, provenanceDigest, isSaved`; ignores other non-reserved keys | **Undetermined** | Source: not readable. Test: none at merged commit. Live: none. (Historical pre-pin serializer: explicit projection, no reserved keys — superseded) | NOT VERIFIED | Read access to IPD `src/persistence/portfolio_store.ts` (or successor) + a run of IPD's own read-conformance test at `4716d0bc…` |
| `portfolio.get` → `PortfolioDetail` (incl. nested `holdings[]`, `contributions[]`) | Response contract | IPD | **Unknown at `e7ded933…`.** IRR requires summary fields + `holdings`, `contributions` (must be empty), refuses `durability`/`durable`; holding rows are passed through to IRR's HTTP body unprojected | **Undetermined** — the nested holding rows are the highest-risk location for a D02 owner annotation | As above | NOT VERIFIED | As above, plus one real serialized `portfolio.get` frame from the host (bytes after the 4-byte prefix) |
| `portfolio.revisions` → `RevisionEntry[]` | Response contract | IPD | **Unknown at `e7ded933…`.** IRR requires `revision, operation, committedAt, holdingsCount, totalMarketValue, provenanceDigest`, optional `contentDigest` | **Undetermined** | As above | NOT VERIFIED | As above |
| Reserved-key scanning (29 keys, deep, `TRANSPORT_FAULT`) | Consumer policy | IRR | `findResponseDisclosedKeys` → `IPC_CALLER_IDENTITY_KEYS` (29, re-counted), applied to the whole parsed frame at any depth; canonical-identity keys (`companyId`, `identityStatus`, `resolutionDisposition`) deliberately **not** refused inbound | n/a (this is the scanner) | Source read; `ipcClient.test.ts` 34/34 and S5 probe C6-reserved (reused from `979c1c6`, not re-run) | IRR side VERIFIED | None in IRR |
| WC-1 envelope key set | Wire condition | IPD | see §3 | — | none at merged commit | NOT VERIFIED | IPD `src/ipc/protocol.ts` at `4716d0bc…` |
| WC-2 no reserved key in any row | Wire condition | IPD | see §3 | **Undetermined** | none at merged commit | NOT VERIFIED | IPD serializer + D02 read path at `4716d0bc…`; one real `portfolio.get` frame |
| WC-3 single resolver path, no union | Wire condition | IPD | see §3 | — | none | NOT VERIFIED | IPD D02 owner-resolution module + its tests at `4716d0bc…` |
| WC-4 required read fields present | Wire condition | IPD | see §3 | — | none at merged commit | NOT VERIFIED | Same bundle as WC-1/WC-2 |
| Ancestry `e7ded933 → 2dec7261 → 4716d0bc` | Publication | IPD / operator | — | — | `git ls-remote` 403 | NOT VERIFIED | `git merge-base --is-ancestor e7ded933… 4716d0bc…` output + `git log --oneline 1ce6a829..4716d0bc` from a reader with access |

## 5. Source-level vs test-level vs live-runtime

- **Source level (merged IPD):** not performed — access denied.
- **Test level (merged IPD):** not performed — no source to execute.
- **Live runtime:** not performed — out of scope (no host provisioning) and would require the above first.
- **IRR side:** fully verified at source and test level in `979c1c6` (262 reused tests, 6 targeted probes);
  not repeated here because nothing in IRR changed.
- **Synthetic peer emulation:** used only in `979c1c6` to establish IRR's reaction to hypothetical owner-bearing
  rows; it establishes nothing about IPD's actual contract and is not counted as IPD evidence.

## 6. Precise access limitation and the smallest bundle that finishes the job

**Limitation.** The GitHub token in this environment is a GitHub App installation token for `ramkivs` whose
repository grant does not include `ramkivs/iips-production-market-data` (every REST, Git-over-HTTPS and
codeload request answers 403/404 "not accessible by integration"). The IRR repository is readable with the same
token, so the gap is specifically the IPD repository grant.

**Either** of the following finishes the verification in one pass:

1. **Grant.** Add `ramkivs/iips-production-market-data` (read) to the installation that issues this token.
2. **Bundle** (if the grant is not wanted), produced by anyone with read access, at commit `4716d0bc…`:
   - `git bundle create ipd-main.bundle 1ce6a829..4716d0bc` (preferred — carries ancestry for `e7ded933`
     and `2dec7261` and every file), **or** at minimum:
   - `src/ipc/protocol.ts`, `src/ipc/dispatch.ts`, `src/persistence/portfolio_store.ts`,
     `src/persistence/binding.ts`, the D02 owner-resolution module introduced by `e7ded933…`, and the IPD
     read-conformance test(s) (`tests/q1_ipc_read_contract_conformance.test.ts` or successor), plus
   - the text output of `git log --oneline 1ce6a829..4716d0bc` and
     `git merge-base --is-ancestor e7ded933ae289ee6bb8310f3ff68f5d965886056 4716d0bc123e5fb3e8e72f74bada257d08d76ba2; echo $?`.
   - Optional but decisive for WC-2 at runtime: one captured `portfolio.get` response frame from the host
     (raw bytes after the 4-byte length prefix) — this is exactly what IRR's `portfolio:capture` utility
     (`frontend/server/user-portfolio/capture/`) was built to produce.

With either input, the remaining work is mechanical: run IRR's `findResponseDisclosedKeys` over the three real
result shapes, diff the serializer field set against WC-4, and confirm the envelope against WC-1.

## 7. Defects

None identified in IRR. None can be asserted or excluded in IPD.
