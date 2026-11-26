/**
 * W-29 — the SHARED IRR quote-consumption boundary.
 *
 * WHAT THIS MODULE IS
 *   The ONE server-side place in IRR that consumes IPD quotes. Every IRR quote consumer —
 *   the `/api/dhan/quotes` presentation route today, and the W-30…W-35 consumer
 *   integrations later — obtains market data through this module and nothing else.
 *
 *   It accepts a set of canonical security identities, fetches each quote through IPD's
 *   EXISTING market-data transport under bounded concurrency, reads IPD's D01 freshness
 *   status for the same identity scope, joins the two, and returns ONE uniform projection
 *   per requested identity carrying:
 *
 *     - the quote value (or explicit absence of one — never a fabricated zero);
 *     - `asOf` (the provider observation timestamp, when IPD supplied one);
 *     - the freshness verdict, in IRR's vocabulary, associated with THAT identity;
 *     - `providerQualification`, echoed from the provider's own qualification;
 *     - an explicit `unmapped` state (the identity has no exact provider mapping);
 *     - an explicit `unavailable` state (the market data could not be obtained).
 *
 * WHAT THIS MODULE IS NOT — AND MUST NEVER BECOME
 *   - NOT a provider client. IPD's `MarketDataTransportClient` IS the client. This module
 *     constructs it at exactly one site and calls it; it writes no wire format and opens no
 *     provider connection.
 *   - NOT a normalizer. IPD normalizes the vendor payload into the canonical D01 envelope.
 *     This module validates that envelope shape and refuses a malformed one; it never
 *     repairs, defaults or recomputes a value.
 *   - NOT a market-data cache. There is no store, no map, no TTL and no memo in this module:
 *     every call reads IPD. Caching is IPD's, and only IPD's.
 *   - NOT a freshness evaluator. IPD decides the verdict, the threshold, the stale
 *     concession and the suppression. This module carries IPD's verdict and applies only
 *     IRR's own conservative presentation mapping.
 *   - NOT a historical-data boundary. Historical consumption is explicitly out of W-29's
 *     scope and is specified separately as W-39.
 *
 * SERVER-SIDE ONLY
 *   This file lives under `server/`. The transport address and the transport bearer token
 *   are server-side configuration and are never returned, logged or published. Nothing here
 *   may be imported from browser `src/` code, and the W-29 bundle test asserts it is absent
 *   from the emitted browser output.
 *
 * CONSERVATISM — THE FIVE OUTCOMES ARE NEVER COLLAPSED
 *   `CURRENT`     — IPD said the observation is inside its freshness threshold, and the
 *                   joined D01 status for that identity scope did not say it is stale.
 *   `STALE`       — IPD said the observation is past its threshold (stale concession or a
 *                   quote-level STALE marker). A stale quote is NEVER presented as current.
 *   `UNAVAILABLE` — the market data could not be obtained, or IPD suppressed/withheld it, or
 *                   the answer was unusable. The reason code is always published.
 *   `UNMAPPED`    — the canonical identity has no exact provider mapping. This is an
 *                   IDENTITY answer, not a market-data answer, and it is never reported as
 *                   `UNAVAILABLE` data.
 *   `MALFORMED_IDENTITY` — the requested identity is not a canonical D114 identity. It never
 *                   reaches the transport and consumes no provider request budget.
 *
 *   A missing price is NEVER represented as zero: an entry either carries a complete,
 *   validated quote or carries NO quote at all (`value: null`).
 *
 * BOUNDED CONCURRENCY AND RATE-LIMIT AWARENESS
 *   A batch is dispatched through a fixed-size worker pool (default
 *   `DEFAULT_QUOTE_BATCH_CONCURRENCY`), so a 200-item watchlist cannot become a 200-request
 *   burst. When IPD answers `RATE_LIMITED`, the batch stops dispatching new quote requests
 *   immediately and every not-yet-attempted identity is reported as an explicit
 *   `RATE_LIMITED` unavailability with `notAttempted: true`. It never treats a rate limit as
 *   a zero price and never retries in a loop.
 */

import {
  createIpdMarketDataTransportClient,
  readIpdFreshnessStatus,
  resolveIpdMarketDataTransportConfig,
  type IpdMarketDataTransportConfig,
  type IpdTransportConfigResolution,
} from './dhanMarketDataTransport';
import {
  IRR_FRESHNESS_VOCABULARY,
  projectIpdFreshnessStatus,
  type DhanFreshnessView,
  type Freshness,
} from './dhanFreshnessRoutes';
import { validateCanonicalIdentityCoherence } from './dhanCanonicalIdentity';
import {
  correlateIrrAction,
  createIrrActionContext,
  isIrrActionContext,
  readIpdTraceEventsForAction,
  recordIrrEvent,
  type IrrActionTrace,
  type IrrW24Event,
} from './dhanTrace';
import type { IpdTraceContext } from './dhanMarketDataTransport';

/**
 * IRR's freshness vocabulary, re-used from the freshness boundary rather than re-declared.
 *
 * IRR must have exactly ONE server-side declaration of this vocabulary — a second copy is a
 * drift hazard, which is why this module re-exports rather than restates it. The browser
 * contract test pins it against the browser's own declaration.
 */
export { IRR_FRESHNESS_VOCABULARY };
export type { Freshness };

/**
 * The provider qualification IRR publishes alongside market data.
 *
 * This is IPD's OWN qualification vocabulary and the only value IRR may publish: the provider
 * has NOT been live-qualified. A successfully answered quote is therefore still a pre-access,
 * synthetic-only observation, and publishing this alongside it is what stops a consumer from
 * reading a successful quote as evidence of live provider connectivity.
 */
export const IRR_PROVIDER_QUALIFICATION = 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED';

/** The canonical D114 security identity grammar. Mirrors IPD's own validation. */
const D114_SECURITY_ID_PATTERN = /^ISIN:[A-Za-z0-9]{12}:[^:\s]+$/;

/** The exchange segments IPD accepts for a D01 quote scope. */
const EXCHANGE_SEGMENTS: ReadonlySet<string> = new Set(['NSE_EQ', 'BSE_EQ']);

