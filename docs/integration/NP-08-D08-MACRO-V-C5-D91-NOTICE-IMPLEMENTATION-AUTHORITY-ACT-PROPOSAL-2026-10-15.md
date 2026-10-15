# NP-08 / D08 MACRO — V-C5 · D91 §1 NOTICE · BOUNDED IMPLEMENTATION-AUTHORITY ACT — **PROPOSAL**

> **0. ⚠ THIS IS A PROPOSAL. IT IS NOT AN ACT, NOT A DECISION, AND NOT AUTHORITY.**
>
> No Program Authority decision has been made. **Nothing in this document has any operative effect, and nothing in it authorizes any work.** It exists so that the Program Authority can review the instrument and issue — or decline, or amend — the decision at §9. It is **not committed and not published**: it is a draft returned for review, and it must not be cited as an act, an authority, a relief, an acceptance or a compliance state.
>
> **1. Artifact ID (proposed):** `NP-08-D08-MACRO-V-C5-D91-NOTICE-IMPLEMENTATION-AUTHORITY-ACT-PROPOSAL-01`
> **2. Title:** D91 §1 Macro data-mode notice — bounded implementation-authority decision act (**proposal, for the Program Authority's review**)
> **3. Status:** **`PROPOSED — NOT DECIDED; NOT AUTHORITATIVE; NO EFFECT`**. This proposal becomes an act only if the Program Authority issues the decision at §9, whereupon the resulting record is published by pull request, merged by the Program Authority, and independently verified on IRR `main`.
> **4. Authority / issuer:** **Ramki / Program Authority** is the sole deciding authority. `arena-agent` prepared this draft at the Program Authority's instruction and **exercises no Program Authority**: the scope, the notice wording, the placement and every criterion below are **proposals for the PA's adoption, amendment or rejection**.
> **5. Date of drafting:** `2026-10-15` (Asia/Kolkata)
> **6. Record type (if adopted):** `IMPLEMENTATION-AUTHORITY DECISION ACT — governance only; non-executable by itself; grants only what §1 states`
> **7. Workstream:** NP-08 — Intelligence · D08 MACRO · D91 §1 (UI12 data-mode exemption notice) · condition `V-C5`
> **8. Basis (reused, not re-investigated):** tracker §16.32 (`CV-CORR-20`) and `NP-08-D08-MACRO-V-C5-D91-NOTICE-DECISION-RECORD-01`; the operative texts those records quote are unchanged and are cited here, not re-derived.
> **9. Evidence baseline:** IRR `main` = `805a10af4180691abcb76a0dac96a3c6541a39aa` (re-confirmed unchanged at drafting time).
> **10. Supersession (if adopted):** **none.** It would amend no governed act; see §4.3.

> **Additive status note (`2026-10-15`, recorded after this proposal was returned for review — nothing above is rewritten).** The Program Authority **approved** this proposal as the basis for `NP-08-D08-MACRO-V-C5-D91-NOTICE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01` and issued its **own** fixed decisions. Two consequences a reader must not miss: the **approved notice string is not any of `N-A` / `N-B` / `N-C`** below (the Program Authority fixed its own wording), and **§9's suggested decision text was not used** (the Program Authority issued its own). The placement choice is **P-1** as fixed. This proposal is published together with that act so the approval's reference is resolvable from `main`. **Nothing in this document is authority, and none of it is operative** — see §11.

---

## 1. Scope — what this act would authorize, and nothing more

**Authorized, if approved: the IRR D91 §1 notice obligation only.**

| # | Clause |
|---|---|
| **S-1** | Implementation of a **single, always-visible, ordinary-text notice** on the IRR Macro rendered surface (`/research/macro`) stating IRR's actual data-read behaviour with respect to data modes, in the exact wording the Program Authority fixes under §3. |
| **S-2** | The tests and validation evidence that verify that notice, per §5. |
| **S-3** | Nothing else. The authority is bounded to the notice element, its placement, its wording, its tests and the bounded validation in §5 — and it is **presentation-only**: no behaviour, transport, data, configuration or governance change is authorized. |

**This act would be a *constitutive authority act*, not a construction of any existing act** — the same instrument class as the D88 establishment act, the D91 competence act, the D91 relief-mechanism act, and the CV-53 D89 implementation-authority act (see §4.3).

---

## 2. Reused findings (pointers only — no new investigation)

| # | Finding | Recorded at |
|---|---|---|
| B-1 | The D91 §1 markup (`macro-data-mode-exemption-disclosure`) is **absent** from IRR `main`; the rendered Macro surface exists and carries only the D89 disclosure | §16.32.2 C3–C6 |
| B-2 | IRR has **no client-side data-mode control**; the UI12 preference set is closed to `theme` and `defaultDataMode` / `pitMode` / `freshness` are rejected by validation and by test | §16.32.2 C7–C10 |
| B-3 | `V-C5`'s **separation** limb PASSES; its **satisfaction-by-its-own-markup** limb is **NOT SATISFIED**; no instrument decides whether the notice is owed on IRR | §16.32.5; decision record §4 |
| B-4 | The IPD-side `L-E` wording has **no operative effect on IRR** and describes a preference IRR's own contract excludes | Decision record §5; Option E act §4.5 |
| B-5 | Option E trigger `R-1` has fired; the act records the notice arriving **absent** while `D89 §19` and the CV-53 act bound the D89 gate to `DT-1–DT-8`/`DT-13`/`DT-15` | §16.32.3 |
| B-6 | `NP-11-AUTH-01` §6 (`NP-11-D4`) **excludes** the `LIVE/SNAPSHOT/PIT` preference from IRR and requires a separate explicit governance decision to make data mode user-configurable — **this act does not provide one and must not be read as doing so** | §16.32.4 |

---

## 3. The proposed notice

### 3.1 What a truthful IRR notice must say

D91 §1's notice tells a user that the Macro surface does not follow their `SNAPSHOT`/`PIT` preference. **On IRR that preference has no subject matter** (B-2): there is no selection to explain, and none may be offered (`NP-11-D4`). The truthful IRR-equivalent content is therefore a statement of IRR's *actual* read behaviour at the point of observation:

1. this surface **always reads live** from the governed MoSPI / e-Sankhyiki source;
2. **no setting switches it** to another data mode, because no such setting exists in the application; and
3. a failed or partial read is **shown as a refusal**, never replaced with cached, older or generated values.

Points 1 and 3 are IRR's admitted behaviour (`WP-MACRO-03` / D91 LIVE-only; the fail-closed contract carried in `MacroContext.tsx` and `MacroResearch.tsx`). Point 2 is `NP-11-D4` read as the user-facing fact it is. **None of the three asserts a capability the application lacks.**

### 3.2 Candidate wordings — **the Program Authority fixes the exact string**

| ID | Candidate string | Note |
|---|---|---|
| **N-A** *(agent's recommendation)* | "This surface always reads live from the governed MoSPI / e-Sankhyiki source. No setting switches it to another data mode, and a failed or partial read is shown as a refusal rather than replaced with cached, older or generated values." | **Terminology-free.** Names no `LIVE`/`SNAPSHOT`/`PIT` mode, so no reader can infer that such a control exists anywhere in IIPS. Carries the substance of the exemption as a positive statement of behaviour. |
| **N-B** | "This surface always reads live from the governed MoSPI / e-Sankhyiki source. IIPS provides no user-selectable live, snapshot or point-in-time (PIT) data mode, and no such setting affects this view; a failed or partial read is shown as a refusal rather than replaced with cached, older or generated values." | **Explicit denial.** States the absence rather than omitting the terms. Closer, on its face, to the D91 §1 analogue — but it necessarily *names* the modes in order to deny them, so it is the weaker fit for the requirement that the notice not imply such a control exists. |
| **N-C** | "Always live: these observations are read live from the governed MoSPI / e-Sankhyiki source, and no data-mode setting applies to them." | **Minimal.** Shortest; states points 1–2 and omits the failure behaviour. |

**Constraints the wording must satisfy whichever candidate is chosen** (stated so the choice is made on the record, not later):

- **C-1** It must **not** present `LIVE`, `SNAPSHOT` or `PIT` as user-selectable, and must not describe a selection the application cannot make.
- **C-2** It must **not** be conditional on state: it renders identically before, during, after and **in the refusal state** — the refusal state is precisely when a reader might otherwise expect a fallback.
- **C-3** It must assert **no** period, freshness, "as of", retrieval timestamp, licence status or version claim (`DT-8`, `DT-14`).
- **C-4** It must carry **no** licence, permission, redistribution or rights language (`DT-12`), **no** endorsement or partnership implication (`DT-7`), and must not be styled as a legal notice: this is a **product/behavioural** statement, not a legal attribution or disclaimer (`DT-11`/`DT-13` remain `NOT DETERMINED` / `NOT ESTABLISHED` and are untouched).
- **C-5** It must not be presented as, or replace, IIPS interpretation (`DT-6`).
- **C-6** Its markup must carry a **new, distinct** test id (`macro-data-mode-notice` proposed) and an accessible label (`aria-label="Macro data-mode notice"` proposed). **It must not reuse the IPD-side id `macro-data-mode-exemption-disclosure`**, so that a future reader cannot mistake this IRR implementation for the IPD-side delivery (the `XV-16` confusion).

### 3.3 Proposed placement

| # | Proposal | Rationale |
|---|---|---|
| **P-1** *(agent's recommendation)* | **One** notice for the whole Macro surface, rendered **inside the Macro surface's main region immediately adjacent to the dataset panels**, as ordinary visible text — not in a footer, tooltip, hover, expandable, modal or off-screen element. | The exemption is a property of the **surface's** read path, not of one dataset; one truthful statement avoids three copies of the same sentence. The "immediately adjacent" requirement keeps it attached to the data rather than buried. |
| **P-2** *(alternative, for the PA's choice)* | The same string repeated **inside each dataset panel**, mirroring the D89 `DT-4` placement convention. | Consistency with the D89 disclosure's established placement, at the cost of redundancy. |

### 3.4 File-placement point the Program Authority may wish to rule on expressly

`D91 §1` is described in the governing acts as an obligation "carried by `MacroContext.tsx`". On IRR, `MacroContext.tsx` **renders only `children`** and is a provider, not a view — a notice placed in it would be invisible. The proposal therefore renders the notice from the consuming view (`MacroResearch.tsx`, or a small dedicated component it mounts), and keeps `MacroContext.tsx` behaviour **unchanged**. This is stated as an open point rather than silently resolved: **if the Program Authority intends the marker to live literally in `MacroContext.tsx`, it should say so at §9** (a comment-only citation there would also be possible without changing behaviour).

---

## 4. Authority basis, and the `D89 §19` question

### 4.1 What `D89 §19` actually bounds

`D89 §19` reads: *"That gate may propose implementation of `DT-1–DT-8` and `DT-13/DT-15` **only** after explicit authority; it must preserve the distinction between product source disclosure and legal attribution, and must not introduce licensing claims."* Read in its own section ("Classification and next gate"), the sentence bounds **what the separate D89 UI-disclosure implementation gate may propose** — a bound on *that gate's* remit, not a statement about the Program Authority's power to constitute a different authority.

### 4.2 The unavoidable tension — stated, not smoothed

There is **one** genuine tension, and it is interpretive rather than operative:

| # | Tension |
|---|---|
| **T-1** | The word "**only**" in `D89 §19`, read broadly, could be taken to mean that `DT-1–DT-8` / `DT-13` / `DT-15` **exhaust** the Macro UI-disclosure implementation space — in which case any separate D91 §1 UI implementation would need D89 to be reopened or overridden. |
| **T-2** | The CV-53 implementation-authority act §5 limits its gate to surfaces "that render the **D89** disclosure", and `DT-15` forbids treating the D89 act as authority to change UI code, components, styles, `MacroContext`, API clients, transport or tests. Under those instruments the notice is **not** implementable today — which is exactly the §16.32.5 finding. |

### 4.3 How the proposed act establishes authority **without silently overriding anything**

| # | Principle |
|---|---|
| **R-1** | **It is a new constitutive act, not a construction of D89.** It derives its force from the Program Authority constituting a new, named authority — the same mechanism by which `D88` (`2dc5563`), D91 relief competence (`b607ea9`), the D91 relief mechanism (`3c626157`) and the CV-53 D89 gate (PR #100) were each created. |
| **R-2** | **It does not read `D89 §19` down, and it does not rely on D89 for anything.** It claims no authority from the D89 act or the CV-53 act, so neither `DT-15` nor the CV-53 act §5 is stretched, and neither is breached. |
| **R-3** | **It amends nothing.** On adoption it must state expressly that `D89` (including `§19` and `DT-1…DT-15`), the D91 competence and mechanism acts, `D88`, `D8`, `M-5`, `NP-11-AUTH-01`, the CV-53 authority act and the Option E act remain **byte-identical and unmodified, including their non-retroactive character**, and that it supersedes none of them. |
| **R-4** | **It expressly does not touch `NP-11-D4`.** It creates no data-mode preference, no settings key and no Settings control; `NP-11-D4`'s requirement that making data mode user-configurable needs its own separate explicit governance decision stands untouched and is **not** satisfied, waived or pre-empted here. |
| **R-5** | **It expressly does not constitute D91 relief**, does not create, pre-authorise or deem the third required act (the *D91 Relief Determination*), and leaves **every** other D91 requirement in force — LIVE-only, the fallback prohibition, the `NAS`/`CPI`/`IIP` boundary, provenance and server-side transport (`WP-MACRO-03` §16.1). |
| **R-6** | **The one residual ambiguity is named rather than hidden.** `T-1` is an interpretive question about a *different* act. This proposal does **not** answer it. If the Program Authority wishes it settled on the record, **the PA's own wording** may be added to the act — the agent cannot supply it. If the PA does not add it, the act still stands, and the ambiguity remains visibly on the record as `T-1`. |

---

## 5. Implementation and validation criteria (would apply only if the authority act is approved)

### 5.1 Implementation criteria

| # | Criterion |
|---|---|
| I-1 | Render the notice, verbatim in the Program Authority's fixed string, on `/research/macro` at the placement the PA selects (§3.3 P-1 or P-2). |
| I-2 | Render it as **ordinary visible text** in the normal document flow, with the distinct test id and accessible label and **no** state-conditionality (constraint C-2). |
| I-3 | Change **only** presentation code: the Macro view (and, if the PA chooses P-2 or a separate component, that component and its mount). **No** change to `MacroContext.tsx` behaviour, `frontend/src/api/macro.ts`, `frontend/server/macro/**`, `frontend/server/executive-transport.ts`, `frontend/server/settings/**`, `App.tsx`/`routes.ts` route semantics, or any dependency manifest. |
| I-4 | Add **no** state, storage, preference key, setting, toggle, selector or data-mode control of any kind. |
| I-5 | Leave the **two fenced client one-liners** (`getJson` transport-`code` passthrough; mount `deps` injection) **untouched** — they remain queued for a single decision per §16.17.4 / §16.19.6 and are outside this act. |
| I-6 | Cite this act and D91 §1 in the notice component's header comment, so the element's authority is traceable from the code. |

### 5.2 Validation criteria

| # | Criterion |
|---|---|
| V-1 | A test asserts the notice renders the **exact** PA-fixed string (equality, not a loose match). |
| V-2 | A test asserts the notice is present in the **refusal / error** state as well as the loaded state (constraint C-2). |
| V-3 | A **negative** test asserts the surface renders **no** data-mode control (no selector, toggle or radio that changes data mode) and no text presenting `LIVE`/`SNAPSHOT`/`PIT` as user-selectable. |
| V-4 | The existing endpoint assertion (exactly `/api/macro/nas`, `/api/macro/cpi`, `/api/macro/iip`) still holds. |
| V-5 | Existing suites remain green — `App.test.tsx` (nav-honesty), `MacroResearch.test.tsx`, `MacroSourceDisclosure.test.tsx`, `MacroContext.test.tsx`, `macro-transport.test.ts`, `mospi-source.test.ts` — with **no** test weakened, skipped or rewritten to fit. |
| V-6 | `frontend/`: `npm run typecheck`, `npm run test:ci`, `node .ci/assert-tests.js .vitest-report.json`, `npm run build` all **PASS**; hosted CI green on the implementation PR head. |
| V-7 | Browser check at the four widths already used for the D89 acceptance (`1280×800`, `390×844`, `320×720`, `280×640`): the notice visible and fitting; no horizontal overflow. Reuse the established method; no new method is invented. |
| V-8 | **Byte-identity check:** every governed act, the three fences (`reports-transport.ts`, `user-portfolio-transport.ts`, `owner-context-unavailable.ts`), `MacroContext.tsx`, `src/api/macro.ts`, `frontend/server/macro/**`, `frontend/server/settings/**` and `executive-transport.ts` remain byte-identical to the pre-change `main`, with the blobs recorded. |
| V-9 | **Change-set review:** the diff contains presentation code, its tests, and the record only — nothing else; no file deleted or renamed. |
| V-10 | **Explicitly not a criterion and not claimed:** live-source E2E (already `A — ESTABLISHED`, §16.31, and the notice is presentation-only), provider/entitlement/legal/attribution status, and product acceptance. Acceptance of the result is a **separate, bounded step** recorded on its own evidence (the CV-53 pattern) and is **not** pre-supplied by this act. |

---

## 6. Exclusions — what this act would **not** authorize

| # | Not authorized |
|---|---|
| X-1 | **No `D91`/`D88` relief, exemption, waiver or variation.** Every D91 requirement stands: LIVE-only, the fallback prohibition, the `NAS`/`CPI`/`IIP` boundary, provenance, server-side governed transport. |
| X-2 | **No `D91 Relief Determination`.** The third required act is not created, pre-authorised or deemed; nothing here modifies, withdraws or preserves the obligation beyond rendering the notice. |
| X-3 | **No settings change and no data-mode preference.** `NP-11-D4` is untouched; no key is added to the closed preference set; `defaultDataMode` / `pitMode` / `freshness` stay rejected; no Settings control is added or implied. |
| X-4 | **No application-wide authorization.** The authority is bounded to the notice element and its validation on `/research/macro`. |
| X-5 | **No transport, API-client, source-adapter or server change** — including the two fenced client one-liners. |
| X-6 | **No other Macro work:** no new dataset, no dataset-boundary change, no provider change, no route or navigation change, no caching, no persistence, no refresh control, no charting, no analysis surface, no "certified" or "verified source" copy (`DT-7`/`DT-8`). |
| X-7 | **No legal work:** no legal attribution formula (`DT-11` stays `NOT DETERMINED`), no non-endorsement/disclaimer text (`DT-13` stays `NOT ESTABLISHED`; `DT-14` prescribes nothing), no GODL applicability finding, no `M-3` provenance finding, no licence or rights statement, no MoSPI contact. |
| X-8 | **No production, qualification, admission, activation or release authority.** |
| X-9 | **No change to any other workstream** — `CV-24`, `CV-38`, `CV-50`–`CV-52`, `XV-15`, the general `XV-16` rule, the API-client/configuration residuals, the `996`-record `index` observation, Reports, the portfolio line, or any §19 pending category. |
| X-10 | **No amendment to any governed act**, and no reliance on any act not named in this one. |
| X-11 | **No claim that implementation has occurred.** This act would authorize; it would not execute, verify or accept. |
| X-12 | **No IPD mutation.** IPD remains read-only and untouched. |

---

## 7. Effect if approved — and what would not move

| # | Effect |
|---|---|
| E-1 | The authority gap recorded at §16.32.5 closes: the notice would have a named, bounded authority whose scope is exactly this obligation. |
| E-2 | On **successful implementation and its recorded validation/acceptance**, `V-C5`'s satisfaction limb becomes satisfiable and `V-C5` can be closed — **as a separate, evidenced step, not by this act.** |
| E-3 | **Unmoved:** register total `35`; complete/accepted `12`; blocked-active `2`; active outstanding `16`; §19 categories `13`; `CV-53` (D89 display contract only); entitlement `B — PARTIALLY ESTABLISHED`; attribution `NOT DETERMINED`; GODL `NOT ESTABLISHED`; `M-3` `NOT ESTABLISHED`; production `NOT AUTHORIZED`; live-source E2E `A — ESTABLISHED` as recorded; `XV-15`; the general `XV-16` rule. |
| E-4 | **`NP-11-D4` remains unamended and un-waived.** The notice states that no data-mode setting exists; it does not create one and does not decide whether one ever should. |

---

## 8. If the Program Authority declines, amends, or chooses otherwise

| # | Path |
|---|---|
| **D-1** | **Decline** → `V-C5` stays `DECISION REQUIRED — NOT DECIDED`; the §16.32 record stands; Options 2 (D91 Relief Determination), 3 (fresh dated deferral) and 4 (leave as recorded) remain available and un-preempted. |
| **D-2** | **Amend** → the PA may change the wording, the placement, the file-placement ruling (§3.4), the criteria or the exclusions; any amendment is the PA's and is recorded as such. |
| **D-3** | **Choose Option 2 instead** → this proposal lapses without effect; a §9-conforming relief request with §10's ten evidence items, originated by the PA, becomes the path. |
| **D-4** | **Defer with a dated reason** → admissible, but must address `R-1`'s self-terminating note (`§16.32.3`) on the record. |

---

## 9. The exact decision text (for the Program Authority to issue, amend or refuse)

**Fill the two bracketed choices, delete what does not apply, and issue as-is or in your own words. Nothing is authorized until you issue it.**

> **PA DECISION — bounded D91 §1 Macro data-mode notice: implementation authority**
>
> I approve the bounded D91 §1 notice implementation-authority act as drafted in `NP-08-D08-MACRO-V-C5-D91-NOTICE-IMPLEMENTATION-AUTHORITY-ACT-PROPOSAL-01` §§1–§6.
>
> **Notice wording (fixed):** `[ N-A | N-B | N-C | other — insert the exact string ]`
>
> **Placement:** `[ P-1 — once per surface, adjacent to the dataset panels | P-2 — inside each dataset panel ]`
>
> **File-placement ruling:** `[ the notice is rendered by the consuming view; MacroContext.tsx behaviour unchanged | additionally cite D91 §1 in MacroContext.tsx by comment only | other ]`
>
> **Criteria:** the implementation and validation criteria at act §5 apply in full, and the exclusions at act §6 remain excluded.
>
> **Authorized by this decision:** recording and publishing this act as a governance record in IRR `docs/integration/` by pull request, with merge authorization for the named branch and head under `H-18 §8.3(b)`; and, on that record's durable publication, implementation of the notice and its tests as a separate bounded change submitted for review, with admission to `main` only by my own merge act.
>
> **Not authorized:** any D91/D88 relief, exemption or waiver; any D91 Relief Determination; any data-mode preference, Settings key or Settings control (`NP-11-D4` stands unchanged); any transport, API-client, source-adapter or server change, including the two fenced client one-liners; any other Macro work; any legal, licensing, attribution, GODL or `M-3` determination; any application-wide authorization; production, qualification, admission, activation or release; any other workstream; any amendment to any governed act; any IPD change.
>
> `[ optional — only if you wish to settle T-1: "For the avoidance of doubt, D89 §19's 'only' bounds the D89 UI-disclosure implementation gate and does not preclude this separate act." ]`

**On receipt of that decision** the agent would record the act (attributing the decision to the Program Authority and marking the formulation as the agent's execution), publish it by pull request, and only then proceed to the implementation step — with `V-C5` kept open until the notice is implemented, validated and its acceptance is separately recorded.

---

## 10. Status of this document

**Not committed, not pushed, not published.** PR #109 is unchanged, the tracker still records `V-C5` as `DECISION REQUIRED — NOT DECIDED`, and no code, governed act, tracker row or other workstream has been touched in the preparation of this proposal. It is returned to the Program Authority for review.

---

## 11. Basis note — additive, `2026-10-15`

This proposal was prepared at the Program Authority's instruction and **returned for review, unpublished**. It has since become the **reviewed basis** for a granted authority:

| # | Item | Value |
|---|---|---|
| 1 | Resulting act | `NP-08-D08-MACRO-V-C5-D91-NOTICE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01` — `docs/integration/NP-08-D08-MACRO-V-C5-D91-NOTICE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-2026-10-15.md` |
| 2 | What was adopted from this proposal | §1 scope; §2 reused findings; the §3.1 truthful-content analysis; §4's authority reasoning (**and the Program Authority settled `T-1` by issuing its own interpretation of `D89 §19`** — act §6 I-2); §5's criteria as the detailed implementation/validation set; §6's exclusions |
| 3 | What was **displaced** | §3.2's candidate wordings (the Program Authority fixed its own string); §3.3's placement choice (fixed to **P-1**); §3.4's open file-placement point (ruled: consuming view, `MacroContext.tsx` runtime unchanged); §9's suggested decision text (not used) |
| 4 | Authority status of this file | **None.** This is the reviewed basis, published for traceability. The authority, its boundaries and its effectiveness conditions are in the act, and nowhere here |
| 5 | Tracker | `CV-CORR-21`, §16.33 |

*End of basis note.*

---

*End of proposal. This document is a draft instrument. It is not an act, it grants nothing, and `V-C5` remains open.*
