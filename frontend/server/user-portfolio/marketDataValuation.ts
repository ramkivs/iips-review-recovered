/**
 * Read-only quote consumer and valuation projection for G-2 user portfolios.
 *
 * IRR consumes only IPD's authenticated MarketDataTransportClient. It never
 * constructs provider objects, persists quote results, caches them, or retries.
 * A holding is quote-requestable only when G-2 returns an explicit, valid,
 * persisted D114 securityIdentity and P04 identity disposition; IPD then owns
 * exact P6/P7 company + segment + ISIN + series resolution.
 */
import {
  MARKET_DATA_TRANSPORT_TOKEN_ENV,
  MarketDataTransportClient,
} from 'iips-production-market-data/dhan-server';
import type {
  QuoteRequest,
  QuoteResponse,
  ServiceHealth,
} from 'iips-production-market-data/dhan-server';
import type { G2HoldingView, G2PortfolioView } from './userPortfolioContract.js';

export const MARKET_DATA_TRANSPORT_URL_ENV = 'IIPS_MARKET_DATA_TRANSPORT_URL';
export const DEFAULT_MARKET_DATA_CLIENT_TIMEOUT_MS = 12_000;

export type QuoteFreshness = 'CURRENT' | 'STALE';
export type HoldingIdentityDisposition =
  | 'QUOTE_ELIGIBLE'
  | 'IDENTITY_MISSING'
  | 'IDENTITY_INVALID'
  | 'IDENTITY_AMBIGUOUS'
  | 'NO_QUALIFIED_DHAN_MAPPING'
  | 'TRANSPORT_UNAVAILABLE'
  | 'OTHER_BLOCKED';
export type HoldingPricingStatus = QuoteFreshness | 'UNAVAILABLE' | 'UNRESOLVED' | 'INACTIVE';
export type PortfolioCoverageStatus = 'EMPTY' | 'FULLY_PRICED' | 'PARTIALLY_PRICED' | 'NO_HOLDINGS_PRICED';
export type PortfolioFreshnessStatus = 'CURRENT' | 'STALE' | 'MIXED' | 'UNAVAILABLE' | 'NONE';

/** Canonical, provider-neutral D01 envelope fields admitted to the browser DTO. */
export interface PublicCanonicalQuoteEnvelope {
  readonly envelopeId: string;
  readonly domain: 'D01_QUOTES';
  readonly mode: 'LIVE' | 'SNAPSHOT' | 'PIT';
  readonly companyId: string;
  readonly securityId?: string;
  readonly payload: {
    readonly companyId: string;
    readonly symbol: string;
    readonly exchange: 'NSE' | 'BSE';
    readonly currency: 'INR' | 'USD';
    readonly bid: number;
    readonly ask: number;
    readonly ltp: number;
    readonly open: number;
    readonly high: number;
    readonly low: number;
    readonly close?: number;
    readonly previousClose: number;
    readonly volume: number;
    readonly vwap?: number;
    readonly turnover?: number;
    readonly change: number;
    readonly pctChange: number;
    readonly tradeCount?: number;
    readonly securityIdentity?: {
      readonly securityId: string;
      readonly isin: string;
      readonly series: string;
      readonly isinAuthority: 'NON_AUTHORITATIVE';
    };
  };
  readonly provenance: {
    readonly sourceClassification: string;
    readonly vendorTier: string;
    readonly asOf: string;
    readonly receivedAt: string;
    readonly evaluatedAt: string;
    readonly dataVersion: string;
    readonly lineageHash: string;
    readonly qualityState: 'GOOD' | 'STALE' | 'PARTIAL' | 'UNAVAILABLE';
    readonly quarantineReason?: string;
  };
  readonly timestamp: string;
  readonly schemaVersion: string;
}

export interface UserPortfolioValuationHolding {
  readonly position: number;
  readonly symbol: string;
  readonly quantity: number | null;
  readonly active: boolean;
  readonly pricingStatus: HoldingPricingStatus;
  readonly identityStatus: 'RESOLVED' | 'UNRESOLVED';
  readonly identityDisposition: HoldingIdentityDisposition;
  readonly currentMarketPrice: number | null;
  readonly marketValue: number | null;
  readonly investedValue: number | null;
  readonly unrealizedGainLoss: number | null;
  readonly unrealizedGainLossPercentage: number | null;
  /** Exact canonical observation instant; never replaced with request/cache time. */
  readonly quoteAsOf: string | null;
  readonly quote?: PublicCanonicalQuoteEnvelope;
  readonly reasonCode?: string;
  readonly reason?: string;
}

