# NP-08 / D08 MACRO — V-C5 · D91 §1 NOTICE · DECISION RECORD

> **1. Record ID:** `NP-08-D08-MACRO-V-C5-D91-NOTICE-DECISION-RECORD-01`
> **2. Title:** `V-C5` residual — the **D91 §1 UI12 data-mode exemption notice** on the IRR Macro surface: verified state, authority boundary, and the **exact decision required**
> **3. Authority / issuer:** **Ramki / Program Authority** is the deciding authority. `arena-agent` performed investigation, verification and record-execution **only**; **no decision is rendered, originated, implied or pre-empted by the agent in this record.**
> **4. Date of recording:** **`2026-10-15`** (Asia/Kolkata)
> **5. Decision status:** **`DECISION REQUIRED — NOT DECIDED`**. Nothing in this record is a determination, an authorization, a relief, an acceptance or a compliance finding. This record has **no operative effect** and grants nothing.
> **6. Record type:** `DECISION RECORD` (state record + decision request) — governance only; **non-executable**
> **7. Workstream:** NP-08 — Intelligence · D08 MACRO · the `V-C1…V-C6` adoption conditions of `NP-08-D08-MACRO-OPTION-E-DISPOSITION-AND-XV16-AUTHORITY-DETERMINATION-01` (§6.3)
> **8. Repository / ref (read):** `ramkivs/iips-review-recovered` @ **`main`** = **`805a10af4180691abcb76a0dac96a3c6541a39aa`** (re-verified this task; `git ls-remote` = fetched `origin/main`)
> **9. Mutation:** one new governance artifact; additive tracker rows only. **Zero** application-code change, **zero** governed-act edit, **zero** register/count movement, **zero** IPD mutation.
> **10. Supersession:** **none.** This record supersedes no act and amends no operative text. The Option E act, the D89 act, the CV-53 implementation-authority act, the D91 competence/mechanism acts, the M-5 disposition act and the D8 scope determination remain exactly as written.
> **11. Production:** **OUT OF SCOPE.** No implementation, admission, qualification, activation or production authority is granted or implied.

---

## 1. What `V-C5` is — and what this record is not

`V-C5` is one of the six compatibility **pre-conditions** recorded by the (durable, effective) Option E act in its §6.3 table, under the heading *"Verification that any future adoption must pass (compatibility, stated as pre-conditions, not as work done)"*:

| ID | Condition, verbatim | Anchor given |
|---|---|---|
| **V-C5** | "the **D91 §1** notice treated as a *separate* requirement, satisfied by its own markup — not by `L-C`" | `DT-1` vs D91 §1; §4.2 |

**Two limbs, separately checkable:**

| Limb | Requirement |
|---|---|
| **L-1 — separation** | The D91 §1 notice is treated as a **separate requirement** from the D89 `DT-1…DT-15` provider/dataset disclosure (and therefore from `L-C` / `MacroSourceDisclosure.tsx`). |
| **L-2 — satisfaction by its own markup** | The D91 §1 notice is **satisfied by its own markup** — i.e. a distinct notice element exists on the rendered surface. |

**What this record is not:** not an implementation authority; not a `D91 Relief Determination`; not a request for relief filed on the PA's behalf; not a compliance finding against `main`; not an acceptance of the Macro surface; not a re-reading of D91, D89, D88, D8 or `NP-11`; not a re-scoring of `CV-53`. Each of those is a separate instrument, named in §6 below where it applies.

---

## 2. Verified present state at `main` `805a10af` (read-only, this task)

Every row below was **read from the authoritative ref this task**; none is carried over from a prior report.