/** The default bounds. A batch is never dispatched in one unbounded burst. */
export const DEFAULT_QUOTE_BATCH_CONCURRENCY = 4;
/** The hard ceiling a caller may raise concurrency to. */
export const MAX_QUOTE_BATCH_CONCURRENCY = 8;

/**
 * The failure codes that mean the IDENTITY could not be mapped, as opposed to the market
 * data being unavailable. These are IPD's own codes, carried verbatim.
 */
export const IDENTITY_UNMAPPED_CODES: ReadonlySet<string> = new Set([
  'UNRESOLVED_INSTRUMENT',
  'IDENTITY_RESOLUTION_FAILURE',
  'MALFORMED_INSTRUMENT_MAPPING',
  'CONFLICTING_INSTRUMENT_MAPPING',
  'NOT_FOUND',
]);

/**
 * The failure codes that mean the market data could not be obtained. Declared so the
 * distinction above is visible in one place rather than implied.
 */
export const MARKET_DATA_UNAVAILABLE_CODES: ReadonlySet<string> = new Set([
  'RATE_LIMITED',
  'REQUEST_TIMEOUT',
  'TIMEOUT',
  'UNAUTHENTICATED',
  'TRANSPORT_FAILURE',
  'PROVIDER_STATUS_FAILURE',
  'STALE_DATA_SUPPRESSED',
  'MALFORMED_RESPONSE',
  'NOT_CONFIGURED',
  'TRANSPORT_URL_INVALID',
  'MALFORMED_BASE_URL',
  'NON_LOOPBACK_BASE_URL',
]);

/**
 * The five outcomes a consumed identity can carry. They are intentionally a closed set: a
 * consumer cannot receive a sixth, ambiguous state.
 */
export type QuoteConsumptionOutcome =
  | 'CURRENT'
  | 'STALE'
  | 'UNAVAILABLE'
  | 'UNMAPPED'
  | 'MALFORMED_IDENTITY';

/** Every outcome, in reporting order. Used by the batch summary and the tests. */
export const QUOTE_CONSUMPTION_OUTCOMES: readonly QuoteConsumptionOutcome[] = [
  'CURRENT',
  'STALE',
  'UNAVAILABLE',
  'UNMAPPED',
  'MALFORMED_IDENTITY',
];

/**
 * The complete, validated quote value.
 *
 * It is present only when IPD returned a complete canonical D01 envelope. A `bid`/`ask` of
 * `null` is IPD's own honest "depth unavailable" (W-13) and is preserved verbatim — it is
 * NOT a zero.
 */
export interface QuoteConsumptionValue {
  readonly companyId: string;
  readonly symbol: string;
  readonly exchange: string;
  readonly currency: string;
  readonly ltp: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly previousClose: number;
  readonly volume: number;
  readonly change: number;
  readonly pctChange: number;
  /** IPD's canonical depth side. `null` means unavailable, never zero (W-13). */
  readonly bid: number | null;
  /** IPD's canonical depth side. `null` means unavailable, never zero (W-13). */
  readonly ask: number | null;
  readonly vwap?: number;
  readonly turnover?: number;
  readonly tradeCount?: number;
}

/** IPD's provenance for a served quote, carried verbatim for traceability. */
export interface QuoteProvenance {
  readonly sourceClassification: string | null;
  readonly dataVersion: string | null;
  readonly lineageHash: string | null;
  readonly vendorTier: string | null;
  /** W-24: current requester action, from D01. Server-side only. */
  readonly traceId?: string | null;
  /** W-24: original producer action on a cache hit, from D01. Server-side only. */
  readonly correlationId?: string | null;
}

/**
 * One identity's consumption result — the uniform projection every IRR consumer receives.
 *
 * The shape is identical for every outcome, so a consumer reads ONE structure and branches on
 * `outcome`; it never has to infer state from the presence of fields.
 */
export interface QuoteConsumptionEntry {
  /** The outcome. One of the five closed states above. */
  readonly outcome: QuoteConsumptionOutcome;
  /**
   * The identity as requested. Echoed verbatim so a caller can correlate a result with its
   * request even when the identity itself was malformed.
   */
  readonly request: {
    readonly companyId: string | null;
    readonly securityId: string | null;
    readonly exchangeSegment: 'NSE_EQ' | 'BSE_EQ' | null;
  };
  /** The canonical identity the quote was actually requested for, when one was usable. */
  readonly securityId: string | null;
  /** The quote value, or `null`. NEVER a zero-filled placeholder. */
  readonly value: QuoteConsumptionValue | null;
  /** IPD's observation timestamp. `null` when IPD supplied none. */
  readonly asOf: string | null;
  /** The receipt timestamp, when supplied. */
  readonly receivedAt: string | null;
  /** The evaluation timestamp, when supplied. */
  readonly evaluatedAt: string | null;
  /** IPD's canonical quality state, echoed verbatim. `null` when no quote was served. */
  readonly qualityState: string | null;
  /** IRR's freshness vocabulary for THIS identity. `LIVE` is never produced here. */
  readonly freshness: Freshness;
  /** IPD's freshness verdict from the joined D01 status, when it could be read. */
  readonly freshnessVerdict: string | null;
  /** The provider's own qualification, echoed. Never upgraded by IRR. */
  readonly providerQualification: string;
  /** Non-null exactly when the outcome is `UNMAPPED`. */
  readonly unmapped: { readonly code: string; readonly message: string } | null;
  /** Non-null exactly when the outcome is `UNAVAILABLE`. */
  readonly unavailable: {
    readonly code: string;
    readonly message: string;
    /** Whether a transport connection was attempted for this identity. */
    readonly connectionAttempted: boolean;
    /** True when the batch stopped before this identity was attempted (e.g. rate limit). */
    readonly notAttempted: boolean;
  } | null;
  /** Non-null exactly when the outcome is `MALFORMED_IDENTITY`. */
  readonly malformedIdentity: {
    /** The deterministic code: `MISSING_REQUIRED_FIELD` or `MALFORMED_REQUEST`. */
    readonly code: 'MISSING_REQUIRED_FIELD' | 'MALFORMED_REQUEST';
    readonly reason: string;
  } | null;
  /** IPD's provenance for the served quote, when one was served. */
  readonly provenance: QuoteProvenance | null;
  /** IPD's D01 freshness status for this scope, when it could be read. Never implies fresh. */
  readonly freshnessStatus: DhanFreshnessView | null;
  /** Why the freshness status could not be read, when it could not be read. */
  readonly freshnessStatusFailure: { readonly code: string; readonly message: string } | null;
  /** W-24 correlation for this identity. Server-side only: never projected to the browser. */
  readonly trace: IrrActionTrace;
}

