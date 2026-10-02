/**
 * Program v3.0 — G3 / NP-06: Reports product-tier transport boundary.
 *
 * This is the G3 dependency for NP-06 Reports: the `/api/reports/*` product transport binding
 * through the EXISTING server-side principal enforcement mechanism (`SecuredExecutor`).
 *
 * Step 1 supplied the canonical artifact + `reportKey` composition boundary. Step 2 supplied the
 * binding onto the authorized NP-04 common governed persistence foundation. THIS step connects
 * them: the already-secured Reports route now reaches `ReportsPersistence` through an INJECTED
 * port, so a durable artifact can be created, resolved, queried, versioned, and traced through its
 * supersession chain over HTTP.
 *
 * What is still deliberately NOT implemented here (NP-06 boundaries):
 *   - no Report artifact generation (the frozen CSIP `ReportingEngine` owns composition, and is not
 *     imported, modified, or relocated here);
 *   - no Reports UI / navigation;
 *   - no Reports-specific storage: the persistence layer is NP-04, injected at this seam.
 *
 * Enforcement chain (identical to the admin and AI-advisory tiers — no second auth primitive):
 *   Bearer credential → SecuredExecutor.authenticate → Keycloak validation
 *     → AUTHORITATIVE tenant resolution (injected TenantDirectory; `FileTenantDirectory` live)
 *     → server-derived Principal `{ userId, tenantId, roles }`                 → 401 on failure
 *   → SecuredExecutor.authorize + the Reports resource gate                    → 403 on deny
 *
 * Identity rules (NP-06 §5.4 rows 3–4):
 *   - Ownership is derived ONLY from the authenticated principal.
 *   - A client-supplied tenant claim naming a FOREIGN tenant is refused 403 by the governed
 *     tenant-isolation check (governed DENY audit) — not silently ignored.
 *   - Any other client-supplied identity/ownership field is refused 400. `companyId` and
 *     `runtimeCompanyId` are prohibited outright and always refused.
 *   - Client-supplied DURABLE identity (`reportId`, `artifactVersion`, `supersedesReportId`,
 *     `reportKey`, `schemaVersion`) is refused 400 — those are owned by the persistence foundation
 *     and by §5.3 validation, never by the caller.
 *   - The resource string authorized is derived from a SERVER-SIDE surface allowlist, never from
 *     untrusted URL text, so a client cannot select (or escape) the authorized resource.
 *
 * Process composition:
 *   The authoritative NP-04 store CANNOT be constructed inside this repository today — the pinned
 *   dependency predates NP-04 and NP-04 publishes no persistence subpath (see `NP04_BOUNDARY`).
 *   This module therefore never fabricates one: `createLiveReportsPersistence()` resolves the
 *   authoritative module and returns `null` when it is unavailable, and artifact operations then
 *   fail closed with 503. There is no in-memory, test-only, or otherwise substituted store on any
 *   production path. `/api/reports/context` remains available because it does not touch storage.
 */
import type http from 'node:http';
import { AuthError } from '../src/core/auth/keycloakAdapter';
import type { Principal } from '../../iips-platform/src/distributed/EnterpriseRuntime';
import { TransportError } from './admin-transport';
import type { SecuredExecutor } from './secured-executor';
import { ReportValidationError } from './reports/artifact';
import { CanonicalizationError } from './reports/canonical';
import { ReportPersistenceError, type ReportsPersistence } from './reports/persistence';
import { adaptNp04Store, NP04_BOUNDARY } from './reports/np04-adapter';
import { loadAuthoritativeNp04Persistence } from './reports/persistence-port';
import type { ComposeReportContentInput } from './reports/composition';

/**
 * The Reports resource namespace. Every resource authorized through the Reports gate carries this
 * prefix, which is what makes the gate a Reports-SURFACE gate rather than a general read gate.
 */
export const REPORTS_RESOURCE_PREFIX = 'reports.';

