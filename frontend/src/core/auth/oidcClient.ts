/**
 * Program v3.0 — SPA OIDC client: Keycloak authorization-code + PKCE (S256) browser login.
 *
 * This closes the SPA → certified-transport authentication handoff gap (Phase 0 audit G3):
 * Keycloak remains the AUTHENTICATION authority; the browser obtains a genuine OIDC
 * credential through the standard authorization-code flow with PKCE S256 (public client
 * `iips-spa`, realm `iips`), retains it in session storage, and attaches it as a Bearer
 * credential via `authFetch`. The server validates the token through the approved OIDC
 * verification boundary (SecuredExecutor + RealKeycloakVerifier/JWKS RS256) — claims decoded
 * here are PRESENTATION HINTS ONLY and are never trusted by any server component.
 *
 * Authorization authority remains IIPS v2.0 (EnterpriseRuntime / ApiSecurity) — server-side.
 * 401 (unauthenticated) vs 403 (authenticated-but-unauthorized) semantics are preserved and
 * never relaxed here: `authFetch` attaches a credential when one exists and NEVER fabricates
 * one; unauthenticated requests still reach the server without a credential and receive 401.
 *
 * No second authentication mechanism is introduced: this is the browser-side half of the
 * existing authContract/keycloakAdapter boundary (SessionValidator on the server side).
 */
import type { Session } from '../session/session';

/** Public-client OIDC configuration (Keycloak realm `iips`, SPA client `iips-spa`). */
export interface OidcClientConfig {
  readonly keycloakUrl: string;
  readonly realm: string;
  readonly clientId: string;
}

/** Typed accessor for Vite build-time env (absent under plain tsc/vitest without vite/client types). */
const ENV = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

/** Defaults match the approved local Keycloak environment (127.0.0.1:8080, realm iips). */
export const OIDC_CONFIG: OidcClientConfig = {
  keycloakUrl: ENV.VITE_KEYCLOAK_URL ?? 'http://127.0.0.1:8080',
  realm: 'iips',
  clientId: 'iips-spa',
};

interface DiscoveryDoc {
  readonly issuer: string;
  readonly authorization_endpoint: string;
  readonly token_endpoint: string;
  readonly end_session_endpoint?: string;
}

interface TokenResponse {
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
}

interface StoredSession {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt: number; // epoch ms
  readonly payload: Record<string, unknown>;
}

const SESSION_KEY = 'iips.oidc.session';
const TX_KEY = 'iips.oidc.tx';

let discoveryCache: DiscoveryDoc | null = null;

