# MoSPI live E2E — evidence reconciliation and runtime connectivity investigation

| Field | Value |
|---|---|
| Record ID | `MOSPI-LIVE-E2E-EVIDENCE-RECONCILIATION-01` |
| Date | `2026-10-15` (UTC) |
| Mode | **Investigation and verification only.** No implementation, configuration, endpoint-selection, governance or production change was made or is authorized by this record. |
| Subject | Reconciliation of newly supplied Windows connectivity evidence with the existing Arena HTTP `502` / live-E2E `C — BLOCKED` finding for MoSPI **NAS**, **CPI**, **IIP**. |
| Investigation environment | Arena E2B sandbox `ivxm4mj6e8weaqgtb0on0` (template `mn0k6lgvyo6q8utbj8jh`), Node `v22.22.3`, curl `7.88.1` / OpenSSL `3.0.20`, branch `arena/6e32d517-iips-review-recovered` @ `bcbf344d2f6878cbd708be994e147969c3397d23` (= `origin/main` at investigation time). |
| Evidence produced | `ARENA-EGRESS-AND-ROUTE-PROBE-TRANSCRIPT-2026-10-15.txt` (+ `run-arena-egress-probes.sh`, `arena-egress-probe.mjs`), `REPOSITORY-ROUTE-AND-CODE-VERIFICATION-2026-10-15.txt` (+ `run-repository-verification.sh`), this report. |
| Authority | Investigation/verification only. Existing governance boundaries stand unchanged: CV-53 is accepted **for D89 display-contract scope only**; live NAS/CPI/IIP E2E remains `C — BLOCKED`; D91 V-C5, the API-client residuals and attribution/licensing remain **separate open matters**. |
| Disposition | **Live E2E remains `C — BLOCKED`.** See §9. |

Labels used throughout: `CONFIRMED` · `NOT REPRODUCED` · `HYPOTHESIS` · `UNRESOLVED` · `BLOCKED`.

---

## 1. Executive finding

**What the new evidence changes.**

1. **CONFIRMED — the Arena `502` is not, and never was, evidence about MoSPI.** The `502` is generated *inside the IRR application* by `frontend/server/macro/macro-transport.ts:223` (`{"error":"macro upstream failure","code":…,"dataset":…}`). No upstream HTTP response exists in that exchange — no upstream status, headers or body was ever received. Reading the Arena `502` as "the provider rejected/failed the request" is therefore **contradicted**; reading it as "the public API is universally unreachable" is **contradicted** by the Windows evidence.
2. **CONFIRMED — Arena cannot reach any MoSPI host at all, and the reason is structural, not transient.** DNS resolves (`api.mospi.gov.in → 103.210.93.23`); the TCP connection is established/intercepted; the **TLS handshake is reset** (`ECONNRESET` / `SSL_ERROR_SYSCALL`, whole attempt ≈ 5–250 ms). Not one HTTP request byte leaves the sandbox. This affects *every* MoSPI hostname tested, *every* route, and the OpenAPI spec files as well — so **route correctness, authentication behaviour and response content cannot be evaluated from Arena at all** for any MoSPI dataset. The mechanism is the platform's TLS-intercepting egress proxy (`O=E2B; CN=E2B Proxy CA`, present in the system trust bundle) which transparently serves allow-listed hosts (`github.com`, `registry.npmjs.org`, `codeload.github.com`) and resets everything else.
3. **CONFIRMED — the Windows CPI result validates the route the application actually uses.** The supplied Windows request `GET https://api.mospi.gov.in/api/cpi/getCPIIndex?base_year=2012&series=Current&state_code=99&Format=JSON&page=1` is the **same host and the same path** as `DATA_ENDPOINT.CPI` in the implementation, and returned HTTP `200` + JSON with real observations, unauthenticated. For CPI, "Arena 502" and "Windows 200 + JSON" are **not in conflict**: they are different environments, and Arena's failure occurs before any request is sent.
4. **UNRESOLVED — the IIP route the application uses is not the route the supplied Windows test exercised.** The implementation calls `/api/iip/getIipData` (+ `/api/iip/getIipFilter`); the specification cited in the task documents `/api/iip/getIIPMonthly` / `/api/iip/getIIPAnnual`; the Windows test used `/api/iip/getIIPMonthly`. Neither `/api/iip/getIIPMonthly` nor `/api/iip/getIIPAnnual` has **ever** appeared in this repository (0 commits in 610, 122 refs). The Windows `200` therefore proves the *documented* route works — it does **not** prove the *implemented* route works, and Arena cannot test it.
5. **UNRESOLVED — and materially re-framed — NAS.** `10.24.89.9` and `:5000` appear **nowhere** in this repository or in any of its 610 commits / 122 refs: **the application never calls the private address.** All three datasets — including NAS — are requested from the single public base `https://api.mospi.gov.in`; the designated NAS route is `/api/nas/getNASData`. The Windows NAS test therefore exercised an address the application does not use, and that address is also unreachable from Arena (routed to the default gateway, blackholed — a 5–8 s timeout, a *different* failure mechanism from the public-host reset). **The NAS URL the application actually calls has never been tested in any environment in evidence here.**
6. **Consequence.** The blocker is no longer correctly described as "Arena has no egress, therefore nothing can be concluded". It is now precisely: *one environment has provider egress (Windows) and has proven CPI and the documented IIP route; a second environment (Arena) has no MoSPI egress by platform policy and can never prove any of them; and the three datasets now have three different evidence states (CPI: route validated; IIP: route divergence; NAS: access path untested and possibly internal-only).*

