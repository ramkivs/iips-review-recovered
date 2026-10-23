# IIPS v3.0 — CAP-02 U1 Broker-Import Transport Authority Act (Prepared)

> ## STATUS: **PREPARED — NOT EFFECTIVE; ROUTE NOT ADMITTED, NOT REGISTERED, NOT IMPLEMENTED**
> This is the exact narrow route/transport preparation requested by the current CAP-02 directive. It is not a
> rendered act, not write authority, not an implementation manifest, and not evidence that `/api/broker-import/**`
> exists. No source file may change under this document until a separate effective act names its final baselines
> and preserves this scope. All twelve existing `/api/user-portfolios*` HTTP 503 fences remain byte-stable and
> IPD `WRITE_NOT_AUTHORIZED` remains preserved.

| Field | Prepared value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-2026-10-23-01` |
| **Effectiveness** | **PREPARED / NOT EFFECTIVE** |
| **Initial baseline** | IRR `f53056214d45c850928fbabd51dc6a2adcb64f2b`; IPD `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` (read-only) |
| **Current IPD baseline** | `main@554ed6ceaa7422c95806fd1b6e095a24a8554be2`, tree `2d9dc14d8f9ab52a4507648e5323ce803dc6d512`; Increment A is present, export-only |
| **Preparation authority** | Standing PA grant + current CAP-02 directive §4; DEC-06 R-1/R-3/R-6/R-7 |
| **Effectiveness requirement** | Separate exact-scope effectiveness act plus current-source baseline/diff verification. This record does not render itself |
| **Separate prerequisites** | B-1 export is closed; B-1R repin and UI mount need effective composition; U7 for revision/result semantics; U2/C-1 for durable semantics; Gate A′ binding; U3/U4/U5/U6 as applicable |
| **Network invariant** | No new HTTP/TCP listener; no new IPC operation; existing Node host, Vite proxy and `callIpc` only |

---

## 1. Exact prepared boundary

### 1.1 One route, one existing transport

The only HTTP operation proposed for the first transport increment is:

```text
POST /api/broker-import/:portfolioId/holdings
```

The previously proposed `GET /api/broker-import/:portfolioId/preview` is **removed** from this increment. U7
now prepares a narrower revision-only read, but no GET route is admitted until that projection is explicitly
included in an effective U1/composition manifest. No wildcard `/api/user-portfolios`
registration, alternate HTTP service, native port, browser socket or `broker.import` IPC operation is proposed.

The call chain is closed:

```text
IPD UI / IRR browser adapter
  → relative HTTPS(S) request to existing IRR host
  → existing Vite /api proxy in development only
  → existing frontend/server/executive-transport.ts
  → CAP-02 trusted-host adapter
  → existing callIpc (one socket, one request, zero automatic retries)
  → existing IPD portfolio.save dispatch
  → IPD-owned resolution/provenance/atomic persistence (only if separately authorized)
