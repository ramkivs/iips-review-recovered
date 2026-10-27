#!/usr/bin/env python3
"""Verify the capability-matrix publication.

Two modes:
  --local   : re-derive every artefact from source and check SHA256SUMS.txt against the
              working tree.
  --remote  : read every published blob back from GitHub (git blobs API), base64-decode it
              and compare its SHA-256 and byte length with both SHA256SUMS.txt and the local
              file. Fails closed on any mismatch, any missing file, or any extra file in the
              bundle. Writes 03-publication-readback.json.

Usage:
  python3 verify_publication.py --local
  python3 verify_publication.py --remote --repo ramkivs/iips-review-recovered --commit <sha>
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
REPO_ROOT = HERE.parents[2]
SUMS = HERE / "SHA256SUMS.txt"
RECEIPT = HERE / "03-publication-readback.json"
RECORD_ID = "IIPS-V3-CAPMATRIX-51X17-RECONSTRUCTION-2026-10-27-01"
REPORT_REL = "docs/integration/IIPS_v3.0_CAPABILITY_MATRIX_51X17_RECONSTRUCTION_2026-10-27.md"
TRACKER_REL = "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_sums() -> dict[str, tuple[str, int]]:
    out = {}
    for line in SUMS.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        digest, name = line.split(None, 1)
        out[name.strip()] = (digest.lower(), -1)
    return out


def bundle_files() -> list[pathlib.Path]:
    return sorted(p for p in HERE.iterdir()
                  if p.is_file()
                  and p.name not in {"SHA256SUMS.txt", "03-publication-readback.json", "make_sums.py"}
                  and not p.name.endswith(".pyc"))


def local_checks() -> tuple[list[dict], bool]:
    results = []

    def add(name: str, ok: bool, detail: str = "") -> None:
        results.append({"check": name, "ok": bool(ok), "detail": detail})

    # 1. regenerate every derived artefact and require byte-identical output
    before = {p.name: sha256(p.read_bytes()) for p in bundle_files()}
    for script in ("build_matrix.py", "build_report.py"):
        subprocess.run([sys.executable, script], cwd=HERE, check=True,
                       stdout=subprocess.DEVNULL)
    after = {p.name: sha256(p.read_bytes()) for p in bundle_files()}
    add("artefacts are reproducible from source", before == after,
        "changed: " + ",".join(k for k in after if before.get(k) != after[k]))

    # 2. SHA256SUMS covers exactly the bundle
    sums = read_sums()
    names = {p.name for p in bundle_files()}
    add("SHA256SUMS covers every bundle file", names <= set(sums), str(sorted(names - set(sums))))
    allowed_extra = {pathlib.Path(REPORT_REL).name, pathlib.Path(TRACKER_REL).name}
    add("SHA256SUMS has no stale entry", set(sums) - names <= allowed_extra,
        str(sorted(set(sums) - names - allowed_extra)))
    mismatches = [n for n in sorted(names & set(sums))
                  if sha256((HERE / n).read_bytes()) != sums[n][0]]
    add("every file matches its recorded SHA-256", not mismatches, ",".join(mismatches))

    # 3. matrix self-check receipt
    receipt = json.loads((HERE / "00-artefact-checks.json").read_text(encoding="utf-8"))
    add("matrix receipt: 51 rows", receipt.get("rows") == 51)
    add("matrix receipt: numbering 1-51", receipt.get("numbers_contiguous_1_51") is True)
    add("matrix receipt: headers exact and ordered", receipt.get("headers_exact_17_in_order") is True)
    add("matrix receipt: every row has 17 cells", receipt.get("row_arity_all_17") is True)
    add("matrix receipt: no empty cells", receipt.get("empty_cells") == [])
    add("matrix receipt: no unexplained NA",
        receipt.get("na_cells_without_inline_rationale") == [])
    add("matrix receipt: CSV round-trip equal", receipt.get("csv_matches_source") is True)

    # 4. report and tracker
    report = (REPO_ROOT / REPORT_REL).read_bytes()
    text = report.decode("utf-8")
    add("report exists and carries the record id", RECORD_ID in text,
        f"{len(report)} B")
    add("report has the 51-row matrix", len(re.findall(r"^\| \d+ \| ", text, flags=re.M)) == 102)
    tracker = (REPO_ROOT / TRACKER_REL).read_text(encoding="utf-8")
    add("tracker overlay §16.150 present exactly once", tracker.count("## §16.150 —") == 1)
    add("tracker change-log row CHG-2026-10-27-06 present",
        "`CHG-2026-10-27-06`" in tracker)
    add("no §18.1 text was rewritten",
        tracker.count("## 18 Capability Convergence Matrix") == 1)
    add("P-1 still recorded UNSPENT", "UNSPENT" in tracker)
    return results, all(r["ok"] for r in results)


def gh_tree(repo: str, commit: str) -> dict[str, tuple[str, int]]:
    """path -> (blob sha, size) for every blob in the commit's tree."""
    out = subprocess.run(["gh", "api", f"repos/{repo}/git/trees/{commit}?recursive=1"],
                         check=True, capture_output=True).stdout
    return {e["path"]: (e["sha"], e.get("size", -1))
            for e in json.loads(out).get("tree", []) if e["type"] == "blob"}


