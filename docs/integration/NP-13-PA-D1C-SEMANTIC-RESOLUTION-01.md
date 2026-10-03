# NP-13 — PA-D1C SEMANTIC RESOLUTION: D1-C #1–#10 DURABLE PUBLICATION

> **Record identifier:** `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01` — PA-D1C Semantic Resolution & Durable Capture
> **Document type:** `AUTHORITY DECISION` — durable publication of the Program Authority semantic rules for D1-C #1–#10
> **Gate:** **NP-13 D1-C — Semantic Authoring, Resolution & Durable Publication Gate**
> **Publication record date:** 2026-10-03
> **Program Authority:** Ramki (Ramakrishnan)
> **Repository:** IRR — `ramkivs/iips-review-recovered`
> **Authoritative durability destination:** `origin/main` (`refs/heads/main`)
> **Decision published:** **D1-C #1–#10 = A — RESOLVED (complete semantic policy adopted verbatim)**
> **Resulting state:** **D1-C = RESOLVED (10/10 dimensions carry explicit Program Authority semantics)** · **D1 = OPEN / INCOMPLETE / NOT CLOSED** · **D2 = NOT ELIGIBLE** · **D3 = NOT ELIGIBLE**
> **Boundaries:** Production OUT OF SCOPE · IPD OUT OF SCOPE — not accessed, not modified · **Implementation NOT AUTHORIZED**
> **Authority granted by this record:** semantic governance only — no implementation, production, certification, or release authority

---

## 1. ADOPTION

1.1 The complete semantic policy for D1-C #1–#10 was supplied by the Program Authority (Ramki) in the **NP-13 D1-C — Semantic Authoring, Resolution & Durable Publication Gate** and was **explicitly adopted by the Program Authority as the authoritative D1-C semantic decision** in that gate.

1.2 The rules at §3 below are reproduced **verbatim** as supplied. No rule was paraphrased, reinterpreted, supplemented, or altered. No element was inferred. No semantics were imported from any implementation, codebase, prior bounded record, or external source.

1.3 **Guard results at capture:** completeness **10/10 PASS** · cross-dimension consistency **PASS** · G-4/G-5 protection **PASS** (existing G-4/G-5 semantics preserved; not modified, broadened, narrowed, or replaced by this record).

1.4 **Pre-publication verified baseline:** `origin/main` = `9c953867235ad0651c9f41c8c9a67b184c0582f6`, verified live via independent mechanisms (`git ls-remote` and GitHub ref/commit API in agreement) immediately before this publication.

## 2. RESOLUTION TRANSITIONS

```text
D1-C #1:  B → A
D1-C #2:  B → A
D1-C #3:  B → A
D1-C #4:  B → A
D1-C #5:  B → A
D1-C #6:  B → A
D1-C #7:  B → A
D1-C #8:  B → A
D1-C #9:  B → A
D1-C #10: B → A
```

2.1 All ten previous dispositions (`PA-D1C-01…10 = 01-B…10-B`) were governance-posture retentions durably recorded in `NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01`. This record is the separate, explicit, later Program Authority semantic act contemplated by `NP-13-PA-D1C-DECISION-01 §6.4` ("Separate future act required"). The predecessor record is **not amended, corrected, or erased as a historical record**; the ten B dispositions remain the accurate history of the retention decision, and this record supplies the subsequent semantic resolution.

---

## Governing intent

The governed object represents the logical non-production IIPS feature baseline established by D1-A/D1-B. Its identity must remain independent of implementation technology, repository location, Git commit/tree, operational ref, runtime identity, persistence technology, provider, or evidence realization.

These rules govern logical identity and lifecycle semantics only. They do not authorize implementation or production use.

---

## D1-C #1 — Stable Baseline Identifier

### Decision

A stable governed-object identifier exists.

### Rule

Each governed object SHALL have one stable, opaque logical identifier assigned when the governed object is first established by an explicit Program Authority act.

The identifier identifies the logical governed object itself and SHALL NOT be derived from:

* repository;
* branch;
* operational ref;
* commit;
* tree;
* blob;
* implementation artifact;
* runtime identity;
* tenant/company identity;
* persistence technology;
* provider;
* evidence coordinate.

### Mechanics

The identifier is assigned once and remains unchanged for the lifetime of that governed object.

A new governed object receives a new identifier.

### Authority

The Program Authority establishes or recognizes the identifier.

No implementation component may independently create a new governed-object identity.

### Scope

The identifier is scoped to the governed logical object represented by the NP-13 D1 baseline.

### Invariants

The identifier MUST remain stable across repository migration, ref movement/re-designation, evidence refresh, implementation changes, provenance changes, and other changes that do not constitute an explicit governed-object identity transition.

### Stability

The identifier remains stable across all NP-13-contemplated changes unless an explicit governance act establishes that a new governed logical object has been created.

