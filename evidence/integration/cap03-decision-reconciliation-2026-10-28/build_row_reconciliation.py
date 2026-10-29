#!/usr/bin/env python3
"""Reconcile the 77-row CAP-03 PA ruling-session register (Table 1 of
docs/integration/IIPS_v3.0_CAP03_P1_PA_RULING_SESSION_PACKAGE_2026-10-28.md)
against the formal decision and adoption records, as verified on
2026-10-28. Writes 02-row-reconciliation.tsv next to this script.

Categories (directive G14):
  AWAIT-PA        awaiting a specific PA ruling (or dependent on one)
  AWAIT-OPERATOR  awaiting an operator-provided artifact or host action
  TECH-BLOCKED    blocked by an unmet technical prerequisite
  SEPARATE-ACT    awaiting a separately authorized IRR or IPD act
  COMPLETE        complete and recorded/verified (IPD-reported where marked)
  CLOSED          superseded or not applicable now (no action)

Only the mapping below carries judgement; every entry cites its basis.
The script asserts that every Table 1 row ID is mapped exactly once.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
PKG = ROOT / "docs/integration/IIPS_v3.0_CAP03_P1_PA_RULING_SESSION_PACKAGE_2026-10-28.md"
OUT = pathlib.Path(__file__).resolve().parent / "02-row-reconciliation.tsv"

M = {
 "R-01": ("COMPLETE", "complete/verified; tracker 16.173.1", "prior: complete/verified"),
 "R-02": ("COMPLETE", "complete/verified this pass (lead 40e36ab9 unchanged)", "CHANGED: not started -> complete/verified (16.173.1)"),
 "PK-01": ("COMPLETE", "implemented; packet blob 796e0c82 on IRR main (verified)", "prior: implemented"),
 "Q-N1": ("AWAIT-PA", "awaiting PA; formal record 4.5 reuses C-1/C-2/C-3 labels for pin choices; labels not adopted", "prior: awaiting PA"),
 "S2-DEP": ("COMPLETE", "complete/verified", "prior: complete/verified"),
 "Q-S2-1": ("AWAIT-PA", "NARROWED: candidate-scoped operative basis adopted by PA direction 2026-10-26 (disposition 16.143). Open: R-1 absolute or not, D1, PASS status, R-2 register direction. Premise of option (c) corrected: acceptance 5 states R-2 clearing condition", "CHANGED: disputed -> awaiting PA (narrowed)"),
 "Q-S2-2": ("AWAIT-PA", "Gate 4 S2 Limb A OUTSTANDING, not started (formal record 8); no route adopted", "prior: disputed; state unchanged"),
 "Q-B5": ("AWAIT-PA", "awaiting PA; labels only", "prior: awaiting PA"),
 "S2-ORIG": ("AWAIT-OPERATOR", "operator supplies original host bytes and 47-entry output; no Table 1 dependents", "prior: awaiting operator"),
 "S2-IRRDOC": ("AWAIT-PA", "prepared (Addendum 1 section 4); applies after Q-S2-1 direction and Q-S2-2 outcome", "prior: not started; still not applied"),
 "IPD-S2REC": ("COMPLETE", "IPD-side correction merged (IPD PR 106, 1ba0740a); IRR does not write IPD; PA direction only if PA requires", "CHANGED: disputed -> complete (IPD-side)"),
 "A-Q1": ("AWAIT-PA", "awaiting PA; no adopted decision in formal record", "prior: awaiting PA"),
 "A-Q2": ("AWAIT-PA", "awaiting PA; designated-blob conflict C-2 recorded (item 12 designated 9a5fd9e3, observed edd0305e)", "prior: awaiting PA"),
 "A-Q3": ("AWAIT-PA", "awaiting PA; PA-5 scope wording question C-5", "prior: awaiting PA"),
 "A-Q4": ("AWAIT-PA", "awaiting PA", "prior: awaiting PA"),
 "A-GAP1": ("AWAIT-PA", "authority gap; no Q-ID; Gate 4 act 6 S1 text vs S1 determination 12.2 (C-4)", "prior: disputed; state unchanged"),
 "A-Q5": ("AWAIT-PA", "awaiting PA after A-Q1 to A-Q4", "prior: awaiting PA"),
 "A-Q6": ("AWAIT-PA", "awaiting PA after A-Q5", "prior: awaiting PA"),
 "A-IPD": ("SEPARATE-ACT", "IPD-owned act; trigger A-Q5; IRR does not write IPD", "prior: not started"),
 "D2-REV": ("COMPLETE", "IPD-reported review complete (IRR not re-verified)", "prior: implemented"),
 "B-Q4": ("AWAIT-PA", "awaiting PA", "prior: awaiting PA"),
 "B-Q6": ("AWAIT-PA", "awaiting PA", "prior: awaiting PA"),
 "B-Q1": ("AWAIT-PA", "awaiting PA; B-1 designation needs a separate act after C' (formal record 4.2, 4.6)", "prior: awaiting PA"),
 "B-Q2": ("AWAIT-PA", "conditional on B-Q1 = B-0; PA-5 Option B addresses the receipt element by IPD implementation (PR 100), but the choice is PA's", "prior: not started (conditional)"),
 "B-Q3": ("AWAIT-PA", "conditional on B-Q1 = B-1; after A-Q1 to A-Q6", "prior: not started (conditional)"),
 "B-DESIG": ("AWAIT-PA", "no designation made; formal record 4.2 L2a NOT DESIGNATED", "prior: not started"),
 "DA-A1": ("COMPLETE", "ADOPTED as written, limited to stated scope (adoption record 1); not a P-1 authorization", "CHANGED: implemented -> adopted (adoption record 1)"),
 "C-Q1": ("AWAIT-PA", "awaiting PA (fact question; source does not state it)", "prior: awaiting PA"),
 "C-Q2": ("AWAIT-PA", "awaiting PA; also depends on B-Q1 for commit-keyed items", "prior: awaiting PA"),
 "D-Q": ("AWAIT-PA", "awaiting PA; object of the criterion first", "prior: awaiting PA"),
 "D-INST": ("AWAIT-PA", "conditional on D-Q = D-2 and A6 host runtime; v2 instrument (DB-B1) is the current identity, not a D-INST change", "prior: not started (conditional)"),
 "E7": ("AWAIT-PA", "NARROWED: replacement for the next capture adopted (DC-C2, adoption record 1); subsequent-capture requirement not decided", "CHANGED: awaiting PA -> awaiting PA (narrowed)"),
 "E8": ("AWAIT-PA", "awaiting PA-named root; procedure still D:\\iips-evidence (lines 131, 150, 154, 167, 193, 440, 486)", "prior: awaiting PA"),
 "PF10": ("AWAIT-PA", "awaiting PA; procedure line 147 still wildcard GATE_A_PRIME_*", "prior: awaiting PA"),
 "QP1": ("AWAIT-PA", "operative F2/F4/F5 values are those of effective act -02 (P-1-E satisfied); PA confirmation or further act not recorded", "prior: awaiting PA; values recorded"),
 "E3": ("AWAIT-PA", "PARTIALLY APPLIED: revisions 2026-10-28, b and c (DB-B1 v2 identity, DC-C2 4.3a, A6 conformance); PF-10, root, pins and acceptance criteria remain PA-reserved", "CHANGED: not started -> partially applied"),
 "E4": ("COMPLETE", "complete/verified: v2 identity 191f5828 / 13783385 (DB-B1; procedure lines 82-83)", "prior: complete/verified"),
 "E5": ("AWAIT-OPERATOR", "host run NOT RUN (no pwsh in sandbox); host-only", "prior: blocked"),
 "E6": ("AWAIT-OPERATOR", "V1102 OPEN; host verification of DC-a and DC-b", "prior: pending"),
 "PF-11D": ("AWAIT-OPERATOR", "native run 92d931fb NOT PASSED, undiagnosed; PA-3d deferred; reconsideration only on authorized host evidence", "prior: blocked"),
 "PFREG": ("AWAIT-OPERATOR", "operator register read; attempt session", "prior: pending"),
 "E9": ("AWAIT-OPERATOR", "attempt session only; not applicable now", "prior: not applicable now"),
 "E10": ("AWAIT-PA", "capture-authorization PA act NOT RENDERED; prerequisites open", "prior: not started"),
 "CAP": ("AWAIT-OPERATOR", "gated by E10; attempt session only", "prior: not started"),
 "MF": ("CLOSED", "not applicable before the attempt", "prior: not applicable"),
 "P1-A": ("COMPLETE", "accepted under candidate-scoped scope (formal record 8: SATISFIED)", "prior: accepted under scope"),
 "P1-B": ("CLOSED", "superseded for execution by C' designation (formal record 4.2)", "prior: superseded"),
 "P1-C": ("AWAIT-OPERATOR", "P-1-C NOT ESTABLISHED: attempt-session raw bytes, PA capture authority, host run", "prior: pending"),
 "P1-D": ("AWAIT-OPERATOR", "P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT", "prior: pending"),
 "P1-E": ("COMPLETE", "SATISFIED (act -02; formal record 8)", "prior: complete/verified"),
 "P1-F": ("AWAIT-PA", "P-1 authorization act NOT RENDERED; prerequisites open (P1-C, P1-D, B-DESIG, L2a, L2c)", "prior: not started"),
 "P1-EXEC": ("TECH-BLOCKED", "NOT AUTHORIZED; prerequisites P1-F, A-GAP1, S2a", "prior: blocked"),
 "S3": ("TECH-BLOCKED", "blocked: S1 and S2a", "prior: blocked"),
 **{f"QE-{i}": ("TECH-BLOCKED", "blocked: QE requires S3 and the Gate 4 chain; native-Windows evidence required (no CI substitute)", "prior: blocked") for i in range(1, 12)},
 "DQ4": ("TECH-BLOCKED", "8/10 criteria MET (criteria 5 and 6 MET per tracker 16.122 series); freeze NOT ESTABLISHED; criteria 7 and 8 NOT MET", "CHANGED: pending -> blocked (8/10 carried)"),
 "G4-S2": ("AWAIT-PA", "awaiting Q-S2-2 route; native Limb A run is operator-dependent", "prior: not started"),
 "G4-S2A": ("TECH-BLOCKED", "needs B-Q4, B-DESIG, L2c", "prior: not started"),
 "L2A": ("TECH-BLOCKED", "needs PA designation of the execution commit (B-DESIG) and S2 at that commit", "prior: not started"),
 "L2C": ("TECH-BLOCKED", "needs B-DESIG and H-12 regeneration at the designated commit", "prior: not started"),
 "G4-PIN": ("AWAIT-PA", "trigger 'C-prime exists' now met (a891802e verified); decision not made; decision item prepared in Addendum 1 section 6", "CHANGED: awaiting PA; trigger met"),
 "L2B": ("AWAIT-PA", "PA if required", "prior: pending"),
 "G5-ADM": ("TECH-BLOCKED", "blocked: P1-EXEC, S2a, Gate 4 Limb A, QE, Gate 4 acceptance", "prior: blocked"),
 "IRR-PROC": ("AWAIT-PA", "dependent on rulings in G2 to G5; not applied", "prior: not started"),
 "IPD-C2": ("SEPARATE-ACT", "IPD-owned; needs B-Q1 and a separate IPD prompt", "prior: not started"),
 "IPD-DIST": ("SEPARATE-ACT", "IPD-reported complete (dist 1,140, PR 106); IRR does not verify IPD actions", "prior: pending"),
 "IPD-S1": ("SEPARATE-ACT", "IPD-owned; needs A-Q2 and A-GAP1", "prior: disputed"),
 "FINAL": ("TECH-BLOCKED", "after all groups; not eligible", "prior: not started"),
}

def main() -> int:
    rows = []
    for ln in PKG.read_text(encoding="utf-8").splitlines():
        if re.match(r"^\| \d+ \|", ln):
            c = [x.strip() for x in ln.strip().strip("|").split("|")]
            m = re.search(r"\*\*([^*]+)\*\*", c[1])
            rid = m.group(1) if m else c[1]
            rows.append((int(c[0]), rid))
    ids = [r for _, r in rows]
    missing = sorted(set(ids) - set(M))
    extra = sorted(set(M) - set(ids))
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if len(rows) != 77 or missing or extra or dup:
        print("MAPPING ERROR", len(rows), "missing", missing, "extra", extra, "dup", dup)
        return 1
    lines = ["row\tid\tcategory\treconciled_status_and_basis\tchange_from_table1"]
    counts = {}
    for n, rid in rows:
        cat, basis, chg = M[rid]
        counts[cat] = counts.get(cat, 0) + 1
        lines.append(f"{n}\t{rid}\t{cat}\t{basis}\t{chg}")
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("rows", len(rows))
    for k in sorted(counts):
        print(f"{k}\t{counts[k]}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
