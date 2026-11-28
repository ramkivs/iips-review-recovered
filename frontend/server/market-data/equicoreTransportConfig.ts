/**
 * Phase C (`PA-DEC-03`) — Shared server-only EquiCore transport configuration reader.
 *
 * Mirrors `marketDataTransportConfig.ts` for the EquiCore `iips-equicore-historical/v1`
 * local loopback serving API (`127.0.0.1:8614`):
 *   - Reads `IIPS_EQUICORE_BASE_URL`, `IIPS_EQUICORE_TRANSPORT_TOKEN`, and optional
 *     `IIPS_EQUICORE_TIMEOUT_MS` strictly from an explicit server-side env map.
 *   - Enforces `http://` loopback-only addressing (`127.0.0.1`, `localhost`, `::1`).
 *   - Rejects embedded credentials, query strings, fragments, non-root paths, and malformed
 *     or whitespace/control-character bearer tokens.
 *   - Never discloses token values in error messages or configuration failures.
 */

export const EQUICORE_BASE_URL_ENV = 'IIPS_EQUICORE_BASE_URL';
export const EQUICORE_TRANSPORT_TOKEN_ENV = 'IIPS_EQUICORE_TRANSPORT_TOKEN';
export const EQUICORE_TIMEOUT_MS_ENV = 'IIPS_EQUICORE_TIMEOUT_MS';

export const EQUICORE_DEFAULT_TIMEOUT_MS = 5000;
export const EQUICORE_MIN_TIMEOUT_MS = 200;
export const EQUICORE_MAX_TIMEOUT_MS = 30_000;

export const EQUICORE_REQUIRED_SETTINGS = Object.freeze([
  EQUICORE_BASE_URL_ENV,
  EQUICORE_TRANSPORT_TOKEN_ENV,
] as const);

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
const UNSAFE_TOKEN_CHARS = /[\s\u0000-\u001f\u007f]/;

export interface EquiCoreTransportConfig {
  readonly baseUrl: string;
  readonly token: string;
  readonly timeoutMs: number;
}

export type EquiCoreTransportConfigCode =
  | 'NOT_CONFIGURED'
  | 'MALFORMED_BASE_URL'
  | 'NON_LOOPBACK_BASE_URL';

export type EquiCoreTransportConfigResolution =
  | {
      readonly ok: true;
      readonly config: EquiCoreTransportConfig;
    }
  | {
      readonly ok: false;
      readonly code: EquiCoreTransportConfigCode;
      readonly message: string;
      readonly requiredSettings: readonly string[];
    };

function trimOrEmpty(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveTimeoutMs(rawTimeout: string | undefined): number | null {
  if (rawTimeout === undefined || rawTimeout.trim() === '') {
    return EQUICORE_DEFAULT_TIMEOUT_MS;
  }
  if (!/^\d+$/.test(rawTimeout.trim())) {
    return null;
  }
  const parsed = Number.parseInt(rawTimeout.trim(), 10);
  if (
    !Number.isSafeInteger(parsed) ||
    parsed < EQUICORE_MIN_TIMEOUT_MS ||
    parsed > EQUICORE_MAX_TIMEOUT_MS
  ) {
    return null;
  }
  return parsed;
}

/**
 * Resolves and validates EquiCore loopback transport configuration from a server-side env map.
 * Fails closed on any missing, non-loopback, or malformed input without disclosing token values.
 */
export function readEquiCoreTransportConfiguration(
  env: Readonly<Record<string, string | undefined>>,
): EquiCoreTransportConfigResolution {
  const rawUrl = trimOrEmpty(env[EQUICORE_BASE_URL_ENV]);
  const rawToken = env[EQUICORE_TRANSPORT_TOKEN_ENV];

  if (!rawUrl || typeof rawToken !== 'string' || rawToken.length === 0) {
    return {
      ok: false,
      code: 'NOT_CONFIGURED',
      message:
        'EquiCore historical transport is not configured. Both IIPS_EQUICORE_BASE_URL and ' +
        'IIPS_EQUICORE_TRANSPORT_TOKEN must be supplied in the server environment.',
      requiredSettings: EQUICORE_REQUIRED_SETTINGS,
    };
  }

  if (UNSAFE_TOKEN_CHARS.test(rawToken)) {
    return {
      ok: false,
      code: 'NOT_CONFIGURED',
      message:
        'IIPS_EQUICORE_TRANSPORT_TOKEN contains whitespace or control characters and was rejected.',
      requiredSettings: EQUICORE_REQUIRED_SETTINGS,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return {
      ok: false,
      code: 'MALFORMED_BASE_URL',
      message: 'IIPS_EQUICORE_BASE_URL is not a valid URL.',
      requiredSettings: EQUICORE_REQUIRED_SETTINGS,
    };
  }

  // PA-DEC-03 / EC-DEC-01: local loopback http:// only.
  if (parsed.protocol !== 'http:') {
    return {
      ok: false,
      code: 'MALFORMED_BASE_URL',
      message: 'IIPS_EQUICORE_BASE_URL must use the http:// scheme for local EquiCore loopback.',
      requiredSettings: EQUICORE_REQUIRED_SETTINGS,
    };
  }

  if (parsed.username !== '' || parsed.password !== '') {
    return {
      ok: false,
      code: 'MALFORMED_BASE_URL',
      message: 'IIPS_EQUICORE_BASE_URL must not contain embedded credentials.',
      requiredSettings: EQUICORE_REQUIRED_SETTINGS,
    };
  }

  if (parsed.search !== '' || parsed.hash !== '') {
    return {
      ok: false,
      code: 'MALFORMED_BASE_URL',
      message: 'IIPS_EQUICORE_BASE_URL must not contain a query string or fragment.',
      requiredSettings: EQUICORE_REQUIRED_SETTINGS,
    };
  }

  if (parsed.pathname !== '' && !/^\/+$/.test(parsed.pathname)) {
    return {
      ok: false,
      code: 'MALFORMED_BASE_URL',
      message: 'IIPS_EQUICORE_BASE_URL must be an origin-only base URL without a path.',
      requiredSettings: EQUICORE_REQUIRED_SETTINGS,
    };
  }

  if (!LOOPBACK_HOSTS.has(parsed.hostname.toLowerCase())) {
    return {
      ok: false,
      code: 'NON_LOOPBACK_BASE_URL',
      message: 'IIPS_EQUICORE_BASE_URL must target a local loopback address (127.0.0.1, localhost, or ::1).',
      requiredSettings: EQUICORE_REQUIRED_SETTINGS,
    };
  }

  const timeoutMs = resolveTimeoutMs(env[EQUICORE_TIMEOUT_MS_ENV]);
  if (timeoutMs === null) {
    return {
      ok: false,
      code: 'NOT_CONFIGURED',
      message:
        `IIPS_EQUICORE_TIMEOUT_MS must be an integer between ${EQUICORE_MIN_TIMEOUT_MS} and ${EQUICORE_MAX_TIMEOUT_MS}.`,
      requiredSettings: EQUICORE_REQUIRED_SETTINGS,
    };
  }

  return {
    ok: true,
    config: {
      baseUrl: parsed.origin,
      token: rawToken,
      timeoutMs,
    },
  };
}
