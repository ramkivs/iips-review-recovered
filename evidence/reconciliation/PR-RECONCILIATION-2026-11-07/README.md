# Remote reconciliation, PR separation and closeout preparation — 2026-11-07

Scope: reconcile the remote Git state, verify the merged and unmerged work, determine whether PR #508's three stacked work
items can be separated, and prepare a dependency-safe merge sequence. **Nothing was merged, no investigation was
reopened, and no issuer work was added.**

## What the remote actually says

| fact | value | how it was read |
| --- | --- | --- |
| `origin/main` | `c95c0480c96a6e88129785bcf14405a12462ade9` | `git fetch --prune` + `git rev-parse` |
| `origin/main` is | the **merge commit of PR #507**, 41 files, +4306/−7 | `git cat-file -p c95c048` (two parents) |
| PR #507 | `MERGED` at **2026-11-07T17:01:39Z**, by `ramkivs`, head `1b7f0d5`, base `main` | `gh pr view 507` |
| PR #508 | `OPEN`, `MERGEABLE` / `CLEAN`, head `2514e69`, base `main`, 65 files, +5619/−18 | `gh pr view 508` |
| other open PRs | **none** | `gh pr list --state open` |
| CI on `main@c95c048` | run `42394233973` — success | `gh run list --branch main` |
| CI on `#508@2514e69` | run `42399423008` — pass | `gh pr checks 508` |

The clone was **shallow** at `c95c048` when the task began (`git rev-parse --is-shallow-repository` → `true`), so the PR
#507 merge parents were not inspectable. It was deepened with `git fetch --deepen=60 origin main` (223 commits now
available) before anything about #507 was concluded. That is recorded because the first attempt to look at
`c95c048^1` failed with *"unknown revision"* — an artefact of the shallow clone, not of the repository.

## PR #507 — verified, not merely reported

* Merge commit `c95c048`, parents `f9d88a7` (base) and `1b7f0d5` (PR head), author `ramkivs`, committer GitHub, merged
  2026-11-07T17:01:39Z. It **is** `origin/main`.
* Eleven commits entered. Six files were **modified** (both registers plus the WI-7 consumer documents and its manifest);
  everything else was an addition, i.e. the new `WI7-L038-DEBT-COMPLETENESS-2026-11-07/` bundle and its guard test.
* **No unrelated change entered.** Every modified path belongs to L-038 or to the WI-7 consumer it corrects. The one
  piece of machinery that came in — `.github/workflows/temp-l038-discover.yml`, added in `eeb23e1` — was **deleted in
  `e479534`**, so the merged tree carries only the three pre-existing workflows. History carries the file; the tree does
  not. That is the same reproducibility fact `L-037` records as `R-037-05`, and it is worth not forgetting when the
  discovery method is cited.
* **The L-038 content is the reviewed correction.** `determination-l038.json` on `main` says
  `limitationStatus: OPEN (unchanged)`, `resolved: false`, records the two independent blockers, the same-period
  reconciliation and the cash-side gap:

  | preserved finding | where it is |
  | --- | --- |
  | `L-038` stays `OPEN` | determination `outcome.limitationStatus`; register §17.15, §17.18, status paragraph |
  | two independent blockers | `outcome.reason` + `secondBlocker` (`PREFERENCE_CAPITAL` `MISSING`/`NOT_REPORTED`) |
  | same-period reconciliation 608 / −177 / 487 crore | `runs/10-net-debt-reconciliation.txt`; `results.after` |
  | preference capital `NOT_REPORTED` | `secondBlocker`; nothing marks it a nil |
  | cash-side period alignment | `cashSideAlignment`: `UNDECIDED — documented, not acted on` |
  | no additional debt or cash mapping inferred | `outcome.mappingApplied`: exactly one cell (FY2023 current maturities = 0), printed in both reports |

  Register §17.15/§17.18 and tracker §16.276 on `main` say the same thing. **No correction is needed, the merge is not
  reversed, and the investigation was not reopened.**

## PR #508 — ancestry and ownership

Ten commits, three work items, clean file-level ownership:

| work item | commits | range (inclusive of the last, exclusive of the first) | paths owned |
| --- | --- | --- | --- |
| WI-9 / `L-036` | `e145ecd`, `0ddf5c7` | `c95c048..0ddf5c7` | 20 (4 platform, 16 evidence) |
| `L-035` | `451d790`, `fdbbae6` | `0ddf5c7..fdbbae6` | 23 (6 platform, 17 evidence) |
| WI-10 / `L-037` | `42be412`, `9ed8dcf`, `d673d34`, `32a9473`, `402c080`, `2514e69` | `fdbbae6..2514e69` | 32 (4 platform, 28 evidence) |

