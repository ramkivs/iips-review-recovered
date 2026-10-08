# G-2 UI-Consumer Implementation Record — 2026-10-08

**Gate:** G-2 UI-CONSUMER IMPLEMENTATION (authorized by the 25-section Arena Execution Prompt, 2026-10-08)
**Scope authority:** §L of `G2-UI-CONSUMER-IMPLEMENTATION-READINESS-2026-10-08.md` (disposition A)
**Platform refs:** IRR main `15b28e868a8ccf654cb0c7b5c7eeed50085947a7`; IPD main `4d3e1cdca3a33da0ec3be8b336b17128108a502c`; G24 pinned lineage `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`; NP-04 pin `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`
**Session base:** branch `arena/627f4e40-iips-review-recovered`, parent `17e234a1d6a5e1629cdf98b5c5f241a663cf9901` (tree `e669595a`, app-equivalent to IRR main `15b28e86`)

---

## A — Authorization and executed scope

Implemented the §L Minimum Viable G-2 UI Consumer, exactly and only:

- A typed read-only API client for the two existing durable read surfaces.
- A list route `/user-portfolios` and a detail route `/user-portfolios/:portfolioId`.
- Navigation registration (one top-level item, `minRole: 'viewer'`).
- Full state coverage: loading, 401, 403, 404, 503 (with boundary blocker), 500, network fault, empty.
- 20 new tests covering all 10 required scenarios.

The optional `/context` surface and the optional stub-backed transport test were not needed: the fetch-mocked component tests exercise the same wire shapes the transport serves, and `/context` adds no materially better consumer behavior (it is a non-durable seam-state surface).

## B — Files created and modified

**Created (6):**

| File | Lines | Content |
|---|---|---|
| `frontend/src/api/userPortfolios.ts` | 190 | Typed client: mirrored `G2PortfolioSummary` (9 fields), `G2PortfolioView` (11), `G2HoldingView` (15), `G2Contribution` (7) as `UserPortfolioSummary/View/Holding/Contribution`; `UserPortfolioApiError {status, message, blocker?}` (status 0 = network); `fetchUserPortfolioSummaries()`, `fetchUserPortfolio(portfolioId)` with `encodeURIComponent`, envelope parsing, 503 `detail.blocker` extraction |
| `frontend/src/features/user-portfolios/UserPortfolioStates.tsx` | 107 | `AuthenticationRequiredState` (`state-authentication-required`, points at top-bar Sign-in), `UserPortfolioNotFoundState` (`state-not-found`), `UserPortfolioErrorState` (401/403/404/503+`g2-boundary-detail`/500/network mapping over platform state components), `formatInr` (en-IN), `formatPct`, `shortDigest` (opaque, `title`=full) |
| `frontend/src/features/user-portfolios/UserPortfolioList.tsx` | 101 | List surface: DataTable columns Portfolio(link `user-portfolio-link-{id}`)/Revision/Total value/Holdings/Weight sum/Updated/Status(Committed–Not committed)/Provenance; EmptyState on zero rows |
| `frontend/src/features/user-portfolios/UserPortfolioDetail.tsx` | 142 | Detail surface: back link, MetricGroup (total value/holdings/weight sum/revision), `user-portfolio-status` committed line, holdings DataTable (10 cols), contributions DataTable (7 cols), digests opaque |
| `frontend/src/features/user-portfolios/UserPortfolioList.test.tsx` | 237 | 10 tests: render, loading, 401, 403, 503+blocker, 500, network fault, empty, no-mutation-controls, list→detail navigation |
| `frontend/src/features/user-portfolios/UserPortfolioDetail.test.tsx` | 184 | 10 tests: render (metrics/holdings/contributions), loading, 401, 404, 503+blocker, empty contributions, opaque digest display, identifier encoding, no-mutation-controls, 500 |

**Modified (2, purely additive — 15 insertions, 0 deletions):**

- `frontend/src/app/App.tsx` (+9): imports and two routes after `/portfolio/*` — `/user-portfolios` and `/user-portfolios/:portfolioId`.
- `frontend/src/app/navigation.ts` (+6): one governed top-level nav item `User Portfolios` (`minRole: 'viewer'`) after the Portfolio block.

## C — What was NOT done (scope confirmations)

