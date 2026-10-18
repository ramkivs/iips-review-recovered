# CV-32 — PIT product disposition: evidence record (2026-10-18, UTC)

**Purpose.** Complete the PKG-05 / CV-32 investigation with verified evidence so the product owner can dispose **Option A (bounded, mounted PIT panel)** or **Option B (explicit API-only)**. This record is evidence only: it renders no decision, implements no UI, removes nothing, and touches no portfolio, PKG, route, fence, or IPD file. The decision-ready comparison is in `docs/integration/2026-10-18/PKG-05-PIT-CV32-DISPOSITION-PACKET.md` (dated addendum).

## 1. Verified starting state

| Item | Verified value (how) |
|---|---|
| IRR `main` | `82431e5b28ecc01a778e4f38427cbf294fa8eef5` (`git ls-remote`, 2026-10-18T19:1xZ); code investigated is identical to `main` (`git diff 82431e5…HEAD -- frontend/` = 0 lines on the working tree used) |
| IPD `main` | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` (PR #24, merged 2026-10-18T19:12:01Z, docs-only; 0 open IPD PRs). Its cross-repository reconciliation §6 restates CV-32 as an IRR/PA display decision and lists the evidence needed; §5.1: *no mapping from a sector archetype or arbitrary company ID to a series-qualified security ID may be invented* |
| IRR PRs | #137 OPEN `2f187225…`→`main`; #138 OPEN `5d0691e0…`→`docs/g3-d0-registration-2026-10-18`; #114 OPEN (`CONFLICTING`; 0 PIT-related files). None changed by this investigation |
| CV-32 register row | tracker §16.4 line `CV-32`: **OPEN**, owner *Product owner*, dependency *CV-22 (what to show per security)*, closure = *one screen (or an explicit "API-only" disposition) + a test that exercises the mounted path* |
| §18 matrix | row 20 (PIT read seam + `/api/pit/market-data`): `V/V/V`, Wiring `NI — HTTP only; no UI`, Data `P — securityIdentity.isinAuthority: NON_AUTHORITATIVE`; row 21 (PIT UI surface): `NI` / `AP — none commissioned` / `NW` / Acceptance **NOT SATISFIED** |
| Prior sweeps reused | §16.20 / V31 (2026-10-14): zero consumers of `src/api/pit.ts` and zero PIT screens across all 211 IRR ref tips + tags — **absence proved history-wide**; not rerun |

## 2. What exists (source locations, all on `main@82431e5…`)

| Layer | Location | Fact |
|---|---|---|
| Route dispatch | `frontend/server/executive-transport.ts:731–746` | `/api/pit/` namespace dispatched to a dynamic import of `./pit-transport`; port composed by `getPitReadPort()` (`:654–665`) = `createIpdPitReadPort(createNonProductionRuntimePitStore())` |
| Transport | `frontend/server/pit-transport.ts` (123 lines) | **exact-path** match on `/api/pit/market-data`; GET only (`405` otherwise); required `securityId`, `domain`, `asOf`; duplicated parameter → fail-closed; hit `200`, every miss `404` with typed `reason` |
| Boundary / contract | `frontend/server/pit/pitReadBoundary.ts`, `pitReadContract.ts` | `securityId = ISIN:<12 alnum>:<series>`; domains `D01_QUOTES`, `D02_OHLCV`; UTC `asOf`; hit = `{found, securityId, domain, asOf, resolvedAsOf, payload, provenance}`; provenance preserved verbatim (`asOf, receivedAt, evaluatedAt, dataVersion, lineageHash, qualityState`) |
| IPD adapter / stores | `frontend/server/pit/ipdPitReadAdapter.ts`, `nonProductionPitStore.ts`, `nonProductionRuntimePitStore.ts` | the five AD-02-admitted files; non-production data only (fixture `ISIN:INE665A01038:{BL,EQ}` + D114 historical population, e.g. `ISIN:INE467B01029:EQ` TCS) |
| Browser client | `frontend/src/api/pit.ts` (57 lines) | `fetchPitAsOf(request, baseUrl)`; type-only import of the contract; "never derives a securityId from an IRR sector or company identifier" |
| UI | — | **none**: no `src/features/*pit*` directory; no route in `src/app/App.tsx:33–61`; no navigation entry; no importer of `src/api/pit.ts` other than `src/api/pit.test.ts` (the client is dead code in the production bundle) |
| Company view (the "identified company view" PKG-05 names) | `src/app/App.tsx:44` → `src/features/company/CompanyIntelligence.tsx` | route `/research/company/:id` where `:id` is a **sector** key; fetches `fetchCompanyData(sector)` (`src/api/company.ts:24`); `CompanyData` carries **no ISIN / securityId**; renders decision, pillars, SNAPSHOT inputs, evidence/replay links |
| Governed universe identity | `frontend/server/executive-transport.ts:571–600` | `canonicalSecurityId: c.sector` (e.g. `'Banking'`) — the product's security identity is the sector name; no ISIN anywhere in IRR product data (grep for `ISIN` / `securityId` outside `server/pit/**` → only `user-portfolio/translationBoundary.ts`, which is behind the `503` fence) |
| Product posture | `src/features/settings/Settings.tsx:11–14`, `src/api/settings.ts:15–16`, `src/features/research/MacroDataModeNotice.tsx:7` | PIT addressing / data mode / freshness are *excluded capabilities* for user controls (tests `Settings.test.tsx`, `MacroResearch.test.tsx:285–295` assert no such control) — not a prohibition of a read-only panel, but PIT is not a user-facing product capability today |

## 3. Authority status of the seam (as recorded, unchanged by this record)

| Record | What it says |
|---|---|
| `docs/integration/IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md` (`AD-02`, in force per REG-02) | admits IPD `./pit` + `./d114-non-production` at pin `2e11fa3b…` for **exactly five** server/test files; **server-side locus only; no browser import**; non-production data only; §3.4: *any PIT or D114 consumer beyond §1* NOT ADMITTED; no identity/D115 use |
| `docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md` §2.1(2), §2.3 (`P4`) | *the live `/api/pit/` dispatch, `pit-transport.ts`, and `/api/pit/company/:companyId` are RETAINED and remain NOT ADMITTED … Activation or admission of this route requires a separate, explicit Program Authority gate. Route presence is not admission.* |
| Tracker REG-02 row (line 39), §6.6 (line 234), CV-05 (line 995), §16.49 `I-1` (line 2679), §18 row 20 | CV-05 `COMPLETE/ACCEPTED (narrowly)` — "wired into the live server"; `I-1` "LIVE (non-production)"; later rows cite P4 as the `/api/pit/company/:companyId` route only. **Observation (not adjudicated here):** `/api/pit/company/:companyId` does not exist in current code (`pit-transport.ts` serves only the exact `market-data` path), while the governing P4 text also names `pit-transport.ts` and the live dispatch. Any **product** consumer of `/api/pit/market-data` therefore needs the P4 gate question answered explicitly |
| `docs/OPERATOR_RUNBOOK.md:106–107, 162` | the GET is listed as an operator probe (`200` hit; `404` fail-closed shapes; `POST` → `405`) |
| IPD reconciliation (IPD `main@be32d8c9…`, §6) | IRR owns route/client; IPD contract and tests must remain unchanged absent an IPD decision; evidence needed for either option listed |

## 4. Tests (executed this pass, working tree code = `main@82431e5…`; Node 22, Vitest)

```
✓ server/pit/pitReadBoundary.test.ts           48 tests   (IU3R-01…43: identity/domain/asOf validation, pass-through, series isolation, future-leakage, 405/duplicate-param/exact-route, /api/company untouched)
✓ server/pit/pitRuntimeIntegration.test.ts     28 tests   (IU5R-00…14: real pinned IPD PitReadService/PointInTimeStore through the real server route)
✓ server/pit/pitD114RuntimeIntegration.test.ts 27 tests   (IU6R-00…07: D114-ingested records over the route; provenance verbatim; no IPD companyId at top level; determinism; IRR owns no PIT state)
✓ src/api/pit.test.ts                          10 tests   (fetchPitAsOf() end-to-end against the composed server: hits, typed misses, fail-closed, provenance, resolvedAsOf ≤ asOf)
✓ src/features/company/CompanyIntelligence.test.tsx  6 tests (company view renders decision/pillars/SNAPSHOT inputs/evidence/error — no PIT content)
Test Files 5 passed (5) · Tests 119 passed (119)
```

Coverage boundary: **no test renders any PIT UI** (none exists); no browser, Windows, or operator acceptance evidence exists for PIT in any environment; the IRR `main` CI run for `82431e5…` (`39140713740`, full suite) is green and includes the four PIT suites.

## 5. Live route probe (this pass; sandbox; `EXEC_TRANSPORT_PORT=28790`; GET-only; non-production store; server stopped afterwards)

| Request | Result |
|---|---|
| `GET /api/pit/market-data?securityId=ISIN:INE467B01029:EQ&domain=D01_QUOTES&asOf=2026-12-31T23:59:59.000Z` | `200`, 771 B; `found:true`, `resolvedAsOf 2026-02-10T15:30:00.000Z`; provenance `dataVersion v1.0.0-d114-historical`, `lineageHash 3f30ac9858cf…`, `qualityState GOOD`, `receivedAt/evaluatedAt 2026-09-20T12:00:00.000Z`; `payload` keys `companyId, symbol, exchange, currency, bid, ask, ltp, open, high, low, previousClose, volume, change, pctChange, securityIdentity`; `payload.securityIdentity = {securityId, isin, series, isinAuthority: "NON_AUTHORITATIVE"}`; `payload.companyId = "TCS"` (IPD payload field; top level carries no companyId — IU6R-05b) |
| same with `asOf=2000-01-01T00:00:00.000Z` | `404 {"found":false,"reason":"NOT_FOUND"}` |
| `securityId=INE467B01029` (bare ISIN) | `404 {"found":false,"reason":"INVALID_IDENTITY"}` |
| `domain=D99` | `404 {"found":false,"reason":"INVALID_DOMAIN"}` |
| `POST` same query | `405 {"found":false,"reason":"INVALID_IDENTITY"}` |
| `GET /api/pit/market-dataEVIL?…` | `404 {"found":false,"reason":"NOT_FOUND"}` (exact-match guard) |

Matches runbook rows (`:106–107`, `:162`) and the 2026-10-17 WP-1 operability evidence (`evidence/integration/wp1-stage1-current-main-operability-2026-10-17/acceptance-evidence.md`, PIT bullet). Non-production data; nothing persisted; no credential; no external network.

## 6. Facts that bound the two options

1. **There is no securityId available to any mounted IRR screen.** The company view and the governed universe are sector-keyed; `CompanyData` has no ISIN; the PIT client and the IPD reconciliation both forbid deriving a securityId from a sector/company identifier. A panel on the company view therefore needs either (a) an exact identity contract from the CV-22 governed-universe decision (option B/C there, with ISIN-bearing rows), or (b) a different product shape — a free-form securityId lookup widget — which is not "this company's market data" and is a product decision in itself.
2. **The route's product activation is reserved to a separate PA gate (P4).** A mounted product consumer would be the first product-level consumer of `/api/pit/market-data`; the AD-02 admission covers package consumption by five server files, not a product screen. Option A requires the P4 question to be answered expressly; Option B must not be worded as a route admission.
3. **The data is non-production** (D114 historical + fixtures, `isinAuthority: NON_AUTHORITATIVE`). Any panel must present that honestly (non-production / non-authoritative / freshness = PIT vintage), and must not become a live-data expectation.
4. **The API is complete and tested for what it is**: 113 server/client tests; fail-closed shapes; exact route; read-only. Option B needs no code.

## 7. Boundaries preserved

Documentation-only evidence; no product, test, route, config, fence, persistence, or IPD file changed; no UI implemented or removed; no CV-22 / CV-20 / Reports / Macro / PR #137 / PR #138 / 13-item / 51-row change; no browser or Windows acceptance claimed; Gate 3 NOT GRANTED; `/api/user-portfolios*` stays `503 owner-context-unavailable`; IPD `SESSION_ONLY` / `durable:false` untouched.
