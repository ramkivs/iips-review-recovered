# IIPS v3.0 — NP-06 Reports: CV-51 Bounded UI and Route Exposure Implementation Authority — Program Authority Decision Act (`2026-10-25`)

> **STATUS: `APPROVED — OPERATIVE UPON PUBLICATION`**
>
> **Authority Notice:** This is the operative Program Authority decision act for `CV-51` bounded non-production read-only Reports UI exposure. It records the explicit PA approval rendered on `2026-10-25`. It is effective as an authoritative instrument upon publication to `ramkivs/iips-review-recovered` `refs/heads/main` and independent remote read-back, per program convention (§16.70.13). Publication coordinates are not self-embedded in this act; they are established from the remote repository and recorded in the master tracker receipt (§16.114).

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01` |
| **Document Type** | **PROGRAM AUTHORITY DECISION ACT — OPERATIVE UPON PUBLICATION** (`CV-51` — Reports UI and Route Exposure Implementation Authority) |
| **Authority** | Program Authority (PA) — Ramki |
| **Decision date** | `2026-10-25` (Asia/Calcutta) — PA explicit approval of 2026-10-25 ("IIPS v3.0 — NP-06 Reports: PA Approval and One-Pass CV-51 Implementation") |
| **Decision rendered** | **`APPROVE Option CV51-A`** — Bounded Non-Production Read-Only Reports UI Exposure |
| **Recording agent** | Arena Agent Mode — recording, publication, and bounded execution support. **No authority is rendered by the agent.** |
| **Authoritative Repository (IRR)** | `ramkivs/iips-review-recovered` (`refs/heads/main`) |
| **Verified Baseline at Decision** | Commit `53176b73e505cbc75ad23694bbd12482323ae7a3` (merge of PR #267, post-merge `main` CI `40190146374` `success`) |
| **Related Repository (IPD)** | `ramkivs/iips-production-market-data` (`refs/heads/main` @ `4b5c65a731a66a6fa1260146a55df9ed772953a5` — **out of scope; zero writes permitted**) |
| **Supporting Readiness & Plan Record** | [`docs/integration/IIPS_v3.0_REPORTS_NP06_CV51_READINESS_INVESTIGATION_AND_IMPLEMENTATION_PLAN_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_CV51_READINESS_INVESTIGATION_AND_IMPLEMENTATION_PLAN_2026-10-25.md) (`IIPS-V3-REPORTS-NP06-CV51-READINESS-AND-PLAN-2026-10-25-01`) |
| **Preserved Proposal Record (Unchanged)** | [`docs/integration/IIPS_v3.0_REPORTS_NP06_CV51_IMPLEMENTATION_AUTHORITY_PA_DECISION_ACT_PROPOSED_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_CV51_IMPLEMENTATION_AUTHORITY_PA_DECISION_ACT_PROPOSED_2026-10-25.md) — the candidate act as prepared and published under `CV-CORR-95` (§16.113), preserved byte-identical as the proposal history of this decision. This operative act does not overwrite, amend, or misrepresent that proposal record. |
| **Preserved Prerequisite Acts (Unchanged)** | Commissioning `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01` (`67743031…`); `R3` `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (`9642ce1b…`); `R1` `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01` (`c4fdc26b…`); `R2` `IIPS-V3-REPORTS-NP06-R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01` (`e3ad095e…`); `F-7` & Bounded Backend Acceptance `IIPS-V3-REPORTS-NP06-F7-QUALIFICATION-AND-ACCEPTANCE-2026-10-25-01` (`77fc793c…`) |
| **Environment Boundary** | **Bounded Non-Production Only** (`Production Admission = NOT ADMITTED`) |
| **Tracker Registration** | Master tracker §16.114 (`CV-CORR-96`, `CHG-2026-10-25-17`) |

---

## 1. Program Authority Disposition Rendered

Program Authority has explicitly rendered the following disposition:

- **[x] `APPROVE Option CV51-A`:** Bounded non-production implementation authority is granted to expose NP-06 Reports as the seventh L1 product section (`/reports` and `/reports/:reportId`, plus the L1 sidebar link `Reports`) as a **strictly read-only downstream UI projection** over the four qualified `GET` endpoints of `frontend/server/reports-transport.ts`, subject to the exact 12-file allowlist (§2), binding conditions (§3), preserved backend/IPD invariants (§4), explicit non-grants (§5), and mandatory automated + real-browser qualification with a separate post-qualification PA acceptance (§6).
- **[ ] `APPROVE WITH MODIFICATIONS`** — not selected. No PA-specified amendment to route path, sidebar placement, or scope accompanies this approval.
- **[ ] `RETAIN DEFERRAL (Option CV51-C)`** — not selected.

The PA approval directive of `2026-10-25` selects `CV51-A` without modification and directs one-pass execution: record and publish this act, implement the approved 12-file allowlist, execute qualification in the same pass (automated suites, typechecks, full CI, production build, and real Chromium loopback `B-1`–`B-6`), publish and reconcile, and maintain the separate product-acceptance gate. No further approval is required for work authorized by this act, and the approved scope must not be expanded.

## 2. Exact Authorized Implementation Scope Under `Option CV51-A` (Closed Allowlist)

Implementation changes are strictly restricted to the following **12 frontend paths** plus the resulting qualification record, published qualification evidence, post-qualification PA acceptance record, and master tracker reconciliation:

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

## 3. Binding Architectural, Security, and UX Conditions (`C-CV51-01` – `C-CV51-10`)

1. **`C-CV51-01` (Seventh L1 Product Section — `NP-06 D8`):** Reports shall be mounted as a top-level L1 sibling route (`/reports`, `/reports/:reportId`) with concrete sidebar entry `Reports` (`/reports`); no parameterized `:reportId` link may appear in global navigation.
2. **`C-CV51-02` (Read-Only Canonical Projection — `NP-06 R4`, `R5`, `G11`):** UI shall issue `GET` requests only and render persisted cross-sector `CanonicalReportArtifact` fields verbatim. It shall never recompute scores, rankings, allocations, weights, verdicts, or `reportKey` digests; never synthesize `FrozenReportingEngineOutput` client-side; and never fabricate investment values (`null`/missing values render `'unavailable'` or `'—'`, never `0`).
3. **`C-CV51-03` (Four Ordered Progressive-Disclosure Levels — `NP-06 §5.6`):** `ReportDetail` shall render, in exact sequence: **(1) Summary** (`reportType`, `generatedAt`, `schemaVersion`, `artifactVersion`, governed single-owner scope posture, `CURRENT HEAD` vs `SUPERSEDED` status), **(2) Detail** (`canonicalPayload` fields), **(3) Evidence & Provenance** (`provenance.engineOutputId`, provenance metadata, `reportKey`, `supersedesReportId`, supersession chain), and **(4) Replay & Reference** (`reportId` + `artifactVersion` durable handles, version links including link to `current` head, and honest non-claim copy distinguishing durable retrieval from engine re-execution or file export).
4. **`C-CV51-04` (Credential-Free Single-User Operation):** Every HTTP request shall execute through `noAuthFetch` (`credentials: 'omit'`, `authorization` stripped). Zero login, logout, session, role, permission, or tenant-selection controls may appear anywhere in the UI.
5. **`C-CV51-05` (Prohibited Client Claims — `R1` / `R2 C-4` & `C-5`):** Client code shall never transmit `tenantId`, `tenant`, `userId`, `user`, `owner`, `ownerUserId`, `ownership`, `authenticatedUser`, `principal`, `roles`, `role`, `companyId`, `runtimeCompanyId`, `reportKey`, `artifactVersion`, `supersedesReportId`, or `schemaVersion`.
6. **`C-CV51-06` (Partition-Literal Non-Disclosure — `F-3` Precedent):** After validating wire envelope structure in `src/api/reports.ts`, raw partition identifier strings (`irr-reports-personal`, `owner-irr-reports-personal`) shall be stripped from client view models and never rendered in visible DOM text.
7. **`C-CV51-07` (`R2`-Preserving Sanitized Error Mapping):** `src/api/reports.ts` shall map HTTP/network failures onto a closed client vocabulary (`owner-context-unavailable`, `persistence-unavailable`, `service-unavailable`, `not-found`, `invalid-request`, `transport-error`, `network-unavailable`, `invalid-envelope`) while **discarding raw `detail` and `reason` strings**, ensuring zero filesystem paths, carrier digests, SQLite errors, or stack traces reach the DOM, and preserving `404` indistinguishability between missing and foreign-owned report IDs.
8. **`C-CV51-08` (Evaluation Independence of `/context` vs `/artifacts`):** Because `GET /api/reports/context` returns `200` even when `IIPS_NP04_DATABASE_PATH` is unset, artifact availability on `/reports` shall always be governed by the `GET /api/reports/artifacts` response itself. Persistence availability is assessed through `GET /api/reports/artifacts`; the context endpoint alone is insufficient.
9. **`C-CV51-09` (Zero Client Persistence):** No report artifact, cursor, or owner metadata may be written to `localStorage`, `sessionStorage`, `IndexedDB`, or cookies.
10. **`C-CV51-10` (WCAG AA Accessibility, Non-Color-Only & Responsive Integrity):** UI shall maintain semantic landmarks, single `<h1>` → `<h2>` hierarchy, `<th scope="col">`, ARIA `status`/`alert` live regions, full keyboard operability, visible `:focus-visible`, symbol+label+token badges (`Badges.tsx` — using `PlatformBadge` / `StatusBadge`, never mislabeling platform lifecycle metadata as `CERTIFIED RESULT`), `prefers-reduced-motion`, and overflow-free layout across `1280×800`, `768×1024`, `375×812`, and `320px` viewports. No horizontal overflow is permitted outside the permitted responsive table wrappers.

## 4. Preserved Completed Baselines and Strict Non-Modification Invariants

This act **preserves unchanged** and **prohibits modifying**:

1. All operative NP-06 governance and backend qualification records (`R1` `c4fdc26b…`, `R2` `e3ad095e…`, `R3` `9642ce1b…`, `F-7` & Bounded Backend Acceptance `77fc793c…`, Commissioning `67743031…`).
2. All backend server, carrier, resolver, domain, and harness modules under `frontend/server/**` (including `reports-transport.ts` `775d282b…`, `reports-owner-carrier.ts` `5239d0bf…`, `reports-owner-resolver.ts` `66410e12…`, `executive-transport.ts` `a438eec0…`, `user-portfolio-transport.ts` `51704c12…`, `owner-context-unavailable.ts` `cb8db45d…`, and unwired `d115-runtime.ts` `d9b546c9…`).
3. All certified platform and CSIP engines under `iips-platform/**`, including frozen `ReportingEngine.ts` (`1149864a8c43e8b885eee2c4a9a1ce869dd8f338`).
4. Dependency manifests and pins (`frontend/package.json` `a0061bce…`, `frontend/package-lock.json`, `#2d9130e7…`, `#70b24f02…`, `#2e11fa3b…`).
5. The external IPD repository `ramkivs/iips-production-market-data` (**zero** commits, branches, tags, or PRs).

`R1`, `R2`, `R3`, and `F-7` must not be modified or reopened. `D115`/`CV-43` must not be wired. If a genuine defect requires an out-of-scope change, the evidence must be documented and that specific change stopped rather than silently expanding authority; all remaining authorized work continues.

## 5. Explicit Non-Grants and Out-of-Scope Exclusions

This act **does NOT authorize or grant**:

1. Browser-initiated report generation, creation, or version-append UI (`POST /api/reports/artifacts` or `POST /api/reports/artifacts/:reportId/versions`) or any backend endpoint exposing raw `FrozenReportingEngineOutput`. The browser posture is read-only with **zero POST calls**.
2. Sector-level reporting (`NP-06 R4` — deferred) or PDF/CSV/HTML/file export projections (`NP-06 R5` — deferred). No export actions, creation controls, or supersession-write controls may be introduced, and no unbacked routes may be introduced.
3. Any change to the `R2` `C-7` (`A-2`) request-time access-audit deferral.
4. Any runtime wiring or consumption of `D115` / `CV-43` (`frontend/server/d115-runtime.ts`).
5. Any lift, change, or admission on User Portfolios (`G-2` / `CV-20` / `CV-39` / `CV-52`) or `CV-24` (`F6` / `TD-7b`).
6. Authentication, OIDC, Keycloak, RBAC, multi-user accounts, sharing, or tenant management (`H-18`).
7. Self-executing closure or product acceptance of `CV-51` upon code merge: **separate post-qualification PA acceptance is required** (§6). This act grants **implementation authority only**.
8. **Production admission, production readiness, or production deployment authority (`NOT ADMITTED`)**, including any production use of the diverged `2e11fa3b…` NP-04 persistence lineage.

## 6. Mandatory Qualification, Rollback, and Closure Gate

Before `CV-51` may be submitted for PA product-surface acceptance and moved out of `BLOCKED` in `§16.4.4` / `§16.12`:

1. **Automated Verification:** `reports.test.ts`, `Reports.test.tsx`, `App.test.tsx`, full `npm run test:ci` (with `assert-tests` guard `OK`), `npm run typecheck`, `npm run typecheck:replay-server`, and `npm run build` must pass (`0` errors / `0` failures), with `git diff` confirming zero files touched outside §2. Actual commands, exit statuses, and logs must be preserved; no check may be marked passed unless executed and recorded.
2. **Real-Browser Loopback Qualification (`B-1` – `B-6`):** Real Chromium verification against the live loopback stack (`127.0.0.1:5173` → `127.0.0.1:8787`, runtime carrier and SQLite store materialised outside any Git worktree and cleaned afterward) must pass and be durably recorded under `docs/integration/` with published evidence:
   - `B-1`: Missing owner carrier, sanitized `503 owner-context-unavailable` presentation, and recovery after `Retry`.
   - `B-2`: Carrier-valid / DB-absent `503 persistence-unavailable` sanitized state + `Retry` (proving `/context` `200` does not mask `/artifacts` `503`; persistence assessed through `GET /api/reports/artifacts`).
   - `B-3`: Configured empty store `200` empty Reports state.
   - `B-4`: Configured populated `v1 → v2` superseded chain (seeded via real CSIP `ReportingEngine` output through the backend write path in a non-production loopback runtime) verifying head list, navigation through all 4 `D8` disclosure levels, `SUPERSEDED` vs `CURRENT HEAD` navigation, supersession/version navigation and stale-response protection, `0` browser `POST` calls, `0` `Authorization` headers/cookies/prohibited params, and `0` raw partition strings in DOM text.
   - `B-5`: Unknown report ID with indistinguishable, safe `404` handling.
   - `B-6`: Keyboard navigation and overflow-free layouts at `320px`, `640px`, and `1280px` (with `375×812` retained from the prepared plan), with no horizontal overflow outside the permitted responsive table wrappers, no partition-literal leakage into the rendered DOM, no raw backend failure details in the UI, and no unexpected browser-console errors.
3. **Atomic Rollback Readiness:** Any breach of `C-CV51-01`..`C-CV51-10` or regression on existing surfaces requires immediate single-commit `git revert` of the 12 frontend paths, leaving backend and persisted NP-04 data untouched. Changes must remain atomic and readily revertible.
4. **Durable Remote Verification & Separate PA Acceptance:** Implementation + browser qualification record must be merged to `origin/main` with green PR-head and post-merge `main` CI and verified via post-merge receipt (§16.70.13), followed by explicit PA acceptance before `CV-51` is marked `COMPLETE / ACCEPTED`. If publication, browser qualification, or remote verification fails, the exact blocker must be recorded and the corresponding gate left open; a claim must never be substituted for evidence.

## 7. Statuses Maintained by This Act

| Item | Status Under This Act |
|---|---|
| **CV-51 implementation authority** | **APPROVED** (`Option CV51-A`, bounded non-production read-only Reports UI exposure, exact 12-file allowlist) |
| **CV-51 product acceptance** | **PENDING** — separate post-qualification PA acceptance required; not granted by this act |
| **NP-06 backend capability** | **ACCEPTED** for bounded non-production scope (unchanged) |
| **Production admission** | **NOT ADMITTED** |
| **D115 / CV-43** | **UNWIRED** |
| **IPD writes** | **NONE** |

## 8. Effectiveness Rule

1. **Decision rendered:** Program Authority (Ramki) explicitly approved `Option CV51-A` on `2026-10-25`. The earlier candidate instrument remains preserved unchanged as [`IIPS_v3.0_REPORTS_NP06_CV51_IMPLEMENTATION_AUTHORITY_PA_DECISION_ACT_PROPOSED_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_CV51_IMPLEMENTATION_AUTHORITY_PA_DECISION_ACT_PROPOSED_2026-10-25.md) (`PROPOSED — NOT APPROVED / NOT EFFECTIVE` at preparation); this operative act is the canonical CV-51 decision act recording that approval and supersedes the proposal's pending status for decision purposes without altering its historical text.
2. **Activation:** This act becomes effective **if and only if** it is durably published on `ramkivs/iips-review-recovered` `refs/heads/main` and independently verified from the remote repository (remote commit, tree, decision-act contents, and tracker entry). Until that verification is complete, no implementation may rely on this authorization.