| # | Check | Result |
|---|---|---|
| C1 | Authoritative tip | `git ls-remote origin refs/heads/main` = `805a10af4180691abcb76a0dac96a3c6541a39aa`; local `main` and `origin/main` equal; **no open PRs** in the repository |
| C2 | Working tree / tracker identity | Tracker on `main` = blob `d1f01745d2e3c4d81fa4aa882a2cd95e18eab030` (641,057 B), byte-identical to the working copy |
| C3 | **D91 §1 markup presence** | `git grep -n 'macro-data-mode-exemption-disclosure' main -- frontend/` → **no match (exit 1)**. The notice markup exists **nowhere** under `frontend/` on `main` |
| C4 | Rendered surface exists | `frontend/src/features/research/MacroResearch.tsx` — blob **`3ea3033429747865b1d7e653ba5a27992fba5197`**, 9,230 B; routed at `/research/macro` (`App.tsx:44`, `routes.ts:23` `researchMacro`); `AppShell.tsx:7` carries a Macro-route-scoped class |
| C5 | What the surface renders | Header text ("Governed MoSPI / e-Sankhyiki observations returned by the IIPS Macro read path (NAS, CPI, IIP only) … presents no IIPS-generated interpretation, trend, score or recommendation") + three dataset panels, each wrapped in the D89 disclosure. **No data-mode / SNAPSHOT / PIT notice of any kind is rendered** |
| C6 | D89 disclosure present | `frontend/src/features/research/MacroSourceDisclosure.tsx` — blob **`84d2e78cefd5b1c7ca542b3a1989ef7fd58b2b49`**, 2,214 B; renders the `DT-1` provider line, the `DT-2` per-dataset label, an optional `DT-9` sentence (off by default) and a `children`/`analysis` slot |
| C7 | **No client-side data-mode control** | `git grep -ni 'datamode\|data-mode' main -- frontend/src/` → **zero matches**. There is no UI affordance by which a user can select `SNAPSHOT` or `PIT` |
| C8 | The UI12 preference is a **closed, excluded** set | `frontend/server/settings/settings-service.ts` — blob **`3fcc4c267bc916c1d9472827fb448cee0e978610`**, 14,957 B: `AUTHORIZED_PREFERENCE_KEYS = Object.freeze(['theme'])`; its header states "Data mode, freshness, PIT addressing … are **EXPLICITLY EXCLUDED and are structurally absent** — an unknown key is REJECTED, never stored" |
| C9 | The exclusion is enforced and tested | `settings-service.test.ts:198` "rejects the EXCLUDED data-mode / PIT / freshness preferences" — `defaultDataMode`, `pitMode`, `freshness` each throw `unsupported-setting:<key>` |
| C10 | No settings input can reach the Macro path | `frontend/server/executive-transport.ts:752` calls `macro.handleMacroRequest(req, res)` — the handler's `deps` parameter is **not** supplied |
| C11 | The exempting constraint is carried in-file | `MacroContext.tsx` (blob **`2066eae2cd3a0738b1b427b5a0ee725496133a58`**, 5,944 B) returns `children` only and carries "LIVE-ONLY / FAIL-CLOSED" in its header comment; it renders no UI and no notice |

**Reading of C3+C5:** the rendered Macro surface exists and carries **only** the D89 disclosure. **Reading of C7+C9+C10:** the `SNAPSHOT`/`PIT` selection that D91 §1's notice is written to explain **does not exist in the IRR application, by governed contract** (see §5).

---

## 3. The obligation as IRR's own acts carry it, and the trigger that has fired

