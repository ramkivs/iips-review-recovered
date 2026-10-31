#!/usr/bin/env python3
"""Read-only audit of the published CAP-03 S2 recovery release assets.

Downloads the four pinned assets directly from the public IRR GitHub release into
memory, verifies GitHub's advertised per-asset digests against locally computed
SHA-256, reconciles the original inventory's parsed path/hash map with the
admitted S2 inventory map, and hashes every ZIP file entry. It never extracts
files or accesses a Windows host/IPD/production system.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
import re
import sys
import urllib.error
import urllib.request
import zipfile
REPO = "ramkivs/iips-review-recovered"
TAG = "cap03-s2-recovery-20261031-212225"
RUN_ID = "20261031-212225-35931ce8"
EXPECTED_ARCHIVE_SHA256 = "57656309d721a0c6f6a072f14f6a9067a2cc788737efa92f34aa0997fb5d2d48"
EXPECTED_COUNT = 1140
SOURCE_PREFIX = "C:/iips-work/iips-production-market-data/dist/"
ORIGINAL_INVENTORY_PATH = "C:/iips-evidence/cap03-s2/s2-03-dist-sha256-before.txt"
ASSETS = {
    "CAP03-S2-Original-1140-Artifacts.zip": {
        "id": 695808804,
        "size": 10_328_940,
        "sha256": EXPECTED_ARCHIVE_SHA256,
    },
    "original-s2-sha256-inventory.txt": {
        "id": 695808801,
        "size": 176_456,
        "sha256": "e077a349d3777403d426a0b0f338c53ac6f0e3942f75a9174a6a9b6e42854cbb",
    },
    "recovery-evidence.json": {
        "id": 695808803,
        "size": 800,
        "sha256": "412ed94f4c1d501f9fe7106631b8d2b51665f5732edffb29757693b9473c1522",
    },
    "recovery-run-20261031-212225-35931ce8.txt": {
        "id": 695808800,
        "size": 1_630,
        "sha256": "1073c035045932a2706dfc51f10833e63b5cf62af943b80cb1fffaa20a648da6",
    },
}
ADMITTED_INVENTORY = (
    "evidence/cap03-s2/s2-a891802e-20261028T192516Z/"
    "s2-04c-dist-sha256-before.txt"
)
ORIGINAL_AUTHORITY_SEAL = (
    "evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/"
    "SHA256SUMS.txt"
)


def fail(message: str) -> "NoReturn":
    raise RuntimeError(message)


def request_bytes(url: str, *, token: str | None = None, limit: int) -> bytes:
    headers = {"User-Agent": "CAP03-S2-release-audit/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if url.startswith("https://api.github.com/"):
        headers["Accept"] = "application/vnd.github+json"
        headers["X-GitHub-Api-Version"] = "2022-11-28"
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            chunks: list[bytes] = []
            total = 0
            while True:
                chunk = response.read(min(1024 * 1024, limit + 1 - total))
                if not chunk:
                    break
                chunks.append(chunk)
                total += len(chunk)
                if total > limit:
                    fail(f"download exceeded size limit: {url}")
            return b"".join(chunks)
    except (urllib.error.URLError, TimeoutError) as exc:
        fail(f"download failed for {url}: {exc}")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def normalize_windows_display_path(path: str) -> str:
    normalized = path.strip().replace("\\", "/")
    normalized = re.sub(r"/+(?=[^/])", "/", normalized)
    return normalized.rstrip("/").casefold()


def canonical_relative(
    path: str, *, allow_relative: bool = False, strip_dist_prefix: bool = True,
) -> str:
    path = path.replace("\\", "/")
    path = re.sub(r"/+$", "", path)
    if path[: len(SOURCE_PREFIX)].casefold() == SOURCE_PREFIX.casefold():
        path = path[len(SOURCE_PREFIX) :]
    elif path.lower().startswith("/dist/"):
        path = path[len("/dist/") :]
    elif path.startswith("dist/") and strip_dist_prefix:
        path = path[len("dist/") :]
    elif not allow_relative or path.startswith("/") or re.match(r"^[A-Za-z]:", path):
        fail(f"path is outside expected dist root: {path!r}")
    if not path or path.startswith("/") or "//" in path or ":" in path or "\x00" in path:
        fail(f"unsafe or empty relative path: {path!r}")
    parts = path.split("/")
    if any(part in ("", ".", "..") for part in parts):
        fail(f"unsafe relative path segment: {path!r}")
    return path


def parse_inventory(data: bytes, label: str) -> dict[str, str]:
    try:
        text = data.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        fail(f"{label} is not UTF-8: {exc}")
    result: dict[str, str] = {}
    casefolded: dict[str, str] = {}
    rows = text.splitlines()
    if len(rows) != EXPECTED_COUNT:
        fail(f"{label}: expected {EXPECTED_COUNT} rows, got {len(rows)}")
    for line_number, row in enumerate(rows, 1):
        match = re.fullmatch(r"\s*([0-9A-Fa-f]{64})[ \t]+(.+?)\s*", row)
        if not match:
            fail(f"{label}: malformed row {line_number}")
        digest, full_path = match.groups()
        # The original inventory is a Windows absolute path; the admitted S2
        # inventory uses a \dist\-relative prefix. Normalize only separators.
        relative = canonical_relative(full_path)
        if relative in result:
            fail(f"{label}: duplicate path at row {line_number}: {relative}")
        folded = relative.casefold()
        if folded in casefolded:
            fail(f"{label}: Windows case-colliding paths {casefolded[folded]!r} and {relative!r}")
        result[relative] = digest.lower()
        casefolded[folded] = relative
    return result


def verify_original_inventory_seal() -> None:
    raw = open(ORIGINAL_AUTHORITY_SEAL, "rb").read().decode("utf-8-sig")
    found = None
    for line in raw.splitlines():
        match = re.fullmatch(r"([0-9A-Fa-f]{64})  s2-03-dist-sha256-before\.txt", line)
        if match:
            found = match.group(1).lower()
            break
    expected = ASSETS["original-s2-sha256-inventory.txt"]["sha256"]
    if found != expected:
        fail(f"original inventory authority seal mismatch: {found!r} != {expected}")


def verify_evidence_json(data: bytes) -> None:
    try:
        evidence = json.loads(data.decode("utf-8-sig"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        fail(f"recovery-evidence.json invalid: {exc}")
    exact = {
        "RecoveryRun": RUN_ID,
        "SourceDirectory": r"C:\iips-work\iips-production-market-data\dist",
        "OriginalInventory": r"C:\iips-evidence\cap03-s2\s2-03-dist-sha256-before.txt",
        "OriginalInventoryEntries": EXPECTED_COUNT,
        "SourceFilesVerified": EXPECTED_COUNT,
        "ArchiveEntries": EXPECTED_COUNT,
        "ArchiveEntriesHashVerified": EXPECTED_COUNT,
        "Missing": 0,
        "Mismatched": 0,
        "ArchiveSHA256": EXPECTED_ARCHIVE_SHA256.upper(),
        "Result": "PASS",
        "Scope": "Historical artifact recovery only; not S2 certification or P-1 authorization",
    }
    for key, expected in exact.items():
        actual = evidence.get(key)
        if isinstance(expected, str) and isinstance(actual, str):
            if key in ("SourceDirectory", "OriginalInventory"):
                equal = normalize_windows_display_path(actual) == normalize_windows_display_path(expected)
            else:
                equal = actual.casefold() == expected.casefold()
        else:
            equal = actual == expected
        if not equal:
            fail(f"recovery-evidence.json {key} mismatch: {actual!r} != {expected!r}")
    archive_path = evidence.get("Archive")
    if not isinstance(archive_path, str) or archive_path.replace("/", "\\").split("\\")[-1] != "CAP03-S2-Original-1140-Artifacts.zip":
        fail(f"recovery-evidence.json archive name mismatch: {archive_path!r}")


def verify_transcript(data: bytes) -> None:
    try:
        text = data.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        fail(f"recovery transcript is not UTF-8: {exc}")
    required = (
        "Windows PowerShell transcript start",
        "PSVersion: 5.1.",
        "CAP-03 S2 ORIGINAL ARTIFACT RECOVERY",
        "RECOVERY RESULT: PASS",
        f"Source files verified: {EXPECTED_COUNT:,}",
        f"Archive entries verified: {EXPECTED_COUNT:,}",
        EXPECTED_ARCHIVE_SHA256.upper(),
        RUN_ID,
    )
    for value in required:
        if value.casefold() not in text.casefold():
            fail(f"recovery transcript is missing expected text: {value!r}")
    source_lines = [line for line in text.splitlines() if line.lstrip("\\ ").startswith("Source:")]
    inventory_lines = [line for line in text.splitlines() if line.lstrip("\\ ").startswith("Inventory:")]
    source_value = source_lines[0].split(":", 1)[1].strip() if len(source_lines) == 1 else ""
    inventory_value = inventory_lines[0].split(":", 1)[1].strip() if len(inventory_lines) == 1 else ""
    if normalize_windows_display_path(source_value) != normalize_windows_display_path(SOURCE_PREFIX.rstrip("/")):
        fail("recovery transcript source path is missing or malformed")
    if normalize_windows_display_path(inventory_value) != normalize_windows_display_path(ORIGINAL_INVENTORY_PATH):
        fail("recovery transcript original inventory path is missing")


def verify_archive(data: bytes, original_map: dict[str, str]) -> None:
    try:
        archive = zipfile.ZipFile(io.BytesIO(data), "r")
    except (zipfile.BadZipFile, OSError) as exc:
        fail(f"archive cannot be opened: {exc}")
    with archive:
        infos = archive.infolist()
        file_infos = [info for info in infos if not info.is_dir()]
        if len(file_infos) != EXPECTED_COUNT:
            fail(f"archive file-entry count mismatch: {len(file_infos)}")
        if len(infos) != EXPECTED_COUNT:
            fail(f"archive total-entry count mismatch: {len(infos)} (directory entries are not permitted)")
        names: list[str] = []
        for info in file_infos:
            if "\\" in info.filename:
                fail(f"ZIP entry uses non-canonical backslash separator: {info.filename!r}")
            name = canonical_relative(info.filename, allow_relative=True, strip_dist_prefix=False)
            names.append(name)
        # The recovery procedure may store entries relative to dist or under a
        # single top-level dist/ prefix; permit only one uniform representation.
        has_dist_prefix = [name.startswith("dist/") for name in names]
        if any(has_dist_prefix) and not all(has_dist_prefix):
            fail("archive mixes dist/-prefixed and dist-relative entries")
        if all(has_dist_prefix):
            names = [name[len("dist/") :] for name in names]
        if len(set(names)) != EXPECTED_COUNT:
            fail("archive contains duplicate relative paths")
        if set(names) != set(original_map):
            missing = sorted(set(original_map) - set(names))[:5]
            extra = sorted(set(names) - set(original_map))[:5]
            fail(f"archive path set differs from original inventory; missing={missing}, extra={extra}")
        hashes: dict[str, str] = {}
        total_uncompressed = 0
        by_name = dict(zip(names, file_infos))
        for name in sorted(original_map):
            info = by_name[name]
            total_uncompressed += info.file_size
            if total_uncompressed > 1_000_000_000:
                fail("archive uncompressed size exceeds 1 GB safety limit")
            digest = hashlib.sha256()
            try:
                with archive.open(info, "r") as member:
                    while True:
                        block = member.read(1024 * 1024)
                        if not block:
                            break
                        digest.update(block)
            except (OSError, RuntimeError, zipfile.BadZipFile) as exc:
                fail(f"archive entry read failed for {name}: {exc}")
            actual = digest.hexdigest()
            if actual != original_map[name]:
                fail(f"archive SHA-256 mismatch for {name}: {actual} != {original_map[name]}")
            hashes[name] = actual
        bad_entry = archive.testzip()
        if bad_entry is not None:
            fail(f"ZIP CRC check failed for entry {bad_entry}")
        if len(hashes) != EXPECTED_COUNT:
            fail(f"verified {len(hashes)} entries, expected {EXPECTED_COUNT}")


def main() -> int:
    token = os.environ.get("GITHUB_TOKEN", "")
    api_url = f"https://api.github.com/repos/{REPO}/releases/tags/{TAG}"
    release_data = json.loads(request_bytes(api_url, token=token, limit=2_000_000).decode("utf-8"))
    if release_data.get("tag_name") != TAG or release_data.get("draft"):
        fail("release tag/name mismatch or release is still draft")
    assets_by_name = {asset.get("name"): asset for asset in release_data.get("assets", [])}
    if set(assets_by_name) != set(ASSETS):
        fail(f"release asset set mismatch: {sorted(assets_by_name)}")
    downloaded: dict[str, bytes] = {}
    for name, expected in ASSETS.items():
        asset = assets_by_name[name]
        if asset.get("id") != expected["id"] or asset.get("size") != expected["size"]:
            fail(f"release metadata identity/size mismatch for {name}")
        api_digest = asset.get("digest")
        if api_digest != f"sha256:{expected['sha256']}":
            fail(f"release API digest mismatch for {name}: {api_digest!r}")
        content = request_bytes(asset["browser_download_url"], limit=expected["size"] + 1)
        actual_digest = sha256(content)
        if len(content) != expected["size"] or actual_digest != expected["sha256"]:
            fail(f"downloaded asset digest/size mismatch for {name}: {len(content)} bytes, {actual_digest}")
        downloaded[name] = content
        print(f"PASS asset downloaded and SHA-256 matched: {name} bytes={len(content)} sha256={actual_digest}")

    verify_original_inventory_seal()
    original_map = parse_inventory(downloaded["original-s2-sha256-inventory.txt"], "release original inventory")
    admitted_bytes = open(ADMITTED_INVENTORY, "rb").read()
    admitted_map = parse_inventory(admitted_bytes, "admitted S2 inventory")
    if original_map != admitted_map:
        missing = sorted(set(admitted_map) - set(original_map))[:5]
        extra = sorted(set(original_map) - set(admitted_map))[:5]
        changed = sorted(key for key in (set(original_map) & set(admitted_map)) if original_map[key] != admitted_map[key])[:5]
        fail(f"original/admitted inventory map mismatch: missing={missing}, extra={extra}, changed={changed}")
    print(f"PASS original inventory: {len(original_map)} rows; original/admitted path-hash maps are equal; raw inventory SHA-256 is independently verified")

    verify_evidence_json(downloaded["recovery-evidence.json"])
    verify_transcript(downloaded["recovery-run-20261031-212225-35931ce8.txt"])
    print("PASS recovery evidence JSON and Windows transcript are internally consistent with release identity, counts, source and archive digest")

    verify_archive(downloaded["CAP03-S2-Original-1140-Artifacts.zip"], original_map)
    print(f"PASS archive: exactly {EXPECTED_COUNT} file entries; every ZIP payload SHA-256 matches the original inventory")
    print("LIMIT: verifies recovered historical bytes only; does not certify S2, authorize P-1, or satisfy the separate S04 sealed-directory evidence contract")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # CI should emit one concise failure with nonzero status.
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
