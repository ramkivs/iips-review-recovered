# NP-08 / M-5 — D91 OUT-OF-SCOPE AUTHORITY RECONCILIATION & DISPOSITION ACT

> **Record type:** `M-5 GOVERNANCE DISPOSITION ACT` — **not** a D91 relief act, **not** a D91 status
> **Effective date/time:** **`2026-10-04T17:48:07Z`** (UTC)
> **Issuing authority:** **Ramki / Program Authority** — narrowly scoped M-5 disposition decision
> **Recording agent:** `arena-agent` — investigation, verification, record-execution **only**
> **Repository / ref (durable):** `ramkivs/iips-review-recovered` @ `main` (§14)
> **Mutation:** one new governance artifact; **zero** historical edits
> **IPD:** OUT OF SCOPE — zero mutation

---

## 1. PURPOSE

To disposition **M-5's D91 dependency** as lying **outside D88/UI12 relief competence**, on the basis that the D8 wording conflates a **source-governance / data-acquisition authority question** with **D91/D88 UI12 relief**.

> # ⚠️ **THIS IS AN M-5 GOVERNANCE DISPOSITION. IT IS NOT A D91 RELIEF STATUS.**

| Prohibited representation | Record |
|---|---|
| This act constitutes D91 relief | ❌ **NO** |
| This act requests D91 relief | ❌ **NO** |
| This act grants D91 relief | ❌ **NO** |
| This act creates a D91 status | ❌ **NO** |
| This act modifies the D91 mechanism | ❌ **NO** |
| Macro is out of Intelligence scope | ❌ **NO** |
| Macro acquisition is prohibited by this act | ❌ **NO** |
| D91 is overridden | ❌ **NO** |
| D88 has Macro source authority | ❌ **NO** |

---

## 2. CONTROLLING HISTORICAL M-5 DEFINITION

> **M-5 = *"Relief from D91 (authority D88) for macro, **if** macro remains within Intelligence scope."***

| Stage | State | Source |
|---|---|---|
| Before the D8 scope act | `CONDITIONAL` — no determinate antecedent | D8 act §8.1 |
| After the D8 scope act | **`APPLICABLE`** — conditional antecedent satisfied | D8 act §8.2 |
| Relief | **`NOT REQUESTED / NOT GRANTED`** | D8 act §8.3 |

> ### **D8 act §8.3 is preserved verbatim and remains historically correct:**
> **"M-5 is NOT complete and NOT satisfied. Applicability is not relief. The next D91/D88 decision remains separate and is not authorized, requested, or granted by this act."**

---

## 3. D8 SCOPE DETERMINATION

| Field | Value |
|---|---|
| Decision | **A — MACRO REMAINS IN D8 INTELLIGENCE SCOPE** |
| Effect | Prior `D08 MACRO = DEFERRED` **resolved**; `DEFERRED does NOT mean ABANDONED` discharged |
| Effective point | `2026-10-04T12:25:34Z` |
| Durable artifact | `7cd63efb4de4dd574a5ce04fe0c471465210bf0f` |

> # ✅ **MACRO REMAINS IN D8 INTELLIGENCE SCOPE. This act does not alter that.**

---

## 4. D88 COMPETENCE BOUNDARY

| Field | Value |
|---|---|
| D88 establishment | Commit `2dc556380abc4493ceb269be9da98b463e21f635`; blob `d396e6880e0f5af35bd004e06bbf6b2eff03ec0a` |
| D88's domain | **Account-wide UI12 data-mode semantics ONLY** |
| D91 relief competence | Commit `b607ea9ea1e8ea7180e4bd6ee15374bf11a28630`; **limited to the UI12 data-mode dimension** |
| Competence expanded by this act? | ❌ **NO** |

### 4.1 The D88 act's own boundary table (verbatim)

