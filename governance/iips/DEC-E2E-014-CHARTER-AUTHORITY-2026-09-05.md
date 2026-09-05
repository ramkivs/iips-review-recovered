# DEC-E2E-014-CHARTER-AUTHORITY — 2026-09-05

- **Record ID:** `DEC-E2E-014-CHARTER-AUTHORITY`
- **Class:** CHARTER / AUTHORITY — formal-gate charter for E2E-014 (governance add-only; no product mutation; no certification executed herein)
- **Date:** 2026-09-05
- **Authority basis:** user scope decision **B — APPROVED CAPABILITY IMPLEMENTATION GATE** (supplied; not re-queried) and explicit decisions **D1 = A**, **D2 = A**, **D3 = B**, **D4 = A** recorded below. Precedent: G-AI-IMPL family (`AUTH-G-AI-IMPL` → B1 → B2-B4 → BS → FINAL CERTIFICATION GATE → `DEC-G-AI-IMPL-CERTIFICATION`) and the E2E-001 charter pattern (`DEC-E2E-001-CHARTER-AUTHORITY-2026-09-05.md`). No methodology invented.
- **Implementation pin:** `phase13-next` @ `d1f8bf0da268f0eb85ff4222778edeba368b8346` (clean; remote identical).
- **Governance parent:** `cfc0f1ce773688e5f50275005bef9ac072d30987`.

## 1. Gate identity

- **Gate ID:** `E2E-014`
- **Canonical title:** `E2E-014 — Approved Capability Implementation (Program Gates / N+5 tier, Platform / Program v3.0)`
- **Tier:** approved-capability-implementation acceptance tier — the tier that accepts specific, enumerated capability implementations as approved, per the G-AI-IMPL certification model. It is **not** a product-wide E2E certification, not a LIVE certification, and not a promotion gate.

## 2. Enumerated capability set (D1 = A — fail-closed scope)

Exactly two capabilities, each with recorded provenance; **no other capability is included**:

| # | Capability | Implementation (pinned HEAD) | Test evidence | Provenance | Inclusion |
|---|---|---|---|---|---|
| CAP-1 | **N+5 — Company Intelligence governed trust-chain surface** (Decision → Evidence → Replay → Provenance composition of the three guarded read endpoints; no recomputation/fabrication) | `frontend/src/features/company/CompanyIntelligence.tsx`, `CompanyTrustChain.tsx` | `CompanyIntelligence.test.tsx`, `CompanyTrustChain.test.tsx` (present at pin; introduced at Phase-12 baseline root `7325aed`, 2026-08-12) | inventory label associates E2E-014 with N+5 (supplied control-plane evidence); `AUTH-G-AI-IMPL` §4 records N+5 as a protected adjacent surface | **ESTABLISHED by D1-A** (N+5 named explicitly) |
| CAP-2 | **G-AI-IMPL — AI Advisory embedded surface** (SR-1…SR-5, T1…T10 per `SPEC-G-AI-IMPL`) | `frontend/src/components/ai/` surface at pin | G-AI-IMPL verification records + component tests at pin | **direct**: `AUTH-G-AI-IMPL` (reconstituted authority) → implementation → `DEC-G-AI-IMPL-CERTIFICATION` (2026-08-27, **CERTIFIED WITH RECORDED LIMITATIONS**) | **ESTABLISHED by D1-A** (explicit Approved-Capability-Implementation provenance) |

**Exclusions (explicit):** the 14 IVM capabilities (IES-006…015, IES-016/017/020, CSIP), platform foundation workstreams (PF-1/PF-2, P-1), D7/Tier-3 evidence, E2E-013/017/018 artifacts, and every other product surface — each remains **CANDIDATE — EXPLICIT CHARTER CONFIRMATION REQUIRED** for any future E2E-014 scope change; none is silently broadened into this charter.

## 3. Acceptance criteria (D2 = A — G-AI-IMPL certification model, adapted only as required)

Per-capability, mirroring the G-AI-IMPL structure (authority-provenance → implementation-presence → automated verification → certification determination with recorded limitations):

