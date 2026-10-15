# NP-08 / D08 MACRO — V-C5 · D91 §1 NOTICE · BOUNDED IMPLEMENTATION-AUTHORITY DECISION ACT

> **1. Artifact ID:** `NP-08-D08-MACRO-V-C5-D91-NOTICE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01`
> **2. Title:** D91 §1 Macro data-mode notice — bounded implementation authority, granted for the IRR notice obligation only
> **3. Authority / issuer:** **Ramki / Program Authority** (deciding authority). The decision was **supplied directly and verbatim** by the Program Authority on `2026-10-15`; §1 reproduces it as issued. `arena-agent` performed verification and record-execution **only** — the agent originated no decision, no wording, no placement and no boundary.
> **4. Date of recording:** `2026-10-15` (Asia/Kolkata)
> **5. Decision status:** **`DECIDED AND RECORDED; DURABLE PUBLICATION PENDING`** — effective only when durably published on IRR `main` and independently verified there (`H-18 §8.4`/`§8.5`; `G2-2 §P5`; `C-1`). Until then this act is **non-authoritative**, and **no implementation is authorized by it** (§9).
> **6. Record type:** `IMPLEMENTATION-AUTHORITY DECISION ACT` — constitutive; governance only; executable only within the narrow scope of §4, and only after §9's effectiveness conditions are met.
> **7. Basis:** the Program Authority's decision of `2026-10-15` on `NP-08-D08-MACRO-V-C5-D91-NOTICE-IMPLEMENTATION-AUTHORITY-ACT-PROPOSAL-01` (the proposal returned for review, published as part of this record set), which rests on tracker §16.32 (`CV-CORR-20`) and `NP-08-D08-MACRO-V-C5-D91-NOTICE-DECISION-RECORD-01`.
> **8. Repository / ref (durable destination):** `ramkivs/iips-review-recovered` @ `main`; evidence baseline at recording `main` = `805a10af4180691abcb76a0dac96a3c6541a39aa`.
> **9. Mutation:** one new governance artifact (this act), the proposal published as its basis, and additive tracker rows. **Zero** application-code change at this stage; **zero** governed-act modification; **zero** IPD mutation.
> **10. Supersession:** **none.** This act supersedes no act and amends no operative text; §6 records its relationship to `D89 §19` transparently and alters nothing.
> **11. Production:** **OUT OF SCOPE.** No production, qualification, admission, activation, certification or release authority is granted or implied.

---

## 1. The decision, as issued by the Program Authority (verbatim)

> **PA DECISION — Bounded D91 §1 Macro Notice Implementation Authority**
>
> I approve the bounded D91 §1 notice implementation-authority act, based on the proposal `NP-08-D08-MACRO-V-C5-D91-NOTICE-IMPLEMENTATION-AUTHORITY-ACT-PROPOSAL-01`, subject to the following fixed decisions and exclusions.
>
> **1. Fixed notice wording**
>
> "This page retrieves data live from MoSPI. No user setting switches this view to snapshot or point-in-time data. If live retrieval fails, the page reports the failure rather than substituting snapshot or synthetic data."
>
> Before implementation, verify that each statement is accurate against the current authoritative implementation. If any statement is inaccurate, stop and return the precise discrepancy rather than silently changing the approved wording.
>
> **2. Placement**
>
> P-1: Render one notice on the Macro research surface, adjacent to the dataset panels. Do not duplicate the notice in every dataset panel.
>
> **3. File placement**
>
> Render the notice through the consuming view. Leave `MacroContext.tsx` runtime behavior unchanged.
>
> **4. Scope and exclusions**
>
> Authority is limited to implementing and testing this D91 §1 notice.
>
> This decision does not authorize D91/D88 relief, a D91 Relief Determination, changes to Settings or data-mode controls, transport/API/client/source-adapter changes, amendments to governed acts, IPD changes, production qualification, or work on another Macro item or workstream.
>
> NP-11-D4 remains unchanged. The implementation must not imply that LIVE, SNAPSHOT, or PIT is user-selectable in IRR.
>
> **5. D89 §19 boundary**
>
> This is a separate, constitutive authority act for the bounded D91 §1 notice. It does not rely on or expand the D89 implementation authority, amend D89, or grant D91/D88 relief.
>
> For clarity, D89 §19's "only" limits the implementation authority granted by the D89 UI-disclosure gate; this separate act supplies only the bounded authority expressly stated here. Record the interpretation and its relationship to the existing governed acts transparently. Do not alter those acts.
>
> **6. Execution and validation**
>
> Record and publish this authority act through the established review process. Once its required durable publication is verified, implement the notice and focused tests in a separate bounded change.
>
> Validate the visible notice, its exact wording, the required placement, truthful live-only behavior, failure behavior, and the absence of user-selectable data-mode controls. Preserve governed-act and fence-file integrity.
>
> Submit the implementation for review. Do not merge it or claim acceptance, production qualification, or broader authorization without the required separate act.
>
> **7. V-C5 disposition**
>
> Keep V-C5 open until the authority act is durably published, the notice is implemented and validated, and the required acceptance and tracker reconciliation are completed.
>
> Proceed only within this scope. Do not begin V-C6 or any other workstream as part of this task.