/**
 * The governed action for the Reports surface.
 *
 * `read` is the action the established ROLE_POLICY grants to every reader role (viewer, analyst,
 * admin) and is the same action token the AI-advisory product tier authorizes with
 * (`ai-advisory-transport.ts`: `executor.authorize(p, 'read', 'ai.advisory.…')`). Reports is a
 * read surface; no write action is reachable through this transport.
 *
 * The persistence operations reachable here are owner-scoped by the foundation itself (a principal
 * can only ever create, resolve, query, or version artifacts it owns), so the surface gate governs
 * ACCESS to Reports while NP-04 governs WHICH artifacts are reachable. No second authorization
 * primitive is introduced: a role-differentiated write action is NOT defined by the existing
 * governed boundary and is deliberately not invented here (reported as remaining work).
 */
export const REPORTS_ACTION = 'read';

/** Roles permitted to read the Reports surface. Explicit and closed — anything else denies. */
const REPORTS_READER_ROLES: readonly string[] = ['viewer', 'analyst', 'admin'];

/**
 * Client-supplied TENANT claims. A foreign value is a cross-tenant attempt (403, audited DENY).
 */
const TENANT_CLAIM_KEYS: readonly string[] = ['tenantId', 'tenant'];

/**
 * Client-supplied identity/ownership fields. Never authoritative; always refused (400).
 * `companyId` / `runtimeCompanyId` are prohibited by standing program constraint and are refused
 * here so that no prohibited identifier can ever reach an authorization decision.
 */
const IDENTITY_CLAIM_KEYS: readonly string[] = [
  'userId', 'user', 'subject', 'principal', 'roles', 'role', 'owner', 'ownership',
  'companyId', 'runtimeCompanyId',
];

/**
 * Client-supplied DURABLE identity / lifecycle fields. Refused (400) on every surface.
 *
 * `reportKey` is recomputed server-side from canonical content; `reportId` / `artifactVersion` /
 * `supersedesReportId` are assigned by NP-04; `schemaVersion` is the canonical schema the server
 * writes against. Letting a caller supply any of these would let it choose its own instance
 * identity, manufacture a predecessor chain, or declare a content identity it did not compute.
 */
const DURABLE_IDENTITY_KEYS: readonly string[] = [
  'reportId', 'artifactId', 'artifactVersion', 'supersedesReportId', 'reportKey', 'schemaVersion',
];

/**
 * The frozen engine's content-derived identifier form (`report-<type>-<portfolioId>`).
 * Defence in depth only: step 2 already refuses this form as a supersession target, and the
 * transport additionally refuses it wherever an INSTANCE identity is addressed.
 */
const ENGINE_ID_PREFIX = 'report-';

/**
 * SERVER-SIDE surface allowlist. The authorized resource is derived from this table — never from
 * the request URL verbatim — so an unknown path authorizes as `reports.unbound` and then 404s, and
 * cannot smuggle an arbitrary resource string into the authorization decision.
 *
 * `methods` is the closed method set per surface; anything else is 405 with that exact `Allow` set.
 */
interface ReportsSurface {
  readonly surface: string;
  readonly methods: readonly string[];
  /** Whether the surface requires the injected authoritative persistence store. */
  readonly durable: boolean;
}

const REPORTS_SURFACES: ReadonlyMap<string, ReportsSurface> = new Map([
  ['/api/reports/context', { surface: 'context', methods: ['GET', 'HEAD'], durable: false }],
  ['/api/reports/artifacts', { surface: 'artifacts', methods: ['GET', 'HEAD', 'POST'], durable: true }],
  ['/api/reports/artifacts/:reportId', { surface: 'artifact', methods: ['GET', 'HEAD'], durable: true }],
  ['/api/reports/artifacts/:reportId/versions', { surface: 'artifact-versions', methods: ['POST'], durable: true }],
  ['/api/reports/artifacts/:reportId/supersession', { surface: 'artifact-supersession', methods: ['GET', 'HEAD'], durable: true }],
]);

/** The top-level body fields a create / append request may carry. Everything else is refused. */
const COMPOSE_BODY_KEYS: readonly string[] = [
  'engineOutput', 'generatedAt', 'scenario', 'parameters', 'provenance',
];

/**
 * The exact blocker for a 503, surfaced to an AUTHENTICATED and AUTHORIZED caller.
 *
 * A caller that is not authenticated never reaches this (401), and one that is not authorized
 * never reaches it either (403), so this discloses capability, never data or identity.
 */
