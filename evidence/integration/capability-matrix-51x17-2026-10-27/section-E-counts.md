## E. Summary of current state

### E.1 Disposition counts (computed from the matrix; one bucket per row)

| Bucket | Rows | Row numbers |
|---|---|---|
| **ACCEPTED — current non-production scope** | **23** | 1, 2, 3, 6, 7, 9, 10, 11, 12, 13, 15, 17, 18, 20, 24, 25, 26, 31, 37, 38, 46, 49, 50 |
| **ACCEPTED — with open follow-up or deferred slice** | **9** | 4, 5, 19, 27, 35, 39, 45, 47, 48 |
| **DEFERRED by dated decision** | **3** | 8, 29, 41 |
| **OUT OF SCOPE / CLOSED by decision** | **8** | 14, 16, 21, 23, 33, 40, 44, 51 |
| **BLOCKED** | **2** | 30, 32 |
| **IMPLEMENTED — not integrated or not qualified** | **2** | 22, 28 |
| **BRANCH-ONLY / not on the authoritative ref** | **1** | 36 |
| **HISTORICAL / SOURCE-REPORTED baseline** | **2** | 42, 43 |
| **VERIFIED — correct behaviour, no release action** | **1** | 34 |
| **Total** | **51** | 1–51 |

**Counting rules.** (1) Exactly one bucket per row, assigned explicitly in `disposition.py` — never inferred from cell text. (2) `ACCEPTED` requires a named accepting authority in an effective record; a merge, a green CI run or the existence of code never counts. (3) A dated exclusion outranks "not built". (4) Branch-only work is never `main` state. (5) `SOURCE-REPORTED` never counts as verified. (6) Closed-by-decision rows are counted separately from blocked rows.

### E.2 Dimension-level counts (leading status token per cell; do not sum to 51 across dimensions)

| Dimension | V | P | NI | NW | NP | VP | EP | BL | NA | OOS | DEFERRED | NOT SATISFIED | NOT AUTHORIZED | NOT ACCEPTED | SATISFIED | BRANCH-ONLY | SOURCE-REPORTED |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Existence | 41 | 4 | 1 | – | – | – | – | – | 2 | – | – | – | – | – | – | 3 | – |
| Authority | 38 | 2 | – | – | – | – | – | – | – | 7 | 3 | – | 1 | – | – | – | – |
| Integration | 32 | 5 | 6 | – | – | – | – | – | 8 | – | – | – | – | – | – | – | – |
| Wiring | 28 | 2 | 2 | 5 | – | – | – | – | 14 | – | – | – | – | – | – | – | – |
| Data | 17 | 27 | – | – | – | – | – | – | 7 | – | – | – | – | – | – | – | – |
| Persistence | 6 | 8 | – | – | 2 | – | – | – | 35 | – | – | – | – | – | – | – | – |
| Recovery | 8 | 6 | – | – | 1 | – | – | – | 36 | – | – | – | – | – | – | – | – |
| Validation | 48 | – | – | – | – | – | – | – | – | – | – | 1 | – | – | – | – | 2 |
| E2E | 6 | 17 | – | – | – | – | 6 | – | 20 | – | – | 2 | – | – | – | – | – |
| Evidence | 50 | – | – | – | – | – | – | – | – | – | – | – | – | – | – | 1 | – |
| Governance | 50 | – | – | – | – | – | – | – | – | – | – | 1 | – | – | – | – | – |
| Acceptance | 33 | 2 | – | – | – | – | – | – | 1 | 8 | 2 | 4 | – | – | 1 | – | – |
| Qualification | 23 | 7 | – | – | – | – | – | – | 18 | – | – | 3 | – | – | – | – | – |
| Release-readiness | 46 | 2 | – | – | – | – | – | 3 | – | – | – | – | – | – | – | – | – |

