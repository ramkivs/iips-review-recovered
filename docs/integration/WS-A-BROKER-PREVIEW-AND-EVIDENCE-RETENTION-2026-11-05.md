# WS-A — Dhan broker holdings import: preview truthfulness and durable import evidence (IRR)

**Record:** `WS-A-BROKER-PREVIEW-AND-EVIDENCE-RETENTION-2026-11-05`
**Owner repository:** `ramkivs/iips-review-recovered` (IRR)
**Baseline:** IRR `main@9e0a041` (PR #433 merged)
**Scope:** the two IRR-owned stages of the Dhan lifecycle — (a) the browser preview's identity
reporting and (b) durable retention of the import evidence. Identity resolution itself stays with
IPD; the durable holdings leg stays with IPD and its W-1 gate.

## 1. What was wrong (confirmed by measurement)

| # | Defect | Evidence |
| :-- | :--- | :--- |
| IRR-D1 | The preview handed IPD's ingress an **empty** `SecurityMaster`, so no row could ever resolve. It then displayed `Resolved rows 0 / Unresolved rows 68` as though they were lookup results: the zero was a property of the empty master, not of the broker file. | `previewBrokerHoldings` constructed `new SecurityMaster()`; the observed run showed 0/68. With the governed master supplied, the first refusal moves from row 1 (`AGI GREENPAC`) to row 2 (`ASK AUTOMOTIVE`) — proof that the master, not the file, produced the first zero. |
| IRR-D2 | Every row was labelled `UNRESOLVED` unconditionally (`identityStatus: 'UNRESOLVED'` literal), including rows the identity authority can resolve. | Same module; the observed UI. |
| IRR-D3 | The preview reported nothing about *how many rows were individually assessed*. The pinned IPD mapper refuses the whole file at the first unresolved security, so **zero** rows have an individual outcome — a fact the display concealed. | `identityAssessedRows` did not exist; `WS-A-06` in IPD proves the pinned pipeline aborts at row 1. |
| IRR-D4 | Nothing was retained. The parse result, the per-row inventory, the digest, the refusal and the non-performed validation/authorization decisions existed only in browser memory; a UI display is not durability. | No store call existed on the preview path. |

## 2. What changed

1. **IPD-owned identity authority, not an empty master.** The preview supplies
   `getGovernedBroadSecurityMaster()` (2,250 governed D05 entities) from the existing pinned IPD
   dependency. IRR still never resolves identity itself, never widens a namespace and never
   fabricates an identifier; `failOnUnmappedIdentity: true` and
   `allowNonProductionBypass: false` are unchanged.
2. **Counters that state what was measured.** `counts.nativeRows`,
   `counts.identityAssessedRows`, `counts.identityResolvedRows`, `counts.identityUnresolvedRows`,
   `counts.savedRows`. `identityAssessedRows` is 0 while the pipeline refuses the file — an honest
   zero, not a resolution result.
3. **Per-row identity basis.** Each row carries `identityBasis`:
   `PIPELINE_RESOLVED` (the pipeline returned that row as a resolved holding),
   `FILE_LEVEL_P04_REFUSAL` (the file was refused, so no individual outcome exists) or
   `NOT_EVALUATED`. A row is never labelled `RESOLVED` on IRR's own authority.
4. **Explicit non-claims.** `notPerformed.validation`, `.saveAuthorization`, `.persistence` are
   `NOT_PERFORMED` with a reason; `canSave: false`, `persisted: false`, `savedRows: 0`.
5. **Durable retention (new).** `server/broker-import/brokerImportEvidenceStore.ts` retains the
   governed equivalent of the import evidence through the already-governed PF-1 append-only
   journal: the complete native row inventory (ISIN/exchange recorded as explicitly `null`), the
   content digest, source metadata and read timestamp, per-row identity basis, the pipeline
   refusal verbatim, the non-performed validation/authorization decisions, the saved-row count and
   the import→holdings reconciliation, plus a record digest re-verified on **every** read.
   Duplicate retention of the same import is a no-op; a tampered journal fails closed
   (`EVIDENCE_TAMPERED`); a storage failure propagates (retention is never reported when the write
   failed). The raw CSV bytes are deliberately **not** retained — the product's recorded statement
   is that the CSV is processed locally and not uploaded — and that limitation is recorded inside
   every evidence record.
6. **UI copy corrected.** The page no longer states "No canonical company identity is assigned";
   it states that identity is assigned only where the IPD governed master resolves the row and that
   nothing is inferred from company-name similarity.

## 3. What this does NOT claim

* The preview still never validates, authorizes or persists. `PARSED_UNRESOLVED` and
  `PARSED_IDENTITIES_RESOLVED` both mean "parsed"; neither means validated, authorized or saved.
* Per-row refusal codes and quarantine ids are part of the evidence schema but are `null`/empty
  while the pinned pipeline publishes no per-row outcome. The IPD correction
  `WS-A-DHAN-BROKER-IDENTITY-EVIDENCE-RECORD-2026-11-05` supplies them at the source; consuming it
  requires a governed advance of the `iips-broker-import` pin (see the Workstream A report §11).
* The evidence store is reachable as a trusted-host library and proven durable across processes.
  Mounting it on an HTTP route would add a third route to a closed admitted route set and is
  therefore left to a transport authority act (recorded as a blocker, not silently implemented).

## 4. Tests (exact results)

| Command (in `frontend/`) | Result |
| :--- | :--- |
| `npm run typecheck` | PASS |
| `npx vitest run src/api/brokerHoldingsPreview.test.ts` | PASS — 18 tests (10 pre-existing cases updated + 8 WS-A 68-row cases) |
| `npx vitest run src/features/broker-holdings/BrokerHoldingsPreview.test.tsx` | PASS — 6 tests |
| `npx vitest run server/broker-import/brokerImportEvidenceStore.test.ts` | PASS — 7 tests |
| `npx vitest run server/broker-import/brokerImportEvidenceRestart.test.ts` | PASS — 1 test, separate OS processes |
| `npx vitest run server/broker-import src/api/brokerHoldingsPreview.test.ts src/features/broker-holdings` | PASS — 10 files / 107 tests |
| `npm test` (whole frontend suite) | PASS — 111 files / 1381 tests |
