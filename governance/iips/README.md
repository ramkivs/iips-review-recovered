# IIPS Programme Authority Records

## Purpose

`governance/iips/` is the durable authority store for IIPS programme records. It exists because
out-of-repo workspace storage is volatile: sandbox re-clones have repeatedly destroyed governance
records held outside the repository. The repository published at `origin` is the only store whose
durability has been demonstrated.

This directory holds **authority** only. Implementation artifacts, recovered evidence and technical
findings remain in their existing locations and are referenced from here, never relocated into it.

## Record classes

~~Every record declares exactly one class.~~

**AMENDED by `DEC-D12-CLASSIFICATION-CONVENTION` (finding `D-CLASS-DUAL`, gate D11/D12 §1 = D).**
A record declares **exactly one *primary* class**, drawn from the table below, and **may**
additionally carry **at most one optional descriptive qualifier**. The original sentence is
preserved above for history.

| Class | Meaning |
|---|---|
| `AUTHORIZATION` | Establishes permission to act |
| `SPECIFICATION` | Establishes required behaviour, scope and boundaries |
| `DECISION` | Resolves a named decision point |
| `GATE` | Records a gate's outcome and the preconditions it verified |

### Primary class and qualifier

| Rule | Statement |
|---|---|
| **Primary class** | **Exactly one**, and **always** one of the four declared above. It is **the declared class**, wherever it appears in the `Class:` line — **position does not matter** |
| **Qualifier** | **Optional; at most one.** A **descriptive label only**, naming the record's subject matter or function |
| **A qualifier is not a class** | It is **not** added to the table above, confers **no** authority, and **never** changes what the record may establish |
| **Authority derives from the primary class alone** | Per *AUTHORITY vs EVIDENCE vs REFERENCE vs IMPLEMENTATION* below: a qualifier such as `AUTHORITY`, `POLICY` or `METHODOLOGY AUTHORITY` **does not** make a record an `AUTHORIZATION`, and **must never be read as doing so** |
| **Form** | `**Class:** \`<PRIMARY>\` / \`<qualifier>\`` — or simply `**Class:** \`<PRIMARY>\`` |

**Effect on existing records.** This amendment **retroactively validates** the **15** records that
already declare a primary class together with a qualifier. **No record is edited by it.** The
seven qualifiers in current use are `AUTHORITY` (8 records), `METHODOLOGY AUTHORITY` (2), and
`CERTIFICATION`, `POLICY`, `EXECUTION RECORD`, `AUTHORITY RECONCILIATION` and
`DOCUMENTATION CORRECTION` (1 each). **In every one of the 15 the primary class is `DECISION`.**
Note that `DEC-G-AI-IMPL-CERTIFICATION` is the only one of the 15 with its qualifier listed
**first** (`CERTIFICATION / DECISION`); because the primary class is identified by **declaration,
not position**, that record is valid as written and is **not** amended.

| Class | Meaning |
|---|---|
| `AUTHORIZATION` | Establishes permission to act |
| `SPECIFICATION` | Establishes required behaviour, scope and boundaries |
| `DECISION` | Resolves a named decision point |
| `GATE` | Records a gate's outcome and the preconditions it verified |

## Required metadata

Every record must carry:

- **Record ID** — unique within this directory
- **Title**
- **Class** — one of the four above
- **Status** — e.g. `PROPOSED`, `ACTIVE`, `SUPERSEDED`, `RECORDED`
- **Date/time**
- **Authority relationship** — what the record derives from, and what it binds
- **Scope** — what the record covers, and expressly what it does not
- **Provenance** — how the record was produced, and by whom
- **Supersession / revision relationship** — where applicable

## AUTHORITY vs EVIDENCE vs REFERENCE vs IMPLEMENTATION

| Term | Definition |
|---|---|
| **AUTHORITY** | A record that establishes an approved requirement, authorization, decision or gate result |
| **EVIDENCE** | A technical observation, repository inspection, implementation artifact, test result, or recovered file |
| **REFERENCE** | Material consulted for context but not itself authoritative |
| **IMPLEMENTATION** | Source, test or code artifacts |

### Rule

**Implementation artifacts, recovered files and technical evidence do not become authority merely
through being copied or referenced into this directory.**

A certification claim is evidence, not authorization. A recovered implementation file is evidence, not
specification. A technical finding is evidence, not a decision. Authority exists only where a record
of class `AUTHORIZATION`, `SPECIFICATION` or `DECISION` establishes it explicitly.

A record whose basis cannot be verified from the repository, or from an explicitly cited source, must
be marked **unverified** rather than accepted silently.

## Limits

This is a minimal convention. It introduces no broader governance framework and no enterprise-wide
ADR policy, and it does not modify any other governance convention in this repository. New record
classes or metadata fields are added only by a `DECISION` record.

**AMENDED by `DEC-D12-CLASSIFICATION-CONVENTION`:** "classes" in that sentence means **primary
classes**. A new **primary class** still requires a `DECISION` record, exactly as before. A
**descriptive qualifier is not a class**, requires no separate record, and **confers no
authority**. This clarification is required for internal consistency: without it the qualifiers
already in use would remain non-compliant with the sentence above.

## Current state

| Item | Status |
|---|---|
| G1 — durable authority location | `GATE` recorded — repository authority store required |
| G1-M — authority store establishment | `GATE` recorded — see `GATE-G1-M.md` |
| G-AI-IMPL authorization | **ESTABLISHED** — `AUTH-G-AI-IMPL.md` |
| G-AI-IMPL implementation specification | **ESTABLISHED** — `SPEC-G-AI-IMPL.md` |
| Decisions B1–B4, S1–S4 | **RESOLVED** — `DEC-G-AI-IMPL-B1*`, `-B2-B4`, `-S1-S4`, `-S2`, `-S4`, `-SR1` |
| G-AI-IMPL implementation | **IMPLEMENTED + TESTED + CERTIFIED** — `e5d59981…` → `f63a9b49…`; see `DEC-G-AI-IMPL-CERTIFICATION` |

**Amended by `DEC-D9-RECORD-CORRECTION` (finding `D-README-STALE`).** The four rows above
previously read **NOT ESTABLISHED / NOT ESTABLISHED / UNRESOLVED / BLOCKED**. Those statements
were accurate when this table was written and are **superseded, not falsified**: the
authorization, specification, decisions and implementation are all recorded in this directory.

**This table records governance-record state only.** It asserts no implementation change, no
certification change, no certification version and no release or promotion. In particular the
**H / I / J Option-D limitation** recorded in `DEC-G-AI-IMPL-CERTIFICATION` §5 **remains in
force, remains `NOT PERFORMED`, and is not self-clearing**.