| | UI12 data-mode authority (**D88**) | Source-governance authority (**not D88**) |
|---|---|---|
| Object | The account-wide default data-mode **preference** and its propagation | **The source rule governing how data is obtained** |
| Character | A preference/dispatch matter | A **source-governance rule, not a preference default** (D89 §4) |
| Example | Whether a surface honours the principal's saved SNAPSHOT/LIVE/PIT preference | WP-MACRO-03: **"LIVE, never SNAPSHOT"** |
| Held by | **D88** | **Not held by D88** |

### 4.2 D88's own statement on Macro (verbatim)

> **"This act does NOT convert this into: 'D88 grants Macro LIVE-only authority.' … The Macro LIVE-only rule originates in WP-MACRO-03 (source governance), not in D88."**
> **"D88 recognizes the existing Macro exemption boundary for UI12 propagation, but does not originate, expand, or override the independent Macro source-governance rule."**
> **"D88's relationship to Macro is recognition of a boundary, not grant of an authority."**

---

## 5. D91 MECHANISM BOUNDARY

| Field | Value |
|---|---|
| Mechanism | Commit `3c626157ec6bf3a7e4d5a6b3d708274fe7874e72`; blob `f61325ee3d3121467ca29c731440e0e233a44165` |
| Within | Macro's participation in / exemption from the account-wide UI12 preference; terms of that exemption; the `MacroContext.tsx` disclosure obligation |
| **Outside — no authority established** | **Macro source governance; provider selection; dataset selection; vintage semantics; LIVE/SNAPSHOT source semantics; persistence; tenancy; `runtimeCompanyId`; D115; implementation; certification; acceptance; production** |
| Modified by this act? | ❌ **NO** |
| Statuses | `GRANTED`, `DENIED`, `WITHDRAWN`, `EXPIRED`, `SUPERSEDED` — **unchanged; none added** |

> # **No D91 status is created by this act.**

---

## 6. COMPLETED UI12 CONFLICT INVESTIGATION

| # | Finding | Source |
|---:|---|---|
| 1 | Intended Macro architecture is **LIVE-only** | WP-MACRO-03; D91; D89 §4; D90 §2 |
| 2 | Macro is **deliberately outside** the UI12 preference seam | D89 §4: *"deliberately not routed through the seam"* |
| 3 | **No UI12 behaviour required by Macro is prohibited by D91** | Completed investigation |
| 4 | SNAPSHOT is **independently** prohibited by WP-MACRO-03 | D88 act §11; D89 §4 |
| 5 | D88 **cannot** grant Macro source/data-acquisition authority | D88 act §11; §13.2–13.3; mechanism §7.2 |
| 6 | **No genuine D91/UI12 relief need exists** | Completed investigation |
| 7 | No D91 request exists; no D91 relief exists | 0 files across all refs/tags |

> # **FINDING: There is no D91/UI12 conflict requiring D88 relief.**
>
> This is an **architectural finding**, recorded here as the basis for an M-5 disposition. **It is not a D91 mechanism status.**

---

## 7. MACRO SOURCE-GOVERNANCE BOUNDARY

> # **MACRO SOURCE / DATA-ACQUISITION AUTHORITY IS NOT D88.**

| Authority | Holder |
|---|---|
| Account-wide UI12 data-mode semantics | **D88** |
| **Macro source governance** ("how data is obtained") | ❌ **NOT D88** — no established owner (§13) |
| Macro LIVE-only source rule | **WP-MACRO-03** (independent) |
| Macro dataset selection / provider governance / vintage policy | ❌ **NOT D88** |

> ⚠️ **This act establishes NO new authority owner for Macro source governance.** The absence of an owner is recorded as a **follow-on open item** (§13), not filled by invention.

---

## 8. WP-MACRO-03 PRESERVATION

> # **WP-MACRO-03 REMAINS INDEPENDENTLY AUTHORITATIVE.**

