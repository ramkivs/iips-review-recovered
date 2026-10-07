/**
 * G-2 Durable User Portfolio — PRODUCT TRANSPORT BOUNDARY (`/api/user-portfolios/*`).
 *
 * This is the G3-bound product binding for the G-2 seam: the `/api/user-portfolios/*`
 * routes reach the pinned G24 capability through the INJECTED port/adapter, so a
 * durable user portfolio can be created, read, listed, saved, reset, deleted, and
 * traced through its revision history over HTTP.
 *
 * What is deliberately NOT implemented here (G-2 boundaries):
 *   - no certified-reference behavior: `/api/portfolio`, the reference workspace, and
 *     the certified engine path are untouched (different route, different contract,
 *     different provenance — see the route-collision note below);
 *   - no portfolio UI / navigation / browser client;
 *   - no portfolio domain logic: consolidation, defaults, revisions, duplicates,
 *     tombstones, and provenance are G24's (this module carries them, verbatim);
 *   - no provisioning, mapping, or membership administration (explicit governed
 *     operator acts against G24's service surface — see translationBoundary.ts);
 *   - no analytics/scoring integration (excluded by G-2 §7);
 *   - no storage of any kind: IRR holds no portfolio state, no cache, no mapping copy.
 *
 * ROUTE COLLISION AVOIDANCE:
 *     /api/portfolio           -> certified REFERENCE portfolio (frozen engine
 *                               snapshot DTO). UNTOUCHED by this file.
 *     /api/user-portfolios/*   -> USER-OWNED durable portfolios (G24-backed).
 *                               New, distinct, explicitly user-scoped.
 * The two routes share no identifier semantics, no response contract, and no
 * provenance. A user portfolio is never presented as the certified reference.
 *
 * Enforcement chain (the EXISTING server-side mechanism — no second auth primitive):
 *   Bearer credential → SecuredExecutor.authenticate → Keycloak validation
 *     → AUTHORITATIVE tenant resolution (injected TenantDirectory) → 401 on failure
 *     → server-derived Principal `{ userId, tenantId, roles }`
 *   → SecuredExecutor.authorize (read for reads, execute for writes) + the
 *     user-portfolio resource gate                                     → 403 on deny
 *   → client-supplied identity/tenant/durable-identity refusal         → 400/403
 *   → boundary (scope derived from the principal ONLY) → port → G24, which
 *     enforces its OWN membership authority (either gate may deny; a deny is final).
 *
 * Credential rule (see translationBoundary.ts §13): the request's OWN bearer is
 * presented to G24, which validates it ITSELF (issuer, distinct IPD audience, JWKS,
 * expiry). Until the IdP issues the `ipd-user-portfolio-api` audience, G24 answers
 * 401 and the durable surfaces answer 503 (fail closed). Live-IdP certification is
 * DEFERRED; no static/service credential exists and none is accepted.
 *
 * Process composition: `createLiveUserPortfolioConfig()` resolves the server-owned
 * G24 base URL and returns `null` when it is unavailable in this process; durable
 * operations then fail closed with 503. The adapter is constructed PER REQUEST with
 * the request's bearer — it is never cached, never shared, never stored.
 */
import type http from 'node:http';
import { AuthError } from '../src/core/auth/keycloakAdapter';
import type { Principal } from '../../iips-platform/src/distributed/EnterpriseRuntime';
import { TransportError } from './admin-transport';
import type { SecuredExecutor } from './secured-executor';
import {
  G2_CONTRACT_VERSION,
  G2_LINEAGE,
  G2Error,
  type G2FailureReason,
} from './user-portfolio/userPortfolioContract';
import { deriveTenantHint, classifyG2Claims } from './user-portfolio/translationBoundary';
import { IpdUserPortfolioAdapter, type G2Fetch } from './user-portfolio/ipdUserPortfolioAdapter';
import * as boundary from './user-portfolio/userPortfolioBoundary';

/**
 * The user-portfolio resource namespace. Every resource authorized through this
 * gate carries the prefix, which is what makes it a SURFACE gate rather than a
 * general read/write gate.
 */
