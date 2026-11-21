# IID Stage 5 — IRR Consumer Compatibility Verification (2026-11-21)

**Subject.** Whether IRR's existing IPC consumer and projections correctly support IPD's merged,
S1-preserving, read-only D02 ownership relationship (authenticated identity = S1; effective domain owner =
D02 `owner-4dc756b3`; historical storage owner = `ipd-owner-ramki-personal`).

**Disposition.** **IRR is compatible on the IRR side, by construction, and no IRR change is made.** The
compatibility holds under one condition that IRR enforces and IPD must satisfy: **no portfolio read result may
carry any of the 29 reserved caller-identity keys** (`owner`, `ownerId`, `tenant`, `tenantId`, `userId`,
`principal`, …). This document records the evidence. The merged IPD commit itself could **not** be read from
this environment (§2), so the IPD half of the verdict is a stated condition, not an inspected fact.

---

## 1. What was inspected

| Artefact | Identity |
|---|---|
| IRR `main` | `6254399777b1877bfb3634bf8d4ba2769678d002` (merge of PR #600, 2026-11-20); working tree byte-identical to `origin/main`, `git status` clean |
| IRR dependency pins (`frontend/package.json`, `package-lock.json`) | `iips-production-market-data` → `github:ramkivs/iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be` (lock `resolved` `git+ssh://…#1ce6a829…`); `iips-broker-import` → `#12a3d625d0ad603cb0bd9cea46bae314942ee40f`; `iips-np04-governed-persistence` → `#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` |
| IPD commit named for verification | `e7ded933ae289ee6bb8310f3ff68f5d965886056` (branch `arena/d1c19f24-iips-production-market-data`) — **not readable from this environment** |
| IRR consumer files read in full | `frontend/server/user-portfolio/ipcClient.ts`, `ipcPortAdapter.ts`, `ownerContextFromBinding.ts`, `frontend/server/user-portfolio-transport.ts`, `frontend/server/investment/sources.ts`, `frontend/server/investment/holding-identity-transport.ts` (route + error bodies), `frontend/src/features/portfolio-import/irrPortfolioStorePortAdapter.ts` |
| Authority documents | `PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md` (D-1 Option C), `IIPS_v3.0_PA_D02_D03_D05_ENGINEERING_ACT_2026-11-06.md`, `docs/LOCAL-PERSONAL-USE-PERSISTENCE.md`, `artifacts/q1-broker-import-durability.patch` (contract-v1 wire names) |

## 2. IPD access — blocking gap, stated plainly

Every route to `ramkivs/iips-production-market-data` failed with the credentials available here: `git clone`
→ 403 ("Write access to repository not granted" — i.e. no read scope), REST API → 403, codeload tarballs for
`refs/heads/main` and `e7ded933…` → 404, repository page → 404, and the repository is absent from
`gh repo list ramkivs`. **No IRR artefact references `e7ded933…`**; IRR's pin is `1ce6a829…`.

Consequence: the statements "IPD preserves existing IPC framing, response fields, strict mutation resolver and
native D02 reads" are taken **as given by the task statement** and converted below into the exact wire
conditions IRR depends on, so an operator with IPD access can confirm them in minutes (§6).

## 3. How IRR relates to the three identities

IRR carries **none** of the three identities and cannot influence which one IPD applies:

- `OwnerContextSource` has a single member, `'IPD_A2_BINDING'`; the owner context carries **no owner value**.
  The only IRR-side precondition is the server-owned setting `IIPS_G3_IPC_BINDING_PROVISIONED` (`true|1|yes`).
- `encodeRequestFrame` deep-scans (depth 12) every outbound payload for the 29 caller-identity keys plus the
  canonical-identity keys and throws `IpcWireAuthorityError` **before a socket is opened**. `portfolio.list`
  sends no payload; `get`/`revisions` send `{portfolioId}` only.
- Therefore the S1 → D02 substitution, and the choice between `owner-4dc756b3` and `ipd-owner-ramki-personal`
  for storage lookup, are **wholly IPD-internal**. IRR's contract is: *send nothing about the owner; accept a
  closed v1 envelope; refuse anything that discloses an owner.* This is consistent with D-1 Option C (no
  cross-domain identity mapping) and with the D02 act (request-supplied owner/tenant/canonical identity is
  rejected, not stripped into authority).

## 4. Reconciliation table

| Component | Category | Owner | Existing implementation | Compatibility result | Test evidence | Remaining work |
|---|---|---|---|---|---|---|
| IPC client | Integration | IRR | `ipcClient.ts`: uint32-BE length prefix + UTF-8 JSON, `v:1`, closed 8-op set, one request per connection, local endpoint only (POSIX socket / `\\.\pipe\`), no retry, timeout → `OUTCOME_UNKNOWN`; closed response envelope `{v, ok, op, requestId?, result}` / `{…, outcome, detail?}` — any other key → `TRANSPORT_FAULT` | **Compatible** with unchanged framing. Any *envelope*-level addition by IPD would be refused (correct, fail-closed) | `ipcClient.test.ts` 34/34 (incl. extra-envelope-key refusal, Class P, timeout-no-retry); `ipcContractAlignment.test.ts` 13/13 | None in IRR. IPD must keep the envelope key set unchanged (task statement says it does) |
| Request construction | Integration | IRR | `list` → no payload; `get`/`revisions` → `{portfolioId}`; writes add `expectedRevision`/`options.mode`; 29 + 6 refused wire keys scanned before I/O; `assertScopeNotTransmitted` drops the IRR-local tenant hint | **Compatible.** No owner, tenant, token or claim can reach IPD, so IRR cannot select S1, D02 or storage owner even accidentally (criterion 7) | `ipcPortAdapterIntegration.test.ts` "never transmits the IRR-local tenant hint or any authority key on the real wire"; `user-portfolio-transport.test.ts` "ignores caller-supplied credentials and identity claims"; S5 probe C1/C2/C7 (§5) | None |
| Response parsing | Implementation | IRR | `parseResponseFrame` + `toG2Summary`/`toG2View`/`toG2RevisionEntry`: required fields enforced (`portfolioId, portfolioName, revision, holdingsCount, totalMarketValue, lastUpdated, weightSumPercentage, provenanceDigest, isSaved`; view adds `holdings`, `contributions`; revisions `committedAt→createdAt`), `durability`/`durable` on a view refused, non-empty `contributions` refused; **unknown non-reserved result keys ignored**; **any reserved caller-identity key anywhere in the response → `TRANSPORT_FAULT`** (OC-6) | **Compatible with unchanged response fields.** Hard condition on IPD: result rows (summary, view, holding, revision) must not carry `owner`, `ownerId`, `tenant`, `tenantId`, `userId`, … — if the merged D02 read annotates rows with an owner under one of those names, *every* IRR read becomes 503 | `ipcPortAdapter.test.ts` 60/60; `ipcPortAdapterIntegration.test.ts` 9/9 (7-missing + 3-rename matrix); S5 probe C6 and C6-reserved (§5) | None in IRR. Operator check on IPD `e7ded933…` (§6 item 2) |
| Portfolio projection | Implementation | IRR | `user-portfolio-transport.ts` serves `{portfolios}`, `{portfolio}`, `{revisions}` from the frozen G2 shapes; `investment/sources.ts` `toHoldingObservation` projects a fixed field set (incl. W05 `portfolioRevision`) and `createPortfolioHoldingsProvider` returns `[]` for empty holdings; `holding-identity-transport.ts` reads through the same port | **Compatible.** Summary/revision projection drops any extra IPD fields; empty holdings is a 200 with `[]`, never 404/503. Observation (not a defect): `G2PortfolioView.holdings` rows are passed through unprojected to the HTTP body, so a *non-reserved* extra field on a holding row would be echoed to the browser | `sourcesW05Projection.test.ts` 5/5; `phase1D114WireToResolverInput.test.ts` 3/3; `phase1D114IdentityProjection.test.ts` 6/6; `userPortfolioDirectP1Integration.test.ts` 2/2; S5 probe C4/C6 | None |
| Owner isolation | Security / Testing | BOTH | IRR: single store behind the adapter (`cachesRecord:false`, `hasFallbackSurface:false`), no session/HTTP/default-portfolio fallback, all D02-read consumers use the same port with empty `G2Scope {}`; `RESOURCE_UNAVAILABLE` → 404 indistinguishable from foreign/tombstoned. IPD: resolves the sole ACTIVE binding per request (D02 act) | **IRR half compatible; no data union or fallback is possible in IRR** (criterion 3). IPD half **unverified here** (commit unreadable) | `fenceUnchanged.test.ts` 13/13; `ownerContextFromBinding.test.ts` 15/15; `owner-context-integration.test.ts` 14/14; `owner-context-uncached.test.ts` 11/11; `userPortfolioBoundary.test.ts` 8/8; `option2F.test.ts` 15/15 | IPD-side confirmation that native D02 reads and historical `ipd-owner-ramki-personal` records are served by the same resolver path with no union (§6 item 3) |
| Error and unavailable handling | Testing | IRR | Chain: binding precondition absent → 503 `binding-precondition-absent` (no port constructed); endpoint absent/URL/host:port → 503 `ipc-endpoint-not-configured`; connect failure, Class P, `WRITE_NOT_AUTHORIZED`, `UNAVAILABLE`, `REFUSED_*`, envelope faults → 503 `upstream-unavailable` with no owner, path or stack disclosed; `RESOURCE_UNAVAILABLE` → 404; `INVALID_REQUEST` → 400 bounded reason; timeout → `OUTCOME_UNKNOWN`, never retried | **Compatible** (criteria 4, 5). Authorization refusals from the merged resolver surface as non-disclosing 503. Observation: an inbound-disclosure refusal is labelled `unavailableReason: ipc-endpoint-unreachable` — the status is correct and fail-closed, only the diagnostic label is coarse | `user-portfolio-transport.test.ts` 31/31 (fail-closed read diagnosis, 400 diagnostics); `ipcPortAdapterIntegration.test.ts` (Class A/P, silent peer); S5 probe C4/C5 | None required. Optional, not Stage 5: a finer `unavailableReason` for inbound-disclosure refusals |
| End-to-end consumer compatibility | Integration | BOTH | HTTP → `handleUserPortfolioRequest` → `IpcUserPortfolioPort` → real `callIpc` → local socket peer | **IRR side demonstrated against a synthetic contract-v1 peer emulating the merged D02 read semantics** (S5 probe, 6/6). **Against the real IPD `e7ded933…` peer: not demonstrated** — requires IPD access and the Windows host | `userPortfolioDirectP1Integration.test.ts` 2/2; `user-portfolio-transport.test.ts`; S5 probe (§5) | Controlled Windows host run with IPD at the merged commit; pin-advance decision (§7) |

**Criterion 8 (mutations unchanged):** write routes require server-owned `IIPS_LOCAL_PERSONAL_USE=1` *and* the
binding precondition; otherwise 503 `operation-not-admitted` with no port constructed and no body read;
`context`/`reset` are 503 in every mode. Nothing in the D02 read relationship touches this path.
Evidence: `user-portfolio-transport.test.ts` personal-use block (21 tests) and S5 probe C8.

## 5. Tests reused and newly executed

**Reused, re-executed unchanged** (vitest 2.1.8, Node 22, `environment: node`, run from an out-of-tree
harness because `frontend/node_modules` is absent and the three Git pins cannot be installed without IPD
access; none of these suites import the IPD packages at runtime):

| Suite | Result |
|---|---|
| `server/user-portfolio/ipcClient.test.ts` | 34 / 34 |
| `server/user-portfolio/ipcPortAdapter.test.ts` | 60 / 60 |
| `server/user-portfolio/ipcPortAdapterIntegration.test.ts` | 9 / 9 |
| `server/user-portfolio/ipcContractAlignment.test.ts` | 13 / 13 |
| `server/user-portfolio/fenceUnchanged.test.ts` | 13 / 13 |
| `server/user-portfolio/userPortfolioDirectP1Integration.test.ts` (incl. pin guard `1ce6a829…`) | 2 / 2 |
| `server/user-portfolio/ownerContextFromBinding.test.ts` | 15 / 15 |
| `server/user-portfolio/{option2F,translationBoundary,userPortfolioBoundary,userPortfolioContract}.test.ts` | 46 / 46 |
| `server/user-portfolio-transport.test.ts` | 31 / 31 |
| `server/owner-context-integration.test.ts`, `server/owner-context-uncached.test.ts` | 25 / 25 |
| `server/investment/{sourcesW05Projection,phase1D114WireToResolverInput,phase1D114IdentityProjection}.test.ts` | 14 / 14 |
| **Total reused** | **262 / 262, 17 files** |

**Newly executed, targeted, out-of-tree (not committed — it is a probe, not a product test):**
`/tmp/harness/probe/s5OwnerSemantics.probe.test.ts`, 6 / 6. It drives the real HTTP boundary, real adapter
and real framing against a synthetic peer and asked the one question no existing suite asks — what IRR does
when result rows reflect the merged D02 ownership:

| Probe | Observed |
|---|---|
| C1/C2/C7 — caller supplies `?ownerId=owner-4dc756b3`, `x-owner-id`, `cookie: owner=ipd-owner-ramki-personal`, `Authorization: Bearer …` | list/get/revisions 200; wire frames contained exactly `{v, op[, payload]}`; `list` payload `undefined`, `get` payload `{portfolioId}`; neither owner string nor the bearer value appeared on the wire |
| C6 — result rows carry **non-reserved** extra fields (`effectiveOwner`, `storageOwner`) | summary and revision projections drop them; `portfolio` view drops them at top level; holding rows pass through with them present (observation in §4) |
| C6-reserved — result rows carry **reserved** keys `ownerId` / `owner` | list, get and revisions all **503 `upstream-unavailable`**; no owner value disclosed. IRR never consumes such a response |
| C4 — empty holdings | `GET …/p-hist-1` 200 with `portfolio.holdings: []`; `createPortfolioHoldingsProvider` → `[]` |
| C4/C5 — IPD refusals | `WRITE_NOT_AUTHORIZED` → 503; `REFUSED_OWNER_BINDING` → 503; Class P → 503; `RESOURCE_UNAVAILABLE` → 404 `not-found`; no owner string in any body |
| C8 — `PUT …/holdings` without `IIPS_LOCAL_PERSONAL_USE` | 503 `operation-not-admitted`; **zero** IPC frames sent |

## 6. Conditions on the IPD side (for whoever can read `e7ded933…`)

1. The response envelope key set is still exactly `{v, ok, op, requestId?, result}` / `{v, ok:false, op, requestId?, outcome, detail?}`.
2. No summary, view, holding or revision row carries any key in `IPC_CALLER_IDENTITY_KEYS`
   (`frontend/server/user-portfolio/ipcClient.ts` L213–243). In particular the D02 effective owner and the
   historical storage owner must **not** be surfaced as `owner`/`ownerId`/`tenant`/`tenantId`/`userId`.
3. Historical `ipd-owner-ramki-personal` portfolios and native D02 portfolios are served through one
   resolver path for the single ACTIVE binding — IRR will faithfully render whatever set IPD returns for
   `portfolio.list`, so the union/no-union property is decided entirely in IPD.
4. Required read fields remain present: `weightSumPercentage`, `provenanceDigest`, `isSaved` on summary and
   view; `holdings`, `contributions` (empty) on view; `committedAt`, `holdingsCount`, `totalMarketValue`,
   `provenanceDigest` on revisions. Missing any one is refused by IRR (7-missing matrix).

## 7. Answers required by the task

1. **Compatible?** On the IRR side, **yes** — the consumer is owner-agnostic by construction and all 262
   reused tests plus the 6 targeted probes pass. The end-to-end verdict is **conditional** on §6, because
   the merged IPD commit could not be inspected from this environment.
2. **Commit and pin.** IPD commit named: `e7ded933ae289ee6bb8310f3ff68f5d965886056` (unreadable here).
   IRR pin inspected: `github:ramkivs/iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be`
   (manifest + lockfile agree; CI guard `.ci/verify-ipd-pins.mjs` additionally checks the installed tree).
   IRR `main` inspected: `6254399777b1877bfb3634bf8d4ba2769678d002`.
3. **Per-component results.** §4: six rows compatible on the IRR side; "Owner isolation" and
   "End-to-end" are BOTH-owned and their IPD half is unverified here.
4. **Tests.** 262 reused (17 files, unchanged, all pass); 6 newly executed targeted probes, out-of-tree,
   all pass. No completed test was repeated for its own sake; the re-run was needed because the
   workspace has no installed `node_modules` and therefore no prior run artefact.
5. **Genuine defect.** **None established.** Two observations, neither a compatibility defect and neither
   acted on: (a) holding rows are echoed unprojected on `GET /api/user-portfolios/:id`; (b) an inbound
   owner-disclosure refusal is labelled `ipc-endpoint-unreachable`.
6. **IRR changes necessary?** **No.** No source, test, pin or lockfile was modified. The pin advance
   `1ce6a829…` → `e7ded933…` is a **separate, deliberate act** (manifest + lockfile + `userPortfolioDirectP1Integration`
   pin guard + CI guard) that requires read access to IPD to install and verify; it is not a compatibility
   fix and was not performed.
7. **Ready for controlled Windows host verification?** **From IRR's side, yes**: the consumer needs only
   `IIPS_G3_IPC_BINDING_PROVISIONED=true` and `IIPS_G2_IPC_ENDPOINT=\\.\pipe\<name>`, and the
   `userPortfolioDirectP1Integration` / `ipcPortAdapterIntegration` suites already select a named pipe on
   win32. **Overall, not yet**: §6 must be confirmed against `e7ded933…` first, and the host run itself is
   outside this task (no provisioning or runtime change performed).
