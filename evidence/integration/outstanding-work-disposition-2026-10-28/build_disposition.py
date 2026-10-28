#!/usr/bin/env python3
"""Read-only: derive the CAP-03 77-row disposition table and the CV-* register counts.

Inputs (IRR working tree, read-only):
  docs/integration/IIPS_v3.0_CAP03_P1_PA_RULING_SESSION_PACKAGE_2026-10-28.md  (Table 1, 77 rows)
  IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md        (CV-*/XV-* rows)

Writes nothing except stdout when run with no arguments; with --markdown prints the tracker table.
Disposition codes (tracker §16.172):
  NOT-OUTSTANDING  complete / superseded / closed: no disposition required
  BLOCKER          KEY TECHNICAL/FUNCTIONAL BLOCKER (none found; see §16.172.6)
  RESERVED         REQUIRED RESERVED DECISION - SPECIFIC OPERATION ONLY
  ACTIONABLE       ACTIONABLE - PROCEED UNDER EXISTING AUTHORITY
  MINOR            MINOR RESIDUAL - NON-BLOCKING
  OOS              OUT OF SCOPE
"""
import re, sys, collections
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PKG = ROOT / "docs/integration/IIPS_v3.0_CAP03_P1_PA_RULING_SESSION_PACKAGE_2026-10-28.md"
TRK = ROOT / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"

NAMES = {
    "NOT-OUTSTANDING": "NOT OUTSTANDING (complete/superseded/closed)",
    "BLOCKER": "KEY TECHNICAL/FUNCTIONAL BLOCKER",
    "RESERVED": "REQUIRED RESERVED DECISION - SPECIFIC OPERATION ONLY",
    "ACTIONABLE": "ACTIONABLE - PROCEED UNDER EXISTING AUTHORITY",
    "MINOR": "MINOR RESIDUAL - NON-BLOCKING",
    "OOS": "OUT OF SCOPE",
}

# row -> (code, operation(s) it prevents, next action). Row numbers are the package Table 1 '#'.
M = {}
def s(rows, code, blocks, nxt):
    for r in rows:
        M[r] = (code, blocks, nxt)

