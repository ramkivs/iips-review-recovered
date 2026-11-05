# WS-A — Proposed additive owner-controlled evidence deletion amendment

Date: 2026-11-06. **DRAFT FOR PA DECISION — NOT ADOPTED — NOT EFFECTIVE.**
**Act ID: UNASSIGNED.** This is a proposal title, not an Act ID, reserved sequence or authority rendering. No existing Act ID is reused. A later explicit PA adoption must re-census the authoritative registry and assign a unique dated/sequenced identifier using its established conventions. Do not infer an amendment number from this filename.

Companion: `WS-A-OWNER-EVIDENCE-DELETION-PA-DECISION-PAPER-2026-11-06.md`.
No decision, signature, approval ID or effective date is fabricated. Publication of this draft does not constitute adoption. All clauses below are proposed, operative only after explicit adoption/effectiveness and a separate authorized implementation task.

## 1. Narrow purpose and precedence — proposed

Give effect to AMEND-01 §4.5's explicit outside-HTTP owner-deletion principle through one **offline whole-active-journal reset with retained owner-local recovery copy**. Preserve indefinite retention until explicit owner action and the 50 MiB warning-only rule. Do not alter PF-1, A-9 retrieval, the evidence record/digest grammar, AMEND-02 live import contract or frozen authority files. No exception for an HTTP deletion operation is proposed.

This additive act, if adopted, would authorize the bounded offline workflow/tool and minimal deletion-fact audit described below, not merely endorse the old abbreviated filesystem recipe. Existing instruments remain frozen. It would not authorize immediate deletion of actual owner evidence: each real operation still requires the owner confirmation and runtime preconditions in §§3–5 after implementation qualification.

## 2. Adopted-model candidate and data scope — proposed

Candidate decision: choose **clear all active broker-import evidence, recovery copies retained**. Other alternatives in companion §4 are not included. No single-record deletion, tombstones, data migration, selective rewrite, backup removal or secure-erasure promise.

Only the regular file at the resolved server-owned `$IIPS_DATA_DIR/journal.ndjson`, outside any Git worktree, may be considered. No recursively selected directory, arbitrary command-line target, glob, network/cloud path, symlink, hardlink or ambiguous alias is allowed. Any inability to prove a single unaliased target fails closed. No relocation of the evidence journal. The existing owner carrier remains unchanged: label SAIRAM, canonical `owner-4dc756b3`, mechanical tenant `irr-personal-073dd1c8`. All file events must belong to this exact carrier-derived scope and the supported evidence schema; any foreign or unrelated content blocks the whole reset. Never delete a filtered subset from a mixed journal.

Affected payload: all parsed evidence records and their embedded event/history/dedup state in that one active file, with the original byte-exact journal preserved in a local recovery copy. Unaffected: carrier, other domain subdirectories, holdings/transactions, raw CSVs, existing backups, Git records and every other repository. A missing/empty active journal is an explicitly reported no-op, not proof of an earlier successful operation and never permission to remove a directory.

## 3. Owner authorization, planning and confirmation — proposed

An offline owner-operated local tool may offer two distinct phases: byte-preserving **plan** and explicitly confirmed **execute**. It may not register a listener, route, background task or scheduled action. Existing carrier integrity/equality binding alone is not authentication; require local OS-owner-controlled access and explicit owner confirmation. A request/local argument containing an owner ID or SAIRAM is never sufficient authorization. Fail closed if the trusted carrier is missing, unreadable, malformed, changed or digest-mismatched.

Before planning/execution, stop and verify cessation of every server/writer for the directory and close stale browser import sessions. Require explicit owner attestation of sole-writer quiescence; inability to establish it blocks execution. No cross-process locking or fsync guarantee may be claimed. Concurrent arbitrary filesystem modification by another administrator remains outside the supported model; no attempt to silently compensate for it.

Plan by raw read-only filesystem inspection: no PF-1 construction or automatic truncated-tail repair. Parse version/events without modifying them; validate whole-file structure, every record's digest/import identity/order and every scope. Reject unknown events, malformed final/interior content, tampering, mixed owners/schemas and stale identity. Include exact target identity, byte size, whole-file SHA-256, owner scope, event/record counts, unique backup location and disposition. Runtime plans stay local outside Git and disclose no row values. No destructive action while preparing a plan.

Confirmation must state: **all active broker evidence**, selected opaque scope/count/bytes/hash, **original data remains in backups**, no permanent erasure, and backup restoration can reverse the reset. Require affirmative confirmation tied to that exact plan, not default Yes, a reusable environment flag, wildcard or stale approval. A changed file identity/content/hash, target, carrier, counts or backup plan invalidates confirmation. Recheck immediately before each destructive step. If robust checks cannot be implemented without forbidden persistence changes, stop and seek the narrow further PA decision.

## 4. Backup-first execution and minimal audit — proposed

A later implementation may, after confirmed plan validation:

1. Create a unique, permission-restricted byte-exact copy in the owner's approved same-machine server-owned backup location, without overwriting an existing backup. Verify source unchanged, whole-file copy hash and every evidence digest/structure. No move, remote transmission or automatic backup discovery/deletion. The approved path is not a general filesystem-write primitive.
2. Write a **PREPARED** append-only deletion-fact entry outside the evidence journal, local and OS-restricted. Grammar must be closed/versioned for operation identifier, opaque scope, plan/hash/count/bytes, retained-backup disposition, phase/outcome and timestamps. Do not include rows, raw CSV, source filenames, refusal details or per-import identity lists. No new import-retention mechanism, PF-1 record type or tombstone index. This administrative audit survives the reset and is not claimed erased.
3. Revalidate confirmed source/carrier and retained verified backup. Remove only the one active file; do not rewrite or compact it or remove surviving records selectively. Verify active path absent.
4. Append **COMPLETED** only after absence verification and audit write succeed. Display an explicit local confirmation: all active evidence cleared, recovery copy retained, with the operation reference and retained-backup disposition. No successful completion if audit/verification fails. No automatic host restart, restore or later backup destruction.

If no backup can be verified or no prepared fact can be durably recorded within the supported process-restart model, do not remove the active file. This does not claim fsync-backed power-loss atomicity. OS-level unlink is not secure overwrite, SSD erasure or destruction of snapshots/copies. Full erasure of copies would need separate backup-destruction/O-2 authority and owner risk acceptance.

## 5. Interrupted execution and recovery — proposed

| Observed phase | Required later behavior |
|---|---|
| Before verified backup / PREPARED | Active bytes unchanged; no deletion success. Retain any incomplete local copy as unverified and report it; never auto-prune it |
| PREPARED, active original still matches | Report not completed; no automatic resume. A fresh validated owner confirmation is required for any new destructive attempt |
| Active path absent, no completed receipt | Report **INCOMPLETE / OUTCOME UNKNOWN**, not success or proof of unauthorized absence. Reconcile against prepared plan and verified backup while host remains stopped; never infer permission to delete other files |
| Active file changed/recreated or artifacts contradict | Stop. Preserve all existing files; no overwrite, automatic rollback, second unlink or manufactured completion |
| COMPLETED with verified absent active path | Reset completed within stated scope. Starting a fresh host creates new state on a later append; known old IDs are absent unless reintroduced |

Completion-record failure after unlink cannot be compensated by silent restore or false success. A separate owner-confirmed reconciliation may record the actual observed outcome without fabricating a completed phase. Tests must inject process termination before/after each phase. No additional durability guarantee is implied for sudden power loss; if artifacts cannot establish state, classify it unknown.

Undo is a distinct explicit owner decision: stop all writers, verify original recovery-copy bytes/record digests against the retained manifest and confirm no newer active history exists before restoring. Never overwrite a new journal. Restore deliberately reverses the reset and can make old IDs visible again. No automatic restore/replay suppression or tombstone semantics are added. New imports remain governed by AMEND-02; an old snapshot resubmission can recreate an ID after reset, so close stale clients and make no permanent-ID-suppression promise. Re-importing with a new timestamp is new evidence, not restoration of the first retained record.

## 6. Bounded future implementation and acceptance — proposed

If separately adopted and effective, permit only an IRR-owned **offline** planner/executor, its strict plan/confirmation and minimal audit contract, temporary-fixture tests and additive operator/governance documentation. Files would be confined to a dedicated offline broker-evidence maintenance module/tool under `frontend/server/broker-import/`, associated tests and operator docs. No shared PF-1 or live HTTP/GET/POST handler, owner-carrier canonical bytes, evidence schema/digest algorithm, dependency pin/lockfile or workflow mutation is authorized. Reuse pure digest utilities if useful; do not instantiate mutating recovery services for planning.

The complete acceptance criteria in companion paper §6 are mandatory: whole-file scope/corruption/alias/quiescence rejection without mutation; plan-bound cancel/confirmation; backup verification; audit-before-unlink; phase-fault/kill and unknown-outcome handling; foreign-owner preservation; fresh-host opaque A-9 absence; unchanged other domains; original-byte restore only by explicit decision and without overwriting new history; targeted safety/static/integration tests and remote publication verification. Tests operate only on temporary synthetic fixtures, never actual owner's evidence. Engineering must publish test transcripts and independent exact-head/merged-main/read-back evidence. Implementation merged and deletion executed are separate states.

## 7. Explicit exclusions and effectiveness — proposed

No PF-1 modification; HTTP DELETE or any destructive HTTP endpoint; per-record delete/tombstone; automatic expiry/purge/compaction; selective journal rewrite/migration; indefinite-policy change; holdings/transaction write; W-1 change; raw CSV upload; deletion of backups or unrelated files; secure-media erasure; authentication/tenant architecture expansion; IPD mutation; production activation; changes to frozen A-8/A-9 or effective retention instruments.

For future effectiveness: an explicit PA decision selecting this model and exact scope; a newly assigned unique registered Act ID in a separate dated adoption instrument; immutable proposal/acceptance references; publication on IRR main after applicable checks; independent remote read-back and an additive effectiveness receipt. No implementation before discharge. Adoption does not itself execute any reset; each real deletion still needs its explicit owner plan/confirmation and qualified implementation. Until then **PA DECISION PENDING / ACT ID UNASSIGNED / NEW AMENDMENT NOT EFFECTIVE / NEW IMPLEMENTATION NOT AUTHORIZED / DELETION TOOLING NOT IMPLEMENTED**. The existing outside-HTTP manual principle remains unchanged.
