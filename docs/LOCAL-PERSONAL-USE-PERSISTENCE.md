# Local personal-use persistence — explicitly authorized local single-user path

**Status:** implemented (this repository, 2026-11-08). Authority: the Program
Authority's authorization of 2026-11-08 to complete IIPS personal portfolio
persistence — this repository's owning change. Valid **only** for the local
single-user, non-production personal application. It is not production, hosted,
multitenant or shared-use authority, and it confers none.

## 1. What the switch admits

`IIPS_LOCAL_PERSONAL_USE=1` is read **server-side only** (the IRR Node server's
process environment via `handleUserPortfolioRequest(..., { env })`, never a
request header, cookie or body). When it is absent or not exactly `1`, every
write route refuses byte-for-byte as before: `503 {"error":"operation-not-admitted"}`,
no port is constructed, no body is read. Pinned tests assert this and pass
unchanged.

When set, the existing `/api/user-portfolios*` transport additionally admits:

| Route | Method | Body | Result |
|---|---|---|---|
| `/api/user-portfolios` | POST | `{ portfolioName?, holdings: [1..200] }` | `201 { portfolio }` |
| `/api/user-portfolios/:portfolioId/holdings` | PUT | `{ holdings: [1..200], expectedRevision (required, integer ≥ 0), options?: { mode?: 'MERGE'\|'REPLACE' } }` | `200 G2SaveResult` |
| `/api/user-portfolios/:portfolioId` | DELETE | `{ expectedRevision (required) }` | `200 { portfolioId, deletedAt }` |

Reset remains refused in every mode. Context discovery remains refused in
every mode. Reads are unchanged.

**Composition:** the personal route composes the same `IpcUserPortfolioPort`
and the same same-host IPC endpoint as the read path. IPD resolves the owner
from its own `ACTIVE` binding per request; IRR sends an empty scope and no
identity claim ever crosses the IPC boundary. One HTTP request equals one IPC
operation equals one IMMEDIATE SQLite transaction; IRR never does a
read-modify-write of its own.

**Required preconditions** (both, fail closed otherwise):
`IIPS_G3_IPC_BINDING_PROVISIONED=true` (binding precondition, as on the read
path) **and** `IIPS_LOCAL_PERSONAL_USE=1`. Missing either → the corresponding
`503` with no port construction and no body read.

**Wire contract:** holdings carry broker-observed fields only (`symbol`,
`quantity`, `averageBuyPrice`, `currentPrice`, `active`) plus optional
`isin`/`exchange` pass-through; `companyId`, `identityStatus`,
`resolutionDisposition`, `lineageDigest`, `weightPercentage`, `marketValue`,
`sourceBroker` are stripped/never sent (canonical identity is IPD-owned).
`expectedRevision` is mandatory on save/delete — a stale value maps to
`409 {"error":"revision-conflict"}`. Responses carry exactly the IPD-owned
values; nothing is recomputed client-side.

**Non-goals (unchanged):** no production/hosted/multi-user use; no broker
whole-import re-admission (the Dhan 2026-11-06 refusal stands); no change to
the certified read-only `/user-portfolios` views; no change to the platform
`/portfolio` workspace; no reset operation; no 2F/identity bypass of any kind.

## 2. The personal UI

Route `/personal-portfolio` (`src/features/personal-portfolio/PersonalPortfolio.tsx`),
nav label **Personal Portfolio**. Deliberately separate from the certified
read-only user-portfolio surfaces. Behavior:

- On open it re-reads the durable portfolio from IPD (no client cache of
  record); **Reload** discards local edits and re-reads.
- **Save** sends `mode: 'REPLACE'` with the complete holdings set — a removal
  in the editor must remove the holding upstream. The response (revision,
  totals, weight sum, digest) is displayed verbatim.
- On **409** the page stops and requires an explicit Reload (never a silent
  merge). On **503** it says the local persistence service is unavailable and
  lists the required settings.
- **Delete** tombstones after a native confirm; the portfolio is then
  indistinguishable from foreign (404).
- Client-side checks are UX only and mirror the IPD-side rules (positive
  quantity, non-negative finite prices, no duplicate symbols); IPD re-validates
  authoritatively and rolls back on any violation.

## 3. Cross-repository verification (Linux, 2026-11-08)

Against a scratch IPD service (`IIPS_LOCAL_PERSONAL_USE=1`) seeded with a local
binding, over a real unix socket, with this repository's transport composed as
the HTTP layer:

1. `GET /api/user-portfolios/DEFAULT_PORTFOLIO` before creation → `404`.
2. `POST` create with 2 holdings → `201`, revision 1, weights 58.33/41.67
   (server-computed, exact 100 sum), `companyId: MANUAL:<SYMBOL>`.
3. `GET` → the same view.
4. `PUT` with `expectedRevision=1`, REPLACE, 1 holding qty 20 → `200`,
   revision 2, `isSaved: true`.
5. Identical `PUT` again with `expectedRevision=2` →
   `ALREADY_IMPORTED_NO_OP`, revision unchanged (BI-08).
6. `PUT` with stale `expectedRevision=1` → `409`.
7. Revisions endpoint → INITIAL + REPLACE, correct counts and digests.
8. **Full IPD process stop → restart over the same SQLite file → `GET` →**
   revision 2 intact (this is the Linux analog of "close and reopen the app").
9. Harness without the switch → `POST` → `503 operation-not-admitted`; `GET` → 200.
10. `DELETE` with wrong guard → `409`; with correct guard → `200 {deletedAt}`.
11. `GET` after delete → `404` (indistinguishable from foreign).

Unit/integration gates: `npx vitest run` full suite — **1887 passed, 1 skipped,
0 failed**; `npm run build` clean. The pre-existing pinned integration case
"ok:true save result with the 7-field gap" was updated minimally to the
authorized save-receipt vocabulary (the integrity control — fail closed rather
than fabricate — is preserved and still asserted).

**Windows-only items (not verifiable on this Linux agent):** named-pipe
transport and the flush-guard settlement policy; the real Windows startup
sequence of both services; the browser talking to the real Windows IPD named
pipe end-to-end. See the evidence note for the exact Windows verification
checklist.
