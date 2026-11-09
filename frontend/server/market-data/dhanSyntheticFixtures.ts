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
  | 'RATE_LIMITED'
  // DHAN-P5 freshness scenarios.
  | 'FRESHNESS_D01_CURRENT'
  | 'FRESHNESS_D01_STALE'
  | 'FRESHNESS_D01_SUPPRESSED'
  | 'FRESHNESS_D01_MISS'
  | 'FRESHNESS_D01_INVALID_TIMESTAMP'
  | 'FRESHNESS_D02_NOT_AVAILABLE'
  | 'FRESHNESS_REFRESH_FAILED'
  | 'FRESHNESS_MALFORMED_RESPONSE';

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
 * The D01 quote freshness threshold, in seconds. IPD's `DEFAULT_FRESHNESS_CONFIG` sets
 * `D01_QUOTES: 15 * 60`.
 */
export const SYNTHETIC_D01_THRESHOLD_SECONDS = 900;

/** The D02 historical freshness threshold, in seconds. IPD sets `D02_OHLCV: 24 * 60 * 60`. */
export const SYNTHETIC_D02_THRESHOLD_SECONDS = 86_400;

/**
 * Builds a synthetic IPD freshness status.
 *
 * The shape is exactly IPD's `FreshnessStatus`. Every field is a fixed literal, so the
 * synthetic status is deterministic and self-identifying.
 */
export function syntheticFreshnessStatus(options: {
  readonly domain?: 'D01_QUOTES' | 'D02_OHLCV';
  readonly cacheState?: string;
  readonly asOf?: string | null;
  readonly timestampEvidence?: string;
  readonly receivedAt?: string | null;
  readonly evaluatedAt?: string;
  readonly observationEvaluatedAt?: string | null;
  readonly thresholdSeconds?: number;
  readonly ageSeconds?: number | null;
  readonly verdict?: string;
  readonly staleConcessionActive?: boolean;
  readonly suppressExecution?: boolean;
  readonly eligibleForUse?: boolean;
  readonly lastRefreshOutcome?: string;
  readonly lastFailure?: { readonly code: string; readonly priorPreserved: boolean } | null;
} = {}): Record<string, unknown> {
  const domain = options.domain ?? 'D01_QUOTES';
  return {
    domain,
    cacheState: options.cacheState ?? 'CURRENT',
    asOf: options.asOf === undefined ? SYNTHETIC_AS_OF : options.asOf,
    timestampEvidence: options.timestampEvidence ?? 'VALID',
    receivedAt: options.receivedAt === undefined ? SYNTHETIC_RECEIVED_AT : options.receivedAt,
    evaluatedAt: options.evaluatedAt ?? SYNTHETIC_EVALUATED_AT,
    observationEvaluatedAt:
      options.observationEvaluatedAt === undefined ? SYNTHETIC_EVALUATED_AT : options.observationEvaluatedAt,
    thresholdSeconds:
      options.thresholdSeconds ??
      (domain === 'D01_QUOTES' ? SYNTHETIC_D01_THRESHOLD_SECONDS : SYNTHETIC_D02_THRESHOLD_SECONDS),
    ageSeconds: options.ageSeconds === undefined ? 120 : options.ageSeconds,
    verdict: options.verdict ?? 'GOOD',
    staleConcessionActive: options.staleConcessionActive ?? false,
    suppressExecution: options.suppressExecution ?? false,
    eligibleForUse: options.eligibleForUse ?? true,
    lastRefresh: {
      outcome: options.lastRefreshOutcome ?? 'SUCCESS',
      lastFailure: options.lastFailure ?? null,
    },
  };
}

/**
 * The route a synthetic transport request targets.
 *
 * The synthetic transport serves the SAME routes IPD serves, and answers each with the
 * matching shape: a quote request gets a quote envelope, a freshness request gets a
 * freshness status. This is what lets the IRR boundary be exercised end to end against the
 * real contract.
 */
