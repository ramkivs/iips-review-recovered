# IIPS v3.0 — NP-06 Reports: `R2` `C-4` Request-Header Claim Disposition — Program Authority Clarification Act (`C4-2`)

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-C4-2-HEADER-CLAIM-CLARIFICATION-PA-ACT-2026-10-30-01` |
| **Record type** | **PROGRAM AUTHORITY DECISION ACT — EFFECTIVE UPON PUBLICATION AND REMOTE READ-BACK.** An authoritative clarification of an effective act. |
| **Authority** | Program Authority (PA) — Ramki. The ruling below is the PA's own explicit selection, rendered `2026-10-30`. |
| **Decision** | **`C4-2` — EXPLICIT AUTHORITATIVE CLARIFICATION OF `R2` `C-4`'s REQUEST-HEADER LIMB. SELECTED AND EFFECTIVE.** |
| **Ruling basis (PA's stated rationale)** | The actual intended IIPS deployment architecture: a private personal application, single intended user, locally hosted on the user's laptop, personal application principal owned by the application owner, with no multi-user identity or tenant-selection model intended. IIPS is to be engineered for that operating model rather than acquiring multi-user rejection behaviour it does not need. |
| **Amends** | `IIPS-V3-REPORTS-NP06-R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01` — **`C-4`'s request-header limb only**, in the terms of §2 below. The original act's text is **preserved unamended**; this act is the operative disposition of that limb. |
| **Preserves (unchanged)** | `C-2` (no caller credential exists; `401` retired), `C-3` (`P-1` partition; role gate retired), `C-4`'s **query-parameter and request-body** limbs, `C-6` (server-constant `reports.*`), `C-7`/`A-2` (request-time audit deferred), `C-8` (`503 persistence-unavailable`), route/method discipline; `R1`, `R3`; the three IPD pins; `REG-11` Option C; `CV-21`/`DQ-7a` A2. |
| **Effectiveness basis** | Published to `refs/heads/main` of `ramkivs/iips-review-recovered` and independently read back. Recorded in tracker `§16.215` (`CV-CORR-195`; `CHG-2026-10-30-10`). |
| **Baseline** | IRR `main` `9b54dbd0faa52bd0dd41085430d5ddde01257f27`, tree `379b0943652d6366fcfd128856ebf61f75fa58e2`; IPD `main` `aa356ec222527e78462740fb6c91d34b9ff6cbbc`, tree `79a9fb6cc4b05b748a402cb604cd3f03419a1d45` (**read-only; zero writes**). |
| **Mutation scope** | IRR documentation, IRR test evidence. **No implementation change** (§6.1). No IPD write. No pin, manifest or lockfile change. |

> **The ruling, in one sentence.** For this private, single-user, locally hosted application there is exactly **one server-established personal application principal**; that principal is the **sole** authority for Reports ownership context; ambient credentials and client-supplied identity or tenant claims **cannot** establish, authenticate or change anything; such header claims are **ignored** and the request **may proceed** and persist an artifact under the declared principal; **no `400` is required for header-borne claims**; query and body rejection and the server-constant namespace are **unchanged**.

---

## 1. The ruling

**`C4-2` is SELECTED.** The `R2` question put at `IIPS-V3-REPORTS-NP06-C4-HEADER-CLAIM-PA-DECISION-REQUEST-2026-10-30-01` — *is `C-4`'s request-header limb operative as written, requiring client-supplied identity and tenant claims in request headers to be refused with HTTP `400 Bad Request`?* — is answered: **no, not as a refusal requirement.** The operative contract is clarified in §2.

**`C4-1` is NOT selected and is closed as unselected.** No header-claim refusal is required or authorised, and no test asserting `400` for header claims may be added for this contract.

The PA's rationale is recorded because it governs interpretation of every clause below: the application is **private**, **single-user**, **locally hosted on the user's laptop**, has a **personal application principal owned by the application owner**, and intends **no multi-user identity or tenant-selection model**. Multi-user rejection semantics are therefore not part of this contract.

## 2. The authoritative clarification (the ten operative determinations)

Each determination is binding and operative from effectiveness.

1. **One personal application principal.** The application has **one server-established personal application principal** (`tenantId` `irr-reports-personal`, `ownerUserId` `owner-irr-reports-personal`), resolved per request from the server-owned carrier (`IIPS_REPORTS_OWNER_PATH`). It is not created, selected, joined, switched or named by any caller.
2. **Sole authority.** That server-owned principal is the **sole authority** for Reports ownership context. No other input of any kind is an ownership source.
3. **Credentials.** Ambient `Authorization` credentials (any scheme, any value) **do not establish, authenticate or change application identity**. They are not read for identity, tenant, ownership or authorization purposes, and no credential is inferred to exist (`C-2`).
4. **Header claims are not inputs.** Client-supplied identity or tenant claims in **request headers** are **not accepted as identity or ownership inputs**. This is a prohibition on *acceptance*, not a requirement of a refusal response.
5. **Header claims are ignored.** Such header claims **are ignored**, and **cannot establish or alter** identity, tenant, owner context or authorization. Ignoring is the specified and conformant disposition.
6. **The request may proceed.** A request carrying such a header claim **may proceed**, and is served under the declared server-owned personal application principal exactly as if the header had not been sent.
7. **Artifacts may be created.** A valid Reports operation carrying such a header claim **may succeed and persist an artifact** under that principal, with store-minted durable identity as normal.
8. **The `400` requirement for header-borne claims is superseded.** `C-4`'s historical requirement to answer header-borne claims with `HTTP 400 Bad Request` is **superseded as to that channel** by this dated act. `C-4`'s **query-parameter** and **request-body** limbs remain operative and unchanged, including the `400` and its established body `{"error":"client-supplied tenant or identity claims are prohibited"}`. **The prohibition itself is not relaxed:** a claim still may never be authoritative (determinations 4–5), which is the substantive guarantee the clause exists to secure.
9. **Query and body unchanged.** Existing query-parameter and request-body rejection behaviour remains **unchanged**, absent a separate authoritative reason to amend it. No such reason was established by the `2026-10-30` investigation.
10. **Namespace unchanged.** The server-constant `reports.*` namespace (`C-6`), realised as the fixed route table plus the `/api/reports` path prefix, remains **unchanged**.

## 3. Relationship to the effective `R2` clauses

| Clause | Effect of this act |
|---|---|
| `C-2` — no caller credential exists; `401` retired | **Unchanged.** Reinforced by determination 3. |
| `C-3` — `P-1` partition; role gate retired; declaration "does not authenticate the caller" | **Unchanged.** Determination 1 gives that partition its positive description: one personal application principal. |
| `C-4` — claims in headers, query, bodies refused `400` | **Header limb clarified** (determinations 4–8). **Query and body limbs unchanged** (determination 9). |
| `C-6` — namespace strictly server-constant `reports.*` | **Unchanged** (determination 10). |
| `C-7`/`A-2`, `C-8`, route/method discipline | **Unchanged.** |

`C-4` as it now reads operatively, stated in the clause's own idiom:

> Any client-supplied tenant or identity claim in **URL query parameters or request bodies** (`tenantId`, `userId`, `owner`, `ownerUserId`, `authenticatedUser`, `principal`) is refused with `400 Bad Request`. A claim supplied **in request headers** is **not an accepted identity or ownership input**: it is ignored, cannot establish or alter identity, tenant, owner context or authorization, and does not prevent the request from proceeding under the single server-established personal application principal.

## 4. Boundaries — what this act does **not** authorise

The clarification holds only within the deployment model recorded in §5. It is **not** authority for, and must not be cited as evidence of, any of the following:

- **Multi-user access** — no second user, second principal, second tenant, delegation model or user-switching.
- **Public internet exposure** — no internet-facing deployment, port forwarding, reverse proxy publication or remote access.
- **Remote tenant selection** or any client-selected tenant or owner.
- **Client-controlled identity** or **client-controlled ownership**, by any channel, including headers, cookies, query, body or path.
- **Authentication through arbitrary bearer tokens** — the header is not read; it is not an auth path, and this act creates none.
- **A production deployment** — production remains `NOT ADMITTED`.
- **Relaxation of unrelated security controls** — no change to the owner-carrier fail-closed discipline, the `503` fences, CORS posture, loopback binding, the query/body refusals, the namespace allowlist, or any IPD boundary.

**Explicit non-effect across the repository boundary.** IPD's consumer contract clause **C7** ("caller-supplied authority is refused, not ignored") governs the **IPD-owned same-host IPC endpoint**, not the IRR Reports HTTP surface. Nothing here amends `C7`, the IPC contract or any IPD record. The two boundaries are distinct and must not be conflated in either direction: **IPD refuses; IRR Reports ignores.** (`IIPS_v3.0_G2_IRR_DP1_IDENTITY_CREDENTIAL_TRUST_AMENDMENT_2026-10-16.md` §4, blob `b21a8a88…`, records the IPD-side clause.)

## 5. Verified deployment assumptions, and the precise gaps

The PA's rationale names a deployment model. Its documentary and source basis was verified rather than assumed.

| Assumption | Status | Evidence |
|---|---|---|
| Private personal application, single intended user, one personal laptop, one OS account, non-production | **Documented and effective** | `IIPS_V3_CAP02_PA_TOPOLOGY_AND_OWNERSHIP_DECISION_EFFECTIVE_2026-10-23` (blob `48bc8375…`): "single owner/user of the single-user personal-use IIPS platform"; `IIPS_v3.0_G2_IRR_DP1_IDENTITY_CREDENTIAL_TRUST_AMENDMENT_2026-10-16` §4 (blob `b21a8a88…`): "one operator, one personal laptop, one OS account, non-production"; `IIPS_v3.0_G2_IRR_GATE_B_BASELINE_AND_REF_AUTHORITY_ACT_2026-10-16` (blob `3cb5fa39…`): "NON_PRODUCTION — one user, one personal laptop" |
| Single server-owned personal application principal | **Documented and effective** | `R1` act (blob `c4fdc26b…`) elements 8, 10, 13: exactly one declared Reports tenant with "no guessing, ambient fallback, or client-selected tenant"; ownership "confer[s] no roles, permissions, or privilege escalation"; "No credential, authenticated principal, or client-supplied identity is authoritative" |
| Application host is **not** network-exposed | **Partially evidenced — implementation yes, host hardening not documented** | **Evidenced:** `frontend/server/executive-transport.ts:717` `EXEC_TRANSPORT_BIND_HOST = '127.0.0.1'`, applied at `:1011` `server.listen(port, EXEC_TRANSPORT_BIND_HOST, …)`; the dev server binds `127.0.0.1` with `allowedHosts: ['localhost', '127.0.0.1']` (`frontend/vite.config.ts:13–14`). **Not evidenced:** firewall rules, OS host-hardening, absence of port forwarding, or any operator-side network control — **no record in either repository documents these.** |

**Recorded gap (not silently filled).** The program has **no authoritative record** establishing operator-side network controls (firewall configuration, port-forwarding absence, OS account hardening beyond "one OS account"). This act therefore does **not** claim they exist and does **not** create a new requirement for them by assumption. It records the gap as follows:

> **`G-14` (recorded, not actioned):** the private-local deployment model is documented at the topology/ownership level and the application's own listeners are loopback-bound in source, but operator-side network hardening is unevidenced. Any future claim that the deployment is *isolated*, or any move toward broader exposure, requires a separate authoritative act with its own evidence. Nothing in this clarification depends on, asserts, or substitutes for that evidence.

This gap does not obstruct the ruling: `C4-2` turns on *who may be an identity input*, not on network reachability, and the guarantee it preserves (a claim can never be authoritative) holds irrespective of network posture.

## 6. Consequences

### 6.1 Implementation — **no change authorised, and none needed**

The accepted transport already behaves as determinations 1–10 require: it reads `req.url`, `req.method` and the JSON body, never `req.headers`; identity and tenant come only from `resolveReportsOwnerContext()`; query and body claims are refused `400`; the namespace is server-constant. See tracker `§16.213.4`. **Correcting an implementation to satisfy a reading that `C4-2` has now rejected would be an unauthorised change**, and none is made: `frontend/server/reports-transport.ts` is unchanged at blob `775d282bc50f67993a58d6e6d1c7dd45e4aceeac`.

### 6.2 Tests — targeted evidence **is** authorised and is required

The behaviour is correct but **unevidenced in CI**: no committed Reports test sends an `Authorization` header or a header-borne claim. Under `C4-2` the required assertions are the **non-effect** ones, and they are added (§6.3). **No test may assert `400` for a header claim.**

### 6.3 The authorised test set

Added to `frontend/server/reports-transport.test.ts` (and exercised against the real handler):

1. Ambient `Authorization: Bearer`/`Basic`/claim-shaped values **cannot establish or change identity** — the context response is identical to the claim-free response.
2. Header-borne identity claims (`userId`, `principal`, `owner`, `ownerUserId`, `authenticatedUser`, `X-Authenticated-User`) **cannot change the personal application principal**.
3. Header-borne tenant claims (`tenantId`, `X-Tenant-Id`) **cannot change ownership or tenant context**.
4. Reports ownership **always** comes from the server-established principal, including on create and read with hostile headers present.
5. A valid create carrying such headers **may proceed and persist an artifact** under that principal (the `C4-2` outcome is asserted positively, not merely tolerated).
6. Query and body rejection **remains correct** (`400`, established body).
7. Route, method and error handling **remain correct** (`404`, `405` with `Allow`, `503` fences).

### 6.4 Qualification — referred to the separate dated act

F-7 consequences (legs 2 and 5, verdicts, `SATISFIED`, acceptance, admission) are recorded in the **dated addendum to the F-7 record** published with this act. This act does **not** itself change any qualification status.

## 7. Non-claims and preserved statuses

- **Preserved:** `R1`, `R2` (as clarified), `R3` effective; F-7 historical verdicts; F-7 `SATISFIED` subject to the F-7 addendum's clarification of legs 2 and 5; capability acceptance `ACCEPTED (bounded non-production)`; `CV-51` `ACCEPTED/CLOSED` (read-only UI); production `NOT ADMITTED`; `REG-11` Option C; the three IPD pins; `O-06`/`O-07`/`O-09`; Gate 3/4/5 and `P-1` states; `D115`/`CV-43` unwired.
- **Not claimed:** that `C-4` was ever satisfied on its header limb; that any suite or qualifiation evidence was executed unless recorded as executed; that the host is network-isolated (§5); that `C4-2` is a security relaxation of any operative guarantee — the guarantee (no claim is authoritative) is retained and now explicitly evidenced.
- **Not authorised:** anything in §4.

## 8. Effectiveness

This act is effective upon publication to `refs/heads/main` and independent remote read-back, and its effectiveness is recorded at tracker `§16.215`. Until that read-back, the prior state stands.

*Program Authority: Ramki. **`C4-2` SELECTED — EFFECTIVE.** `C4-1` closed as unselected. One personal application principal; header claims ignored, never authoritative; request may proceed; artifact may persist; query/body refusal and the server-constant namespace unchanged; no multi-user, public-exposure or production authority granted.*
