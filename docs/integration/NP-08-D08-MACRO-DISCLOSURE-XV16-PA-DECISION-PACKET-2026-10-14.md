# NP-08 / D08 MACRO — Macro Disclosure Obligation and `XV-16` — PA DECISION PACKET

> **Record identifier:** `NP-08-D08-MACRO-DISCLOSURE-DECISION-PACKET-01`
> **Date:** `2026-10-14` (UTC)
> **Workstream / gate:** NP-08 — Intelligence · D08 MACRO · **D89** UI-disclosure gate (and the D88/D91 relief mechanism)
> **Document type:** `DECISION PACKET` — a consolidated, evidence-backed **request for a decision**, together with the findings that make it decidable.
> **Status:** **PENDING DECISION**
> **Deciding authority:** **Ramki (Ramakrishnan), IIPS application owner and Program Authority** — supported by `NP-08-D08-D89-MACRO-UI-DISCLOSURE-DECISION-ACT-01` §"Decision authority: **Ramki — IIPS application owner and Program Authority**", and by `NP-08-D91-RELIEF-MECHANISM-ACT-01` §"Issuing authority: **Ramki / Program Authority** (deciding authority)".
> **Recording agent:** `arena-agent` — investigation, verification and record-execution **only**. **No decision is rendered here.**
> **This packet grants nothing.** It is not an act, not an authority, not a qualification, not an admission, not an approval, and not a signature. It creates no implementation authority, does not open the D89 gate, does not grant `D91/D88_MACRO_RELIEF`, and does not resolve `XV-16`.
> **Repository scope:** **IRR** `ramkivs/iips-review-recovered` (durable destination, per `NP-08-P4-GATE-Y-CORPUS-PLACEMENT-DESIGNATION` C-1) · **IPD** `ramkivs/iips-production-market-data` (source corpus, **read-only, unmutated**).
> **Production:** **OUT OF SCOPE.**

---

## 1. The decision questions

| # | Question | Who may answer |
|---|---|---|
| **Q1** | How is the outstanding **Macro disclosure obligation** to be disposed of — Option A, B, C, D or E (§7)? | PA only (D89 §3/§19 withholds UI implementation authority from every other actor; `DT-15`) |
| **Q2** | Does the **IPD-side `D91` record** — `docs/D91_MACRO_LIVE_ONLY_EXEMPTION_DISCLOSURE.md`, claiming the disclosure was *delivered* — **discharge, supplement, conflict with, or have no effect on** the IRR-owned obligation, and is the IRR disclosure item to be recorded as satisfied, still OPEN, or withdrawn? | PA only (D88 competence is "a power to **determine requests**, not a power to originate them" — D91 relief act §8.3 — and this packet is not such a determination) |
| **Q3** *(subordinate)* | Is any **`D91/D88` relief** needed at all in the present state? | PA, on a §9-conforming request; the evidence here says **not at present** (§6.4) |

---

## 2. Operative state — what binds, with its source

Read from the durable artifacts on IRR `main` (`1b2b194`) as at `2026-10-14`; nothing below is paraphrased from a branch, a candidate, a green CI run or an investigation report.

