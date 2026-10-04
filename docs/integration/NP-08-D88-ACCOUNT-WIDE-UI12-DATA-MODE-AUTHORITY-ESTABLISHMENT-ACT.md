# NP-08 — D88 ACCOUNT-WIDE UI12 DATA-MODE AUTHORITY ESTABLISHMENT ACT

## D88 — ESTABLISH ANEW

> **1. Artifact ID:** `NP-08-D88-ACCOUNT-WIDE-UI12-DATA-MODE-AUTHORITY-ESTABLISHMENT-ACT-01`
> **2. Title:** D88 — Account-Wide UI12 Data-Mode Authority Establishment Act
> **3. Authority / issuer:** **Ramki / Program Authority** (deciding authority). `arena-agent` performed investigation, verification, and record-execution **only**; no decision rendered by the agent.
> **4. Date/time (effective):** **`2026-10-04T14:52:52Z`** (UTC)
> **5. Decision status:** **`ESTABLISHED`** — effective on durable remote publication (§19)
> **Record type:** `AUTHORITY ESTABLISHMENT ACT` — governance only; non-executable
> **Workstream:** NP-08 — Intelligence · GATE-Y
> **Disposition:** **`ESTABLISH ANEW`**
> **Repository / ref (durable):** `ramkivs/iips-review-recovered` @ `main` (§19)
> **Mutation:** one new governance artifact; **zero** modification to any historical record

---

## 6. HISTORICAL BASIS

| # | Fact | Source |
|---:|---|---|
| 1 | **D89 explicitly records `D88 = A`** and states that **D85, D86 and D88 records are not edited**. | `D89_GLOBAL_UI12_DATA_MODE_PROPAGATION.md` header (IPD `arena/01a0a438`, and 11 IPD refs) |
| 2 | **D89 therefore demonstrates that D88 was treated downstream as an existing authority.** | same; D89 §4: *"⚠ **Outstanding:** D88 also requires the Macro UI to disclose its LIVE-only governance…"* |
| 3 | **Historical archaeology found zero recovered constitutive D88 acts**, despite extensive D88 references. | Exhaustive sweep: 33 IPD refs + 4 tags, 51 IRR refs + 2 tags. `D88 designation` = **0**; `D88 constitution` = **0**; `D88 establishment` = **0**; D88 filename matches = **0** |
| 4 | D89, D90, D91 form a genuine act chain — each names its predecessor commit as base. | D89 `da43051` → D90 base `da43051` → D91 base `57ea3bb` |
| 5 | **Every edge into D88 is assertion only.** D88 is the sole node in the chain with no incoming constitutive edge. | D89/D90/D91 headers cite `D88 = A`; no act constitutes it |
| 6 | WP-MACRO-03 is attested independently of D88 as a **source-governance** rule. | D89 §4: *"WP-MACRO-03 requires 'LIVE, never SNAPSHOT' — a source-governance rule, not a preference default"* |
| 7 | D54 is an independent P13-B implementation authorization. | `D54_P13B_IMPLEMENTATION_AUTHORIZATION.md` (8 IPD branches) |

---

## 7. REASON FOR `ESTABLISH ANEW`

> ## **D88 is `ESTABLISH ANEW`.**

**This act does NOT describe D88 as restored, re-designated, superseded, or recovered.**

| Negative finding | Statement |
|---|---|
| Nothing was recovered | No D88 artifact exists on any repository ref. **There is no prior artifact to restore.** |
| Nothing was superseded | Zero supersession/revocation evidence exists anywhere. **There is no prior act to supersede.** |
| Nothing is re-designated | Re-designation presupposes a prior designation. **None exists.** |

**This act does NOT claim that:**

* **D89 constituted D88.** D89 *references* `D88 = A`; it presupposes D88 rather than creating it. D89 is **historical evidence of downstream reliance**, not a constitutive act.
* **D54 constituted D88.** D54 is an independent P13-B implementation authorization. **D54 is not D88.**
* **WP-MACRO-03 constituted D88.** WP-MACRO-03 is an independent source-governance rule of a different class.

> **D88 is established for the first time by this act.** The authority that D89, D90 and D91 historically *referenced* is hereby *constituted* — prospectively, not retroactively.

---

## 8. D88 AUTHORITY DOMAIN

> # **Account-wide UI12 data-mode semantics.**