/** The batch-level summary a consumer uses for a portfolio- or list-level label. */
export interface QuoteConsumptionBatch {
  /** One entry per requested identity, IN REQUEST ORDER. Partial results are preserved. */
  readonly entries: readonly QuoteConsumptionEntry[];
  /** How many identities were requested. */
  readonly requestedCount: number;
  /** How many entries carry a validated quote (`CURRENT` or `STALE`). */
  readonly pricedCount: number;
  /** Per-outcome counts. Every requested identity is counted exactly once. */
  readonly counts: Readonly<Record<QuoteConsumptionOutcome, number>>;
  /**
   * The worst freshness verdict across the batch, in IRR's vocabulary.
   *
   * `UNAVAILABLE` when any entry is unavailable, unmapped or malformed; `STALE` when any
   * entry is stale; otherwise `SNAPSHOT`; `UNAVAILABLE` for an empty batch. It is NEVER
   * `LIVE`: nothing in IRR can prove live provider connectivity.
   */
  readonly worstFreshness: Freshness;
  /** The provider qualification, published once for the batch. */
  readonly providerQualification: string;
  /** Whether the IPD transport was configured. False means no request was attempted. */
  readonly transportConfigured: boolean;
  /** The deterministic transport configuration failure, when unconfigured. */
  readonly transportFailureCode: string | null;
  /** Whether any quote request in this batch was rate limited by IPD. */
  readonly rateLimited: boolean;
  /** The bounded concurrency this batch used. */
  readonly concurrency: number;
  /** W-24 action correlation shared by every entry in the batch. Server-side only. */
  readonly trace: IrrActionTrace;
}

/** Dependencies of a quote-consumption call. */
export interface QuoteConsumptionDeps {
  /** The server-side environment map. Injected so tests are deterministic. */
  readonly env?: Readonly<Record<string, string | undefined>>;
  /**
   * A pre-resolved transport configuration. When supplied it is used verbatim — this is the
   * seam the synthetic fixtures use to inject a controlled transport.
   */
  readonly transport?: IpdTransportConfigResolution;
  /** An injected fetch implementation, used by the synthetic transport fixtures. */
  readonly fetchImpl?: typeof fetch;
  /** The bounded concurrency for this batch. Clamped to [1, MAX_QUOTE_BATCH_CONCURRENCY]. */
  readonly concurrency?: number;
  /**
   * Whether to read the D01 freshness status alongside each quote. Defaults to true; a
   * caller that already has a status may turn it off. The join NEVER fails a quote.
   */
  readonly joinFreshness?: boolean;
  /**
   * A pre-minted W-24 action context, used by tests and by an upstream IRR action that has
   * already minted one. When absent, the boundary mints a fresh lowercase UUIDv4 itself.
   */
  readonly traceContext?: IpdTraceContext;
}

/* ------------------------------------------------------------------------------------- *
 * Freshness mapping and quote projection
 *
 * These live here, in the shared boundary, because every quote consumer must receive the
 * SAME projection. `dhanMarketDataRoutes` re-exports them so the presentation route and its
 * existing contract tests keep addressing one implementation.
 * ------------------------------------------------------------------------------------- */

/**
 * Maps IPD's canonical freshness onto IRR's vocabulary.
 *
 * THE MAPPING IS DELIBERATELY CONSERVATIVE:
 *   - IPD `CURRENT` maps to IRR `SNAPSHOT`, NOT `LIVE`. IPD's `CURRENT` means "within the
 *     freshness threshold"; it does NOT mean the data came from a live provider.
 *   - IPD `STALE` maps to IRR `STALE`.
 *   - `UNAVAILABLE`, `PARTIAL` and anything unrecognized map to `UNAVAILABLE`.
 *   - IRR `LIVE` is never produced. Nothing here can justify it.
 */
export function mapIpdFreshnessToIrrFreshness(
  quality: string | undefined,
  transportFreshness: 'CURRENT' | 'STALE' | 'UNAVAILABLE' | undefined,
): Freshness {
  if (transportFreshness === 'UNAVAILABLE' || (quality !== 'GOOD' && quality !== 'STALE')) return 'UNAVAILABLE';
  if (transportFreshness === 'STALE' || quality === 'STALE') return 'STALE';
  return 'SNAPSHOT';
}

/** Orders the usable freshness states worst-last, for the join. */
const FRESHNESS_SEVERITY: Readonly<Record<'CURRENT' | 'STALE' | 'UNAVAILABLE', number>> = {
  CURRENT: 0,
  STALE: 1,
  UNAVAILABLE: 2,
};

/** Returns the WORSE of two outcome states. A join may degrade a verdict, never improve it. */
function worseOutcome(
  a: 'CURRENT' | 'STALE' | 'UNAVAILABLE',
  b: 'CURRENT' | 'STALE' | 'UNAVAILABLE',
): 'CURRENT' | 'STALE' | 'UNAVAILABLE' {
  return FRESHNESS_SEVERITY[a] >= FRESHNESS_SEVERITY[b] ? a : b;
}

/** Maps an IRR freshness onto the internal three-state join vocabulary. */
function toJoinState(freshness: Freshness): 'CURRENT' | 'STALE' | 'UNAVAILABLE' {
  switch (freshness) {
    case 'SNAPSHOT':
      return 'CURRENT';
    case 'STALE':
      return 'STALE';
    default:
      return 'UNAVAILABLE';
  }
}

