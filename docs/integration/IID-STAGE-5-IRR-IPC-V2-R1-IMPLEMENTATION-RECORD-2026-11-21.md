# IID Stage 5 — IRR IPC v2 read channel + R-1 contribution ledger: Implementation Record

**Date:** 2026-11-21
**Repository:** `ramkivs/iips-review-recovered` (IRR), branch `arena/6373b685-iips-review-recovered` (from `main` `6254399`)
**Authority:** PA/PO approval of **R-1** in proposal `3719820` (`docs/integration/IID-STAGE-5-IRR-IPC-V2-ADOPTION-PROPOSAL-2026-11-21.md` §6). Implementation authorization for R-1 only.
**IPD reference:** `main@4716d0bc123e5fb3e8e72f74bada257d08d76ba2` (unchanged; IPD not modified).
**Prior evidence reused:** `979c1c6` (IRR consumer compatibility), `d22f156` (IPD response contract, COMPATIBILITY CONFIRMED, 12 captured frames).

> This record does **not** claim IID Stage 5 acceptance, host operational readiness, or live host operation. It records an IRR implementation, its targeted test evidence, a test-level verification against the real IPD dispatcher and store, and the prerequisites that remain before a controlled Windows host verification can be scheduled.

---

## 1. Remote state re-established before work

| Repository | Ref | Commit | Result |
| --- | --- | --- | --- |
| IRR `origin/main` | `main` | `6254399777b1877bfb3634bf8d4ba2769678d002` | unchanged |
| IRR working branch (before) | `arena/6373b685-iips-review-recovered` | `3719820` (proposal) | clean |
| IRR pin | `frontend/package.json`, lock, `.ci/verify-ipd-pins.mjs` | `iips-production-market-data#1ce6a829…` | **not advanced**; `node .ci/verify-ipd-pins.mjs` → all three pins verified after `npm ci` |
| IPD `origin/main` | `main` | `4716d0bc` | unchanged; `/tmp/ipd` checkout clean at that commit, `dist/` hashes: `dispatch.js fb4a3abc…`, `portfolio_store.js 76185ec7…`, `binding.js 551f14b2…` |

## 2. Scope note — why W-01..W-06 were implemented under an R-1 authorization

R-1 is defined (proposal §6) as "on the v2 path only, `toG2View` validates each row … and carries them on a new G2 field". A v2 path did not exist in IRR (`ipcClient.ts` refused `v ≠ 1` both outbound and inbound). The additive representation can be "applied only to the approved v2 read path" (requirement 4) and the "real IPD dispatcher/store integration harness consumes the v2 responses" (verification) only if IRR speaks v2. Proposal §5 (W-01..W-06) was therefore implemented **exactly as written**, as the technical dependency of R-1, with no additions beyond it. Nothing in R-2/R-3/R-4 was implemented.

## 3. What changed (files)

