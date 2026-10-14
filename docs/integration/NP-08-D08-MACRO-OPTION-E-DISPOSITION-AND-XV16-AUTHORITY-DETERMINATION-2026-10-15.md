# NP-08 / D08 MACRO — OPTION E DISPOSITION and `XV-16` AUTHORITY DETERMINATION

> **1. Artifact ID:** `NP-08-D08-MACRO-OPTION-E-DISPOSITION-AND-XV16-AUTHORITY-DETERMINATION-01`
> **2. Title:** Macro disclosure — Option E deferral disposition, and the `XV-16` cross-repository authority determination
> **3. Authority / issuer:** **Ramki / Program Authority** (deciding authority). `arena-agent` performed investigation, verification and record-execution **only**; no decision was originated by the agent. **Basis of the recorded decisions:** the PA's explicit direction of `2026-10-15` ("Requested disposition: Macro disclosure — Option E…; `XV-16` — formally determine whether the IPD-side record can discharge or modify the IRR-owned obligation…; preferred future implementation candidate: L-C, subject to a separate implementation-authority gate and compatibility verification"), recorded under the corpus's established *PA-direction* convention — see §1.2.
> **4. Date of recording:** **`2026-10-15`** (Asia/Kolkata) = **`2026-10-14T18:55Z`** (UTC)
> **5. Decision status:** **`DECIDED AND RECORDED; DURABLE PUBLICATION PENDING`** — following `NP-13-PA-D2-C-REALIZATION-SEMANTICS-DECISION-01` row `D2-CM-3` ("**DECIDED (§§6–11); DURABLE PUBLICATION PENDING (§19–§20)** — condition **not yet fully satisfied**"). Effectiveness requires durable remote publication on **IRR `main`** (§8); until then this act is **non-authoritative** in the sense stated by `IIPS_v3.0_NP12_GOVERNED_SCREENER_PROGRAM_AUTHORITY_ACCEPTANCE_DECISION`: "*Until steps 3 and 4 are complete and verified, this act is **non-authoritative**, and … acceptance is **recorded but not yet effective on `main`**.*"
> **6. Ratification of this record's wording:** **PENDING PA RATIFICATION** — the *decisions* are the PA's; the *formulation* is the agent's execution, and no PA confirmation of this text exists in the record. Nothing in this document asserts that such confirmation was given.
> **7. Record type:** `DISPOSITION + AUTHORITY DETERMINATION` — governance only; **non-executable**; grants nothing.
> **8. Workstream:** NP-08 — Intelligence · D08 MACRO · D89 UI-disclosure gate (and the D88/D91 relief mechanism)
> **9. Repository / ref (durable):** `ramkivs/iips-review-recovered` @ **`main`** (pending) — presently published on PR #98 head; durable destination per `NP-08-P4-GATE-Y-CORPUS-PLACEMENT-DESIGNATION` **C-1** ("*authoritative closure requires publication to IRR `main`*")
> **10. Mutation:** one new governance artifact; one additive forward-pointer in the linked packet; additive tracker rows only. **Zero** modification to any historical record; **zero** product-code, IPD, fence or governed-act modification.
> **11. Supersession:** **none.** This act supersedes no prior act, amends no operative act, and rewrites no history. D88, D89, D91, the D91 relief mechanism acts, the M-5 disposition act, the D8 scope determination act and `NP-07` remain exactly as written.
> **13. Ratification and gate state (additive, `2026-10-15`):** H-18 §8.3(a) **SATISFIED** — see **§11**; H-18 §8.3(b) merge authorization **NOT SATISFIED**, so this act remains **non-authoritative**. Field 6 is **preserved as published and not rewritten**; §11.3 states its relationship to this update. **→ superseded in effect by field 14 and §12:** the PA issued the named §8.3(b) authorization and PR #98 was admitted at `2d5b376`, so this act is authoritative on the `main` baseline. The wording above is retained exactly as published rather than rewritten; `NP-08/D08 §11.8` and tracker `§16.25`–`§16.26` carry the sequence.
> **12. Production:** **OUT OF SCOPE.** No implementation, promotion, main-admission, runtime, end-to-end or production authority is granted or implied.
> **14. Durable publication (additive, `2026-10-15`; appended after field 12, which `main` carries after field 13 — position preserved from the published header, numbering unchanged):** **COMPLETED** — admitted to `ramkivs/iips-review-recovered` `refs/heads/main` at merge commit `2d5b37635bcdcda6f8d05d3cab92e043d70032fe` via **PR #98**; see **§12**. This act is now **authoritative** on the `main` baseline.

---

## 1. Instrument basis

### 1.1 The questions this act disposes

Both arise from `NP-08-D08-MACRO-DISCLOSURE-DECISION-PACKET-01` (`docs/integration/NP-08-D08-MACRO-DISCLOSURE-XV16-PA-DECISION-PACKET-2026-10-14.md`), whose Q1–Q3 were the outstanding items:

| Packet question | Disposition here |
|---|---|
| **Q1** — how is the outstanding Macro disclosure obligation disposed of (Options A–E)? | **§3 — Option E**, recorded, with the obligation expressly preserved |
| **Q2** — does the IPD-side `D91` record discharge, supplement, conflict with, or have no effect on the IRR-owned obligation? | **§4 — no effect on the IRR obligation**, on the three cited grounds; the general question is bounded, not enlarged |
| **Q3** — is any `D91/D88` relief needed in the present state? | **§4.7 / §7.6 — no**, and relief remains **ungranted** |

### 1.2 Why this form is the correct one, and what it is not

