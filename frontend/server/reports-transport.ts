/**
 * Program v3.0 — G3 / NP-06 P1: Reports product-tier transport boundary.
 *
 * This is the G3 dependency for NP-06 Reports: the `/api/reports/*` product transport binding
 * through the EXISTING server-side principal enforcement mechanism (`SecuredExecutor`).
 *
 * Boundary only. Deliberately NOT implemented here (NP-06 boundaries):
 *   - no durable Reports storage (NP-04 owns persistence);
 *   - no Report artifact generation (the frozen CSIP `ReportingEngine` owns composition, and is
 *     not imported, modified, or relocated here);
 *   - no Reports UI / navigation.
 * No Reports artifact store is bound at this tier, and nothing is fabricated to stand in for one.
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
 *   - The resource string authorized is derived from a SERVER-SIDE surface allowlist, never from
 *     untrusted URL text, so a client cannot select (or escape) the authorized resource.
 */
import type http from 'node:http';
import { AuthError } from '../src/core/auth/keycloakAdapter';
import type { Principal } from '../../iips-platform/src/distributed/EnterpriseRuntime';
import { TransportError } from './admin-transport';
import type { SecuredExecutor } from './secured-executor';

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
 */
export const REPORTS_ACTION = 'read';

/** Roles permitted to read the Reports surface. Explicit and closed — anything else denies. */
const REPORTS_READER_ROLES: readonly string[] = ['viewer', 'analyst', 'admin'];

/**
 * SERVER-SIDE surface allowlist. The authorized resource is derived from this map — never from the
 * request URL verbatim — so an unknown path authorizes as `reports.unbound` and then 404s, and
 * cannot smuggle an arbitrary resource string into the authorization decision.
 */
const REPORTS_SURFACES: ReadonlyMap<string, string> = new Map([['/api/reports/context', 'context']]);

/** Client-supplied TENANT claims. A foreign value is a cross-tenant attempt (403, audited DENY). */
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

/**
 * HTTP handler for `/api/reports/*`.
 *
 * Ordering is deliberate and fail-closed: authentication (401) is decided before authorization
 * (403), authorization before any client-supplied claim is inspected (400), and only an authorized
 * principal learns whether a Reports surface is bound (404). An unauthenticated caller therefore
 * cannot probe the namespace, and an authenticated but unauthorized caller cannot either.
 */
export async function handleReportsRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  executor: SecuredExecutor,
): Promise<void> {
  const rawUrl = req.url ?? '';
  const url = rawUrl.split('?')[0];
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '').trim();
  res.setHeader('Content-Type', 'application/json');
  try {
    // 1. Establish the Principal server-side from the credential. Never from the request body.
    const principal = await executor.authenticate(token);

    // 2. Authorize the Reports surface. The resource comes from the server-side allowlist.
    const surface = REPORTS_SURFACES.get(url);
    const resource = `${REPORTS_RESOURCE_PREFIX}${surface ?? 'unbound'}`;
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

    // 4. Dispatch. Unknown Reports paths are 404 to an AUTHORIZED principal only.
    if (!surface) throw new TransportError(404, 'not found');
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end(JSON.stringify({ error: 'method-not-allowed' }));
      return;
    }

    const ownership = reportsOwnership(principal);
    res.writeHead(200);
    res.end(JSON.stringify({
      boundary: 'reports',
      surface,
      resource,
      principal: { userId: principal.userId, tenantId: principal.tenantId, roles: principal.roles },
      ownership,
      ownershipAuthority: 'authenticated principal (server-derived); never client-supplied',
      artifactStore: 'NOT BOUND — no Reports artifact store is reachable at this tier',
    }));
  } catch (e) {
    if (e instanceof AuthError) { res.writeHead(e.status); res.end(JSON.stringify({ error: e.message })); return; }
    if (e instanceof TransportError) { res.writeHead(e.status); res.end(JSON.stringify({ error: e.message })); return; }
    res.writeHead(500); res.end(JSON.stringify({ error: 'reports transport error', detail: String(e) }));
  }
}