| File | Change | Category |
| --- | --- | --- |
| `frontend/server/user-portfolio/ipcClient.ts` | `IPC_PROTOCOL_VERSION_V2 = 2`, `IpcProtocolVersion`, `IPC_V2_READ_OPERATIONS` (closed: list/get/revisions); `v` types widened; `encodeRequestFrame` admits `v ∈ {1,2}` and, for v2, enforces the IPD grammar (`assertV2RequestGrammar`: read set only, list has no `payload` key, get/revisions exactly `{portfolioId}` non-blank) **after** the authority-key scan and **before** any socket; `parseResponseFrame(body, expectedVersion = 1)` requires `frame.v === expectedVersion` (no downgrade/upgrade); `IpcCallOptions.protocolVersion?` threaded to encode + parse. `IPC_PROTOCOL_VERSION` stays `1`; reserved-key list, OC-6 scan, caps, Class P / outcome-unknown untouched. | W-01..W-04 |
| `frontend/server/user-portfolio/ipcPortAdapter.ts` | `IpcPortAdapterOptions.protocolVersion?` (default 1); `protocolVersion` **getter** (no new own state); `transport` seam gains optional 3rd arg; `call()` refuses any non-read op on a v2 port **before** the precondition check and before I/O (`UPSTREAM_UNAVAILABLE`, the same G2 reason IPD's `WRITE_NOT_AUTHORIZED` maps to); `toG2View`: v1 rule byte-identical (non-empty `contributions` refuse), v2 rule = `toG2ContributionLedger` (exported) → `contributionLedger`, `contributions: []`; new `G2_CONTRIBUTION_SEMANTICS` runtime constant lives here (the contract module's runtime export set is frozen). | W-05, W-08 |
| `frontend/server/user-portfolio/userPortfolioContract.ts` | Additive **types only**: `G2PortfolioView.contributionLedger?: readonly G2ContributionLedgerEntry[]`, `G2ContributionLedgerEntry` (mirror of IPD `PortfolioContribution`: 10 required keys, 3 optional 007 keys, same nullability), `G2ContributionSemantics`. No runtime export added (the "EXACTLY ONE runtime export" Gate 3 pin still holds); `G2_CONTRACT_VERSION`, `G2_LINEAGE` untouched. | W-08 |
| `frontend/server/user-portfolio-transport.ts` | GET read-route port (formerly L456) constructed with `protocolVersion: IPC_PROTOCOL_VERSION_V2`. Personal write-route port (L310) **unchanged** (v1). | W-06 |
| `frontend/server/investment/sources.ts` | `createHoldingsProvider` and `createPortfolioHoldingsProvider` ports constructed with `protocolVersion: IPC_PROTOCOL_VERSION_V2`. `portFactory` seam unchanged. | W-06 |
| `frontend/server/user-portfolio/ipcV2ReadChannel.test.ts` (new, 30 tests) | §8.1 + §8.3 unit matrix. | tests |
| `frontend/server/user-portfolio/ipcV2ReadChannelIntegration.test.ts` (new, 12 tests) | §8.2 over real framing, serving the `d22f156` captured real-IPD bodies as expected values; Stage 5 construction sites; write route control. | tests |
| `frontend/server/user-portfolio/ipcContractAlignment.test.ts` | +1 test pinning `IPC_PROTOCOL_VERSION_V2 === 2` and the closed v2 read set; the existing `IPC_PROTOCOL_VERSION === 1` pin untouched. | tests |
| `frontend/server/user-portfolio/ipcClient.test.ts` | One case in "refuses … a wrong version": `{v: 2, op: 'portfolio.list'}` (now a valid v2 frame) replaced by `{v: 3}` and `{v: '1'}`. | test edit (§4.3) |
| `frontend/server/user-portfolio/userPortfolioDirectP1Integration.test.ts` | Synthetic peer now answers on the request's version (as IPD does) instead of always `v: 1`; new assertion that the three GET read-route frames are `v = 2`. | test edit (§4.3) |
| `docs/integration/IID-STAGE-5-IRR-IPC-V2-ADOPTION-PROPOSAL-2026-11-21.md` | Disposition section added. | docs |
| `docs/integration/artifacts/iid-s5-real-ipd-v2-consumer-probe-2026-11-21.mts`, `…v2-captured-frames-2026-11-21.json` | §9 harness driver and its captured output (sha256 `3c1aed7f…`, `57da758c…`). | evidence |

**Not changed:** IPD; any database schema; ownership relationships; the IPC wire contract (IRR now *speaks* the already-published D03 v2 grammar; nothing was added to it); mutation permissions (v2 writes are refused by IRR before encoding and by IPD before the store — both already true for IPD, now also true for IRR); the dependency pin; `brokerImportV1SaveAdapter.ts`; `ownerBoundPortfolioCapture.ts`; the browser `src/` code (the additive field passes through the existing spread in `src/api/userPortfolios.ts` unrendered).

## 4. R-1 as implemented (exact semantics)

