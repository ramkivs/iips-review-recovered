# Local personal-use persistence — explicitly authorized local single-user path

**Status:** implemented and restored on IRR `main` (2026-11-09). Authority: the Program
Authority's authorization of 2026-11-08 to complete IIPS personal portfolio
persistence — this repository's owning change. Valid **only** for the local
single-user, non-production personal application. It is not production, hosted,
multitenant or shared-use authority, and it confers none.

**Restoration note (2026-11-09).** The Personal Portfolio surface was implemented on
branch `arena/d34cd4d1-iips-review-recovered` at commit `cb8e63e` and was absent from
`main`. This document, the transport, the adapter, the API client, the editor
component, the route and the navigation entry are restored from that baseline.
The one substantive implementation change made during the restoration is recorded in
§4 (the IPC contract alignment) and in §5 (the server-owned environment threading).

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

## 3. The canonical IPC contract (audit item: "IPC contract mismatch")

### 3.1 What the audit reported

> "IPD v2 reportedly requires `expectedRevision >= 1` and supports `MERGE`.
> IRR v1 reportedly accepts `expectedRevision >= 0` and advertises `REPLACE`."

### 3.2 What the authoritative source actually contains

Both halves of that report are factually correct, but they describe **two
different wire channels**, not one contract disagreeing with itself. IPD serves
both versions over the same socket:

| | IPD **v1** (`v: 1`) | IPD **v2** (`v: 2`) |
|---|---|---|
| `expectedRevision` | **≥ 0** — `src/persistence/manualPersonalPortfolio.ts` `requireExpectedRevision`: `value < 0` refuses | **≥ 1** — `src/ipc/protocol.ts` v2 framing and `src/persistence/portfolio_store.ts` `validateSnapshotFraming` |
| Save mode | **`MERGE` or `REPLACE`** — `src/ipc/dispatch.ts`: `options.mode === 'REPLACE' \|\| payload.operation === 'REPLACE' ? 'REPLACE' : 'MERGE'` | MERGE-only (complete-snapshot) |
| `portfolio.reset` / `portfolio.delete` | **present and dispatched** (`src/ipc/protocol.ts` `IPC_WRITE_OPERATIONS`) | **absent** — `IPC_V2_OPERATIONS` deliberately omits both |
| Are writes reachable? | **Yes**, under the authorized local personal-use path | **No** — `src/ipc/dispatch.ts` refuses every v2 write with `WRITE_NOT_AUTHORIZED` before any store mutation |

The v2 snapshot path is exercised only by isolated synthetic fixtures; it is
disconnected from the product dispatcher.

### 3.3 The resolution

IRR speaks **v1**. `frontend/server/user-portfolio/ipcClient.ts` fixes
`IPC_PROTOCOL_VERSION = 1`, and `encodeRequestFrame` refuses any other
version. The canonical contract for the personal-use write path is therefore
the **v1** contract, and the baseline implementation was already correct on the
wire:

