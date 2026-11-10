# DHAN identity search: *"The IRR identity service is unavailable."* on `INFY`

**Date:** 2026-11-09 · **Repository:** IRR (`ramkivs/iips-review-recovered`) · **Branch:** `arena/aba7cc24-iips-review-recovered`

## 1. Reported symptom

Searching for `INFY` in the DHAN instrument search returned:

```
The IRR identity service is unavailable.
```

No configuration change had been made, and the neighbouring DHAN surfaces (`/api/dhan/health`,
`/api/dhan/quotes`) were not reported as failing.

## 2. Reproduction

The string is emitted from exactly one place in the repository:

```
frontend/server/executive-transport.ts:760
res.end(JSON.stringify({ error: { code: 'TRANSPORT_UNAVAILABLE', message: 'The IRR identity service is unavailable.' } }))
```

It sits in the `catch` that wraps

```ts
const identity = await import('./market-data/dhanIdentityTransport');
await identity.handleDhanIdentityRequest(req, res);
```

so it fires when the **dynamic import itself throws** or the handler throws before headers are
written — i.e. this server failed, not IPD.

Reproduced deterministically by making the identity module's only IPD dependency unloadable
(`iips-production-market-data/dhan-server` entrypoint removed) and issuing the exact browser
request:

```
POST /api/dhan/instruments/search  {"query":"INFY"}
→ 503 {"error":{"code":"TRANSPORT_UNAVAILABLE","message":"The IRR identity service is unavailable."}}
```

The sibling route shows what the identity route was hiding:

```
POST /api/dhan/health
→ 500 {"error":"dhan health transport error","detail":"Error [ERR_MODULE_NOT_FOUND]: Cannot find module …"}
```

`/api/dhan/health` reports its cause; the identity route discarded it. **That is the defect.**

## 3. Full flow, traced

| Layer | File | Behaviour |
|---|---|---|
| UI | `src/features/dhan/DhanInstrumentSearch.tsx` | catches `DhanIdentityApiError` and renders `cause.message` |
| Client | `src/api/dhanIdentity.ts` `call()` | network rejection → `IRR_UNAVAILABLE`; non-OK → server `code`/`message` verbatim |
| Vite | `vite.config.ts` | `/api` → `http://localhost:8787` |
| Entrypoint | `server/executive-transport.ts` ~L744-770 | three identity paths; `catch` → the reported 503, **fault discarded** |
| Transport | `server/market-data/dhanIdentityTransport.ts` | validates request, reads server-only config, POSTs to IPD, validates response coherence |
| Config | `server/market-data/marketDataTransportConfig.ts` | reads `IIPS_MARKET_DATA_TRANSPORT_URL` + `IIPS_MARKET_DATA_TRANSPORT_TOKEN`; loopback-only |

### What was *not* wrong

Verified, not assumed:

- **The IPD contract.** IPD's own published service (`DhanIdentityApiService` from
  `iips-production-market-data/dhan-server`, built on the governed master + P7 registry) returns
  two `QUALIFIED` rows for `INFY` (`EQ_INFY_IN`, NSE and BSE, `ISIN:INE009A01021:EQ`). IRR's
  `validIpdResponse` accepts that shape unchanged.
- **IRR's forwarding.** With the transport configured against a stand-in serving those exact
  IPD-produced payloads, `POST /api/dhan/instruments/search {"query":"INFY"}` through the real
  Vite proxy answers `200` with both rows and `provenance.authority: "IPD"`.
- **Credentials.** Absent from the response body, the response headers, and the built bundle.

So the failure is an **IRR ownership** failure — in error mapping and diagnostics, not in the
IPD contract. No IPD change is required or requested.

## 4. Defects found and corrected

### D1 — the IRR-side fault was discarded (the reported symptom)

`catch { … }` with no binding: the module-load error, the request-stream error and any unexpected
throw were all flattened into one opaque string, and the cause was lost. An operator had no path
from the message to a fix.

**Correction.** One reporting function, `reportIdentityFault`, is now the single place an IRR-side
identity fault is recorded. It is passed into the transport so faults the transport classifies
itself (a broken request stream; an unexpected throw) use the same channel. The browser response is
**unchanged** — a browser is not the operator — and the diagnosis goes to the server log:

```
[dhan-identity] IRR-side fault during transport: Error: Cannot find module '…/package.js' imported from …/marketDataTransportConfig.ts
```