const PERSISTENCE_UNAVAILABLE_DETAIL: Readonly<Record<string, unknown>> = Object.freeze({
  reason: 'the authoritative NP-04 governed persistence store is not available to this process',
  blocker: NP04_BOUNDARY.blocker,
  requiresAuthorizedChange: NP04_BOUNDARY.requiresAuthorizedChange,
  authoritativeCommit: NP04_BOUNDARY.authoritativeCommit,
});

/**
 * ApiSecurity-style resource gate for the Reports surface.
 *
 * Mirrors `adminResourceGate` in shape: it recognizes the Reports action and requires the Reports
 * resource namespace, then requires one of the governed reader roles. It is fail-closed — an
 * unrecognized action, a resource outside the namespace, or a role outside the closed set denies.
 * It is registered per-executor, so it cannot loosen the admin or AI-advisory gates.
 */
export function reportsResourceGate(principal: Principal, action: string, resource: string): boolean {
  if (action !== REPORTS_ACTION) return false;
  if (!resource.startsWith(REPORTS_RESOURCE_PREFIX)) return false;
  return principal.roles.some((role) => REPORTS_READER_ROLES.includes(role));
}

/**
 * Build the live Reports executor.
 *
 * Reuses the ESTABLISHED composition seam — `createLiveAdminExecutor(gate)` — exactly as the
 * AI-advisory product tier does (`createLiveAiExecutor`). That seam is what wires the authoritative
 * tenant resolution (`FileTenantDirectory` over the durable IIPS membership store) and fails closed
 * to `null` when the IdP or the membership store is not configured. No new executor factory, no new
 * directory, and no TenantDirectory replacement is introduced.
 */
export async function createLiveReportsExecutor(): Promise<SecuredExecutor | null> {
  const { createLiveAdminExecutor } = await import('./admin-transport');
  return createLiveAdminExecutor((p: Principal, action: string, resource: string) =>
    reportsResourceGate(p, action, resource));
}

/**
 * Resolve the authoritative NP-04 persistence store for this process.
 *
 * The narrowest composition interface the boundary permits: it resolves the authoritative module
 * through the declared port and adapts the store it exposes, and returns `null` when the module is
 * not available — which is the current, verified state (see `NP04_BOUNDARY`).
 *
 * It NEVER substitutes a local, in-memory, or test-only implementation, and it constructs no
 * database of its own: the governed database is owned by NP-04 and by the process that owns it.
 * Callers that receive `null` must fail closed (this module answers 503), never fall back.
 */
export async function createLiveReportsPersistence(): Promise<ReportsPersistence | null> {
  const port = await loadAuthoritativeNp04Persistence();
  if (port === null) return null; // fail closed — no substitute, ever
  const { ReportsPersistence } = await import('./reports/persistence');
  return new ReportsPersistence(adaptNp04Store(port));
}

/**
 * The ownership key a Reports artifact is bound to.
 *
 * Derived solely from the authenticated principal. There is deliberately no parameter through
 * which a caller can supply an owner.
 */