D88 governs the account-wide UI12 "Default data mode" preference: its semantics, its propagation across governed market-data surfaces, and the mode contract by which that propagation occurs.

D88's domain is **UI12 data-mode authority** — the governed account preference and the dispatch contract that applies it.

---

## 9. POSITIVE AUTHORITY BOUNDARIES

D88 is established with authority over:

| # | Positive authority |
|---:|---|
| 1 | **Account-wide UI12 default data-mode semantics** |
| 2 | **The governed account preference semantics** — the persisted per-principal default data-mode preference and its meaning |
| 3 | **The mode contract used by D89** — the server-side dispatch contract (the data-mode seam) by which a resolved preference is applied to mode-aware surfaces |
| 4 | **The authority boundary necessary to govern UI12 data-mode propagation** — including determinations as to which surfaces participate in account-wide data-mode dispatch |
| 5 | **Recognition of the existing Macro exemption boundary** as an *existing* boundary of UI12 propagation (see §13) — **not** as a new D88 grant |

---

## 10. EXPLICIT NON-AUTHORITY BOUNDARIES

> # **D88 ESTABLISHMENT DOES NOT ESTABLISH AUTHORITY OVER ANY OF THE FOLLOWING.**

### A. D91 relief

> **D88 establishment does not grant relief from D91.**
>
> **D91 relief remains `NOT GRANTED`** and requires its own separate authority determination.

This act is **not** a D91 relief request, **not** a D91 relief decision, and **not** a grant of D91 relief competence to D88.

### B. WP-MACRO-03

> **D88 does not supersede, amend, waive, or override WP-MACRO-03.**

WP-MACRO-03 remains an **independent source-governance constraint**. D88 holds no authority over it.

### C. Macro source governance

D88 does **not** establish authority over:

* Macro dataset selection;
* Macro source authority;
* MoSPI / RBI / WPI authority;
* Macro vintage policy;
* Macro provider governance;
* Macro LIVE/SNAPSHOT **source-governance** rules.

### D. Implementation

> **D88 establishment grants governance authority only. It does not authorize implementation.**

### E. Certification

> **No certification authority is created.**

### F. Acceptance

> **No acceptance authority is created.**

### G. Production

> **No production authorization or activation is created.**

### H. Persistence / tenancy / identity

D88 does **not** extend into:

* durable persistence;
* tenant authorization;
* `runtimeCompanyId`;
* **D115**;
* identity binding;
* server-side tenancy;
* production identity.

These remain separate governance domains.

---

## 11. UI12 DATA-MODE AUTHORITY vs SOURCE-GOVERNANCE AUTHORITY

> # **UI12 data-mode authority  ≠  source-governance authority.**

| | UI12 data-mode authority (**D88**) | Source-governance authority (**not D88**) |
|---|---|---|
| Object | The account-wide default data-mode **preference** and its propagation | The **source rule** governing how data is obtained |
| Character | A preference/dispatch matter | A **source-governance rule, not a preference default** (D89 §4) |
| Example | Whether a surface honours the principal's saved SNAPSHOT/LIVE/PIT preference | WP-MACRO-03: **"LIVE, never SNAPSHOT"** |
| Held by | **D88 (this act)** | **Not held by D88** |

**This distinction is preserved throughout and must not be collapsed.**

---

## 12. RELATIONSHIP TO D89

> **D89 is a downstream act that references `D88 = A`.**
> **D89 does not become the D88 constitutive act.**

| Statement | Record |
|---|---|
| D89's status | **Formal governance decision** — established as an act (`da43051`) |
| D89's authority claim | Declares `Authority: D88 = A` |
| Effect of that claim | Evidence that D88 was **treated downstream as existing** — **not** proof of constitution |
| Effect of this act | Establishes **prospectively** the authority D89 historically referenced |
| **Retroactive rewriting** | ❌ **NONE.** **D89 is not rewritten, not mutated, not reinterpreted.** |
| D89's continuing role | **Historical evidence of downstream reliance** |

> **This act does not retroactively constitute D89's authority basis.** It establishes D88 going forward. D89 remains, historically, an act whose declared authority had no recoverable constitutive artifact — a fact recorded, not repaired.

---

## 13. MACRO BOUNDARY

### 13.1 The historical D89 boundary — preserved

`/api/macro` is exempt from the ordinary UI12 preference seam **because WP-MACRO-03 establishes:**