- No change to the G-2 server (`frontend/server/user-portfolio/*`, `user-portfolio-transport.ts`), the G-2 contract, the adapter, the translation boundary, authorization, dispatch, or any G-2 test.
- No change to the IPD repository, D115, `iips-platform/`, the certified `/portfolio` route, `PortfolioWorkspace`, `api/portfolio.ts`, or production config.
- No cross-repo copy/transplant (no PortfolioWorkspace/BrokerImportModal/Dhan adapters/IPD portfolio-store/IPD navigation code).
- No Dhan SDK/credential/login/connection/import/broker-specific logic; `sourceBroker` renders as normalized data only.
- No D115 resolution (`CompanyId`/`runtimeCompanyId` untouched; holdings' `companyId` is rendered verbatim as the G24-presented value).
- No IRR-side persistence: no localStorage/sessionStorage/IndexedDB/browser cache/JSON/journal anywhere in the new code.
- No mutation controls of any kind (verified by tests: no button/form/textbox, no import/upload/delete/reset/save surface).
- No second auth mechanism, no Keycloak config: `authFetch` reused verbatim; authorization stays server-side.

## D — Boundary compliance

The consumer speaks only the two authorized GET surfaces and treats every value as IPD-owned:
`GET /api/user-portfolios` → `{ portfolios }`; `GET /api/user-portfolios/:portfolioId` → `{ portfolio }`. Error handling mirrors the transport's closed vocabulary: 401 `{error}`, 403 `{error:'forbidden'}`, 404 `{error:'not found'}`, 503 `{error:'upstream-unavailable', detail:{reason, blocker, requiresAuthorizedChange, authoritativeCommit}}`, 500 `{error, detail}`. Digests are displayed opaquely (truncated, `title` carries the full value) and never hashed/recomputed/compared client-side. Owner/tenant identifiers are absent from the wire and never expected or reconstructed. A malformed envelope fails closed (typed 500-class client error, never fabricated data).

## E — Contract citation

Consumed surfaces are defined by `frontend/server/user-portfolio/userPortfolioContract.ts` (`G2_CONTRACT_VERSION = '1'`, lineage pin `6828155…`) as served by `frontend/server/user-portfolio-transport.ts` (list: `res 200 {portfolios}`; detail: `res 200 {portfolio}`; 503 blocker: `G2_IPD_BOUNDARY.blocker`) and dispatched additively in `executive-transport.ts` on the `/api/user-portfolios` namespace only. The client mirrors these DTOs with a contract-citation header (same convention as `api/executive.ts` / `api/portfolio.ts`); there is no src→server import edge.

## F — Validation (commands and results)

All three gates run in `frontend/` against the full suite:

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** (exit 0) |
| `npx vitest run` | **PASS — 1018 tests: 993 passed, 25 skipped, 0 failed; 69 files: 66 passed, 3 skipped** |
| `npm run build` (`tsc -b && vite build`) | **PASS** (93 modules, dist emitted) |

## G — Test accounting (new vs pre-existing)

- New: **20 tests** (10 list + 10 detail), all passing, all fetch-mocked at the transport boundary (same pattern as the certified `PortfolioWorkspace.test.tsx`).
- Pre-existing: **998 tests** (973 passed + 25 skipped), 0 failed. This includes the G-2 server suites (59/59 user-portfolio + transport + boundary + contract + adapter), the IU-5/IU-6 pit runtime suites (which import the real IPD package runtime), and the reports persistence suite.
- No pre-existing test was modified, renamed, or deleted. The two tracked-file edits are additive (routes + nav item) and caused no pre-existing failure.

## H — Environment note (dependency reconstruction, disclosed)

`npm ci` cannot run in this sandbox: the GitHub tarball host (`codeload.github.com`) is TLS-blocked (ECONNRESET), so the git-pinned dependency `iips-production-market-data#2e11fa3b` cannot be fetched by npm; the npm registry itself is reachable. `node_modules` (untracked, git-ignored) was therefore assembled as:

1. **Registry dependencies** installed into a scratch package (the 14 non-git dependencies of `frontend/package.json` at their declared ranges; `frontend/package.json` and `package-lock.json` untouched — verified by §I audit).
2. **`iips-production-market-data`** reconstructed from the authoritative sources at the pinned ref `2e11fa3b`: 20 source files under `src/{pit,contracts,d114,normalization,persistence}` fetched verbatim from `raw.githubusercontent.com` and compiled locally with the repo's own `tsconfig.pit-package.json` (both `tsc` invocations clean, ESM output matching the package's `exports` map). `package.json` is the pinned ref's verbatim file. Runtime verified by smoke tests (D114 population → PIT read resolves the correct series-aware vintage; persistence `openDatabase` + `GovernedArtifactStore` five operations against `node:sqlite`).

This reconstruction exists only inside git-ignored `node_modules` and only so the suite can run in this environment; it is not a source-tree change and is not part of the commit. The owner-side CI, which can reach GitHub, should run `npm ci` normally.

