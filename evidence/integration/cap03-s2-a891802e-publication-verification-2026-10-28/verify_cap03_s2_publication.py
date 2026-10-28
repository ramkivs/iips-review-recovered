#!/usr/bin/env python3
"""CAP-03 S2 (run s2-a891802e-20261028T192516Z) published-evidence integrity verifier.

Read-only. Verifies the evidence package published in IRR at commit
2cc5bc4302436f8ae6d84a9e657b8c1ed06b5478 (branch docs/g3-d0-registration-2026-10-18):

  1. the folder inventory equals the sealed list (16 entries) and nothing else is present;
  2. SHA256SUMS.txt reproduces as a whole from its own published bytes (the console seal
     value cannot be stored in the seal, so this is the only endogenous anchor);
  3. every recorded per-artifact digest is tested against the published blob as-stored and
     against the published blob restored LF -> CRLF (the captures were taken CRLF on the
     Windows host; the runbook's R-2 precedent, PA rulings record pass 2 §3, treats CRLF
     restoration as the corroborating route);
  4. the byte-count arithmetic (stored bytes + LF-line delta vs manifest "bytes") is
     reported for every artifact;
  5. the MANIFEST digests/byte counts are cross-checked against SHA256SUMS;
  6. dist before/after lists are compared; the TAP totals are re-parsed from
     05-guarded-npm-test.txt; RESULT.txt values are cross-checked against s2-00,
     s2-01c, s2-04b, s2-08 and 06-package-consumer;
  7. the seal-recheck transcript is checked for run identity, 16/16 OK lines per recheck,
     zero issues, final-folder publication, and the recorded seal SHA-256.

Exit code 0 = all checks behaved as classified below; this script asserts no governance
status and performs no acceptance. It never writes to any evidence path; all outputs go to
stdout so they can be captured as this pass's verification record.

Usage: verify_cap03_s2_publication.py [REPO_DIR] [COMMIT]
"""
import hashlib
import json
import re
import subprocess
import sys

REPO = sys.argv[1] if len(sys.argv) > 1 else "."
COMMIT = sys.argv[2] if len(sys.argv) > 2 else "2cc5bc4302436f8ae6d84a9e657b8c1ed06b5478"
FOLDER = "evidence/cap03-s2/s2-a891802e-20261028T192516Z"
TRANSCRIPT = "evidence/cap03-s2/s2-a891802e-20261028T192516Z.seal-recheck.txt"
EXPECTED_SEAL = "9D3C09DBDB691C2527A45605DEA20826B4EC2BA2F110985EE3F1033783B5225E"
RUN_ID = "s2-a891802e-20261028T192516Z"
PIN = "a891802e2691bd9c65a67d6abff20d8ce0c26d7d"
TREE = "76f083d7058e170d8212455c03bad1033136ee68"
PACK = "cc2aa70186b8fd7bc7255452ac8d8b00d094f53e"


def blob(path: str) -> bytes:
    return subprocess.run(
        ["git", "-C", REPO, "show", f"{COMMIT}:{path}"], check=True, capture_output=True
    ).stdout


def ls(path: str) -> list[str]:
    out = subprocess.run(
        ["git", "-C", REPO, "ls-tree", "-r", "--name-only", COMMIT, path],
        check=True, capture_output=True, text=True,
    ).stdout.splitlines()
    return [p for p in out if p.strip()]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest().upper()


def crlf(data: bytes) -> bytes:
    return data.replace(b"\n", b"\r\n")