**Provenance and authenticity.** The decision was delivered through this session's task channel — the channel by which every `NP-08` act in this corpus has been decided. **No signature, authenticated identity, timestamp, seal or third-party attestation is claimed, invented or implied**, and the agent claims no independent authority, delegation or decision of its own. §1 is a transcription, not a formulation: the wording, the placement, the file-placement ruling, the boundaries and the interpretation are the Program Authority's own.

---

## 2. Reading of the approval relied upon (stated so it can be corrected)

The decision approves **the act based on the proposal, subject to the fixed decisions and exclusions in §1**. Applied transparently:

| Proposal element | Effect of the decision |
|---|---|
| §1 scope; §2 reused findings; §3.1 truthful content | **Adopted as the basis** — subject to the PA's fixed wording (§3 below) |
| §3.2 candidate wordings **N-A / N-B / N-C** | **Displaced.** The Program Authority fixed its **own** string, which is none of the three candidates; the act of fixing supersedes the choice presented |
| §3.3 placement **P-1 / P-2** | **P-1 chosen** by the PA; P-2 expressly excluded ("Do not duplicate the notice in every dataset panel") |
| §3.4 file-placement point | **Ruled:** rendered through the consuming view; `MacroContext.tsx` **runtime behaviour unchanged** |
| §4 authority basis / `D89 §19` analysis; **T-1** | **Adopted, and T-1 is now settled by the PA** — see §6 |
| §5 implementation and validation criteria | **Adopted as the detailed criteria**, and bounded by the PA's own required validation list (§8) |
| §6 exclusions | **Adopted**, restated and extended by the PA's exclusions (§7) |
| §9 decision text | **Superseded by issuance** — the PA issued its own decision rather than adopting the proposed text |

**One point the Program Authority did not restate, recorded rather than assumed:** the proposal's constraint **C-6** (a **new, distinct** test id, not the IPD-side `macro-data-mode-exemption-disclosure` marker) was a proposal-level detail. It is carried into §8 as an implementation criterion because it contradicts no fixed decision and preserves the `XV-16` separation; **if the Program Authority intends otherwise, it may direct the change and this clause follows the direction.**

---

## 3. Pre-implementation verification of the approved wording — **performed; no discrepancy found**

The Program Authority required verification of each statement against the current authoritative implementation **before** implementation, with an express instruction to **stop and report rather than silently reword**. Executed read-only against `main` `805a10af4180691abcb76a0dac96a3c6541a39aa`.

**Approved string (fixed; to be rendered verbatim, unaltered, unexpanded, unreduced):**

> **"This page retrieves data live from MoSPI. No user setting switches this view to snapshot or point-in-time data. If live retrieval fails, the page reports the failure rather than substituting snapshot or synthetic data."**

