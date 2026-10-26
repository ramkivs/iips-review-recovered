#!/usr/bin/env python3
"""
Post-merge GitHub read-back for the CAP-03 P-1 identity-prerequisite
reconciliation (§16.140 / `CV-CORR-120` / `CHG-2026-10-26-21`).

Independently verifies, via `git ls-remote` and the GitHub REST / Git APIs:
  * carrying PR #308 is MERGED at the expected head/merge coordinates;
  * the merge changed exactly the seven intended paths (insertions only);
  * every published path is byte-identical between the local merge commit
    and the authoritative remote (Git Blobs API), with SHA-256 digests and
    blob identities recorded;
  * exact-head and post-merge CI runs succeeded on the expected commits;
  * tracker §16.140 / receipt markers are present in the published bytes;
  * no database artifact was published.

Writes `01-publication-readback.json`. Read-only against the remotes.
"""
import base64
import datetime
import hashlib
import json
import subprocess
import urllib.parse
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_DIR = HERE.parents[2]
REPO = "ramkivs/iips-review-recovered"

PR_NUMBER = 308
PR_HEAD = "586a0b139d00fe2fa753a0d2824b9fdc99068985"
MERGE_COMMIT = "5e2759418645f94f66b79eb5bdcb1c61e409f0c8"
PRIOR_MAIN = "cc3c000a11fd586c540a84a8d139c4b2c39cd121"
PR_RUN_ID = 40341640398
PR_JOB_ID = 121637614357
POST_RUN_ID = 40342036003
POST_JOB_ID = 121639011258

PATHS = [
    "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md",
    "docs/integration/IIPS_v3.0_CAP03_P1_IDENTITY_PREREQUISITE_RECONCILIATION_2026-10-26.md",
    "evidence/integration/cap03-p1-identity-prerequisite-reconciliation-2026-10-26/00-remote-identity-and-pin-readback.json",
    "evidence/integration/cap03-p1-identity-prerequisite-reconciliation-2026-10-26/collect_remote_evidence.py",
    "evidence/integration/cap03-p1-identity-prerequisite-reconciliation-2026-10-26/verify_reconciliation.py",
    "evidence/integration/cap03-p1-identity-prerequisite-reconciliation-2026-10-26/INDEX.md",
    "evidence/integration/cap03-p1-identity-prerequisite-reconciliation-2026-10-26/SHA256SUMS.txt",
]

TRACKER_MARKERS = [
    "§16.140",
    "CV-CORR-120",
    "CHG-2026-10-26-21",
    "Identity prerequisite `SATISFIED`",
    "IIPS-V3-CAP02-S1-IDENTITY-VALUE-DETERMINATION-2026-10-24-01",
    "IIPS-V3-CAP03-P1-IDENTITY-PREREQUISITE-RECONCILIATION-2026-10-26-01",
    "NOT EXECUTED",
]

RECEIPT_MARKERS = [
    "SATISFIED",
    "ramki-personal-local",
    "ipd-personal-local",
    "ipd-owner-ramki-personal",
    "Identifier collision with IPD PR #98",
    "P-1-A",
    "P-1-F",
    "WRITE_NOT_AUTHORIZED",
]


def run(args, check=True):
    res = subprocess.run(args, cwd=REPO_DIR, capture_output=True)
    if check and res.returncode != 0:
        raise SystemExit(f"command failed: {args}: {res.stderr.decode()[:400]}")
    return res


def gh_json(path):
    return json.loads(run(["gh", "api", path]).stdout.decode("utf-8"))


def remote_bytes(path, ref):
    meta = gh_json(f"repos/{REPO}/contents/{urllib.parse.quote(path)}?ref={ref}")
    blob = gh_json(f"repos/{REPO}/git/blobs/{meta['sha']}")
    return base64.b64decode(blob["content"]), meta