| Instrument | Operative content | Effect |
|---|---|---|
| **D89** — `NP-08-D08-D89-MACRO-UI-DISCLOSURE-DECISION-ACT-01` (2026-10-05), Classification **B — requirements partially established** | Decision: the Macro UI **SHALL** disclose provider/platform and name the governed dataset and granularity as a **product-transparency** control. **DT-1** fixes the exact string: *"Provider: Ministry of Statistics and Programme Implementation (MoSPI) · Data platform: e-Sankhyiki."* **DT-2** fixes the dataset labels and requires IIP to be labelled **NIC 2-digit level only**. **DT-3** shared source line, per-dataset scope. **DT-4** placement/persistence incl. detail views. **DT-5** responsive + accessible. **DT-6** disclosure separated from IIPS interpretation. **DT-7** MUST NOT imply endorsement. **DT-8** MUST NOT invent provenance metadata. **DT-9** optional factual Category-A line, never styled as a licence. **DT-11** attribution format **NOT DETERMINED**. **DT-12** MUST NOT assert licence/rights language. **DT-13** legal non-endorsement **NOT ESTABLISHED**. **DT-15** "MUST NOT be treated as authority to change UI code, components, styles, `MacroContext`, API clients, transport, tests" | **A binding display contract, and an explicit withholding of implementation authority.** §3 "UI implementation authority: **NOT GRANTED BY THIS GATE**"; §19 requires a separate gate; the act also records that "source visibility, per-dataset placement, detail-view persistence and responsive behavior are **not currently established by implementation**", and that existing Gate 22 authority for the Macro *route contract* "is **not** blanket authority for this UI change" |
| **D91** (as established, cited by IRR as constraint + disclosure act `727bdcb`) | Macro data on `/api/macro` is governed **LIVE-only**, is **EXEMPT** from the account-wide UI12 "Default data mode" preference, is subject to a **fallback prohibition**, and carries a **UI disclosure obligation on `MacroContext.tsx`** (D91 §1) telling a user who selects SNAPSHOT/PIT that Macro does not switch modes | **An obligation tied to a rendered surface.** Where no Macro view exists, there is nothing on which the notice can appear — see §6.4 |
| **D91 relief mechanism** — `NP-08-D91-RELIEF-MECHANISM-ACT-01` | Its scope (§7.1) is exactly four matters: participation in, or exemption from, the UI12 preference; the terms of any exemption; and **whether the `MacroContext.tsx` disclosure obligation is modified, preserved or withdrawn as a consequence** of those. §7.2 excludes source governance, provider/dataset selection, vintage, LIVE/SNAPSHOT semantics, persistence, tenancy, `runtimeCompanyId`, D115. **§9** invalidates an incomplete request (10 required elements). **§10** requires 10 evidence items before any determination. **§16.1** preserves the eight WP-MACRO-03 constraints. **"No D91 relief is in force."** And: this is the **second of three required acts — the third, the *D91 Relief Determination*, "does not yet exist and is not authorized by this act"** | Relief is **available but procedurally closed**: it can only be *determined* on a valid, standing-bearing **request**; D88 may not self-initiate (§8.3) |
| **D88** — `NP-08-D88-ACCOUNT-WIDE-UI12-DATA-MODE-AUTHORITY-ESTABLISHMENT-ACT-01` (`2dc5563`); competence for D91 relief established by `b607ea9` | D88 is the account-wide UI12 data-mode authority and is competent for D91 relief **only in the UI12 data-mode dimension** ("D88's competence is not broadened by this act") | Cannot be used to grant Macro UI implementation authority, source, dataset or licensing relief |
| **M-5 disposition** — `NP-08-M5-D91-OUT-OF-SCOPE-DISPOSITION-ACT` | Macro **remains within D8 Intelligence scope**; the prior `D08 MACRO = DEFERRED` is **resolved**; "`DEFERRED` does NOT mean `ABANDONED`"; the act **does not** prohibit macro acquisition and **does not** give D88 macro source authority | Scope is live; source authority is not; deferral (§7 Option E) is a scheduling disposition, not abandonment |
| **NO-AUTH decision** — `docs/integration/IIPS_v3.0_GLOBAL_NO_AUTH_PROGRAM_AUTHORITY_DECISION.md`, PRs #60/#61 merged `2026-10-12` | The personal application is single-owner and **credential-free**; `frontend/src/core/auth/keycloakAdapter.ts` and `frontend/server/admin-transport.ts` no longer exist | Any candidate that re-introduces OIDC/role gating contradicts an operative decision |
| **Gates that are *not* this packet's instrument** | `G-2` (external persistence), `D-1`, `AD-20`, the Reports / User Portfolio / owner-context fences, §20 Stage 3 (IPD `main` admission), `CV-20`…`CV-25`, `CV-50` | Unaffected; none of them authorises a Macro UI change, and none is altered here |

**Implementation state on IRR `main`, as established (not inferred):**

| Aspect | State on `main` @ `1b2b194` |
|---|---|
| Server transport / source | `frontend/server/macro/macro-transport.ts` (8,456 B) + `mospi-source.ts` (33,623 B); route mounted in `frontend/server/executive-transport.ts`; GET/HEAD only on the exact allow-list `/api/macro/{nas,cpi,iip}`; `400` unapproved indicator, `404` unknown dataset, `405` POST, `502 RETRY_BUDGET_EXHAUSTED` on upstream failure with **zero observations**, never a substitute value |
| Tests | **56** macro unit tests (50 server + 6 client), green in hosted CI (V24/V25) |
| Client | `frontend/src/api/macro.ts` typed over `noAuthFetch`; `MacroContext.tsx` is a **provider that renders `children` only** — no view, no route, no nav entry |
| D89 markup | **absent** — no `data-testid="macro-source-*"`, no DT-1 string, no dataset label anywhere in `frontend/src/**` |
| D91 markup | **absent** — no `macro-data-mode-exemption-disclosure` |
| Structural exemption evidence | `handleMacroRequest(req, res, deps: MacroRouteDeps = {})` accepts config, but the mount passes only `(req, res)` (`executive-transport.ts`), so **no data-mode/settings input reaches the macro path at all**, and the transport's own text states no snapshot, fallback payload or synthetic value is ever produced. Consequence: the LIVE-only exemption currently holds **by construction, not by test** — no test pins it, which §8 lists as a proof requirement |
| Known client defects (fenced, §16.17.4) | `getJson` throws `` macro transport returned ${res.status} `` and **discards the machine-readable `code`**; the mount passes no `deps`, so `baseUrl`/timeouts are not reachable from tests. Both are *inside* the gate's subject matter and are **not** repaired opportunistically |

---

## 3. Repository-wide discovery — coverage actually achieved

Both clones were un-shallowed (`--depth 1` had bounded every earlier "does it exist elsewhere" claim). Census, run per repository:

| | IRR | IPD |
|---|---|---|
| refs | **213** = 26 named branches + 86 `arena/*` + **all 98** `refs/pull/*/head` + 2 tags | **43** = 9 named + 23 `arena/*` + 6 PR heads + 4 tags |
| commits, all refs / `main` | **583 / 307** | **618 / 94** |
| macro blobs, all ref tips | **20 distinct blobs / 8 paths**, on 130 of 211 tips | **15 distinct blobs / 13 paths**, on 40 of 42 tips |
| `main` | all 7 admitted paths (`frontend/server/macro/**`, `src/api/macro.ts`, `MacroContext.tsx` + test) | 4 paths only: `src/contracts/d08_macro.ts`, `src/intelligence/macro_engine.ts`, `src/ui/view_models/ui13_macro_vintage_tracker.ts`, `tests/fixtures/d08_fixtures.json` — **no** `frontend/server/macro/**`, no `frontend/src/features/research/` |
| methods | history-wide path census (`git log --all --name-only`); per-ref-tip `git ls-tree -r --long` (blob identity + size); per-blob `--find-object` introduction; symbol sweep over every tip; `merge-base` / `rev-list` / `for-each-ref --contains`; PR/tag metadata via API | same, plus tag-level tree enumeration |

**Lineages reconciled (L-A…L-H — full detail in tracker §16.19.3).** Reuse justified because every relevant ref is **byte-unchanged** since that report: `phase13-next 4357e14a`, `gai-impl-canonical f63a9b49`, `arena/01a10b3c 36e433a0`, PR #35 head `8811d7d4`, IPD `main 4d3e1cd`, IPD `arena/01a0a438 ea001408`.