| # | Statement | Verification | Result |
|---|---|---|---|
| W-1 | *"This page retrieves data live from MoSPI."* | `MacroResearch()` mounts `MacroProvider` with three governed requests, so the page issues live reads on mount: `/api/macro/nas` (`NAS:GVA`), `/api/macro/cpi`, `/api/macro/iip` (`src/api/macro.ts` `MACRO_ROUTE`) → `frontend/server/executive-transport.ts:748–752` → `macro/macro-transport.ts` → `macro/mospi-source.ts`, whose `MOSPI_REST_BASE_URL = 'https://api.mospi.gov.in'` (line 54) with per-dataset endpoints (lines 57–59). **No response or observation cache exists in the macro path**, and no service worker / `CacheStorage` exists in the client (`grep` → 0 matches); observations are not persisted. The single occurrence of "cached" in the path is `mospi-tls.ts:75`'s lazily created **`undici` TLS dispatcher** — a connection-level object, **not** a data cache | **ACCURATE** |
| W-2 | *"No user setting switches this view to snapshot or point-in-time data."* | The authorized preference set is closed and contains one key: `AUTHORIZED_PREFERENCE_KEYS = Object.freeze(['theme'])` (`frontend/server/settings/settings-service.ts:73`); the Settings surface exposes exactly one control, the theme `<select id="settings-theme">` (`features/settings/Settings.tsx:133–145`); the client's only mutation is `updateSettings(patch: { theme: ThemeMode })` (`src/api/settings.ts:99`). `defaultDataMode`, `pitMode` and `freshness` are **rejected** keys, with tests (`settings-service.test.ts:198`, `:217`). The Macro surface itself renders **no control at all** (`grep` for `<button`/`<input`/`<select`/`onClick`/`onChange` under `frontend/src/features/research/` → 0 matches). The macro mount passes **no `deps`** (`executive-transport.ts:752`), so no settings input can reach the Macro response path even in principle | **ACCURATE** |
| W-3 | *"If live retrieval fails, the page reports the failure rather than substituting snapshot or synthetic data."* | `macro-transport.ts:23` — "FAIL-CLOSED — any upstream error is surfaced as an error response." `MacroContext.tsx` catch paths set `data: null` with the error set and retain **no** stale value ("FAIL CLOSED: no stale/synthetic fallback is retained or shown"). `MacroResearch.tsx` renders, for the error state, a `role="status"` refusal block (`data-testid="macro-refusal-{dataset}"`) that shows the transport's own message verbatim plus *"No observation is shown: the governed read did not complete, and no cached, partial or synthetic value is substituted."*; and for an unreadable response, *"nothing is synthesized from an unreadable response."* The visible refusal is independently corroborated by the D89 browser acceptance (`CV-53-D89-MACRO-PRODUCT-ACCEPTANCE-01`: live HTTP `502` rendered the governed fail-closed refusal, zero observations) | **ACCURATE** |

**Determination: no statement is inaccurate; no discrepancy arises; the approved wording is not altered, and no stop condition under §1.1 is triggered.**

**Two transparent notes, neither a discrepancy:**

1. **Provider vs platform.** W-1 names *MoSPI* (the provider and the REST host `api.mospi.gov.in`). The *data platform* is e-Sankhyiki, already named on the same surface by the D89 `DT-1` provider line. The approved string therefore introduces no inconsistency and exposes no REST host, route or API mechanic (consistent with `D89 §4`).
2. **Lowercase mode words.** W-2/W-3 say "snapshot or point-in-time data" in generic, lower-case description rather than as `LIVE`/`SNAPSHOT`/`PIT` labels — which is what keeps the notice a **denial** rather than an advertisement, and satisfies the PA's requirement that the implementation not imply user-selectability.

**Condition attached to this verification:** it was performed against `main` `805a10af…`. **If `main` moves before implementation, these three checks must be re-executed** against the then-current tree before the notice is written, and any drift reported rather than absorbed.

---

## 4. Authorized scope (bounded)

| # | Authorized |
|---|---|
| **A-1** | Implementation of **one** always-visible, ordinary-text notice on the IRR Macro research surface (`/research/macro`), rendering the §3 approved string **verbatim**. |
| **A-2** | Focused tests verifying that notice, per §8. |
| **A-3** | Validation evidence for the §8 criteria. |
| **A-4** | The implementation's submission for review, and (only on the Program Authority's own merge) its durable publication. |
| **A-5** | Nothing else. `D91 §1`'s notice obligation **only** — "Authority is limited to implementing and testing this D91 §1 notice." |