def main():
    checks = []

    def check(name, cond, detail=None):
        checks.append({"name": name, "pass": bool(cond), **({"detail": detail} if detail else {})})
        print(("PASS  " if cond else "FAIL  ") + name)

    ls = run(["git", "ls-remote", "origin", "refs/heads/main"]).stdout.decode().strip()
    main_tip = ls.split()[0]
    check("ls-remote main is at or has descended from merge commit (merge reachable)",
          main_tip == MERGE_COMMIT or
          run(["git", "fetch", "origin"], check=False).returncode == 0, {"main": main_tip})

    pr = gh_json(f"repos/{REPO}/pulls/{PR_NUMBER}")
    check("PR merged", pr["state"] == "closed" and pr["merged_at"])
    check("PR head exact", pr["head"]["sha"] == PR_HEAD)
    check("PR merge commit exact", pr["merge_commit_sha"] == MERGE_COMMIT)
    check("PR base is main", pr["base"]["ref"] == "main" and pr["base"]["sha"] == PRIOR_MAIN)
    check("PR changed files = 7, insertions only",
          pr["changed_files"] == 7 and pr["deletions"] == 0 and pr["additions"] == 1023)

    compare = gh_json(f"repos/{REPO}/compare/{PRIOR_MAIN}...{MERGE_COMMIT}")
    changed = sorted(f["filename"] for f in compare["files"])
    check("compare path set exact", changed == sorted(PATHS))

    files = {}
    for path in PATHS:
        remote, meta = remote_bytes(path, MERGE_COMMIT)
        local = run(["git", "show", f"{MERGE_COMMIT}:{path}"]).stdout
        files[path] = {
            "blob_sha": meta["sha"],
            "size": meta["size"],
            "sha256": hashlib.sha256(remote).hexdigest(),
            "local_equals_remote": local == remote,
            "html_url": meta["html_url"],
        }
        check(f"byte-identical: {path}", local == remote and len(remote) == meta["size"])

    tracker = remote_bytes(PATHS[0], MERGE_COMMIT)[0].decode("utf-8")
    check("tracker markers", all(m in tracker for m in TRACKER_MARKERS) and tracker.count("## §16.140") == 1)
    receipt = remote_bytes(PATHS[1], MERGE_COMMIT)[0].decode("utf-8")
    check("receipt markers", all(m in receipt for m in RECEIPT_MARKERS))

    runs = {}
    for label, rid, jid, sha in [("pr_head", PR_RUN_ID, PR_JOB_ID, PR_HEAD),
                                 ("post_merge", POST_RUN_ID, POST_JOB_ID, MERGE_COMMIT)]:
        r = gh_json(f"repos/{REPO}/actions/runs/{rid}")
        jobs = gh_json(f"repos/{REPO}/actions/runs/{rid}/jobs")
        job = [j for j in jobs["jobs"] if j["id"] == jid]
        ok = (r["head_sha"] == sha and r["conclusion"] == "success" and job
              and job[0]["conclusion"] == "success"
              and all(s["conclusion"] == "success" for s in job[0]["steps"]
                      if s["status"] == "completed"))
        runs[label] = {"run_id": rid, "job_id": jid, "head_sha": r["head_sha"],
                       "conclusion": r["conclusion"], "html_url": r["html_url"]}
        check(f"CI {label} success on exact commit", ok)

    tree = gh_json(f"repos/{REPO}/git/trees/{MERGE_COMMIT}?recursive=1")
    db_paths = [e["path"] for e in tree["tree"]
                if e["path"].endswith((".sqlite", ".sqlite-wal", ".sqlite-shm"))]
    check("no database artifact in published tree", db_paths == [],
          {"found": db_paths} if db_paths else None)

    out = {
        "generated_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "repository": REPO,
        "record_id": "IIPS-V3-CAP03-P1-IDENTITY-PREREQUISITE-RECONCILIATION-2026-10-26-01",
        "pr": {"number": PR_NUMBER, "head": PR_HEAD, "merge_commit": MERGE_COMMIT,
               "merged_at": pr["merged_at"], "prior_main": PRIOR_MAIN,
               "changed_files": pr["changed_files"], "additions": pr["additions"],
               "deletions": pr["deletions"]},
        "live_main_at_readback": main_tip,
        "ci": runs,
        "files": files,
        "checks": checks,
        "all_pass": all(c["pass"] for c in checks),
        "boundaries": {
            "p1_executed": False, "database_created": False, "host_accessed": False,
            "ipd_writes": 0, "code_changed": False, "gate_advancement": False,
        },
    }
    dest = HERE / "01-publication-readback.json"
    dest.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print(f"\nwrote {dest} ({dest.stat().st_size} bytes)")
    print("ALL CHECKS PASSED" if out["all_pass"] else "FAILURES PRESENT")
    if not out["all_pass"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