- `expectedRevision ≥ 0` is the v1 rule and IRR enforces exactly it
  (`isValidExpectedRevision` and the transport's `requiredExpectedRevision`).
  Nothing was loosened to make a test pass: a missing guard is still `400`,
  and a negative/fractional/non-numeric guard is still `400`.
- `REPLACE` is a genuine v1 mode, not a label: IPD v1 resolves the mode from
  `options.mode` and `store.save` then writes a `REPLACE` revision row and
  starts a new contribution set. `MERGE` is equally admitted. IRR forwards the
  mode unchanged and refuses any mode outside the closed pair.
- `portfolio.reset` and `portfolio.delete` exist only in v1, which is why the
  v1 channel is the only one that can serve this path at all.

No label was renamed, no validation was loosened, and no IPD authorization
boundary was touched. `frontend/server/user-portfolio/ipcContractAlignment.test.ts`
pins this alignment (13 assertions) so a future change on either side that
breaks it fails in CI rather than at runtime.

### 3.4 Canonical contract summary

| Aspect | Canonical IPD v1 behaviour | IRR consumer |
|---|---|---|
| Request envelope | `{ v: 1, op, payload?, requestId? }` | `ipcClient.ts`, `IPC_PROTOCOL_VERSION = 1` |
| Write operations | `portfolio.create`, `portfolio.save`, `portfolio.reset`, `portfolio.delete` | all four mapped; only create/save/delete are exposed over HTTP (reset stays refused) |
| Revision guard | non-negative integer, required on save/delete | required; `400` when absent or malformed |
| Stale guard | `REVISION_CONFLICT` → `409` | mapped from the adapter's `G2Error('REVISION_CONFLICT')` |
| Duplicate/no-op save | `200`, **current** revision unchanged, `isDuplicate: true`, `ALREADY_IMPORTED_NO_OP` | surfaced as a success; the revision is not locally incremented |
| Save mode | `MERGE` (default) or `REPLACE` | forwarded unchanged; anything else is `400` |
| Save receipt | `{ disposition, revision, isDuplicate, holdingsSavedCount, totalMarketValue, weightSumPercentage, savedAt, provenanceDigest, portfolio }` | mapped onto the frozen `G2SaveResult`; a missing field refuses rather than fabricates |
| Dispositions | `SAVED_NEW_BATCH` \| `MERGED_INTO_EXISTING` \| `ALREADY_IMPORTED_NO_OP` | frozen `G2_DISPOSITIONS` (+ the `REJECTED` domain-refusal marker) |
| Revision operations | `INITIAL` \| `MERGE` \| `REPLACE` \| `RESET` \| `DELETE` | frozen `G2_OPERATIONS` |
| Delete | tombstones the row; the receipt carries the recorded `deletedAt` | `200 { portfolioId, deletedAt }` |
| Read after delete | `RESOURCE_UNAVAILABLE` (missing ≡ foreign ≡ tombstoned) | `404`, indistinguishable |
| Identity | IPD derives `companyId`, `identityStatus`, `resolutionDisposition`, digests, weights | IRR strips them; a caller assertion would be refused Class P |
| Write authorization | W-1 default deny; admitted only under `IIPS_LOCAL_PERSONAL_USE=1` **with** a validated binding | the switch is server-owned; default-deny preserved |

## 4. The one implementation change made during the restoration

`IpcUserPortfolioPort` now accepts an `env` option, and the IRR transport
passes its own server-owned environment into it. Previously the adapter
resolved the IPC endpoint from `process.env` while the transport resolved the
binding precondition from the injected `env`; in production these are the same
object, but the two could in principle disagree — the endpoint and the
precondition would then come from different sources. Threading the environment
makes the server-owned environment authoritative for the whole call chain.
The default remains `process.env`, which is the production posture.

No other behavioural change was made to the restored implementation.

## 5. Cross-repository verification (Linux, 2026-11-09)

Against the **authoritative IPD `main`** (`ramkivs/iips-production-market-data`
@ `ae393aa`, merge of PR #144), compiled from source, with a scratch SQLite store
and a seeded local binding, over a real unix socket, with this repository's
transport composed as the HTTP layer:

1. `GET /api/user-portfolios/DEFAULT_PORTFOLIO` before creation → `404`.
2. `POST` create with 2 holdings → `201`, revision 1, weights 58.33/41.67
   (server-computed, exact 100 sum), `companyId: MANUAL:<SYMBOL>`.
3. `GET` → the same view; `GET /api/user-portfolios` → the durable summary.
4. `PUT` with `expectedRevision=1`, REPLACE, 1 holding qty 20 → `200`,
   revision 2.
5. Identical `PUT` again with `expectedRevision=2` →
   `ALREADY_IMPORTED_NO_OP`, revision unchanged (BI-08).
6. `PUT` with stale `expectedRevision=1` → `409`.
7. Invalid payload → `400` with **no** partial state (revision unchanged).
8. Revisions endpoint → `INITIAL` then `REPLACE`, correct counts and digests.
9. **Full IPD process stop → restart over the same SQLite file → `GET` →**
   the portfolio, its holdings and its revision are intact, and a write on the
   restarted process succeeds and increments the revision.
10. `DELETE` with wrong guard → `409`; with correct guard → `200 {deletedAt}`;
    `GET` after delete → `404` (indistinguishable from foreign); a tombstoned
    id is not reusable.
11. The audit chain verifies after the whole sequence.
12. Without the switch → `POST` → `503 operation-not-admitted`; with the switch
    off **upstream**, IPD's own W-1 refusal is what stops the write.

The runnable harness and its verbatim output are in
`evidence/integration/personal-portfolio-restoration-2026-11-09/`.

**Windows-only items (not verifiable on this Linux agent):** named-pipe
transport and the flush-guard settlement policy; the real Windows startup
sequence of both services; the browser talking to the real Windows IPD named
pipe end-to-end.
