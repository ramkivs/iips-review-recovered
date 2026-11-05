# WS-A — Proposed U1 AMEND-02: evidence-only import-time retention

Date: 2026-11-05. **DRAFT FOR PA DECISION — NOT EFFECTIVE — NO IMPLEMENTATION AUTHORITY GRANTED.**
Proposed identifier (not an assigned PA act): `IIPS-V3-CAP02-U1-AMEND-02-IMPORT-EVIDENCE-RETENTION`.
Companion: `WS-A-IMPORT-TIME-RETENTION-PA-DECISION-PAPER-2026-11-05.md`.

## 1. Form, purpose and precedence

If explicitly adopted by PA, this is a separate additive instrument amending the closed U1 route set only as specified below. Preserve U1, AMEND-01, PF-1 and their receipts byte-identical. AMEND-01's “no write” exclusion is displaced **only for evidence append through the route in §2**. It remains binding everywhere else. No holdings write, durable holdings success, real-user save, W-1 change, gate movement or operational production deployment is authorized.

“Successful import” here means a supported CSV produces a nonempty parsed evidence inventory, whether identities are resolved or unresolved. It does not mean successful portfolio persistence. BLOCKED/REJECTED/empty parses remain local and cause no append. Existing preview non-performed validation, save authorization and holdings persistence fields remain true; evidence retention is a separate outcome.

## 2. One newly admitted route

Admit only `POST /api/broker-import/:portfolioId/evidence` on the existing server/listener/proxy. Existing `GET /api/broker-import/:portfolioId/evidence/:importId` remains the sole retrieval route and keeps its response projection and owner-scoped non-disclosure. No collection GET, enumeration, PUT, PATCH, DELETE, new listener or IPC operation. Other methods on the new path return 405 / Allow: POST. Query strings return static 400. Existing save/revision routes are not repurposed.

Handler order: method → existing C9 first-party hardening (not authentication) → existing local binding precondition → reject query/invalid portfolio shape → uncached trusted evidence-owner resolver → bounded JSON body → strict schema/semantic validation → serialized retention/read-back. Refusals before storage must construct no store or IPC adapter. No credentials or identity are resolved from body, headers, cookies, route values or tokens. No new consent checkbox/token is introduced. This remains the personal single-user deployment, not an internet-facing authenticated service.

## 3. Ownership unchanged

Use the existing carrier and digest verification without normalization or fallback: `SAIRAM` is the display label, `owner-4dc756b3` the canonical owner key, `irr-personal-073dd1c8` the mechanical tenant partition. Use `IIPS_BROKER_EVIDENCE_OWNER_PATH`; no alias of F-3/Reports carriers. Missing, unreadable, malformed, digest-mismatched or changed carrier fails closed at 503. Both partition keys come only from the resolver on every request. Never accept client owner keys or reassign old records.

## 4. Parsed-evidence contract and trust boundary

Add a versioned transport DTO `IIPS_BROKER_IMPORT_EVIDENCE_SUBMISSION_V1` containing only `schema`, `fileName` and a frozen `preview` snapshot. The snapshot uses the existing `BrokerHoldingsPreview` field definitions, including original `asOf`, broker/variant/status, contentDigest, native row inventory, counts, identityAuthority/summary, warnings, rejections and notPerformed flags. No raw CSV, arbitrary persisted record, owner key, recordId, recordDigest, importId, filesystem path or canonical holdings/company identifier is accepted. Route portfolioId supplies portfolioSlot. Unknown keys at every object level fail closed; do not deserialize arbitrary properties into the journal.

Implementation must provide an explicit runtime allowlist/schema (TypeScript casting is insufficient), finite-number and integer/count checks, native row uniqueness/order checks, ISO timestamp and digest-shape checks, nonempty inventory, supported broker/status enums, row/count/summary consistency, bounded nested refusal/warning/quarantine strings and arrays, and fixed not-performed/zero-saved semantics. Preserve the existing preview input limits (1 MiB CSV, 256-character filename); new JSON payload cap is **4 MiB**, maximum **10,000 rows**, maximum string value **4,096 characters**, nesting depth **12**, measured before append. Oversize submission returns 413 without persistence; the preview stays visible with “not retained.” These are submission limits, not journal quotas or purge triggers. The ordinary save route's existing 64 KiB limit is unchanged.

The server **constructs** V1 evidence through the existing builder and derives both identifiers/digests itself; it never trusts supplied record identity or digest. Validate savedRows = 0, canSave = false, persisted = false and NOT_PERFORMED flags. Identity results remain **reported snapshot evidence from the browser's pinned IPD pipeline**, not server-authenticated identity or permission to save. Do not claim the server reran the pipeline. Reusing a SHA-256 value does not authenticate a submission. The response and UI must make that provenance explicit without changing the journal V1 grammar; use the transport/response disclosure. Any need to alter persisted grammar or authority semantics requires a further decision, not silent coercion.

Raw bytes remain browser-local: neither upload nor retention is authorized. Preserve original contentDigest as ingest-reported; do not hash JSON and label it the CSV digest. Without raw bytes the server cannot independently recompute the CSV hash; the existing record limitation remains. A stronger origin guarantee requires Option C and separate authority.

## 5. Integrity, duplicates and retries