| # | Established | Source |
|---|---|---|
| O1 | D91 was established as a **constraint + disclosure act**: macro data on `/api/macro` is governed **LIVE-only**, is **EXEMPT** from the account-wide UI12 "Default data mode" preference, is subject to a **fallback prohibition**, and carries a **UI disclosure obligation on `MacroContext.tsx`** — the "D91 §1" notice, telling a user who selects `SNAPSHOT`/`PIT` that Macro does not switch modes | D91 competence act §5 items 3–4; mechanism act §7.1(4); packet §2 |
| O2 | **`D91 RELIEF — NOT GRANTED`**; "**No D91 relief is in force**"; and "D91 remains fully operative: the LIVE-only constraint, the exemption from the UI12 preference, the fallback prohibition, and **the disclosure obligation all stand unchanged**" | Mechanism act §18; competence act §11 |
| O3 | The obligation is **conditional on a rendered Macro view** — where no Macro view exists there is nothing on which the notice can appear, so no violation is observable and no compliance is demonstrable either | Packet §6.4(ii); tracker §16.21.2 |
| O4 | **`R-1`** (a recorded reconsideration trigger of the Option E act): "A future authorised decision to implement a **rendered Macro view** (the D89 gate opens) … `DT-1`/`DT-2` and the D91 §1 notice attach to a view; at that moment disclosure ceases to be latent and **becomes mandatory** …" — and the standing note: "**the deferral self-terminates on `R-1`**" | Option E act §5 |
| O5 | **`R-1` has fired.** (a) The D89 gate opened — `CV-53-D89-MACRO-UI-DISCLOSURE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01`, merged via PR #100. (b) A rendered Macro view was implemented and mounted — PR #102 (component) and PR #103 (mounted view, route, nav) at `main` `fd4ce609…`; `CV-53` is `COMPLETE/ACCEPTED — D89 display contract only` (§16.27, PR #104) | §16.27–§16.28; C4–C6 above |

**Consequence, stated exactly and no further than the records reach:** the premise that made the obligation *latent* (no rendered view) is **gone**, and the Option E act's own recorded consequence is that the notice has **become mandatory** at a rendered view — yet at `main` `805a10af` the notice is **absent** (C3, C5), and the D89 track did **not and could not** address it: `D89 §19` bounds its gate to "**DT-1–DT-8 and DT-13/DT-15 only**", and the CV-53 act §2 grants exactly that set while §3 excludes "any **D91/D88 relief**, exemption, or synthetic fallback" and §5 limits the gate to surfaces "that render the **D89** disclosure".

---

## 4. The `V-C5` limbs, adjudicated as far as verification reaches

| Limb | State | Basis |
|---|---|---|
| **L-1 — separation** | **PASS** | The corpus keeps the two disclosures distinct and no act or record claims `L-C` satisfies D91 §1: `CV-53-D89-MACRO-PRODUCT-ACCEPTANCE-01` records *"Prior V-C5 — separate D91 §1 notice · **BLOCKED / outside this D89-only disposition** · No D91 notice or D91/D88 relief is added or inferred"* and, in its limits, *"Separate and not evaluated/accepted: V-C5's D91 §1 notice"*; tracker §16.27.5 ("a separate, not-accepted obligation"), §16.31.7 and §16.31.10 item 2 record it as unmoved. `D89 DT-1` and `D91 §1` are treated as **two different obligations** throughout |
| **L-2 — satisfaction by its own markup** | **NOT SATISFIED** | C3 + C5: no markup exists on the rendered surface or anywhere under `frontend/` on `main` |

`V-C5` is therefore **not closed**: its positive limb is unmet. But **unmet is not the same as owed**, and whether the notice is **owed on IRR at all** is precisely what no instrument decides — see §5 and §6. This record does **not** assert a violation: it records a **gap in authority**, not a finding of non-compliance.

---

## 5. The counter-fact on the IRR side (recorded, not adjudicated)

`V-C5`'s notice is, by D91 §1's own subject matter, a notice about a **UI12 `LIVE`/`SNAPSHOT`/`PIT` data-mode selection**. IRR has decided, by Program Authority act, that that selection is **not a thing IRR may offer**:

| # | Record | Operative text |
|---|---|---|
| N1 | `docs/integration/IIPS_v3.0_NP11_SETTINGS_PRODUCT_CONTRACT_AND_PERSISTENCE_OWNER_DESIGNATION.md` §6 — decision **`NP-11-D4`** (decision identifier `NP-11-AUTH-01`, dated `2026-10-01`, authority: Program Authority) | "**Decision: the historical donor's `LIVE / SNAPSHOT / PIT` user-selectable default data-mode preference is EXCLUDED FROM NP-11.** It is **not authorized** as a Settings preference." Consequence: "NP-11 must **not** provide a Settings control that changes: `LIVE/SNAPSHOT/PIT` selection; PIT addressing; data provenance; server-authoritative freshness; historical / as-of semantics." And: "Any future proposal to make data mode user-configurable requires a **separate explicit governance decision** and must not be smuggled into NP-11." Decision Summary Matrix: "Data-mode / PIT preference · D4 · **EXCLUDED**" |
| N2 | `NP-11-D4`'s own stated reason includes that the preference "depends on a **Macro surface that does not exist in IRR** (0 nav entries)" | That premise is **dated**: a Macro surface now exists (C4). The other stated grounds — data mode/freshness/PIT/provenance are "**governed / server-authoritative** behavior", and the preference is "already **authority-blocked** (IPD inventory: *Authority-blocked: D91/D88 (macro, macro data-mode preference)*)" — are unaffected. **This record does not re-adjudicate `NP-11-D4`**; it records the premise drift as a fact the decision-maker may wish to weigh |
| N3 | Code enforcement at `main` | C8/C9/C10: `theme` is the **only** authorized preference key; `defaultDataMode`, `pitMode`, `freshness` are rejected by validation and covered by rejecting tests; the macro mount passes no `deps`, so no settings input can reach the Macro response path |

**The tension, stated without resolving it:** IRR's own D91 acts say the disclosure obligation "**stands unchanged**" and, since `R-1` fired, record it as having "**become mandatory**" at a rendered view — while IRR's own governed UI12 product contract **excludes the control the notice is about** and states that offering it requires "a separate explicit governance decision". Rendering a notice that tells the user what happens "when you select `SNAPSHOT` or `PIT`" on a surface where no such selection exists and none may be offered would describe an affordance IRR's own contract prohibits. **Which of these governs the IRR state is a Program Authority determination — and the instrument that owns exactly this question already exists and is named in §6, Option 2.**

---

## 6. The exact decision required

> ## **DECISION REQUESTED — whether the D91 §1 notice is owed on the IRR rendered Macro surface, and by which instrument that state is determined.**

**Why this is not resolvable within existing authorization — four independent grounds, each read from `main` this task:**

| # | Ground | Effect |
|---|---|---|
| A1 | `D89 §19`: "That gate may propose implementation of **`DT-1–DT-8` and `DT-13/DT-15` only** after explicit authority …" | The D89 UI-disclosure implementation gate **cannot** reach D91 §1 |
| A2 | CV-53 implementation-authority act: §2 grants only `DT-1–DT-8`/`DT-13`/`DT-15`; §3 excludes "**No D91/D88 relief**, exemption, or synthetic fallback"; §5 limits the gate to "UI presentation surfaces … that render the **D89** disclosure" | The only exercised implementation gate **does not authorize** the notice |
| A3 | D91 relief **mechanism** act: §7.1(4) places "whether the UI disclosure obligation carried by `MacroContext.tsx` (D91 §1) is **modified, preserved, or withdrawn**" *within* the mechanism — but §18 requires `D91 RELIEF — NOT GRANTED`, §19 states "**Implementation: NO** implementation authority is created by this act", §8.3 bars self-initiation ("D88's competence is a power to **determine requests**, not a power to originate them"), and §10 bars any determination before its ten evidence items exist. Competence act §13.1 is likewise "**NO** implementation authority … No application source code, Macro implementation, data-mode implementation, route, component, test, or configuration is authorized to change" | Determines the *fate* of the obligation; **grants no implementation power** and cannot be started by the agent or by D88 |
| A4 | Option E act §8.3: "**The only authorized implementation path thereafter** is the `D89` UI-disclosure implementation gate (§4.6 row 1) …" | The Option E act names no other implementation path — and A1/A2 close the one it names for this obligation |

**Bounded options for the Program Authority** (recorded as options; **none selected, recommended, pre-empted or preferred here**):