| Convention element | Precedent relied on | Effect here |
|---|---|---|
| A PA decision **supplied in direction** may be recorded as a durable act by the agent | `IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD` row **AD-01**: "*Bounded Reports presence ratification (**PA direction Q3)***"; and `NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT`: "*every decision recorded in this act was supplied **explicitly by Ramki***" | The two determinations are recorded as **the PA's**, attributed to the `2026-10-15` direction. No signature, authenticated identity or timestamp is invented: this repository's act format has **no signature field** and none is simulated |
| Ratification/acceptance is **bounded** and grants nothing beyond its named scope | AD-01: "*AD-01 **IS A BOUNDED PRESENCE RATIFICATION ONLY**. … It grants no implementation, promotion, UI, runtime or end-to-end acceptance authority*" | §7 states the boundary; §3.10 and §6.1 keep L-C at "candidate for evaluation" |
| A record is **effective on durable remote publication** to IRR `main` | `NP-08-D88-…-AUTHORITY-ESTABLISHMENT-ACT` field 5: "*`ESTABLISHED` — effective on durable remote publication (§19)*"; C-1: "*authoritative closure requires publication to IRR `main`*" | Field 5 above: **decided and recorded, not yet effective**; §8 lists the exact remaining steps |
| An act **cannot record its own publication coordinates** | NP-12: "*The publication coordinates of this act (its own merge commit, tree, blob, pull request number, and merge timestamp) **cannot be recorded inside the artifact that they contain***" | §8 leaves them to the tracker (§16.22 and the `§5` change-log row), which is where they are independently verifiable |
| Distinct statuses must not be collapsed | `CV-CORR-09` discipline; §16.21 | §8.3 separates **local validation**, **remote publication**, **remote verification** and **formal PA ratification** as four different facts |

**What this act is not:** not an implementation authority; not the D89 UI-disclosure implementation gate named in `D89 §19`; not a `D91 Relief Determination`; not a qualification, admission, activation, acceptance or approval; not a closure of `CV-53`, `XV-15` or `XV-16`; not a licence, entitlement or provenance statement.

---

## 2. Determinations as recorded

| ID | Decision as recorded | Operative scope | Effectiveness | Not granted / not concluded |
|---|---|---|---|---|
| **D-1** | **Option E — explicit deferral of Macro disclosure *implementation*, obligation preserved** | Records that no Macro disclosure view is to be built now; fixes the contract a future gate must satisfy; retains `L-C` as the preferred future candidate | **DECIDED AND RECORDED; DURABLE PUBLICATION PENDING** (field 5) | No implementation authority; no satisfaction, qualification, admission or compliance; `CV-53` stays `BLOCKED (authority)` |
| **D-2** | **`XV-16` — the IPD-side `D91` record has no effect on the IRR-owned obligation** | Confines the IPD-side record's evidentiary reach to its own corpus and its own disclosure category; IRR's D89 items remain open and unsilenced | **DECIDED AND RECORDED; DURABLE PUBLICATION PENDING** | Does not declare the IPD record false, withdrawn or superseded; does not resolve whether some *future* instrument could make a source-corpus record operative against IRR (see §4.6) |

---

## 3. D-1 — Macro disclosure disposition: Option E

