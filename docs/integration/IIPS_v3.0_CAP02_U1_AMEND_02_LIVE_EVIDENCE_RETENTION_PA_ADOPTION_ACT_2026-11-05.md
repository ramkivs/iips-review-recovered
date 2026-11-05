# IIPS v3.0 — CAP-02 U1 AMEND-02 — Live Evidence Retention PA Adoption Act

**Act ID:** `IIPS-V3-CAP02-U1-AMEND-02-IMPORT-EVIDENCE-RETENTION-2026-11-05-01`

| Field | Value |
|---|---|
| Authority | Explicit PA direction from Ramki in the operating session on 2026-11-05; separate additive adoption, not inferred standing authority |
| Instrument | Additive U1 AMEND-02, adopting the exact published proposal by immutable reference (§2) |
| Baseline | IRR authoritative `refs/heads/main@61546842a7e9284b07d9cfe6986d12e997a9ea64` |
| Prior publication | PR #450 merge `8787135e001cf588307cc19cb0773ea5b1eedb44`; independent publication-verification receipt PR #451 merge `61546842a7e9284b07d9cfe6986d12e997a9ea64` |
| Rendering status | PA decision RENDERED; effectiveness conditional only on §7 publication/verification. The separate post-merge receipt records discharge; this frozen rendering is not rewritten |
| Runtime status | **Live Evidence Retention NOT IMPLEMENTED**. This decision-publication task implements no writer |
| Repository boundary | IRR only; IPD reference boundary preserved, no IPD access or mutation required; no pin movement |

## 1. PA decision, recorded without fabrication

The PA's direction in this session is:

> **PA direction:** Adopt Arena's recommended bounded parsed-evidence submission route, with retrieval verified through the existing A-9 route before retention is reported as successful.

The PA also directs formal adoption of the proposal published in PR #450 using PR #451 as its independent publication-verification receipt, preservation of safeguards, publication and independent verification, and **no retention-write-path implementation in this task**.

This act records that explicit decision on 2026-11-05. No signature, signed instrument, third-party confirmation, approval timestamp or additional PA decision is fabricated. Publication does not constitute the decision; it makes the recorded decision durably available under §7.

## 2. Exact adoption and immutable references

**Decision LER-D01 — ADOPT Option B, in full, within its published bounds.** Adopt the operative scope and safeguards of §§1–9 of the proposed amendment, together with the acceptance criteria in companion paper §4. The historic draft/non-authority labels and “until then” status describe their publication state, not a surviving veto on this later explicit adoption. The new assigned Act ID above extends the proposed identifier using established date/sequence conventions; it does not alter the proposal.

| Incorporated artifact | Immutable identity |
|---|---|
| `docs/integration/WS-A-IMPORT-TIME-RETENTION-PROPOSED-AMENDMENT-2026-11-05.md` | PR #450 merge above; blob `c6e0a7f4dae3e3ed762312bcf07d1d43b57bd910`; SHA-256 `7bfb84187397a013b5e2c8edcd12f37705eefea827e24abe1650eceff8f41ac8` |
| `docs/integration/WS-A-IMPORT-TIME-RETENTION-PA-DECISION-PAPER-2026-11-05.md` | Same merge; blob `47e8a9df97348a5f58982cb26975e9e78c14df11`; SHA-256 `53d3fc797cc04134283faffec501f82271cf534dd237dda2844cb8fc82be8cd4` |
| Prior independent receipt | `evidence/integration/ws-a-import-retention-authority-2026-11-05/publication-readback.json`, published by PR #451; fresh re-verification in this act's supporting `rebaseline.json` |

These files remain byte-identical. The exact incorporated clauses control, not a paraphrase or an edited future copy. No silent wording change is made. U1, U1 AMEND-01, PF-1, owner acts, earlier receipts and all frozen instruments are preserved. The narrow evidence-only append permission displaces the earlier no-write/closed-route exclusion **only** to the extent stated by proposed amendment §1 and the new route in §2. It grants no general persistence permission.

## 3. Scope review, alternatives and ambiguity determination

The published decision paper compares A (remain read-only), B (parsed evidence submission), C (raw CSV server upload/parse) and D (manual trusted-host importer). The PA selects B; A does not meet the objective; C and D are **not adopted**. Raw-file origin authentication would require separate authority for C. No second user, enterprise identity, production deployment or holdings save is implied.

The exact wording was compared with the current preview type, builder, PF-1 service and A-9 implementation. No material unresolved authority requirement was found for this bounded increment under its explicit single-writer operational restriction. Technical details still require implementation-time validation and the acceptance proofs; this is not a claim of engineering readiness demonstrated by runtime tests.

Two contextual readings are important and introduce no new rule: §4's server-derived record identifiers/digests do **not** authorize recomputing the raw CSV content digest (the same clause expressly preserves it as ingest-reported); §7's POST `EVIDENCE_RETAINED` acknowledgement follows fresh journal read-back, while the UI must await matching A-9 retrieval before reporting final retention success. These are the proposal's existing distinctions, not changes. Missing guarantees of multi-writer locking or power-loss survival are explicit limitations, not waived acceptance criteria.

If engineering finds a material ambiguity or requires PF-1 mutation, broader trust guarantees, a changed persisted grammar, raw upload or multiple OS writers, stop that affected scope and present the narrow necessary PA decision. This act delegates no power to invent a resolution or broaden authority.

## 4. Effective implementation envelope (summary; exact incorporated clauses govern)

**Decision LER-D02 — bounded engineering authority, effective only under §7.** Authorize a subsequent separate implementation task to compose:

