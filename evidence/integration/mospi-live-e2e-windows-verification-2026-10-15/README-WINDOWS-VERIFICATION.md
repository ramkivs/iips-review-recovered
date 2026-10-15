# Prepared Windows verification — MoSPI CPI / IIP / NAS application routes

| Field | Value |
|---|---|
| Record ID | `MOSPI-WINDOWS-ROUTE-VERIFICATION-PREP-01` |
| Date | `2026-10-15` (UTC) |
| Mode | **Read-only repository inspection and test preparation.** No implementation authority is granted or exercised; no application code, configuration, endpoint selection or governance record is changed by this preparation. |
| Deliverable | `mospi-windows-route-verification.ps1` — one paste-ready Windows PowerShell block that exercises the application's own Macro routes and writes a single text report. |
| Companion evidence | `CONTRACT-ASSERTION-VALIDATION-2026-10-15.txt` (+ `validate-route-contracts.ts`), `POWERSHELL-SYNTAX-VALIDATION-2026-10-15.txt` (+ `validate-powershell-syntax.mjs`) |
| Governance | CV-53 remains `D89 display-contract scope only`; live NAS/CPI/IIP E2E remains `C — BLOCKED`; D91 V-C5, the API-client residuals (upstream envelope `code` passthrough; environment-supplied `baseUrl`) and attribution/licensing remain **separate open matters**. This preparation changes none of them. |

---

## 1. Source files and tests that establish each application route

