# WS-A — Import-time evidence retention: PA decision paper

Date: 2026-11-05. Baseline: IRR `8a13aeb4525fc228afad495e272eded383a99729` (live main verified at investigation entry).
Status: **PROPOSAL ONLY — NOT AN AUTHORITY ACT. Implementation not authorized.**
Decision owner: PA (Ramki). Prepared by Arena. No PA decision, signature or approval is inferred from this request or publication.

## 1. Decision in ordinary language

Today the application has a filing cabinet and a way to fetch a particular file, but selecting a broker CSV does not put anything in that cabinet. A successful preview disappears when the browser closes. A digest shown on screen is not a saved evidence record. A-9 correctly returns 404 when nothing has been retained.

**Arena recommends Option B:** explicitly authorize a small, evidence-only connection from the browser import to the existing local journal, then fetch the saved record through A-9 before displaying “evidence retained.” This is not permission to save portfolio holdings. Unresolved imports also need evidence: successful parsing is not successful identity resolution, validation, authorization or a holdings save.

This needs an additional PA amendment because the effective A-8 act permits a read route, expressly excludes writes, and the published A-9 receipt explicitly reserves retention composition to separate authority. Existing PF-1 library authority does not authorize exposing a writer to browser requests. The user's conditional instruction requires a proposal, not implementation, when that authority is missing.

### Alternatives

| Option | What the owner gets | Cost / limitation | Recommendation |
|---|---|---|---|
| A — remain read-only | Retrieve evidence placed by an already-authorized trusted-host caller | Normal CSV imports still leave no evidence; current disclosure overstates the live flow | Safe interim state, not the objective |
| B — parsed-evidence submission | Browser submits only the parsed equivalent to a bounded local write handler; A-9 retrieves it | New route authority, input validation, retry UX and single-writer operational restriction needed; raw-file digest cannot be independently rechecked | **Recommended** |
| C — server parses uploaded raw CSV | Server can independently recompute the content digest and pipeline output | Breaks the current “raw bytes not uploaded” promise even if bytes are never stored; requires separate consent/transport decisions | Do not adopt implicitly |
| D — trusted-host manual importer | Operator retains evidence with a local command, no new HTTP writer | Not automatic import-to-retention; manual burden; test-only writer is not an operational tool grant | Only if PA deliberately prefers manual operation |

## 2. Precisely what existing authority permits

The governing broker-import A-8/A-9 is the WS-A action register, **not** the unrelated NP-12 N4-A8/N4-A9 screener records.

1. PF-1 (`frontend/server/persistence/persistence-service.ts`, header / TD-2) supplies append, scoped reads, dedup and recovery to trusted library callers. It explicitly says it is **not an HTTP identity or access-control boundary**. It does not decide which external caller may cause an append.
2. `WS-A-BROKER-PREVIEW-AND-EVIDENCE-RETENTION-2026-11-05.md` §§2–3 establishes the evidence store and trusted-host proof, while explicitly leaving HTTP composition to transport authority. The writer executable labels itself **TEST-ONLY**.
3. Effective `IIPS_v3.0_CAP02_U1_AMEND_01_EVIDENCE_RETRIEVAL_ROUTE_PA_DECISION_ACT_2026-11-05.md` §8 admits one GET evidence route and fixed carrier; §12 enumerates eleven implementation steps, none a write handler. §13 expressly excludes “any write, any durable-success claim, any real-user save.” Later §14 makes the bounded retrieval implementation effective, not a wider write grant. Historical pending headings must be read with that dated receipt.
4. `WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md` §17.10 expressly says retention is not composed, is not one of those eleven steps and “would add a write path this act does not grant.” Its A-9 live cell says the same.
5. Decisions 5/6/7 fix owner, indefinite retention and disclosure. A retention policy governs retained records; it does not itself admit an import-time producer. Standing F-3 authority does not override the specific closed route set or the explicit exclusion.

**Determination: additional bounded transport/composition authority is required.** No implementation path is authorized by combining these instruments. Neither calling a library inside an existing POST nor inventing a background process avoids that boundary.

## 3. Source-level investigation

