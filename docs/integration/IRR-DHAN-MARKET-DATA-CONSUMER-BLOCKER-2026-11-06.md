# IRR Dhan market-data consumer — transport gate and bounded disposition

**Status: END-TO-END LIVE CONSUMPTION BLOCKED.** This is an IRR-owned integration finding, not an IPD change, a provider-access approval, a production qualification, or permission to activate credentials. It records the exact immutable IPD reference reviewed and the work deliberately not performed.

## Reviewed refs and dependency state

- IRR active branch: `arena/22180ef3-iips-review-recovered`, fast-forwarded from its previous ancestor `9d3f668e457a33afc8ce67f60b2b28d71f1b08a3` to live IRR `origin/main` at `80737d072829d942fb2f9ec76f6e9122e36530f7`. Work remains on this branch; IRR `main` was not modified.
- IPD reference: `ramkivs/iips-production-market-data`, `arena/aeea3efb-iips-production-market-data` at `7565e4d05e21c83067c60a831b3cc26ddc5304d5`.
- `frontend/package.json` and its lock now pin only `iips-production-market-data` to that exact IPD commit. The existing `iips-broker-import` pin (`07e86a4f2c2…`) and `iips-np04-governed-persistence` pin (`2e11fa3b689d…`) are unchanged.
- At the reviewed IPD commit, package exports include `./dhan-server`, `./portfolio-ui`, `./pit`, and `./d114-non-production`. The exact package was installed from the pin; Node resolved all four export targets, and `./dhan-server` loaded its Dhan source/client, provider-neutral route and operational-control exports. This verifies package presence and resolution, **not** a usable Dhan service or live feed.

## Why the consumer gate is not met

The reviewed IPD implementation explicitly identifies Dhan D1/D2 as `PRE_ACCESS / SYNTHETIC / OFFLINE`:

- `docs/DHAN-D1-PROVIDER-FOUNDATION.md` says no real credentials/authentication or live calls exist. `DhanApiClient` receives an injected HTTP transport; the default is `PreAccessNoNetworkTransport`.
- The D1 mapping registry ships empty. Synthetic test mappings use placeholders; the D2 evidence calls out `NO_MAPPING_DATA_LOADED`. No real Dhan security identifiers or live mapping coverage are asserted.
- `ProviderMarketDataRoute` in `src/providers/market_data_route.ts` is an in-process class. It exposes `getQuote`/`getQuotes`; it is not an HTTP, socket, or IPC endpoint.
- The IPD IPC operation set in `src/ipc/protocol.ts` is portfolio operations only. `src/ipc/dispatch.ts` contains no quote or historical-data consumer operation. Existing portfolio IPC therefore cannot carry market data.
- `./dhan-server` exports provider and control primitives, including `DhanRefreshOrchestrator`; it exports no composed service factory, listening endpoint, credential-resolver implementation, or consumer transport. Source inspection found no production construction of `DhanRefreshOrchestrator` (the inspected composition is in its test suite). Constructing these provider primitives inside IRR would move provider/credential ownership to the consumer and require IRR to compose IPD's operational controls; it is not a safe substitute for an IPD-owned service.

The missing capability is therefore IPD-owned: a qualified server runtime/factory that owns credential resolution and real transport, composes the provider-neutral route with its operational controls and approved mappings, and exposes a documented same-host quote consumer transport with an explicit access-control boundary, carrying only canonical data/state/provenance. IPD must separately qualify real Dhan access and mappings before any result can be called live. No endpoint, protocol, credential path, mapping, or provider construction is invented here.

## Bounded IRR disposition

The dependency pin is advanced and its existing package consumers are preserved. No `./dhan-server` import is added to browser code; no Dhan IDs, vendor DTOs, provider internals or credentials are exposed through IRR contracts. No IRR market-data endpoint or client was created. No stored holding price, market value, portfolio history, revision, contribution or transaction is changed. No valuation UI is wired to synthetic or assumed data.

The known canonical state vocabulary remains `CURRENT`, `STALE`, and `UNAVAILABLE`: IPD's existing route maps canonical `GOOD` to `CURRENT`, `STALE` to `STALE`, and `PARTIAL`/`UNAVAILABLE`/provider failure to `UNAVAILABLE`. This state mapping is not evidence of a reachable source. A future IRR projection must remain read-only, preserve source timestamps/provenance and calculate a distinct market-data view without replacing stored portfolio fields.

**Integration remains BLOCKED** until IPD supplies the owned service/transport and the missing live-access/mapping qualification. No end-to-end market-data request, historical request, real credential, or Dhan network call has been made. The initiating request was truncated after “Preserve explicit CURRENT, STALE and”; obtain the remaining acceptance criteria before expanding this bounded work into projection or UI implementation.
