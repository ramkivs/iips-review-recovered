# IIPS v3.0 — NP-06 Reports: CV-51 Bounded UI and Route Exposure Implementation Authority — Proposed Program Authority Decision Act (`2026-10-25`)

> **STATUS: `PROPOSED — NOT APPROVED / NOT EFFECTIVE — PENDING PROGRAM AUTHORITY DECISION`**
>
> **Authority Notice:** This document is a **prepared candidate Program Authority decision act** submitted for review by Program Authority (Ramki). Durable publication of this file on `ramkivs/iips-review-recovered` `refs/heads/main` records the proposed instrument as a reviewable governance input **only**; it grants **zero** implementation, route-exposure, navigation, UI, qualification, acceptance, or production authority. Until Program Authority explicitly approves this act and the approved disposition is durably recorded on `refs/heads/main`, **`CV-51` remains `WITHHELD / BLOCKED — PA DECISION PENDING`**.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01` |
| **Document Type** | Proposed Program Authority Implementation Authority Decision Act (`CV-51` — Reports UI and Route Exposure) |
| **Status** | **`PROPOSED — NOT APPROVED / NOT EFFECTIVE`** |
| **Date Prepared** | `2026-10-25` (UTC) |
| **Decision Authority** | Ramki — Program Authority & Single Application Owner *(approval pending)* |
| **Prepared Candidate Disposition** | **`Option CV51-A`** — Authorize bounded non-production **read-only** L1 Reports UI, route mount (`/reports`, `/reports/:reportId`), and sidebar navigation exposure over the already-accepted NP-06 `GET` transport surfaces |
| **Authoritative Repository (IRR)** | `ramkivs/iips-review-recovered` (`refs/heads/main`) |
| **Verified Baseline at Preparation** | Commit `0cc999ffba424476bace9688ca2f93ab114f0ee5` (tree `8af4b196205b4e3dcbc4801614a60c709c7e0d7f`, merge of PR #264; CI `40188325777` `success`) |
| **Related Repository (IPD)** | `ramkivs/iips-production-market-data` (`refs/heads/main` @ `4b5c65a731a66a6fa1260146a55df9ed772953a5` — **out of scope; zero writes permitted**) |
| **Supporting Readiness & Plan Record** | [`docs/integration/IIPS_v3.0_REPORTS_NP06_CV51_READINESS_INVESTIGATION_AND_IMPLEMENTATION_PLAN_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_CV51_READINESS_INVESTIGATION_AND_IMPLEMENTATION_PLAN_2026-10-25.md) (`IIPS-V3-REPORTS-NP06-CV51-READINESS-AND-PLAN-2026-10-25-01`) |
| **Preserved Prerequisite Acts (Unchanged)** | Commissioning `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01` (`67743031…`); `R3` `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (`9642ce1b…`); `R1` `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01` (`c4fdc26b…`); `R2` `IIPS-V3-REPORTS-NP06-R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01` (`e3ad095e…`); `F-7` & Bounded Backend Acceptance `IIPS-V3-REPORTS-NP06-F7-QUALIFICATION-AND-ACCEPTANCE-2026-10-25-01` (`77fc793c…`) |
| **Environment Boundary** | **Bounded Non-Production Only** (`Production Admission = NOT ADMITTED`) |

---

## 1. Proposed Program Authority Disposition (For PA Selection)

Program Authority is invited to select one of the three dispositions below:

- **[ ] `APPROVE Option CV51-A` *(Recommended)*:** Grant bounded non-production implementation authority to expose NP-06 Reports as the seventh L1 product section (`/reports` and `/reports/:reportId`, plus L1 sidebar link `Reports`) as a **strictly read-only downstream UI projection** over the four qualified `GET` endpoints of `frontend/server/reports-transport.ts`, subject to the exact 12-file allowlist (§2), binding constraints (§3), preserved backend/IPD invariants (§4), exclusions (§5), and mandatory automated + real-browser qualification and separate post-qualification PA acceptance (§6).
- **[ ] `APPROVE WITH MODIFICATIONS`:** Grant bounded authority subject to explicit PA-specified amendments to route path, sidebar placement, or scope recorded by PA.
- **[ ] `RETAIN DEFERRAL (Option CV51-C)`:** Decline UI/route exposure at this time; keep `CV-51` `WITHHELD / BLOCKED` with NP-06 retained as an accepted bounded non-production backend-only capability.

*(Until one option above is explicitly rendered by Program Authority, none is selected and no implementation authority exists.)*

---

## 2. Exact Authorized Implementation Scope Under `Option CV51-A` (Closed Allowlist)

If and only when `Option CV51-A` is approved and effective, implementation changes are strictly restricted to the following **12 frontend paths** plus the resulting qualification record and master tracker reconciliation:

### 2.1 New Frontend Client, Feature & Test Files (6 Paths)

1. `frontend/src/api/reports.ts` — Credential-free (`noAuthFetch`) read-only typed client for `GET /api/reports/context`, `GET /api/reports/artifacts`, `GET /api/reports/artifacts/:reportId`, and `GET /api/reports/artifacts/:reportId/supersession`, with strict runtime envelope validation, partition-literal stripping, and closed-vocabulary `ReportsApiError`.
2. `frontend/src/api/reports.test.ts` — Unit tests for request construction, `credentials: 'omit'`, `authorization` stripping, envelope validation, prohibited-key absence, and sanitized error mapping.
3. `frontend/src/features/reports/ReportsStates.tsx` — Sanitized `ReportsStateView` (`503` carrier/persistence/network unavailable, `404` indistinguishable not-found, `400`/`500`/invalid-envelope errors, and `Retry` control) plus presentation-only formatting helpers.
4. `frontend/src/features/reports/ReportsWorkspace.tsx` — Top-level `/reports` landing view displaying governed single-owner posture, current-head `CanonicalReportArtifact` table, empty/loading/error states, and `nextCursor` pagination.
5. `frontend/src/features/reports/ReportDetail.tsx` — Durable `/reports/:reportId` artifact & supersession inspector rendering the four `NP-06 D8` / `§5.6` progressive-disclosure levels in exact order (`Summary`, `Detail`, `Evidence & Provenance`, `Replay & Reference`) with race-safe version switching.
6. `frontend/src/features/reports/Reports.test.tsx` — Component and `MemoryRouter` integration tests covering all UI states, all four `D8` disclosure levels, pagination, supersession navigation, partition-literal non-disclosure, keyboard operability, and error sanitization.

### 2.2 Bounded Shell, Route & Shell-Test Modifications (6 Paths)

7. `frontend/src/app/routes.ts` — Add `reports: '/reports'` and `reportDetail: '/reports/:reportId'` only.
8. `frontend/src/app/navigation.ts` — Add `{ label: 'Reports', path: ROUTES.reports }` as a top-level L1 `NavItem` between `Evidence` and `Settings`.
9. `frontend/src/app/App.tsx` — Mount `<Route path="/reports" element={<ReportsWorkspace />} />` and `<Route path="/reports/:reportId" element={<ReportDetail />} />`.
10. `frontend/src/app/AppShell.tsx` — Apply `.app-shell--reports` narrow-viewport modifier class when `pathname === '/reports' || pathname.startsWith('/reports/')`.
11. `frontend/src/app/AppShell.css` — Include `.app-shell--reports` in the `≤640px` / `≤320px` responsive shell rules alongside `.app-shell--macro`.
12. `frontend/src/app/App.test.tsx` — Add `Reports` sidebar assertion and credential-free `/reports` + `/reports/:reportId` deep-link tests.

---

## 3. Binding Architectural, Security, and UX Conditions (`C-CV51-01` – `C-CV51-10`)

1. **`C-CV51-01` (Seventh L1 Product Section — `NP-06 D8`):** Reports shall be mounted as a top-level L1 sibling route (`/reports`, `/reports/:reportId`) with concrete sidebar entry `Reports` (`/reports`); no parameterized `:reportId` link may appear in global navigation.
2. **`C-CV51-02` (Read-Only Canonical Projection — `NP-06 R4`, `R5`, `G11`):** UI shall issue `GET` requests only and render persisted cross-sector `CanonicalReportArtifact` fields verbatim. It shall never recompute scores, rankings, allocations, weights, verdicts, or `reportKey` digests; never synthesize `FrozenReportingEngineOutput` client-side; and never fabricate investment values (`null`/missing values render `'unavailable'` or `'—'`, never `0`).
3. **`C-CV51-03` (Four Ordered Progressive-Disclosure Levels — `NP-06 §5.6`):** `ReportDetail` shall render, in exact sequence: **(1) Summary** (`reportType`, `generatedAt`, `schemaVersion`, `artifactVersion`, governed single-owner scope posture, `CURRENT HEAD` vs `SUPERSEDED` status), **(2) Detail** (`canonicalPayload` fields), **(3) Evidence & Provenance** (`provenance.engineOutputId`, provenance metadata, `reportKey`, `supersedesReportId`, supersession chain), and **(4) Replay & Reference** (`reportId` + `artifactVersion` durable handles, version links including link to `current` head, and honest non-claim copy distinguishing durable retrieval from engine re-execution or file export).
4. **`C-CV51-04` (Credential-Free Single-User Operation):** Every HTTP request shall execute through `noAuthFetch` (`credentials: 'omit'`, `authorization` stripped). Zero login, logout, session, role, permission, or tenant-selection controls may appear anywhere in the UI.
5. **`C-CV51-05` (Prohibited Client Claims — `R1` / `R2 C-4` & `C-5`):** Client code shall never transmit `tenantId`, `tenant`, `userId`, `user`, `owner`, `ownerUserId`, `ownership`, `authenticatedUser`, `principal`, `roles`, `role`, `companyId`, `runtimeCompanyId`, `reportKey`, `artifactVersion`, `supersedesReportId`, or `schemaVersion`.
6. **`C-CV51-06` (Partition-Literal Non-Disclosure — `F-3` Precedent):** After validating wire envelope structure in `src/api/reports.ts`, raw partition identifier strings (`irr-reports-personal`, `owner-irr-reports-personal`) shall be stripped from client view models and never rendered in visible DOM text.
7. **`C-CV51-07` (`R2`-Preserving Sanitized Error Mapping):** `src/api/reports.ts` shall map HTTP/network failures onto a closed client vocabulary (`owner-context-unavailable`, `persistence-unavailable`, `service-unavailable`, `not-found`, `invalid-request`, `transport-error`, `network-unavailable`, `invalid-envelope`) while **discarding raw `detail` and `reason` strings**, ensuring zero filesystem paths, carrier digests, SQLite errors, or stack traces reach the DOM, and preserving `404` indistinguishability between missing and foreign-owned report IDs.
8. **`C-CV51-08` (Evaluation Independence of `/context` vs `/artifacts`):** Because `GET /api/reports/context` returns `200` even when `IIPS_NP04_DATABASE_PATH` is unset, artifact availability on `/reports` shall always be governed by the `GET /api/reports/artifacts` response itself.
9. **`C-CV51-09` (Zero Client Persistence):** No report artifact, cursor, or owner metadata may be written to `localStorage`, `sessionStorage`, `IndexedDB`, or cookies.
10. **`C-CV51-10` (WCAG AA Accessibility, Non-Color-Only & Responsive Integrity):** UI shall maintain semantic landmarks, single `<h1>` → `<h2>` hierarchy, `<th scope="col">`, ARIA `status`/`alert` live regions, full keyboard operability, visible `:focus-visible`, symbol+label+token badges (`Badges.tsx` — using `PlatformBadge` / `StatusBadge`, never mislabeling platform lifecycle metadata as `CERTIFIED RESULT`), `prefers-reduced-motion`, and overflow-free layout across `1280×800`, `768×1024`, `375×812`, and `320px` viewports.

---

## 4. Preserved Completed Baselines and Strict Non-Modification Invariants

Approval of this act **preserves unchanged** and **prohibits modifying**:

1. All operative NP-06 governance and backend qualification records (`R1` `c4fdc26b…`, `R2` `e3ad095e…`, `R3` `9642ce1b…`, `F-7` & Bounded Backend Acceptance `77fc793c…`, Commissioning `67743031…`).
2. All backend server, carrier, resolver, domain, and harness modules under `frontend/server/**` (including `reports-transport.ts` `775d282b…`, `reports-owner-carrier.ts` `5239d0bf…`, `reports-owner-resolver.ts` `66410e12…`, `executive-transport.ts` `a438eec0…`, `user-portfolio-transport.ts` `51704c12…`, `owner-context-unavailable.ts` `cb8db45d…`, and unwired `d115-runtime.ts` `d9b546c9…`).
3. All certified platform and CSIP engines under `iips-platform/**`, including frozen `ReportingEngine.ts` (`1149864a8c43e8b885eee2c4a9a1ce869dd8f338`).
4. Dependency manifests and pins (`frontend/package.json` `a0061bce…`, `frontend/package-lock.json`, `#2d9130e7…`, `#70b24f02…`, `#2e11fa3b…`).
5. The external IPD repository `ramkivs/iips-production-market-data` (**zero** commits, branches, tags, or PRs).

---

## 5. Explicit Non-Grants and Out-of-Scope Exclusions

Even if approved and effective, this act **does NOT authorize or grant**:

1. Browser-initiated report generation, creation, or version-append UI (`POST /api/reports/artifacts` or `POST /api/reports/artifacts/:reportId/versions`) or any backend endpoint exposing raw `FrozenReportingEngineOutput`.
2. Sector-level reporting (`NP-06 R4` — deferred) or PDF/CSV/HTML/file export projections (`NP-06 R5` — deferred).
3. Any change to the `R2` `C-7` (`A-2`) request-time access-audit deferral.
4. Any runtime wiring or consumption of `D115` / `CV-43` (`frontend/server/d115-runtime.ts`).
5. Any lift, change, or admission on User Portfolios (`G-2` / `CV-20` / `CV-39` / `CV-52`) or `CV-24` (`F6` / `TD-7b`).
6. Authentication, OIDC, Keycloak, RBAC, multi-user accounts, sharing, or tenant management (`H-18`).
7. Self-executing closure or product acceptance of `CV-51` upon code merge: **separate post-qualification PA acceptance is required** (§6).
8. **Production admission, production readiness, or production deployment authority (`NOT ADMITTED`)**, including any production use of the diverged `2e11fa3b…` NP-04 persistence lineage.

---

## 6. Mandatory Qualification, Rollback, and Closure Gate

Before `CV-51` may be submitted for PA product-surface acceptance and moved out of `BLOCKED` in `§16.4.4` / `§16.12`:

1. **Automated Verification:** `reports.test.ts`, `Reports.test.tsx`, `App.test.tsx`, full `npm run test:ci` (with `assert-tests` guard `OK`), `npm run typecheck`, `npm run typecheck:replay-server`, and `npm run build` must pass (`0` errors / `0` failures), with `git diff` confirming zero files touched outside §2.
2. **Real-Browser Loopback Qualification (`B-1` – `B-6`):** Headless Chromium verification against the live loopback stack (`127.0.0.1:5173` → `127.0.0.1:8787`, runtime carrier and SQLite store materialised outside any Git worktree and cleaned afterward) must pass and be durably recorded under `docs/integration/`:
   - `B-1`: Carrier-absent `503 owner-context-unavailable` sanitized state + `Retry`.
   - `B-2`: Carrier-valid / DB-absent `503 persistence-unavailable` sanitized state + `Retry` (proving `/context` `200` does not mask `/artifacts` `503`).
   - `B-3`: Configured empty store `200` empty state.
   - `B-4`: Configured `v1 → v2` superseded chain (seeded via real CSIP `ReportingEngine` output) verifying head list, all 4 `D8` disclosure levels, `SUPERSEDED` vs `CURRENT HEAD` navigation, `0` `Authorization` headers/cookies/prohibited params, and `0` raw partition strings in DOM text.
   - `B-5`: Indistinguishable `404` state on unknown UUIDv4.
   - `B-6`: Keyboard Tab/Enter traversal and overflow-free layout at `1280×800` and `375×812`.
3. **Atomic Rollback Readiness:** Any breach of `C-CV51-01`..`C-CV51-10` or regression on existing surfaces requires immediate single-commit `git revert` of the 12 frontend paths, leaving backend and persisted NP-04 data untouched.
4. **Durable Remote Verification & Separate PA Acceptance:** Implementation + browser qualification record must be merged to `origin/main` with green PR-head and post-merge `main` CI and verified via post-merge receipt (`§16.70.13`), followed by explicit PA acceptance before `CV-51` is marked `COMPLETE / ACCEPTED`.

---

## 7. Effectiveness Rule

1. **Current State (`PROPOSED — NOT APPROVED / NOT EFFECTIVE`):** Preparation and merge of this document to `ramkivs/iips-review-recovered` `refs/heads/main` under `CV-CORR-95` (`§16.113`) **does not approve or activate this act**.
2. **Activation Precondition:** This act becomes effective **if and only if** Program Authority (Ramki) explicitly approves a disposition in §1 and that rendered decision is durably published on `ramkivs/iips-review-recovered` `refs/heads/main` and independently verified from the remote repository.