**Contradicted:** "all MoSPI connectivity fails because the public API is unreachable". **Established:** the public CPI host/path returns real JSON from at least one environment, and no environment has yet demonstrated the application's own end-to-end live retrieval.

---

## 2. Existing Arena failure reconciliation (Step A)

### 2.1 What was attempted, and what came back

At this head, the IRR transport was started on `:8799` (`EXEC_TRANSPORT_PORT=8799 npm run server:dev`) and the live `/api/macro/*` routes were probed. This reproduces the previously recorded `V22` result exactly:

```text
GET /api/macro/cpi           → HTTP 502  {"error":"macro upstream failure","code":"RETRY_BUDGET_EXHAUSTED",
                                          "message":"request failed after 4 attempt(s): TypeError: fetch failed","dataset":"CPI"}
GET /api/macro/iip           → HTTP 502  {… "dataset":"IIP"}
GET /api/macro/nas?indicator=GVA → HTTP 502  {… "dataset":"NAS"}
```

| Question (Step A) | Finding | Label |
|---|---|---|
| Exact URLs Arena attempted | Base `https://api.mospi.gov.in` + `DATA_ENDPOINT`: NAS `/api/nas/getNASData`, CPI `/api/cpi/getCPIIndex`, IIP `/api/iip/getIipData` (+ `/api/iip/getIipFilter` runtime enumeration), with the governed query parameters (`Format=JSON`, `limit`, `page`, plus `base_year`/`series`/`frequency_code`/`indicator_code`/`type`/`category_code`/`subcategory_code` as applicable). | `CONFIRMED` |
| HTTP status and bodies at the app boundary | `502`, JSON wrapper bodies quoted above; zero observations; fail-closed. | `CONFIRMED` |
| Failure layer | **TLS handshake, before any HTTP request is sent.** `curl -v`: `Connected to api.mospi.gov.in (103.210.93.23) port 443` → `OpenSSL SSL_connect: SSL_ERROR_SYSCALL` → `http=000`, `size=0`, `total≈0.03 s`. Node/undici cause chain: `TypeError: fetch failed <= Error: Client network socket disconnected before secure TLS connection was established [code=ECONNRESET]`. DNS resolution succeeds; TCP connect is reached; **no** HTTP status, header or body is ever produced. | `CONFIRMED` |
| Source of the `502` | **Application wrapper**, `frontend/server/macro/macro-transport.ts:223` (`sendJson(res, 502, {error:'macro upstream failure', code: err.code, message: err.message, dataset})`). The `code` is the transport taxonomy value (`RETRY_BUDGET_EXHAUSTED`, `TIMEOUT`, `REQUEST_FAILED`, `RATE_LIMITED`, `INVALID_RESPONSE`, `INCOMPLETE_PAGINATION`, …). It is **not** an upstream status, a proxy error page, or a gateway error — no proxy/gateway identifier exists in the exchange because no HTTP exchange occurred. | `CONFIRMED` |
| Environment/runtime | Arena E2B sandbox (see header). Egress is mediated by a TLS-intercepting proxy: allow-listed hosts receive a certificate `subject: O=E2B; CN=github.com`, `issuer: O=E2B; CN=E2B Proxy CA` (CA present in `/etc/ssl/certs/ca-certificates.crt`); non-allow-listed hosts are reset. No `http_proxy`/`https_proxy` is set, and no alternate proxy, namespace or network path is available. | `CONFIRMED` |
| Did the three datasets fail the same way? | **Inside Arena, yes** — identical wrapper code and identical underlying failure, because all three share one base URL and one transport. **Across environments, no** — see §3–§5: CPI is proven reachable elsewhere, IIP's implemented route is unproven, and NAS has an untested/possibly-internal access path. A single shared root cause must not be assumed. | `CONFIRMED` |

