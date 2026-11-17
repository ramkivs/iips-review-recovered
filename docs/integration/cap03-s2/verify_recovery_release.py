#!/usr/bin/env python3
"""Read-only audit of the published CAP-03 S2 recovery release assets.

Downloads the four pinned assets of the IRR GitHub release into memory through
the GitHub REST API, verifies GitHub's advertised per-asset digests against
locally computed SHA-256, reconciles the original inventory's parsed path/hash
map with the admitted S2 inventory map, and hashes every ZIP file entry. It never
extracts files or accesses a Windows host/IPD/production system.

The repository is private, so the REST API must authenticate the caller. The
token is read from GITHUB_TOKEN; read access to repository contents is enough.
It is sent to the REST API only, in a header that urllib does not copy to a
redirected request, so the storage address that an asset download is redirected
to never receives it. It is never printed, logged or written to a file.
"""
from __future__ import annotations

import hashlib
import http.client
from collections import Counter
import io
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import zipfile
API_ROOT = "https://api.github.com"
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


def describe_http_error(exc: urllib.error.HTTPError, url: str, token_supplied: bool) -> str:
    """Diagnosis of a refused request, built from the status, the answering host and GitHub's own message.

    The address that answered is never included: after a redirect it is a signed, time-limited
    download address. A storage host's error body is not included either.
    """
    text = f"HTTP Error {exc.code}: {http.client.responses.get(exc.code, 'unknown status')}"
    try:
        requested = urllib.parse.urlsplit(url)
        answered = urllib.parse.urlsplit(exc.geturl() or url)
        redirected = (answered.hostname, answered.port) != (requested.hostname, requested.port)
        host = answered.hostname if answered.port is None else f"{answered.hostname}:{answered.port}"
    except ValueError:
        return f"{text} from an address that could not be parsed, after a redirect"
    if redirected:
        return f"{text} from {host} after the redirect"
    if not url.startswith(API_ROOT + "/"):
        return text
    details = []
    try:
        message = json.loads(exc.read(4096).decode("utf-8")).get("message")
    except Exception:  # The body is only a hint; an unreadable body must not hide the status.
        message = None
    if isinstance(message, str) and message:
        details.append(f"GitHub says {message[:200]!r}")
    accepted = exc.headers.get("X-Accepted-GitHub-Permissions") if exc.headers else None
    if accepted:
        details.append(f"permission the API accepts for this request: {accepted[:200]}")
    details.append("a token was supplied" if token_supplied else "no token was supplied (GITHUB_TOKEN is not set)")
    return f"{text} ({'; '.join(details)})"


def request_bytes(
    url: str, *, token: str | None = None, accept: str = "application/vnd.github+json", limit: int,
) -> bytes:
    token_supplied = bool(token)
    request = urllib.request.Request(url, headers={"User-Agent": "CAP03-S2-release-audit/1.0"})
    if url.startswith(API_ROOT + "/"):
        # API-only headers, added as unredirected headers: urllib sends them with this request and
        # does not copy them to the request it makes when the API answers with a redirect.
        request.add_unredirected_header("Accept", accept)
        request.add_unredirected_header("X-GitHub-Api-Version", "2022-11-28")
        if token_supplied:
            request.add_unredirected_header("Authorization", f"Bearer {token}")
    elif token_supplied:
        fail("refusing to send the GitHub token to an address outside the GitHub REST API")
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
    except urllib.error.HTTPError as exc:
        fail(f"download failed for {url}: {describe_http_error(exc, url, token_supplied)}")
    except (urllib.error.URLError, TimeoutError) as exc:
        fail(f"download failed for {url}: {exc}")
    except (http.client.HTTPException, OSError, ValueError) as exc:
        # Only the kind of error: the text of these can quote a header value or a redirect address.
        fail(f"download failed for {url}: {type(exc).__name__}")


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


