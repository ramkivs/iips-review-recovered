# WS-A — Live Evidence Retention implementation and acceptance record

Date: 2026-11-05. Authoritative start: IRR `main@9d3f668e457a33afc8ce67f60b2b28d71f1b08a3`.
Session branch: `arena/a2d13da4-iips-review-recovered`; initial working tree clean; no pre-existing local work overwritten.
Authority: **`IIPS-V3-CAP02-U1-AMEND-02-IMPORT-EVIDENCE-RETENTION-2026-11-05-01`**, PR #452 adoption / PR #453 effectiveness. Exact act, receipt, PR #450 proposal and acceptance paper were independently read through GitHub contents API and hash-compared before implementation; see `authority-rebaseline.json`.

**Status at authoring: IMPLEMENTED — END-TO-END VERIFIED LOCALLY; PUBLICATION/REMOTE VERIFICATION PENDING.** Subsequent dated receipts carry the final publication coordinates and current status without rewriting this record. No production activation/deployment was performed.

## 1. What changed / what did not

| File | Role |
|---|---|
| `frontend/src/api/brokerEvidenceSubmission.ts` | Closed V1 snapshot DTO, bounded runtime allowlist and semantic validation, immutable snapshot copy |
| `frontend/src/api/brokerEvidenceRetention.ts` | Original timestamp/importId computation, parsed POST acknowledgement, A-9 GET and snapshot/digest comparison, explicit lookup/retry states |
| `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx` | Live composition on valid nonempty parse; accessible per-attempt state, frozen retry and lookup controls; stale-response guards; truthful retention/provenance/durability disclosure |
| `frontend/server/broker-import/brokerImportEvidenceSubmission.ts` | Trusted owner gates, 4 MiB body cap, strict validator, process-wide serialized append plus fresh journal read-back, stable duplicate/conflict handling, static failure responses |
| `frontend/server/broker-import/brokerImportHttp.ts` | Exactly one new submission leaf delegated before existing handlers; A-9 read handler and response projection remain byte-identical |
| New live HTTP/restart, client and UI tests plus test-only `__fixtures__/liveEvidenceHost.ts` | Real file-selection/HTTP/disk/retrieval proof; two distinct OS hosts; failures and security tests. Fixture listener is test-only, not an application listener |
| Existing preview, route-closure and import-safety tests | Update obsolete no-network preview assertion and three collection-path assertions: GET on newly admitted POST path is 405, not 404. Add writer module to import-safety checks; no GET enumeration is admitted |
| `docs/OPERATOR_RUNBOOK.md` §11 | Single-writer prerequisites, limits, truthful states, backup/recovery boundaries and no stronger durability claim |

**Existing `brokerImportEvidenceStore.ts` is unchanged**, including schema V1, digest algorithms and first-record library behavior. The new consumer performs conflict checks before using that existing mechanism. PF-1, A-8/A-9 frozen instruments, canonical owner-carrier bytes, holdings adapter, user-portfolio transport, dependencies/pins/lockfile and workflows are unchanged. No second evidence persistence mechanism exists.

## 2. Exact runtime flow

