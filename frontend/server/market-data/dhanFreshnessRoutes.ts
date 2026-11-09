/**
 * IRR DHAN freshness/status HTTP boundary (DHAN-P5).
 *
 * Route:
 *   GET /api/dhan/freshness?domain=D01_QUOTES|D02_OHLCV[&companyId&exchangeSegment&securityId]
 *                                                                   -> freshness view
 *
 * WHAT THIS MODULE IS
 *   A thin, READ-ONLY presentation layer over IPD's existing `GET /v1/freshness` endpoint.
 *   IPD remains the freshness authority: IPD evaluates the observation age against its own
 *   governed thresholds, decides the verdict, owns the stale-concession and suppression
 *   decisions, and reports the last refresh outcome. IRR carries the request, validates the
 *   response shape, and publishes the result in IRR's own vocabulary.
 *
 * WHAT THIS MODULE IS NOT
 *   - NOT a freshness evaluator. IRR computes NO verdict, NO age, NO threshold and NO
 *     concession decision. Every one of those comes from IPD and is published verbatim.
 *   - NOT a refresh API. Reading freshness never triggers a refresh, calls the provider or
 *     schedules work. IPD's endpoint is read-only in exactly that sense, and IRR adds
 *     nothing to it.
 *   - NOT an instrument-search or identity-resolution API. The D01 scope uses an
 *     already-resolved canonical identity; IRR never resolves, ranks or guesses one.
 *   - NOT a second market-data authority. There is no cache, rate limiter or refresh
 *     engine in IRR.
 *
 * CREDENTIAL AND TRANSPORT SAFETY
 *   The transport bearer token and the daemon address are read from the server-side
 *   environment and never published. The browser receives a freshness STATUS and nothing
 *   else — never a token, a client id, an access token or a SecretRef value.
 *
 * THE D02 LIMITATION IS IPD'S AND IS CARRIED VERBATIM
 *   IPD's composed D02 service calls its adapter directly: it does not wire the standalone
 *   historical cache or the refresh orchestrator. IPD therefore reports D02 as
 *   `cacheState: NOT_AVAILABLE`, `verdict: UNKNOWN` and `lastRefresh.outcome: UNKNOWN`,
 *   with null observation timestamps, EVEN AFTER a historical request has been served.
 *   IRR publishes exactly that and says so in words. IRR never infers an observation
 *   timestamp from a candle, never claims a cache miss and never upgrades D02's unknown
 *   verdict to a good or stale one.
 */

import type http from 'node:http';
import { sendJson } from '../owner-scoped-http';
import {
  readIpdFreshnessStatus,
  resolveIpdMarketDataTransportConfig,
  type IpdFreshnessStatus,
  type IpdTransportConfigResolution,
} from './dhanMarketDataTransport';

/**
 * IRR's existing freshness vocabulary, mirrored here as a SERVER-SIDE type.
 *
 * It is declared locally rather than imported from `src/api/transportTypes` so the server
 * boundary never depends on browser code. The two declarations are asserted to agree by
 * the frontend contract test.
 */
export type Freshness = 'LIVE' | 'SNAPSHOT' | 'STALE' | 'UNAVAILABLE' | 'REPLAY';

/**
 * The runtime form of IRR's freshness vocabulary, so the browser/server contract test can
 * compare the two declarations member by member.
 */
export const IRR_FRESHNESS_VOCABULARY: readonly Freshness[] = [
  'LIVE',
  'SNAPSHOT',
  'STALE',
  'UNAVAILABLE',
  'REPLAY',
];

/** The freshness route path. */
export const DHAN_FRESHNESS_PATH = '/api/dhan/freshness';

/** The freshness domains IPD governs. */
export type DhanFreshnessDomain = 'D01_QUOTES' | 'D02_OHLCV';

/** The exchange segments IPD accepts for a D01 quote scope. */
const EXCHANGE_SEGMENTS: ReadonlySet<string> = new Set(['NSE_EQ', 'BSE_EQ']);

/** The canonical D114 security identity grammar, matching IPD's own validation. */
const D114_SECURITY_ID_PATTERN = /^ISIN:[A-Za-z0-9]{12}:[^:\s]+$/;