- One new `POST /api/broker-import/:portfolioId/evidence` on the existing host, listener and proxy. Preserve existing A-9 `GET /api/broker-import/:portfolioId/evidence/:importId`, with no collection/list route. No new IPC operation or repurposing of holdings POST.
- Method/C9/binding/query/parameter/uncached owner-resolution gates before bounded body/schema validation and serialized storage. C9 is not authentication. No identity from request values. Fixed owner carrier: SAIRAM display label, `owner-4dc756b3`, `irr-personal-073dd1c8`, existing carrier SHA-256 binding and fail-closed isolation.
- Closed V1 parsed snapshot DTO; strict runtime allowlists, semantic/count/order/finite-number/digest/timestamp checks. Limits: 4 MiB JSON, 10,000 rows, 4,096-character values, depth 12; preserve browser 1 MiB CSV and 256-character filename limits and unchanged ordinary-save 64 KiB cap. Reject unsupported/blocked/rejected/empty inventories without append.
- Existing builder/journal V1 digest and import identity semantics. No supplied owner, record identity/digest, path, raw CSV or canonical holdings identifier. Identity remains browser pipeline snapshot evidence, not server-authenticated identity; raw contentDigest cannot be independently verified without raw bytes.
- Freeze original `asOf`, filename and snapshot; same-attempt explicit retries reuse them unchanged. Owner-scoped first retention is authoritative. Stable-field conflicts return 409; exclude only recordDigest and documented volatile quarantineIds when comparing duplicates. Same import in a different portfolioSlot conflicts. Return the original record and digest. No automatic retry loop or holdings retry.
- One writer OS process per directory, serialized in-process, fresh store/index per attempt under serialization, fresh verified journal read-back before acknowledgement. This is **not cross-process locking**. Stop an old writer before starting a replacement; no simultaneous manual/test writer.
- First append 201, equivalent duplicate 200; static error outcomes on failures/tampering, no false retention success, no detail leak. Append-before-acknowledgement failure is unknown, reconciled through A-9 and same-snapshot explicit retry, never rollback/delete/replacement. Existing PF-1 truncated-tail recovery and malformed-interior failure remain unchanged.
- After acknowledgement, compare importId, original contentDigest and retained recordDigest through actual A-9 retrieval before final success display. Separate parsed, unconfirmed, acknowledged-but-unverified and retained/retrievable UI states. Clear/new-selection sequence guards; clearing does not undo committed evidence. No browser durable snapshot/CSV storage.
- Indefinite local retention, no purge/expiry, 50 MiB review warning only, existing O-1/O-2 storage visibility/backup safeguards and explicit provenance/durability disclosures. Process-restart recovery only: **no explicit fsync or power-loss/hardware durability guarantee**.

Allowed implementation files are exactly proposed amendment §8's evidence DTO/client/validator/handler, bounded preview/API and HTTP delegation changes, evidence-consumer duplicate/read-back methods, relevant tests and operator documentation. No PF-1 changes, owner-carrier byte changes, holdings adapters, IPC, dependency pins/lockfiles, workflows, engines, datasets or authority edits.

## 5. Mandatory acceptance / publication obligations

The paper's §4 acceptance matrix is binding, not a report of executed tests: actual browser-selected import → append/read-back → real A-9 HTTP retrieval; distinct-process restart and duplicate recovery; original timestamp/id/digest stability; owner isolation and carrier refusal; stable-payload conflict; payload/digest tampering; directory/header/append/read-back failures and append-before-ack loss; truncated-tail/interior-malformation recovery; accessible UI truthfulness; import-safety and current six-read/six-fenced-pair baseline.

Run targeted changed-surface tests and relevant frontend/server typechecks; reuse PF-1's existing fault-injection seams without modifying it. No unrelated engine/sector retesting or certification claim. Publish exact implementation test transcripts/hashes, verify exact-head and merged-main CI and independently read changed files remotely. A library seed test alone is not proof of the actual import flow. Holdings durability and WS-A-DM completion are not granted or declared.

## 6. Preserved prohibitions and task boundary

**Decision LER-D03 — preserve every boundary.** No PF-1 modification, cross-process lock addition or fsync addition; no holdings writes or durable-holdings claims; W-1 ON; no raw CSV upload or retention; no DELETE, deletion tool, purge, automatic expiry, compaction or quota-triggered deletion; no third-party transmission; no IPD writes/pins/deposition; no gate/fence lift, production or multi-user authority. No operational writer or runtime code is implemented by this decision-publication task.

## 7. Effectiveness and separate receipt

**Decision LER-D04 — publication authorized by this direction.** Effectiveness requires all of:

1. This explicit PA adoption recorded with assigned Act ID and exact immutable references (this instrument).
2. Publication through a new PR from the active Arena session branch, merged to authoritative IRR main, preserving frozen artifacts and runtime files.
3. Applicable local static checks and hosted IRR-static checks pass at the PR head and merged main; runtime CI is not applicable to this documentation-only act.
4. Independent GitHub remote read-back verifies the merged instrument, incorporated artifacts and changed records; record the exact head, merge, checks, hashes and frozen-file comparison in a separate additive effectiveness receipt.

Once discharged, this act is **EFFECTIVE** and subsequent bounded engineering is **AUTHORIZED — NOT IMPLEMENTED**. Until discharge, it is rendered but conditional, not effective. This instrument remains frozen; the receipt and dated tracker/R2 addenda carry the effective state and coordinates without self-embedding a merge hash. Receipt publication is authorized here; its own merge is independently verified in the publication session. No additional PA confirmation is needed to record objective discharge.

Supporting evidence directory: `evidence/integration/ws-a-live-retention-adoption-2026-11-05/`.
