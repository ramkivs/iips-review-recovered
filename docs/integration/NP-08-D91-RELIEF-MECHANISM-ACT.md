# NP-08 — D91 RELIEF MECHANISM ACT

> **1. Act ID:** `NP-08-D91-RELIEF-MECHANISM-ACT-01`
> **2. Title:** D91 Relief Mechanism Act — Procedure and Durable Mechanism for the Evaluation, Determination, and Recording of D91 Relief Requests
> **3. Effective date/time:** **`2026-10-04T16:42:02Z`** (UTC)
> **4. Issuing authority:** **Ramki / Program Authority** (deciding authority). `arena-agent` performed investigation, verification, and record-execution **only**; no decision rendered by the agent.
> **5. Competent authority:** **D88**, as established by `NP-08-D88-ACCOUNT-WIDE-UI12-DATA-MODE-AUTHORITY-ESTABLISHMENT-ACT-01` (commit `2dc5563…`) and designated competent for D91 relief by `NP-08-D91-RELIEF-COMPETENCE-ESTABLISHMENT-ACT-01` (commit `b607ea9…`). **Competence limited to the UI12 data-mode dimension. Not broadened by this act.**
> **Record type:** `RELIEF MECHANISM ACT` — governance only; non-executable
> **Workstream:** NP-08 — Intelligence · GATE-Y
> **Repository / ref (durable):** `ramkivs/iips-review-recovered` @ `main` (§21)
> **Mutation:** one new governance artifact; **zero** modification to any historical record
> **IPD:** OUT OF SCOPE — zero mutation

---

## 6. PURPOSE

This act establishes the **procedure and durable mechanism** by which a **future** D91 relief request may be:

1. **initiated**; 2. **scoped**; 3. **evaluated**; 4. **constrained**; 5. **recorded**; 6. **affirmatively determined or refused**; 7. **preserved durably**.

> # **THIS ACT ESTABLISHES A MECHANISM ONLY. IT DOES NOT GRANT D91 RELIEF.**

This act is the **second** of three required acts. The third — the **D91 Relief Determination** — does not yet exist and is **not** authorized by this act.

| # | Act | Status |
|---:|---|---|
| 1 | `NP-08-D91-RELIEF-COMPETENCE-ESTABLISHMENT-ACT-01` | ✅ **ESTABLISHED / DURABLE** — commit `b607ea9…` |
| 2 | **`NP-08-D91-RELIEF-MECHANISM-ACT-01`** (this act) | ✅ **ESTABLISHED / DURABLE** — commit recorded §21 |
| 3 | D91 Relief Determination | ❌ **NOT CREATED — NOT AUTHORIZED BY THIS ACT** |

---

## 7. SCOPE OF THE MECHANISM

> # **The mechanism applies only to D91's UI12 data-mode dimension.**

### 7.1 Within the mechanism

| # | Matter |
|---:|---|
| 1 | Whether macro data may **participate in** the account-wide UI12 default data-mode preference |
| 2 | Whether macro data remains **exempt from** that preference, and on what conditions |
| 3 | The **terms of any UI12 data-mode exemption** applicable to macro |
| 4 | Whether the **UI disclosure obligation** carried by `MacroContext.tsx` (D91 §1) is modified, preserved, or withdrawn as a consequence of (1)–(3) |

### 7.2 Outside the mechanism — no authority established

> ⚠️ **The mechanism establishes no authority over any of the following:**

| # | Excluded matter |
|---:|---|
| 1 | Macro source governance |
| 2 | Provider selection |
| 3 | Dataset selection |
| 4 | Vintage semantics |
| 5 | LIVE/SNAPSHOT source semantics |
| 6 | Persistence |
| 7 | Tenancy |
| 8 | `runtimeCompanyId` |
| 9 | **D115** |
| 10 | Implementation |
| 11 | Certification |
| 12 | Acceptance |
| 13 | Production |
| 14 | Identity binding / server-side tenancy / production identity |

> **D88's competence is not broadened by this act.** It remains exactly as established: the **UI12 data-mode dimension** of D91.

---

## 8. REQUESTER REQUIREMENTS

### 8.1 Who may request D91 relief

A D91 relief request may be submitted **only** by a party with standing:

| # | Requester | Basis |
|---:|---|---|
| 1 | **Ramki / Program Authority** | Issuing and deciding authority |
| 2 | The **accountable owner** of the affected UI12 surface or capability | Subject-matter accountability |
| 3 | Any agent acting under **explicit written authorization** from (1) or (2) | Delegated standing |

### 8.2 Standing record

Every request must **identify its requester by name and role** and state the basis of standing. A request that does not identify a requester with standing is **invalid** and cannot proceed to Stage 1.

### 8.3 Separation guard — no self-initiation

> ⚠️ **D88 may not self-initiate relief.**
>
> A relief determination must be **responsive to a valid request** made under §8.1. D88's competence is a power to **determine requests**, not a power to originate them. This guard preserves the Stage 1 / Stage 2 separation and prevents a determination from being recorded without a corresponding scope record.

---

## 9. REQUEST CONTENTS

A D91 relief request is **invalid** unless it supplies **all** of the following. Partial requests are returned, not evaluated.

| # | Required element | Requirement |
|---:|---|---|
| 1 | **Requested relief** | The precise D91 requirement to be relieved |
| 2 | **Affected UI12 data-mode dimension** | Which element of §7.1 is engaged |
| 3 | **Affected surface / behavior** | The specific UI surface and observable behavior |
| 4 | **Rationale** | Why relief is sought |
| 5 | **Requested scope** | Exact boundaries of the relief sought |
| 6 | **Requested duration** | Time-bounded, event-bounded, condition-bounded, or permanent (§14) |
| 7 | **Conditions** | Conditions the requester proposes to observe |
| 8 | **Evidence supporting the request** | Per §10 |
| 9 | **Requester** | Name, role, basis of standing (§8.2) |
| 10 | **Effective period, if applicable** | Start and end, or triggering event/condition |

---

## 10. EVIDENCE REQUIREMENTS

No determination may be made before the following evidence exists in the record:

| # | Evidence required |
|---:|---|
| 1 | **Identification of the exact D91 provision** to be relieved, cited to its durable artifact |
| 2 | **Demonstration that the requested relief lies within the UI12 data-mode dimension** (§7.1) |
| 3 | **WP-MACRO-03 compatibility assessment** — an explicit evaluation of the request against each constraint in §16.1 |
| 4 | **Confirmation that no SNAPSHOT fallback** is introduced or implied by the request |
| 5 | **Confirmation that the approved dataset boundary** (NAS / CPI / IIP) is unaffected |
| 6 | **Confirmation that provenance requirements** are unaffected |
| 7 | **Confirmation that server-side governance** (`guardRead('macro')`) is unaffected |
| 8 | **Impact statement** for the affected surface and for any dependent behavior |
| 9 | **Requester standing evidence** (§8.2) |
| 10 | **Stage 1 scope record**, if Stage 1 was conducted (§11) |

> **Absence of any item 1–9 is a sufficient ground to refuse the request without prejudice.**

---

## 11. STAGE 1 — SCOPE DEFINITION

> # **STAGE 1 DOES NOT GRANT RELIEF.**

### 11.1 Function

Stage 1 defines **exactly what relief is being considered**. It produces a **proposed relief scope** for evaluation.

### 11.2 Stage 1 requirements

| # | Requirement |
|---:|---|
| 1 | Identify the **exact D91 requirement** proposed for relief |
| 2 | State the **precise boundaries** of the proposed relief |
| 3 | Identify every **affected surface and behavior** |
| 4 | Record the **WP-MACRO-03 compatibility assessment** (§10.3) |
| 5 | Record the **proposed temporality** (§14) |
| 6 | Record the **proposed conditions** (§15) |
| 7 | Classify any portion falling **outside D88 competence** (§16.3) |

### 11.3 Stage 1 mandatory statement

Every Stage 1 record **must** carry, verbatim:

> **`RECORDED — RELIEF SCOPE DETERMINED. NO RELIEF IS GRANTED OR EXERCISED BY THIS RECORD.`**

### 11.4 Precedent

Stage 1 follows the **form** of `DEC-D27-FENCE-RELIEF-SCOPE` — *"determines and records a proposed relief scope… grants nothing and exercises nothing"* — used as **procedural precedent only**. That record concerns Fence-4/Fence-8 evidence limbs, is **not durable on `main`**, and confers **no D91 authority**.

---

## 12. STAGE 2 — DETERMINATION

### 12.1 Function