| # | Constraint | Status |
|---:|---|---|
| 1 | Macro LIVE-only ("LIVE, never SNAPSHOT") | ✅ **PRESERVED** |
| 2 | No SNAPSHOT fallback | ✅ **PRESERVED** |
| 3 | NAS / CPI / IIP approved dataset boundary | ✅ **PRESERVED** |
| 4 | Provenance | ✅ **PRESERVED** |
| 5 | Server-side governed transport (`guardRead('macro')`) | ✅ **PRESERVED** |
| 6 | No WPI / PPI / RBI expansion | ✅ **PRESERVED** |
| 7 | No unauthorized source/provider changes | ✅ **PRESERVED** |
| 8 | No unauthorized vintage-policy changes | ✅ **PRESERVED** |
| 9 | Macro source/provider governance untouched | ✅ **UNTOUCHED** |

---

## 9. RECONCILIATION OF THE D8 WORDING

### 9.1 The wording under reconciliation (verbatim, D8 §7.2)

> **"D91 and D88 are not modified, superseded, or weakened by this act.** A separate D91/D88 relief act remains required before any macro data acquisition or SNAPSHOT fallback could be authorized."*

### 9.2 The chronology — the decisive fact

| Act | Effective | Relevance |
|---|---|---|
| **D8 scope act** | **`2026-10-04T12:25:34Z`** | Writes the §7.2 sentence |
| **D88 establishment** | **`2026-10-04T14:55:22Z`** | **Bounds D88 to UI12-only** — *2h30m later* |
| **D91 competence** | **`2026-10-04T16:06:53Z`** | Grants D91 relief competence, **UI12-only** |
| **D91 mechanism** | **`2026-10-04T16:45:37Z`** | **Excludes Macro source governance** — *4h20m later* |

> # 🔑 **D8 §7.2 was written BEFORE D88's competence was constitutively bounded.**
>
> When D8 recorded *"a separate D91/D88 relief act remains required,"* **the scope of what such an act could reach had not yet been constituted.** It was constituted afterwards — and it is **UI12-only**, expressly excluding Macro source governance.

### 9.3 The five-part reconciliation

| | Proposition | Supported? | Basis |
|---|---|---|---|
| **A** | Macro remains IN D8 Intelligence scope | ✅ **YES** | D8 act, decision A |
| **B** | M-5 remains historically applicable as originally recorded | ✅ **YES** | D8 act §8.2 — preserved unchanged |
| **C** | D91 relief is NOT required for the intended UI12 behaviour, because there is no D91/UI12 conflict | ✅ **YES** | §6 findings 1–6 — **an architectural finding, not a D91 status** |
| **D** | "before any macro data acquisition" in D8 §7.2 refers to a **source-governance / data-acquisition authority question outside D88's competence**, rather than creating a D91 relief power D88 can exercise | ✅ **YES** | D88 act §11 (source governance "Not held by D88"); §13.2–13.3; D91 mechanism §7.2; **and the §9.2 chronology** |
| **E** | M-5's D91 dependency **cannot be satisfied** by a D91 relief request/grant, and must not be represented as such | ✅ **YES** | Follows from A–D |

### 9.4 Explicit statement — no silent reinterpretation

> # ⚠️ **D8 IS NOT REWRITTEN, AND NOT SILENTLY REINTERPRETED.**
>
> D8 §7.2 and §8.3 **remain exactly as recorded** and remain accurate as to their own effective point. This act records that the phrase *"a separate D91/D88 relief act remains required"* is **now bounded by later constitutive acts** — D88's UI12-only establishment (`2dc5563…`), the D91 competence grant (`b607ea9…`), and the D91 mechanism's exclusion of source governance (`f61325ee…`).
>
> **This reconciliation is stated openly, not applied silently.** The D8 wording is preserved for anyone to read and to contest.

---

## 10. M-5 DISPOSITION

> # **`M-5 D91 DEPENDENCY — OUTSIDE D88/UI12 RELIEF COMPETENCE`**

