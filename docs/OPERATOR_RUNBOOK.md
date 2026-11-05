# IIPS v3.0 — Operator Runbook (single-user, personal use)

**Audience:** the owner (Ramki) or a new machine. **Purpose:** start the application from a fresh clone with no oral knowledge, and tell apart a working fail-closed surface from a broken one.

The baseline commands and outputs in §§1–2, 4–7 were **executed and captured on 2026-10-14** on Linux (Node `v22.22.3`, npm CI install of `frontend/`) at commit `1b2b1948…` + the `CV-CORR-04` changes. The Direct P1 subsection (§3.1) and its 2026-11-01 integration record are later additions; the Windows provider run is operator-directed and has not been executed by Arena. Historical observations remain dated and are not current-host verification.

---

## 0. Prerequisites

| Need | Why | Check |
|---|---|---|
| Node ≥ 22.6 | the transports are TypeScript run directly (`tsx` is now a dev dependency, so 22.x is enough) | `node --version` |
| Network reachability to **GitHub** | `frontend/package.json` pins the runtime data package as `iips-production-market-data: github:ramkivs/iips-production-market-data#279d1eed184f5e23bbabe5c6411085e120ce9e41`; `npm ci` fetches that tarball from `codeload.github.com` | `npm ci` completes |
| A TLS-intercepting proxy needs the CA exported to Node | otherwise `npm ci` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on `codeload.github.com` | `export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt` before `npm ci` |
| Outbound internet for the macro surface only | `/api/macro/NAS` calls the MoSPI source | expect `502 RETRY_BUDGET_EXHAUSTED` when egress is blocked (observed in the Arena sandbox) |
| Windows is a **separate evidence domain** | ACL/permission and path semantics are Windows-specific | Windows results are recorded in their own evidence files and are never merged into Linux transcripts by implication |

There is **no** authentication, login, role, or tenant selection. The existing carrier variables in §2–§3 and the Direct P1 IPC variables in §3.1 are server-owned configuration; they are not a browser-controlled `.env` feature. That is the product scope, not a missing feature.

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

### 3.1 Direct P1 user-portfolio reads (same-host IPC)

The user-portfolio list, detail, and revision GET routes now use IRR's existing IPC client/adapter. IRR never opens the SQLite file. IPD owns the named-pipe server and resolves the active owner binding for each request. The local IRR binding flag is a fail-closed precondition—not proof of the binding; IPD validates its own database binding independently.

On the designated Windows machine, start the IPD G3 IPC provider using IPD's operator instructions (provider runtime Node `>=22.13.0`) with:

```powershell
$env:IIPS_G3_DATABASE_PATH = 'C:\iips-data\iips\user-portfolio.sqlite'
$env:IIPS_G2_IPC_ENDPOINT = '\\.\pipe\iips-user-portfolio-v1'
```

Then start IRR with the consumer endpoint and the operator-established binding precondition:

```powershell
$env:IIPS_G2_IPC_ENDPOINT = '\\.\pipe\iips-user-portfolio-v1'
$env:IIPS_G3_IPC_BINDING_PROVISIONED = 'true'
$env:EXEC_TRANSPORT_PORT = '8787'
npm run server:dev
```

The tenant hint is optional and is never transmitted; do not add owner, tenant, principal, or credentials to requests. Without `IIPS_G3_IPC_BINDING_PROVISIONED=true`, read routes fail closed with `503 owner-context-unavailable`. A configured endpoint that is absent or unavailable also fails closed. Context discovery and create/save/reset/delete HTTP operations return `503 operation-not-admitted`; no write is forwarded, and IPD's independent Gate E W-1 refusal remains in force. This does not enable Watchlists, Collaboration, Settings, or any other owner-scoped route.

The operator-reported Direct P1 database execution and the exact IPD source pin are recorded in [`IIPS_V3_DIRECT_P1_IRR_CONSUMPTION_RECORD_2026-11-01.md`](integration/IIPS_V3_DIRECT_P1_IRR_CONSUMPTION_RECORD_2026-11-01.md). That Windows evidence is user-provided, not an Arena observation. No P1-F reprovisioning is required or documented here.

### 3.2 NP-06 Reports environment configuration

The Reports UI (`/reports`, `/reports/:reportId`) and the `/api/reports/*` routes are served by the **API transport process** — the one started in §3 with `npm run server:dev` (`tsx server/executive-transport.ts`, listening on `:8787`). The Vite UI process (`npm run dev`, §4) does **not** read either variable; it proxies `/api` to the transport. Both variables are read from the **server process environment only** — never from the request body, query string, URL, client identity, or a browser `.env` — and each is evaluated per request.

| Variable | What it names | Required by | Omitted / unusable ⇒ |
|---|---|---|---|
| `IIPS_REPORTS_OWNER_PATH` | absolute path to the Reports owner carrier **file** (`reports-owner-context.json`), not the directory | API transport process (§3) | `503 owner-context-unavailable` |
| `IIPS_NP04_DATABASE_PATH` | absolute path to the NP-04 governed SQLite database file | API transport process (§3) | `503 persistence-unavailable` (once owner context is available) |

**Owner-context availability is not persistence availability.** They are separate preconditions with separate failure surfaces:

- **Owner-context availability** means the server can establish *which* governed Reports partition it serves. It is a file-and-integrity condition: the carrier named by `IIPS_REPORTS_OWNER_PATH` exists, is readable, is byte-exact against the pinned SHA-256, and carries the approved pair. It says nothing about storage. When it holds, `GET /api/reports/context` answers `200` and deliberately does **not** require the database.
- **Persistence availability** means the server can reach the authoritative NP-04 governed store. It is a storage condition: the pinned `iips-np04-governed-persistence` `./persistence` subpath resolves at runtime and NP-04's `openDatabase` succeeds at the configured path. It says nothing about identity.

The two are independent in both directions: owner context can be available while persistence is unavailable (a `200` from `/api/reports/context` does not mask an artifact `503`), and persistence can be configured while owner context is absent (the owner check runs first, so the answer is `503 owner-context-unavailable`).

**Configuration and path expectations.**