### Identifier-changing changes

Only the existing G-5 trigger class may cause transition to a different governed-object identity: an explicit governance act changing the recognized governed logical object.

### G-4/G-5 relationship

This rule preserves existing G-4 continuity/preservation semantics and adopts the existing G-5 explicit-governance-act trigger class without broadening it.

### Exceptions

None unless explicitly established by a later Program Authority act.

---

## D1-C #2 — Identifier Form

### Decision

The stable identifier is represented as an opaque UUID.

### Rule

The identifier SHALL be represented as a canonical UUID string.

The identifier has no embedded business meaning and SHALL NOT encode repository, ref, commit, company, tenant, runtime, provider, date, version, or implementation information.

### Mechanics

Canonical textual UUID representation is used for storage, transport, comparison, and governance records.

Identifier equality is exact canonical identifier equality.

### Authority

The Program Authority establishes the identifier; implementations only consume and preserve it.

### Scope

The UUID identifies the governed logical object established under #1.

### Invariants

Changing representation of the governed object MUST NOT change the UUID.

The UUID MUST NOT be regenerated merely because the repository, ref, implementation, evidence, or runtime changes.

### G-4/G-5 relationship

Identifier form does not modify G-4 or G-5.

### Exceptions

None.

---

## D1-C #3 — Version / Epoch

### Decision

A governed-object version/epoch exists as lifecycle metadata separate from identity.

### Rule

The stable identifier identifies the logical object; the version/epoch identifies its governed semantic state across explicitly recognized lifecycle changes.

Version/epoch MUST NOT be used as a replacement for the stable identifier.

### Mechanics

The initial governed state begins at epoch/version 1.

The epoch advances only through an explicit governance act that records a material governed-state transition.

Repository commits, branch movement, tree changes, evidence refresh, implementation changes, or ref changes do not independently advance the governed-object epoch.

### Authority

The Program Authority establishes an epoch transition.

### Scope

The epoch applies to the governed logical object identified by #1.

### Invariants

Epoch values are monotonically increasing for a given governed-object identifier.

An epoch change does not itself create a new governed-object identifier.

### G-4/G-5 relationship

G-4-preserving changes do not require an epoch transition merely because they occurred.

A G-5 identity transition creates a new governed object and therefore does not merely constitute an ordinary epoch increment.

### Exceptions

None unless explicitly established by a later governance act.

---

## D1-C #4 — Temporal / Effective Point

### Decision

A governed-object effective point exists independently from evidence timestamps, Git timestamps, and repository/ref timestamps.

### Rule

The authoritative effective point of a governed-object semantic transition is the effective timestamp explicitly recorded by the governance act establishing that transition.

### Mechanics

The governance record SHALL identify the effective point using an unambiguous UTC timestamp.

Git commit time, file modification time, evidence acquisition time, and runtime observation time are not substitutes for the governed-object effective point.

### Authority

The Program Authority establishes the effective point through the applicable governance act.

### Scope

The effective point applies to the governed semantic transition, not to every evidence realization.

### Invariants

Evidence refresh does not retroactively alter the governed-object effective point.

Repository migration or ref movement does not alter the effective point.

### G-4/G-5 relationship

G-4-preserving changes do not automatically establish a new governed-object effective point.

A G-5 identity transition requires its own explicit effective point.

### Exceptions

None.

---

## D1-C #5 — Continuity

### Decision

Continuity means that the same governed logical object remains recognized across changes that do not invoke the G-5 identity-transition trigger.

### Rule

The existing G-4 continuity/preservation cases remain authoritative.

In addition, continuity SHALL be presumed across repository migration, operational-ref movement/re-designation, evidence refresh, provenance changes, and implementation changes unless an explicit governance act establishes a new governed logical object.

### Mechanics

Continuity is broken only when the recognized governed logical object changes under the G-5 trigger class.

### Authority

The Program Authority recognizes continuity and any continuity-breaking transition.

### Scope

Continuity concerns the governed logical object, not repository, evidence, runtime, or implementation continuity.

### Invariants

A change in evidence realization does not itself break continuity.

A change in repository/ref does not itself break continuity.

A Git commit/tree change does not itself break continuity.

### G-4/G-5 relationship

Existing G-4 semantics are preserved exactly as the minimum continuity/preservation rules.

G-5 remains the only sufficient identity-transition trigger class.

### Exceptions

None beyond an explicit governance act.

---

## D1-C #6 — New Identity Trigger

### Decision

The existing G-5 trigger class is adopted as the governing new-identity trigger.

### Rule

The only sufficient trigger for creation/recognition of a new governed-object identity is:

> An explicit governance act that changes the recognized governed logical object.

No repository, ref, commit, tree, blob, evidence, implementation, provider, runtime, or persistence event independently creates a new governed identity.

### Mechanics