> ### **M-5 is dispositioned as a D91/D88 out-of-scope dependency for the intended Macro architecture. This disposition does not constitute D91 relief, does not request or grant D91 relief, does not create a D91 status, and does not modify the D91 mechanism. Macro remains within D8 Intelligence scope. The intended Macro architecture has no UI12 data-mode conflict requiring D88 relief. Macro source/data-acquisition authority remains outside D88 competence and remains governed independently by the applicable Macro source-governance record, including WP-MACRO-03.**

### 10.1 Mandatory qualifying statements

| # | Statement | Record |
|---:|---|---|
| 1 | Macro remains in D8 scope | ✅ |
| 2 | M-5 was applicable under the original conditional predicate | ✅ — D8 §8.2, preserved |
| 3 | No valid D91/UI12 relief need exists for the intended architecture | ✅ — §6 |
| 4 | D88 cannot authorize Macro source/data acquisition | ✅ — §7 |
| 5 | D91 mechanism remains unchanged | ✅ — §5 |
| 6 | No D91 relief has been requested or granted | ✅ |
| 7 | WP-MACRO-03 remains independently authoritative | ✅ — §8 |
| 8 | LIVE-only remains mandatory | ✅ |
| 9 | SNAPSHOT remains prohibited | ✅ |
| 10 | No implementation/certification/acceptance/production authority is created | ✅ — §12 |

### 10.2 What this disposition does **NOT** say

> # ❌ **M-5 IS NOT DECLARED COMPLETE OR SATISFIED BY THIS ACT.**

| Prohibited claim | Record |
|---|---|
| `M-5 COMPLETE` | ❌ **NOT CLAIMED** |
| `M-5 SATISFIED` | ❌ **NOT CLAIMED** |
| `D91 RELIEF NOT REQUIRED` **as a D91 mechanism status** | ❌ **NOT CREATED** |
| `D91 RELIEF NOT REQUESTED` **as a D91 mechanism status** | ❌ **NOT CREATED** |
| Any new D91 status | ❌ **NOT CREATED** |

> **M-5's D91 dependency is dispositioned. M-5's underlying source-governance dependency is NOT resolved** — it is recorded as a follow-on open item (§13).

---

## 11. EXPLICIT NON-RELIEF STATEMENT

> # ⚠️ **`D91 RELIEF — NOT GRANTED / NOT IN FORCE`**

| Statement | Record |
|---|---|
| D91 relief requested by this act? | ❌ **NO** |
| D91 relief conferred by this act? | ❌ **NO** |
| D91 relief denied by this act? | ❌ **NO** — no determination is made; none is permitted without a request |
| D91 Stage 1 scope created? | ❌ **NO** |
| D91 Stage 2 determination made? | ❌ **NO** |
| **D91 relief status** | **UNCHANGED — `NOT GRANTED / NOT IN FORCE`** |

---

## 12. NO IMPLEMENTATION / PRODUCTION IMPLICATION

> ## **Implementation:** **NO** implementation authority is created by this act. No Macro UI, Macro API, data-mode runtime, `guardRead`, API transport, frontend behavior, server behavior, persistence, identity, or test is authorized to change.
> ## **Certification:** **NO** certification authority is created by this act.
> ## **Acceptance:** **NO** acceptance authority is created by this act.
> ## **Production:** **NO** production authorization or activation is created by this act.

> ### **D88 establishment ≠ D91 competence ≠ D91 relief mechanism ≠ D91 relief grant ≠ implementation ≠ qualification ≠ acceptance ≠ certification ≠ production authorization**

---

## 13. FOLLOW-ON OPEN ITEM

> # ⚠️ **MACRO SOURCE / DATA-ACQUISITION AUTHORITY HAS NO ESTABLISHED OWNER.**

