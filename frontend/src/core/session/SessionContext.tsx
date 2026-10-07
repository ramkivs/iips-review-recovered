/**
 * Program v3.0 — Phase 3: SessionContext.
 * Minimal context providing the current (inert) session for role-aware shell rendering.
 * Does not perform auth; that remains owned by the platform + transport adapter.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { ANONYMOUS_SESSION, type Session } from './session';

export interface SessionContextValue {
  session: Session;
  /** Optional browser-login affordances (real OIDC, Keycloak). Absent in tests/dev shells. */
  readonly onLogin?: () => void;
  readonly onLogout?: () => void;
}

const SessionContext = createContext<SessionContextValue>({ session: ANONYMOUS_SESSION });

export function SessionProvider({ session, onLogin, onLogout, children }: {
  session: Session;
  onLogin?: () => void;
  onLogout?: () => void;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={{ session, onLogin, onLogout }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}
