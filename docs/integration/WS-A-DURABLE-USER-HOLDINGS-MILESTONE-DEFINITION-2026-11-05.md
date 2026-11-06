# WS-A-DM — Durable User Holdings and Evidence Persistence: milestone definition and completion framework

| Field | Value |
| :--- | :--- |
| Record ID | `IIPS-V3-WS-A-DURABLE-HOLDINGS-MILESTONE-DEFINITION-IRR-2026-11-05-01` |
| Date | `2026-11-05` |
| Workstream | **A** — Dhan Broker Holdings Import, Identity Resolution, Durable Persistence |
| Milestone ID | **WS-A-DM** |
| Owning repository | **IRR** (`ramkivs/iips-review-recovered`) — with IPD-owned and PA-owned dependencies named per pillar |
| Authoritative baselines at authoring | IRR `main@1afa1fba1fdf8d1567089b94c25c187b202a9d51` (PR #439) · IPD `main@6df748d397daf965bd5b6e6e35df5043f7fa8c4d` (PR #126) |
| Broker-import pin in force | `iips-broker-import#7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc` (IPD PR #127 merge commit) |
| Document class | **Milestone definition and acceptance framework — PROPOSED. Renders no PA decision, acceptance, admission, qualification, waiver or execution receipt. Moves no gate, pin, fence or status.** |
| Supersedes | Nothing. Additive. |

---

## 0. Purpose and the non-completion rule

Workstream A has so far been reported as a sequence of completed tasks: a preview, an evidence
journal, a pin advance, a per-row identity assessment. Each is real and each is verified. Reporting
them as a list, however, lets a reader infer that "durable user holdings" is near — it is not. The
durable leg is the *last* thing to become true, and it is gated on authorities that no amount of
IRR-side implementation can produce.

This document therefore defines **WS-A-DM** as a single milestone with nine pillars, states the
acceptance criterion for each pillar in a form that can be measured rather than argued, classifies
each pillar against a controlled five-state vocabulary, and fixes the rule for when the milestone may
be declared complete.

### 0.1 The non-completion rule (normative)

> **WS-A-DM is NOT complete when fixture-based durable persistence passes and evidence-journal
> restart recovery passes.**

Those two results are necessary and they are already in hand. They are **not** sufficient, for three
independent reasons:

1. **They are fixture-scoped, not user-scoped.** The durable holdings evidence exercises IPD's
   qualification fixture path. It demonstrates that the persistence machinery works when it is
   allowed to write. It does not demonstrate — and is not permitted to demonstrate — a save of
   real-user holdings.
2. **The write path is closed by design, not by accident.** Gate E W-1 is unmet, so
   `evaluatePortSaveGuard()` is hard-false, so `persistBrokerImport` returns `WRITE_NOT_AUTHORIZED`
   with `storeEffect: 'NONE'`. A milestone whose defining capability is currently *refusing* cannot
   be complete because the refusal is well-tested.
3. **67 of 68 identities are unresolved.** Durable persistence of rows that cannot be resolved to an
   authoritative security-master entity would be durable persistence of unresolvable data. P04
   quarantine and DP-2 Option 2F exist precisely to prevent that, and both are in force.

Declaring WS-A-DM complete on the strength of (1) and (2) would also collapse the distinction the
program has been careful to keep between *implementation* and *authorization*. This document keeps
them apart.

### 0.2 Controlled status vocabulary

Every pillar is classified in exactly one of these five states. The states are **not** a ladder; a
pillar can be `IMPLEMENTED-VERIFIED` while the milestone is blocked elsewhere, and a pillar at
`AWAITING-AUTHORITY` must never be reported as complete.

| State | Meaning | Reporting rule |
| :--- | :--- | :--- |
| **`IMPLEMENTED-VERIFIED`** | Code exists on `main`, and its behaviour is verified by published, reproducible evidence at the current pin. | May be reported as done, **with the evidence citation**. |
| **`AWAITING-AUTHORITY`** | The technical work exists (or is fully specified) but exercising it requires an authority act that has not been rendered. | Must be reported as **PENDING AUTHORITY**. Never as complete, never as blocked-on-engineering. |
| **`BLOCKED-EXTERNAL`** | Progress requires an artefact, decision or environment outside IRR's control — operator-supplied data, an IPD-owned process, or an unreachable host. | Must name the **exact** external dependency and the accountable owner. |
| **`NOT-IMPLEMENTED`** | No code exists, and none is authorized to exist yet. | Must say so plainly. Distinguish from `AWAITING-AUTHORITY`, which implies the engineering is ready. |
| **`NOT-QUALIFIED`** | Implementation may exist, but the qualification or admission evidence required to treat it as production-capable has not been produced. | Must cite the outstanding qualification items by ID. |

### 0.3 Milestone completion criterion (normative)

**WS-A-DM is complete only when all nine pillars are simultaneously `IMPLEMENTED-VERIFIED`, and the
pillar-8 and pillar-9 authorities are effective, published and independently read back.**

Partial credit is not completion. A milestone review must produce, per pillar: the acceptance
criterion, the measured result, the evidence path, and the state. If any pillar is in any state other
than `IMPLEMENTED-VERIFIED`, the milestone is **NOT COMPLETE** and the review must list the
outstanding actions with owners and dependencies.

---

## 1. Pillar definitions and acceptance criteria

### Pillar 1 — Governed identity resolution and security-master integrity

**Definition.** Every imported holding row is individually assessed against an authoritative
identifier in the governed D05 security master, using exchange-scoped lookups, with the assessment
result published per row and retained durably. No row is resolved by name similarity, inference or
guesswork.

| # | Acceptance criterion (measurable) |
| :--- | :--- |
| 1.1 | Every native row in an import produces exactly one `BrokerIdentityAssessment` carrying a 1-based `rowIndex`, the verbatim `suppliedIdentifier`, an `identifierClass`, ordered `lookups[]`, a `status`, and — when unresolved — a `refusalCode` and `missingEvidence`. |
| 1.2 | `identifierClass` is one of `ISIN`, `EXCHANGE_SCOPED_SYMBOL`, `UNSCOPED_NAME_OR_SYMBOL`, `NONE`, assigned from the supplied data, never from the company name's appearance. |
| 1.3 | Lookups are **exchange-scoped**: an `Exchange=NSE` row queries `NSE_SYMBOL` only; `Exchange=BSE` queries `BSE_SYMBOL` only; an ISIN row queries `ISIN` only. **No speculative cross-exchange fallback.** |
| 1.4 | After a row resolves, the remaining namespaces are recorded as *not queried* with the reason, rather than silently skipped. |
| 1.5 | The security master is the governed D05 corpus with a citable `masterRevision` (corpus digest), and resolution is only ever against it. |
| 1.6 | A file-level refusal never masks the per-row vector: the complete per-row evidence is published alongside any whole-import refusal, and the refusal is shown to name only one row. |
| 1.7 | **For the milestone (not for the current fixture):** the operator's real 68-row import resolves to a rate the PA accepts, with every unresolved row individually evidenced and quarantined. |

**Owner.** IPD owns the assessment engine, the adapter and the D05 master + its deposition process.
IRR owns consumption and reporting of the result. **Boundary: IRR must not copy IPD
identity-resolution logic into IRR.**

---

### Pillar 2 — Durable holdings persistence

**Definition.** Resolved holdings rows are written to the governed durable store through the
qualified path, with the write authorized, owner-scoped, and recoverable.

| # | Acceptance criterion |
| :--- | :--- |
| 2.1 | The persistence path is exercised end-to-end against the **IPD qualification fixture** and produces a durable, re-readable result. |
| 2.2 | `persistBrokerImport` returns a truthful disposition and `storeEffect`, and refuses (`WRITE_NOT_AUTHORIZED`, `storeEffect: 'NONE'`) whenever the save guard is false. |
| 2.3 | The designated store path is the governed literal (`C:\iips-data\iips\user-portfolio.sqlite` for the legacy P-1 limb); no alternative or sandbox path is silently substituted. |
| 2.4 | **Real-user durable save** occurs only under an effective U6 write authorization, with Gate 4 acceptance and Gate 5 admission rendered first. |
| 2.5 | No real-user holdings save occurs while any authorization gate is closed — asserted, not assumed. |

**Owner.** IPD owns the durable holdings implementation; IRR owns the refusing consumer and the
adapter wiring; **PA owns criterion 2.4**.

---

### Pillar 3 — Durable import-evidence retention **and retrieval**

**Definition.** Each import produces one durable evidence record, retained append-only, digest-bound,
and retrievable by its owner through a governed path.

Retention and retrieval are **two different pillars-worth of work** and are deliberately separated
here, because the program already has the first and not the second.

| # | Acceptance criterion |
| :--- | :--- |
| 3.1 | Retention: one append-only PF-1 journal record per import, schema `IIPS_BROKER_IMPORT_EVIDENCE_V1`, containing the per-row identity evidence and the P04 quarantine references. |
| 3.2 | Each record carries a `recordDigest` and the digest is recomputed and compared on every read. |
| 3.3 | Retrieval: the record is obtainable by its owner through a governed path. **This limb requires transport admission, an owner-context carrier, a retention period and purge rule, and a reconciled consent statement.** |
| 3.4 | Retrieval does not widen any existing surface: the twelve `/api/user-portfolios*` `503` fence pairs remain byte-stable, and the certified `/api/evidence/:id` read surface is not reused for broker-import evidence. |
| 3.5 | The journal's **local** durability does not depend on the retrieval limb being authorized. |

**Owner.** IRR owns the journal and any future route; **PA owns criterion 3.3's authority**.

---

### Pillar 4 — Restart recovery and integrity verification

| # | Acceptance criterion |
| :--- | :--- |
| 4.1 | After a process restart in a **separate OS process**, every row record of the retained import is recovered, in order. |
| 4.2 | The recovered record's digest matches the retained record's digest. |
| 4.3 | A tampered or corrupted record fails closed with a distinct, non-generic error, and is not silently repaired or dropped. |
| 4.4 | An incomplete inventory fails closed (`EVIDENCE_INVALID`) rather than partially succeeding. |
| 4.5 | An unwritable or unreadable journal location fails closed rather than degrading to in-memory-only. |
| 4.6 | Recovery is demonstrated at the **pin in force**, not only at a historical pin. |

**Owner.** IRR.

---

### Pillar 5 — Idempotent imports and duplicate prevention

| # | Acceptance criterion |
| :--- | :--- |
| 5.1 | A repeated import of byte-identical content produces **no** additional evidence record and no additional durable holdings write. |
| 5.2 | The deduplication key is content-derived and owner-scoped (`importId = sha256(broker ‖ contentDigest ‖ readAt)`), not timestamp-derived alone. |
| 5.3 | The **first** retention is authoritative: a duplicate returns the stored record with its **original** digest, not a freshly minted one. |
| 5.4 | Where any component of a record is legitimately non-reproducible, that fact is **recorded as a limitation inside the record** rather than hidden by weakening the digest. |
| 5.5 | Idempotency holds across separate OS processes, not only within one process's lifetime. |

**Owner.** IRR (journal) + IPD (quarantine id minting, whose non-determinism criterion 5.4 addresses).

---

### Pillar 6 — Owner isolation and access boundaries

| # | Acceptance criterion |
| :--- | :--- |
| 6.1 | One owner's evidence records are invisible to another owner's reads — asserted by test, not by convention. |
| 6.2 | Any future retrieval route carries an owner-context carrier of the governed shape (the NP-06 R1 precedent: fixed tenant/owner literals bound by a content digest), and refuses targets outside it. |
| 6.3 | Canonical `companyId` is **not** exposed through a CSV-derived surface. |
| 6.4 | The broker-import HTTP route set stays closed at exactly the admitted routes; unadmitted paths `404`, wrong methods `405` with `Allow`, and any query string is rejected before socket work. |
| 6.5 | No new HTTP/TCP listener and no new IPC operation is introduced as a side effect of durability work. |

**Owner.** IRR; **PA owns 6.2's authority** (it arrives with criterion 3.3).

---

### Pillar 7 — Failure handling and fail-closed behaviour

| # | Acceptance criterion |
| :--- | :--- |
| 7.1 | Unresolved identities produce P04 quarantine records that are retained as evidence, one per failed lookup. |
| 7.2 | Whole-import refusal (DP-2 Option 2F) stays in force while any row is unresolved; `identitySummary.saveable` is false unless **every** row resolved. |
| 7.3 | Gate E W-1 remains unmet until its own criteria are met; `evaluatePortSaveGuard()` is not weakened, short-circuited or bypassed. |
| 7.4 | Every failure mode names itself distinctly (`EVIDENCE_TAMPERED`, `EVIDENCE_INVALID`, `WRITE_NOT_AUTHORIZED`, `UNMAPPED_IDENTIFIER`, `NO_AUTHORITATIVE_IDENTIFIER_MATCH`, `AMBIGUOUS_COLLISION`, `EXPIRED_EFFECTIVE_DATE`, `LOOKUP_ERROR`) — no generic error swallowing a specific cause. |
| 7.5 | A dependency-packaging change that would break the build fails **closed at install/build time** (all `pre*` hooks), not at runtime in front of a user. |
| 7.6 | Failures are reported honestly in evidence, including when the failure is in the evidence harness itself. |

**Owner.** IRR + IPD; **PA owns any relaxation, and none is requested**.

---

### Pillar 8 — Authorized real-user save capability

This pillar is **the** milestone gate. It is not an engineering task.

| # | Acceptance criterion |
| :--- | :--- |
| 8.1 | An effective **PA-09** designation of the final Gate 4 QE/H-12 pin and scope, with exact commit, tree, blob set and purpose. |
| 8.2 | **QE-1…QE-11** executed natively at that pin with raw transcripts, tier classification and Q11 digest bookends (QE-8 via the approved RV-1 disposable-copy procedure). Currently **0/11**. |
| 8.3 | **S3** preflight and **H-12** adoption at the designated pin. |
| 8.4 | Gate C subset acceptance rendered, then a separate **Gate 4 / U4** result-acceptance act. |
| 8.5 | **DQ-4** established at 10/10 — criteria 7 (host sequence) and 8 (canonical native-Windows evidence) are the two unmet. Currently **8/10**. |
| 8.6 | A separate **Gate 5 / CV-52 / U5** admission act naming exact qualified commits and lifted fences. |
| 8.7 | A separate **U6** operational write authorization (`durable: true`, `503` fence lift, W-1 satisfaction). |
| 8.8 | Only then: a real-user durable save, evidenced, with the guard change itself authorized. |

**Owner.** **PA (Ramki)** for 8.1 and 8.4–8.7; **Operator** for 8.2–8.3. **No IRR work can advance
this pillar.**

---

### Pillar 9 — Required governance and admission evidence

| # | Acceptance criterion |
| :--- | :--- |
| 9.1 | Every authority relied on is an **effective, published** act, independently read back at its merge SHA. |
| 9.2 | Historical statements are preserved unamended; superseded-for-currency statements are indexed by dated pointer, never rewritten. |
| 9.3 | Repository ownership is respected: **zero cross-repository writes**; IPD-owned processes (D05 deposition, identity logic) are never re-implemented in IRR. |
| 9.4 | Every published artefact is verified remotely — ref read-back plus byte-level digest comparison of every changed path at the merge SHA. |
| 9.5 | Evidence is reproducible: generators are committed alongside their outputs, and manifests bind exact commits. |
| 9.6 | Limitations are recorded inside the evidence, including non-reproducibility, reconstruction-vs-observation distinctions, and unverified user-reported results. |
| 9.7 | The tracker registers the change additively, with the next-free identifier allocation advanced and the protected compatibility tokens untouched. |
| 9.8 | No production scope is exercised at any point before pillar 8 completes. |

**Owner.** IRR for 9.2–9.5, 9.7; **PA** for 9.1; both for 9.6 and 9.8.

---

## 2. Current classification of the nine pillars

Assessed at IRR `main@1afa1fb…`, IPD `main@6df748d…`, broker-import pin `7bcae35…`.

| Pillar | State | Basis | What is outstanding |
| :--- | :--- | :--- | :--- |
| **1** Governed identity resolution and security-master integrity | **`BLOCKED-EXTERNAL`** | Criteria **1.1–1.6 all `IMPLEMENTED-VERIFIED`** at the new pin: 68/68 rows individually assessed, AGI GREENPAC resolved via its governed NSE alias with BSE recorded *not queried*, the other 67 `NO_AUTHORITATIVE_IDENTIFIER_MATCH`, exchange scoping proven behaviourally in all three directions, no speculative BSE fallback, no file-level masking. | **Criterion 1.7.** The operator's real import cannot be fully resolved: no `DHAN_DETAILED_HOLDINGS_V1` artefact exists in either repository and no authorized acquisition path can fetch one; and decisively **0 of the 67** companies exist in the governed D05 corpus (2,250 entities), so even a perfect export resolves nothing today. Needs **A-5** (operator export) then **A-6** (IPD D05 deposition under a new act). |
| **2** Durable holdings persistence | **`NOT-QUALIFIED`** | Criterion **2.1 `IMPLEMENTED-VERIFIED` on the qualification fixture only**; **2.2, 2.3, 2.5 `IMPLEMENTED-VERIFIED`** (the refusing consumer is real, tested, and refuses). | **Criterion 2.4 — the whole point of the pillar.** No effective U6 write authorization; Gate 4 acceptance not rendered; Gate 5 not admitted. Fixture persistence is explicitly **not** a real-user save and confers no authorization. |
| **3** Durable import-evidence retention and retrieval | **Retention `IMPLEMENTED-VERIFIED`; retrieval `AWAITING-AUTHORITY`** | **3.1, 3.2, 3.5 `IMPLEMENTED-VERIFIED`** (PF-1 journal merged at PR #434; digest recomputed on read; local durability independent of any route). **3.4 `IMPLEMENTED-VERIFIED`** as a standing constraint (route set closed at two routes; fences byte-stable). | **Criterion 3.3.** Blocker **`WS-A-EV-ROUTE-1`**. Four things are absent: transport admission for a third route; an owner-context carrier; a retention period and purge rule (PF-1 compaction was explicitly *not* built in v1); and a reconciled consent statement — current UI copy says files are "not uploaded or stored", which a retrieval route would contradict. Minimum authority prepared as **`PROPOSED — NOT EFFECTIVE`, Act ID `PENDING ASSIGNMENT`**. Needs **A-8** then **A-9**. |
| **4** Restart recovery and integrity verification | **`IMPLEMENTED-VERIFIED`** | **4.1–4.6 all met and re-verified at the pin in force**: 68 row records recovered in order across separate OS processes; digest `3f519e1c…3b30f4` identical across three processes; tamper → `EVIDENCE_TAMPERED`; incomplete inventory → `EVIDENCE_INVALID`; unwritable journal fails closed. | Nothing. This pillar is complete. |
| **5** Idempotent imports and duplicate prevention | **`IMPLEMENTED-VERIFIED`** | **5.1–5.5 all met**: no duplicate retention across three separate OS processes; content-derived owner-scoped `importId`; first retention authoritative with its original digest. Criterion **5.4** is satisfied by *recording* the limitation rather than weakening the digest — P04 quarantine ids are minted per lookup by the IPD pipeline (`ident-quar-<epochMillis>-<random>`) and are process-specific, so a rebuilt record digests differently; the harness now demands an exact round-trip digest on a **first** retention and compares against the authoritative retained record on a **duplicate**, while proving every stable field still matches. | Nothing. This pillar is complete, **with its recorded limitation**. |
| **6** Owner isolation and access boundaries | **Isolation `IMPLEMENTED-VERIFIED`; carrier `AWAITING-AUTHORITY`** | **6.1, 6.3, 6.4, 6.5 `IMPLEMENTED-VERIFIED`**: foreign-owner invisibility asserted; `companyId` deliberately not re-exposed; `matchRoute` admits exactly `POST …/holdings` and `GET …/revision`, everything else `404`, wrong method `405` + `Allow`; no new listener, no new IPC operation. | **Criterion 6.2** arrives only with 3.3 — an owner-context carrier cannot be built for a route that has no transport authority. Needs **A-8**. |
| **7** Failure handling and fail-closed behaviour | **`IMPLEMENTED-VERIFIED`** | **7.1–7.6 all met**: 134 P04 quarantine records retained for the 67 unresolved rows; `saveable: false`; Gate E W-1(3)/W-1(4) hard-false so the save guard refuses; every failure mode distinctly named; the packaging regression failed closed at `TS18003` in all five `pre*` hooks rather than at runtime; and the harness's own digest divergence was reported rather than papered over. | Nothing. This pillar is complete — and must **stay** complete: no relaxation is requested or authorized. |
| **8** Authorized real-user save capability | **`AWAITING-AUTHORITY`** | Nothing in this pillar is an IRR engineering task, and nothing has been rendered. | **All of 8.1–8.8.** PA-09 pin **OPEN**; QE **0/11**; S3 not started; H-12 **NOT ADOPTED**; P-1 `AUTHORIZED — ONE ATTEMPT — UNSPENT`; P-1-F `NOT RECONCILED / RETRY_BLOCKED`; Gate C and Gate 4/U4 acceptance **NOT RENDERED**; DQ-4 **8/10**; Gate 5 **`NOT INITIATED / NOT ADMITTED`**; U6 **NOT AUTHORIZED**. Host-only work on `desktop-no0nhtp`, which is unreachable from this environment. Needs **A-10 … A-15**. |
| **9** Required governance and admission evidence | **`IMPLEMENTED-VERIFIED` for this pass** | **9.1–9.8 met for the WS-A pin advance**: PRs #436/#437/#439 merged and each independently read back (33/33, then 4/4 changed paths byte-matched at the merge SHA); historical records preserved unamended with dated addenda; zero IPD writes; generators committed beside their outputs; `SHA256SUMS.txt` manifests; limitations recorded inside the evidence; the A-16 tracker registration is additive with the next-free allocation advanced. | **9.1 is only ever complete per-artefact** — each future authority act needs its own read-back. And 9.8 must be re-asserted at every subsequent pass. |

### 2.1 Milestone roll-up

| | |
| :--- | :--- |
| Pillars `IMPLEMENTED-VERIFIED` | **4, 5, 7, 9** — four of nine |
| Pillars partially verified with an authority-gated limb | **3** (retention done, retrieval gated), **6** (isolation done, carrier gated) |
| Pillars `NOT-QUALIFIED` | **2** — fixture-verified, real-user save not authorized |
| Pillars `BLOCKED-EXTERNAL` | **1** — needs operator data and an IPD-owned deposition |
| Pillars `AWAITING-AUTHORITY` outright | **8** — the milestone gate |
| **WS-A-DM overall** | **NOT COMPLETE** |

**The single truest sentence about this milestone:** the engineering that IRR owns is largely done and
verified; what remains is *data* IRR cannot obtain (pillar 1) and *authority* IRR cannot render
(pillars 2, 3, 6, 8). No further IRR implementation moves WS-A-DM forward until A-5 or A-8 or A-10
is discharged by someone else.

---

## 3. Completion framework — how WS-A-DM is reviewed and closed

### 3.1 Sequencing

The nine pillars do not unlock in numeric order. The dependency spine is:

```text
A-5  operator supplies DHAN_DETAILED_HOLDINGS_V1 locally
  └─> A-6  IPD + PA: governed D05 deposition under a NEW authorization act
        └─> A-7  IRR: re-run the 68-row assessment, publish row-level results
              └─> PILLAR 1 criterion 1.7 satisfied (rate PA accepts)

A-8  PA renders the evidence-route transport authority amendment
  └─> A-9  IRR implements the route (+ owner carrier, retention, consent)
        └─> PILLAR 3 criterion 3.3 and PILLAR 6 criterion 6.2 satisfied

A-10 PA-09 pin designation
  └─> A-11 S2/Limb A + H-12 + S3 + QE-1…QE-11 (0/11 -> 11/11)
        └─> A-12 Gate C acceptance, then Gate 4 / U4 acceptance
              └─> A-13 DQ-4 freeze (8/10 -> 10/10)
                    └─> A-14 Gate 5 / CV-52 / U5 admission
                          └─> A-15 U6 write authorization
                                └─> PILLAR 8 satisfied -> PILLAR 2 criterion 2.4 satisfied
                                      └─> WS-A-DM COMPLETE
```

Pillars 4, 5, 7 and 9 are already satisfied and need only **re-assertion** at each review, not
re-implementation.

### 3.2 Review procedure (mandatory at every WS-A-DM review)

1. Re-resolve the authoritative IRR and IPD `origin/main` commits and the pin in force. Never carry
   them forward from a previous review.
2. For each of the nine pillars, state the acceptance criteria met, the measured result, the evidence
   path, and the controlled state. A pillar without a cited artefact is not verified.
3. Re-run **only** what the newly integrated state requires. Do not repeat already-passing tests
   without a specific recorded reason.
4. Re-assert the invariants that must never drift: Gate E W-1 unmet, P04 in force, DP-2 Option 2F
   whole-import refusal, the twelve `/api/user-portfolios*` `503` fences byte-stable, no `companyId`
   on a CSV-derived wire, no new listener or IPC operation, zero IPD writes.
5. Publish the review additively and read it back remotely at the merge SHA.
6. State the milestone roll-up and, if not complete, the outstanding actions with owners,
   dependencies and completion evidence.

### 3.3 Prohibitions carried into the milestone (normative)

* **No guessed identifiers.** No name similarity, no `INE…` pattern completion, no inferred symbols,
  no synthetic or placeholder D05 mappings. Rows stay unresolved when authoritative evidence is
  absent.
* **No claim that the 67 are resolved** without row-level evidence for each row.
* **No bypass or weakening** of P04 quarantine, Gate E W-1, DP-2 Option 2F, Gate 4 qualification or
  Gate 5 admission — including no "temporary" relaxation for testing.
* **No premature HTTP evidence route.** No route is implemented, exposed, registered or mounted
  before its authority act is effective, published and read back.
* **No real-user durable save** before Gate 4 and Gate 5 authorization plus U6 are effective.
* **No production scope.**
* **No duplicate implementation** of already-completed durability components — the evidence journal
  exists and is merged; it is extended, never recreated.
* **Repository ownership respected.** IRR does not write IPD; IPD identity logic is consumed through
  the pin, never copied.
* **Fixture success is not user success.** No fixture-based result may be reported as a real-user
  durable save, and no pin advance, merge, assessment or fixture persistence may be reported as
  authorization.

### 3.4 What would legitimately allow a "COMPLETE" declaration

All of the following, simultaneously, each with a published and remotely-read-back artefact:

1. Pillar 1 criterion 1.7 met — the operator's real import assessed row by row at a resolution rate
   the PA accepts, every unresolved row individually evidenced and quarantined.
2. Pillar 3 criterion 3.3 met — retrieval authorized, implemented, owner-carried, retention-bounded,
   consent-reconciled, fences byte-stable.
3. Pillar 6 criterion 6.2 met — the owner-context carrier effective and tested.
4. Pillar 8 met in full — PA-09 designated, QE **11/11**, S3 and H-12 done, Gate C and Gate 4/U4
   acceptances rendered, DQ-4 **10/10**, Gate 5 admitted, U6 authorized.
5. Pillar 2 criterion 2.4 met — a real-user durable save evidenced under that authorization, with
   the guard change itself authorized.
6. Pillars 4, 5, 7, 9 re-asserted at the then-current pin.
7. The milestone review published additively and independently verified at its merge SHA.

Until all seven hold, the correct report is: **WS-A-DM NOT COMPLETE**, with the outstanding register.

---

## 4. Cross-references

| Subject | Record |
| :--- | :--- |
| Pin advance implementation | `docs/integration/WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR127-2026-11-05.md` |
| §4 detailed-holdings source investigation | `docs/integration/WS-A-DHAN-DETAILED-HOLDINGS-SOURCE-INVESTIGATION-2026-11-05.md` |
| §5 evidence-retrieval authority gap | `docs/integration/WS-A-EVIDENCE-RETRIEVAL-ROUTE-AUTHORITY-GAP-2026-11-05.md` |
| Consolidated workstream report | `docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md` |
| Reproducible evidence set | `evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/` |
| Transport authority in force | `docs/integration/IIPS_v3.0_CAP02_U1_BROKER_IMPORT_TRANSPORT_AUTHORITY_ACT_EFFECTIVE_2026-10-23.md` |
| Outstanding residuals (RS-07…RS-11, RS-22) | `docs/integration/completed-work-registers-2026-11-02/D-outstanding-residuals-register.csv` |
| Tracker registration | `§16.249` / `CV-CORR-229` of `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` |

---

**This document is a definition and a framework. It authorizes nothing, admits nothing, accepts
nothing and moves no gate. Workstream A and milestone WS-A-DM remain NOT COMPLETE.**


## 5. Current reconciliation overlay — definition preserved (`2026-11-06`)

Read historical criteria/status above with R2 §24, IID roadmap B.M and tracker §16.261 / CV-CORR-241.
`CONSOLIDATED-GATE4-HOLDINGS-IDENTITY-PA-DECISION-PAPER-2026-11-06.md` consolidates outstanding decisions;
it does not redefine this milestone, relax criteria, accept results or authorize writes.

Retention/retrieval and owner-controlled active-store-clearing capability are completed published work, not
new engineering tasks. Historical retrieval-pending/retention-bounded wording is superseded for status by
AMEND-01/02 and implementation/closure receipts. Preserve indefinite retention until explicit reset, offline
owner-only whole-active reset, verified retained recovery copy and possible restore/resubmit resurrection;
no permanent/all-copy erasure, selective rewrite or stronger OS/filesystem guarantee. No operational reset here.

Historical R5 is adopted with **all three coordinates**; do not read older “H-12 NOT ADOPTED” as undoing that act.
Current PA-09 content/execution-basis disposition and regenerated qualified inventory remain pending. Gate 4
QE **0/11**, Gate C/U4 **NOT RENDERED**, Gate 5 **NOT INITIATED / NOT ADMITTED**, DQ-4 **8/10**, U6 **NOT AUTHORIZED**.
Four Gate 4 decisions and D01–D06 remain unrendered; no execution pin. Genuine detailed Dhan identifiers/A-5,
authorized A-6 and dependent A-7 still block full real identity coverage (summary evidence 1 resolved/67 unresolved).
Do not portray the old symbol-space probe as tested unknown-ISIN absence.

IID-1/2/3 are remotely merged including concurrent #464/#467; IID-4/5/6 NOT STARTED. Synthetic IID M-1 does not
complete real-user holdings, R-16 or the full UI. Existing verified fixture recovery/isolation/fail-closed scope
is retained; no whole-pillar promotion is inferred here. W-1(3)/(4) remain hard-false. D01–D06, identity intake
and expansion, host qualification, accepted results and named-operation admission remain the real blockers.
**Workstream A / WS-A-DM remain NOT COMPLETE. No production or real-user holdings operation is authorized.**


## 6. Express PA adoption — milestone constraints unchanged (`2026-11-06`)

Original criteria and past status tables remain historical; this overlay reconciles only current authority.
Tracker §16.263 / CV-CORR-243 / V2138, R2 §26 and docket §8 supply the current operative cross-references.
No entire milestone pillar or real-user-save criterion is promoted by documentary adoption.

**Current operative status — explicit PA adoption, not recommendations:** G4-2 **ADOPTED (C-3 deferral only)**;
D01 **ADOPTED (canonical IIPS G-2 portfolio repository: ramkivs/iips-production-market-data)**;
D04 **ADOPTED (holdings snapshots and contribution lineage; trade/cash/tax-lot accounting excluded)**.
Authority instrument `IIPS_v3.0_PA_G4_C3_D01_D04_ADOPTION_ACT_2026-11-06.md`, Act ID `IIPS-V3-PA-THREE-DECISION-ADOPTION-2026-11-06-01`.
Decision authority IDs respectively `IIPS-V3-CAP03-G4-C3-DEFERRAL-2026-11-06-01`,
`IIPS-V3-G2-PORTFOLIO-REPOSITORY-DESIGNATION-2026-11-06-01`,
`IIPS-V3-G2-SNAPSHOT-SCOPE-CONFIRMATION-2026-11-06-01`. PA approval/effectiveness date 2026-11-06;
act §5 requires green exact-head/main publication and independent readback, discharged by the final PR receipt
comment. No further PA choice is pending for these three. No implementation authority is granted.

Current pending source: `evidence/integration/pa-three-decision-adoption-2026-11-06/current-register.json` — **12**, not 15:
**G4-1, G4-3, G4-4, D02, D03, D05, D06, A-5, A-6, A-7, IID-DATA, IID-L016**.
Historical 15-pending/zero-adoption source snapshots remain unchanged as history, not the current register.
The three adopted records are outside the pending array and cross-reference their authority. Remaining
classes: seven CONDITIONAL, two DEFERRED, three REQUIRES SEPARATE AUTHORIZATION; none promoted automatically.
Eight prior effective/settled crosswalks remain preserved.

D01/D04 discharge repository and snapshot-domain ambiguity for D03/D05/D06 planning. D03 may advance exact
**documentary** lifecycle/revision/overflow/retry/unknown-outcome and non-empty receipt/projection contracts;
D02 owner-binding extension and D03 semantic disposition remain outstanding. D05 may prepare its exact
implementation/test/backup/recovery/host envelope, but needs separate explicit implementation authority.
D06 may prepare snapshot-only operation admission criteria, but requires accepted qualification/results and
separate named-operation admission. A-6 expansion remains ungranted; A-5 genuine ISIN+Exchange and authorized
A-6 precede A-7. Missing source ISINs are not tested-absent.

Next documentary readiness work item **WS-A-DH-EXEC-READINESS-02-2026-11-06** is prepared in `DURABLE-HOLDINGS-NEXT-EXECUTION-READINESS-PACKAGE-2026-11-06.md`,
with owner-binding, lifecycle/retry/projection, backup/recovery/host, H01–H12/QE evidence and admission lanes.
**ipo-screening-engine is outside IIPS architecture and dependency tracking**; old comparisons are historical
only, not an alternative repository or qualification input. No transfer, rename or modification of either repository.

G4-2 adoption designates **no content or QE execution pin**. Historical R5/Path A preserved; QE **0/11**,
Gate C/U4 **NOT RENDERED**, Gate 4 unaccepted; Gate 5 **NOT INITIATED / NOT ADMITTED**, DQ-4 **8/10**,
U6 **NOT AUTHORIZED**. W-1 remains hard-false. No holdings writes, operational DB access, provisioning/migration,
IPD mutation, expansion, production, PF-1/frozen-authority or completed retention/clearing implementation change.
Completed retention/retrieval and offline owner-only whole-active clearing, verified retained recovery copy,
restore/resubmit resurrection and OS/filesystem limitations remain. IID-1/2/3/4 MERGED (IID-4 via #471),
IID-5/6 NOT STARTED; R-16/L-001–L-027 not closed. **Workstream A / WS-A-DM NOT COMPLETE.**


## 7. Prompt 8 — contract/readiness advance, no qualification promotion (`2026-11-06`)

Read original criteria with effective-authority overlay §6 and tracker §16.264 / CV-CORR-244 / V2139,
R2 §27. This is a versioned specification cross-reference, not a changed milestone definition.

Specification `DURABLE-HOLDINGS-CONTRACT-AND-QUALIFICATION-SPEC-v1-2026-11-06.md`, version **1.0.0**,
work item **WS-A-DH-CONTRACT-READINESS-03-2026-11-06**, and machine appendices at
`evidence/integration/durable-holdings-contract-v1-2026-11-06/` complete documentary contract/test readiness.
G4-2/D01/D04 remain EFFECTIVE from #474; no re-adoption or new Act ID. Canonical IPD repository and snapshot/
contribution scope remain unchanged. D02 prospective owner/technical-tenant proposal, D03 precise lifecycle/
API semantics, D05 named file/test/backup/host envelope and D06 admission gates are now explicit.

New provenance/observed fields are a proposed **consumer contract 2.0.0 / frame v=2** amendment, not admitted
v1 behavior. Existing v1/refusals stay unchanged. D03 choices include empty INITIAL creation, safe-integer
cap successor/stale-first duplicate ordering, complete observed snapshot (no additive cross-broker union),
no automatic retry and exact minimal-receipt/non-empty nullable contribution/readback mapping. PA must
expressly decide the semantic/projection/DR/version amendments; this specification grants no runtime change.
D02 request prospectively proposes owner-4dc756b3 with retained IPD technical tenant ipd-personal-local;
evidence tenant/carrier is not holdings authority. Existing data requires separate exact disposition.

P8-D02/D03/D05/D06-REQ-01 are **request IDs only**, not rendered acts. D02 NOT ADOPTED; D03 CONDITIONAL /
PROPOSED; D04 EFFECTIVE; D05 separate implementation authority UNGRANTED; D06 CONDITIONAL / NOT ADMITTED.
The operative authority register remains **3 effective / 12 pending**. H01–H12 all specified individually;
20 synthetic JSON-schema vectors validated, **24 runtime test definitions NOT EXECUTED**. No H criterion
is promoted to qualified/complete; real broker/host evidence remains distinct. D05/A-6 separate authority,
A-5 genuine detailed ISIN/Exchange/provenance and A-7 after authorized A-6 remain outstanding. Missing source
ISINs are unknown, not tested-absent. IID-1–4 MERGED, IID-5/6 NOT STARTED at rebaseline; R-16/L-001–L-027 retained.

**READY for a subsequent bounded authorization decision; NOT authorized to implement or operate.**
W-1 hard-false; QE **0/11**, Gate C/U4 **NOT RENDERED**; no Gate 4 acceptance/execution pin, holdings writes,
operational DB access, IPD source/docs mutation, provisioning/migration, expansion, admission or production.
PF-1, frozen authorities/owner isolation and completed retention/clearing unchanged, including retained
recovery-copy/restore-resurrection limits. **WS-A/WS-A-DM NOT COMPLETE.** Publication CI/readback proof in final PR comment.

## 7. Current prerequisite-closure pointer (`2026-11-06`)

Read unchanged milestone criteria and historical statuses with the single current `PRE-QE-PREREQUISITE-CLOSURE-REPORT-2026-11-06.md`, tracker §16.268 / CV-CORR-248. Six adopted decisions include D02/D03/D05; IPD #129/#130 publication is verified, not qualification. No milestone criterion is relaxed and no completed retention/clearing/persistence/duplicate work is repeated. Historical R5 remains effective but final H-12 basis/regeneration/adoption is blocked; H01–H12 each NOT QUALIFIED. Exact residual IPD/paired-contract, host/provisioning/PF15, genuine-data and PA-only completion conditions/owners are in that report. QE0/11; GateC/U4 NOT RENDERED; DQ4 8/10; Gate5/D06 NOT ADMITTED; U6 NOT AUTHORIZED; W1 hard-false. This pointer is neither a new act nor an implementation/write/admission grant. WS-A/WS-A-DM NOT COMPLETE.
