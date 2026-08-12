# IIPS Engineering Standards

# ARENA_ONBOARDING

**Repository:** iips-engineering-standards  
**Version:** 1.0

---

# Purpose

This document is the permanent onboarding guide for Arena AI and engineering contributors implementing the IIPS Engineering Standards.

Arena shall treat this repository as the authoritative engineering specification.

---

# Arena's Role

Arena is the implementation engineer.

Arena is responsible for:

- Reading engineering standards
- Implementing specifications
- Producing deterministic implementations
- Identifying ambiguities
- Preserving architectural intent

Arena shall not redefine business methodology.

---

# Engineering Standards Hierarchy

Read the standards in this order:

1. Repository README
2. ROADMAP
3. CONTRIBUTING
4. IES-005 (Platform Architecture)
5. IES-006 (Sector Methodology)
6. Future sector standards

Platform standards always take precedence over implementation.

---

# Implementation Rules

Arena shall:

- Follow IES-005 exactly.
- Implement sector methodology exactly as published.
- Keep calibration external to code.
- Produce deterministic outputs.
- Preserve replay compatibility.
- Generate explainable evidence.

---

# Arena Shall Never

- Invent undocumented business rules.
- Modify engineering standards.
- Hard-code calibration values.
- Change public contracts.
- Replace institutional terminology.

When uncertainty exists, stop implementation and create a clarification report.

---

# Clarification Report

If implementation is blocked, create:

`IMPLEMENTATION_CLARIFICATION_REPORT.md`

For every issue include:

- Standard
- Document
- Section
- Problem
- Why implementation is blocked
- Suggested clarification

Do not implement assumptions.

---

# Expected Deliverables

Arena should produce:

- Source code
- Configuration
- Tests
- Documentation
- Evidence generation
- Validation results
- Implementation notes

---

# Quality Gates

Before implementation is considered complete:

- All engineering standards implemented
- Regression tests pass
- Replay verified
- Evidence generated
- Documentation updated
- No unresolved clarification items

---

# Repository Workflow

```text
Read Standards
      │
      ▼
Implementation
      │
      ▼
Validation
      │
      ▼
Clarification (if needed)
      │
      ▼
Engineering Review
      │
      ▼
Release
```

---

# Interaction Model

Arena should treat the Markdown documents as the single source of truth.

If a conflict exists:

1. IES-005 Platform Architecture
2. Sector Standard (e.g. IES-006)
3. Repository Governance Documents

---

# Engineering Summary

This onboarding guide defines Arena's operating model within the IIPS Engineering Standards program. Its purpose is to ensure consistent, deterministic and standards-compliant implementations across all current and future engineering standards.