export interface UserPortfolioValuation {
  readonly status: PortfolioCoverageStatus;
  readonly freshness: PortfolioFreshnessStatus;
  readonly coverage: {
    readonly activeHoldingCount: number;
    readonly pricedHoldingCount: number;
    readonly unpricedHoldingCount: number;
    readonly staleHoldingCount: number;
    readonly unavailableHoldingCount: number;
    readonly unresolvedHoldingCount: number;
    readonly inactiveHoldingCount: number;
  };
  /** Set only when every active holding is priced. */
  readonly portfolioMarketValue: number | null;
  /** If partial, explicitly a subtotal of priced positions, never the portfolio total. */
  readonly pricedMarketValueSubtotal: number | null;
  /** Set only when cost basis exists for every active holding. */
  readonly investedValue: number | null;
  /** Set only for a fully priced portfolio with complete, valid cost basis. */
  readonly unrealizedGainLoss: number | null;
  readonly unrealizedGainLossPercentage: number | null;
  readonly provider: {
    readonly transport: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
    readonly qualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED' | 'UNKNOWN_NOT_LIVE_QUALIFIED';
    readonly liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS' | 'UNKNOWN';
    readonly disclosure: string;
  };
  readonly holdings: readonly UserPortfolioValuationHolding[];
}

export interface MarketDataRuntimeOptions {
  /** Shortened only by deterministic tests; production uses the exported default. */
  readonly requestTimeoutMs?: number;
}

interface SecurityRequest {
  readonly ok: true;
  readonly request: QuoteRequest;
}
interface SecurityRefusal {
  readonly ok: false;
  readonly code: string;
  readonly reason: string;
  readonly disposition: Exclude<HoldingIdentityDisposition, 'QUOTE_ELIGIBLE'>;
}
type SecurityResolution = SecurityRequest | SecurityRefusal;

type UpstreamCanonicalEnvelope = Extract<QuoteResponse, { ok: true }>['envelope'];

interface QuoteSuccess {
  readonly ok: true;
  readonly freshness: QuoteFreshness;
  /** Exact IPD canonical envelope retained server-side for the projection operation. */
  readonly sourceEnvelope: UpstreamCanonicalEnvelope;
  /** Explicitly allowlisted canonical projection; no provider DTOs or internals. */
  readonly envelope: PublicCanonicalQuoteEnvelope;
  readonly price: number;
}
interface QuoteFailure {
  readonly ok: false;
  readonly code: string;
  readonly reason: string;
  readonly disposition?: Exclude<HoldingIdentityDisposition, 'QUOTE_ELIGIBLE'>;
}
type QuoteOutcome = QuoteSuccess | QuoteFailure;

interface ProviderHealthView {
  readonly transport: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
  readonly qualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED' | 'UNKNOWN_NOT_LIVE_QUALIFIED';
  readonly liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS' | 'UNKNOWN';
  readonly disclosure: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

function isD114SecurityIdentity(value: unknown): value is QuoteRequest['securityIdentity'] {
  if (!isRecord(value)) return false;
  const isin = value.isin;
  const series = value.series;
  const securityId = value.securityId;
  return typeof isin === 'string' && isin === isin.trim() && /^[A-Za-z0-9]{12}$/.test(isin) &&
    typeof series === 'string' && series.length > 0 && series === series.trim() && !series.includes(':') &&
    value.isinAuthority === 'NON_AUTHORITATIVE' && securityId === `ISIN:${isin}:${series}`;
}

function refusal(
  code: string,
  reason: string,
  disposition: Exclude<HoldingIdentityDisposition, 'QUOTE_ELIGIBLE'>,
): SecurityRefusal {
  return { ok: false, code, reason, disposition };
}

function resolveHoldingSecurity(holding: G2HoldingView): SecurityResolution {
  const rawIdentity: unknown = holding.securityIdentity;
  if (rawIdentity === undefined || rawIdentity === null) {
    return refusal('IDENTITY_MISSING', 'No durable D114 security identity is stored for this holding; no identity was inferred.', 'IDENTITY_MISSING');
  }
  if (!isD114SecurityIdentity(rawIdentity)) {
    return refusal('IDENTITY_INVALID', 'The stored security identity does not conform to the canonical D114 ISIN-and-series contract.', 'IDENTITY_INVALID');
  }
  if (holding.identityStatus !== 'RESOLVED' || holding.resolutionDisposition !== 'CANONICAL_P04') {
    return refusal('IDENTITY_AMBIGUOUS', 'The stored security identity is not accompanied by a resolved canonical P04 disposition.', 'IDENTITY_AMBIGUOUS');
  }
  if (typeof holding.companyId !== 'string' || holding.companyId.trim().length === 0) {
    return refusal('IDENTITY_INVALID', 'Canonical company identity is missing.', 'IDENTITY_INVALID');
  }
  if (holding.isin !== undefined && (typeof holding.isin !== 'string' || holding.isin.trim().toUpperCase() !== rawIdentity.isin.toUpperCase())) {
    return refusal('IDENTITY_INVALID', 'The separately persisted ISIN conflicts with the D114 security identity.', 'IDENTITY_INVALID');
  }
  if (holding.exchange !== undefined && holding.exchange !== 'NSE' && holding.exchange !== 'BSE') {
    return refusal('IDENTITY_INVALID', 'The persisted exchange is not an admissible NSE or BSE listing.', 'IDENTITY_INVALID');
  }
  const request: QuoteRequest = {
    companyId: holding.companyId,
    securityIdentity: rawIdentity,
    ...(holding.exchange === 'NSE' ? { exchangeSegment: 'NSE_EQ' as const } : {}),
    ...(holding.exchange === 'BSE' ? { exchangeSegment: 'BSE_EQ' as const } : {}),
  };
  return { ok: true, request };
}

export interface MarketDataTransportConfiguration {
  readonly ok: true;
  readonly baseUrl: string;
  readonly token: string;
}
export interface MarketDataTransportConfigurationFailure {
  readonly ok: false;
  readonly code: 'TRANSPORT_NOT_CONFIGURED' | 'TRANSPORT_URL_INVALID';
  readonly reason: string;
}
export type MarketDataTransportConfigurationResult =
  | MarketDataTransportConfiguration
  | MarketDataTransportConfigurationFailure;

/** Reads only server-owned environment values; neither value is accepted from a request. */
export function readMarketDataTransportConfiguration(
  env: NodeJS.ProcessEnv = process.env,
): MarketDataTransportConfigurationResult {
  const rawUrl = env[MARKET_DATA_TRANSPORT_URL_ENV];
  const token = env[MARKET_DATA_TRANSPORT_TOKEN_ENV];
  if (typeof rawUrl !== 'string' || rawUrl.trim().length === 0 || typeof token !== 'string' || token.length === 0) {
    return {
      ok: false,
      code: 'TRANSPORT_NOT_CONFIGURED',
      reason: 'Server-side IPD market-data transport URL and token must both be configured.',
    };
  }
  if (token !== token.trim() || /[\x00-\x20\x7F]/.test(token)) {
    return { ok: false, code: 'TRANSPORT_NOT_CONFIGURED', reason: 'Server-side transport token configuration is invalid.' };
  }
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, code: 'TRANSPORT_URL_INVALID', reason: 'Server-side market-data transport URL is invalid.' };
  }
  const loopbackHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '[::1]';
  if (
    (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && loopbackHost)) ||
    parsed.username !== '' || parsed.password !== '' || parsed.search !== '' || parsed.hash !== ''
  ) {
    return { ok: false, code: 'TRANSPORT_URL_INVALID', reason: 'Transport URL must use HTTPS (or HTTP loopback) without embedded credentials or query data.' };
  }
  return { ok: true, baseUrl: parsed.toString().replace(/\/+$/, ''), token };
}

