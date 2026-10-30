# CAP-03 P-1 Q-EV Operator Verification Evidence and DACL Acceptance

**Record ID:** `IIPS-V3-CAP03-P1-QEV-OPERATOR-VERIFICATION-DACL-ACCEPTANCE-2026-10-30-01`
**Date:** `2026-10-30`
**Authoritative root:** `H:\IIPS-P1-EVIDENCE`
**Tracker allocation:** §16.223 / `CV-CORR-203` / `CHG-2026-10-31-02` / `V1724`–`V1737`

## 1. Purpose and evidentiary basis

This IRR-only record admits the operator's explicit report that read-only Windows PowerShell 5.1 verification of the formally designated Q-EV root completed successfully, and records the operator's explicit acceptance of the inspected existing DACL for the stated personal, single-user, non-commercial laptop environment. It is an operator verification/acceptance record, **not** a new PA act, a second authorization, permission to execute, or evidence that P-1 was run.

The results below are recorded as operator-supplied verification evidence. No raw PowerShell transcript or independent host observation is represented in this record; the agent did not access the operator's filesystem or reproduce the checks. The reported account and SID are included because they were expressly supplied for this record; no other account, service identity, or enterprise principal is inferred.

## 2. Read-only verification results reported by the operator

The operator reports the following checks **performed and passed** for the exact designated root `H:\IIPS-P1-EVIDENCE`:

| Check | Operator-reported result |
|---|---|
| PowerShell host | Windows PowerShell 5.1 verification session: **PASS**. This does not mean the Revision 7 script was parsed or executed. |
| Current Windows account | `DESKTOP-NO0NHTP\USER` |
| Current account SID | `S-1-5-21-1872737340-673410177-2240931581-1001` |
| `H:` volume | Local fixed disk; NTFS; **142.31 GB available** at the time checked. Capacity is a point-in-time capacity observation only. |
| SUBST mapping | No SUBST mapping detected: **PASS** |
| Canonical root | Exists at the exact designated path `H:\IIPS-P1-EVIDENCE`: **PASS** |
| Drive-root exclusion | The designated root is not a drive root: **PASS** |
| Reparse-point checks | **PASS** |
| Git-worktree separation | **PASS** |
| SQLite-store separation | **PASS** |
| Detected OneDrive environment-root check | **PASS**. This is the documented environment-root check only; it does not establish synchronization state. |
| Filesystem owner | Reported root owner matches the current Windows account/SID above: **PASS** |
| Existing execution state | None detected at the time checked |
| `execute-claim.json` | Absent at the time checked |
| `EXECUTE-MARKER.json` | Absent at the time checked |

The absence of prior execution state, claim, and marker is a point-in-time observation. It does not create or renew authorization and must not be treated as a future-state guarantee.

## 3. DACL inspection and explicit operator acceptance

The operator reports inspecting the existing root DACL and expressly accepts it as appropriate for the personal, single-user, non-commercial laptop environment. The reported **inherited** entries are:

| Principal | Inherited permission |
|---|---|
| `BUILTIN\Administrators` | `FullControl` |
| `NT AUTHORITY\SYSTEM` | `FullControl` |
| `NT AUTHORITY\Authenticated Users` | `Modify` |
| `BUILTIN\Users` | `ReadAndExecute` |

The operator's decision is **ACCEPTED AS STATED**. The inherited `Authenticated Users` and `Users` entries are **not blockers**. This record makes no recommendation to tighten, alter, or otherwise change the ACL; no permission change was made or is authorized by this record. No service account or enterprise security arrangement is introduced.

This acceptance is not a claim that a DACL projection proves effective access or actual writability. Revision 7's existing `ACL_EVALUATION` remains its unchanged, read-only DACL projection for the store-parent context; it is not an effective-access or writability test. The root-owner/SID comparison remains distinct from DACL evaluation.

## 4. Result categories and continuing requirements

### Reported performed and passed

Only the read-only observations listed in §2, and the operator's DACL inspection and acceptance in §3, are recorded as completed. They are attributed to the operator and to the time of the reported inspection, not independently verified by this IRR review.

### Not performed and not claimed

The operator report and this record do **not** establish any of the following:

- parsing the Revision 7 PowerShell script;
- executing Revision 7 S00 or S03;
- effective access or successful writability;
- P-1 Preflight or P-1 Execute;
- provisioning, a consuming test, or a second attempt.

No IPD access or write, permission change, directory/store/database/claim/marker/evidence-artifact creation, or P-1 invocation occurred in this work. No filesystem inspection was performed by the agent.

### Execution-time controls remain applicable

Revision 7 must still enforce its exact `-EvidenceRoot` equality to `H:\IIPS-P1-EVIDENCE`, designation-before-caller-path access ordering, canonical-path and path-integrity guards, local fixed-NTFS and non-root checks, SUBST/reparse/worktree checks, SQLite-store separation, OneDrive environment-root check, owner-SID comparison, and no-prior-execution-state/claim/marker check at the authorized invocation. The operator's point-in-time results do not bypass or waive those checks. The existing DACL is preserved and the read-only ACL evaluation is unchanged.

## 5. Readiness reassessment and unchanged authorization

The operator-reported results resolve the previously unverified **Q-EV root, volume, path-separation, owner-match, and existing-state observations for the time checked**; the operator also expressly accepts the existing DACL, so it is not a blocker. This is not an agent host validation, not a claim of effective writability, and not an execution-readiness or execution result.

At the time this operator record was issued, PR #382 was open and unmerged, so the authoritative-main publication gate had not then been satisfied. This record does not itself authorize a host operation. Current readiness must be determined from the latest tracker pointer and independently verified runtime gates. No S00/S03 execution, script parse, Preflight, or Execute is claimed. P-1 remains **AUTHORIZED — NOT EXECUTED — UNSPENT**, with exactly one attempt and no retry or second attempt. `P-1-C` remains **NOT ESTABLISHED** and `P-1-D` remains **DESIGNATED / NOT VERIFIED FOR THE ATTEMPT**; both remain non-blockers, not PASS. No prior PA decision or waiver is reopened or amended. Q-CONS-2/3, Q-MIG, Q-TX, Q-V8, Q-WRITE and Q-BUILD remain unchanged.
