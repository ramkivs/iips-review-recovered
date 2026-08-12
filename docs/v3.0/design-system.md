# Program v3.0 — Design System (Tokens & Semantics)

**Program:** IIPS Engineering Standards — Program v3.0
**Document type:** DESIGN SYSTEM (Phase 2 — specification, not implementation)
**Version:** 1.0
**Date:** 2026-08-09
**Status:** SPECIFICATION — the token system for v3.0, expressing the Experience Constitution.

> This defines the **design language** of v3.0. It is specification only. It does not implement React components/screens. The tokens express the Experience Constitution (CERTIFIED/AI/PLATFORM authority, freshness, provenance, truth-before-decoration).

---

## 1. Token architecture

Tokens are organized as **primitive → semantic**. The UI references **semantic** tokens, never raw primitives, so meaning (not just color) drives presentation.

```text
Primitive tokens (raw values: color hex, type scale, spacing units)
        ↓
Semantic tokens (meaning-bearing: status, authority, freshness)
        ↓
Intended UI usage (DecisionCard, EvidencePanel, freshness badge, etc.)
```

## 2. Typography

| Token | Value (spec) | Usage |
|---|---|---|
| `type-family` | system-ui / "Inter", ui-sans-serif | Body |
| `type-family-mono` | ui-monospace, "JetBrains Mono" | Snapshot IDs, versions, provenance |
| `type-scale` | 12 / 14 / 16 / 20 / 24 / 32 / 40 (px) | Dense financial hierarchy |
| `type-weight` | 400 / 500 / 600 / 700 | Emphasis |
| `type-leading` | tight / normal / relaxed | Data density |

**Constitution mapping:** Decision-first → the decision/verdict is the largest, highest-contrast text; metrics recede.

## 3. Spacing / layout / grid

| Token | Value | Usage |
|---|---|---|
| `space-unit` | 4px base | Consistent rhythm |
| `space-*` | 4/8/12/16/24/32/48 | Margins, padding |
| `layout-grid` | 12-col, gutters 16/24 | Responsive layout |
| `layout-max` | 1440px | Enterprise workstation |

## 4. Sizing / density

| Token | Value | Usage |
|---|---|---|
| `density-compact` | tighter row/pad | Analytical tables (default) |
| `density-comfortable` | roomier | Overview surfaces |
| `control-*` | 28/32/40 (px height) | Buttons, inputs |

**Constitution mapping:** information-dense but readable; tables default to compact density.

## 5. Surfaces / borders / radius / elevation

| Token | Value | Usage |
|---|---|---|
| `surface-0/1/2` | app bg / card / raised | Hierarchy of panels |
| `border-*` | hairline / strong | Table dividers, emphasis |
| `radius-*` | 2/4/6/8 (small, restrained) | Avoid excessive rounding |
| `elevation-*` | 0/1/2/3 shadow | Drawers, modals, popovers |

**Constitution mapping:** institutional, precise; restrained radius/shadow.

## 6. Iconography

- Stroke-based, consistent 1.5–1.75px weight.
- Icons accompany (never replace) text for status (non-color-only accessibility).

## 7. Semantic status colors

| Semantic token | Intended meaning | Not color-only |
|---|---|---|
| `status-positive` | favorable | + icon + label |
| `status-negative` | unfavorable | + icon + label |
| `status-neutral` | neutral | + label |
| `status-warning` | caution | + icon + label |
| `status-critical` | requires action | + icon + label |
| `status-informational` | context | + label |

**Constitution mapping:** status never encoded by color alone.

## 8. Authority states (constitution-critical)

| Authority token | Usage |
|---|---|
| `authority-certified` | v1.1 result / v2.0 evidence — primary, labeled "CERTIFIED RESULT" |
| `authority-ai` | AI advisory — clearly labeled "AI EXPLANATION", visually distinct, non-authoritative |
| `authority-platform` | operational information — informational |

These three authority states are **visually distinct** so CERTIFIED ≠ AI ≠ PLATFORM is unmistakable.

## 9. Freshness states

| Freshness token | Usage |
|---|---|
| `freshness-live` | LIVE |
| `freshness-snapshot` | SNAPSHOT |
| `freshness-stale` | STALE (warning treatment) |
| `freshness-unavailable` | UNAVAILABLE (never show 0/fabricated) |
| `freshness-replay` | REPLAY |

**Constitution mapping:** never silently show stale as current.

## 10. Positive/negative/neutral/warning/critical (risk & decision)

These map to the status tokens and are used for verdicts, risk, and decision drivers — always with icon + label.

## 11. Charts & data visualization semantics

- `chart-categorical`, `chart-sequential`, `chart-diverging`, `chart-verdict` palettes.
- Charts are **presentational**; they render certified values only (never recompute).
- Axis/legend labels use the body type scale; accessible (aria/pattern/legend) and non-color-only.

## 12. Tables & analytical density

- Compact density, hairline dividers, sticky headers.
- Sortable/filterable columns (transport-level).
- Verdict/status cells use icon + label + semantic color.

## 13. Interaction states

`interaction-default` · `hover` · `active` · `disabled` · `loading` · `focus` · `selected`.

## 14. Focus / accessibility tokens

- Visible focus ring (not removed).
- Contrast ≥ WCAG AA.
- `reduced-motion` respected.
- Semantic HTML / ARIA in usage.

## 15. Responsive breakpoints

`bp-sm` 640 · `bp-md` 960 · `bp-lg` 1280 · `bp-xl` 1600 (px). Primary target desktop/tablet; intentional behavior, not shrinking.

## 16. Motion

- Minimal, purposeful (drawers, transitions).
- **Reduced-motion** disables non-essential motion.

## 17. Light/dark theme strategy

- Semantic tokens are theme-agnostic; a light and dark palette both resolve the same semantic tokens.
- Default: light (institutional); dark optional. Contrast guaranteed in both.

## 18. Token → constitution mapping summary

| Constitution principle | Semantic token(s) | Intended UI usage |
|---|---|---|
| P1 Truth before decoration | surfaces, typography, elevation | Decision card hierarchy, restrained chrome |
| P2 Decision before metric | type-scale/weight, status | Verdict large; metrics secondary |
| P3 Evidence before AI explanation | authority-certified / authority-ai | Distinct certified vs AI labels |
| P5 Evidence inspectable | surfaces, radius, elevation | Drawers/panels for evidence |
| P6 Progressive disclosure | density, elevation | L1→L5 reveal layers |
| Freshness/provenance | freshness-* | Freshness badges |
| Status non-color-only | status-* + icon/label | Verdict/risk/status cells |

## Status

**DESIGN SYSTEM (TOKENS) — SPECIFICATION COMPLETE (Phase 2).** No implementation.
