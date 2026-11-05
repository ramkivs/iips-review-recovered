# WS-A — Owner-controlled evidence deletion: PA decision paper

Date: 2026-11-06. Baseline: IRR main `d847de35fb1f1894374b8025e5a8c1008e5bbc3b`.
**INVESTIGATION COMPLETE — PROPOSAL ONLY — PA DECISION PENDING.** No new amendment is effective; no deletion implementation is authorized by this paper or task. Existing indefinite, explicit-owner-only retention remains effective.

## 1. Plain-English decision

The app can keep and retrieve broker-import evidence, but it has no button, API or supported library call to delete one evidence record. Today the owner can remove the entire active evidence journal outside the app, as documented in runbook §10.5. That removes every record in that file, including its embedded history. The suggested backup keeps a copy, so this is a reversible clearing of the active store, **not erasure of all copies**.

**Arena recommends a bounded offline, owner-confirmed whole-journal reset with a verified owner-local recovery copy and a minimal deletion-fact receipt.** Implement it only after a separate PA adoption and effective publication. It is the simplest model that avoids changing PF-1, introducing tombstone state or rewriting surviving records. Call it **“clear all active broker evidence; recovery copy retained”**, not “permanently erase evidence.” No HTTP/GUI deletion surface is recommended. Single-record deletion and removal from backups should remain deferred decisions.

This recommendation intentionally does not meet a different objective of permanently erasing one import from every backup. If that is the PA's objective, do not adopt this as a substitute: choose the broader physical-removal decision in §4 with its additional authority requirements.

## 2. Publication count reconciliation — no implementation/test repetition

| Counting scope | Exact baseline / end | Distinct paths |
|---|---|---:|
| PR #454 implementation | `9d3f668e457a33afc8ce67f60b2b28d71f1b08a3` → `bf252e83d57d0322f9b5938f154ea025978c48ba` | **24** |
| PR #455 receipt increment | `bf252e83…` → `d847de35fb1f1894374b8025e5a8c1008e5bbc3b` | **5** |
| Shared between those PR file sets | Tracker and R2 report | **2** |
| Cumulative final verification | `9d3f668e…` → `d847de35…`; union of both PR sets | **27** |

Formula: **24 + 5 − 2 = 27**. Adding the two PR counts without deduplication gives 29 path occurrences, not 29 unique files. PR #455 introduces three new paths: the publication receipt and `implementation-ci.json` / `implementation-remote-readback.json`; its other two paths extend tracker/R2 already changed by #454. PR #454's 24 consist of 12 frontend paths, 8 evidence paths, 3 docs paths and the tracker. The cumulative 27 consist of 12 frontend, 10 evidence, 4 docs and the tracker. These are changed paths including new files, not code-file counts, line counts, commits, test cases or protected-file verification counts (the separate 28 refers to boundary blobs).

Fresh GitHub merged-PR file sets agree with Git diffs at the above exact commits. The independent final verification comment on PR #455 counts the cumulative 27, whereas the implementation receipt counts #454's 24. **No numerical correction is needed.** This section is the additive clarification of ambiguous scope labels; previous records and manifests remain unchanged. No implementation or live test was repeated.

## 3. Architecture and present authority — source findings

### 3.1 Governing instruments

The broker-import A-8/A-9 are the WS-A retrieval work, not the unrelated NP-12 screener records. Reviewed: A-8 amendment package; effective U1 AMEND-01 `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`, especially §§4.5, 8.3(16), 11(1), 14; A-9 implementation and current R2/tracker; effective U1 AMEND-02 `IIPS-V3-CAP02-U1-AMEND-02-IMPORT-EVIDENCE-RETENTION-2026-11-05-01`, immutable proposal §§6–9 and effectiveness receipt; PF-1; runbook §§10–11.