function safeProviderFailure(code: unknown, message?: unknown): QuoteFailure {
  const upstreamCode = typeof code === 'string' ? code : '';
  if (upstreamCode === 'UNAUTHENTICATED') {
    return { ok: false, code: 'TRANSPORT_AUTHENTICATION_FAILED', reason: 'The authenticated IPD transport rejected server authentication.', disposition: 'TRANSPORT_UNAVAILABLE' };
  }
  if (upstreamCode === 'REQUEST_TIMEOUT' || upstreamCode === 'TIMEOUT') {
    return { ok: false, code: 'TRANSPORT_TIMEOUT', reason: 'The IPD market-data request timed out.', disposition: 'TRANSPORT_UNAVAILABLE' };
  }
  if (upstreamCode === 'TRANSPORT_FAILURE') {
    return { ok: false, code: 'TRANSPORT_UNAVAILABLE', reason: 'The IPD market-data service could not reach its upstream transport.', disposition: 'TRANSPORT_UNAVAILABLE' };
  }
  if (upstreamCode === 'UNRESOLVED_INSTRUMENT') {
    const resolutionReason = typeof message === 'string'
      ? /^(NO_MAPPING_DATA_LOADED|UNMAPPED_COMPANY_ID|INSTRUMENT_INACTIVE|AMBIGUOUS_MAPPING)(?::|$)/.exec(message)?.[1]
      : undefined;
    if (resolutionReason === 'AMBIGUOUS_MAPPING') {
      return { ok: false, code: 'IDENTITY_AMBIGUOUS', reason: 'IPD found more than one exact listing candidate; no quote was requested.', disposition: 'IDENTITY_AMBIGUOUS' };
    }
    return { ok: false, code: 'NO_QUALIFIED_DHAN_MAPPING', reason: 'IPD has no active exact qualified Dhan mapping for this canonical security and listing.', disposition: 'NO_QUALIFIED_DHAN_MAPPING' };
  }
  if (upstreamCode === 'IDENTITY_RESOLUTION_FAILURE') {
    return { ok: false, code: 'IDENTITY_AMBIGUOUS', reason: 'IPD could not establish an unambiguous exact canonical security mapping.', disposition: 'IDENTITY_AMBIGUOUS' };
  }
  if (upstreamCode === 'MISSING_REQUIRED_FIELD') {
    return { ok: false, code: 'IDENTITY_INVALID', reason: 'IPD rejected the canonical quote request because a required identity field was invalid or absent.', disposition: 'IDENTITY_INVALID' };
  }
  if (upstreamCode === 'RATE_LIMITED') {
    return { ok: false, code: 'PROVIDER_THROTTLED', reason: 'The IPD market-data service deferred this quote request.', disposition: 'OTHER_BLOCKED' };
  }
  if (upstreamCode === 'CREDENTIALS_UNAVAILABLE' || upstreamCode === 'CONFIGURATION_INCOMPLETE') {
    return { ok: false, code: 'PROVIDER_NOT_CONFIGURED', reason: 'The IPD provider is not configured for this request.', disposition: 'OTHER_BLOCKED' };
  }
  return { ok: false, code: 'PROVIDER_UNAVAILABLE', reason: 'The IPD market-data service did not provide a usable quote.', disposition: 'OTHER_BLOCKED' };
}

