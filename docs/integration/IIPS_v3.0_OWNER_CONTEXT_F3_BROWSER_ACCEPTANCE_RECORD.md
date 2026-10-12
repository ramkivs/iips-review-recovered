# IIPS v3.0 — F-3 Post-Publication Browser UI Acceptance Record

**NP-09 Watchlists · NP-10 Collaboration · NP-11 Settings**

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-OWNER-CONTEXT-F3-BROWSER-ACCEPTANCE-RECORD-01` |
| Record type | Browser-level acceptance evidence + narrowly scoped defect correction record |
| Authoritative baseline | `main` = `2f6ee7a0b5a3d917c65472739c5ecb31a9ec91b8` |
| Published implementation tree | `fe3d6bc37a49ec51e1d5eccec71f4440bc553cb4` (served, byte-identical to the tested tree) |
| Status | **COMPLETE — all three capabilities pass browser acceptance** |
| Date | 2026-10-12 |

---

## 1. Execution method actually used (stated plainly)

This is a **real browser** acceptance, not a simulation:

| Element | Actual |
|---|---|
| Browser engine | **Chromium** — `HeadlessChrome/153.0.8010.0`, `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.0 Safari/537.36` |
| Browser provenance | vendored serverless Chromium build (`@sparticuz/chromium@153.0.0`), driven by `puppeteer-core@25` through the Chrome DevTools Protocol |
| Application | the **real composed application**: `npx vite-node server/executive-transport.ts` (the exported composed server, real route table) on `:8787`, and the **real product UI** served by `vite` on `:5173` with its established `/api` proxy |
| Data context | clean: carrier at `/tmp/iips-acceptance/owner-context.json` (outside the repository), data domain `IIPS_DATA_DIR=/tmp/iips-acceptance/data` |
| Observations | taken from the browser's own DOM, CSS custom properties, console, page errors, request/response events and rendered screenshots |
| Environment note | no browser or package manager repository was reachable from this sandbox (browser CDNs, `github.com`, Debian `apt` mirrors all blocked). Chromium was obtained from the reachable npm registry, which vendors the binary in the package tarball. **No page was ever substituted with a synthetic fixture and no API response was mocked.** |

**Distinction from automated tests:** the counts in §6 are browser-executed and independent of the repository's vitest suites. The vitest suites were re-run as regression evidence only, and are reported separately in §7.

---

## 2. Corrections applied (Phase 4)

Four **user-visible documentation defects** were demonstrated in the browser, and one interface-copy inconsistency found by inspection of the same category. All are copy-only: **no behavior, endpoint, status code, value, safeguard or contract was changed.**

| # | Where | Demonstrated defect | Correction |
|---|---|---|---|
| `C-1` | `frontend/src/features/settings/Settings.tsx` | The Settings surface told the user *"No non-authentication owner source is currently established, so no settings are read or changed"* while, one line below, it rendered a server-loaded theme, source, revision count and schema version. A contradiction the user sees. | States the actual behaviour: settings are read from and written to the server-owned owner context, and the browser supplies no identity. |
| `C-2` | `frontend/src/features/settings/Settings.tsx` (header) | Module header claimed the read/write operations "remain unavailable". | Header now describes the F-3 ownership source and the fail-closed condition. |
| `C-3` | `frontend/src/features/settings/themeSync.ts` (header) | Boot-time theme module claimed the application "currently has no non-authentication owner source". | Header now describes the F-3 source and the governed-default fallback on `503`. |
| `C-4` | `frontend/src/app/navigation.ts` (comment) | Sidebar comment claimed owner-scoped operations "report unavailable". | Comment now states they are served for the established owner and report unavailable — never a fabricated owner — otherwise. |
| `C-5` | `frontend/server/settings/settings-transport.ts`, `frontend/server/collaboration/collaboration-transport.ts` | As rendered on the surfaces, the provenance text read *"The HTTP capability remains unavailable until a valid server-owned owner context is established"* immediately beneath live data — obsolete tense, visible to the user. | Re-worded to *"No owner is inferred: while a valid server-owned owner context is not established the HTTP capability is unavailable"*. **The pre-existing assertion that this string contains `unavailable` still holds**, and all related suites pass unchanged (`server/settings/settings-transport.test.ts`, `server/collaboration/collaboration-transport.test.ts`). |

Corresponding source sentences in `frontend/src/api/settings.ts` and `frontend/src/api/collaboration.ts` appear only in the fallback error paths that are shown **when the owner context is unavailable** — a state in which the wording remains true. They were left unchanged.

**No 503 safeguard, status code, route behaviour, identity value, journal format or service semantic was touched, and no fail-closed assertion was weakened.**

---

## 3. Acceptance matrix — NP-09 WATCHLISTS

Method: real Chromium → `/watchlists` via a **click on the real sidebar link** → real `/api/watchlists*` through the Vite proxy → real transport, governed universe and owner-scoped journal.

| Check | Result | Browser operation | Observed | HTTP / network | Persistence | Evidence |
|---|---|---|---|---|---|---|
| Route + navigation entry render | PASS | clicked sidebar "Watchlists" → `/watchlists` | surface and heading rendered | — | — | `shots/watchlists-01-initial.png` |
| List loads through the real HTTP path | PASS | page load | surface populated (empty state first run) | `GET /api/watchlists → 200` | — | `accept-watchlists.json` |
| Governed provenance rendered | PASS | — | `governed:certified-v2.0-reference-universe · as of 2026-08-09T00:00:00.000Z · SNAPSHOT` | provenance on the 200 | — | `shots/watchlists-01-initial.png` |
| Create watchlist | PASS | typed id + name → "Create watchlist" | article **"Browser acceptance list"** with 1 item slot | `POST /api/watchlists → 201` | journal append | `shots/watchlists-02-created.png` |
| Add governed item **with trigger** | PASS | typed `Banking`; ticked "Add trigger"; selected `composite`, `>`, entered `40`; "Add security" | row **Banking · quality good** | `POST /api/watchlists/bwa-1/items → 201` | baseline persisted | `shots/watchlists-03-item-added.png` |
| Governed-row information + baseline deltas | PASS | — | Baseline **47.1**, Current **47.1**, Change **0** — equal to the value the API reports; zero delta is correct for the frozen v1.1 baseline and is disclosed on the surface | `GET /api/watchlists/bwa-1 → 200` | — | `shots/watchlists-03-item-added.png`, `accept-watchlists.json` |
| Trigger behaviour presented correctly | PASS | — | cell renders `composite gt 40: FIRED` | trigger evaluated server-side | persisted with the item | `shots/watchlists-03-item-added.png` |
| Research link for the governed row | PASS | — | `Company Research → /research/company/Banking` | — | — | `shots/watchlists-03-item-added.png` |
| Unknown governed reference fails safely | PASS | typed `NOT-A-GOVERNED-ID` → "Add security" | no row created; surface shows `add watchlist item failed: 404 (governed-row-not-found)` | `POST …/items → 404` | nothing written | `shots/watchlists-04-unknown-reference.png` |
| Refreshing preserves persisted state | PASS | full page reload | list, item, baseline 47.1 and `FIRED` trigger all still rendered | `GET /api/watchlists → 200` | **survives reload** | `shots/watchlists-05-after-reload.png` |
| Remove governed item | PASS | clicked "Remove" | row disappears | `DELETE /api/watchlists/bwa-1/items/Banking → 200` | removal journalled | `accept-watchlists.json` |
| Delete watchlist | PASS | clicked "Delete" | article disappears | `DELETE /api/watchlists/bwa-1 → 200` | deletion journalled | `shots/watchlists-06-deleted.png` |
| Console / network hygiene | PASS | whole run | 1 console entry — Chromium's own log of the deliberately refused 404; 0 page errors; 0 failed requests; every other call 2xx | see `accept-watchlists.json` | — | `accept-watchlists.json` |

## 4. Acceptance matrix — NP-10 COLLABORATION

| Check | Result | Browser operation | Observed | HTTP / network | Persistence | Evidence |
|---|---|---|---|---|---|---|
| Route + navigation entry render | PASS | clicked sidebar "Collaboration" → `/collaboration` | surface rendered | — | — | `shots/collaboration-01-thread-created.png` |
| Threads load through the real HTTP path | PASS | page load | empty state, then threads | `GET /api/collaboration → 200` | — | `accept-collaboration.json` |
| Create thread | PASS | title, anchor kind `Company`, anchor id `Banking` → "Create thread" | thread **"Browser acceptance thread"** anchored `Company: Banking` | `POST /api/collaboration → 201` | journalled | `shots/collaboration-01-thread-created.png` |
| Open thread / view comments | PASS | clicked "Open" | detail panel with comment list | — | — | `shots/collaboration-02-comments.png` |
| Add / view comment (no citation) | PASS | typed comment → "Add comment" | comment rendered with timestamp and pin | `POST …/comments → 201` | journalled | `shots/collaboration-02-comments.png` |
| Reference type **company** | PASS | kind `Company`, id `Banking-H1` → add | chip **Company: Banking-H1** | `POST …/comments → 201` | citation persisted | `shots/collaboration-02-comments.png` |
| Reference type **evidence** | PASS | kind `Evidence`, id `ev_Banking` → add | chip **Evidence: ev_Banking** | `POST …/comments → 201` | citation persisted | `shots/collaboration-02-comments.png` |
| Reference type **watchlist** — own | PASS | own list created via the real API (201), then cited | chip **Watchlist: bwa-collab-own** | `POST …/comments → 201` | citation persisted | `shots/collaboration-02-comments.png` |
| Own vs foreign watchlist ownership rule | PASS | cited `bwa-collab-foreign` (not held by this owner) | refused: comment count **4 → 4**, no chip, surface shows `governed-reference-not-found` | `POST …/comments → 404` | **nothing written** | `shots/collaboration-02-comments.png` |
| Vintage pinned at authoring time | PASS | — | every comment shows `pinned v1.1-replay-baseline` | pin comes from the thread payload | pinned at write | `shots/collaboration-02-comments.png` |
| CURRENT/STALE disclosure correctness | PASS | — | no disclosure element while the pin equals the current governed vintage (NS-5: disclose only on difference) | — | — | `accept-collaboration.json` |
| Refreshing preserves persisted state | PASS | full page reload, re-open thread | thread, **4** comments and all three citation chips present | `GET /api/collaboration → 200` | **survives reload** | `shots/collaboration-03-after-reload.png` |
| Delete comment | PASS | clicked "Delete" on a comment | count 4 → 3 | `DELETE …/comments/<id> → 200` | journalled | `accept-collaboration.json` |
| Delete thread | PASS | clicked "Delete" | article disappears | `DELETE /api/collaboration/<id> → 200` | journalled | `accept-collaboration.json` |
| Console / network hygiene | PASS | whole run | 1 console entry — the deliberately refused 404; 0 page errors; 0 failed requests; all other calls 2xx | — | — | `accept-collaboration.json` |

## 5. Acceptance matrix — NP-11 SETTINGS

| Check | Result | Browser operation | Observed | HTTP / network | Persistence | Evidence |
|---|---|---|---|---|---|---|
| Route + navigation entry render | PASS | clicked sidebar "Settings" → `/settings` | surface rendered | — | — | `shots/settings-01-initial.png` |
| Current theme loaded from the real application | PASS | page load | `light`, source `governed default`, 0 durable revisions | `GET /api/settings → 200` | — | `shots/settings-01-initial.png` |
| Theme change reaches the server | PASS | selected `dark` in the Theme control | state shows `dark`, source `your saved revision` | `PUT /api/settings → 200` | revision 1 | `shots/settings-02-dark.png` |
| Theme change updates the visible UI | PASS | — | `--color-surface-0` **#FFFFFF → #0B1B2B**; page background **rgb(255,255,255) → rgb(11,27,43)** — the whole surface, sidebar included, renders dark | — | — | `shots/settings-02-dark.png` |
| Preference is applied app-wide at boot | PASS | full load of a **different** route (`/executive`) | boot-time theme applied: `--color-surface-0 = #0B1B2B` | `GET /api/settings → 200` on boot | — | `accept-settings.json` |
| Preference survives page refresh | PASS | full reload of `/settings` | `dark`, source `your saved revision`, 1 revision | `GET /api/settings → 200` | **survives reload** | `shots/settings-03-after-reload.png` |
| Reset restores the governed default value | PASS | clicked "Reset to defaults" | rendered theme **light**; API `theme: light`, `lastRevisionKind: settings-reset`, revisions 0 → 2 | `POST /api/settings/reset → 200` | reset journalled | `shots/settings-04-after-reset.png` |
| Reset restores the visible theme | PASS | — | `--color-surface-0` **#0B1B2B → #FFFFFF** | — | — | `shots/settings-04-after-reset.png` |
| Only the authorized preference is editable | PASS | — | exactly one editable control (`settings-theme-select`) with options `["light","dark"]`; buttons: reset; fields: effective theme, source, durable revisions, schema | — | — | `accept-settings.json` |
| No unauthorized setting offered as an option | PASS | — | no freshness / data-mode / PIT / storage / administrator / role / invite / share / secret value offered | — | — | `accept-settings.json` |
| No identity value disclosed to the browser | PASS | — | `owner-7f3a91c2` occurrences in DOM: **0**; `irr-domain-4b82d6e1` occurrences in DOM: **0** | `tenantId` is present in the payload but never rendered | — | `accept-settings.json` |
| Console / network hygiene | PASS | whole run | **zero** console errors, zero page errors, zero failed requests, all calls 2xx | see `accept-settings.json` | — | `accept-settings.json` |