No configured value can reach that line: the transport passes fixed phrases or the fault's own
message, and neither the URL nor the token appears in an exception raised on this path.

### D2 — an unconfigured server was indistinguishable from an IPD fault

`TRANSPORT_NOT_CONFIGURED` said *"The server-side IPD transport is not configured."* — an operator
can do nothing with that, and the two settings involved were documented nowhere in the repository.

**Correction.** The response now names the missing settings, and only their **names**:

```json
{"error":{"code":"TRANSPORT_NOT_CONFIGURED",
          "message":"The server-side IPD identity transport is not configured; no request was sent to IPD.",
          "requiredSettings":["IIPS_MARKET_DATA_TRANSPORT_URL","IIPS_MARKET_DATA_TRANSPORT_TOKEN"]}}
```

A non-loopback/malformed URL is a different operator action and gets its own message
(`TRANSPORT_URL_INVALID` branch); it still leaks no value. The client carries the names through as
`DhanIdentityApiError.requiredSettings`, filtered to bare setting names, and the UI appends
*"Configure … on the IRR server."* Only names cross the boundary; the server holds the values.

### D3 — an unexpected transport throw escaped classification

`handleDhanIdentityRequest` awaited `requestDhanIdentity` unguarded. A throw there reached the
entrypoint's catch and was reported as unclassifiable "unavailable". It now records the fault and
answers with a classified body.

### D4 — the settings were undocumented

Added to `.env.example` (with the server-side-only warning), plus runbook §5.2 (the route/outcome
table) and four new §9 troubleshooting rows that make the four failure modes tell themselves apart.

## 5. The four failure modes are now distinct

| Condition | Status | Code | Message |
|---|---|---|---|
| settings unset / URL invalid | 503 | `TRANSPORT_NOT_CONFIGURED` | *The server-side IPD identity transport is not configured…* + `requiredSettings` |
| configured, IPD not listening | 503 | `TRANSPORT_UNAVAILABLE` | *The IPD identity service could not be reached.* |
| bearer token rejected | 502 | `TRANSPORT_AUTHENTICATION_FAILED` | *The IPD service rejected server authentication.* |
| IRR itself failed to serve the route | 503 | `TRANSPORT_UNAVAILABLE` | *The IRR identity service is unavailable.* + `[dhan-identity]` log line |

All four were observed live on the running transport, through the Vite proxy where the browser would
use it.

## 6. Verification

| Gate | Result |
|---|---|
| `server/market-data/dhanIdentityTransport.test.ts` | 13/13 |
| `server/dhanIdentityFaultReporting.test.ts` (new) | 4/4 |
| `server/market-data/marketDataTransportConfig.test.ts` | 4/4 |
| `src/api/dhanIdentity.test.ts` | 5/5 |
| `src/features/dhan/DhanInstrumentSearch.test.tsx` | 8/8 |
| Affected surface (`server/market-data`, `src/features/dhan`, `src/app`, client API) | **282 passed / 20 files** |
| `tsc --noEmit` · `tsc -p tsconfig.replay-server.json` · `tsc -p tsconfig.investment-server.json` | all exit 0 |
| `npm run build` | clean, 3,125.31 kB |

Live, through the real Vite proxy: `POST /api/dhan/instruments/search {"query":"INFY"}` → `200` with
NSE and BSE `QUALIFIED` rows, `provenance.authority: "IPD"`.

## 7. Boundaries preserved

- No identity registry, resolver or qualification algorithm was added to IRR — the fix is error
  mapping and diagnostics. P4 functionality is consumed, not duplicated.
- The bearer token stays on the server boundary; the built bundle contains no reference to
  `IIPS_MARKET_DATA_TRANSPORT_TOKEN`.
- No security control was relaxed: the loopback-only URL rule, the request-shape validation, the
  16 KiB body limit and the response-coherence checks are untouched.
- No route outside the three identity paths changed, and no P2/P3/P4/P5 behaviour was altered.

## 8. Evidence for IPD, if ever needed

None required for this defect — IRR was at fault. Recorded for completeness: IPD's P4 identity
contract behaved correctly throughout, returning `QUALIFIED` for `INFY` on both exchanges. The one
operational note is that IPD's daemon must be running and its transport token shared with IRR via
`IIPS_MARKET_DATA_TRANSPORT_URL` / `IIPS_MARKET_DATA_TRANSPORT_TOKEN`; that is documented IPD
configuration, not an IPD defect.
