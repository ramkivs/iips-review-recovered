/**
 * Phase C (`PA-DEC-01`..`03`, `IRR-AC-01`..`03`) — IRR HTTP boundaries for EquiCore
 * (`iips-equicore-historical/v1`) and explicit source-selected historical consumption.
 *
 * Routes:
 *   GET  /api/equicore/health                       -> readiness & M2 pin status (never fails server boot)
 *   POST /api/equicore/historical                   -> historical daily NSE_EQ RAW_UNADJUSTED series
 *   POST /api/equicore/eod-observation              -> single-date PINNED_GENERATION_EOD_SNAPSHOT
 *   GET  /api/equicore/instruments/:isin/associations -> dated symbol/series continuity
 *   GET  /api/equicore/calendar?from=&to=           -> NSE calendar completeness & holidays
 *   POST /api/historical                            -> explicit source-selected historical series
 */

import type http from 'node:http';
import { sendJson } from '../owner-scoped-http';
import {
  readEquiCoreTransportConfiguration,
  type EquiCoreTransportConfigResolution,
} from './equicoreTransportConfig';
import { createEquiCoreTransportClient } from './equicoreTransport';
import {
  consumeHistoricalSeries,
  type HistoricalConsumptionDeps,
} from './historicalConsumptionBoundary';
import type { IpdTransportConfigResolution } from './dhanMarketDataTransport';

export const EQUICORE_HEALTH_PATH = '/api/equicore/health';
export const EQUICORE_HISTORICAL_PATH = '/api/equicore/historical';
export const EQUICORE_EOD_OBSERVATION_PATH = '/api/equicore/eod-observation';
export const EQUICORE_CALENDAR_PATH = '/api/equicore/calendar';
export const HISTORICAL_SERIES_PATH = '/api/historical';

export interface EquiCoreRouteDeps {
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly equicoreConfig?: EquiCoreTransportConfigResolution;
  readonly ipdTransport?: IpdTransportConfigResolution;
  readonly fetchImpl?: typeof fetch;
}

async function readJsonBody(
  req: http.IncomingMessage,
): Promise<{ readonly ok: true; readonly value: unknown } | { readonly ok: false }> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > 64 * 1024) return { ok: false };
    chunks.push(chunk as Buffer);
  }
  try {
    return { ok: true, value: JSON.parse(Buffer.concat(chunks).toString('utf8')) };
  } catch {
    return { ok: false };
  }
}

function toBoundaryDeps(deps: EquiCoreRouteDeps): HistoricalConsumptionDeps {
  return {
    ...(deps.env !== undefined ? { env: deps.env } : {}),
    ...(deps.equicoreConfig !== undefined ? { equicoreConfig: deps.equicoreConfig } : {}),
    ...(deps.ipdTransport !== undefined ? { ipdTransport: deps.ipdTransport } : {}),
    ...(deps.fetchImpl !== undefined ? { fetchImpl: deps.fetchImpl } : {}),
  };
}

function mapEquiCoreHttpStatus(code: string, upstreamStatus: number | null): number {
  switch (code) {
    case 'NOT_CONFIGURED':
    case 'MALFORMED_BASE_URL':
    case 'NON_LOOPBACK_BASE_URL':
      return 503;
    case 'INVALID_ISIN':
    case 'INVALID_DATE':
    case 'INVALID_RANGE':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'HOST_FORBIDDEN':
      return 403;
    case 'IDENTITY_AMBIGUOUS':
    case 'D21_CONFLICT_HELD':
      return 409;
    case 'TIMEOUT':
      return 504;
    case 'INTEGRITY_MISMATCH':
    case 'INVALID_RESPONSE_CONTRACT':
    case 'TRANSPORT_FAILURE':
      return 502;
    default:
      return upstreamStatus ?? 502;
  }
}

export function isEquiCorePath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/equicore' || path.startsWith('/api/equicore/');
}