| Field | Record |
|---|---|
| Finding | The dependency D8 §7.2 describes — authorization before *"any macro data acquisition or SNAPSHOT fallback"* — lies in **source governance** |
| D88 competent? | ❌ **NO** — UI12 data-mode authority only |
| Established owner | ❌ **NONE IDENTIFIED** |
| Action taken by this act | **NONE** — the gap is **recorded, not filled** |

> **This act does not invent an authority owner.** Establishing one requires a separate, explicit constitutive act by Ramki / Program Authority, and is outside this gate.

---

## 14. HISTORICAL-RECORD PRESERVATION

> # **NO HISTORICAL RECORD IS REWRITTEN BY THIS ACT.**

| Record | Treatment |
|---|---|
| **D8** | ❌ Not modified. §7.2 and §8.3 preserved verbatim; reconciliation stated openly (§9.4), not applied silently. Blob `7cd63efb…` |
| **D88 establishment** | ❌ Not modified — `d396e688…` |
| **D89** | ❌ Not modified. Macro disclosure item remains **historically OPEN**. |
| **D90** | ❌ Not modified. Macro row remains `EXEMPT (WP-MACRO-03)`. |
| **D91** | ❌ Not modified. LIVE-only constraint fully operative. |
| **D91 competence** | ❌ Not modified — `4bb191a6…` |
| **D91 mechanism** | ❌ Not modified — `f61325ee…` |
| **WP-MACRO-03** | ❌ Not modified |
| **D115 act** | ❌ Not modified — `4ab8c649…`; orthogonal (0 `M-5`/`D91`/`Macro`/`WP-MACRO-03` mentions) |

> **D8 §8.3's "M-5 is NOT complete and NOT satisfied" was correct when recorded and remains accurate as to its own effective point.** This act supersedes M-5's **current status** without falsifying the historical record.

---

## 15. DURABILITY METADATA

| Field | Value |
|---|---|
| **Repository** | **`ramkivs/iips-review-recovered`** (IRR) |
| **Ref** | **`main`** (`refs/heads/main`) |
| **Baseline commit BEFORE mutation** | **`c7573698b7b882ecb2942bd84057c33ce003c303`** |
| **Baseline tree BEFORE mutation** | `f4df1768480b605292082cbdbf601e17690a347f` |
| **Artifact path** | **`docs/integration/NP-08-M5-D91-OUT-OF-SCOPE-DISPOSITION-ACT.md`** |
| **Placement rationale** | `docs/integration/` is the established IRR governance-record location, consistent with the D88, D91 competence, D91 mechanism, and D8 scope acts. **Not** placed in `evidence/intelligence-data-supply-governance/`: that directory is the byte-exact 10-file IPD GATE-Y corpus mirror published by P-4. |
| **IPD** | **OUT OF SCOPE — zero mutation** |
| **Production** | **OUT OF SCOPE** |
| Durability convention | **C-1** — durable only on authoritative remote publication **plus** independent remote verification |

---

## 16. VERIFICATION RECORD

| # | Check | Requirement |
|---:|---|---|
| 1 | Remote commit exists | ☐ |
| 2 | Parent relationship correct | ☐ |
| 3 | Branch/ref = `main` | ☐ |
| 4 | Artifact present on remote `main` | ☐ |
| 5 | Blob SHA recorded | ☐ |
| 6 | SHA-256 from remote content | ☐ |
| 7 | Size / line count | ☐ |
| 8 | Clean worktree after push | ☐ |
| 9 | No unintended files changed | ☐ |
| 10 | Remote artifact re-read and rescanned | ☐ |
| 11 | IPD unchanged | ☐ |

---

*End of Disposition Act. **M-5's D91 dependency is dispositioned as outside D88/UI12 relief competence. No D91 relief requested, granted, or denied. No D91 status created. No D91 mechanism change. Macro remains in D8 Intelligence scope. WP-MACRO-03 intact. LIVE-only mandatory. SNAPSHOT prohibited. No implementation, qualification, acceptance, certification, or production authority. No historical record modified.***
