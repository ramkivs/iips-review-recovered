# NP-08 — D91 RELIEF COMPETENCE ESTABLISHMENT ACT

> **1. Act ID:** `NP-08-D91-RELIEF-COMPETENCE-ESTABLISHMENT-ACT-01`
> **2. Title:** D91 Relief Competence Establishment Act — Designation of the Competent Authority for Relief from the D91 Macro LIVE-only Exemption
> **3. Effective date/time:** **`2026-10-04T16:03:01Z`** (UTC)
> **4. Issuing authority:** **Ramki / Program Authority** (deciding authority). `arena-agent` performed investigation, verification, and record-execution **only**; no decision rendered by the agent.
> **Record type:** `AUTHORITY COMPETENCE ESTABLISHMENT ACT` — governance only; non-executable
> **Workstream:** NP-08 — Intelligence · GATE-Y
> **Repository / ref (durable):** `ramkivs/iips-review-recovered` @ `main` (§16)
> **Mutation:** one new governance artifact; **zero** modification to any historical record
> **IPD:** OUT OF SCOPE — zero mutation

---

## 5. HISTORICAL BASIS

| # | Fact | Source |
|---:|---|---|
| 1 | **D88 is established and durable** as the account-wide UI12 data-mode authority. | `NP-08-D88-ACCOUNT-WIDE-UI12-DATA-MODE-AUTHORITY-ESTABLISHMENT-ACT.md`, commit `2dc556380abc4493ceb269be9da98b463e21f635`, blob `d396e688…` |
| 2 | **D88's constitutive act explicitly withheld D91 relief competence** — *"Does this act grant D88 competence over D91 relief? ❌ **NO**"* — and stated that D91 relief *"requires its own separate authority determination."* | D88 act §16 line 252; §10.A |
| 3 | **D91 is established**: macro data (`/api/macro`) governed LIVE-only, deliberately **EXEMPT** from the account-wide UI12 "Default data mode" preference, with a UI disclosure obligation on `MacroContext.tsx`. | `D91_MACRO_LIVE_ONLY_EXEMPTION_DISCLOSURE.md`, created `727bdcb`, last carried `3ef2cc7`, authority `D88 = A` |
| 4 | **D91's operative subject matter is the UI12 data-mode preference** — whether macro participates in, or is exempted from, the account-wide default data-mode dispatch. | D91 §1; D89 §4 |
| 5 | **WP-MACRO-03 is an independent source-governance constraint** ("LIVE, never SNAPSHOT") of a different class from UI12 data-mode semantics. | D89 §4: *"a source-governance rule, not a preference default"* |
| 6 | **No constitutive D91 relief competence act existed** before this act, on any ref or tag of IRR or IPD. | Pre-recheck §3.7: 0 filenames matching `competence` on `main`; 0 acts stating an authority is competent for D91 relief |
| 7 | **No D91 relief mechanism is established.** | `DEC-D21-FENCE8-DETERMINATION.md` line 83: *"Authority required for relief \| **Not stated in the fence text.** No record defines a relief mechanism"* |
| 8 | **D27/D28 exist as a procedural relief precedent** but concern Fence-4/Fence-8 relief, not D91, and are **not durable on `main`**. | `DEC-D27-FENCE-RELIEF-SCOPE.md`, `DEC-D28-FENCE-RELIEF-AUTHORIZATION.md` — 4 Arena branches, **0 on `main`** |

---

## 6. REASON COMPETENCE MUST BE ESTABLISHED ANEW

> ## **D91 RELIEF COMPETENCE IS `ESTABLISHED ANEW` BY THIS ACT.**

| Negative finding | Statement |
|---|---|
| Nothing inherited | D88's own constitutive act **declined** to grant this competence (§5.2) |
| Nothing recovered | No competence act existed on any ref or tag (§5.6) |
| Nothing inferred | D89's `Authority: D88 = A`, D8's carry-forward statement, D54, WP-MACRO-03, implementation code, tests, and historical assertions are **each expressly excluded** as sources of competence (§5 of the governing gate) |