| ID | Ref / commit | Decision-relevant substance |
|---|---|---|
| L-A | IRR `main` (`b489efd`, `d0c6f80`, `1f7997e`) | the only **admitted** implementation; no view |
| L-B | `phase13-next` ≡ `gai-impl-canonical` (2026-08-21 `024ae9b`, `0cc00f2`, `50cfd4f`; **no merge-base with `main`**; 78/47 ahead, 307 behind) | full rendering UI + dataset selector + provenance + `FreshnessBadge`/`EmptyState`/`CertifiedBadge`, 18 client tests, **nav entry** `navigation.ts:81 { label: 'Macro', path: '/research/macro', status: 'implemented' }`, `App.tsx` mount — and **incompatible**: client uses `authFetch` and `GET /api/macro?dataset=` (main serves `/api/macro/{dataset}` over `noAuthFetch`); test imports `keycloakAdapter` + `admin-transport`, both removed by the NO-AUTH decision; error map 422/422/502/503 vs main's 400/404/405/502 |
| L-C | IRR `arena/01a10b3c` — `b21df5c` (2026-10-05), 5 ahead / 177 behind, **no PR head carries it** | `MacroSourceDisclosure.tsx` (2,008 B) + test (2,525 B): provider line, per-dataset labels, IIP NIC-2-digit granularity, `data-testid`s, `aria-labelledby`, `children` slot; imports **only** `react` + `../../api/macro` (main's own `MacroDataset` type); header states "No route is invented here … the smallest coherent D89 UI unit". **DT-1 non-conforming string** (`'Data source: MoSPI / e-Sankhyiki'`) |
| L-D | PRs #35/#36 (both MERGED) | ancestral blobs, superseded — prevents misreading census size deltas as live divergence |
| L-E | IPD `arena/01a0a438` only; **delivery commit `727bdcb`** (2026-09-15, parent `57ea3bb`) | 4 files: the act doc (4,384 B) **+ `MacroContext.tsx` +23 / `MacroContext.test.tsx` +20 / `frontend/server/data-mode/data-mode.test.ts` +21**; renders `<div data-testid="macro-data-mode-exemption-disclosure">`; claims "**20 passed / 0 failed**", authority "D88 = A", and **"Browser/runtime qualification: NOT CLAIMED"**; sits **on top of L-B's lineage** (so it inherits `authFetch`, the query-param endpoint and the OIDC-gated tests); reachable from **exactly one** ref in **either** repository; the touched file **does not exist on IPD `main`** |
| L-F | IPD `p10/src/macroDataModel.js` + test (16 tests), on 4 durable tags, absent from IPD `main` | **MD-5 "No live provider execution. LOCAL_FIXTURE only"** — the strongest in-repository basis for refusing to treat IPD's `sourceClassification:'REAL'` as certified provenance (`XV-15`) |
| L-G | IPD `main` D08 trio | wired (barrels, `ingress/pipeline.ts:244 case 'D08_MACRO'`, optional `macro` field on the adapter, engine tested by `wsc_p10_intelligence.test.ts`) but **deliberately unbound**: `shell_research_surface.test.ts` asserts `!code.includes('ui13_macro_vintage_tracker')` ("the designation forbids binding") |
| L-H | tags | IRR's two tags contain **no** macro file → no tag or release certifies any Macro UI state |

**Searched and not searched.** Searched: every ref tip in both repositories (source, tests, fixtures, `package.json`, CI, docs, decision records, evidence), all history paths, tags, PR heads and PR metadata, dependency pins and their ancestry. **Not searched / inaccessible:** GitHub issues, Discussions and wiki; `refs/pull/*/merge` other than #98; the raw hosted Actions log *text* (endpoint outside this environment's network allowlist); IPD-side items `CV-35`/`CV-36` beyond macro content; binary and `p05`/`p10` JSON evidence at content level (path and size only); anything in a working copy that is not pushed — including the **untracked** items the Windows capture lists (reconstruction documents, P15 evidence files, an E2E implementation backup directory), which are recorded as **evidence that exists outside every ref and therefore cannot be reconciled from the remote**.

Classification discipline: *observed facts* are the blob/ref/commit/text readings above; *derived conclusions* are marked as such (§4, §6); *candidate interpretations* are the option analyses in §7; *unresolved questions* are Q1–Q3 and the items in §9.

---

## 4. The embedded Windows evidence — reconciled, and what it does and does not establish

The capture (Windows PowerShell, `2026-10-14T23:53:35+05:30`) is **user-supplied evidence**; the verification below is **Arena-observed repository evidence**. No file was transferred, and none was read from `G:` (no such mount exists here).

| Reported field | Reconciliation against IRR |
|---|---|
| Directory `G:\IIPS\phase13-next-authority\frontend\server\macro`, repo root `G:/IIPS/phase13-next-authority`, origin `…/iips-review-recovered.git` | an **IRR clone** |
| `HEAD = 1a602d849cc47331d4f61cc366ed0a343f80e287` | **a real IRR commit**: 2026-09-11 01:51:17 +0530, author "Ramaki", *"docs: record recovered P06 acceptance durability reconciliation"*, parent `c62b65e`, tree `7c29f557…` |
| "branch --show-current returned empty" | consistent with a **detached HEAD** — the checkout is *at* a commit, not *on* a branch. `git for-each-ref --contains` shows that commit is contained in **exactly one ref: `origin/phase13-next`** (tip `4357e14a`), **4 commits behind** it, and in no other branch, tag or PR head. Detached-HEAD ≠ non-membership: the content *is* on `phase13-next`; what is absent is a local branch pointer |
| Tree at that commit, `frontend/server/macro/` | **exactly the three reported files**, same paths, same blobs: `macro-transport.test.ts 0af644d2…`, `mospi-source.test.ts 20cf3ec8…`, `mospi-source.ts 5ccef665…` |
| "No `macro-transport.ts` in that directory" | confirmed for the whole `phase13-next` tree — on that lineage the handler is `handleMacroReadRequest` in `frontend/server/executive-transport.ts`, which is also what the orphan's transport test imports. Consistent, not contradictory, with the current-repository picture: **`main` is the one lineage that *added* `frontend/server/macro/macro-transport.ts`** (blob `451f0c8c`, 8,456 B, via `b489efd`) — hence the file's absence in the Windows folder is a **lineage marker**, not a missing file |
| Same commit also carries | `frontend/src/api/macro.ts` 4,071 B, `MacroContext.tsx` 6,828 B, `MacroContext.test.tsx` 11,114 B — i.e. the folder listed is only the server slice of a **whole L-B client+server stack** at that commit |
| Sizes 12,235 / 15,503 / 24,453 with `core.autocrlf=true` and no `text`/`eol` attribute on these paths | explained exactly: IRR's `.gitattributes` pins `eol=lf` for eight named canonical files only, so `.ts` files follow `core.autocrlf`. With LF-stored blobs, checkout inserts one CR per line: 12,010+**225**=12,235 · 15,232+**271**=15,503 · 23,942+**511**=24,453 |
| Reported raw and LF-normalised SHA-256 | **both reproduce exactly** from the repository blobs. Reconstructed CRLF bytes hash to `ac244933c00e…`, `6745c0df6a25…`, `405fed0f869e…` = the reported raw digests; LF bytes hash to `467e1ada2c3f…`, `59c4a2b9b1d5…`, `7464bb7480e3…` = the reported LF digests. CR-in-blob = 0 for all three, matching "zero lone-LF / zero lone-CR" |
| HEAD blob = index blob = `git hash-object --path=…`, all three tracked, no delta for the path | working copy **is** the committed content, after EOL normalisation. Combined with the digest match, this is **byte-level content identity between the Windows working copy and IRR's historical blobs** — no further transfer or re-run is needed for the identity question |
| `shallow: false` | the Windows clone has full history; unlike the Arena clones at the time of the earlier pass, so its ref picture could be richer — but it points at the same `1a602d84`/`phase13-next` content |

**What the evidence establishes:** the Windows folder is a clean, unmodified, byte-identical working copy of the **2026-08-21 orphan-line macro stack (L-B)** at commit `1a602d84` on `phase13-next` — historical, never admitted, and still identical to that branch's current tip content (`git diff 1a602d84..phase13-next` over the macro paths is **empty**).

**What it does not establish:** correctness, current compatibility, admission, qualification or authority. It is **identity and provenance** evidence, not source review or behavioural review. Content review was performed where it was decision-critical, and it was performed **on the Git blobs inside this environment** (§3, §7), not on the Windows copies.

---

## 5. `XV-16` — the reported cross-repository conflict, reconciled

**Q1 — what the IPD-side record claims, verbatim in substance:** on `arena/01a0a438`, `docs/D91_MACRO_LIVE_ONLY_EXEMPTION_DISCLOSURE.md` (Act ID `D91 — macro LIVE-only exemption disclosure`, authority "**D88 = A**", base `57ea3bb`, "**Correct-by-addition:** D85, D86, D88, D89 and D90 records are NOT edited") states that D91 "delivers the outstanding UI disclosure requirement on `MacroContext.tsx`", at "Research → Macro (`/research/macro`)", by rendering `<div data-testid="macro-data-mode-exemption-disclosure">`, with "**20 passed / 0 failed** (+2 tests)" and "Data-mode tests … **50 passed** (≥48)", and records "**Phase 3 — Macro disclosure | COMPLETE (D91)**" while declaring "**Browser/runtime qualification: NOT CLAIMED**".

**Q2 — what the cited evidence actually proves.** The claim is a **delivery commit**, not only a document: `727bdcb` touches four files (act doc +23 lines to `MacroContext.tsx`, +20 to its test, +21 to `data-mode.test.ts`). Reading those hunks: the notice is a static styled `<div>` inserted into L-B's rendering; the two added tests are **jsdom** assertions (`findByTestId` + `toHaveTextContent` against three regexes) and a freshness assertion (`freshness-live` present, `freshness-snapshot` absent), with **`globalThis.fetch = urlAwareMock(IIP_DATA)`** — a mocked fetch. So "20 passed" proves *a component renders this text in a test harness under a mock*. It proves nothing about a real browser (the act says so), nothing about IRR's route contract (that lineage calls `GET /api/macro?dataset=` through `authFetch`, while `main` serves `/api/macro/{dataset}` over `noAuthFetch`), and nothing about live-source reachability.

**Q3 — is the claimed implementation on IRR `main`?** **No.** `main`'s `frontend/src/features/research/MacroContext.tsx` (5,944 B, blob `2066eae2`) returns `children` only and contains neither the exemption markup nor any DT-1 string; the test id `macro-data-mode-exemption-disclosure` appears **nowhere** in `frontend/**` on `main`; and the `git diff` between `main`'s file and `727bdcb`'s version is a wholesale difference (5,944 vs 7,972 bytes, different lineage and header: "WP-MACRO-03: Macro Context workspace" vs "NP-08 / D08 MACRO: MacroContext (IRR consumer surface)").

**Q4 — authority to discharge.** The evidence says **no**, on three independent grounds, none of which requires reinterpreting an act:
1. **Wrong corpus, by designation.** `NP-08-P4-GATE-Y-CORPUS-PLACEMENT-DESIGNATION` (decided by the PA, 2026-10-04) selects **C-1**: IRR is the **durable destination**; IPD is the **source corpus, read-only, unmutated**. An obligation over an IRR-owned file is not discharged by an artifact placed in the corpus designated read-only-source.
2. **Wrong host.** The file D91's notice obligation names — `frontend/src/features/research/MacroContext.tsx` — **does not exist on IPD `main`** at all (IPD `main` has `frontend/src/features/{evidence,executive,intelligence,portfolio}`, no `research/`, and no `frontend/server/data-mode/`). Editing that path in IPD changes nothing that the personal application renders.
3. **Non-admission.** `727bdcb` is reachable from **exactly one unmerged branch in IPD**; the same content lineage has **no merge-base with IRR `main`**; and IRR's own operative act states "**No D91 relief is in force**" and keeps D89's item "historically **OPEN**; **not silently closed**".

**Q5 — conflict, supplement, or no effect?** **Neither a direct conflict nor a supplement: on the operative questions it has *no effect*, and one factual overlap is where the real confusion lies.** The two texts are about **different disclosures**:
- **D89/DT-1…DT-15** = *provider and dataset transparency* ("who published this data"), required on every user-facing Macro data view.
- **D91 §1** = a *data-mode exemption notice* ("this surface does not follow your SNAPSHOT/PIT preference"), required on the `MacroContext` surface.
`L-E`'s markup is unmistakably the **second** kind; `L-C`'s component is unmistakably the **first**. So the IPD-side "COMPLETE (D91)" line, read carefully, does **not** assert that D89's provider-disclosure item is closed — and IRR's "not silently closed" note is not contradicted. The residual, genuinely unresolved authority question is narrower and should be stated exactly: **may an act recorded in the IPD corpus ever modify, preserve or withdraw an obligation that IRR's acts attach to an IRR-owned file, when the two repositories now host different copies of that file — and does D91 §1's notice obligation survive at all while IRR has no Macro view?** That is Q2/Q3 for the PA.

**Q6 — who resolves it:** the **PA** (single named holder in both governing acts). Neither repository's maintainer, no agent, no CI result and no investigation record can; D88 may determine a *request*, not originate one (§8.3).

**Q7 — the formal instrument needed:** for Q1, the **separate D89 UI-DISCLOSURE IMPLEMENTATION AUTHORITY GATE** act named in D89 §19, recorded in IRR `docs/integration/` per C-1. For Q2/Q3, either a one-line **disposition note in the same corpus** (that IPD-side D91 records do not and cannot close IRR's DT-1…DT-15 obligation, and the state of the D91 §1 notice is recorded as conditional/deferred) or, if UI12 participation is ever to change, a **D91 Relief Determination** on a §9/§10-conforming request (third of the three required acts; §10 bars determination before its ten evidence items exist). Conformance status of this packet against §9/§10 is Appendix A — it is deliberately *not* submitted as a request, because no relief is presently needed (§6.4).

---

## 6. Analysis the decision rests on

**6.1 Only one candidate is cheap, and it is the unadmitted IRR one.** `L-C` imports nothing but `react` and `main`'s own `MacroDataset` type, and needs no server, no auth, no route and no new primitive — its dependencies are satisfied on `main` today. Its defect is textual: the DT-1 string must be corrected, and the component must then be *mounted by a view*, which is exactly what the withheld authority covers.

**6.2 `L-B`/`L-E` are not transplantable, and a wholesale transplant would be a governance violation.** They reintroduce OIDC/Keycloak and `admin-transport` dependencies that the operative NO-AUTH decision removed; they call a different endpoint shape; they carry a different error mapping; and `L-B` renders a `CertifiedBadge` and the phrase "the certified source", which cuts against **DT-7** (no implied endorsement) and needs checking against **DT-8** (no invented provenance). Option A is therefore *port-and-adapt*, never *merge* — and there is nothing to merge: the histories are disjoint.

**6.3 The reusable assets already on `main`:** `FreshnessBadge` (`frontend/src/components/ui/Badges.tsx`), `EmptyState` (`frontend/src/components/shell/ShellStates.tsx`), and the dataset label/allow-list types in `frontend/src/api/macro.ts`. No new primitive is required by any option.

**6.4 No D91 relief is needed in the present state.** D91's mechanism exists to decide whether macro *participates in* the UI12 default data-mode preference. On `main` there is **no client-side data-mode control at all** (no `frontend/src/**` reference to `dataMode`/`data-mode`; UI12 exists only as the server-side settings service/transport), and the macro path cannot observe settings because the mount passes no `deps`. The exemption therefore holds **structurally**. Consequences the PA should note: (i) nothing today engages §7.1(1)–(3); (ii) the D91 §1 **notice** obligation is **conditional on a rendered Macro surface**, of which there is none — so no violation is observable, and equally **no compliance can be demonstrated**; (iii) the exemption is **untested**, which is the cheapest hardening available and needs no UI authority (a server-side test that the macro route's response is identical whatever the settings service holds) — listed as a *post-decision* item, not done here.

**6.5 The integration constraint any option must respect.** `App.test.tsx` (from `CV-41`) asserts that **every rendered nav href resolves to a built surface**, and `navigation.ts` uses `groupOnly` headings for non-built destinations. So a nav entry such as `L-B`'s `status: 'implemented'` for `/research/macro` can only be added **together with** the mounted view; adding it first turns a green suite red. This is a real sequencing dependency, not a stylistic note.

**6.6 What the two fenced client one-liners do to the options.** Carrying the transport `code` through `getJson` (defect 1) is *required* by Options A/B/D if the view is to map errors as `L-B` does — its UI branches on `error.code`. Passing `deps` at the mount (defect 2) is what makes an exemption test (§6.4(iii)) and a route-level view test writable without a live provider. Both sit inside `DT-15`'s barred surface, so the gate that opens the view should decide them **once**, together with the disclosure shape — that is why they stay queued in §16.17.4 rather than being "helpfully" fixed now.

---

## 7. Options — evaluated, none implemented

| | **A — port & adapt `L-B` rendering** | **B — adapt the `L-C` disclosure component** | **C — adopt `L-E`'s D91 markup** | **D — fresh minimal component** | **E — explicit deferral, recorded** |
|---|---|---|---|---|---|
| What it would take | Port header/selector/provenance/fallback-free rendering; **drop** `authFetch`→`noAuthFetch`, `keycloakAdapter`, `admin-transport`, `createReadExecutor`, `guardRead`; retarget `GET /api/macro?dataset=`→`/api/macro/{dataset}`; remap 422/422/502/503→400/404/405/502; add IIP two-step (`selection` then `subcategoryCode`), which `L-B` never had; strip "certified" claims; re-derive all 18 client tests | Correct the provider string to DT-1 verbatim; keep DT-2 labels + IIP granularity + `data-testid`/`aria` structure; mount it inside a view; add tests for each DT item | Take the `<div>` + its two jsdom tests, after re-hosting `L-B`'s entire dependency-divergent lineage | Build a small provider/dataset disclosure + exemption notice against main's real client; add a view, a route and a nav entry together | Record that the obligation attaches at view-creation, name the contract and the reusable assets, and take no code action |
| Compatibility with operative acts | **Poor to moderate** — contradicts the NO-AUTH decision as-is; needs a DT-7/DT-8 audit of its own copy | **Good** — it *is* the D89 contract's shape; DT-1 string must change; no auth, no licence language | **Moderate** — satisfies D91 §1's *notice*, says nothing about DT-1…DT-8; and it comes from the corpus designated read-only-source | **Best** on compliance, worst on effort | **Fully compatible** — nothing is implemented, so `DT-15` is untouched; consistent with "DEFERRED ≠ ABANDONED" |
| Authority prerequisites | D89 gate + a PA note that OIDC-gated lineage is being replaced, not revived | D89 gate (implementation authority for `MacroContext`/components/tests) | D89 gate **and** a prior Q2 ruling on cross-corpus effect | D89 gate (+ `CV-20`/`CV-22` only if data shown is to be decided there) | None to *record*; a re-opening decision when a view is authorised |
| Reusable assets | `FreshnessBadge`, `EmptyState` (both already on `main`) | `main`'s `MacroDataset`, `MACRO_DATASETS`, `MACRO_ROUTE`, label types | as A | as A/B | none needed |
| Dependencies to add | none admissible; would require reviving removed modules (**rejected**) | none | none | none | none |
| Main risks | resurrecting a superseded architecture; silent authority creep via an unmerged branch; DT-7/DT-8 exposure; a 404-producing nav entry if sequencing is wrong | leaving an unmounted component that *looks* compliant while nothing is shown to the user — mitigated by keeping it inside the gate's single act | **promoting an IPD-branch claim as an IRR discharge** (the exact failure `XV-16` warns about); inherits A's costs | scope drift into a "screen", which is what the gate exists to prevent | the obligation being forgotten; mitigated by this packet + tracker `CV-53` remaining `BLOCKED (authority)` |
| Unresolved facts it depends on | whether "certified" wording is permissible at all | none beyond the gate | Q2/Q3 ruling | whether the view also settles `CV-20`/`CV-22` data selection | none |
| Minimum post-authorisation work | A full port + 18 rewritten tests + contract conformance + route/nav/live-proof | component adopted with corrected copy + view mount + DT-1…DT-8 test each + `code` passthrough fix | A's work, plus the notice | component + view + route + nav + tests, all fresh | none; add the §6.4(iii) exemption test later under its own authority |
| Required proof | hosted CI green **and** a browser-visible record **and** live-source confirmation on an egress machine (runbook §5.1) — never CI alone | same | same, plus a written Q2 ruling in IRR's corpus | same | a dated `§5` change-log line + `CV-53` note; no proof beyond the record |
| Admissible now? | **No** (gate) | **No** (gate) | **No** (gate + Q2) | **No** (gate) | **Yes — this packet is that instrument; the act is the PA's** |

---

## 8. Recommendation (not an authorisation)

**Recommend: E now, B as the shape when the gate opens; reject A and C as primary routes; keep D as the fallback if B's author is unwilling to inherit a branch component.**

Reasoning from the evidence: only **E** is executable without an authority act, and it costs nothing but a dated record — while the thing it defers (a rendered view) does not exist, so no compliance can be demonstrated by *any* option until the gate opens (**DT-1** is conditional on a view; **D91 §1** likewise). **B** is the only candidate whose dependencies already exist on `main`, that never touched auth, and that was written *for* D89 with the correct dataset labels and granularity; its single substantive defect — the non-conforming provider string — is fixed by adopting DT-1's wording verbatim rather than by engineering. **A** carries an architecture the PA has since abolished and copy that flirts with DT-7/DT-8; **C** would import a cross-corpus delivery claim whose own text disclaims runtime qualification and whose subject matter is the *other* disclosure. If the PA prefers a clean line, **D** achieves the same compliance with more work. Whichever route: the nav entry, the mounted view and `App.test.tsx` must land in one change (§6.5); the two client one-liners should be decided once, in the same act (§6.6); and the `XV-16` ruling should be recorded in IRR's corpus so a future reader cannot mistake an IPD branch note for a discharge.

---

## 9. Risks, limits and unresolved items

| # | Item | State |
|---|---|---|
| R1 | Treating CI, a packet, a branch or a test count as qualification/admission | prevented: every rung kept distinct here; `main` unmutated in both repositories |
| R2 | **Live-source reachability remains unverified in this environment** (no egress; every read → `502 RETRY_BUDGET_EXHAUSTED`, zero observations; no synthetic substitute offered, per D91's fallback prohibition) | **UNRESOLVED** — operator step on an egress machine |
| R3 | `XV-15`: IPD `ui13_macro_vintage_tracker.ts:39` stamps `sourceClassification:'REAL'` over a placeholder `lineageDigest` | **OPEN**, IPD owner's; MD-5 (L-F) cited; **not** to be read as certified lineage |
| R4 | `XV-16` | **UNRESOLVED — decision requested** (Q2/Q3). The conflict is preserved, not smoothed: neither corpus's reading is promoted |
| R5 | M-3 provenance **NOT ESTABLISHED**; attribution **NOT DETERMINED**; entitlement **B**; external MoSPI contact **NOT GRANTED** | unchanged; none of A–E can cure them |
| R6 | Windows evidence covers **three files at one commit**; the untracked Windows material (reconstruction docs, P15 evidence, an E2E backup dir) exists on no ref | **out of reach** — recorded as a gap; it is not evidence about the repositories |
| R7 | Blob-level reconciliation is **not** source review of the Windows working copy | stated; decision-critical content was read from Git blobs here |
| R8 | `CV-38` (three-file restart-proof port), `CV-32`, `CV-43`, `CV-35`, `CV-36`, IPD CI | **separate**; each still behind its own decision (`CV-24`, product-owner, PA scope act, IPD admission). Not touched here |

---

## 10. Scope and non-scope

**In scope, and done:** repository-wide discovery and reconciliation; the Windows evidence reconciliation; the obligation reading; the option evaluation; this packet; the additive tracker entries (§16.21, `V32`–`V33`, `XV-16` disposition note, `§5` change-log row).

**Out of scope, deliberately not done:** any Macro UI implementation or any application-code change; any edit to `MacroContext.tsx`, `src/api/macro.ts`, transports or source adapters; any change to D88/D89/D91 or any other governed act; granting or assuming `D91/D88_MACRO_RELIEF`; resolving `XV-16` by inference; any synthetic fallback or weakening of LIVE-only; opportunistic repair of the fenced client defects; the `CV-38` port; merging PR #98; writing to either `main`; any inference of qualification, admission, activation or production readiness. **No approval, signature or PA decision is recorded in this document, because none has been made.**

---

## 11. The decision required

Answer in one act (or three short ones), recorded in **IRR `docs/integration/`** per C-1:

1. **Q1 — disposition:** *Which option, A / B / C / D / E?* If any of A–D: grant the **D89 UI-DISCLOSURE IMPLEMENTATION AUTHORITY GATE**, naming (i) the files, (ii) DT-1…DT-8 conformance requirements incl. the exact DT-1 string, (iii) the IIP two-step contract, (iv) that the nav entry + view + tests land together, (v) the fate of the two client one-liners, and (vi) that a `CV-20`/`CV-22` data-selection question is or is not part of it.
2. **Q1' — if E:** confirm the recorded wording: "the disclosure obligation attaches to a rendered Macro surface; none exists; `CV-53` remains `BLOCKED (authority)`; the contract and the reusable assets are pre-fixed here so the later gate is a decision, not a discovery task."
3. **Q2/Q3 — `XV-16`:** state whether IPD-corpus D91 records can modify, preserve or withdraw an IRR obligation, and record the D91 §1 notice as **preserved-conditional** / **withdrawn** / **modified**. If UI12 participation is to change, direct that a §9/§10-conforming **D91 Relief Request** be filed (see Appendix A) — D88 cannot originate it.

Nothing else can move this item, and no further investigation is required to decide it.

---

## Appendix A — readiness against the D91 mechanism's own gates

*Included so that the PA can act without a second round of discovery. This is a **conformance note**, not a submitted request: no relief is sought, and §6.4 explains why none is presently needed.*

**§9 request elements:** 1 precise provision (D91 §1 notice; and/or §7.1(1)–(3)) — *available*; 2 affected UI12 dimension — *identifiable, but §6.4 shows no live engagement*; 3 affected surface/behaviour — *`MacroContext.tsx`, no view today*; 4 rationale — *only needed if participation changes*; 5 scope, 6 duration, 7 conditions, 10 effective period — **PA's to set**; 9 requester + standing basis — **PA's**; 8 evidence → below.

**§10 evidence items:** 1 provision cited to its durable artifact — *met* (`727bdcb` for the constraint + disclosure act; D91 relief/competence acts at `b607ea9`, `2dc5563`); 2 within the UI12 data-mode dimension — *assessed, negative today* (§6.4); 3 WP-MACRO-03 compatibility vs §16.1's eight constraints — *assessed: all eight preserved by every option, since none alters source, dataset, vintage, provenance or transport*; 4 no SNAPSHOT fallback introduced or implied — *met* (main's transport forbids it in text and behaviour; `L-B`/`L-E` add none); 5 NAS/CPI/IIP boundary unaffected — *met*; 6 provenance requirements unaffected — *met* (candidate dimensions only, `M-3` not asserted); 7 `guardRead('macro')` server-side governance unaffected — **requires the PA's express statement**, because main's read gate is now the credential-free owner-context carrier rather than `guardRead`; 8 impact statement — *this §6*; 9 standing evidence — **PA's**; 10 Stage 1 record — *not conducted*.

**Net:** items 7, 9 and the PA-owned fields are the only gaps — i.e. a determination is *one short act away* if the PA ever wants it, and *unnecessary* for the current state.

---

## Appendix B — publication and verification record

| Field | Value |
|---|---|
| Packet path | `docs/integration/NP-08-D08-MACRO-DISCLOSURE-XV16-PA-DECISION-PACKET-2026-10-14.md` (IRR) |
| Branch / commit | `arena/ee3fd321-iips-review-recovered` @ `1191bd0` — tracker `§5` row `CHG-2026-10-14-18`; packet added by that commit (`docs` +230 lines), Appendix B filled by the immediately following verification commit |
| PR | **#98** — `state=OPEN`, `mergedAt=null` (**NOT MERGED**), `mergeable=MERGEABLE`, 15 commits, same branch; no competing PR opened |
| Tracker | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` — `## 16.21`, `V32`–`V33` (V-count 31→33), `XV-16` disposition note, `CV-53` evidence note, `§19` row, `§5` change-log row; **zero status-group movement** |
| CI proof | every commit of this packet was CI-verified on push — `1191bd0` → run `38616300228`, `89f1e7d` → `38616613155`, `6b695a4` → `38616879945`; each `CI` / `Typecheck · Test · Build`, **`conclusion=success`, 11/11 steps success, 0 skipped**: checkout of the exact commit → Node 22/npm 10 → lockfile install → typecheck → full Vitest suite → non-zero-passing assertion → production build. Note for accuracy: this workflow has **no** licence-gate or live-gate step, and it exercises `main`'s **admitted** macro tests — it never builds the `L-B`/`L-E` files, so a green run says nothing about the candidates in §7 |
| Ref state after publication | IRR `main` `1b2b194` **unchanged** · IPD `main` `4d3e1cd` **unchanged** (both read via `git ls-remote` / the refs API) · `phase13-next` `4357e14a` unchanged · working tree clean · local `HEAD` == `refs/heads/arena/…` |
| Byte verification | `sha256` of the local file vs the contents API at `1191bd0`: packet `d52abbb1c2ca…` **MATCH**; tracker `3f48444b0126…` **MATCH** |
| Evidence classes | **Arena-observed repository evidence** (blobs, refs, commits, act texts, CI) vs **user-supplied Windows capture** (§4 left column) — kept distinct; the byte-identity bridge between them is the digest reproduction in §4 |
| Status | **PENDING DECISION** — published for decision, not decided |