export function reportsOwnership(principal: Principal): { tenantId: string; userId: string } {
  return { tenantId: principal.tenantId, userId: principal.userId };
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

/** Split client-supplied keys into a usable tenant claim and forbidden identity fields. */
function classifyClaims(source: Record<string, unknown>): { tenantClaim?: string; identityKeys: string[] } {
  const identityKeys: string[] = [];
  let tenantClaim: string | undefined;
  for (const key of Object.keys(source)) {
    if (TENANT_CLAIM_KEYS.includes(key)) {
      const value = source[key];
      if (typeof value === 'string' && value.length > 0) tenantClaim = value;
      else identityKeys.push(key);
    } else if (IDENTITY_CLAIM_KEYS.includes(key)) {
      identityKeys.push(key);
    }
  }
  return { tenantClaim, identityKeys };
}

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
 * Strict and closed: a path is matched only by exact segment shape, so `/api/reportsEVIL` and
 * `/api/reports/artifacts/x/y/z` are unknown (404), and an unknown path can never be authorized as
 * a Reports resource. The `reportId` is the durable INSTANCE identity addressed by the resource
 * path — never a client claim about identity.
 */
function matchReportsSurface(pathname: string): { surface: ReportsSurface; reportId?: string } | null {
  const direct = REPORTS_SURFACES.get(pathname);
  if (direct) return { surface: direct };

  const segments = pathname.split('/').filter((s) => s.length > 0);
  // ['api', 'reports', 'artifacts', <reportId>, ...]
  if (segments.length < 4 || segments[0] !== 'api' || segments[1] !== 'reports' || segments[2] !== 'artifacts') {
    return null;
  }
  const reportId = safeDecodeSegment(segments[3]);
  const tail = segments.slice(4).join('/');
  const key =
    tail === '' ? '/api/reports/artifacts/:reportId' : `/api/reports/artifacts/:reportId/${tail}`;
  const surface = REPORTS_SURFACES.get(key);
  return surface ? { surface, reportId } : null;
}

/**
 * Validate the addressed durable instance identity.
 *
 * A content-derived engine identifier is NOT an instance identity: accepting one would be exactly
 * the substitution step 2 forbids, so it is refused as an invalid request rather than resolved.
 */
function requireInstanceId(reportId: string | undefined): string {
  if (typeof reportId !== 'string' || reportId.length === 0) {
    throw new TransportError(400, 'reportId-required');
  }
  if (reportId.startsWith(ENGINE_ID_PREFIX)) {
    throw new TransportError(400, 'content-identity-not-an-instance-id');
  }
  return reportId;
}

/**
 * Refuse any client-supplied durable identity, and any field outside the create/append shape.
 *
 * This is the fail-closed companion to `classifyClaims`: instead of a denylist alone, an ALLOWLIST
 * bounds the body exactly, so no future or nested field can widen what a caller controls. Identity
 * fields are reported with the established code; durable identity fields with their own.
 */
function assertComposeBody(body: Record<string, unknown>): void {
  for (const key of Object.keys(body)) {
    if (DURABLE_IDENTITY_KEYS.includes(key)) {
      throw new TransportError(400, 'durable-identity-forbidden');
    }
  }
  for (const key of Object.keys(body)) {
    if (IDENTITY_CLAIM_KEYS.includes(key) || TENANT_CLAIM_KEYS.includes(key)) {
      throw new TransportError(400, 'client-supplied-identity-forbidden');
    }
  }
  for (const key of Object.keys(body)) {
    if (!COMPOSE_BODY_KEYS.includes(key)) {
      throw new TransportError(400, 'unknown-field');
    }
  }
}

/**
 * Map a request body onto the persistence layer's composition input, 1:1.
 *
 * No transformation, no defaults, and no derivation: `reportType` / `portfolioId` are read from the
 * engine output by composition (and the engine's own identifier is checked against its known form),
 * `reportKey` is recomputed by the canonicalization authority, and instance identity is assigned by
 * NP-04. The transport only carries the fields the caller legitimately owns.
 */
function composeInputFrom(body: Record<string, unknown>): ComposeReportContentInput {
  const engineOutput = body.engineOutput;
  if (engineOutput === undefined || engineOutput === null) {
    throw new TransportError(400, 'engineOutput-required');
  }
  const generatedAt = body.generatedAt;
  if (typeof generatedAt !== 'string' || generatedAt.length === 0) {
    throw new TransportError(400, 'generatedAt-required');
  }
  const input: Record<string, unknown> = { engineOutput, generatedAt };
  if ('scenario' in body) input.scenario = body.scenario;
  if ('parameters' in body) input.parameters = body.parameters;
  if ('provenance' in body) input.provenance = body.provenance;
  return input as unknown as ComposeReportContentInput;
}

/** Read an optional `limit` from the query string, refusing anything that is not a positive integer. */
function parseLimit(query: Record<string, unknown>): number | undefined {
  const raw = query.limit;
  if (raw === undefined) return undefined;
  const text = String(raw);
  if (!/^[1-9][0-9]*$/.test(text)) throw new TransportError(400, 'invalid-limit');
  return Number(text);
}

/**
 * Translate a persistence/validation failure onto the governed HTTP status set.
 *
 * Fail closed: an unrecognized persistence failure is a SERVER fault (500), never a success and
 * never a silent empty result. Ownership violations raised by the foundation are 403. A missing or
 * cross-owner instance is reported by the foundation as NOT_FOUND — that is its deliberate
 * existence-hiding semantics and is preserved rather than overridden (see the report).
 */
function apiFailure(e: unknown): { status: number; body: Record<string, unknown> } | null {
  // §5.2 canonicalization rejections and §5.3 artifact rejections are both CLIENT errors: the
  // submitted content could not form a valid canonical artifact. They are separate classes (a
  // canonicalization rejection is not an artifact-validation rejection), so both must be mapped.
  if (e instanceof ReportValidationError || e instanceof CanonicalizationError) {
    return { status: 400, body: { error: 'invalid-report-artifact', detail: { reason: e.message } } };
  }
  if (e instanceof ReportPersistenceError) {
    const cause = (e as { cause?: unknown }).cause;
    const code = (cause as { code?: string } | null | undefined)?.code;
    switch (code) {
      case 'NOT_FOUND':
        return { status: 404, body: { error: 'not found' } };
      case 'OWNERSHIP_MISMATCH':
      case 'OWNERSHIP_REQUIRED':
      case 'IMMUTABLE_ARTIFACT':
        return { status: 403, body: { error: 'forbidden' } };
      case 'SUPERSESSION_CONFLICT':
      case 'ARTIFACT_VALIDATION_FAILED':
        return { status: 400, body: { error: 'invalid-request', detail: { reason: e.message } } };
      default:
        return { status: 500, body: { error: 'persistence-failure', detail: { reason: e.message, code: code ?? null } } };
    }
  }
  return null;
}

/**
 * HTTP handler for `/api/reports/*`.
 *
 * Ordering is deliberate and fail-closed: authentication (401) is decided before authorization
 * (403), authorization before any client-supplied claim is inspected (400), and only an authorized
 * principal learns whether a Reports surface is bound (404) or whether its storage is available
 * (503). An unauthenticated caller therefore cannot probe the namespace, and an authenticated but
 * unauthorized caller cannot either.
 *
 * `persistence` is INJECTED — this module never constructs a store. It is optional only so that the
 * non-durable `context` surface keeps working when no authoritative store is available; every
 * durable surface refuses with 503 in that case rather than degrading to anything else.
 */
export async function handleReportsRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  executor: SecuredExecutor,
  persistence?: ReportsPersistence | null,
): Promise<void> {
  const rawUrl = req.url ?? '';
  const url = rawUrl.split('?')[0];
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '').trim();
  res.setHeader('Content-Type', 'application/json');

  /** The injected authoritative store, or a fail-closed 503 — never a substitute. */
  function store(): ReportsPersistence {
    if (persistence === undefined || persistence === null) {
      throw new TransportError(503, 'persistence-unavailable', PERSISTENCE_UNAVAILABLE_DETAIL);
    }
    return persistence;
  }

  try {
    // 1. Establish the Principal server-side from the credential. Never from the request body.
    const principal = await executor.authenticate(token);

    // 2. Authorize the Reports surface. The resource comes from the server-side allowlist.
    const route = matchReportsSurface(url);
    const resource = `${REPORTS_RESOURCE_PREFIX}${route?.surface.surface ?? 'unbound'}`;
    executor.authorize(principal, REPORTS_ACTION, resource, 0, 1000);

    // 3. Client-supplied identity is never authoritative (NP-06 §5.4 rows 3–4).
    const query: Record<string, unknown> = {};
    for (const [k, v] of new URL(rawUrl || '/', 'http://localhost').searchParams.entries()) query[k] = v;
    const hasBody = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE';
    const body = hasBody ? await readJsonBody(req) : {};

    const { tenantClaim, identityKeys } = classifyClaims({ ...query, ...body });

    if (tenantClaim !== undefined) {
      // Governed tenant-isolation check: a FOREIGN tenant claim is a cross-tenant attempt and is
      // refused 403 with a governed DENY audit (reuses the existing audited primitive; no new one).
      executor.authorizeMutation(principal, REPORTS_ACTION, resource, tenantClaim, 0, 1000);
      // Reaching here means the claim named the principal's OWN tenant — still client-supplied
      // identity, and ownership must derive only from the authenticated principal.
      throw new TransportError(400, 'client-supplied-identity-forbidden');
    }
    if (identityKeys.length > 0) throw new TransportError(400, 'client-supplied-identity-forbidden');
    for (const key of Object.keys({ ...query, ...body })) {
      if (DURABLE_IDENTITY_KEYS.includes(key)) throw new TransportError(400, 'durable-identity-forbidden');
    }

    // 4. Dispatch. Unknown Reports paths are 404 to an AUTHORIZED principal only.
    if (!route) throw new TransportError(404, 'not found');
    const surface = route.surface;

    // 5. The method set is closed per surface; anything else is 405 with the exact Allow set.
    if (!surface.methods.includes(req.method ?? '')) {
      res.writeHead(405, { Allow: surface.methods.join(', ') });
      res.end(JSON.stringify({ error: 'method-not-allowed' }));
      return;
    }

    const isRead = req.method === 'GET' || req.method === 'HEAD';
    const ownership = reportsOwnership(principal);

    // 6a. Context surface — unchanged, and the only surface that needs no durable storage.
    if (surface.surface === 'context') {
      res.writeHead(200);
      res.end(JSON.stringify({
        boundary: 'reports',
        surface: 'context',
        resource,
        principal: { userId: principal.userId, tenantId: principal.tenantId, roles: principal.roles },
        ownership,
        ownershipAuthority: 'authenticated principal (server-derived); never client-supplied',
        artifactStore: persistence === undefined || persistence === null
          ? 'NOT BOUND — no authoritative NP-04 store is reachable from this process'
          : 'BOUND — authoritative NP-04 governed persistence (injected; Reports owns no storage)',
      }));
      return;
    }

    // 6b. Create a durable artifact. Only the engine output and the caller-owned content fields
    //     cross the boundary; instance identity is assigned by the foundation.
    if (surface.surface === 'artifacts' && !isRead) {
      assertComposeBody(body);
      const artifact = store().persistNew(principal, composeInputFrom(body));
      res.writeHead(201);
      res.end(JSON.stringify({ artifact }));
      return;
    }

    // 6c. Query the authenticated principal's own artifacts (heads-only, as NP-04 defines it).
    if (surface.surface === 'artifacts' && isRead) {
      const page = store().queryByOwner(principal, { limit: parseLimit(query) });
      res.writeHead(200);
      res.end(JSON.stringify({ items: page.items, nextCursor: page.nextCursor }));
      return;
    }

    // 6d. Resolve one durable artifact by instance identity.
    if (surface.surface === 'artifact') {
      const artifact = store().resolve(principal, requireInstanceId(route.reportId));
      res.writeHead(200);
      res.end(JSON.stringify({ artifact }));
      return;
    }

    // 6e. Append an authorized new lifecycle version. The predecessor is the ADDRESSED instance —
    //     never a body field — so a caller cannot manufacture a chain.
    if (surface.surface === 'artifact-versions') {
      assertComposeBody(body);
      const artifact = store().appendVersion(principal, requireInstanceId(route.reportId), composeInputFrom(body));
      res.writeHead(201);
      res.end(JSON.stringify({ artifact }));
      return;
    }

    // 6f. Supersession lookup (NP-04 `listSupersededBy`; no second chain implementation).
    const view = store().supersessionChain(principal, requireInstanceId(route.reportId));
    res.writeHead(200);
    res.end(JSON.stringify({ current: view.current, history: view.history }));
  } catch (e) {
    if (e instanceof AuthError) { res.writeHead(e.status); res.end(JSON.stringify({ error: e.message })); return; }
    if (e instanceof TransportError) {
      res.writeHead(e.status);
      res.end(JSON.stringify({ error: e.message, ...(e.detail ? { detail: e.detail } : {}) }));
      return;
    }
    const mapped = apiFailure(e);
    if (mapped) { res.writeHead(mapped.status); res.end(JSON.stringify(mapped.body)); return; }
    res.writeHead(500); res.end(JSON.stringify({ error: 'reports transport error', detail: String(e) }));
  }
}