**Competence is therefore constituted here for the first time**, by constitutive grant — **not** by inference from any downstream or historical assertion.

---

## 7. COMPETENT AUTHORITY DESIGNATION

> # **D88 is the competent authority to determine relief from D91.**

D88 — as established by `NP-08-D88-ACCOUNT-WIDE-UI12-DATA-MODE-AUTHORITY-ESTABLISHMENT-ACT-01` (commit `2dc5563…`) — is hereby designated competent to determine relief from the D91 Macro LIVE-only exemption.

### 7.1 Ground of designation

**Domain correspondence.** D91's operative subject matter is the account-wide UI12 data-mode preference and macro's exemption from it (§5.4). That subject matter lies **within D88's established authority domain** — account-wide UI12 data-mode semantics. D91 relief is therefore a D88-domain determination.

### 7.2 Scope limit on the designation

> ⚠️ **D88's D91 relief competence is limited to the UI12 data-mode dimension of D91.**

It does **not** extend to WP-MACRO-03, Macro source governance, or any independent constraint (§10, §11).

---

## 8. EXACT COMPETENCE GRANTED (positive authority)

D88 may determine, by explicit act, the following and **only** the following regarding D91:

| # | Competence |
|---:|---|
| 1 | Whether macro data may participate in the **account-wide UI12 default data-mode preference** |
| 2 | Whether macro data remains **exempt from** that preference, and on what conditions |
| 3 | The **terms of any UI12 data-mode exemption** applicable to macro |
| 4 | Whether the **UI disclosure obligation** carried by `MacroContext.tsx` (D91 §1) is modified, preserved, or withdrawn, as a consequence of a determination under (1)–(3) |
| 5 | Any **boundary condition** on a relief determination necessary to keep it within the UI12 data-mode domain |

> **This competence is a power to determine. It is not a determination.** No relief is granted by this act (§12).

---

## 9. EXPLICIT NON-GRANTS (negative authority)

> # **THIS ACT GRANTS NO RELIEF, NO MECHANISM, AND NO EXECUTABLE AUTHORITY.**

| # | Non-grant |
|---:|---|
| 1 | **No D91 relief.** Relief is **not granted** by this act — see §12 |
| 2 | **No relief mechanism.** This act does **not** establish the relief request form, requester identity, scope, duration, conditions, evidence requirements, approval workflow, or relief record format (§13) |
| 3 | **No WP-MACRO-03 override, amendment, waiver, or weakening** — see §11 |
| 4 | **No source-governance expansion.** No authority over Macro dataset selection, Macro source authority, MoSPI/RBI/WPI authority, Macro vintage policy, Macro provider governance, or Macro LIVE/SNAPSHOT source-governance rules |
| 5 | **No Macro implementation authority** — see §13 |
| 6 | **No certification authority** — see §13 |
| 7 | **No acceptance authority** — see §13 |
| 8 | **No production authorization or activation** — see §13 |
| 9 | **No persistence, tenancy, or identity authority.** No extension into durable persistence, tenant authorization, `runtimeCompanyId`, **D115**, identity binding, server-side tenancy, or production identity |
| 10 | **No D89 or D54 modification** — see §14 |

---

## 10. RELATIONSHIP TO D88

| Statement | Record |
|---|---|
| D88's status | **Established and durable** — commit `2dc5563…`, blob `d396e688…` |
| Is D88 modified by this act? | ❌ **NO** |
| Is D88's authority domain expanded? | ❌ **NO.** D88's domain remains **account-wide UI12 data-mode semantics** |
| What this act adds | A **competence** to determine D91 relief *within* D88's existing domain |
| Does this act make D88 competent over WP-MACRO-03? | ❌ **NO** |
| Does this act make D88 competent over Macro source governance? | ❌ **NO** |

> **D88's domain is unchanged. A competence within that domain is added.**

---

## 11. RELATIONSHIP TO D91

