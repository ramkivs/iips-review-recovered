# IID — Identity Coverage and Investment Coverage: separation of the two capabilities

**Date:** 2026-11-10
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Ownership:** IRR
**Environment:** Local / Single-User / Non-Production
**Production:** out of scope

---

## 1. The reported symptom

`/identity-coverage` displayed:

> Identity coverage is unavailable
>
> The eligible roster, listing map or corporate-action table could not be loaded. No identity is
> established and no row is classified.
>
> No identity can be established without the eligible roster, listing map and corporate-action
> table, so no row is classified. Nothing is guessed and no substitute roster is used.

with the diagnostic `eligible-roster.json / IDENTITY_SOURCE_MISSING / missing file(s): roster,
listingMap, corporateActions`.

**The Investment Coverage menu entry at `/investment/coverage` displayed the same
identity-specific message.** That is the defect.

For the identity surface, this is the correct and required behaviour. For the investment surface,
it is wrong: the investment-coverage position of the dataset does not depend on an identity file.

---

## 2. Root cause

### 2.1 One component, two routes

`frontend/src/app/App.tsx` (before this change) registered the SAME component on both paths:

```
<Route path={ROUTES.identityCoverage}   element={<InvestmentCoveragePage />} />   // '/identity-coverage'
<Route path={ROUTES.investmentCoverage} element={<InvestmentCoveragePage />} />   // '/investment/coverage'
```

There was no Investment Coverage page component at all. The two menu entries led to one page.

### 2.2 One endpoint, one contract

`frontend/src/api/investmentCoverage.ts` exposed exactly one read:
`GET /api/investment/coverage` → `InvestmentCoverageReport`.

That report is an **identity** coverage report (`iips-platform/src/investment/identity/coverage.ts`):
`counts` / `bySource` / `items` / `unresolved` / `successorReconciliations` / `identitySources` /
`financialCoverage` / `statusLine` / `notes`.

### 2.3 The endpoint short-circuited before the investment data was computed

`iips-platform/src/investment/identity/coverageEndpoint.ts`:

```ts
const loaded = await dependencies.loadSources();
if (!loaded.available) {
  return json(503, { error: 'identity-sources-unavailable', ... });   // ← returns HERE
}
// … only AFTER this:
const financialCoverage = dependencies.financialCoverage === undefined
  ? emptyFinancialCoverage()
  : await dependencies.financialCoverage();
```

When the identity files were absent, the endpoint answered 503 and the financial-coverage
disclosure was **never computed**.

### 2.4 The investment data never depended on the identity files

`frontend/server/investment/sources.ts` → `financialCoverageFromLocalDataset(dataRoot)` →
`iips-platform/src/investment/identity/runtime.ts`, which reads the **local snapshot store**
(`openLocalSnapshot`) and the sector measurement. It never reads the identity directory.

Its own doc comment already stated the intended behaviour:

> "an absent or unreadable dataset is disclosed as `NONE`, which is the truthful answer and
> **keeps identity coverage independent of financial coverage**."

**The independence already existed in the data layer. The endpoint's ordering and the shared
component's identity-worded failure branches hid it.**

### 2.5 The shared component's failure branches were all identity-worded

`frontend/src/features/investment/InvestmentCoveragePage.tsx` (before this change):

| Branch | Copy |
|---|---|
| loading | `Loading identity coverage…` |
| error | `<h1>Identity coverage</h1>` |
| unavailable | `<h1>Identity coverage is unavailable</h1>` + "No identity can be established without the eligible roster…" |
| ready | `<h1>Investment coverage</h1>` |

The component was named for investment coverage and its **success** branch already rendered the
investment heading — but every **failure** branch showed identity copy.

### 2.6 The server-rendered view had the same coupling

`iips-platform/src/investment/identity/coverageView.ts` — `renderUnavailableHtml` renders
`<h1>Identity coverage is unavailable</h1>` and serves the `/investment/coverage` HTML route
(`COVERAGE_ROUTES.html`).

### 2.7 Conclusion

The two capabilities were not two pages with a shared component. They were **one page**, and its
identity-flavoured failure states were reachable from the Investment Coverage route.

---

## 3. The correction

### 3.1 A separate investment-coverage read model

**New:** `iips-platform/src/investment/coverage/investmentCoverage.ts`

Computes the investment-coverage position from the local snapshot store and the sector measurement:
per-issuer coverage state, per-sector method measurement, dataset identity and freshness, ingestion
issues, and the IID-0 financial-coverage disclosure.

Issuer states: `COVERED`, `NO_FINANCIALS`, `SECTOR_NOT_MEASURED`, `ISSUED_DATA`.