### 4.1 Representation
- Field: `G2PortfolioView.contributionLedger` — **present only on views produced by a v2 port**; absent on every v1 view. Read-only: it is a fresh array of fresh objects (no aliasing of the upstream payload), typed `readonly`, never transmitted (no write path reads it; `toWireHolding` is unaffected because the field is on the view, not on holdings).
- `contributions` on a v2 view is `[]`. The G24 batch-summary shape (`G2Contribution` requires non-null `fileName`/`sourceBroker` and a per-batch `holdingsCount`/`totalMarketValue`) has no honest mapping from ledger rows (proposal §6; IPD `dispatch.ts` L158–162 reaches the same conclusion). The rows are therefore **not** dropped — they are carried in full on `contributionLedger` — and nothing is coerced or defaulted into `contributions`.

### 4.2 Validation (`toG2ContributionLedger`, mirror of IPD `contributionsValidated` @4716d0bc L1119–1154)
Per row, in order; any failure refuses the **whole view** with `G2Error('UPSTREAM_UNAVAILABLE')` naming the row index and field, never echoing the value:
1. row is a non-array object;
2. closed key set: `contributionId, amount, contributedAt, createdAt, fileName, sourceBroker, contentDigest, lineageDigest, importedAt, semantics` (required) + `importId, snapshotState, unresolvedCount` (optional, 007) — any other key refuses;
3. `contributionId` matches `/^[a-f0-9]{64}$/`;
4. `amount` is a finite number, `≥ 0`, `≤ Number.MAX_SAFE_INTEGER`;
5. `contributedAt`, `createdAt` are non-blank, `Date.parse`-able strings;
6. `fileName`, `sourceBroker`: `null` or non-blank string (blank refuses; `undefined` refuses);
7. `contentDigest`, `lineageDigest`: `null` or 64-hex;
8. `importedAt`: `null` or parseable instant;
9. `semantics`: `null` or one of `SAVED_NEW_BATCH | MERGED_INTO_EXISTING | RESET | REPLACE`;
10. `importId`, `snapshotState` (if present): `null` or non-blank string; `unresolvedCount` (if present): `null` or non-negative integer.
IPD does not validate the three 007 fields in `contributionsValidated`; IRR validates their **type** only (no closed vocabulary for `snapshotState`), so IRR is never stricter than IPD on legitimate stored data while still refusing a wrong type. `null` is preserved as `null` throughout. An empty upstream list yields `contributionLedger: []`.

### 4.3 Test edits outside §8 (necessary consequences of the approved change)
- `ipcClient.test.ts` "refuses … a wrong version": the case `{v: 2, op: 'portfolio.list'}` asserted that IRR refuses to *send* v2 — the exact behaviour the PA/PO decision changes. Replaced with `{v: 3}` and `{v: '1'}`; the refusal kind and all other cases are unchanged.
- `userPortfolioDirectP1Integration.test.ts`: the synthetic peer hard-coded `v: 1` on every answer; with the GET route on v2 that is the "v1 answer to a v2 request" fault the design refuses on purpose. The peer now answers on the request's version (IPD's real behaviour, `successFrame(op, result, requestId, 2)`), and the test additionally asserts `[2, 2, 2]` for the three read frames. The v1 pin test in that file and the three-frame key/forbidden-term assertions are unchanged.
- No existing test was weakened or deleted.

## 5. Test evidence