- `IIPS_REPORTS_OWNER_PATH` — an absolute path to the carrier **file**. It must be **outside any Git working tree** (the same rule as §2) and byte-exact: 384 bytes, SHA-256 `b1b78809d1c8d05800b338f73082b4269e6c9fa65b8f35192f4736d6f1a98640`. Materialise it from the governing R1 declaration rather than hand-writing it:

  ```bash
  RUN=~/.iips-run; mkdir -p "$RUN"
  cd frontend && node --experimental-strip-types -e "
  import('./server/reports-owner-carrier.ts').then(m => console.log('carrier written:', m.materialiseReportsOwnerCarrier(process.env.RUN || '$RUN')));
  "
  IIPS_REPORTS_OWNER_PATH=$RUN/reports-owner-context.json
  ```

  This is a **different** file and a **different** approved pair from the §2 F-3 carrier (`IIPS_OWNER_CONTEXT_PATH`); do not point one at the other. Editing the carrier bytes breaks the digest and fails closed.

- `IIPS_NP04_DATABASE_PATH` — an absolute path to the SQLite database file. NP-04 rejects a relative path, so the value must be absolute. It must be distinct from the Gate 3 user-portfolio store and from `IIPS_DATA_DIR` (§3); it is never client-supplied. NP-04's `openDatabase` is called with `createDirectory: true` and `migrate: true`, so **configuring this path can create a database through NP-04 initialization**: NP-04 creates the parent directory, opens (creating it if absent) the database file, applies its pragmas, and runs its pending migrations. Reports owns no schema and no store; NP-04 does.

  This runbook deliberately does **not** prescribe a database location. The bounded non-production durable store is already authorized by the effective R3 decision (`IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01`) and accepted by the F-7 qualification record (`IIPS-V3-REPORTS-NP06-F7-QUALIFICATION-AND-ACCEPTANCE-2026-10-25-01`); within that authority the operator selects the absolute server-owned path as deployment configuration, not as a new Program Authority designation. The path must remain distinct from the Gate 3 store and `IIPS_DATA_DIR`, must never be client-supplied, and must remain non-production. Production admission is **NOT ADMITTED**; designating a durable store location for production requires a separate Program Authority determination.

**Fail-closed behaviour.** With the Reports owner carrier unavailable, every recognized `/api/reports/*` route and method answers `503 {"error":"owner-context-unavailable"}` and no report data is read or fabricated. With owner context available but persistence unavailable — `IIPS_NP04_DATABASE_PATH` unset, the package not resolvable, or `openDatabase`/store construction failing — every artifact route answers `503 {"error":"persistence-unavailable"}`. No substitute store, Reports-local store, or fallback is constructed. The UI renders a sanitized unavailable state with a `Retry` button and never displays the backend `reason`, a filesystem path, or a SQLite error.

**Retry is not a configuration change.** `Retry` re-issues the request, and the transport re-attempts owner resolution (uncached, per request) and persistence resolution. It cannot change the running process environment: an operator cannot alter `process.env` of a process that is already running. If the cause is a missing, invalid, or changed variable, `Retry` returns the same `503`. After changing either variable, **restart the API transport process** (stop `npm run server:dev` and start it again as in §3) so the new environment takes effect. Restarting does not move or delete the database; it reopens the same configured file. A change to the carrier file's *contents* is re-read per request, but changing the path variable still requires a restart.

**Verify the two preconditions** (expected outcomes from the source contract; not executed for this documentation-only change, and no database was created):

```bash
# owner context configured, IIPS_NP04_DATABASE_PATH unset:
curl -s localhost:8787/api/reports/context                              # → 200 (owner context only)
curl -s -o /dev/null -w '%{http_code}\n' localhost:8787/api/reports/artifacts   # → 503 persistence-unavailable

# after setting IIPS_NP04_DATABASE_PATH to the PA-designated absolute path and restarting the transport:
curl -s -o /dev/null -w '%{http_code}\n' localhost:8787/api/reports/artifacts   # → 200 (empty page on a fresh database)
```

**Persisting the certified reports (operator-controlled).** The producer-to-persistence invocation authorized on 2026-11-05 is the one-off script `frontend/server/reports/persist-real-reports.ts`. It reuses `computeCertifiedPlatform()` (the certified frozen-engine execution and its genuine `pr.reports` output), `composeReportContent()`, and the existing `ReportsPersistence.persistNew()` / NP-04 `createInstance` boundary. It is **not** a public write route and adds **no** UI write control; the Reports UI remains read-only.

```bash
cd frontend
npx tsx server/reports/persist-real-reports.ts                 # dry run: show the genuine reports, write nothing
npx tsx server/reports/persist-real-reports.ts --commit        # persist the genuine reports once
npx tsx server/reports/persist-real-reports.ts --verify        # read back in a new process
```

The script requires `IIPS_REPORTS_OWNER_PATH` and `IIPS_NP04_DATABASE_PATH` (§3.2), resolves the approved owner pair from the carrier, and refuses to create a duplicate instance for an already-persisted `reportKey` unless `--force` is supplied. `--verify` opens a fresh NP-04 store handle and reads the artifacts back; with `--api <base-url>` it also checks that the running Reports API returns the same artifact count. The persisted reports appear at `/reports` through the existing read-only UI. This is a bounded non-production operator procedure; production admission remains **NOT ADMITTED**.

### 3.3 Broker-import evidence retrieval (`IIPS_BROKER_EVIDENCE_OWNER_PATH`)

The evidence-retrieval route admitted by `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` §8 reads its owner scope from a **third, separate server-owned carrier file**. Like §2 and §3.2, the value is never read from a request, header, cookie, token or query string; it is evaluated **per request** by the API transport process started in §3.

| Variable | What it names | Required by | Omitted / unusable ⇒ |
|---|---|---|---|
| `IIPS_BROKER_EVIDENCE_OWNER_PATH` | absolute path to the broker-import evidence owner carrier **file** (`broker-evidence-owner-context.json`), not the directory | API transport process (§3), for `GET /api/broker-import/:portfolioId/evidence/:importId` only | `503 owner-context-unavailable` on that route, and on that route only |

Materialise it from the governing act rather than hand-writing it:

