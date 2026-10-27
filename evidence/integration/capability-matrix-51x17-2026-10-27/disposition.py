"""Disposition buckets (one per row) and dimension-level token counts.

Buckets are assigned explicitly here - never inferred from cell text - so the
report's counts can be audited line by line.
"""
import build_matrix as bm
import matrix_data as md

bm.complete_na_rationales()  # cells must be final before counting

DISPOSITION = {
    1: "ACCEPTED", 2: "ACCEPTED", 3: "ACCEPTED", 4: "ACCEPTED+FOLLOWUP", 5: "ACCEPTED+FOLLOWUP",
    6: "ACCEPTED", 7: "ACCEPTED", 8: "DEFERRED", 9: "ACCEPTED", 10: "ACCEPTED",
    11: "ACCEPTED", 12: "ACCEPTED", 13: "ACCEPTED", 14: "OOS", 15: "ACCEPTED",
    16: "OOS", 17: "ACCEPTED", 18: "ACCEPTED", 19: "ACCEPTED+FOLLOWUP", 20: "ACCEPTED",
    21: "OOS", 22: "IMPLEMENTED", 23: "OOS", 24: "ACCEPTED", 25: "ACCEPTED",
    26: "ACCEPTED", 27: "ACCEPTED+FOLLOWUP", 28: "IMPLEMENTED", 29: "DEFERRED", 30: "BLOCKED",
    31: "ACCEPTED", 32: "BLOCKED", 33: "OOS", 34: "VERIFIED", 35: "ACCEPTED+FOLLOWUP",
    36: "BRANCH_ONLY", 37: "ACCEPTED", 38: "ACCEPTED", 39: "ACCEPTED+FOLLOWUP", 40: "OOS",
    41: "DEFERRED", 42: "HISTORICAL", 43: "HISTORICAL", 44: "OOS", 45: "ACCEPTED+FOLLOWUP",
    46: "ACCEPTED", 47: "ACCEPTED+FOLLOWUP", 48: "ACCEPTED+FOLLOWUP", 49: "ACCEPTED",
    50: "ACCEPTED", 51: "OOS",
}

LABELS = {
    "ACCEPTED": "ACCEPTED — current non-production scope",
    "ACCEPTED+FOLLOWUP": "ACCEPTED — with open follow-up or deferred slice",
    "DEFERRED": "DEFERRED by dated decision",
    "OOS": "OUT OF SCOPE / CLOSED by decision",
    "BLOCKED": "BLOCKED",
    "IMPLEMENTED": "IMPLEMENTED — not integrated or not qualified",
    "BRANCH_ONLY": "BRANCH-ONLY / not on the authoritative ref",
    "HISTORICAL": "HISTORICAL / SOURCE-REPORTED baseline",
    "VERIFIED": "VERIFIED — correct behaviour, no release action",
}

TOKENS = ["V", "P", "NI", "NW", "NP", "VP", "EP", "EM", "NA", "OOS", "DEFERRED",
          "NOT SATISFIED", "NOT AUTHORIZED", "NOT ACCEPTED", "BRANCH-ONLY",
          "SOURCE-REPORTED", "BL"]


def first_token(cell: str) -> str:
    """Normalise a cell's leading status token (long qualified forms collapse)."""
    head = cell.split("—")[0].strip().rstrip(".")
    for t in ("NOT SATISFIED", "NOT AUTHORIZED", "NOT ACCEPTED", "BRANCH-ONLY",
              "SOURCE-REPORTED", "DEFERRED", "SATISFIED", "OOS", "BL", "VP", "EP",
              "EM", "NI", "NW", "NP", "NA", "P", "V"):
        if head == t or head.startswith(t + " ") or head.startswith(t + "("):
            return t
    return head[:24]


def bucket_counts():
    out = {}
    for n, b in DISPOSITION.items():
        out.setdefault(b, []).append(n)
    return out


def dimension_counts():
    counts = {}
    for i in range(2, 16):
        dim = md.HEADERS[i]
        c = {}
        for row in md.ROWS:
            t = first_token(str(row[i]))
            c[t] = c.get(t, 0) + 1
        counts[dim] = dict(sorted(c.items(), key=lambda kv: (-kv[1], kv[0])))
    return counts


if __name__ == "__main__":
    assert sorted(DISPOSITION) == list(range(1, 52)), "disposition map must cover all 51 rows"
    print("--- disposition buckets")
    for b, rows in bucket_counts().items():
        print(f"{LABELS[b]:52s} {len(rows):2d}  {rows}")
    print("total", sum(len(v) for v in bucket_counts().values()))
    print("--- dimension counts")
    for dim, c in dimension_counts().items():
        print(f"{dim:20s}", c)
