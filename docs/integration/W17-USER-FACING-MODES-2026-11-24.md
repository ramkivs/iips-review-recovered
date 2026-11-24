# W17 — User-facing modes: ACTUAL / REFERENCE / DEGRADED (2026-11-24)

**Status: implemented at the portfolio status boundary (additive); acceptance on ACTUAL data pending W06/W13/B02.**
Baseline: roadmap W17 (*"Executive/reference views use frozen inputs; non-snapshot badge branch can mislabel future
modes… browser/API evidence of actual data, empty vs unavailable, stale vs unknown, no misleading live badge or silent
reference substitution"*); deps W09, W13–W16, B06.

## 1. Existing UI / data flow found

`frontend/src/features/user-portfolios/PortfolioStatusSummary.tsx` already presents the persisted facts from the W09
read (`revision`, `provenanceDigest`, `lastUpdated`, stored `totalMarketValue` explicitly labelled "not a live market
valuation", empty-vs-unavailable distinction). Badges follow the symbol+label+semantic-token rule
(`components/ui/Badges.tsx`). No mode concept existed before this pass.

## 2. Mode semantics (implemented in `portfolioMode.ts`, pure)

- **ACTUAL** — only when an actual W09 read exists (integer revision) AND revision identity is complete
  (provenance digest + read timestamp) AND every active position carries a qualified observation
  (W13 coverage: `valued === active`, zero unresolved/stale/unavailable/UNKNOWN/unreadable).
- **REFERENCE** — persisted read exists but no qualified-observation evidence at all (W06/W13 actual measurement
  unavailable, currently B02-blocked), or the revision holds no active positions. Displayed as reference/persisted
  data with source identity and revision, never as live.
- **DEGRADED** — read unavailable (nothing claimable), or coverage incomplete: partial valuation, unresolved
  identities, stale/unavailable/UNKNOWN/unreadable observations, or missing digest/timestamp. The decision carries
  an explicit `missing` list that the UI renders.

No silent substitution: mode is a pure function of the inputs; REFERENCE is chosen only when reference data exists and
actual evidence does not; UNKNOWN (no observation) is never rendered as STALE; no fabricated values.

## 3. Components

- `portfolioMode.ts` — `selectPortfolioMode`, `MODE_PRESENTATION` (symbol+label+status token per mode).
- `PortfolioModeIndicator.tsx` — renders the mode badge (`data-testid="portfolio-mode"`) plus a details line
  (`data-testid="portfolio-mode-details"`): revision, short digest, read timestamp, coverage x/y, missing list.
- Wired additively into `PortfolioStatusSummary` (one block; no existing element changed; its 23 existing tests still
  pass unchanged).

## 4. Verification

`portfolioMode.test.ts` 9 vectors (ACTUAL/REFERENCE/DEGRADED matrix, UNKNOWN-vs-STALE distinction, no-read case,
missing digest blocks ACTUAL, zero-active → REFERENCE, pure transitions) — 9/9 pass.
`PortfolioModeIndicator.test.tsx` 4 render tests — 4/4 pass. `PortfolioStatusSummary.test.tsx` 23/23 unchanged.
Targeted cluster 23 files / **444 tests pass**; scoped strict tsc clean; PR CI Typecheck·Test·Build pass.

## 5. Outstanding

ACTUAL mode can never be displayed today: it needs W13 actual qualified-observation coverage, which is blocked on
W06/B02 (and W12 decisions). No ACTUAL rendering is claimed or tested against real data. Dependencies unchanged:
W09 verified; W13 mechanism synthetic-only; W14 not ready; W15/W16 published; B06 verified.