### 3.2 A separate endpoint

**New:** `iips-platform/src/investment/coverage/investmentCoverageEndpoint.ts`

```
GET /api/investment/coverage/investment?asOf=YYYY-MM-DD   → application/json
```

It never consults the identity sources for anything but disclosure. Its 503 names the investment
dataset (`INVESTMENT_DATASET_UNREADABLE`) and never borrows the identity wording.

### 3.3 A runtime adapter

`iips-platform/src/investment/identity/runtime.ts` — `investmentCoverageFromLocalDataset(asOf, dataRoot)`.
An absent or unreadable dataset is disclosed as `datasetClass: 'NONE'` with zero issuers: an **empty
position**, not a failure.

### 3.4 A separate page component

**New:** `frontend/src/features/investment/IdentityCoveragePage.tsx` — the identity surface.

It is the previous component with only the header documentation and the success-branch `<h1>`
changed. **Every behavioural branch — the fail-closed unavailable state, the loading state, the
error state, and all row rendering — is byte-identical to the original.** The governed
identity-source requirement is unchanged.

**Rewritten:** `frontend/src/features/investment/InvestmentCoveragePage.tsx` — the investment
surface, with its own four states (loading / unavailable / empty / populated) and its own contract.

**New:** `frontend/src/api/investmentCoverageInvestment.ts` — the client, with its own error type
(`InvestmentCoverageUnavailableError`) so the two surfaces can never render each other's message.

### 3.5 Route and navigation separation

| Menu entry | Path | Component | Endpoint |
|---|---|---|---|
| Identity Coverage | `/identity-coverage` | `IdentityCoveragePage` | `/api/investment/coverage` |
| Investment Coverage | `/investment/coverage` | `InvestmentCoveragePage` | `/api/investment/coverage/investment` |

`frontend/server/executive-transport.ts` now routes the new path to the coverage transport.

### 3.6 The identity dependency is disclosed, not enforced

Where the identity sources could not be loaded:

- the report carries `identitySourcesAvailable: false` and `identitySourceDetail`;
- each issuer row carries `identityDependency: null` — **"not evaluated"**, which is never collapsed
  into "no dependency";
- the page renders a disclosure section stating that the investment coverage is unaffected and that
  an identity-scoped assessment cannot be opened while it holds.

It never replaces the page with an identity error.

---

## 4. Verification

### 4.1 End-to-end, against the real defect scenario

`frontend/scripts/iid-coverage-separation-probe.mts` writes a **real** investment dataset, writes
**no** identity files (the reported state), starts the **real** transport and queries both routes
over **real** HTTP.

```
--- 1. Identity Coverage: fail closed, unchanged ---
  PASS  identity read answers 503 — status=503
  PASS  identity read names the identity failure — identity-sources-unavailable
  PASS  identity read reports IDENTITY_SOURCE_MISSING — IDENTITY_SOURCE_MISSING

--- 2. Investment Coverage: its own content, with identity sources absent ---
  PASS  investment read answers 200 — status=200
  PASS  investment read is a report
  PASS  investment read never says identity-sources-unavailable
  PASS  investment read discloses the identity absence — identitySourcesAvailable=false
  PASS  investment read reports the real dataset — datasetClass=SYNTHETIC_FIXTURE
  PASS  investment read reports REAL issuer rows from the real dataset — 1 issuer(s): Aarav Systems Limited
  PASS  each issuer row discloses the identity dependency as "not evaluated" — dependencies=null
  PASS  investment read has its own status line — 1 of 1 issuer(s) covered; … 1 of 13 sector(s) measured.

--- 3. Genuine investment-coverage unavailability is separate ---
  PASS  investment read still answers 200 with no dataset — status=200
  PASS  absent dataset is disclosed as NONE
  PASS  absent dataset yields no issuer rows
  PASS  absent dataset is an empty position, not a failure

--- 4. The identity read is unaffected by the dataset being absent ---
  PASS  identity read still fails closed with 503 — status=503

ALL CHECKS PASSED
```

### 4.2 Regression tests

