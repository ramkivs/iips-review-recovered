/**
 * Synthetic IPD market-data fixtures (DHAN-P3).
 *
 * WHAT THIS IS
 *   A deterministic, in-process stand-in for the IPD market-data HTTP transport. It serves
 *   the SAME routes, the SAME request contracts and the SAME response envelopes as IPD's
 *   `createMarketDataHttpServer` — `POST /v1/quotes`, `POST /v1/historical` and
 *   `GET /v1/health` — so the full IRR browser → IRR server → IPD transport → response
 *   path can be exercised without a running IPD daemon and without any credential.
 *
 * WHAT THIS IS NOT
 *   - It is NOT live DHAN data. Every number is a fixed literal. Nothing here was observed
 *     from the vendor, and nothing here may be presented as a Dhan observation.
 *   - It is NOT a second provider, normalizer, cache or market-data authority. It is a
 *     TEST FIXTURE that replays already-shaped canonical envelopes. It computes no quote, no
 *     candle and no freshness verdict — it returns exactly what the scenario declares.
 *   - It is NOT shipped into the browser bundle. It lives under `server/` and is used only by
 *     the server-side tests.
 *
 * SYNTHETIC LABELLING
 *   Every synthetic response carries an explicit marker so it can never be mistaken for a
 *   live observation: the envelopes use IPD's `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`
 *   qualification value and a `dataVersion` that names the fixture. The scenario names
 *   themselves state that they are synthetic.
 */

/** The data version stamped on every synthetic envelope, so a synthetic response is self-identifying. */
export const SYNTHETIC_DATA_VERSION = 'synthetic-fixture-v1';

/** The canonical quote payload shape IPD returns, as a fixed literal. */
export const SYNTHETIC_QUOTE_PAYLOAD = Object.freeze({
  companyId: 'SYNTHETIC:COMPANY',
  symbol: 'SYNTH',
  exchange: 'NSE',
  currency: 'INR',
  bid: 100.5,
  ask: 100.75,
  ltp: 100.6,
  open: 99.5,
  high: 101.25,
  low: 99.25,
  close: 100.6,
  previousClose: 99.0,
  volume: 123456,
  vwap: 100.4,
  turnover: 12345600,
  change: 1.6,
  pctChange: 1.6161616161616162,
  tradeCount: 321,
});

/** The observation timestamps used by the synthetic fixtures. Fixed, so tests are deterministic. */
export const SYNTHETIC_AS_OF = '2026-11-06T10:15:00.000Z';
export const SYNTHETIC_RECEIVED_AT = '2026-11-06T10:15:00.120Z';
export const SYNTHETIC_EVALUATED_AT = '2026-11-06T10:15:00.121Z';

/**
 * Builds a synthetic canonical quote envelope.
 *
 * `qualityState` is IPD's own canonical quality verdict. It is the ONLY input to IRR's
 * freshness mapping, so a scenario can produce a CURRENT, a STALE or an UNAVAILABLE verdict
 * without IRR inventing anything.
 */
export function syntheticQuoteEnvelope(options: {
  readonly qualityState?: 'GOOD' | 'STALE' | 'UNAVAILABLE';
  readonly asOf?: string;
  readonly companyId?: string;
  readonly securityId?: string;
} = {}): Record<string, unknown> {
  const qualityState = options.qualityState ?? 'GOOD';
  return {
    envelopeId: `env-d01-synthetic-${qualityState.toLowerCase()}`,
    domain: 'D01_QUOTES',
    mode: 'SNAPSHOT',
    companyId: options.companyId ?? 'SYNTHETIC:COMPANY',
    securityId: options.securityId ?? 'ISIN:INE002A01018:EQ',
    payload: { ...SYNTHETIC_QUOTE_PAYLOAD, companyId: options.companyId ?? 'SYNTHETIC:COMPANY' },
    provenance: {
      sourceClassification: 'CANONICAL_MARKET_DATA',
      vendorTier: 'TIER_2_COMMERCIAL',
      asOf: options.asOf ?? SYNTHETIC_AS_OF,
      receivedAt: SYNTHETIC_RECEIVED_AT,
      evaluatedAt: SYNTHETIC_EVALUATED_AT,
      dataVersion: SYNTHETIC_DATA_VERSION,
      lineageHash: 'synthetic'.padEnd(64, '0'),
      qualityState,
    },
    timestamp: SYNTHETIC_RECEIVED_AT,
    schemaVersion: 'synthetic-v1',
  };
}

