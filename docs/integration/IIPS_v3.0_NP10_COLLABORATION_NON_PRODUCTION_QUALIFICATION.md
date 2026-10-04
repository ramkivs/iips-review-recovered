# IIPS v3.0 — NP-10 Collaboration Non-Production Qualification Record

## Executed Qualification & Test-Count Reconciliation

**Program:** IIPS Engineering Standards — Program v3.0
**Workstream:** NP-10 — Collaboration
**Record Identifier:** `NP-10-QUAL-01` — Collaboration Non-Production Qualification (executed)
**Document Type:** QUALIFICATION RECORD — non-production qualification, executed and reconciled
**Version:** 1.0 — Qualification Decision
**Date:** 2026-10-04
**Gate:** `GATE-NP10-CONTROLLED-QUALIFICATION-RECONCILIATION-R3`
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Branch:** `arena/01a0f351-iips-review-recovered`
**Status:** **QUALIFIED — NON-PRODUCTION**

> **This record grants QUALIFICATION only.**
> **CERTIFICATION IS NOT GRANTED by this record.** Certification requires a separate certification authority/act and is explicitly outside this gate.
> **ACCEPTANCE IS NOT GRANTED by this record.** Acceptance requires a separate explicit acceptance act and is explicitly outside this gate.
> **Promotion to `main` is NOT authorized by this record** and was not performed.

---

## 1. Qualified Coordinates (exact)

| Coordinate | Value |
| --- | --- |
| **Governance commit** (NP-10-AUTH-01) | `f5a56477ade2d4bf629c7df614c1dd1505901f1f` — 2026-09-30T19:28:28Z |
| **Governance artifact** | `docs/integration/IIPS_v3.0_NP10_COLLABORATION_GOVERNANCE_AND_PERSISTENCE_OWNER_DESIGNATION.md` |
| **Qualified implementation commit** | **`ba8ea1df74b10be5ed46bc12494ec1f651a20235`** — 2026-09-30T19:52:09Z |
| **Governance → implementation ancestry** | `f5a56477…` is the **direct parent** of `ba8ea1df…` (verified by `git rev-parse ba8ea1df…^`) |
| **Qualification baseline (pre-implementation)** | `f5a56477ade2d4bf629c7df614c1dd1505901f1f` — 0 collaboration paths present |
| **Repository / branch under test** | IRR `arena/01a0f351-iips-review-recovered` |
| **Ancestry of the qualified commit** | `ba8ea1df…` is an ancestor of the branch tip (verified by `git merge-base --is-ancestor`) |
| **IPD status** | Read-only reference baseline `4d3e1cdca3a33da0ec3be8b336b17128108a502c` — **0 mutations** |

---

## 2. Test-Count Reconciliation (the R3 principal issue — RESOLVED)

Three figures appeared in prior evidence. **All three are now arithmetically explained and none is erroneous.** They measure three different populations.

| Source / Category | Claimed Count | Reconstructed Count | Exact Cases | Duplicate? | NP-10? | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Dedicated collaboration test files | — | **87** | service 41 + transport 30 + route-integration 4 + UI 12 | No | Yes | executed: `87 passed (87)` |
| **New** test cases introduced by NP-10 | **88** (implementation commit `ba8ea1df…`) | **88** | 87 above **+ 1 new case added to `App.test.tsx`** (`resolves the /collaboration route to the UI10 surface`) | No | Yes | `git show ba8ea1df…` diff count of added `it(`/`test(` lines = 88 |
| Focused qualification suite **as executed** | **94** (qualification report) | **94** | 88 NP-10 cases **+ 6 pre-existing non-NP-10 `App.test.tsx` shell cases** | No | Partially (88 of 94) | executed: `94 passed (94)` |
| R2 static reconstruction | **87** | 87 | 4 dedicated collaboration files only | No | Yes, but **incomplete by 1** | R2 omitted the new `App.test.tsx` case |

### Explanation