**Nature of the authority:** **constitutive.** It is a new, named, bounded grant of implementation authority by the Program Authority, of the same instrument class as the `D88` establishment, the `D91` competence and mechanism acts, and the CV-53 D89 implementation-authority act. It derives its force from the grant itself and **from no other act** (§6).

---

## 5. Fixed implementation parameters

| # | Parameter | Fixed value |
|---|---|---|
| F-1 | **Notice string** | The §3 string, exactly, as one paragraph of ordinary visible text. No rewording, abbreviation, expansion, buffering of phrases, or added legal/disclaimer sentences |
| F-2 | **Placement** | **P-1** — **one** notice for the Macro research surface, **adjacent to the dataset panels**; explicitly **not** duplicated inside each dataset panel; **not** in a footer, tooltip, hover, expandable, modal or off-screen element |
| F-3 | **File placement** | Rendered **through the consuming view** (`MacroResearch.tsx`, or a small dedicated component it mounts). `MacroContext.tsx` **runtime behaviour unchanged** |
| F-4 | **Visibility** | Rendered in the normal document flow, visible in **every** state — including the loading and refusal states — since the refusal state is precisely when a reader might otherwise expect a substitution |
| F-5 | **Accessibility** | Ordinary text with an accessible label; proposed `data-testid="macro-data-mode-notice"` / `aria-label="Macro data-mode notice"` |
| F-6 | **Non-implication** | The rendered notice must not present `LIVE`, `SNAPSHOT` or `PIT` as user-selectable in IRR, and must not be accompanied by any control suggesting otherwise |

---

## 6. `D89 §19` — the Program Authority's interpretation, recorded transparently

| # | Recorded |
|---|---|
| **I-1** | **This act is separate and constitutive.** It "does not rely on or expand the D89 implementation authority, amend D89, or grant D91/D88 relief." |
| **I-2** | **The interpretation, as issued:** *"For clarity, `D89 §19`'s 'only' limits the implementation authority granted by the D89 UI-disclosure gate; this separate act supplies only the bounded authority expressly stated here."* — This is the **Program Authority's** reading of `D89 §19`, issued with this decision. It settles the interpretive question the proposal recorded as **T-1** (`PROPOSAL-01` §4.2), and it is recorded here **as an interpretation, not as an amendment**. |
| **I-3** | **No governed act is altered.** "Do not alter those acts." `D89` — including `§19` and `DT-1…DT-15` and `DT-15` in particular — the `D91` competence and mechanism acts, `D88`, `D8`, `M-5`, `NP-11-AUTH-01`, the CV-53 implementation-authority act and the Option E disposition act remain **byte-identical and unmodified, including their non-retroactive character**; none is superseded, reopened or relied upon for this grant. The verification of that byte-identity is an explicit validation criterion (§8 V-8). |
| **I-4** | **The interpretation travels with the act, not into the corpus's other acts.** It is recorded in this act and in tracker §16.33 so that a future reader can see why a D91 §1 UI implementation proceeds without reopening D89 — while `D89` itself remains exactly as written. |

---

## 7. Exclusions (not authorized by this act)

| # | Not authorized |
|---|---|
| **X-1** | **No `D91`/`D88` relief, exemption or waiver.** Every D91 requirement stands unchanged: LIVE-only, the fallback prohibition, the `NAS`/`CPI`/`IIP` boundary, provenance, server-side governed transport (`WP-MACRO-03` §16.1). |
| **X-2** | **No `D91 Relief Determination`** — the third required act is not created, pre-authorised or deemed. |
| **X-3** | **No Settings change and no data-mode control.** `NP-11-D4` remains unchanged; no preference key is added to the closed set; `defaultDataMode` / `pitMode` / `freshness` stay rejected; no control implying user-selectable `LIVE`/`SNAPSHOT`/`PIT` may be added. |
| **X-4** | **No transport, API-client, source-adapter or server change** — including the two fenced client one-liners (transport-`code` passthrough; mount `deps` injection), which remain queued for a single decision per §16.17.4 / §16.19.6. |
| **X-5** | **No amendment to any governed act**, and no expansion of any other act's authority. |
| **X-6** | **No IPD change** — IPD remains read-only and untouched. |
| **X-7** | **No production qualification**, and no production, admission, activation, certification or release authority. This act authorizes a non-production UI presentation change and its validation only. |
| **X-8** | **No other Macro item or workstream** — "Do not begin V-C6 or any other workstream as part of this task." Explicitly untouched: `V-C6`, `XV-15`, the `996`-record `index` observation, the API-client/configuration residuals, `CV-24`, `CV-38`, the general `XV-16` rule, Reports, the portfolio line, and every §19 pending category. |
| **X-9** | **No legal, licensing, attribution, GODL or `M-3` determination.** `DT-11` stays `NOT DETERMINED`; `DT-13` stays `NOT ESTABLISHED`; no licence/rights language; no MoSPI contact. The notice is a **behavioural/product** statement, not a legal attribution or disclaimer. |
| **X-10** | **No other disclosure work.** The D89 `DT-1…DT-15` implementation is complete for its accepted scope and is **not** reopened; this act adds only the D91 §1 notice. |
| **X-11** | **No claim that implementation, qualification or acceptance has occurred.** This act authorizes; it does not execute, verify or accept (§9, §10). |

