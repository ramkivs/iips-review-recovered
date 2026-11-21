# W-24 — Owner decision proposal

**Status: proposed design only.** This document does not authorize implementation or amend policy, roadmap status or dependencies. It builds on this session's W-24 investigation and coordinated design; W-08/W-09 remain unchanged.

## Recommended architecture

- IRR generates an opaque random `actionId` for each quote or history request and sends it to IPD over authenticated local transport. A supplementary freshness read uses the same ID. Local failures are recorded in IRR without inventing daemon events.
- IPD assigns a `workId` to a new shared quote refresh. Each coalesced action links to it. A separate `attemptId` identifies **each actual handoff** to Dhan transport; it does not prove Dhan received or processed the request. No correlation header is sent to Dhan.
- A cache hit creates no vendor attempt. For D01, return an immutable per-request envelope copy: `traceId` identifies the current action and `correlationId` the original producer action, if known. Do not mutate cached provenance or invent a producer. Failures have no successful envelope. Do not invent canonical D02 provenance.
- Keep separate bounded in-memory event rings: proposed **512 IRR** and **1,024 IPD** events, oldest evicted first, with sequence and eviction/reset indicators. Restart clears them; there is no persistent or external diagnostic sink. Reads are local, authenticated, read-only and bounded. The browser never receives the IPD bearer. The proposed separate loopback-only IRR operator listener would reuse the server-held transport bearer; that expansion requires security approval. If rejected, agree another authenticated local reader—never an unauthenticated fallback.
- Retain the earlier synthetic acceptance plan: success and failed screen action; pre-IPD failure; cache, coalescing and freshness; timeouts and late completion; eviction, concurrency and disclosure canaries. Do not retry automatically after a trace-contract mismatch: an older daemon may already have acted.

## M4 clarification required