/**
 * Handles `GET /api/equicore/health`.
 * Reports `NOT_CONFIGURED`, `UNAVAILABLE`, `INTEGRITY_MISMATCH`, or `READY` cleanly;
 * never crashes the server when EquiCore is stopped and never discloses bearer tokens.
 */
export async function handleEquiCoreHealthRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: EquiCoreRouteDeps = {},
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  const path = (req.url ?? '').split('?')[0];
  if (path !== EQUICORE_HEALTH_PATH || (req.method ?? 'GET') !== 'GET') {
    sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'unknown route' } });
    return;
  }

  const configResolution = deps.equicoreConfig ?? readEquiCoreTransportConfiguration(deps.env ?? {});
  if (!configResolution.ok) {
    sendJson(res, 200, {
      data: {
        status: 'NOT_CONFIGURED',
        code: configResolution.code,
        message: configResolution.message,
        requiredSettings: configResolution.requiredSettings,
        configured: false,
        reachable: false,
        digestVerified: false,
        package: null,
        state: null,
        scope: null,
      },
    });
    return;
  }

  const client = createEquiCoreTransportClient(configResolution.config, deps.fetchImpl);
  const outcome = await client.getHealth();
  if (!outcome.ok) {
    sendJson(res, 200, {
      data: {
        status: outcome.failure.code === 'INTEGRITY_MISMATCH' ? 'INTEGRITY_MISMATCH' : 'UNAVAILABLE',
        code: outcome.failure.code,
        message: outcome.failure.message,
        requiredSettings: [],
        configured: true,
        reachable: outcome.failure.code === 'INTEGRITY_MISMATCH' || outcome.failure.httpStatus !== null,
        digestVerified: false,
        package: null,
        state: null,
        scope: null,
      },
    });
    return;
  }

  const h = outcome.result;
  sendJson(res, 200, {
    data: {
      status: 'READY',
      code: 'OK',
      message: 'EquiCore historical serving API is reachable and digest-verified.',
      requiredSettings: [],
      configured: true,
      reachable: true,
      digestVerified: true,
      contract: h.contract,
      service: h.service,
      version: h.version,
      scope: h.scope,
      package: h.package,
      state: h.state,
      responseDigest: h.responseDigest,
    },
  });
}

/**
 * Handles `POST /api/equicore/historical` (explicitly pinned to `EQUICORE_NSE_EOD`).
 */
export async function handleEquiCoreHistoricalRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: EquiCoreRouteDeps = {},
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  const path = (req.url ?? '').split('?')[0];
  if (path !== EQUICORE_HISTORICAL_PATH || (req.method ?? 'GET') !== 'POST') {
    sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'unknown route' } });
    return;
  }

  const body = await readJsonBody(req);
  if (!body.ok) {
    sendJson(res, 400, {
      error: {
        code: 'MALFORMED_REQUEST',
        message: 'The request body is not valid JSON.',
        identityFailure: true,
        connectionAttempted: false,
        fallbackAttempted: false,
        blended: false,
      },
    });
    return;
  }
  if (typeof body.value !== 'object' || body.value === null || Array.isArray(body.value)) {
    sendJson(res, 400, {
      error: {
        code: 'MALFORMED_REQUEST',
        message: 'The request body must be a JSON object.',
        identityFailure: true,
        connectionAttempted: false,
        fallbackAttempted: false,
        blended: false,
      },
    });
    return;
  }

  const record = body.value as Record<string, unknown>;
  if (record.source !== undefined && record.source !== 'EQUICORE_NSE_EOD') {
    sendJson(res, 400, {
      error: {
        code: 'SOURCE_MISMATCH',
        message: 'This route serves EQUICORE_NSE_EOD only; cross-source routing is prohibited.',
        identityFailure: false,
        connectionAttempted: false,
        fallbackAttempted: false,
        blended: false,
      },
    });
    return;
  }

  const outcome = await consumeHistoricalSeries(
    { ...record, source: 'EQUICORE_NSE_EOD' },
    toBoundaryDeps(deps),
  );
  if (!outcome.ok) {
    sendJson(res, outcome.httpStatus, {
      error: {
        code: outcome.code,
        message: outcome.message,
        identityFailure: outcome.identityFailure,
        connectionAttempted: outcome.connectionAttempted,
        fallbackAttempted: outcome.fallbackAttempted,
        blended: outcome.blended,
      },
    });
    return;
  }
  sendJson(res, 200, { data: outcome.data });
}

