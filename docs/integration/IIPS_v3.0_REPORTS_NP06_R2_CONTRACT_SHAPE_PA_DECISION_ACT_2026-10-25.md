# IIPS v3.0 — NP-06 Reports R2 (D-2): Contract-Shape Program Authority Decision Act

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01` |
| **Record type** | **PROGRAM AUTHORITY DECISION ACT — OPERATIVE UPON PUBLICATION.** |
| **Authority** | Program Authority (PA) — Ramki |
| **Decision date** | `2026-10-25` (Asia/Calcutta) — PA explicit approval of 2026-10-25 ("NP-06 REPORTS — PA APPROVAL AND ONE-PASS EXECUTION") |
| **Decisions rendered** | `D-2` (`R2` Reports owner-binding contract shape), resolving `C-2`, `C-3` (`P-1`), `C-4`, `C-7` (`A-2`), and §5.4 rows 1–3 replacements |
| **Prerequisites satisfied** | `R1` effective (`IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01`); `R3` effective (`IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01`) |
| **Effectiveness** | **EFFECTIVE.** Operative as an authoritative instrument upon publication to `refs/heads/main` and independent remote read-back. Supersedes NP-06 `R2`/`C4`'s authenticated-principal precondition and §5.4 rows 1–3 for the non-auth baseline. |
| **Authorizes** | Implementation of the non-authentication Reports transport in `frontend/server/reports-transport.ts` and associated unit/route/integration tests. |
| **Preserved** | F-5 fail-closed discipline; HTTP 503 fence on invalid context; `D115`/`CV-43` unwired; primary and broker pins. |

---

## 1. Approved Contract Elements (`C-2` through `C-8`)

1. **`C-2` — Boundary Failure & Replacement for `401`:**
   - On the current no-authentication baseline, no caller credential exists.
   - The historical `401 Unauthorized` response is retired.
   - When the server-owned owner carrier cannot be resolved (absent, unreadable, invalid, or digest mismatch), the transport answers **`503 owner-context-unavailable`** (`F-5`).

2. **`C-3` — Authorization Predicate (Option `P-1` Approved):**
   - For the bounded non-production single-owner baseline, the server-owned declaration `(irr-reports-personal, owner-irr-reports-personal)` identifies the partition under which all five governed operations execute (`context`, `create`, `read`, `appendVersion`, `supersession`).
   - No separate role-based authorization step is performed. The historical `viewer`/`analyst`/`admin` role gate is **retired by express PA decision**.
   - The declaration carries partition semantics only and does not authenticate the caller. The contract is not described as authentication or privilege enforcement.

3. **`C-4` — Client Tenant/Identity Claims Disposition:**
   - Any client-supplied tenant or identity claim in request headers, URL query parameters, or request bodies (`tenantId`, `userId`, `owner`, `ownerUserId`, `authenticatedUser`, `principal`) is **refused with `400 Bad Request`** (`{ error: 'client-supplied tenant or identity claims are prohibited' }`).
   - The historical foreign-tenant `403` status is retired because no tenant authority exists for a claim to be foreign to.

4. **`C-5` — Durable Identity & Injection Refusal:**
   - Client-supplied durable identity fields in creation or append payloads (`reportId`, `artifactVersion`, `supersedesReportId`, `reportKey`, `schemaVersion`) are **refused with `400 Bad Request`**. Durable identity is store-minted only.
   - Any attempt to supply `companyId` or `runtimeCompanyId` is refused with `400 Bad Request` (`CV-43` un-wired).

5. **`C-6` — Server-Side Resource Namespace Allowlist:**
   - The authorized resource namespace is strictly server-constant `reports.*` (never client-derived).

6. **`C-7` — Audit Disposition (Option `A-2` Approved):**
   - The retired executor's request-time deny/allow audit requirement (NP-06 §5.4 audit sentence) is **explicitly deferred by PA act** for this bounded non-production baseline.
   - Audit trail is preserved through durable governance decision records, carrier establishment/change/revocation records, and automated test/failure evidence.
   - Request-time auditing is not claimed to exist. Any future requirement for request-time audit must be explicitly governed before final production acceptance.

7. **`C-8` — Persistence Failure Mapping:**
   - When NP-04 persistence is unavailable or database operations fail, the transport returns **`503 persistence-unavailable`** (distinct from `owner-context-unavailable`).

8. **Route & Method Discipline:**
   - Unknown paths return `404 Not Found` (`{ error: 'not found' }`).
   - Disallowed HTTP methods return `405 Method Not Allowed` with explicit `Allow` header (`{ error: 'method-not-allowed' }`).

---

## 2. Supersession of NP-06 §5.4 Rows 1–3

The historical test expectations from NP-06 §5.4 are superseded by the following approved replacements:

| # | Historical Expectation | Approved Non-Authentication Replacement | Disposition |
|---|---|---|---|
| **1** | unauthenticated → `401` | Missing / invalid owner carrier → **`503 owner-context-unavailable`** (`C-2`). | **RETIRED & REPLACED** |
| **2** | authenticated principal → authorized | Server-owned owner resolved from declared source → authorized for all 5 operations (`P-1`). | **RE-EXPRESSED** |
| **3** | foreign tenant → `403` | Client-supplied tenant / identity claim → **`400 Bad Request`** (`C-4`). | **RETIRED & REPLACED** |

Rows 4 through 15 of NP-06 §5.4 remain active and are validated against the new transport and persistence integration:
- Row 4: Client ownership in body → `400 Bad Request`.
- Row 5: Valid report creation → `201 Created` with store-minted `reportId`.
- Row 6: Same canonical input → identical `reportKey`, distinct `reportId`.
- Row 7: Valid version append → `201 Created` with incremented `artifactVersion`.
- Row 8: Supersession chain is strictly single-parent.
- Row 9: Mutation of published artifact / already superseded → `409 Conflict`.
- Row 10: Cross-owner retrieval / foreign owner query → `404 Not Found` without disclosure.
- Row 11: Process restart → persisted state survives on same valid carrier (`F-7`).
- Row 12: Failed transaction → no partial artifact persisted.

---

## 3. Scope and Non-Claims

This act renders `R2` effective and authorizes transport implementation. It does **not**:
- Introduce routes, navigation entries, or UI exposure.
- Wire `D115`/`CV-43`.
- Grant capability acceptance, `CV-51` closure, or production admission.

*Program Authority: Ramki. **Status: EFFECTIVE. `R2` RENDERED & BOUND.***

---

## 4. Dated addendum (`2026-10-30`) — `C-4` request-header limb clarified by `C4-2`

> **Dated addendum — additive; §§1–3 above are preserved unaltered.** This act's `C-4` text is **not rewritten**; its **request-header limb** is disposed of by the later effective instrument `IIPS-V3-REPORTS-NP06-C4-2-HEADER-CLAIM-CLARIFICATION-PA-ACT-2026-10-30-01` (**`C4-2`, SELECTED — EFFECTIVE**), recorded at tracker `§16.215` (`CV-CORR-195`; `CHG-2026-10-30-10`).

**What `C4-2` determined, as it bears on this act.**

1. Client-supplied identity or tenant claims supplied **in request headers** are **not accepted as identity or ownership inputs**; they are **ignored** and cannot establish or alter identity, tenant, owner context or authorization.
2. Such a request **may proceed**, and a valid operation **may succeed and persist an artifact**, under the single server-established personal application principal.
3. The historical requirement in `C-4` to answer header-borne claims with **`400 Bad Request`** is **superseded as to that channel**. `C-4`'s **URL query parameter** and **request body** limbs remain **operative and unchanged**, including the `400` and the body `{"error":"client-supplied tenant or identity claims are prohibited"}`.
4. The `C-4` prohibition itself is **not relaxed**: no client-supplied claim may ever be authoritative, on any channel.
5. `C-2`, `C-3`, `C-6`, `C-7`/`A-2` and `C-8` are **unchanged**.

**Operative reading of `C-4` from `2026-10-30`:**

> Any client-supplied tenant or identity claim in **URL query parameters or request bodies** (`tenantId`, `userId`, `owner`, `ownerUserId`, `authenticatedUser`, `principal`) is refused with `400 Bad Request`. A claim supplied **in request headers** is not an accepted identity or ownership input: it is ignored, cannot establish or alter identity, tenant, owner context or authorization, and does not prevent the request from proceeding under the single server-established personal application principal.

**Why the clarification was needed.** The `2026-10-30` investigation (tracker `§16.213`) established that no version of `frontend/server/reports-transport.ts` ever refused a header-borne claim: the transport has always read `req.url`, `req.method` and the body only. The PA therefore clarified the contract to match the intended private, single-user, locally hosted operating model rather than adding multi-user rejection behaviour the application does not need. No implementation change resulted; targeted non-effect tests were added.

**Boundaries.** This addendum grants nothing beyond §4 of the `C4-2` act: no multi-user access, no public internet exposure, no remote tenant selection, no client-controlled identity or ownership, no authentication via bearer tokens, no production deployment, no relaxation of any unrelated control. **IPD's consumer clause `C7` ("caller-supplied authority is refused, not ignored") is untouched** — it governs the IPD same-host IPC endpoint, not this Reports HTTP surface.

**Status.** `R2` remains **`EFFECTIVE`**; this act remains **`RENDERED & BOUND`**, with `C-4`'s header limb disposed of as above.

*End of the `2026-10-30` addendum. `C4-2` effective; `C-4` header limb clarified; query/body limbs, `C-2`, `C-3`, `C-6`, `C-8` unchanged; no status moved.*