### 2.2 Negative controls run in the same session (so the block is isolated to the provider domain)

| Target | Result | Meaning |
|---|---|---|
| `https://github.com/` (curl) | `200` in 0.46 s | sandbox egress works |
| `https://registry.npmjs.org/` (curl) | `200` in 0.06 s | sandbox egress works |
| `https://github.com/` (Node `fetch`, default trust) | `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | interception is real; Node needs `NODE_EXTRA_CA_CERTS` (documented in runbook §0) |
| `https://api.mospi.gov.in/…` (all routes, both documented and implemented) | `000` / `ECONNRESET` (≈5–250 ms) | **structural deny**, not congestion |
| `https://api.mospi.gov.in/layout/swagger_user_nas.yaml` | `000` / `ECONNRESET` | even the authoritative specs cannot be fetched from Arena |
| `https://www.mospi.gov.in/`, `https://mospi.gov.in/` | `000`, exit 35 | the whole MoSPI domain family is outside the allow-list |
| `http://10.24.89.9:5000/…` | no TCP connection in 8 s; `curl` exit 28, `total=5.00 s`, `remote_ip` empty | private address is **blackholed** (routed to the default gateway `169.254.0.22`, no response) — a different mechanism from the TLS reset |

This confirms the pre-existing record `NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT-01` §14 (Arena `ECONNRESET`, TCP connects / TLS fails, control host succeeds, multiple MoSPI hostnames fail, CA configuration does not change the result) and adds the mechanism and its determinism.

---

## 3. CPI result (Step B)

| | Windows (supplied evidence) | Arena (this session) |
|---|---|---|
| URL | `https://api.mospi.gov.in/api/cpi/getCPIIndex?base_year=2012&series=Current&state_code=99&Format=JSON&page=1` | Same host+path as the implementation's `DATA_ENDPOINT.CPI`; tested with the documented parameters **and** with the implementation's own governed parameters (`Format=JSON&limit=1&page=1`) |
| Connection outcome | completed | TCP intercepted; **TLS reset** (`ECONNRESET`), attempt ≈ 0.03 s |
| HTTP status | `200` | **none — no HTTP response received** (`000`) |
| Content type / body | `application/json; charset=utf-8`; JSON `data[]` with real observations (Dec-2025 CPI records shown) | no bytes |
| Valid expected structure? | JSON parsed; records contain the expected index/inflation fields | not evaluable |
| Differs from Windows evidence? | — | **Yes, and the difference is environmental, not provider-side.** Arena's failure precedes the request; the Windows result therefore stands unchallenged. |

**Reconciliation:** the new CPI evidence **corrects** the earlier, over-broad reading. The public CPI host and this documented GET route are demonstrably usable without a token from the tested Windows network. For CPI the implementation's declared route is validated; what Arena cannot contribute is any statement about it (positive or negative).