1. Browser reads supported CSV locally (1 MiB / filename 256 characters), runs the existing pinned pipeline, renders parsed inventory. Rejected/blocked/empty input causes no submission.
2. A deep-copied frozen `IIPS_BROKER_IMPORT_EVIDENCE_SUBMISSION_V1` envelope contains only `schema`, `fileName`, `preview`. Original `asOf` and snapshot never change on retry. Raw CSV bytes are not sent.
3. **POST `/api/broker-import/:portfolioId/evidence`**: method → C9 first-party hardening → established binding → query/portfolio shape → uncached digest-bound owner carrier → bounded JSON read → strict schema/semantic validation → serialized retention/read-back. No IPC call. Owner `owner-4dc756b3`, tenant `irr-personal-073dd1c8`; SAIRAM is display-only. No body/header identity can override that scope.
4. Runtime caps: 4 MiB JSON, 10,000 rows, 4,096-character string values, depth 12; unknown keys rejected at every object level (refusal-code maps have a bounded key grammar). Safe integer/count, finite numeric, supported status, timestamp/digest, inventory uniqueness/order-preservation and row/summary/count consistency checks apply. Existing ordinary-save 64 KiB cap is untouched.
5. Within the one-process queue, construct the existing store fresh; build the existing V1 record server-side; scoped lookup verifies any prior record. Compare all stored stable fields excluding only recordDigest and per-row quarantineIds. Conflict is static 409; original remains untouched. Equivalent duplicate reuses the first record/digest. Fresh store read-back verifies disk content before 201 (first) / 200 (duplicate) acknowledgement.
6. Client validates the closed acknowledgement, then **existing A-9 GET `/api/broker-import/:portfolioId/evidence/:importId`**. A-9 verifies the stored digest as before. Client compares original importId/contentDigest/timestamp/slot/filename, the native row/identity/count/refusal snapshot and original retained digest before displaying **“Evidence retained and retrievable. Holdings not saved.”** Scope keys are withheld by A-9, so the response projection is not falsely rehashed as the complete stored record.

The browser snapshot is **reported pipeline evidence, not server-authenticated identity**. Its CSV digest is ingest-reported and cannot be independently rechecked without raw bytes. No authorization to save holdings follows from an identity result.

## 3. Idempotency, conflicts and failure recovery

ImportId retains the existing SHA-256 rule over broker, contentDigest and original read timestamp. Equivalent simultaneous requests are serialized; five concurrent requests in the test produce exactly one 201 and four 200s with the same digest and one record. A new file selection is a new attempt, not content-only deduplication. Explicit retry uses the same frozen serialized snapshot. Filename/native-value/portfolio-slot conflicts return 409 without growth or replacement. Changing only documented volatile quarantineIds returns the original record, unchanged.

Header/record append, directory and fresh read-back errors never produce an acknowledgement. A response lost after append is **unknown**, not “not written.” The client offers lookup and explicit frozen retry, no automatic retry loop. A-9 lookup recovers a committed original; stable snapshot comparison also prevents a conflicting snapshot from reporting success merely because an importId exists. Acknowledged-but-unverified retrieval remains a separate UI state. Clear/new selection invalidates late UI results but never deletes or rolls back evidence.

Restart proof: the real 68-row repository fixture is parsed through the real pipeline and submitted to a separate OS HTTP host, then retrieved through A-9. Process A is **SIGKILLed only after verified commit**; process B (different PID) rebuilds from the same journal, retrieves by original importId and accepts a byte-identical retry without journal growth. This proves process-restart recovery, not power-loss recovery or in-flight append atomicity. Separate tests cover an incomplete final line (existing PF-1 recovery) and malformed interior (fail closed, unchanged bytes).

## 4. Acceptance evidence and targeted test rationale

Evidence directory: `evidence/integration/ws-a-live-retention-implementation-2026-11-05/`.

| Check | Result |
|---|---|
| Final live-flow run: `npx vitest run server/broker-import/brokerImportLiveEvidence.test.ts src/api/brokerEvidenceRetention.test.ts src/features/broker-holdings --reporter=verbose` | **4 files / 33 tests PASS**, including real UI selection→HTTP→journal→A-9 and SIGKILL→fresh OS process recovery; `live-flow-final-tests.txt` |
| Targeted regression run (exact paths below) | **11 files / 198 tests PASS** at the earlier implementation stage; 166 unaffected regression tests plus 32 live/UI/client tests. Final live run adds one lost-ack HTTP case and reruns all 33 changed live tests; total distinct coverage now **199 cases**, not a claimed single 199-test local run |
| `npm run typecheck` | PASS (includes pinned materialization/consumer typecheck) |
| `npm run typecheck:replay-server` | PASS, actual server composition closure |
| Explicit strict server live-test typecheck | PASS: `npx tsc --noEmit --target ES2020 --module ESNext --moduleResolution bundler --esModuleInterop --skipLibCheck --strict --types node,vitest/globals server/broker-import/brokerImportLiveEvidence.test.ts` |
| `npm run build` | PASS; existing >500 kB bundle warning remains, no build/deployment activation |
| Existing IRR static validator | PASS; no validator/workflow weakening; hosted recovery-release asset validation remains CI's responsibility |
| New boundary verifier, Python compile, `git diff --check` | PASS; recorded separately before publication |