def verify_archive(data: bytes, original_map: dict[str, str]) -> dict[str, object]:
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
        extension_counts: Counter[str] = Counter()
        document_suffixes = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"}
        document_like_names: list[str] = []
        issuer_marker_hits: dict[str, list[str]] = {"INE415A01038": [], "AGI Greenpac": []}
        for name in names:
            leaf = name.rsplit("/", 1)[-1]
            suffix = "." + leaf.rsplit(".", 1)[-1].lower() if "." in leaf else "[no extension]"
            extension_counts[suffix] += 1
            if suffix in document_suffixes or re.search(r"AGI|INE415A01038|annual[ _-]?report|financial[ _-]?results", leaf, re.I):
                document_like_names.append(name)
        for name in sorted(original_map):
            info = by_name[name]
            total_uncompressed += info.file_size
            if total_uncompressed > 1_000_000_000:
                fail("archive uncompressed size exceeds 1 GB safety limit")
            digest = hashlib.sha256()
            prefix = bytearray()
            tail = b""
            try:
                with archive.open(info, "r") as member:
                    while True:
                        block = member.read(1024 * 1024)
                        if not block:
                            break
                        digest.update(block)
                        if len(prefix) < 16:
                            prefix.extend(block[: 16 - len(prefix)])
                        sample = (tail + block).lower()
                        if b"ine415a01038" in sample and name not in issuer_marker_hits["INE415A01038"]:
                            issuer_marker_hits["INE415A01038"].append(name)
                        if b"agi greenpac" in sample and name not in issuer_marker_hits["AGI Greenpac"]:
                            issuer_marker_hits["AGI Greenpac"].append(name)
                        tail = sample[-32:]
                if bytes(prefix).startswith(b"%PDF-") and name not in document_like_names:
                    document_like_names.append(name)
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
        return {
            "file_count": len(file_infos),
            "extension_counts": dict(sorted(extension_counts.items())),
            "document_like_paths": sorted(document_like_names),
            "issuer_marker_hits": {key: sorted(value) for key, value in issuer_marker_hits.items()},
            "uncompressed_bytes": total_uncompressed,
        }


def download_release_assets(token: str) -> dict[str, bytes]:
    """Return the four pinned assets, each checked against its pinned identity, size and SHA-256."""
    api_url = f"{API_ROOT}/repos/{REPO}/releases/tags/{TAG}"
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
        # The asset is requested by its pinned id through the REST API, which authenticates the
        # caller and redirects to a short-lived storage address. The browser_download_url of a
        # private repository refuses a request without a browser session.
        asset_url = f"{API_ROOT}/repos/{REPO}/releases/assets/{expected['id']}"
        content = request_bytes(
            asset_url, token=token, accept="application/octet-stream", limit=expected["size"] + 1,
        )
        actual_digest = sha256(content)
        if len(content) != expected["size"] or actual_digest != expected["sha256"]:
            fail(f"downloaded asset digest/size mismatch for {name}: {len(content)} bytes, {actual_digest}")
        downloaded[name] = content
        print(f"PASS asset downloaded and SHA-256 matched: {name} bytes={len(content)} sha256={actual_digest}")
    return downloaded


