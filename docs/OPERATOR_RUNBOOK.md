# IIPS v3.0 — Operator Runbook (single-user, personal use)

**Audience:** the owner (Ramki) or a new machine. **Purpose:** start the application from a fresh clone with no oral knowledge, and tell apart a working fail-closed surface from a broken one.

Every command and every expected output below was **executed and captured on 2026-10-14** on Linux (Node `v22.22.3`, npm CI install of `frontend/`) at commit `1b2b1948…` + the `CV-CORR-04` changes. Results on another machine differ only where the sandbox has no internet egress (noted inline). This runbook renders no authority, lifts no fence and changes no governed record; it documents the state those records already require.

---

## 0. Prerequisites

| Need | Why | Check |
|---|---|---|
| Node ≥ 22.6 | the transports are TypeScript run directly (`tsx` is now a dev dependency, so 22.x is enough) | `node --version` |
| Network reachability to **GitHub** | `frontend/package.json` pins the runtime data package as `iips-production-market-data: github:ramkivs/iips-production-market-data#8eec74ae27cda09f3c368b9c299895eae41554db`; `npm ci` fetches that tarball from `codeload.github.com` | `npm ci` completes |
| A TLS-intercepting proxy needs the CA exported to Node | otherwise `npm ci` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on `codeload.github.com` | `export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` before `npm ci` |
| Outbound internet for the macro surface only | `/api/macro/NAS` calls the MoSPI source | expect `502 RETRY_BUDGET_EXHAUSTED` when egress is blocked (observed in the Arena sandbox) |
| Windows is a **separate evidence domain** | ACL/permission and path semantics are Windows-specific | Windows results are recorded in their own evidence files and are never merged into Linux transcripts by implication |

There is **no** authentication, no login, no role, no tenant selection and no environment file to configure beyond the two variables in §2–§3. That is the product scope, not a missing feature.

## 1. Install

```bash
git clone https://github.com/ramkivs/iips-review-recovered.git && cd iips-review-recovered/frontend
npm ci          # see §0 for the GitHub/CA requirements
```

## 2. Materialise the owner-context carrier (one-time per machine, per data home)

Owner-scoped surfaces (Watchlists, Collaboration, Settings) read the owner pair from a **server-owned local file** — never from a request, header or cookie. The approved pair is fixed by the governed F-1/F-2 value act; the carrier is *materialisation, never an authority*.

```bash
RUN=~/.iips-run; mkdir -p "$RUN"
cd frontend && node --experimental-strip-types -e "
import('./server/owner-context-carrier.ts').then(m => console.log('carrier written:', m.materialiseOwnerContextCarrier(process.env.RUN || '$RUN')));
"
```

Verify the bytes — the digest is pinned in `server/owner-context-carrier.ts:78` (`OWNER_CONTEXT_CARRIER_SHA256`), so the file must match exactly:

```bash
wc -c  < "$RUN/owner-context.json"     # → 363            (CANONICAL_CARRIER_BYTE_LENGTH)
sha256sum "$RUN/owner-context.json"     # → d5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4
```

Both values were reproduced on 2026-10-14. Content (byte-exact, two-space indent, one trailing LF):

```json
{
  "carrierSchemaVersion": 1,
  "ownerUserId": "owner-7f3a91c2",
  "tenantId": "irr-domain-4b82d6e1",
  "governedBy": { …record id/path/blob/date… }
}
```

Rules that fail closed on purpose:

- The path **must be outside any Git working tree** — `materialiseOwnerContextCarrier` throws `OwnerContextCarrierLocationError` inside one, so owner data can never be committed.
- Any byte change (BOM, CRLF, re-indentation, edited values) changes the digest → the resolver rejects it → `503 owner-context-unavailable`. There is no leniency, and that is the design: editing the local file cannot move change authority away from the merged PA act.
- Do **not** hand-write this file to invent a different owner. A foreign pair is not a configuration option; it is a governance violation.

## 3. Start the API transport

```bash
cd frontend
IIPS_OWNER_CONTEXT_PATH=$RUN/owner-context.json \
IIPS_DATA_DIR=~/.iips-data \
npm run server:dev
# → Executive transport listening on :8787
```