Stage 2 **affirmatively determines or refuses** the relief, **exactly as scoped by Stage 1**.

### 12.2 Stage 2 requirements

| # | Requirement |
|---:|---|
| 1 | Cite the **Stage 1 scope record** it determines |
| 2 | Determine **exactly** what Stage 1 scoped — **no more, no less** |
| 3 | Record the **determination status** (§13) |
| 4 | Record the **temporality** actually determined (§14) |
| 5 | Record the **conditions** actually imposed (§15) |
| 6 | Record the **WP-MACRO-03 disposition** (§16) |
| 7 | Record the **evidence** relied upon (§10) |
| 8 | Identify the **determining authority** |

### 12.3 Stage 2 prohibition

> ⚠️ **A Stage 2 record may not determine relief beyond the Stage 1 scope.** Any determination broader than its Stage 1 scope is **invalid**.

---

## 13. DECISION STATUSES

The mechanism recognises **exactly five** statuses. **No status may be added** without explicit justification and definition in a subsequent act.

| Status | Meaning |
|---|---|
| **`GRANTED`** | The requested relief has been **affirmatively determined** by D88, within the Stage 1 scope, subject to recorded temporality and conditions |
| **`DENIED`** | The request has been **refused**; D91 continues to apply in full |
| **`WITHDRAWN`** | The requester withdrew the request before determination |
| **`EXPIRED`** | A time-, event-, or condition-bounded determination reached its bound; D91 applies in full again |
| **`SUPERSEDED`** | A later determination replaced this one; the later record governs |

> **These are status values for future determination records.** No determination exists. The current status of D91 relief is recorded at §18.

### 13.1 Record format

Every determination record must contain: act ID; determination status; the Stage 1 record cited; determining authority; requester; exact relief determined; temporality; conditions; WP-MACRO-03 disposition; evidence relied upon; effective date/time; and durability metadata.

---

## 14. TEMPORAL RULES

### 14.1 Default

> **Relief must be time-bounded by default.**

### 14.2 Permitted bounds

| Bound | Description |
|---|---|
| **Time-bounded** | A stated expiry date/time — **the default** |
| **Event-bounded** | Expiry on a named, externally verifiable event |
| **Condition-bounded** | Expiry when a stated condition ceases to hold |
| **Permanent** | No bound — **permitted only under §14.3** |

### 14.3 Permanence

> ⚠️ **Permanent relief requires explicit justification and explicit approval by Ramki / Program Authority.**
>
> A request for permanent relief must state why no time, event, or condition bound is adequate. **Absent that justification and that approval, permanence is refused.**

### 14.4 Renewal

Renewal is **not automatic**. It requires a **fresh request** under §9, with **fresh evidence** under §10.

---

## 15. CONDITIONS

### 15.1 Mandatory conditions

> **Any relief determination must preserve, without diminution:**

| # | Condition preserved |
|---:|---|
| 1 | **Macro LIVE-only behavior** |
| 2 | **No SNAPSHOT fallback** |
| 3 | **Existing provenance requirements** |
| 4 | **Existing server-side governance** |
| 5 | **Existing approved dataset boundary** (NAS / CPI / IIP) |

### 15.2 Effect of non-preservation

> ⚠️ **A determination that would fail to preserve any condition in §15.1 is outside D88 competence.** Such a request must be classified under §16.3 and referred to the appropriate separate governance authority.

---

## 16. WP-MACRO-03 BOUNDARY

> # **D91 RELIEF CANNOT, THROUGH D88 COMPETENCE, OVERRIDE WP-MACRO-03.**

WP-MACRO-03 is an **independent source-governance constraint**, wholly outside D88's competence.

### 16.1 Constraints preserved

| # | Constraint |
|---:|---|
| 1 | **Macro LIVE-only semantics** ("LIVE, never SNAPSHOT") |
| 2 | **No SNAPSHOT fallback** |
| 3 | **NAS / CPI / IIP approved dataset boundary** |
| 4 | **Provenance** |
| 5 | **Server-side governed transport** (`guardRead('macro')`) |
| 6 | **No WPI / PPI / RBI authority expansion** |
| 7 | **No unauthorized Macro source or provider changes** |
| 8 | **No unauthorized vintage-policy changes** |

### 16.2 Mandatory separate evaluation

> **Any future D91 relief determination must separately evaluate compatibility with WP-MACRO-03**, constraint by constraint (§16.1), and record that evaluation in the determination record.

