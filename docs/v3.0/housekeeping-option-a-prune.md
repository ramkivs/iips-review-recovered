# Program v3.0 — Housekeeping: Controlled Option A Prune

**Status:** COMPLETE · **Date:** 2026-08-11 · **Branch:** `feature/program-v3-enterprise-experience`

## Objective
Remove non-live historical/reference directories from the active branch working tree without
rewriting git history, preserving all live content and certification baselines, and keeping all
test/typecheck/build gates green.

## Durable external archive (created first, verified)
- Path: `/home/user/historical-reference-archive/iips-historical-reference_20260811_190608.tar.gz`
- SHA-256: `3880e1390d50245d9c3682c53f13f63cb0c1ed3a977a14c6637501ebd7b8a239` (verified `OK`)
- Contents: complete snapshot of all 24 directories touched by the prune.
- `CHECKSUM.txt` + `RESTORE_INSTRUCTIONS.md` alongside.

## Pre-prune tag
- Annotated tag `prune-pre-v3-phase12/option-a` on the pre-prune HEAD (`a838bd5`), so any
  directory remains recoverable via git history as well as the external archive.

## Commits
| Commit | Action |
|---|---|
| `a838bd5` | Phase 12.1 CERTIFIED (clean baseline; tagged pre-prune) |
| `9ec8744` | Removed 24 non-live dirs from working tree |
| `f9a78ac` | **Correction:** restored 7 certification-required baseline dirs |

## Key finding (over-prune detected & corrected)
The first prune removed all 24 directories, but the post-prune **platform certification test
gate failed** (506 tests → 46 ENOENT failures) because `iips-platform/tests/regression/*.test.ts`
reads golden-reference datasets + cross-sector fixtures from `../../ies-010..015` and
`../../iips-cross-sector` **at runtime**. These are certification baselines the test suite
requires.

Restored from the durable archive (proving the archive restores correctly):
`ies-010-hospitality ies-011-energy ies-012-utilities ies-013-consumer ies-014-industrials
ies-015-technology iips-cross-sector`

## Final tracked-tree reduction
- Tracked files: **1,272 → 853** (−419 non-live files).
- Git-only working size: **4.5 MB**.
- Live content **untouched**: `iips-platform`, `frontend`, `program-v1.1-certification` (runtime
  baseline JSON), `docs`, `governance`, root files.

## Still removed (genuinely non-live; not referenced by any live test/build)
`ies-000-template ies-005-platform ies-005.1-contracts ies-005.2-performance-benchmarks
ies-005.3-observability ies-005.4-cicd ies-006-banking ies-006.1-reference-assets
ies-007-insurance ies-008-capital-markets ies-009-healthcare program-v2.0-discovery
iips-observability iips-benchmark iips-cicd implementations/ Shared/`

## Post-prune verification (all PASS)
- Platform certification suite: **506/506** PASS.
- Frontend: **121 passed / 15 skipped**; `tsc --noEmit` clean; `vite build` succeeds.
- No CI config exists in the repo (no GitHub/GitLab/Jenkins pipeline) — test/typecheck/build
  constitute the local CI-equivalent gate.
- `git fsck --full` clean; working tree clean.

## .git quota + gc
- Arena's workspace snapshot **counts `.git`** (only `.git/config`, `.git/credentials`,
  `.git-credentials`, `.netrc` are excluded). Therefore a normal `git gc` was run after all
  work was committed.
- `git gc` result: `.git` **13 MB → 1.9 MB** (packed 3,012 loose objects). Repo integrity
  verified post-gc (fsck clean, refs/files intact).
- Note: no git remote is configured, so no `push` occurred; the tag + commits exist locally.
