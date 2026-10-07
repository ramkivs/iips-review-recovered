# P0 — AUTHORITATIVE BASELINE RECONCILIATION — REPORT

> **RECONSTRUCTION NOTICE (2026-10-07, Evidence Durability Gate).** The original P0 report was written to the Arena workspace on 2026-10-07 (~14:40Z) and passed review as the formal P0 deliverable. During the Arena infrastructure incident of 2026-10-07 (~17:00Z) the sandbox was rebuilt and the original file was **lost** (along with the P1–P5 workspace files; P1–P6 were reconstructed verbatim from the session record, but the original P0 text predates that record's retention window). This document **reconstructs the P0 report at content level**: every recorded P0 conclusion, evidence item, command, and result is restated below exactly as established during P0 execution; conclusions are unchanged; nothing is fabricated. Where the original document's exact prose or section formatting cannot be reproduced, that is disclosed here once and does not affect any conclusion.

**IIPS SINGLE-PLATFORM INTEGRATION & CONVERGENCE — P0 only.**
NON-PRODUCTION · READ-ONLY · NO MUTATION

- **Evidence date (UTC):** 2026-10-07 (~14:33Z primary verification; 15:48Z re-verification at P1 start)
- **Method:** `git ls-remote` (HEAD + `refs/heads/main`), GitHub API via `gh api`, and fresh full clones (non-shallow, non-partial, clean) in disposable directories. No repository was modified.

---

## A. Authoritative Baseline Determination

| Repository | Authoritative ref | Commit | Tree | Verified |
|---|---|---|---|---|
| IRR `ramkivs/iips-review-recovered` | `origin/main` (remote HEAD → main) | `17e234a1d6a5e1629cdf98b5c5f241a663cf9901` | `c6fb24d9093ee49e813561ba849c6c26d9da9805` | YES — `git ls-remote` (HEAD and `refs/heads/main` both resolve to the pin), `gh api` commit/branch confirmation, fresh full clone `is-shallow=false`, no promisor/partial config, working tree clean, `0 ahead / 0 behind` vs `origin/main` |
| IPD `ramkivs/iips-production-market-data` | `origin/main` (remote HEAD → main) | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | `db853dc21d01162e69b0e1211dbea1cb5c5f72b1` | YES — same three independent channels; clean full clone; `0/0` divergence |

Both repositories use `main` as the default/HEAD branch. Remote structure inventory at P0: IRR — 68 branch heads, 47 pull-request refs, 2 tags (`program-v1.2.0`, `v3.0-phase12-certified`); IPD — 32 branch heads, 6 pull-request refs, 4 tags (`p14-r7-65b78f7`, `portfolio-option-a-cb969b6`, `post-cleanup-baseline-b46b4f4`, `temporary-cleanup-caf73ba`).

## B. Clone Hygiene

Fresh full clones (no `--depth`, no `--filter`, no partial-clone promisor configuration) verified: shallow marker absent; `git rev-parse --is-shallow-repository` → `false`; clean status; local `main` tracks `origin/main` with zero divergence in both repositories. Baseline tags reachable from each clone's object store.

## C. Key Baseline Facts Established

1. **IRR↔IPD dependency:** IRR `frontend/package.json` declares `iips-production-market-data` at `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` — the tip of IPD branch `np04-governed-persistence-windows`, which sits **26 commits ahead of IPD `origin/main` and is NOT reachable from it**. Consumed subpaths: `./pit`, `./d114-non-production`, `./persistence`.
2. **Supplied baselines verified, not trusted:** both authority pins were independently resolved from the live remotes; the remote state controls.
3. **Re-verification:** both pins re-verified unchanged at 2026-10-07T15:48:15Z (P1 STOP-A check).

## D. STOP Evaluation

No STOP condition triggered at P0: authorities stable and resolvable; full history available in both repositories; no mutation required for any planned phase; no Windows access required (per scope); no reliance on prior conversational claims for any material conclusion.

## E. Constraints Honored

READ-ONLY throughout: no edits to tracked files, no commits, branches, merges, rebases, pushes, resets, cleans, history rewrites, or tag changes; disposable clones used solely for verification; the authoritative remotes were never altered.

## F. P0 Disposition

## **P0 — BASELINE RECONCILIATION PASS**

Both authoritative baselines independently verified at the stated pins by multiple channels; clones clean and full; the cross-repository dependency pin identified and recorded as a material P1 investigation input.

**END P0**