export const USER_PORTFOLIO_RESOURCE_PREFIX = 'user-portfolio.';

/** Governed actions: `read` (viewer/analyst/admin) and `execute` (analyst/admin). */
export const USER_PORTFOLIO_READ_ACTION = 'read';
export const USER_PORTFOLIO_WRITE_ACTION = 'execute';

/** Roles admitted to the seam. Explicit and closed — anything else denies. */
const USER_PORTFOLIO_ROLES: readonly string[] = ['viewer', 'analyst', 'admin'];

/** Server-owned configuration key for the G24 base URL (never client-supplied). */
export const G2_IPD_BASE_URL_ENV = 'G2_IPD_BASE_URL';

/** Live G24 configuration for this process (base URL only — bearer is per-request). */
export interface G2LiveConfig {
  readonly baseUrl: string;
}

/**
 * The exact upstream boundary for a 503, surfaced to an AUTHENTICATED and
 * AUTHORIZED caller only (ordering guarantees this). Discloses capability
 * configuration, never data or identity.
 */
export const G2_IPD_BOUNDARY = Object.freeze({
  authoritativeBranch: G2_LINEAGE.branch,
  authoritativeCommit: G2_LINEAGE.commit,
  authoritativeTree: G2_LINEAGE.tree,
  httpContractVersion: G2_CONTRACT_VERSION,
  ipdAudience: 'ipd-user-portfolio-api',
  blocker:
    'The live seam turns on deployment configuration plus governed provisioning: ' +
    `the server-owned G24 base URL (${G2_IPD_BASE_URL_ENV}) must be set; the presented ` +
    'user bearer must carry the ipd-user-portfolio-api audience (multi-audience issuance ' +
    'is future IdP work — live-IdP certification is DEFERRED); and the bearer’s ' +
    '(issuer, subject) must have a provisioned ACTIVE G24 mapping plus an ACTIVE tenant ' +
    'membership (explicit governed provisioning acts, never implicit). Until then the ' +
    'durable surfaces answer 503: no substitute store is ever created.',
  requiresAuthorizedChange: [
    'user-delegated IPD-audience credential issuance (future IdP governance; live-IdP certification deferred)',
  ] as const,
  runtimeBaseUrlEnv: G2_IPD_BASE_URL_ENV,
  runtimeComposition:
    `Set ${G2_IPD_BASE_URL_ENV} (server-owned) to the pinned G24 HTTP base URL. The handler ` +
    'then constructs a per-request adapter presenting the request’s own bearer; G24 validates ' +
    'it independently and resolves ownership from its provisioned registry. Any step failing ' +
    'yields 503 on the durable surfaces: no substitute store is ever created.',
});

/**
 * ApiSecurity-style resource gate for the user-portfolio surface.
 *
 * Mirrors the Reports gate in shape: it recognizes the two governed actions,
 * requires the surface namespace, and requires a governed role. Fail-closed —
 * an unrecognized action, a resource outside the namespace, or a role outside
 * the closed set denies. Registered per-executor, so it cannot loosen any
 * other gate. (Role→action differentiation itself stays in the ESTABLISHED
 * ROLE_POLICY: viewer reads, analyst/admin read+execute. Nothing invented.)
 */
export function userPortfolioResourceGate(principal: Principal, action: string, resource: string): boolean {
  if (action !== USER_PORTFOLIO_READ_ACTION && action !== USER_PORTFOLIO_WRITE_ACTION) return false;
  if (!resource.startsWith(USER_PORTFOLIO_RESOURCE_PREFIX)) return false;
  return principal.roles.some((role) => (USER_PORTFOLIO_ROLES as readonly string[]).includes(role));
}

/**
 * Build the live user-portfolio executor.
 *
 * Reuses the ESTABLISHED composition seam — `createLiveAdminExecutor(gate)` —
 * exactly as the Reports and AI-advisory product tiers do. That seam wires the
 * authoritative tenant resolution and fails closed to `null` when the IdP or the
 * membership store is not configured. No new executor factory, no new directory.
 */
