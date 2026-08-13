# Program v3.0 — Phase 3: Application Shell (Completion Report)

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** Phase 3 — Application Shell (first code phase)
**Location:** `frontend/`
**Status:** COMPLETE — shell, navigation, routing, token integration, accessibility foundation, tests. **No feature workspaces, no business logic, no transport implementation.**
**Date:** 2026-08-09

---

## 1. Scope delivered (per authorization)

1. React + TypeScript + Vite application foundation ✅
2. Application entry point (`main.tsx`) ✅
3. AppShell (`AppShell.tsx`) ✅
4. Global navigation (`Sidebar`, `navigation.ts`) ✅
5. Routing (`App.tsx`, `routes.ts`) ✅
6. Layout/grid foundations (AppShell grid) ✅
7. Phase 2 semantic-token integration (`tokens/`, `theme/`) ✅
8. Theme infrastructure (light + dark, CSS variables) ✅
9. Global loading/error/permission shell states (`ShellStates.tsx`) ✅
10. Accessibility foundations (focus, reduced-motion, aria, sr-only) ✅
11. Shell/routing/component tests ✅ (16 tests)
12. Frontend architecture documentation (this + `frontend-architecture.md`) ✅

## 2. Explicitly NOT implemented

- Executive Dashboard, Portfolio, Company, Cross-Sector, Decision Matrix, Evidence, Replay, Administration screens.
- Any investment calculation / scoring / ranking / confidence / decision-policy logic.
- New engine logic.

## 3. Files created (`frontend/`)

```
package.json, tsconfig.json, vite.config.ts, index.html
src/main.tsx                       entry point + theme + session + router
src/app/App.tsx                    routing (shell + feature placeholders)
src/app/AppShell.tsx               layout shell (topbar/sidebar/content)
src/app/TopBar.tsx, Sidebar.tsx    chrome + role-aware nav
src/app/routes.ts, navigation.ts   route map + navigation model
src/core/tokens/index.ts           frozen semantic tokens (Phase 2)
src/core/theme/theme.ts            light/dark CSS-variable themes
src/core/theme/global.css          base styles, focus, reduced-motion, sr-only
src/core/session/session.ts        inert session stub (no auth)
src/core/session/SessionContext.tsx
src/components/shell/ShellStates.tsx  loading/error/permission/empty/not-authorized
src/components/ui/Badges.tsx       semantic status/authority/freshness badges
src/test/setup.ts                  vitest setup
src/**/*.test.tsx                  shell/routing/nav/token tests
```

## 4. Frontend architecture

```text
main.tsx
  → BrowserRouter → SessionProvider (inert) → applyTheme
  → App (Routes)
      → AppShell (TopBar + Sidebar + <Outlet/>)
      → Feature placeholders (NotYetAuthorized) for all workspaces (later phases)
```

- **Presentation-only.** No scoring/ranking/threshold/confidence/weight/decision logic.
- **Token-driven.** Components consume semantic tokens (status/authority/freshness), never raw colors.

## 5. Route map (frozen navigation model)

`/ → /executive` · `/executive` · `/portfolio/*` · `/research/*` · `/intelligence/*` · `/evidence/*` · `/admin/*` · `* → placeholder`. Feature surfaces render `NotYetAuthorized` (no fabricated data).

## 6. AppShell structure

- Grid layout: `240px sidebar | 1fr content`; `56px topbar` on top.
- TopBar: brand + tenant + role.
- Sidebar: role-aware navigation (admin-only surfaces hidden for lower roles — reflects RBAC; frontend does not decide permissions).
- Content: `<Outlet/>`.

## 7. Token integration

- `tokens/index.ts` = frozen Phase 2 semantic tokens (color primitives + status + authority + freshness + type/space/layout/density/radius/elevation/breakpoints).
- `theme.ts` resolves to CSS variables for light + dark (same semantic tokens).
- `Badges.tsx` demonstrates constitution-critical authority/freshness/status (non-color-only: icon + label + color).

## 8. Accessibility implementation

- Visible focus ring (`:focus-visible`), never removed.
- `prefers-reduced-motion` disables non-essential transitions.
- `role="status"`/`aria-live` for loading; `role="alert"` for errors.
- Semantic HTML (`nav`, `main`, `header`, `ul`), `aria-label`.
- `.sr-only` utility.

## 9. Tests / results

- `tsc --noEmit` (strict) → clean.
- `vitest run` → **16/16 PASS** (App shell 6, shell states 5, badges 5).
- `vite build` (production) → succeeds (43 modules).

## 10. Architectural gaps discovered (documented, not worked around)

| Gap | Resolution |
|---|---|
| No HTTP transport / auth yet | Per Phase 1/3, deferred; shell uses an **inert session stub**. Transport/adapter + auth are later phases, governed by `transport-boundary.md`. |
| Feature workspaces empty | Intended — later phases. They render `NotYetAuthorized`, never fabricated data. |
| Design tokens are TS constants, not CSS custom-property files | Codified into CSS variables via `theme.ts`; token file is source of truth. |

## 11. Governance

- **v2.0/v1.1 untouched.** No engine/platform semantic change. No investment logic recreated in React.
- Presentation/navigation/interaction only (v3.0's responsibility per the constitution).
- Stop conditions honored: no stop condition triggered.

## Status

**PHASE 3 COMPLETE.** Awaiting approval before Phase 4 (Feature Component Library — NOT yet authorized).