/**
 * The IRR-facing quote view — the projection of IPD's canonical D01 envelope.
 *
 * This is the shape the presentation route publishes and every consumer may render. It
 * carries no credential, no client id, no access token and no daemon address.
 */
export interface DhanQuoteView {
  /** IRR's freshness vocabulary applied to the joined verdict. */
  readonly freshness: Freshness;
  /** IPD's canonical quality state, echoed verbatim. */
  readonly qualityState: string;
  /** The provider observation timestamp (`asOf`), when supplied. */
  readonly asOf: string | null;
  /** The receipt timestamp (`receivedAt`), when supplied. */
  readonly receivedAt: string | null;
  /** The evaluation timestamp (`evaluatedAt`), when supplied. */
  readonly evaluatedAt: string | null;
  /** The canonical quote fields. */
  readonly quote: QuoteConsumptionValue | null;
  /** The canonical security identity the quote was resolved for, when supplied. */
  readonly securityId: string | null;
  /** IPD's provenance classification and lineage digest, when supplied. */
  readonly provenance: QuoteProvenance | null;
  /** The provider's own qualification verdict, echoed verbatim. Never upgraded. */
  readonly providerQualification: string | null;
  /**
   * The provider-side freshness status for the D01 quote scope, when it could be read.
   *
   * A null here NEVER means "fresh" and NEVER means "the quote is current": it means the
   * freshness evidence is unknown, and consumers must report it as such.
   */
  readonly freshnessStatus: DhanFreshnessView | null;
  /** Why the freshness status could not be read, when it could not be read. */
  readonly freshnessStatusFailure: { readonly code: string; readonly message: string } | null;
}

/** D-5 applies to the D01 wire schema, not the shared envelope default or D02. */
function isDepthPrice(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value > 0);
}

/**
 * Fail closed before projection: the transport client checks the outer response, not the
 * canonical envelope. A missing quote field must never become a fabricated zero.
 */
function isCompleteQuoteEnvelope(value: unknown): value is Record<string, unknown> & {
  payload: Record<string, unknown> & { bid: number | null; ask: number | null };
  provenance: Record<string, unknown>;
} {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  if (record.domain !== 'D01_QUOTES') return false;
  if (!record.payload || typeof record.payload !== 'object' || !record.provenance || typeof record.provenance !== 'object') return false;
  const payload = record.payload as Record<string, unknown>;
  const provenance = record.provenance as Record<string, unknown>;
  const { bid, ask } = payload;
  switch (record.schemaVersion) {
    case '1.0.0': // The pinned producer uses the legacy numeric-only contract.
      if (!Number.isFinite(bid) || !Number.isFinite(ask)) return false;
      break;
    case '2.0.0':
      if (!isDepthPrice(bid) || !isDepthPrice(ask)) return false;
      if (bid !== null && ask !== null && bid > ask) return false;
      break;
    default:
      return false;
  }
  return ['companyId', 'symbol', 'exchange', 'currency'].every(key => typeof payload[key] === 'string' && payload[key] !== '')
    && ['ltp', 'open', 'high', 'low', 'previousClose', 'volume', 'change', 'pctChange']
      .every(key => typeof payload[key] === 'number' && Number.isFinite(payload[key]))
    && ['qualityState', 'asOf', 'receivedAt', 'evaluatedAt'].every(key => typeof provenance[key] === 'string' && provenance[key] !== '');
}

/**
 * Projects IPD's canonical quote envelope onto the IRR quote view.
 *
 * `requestedSecurityId` is the canonical identity the caller VALIDATED and sent to IPD. The
 * pinned publication does not echo `securityId` on the quote envelope, so the requested
 * identity is reported for display; the envelope's own value is preferred verbatim when a
 * future publication carries one. Nothing is invented — an absent envelope field with no
 * requested identity stays `null`.
 */
export function projectIpdQuoteEnvelope(
  envelope: unknown,
  transportFreshness: 'CURRENT' | 'STALE' | 'UNAVAILABLE' | undefined,
  requestedSecurityId: string | null = null,
): DhanQuoteView | null {
  if (!isCompleteQuoteEnvelope(envelope)) return null;
  const record = envelope;
  const { payload, provenance } = record;
  const envelopeSecurityId =
    typeof record.securityId === 'string' && record.securityId.trim() !== ''
      ? record.securityId.trim()
      : null;

  // Fail closed if upstream returns a canonical securityId that contradicts the requested
  // canonical identity — never present a quote for another security or series.
  if (
    envelopeSecurityId !== null &&
    requestedSecurityId !== null &&
    envelopeSecurityId !== requestedSecurityId
  ) {
    return null;
  }

  const qualityState = typeof provenance.qualityState === 'string' ? provenance.qualityState : 'UNAVAILABLE';

  return {
    freshness: mapIpdFreshnessToIrrFreshness(qualityState, transportFreshness),
    qualityState,
    asOf: typeof provenance.asOf === 'string' ? provenance.asOf : null,
    receivedAt: typeof provenance.receivedAt === 'string' ? provenance.receivedAt : null,
    evaluatedAt: typeof provenance.evaluatedAt === 'string' ? provenance.evaluatedAt : null,
    quote: {
      companyId: String(payload.companyId ?? record.companyId ?? ''),
      symbol: String(payload.symbol ?? ''),
      exchange: String(payload.exchange ?? ''),
      currency: String(payload.currency ?? ''),
      ltp: Number(payload.ltp),
      open: Number(payload.open),
      high: Number(payload.high),
      low: Number(payload.low),
      previousClose: Number(payload.previousClose),
      volume: Number(payload.volume),
      change: Number(payload.change),
      pctChange: Number(payload.pctChange),
      bid: payload.bid,
      ask: payload.ask,
      ...(typeof payload.vwap === 'number' ? { vwap: payload.vwap } : {}),
      ...(typeof payload.turnover === 'number' ? { turnover: payload.turnover } : {}),
      ...(typeof payload.tradeCount === 'number' ? { tradeCount: payload.tradeCount } : {}),
    },
    securityId:
      typeof record.securityId === 'string' && record.securityId !== ''
        ? record.securityId
        : requestedSecurityId,
    provenance: {
      sourceClassification:
        typeof provenance.sourceClassification === 'string' ? provenance.sourceClassification : null,
      dataVersion: typeof provenance.dataVersion === 'string' ? provenance.dataVersion : null,
      lineageHash: typeof provenance.lineageHash === 'string' ? provenance.lineageHash : null,
      vendorTier: typeof provenance.vendorTier === 'string' ? provenance.vendorTier : null,
      // W-24: carried from D01 verbatim. Only a string is accepted; a malformed value is
      // dropped rather than echoed. These fields never leave the server boundary.
      traceId: typeof provenance.traceId === 'string' ? provenance.traceId : null,
      correlationId: typeof provenance.correlationId === 'string' ? provenance.correlationId : null,
    },
    providerQualification: IRR_PROVIDER_QUALIFICATION,
    freshnessStatus: null,
    freshnessStatusFailure: null,
  };
}

