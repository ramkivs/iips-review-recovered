# IIPS v3.0 — CAP-02 U1 Broker-Import Transport Authority Act — **RENDERED — EFFECTIVE (ONE ROUTE, REFUSAL/TRANSPORT CONFORMANCE ONLY)**

> ## STATUS: **EFFECTIVE — THE SINGLE ROUTE `POST /api/broker-import/:portfolioId/holdings` IS ADMITTED ON THE EXISTING IRR NODE HOST — NO WRITE AUTHORIZATION, NO DURABLE-SUCCESS SCOPE, NO FENCE CHANGE**
> This record renders effective the prepared act
> `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-2026-10-23-01` (blob `966891d4c7016a5e993e609a03488c8719499e3e`, preserved unamended) against current baselines, with the two factual corrections recorded in §2.4. Route admission under this act is **transport admission only**: while the Gate E W-1 conjunction is unmet, every write dispatched through the route terminates in IPD `WRITE_NOT_AUTHORIZED` with zero store effect, and that refusal is the asserted correct behavior of this increment — not a defect.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` |
| **Effectiveness** | **EFFECTIVE** — exact scope of §§1–3 |
| **Baselines at rendering** | IRR `main@39a0a675eb7323b39b9465c741843a1a05316a31` (tree `4a9648c1…`); IPD `main@554ed6ceaa7422c95806fd1b6e095a24a8554be2` (tree `2d9dc14d…`, read-only, re-verified unchanged this pass) |
| **Authority** | Standing PA grant (F-3 §1.2, blob `c4c9f7d7…`) as construed by DEC-06 R-1/R-3/R-6/R-7, plus the current CAP-02 directive of `2026-10-23` instructing this pass to render and implement the U1 decision |
| **Companion acts** | Composition act `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` (file manifest owner); U7 decision `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-EFFECTIVE-2026-10-23-01` |
| **Network invariant** | No new HTTP/TCP listener; no new IPC operation; existing Node host, existing Vite `/api` proxy, existing `callIpc` only |
| **Publication** | Session branch → IRR PR → CI → merge under `CHG-2026-10-18-02`; remote read-back required before the route is implemented (§6) |

---

## 1. The admitted route and its call chain

```text
POST /api/broker-import/:portfolioId/holdings
```

The only HTTP operation admitted by this act. The previously proposed
`GET /api/broker-import/:portfolioId/preview` remains **unadmitted** (the prepared act removed it;
a revision-only read needs its own admission after the U7 provider prerequisite is met).

```text
browser client (frontend/src/api/brokerImport.ts, relative /api URL)
  → existing Vite /api proxy (development only; same-origin in a built deployment)
  → existing frontend/server/executive-transport.ts dispatch
  → CAP-02 handler (brokerImportHttp.ts): route/method match → C9 first-party signal
      → binding-precondition fail-close → bounded body read → DTO validation
  → CAP-02 trusted adapter (brokerImportV1SaveAdapter.ts)
  → existing callIpc (one connection, one request, zero automatic retries)
  → existing IPD portfolio.save dispatch
  → IPD WRITE_NOT_AUTHORIZED before any mutation (current, verified W-1 state)
