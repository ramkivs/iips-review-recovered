/**
 * Program v3.0 — NP-08 / D08 MACRO: origin-scoped TLS compatibility for MoSPI.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  WHY THIS EXISTS
 * ═══════════════════════════════════════════════════════════════════════════
 * `https://api.mospi.gov.in` completes a TLS 1.2 handshake whose ServerHello
 * omits the RFC 5746 `renegotiation_info` extension. OpenSSL >= 3.0 — the TLS
 * library inside Node 22/24 — refuses such a peer by default:
 *
 *   ERR_SSL_UNSAFE_LEGACY_RENEGOTIATION_DISABLED
 *   ...final_renegotiate:unsafe legacy renegotiation disabled
 *
 * That is a deliberate OpenSSL 3.0 default, not a defect. Windows `curl.exe`
 * succeeds against the same host only because it uses Schannel, not OpenSSL.
 * (Investigation record: MOSPI-NODE-TLS-ROOT-CAUSE-INVESTIGATION-01, 2026-10-15.)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  WHAT THIS DOES
 * ═══════════════════════════════════════════════════════════════════════════
 * Requests to that ONE origin are routed through a dedicated undici dispatcher
 * whose connect options include `SSL_OP_LEGACY_SERVER_CONNECT` — the
 * client-only flag that permits completing a handshake with a peer that does
 * not implement RFC 5746 signalling.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  WHAT THIS DOES NOT DO
 * ═══════════════════════════════════════════════════════════════════════════
 *   - Certificate verification stays ON (`rejectUnauthorized: true`); no CA,
 *     hostname or verification override is applied anywhere.
 *   - `SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION` is deliberately NOT set. This
 *     does not enable unsafe mid-connection renegotiation.
 *   - The flag is NOT global and NOT environment-wide: it applies only when a
 *     request URL's origin is exactly `https://api.mospi.gov.in`. Every other
 *     origin continues through the untouched runtime `fetch`, with no
 *     dispatcher and no TLS options.
 *   - No credential, header, endpoint, retry, caching or parsing behaviour is
 *     changed. Failures still fail closed — an error from the scoped fetch
 *     propagates unchanged and is never silently retried elsewhere.
 *
 * Local, single-user deployment: this file exists to make the IIPS transport
 * able to read published MoSPI NAS/CPI/IIP data from the machine where the
 * provider's TLS terminator is reachable.
 */
import { constants } from 'node:crypto';

import { Agent, fetch as undiciFetch } from 'undici';

/** The single origin this exception applies to. Compared as a full origin. */
export const MOSPI_ORIGIN = 'https://api.mospi.gov.in';

/**
 * Connect options for the MoSPI-only dispatcher.
 *
 * `SSL_OP_LEGACY_SERVER_CONNECT` (0x4) is the client-side "legacy server
 * connect" flag: the handshake may complete with a peer that does not signal
 * RFC 5746 secure renegotiation. Verification is explicitly retained.
 */
export const MOSPI_TLS_CONNECT_OPTIONS = {
  secureOptions: constants.SSL_OP_LEGACY_SERVER_CONNECT,
  rejectUnauthorized: true,
} as const;

/** True only for `https://api.mospi.gov.in` — look-alike hosts are rejected. */
export function isMospiOrigin(url: string): boolean {
  try {
    return new URL(url).origin === MOSPI_ORIGIN;
  } catch {
    return false;
  }
}

let dispatcher: Agent | undefined;

/** Lazily created, cached dispatcher used for the MoSPI origin only. */
export function mospiTlsDispatcher(): Agent {
  dispatcher ??= new Agent({ connect: { ...MOSPI_TLS_CONNECT_OPTIONS } });
  return dispatcher;
}

function hrefOf(input: string | URL | Request): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/** Applies the scoped dispatcher. Certificate verification remains enforced. */
function scopedUndiciFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  return undiciFetch(hrefOf(input), {
    ...(init as Record<string, unknown>),
    dispatcher: mospiTlsDispatcher(),
  } as Parameters<typeof undiciFetch>[1]) as unknown as Promise<Response>;
}

/**
 * Build the default fetch used by the MoSPI request path.
 *
 * MoSPI origin  -> the scoped undici fetch above (legacy-connect allowed).
 * Any other URL -> the runtime `fetch`, called with the caller's exact
 *                  arguments and its result returned unchanged.
 *
 * `scopedFetchImpl` exists so tests can exercise routing without network I/O.
 */
export function createMospiFetch(scopedFetchImpl?: typeof fetch): typeof fetch {
  const scoped: typeof fetch = scopedFetchImpl ?? scopedUndiciFetch;
  return (input, init) =>
    isMospiOrigin(hrefOf(input)) ? scoped(input, init) : globalThis.fetch(input, init);
}
