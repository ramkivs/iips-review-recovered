# CSIP — Cross-Sector Intelligence Platform Compatibility Statement

**Capability:** CSIP — Cross-Sector Intelligence Platform
**Program:** v1.1 Track 5
**Date:** 2026-08-08
**Purpose:** Explicit compatibility expectations for CSIP as a platform capability that consumes multiple immutable sector engines.

---

## 1. Compatibility statement

| Component | Compatible with |
|---|---|
| CSIP v1.0 (capability) | Platform v1.x |
| Universal Investment Ontology 1.0 | CSIP v1.0 |
| Cross-Sector Intelligence Standard 1.0 | CSIP v1.0 |
| Reference Assets 1.0 | CSIP v1.0 |
| Banking Engine v1.0 | CSIP v1.0 (consumed, immutable) |
| Insurance Engine v1.0 | CSIP v1.0 (consumed, immutable) |
| Capital Markets Engine v1.0 | CSIP v1.0 (consumed, immutable) |
| Healthcare Engine v1.0 | CSIP v1.0 (consumed, immutable) |

## 2. Platform compatibility

- CSIP is a **platform plugin** consuming `SectorPlugin` outputs — it reuses the IES-005 runtime/framework/contracts/replay/evidence/validation/governance.
- CSIP requires **no engine change** and **no runtime/framework change** (unless a defect is proven).
- The four consumed engines do **not** know CSIP exists; CSIP depends on engines, never the reverse.

## 3. Ontology registration (future sectors)

- Any new sector (Hospitality IES-010, Energy, Utilities, Consumer, Industrials, Technology, Real Estate, Telecom, Automotive) participates **solely by registering its 8-dimension ontology metadata** — no CSIP logic change.

## 4. Version policy

- Ontology / standard / reference-asset versions evolve independently via additive, versioned increments — never by modifying the frozen baseline.
- Consumed engine versions are recorded and immutable; CSIP compatibility is bound to the four frozen v1.0 engines.
- Breaking changes require a major version + compatibility review.

## 5. Statement

CSIP v1.0 is compatible with Platform v1.x and consumes the four frozen sector engines (Banking, Insurance, Capital Markets, Healthcare) as immutable black boxes. All CSIP components aligned at version 1.0.0 as frozen.