[Roadmap §10.3](DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md#103-exit-criteria) requires **“one trace id spans IRR → IPD → Dhan”**, plus observed provider status, session-aware freshness, non-empty D02 freshness and a Windows start/health/stop/restart E3 transcript. W-24 separately requires the ID in IRR and daemon logs and canonical provenance, a bounded local ring, and a failed action traceable end-to-end.

**IPD-local handoff evidence cannot yet be declared sufficient for M4.** The roadmap does not define whether the Dhan leg means a locally recorded transport attempt or an ID received/recognized by Dhan. W-24's local mechanism is consistent with the former but does not resolve that ambiguity.

**Recommended decision:** issue a binding interpretation, without changing M4, that its Dhan leg is met by linking the IRR action ID in IPD's local records to an actual Dhan transport handoff and categorized outcome. It requires no transmission to, recognition by, or acknowledgement from Dhan. Record that clarification through the appropriate roadmap authority before treating such evidence as satisfying M4. If vendor-side correlation is required instead, this design does **not** satisfy it; documented Dhan support and a separately authorized design would be needed. All other M4 criteria remain independent.

## Final proposed failure-category enum

For new W-24 events only, use the following closed set. Omit the category on success; use the event and boundary to identify where it occurred. Existing W-08/W-09 codes and behavior remain unchanged.

- `REQUEST_INVALID`, `IDENTITY_UNRESOLVED`, `CONFIGURATION_UNAVAILABLE`: invalid request, unresolved mapping, or local configuration/readiness refusal, respectively.
- `CREDENTIALS_UNAVAILABLE`, `CREDENTIALS_EXPIRED`, `AUTH_LATCHED`: local readiness/resolution, expiry, or existing latch refusal.
- `IPD_AUTH_REJECTED`, `VENDOR_AUTH_REJECTED`: observed rejection at the local IPD gate or by the vendor, respectively; never infer vendor rejection from a preflight refusal.
- `RATE_LIMITED`, `TIMEOUT`, `TRANSPORT_FAILURE`: classified limits, timeouts, or transport failures at the recorded boundary; none alone proves a vendor attempt or receipt.
- `VENDOR_HTTP_ERROR`, `RESPONSE_INVALID`, `DATA_SUPPRESSED`: observed non-auth/non-rate-limit vendor HTTP failure, invalid response, or existing suppression rule.
- `TRACE_CONTRACT_MISMATCH`, `INTERNAL_ERROR`: invalid/missing trace acknowledgement, or any unexpected/unmapped failure.

Map known existing codes through an explicit closed table; unknowns map to `INTERNAL_ERROR`. Never record raw messages.

## D-7 approval and remaining risks

D-7's MAY list is exhaustive. **Before implementation**, approve an amendment for the new fields and surfaces: event schema version, timestamp, component, operation, event, opaque action/work/attempt IDs, outcome, categories above, bounded duration and sequence/eviction indicators; authenticated local ring reads; IRR–IPD trace headers; D01 provenance; and the action reference in IRR responses. W-09's aggregate endpoint stays unchanged.

Never expose credentials or tokens, `vault://` references, paths, business/security identifiers or their hashes, payloads/DTOs, arbitrary exception or child-process text, non-trace headers or environment dumps. The approved trace headers carry only their version and opaque action ID; no headers are stored in events. Construct events from allowlisted primitives. An opaque ID or timestamp can coincidentally overlap a secret substring: canary tests cannot prove universal absence. The owner must approve how the literal D-7 substring prohibition and safe acceptance scanning are satisfied **without weakening it or resolving credentials for tracing**.

Eviction, restart or a timeout followed by late work can leave incomplete evidence. Readers must report eviction/reset; a missing event after an ambiguous transport failure is not proof of non-receipt. Local authentication does not protect against a compromised process running as the same Windows user.

## Sequence, subject to separate implementation authorization

1. **IPD first:** approve policy and contract; implement and synthetically verify daemon, client, provenance and ring; publish identifiable compatible package and daemon releases.
2. **IRR second:** update its IPD pin, implement correlation and ring, and run joined synthetic/security regressions against the published artifact. Detect incompatible daemon acknowledgements; do not claim trace coverage silently.
3. Windows acceptance requires separate authorization. No live Dhan call is implied. W-24, W-34 and M4 remain unchanged until accepted through existing governance.

## Decisions for owner confirmation

1. Approve the architecture, D01 provenance meanings and ring capacities/retention?
2. Approve the failure enum and closed mapping to existing codes?
3. Approve the recommended binding M4 interpretation, or require vendor-side correlation?
4. Approve the D-7 field/surface amendment and no-disclosure acceptance approach, including the substring issue?
5. Approve bearer reuse for the IRR local operator reader, or select another authenticated mechanism?
6. Approve the IPD-first / IRR-second sequence as a plan only? Implementation still needs separate authorization.

---

## Owner decisions recorded — 2026-11-21

The owner supplied these decisions for recording. The proposal above is preserved as the original design history; where it asks for confirmation or presents a different failure enum, **this section records the owner's decision and takes precedence**. These decisions do not authorize implementation, amend the controlling roadmap or close W-24. **W-24 remains OPEN.**

### 1. Architecture — APPROVED

- Use three separate opaque identifiers: IRR-generated `actionId` across the IRR-to-IPD action, IPD `workId` for shared refresh work, and IPD `attemptId` for each actual handoff to Dhan transport. An attempt is local evidence, not proof of Dhan receipt or processing; do not send a correlation header to Dhan.
- Preserve the proposed D01 provenance semantics across new requests, cache hits and coalesced actions: current action in `traceId`, original producer action in `correlationId` when known, and no mutation of cached provenance or invented producer. Do not invent D02 provenance.
- Use bounded in-memory rings of **512 IRR events** and **1,024 IPD events**, with oldest-first eviction and a maximum serialized event size of **1 KiB**. No persistent diagnostic log or external monitoring sink. Restart and eviction limitations remain as described above.

### 2. Failure categories — APPROVED

For new W-24 diagnostic events, the owner-approved **closed enum** is exactly:

`VALIDATION_ERROR`, `AUTHENTICATION_FAILED`, `AUTHORIZATION_FAILED`, `CONFIGURATION_ERROR`, `READINESS_FAILED`, `IDENTITY_REJECTED`, `RATE_LIMITED`, `CACHE_ERROR`, `TRANSPORT_ERROR`, `PROVIDER_ERROR`, `TIMEOUT`, `CONTRACT_MISMATCH`, `INTERNAL_ERROR`.

Unknown values map to `INTERNAL_ERROR`; they are not serialized. An explicit mapping from existing failure codes and boundary/event context is still needed in the separately authorized implementation design. The earlier, different proposed enum is retained above as historical context and is **superseded** by this approved list. W-08/W-09 categories and behavior are unchanged. A category alone must not imply a vendor attempt, rejection or receipt.

### 3. M4 interpretation — OWNER DECISION RECORDED

The owner adopts **IPD-local Dhan transport-attempt evidence** for the Dhan leg: an action ID linked through local IPD records to the actual transport handoff and its locally observed outcome. This establishes only the handoff and outcome observable by IPD, not Dhan's receipt or processing. Vendor-side correlation is not required for the IIPS architecture.

**Formal clarification remains required:** the appropriate roadmap authority must record this interpretation of the existing §10.3 wording, “one trace id spans IRR → IPD → Dhan,” before local attempt evidence is treated as satisfying that M4 criterion. This decision record does not silently rewrite the roadmap, change its criteria, or claim M4 acceptance. M4's other criteria remain independent.

### 4. D-7 — APPROVED WITH CONDITION

The owner approves the proposed restricted event fields and permitted surfaces, subject to **all existing disclosure prohibitions** and the conditions below. This document is not itself a formal D-7 amendment: the authorized D-7 authority must record the exact field/surface allowlist and acceptance requirements before implementation.

- Random UUIDs cannot mathematically guarantee zero accidental substring overlap with arbitrary secrets. No secret inspection or credential resolution solely for tracing is authorized, and existing disclosure prohibitions must not be weakened.
- Unknown or unsafe values must not be serialized; map an unknown failure category to the fixed `INTERNAL_ERROR` value and reject or omit other unsafe fields without echoing their input.
- The precise way to satisfy the literal substring prohibition and perform safe acceptance scanning remains unresolved and requires formal D-7 security clarification before implementation. Canary tests alone do not prove universal absence.

### 5. IRR operator reader — APPROVED WITH SAFEGUARDS

Reuse the existing server-held bearer for the local IRR operator reader only with **constant-time verification, loopback-only access, read-only operations, no browser exposure and no unauthenticated fallback**. The ring remains bounded and must not disclose prohibited data. The corresponding permitted surface and safeguards must be captured in the formal D-7 clarification.

### 6. Implementation sequence — APPROVED AS PLAN ONLY

1. Implement and publish compatible IPD changes.
2. Update IRR's pinned IPD package.
3. Implement IRR correlation and joined integration tests.
4. Perform local Windows acceptance only under separate authorization.

This sequence is a plan, **not implementation authorization**. No live Dhan call is authorized by this record. Formal M4 and D-7 clarifications remain outstanding; W-24, W-34 and M4 roadmap status, dependencies and acceptance criteria are unchanged.

---

## Owner decisions: M4 and D-7 clarification — 2026-11-21

The owner approved the decisions below. They clarify the previous owner-decision section where it described M4 and D-7 matters as outstanding; all six previously recorded decisions are preserved. This is an owner decision record and **proposed D-7 policy clarification**, not an implementation authorization, a silent roadmap amendment or evidence of repository-level adoption. **W-24 remains OPEN.**

### M4 interpretation — APPROVED

The same IRR-generated `actionId` must be propagated to IPD and associated with IPD's local Dhan egress-attempt record. This establishes correlation to the **local Dhan interaction boundary**. The ID must not be sent to Dhan as a new header or vendor parameter, and the record does not prove Dhan received, recognized or processed the ID. Vendor-side correlation is not required for this IIPS architecture.

The controlling roadmap's M4 wording and status remain unchanged. This record does not claim M4 is achieved or accepted; its other criteria remain independently applicable. The approved interpretation still requires formal recording or adoption through the appropriate roadmap authority before it is used to assess M4; no controlling roadmap text is silently amended here.

### D-7 field and event amendment — OWNER APPROVED

The owner approves the W-24 allowlist, limited to:

- **Event fields:** `schemaVersion`, `timestampUtc`, `component`, `operation`, `event`, `actionId`, `workId`, `attemptId`, `outcome`, `failureCategory`, `durationMs`, `sequence`. Use only the coordinated design's closed enums: `component` = `IRR` or `IPD`; `operation` = `QUOTE`, `HISTORY` or `FRESHNESS`; `event` = `ACTION_START`, `ACTION_END`, `REQUEST_ADMITTED`, `REQUEST_END`, `CACHE_HIT`, `WORK_START`, `WORK_JOIN`, `ATTEMPT_START`, `ATTEMPT_END`, `TIMEOUT` or `LATE_COMPLETION`; `outcome` = `SUCCESS`, `FAILURE`, `TIMEOUT`, `NOT_ATTEMPTED` or `UNKNOWN`. IDs are lowercase UUIDv4. Use the owner-approved failure-category enum in the preceding decision section; unknown categories map to `INTERNAL_ERROR`. Unknown or unsafe input is never serialized.
- IRR and IPD bounded in-memory event rings, respectively **512** and **1,024** events, with the previously approved maximum event size of **1 KiB**.
- Validated trace headers on the authenticated IRR–IPD loopback transport only; D01 `traceId` and `correlationId` with the approved current-requester and original-producer meanings; and an IRR response support reference containing the current action ID.
- Separate authenticated, loopback-only, read-only operator access to the rings, retaining the previously approved constant-time bearer verification and no unauthenticated fallback.

Existing W-09 diagnostics and public Status remain unchanged. The browser has no access to ring contents or bearer credentials. No trace metadata or trace headers are sent to Dhan. Transient transport authentication and the explicitly approved validated trace headers do not authorize exposing or recording headers in diagnostic events.

### D-7 prohibited information and substring clarification — OWNER APPROVED

Retain every existing prohibition, including secrets, tokens, `vault://` references, paths, URLs, headers, payloads, DTOs, business identifiers, hashes of business identifiers, and arbitrary exception or child-process text. The approved trace headers are limited to the authenticated local transport described above and are not logged as headers.

- IDs must be independently and cryptographically generated, never derived from or populated using secret material. Do not inspect credentials or secrets for tracing.
- A random UUID can coincidentally contain a substring matching an arbitrary secret; absolute mathematical prevention of every such coincidence is not possible. Such accidental overlap is not intentional disclosure where the ID is independently generated and no secret is inspected or used.
- Retain adversarial canary tests for selected values across all prohibited output surfaces. This clarification does not authorize intentional secret disclosure or weaken any existing prohibition.

### Governance and adoption boundaries

The owner has approved the above interpretation and proposed policy clarification, but this document alone does **not** establish formal D-7 acceptance by both repository implementations. The authorized D-7 authority must record the exact amendment and its acceptance requirements, and repository-level adoption by both IRR and IPD must be evidenced before it is claimed. The previously approved IPD-first / IRR-second sequence remains a plan only; implementation and Windows acceptance require separate authorization. No live Dhan request is authorized by this record.