function safeEnvelope(value: unknown, freshnessValue: unknown, expected: QuoteRequest): QuoteSuccess | QuoteFailure {
  if (!isRecord(value) || value.domain !== 'D01_QUOTES' || !isRecord(value.payload) || !isRecord(value.provenance)) {
    return { ok: false, code: 'MALFORMED_CANONICAL_RESPONSE', reason: 'The IPD response was not a canonical D01 quote envelope.' };
  }
  const payload = value.payload;
  const provenance = value.provenance;
  // IPD's QuoteRequest defaults an omitted segment to NSE_EQ; validate the
  // canonical response against that same documented server contract.
  const expectedExchange = expected.exchangeSegment === 'BSE_EQ' ? 'BSE' : 'NSE';
  const requiredQuoteNumbers = ['bid', 'ask', 'ltp', 'open', 'high', 'low', 'previousClose', 'volume', 'change', 'pctChange'];
  const optionalQuoteNumbers = ['close', 'vwap', 'turnover', 'tradeCount'];
  const nonnegativeQuoteNumbers = ['bid', 'ask', 'ltp', 'open', 'high', 'low', 'previousClose', 'volume', 'close', 'vwap', 'turnover', 'tradeCount'];
  if (
    value.companyId !== expected.companyId || payload.companyId !== expected.companyId ||
    payload.exchange !== expectedExchange || typeof payload.symbol !== 'string' || payload.symbol.trim().length === 0 ||
    (payload.currency !== 'INR' && payload.currency !== 'USD') ||
    requiredQuoteNumbers.some((key) => !isFiniteNumber(payload[key])) ||
    optionalQuoteNumbers.some((key) => payload[key] !== undefined && !isFiniteNumber(payload[key])) ||
    nonnegativeQuoteNumbers.some((key) => payload[key] !== undefined && isFiniteNumber(payload[key]) && payload[key] < 0) ||
    !isFiniteNumber(payload.ltp) || payload.ltp <= 0
  ) {
    return { ok: false, code: 'MALFORMED_CANONICAL_RESPONSE', reason: 'The canonical quote identity, currency, or price did not match the request contract.' };
  }
  if (payload.currency !== 'INR') {
    return { ok: false, code: 'UNSUPPORTED_CURRENCY', reason: 'Portfolio valuation requires an INR quote; no currency conversion is performed.' };
  }
  if (
    !validTimestamp(provenance.asOf) || !validTimestamp(provenance.receivedAt) ||
    !validTimestamp(provenance.evaluatedAt) || typeof provenance.lineageHash !== 'string' ||
    provenance.lineageHash.length === 0 || typeof provenance.dataVersion !== 'string' ||
    typeof provenance.sourceClassification !== 'string' || typeof provenance.vendorTier !== 'string' ||
    (provenance.qualityState !== 'GOOD' && provenance.qualityState !== 'STALE' &&
      provenance.qualityState !== 'PARTIAL' && provenance.qualityState !== 'UNAVAILABLE') ||
    !validTimestamp(value.timestamp) || typeof value.envelopeId !== 'string' || value.envelopeId.length === 0 ||
    typeof value.schemaVersion !== 'string' || value.schemaVersion.length === 0 ||
    (value.mode !== 'LIVE' && value.mode !== 'SNAPSHOT' && value.mode !== 'PIT')
  ) {
    return { ok: false, code: 'MALFORMED_CANONICAL_RESPONSE', reason: 'Canonical quote provenance or envelope metadata is incomplete.' };
  }

  const freshness = freshnessValue;
  if (freshness !== 'CURRENT' && freshness !== 'STALE') {
    return { ok: false, code: 'MALFORMED_CANONICAL_RESPONSE', reason: 'The IPD quote freshness state is invalid.' };
  }
  if (provenance.qualityState === 'PARTIAL' || provenance.qualityState === 'UNAVAILABLE') {
    return { ok: false, code: 'QUOTE_QUALITY_UNAVAILABLE', reason: 'Canonical quote quality is below the valuation floor.' };
  }
  const state: QuoteFreshness = freshness === 'STALE' || provenance.qualityState === 'STALE' ? 'STALE' : 'CURRENT';

  // Copy only the published canonical envelope/payload/provenance keys. This
  // preserves the D01 observation while preventing unexpected provider fields,
  // credentials, trace IDs or tenant values from reaching the browser.
  const hasSecurityIdentity = payload.securityIdentity !== undefined;
  const rawIdentity = isRecord(payload.securityIdentity) ? payload.securityIdentity : null;
  const securityIdentity = isD114SecurityIdentity(rawIdentity)
    ? {
        securityId: rawIdentity.securityId,
        isin: rawIdentity.isin,
        series: rawIdentity.series,
        isinAuthority: 'NON_AUTHORITATIVE' as const,
      }
    : undefined;
  const rawSecurityId = value.securityId;
  const securityId = typeof rawSecurityId === 'string' ? rawSecurityId : undefined;
  const securityIdMatches = rawSecurityId === undefined || rawSecurityId === expected.securityIdentity.securityId;
  if (
    (hasSecurityIdentity && securityIdentity === undefined) || !securityIdMatches ||
    (securityIdentity !== undefined && securityIdentity.securityId !== expected.securityIdentity.securityId) ||
    (securityIdentity !== undefined && securityIdentity.isin !== expected.securityIdentity.isin) ||
    (securityIdentity !== undefined && securityIdentity.series !== expected.securityIdentity.series) ||
    (securityIdentity !== undefined && securityId !== undefined && securityIdentity.securityId !== securityId)
  ) {
    return { ok: false, code: 'CANONICAL_IDENTITY_MISMATCH', reason: 'The canonical series-aware identity did not match the persisted D114 request.', disposition: 'IDENTITY_AMBIGUOUS' };
  }
  const safePayload: PublicCanonicalQuoteEnvelope['payload'] = {
    companyId: payload.companyId as string,
    symbol: payload.symbol as string,
    exchange: payload.exchange as 'NSE' | 'BSE',
    currency: payload.currency as 'INR' | 'USD',
    bid: payload.bid as number,
    ask: payload.ask as number,
    ltp: payload.ltp,
    open: payload.open as number,
    high: payload.high as number,
    low: payload.low as number,
    ...(payload.close !== undefined ? { close: payload.close as number } : {}),
    previousClose: payload.previousClose as number,
    volume: payload.volume as number,
    ...(payload.vwap !== undefined ? { vwap: payload.vwap as number } : {}),
    ...(payload.turnover !== undefined ? { turnover: payload.turnover as number } : {}),
    change: payload.change as number,
    pctChange: payload.pctChange as number,
    ...(payload.tradeCount !== undefined ? { tradeCount: payload.tradeCount as number } : {}),
    ...(securityIdentity ? { securityIdentity } : {}),
  };
  const publicEnvelope: PublicCanonicalQuoteEnvelope = {
    envelopeId: value.envelopeId,
    domain: 'D01_QUOTES',
    mode: value.mode as 'LIVE' | 'SNAPSHOT' | 'PIT',
    companyId: value.companyId as string,
    ...(securityId ? { securityId } : {}),
    payload: safePayload,
    provenance: {
      sourceClassification: provenance.sourceClassification,
      vendorTier: provenance.vendorTier,
      asOf: provenance.asOf,
      receivedAt: provenance.receivedAt,
      evaluatedAt: provenance.evaluatedAt,
      dataVersion: provenance.dataVersion,
      lineageHash: provenance.lineageHash,
      qualityState: provenance.qualityState as PublicCanonicalQuoteEnvelope['provenance']['qualityState'],
      ...(typeof provenance.quarantineReason === 'string' ? { quarantineReason: provenance.quarantineReason } : {}),
    },
    timestamp: value.timestamp,
    schemaVersion: value.schemaVersion,
  };
  return {
    ok: true,
    freshness: state,
    sourceEnvelope: value as unknown as UpstreamCanonicalEnvelope,
    envelope: publicEnvelope,
    price: payload.ltp,
  };
}