### 5.1 Targeted (proposal §8)
| Suite | Scope | Result |
| --- | --- | --- |
| `ipcV2ReadChannel.test.ts` | §8.1 constants, v2 encode grammar (read set, list-no-payload, get/revisions exact payload, authority scan first, versions ∉{1,2} refused), v1 frame byte-for-byte, parse version equality both directions + default, OC-6 under v2, v2 port write refusal (0 transport calls, also before precondition), seam threading, **§8.3**: captured row verbatim, import row + pre-007 row, empty ledger, v1/v2 view identity apart from the additive field, 26-case malformed matrix (each refuses with row index, nothing dropped), no value echo, fresh arrays; v1 path: non-empty refuses (incl. rows valid under v2), no `contributionLedger` on v1, 11-key v1 view, v1 save-receipt embedded view still refuses | **30/30** |
| `ipcV2ReadChannelIntegration.test.ts` | §8.2 over real `ipcClient` framing on the real local endpoint class: captured v2 list/detail/revisions mapped, ledger = captured contribution, `D02_ONLY`/`FOREIGN` → `NOT_FOUND`, both IPD env captures map identically, v2 writes send zero frames, v1-answer-to-v2 and v2-answer-to-v1 refused, Class P → `UPSTREAM_UNAVAILABLE`; Stage 5 sites: GET list/detail/revisions 200 with ledger and `[list,get,revisions,get]` all `v=2`, 404 for foreign; PUT personal-use OFF → 503 `operation-not-admitted` zero frames; PUT personal-use ON → one `portfolio.save` frame with `v = 1`; `createHoldingsProvider` + `createPortfolioHoldingsProvider` → observations over `v=2`; empty portfolio → `[]` holdings, `[]` ledger, `[]` observations | **12/12** |
| `ipcContractAlignment.test.ts` | +1 pin; existing 13 unchanged | **14/14** |
| `ipcClient.test.ts`, `ipcPortAdapter.test.ts`, `ipcPortAdapterIntegration.test.ts` (7-missing + 3-rename matrix), `userPortfolioDirectP1Integration.test.ts`, `user-portfolio-transport.test.ts`, `phase1D114WireToResolverInput.test.ts`, `ownerBoundPortfolioCapture*.test.ts`, `fenceUnchanged.test.ts` | existing v1 / authorization / owner-isolation / mutation suites | all pass (see 5.2) |

### 5.2 Full IRR suite (`npm test`, which materializes `.cache/broker-import` first)
`Test Files 223 passed | 1 skipped (224)`, `Tests 3295 passed | 1 skipped (3296)`. Before the change the same subset run (`server/user-portfolio`, transport, `investment`) was 801/801; after, 843/843 plus the full suite above. `tsc --noEmit -p tsconfig.json` → 0 errors (the other tsconfigs carry pre-existing, unrelated errors identical before and after). `node .ci/verify-ipd-pins.mjs` → verified.

The two JSON files under `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/` that the full suite regenerates (timestamps/ports only) were reverted and are not part of this change.