| Variable | Effect | Omitted ⇒ |
|---|---|---|
| `IIPS_OWNER_CONTEXT_PATH` | path to the carrier **file** | owner-scoped surfaces answer `503 owner-context-unavailable` |
| `IIPS_DATA_DIR` | home of the Class-C NDJSON journal (`watchlists/journal.ndjson`); default `<cwd>/.iips-data`, which is gitignored | writes land inside the working tree default (still untracked) |
| `EXEC_TRANSPORT_PORT` | listen port (default `8787`) | the Vite proxy assumes `8787` (see §4) |
| `NODE_ENV=test` | suppresses `listen()` (used by the suites) | normal boot |

The UI proxies `/api` → `http://localhost:8787` (`vite.config.ts:18`). If you change the port, the proxy target must change too, or every screen will show its error state.

## 4. Start the UI

```bash
cd frontend && npm run dev      # → http://localhost:5173 (host 127.0.0.1 — loopback-only bind and loopback-only allowedHosts since the C8 remediation, PR #157; `vite.config.ts:13`)
```

The sidebar then offers Executive, Portfolio, User Portfolios, Watchlists, Collaboration, Settings, the Research and Intelligence children that are built, Screener and Evidence. `Research` and `Intelligence` are group headings, not links: their parent paths have no built workspace, so no click can land on “not yet built” (`App.test.tsx` pins this invariant).

## 5. Expected per-route outcomes

Read of the **certified reference** data — every screen answers from the frozen v1.1 Replay Baseline with `vintage: {asOf 2026-09-04, dataVersion 1.1.0, mode SNAPSHOT, dataSource "governed:program-v1.1-replay-baseline", memberCount 13}`. This is a snapshot surface, not a live feed; that is the certified contract, not a degraded mode. Sector keys in `/api/company`, `/api/evidence`, `/api/replay` are case-insensitive.

| Request | Status | Note |
|---|---|---|
| `GET /api/health` | `200` | `{"status":"ok","transport":"program-v3.0 executive (dev)"}` |
| `GET /api/executive` · `/api/cross-sector` · `/api/portfolio` · `/api/decision-matrix` | `200` | 13 governed members; `ranking` + `opportunity` + `avgRisk`/flags are the certified CSIP outputs mapped 1:1 |
| `GET /api/company/Banking` (or `/api/company/banking` — the sector key is case-insensitive) | `200` | `:id` is a **sector** key, not an instrument id; the payload is the certified engine output (`companyId: Banking-H1`, `verdict: Watch`, `composite: 47.1`) |
| `GET /api/evidence/Banking` · `/api/replay/Banking` | `200` | `ev_Banking` / `snap_Banking` (same decision + evidence trail). A non-sector id (`…/EV-T`) → `404 company not found` |
| `GET /api/engines` | `200` | the 13 certified sector engines (no CSIP entry: it is a platform capability, not a sector engine) |
| `POST /api/engines/sector.technology/execute` | `200` | engine id must be the **certified** id; `technology` → `400 ApiValidationError` |
| `POST /api/screener` `{"definition":{"definitionId":"RUNBOOK-CONVICTION","version":"1","predicates":[{"field":"conviction","operator":"gte","operand":"50"}]}}` | `200` | `result.matchedCount 12`, `result.totalPopulationCount 13`, `executionStatus COMPLETED`, `evaluatorId NP12-SCREEN-EVALUATOR`; membership is **server-derived**; `executionId 4d0e128b…` is content-addressed |
| same body with `"predicates":[]` | `200` | `matchedCount 13`, `executionId c865a116…`, `definitionDigest ac7b81f8…`; **re-POSTing the identical definition returned the identical `executionId`** (deterministic, no clock, no randomness). *(Re-verified against the live transport on 2026-10-21 at the Group B head: full values `c865a116318b7260c15e56760e50370f3890d9c6219b5d1e08d943b5a207d0e6` / `ac7b81f8c87b436d0b5521ab1f7d4ce5b7077032ca74a81026de12179cc2e883`, identical across repeated requests. The previously printed prefixes `b76227aa…`/`1ef5dd80…` were measured at an earlier head and are superseded; tracker §16.42.5 recorded the discrepancy, §16.68 records this reconciliation. The `4d0e128b…` conviction sample above was re-verified unchanged at the same head.)* |
| `POST /api/screener` with a `members` key | `422` | `client-supplied-members-rejected` — population authority is never client-supplied |
| `GET /api/macro/NAS?indicatorCode=1` | `200` with egress, `502` without | governed MoSPI read surface — see **§5.1** for the full contract, the exact fail-closed shapes and the mounted read-only view |
| `GET "/api/pit/market-data?securityId=ISIN:INE467B01029:EQ&domain=D01_QUOTES&asOf=2026-12-31T23:59:59.000Z"` | `200` | `found: true`, D114 TCS record, `resolvedAsOf 2026-02-10T15:30:00.000Z`, `dataVersion v1.0.0-d114-historical`, `lineageHash 3f30ac98…`, and the honest identity label `securityIdentity.isinAuthority: NON_AUTHORITATIVE`; `domain=D02_OHLCV` answers with the governed candle instead |
| `GET "/api/pit/market-data?securityId=ISIN:INE467B01029:XX&…"` (or a missing/bogus `domain`) | `404` / `400` | `INVALID_IDENTITY` / `INVALID_DOMAIN` / `INVALID_ASOF` — fail-closed at the boundary, no synthesis, no fallback |

