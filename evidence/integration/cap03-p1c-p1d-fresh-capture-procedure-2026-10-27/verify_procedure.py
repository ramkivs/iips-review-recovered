#!/usr/bin/env python3
"""Offline static verification for the CAP-03 fresh-capture procedure bundle."""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BUNDLE = Path(__file__).resolve().parent
DOC = ROOT / "docs/integration/IIPS_v3.0_CAP03_P1C_P1D_FRESH_CAPTURE_PROCEDURE_2026-10-27.md"
TRACKER = ROOT / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md"
INSTRUMENT = ROOT / "evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1"
ATTRIBUTES = ROOT / ".gitattributes"
RECORD_ID = "IIPS-V3-CAP03-P1C-P1D-FRESH-CAPTURE-PROCEDURE-2026-10-27-01"
EXPECTED = {
    "ipd_commit": "001c3c80618f2ee1d40e9a90912237e1a06e7b58",
    "ipd_tree": "399fa44a5f1953c0f61b452420fefb5985426ef1",
    "irr_commit": "ba64b2d5927c2f872560710cf1474c25a5cde0d5",
    "irr_tree": "5e4262f1cd75bf13b76ced5b45058f31434b5dad",
    "instrument_blob": "eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb",
    "instrument_sha256": "85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b",
}


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def read_json(name: str) -> dict:
    return json.loads((BUNDLE / name).read_text(encoding="utf-8"))


def verify_sums() -> None:
    path = BUNDLE / "SHA256SUMS.txt"
    if not path.exists():
        return  # The authoring-time verifier is run once before sums are generated.
    expected: dict[str, str] = {}
    for line in path.read_text(encoding="ascii").splitlines():
        if not line.strip():
            continue
        match = re.fullmatch(r"([0-9a-f]{64})  (.+)", line)
        check(match is not None, f"invalid checksum line: {line!r}")
        digest, name = match.groups()
        check(name not in expected, f"duplicate checksum entry: {name}")
        expected[name] = digest
    actual_names = {p.name for p in BUNDLE.iterdir() if p.is_file() and p.name != path.name}
    check(set(expected) == actual_names, "SHA256SUMS file list does not match bundle files")
    for name, digest in expected.items():
        check(sha256((BUNDLE / name).read_bytes()) == digest, f"SHA256 mismatch: {name}")


def simulate_parameter_copy(source: bytes) -> None:
    substitutions = [
        (
            b"$RunId        = 'cap03-p1-20261027-01'",
            b"$RunId        = 'cap03-p1-20261027T101112Z-0123456789abcdef0123456789abcdef'",
            "RunId",
        ),
        (
            b"$IpdRoot = '<ABSOLUTE PATH OF THE IPD CHECKOUT ON H:>'",
            b"$IpdRoot = 'C:\\iips-work\\iips-production-market-data-p1-001c3c80'",
            "IpdRoot",
        ),
        (
            b"$IrrRoot = '<ABSOLUTE PATH OF THE IRR CHECKOUT>'",
            b"$IrrRoot = 'C:\\iips-work\\irr-cap03-consumer-ba64b2d5'",
            "IrrRoot",
        ),
    ]
    derived = source
    for old, new, name in substitutions:
        check(derived.count(old) == 1, f"expected exactly one source assignment for {name}")
        derived = derived.replace(old, new, 1)

    # These are exact LF-preserving parameter-line substitutions; all other bytes must match.
    old_lines = source.splitlines(keepends=True)
    new_lines = derived.splitlines(keepends=True)
    check(len(old_lines) == len(new_lines), "parameter simulation changed line count")
    changed = [i + 1 for i, (a, b) in enumerate(zip(old_lines, new_lines)) if a != b]
    check(changed == [22, 27, 28], f"changed lines are not exactly the three permitted assignments: {changed}")
    store_line = b"$StorePath    = 'C:\\iips-data\\iips\\user-portfolio.sqlite'"
    original_store = next(line for line in old_lines if store_line in line)
    derived_store = next(line for line in new_lines if store_line in line)
    check(original_store == derived_store, "F4 StorePath line changed")
    check(b"<ABSOLUTE PATH OF" not in derived, "placeholder remains in derivative simulation")
    check(derived.count(b"--mode=execute") == source.count(b"--mode=execute"), "parameter simulation changed the published execute-mode text")
    check(len(derived) != len(source), "simulation did not exercise length-changing replacements")


