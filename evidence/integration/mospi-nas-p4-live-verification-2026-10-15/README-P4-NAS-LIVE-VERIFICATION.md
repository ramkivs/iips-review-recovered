# Macro item 1 - P4: live NAS end-to-end verification through the application route

| Field | Value |
|---|---|
| Record | `MOSPI-NAS-P4-LIVE-VERIFICATION-01` |
| Date | 2026-10-15 (UTC) |
| Scope | Macro item 1 only: the NAS leg of live-source E2E (P4). No other workstream is touched. |
| Code under test | IRR `main` = `371fdca1a75617a5d87e41c6b2e3faa76b787714` (PR #107 merge); unchanged throughout this work |
| Procedure | `run-p4-nas-live-verification.ps1` - git blob `10e39fdb2ebbe51eb0bb851a0292d8a56b0bf0f6`, SHA-256 `972f3b0121b204f35e7af5081663e3d9ea402632edc19e1893c8b1320eed5331` (LF bytes as committed) |
| Application code changed | **None** |
| Status | Procedure verified against the current code and executed on real Windows (Windows PowerShell 5.1 and PowerShell 7.6): live P4 **PASS** on GitHub-hosted Windows runners (section 6). **The operator's own run has not happened yet.** This record changes no tracker or governance status. |

## 1. Verified in the repository (current `main`)

| Fact | Evidence |
|---|---|
| P4 request is `GET /api/macro/nas?indicator=GVA`; `GVA` maps to `indicatorCode = 1` (equivalent: `?indicatorCode=1`) | `frontend/server/macro/macro-transport.ts:124-149`, `mospi-source.ts:74-77` |
| Route defaults: `baseYear=2022-23`, `series=Current`, `frequencyCode=Annually` | `macro-transport.ts:52-54` |
| Upstream URL the app builds: `https://api.mospi.gov.in/api/nas/getNASData?base_year=2022-23&series=Current&frequency_code=Annually&indicator_code=1&Format=JSON&limit=100&page=N` | `mospi-source.ts:54,57,656-667`; confirmed byte-for-byte from the running app through a local replay stub's request log (pages 1 and 2, `Accept: application/json`, no `Authorization` header) |
| `10.24.89.9:5000` is **not** used by the application | absent from `frontend/src` and `frontend/server` |
| MoSPI TLS: origin-scoped legacy-connect dispatcher, certificate verification on | `mospi-tls.ts` (`createMospiFetch`) |
| Completeness: pages read sequentially; NAS keeps `deduplicate: true`; HTTP 200 only when retained rows equal the provider-declared `meta_data.totalRecords`, otherwise `502 INCOMPLETE_PAGINATION` | `mospi-source.ts:475-600` |
| Success body shape: `dataset`, `source`, `records`, `pagination{pagesFetched, expectedPages, expectedRecords, actualRecords, recordsRetained, rawRowsReceived, duplicatesSuppressed}`, `provenance{baseYear, indicatorCode, apiContractVersion, retrievalCompleteness}` | `macro-transport.ts:160-166`, `mospi-source.ts:254-273, 588-600`; observed from the real app with the provider structure replayed |
| Failure body: `502 {"error":"macro upstream failure","code":...,"message":...,"dataset":"NAS"}`; on a network failure the message is only `TypeError: fetch failed` (the cause is dropped) | `macro-transport.ts:239-249`, `mospi-source.ts:287-357`; observed from the real app in a sandbox without provider egress |
| Startup: `tsx server/executive-transport.ts`; `EXEC_TRANSPORT_PORT` (default 8787) and `IIPS_DATA_DIR`; the owner-context carrier is not needed for `/api/macro`; `/api/health` answers `{"status":"ok",...}` | `executive-transport.ts:565, 748-758, 856-858, 911-913`; `frontend/package.json` `server:dev` |
| Prerequisites: Node >= 22.6; `npm ci` fetches the pinned IPD tarball from `codeload.github.com`; both repositories are public (no credentials) | `docs/OPERATOR_RUNBOOK.md` section 0; `frontend/package-lock.json`; `gh repo view` |

Provider-side reference (not the application test): on 2026-10-15 the exact upstream page-1 and page-2 URLs returned
HTTP 200 JSON from the public host, `meta_data {"totalRecords":129,"totalPages":2,"recordPerPage":100}`, 129 rows that
are all distinct (no byte-identical rows, so NAS deduplication suppresses nothing).

## 2. Corrections to earlier instructions

1. **NAS access path.** Tracker §16.29.7 / §16.30.6 say NAS needs a network that reaches `10.24.89.9:5000`. The
   application never calls that address; NAS is served as JSON on the public host, and the application retrieved it
   live end to end (section 6).
2. **`mospi-windows-route-verification.ps1` (commit `45d5a76`) is superseded for P4** (the file is not modified). Its P4
   request and error-code list are correct, but it predates `cea06dc`, needs a manually started server on 8787, does
   not pin or record the commit under test, omits the `recordsRetained` / `rawRowsReceived` / page / `baseYear` /
   contract-version checks, is not fail-fast (`$ErrorActionPreference = 'Continue'`), was only grammar-parsed, and its
   summary still says Live E2E `C - BLOCKED`.
3. **Contract version string** is `mospi-esankhyiki-rest-d08-2026-10` (code); the 2026-10-15 live-verification
   record spells it `esankhiki`.
4. **Port.** The procedure uses an isolated port 8788 so that a running dev transport on 8787 cannot answer instead.

## 3. Running it on Windows

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
$dst = Join-Path $env:USERPROFILE 'Downloads\run-p4-nas-live-verification.ps1'
Invoke-WebRequest -UseBasicParsing -OutFile $dst -Uri 'https://raw.githubusercontent.com/ramkivs/iips-review-recovered/<COMMIT>/evidence/integration/mospi-nas-p4-live-verification-2026-10-15/run-p4-nas-live-verification.ps1'
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $dst).Hash -ne '972F3B0121B204F35E7AF5081663E3D9EA402632EDC19E1893C8B1320EED5331') { throw 'Downloaded script does not match the validated bytes - do not run it.' }
powershell -NoProfile -ExecutionPolicy Bypass -File $dst
```

`<COMMIT>` is any commit of this branch that carries the script unchanged (for example `c384a2f`, the validated one).
Optional parameters: `-Port 8790` (if 8788 is busy), `-WorkRoot D:\temp`, `-RequestTimeoutSec 900`, `-KeepCheckout`,
`-ExpectedMainSha <sha>` (only after the criteria are re-verified for a newer `main`).
Typical duration: 1-3 minutes (most of it `npm ci`). Exit code: `0` PASS, `1` FAIL, `2` NOT RUN.
The result file `P4-NAS-RESULT.txt` and `p4-response.json` stay in `%TEMP%\iips-p4-nas-<timestamp>\`.
If a Windows Firewall prompt appears for Node.js it can be cancelled: the test only uses `127.0.0.1`.

## 4. Verdict criteria

Setup gates (any failure gives **NOT RUN**, exit 2): Windows; git, node (>= 22.6), npm present; port free; `main` equals
the expected commit; clone HEAD equals `main`; `npm ci` succeeds; transport answers `/api/health` within 120 s;
pre-check A `GET /api/macro/` gives `404 {"error":"unknown macro dataset","approvedDatasets":["NAS","CPI","IIP"]}`;
pre-check B `GET /api/macro/nas` gives `400 "indicatorCode is required ..."`. The pre-checks never contact the provider.

P4 is **PASS** only if every criterion holds:

| ID | Criterion | Source of the expectation |
|---|---|---|
| C01 | HTTP 200 | `macro-transport.ts:160` |
| C02 | `Content-Type: application/json` | `sendJson` |
| C03 | body is a JSON object | `sendJson` |
| C04 | `dataset = "NAS"` | `macro-transport.ts:161` |
| C05 | `source = "MoSPI"` | `MACRO_SOURCE_ID` |
| C06 | `records` is a non-empty array of objects | live observations exist |
| C07 | `pagination` has the 7 integer counters | `PaginatedResult` (after `cea06dc`) |
| C08 | `expectedRecords = actualRecords = recordsRetained = records.length` | fail-closed completeness |
| C09 | `pagesFetched = expectedPages >= 1` | every provider page read |
| C10 | `rawRowsReceived = recordsRetained + duplicatesSuppressed` | dedup accounting |
| C11 | `provenance.retrievalCompleteness = "COMPLETE"` | `fetchAllPages` |
| C12 | `provenance.indicatorCode = 1` | GVA mapping |
| C13 | `provenance.baseYear = "2022-23"` | route default |
| C14 | `provenance.apiContractVersion = "mospi-esankhyiki-rest-d08-2026-10"` | `MACRO_API_CONTRACT_VERSION` |
| C15 | every record `indicator = "Gross Value Added"` | provider echo of `indicator_code=1` |
| C16 | every record `base_year = "2022-23"` and `series = "Current"` | provider echo of the governed filters |

Not criteria (provider data can be revised): the record count, the body hash, `duplicatesSuppressed`. On 2026-10-15
they were 129 records, 2 pages, 0 suppressed, body SHA-256 `97b313d4c71ae299520ec77877de83473a096c056a455b57407d313789e490f6`
(43,904 bytes); the same hash on the operator machine means byte-identical data.

## 5. Failure classification (printed by the procedure) and authority

| Classification | Resolution | Within existing authority? |
|---|---|---|
| LOCAL (no HTTP response from the transport) | fix the local environment, re-run | yes (operator) |
| DNS (`ENOTFOUND` / `EAI_AGAIN`) | re-run; if persistent fix DNS (`nslookup api.mospi.gov.in`) | yes (operator) |
| TLS INSPECTION (certificate error codes in D1) | set `NODE_EXTRA_CA_CERTS` to the inspection CA, re-run | yes (operator) |
| LOCAL OVERRIDE (resolves to 127.0.0.1/::1) | remove the hosts/DNS override, re-run | yes (operator) |
| NODE-SPECIFIC PATH (.NET reaches the host, Node does not) | read D1; a required proxy is unsupported by the app | proxy support = code change, needs its own authority |
| NETWORK (D1 and D2 both fail) | run from a network with provider access | external dependency |
| THROTTLED / PROVIDER ERROR (429 / 5xx) | wait, re-run | yes |
| PROVIDER REJECTED (4xx) / BODY NOT THE ENVELOPE | D1/D2 show the provider response | route/parameter change = code change, needs authority; HTML = access-path blocker (external) |
| DEDUPLICATION ARTEFACT (`INCOMPLETE_PAGINATION`, suppressed > 0, raw = declared) | NAS call site `deduplicate: false` + tests (same class as CPI fix `cea06dc`) | preparable under the existing D1 implementation authority; merge needs the Program Authority's instruction |
| SHORT PAGE READ / PROVIDER COUNT MISMATCH | re-run; if persistent record a provider finding | provider-side |
| CONTRACT MISMATCH (200, criteria failed) | analyse; C15/C16 only = provider labels changed | analysis first |

## 6. Validation of the procedure itself

1. Grammar parse with `tree-sitter-powershell` 0.26.4: 0 errors (negative control detected).
2. Executed on GitHub-hosted **Windows** runners from this session branch with the workflow kept here as
   `windows-runner-validation-workflow.yml` (inert copy; removed from `.github/workflows`). Each job ran the script
   exactly as an operator would (`-NoProfile -ExecutionPolicy Bypass -File`), cloned `main` itself, and published its
   result file as a check run.

| Run | Commit | Scenario | Host | Result |
|---|---|---|---|---|
| 38770524406 | `1d213e9` | all | 5.1 / 7.6 | **defect found**: pre-check A rejected the correct 404 body (array nesting by `@()`); setup, clone, `npm ci`, startup and cleanup already correct |
| 38771075510 | `2b26a54` | live | 5.1 | **PASS** - 129 records, 2/2 pages, body SHA-256 `97b313d4...` |
| 38771075510 | `2b26a54` | live | 7.6 | FAIL, correctly classified: transient `getaddrinfo ENOTFOUND api.mospi.gov.in` on that runner (D1 and D2) |
| 38771647181 | `c384a2f` | live | Windows PowerShell 5.1.26100 | **PASS** - [check run 116549446622](https://github.com/ramkivs/iips-review-recovered/runs/116549446622): HTTP 200, 129 records, 2/2 pages, raw 129 = retained 129 + suppressed 0, COMPLETE, 2,964 ms |
| 38771647181 | `c384a2f` | live | PowerShell 7.6.6 | **PASS** - [check run 116549639179](https://github.com/ramkivs/iips-review-recovered/runs/116549639179): identical body SHA-256, 3,876 ms |
| 38771647181 | `c384a2f` | provider blocked (hosts file) | 5.1 | **FAIL** (exit 1) as designed - [check run 116550333394](https://github.com/ramkivs/iips-review-recovered/runs/116550333394): D0 `127.0.0.1`, D1 `ECONNREFUSED`, classified LOCAL OVERRIDE |
| 38771647181 | `c384a2f` | port 8788 occupied | 5.1 | **NOT RUN** (exit 2) as designed - [check run 116550339329](https://github.com/ramkivs/iips-review-recovered/runs/116550339329) |

In every run the cleanup stopped the server tree (`taskkill` exit 0), released the port, restored the environment
variables and deleted the temporary clone. Node 22.23.3, npm 10.9.9, git 2.56.0.windows.2.

Limits: the runners are GitHub's machines and network, not the operator's. The runner PASS is genuine live output of
the application route, but it does not stand in for the operator-machine run that the tracker's evidence model uses.

## 7. What still requires the operator's machine

- Run section 3 on the operator's Windows machine and keep `P4-NAS-RESULT.txt` (plus `p4-response.json`).
- Recording the result and moving the live-source E2E state in the tracker is a separate act after that run.