/* ------------------------------------------------------------------------------------- *
 * Identity intake
 * ------------------------------------------------------------------------------------- */

/** A validated canonical identity, ready to send to IPD. */
interface ResolvedIdentity {
  readonly ok: true;
  readonly companyId: string;
  readonly securityId: string;
  readonly isin: string;
  readonly series: string;
  readonly exchangeSegment: 'NSE_EQ' | 'BSE_EQ';
}

interface RejectedIdentity {
  readonly ok: false;
  readonly companyId: string | null;
  readonly securityId: string | null;
  readonly exchangeSegment: 'NSE_EQ' | 'BSE_EQ' | null;
  readonly code: 'MISSING_REQUIRED_FIELD' | 'MALFORMED_REQUEST';
  readonly reason: string;
}

/**
 * Validates one requested identity against the canonical grammar.
 *
 * A malformed identity is REFUSED HERE and never reaches the transport: it is not a
 * market-data question, it is an input defect, and reporting it as unavailable data would
 * hide it.
 */
function resolveIdentityRequest(raw: unknown): ResolvedIdentity | RejectedIdentity {
  const record = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const rawCompanyId = typeof record.companyId === 'string' ? record.companyId.trim() : '';
  const rawSecurityId = typeof record.securityId === 'string' ? record.securityId.trim() : '';
  const rawSegment = record.exchangeSegment;

  if (rawSegment !== undefined && (typeof rawSegment !== 'string' || !EXCHANGE_SEGMENTS.has(rawSegment))) {
    return {
      ok: false,
      companyId: rawCompanyId || null,
      securityId: rawSecurityId || null,
      exchangeSegment: null,
      code: 'MALFORMED_REQUEST',
      reason: 'exchangeSegment must be NSE_EQ or BSE_EQ when supplied.',
    };
  }
  const exchangeSegment = (rawSegment ?? 'NSE_EQ') as 'NSE_EQ' | 'BSE_EQ';

  if (rawCompanyId === '') {
    return {
      ok: false,
      companyId: null,
      securityId: rawSecurityId || null,
      exchangeSegment,
      code: 'MISSING_REQUIRED_FIELD',
      reason: 'companyId is required to request a quote.',
    };
  }
  if (rawSecurityId === '') {
    return {
      ok: false,
      companyId: rawCompanyId,
      securityId: null,
      exchangeSegment,
      code: 'MISSING_REQUIRED_FIELD',
      reason: 'A canonical security identity is required to request a quote (ISIN:<isin>:<series>).',
    };
  }
  if (!D114_SECURITY_ID_PATTERN.test(rawSecurityId)) {
    return {
      ok: false,
      companyId: rawCompanyId,
      securityId: rawSecurityId,
      exchangeSegment,
      code: 'MALFORMED_REQUEST',
      reason: 'The security identity is not a canonical D114 identity (expected ISIN:<isin>:<series>).',
    };
  }

  const [, isin, series] = rawSecurityId.split(':');
  const coherence = validateCanonicalIdentityCoherence({
    isinFromSecurityId: isin!,
    seriesFromSecurityId: series!,
    exchangeSegment,
    rawIsin: record.isin,
    rawSeries: record.series,
    rawExchange: record.exchange,
  });
  if (!coherence.ok) {
    return {
      ok: false,
      companyId: rawCompanyId,
      securityId: rawSecurityId,
      exchangeSegment,
      code: coherence.code,
      reason: coherence.message,
    };
  }
  return { ok: true, companyId: rawCompanyId, securityId: rawSecurityId, isin: isin!.toUpperCase(), series: series!, exchangeSegment };
}

/**
 * Rebuilds the D114 identity OBJECT shape IPD's client expects from the already-validated
 * canonical string. The identity is not reinterpreted, relaxed or re-derived.
 */
function toTransportIdentity(identity: ResolvedIdentity): {
  securityId: string;
  isin: string;
  series: string;
  isinAuthority: 'NON_AUTHORITATIVE';
} {
  return {
    securityId: identity.securityId,
    isin: identity.isin,
    series: identity.series,
    isinAuthority: 'NON_AUTHORITATIVE',
  };
}

/* ------------------------------------------------------------------------------------- *
 * Bounded concurrency
 * ------------------------------------------------------------------------------------- */

/**
 * Runs `worker` over `items` with at most `concurrency` workers in flight.
 *
 * The pool is the ONLY concurrency control in the boundary: it is what stops a 200-item
 * watchlist from becoming a 200-request storm. Results are returned in INPUT ORDER so a
 * consumer can correlate entry N with request N regardless of completion order.
 */
async function runBounded<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const width = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(
    Array.from({ length: width }, async () => {
      for (;;) {
        const index = next++;
        if (index >= items.length) return;
        results[index] = await worker(items[index]!, index);
      }
    }),
  );
  return results;
}