def main() -> int:
    token = os.environ.get("GITHUB_TOKEN", "")
    token_supplied = bool(token)
    downloaded = download_release_assets(token)

    verify_original_inventory_seal()
    original_map = parse_inventory(downloaded["original-s2-sha256-inventory.txt"], "release original inventory")
    issuer_filename_hits = sorted(
        path for path in original_map
        if re.search(r"INE415A01038|AGI[ _-]?Greenpac|annual[ _-]?report|financial[ _-]?results", path, re.I)
    )
    print(
        f"PASS asset content: original-s2-sha256-inventory.txt has {len(original_map)} parsed rows; "
        f"AGI/financial-filing filename heuristic hits={len(issuer_filename_hits)}"
    )
    if issuer_filename_hits:
        print(f"INFO inventory filename candidates (review only): {issuer_filename_hits[:20]}")
    admitted_bytes = open(ADMITTED_INVENTORY, "rb").read()
    admitted_map = parse_inventory(admitted_bytes, "admitted S2 inventory")
    missing_from_original = sorted(set(admitted_map) - set(original_map))
    extra_in_original = sorted(set(original_map) - set(admitted_map))
    changed_hashes = sorted(
        key for key in (set(original_map) & set(admitted_map))
        if original_map[key] != admitted_map[key]
    )
    print(
        "INFO historical admitted-S2 comparison (not used as recovery authority): "
        f"path_set_equal={not missing_from_original and not extra_in_original}; "
        f"original_only={len(extra_in_original)}; admitted_only={len(missing_from_original)}; "
        f"different_hashes={len(changed_hashes)}; examples={changed_hashes[:5]}"
    )
    print(
        f"PASS original inventory: {len(original_map)} rows; raw inventory SHA-256 matches "
        "the historical authority seal; original inventory remains the ZIP hash authority"
    )

    verify_evidence_json(downloaded["recovery-evidence.json"])
    print(
        "PASS asset content: recovery-evidence.json parsed; required recovery identity, "
        "counts, archive digest and scope fields validated"
    )
    transcript = downloaded["recovery-run-20261031-212225-35931ce8.txt"]
    verify_transcript(transcript)
    print(
        "PASS asset content: recovery-run-20261031-212225-35931ce8.txt decoded and checked for "
        "the transcript marker, PowerShell version, recovery run ID, source/inventory paths, counts and ZIP digest"
    )

    archive_summary = verify_archive(downloaded["CAP03-S2-Original-1140-Artifacts.zip"], original_map)
    print(
        f"PASS asset content: CAP03-S2-Original-1140-Artifacts.zip has {archive_summary['file_count']} "
        "members; all member hashes and CRCs match the original inventory; "
        f"extension_counts={archive_summary['extension_counts']}"
    )
    print(
        "INFO archive content triage (filename/signature/exact-text heuristics, not a legal rights opinion): "
        f"document_like_members={len(archive_summary['document_like_paths'])}; "
        f"AGI_ISIN_hits={len(archive_summary['issuer_marker_hits']['INE415A01038'])}; "
        f"AGI_name_hits={len(archive_summary['issuer_marker_hits']['AGI Greenpac'])}"
    )
    if archive_summary["document_like_paths"]:
        print(f"INFO document-like archive member paths (review only): {archive_summary['document_like_paths'][:20]}")
    if any(archive_summary["issuer_marker_hits"].values()):
        print(f"INFO exact AGI marker paths (review only): {archive_summary['issuer_marker_hits']}")
    print("LIMIT: verifies recovered historical bytes only; does not certify S2, authorize P-1, or satisfy the separate S04 sealed-directory evidence contract")
    # A check-run annotation, readable through the GitHub Checks API like the failure annotation below.
    route = "with the supplied token" if token_supplied else "without a token"
    marker_paths = {key: value for key, value in archive_summary["issuer_marker_hits"].items() if value}
    print(
        f"::notice title=CAP-03 release audit::PASS: {len(downloaded)} release assets downloaded through the "
        f"GitHub REST API {route}; all four asset contents individually validated; {EXPECTED_COUNT} ZIP payload "
        f"hashes match the original inventory; doc-like members={len(archive_summary['document_like_paths'])}; "
        f"AGI ISIN/name exact-text hits="
        f"{len(archive_summary['issuer_marker_hits']['INE415A01038'])}/"
        f"{len(archive_summary['issuer_marker_hits']['AGI Greenpac'])}; "
        f"candidate_paths={json.dumps({'documentLike': archive_summary['document_like_paths'][:20], 'AGI': marker_paths}, separators=(',', ':'))}"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # CI should emit a visible check annotation and concise failure.
        message = f"CAP-03 recovery release audit failed: {exc}"
        print(f"FAIL: {message}", file=sys.stderr)
        # Check-run annotations are also available through the GitHub Checks API,
        # unlike hosted-runner log archives which may not be reachable from IRR-only sandboxes.
        escaped = message.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
        print(f"::error title=CAP-03 release audit::{escaped}", file=sys.stderr)
        summary = os.environ.get("GITHUB_STEP_SUMMARY")
        if summary:
            with open(summary, "a", encoding="utf-8") as handle:
                handle.write(f"## CAP-03 recovery release audit failure\n\n`{message}`\n")
        raise SystemExit(1)
