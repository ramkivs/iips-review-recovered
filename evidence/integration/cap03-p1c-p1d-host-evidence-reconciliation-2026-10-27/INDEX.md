# Evidence — `IIPS-V3-CAP03-P1C-P1D-HOST-EVIDENCE-RECONCILIATION-2026-10-27-01`

Companion bundle for tracker **§16.151** (`CV-CORR-131`, `CHG-2026-10-27-07`, `V1015`–`V1024`) and
[`docs/integration/IIPS_v3.0_CAP03_P1C_P1D_HOST_EVIDENCE_RECONCILIATION_2026-10-27.md`](../../../docs/integration/IIPS_v3.0_CAP03_P1C_P1D_HOST_EVIDENCE_RECONCILIATION_2026-10-27.md).

**Identifier reallocation.** Live `main` moved during drafting (concurrent IRR PR #321 →
`064e9f1fd038c2e81db90058e30dfa2a637331d3` (after CAP-04 PRs #321–#324), CAP-04 §16.150 / `CV-CORR-130` / `CHG-2026-10-27-06` /
`V1003`–`V1014`). Per the §16.140.0 collision precedent this pass is based on that live head (tracker re-read again; CAP-04 later PRs changed only docs/evidence) and reallocated to
§16.151 / `CV-CORR-131` / `CHG-2026-10-27-07` (receipt `CHG-2026-10-27-08`) / `V1015`–`V1024` (receipt
`V1025`); CAP-04's tracker section is preserved byte-identically. See `00-baseline-and-primary-sources.json`.

**Character.** Governance/evidence reconciliation only. **Arena had NO host contact.** Arena cannot
reach `C:\IIPS-EVIDENCE\cap03-p1-20261027-02`; it has read, hashed or deposited **zero** bytes of the two
operator-captured host evidence sets. Digests for those files are `null` in `03-evidence-manifest.json`
(`null` = **NOT SUPPLIED**, never "matching"). Arena claims no Windows verification. No P-1 execution,
no `--mode=execute`, no store/sidecar/parent creation, no ACL/flag/pin/manifest/code/fence change,
`0` IPD writes.

| File | Purpose |
|---|---|
| `00-baseline-and-primary-sources.json` | Live authoritative branch/head/tree verification; exact primary-source blob IDs + SHA-256; governing procedure; F4/F5 literals; published instrument identity and `STOP.txt` semantics; hard prohibitions |
| `01-prior-assertion-provenance.json` | Provenance reconciliation: earlier **operator-reported** absence premise vs new **host-captured** existence; §16.148.2 premise delta; unknown directory creation provenance; no allegation, no causal claim; `DISP-01` nearest-existing-ancestor application and materiality analysis |
| `02-pf-criterion-assessment.json` | Criterion-by-criterion PF-01…PF-17 + capture-envelope + freshness assessment; why no `STOP.txt`, zero error-scan matches, a completed traversal and existing capture files are not acceptance proof; six named blockers with narrow actions; P-1-C / P-1-D conclusions |
| `03-evidence-manifest.json` | Manifest of both original evidence captures plus the earlier 11-file capture: CAP-A preserved verbatim with 11 digests; CAP-B (fresh preflight capture), CAP-C (separate read-only host assessment), CAP-D (generator bytes) **not supplied** — explicit filenames/evidence that must be deposited verbatim; operator-reported and Arena-verified digests separated |
| `04-operator-host-evidence-verbatim.md` | Verbatim transcription of the operator-supplied prose summary (labelled: **not** a raw host transcript) and its governing clauses; terminology guard (`Synchronize` ACL right ≠ cloud sync) |
| `05-prior-capture-relevant-transcripts.md` | Full relevant raw transcripts of the earlier 11-file capture, verbatim in fenced blocks with byte counts and digests |
| `06-prior-capture-verbatim/` | Byte-identical copies of all **11** earlier capture files (CAP-A preserved verbatim) |
| `verify_reconciliation.py` | Recomputes bundle digests, CAP-A verbatim preservation, F4/F5 byte identity, instrument digests, provenance/DISP-01 facts, criterion statuses, scope of changes |
| `SHA256SUMS.txt` | SHA-256 of every file in this bundle except itself |

## Evidence files that MUST be supplied (not deposited here)

From `C:\IIPS-EVIDENCE\cap03-p1-20261027-02` and its companion assessment, verbatim, with a
host-generated SHA-256 manifest and a full directory listing:

1. **CAP-B — fresh preflight capture**: `00-run-parameters.txt`, `01-pf01-hostname.txt`,
   `02-pf02-os.txt`, `03-pf03-elevation.txt`, `04-pf04-runtime.txt`, `05-pf05-sqlite.txt`,
   `06-pf06-node-path.txt`, `07-pf07-ipd-tree.txt`, `08-pf08-irr-tree.txt`, `09-pf09-shallow.txt`,
   `10-pf10-flags.txt`, `11-pf11-12-13-store-path.txt`, `14-pf14-evidence-root.txt`,
   `15-pf15-designation.txt`, `99-script-digest.txt` (or the actual filenames used), **plus** the raw
   ancestor-traversal transcript with the per-ancestor `.git` result, the error-scan command/patterns/
   zero-match output, UTC start/end timestamps, the volume/ACL/reparse-point/OneDrive/Test-Path outputs,
   IPD/IRR pin lines, successor §8 step-0 source hashes, and the directory listing proving no
   `STOP.txt`.
2. **CAP-C — the separate read-only host assessment**: its actual filename(s) and full raw bytes.
3. **CAP-D — the generator**: the exact `.ps1` bytes hashing to
   `B5D58F7FFF78C34DFFCD189EAC46A27889775F44ABF60F1A8ABD905224093C95` (which does **not** equal the
   published instrument `85AC7271C73469B6D5E454A3173FF3AAD944A645A2352BB77EE36BAEE976A30B`),
   or a reconciliation showing the published instrument was used.

## Outcome supported by this bundle

| Item | State |
|---|---|
| Prior terminal-parent absence statement | Earlier **operator-reported** premise, not an Arena host measurement; superseded as current reported state by host-captured existence |
| Directory creation provenance | **UNKNOWN** — not a pass, not an assumed failure, not a new authority blocker |
| `DISP-01` at P-1 scope | Nearest existing ancestor = `C:\iips-data\iips`; local fixed NTFS / non-synced / non-network supported at reported level; existence is not a STOP; S3 wording unchanged |
| `P-1-C` | **NOT ESTABLISHED** — fresh capture exists but no raw bytes, no independent read-back, no generator bytes, no attempt-session/immediately-before timing |
| `P-1-D` | **DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT** |
| `P-1` | **UNSPENT / UNEXECUTED / NOT AUTHORIZED TO EXECUTE** |

## Reproduction

```bash
cd evidence/integration/cap03-p1c-p1d-host-evidence-reconciliation-2026-10-27
python3 verify_reconciliation.py        # expects: RECONCILIATION VERIFIED, exit 0
shasum -a 256 -c SHA256SUMS.txt         # bundle integrity
```