**HYPOTHESIS (not a cause of the `502`, and not verifiable from Arena).** Three live-payload details could still cause a *post-200* fail-closed result when the app is run where egress exists, and none is settled by the supplied excerpt:

1. `fetchAllPages` fails closed with `INCOMPLETE_PAGINATION` unless `meta_data.totalPages` and `meta_data.totalRecords` are present **as numbers** (`mospi-source.ts:424-429`). The Windows excerpt shows `data[]` but no `meta_data` (the excerpt is explicitly not the complete response).
2. The declared `CpiRecord` field names (`base_year`, `sub_group`, `inflation_rate`, `series`) do not match the observed live keys (`baseyear`, `subgroup`, `inflation`; no `series`). Records are passed through untransformed, so this is a consumer/typing divergence, not a crash.
3. The implementation sends `limit=100`, an unauthenticated posture the recorded basis describes as returning "only the first 10 records per request"; multi-page completeness (and the `maxPages: 500` ceiling) is therefore still untested against the live service.

---

## 4. IIP result (Step B)

| | Windows (supplied evidence) | Arena (this session) |
|---|---|---|
| Documented route tested | `https://api.mospi.gov.in/api/iip/getIIPMonthly?base_year=2011-12&type=General&Format=JSON&page=1` → `200`, `application/json`, real records | Same URL → `ECONNRESET`, no HTTP response |
| Route the application uses | **not tested in any supplied evidence** | `https://api.mospi.gov.in/api/iip/getIipData?…&type=Sectoral&category_code=2&subcategory_code=022011-1210&Format=JSON&limit=1&page=1` → `ECONNRESET`, no HTTP response; likewise `/api/iip/getIipFilter` |
| HTTP status | `200` (documented route) | none |
| Valid expected structure? | JSON parsed; keys `base_year, year, type, category, sub_category, index, growth_rate` | not evaluable |
| Differs from Windows? | — | **Route-level divergence is a new finding; environment-level difference is as stated.** |

**Finding (`CONFIRMED`):** `/api/iip/getIIPMonthly` and `/api/iip/getIIPAnnual` have **never existed in this repository** (`git log --all -S …` = 0 commits each), while `/api/iip/getIipData` appears in the committed implementation and `/api/iip/getIipFilter` in the designation act and implementation. So the supplied Windows success is **not** evidence about the implemented IIP route. Note however that the declared `IipRecord` fields match the supplied live IIP payload keys exactly — consistent with the implementation's shape having been derived from a similar live route family, but that is corroboration only, not proof.

**UNRESOLVED:** whether `/api/iip/getIipData` and `/api/iip/getIipFilter` are currently served by the public host, and whether their envelope carries the `meta_data` the transport requires. Arena cannot test either (TLS reset). A spec-only route name would not necessarily be the correct one — the repository's own `IIP_SUBCATEGORY_CODE_PATTERN` comment records that the stale Swagger contract was already found wrong once for IIP.

---

## 5. NAS result (Step C)

### 5.1 Does the application call `10.24.89.9:5000`?

**No — `CONFIRMED`, on repository-wide and history-wide evidence.**

- `git log --all -S "10.24.89.9"` → **0**; `-S "10.24"` → **0**; `-S ":5000"` → **0**; a `git grep` sweep across all 122 refs/610 commits returns nothing. The clone was un-shallowed before these searches (`--is-shallow-repository` = `false`), so the negative result covers full history, not a shallow window.
- The implementation's single base URL is `MOSPI_REST_BASE_URL = 'https://api.mospi.gov.in'` (`mospi-source.ts:54`), used for **all three** datasets; `DATA_ENDPOINT.NAS = '/api/nas/getNASData'` (`:57`). The same route is recorded as the designated Source/API identity in `NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT-01` §10.
- Therefore the Windows NAS test (`http://10.24.89.9:5000/api/nas/getNASData…` → TCP failed, ping failed, HTTP `000`, 5 s and 15 s timeouts) exercised a URL the application does not use.

### 5.2 Is the advertised private server relevant to the application's NAS path?

