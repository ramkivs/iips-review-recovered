# IES-011 — Energy Framework Service Usage Matrix

**Standard:** IES-011 — Energy Sector Engine
**Purpose:** Explicitly maps each shared framework capability to its concrete usage within the Energy engine — implementation reference for WP-2 + audit artifact at release.
**Date:** 2026-08-08

---

## 1. Framework service usage

| Framework service | Purpose | Energy usage | Deterministic guarantee | Validation test |
|---|---|---|---|---|
| ManifestLoader | Registration | plugin manifest | versioned | WP2-ACC1 |
| EvidencePipeline | Evidence | energy evidence package | replay-identical | WP2-ACC2 |
| Snapshot | State capture | engine execution | deterministic | WP2-ACC3 |
| Replay | Replay verification | replay verification | byte-identical | WP2-ACC4 |
| Diagnostics | Health | execution diagnostics | observational | WP2-ACC5 |
| Transport | DTO | published outputs | stable schema | WP2-ACC6 |
| Qualification | Capability | engine qualification | deterministic | WP2-ACC7 |
| Activation | Lifecycle | plugin activation | deterministic | WP2-ACC8 |

## 2. Rule

All framework services are **reused unchanged**; no framework capability is re-implemented by Energy.

## 3. Status

**IMPLEMENTATION ARTIFACT — COMPLETE.**