> **Documented interpretation (not a defect).** After a reset the API reports `source: USER_REVISION`. The documented contract is `GOVERNED_DEFAULT` when the owner has **no durable revision**, else `USER_REVISION` (`frontend/src/api/settings.ts`); a reset appends a durable revision, so the default **value** is restored while a durable revision legitimately exists, and `lastRevisionKind: settings-reset` discloses the reset separately. Verified as behaviour, not asserted as a bug.

---

## 6. Phase 3 — fail-closed verification in the browser

Performed while the application stayed running: the carrier file (outside the repository) was altered by the operator and the browser's own `fetch` recorded what it received.

| Check | Result | Observed |
|---|---|---|
| Valid owner context permits authorized operations | PASS | settings 200; probe watchlist create → 201 |
| Tampered carrier → 503 `owner-context-unavailable` | PASS | one appended space: `/api/settings`, `/api/watchlists`, `/api/collaboration` → **all 503** |
| 503 body keeps the established code and carries no data | PASS | `{"error":"owner-context-unavailable","detail":{"reason":"No non-authentication ownership source has been established. No owner is inferred; no data is read or changed."}}` |
| Malformed (truncated JSON) carrier → 503 | PASS | all three routes 503 |
| Missing carrier → 503 | PASS | all three routes 503 |
| Adjacent non-owner routes keep serving | PASS | `/api/company/Banking → 200` (`companyId: Banking-H1`) during the same failure |
| Failure surfaces in the UI without fabricating data | PASS | the Watchlists surface renders its error state; no data surface is shown |
| Unknown routes / methods retain established behaviour | PASS | unknown route 404, `PUT` on a known route 404, unknown subroute 404, lookalike namespace 404 |
| Deferred capabilities remain unavailable | PASS | `/api/user-portfolios → 503`, `/api/reports/artifacts → 503` |
| Unaddressable owner-scoped objects disclose nothing | PASS | unknown thread → 404 `thread-not-found`; unknown watchlist → 404 `watchlist-not-found` |
| Restoring the authorized carrier restores operation | PASS | all three routes → 200 with the exact canonical bytes |
| No data loss across the failure episode | PASS | the watchlist written **before** the tampering is still readable (200) |
| UI recovers after restoration | PASS | the pre-episode watchlist renders again after a reload |
| Owner identity never disclosed to the browser | PASS | `owner-7f3a91c2`: 0 occurrences in response bodies, 0 in the rendered DOM |
| Console hygiene | PASS | 22 console entries, all Chromium logs of the deliberately induced failures; 0 uncaught page errors |