| Fact | Established by |
|---|---|
| Macro namespace = `/api/macro/` | `frontend/server/macro/macro-transport.ts:39` (`MACRO_ROUTE_PREFIX`) |
| Dataset paths are matched **exactly** and case-insensitively, allow-list `NAS` / `CPI` / `IIP` | `macro-transport.ts:70-77` — `/^\/api\/macro\/([A-Za-z]+)$/` + `APPROVED_DATASETS`; near-miss paths (`/api/macro/wpi`, `/api/macro/nasEVIL`, trailing slash) → `404` |
| Method guard: `GET` / `HEAD` only; anything else `405` | `macro-transport.ts:96-104` |
| The routes are reachable on the local transport | `frontend/server/executive-transport.ts:750-755` — `if (req.url?.startsWith('/api/macro/'))` → `handleMacroRequest(req, res)` |
| NAS handler, required explicit indicator | `macro-transport.ts:118-172` (`indicatorCode=<int>` or `indicator=GVA|GDP`; missing/unknown → `400`) |
| IIP handler, two modes | `macro-transport.ts:174-215` — no `subcategoryCode` ⇒ metadata-only `200`; with `subcategoryCode` ⇒ observations `200` |
| CPI handler | `macro-transport.ts:217-232` |
| The `502` wrapper and its `code`/`message`/`dataset` fields | `macro-transport.ts:222-229` |
| Defaults used when a query parameter is omitted | `macro-transport.ts:44-52` — NAS `baseYear 2022-23` / `series Current` / `frequencyCode Annually`; IIP `baseYear 2022-23` / `frequency Annually`; CPI `baseYear 2012` / `series Current` |
| Typed client mirror of the same routes and the 200-shape interfaces | `frontend/src/api/macro.ts:35-39` (`MACRO_ROUTE`), `:60-84` (`MacroResponse`, `MacroIipResponse`) |
| The transport never sends credentials | `frontend/src/core/network/noAuthFetch.ts:13-14` (deletes `authorization`); `macro-transport.ts:264-275` (no `Authorization` header is ever constructed) |
| Route behaviour test contract (14 tests) | `frontend/server/macro/macro-transport.test.ts` — `200` + `records`; metadata-only `selection` with `records: []`; `400` / `404` / `405`; `502` with **no** `records` field |
| Observation/pagination semantics (36 tests) | `frontend/server/macro/mospi-source.test.ts` — complete pagination with short-read refusal, the governed IIP subcategory pattern, terminal-4xx vs retryable behaviour |
| Documented route table for operators | `docs/OPERATOR_RUNBOOK.md` §5.1; closest health route `/api/health` (`executive-transport.ts:856-857`) |
| Established success condition ("shortest proof") | Tracker `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.17.6 item 4: `curl 'localhost:8787/api/macro/cpi'` → `200` with `records` and `pagination.expectedRecords == actualRecords` |
| Prior live-failure evidence for these same routes | Tracker §16.17.2 (`V22`), §16.17.3; `docs/integration/CV-53-D89-MACRO-PRODUCT-ACCEPTANCE-RECORD-2026-10-15.md` §3–§4 |

## 2. Verified route mapping

| # | Dataset | Application route exercised by the script | Required parameters | Omitted-parameter defaults (applied by the route) | 200 response contract |
|---|---|---|---|---|---|
| P0 | — | `GET /api/health` | none | — | `{"status":"ok","transport":"program-v3.0 executive (dev)"}` |
| P1 | **CPI** | `GET /api/macro/cpi` | none | `baseYear=2012`, `series=Current` | `dataset` `CPI`, `source` `MoSPI`, `records[]`, `pagination{pagesFetched,expectedPages,expectedRecords,actualRecords,duplicatesSuppressed}`, `provenance{baseYear,apiContractVersion,retrievalCompleteness:'COMPLETE'}` |
| P2 | **IIP** (enumeration) | `GET /api/macro/iip` | none | `baseYear=2022-23`, `frequency=Annually` | `dataset` `IIP`, `source` `MoSPI`, `selection{baseYear,frequency,type:'Sectoral',categoryCode,categoryName:'Manufacturing',subcategoryCodes[]}`, `records: []` — **no `pagination`, no `provenance`** |
| P3 | **IIP** (observations) | `GET /api/macro/iip?subcategoryCode=<code returned by P2>` | `subcategoryCode` from the P2 response | `baseYear=2022-23`, `frequency=Annually` | `dataset`, `source`, `selection`, `records[]` (≥1), `pagination{…}`, `provenance{baseYear,categoryCode,subcategoryCode,apiContractVersion,retrievalCompleteness:'COMPLETE'}` |
| P4 | **NAS** | `GET /api/macro/nas?indicator=GVA` | `indicator` (`GVA`\|`GDP`) **or** `indicatorCode` (`1`\|`5`) — explicit is mandatory | `baseYear=2022-23`, `series=Current`, `frequencyCode=Annually` | `dataset` `NAS`, `source` `MoSPI`, `records[]`, `pagination{…}`, `provenance{baseYear,indicatorCode,apiContractVersion,retrievalCompleteness:'COMPLETE'}` |

**Headers:** none required. The scripts send only `Accept: application/json`. No credential, token or `Authorization` header is read, sent or printed.

**Error contracts the script recognises** (all JSON, no HTML): `400` `{"error":…}` (missing/unknown NAS indicator, non-integer `indicatorCode`); `404` `{"error":"unknown macro dataset","approvedDatasets":["NAS","CPI","IIP"]}`; `405` `{"error":"method not allowed; /api/macro is read-only"}`; `502` `{"error":"macro upstream failure","code":<taxonomy>,"message":…,"dataset":…}`; `500` `{"error":"macro transport error",…}`.

**Configurability of the provider URL (question 8).** The adapter exposes a `baseUrl` seam (`frontend/server/macro/mospi-source.ts:150-151`, `MospiSourceConfig`), but the runtime does **not** supply it: `executive-transport.ts:752` calls `handleMacroRequest(req, res)` **without** `deps`, and nothing in the macro chain reads an environment variable. The provider base URL is therefore **not configurable without an application change** — that change is the already-fenced residual (tracker §16.17.4 item 2 / gate acceptance item `V-C6`) and is **not** made, attempted or worked around here. The script tests the compiled-in base URL only.

## 3. Prerequisites (all mandatory)

1. **The application transport must already be running.** This script never starts a service and never edits configuration. Exact existing startup command (`docs/OPERATOR_RUNBOOK.md` §3; `frontend/package.json` → `"server:dev": "tsx server/executive-transport.ts"`):
   ```
   cd <repository>\frontend
   npm run server:dev
   ```
   Expected output: `Executive transport listening on :8787`.
   First-time machines also need `npm ci` (runbook §1). The owner-context carrier (`IIPS_OWNER_CONTEXT_PATH`) is **not** required for the Macro routes — it only affects owner-scoped surfaces.
2. **Port 8787** (the transport default, `executive-transport.ts:565` → `Number(process.env.EXEC_TRANSPORT_PORT ?? 8787)`). If the transport was started with a different `EXEC_TRANSPORT_PORT`, edit `$BaseUrl` at the top of the script to match. The UI's Vite dev server (`npm run dev`, port `5173`) proxies `/api` → `http://localhost:8787` (`vite.config.ts:13-15`), so `-BaseUrl http://localhost:5173` in the underlying variable verifies the same routes through the proxy path.
3. **`curl.exe`** present (Windows 10 1803+ ships it). The script checks this first and stops with a clear message if absent. Note: in Windows PowerShell, bare `curl` is an alias for `Invoke-WebRequest`; the script always calls `curl.exe` explicitly.
4. **Provider egress from this machine** for a `VERIFIED_SUCCESS` result on any dataset. Without it the routes answer `502 RETRY_BUDGET_EXHAUSTED` — which is the diagnosed Arena condition and is reported as `HTTP_FAILURE`, never as success.
5. Windows PowerShell **5.1 or 7.x** — the script avoids version-specific cmdlets (`-SkipHttpErrorCheck`, `-StatusCodeVariable`, `-UseBasicParsing` are not used).