| # | Option | What it would require | Effect on `V-C5` | What it would not do |
|---|---|---|---|---|
| **1** | **Implement** — issue a separate, explicit **bounded D91 §1 implementation-authority act**, then implement under it | PA names: (i) the surface (`/research/macro`); (ii) the **exact notice wording** — which only the PA can fix, because IRR has no data-mode control (§5) and the IPD-side `L-E` wording is not available as authority (Option E §4.2–4.5: no operative effect on IRR) and would describe a prohibited affordance; (iii) placement/scope by analogy with `DT-4`; (iv) that the notice is **separate** from the D89 disclosure, per `V-C5`'s own terms; (v) that the two fenced client one-liners are or are not in scope (`DT-15`-barred surface). Then a bounded implementation + validation change, and any acceptance under its own gate | **L-2 satisfied**; `V-C5` positively closed | Not relief, not `DT-11`/`DT-13` determination, not `CV-53` scope change, not qualification/admission/production |
| **2** | **Determine the obligation's IRR fate** — a **`D91 Relief Determination`** on a **§9-conforming request** with **§10**'s ten evidence items present | PA **originates** the request (mechanism §8.1/§8.3 — D88 cannot, the agent cannot); supplies §9 contents and §10 items, including the `WP-MACRO-03` compatibility assessment and the no-`SNAPSHOT`-fallback confirmation; records the determination as **`preserved` / `modified` / `withdrawn`** for the IRR state | `V-C5` resolved **without implementation**, by determining that the notice is not owed on IRR (because the UI12 data-mode control is excluded by `NP-11-D4` and structurally absent) — or, if **preserved**, Option 1 becomes the consequent step | Does not relieve any other D91 requirement — LIVE-only, the fallback prohibition, the NAS/CPI/IIP boundary, provenance, server-side transport (`WP-MACRO-03` §16.1) all stand; creates no implementation authority |
| **3** | **Fresh dated deferral** — record the notice as deferred with an owner, reason and re-open trigger | PA states why `R-1`'s recorded consequence is not acted on, given `R-1`'s own note that "the deferral self-terminates on `R-1`" | `V-C5` stays open, but with a **dated, owned** state instead of an unowned gap | Does not satisfy the notice; does not create a compliance state |
| **4** | **Leave as recorded** | nothing | `V-C5` remains a recorded, separate, unresolved condition | This is the default if no decision is issued; the purpose of this record is to prevent the gap being **silently** read as either satisfied or non-existent |