AMEND-01 §4.5 explicitly authorizes owner-controlled deletion **in principle**, exercised by explicit local filesystem action outside HTTP without a further act. It leaves in-product deletion to a further PA act and requires any future deletion path to preserve exact owner scope, non-disclosure, fail-closed behavior, non-enumeration and append-only audit of the fact. AMEND-02 grants only evidence append/read-back composition; it explicitly excludes new deletion tooling, DELETE, purge/compaction and PF-1 changes. Neither supplies a per-record deletion contract. This task grants documentation/publication, **not permission to carry out even the existing manual reset**.

### 3.2 PF-1 and A-9

- `frontend/server/persistence/persistence-service.ts` has exactly append, scoped read/list/exists and updateReadState. `read` is a notification-style read-state flag, **not a deleted flag**. Journal format V1 replays `create` and `readState`; no delete/tombstone operation or compaction exists. Unknown operations do not create a supported deletion contract; appending one cannot make deletion safe.
- The journal is `journal.ndjson`, version header plus events; recordId is UUID, scoped dedup key resolves to first retained record, indexes are rebuilt in memory. Whole-journal removal loses original events, ordering/sequence and dedup state. A later append creates a new header/history. There is no deletion-denylist; restoring old data or resubmitting an old snapshot can make that importId appear again.
- Load may rewrite the valid prefix if the final line is truncated. It is therefore **not a byte-preserving read-only inspector**. This investigation instantiated no operational PF-1 service and touched no customer data. A future deletion planner must inspect raw bytes without invoking that recovery path and refuse malformed/tampered input, not “repair” it while planning.
- A-9 uses owner-scoped `readByImportId`, re-verifies the evidence digest and withholds owner keys. Absent evidence yields opaque 404. Its comments mention “tombstoned” as non-disclosure vocabulary; **no tombstone state, filter or producer is implemented**. Appending a marker today would neither hide the original nor remove its bytes/dedup entry.
- There is no filesystem audit of a manual unlink, application confirmation dialogue or interrupted-deletion state machine. UI Clear clears browser state only. HTTP DELETE is refused, including on the submission and retrieval paths. No application-level selective physical deletion is supported.

### 3.3 Whole-journal safety is conditional, not owner-enforced by unlink

The app's source layout places evidence at `$IIPS_DATA_DIR/journal.ndjson`; Watchlists, Collaboration and Settings use their own subdirectories. That is a layout finding, **not a census of the actual runtime file**. PF-1 is consumer-neutral and can contain any caller's payload or multiple owner scopes. A filesystem unlink does not call tenant/owner checks; an OS user able to alter the file can remove every owner's records in it. Existing partition keys and the SHA-256 carrier pin are equality/integrity binding, **not authentication or OS credentials**.

Thus nothing in PF-1 itself prevents cross-owner filesystem deletion. OS access control and exclusive owner operation are the current external boundary. A safe future tool must stop all writers, resolve the existing trusted carrier (`owner-4dc756b3`, `irr-personal-073dd1c8`), examine **every event** and refuse the whole action if any foreign scope, unrelated schema, invalid digest, unsupported version/event or ambiguous content exists. Filtering a scoped list is insufficient: it could hide foreign records about to be deleted. SAIRAM remains a label only.

### 3.4 Backups, interruption and audit gaps

Runbook §10.4 copies the file locally and compares hashes; §10.5 copies before removing the active file. Backups remain on the same server-owned filesystem, no cloud/third party. The backup instructions do not themselves establish a quiescent consistent snapshot; writers must be stopped. Restore currently copies a backup into the active path and re-verifies a known record; it can **resurrect deleted evidence** or overwrite newer history if used incorrectly.

A record digest detects changes to that record; it does not authenticate the whole file, prove that no records were removed, prove backup freshness or prove that a particular restore is allowed. A valid older backup can pass record verification and still resurrect an intentionally cleared import. The runbook's broad “backup whose digest does not match will fail closed” wording must not be read as an automatic whole-file SHA comparison by PF-1/A-9; the operator must compare the saved external hash. Hashes are not signatures against an actor able to rewrite both data and hashes.