```

The route is not admitted merely because this prepared scope exists. Until a separate act is effective, the
namespace must remain unregistered and real-host probes must show that no request reaches IPD through it.

### 1.2 What this act does not authorize

- No IPD source, contract, schema, migration, mapping, test, branch, commit or publication.
- No IPD component-export change or IRR dependency repin (B-1 is closed externally; B-1R remains separate).
- No IPD UI mount, navigation entry, renderer store adapter or availability gate lift.
- No `portfolio.analytics`, `broker.import`, file-transfer, write-retry, reconciliation or admin operation.
- No change to `frontend/server/user-portfolio/**`, including the frozen contract, client, adapter, fences or tests.
- No lift of any existing HTTP 503 fence; no modification of the twelve existing route-method responders.
- No Gate 4 execution/qualification, Gate 4 result acceptance, Gate 5 admission, W-1 satisfaction or operational write.
- No CAP-03, reference-portfolio, certified-analytics, pipeline control or IPO Screening Engine integration.

## 2. Current v1 compatibility finding

### 2.1 Accepted IPD request shape

Accepted v1 `portfolio.save` takes a raw `PortfolioSaveRequest` whose `input` contains:

```text
portfolioId: string
expectedRevision: number                 // mandatory under W-5
mode: 'MERGE' | 'REPLACE'
holdings: HoldingInput[]
contentDigest?: string                   // base64url SHA-256
broker?: string
```

Each `HoldingInput` admits only broker-observed fields. It does not admit canonical `companyId`,
`identityStatus`, `resolutionDisposition`, `weightPercentage`, `lineageDigest`, owner/tenant/principal or
credentials. Unknown request keys are refused.

### 2.2 Why the existing IRR adapter is not reusable unchanged

`frontend/server/user-portfolio/ipcPortAdapter.ts` currently sends:

```text
{
  portfolioId,
  expectedRevision?,                     // optional in the old G2 port
  holdings,
  options: { mode, contentDigest, fileName, sourceBroker }
}
```

That differs in three independent ways:

1. `mode` and `contentDigest` are nested under a key v1 does not admit;
2. `sourceBroker` and `fileName` are not accepted v1 request keys; v1's top-level broker field is `broker`;
3. `expectedRevision` can be absent, which v1/W-5 refuses.

The old adapter also discards the v1 save receipt and attempts to construct the older `G2SaveResult`. Reusing it
would create the appearance of CAP-02 progress while failing at the IPD parser and then inventing result
semantics. It is therefore excluded, not patched in place and not injected into IPD's browser `PortfolioStorePort`.

### 2.3 Prepared compatibility disposition

| UI / host value | v1 disposition | Required behavior |
|---|---|---|
| `portfolioId` | Direct | Opaque route parameter; validate length/control/owner-key constraints; never resolve identity in IRR |
| `expectedRevision` | Direct, required | Missing/invalid → local refusal before socket; mismatch → revision conflict; never omit or use `0` as fallback |
| `mode` | Direct, top-level | Only `MERGE` or `REPLACE`; no default invented by transport |
| Raw holding observations | Direct after exact projection | Allowlist only; reject authority/identity/owner/tenant/credential keys before I/O |
| `contentDigest` | Direct, top-level | Validate accepted base64url SHA-256 shape; do not recompute in IRR to replace the UI's ingress evidence |
| UI `sourceBroker` | Rename to top-level `broker` only by explicit CAP-02 mapping | No `sourceBroker` key on the v1 wire; reject contradictory broker claims rather than choosing one |
| `fileName` | **Not representable in v1** | Never add the key unilaterally or claim it was durably preserved; C-1/U2 decision required before durable-success scope |
| `importedAt` | **Not representable in v1** | IPD must remain authority for durable attribution/timing; no IRR timestamp substitution |
| `lineageDigest` | Intentionally not sent | IPD recomputes authoritative lineage; IRR must not assert it |
| Canonical identity fields | Intentionally not sent | IPD resolves from raw observations under W-6 |

**C-1 is not solved by a new operation.** The first U1 increment is refusal/transport conformance only and cannot
claim lossless durable provenance. Before any operational-write or durable-success increment, an accepted
write-contract/provenance act must resolve `fileName` and `importedAt` (or explicitly replace those requirements
with an equally authoritative IPD-owned representation). The current v1 contract cannot be silently extended by
IRR; a write-payload change is subject to the v1 change-class and Gate E policy rules.

## 3. Exact prepared host contract

### 3.1 HTTP request

The first refusal-conformance request comprises one opaque route `portfolioId` and a JSON body with only:

```text
expectedRevision            required non-negative integer
mode                        MERGE | REPLACE
holdings                    bounded array of raw v1 HoldingInput observations
contentDigest               optional accepted digest shape
broker                      optional broker observation
```

The HTTP DTO deliberately does not define `fileName`, `importedAt`, `options`, `sourceBroker`, `lineageDigest`
or any canonical identity/owner field. A later effective C-1 act may revise this exact manifest; until then,
adding those keys is a typed validation refusal, not a field silently forwarded or dropped by the server.

For a future browser adapter, the IPD UI's `sourceBroker` may be projected to `broker` only under the mapping in
§2.3. The adapter must not serialize the UI's canonical preview fields. This browser projection is not part of
the U1 host-only implementation manifest and remains blocked by B-1R/U7/effective composition authority.

### 3.2 Responses

| Condition | HTTP/result rule |
|---|---|
| Valid v1 success (not currently authorized) | Relay the minimal v1 receipt verbatim: `disposition`, `revision`, `durability`, `durable`; no G2 totals/timestamps added |
| `WRITE_NOT_AUTHORIZED` | Non-2xx refusal (503 under the current IRR convention), `storeEffect:'NONE'`, no durable success, no retry |
| `REVISION_CONFLICT` | Non-2xx conflict response using the existing closed reason convention; no current revision guessed or cached |
| `RESOURCE_UNAVAILABLE` | Non-disclosing non-2xx refusal; no missing/foreign/tombstoned distinction |
| `VALIDATION_FAILED` | Non-2xx validation refusal; no field values fabricated to make a retry succeed |
| Class P | Existing non-disclosing Class P mapping; no reason, response frame or owner disclosure |
| Timeout, EOF, incomplete response, invalid frame | Distinct `OUTCOME_UNKNOWN`; zero automatic retries; no ordinary success or ordinary refusal claim |
| Unrepresentable result | Envelope/result gap; preserve commit uncertainty, stop composition, never fill fields locally |

An authoritative v1 success containing `durable:true` is the only source of a durable-success claim. The absence
of a success response is never evidence of rollback. Any UI wording for these states remains subject to U7.

## 4. Exact conditional IRR file manifest

This is a **prepared future manifest**, not permission to create these files now. An effective act must restate
current blobs, dependencies and test commands before any line changes.

### 4.1 New trusted-host modules

| File | Sole responsibility |
|---|---|
| `frontend/server/broker-import/brokerImportBoundary.ts` | Import-safe request validation, raw-field allowlist and first-party/prefix gate construction; no listener |
| `frontend/server/broker-import/brokerImportV1SaveAdapter.ts` | Map the validated DTO to exact top-level v1 `portfolio.save`; call `callIpc` once; relay the minimal receipt and typed outcomes |
| `frontend/server/broker-import/brokerImportHttp.ts` | Request parsing, bounded body handling, response mapping and method rejection; no domain parsing or persistence |
| `frontend/server/broker-import/index.ts` | Narrow server-only composition exports; no browser export and no persistence import |

The adapter may reuse pure v1 types and the existing non-disclosing mapping helpers where their semantics fit.
It must not instantiate `IpcUserPortfolioPort`, call `save` on the old G2 port, reuse its `options` payload, or
return a fabricated `G2SaveResult`.

### 4.2 One existing host edit

| File | Exact permitted change |
|---|---|
| `frontend/server/executive-transport.ts` | Import the CAP-02 route boundary; add owner-scoped first-party handling for `/api/broker-import`; mount the one POST route. Keep `/api/user-portfolios` prefixes exact and every existing fence registration untouched |

No Vite edit is required. No package dependency is required for the host-only route. No renderer file is in this
act's manifest.

### 4.3 New focused tests

| File | Required assertions |
|---|---|
| `frontend/server/broker-import/brokerImportBoundary.test.ts` | Exact DTO acceptance; canonical/owner/tenant/credential keys rejected before client invocation; bounded sizes; mandatory revision |
| `frontend/server/broker-import/brokerImportV1SaveAdapter.test.ts` | Byte-exact top-level v1 payload, one call/no retry, minimal receipt preservation, Class A/Class P/unknown mapping |
| `frontend/server/broker-import/brokerImportHttp.test.ts` | Real existing host route/method behavior, non-2xx denial, no wildcard registration, no stack/provider/owner disclosure |
| `frontend/server/broker-import/brokerImportImportSafety.test.ts` | Importing the route does not listen, connect, write or register a global process hook |

A fixture transport or fake `callIpc` in these tests is unit evidence, not end-to-end persistence proof. A real
IPD dispatch refusal test must use the accepted harness and is additionally blocked by the binding/environment
prerequisites; it must not be replaced by a mock and labeled end-to-end.

### 4.4 Mandatory unchanged files

The effective act must enumerate current baseline blobs for, and verify no byte change in:

- `frontend/server/user-portfolio/userPortfolioBoundary.ts`;
- `frontend/server/user-portfolio/translationBoundary.ts`;
- `frontend/server/user-portfolio/firstPartySignal.ts`;
- `frontend/server/user-portfolio/userPortfolioContract.ts`;
- `frontend/server/user-portfolio/ipcClient.ts`;
- `frontend/server/user-portfolio/ipcPortAdapter.ts`;
- `frontend/server/user-portfolio/ownerContextFromBinding.ts`;
- every other existing `frontend/server/user-portfolio/**` file unless a separately effective act names it;
- `frontend/server/user-portfolio-transport.ts` and `frontend/server/owner-context-unavailable.ts`;
- `frontend/vite.config.ts` and all existing listener settings;
- every IPD file and remote ref.

## 5. Prepared implementation and verification order

Only after effectiveness and current-baseline confirmation:

1. Implement the import-safe DTO/boundary and focused validation tests.
2. Implement the CAP-02 v1 adapter and byte-exact payload tests; prove the old `options` shape is absent.
3. Mount only the one POST route in the existing host; prove the previous twelve route-method fences unchanged.
4. Run focused broker-import tests, the full frontend `test:ci` nonzero/pass-guard suite, both fence suites,
   frontend typecheck, strict replay-server closure and production build.
5. Run a real-host negative probe proving no unintended GET/route/listener and no browser-to-socket dependency.
6. Run only the accepted real IPD refusal harness when its binding preconditions are separately effective; a mock
   is not a substitute. Operational success remains out of scope.
7. Re-read `git diff --check` and the complete patch; independently verify remote commit/tree/ancestry/blobs after
   the routine IRR PR/merge workflow. IPD remains read-only.

No Gate 4 claim, Gate 4 result acceptance, Gate 5 admission, W-1 satisfaction or durable-success claim may be
attached to this transport increment.

## 6. Prepared closing disposition

The narrowest adequate U1 direction is now explicit: one route on the existing host, one existing IPC operation,
a new wire-conformant CAP-02 adapter, no G2 result fabrication, no preview endpoint before U7, and no new
listener. It is not effective and has not been implemented. The next authorized act must decide effectiveness
against the then-current tree while keeping C-1/U2, B-1R and U7 separate rather than treating route admission as
proof of product or durable composition.
