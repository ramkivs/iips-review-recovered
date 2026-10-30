# IIPS v3.0 — NP-06 Reports: F-7 Separate-Process Durable HTTP Qualification and Capability Acceptance Record

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-F7-QUALIFICATION-AND-ACCEPTANCE-2026-10-25-01` |
| **Record type** | **QUALIFICATION AND CAPABILITY ACCEPTANCE RECORD.** |
| **Authority** | Program Authority (PA) — Ramki |
| **Date** | `2026-10-25` (Asia/Calcutta) |
| **Governing acts** | `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01`; `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01`; `IIPS-V3-REPORTS-NP06-R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01`; `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` |
| **Scope** | Bounded non-production NP-06 Reports capability qualification and backend acceptance. |
| **F-7 Status** | **SATISFIED** (all five qualification legs proven across separate operating system processes). |
| **Capability Acceptance** | **ACCEPTED (Bounded Non-Production Scope Only)**. |
| **CV-51 Status** | **WITHHELD / BLOCKED** (No UI, routes, navigation, or client exposure authorized). |
| **Production Admission** | **NOT ADMITTED / NOT PRODUCTION-READY**. |

---

## 1. Five-Leg F-7 Qualification Evidence

Qualification executed via `server/reports-restart.test.ts` driving `server/reports-restart-harness.ts` across independent OS processes against the real composed HTTP server (`executive-transport.ts`), real carrier resolver (`IIPS_REPORTS_OWNER_PATH`), and real SQLite NP-04 persistence (`IIPS_NP04_DATABASE_PATH`):

| Leg | Qualification Bar | Executed Process Evidence | Verdict |
|---|---|---|---|
| **1. Positive Leg** | Valid server-owned carrier and persistence foundation allow governed operations over HTTP without caller credentials. | Process A (`pid` distinct) persists report via `POST /api/reports/artifacts` -> `201 Created` (`reportId: 64-char store-assigned UUID`), `artifactVersion: 1`, `ownership: { tenantId: 'irr-reports-personal', userId: 'owner-irr-reports-personal' }`. Context endpoint returns `200 OK`. | **PROVEN** |
| **2. Negative Leg** | Cross-owner queries return 404 without existence disclosure. Client-supplied identity/tenant claims rejected. | Query parameter `?tenantId=...` -> `400 Bad Request`. Request body with `tenantId` / `userId` / `reportId` -> `400 Bad Request`. Unknown `reportId` -> `404 Not Found`. | **PROVEN** |
| **3. Failure-Mode Leg** | Missing, unreadable, or digest-mismatched carrier fails closed with HTTP 503. Missing database returns 503 persistence-unavailable. | Process with unconfigured carrier returns `503 owner-context-unavailable`. Process with tampered carrier returns `503 owner-context-unavailable`. Process with unset db path returns `503 persistence-unavailable`. | **PROVEN** |
| **4. Restart Durability Leg** | Persisted state survives complete OS process termination and is retrievable/mutable by fresh processes at same server-owned path. | Process A writes artifact -> terminates. Process B (fresh PID) retrieves exact artifact via `GET /api/reports/artifacts/:id` (`200 OK`) and appends version 2 via `POST /.../versions` (`201 Created`, `supersedesReportId: id`, `artifactVersion: 2`) -> terminates. Process C (third fresh PID) retrieves full single-parent supersession chain (`200 OK`). | **PROVEN** |
| **5. Non-Equivalence Leg** | No client-supplied identity is accepted, roles are retired, and no authentication credential is inferred. | Transport applies single declared owner partition (`P-1`); rejects ambient auth tokens; enforces server-constant namespace `reports.*`. | **PROVEN** |

---

## 2. Capability Acceptance Assessment

| Prerequisite / Gate | Required Standard | Status |
|---|---|---|
| **R1 Ownership Source** | Authoritative dated PA act with non-auth literals and carrier specification | **EFFECTIVE** (`IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01`) |
| **R2 Contract Shape** | Authoritative dated PA act with P-1, A-2, C-2, C-4, C-5, and §5.4 replacements | **EFFECTIVE** (`IIPS-V3-REPORTS-NP06-R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01`) |
| **R3 Persistence Binding** | Admitted dependency specifier to NP-04 store | **EFFECTIVE & INTEGRATED** (`IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01`) |
| **Transport Implementation** | Authorized non-auth HTTP transport implemented and verified | **COMPLETED & TESTED** (`frontend/server/reports-transport.ts`) |
| **F-7 Durable HTTP Qualification** | Real composed server tested across separate OS processes (all 5 legs) | **SATISFIED** (18/18 tests passed across 5 test suites) |
| **Capability Acceptance Verdict** | NP-06 Reports backend capability accepted for bounded non-production scope | **ACCEPTED (Non-Production)** |

---

## 3. Explicit Boundaries and Mandatory Safeguards

1. **`CV-51` Withheld:**
   - Client-facing Reports routes, navigation links, and UI remain **unauthorized and unexposed**.
   - No route added to client routing table (`AppShell`, `routes.ts`, `navigation.ts`).
   - Any client exposure requires a separate, dedicated `CV-51` decision act following capability acceptance.

2. **Production Admission Withheld:**
   - Reports is **not admitted to production**.
   - Lineage `2e11fa3b…` divergence remains a known non-production isolation boundary pending eventual `R3-Option C` convergence.

3. **`D115`/`CV-43` Unwired:**
   - 0 non-test importers of company identity runtime.

*Program Authority: Ramki. **Status: F-7 SATISFIED. Capability ACCEPTED for bounded non-production backend scope. CV-51 and Production Admission WITHHELD.***

---

## 4. Dated addendum (`2026-10-30`) — `C4-2` clarification: leg 2 and leg 5 restated; verdicts and status preserved

> **Dated addendum — additive; §§1–3 above are preserved unaltered; amends no verdict; changes no status; grants no authority beyond that recorded.** Recorded under `IIPS-V3-REPORTS-NP06-C4-2-HEADER-CLAIM-CLARIFICATION-PA-ACT-2026-10-30-01` (**`C4-2`, SELECTED — EFFECTIVE**), tracker `§16.215` (`CV-CORR-195`; `CHG-2026-10-30-10`). Its purpose is to remove the two assertions in §1 that **contradict the now-clarified contract** and to record newly executed evidence — **not** to re-open the qualification, re-run history, or move any status.

### 4.1 Why an addendum, and what it is not

`§1` leg 5 recorded that the transport "**rejects ambient auth tokens**", and leg 2 recorded that "**client-supplied identity/tenant claims rejected**" without distinguishing channels. Under `C4-2` (effective `2026-10-30`) the operative contract is that header-borne claims are **ignored**, cannot be authoritative, and **do not prevent the request from proceeding**. Leaving the §1 wording in place would preserve a **qualification assertion that contradicts the effective contract** — which this program does not permit. The original text is therefore **preserved verbatim** and the corrected reading is recorded here.

This addendum does **not**: revoke the historical qualification; re-issue the five verdicts; change `SATISFIED`; change capability acceptance; change production admission; or create a new qualification leg.

### 4.2 Leg 2 — clarification

**As recorded (`§1`, preserved):** bar — "Cross-owner queries return 404 without existence disclosure. Client-supplied identity/tenant claims rejected."; evidence — query `?tenantId=…` → `400`; body with `tenantId`/`userId`/`reportId` → `400`; unknown `reportId` → `404`; verdict **`PROVEN`**.

**Corrected reading (operative from `2026-10-30`):**

- The leg's recorded evidence covers the **query-parameter** and **request-body** channels. Both remain operative, unchanged, and `400` — verified again in this pass (§4.5).
- The leg's phrase "claims rejected" is **scoped to those two channels**. It does **not** assert, and must not be read as asserting, a `400` for claims arriving in **request headers**. Under `C4-2`, header-borne claims are **ignored** and are **not** an accepted identity or ownership input; a request carrying them **may proceed**.
- The **cross-owner `404` without existence disclosure** requirement is unaffected and remains proven.
- **Verdict `PROVEN` stands, on the scoped reading.** The bar it was assessed against (query/body rejection plus non-disclosing `404`) is met by executed evidence; the header channel was never part of the evidence it cites, and the contract no longer requires a refusal there.

### 4.3 Leg 5 — clarification

**As recorded (`§1`, preserved):** bar — "No client-supplied identity is accepted, roles are retired, and no authentication credential is inferred."; evidence — "Transport applies single declared owner partition (`P-1`); **rejects ambient auth tokens**; enforces server-constant namespace `reports.*`."; verdict **`PROVEN`**.

**Corrected reading (operative from `2026-10-30`):**

- **"Rejects ambient auth tokens" is superseded as wording.** The transport does not *reject* a credential — it **never reads** one. The accurate statement is: *ambient `Authorization` credentials are not read, cannot establish or change application identity, tenant or ownership, and are not inferred to exist* (`C-2`, and `C4-2` determination 3).
- **"No client-supplied identity is accepted"** — accurate and now precise: not accepted *as an input on any channel* (query, body, header), and on the header channel specifically the claim is **ignored** (`C4-2` determinations 4–5).
- **"Roles are retired"** — unchanged (`C-3`), evidenced by the absence of any role, principal or RBAC reference on the Reports path.
- **"Server-constant namespace `reports.*`"** — unchanged (`C-6`), evidenced by the fixed route table and prefix dispatch.
- **Verdict `PROVEN` stands, on the corrected reading.** Every element of the bar is met: no client-supplied identity is accepted (now evidenced on the header channel too, as non-effect); roles are retired; no credential is inferred or read.

### 4.4 The five verdicts and the statuses

| # | Item | Disposition |
|---|---|---|
| 1 | Legs 1, 3, 4 verdicts (`PROVEN`) | **Unchanged.** No clause of this addendum touches them. |
| 2 | Leg 2 verdict (`PROVEN`) | **Unchanged**, on the scoped reading (§4.2). |
| 3 | Leg 5 verdict (`PROVEN`) | **Unchanged**, on the corrected reading (§4.3). |
| 4 | F-7 qualification status | **`SATISFIED` — unchanged.** Every leg's bar is met under the clarified contract; two legs required correction of their *description*, not of their *outcome*. |
| 5 | Capability acceptance | **`ACCEPTED (bounded non-production)` — unchanged.** Expressly preserved by the `C4-2` act §7 and not changed here. |
| 6 | Production admission | **`NOT ADMITTED` — unchanged.** The `C4-2` clarification is a private, single-user, local-deployment clarification; it grants no production authority (§4 of the act). |

**Historical evidence is distinguished from newly established evidence.** The `2026-10-25` execution and the `2026-10-29` revalidation (§1's evidence) remain historical records of what was run then, against the contract as it then read. The evidence in §4.5 is **new**, executed `2026-10-30` against the clarified contract, and is recorded as such. Neither is presented as the other.

### 4.5 Newly executed evidence (`2026-10-30`, at IRR `main` `9b54dbd0…`)

Added to `frontend/server/reports-transport.test.ts` under `C4-2`, and executed with the full Reports scope:

| Requirement | Test |
|---|---|
| Ambient `Authorization` cannot establish or change identity | "`C4-2` — ambient credentials and header claims are not identity inputs" |
| Header identity claims cannot change the personal application principal | same test |
| Header tenant claims cannot change ownership or tenant context | same test |
| Ownership always comes from the server-established principal | same test (create + read with hostile headers) |
| A valid request may proceed and persist an artifact under that principal | same test (`201`, artifact retrievable) |
| Query/body rejection remains correct | pre-existing "rejects client claims" test, plus re-assertion in the new test |
| `reports.*` namespace and route/method discipline remain correct | pre-existing tests, re-run |

**No test asserts `400` for a header claim.** Exact commands, counts, commit and tree are recorded at tracker `§16.215.5`; results are reported there and in the pass completion report, and are not restated as history.

*End of the `2026-10-30` addendum. Leg 2 and leg 5 restated on the clarified contract; five verdicts and all three statuses unchanged; new evidence recorded separately from historical evidence.*
