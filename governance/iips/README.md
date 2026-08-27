# IIPS Programme Authority Records

## Purpose

`governance/iips/` is the durable authority store for IIPS programme records. It exists because
out-of-repo workspace storage is volatile: sandbox re-clones have repeatedly destroyed governance
records held outside the repository. The repository published at `origin` is the only store whose
durability has been demonstrated.

This directory holds **authority** only. Implementation artifacts, recovered evidence and technical
findings remain in their existing locations and are referenced from here, never relocated into it.

## Record classes

Every record declares exactly one class.

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

## Current state

| Item | Status |
|---|---|
| G1 — durable authority location | `GATE` recorded — repository authority store required |
| G1-M — authority store establishment | `GATE` recorded — see `GATE-G1-M.md` |
| G-AI-IMPL authorization | **NOT ESTABLISHED** |
| G-AI-IMPL implementation specification | **NOT ESTABLISHED** |
| Decisions B1–B4, S1–S4 | **UNRESOLVED** |
| G-AI-IMPL implementation | **BLOCKED** |
