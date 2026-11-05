# IID-1 — Identity & coverage (evidence)

**Phase:** IID-1 of `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` (Part B
authoritative). **Date:** 2026-11-05. **Repository:** `ramkivs/iips-review-recovered`, branch
`arena/08238a84-iips-review-recovered`, on top of IID-0 (`cad6371`).

**Outcome delivered.** Every row observed across holdings, broker-import preview and watchlists is either
bound to a defensible issuer + security + listing identity, or refused with a named, displayable state.
No row is silently substituted, no identity is fabricated, and no sector reference is promoted to an
identity.

---

## 1. What was built

| Layer | File | Responsibility |
|---|---|---|
| contracts | `iips-platform/src/investment/identity/types.ts` | `IdentityObservation`, `IdentitySources`, `EligibleRoster`, `ListingMap`, `CorporateActionTable`, `CompanyIdentityBinding`, resolution states, `IDENTITY_SCHEMA` |
| sources | `identity/sources.ts` | roster / listing-map / corporate-action loaders, structural + digest validation, `resolveIdentityDir`, file issues |
| corporate actions | `identity/corporateActions.ts` | CA table validation, adjustment factors, merger/demerger successor reconciliation, symbol history, per-share consistency |
| runtime | `identity/runtime.ts` | the two adapters the frontend server may use: versioned identity files, and the financial-coverage disclosure of the served dataset |
| resolution | `identity/resolver.ts` | pure ladder `(observation, sources, asOf) → IdentityResolution`, `CompanyIdentityBinding` emission |
| coverage | `identity/coverage.ts` | classification of every observation, per-state and per-source counts, status line, financial-coverage disclosure, deterministic ordering |
| view | `identity/coverageView.ts` | server-rendered HTML (no JS, CSP-locked) |
| endpoint | `identity/coverageEndpoint.ts` | `GET` JSON, `GET` HTML, `POST` preview evaluation; fail-closed 503 |
| IRR transport | `frontend/server/investment/coverage-transport.ts` | `node:http` binding, bounded preview body, injected providers |
| IRR sources | `frontend/server/investment/sources.ts` | G3 holdings via the existing IPC port, watchlists via the existing service, IID-0 dataset only for the financial-coverage disclosure |
| UI | `frontend/src/api/investmentCoverage.ts`, `frontend/src/features/investment/InvestmentCoveragePage.tsx` | typed client + minimal coverage view; route `/identity-coverage`, nav entry "Identity Coverage" |
| evidence | `iips-platform/scripts/iid1-coverage-report.ts` | renders this directory's report/HTML/summary through the same handler the app uses |

Nothing in `frontend/` was modified beyond the four small additions above (`routes.ts` constant,
`navigation.ts` entry, two lines in `app/App.tsx`).

## 2. Identity model

Three levels, never collapsed:

| Level | Key | Notes |
|---|---|---|
| issuer | `IN:CIN:<cin>` primary, `IN:EQISIN:<isin>` fallback | `issuerKeyBasis` recorded on the binding; a CIN and an equity ISIN that disagree about the same security is a conflict, never a pick |
| security | `IN:ISIN:<isin>` | Luhn-validated; one issuer may hold several securities (equity + preference) |
| listing | `IN:<EXCHANGE>:<SYMBOL>:<SERIES>:<INSTRUMENT>` | exchange + symbol + series/instrument + `effectiveFrom`/`effectiveTo` windows |

Company-name matching cannot establish identity: the resolver reads no name field at all — observations
carry `displayName` and the resolver never touches it (AC-1.10, asserted by construction in
`identity-resolver.test.ts`).

## 3. Resolution states

Referenced rows in this evidence run are synthetic fixtures (`SYNTHETIC_FIXTURE`), matched to the stated
qualification: they prove the *mechanics*, not real-company coverage.

