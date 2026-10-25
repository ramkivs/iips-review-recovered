# IIPS v3.0 — NP-06 Reports R2 (D-2): Contract-Shape Decision — PREPARED, NOT RENDERED

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-R2-CONTRACT-DECISION-PREPARED-2026-10-25-01` |
| **Record type** | **PREPARED DECISION INPUT — NOT A DECISION.** Renders no authority, approves no contract shape, and activates no behaviour. |
| **Decision requested as** | `D-2` in `IIPS-V3-REPORTS-NP06-R1-R2-R3-PA-DECISION-REQUEST-2026-10-25-01` §3 |
| **Prepared** | `2026-10-25` (Asia/Calcutta), under the PA's one-pass instruction of 2026-10-25 and the commissioning (`IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01`) |
| **Status** | **NOT RENDERED — BLOCKED.** Two independent reasons, both recorded precisely: (1) sequencing — `D-2` is decidable only after `D-1` is *effective*, and the R1 record (`IIPS-V3-REPORTS-NP06-R1-PA-DECISION-2026-10-25-01`) is SELECTED — NOT EFFECTIVE pending its U-1..U-5 fields; (2) two of the four D-2 elements (C-3, C-7 below) have no PA selection in any instruction or authoritative record, and the governing instruction forbids inventing a security predicate or audit semantics. |
| **Effect** | No transport, security-sensitive behaviour, route, UI, or fence change is implemented under this record. The HTTP 503 fence (blob `981470541812a64c733309f1debec75455d85bee`) remains the only HTTP behaviour. This record exists so the R2 decision, when its prerequisites exist, is published **before** any dependent implementation, as required. |

## 1. Elements prepared from existing requirements (not decided here)

Fixed requirements E-1..E-10 are as stated in the decision request §3.1 and are not re-decided. The four D-2 elements, with their prepared state:

| Element | Prepared analysis (decision request §3.3) | State |
|---|---|---|
| C-2 — replacement for the `401` boundary | No credential exists on the no-auth baseline; prepared replacement is retirement of `401`, with owner-resolution failure answered `503 owner-context-unavailable` (F-5; decision request §3.4 row 1) | **PREPARED** — renders only with an effective R1 + R2 act |
| C-3 — authorization predicate replacing the `viewer/analyst/admin` role gate | Options: (a) no separate authorization step — the single declared owner reaches all five operations; (b) a non-role predicate bound to the declared owner. The decision request names this *"the largest unresolved security question in R2"* and makes no recommendation | **UNRESOLVED — no PA selection exists.** A security predicate may not be invented |
| C-4 — tenant-claim disposition | Prepared recommendation: **all** client-supplied tenant/identity claims → `400`; the historical foreign-tenant audited `403` row retired by express statement (there is no tenant authority for a claim to be foreign to) | **PREPARED (recommended shape)** — renders only with an effective R1 + R2 act |
| C-7 — audit disposition | Historical deny/allow audit came from the retired executor primitives. The R2 act must either name a replacement audit sink or expressly defer the NP-06 §5.4 audit sentence; silent dropping is prohibited | **UNRESOLVED — no PA selection exists.** Audit semantics may not be invented |

Contract-independent controls C-5 (client-supplied identity/ownership and durable-identity fields → `400`; `companyId`/`runtimeCompanyId` always refused), C-6 (server-side surface allowlist) and C-8 (`503 persistence-unavailable`, distinct from `owner-context-unavailable`) survive unchanged and need no decision, but are not implemented now: a transport that cannot establish an owner cannot reach them (decision request §3.3).

## 2. Exact rendering prerequisites

An effective R2 PA decision requires, in order: (1) an effective R1 act (R1 record U-1..U-5 supplied); (2) a PA selection for C-3; (3) a PA selection for C-7 (named audit sink or express deferral). It must also state the replacement rows for NP-06 §5.4 rows 1–3 and confirm that the decision itself does not lift the fence or activate any route, UI, or runtime behaviour (route wiring additionally requires F-7 and acceptance — decision request §3.3 C-9).

## 3. What proceeds without R2

The R3 persistence binding (its own effective decision) at the persistence level only, exercised with test-only owner pairs; the committed F-7 harness in its fail-closed form. Nothing security-sensitive, nothing exposed.

*Prepared by Arena Agent Mode — decision-input preparation only. Program Authority: Ramki. **No R2 decision rendered. R2 remains UNBOUND; fence stands.***
