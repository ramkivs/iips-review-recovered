import type http from 'node:http';

/**
 * Owner-scoped APIs stay unavailable until a non-authentication ownership source is separately
 * authorized and established. No principal, tenant, or fallback identity is inferred.
 */
export const OWNER_CONTEXT_UNAVAILABLE = Object.freeze({
  error: 'owner-context-unavailable',
  detail: Object.freeze({
    reason: 'No non-authentication ownership source has been established. No owner is inferred; no data is read or changed.',
  }),
});

export function respondOwnerContextUnavailable(res: http.ServerResponse): void {
  res.writeHead(503, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(OWNER_CONTEXT_UNAVAILABLE));
}
