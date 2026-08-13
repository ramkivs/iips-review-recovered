/**
 * Program v3.0 — Phase 3: Session context (minimal, inert).
 *
 * This is a SEMANTICALLY INERT stub for the application shell. It carries the current role
 * so the shell can render role-aware navigation. It does NOT perform authentication or
 * authorization — those remain owned by the v2.0 platform (EnterpriseRuntime / ApiSecurity)
 * and the transport adapter (a later phase). No investment/business logic here.
 */
export type Role = 'viewer' | 'analyst' | 'admin';

export interface Session {
  readonly userId: string;
  readonly tenantId: string;
  readonly role: Role;
  readonly authenticated: boolean;
}

/** Default una authenticated session used by the shell until the auth layer is wired. */
export const ANONYMOUS_SESSION: Session = {
  userId: 'anonymous',
  tenantId: 'system',
  role: 'viewer',
  authenticated: false,
};
