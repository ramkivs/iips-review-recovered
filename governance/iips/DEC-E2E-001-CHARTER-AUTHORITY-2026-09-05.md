# DEC-E2E-001-CHARTER-AUTHORITY — 2026-09-05

- **Record ID:** `DEC-E2E-001-CHARTER-AUTHORITY`
- **Class:** CHARTER / AUTHORITY — formal-gate charter for E2E-001 (governance add-only; no product mutation, no certification executed herein)
- **Date:** 2026-09-05
- **Authority basis:** user authority "A — Formalize E2E-001 as a formal gate" (definition/discovery pass complete: **READY WITH EXPLICIT AUTHORITY GAPS**), plus explicit user decisions **D1 = A**, **D2 = B**, **D3 = A** recorded below.
- **Prior classification superseded by this charter:** `E2E-001 CAPABILITY COMPLETE — FORMAL GATE UNPROVEN` (inventory reconciliation, 2026-09-05) — the gate now exists as a chartered formal gate; certification status remains **NOT CERTIFIED / NOT CLOSED** until the D3-A execution gate runs.
- **Implementation pin:** `phase13-next` @ `d1f8bf0da268f0eb85ff4222778edeba368b8346` (clean; remote identical).
- **Governance parent:** `e41b69c7497906c88c3612580053565905aa5154`.

## 1. Gate identity (charter)

- **Gate ID:** `E2E-001`
- **Canonical title:** `E2E-001 — N+1 Browser Authentication / Deep-Link Reconciliation (Platform / Program v3.0)`
- **Capability scope:** the browser-authentication integration (`authFetch.ts`, `AuthProvider.tsx`, `oidcClient.ts`, `session.ts`) plus deep-link/navigation reconciliation (`navigation.ts`, `routes.ts`, protected routes, `Administration.tsx`, `Sidebar.tsx`, `NotificationDrawer.tsx`) at a pinned `phase13-next` HEAD, together with their automated suites.
- **Relationship to N+1:** formalizes the N+1 / N+1A / N+7 milestone capability (and the P-4/N+16/N+17/N+18 child reconciliations carried in the same suites).
- **Downstream relationship:** **foundation-tier predecessor only.** Closing E2E-001 does **NOT** authorize, substitute for, or close E2E-014, E2E-015, or E2E-016. Charter pattern per `DEC-E2E-017-018-REFERENT-AND-CHARTER`; certification-record pattern per `PHASE13_N3_READ_AUTHORIZATION_CERTIFICATION`.

## 2. Ratified acceptance criteria (AC-1 … AC-9)

| AC | Requirement | Evidence source (authoritative) | LIVE? |
|---|---|---|---|
| AC-1 | No fabricated Authorization header; real in-memory Bearer attach; 401/403 event semantics | `frontend/src/api/authFetch.test.ts` | no |
| AC-2 | OIDC authorization-code + PKCE S256; state/nonce with mismatch rejection; in-memory token storage; refresh grant; token never fabricated | `frontend/src/core/auth/oidcClient.test.ts` | no |
| AC-3 | Role-mapping precedence: iips-admin / iips-analyst / iips-viewer from access token; ID-token fallback; safe-viewer fallback; anonymous on null tokens | `frontend/src/core/auth/AuthProvider.test.tsx` | no |
| AC-4 | Identity + tenant derived alongside role; session carries `tenantId`; roles are display-only, never an authorization authority | `AuthProvider.test.tsx`; `frontend/src/core/session/session.ts` | no |
| AC-5 | Sign-in screen when unauthenticated; 401 → sign-in transition; N+1A post-login destination restoration (deep-link) | `AuthProvider.test.tsx` | no |
| AC-6 | Auth contract: 401/403 distinct; SessionValidator mechanism-agnostic; PrincipalResolver → governed principal | `frontend/src/core/auth/authContract.test.ts` | no |
| AC-7 | N+1 child reconciliation: 8 governed admin tabs deep-link `/admin/*`; dead children removed (N+16/17/18); concrete routes only (N+7, P-4); no `:id` templates in navigable links; honesty badges | `navigation.test.ts`; `Sidebar.test.tsx`; `routes.ts`; `Administration.tsx` | no |
| AC-8 | Protected-route / Administration route behavior under auth states — **breadth fixed by D1 = A** (below) | `routes.ts`; `App.test.tsx` | no |
| AC-9 | LIVE acceptance against a real IdP: discovery/JWKS; real token → governed Principal (subject/tenant/roles); tenant isolation; RBAC negative/positive paths — **disposition fixed by D2 = B** (below) | G3 LIVE 8/8 criteria (historical pattern); N+3 LIVE criterion (historical pattern) | **yes** |