| State | Row(s) | Reason surfaced | Meaning |
|---|---|---|---|
| `RESOLVED` | H-01, H-02, B-02, W-01 | — | assessable listed equity (H-02 resolved through exchange+symbol) |
| `AMBIGUOUS` | H-04 | `DUPLICATE_ACTIVE_SYMBOL` | two active issuers share the symbol; no issuer chosen |
| `AMBIGUOUS_LISTING` (Rev-3) | B-04 | `MULTIPLE_SECURITIES_SHARE_LISTING` | one listing carries two securities; security not picked |
| `UNMATCHED` | H-05, B-03, W-03 | `SECTOR_REFERENCE_NOT_AN_IDENTITY`, `ISIN_NOT_IN_ROSTER` | no defensible identity; **no** symbol fallback after an ISIN miss |
| `INELIGIBLE` | W-04, W-05, W-07, W-08 | `ISSUER_NOT_ELIGIBLE`, `NON_INDIAN_ISSUER`, `SECURITY_NOT_LISTED`, `NO_LISTING_FOR_SECURITY` | identity known where it exists, assessment refused |
| `OUT_OF_SCOPE_SECURITY` | W-02 | `INSTRUMENT_NOT_ASSESSABLE` | preference share; identity retained, not assessed |
| `STALE_REFERENCE` | H-06, W-06 | `LISTING_WINDOW_EXPIRED`, `LISTING_NOT_YET_EFFECTIVE` | symbol matched only outside its effective window |
| `REJECTED_MALFORMED_ISIN` | B-01 | `ISIN_CHECK_DIGIT_FAILED` | Luhn failure; no symbol fallback |
| `ISSUER_KEY_CONFLICT` | H-03 | `ISSUER_KEY_CONFLICT` | CIN and equity ISIN name different issuers |

## 4. Coverage results (this evidence run, asOf 2026-11-05)

```
4 of 18 observed rows assessed · 9 unresolved · 6 holdings in scope · 1 out-of-scope security · 4 ineligible
```

| Count | Value |
|---|---|
| observed | 18 |
| assessable | 4 |
| RESOLVED | 4 |
| AMBIGUOUS | 1 |
| AMBIGUOUS_LISTING | 1 |
| UNMATCHED | 3 |
| INELIGIBLE | 4 |
| OUT_OF_SCOPE_SECURITY | 1 |
| STALE_REFERENCE | 2 |
| REJECTED_MALFORMED_ISIN | 1 |
| ISSUER_KEY_CONFLICT | 1 |

State sum equals `observed` (18) — no row is dropped and no row is counted twice.

| Source | observed | resolved | unresolved | assessable |
|---|---|---|---|---|
| HOLDING | 6 | 2 | 4 | 2 |
| BROKER_PREVIEW | 4 | 1 | 3 | 1 |
| WATCHLIST | 8 | 1 | 7 | 1 |

Identity versions carried in the report:

| File | Version (sha256) |
|---|---|
| eligible roster | `sha256:3d9dc6dbdd555a512340e8e69daa3314bb3ffb8645956ce18607e301e1428704` |
| listing map | `sha256:5800969c40aea76071cc1e28ac80709d77c9872058a1195e0265f4db7ed1d864` |
| corporate actions | `sha256:3d37cc4d15a225900b8a3443b29d2a3d8be8f2effd425f3dd0835bbc3be8f242` |

Corporate-action reconciliation:

| Action | Type | Effective | Slices | Measured | Unmeasured | Reconciled |
|---|---|---|---|---|---|---|
| `CA-GIRISH-MERGER-2026` | MERGER | 2026-04-01 | 1 mapped @ 1.0 | 1.0 | 0.0 | yes |
| `CA-BODHI-DEMERGER-2025` | DEMERGER | 2025-04-01 | 1 mapped @ 0.6, 1 **unmapped** @ 0.4 (`SUCCESSOR_NOT_IN_ELIGIBLE_ROSTER`) | 0.6 | 0.4 | yes |

The unmapped successor slice stays unresolved by name; it is not silently dropped or folded into the
mapped slice.

## 5. Acceptance criteria