| Surface | Observed implementation / consequence |
|---|---|
| Browser preview | `BrokerHoldingsPreview.tsx` reads `File.text()`, calls `previewBrokerHoldings`, stores React state. No retention request. Clearing/selection uses a sequence guard. Current retention disclosure describes policy, not a completed runtime write. |
| Holdings import POST | `brokerImportHttp.ts` validates its save DTO, makes one existing V1 IPC call and responds. No `retain()` call; it is a separate holdings path, not an evidence submission surface. W-1 must remain on. |
| A-9 GET | First-party hardening → binding precondition → no query → parameter checks → act-fixed owner resolver → scoped read/storage usage → integrity-checked evidence projection. No portfolio store write. |
| Evidence library | `buildBrokerImportEvidence` builds V1 evidence; import identity derives from broker + content digest + read timestamp. `retain` deduplicates in the owner scope and returns the first record. `readByImportId` resolves in that scope and verifies the record digest. |
| Provenance | Content digest is an ingest-reported value; without raw bytes it cannot be independently reverified. The record explicitly records this limitation. A record digest is tamper evidence, not authentication of browser assertions. |
| PF-1 | Append-only journal and rebuildable in-memory index; truncated final-line recovery already governed; malformed interior/version fails closed. No cross-process writer lock or explicit fsync. Multiple independently cached writers can race. Do not claim power-loss durability or concurrent multi-writer safety. |
| Existing tests | Library/restart tests and A-9 tests seed the journal directly; these are not proof of actual browser import → persist → GET. Retain call-site inventory contains tests and the test-only writer, not a production import caller. |

Evidence: `evidence/integration/ws-a-import-retention-authority-2026-11-05/` contains baseline SHA-256/blob inventory and reproducible static checks. No customer CSV or carrier is published.

## 4. Exact proposed implementation scope and acceptance

The companion **proposed amendment** supplies operative clauses, strict request/response contracts, trust limits, retry semantics and allowed files. It is deliberately a draft, not a rendered approval. Approving Option B and those clauses together is one bounded decision; no repeated approval loop is proposed. Effectiveness requires explicit PA adoption, publication and independent read-back before implementation.

After effectiveness, implement the complete flow in one bounded pass, with these acceptance proofs:

- Browser-selected CSV parses; parsed snapshot submits; journal append/read-back succeeds; unchanged A-9 GET returns the matching import ID, original content digest and retained record digest. Capture UI acknowledgement and actual journal growth, without publishing personal data.
- Kill process A, start fresh process B on the same temporary journal and carrier, retrieve through real HTTP A-9 (not seeded evidenceReader or in-memory map). Repeat the original submission and prove first record/digest unchanged and record count unchanged.
- Same-attempt retries preserve original timestamp/import identity and frozen snapshot; new explicit file selection is a new attempt. Lost acknowledgement after append recovers the existing record; no automatic holdings retry.
- Missing/corrupt/foreign carrier, client-supplied owner keys, foreign partition evidence and malformed IDs fail closed; A-9 retains opaque non-enumeration. Test binding/first-party refusal before storage construction.
- Tamper journal payload or record digest: never serve or report retained success. Test same-ID conflicting payload; ignore only documented volatile quarantine IDs for duplicate equivalence, not other fields.
- Inject directory/header/append failures, failure after append before acknowledgement, read-back failure, truncated tail and malformed interior; demonstrate no false success, correct safe retry and no holdings side effect. Do not modify PF-1 to inject faults; use its existing filesystem seam/service tests and evidence-layer dependencies.
- Target changed files: broker preview API/component, new evidence client/handler, evidence store, real HTTP/restart tests, existing import-safety/owner-carrier/fence suites and PF-1 regression tests if its consumer behavior is exercised. Typecheck relevant frontend and server projects. No unrelated sector/engine suite churn.
- Reassert six admitted read-only user-portfolio pairs and six still-fenced write/context pairs; preserve W-1, no companyId on save wire, no new IPC operation, no pin/package/workflow changes.
- Publish implementation, test transcript and hashes; verify exact-head CI, merged-main CI and independent remote byte read-back. Do not declare holdings durability or WS-A-DM complete.

## 5. Work completed in this pass / remaining decision

Completed: source and authority investigation, authority determination, full PA paper and proposed additive amendment, supporting static evidence and publication. **No runtime/source/test/dependency/PF-1 change. No import retention claim.** No runtime tests are warranted for this documentation-only pass; the above tests are implementation acceptance requirements, not claimed results.

PA decision requested once: adopt Option B and the companion amendment as written, choose a stated alternative, or reject/defer. Publication of this paper is not adoption. Actual import → persist → retrieve remains **NOT IMPLEMENTED / AUTHORITY REQUIRED**. Deletion tooling, holdings writes, W-1 relief, raw uploads and PF-1 changes remain outside scope.