It is relevant as **a signal that NAS may sit on a different access path from CPI/IIP**, and it is the only NAS server address in authoritative evidence supplied here. It is **not** the address the application uses. The two facts must not be conflated in either direction:

- A TCP timeout on `10.24.89.9:5000` says nothing about `/api/nas/getNASData` on the public host (no HTTP response was received, so route validity, auth and content are all untested there).
- A working CPI/IIP on the public host says nothing about NAS being served there.

### 5.3 Is there an existing public gateway, proxy, mirror or alternative NAS endpoint?

**No — `CONFIRMED` (absence established on repository evidence).** No public gateway/proxy/mirror/tunnel for MoSPI appears in the repository; no alternative NAS host or route is documented in any act, runbook entry or evidence file; the runbook's troubleshooting row names only `api.mospi.gov.in:443`. Arena's own network offers no proxy configuration path either (`http_proxy`/`https_proxy` unset; the platform proxy is not operator-configurable).

### 5.4 Is there a supported server-configuration mechanism?

**A seam exists; it is not reachable at runtime — `CONFIRMED`.** `MospiSourceConfig` (`mospi-source.ts:150-151`) accepts `baseUrl` (plus `timeoutMs`, `maxRetries`, `pageSize`), but `executive-transport.ts:752` calls `handleMacroRequest(req, res)` **without `deps`**, and nothing in the macro chain reads an environment variable. This is already recorded as an open, fenced item (tracker §16.17.4 / §16.19.6, acceptance item `V-C6`); it is **not** a workaround this record may use, and this record does not implement it. **No server address was replaced and no workaround was created.**

### 5.5 What is the NAS failure actually caused by?

| Candidate cause | Evidence | Label |
|---|---|---|
| Unreachable private server | Windows: TCP + ping fail, HTTP `000`. Arena: blackholed, no connection in 5–8 s. | `CONFIRMED` (for that address) |
| Wrong/undocumented host for the implemented route | The implemented NAS host+path combination has never been tested in any evidence here; the authoritative NAS spec advertises a *different, private* server. | `UNRESOLVED` |
| Absent route on the public host | Not testable from Arena (TLS reset) and not covered by the supplied Windows test. | `UNRESOLVED` |
| Proxy restriction | Arena's restriction is demonstrable but is an Arena property; it does not explain the Windows result and it blocks *all* MoSPI routes equally, including ones that work from Windows. | `CONFIRMED` as an Arena-only layer |
| Application defect | The transport, route, boundary and fail-closed behaviour are verified by 56/56 tests (re-run this session) and the wrapper correctly reports an upstream failure; nothing here evidences a NAS-specific code defect. | `NOT REPRODUCED` |

---

## 6. Root-cause classification (Step D comparison)

| Dataset | Windows evidence supplied here | Arena evidence (this session) | Conclusion |
|---|---|---|---|
| **CPI** | HTTP `200`; `application/json`; real observations; no bearer token supplied | TCP intercepted, **TLS reset before any HTTP byte**; app wrapper returns `502 RETRY_BUDGET_EXHAUSTED` with zero observations | **Do not infer Arena's result from Windows, or vice versa.** The public host/path is proven usable from Windows and is the same route the app declares. Arena's `502` is environmental. Post-200 envelope/pagination behaviour remains unverified. |
| **IIP monthly** | HTTP `200`; JSON; real records; route = `/api/iip/getIIPMonthly` | Same failure as CPI for both the documented route and the app's `/api/iip/getIipData` | **Windows validates the documented route, not the implemented one.** Implemented-route existence/shape is `UNRESOLVED`; Arena cannot test it. |
| **NAS** | TCP connection failed, ping failed, HTTP status `000`, 5 s + 15 s timeouts — against `10.24.89.9:5000`, **which the app never calls** | Private address blackholed (5–8 s, no response); public-host NAS route reset at TLS | **Separate diagnosis required, and its object has changed:** the untested URL is the app's own `https://api.mospi.gov.in/api/nas/getNASData`, not the advertised private server. |

### 6.1 Confirmed facts

