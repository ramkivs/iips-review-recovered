# IID-P02 continuation — targeted evidence (2026-11-08)

All data created in this run was isolated and synthetic, outside the checkout. No assertion is made about the user's existing environment. See the [integration record](../../../docs/integration/IIPS_V3_IID_P02_INTEGRATION_VERIFICATION_2026-11-08.md) for the matrix, status and acceptance blockers.

## Browser observations

Actual HeadlessChrome/153.0.8010.0, Puppeteer 25, real Vite `/api` proxy and real executive transport; no intercepted/mock API responses. Server processes were restarted between reads. Ports 5173/8787 were local test ports. React StrictMode caused duplicate GETs; they are not separate records.

| Test environment | Browser observation |
|---|---|
| Empty isolated data root, no F-3 carrier, no IPD binding | Coverage GET 503 `IDENTITY_SOURCE_MISSING` for roster/listingMap/corporateActions; watchlists and collaboration GET 503 owner-context-unavailable; user portfolios GET 503 owner-context-unavailable. This does **not** reproduce the user's earlier portfolio-empty result or prove the state of that user's store. |
| Approved F-3 carrier in isolated external path, empty journal | Watchlists and collaboration GET 200 and empty UI. Browser created synthetic watchlist and thread (company reference `Banking`): each POST 201, subsequent GET 200, both rendered. Restarted executive server against the same data root; both rendered again with GET 200. |
| Same carrier plus repository **synthetic** identity fixture files in isolated data root, no IPD binding | Coverage GET 503 `OBSERVATION_SOURCE_UNAVAILABLE`: holdings provider not established. The identity loader reached the observation stage; it did not serve a partial coverage total. After correction, UI copy mentions readable observation sources. |
| Separate isolated M1 NP-04 DB and approved Reports carrier, server restarted | Two synthetic assessment versions persisted by existing CLI, browser head GET 200, changes/boundaries GET 200, v1 then v2 version GET 200. Issuer `IN:EQISIN:IN0000000201`; v1 `83eb8d60-b063-428d-b8ba-0ccd8ff21d8f`, v2 `54671f08-3a75-452c-87cf-d8ff51c8fb52` (IDs specific to this run). UI and API agreed on period `2026-03-31`, revenue `14600000000`, method midpoint `430.4410716809049`, sensitivity cell `443.6345570663666`; values displayed with UI formatting. This probe navigated directly by issuer, not from a portfolio or coverage selection. |

Initial company browser read returned HTTP 200 but crashed in `numeric()` because `method.output.perShare` was absent in actual payload. Actual method outputs use `perShareLow/Mid/High` observations and actual sensitivity points use numeric/null `value`. The corrected browser probe passed after the frontend fix. A unit test covers withheld sensitivity, including suppression of diagnostic enterprise value; the browser M1 data does not itself prove all withheld cases.

## Reproduction outline

Use a **new** empty external temporary directory, never an existing user data root. Commands below show the actual method; M1 report IDs are generated and differ per run. Install frontend dependencies with `npm ci` and `npm run build:broker-import`. This sandbox required `npm ci --strict-ssl=false --no-audit --no-fund` because its codeload CA validation failed; the flag is not a production recommendation. Install browser tools in an external prefix (`npm install --prefix /tmp/iid-p02-browser --no-save @sparticuz/chromium@153.0.0 puppeteer-core@25`). On this sandbox Chromium needed its vendor `al2023.tar.br` libraries decompressed into an external directory and `LD_LIBRARY_PATH` set to its `lib` directory. No browser dependency was added to the app.

From `frontend/`, with a fresh `/tmp/iid-p02-audit`:

