# PROGRAM v3.0 — PHASE 13-HARDENING — IMPLEMENTATION REPORT

**Status:** IMPLEMENTED (frontend/ only) · **iips-platform/ verify-only (untouched)**
**Certified base:** `phase13-next` @ `7325aeda8c9881ebdf2b96f64323998f1c46ba26` · tag `v3.0-phase12-certified` (`a975b0dc…`)
**Distinct from:** the existing Phase 13 "AI Explanation" phase — `docs/v3.0/phase13/` is **untouched** (and is not present in this base).

---

## 1. Wave A — FIX (committed `29a92a7`, `c784e44`)

| ID | Finding | Fix | Files |
|---|---|---|---|
| A1 | `--color-accent` referenced but never defined → invisible active Admin tab + "Confirm classification" button | Defined semantic `--color-accent` (= focus `#1F6FEB`; white-on-accent **4.63:1** AA) via the existing token architecture (primitive + theme vars, light/dark) | `src/core/tokens/index.ts`, `src/core/theme/theme.ts` |
| A2 | Modals/drawers declared `aria-modal` with no keyboard focus management | New `useDialogFocus` hook: focus-in on open, Tab/Shift+Tab trap, Escape-to-close, focus restore to the invoking control — wired into `Modal`, `Drawer`, `EvidenceDrawer` | `useDialogFocus.ts` (new), `InteractionComponents.tsx`, `EvidenceComponents.tsx` |
| A3 | Tabs lacked arrow-key / roving-tabindex behaviour | New `useTabList` hook (roving tabindex, Arrow/Home/End with automatic activation) — wired into `Tabs` and `Administration`; `Administration` now has a correct `tab ↔ tabpanel` (`aria-controls`/`aria-labelledby`) relationship | `useTabList.ts` (new), `InteractionComponents.tsx`, `Administration.tsx` |
| A4 | Decision Matrix scatter had interactive buttons inside `role="img"` | Container `role="img"` → `role="group"` (points remain real, reachable `<button>`s with per-point labels) | `DecisionMatrix.tsx` |
| A5 | `--color-ink-muted` 3.67:1 · `status-warning` 4.24:1 (below AA) | Amended light tokens: ink-muted `#7A8794→#5C6875` (**5.69:1**); warning + freshness-stale `#B26A00→#965C00` (**5.49:1**, also fixes white-on-amber "Confirm classification" button). Dark theme verified AA (no change). Deterministic contrast regression in `theme.test.ts` | `tokens/index.ts`, `theme.test.ts` (new) |

## 2. Wave B — RESPONSIVE + chart/heading/skip-link (committed `6ef9487`)

| ID | Finding | Fix | Files |
|---|---|---|---|
| B1 | Zero responsive media queries; fixed `240px` sidebar grid | `global.css`: `.app-shell`/`.app-nav` classes with token breakpoints (≤959px collapses to single column + horizontal nav strip; ≤639px tighter padding). Desktop layout byte-identical | `global.css`, `AppShell.tsx`, `Sidebar.tsx` |
| B1 | Dense tables could overflow horizontally | `DataTable` + `ComparisonTable` wrapped in `.table-scroll` (overflow-x) | `DataComponents.tsx` |
| B1 | Scatter used fixed-px coordinates | Percentage positioning (`left/top: X%`), null axes pinned with insets | `DecisionMatrix.tsx` |
| B1 | Drawers fixed `420px` width | `min(420px, 100vw)` | `InteractionComponents.tsx`, `EvidenceComponents.tsx` |
| B2 | Nested `role="img"` on bar chart | `role="group"` + `aria-hidden` bars + `sr-only` values (no data loss) | `ChartFoundations.tsx` |
| B2 | `MetricGroup` label skipped heading level | `<h4>` → `<h3>` | `DataComponents.tsx` |
| B2 | No skip link | `Skip to main content` link + `id="main-content"` on `<main>` | `AppShell.tsx` |

## 3. Wave C — PERFORMANCE / TOOLING (committed `36ff73c`)

| ID | Finding | Fix | Files |
|---|---|---|---|
| C/B3 | Single 232.43 kB bundle | Route-level `React.lazy`/`Suspense` for all 8 workspaces | `App.tsx` |
| C/C3 | Derived arrays recomputed every render in two features | `useMemo` for `evidenceRefs`/`rankedRows` (Executive) and `positioned` (DecisionMatrix) — matches existing Portfolio/CrossSector pattern | `ExecutiveDashboard.tsx`, `DecisionMatrix.tsx` |
| C/B5 | `server/` excluded from TS coverage | `tsconfig.server.json` (extends base, node+vitest types) + `typecheck:server` script; transport `EngineOutput` nullability modelled with a transport-local `TransportEngineOutput` (bridge cast only at `csip.run`; runtime unchanged) | `tsconfig.server.json` (new), `package.json`, `server/executive-transport.ts` |
| C/B4 | No request caching | **DEFERRED** — a tenant-safe cache requires an authenticated, tenant-scoped query layer (architectural change). Introducing a naive cache now risks cross-tenant data leakage; documented, not implemented. | — |

---

## 4. Classification ledger

- **FIXED:** A1, A2, A3, A4, A5, B1 (shell/tables/scatter/drawers), B2 (chart/heading/skip-link), B3, C3, B5.
- **HARDENED:** responsive shell/nav, table overflow, scatter reflow, drawer widths, memoization, code splitting.
- **DEFERRED:** B4 request caching (needs tenant-scoped query layer); `vitest-axe` (not authorized).
- **MEASURED:** bundle sizes (before/after), test counts, build time.
- **NOT VERIFIED HERE:** G3 LIVE (8/8) and Admin LIVE — no real Keycloak in this environment; previously certified in the authoritative environment. Real-browser responsive/a11y visual checks not performed (no browser available) — covered by deterministic unit tests.
- **ACCEPTED:** remaining `h1→h3` MetricGroup placement where the group label sits directly under the page `h1` (section carries `aria-label`); pre-existing `act(...)` and React Router v7 future-flag warnings (non-blocking).

## 5. Security / data invariants (verified)

- `iips-platform/` diff vs certified base = **empty** (no modifications).
- React remains presentation-only; no authorization decision moved into the UI; no route guard used as security.
- No engine/scoring/decision logic added; "never fabricate" preserved (`null` pillars remain `null`/`unavailable`).
- No new runtime dependency added (`tsconfig.server.json` + npm script are dev-only; no `vitest-axe`).