function parseQuoteResponse(raw: unknown, expected: QuoteRequest): QuoteOutcome {
  if (!isRecord(raw)) {
    return { ok: false, code: 'MALFORMED_TRANSPORT_RESPONSE', reason: 'The IPD transport returned an invalid response envelope.' };
  }
  if (raw.ok === false) {
    const failure = isRecord(raw.failure) ? raw.failure : null;
    return typeof failure?.code === 'string'
      ? safeProviderFailure(failure.code, failure.message)
      : { ok: false, code: 'MALFORMED_TRANSPORT_RESPONSE', reason: 'The IPD transport returned an incomplete failure response.', disposition: 'OTHER_BLOCKED' };
  }
  // The published client returns parsed JSON without exposing HTTP status. The
  // IPD server's authenticated error contract is { error: { code, message } }.
  if (isRecord(raw.error) && typeof raw.error.code === 'string') return safeProviderFailure(raw.error.code, raw.error.message);
  if (raw.ok !== true) {
    return { ok: false, code: 'MALFORMED_TRANSPORT_RESPONSE', reason: 'The IPD transport returned an invalid response discriminator.' };
  }
  return safeEnvelope(raw.envelope, raw.freshness, expected);
}

const EXACT_IDENTITY_DISCLOSURE =
  'Quotes are requested only for holdings with an explicit persisted D114 identity; IPD resolves the exact company, listing, ISIN, and series and fails closed when no unique qualified mapping exists. Process readiness does not establish live Dhan connectivity or tradability.';

