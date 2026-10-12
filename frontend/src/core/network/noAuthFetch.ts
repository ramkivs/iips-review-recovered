/**
 * Make a same-origin/API request without cookies, HTTP authentication, or bearer credentials.
 *
 * In-scope first-party services are directly accessible and do not consume an identity token.
 * This helper deliberately strips an Authorization header even if one was present on a Request
 * or supplied by a caller, so accidental auth dependencies cannot re-enter through a client.
 */
export function noAuthFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const inheritedHeaders = typeof Request !== 'undefined' && input instanceof Request
    ? input.headers
    : undefined;
  const headers = new Headers(inheritedHeaders);
  new Headers(init.headers).forEach((value, name) => headers.set(name, value));
  headers.delete('authorization');

  return fetch(input, {
    ...init,
    headers,
    credentials: 'omit',
  });
}
