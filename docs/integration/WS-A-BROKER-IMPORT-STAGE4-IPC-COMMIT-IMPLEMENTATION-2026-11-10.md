# IRR Broker Import — the governed Stage 4 IPC commit path is now wired and exercised

**Date:** 2026-11-10. **Type:** implementation and verification receipt (IRR repository only).
**IRR branch:** `arena/c2eff88f-iips-review-recovered`, based on `main` `a8d4489e7976f2da6f6e314697a8dd99b3cea1e0`.
**IPD pin advanced to:** `1aee57fe093b4fb15eaf3a9ac67532ee40262fe2` (IPD `main`, merge of IPD PR #148).
**Supersedes, for the commit path only:** the §6 blocker recorded in
`BROKER-IMPORT-IMPLEMENTED-BEHAVIOUR-AND-LIMITATIONS-2026-11-10.md`, which remains the accurate
record of every other behaviour it describes.

---

## 1. What changed, and what did not

IPD PR #148 closed the cross-repository blocker named in §6 of the limitations record: the governed
broker-import consumer is now **dispatched as a real IPC operation**, `portfolio.importBroker`
(contract v1), instead of existing only as an in-process function. IRR therefore no longer has to
route broker-observed holdings through the manual `portfolio.save` path that stamped every row
`identityStatus: 'UNRESOLVED'` with a synthetic `MANUAL:<SYMBOL>` company id.

| Area | Before | After |
|---|---|---|
| IPD pin in IRR | `d5e20c15059267a3f824b015e37d652084de5a01` (PR #146) | `1aee57fe093b4fb15eaf3a9ac67532ee40262fe2` (PR #148), both aliases, `--save-exact` |
| Durable commit operation | none reachable; the legacy DTO was fail-closed | one `portfolio.importBroker` call per commit, validated before the socket opens |
| Provenance on the wire | `fileName` / `importedAt` were preview-only (documented C-1/U2 limitation) | `contentDigest`, `fileName`, `sourceBroker`, `importedAt` and per-row `lineageDigest` are transmitted |
| Legacy `portfolio.save` DTO | the only shape the route accepted | still **fail-closed** at the identity-qualification gate; it is never silently upgraded to Stage 4 |
| Commit surface | IPD `BrokerImportModal` + legacy adapter only | the normal `/user-portfolios/import` route previews, retains evidence and commits through Stage 4; the legacy modal stays available for review, default-closed |

**What did not change.** IRR still does not resolve identity, does not decide authorization and does
not write holdings. Those remain IPD's independent decisions inside its own guard. IRR's client
still refuses to put any owner, tenant, principal or canonical-identity key on the wire, and it
still never retries a write.

## 2. The files that carry the change

| File | Role |
|---|---|
| `frontend/server/broker-import/brokerImportStage4.ts` | strict validation of the untrusted provenance-bearing body, interpretation of IPD's **nested** outcome, and exactly one guarded IPC call |
| `frontend/server/broker-import/brokerImportHttp.ts` | the Stage 4 branch after first-party/binding/body validation; the legacy DTO keeps its #542 fail-closed gate |
| `frontend/server/user-portfolio/ipcClient.ts` | `portfolio.importBroker` added to the closed v1 write set; authority-key scanning and zero retries preserved |
| `frontend/src/api/brokerImportStage4.ts` | browser projection of the one IPD ingress result and one POST, no automatic retry |
| `frontend/src/features/broker-holdings/BrokerImportCommit.tsx` | destination/revision picker, receipt and independent readback |
| `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx`, `src/api/{brokerHoldingsPreview,brokerEvidenceRetention}.ts` | shared ingress handoff, optional Stage 4 commit, and honest retention copy |
| `frontend/src/features/portfolio-import/{BrokerImportSurface,irrPortfolioStorePortAdapter}.tsx`/`.ts` | the normal route now previews and commits; the legacy modal defaults closed; a revision observation no longer claims to reconcile an unknown write |
| `frontend/broker-import-package-profile.json`, `broker-import-publication-manifest.json`, `tsconfig.broker-import.json`, `package.json`, `package-lock.json` | the pin advance, with the 206-file published-output guard re-derived |

## 3. Outcome handling — what the code claims, and refuses to claim

`ok:true` on the IPC envelope acknowledges **dispatch only**. Persistence, refusal and
outcome-unknown are three distinct states inside `result`, and the route maps each one:

- `result.ok === true` → `200` with IPD's own `revision`, `holdingsPersisted`, `disposition`,
  `noOp` and `storeEffect`. A duplicate (`ALREADY_IMPORTED_NO_OP`, `storeEffect:'NONE'`) is relayed
  as a no-op and is never presented as a new save; `holdingsPersisted` is the existing total, not a
  newly written count.
- `result.ok === false` → the documented refusal status with `storeEffect:'NONE'`
  (`WRITE_NOT_AUTHORIZED` 503, `REVISION_CONFLICT` 409, `RESOURCE_UNAVAILABLE` 404,
  `INVALID_REQUEST` 400, `REFUSED_UNRESOLVED_IDENTITY` / `REFUSED_STORE_GUARD` 422).
- `result.ok === 'unknown'` and any internally inconsistent body → `503 OUTCOME_UNKNOWN` with
  `retried:false`. Unknown is never success and never failure.
- A generic dispatcher `UNAVAILABLE` maps to `503 UNAVAILABLE` **without** a `storeEffect` field:
  it can be a sanitized exception, so no store-effect guarantee is invented for it.
- Class P (zero bytes) and a local pre-send refusal are indistinguishable from configuration-absent
  (`503 owner-context-unavailable`), as before.

On the browser side, an ambiguous outcome locks a further automatic commit for the current snapshot,
and a prior receipt is cleared before a new attempt so it cannot describe a later refusal. A receipt
is never offered as proof of durability: the screen retrieves the portfolio independently and says
plainly when the read does not contain every submitted symbol.

## 4. Verification

### 4.1 Automated

| Check | Result |
|---|---|
| `npm run test` (full vitest) | **183 files, 2583 tests passed**, 1 skipped, 0 failed |
| `npm run typecheck` | exit 0 (includes the 206-file published-output materialization) |
| `npm run typecheck:replay-server` | exit 0 |
| `npm run typecheck:investment-server` | exit 0 |

New tests, all failing-first behaviour rather than coverage theatre: 28 server adapter tests
(validation, nested-outcome interpretation, exact one-call payload), 15 HTTP route tests through the
real handler (relay, refusals, unknown, C9, binding precondition, legacy-gate separation), 8 browser
transport tests, 10 commit-component tests against the rendered DOM, plus evidence tests for the
first acknowledged digest, a changed digest on retry, malformed bodies, and duplicate-preservation
claims, and legacy reconciliation tests for an unchanged revision and an unreadable revision.

### 4.2 Browser-level, against a real IPD IPC server

Driven with **Chromium 153** against the real Vite dev server on `:5173` proxying the real IRR
executive transport on `:8787`, which talks to a **real IPD `startIpcServer`** over a unix socket
running IPD's own migrations, an ACTIVE local-principal binding, `IIPS_LOCAL_PERSONAL_USE=1` and a
server-owned evidence owner carrier. A transparent relay recorded every framed request/response.

| # | Verified | Observed |
|---|---|---|
| 1 | one parsed CSV produces one evidence record and one qualification | `POST …/evidence` → **201** `EVIDENCE_RETAINED`; `GET …/evidence/:importId` → **200** |
| 2 | a two-row import commits | `portfolio.importBroker` → `SAVED_NEW_BATCH`, `revision 1`, `holdingsPersisted 2`, `storeEffect REVISION_COMMITTED` |
| 3 | the same import submitted again is a no-op | `ALREADY_IMPORTED_NO_OP`, `revision 1` (**unchanged**), `storeEffect NONE`, `contributions 0` |
| 4 | readback is independent of the receipt | `GET /api/user-portfolios/ACCEPTANCE_A` → revision 1, `INFY 5`, `RELIANCE 2`, both `RESOLVED`, `sourceBroker DHAN` |
| 5 | an unauthorized write persists nothing | with the IPD authorization off: `portfolio.importBroker` → envelope `ok:false` `WRITE_NOT_AUTHORIZED`; HTTP **503**; the portfolio table stayed empty; the screen said *"Commit refused: IPD did not authorize the local personal-use write"* |
| 6 | exactly one IPC call per commit, with provenance and no identity claim | frames carry `portfolioId`, `expectedRevision`, `mode`, `contentDigest`, `fileName`, `sourceBroker`, `importedAt`, per-row `lineageDigest`; no `ownerUserId` / `tenantId` / `companyId` / `identityStatus` anywhere |
| 7 | the write is durable across process restarts | after restarting **both** the IPD service and the IRR transport: `E2E_SYNTHETIC` revision 1, `INFY 5`, `RESOLVED`, `DHAN` |
| 8 | the legacy DTO never reaches `portfolio.importBroker` | the old shape is still refused `422 REFUSED_STORE_GUARD` with zero IPC calls |

## 5. Limitations, stated plainly

1. **Acceptance used synthetic infrastructure.** The IPC peer ran IPD's real code against a
   synthetic SQLite database, a synthetic ACTIVE binding and a synthetic evidence carrier created
   for this run; no production owner data was touched, and none of it is in Git.
2. **Real operation still needs the operator's own runtime**: `IIPS_G3_IPC_BINDING_PROVISIONED=true`,
   IPD's ACTIVE binding, `IIPS_LOCAL_PERSONAL_USE=1`, and the evidence owner carrier set up per
   `docs/OPERATOR_RUNBOOK.md` §3.3.
3. **Duplicate detection is digest-based.** A re-submission is recognised by the same broker,
   content digest and read time. Re-parsing a file at a different instant is a different import and
   is not treated as a duplicate.
4. **P7 qualification is additive and is not inferred.** Where IPD reports `securityIdentity: null`
   (as it did here: `isinAuthority: 'NON_AUTHORITATIVE'`), no series and no P7 success is claimed.
5. **IRR's portfolio read projection does not include `importEvidence`.** The durable read-back shows
   holdings, revision and provenance digest; IPD's per-import evidence rows are visible on the IPC
   frame but are not part of IRR's `UserPortfolioView` mirror.
6. **The Arena-hosted preview cannot perform writes.** The pinned Vite `/api` proxy uses
   `changeOrigin: true`, so the upstream `Host` is rewritten to `127.0.0.1:8787` while the browser's
   `Origin` remains `https://5173-<sandbox>.e2b.app`. The C9 first-party guard therefore answers
   **403 `cross-site-request-refused`** for a POST from the external preview origin (measured), while
   the same POST from the loopback origin passes C9 and reaches validation. This is the guard working
   as designed; it was **not** weakened to make the hosted preview work. Browser verification was
   performed with Chromium against loopback.
7. **Unknown outcomes still require a human.** An advanced revision can belong to another write and an
   unchanged revision is consistent with a duplicate no-op, so neither is treated as proof, and
   nothing retries automatically.