1. The Arena `502` is application-generated, carries the transport's own error code, and contains no upstream content.
2. Arena has no MoSPI egress by platform policy: TLS reset for every MoSPI host tested, deterministic (<300 ms), with allow-listed controls succeeding in the same session.
3. Arena therefore cannot evaluate route correctness, authentication, or payload content for any MoSPI dataset — this is structural and will not change by retrying.
4. The private NAS address has never been part of this application (0 occurrences in 610 commits / 122 refs).
5. The application's CPI route is the route the new Windows evidence proved works unauthenticated.
6. The application's IIP route names differ from the documented IIP route names; the documented names have never existed here.
7. The application's governed NAS route + host combination has never been tested in any evidence available here.
8. The adapter's `baseUrl` seam exists but is unreachable at runtime (call site passes no `deps`; no environment read) — an already-recorded, authority-fenced item.
9. The macro unit suites pass at this head (36 + 14 + 6 = **56/56**), i.e. the code path and its fail-closed semantics are healthy; the live failure is a reachability condition, not a defect signature.

### 6.2 Evidence-supported hypotheses

1. The public host may serve a SPA/HTML fallback for unknown paths (as recorded for earlier guessed CPI paths in the supplied material), so a `200` alone would not establish NAS API success; the app's `INVALID_RESPONSE` fail-closed path would surface it as a `502`.
2. NAS may be intentionally internal-only, consistent with its OpenAPI spec advertising a private server while CPI/IIP advertise the public one.
3. Running the app on the Windows machine that produced the CPI/IIP successes would very likely resolve CPI end-to-end; whether it resolves IIP and NAS is genuinely open.
4. Post-`200` fail-closed conditions (missing `meta_data`, unauthenticated record cap, `limit` handling) are plausible residual blockers for CPI/IIP that no evidence here excludes.

### 6.3 Unresolved questions

1. Is `/api/iip/getIipData` (and `/api/iip/getIipFilter`) currently served on `https://api.mospi.gov.in`, and does it return the envelope the transport requires?
2. Is `/api/nas/getNASData` served on `https://api.mospi.gov.in`, or is NAS reachable only through the advertised private server (internal network / VPN / gateway)?
3. Do the live CPI/IIP/NAS envelopes carry numeric `meta_data.totalPages`/`totalRecords` for the app's parameter set, so complete pagination can terminate successfully?
4. Does the unauthenticated read cap (recorded as ~10 records/request) interact with `limit=100` and the completeness rule in a way that yields `INCOMPLETE_PAGINATION`?
5. What exactly was the historical "live-confirmed" basis for the NAS runtime contract (`indicator_code` 1/5)? It is recorded in the decision act as established, but the raw transcript and the exact host used are **not** in the repository.

### 6.4 Blocked

- **Live E2E `C — BLOCKED`** (unchanged): no successful live retrieval, and no end-to-end validation, has been demonstrated in Arena — and, by the platform egress policy, cannot be.
- **Arena-side verification of any MoSPI route: `BLOCKED`** structurally.

---

## 7. Next dependency — the smallest concrete step

**Step 1 (decisive, no authority change, uses the environment that already has provider egress).** On the same Windows machine that produced the new CPI/IIP results, run the **application's own governed URLs** and record status / content-type / whether the body is JSON / whether `meta_data.totalPages` and `totalRecords` are numeric:

```text
https://api.mospi.gov.in/api/cpi/getCPIIndex?base_year=2012&series=Current&Format=JSON&limit=100&page=1
https://api.mospi.gov.in/api/iip/getIipFilter?base_year=2022-23&frequency=Annually&Format=JSON
https://api.mospi.gov.in/api/iip/getIipData?base_year=2022-23&frequency=Annually&type=Sectoral&category_code=2&subcategory_code=022011-1210&Format=JSON&limit=100&page=1
https://api.mospi.gov.in/api/nas/getNASData?base_year=2022-23&series=Current&frequency_code=Annually&indicator_code=1&Format=JSON&limit=100&page=1
```

