#!/usr/bin/env python3
"""Verify the CAP-03 P-1 preflight-capture acceptance assessment (tracker section 16.148).

Repository-side checks only: recomputes the assessed capture inventory from the published
bytes, re-derives the mechanical findings (pins, flags, absence, NTFS, PF-15 blob) from the
transcript contents, and checks documentation integrity. No host contact; no recapture;
no re-verification of the completed evidence publication chain.
"""
import hashlib
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
CAP = ROOT / "evidence" / "integration-" / "cap03-p1-reconcile-20261026T201328Z"
BUNDLE = pathlib.Path(__file__).resolve().parent
RECORD = ROOT / "docs/integration/IIPS_v3.0_CAP03_P1_PREFLIGHT_CAPTURE_ACCEPTANCE_ASSESSMENT_2026-10-27.md"
TRACKER = ROOT / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"

BASE_HEAD = "8eec74ae27cda09f3c368b9c299895eae41554db"
BASE_TREE = "4eba29029f8d95cfe483e615a7047426b298ce50"
DSG_HEAD = "001c3c80618f2ee1d40e9a90912237e1a06e7b58"
DSG_TREE = "399fa44a5f1953c0f61b452420fefb5985426ef1"
IRR_HEAD = "ba64b2d5927c2f872560710cf1474c25a5cde0d5"
IRR_TREE = "5e4262f1cd75bf13b76ced5b45058f31434b5dad"
PF15_BLOB = "3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d"

failures = []


def check(cid, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + cid + (" :: " + detail if detail else ""))
    if not ok:
        failures.append(cid)


def text(name):
    return (CAP / name).read_text(encoding="utf-8")


inv = json.loads((BUNDLE / "00-capture-inventory.json").read_text(encoding="utf-8"))
mapping = json.loads((BUNDLE / "01-acceptance-mapping.json").read_text(encoding="utf-8"))

# Inventory recomputation from published bytes.
actual = sorted(p.name for p in CAP.iterdir() if p.is_file())
check("INV-1", actual == sorted(f["name"] for f in inv["files"]) and len(actual) == 11,
      f"{len(actual)} files")
ok = True
for f in inv["files"]:
    b = (CAP / f["name"]).read_bytes()
    ok &= len(b) == f["bytes"] and hashlib.sha256(b).hexdigest() == f["sha256"]
check("INV-2", ok, "sizes + SHA-256 reproduced")
check("INV-3", sum(f["in_section_16_147_four_file_set"] for f in inv["files"]) == 4,
      "original four-file subset marked")

# Mechanical finding re-derivation from transcript contents.
f01, f02, f03 = text("01-pf01-hostname.txt"), text("02-pf02-pf03-os-identity.txt"), text("03-pf04-pf05-pf06-runtime.txt")
check("PF01-06", all(s in f01 + f02 + f03 for s in [
    "Hostname=DESKTOP-NO0NHTP", "Microsoft Windows 11 Home Single Language",
    "IsAdministrator=False", "AccountSID=S-1-5-21-", '"platform":"win32"',
    '"node":"v22.22.0"', '"arch":"x64"', '{"v":"ok"}', "ExperimentalWarning"]),
    "host/OS/elevation/runtime/sqlite facts present")

f04 = text("04-pf07-pf08-pf09-repositories.txt")
check("PF07-FAIL", f"HEAD={BASE_HEAD}" in f04 and f"TREE={BASE_TREE}" in f04
      and DSG_HEAD not in f04 and DSG_TREE not in f04
      and "PORCELAIN-BEGIN\nPORCELAIN-END" in f04.replace("\r\n", "\n"),
      "clean checkout evidenced at superseded baseline, designated pin absent")
check("PF08-09", f"HEAD={IRR_HEAD}" in f04 and f"TREE={IRR_TREE}" in f04
      and "IsShallow=false" in f04, "IRR consumer pin exact; IPD full history")

f05 = text("05-pf10-enabling-flags.txt")
check("PF10", f05.count("=<ABSENT>") == 9 and "IIPS_ENABLE_WRITES=<ABSENT>" in f05,
      "9/9 flags absent")

f06, f07 = text("06-pf11-pf12-pf13-store-path.txt"), text("07-pf14-evidence-root.txt")
check("PF11-13", all(s in f06 for s in [
    "StoreParentExists=True", "user-portfolio.sqlite]=False",
    "user-portfolio.sqlite-wal]=False", "user-portfolio.sqlite-shm]=False",
    "user-portfolio.sqlite-journal]=False", "EffectiveWriteProbe=PASS",
    "ProbeFileRemains=False", "UnderConfiguredOneDriveRoot=False",
    "OutsideEnumeratedIPDIRRWorktrees=True",
    "does not assert exclusion from unrelated repositories"])
    and "FileSystemType : NTFS" in f07 and "DriveType      : Fixed" in f07
    and "EvidenceRootIsNotStore=True" in f07,
    "absence/probe/sync + NTFS fixed shown; worktree scope enumerated-only (self-disclaimed)")

f08 = text("08-pf15-designation-crosscheck.txt")
blob = subprocess.run(["git", "ls-tree", "HEAD", "--",
                       "docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md"],
                      cwd=ROOT, capture_output=True, text=True).stdout
check("PF15", PF15_BLOB in f08 and PF15_BLOB in blob
      and "F4(verbatim)=C:\\iips-data\\iips\\user-portfolio.sqlite" in f08
      and "F3=N/A for Option A" in f08,
      "effective act blob + F4/F3 verbatim crosscheck")

f99 = text("99-final-verdict.txt")
check("VERDICT", "Verdict=PREFLIGHT CAPTURED \u2014 NOT AUTHORIZATION TO EXECUTE P-1" in f99
      and "P1Executed=False" in f99 and "P1AuthorizedByThisScript=False" in f99,
      "verdict preserved; no execution/authorization claimed")

# Mapping internal consistency.
st = {r["id"]: r["status"] for r in mapping["requirements"]}
check("MAP-1", st.get("PF-07") == "NOT_SATISFIED" and st.get("PF-16") == "NOT_SATISFIED"
      and st.get("PF-11") == "INSUFFICIENT" and st.get("STEP0-HASHES") == "NOT_APPLICABLE"
      and mapping["resulting_status"]["PREFLIGHT_ACCEPTANCE"] == "NOT ACCEPTED",
      "mapping statuses consistent with findings")

# Documentation integrity.
rec = RECORD.read_text(encoding="utf-8")
trk = TRACKER.read_text(encoding="utf-8")
check("DOC-1", "IIPS-V3-CAP03-P1-PREFLIGHT-CAPTURE-ACCEPTANCE-ASSESSMENT-2026-10-27-01" in rec
      and "NOT ACCEPTED" in rec and "PREFLIGHT CAPTURED \u2014 NOT AUTHORIZATION TO EXECUTE P-1" in rec,
      "record ID + decision + preserved verdict")
check("DOC-2", trk.count("## \u00a716.148 ") == 1 and "CV-CORR-128" in trk
      and "CHG-2026-10-27-03" in trk, "single section 16.148 heading; registers present")
check("DOC-3", trk.count("## \u00a716.147 ") == 1 and "DESIGNATED; PARTIALLY OBSERVED" in trk,
      "section 16.147 preserved unedited")

print()
if failures:
    print("ASSESSMENT VERIFICATION FAILED:", failures)
    sys.exit(1)
print("ASSESSMENT VERIFIED")