/** Clamps a requested concurrency into the supported bounds. */
function normaliseConcurrency(requested: number | undefined): number {
  if (requested === undefined || !Number.isFinite(requested)) return DEFAULT_QUOTE_BATCH_CONCURRENCY;
  const floored = Math.floor(requested);
  if (floored < 1) return 1;
  return Math.min(floored, MAX_QUOTE_BATCH_CONCURRENCY);
}

/* ------------------------------------------------------------------------------------- *
 * Entry constructors — one per outcome, so no shape is assembled ad hoc
 * ------------------------------------------------------------------------------------- */

function malformedEntry(
  rejected: RejectedIdentity,
  request: QuoteConsumptionEntry['request'],
  trace: IrrActionTrace,
): QuoteConsumptionEntry {
  return {
    request,
    providerQualification: IRR_PROVIDER_QUALIFICATION,
    outcome: 'MALFORMED_IDENTITY',
    securityId: rejected.securityId,
    value: null,
    asOf: null,
    receivedAt: null,
    evaluatedAt: null,
    qualityState: null,
    freshness: 'UNAVAILABLE',
    freshnessVerdict: null,
    unmapped: null,
    unavailable: null,
    malformedIdentity: { code: rejected.code, reason: rejected.reason },
    provenance: null,
    freshnessStatus: null,
    freshnessStatusFailure: null,
    trace,
  };
}

function unavailableEntry(
  request: QuoteConsumptionEntry['request'],
  securityId: string | null,
  failure: {
    readonly code: string;
    readonly message: string;
    readonly connectionAttempted: boolean;
    readonly notAttempted: boolean;
  },
  trace: IrrActionTrace,
  freshness: {
    readonly status: DhanFreshnessView | null;
    readonly failure: { readonly code: string; readonly message: string } | null;
  } = { status: null, failure: null },
): QuoteConsumptionEntry {
  return {
    request,
    providerQualification: IRR_PROVIDER_QUALIFICATION,
    outcome: 'UNAVAILABLE',
    securityId,
    value: null,
    asOf: null,
    receivedAt: null,
    evaluatedAt: null,
    qualityState: null,
    // An unavailable observation is never presented as fresh.
    freshness: 'UNAVAILABLE',
    freshnessVerdict: freshness.status?.verdict ?? null,
    unmapped: null,
    unavailable: {
      code: failure.code,
      message: failure.message,
      connectionAttempted: failure.connectionAttempted,
      notAttempted: failure.notAttempted,
    },
    malformedIdentity: null,
    provenance: null,
    freshnessStatus: freshness.status,
    freshnessStatusFailure: freshness.failure,
    trace,
  };
}

function unmappedEntry(
  request: QuoteConsumptionEntry['request'],
  securityId: string | null,
  failure: { readonly code: string; readonly message: string },
  trace: IrrActionTrace,
  freshness: {
    readonly status: DhanFreshnessView | null;
    readonly failure: { readonly code: string; readonly message: string } | null;
  } = { status: null, failure: null },
): QuoteConsumptionEntry {
  return {
    request,
    providerQualification: IRR_PROVIDER_QUALIFICATION,
    outcome: 'UNMAPPED',
    securityId,
    value: null,
    asOf: null,
    receivedAt: null,
    evaluatedAt: null,
    qualityState: null,
    freshness: 'UNAVAILABLE',
    freshnessVerdict: freshness.status?.verdict ?? null,
    unmapped: { code: failure.code, message: failure.message },
    unavailable: null,
    malformedIdentity: null,
    provenance: null,
    freshnessStatus: freshness.status,
    freshnessStatusFailure: freshness.failure,
    trace,
  };
}

/* ------------------------------------------------------------------------------------- *
 * The boundary
 * ------------------------------------------------------------------------------------- */

/** The outcome of reading the D01 freshness status for one identity scope. */
interface FreshnessRead {
  readonly status: DhanFreshnessView | null;
  readonly failure: { readonly code: string; readonly message: string } | null;
}

/**
 * Reads IPD's D01 freshness status for one identity scope.
 *
 * The read is supplementary and NEVER fails the quote: if it cannot be read the quote is
 * still returned and the failure is reported beside it. It also never triggers a refresh —
 * IPD's endpoint is a read-only status lookup.
 */
async function readQuoteFreshness(
  config: IpdMarketDataTransportConfig,
  identity: ResolvedIdentity,
  deps: QuoteConsumptionDeps,
  traceContext: IpdTraceContext,
): Promise<FreshnessRead> {
  const outcome = await readIpdFreshnessStatus(
    config,
    {
      domain: 'D01_QUOTES',
      companyId: identity.companyId,
      exchangeSegment: identity.exchangeSegment,
      securityId: identity.securityId,
    },
    deps.fetchImpl,
    traceContext,
  );
  if (!outcome.ok) return { status: null, failure: { code: outcome.code, message: outcome.message } };
  return { status: projectIpdFreshnessStatus(outcome.status), failure: null };
}

/**
 * Consumes a batch of canonical security identities through IPD's existing transport.
 *
 * This is THE IRR quote-consumption entry point. It performs no caching, no normalization
 * and no provider access of its own; it composes IPD's transport under a bounded pool,
 * joins IPD's freshness evidence, and returns one uniform projection per identity.
 *
 * The returned batch ALWAYS has one entry per requested identity, in request order. A
 * partial failure never removes an entry, never substitutes a neighbouring price and never
 * turns a missing price into zero.
 */
