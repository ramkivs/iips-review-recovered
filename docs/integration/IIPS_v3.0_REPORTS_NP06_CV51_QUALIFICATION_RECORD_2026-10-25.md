# IIPS v3.0 — NP-06 Reports: CV-51 Bounded Read-Only UI Qualification Record (`2026-10-25`)

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-REPORTS-NP06-CV51-QUALIFICATION-2026-10-25-01` |
| **Document Type** | Implementation & Qualification Record (`CV-51` — Reports UI and Route Exposure) — **qualification evidence only; grants no acceptance** |
| **Status** | **QUALIFICATION EXECUTED — CV-51 PRODUCT ACCEPTANCE PENDING SEPARATE POST-QUALIFICATION PA ACCEPTANCE** |
| **Date** | `2026-10-25` (UTC) |
| **Implementation Authority** | `IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01` (**APPROVED — `Option CV51-A`**), published operatively at [`docs/integration/IIPS_v3.0_REPORTS_NP06_CV51_IMPLEMENTATION_AUTHORITY_PA_DECISION_ACT_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_CV51_IMPLEMENTATION_AUTHORITY_PA_DECISION_ACT_2026-10-25.md); proposal history preserved byte-identical at [`docs/integration/IIPS_v3.0_REPORTS_NP06_CV51_IMPLEMENTATION_AUTHORITY_PA_DECISION_ACT_PROPOSED_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_CV51_IMPLEMENTATION_AUTHORITY_PA_DECISION_ACT_PROPOSED_2026-10-25.md) |
| **Authority Publication Verification (E-CV51-01)** | IRR PR **#268** merged `2026-10-25T12:29:57Z` as **`50a67cd495cb97e1ac8b94ad75f1ce51df57ec6b`** (tree `c826b8e3a1498735b4fc2034fee772f87e86e6cf`); PR-head CI **`40193107116` `success`**; post-merge `main` CI **`40193362662` `success`**; operative act read back remotely at Git blob **`353e5348f1933df1dc41d3cd84c100b2d792d56b`** (`19,620` bytes); proposal record read back unchanged at blob **`a3d265393f3522fa8a1be88380e383b2305a1452`** (`16,354` bytes); tracker at blob `346ad749571246bb0a919aee4c823526c4c692f9`; IPD `main` re-verified unchanged at `4b5c65a731a66a6fa1260146a55df9ed772953a5` (**0 writes**) |
| **Authoritative Repository (IRR)** | `ramkivs/iips-review-recovered` (`refs/heads/main`) |
| **Evidence Directory** | [`evidence/integration/cv51-reports-ui-qualification-2026-10-25/`](../../evidence/integration/cv51-reports-ui-qualification-2026-10-25/MANIFEST.md) (browser results JSON, transcript, harness, and 14 screenshots) |
| **Environment Boundary** | **Bounded Non-Production Only** (`Production Admission = NOT ADMITTED`) |

---

## 1. Implementation Delivered (Exact 12-File Allowlist)

| Path | Action | Git Blob (at implementation commit) | Responsibility |
|---|---|---|---|
| `frontend/src/api/reports.ts` | CREATE | `8b08c8ce92da3a0cbc12e46410f4993fec9cc269` | Credential-free `noAuthFetch` read-only client for the four qualified `GET` endpoints; strict runtime envelope validation; partition-literal stripping; closed `ReportsFailureKind` vocabulary with static operator-safe messages; raw `detail`/`reason` discarded |
| `frontend/src/api/reports.test.ts` | CREATE | `c65dcad8c22cbf9a642b10a505e96559d2455ecd` | 13 client tests: request construction, `credentials: 'omit'`, `authorization` absence, URL encoding, envelope fail-closed, failure-kind mapping, secret-leak absence, prohibited-field absence |
| `frontend/src/features/reports/ReportsStates.tsx` | CREATE | `18a2d28e910af833ca1ee2fbb60faceb0943ef9c` | Sanitized `ReportsStateView` (owner/persistence/service/network/envelope unavailable, indistinguishable `404`, `400`/`500` errors, `Retry`) + `shortDigest` / `formatCanonicalValue` (`null` → `unavailable`, never `0`) |
| `frontend/src/features/reports/ReportsWorkspace.tsx` | CREATE | `2f59fcd18cf3edf1356c35c60f0a652f38b67578` | `/reports` landing: governed posture header, `/context` + `/artifacts` orchestration governed by `/artifacts` (C-CV51-08), loading/empty/populated states, head table, cursor pagination with dedupe and failure preservation, race-safe loads |
| `frontend/src/features/reports/ReportDetail.tsx` | CREATE | `933768d4fab318ad0c8b4dd60d55dd1ce9aad64c` | `/reports/:reportId` inspector: four D8 levels in exact order, head resolution against the governed head list, supersession navigation, monotonic-generation stale-response discard |
| `frontend/src/features/reports/Reports.test.tsx` | CREATE | `921523d64ba9d8a4f3658e6fcc1b0571fedfdb6b` | 12 component/routing tests: all states, pagination, disclosure order, verbatim/null rendering, supersession navigation, stale-response protection, non-disclosure, keyboard, Retry recovery |
| `frontend/src/app/routes.ts` | MODIFY | `18f8bc79124e9eed8bc865895b984c3d7b3fab1a` | Adds `reports: '/reports'`, `reportDetail: '/reports/:reportId'` only |
| `frontend/src/app/navigation.ts` | MODIFY | `250afa56a447ebf939ba3901f87e5ee40d2d31f5` | Adds top-level `{ label: 'Reports', path: ROUTES.reports }` between `Evidence` and `Settings` (Settings retains its terminal position) |
| `frontend/src/app/App.tsx` | MODIFY | `a0d00f53bf681da9f0459995c65e7cf957112d22` | Mounts `/reports` → `ReportsWorkspace`, `/reports/:reportId` → `ReportDetail` |
| `frontend/src/app/AppShell.tsx` | MODIFY | `9b602ee7c1a9d8af9d6887a399f495829ae576da` | Applies `.app-shell--reports` on `/reports` and `/reports/*` |
| `frontend/src/app/AppShell.css` | MODIFY | `b9ffc5d251128fd7c26f5ab3383864489f3ebe18` | `.app-shell--reports` shares the `≤640px` / `≤320px` rules with `.app-shell--macro` |
| `frontend/src/app/App.test.tsx` | MODIFY | `8a4fbd181d62ac1b6c90b153705cdc0d78b21ffb` | `Reports` sidebar placement assertion + credential-free `/reports` and `/reports/:reportId` deep-link tests (21 tests in file) |

**Allowlist proof:** `git diff --name-only` for the implementation contains exactly these 12 paths. Zero changes to `frontend/server/**` (blobs re-verified: `reports-transport.ts` `775d282b…`, `reports-owner-carrier.ts` `5239d0bf…`, `reports-owner-resolver.ts` `66410e12…`, `executive-transport.ts` `a438eec0…`, `d115-runtime.ts` `d9b546c9…` unchanged), `frontend/package.json` / `frontend/package-lock.json` (`a0061bce…` unchanged), `frontend/vite.config.ts`, `iips-platform/**` (frozen `ReportingEngine.ts` `1149864a…` unchanged), `.github/workflows/ci.yml`, and the IPD repository (**0 writes**, `main` @ `4b5c65a7…`). `R1`, `R2`, `R3`, `F-7` were not modified or reopened; `D115`/`CV-43` remains unwired.

## 2. Binding-Condition Conformance

- **Read-only posture:** browser issues `GET` only (browser-observed `0` POST in B-4; client source constructs no other method; no creation/export/supersession-write controls exist).
- **No recomputation:** payload values rendered verbatim (parsed canonical text for display only; `reportKey` shown as recorded, never re-derived); `null` renders `unavailable`.
- **No client identity:** requests carry only path + `limit`/`cursor`; automated and browser checks verify `0` prohibited fields, `0` `Authorization` headers, `0` cookies; `credentials: 'omit'` on every request.
- **Non-disclosure:** wire partition literals are validated then stripped in `src/api/reports.ts`; view models carry only `ESTABLISHED_SINGLE_OWNER`; DOM assertions (`0` occurrences) pass in automated tests and in every browser phase.
- **Sanitized failures:** closed kind mapping; secrets planted in test doubles (`/secret/…`, `SQLITE_CANTOPEN`) never appear in error messages or DOM; server `detail`/`reason` are discarded.
- **Persistence assessment:** availability governed by `GET /api/reports/artifacts` (B-2 proves `/context` `200` does not mask `/artifacts` `503`).
- **Race safety:** monotonic generation counters in both views; stale-response discard proven by automated test and by code path under rapid version switching.
- **Client persistence:** zero `localStorage`/`sessionStorage`/IndexedDB/cookie use (source-verified).
- **Accessibility/responsive:** semantic landmarks, single `h1` → `h2`, `th scope="col"`, `role="status"`/`role="alert"`, native links/buttons, symbol+label+token badges (`PLATFORM`, `CURRENT HEAD`, `SUPERSEDED` — never `CERTIFIED RESULT`), global `:focus-visible` and `prefers-reduced-motion` untouched and effective.

## 3. Source-Verified Contract Corrections (Documented, Scope Not Expanded)

Two statements in the prepared readiness plan were corrected against the real wire during implementation; both corrections were contained inside the 12-file allowlist with zero backend change:

1. **`canonicalPayload` shape:** the plan (§3.1) described `canonicalPayload` as an object. The accepted backend (`frontend/server/reports/artifact.ts`) carries top-level flat fields (`reportType`, `portfolioId`, `scenario`, `parameters`, `schemaVersion`, …) and `canonicalPayload` as the **canonical JSON string** of the engine payload. The client validates that string, displays its parsed value verbatim, and exposes the original canonical text unmodified in the raw inspector (no re-canonicalization or digest work in the browser).
2. **Supersession direction:** the plan (§3.2) described `GET …/:reportId/supersession` as traceable from any version to the active head. Measured behavior (`store.d.ts`: "chain **ending at** the current version"; verified live in B-4 seeding): from superseded `v1` it returns `{ current: v1, history: [] }`; from head `v2` it returns `{ current: v2, history: [v1] }`. `ReportDetail` therefore resolves lifecycle posture against the governed current-head list (`GET /api/reports/artifacts` returns heads only) and, for a superseded version, selects the listed head whose chain contains it — failing closed (`invalid-envelope`) if no such head exists. No backend defect was repaired and no server file was touched; the discrepancy and this bounded resolution are recorded here as the durable evidence.

## 4. Automated Qualification (Executed; Commands, Exits, Counts)

Executed locally on the implementation tree (`NODE_EXTRA_CA_CERTS` set for the sandbox TLS-interception workaround on `npm ci` only; hosted CI needs no such variable):

| Command | Exit | Result |
|---|---|---|
| `npm run typecheck` | `0` | TypeScript client typecheck clean (includes pre-typecheck broker-import build) |
| `npm run typecheck:replay-server` | `0` | Replay-server import-closure typecheck clean |
| `npx vitest run src/api/reports.test.ts src/features/reports/Reports.test.tsx src/app/App.test.tsx` | `0` | **46 tests passed** (13 client + 12 Reports component + 21 App shell) |
| `npm run test:ci` | `0` | **106 test files / 1,346 tests passed / 0 failed** (baseline 104 files / 1,318 → +2 files / +28 tests) |
| `node .ci/assert-tests.js .vitest-report.json` | `0` | `assert-tests: OK — 106 test file(s), 1346 test(s), 0 failed` |
| `npm run build` | `0` | Production build clean; `dist/assets/index-D7KYElFH.js` 1,609.84 kB (gzip 226.69 kB) |

Hosted GitHub Actions CI (`ci.yml`: `npm ci`, `typecheck`, `typecheck:replay-server`, `test:ci` + guard, `build`) runs on the implementation PR head and on post-merge `main`; run IDs are recorded in the tracker receipt (§16.115).

## 5. Real-Chromium Loopback Qualification (`B-1`–`B-6`)

Executed `2026-10-25` with headless Chromium 153 (Playwright-core + Sparticuz Chromium in an ephemeral `/tmp` tool directory) against the real loopback stack (Vite `127.0.0.1:5173` → executive transport `127.0.0.1:8787`). Carrier (canonical 384 bytes, SHA-256 `b1b78809d1c8d05800b338f73082b4269e6c9fa65b8f35192f4736d6f1a98640` — matching the R1 carrier binding) and SQLite store were materialised under an ephemeral `/tmp/iips-cv51-qual-*` directory outside any Git worktree and **deleted after capture** (`runtimeCleaned: true`; ports released). **Total: 92 browser checks passed, 0 failed** (`browser-results.json`, `browser-transcript.log`).

| Leg | Scenario & Evidence | Result |
|---|---|---|
| `B-1` | Carrier path configured but file missing → sanitized `reports-unavailable-owner` 503 state + `Retry` (`B-1-carrier-absent-503.png`); carrier then materialised in place (resolver is uncached per-request) → **recovery after Retry** to the governed empty state (`B-1-recovered-after-retry.png`) | **PASS** |
| `B-2` | Carrier valid, `IIPS_NP04_DATABASE_PATH` unset → sanitized `reports-unavailable-persistence` state + `Retry` (`B-2-persistence-absent-503.png`); in-page measurement proves `/api/reports/context` = `200` while `/api/reports/artifacts` = `503` | **PASS** |
| `B-3` | Carrier valid + fresh empty store, entered via the sidebar `Reports` link → `200` empty state (`B-3-empty-store.png`) | **PASS** |
| `B-4` | Seeded through the governed backend write path (qualification setup, outside the browser): `v1` `89f528b1-7f02-4127-bf64-9c0707d361dd` → `v2` `957fe9f7-e808-49b1-baad-e8d6155089c9` (`artifactVersion` 1→2, `supersedesReportId` = v1) → head list shows only v2 `CURRENT HEAD` (`B-4-head-list.png`); detail renders all **four disclosure levels in exact DOM order** with recorded `43.5` and `null` → `unavailable` (`B-4-detail-v2-four-levels.png`); v1 shows `SUPERSEDED` + current-head link (`B-4-detail-v1-superseded.png`) and navigation returns to the head; stale-response protection proven in automated tests; browser network log: **0 POST, 0 Authorization, 0 cookies, 0 prohibited query fields, GET-only** (18 `/api/reports` requests observed) | **PASS** |
| `B-5` | Unknown UUIDv4 deep link → indistinguishable `reports-not-found` 404 state + link back to `/reports` (`B-5-unknown-report-404.png`) | **PASS** |
| `B-6` | Keyboard: Tab traversal reaches version links and Enter navigates to superseded v1 (traversal recorded in `browser-results.json`); layouts at **1280px, 640px, 320px** for list and detail: `scrollWidth ≤ innerWidth` everywhere and **0 elements overflowing outside the permitted responsive table wrappers** (`B-6-list-*.png`, `B-6-detail-*.png`) | **PASS** |

Cross-cutting assertions in every phase: **0** partition literals in DOM text, **0** runtime paths, **0** SQL/SQLite strings, **0** unexpected console errors (expected fail-closed `503`/`404` resource logs in B-1/B-2/B-5 are the governed outcome under test and are classified as such in the results), **0** page errors.

## 6. Residual Notes

- At `320px` the read-only definition lists wrap values into a narrow column (letter-wrapped) without any horizontal overflow — readable-by-scroll, matching the shell's proven narrow treatment; no gate threshold is breached.
- Historical qualification counts from earlier passes were not re-labeled; every count above was executed in this pass.

## 7. Statuses After Qualification

| Item | Status |
|---|---|
| **CV-51 implementation authority** | **APPROVED** (exercised within the exact 12-file allowlist) |
| **CV-51 product acceptance** | **PENDING** — separate post-qualification PA acceptance (prepared at [`docs/integration/IIPS_v3.0_REPORTS_NP06_CV51_POST_QUALIFICATION_PA_ACCEPTANCE_RECORD_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_CV51_POST_QUALIFICATION_PA_ACCEPTANCE_RECORD_2026-10-25.md)); `CV-51` is **not** marked accepted or closed |
| **NP-06 backend capability** | **ACCEPTED** for bounded non-production scope (unchanged) |
| **Production admission** | **NOT ADMITTED** |
| **D115 / CV-43** | **UNWIRED** |
| **IPD writes** | **NONE** |

Rollback remains a single-commit `git revert` of the 12 frontend paths; backend and persisted NP-04 data are untouched by this change.