s([1, 5, 37, 50], "NOT-OUTSTANDING", "none", "none (complete/verified; residual, if any, is in the row named)")
s([47], "NOT-OUTSTANDING", "none", "none (superseded for execution by C-prime; C-prime not designated, see row 25 and 23)")
s([2], "OOS", "none", "inspect only if a PA ruling or IRR task requires it")
s([3], "MINOR", "none", "packet is on IRR main (blob 796e0c82); no further action")
s([4], "MINOR", "none for application work; label precision for any designation text", "PA labels ruling (Q-N1)")
s([6], "RESERVED", "unqualified formal S2 acceptance wording; P-1-A scope (row 46)", "PA ruling Q-S2-1 (R-1 absolute or not; D1)")
s([7], "RESERVED", "whether the 924/920/0/4 run at 001c3c80 satisfies Gate 4 S2 Limb A (row 66)", "PA ruling Q-S2-2 (= Q-B7)")
s([8], "MINOR", "none (label mapping only)", "after rows 6 and 7")
s([9], "RESERVED", "none now; operator retrieval of the 47-entry output (R-1) only if PA scopes it", "PA scope under Q-S2-1, then operator")
s([10], "RESERVED", "IRR pointer record for Q-S2-1/Q-S2-2 outcomes only", "after the ruling")
s([11], "MINOR", "none (IPD-owned record; IRR does not edit IPD)", "IPD correction only if PA requires it")
s([12, 13, 14, 15, 17, 18], "RESERVED", "Matter A designation path (rows 25-26, 67-70); not application work", "PA rulings in the order of packet 8.2")
s([16], "RESERVED", "Gate 4 S1 status and P1-EXEC (row 52); not application work", "PA states which governs S1")
s([19], "OOS", "IRR cannot amend act or IPD paths", "IPD workflow, only if PA chooses A-O3 or A-O4")
s([20], "OOS", "none (read-only IPD review, IPD-owned)", "separate IPD review pass when scheduled")
s([21], "RESERVED", "L2a/L2c gating and S2a (rows 67-69)", "PA ruling Q-B4")
s([22], "RESERVED", "eligibility of IPD aa43dec2 as a B-1 candidate", "PA ruling Q-B6")
s([23], "RESERVED", "B-DESIG (row 26), C-prime, P1-B supersession", "PA ruling Q-B1 after its dependencies")
s([24, 25], "RESERVED", "conditional (only if B-0 / B-1 is chosen)", "only if the conditional branch is chosen")
s([26], "RESERVED", "L2a, L2c, P1-F, G4-PIN (rows 51, 68-70)", "PA designation act after Q-B1/Q-B3")
s([27], "RESERVED", "P-1 execution receipt (DA-A1); 001c3c80 lacks the element", "PA waiver (Q-B2) or designation (Q-B3); receipt at execution only")
s([28], "RESERVED", "A6 runtime commit-independence (E5) and the E10 scope", "PA answer from source, or operator confirmation")
s([29], "RESERVED", "E10 option choice (C-1/C-2/C-3)", "PA ruling")
s([30], "RESERVED", "D-INST and the E10 method", "PA ruling: object first, then method")
s([31], "RESERVED", "PF instrument revision (conditional)", "only after D-Q")
s([32], "RESERVED", "whether DC-C2 replaces or supplements the native prerequisite for the next capture", "PA ruling E7")
s([33], "RESERVED", "root path naming for any capture (E8)", "PA names the root in writing")
s([34], "RESERVED", "PF-10 coverage in the procedure and instrument v2", "PA ruling")
s([35], "RESERVED", "any host use of the F2/F4/F5 literals (Q-P1)", "PA confirms the byte-level values")
s([36], "RESERVED", "procedure revision (deliberately not started)", "IRR revision only after rulings")
s([38], "RESERVED", "A6 runtime evidence (formal section 7); pwsh is absent in this sandbox", "operator run under host authorization only")
s([39], "RESERVED", "attempt-session DC-a/DC-b (V1102 OPEN); deferral waives nothing", "operator in the attempt session; PA on any diagnostic")
s([40], "RESERVED", "PF-11 acceptance; native run 92d931fb NOT PASSED and undiagnosed (technical, host-only)", "diagnosis only on PA request; DC-C2 not reopened")
s([41], "RESERVED", "P-1-C establishment (PF-01..PF-16 evidence)", "attempt-session observation")
s([42], "OOS", "none now", "attempt session only, after E10")
s([43], "RESERVED", "any capture or P-1 attempt (E10 not rendered)", "PA capture-authorization act after E1-E8 settle")
s([44], "RESERVED", "P-1-C establishment; the capture itself", "after E10 and the MF step")
s([45], "OOS", "none before the attempt", "not applicable before the attempt")
s([46], "RESERVED", "scope of P-1-A (formal S2 satisfied, candidate-scoped)", "Q-S2-1")
s([48], "RESERVED", "P-1 execution (P-1-C NOT ESTABLISHED)", "CAP and MF, then PA")
s([49], "RESERVED", "P-1 execution (P-1-D not verified for the attempt)", "CAP, then PA")
s([51], "RESERVED", "P-1 execution (act not rendered)", "PA authorization act after all gates")
s([52], "RESERVED", "P-1 execution itself (NOT EXECUTED / UNSPENT / NOT AUTHORIZED)", "none authorized")
s([53], "RESERVED", "S3 host/runtime preflight; QE and Gate 4 steps after it", "Operator host action under Gate 4 act")
s(list(range(54, 65)), "RESERVED", "QE-1..QE-11 execution; Gate 5 admission; durable-portfolio qualification (CV-20/CV-39)", "PA-authorized Gate 4 target-host qualification")
s([65], "RESERVED", "DQ-4 freeze act (criteria 7 and 8 NOT MET)", "after S2 to P-1 to S3 and native canonical evidence")
s([66], "RESERVED", "Gate 4 S2 Limb A native canonical npm test", "Q-S2-2 and operator native run")
s([67], "RESERVED", "S2a H-12 regeneration (not started; needs designation)", "after B-DESIG")
s([68], "RESERVED", "L2a fresh S2 evidence at the designated commit", "after B-DESIG")
s([69], "RESERVED", "L2c H-12 regeneration at the designated commit", "after B-DESIG and B-Q4")
s([70], "RESERVED", "Gate 4 pin designation (C-1/C-2/C-3)", "PA ruling")
s([71], "RESERVED", "DR-track (L2b) establishment", "PA ruling if required")
s([72], "RESERVED", "Gate 5 admission (NOT ADMITTED)", "after QE-1..QE-11 and Gate 4 acceptance")
s([73], "RESERVED", "IRR procedure revisions ahead of rulings (not authorized)", "after rulings, in an authorized write pass")
s([74], "OOS", "none for IRR; separate IPD prompt", "separate IPD prompt only")
s([75], "OOS", "none for IRR; dist gate measurement is IPD-owned", "separate authorization only")
s([76], "MINOR", "none (IPD-owned correction of S1 12.2 wording; conflict recorded)", "IPD correction only if PA requires it")
s([77], "RESERVED", "final reconciliation of Table 1 statuses", "after rulings and receipts")

def parse_package():
    rows = []
    for line in PKG.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\| (\d+) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \|", line)
        if m and 1 <= int(m.group(1)) <= 77:
            n = int(m.group(1))
            ident = re.sub(r"[*`]", "", m.group(2)).split(" — ")[0].strip()
            status = re.sub(r"[*`]", "", m.group(5)).split(" — ")[0].strip()
            rows.append((n, ident, status))
    return rows

def cv_counts():
    st = collections.OrderedDict()
    for line in TRK.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\| (CV-\d+) \|", line)
        if m and m.group(1) not in st:
            cells = [c.strip() for c in line.split("|")[1:-1]]
            st[m.group(1)] = cells[2]
    return st

def main():
    pkg = parse_package()
    assert len(pkg) == 77, f"expected 77 package rows, found {len(pkg)}"
    assert sorted(M) == list(range(1, 78)), "mapping must cover rows 1..77 exactly once"
    counts = collections.Counter(M[n][0] for n, _, _ in pkg)
    if "--markdown" in sys.argv:
        print("| # | ID | Package status (verbatim class) | Disposition | Operation prevented | Next action |")
        print("|---|---|---|---|---|---|")
        for n, ident, status in pkg:
            code, blocks, nxt = M[n]
            print(f"| {n} | {ident} | {status} | {NAMES[code]} | {blocks} | {nxt} |")
        return
    print("CAP-03 package rows parsed:", len(pkg))
    for code in NAMES:
        print(f"  {NAMES[code]}: {counts.get(code, 0)}")
    cv = cv_counts()
    print("CV-* rows parsed (tracker first occurrence):", len(cv))
    grp = collections.Counter()
    for k, v in cv.items():
        grp[v.split(" ")[0].strip("*`")] += 1
    print("CV-* row identities:", sorted(cv))

if __name__ == "__main__":
    main()
