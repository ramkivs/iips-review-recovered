#!/usr/bin/env python3
"""Self-test for the CAP-02 QE run-evidence manifest template (stdlib only).

Checks (all read-only, all local):
  A. schema + sample parse as JSON.
  B. every schema object/property carries a non-empty 'source' citation to a
     governing clause (derivation discipline: the template creates no
     requirement beyond the cited acts).
  C. sample carries every top-level required field; qe carries QE-1..QE-11.
  D. sample honesty: no PASS/success claim anywhere; every QE status begins
     with NOT EXECUTED; S2 0/5 NOT RUN; P-1 NOT EXECUTED; PF-15 NOT DESIGNATED.
  E. sample pins equal the adopted H-12 R5 pins; S1 values equal the
     determination; dist expectation equals 1,140.

Exit 0 with 'SELF-TEST: <n>/<n> PASS' on success; exit 1 otherwise.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SCHEMA_PATH = os.path.join(HERE, "cap02-qe-run-evidence-manifest.schema.json")
SAMPLE_PATH = os.path.join(HERE, "cap02-qe-run-evidence-manifest.sample-not-executed.json")

R5_IPD = "8eec74ae27cda09f3c368b9c299895eae41554db"
R5_IPD_TREE = "4eba29029f8d95cfe483e615a7047426b298ce50"
R5_IRR = "ba64b2d5927c2f872560710cf1474c25a5cde0d5"
R5_IRR_TREE = "5e4262f1cd75bf13b76ced5b45058f31434b5dad"

results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))


def main():
    # A. parse
    try:
        schema = json.load(open(SCHEMA_PATH, encoding="utf-8"))
        check("A1 schema parses as JSON", True, SCHEMA_PATH)
    except Exception as e:  # noqa: BLE001
        check("A1 schema parses as JSON", False, repr(e))
        schema = None
    try:
        sample = json.load(open(SAMPLE_PATH, encoding="utf-8"))
        check("A2 sample parses as JSON", True, SAMPLE_PATH)
    except Exception as e:  # noqa: BLE001
        check("A2 sample parses as JSON", False, repr(e))
        sample = None
    if schema is None or sample is None:
        return report()

    # B. source-annotation coverage (schema objects + properties, recursively)
    missing = []

    def walk(node, path):
        if isinstance(node, dict):
            if node.get("type") == "object" or "properties" in node:
                src = node.get("source", "")
                if not (isinstance(src, str) and src.strip()):
                    missing.append(path or "<root>")
                for k, v in (node.get("properties") or {}).items():
                    walk(v, f"{path}.{k}" if path else k)
                for k, v in (node.get("patternProperties") or {}).items():
                    walk(v, f"{path}[{k}]")
            elif "properties" not in node and path:
                # leaf property: source required unless it is a structural keyword holder
                if "type" in node or "description" in node:
                    src = node.get("source", "")
                    if not (isinstance(src, str) and src.strip()):
                        missing.append(path)
            for k in ("items",):
                if isinstance(node.get(k), dict):
                    walk(node[k], f"{path}.{k}")

    walk(schema, "")
    check("B1 every schema node carries a governing 'source' citation",
          not missing, "; ".join(missing[:8]) or f"{count_nodes(schema)} nodes cited")

    # required lists are non-empty where declared
    empty_req = []

    def walk_req(node, path):
        if isinstance(node, dict):
            if "required" in node and not node["required"]:
                empty_req.append(path or "<root>")
            for k, v in (node.get("properties") or {}).items():
                walk_req(v, f"{path}.{k}" if path else k)

    walk_req(schema, "")
    check("B2 no empty 'required' list in schema", not empty_req, "; ".join(empty_req[:5]))

    # C. sample structure
    top_required = schema.get("required", [])
    missing_top = [k for k in top_required if k not in sample]
    check("C1 sample carries every top-level required field",
          not missing_top and len(top_required) >= 10,
          "; ".join(missing_top[:8]) or f"{len(top_required)} fields present")
    qe = sample.get("qe", {})
    want_qe = [f"QE-{i}" for i in range(1, 12)]
    missing_qe = [q for q in want_qe if q not in qe]
    check("C2 sample qe carries QE-1..QE-11", not missing_qe, "; ".join(missing_qe))
    item_required = (schema.get("properties", {}).get("qe", {})
                     .get("patternProperties", {}).get("^QE-(1[01]|[1-9])$", {}).get("required", []))
    bad_items = [q for q in want_qe
                 if q in qe and any(f not in qe[q] for f in item_required)]
    check("C3 every QE item carries all required sub-fields",
          not bad_items, "; ".join(bad_items[:4]) or f"{len(item_required)} sub-fields x 11 items")
    v_a2 = sample.get("p1_provisioning", {}).get("v_a2", {})
    check("C4 sample carries V-A2-1..V-A2-8", len(v_a2) == 8, f"{len(v_a2)}/8 present")
    s2cmds = sample.get("s2_host_verification", {}).get("commands", [])
    check("C5 sample carries exactly 5 S2 commands", len(s2cmds) == 5, f"{len(s2cmds)}/5")
    pf_keys = [k for k in sample.get("s3_preflight", {}) if k.startswith("pf")]
    check("C6 sample carries PF-01..PF-17", len(pf_keys) == 17, f"{len(pf_keys)}/17")

    # D. honesty: no pass claims in any status/disposition field; everything unrun
    CLAIM_PREFIXES = ("PASS", "SUCCESS", "ACCEPTED", "ADMITTED", "ESTABLISHED")
    claim_hits = []

    def walk_status(node, path):
        if isinstance(node, dict):
            for k, v in node.items():
                if k == "status" and isinstance(v, str):
                    up = v.strip().upper()
                    if up.startswith(CLAIM_PREFIXES):
                        claim_hits.append(f"{path or '<root>'}.{k}={v[:40]}")
                else:
                    walk_status(v, f"{path}.{k}" if path else k)
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk_status(v, f"{path}[{i}]")

    walk_status(sample, "")
    check("D1 no status/disposition field claims PASS/success/acceptance/admission",
          not claim_hits, "; ".join(claim_hits[:4]))
    bad_status = [q for q in want_qe
                  if q in qe and not str(qe[q].get("status", "")).startswith("NOT EXECUTED")]
    check("D2 every QE status is NOT EXECUTED-prefixed", not bad_status, "; ".join(bad_status[:4]))
    notrun = [c for c in s2cmds if c.get("status") == "NOT RUN" and c.get("exit_code") is None]
    check("D3 S2 shows 0/5 NOT RUN with null exit codes",
          len(notrun) == 5, f"{len(notrun)}/5 NOT RUN")
    check("D4 P-1 status NOT EXECUTED, store null, single-use unspent",
          str(sample.get("p1_provisioning", {}).get("status", "")).startswith("NOT EXECUTED")
          and sample.get("p1_provisioning", {}).get("store_path") is None
          and sample.get("p1_provisioning", {}).get("single_use_consumed") is False)
    check("D5 PF-15 NOT DESIGNATED in sample",
          "NOT DESIGNATED" in str(sample.get("s3_preflight", {}).get("pf15_endpoint_state", "")))
    check("D6 run_id/record_id null; u4 NOT RENDERED",
          sample.get("run_id") is None and sample.get("record_id") is None
          and str(sample.get("u4_acceptance", "")).startswith("NOT RENDERED"))
    check("D7 every QE artifacts list is empty (no fabricated evidence)",
          all(isinstance(qe[q].get("artifacts"), list) and not qe[q]["artifacts"]
              for q in want_qe if q in qe))

    # E. pin/value consistency with effective records
    pins = sample.get("pins", {})
    check("E1 sample IPD pin equals adopted R5 primary",
          pins.get("ipd_commit") == R5_IPD and pins.get("ipd_tree") == R5_IPD_TREE)
    check("E2 sample IRR pin equals adopted R5 consumer",
          pins.get("irr_commit") == R5_IRR and pins.get("irr_tree") == R5_IRR_TREE)
    s1 = sample.get("s1_identity_values", {})
    check("E3 sample S1 values equal the determination",
          s1.get("principal_label") == "ramki-personal-local"
          and s1.get("tenantId") == "ipd-personal-local"
          and s1.get("canonicalOwnerId") == "ipd-owner-ramki-personal")
    check("E4 expected dist count equals 1,140",
          sample.get("s2_host_verification", {}).get("expected_dist_count") == 1140)
    check("E5 H-12 manifest blob/sha equal adopted R5",
          sample.get("h12", {}).get("manifest_blob", "").startswith("f4649e36a81c7013287810cd3202b99586dbd951")
          and sample.get("h12", {}).get("manifest_sha256", "").startswith("d0be8bef"))
    return report()


def count_nodes(node):
    n = 0
    if isinstance(node, dict):
        if node.get("type") == "object" or "properties" in node or "source" in node:
            n += 1
        for v in list((node.get("properties") or {}).values()) + list(
                (node.get("patternProperties") or {}).values()):
            n += count_nodes(v)
        if isinstance(node.get("items"), dict):
            n += count_nodes(node["items"])
    return n


def report():
    passed = sum(1 for _, ok, _ in results if ok)
    total = len(results)
    lines = [f"CAP-02 QE run-evidence manifest template self-test — {passed}/{total} PASS"]
    for name, ok, detail in results:
        lines.append(f"[{'PASS' if ok else 'FAIL'}] {name}" + (f" — {detail}" if detail else ""))
    lines.append(f"SELF-TEST: {passed}/{total} {'PASS' if passed == total else 'FAIL'}")
    text = "\n".join(lines) + "\n"
    sys.stdout.write(text)
    out = os.path.join(HERE, "31-schema-self-test.txt")
    with open(out, "w", encoding="utf-8") as f:
        f.write(text)
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