| ID | Criterion | Status | Where proven |
|---|---|---|---|
| AC-1.1 | All sector-reference forms rejected as identity input | **PASS** | `identity-resolver.test.ts` (`Banking-H1`, `Technology-H3`, `Capital Markets-R2`, `Utilities-REF12`, and a sector reference wherever it appears); rows H-05, W-03 |
| AC-1.2 | ISIN Luhn rejects single-character corruption; no ISIN→symbol fallback on a miss | **PASS** | `identity-resolver.test.ts` exhaustive sweep (every position × 7 substitutions of an eligible ISIN: none resolves, none yields an issuer, most are `REJECTED_MALFORMED_ISIN`), a structurally impossible ISIN distinguished from a corrupt one; row B-01; row B-03 (AARAV symbol present, still `UNMATCHED`) |
| AC-1.3 | Two active issuers sharing a symbol ⇒ `AMBIGUOUS`, `issuerId: null` | **PASS** | `identity-resolver.test.ts`; row H-04 |
| AC-1.4 | Symbol matched only outside its window ⇒ `STALE_REFERENCE` | **PASS** | `identity-resolver.test.ts`; rows H-06, W-06; date-driven re-resolution at `asOf 2020-03-01` |
| AC-1.5 | CIN/equity-ISIN disagreement ⇒ `ISSUER_KEY_CONFLICT` | **PASS** | `identity-resolver.test.ts`; row H-03 |
| AC-1.6 | Equity + preference under one issuer ⇒ two bindings, only equity assessable | **PASS** | `identity-resolver.test.ts`; rows W-01 / W-02 |
| AC-1.7 | Demerger with an unmapped successor: that slice unresolved, measured + unmeasured reconcile | **PASS** | `identity-corporate-actions.test.ts`; `CA-BODHI-DEMERGER-2025` above |
| AC-1.8 | Split adjustment preserves per-share consistency within 0.01 % | **PASS** | `identity-corporate-actions.test.ts` (`verifyPerShareConsistency`, tolerance 1e-4, price **and** EPS) |
| AC-1.9 | Byte-deterministic across 100 shuffled input orderings | **PASS** | `identity-coverage.test.ts` (100 shuffles, byte-identical canonical JSON; reversed roster + listing-map orderings give identical classifications) |
| AC-1.10 | No resolved binding from a name match | **PASS** | `identity-resolver.test.ts` (observations carry `displayName`, resolver reads none; `provenance.resolutionBasis = IDENTITY_FIELDS_ONLY`) |
| Rev-3 | `AMBIGUOUS_LISTING` state for one listing carrying several securities | **PASS** | `identity-resolver.test.ts`; row B-04 |
| Rev-3 | CA extensions: symbol change, delisting, rights, buybacks, consolidation, bonus | **PASS** | `identity-sources.test.ts` (the table must represent SPLIT, BONUS, RIGHTS, BUYBACK_TENDER, MERGER, DEMERGER, SYMBOL_CHANGE, DELISTING, NAME_CHANGE; CONSOLIDATION and BUYBACK_OPEN_MARKET are accepted, unknown types rejected), `identity-corporate-actions.test.ts` (factor application, bonus + buyback in date order, rights without a factor → `NOT_COMPARABLE`, re-keying never adjusts a per-share value, `symbolHistory`) |
| Rev-3 | Versioned identity data with digests, effective dates and provenance | **PASS** | `identity-sources.test.ts` (digest mismatch, window validation, unknown issuer/type, duplicate ids) |

No criterion is FAIL or BLOCKED. Nothing in this table is claimed beyond what the named test asserts.

## 6. Endpoint and view

| Route | Method | Result |
|---|---|---|
| `/api/investment/coverage?asOf=YYYY-MM-DD` | GET, HEAD | JSON report; `400 invalid-asOf`, `503 identity-sources-unavailable` / `observation-sources-unavailable`, `405` with `Allow: GET, HEAD` |
| `/investment/coverage?asOf=YYYY-MM-DD` | GET | server-rendered HTML, no JavaScript, `CSP: default-src 'none'; style-src 'unsafe-inline'` |
| `/api/investment/coverage/preview?asOf=…` | POST | evaluates broker-preview rows the client already holds; `mode: PREVIEW_EVALUATION_ONLY`, `persisted: false`; `413` above 5,000 rows |

All responses carry `cache-control: no-store`. The preview route exists because broker-preview rows are
never persisted anywhere; inventing a server-side preview store would have created a new persistence
store, which is out of scope. The rows therefore travel to the same resolver in the request.

`identity-endpoint.test.ts` drives the handler through a real loopback `node:http` server (GET, HEAD,
HTML) and asserts the failure modes above.