Preferably by starting the application there (`IIPS_DATA_DIR=… npm run server:dev`) and issuing the shortest proof the tracker already names: `curl 'http://localhost:8787/api/macro/cpi'` returning `200` with `records` and `pagination.expectedRecords == actualRecords`, then the same for `iip` and `nas`.

Why this is the smallest sufficient step: the repository-side path is verified (56/56 tests, guarded route, fail-closed semantics, no credentials); the only missing evidence is a live `200` **through the app's own routes** from a machine with egress — and Windows is already demonstrated to have CPI/IIP egress.

**Step 2 (external access-path dependency, only if Step 1 shows NAS is not served on the public host).** The documented NAS server is a private address; if the public-host NAS route is absent or returns non-JSON, NAS requires an *access-path* decision and/or an *authority* decision — both outside this task:

- an operator-confirmed internal network / VPN / gateway route to the advertised NAS server (external dependency, no repository change), **or**
- a governance decision permitting a different configured access path, which would require the already-fenced `deps`/`baseUrl` change (tracker §16.17.4 item 2 / gate acceptance item `V-C6`) under its own implementation authority.

**Explicitly not done, and not authorized here:** no public NAS URL was invented, no server address was replaced, no proxy/gateway was configured, no `baseUrl` injection was implemented, and no endpoint selection was changed.

---

## 8. Scope accounting

- **No implementation change of any kind.** The session diff is **additive evidence only**: this report plus two probe scripts and their two verbatim transcripts, all under `evidence/integration/mospi-live-e2e-reconciliation-2026-10-15/`.
- **Untouched:** `frontend/server/macro/**`, `frontend/server/executive-transport.ts`, `frontend/src/api/macro.ts`, `frontend/src/features/research/MacroContext.tsx`, all tests, `package.json`/lockfile (read-only `npm ci` of declared dependencies was run to execute the live route probes; no manifest changed), runtime configuration, deployment settings, endpoint selection, and every governance record.
- **Not modified:** the canonical tracker, CV-53's acceptance record, the D89 implementation-authority act, the Option E disposition act, and all fences/blobs it pins.
- **Not expanded or closed:** CV-53 remains **D89 display-contract scope only**; D91 **V-C5** (the separate D91 §1 notice) remains open and outside this record; the two API-client residuals (`getJson` discarding the transport `code`; the mount not passing `deps`) remain incomplete/fenced; attribution/licensing (`NOT DETERMINED`), entitlement (`B — PARTIALLY ESTABLISHED`), GODL and M-3 (`NOT ESTABLISHED`) and production (`NOT AUTHORIZED`) are unchanged; no qualification, admission or production eligibility is claimed.
- **No merge, no `main` movement, no competing branch.** Work is on the session branch only, as an investigation artifact for review.
- **Environment actions taken:** read-only HTTP probes; `git fetch --unshallow origin` (plus branch/tag mirrors) so that historical absence claims (§5.1) are valid rather than shallow-clone artifacts; `npm ci` in `frontend/` (declared dependencies only) and one dev-transport run on `:8799` for the live route probes, both stopped afterwards.

---

## 9. Final disposition

**Live NAS/CPI/IIP E2E remains `C — BLOCKED`.**

- **CPI** — provider-side route validated by the supplied Windows evidence (`200` + JSON, unauthenticated, app's own path); **Arena retrieval: `BLOCKED` by platform egress policy**; end-to-end app retrieval through `/api/macro/cpi`: **not demonstrated**.
- **IIP** — documented route validated by Windows; **implemented route (`/api/iip/getIipData`) untested anywhere**: `UNRESOLVED`; **Arena retrieval: `BLOCKED`**.
- **NAS** — advertised private server unreachable from Windows and from Arena (different mechanisms); the URL the application calls has never been tested: **`UNRESOLVED` / `BLOCKED` pending Step 1, and possibly pending an access-path decision (Step 2)**.
- **No success is claimed from HTTP `200` alone, no failure of the public CPI/IIP services is claimed from an Arena `502`, and no NAS API behaviour is inferred from a TCP timeout.**

Disposition changes only on demonstrated live retrieval and end-to-end validation **with actual evidence from an environment that has provider egress**, through the application's own routes.
