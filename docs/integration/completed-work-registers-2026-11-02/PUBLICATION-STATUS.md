# Publication status — IRR and IPD halves of the 2026-11-02 registers

**Record:** `IIPS-V3-COMPLETED-WORK-AND-AUTHORITY-REGISTERS-IRR-2026-11-02-01`
**Date:** `2026-11-02` (Asia/Calcutta)

This file exists so that no reader can mistake a prepared artifact for a published one. It is updated by a
dated receipt when the IPD half is actually published.

## 1. IRR half — publication route

| Field | Value |
|---|---|
| Owning repository | `ramkivs/iips-review-recovered` |
| Branch | `arena/75227efc-iips-review-recovered` |
| Pull request | **#429** |
| Baseline | `main@6f347a018dbfacbc7d5e62fe9f773b323ce9d69c` (PR #428) |
| Tracker allocation | §16.248 / `CV-CORR-228` / `CHG-2026-11-01-27` / `V2011`–`V2022` |
| Required check | `Python compile · source/evidence/tracker validation` |

The merge commit, post-merge check result and independent remote read-back are recorded in the tracker's
post-merge receipt for §16.248. **`V2022` remains `PENDING` until that receipt exists.** Nothing in this
directory claims an IRR merge that has not happened.

## 2. IPD half — PREPARED, NOT PUBLISHED

| Field | Value |
|---|---|
| Owning repository | `ramkivs/iips-production-market-data` |
| Intended path | `evidence/cross-repository/completed-work-registers-2026-11-02/` |
| Intended branch | `arena/75227efc-iips-production-market-data` |
| Prepared local commit | `20ed8038272ba4f64c11b352fdbf7178054208c2` |
| Prepared local tree | `cfdb763e9d824fafec1426e8e1875dde49aa8a3b` |
| Parent (IPD baseline) | `0a3b5f0f038e13305a3b927865acc349e19f043f` (PR #119) |
| Diff | 9 files changed, 1,314 insertions, 0 deletions — documentation/evidence only |
| Contents | 22 IPD-owned completed-work records (18 fields each); 5 IPD-limb residuals; cross-reference index to these IRR registers; `registers.json`; `SHA256SUMS.txt`; an additive IPD tracker overlay |
| **Publication status** | **NOT PUBLISHED — BLOCKED ON REPOSITORY WRITE ACCESS** |

### 2.1 The exact blocker (measured, not inferred)

The Arena session token can write IRR but cannot write IPD. Both repositories report
`permissions.push = true` for the user, so this is a **token/installation scope** boundary, not a
repository permission or a branch-protection rule.

| Probe | Result |
|---|---|
| `git push origin arena/75227efc-iips-production-market-data` | `403` — `Permission to ramkivs/iips-production-market-data.git denied to ramkivs` |
| Same push with an explicit `Authorization: Bearer` header | identical `403` |
| `POST /repos/…/git/refs` (create branch at the existing `main` SHA) | `403 Resource not accessible by integration` |
| `POST /repos/…/merges` | `403 Resource not accessible by integration` |
| `GET /repos/…/git/ref/heads/main` (read) | **succeeds** — `0a3b5f0f038e13305a3b927865acc349e19f043f` |
| IRR push on the same token | **succeeds** — branch created, PR #429 opened, check passed |

No retry loop, credential change, fork, mirror or workaround was attempted. No IPD ref, file, PR or
branch was created or altered. **No claim of IPD publication or IPD remote verification is made anywhere
in these registers.**

### 2.2 What this does and does not affect

- The **IRR-owned registers are complete and self-contained.** Every IRR row stands on its own cited
  IRR evidence. Register A.X lists the IPD-owned items as cross-references so the IRR register remains a
  complete navigational entry point, and each of those rows is marked *prepared; IPD publication pending*.
- The **IPD-owned record bodies are not written into IRR.** They exist only in the prepared IPD commit.
  This preserves the repository-ownership boundary even while publication is blocked.
- **No status in any register depends on the IPD half being published.** The registers rest on already
  published IPD records (PRs #113, #114, #117, #118, #119 and the earlier IPD tracker sections), all of
  which are on IPD `main` today and were verified read-only.

### 2.3 What remains, and who can do it

1. Restore IPD write access for the session token (or run the IPD publication from a session that has it).
2. Push the prepared commit `20ed8038…` to `arena/75227efc-iips-production-market-data`.
3. Open the IPD PR against `main`, obtain the green `typecheck · build · test` and `executed test count`
   checks, merge by the ordinary PR route, and perform an independent remote read-back.
4. Add a dated receipt here and in the IPD tracker recording the merge commit, tree, check runs and
   read-back identities. Only then may the IPD half be described as published.

Until step 4 is complete, the correct description is: **IRR half published; IPD half prepared and
publication-blocked.**

## 3. Preservation

Nothing historical was discarded to produce this status file. No existing record in either repository
was edited, deleted, reordered or rewritten. The IRR tracker change is additive (`+69 / −0`), and the
prepared IPD tracker change is additive (`+53 / −0`), each asserted line-by-line against its baseline.