**Two corrections to the ranges in the brief.** The Arena report cited `451d790..fdbbae6` for `L-035`; in Git's `A..B`
semantics that **excludes `451d790`** — the commit carrying the grammar, schema V3, the review record and the acceptance
tests — and keeps only the clean-clone log. The correct boundary is `0ddf5c7..fdbbae6`. The same reading applies to
`42be412..2514e69`, which excludes `42be412`, the commit adding the three source files. Ranges in this bundle are stated
explicitly as inclusive/exclusive so the mistake cannot recur.

**The entire cross-item overlap is two files** — the limitation register and the master tracker. No source file, test,
dataset, payload, manifest or evidence artifact is shared by two items (`pr-508-ancestry.json` → `crossItemOverlap`).

## Separation — built and verified; not opened

The three dedicated PRs were **not** created, and the reason is precise: the repository and the credential permit it,
this session does not.

* GitHub side: the token is `ramkivs` with `admin`/`push` on the repo; 384 branch heads already exist on the remote; and
  `git push --dry-run origin HEAD:refs/heads/arena/reconcile-probe` reports `* [new branch] … -> arena/reconcile-probe`
  with exit 0. Nothing on the repository side blocks a new branch.
* Session side: this task is bound to `arena/8133630f-iips-review-recovered` and may not create or push another branch.
  An actual push was deliberately **not** attempted — a dry run is the strongest permitted evidence, and probing the
  restriction by writing to the remote would be a policy violation even if it succeeded.

So the split was demonstrated instead of claimed. In a scratch clone, on a **detached HEAD** (no branch anywhere), each
item was rebuilt on `origin/main` with `git cherry-pick -x`:

| work item | rebuild result | tests | `tsc` |
| --- | --- | --- | --- |
| WI-9 / `L-036` | both commits clean, no conflict | **24/24** | 0 |
| `L-035` | one conflict, in the two append-only documents only; 23 of 24 paths untouched | **27/27** | 0 |
| WI-10 / `L-037` | code and test clean; `d673d34` conflicts in the same two documents; the three commits after it then apply in order | **27/27** | 0 |

The rebuild is deterministic — repeating it produced identical tree SHAs — and the script and resolver are committed here
as `split/rebuild.sh` and `split/resolve_docs.py`, with the exact publication commands in `split/recipe.md`.

Semantic independence was tested separately: each item, applied alone onto `main` with only its own paths, passes its own
suites (`runs/05-separability.txt` §B). The single exception is `L-037`'s own assertion that the register records it as
`PARTIALLY RESOLVED`, which fails only in that reduced simulation because the register hunk was deliberately withheld; in
the full rebuild it passes.

## Status reconciliation

Read from the register at the PR head, all as expected: `L-034` `RESOLVED`, `L-035` `RESOLVED`, `L-036`
`PARTIALLY RESOLVED`, `L-037` `PARTIALLY RESOLVED`, `L-038` `OPEN`, `L-039` unchanged (its §17.17 wording stands), `L-040`
`RESOLVED`, `L-001`…`L-033` untouched. On `main` the same document correctly still shows `L-035`/`L-037` `OPEN`, because
that work is not merged yet — a sequencing fact, not an inconsistency.

One actual inconsistency was found and corrected, in this reconciliation and not by rewriting history: tracker §16.279
ended with *"Nothing is merged: PR #507, PR #508 and this work item's pull request all await the combined closeout"*,
written after #507 had already merged at 17:01:39Z. It is now marked as corrected, with §16.280 recording why.

## Merge order

See `merge-plan.md`: WI-9 → `L-035` → `L-037`, each preserving merge commits (no squash — commit SHAs are cited in three
evidence bundles), with the same trivial document re-anchoring at steps 2 and 3. Merging #508 as one unit is the
conflict-free alternative and is mergeable today. **Nothing was merged in this task.**

## Files

| path | what it is |
| --- | --- |
| `remote-state.json` | `origin/main`, both PRs, CI runs, clone state |
| `pr-507-verification.json` | merge commit and parents, the 11 commits, scope, the L-038 content checks |
| `pr-508-ancestry.json` | all 10 commits with trees and files, the three ranges, ownership, overlap, dependency assessment |
| `separability.json` | the three rebuilds, their trees, tests, determinism and the reason they were not opened |
| `branch-feasibility.json` | GitHub-side capability vs session-side authority, with the dry-run evidence |
| `split/recipe.md`, `split/rebuild.sh`, `split/resolve_docs.py` | the verified separation procedure |
| `merge-plan.md` | dependency-safe order, expected conflicts, post-merge checks |
| `runs/01…09` | every command and its output: remote state, #507 verification, ancestry, per-item tests, separability, the three rebuilds, CI |
| `digests.json` | sha256 of every fixed file in this bundle |