def main() -> int:
    doc = DOC.read_text(encoding="utf-8")
    tracker = TRACKER.read_text(encoding="utf-8")
    instrument = INSTRUMENT.read_bytes()
    baseline = read_json("00-baseline-and-authority.json")
    stops = read_json("01-stop-reconciliation.json")
    static = read_json("02-static-validation.json")

    check(doc.count(RECORD_ID) >= 1, "procedure record ID missing")
    check(doc.count("## 1. Governing record reread and status boundary") == 1, "procedure body heading missing or duplicated")
    check(doc.count("## 6. Verification register") == 1, "verification register missing or duplicated")
    tracker_headings = re.findall(r"(?m)^## §16\.(\d+)\b", tracker)
    check("153" in tracker_headings, "tracker section §16.153 has not been registered")
    check(tracker_headings.count("153") == 1, "tracker section §16.153 heading is duplicated")
    check(tracker_headings.count("152") == 1, "prior tracker §16.152 heading changed or duplicated")
    check(RECORD_ID in tracker, "procedure record is not registered in the tracker")
    for token in ("CV-CORR-133", "CHG-2026-10-27-11", "V1037", "V1046"):
        check(token in tracker, f"tracker registration missing {token}")

    check(len(instrument) == 10231, "published instrument byte count changed")
    check(sha256(instrument) == EXPECTED["instrument_sha256"], "published instrument SHA-256 changed")
    check(git_blob_sha1(instrument) == EXPECTED["instrument_blob"], "published instrument Git blob changed")
    check(b"\r\n" not in instrument, "published instrument is no longer LF-only")
    attr_text = ATTRIBUTES.read_text(encoding="utf-8")
    attr_line = "evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1 text eol=lf"
    check(attr_line in attr_text.splitlines(), "exact LF .gitattributes rule missing")

    pins = baseline["ipd_p1_execution_basis"], baseline["irr_consumer_pin"]
    check(pins[0]["designated_commit"] == EXPECTED["ipd_commit"], "IPD designated commit mismatch")
    check(pins[0]["designated_tree"] == EXPECTED["ipd_tree"], "IPD designated tree mismatch")
    check(pins[1]["designated_commit"] == EXPECTED["irr_commit"], "IRR designated commit mismatch")
    check(pins[1]["designated_tree"] == EXPECTED["irr_tree"], "IRR designated tree mismatch")
    check(baseline["published_instrument"]["git_blob"] == EXPECTED["instrument_blob"], "baseline instrument blob mismatch")
    check(baseline["published_instrument"]["sha256"] == EXPECTED["instrument_sha256"], "baseline instrument SHA mismatch")
    check(baseline["ipd_p1_consumption_authority"]["successor_act_blob"] == "528de6aeddbc8e5f3191be8792f3937d77de4037", "IPD successor act blob mismatch")
    check(baseline["review_limits"]["operator_launcher_bytes_received"] is False, "launcher evidence limit changed")
    check(baseline["review_limits"]["operator_stop_transcripts_received"] is False, "STOP-output evidence limit changed")

    check(stops["raw_operator_launcher_received"] is False, "raw launcher receipt claim changed")
    check(stops["raw_stop_outputs_received"] is False, "raw STOP-output receipt claim changed")
    check(stops["observations"][0]["determination"].startswith("STOP CORRECT"), "baseline STOP determination missing")
    check(stops["observations"][2]["determination"].startswith("STOP CORRECT"), "IRR STOP determination missing")
    check(stops["status"]["p1d"] == "DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT", "P-1-D status changed")
    check(stops["status"]["p1"] == "NOT EXECUTED / UNSPENT / NOT AUTHORIZED", "P-1 status changed")
    check(static["validation_mode"].startswith("Static only"), "validation mode must remain static")

    for required in (
        "001c3c80618f2ee1d40e9a90912237e1a06e7b58",
        "399fa44a5f1953c0f61b452420fefb5985426ef1",
        "ba64b2d5927c2f872560710cf1474c25a5cde0d5",
        "5e4262f1cd75bf13b76ced5b45058f31434b5dad",
        "yyyyMMdd'T'HHmmss'Z'",
        "UNSPENT - NO P-1 EXECUTION RECEIPT",
        "& $ExecutingScript",
        "85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b",
        "0bd6d134405dbcab27f5639c3e22a856c778daa9fd414d2cb0e26e5b03919aa3",
        "7f04f86a9c23bd0c94def29d829bb0c54033bed941a8c77e35365c30bdbdba30",
        "5e9e3dd8fe705f0235baeab77894636e94cdfbc0df7dd5d42037100ae114a61b",
        "No P-1",
        "Start-Transcript -Path $SessionTranscript",
        "ExecutingScriptSha256 = (Get-FileHash -LiteralPath $ExecutingScript -Algorithm SHA256).Hash.ToLowerInvariant()",
        "executing_script_sha256=$ExecutingScriptSha256",
        "$scriptDigestPath = Join-Path $EvidenceRoot '99-script-digest.txt'",
        "Stop-Transcript",
    ):
        check(required in doc, f"procedure missing required instruction: {required}")

    # Command blocks may describe read-only inspection and capture only; no execution invocation.
    code_blocks = re.findall(r"```powershell\n(.*?)\n```", doc, flags=re.DOTALL)
    check(len(code_blocks) >= 5, "expected explicit PowerShell command blocks")
    combined_code = "\n".join(code_blocks)
    check(not re.search(r"(?im)^\s*(?:&\s+)?node\b[^\n]*--mode=execute", combined_code), "execution-mode command found in procedure")
    check(not re.search(r"(?im)^\s*(?:Set-Content|Out-File)\b[^\n]*(?:02-executed-instrument|StorePath)", combined_code), "text-writing command targets instrument/store path")
    check("New-Item -ItemType Directory -Path $EvidenceRoot" in combined_code, "unique evidence-root creation not explicit")
    check("New-Item -ItemType Directory -Path $StorePath" not in combined_code, "store-path creation command found")
    check("--mode=execute" not in combined_code, "execution mode text found in a procedure command block")

    simulate_parameter_copy(instrument)
    verify_sums()
    print("PASS: authoritative pins and source identities match; reported STOPs are classified from current records; procedure is parameter-only, fresh-rooted, PF-17-aware, and statically byte-simulated; prior instrument is unchanged.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
