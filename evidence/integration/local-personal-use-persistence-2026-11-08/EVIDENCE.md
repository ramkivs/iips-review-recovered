# Local personal-use persistence — implementation evidence (2026-11-08)

Authority: Program Authority authorization of 2026-11-08 (local single-user,
non-production personal application). Cross-repository: the IPD side landed as
`arena/d34cd4d1-iips-production-market-data` commit `7a8dfd7`
(`docs/LOCAL-PERSONAL-USE-PERSISTENCE.md` there is authoritative for the wire
and store semantics).

## Changes in this repository

- `frontend/server/user-portfolio-transport.ts` — write routes admitted only under
  server-owned `IIPS_LOCAL_PERSONAL_USE=1` (binding precondition still required;
  otherwise byte-identical `503 operation-not-admitted`, no port construction,
  no body read). `expectedRevision` mandatory on PUT/DELETE. Reset and context
  remain refused in every mode. 256 KiB body cap.
- `frontend/server/user-portfolio/ipcPortAdapter.ts` — `saveHoldings` now verifies
  the v1 save receipt (`{disposition, revision, isDuplicate,
  holdingsSavedCount, totalMarketValue, weightSumPercentage, savedAt,
  provenanceDigest, portfolio}`) and maps it onto the frozen `G2SaveResult`
  (id-echo check, `toG2View` rules incl. empty-contributions and no durability
  claims). Incomplete receipts fail closed with `envelopeGapError`. Create/reset
  map the same receipt envelope; a bare v1 detail is still accepted.
- `frontend/server/user-portfolio/userPortfolioPort.ts` — `G2CreateParams` gains
  optional `holdings` (additive; the create transaction carries the first
  batch).
- `frontend/src/api/userPortfolios.ts` — typed write client (create / save /
  delete); envelope fail-closed; conflict surfaces as status 409.
- `frontend/src/features/personal-portfolio/PersonalPortfolio.tsx` (+ test) —
  the personal editor route `/personal-portfolio`; nav entry "Personal Portfolio".
- `frontend/src/api/userPortfolios.test.ts` (new), `frontend/server/
  user-portfolio-transport.test.ts` (gate-off pinned assertions unchanged and
  passing; gate-on cases added), `frontend/server/user-portfolio/
  ipcPortAdapterIntegration.test.ts` (legacy 7-field gap case updated to the
  authorized receipt vocabulary; positive receipt mapping added).
- `docs/LOCAL-PERSONAL-USE-PERSISTENCE.md` (new).

## Verified on Linux (this agent, 2026-11-08)

- `npx vitest run` — **Test Files 148 passed | 1 skipped (149); Tests 1887 passed | 1 skipped** (baseline repaired: missing git-pinned broker-import build materialized via `npm run build:broker-import`, 152 published files).
- `npm run build` — clean (tsc -b + vite build).
- `npx tsc --noEmit` — only the pre-existing brokerHoldingsPreview `.cache`
  notes outside this change set (resolved by the build step).
- Live cross-repo smoke (real unix socket, scratch DB under /tmp, seeded
  binding+membership, both services `IIPS_LOCAL_PERSONAL_USE=1`): create →
  get → save REPLACE → idempotent re-save (BI-08 no-op) → 409 stale guard →
  revisions history → **full IPD stop/restart over the same DB → portfolio
  intact at revision 2** → gate-off 503 with reads unaffected → delete with
  guard → post-delete 404. Transcript summarized in the doc §3 (step 1–11).
  Scratch processes were stopped; the scratch DB never leaves /tmp.

## Pinpoint call-outs

- `WIRE_AT_TEST` expectation in `ipcPortAdapterIntegration.test.ts` updated:
  the legacy assertion `'ok:true'` save envelope (`{disposition:'SAVED', revision:5}`)
  now yields the honest message listing `isDuplicate, disposition,
  holdingsSavedCount, totalMarketValue, weightSumPercentage, savedAt,
  provenanceDigest, portfolio`. The control — refuse rather than fabricate — is
  unchanged.
- The two `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/*.json` files are
  rewritten by the AC-X2 suite on every test run; they were restored and are
  not part of this change. NOTE for future runs: any full-suite execution dirties them.

## Windows-only verification checklist (designated host)

1. Start IPD (`dist\src\ipc\entrypoint.js`) with `IIPS_LOCAL_PERSONAL_USE=1`,
   `IIPS_G3_DATABASE_PATH`, `IIPS_G2_IPC_ENDPOINT=<name>`, `IIPS_G3_LOCAL_STATE_DIR`
   (owner-only directory). Expect `[g3] listening on named-pipe \\.\pipe\<name>`
   and a fail-closed refusal if the state directory is not owner-only.
2. Start the IRR server with the same three endpoint settings plus
   `IIPS_G3_IPC_BINDING_PROVISIONED=true` and `IIPS_LOCAL_PERSONAL_USE=1`.
3. Open the app → **Personal Portfolio** → enter 2–3 holdings → **Create
   portfolio** → expect the revision/total displayed; then edit quantity →
   **Save changes** → expect revision increment.
4. Fully close the app, reopen → holdings intact (revision unchanged).
5. Open a second copy of the app, save → first copy shows 409 on next save;
   Reload recovers.
6. Delete portfolio (confirm) → list empty; re-create works.
7. Inspect the service logs for Class-P reasons; verify no error text leaks
   into HTTP responses.