| # | Clause |
|---|---|
| **E-1** | Implementation of the Macro disclosure **view** is **expressly deferred** for the present. No UI, component, route, nav entry or test for it is authorised by this act. |
| **E-2** | The disclosure **obligation is preserved as outstanding**, subject to its governing conditions: `D89 DT-1…DT-15` (provider/platform transparency, dataset labels, IIP **NIC 2-digit level only**, separation, non-endorsement, no invented provenance, no licence language) and **D91 §1** (the UI12 data-mode exemption notice on `MacroContext.tsx`). Both attach **to a rendered Macro view**; neither is discharged by this act. |
| **E-3** | **Deferral ≠ abandonment, satisfaction, qualification, admission or compliance.** Recorded in the terms of the M-5 disposition act: "*`DEFERRED` does NOT mean `ABANDONED`*". This act produces a *status record*, not a *state of compliance*. |
| **E-4** | **No implementation authority is granted.** `D89 §3` ("UI implementation authority: **NOT GRANTED BY THIS GATE**"), `D89 §19` (a separate gate is required) and `DT-15` (the act is not authority to change UI code, components, styles, `MacroContext`, API clients, transport or tests) continue to bind without amendment. |
| **E-5** | **D89's existing constraints are preserved unchanged**, including the `DT-1` string verbatim: *"Provider: Ministry of Statistics and Programme Implementation (MoSPI) · Data platform: e-Sankhyiki."* Also preserved: `DT-11` attribution format **NOT DETERMINED** and `DT-13` legal non-endorsement **NOT ESTABLISHED** — the deferral does not quietly resolve them. |
| **E-6** | **All operative D91 requirements are preserved**: LIVE-only semantics, the **fallback prohibition**, the approved **NAS / CPI / IIP** dataset boundary, provenance requirements, and server-side governed transport. Nothing here modifies WP-MACRO-03 §16.1's eight constraints. |
| **E-7** | **No synthetic fallback and no alteration of live-source-only semantics is authorised or implied.** The absence of egress in the recording environment stays recorded as such (`502 RETRY_BUDGET_EXHAUSTED`, zero observations) rather than being relieved by substitution. |
| **E-8** | **`D91/D88` relief remains ungranted.** "No D91 relief is in force" stands; the **third** of the three required acts — the *D91 Relief Determination* — still does not exist, and this act does **not** create, pre-authorise or deem it. `D88`'s competence remains exactly the UI12 data-mode dimension and remains a power to **determine requests, not to originate them** (relief act §8.3). |
| **E-9** | **Reconsideration conditions** are recorded at §5; the deferral is condition-bounded, not open-ended: any of R-1…R-6 re-opens the question without further ceremony beyond the gate. |
| **E-10** | **`L-C` (`MacroSourceDisclosure.tsx`) is retained as the preferred future candidate for *evaluation*, not as an approved implementation** (§6). The rejected-as-primary routes (`A` port `L-B`, `C` adopt `L-E`'s markup) and the alternative (`D` fresh component) remain *available*; nothing is foreclosed beyond what their own incompatibilities already foreclose. |

**Consequences for the register (recording, not re-scoring):** `CV-53` keeps **`BLOCKED (authority — implementation gate not granted)`**; the D89 disclosure items keep their open state and the relief act's "historically **OPEN**; **not silently closed**" note continues to govern; `XV-15` stays `OPEN` and IPD-side; `Live E2E` stays `C — BLOCKED`. **No status is advanced by this act.**

---

## 4. D-2 — `XV-16` cross-repository authority determination

Each finding below is stated **narrowly**, with its authority basis, and each is confined to what the cited instruments support.

### 4.1 Does the IPD-side record establish that its own test passed?
**Yes — within its own corpus, at its own scope, as a self-reported result.** Delivery commit `727bdcb` (2026-09-15, parent `57ea3bb`) exists in IPD and contains the asserted changes: `MacroContext.tsx` **+23**, `MacroContext.test.tsx` **+20**, `frontend/server/data-mode/data-mode.test.ts` **+21**, plus the act document. **OBSERVED**, by `git show` of that commit in the read-only IPD clone. The *test run itself* was not re-executed here and no independent execution result for the IPD-side suite is claimed: the record's "**20 passed / 0 failed**" and "**50 passed** (≥48)" are its **own reported outcome**, accepted only as evidence that the artifact was delivered in that form.

### 4.2 What does the test prove, and what does it not?
The two added assertions are **jsdom** render checks (`findByTestId('macro-data-mode-exemption-disclosure')` + three `toHaveTextContent` regexes) and a badge check (`freshness-live` present, `freshness-snapshot` absent), executed under **`globalThis.fetch = urlAwareMock(IIP_DATA)`**.
- **Proves:** that a component in that lineage, in a test harness with a mocked fetch, renders that markup and that text.
- **Does not prove:** browser or runtime behaviour (the record itself says "**Browser/runtime qualification: NOT CLAIMED**"); compatibility with IRR's admitted route contract (that lineage calls `GET /api/macro?dataset=` over `authFetch`; IRR `main` serves `/api/macro/{dataset}` over `noAuthFetch` and returns `400/404/405/502` shapes); live-source reachability; qualification, admission, activation or compliance; or **any** satisfaction of `DT-1…DT-8`, because the markup is the **D91 data-mode notice**, not the D89 provider disclosure.
**Category finding, restated as determinative:** `D89 DT-1` and `D91 §1` are **two different obligations**; a test of one cannot evidence the other.

### 4.3 Is the claimed implementation present on authoritative IRR `main`?
**No.** IRR `main` `1b2b194` carries `frontend/src/features/research/MacroContext.tsx` (5,944 B, blob `2066eae2`) returning `children` only; `git grep` over `main` finds **no** `macro-data-mode-exemption-disclosure`, **no** `DT-1` string, **no** `Default data mode` client reference, **no** `frontend/server/data-mode/`. The claimed file state exists **only** on IPD `arena/01a0a438` (blob `f6fe90f5`, 7,972 B) — reachable from **exactly one** ref across both repositories. **OBSERVED.**

### 4.4 Does the IPD-side record possess delegated authority to discharge or modify an IRR-owned obligation?
**No, on the instruments as written** — three independent grounds, none requiring reinterpretation:
1. **Placement (C-1).** `NP-08-P4-GATE-Y-CORPUS-PLACEMENT-DESIGNATION` (PA, 2026-10-04) selects **C-1** as the durability convention: **IRR is the durable destination; IPD is the source corpus, read-only, unmutated**. A record placed in the source corpus is not an instrument over the destination corpus's obligations.
2. **Host.** The file that D91 §1 names does not exist on IPD `main`, so an IPD-side change to it cannot alter what the personal application renders. **OBSERVED** (path enumeration of IPD `main`'s `frontend/src/features/`).
3. **Competence.** `D88`'s competence is limited to "the **UI12 data-mode dimension** of D91" and to **determining requests** (relief act §7.1, §8.3); it confers no power to close a `D89` UI-disclosure item, and `D89 §19` reserves that to the PA through a separate gate. **OBSERVED** in the act texts.
The IPD record's own header — "Authority: **D88 = A**" and "**Correct-by-addition:** D85, D86, D88, D89 and D90 records are NOT edited" — is consistent with, not contrary to, this: it claims **no** amendment of IRR's D89.

### 4.5 What is the effect of the IPD record on the IRR obligation under the existing governance rules?
**No discharge, no conflict, and no amendment — it is evidence of a different obligation in a different corpus.** Read precisely, "Phase 3 — Macro disclosure | **COMPLETE (D91)**" asserts completion of the **D91 §1 data-mode notice** on the IPD-side `MacroContext.tsx`; it does not assert, and cannot supply, satisfaction of `D89 DT-1…DT-15` on IRR's admitted surface. IRR's own records continue to state "**No D91 relief is in force**" and D89's disclosure item remains "**historically OPEN; not silently closed**". Accordingly — and this is the operative part of the determination — **the IRR obligation remains open and the deferral in D-1 is the recorded disposition**; and the IPD-side record is **not** to be treated as false, withdrawn, superseded or re-adjudicated here, only as **without operative effect on IRR**.

### 4.6 What further act would be required to change the IRR disposition?
| To change… | Required act | Who may render it |
|---|---|---|
| any part of the disclosure implementation | the separate **`D89` UI-DISCLOSURE IMPLEMENTATION AUTHORITY GATE** act, recorded in IRR `docs/integration/` per C-1 | PA alone (`D89 §3/§19`, `DT-15`) |
| whether macro participates in the UI12 data-mode preference (or the D91 §1 notice's fate as a consequence) | a **D91 Relief Determination** on a **§9-conforming request** with **§10**'s ten evidence items present — the missing **third** act | PA (D88 competence, exercised as determination of a request) |
| the cross-corpus effect itself, as a *rule* | an express PA designation extending or withholding source-corpus authority over IRR obligations | PA; **not** performed here — see §4.7 |
| IRR's durable state at all | admission to **IRR `main`** via PR merge | PA's merge act (explicitly outside this task) |

### 4.7 Bounded, not enlarged (preserved point)
This determination decides the **narrow** question: *this IPD-side record does not discharge or modify this IRR-owned obligation.* It **does not** decide the general question — *whether any act recorded in the read-only source corpus could ever be given operative effect against an IRR obligation* — because no instrument in either corpus answers it, and inventing one is barred. That general question is recorded as **UNRESOLVED (no governing authority located in the verified scope)**, and `XV-16`'s status is **not** advanced beyond "no operative effect on IRR; general rule unaddressed". Related, and unchanged: **no relief is presently needed**, since IRR `main` has no client-side data-mode control and the macro mount passes no `deps`, so the LIVE-only exemption holds **structurally and untested** — a fact to be hardened under its own authority, not by this act.

---

## 5. Conditions that require reconsideration of D-1

| # | Trigger | Why it re-opens the question |
|---|---|---|
| **R-1** | A future authorised decision to implement a **rendered Macro view** (the D89 gate opens) | `DT-1`/`DT-2` and the D91 §1 notice attach to a view; at that moment disclosure ceases to be latent and becomes mandatory, and `L-C` must be verified or `D` chosen |
| **R-2** | Any decision to give the client a **data-mode / Settings control**, or to route macro through it | engages relief act §7.1(1)–(4) — the exemption stops being structural and needs a determination, including the **untested invariant** of §4.7 |
| **R-3** | `XV-16`'s general question being addressed by the PA (§4.6) | would change how future cross-corpus records are read, possibly in IPD's favour |
| **R-4** | A change to the source, dataset boundary, vintage or provenance posture (WP-MACRO-03 §16.1 items) | the deferral was conditioned on those being untouched |
| **R-5** | `M-3` provenance becoming established, or `DT-11`/`DT-13` being determined | the disclosure copy depends on them; `L-C`'s wording may have to change |
| **R-6** | Any product requirement for a user-facing Macro surface, or an owner-facing need to show provider attribution in-app | deferral is a governance disposition, not a product veto |

Standing review note (no new authority): **the deferral self-terminates on R-1**, because the gate act, by `D89 §19`'s own terms, must address disclosure in the implementation it authorises.

---

## 6. `L-C` — preferred future candidate, not an approved implementation

**6.1 Status.** `L-C` = `frontend/src/features/research/MacroSourceDisclosure.tsx` (2,008 B) + `MacroSourceDisclosure.test.tsx` (2,525 B) on IRR `arena/01a10b3c-…` (`b21df5c`, 5 ahead / 177 behind `main`, on **no** PR head). **Retained for evaluation only.** It is **not** admitted, **not** selected as *the* implementation, and **not** authorised for merge or port by this act.

**6.2 Why it is preferred.** Its dependencies already exist on IRR `main` (`react` + `main`'s own `MacroDataset` type; no server module, no auth module, no route), it was written *for* D89, it carries `data-testid`s and `aria-labelledby`, the `DT-2` dataset labels with IIP granularity, and a `children` slot for per-dataset placement (`DT-3`/`DT-4`); and its header records "No route is invented here … the smallest coherent D89 UI unit".

**6.3 Verification that any future adoption must pass** (compatibility, stated as pre-conditions, not as work done):
| # | Must be verified | Anchor |
|---|---|---|
| V-C1 | provider/platform line equals `DT-1` **verbatim** — `'Data source: MoSPI / e-Sankhyiki'` is **non-conforming** and must be replaced, not adjusted | `DT-1` |
| V-C2 | dataset labels and **IIP "NIC 2-digit level only"** wording; `DT-3` shared-line vs per-dataset split | `DT-2`, `DT-3` |
| V-C3 | placement + persistence (`DT-4`), responsive/accessible (`DT-5`), separation from IIPS interpretation (`DT-6`) | `DT-4`–`DT-6` |
| V-C4 | **no** endorsement implication (`DT-7`), **no** invented provenance (`DT-8`), **no** licence/rights language (`DT-12`); optional `DT-9` Category-A wording only, never licence-styled | `DT-7`, `DT-8`, `DT-9`, `DT-12` |
| V-C5 | the **D91 §1** notice treated as a *separate* requirement, satisfied by its own markup — not by `L-C` | `DT-1` vs D91 §1; §4.2 |
| V-C6 | nav entry + mounted view + tests land in **one** change (`App.test.tsx` requires every rendered nav href to resolve to a built surface), and the two fenced client one-liners (`getJson` discarding the transport `code`; the mount not passing `deps`) are decided **in the same gate** | §16.17.4; `CV-41` |

**6.4 Also required before any adoption:** re-verify `L-C`'s blobs against the tip of `arena/01a10b3c-…` at that time (that branch is unmerged and could move), and confirm no second implementation of the same surface has appeared since this record.

---

## 7. Preserved obligations, boundaries and non-movements

| # | Preserved |
|---|---|
| P-1 | **No Macro UI, component, route, nav entry or test is implemented**, and none of `MacroContext.tsx`, `frontend/src/api/macro.ts`, any transport, any source adapter or any application file was modified |
| P-2 | **`D91/D88` relief not granted, not assumed, not deemed**; the missing *Relief Determination* stays missing; §8.3's no-self-initiation bar is respected |
| P-3 | **No fallback, no synthetic substitute, no change to LIVE-only or snapshot semantics**; the environment's absence of egress is recorded as an unmet evidence dependency, not worked around |
| P-4 | **`CV-38` restart-proof port not executed** — it remains behind `CV-24` as recorded in `§16.20` |
| P-5 | **PR #98 not merged**; **neither repository's `main` changed** (IRR `1b2b194`, IPD `4d3e1cd`, both re-verified at §8.2); IPD **read-only, unmutated** |
| P-6 | **No governed act edited**; the only records touched are this act, the linked packet's forward-pointer, and additive tracker rows. D89's `DT-1…DT-15`, D91's requirements, D88's competence and the M-5/D8 scope determinations are unchanged **including their non-retroactive character** — nothing here makes any prior act look retroactively authorised |
| P-7 | **Fences intact:** `reports-transport.ts`, `user-portfolio-transport.ts`, `owner-context-unavailable.ts`; unrelated workstreams (G-2, `D-1`, `AD-20`, §20 Stage 3, `CV-20`…`CV-25`, `CV-50`) untouched and unmodified |
| P-8 | **No claim** of production readiness, qualification, admission, activation, certification or compliance; `L-A`'s 56 passing unit tests and green CI remain *what they are* and are not re-scored |
| P-9 | **`XV-15`** (IPD `ui13_macro_vintage_tracker.ts:39` `sourceClassification:'REAL'` over a placeholder digest) stays `OPEN`, IPD-side, uncorrected here; MD-5 "*No live provider execution. LOCAL_FIXTURE only*" remains the governing caution |

---

## 8. Effectiveness, the exact remaining act, and what changes when it is performed

### 8.1 Steps, following the NP-12 four-step form
| Step | State |
|---|---|
| 1 — PA review/acceptance of the **decisions recorded here** | **SUPPLIED BY DIRECTION** (`2026-10-15`, quoted in field 3). No agent-originated decision is present in §3 or §4 |
| 2 — **PA ratification of this record's wording** | **PENDING** — the exact missing act: a one-line PA confirmation ("`NP-08-D08-MACRO-OPTION-E-DISPOSITION-AND-XV16-AUTHORITY-DETERMINATION-01` — RATIFIED AS RECORDED, `2026-10-15`"), or an edit request. Until it exists, field 6 stays `PENDING PA RATIFICATION` and no text here may be quoted as the PA's own phrasing. **Checked, not assumed:** a repository-wide ratification search was executed on `2026-10-15` (tracker `§16.23.2`) — 0 reviews, 0 issue or commit comments, 0 timeline events after the head timestamp, no ratifying commit message on any of the 128 distinct tip trees, and the corpus's only occurrence of the confirmation phrase is this very line — i.e. **negative within the verified scope**; re-searching for it is unnecessary until either this act is amended or `main` moves |
| 3 — **Durable publication**: merge of **PR #98** to `ramkivs/iips-review-recovered @ main` (via PR; **no direct push, no force-push**) | **NOT PERFORMED** — the PA's merge act, expressly withheld from this task |
| 4 — **Independent remote verification** of the merged commit, parent, root tree, this record's blob SHA and raw SHA-256, plus the tracker row | **NOT PERFORMED** — possible only after step 3 |

**Until steps 3 and 4 are complete and verified, this act is non-authoritative and the disposition is recorded-but-not-effective.** That is the intended posture, not an oversight: this task was authorised to prepare, validate and publish the instrument, not to admit it.

### 8.2 Verification performed on the published (non-durable) state
| Axis | Result |
|---|---|
| **Local validation** | heading/table structure and every cited identifier checked against the sources named (act texts on `main`, `727bdcb` hunks, `L-C` blobs, `L-B`/`L-E` sizes, IPD `main` paths); no claim here rests on a report or a memory |
| **Remote publication** | committed to `arena/ee3fd321-iips-review-recovered`; coordinates recorded in the tracker, not in this file (§1.2, self-reference rule) |
| **Remote verification** | `git ls-remote` head equality, contents-API blob compare, and PR state read **after** push — reported in §16.22 / `CHG-2026-10-15-01` |
| **Formal PA ratification** | **NOT PERFORMED — outstanding** (steps 2–4 above) |

### 8.3 Next authorized step, after each
- After **step 2**: nothing else becomes permitted; the record's wording simply becomes quotable as the PA's.
- After **steps 3–4**: D-1 and D-2 become durable and effective; the tracker's `XV-16` row may then be read as "*determined — no operative effect on IRR; general rule unaddressed*"; and `CV-53` remains `BLOCKED (authority)` **unchanged** — no further status moves regardless of publication.
- **The only authorized implementation path thereafter** is the `D89` UI-disclosure implementation gate (§4.6 row 1); `R-1`…`R-6` decide *when* it is reached, `V-C1`…`V-C6` decide *what it must satisfy*.

---

## 9. Remaining dependencies and limits of this record

| # | Item | State |
|---|---|---|
| L-1 | Live-source reachability of `/api/macro` (NAS/CPI/IIP) | **UNRESOLVED here** — no egress; operator step on an egress machine; no substitute offered |
| L-2 | `M-3` provenance `NOT ESTABLISHED`; attribution `NOT DETERMINED`; entitlement class `B`; external MoSPI contact not authorised | unchanged by this act |
| L-3 | The LIVE-only exemption is **structurally true on `main` but untested** | hardening item, needs no UI authority, **not** performed here |
| L-4 | Windows-copy evidence scope | closed at **identity + provenance only** in `CV-CORR-09` (all six reported SHA-256 digests reproduce from IRR blobs; `blob + LF` accounts for every size delta); its **untracked** items sit on no ref and stay unreconcilable |
| L-5 | Coverage boundary | 127 IRR tree-tips and both `main` refs scanned for any superseding record: **none found**; not searched / inaccessible — issues, Discussions, wiki, PR `merge` refs beyond #98, hosted log *text*, unpushed working-copy state anywhere, IPD-side non-macro evidence |
| L-6 | Census currency | IRR ref count moved 213 → 313 **only** because this turn added `refs/pull/*/head` and `refs/pr/*` mirrors by fetch (GitHub also created `refs/pull/98/merge` `cd569d6`); **no new authored branch, tag or PR exists in either repository**, and `phase13-next 4357e14`, `gai-impl-canonical f63a9b4`, `arena/01a10b3c 36e433a`, IPD `arena/01a0a438 ea00140` are unchanged — which is why the prior census is reused rather than re-derived |
| L-7 | This record's own authority | it **records** a disposition; it **creates no authority** — if any reader takes §3 or §4 as a permission, that reading is outside what the cited instruments permit |

---

## Appendix A — relationship to the decision packet

`NP-08-D08-MACRO-DISCLOSURE-DECISION-PACKET-01` remains the **evidence base** (obligations, discovery, option matrix, Windows reconciliation, `XV-16` anatomy) and is unmodified except for an additive forward-pointer at its head. This act is the **disposition instrument**; the two together are one record set, published at one point (PR #98), with **no competing PR, register or summary**. Where the packet described the state as "obligation operative and attached to a surface that does not exist", this act adopts that wording as its own basis (see `CV-CORR-09` / `§16.21.2`).

## Appendix B — publication coordinates

Deliberately **not recorded here**, per the self-reference rule quoted in §1.2. They are recorded in the root tracker: `## 16.22` and the `§5` row `CHG-2026-10-15-01`, which carry the branch head, PR state, CI conclusion, remote `sha256` compare and both `main` refs.

---

## 11. Ratification and gate state — additive section, `2026-10-15`

> **Purpose.** Fields 5 and 6 recorded this act as *decided but pending ratification of its wording*. Section 11 applies the governing convention to that self-imposed bar and records the outcome of both questions it raises — **ratification** and **merge authority** — from the operative clauses, not from general intent. **Nothing above this line is edited, reworded or reinterpreted.**

### 11.1 The clauses that decide it

| Instrument (path) | Operative text | What it fixes |
|---|---|---|
| `docs/integration/IIPS_v3.0_H18_PRODUCT_SCOPE_SINGLE_USER_PERSONAL_USE.md` §8 | "*3. **Pre-merge gates.** (a) **Program Authority review and approval**. (b) **Merge authorization (separate explicit authorization required)**. 4. **Post-merge gates.** (a) `origin/main` contains this record. (b) Independent remote verification of the merged state. 5. **Effectiveness.** This decision takes effect only after post-merge verification. Before that, this candidate is **non-authoritative**.*" | The gate model is **four gates, and two of them are separate**: approval of the *decision*, and authorization of the *merge*. Approval is not conditioned on any signature |
| `docs/integration/IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md` §P5 | "*This effectiveness rule **does not grant merge authorization**. Merge requires a **separate, explicit authorization after review** (§10).*" | Forecloses the one inference that would be convenient here: a recorded/decided status never carries merge with it |
| `docs/integration/IIPS_v3.0_E2E-030_D42_DELTA_GOVERNANCE_DECISION.md` header + §3.1/§3.2, row **R-10** | "**Decision & Sign-Off Authority** … **Ramki** — … acting via **explicit scope-limited role consolidation for this specific** … **delta**"; "**Recording agent** … (recording and controlled repository publication only; **no independent authority, delegation, or third-party signature is invented**)"; §3.2 title "**Explicit Authorization to Merge and Publish to `main`**"; R-10 "**Separate Merge Authorization to `refs/heads/main`** … Explicitly authorized by platform owner (`Ramki`) **for `arena/17a2c787-iips-review-recovered` → `refs/heads/main`**" | **Sign-off = the owner's explicit direction on a named matter.** No signature artifact exists in the form; and a merge grant, when given, is **named to a specific branch/head and expressly scope-limited** ("*not a general governance-policy change*") |
| `docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md` §8 | "***IRR `main`: NOT PUBLISHED.** … publication to `main` … G1 is **CLOSED only when this record is durably published and independently verified** on IRR `main`. Until then G1 is **PARTIALLY CLOSED**.*"; and its self-reference rule for commit/blob identifiers | The **candidate posture** this act is in is itself a named state in this corpus, with its own vocabulary — "PARTIALLY CLOSED", non-authoritative, publication coordinates kept outside the artifact |
| `docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_BOUNDARY.md` §8 | heading "**Program Authority decision block (UNSIGNED — NOT RECORDED)**", decision cells "`[ ]`", signature column "**PENDING**" | What a **missing** PA decision looks like in this corpus: an explicit `PENDING`, not an inferred yes. Field 6 used that vocabulary correctly at the time; §11.2 updates it because the decision has since been given |

### 11.2 Gate state as at this commit

| Gate (H-18 §8) | State | Evidence |
|---|---|---|
| **3(a) Program Authority review and approval** | **SATISFIED — for D-1 and D-2 exactly as directed, and for nothing else** | The PA's direction of `2026-10-15` enumerated the determinations ("*Macro disclosure: **Option E** — explicitly defer implementation while preserving the obligation*"; "*`XV-16`: **formally determine** whether the IPD-side record can discharge or modify the IRR-owned obligation*"; "*Preferred future implementation candidate: **L-C**, subject to a separate implementation-authority gate and compatibility verification*"), authorized execution of "*the decision-recording actions supported by the existing governance process and the user's explicit direction*", barred fabrication ("*Do not fabricate a signature, acceptance, or authorization*"), and then stated that "*the user's Option E direction … [is] **already established**" and "*the task is to investigate and apply the existing governance convention, **not to reopen settled choices***" |
| **3(b) Merge authorization** | **NOT SATISFIED — this act is therefore not admitted to `main`** | No record in either repository authorizes merging **PR #98**; the standing program instruction is negative on the point; and per §11.1 the authority must be **separate, explicit and named to the branch/head** |
| **4(a) `origin/main` contains this record** | **NOT SATISFIED** — verified: `git ls-tree origin/main docs/integration` shows no `OPTION-E-DISPOSITION` path | Read this turn, not inferred from a prior report |
| **4(b) Independent remote verification of the merged state** | **NOT APPLICABLE until 4(a)**; branch-level verification performed instead (contents-API `sha256` equality, CI success) and reported in tracker `§16.23`–`§16.24` | — |
| **5 Effectiveness** | **NON-AUTHORITATIVE** until 4(a)+4(b); status line at §11.6 | H-18 §8.5 verbatim |

### 11.3 Disposition of field 6 — corrected by applying the convention, not by overriding it
Field 6 required "**PA ratification of this record's wording**". Read against H-18 §8.3(a) and the D42 sign-off model, that bar was **stricter than the corpus requires**: gate (a) asks for **review and approval of the decision**, and no governing clause conditions effectiveness on the PA's confirmation of an agent-drafted formulation. The corpus's own practice is the opposite — the implementation-authority act records "*every decision … supplied **explicitly by Ramki***" while the agent wrote the text, and AD-01 is titled by its **direction** ("*PA direction Q3*"). Accordingly: **field 6's `PENDING PA RATIFICATION` is preserved as published** (this is an additive act, not an edit of a published state), and §11.2 gate 3(a) records the bar as **satisfied on the substance directed**. Where the PA has not decided, this corpus writes `PENDING` — which is why **3(b) still reads NOT SATISFIED** and why **`CV-53`, `XV-15`, `XV-16` and `Live E2E` stay exactly as registered**.

### 11.4 Provenance and authenticity statement
The direction relied on in §11.2 was delivered **through this session's task channel**, which is the channel by which every `NP-08` act in this corpus was decided; **no signature, authenticated identity, timestamp, seal or third-party attestation is claimed, invented or implied**, and the agent claims no independent authority, delegation or decision of its own. This section is the **narrowest valid additive update**: it records gate (a) and leaves gate (b) open. It does **not** convert the candidate into an authoritative record, and it does not restate, extend or soften D-1 or D-2.

### 11.5 What this section expressly does not do
No **merge**; no **implementation** of any Macro UI, component, route or test; no **`CV-38` port**; no **`D91/D88` relief**, exemption or implied waiver; no **synthetic fallback**; no **edit of any governed act** (D89/D91/D88/D8/M-5 unchanged, including their non-retroactive character); no **qualification, admission, activation, certification or compliance**; no resolution of the **general** cross-corpus authority question (still `UNRESOLVED`); no inference that CI success or branch publication evidences any of the above.

### 11.6 Resulting status for this act
> ## **RATIFIED AS DIRECTED — gate 3(a) SATISFIED (bounded to D-1 and D-2); DURABLE PUBLICATION PENDING — blocked on the separate explicit merge authorization required by H-18 §8.3(b).**
> Until gates 4(a) and 4(b) complete, this act remains **non-authoritative** and **PARTIALLY CLOSED** in the corpus's own vocabulary.

### 11.7 The precise missing instrument
One explicit statement from the Program Authority, in the D42 §3.2 form, naming **`arena/ee3fd321-iips-review-recovered` @ the head carrying this act → `refs/heads/main`**, i.e. **PR #98 in its entirety (21 commits, 18 files)** — the scope being what GitHub merges atomically. If the PA prefers, the grant may be **strictly scope-limited** to the three governance records (this act, the packet, the tracker), in which case the PR's earlier `CV-CORR-04`/`CV-CORR-06` product and CI changes remain unadmitted and a decision on them is separately owed. **No competing docs-only PR will be opened without such a governance reason.** Verification after any merge follows H-18 §8.4 and the NP-12 four-step form: merged commit, parent, root tree, this record's blob and raw `sha256`, then the tracker's `§5` row.

### 11.8 Basis correction for gate 3(b) — additive, `2026-10-15`; the conclusion is unchanged, the evidence is now durable

The §11.2 row for gate **3(b)** cited, among its grounds, "the standing program instruction is negative on the point". That clause rested on a task-line reading that has since been **withdrawn as unsubstantiated**, and it is **no longer relied upon**. The line is preserved as published rather than edited; this subsection records the corrected basis, which is independent of it and consists only of durable records:

| # | Durable record | Verbatim operative text | Consequence |
|---|---|---|---|
| 1 | `governance/REPOSITORY_INFRASTRUCTURE.md` §(`main` policy) on IRR `main` | "*No direct commits to main*" | `main` movement is possible only through the PR route — and the route's authorization is separately governed |
| 2 | `IIPS_v3.0_H18_PRODUCT_SCOPE_SINGLE_USER_PERSONAL_USE.md` §8.3 | "*Pre-merge gates … (b) **Merge authorization (separate explicit authorization required)**" | An affirmative, named grant is a **precondition**, not a default |
| 3 | `IIPS_v3.0_G2_2_…DECISION_RECORD.md` §P5 | "*This effectiveness rule **does not grant merge authorization**. Merge requires a separate, explicit authorization after review*" | Ratification/decided-status never supplies it, and neither does a green CI or a verified branch |
| 4 | `IIPS_v3.0_GATE_C_P2_EXECUTION_HANDOFF_ARENA_TO_NON_PRODUCTION_HOST_2026-10-13.md` §2 | "*The attributed standing authorization (F-3 source blob `c4c9f7d7…`, re-verified unchanged) covers **governance-record preparation, branch publication for review and read-only verification**; **it is the basis for this record and for nothing else***" | The **agent-side ceiling** on delegated authority is express: publication *for review* on a branch, not admission to `main`. This act, the packet and the tracker rows are inside that ceiling; a merge is outside it |
| 5 | `IIPS_v3.0_OWNER_CONTEXT_F3_IMPLEMENTATION_AND_QUALIFICATION_RECORD.md` (blob `c4c9f7d7…`) §2/§3 | "*the Program Authority granted standing authorization **for this workstream** … covers the necessary decisions, governance records, implementation, testing, corrections, and publication **within the established scope**. Do not request repeated approval for individual decisions or routine implementation steps*"; and "*This record therefore grants **no** authority beyond §4*" | "Publication **within the established scope**" is not a general admission power, and a **workstream-scoped** grant cannot be extended to another workstream's PR; equally, the "do not request repeated approval" clause is respected — no settled decision is being reopened here, and none is asked for |
| 6 | Repository practice, read from the remote | PRs **#90** (`33bbb0f`, `2026-10-13T18:11:40Z`), **#96** (`f813354`), **#97** (`1b2b194` — the current `main` tip) and **#54** (`e2cda00`) each carry a `Merge pull request #NN from …` commit by `ramkivs` at `+0530` | Admission has consistently been the **owner's own act** on this repository, including for the immediately preceding documentation PRs of this session family — which is corroborating practice, not the ground of the requirement |

**Determination unchanged: gate 3(b) is NOT SATISFIED, and no merge may be performed or inferred on this record set.** Independently re-verified this pass, and reported rather than assumed: **no** review, **no** comment and **no** label on PR #98 carries a grant; the F-3 standing authorization's own text limits it ("*The authorization does not permit fabricated evidence; weakened safeguards; unrelated scope expansion; claims of success without verification*"); and the branch-protection endpoint is **not readable** by this session's credentials (`403 Resource not accessible by integration`), so no mechanical permission can be substituted for the governance one — recorded as a verification limit, not as evidence of authorization. **What would satisfy gate 3(b):** the express, named grant described at §11.7.

---

## 12. Durable publication confirmed — H-18 §8.4 gates closed (`2026-10-15`)

**12.1 What happened.** The Program Authority issued an **explicit, named merge authorization** for PR #98, `arena/ee3fd321-iips-review-recovered` → `refs/heads/main`, at verified head `ba010a426feb9723fa972c04853120602a7f579c` "or its verified successor", expressly conditioned on `H-18 §8.3(a)` remaining satisfied — which §11.2 records as SATISFIED. That authorization supplies precisely the element `§11.1`/`§11.8` found missing, and no other authority was inferred: **merge authorization ≠ implementation authority**, and none is claimed here.

**12.2 Verification performed against the authoritative remote (H-18 §8.4).**
| Check | Result |
|---|---|
| §8.4(a) `origin/main` contains this record | **YES** — `docs/integration/NP-08-D08-MACRO-OPTION-E-DISPOSITION-AND-XV16-AUTHORITY-DETERMINATION-2026-10-15.md`, blob **`a34ce3846b5830e4092fa7fb7d9f8497bafe6947`** |
| Merge commit | **`2d5b37635bcdcda6f8d05d3cab92e043d70032fe`**, subject `Merge pull request #98 from ramkivs/arena/ee3fd321-iips-review-recovered`, by `ramkivs` at `2026-10-15T01:30:44+0530`, `mergedAt=2026-10-14T20:00:44Z` — **via the PR mechanism; no direct push, no force-push** |
| Parents | first `1b2b194…` (pre-merge `main`) · second `ba010a4…` (**the authorized head**, i.e. the merge admitted exactly what was authorized) |
| Root tree | **`9ba9fd9efca71315fb78590ab7db3d7357423855`** |
| Raw SHA-256, read independently from the remote contents API | this act **`62ab0a42d9551b09…`**, the packet **`0eec32a4238d47c9…`**, the tracker **`d84e2c7e5f5d7e21…`** — all **MATCH** the locally verified bytes |
| Admitted delta | `1b2b194..2d5b376` = **18 files, +2,535 −18** — the reviewed set, nothing else |
| Fence integrity at the merge | `reports-transport.ts` `98147054…`, `user-portfolio-transport.ts` `51704c12…`, `owner-context-unavailable.ts` `cb8db45d…` — **UNCHANGED** |
| Governed-act integrity at the merge | D89 `9652f890…`, D91 relief mechanism `f61325ee…`, D88 `d396e688…`, D8 scope `7cd63efb…`, M-5 `2006786c…` — **all UNCHANGED** |
| Option E boundary at `main` | **0 diff lines** across `frontend/src/features/research`, `frontend/server/macro`, `frontend/src/api/macro.ts`; the only merge-diff paths containing "macro" are this program's two records (filename) |
| IPD | `refs/heads/main` = `4d3e1cd…`, **unchanged**; the clone remained read-only |
| Self-reference, stated rather than left to be discovered | **This §12 and header field 14 were not part of what `2d5b376` admitted** — the act on `main` at that commit is blob `a34ce384…` without them, exactly as the `NP-12` rule predicts. They arrive in the immediately following admission (the sequential follow-up PR from this same branch, `#99`), whose own coordinates are recorded in this tracker's `CHG-2026-10-15-05` row rather than inside this act |

**12.3 Status consequence, stated precisely.** Field 5's "`DURABLE PUBLICATION PENDING`" and §11.2's gate 4(a)/4(b) "NOT SATISFIED" are **superseded for status purposes by this section**; both remain readable as published, per the corpus's additive-correction discipline. Under `H-18 §8.5` ("*takes effect only after post-merge verification*") and `D88` field 5 ("*effective on durable remote publication*"), **D-1 and D-2 are now effective as recorded — bounded to what they actually decide.**

**12.4 What effectiveness does NOT mean.** D-1 defers implementation and preserves the obligation, so **`CV-53` remains `BLOCKED (authority — D89 implementation gate not granted)`**; the two determinations grant no UI, component, route, test or port authority; **`CV-38` remains behind `CV-24`; `XV-15` remains `OPEN`; `XV-16`'s general cross-corpus rule remains `UNRESOLVED`; `Live E2E` remains `C — BLOCKED`**; no qualification, admission, activation, certification or compliance follows from publication or from CI. Publication makes the **record** authoritative; it does not make the **capability** exist.
