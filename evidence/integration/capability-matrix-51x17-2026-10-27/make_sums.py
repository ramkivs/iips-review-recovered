#!/usr/bin/env python3
"""Write SHA256SUMS.txt over the bundle files plus the published report and tracker."""
import hashlib
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[2]
EXCLUDE = {"SHA256SUMS.txt", "03-publication-readback.json", "make_sums.py"}
EXTRA = [
    HERE.parents[2] / "docs/integration/IIPS_v3.0_CAPABILITY_MATRIX_51X17_RECONSTRUCTION_2026-10-27.md",
    HERE.parents[2] / "IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md",
]
files = sorted(p for p in HERE.iterdir()
               if p.is_file() and p.name not in EXCLUDE and not p.name.endswith(".pyc"))
lines = []
for p in files + EXTRA:
    lines.append(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}")
(HERE / "SHA256SUMS.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("\n".join(lines))
