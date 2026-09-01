## Evidence Provenance Classes

The following evidence provenance classes are mandatory for D36:

1. **RECOVERED-HISTORICAL** - evidence recovered from historical or recovered review material.
2. **CURRENT-REPOSITORY** - evidence directly present in the authoritative current repository.
3. **D36-NEW-EVIDENCE** - evidence newly created under D36 authority, dated and attributed at creation.
4. **ABSENT-UNVERIFIABLE** - requested evidence or artifact not located or not independently verifiable; absence carries no negative inference.

# D36 — Tier-3 Documentation / Product-Parity Authority
- **Record ID:** `DEC-D36-TIER3-DOCUMENTATION-PARITY-AUTHORITY`
- **Title:** D36 — Tier-3 Documentation / Product-Parity Authority
- **Class:** `DECISION / AUTHORITY`
- **Status:** `RECORDED — METHODOLOGY ACCEPTANCE AUTHORITATIVE AT DEC-D25. EXECUTION AUTHORITY GRANTED FOR EXACTLY 63 NEW FILES. NO A2 -> A1. NO INTEGRATION-VERIFICATION-MATRIX AMENDMENT. NO CERTIFICATION.`
- **Date/time:** 2026-09-01 14:10:00 +05:30 (actual maintainer execution time at this gate; no historical timestamp is invented)
- **Authority relationship:** gate `D36 — Tier-3 Documentation-Parity Execution-Authority Gate`. Recording authority for this record granted on `arena/01a03e3b-iips-review-recovered` only. Depends on `DEC-D14-TIER3-PREREQUISITE-RESOLUTION` (programme scope/plan), `DEC-D15-VERIFICATION-METHODOLOGY` (§1 = A verification methodology), `DEC-D16-TIER3-DOCUMENTATION-PARITY-EXECUTION` (§8 evidence semantics), `DEC-D21-FENCE8-DETERMINATION` (§4.2 minimum-relief map, §4.3 governance-recording-no-fence-relief), `DEC-D22-TIER3-METHODOLOGY-ACCEPTANCE-STATUS` (§4 acceptance-recording-no-fence-relief) and `DEC-D25-TIER3-EVIDENTIARY-STANDARD` (authoritative methodology acceptance). **D25 is referenced, not re-decided and not amended.**
- **Scope:** grant of product-branch mutation authority on `phase13-next` limited to the three Tier-3 engine directories, authorizing exactly 63 NEW files (creation only). **Amends nothing in D7, D14, D15, D17 or D25.** Does **not** authorize A2 -> A1, matrix amendment, certification, release/tag creation, or modification of any existing certified artifact.
- **Provenance:** a newly recorded authority decision produced by the maintainer operator at this gate from the authoritative governance state (including the D33-updated record set via `DEC-D33`). **No historical provenance is claimed for this record.** No commit, push, or product-branch value is invented here.
- **Supersession / revision relationship:** narrow execution-authority supersession only for the blocked / no-relief portions of `DEC-D16-TIER3-DOCUMENTATION-PARITY-EXECUTION` (its §1 = E and §2 = B findings are superseded only to the extent they record that execution was blocked pending the methodology-acceptance prerequisite and that no fence relief existed; this record grants that relief on the narrow, enumerated basis) and `DEC-D22-TIER3-METHODOLOGY-ACCEPTANCE-STATUS` (its deferred-status reading that no execution is possible). **Does not amend D7, D14, D15, D17 or D25.** D14's programme scope/plan and D15's verification methodology remain unchanged; D25's methodology acceptance remains the governing acceptance and is not re-decided here.
---
## 1. METHODOLOGY ACCEPTANCE — REFERENCED, NOT RE-DECIDED
The IES-016 / IES-017 / IES-020 methodology acceptance is already authoritative under `DEC-D25-TIER3-EVIDENTIARY-STANDARD` as fresh forward-looking acceptance:
| Methodology | Record | Acceptance |
|---|---|---|
| IES-016 `D16 v1.0` | `DEC-D25-TIER3-EVIDENTIARY-STANDARD` | **ACCEPT** |
| IES-017 `D17 v1.0` | `DEC-D25-TIER3-EVIDENTIARY-STANDARD` | **ACCEPT** |
| IES-020 `D20 v1.0` | `DEC-D25-TIER3-EVIDENTIARY-STANDARD` | **ACCEPT** |
**This record does not re-decide or amend D25.** It is recorded here for reference only.
## 2. AUTHORIZED PRODUCT-BRANCH MUTATION
- **Branch:** `phase13-next`
- **Directories (only):**
  - `ies-016-telecommunications/`
  - `ies-017-automobile/`
  - `ies-020-materials-metals/`