The carrier's digest after every run is unchanged: `d5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4`.

---

## 7. Regression evidence (automated — reported separately from browser acceptance)

| Check | Command | Result |
|---|---|---|
| Full repository suite after the corrections | `npx vitest run` | **66 files, 825 tests — all pass** |
| In-scope server suites | `npx vitest run server/settings server/collaboration server/watchlists` | 11 files, 164 tests — all pass |
| Owner-context suites (incl. separate-process restart) | `npx vitest run server/owner-context` | 4 files, 56 tests — all pass |
| Type check | `npm run typecheck` | exit 0 |
| Production build | `npm run build` | exit 0 |

No test file was modified and no assertion was weakened by this increment.

---

## 8. Scope, limits and honest statements

1. **All three capabilities pass browser acceptance** against the real composed application, with the real HTTP path, real governed providers and real persistence.
2. **The corrections were copy-only.** Five files changed, no line of behaviour. Status codes, the `503` safeguard, identity values, service semantics and journal formats are untouched — re-verified by the full suite and by the browser fail-closed run after the corrections.
3. **A browser was available and was used.** No capability was accepted on the basis of source inspection or automated tests alone.
4. **Evidence locations.** Machine-readable evidence: `/home/user/iips-acceptance-evidence/accept-{settings,watchlists,collaboration,failclosed}.json`; 15 rendered screenshots: `/home/user/iips-acceptance-evidence/shots/`. These live **outside the repository** (they are not product artifacts) and are cited rather than committed.
5. **Test-data context** was a clean temporary directory outside the repository; no user data was accessed or modified. Journals remained at `{"journalFormatVersion":1}`.
6. **Not verified by this record:** production deployment (TD-7b remains deferred), a real interactive display (the browser ran headless — the DOM, CSS and rendering pipeline are genuine; no human viewed a physical screen), and multi-owner tenancy (out of scope by the standing architecture).
7. **Residual cosmetic observation (not corrected, not a defect):** the Settings surface does not display the `tenantId` that the transport returns in its payload. This is not a leak (an identifier is not a secret) and the intended contract is that no owner or tenant identity is *displayed*, so the omission was left as-is.

