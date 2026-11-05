# CAP-02 U1 AMEND-02 — Live Evidence Retention effectiveness receipt

Date: 2026-11-05. Receipt to Act ID **`IIPS-V3-CAP02-U1-AMEND-02-IMPORT-EVIDENCE-RETENTION-2026-11-05-01`**.
**Determination: EFFECTIVE — PUBLISHED, MERGED AND INDEPENDENTLY VERIFIED.**
**Engineering: AUTHORIZED WITHIN EXACT ADOPTED BOUNDS — NOT IMPLEMENTED.**

This is an additive objective-discharge receipt under adoption act §7, not a new PA decision or a modification of the frozen act/proposal. PA adoption was explicit in the session; no signature or unobserved approval event is asserted.

## 1. Publication coordinates and conjunctive discharge

| Act §7 condition | Independently established evidence |
|---|---|
| 1 — explicit adoption, assigned Act ID, immutable references | `IIPS_v3.0_CAP02_U1_AMEND_02_LIVE_EVIDENCE_RETENTION_PA_ADOPTION_ACT_2026-11-05.md`, explicit PA direction, LER-D01–D04 and proposal/paper hashes |
| 2 — new PR merged to authoritative IRR main | **PR #452**, head **`e24cf5bde5c2d2c89fd1f29753be0b4c71e4b657`**, merge **`af05feeba20305ec565973e9a34179ef699f0be4`**; session branch `arena/c82f8244-iips-review-recovered` (platform-fixed, new publication branch relative to PRs #450/#451) |
| 3 — applicable checks | Local IRR static validator, Python compile, adoption/preservation checks and whitespace checks PASS; exact-head IRR-static CI **42080668959 SUCCESS**; merged-main IRR-static CI **42080780931 SUCCESS**. Hosted checks also verify pinned recovery-release evidence. Runtime/frontend CI is path-filtered and not applicable; no runtime suite was claimed or rerun |
| 4 — independent remote read-back | GitHub contents/blob API byte comparison **10/10 MATCH** (seven changed artifacts plus exact proposal, paper and prior receipt); remote recursive tree comparison **323/323 protected blobs unchanged** from baseline `61546842…`. Full coordinates and SHA-256/blob inventory in supporting JSON |

All four conditions are discharged. The act's original conditional rendering remains frozen; **this dated receipt supplies its operative effective status**. Its own publication coordinates cannot be self-embedded: the publishing session independently verifies this receipt's merged contents and records those coordinates in the PR publication record.

Evidence: `evidence/integration/ws-a-live-retention-adoption-2026-11-05/`:
`rebaseline.json`, `adoption-static.txt`, `irr-static.txt`, `adoption-remote-readback.json`, `adoption-ci.json`, `verify.py`.

## 2. Exact subsequent engineering authority

Adopted by immutable reference: proposed amendment §§1–9, SHA-256
`7bfb84187397a013b5e2c8edcd12f37705eefea827e24abe1650eceff8f41ac8`, and decision paper §4 acceptance matrix, paper SHA-256
`53d3fc797cc04134283faffec501f82271cf534dd237dda2844cb8fc82be8cd4`, both published by PR #450 and verified by PR #451 and this session. No proposal wording was changed. A/C/D alternatives are not adopted.

A separate engineering task may implement one bounded parsed-evidence `POST /api/broker-import/:portfolioId/evidence`, existing trusted owner resolution and scoped V1 evidence append/read-back, original-timestamp frozen-snapshot idempotency, stable duplicate/conflict checks, explicit partial-failure/unknown-outcome recovery, and client verification through the unchanged A-9 GET before final retention success. It must implement the exact DTO/validation/limit/response/UI/runbook requirements and all targeted end-to-end, restart, isolation, tamper, persistence-failure and safety acceptance proofs; publish implementation evidence and independently verify its own CI and remote contents.

SAIRAM's owner remains **`owner-4dc756b3`**, tenant **`irr-personal-073dd1c8`**, through the existing digest-bound carrier, never request-supplied. Integrity and owner isolation are unchanged. Content digest remains reported ingest evidence, not independently raw-byte-verified or authenticated origin. Preserve original `asOf` on same-attempt retries; first retained record remains authoritative; conflict never overwrites it.

Single OS writer per data directory and in-process serialization are mandatory. **No cross-process lock or explicit fsync guarantee exists.** Process-restart recovery is the bounded claim, not power-loss/hardware survival. No PF-1 changes, holdings writes, W-1 lift, raw CSV upload, DELETE/deletion tool, expiry, purge/compaction, IPD mutation, pin movement or expanded deployment/identity authority. Changed persisted grammar, raw-origin authentication or multi-writer requirements require a narrow separate PA decision, not implementation inference.

## 3. Remaining status

- A-9 retrieval: **IMPLEMENTED — MERGED AND VERIFIED**, unchanged.
- Import-time Live Evidence Retention authority gap: **CLOSED by effective AMEND-02**.
- Live Evidence Retention implementation: **AUTHORIZED — NOT IMPLEMENTED**; no retention write path or runtime file changed in this task.
- Holdings durability, W-1 and WS-A-DM completion: **UNCHANGED / NOT GRANTED**.
- Earlier tracker/R2 “authority required” statements describe earlier baselines and are superseded for current authority only by this receipt, not erased. Runtime non-implementation remains true.