```bash
RUN=~/.iips-run; mkdir -p "$RUN"
cd frontend && node --experimental-strip-types -e "
import('./server/broker-import/brokerImportEvidenceOwnerCarrier.ts').then(m => console.log('carrier written:', m.materialiseBrokerEvidenceOwnerCarrier(process.env.RUN || '$RUN')));
"
IIPS_BROKER_EVIDENCE_OWNER_PATH=$RUN/broker-evidence-owner-context.json
```

Verify the bytes — both values are pinned by the act at §3.7(3) and re-pinned in `server/broker-import/brokerImportEvidenceOwnerCarrier.ts`:

```bash
wc -c  < "$RUN/broker-evidence-owner-context.json"   # → 367   (CANONICAL_BROKER_EVIDENCE_CARRIER_BYTE_LENGTH)
sha256sum "$RUN/broker-evidence-owner-context.json"  # → 27e70c10be68f42a7dc90e5d07669b2a4201c3b807ee0b9fb14e9247b06f8b2c
```

Content (byte-exact, two-space indent, the act's key order, one trailing LF):

```json
{
  "carrierSchemaVersion": 1,
  "ownerUserId": "owner-4dc756b3",
  "tenantId": "irr-personal-073dd1c8",
  "governedBy": { …AMEND-01 record id / path / decision date… }
}
```

Rules that fail closed on purpose — the same rules as §2 and §3.2:

- **Three carriers, three seams, three pairs.** This is a **different** file and a **different** approved pair from both the §2 F-3 carrier (`IIPS_OWNER_CONTEXT_PATH`, `owner-7f3a91c2` / `irr-domain-4b82d6e1`) and the §3.2 Reports carrier (`IIPS_REPORTS_OWNER_PATH`, `owner-irr-reports-personal` / `irr-reports-personal`). NP-06 R1 §1 prohibits aliasing one governed carrier to another: **do not point one variable at another's file.** Pointing `IIPS_BROKER_EVIDENCE_OWNER_PATH` at the F-3 or Reports carrier yields `503 owner-context-unavailable`, because the digest will not match — that is the intended result, not a bug.
- The path **must be outside any Git working tree** — `materialiseBrokerEvidenceOwnerCarrier` throws `BrokerEvidenceOwnerCarrierLocationError` inside one.
- Any byte change (BOM, CRLF, re-indentation, **reordered keys**, edited values) changes the digest → the resolver rejects it → `503 owner-context-unavailable`. Key order is load-bearing: it is part of the pinned bytes.
- **No restart is needed** to pick up a change. Evaluation is uncached and per request, so removing the carrier makes the very next request fail closed and restoring it makes the next request succeed.
- Do **not** hand-write this file to invent a different owner. A foreign pair is refused (`invalid-value`), not adapted.
- **`SAIRAM` is a display label, not a configuration value.** It appears in no carrier, in no environment variable and in neither partition key. It cannot be used to select, look up or authorize anything, and setting it anywhere has no effect.

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
| Historical pre-Direct-P1 `/api/user-portfolios*` behavior (observed 2026-10-14) | All recognized operations returned `503 owner-context-unavailable` | Historical fence record only. Current read-only list/detail/revision behavior is defined in §3.1 and the 2026-11-01 integration record; writes and context discovery remain unadmitted. |
| `GET`+`POST /api/reports/artifacts` | `503` — the **same** `owner-context-unavailable` payload | The Reports surface is route-valid but owner-scoped, so it fails closed on the identical carrier contract. *(Current `main` adds the second, independent precondition documented in §3.2: with owner context available but persistence unavailable, artifact routes answer `503 persistence-unavailable`, while `/api/reports/context` stays `200`.)* |
| `GET`/`POST /api/reports`, `/api/reports/`, `/api/reports/artifacts/` | `404` `{"error":"not found"}` | `reports-transport.ts` is the ratified fence: it keeps exact route/method validation and never enables the deferred Reports capability — an unknown shape is not “temporarily unavailable”. |
| `POST /api/pit/market-data?…` | `405` (`found:false`, `reason: INVALID_IDENTITY`) | the PIT seam is read-only; a write attempt is refused at the boundary, not silently accepted. |
| `POST /api/engines/:id/execute` for anything not certified | `404` `DENIED` | registry-governed dispatch only; no arbitrary code execution. |
| A Macro product surface (any view of `NAS`/`CPI`/`IIP` in the UI) | not built, and not permitted to be built yet | `NP-08-D08-D89-MACRO-UI-DISCLOSURE-DECISION-ACT-01` fixes the disclosure contract (`DT-1…DT-15`) but records **“UI/application implementation: NOT AUTHORIZED”**; `DT-15` bars using that act as implementation authority. The API route above is the authorized surface. |
| The retired auth stack (login, roles, tenants, admin) | absent, not disabled | retired by decision for this single-user product; reintroducing it would need a new requirement, not a workaround. |
| `/api/*` client calls | no `authorization` header, ever | `core/network/noAuthFetch.ts`; `App.test.tsx` and the API tests assert it. |

Do not "fix" an unrelated `503`/`404` above by editing its fence. The Direct P1 read-only user-portfolio composition is the explicit 2026-11-01 exception described in §3.1. The shared `owner-context-unavailable.ts` response and the other owner-scoped namespaces retain their fail-closed behavior; the former all-route user-portfolio fence is historical, not an active integrity anchor.

## 8. Verify the build (proportionate, no ceremony)

```bash
cd frontend && npm run typecheck && npm run test && npm run build
```

Expected at the verified current baseline: typecheck exit `0`; vitest **108 files / 1,377 tests** green; build succeeds (`vite build`, main JS chunk **1,609.84 kB**, gzip **226.69 kB**). Green here means *this repository at this commit passes its own checks*; it is not qualification, admission or release for any fenced capability. *(Counts and bundle re-stamped 2026-10-31 under the consolidated outstanding-items resolution (tracker §16.234). Exact verification baseline: IRR `main@7fd824de30d8268ed3eca210bc664dc60749fa8c` with `frontend/` tree `67607e1de119a79cba4acfa9d2375493aa898bea`; the subsequent §16.234 publication is documentation/evidence-only and does not change that frontend tree. Durable raw receipts: `evidence/integration/consolidated-outstanding-resolution-2026-10-31/raw/irr-test-ci.log.txt`, `irr-test-guard.log.txt`, `irr-vitest-report.json`, `irr-typecheck.log.txt`, `irr-typecheck-replay.log.txt` and `irr-build.log.txt`. The previous 2026-10-25 restamp at IRR `main@445f0f58…` recorded 106 files / 1,350 tests; those figures no longer reproduced. Measured with `npm run typecheck` and `npm run typecheck:replay-server`, `npm run test:ci` + `node .ci/assert-tests.js .vitest-report.json`, and `npm run build` (142 modules transformed). The screener digests in §5 were NOT re-measured in this restamp and stand as last verified 2026-10-21. These values move as the repository moves: on mismatch, re-measure at your head against the tracker's current verification baseline rather than treating the runbook number as a fence.)*

## 9. Troubleshooting by symptom

| Symptom | First check | Meaning |
|---|---|---|
| `npm ci` → `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on `codeload.github.com` | `NODE_EXTRA_CA_CERTS` (§0) | proxy CA not trusted by Node; not a repository defect |
| Every screen shows an error state | is the transport on `8787`? `curl localhost:8787/api/health` | Vite proxy target mismatch |
| Owner-scoped screens `503` with a carrier present | `sha256sum` vs `OWNER_CONTEXT_CARRIER_SHA256`; is `IIPS_OWNER_CONTEXT_PATH` the **file**, not the directory | byte-exact carrier contract |
| Watchlists empty after a restart | `IIPS_DATA_DIR` identical on both starts | different data home ⇒ different journal |
| Reports shows “owner context unavailable” or “persistence store unavailable” | §3.2: is `IIPS_REPORTS_OWNER_PATH` the carrier **file** (not the directory) and byte-exact? Is `IIPS_NP04_DATABASE_PATH` an absolute path? Was the API transport restarted after either variable changed? | `Retry` re-attempts resolution but cannot change a running process's environment; restart `npm run server:dev` after configuration changes |
| `/api/macro/*` `502 RETRY_BUDGET_EXHAUSTED` | outbound TLS to `api.mospi.gov.in:443` (e.g. `curl -sv --max-time 10 https://api.mospi.gov.in/api/cpi/getCPIIndex?limit=1`) | upstream reachability, not the app; a `502` with `code: INDICATOR_NOT_GOVERNED` instead is a governance refusal, which is also correct |
| A Macro value shown in the UI | none can be | no Macro view exists or is authorized (`DT-15`); use the route responses above |
| A `404` on a screen you expected | `App.tsx` route table: `/research`, `/research/sector/:id`, `/evidence/snapshots`, `/evidence/replay`, unmatched `/intelligence/*` paths, and the wildcard are honest `FeatureNotImplemented` mounts; `/intelligence/opportunities`, `/intelligence/risks`, `/intelligence/rankings`, and `/intelligence/decision-matrix` are mounted separately, while `/intelligence` remains a group-only navigation heading | later-phase or unmatched surfaces; no data is fabricated for them |
## 10. Broker-import evidence: retrieval, retention, storage visibility (O-1), backup (O-2) and deletion

Authority: `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` §8, effective `2026-11-05`, rendering the PA's Decisions 5 and 6 of that date. This section documents obligations **O-1** and **O-2** (act §4.3) and the owner-controlled deletion procedure the act requires to live **outside** the HTTP surface (§8.3(16)(h)).

### 10.1 The one admitted route

```
GET /api/broker-import/:portfolioId/evidence/:importId
```

Exactly one route was added. `GET` is the only method; there is **no** collection endpoint, **no** list endpoint and **no** `DELETE` anywhere in the namespace.

| Request | Answer | Meaning |
|---|---|---|
| Own retained `importId`, carrier and binding present | `200` | The record's evidence fields, plus a `retention` block (§10.3). Both partition keys are withheld from the body |
| `importId` never retained | `404 {"outcome":"RESOURCE_UNAVAILABLE"}` | Not present in your scope |
| `importId` malformed (not 64 lowercase hex) | `404 {"outcome":"RESOURCE_UNAVAILABLE"}` | **Byte-identical to the row above by design** — absence, malformation and out-of-scope are indistinguishable, so the route is not an oracle |
| Any query string | `400 {"error":"invalid-request","field":"query"}` | Refused before any disk read |
| Non-`GET` method | `405` + `Allow: GET` | Including `DELETE` |
| `…/:portfolioId/evidence` (four segments) | `404 {"error":"not found"}` | The collection form is not admitted |
| Carrier absent, unreadable, edited or digest-mismatched | `503 owner-context-unavailable` | Fail closed (§3.3) |
| Binding precondition absent | `503 owner-context-unavailable` | Fail closed before any store is constructed |
| Journal record tampered | `503 {"outcome":"EVIDENCE_TAMPERED"}` | The digest is re-verified on **every** read; a tampered record is never served and never silently reported absent |

`importId` is `sha256(broker ‖ contentDigest ‖ readAt)`, printed at import time. Keep it: it is the only handle on a record, and there is deliberately no way to ask the server for a list of them.

### 10.2 Where the evidence lives

`$IIPS_DATA_DIR/journal.ndjson` — the Class-C append-only journal, defaulting to `<cwd>/.iips-data/journal.ndjson` when `IIPS_DATA_DIR` is unset (§3). Server-owned local disk only: never a Git working tree, never a network store, never a third party, never a browser store.

**Worth knowing, because it is unusual here.** Every other journal consumer in this application writes into its own dedicated subdirectory — `watchlists/`, `collaboration/`, `settings/`. Broker-import evidence is the **only** consumer that writes at the data **root**. The practical consequence is favourable and is what makes §10.5 safe: `$IIPS_DATA_DIR/journal.ndjson` contains **broker-import evidence and nothing else**, so acting on that one file cannot touch your watchlists, collaboration threads or settings.

That layout is recorded, **not changed**. Moving the evidence journal into a dedicated subdirectory would relocate data that Decision 6 requires to be preserved, and the act fixes no directory layout, so a move would need its own decision. Nothing here authorizes one.

**Nothing in the live import path currently writes evidence.** The retention leg is implemented and restart-proven, and is exercised by the separate-process proof and by the store's own tests, but no production import composes it yet. Until retention is composed under separate authority, this route answers `404` for every `importId` — correctly, because nothing has been retained. A `404` is therefore **not** evidence that the route is broken.

### 10.3 O-1 — storage-usage visibility, with no new endpoint

The act requires the owner to see the record **count**, the **approximate bytes**, the **location** and whether the **review threshold** is exceeded — and forbids satisfying that with any new route, collection endpoint, metrics endpoint or admin surface. It is delivered three ways:

1. **On the admitted response.** Every `200` carries a `retention` block:
   ```json
   "retention": {
     "policy": "INDEFINITE", "deletion": "EXPLICIT_OWNER_ONLY",
     "automaticPurge": false, "destructiveCompaction": false, "deletionReachableFromHttp": false,
     "reviewThresholdBytes": 52428800, "reviewThresholdIsDeletionTrigger": false,
     "storage": { "recordCount": 1, "approximateBytes": 48213, "reviewThresholdExceeded": false }
   }
   ```
   `approximateBytes` is a **lower bound**: it sums the retained payloads and excludes the journal's per-line envelope.
2. **By direct inspection** — the location limb of O-1, which needs no HTTP at all:
   ```bash
   DATA="${IIPS_DATA_DIR:-$PWD/frontend/.iips-data}"
   ls -l  "$DATA/journal.ndjson"                       # actual on-disk bytes of the evidence journal
   wc -l  "$DATA/journal.ndjson"                       # lines = 1 version header + 1 per journal event
   echo "scale=2; $(stat -c %s "$DATA/journal.ndjson") / 52428800" | bc   # fraction of the 50 MB review threshold
   ```
3. **In this runbook**, which is the recorded location for the data directory.

The **50 MB** figure (52,428,800 bytes) is a **warning and review point only**, settable by the PA in a later act. Crossing it **deletes nothing, blocks nothing, truncates nothing and refuses nothing**. It is **not a quota**. When `reviewThresholdExceeded` turns `true`, the correct response is to review — and, if you choose, to back up (§10.4) or delete (§10.5) deliberately.

### 10.4 O-2 — backup and recovery

Owner-operated file copy. **No automated backup service, no cloud sync, no third-party transmission** — the act's locality rule (§8.3(11)) and its third-party prohibition (§8.6(24)) are unchanged, and personal financial evidence must not leave this machine's server-owned filesystem.

Back up:

```bash
DATA="${IIPS_DATA_DIR:-$PWD/frontend/.iips-data}"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
cp -p "$DATA/journal.ndjson" "$HOME/iips-backup/evidence-$STAMP.ndjson"   # copy, never move
sha256sum "$DATA/journal.ndjson" "$HOME/iips-backup/evidence-$STAMP.ndjson"   # must agree
```

Recover:

1. Stop the API transport (§3).
2. Copy the backup back to `$IIPS_DATA_DIR/journal.ndjson`.
3. Re-materialise the carrier if it was lost (§3.3). This is **deterministic** — the same act always produces the same 367 bytes and the same digest — so losing the carrier file never loses the owner scope.
4. Restart the transport and `GET` a known `importId`.

Integrity is preserved by the append-only model: no record is rewritten, no history is truncated and **no compaction rewrites the journal** (compaction is not built in PF-1 v1, TD-3). Evidence integrity, import history and audit metadata survive a restore because the digest travels inside each record and is re-verified on every read. A backup whose digest does not match will fail closed rather than serve altered evidence.

**Not a recovery path:** reconstructing a record from a digest, or re-importing the CSV in place of the retained original. Neither reproduces the retained evidence — P04 quarantine ids are minted per process, so a re-import is a *different* record with a *different* digest.

### 10.5 Owner-controlled deletion — and the decision that is still open

Retention is **indefinite**. Nothing in this application expires, purges, compacts or deletes evidence: not on a schedule, not on size, not on count, not on import, not on restart, not on error, and not on quota. Deletion happens **only** when you do it yourself, **outside** the HTTP surface.

**What works today — deleting ALL broker-import evidence:**

```bash
DATA="${IIPS_DATA_DIR:-$PWD/frontend/.iips-data}"
cp -p "$DATA/journal.ndjson" "$HOME/iips-backup/pre-delete-$(date -u +%Y%m%dT%H%M%SZ).ndjson"  # back up first (§10.4)
rm "$DATA/journal.ndjson"
```

This is safe and contained: as §10.2 records, that one file holds broker-import evidence alone, so your watchlists, collaboration threads and settings are untouched. Restart the transport afterwards.

**What does NOT exist — deleting ONE record.** PF-1's journal is append-only and exposes no delete primitive; its only mutation operations are `append` and `updateReadState`. There is therefore no supported way to remove a single `importId` while keeping the others, and no HTTP route offers one: `DELETE` is refused with `405` on the evidence path and is admitted nowhere in the namespace.

**This is a genuine open Program Authority decision, recorded and not resolved here.** Decision 6 requires *explicit owner-controlled deletion*; clauses 16(h) and 24 forbid any HTTP `DELETE`. Both are honoured — deletion is authorized in principle and is exercisable today only at whole-journal granularity outside HTTP. Per-record deletion would require a **further act** plus a change to the append-only journal authority, and neither is authorized by AMEND-01. **No deletion functionality of any kind was added to the route, the store or PF-1 by the A-9 implementation.** It does not block retrieval: the read route admits no deletion capability at all.

If you need one record gone today, the only supported route is: back up, delete the whole journal, and re-import the CSVs whose evidence you want to keep — accepting that the re-imported records are new records with new digests, not restorations.

## 11. AMEND-02 live parsed-evidence retention — personal local operation

Authority: `IIPS-V3-CAP02-U1-AMEND-02-IMPORT-EVIDENCE-RETENTION-2026-11-05-01`
(PR #452 adoption; PR #453 effectiveness). This is evidence retention, not holdings persistence;
W-1 remains on. No production activation/deployment is performed or authorized by this increment.

The Broker Holdings page submits only its parsed snapshot to
`POST /api/broker-import/DEFAULT_PORTFOLIO/evidence` and verifies through the existing
`GET /api/broker-import/DEFAULT_PORTFOLIO/evidence/:importId` before displaying final success.
Raw CSV bytes are never uploaded or journaled. Browser-reported identity evidence is not server-
authenticated identity; the original CSV digest cannot be independently recomputed without its bytes.
The complete stored record digest is verified server-side on every read; A-9 withholds partition keys,
so the browser compares the returned digest with the POST acknowledgement, not a hash of the projection.

### 11.1 Preconditions and limits

- Exactly **one writer OS process** may use a journal directory. Stop the previous host and confirm it
  has exited before starting a replacement. Never run a manual/test writer concurrently against that
  directory. The in-process queue is **not** a cross-process lock. PF-1 has no explicit fsync guarantee:
  qualified recovery is process-restart recovery, not sudden power-loss/hardware survival.
- Keep `IIPS_DATA_DIR` and the canonical carrier referenced by `IIPS_BROKER_EVIDENCE_OWNER_PATH` on the
  owner's server-controlled local filesystem, outside Git, permission-restricted. Existing binding
  precondition `IIPS_G3_IPC_BINDING_PROVISIONED` must be established by the governed procedure; do not
  set it merely to bypass an unavailable binding. Preserve the existing SAIRAM carrier bytes/digest:
  owner `owner-4dc756b3`, mechanical tenant `irr-personal-073dd1c8`. SAIRAM is display-only.
- No credentials, owner fields, journal paths, raw CSV or canonical company identifiers belong in a
  submission. JSON is capped at 4 MiB, 10,000 rows, 4,096-character string values and depth 12; filename
  at 256 characters and browser CSV at 1 MiB. Oversized/invalid submissions are not retained; the
  ordinary holdings POST's existing 64 KiB limit remains unchanged.
- Retention is indefinite. The 50 MiB storage warning is a review point only, never a quota, expiry,
  deletion or append blocker. Existing §10 owner-local backup/recovery safeguards remain applicable.
  No deletion endpoint/tool, automatic purge or compaction is introduced. Explicit owner-controlled
  deletion policy is preserved; per-record deletion remains unavailable.

### 11.2 Recovery and truthful UI states

A successful preview alone is not evidence retention. “Submitting” and “Verifying through A-9” are
not success. “Retention acknowledged; retrieval not verified” means append/read-back was acknowledged
but the A-9 fetch failed or mismatched; use **Check retained evidence**. “Retention unconfirmed” means
no outcome was established, **not** proof that no append occurred. An append may have succeeded before
an acknowledgement was lost. Check the original import ID through A-9, then explicitly retry only the
**frozen original snapshot**, with its original timestamp and filename. There is no automatic retry.

The mounted page retains that snapshot in memory, not browser durable storage. A new file selection
creates a new attempt; it is not a retry. Copy the displayed import ID if recovery after browser loss
is needed. A restarted host can retrieve by known import ID; there is no enumeration endpoint. Do not
re-import with a new timestamp and call that recovery of the original. Clearing the UI never deletes
committed evidence and does not reverse an in-flight append.

Duplicate equivalent submission returns the original record/digest with no journal growth. A stable
payload or portfolio-slot conflict returns 409 and leaves the original unchanged; do not overwrite or
invent a new ID to hide a conflict. Only documented volatile per-row quarantine IDs are excluded from
stable comparison. Storage/read-back errors return 503 without a retention-success claim. Tampering
fails closed. Do not edit the journal, reset the carrier, truncate history or reconstruct a record
from a digest to make a failing request succeed.

After any suspected corruption, stop the single writer, preserve the original evidence and use the
existing owner-local backup/read-verification procedure (§10). PF-1's already-governed final truncated-
line recovery is unchanged; malformed interior lines fail closed. Consumer code adds no repair,
rollback, deletion or purge. Escalate unresolved corruption rather than altering PF-1 or its journal.

## 12. Dated deletion/backup safety clarification (`2026-11-06`) — no new deletion authority

This additive note qualifies the abbreviated historical recipes in §§10.4–10.5. **Do not execute them
as part of the deletion decision-paper task.** No deletion tool, endpoint or altered retention policy
has been implemented. Decision-ready proposal:
`docs/integration/WS-A-OWNER-EVIDENCE-DELETION-PA-DECISION-PAPER-2026-11-06.md`; PA decision pending,
Act ID unassigned, proposed amendment not effective, new implementation not authorized.

- The current root-file layout separates evidence from Watchlists/Collaboration/Settings subdirectories,
  but does not prove the actual journal has only the approved owner or schema. Filesystem removal bypasses
  PF-1 owner checks and can destroy any foreign record in the same file. Do not act on an unverified,
  mixed-owner, unrelated-schema, malformed or tampered journal. The fixed opaque owner/carrier remains
  required; SAIRAM or an owner argument is not an OS credential or authorization by itself.
- Stop **all** writers/hosts and close stale browser imports before any owner-operated snapshot/reset
  or restore. Do not remove a live journal or overwrite newer history. PF-1 has no cross-process lock
  or explicit fsync guarantee. Constructing it can rewrite a truncated final line: it is not a
  byte-preserving inspector. This documentation pass opens no operational store and performs no repair.
- A pre-delete local copy retains the full evidence. Removing the active file is **active-store reset**,
  not permanent erasure. Existing backups/snapshots can contain all records. No backup is removed or
  automatically expired. Removal of backups/all copies requires a distinct explicit PA disposition.
- Verify whole-file snapshot SHA-256 against its retained manifest as an operator action. A-9 checks
  per-record integrity, not backup freshness, completeness or a deletion-intent registry. A valid old
  backup can restore deliberately cleared records; “digest passes” does not prove restore is permitted.
- Existing manual steps provide no application confirmation or transactional deletion-fact audit. An
  interruption can leave active + backup, backup only or unknown state. Do not infer successful reset
  from a missing file, silently resume a destructive action, automatically restore, or edit the journal
  to manufacture a successful state. Preserve remaining files, stop writers and reconcile deliberately.
- Re-import advice in §10.5 creates **new evidence**, not restoration of original retained records.
  Restoring original bytes from a verified backup is the distinct recovery operation in §10.4 and can
  reverse a reset. A new import or old-snapshot resubmission can recreate state after a whole reset;
  there is no tombstone/denylist or permanent-ID-suppression mechanism.

The simplest proposed future model is an offline, whole-file scope-checked, owner-confirmed reset with
verified retained local recovery copy and minimal deletion-fact receipt. That is **only a proposal**.
No new removal command is provided here. Existing indefinite/explicit-owner-only policy, locality,
backup protection, owner isolation, digest verification and the 50 MiB warning-only rule remain intact.

## 13. Effective owner-controlled offline active-evidence reset (2026-11-06)

Later overlay to §12's historical proposal status: authority is EFFECTIVE under
`IIPS-V3-CAP02-OWNER-EVIDENCE-RESET-2026-11-06-01`, published through #459/#460.
The bounded implementation and isolated verification are described in
`docs/integration/WS-A-OWNER-EVIDENCE-RESET-IMPLEMENTATION-2026-11-06.md`.
This is **all active broker evidence**, not one import and **not permanent erasure**.
Original bytes remain in the retained recovery copy; restoring an old copy, stale-client
submission or new import can resurrect evidence. Indefinite retention remains until explicit reset.

### 13.1 Supported operating envelope and preflight

- Owner-operated local terminal only; Linux, Node 22 with installed existing frontend dependencies.
  Supported filesystem type checks: ext, XFS, btrfs, overlay. Actual qualification here was Linux
  overlay in isolated fixtures; the allowlist is not certification of every mount/provider.
  Windows/macOS, network/FUSE/unrecognized filesystems fail closed; no Windows readiness claim.
- A filesystem type alone cannot identify cloud synchronization, snapshots or other writers.
  **All hosts/writers must be stopped**, stale browser imports closed, and local/no-sync storage
  explicitly attested on every command. These are enforced operator declarations, not process
  discovery, OS authentication, ACL inspection or a cross-process lock. Never use concurrently.
- Configure the exact existing owner directory and server-owned canonical carrier. No default data
  directory, owner/SAIRAM argument, arbitrary target, backup path, environment-only confirmation or
  remote deletion exists. Target is exclusively `IIPS_DATA_DIR/journal.ndjson`, outside Git.
- Directories must be owned by the executing OS user with mode 0700; journal/carrier/control files
  must be regular, single-linked, same-OS-user-owned mode 0600. Ancestors must be trusted and not
  unprotected writable directories; root-owned sticky `/tmp` is allowed for fixtures. Symlinks,
  hardlinks, aliases, foreign/mixed journals, unknown grammar or bad digests are refused.
  Do not blindly chown/chmod a foreign store or alter carrier bytes to evade refusal. Have the
  legitimate local owner resolve access/storage issues separately and obtain a new plan.
- Raw inspection ceiling is 256 MiB per journal/copy; larger files are unsupported by this tool,
  **not a retention quota or an automatic purge trigger**. No PF-1 constructor is used by planning.
- No fsync, power-loss atomicity, secure-media erasure, all-backup deletion, production activation
  or permanent-ID suppression is implemented. Hashes are integrity checks, not signatures against
  an actor who can rewrite both data and hashes. Keep local plans/audits/copies private and retained.

### 13.2 Exact owner-operated procedure (not executed on operational evidence by this task)

From the repository's `frontend` directory, using the already installed locked dependencies:

```sh
export IIPS_DATA_DIR='/absolute/canonical/private/owner-data-directory'
export IIPS_BROKER_EVIDENCE_OWNER_PATH='/absolute/canonical/private/broker-evidence-owner-context.json'
node --import tsx server/broker-import/ownerEvidenceResetCli.ts plan
```

Type the displayed owner/quiescence/no-sync/stale-browser attestation exactly. Describe other retained
copies, or `NONE_KNOWN` when none are known (not a claim of exhaustive discovery). Repeat that exact
metadata response for this operation's subsequent commands. The planner inventories all recovery
copies in its own control directory; external copy declarations are metadata, never deletion targets.
Review the **entire** printed plan: owner/tenant, exact target, source identity (device/inode/size/time),
records/events/bytes/SHA-256, carrier binding, existing copies, unique retained-copy path and plan hash.
The journal inspection itself is read-only; saving a private plan writes only maintenance metadata.

```sh
node --import tsx server/broker-import/ownerEvidenceResetCli.ts execute OPERATION_UUID_FROM_PLAN
```

After the fresh attestation/disclosure, type the displayed exact phrase:
`CLEAR ALL ACTIVE EVIDENCE <operation UUID> <plan SHA-256>`.
This first authorizes preparation. Only after original-byte copy verification and PREPARED audit does
the terminal ask for the **same exact phrase again immediately before removal**. No default Yes.
Cancel/EOF/wrong phrase leaves active evidence intact; after preparation it also leaves the recovery
copy and incomplete audit retained. Stale plans or changed file/identity/census/carrier invalidate the
attempt. An attempted plan cannot be reused; do not edit the plan/audit to resume it.

The executor creates unique mode-0600 files under private mode-0700
`IIPS_DATA_DIR/broker-evidence-reset/`: `<UUID>.plan.json`, `<UUID>.recovery.ndjson`,
`<UUID>.audit.ndjson`. It does not overwrite an existing artifact. Audit phases are
STARTED → COPY_VERIFIED → PREPARED → CONFIRMED → COMPLETED (or STARTED → NO_OP).
The audit retains only deletion-fact scope, plan/source hashes, count/bytes, backup basename,
confirmation fact, phase/outcome/time; no rows, source filenames or import inventory.
Copy SHA-256, complete raw grammar and record/import digests are checked before the sole active-file
unlink. Prepared/confirmed audit is read back before unlink. Absence and copy integrity are checked
before completion is reported. Empty/missing active journal records a confirmed NO_OP; no file removed.

```sh
node --import tsx server/broker-import/ownerEvidenceResetCli.ts status OPERATION_UUID_FROM_PLAN
```

### 13.3 Interruption, reconciliation and distinct explicit undo

Keep writers stopped. `status` is read-only, never retries/removes/restores/cleans artifacts.
- NOT_ATTEMPTED is **not** proof of a reset; a missing active file alone is never success.
- INCOMPLETE_ACTIVE_UNCHANGED: preserve active + any copy/artifacts. No resume. Only after deliberate
  reconciliation may the owner make a new plan and new confirmation for a new attempt.
- INCOMPLETE_ACTIVE_ABSENT_UNKNOWN_NOT_SUCCESS: removal may have occurred, but completion was not
  established. Keep the verified original copy; do not manufacture a completed receipt or silently retry.
- INVALID_OR_INTERRUPTED_AUDIT, contradictory/recreated active data, invalid/missing copy, permission
  refusal or unreadable artifacts: stop, preserve everything, reconcile manually. No false success.
- COMPLETED_ACTIVE_CLEARED_COPY_RETAINED requires valid ordered completion audit, absent active path
  and reverified copy. A later recreated/restored journal makes status contradictory, not clear-success.
  Even a fully completed process-kill case can establish this state only when all these facts survive.
  This is not a sudden-power-loss guarantee.

Undo requires a **separate explicit local-owner decision**, all writers stopped and no newer active
history. Verify the retained plan/source hash, record grammar/digests and owner scope again. Do not
re-import and call it restore. **If any active journal exists, do not overwrite it**; preserve and
reconcile separately, including a header-only file. For an absent active path only, after explicit
owner approval and original-copy verification, a local owner can use an exclusive copy, for example
Python `open(active, 'xb')` with mode 0600, copy the verified recovery bytes, then compare full bytes and
SHA-256 with the manifest. Never use an overwrite-capable `cp` or restore an unverified/older copy by
accident. A partial/failed manual restore is not success: preserve it, stop, reconcile; no automatic
cleanup is authorized. The synthetic acceptance tests demonstrate `COPYFILE_EXCL` original-byte restore
and refusal to overwrite new history. This release deliberately has **no automated restore command**.
Restoring the original copy reverses clearing and can expose the old IDs again. Retain the recovery
copy and audit afterward. Restart only after reconciliation; fresh-host GET absence was tested.

## 14. Investment assessment artifacts (IID-3) — generate, read, and what must never be inferred

**Dated:** 2026-11-06. Read-only transport, operator-only writes, one new isolated scope per demonstration.

### 14.1 What writes, and what can only read

| Surface | Method | Effect |
|---|---|---|
| `GET|HEAD /api/investment/company/:issuerId` | read | chain head + version history + assessment payload |
| `GET|HEAD /api/investment/company/:issuerId/versions/:reportId` | read | one stored version, inside a validated chain |
| `GET|HEAD /api/investment/coverage` | read | IID-1 identity/coverage disclosure |
| `tsx server/investment/cli/generate-investment-artifacts.ts` | **write** | creates version 1 or appends a version |

There is no mutating route. A `POST`/`PUT`/`PATCH`/`DELETE` to any investment path answers `405` and
`Allow: GET, HEAD` **before** an owner or a store is resolved. If you need a new version, run the CLI; that is
deliberate, because a durable assessment a browser can create is an assessment whose inputs nobody reviewed.

### 14.2 Configure (both required, both fail closed)

```bash
export IIPS_NP04_DATABASE_PATH=/absolute/path/to/governed.db   # IPD's store; IRR opens nothing itself
export IIPS_REPORTS_OWNER_PATH=/absolute/path/to/reports-owner-context.json
```

- Missing database path or an unresolvable NP-04 package ⇒ every investment route answers
  `503 {"error":"investment-persistence-unavailable", ...}` with a **fixed** body. There is no fallback store, no
  cache and no partial data. This is the normal state of a checkout that has not built the package.
- Missing/invalid owner carrier ⇒ `503 {"error":"owner-context-unavailable"}`. No owner is inferred.
- The carrier is the approved canonical bytes; materialise it with the Reports carrier helper (it refuses to write
  inside a Git working tree).

### 14.3 Generate one assessment

```bash
cd frontend
./node_modules/.bin/tsx server/investment/cli/generate-investment-artifacts.ts \
  --issuer IN:EQISIN:IN0000000201 \
  --data-dir /abs/path/to/dataset-snapshot \
  --identity-dir "${IIPS_DATA_DIR}/investment/identity" \
  --generated-at 2026-11-06T00:00:00.000Z \
  --out /abs/path/to/summary.json
```

Add `--dry-run` to stop after validation (no owner, no store, no file). The steps are printed to stderr; the
machine-readable summary goes to stdout (and `--out`). Outcomes: `CREATED` (new chain), `APPENDED` (new version in
the same chain), `UNCHANGED` (identical content to the head — **nothing was written**),
`INPUT_CHANGED_CONTENT_IDENTICAL` (digests differ, content identical — nothing was written).

### 14.4 Read it back, independently

```bash
./node_modules/.bin/tsx server/investment/cli/show-investment-chain.ts \
  --issuer IN:EQISIN:IN0000000201 --version <reportId>   # omit --version for the head
```

Then open `/investment/company/<issuerId>` in the UI. The view shows the chain, the version history, adequacy,
missing values **with reasons**, methods **with withholding reasons**, evidence, `dataAsOf`/`knownAsOf`, model and
dataset identity, and the limitation disclosures.

### 14.5 What must never be inferred from this surface

- **A 503 is not "no data".** It means the read could not be validated. Do not retry into a different store, do not
  read the database directly, and do not treat an empty page as an absent assessment.
- **`UNCHANGED` is evidence, not silence.** It means the submitted content equals the chain head, so nothing was
  written. An operator who expected a new version should check `--generated-at` and the dataset snapshot: content
  identity covers the assessment timestamp (`L-014`).
- **A missing value is a reason, never a zero.** `NOT_REPORTED`, `NOT_COMPUTABLE`, `PRICE_UNAVAILABLE` and friends
  are shown where the number would be. Never substitute a value, and never read an absent dividend/net-debt figure
  as zero (`L-005`, `L-006`).
- **No disposition.** This surface produces assessments. It does not recommend, size, execute or record a trade or
  an order, and no change-intelligence or alert affordance exists on it.
- **Synthetic is synthetic.** If `datasetClass` says `SYNTHETIC_REFERENCE`, the assessment validates the pipeline
  and says nothing about any company (`L-004`, `L-009`). No real issuer has been assessed.
- **Do not repair a chain by hand.** Append-only triggers exist for a reason; a tampered or scope-drifted chain
  fails closed on read (`503 investment-artifact-integrity-failure`). Two heads for one scope are refused rather
  than merged (`L-015`); there is no repair tool yet, so treat it as an incident.