> ## **"LIVE, never SNAPSHOT"**

### 13.2 What this act does NOT do

> ❌ **This act does NOT convert this into: "D88 grants Macro LIVE-only authority."**
>
> **That would be incorrect.**

The Macro LIVE-only rule originates in **WP-MACRO-03** (source governance), not in D88.

### 13.3 What this act does record

> ## **D88 recognizes the existing Macro exemption boundary for UI12 propagation, but does not originate, expand, or override the independent Macro source-governance rule.**

D88's relationship to Macro is **recognition of a boundary**, not **grant of an authority**.

| Relationship | Record |
|---|---|
| D88 originates Macro LIVE-only? | ❌ **NO** |
| D88 expands Macro authority? | ❌ **NO** |
| D88 overrides WP-MACRO-03? | ❌ **NO** |
| D88 recognizes the exemption as an existing boundary of UI12 propagation? | ✅ **YES** |

### 13.4 D89's Macro disclosure item — historically OPEN

> ⚠️ **D89 recorded the Macro UI disclosure item as `OPEN` and explicitly `NOT implemented in this act`.**
>
> **This act does not silently mark that disclosure complete.**

Verbatim from D89 §4:

> *"⚠ **Outstanding:** D88 also requires the Macro **UI to disclose** its LIVE-only governance so the exemption is visible to the user. `MacroContext.tsx` already renders *"freshness LIVE"* and a source line, but **does not yet state that it is exempt from the UI12 preference**. That disclosure is **NOT implemented in this act** and remains **OPEN** — recorded rather than quietly treated as satisfied."*

**Recorded here as a historical fact.** D91 subsequently records delivery of a disclosure component (`data-testid="macro-data-mode-exemption-disclosure"`), and D91 §5 records *"Phase 3 — Macro disclosure | COMPLETE (D91)"*. **This act takes no position on whether that closed D89's outstanding item** — that determination belongs to D91's own record and is **not** asserted, confirmed, or denied here.

---

## 14. RELATIONSHIP TO D54

| Statement | Record |
|---|---|
| What D54 is | **An independent P13-B implementation authorization** (`D54_P13B_IMPLEMENTATION_AUTHORIZATION.md`) |
| Is D54 D88? | ❌ **NO. `D54 is not D88.`** |
| Does this act modify D54? | ❌ **NO. D88 establishment does not modify D54.** |
| Is D54's scope broadened? | ❌ **NO. D54's scope is not broadened.** |
| D88's relationship to D54 §97 | D89/D90 **cite** `D54 §97` as a bound on D88 authority. **No recovered act links D54 §97 to D88.** That linkage is recorded here as **historically asserted, not established**. |

> **This act does not constitute, reconstruct, or repair the D54 §97 → D88 linkage.** The historical assertion is preserved as evidence; the linkage itself is not established by this act.

---

## 15. RELATIONSHIP TO WP-MACRO-03

| Statement | Record |
|---|---|
| Status of WP-MACRO-03 | **Independent source-governance constraint** — semantically established; source artifact not recovered |
| Is WP-MACRO-03 subordinate to D88? | ❌ **NO — `INDEPENDENT CONSTRAINT`** |
| Did WP-MACRO-03 constitute D88? | ❌ **NO** |
| Does D88 hold authority over WP-MACRO-03? | ❌ **NO** |
| Does this act amend or waive WP-MACRO-03? | ❌ **NO** |
| Rule preserved | **"LIVE, never SNAPSHOT"** — *"a source-governance rule, not a preference default"* (D89 §4) |

---

## 16. RELATIONSHIP TO D91

| Statement | Record |
|---|---|
| D91 status | **Established** as a constraint/disclosure act (`727bdcb`); source absent from IPD `main`, semantics reproduced durably |
| D91's declared authority | `D88 = A` |
| Does this act establish D91? | ❌ **NO** — D91 was established by its own act |
| Does this act modify D91? | ❌ **NO** |
| Does this act grant D91 relief? | ❌ **NO** |
| Does this act request D91 relief? | ❌ **NO** |
| Does this act grant D88 competence over D91 relief? | ❌ **NO** |

> ## **D88 establishment does not constitute a D91 relief request, a D91 relief decision, or a D88 grant of D91 relief competence.**
>
> ## **`D91 RELIEF = NOT GRANTED`**
>
> **unless a separate later authority act explicitly changes that status.**