## 7. Verification executed

| Command | Result |
|---|---|
| `cd iips-platform && ./node_modules/.bin/tsc --noEmit` | **clean** (`typecheck-iips-platform.txt`, 0 bytes) |
| `./node_modules/.bin/tsx --test tests/investment/*.test.ts` | **195 / 195 pass**, 51 suites, 0 fail (`test-log-investment.txt`) |
| `./node_modules/.bin/tsx --test tests/regression/np12-sector-reference-population.test.ts` | **42 / 42 pass** (`test-log-np12-regression.txt`) |
| `./node_modules/.bin/tsx scripts/iid1-coverage-report.ts <this dir>` | report, HTML and summary written from the fixture sources |

IID-1 accounts for 104 of the 195 investment tests (30 resolver, 24 sources, 14 corporate actions, 15
coverage, 18 endpoint, 3 runtime); the remaining 91 are the IID-0 suites, re-run but not re-derived.

Not executed in this sandbox: the frontend test runner and Vite build (`frontend/` has no
`node_modules`). The two new server modules and the two new browser modules were type-checked with the
available TypeScript and React 18 type definitions; the platform handler they call is covered by the
loopback HTTP tests above. This is recorded as a tooling limitation, not as a passing frontend build.

## 8. Limitations that remain — visible, not resolved

1. **Reference data is synthetic.** The roster, listing map and corporate-action table in this evidence
   are fixtures. They prove the mechanics and every resolution state is reachable; they say nothing about
   real-company coverage. The report carries `rosterDataClass: SYNTHETIC_FIXTURE` and
   `rosterLabel: "SYNTHETIC IID-1 reference roster (fixture; not real companies)"` so the surface cannot
   be mistaken for live coverage.
2. **Carry-forward (A) — R-16 sector coverage is not complete.** 3 of 13 sectors measured, 10 in
   `outstandingSectors`. Identity coverage is a different question from financial/operating-metric
   coverage, and the report keeps them apart in separate sections. This evidence run loads no dataset,
   so its own financial section reads `NONE`; the live endpoint discloses the served dataset, and the
   IID-0 position stands as measured in `evidence/iid/IID-0-FOUNDATIONS-2026-11-05/coverage-report.json`.
   IID-1 does not close R-16.
3. **Carry-forward (B) — 20-tag XBRL map, 8-item closed derivation set**, unmapped tags counted. IID-1
   adds no derivation rule and no tag mapping; the disclosure still reports 20 and 8.
4. **Carry-forward (C) — reference data is synthetic**, as in (1); operator-supplied roster/listing-map/CA
   files are supported by the loader but have not been supplied or validated against real data.
5. **Broker-preview coverage is request-scoped.** Preview rows are evaluated on demand; there is no
   stored preview history to re-score later.
6. **Frontend build/test not run here** (see §7).
7. **Only listed equity is assessable.** Preference shares, debentures, ETFs, fund units, REIT/InvIT,
   warrants and rights entitlements are `OUT_OF_SCOPE_SECURITY`; unlisted securities are `INELIGIBLE`.

## 9. Boundary statements

- **IPD was not written to.** Holdings are read through the existing `IpcUserPortfolioPort` read path
  with an empty scope; no mutation operation is invoked, no store is opened and no portfolio is saved.
- **NP-04 was not touched.** No report, chain, version or evidence artefact was created, read or
  migrated by this phase.
- **No new persistence store.** The roster / listing map / CA table are versioned operator files in the
  existing local data domain; the preview route writes nothing.
- **Frozen sector engines were not modified.**
- **IID-2 … IID-6 were not started**: no company assessment, no valuation, no financial derivation, no
  report generation.

## 10. Files in this directory

| File | Content |
|---|---|
| `coverage-report.json` | full report exactly as the endpoint returns it |
| `coverage-view.html` | the server-rendered coverage view |
| `coverage-summary.txt` | human-readable counts, rows, reconciliation and source digests |
| `test-log-investment.txt` | TAP output, 195/195 |
| `test-log-np12-regression.txt` | TAP output, 42/42 |
| `typecheck-iips-platform.txt` | `tsc --noEmit` output (empty = clean) |
