# WS-A §5 — HTTP evidence-retrieval route: authority gap determination

**Record:** `WS-A-EVIDENCE-RETRIEVAL-ROUTE-AUTHORITY-GAP-2026-11-05`
**Type:** AUTHORITY DETERMINATION AND PREPARED DECISION REQUEST.
**Status:** **PENDING AUTHORITY — NOT IMPLEMENTED.** No HTTP route was added, exposed, registered
or mounted. The evidence journal's existing local durability functionality is **unchanged and
intact**.
**Owner repository:** `ramkivs/iips-review-recovered` (IRR).
**Distinction from completed work:** the IRR evidence journal itself is **already implemented and
merged** (IRR PR #434, `frontend/server/broker-import/brokerImportEvidenceStore.ts`). This record
does **not** recreate it. It addresses only the *separately identified* requirement for an HTTP
retrieval route over that journal.

---

## 1. Existing route inventory (inspected, not assumed)

### 1.1 The broker-import namespace — a CLOSED admitted set of exactly two routes

`frontend/server/broker-import/brokerImportHttp.ts` `matchRoute()`:

```ts
if (parts.length !== 4 || parts[0] !== 'api' || parts[1] !== 'broker-import') return null;
const leaf = parts[3];
if (leaf !== 'holdings' && leaf !== 'revision') return null;
```

| Route | Method | Admitting authority |
| :--- | :--- | :--- |
| `/api/broker-import/:portfolioId/holdings` | `POST` only (others → `405 Allow: POST`) | `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` §1 |
| `/api/broker-import/:portfolioId/revision` | `GET` only (others → `405 Allow: GET`; any query string → `400`) | same act, **§7 additive amendment under DEC-06 R-2/R-5** |
| every other path under `/api/broker-import/` | — | `404 not found` |

### 1.2 The pre-existing `/api/evidence/:id` route is NOT this route

`frontend/server/executive-transport.ts:970` serves `GET /api/evidence/:id` from
`computeCertifiedEvidence(id)`. It is a **credential-free read of certified reference screen
evidence** (deterministic certified DTOs), with no owner scoping, no tenant scoping, no retention
semantics and no consent surface. It cannot serve broker-import evidence, and reusing or widening
it would change a certified read surface — a different and larger authority question. It is
recorded here so the gap is not mistaken for an existing capability.

### 1.3 Fences that any new route must leave byte-stable

All twelve `/api/user-portfolios*` route-method pairs return HTTP 503 with byte-stable fence blobs
(`server/user-portfolio/fenceUnchanged.test.ts` re-asserts them, and also asserts
`/api/broker-import` remains in the guarded path family).

## 2. Applicable governance decisions

| Decision | Exact bearing on an evidence-retrieval route |
| :--- | :--- |
| U1 transport authority act, **Network invariant** | *"No new HTTP/TCP listener; no new IPC operation; existing Node host, existing Vite `/api` proxy, existing `callIpc` only."* A third route in the namespace is a change to the admitted transport surface. |
| U1 act §3, *"What admission does not authorize"* | *"No preview/revision GET route…"* — the revision GET was later admitted **only** by an explicit §7 additive amendment. The pattern is unambiguous: **a route exists only when an act names it.** No act names an evidence route. |
| U1 act §7 preamble | Additive amendments are rendered **under DEC-06 R-2/R-5**, preserve §§1–6 verbatim, and are conditioned on a verified prerequisite (there: the U7 provider prerequisite and B-1R package compatibility). |
| U1 act §2.4 / amendment rule | *"adding any of them later is a boundary change under this act's amendment rule, not a silent accommodation."* |
| PF-1 `PersistenceService` (`server/persistence/persistence-service.ts`) | *"A trusted CALLER is responsible for supplying tenant/owner scope; this service is a **library authority, not an HTTP identity or access-control boundary**."* Mounting it on HTTP therefore requires a **separate** owner-context authority; the journal supplies none. |
| NP-06 Reports owner carrier precedent | `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01` (Option B carrier) established the two fixed owner literals for the Reports route family, bound by the SHA-256 of the carrier's canonical bytes, and *"may never be the origin of a value change: a change requires a new governed PA act."* This is the established shape of the missing authority. |
| CAP-02 U1 §2.2 handler order | C9 first-party signal first, binding precondition next, bounded body read, DTO validation before any socket, non-disclosure on every refusal. Any new route inherits this order. |

## 3. The precise authority gap

**There is no effective act that admits an HTTP route over the broker-import evidence journal.**
Concretely, all four of the following are absent:

1. **Transport admission.** No act names a third route in the closed `/api/broker-import/` set.
   `matchRoute()` returns `null` for it today, so it is `404` — and that `404` is the *correct,
   governed* behaviour, not a bug.
2. **Owner-context authority.** The journal is a trusted-host library whose tenant/owner scope is
   supplied by the caller. Nothing establishes which owner scope an HTTP request may assert, or how
   that assertion is carried and verified. Without it, a route would be an unscoped read of
   personal financial evidence.
3. **Retention policy.** No governed retention period, purge rule, locality constraint or
   cross-device rule exists for serving retained parsed personal financial evidence over HTTP.
4. **Consent statement.** The product's recorded statement is that the CSV *"is processed in this
   browser only, not uploaded or stored"* and that raw bytes are deliberately **not** retained.
   Serving the retained parsed equivalent over HTTP is a **new disclosure surface** that the
   current statement does not cover and would contradict unless expressly re-declared.

**Determination: authority is ABSENT. Per the standing instruction, the route is NOT implemented
and NOT exposed.** `brokerImportEvidenceStore.ts` remains reachable only as a trusted-host library,
exactly as merged in PR #434.

## 4. Minimum required authority (prepared request — PROPOSED, NOT EFFECTIVE)

Rendered here so the decision can be taken without further investigation. **Act ID: PENDING
ASSIGNMENT. Status: `PROPOSED — NOT EFFECTIVE`. Nothing below is self-executing.**

### 4.1 Minimum transport authority

| Element | Minimum required content |
| :--- | :--- |
| Form | An **additive amendment** to `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` under **DEC-06 R-2/R-5**, preserving §§1–7 verbatim — the same instrument that admitted the revision GET. |
| Route named | Exactly one read route, e.g. `GET /api/broker-import/:portfolioId/evidence` (or `…/evidence/:importId`). One route; no list-and-enumerate variant unless separately named. |
| Method discipline | `GET` only; other methods → `405 Allow: GET`; any query string → `400 invalid-request` before any socket; all other paths under `/api/broker-import/` stay `404`. |
| Handler order | Identical to U1 §2.2 / §7.1: C9 first-party signal → binding precondition (`IIPS_G3_IPC_BINDING_PROVISIONED`) → opaque `portfolioId` validation → single scoped journal read. |
| Owner scoping | A named owner-context carrier decision in the NP-06 R1 shape: fixed tenant/owner literals established **by the act**, bound by the SHA-256 of the carrier's canonical bytes, never originated in code. Foreign scope must be indistinguishable from absent (`404`, no enumeration). |
| Non-disclosure | No stack, provider detail, owner, tenant, socket path, row value or identifier echoed on any refusal; static reason only. |
| Response surface | The retained record's evidence fields only. **No canonical `companyId`**, consistent with U1 §2.3 and with the preview boundary. No raw CSV bytes (none are retained). |
| Network invariant | Still **no new HTTP/TCP listener and no new IPC operation**: the route is served by the existing IRR Node host and the existing Vite `/api` proxy. |
| Fences | All twelve `/api/user-portfolios*` 503 pairs re-asserted byte-stable; `brokerImportImportSafety` re-asserted (importing route modules listens, connects, writes and registers nothing). |
| Explicitly NOT authorized by it | Any write, any durable-success claim, any `W-1` change, any Gate 4/Gate 5 movement, any fence lift, any `durable:true`, any production scope, any change to IPD. |

### 4.2 Minimum retention policy

| Element | Minimum required content |
| :--- | :--- |
| Locality | Server-owned local data directory only (`IIPS_DATA_DIR`, TD-7a); never a Git working tree; never a network store; never a third party. |
| Scope | One record per `importId = sha256(broker ‖ contentDigest ‖ readAt)`, per tenant+owner; append-only; duplicate retention is a no-op. |
| Raw bytes | Remain **not retained**, as merged. Any change is a separate act, not an accommodation. |
| Volatile fields | P04 quarantine record ids are process-specific; the **first** retention is authoritative and a repeated import returns it unchanged (already recorded as a limitation inside every record). |
| Integrity | `recordDigest` (SHA-256 over the canonical form) re-verified on **every** read; tamper fails closed with `EVIDENCE_TAMPERED`; a storage failure propagates and retention is never reported when the write failed. |
| Retention period / purge | **To be fixed by the act.** No period exists today; the journal is append-only with compaction explicitly NOT built in v1 (PF-1 TD-3). A purge/compaction rule must be named before an HTTP surface can serve indefinite accumulation. |
| Restart | Already proven across separate OS processes; a route adds no new durability claim. |

### 4.3 Minimum consent statement

The act must re-declare, in the product's own words and in the UI copy:

1. that parsed broker-import evidence **is** retained locally in the owner's data directory (this
   is already true and already disclosed in the record's limitations, but the current page copy
   still says files are "not uploaded or stored" — the two must be reconciled **by the act**, not by
   an implementation choice);