| Statement | Record |
|---|---|
| D91's status | **Established** — constraint + disclosure act (`727bdcb`) |
| Is D91 modified, amended, or weakened by this act? | ❌ **NO** |
| Does this act relieve D91? | ❌ **NO** |
| What this act establishes | **Who** is competent to determine relief from D91 — **not** that relief exists |

> **D91 remains fully operative.** The LIVE-only constraint, the exemption from the UI12 preference, the fallback prohibition, and the disclosure obligation all stand unchanged.

---

## 12. RELATIONSHIP TO WP-MACRO-03

> # **ESTABLISHING COMPETENCE TO CONSIDER D91 RELIEF DOES NOT ITSELF AUTHORIZE ANY CHANGE TO WP-MACRO-03.**

WP-MACRO-03 remains an **independent source-governance constraint**, wholly outside D88's competence.

### 12.1 Constraints preserved without diminution

| Constraint | Status |
|---|---|
| **LIVE-only Macro behaviour** ("LIVE, never SNAPSHOT") | ✅ **PRESERVED** |
| **No SNAPSHOT fallback** | ✅ **PRESERVED** |
| **NAS / CPI / IIP approved dataset boundary** | ✅ **PRESERVED** — no WPI/PPI/RBI authority expansion |
| **Macro provenance requirements** | ✅ **PRESERVED** |
| **Server-side Macro governance** (`guardRead('macro')`) | ✅ **PRESERVED** |
| **`/api/macro` governed independently of the UI12 preference seam** | ✅ **PRESERVED** |

### 12.2 Consequence for any future relief

> ⚠️ **Any future relief determination must separately address WP-MACRO-03.**
>
> Any future relief determination made under the competence established here reaches **only** the UI12 data-mode dimension of D91. **It does not reach WP-MACRO-03.** A Macro capability constrained by WP-MACRO-03 requires its own separate authority — which this act does not confer on D88 or on any other authority.

---

## 13. AUTHORITY BOUNDARY — WHAT BELONGS TO LATER GATES

> # **THIS ACT ESTABLISHES COMPETENCE ONLY.**

The following are **expressly reserved** to the subsequent **D91 Relief Mechanism Act** and **D91 Relief Determination** gates, and are **not** established, defined, or implied here:

| Reserved item | Gate |
|---|---|
| Relief request form | Mechanism Act |
| Requester identity | Mechanism Act |
| Relief scope | Mechanism Act |
| Duration / temporality | Mechanism Act |
| Conditions | Mechanism Act |
| Evidence requirements | Mechanism Act |
| Approval workflow | Mechanism Act |
| Relief record format | Mechanism Act |
| **Actual relief** (grant or denial) | Relief Determination |

## 13.1 Implementation / certification / acceptance / production statements

> ## **Implementation:** **NO** implementation authority is created by this act. No application source code, Macro implementation, data-mode implementation, route, component, test, or configuration is authorized to change.
> ## **Certification:** **NO** certification authority is created by this act.
> ## **Acceptance:** **NO** acceptance authority is created by this act.
> ## **Production:** **NO** production authorization or activation is created by this act.

Per the governing separation preserved throughout:

> ### **D88 establishment ≠ D91 competence ≠ D91 relief mechanism ≠ D91 relief grant ≠ implementation ≠ qualification ≠ acceptance ≠ certification ≠ production authorization**

This act occupies the **D91 competence** position only.

---

## 14. D89 / D54 HISTORICAL BOUNDARIES

> # **NO HISTORICAL RECORD IS REWRITTEN BY THIS ACT.**

### 14.1 D89

| Statement | Record |
|---|---|
| D89's status | **Downstream evidence** — a formal decision act that *references* `D88 = A` |
| Does D89 constitute D88? | ❌ **NO** |
| Does D89 constitute D91 relief competence? | ❌ **NO** |
| Is D89 modified by this act? | ❌ **NO** |
| D89's Macro disclosure item | Remains recorded as **historically OPEN**; **not silently closed** by this act |