/** Builds a synthetic historical result in IPD's `DhanHistoricalNormalizationResult` shape. */
export function syntheticHistoricalResult(options: {
  readonly candleCount?: number;
  readonly fromDate?: string;
  readonly toDate?: string;
} = {}): Record<string, unknown> {
  const count = options.candleCount ?? 3;
  const candles = Array.from({ length: count }, (_, index) => {
    const day = String(index + 1).padStart(2, '0');
    return {
      companyId: 'SYNTHETIC:COMPANY',
      symbol: 'SYNTH',
      interval: '1d',
      candleStart: `2026-11-0${day}T00:00:00.000Z`,
      candleEnd: `2026-11-0${day}T23:59:59.999Z`,
      open: 100 + index,
      high: 101 + index,
      low: 99 + index,
      close: 100.5 + index,
      volume: 1000 + index * 100,
      vwap: 100.25 + index,
      tradeCount: 10 + index,
      isAdjusted: false,
    };
  });

  return {
    candles,
    requestedFromDate: options.fromDate ?? '2026-11-01',
    requestedToDate: options.toDate ?? '2026-11-03',
    returnedCandleCount: candles.length,
    coverageClaim: 'ACCESS_PENDING_UNVERIFIED',
  };
}

/** The synthetic service health, matching IPD's `ServiceHealth` exactly. */
export const SYNTHETIC_SERVICE_HEALTH = Object.freeze({
  service: 'UP',
  providerConfiguration: 'CONFIGURED',
  liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
  providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
});

/**
 * The scenarios the synthetic transport can serve.
 *
 * Each scenario names the exact IRR-visible behaviour it exercises. The naming makes the
 * synthetic nature explicit in the test output.
 */
export type SyntheticScenario =
  | 'QUOTE_SUCCESS'
  | 'QUOTE_STALE'
  | 'QUOTE_UNAVAILABLE'
  | 'HISTORICAL_SUCCESS'
  | 'HISTORICAL_EMPTY'
  | 'TRANSPORT_UNAVAILABLE'
  | 'TRANSPORT_TIMEOUT'
  | 'TRANSPORT_UNAUTHENTICATED'
  | 'IDENTITY_UNRESOLVED'
  | 'RATE_LIMITED';

/**
 * The synthetic transport's server-side behaviour for one scenario.
 *
 * `kind` selects what the synthetic transport does:
 *   - `RESPOND`  — answer with the declared body and status.
 *   - `HANG`     — never answer, so the client's timeout fires.
 *   - `CLOSE`    — destroy the socket, so the connection fails.
 */
export interface SyntheticTransportBehaviour {
  readonly kind: 'RESPOND' | 'HANG' | 'CLOSE';
  readonly status?: number;
  readonly body?: unknown;
}

/**
 * Resolves the behaviour for a scenario.
 *
 * Every failure scenario uses IPD's OWN failure codes, so IRR's mapping is exercised against
 * the real vocabulary rather than an invented one.
 */
export function syntheticBehaviourFor(
  scenario: SyntheticScenario,
): SyntheticTransportBehaviour {
  switch (scenario) {
    case 'QUOTE_SUCCESS':
      return {
        kind: 'RESPOND',
        status: 200,
        body: {
          ok: true,
          envelope: syntheticQuoteEnvelope({ qualityState: 'GOOD' }),
          freshness: 'CURRENT',
        },
      };

    case 'QUOTE_STALE':
      return {
        kind: 'RESPOND',
        status: 200,
        body: {
          ok: true,
          envelope: syntheticQuoteEnvelope({
            qualityState: 'STALE',
            asOf: '2026-11-06T06:00:00.000Z',
          }),
          freshness: 'STALE',
        },
      };

    case 'QUOTE_UNAVAILABLE':
      return {
        kind: 'RESPOND',
        status: 200,
        body: {
          ok: true,
          envelope: syntheticQuoteEnvelope({ qualityState: 'UNAVAILABLE' }),
          // An UNAVAILABLE verdict carries no STALE marker: the two are distinct verdicts and
          // the fixture must not conflate them.
          freshness: 'CURRENT',
        },
      };

    case 'HISTORICAL_SUCCESS':
      return {
        kind: 'RESPOND',
        status: 200,
        body: { ok: true, result: syntheticHistoricalResult() },
      };

    case 'HISTORICAL_EMPTY':
      return {
        kind: 'RESPOND',
        status: 200,
        body: { ok: true, result: syntheticHistoricalResult({ candleCount: 0 }) },
      };

    case 'TRANSPORT_UNAVAILABLE':
      return { kind: 'CLOSE' };

    case 'TRANSPORT_TIMEOUT':
      return { kind: 'HANG' };

    case 'TRANSPORT_UNAUTHENTICATED':
      return {
        kind: 'RESPOND',
        status: 401,
        body: {
          error: { code: 'UNAUTHENTICATED', message: 'missing or invalid transport credential' },
        },
      };

    case 'IDENTITY_UNRESOLVED':
      return {
        kind: 'RESPOND',
        status: 502,
        body: {
          error: {
            code: 'UNRESOLVED_INSTRUMENT',
            message: 'no exact mapping for the requested canonical identity',
          },
        },
      };

    case 'RATE_LIMITED':
      return {
        kind: 'RESPOND',
        status: 429,
        body: { error: { code: 'RATE_LIMITED', message: 'provider request budget exhausted' } },
      };

    default:
      return { kind: 'RESPOND', status: 200, body: { ok: true } };
  }
}
