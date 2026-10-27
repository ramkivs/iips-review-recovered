#!/usr/bin/env python3
"""Read-only verification of the CAP-03 procedure publication receipt.

Requires GitHub CLI authentication and Python 3. It verifies the immutable
PR #329 merge snapshot, decoded GitHub blob bytes, the previously published
bundle's own checksum file, PR/CI receipts, the unchanged instrument identity,
and that the publication merge remains in current IRR main history.
"""
from __future__ import annotations

import base64
import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any

REPOSITORY = "ramkivs/iips-review-recovered"
EXPECTED_PR = 329
EXPECTED_MERGE = "56098372f74a41f5f8e8dde851c9ee419a1875ee"
EXPECTED_TREE = "0a32f9383621188aa22fabd900650ce8e40eb8c5"
EXPECTED_HEAD_CI = 40481209745
EXPECTED_POST_MERGE_CI = 40481448142
EXPECTED_PROCEDURE_PATH = (
    "docs/integration/"
    "IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md"
)
EXPECTED_PROCEDURE_SHA256 = (
    "db6ba4633e11987ce57ff0264e61dca391620bb487b45d663d7274d8ad55e544"
)
EXPECTED_INSTRUMENT_PATH = (
    "evidence/integration/"
    "cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/"
    "02-p1c-p1d-readonly-preflight.ps1"
)
EXPECTED_INSTRUMENT_BLOB = "eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb"
EXPECTED_INSTRUMENT_SHA256 = (
    "85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b"
)


def api(endpoint: str) -> dict[str, Any]:
    result = subprocess.run(
        ["gh", "api", f"repos/{REPOSITORY}/{endpoint}"],
        check=True,
        text=True,
        capture_output=True,
    )
    return json.loads(result.stdout)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"FAIL: {message}")


def main() -> None:
    receipt_path = Path(__file__).resolve().with_name("00-publication-readback.json")
    receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
    require(receipt.get("independently_verified") is True, "receipt not marked verified")
    require(receipt.get("repository") == REPOSITORY, "wrong repository")
    require(receipt.get("ref") == "refs/heads/main", "wrong publication ref")
    require(receipt.get("commit") == EXPECTED_MERGE, "wrong merge commit")
    require(receipt.get("tree") == EXPECTED_TREE, "wrong merge tree")

    commit = api(f"git/commits/{EXPECTED_MERGE}")
    require(commit["sha"] == EXPECTED_MERGE, "remote merge commit unavailable")
    require(commit["tree"]["sha"] == EXPECTED_TREE, "remote merge tree mismatch")

    compare = api(f"compare/{EXPECTED_MERGE}...main")
    require(compare.get("behind_by") == 0, "publication merge is not an ancestor of current main")

    pr = api(f"pulls/{EXPECTED_PR}")
    require(pr.get("state") == "closed" and pr.get("merged_at"), "PR is not merged")
    require(pr.get("merge_commit_sha") == EXPECTED_MERGE, "PR merge SHA mismatch")
    pr_receipt = receipt["pull_request"]
    require(pr_receipt["number"] == EXPECTED_PR, "receipt PR number mismatch")
    require(pr_receipt["head_commit"] == pr["head"]["sha"], "PR head mismatch")
    require(pr_receipt["merge_commit"] == EXPECTED_MERGE, "receipt merge mismatch")

    head_run = api(f"actions/runs/{EXPECTED_HEAD_CI}")
    require(head_run.get("conclusion") == "success", "exact-head CI did not succeed")
    require(head_run.get("head_sha") == pr["head"]["sha"], "exact-head CI SHA mismatch")
    require(head_run.get("event") == "pull_request", "exact-head CI event mismatch")
    post_run = api(f"actions/runs/{EXPECTED_POST_MERGE_CI}")
    require(post_run.get("conclusion") == "success", "post-merge CI did not succeed")
    require(post_run.get("head_sha") == EXPECTED_MERGE, "post-merge CI SHA mismatch")
    require(post_run.get("event") == "push", "post-merge CI event mismatch")
    require(receipt["ci"]["run_id"] == EXPECTED_HEAD_CI, "receipt exact-head CI ID mismatch")
    require(receipt["post_merge_ci"]["run_id"] == EXPECTED_POST_MERGE_CI, "receipt post-merge CI ID mismatch")

    tree = api(f"git/trees/{EXPECTED_TREE}?recursive=1")
    require(not tree.get("truncated"), "remote recursive tree is truncated")
    entries = {item["path"]: item for item in tree["tree"]}
    recorded = receipt.get("remote_blob_readbacks", [])
    require(len(recorded) == 9, "expected nine recorded remote blobs")
    actual_bytes: dict[str, bytes] = {}
    for item in recorded:
        path = item["path"]
        entry = entries.get(path)
        require(entry is not None and entry.get("type") == "blob", f"missing blob: {path}")
        require(entry["sha"] == item["git_blob"], f"Git blob mismatch: {path}")
        blob = api(f"git/blobs/{entry['sha']}")
        raw = base64.b64decode("".join(blob["content"].split()), validate=True)
        digest = hashlib.sha256(raw).hexdigest()
        require(len(raw) == item["bytes"], f"byte-length mismatch: {path}")
        require(digest == item["sha256"], f"SHA-256 mismatch: {path}")
        require(item.get("remote_matches_local") is True, f"initial local/remote match absent: {path}")
        actual_bytes[path] = raw

    procedure = next(item for item in recorded if item["path"] == EXPECTED_PROCEDURE_PATH)
    require(procedure["sha256"] == EXPECTED_PROCEDURE_SHA256, "procedure SHA-256 mismatch")
    require(procedure["bytes"] == 44262, "procedure byte length mismatch")
    instrument = next(item for item in recorded if item["path"] == EXPECTED_INSTRUMENT_PATH)
    require(instrument["git_blob"] == EXPECTED_INSTRUMENT_BLOB, "published instrument blob changed")
    require(instrument["sha256"] == EXPECTED_INSTRUMENT_SHA256, "published instrument SHA-256 changed")
    require(instrument["bytes"] == 10231, "published instrument byte length changed")

    bundle_prefix = (
        "evidence/integration/"
        "cap03-p1c-p1d-fresh-capture-procedure-2026-10-27/"
    )
    checksum_path = bundle_prefix + "SHA256SUMS.txt"
    checksum_text = actual_bytes[checksum_path].decode("ascii")
    checksum_rows = [line.split("  ", 1) for line in checksum_text.splitlines() if line]
    require(len(checksum_rows) == 5, "unexpected primary-bundle checksum entry count")
    for expected_digest, filename in checksum_rows:
        path = bundle_prefix + filename
        require(path in actual_bytes, f"checksum names unrecorded primary file: {filename}")
        require(hashlib.sha256(actual_bytes[path]).hexdigest() == expected_digest,
                f"primary-bundle checksum mismatch: {filename}")

    print(
        "PASS: PR #329 merge/tree, exact-head and post-merge CI, current-main ancestry, "
        "9 decoded remote blobs, procedure SHA-256, unchanged instrument identity, "
        "and all five primary-bundle checksums verified."
    )


if __name__ == "__main__":
    main()