- Compute importId using existing broker + contentDigest + original asOf rule. Freeze snapshot, timestamp and filename for the attempt before submitting; explicit retry resends them byte-for-byte. No fresh timestamp or reparsing on retry. New explicit file selection may create a new import identity; this is attempt idempotency, not content-only deduplication.
- Reuse PF-1 `append` dedup and evidence V1 integrity checks; no grammar, digest algorithm or retention-policy change. All reads, including duplicate lookup and immediate read-back, reverify the digest.
- First retained record is authoritative. Before treating a duplicate as successful, compare stable fields of the existing record and candidate. Exclude only recordDigest and the documented per-row volatile quarantineIds; compare every other field including scope, portfolioSlot, filename, timestamp, counts, refusal details and contentDigest. Same importId with any stable difference returns static 409 `EVIDENCE_CONFLICT`, leaves the original unchanged and publishes no record detail. Same ID in a different portfolioSlot is a conflict; do not create an alternate dedup scheme.
- Return the original record digest, never a freshly rebuilt digest on a duplicate. Do not modify original quarantine IDs or append a replacement.
- No automatic retry loop. On timeout or lost response the client says retention is unconfirmed; offer A-9 lookup using the locally derived importId and an explicit same-snapshot retry. A later process retrieves the original if the append committed.

## 6. Partial failure and concurrency boundaries

Evidence append and holdings save are never composed into one transaction: this route calls no portfolio adapter. Preview success may coexist with retention failure; UI must state both separately. No rollback, delete, truncation by the consumer or compensating holdings write.

Serialize all retention attempts within the sole server process for a data directory. Reconstruct the evidence store/index under that serialization for each attempt so a failed write cannot leave a stale cached view. Verify retained record by a fresh journal read before acknowledging. A process-wide queue is **not** an OS lock: operation requires exactly one writer process for that directory, no test writer/manual importer alongside it. The operator must stop the old writer before starting another; do not advertise multi-process writer safety. If this restriction is unacceptable, defer this increment and request separate persistence authority. Do not add PF-1 locking or fsync under this amendment.

PF-1's existing truncated-final-line recovery and malformed-interior failure behavior remain unchanged. A failed append/read-back is 503 `EVIDENCE_UNAVAILABLE`; tamper is 503 `EVIDENCE_TAMPERED`; no exception/path/stack or scope key is returned. Failure after append before acknowledgement is an unknown outcome, not proof of absence. Fresh read plus same-attempt retry reconciles it without duplicate append. No successful response before verified read-back. Durability claim is process-restart recovery using current PF-1, **not** sudden power-loss or filesystem/hardware failure survival; no fsync guarantee exists.

## 7. Response and UI

First append: 201. Equivalent duplicate: 200. Both return a closed acknowledgement `{ outcome: 'EVIDENCE_RETAINED', importId, recordDigest, duplicate, retrievalPath, provenance: 'BROWSER_PIPELINE_SNAPSHOT', holdingsSaved: false }`, with only validated opaque route values in the relative retrieval path. No owner key, journal location, recordId or arbitrary preview field in this acknowledgement. Non-success returns static outcome/reason only.

The client then performs the existing A-9 GET and compares importId, contentDigest and original retained recordDigest before displaying “evidence retained and retrievable.” If acknowledgement succeeded but GET fails, display “retention acknowledged; retrieval not verified” and offer lookup, never falsely report loss. UI retains original snapshot for explicit retry while mounted; after browser loss, recovery by known importId is possible, but there is no enumeration endpoint. Clear/new-selection sequence guards prevent late responses restoring stale personal evidence; clearing UI does not delete committed records or pretend cancellation reversed an append. Do not use browser durable storage for the CSV/snapshot.

Correct the current disclosure to distinguish capability/policy from per-attempt confirmation. Retain indefinite local evidence policy, no raw-byte upload/storage, no third-party transmission, no automatic purge, 50 MiB review-only threshold and “holdings not saved.” Expose failure and unconfirmed states accessibly.

## 8. Bounded files and operational obligations

Allowed: new evidence DTO/client and validator/handler under `frontend/src/api/` and `frontend/server/broker-import/`; the existing preview component/API only for frozen submission state/ID helper; `brokerImportHttp.ts` route matching/delegation; evidence store consumer methods for stable duplicate comparison/read-back if needed; associated targeted unit/HTTP/component/restart tests and operator documentation. Preserve existing builder/digest semantics. No changes to PF-1, owner-carrier canonical bytes, holdings adapters, IPC operations, dependency pins/lockfiles, workflows, engines, datasets or authority acts.

Operator runbook must state the single-writer restriction, server-owned data directory/carrier outside Git, failure recovery without re-import replacement, owner-local backup and fresh-process read verification. No backup transmission, new deletion tool, deletion endpoint, automatic purge, quota deletion, expiry or compaction. Existing O-1 storage visibility and O-2 backup/recovery protections continue unchanged. Threshold crossing never blocks an append.

## 9. Required evidence / effectiveness

Adoption must be explicit PA adoption of this bounded scope, not inferred from publishing this draft. Record adoption separately with the actual decision date; publish and independently verify its bytes and effectiveness before implementation. Existing decisions 5/6/7 need no reapproval. No authority is rendered by Arena in this paper.

After adoption/effectiveness, implement and execute the acceptance matrix in companion §4, publish exact commands/results and hashes, verify remote PR head and merged-main checks and independently read changed paths from merged main. Stop rather than broaden authority if implementation requires PF-1 mutation, raw CSV upload, multi-writer guarantees or holdings writes. Until then the objective is blocked by **import-time evidence write authority**, not an A-9 retrieval defect.