Targeted regression command (in `frontend/`):

```text
npx vitest run server/broker-import/brokerImportLiveEvidence.test.ts server/broker-import/brokerImportEvidenceRoute.test.ts server/broker-import/brokerImportHttp.test.ts server/broker-import/brokerImportImportSafety.test.ts server/broker-import/brokerImportEvidenceStore.test.ts server/user-portfolio/fenceUnchanged.test.ts server/persistence/persistence-service.test.ts src/api/brokerEvidenceRetention.test.ts src/api/brokerHoldingsPreview.test.ts src/features/broker-holdings --reporter=verbose
```

Blast radius is deliberate: HTTP matcher/route closure and disclosure changed, so A-9's contract suite had a demonstrated dependency (three old 404 assertions had to become 405). The A-9 handler itself was not rebuilt. PF-1 regression is relevant because the new consumer exercises append/rebuild/final-tail failure behavior, but no PF-1 file changed. Current six-read/six-fenced-pair tests, import-safety and native preview tests protect W-1 and existing transport behavior. No unrelated full suite was run locally; unchanged hosted product CI will run its configured suite as required for publication.

Acceptance mapping: true file selection and delayed-GET UI success guard (UI integration); owner binding/native row order/original digest/timestamp and separate-process recovery (HTTP restart); five-way concurrency/stable conflicts/volatile duplicate (HTTP); cross-site/binding/query/body-owner and malformed/missing carrier before store, foreign-scope opaque retrieval and method/route closure (HTTP/security); payload tamper rejects POST/GET (HTTP integrity); directory/header/append/read-back/unknown ack/final-tail/interior faults (HTTP plus unchanged PF-1 filesystem injection seam); frozen retry/failed GET/mismatched digest/content/time/slot, stale clear and no browser storage (client/UI).

No real owner's CSV, carrier file or journal is committed. Evidence logs contain only synthetic-fixture identifiers, digests, counts, PIDs and test results. The npm install initially encountered this sandbox's CA chain; retry used its existing `e2b-ca.crt` via `NODE_EXTRA_CA_CERTS`, with TLS verification enabled and no dependency/lockfile changes.

## 5. Limits and residual risks — not completion blockers concealed as guarantees

- Exactly one writer OS process per data directory is mandatory. The queue is not an OS lock; simultaneous separately cached writers are unsupported. Stop the old host first. PF-1 has no explicit fsync; no power-loss/hardware survival guarantee.
- The raw-file digest and identity evidence are reported browser snapshot provenance, not authenticated source evidence. Server-side record integrity detects subsequent record changes; it is not a signature against a malicious filesystem actor who can recompute hashes.
- After browser loss the frozen snapshot is not recoverable from browser durable storage (none used). Recovery uses the known importId and retained original; there is no enumeration endpoint. Clearing the page does not undo a committed record.
- Storage usage remains approximate and the threshold is review-only. Indefinite retention and explicit-owner-only deletion policy are unchanged; no per-record deletion functionality is added.
- User-host operational acceptance/production activation is not claimed. This is verified application composition in isolated test environments. Holdings remain unsaved, W-1 on, and WS-A-DM is not declared complete.

## 6. Publication

Implementation PR, exact-head/merged-main CI, final remote main and byte read-back belong in the dated additive publication receipt after the checks and merge actually occur. **Implementation merged** and **end-to-end capability verified** must be recorded as separate facts; neither follows from a unit test or the other alone.