---

## 9. Status

```text
BROWSER_ACCEPTANCE=NP-09 PASS (17/17) · NP-10 PASS (19/19) · NP-11 PASS (17/17) · FAIL-CLOSED PASS (16/16)
BROWSER=Chromium HeadlessChrome/153.0.8010.0 via puppeteer-core (real DOM/console/network/screenshots)
CORRECTIONS=5 FILES, COPY ONLY (C-1..C-5); NO BEHAVIOUR, STATUS CODE, VALUE OR SAFEGUARD CHANGED
FAIL_CLOSED=HTTP_503_OWNER_CONTEXT_UNAVAILABLE — VERIFIED IN THE BROWSER, UNCHANGED
OWNER_IDENTITY_DISCLOSED=NO (0 occurrences in bodies and DOM)
CARRIER_SHA256=d5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4 (unchanged)
REGRESSION=66 FILES / 825 TESTS PASSED; TYPECHECK 0; BUILD 0
FURTHER_DEFECT_CORRECTION_REQUIRED=NO
NEXT_PRODUCT_WORKSTREAM=NOT STARTED (per the stop condition)
```

*End of browser acceptance record. It reports browser-executed observations, distinguishes them from automated tests and source inspection, records copy-only corrections and their rationale, and does not begin any next product workstream.*
