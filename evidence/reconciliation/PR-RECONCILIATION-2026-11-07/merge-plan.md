# Merge plan — dependency-safe order, and what to expect at each step

**Nothing in this task was merged.** This is the preparation the closeout asked for. `origin/main` is
`c95c0480c96a6e88129785bcf14405a12462ade9` (PR #507), and PR #508 is open, mergeable and clean against it.

## The order

| # | what merges | why here | expected conflict | resolution |
| --- | --- | --- | --- | --- |
| 1 | **WI-9 / `L-036`** (`e145ecd`, `0ddf5c7`) | applies to `main` with no conflict at all — verified with `git apply --check` and by a full rebuild | none | — |
| 2 | **`L-035`** (`451d790`, `fdbbae6`) | independent of WI-9 at every level that matters (verified: 27/27 on `main` alone); merged second so the register carries §17.19 before §17.20, matching the numbers | the two document appends | keep `main`'s documents, re-anchor §16.278 / §17.20 (`split/rebuild.sh l035`) |
| 3 | **WI-10 / `L-037`** (6 commits) | last, because its register work is the §17.12 status note plus §17.21 and it cites the earlier §17.19/§17.20 numbering in prose | the two document appends | keep `main`'s documents, re-anchor §16.279 / §17.21 (`split/rebuild.sh l037`) |

Merging **PR #508 as one unit** (the alternative, if the split is not wanted) is a single merge commit and conflicts with
nothing — it is the current state, `MERGEABLE` / `CLEAN`.

## Dependencies, stated exactly

* **WI-9 → nothing.** `L-036`'s CLI/schema work relies on `assertSupportedDatasetSchema` and the V2 grammar, both of which
  have been on `main` since #497 — not on anything `L-035` or `L-037` added.
* **`L-035` → nothing.** It widens the schema union to V3 and changes `CURRENT_DATASET_SCHEMA`; `L-036`'s tests pin V2
  explicitly, which is why both pass together at the head (73/73 across the three items' suites).
* **`L-037` → nothing.** Its three source files are new and import nothing from the other items; it shares only the two
  documents.
* **Textual only:** every cross-item conflict is an append-order conflict in the two append-only documents. Nothing else
  overlaps (`pr-508-ancestry.json` → `crossItemOverlap`).

## After each merge

1. The CAP-03 static gate re-runs on `main` (whitespace + evidence/tracker validation) — a merged tree that fails the
   whitespace check is a real defect, not noise (that is exactly how `42398952807` failed on `d673d34`).
2. Re-run that item's targeted suites against the merged tree, plus the documents' own consistency assertions
   (`retrieval-evidence.test.ts` reads the register; `wi6aS2…`, `wi7…`, `wi9…` read it too).
3. Re-hash the item's evidence manifest.
4. Confirm the limitation statuses the merge is supposed to leave behind: `L-034`/`L-035`/`L-040` `RESOLVED`, `L-036`
   `PARTIALLY RESOLVED`, `L-037` `PARTIALLY RESOLVED`, `L-038` `OPEN`, `L-039` unchanged, `L-001`…`L-033` untouched.

## Ordering hazard worth naming

If `L-037` merges **before** `L-035`, `L-035`'s §17.20 is appended after §17.21 and the register's numbering runs out of
order, which breaks nothing mechanically but reads as a chronological lie. If WI-9 merges last, its §17.19 lands after
§17.21. Either is fixable with a renumbering commit, but renumbering is precisely the kind of quiet edit the register
exists to prevent — so the recommended order keeps the numbers and the dates in step.

## What the closeout still needs before merging

* the split decision (three PRs, or #508 as one unit) — both are prepared, only the first needs branch authority;
* confirmation that `L-037` stays `PARTIALLY RESOLVED` and `L-038` stays `OPEN` at merge time;
* a final `main` CI run after the last merge, read from GitHub, not inferred.