```sh
mkdir -p /tmp/iid-p02-audit/{data,carrier}
./node_modules/.bin/tsx -e "import {materialiseOwnerContextCarrier} from './server/owner-context-carrier.ts'; console.log(materialiseOwnerContextCarrier('/tmp/iid-p02-audit/carrier'))"
./node_modules/.bin/tsx -e "import {prepareM1Environment,M1_NOW,M1_NOW_V2} from './server/investment/demo/m1Pipeline.ts'; import {M1_ISSUER_ID} from './server/investment/demo/m1Data.ts'; import {runCli} from './server/investment/cli/generate-investment-artifacts.ts'; (async()=>{const e=prepareM1Environment('/tmp/iid-p02-audit/m1'); for(const [d,t] of [[e.datasetV1Dir,M1_NOW],[e.datasetV2Dir,M1_NOW_V2]]){const r=await runCli(['--issuer',M1_ISSUER_ID,'--data-dir',d,'--identity-dir',e.identityDir,'--db',e.dbPath,'--owner-carrier',e.carrierPath,'--generated-at',t]); if(r.exitCode!==0) throw new Error(JSON.stringify(r.summary.failure)); console.log(r.summary.artifact);}})()"
IIPS_DATA_DIR=/tmp/iid-p02-audit/data IIPS_OWNER_CONTEXT_PATH=/tmp/iid-p02-audit/carrier/owner-context.json IIPS_REPORTS_OWNER_PATH=/tmp/iid-p02-audit/m1/reports-owner-context.json IIPS_NP04_DATABASE_PATH=/tmp/iid-p02-audit/m1/investment.db ./node_modules/.bin/tsx server/executive-transport.ts
# In another terminal, frontend/:
./node_modules/.bin/vite --host 0.0.0.0
# From repository root (set LD_LIBRARY_PATH as described above if required):
BROWSER_MODULE_ROOT=/tmp/iid-p02-browser/node_modules node evidence/iid/IID-P02-IDENTITY-OWNERSHIP-2026-11-08/browser-check.mjs create
BROWSER_MODULE_ROOT=/tmp/iid-p02-browser/node_modules node evidence/iid/IID-P02-IDENTITY-OWNERSHIP-2026-11-08/assessment-check.mjs
# Restart the executive server with the same isolated variables, then run:
BROWSER_MODULE_ROOT=/tmp/iid-p02-browser/node_modules node evidence/iid/IID-P02-IDENTITY-OWNERSHIP-2026-11-08/browser-check.mjs read
BROWSER_MODULE_ROOT=/tmp/iid-p02-browser/node_modules node evidence/iid/IID-P02-IDENTITY-OWNERSHIP-2026-11-08/assessment-check.mjs
```

`create` intentionally writes the two test journal records; do not run against an actual user's data. For the coverage-stage observation, copy the three files only from `iips-platform/tests/investment/fixtures/identity/` into the isolated `${IIPS_DATA_DIR}/investment/identity/` and observe the refusal with no IPD binding. Those files are not an authoritative real universe and are not installed into the application.

## Targeted automated tests

- Frontend `npm run typecheck`: passed.
- `npx vitest run src/features/investment/iid6Coverage.test.tsx src/features/user-portfolios/UserPortfolioList.test.tsx src/features/user-portfolios/iid6PortfolioIntegration.test.tsx src/features/investment/iid6Disposition.test.tsx src/features/investment/iid6CompanyAssessment.test.tsx src/features/investment/iid6ChangeTimeline.test.tsx src/api/iid6InvestmentClients.test.ts server/watchlists/watchlists-transport-owner-context.test.ts server/collaboration/collaboration-transport-owner-context.test.ts server/owner-context-resolver.test.ts server/owner-context-restart.test.ts server/user-portfolio/fenceUnchanged.test.ts server/user-portfolio/userPortfolioDirectP1Integration.test.ts server/investment/change/store.test.ts server/investment/change/transport.test.ts`: **15 files, 200 passed**, before the later valuation contract correction; re-run results below supersede this subset for changed UI files. Direct P1 test uses a synthetic Unix-socket peer, not an IPD database.
- After valuation correction, `npx vitest run src/features/investment/CompanyAssessmentPage.test.tsx src/features/investment/iid6CompanyAssessment.test.tsx src/features/investment/iid6Coverage.test.tsx src/features/user-portfolios/UserPortfolioList.test.tsx src/features/investment/iid6Disposition.test.tsx src/features/investment/iid6ChangeTimeline.test.tsx src/features/user-portfolios/iid6PortfolioIntegration.test.tsx src/api/iid6InvestmentClients.test.ts`: **8 files, 99 passed** before adding two valuation tests. The added valuation test file separately passed **21 tests**, including the two new cases.
- From `iips-platform/`, `npx tsx --test tests/investment/identity-sources.test.ts tests/investment/identity-resolver.test.ts tests/investment/identity-corporate-actions.test.ts tests/investment/identity-endpoint.test.ts tests/investment/identity-runtime.test.ts tests/investment/l038CashSideAlignment.test.ts tests/investment/l039CashSideEvidence.test.ts`: **118 passed**, including existing L-038/L-039 safeguard tests. Their evidence and safeguards were not modified.
- Known test-run warnings: React Router future flags, timeline synthetic duplicate-key warning, Node experimental SQLite warning. They do not establish full live integration acceptance.

Final post-correction combined rerun: the same 15-suite command above plus `src/features/investment/CompanyAssessmentPage.test.tsx` produced **16 files / 210 tests passed**, with frontend typecheck passed. A subsequent focused rerun of the company suite covers an additional assertion that a numeric cell in a withheld grid is suppressed.
