# CV-53 — D89 Macro UI Disclosure Implementation Authority Decision Act

**Artifact ID:** `CV-53-D89-MACRO-UI-DISCLOSURE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01`
**Date:** `2026-10-15` (Asia/Kolkata)
**Authority:** Ramki / Program Authority (supplied via the CV-53 + CV-24 execution mandate)
**Recording agent:** Arena Agent Mode — recording and publication only; no independent authority rendered
**Repository / ref:** `ramkivs/iips-review-recovered` @ `refs/heads/main`
**Governing record:** `docs/integration/NP-08-D08-D89-MACRO-UI-DISCLOSURE-DECISION-ACT.md` (`NP-08-D08-D89-MACRO-UI-DISCLOSURE-DECISION-ACT-01`)
**Status:** DECIDED AND RECORDED; DURABLE PUBLICATION PENDING until merged and verified on `main`

## 1. Decision

**Grant the separate D89 UI-disclosure implementation gate** for the product-transparency disclosure contract defined by D89 (DT-1–DT-8, DT-13/DT-15).

This decision authorizes implementation of the **display contract only**. It does not alter, resolve, or grant any legal-attribution, licensing, entitlement, M-3, production, or D91/D88-relief state.

## 2. Scope (authorized)

- Implement DT-1–DT-8 and DT-13/DT-15 as a product-transparency disclosure control in any future Macro data view that displays governed observations.
- Preserve the existing D89 route-contract implementation (`frontend/server/macro/**`, `src/api/macro.ts`, `MacroContext.tsx`) unchanged.
- Preserve the D89 dataset boundary: NAS / CPI / IIP only, IIP NIC 2-digit only.
- Preserve `L-C` (`MacroSourceDisclosure.tsx`) as evaluation-only unless a separate authority changes that status.
- Reuse existing generic provenance primitives where appropriate; no new dependency or fence change.

## 3. Exclusions (not authorized)

- No licensing, attribution-rights, commercial-use, redistribution, caching, or retention claims.
- No MoSPI contact, registration, credential, or external action.
- No production authority or deployment.
- No D91/D88 relief, exemption, or synthetic fallback.
- No dataset-boundary expansion (WPI/PPI/RBI/item-level IIP excluded).
- No change to governed acts (D89/D91/D88/D8/M-5 remain byte-identical).
- No claim that implementation, qualification, admission, or activation has occurred.

## 4. Rationale and evidence

- D89 establishes a binding product-transparency contract (DT-1–DT-15) independent of legal attribution.
- The route-contract implementation authority (D1–D4) is already granted and implemented; 56/56 Macro unit tests green (V21); 13 live probes executed (V22).
- No Macro UI view currently exists; DT-1–DT-8 define the acceptance criteria for a later bounded implementation change.
- The disclosure is a product control, not a legal citation; DT-11/DT-12/DT-13 remain NOT DETERMINED/NOT ESTABLISHED.

## 5. Implementation boundary

Implementation under this gate is limited to **UI presentation surfaces** (components, styles, accessibility, responsive layout) that render the D89 disclosure. It does not authorize changes to transport, source adapters, API clients, or tests beyond what is required to verify the disclosure. `MacroContext.tsx` remains a provider only; no view is mandated by this act.

## 6. Acceptance criteria (for the subsequent implementation change)

- DT-1 provider/platform label visible adjacent to data on every Macro view.
- DT-2 dataset name and granularity visible.
- DT-4 placement/persistence (not footer/tooltip only).
- DT-5 responsive and accessible as ordinary text.
- DT-6 source distinct from IIPS-generated interpretation.
- DT-7 no implied endorsement; no MoSPI branding.
- DT-8 no fabricated provenance.
- DT-13 no licensing/rights language.
- No test regression; fences and governed acts byte-identical.

## 7. Remaining limitations

- Formal Category-A attribution: NOT DETERMINED (not waived).
- GODL applicability: NOT ESTABLISHED.
- M-3 provenance: NOT ESTABLISHED.
- Live E2E: C — BLOCKED (no egress).
- Production: NOT AUTHORIZED.
- No implementation has occurred under this act.

## 8. Effectiveness

This decision takes effect only when this record is merged to `refs/heads/main` of `ramkivs/iips-review-recovered` and independently verified there (H-18 §8.4/§8.5).
