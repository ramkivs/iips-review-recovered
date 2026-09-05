# D7-TIER3-PARITY — RR-F1 THREE-DOCUMENT REPAIR AUTHORITY

- Artifact class: GOVERNANCE AUTHORITY (successor product-mutation authority; definition + authorization only).
- Date: 2026-09-05. Status: EFFECTIVE UPON DURABLE RECORDING.
- Predecessor chain: P2 scope/execution authority `7fa0664f46149cdb75ce60e511c2b5345755926b` → P2 substantive reviews `81e1b51563c8f82e40e2464545cce7e30ba8fb3d` (REJECT ×3, historical) → remediation discovery `e3145c7e…` → execution plan `71693115a9d3f6721a4c1be85a5967dd06d4586a` → D36-successor 57-document authority `73e7f668e91a909a9dfdcfdc0ec041fd85f74c33` (SHA-256 `9597e722d489961a73e0de4711d64b1a5151c4d22d2f8af836b73af38bc8554c`; mutation leg COMPLETE and durably recorded) → remediation product recording `0b5007c64a3cf7ed7057970feba0aad8fcb051f7` (parent exactly `830bd7218f6a77274e3d58eef09d706a3a99794f`) → evidence recording `3fc36fbe52a985def0302d8b8cfe0e23c978971c` (parent exactly `73e7f668…`) → post-remediation substantive re-review (CONDITIONAL APPROVE).

## 1. Finding authorizing this scope

- Finding identity: **RR-F1 — slot-16 readiness-table rendering defect** (re-review finding register, one instance per engine; identical root cause).
- Independent re-review evidence: `D7-TIER3-PARITY-POST-REMEDIATION-SUBSTANTIVE-RE-REVIEW-2026-09-05.md`, SHA-256 `a0fc3daf6f92a7fc5a1f03a3e5d89f3012d47763839a4f564b5ed21bb6fe4c5d`, verdict CONDITIONAL APPROVE (execution-gate evidence; durable recording pending).
- Defect: in each affected document the verbatim readiness-evidence table row `| Governed transport/API auto-extension (\`/api/company|evidence|replay/<Sector>\`) | PASS |` is truncated at the in-cell pipe characters — the Result value `PASS` and part of the description are lost and the fragment `evidence` occupies the Result column — and the certificate header row `| Evidence | Result |` is re-rendered as a data row. Corpus-wide scans (reverse parse + unbalanced-content probe) bound the defect to exactly these three rows; no other corpus table row loses content.

## 2. EXACT mutation scope — 3 unique existing product paths

| Engine | Path (repository-relative) | Baseline blob (git) | Baseline SHA-256 | Bytes |
|---|---|---|---|---|
| IES-016 | `ies-016-telecommunications/docs/IES-016_16_IMPLEMENTATION_READINESS_CERTIFICATE.md` | `53a5713ee7bab2d168f42c5fe7322c6dce2d290c` | `3ccea577f9c8f98955742ea82bdb277fcd1dfe56182e7b605d79b8f09b9c9ecc` | 7802 |
| IES-017 | `ies-017-automobile/docs/IES-017_16_IMPLEMENTATION_READINESS_CERTIFICATE.md` | `856956d0e3c759739c07add6175540558d1f3d7a` | `54fa943ba9a1b882512ea952caba7dcb5373bd140cc3a72aa71512d36c8365a9` | 7776 |
| IES-020 | `ies-020-materials-metals/docs/IES-020_16_IMPLEMENTATION_READINESS_CERTIFICATE.md` | `ab7b4aa34be7fe84d715938483080c19e7677d39` | `2e3613e9e668e6510595e05a06bbd615c960821dbc94b4f3e16b0b7c2af32bd8` | 7841 |

Baseline product commit: `0b5007c64a3cf7ed7057970feba0aad8fcb051f7` (parent exactly `830bd7218f6a77274e3d58eef09d706a3a99794f`). The authorized set is set-equal to the three rows above and nothing else. No wildcards, no directory-wide, engine-wide, slot-wide, or repo-wide scope, no future-expansion clauses, no "and any similar files" language. Any attempted mutation of any path outside this set under this authority is void and must trigger a fail-closed halt and report.

## 3. Authorized repair objective (repair-only, value-preserving)

Per affected file, the minimum Markdown representation repair that:

1. represents the pipe-containing transport/API value so it is not interpreted as a cell delimiter (escaped `\|` or code-fenced cell content);
2. keeps the corresponding result cell exactly `PASS`;
3. removes the duplicated readiness-table header row;
4. restores the intended readiness-table structure;
5. leaves all substantive frozen-source values unchanged; and
6. changes nothing else in document-16 content beyond that minimum formatting repair.

The transport/API string must retain its authoritative underlying value `/api/company|evidence|replay/<Sector>`; only its Markdown representation may change.

## 4. Frozen-source rule

Only already-established frozen source content and existing recorded document content may be used. No new methodology. No alteration of frozen source material. No recomputation or replacement of substantive values merely because they can be recomputed.

## 5. Explicitly forbidden mutations

Changing any numerical value, calibration value, weight, verdict band, or oracle output; changing methodology; changing source citations or source blobs; resolving Q5; resolving IES-020 §28 Q1–Q5; changing DF-1 (`byteIdentical=false / caseDiffs=0`); changing the 33/33 manifest qualification; changing E2E-018; changing D36 stubs; modifying any of the other 54 remediated documents; modifying any non-product governance source; changing historical/frozen labels except strictly as required for the RR-F1 repair; adding certification language; adding promotion/release language. No semantic remediation beyond RR-F1 is authorized.

## 6. Binding controls

1. Exact three-path manifest (§2 table; set-equal).
2. Current product commit pinned: `0b5007c6…`.
3. Exact parent/baseline pinned: `830bd721…`.
4. RR-F1 finding identity pinned (§1).
5. Independent re-review evidence identity pinned (SHA-256 `a0fc3daf…`).
6. Repair-only objective (§3).
7. Frozen-source constraint (§4).
8. Minimum-change requirement (§3.6).
9. Exact exclusions (§5).
10. Pre-mutation snapshot requirement: blob+SHA-256 snapshot of the three files (and full-path census) before mutation; pre-mutation identity must equal §2 pins — else HALT FAIL-CLOSED.
11. Post-mutation blob/SHA-256 verification of all three files.
12. Exact three-path mutation census: exactly 3 modified / 0 added / 0 deleted / 0 renamed / 0 untracked.
13. Source/stub/E2E-018 immutability re-verified post-mutation (33 engine pins + 8 shared pins + 3 D36 stubs + E2E-018).
14. Independent post-repair validation battery (scope, RR-F1 closure, value preservation, source/boundary preservation, carry-forwards).
15. Mandatory fresh substantive re-review of the three repaired documents after repair (independent of the repair execution).
16. No certification/promotion/P3 authority (§7 non-authorizations).
17. Expiry: this authority expires upon durable recording of the repair, its validation, and the fresh re-review — with no silent extension into re-review adjudication, certification, P3, or promotion.
18. Sec. 8 independence-disclosure regime (P2 authority) carries: no organizational/external/accredited independence exists; role separation + clean-workspace reproducibility applies; all evidence produced under the recorded no-independence disclosure.

## 7. Non-authorizations

This authority does NOT certify parity, does not grant P3, does not grant promotion/release, does not close Q5 / DF-1 / manifest qualification / IES-020 Q1–Q5, and does not authorize any substantive content change beyond §3. D7-TIER3-PARITY REMAINS NOT SATISFIED — CERTIFICATION NOT GRANTED.

## 8. Required repair acceptance tests

- **A. Scope:** 3 modified / 0 added / 0 deleted / 0 renamed; modified set == §2 paths exactly.
- **B. RR-F1 closure (per file):** no duplicated readiness-table header; transport/API row structurally valid Markdown; transport/API value complete; result cell exactly `PASS`; no truncation; no unintended cell splitting.
- **C. Value preservation:** pre-vs-post comparison confined to the authorized Markdown repair; all other content byte/value-equivalent.
- **D. Source preservation:** 33 engine pins + 8 shared pins unchanged.
- **E. Boundary preservation:** D36 stubs unchanged; E2E-018 unchanged; no P3/certification/promotion additions.
- **F. Carry-forwards:** Q5 = UNVERIFIABLE; DF-1 = `byteIdentical=false / caseDiffs=0`; manifest 33/33 qualification; IES-020 §28 Q1–Q5 OPEN — all unchanged.

## 9. Recording and effect

Recorded governance-side under the established governance-only convention (single add; no amendment of prior artifacts; no product mutation at recording). Effective upon recording; void if any §2 pin does not hold at execution time.