/**
 * Maps IPD's freshness verdict onto IRR's existing `Freshness` vocabulary.
 *
 * IPD's governed verdict is `GOOD | STALE | UNAVAILABLE | UNKNOWN`, and it is the result of
 * IPD's own `evaluateFreshness` against the domain threshold:
 *
 *   - age <= threshold            -> IPD `GOOD`
 *   - threshold < age <= 2x       -> IPD `STALE` (concession active, still usable)
 *   - age > 2x threshold          -> IPD `UNAVAILABLE` (suppressed)
 *   - missing/invalid evidence    -> IPD `UNAVAILABLE`
 *   - no observation at all       -> IPD `UNKNOWN`
 *
 * THE MAPPING IS DELIBERATELY CONSERVATIVE:
 *   - IPD `GOOD` maps to IRR `SNAPSHOT`, NOT `LIVE`. IPD `GOOD` means "the observation is
 *     within its freshness threshold". It does NOT mean the data came from a live provider,
 *     and IPD's own provider qualification remains `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`.
 *   - IPD `STALE` maps to IRR `STALE`.
 *   - IPD `UNAVAILABLE` maps to IRR `UNAVAILABLE`.
 *   - IPD `UNKNOWN` maps to IRR `UNAVAILABLE`. An unknown verdict is never promoted to a
 *     usable state; the UI reports it as explicitly unknown, which the view preserves
 *     separately from the freshness badge.
 *   - IRR `LIVE` is never produced by this mapping.
 */
export function mapIpdVerdictToIrrFreshness(verdict: string): Freshness {
  switch (verdict) {
    case 'GOOD':
      return 'SNAPSHOT';
    case 'STALE':
      return 'STALE';
    case 'UNAVAILABLE':
      return 'UNAVAILABLE';
    default:
      // `UNKNOWN` and anything unrecognized are treated as unavailable, never as current.
      return 'UNAVAILABLE';
  }
}

/** The IRR-facing freshness view. */
export interface DhanFreshnessView {
  /** The governed domain IPD reported. */
  readonly domain: string;
  /** IRR's freshness vocabulary applied to IPD's verdict. */
  readonly freshness: Freshness;
  /** IPD's verdict, echoed verbatim. */
  readonly verdict: string;
  /** IPD's cache state, echoed verbatim. */
  readonly cacheState: string;
  /** The provider observation timestamp, when IPD has one. */
  readonly asOf: string | null;
  /** The receipt timestamp, when IPD has one. */
  readonly receivedAt: string | null;
  /** The evaluation timestamp of THIS read. */
  readonly evaluatedAt: string;
  /** The original observation's evaluation timestamp, when distinct. */
  readonly observationEvaluatedAt: string | null;
  /** IPD's timestamp evidence classification: VALID, MISSING, INVALID or NOT_AVAILABLE. */
  readonly timestampEvidence: string;
  /** IPD's governed domain threshold, in seconds. */
  readonly thresholdSeconds: number;
  /** The observation age in seconds, when it can be computed. */
  readonly ageSeconds: number | null;
  /** Whether IPD's stale concession is active. */
  readonly staleConcessionActive: boolean;
  /** Whether IPD suppresses this observation from execution. */
  readonly suppressExecution: boolean;
  /** Whether IPD considers this observation eligible for use. */
  readonly eligibleForUse: boolean;
  /** The last refresh outcome, echoed verbatim. */
  readonly lastRefresh: {
    readonly outcome: string;
    readonly lastFailure: { readonly code: string; readonly priorPreserved: boolean } | null;
  };
  /**
   * Whether this domain's cache and refresh evidence is available at all.
   *
   * For D02 this is false: IPD's composed D02 service does not wire the historical cache or
   * the refresh orchestrator, so it reports `NOT_AVAILABLE` / `UNKNOWN` regardless of what
   * has been served. The flag exists so the UI can state the limitation rather than let a
   * reader assume the series was never refreshed.
   */
  readonly evidenceAvailable: boolean;
  /**
   * A plain-language explanation of what this status does and does not establish.
   *
   * It is derived ONLY from IPD's own fields. IRR adds no claim of its own.
   */
  readonly explanation: string;
}

/**
 * Projects IPD's freshness status onto IRR's view.
 *
 * The projection is lossless for every field IRR publishes: nothing is recomputed and
 * nothing is dropped.
 */