/** Real OIDC discovery against the configured Keycloak realm (cached per page load). */
export async function discover(cfg: OidcClientConfig = OIDC_CONFIG): Promise<DiscoveryDoc> {
  if (discoveryCache) return discoveryCache;
  const url = `${cfg.keycloakUrl.replace(/\/$/, '')}/realms/${cfg.realm}/.well-known/openid-configuration`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OIDC discovery failed: ${res.status}`);
  discoveryCache = (await res.json()) as DiscoveryDoc;
  return discoveryCache;
}

// --- PKCE (RFC 7636), challenge method S256 — matches the authorized client configuration. ---

function b64u(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export interface PkcePair {
  readonly verifier: string;
  readonly challenge: string;
}

/** Generate a PKCE pair with the S256 challenge method. */
export async function pkcePair(): Promise<PkcePair> {
  const random = new Uint8Array(32);
  globalThis.crypto.getRandomValues(random);
  const verifier = b64u(random);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: b64u(new Uint8Array(digest)) };
}

interface LoginTx {
  readonly verifier: string;
  readonly state: string;
  readonly redirectUri: string;
}

/** Build the authorization redirect URL (pure; exported for tests). */
export function buildAuthorizeUrl(doc: DiscoveryDoc, cfg: OidcClientConfig, tx: LoginTx, challenge: string): string {
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    response_type: 'code',
    scope: 'openid',
    redirect_uri: tx.redirectUri,
    state: tx.state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  return `${doc.authorization_endpoint}?${params.toString()}`;
}

/** True when the current URL carries an OIDC authorization response (code + state). */
export function hasPendingRedirect(href: string = window.location.href): boolean {
  const q = new URL(href).searchParams;
  return q.has('code') && q.has('state');
}

/** Begin browser login: store the PKCE transaction, then redirect to Keycloak. */
export async function beginLogin(redirectUri: string = window.location.origin + window.location.pathname): Promise<void> {
  const [doc, pkce] = await Promise.all([discover(), pkcePair()]);
  const tx: LoginTx = { verifier: pkce.verifier, state: globalThis.crypto.randomUUID(), redirectUri };
  sessionStorage.setItem(TX_KEY, JSON.stringify(tx));
  window.location.href = buildAuthorizeUrl(doc, OIDC_CONFIG, tx, pkce.challenge);
}

function decodePayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('malformed token');
  const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))) as Record<string, unknown>;
}

function readSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StoredSession;
    return s.accessToken ? s : null;
  } catch {
    return null;
  }
}

function writeSession(s: StoredSession | null): void {
  if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else sessionStorage.removeItem(SESSION_KEY);
}

/** Complete the authorization callback: validate state, exchange the code with the verifier. */
export async function completeLogin(href: string = window.location.href): Promise<Session> {
  const url = new URL(href);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const txRaw = sessionStorage.getItem(TX_KEY);
  const tx = txRaw ? (JSON.parse(txRaw) as LoginTx) : null;
  if (!code || !state || !tx || tx.state !== state) {
    sessionStorage.removeItem(TX_KEY);
    throw new Error('invalid OIDC callback (state mismatch or missing transaction)');
  }
  const doc = await discover();
  const res = await fetch(doc.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: OIDC_CONFIG.clientId,
      code,
      redirect_uri: tx.redirectUri,
      code_verifier: tx.verifier,
    }),
  });
  sessionStorage.removeItem(TX_KEY);
  if (!res.ok) throw new Error(`OIDC token exchange failed: ${res.status}`);
  const t = (await res.json()) as TokenResponse;
  const expiresInMs = (t.expires_in ?? 300) * 1000;
  writeSession({
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    expiresAt: Date.now() + expiresInMs - 30_000, // 30s clock-skew guard
    payload: decodePayload(t.access_token),
  });
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('session_state');
  window.history.replaceState({}, '', url.pathname + (url.search || '') + url.hash);
  return getOidcSession();
}

/** Use the refresh token when available; returns the new session or null. */
async function tryRefresh(s: StoredSession, doc: DiscoveryDoc): Promise<StoredSession | null> {
  if (!s.refreshToken) return null;
  const res = await fetch(doc.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: OIDC_CONFIG.clientId,
      refresh_token: s.refreshToken,
    }),
  });
  if (!res.ok) { writeSession(null); return null; }
  const t = (await res.json()) as TokenResponse;
  const next: StoredSession = {
    accessToken: t.access_token,
    refreshToken: t.refresh_token ?? s.refreshToken,
    expiresAt: Date.now() + (t.expires_in ?? 300) * 1000 - 30_000,
    payload: decodePayload(t.access_token),
  };
  writeSession(next);
  return next;
}

/** Return a valid access token (refreshing when possible), or null when unauthenticated. */
export async function getAccessToken(): Promise<string | null> {
  const s = readSession();
  if (!s) return null;
  if (Date.now() >= s.expiresAt) {
    try {
      const refreshed = await tryRefresh(s, await discover());
      return refreshed?.accessToken ?? null;
    } catch {
      return null;
    }
  }
  return s.accessToken;
}

/**
 * fetch with the OIDC Bearer credential attached when a session exists.
 * NEVER invents a credential; unauthenticated requests are sent bare (server answers 401).
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  if (!token) return fetch(input, init);
  const headers = new Headers(init.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

/** Map a governed realm role to the presentation role (display-only; untrusted). */
function presentationRole(payload: Record<string, unknown>): Session['role'] {
  const roles = (payload.realm_access as { roles?: string[] } | undefined)?.roles ?? [];
  if (roles.includes('iips-admin')) return 'admin';
  if (roles.includes('iips-analyst')) return 'analyst';
  return 'viewer';
}

/**
 * Presentation session derived from the retained token payload. UNTRUSTED display hints only:
 * real authentication/authorization decisions are made server-side via the verified token.
 */
export function getOidcSession(): Session {
  const s = readSession();
  if (!s || Date.now() >= s.expiresAt) {
    return { userId: 'anonymous', tenantId: 'system', role: 'viewer', authenticated: false };
  }
  const username = typeof s.payload.preferred_username === 'string' ? s.payload.preferred_username : 'unknown';
  const tenant = typeof s.payload.tenant === 'string' ? s.payload.tenant : 'system';
  return { userId: username, tenantId: tenant, role: presentationRole(s.payload), authenticated: true };
}

/** Clear the retained credential (revocation/logout remains delegated to Keycloak). */
export function logout(): void {
  writeSession(null);
  sessionStorage.removeItem(TX_KEY);
}
