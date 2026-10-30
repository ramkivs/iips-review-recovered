# IIPS v3.0 CAP-03 — P-1 Q-EV canonical run-record root PA designation act

**Act ID:** `IIPS-V3-CAP03-P1-QEV-RUN-RECORD-ROOT-PA-DESIGNATION-ACT-2026-10-30-01`
**Issued:** 2026-10-30 (Asia/Calcutta)
**Program Authority / sole system owner:** Ramki
**Governance registration:** IRR master tracker §16.222, `CV-CORR-202`, `CHG-2026-10-30-17`, verification range `V1712`–`V1723`.

## 1. Authority and decision

Ramki, acting as Program Authority, expressly approves and issues this Q-EV designation through the direct instruction supplied for this IRR work item on 2026-10-30. This record captures the supplied values as written. It does not infer a path, account name, SID, service identity, enterprise infrastructure, or filesystem fact beyond that instruction.

This act supplements the effective P1-F authorization only to designate the P-1 run-record/evidence root and its owner, purpose, namespace, retention, and recovery boundaries. It does not amend P1-F's single-attempt limit or any other PA decision.

## 2. Exact designation

| Element | Designated value |
|---|---|
| Canonical root | **`H:\IIPS-P1-EVIDENCE`** — exact path; no alternate or equivalent authoritative namespace |
| Accountable operator | **Ramki**, under P1-F |
| Filesystem owner | **The existing personal Windows user account running the authorized operation.** No separate account or identity is created or designated. |
| Security owner | **Ramki**, sole system owner |
| Exclusive purpose | Evidence and run records for the single authorized P-1 attempt only |
| Claim filename | `execute-claim.json`, directly within the designated root |
| Marker filename | `EXECUTE-MARKER.json`, within the unique execute run directory below the designated root |
| Environment | Personal, single-user, non-commercial IIPS installation on one Windows laptop |

The root is not the SQLite store, the PA-13 E10 capture root, PF-15 F5 Gate 4 evidence root, or any other workstream's storage. The claim and marker are derived only under this exact root by Revision 7.

## 3. Single-attempt commitment, retention, and recovery

P1-F authorizes exactly one attempt. This act grants **no second attempt**, retry, replacement attempt, or additional invocation.

1. `execute-claim.json` is acquired exclusively by the existing claim operation and retained permanently. There is no automatic release or deletion. An acquired or indeterminate claim remains even when the script stops before the marker and before a process-start request. Such a stop is NOT CONSUMED under the existing Q-CONS-2 ruling, but the retained claim blocks reuse through the script; it does not permit another attempt.
2. `EXECUTE-MARKER.json` is written durably before the process-start request and retained permanently. A durable marker or the process-start request consumes the attempt, including when operating-system process start fails. There is no retry or repair-and-retry path.
3. Preserve original evidence identity and auditable chain of custody: retain original bytes, hashes, provenance, and ordering. Do not overwrite, replace, rewrite, re-root, or treat a copied artifact as a new authoritative attempt. If an interruption requires later preservation or review, preserve the original identity and chain; it does not create authorization for a second attempt.
4. No alternative path, alias, namespace, or root is authoritative under this act. An incomplete or unsealed run is preserved as such and is not a basis for retry.

## 4. Required execution-time filesystem controls

The root must already exist before any authorized operation; this act does not create or provision it. Revision 7 must retain its fail-closed checks for:

- exact `-EvidenceRoot` equality with `H:\IIPS-P1-EVIDENCE` before canonicalizing or accessing caller-supplied path input;
- an existing directory on a local fixed NTFS volume, not a drive root;
- no SUBST alias and no prohibited reparse point in the path chain;
- no Git worktree in the relevant path chain and no placement in an IRR/IPD worktree;
- separation from the SQLite store and its path chain, with no existing store or prohibited sidecar state;
- no previous P-1 run, claim, or marker state; and
- a read-only comparison that the root's filesystem owner SID equals the SID of the existing personal Windows user account running the operation.

The owner check is read-only metadata inspection and is not the store-parent ACL evaluation. The existing `ACL_EVALUATION` remains a read-only DACL projection only; it is not an effective-access test or proof that any write will succeed. Environment-variable checks for OneDrive roots are not proof of synchronization status. All filesystem facts remain to be checked at execution time; this act does not represent them as satisfied.

The reported `142 GB` free on H: is capacity only. It does not prove that this exact directory exists, is local/fixed NTFS, is owned by the running account, is suitably separated, is unsynchronized, or passes any execution-time gate.

## 5. Revision 7 binding and fail-closed order

The corrected Revision 7 script binds `$EvidenceRootDesignationState` to `DESIGNATED` and `$DesignatedEvidenceRoot` to the exact literal `H:\IIPS-P1-EVIDENCE`. The mandatory `-EvidenceRoot` must match the literal using the script's exact comparison. S00 checks the designation and equality before canonicalization or access to caller-supplied evidence-root input. Claim and marker paths derive from that root. The read-only root-owner comparison is reached only after designation, existence, path-integrity, worktree, store-separation, and environment checks; failure or inability to resolve the owner comparison fails closed before any claim or run directory.

At issuance (2026-10-30), PR #382 was open and unmerged, so this branch publication did not then satisfy the authoritative-main freshness gate. This act alone does not authorize a host operation. After later publication, the current main pointer, script freshness, and all execution-time checks must be read back and verified before any separately authorized invocation. No P-1 Preflight or Execute is performed or authorized by this act itself.

## 6. Unchanged authority and explicit non-effects

P-1 remains **AUTHORIZED — NOT EXECUTED — UNSPENT**. This act does not execute or consume P-1, authorize a host check in this IRR pass, or create any root, store, database, claim, marker, probe, dump, evidence artifact, fixture, or acceptance file.

`P-1-C` remains **NOT ESTABLISHED**. `P-1-D` remains **DESIGNATED / NOT VERIFIED FOR THE ATTEMPT**. Both remain non-blockers, not PASS. PA-06, PA-13, PA-19, PA-20, PA-1 and their waivers, non-runs, or evidence statuses are not reopened or changed. The existing Q-CONS-2/3, Q-MIG, Q-TX, Q-V8, Q-WRITE, and Q-BUILD determinations remain unchanged. No IPD repository or operator-local filesystem was accessed or inspected for this act; no PowerShell parse or host validation is claimed.

## 7. Effect and record status

The PA designation itself is **APPROVED AND ISSUED** by the explicit instruction cited in §1. At issuance, its repository record and script binding were on the existing IRR PR #382 branch, which was OPEN / UNMERGED. A later merge does not itself initiate, preflight, provision, or execute P-1, and does not waive the script's independent authoritative-main freshness and runtime checks. The designation remains limited to the exact single attempt under P1-F.