export async function createLiveUserPortfolioExecutor(): Promise<SecuredExecutor | null> {
  const { createLiveAdminExecutor } = await import('./admin-transport');
  return createLiveAdminExecutor((p: Principal, action: string, resource: string) =>
    userPortfolioResourceGate(p, action, resource));
}

/**
 * Resolve the live G24 configuration for this process.
 *
 * Reads the SERVER-OWNED base URL and returns `null` whenever a live upstream
 * cannot be addressed from THIS process (unset, malformed, or non-http(s)).
 * It NEVER substitutes a local, in-memory, or test-only implementation, and it
 * accepts NO credential: the bearer is always the request's own. Callers that
 * receive `null` must fail closed (durable surfaces answer 503), never fall back.
 */
export async function createLiveUserPortfolioConfig(): Promise<G2LiveConfig | null> {
  const raw = process.env[G2_IPD_BASE_URL_ENV];
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  return { baseUrl: raw.trim().replace(/\/+$/, '') };
}

/**
 * The seam scope for an authenticated principal.
 *
 * Carries ONLY the server-derived tenant hint. The `applicationUserId` half of
 * ownership is resolved upstream by G24 from the credential on every call and is
 * deliberately not representable here.
 */
export function userPortfolioScope(principal: Principal): { tenantHint: string } {
  return { tenantHint: deriveTenantHint(principal) };
}

// ---------------------------------------------------------------------------
// Surface table (server-side allowlist — the authorized resource is derived
// from this table, never from the request URL verbatim).
// ---------------------------------------------------------------------------

interface UserPortfolioSurface {
  readonly surface: string;
  readonly methods: readonly string[];
  /** Whether the surface needs a live upstream (false only for `context`). */
  readonly durable: boolean;
}

const USER_PORTFOLIO_SURFACES: ReadonlyMap<string, UserPortfolioSurface> = new Map([
  ['/api/user-portfolios/context', { surface: 'context', methods: ['GET', 'HEAD'], durable: false }],
  ['/api/user-portfolios', { surface: 'portfolios', methods: ['GET', 'HEAD', 'POST'], durable: true }],
  ['/api/user-portfolios/:portfolioId', { surface: 'portfolio', methods: ['GET', 'HEAD', 'DELETE'], durable: true }],
  ['/api/user-portfolios/:portfolioId/holdings', { surface: 'portfolio-holdings', methods: ['PUT'], durable: true }],
  ['/api/user-portfolios/:portfolioId/revisions', { surface: 'portfolio-revisions', methods: ['GET', 'HEAD'], durable: true }],
  ['/api/user-portfolios/:portfolioId/reset', { surface: 'portfolio-reset', methods: ['POST'], durable: true }],
]);

/** Top-level body fields admitted per mutating surface. Everything else is refused. */
const CREATE_BODY_KEYS: readonly string[] = ['portfolioName'];
const SAVE_BODY_KEYS: readonly string[] = [
  'mode', 'holdings', 'sourceBroker', 'fileName', 'contentDigest', 'lineageDigest', 'expectedRevision',
];
const LIFECYCLE_BODY_KEYS: readonly string[] = ['expectedRevision'];

/** Percent-decode a path segment, tolerating a malformed escape rather than throwing. */
function safeDecodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Match a request path against the SERVER-SIDE surface table.
 *
 * Strict and closed: exact strings match first (so `/api/user-portfolios/context`
 * is the context surface even though `context` is segment-shaped), then the
 * single-parameterized shapes. `/api/user-portfoliosEVIL`, deeper tails, and
 * unknown leaves are unknown (404) and can never be authorized as seam resources.
 * The `portfolioId` is the durable INSTANCE identity addressed by the path —
 * never a client claim about identity.
 */