function withIdentityDisclosure(view: ProviderHealthView): ProviderHealthView {
  return { ...view, disclosure: `${view.disclosure} ${EXACT_IDENTITY_DISCLOSURE}` };
}

function parseHealth(raw: unknown): ProviderHealthView {
  if (!isRecord(raw) || (raw.service !== 'UP' && raw.service !== 'DOWN')) {
    return withIdentityDisclosure({
      transport: 'UNKNOWN',
      qualification: 'UNKNOWN_NOT_LIVE_QUALIFIED',
      liveProviderConnectivity: 'UNKNOWN',
      disclosure: 'Provider health could not be verified; no live-connectivity claim is made.',
    });
  }
  const health = raw as unknown as ServiceHealth;
  return withIdentityDisclosure({
    transport: health.service === 'UP' ? 'AVAILABLE' : 'UNAVAILABLE',
    qualification: health.providerQualification === 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED'
      ? 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED'
      : 'UNKNOWN_NOT_LIVE_QUALIFIED',
    liveProviderConnectivity: health.liveProviderConnectivity === 'NOT_CHECKED_PRE_ACCESS'
      ? 'NOT_CHECKED_PRE_ACCESS'
      : 'UNKNOWN',
    disclosure: health.liveProviderConnectivity === 'NOT_CHECKED_PRE_ACCESS'
      ? 'IPD health reports process readiness only; live Dhan connectivity is NOT_CHECKED_PRE_ACCESS and provider data is not live-qualified.'
      : 'Provider connectivity and qualification are not established; do not label this data live.',
  });
}

function configFailureOutcome(config: MarketDataTransportConfigurationFailure): QuoteFailure {
  return { ok: false, code: config.code, reason: config.reason, disposition: 'TRANSPORT_UNAVAILABLE' };
}

function thrownFailure(error: unknown): QuoteFailure {
  if (error instanceof SyntaxError) {
    return { ok: false, code: 'MALFORMED_TRANSPORT_RESPONSE', reason: 'The IPD transport response was not valid JSON.', disposition: 'OTHER_BLOCKED' };
  }
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'MarketDataTimeoutError')) {
    return { ok: false, code: 'TRANSPORT_TIMEOUT', reason: 'The IPD market-data request exceeded the client timeout.', disposition: 'TRANSPORT_UNAVAILABLE' };
  }
  return { ok: false, code: 'TRANSPORT_UNAVAILABLE', reason: 'The IPD market-data transport could not be reached.', disposition: 'TRANSPORT_UNAVAILABLE' };
}