export async function consumeQuotes(
  identities: readonly unknown[],
  deps: QuoteConsumptionDeps = {},
): Promise<QuoteConsumptionBatch> {
  const startedAt = Date.now();
  const concurrency = normaliseConcurrency(deps.concurrency);
  const joinFreshness = deps.joinFreshness !== false;
  // W-24: one action id per IRR application action. An injected context is validated before
  // use; anything else is minted here with IPD's lowercase UUIDv4 generator.
  const traceContext =
    deps.traceContext !== undefined && isIrrActionContext(deps.traceContext)
      ? deps.traceContext
      : createIrrActionContext();
  const actionId = traceContext.actionId;
  const initialTrace = correlateIrrAction({ actionId });

  recordIrrEvent({
    operation: 'QUOTE',
    event: 'ACTION_START',
    actionId,
    outcome: 'UNKNOWN',
    durationMs: 0,
  });

  // Normalise every request first: a malformed identity is refused before any transport use.
  const resolved = identities.map((raw) => resolveIdentityRequest(raw));
  const requests: QuoteConsumptionEntry['request'][] = resolved.map((item) => ({
    companyId: item.companyId,
    securityId: item.securityId,
    exchangeSegment: item.exchangeSegment,
  }));

  const resolution = deps.transport ?? resolveIpdMarketDataTransportConfig(deps.env ?? {});

  // Not configured: NOTHING is attempted, and every entry says so explicitly. The failed
  // action is still ring-traceable, because a pre-IPD failure is the case W-24 must explain.
  if (!resolution.ok) {
    const entries = resolved.map((item, index) =>
      item.ok
        ? unavailableEntry(requests[index]!, item.securityId, {
            code: resolution.code,
            message: resolution.message,
            connectionAttempted: false,
            notAttempted: true,
          }, initialTrace)
        : malformedEntry(item, requests[index]!, initialTrace),
    );
    recordIrrEvent({
      operation: 'QUOTE',
      event: 'ACTION_END',
      actionId,
      outcome: 'FAILURE',
      failureCategory: resolution.code,
      durationMs: Date.now() - startedAt,
    });
    return summarise(entries, {
      concurrency,
      transportConfigured: false,
      transportFailureCode: resolution.code,
      rateLimited: false,
      trace: initialTrace,
    });
  }

  const config = resolution.config;
  const client = createIpdMarketDataTransportClient(
    config,
    deps.fetchImpl ? { fetchImpl: deps.fetchImpl } : undefined,
  );

  // Shared stop flag: set when IPD rate limits, so no further quote request is dispatched.
  let rateLimited = false;

  const entries = await runBounded(resolved, concurrency, async (item, index): Promise<QuoteConsumptionEntry> => {
    const request = requests[index]!;
    if (!item.ok) return malformedEntry(item, request, initialTrace);

    // The rate limit stops the batch BEFORE any new request is issued. The identity is
    // reported as explicitly not attempted — never as unavailable data, never as zero.
    if (rateLimited) {
      return unavailableEntry(request, item.securityId, {
        code: 'RATE_LIMITED',
        message: 'The batch stopped dispatching quote requests after IPD reported a rate limit.',
        connectionAttempted: false,
        notAttempted: true,
      }, initialTrace);
    }

    recordIrrEvent({
      operation: 'QUOTE',
      event: 'REQUEST_ADMITTED',
      actionId,
      outcome: 'UNKNOWN',
      durationMs: 0,
    });

    const outcome = await client.getQuote({
      companyId: item.companyId,
      securityIdentity: toTransportIdentity(item),
      exchangeSegment: item.exchangeSegment,
    }, traceContext);

    if (!outcome.ok) {
      const failure = outcome.failure;
      // Freshness is still read for an identity failure so the consumer receives a complete
      // scoped record, but a failure NEVER waits on it in a way that changes the outcome.
      const freshness = joinFreshness ? await readQuoteFreshness(config, item, deps, traceContext) : { status: null, failure: null };
      if (failure.code === 'RATE_LIMITED') {
        rateLimited = true;
        return unavailableEntry(request, item.securityId, {
          code: failure.code,
          message: failure.message,
          connectionAttempted: true,
          notAttempted: false,
        }, initialTrace, freshness);
      }
      if (IDENTITY_UNMAPPED_CODES.has(failure.code)) {
        return unmappedEntry(request, item.securityId, failure, initialTrace, freshness);
      }
      // Every other failure is market data being unavailable, including a suppressed or
      // unrecognized provider state. It is never promoted.
      return unavailableEntry(request, item.securityId, {
        code: failure.code,
        message: failure.message,
        connectionAttempted: true,
        notAttempted: false,
      }, initialTrace, freshness);
    }

    const view = projectIpdQuoteEnvelope(outcome.envelope, outcome.freshness, item.securityId);
    if (view === null || view.quote === null) {
      // The transport answered, but not with a usable canonical quote. No value is invented.
      const freshness = joinFreshness ? await readQuoteFreshness(config, item, deps, traceContext) : { status: null, failure: null };
      return unavailableEntry(request, item.securityId, {
        code: 'MALFORMED_RESPONSE',
        message: 'market-data transport returned an invalid or unsupported D01 quote envelope',
        connectionAttempted: true,
        notAttempted: false,
      }, initialTrace, freshness);
    }

    const freshness = joinFreshness ? await readQuoteFreshness(config, item, deps, traceContext) : { status: null, failure: null };

    // THE JOIN.
    //
    // The quote's own verdict is the baseline, and the provider-side D01 status for THIS
    // identity scope is applied as a conservative CORRECTION that can only make the answer
    // less confident:
    //
    //   - A status that says STALE is positive evidence that the observation is past its
    //     threshold. It degrades CURRENT to STALE. A stale price is never presented as
    //     current.
    //   - A status that is UNAVAILABLE / UNKNOWN is NOT treated as a contradiction. IPD's
    //     D01 status describes its CACHE; a quote answered by the provider may legitimately
    //     have no cache entry, and suppressing a genuine observation on a cache miss would
    //     report real market data as unavailable — the mirror image of inventing a price.
    //     The verdict is carried verbatim in `freshnessVerdict` and the whole status in
    //     `freshnessStatus`, so a consumer sees exactly what IPD said.
    //   - An unreadable status changes nothing and is reported with its failure.
    //
    // In every case the status can only worsen the verdict, never improve it.
    const quoteState = toJoinState(view.freshness);
    const statusVerdict = freshness.status?.verdict ?? null;
    const statusSaysStale = statusVerdict === 'STALE' || freshness.status?.cacheState === 'STALE';
    const joined = statusSaysStale ? worseOutcome(quoteState, 'STALE') : quoteState;

    return {
      request,
      providerQualification: IRR_PROVIDER_QUALIFICATION,
      outcome: joined === 'CURRENT' ? 'CURRENT' : joined === 'STALE' ? 'STALE' : 'UNAVAILABLE',
      securityId: item.securityId,
      value: view.quote,
      asOf: view.asOf,
      receivedAt: view.receivedAt,
      evaluatedAt: view.evaluatedAt,
      qualityState: view.qualityState,
      freshness: joined === 'CURRENT' ? 'SNAPSHOT' : joined === 'STALE' ? 'STALE' : 'UNAVAILABLE',
      freshnessVerdict: freshness.status?.verdict ?? null,
      unmapped: null,
      unavailable: null,
      malformedIdentity: null,
      provenance: view.provenance,
      freshnessStatus: freshness.status,
      freshnessStatusFailure: freshness.failure,
      trace: initialTrace,
    };
  });

  // W-24: read IPD's bounded ring ONCE per batch and correlate by the shared action id.
  // A failed ring read never changes the quote outcome; it is reported as a trace gap.
  let ipdEvents: readonly IrrW24Event[] = [];
  let ringReadFailureCode: string | null = null;
  const attempted = entries.some((entry) => entry.unavailable?.connectionAttempted === true);
  const answered = entries.some((entry) =>
    entry.outcome === 'CURRENT' ||
    entry.outcome === 'STALE' ||
    entry.outcome === 'UNMAPPED' ||
    (entry.unavailable?.connectionAttempted === true &&
      entry.unavailable.code !== 'TIMEOUT' &&
      entry.unavailable.code !== 'REQUEST_TIMEOUT' &&
      entry.unavailable.code !== 'TRANSPORT_FAILURE'),
  );
  if (answered) {
    const ring = await readIpdTraceEventsForAction(config, actionId, deps.fetchImpl);
    if (ring.ok) ipdEvents = ring.events;
    else ringReadFailureCode = ring.code;
  } else if (attempted) {
    // A hung or unreachable daemon cannot answer a second read. The failed action remains
    // in IRR's ring; the IPD ring read is explicitly skipped rather than retried.
    ringReadFailureCode = 'RING_READ_SKIPPED_TRANSPORT_FAILURE';
  }

  const tracedEntries = entries.map((entry) => ({
    ...entry,
    trace: correlateIrrAction({
      actionId,
      d01TraceId: entry.provenance?.traceId ?? null,
      d01CorrelationId: entry.provenance?.correlationId ?? null,
      ipdEvents,
      ringReadFailureCode,
    }),
  }));

  const failed = tracedEntries.some((entry) => entry.outcome !== 'CURRENT' && entry.outcome !== 'STALE');
  const failureCode = tracedEntries.find((entry) => entry.outcome !== 'CURRENT' && entry.outcome !== 'STALE');
  recordIrrEvent({
    operation: 'QUOTE',
    event: 'ACTION_END',
    actionId,
    outcome: failed ? 'FAILURE' : 'SUCCESS',
    failureCategory:
      failureCode?.unavailable?.code ??
      failureCode?.unmapped?.code ??
      failureCode?.malformedIdentity?.code ??
      null,
    durationMs: Date.now() - startedAt,
  });

  const firstTrace = tracedEntries[0]?.trace ?? initialTrace;
  const batchTrace = {
    ...firstTrace,
    d01TraceId: tracedEntries.find((entry) => entry.provenance?.traceId != null)?.provenance?.traceId ?? null,
    d01CorrelationId: tracedEntries.find((entry) => entry.provenance?.correlationId != null)?.provenance?.correlationId ?? null,
    identifierConsistent: tracedEntries.every((entry) => entry.trace.identifierConsistent),
  };

  return summarise(tracedEntries, {
    concurrency,
    transportConfigured: true,
    transportFailureCode: null,
    rateLimited,
    trace: batchTrace,
  });
}