| File | What it proves |
|---|---|
| `frontend/src/features/investment/iidCoverageSeparation.test.tsx` (14) | The two pages read different endpoints; identity keeps its fail-closed behaviour; investment with identity sources unavailable shows its own content and status and never the identity heading or the identity wording; the identity dependency is disclosed on the page and at row level; genuine investment unavailability is reported as investment unavailability; investment distinguishes loading / unavailable / empty / populated; the two menu entries lead to different paths. |
| `frontend/server/investment/iidInvestmentCoverageTransport.test.ts` (5) | Over real HTTP: the investment route answers 200 with the identity sources absent and never returns `identity-sources-unavailable`; a genuine investment failure answers 503 naming the investment dataset; the identity route still answers 503; the routes do not shadow each other. |
| `iips-platform/tests/investment/investment-coverage.test.ts` (9) | The counts are identical with and without the identity sources; the identity dependency is `null` ("not evaluated") when the sources are absent; an issuer with no financials is not covered; an ingestion issue moves the issuer to `ISSUED_DATA`; an absent dataset is `NONE` with zero issuers; a synthetic fixture is never called operator-supplied. |
| `iips-platform/tests/investment/investment-coverage-endpoint.test.ts` (9) | The endpoint answers 200 with the identity sources absent; it never returns the identity error code; its 503 names the dataset; an invalid `asOf` and a non-GET method are rejected; the identity endpoint still fails closed and still refuses to read any observation. |
| `frontend/src/features/investment/iid6Coverage.test.tsx` (8, updated) | The existing identity-coverage assertions, now against the identity surface. Every assertion is preserved. |

### 4.3 Gates

| Gate | Result |
|---|---|
| Frontend Vitest | **180 files / 2533 tests passed**, 1 skipped, 0 failed (baseline before this change: 178 / 2514) |
| Platform `npm run test:iid` | **777 tests passed**, 0 failed |
| Frontend `npm run typecheck` | exit 0 |
| Frontend `npm run typecheck:replay-server` | exit 0 |
| Frontend `npm run typecheck:investment-server` | exit 0 |
| Frontend `npm run build` | exit 0 (181 modules) |
| Platform `npm run typecheck` | exit 0 |
| End-to-end probe | ALL CHECKS PASSED |

---

## 5. Limitations and scope

- **No browser verification was performed.** No Chromium binary is available in this environment.
  The component behaviour is covered by jsdom component tests and the HTTP contract by the transport
  and platform endpoint tests, both over real HTTP. No browser claim is made.
- **No IPD file or repository was modified.** No Dhan or Broker Import functionality was touched. No
  identity governance rule, resolver or source file was changed.
- **No identity file was provisioned.** The identity sources remain absent in the default
  environment; nothing was created to make a surface succeed.
- **The server-rendered HTML view at `/investment/coverage`** still renders the identity unavailable
  page when the identity sources are absent. It is the same identity report rendered without
  JavaScript, and the browser Investment Coverage page reads the new investment endpoint. This is
  stated rather than silently changed, because the credential-free JS-free view is an established
  IID-1 surface whose contract is the identity report.
- The investment-coverage read is a **dataset-level** position (issuer, sector, dataset). It is not
  a per-holding assessment; the per-holding identity position remains the identity coverage report.

---

## 6. Files changed

| File | Change |
|---|---|
| `iips-platform/src/investment/coverage/investmentCoverage.ts` | **new** — the investment-coverage read model |
| `iips-platform/src/investment/coverage/investmentCoverageEndpoint.ts` | **new** — the investment-coverage endpoint |
| `iips-platform/src/investment/identity/runtime.ts` | the `investmentCoverageFromLocalDataset` adapter |
| `iips-platform/tests/investment/investment-coverage.test.ts` | **new** — the read-model tests |
| `iips-platform/tests/investment/investment-coverage-endpoint.test.ts` | **new** — the endpoint tests |
| `frontend/src/api/investmentCoverageInvestment.ts` | **new** — the investment-coverage client and its own error type |
| `frontend/src/features/investment/IdentityCoveragePage.tsx` | **new** — the identity surface (the previous component; behaviour unchanged) |
| `frontend/src/features/investment/InvestmentCoveragePage.tsx` | **rewritten** — the investment surface with its own states |
| `frontend/src/features/investment/iidInvestmentCoverageFixtures.ts` | **new** — the investment-coverage fixtures |
| `frontend/src/features/investment/iidCoverageSeparation.test.tsx` | **new** — the separation regression |
| `frontend/src/features/investment/iid6Coverage.test.tsx` | retargeted to the identity surface; every assertion preserved |
| `frontend/server/investment/coverage-transport.ts` | routes the investment path; injects the investment provider |
| `frontend/server/investment/sources.ts` | supplies the investment provider |
| `frontend/server/investment/iidInvestmentCoverageTransport.test.ts` | **new** — the real-HTTP transport tests |
| `frontend/server/executive-transport.ts` | routes `/api/investment/coverage/investment` |
| `frontend/src/app/App.tsx` | the two routes mount their own pages |
| `frontend/src/app/routes.ts` | the two paths are documented as distinct capabilities |
| `frontend/scripts/iid-coverage-separation-probe.mts` | **new** — the end-to-end probe (not part of any gate) |