export type SyntheticRoute = 'quotes' | 'historical' | 'freshness';

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

    // DHAN-P5 freshness scenarios. The D01 scope is a synthetic quote-cache lookup and the
    // D02 scope is the exact status IPD reports for a domain whose service does not wire
    // the observation cache or the refresh orchestrator.
    case 'FRESHNESS_D01_CURRENT':
      return {
        kind: 'RESPOND',
        status: 200,
        body: syntheticFreshnessStatus({ cacheState: 'CURRENT', verdict: 'GOOD', ageSeconds: 120 }),
      };

    case 'FRESHNESS_D01_STALE':
      return {
        kind: 'RESPOND',
        status: 200,
        body: syntheticFreshnessStatus({
          cacheState: 'STALE',
          verdict: 'STALE',
          ageSeconds: SYNTHETIC_D01_THRESHOLD_SECONDS + 60,
          staleConcessionActive: true,
          suppressExecution: false,
          eligibleForUse: true,
          lastRefreshOutcome: 'SKIPPED_FRESH',
        }),
      };

    case 'FRESHNESS_D01_SUPPRESSED':
      return {
        kind: 'RESPOND',
        status: 200,
        body: syntheticFreshnessStatus({
          cacheState: 'UNAVAILABLE',
          verdict: 'UNAVAILABLE',
          ageSeconds: SYNTHETIC_D01_THRESHOLD_SECONDS * 2 + 60,
          staleConcessionActive: false,
          suppressExecution: true,
          eligibleForUse: false,
          lastRefreshOutcome: 'FAILURE',
          lastFailure: { code: 'REFRESH_FAILED', priorPreserved: true },
        }),
      };

    case 'FRESHNESS_D01_MISS':
      return {
        kind: 'RESPOND',
        status: 200,
        body: syntheticFreshnessStatus({
          cacheState: 'MISS',
          verdict: 'UNKNOWN',
          asOf: null,
          receivedAt: null,
          observationEvaluatedAt: null,
          timestampEvidence: 'NOT_AVAILABLE',
          ageSeconds: null,
          staleConcessionActive: false,
          suppressExecution: true,
          eligibleForUse: false,
          lastRefreshOutcome: 'UNKNOWN',
        }),
      };

    case 'FRESHNESS_D01_INVALID_TIMESTAMP':
      return {
        kind: 'RESPOND',
        status: 200,
        body: syntheticFreshnessStatus({
          cacheState: 'UNAVAILABLE',
          verdict: 'UNAVAILABLE',
          asOf: null,
          receivedAt: null,
          observationEvaluatedAt: null,
          timestampEvidence: 'INVALID',
          ageSeconds: null,
          staleConcessionActive: false,
          suppressExecution: true,
          eligibleForUse: false,
          lastRefreshOutcome: 'UNKNOWN',
        }),
      };

    case 'FRESHNESS_D02_NOT_AVAILABLE':
      return {
        kind: 'RESPOND',
        status: 200,
        body: syntheticFreshnessStatus({
          domain: 'D02_OHLCV',
          cacheState: 'NOT_AVAILABLE',
          verdict: 'UNKNOWN',
          asOf: null,
          receivedAt: null,
          observationEvaluatedAt: null,
          timestampEvidence: 'NOT_AVAILABLE',
          ageSeconds: null,
          staleConcessionActive: false,
          suppressExecution: true,
          eligibleForUse: false,
          lastRefreshOutcome: 'UNKNOWN',
        }),
      };

    case 'FRESHNESS_REFRESH_FAILED':
      return {
        kind: 'RESPOND',
        status: 200,
        body: syntheticFreshnessStatus({
          cacheState: 'STALE',
          verdict: 'STALE',
          ageSeconds: SYNTHETIC_D01_THRESHOLD_SECONDS + 60,
          staleConcessionActive: true,
          suppressExecution: false,
          eligibleForUse: true,
          lastRefreshOutcome: 'FAILURE',
          lastFailure: { code: 'REFRESH_FAILED', priorPreserved: false },
        }),
      };

    case 'FRESHNESS_MALFORMED_RESPONSE':
      return {
        kind: 'RESPOND',
        status: 200,
        // A payload that is not a freshness status: IRR must reject it rather than
        // project it with invented values.
        body: { notAFreshnessStatus: true },
      };

    default:
      return { kind: 'RESPOND', status: 200, body: { ok: true } };
  }
}

/**
 * Resolves the behaviour for a scenario ON A SPECIFIC ROUTE.
 *
 * The DHAN-P5 freshness scenarios only describe what the FRESHNESS route does. When the
 * same scenario is used on a quote or historical route, the route's own behaviour applies
 * instead, so one scenario can drive a whole end-to-end flow without the freshness
 * behaviour leaking into the quote envelope.
 */
export function syntheticBehaviourForRoute(
  scenario: SyntheticScenario,
  route: SyntheticRoute,
  domain?: 'D01_QUOTES' | 'D02_OHLCV',
): SyntheticTransportBehaviour {
  // The freshness route ALWAYS serves a freshness status, whichever scenario is driving
  // the data routes: IPD's freshness endpoint has its own contract, and a data-route
  // scenario must not make the freshness endpoint answer with a quote envelope.
  if (route === 'freshness') {
    if (scenario.startsWith('FRESHNESS_')) {
      return syntheticBehaviourFor(scenario);
    }
    // A transport-level failure applies to EVERY route, including the freshness route:
    // an unreachable daemon does not answer one route and answer another.
    if (
      scenario === 'TRANSPORT_UNAVAILABLE' ||
      scenario === 'TRANSPORT_TIMEOUT' ||
      scenario === 'TRANSPORT_UNAUTHENTICATED' ||
      scenario === 'RATE_LIMITED'
    ) {
      return syntheticBehaviourFor(scenario);
    }
    // The default status for the data-route scenarios, in the requested domain.
    if (domain === 'D02_OHLCV') {
      // IPD's composed D02 service does not wire the observation cache or the refresh
      // orchestrator, so D02 always reports NOT_AVAILABLE / UNKNOWN.
      return syntheticBehaviourFor('FRESHNESS_D02_NOT_AVAILABLE');
    }
    return syntheticBehaviourFor('FRESHNESS_D01_CURRENT');
  }

  const isFreshnessScenario = scenario.startsWith('FRESHNESS_');
  if (!isFreshnessScenario) {
    return syntheticBehaviourFor(scenario);
  }
  // A freshness-only scenario on a data route: the data route's own behaviour applies.
  switch (route) {
    case 'quotes':
      return syntheticBehaviourFor('QUOTE_SUCCESS');
    case 'historical':
      return syntheticBehaviourFor('HISTORICAL_SUCCESS');
    default:
      return syntheticBehaviourFor(scenario);
  }
}