1. **`88` is the authoritative NP-10 case count.** The implementation commit `ba8ea1df…` added exactly **88** test cases: 41 service + 30 transport + 4 route-integration + 12 UI + **1** new routing case in `frontend/src/app/App.test.tsx`. The commit message's *"Add 88 tests"* is **correct**.
2. **`94` is the size of the focused suite that was run, not the NP-10 case count.** Because one NP-10 case was added to the pre-existing `App.test.tsx`, running that file pulled in its 6 pre-existing, non-NP-10 shell cases (topbar, `/` redirect, admin hidden, admin shown, unknown-route placeholder, role-visible navigation link). `88 + 6 = 94`. The claim *"94/94 focused tests passing"* is **accurate as a suite result** and is **verified by execution**.
3. **`87` (R2 static) under-counted by 1.** R2 enumerated only the four dedicated collaboration files and omitted the new `App.test.tsx` case. As a count of the dedicated files it is correct; as a count of NP-10 cases it is incomplete.

**No figure was manufactured, and no figure required correction of the implementation.** The discrepancy was a population-definition difference, not an error in the work.

---

## 3. Executed Qualification (Phase C)

**Policy: no static count is substituted for execution. Every figure below is an executed result.**

### Environment

| Item | Value |
| --- | --- |
| Node | `v22.22.3` |
| npm | `10.9.8` |
| Test runner | `vitest 2.1.9` (`linux-x64`, `node-v22.22.3`) |
| TypeScript | `5.9.3` |
| OS | `Linux 6.1.158+ x86_64` |
| Commit under test | `ba8ea1df74b10be5ed46bc12494ec1f651a20235` |
| Executed at | 2026-10-04T05:50Z–05:53Z UTC |

### RUN 1 — NP-10 dedicated collaboration files

```
npx vitest run \
  server/collaboration/collaboration-service.test.ts \
  server/collaboration/collaboration-transport.test.ts \
  server/collaboration/collaboration-route-integration.test.ts \
  src/features/collaboration/Collaboration.test.tsx
```

| Metric | Value |
| --- | --- |
| Test files | **4 passed / 4** |
| Tests discovered | **87** |
| Passed | **87** |
| Failed | **0** |
| Skipped | **0** |
| Excluded | **0** |
| Duration | 4.62s |
| Exit status | **0** |

### RUN 2 — NP-10 focused qualification suite (the reported `94/94`)

```
npx vitest run \
  server/collaboration/collaboration-service.test.ts \
  server/collaboration/collaboration-transport.test.ts \
  server/collaboration/collaboration-route-integration.test.ts \
  src/features/collaboration/Collaboration.test.tsx \
  src/app/App.test.tsx
```

| Metric | Value |
| --- | --- |
| Test files | **5 passed / 5** |
| Tests discovered | **94** |
| Passed | **94** |
| Failed | **0** |
| Skipped | **0** |
| Excluded | **0** |
| Duration | 6.11s |
| Exit status | **0** |

> **The `94/94` claim is CONFIRMED BY EXECUTION.**

---

## 4. Regression Verification (Phase D)

### RUN 3 — Gate-P persistence regression

```
npx vitest run server/persistence/persistence-service.test.ts
```
**21 / 21 passed** — 0 failed, 0 skipped, exit 0. *(Claimed 21/21 — CONFIRMED.)*

### RUN 4 — NP-09 Watchlists regression

```
npx vitest run server/watchlists/ src/features/watchlists/
```
**56 / 56 passed** — 3 files (service 25, transport 21, UI 10), 0 failed, 0 skipped, exit 0. *(Claimed 56/56 — CONFIRMED.)*

### RUN 5 / RUN 6 — Full-suite baseline comparison (`0 new failures`)

| | Baseline `f5a56477…` (pre-NP-10) | Qualified `ba8ea1df…` | Delta |
| --- | --- | --- | --- |
| Command | `npm test` (`vitest run`) | `npm test` (`vitest run`) | — |
| **Passed** | **349** | **437** | **+88** |
| **Failed** | **2** | **2** | **0** |
| **Skipped** | **25** | **25** | **0** |
| Total | 376 | 464 | +88 |
| Test files | 38 (33 pass / 2 fail / 3 skip) | 42 (37 pass / 2 fail / 3 skip) | +4 |
| Duration | 36.28s | 38.23s | — |

*(Claimed `baseline 349/2/25` and `qualified 437/2/25` — both CONFIRMED EXACTLY.)*

**New failures introduced by NP-10: 0.** The delta is `+88 passed`, with failed and skipped counts **identical** before and after — matching the 88 new NP-10 cases exactly.