---

## 8. Implementation and validation criteria (operative once §9 is satisfied)

### 8.1 Implementation

| # | Criterion |
|---|---|
| **IM-1** | Render the §3 string verbatim, one paragraph, per F-1…F-6. |
| **IM-2** | Change **presentation only**: the Macro view and, if used, one dedicated notice component plus its mount. **Unchanged:** `MacroContext.tsx` runtime behaviour, `src/api/macro.ts`, `frontend/server/macro/**`, `frontend/server/executive-transport.ts`, `frontend/server/settings/**`, `App.tsx` route semantics, `routes.ts`, and every dependency manifest. |
| **IM-3** | Add **no** state, storage, preference key, setting, toggle, selector or data-mode control. |
| **IM-4** | Leave the two fenced client one-liners untouched. |
| **IM-5** | Cite this act and `D91 §1` in the notice component's header comment, so the element's authority is traceable from the code. |
| **IM-6** | Use a **new, distinct** test id (`macro-data-mode-notice` proposed) — **not** the IPD-side `macro-data-mode-exemption-disclosure` marker — so this IRR implementation cannot be mistaken for the IPD-side delivery (`XV-16` separation). Subject to the §2 correction note. |

### 8.2 Validation — the Program Authority's required items

| # | Required validation | Criterion |
|---|---|---|
| **VA-1** | **The visible notice** | The notice is present and visible on `/research/macro` in the loaded **and** refusal states, per F-2/F-4 |
| **VA-2** | **Its exact wording** | A test asserts the rendered text **equals** the §3 string (strict equality, not a partial or regex match) |
| **VA-3** | **The required placement** | Exactly **one** notice on the surface, adjacent to the dataset panels, and **not** inside any dataset panel (a negative assertion that the notice does not appear per-panel) |
| **VA-4** | **Truthful live-only behaviour** | The surface still issues exactly `/api/macro/nas`, `/api/macro/cpi`, `/api/macro/iip`; no substitution path exists; the notice's statements remain true of the shipped behaviour |
| **VA-5** | **Failure behaviour** | In the error/unreadable states the page reports the failure and substitutes nothing; the notice remains rendered (test on the refusal state) |
| **VA-6** | **Absence of user-selectable data-mode controls** | A **negative** test: no data-mode control exists on the surface, and no rendered text presents `LIVE`/`SNAPSHOT`/`PIT` as user-selectable |
| **VA-7** | **Governed-act and fence-file integrity** | Byte-identity with the recorded blobs for `D89` (`9652f890…`), the `D91` relief mechanism (`f61325ee…`), `D88` (`d396e688…`), `D8` scope (`7cd63efb…`), `M-5` (`2006786c…`), the CV-53 implementation-authority act (`3befae72…`), the Option E act (`65cab80e…`), `NP-11-AUTH-01`, and the three fences (`reports-transport.ts` `98147054…`, `user-portfolio-transport.ts` `51704c12…`, `owner-context-unavailable.ts` `cb8db45d…`) |
| **VA-8** | **Suite, type and build integrity** | `frontend/`: `npm run typecheck`, `npm run test:ci`, `node .ci/assert-tests.js .vitest-report.json`, `npm run build` all pass; hosted CI green on the implementation PR head; **no** existing test weakened, skipped or rewritten to fit |
| **VA-9** | **Responsive check** | Browser check at the widths already used for the D89 acceptance (`1280×800`, `390×844`, `320×720`, `280×640`), reusing the established method: notice visible and fitting, no horizontal overflow |
| **VA-10** | **Change-set review** | The diff contains the notice presentation code, its tests and the record only; nothing deleted or renamed; no file outside §8.1 IM-2 |

