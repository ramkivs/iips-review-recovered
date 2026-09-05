# DEC-E2E-015-CHARTER-AUTHORITY — 2026-09-05

- **Record ID:** `DEC-E2E-015-CHARTER-AUTHORITY`
- **Class:** CHARTER / AUTHORITY — formal-gate charter for E2E-015 (governance add-only; no product mutation; no certification executed or claimed herein)
- **Date:** 2026-09-05
- **Authority basis:** charter-authority gate determination **AUTHORIZED** (2026-09-05) on accepted decisions **D1 = A** (EXISTING LIVE SURFACE AGGREGATION), **D2 = A** (AGGREGATE EXISTING LIVE EVIDENCE), **D3 = A** (AUTHORIZE LIVE EXECUTION IN AN APPROVED REAL ENVIRONMENT), **D4 = A** (AUTHORIZE SUBSEQUENT CERTIFICATION EXECUTION), and the completed E2E-015 discovery (classification C; methodology in-lineage per the E2E-001/E2E-014 charter patterns and the established LIVE-certification precedents).
- **Implementation pin:** `phase13-next` @ `d1f8bf0da268f0eb85ff4222778edeba368b8346` (clean; remote identical).
- **Governance parent:** `0946378aa339fbd8db8fd5b8f3ad1accb5140779`.

## 1. Gate identity

- **Gate ID:** `E2E-015`
- **Canonical title:** `E2E-015 — Acceptance + LIVE Certification (Program Gates / N+6 tier, Platform / Program v3.0)`
- **Tier:** formal **LIVE acceptance/certification gate** — the tier that accepts the established in-lineage LIVE evidence by fresh execution. It is not a browser/UI certification, not a product-wide E2E certification, not a promotion gate, and not an aggregation of E2E-001/E2E-014.

## 2. Scope — exactly two existing LIVE suites (D1 = A)

| # | Suite (at implementation pin) | Established assertion families |
|---|---|---|
| LIVE-1 | `frontend/server/live/admin-live-certification.test.ts` | real OIDC auth + real JWKS on the admin path; RBAC analyst/viewer 403; 401 missing/invalid; real tenant isolation both directions incl. audit viewer; governed audit ALLOW/DENY; read-only endpoints only; own-tenant classify allow; analyst/viewer classify 403; invalid classification 422; cross-tenant classify denial + governed DENY audit |
| LIVE-2 | `frontend/server/live/live-tenant-engine.test.ts` | real OIDC discovery + realm-JWKS signature verification; real token → governed Principal (subject/tenant/roles); tenant isolation A/B both directions; RBAC viewer-403 / analyst-admin-allow; 401 missing/invalid/expired/malformed; governed audit allow+deny with identity/tenant; server-side HTTP boundary 401/403; tenant-scoped LIVE engine output |

**Assertion boundary:** the ten discovery-established families only — real OIDC discovery; real JWKS signature verification; real token → governed Principal; tenant isolation both directions; RBAC positive/negative; 401 authentication classes; governed audit ALLOW/DENY; server-side HTTP boundary; tenant-scoped LIVE engine output; Admin read-only/classification governance. The suites' existing assertion sets are used **exactly as established — without modification**. **No browser/UI LIVE criteria and no other product-level acceptance criteria are invented or recognized.**

## 3. Acceptance / evidence model (D2 = A)

E2E-015 **aggregates the two existing LIVE surfaces** as its acceptance evidence; acceptance requires **fresh execution** of both suites under the E2E-015 certification run. It does **not** re-certify E2E-001; does **not** re-certify E2E-014; does **not** alter or cure their recorded limitations (E2E-001 remains CONDITIONALLY CERTIFIED — NON-LIVE-QUALIFIED with AC-9 outstanding; E2E-014 remains CERTIFIED WITH RECORDED LIMITATIONS — NON-LIVE-QUALIFIED with AC-E14-7 deferred). Their recorded limitations remain theirs.

## 4. LIVE environment (D3 = A)

Execution requires an **explicitly identified and approved real OIDC + Keycloak environment**, designated before execution. **Explicitly excluded as LIVE evidence:** local simulation; synthetic substitutes; offline/self-skipped execution. **Skipped, blocked, unavailable, or otherwise unexecuted LIVE assertions are non-passing** — never certification evidence. The suites' self-skipping behavior offline (recorded in-lineage: "skips when no Keycloak is reachable") is precisely why an environment-identified, non-skipped run is the only acceptable evidence form.

## 5. Execution authority (D4 = A)

A **separate subsequent E2E-015 certification-execution gate** is authorized: execute both suites against the explicitly identified approved real environment; capture fresh execution evidence (environment identity, run identifiers, timestamps, tested commit, IdP/realm configuration identity, machine-verifiable results, integrity pins — no secrets in the record); preserve assertion sets unmodified; record skips/blockers as non-passing; make no E2E-001/E2E-014 re-certification claim; make no browser/UI LIVE claim; **fail closed** if the approved real environment is unavailable or required LIVE assertions cannot be executed. **This charter itself claims no certification and no LIVE qualification**; E2E-015 status until the execution gate determines otherwise: **CHARTERED — NOT CERTIFIED / NOT LIVE-QUALIFIED**.

## 6. Programme boundaries (explicit)

No browser/UI LIVE certification claim; no E2E-001/E2E-014 re-certification; no alteration of their recorded limitations; **no production promotion authority; no release authority; no E2E-016 authority** (production/promotion/release remains **NOT AUTHORIZED**); fail-closed behavior throughout. E2E-015 certification, if later granted, would not authorize E2E-016 or any promotion and would not constitute product-wide E2E certification.

## 7. Methodology

This charter introduces **no new methodology and no new acceptance criterion**. It formalizes the already-established in-lineage LIVE evidence (the two suites and their assertion families, the G3 LIVE criteria lineage, the phase-13 NOT-VERIFIED-HERE environment discipline) and the accepted D1–D4 decisions, per the E2E-001/E2E-014 charter pattern. No methodology was invented.

## 8. Expiry and next gate

The charter's execution authority (D4-A) is exercisable once and expires upon the certification-execution gate's durable recording (determination PASS or otherwise); re-execution thereafter requires new explicit authority. **Next gate:** the E2E-015 certification-execution gate — preceded by explicit identification/approval of the real OIDC + Keycloak environment as a gate input. Until then, E2E-015 must not be represented as LIVE-certified.