/**
 * Handles `POST /api/equicore/eod-observation` (`PINNED_GENERATION_EOD_SNAPSHOT`).
 */
export async function handleEquiCoreEodObservationRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: EquiCoreRouteDeps = {},
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  const path = (req.url ?? '').split('?')[0];
  if (path !== EQUICORE_EOD_OBSERVATION_PATH || (req.method ?? 'GET') !== 'POST') {
    sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'unknown route' } });
    return;
  }

  const body = await readJsonBody(req);
  if (!body.ok || typeof body.value !== 'object' || body.value === null || Array.isArray(body.value)) {
    sendJson(res, 400, {
      error: {
        code: 'MALFORMED_REQUEST',
        message: 'The request body must be a valid JSON object.',
        identityFailure: true,
        connectionAttempted: false,
        fallbackAttempted: false,
        blended: false,
      },
    });
    return;
  }

  const record = body.value as Record<string, unknown>;
  const tradeDate = typeof record.tradeDate === 'string' ? record.tradeDate : undefined;
  const fromDate = record.fromDate ?? tradeDate;
  const toDate = record.toDate ?? tradeDate;
  const outcome = await consumeHistoricalSeries(
    {
      ...record,
      fromDate,
      toDate,
      interval: record.interval ?? '1D',
      source: 'EQUICORE_NSE_EOD',
      eodObservationOnly: true,
    },
    toBoundaryDeps(deps),
  );
  if (!outcome.ok) {
    sendJson(res, outcome.httpStatus, {
      error: {
        code: outcome.code,
        message: outcome.message,
        identityFailure: outcome.identityFailure,
        connectionAttempted: outcome.connectionAttempted,
        fallbackAttempted: outcome.fallbackAttempted,
        blended: outcome.blended,
      },
    });
    return;
  }
  sendJson(res, 200, { data: outcome.data });
}

/**
 * Handles `GET /api/equicore/instruments/:isin/associations`.
 */
export async function handleEquiCoreAssociationsRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: EquiCoreRouteDeps = {},
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  const path = (req.url ?? '').split('?')[0];
  const match = /^\/api\/equicore\/instruments\/([^/]+)\/associations$/.exec(path);
  if (!match || (req.method ?? 'GET') !== 'GET') {
    sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'unknown route' } });
    return;
  }

  const configResolution = deps.equicoreConfig ?? readEquiCoreTransportConfiguration(deps.env ?? {});
  if (!configResolution.ok) {
    sendJson(res, 503, {
      error: {
        code: configResolution.code,
        message: configResolution.message,
        connectionAttempted: false,
      },
    });
    return;
  }

  let isin: string;
  try {
    isin = decodeURIComponent(match[1]!);
  } catch {
    sendJson(res, 400, { error: { code: 'INVALID_ISIN', message: 'Malformed ISIN path segment.' } });
    return;
  }

  const client = createEquiCoreTransportClient(configResolution.config, deps.fetchImpl);
  const outcome = await client.getInstrumentAssociations(isin);
  if (!outcome.ok) {
    sendJson(res, mapEquiCoreHttpStatus(outcome.failure.code, outcome.failure.httpStatus), {
      error: {
        code: outcome.failure.code,
        message: outcome.failure.message,
        connectionAttempted: outcome.failure.connectionAttempted,
      },
    });
    return;
  }
  sendJson(res, 200, { data: outcome.result });
}

/**
 * Handles `GET /api/equicore/calendar[?from=YYYY-MM-DD&to=YYYY-MM-DD]`.
 */
export async function handleEquiCoreCalendarRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: EquiCoreRouteDeps = {},
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  const rawUrl = req.url ?? '';
  const [path, queryStr] = rawUrl.split('?');
  if (path !== EQUICORE_CALENDAR_PATH || (req.method ?? 'GET') !== 'GET') {
    sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'unknown route' } });
    return;
  }

  const configResolution = deps.equicoreConfig ?? readEquiCoreTransportConfiguration(deps.env ?? {});
  if (!configResolution.ok) {
    sendJson(res, 503, {
      error: {
        code: configResolution.code,
        message: configResolution.message,
        connectionAttempted: false,
      },
    });
    return;
  }

  const params = new URLSearchParams(queryStr ?? '');
  const from = params.get('from');
  const to = params.get('to');
  if ((from !== null) !== (to !== null)) {
    sendJson(res, 400, {
      error: {
        code: 'INVALID_RANGE',
        message: 'from and to query parameters must be provided together.',
        connectionAttempted: false,
      },
    });
    return;
  }

  const client = createEquiCoreTransportClient(configResolution.config, deps.fetchImpl);
  const outcome = await client.getCalendar(from !== null && to !== null ? { from, to } : undefined);
  if (!outcome.ok) {
    sendJson(res, mapEquiCoreHttpStatus(outcome.failure.code, outcome.failure.httpStatus), {
      error: {
        code: outcome.failure.code,
        message: outcome.failure.message,
        connectionAttempted: outcome.failure.connectionAttempted,
      },
    });
    return;
  }
  sendJson(res, 200, { data: outcome.result });
}

/**
 * Handles `POST /api/historical` — explicit source-selected historical consumption
 * (`source: 'EQUICORE_NSE_EOD' | 'DHAN_D02_OHLCV'`), preserving D-4.2 non-fallback &
 * non-blending invariants.
 */
export async function handleHistoricalSeriesRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: EquiCoreRouteDeps = {},
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  const path = (req.url ?? '').split('?')[0];
  if (path !== HISTORICAL_SERIES_PATH || (req.method ?? 'GET') !== 'POST') {
    sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'unknown route' } });
    return;
  }

  const body = await readJsonBody(req);
  if (!body.ok) {
    sendJson(res, 400, {
      error: {
        code: 'MALFORMED_REQUEST',
        message: 'The request body is not valid JSON.',
        identityFailure: true,
        connectionAttempted: false,
        fallbackAttempted: false,
        blended: false,
      },
    });
    return;
  }

  const outcome = await consumeHistoricalSeries(body.value, toBoundaryDeps(deps));
  if (!outcome.ok) {
    sendJson(res, outcome.httpStatus, {
      error: {
        code: outcome.code,
        message: outcome.message,
        identityFailure: outcome.identityFailure,
        connectionAttempted: outcome.connectionAttempted,
        fallbackAttempted: outcome.fallbackAttempted,
        blended: outcome.blended,
      },
    });
    return;
  }
  sendJson(res, 200, { data: outcome.data });
}

/**
 * Dispatcher for `/api/equicore/*` routes mounted in `executive-transport.ts`.
 */
export async function handleEquiCoreRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: EquiCoreRouteDeps = {},
): Promise<void> {
  const path = (req.url ?? '').split('?')[0];
  if (path === EQUICORE_HEALTH_PATH) {
    await handleEquiCoreHealthRequest(req, res, deps);
    return;
  }
  if (path === EQUICORE_HISTORICAL_PATH) {
    await handleEquiCoreHistoricalRequest(req, res, deps);
    return;
  }
  if (path === EQUICORE_EOD_OBSERVATION_PATH) {
    await handleEquiCoreEodObservationRequest(req, res, deps);
    return;
  }
  if (path === EQUICORE_CALENDAR_PATH) {
    await handleEquiCoreCalendarRequest(req, res, deps);
    return;
  }
  if (/^\/api\/equicore\/instruments\/[^/]+\/associations$/.test(path)) {
    await handleEquiCoreAssociationsRequest(req, res, deps);
    return;
  }
  sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'unknown route' } });
}