### 16.3 Outside-competence classification

> ⚠️ **If a requested relief would alter any constraint in §16.1, the mechanism classifies that portion as `OUTSIDE D88 COMPETENCE`.**
>
> That portion requires the **appropriate separate governance authority**. It may not be carried by a D91 relief determination, and it may not be inferred from D88's D91 relief competence.

---

## 17. EXPLICIT NON-GRANTS

> # **THIS ACT GRANTS NOTHING.**

| # | Non-grant |
|---:|---|
| 1 | **No D91 relief.** Relief is **not granted** by this act — §18 |
| 2 | **No WP-MACRO-03 override, amendment, waiver, or weakening** — §16 |
| 3 | **No source-governance authority** — no authority over Macro source governance, provider selection, dataset selection, vintage semantics, or LIVE/SNAPSHOT source semantics |
| 4 | **No Macro implementation authority** — §19 |
| 5 | **No certification authority** |
| 6 | **No acceptance authority** |
| 7 | **No production authorization or activation** |
| 8 | **No persistence, tenancy, or identity authority** — no extension into persistence, tenant authorization, `runtimeCompanyId`, **D115**, identity binding, or server-side tenancy |
| 9 | **No broadening of D88's competence** — §7.2, §20 |
| 10 | **No relief determination.** The third act is not created and is not authorized by this act — §6 |

---

## 18. CURRENT RELIEF STATE — MANDATORY STATEMENT

> # ⚠️ **`D91 RELIEF — NOT GRANTED`**

| Statement | Record |
|---|---|
| This act establishes a relief mechanism only | ✅ |
| This act grants D91 relief | ❌ **NO** |
| Any D91 relief request has been submitted | ❌ **NO** |
| Any Stage 1 scope record exists | ❌ **NO** |
| Any Stage 2 determination exists | ❌ **NO** |
| **Current D91 relief status** | **`D91 RELIEF — NOT GRANTED`** |

> **No D91 relief is in force.** D91 remains fully operative: the LIVE-only constraint, the exemption from the UI12 preference, the fallback prohibition, and the disclosure obligation all stand unchanged.

---

## 19. IMPLEMENTATION SEPARATION

> # **THIS MECHANISM IS GOVERNANCE ONLY.**

**Nothing in this act modifies or authorizes modification of:**

| # | Excluded from mutation |
|---:|---|
| 1 | Macro UI |
| 2 | Macro API |
| 3 | Data-mode runtime |
| 4 | `guardRead` |
| 5 | API transport |
| 6 | Frontend behavior |
| 7 | Server behavior |
| 8 | Tests implementing product behavior |

> ## **Implementation: NO** implementation authority is created by this act. No application source code, Macro implementation, data-mode implementation, route, component, test, or configuration is authorized to change.
> ## **Certification: NO** certification authority is created by this act.
> ## **Acceptance: NO** acceptance authority is created by this act.
> ## **Production: NO** production authorization or activation is created by this act.

Per the governing separation preserved throughout:

> ### **D88 establishment ≠ D91 competence ≠ D91 relief mechanism ≠ D91 relief grant ≠ implementation ≠ qualification ≠ acceptance ≠ certification ≠ production authorization**

**This act occupies the D91 relief mechanism position only.**

---

## 20. RELATIONSHIP TO D88

| Statement | Record |
|---|---|
| D88's status | **Established and durable** — commit `2dc5563…`, blob `d396e688…` |
| D88's D91 relief competence | **Established and durable** — commit `b607ea9…`, blob `4bb191a6…` |
| Is D88 modified by this act? | ❌ **NO** |
| Is D88's competence broadened? | ❌ **NO** — remains the **UI12 data-mode dimension** |
| What this act adds | A **procedure** through which D88's existing competence is exercised |
| Is D88 competent over WP-MACRO-03? | ❌ **NO** — §16 |
| May D88 self-initiate relief? | ❌ **NO** — §8.3 |

---

## 21. RELATIONSHIP TO D91

| Statement | Record |
|---|---|
| D91's status | **Established** — constraint + disclosure act (`727bdcb`) |
| Is D91 modified, amended, or weakened by this act? | ❌ **NO** |
| Does this act relieve D91? | ❌ **NO** — §18 |
| What this act establishes | **How** relief from D91 may later be requested and determined — **not** that relief exists |

