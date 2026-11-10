# Personal Portfolio 503 / User Portfolios "No data" — investigation and resolution (2026-11-09)

**Repository:** `ramkivs/iips-review-recovered` (IRR). **Baseline:** `main` @ `7bf0d353`
(PR #540 merge). **IPD:** read-only, not modified. No persistence implementation was added,
no authorization was bypassed, and no existing portfolio data was touched.

---

## 1. The finding in one paragraph

The two surfaces were not disagreeing about the data; they were reporting **the same
fail-closed state in two different vocabularies**. `/personal-portfolio` rendered
`User portfolio data unavailable (503)` and `/user-portfolios` rendered `No data / No durable
portfolios yet` — and the second sentence is **false** when nothing could be read. Both were
produced by the *same* endpoint answering the *same* `503`, because the API server had not been
started with the two server-owned settings the durable-read path requires. The TCS/INFY table is
**not persisted data and not a second data source**: it is the editor's own empty-state row model
being rendered one step before it is needed — see §4.

## 2. The exact endpoint, response and server-side cause

| Field | Value |
|---|---|
| Endpoint | `GET /api/user-portfolios/DEFAULT_PORTFOLIO` |
| Served by | `frontend/server/user-portfolio-transport.ts` → `handleUserPortfolioRequest` (composed from `server/executive-transport.ts`; `/api` proxied by Vite on `:5173` to the transport on `:8787`) |
| Status | **503** |
| Body (verbatim, before this change) | `{"error":"owner-context-unavailable","detail":{"reason":"No non-authentication ownership source has been established. No owner is inferred; no data is read or changed."}}` |

The identical body is returned for `GET /api/user-portfolios` (the list surface). Measured through
the browser's own path (`:5173`) and directly against the transport (`:8787`) — byte-identical, so
the Vite proxy is not involved.

**Server-side cause.** `ownerContextFromBinding(readBindingPrecondition(env))` yielded
`NOT_ESTABLISHED` because `IIPS_G3_IPC_BINDING_PROVISIONED` was absent, so the transport returned
`OWNER_CONTEXT_UNAVAILABLE` **before constructing a port or touching IPD**. There was no exception
and no stack trace to capture: this is a deliberate fail-closed refusal, not a crash. A second,
independent gate follows it — with the binding established but `IIPS_G2_IPC_ENDPOINT` unset, the
call fails inside the IPC adapter and the transport answers `503 {"error":"upstream-unavailable"}`.
Both are configuration states, and neither is "no portfolios".

Reproduced exactly:

```bash
npm run server:dev            # no IIPS_* set
curl -s -H 'Origin: http://localhost:8787' localhost:8787/api/user-portfolios/DEFAULT_PORTFOLIO
#   -> 503 {"error":"owner-context-unavailable", "detail":{"reason":"No non-authentication ..."}}
curl -s -H 'Origin: http://localhost:8787' localhost:8787/api/user-portfolios
#   -> 503, same body
```

## 3. Independently traced: creation, retrieval, listing

Traced over a real Unix socket against a contract-v1 peer (the repository's own framing; IPD's
provider is not installed in this sandbox — see §7), driving the **real** transport and the **real**
`IpcUserPortfolioPort`:

| Operation | Route | IPC op | Result |
|---|---|---|---|
| Create | `POST /api/user-portfolios` | `portfolio.create` | `201 {portfolio}`, revision 1 |
| Retrieve | `GET /api/user-portfolios/:id` | `portfolio.get` | `200 {portfolio}` |
| List | `GET /api/user-portfolios` | `portfolio.list` | `200 {portfolios:[…]}` |
| Save / add / update / remove | `PUT /api/user-portfolios/:id/holdings` | `portfolio.save` | `200` receipt, revision incremented |
| Delete | `DELETE /api/user-portfolios/:id` | `portfolio.delete` | `200 {portfolioId, deletedAt}` |

**All four read/write operations share one configuration path.** There is exactly one
`IIPS_G2_IPC_ENDPOINT` read, one `IpcUserPortfolioPort`, one `readBindingPrecondition(env)`, and one
data directory — IPD's, which IRR never opens. `grep` confirms no second store, no fallback and no
client-side cache of record (`ipcPortAdapter.ts` holds no state by construction). So the answer to
"is the application using the same data directory across read, create and list?" is **yes,
structurally**: they cannot diverge, because there is only one.

Because they cannot diverge, divergence in the *UI* had to come from how each surface renders a
failure. That is §5.

## 4. What TCS and INFY actually are

**Neither persisted records nor data from another source.** The evidence:

- No `TCS` or `INFY` literal exists in `PersonalPortfolio.tsx` or the server; `grep` for `INFY`
  across `src/` and `server/` finds only a test typing it.
- The editor's row model starts as **one blank row** (`blankRow()` → all fields `''`).
- The observed table is what the page renders **while `exists !== null`** — i.e. before, and
  independently of, any successful read. That is a real defect: with `exists` left `null` the
  component returns early, but with a **tracked** portfolio the prefilled rows are the durable
  view and with an absent one they are the blank create form. A table showing populated rows can
  therefore only mean the read **succeeded** at some point, or the user typed them.

Conclusion: a populated TCS/INFY table is *either* the durable view (which proves the read path
was working in that observed state) *or* unsaved local edits. It is never fabricated seed data, and
it is not served from a second source. The 2026-11-09 cross-repository run recorded the same
2-holding shape after a real `POST` — `companyId: MANUAL:<SYMBOL>`, which is IPD's manual-entry
sentinel, not a canonical identity.

## 5. Why the listing said "No data" while a table showed holdings

Two independent causes, both UI-owned:

1. **The empty state was reachable from a failure.** The list surface renders `EmptyState`
   only for a **successful** `200` with zero rows, and `UserPortfolioErrorState` for a `503` — that
   part was already correct. But `EmptyState`'s heading is the generic **`No data`**, which reads
   as "you have no portfolios" even when it is correctly the unavailable branch that the operator
   is looking at on the *other* page. The two pages then present one failure as two different facts
   (`unavailable` vs `no data`).
2. **The 503 said nothing actionable.** One opaque sentence covered three distinct causes, so an
   operator could not tell a missing setting from an unreachable IPD from an empty account — and
   the only suggested remedy on the Personal Portfolio page was "start IPD", which is not true when
   the *IRR* process is the thing that is unconfigured.

So the discrepancy was a **presentation and diagnosability defect layered on a configuration
failure**, not two data sources disagreeing. Both halves are fixed in §6.

## 6. The resolution

Within IRR authority; no new persistence implementation, no authorization change.

**a. The fail-closed response is now diagnosable.** `503` gains two additive `detail` fields beside
the unchanged `error` and `detail.reason`:

| `detail.unavailableReason` | Emitted when | Operator action |
|---|---|---|
| `binding-precondition-absent` | the gate refused: `IIPS_G3_IPC_BINDING_PROVISIONED` is absent or not affirmative | set it in the API process |
| `ipc-endpoint-not-configured` | binding established, `IIPS_G2_IPC_ENDPOINT` absent / URL / host:port | set a local socket path or pipe |
| `ipc-endpoint-unreachable` | endpoint configured, IPD did not answer | start IPD's provider |

`binding-precondition-absent` is emitted **whenever the gate refuses**, and only then: the gate *is*
the binding precondition, checked before anything else, so the endpoint is the next thing to fix and
is never reported as the cause of this refusal. The other two come from the upstream-failure path,
classified by the transport's own **pure** endpoint resolver — no I/O, no socket, so a diagnostic
cannot reach IPD.

Disclosure boundaries held: the vocabulary is closed (the client discards anything else), and no
owner, tenant, principal, credential, path, socket or stack appears. Status stays `503`;
`error` stays `owner-context-unavailable`; a binding refusal still constructs no port.

**b. Both surfaces render the three states distinctly.** Personal Portfolio names the missing
setting(s) and states that the portfolio was not changed and this is *not* an empty portfolio;
User Portfolios shows the unavailable state with the same diagnosis and never the empty state.
An absent portfolio remains the blank create form.

**c. The stack can be started correctly without a shell incantation.**
`npm run server:dev` now loads `.env.local` when present (`--env-file-if-exists`, non-fatal when
absent), so the two settings can live in a gitignored file with a commented
`<repo>/.env.example` template. This changes only *how the server is started*; it grants nothing and
touches no authorization rule.

## 7. Verification

### 7.1 What was executed, and against what

| Layer | Exercised | Notes |
|---|---|---|
| UI components (real React) | `PersonalPortfolio`, `UserPortfolioList` | rendered in jsdom, no component or client stub |
| Client (`src/api/userPortfolios.ts`) | real | |
| Transport (`user-portfolio-transport.ts`) | real, real HTTP server | |
| IPC adapter + client + framing | real, **real Unix socket** | |
| IPD's SQLite-backed provider | **stand-in contract-v1 peer** | IPD's host is not installed here |

The peer is a throwaway harness kept outside the repository. It is **not** a persistence
implementation for IRR and the application never imports it; it exists only to let the real stack be
driven end to end. The authoritative cross-repository run against real IPD is already recorded in
`evidence/integration/personal-portfolio-restoration-2026-11-09/` (§5 of
`docs/LOCAL-PERSONAL-USE-PERSISTENCE.md`, 23/23 checks, real IPD `main` @ `ae393aa`).

One contract detail the peer had to get right, and which is worth recording: an asserted refusal is
`RESOURCE_UNAVAILABLE` (not `NOT_FOUND`), and a create must return the shared **save-receipt**
envelope (`disposition` + `revision` + `portfolio`). An earlier version of the harness emitted the
HTTP status names and a bare view; the adapter correctly refused both with
`UPSTREAM_UNAVAILABLE / contract-envelope violation`, which is the fail-closed behaviour the tests
pin.

### 7.2 Results

Transport + adapter + peer, 20/20:

```
PASS  unconfigured server answers 503 owner-context-unavailable (the reported symptom)
PASS  listing also answers 503 when unconfigured — never an empty list
PASS  configured, empty store -> 200 with an EMPTY list (distinct from 503)
PASS  configured, absent portfolio -> 404 (not 503, not an empty portfolio)
PASS  create -> 201 with the durable view
PASS  created revision is 1 and both holdings are present
PASS  listing shows the created portfolio — list and detail agree
PASS  list summary count matches the detail holding count
PASS  reload returns the persisted holdings
PASS  add a row -> revision 2, three holdings saved
PASS  update TCS quantity 10 -> 12 at revision 3
PASS  stale expectedRevision -> 409, no write
PASS  after restart the portfolio and all three holdings are still there
PASS  remove RELIANCE -> revision 4 with two holdings
PASS  binding-only (no IIPS_LOCAL_PERSONAL_USE) -> write refused 503 operation-not-admitted
PASS  the same read-only config still reads
PASS  delete at the current revision succeeds
PASS  deleted portfolio reads as 404 (indistinguishable from foreign)
PASS  after delete the list is empty again — 200 [], not 503
PASS  no owner/tenant/principal/caller-identity key on any IPC request
```

Real components against the real stack, 9/9:

```
PASS  User Portfolios, empty store: renders the empty state and never "Data unavailable"
PASS  Personal Portfolio, absent portfolio: NO "Local persistence unavailable" banner
PASS  Personal Portfolio, absent portfolio: shows a create form with one blank row
PASS  Personal Portfolio, absent portfolio: starts blank (no invented TCS/INFY row)
PASS  UI create: TCS and INFY are persisted and the page shows the saved receipt
PASS  UI create: the summary renders server-owned totals and revision
PASS  UI reload: both rows come back from the durable store
PASS  User Portfolios, populated: lists the personal portfolio and is NOT empty/unavailable
PASS  User Portfolios, populated: no "No durable portfolios" empty state
```

Live application (`npm run server:dev` + `npm run dev`, unix socket, through the browser's `/api`
proxy), full lifecycle:

| Step | Result |
|---|---|
| detail before create | `404 not-found` |
| list before create | `200 {"portfolios":[]}` |
| create with TCS + INFY | `201`, revision 1, `MANUAL:TCS` / `MANUAL:INFY`, weight sum exactly 100 |
| list after create | the portfolio row appears |
| add RELIANCE | `200`, revision 2, total ₹74,500 |
| update TCS 10 → 12 | `200`, revision 3 |
| stale `expectedRevision` | `409 revision-conflict`, no write |
| remove RELIANCE | `200`, revision 4, two holdings |
| revisions history | `INITIAL` then `REPLACE` |
| create on an existing id | `409` — refused, never overwritten |
| **full restart (peer + API process)** | revision 4, `TCSx12 INFYx20`, listed |
| write after restart | `200`, revision 5 |

Gates: `tsc --noEmit` clean; `tsc -p tsconfig.replay-server.json` clean;
`tsc -p tsconfig.investment-server.json` clean; `npm run build` clean (3.1 MB bundle, unchanged
shape); **376 tests passed across 26 files** in the affected surface, including 24 in the transport
suite (5 new diagnosis tests), 14 in the client suite (5 new), 16 in the list suite (4 new) and 12
in the editor suite (4 new).

### 7.3 Declared gaps — not asserted away

- **No real IPD provider in this sandbox.** IPD is installed as a library (`dist/package`, five
  exports, no `bin`), so its SQLite-backed IPC host cannot be started here. The provider is stood in
  by a contract-v1 peer; durability was simulated by restarting the peer over the same store file.
  A restart of IRR's own process proves IRR holds no state, but it does **not** prove SQLite
  durability — that is covered by the recorded real-IPD run, not by this one.
- **No browser engine.** No Chromium/Firefox/WebKit binary is installed and the Playwright CDN is
  unreachable (`ECONNRESET`), so the flows were executed with real components in jsdom plus real
  HTTP against the running app, not by clicking in a browser. The unexecuted link is the paint.
- **Windows named-pipe transport** remains unverified on Linux, as previously recorded.

## 8. Boundaries

No new persistence implementation; no second store; no client-side cache of record. No
authorization was loosened — the binding gate, the `IIPS_LOCAL_PERSONAL_USE` write gate and IPD's
W-1 remain exactly as they were, and `[data-testid]`-level tests assert both refusals still fire.
No owner, tenant or principal is accepted from a request. No portfolio was reset, recreated or
overwritten, and no existing data was deleted. IPD was not modified.