function matchSurface(pathname: string): { surface: UserPortfolioSurface; portfolioId?: string } | null {
  const direct = USER_PORTFOLIO_SURFACES.get(pathname);
  if (direct) return { surface: direct };

  const segments = pathname.split('/').filter((s) => s.length > 0);
  // ['api', 'user-portfolios', <portfolioId>, ...]
  if (segments.length < 3 || segments[0] !== 'api' || segments[1] !== 'user-portfolios') {
    return null;
  }
  const portfolioId = safeDecodeSegment(segments[2]);
  const tail = segments.slice(3).join('/');
  const key = tail === '' ? '/api/user-portfolios/:portfolioId' : `/api/user-portfolios/:portfolioId/${tail}`;
  const surface = USER_PORTFOLIO_SURFACES.get(key);
  return surface ? { surface, portfolioId } : null;
}

/** Read a JSON request body, refusing malformed input with 400 rather than guessing. */
function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        const parsed: unknown = raw ? JSON.parse(raw) : {};
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(new TransportError(400, 'invalid-json'));
          return;
        }
        resolve(parsed as Record<string, unknown>);
      } catch {
        reject(new TransportError(400, 'invalid-json'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Refuse any field outside the admitted body shape for the surface.
 * Allowlist (not denylist): no future or nested field can widen caller control.
 * Identity/durable-identity fields are reported with their established codes.
 */
function assertBodyShape(body: Record<string, unknown>, allowed: readonly string[]): void {
  const { tenantClaim, identityKeys, durableKeys } = classifyG2Claims(body);
  if (tenantClaim !== undefined || identityKeys.length > 0) {
    throw new TransportError(400, 'client-supplied-identity-forbidden');
  }
  if (durableKeys.length > 0) {
    throw new TransportError(400, 'durable-identity-forbidden');
  }
  for (const key of Object.keys(body)) {
    if (!(allowed as readonly string[]).includes(key)) {
      throw new TransportError(400, 'unknown-field');
    }
  }
}

/**
 * Translate a boundary/adapter failure onto the governed HTTP status set.
 *
 * Fail closed: an unrecognized failure is a SERVER fault (500), never a success
 * and never a silent empty result. G24's existence-hiding (404) is preserved
 * rather than overridden; the optimistic-concurrency conflict keeps its 409;
 * upstream outages are 503 with the exact boundary (capability, never data).
 */
function apiFailure(e: unknown): { status: number; body: Record<string, unknown> } | null {
  if (e instanceof G2Error) {
    const reason: G2FailureReason = e.reason;
    switch (reason) {
      case 'INVALID_REQUEST':
        return { status: 400, body: { error: 'invalid-request', detail: { reason: e.message } } };
      case 'SAVE_GUARD_VIOLATION':
        return { status: 400, body: { error: 'save-guard-violation', detail: { reason: e.message } } };
      case 'FORBIDDEN':
        return { status: 403, body: { error: 'forbidden' } };
      case 'NOT_FOUND':
        return { status: 404, body: { error: 'not found' } };
      case 'REVISION_CONFLICT':
        return { status: 409, body: { error: 'revision-conflict', detail: { reason: e.message } } };
      case 'IPD_AUTH':
      case 'UPSTREAM_UNAVAILABLE':
        return {
          status: 503,
          body: {
            error: 'upstream-unavailable',
            detail: {
              reason,
              blocker: G2_IPD_BOUNDARY.blocker,
              requiresAuthorizedChange: G2_IPD_BOUNDARY.requiresAuthorizedChange,
              authoritativeCommit: G2_IPD_BOUNDARY.authoritativeCommit,
            },
          },
        };
      case 'METHOD_NOT_ALLOWED':
      case 'IPD_ERROR':
      default:
        return { status: 500, body: { error: 'upstream-failure', detail: { reason } } };
    }
  }
  return null;
}

/**
 * HTTP handler for `/api/user-portfolios/*`.
 *
 * Ordering is deliberate and fail-closed: authentication (401) before
 * authorization (403), authorization before any client-supplied claim is
 * inspected (400/403), and only an authorized principal learns whether a seam
 * surface is bound (404), which method it takes (405), or whether its upstream
 * is available (503). An unauthenticated caller cannot probe the namespace.
 *
 * `config` is the live upstream configuration (null ⇒ 503 on durable surfaces;
 * the non-durable `context` surface keeps working). `fetchImpl` is injectable
 * for tests; production uses the global fetch. The adapter is constructed PER
 * REQUEST with the request's bearer and is never retained.
 */
export async function handleUserPortfolioRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  executor: SecuredExecutor,
  config?: G2LiveConfig | null,
  fetchImpl?: G2Fetch,
): Promise<void> {
  const rawUrl = req.url ?? '';
  const url = rawUrl.split('?')[0];
  const bearer = (req.headers.authorization ?? '').replace(/^Bearer /, '').trim();
  res.setHeader('Content-Type', 'application/json');

  try {
    // 1. Establish the Principal server-side from the credential. Never from the body.
    const principal = await executor.authenticate(bearer);

    // 2. Authorize the seam surface. Action follows the method (reads `read`,
    //    writes `execute`); the resource comes from the server-side allowlist.
    const route = matchSurface(url);
    const resource = `${USER_PORTFOLIO_RESOURCE_PREFIX}${route?.surface.surface ?? 'unbound'}`;
    const method = req.method ?? '';
    const action = method === 'GET' || method === 'HEAD' ? USER_PORTFOLIO_READ_ACTION : USER_PORTFOLIO_WRITE_ACTION;
    executor.authorize(principal, action, resource, 0, 1000);

    // 3. Client-supplied identity is never authoritative.
    const query: Record<string, unknown> = {};
    for (const [k, v] of new URL(rawUrl || '/', 'http://localhost').searchParams.entries()) query[k] = v;
    const hasBody = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
    const body = hasBody ? await readJsonBody(req) : {};

    const { tenantClaim, identityKeys } = classifyG2Claims({ ...query, ...body });
    if (tenantClaim !== undefined) {
      // Governed tenant-isolation check: a FOREIGN tenant claim is refused 403
      // with a governed DENY audit (existing primitive; no new one).
      executor.authorizeMutation(principal, action, resource, tenantClaim, 0, 1000);
      // Reaching here means the claim named the principal's OWN tenant — still
      // client-supplied identity, and the seam hint derives only from the principal.
      throw new TransportError(400, 'client-supplied-identity-forbidden');
    }
    if (identityKeys.length > 0) throw new TransportError(400, 'client-supplied-identity-forbidden');
    for (const key of Object.keys({ ...query, ...body })) {
      if (classifyG2Claims({ [key]: true }).durableKeys.length > 0) {
        throw new TransportError(400, 'durable-identity-forbidden');
      }
    }

    // 4. Dispatch. Unknown seam paths are 404 to an AUTHORIZED principal only.
    if (!route) throw new TransportError(404, 'not found');
    const surface = route.surface;

    // 5. The method set is closed per surface; anything else is 405 with the exact Allow set.
    if (!surface.methods.includes(method)) {
      res.writeHead(405, { Allow: surface.methods.join(', ') });
      res.end(JSON.stringify({ error: 'method-not-allowed' }));
      return;
    }

    // 6a. Context surface — the only surface that needs no live upstream.
    if (surface.surface === 'context') {
      const scope = userPortfolioScope(principal);
      res.writeHead(200);
      res.end(JSON.stringify({
        boundary: 'user-portfolios',
        surface: 'context',
        resource,
        contractVersion: G2_CONTRACT_VERSION,
        principal: { userId: principal.userId, tenantId: principal.tenantId, roles: principal.roles },
        scope,
        scopeAuthority: 'authenticated principal (server-derived); never client-supplied',
        translationAuthority:
          'G24 provisioned (issuer, subject) → applicationUserId mapping + ACTIVE tenant membership; ' +
          'no identifier equivalence is assumed (see translationBoundary.ts)',
        lineage: {
          repository: G2_LINEAGE.repository,
          branch: G2_LINEAGE.branch,
          commit: G2_LINEAGE.commit,
        },
        upstream: config === undefined || config === null
          ? 'NOT BOUND — no live G24 upstream is reachable from this process'
          : 'BOUND — pinned G24 lineage (per-request adapter; IRR owns no storage)',
      }));
      return;
    }

    // 6b. Durable surfaces need the live upstream — or fail closed with 503.
    if (config === undefined || config === null) {
      throw new TransportError(503, 'upstream-unavailable', {
        reason: 'UPSTREAM_UNAVAILABLE',
        blocker: G2_IPD_BOUNDARY.blocker,
        requiresAuthorizedChange: G2_IPD_BOUNDARY.requiresAuthorizedChange,
        authoritativeCommit: G2_IPD_BOUNDARY.authoritativeCommit,
      });
    }
    const port = new IpdUserPortfolioAdapter({ baseUrl: config.baseUrl, bearer, fetchImpl });
    const isRead = method === 'GET' || method === 'HEAD';
    const portfolioId = route.portfolioId;

    // 6c. Collection: list (GET) / create (POST).
    if (surface.surface === 'portfolios' && isRead) {
      const portfolios = await boundary.listPortfolios(port, principal);
      res.writeHead(200);
      res.end(JSON.stringify({ portfolios }));
      return;
    }
    if (surface.surface === 'portfolios' && !isRead) {
      assertBodyShape(body, CREATE_BODY_KEYS);
      const portfolio = await boundary.createPortfolio(port, principal, {
        portfolioName: typeof body.portfolioName === 'string' ? body.portfolioName : undefined,
      });
      res.writeHead(201);
      res.end(JSON.stringify({ portfolio }));
      return;
    }

    // 6d. Item: read (GET) / tombstone (DELETE).
    if (surface.surface === 'portfolio' && isRead) {
      const portfolio = await boundary.getPortfolio(port, principal, portfolioId);
      res.writeHead(200);
      res.end(JSON.stringify({ portfolio }));
      return;
    }
    if (surface.surface === 'portfolio' && !isRead) {
      assertBodyShape(body, LIFECYCLE_BODY_KEYS);
      const deleted = await boundary.deletePortfolio(port, principal, portfolioId, {
        expectedRevision: body.expectedRevision,
      });
      res.writeHead(200);
      res.end(JSON.stringify(deleted));
      return;
    }

    // 6e. Save holdings (PUT). Only the caller-owned batch crosses; instance
    //     identity, revisioning, and provenance stay upstream's.
    if (surface.surface === 'portfolio-holdings') {
      assertBodyShape(body, SAVE_BODY_KEYS);
      const { holdings, expectedRevision, ...options } = body;
      const result = await boundary.saveHoldings(port, principal, portfolioId, {
        holdings,
        options,
        expectedRevision,
      });
      res.writeHead(result.isDuplicate ? 200 : 201);
      res.end(JSON.stringify(result));
      return;
    }

    // 6f. Revision history (GET).
    if (surface.surface === 'portfolio-revisions') {
      const revisions = await boundary.revisionHistory(port, principal, portfolioId);
      res.writeHead(200);
      res.end(JSON.stringify({ revisions }));
      return;
    }

    // 6g. Reset (POST). Identity preserved; governed empty revision upstream.
    assertBodyShape(body, LIFECYCLE_BODY_KEYS);
    const portfolio = await boundary.resetPortfolio(port, principal, portfolioId, {
      expectedRevision: body.expectedRevision,
    });
    res.writeHead(200);
    res.end(JSON.stringify({ portfolio }));
  } catch (e) {
    if (e instanceof AuthError) { res.writeHead(e.status); res.end(JSON.stringify({ error: e.message })); return; }
    if (e instanceof TransportError) {
      res.writeHead(e.status);
      res.end(JSON.stringify({ error: e.message, ...(e.detail ? { detail: e.detail } : {}) }));
      return;
    }
    const mapped = apiFailure(e);
    if (mapped) { res.writeHead(mapped.status); res.end(JSON.stringify(mapped.body)); return; }
    res.writeHead(500); res.end(JSON.stringify({ error: 'user-portfolio transport error', detail: String(e) }));
  }
}