The governance act must explicitly recognize the new governed logical object and establish its identity.

### Authority

Program Authority.

### Scope

The trigger applies to governed-object identity only.

### G-4/G-5 relationship

This adopts G-5 without broadening or narrowing its existing trigger class.

### Exceptions

None.

---

## D1-C #7 — Preservation Under Change

### Decision

Identity is preserved across changes that do not invoke the G-5 trigger.

### Rule

The following SHALL preserve governed-object identity:

* repository migration;
* repository rebinding;
* operational-ref movement;
* operational-ref redesignation;
* evidence refresh;
* provenance changes;
* implementation changes;
* commit creation;
* merge;
* branch movement;
* branch rename/deletion;
* tag operations;
* tree/blob changes;
* provider changes;
* persistence-technology changes.

These events may affect realization, evidence, provenance, or implementation state but do not independently change governed-object identity.

### Mechanics

Identity preservation is determined by whether the G-5 trigger has occurred, not by the mechanical nature of the underlying change.

### Authority

Program Authority controls explicit identity transitions.

### Invariants

No implementation mechanism may reinterpret an ordinary technical change as a new governed identity.

### G-4/G-5 relationship

Existing G-4 preservation rules remain authoritative.

G-5 remains the identity-transition boundary.

### Exceptions

An explicit governance act satisfying G-5 may establish a new governed object.

---

## D1-C #8 — Supersession

### Decision

Governed-object supersession is distinct from binding/evidence supersession.

### Rule

A governed object is superseded only through an explicit governance act that establishes a successor governed logical object.

Supersession does not erase the predecessor or its historical evidence.

### Mechanics

The governance record SHALL identify:

* predecessor governed-object identifier;
* successor governed-object identifier;
* effective point;
* reason/semantic basis for succession.

### Identity effect

The successor has its own stable governed-object identifier.

The predecessor identifier remains historically valid for the predecessor.

### Authority

Program Authority.

### Continuity

Historical continuity is preserved through an explicit predecessor/successor relationship, but predecessor and successor are distinct governed objects.

### G-4/G-5 relationship

G-5 establishes the identity-transition class.

Existing binding/evidence supersession rules remain separate and SHALL NOT be interpreted as governed-object supersession.

### Exceptions

None.

---

## D1-C #9 — Collision

### Decision

A collision means that two distinct governed-object claims attempt to use the same stable identifier within the same governed identity namespace.

### Rule

A stable identifier collision is invalid.

The identifier SHALL NOT be reassigned to another governed object.

### Mechanics

When a collision is detected, the later/unverified claim is rejected pending Program Authority resolution.

The existing recognized object's identity is not changed merely because a collision occurs.

A collision does not automatically create a new identity.

### Authority

Program Authority resolves any disputed collision.

### Invariants

No implementation, repository, runtime, tenant, or persistence mechanism may silently resolve an identity collision.

### Relationship

Collision semantics apply to the stable identifier and its namespace; they do not define ownership or supersession.

### G-4/G-5 relationship

Collision does not itself constitute a G-5 identity transition.

A separate explicit governance act is required.

### Exceptions

None.

---

## D1-C #10 — Ownership

### Decision

Ownership is governance metadata distinct from identity.

### Rule

The owner of a governed object is the explicitly designated accountable application/product owner recorded by Program Authority.

Ownership SHALL NOT be inferred from:

* repository ownership;
* Git account;
* runtime principal;
* authentication identity;
* tenant;
* company ID;
* persistence owner;
* implementation custodian.

### Mechanics

Ownership is established or transferred only by an explicit governance act.

Ownership transfer does not automatically change governed-object identity.

### Authority

Program Authority establishes or changes ownership.

### Scope

Ownership applies to accountability and governance of the logical object.

It is not part of the stable identifier.

### Invariants

An ownership change does not automatically create a new governed object.

An ownership change does not automatically supersede the object.

### G-4/G-5 relationship

Ownership changes preserve identity unless the Program Authority separately performs a G-5 identity-transition act.

### Exceptions

None.

---

# Cross-Dimension Rules

The ten dimensions SHALL be interpreted together.