---

## 17. IMPLEMENTATION-AUTHORITY STATEMENT

> # **THIS ACT GRANTS NO IMPLEMENTATION AUTHORITY.**

D88 establishment is a **governance authority designation**. It authorizes **no** code change, no wiring, no route change, no component change, no data-mode implementation change, and no Macro implementation change.

**No application source code, test, route, component, or configuration is modified by this act.**

---

## 18. CERTIFICATION / ACCEPTANCE / PRODUCTION STATEMENTS

> ## **Certification:** **No certification authority is created by this act.**
> ## **Acceptance:** **No acceptance authority is created by this act.**
> ## **Production:** **No production authorization or activation is created by this act.**

Per the IIPS separation preserved throughout:

> ### **Authorization ≠ Implementation ≠ Qualification ≠ Acceptance ≠ Certification ≠ Production Authorization**

This act occupies the **authorization** position only — and a **bounded governance-authority designation** at that.

---

## 19. SUPERSESSION STATEMENT

> **This act supersedes nothing.**

| Statement | Record |
|---|---|
| Does this act supersede any prior act? | ❌ **NO** |
| Was there a prior D88 act to supersede? | ❌ **NO — none existed** |
| Does this act amend D89, D90, D91, D54, or WP-MACRO-03? | ❌ **NO** |
| Historical records rewritten | ✅ **ZERO** |
| Is this act itself retroactive? | ❌ **NO — prospective from `2026-10-04T14:52:52Z`** |

---

## 20. DURABLE PUBLICATION METADATA

| Field | Value |
|---|---|
| **Repository** | **`ramkivs/iips-review-recovered`** (IRR) — authoritative non-production IIPS review/governance repository |
| **Ref** | **`main`** (`refs/heads/main`) |
| **Baseline commit BEFORE mutation** | **`50cc6a28741d9f7dc9e1868d395eed9d74ae7a44`** |
| **Baseline tree BEFORE mutation** | `590da460de509b5f84927e60b340d2824e4bf2f6` |
| **Artifact path** | **`docs/integration/NP-08-D88-ACCOUNT-WIDE-UI12-DATA-MODE-AUTHORITY-ESTABLISHMENT-ACT.md`** |
| **Placement rationale** | `docs/integration/` is the established IRR governance-record location (50 records at baseline), consistent with `NP-08-D8-MACRO-SCOPE-DETERMINATION-ACT.md` and `NP-08-P4-GATE-Y-CORPUS-PLACEMENT-DESIGNATION.md`. **Not** placed in `evidence/intelligence-data-supply-governance/`: that directory is the byte-exact 10-file IPD GATE-Y corpus mirror published by P-4; adding an IRR-origin act would break the mirror property and falsify the P-4 corpus manifest. |
| **IPD** | **OUT OF SCOPE — zero mutation** |
| **Production** | **OUT OF SCOPE** |
| Durability convention | **C-1** — durable only on authoritative remote publication **plus** independent remote verification. **The Arena workspace is not authoritative. A local commit alone is not durable.** |

---

## 21. VERIFICATION RECORD

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
| 10 | Remote artifact re-read and scope-verified | ☐ |

*(Completed values reported in the execution record; rectification review per §12 performed before publication.)*

---

## 22. SCOPE-LEAKAGE GUARD — SELF-CHECK

| Prohibited leakage | Guard |
|---|---|
| Accidental D91 relief | §10.A, §16 — explicit `NOT GRANTED` |
| Accidental Macro authority | §10.C, §13 — recognition only, no grant |
| Accidental WP-MACRO-03 override | §10.B, §15 — independent, untouched |
| Accidental implementation authority | §10.D, §17 — none |
| Accidental certification authority | §10.E, §18 — none |
| Accidental production authority | §10.G, §18 — none |
| Accidental identity/tenant authority | §10.H — none |
| Accidental historical rewriting | §7, §12, §14, §19 — none |
| Accidental modification of D89/D54/WP-MACRO-03 | §12, §14, §15, §19 — none |

---

*End of Authority Establishment Act. **D88 is established anew** — account-wide UI12 data-mode authority, governance only. No D91 relief. No Macro authority. No WP-MACRO-03 override. No implementation, qualification, acceptance, certification, or production authority. No historical record modified.*
