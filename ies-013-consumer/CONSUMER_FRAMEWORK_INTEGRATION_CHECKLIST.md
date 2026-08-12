# IES-013 — Consumer Framework Integration Checklist

**Standard:** IES-013 — Consumer Sector Engine
**Phase:** WP-2
**Version:** 1.0
**Date:** 2026-08-08
**Status:** OPERATIONAL CHECKLIST — complements the broader framework documentation

---

## 1. Framework integration checklist

| # | Shared service | Expected interaction | Verification test | Replay implication |
|---|---|---|---|---|
| 1 | ManifestLoader | load/validate manifest | WP2-ACC1 | none |
| 2 | EvidencePipeline | build evidence | WP2-ACC2 | byte-identical |
| 3 | Snapshot Store | capture state | WP2-ACC3 | replay source |
| 4 | Replay Engine | reproduce | WP2-ACC4 | byte-identical |
| 5 | Diagnostics | observe | WP2-ACC5 | none |
| 6 | Qualification | gate | WP2-ACC6 | deterministic |
| 7 | Activation | lifecycle | WP2-ACC7 | deterministic |
| 8 | Transport | serialize DTO | WP2-ACC8 | stable schema |
| 9 | RuntimeCoordinator | orchestrate | WP2-ACC9 | — |
| 10 | Ontology publication | register 8 dims | WP2-ACC10 | — |

## 2. Usage

- Filled during WP-2; re-verified during WP-4.

## 3. Status

**IMPLEMENTATION ARTIFACT — COMPLETE.**
