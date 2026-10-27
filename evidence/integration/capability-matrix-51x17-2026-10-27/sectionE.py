"""Emit section E (computed counts) from the same source used for the matrix."""
import build_matrix as bm
import matrix_data as md
from disposition import DISPOSITION, LABELS, TOKENS, bucket_counts, dimension_counts

bm.complete_na_rationales()
bc = bucket_counts()
lines = []
lines.append("## E. Summary of current state\n")
lines.append("### E.1 Disposition counts (computed from the matrix; one bucket per row)\n")
lines.append("| Bucket | Rows | Row numbers |")
lines.append("|---|---|---|")
total = 0
for b in ["ACCEPTED", "ACCEPTED+FOLLOWUP", "DEFERRED", "OOS", "BLOCKED", "IMPLEMENTED",
          "BRANCH_ONLY", "HISTORICAL", "VERIFIED"]:
    rows = sorted(bc.get(b, []))
    total += len(rows)
    lines.append(f"| **{LABELS[b]}** | **{len(rows)}** | {', '.join(str(r) for r in rows)} |")
lines.append(f"| **Total** | **{total}** | 1–51 |")
lines.append("")
lines.append("**Counting rules.** (1) Exactly one bucket per row, assigned explicitly in "
             "`disposition.py` — never inferred from cell text. (2) `ACCEPTED` requires a named "
             "accepting authority in an effective record; a merge, a green CI run or the existence of "
             "code never counts. (3) A dated exclusion outranks \"not built\". (4) Branch-only work is "
             "never `main` state. (5) `SOURCE-REPORTED` never counts as verified. (6) Closed-by-decision "
             "rows are counted separately from blocked rows.\n")
lines.append("### E.2 Dimension-level counts (leading status token per cell; do not sum to 51 across dimensions)\n")
dc = dimension_counts()
tokens = ["V", "P", "NI", "NW", "NP", "VP", "EP", "BL", "NA", "OOS", "DEFERRED",
          "NOT SATISFIED", "NOT AUTHORIZED", "NOT ACCEPTED", "SATISFIED",
          "BRANCH-ONLY", "SOURCE-REPORTED"]
lines.append("| Dimension | " + " | ".join(tokens) + " |")
lines.append("|---" * (len(tokens) + 1) + "|")
for dim, counts in dc.items():
    cells = [str(counts.get(t, "–")) for t in tokens]
    lines.append(f"| {dim} | " + " | ".join(cells) + " |")
lines.append("")
print("\n".join(lines))