- **AC-E14-1 (CAP-1 authority/provenance):** N+5 provenance chain established (inventory association + protected-surface record + pinned implementation presence). *Verification:* record inspection. Automated: no.
- **AC-E14-2 (CAP-1 implementation):** N+5 surface present, unmodified-intent at the pinned HEAD. *Verification:* tree inspection at pin. Automated: no.
- **AC-E14-3 (CAP-1 verification):** `CompanyIntelligence.test.tsx` + `CompanyTrustChain.test.tsx` **actually executed** at the pinned HEAD, all passing, including the no-fabrication contracts (pillars/confidence unavailable where source lacks them; DIFFERENCE rendered on non-identical replay). *Verification:* fresh automated run. Automated: yes.
- **AC-E14-4 (CAP-2 authority/provenance):** G-AI-IMPL determination of record accepted as the capability-implementation determination (`CERTIFIED WITH RECORDED LIMITATIONS`), with its recorded limitations carried, not re-litigated. *Verification:* record inspection. Automated: no.
- **AC-E14-5 (CAP-2 implementation):** AI-advisory surface present at the pinned HEAD. *Verification:* tree inspection at pin. Automated: no.
- **AC-E14-6 (CAP-2 verification):** the capability's automated suites present at the pinned HEAD **actually executed** and passing. *Verification:* fresh automated run. Automated: yes.
- **AC-E14-7 (LIVE leg):** any capability whose authoritative precedent requires LIVE verification (e.g., the AI-advisory live-certification pattern) — **deferred per D3-B** (§4). Automated: no; LIVE: yes.

No criteria beyond AC-E14-1…7 are recognized.

## 4. LIVE disposition (D3 = B — LIVE DEFERRED)

LIVE requirements are **retained but deferred** to an approved external IdP-capable environment, exactly per the E2E-001 AC-9 pattern: until LIVE evidence is returned and accepted, E2E-014 can receive at most a **non-LIVE-qualified** certification, and must not be represented as LIVE-certified. Historical LIVE records (Phase-12 G3, `main`, `program-v1.2.0`) are non-substitutable and non-revocable-to-present.

## 5. Certification-execution authority (D4 = A)

A separate **read-only E2E-014 certification-execution gate** is authorized: pinned-HEAD execution of the AC-E14-3/AC-E14-6 suites; AC-E14-1/2/4/5 record/tree determinations; AC-E14-7 handled per D3-B (deferred; evidence absent unless supplied); evidence capture; certification determination (G-AI-IMPL-style: CERTIFIED / CERTIFIED WITH RECORDED LIMITATIONS / NOT CERTIFIED). This authorization does **not** itself certify or close E2E-014; E2E-014 status until then: **CHARTERED — NOT CERTIFIED**.

## 6. Relationships and boundary

- **E2E-001:** independent foundation-tier predecessor. Its CONDITIONAL (non-LIVE-qualified) certification is **not** E2E-014 evidence unless a criterion above explicitly uses it (none does); it neither blocks nor authorizes E2E-014.
- **E2E-015:** independent acceptance/LIVE certification — not authorized here, not substituted by E2E-014.
- **E2E-016:** final reconciliation/promotion — **not authorized**; E2E-014 does not authorize production promotion or release in any form; production/promotion/release remains **NOT AUTHORIZED**.
- The 14 IVM capabilities and all other surfaces are out of scope (§2 exclusions).

## 7. Evidence requirements, qualifications, next gate

Execution-gate evidence must include: exact suites/commands, per-AC results, run environment identity (this sandbox; no IdP), timestamps, and the product pin; determination recorded add-only in governance. **Unresolved qualifications:** (1) AC-E14-7 LIVE evidence absent (deferred); (2) inventory E2E-014 rows never supplied in-environment (scope established by user decision D1-A, not by direct inventory verification). **Next gate:** the E2E-014 certification-execution gate (D4-A). This charter grants no product-mutation, IVM, E2E-015/016, promotion, or release authority, and expires upon the execution gate's durable recording.