```

## 2. Contract reconciliation at rendering (verified against current source)

### 2.1 Accepted v1 `portfolio.save` payload (IPD contract v1 §6, blob `163eb1f1…`)

```text
portfolioId: string            (opaque; from the route parameter)
expectedRevision: number       (mandatory, W-5 — missing/invalid refused before I/O)
mode: 'MERGE' | 'REPLACE'
holdings: HoldingInput[]       (broker-observed fields only)
contentDigest?: string
broker?: string
```

### 2.2 Handler order and HTTP mapping

| Stage | Rule |
|---|---|
| Route/method | Exact match only; other methods on the route → `405 Allow: POST`; other paths under `/api/broker-import/` → `404 not found` |
| C9 first-party signal | Not `FIRST_PARTY` ⇒ non-disclosing refusal before any body read |
| Binding precondition | `IIPS_G3_IPC_BINDING_PROVISIONED` absent ⇒ `503 owner-context-unavailable` **before** any port/adapter construction or connection attempt |
| Body | 64 KiB cap (existing `owner-scoped-http` helper); invalid JSON ⇒ `400`; oversize ⇒ `413` |
| DTO validation | Exact top-level keys only; canonical/identity/owner/tenant/credential key at any depth ⇒ typed `400 INVALID_REQUEST` (field path only, no values echoed) **before any socket** |
| v1 success | `200` relaying the minimal receipt verbatim: `disposition`, `revision`, `durability`, `durable` — nothing added |
| `WRITE_NOT_AUTHORIZED` | `503`, `storeEffect: 'NONE'`, no durable success, no retry |
| `REVISION_CONFLICT` | `409`; no current revision guessed or cached |
| `RESOURCE_UNAVAILABLE` | `404`; no missing/foreign/tombstoned distinction |
| `INVALID_REQUEST` | `400` |
| `REFUSED_UNRESOLVED_IDENTITY` / `REFUSED_STORE_GUARD` | `422` (non-2xx 2F refusal shape; IRR's choice within IRR-2) |
| `UNAVAILABLE` | `503` |
| Class P (zero bytes) | `503 owner-context-unavailable`, indistinguishable from configuration-absent (IRR-2) |
| Timeout / transport fault | `503` `{outcome: 'OUTCOME_UNKNOWN', retried: false}` — never success, never ordinary refusal, zero automatic retries |
| Success frame that is not a valid minimal receipt | `503` `{outcome: 'OUTCOME_UNKNOWN', reason: 'UNREPRESENTABLE_RESULT'}` — commit uncertainty preserved; no field filled locally |

### 2.3 Browser projection rules (client side)

The browser client **selects** broker-observed fields only: `symbol`, `isin`, `exchange`,
`quantity`, `averageBuyPrice`, `currentPrice`, `marketValue` (per v1 §6 holding rules). The UI's
canonical preview fields (`companyId`, `runtimeCompanyId`, `identityStatus`,
`resolutionDisposition`), `lineageDigest` and derived `weightPercentage` are **never serialized**.
The UI's `provenance.sourceBroker` is projected to the top-level `broker` field by explicit mapping
only; contradictory broker claims are refused rather than reconciled. `fileName` and `importedAt`
are **not representable** in v1 and are not sent; no provenance-preservation claim is made (C-1/U2
gap preserved). IRR does not recompute the digest: the UI ingress-computed `contentDigest` is
forwarded verbatim after shape validation.

### 2.4 Corrections to the prepared record (evidence-cited)

1. **Digest shape.** The prepared record annotated `contentDigest` as "base64url SHA-256". The
   actual provider digest is **64-character lowercase hex SHA-256** (`computeSha256` in IPD
   `src/contracts/provenance.ts`, used by `broker-import-ingress.ts` stage 0 at the pinned commit).
   The boundary validates the actual provider shape. No v1 rule is changed; the annotation is
   corrected, not the contract.
2. **Holding allowlist enumerated.** The prepared record left the raw-observation field set
   implicit. This act fixes it exactly as §2.3 (the v1 §6 broker-observed set). Fields outside the
   set that are not refused authority keys (e.g. `active`, `rawIdentifier`, `weightPercentage`)
   are not transported by the first surface; adding any of them later is a boundary change under
   this act's amendment rule, not a silent accommodation.

## 3. What admission does not authorize

- No durable write, `durable:true` presentation, or operational-write authorization (W-1 unmet).
- No `broker.import` or other new IPC operation; no new listener; no contract v1 change.
- No `/api/user-portfolios*` fence change — the twelve route-method pairs stay 503 byte-stable.
- No preview/revision GET route; no modal mount (blocked by the U7 provider prerequisite).
- No lossless-provenance claim: `fileName`/`importedAt` remain C-1/U2 gaps; before any
  operational-write or durable-success increment, an accepted write-contract/provenance act must
  resolve them or replace them with an equally authoritative IPD-owned representation.

## 4. Implementation and test obligations (executed under the composition act's manifest)

1. Boundary tests: exact DTO acceptance; mandatory revision; mode enum; bounded sizes; digest
   shape; canonical/owner/tenant/credential key refusal **before** any client invocation.
2. Adapter tests: byte-exact top-level v1 payload (no `options`, `sourceBroker`, `fileName`); one
   `callIpc` call and zero retries on every outcome; minimal receipt relay; Class A/Class P/unknown
   mapping; unrepresentable-success handling.
3. HTTP tests against the **real exported composed server**: admitted route behavior, fail-closed
   503 without the binding precondition, 405/404 handling, every refusal mapping, body limits,
   no wildcard cross-origin header on the CAP-02 namespace, and re-assertion of all twelve
   `/api/user-portfolios*` fence pairs.
4. Import-safety tests: importing the route modules listens, connects, writes and registers
   nothing.
5. No mock may be presented as end-to-end IPD persistence evidence; the real IPD dispatch refusal
   harness remains blocked by Gate A′ binding prerequisites and is not claimed.

## 5. Preserved invariants

All twelve `/api/user-portfolios*` route-method pairs return HTTP 503 with byte-stable fence blobs
(`user-portfolio-transport.ts` `51704c12…`, `owner-context-unavailable.ts` `cb8db45d…`). IPD
`WRITE_NOT_AUTHORIZED` before mutation (verified in `src/ipc/dispatch.ts` at the pinned commit:
every write operation returns the Class A `WRITE_NOT_AUTHORIZED` frame before any store access).
The IPC envelope refuses authority keys before send (`encodeRequestFrame`), one request per
connection, no retry, outcome-unknown on timeout.

## 6. Publication and effectiveness

Rendered `2026-10-23`; effective on rendering; proven from `main` only by the merge commit and
remote blob read-back. **The route is implemented only after this record and the companion
composition act are published and remotely verified.** If publication fails, the route stays
unregistered and this record may not be cited as admission authority.

```text
U1: EFFECTIVE — POST /api/broker-import/:portfolioId/holdings admitted
Transport conformance increment: refusal-faithful end to end
Durable success scope: NOT AUTHORIZED (C-1/U2 + U3–U6 prerequisites unchanged)
Fences: UNCHANGED (twelve pairs 503, byte-stable)
```
