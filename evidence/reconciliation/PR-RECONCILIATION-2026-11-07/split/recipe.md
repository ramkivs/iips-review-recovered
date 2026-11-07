# Split recipe — three dedicated PRs from PR #508, verified but not opened

The split was **not opened**, because this session may not push any branch other than its own
(`../branch-feasibility.json`). It was, however, **built and verified**: the three series below were reconstructed on
`origin/main` in a scratch clone with a detached HEAD, tested, and produced byte-identical trees when the rebuild was
repeated. Whoever holds branch authority can run the same script and open the three PRs; nothing else is needed.

Base for all three: `origin/main` = `c95c0480c96a6e88129785fda12e634fc2109a9`-equivalent, i.e.
`c95c0480c96a6e88129785bcf14405a12462ade9` (the PR #507 merge).

## The three series

| work item | commits (published) | rebuilt tree SHA | tests on the rebuilt tree |
| --- | --- | --- | --- |
| WI-9 / `L-036` | `e145ecd`, `0ddf5c7` | `8fcd9ad6…` | 24/24 + `tsc` 0 |
| `L-035` | `451d790`, `fdbbae6` | `3da3e909…` | 27/27 + `tsc` 0 |
| WI-10 / `L-037` | `42be412`, `9ed8dcf`, `d673d34`, `32a9473`, `402c080`, `2514e69` | `e83260dd…` (parent) / `cf3f3756…` (head) | 27/27 + `tsc` 0 |

## Commands

```bash
# once
git clone --no-hardlinks <repo> /tmp/splitclone

# per work item — creates no branch, pushes nothing
evidence/reconciliation/PR-RECONCILIATION-2026-11-07/split/rebuild.sh wi9  /tmp/splitclone "$PWD"
evidence/reconciliation/PR-RECONCILIATION-2026-11-07/split/rebuild.sh l035 /tmp/splitclone "$PWD"
evidence/reconciliation/PR-RECONCILIATION-2026-11-07/split/rebuild.sh l037 /tmp/splitclone "$PWD"

# to publish (needs branch authority — NOT done in this session)
cd /tmp/splitclone
git branch arena/l036-wi9   <rebuilt head>
git push origin arena/l036-wi9
gh pr create --base main --head arena/l036-wi9 --title "iid: WI-9 / L-036 — …" --body-file <body>
```

## Why the conflict is always the same one, and why the resolution is safe

Each work item appends its own section to the end of the **same two documents** — the limitation register and the master
tracker — so its recorded patch carries the *previous* item's tail as context. Applied to `main` (where that tail is
absent), the append hunk conflicts; every other file in the commit applies untouched.

`resolve_docs.py` therefore:

1. restores the document from the base (`HEAD`, i.e. `origin/main`),
2. re-applies the item's **non-append** hunks — the in-place status edits, such as `L-035`'s `**Status:** OPEN` →
   `RESOLVED` in §17.2, or `L-037`'s dated status note inside §17.12,
3. appends the item's own section at the new end of file.

It appends only the `+` lines of the append hunk, so nothing from the other items' sections can leak in, and the
resolution is deterministic: running it twice yields the same tree SHA (verified).

## What not to do

* Do not squash the series: the commit SHAs are cited in three evidence bundles, and squashing would break those
  citations.
* Do not rebase the published commits on this branch: PR #508 is the published record of the stack, and rewriting it
  would invalidate the clean-clone records that name `32a9473`, `402c080` and `2514e69`.
* Do not copy the register/tracker wholesale from this branch into a split branch — that is what would smuggle the other
  items' entries in.