/** Builds the batch summary from the entries. Every requested identity is counted once. */
function summarise(
  entries: readonly QuoteConsumptionEntry[],
  meta: {
    readonly concurrency: number;
    readonly transportConfigured: boolean;
    readonly transportFailureCode: string | null;
    readonly rateLimited: boolean;
    readonly trace: IrrActionTrace;
  },
): QuoteConsumptionBatch {
  const counts: Record<QuoteConsumptionOutcome, number> = {
    CURRENT: 0,
    STALE: 0,
    UNAVAILABLE: 0,
    UNMAPPED: 0,
    MALFORMED_IDENTITY: 0,
  };
  let pricedCount = 0;
  for (const entry of entries) {
    counts[entry.outcome] += 1;
    if (entry.outcome === 'CURRENT' || entry.outcome === 'STALE') pricedCount += 1;
  }

  // The worst-case batch freshness: a batch is only as trustworthy as its weakest member.
  let worstFreshness: Freshness;
  if (entries.length === 0) worstFreshness = 'UNAVAILABLE';
  else if (counts.UNAVAILABLE > 0 || counts.UNMAPPED > 0 || counts.MALFORMED_IDENTITY > 0) worstFreshness = 'UNAVAILABLE';
  else if (counts.STALE > 0) worstFreshness = 'STALE';
  else worstFreshness = 'SNAPSHOT';

  return {
    entries,
    requestedCount: entries.length,
    pricedCount,
    counts,
    worstFreshness,
    providerQualification: IRR_PROVIDER_QUALIFICATION,
    transportConfigured: meta.transportConfigured,
    transportFailureCode: meta.transportFailureCode,
    rateLimited: meta.rateLimited,
    concurrency: meta.concurrency,
    trace: meta.trace,
  };
}

/**
 * Consumes ONE canonical identity and returns its entry, for the single-quote presentation
 * route and any consumer that needs exactly one price.
 *
 * It is a thin composition of `consumeQuotes` — there is no second request path — and it
 * returns `null` only when the batch produced no entry at all (an empty request), never to
 * mean "unavailable".
 */
export async function consumeQuote(
  identity: unknown,
  deps: QuoteConsumptionDeps = {},
): Promise<QuoteConsumptionEntry | null> {
  const batch = await consumeQuotes([identity], deps);
  return batch.entries[0] ?? null;
}
