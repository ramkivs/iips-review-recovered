# Program v3.0 — Housekeeping: Workspace Size Prune (2026-08-13)

**Status:** COMPLETE · **Workspace size:** 15 MB → 9 MB

## Objective
Reduce workspace footprint (size limit over budget) by removing redundant/unwanted artifacts,
without losing any certified baseline.

## What was removed
| Item | Size | Rationale |
|---|---|---|
| 3 × git bundles (phase12/13/14.1) | 4.5 MB | Documented as "best-effort / cannot clean-clone / subject to shallow-history limitation". The **snapshots are authoritative**. |
| `historical-reference-archive/` | 488 KB | Already downloaded by the maintainer earlier. |

## What was kept (authoritative)
- 3 × certified snapshot tarballs (phase12/13/14.1) — all checksums re-verified:
  - `v3.0-phase12-certified-snapshot.tar.gz` → `7c7f9d9a…`
  - `v3.0-phase13-certified-snapshot.tar.gz` → `7f360ee4…`
  - `v3.0-phase14.1-certified-snapshot.tar.gz` → `6bafef5c…`
- All git tags + certified source in `iips-review`.

## Verified
- `git gc` compacted `.git` 2.5 MB → 2.0 MB.
- `git fsck` clean (no object corruption).
- `ies-*` certification baselines + `program-v1.1-certification` retained (required for 506/506).
- `node_modules` absent (transient, excluded from snapshots).

## Recovery
Recovery hierarchy (unchanged): **PRIMARY = snapshot tarballs** (sole authoritative recovery),
**REFERENCE = git tags** in the repo. Bundles removed (were non-functional for clean-clone anyway).