## I — §18 change-scope audit (pre-commit)

`git status` against parent `17e234a1`:

- Tracked modifications: **exactly** `frontend/src/app/App.tsx` and `frontend/src/app/navigation.ts` (`git diff --stat`: 2 files, +15/−0).
- New implementation files: `frontend/src/api/userPortfolios.ts` + 5 files under `frontend/src/features/user-portfolios/` (§B).
- No other tracked file changed; `node_modules/` and `dist/` confirmed git-ignored.
- Cross-scope grep: no file outside the six new files + two edits references the consumer (`(none — scope contained)`).
- Untracked records from earlier gates (`docs/integration/*` adjudication/decision records, `evidence/integration/`, `download/`) predate this gate and are unchanged by it.

**Result: audit PASS — the change set is exactly the authorized §L minimum consumer.**

## J — Prohibition-compliance matrix

| Prohibition | Status |
|---|---|
| No G-2 server/contract/adapter/translation/authorization change | Held (no server file touched) |
| No IPD/D115/`iips-platform`/`/portfolio`/production-config change | Held |
| No cross-repo copy/transplant | Held (new code only; platform design components reused) |
| No Dhan SDK/credentials/broker logic | Held (`sourceBroker` display only) |
| No D115 resolution | Held |
| No IRR-side persistence | Held (state is component-local only; verified by inspection + tests) |
| Digests opaque | Held (rendered verbatim, truncated for layout; never recomputed) |
| No fabricated portfolio data | Held (every value comes from the transport; absence renders a state, never data) |
| No mutation controls | Held (tests assert no button/form/textbox/import/upload/delete/reset) |
| Reuse IRR OIDC `authFetch` only | Held |
| Reuse IRR design system only | Held (`StateComponents`, `DataComponents`, inline styles in the platform idiom) |
| Routes distinct from `/portfolio` | Held (`/user-portfolios`, `/user-portfolios/:portfolioId`) |

## K — §22 stop conditions

None triggered. No change was required to the G-2 contract/server, IPD, D115, `/portfolio`, identity/persistence authorities, Dhan integration, or production config; scope remained sufficient for the authorized minimum consumer.

## L — Non-production status

This is a non-production consumer over a non-production G-2 boundary. In an environment with no live multi-audience IdP, the durable surfaces answer 503 and the UI renders `UnavailableState` + the boundary blocker — fail-closed by design, surfaced, never worked around. No deploy/activate/migrate/provision of any live system occurred.

## M — Durability (local commit)

Committed on session branch `arena/627f4e40-iips-review-recovered` (parent `17e234a1d6a5e1629cdf98b5c5f241a663cf9901`):

- Implementation commit: `7f53ba34d16ccfd27936865746e9608604756c08` (tree `fc5f2c0f3ffaa6610a96da9e74acdc5ad9ead624`), followed by this record-correction commit citing it (a commit cannot embed its own hash).
- Contents: §B's 6 new files + 2 edits + this record + the readiness record that defines §L.

## N — Remote verification status

The sandbox's remote git/gh channel is closed (TLS-blocked), so the commit cannot be pushed and no remote `git verify-commit`/`ls-tree` check can be run from here. **Owner-side action required:** push the session branch (or fast-forward the equivalent change set onto IRR main `15b28e86`) and verify parent/commit/tree SHAs remotely. Earlier gate records (`P8-CONVERGENCE-ADJUDICATION`, `UI-PLATFORM-CAPABILITY-RECONCILIATION`, `UI-LINEAGE-CONVERGENCE-GOVERNANCE-RECONCILIATION`, `UI-TARGET-ARCHITECTURE-SELECTION-DECISION`, evidence/download trees) remain workspace-local and uncommitted pending the same owner-side durability step.

## O — Open items (unchanged, none introduced by this gate)

- Live multi-audience IdP certificate + per-user credential mechanism + retention/purge policy (gates live operation only, not this consumer).
- D115 continuation (not needed for this consumer).
- M03/M04 disposition; NP-15 IPD-side publication.
- Optional future increments (separately gated): `/context` consumption, stub-backed transport test, revision-history surface.

---

## §25 Disposition: **B — implementation complete; durability verification pending**

The §L minimum consumer is implemented, validated (typecheck PASS, full suite 993/0, build PASS), audited (§18 PASS), and committed locally. Remote durability (push + SHA verification) is pending owner-side action because the sandbox remote channel is closed. No further implementation action is proposed; next stages only on explicit user prompt.