The existing short manual procedure has no transactional protocol: failure before unlink may leave backup + active file; failure after unlink may leave backup only; active writers/cached indexes or a later POST can recreate state; failure in a multi-file backup removal can leave only some copies deleted. No app receipt proves which phase completed. PF-1 has no cross-process writer lock or explicit fsync; do not claim crash/power-loss atomic deletion or secure erasure. A process kill, OS crash, filesystem and physical-media erasure are different failure domains.

## 4. Practical alternatives and required authority

| Option | Benefits | Risks / what remains | Authority needed |
|---|---|---|---|
| Keep current manual whole-journal action / defer | No new code; already documented policy | Coarse, no automatic whole-file ownership check/audit; backup retained; operator interruption risks | Existing explicit-local-owner principle only; this task executes nothing. Better operational cautions can be published now |
| **Offline verified whole-journal reset with retained local recovery copy (recommended)** | Smallest safe supported workflow; no PF-1 or A-9 changes; reversible; preserves original bytes in backup | Deletes **all active** evidence, not one; originals still in backup; no hard anti-resurrection promise | New bounded PA adoption for an offline planner/executor, external deletion-fact audit and confirmation/recovery contract; existing O-2 locality preserved |
| Per-record logical deletion / tombstones | Could hide one record without rewriting source history, retain audit and idempotent deny decision | Data still present in journal/backups; new consumer schema/filter/index, retry/dedup and restore semantics; old readers may disclose; not physical deletion | Separate PA decision for tombstone grammar, all readers/writers/restores and migration/compatibility. PF-1 changes not inherently necessary for a consumer marker, but current PF-1/read contract does not implement it and current authority grants no marker/filter |
| Per-record physical removal | Selected payload gone from active file while survivors might remain | Rewrite must handle every related event/dedup/order and digest/audit invariant, crashes, foreign data and backups; casual line editing unsafe; raw disk residue remains | Separate explicit bounded journal rewrite/migration/compaction authority, certification/format disposition as needed. No such authority exists; cannot smuggle this in as library usage |
| Physical removal of whole journal **and all known backups** | Closer to owner's privacy objective; no selected-record rewrite | Irreversible recovery loss, interrupted multi-file deletion, untracked copies/snapshots/SSD residue; no guarantee of universal erasure | New explicit backup-destruction/O-2 disposition, exact path inventory, confirmations and residual-risk acceptance; secure media erasure would be still broader authority, not proposed |

Deleting one record is not safe through any currently supported API. Physically editing an NDJSON line is technically possible for a filesystem administrator, but **unsupported**, not newly authorized, and can break readState references, first-record dedup/audit history, ownership and backup consistency. No deletion implementation authority follows from this analysis.

## 5. Recommended PA decision and exact data effects

Adopt only the companion draft's **offline active-store reset model** and acceptance requirements; defer tombstones, per-record physical removal and backup destruction. A single PA adoption can settle this whole bounded model; no repeated routine approval is proposed. There is no adoption in this task.

Affected data after a future explicitly confirmed action: the one verified active evidence journal, containing parsed native rows, source/timestamp/digests, identity/refusal evidence, warnings and embedded import/audit metadata for **all imports in the approved opaque owner scope**. The whole file is removed, not edited or compacted. Its exact original bytes are retained in one verified owner-local recovery copy. Existing backups are left untouched and identified in the plan. Carrier, policy, watchlists/collaboration/settings, portfolio/holdings/transactions, raw CSV source, Git evidence and other repositories are untouched. An empty/missing journal is a separately confirmed no-op, never permission to delete a directory or backup.

