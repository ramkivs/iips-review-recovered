/**
 * Program v3.0 — SPA OIDC client tests (offline; mocked discovery/token endpoints).
 *
 * Verifies the browser-side half of the authentication handoff: PKCE S256 correctness,
 * authorize-URL construction, state-validated code exchange, refresh, Bearer attachment by
 * authFetch (and that unauthenticated requests stay BARE — 401 semantics preserved), and the
 * presentation-session mapping. No network, no Keycloak.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHash } from 'node:crypto';
import {
  OIDC_CONFIG,
  buildAuthorizeUrl,
  pkcePair,
  completeLogin,
  getAccessToken,
  authFetch,
  getOidcSession,
  logout,
} from './oidcClient';

// jsdom lacks WebCrypto subtle; polyfill from Node for the S256 tests.
if (!globalThis.crypto.subtle) {
  Object.defineProperty(globalThis.crypto, 'subtle', {
    value: (await import('node:crypto')).webcrypto.subtle,
    configurable: true,
  });
}

const DISCOVERY = {
  issuer: 'http://127.0.0.1:8080/realms/iips',
  authorization_endpoint: 'http://127.0.0.1:8080/realms/iips/protocol/openid-connect/auth',
  token_endpoint: 'http://127.0.0.1:8080/realms/iips/protocol/openid-connect/token',
};

function b64uJson(obj: unknown): string {
  const s = btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return s;
}

function makeToken(claims: Record<string, unknown>): string {
  return `header.${b64uJson(claims)}.signature`;
}

const VIEWER_CLAIMS = {
  iss: DISCOVERY.issuer,
  aud: 'iips-spa',
  preferred_username: 'viewer-a',
  tenant: 'tenant-A',
  exp: Math.floor(Date.now() / 1000) + 3600,
  realm_access: { roles: ['iips-viewer'] },
};

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  sessionStorage.clear();
  fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/.well-known/openid-configuration')) {
      return new Response(JSON.stringify(DISCOVERY), { status: 200 });
    }
    if (url === DISCOVERY.token_endpoint) {
      return new Response(JSON.stringify({ access_token: makeToken(VIEWER_CLAIMS), refresh_token: 'rt-1', expires_in: 3600 }), { status: 200 });
    }
    return new Response('{}', { status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PKCE (RFC 7636, S256)', () => {
  it('derives the challenge as BASE64URL(SHA-256(verifier)) with an RFC-length verifier', async () => {
    const { verifier, challenge } = await pkcePair();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(verifier.length).toBeLessThanOrEqual(128);
    const expected = createHash('sha256').update(verifier).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(challenge).toBe(expected);
  });

  it('produces a distinct verifier per call', async () => {
    const a = await pkcePair();
    const b = await pkcePair();
    expect(a.verifier).not.toBe(b.verifier);
  });
});

describe('authorize redirect URL', () => {
  it('requests authorization_code with PKCE S256 for the iips-spa public client', () => {
    const url = buildAuthorizeUrl(DISCOVERY, OIDC_CONFIG, { verifier: 'v', state: 'st', redirectUri: 'http://127.0.0.1:5173/' }, 'challenge-abc');
    const q = new URL(url).searchParams;
    expect(url.startsWith(DISCOVERY.authorization_endpoint)).toBe(true);
    expect(q.get('client_id')).toBe('iips-spa');
    expect(q.get('response_type')).toBe('code');
    expect(q.get('scope')).toBe('openid');
    expect(q.get('code_challenge')).toBe('challenge-abc');
    expect(q.get('code_challenge_method')).toBe('S256');
    expect(q.get('state')).toBe('st');
  });
});

describe('callback completion', () => {
  it('exchanges the code with the stored verifier and stores the session', async () => {
    sessionStorage.setItem('iips.oidc.tx', JSON.stringify({ verifier: 'the-verifier', state: 'st-1', redirectUri: 'http://127.0.0.1:5173/' }));
    const session = await completeLogin('http://127.0.0.1:5173/?code=abc&state=st-1&session_state=x');
    expect(session).toEqual({ userId: 'viewer-a', tenantId: 'tenant-A', role: 'viewer', authenticated: true });

    const tokenCall = fetchMock.mock.calls.find((c) => String(c[0]) === DISCOVERY.token_endpoint);
    expect(tokenCall).toBeTruthy();
    const body = new URLSearchParams(String((tokenCall![1] as RequestInit).body));
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code')).toBe('abc');
    expect(body.get('code_verifier')).toBe('the-verifier');
    expect(body.get('client_id')).toBe('iips-spa');
    // Transaction consumed after use.
    expect(sessionStorage.getItem('iips.oidc.tx')).toBeNull();
  });

  it('FAILS CLOSED on state mismatch and never calls the token endpoint', async () => {
    sessionStorage.setItem('iips.oidc.tx', JSON.stringify({ verifier: 'v', state: 'legit', redirectUri: 'http://x/' }));
    await expect(completeLogin('http://127.0.0.1:5173/?code=abc&state=evil')).rejects.toThrow(/invalid OIDC callback/);
    expect(fetchMock).not.toHaveBeenCalledWith(DISCOVERY.token_endpoint, expect.anything());
    expect(await getAccessToken()).toBeNull();
  });
});

describe('authFetch credential handoff', () => {
  it('attaches the genuine Bearer credential when a session exists', async () => {
    sessionStorage.setItem('iips.oidc.tx', JSON.stringify({ verifier: 'v', state: 'st', redirectUri: 'http://127.0.0.1:5173/' }));
    await completeLogin('http://127.0.0.1:5173/?code=abc&state=st');
    const stored = JSON.parse(sessionStorage.getItem('iips.oidc.session')!) as { accessToken: string };
    await authFetch('/api/executive');
    const call = fetchMock.mock.calls.find((c) => String(c[0]) === '/api/executive');
    expect(new Headers((call![1] as RequestInit).headers).get('Authorization')).toBe(`Bearer ${stored.accessToken}`);
  });

  it('sends UNAUTHENTICATED requests bare (never fabricates a credential — 401 semantics preserved)', async () => {
    await authFetch('/api/executive');
    const call = fetchMock.mock.calls.find((c) => String(c[0]) === '/api/executive');
    const headers = new Headers((call![1] as RequestInit).headers);
    expect(headers.get('Authorization')).toBeNull();
  });
});

describe('presentation session (untrusted display hints only)', () => {
  it('maps governed realm roles to the presentation role and clears on logout', async () => {
    sessionStorage.setItem('iips.oidc.tx', JSON.stringify({ verifier: 'v', state: 'st', redirectUri: 'http://127.0.0.1:5173/' }));
    await completeLogin('http://127.0.0.1:5173/?code=abc&state=st');
    expect(getOidcSession()).toMatchObject({ userId: 'viewer-a', tenantId: 'tenant-A', role: 'viewer', authenticated: true });
    logout();
    expect(getOidcSession()).toEqual({ userId: 'anonymous', tenantId: 'system', role: 'viewer', authenticated: false });
    expect(await getAccessToken()).toBeNull();
  });

  it('treats an expired session as unauthenticated', async () => {
    sessionStorage.setItem('iips.oidc.session', JSON.stringify({
      accessToken: makeToken(VIEWER_CLAIMS), expiresAt: Date.now() - 1000, payload: VIEWER_CLAIMS,
    }));
    expect(getOidcSession().authenticated).toBe(false);
  });
});
