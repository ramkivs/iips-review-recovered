# IID-6 — the read-only argument

The invariant list for this phase says: **no investment `POST/PUT/PATCH/DELETE`; no write/save/generate button or
persisting UI transition; no trading/order output; no new persistence store; no IPD modification; no SQLite or
IRR-local artifacts; no network at read time beyond the local read transport.**

This file is the evidence for each clause, in the order the work was done: what the code contains, what the tests
pin, and — where something pre-existing does not fit the sentence — the exception, named rather than hidden.

## 1. The two new clients are GET-only by construction

`src/api/investmentDisposition.ts` and `src/api/investmentChanges.ts` each route every request through a single
private `readGet(url)` helper:

```ts
return fetch(url, { method: 'GET', headers: { accept: 'application/json' }, credentials: 'same-origin' });
```

There is no second helper, no `method` parameter, no body, and no exported function that takes a verb. The route
builders are pure string functions:

| Function | Route |
|---|---|
| `fetchHeldDisposition(portfolioId, securityId)` | `GET /api/investment/portfolio/:portfolioId/holding/:securityId` |
| `fetchCandidateDisposition(securityId[, contextPortfolioId])` | `GET /api/investment/candidate/:securityId[?portfolio=…]` |
| `fetchPortfolioDispositions(portfolioId)` | `GET /api/investment/portfolio/:portfolioId/dispositions` |
| `fetchCompanyChanges(issuerId)` | `GET /api/investment/company/:issuerId/changes` |
| `fetchChangeBoundaries(issuerId)` | `GET /api/investment/company/:issuerId/changes/boundaries` |

Those are the routes IID-4 and IID-5 already exposed. **No route handler was added, changed or relaxed in this phase.**

`src/api/iid6InvestmentClients.test.ts` asserts `init.method === 'GET'` on every call, asserts no request body, and
asserts that no URL matches `/reconcile|record|generate|append|write/` (19 tests).

## 2. The surfaces contain no write control

Greps over the files this phase added or changed:

- `input`, `select`, `textarea`, `form`, `contenteditable`: **none** in
  `CompanyAssessmentPage.tsx`, `CandidateAssessmentPage.tsx`, `DispositionPanel.tsx`, `ChangeTimeline.tsx`,
  `InvestmentCoveragePage.tsx`, `SectorReferenceDisclosure.tsx`, or the new columns in `UserPortfolioDetail.tsx`.
- `button`: exactly two kinds — the version selector (`v1`, `v2`, …, `aria-pressed`) and the timeline pair selector
  (`Compare v1 → v2` / `Showing v1 → v2`, `aria-pressed`). Both only change *which stored version is read*; the
  tests assert the follow-up request URL.
- `onSubmit`, `onClick` handlers that call a mutating client: none. No surface imports a mutating client at all.
- The word `reconcile` appears **only** in explanatory text naming
  `ChangeService.reconcile` / report kind `VERSION_BOUNDARY_RECONSTRUCTED` as an operator action against the governed
  store. `iid6ChangeTimeline.test.tsx` asserts every button's label matches `^(Compare|Showing) v\d+ → v\d+$` and
  matches none of `reconcile|repair|fix|generate|backfill`.

Tests that would fail if a control were added:
`iid6CompanyAssessment.test.tsx` › "offers no form control and no write affordance anywhere on the page" and ›
"renders no write control and no execution language"; `src/app/iid6Routes.test.tsx` › "renders no write affordance on
a degraded investment page"; `iid6PortfolioIntegration.test.tsx` › "issues only GETs and offers no mutation control".

## 3. No trading or order output

The surfaces render no order, no quantity-to-trade, no price-to-trade, no venue, no broker action. The disclosure line
is explicit and asserted: *"no order, quantity or price is published here"*.
`iid6CompanyAssessment.test.tsx` asserts that `buy`, `sell`, `place order`, `trade now`, `recommend` and
`add to portfolio` do not appear anywhere in the rendered company page, and that the one sentence containing the word
`order` is the **negative** disclosure. The disposition payload's own `interpretation.notAnInstruction` is rendered
verbatim; it comes from the stored artifact, not from the UI.

## 4. The one pre-existing POST in an investment client, and why it stays

`src/api/investmentCoverage.ts:197` — `evaluateBrokerPreview()` — issues `POST /api/investment/coverage/preview`. It
predates this phase (IID-1), it stores nothing (the endpoint evaluates submitted rows and echoes no canonical
identity), and **no page imports it**:

```
$ grep -rn "evaluateBrokerPreview" src --include=*.ts --include=*.tsx
src/api/investmentCoverage.ts:   export async function evaluateBrokerPreview(...
```

IID-6 does not build the broker-preview surface (it is not in the ACs), so the function remains unused, exactly as it
was found. Removing it would be an unrequested deletion of an IID-1 capability; routing it through the read-only
helper would be a lie about a POST. It is recorded here, in the corrections file, and in the limitation register
overlay so that a future reader does not mistake it for something this phase introduced. The **surfaces** this phase
delivers issue GET only — that is what the tests assert, on the surfaces, not on the module corpus.

Other `POST`/`PUT`/`DELETE` call sites in `src/api/` belong to unrelated existing domains (broker import, settings,
watchlists, collaboration, replay, screener, engines). None is imported by an investment surface.

## 5. No persistence, no store, no artifact

- `package.json` and `package-lock.json`: untouched. No dependency added (AC-X3).
- No new table, cache, journal, adapter, migration or file write anywhere in the diff (AC-X5).
- No file under `iips-platform/` was touched — including `iips-platform/src/sector-engines/` (AC-X4). The diff in
  `changed-files.txt` contains no `iips-platform/` path.
- `src/api/userPortfolios.ts` was **not** modified: the portfolio payload is read exactly as G-2 defines it. IPD was
  not changed either — the phase consumes `UserPortfolioView`, it does not extend it.

## 6. The single server edit, and why it is not a contract change

`frontend/server/investment/dispositionService.ts`: the private helper `headVerb()` became `headFacts()`, and the
existing list projection (`GET /api/investment/portfolio/:portfolioId/dispositions`) now also carries
`confidence`, `horizon`, `withheld` and `issuerId`.

- The route, its handler, its status codes, its error vocabulary and its existing fields are unchanged.
- Every new field is read from the **head payload that was already being read** to produce `verb`; no new read, no
  new query, no new dependency on the store.
- `null` continues to mean "the head payload could not be read", never "no verb". A withheld head therefore reports
  `withheld: true` with `verb: null`, and the surface renders the withheld state rather than a missing one.
- Why it was necessary: the portfolio page cannot show a holding's disposition, or link it to the issuer it is
  about, without these four facts, and deriving `issuerId` client-side from an ISIN would be an invented mapping —
  explicitly the thing IID-6 forbids.
- Tests: `server/investment/disposition-records.test.ts` (the four facts are the head payload's; a withheld head
  reports withheld with no verb and no confidence) and `server/investment/disposition-transport.test.ts` (the same
  facts on the wire). Both files are otherwise unchanged; the 30 pre-existing assertions still pass (32 total now).

## 7. Network at read time

Every request the surfaces make goes to the same-origin local read transport (`/api/investment/...`,
`/api/user-portfolios/...`) using the existing `noAuthFetch`/`fetch` convention. There is no external host, no
exchange domain, no telemetry, and no second backend. `iid6InvestmentClients.test.ts` asserts the exact URL of each
call; `iid6Routes.test.tsx` asserts that mounting each route produces only local `/api/...` GETs.