Owner-scoped surfaces (require §2's carrier):

| Request | With carrier | Without carrier |
|---|---|---|
| `GET /api/watchlists` | `200` (`data: []` on a clean journal) | `503 owner-context-unavailable` |
| `GET /api/collaboration`, `GET /api/settings` | `200` | `503` |
| `POST /api/watchlists` `{"watchlistId":"wl-runbook","name":"Runbook check"}` | `201` | `503` |
| `POST /api/watchlists/wl-runbook/items` `{"canonicalSecurityId":"Banking"}` | `201` (row carried with its certified baseline) | `503` |
| `…/items` `{"canonicalSecurityId":"NotARealSecurity"}` | `404 governed-row-not-found` | `503` |

The `canonicalSecurityId` of the governed universe is the **sector name** (`executive-transport.ts:587`), so `Banking` resolves and an invented ISIN does not. That `404` is a governed-membership statement, not a lookup bug.

### 5.1 Macro (`/api/macro`) — governed read path, plus the D89-disclosed Research view

The governed MoSPI / e-Sankhyiki read surface serves **exactly** `NAS`, `CPI`, `IIP` (`NP-08`/`D08` boundary; `WPI`, `PPI`, RBI-sourced data and item-level IIP are not addressable). Read-only, no credentials, no account, and **live-only**: a failed or partial retrieval is never turned into observations.

| Request | Status | Meaning |
|---|---|---|
| `GET "/api/macro/nas?indicator=GVA"` (or `indicatorCode=1`; GDP = `5`) | `200` with egress · `502 RETRY_BUDGET_EXHAUSTED` without | the indicator **must** be explicit; `GET /api/macro/nas` → `400` naming the governed values; `indicator=GROSS` → `400`; `indicatorCode=3` → `502` with `code: INDICATOR_NOT_GOVERNED` and **no** observations |
| `GET "/api/macro/iip"` | `200` metadata-only | returns the **runtime-resolved** governed selection (`type: Sectoral`, category resolved *by name*, `records: []`) — codes are never hard-coded, so they cannot drift across base years |
| `GET "/api/macro/iip?subcategoryCode=2100-01"` | `200` observations | only a NIC-2 code inside the runtime-resolved set is served; anything else → `502`/refusal, and `General`, `Use-based`, Mining `12`, Electricity & Gas `13`, Water/Sewerage `14` are refused |
| `GET "/api/macro/cpi"` | `200` | the governed published-index path with CPI's own base-year enumeration (`2012` default), not shop-price microdata |
| `GET /api/macro/wpi` · `/api/macro/nasEVIL` · `/api/macro/` | `404` `{"error":"unknown macro dataset","approvedDatasets":["NAS","CPI","IIP"]}` | exact-path allow-list, so a near-miss path never reaches the provider |
| `POST /api/macro/nas` | `405` `method not allowed; /api/macro is read-only` | guarded read |

`502 RETRY_BUDGET_EXHAUSTED` with `"message": "request failed after 4 attempt(s): TypeError: fetch failed"` (captured 2026-10-14) means this machine could not reach `api.mospi.gov.in` — four bounded attempts, then a truthful failure. Check egress/proxy before treating it as an application defect; unauthenticated access is also throttled upstream (small pages), which the transport handles by paging with `limit`/`page` until complete.

**The Macro screen is a read-only disclosure surface, and nothing more.** The D89 UI-disclosure implementation gate (`CV-53-D89-MACRO-UI-DISCLOSURE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01`) authorizes the display contract only, so `frontend/src/features/research/MacroResearch.tsx` is mounted at **`/research/macro`** (sidebar → Research → Macro) and renders `MacroSourceDisclosure` (the `DT-1…DT-8`, `DT-13` product-transparency disclosure) adjacent to the observations returned by the governed read. It shows only what the read returned: a failed or partial retrieval is rendered as a refusal, nothing is cached or synthesized, no period/base year/freshness/citation is invented, and no licence, rights or endorsement language appears. What it does **not** change: entitlement stays `B — PARTIALLY ESTABLISHED`, formal Category-A attribution stays `NOT DETERMINED`, `M-3` stays `NOT ESTABLISHED`, and production stays `NOT AUTHORIZED`. No dataset outside `NAS`/`CPI`/`IIP` is addressable. Separately, the built Intelligence routes are `/intelligence/opportunities`, `/intelligence/risks`, `/intelligence/rankings`, and `/intelligence/decision-matrix`; the `/intelligence` sidebar parent remains a non-clickable group heading, and unmatched `/intelligence/*` paths remain honest `FeatureNotImplemented` placeholders. This route inventory does not change the Macro disclosure boundary.

## 6. Prove durability (Class-C journal), 2 minutes

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:8787/api/watchlists -H 'content-type: application/json' \
     --data '{"watchlistId":"wl-runbook","name":"Runbook check"}'      # → 201
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:8787/api/watchlists/wl-runbook/items -H 'content-type: application/json' \
     --data '{"canonicalSecurityId":"Banking"}'                          # → 201
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:8787/api/watchlists/wl-runbook/items -H 'content-type: application/json' \
     --data '{"canonicalSecurityId":"RELIANCE"}'                         # → 404 governed-row-not-found
wc -l ~/.iips-data/watchlists/journal.ndjson      # → 3  (header + 2 events)
# stop the transport (Ctrl-C), then start it again exactly as in §3
curl -s localhost:8787/api/watchlists/wl-runbook | head -c 80; echo    # → 200, same createdAt
wc -l ~/.iips-data/watchlists/journal.ndjson      # → 3  (reads append nothing)
```

Observed on 2026-10-14: `201 / 201 / 404`, journal `1140 bytes / 3 lines` with `tenantId irr-domain-4b82d6e1` + `ownerUserId owner-7f3a91c2` on each event, the record readable after a **full transport restart** with `createdAt` preserved, and the line count unchanged by reads. That is the restart-survival and idempotence bar for this store.

## 7. What is fenced, and what it means

| Surface | Answer at `main` + `CV-CORR-04` (all four probes executed 2026-10-14) | Why this is correct behaviour |
|---|---|---|
| `GET`+`POST /api/user-portfolios`, `/api/user-portfolios/summary` | `503` `owner-context-unavailable`, detail “No non-authentication ownership source has been established. No owner is inferred; no data is read or changed.” | Durable user-portfolio work is authorized, implemented and **unadmitted**; `D-1` and the implementation record §8.5 withhold admission, and the seam awaits a designated non-authentication ownership source. The `503` is *by authorization*, not by absence. |
| `GET`+`POST /api/reports/artifacts` | `503` — the **same** `owner-context-unavailable` payload | The Reports surface is route-valid but owner-scoped, so it fails closed on the identical carrier contract. |
| `GET`/`POST /api/reports`, `/api/reports/`, `/api/reports/artifacts/` | `404` `{"error":"not found"}` | `reports-transport.ts` is the ratified fence: it keeps exact route/method validation and never enables the deferred Reports capability — an unknown shape is not “temporarily unavailable”. |
| `POST /api/pit/market-data?…` | `405` (`found:false`, `reason: INVALID_IDENTITY`) | the PIT seam is read-only; a write attempt is refused at the boundary, not silently accepted. |
| `POST /api/engines/:id/execute` for anything not certified | `404` `DENIED` | registry-governed dispatch only; no arbitrary code execution. |
| A Macro product surface (any view of `NAS`/`CPI`/`IIP` in the UI) | not built, and not permitted to be built yet | `NP-08-D08-D89-MACRO-UI-DISCLOSURE-DECISION-ACT-01` fixes the disclosure contract (`DT-1…DT-15`) but records **“UI/application implementation: NOT AUTHORIZED”**; `DT-15` bars using that act as implementation authority. The API route above is the authorized surface. |
| The retired auth stack (login, roles, tenants, admin) | absent, not disabled | retired by decision for this single-user product; reintroducing it would need a new requirement, not a workaround. |
| `/api/*` client calls | no `authorization` header, ever | `core/network/noAuthFetch.ts`; `App.test.tsx` and the API tests assert it. |

Do not "fix" a `503`/`404` above by editing the fence: the hashes of `reports-transport.ts`, `user-portfolio-transport.ts` and `owner-context-unavailable.ts` are the integrity anchor recorded in the tracker (§16.8 item 8).

## 8. Verify the build (proportionate, no ceremony)

```bash
cd frontend && npm run typecheck && npm run test && npm run build
```

Expected at the verified current baseline: typecheck exit `0`; vitest **108 files / 1,377 tests** green; build succeeds (`vite build`, main JS chunk **1,609.84 kB**, gzip **226.69 kB**). Green here means *this repository at this commit passes its own checks*; it is not qualification, admission or release for any fenced capability. *(Counts and bundle re-stamped 2026-10-31 under the consolidated outstanding-items resolution (tracker §16.233). Exact verification baseline: IRR `main@7fd824de30d8268ed3eca210bc664dc60749fa8c` with `frontend/` tree `67607e1de119a79cba4acfa9d2375493aa898bea`; the subsequent §16.233 publication is documentation/evidence-only and does not change that frontend tree. Durable raw receipts: `evidence/integration/consolidated-outstanding-resolution-2026-10-31/raw/irr-test-ci.log.txt`, `irr-test-guard.log.txt`, `irr-vitest-report.json`, `irr-typecheck.log.txt`, `irr-typecheck-replay.log.txt` and `irr-build.log.txt`. The previous 2026-10-25 restamp at IRR `main@445f0f58…` recorded 106 files / 1,350 tests; those figures no longer reproduced. Measured with `npm run typecheck` and `npm run typecheck:replay-server`, `npm run test:ci` + `node .ci/assert-tests.js .vitest-report.json`, and `npm run build` (142 modules transformed). The screener digests in §5 were NOT re-measured in this restamp and stand as last verified 2026-10-21. These values move as the repository moves: on mismatch, re-measure at your head against the tracker's current verification baseline rather than treating the runbook number as a fence.)*

## 9. Troubleshooting by symptom

| Symptom | First check | Meaning |
|---|---|---|
| `npm ci` → `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on `codeload.github.com` | `NODE_EXTRA_CA_CERTS` (§0) | proxy CA not trusted by Node; not a repository defect |
| Every screen shows an error state | is the transport on `8787`? `curl localhost:8787/api/health` | Vite proxy target mismatch |
| Owner-scoped screens `503` with a carrier present | `sha256sum` vs `OWNER_CONTEXT_CARRIER_SHA256`; is `IIPS_OWNER_CONTEXT_PATH` the **file**, not the directory | byte-exact carrier contract |
| Watchlists empty after a restart | `IIPS_DATA_DIR` identical on both starts | different data home ⇒ different journal |
| `/api/macro/*` `502 RETRY_BUDGET_EXHAUSTED` | outbound TLS to `api.mospi.gov.in:443` (e.g. `curl -sv --max-time 10 https://api.mospi.gov.in/api/cpi/getCPIIndex?limit=1`) | upstream reachability, not the app; a `502` with `code: INDICATOR_NOT_GOVERNED` instead is a governance refusal, which is also correct |
| A Macro value shown in the UI | none can be | no Macro view exists or is authorized (`DT-15`); use the route responses above |
| A `404` on a screen you expected | `App.tsx` route table: `/research`, `/research/sector/:id`, `/evidence/snapshots`, `/evidence/replay`, unmatched `/intelligence/*` paths, and the wildcard are honest `FeatureNotImplemented` mounts; `/intelligence/opportunities`, `/intelligence/risks`, `/intelligence/rankings`, and `/intelligence/decision-matrix` are mounted separately, while `/intelligence` remains a group-only navigation heading | later-phase or unmatched surfaces; no data is fabricated for them |
