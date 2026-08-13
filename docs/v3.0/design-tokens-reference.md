# Program v3.0 — Design Tokens Reference

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** DESIGN TOKENS REFERENCE (Phase 2 — implementation-ready spec)
**Version:** 1.0
**Date:** 2026-08-09
**Status:** SPECIFICATION — the concrete token values to be codified at Phase 3 (not yet implemented).

> Machine-friendly reference for the v3.0 design tokens. Semantic tokens drive the UI; the UI must reference semantic tokens, not raw primitives.

---

## 1. Color — primitive (light, institutional)

| Token | Value |
|---|---|
| `color-ink-900` | `#0B1B2B` (primary text) |
| `color-ink-600` | `#3D4E5E` (secondary text) |
| `color-ink-400` | `#7A8794` (muted) |
| `color-surface-0` | `#FFFFFF` (app bg) |
| `color-surface-1` | `#F7F9FB` (card) |
| `color-surface-2` | `#EDF1F5` (raised) |
| `color-border` | `#D5DCE3` (hairline) |
| `color-focus` | `#1F6FEB` (focus ring) |

## 2. Semantic status

| Token | Value (light) |
|---|---|
| `status-positive` | `#1E7A46` |
| `status-negative` | `#B3261E` |
| `status-neutral` | `#5A6672` |
| `status-warning` | `#B26A00` |
| `status-critical` | `#B3261E` (critical = action-required variant) |
| `status-informational` | `#1F6FEB` |

> **Non-color-only:** each status is always paired with an icon + text label.

## 3. Authority tokens

| Token | Usage |
|---|---|
| `authority-certified` | "CERTIFIED RESULT" — solid, primary, labeled |
| `authority-ai` | "AI EXPLANATION" — dashed/outline, clearly separate, non-authoritative |
| `authority-platform` | "PLATFORM" — informational, muted |

## 4. Freshness tokens

`freshness-live` (LIVE) · `freshness-snapshot` (SNAPSHOT) · `freshness-stale` (STALE, warning) · `freshness-unavailable` (UNAVAILABLE, critical) · `freshness-replay` (REPLAY, informational).

## 5. Typography

`type-scale`: 12/14/16/20/24/32/40 px. `type-weight`: 400/500/600/700. `type-family`: system-ui + "Inter". `type-family-mono`: ui-monospace + "JetBrains Mono" (for snapshot/version/provenance).

## 6. Spacing / layout

`space-unit` 4px; `space-*` 4/8/12/16/24/32/48. `layout-grid` 12-col, gutter 16/24; `layout-max` 1440px.

## 7. Density / sizing

`density-compact` (tables, default) / `density-comfortable` (overview). `control-*` 28/32/40 px height.

## 8. Borders / radius / elevation

`border-hairline` / `border-strong`. `radius-*` 2/4/6/8 px (restrained). `elevation-*` 0/1/2/3.

## 9. Responsive breakpoints

`bp-sm` 640 · `bp-md` 960 · `bp-lg` 1280 · `bp-xl` 1600 px.

## 10. Motion

Minimal; `reduced-motion` disables non-essential transitions.

## 11. Theme strategy

Light + dark palettes both resolve to the same **semantic** tokens; contrast AA in both.

## Status

**DESIGN TOKENS REFERENCE — COMPLETE (Phase 2).** Codified into a token file at Phase 3.