async function withTimeout<T>(work: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => {
          const error = new Error('market data request timed out');
          error.name = 'MarketDataTimeoutError';
          reject(error);
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function noTransportHealth(reason: string): ProviderHealthView {
  return withIdentityDisclosure({
    transport: 'UNAVAILABLE',
    qualification: 'UNKNOWN_NOT_LIVE_QUALIFIED',
    liveProviderConnectivity: 'UNKNOWN',
    disclosure: reason,
  });
}

function priceOutcome(outcome: QuoteOutcome | undefined, fallback: QuoteFailure): QuoteOutcome {
  return outcome ?? fallback;
}

function computeCostBasis(holding: G2HoldingView): number | null {
  if (!isFiniteNumber(holding.quantity) || holding.quantity < 0 || !isFiniteNumber(holding.averageBuyPrice) || holding.averageBuyPrice <= 0) {
    return null;
  }
  const value = holding.quantity * holding.averageBuyPrice;
  return Number.isFinite(value) ? value : null;
}

function makeHoldingResult(
  holding: G2HoldingView,
  position: number,
  outcome: QuoteOutcome,
): UserPortfolioValuationHolding {
  const quantity = isFiniteNumber(holding.quantity) && holding.quantity >= 0 ? holding.quantity : null;
  const investedValue = computeCostBasis(holding);
  const disposition = outcome.ok ? undefined : outcome.disposition ?? 'OTHER_BLOCKED';
  const identityUnresolved = disposition === 'IDENTITY_MISSING' ||
    disposition === 'IDENTITY_INVALID' || disposition === 'IDENTITY_AMBIGUOUS';

  if (!holding.active) {
    return {
      position, symbol: holding.symbol, quantity, active: false, pricingStatus: 'INACTIVE',
      identityStatus: identityUnresolved ? 'UNRESOLVED' : 'RESOLVED', identityDisposition: 'OTHER_BLOCKED',
      currentMarketPrice: null, marketValue: null, investedValue, unrealizedGainLoss: null,
      unrealizedGainLossPercentage: null, quoteAsOf: null, reasonCode: 'INACTIVE_HOLDING',
      reason: 'Inactive persisted holdings are not included in the current valuation.',
    };
  }

  // Preserve an identity refusal even if another stored field, such as quantity,
  // is also invalid. Identity audit is per holding and never inferred from quotes.
  if (!outcome.ok && identityUnresolved) {
    return {
      position, symbol: holding.symbol, quantity, active: true, pricingStatus: 'UNRESOLVED',
      identityStatus: 'UNRESOLVED', identityDisposition: disposition,
      currentMarketPrice: null, marketValue: null, investedValue, unrealizedGainLoss: null,
      unrealizedGainLossPercentage: null, quoteAsOf: null, reasonCode: outcome.code, reason: outcome.reason,
    };
  }

  if (quantity === null) {
    return {
      position, symbol: holding.symbol, quantity: null, active: true, pricingStatus: 'UNAVAILABLE',
      identityStatus: 'RESOLVED', identityDisposition: 'OTHER_BLOCKED',
      currentMarketPrice: null, marketValue: null, investedValue: null, unrealizedGainLoss: null,
      unrealizedGainLossPercentage: null, quoteAsOf: null, reasonCode: 'INVALID_QUANTITY',
      reason: 'Persisted quantity is not a finite non-negative number.',
    };
  }

  if (!outcome.ok) {
    return {
      position, symbol: holding.symbol, quantity, active: true, pricingStatus: 'UNAVAILABLE',
      identityStatus: 'RESOLVED', identityDisposition: disposition ?? 'OTHER_BLOCKED',
      currentMarketPrice: null, marketValue: null, investedValue, unrealizedGainLoss: null,
      unrealizedGainLossPercentage: null, quoteAsOf: null, reasonCode: outcome.code, reason: outcome.reason,
    };
  }

  const marketValue = quantity * outcome.price;
  if (!Number.isFinite(marketValue)) {
    return {
      position, symbol: holding.symbol, quantity, active: true, pricingStatus: 'UNAVAILABLE', identityStatus: 'RESOLVED',
      identityDisposition: 'OTHER_BLOCKED', currentMarketPrice: null, marketValue: null, investedValue, unrealizedGainLoss: null,
      unrealizedGainLossPercentage: null, quoteAsOf: null, reasonCode: 'VALUATION_OVERFLOW',
      reason: 'The holding value is outside the supported numeric range.',
    };
  }
  const gain = investedValue === null ? null : marketValue - investedValue;
  return {
    position, symbol: holding.symbol, quantity, active: true, pricingStatus: outcome.freshness, identityStatus: 'RESOLVED',
    identityDisposition: 'QUOTE_ELIGIBLE', currentMarketPrice: outcome.price, marketValue, investedValue,
    unrealizedGainLoss: gain,
    unrealizedGainLossPercentage: investedValue !== null && investedValue > 0 && gain !== null
      ? gain / investedValue * 100
      : null,
    quoteAsOf: outcome.envelope.provenance.asOf,
    quote: outcome.envelope,
  };
}

/**
 * Read-only projection. It consumes the saved G2 read result and per-holding
 * canonical quotes; it returns new objects and never mutates the input view.
 */
export function projectUserPortfolioValuation(
  portfolio: G2PortfolioView,
  quoteOutcomes: readonly (QuoteOutcome | undefined)[],
  providerView: ProviderHealthView,
  fallback: QuoteFailure = { ok: false, code: 'TRANSPORT_UNAVAILABLE', reason: 'No quote was returned for this holding.', disposition: 'TRANSPORT_UNAVAILABLE' },
): UserPortfolioValuation {
  const holdings = portfolio.holdings.map((holding, position) => {
    const identity = resolveHoldingSecurity(holding);
    if (!holding.active) return makeHoldingResult(holding, position, identity.ok ? fallback : identity);
    if (!identity.ok) {
      return makeHoldingResult(holding, position, identity);
    }
    if (!isFiniteNumber(holding.quantity) || holding.quantity < 0) {
      return makeHoldingResult(holding, position, { ok: false, code: 'INVALID_QUANTITY', reason: 'Persisted quantity is not a finite non-negative number.', disposition: 'OTHER_BLOCKED' });
    }
    return makeHoldingResult(holding, position, priceOutcome(quoteOutcomes[position], fallback));
  });
  const active = holdings.filter((holding) => holding.active);
  const priced = active.filter((holding) => holding.pricingStatus === 'CURRENT' || holding.pricingStatus === 'STALE');
  const staleCount = priced.filter((holding) => holding.pricingStatus === 'STALE').length;
  const unresolvedCount = active.filter((holding) => holding.pricingStatus === 'UNRESOLVED').length;
  const unavailableCount = active.filter((holding) => holding.pricingStatus === 'UNAVAILABLE').length;
  const activeCount = active.length;
  const coverageStatus: PortfolioCoverageStatus = activeCount === 0
    ? 'EMPTY'
    : priced.length === activeCount
      ? 'FULLY_PRICED'
      : priced.length > 0
        ? 'PARTIALLY_PRICED'
        : 'NO_HOLDINGS_PRICED';
  const freshness: PortfolioFreshnessStatus = priced.length === 0
    ? (activeCount === 0 ? 'NONE' : 'UNAVAILABLE')
    : staleCount === 0
      ? 'CURRENT'
      : staleCount === priced.length
        ? 'STALE'
        : 'MIXED';
  const subtotal = priced.length > 0
    ? priced.reduce((sum, holding) => sum + (holding.marketValue ?? 0), 0)
    : null;
  const completeMarketValue = coverageStatus === 'FULLY_PRICED' && subtotal !== null && Number.isFinite(subtotal)
    ? subtotal
    : null;
  const investedValues = active.map((holding) => holding.investedValue);
  const completeInvestedValue = activeCount > 0 && investedValues.every((value): value is number => value !== null)
    ? investedValues.reduce((sum, value) => sum + value, 0)
    : null;
  const completeGain = coverageStatus === 'FULLY_PRICED' && completeMarketValue !== null && completeInvestedValue !== null
    ? completeMarketValue - completeInvestedValue
    : null;
  const completeGainPct = completeGain !== null && completeInvestedValue !== null && completeInvestedValue > 0
    ? completeGain / completeInvestedValue * 100
    : null;
  return {
    status: coverageStatus,
    freshness,
    coverage: {
      activeHoldingCount: activeCount,
      pricedHoldingCount: priced.length,
      unpricedHoldingCount: activeCount - priced.length,
      staleHoldingCount: staleCount,
      unavailableHoldingCount: unavailableCount,
      unresolvedHoldingCount: unresolvedCount,
      inactiveHoldingCount: portfolio.holdings.length - activeCount,
    },
    portfolioMarketValue: completeMarketValue,
    pricedMarketValueSubtotal: subtotal !== null && Number.isFinite(subtotal) ? subtotal : null,
    investedValue: completeInvestedValue !== null && Number.isFinite(completeInvestedValue) ? completeInvestedValue : null,
    unrealizedGainLoss: completeGain !== null && Number.isFinite(completeGain) ? completeGain : null,
    unrealizedGainLossPercentage: completeGainPct !== null && Number.isFinite(completeGainPct) ? completeGainPct : null,
    provider: {
      transport: providerView.transport,
      qualification: providerView.qualification,
      liveProviderConnectivity: providerView.liveProviderConnectivity,
      disclosure: providerView.disclosure,
    },
    holdings,
  };
}

/**
 * Uses only the exported authenticated IPD transport. Each holding is independently
 * preflighted; invalid or absent D114 identities are not requested, while exact
 * identities continue independently through IPD P6/P7 resolution. No IRR cache,
 * retry, persistence, or historical request (current valuation has no D02 use case).
 */
export async function createUserPortfolioValuation(
  portfolio: G2PortfolioView,
  env: NodeJS.ProcessEnv = process.env,
  options: MarketDataRuntimeOptions = {},
): Promise<UserPortfolioValuation> {
  const config = readMarketDataTransportConfiguration(env);
  if (!config.ok) {
    const provider = withIdentityDisclosure(noTransportHealth(config.reason));
    const failures: (QuoteOutcome | undefined)[] = portfolio.holdings.map((holding) => {
      if (!holding.active) return undefined;
      const identity = resolveHoldingSecurity(holding);
      return identity.ok ? configFailureOutcome(config) : identity;
    });
    return projectUserPortfolioValuation(portfolio, failures, provider, configFailureOutcome(config));
  }
  const client = new MarketDataTransportClient(config.baseUrl, config.token);
  const timeoutMs = options.requestTimeoutMs ?? DEFAULT_MARKET_DATA_CLIENT_TIMEOUT_MS;
  const providerHealthPromise = withTimeout(client.health(), timeoutMs)
    .then(parseHealth)
    .catch((error: unknown) => withIdentityDisclosure({
      transport: 'UNKNOWN' as const,
      qualification: 'UNKNOWN_NOT_LIVE_QUALIFIED' as const,
      liveProviderConnectivity: 'UNKNOWN' as const,
      disclosure: thrownFailure(error).reason,
    }));
  const outcomesPromise = Promise.all(portfolio.holdings.map(async (holding): Promise<QuoteOutcome | undefined> => {
    if (!holding.active) return undefined;
    const identity = resolveHoldingSecurity(holding);
    if (!identity.ok) return identity;
    if (!isFiniteNumber(holding.quantity) || holding.quantity < 0) {
      return { ok: false, code: 'INVALID_QUANTITY', reason: 'Persisted quantity is not a finite non-negative number.', disposition: 'OTHER_BLOCKED' };
    }
    try {
      const raw = await withTimeout(client.getQuote(identity.request), timeoutMs);
      return parseQuoteResponse(raw, identity.request);
    } catch (error) {
      return thrownFailure(error);
    }
  }));
  const [provider, outcomes] = await Promise.all([providerHealthPromise, outcomesPromise]);
  return projectUserPortfolioValuation(portfolio, outcomes, provider);
}