### 2.1 Exactly 63 NEW files (creation only)
| Engine | Acceptance record | 19 numbered docs under `docs/` | `ARCHITECTURE_REVIEW` | Total |
|---|---|---|---|---|
| IES-016 | `ies-016-telecommunications/D16_AUTHORITY_REVIEW.md` | `docs/IES-016_01_README.md` … `docs/IES-016_19_REFERENCE_DATA_SOURCES.md` | `IES-016_ARCHITECTURE_REVIEW.md` | 21 |
| IES-017 | `ies-017-automobile/D17_AUTHORITY_REVIEW.md` | `docs/IES-017_01_README.md` … `docs/IES-017_19_REFERENCE_DATA_SOURCES.md` | `IES-017_ARCHITECTURE_REVIEW.md` | 21 |
| IES-020 | `ies-020-materials-metals/D20_AUTHORITY_REVIEW.md` | `docs/IES-020_01_README.md` … `docs/IES-020_19_REFERENCE_DATA_SOURCES.md` | `IES-020_ARCHITECTURE_REVIEW.md` | 21 |
**Total = 63 NEW files. 0 modifications. 0 deletions. 0 renames.**
### 2.2 Fence-8 relief
Fence-8 relief is granted for **exactly the 63 creates above**, **creation only**, **0 modifications, 0 deletions, 0 renames**. It expressly does not extend to, and assigns no authority over, modification of existing certified artifacts in those directories.
## 3. BINDING EXECUTION CONSTRAINTS
Any execution under this authority **must**:
1. Follow the **D15** verification methodology: **role separation plus clean-workspace reproducibility**; no organizational, external, third-party or accredited independence claimed.
2. Follow the **D16** evidence semantics: the 63 artifacts are **new evidence / documentation, dated at creation**, with authorship disclosed.
3. Carry **truthful dating and provenance**; must **not** represent new work as recovered or historical evidence.
4. Make **no unsupported independence claim**.
5. Carry the truthful acceptance/status relation to their sources without presenting unaccepted work as accepted.
## 4. EXPLICIT EXCLUSIONS
This record authorizes **nothing** beyond the 63 listed NEW files. It explicitly excludes and grants **no authority for**:
- **A2 -> A1 transition** (IES-016 / IES-017 / IES-020 remain A2; no capability promoted)
- **Integration Verification Matrix amendment** (fence 9 untouched)
- **certification**
- **release/tag creation**
- **modification of existing certified artifacts** (readiness certificates, freeze manifests, regression tests, calibration files, contract-test files, acceptance matrices, discovery packs, risk registers, release notes)
- **unrelated product-branch changes** (any path outside the three directories and the 63 enumerated files)
- **any ref movement** other than the separately authorized commit/push operations for this record and the authorized product-branch execution.
## 5. GOVERNANCE-RECORD FENCING
The D36 governance record itself is created under `governance/iips/` on `arena` and **requires no Fence-8 relief** (per `DEC-D21` §4.3 and `DEC-D22` §4). No product-branch mutation is performed by this record.
## 6. WHAT THIS RECORD DOES NOT DO
No A2 -> A1 transition · no matrix amendment · no certification · no release/tag · no existing certified artifact modified · no product-branch file created by this record (the 63 files are a future, separately-controlled execution) · no amend of `DEC-D7`, `DEC-D14`, `DEC-D15`, `DEC-D17` or `DEC-D25` · no invented historical provenance.
# **D36 RECORDED — 63-FILE EXECUTION AUTHORITY GRANTED · NO A2 -> A1 · NO MATRIX · NO CERTIFICATION · COMMIT/PUSH PENDING.**

## Explicit Exclusions

This D36 authority does NOT authorize:

- Engine Master Matrix changes or amendment;
- Screenshot-to-Certified-Product Parity Matrix changes or amendment;
- engine implementation changes;
- calibration changes;
- frontend changes;
- promotion;
- certification;
- release or tag creation;
- modification of existing certified artifacts;
- unrelated product mutation;
- arbitrary ref movement;
- commit;
- push;

This record does NOT authorize commit or push.