No criteria beyond AC-1…AC-9 are recognized. No new methodology is created by this charter.

## 3. Authority decisions (explicit)

### D1 — AC-8 breadth: **A — MINIMAL EXISTING-SURFACE SCOPE**

AC-8 is limited to the protected-route / Administration behaviors **already concretely represented by the current `routes.ts` and `App.test.tsx` contract** at the implementation pin. No new negative-case taxonomy is introduced. (B not selected.)

### D2 — AC-9 LIVE disposition: **B — EXTERNAL LIVE ENVIRONMENT**

AC-9 is retained in scope and is authorized to be executed in an **approved IdP-capable external environment** (the current environment has no real Keycloak endpoint — recorded fact, `PHASE13_HARDENING_RECONCILIATION` §15). Evidence is to be **brought back as a pinned certification input** and recorded in the certification record. Until AC-9 evidence is so returned and accepted, E2E-001 **cannot** receive a LIVE-qualified certification determination. The external environment must be **designated/approved in or before the certification-execution gate** (conditional item, §6).

### D3 — certification-execution authority: **A — AUTHORIZE SUBSEQUENT CERTIFICATION EXECUTION**

A separate **read-only certification-execution gate** is authorized, consisting of: pinned-HEAD automated test execution of the AC-1…AC-8 source suites; AC-1…AC-8 determination; AC-9 handling per D2-B (external LIVE evidence brought back as pinned input); evidence capture; and certification determination. **This authorization does NOT itself certify, close, or LIVE-qualify E2E-001** — that determination belongs exclusively to the execution gate's own record.

## 4. Certification boundary

E2E-001 certification, if later granted, certifies **only** the enumerated browser-authentication + deep-link capability criteria at the pinned HEAD, with the LIVE qualification of AC-9 exactly as deep as the accepted external evidence. It does **NOT** certify: capability completion ≠ formal certification; formal E2E-001 certification ≠ E2E-015 (no product LIVE/UI certification); E2E-001 certification ≠ E2E-016 (no production promotion — production/promotion/release remains **NOT AUTHORIZED**); historical Phase-12 G3 LIVE certification ≠ current E2E-001 certification (consumed, non-transferable, non-revived).

## 5. Provenance references

Inventory reconciliation (3 workbook versions via supplied mechanical CSV; E2E-001 row byte-identical; "promoted" = capability/workstream promotion, commit-pinned class corroborated by P-1 @ `0e063d3` in-lineage) · discovery pass (READY WITH EXPLICIT AUTHORITY GAPS) · `DEC-E2E-013-BASELINE` / `DEC-D2-DANGLING-VOCABULARY` (prior no-referent status, superseded by this charter for E2E-001 only) · charter/certification/LIVE methodology precedents cited in §1–§2.

## 6. Unresolved / conditional items

1. **AC-9 external environment designation** (D2-B): the approved IdP-capable environment is not yet designated; designation is a required input to the execution gate.
2. **Certification determination** (D3-A): pending the execution gate; E2E-001 status until then = **CHARTERED — NOT CERTIFIED**.

## 7. Next authorized action

The **E2E-001 certification-execution gate** (D3-A): read-only pinned-HEAD automated execution of the AC-1…AC-8 suites with per-AC determination; AC-9 external LIVE evidence handling per D2-B; evidence capture; certification determination — each recorded as its own governance record. No other action is authorized by this instrument. This charter grants no product-mutation, IVM, E2E-014/015/016, promotion, or release authority, and expires upon the certification-execution gate's durable recording.