---

## 22. HISTORICAL BOUNDARIES

> # **NO HISTORICAL RECORD IS REWRITTEN BY THIS ACT.**

| Record | Treatment |
|---|---|
| **D89** | Not modified. Downstream evidence; does not constitute D88 or D91 relief competence. Its Macro disclosure item remains recorded as **historically OPEN** unless independently resolved by its own authority. **Not silently closed.** |
| **D54** | Not modified or broadened. Independent P13-B implementation authorization; is not D88. The **D54 §97 → D88** linkage remains **historically asserted, not independently constituted** and is **not retroactively repaired**. |
| **D8** | Not modified. The earlier D88 competence wording remains historical unless separately rectified. |
| **WP-MACRO-03** | Not modified — §16 |
| **D88 establishment act** | Not modified — commit `2dc5563…`, blob `d396e688…` |
| **D91 competence act** | Not modified — commit `b607ea9…`, blob `4bb191a6…` |

---

## 23. DURABILITY METADATA

| Field | Value |
|---|---|
| **Repository** | **`ramkivs/iips-review-recovered`** (IRR) — authoritative non-production IIPS review/governance repository |
| **Ref** | **`main`** (`refs/heads/main`) |
| **Baseline commit BEFORE mutation** | **`b607ea9ea1e8ea7180e4bd6ee15374bf11a28630`** |
| **Baseline tree BEFORE mutation** | `aabdbd80af1457bb4feb9e45c5642abcaf2a16c6` |
| **Artifact path** | **`docs/integration/NP-08-D91-RELIEF-MECHANISM-ACT.md`** |
| **Placement rationale** | `docs/integration/` is the established IRR governance-record location, consistent with `NP-08-D8-MACRO-SCOPE-DETERMINATION-ACT.md`, `NP-08-D88-ACCOUNT-WIDE-UI12-DATA-MODE-AUTHORITY-ESTABLISHMENT-ACT.md`, and `NP-08-D91-RELIEF-COMPETENCE-ESTABLISHMENT-ACT.md`. **Not** placed in `evidence/intelligence-data-supply-governance/`: that directory is the byte-exact 10-file IPD GATE-Y corpus mirror published by P-4; adding an IRR-origin act there would break the mirror property and falsify the P-4 corpus manifest. |
| **IPD** | **OUT OF SCOPE — zero mutation** |
| **Production** | **OUT OF SCOPE** |
| Durability convention | **C-1** — durable only on authoritative remote publication **plus** independent remote verification. **The Arena workspace is not authoritative. A local commit alone is not durable.** |

---

## 24. VERIFICATION RECORD

| # | Check | Requirement |
|---:|---|---|
| 1 | Remote commit exists | ☐ |
| 2 | Parent relationship correct | ☐ |
| 3 | Branch/ref = `main` | ☐ |
| 4 | Artifact path present on remote `main` | ☐ |
| 5 | Blob SHA recorded | ☐ |
| 6 | SHA-256 computed from **remote** content | ☐ |
| 7 | Size / line count | ☐ |
| 8 | Clean worktree after push | ☐ |
| 9 | No unintended files changed | ☐ |
| 10 | Remote artifact re-read and leakage-rescanned | ☐ |

*(Rectification review per §12 performed before publication; values reported in the execution record.)*

---

## 25. LEAKAGE SELF-CHECK

| Prohibited leakage | Guard |
|---|---|
| Relief grant | §17.1, §18 — explicit `NOT GRANTED` |
| Relief determination | §6, §17.10 — third act not created |
| WP-MACRO-03 override | §16 — independent, mandatory separate evaluation |
| Macro source-governance expansion | §7.2, §17.3 — excluded |
| D88 competence broadening | §7.2, §20 — unchanged |
| Implementation authority | §17.4, §19 — none |
| Certification authority | §17.5, §19 — none |
| Acceptance authority | §17.6, §19 — none |
| Production authority | §17.7, §19 — none |
| Historical rewriting | §22 — none |

---

*End of Relief Mechanism Act. **The D91 relief mechanism is established** — requester, request contents, evidence, two-stage procedure, statuses, temporality, conditions, WP-MACRO-03 boundary. No relief. No determination. No implementation, qualification, acceptance, certification, or production authority. No historical record modified. D88's competence unchanged.*
