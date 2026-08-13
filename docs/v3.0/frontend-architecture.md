# Program v3.0 — Frontend Architecture

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** FRONTEND ARCHITECTURE (Phase 0 proposal → Phase 3 implemented shell)
**Version:** 2.0
**Date:** 2026-08-09

> The v3.0 frontend architecture. **Phase 3 implemented the application shell** (React + TypeScript + Vite). It is presentation-only and consumes certified v2.0 contracts. No investment logic in the frontend.

---

## 1. Stack (implemented at Phase 3)

- **React 18 + TypeScript** (strict), **Vite** build.
- **react-router-dom** v6 routing.
- **Vitest + @testing-library/react** (jsdom) for tests.
- **No** state-management library yet (simple React context for session at this phase).

## 2. Implemented structure

```text
frontend/
  src/
    app/          # routing, AppShell, navigation, routes
    core/
      tokens/     # frozen Phase 2 semantic tokens
      theme/      # light/dark CSS-variable theme
      session/    # inert session context (auth is a later phase)
    components/
      shell/      # shell states (loading/error/permission/empty/not-authorized)
      ui/         # semantic badges (status/authority/freshness)
    test/         # vitest setup
    main.tsx      # entry
```

## 3. Data flow (authoritative)

```text
USER → React (v3.0) → typed API client (later) → v2.0 transport/adapter (later) → v2.0 contracts → v1.1 engines
```

Phase 3 does not yet include the API client or transport (deferred to a later phase per the master prompt).

## 4. State management

- **Server state:** later (query layer over v2.0 transport).
- **UI state:** local / feature state.
- **Session state:** inert `SessionContext` (to be wired to auth at a later phase).
- **Navigation state:** router.
- **Filter state:** later (feature phases).
- **Form state:** local.

## 5. Constraints carried

- Do NOT change a v2.0 contract / engine / decision rule / certification invariant.
- Do NOT recreate deterministic logic in React.
- RBAC enforced through platform contracts; frontend never bypasses server-side authorization.
- AI advisory only; never present AI output as a certified result.

## Status

**FRONTEND ARCHITECTURE — SHELL IMPLEMENTED (Phase 3).** Feature modules, API client, and transport are later phases.