### The 2 pre-existing failures (NOT NP-10-induced)

Both failures are present **identically at the pre-implementation baseline `f5a56477…`** and are unchanged by NP-10. Neither test touches collaboration.

| Test | Failure | Classification |
| --- | --- | --- |
| `server/product-transport.test.ts` › *Product responses reject taxonomy-resolved categories while permitting all certified engines* | `AssertionError: expected [ 'sector.banking', …(12) ] to include 'sector.telecom'` | **Pre-existing** — present at baseline; product-transport/taxonomy subject, no collaboration path involved |
| `server/pit/pitRuntimeIntegration.test.ts` › *IU5R-13 the company route is still handled by the company handler* | `AssertionError: expected { companyId: 'Banking-H1', …(10) } to have property "error"` | **Pre-existing** — present at baseline; PIT runtime integration subject (IU-5/IU-7 lineage), no collaboration path involved |

Evidence for the classification: both failures appear in the full-suite run at the baseline commit `f5a56477…`, which contains **zero** collaboration source or test files.

---

## 5. Typecheck and Build (Phase E)

| Check | Command | Result | Exit | Notes |
| --- | --- | --- | --- | --- |
| **Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS** | **0** | 0 errors, 0 warnings emitted |
| **Build** | `npm run build` (`tsc -b && vite build`) | **PASS** | **0** | 82 modules transformed; `dist/assets/index-BH8YUx3O.js` 249.40 kB (gzip 71.32 kB); built in 1.71s |

Both were re-executed against the exact qualified commit `ba8ea1df…`. Neither result is asserted from an earlier report.

---

## 6. Qualification Dimensions (Phase D) — verified by executed cases