New data proposed for later implementation: a minimal append-only **deletion-fact audit outside the PF-1 journal**, containing operation identifier, opaque scope, plan/file hashes, counts/bytes, backup-retained disposition, phase/outcome and timestamps. No CSV, row values, refusal details, filenames or per-import identity inventory in that audit. It survives reset, is permission-restricted and local-only. It is intentionally retained audit metadata, not evidence payload erasure. This new audit artifact requires explicit adoption; it is not created now and must not be confused with a new import-retention mechanism.

Authorization: established server-owned carrier **plus** local OS-owner access, all hosts/writers stopped, no browser deletion action, no owner supplied by a request. Confirmation must spell out all active evidence, retained backups, irreversible active-path effect, scope/count/bytes and original file hash. A fresh plan must be explicitly accepted; no default Yes, wildcard, environment-only confirmation or reused plan after state changes. Hash/identity/path/census changes invalidate confirmation.

## 6. Acceptance criteria for a later adopted implementation

1. Raw, read-only planning does not instantiate PF-1, mutate a truncated tail, write evidence or execute deletion. Every event/payload is validated, including schema, scope, row order, record and import digest semantics; count and byte/hash inventory is exact. Mixed/foreign/unknown/malformed/tampered data, symlink/hardlink/path ambiguity, unsupported version and active/unconfirmed writer state fail closed.
2. Existing carrier bytes/digest and opaque owner are required; a client/local argument named SAIRAM or a supplied owner ID never authorizes a target. Whole-file foreign-scope fixtures remain byte-identical after refusal. Only the approved regular journal file outside Git is selectable; never recursive directory deletion or arbitrary paths.
3. Explicit dry-run/confirmation binds immutable journal identity/hash/count, target and backup location/disposition; cancel, changed plan, stale file, absent audit ability or absent backup ability produces zero deletion. A missing file is not presumed proof of prior authorized completion.
4. Writer quiescence is an enforced operator precondition, not a claimed OS lock. Original bytes are copied to a unique local permission-restricted backup and fully hash/structure/record-verified before unlink. Existing backups are never overwritten, moved, pruned or transmitted.
5. Minimal prepared deletion-fact entry is recorded before destructive action. Only then remove the active journal, verify absence, record completion and present confirmation. No success if final confirmation/audit fails. Inject failures before/after each phase, cancellation, kill and missing/tampered artifact cases; restart shows unchanged active file or explicit incomplete/unknown state, never automatic continued deletion/restoration or automatic success.
6. Completed reset followed by fresh host start gives A-9 opaque 404 for former IDs and preserves carrier, other domains and policy. Closing stale browser attempts and a new later import are required operational steps. No promise of permanent ID suppression: a new submission or backup restore can repopulate the journal under existing append rules.
7. Undo is a new explicit owner action while all writers are stopped and no newer active history exists; verified restore of the original bytes reproduces original digests. Never reconstruct from a digest or re-import and call it restoration; never overwrite new history. Restore is disclosed as reversing the reset; backups remain retained unless a separate explicit backup-removal decision is effective.
8. Scope verification, real offline filesystem integration in temporary fixtures, interruption/recovery tests and relevant existing integrity/owner-safety regression must be published by later engineering. No real personal data deletion to prove tests. Record exact head/merged-main checks and independent remote read-back. No new PF-1/interface/digest/route change.

## 7. Additive cautions and status

Runbook §§10.2/10.5 are historical, not a guarantee that the current file has one owner or an instruction to execute during this investigation. Its re-import advice is **new evidence acquisition, never restoration of the retained original**. See dated additive runbook §12: stop all writers, verify whole-file scope and backup first; do not execute the short recipe on an unverified/mixed journal. No new deletion command is supplied by this paper.

Status: investigation complete; decision-ready draft prepared; publication pending until this task merges/verifies it; **PA decision PENDING; new amendment NOT EFFECTIVE; new implementation NOT AUTHORIZED; deletion tooling NOT IMPLEMENTED.** Existing explicit-owner manual whole-journal capability remains as described, not expanded. Retention stays indefinite; 50 MiB is review-only; W-1 and every repository boundary unchanged.