**Explicitly not claimed by this act:** product acceptance, qualification, admission, production readiness, and any legal or entitlement finding. Acceptance of the implemented notice is a **separate, bounded step** on its own evidence, per §10.

---

## 9. Effectiveness and the exact remaining acts

| Step (NP-12 form) | State |
|---|---|
| 1 — Program Authority review/acceptance of the **decisions** | **SATISFIED** — issued directly and verbatim (§1) |
| 2 — Ratification of the record's wording | **SATISFIED on the substance** — the operative wording, scope, placement, boundaries and interpretation are **the Program Authority's own text**, transcribed at §1; the *record's* surrounding prose is the agent's execution, per the corpus convention |
| 3 — **Durable publication**: merge of this act's pull request to `ramkivs/iips-review-recovered @ main` (via PR; no direct push, no force-push) | **NOT PERFORMED** — the Program Authority's merge act. **No merge is performed, requested as of right, or inferred by this record** |
| 4 — Independent remote verification of the merged commit, parent, tree, this act's blob and raw SHA-256, plus the tracker row | **NOT PERFORMED** — possible only after step 3 |

> ## **Until steps 3 and 4 are complete and verified, this act is non-authoritative and NO IMPLEMENTATION IS AUTHORIZED BY IT.**
>
> The Program Authority's own sequencing is explicit: *"Once its required durable publication is verified, implement the notice and focused tests in a separate bounded change."* Implementation therefore **waits on the merge**, and on the re-execution of the §3 wording verification against the then-current `main`.

**After steps 3–4,** the authorized path is: implement and test the notice (one bounded change), submit it for review, and — on the Program Authority's separate merge act — publish it. Acceptance and `V-C5` closure then follow §10.

---

## 10. `V-C5` disposition

> ## **`V-C5` REMAINS OPEN.** It is **not** closed, and not partially satisfied, by this act.

Per the Program Authority's §7, `V-C5` is kept open **until all three** of the following are complete:

| # | Condition | State at recording |
|---|---|---|
| **VC-1** | **The authority act is durably published** (merged to `main` and remotely verified) | **PENDING** — steps 3–4 of §9 |
| **VC-2** | **The notice is implemented and validated** (per §8) | **PENDING** — waits on VC-1 |
| **VC-3** | **The required acceptance and tracker reconciliation are completed** (a separate bounded acceptance act on its own evidence, recorded on the tracker) | **PENDING** |

Until then, tracker §16.32's `DECISION REQUIRED — NOT DECIDED` is **superseded as to the decision** (the decision has been made) but **not as to the outcome**: the satisfaction limb of `V-C5` is still **NOT SATISFIED** on `main`, and tracker §16.33 records the condition as **`DECISION MADE — IMPLEMENTATION PENDING`** with the three conditions above.

---

## 11. Publication

This act is published from the session branch **`arena/2148b8cf-iips-review-recovered`** through a pull request into `main`, together with the proposal it rests on (`NP-08-D08-MACRO-V-C5-D91-NOTICE-IMPLEMENTATION-AUTHORITY-ACT-PROPOSAL-01`, published as the reviewed basis so the approval's reference is resolvable from `main`) and the additive tracker entry (§16.33 / `CHG-2026-10-15-10`). **Merging is the Program Authority's act** (`H-18 §8.3(b)`; `G2-2 §P5`); branch publication is not admission to `main`. Per the self-reference rule, this act's own merge coordinates are **not** recorded inside it; they belong to the tracker and to post-merge remote verification.

---

*End of act. The Program Authority has granted a bounded, constitutive implementation authority for the `D91 §1` notice and nothing else. It is **not yet effective**; no implementation is authorized until it is durably published and remotely verified; and `V-C5` remains open.*