**Smallest sufficient action:** **one explicit Program Authority decision naming the instrument and the substance** — Option 1 (with the notice's wording fixed) or Option 2 (with the request's `§9` contents and `§10` items). If Option 2 is chosen and the determination is `preserved`, Option 1 follows as a separate act. **No other actor can originate it:** not the agent (`§11.8`'s express delegation ceiling — governance-record preparation, branch publication for review, read-only verification); not D88 (mechanism §8.3); not a green CI, a merged acceptance, or the IPD-side D91 delivery (Option E §4.5 — no operative effect on IRR).

**Boundary — one adjacent item deliberately not folded in.** The "untested invariant" hardening item recorded by the packet §6.4(iii) / Option E §4.7 — a **server-side test that the Macro route's response is invariant to the settings service** — is **not** `V-C5`, needs "no UI authority" by the corpus's own words, and is **not** performed, requested or dispositioned here. It is named only so it is not mistaken for a `V-C5` resolution.

---

## 7. What this record does not do, and what does not move

| # | Not done / not moved |
|---|---|
| P-1 | **No decision is rendered.** Options 1–4 are stated as available dispositions; none is selected, endorsed or pre-empted |
| P-2 | **No implementation and no code change.** Nothing under `frontend/` was read-write opened; `MacroContext.tsx`, `MacroSourceDisclosure.tsx`, `MacroResearch.tsx`, the API client, transports, source adapters, settings service, `App.tsx`/`AppShell.tsx`/`routes.ts` and all tests are byte-unchanged |
| P-3 | **No governed act edited.** D89, D91 (competence + mechanism), D88, D8, M-5, `NP-11-AUTH-01`, the CV-53 authority act and the Option E act are unchanged, including their non-retroactive character |
| P-4 | **No relief, no exemption, no waiver, no `D91/D88_MACRO_RELIEF`.** `D91 RELIEF — NOT GRANTED` stands; the third required act is **not** created, pre-authorised or deemed |
| P-5 | **No `NP-11-D4` re-adjudication.** Its premise drift is recorded (§5 N2) and left to its own owner |
| P-6 | **No register, count or group movement.** Register total `35`, complete/accepted `12`, blocked-active `2`, active outstanding `16`, §19 categories `13` — unchanged; `V-C5` has no register row and none is added |
| P-7 | **`CV-53` untouched.** It remains `COMPLETE/ACCEPTED — D89 display contract only`; this record neither expands nor re-scores it |
| P-8 | **Unmoved:** `XV-15` `OPEN`; the general `XV-16` rule `UNRESOLVED`; the API-client/configuration residuals fenced (§16.27); the `996`-of-`25,884` `index` observation recorded, not actioned (§16.29.7); live-source E2E `A — ESTABLISHED` (§16.31) as recorded; entitlement `B — PARTIALLY ESTABLISHED`; attribution `NOT DETERMINED`; GODL `NOT ESTABLISHED`; `M-3` `NOT ESTABLISHED`; production `NOT AUTHORIZED`; no qualification or admission claim |
| P-9 | **IPD untouched** — read-only reference only; no IPD file read-write opened, no IPD ref moved |
| P-10 | **No compliance finding.** The absence of the markup is recorded as a **fact** and as an **authority gap**; it is not recorded as a breach, and it is not cured or silenced |

---

## 8. Verification performed (this task, read-only)

| # | Check | Result |
|---|---|---|
| V56 | Repository, ref and tracker re-establishment at task start | **PASS** — `git ls-remote origin refs/heads/main` = `805a10af4180691abcb76a0dac96a3c6541a39aa` = fetched `origin/main` = local `main`; **no open PRs**; tracker blob `d1f01745d2e3c4d81fa4aa882a2cd95e18eab030` identical between `main` and the working copy. **Stated limitation:** this recovery clone carries a single squashed commit, so this task's equality claims are **ref-level and blob-level**, not ancestry-level; no claim here depends on commit ancestry, and each cited blob was read from the `main` ref directly |
| V57 | Absence sweep for the D91 §1 markup and for any client-side data-mode control at `main` | **PASS** — `macro-data-mode-exemption-disclosure` → no match under `frontend/` (exit 1); `datamode`/`data-mode` → zero matches under `frontend/src/`; the only repository occurrences are `settings-service.ts`'s exclusion comment and its rejecting test title |
| V58 | Authority-boundary read-back at `main` (each clause quoted from the file, not from a report) | **PASS** — `D89 §19` blob `9652f890…`; CV-53 authority act blob `3befae72…` §§2/3/5; D91 mechanism blob `f61325ee…` §§7.1(4)/8.3/10/18/19; D91 competence §§11/13.1; Option E act blob `65cab80e…` §§4.2–4.7/5/6.3/8.3; packet §6.4; `NP-11` §6 `NP-11-D4`; `settings-service.ts` blob `3fcc4c26…`; `executive-transport.ts` blob `af891048…` line 752 |

---

## 9. Publication

This record is published from the session branch **`arena/2148b8cf-iips-review-recovered`** through a pull request into `main`; the tracker carries an additive `CV-CORR-20` / §16.32 entry and one `§5` change-log row. Per the corpus's self-reference rule, this record's own merge coordinates are **not** recorded inside it; they belong to the tracker and to post-merge remote verification. **Merging is the Program Authority's act** (`H-18 §8.3(b)`; `G2-2 §P5`); publication on a branch is not admission to `main`, and nothing here is effective until it is durably published and independently verified there.

---

*End of decision record. `V-C5` is recorded as `DECISION REQUIRED — NOT DECIDED`. The separation limb passes; the satisfaction limb is unmet; no instrument exists that determines whether the notice is owed on IRR — and that determination is the Program Authority's alone.*
