# WS-A — Owner-controlled active evidence reset: PA adoption act

**Act ID: `IIPS-V3-CAP02-OWNER-EVIDENCE-RESET-2026-11-06-01`**
Date: 2026-11-06. PA: Ramki. Separate additive instrument; IRR authoritative main baseline `eecdb65965fb982707d733ecbea73424d17bb384`.

## 1. Explicit decision and registration

The PA direction in this session is **“ADOPT Arena's recommended bounded deletion model”**:
**“Offline, explicitly owner-confirmed whole-active-journal reset, with a verified local recovery copy retained.”**
The PA expressly directs formal adoption, assignment/registration of a new Act ID, effective publication and then implementation and verification sequentially in this same execution. This is not inferred standing authority. No signature, unobserved approval timestamp or third-party authorization is fabricated.

The above ID is newly assigned under that express registration direction and registered in tracker §16.259. A full tracked-file census at the verified baseline found **zero** prior exact occurrences; the former draft's ID remains UNASSIGNED historically. No ID is reused and no prospective ID is attributed to that draft. Evidence: `evidence/integration/ws-a-owner-reset-2026-11-06/rebaseline.json`.

## 2. Exact incorporation; frozen instruments preserved

Adopt the exact proposed amendment §§1–7 and companion paper §6 acceptance criteria published in PR #457, independently verified by PR #458 and freshly remote-read in this session:

- `WS-A-OWNER-EVIDENCE-DELETION-PROPOSED-ADDITIVE-AMENDMENT-2026-11-06.md`, SHA-256 **`1adea0dd3f172e65a5bdba612dcee6b4fa4c570a6caba8eb083ca35356de35f5`**.
- `WS-A-OWNER-EVIDENCE-DELETION-PA-DECISION-PAPER-2026-11-06.md`, SHA-256 **`0b9f9a9f7101efed23610200890180eadb061536c57c9ac018101c089f7c4063`**.
- PR #457 merge `82406dd8828296ac425eb5a4827f581da6c89257`; PR #458 receipt merge `eecdb65965fb982707d733ecbea73424d17bb384`.

No proposal wording is changed. Historic pending/unassigned labels remain factual for their publication date; this later explicit decision adopts their operative scope. All A-8/A-9, U1 AMEND-01, Live Retention AMEND-02, PF-1 and owner instruments remain byte-identical. This instrument supplies only the previously reserved offline tooling/audit authority, not an HTTP or PF-1 exception. Completed investigation and publication-count reconciliation are not repeated.

## 3. Adopted bounded model

The **entire approved active journal** is the deletion unit, never individual imports. Clear only the verified regular `$IIPS_DATA_DIR/journal.ndjson` file, not a directory, surviving records, backup, carrier or other domain. Validate every journal event and payload against the existing evidence schema, digest/import identity, order and trusted scope; foreign/mixed/unrelated/unknown/malformed content blocks the entire reset. No repair during planning; no PF-1 construction that could rewrite a truncated tail.

SAIRAM remains display-only; canonical owner **`owner-4dc756b3`**, mechanical tenant **`irr-personal-073dd1c8`**, existing digest-bound trusted carrier. OS-owner-controlled access plus explicit owner confirmation is required; a supplied ID/name is not authentication. Reject symlinks/hardlinks, unexpected or ambiguous paths, Git/network targets, invalid carrier and inability to establish single-writer quiescence. Stop all hosts/writers and close stale import sessions; explicit owner attestation is an operational precondition, not a cross-process lock.

Planning is raw read-only and binds target identity/content SHA-256/count/bytes, scope, unique retained-copy path and backup disposition. Execute requires fresh affirmative confirmation of that exact plan immediately before removal; cancellation, stale data/identity/carrier/path/backup or confirmation for another plan permits no destructive action. Missing/empty target is a separately confirmed no-op, not proof of a previous successful reset.

Before unlink: unique permission-restricted same-machine owner-local recovery copy, verified byte-complete and structure/record/hash-valid; minimal append-only deletion-fact PREPARED entry outside the evidence journal. Recheck target/carrier/copy. Unlink only the approved active file; verify absence; record COMPLETED and only then report reset success. Audit contains operation/plan identity, scope, target reference/hash/count/bytes, confirmation fact, phase/timestamps/outcome and retained-copy disposition, never rows/raw CSV/source filenames/refusal details/per-import identity lists. Audit survives reset intentionally; this is administrative evidence, not a second import-retention mechanism.

Preserve incomplete copies and phase evidence; failure before backup/PREPARED leaves active bytes unchanged; absent target without completion is INCOMPLETE/UNKNOWN, not success. Changed/recreated targets or contradictory artifacts require stop, no automatic resume, rollback, second unlink or restore. Completion/audit failure after unlink must not be reported as success. Later reconciliation observes state without manufacturing completion. Existing backups remain untouched.

This is **active-store clearing, NOT permanent erasure**. The original recovery copy is retained, and restoring it can restore previously cleared evidence. No erasure from backups/snapshots/media, anti-resurrection denylist or physical secure-erasure promise. Indefinite retention continues until an explicit confirmed reset. Restore requires another explicit owner action, stopped writers, verified original bytes and no newer active history to overwrite; it is not automatic and re-importing is not restoration.

## 4. Authorized implementation and qualification

Once §5 is discharged, implement only the adopted offline planner/executor, minimal closed/versioned audit and plan/confirmation contract, isolated temporary-fixture tests and additive operator/governance documentation. Dedicated tool/modules under `frontend/server/broker-import/`; no live route wiring, shared persistence/interface/schema/digest changes, dependencies or workflow mutation. A fail-closed OS/platform/filesystem support boundary is acceptable and must be explicit, not a claim of unimplemented ACL/locking guarantees.

The exact adopted paper §6 acceptance criteria and this session's required sixteen checks are binding: correct target; wrong/ambiguous target; owner/carrier; foreign preservation; absent/wrong/stale confirmation; verified backup-before-unlink; backup failure; whole-file clearing; retained/restorable copy; interruption at every phase and truthful recovery; explicit restore/resurrection; no remote delete; frozen interface/authority preservation. Use synthetic isolated data only, no operational owner reset. Publish targeted tests/typechecks/static checks, real offline integration, exact-head/merged-main checks and independent remote read-back. Authority effective, implementation merged, isolated operational verification and actual owner-data execution are distinct statuses.

No per-record/tombstone deletion, journal rewrite, HTTP DELETE/remote destructive route, automatic expiry/purge/compaction, backup destruction, holdings/transactions, W-1 change, raw upload, IPD/Market Data mutation, multi-user architecture or production deployment/activation. Single OS writer is mandatory; no explicit fsync/power-loss or cross-process lock guarantee is introduced.

## 5. Effectiveness and dependency sequence

This PA decision is **RENDERED; effectiveness conditional on publication and verification**. It becomes EFFECTIVE after: (i) this registered explicit adoption is merged through a fresh PR to authoritative IRR main; (ii) applicable exact-head and merged-main static checks pass; (iii) independent remote byte read-back verifies the instrument, exact incorporated references and frozen boundaries; (iv) a separate additive effectiveness receipt records objective discharge and coordinates. Receipt publication is authorized, not a new PA decision; do not embed prospective merge hashes or edit this frozen rendering.

After effective authority is established and its receipt published/verified, continue immediately with implementation in this same session, as expressly directed by the PA. No repeated approval or handoff is required. No engineering write path or actual owner-data deletion is authorized before effectiveness. Final implementation publication/verification receipts and additive tracker/R2/runbook updates are authorized. No reset of actual personal evidence is executed by this session.
