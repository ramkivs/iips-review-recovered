# IIPS v3.0 — NP-06 Reports R1 (D-1): PA Decision — Option B Selected, NOT EFFECTIVE

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-R1-PA-DECISION-2026-10-25-01` |
| **Decision requested as** | `D-1` in `IIPS-V3-REPORTS-NP06-R1-R2-R3-PA-DECISION-REQUEST-2026-10-25-01` §2 (IRR PR #256, merged `65e1814b9732e2cf79338ffaa6d1caf333fd3464`) |
| **Decision-maker** | Program Authority (PA) — Ramki |
| **Decision date / source** | `2026-10-25` (Asia/Calcutta) — the PA's one-pass instruction of 2026-10-25 ("NP-06 REPORTS — ONE-PASS DECISION AND EXECUTION"), which directs: *"R1 / D-1: Option B … Treat this instruction as authorization to proceed with those recommended choices, subject to their expressly required decision fields and prerequisites"* and *"Do not invent an owner identity, tenant value, ownership source, security predicate, audit semantics, or contract field. If a required substantive field is genuinely unspecified, record the precise unresolved field … Do not falsely mark the decision effective."* |
| **Selection rendered** | **`R1-Option B` — establish a Reports-specific governed non-authentication ownership declaration** (decision request §2.4), with the recommended mechanism **(a) a separate server-owned carrier file and env seam distinct from the F-3 carrier** (for example a Reports-specific env name; the exact env name is a mechanism detail to be fixed in the effectiveness act, not a value). `R1-Option A` and `R1-Option C` are **not** selected. |
| **Effectiveness** | **NOT EFFECTIVE.** The selection is recorded durably, but it does **not** establish a Reports ownership source, does **not** supersede the operative `REG-11` Option C deferral, and does **not** authorize transport, route, UI, or owner-resolution code. It becomes effective only when the PA supplies the fields in §2 below in a dated effectiveness act, that act is published to `refs/heads/main`, and the merged state is independently read back. |
| **Preserved** | A2 (`IIPS-V3-REPORTS-CV21-DQ7A-A2-PA-DISPOSITION-2026-10-25-01`); `REG-11` Option C as the historically operative deferral; `CV-23`; `CV-43`; the HTTP 503 fence (blob `981470541812a64c733309f1debec75455d85bee`). |
| **Historical supersession** | **None effected.** If and when the effectiveness act is published, it must state expressly that it supersedes, for the non-auth baseline only, (i) the operative effect of `REG-11` Option C §2(1)–(5) as applied to Reports, and (ii) NP-06 `R2`/`C4`'s authenticated-principal precondition and §5.4 rows 1–3 (by replacement rows rendered in the R2 act). Until then both remain as written. |
| **Recording agent** | Arena Agent Mode — recording and publication support only. No authority is rendered by the agent. |

## 1. What was decided, and what was not

The PA has **selected** the Option B path. That selection is real and is recorded here so that no later pass re-litigates A vs B vs C. What the PA's instruction did **not** contain — and what no authoritative record on `main` contains — are the substantive values and contract fields that Option B, by its own definition in the decision request (§§2.4, 5), requires before it can be effective. The instruction expressly forbids inventing them. This record therefore renders the selection and withholds effectiveness, naming each missing field precisely.

## 2. Precisely unresolved fields (effectiveness blockers)

| # | Required field (source) | State | Why it cannot be completed by the agent |
|---|---|---|---|
| U-1 | **Reports tenant value** (decision request §5, D-1 "If B: state the owner and tenant values") | **UNSPECIFIED** in the PA instruction and in every authoritative record (decision request §2.2 sweep rows 1–2: NONE) | Inventing a tenant value is expressly prohibited by the PA instruction and by commissioning §3. |
| U-2 | **Reports owner value** (`userId` of the `(tenantId, userId)` pair) | **UNSPECIFIED**, same sweep | Same prohibition. |
| U-3 | Whether the PA intends the **F-3 values** `(irr-domain-4b82d6e1, owner-7f3a91c2)` to be reused for Reports | **NOT STATED** | Decision request §2.4 Option B: copying/aliasing the F-3 pair is barred by `REG-11` Option C §2(2); *"If the PA intends the same values, that intent must be stated expressly with its scope consequence — silence is not approval."* The instruction does not state it. |
| U-4 | The **fifteen `D-2` §8 elements** for Reports (source/target authorities and identifiers, mapping lifecycle, provisioning authority, revocation authority, tenant/ownership/authorization boundaries, audit requirements, failure behaviour, security/trust model, durable storage, package/API contract — decision request §§2.4, 5) | **NOT STATED**; no element is supplied by the instruction | These are substantive contract fields; the decision request requires them *or* an express PA statement that a named element remains undecided. Neither is present. |
| U-5 | Value-act property set for the new declaration: recording location, change authority, restart stability, recovery behaviour, unreadable-source behaviour, audit trail | **CANNOT BE COMPLETED** without U-1/U-2 | The mechanism direction (separate carrier, §1) is selected, but a carrier's canonical bytes and integrity digest are a function of the values. No carrier file, env value, or digest is created by this record. |

**Consequence.** `R1` remains **NOT ESTABLISHED**. The ownership-source act named in commissioning §4 remains outstanding, now narrowed to a single bounded ask: the PA states U-1/U-2 (or expressly directs F-3 value reuse per U-3) and the U-4 elements (or expressly defers named elements). Everything else about Option B — its shape, mechanism direction, fail-closed `503` behaviour (F-5), and its express statements that the pair carries **no authorization semantics** and that **no client-supplied identity is ever authoritative** — is already fixed by the decision request and is adopted here as the selected design, to take effect with the values.

## 3. What this record authorizes in the meantime

Nothing that depends on an established owner. Independent work authorized by the same PA instruction and not dependent on R1 — the R3 persistence consumer admission (D-3, independent per the decision request) and its IRR-side binding and integration tests using test-only owner pairs — proceeds under its own decision record. No owner resolver, carrier, transport change, route, UI, or fence change is authorized by this record.

*Recording agent: Arena Agent Mode — recording and publication support; no authority rendered. Program Authority: Ramki. **Selection: R1-Option B. Status: SELECTED — NOT EFFECTIVE pending U-1..U-5. `R1` NOT ESTABLISHED; fence stands.***
