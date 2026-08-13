# IIPS Engineering Standards

# VERSIONING POLICY

**Repository:** iips-engineering-standards  
**Version:** 1.0

---

# Purpose

This document defines the versioning policy for the IIPS Engineering Standards ecosystem. Every repository artifact shall follow a predictable and independently managed versioning strategy.

---

# Guiding Principles

- Every published artifact has its own version.
- Standards evolve independently.
- Methodology and implementation are versioned separately.
- Breaking changes are explicit.
- Historical versions remain reproducible.

---

# Versioning Model

## Repository

Semantic Versioning (SemVer):

```
MAJOR.MINOR.PATCH
```

Example:

```
v1.2.3
```

| Component | Meaning |
|-----------|---------|
| MAJOR | Breaking repository or governance changes |
| MINOR | New published standards or major additions |
| PATCH | Documentation fixes and non-breaking improvements |

---

## Engineering Standards

Each engineering standard maintains its own lifecycle.

Examples:

- IES-005 v1.0
- IES-005 v1.1
- IES-006 v1.0-draft
- IES-006 v1.0
- IES-006 v1.1

A revision to one standard shall not require version changes to unrelated standards.

---

## Calibration Profiles

Calibration profiles are versioned independently.

Example:

```
banking-calibration-1.0.0
banking-calibration-1.1.0
banking-calibration-2.0.0
```

Calibration changes require regression validation.

---

## Schemas

Each published schema has an independent version.

Examples:

- evidence.schema.json v1.0.0
- decision.schema.json v1.1.0
- metric.schema.json v2.0.0

---

## Implementations

Reference implementations use SemVer.

Example:

```
banking-engine-ts v0.9.0
banking-engine-ts v1.0.0
```

Implementation versions do not alter engineering standard versions.

---

# Compatibility Rules

Every release shall document:

- Backward compatibility
- Breaking changes
- Migration guidance
- Affected standards
- Updated dependencies

---

# Release Requirements

Before incrementing any version:

- Documentation updated
- Validation complete
- Compatibility assessed
- Release notes prepared
- Engineering review approved

---

# Change Log Expectations

Every published version shall record:

- Version
- Date
- Summary
- Author
- Compatibility impact
- Related standards

---

# Engineering Summary

Independent versioning enables platform stability while allowing individual standards, calibration profiles, schemas and implementations to evolve at their own pace.