### 14.2 D54

| Statement | Record |
|---|---|
| D54's status | **An independent P13-B implementation authorization** |
| Is D54 D88? | ❌ **NO** |
| Does D54 constitute D88 or D91 relief competence? | ❌ **NO** |
| Is D54 modified or broadened by this act? | ❌ **NO** |
| **D54 §97 → D88 linkage** | Remains **historically asserted, not independently constituted**. **Not retroactively repaired.** |

### 14.3 D8 scope act wording (§9 of the governing gate)

The D8 scope act records: *"D88 remains the authority competent to grant relief from D91 — CONFIRMED — unchanged."*

> **That carry-forward statement has no independent constitutive force.** It was recorded while D88 was unestablished, restating the corpus assertion. It did not and could not constitute competence.
>
> **This act is the constitutive basis going forward.** The D8 act is **not rewritten** — the wording tension is recorded, and rectification of the D8 act (if desired) is a separate act requiring its own authority.

---

## 15. NO RELIEF — MANDATORY STATEMENT

> # ⚠️ **`D91 RELIEF — NOT GRANTED`**

| Statement | Record |
|---|---|
| Relief requested? | ❌ **NO** |
| Relief determination made? | ❌ **NO** |
| Relief denied? | ❌ **NO** — no determination has been made |
| Relief mechanism established? | ❌ **NO** |
| **Status** | **`NOT GRANTED`** — competence now exists; relief does not |

---

## 16. DURABILITY METADATA

| Field | Value |
|---|---|
| **Repository** | **`ramkivs/iips-review-recovered`** (IRR) — authoritative non-production IIPS review/governance repository |
| **Ref** | **`main`** (`refs/heads/main`) |
| **Baseline commit BEFORE mutation** | **`2dc556380abc4493ceb269be9da98b463e21f635`** |
| **Baseline tree BEFORE mutation** | `b4084a3eee46fd06c84967559cb5774b2062a138` |
| **Artifact path** | **`docs/integration/NP-08-D91-RELIEF-COMPETENCE-ESTABLISHMENT-ACT.md`** |
| **Placement rationale** | `docs/integration/` is the established IRR governance-record location, consistent with `NP-08-D8-MACRO-SCOPE-DETERMINATION-ACT.md` and `NP-08-D88-ACCOUNT-WIDE-UI12-DATA-MODE-AUTHORITY-ESTABLISHMENT-ACT.md`. **Not** placed in `evidence/intelligence-data-supply-governance/`: that directory is the byte-exact 10-file IPD GATE-Y corpus mirror published by P-4; adding an IRR-origin act would break the mirror property and falsify the P-4 corpus manifest. |
| **IPD** | **OUT OF SCOPE — zero mutation** |
| **Production** | **OUT OF SCOPE** |
| Durability convention | **C-1** — durable only on authoritative remote publication **plus** independent remote verification. **The Arena workspace is not authoritative. A local commit alone is not durable.** |

---

## 17. VERIFICATION RECORD

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

*(Rectification review per §12 of the governing gate performed before publication; values reported in the execution record.)*

---

## 18. LEAKAGE SELF-CHECK

| Prohibited leakage | Guard |
|---|---|
| Relief grant | §9.1, §15 — explicit `NOT GRANTED` |
| Competence over WP-MACRO-03 | §9.3, §12 — independent, untouched |
| Macro source-governance expansion | §9.4 — excluded |
| Implementation authority | §9.5, §13.1 — none |
| Certification authority | §9.6, §13.1 — none |
| Acceptance authority | §9.7, §13.1 — none |
| Production authority | §9.8, §13.1 — none |
| Identity/tenant authority | §9.9 — none |
| Historical rewriting | §14 — none |

---

*End of Competence Establishment Act. **D91 relief competence is established in D88**, limited to the UI12 data-mode dimension. No relief. No mechanism. No WP-MACRO-03 reach. No implementation, qualification, acceptance, certification, or production authority. No historical record modified.*