1. Stable identifier (#1) identifies the logical object.
2. Identifier form (#2) represents that identity but does not define its meaning.
3. Version/epoch (#3) describes governed state and does not replace identity.
4. Temporal point (#4) records effective governance state and does not equal evidence timestamp.
5. Continuity (#5) follows the existing G-4 rules and G-5 boundary.
6. New identity (#6) follows the existing G-5 explicit-governance-act trigger.
7. Preservation (#7) protects identity across ordinary technical and evidence changes.
8. Supersession (#8) establishes predecessor/successor relationships between distinct governed objects.
9. Collision (#9) protects the uniqueness of stable identity.
10. Ownership (#10) is accountability metadata and is not identity.

No Git, repository, ref, tree, commit, runtime, tenant, persistence, provider, or evidence coordinate is substituted for governed-object identity.

These rules do not establish implementation technology, persistence architecture, runtime tenancy, production authority, security authority, or release authority.

Implementation remains separately governed.
---

## 4. G-4 / G-5 PRESERVATION

4.1 The durable G-4/G-5 semantics at `NP-13-GO3B-DECISION-01 §8` (blob `58e0df8739cbfef823216c560573bb4d6f43b7e8`) are **preserved unchanged** by this record. In the Program Authority's own supplied wording, the adopted rules preserve G-4 continuity/preservation semantics, preserve existing G-4 rules "exactly as the minimum" continuity/preservation rules, and adopt the G-5 explicit-governance-act trigger class "without broadening or narrowing" it.

4.2 No G-4/G-5 record is amended, broadened, narrowed, or replaced by this publication.

## 5. D1 CONSEQUENCE

5.1 With this record, all ten D1-C positive identity dimensions (`NP-13-D1-C-01 §3`) carry explicit Program Authority semantic rules: **resolved = 10/10; remaining B = 0/10**.

5.2 **D1 = OPEN / INCOMPLETE / NOT CLOSED.** The D1 completion model remains **NECESSARY CONDITIONS ONLY / NON-EXHAUSTIVE** (`NP-13-D1-CM-B-DECISION-01`). This record does **not** declare D1 complete and does not invent a completion condition. A separate explicit Program Authority completion decision remains required for any advancement.

5.3 **D1 acceptance:** none established — no separate acceptance state exists.

5.4 **D2 = NOT ELIGIBLE. D3 = NOT ELIGIBLE.** D1 remains open; no governing basis establishes eligibility.

5.5 **Implementation = NOT AUTHORIZED.** This record governs logical identity and lifecycle semantics only. It authorizes no implementation, no application-code change, no `/evidence` surface, no API, no persistence, no identity system, no authorization change, no replay change, no certification, and no release activity.

## 6. PREDECESSOR PRESERVATION

6.1 This record is additive. It does not amend, correct, rewrite, or supersede any predecessor NP-13 record. Verified predecessor blob identities at the pre-publication authoritative baseline:

| Predecessor record | Git blob identity |
|---|---|
| `docs/integration/NP-13-D0-01.md` | `8caa2d3e8f9564231a51ba053d08ccb19fdbd0bb` |
| `docs/integration/NP-13-D1-01.md` | `3468cdaa4e72ce5d33ecfc219706877a2a319541` |
| `docs/integration/NP-13-D1-C-01.md` | `8e9688ed102493a342ada1c6d9f1b3b6d6a58b04` |
| `docs/integration/NP-13-D1-PREREQ-01.md` | `5fea4a54fbf81da8b5f6e4730f3da5727a7bf4e7` |
| `docs/integration/NP-13-GO3B-01.md` | `89366b72bdf00d10950a1a90d33f16bd0c978acf` |
| `docs/integration/NP-13-GO3B-DECISION-01.md` | `58e0df8739cbfef823216c560573bb4d6f43b7e8` |
| `docs/integration/NP-13-PA-D1-DECISION-01.md` | `596db534ec73607c69024b82ade542774d406eed` |
| `docs/integration/NP-13-PA-D1C-DECISION-01.md` | `7b5ca0be27dcc7e9e58208964da895dfa23aef46` |
| `docs/integration/NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01.md` | `1dcc14af3bc4937c29b2b97d7f27dc7811bdbb91` |
| `docs/integration/NP-13-D1-CM-B-DECISION-01.md` | `2cc757ec896171a89187a0acc00147b4d0149514` |

## 7. DURABILITY

7.1 Per the NP-13 Universal Artifact Durability Invariant, this record becomes durable only upon publication to the explicitly designated authoritative repository/ref (`ramkivs/iips-review-recovered`, `refs/heads/main`) with independent remote verification of commit, tree, and blob.

7.2 **Artifact self-identity:** a cryptographic digest of this artifact cannot be contained within this artifact without altering that digest. In accordance with the NP-13 convention, the durable Git blob identity of this record is established by remote verification after publication and is not self-asserted here.

## 8. APPROVAL

**Adopted by:** Ramki (Ramakrishnan) — Program Authority
**Adoption act:** explicit adoption selection in the NP-13 D1-C — Semantic Authoring, Resolution & Durable Publication Gate
**Date:** 2026-10-03

**Approval:** `D1-C #1–#10 = A — RESOLVED` · `D1-C SEMANTIC POLICY ADOPTED VERBATIM` · `G-4 / G-5 = PRESERVED UNCHANGED` · `D1 = OPEN / INCOMPLETE / NOT CLOSED` · `D2 / D3 = NOT ELIGIBLE` · `IMPLEMENTATION AUTHORITY = NOT GRANTED`

**End of `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01`.**