2. that the **raw CSV bytes are not retained**, and the retained equivalent is the parsed row
   inventory, the digest, the per-row identity evidence and the refusal details;
3. that the retained evidence is **served only to the same local owner scope**, is never
   transmitted to any third party, and no route enumerates another owner's records;
4. that retention of evidence is **not** a save, not a validation, not an authorization and not
   durability of holdings — `savedRows` stays 0 and `WRITE_NOT_AUTHORIZED` is unchanged.

## 5. Blocker statement (exact)

> **BLOCKER `WS-A-EV-ROUTE-1` — PENDING AUTHORITY.** An HTTP evidence-retrieval route over the IRR
> broker-import evidence journal cannot be implemented because the admitted
> `/api/broker-import/` route set is **closed** at two routes by
> `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` (§1 and its §7
> additive amendment), whose network invariant admits no new listener and no new IPC operation, and
> because no act establishes (a) transport admission for a third route, (b) an owner-context
> carrier for the journal — which PF-1 expressly states is *"a library authority, not an HTTP
> identity or access-control boundary"*, (c) a retention period or purge rule, or (d) a consent
> statement covering the serving of retained parsed personal financial evidence. The minimum
> required authority is specified in §4 of this record and is **`PROPOSED — NOT EFFECTIVE`**, Act
> ID `PENDING ASSIGNMENT`. **Accountable:** PA (Ramki) to render the amendment; IRR to implement
> only after it is effective, published and remotely read back. **Completion criteria:** an
> effective additive amendment naming exactly one route, its owner-context carrier and digest
> binding, the retention period and purge rule, and the reconciled consent statement; then IRR
> implementation with the U1 §2.2 handler order, the twelve fence pairs re-asserted byte-stable,
> import-safety re-asserted, and remote verification of the merged state.
>
> **Not blocked, and unaffected:** the journal's local durability. It is implemented, merged
> (PR #434), restart-proven across separate OS processes, tamper-fail-closed and idempotent — see
> `WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md` §7.
