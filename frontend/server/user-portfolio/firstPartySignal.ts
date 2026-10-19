/**
 * G-3 first-party signal — C9 cross-site hardening (IRR side).
 *
 * Authority: `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §5.1 item 4
 * (C9). Its assertions live in `ipcPortAdapter.test.ts` (§5.4): the act allocates
 * them there and forbids a ninth test file.
 *
 * WHAT THIS IS
 *   A **cross-site hardening signal**. It distinguishes a request that a browser
 *   would only make from the product's own origin from one a third-party site could
 *   cause, using two independent, non-secret properties:
 *     1. a **non-simple** request shape — a JSON `Content-Type` or a header outside
 *        the CORS-safelisted set, which a cross-site HTML form cannot produce
 *        without a preflight; and
 *     2. **`Origin` / `Sec-Fetch-Site` consistency** with the request's own `Host`.
 *
 * WHAT THIS IS NOT — AND THE TESTS PROVE IT
 *   **Never authentication.** It is not a token, not a session, not a credential and
 *   not an identity. Concretely:
 *     - `Authorization`, `Cookie`, `Proxy-Authorization` and any bearer-shaped header
 *       are **excluded from the evidence by construction**. Two requests identical
 *       except for those headers must produce the identical decision, and the tests
 *       assert exactly that.
 *     - It yields **no owner, tenant, principal or scope**. It cannot establish an
 *       owner context; `ownerContextFromBinding.ts` remains the only provenance path,
 *       and it reads no header at all.
 *     - It never *grants* access. A `FIRST_PARTY` decision means "not evidently
 *       cross-site"; it does not mean authorized, authenticated or admitted.
 *
 * FAIL CLOSED
 *   A request whose first-party status cannot be determined is `INDETERMINATE`, and
 *   `allowed` is false for anything other than `FIRST_PARTY`. Absence of evidence is
 *   treated as absence of assurance, never as assurance.
 *
 * SCOPE NOTE
 *   Under this act every `/api/user-portfolios*` route still returns HTTP `503
 *   owner-context-unavailable` and never reaches a port (§5.6). This signal is
 *   therefore hardening for the boundary, not a live admission rule, and it lifts
 *   nothing.
 */

/* ------------------------------------------------------------------ *
 * Evidence extraction
 * ------------------------------------------------------------------ */

/**
 * CORS-safelisted request headers. A header outside this set makes a request
 * non-simple, which a cross-site HTML form cannot do without triggering preflight.
 */
export const CORS_SAFELISTED_REQUEST_HEADERS: readonly string[] = [
  'accept',
  'accept-language',
  'content-language',
  'content-type',
];

/**
 * `Content-Type` values that keep a request "simple". Anything else — notably
 * `application/json` — is non-simple.
 */
export const CORS_SIMPLE_CONTENT_TYPES: readonly string[] = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
];

/**
 * Headers every HTTP client sends regardless of intent.
 *
 * Excluded from the non-simple computation because they carry no first-party signal:
 * if `Host` or `User-Agent` counted as "non-simple", every request would.
 */
export const TRANSPORT_LEVEL_HEADERS: readonly string[] = [
  'host',
  'connection',
  'content-length',
  'user-agent',
  'accept-encoding',
];

/**
 * Headers that constitute the *second* C9 signal (origin / fetch-metadata
 * consistency) and are therefore excluded from the *first* signal, so the two remain
 * independent. Browsers send `Origin` on simple cross-site requests too, so counting
 * it as a non-simple header would erase the distinction the conjunction relies on.
 */
export const FETCH_METADATA_HEADERS: readonly string[] = [
  'origin',
  'referer',
  'sec-fetch-site',
  'sec-fetch-mode',
  'sec-fetch-dest',
  'sec-fetch-user',
];

/** Headers that cannot make a request non-simple. */
export const NON_DISCRIMINATING_HEADERS: readonly string[] = [
  ...CORS_SAFELISTED_REQUEST_HEADERS,
  ...TRANSPORT_LEVEL_HEADERS,
  ...FETCH_METADATA_HEADERS,
];

/**
 * Headers that are **never** part of the first-party evidence.
 *
 * Excluded by construction so that no credential, cookie or session can influence
 * the decision. This is what makes "never authentication" a property of the code
 * rather than a claim in a comment.
 */
export const AUTHENTICATION_SHAPED_HEADERS: readonly string[] = [
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'x-csrf-token',
  'x-session-id',
];

/** A minimal header map, so no `node:http` type is needed. */
export type HeaderMap = Readonly<Record<string, string | string[] | undefined>>;

