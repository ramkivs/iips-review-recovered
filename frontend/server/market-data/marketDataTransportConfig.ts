/**
 * Shared server-side IPD market-data HTTP transport configuration helper.
 *
 * Extracted from the server-owned transport boundary so IRR server consumers
 * (such as DHAN-P4 identity search/resolution/qualification) read the local IPD
 * daemon URL and bearer token solely from server-side environment configuration
 * without coupling to Personal Portfolio / G-2 valuation modules.
 *
 * Security boundaries:
 *   - Server-side only (`server/`): never imported from browser `src/` code.
 *   - Credentials (`IIPS_MARKET_DATA_TRANSPORT_TOKEN`) and endpoint configuration
 *     (`IIPS_MARKET_DATA_TRANSPORT_URL`) are read exclusively from the supplied
 *     server environment map and never from HTTP requests.
 *   - Plain `http:` is restricted to local loopback (`localhost`, `127.0.0.1`,
 *     `[::1]`); embedded URL credentials, query strings, and fragments are refused.
 */
import { MARKET_DATA_TRANSPORT_TOKEN_ENV } from 'iips-production-market-data/dhan-server';

export const MARKET_DATA_TRANSPORT_URL_ENV = 'IIPS_MARKET_DATA_TRANSPORT_URL';

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