### 5.3 Real IPD dispatcher + store (proposal §9) — test-level evidence, not live-runtime
Driver: `docs/integration/artifacts/iid-s5-real-ipd-v2-consumer-probe-2026-11-21.mts` (run with `tsx --test` from a harness whose `/tmp/ipd/dist` is IPD `4716d0bc`; SQLite fixture migrated with IPD's own `GATE3_MIGRATIONS`, binding `c5808aba…`/membership `d25dcc53…` for `ramki-personal-local`, S1 `SHARED`@price 11, D02 `SHARED`@22 + `D02_ONLY`, `FOREIGN`). Output: `…v2-captured-frames-2026-11-21.json`.

| § | Item | Governed env `{}` | `IIPS_LOCAL_PERSONAL_USE=1` |
| --- | --- | --- | --- |
| 9.1 / 9.7 | IRR `callIpc(protocolVersion: 2)` list/get/revisions: `SUCCESS`, `frame.v === 2`, 0/29 disclosed keys, body deep-equal to the `d22f156` capture modulo instants | ✔ | ✔ |
| 9.1 / 9.2 | v2 port: list (`SHARED`, rev 1, 1 holding), revisions (INITIAL), **detail OK** with `contributionLedger.length === 1` deep-equal to `store.contributionsValidated(S1,'SHARED')`, `contributions: []`, holding price 11 (S1 storage) | ✔ (**was DR-4r 503 before R-1**) | ✔ |
| 9.3 | `D02_ONLY`, `FOREIGN` → `NOT_FOUND` → HTTP 404 | ✔ | ✔ |
| 9.4 | binding with a non-approved principal label: v2 → Class P zero bytes → `UPSTREAM_UNAVAILABLE`; v1 still resolves generically (control) | ✔ | — |
| 9.5 | v2 port write methods: 4 refusals, **0 connections** reach the dispatcher, store still revision 1 | ✔ | ✔ |
| 9 | Stage 5 HTTP GET list/detail/revisions 200 (detail `contributions=[]`, ledger 1); PUT personal-use OFF → 503, 0 connections; `createHoldingsProvider` 1 observation, `createPortfolioHoldingsProvider('SHARED')` 1 | ✔ | ✔ |
| 9.6 | **control**: v1 port detail unchanged — governed → `UPSTREAM_UNAVAILABLE` (DR-4r), personal → OK with `contributions: []` and no ledger | ✔ | ✔ |

**13/13.** The original `d22f156` probe (`…consumer-probe-2026-11-21.mts`) was re-run unchanged as a second control: **6/6**; its HTTP "GET detail" row now reads 200 in both env modes (previously 503 in governed mode), which is the expected effect of the GET route moving to v2 + R-1.

## 6. Verification checklist (from the authorization)

| Required | Result | Evidence |
| --- | --- | --- |
| Existing v1 behaviour unchanged | ✔ | default frame byte-identical (`ipcV2ReadChannel` "byte-for-byte"); v1 suites unchanged; §9.6 control; PUT with personal-use ON sends `v=1 portfolio.save` |
| DR-4r rejection effective outside the v2 path | ✔ | v1 port refuses non-empty rows incl. rows valid under v2; v1 save-receipt embedded view refuses; §9.6 governed → 503 |
| Valid v2 contribution data represented correctly | ✔ | captured row verbatim; import row; pre-007 row; real store row deep-equal |
| Invalid / malformed / inconsistent data fails closed | ✔ | 26-case matrix, each refusing the whole view; row index named, value not echoed |
| List, detail, revisions behave correctly | ✔ | §8.2 and §9 in both env modes; 404 for foreign; empty portfolio → empty |
| Authorization, owner-isolation, mutation tests remain valid | ✔ | full suite 3295/3295; precondition fail-closed before I/O under v2; scope never transmitted (unchanged code path); v2 writes never reach a socket (unit, framing, real dispatcher) |
| Real IPD dispatcher/store consumes v2 responses | ✔ (test-level) | §5.3, 13/13 + 6/6 control |

## 7. Remote verification and merge receipt (appended 2026-11-21 after merge)

| Item | Value |
| --- | --- |
| Implementation commit | `462e3469fc4ddb3f67cfe4bc6b3b3da2fe1661fa` on `arena/6373b685-iips-review-recovered` (parent `3719820`); 14 files; 9 key blobs verified by contents API at publication |
| PR | **#606** `arena/6373b685-iips-review-recovered` → `main`, opened 2026-11-21; `MERGEABLE` / `CLEAN`; no branch protection on `main` (no required reviews) |
| PR checks on head `462e346` | `Typecheck · Test · Build` **pass** (run 44929443650, job 136942553412 — install, `verify-ipd-pins`, typecheck, replay-server closure, full Vitest suite, non-zero-pass assertion, production build all green); `Windows runner · SQLite lifecycle · local IPC · child-process restart` **pass** (run 44929443684, job 136943741558). First attempt had failed at the pre-install step "Verify the scoped token can read the private IPD repository" because the IPD repository was briefly public on 2026-11-21; it was private again at the re-run, and no workflow was changed by this work. |
| `main` before merge | `4c421b8bbfc26e6fe7f78f5379c48afa034b3e4a` (PR #605, Dhan market-data files; no overlap with the 14 files; `6254399` is its ancestor) |
| Merge | **`a6df94ff18641789f67de662c6fc72d224479869`**, method `merge`, 2026-11-21T18:42:14Z; parents `4c421b8` + `462e346`; `462e346` and `4c421b8` both ancestors of `main` |
| Post-merge verification | all **14/14** implementation blobs on `main` equal the `462e346` blobs (GitHub contents API `?ref=main`); `compare 4c421b8...a6df94f` lists exactly the 18 branch paths (14 + the 4 earlier Stage 5 evidence files from `979c1c6`/`d22f156`/`3719820`) — nothing unrelated entered |
| Pin on `main` | `iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be` in `frontend/package.json` L32, lockfile (`resolved` present), `.ci/verify-ipd-pins.mjs` L16; sibling pins `12a3d625…`, `2e11fa3b…` unchanged |
| Post-merge `main` workflows on `a6df94f` | `CI` run 44936965816 **success**; `Windows test compatibility (focused)` run 44936965692 **success** |
| Documentation receipt | roadmap `IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` §C.4; tracker `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.308; proposal disposition updated; this section |

## 8. Risks / notes carried forward
- A-1/A-2 (proposal §11) stand: a v2 success frame with an extra envelope key, or an IPD build without `validateV2Envelope`, fails closed to 503.
- The browser UI does not render `contributionLedger`; it passes through `src/api/userPortfolios.ts` untouched. Rendering is a separate, unrequested change.
- `ownerBoundPortfolioCapture.ts` (W11 operator capture) remains v1 by design (proposal §5.7); under governed IPD env its detail capture continues to record the DR-4r refusal.

## 9. Remaining prerequisites before a controlled Windows host verification (not started, not claimed)
1. ~~Merge of this branch to IRR `main` under IRR's own process (no PR opened here).~~ **DONE** — PR #606, merge `a6df94ff18641789f67de662c6fc72d224479869` (§7); receipt PR #607, merge `9d7b4a49ff3f843244c5a3cea1b8e758aecbbdb0`.
2. IPD service build on the host matched to `4716d0bc` (`dist/` hashes in §1) by an operator.
3. Host binding state: the five S1 components (`principalLabel`, `bindingId`, `membershipId`, `tenantId`, `canonicalOwnerId`) present and unrevoked — operator-owned; IRR cannot observe which component is missing and does not try to.
4. `IIPS_G3_IPC_BINDING_PROVISIONED` and `IIPS_G2_IPC_ENDPOINT` set in the IRR server environment; `IIPS_LOCAL_PERSONAL_USE` **not** required for reads on either side.
5. A written host-run scope: GET list/detail/revisions and holdings identity only; no write route exercised.
6. Windows named-pipe endpoint class exercised on the host (the test peers here used the POSIX endpoint class of this sandbox; the client code path is the same `callIpc`).

Items 2–6 are carried, unchanged, into the operator handoff `IID-STAGE-5-D5-D6-WINDOWS-EXECUTION-HANDOFF-2026-11-21.md` (§2 build identities, §3 D5, §4 D6, §5 persisted holdings and independent read-back, §8 outcome meanings). Nothing in them is IRR code.

**Status 2026-11-22** (`IID-STAGE-5-D5-D6-WINDOWS-EXECUTION-EVIDENCE-2026-11-22.md`, operator-reported): item 2 — checkout `cbb116d2` (descendant of `4716d0bc`, same IPC/persistence sources) recorded; compiled-module hashes recorded 2026-11-22 second pass (record §11.1: all three equal the §1 prefixes and a full-hash rebuild of `cbb116d2`) — **done** for the checkout; the running process's resident code is not attested (standing limitation); item 3 — IPD verifier `VERIFIED` (DP-V5/V6/V8) — **done**; item 4 — both variables already set by the startup script, `IIPS_LOCAL_PERSONAL_USE` not set for the transport — **done**; item 5 — read-only scope observed, no write route — **done**; item 6 — Windows named-pipe endpoint exercised: all in-scope routes 200 over v2, W11 second-process capture exit 0 — **done**. Not Stage 5 acceptance.