export interface FirstPartyEvidence {
  readonly method: string;
  readonly contentType: string | null;
  /** True when the `Content-Type` is not one of the three simple values. */
  readonly contentTypeIsNonSimple: boolean;
  /** True when a header outside the CORS-safelisted set is present. */
  readonly hasNonSimpleHeader: boolean;
  /** True when the request is non-simple by either route. */
  readonly nonSimple: boolean;
  readonly origin: string | null;
  readonly host: string | null;
  readonly secFetchSite: string | null;
  readonly secFetchMode: string | null;
  readonly secFetchDest: string | null;
  /** True when `Origin` and `Host` name the same authority. */
  readonly originMatchesHost: boolean | null;
}

function headerValue(headers: HeaderMap, name: string): string | null {
  const raw = headers[name] ?? headers[name.toLowerCase()];
  if (raw === undefined) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Extracts the first-party evidence from a header map.
 *
 * Authentication-shaped headers are dropped before anything is evaluated, so they
 * cannot affect the result even if a caller passes them.
 */
export function extractFirstPartyEvidence(
  headers: HeaderMap,
  method = 'GET',
  fallbackHost: string | null = null,
): FirstPartyEvidence {
  const relevant: Record<string, string> = {};
  for (const rawName of Object.keys(headers)) {
    const name = rawName.toLowerCase();
    if (AUTHENTICATION_SHAPED_HEADERS.includes(name)) continue; // never evidence
    const value = headerValue(headers, rawName);
    if (value !== null) relevant[name] = value;
  }

  const contentType = relevant['content-type'] ?? null;
  const contentTypeIsNonSimple =
    contentType !== null &&
    !CORS_SIMPLE_CONTENT_TYPES.some((simple) => contentType.toLowerCase().startsWith(simple));

  // A header makes the request non-simple only if a cross-site HTML form or a
  // no-preflight fetch could not have produced it. Always-present transport headers
  // and the fetch-metadata headers used by the second signal are excluded, so the
  // two C9 signals stay independent.
  const hasNonSimpleHeader = Object.keys(relevant).some(
    (name) => !NON_DISCRIMINATING_HEADERS.includes(name),
  );

  const origin = relevant['origin'] ?? null;
  const host = (relevant['host'] ?? fallbackHost ?? null)?.toLowerCase() ?? null;

  return {
    method: method.toUpperCase(),
    contentType,
    contentTypeIsNonSimple,
    hasNonSimpleHeader,
    nonSimple: contentTypeIsNonSimple || hasNonSimpleHeader,
    origin,
    host,
    secFetchSite: relevant['sec-fetch-site'] ?? null,
    secFetchMode: relevant['sec-fetch-mode'] ?? null,
    secFetchDest: relevant['sec-fetch-dest'] ?? null,
    originMatchesHost: compareOriginToHost(origin, host),
  };
}

/**
 * Compares an `Origin` to a `Host`, normalizing the default port for each scheme.
 * Returns `null` when either side is absent or unparseable — never a guess.
 */
export function compareOriginToHost(origin: string | null, host: string | null): boolean | null {
  if (origin === null || host === null) return null;
  let originHost: string;
  try {
    const parsed = new URL(origin);
    originHost = normalizeAuthority(parsed.protocol, parsed.hostname, parsed.port);
  } catch {
    return null;
  }
  const [hostName, hostPort] = splitAuthority(host);
  const scheme = origin.startsWith('https:') ? 'https:' : 'http:';
  return originHost === normalizeAuthority(scheme, hostName, hostPort);
}

function splitAuthority(host: string): [string, string] {
  const index = host.lastIndexOf(':');
  // An IPv6 literal without a port contains colons; only split on a trailing port.
  if (index === -1) return [host, ''];
  const port = host.slice(index + 1);
  if (!/^\d+$/.test(port)) return [host, ''];
  return [host.slice(0, index), port];
}

function normalizeAuthority(scheme: string, hostname: string, port: string): string {
  const defaultPort = scheme === 'https:' ? '443' : '80';
  const normalizedPort = port === '' || port === defaultPort ? '' : `:${port}`;
  return `${hostname.toLowerCase()}${normalizedPort}`;
}

/* ------------------------------------------------------------------ *
 * Evaluation
 * ------------------------------------------------------------------ */

export type FirstPartyDecision = 'FIRST_PARTY' | 'NOT_FIRST_PARTY' | 'INDETERMINATE';

/** `Sec-Fetch-Site` values that are consistent with a first-party request. */
export const FIRST_PARTY_SEC_FETCH_SITES: readonly string[] = ['same-origin', 'same-site', 'none'];

export interface FirstPartyEvaluation {
  readonly decision: FirstPartyDecision;
  /** True only for `FIRST_PARTY`. Fail closed for everything else. */
  readonly allowed: boolean;
  /** Which signals were evaluated, for diagnostics. Never a credential. */
  readonly signals: Readonly<{
    nonSimple: boolean;
    originConsistent: boolean | null;
    secFetchSiteFirstParty: boolean | null;
  }>;
  /**
   * Constant `false`. This evaluation is never authentication, and the field exists
   * so no consumer can mistake the decision for an authorization.
   */
  readonly authentication: false;
  /** Constant `null`: the signal yields no owner, tenant, principal or scope. */
  readonly ownerContext: null;
}

/**
 * Evaluates the first-party signal.
 *
 * Order matters and is fail-closed:
 *   1. An explicit `cross-site` `Sec-Fetch-Site` is refused outright.
 *   2. An `Origin` that does not match `Host` is refused outright.
 *   3. Otherwise the request must be **non-simple** (JSON content type or a
 *      non-safelisted header) AND have a consistent first-party indicator — either a
 *      first-party `Sec-Fetch-Site`, or no `Sec-Fetch-Site` together with an
 *      `Origin` that matches `Host` (or no `Origin` at all, which a browser does not
 *      send cross-site for these methods).
 *   4. Anything that cannot be determined is `INDETERMINATE`, which is not allowed.
 */
export function evaluateFirstPartySignal(evidence: FirstPartyEvidence): FirstPartyEvaluation {
  const secFetchSiteFirstParty =
    evidence.secFetchSite === null
      ? null
      : FIRST_PARTY_SEC_FETCH_SITES.includes(evidence.secFetchSite.toLowerCase());

  const originConsistent =
    evidence.origin === null ? null : evidence.originMatchesHost === true;

  const signals = {
    nonSimple: evidence.nonSimple,
    originConsistent,
    secFetchSiteFirstParty,
  };
  const refuse = (decision: FirstPartyDecision): FirstPartyEvaluation => ({
    decision,
    allowed: false,
    signals,
    authentication: false,
    ownerContext: null,
  });

  // 1. Explicit cross-site.
  if (secFetchSiteFirstParty === false) return refuse('NOT_FIRST_PARTY');

  // 2. An Origin that names a different authority.
  if (originConsistent === false) return refuse('NOT_FIRST_PARTY');

  // 3. A simple request carries no first-party assurance at all: a cross-site HTML
  //    form produces exactly this shape, so it cannot be distinguished from one.
  if (!evidence.nonSimple) {
    // C9 requires the conjunction: a non-simple shape AND a consistent indicator. A
    // simple request fails the first conjunct, so no assurance exists — even when
    // `Sec-Fetch-Site` looks first-party, because a simple request is precisely the
    // shape a cross-site HTML form produces.
    return refuse('INDETERMINATE');
  }

  // 4. Non-simple plus a consistent indicator.
  if (secFetchSiteFirstParty === true) {
    return { decision: 'FIRST_PARTY', allowed: true, signals, authentication: false, ownerContext: null };
  }
  if (secFetchSiteFirstParty === null) {
    // No `Sec-Fetch-Site` (an older or non-browser client). Accept only when the
    // Origin matches the Host, or when no Origin was supplied at all.
    if (originConsistent === true || evidence.origin === null) {
      return { decision: 'FIRST_PARTY', allowed: true, signals, authentication: false, ownerContext: null };
    }
    return refuse('INDETERMINATE');
  }
  return refuse('INDETERMINATE');
}

/** Convenience: extract and evaluate in one step. */
export function evaluateRequestFirstPartySignal(
  headers: HeaderMap,
  method = 'GET',
  fallbackHost: string | null = null,
): FirstPartyEvaluation {
  return evaluateFirstPartySignal(extractFirstPartyEvidence(headers, method, fallbackHost));
}

/**
 * True when a decision may be relied on as cross-site hardening.
 *
 * Deliberately named for what it is: hardening, not authorization. Callers must not
 * treat `true` as permission to serve owner-scoped data.
 */
export function isFirstPartyHardeningSatisfied(evaluation: FirstPartyEvaluation): boolean {
  return evaluation.decision === 'FIRST_PARTY' && evaluation.allowed === true;
}

/**
 * Vocabulary for documentation and tests: what the signal is, and what it is not.
 */
export function describeFirstPartySignal(): Readonly<{
  purpose: string;
  isAuthentication: false;
  establishesOwnerContext: false;
  grantsAccess: false;
  signalsUsed: readonly string[];
  headersExcludedFromNonSimple: readonly string[];
  headersNeverUsed: readonly string[];
}> {
  return {
    purpose: 'C9 cross-site hardening only',
    isAuthentication: false,
    establishesOwnerContext: false,
    grantsAccess: false,
    signalsUsed: ['content-type', 'non-safelisted-header', 'origin', 'host', 'sec-fetch-site'],
    headersExcludedFromNonSimple: NON_DISCRIMINATING_HEADERS,
    headersNeverUsed: AUTHENTICATION_SHAPED_HEADERS,
  };
}