export function projectIpdFreshnessStatus(status: IpdFreshnessStatus): DhanFreshnessView {
  const evidenceAvailable = status.cacheState !== 'NOT_AVAILABLE';
  const freshness = mapIpdVerdictToIrrFreshness(status.verdict);

  return {
    domain: status.domain,
    freshness,
    verdict: status.verdict,
    cacheState: status.cacheState,
    asOf: status.asOf,
    receivedAt: status.receivedAt,
    evaluatedAt: status.evaluatedAt,
    observationEvaluatedAt: status.observationEvaluatedAt,
    timestampEvidence: status.timestampEvidence,
    thresholdSeconds: status.thresholdSeconds,
    ageSeconds: status.ageSeconds,
    staleConcessionActive: status.staleConcessionActive,
    suppressExecution: status.suppressExecution,
    eligibleForUse: status.eligibleForUse,
    lastRefresh: {
      outcome: status.lastRefresh.outcome,
      lastFailure: status.lastRefresh.lastFailure,
    },
    evidenceAvailable,
    explanation: explainIpdFreshnessStatus(status, evidenceAvailable),
  };
}

/**
 * Explains a freshness status in words, using only IPD's own fields.
 *
 * The explanation states what was established AND what was not, so an operator is never
 * left to infer a capability the status did not prove.
 */
export function explainIpdFreshnessStatus(
  status: IpdFreshnessStatus,
  evidenceAvailable = status.cacheState !== 'NOT_AVAILABLE',
): string {
  const parts: string[] = [];

  if (!evidenceAvailable) {
    parts.push(
      'No cache or refresh evidence is available for this domain: the underlying service does not wire the observation cache or the refresh orchestrator for it.',
    );
    parts.push(
      'This is a property of the provider-side service, not an absence of observations, and it is reported unchanged.',
    );
  } else {
    parts.push(`Cache state is '${status.cacheState}'.`);
    parts.push(`The provider's verdict is '${status.verdict}'.`);
    parts.push(
      `The governed threshold for this domain is ${status.thresholdSeconds} seconds and the observation age is ${
        status.ageSeconds === null ? 'not computable' : `${status.ageSeconds} seconds`
      }.`,
    );
    parts.push(
      status.staleConcessionActive
        ? 'A stale concession is active, so the observation remains usable but is past its threshold.'
        : 'No stale concession is active.',
    );
    parts.push(
      status.suppressExecution
        ? 'The observation is suppressed from execution.'
        : 'The observation is not suppressed from execution.',
    );
  }

  parts.push(`Timestamp evidence is '${status.timestampEvidence}'.`);
  parts.push(`The last refresh outcome was '${status.lastRefresh.outcome}'.`);

  if (status.lastRefresh.lastFailure !== null) {
    parts.push(
      `The last refresh failed with '${status.lastRefresh.lastFailure.code}' and the prior ${
        status.lastRefresh.lastFailure.priorPreserved ? 'observation was preserved' : 'observation was not preserved'
      }.`,
    );
  }

  return parts.join(' ');
}

/** The IRR-facing error view for a freshness read. */
export interface DhanFreshnessErrorView {
  readonly code: string;
  readonly message: string;
  /** Whether a transport connection was attempted before the failure. */
  readonly connectionAttempted: boolean;
}

/** The response envelope for a failed freshness read. */
export interface DhanFreshnessErrorEnvelope {
  readonly error: DhanFreshnessErrorView;
}

/** Dependencies for the freshness route. */
export interface DhanFreshnessRouteDeps {
  /** The server-side environment map. Injected so tests are deterministic. */
  readonly env?: Readonly<Record<string, string | undefined>>;
  /**
   * A pre-resolved transport configuration. When supplied, it is used verbatim — this is the
   * seam the synthetic fixtures use to inject a controlled transport.
   */
  readonly transport?: IpdTransportConfigResolution;
  /** An injected fetch implementation, used by the synthetic transport fixtures. */
  readonly fetchImpl?: typeof fetch;
}

/** The parsed and validated freshness query. */
interface FreshnessQuery {
  readonly domain: DhanFreshnessDomain;
  readonly companyId?: string;
  readonly exchangeSegment?: string;
  readonly securityId?: string;
}

/**
 * Parses and validates the freshness query.
 *
 * The rules are IPD's own: a D01 request needs an exact quote scope (domain, companyId,
 * exchangeSegment and canonical securityId, each exactly once) and a D02 request needs the
 * domain alone. IRR validates them so an invalid scope never leaves the browser, and IPD
 * re-validates them server-side.
 */
