# IID — Identity Coverage & Investment Coverage
## End-to-end investigation, operational readiness and decision-support assessment

| Field | Value |
|---|---|
| Date | 2026-11-11 |
| Repository | `ramkivs/iips-review-recovered` (IRR) |
| Branch | dedicated publication branch off `origin/main` (see §31; investigative work performed on `arena/6012214c-iips-review-recovered` @ `72b5d0a`, PR #554) |
| Environment | Arena Linux sandbox, Node `22.22.3`, platform `linux`. **Not the operator's Windows host.** IIPS_DATA_DIR unset; `<cwd>/.iips-data` absent |
| Production | Out of scope (non-production, single-user local application) |
| IPD dependency verified | `ramkivs/iips-production-market-data`, default branch `main`, public, pushed `2026-11-11T13:28Z` (see Appendix B) |
| Verification basis | Source inspection; read-only runtime checks (`iid-readiness` CLI; direct `runtime.ts` evaluation); targeted existing tests (9/9 investment-coverage, 9/9 coverage-endpoint platform tests; 27/27 UI/transport separation tests; CI 43023111359 SUCCESS on the PR #554 branch tip); no browser; no provider access; no writes |
| Author | Read-only investigation; no production, no data-domain, no IPD modification |

---

## 0. Executive summary

**The two empty states the user sees today are not two defects. They are one structural fact each:**

1. **Identity Coverage is empty because the three governed identity reference files do not exist anywhere the runtime can read them** — `eligible-roster.json`, `listing-map.json`, `corporate-actions.json` under `${IIPS_DATA_DIR}/investment/identity/`. `IIPS_DATA_DIR` is unset, the default `<cwd>/.iips-data/investment/identity/` does not exist, and no repository (IRR or the pinned IPD packages, at either the pinned SHA or IPD `main`) ships an operational set. The loader is fail-closed by design and reports `IDENTITY_SOURCE_MISSING` / "missing file(s): roster, listingMap, corporateActions" — exactly what the user sees. The loader itself works: installing any valid set (a synthetic governed fixture, or one of the three real-issuer operator-supplied sets already committed as evidence) makes the surface report `available`.

2. **Investment Coverage reports dataset `NONE` because no fundamentals dataset is installed** — nothing exists at `${IIPS_DATA_DIR}/investment/dataset`, so the served report is the truthful empty position: `datasetClass NONE`, 0 issuers, 0 of 13 sectors measured, 0 of 38 method slots usable, `xbrlMappedTags: 22`, `derivationItems: 8` (the 22 tags and 8 derivations are the *implemented vocabulary*, not dataset content). This is reported by the runtime on `investmentCoverageFromLocalDataset()` and matches the UI exactly.

**Neither empty state is a bug, and neither is fixable by code in this repository alone.** The IID implementation (IID-0 … IID-6) is implementation-complete, merged and tested; the blockers are (a) missing operator-provisioned reference data, (b) missing an installed fundamentals dataset, (c) an IPD-owned precondition (binding + IPC peer) for the holdings lane, and (d) one pending product/data-governance decision (what population the identity roster covers, and whether to install the committed real-issuer evidence datasets for local operation).

**What exists and works today:** the two surfaces are now correctly separated (the 2026-11-10 correction merged to `main` via PR #550); the identity resolver is deterministic and fail-closed with named states; the ingestion CLI and coverage measurement run end-to-end on real audited filings (Infosys/Technology, Marico/Consumer, KEC/Industrials — committed evidence bundles); the assessment, disposition and change-intelligence engines run; the readiness diagnostic tells the operator exactly what is missing.

**What is not yet possible:** evaluating the user's actual holdings against financials, because (i) no roster/dataset is installed for the operational data domain, and (ii) the holdings observation lane additionally needs IPD to provision the active binding and an IPC peer. Watchlist items (certified sector references or, post-PR-#554, governed sector identifiers) are *not* identity-resolvable securities by design.

**The single highest-leverage next step:** provision the identity reference set and install one real fundamentals dataset into the local data domain (the committed Infosys REL-1 bundle is the natural candidate, or Marico/KEC), then re-run `npm run iid:readiness` on the Windows host. That alone makes Identity Coverage show real resolutions and Investment Coverage show one covered issuer with 3 sectors available for future measurement. Everything else (full-universe coverage, portfolio-wide decision support) is gated on data governance: an authoritative eligible roster and a licensed-or-governed fundamentals source — decisions only the product owner can make.

---

## 1. How to read this report

- **Every material claim cites its evidence**: a repository path, symbol/API, configuration key, runtime output or test.
- **"Confirmed blocker"** = observed in this environment. **"Suspected"** = not directly observable here. **"Unknown"** = evidence unavailable (§27 lists them).
- **Runtime evidence in this report comes from the Linux sandbox**, which matches a fresh checkout with no provisioned data domain — exactly the state that reproduces the reported UI. It is *not* the operator's Windows machine (§27 U-1), and no Windows-host state is claimed.
- **Tests executed:** `iips-platform/tests/investment/investment-coverage.test.ts` (9/9), `investment-coverage-endpoint.test.ts` (9/9), frontend `iidCoverageSeparation.test.tsx`, `iid6Coverage.test.tsx`, `iidInvestmentCoverageTransport.test.ts` (27/27). No full regression suite was run (out of scope). The 2026-11-10 separation commit's own gates (2533 frontend tests, 777 platform `test:iid`) are recorded in `docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-SEPARATION-2026-11-10.md` §4.3, not re-run.
- **No synthetic fixture is presented as real-company coverage.** The only real issuer evidence used is the committed `evidence/real-issuer/` corpus, and it is labelled as such.

---

## 2. The two capabilities in one table

| | Identity Coverage (UI07-adjacent, IID-1) | Investment Coverage (IID-0 measurement, surfaced separately 2026-11-10) |
|---|---|---|
| Question answered | Does **this observed row** (holding / watchlist item / broker preview row) have a defensible issuer/security/listing? | What **does the served dataset hold** — which issuers, which financials, which sectors measured, which methods usable? |
| Population | The observations the user/broker surfaces present right now | The locally installed fundamentals dataset |
| Inputs | 3 governed files + observations | Local snapshot store (`${IIPS_DATA_DIR}/investment/dataset`) |
| Output | Per-row state (9 states), counts, unresolved list, successor reconciliations, financial-coverage disclosure | Per-issuer state (COVERED / NO_FINANCIALS / SECTOR_NOT_MEASURED / ISSUED_DATA), per-sector measurement, dataset identity, 38 method slots |
| Endpoint | `GET /api/investment/coverage` | `GET /api/investment/coverage/investment` |
| Page | `/identity-coverage` (`IdentityCoveragePage.tsx`) | `/investment/coverage` (`InvestmentCoveragePage.tsx`) |
| Fail-closed behaviour | 503 `identity-sources-unavailable` until files validate | Never fails for absent dataset: `200` with `datasetClass: NONE` (an empty position, not a failure) |
| Owner | IRR (contract, loader, resolver, UI) — operator provisions data | IRR (contract, ingestion, measurement, UI) — operator provisions dataset |

---

# PART I — IDENTITY COVERAGE

## 3. What Identity Coverage is designed to deliver

Source of design: `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` (IID-1), `docs/integration/IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md`, and the implementation in `iips-platform/src/investment/identity/`.

- **Three levels of identity, never conflated** (`types.ts` header): issuer (CIN-primary, equity-ISIN fallback), security (ISIN), listing (exchange + symbol + series + instrument + effective window).
- **Every observed row resolves to all three, or to nothing, with a named state.** Closed resolution ladder (`RESOLUTION_STATES`, `identity/types.ts:15-24`): `RESOLVED`, `AMBIGUOUS`, `UNMATCHED`, `INELIGIBLE`, `OUT_OF_SCOPE_SECURITY`, `STALE_REFERENCE`, `REJECTED_MALFORMED_ISIN`, `ISSUER_KEY_CONFLICT`, `AMBIGUOUS_LISTING`.
- **Every non-`RESOLVED` state carries one of 18 closed reasons**, each with display text (`UNRESOLVED_REASONS`, `identity/types.ts:35-54`), e.g. `ISIN_NOT_IN_ROSTER`, `SYMBOL_NOT_IN_LISTING_MAP`, `LISTING_WINDOW_EXPIRED`, `SECTOR_REFERENCE_NOT_AN_IDENTITY`.
- **Fail-closed and total**: one structural defect in any of the three files rejects the whole set; there is no partial roster, no cached-good report, no fuzzy matching, no name matching (the resolver physically cannot match on a company name — `IdentityInput` carries no legalName/displayName).
- **Server-side provenance**: each file's "version" is the sha256 of its canonical content; a silently edited roster cannot masquerade as the same roster.

Operationally it answers, for the rows the user is looking at right now (current portfolio holdings via IPD IPC, watchlist items, broker-import preview rows): *can IIPS defensibly say which issuer this row belongs to, and therefore whether any downstream assessment can be opened?*

## 4. The implementation, end to end

```
observations                       loadIdentitySourcesFromDir()
  ├─ HOLDING  (IPD IPC, read-only)     (server-side, per request)
  ├─ WATCHLIST (watchlists service)    ├─ eligible-roster.json   (schemaVersion IIPS_INVESTMENT_IDENTITY_V1)
  └─ BROKER_PREVIEW (client rows)      ├─ listing-map.json
        │                              └─ corporate-actions.json
        ▼                                    │ validateRoster → validateListingMap → validateCorporateActionTable
   resolveIdentity()  ◄──── sources ──────────┘   (any issue ⇒ { available: false } ⇒ 503, nothing classified)
        │
        ▼
   computeIdentityCoverage()  ──► IdentityCoverageReport { counts, bySource, items[], unresolved[],
                                   successorReconciliations[], identitySources, financialCoverage, statusLine, notes }
        │                                   ▲ financialCoverage disclosed independently (IID-0 measurement of the dataset)
        ▼
   JSON: GET /api/investment/coverage        (endpoint: iips-platform/src/investment/identity/coverageEndpoint.ts)
   HTML: GET /investment/coverage             (server-rendered, JS-free; `coverageView.ts`)
   UI:   /identity-coverage                   (IdentityCoveragePage.tsx)
```

Key symbols:

| Concern | Implementation | Path |
|---|---|---|
| File loading & validation | `loadIdentitySourcesFromDir`, `resolveIdentityDir`, `loadIdentitySources`, `validateRoster`, `validateListingMap`, `validateCorporateActionTable` | `iips-platform/src/investment/identity/sources.ts` |
| Resolution ladder & reasons | `resolveIdentity`, `reasonText`, `RESOLUTION_STATES`, `UNRESOLVED_REASONS` | `identity/resolver.ts`, `identity/types.ts` |
| Coverage computation | `computeIdentityCoverage`, `buildFinancialCoverageDisclosure`, `financialClass` | `identity/coverage.ts` |
| HTTP boundary | `coverageEndpoint` (framework-agnostic), `coverageView` (HTML), `COVERAGE_ROUTES` | `identity/coverageEndpoint.ts`, `identity/coverageView.ts` |
| Server composition & observation providers | `createCoverageProviders`, `createHoldingsProvider` (IPD IPC), `createWatchlistProvider`, `createFinancialCoverageProvider` | `frontend/server/investment/sources.ts` |
| Transport | `coverage-transport.ts` (binds the handler to node:http, injects providers, 405 for non-GET/HEAD) | `frontend/server/investment/coverage-transport.ts` |
| Client & page | `fetchInvestmentCoverage()` (`src/api/investmentCoverage.ts`), `IdentityCoveragePage.tsx` | frontend |
| Readiness diagnostic | `iid-readiness.ts` | `frontend/server/investment/cli/iid-readiness.ts` |

## 5. Root cause of `IDENTITY_SOURCE_MISSING` (established, not assumed)

Observed on this host (Linux sandbox, fresh checkout state):

```
$ npx tsx server/investment/cli/iid-readiness.ts --json
identity-files | user-host-provisioning-required | configured:false | readable:false
  | IDENTITY_SOURCE_MISSING (3 of 3 files absent)
```

```
$ npx tsx --eval "import { loadRuntimeIdentitySources } from '../iips-platform/src/investment/identity/runtime';
                  console.log(loadRuntimeIdentitySources())"
{ available: false,
  issues: [ { file: 'eligible-roster.json', code: 'IDENTITY_SOURCE_MISSING',
              subject: '/home/user/iips-review-recovered/frontend/.iips-data/investment/identity',
              detail: 'missing file(s): roster, listingMap, corporateActions' } ] }
```

The subject path is the *expected directory*: `${IIPS_DATA_DIR}/investment/identity`, falling back to `<cwd>/.iips-data/investment/identity` (`resolveIdentityDir`, `identity/sources.ts`). The loader is not misconfigured, not failing on a read error, not failing schema validation — **the files are simply not there**, and `IIPS_DATA_DIR` is unset in every default environment (it is documented as user-host configuration, `docs/OPERATOR_RUNBOOK.md` §16).

Checked and eliminated as causes:

| Candidate cause | Result |
|---|---|
| Wrong path expected by loader vs docs | Consistent: runbook §16 table `identity-files` → `<IIPS_DATA_DIR>/investment/identity/{eligible-roster,listing-map,corporate-actions}.json`; loader agrees |
| Inaccessible directory / permission | Cannot be observed as the cause here — the *parent* `.iips-data` does not exist at all on this host |
| Loader defect | Refuted: installing the governed synthetic fixture set at the fixture path yields `available: true` (8 issuers / 11 securities / 15 listing entries / 9 corporate actions, `rosterDataClass: SYNTHETIC_FIXTURE`); the same loader accepts all three real-issuer operator-supplied evidence sets as `OPERATOR_SUPPLIED` (§7.3) |
| Schema mismatch | Not reached — files absent before schema validation |
| IIPS_DATA_DIR mismatch between server and expectation | `IIPS_DATA_DIR` is unset; default used. On the operator's Windows host the resolved path will be `<cwd-or-IIPS_DATA_DIR>\investment\identity` — the UI's reported subject path should be checked there to confirm it is the intended directory (L-1) |
| Stale/cached failure | None exists — the loader reads from disk per request; there is no cache |
| Snapshot substituted by UI | Refuted by the 2026-11-10 separation work: UI provenance and resolver share the composed provider; identity has no dataset dependency at all |

**Why the UI shows this exact text:** `/identity-coverage` → `IdentityCoveragePage` fetch fails with `IdentitySourcesUnavailableError` → renders "Identity coverage is unavailable" plus the file-level issues verbatim, including `eligible-roster.json / IDENTITY_SOURCE_MISSING / missing file(s): roster, listingMap, corporateActions`. That is the correct, required fail-closed behaviour.

**The 2026-11-10 routing correction (merged to `main`, in this branch's ancestry):** the same text previously leaked onto `/investment/coverage` because one shared component served both routes. `docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-SEPARATION-2026-11-10.md` documents the fix; the SPA route `/investment/coverage` now renders its own surface and never the identity wording. The raw JS-free HTML route `/investment/coverage` is the identity handler's minimal view (503 with the identity wording when files are absent) — a stated, known exception recorded in that document §5; root cause pinned in this report as §24 G-10.

## 6. Resolution model — states and what they mean operationally

The resolver (`identity/resolver.ts`) binds one observation to issuer → security → listing. Decision order: ISIN (format → check digit) → ISIN in roster? → listing map lookup (exchange+symbol+series+instrument, effective window) → instrument class scope → issuer status/domicile/key conflict → corporate-action continuity → stale/ambiguous outcomes.

| State | Meaning | Permitted downstream? |
|---|---|---|
| `RESOLVED` | Issuer + security + an effective listing all bind; `status = ASSESSABLE` for EQUITY | Yes — an identity-scoped assessment can be opened for issuerId |
| `AMBIGUOUS` | Multiple candidate bindings survive (e.g. two securities share an active symbol); candidates listed | No — user/data-operator must disambiguate at the source |
| `UNMATCHED` | Nothing matched (ISIN not in roster, symbol not in map, …) | No |
| `INELIGIBLE` | Matched but refused for cause: `ISSUER_NOT_ELIGIBLE`, `NON_INDIAN_ISSUER`, `SECURITY_NOT_LISTED` | No |
| `OUT_OF_SCOPE_SECURITY` | Matched but instrument class not assessable in v1 (`INSTRUMENT_NOT_ASSESSABLE`) | No |
| `STALE_REFERENCE` | Match exists but the reference data can no longer speak for the observation window (e.g. listing window expired and was not relisted) | No |
| `REJECTED_MALFORMED_ISIN` | Format or check digit invalid | No |
| `ISSUER_KEY_CONFLICT` | Two issuer key claims collide (CIN vs equity-ISIN basis, duplicate CIN/ISIN across issuers) | No — data defect, roster must be corrected |
| `AMBIGUOUS_LISTING` | Overlapping effective windows for one listing key — refused at *file validation* time too (`AMBIGUOUS_LISTING` issue code in `validateListingMap`) | No |

Operational semantics preserved everywhere: an observation is `assessable` **iff** state == `RESOLVED`. Nothing else counts. A `RESOLVED` row from the *synthetic* fixture roster is a synthetic resolution — `rosterDataClass` travels with the report (`SYNTHETIC_FIXTURE` vs `OPERATOR_SUPPLIED`) and the surfaces label it.

Per-row outputs include `candidates` (for `AMBIGUOUS`/`AMBIGUOUS_LISTING`), `reasonText` (display-ready), `detail`, and `successorReconciliations` (when corporate actions map a merged/demerged issuer onto successors with reconciling ratios).

## 7. Identity sources — files, validation, versions, and what exists today

### 7.1 `eligible-roster.json` (schemaVersion `IIPS_INVESTMENT_IDENTITY_V1`)
Issuers keyed by `IN:CIN:<cin>` or `IN:EQISIN:<isin>` (key basis derived from the key prefix; issuerId must equal the basis key exactly), with `legalName`, `cin`, `equityIsin`, `sector`, `subSegment`, `status` (`ELIGIBLE|EXCLUDED`), `foreignIssuer`. Securities keyed by `IN:ISIN:<isin>`: `instrumentType` (v1: EQUITY may be `ASSESSABLE`; others `OUT_OF_SCOPE`), `status` (`ASSESSABLE|OUT_OF_SCOPE|INELIGIBLE`), issuer link validated against the roster. Whole-set rejection on: duplicate issuer/security/ISIN, `ISSUER_KEY_CONFLICT` (CIN or equity-ISIN claimed twice), `SECURITY_INCOMPLETE`, `UNKNOWN_ISSUER`, `ASSESSABLE_NON_EQUITY`.

### 7.2 `listing-map.json` and `corporate-actions.json`
Listing entries: `listingId = EX:SYMBOL:SERIES:INSTRUMENT`, `effectiveFrom`/`effectiveTo` windows, no overlapping windows per key (validated), symbol/series/instrument class checked against the closed vocabularies (`EXCHANGES`, `LISTING_SERIES`, `INSTRUMENT_TYPES`). Corporate actions: closed type set (`SPLIT`, `BONUS`, `CONSOLIDATION`, `RIGHTS`, `BUYBACK_*`, `MERGER`, `DEMERGER`, `SYMBOL_CHANGE`, `NAME_CHANGE`, `DELISTING`, `PREFERENCE_REDEMPTION`, `CAPITAL_REDUCTION`); `MERGER`/`DEMERGER` require successor mappings whose ratios sum to exactly 1 (`SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE`); `adjustmentFactor > 0`.

### 7.3 What actually exists in this repository (and what does not)

| Candidate population | Location | Status |
|---|---|---|
| IID-0 synthetic reference roster | `iips-platform/tests/investment/fixtures/identity/` (also `fixtures/investment/...` peers) | `available: true`, `rosterDataClass: SYNTHETIC_FIXTURE`, 8 issuers / 11 securities. **Not for operational use** (never to be installed into a data domain) |
| Real issuer, one-off — Infosys | `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/identity/` | `available: true`, `OPERATOR_SUPPLIED` |
| Real issuer — Marico (Consumer) | `evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/ingest-input/identity/` | `available: true`, `OPERATOR_SUPPLIED` |
| Real issuer — KEC International (Industrials) | `evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input/identity/` | `available: true`, `OPERATOR_SUPPLIED` |
| IPD as a source of a roster/listing map | checked at pinned SHA `1aee57fe09` and at IPD `main` (`git/trees/main?recursive=1`) | **Absent.** IPD owns the D05 authenticated security master (2,390 records, 2026-11-08 AUTH act) and the D114 PIT, but ships **no IID roster/listing-map/corporate-action files**, and IPD documents defer D05 consumption for IIPS purposes (CV-22 Option C, 2026-10-19 authoritative for the watchlists universe) |
| Any market feed with an identity licence | none wired; IID-0 v1 decision is "no vendor dependency in v1" (roadmap, D-1) | Not available |
| Real full-universe roster | **does not exist anywhere this investigation can see** | Missing — see the Decision register (§28), items O1–O3 |

**Refresh process (design):** the identity files are *operator-maintained snapshots*, intentionally like the rest of the local data domain. Refresh cadence is an operator responsibility: NSE/BSE master changes (new listings, symbol/name changes, corporate actions) must be re-transcribed and re-validated; there is no fetcher. Staleness is not time-based by default — the effective windows in `listing-map.json` carry the time dimension, and `STALE_REFERENCE` fires when a window lapses. A roster that silently ages is indistinguishable from a valid one except by `listing-map` windows and the `dataAsOf`-style provenance the report carries — an acknowledged limitation class (cf. L-031 register entry: empty corporate-action table ⇒ "unadjusted" is an unverified claim).

## 8. Practical usage — Identity Coverage in daily work

| Scenario | What the user does | What the app does | What the user sees | When identity cannot be established | Required action |
|---|---|---|---|---|---|
| Existing portfolio holdings | Opens `/identity-coverage` (or the portfolio surface) | Server reads IPD IPC (`IpcUserPortfolioPort`) for holdings, reads the 3 files, resolves each row | Counts (observed / assessable), by-source breakdown, per-row state, jump to `/investment/company/<issuerId>` when `RESOLVED` | Row shows state + `reasonText`; nothing is guessed; totals only count `RESOLVED` as assessable | If data is stale/missing, provision/repair the files; if the binding is down, see the dependency matrix (§18) |
| Newly imported broker holdings | Imports via Broker Import surface | Broker-import evidence is journaled (CAP-02/03 lane); the **preview** can be identity-evaluated client-side via `POST /api/investment/coverage/preview` on rows the browser already holds — nothing persisted, no identity echo | Preview verdicts per row (broker's own labels corroborated, never overridden) | `UNMATCHED` rows surface with reasons; unmatched rows never enter the watchlist as identities | Fix the source CSV or provision the issuer in the roster |
| Watchlist securities | Adds an identifier on `/watchlists` | Post-PR-#554 the add control names the certified reference identifier space; watchlist items observed by identity coverage parse `IN:ISIN:*` only — a `Technology`-style sector reference yields `SECTOR_REFERENCE_NOT_AN_IDENTITY` (by design) | The watchlist membership with provenance; (after provisioning) coverage sees watchlist rows as unresolvable-by-design sector references | Always `SECTOR_REFERENCE_NOT_AN_IDENTITY` today | Issuer-level watchlists require the Decision-register items O1 (roster authority) and O8 (issuer-level watchlists); a certified issuer universe does not exist |
| Newly purchased security | After purchase, holdings refresh through IPD (WS-A/Gate 4 lane, non-production) | Next observation read re-resolves all rows | New row appears; resolution is independent of purchase price etc. | If the issuer isn't in the roster: `UNMATCHED` | Add issuer to roster (operator) or wait for roster coverage |
| Symbol change / merger / demerger | Nothing — corporate-actions table governs | On the effective date, resolution uses the successor mapping (`MERGER`/`DEMERGER` ratios must reconcile to 1); historical rows keep original identity, `successorReconciliations` disclose the continuation | A **successor reconciliation** block; pre-change rows remain attributable | If CA table lacks the action: the listing window for the old symbol lapses → `STALE_REFERENCE` or `SYMBOL_NOT_IN_LISTING_MAP` | Operator transcribes the corporate action into `corporate-actions.json` |
| Splits / bonuses | Nothing | `adjustmentFactor` is used for price/basis continuity reasoning; no price is auto-adjusted anywhere in IIPS — IID-0 does not adjust prices | n/a on this surface; disclosed in dataset `corporateActions` count | Split/bonus present but missing from CA table ⇒ price continuity claims are unverified (L-031) | Transcribe the action |
| Delisted / suspended | Nothing | Listing window ends → `STALE_REFERENCE` (window expired) or the roster marks the issuer/security non-ELIGIBLE → `INELIGIBLE` | Named state, never silently dropped | — | Roster/listing-map maintenance |

**Refresh cadence:** no scheduler exists. Reference data is as fresh as the last operator transcription. At minimum: on every NSE/BSE master change affecting a covered issuer, and quarterly as hygiene with the statement ingestion cycle. The readiness CLI (`iid:readiness`) is the check to run after any provisioning change.

---

# PART II — INVESTMENT COVERAGE

## 9. What Investment Coverage is designed to deliver

Investment Coverage answers one question about the **served dataset**: *what would IIPS actually know about the companies in it — which issuers have usable financials, which sectors can be measured, and which assessment methods are usable per sector?* (`frontend/src/features/investment/InvestmentCoveragePage.tsx` header; `iips-platform/src/investment/coverage/investmentCoverage.ts`).

It is a **dataset-level** position, not a per-holding assessment (per-holding identity stays the Identity Coverage report), and not an investment recommendation (coverage ≠ decision).

## 10. Dataset lifecycle — stage by stage, with actual status

Mandatory reading: design closure `docs/integration/IIPS_V3_IID_FORMAL_CLOSURE_2026-11-06.md`; roadmap `IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md`; limitation register `IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md`.

| # | Stage | Implementation | Status (this environment / repo) | Evidence |
|---|---|---|---|---|
| 1 | Data source/provider | **None is wired** — v1 decision D-1: no vendor dependency; operator supplies XBRL/CSV; IPD owns market data only via the (unbound) PIT seam | No licensed or free provider is configured or authorised in this repo; the D114 PIT is IPD-owned and non-production PIT-only | roadmap D-1; `iips-platform/src/investment/cli/ingest.ts` header: "No network calls of any kind." |
| 2 | Data acquisition | Operator-transcribed from issuer filings / exchange PDFs via an out-of-band retrieval harness; every byte hashed into `evidence/real-issuer/*/source/` | **Operational as evidence-gathering only** (used for Infosys, Marico, KEC, Zensar); not a product feature; no automation | `evidence/real-issuer/*/source/{source-bytes,page-map,quotes-verified}.json`; `sources/retrievalBundle.ts` (reader + verifier, not a fetcher) |
| 3 | Raw data storage | `evidence/real-issuer/*/source/` (committed, hashed) — evidence, not a store | Operational for evidence | bundle `digests.json` |
| 4 | Parsing & normalisation | `ingestion/xbrl.ts` (instance parser; 22-tag map) + `ingestion/csv.ts` + `ingestion/builder.ts` → NormalizedPeriods with statement scope, units, sign conventions | **Implemented & tested**; XBRL path exercised only on filed fragments (no Ind AS XBRL instance was reachable in WI bundles); CSV path exercised end-to-end | `iips-platform/src/investment/ingestion/*`; WI-3 README ("no Ind AS XBRL instance was reachable") |
| 5 | Issuer/security association | `ingestion/builder.ts` joins periods/metrics to roster issuers by issuerId | Implemented; the 5-line closure exposes no network path | closure AC-X2 analysis; builder tests |
| 6 | Statement extraction | Closed line-item table `contracts/lineItems.ts` (~40 items, duration/instant, sign convention); completeness% = present items / applicable items per period | Implemented; 100% statement coverage achieved on real bundles (Infosys, Marico, KEC) | `contracts/lineItems.ts`; determination JSONs |
| 7 | Annual/quarterly period construction | `contracts/period.ts`; periodType `ANNUAL|QUARTERLY`; fiscal-year alignment explicit | Implemented; **all real bundles are annual-only, 3 consecutive periods**; no quarterly data ingested anywhere | REL-1 manifest (3 annual periods, 0 quarterly); WI determinations |
| 8 | Price integration | `prices.json` input; `WI2` adds operator-transcribed BSE EOD close (single observation, ₹1,180.65, ISIN INE009A01021, 2026-11-06) | **Implemented input path; no automated feed; unadjusted-price claim is unverified (L-031)**; freshness window 7 calendar days vs design 5 trading days (L-033); contemporaneity forced (L-032) | `WI2-PRICE-OBSERVATION-2026-11-06/` |
| 9 | Corporate-action integration | `corporate-actions.json` input; builder carries records; empty table in all fixtures/bundles | **Implemented input path; data absent in practice**; validation & MERGER/DEMERGER reconciliation logic implemented | L-031 register; `sources.ts` CA validator; `fundamentals/types.ts` CA record |
| 10 | Data-quality validation | Fail-closed builder: unmapped tag → `UNMAPPED_XBRL_TAG` issue with the tag visible; invalid units/signs/periods → named issue; `issues.json` shipped in dataset | Implemented; visible-gap philosophy enforced (never zero-filled) | `ingestion/builder.ts`; issues.json in bundles |
| 11 | Completeness measurement | `fundamentals/derive.ts` closed derivation set (8 items); `assessment/adequacy.ts` (COMPLETE/SUFFICIENT/PARTIAL/INSUFFICIENT) with reasons; `completenessPct` on manifest | Implemented | register L-003; REL-1 manifest `completenessPct: 100` |
| 12 | Dataset construction | `ingestion/writer.ts` → content-addressed directory: `manifest.json` (contentDigest = sha256 over issuers..issues), per-entity JSONs, `coverage-report.json` | **Implemented and executed** (all WI bundles produced real datasets, digests recomputable) | REL-1 `dataset/manifest.json`; builder/writer tests |
| 13 | Versioning & content digest | Manifest separates `contentDigest`/`datasetVersion` from `lastImportAt` (R-7); chains elsewhere (IID-3) versioned | Implemented; digest excludes timestamps so identical content ⇒ identical version | roadmap R-7; manifest `digestScope` |
| 14 | Installation/registration | **Manual**: `tsx src/investment/cli/ingest.ts --input <dir> --dataset-dir <IIPS_DATA_DIR>/investment/dataset`. There is no "dataset registry", no marketplace, no fetch-on-start | Not blocked by code; simply **never executed for any operational data domain**; the REL-1/WI2 datasets could be installed locally today (Decision register O3) | `cli/ingest.ts`; `localSnapshotStore.ts` (`resolveDatasetDir`) |
| 15 | Runtime discovery | `openLocalSnapshot()` → `readDataset(dir)`; digest verification on read; fail-closed `FUNDAMENTALS_BOUNDARY_BLOCKER` on missing/corrupt | **Implemented and working** — reports `NONE` cleanly when absent | `port/localSnapshotStore.ts`; runtime output (§11) |
| 16 | API serving | `GET /api/investment/coverage/investment` (never consults identity for content; 503 only on genuine failure `INVESTMENT_DATASET_UNREADABLE`); identity disclosure carried per report | **Implemented and tested** (5 transport tests + 9 endpoint tests) | separation doc §4.2; `coverage-transport.ts` |
| 17 | Coverage calculation | `measureCoverage()` (sector) + `buildInvestmentCoverageReport()` (rows, counts, disclosure) | **Implemented and tested** (18 tests green here) | `coverage/measure.ts`, `coverage/investmentCoverage.ts` |
| 18 | UI presentation | `/investment/coverage` — own four states; dataset identity block; issuers table; sector table; method slots; identity-dependency disclosure | **Implemented and tested** (jsdom) | `InvestmentCoveragePage.tsx`; `iidCoverageSeparation.test.tsx` |

**Bottom line for the lifecycle:** stages 1–13, 15–18 are implemented and test-covered; stage 2 (acquisition) is manual evidence-grade transcription, not a productised feed; stage 14 (installation) is the missing act on every real host — which is *precisely* why the UI says `NONE`.

## 11. Root cause of `dataset NONE` (established by direct runtime evaluation)

```
$ npx tsx --eval "import { investmentCoverageFromLocalDataset } from '../iips-platform/src/investment/identity/runtime';
                  console.dir(investmentCoverageFromLocalDataset('2026-11-10'), {depth:2})"
dataset: { datasetVersion:'NONE', contentDigest:'', provider:'none', licence:'none',
           dataAsOf:null, lastImportAt:'', quality:'unavailable', completenessPct:0,
           datasetClass:'NONE', issuers:0, securities:0, listings:0, annualPeriods:0,
           quarterlyPeriods:0, prices:0, operatingMetricRecords:0, corporateActions:0,
           earliestPeriodEnd:null, latestPeriodEnd:null }
counts:   { observed:0, COVERED:0, NO_FINANCIALS:0, SECTOR_NOT_MEASURED:0, ISSUED_DATA:0 }
measuredSectors: 0 / 13 · outstandingSectors: [all 13] · issuers: []
financialCoverage: { measuredSectors:0, totalSectors:13, usableMethods:0, withheldMethods:38,
                     xbrlMappedTags:22, derivationItems:8, datasetClass:'NONE',
                     note:'Identity coverage says whether a row has a defensible issuer/security/listing. …' }
statusLine: 'No investment dataset is installed: no issuer is covered.'
```

Nothing about this contradicts a *working* pipeline — it is the honest empty answer of a correct pipeline with no input. Note that the `NONE` state is computed *from* the empty content (every sector UNMEASURED, 38 withheld), so the 22/8 constants shown are the implementation's vocabulary sizes, not dataset facts.

`npm run iid:readiness -- --json` (this host) agrees:

```
fundamentals-dataset | user-host-provisioning-required | configured:false | readable:false
  | DATASET_DIRECTORY_ABSENT → "Import an operator dataset into <IIPS_DATA_DIR>/investment/dataset …"
```

## 12. Data requirements for meaningful coverage — mandatory / optional / sector-dependent

| Category | Mandatory? | Notes |
|---|---|---|
| Issuer master (CIN/name/sector/status) | **Mandatory** | anchors everything; key basis CIN or equity-ISIN |
| Security master (ISIN, instrument class) | **Mandatory** | EQUITY-only assessable in v1 |
| Listing map (exchange/symbol/series window) | **Mandatory** for identity; not needed by dataset itself | two separate masters with separate validators |
| Annual statements (P&L, BS, CF) | **Mandatory** for any method; min 3 consecutive periods in practice (all WI bundles; the engine's staleness & trend logic expects comparatives) | the closed line-item table governs which lines exist |
| Quarterly statements | Optional today | no bundle carries quarterly; coverage would improve early-warning value; not required for current method set (all methods calibrated on annual) |
| Segment information | Sector-dependent (Energy/Materials/Industrials) | not modelled in v0; noted in design |
| Shareholding & dilution | Optional; `DILUTION_PROXY` 0.98 cap used instead (L-007) | no observed dilution anywhere |
| Dividend history | Optional; `DIVIDENDS_PAID` unmapped from XBRL (L-002/L-005) | bank dividend withheld as consequence (L-005) |
| Price history | **Mandatory for margin-of-safety output** (not for coverage) | operator-transcribed only; single observation to date |
| Corporate actions | Optional but quality-relevant | empty everywhere; L-031 |
| Sector classifications | **Mandatory** | and must match the IID spelling **exactly**: `Auto, Banking, Capital Markets, Consumer, Energy, Healthcare, Hospitality, Industrials, Insurance, Materials, Technology, Telecom, Utilities` (`SectorName`, `contracts/operatingMetrics.ts:11-24`). The certified replay baseline spells two of them `Telecommunications` / `Materials & Metals` — a roster that copies those spellings silently yields `SECTOR_NOT_MEASURED` for every issuer (see Gap G-7) |
| Financial ratios / derived metrics | Computed from closed derivation set | 8 items only; rest `NOT_COMPUTABLE` with reason |

**Missing-data behaviour is always transparent, never silent:** a missing component ⇒ absent value with reason (`NOT_REPORTED` / `NOT_COMPUTABLE: …`), the method becomes `WITHHELD` with named missing inputs, adequacy degrades (e.g. to PARTIAL), confidence caps apply (e.g. `STALE_DATA`, `DILUTION_PROXY`). No missing datum ever becomes 0. The only numeric value ever rendered without source support would be a defect — none was found on inspection; WI-2's ₹1,180.65 was operator-transcribed with source attached, and WI-3's nil declarations were transcribed from the filer's own sentences.

## 13. The 38 method slots and the 13 sectors — actual readiness

"38" = sector×method slots across the 13 sectors (`SECTOR_METHODS`, `coverage/methodMatrix.ts`). 13 distinct method ids are assigned; `SOTP` remains unimplemented (L-008) and is carried in the `MethodId` vocabulary but assigned to no sector.

| Sector | Slots (role) | Mandatory operating metric(s) | Real-issuer evidence | Synthetic R-16 evidence | Runtime (this host) |
|---|---|---|---|---|---|
| Technology | DCF_FCFF (P), PE_RELATIVE (S), EV_EBITDA (X), EV_REVENUE (X) | TM_NRR, TM_RECURRING_REVENUE_PCT for EV_REVENUE | Infosys FY22–24 + Zensar (WI6A): engine measured, intrinsic computed (WI-3) | G2_PARTIAL 3 issuers stmt 79.2% | WITHHELD — NO_DATA_FOR_SECTOR |
| Consumer | DCF_FCFF (P), PE_RELATIVE (S), EV_EBITDA (X) | none (statement-derivable) | Marico: **G1_ENABLED**, 3 usable methods, no price ingested | — (not in v1.1 synthetic) | WITHHELD — NO_DATA_FOR_SECTOR |
| Industrials | DCF_FCFF (P), EV_EBITDA (S), EV_REVENUE (X) | IN_BOOK_TO_BILL | KEC: **G2_PARTIAL**, EV_REVENUE withheld (metric missing) | — | WITHHELD — NO_DATA_FOR_SECTOR |
| Materials | DCF_FCFF (P), EV_EBITDA (S), NAV_RESERVES (X) | MM_RESERVE_LIFE, MM_COST_POSITION | none | — | WITHHELD — NO_DATA_FOR_SECTOR |
| Utilities | DCF_FCFF (P), PB_RELATIVE (S), REGULATED_ASSET_BASE (S) | UM_RAB, UM_ALLOWED_ROE | none | — | WITHHELD — NO_DATA_FOR_SECTOR |
| Auto | PE_RELATIVE (P), EV_EBITDA (S), EV_REVENUE (X) | AU_CAPACITY_UTILISATION, AU_MARKET_SHARE | none | — | WITHHELD — NO_DATA_FOR_SECTOR |
| Energy | DCF_FCFF (P), EV_EBITDAX (S), NAV_RESERVES (X) | EM_LIFTING_COST (EBITDAX), EM_RESERVE_REPLACEMENT (NAV) | none | — | WITHHELD — NO_DATA_FOR_SECTOR |
| Healthcare | DCF_FCFF (P), EV_EBITDA (S), PE_RELATIVE (X) | HC_OCCUPANCY, HC_ARPOB | none | — | WITHHELD — NO_DATA_FOR_SECTOR |
| Hospitality | DCF_FCFF (P), EV_EBITDA (S), PE_RELATIVE (X) | HM_REVPAR | none | **G1_ENABLED** (synthetic, 100/100) | WITHHELD — NO_DATA_FOR_SECTOR |
| Banking | RESIDUAL_INCOME (P), PB_RELATIVE (S), DIVIDEND_DISCOUNT (X) | BM_NIM, BM_GNPA, BM_CET1 | none | **G2_PARTIAL** (synthetic, DIVIDEND_DISCOUNT usable; residual/PB withheld on metrics) | WITHHELD — NO_DATA_FOR_SECTOR |
| Insurance | P_EMBEDDED_VALUE (P), PE_RELATIVE (X) | IM_EMBEDDED_VALUE, IM_VNB_MARGIN, IM_SOLVENCY | none | — | WITHHELD — NO_DATA_FOR_SECTOR |
| Capital Markets | P_AUM (P), PE_RELATIVE (S), DCF_FCFF (X) | CM_AUM, CM_COST_TO_INCOME | none | — | WITHHELD — NO_DATA_FOR_SECTOR |
| Telecom | EV_SUBSCRIBER (P), DCF_FCFF (S) | TL_SUBSCRIBERS, TL_ARPU | none | — | WITHHELD — NO_DATA_FOR_SECTOR |

Stage semantics (`measure.ts`): `measured = ingested issuers in the sector ≥ 1 **and** ≥ 1 annual period`; `G1_ENABLED` = measured with none withheld; `G2_PARTIAL` = some usable, some withheld; `G3_WITHHELD` = measured but none usable; `UNMEASURED` = no data — **never a pass**. The runtime's `0 of 13` is `UNMEASURED` across the board for lack of dataset; the frozen IES sector-engine certification (13 engines, program v1.1/v1.2) is a different artefact class entirely and is not consumed by this measurement.

XBRL vocabulary (22 mapped tags, `XBRL_TAG_MAP` in `ingestion/xbrl.ts:58`): RevenueFromOperations, OtherIncome, FinanceCosts, DepreciationDepreciationAmortisationAndImpairmentLoss, EmployeeBenefitsExpense, ProfitBeforeTax, TaxExpense, ProfitLossForPeriod, ProfitLossAttributableToOwnersOfParent, BasicEarningsLossPerShare…, DilutedEarningsLossPerShare…, CashFlowsFromUsedInOperatingActivities, PurchaseOfPPE…, DividendPaidClassifiedAsFinancingActivities, PropertyPlantAndEquipment, CashAndCashEquivalents, BorrowingsCurrent, BorrowingsNoncurrent, Equity, Assets, InvestmentsInAssociates, InvestmentsInJointVentures. Unmapped ⇒ visible `UNMAPPED_XBRL_TAG` issues, never zeros. Derivations (8): TOTAL_INCOME, EBIT, EBITDA, NET_DEBT, FREE_CASH_FLOW, NET_CASH_FLOW, DILUTED_SHARES, BOOK_VALUE_PER_SHARE (`fundamentals/derive.ts`). Operating metrics: 33 ids, virtually all `OPERATOR_ENTERED`, zero VENDOR — **sector metrics cannot be derived from filings and require operator entry or an admitted vendor** (design R-3).

### 13.1 The 38 sector-method rows (verbatim from `SECTOR_METHODS`)

Role: P = PRIMARY · S = SECONDARY · C = CROSS_CHECK. `STATEMENT_CORE` = REVENUE_FROM_OPERATIONS + EBITDA + OPERATING_CASH_FLOW + CAPITAL_EXPENDITURE + TOTAL_EQUITY + NET_PROFIT. Every row's truth on this host is `WITHHELD — NO_DATA_FOR_SECTOR`; statement-only rows become usable the moment data exists; metric-qualified rows need operator/vendor metric entry on top.

| # | Sector | Method (role) | Line items required | Operating metrics required | Usable without metrics? |
|---|---|---|---|---|---|
| 1 | Technology | DCF_FCFF (PRIMARY) | REVENUE_FROM_OPERATIONS, EBITDA, OPERATING_CASH_FLOW, CAPITAL_EXPENDITURE, TOTAL_EQUITY, NET_PROFIT | — | Yes |
| 2 | Technology | PE_RELATIVE (SECONDARY) | EPS_DILUTED, NET_PROFIT | — | Yes |
| 3 | Technology | EV_EBITDA (CROSS_CHECK) | EBITDA, NET_DEBT | — | Yes |
| 4 | Technology | EV_REVENUE (CROSS_CHECK) | REVENUE_FROM_OPERATIONS | TM_NRR, TM_RECURRING_REVENUE_PCT | No |
| 5 | Consumer | DCF_FCFF (PRIMARY) | REVENUE_FROM_OPERATIONS, EBITDA, OPERATING_CASH_FLOW, CAPITAL_EXPENDITURE, TOTAL_EQUITY, NET_PROFIT | — | Yes |
| 6 | Consumer | PE_RELATIVE (SECONDARY) | EPS_DILUTED | — | Yes |
| 7 | Consumer | EV_EBITDA (CROSS_CHECK) | EBITDA, NET_DEBT | — | Yes |
| 8 | Industrials | DCF_FCFF (PRIMARY) | REVENUE_FROM_OPERATIONS, EBITDA, OPERATING_CASH_FLOW, CAPITAL_EXPENDITURE, TOTAL_EQUITY, NET_PROFIT | — | Yes |
| 9 | Industrials | EV_EBITDA (SECONDARY) | EBITDA, NET_DEBT | — | Yes |
| 10 | Industrials | EV_REVENUE (CROSS_CHECK) | REVENUE_FROM_OPERATIONS | IN_BOOK_TO_BILL | No |
| 11 | Materials | DCF_FCFF (PRIMARY) | REVENUE_FROM_OPERATIONS, EBITDA, OPERATING_CASH_FLOW, CAPITAL_EXPENDITURE, TOTAL_EQUITY, NET_PROFIT | — | Yes |
| 12 | Materials | EV_EBITDA (SECONDARY) | EBITDA, NET_DEBT | — | Yes |
| 13 | Materials | NAV_RESERVES (CROSS_CHECK) | TOTAL_ASSETS | MM_RESERVE_LIFE, MM_COST_POSITION | No |
| 14 | Utilities | DCF_FCFF (PRIMARY) | REVENUE_FROM_OPERATIONS, EBITDA, OPERATING_CASH_FLOW, CAPITAL_EXPENDITURE, TOTAL_EQUITY, NET_PROFIT | — | Yes |
| 15 | Utilities | PB_RELATIVE (SECONDARY) | BOOK_VALUE_PER_SHARE | — | Yes |
| 16 | Utilities | REGULATED_ASSET_BASE (SECONDARY) | TOTAL_ASSETS | UM_RAB, UM_ALLOWED_ROE | No |
| 17 | Auto | PE_RELATIVE (PRIMARY) | EPS_DILUTED | — | Yes |
| 18 | Auto | EV_EBITDA (SECONDARY) | EBITDA, NET_DEBT | — | Yes |
| 19 | Auto | EV_REVENUE (CROSS_CHECK) | REVENUE_FROM_OPERATIONS | AU_CAPACITY_UTILISATION, AU_MARKET_SHARE | No |
| 20 | Energy | DCF_FCFF (PRIMARY) | REVENUE_FROM_OPERATIONS, EBITDA, OPERATING_CASH_FLOW, CAPITAL_EXPENDITURE, TOTAL_EQUITY, NET_PROFIT | — | Yes |
| 21 | Energy | EV_EBITDAX (SECONDARY) | EBITDA, NET_DEBT | EM_LIFTING_COST | No |
| 22 | Energy | NAV_RESERVES (CROSS_CHECK) | TOTAL_ASSETS | EM_RESERVE_REPLACEMENT | No |
| 23 | Healthcare | DCF_FCFF (PRIMARY) | REVENUE_FROM_OPERATIONS, EBITDA, OPERATING_CASH_FLOW, CAPITAL_EXPENDITURE, TOTAL_EQUITY, NET_PROFIT | — | Yes |
| 24 | Healthcare | EV_EBITDA (SECONDARY) | EBITDA, NET_DEBT | HC_OCCUPANCY, HC_ARPOB | No |
| 25 | Healthcare | PE_RELATIVE (CROSS_CHECK) | EPS_DILUTED | — | Yes |
| 26 | Hospitality | DCF_FCFF (PRIMARY) | REVENUE_FROM_OPERATIONS, EBITDA, OPERATING_CASH_FLOW, CAPITAL_EXPENDITURE, TOTAL_EQUITY, NET_PROFIT | — | Yes |
| 27 | Hospitality | EV_EBITDA (SECONDARY) | EBITDA, NET_DEBT | HM_REVPAR | No |
| 28 | Hospitality | PE_RELATIVE (CROSS_CHECK) | EPS_DILUTED | — | Yes |
| 29 | Banking | RESIDUAL_INCOME (PRIMARY) | NET_PROFIT, TOTAL_EQUITY, BOOK_VALUE_PER_SHARE | BM_NIM, BM_GNPA, BM_CET1 | No |
| 30 | Banking | PB_RELATIVE (SECONDARY) | BOOK_VALUE_PER_SHARE | BM_GNPA | No |
| 31 | Banking | DIVIDEND_DISCOUNT (CROSS_CHECK) | DIVIDENDS_PAID, EPS_DILUTED | — | Yes |
| 32 | Insurance | P_EMBEDDED_VALUE (PRIMARY) | NET_PROFIT, TOTAL_EQUITY | IM_EMBEDDED_VALUE, IM_VNB_MARGIN, IM_SOLVENCY | No |
| 33 | Insurance | PE_RELATIVE (CROSS_CHECK) | EPS_DILUTED | — | Yes |
| 34 | Capital Markets | P_AUM (PRIMARY) | NET_PROFIT, TOTAL_EQUITY | CM_AUM, CM_COST_TO_INCOME | No |
| 35 | Capital Markets | PE_RELATIVE (SECONDARY) | EPS_DILUTED | — | Yes |
| 36 | Capital Markets | DCF_FCFF (CROSS_CHECK) | REVENUE_FROM_OPERATIONS, EBITDA, OPERATING_CASH_FLOW, CAPITAL_EXPENDITURE, TOTAL_EQUITY, NET_PROFIT | — | Yes |
| 37 | Telecom | EV_SUBSCRIBER (PRIMARY) | EBITDA, NET_DEBT | TL_SUBSCRIBERS, TL_ARPU | No |
| 38 | Telecom | DCF_FCFF (SECONDARY) | REVENUE_FROM_OPERATIONS, EBITDA, OPERATING_CASH_FLOW, CAPITAL_EXPENDITURE, TOTAL_EQUITY, NET_PROFIT | — | Yes |

Withholding conditions are uniform and transparent: (1) the sector has no issuer data → `NO_DATA_FOR_SECTOR`; (2) the sector has data but a required line item is missing → `MISSING_LINE_ITEMS: <ids>`; (3) required operating metric absent → `MANDATORY_METRIC_MISSING: <ids>`; (4) derived into an issuer but quality gate failed (e.g. suspicious value) → issue-specific reason. All paths leave the slot `WITHHELD` with the reason attached — none approximates a figure (verified against `measureMethod` in `coverage/measure.ts` and exercised in tests `investment-coverage.test.ts`). SOTP is intentionally unassigned and `METHOD_NOT_IMPLEMENTED` (L-008).

## 14. Data source and refresh requirements

| Item | Today | Refresh | Failure recovery |
|---|---|---|---|
| Fundamentals (statements) | Operator transcription from audited PDFs → CSV/XBRL; no XBRL instance yet | Per annual/quarterly filing; operator-paced | Re-run ingest; manifest digest proves which input produced which dataset; prior datasets preserved by digest directory |
| Operating metrics | Manual `operating-metrics.csv` per sector | With each entry; stale > window (7 calendar days for price freshness today) caps confidence (`STALE_DATA`) | Correct entry → new dataset version (append-only content addressing) |
| Prices | Manual; WI-2 single close | Undefined operationally — no schedule; WI-2 limitation L-032 forces contemporary prices | Re-transcribe; never back-edit a dataset in place (new version) |
| Corporate actions | Empty | Manual on event | Roster/CA repair; resolver refuses (STALE_REFERENCE) rather than guess |
| Reference data (roster/map/CA) | Manual; validated per load | See §7.3 | Loader fail-closes; fix file; re-run |
| Engine calibration | Frozen v2.0, replay baseline v1.1 (2026-08-09) | None — certification-governed | Out of scope here |

**What operates with existing infrastructure:** everything above — it needs discipline, not new infrastructure. **What requires something external:** a licensed or regulator-hosted fundamentals feed (India XBRL from MCA21 / BSE/NSE filing repositories are the plausible governed future sources, subject to a product/licensing decision — none is admitted today), a price feed (BSE/NSE EOD or a vendor), and IPD's binding + IPC peer + (for full universe) a governed roster expansion.

---

# PART III — THE RELATIONSHIP BETWEEN THE TWO CAPABILITIES

## 15. Dependency graph

```
                       ┌──────────────────────────── IRR (this repo) ────────────────────────────┐
                       │                                                                          │
  Broker Import ──────►│  preview rows ──► POST /coverage/preview (client-side eval, no persist)  │
  (CAP-02/03 lane)     │                                                                          │
                       │  Watchlists (UI07, owner-scoped NDJSON) ──┐                              │
                       │                                           ▼                              │
  IPD IPC (read-only) ─►│  holdings ──► createHoldingsProvider ─► IdentityObservation[]            │
  (IPD binding,         │                    ▲                     │                               │
   USER-PORTFOLIOS)     │                    │ IpcUserPortfolioPort │                               │
  Watchlists service ──►│  items ────► createWatchlistProvider ────┤                               │
                       │                                           ▼                               │
                       │        loadIdentitySourcesFromDir() ──► RESOLVER ──► IdentityCoverageReport│
                       │        ($IIPS_DATA_DIR/investment/identity)   │                           │
                       │                                              ▼                            │
                       │        openLocalSnapshot($IIPS_DATA_DIR/investment/dataset)               │
                       │                    │                         │                             │
                       │                    ▼                         ▼                             │
                       │           measureCoverage()      buildInvestmentCoverageReport()          │
                       │                    │                         │                             │
                       │                    ▼                         ▼                             │
                       │           Investment Coverage  (per-issuer / per-sector / 38 slots)        │
                       │                    │                                                        │
                       │                    ▼                                                        │
                       │   Assessment engine (IID-2) ──► NP-04 artifact chains (IID-3)              │
                       │        │                                                     │              │
                       │        ▼                                                     ▼              │
                       │   Disposition engine (IID-4)                    Change intelligence (IID-5) │
                       │        │                                                     ▲            │
                       │        ▼                                                     │            │
                       │   UI06/UI10 surfaces, reports (/reports, NP-04-backed) ───────┘            │
                       └──────────────────────────────────────────────────────────────────────────────┘
                       ┌── IPD (ramkivs/iips-production-market-data @ pinned SHAs) ────────────────┐
                       │  NP-04 governed persistence (pin 2e11fa3b)  ·  D114 PIT / D05 security      │
                       │  master (pin 1aee57fe09)  ·  P4 identity HTTP contract  ·  binding + IPC     │
                       └──────────────────────────────────────────────────────────────────────────────┘
```

**Hard dependencies (feature cannot produce its output without them):**
- Identity Coverage ← the 3 identity files; ← observations (at least one of: IPD IPC holdings, watchlists, broker preview).
- Holdings observations ← IPD active binding + IPC peer (IPD-owned) **and** `IpcUserPortfolioPort` configured.
- Investment Coverage ← the local dataset directory; (nothing else — by construction it does not hard-depend on identity).
- Assessments ← dataset + identity-resolved issuer + NP-04 store configured + reports owner carrier.
- Change intelligence ← ≥2 stored assessment versions.
- Broker preview evaluation ← browser-held rows only; no server dependency.

**Optional integrations (degrade gracefully):**
- Identity Coverage ← financialCoverage disclosure (dataset absent ⇒ disclosure says so; counts unchanged).
- Investment Coverage ← identity sources (absent ⇒ `identityDependency: null` — "not evaluated").
- Watchlist integration ← identity resolution (sector references never resolve — informational only).
- D115/Dhan DHAN lane ← only for the market-data surfaces, unrelated to IID reads.

## 16. Answers to the ten questions

1. **Can Investment Coverage operate without Identity Coverage?** Yes — by construction (2026-11-10 separation). It reads only the local snapshot store and reports the dataset position; identity absence is disclosed (`identitySourcesAvailable: false`), never enforced.
2. **Can Identity Coverage operate without an installed investment dataset?** Yes — with a *caveat*: it fails at the identity-sources step first (files absent) regardless of dataset. If files were installed but the dataset absent, identity coverage would compute fully; only its financial-coverage disclosure would read NONE.
3. **Which APIs require both?** None strictly. The *assessment* minting flow (`generate-investment-artifacts.ts`, IID-01) needs both a dataset (inputs) and identity-resolved issuer (subject). The per-holding assessment *open* affordance in the UI (link from an identity-resolved row to `/investment/company/:issuerId`) needs both a resolved identity and a stored assessment.
4. **Which screens/workflows require only one?** `/identity-coverage` (identity only), `/investment/coverage` (dataset only), `/investment/company/:issuerId` (stored assessments — dataset-derived, identity not re-checked), watchlists (neither), broker preview (neither).
5. **Can financial coverage be calculated at issuer level before a holding is identity-resolved?** Yes — the dataset's per-issuer position is computed from the dataset alone. What identity resolution adds is the link from an *observed holding* to that issuer.
6. **At what point is a resolved security associated with financial information?** When the analysis CLI/endpoint assesses `issuerId`: the engine reads the dataset filtered to that issuer (and its securities), never the identity report. The association exists at **assessment time**, not at coverage time.
7. **Issuer financially covered but security unresolved?** The dataset says COVERED/NO_FINANCIALS/etc. for the issuer; the holding row stays unresolved (`UNMATCHED`/…) and the UI offers no assessment link for it. Both statements are true and shown side by side — the link is only minted on `RESOLVED` rows.
8. **Security resolved but financials unavailable?** Identity says `RESOLVED`; Investment Coverage says `NO_FINANCIALS` (or `SECTOR_NOT_MEASURED` / `ISSUED_DATA`); assessment minting would fail at input time with the named reason; stored assessments (if any) still read.
9. **How are the differences presented?** Two separate pages (since 2026-11-10), two separate endpoints, separate client error types (`IdentitySourcesUnavailableError` vs `InvestmentCoverageUnavailableError`), a per-row `identityDependency` cell ("not evaluated" / "unresolved" / "resolved") on the investment page, and disjoint status lines.
10. **Any incorrect coupling suppressing valid information?** One: `coverageEndpoint` returns 503 when the **observation sources** throw (e.g. holdings unavailable under IPD binding) even if identity *sources* loaded — the whole holdings lane goes dark rather than the watchlist lane. This is deliberate (a silently omitted surface would manufacture a wrong total) and was observed in P6-A (`observation-sources-unavailable`). Watchlist observations alone still feed preview-style reads via `/api/investment/coverage/preview`. No other coupling found; the 2026-11-10 defect (shared failure wording) is fixed.

## 17. Cross-cutting finding — Watchlists and identity observations

Post-PR-#554, watchlist items hold certified **sector reference identifiers** (`Technology`, …). The identity observation adapter maps watchlist items to observations by parsing `canonicalSecurityId` as an `IN:ISIN:` security id (`toWatchlistObservation`, `sources.ts:66`). Sector references therefore never resolve — they classify `SECTOR_REFERENCE_NOT_AN_IDENTITY` ("This identifier is a sector reference (for example "Banking-H1"), not a company or security"). This is *correct* but consequential for §5E of the operating model: **watchlists as a surface cannot drive company-level identity or analysis today**, no matter which identifier the user types. Issuer-level watchlists await the Decision register (O1, O8).

---

# PART IV — PREREQUISITES, DEPENDENCIES AND BLOCKERS

## 18. Consolidated dependency and readiness matrix

Blocker classes — **1** missing source data · **2** missing configuration · **3** runtime/deployment · **4** missing implementation · **5** external provider/licence · **6** data-quality · **7** integration dependency · **8** product decision required. **C** = confirmed (observed here) · **S** = suspected · **U** = unknown.

| Capability | Required prerequisite | Status | Evidence | Class (C/S/U) | Owner / area | Action required |
|---|---|---|---|---|---|---|
| Identity reference files (roster) | Governed issuer master covering the intended universe | **Absent**; fixtures are synthetic; 3 one-issuer operator sets in evidence/ | readiness CLI; loader run; `find . -name eligible-roster.json` | 1 (C) | Product owner + data governance (operator or IPD under act) | O1 (roster authority) / O2 (bridge admission); author or commission the roster |
| Identity reference files (listing map) | Effective-windowed listings per security | Absent (same files) | same | 1 (C) | same | same |
| Identity reference files (corporate actions) | Action table incl. MERGER/DEMERGER successors | Absent (empty in all committed fixtures/bundles) | same; L-031 | 1 (C) | same | same; event-driven transcribe |
| Identity source loading | Valid files + read permission | Implemented; loader proven on fixtures and 3 real sets | `loadIdentitySourcesFromDir` runs | — (C: works) | IRR | Install files (P6-A D1) |
| Identity resolution | Files + observations | Implemented; 9 states, deterministic, name-blind | `resolveIdentity`; identity suites green in PR #554 CI (run 43023111359) | — (C: works) | IRR | none — only provision inputs |
| Holdings observation (IID-02 lane) | IPD active binding + IPC peer + portfolio reads | **Not provisioned**; IRR can only read the declaration | readiness CLI; P6-A D5/D6 | 7 (C) | **IPD** (binding), user host (`IIPS_G2_IPC_ENDPOINT`) | IPD provisioning procedure; then set endpoint |
| Broker Import integration | CAP-02/03 lane; preview-side only for IID | Preview endpoint implemented; import itself works (evidence retention); no IID persistence | `coverage/preview` tests; WS-A docs | 7 (C for preview) | IRR + IPD pins | None for coverage; broker lane is separate acceptance |
| Watchlist integration | Watchlists owner context (F-3 carrier) | Read works with carrier; sector references unresolvable by design | watchlists tests; sources.ts | — (C) | IRR | Carrier materialise; issuer-level watchlists need Decision-register item O8 |
| Investment data providers | Any admitted fundamentals/price source | **None admitted**; v1 = operator file-in; IPD PIT is non-prod market-data | roadmap D-1; no vendor client anywhere | 5 (C: none exists) | Product owner | O4 (provider licensing); a governed India-XBRL/MCA source may be admitted later under it |
| Dataset ingestion | `cli/ingest.ts` (XBRL/CSV) | Implemented & tested | ingest CLI; builder/xbrl/csv tests | — (C: works) | IRR | Run it on real inputs (O3, dataset admission) |
| Dataset installation | Operator runs ingest into `IIPS_DATA_DIR/investment/dataset` | Never done anywhere operational | readiness CLI DATASET_DIRECTORY_ABSENT | 2 (C) | User host | O3 (dataset admission); acceptance in §23 |
| Dataset registry | content-addressed manifest in-dataset | Implemented (`contentDigest`, `digestScope` excludes mtimes); no cross-dataset registry exists | writer; manifest | 4 (partial, C) | IRR | None today; multi-dataset registry = new design (avoid) |
| Dataset serving | `openLocalSnapshot` + digest verify | Implemented; reports NONE when absent | runtime output §11 | — (C: works) | IRR | none |
| Financial normalization | line-item table + sign conventions | Implemented (~40 items, V1/V2 schemas) | `lineItems.ts` | — (C) | IRR | Extend tags with real filings (L-002) |
| XBRL mapping | India XBRL tags for Ind AS filings | 22 tags; visible-gap policy | `XBRL_TAG_MAP`; register L-002 | 1/6 (C: partial) | IRR | Add tags per real filing with golden fixtures |
| Financial derivation | closed set | 8 derivations; closed on purpose | `derive.ts`; L-003 | 1/4 (C: partial) | IRR | Add only with golden vectors + formula ids |
| Sector measurement (dataset) | measurement over installed data | 0/13 runtime; 3/13 synthetic R-16 (Banking, Hospitality, Technology); 100%-usable measured only for Technology/Consumer/Industrials on REAL filings (Infosys, Marico, KEC) | coverage reports; WI bundles | 1 (C) | IRR + owner data | O3 (dataset admission); install real bundles; per-sector enablement ladder |
| Sector measurement (engines) | 13 certified frozen engines | 13/13 certified (program v1.x) | EngineRegistry; certification program | — (C, done elsewhere) | Program/IES | none — different artefact; do not conflate |
| Price history | Transcribed observations | WI-2 single close only; unadjusted-price caveat; freshness window 7d (design 5d) | WI-2; L-030..L-033 | 5 (C: absent) | Product owner/operator | O4 (provider/price licensing); admit a feed or transcribe EOD closes |
| Corporate actions | CA table + successor reconciliation | Validator implemented; table empty in all data seen | L-031; CA validator | 1 (C) | operator | Transcribe events; verify reconciliation |
| Company analysis (IID-2) | Dataset + identity + NP-04 + owner carrier | Code complete; demonstrated on 3 real issuers; nothing operational anywhere | WI bundles; runbook §14 | 7/2 (C: blocked by inputs) | IRR + user host | O3 (dataset admission) + P6-A D2/D3; mint/store versions; `show-investment-chain` |
| Portfolio decision support (IID-4) | Above + IPD binding + limits policy + stored assessments | Code complete; zero verbs issued anywhere operational | disposition engine; runbook §15 | 7/2 (C) | IRR + IPD | IPD provisioning (P6-A D5/D6); O5 (limits policy content); store path (P6-A D2) |
| Report persistence & comparison | IID-3/IID-5 chains + NP-04 | Code complete; empty store; change-intelligence starves without ≥2 versions | closure; reports NP06 (real-report persistence merged 2026-11-05) | 7/2 (C) | IRR + NP-04 pin | NP-04 path; mint versions; compare via ChangeTimeline |
| Data refresh & monitoring | none — no scheduler, no staleness monitor | Not implemented; freshness windows enforced at read time only | design; L-032/33 | 4 (C) | IRR (future) / operator (today) | Operational checklist; weekly hygiene |

**Confirmed:** every "C" row above was observed in this environment or in committed evidence. **Suspected:** none material — the remaining uncertainty is Windows-host state (§27 U-1) and provider licensing (O4). **Unknown:** see §27.

## 19. What can be used today — practical capability inventory

**Usable now (this host, after `npm ci` + build; read-only):**
- The readiness diagnostic (`npm run iid:readiness [-- --json|--strict|--data-dir]`) — the single best operational entry point; exit 1 under `--strict` lists every outstanding dependency with owner and required action.
- `/identity-coverage` fail-closed page (correct behaviour when the files are absent; useful for verifying provisioning).
- `/investment/coverage` empty-position page (honest NONE; useful to verify dataset installation later).
- Broker-import preview evaluation (`POST /api/investment/coverage/preview`) — per-row verdicts from browser-held rows, no persistence.
- Watchlists (post-PR-#554) with actionable refusals and the certified-reference disclosure.
- The ingestion CLI on any operator-prepared input directory → a digested dataset directory.
- The coverage measurement (`measureCoverage`, CLI `renderCoverageSummary` output inside ingest) on any dataset.
- Stored-assessment read surface (`/investment/company/:issuerId`) — once at least one version exists; currently 404 everywhere by absence.
- Evidence-grade real-issuer runs for Infosys/Marico/KEC (repeatable from committed inputs; see bundle READMEs).

**Usable with manual provisioning (user host, no code change):**
- Identity Coverage over one-issuer rosters (the three evidence sets) or any roster the operator authors — `iid:readiness` flips `identity-files` to valid.
- Investment Coverage over the REL-1 / WI2 / Marico / KEC datasets — a digest-verified local install makes `/investment/coverage` list real covered issuers (Infosys: 1 issuer; measured Technology sector; methods as measured in WI-3).
- One full assessment loop (assess → persist → read → change-compare) for Infosys (WI-3 inputs), exercising NP-04 with two versions.
- Local personal-use write enablement (`IIPS_LOCAL_PERSONAL_USE=1`) — a condition, never authority.

**Implemented but blocked by missing dependencies:**
- IID-01 Stock Intelligence (blocked: dataset + records), IID-02 Holding Decisions (blocked: IPD binding + IPC peer), IID-03 Historical Change Intelligence (blocked: ≥2 stored versions), identity-scoped assessment deep-links (blocked: identity files).

**Partially implemented:**
- XBRL mapping (22/∞), derivation set (8 closed), operating-metric ingestion (33 ids, entry-only), sector measurement coverage (3/13 synthetic; 3 real issuers in 3 sectors, evidence-only), corporate actions (validator complete, data empty), report comparison (code complete, no versions), staleness/freshness monitoring (read-time only).

**Not yet implemented:**
- Any automated data acquisition; any scheduler/monitor; observed dilution (L-007); SOTP (L-008); non-INR/foreign issuers; non-equity assessable securities; restricted cash (L-006); a cross-dataset registry.

**Requires a product decision:**
- O1 identity roster authority, scope and refresh cadence; O2 D05-authenticated-universe bridge admission; O3 dataset admission & scope (which issuers, accept evidence-grade OPERATOR_SUPPLIED data); O4 provider/price licensing posture; O5 limits-policy content (the defaults are placeholders); O6 disposition operating mode for the local portfolio; O7 freshness/refresh cadence; O8 issuer-level watchlists. See §28.

## 20. The two empty states, precisely, with the numbers the user quoted

| UI figure | Means | Where produced |
|---|---|---|
| `Identity sources unavailable / IDENTITY_SOURCE_MISSING / missing file(s): roster, listingMap, corporateActions` | The three files do not exist under the resolved directory — not a loader error, not a config typo, not an ownership defect | `loadIdentitySourcesFromDir` → `coverageEndpoint` 503 → `IdentityCoveragePage` |
| `Investment dataset NONE / version NONE / provider none / licence none` | No dataset directory/manifest at `<IIPS_DATA_DIR>/investment/dataset` | `investmentCoverageFromLocalDataset` → `buildInvestmentCoverageReport` |
| `Quality unavailable / Completeness 0% / Issuers 0 / securities 0 / listings 0 / annual 0 / quarterly 0 / prices 0 / operating metrics 0 / corporate actions 0` | The measured empty content: every count is 0 because the content set is empty; `completenessPct` derives from the (empty) measurement | same |
| `Covered issuers: 0 / Sector measurement: 0 of 13` | `UNMEASURED` across all 13 `SECTOR_METHODS` sectors | `measure.ts` — `measured = issuers>0 && annual periods>0` |
| `Methods usable / withheld: 0/38` | All 38 sector×method slots `WITHHELD` with `NO_DATA_FOR_SECTOR` | `measureMethod()` over empty content |
| `XBRL tags mapped: 22` · `Derivable line items: 8` | Implementation vocabulary sizes (constants), shown for orientation — **not** dataset coverage | `XBRL_TAG_MAP`, `DERIVATIONS` |

The user's numbers reproduce exactly on this host. They also reproduce on any fresh checkout with `.iips-data` absent — including the Windows host if its data domain was never provisioned. **The Windows host remains uninspected** (§27 U-1); if the user provisioned files on Windows, their path (`IIPS_DATA_DIR` or the cwd used to start `npm run server:dev`) is where to look first.

---

# PART V — PRACTICAL DAY-TO-DAY OPERATING MODEL

> Everything below assumes Stage 1–3 (provisioning) are complete on the user host. Where a step cannot run today, it is marked **[BLOCKED]** with its blocker class.

## A. Daily portfolio review

1. Open `/identity-coverage`. The first row of KPIs: observed holdings, assessable (resolved), unresolved.
2. Each holding row shows state; `RESOLVED` rows link to the stored company assessment. Holdings failing identity are listed with reasons (e.g. `ISIN_NOT_IN_ROSTER` → operator must add the issuer).
3. Open `/investment/coverage`. Per-issuer rows show the dataset position for anything installed: `COVERED` = financials present & sector measured; `NO_FINANCIALS` = roster knows it, dataset doesn't; `SECTOR_NOT_MEASURED` = dataset holds it but the sector lacks a measured method; `ISSUED_DATA` = an ingestion issue was recorded (see issues, fix source).
4. Holdings in measured sectors with stored assessments surface current verdicts in `/portfolio` (IID-2/IID-4 affordances); holdings unassessable stay visible as unmeasured weight, **never** as zero-weight advice (L-018).
5. Any holding showing `STALE_REFERENCE` / `LISTING_WINDOW_EXPIRED` needs reference-data maintenance before any verdict is trusted on it.

## B. New broker import

1. Import in the Broker Import surface (CAP-02/03 lane; journal-only; no price/trade columns).
2. Preview rows can be identity-evaluated immediately (`/api/investment/coverage/preview`): per-row `QUALIFIED/UNRESOLVED/AMBIGUOUS`-style broker evidence is shown as the *broker's* claim, never as IIPS identity.
3. Persisted holdings flow through IPD (WS-A/Gate 4, non-production personal-use mode). Next holdings read → IID identity re-resolves everything; new rows appearing as `UNMATCHED` mean the roster lacks the issuer — the repair is one operator edit to `eligible-roster.json` (+listing/CA if new listing).
4. After provisioning a roster entry, the same holding flips to `RESOLVED` with no code change — identity is data, not code.

## C. Individual stock research

| Question | Available today? | Where / why |
|---|---|---|
| Business & fundamentals (growth, margins, cash flow, debt, dividends) | **Partially, on installed data** | Assessment payload (`/investment/company/:issuerId`) — IID-2 fundamentals: revenue/PAT/EPS/CFO/capex/net debt/dividends, with reasons for anything missing. Real, complete only for installed issuers (e.g. Infosys bundle) |
| Revenue & earnings trends | Yes, once ingested | NormalizedPeriods (FY22, FY23, FY24…) with YoY visible in payload |
| Profitability | Yes | Gross/EBITDA/EBIT/PAT margins — derivation set covers EBIT/EBITDA; rest shown as ratios from filed facts |
| Debt & liquidity | **Yes, with the WI-3 caveat** | Gross/net debt resolve when borrowings are filed or declared nil; leases resolved in WI-3; current maturities needed footnote-level decomposition (KEC Note 30) |
| Cash flow | Yes | CFO/FCF computed; capex line present in map |
| Capital allocation | Partially | Reinvestment (capex/revenue), buybacks/dividends visible when filed; no framework-level "capital allocation score" exists |
| Dividend history & sustainability | Partially | `DIVIDENDS_PAID` in tag map; payout derivation not in the closed 8 (would show NOT_COMPUTABLE); bank dividend withheld (L-005) |
| Valuation | **Yes, conditionally** | WI-3: intrinsic range + MoS on Infosys with real data & price (₹875/₹1,089/₹1,400; MoS −8.42%; band FAIR). Withheld paths state why (e.g. `NO_PRICE_OBSERVATION`, `INTRINSIC_WITHHELD`) |
| Sector-relative assessment | **No (Not for user holdings)** | CSIP scores are sector-engine outputs for certified sector references, not for user issuers (L-022); sector *method* availability is per §13 |
| Freshness & completeness | Yes | manifest `dataAsOf`, `completenessPct`, dataset class, `lastImportAt`; payload `knownAsOf`/`dataAsOf` |
| Risks & missing information | Yes | assessment risk dimensions with evaluated/unevaluated separation (D-3); adequacy `PARTIAL` names the gaps |

## D. Holding-level investment decisions (RETAIN / ACCUMULATE / REDUCE / AVOID)

IIPS decision support separates **three layers** — data availability → analytical assessment → decision support. Coverage only answers the first.

- **Data availability** (this report): identity resolution + financial completeness. Without it: no further layer runs — fail-closed, by rule.
- **Analytical assessment** (IID-2/IID-4): evidence engine with confidence (caps for staleness, dilution proxy, policy-default WACC/multiples); disposition engine applies the operator limits policy and produces RETAIN / ACCUMULATE / REDUCE / AVOID (held subjects) or INITIATE / WATCH / AVOID_CANDIDATE (candidates) with rationale and portfolio implication ("not an instruction", `interpretation.noExecutionPath = true`).
- **Decision support** is explicitly not an order, not a size, not a timing, not a recommendation to anyone but the local user.

Requirements per disposition class: RETAIN ≈ SUFFICIENT evidence + limits within bounds; ACCUMULATE ≈ stronger margin + capacity headroom (limits policy must authorize adding — it is operator-supplied, defaults are placeholders, L-019); REDUCE ≈ coverage/quality deterioration or limit breach; AVOID ≈ avoidance-grade evidence or unsupported security/distressed disclosures. **INSUFFICIENT evidence yields no verb (L-021)** — silence is the system working, not a bug.

Today none of this can run for real holdings: it lacks (i) installed datasets for the issuers, (ii) identity files, (iii) IPD binding + IPC peer for portfolio reads (IID-02), (iv) limits policy file, (v) ≥1 stored assessment per subject. Every one is provisioning or decision, not code.

## E. Watchlist monitoring

Today the watchlist surface answers only: *is this identifier a member of the host's certified reference universe?* It monitors nothing per security — no price alerts (no price history), no fundamental triggers on issuer rows (triggers fire on **governed universe rows only**, i.e. sector references), no notifications (no scheduler), no dividend/debt deterioration detection.

With Stage 3 done and issuer-level observations admitted (O8), the natural capability would be: rows for real issuers with (a) identity state, (b) latest stored assessment summary, (c) trigger evaluation on fundamentals-derived fields. **That is new product scope, not a configuration toggle** — it requires the certified issuer universe the product does not have. Until then: use `/investment/company/:issuerId` on demand as the research anchor, and the change-timeline (IID-5) once ≥2 stored versions exist, to see what moved.

## F. Periodic portfolio review (weekly / monthly / quarterly)

1. Re-run `iid:readiness --strict` (weekly) — catches absent/corrupted reference files before they bite.
2. Re-ingest any updated filings (monthly/quarterly) — each ingest yields a **new** dataset version (content-addressed); nothing is edited in place.
3. Mint a new assessment per covered issuer (operator CLI) — each append creates the next version in the issuer's chain.
4. Open `/reports` and the company's change timeline: successive persisted assessments are compared field-by-field (observed deltas with categorical separation; no fabricated attribution; cross-model attribution is `UNAVAILABLE` by design, L-028; materiality thresholds are published defaults, L-029).
5. For the portfolio as a whole: holding dispositions re-evaluate against the stored chain heads; the report record persists (NP-04), so a review conversation next month can diff rankings, risks and rationales — provided versions were minted at both points.
6. Staleness: freshness windows (price 7 calendar days, `mos` policy) and statement recency gates are enforced at read time; a portfolio untouched for a quarter will surface `STALE_DATA` caps honestly rather than hide them.

**Comparison workflow is implemented but unusable today** purely because nothing has been persisted. The blocker is O3 (dataset admission) plus the NP-04 path (P6-A D2) and the Reports carrier (P6-A D3), not code.

---

# PART VI — RECOMMENDED PATH TO OPERATIONAL READINESS

## 21. Sequenced stages (dependency-driven)

Every stage states: objective · prerequisites · existing implementation · remaining work · acceptance criteria · evidence required · dependencies · can it proceed independently.

### Stage 1 — Runtime and source discovery
- **Objective:** deterministic, per-host truth about what the runtime needs, who owns it and what is missing — before any provisioning or code change.
- **Prerequisites:** none.
- **Existing:** `npm run iid:readiness` (P6-A, merged 2026-11-09), `docs/OPERATOR_RUNBOOK.md` §16, this report.
- **Remaining:** run `npm run iid:readiness -- --strict` **on the operator's Windows host** and record the result; compare `IIPS_DATA_DIR` resolution to the directory the user believes holds the files; re-run the two routes and compare with this report.
- **Acceptance:** `iid:readiness --json` prints the eight findings on the actual host; no `unknown-investigation-required` remains; output stored outside Git.
- **Evidence:** host capture; runbook §16 checklist ticked.
- **Dependencies:** none. **Independent:** yes.

### Stage 2 — Identity readiness
- **Objective:** an installed, validated identity reference set for the intended population, accepted by the platform's own loader.
- **Prerequisites:** Stage 1; **O1 decision** (source & scope of the roster); **O2 decision** if the D05-authenticated-universe bridge is to be considered.
- **Existing:** loader + validators (fail-closed); three validated starting points committed (evidence sets: Infosys, Marico, KEC; synthetic fixture for mechanics only); the readiness gate `identity-files` (P6-A D1).
- **Remaining:**
  1. Decide the population (issuer list, eligibility rules, exclusion reasons) — a data-owner act, not engineering.
  2. Produce/refresh `eligible-roster.json`, `listing-map.json`, `corporate-actions.json` from that decision; validate with the loader; digest them.
  3. Decide refresh cadence + owner (NSE/BSE master events; symbol changes).
  4. Re-run `/identity-coverage` — expect `available: true` and real per-row states for known securities (e.g. a portfolio row for Infosys resolves against the REL-1 roster).
- **Acceptance:** loader reports `available` on the Windows host; a **real** holding (or the broker preview rows) resolves `RESOLVED` or carries a named non-resolved state; counts add up (observed = assessable + unresolved); SF: 0 `ISSUER_KEY_CONFLICT`.
- **Evidence:** directory listing + digests; readiness output flipping `identity-files` to valid; a screenshot/capture of resolved rows (host-supplied).
- **Dependencies:** O1 (and P6-A D1 acting on it); O2 optional. **Independent:** of Stage 3 (can run first); of IPD.
- **Do not:** copy synthetic fixtures into the operational domain; invent identifiers; widen resolver rules to force `RESOLVED`.

### Stage 3 — Investment dataset readiness
- **Objective:** at least one real, digest-verified operator dataset installed at `${IIPS_DATA_DIR}/investment/dataset`, plus the ingestion habit.
- **Prerequisites:** Stage 1; **O3 decision** (which issuer set; accept OPERATOR_SUPPLIED evidence-derived datasets as local operational inputs, with all caveats attached).
- **Existing:** full ingestion path (`cli/ingest.ts`), content-addressed datasets with digests, four committed **real** datasets (REL-1 Infosys incl. price-bearing WI2/WI3 inputs; WI2; WI7 Marico; WI8 KEC), measurement tooling, evidence corpus.
- **Remaining:**
  1. Choose the initial population (recommended: Infosys + Marico + KEC — three sectors, three issuers, smallest honest universe).
  2. Install via `tsx src/investment/cli/ingest.ts --input <bundle>/ingest-input --dataset-dir <IIPS_DATA_DIR>/investment/dataset` (REL-1: use `REL-1-INFOSYS-2026-11-06/dataset/` directly, or rebuild from `ingest-input/`).
  3. Decide and document freshness expectations (dataAsOf FY2024/FY2026 depending on bundle; stale-but-real is still honest).
  4. Add operating metrics for the target sectors (BM_*/NN for Banking etc. require operator entry — Capital Markets/Telecom/Banking are blocked until someone transcribes their metrics; Consumer/Industrials/Technology can start).
- **Acceptance:** `/investment/coverage` lists the installed issuers with non-NONE class (`OPERATOR_SUPPLIED`), sector measurement reflects measured sectors (Technology, Consumer, Industrials), methods usable > 0 for those sectors; `iid:readiness` flips `fundamentals-dataset` to valid; digests recompute.
- **Evidence:** readiness output; page capture (host); manifest listing (paths + digests).
- **Dependencies:** O3. **Independent:** of Stage 2 (can run in parallel); of IPD.
- **Note:** installing the evidence bundles **does not** make them market truth — single-issuer, transcribed, annual-only, no quarterly, corporate-action table empty. Every surface will keep saying so.

### Stage 4 — Coverage readiness
- **Objective:** issuer coverage, completeness, method usability and sector measurement verified on **installed** data, with the 10-scenario demo (§23) passing.
- **Prerequisites:** Stages 2–3.
- **Existing:** all measurement code; `measureCoverage` CLI output embedded in ingest; unmapped-tag visibility; adequacy ladder.
- **Remaining:** run the measurement on the installed data; reconcile against bundle expectations (Infosys: Technology measured, EV_REVENUE withheld absent TM_* metrics; Marico: G1_ENABLED; KEC: G2_PARTIAL); decide whether to enter operating metrics to unlock TM_/IN_/BM_ families; fill corporate actions as events occur; extend tag map only with golden-fixture discipline (L-002 process).
- **Acceptance:** per-sector `measured: true` for Technology/Consumer/Industrials with the methods above usable; unavailable methods carry reasons; completeness/adequacy computed per issuer; zero fabricated figures (spot-check 5 derived values against filings by hand).
- **Evidence:** ingest coverage output; coverage report JSON; hand-check notes.
- **Dependencies:** Stage 3. **Independent:** of IPD (all three chosen issuers avoid metric-dependent methods except IN_/TM_).

### Stage 5 — End-to-end integration
- **Objective:** holdings → identity → dataset → assessment → disposition, and watchlist/finance disclosure, working as one loop on the host.
- **Prerequisites:** Stages 2–4; **IPD-owned:** active binding provisioned + IPC peer listening; user sets `IIPS_G2_IPC_ENDPOINT`, `IIPS_G3_IPC_BINDING_PROVISIONED=true` (only after IPD confirms); reports owner carrier + NP-04 path (`IIPS_NP04_DATABASE_PATH`); F-3 carrier for watchlists if needed.
- **Existing:** every consumer implemented; `iid:readiness` covers all gates; runbook §14–16 gives exact commands.
- **Remaining:** IPD procedure (not IRR's to execute); two carriers materialised (materialisers exist and were proven in P6-A); NP-04 path chosen (accept one-time create/migrate); mint v1 assessments for the three issuers (operator CLI) — **this also populates `/investment/company/:issuerId` for real**; verify a separate-process readback.
- **Acceptance:** `iid:readiness --strict` exits 0; a real portfolio read resolves rows through IPC; an assessment mints, persists, reads back, and a second version diff appears in change intelligence; `/investment/company/IN:CIN:…` renders the chain; no 503 anywhere on the read path.
- **Evidence:** host readiness capture; NP-04 query evidence (empty→nonempty transition recorded); assessment readback logs.
- **Dependencies:** IPD (hard), Stages 2–4. **Independent:** no.
- **Honest note:** IPD's binding is not on this side of the fence — no amount of IRR work substitutes for it.

### Stage 6 — Investment intelligence
- **Objective:** routine use — weekly review loop, change detection, dispositions on real holdings, persisted comparable reports.
- **Prerequisites:** Stage 5; limits policy authored for the local portfolio (operator; defaults are placeholders); review cadence chosen; staleness/operating-metric entry habit.
- **Existing:** IID-2/4/5 engines + UI, reports persistence (NP-04; real-report path merged 2026-11-05), change timeline.
- **Remaining:** operator limits policy (L-019); mint two versions per covered issuer per quarter; compare via ChangeTimeline/persisted reports; tune operating-metric entry per sector extension (Consumer → next: Auto/Industrials metrics, then the G3 sectors Banking/Insurance/Capital Markets/Telecom need their metric families before any of their methods unlock).
- **Acceptance:** a quarter of review notes referencing ≥2 assessment versions per holding; disposition rationale citations resolve (L-023); the user can answer "what changed since last review and what do we do about it" from the surfaces alone.
- **Evidence:** persisted report comparison outputs; disposition records with resolved citations.
- **Dependencies:** Stages 1–5 + operator process. **Independent:** no.

## 22. Comparison with the authoritative IID roadmap — and what changes

The authoritative roadmap (`IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` + append-only overlays) sequences **implementation phases** IID-0 … IID-6; all are implementation-complete and closed (`IIPS_V3_IID_FORMAL_CLOSURE_2026-11-06.md`, 2026-11-06; tracker §16.273–16.276; real-issuer WI-1 … WI-12 through 2026-11-08). The real-issuer expansions deliberately proved the pipeline on real filings without expanding the installed universe.

**This document's stages are not a reordering of IID phases.** They are the *operationalization sequence* — what the local owner must do for the implemented product to function. Mapping:

| This doc | Roadmap analogue | Status of roadmap item | Difference asserted |
|---|---|---|---|
| Stage 1 | P6-A readiness (2026-11-09) | Done (on Linux host); Windows pending | None — re-run locally |
| Stage 2 | IID-1 acceptance "every holding resolves or is refused" | Code done; **operationally unmet** (no files) | Adds: roster authorship is a *data* decision, not code |
| Stage 3 | IID-0 ingestion path + R-16 measurement | Code done; **no installed dataset** | Adds: installation is an operator act the roadmap left implicit |
| Stage 4 | R-16 coverage exercise (operator-paced, C-16.x) | **Open** (3/13 synthetic) | Adds: real-issuer bundles are the fastest honest path to non-zero |
| Stage 5 | IID-2/IID-3 M-1/M-2 + WS-A integration | Code done; P6-B not attempted | Same; P6-B gates unchanged |
| Stage 6 | IID-4/IID-6 product operation | Code done; unused | Same |

Explicit differences from the roadmap's implied sequencing, if any: **none re-sequenced.** Two emphases differ deliberately:
1. **Data before features** is already the roadmap's stance (R-16 operator-paced; no phase blocked by a sector); this report makes the same recommendation with concrete provisioning steps.
2. **No new architecture** (no scheduler, no vendor client, no new store) — consistent with roadmap and with the closure's "What closure is not". Any proposal that “just wire NSE for free” contradicts D-1 and would be an unlicensed data grab; it is not recommended.

What this assessment does **not** authorise: production admission, multi-user scope, new authority acts, IPD changes, roster invention, or ignoring `L-001` (10 unmeasured sectors remain unmeasured regardless of anything here).

## 23. Minimum realistic acceptance scenarios (demonstrate readiness)

For each: API expectation · UI expectation · current truth. **(S) = synthetic fixture only; (R) = real evidence bundle; (––) = cannot run today.**

1. **Normal equity holding, valid identity, complete history (R, Infosys).** API: observation resolves `RESOLVED`; dataset reports 1 issuer COVERED; assessment endpoint returns the chain once minted. UI: `/identity-coverage` shows the holding row RESOLVED with link; `/investment/coverage` shows Infosys row COVERED (Technology measured); `/investment/company/IN:CIN:L85110KA1981PLC013115` renders the version chain. *Today: cannot run — no files/dataset installed (Stages 2–3).*
2. **Valid identity, insufficient history (S or any 2-period issuer).** API: issuer shows financials present, adequacy `PARTIAL/INSUFFICIENT`, `NO_FINANCIALS` excluded states only when truly empty; per-row reason visible. UI: row shows PARTIAL with gaps listed, no verdict-like colouring on missing values. *Today: mechanics testable in fixtures; real demonstration needs an installed sparse dataset.*
3. **Financially covered issuer, unresolved security (S).** API: dataset COVERED; identity row `UNMATCHED`/`ISIN_NOT_IN_ROSTER` (roster deliberately lacking one security); no assessment link. UI: both shown side by side; dependency cell "unresolved". *Today: constructible in fixture-land; demonstrates the separation honestly.*
4. **Unmatched/ambiguous security (S).** API: `UNMATCHED` or `AMBIGUOUS` with candidates listed; totals exclude it from assessable. UI: reason text rendered; nothing classified.
5. **Newly imported holding.** API after import: new observation row; pre-provisioning it is `UNMATCHED` (roster lacks issuer); after roster edit it flips `RESOLVED` with zero code change. UI: import → preview evaluation → portfolio refresh → identity re-read. *Today: preview path works; portfolio path blocked on IPD binding.*
6. **Watchlist-only security.** API: watchlist item observed; resolves `SECTOR_REFERENCE_NOT_AN_IDENTITY` (current) — *not* "unresolved security"; with O8 adopted an issuer row would resolve instead. UI: the add control names the certified space; item does not link to company research (unless underlying id parses — sector refs don't).
7. **Company affected by a corporate action (S).** API: MERGER/DEMERGER row yields successor reconciliation; pre/post rows attributed; ratios reconcile to 1 or the file is rejected wholesale (`SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE`). UI: successor reconciliation block; failure ⇒ whole source set rejected with `AMBIGUOUS_LISTING`-class issues. *Today: validator + tests cover; data absent in all committed bundles (L-031) — real demo pending first transcribed CA.*
8. **Specialised-measurement sector (Banking/Insurance/Capital Markets/Telecom).** API: methods `WITHHELD` with the specific missing metrics (e.g. BM_NIM/GNPA/CET1) even with full statements; sector stage G3_WITHHELD if statements present but metrics absent; never approximated. UI: slot list with reasons; no borrowed Banking verdicts from Technology. *Today: fully demonstrable in fixtures; Marico/KEC show the Consumer/Industrials analogue on real data.*
9. **Stale/incomplete company (R, KEC debt-side).** API: `NOT_REPORTED`/`NOT_COMPUTABLE` components; net debt unresolved ⇒ bridge refuses; adequacy PARTIAL; confidence caps (STALE_DATA). UI: refusal text, missing-with-reason everywhere. *Today: committed in WI-8 bundle; installable to replay locally.*
10. **Mixed portfolio (covered + uncovered).** API: counts split COVERED/NO_FINANCIALS/SECTOR_NOT_MEASURED; identity report counts separately; watchlist rows disclosed as sector refs. UI: a portfolio page with a mixture renders all states simultaneously; totals add up; nothing is promoted. *Today: fixture-constructible; needs Stages 2–3 + binding for real holdings.*

Fixture-vs-real labelling in any demo shown to the owner: fixtures = `SYNTHETIC_FIXTURE` chip; evidence bundles = `OPERATOR_SUPPLIED` with bundle name. **No synthetic figure is to be cited as coverage.**

---

# PART VII — INTEGRATION GAPS, DISCREPANCIES AND UNKNOWNS

## 24. Integration gaps (named, ordered by consequence)

Every gap below is evidence-backed. **C** = confirmed by direct observation here or committed evidence; **U** = unknown (needs the named host/owner). None is papered over by new architecture; each is a provisioning, data, licence or decision item.

| # | Gap | Class | Consequence | Evidence |
|---|---|---|---|---|
| G-1 | **No full-universe identity reference set exists anywhere.** IPD has none (checked at pin `1aee57fe09` and `main`, 2026-11-11, `git/trees?recursive=1`); IRR has synthetic fixtures and three one-issuer operator sets | 1 (C) | IID-01/02/03 cannot classify any real holding | loader run; IPD tree listing; find for `eligible-roster.json` |
| G-2 | **No fundamentals dataset is installed** at `<IIPS_DATA_DIR>/investment/dataset` on this host (and never on any host, operationally) | 2 (C) | IID-01 cannot mint; Investment Coverage reports NONE; assessments 404 | readiness findings; direct runtime call (§11); P6-A |
| G-3 | **Holdings lane unusable**: IPD active binding not provisioned; IPC peer not listening | 3/7 (C for Linux; U for Windows) | Portfolio reads 503; IID-02 blocked; Identity Coverage's HOLDING source missing | readiness `ipd-binding-precondition`, `ipc-endpoint`; P6-A D5/D6 |
| G-4 | **Operating metrics must be operator-entered**; 0 metric records in every committed dataset; sectors requiring metric-qualified methods (all metric columns of §13.1) stay withheld | 1/5 (C) | 14 of 38 slots require at least one operating metric and stay withheld regardless of statements; 24 are statement-only and unlock with data alone | `OPERATING_METRICS` (`OPERATOR_ENTERED` everywhere, zero VENDOR); all WI bundles carry empty `operating-metrics.csv` |
| G-5 | **XBRL ingestion was never exercised on a real India Ind-AS XBRL instance**; every real bundle was PDF-transcribed CSV; `xbrl.ts` is fixture-tested only | 6 (C) | first real XBRL run will surface tag gaps exactly as designed (visible issues) — expect a burst of `UNMAPPED_XBRL_TAG` warnings, not silent pass | ingestion read; WI-3 README ("no Ind AS XBRL instance was reachable") |
| G-6 | **No quarterly data, anywhere** | 1 (C) | quarterly early-warning value absent; all methods calibrated on annual; nothing breaks, but no intra-year freshness either | REL-1 manifest (0 quarterly periods); no bundle contains quarterly |
| G-7 | **Sector spelling split-brain**: certified v1.1 replay baseline universe uses `Automobile`, `Materials & Metals`, `Telecommunications` (grep of `PROGRAM_v1.1_REPLAY_BASELINE.json`-derived membership test); `SectorName` (`operatingMetrics.ts:11`) and every dataset instruction use `Auto`, `Materials`, `Telecom`; roster `sector` is free text (no closed-set validation in `sources.ts`; `IssuerRecord.sector` is typed but the CLI never checks it) and `measure.ts` matches `issuer.sector === sector` exactly | 6 (C) | a roster copied from baseline spellings silently yields **zero sector measurement** with issuers present; no error is raised | `watchlists/governed-reference-universe-membership.test.ts:26`; `operatingMetrics.ts:11-24`; `measure.ts:191`; `sources.ts` (sector unvalidated); `cli/ingest.ts` (no sector check) |
| G-8 | **Corporate actions: empty everywhere**; MERGER/DEMERGER successor reconciliation never run on real data | 1/6 (C) | splits/bonuses/actions silently stale; identity stays `STALE_REFERENCE` until repaired; CA-linked questions stay unanswerable | `corporate-actions.json` empty in fixtures and bundles; CA validator implemented but unproven on real events (L-031) |
| G-9 | **Freshness window drift**: design says five *trading days* for price freshness; code enforces seven *calendar days* | 4/6 (C, design-vs-code) | marginal; a stock 6 calendar days stale passes a 7-day gate that a 5-trading-day design would fail | `L-033`; freshness gate in payload assembly |
| G-10 | **The JS-free `/investment/coverage` HTML still renders the identity-unavailable page**. The SPA route `/investment/coverage` is the Investment Coverage page and is correct; the raw HTML route is the identity handler's minimalist view (identity 503 body), because `investmentCoverageEndpoint` owns no HTML route | 4 (C) | a bookmarked/JS-disabled view claims identity failure while the SPA shows the honest dataset position; misinforms exactly the no-JS operator | `coverageEndpoint.ts` (`COVERAGE_ROUTES.html = '/investment/coverage'`, `renderUnavailableHtml`); `investmentCoverageEndpoint.ts` (JSON-only); `coverage-transport.ts` falls through to the identity binder; separation record known exception — **root cause pinned by code inspection this cycle** |
| G-11 | **`/investment/company/:issuerId` has never served a real chain** — no assessment version exists anywhere operational (HTTP 404 on both candidate grants) | 2/7 (C) | IID-01 read path and change-timeline unexercised in reality; WI-3/WI-8 persisted nothing to a store | readiness `np04-assessment-store`; P6-A D2/D9; `show-investment-chain` unrun against any store |
| G-12 | **No price observation for any holding**; WI-2's single transcribed close is three trading days stale, forces contemporary valuation, and cannot feed period-matched MoS | 1/5 (C) | margin-of-safety unusable operationally (`mos` requires fresh contemporary price); KEC/Marico intrinsic remains null without it | WI2 README; `L-030`–`L-034` |
| G-13 | **Broker-import → identity pipeline never demonstrated end-to-end**: broker rows evaluate in preview only; persistence lane exists (CAP-02/03) but no imported row has been through the resolver in this environment | 7 (C) | the primary user journey is unverified as a flow, only as components | `/api/investment/coverage/preview` (tested); CAP-03 lane docs; no runtime evidence of the composite flow |
| G-14 | **Two subsystems, two sector vocabularies, no lint**: nothing prevents the §G-7 class of defect from re-entering via hand-authored rosters | 4/6 (C) | same silent-failure shape for any future vocabulary drift | as G-7 |
| G-15 | **Limitation register drift** (see §25): `L-002` says "20 tags" vs code 22; `L-009` says "No real issuer has been assessed" vs three real-issuer evidence bundles post-2026-11-06 | documentation (C) | stale register invites wrong decisions (e.g. re-scoping work as undone) | register L-002/L-009 vs `XBRL_TAG_MAP` (22) and WI bundles |

**Not a gap:** the 38-method withholding behaviour itself — it is the design working as intended; the defect is that nothing supplies the inputs. **Deliberately out of scope:** production admission, multi-user, IPD changes, new authority acts.

## 25. Discrepancies and known-issues register (observed during this investigation)

Per the working rules, discrepancies found are recorded, not silently repaired, and not reopened without regression evidence.

1. **L-002 register vs code.** Register says "20 XBRL tags mapped"; `XBRL_TAG_MAP` at `iips-platform/src/investment/ingestion/xbrl.ts:58` maps **22**. Flag; do not rewrite the register here; owner decides whether to amend (documentation-only).
2. **L-009 register vs evidence.** Register (2026-11-06) says no real issuer has been assessed; WI-3 (Infosys), WI-7 (Marico) and WI-8 (KEC) produced real-input assessments post-2026-11-06, but **none persisted**. "Assessed in evidence bundles ≠ assessed in the operated product" — both readings are defensible; state both.
3. **Separation record known exception, root cause now pinned.** "`/investment/coverage` HTML still renders identity-unavailable" — confirmed in code: the HTML route is the identity endpoint's (`renderUnavailableHtml`), and the investment endpoint is JSON-only. The SPA `/investment/coverage` is unaffected. Fixing the HTML would mean giving the investment endpoint an HTML renderer — a new surface, explicitly not licensed by this investigation. Owner decision O9 decides whether to do it.
4. **L-016.** NP-04 pin prose vs manifest pins disagree — observed, not changed (acceptance note honours this).
5. **L-033.** 7 calendar days vs design 5 trading days — changed nowhere; named for owner adjudication (O7).
6. **L-002-class derivation constants.** Derived statements in `fundamentals/derive.ts` closed at 8 items — as designed; extending requires golden vectors (owner decision + evidence), not ad-hoc additions.
7. **Date discipline in this document.** Authored 2026-11-11; the file name, header date and all artifact references reflect 2026-11-11. (See §31.)
8. **`/tmp/ipd-tree.txt` etc.** are scratch listings, not evidence; IPD claims cite the live `gh api` reads dated 2026-11-11.
9. **`frontend/.iips-data` is NOT git-ignored** — if any probe wrote there on a dev machine, artifacts would be committable accidentally; nothing was written this cycle, and no `.iips-data` exists in this checkout (`git status` clean).
10. **Windows host uninspected** — §27 U-1. Any "works on my host" claim beyond this Linux sandbox would be fabrication; this report makes none.

## 26. Operational responsibilities at a glance

| Action | Owner | Cadence | Notes |
|---|---|---|---|
| Place identity files (roster, listing map, CA) in `<IIPS_DATA_DIR>/investment/identity` | User host (data owner or operator) | on IPO/delisting/merger/symbol change; at least quarterly review | `iid:readiness` flips `identity-files` to valid; never copy fixtures |
| Re-ingest fundamentals after each filing | User host | annual + any restated quarter | new digest per run; never edit a dataset in place |
| Enter operating metrics (sector CSV) | User host | with each entry; staleness caps confidence | the only path to metric-qualified methods |
| Transcribe price observations | User host | per review cycle | needed for any MoS/intrinsic output; WI-2 discipline |
| Run `iid:readiness --strict` | User host | weekly | catches absent/corrupt reference files |
| Provision IPD binding + run IPC peer; confirm provisioning | **IPD** | once, then per binding lifetime | IRR cannot do this; declaration ≠ provisioning |
| Set carrier paths, NP-04 path; `IIPS_LOCAL_PERSONAL_USE=1` (write path only) | User host | once per machine | materialisers refuse to write inside Git |
| Mint assessments (CLI), read back, compare | User host (operator) | per review cycle | append-only; `UNCHANGED` is a valid outcome |
| Author/choose the limits policy | User host (owner) | once, then review | O5; defaults are placeholders |
| Decide roster authority / D05 bridge / providers | Product owner | once, then per change | O1–O4, O8; this report's decision register |
| Admit issuer-level watchlists | Product owner | after O1 | O8; not a configuration toggle |
| Change-intelligence cadence + thresholds | User host | quarterly | L-029 defaults accepted or adjudicated |

## 27. Explicit unknowns (cannot be settled from this repository or this host)

- **U-1. The operator's Windows host.** Whether `.iips-data` exists there, with what files, under what `IIPS_DATA_DIR`, under what Node/version, with what carriers. Everything conditional in this report ("if files were provisioned…") must be settled by Stage 1 on that host. Until then all statements are about this Linux checkout.
- **U-2. IPD's provisioning intent and timeline** for the active owner binding and IPC peer for personal use. No IRR action substitutes for it.
- **U-3. Existence and licence status of a full-universe issuer/listing/CA source** the owner is willing to authorise (exchange masters, MCA21, licensed vendor). Until O1/O2 settle, the roster population stays manual.
- **U-4. Ind-AS XBRL instance availability for the target issuers** (exchanges publish them; this host never fetched one — acquisition is out of scope and out of network policy here).
- **U-5. NP-04 behaviour over long chains** under real cadence (open/migrate/query verified by P6-A; append-only triggers honoured by design; long-run capacity unmeasured).
- **U-6. Price feed licensing**, if any feed is ever admitted (O4).
- **U-7. Disposition operating mode the user actually wants** (advisory-only display vs recorded decisions; hysteresis needs a caller-supplied previous — who supplies it in the personal-use flow?).
- **U-8. Materiality thresholds** for change reports (L-029) — are the published defaults acceptable for the user's review cadence?
- **U-9. Sector-identity of any future roster** — whether the owner will keep the `SectorName` vocabulary (recommended) or commission a reconciliation map to baseline spellings (would be new scope, not recommended).
- **U-10. Whether the evidence-derived OPERATOR_SUPPLIED datasets (Infosys/Marico/KEC) are admitted by the owner as operational inputs.** Technical answer is yes; the acceptance is O3 and only the owner can give it.

## 28. Product-owner decision register

Genuine owner decisions only — each one shapes the product or its data, none is engineering's to make. "Recommended" is this investigation's recommendation, never a pre-approval.

| # | Decision | Why it is genuinely the owner's | Choices | Recommended | If deferred |
|---|---|---|---|---|---|
| O1 | **Identity roster authority, scope and refresh cadence** (which issuers; eligibility rules; exclusion reasons; owner of edits) | Defines who IIPS may speak about and on what basis — a data-governance and scope act | (a) operator hand-authors for the intended holding set; (b) commission from IPD under a governed act; (c) license a vendor universe | (a) now for ≤ a few dozen issuers; (b) later, after IPD binding proof (§24 G-3) | IID-01/02/03 remain unusable; coverage pages stay honestly empty |
| O2 | **Admit the D05-authenticated-universe bridge?** (use IPD's D05 security master — 2,390 records, 2026-11-08 AUTH act — as the issuer/security universe, under what act and terms) | IPD owns that data; admission is an authority act with legal/licensing character, not a code hook | adopt under act / defer / reject | defer until the binding (G-3) and a written act exist; never silently | universe stays manual; D1 stays open |
| O3 | **Admit evidence-derived OPERATOR_SUPPLIED datasets as operational inputs?** (Infosys REL-1/WI2/WI3; Marico WI7; KEC WI8 — single-issuer, transcribed, annual-only, empty CA table) | Only the owner can accept "real but thin" as fit for local personal use; the system will forever label it honestly, but acceptance is a judgement | admit all three / admit subset / reject | admit all three for local personal use with the caveats attached; re-issue on each restatement | nothing to assess or measure; INVESTMENT page stays NONE; cohort work (R-16) cannot start on real data |
| O4 | **Admit any fundamentals/price provider?** (or remain file-in by design D-1) | Licensing, cost, terms, redistribution — owner's alone; D-1 is the recorded default | remain file-in / admit NSE-BSE EOD price / admit a fundamentals vendor | remain file-in; reassess when an EOD price need is felt (MoS automation) | MoS stays manual/stale; every assessment keeps the policy-default/staleness caps |
| O5 | **Author the operator limits policy** (position limits, max new exposure, min margin, severity thresholds) — currently placeholders | The disposition gate G-6 cannot pass on placeholder text; writing real limits encodes the user's risk appetite — only the user knows it | conservative draft / status-quo placeholders / disable dispositions | conservative draft, in writing, reviewed quarterly (L-019) | RETAIN unreachable (G-6 fails); the whole IID-02 chain stays dark |
| O6 | **Disposition operating mode for personal use** (advisory-only; never size/time/execute; hysteresis caller supplies `previous`; record in reports or not) | Consequence surface; misreading a verb as an order is the failure mode | advisory-only / advisory + recorded decisions / disabled | advisory-only, reviewed in person; `noExecutionPath` stays; no order ever | surface exists but is unused; no harm |
| O7 | **Refresh cadence and the L-033 adjudication** (who re-ingests, how often; whether freshness becomes 5 trading days or stays 7 calendar days) | Operational discipline plus one design-vs-code conflict only the owner may settle | weekly+per-filing / ad-hoc / defer L-033 | weekly readiness, per-filing ingest, per-quarter mint; leave code at 7 days until design record changes (do not edit code ad hoc) | staleness caps mis-sized by two days; nothing else breaks |
| O8 | **Admit issuer-level watchlists?** (watchlist rows for real issuers once O1 roster exists) | Expands the certified watchlist universe from 13 sector references to issuer rows — a scope decision with universe consequences | admit after O1 / keep sector references only | admit after O1, reusing the same resolver; no new architecture | watchlists remain sector-reference-only; company rows unreachable from UI07 |
| O9 | **Give the investment-coverage endpoint an HTML renderer?** (fix the JS-free `/investment/coverage` showing identity-unavailable HTML) | Small, but it is a new surface with its own tests and review — owner decides whether the no-JS operator journey matters | add minimal HTML / leave as-is + document / remove the JS-free route | leave as-is and document (this report); revisit with T-9 in the product work | no-JS users keep misleading page; SPA users unaffected |
| O10 | **Acceptance of this report's Stage 1–6 as the operationalization track** vs treating it as informational only | Sequencing of real acts on the host is the owner's; acting binds time and attention | adopt / adopt-with-edits / informational only | adopt Stage 1–4 immediately; Stages 5–6 when IPD confirms binding | report is read and shelved; empty states persist |

## 29. End-to-end day-to-day — the honest verdict

If Stages 1–4 are executed (all user-host acts, no code changes, no new architecture): the local user opens IIPS and sees — on `/identity-coverage`, per holding: `RESOLVED` (or a named state with a repair path); on `/investment/coverage`, the real installed universe (3 issuers, 2–3 sectors measured, 6–8 usable methods) with every withheld slot carrying its named reason; on `/investment/company/:issuerId`, a durable chain with real fundamentals, visible missing-with-reason values, method availability per sector, and change reports after the second mint; on `/portfolio`, holding-level views where the data exists; watchlists continue to monitor sector references honestly.

What will still not work — by design, not defect: any verb for an issuer without sufficient evidence (L-021); any number on a missing datum (always `NOT_REPORTED`/`NOT_COMPUTABLE`); any figure for a sector nobody measures; any live price; any broker-authoritative identity; any automation of the decision. IIPS will keep telling the truth, and the truth will keep being: *coverage is earned filing by filing, sector by sector, issuer by issuer.*

---

# PART VIII — EVIDENCE APPENDIX AND DOCUMENT CONTROL

## 30. Evidence index (where every material claim comes from)

### 30.1 This repository (Linux sandbox, 2026-11-11) — investigation at `72b5d0a` (PR #554 branch); publication tree = `origin/main` @ `08cdf49` + this document only

| Claim | Evidence path |
|---|---|
| `RESOLUTION_STATES` = 9; `UNRESOLVED_REASONS` = 18; `REASON_TEXT` | `iips-platform/src/investment/identity/types.ts:15-54` |
| Loader fail-closed; dir resolution `<IIPS_DATA_DIR>/investment/identity`; `SYNTHETIC_FIXTURE` if path matches /synthetic/i | `iips-platform/src/investment/identity/sources.ts` |
| Runtime wrappers (read-only; never gate) | `iips-platform/src/investment/identity/runtime.ts` (`loadRuntimeIdentitySources`, `financialCoverageFromLocalDataset`, `investmentCoverageFromLocalDataset`) |
| Identity endpoint fail-closed 503; `observation-sources-unavailable` for surface failures | `iips-platform/src/investment/identity/coverageEndpoint.ts:127-160` |
| Coverage disclosure builder (measuredSectors, usableMethods=AVAILABLE only) | `iips-platform/src/investment/identity/coverage.ts:117-143` |
| Sector stage ladder UNMEASURED/G3/G2/G1; measured = issuers>0 ∧ annual period>0 | `iips-platform/src/investment/coverage/measure.ts:186-277` |
| Method matrix 38 rows / 13 sectors verbatim | `iips-platform/src/investment/coverage/methodMatrix.ts` |
| Per-issuer semantics NO_FINANCIALS → ISSUED_DATA → COVERED/SECTOR_NOT_MEASURED | `iips-platform/src/investment/coverage/investmentCoverage.ts` |
| 22 XBRL tags | `iips-platform/src/investment/ingestion/xbrl.ts` (`XBRL_TAG_MAP`) |
| 8 derivations | `iips-platform/src/investment/fundamentals/derive.ts` (`DERIVATIONS`) |
| 33 operating-metric ids; all OPERATOR_ENTERED | `iips-platform/src/investment/contracts/operatingMetrics.ts` (programmatic count 2026-11-11) |
| 13 SectorName values (dataset vocabulary) | same file, lines 11-24 |
| `IssuerRecord.sector: SectorName` (typed, unvalidated at ingest) | `iips-platform/src/investment/fundamentals/types.ts:15-23`; `cli/ingest.ts` (no sector check) |
| Broker-preview evaluation path; never believes broker identityStatus | `coverageEndpoint.ts handlePreviewEvaluationRequest` |
| JS-free `/investment/coverage` HTML = identity endpoint's `renderUnavailableHtml` | `coverageEndpoint.ts COVERAGE_ROUTES.html`, `html(503, …)`; investment endpoint JSON-only (`investmentCoverageEndpoint.ts:12-15, 39`); transport fall-through `frontend/server/investment/coverage-transport.ts:170-176` |
| SPA routes: `/identity-coverage`, `/investment/coverage`, `/investment/company/:issuerId` | `frontend/src/app/routes.ts:22-67`; `frontend/src/app/App.tsx:75,89` |
| Holdings observation via IPC; watchlist observation (ISIN parse; sector refs non-resolving) | `frontend/server/investment/sources.ts:39-112, 117-179` |
| Readiness CLI + P6-A record | `frontend/server/investment/runtimeReadiness.ts`; `docs/OPERATOR_RUNBOOK.md §16`; `docs/integration/IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09.md` |
| Watchlists governed universe = 13 sector references (baseline spellings) | `frontend/server/watchlists/watchlists-service.ts`; `watchlists/governed-reference-universe-membership.test.ts` (`Automobile`, `Materials & Metals`, `Telecommunications`, asOf 2026-08-09, v1.1-replay-baseline) |
| Reports/persistence (NP-04) read transports exist; no mutating route | `frontend/server/investment/investment-transport.ts`; `docs/OPERATOR_RUNBOOK.md §14` |
| Disposition engine: verbs, gates, INSUFFICIENT→no verb, PARTIAL→no exposure increase, G-6 needs resolved limits | `iips-platform/src/investment/disposition/policy.ts:71-96`, `gates.ts:173-215`, `engine.ts` |
| Change intelligence: two report types; cross-model UNAVAILABLE | limitation register L-028 |

### 30.2 Runtime measurements on this host (2026-11-10/11, npx tsx from `frontend/`)

- `npx tsx server/investment/cli/iid-readiness.ts --json` → findings: `identity-files` MISSING (3/3); `fundamentals-dataset` DATASET_DIRECTORY_ABSENT; `reports-owner-context` unconfigured; `np04-assessment-store` path unconfigured; `owner-context-carrier` unconfigured; `ipd-binding-precondition` BINDING_NOT_PROVISIONED; `ipc-endpoint` ENDPOINT_NOT_CONFIGURED; `local-personal-use-enablement` LOCAL_PERSONAL_USE_ABSENT.
- `investmentCoverageFromLocalDataset('2026-11-10')` → all-zeros `NONE` position (§11 verbatim output).
- `financialCoverageFromLocalDataset()` → 0/13 measured, 0/38 usable, class NONE.
- `loadRuntimeIdentitySources()` → unavailable at default dir; the three evidence identity dirs load `available`, class `OPERATOR_SUPPLIED`.
- REL-1/WI2/WI7/WI8/WI-3 determinations as cited in §9–§13 and §18 (see bundle `runs/` and `determination-*.json`).

### 30.3 IPD (ramkivs/iips-production-market-data) — pinned references, read-only

- Pin P-A `1aee57fe09035360e15bc38e816d77af317a249d8` (PR #148, 2026-11-10), pin P-B `2e11fa3b…` (NP-04 governed persistence, 2026-10-02) — **both pins resolve into the same repository** via the `./persistence` subpath dependency in `frontend/package.json`; verified 2026-11-11.
- Repository `main` as of 2026-11-11T13:28Z; tree at pin and at `main`: no IID identity files, no IID dataset, no roster/listing-map/corporate-actions artifacts (listings captured 2026-11-11 via `git/trees?recursive=1`).
- 11 ahead/behind relationship between pin and main observed; **no observation implies any change is required or authorised on the IPD side** by this report.

### 30.4 Program records consulted (context, not re-verified)

`IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md`; `IIPS_V3_IID_FORMAL_CLOSURE_2026-11-06.md`; `IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md`; `IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09.md`; `IID-IDENTITY-AND-INVESTMENT-COVERAGE-SEPARATION-2026-11-10.md`; `docs/OPERATOR_RUNBOOK.md` (§14–16); WI bundles under `evidence/real-issuer/`; `IIPS_V3_IID_EVENT_LOG` tracker references as cited inside those records.

### 30.5 Tests executed for this assessment (targeted, not full regression)

- `iips-platform`: `npx tsx --test tests/investment/investment-coverage.test.ts` → 9/9 PASS; `tests/investment/investment-coverage-endpoint.test.ts` → 9/9 PASS.
- `frontend`: `npx vitest run src/investment/iidCoverageSeparation.test.tsx src/investment/iid6Coverage.test.tsx src/investment/iidInvestmentCoverageTransport*.test.ts(x)` → 27/27 PASS (after `npm ci` + `npm run build:broker-import`; npm needed `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt`).
- **Not run:** full frontend suite, full platform suite, browser acceptance (P6-B), any IPD process. Not attempted because the working rules forbid full regression here and because nothing in this report claims their results.

### 30.6 Environment of record

- Host: Linux sandbox (this agent), **not** the operator's Windows host; repo at `72b5d0a` on `arena/6012214c-iips-review-recovered` (PR #554) at time of investigation; report relocated to a dedicated branch off `origin/main` for publication.
- Node/npm per sandbox image; commands cited verbatim; no writes outside `docs/integration/` on the publication branch.

## 31. Document control

- **Date:** 2026-11-11 (authored, reviewed and published same day; the investigation session ran 2026-11-10/11 UTC).
- **File:** `docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md` (initially drafted under a 2026-11-10 name and renamed at publication; all content reviewed as of 2026-11-11).
- **Branch:** `arena/iid-coverage-readiness-report-2026-11-11` — a dedicated branch created off the current `origin/main` (`08cdf49`) for this document alone, separate from the PR #554 working branch. **No pull request is opened by default**; the branch is the designated publication location for this report. If the owner wants it merged, that is a separate act.
- **Commit:** the commit that introduces this file on that branch (`git log --oneline -- docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md`).
- **Verification of publication (as executed by the publishing work item):** (1) `git ls-remote origin arena/iid-coverage-readiness-report-2026-11-11` returns the pushed tip; (2) the remote blob of this file fetched via the GitHub contents API at that ref hashes identically to the local file (`git hash-object`); (3) the same blob exists byte-for-byte at the published ref; (4) the local working tree is clean. Commands and results are reproduced in the publishing session's final report.
- **Review stance:** this is an assessment, not an authority act. Nothing here changes code, admits data, grants permission, or reopens closed work. Every recommendation is subject to the owner's decision register (§28). Material factual errors should be raised as issues on the publication branch; corrections land as follow-up commits, not rewrites.
- **Limitations of this assessment:** single Linux host; no Windows inspection; no live IID data anywhere; no browser verification; no IPD process observed; IPD read-only via API; no network beyond the sandbox host allowlist. Where any of these would change an answer, the text says so (§27).

---

*End of document.*