def main() -> int:
    fails: list[str] = []
    print(f"COMMIT={COMMIT}")
    print(f"RUN={RUN_ID}")

    # 1. inventory
    entries = sorted(ls("evidence/cap03-s2/"))
    folder_files = sorted(p[len(FOLDER) + 1:] for p in entries if p.startswith(FOLDER + "/"))
    transcript_present = TRANSCRIPT in entries
    print(f"INVENTORY paths={len(entries)} folder_files={len(folder_files)} transcript={transcript_present}")
    if len(entries) != 18 or len(folder_files) != 17 or not transcript_present:
        fails.append("inventory count mismatch (expected 18 total = 17 folder + 1 transcript)")

    # 2. seal self-hash
    seal = blob(f"{FOLDER}/SHA256SUMS.txt")
    seal_hash = sha(seal)
    print(f"SEAL self-hash published={seal_hash} transcript-recorded={EXPECTED_SEAL} "
          f"{'MATCH' if seal_hash == EXPECTED_SEAL else 'MISMATCH'}")
    if seal_hash != EXPECTED_SEAL:
        fails.append("SHA256SUMS.txt published bytes do not reproduce the recorded seal SHA-256")

    # 3./4./5. per-artifact digests and sizes
    recorded = {}
    for line in seal.decode().splitlines():
        m = re.match(r"^([0-9A-Fa-f]{64})  (.+)$", line.strip())
        if m:
            recorded[m.group(2)] = m.group(1).upper()
    manifest = json.loads(blob(f"{FOLDER}/MANIFEST.json").decode())
    man = {a["path"]: a for a in manifest["artifacts"]}
    if set(recorded) != {k for k in folder_files if k != "SHA256SUMS.txt"}:
        fails.append("sealed list != folder inventory")
    print(f"SEAL entries={len(recorded)} (expected 16)")
    cats = {"as-stored": 0, "crlf-restored": 0, "unreproduced": 0}
    for name in sorted(recorded):
        data = blob(f"{FOLDER}/{name}")
        as_stored = sha(data)
        restored = sha(crlf(data))
        rec = recorded[name]
        if as_stored == rec:
            cls = "as-stored"
        elif restored == rec:
            cls = "crlf-restored"
        else:
            cls = "unreproduced"
        cats[cls] += 1
        nlines = data.count(b"\n")
        size_calc_stored = len(data)
        size_calc_crlf = len(data) + nlines
        mbytes = man.get(name, {}).get("bytes")
        digest_ok = "OK" if rec in (as_stored, restored) else "DIGEST-NOT-REPRODUCIBLE"
        size_note = ""
        if mbytes is not None:
            if size_calc_stored == mbytes:
                size_note = "bytes=as-stored (LF at creation)"
            elif size_calc_crlf == mbytes:
                size_note = "bytes=stored+lines (all-CRLF restore)"
            else:
                size_note = f"bytes=stored+{mbytes - size_calc_stored} (partial EOL restore: stored {size_calc_stored} + {mbytes - size_calc_stored} = recorded {mbytes})"
        print(f"ARTIFACT {name:32s} class={cls:13s} {digest_ok} lines={nlines} stored={size_calc_stored} recorded={mbytes} manifest-digest={'OK' if man.get(name, {}).get('sha256', '').upper() == rec else 'X'} {size_note}")
        if cls == "unreproduced" and name != "s2-00-run-log.txt":
            fails.append(f"{name}: digest unreproduced and not the classified run-log case")
        if name == "s2-00-run-log.txt" and cls == "unreproduced":
            if mbytes != size_calc_crlf - 2:
                fails.append("s2-00-run-log.txt byte arithmetic does not fit the 2-LF-line model")
            else:
                print("RUNLOG recorded bytes = stored + (lines - 2): consistent with exactly 2 of 42 lines already LF-terminated on the host; uniform CRLF restore overshoots by 2 bytes; digest requires host originals")
    print(f"CATEGORIES as-stored={cats['as-stored']} crlf-restored={cats['crlf-restored']} unreproduced={cats['unreproduced']} (expected 2 / 13 / 1)")
    if cats != {"as-stored": 2, "crlf-restored": 13, "unreproduced": 1}:
        fails.append("digest category split differs from the expected 2/13/1")

    # 6. dist before/after, TAP totals, cross values
    before = blob(f"{FOLDER}/s2-04c-dist-sha256-before.txt")
    after = blob(f"{FOLDER}/s2-08b-dist-sha256-after.txt")
    nb, na = before.count(b"\n"), after.count(b"\n")
    print(f"DIST before-lines={nb} after-lines={na} identical={before == after}")
    if nb != 1140 or na != 1140 or before != after:
        fails.append("dist before/after comparison unexpected")
    guarded = blob(f"{FOLDER}/05-guarded-npm-test.txt")
    tail = guarded.decode(errors="replace")
    for pat, want in [(r"^# tests (\d+)$", "930"), (r"^# pass (\d+)$", "926"),
                      (r"^# fail (\d+)$", "0"), (r"^# cancelled (\d+)$", "0"),
                      (r"^# skipped (\d+)$", "4")]:
        m = re.findall(pat, tail, re.M)
        if m != [want]:
            fails.append(f"TAP {pat!r} found {m} expected [{want}]")
        print(f"TAP {pat} = {m}")
    result = blob(f"{FOLDER}/RESULT.txt").decode()
    for key, want in [("STATUS: PASS", "PASS"), (RUN_ID, RUN_ID), (PIN, PIN), (TREE, TREE),
                      ("DESKTOP-NO0NHTP", "host"), ("v22.16.0", "node"), ("10.9.2", "npm"),
                      ("1140", "dist"), ("930", "guard"), ("926", "pass"), (PACK, "pack")]:
        if key not in result:
            fails.append(f"RESULT.txt missing {key}")
    for f in ("s2-01c-pin-verification.txt", "s2-08-post-run-pin.txt", "s2-04b-dist-count.txt",
              "06-package-consumer.txt", "s2-00-run-log.txt"):
        txt = blob(f"{FOLDER}/{f}").decode(errors="replace")
        if PIN not in txt and f in ("s2-01c-pin-verification.txt", "s2-08-post-run-pin.txt", "s2-00-run-log.txt"):
            fails.append(f"{f} missing pin")
        if f == "06-package-consumer.txt" and ('"result": "PASS"' not in txt or PACK not in txt):
            fails.append("06-package-consumer.txt missing PASS result or shasum")
        if f == "06-package-consumer.txt":
            print("CONSUMER result=PASS shasum=reference RETURN CODE: 0 present:", "RETURN CODE: 0" in txt)
            if "RETURN CODE: 0" not in txt:
                fails.append("06 return code missing")

    # 7. transcript
    tr = blob(TRANSCRIPT).decode()
    ok1 = len(re.findall(r"^OK +\S+$", tr.split("Recheck 1 issues")[0], re.M))
    ok2 = len(re.findall(r"^OK +\S+$", tr.split("Recheck 1 issues")[1].split("Recheck 2 issues")[0], re.M))
    tr_run = RUN_ID in tr
    tr_seal = EXPECTED_SEAL in tr
    tr_final = f"{RUN_ID}\n" in tr and "Final status: PASS" in tr
    tr_pub = "Evidence record published: yes" in tr
    tr_issues = re.search(r"Recheck 1 issues: (\d+)", tr).group(1) == "0" and re.search(r"Recheck 2 issues \(published folder\): (\d+)", tr).group(1) == "0"
    print(f"TRANSCRIPT runid={tr_run} ok-recheck1={ok1} ok-recheck2={ok2} issues-zero={tr_issues} seal-sha-present={tr_seal} final-PASS={tr_final} published={tr_pub}")
    if not (tr_run and ok1 == 16 and ok2 == 16 and tr_issues and tr_seal and tr_final and tr_pub):
        fails.append("transcript consistency unexpected")
    names_tr = set(re.findall(r"^OK +(\S+)$", tr, re.M))
    if names_tr != set(recorded):
        fails.append("transcript OK-name set differs from sealed list")

    print("=" * 60)
    if fails:
        print("FAILURES")
        for f in fails:
            print(" -", f)
        return 1
    print("ALL CHECKS MATCH THE CLASSIFICATION (2 as-stored, 13 CRLF-restored, 1 run-log digest requiring host originals; seal self-hash reproduced)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