export function parseFreshnessQuery(
  params: URLSearchParams,
): { ok: true; query: FreshnessQuery } | { ok: false; code: string; message: string } {
  const domain = params.get('domain');
  if (domain !== 'D01_QUOTES' && domain !== 'D02_OHLCV') {
    return {
      ok: false,
      code: 'MALFORMED_REQUEST',
      message: 'freshness requires a domain of D01_QUOTES or D02_OHLCV.',
    };
  }

  if (domain === 'D02_OHLCV') {
    // IPD accepts the D02 domain alone and rejects any additional parameter.
    if (params.size !== 1) {
      return {
        ok: false,
        code: 'MALFORMED_REQUEST',
        message: 'the D02_OHLCV freshness query accepts the domain alone.',
      };
    }
    return { ok: true, query: { domain } };
  }

  const companyId = params.get('companyId');
  const exchangeSegment = params.get('exchangeSegment');
  const securityId = params.get('securityId');

  if (companyId === null || companyId.trim() === '' || companyId.length > 100) {
    return { ok: false, code: 'MALFORMED_REQUEST', message: 'D01 freshness requires a companyId.' };
  }
  if (exchangeSegment === null || !EXCHANGE_SEGMENTS.has(exchangeSegment)) {
    return {
      ok: false,
      code: 'MALFORMED_REQUEST',
      message: 'D01 freshness requires an exchangeSegment of NSE_EQ or BSE_EQ.',
    };
  }
  if (securityId === null || securityId.length > 100 || !D114_SECURITY_ID_PATTERN.test(securityId)) {
    return {
      ok: false,
      code: 'MALFORMED_REQUEST',
      message: 'D01 freshness requires an exact canonical security identity (ISIN:<isin>:<series>).',
    };
  }

  return { ok: true, query: { domain, companyId, exchangeSegment, securityId } };
}

/**
 * Handles `GET /api/dhan/freshness`.
 *
 * The route is read-only and credential-free: it establishes no owner context and accepts
 * no tenant, owner, token or credential from the request. It reports the state of the
 * provider-side freshness machinery, which is a process-level fact rather than a user's
 * private data.
 */
export async function handleDhanFreshnessRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: DhanFreshnessRouteDeps = {},
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  const url = (req.url ?? '').split('?')[0];
  if (url !== DHAN_FRESHNESS_PATH || (req.method ?? 'GET') !== 'GET') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'unknown route', connectionAttempted: false } }));
    return;
  }

  const requestUrl = new URL(req.url ?? '/', 'http://localhost');
  const parsed = parseFreshnessQuery(requestUrl.searchParams);
  if (!parsed.ok) {
    sendJson(res, 400, {
      error: { code: parsed.code, message: parsed.message, connectionAttempted: false },
    } satisfies DhanFreshnessErrorEnvelope);
    return;
  }

  const resolution = deps.transport ?? resolveIpdMarketDataTransportConfig(deps.env ?? {});
  if (!resolution.ok) {
    sendJson(res, 503, {
      error: { code: resolution.code, message: resolution.message, connectionAttempted: false },
    } satisfies DhanFreshnessErrorEnvelope);
    return;
  }

  const query: Record<string, string> = { domain: parsed.query.domain };
  if (parsed.query.domain === 'D01_QUOTES') {
    query.companyId = parsed.query.companyId!;
    query.exchangeSegment = parsed.query.exchangeSegment!;
    query.securityId = parsed.query.securityId!;
  }

  const outcome = await readIpdFreshnessStatus(resolution.config, query, deps.fetchImpl);

  if (!outcome.ok) {
    // A malformed RESPONSE is a transport-level failure even though IPD answered 200: the
    // status could not be read, so the request did not succeed. Only a genuine HTTP error
    // status is published as-is.
    const status = outcome.httpStatus !== null && outcome.httpStatus >= 400 ? outcome.httpStatus : 502;
    sendJson(res, status, {
      error: {
        code: outcome.code,
        message: outcome.message,
        connectionAttempted: true,
      },
    } satisfies DhanFreshnessErrorEnvelope);
    return;
  }

  sendJson(res, 200, { data: projectIpdFreshnessStatus(outcome.status) });
}