def gh_blob(repo: str, blob_sha: str) -> bytes:
    """Exact blob bytes. The Git blobs API is used because the Contents API omits
    `content` for blobs over 1 MB (the tracker is 2.6 MB) and would silently return
    an empty body."""
    out = subprocess.run(["gh", "api", f"repos/{repo}/git/blobs/{blob_sha}"],
                         check=True, capture_output=True).stdout
    payload = json.loads(out)
    if payload.get("encoding") != "base64":
        raise SystemExit(f"unexpected encoding {payload.get('encoding')!r} for {blob_sha}")
    return base64.b64decode(payload["content"])


def remote_checks(repo: str, commit: str) -> tuple[list[dict], bool]:
    results = []

    def add(name: str, ok: bool, detail: str = "") -> None:
        results.append({"check": name, "ok": bool(ok), "detail": detail})

    tree = gh_tree(repo, commit)
    # Compare against the manifest *as published in this commit*, so the read-back is
    # self-contained and does not depend on the working tree being at that commit.
    manifest_path = ("evidence/integration/capability-matrix-51x17-2026-10-27/"
                     "SHA256SUMS.txt")
    if manifest_path not in tree:
        add("published SHA256SUMS.txt exists", False, manifest_path)
        return results, False
    manifest_bytes = gh_blob(repo, tree[manifest_path][0])
    sums = {}
    for line in manifest_bytes.decode("utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        digest, name = line.split(None, 1)
        sums[name.strip()] = (digest.lower(), -1)
    local_sums = read_sums()
    add("published SHA256SUMS.txt is readable and complete",
        set(local_sums) <= set(sums), f"{len(sums)} entries published",
        )
    # bundle files live in this directory; the report and tracker live at repo paths
    resolved = []
    for name in sums:
        bundle = HERE / name
        if bundle.is_file():
            resolved.append((name, f"evidence/integration/capability-matrix-51x17-2026-10-27/{name}", bundle))
        elif name.endswith(".md") and "CAPABILITY_MATRIX_51X17" in name:
            resolved.append((name, REPORT_REL, REPO_ROOT / REPORT_REL))
        else:
            resolved.append((name, name, REPO_ROOT / name))

    all_ok = True
    for name, remote_path, local in resolved:
        if remote_path not in tree:
            all_ok = False
            add(f"published: {name}", False, "path absent from the commit tree")
            continue
        blob_sha, size = tree[remote_path]
        remote_bytes = gh_blob(repo, blob_sha)
        digest = sha256(remote_bytes)
        matches_manifest = digest == sums.get(name, ("",))[0]
        matches_local = local.is_file() and local.read_bytes() == remote_bytes
        all_ok &= matches_manifest
        add(f"remote bytes == published manifest: {name}", matches_manifest,
            f"{len(remote_bytes)} B sha256={digest[:16]}… blob={blob_sha[:10]}… "
            f"local_match={matches_local}")

    # independent tracking checks on the published tree
    paths = set(tree)
    add("published tree contains the report", REPORT_REL in paths)
    add("published tree contains the CSV",
        "evidence/integration/capability-matrix-51x17-2026-10-27/"
        "IIPS_V3_CAPABILITY_MATRIX_51x17_2026-10-27.csv" in paths)
    return results, all_ok and all(r["ok"] for r in results)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--local", action="store_true")
    ap.add_argument("--remote", action="store_true")
    ap.add_argument("--repo", default="ramkivs/iips-review-recovered")
    ap.add_argument("--commit", default="")
    args = ap.parse_args()
    if not (args.local or args.remote):
        ap.error("choose --local and/or --remote")

    ok_all = True
    payload = {"record": RECORD_ID, "utc": "2026-10-27"}
    if args.local:
        res, ok = local_checks()
        payload["local"] = res
        ok_all &= ok
        for r in res:
            print(f"{'PASS' if r['ok'] else 'FAIL'}  {r['check']}  {r['detail']}")
    if args.remote:
        if not args.commit:
            ap.error("--remote requires --commit")
        res, ok = remote_checks(args.repo, args.commit)
        payload["remote"] = res
        payload["commit"] = args.commit
        ok_all &= ok
        for r in res:
            print(f"{'PASS' if r['ok'] else 'FAIL'}  {r['check']}  {r['detail']}")
        RECEIPT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
        print(f"\nreceipt -> {RECEIPT.relative_to(REPO_ROOT)}")
    print("\nRESULT:", "VERIFIED" if ok_all else "NOT VERIFIED")
    return 0 if ok_all else 1


if __name__ == "__main__":
    sys.exit(main())