## 4. Success criteria and report location

Per route, in this order: no HTTP response ⇒ `CONNECTION_REFUSED` / `CONNECTION_TIMEOUT` / `TLS_FAILED` / `EMPTY_REPLY` / `NO_HTTP_RESPONSE`; body or content-type is HTML ⇒ `HTML_MASQUERADE`; non-`200` ⇒ `HTTP_FAILURE` (with the application `code` and its meaning); `200` whose body is not JSON ⇒ `INVALID_JSON`; `200` JSON failing any structural check ⇒ `INVALID_RESPONSE_CONTRACT`; all checks pass with zero records ⇒ `SUCCESS_NO_OBSERVATIONS`; all checks pass with records ⇒ `VERIFIED_SUCCESS`.

| Route | Checks that must all pass for `VERIFIED_SUCCESS` |
|---|---|
| P1 CPI | `200`; content-type JSON; parses as JSON; `dataset=CPI`; `source=MoSPI`; `records` is a list; `pagination` present; `pagination.expectedRecords == pagination.actualRecords` (the tracker's established condition); `actualRecords == records count`; `provenance.retrievalCompleteness=COMPLETE`; `records ≥ 1` |
| P2 IIP enumeration | `200`; JSON; `dataset=IIP`; `source=MoSPI`; `selection` present; `selection.type=Sectoral`; `selection.categoryName=Manufacturing`; `selection.categoryCode` present and not `12`/`13`/`14`; `subcategoryCodes` non-empty and every code matching `^\d{4,}-\d{3,}$`; `records` empty (metadata-only contract) |
| P3 IIP observations | `200`; JSON; `dataset=IIP`; `records` list; `pagination` present; `expectedRecords == actualRecords == records count`; `provenance.subcategoryCode` echoes the requested code; `provenance.retrievalCompleteness=COMPLETE`; `selection.categoryName=Manufacturing`; `records ≥ 1` |
| P4 NAS | `200`; JSON; `dataset=NAS`; `source=MoSPI`; `records` list; `pagination` present; `expectedRecords == actualRecords == records count`; `provenance.indicatorCode=1` (for `indicator=GVA`); `provenance.retrievalCompleteness=COMPLETE`; `records ≥ 1` |

**Report location:** one timestamped text file, printed on screen in full *and* written to
`%TEMP%\mospi-macro-windows-verification-<yyyyMMdd-HHmmss>.txt` (the script prints the exact path at the end; it writes nothing into the repository). Copy the whole file back to the conversation.

**Interpretation rule:** only a `VERIFIED_SUCCESS` line constitutes application-level live retrieval for that dataset. A `502` with `code: RETRY_BUDGET_EXHAUSTED` means *this machine* could not complete the upstream request — not that the provider rejected the request. A `502` with `INDICATOR_NOT_GOVERNED` / `FILTER_CONTRACT_VIOLATION` is a governance refusal by design.

## 5. Ambiguities and traps that the script is built to avoid

1. **The runbook's illustrative IIP code is not a valid governed code.** `docs/OPERATOR_RUNBOOK.md` §5.1 shows `GET "/api/macro/iip?subcategoryCode=2100-01"`, but the enforced pattern is `IIP_SUBCATEGORY_CODE_PATTERN = /^\d{4,}-\d{3,}$/` (`mospi-source.ts:114`) — `2100-01` has a two-digit suffix and is **rejected**, producing `502 FILTER_CONTRACT_VIOLATION`. Re-executed here against the application's own query builder:
   `2100-01` → REJECTED · `1210` → REJECTED · `022011-1210` → ACCEPTED · `022011-1232` → ACCEPTED.
   The script therefore **never hard-codes a code**: P3 uses the first code returned by P2's live runtime enumeration.
2. **The application's IIP route is not the documented provider route.** The build calls `/api/iip/getIipData` (+ `/api/iip/getIipFilter`); the documented/spec route is `/api/iip/getIIPMonthly`. The supplied Windows success therefore proves the *documented* route, not the *implemented* one — P2/P3 answer that question, and Arena cannot (its egress proxy resets MoSPI TLS). Unresolved until this script runs on a machine with provider egress.
3. **`meta_data` is mandatory for the observation routes.** `fetchAllPages` refuses any envelope lacking numeric `meta_data.totalPages` / `totalRecords` (`mospi-source.ts:424-429`). Consequence: a `200` from the provider can still surface as `502 INCOMPLETE_PAGINATION`. The script reads the `code`, so the two conditions are distinguishable.
4. **NAS has an access-path question that this script cannot settle.** The application calls the public route `/api/nas/getNASData`; the official NAS spec advertises a **private** server (`10.24.89.9:5000`), which is unreachable from Windows and Arena and appears nowhere in the repository history (0 occurrences across 610 commits / 122 refs). If P4 returns `502 RETRY_BUDGET_EXHAUSTED` **while P1 succeeds**, the conclusion is that NAS is not served on the same public path — an access-path/authority question, not a code defect. No alternative NAS URL is invented here.
5. **`records` field naming is passed through unchanged.** The route returns upstream records verbatim (e.g. CPI `baseyear`/`subgroup`/`inflation` vs the declared `CpiRecord` `base_year`/`sub_group`/`inflation_rate`). The script validates the *envelope* contract and shows the record keys in the bounded preview; per-field consumer naming is a separate, non-blocking matter it does not adjudicate.
6. **The default IIP base year (`2022-23`) is the app default, not the Windows-tested one (`2011-12`).** Because IIP codes are not portable across base years, the script always resolves them from the live enumeration for whatever base year is in force. Changing the base year is possible through the route's verified `baseYear` parameter but is not needed for the prepared test.

No ambiguity above blocks the test: each one either is answered by the report itself or is reported explicitly alongside the outcome.

## 6. How this preparation was checked here (and its limits)

| Check | Method | Result |
|---|---|---|
| Every route, parameter and default used by the script exists in the repository | direct source inspection at `HEAD` (`bcbf344` + this branch's evidence commit) | recorded in §1–§2 with file:line citations |
| The script's structural assertions match the **real** response contract | `validate-route-contracts.ts` drives the actual `handleMacroRequest` with an injected stub fetch — genuinely 200 CPI / NAS / IIP-metadata / IIP-observation bodies — and runs the same assertion set; plus a negative control for the upstream-unreachable `502` shape | `CONTRACT-ASSERTION-VALIDATION-2026-10-15.txt`: all assertions PASS on the real contract; the `502` classifies as `HTTP_FAILURE` with `code=RETRY_BUDGET_EXHAUSTED` and no `records` field |
| The PowerShell parses under a real PowerShell grammar | `tree-sitter-powershell@0.26.4` (prebuilt wasm) via `web-tree-sitter@0.27.1`; negative control included | `POWERSHELL-SYNTAX-VALIDATION-2026-10-15.txt`: 488 lines, **0** `ERROR`/`MISSING` nodes (negative control produced 2, so the validator is live) |
| **Not** verified | The script was **not executed**: no PowerShell runtime exists in this environment, and the live paths cannot be exercised from Arena (MoSPI TLS reset, no provider egress). Execution semantics — including the exact `curl.exe` exit codes and `Invoke-WebRequest`-free string handling on Windows PowerShell 5.1 — remain to be confirmed by the run itself. | — |

## 7. Scope accounting

- **No application change.** The session delta is this directory only: the prepared `.ps1`, this README, two validation harnesses and their transcripts. No file under `frontend/` was modified (`git status` for a clean tree at run time); the harnesses import the existing modules read-only.
- **No configuration change, no endpoint change, no provider-URL change, no workaround.** `MospiSourceConfig.baseUrl` remains unreachable at runtime exactly as recorded; the fenced residuals are untouched.
- **No governance movement.** CV-53 stays D89 display-contract only; live NAS/CPI/IIP E2E stays `C — BLOCKED`; D91 V-C5, the API-client residuals and attribution/licensing stay open; no qualification, admission, entitlement, M-3, production or legal position is claimed or changed.
- **Read-only by construction.** Only `GET` requests are issued, no credentials are used or printed, and the report is written outside the repository.