| Dimension | Verified by (executed cases) |
| --- | --- |
| **Product — private / user-owned** | *"records tenant and owner from the CALLER, never from the payload"*; *"another owner in the same tenant sees nothing"*; *"discloses the private model and the excluded capabilities"* |
| **Product — tenant-scoped boundary** | *"another tenant sees nothing"*; *"two tenants may hold identically titled threads independently"*; *"a different tenant sees no threads"* |
| **Product — governed contract** | *"is exactly company, evidence and watchlist — reports and providers are absent"*; *"assigns a SERVER-GENERATED thread id (never a client-supplied identity)"* |
| **Persistence — Gate-P / durable state** | *"appends only — a prior line is never rewritten by a later operation"*; *"writes the journal version header first (TD-3)"*; *"writes the collaboration journal under its OWN subdirectory with the version header"* |
| **Persistence — restart durability** | *"a thread and its comments survive a fresh service instance"*; *"a deletion survives reconstruction"*; *"replays deterministically — folding twice yields identical state"*; *"survives a restart over HTTP (journal reconstruction)"* |
| **Persistence — fail-closed** | *"fails closed on an unsupported journal version header (TD-3)"*; *"fails closed on a malformed NON-final journal record (never partially applied)"*; *"quarantines a TRUNCATED final line and recovers the valid prefix"*; *"ignores records written by another consumer of the same journal"* |
| **Security — identity boundary** | *"unauthenticated GET is 401"*; *"a token claiming a tenant the user does not belong to is 401"* |
| **Security — authorization fail-closed** | *"a viewer MAY read threads"*; *"a viewer may NOT create a thread (403)"*; *"a viewer may NOT comment or delete (403)"* |
| **Security — tenant isolation** | *"a different tenant sees no threads"*; *"a foreign principal cannot read, comment on or delete another principal thread (404, no disclosure)"* |
| **Security — input fail-closed** | *"rejects an empty or over-long title"*; *"rejects a malformed reference and a reference without an id"*; *"rejects an invalid vintage pin — provenance is never absent"* |
| **Integration — NP-09 Watchlists regression** | **56/56 passed** (RUN 4) |
| **Integration — watchlist citation authority** | *"resolves watchlist citations through the owner-scoped authority only"*; *"cites a watchlist the principal owns, and rejects one they do not"* |
| **Integration — no cross-tenant access** | *"a foreign owner cannot comment on or delete another principal thread"* |
| **Transport — required API paths** | *"dispatches /api/collaboration to the collaboration boundary (never the generic 404)"*; *"dispatches the collaboration sub-routes too"* |
| **Transport — exact namespace** | *"is exact-namespace: /api/collaborationEVIL is NOT dispatched to the collaboration boundary"*; *"an unknown path inside the namespace is 404 (never a silent fallthrough)"* |
| **UI — UI10 surface** | 12 UI cases incl. *"offers ONLY the closed reference set — report is not selectable"*; *"exposes NO mention, assignment, invitation, sharing or ACL control"*; *"fails closed on a malformed envelope rather than showing a fabricated empty list"* |
| **Foundations — protected** | *"does not disturb the adjacent /api/watchlists and /api/company/:id routes"*; full-suite **0 new failures**; Gate-P **21/21** |
| **Foundations — NP-04 / IU-7 / IU-8** | `persistence-service.ts`, `frontend/server/pit/`, certified engines and the reference portfolio are unmodified by `ba8ea1df…` (per the commit's own change set: 14 files, all collaboration or registration) |

---

## 7. Known Limitations

1. **Restart durability is in-process / journal-reconstruction scope.** The verified evidence proves deterministic journal reconstruction across independent service instances over persisted filesystem storage. **Deployment-tier, out-of-process OS daemon / container lifecycle restart verification is NOT established by this qualification** and is retained as a future operational verification item.
2. **Identity is non-production.** Identity derives through the established non-production `SecuredExecutor` test/development mapping. Production Keycloak/OIDC realm activation, certificate provisioning and external IdP cutover are outside this gate's authority.
3. **The browser→transport credential-path / G3 gap remains OPEN.** Consistent with the NP-09 and NP-11 precedents, server-derived `(tenantId, userId)` scoping through the existing authenticated-principal boundary is the accepted non-production access-control mechanism. This record does not remediate, close, or claim G3.
4. **Two pre-existing full-suite failures remain open** (`product-transport` taxonomy, `pitRuntimeIntegration` IU5R-13). They are not NP-10-induced, are unchanged by NP-10, and are **not** closed by this record.
5. **No out-of-process authenticated HTTP restart qualification, no concurrency/load qualification, and no live Keycloak/OIDC qualification** is claimed or implied.

## 8. Explicit Exclusions (authoritative set, from NP-10-AUTH-01 §5)

* Zero implementation in IPD.
* Zero production Keycloak/OIDC mutations.
* Zero live market-data or broker connections.
* Zero `@mentions`, assignments, roster sync, ACLs, invitations, or workspace membership.
* Zero references to unpromoted Reports or raw provider quotes (enforced: CLOSED reference set `company | evidence | watchlist`, everything else fails closed with HTTP 404).
* No production certification.
* No production readiness.
* No concurrency/load qualification.
* No live Keycloak/OIDC.
* No out-of-process authenticated HTTP restart qualification.

## 9. Non-Production Scope Statement

This qualification is bounded to **non-production**. It establishes that the NP-10 Collaboration implementation at commit `ba8ea1df74b10be5ed46bc12494ec1f651a20235` satisfies its non-production qualification contract as executed and recorded above.

> **Qualification ≠ Certification.** No certification is granted by this record.
> **Qualification ≠ Acceptance.** No acceptance is granted by this record.
> **Qualification ≠ Promotion to `main`.** No promotion authority was established and none was exercised.

IPD remains unmutated at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`.

---

## 10. Qualification Decision

All qualification criteria were re-established from current repository evidence and verified by **actual execution** — not asserted from a prior report, not reconstructed statically, and not inferred.

> ## **NP-10 COLLABORATION — NON-PRODUCTION QUALIFIED**

**Decided on the basis of:** governance ancestry verified (`f5a56477…` → `ba8ea1df…`); focused suite **94/94 passed**; **88** NP-10 cases; Gate-P regression **21/21**; NP-09 regression **56/56**; full-suite **349/2/25 → 437/2/25** with **0 new failures**; typecheck **PASS (exit 0)**; build **PASS (exit 0)**; all seven qualification dimensions covered by executed cases.

---

*Recorded under `GATE-NP10-CONTROLLED-QUALIFICATION-RECONCILIATION-R3`. This record grants qualification only. It creates no certification, no acceptance, and no promotion.*
