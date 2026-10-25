# IIPS v3.0 — Reports CV-21 / DQ-7a Program Authority Disposition: A2 — Deferral Reaffirmed

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-CV21-DQ7A-A2-PA-DISPOSITION-2026-10-25-01` |
| **Existing work items** | `CV-21` (disposed by this act); `DQ-7a` (answered by this act); `REG-11` (Option C retained). No new CV, REG, or AD identifier is created. |
| **Decision** | **A2 — REAFFIRM THE EXISTING REPORTS DEFERRAL** |
| **Decision-maker** | Program Authority (PA) — Ramki |
| **Decision date** | `2026-10-25` (Asia/Calcutta) — actual date; not backdated |
| **Decision source** | The PA's explicit approved direction of 2026-10-25 executing the A2 disposition prepared in the cross-repository reconciliation (`docs/integration/NP06-REPORTS-CROSS-REPOSITORY-RECONCILIATION-2026-10-24.md` §12/A2), against `DQ-7a` of the CAP-03 PA decision packet (PROPOSED packet, tracker §16.97) |
| **Recording agent** | Arena Agent Mode — recording, publication, and verification support only. **No authority is rendered by the agent.** The disposition below is recorded without addition, narrowing, or reinterpretation. |
| **Governing locus** | IRR `ramkivs/iips-review-recovered` only; IPD is not modified |
| **IRR baseline verified before preparation** | `main@c0fbfb7c1d055bfdc87b1d82643d0accd22b4675` (tree `5ff741eae8ee639c65d9bd3718c9f9dfb98b2c01`; merge of PR #250); `0` open PRs |
| **Tracker registration** | Master tracker §16.106 (`CV-CORR-88`, `CHG-2026-10-25-01`); verification rows `V577`–`V584`; §2 `REG-11` dated annotation; §16.4.2 `CV-21` row; §16.12 counts; §19 Reports row |
| **Effectiveness** | Effective upon durable publication to `refs/heads/main` and independent remote read-back, per program convention; the publication receipt is recorded post-merge at §16.106 (anti-self-embedding rule §16.70.13). Until then, the operative state is unchanged — which is itself the deferral this act reaffirms. |

> **Rendered PA decision — CV-21 / DQ-7a: A2 — REAFFIRM THE EXISTING REPORTS DEFERRAL.**
>
> The existing `REG-11` **Option C — RETAIN DEFERRAL** disposition (`IIPS-V3-REG11-GATE-B-R1-R2-OPTION-C-PA-DECISION-2026-10-13-01`) is reaffirmed and remains effective. Reports remains outside the currently admitted product capability. This disposition does **not** commission Reports, does **not** make the A1 v1 product-scope exclusion decision, does **not** authorize implementation, does **not** admit the historical NP-06 branch or any lineage to current `main`, and **does not** resolve, satisfy, waive, or render unnecessary any outstanding requirement.

---

## 1. Decision

1. **Reports deferral is reaffirmed.** `REG-11` / Gate B / R1–R2 remains **OPTION C — RETAIN DEFERRAL**. No part of the 2026-10-13 disposition is amended, narrowed, or reopened by this act; its §2 points (1)–(10) stand verbatim.
2. **DQ-7a is answered (i), second limb: reaffirm the Option C deferral.** The alternative limbs — (i) first limb, recording Reports *out of the v1 product surface* (A1), and (ii) commissioning Reports (B) — are **not** selected and not decided. In particular, this act makes **no** v1 product-scope determination: deferral reaffirmed is not exclusion from v1, and it is not commissioning.
3. **CV-21 is closed as a disposition item by this dated PA act** — closed *by disposition*, in exactly the sense of the register's existing closed-by-disposition group (CV-23, CV-43): the decision CV-21 waited for has been rendered, and the answer is *defer*. This closure is **not** a capability completion, qualification, acceptance, or admission of any kind. No Reports capability exists on current `main` by virtue of this act.
4. **Re-entry requires a separate explicit PA decision.** Any future commissioning of Reports must be rendered as its own act, after which the established serial gates apply in order (ownership source `R1` → contract shape `R2` → dependency/consumer admission `R3` → bounded implementation authority → `F-7` qualification → acceptance → `CV-51` route/UI authorization), as set out in the reconciliation report §12/B. Nothing in this act pre-approves, schedules, or eases any of those gates.

## 2. Status treatment (each preserved exactly; none resolved)

| Item | Status after this act | Basis preserved |
|---|---|---|
| `REG-11` Option C | **EFFECTIVE — RETAIN DEFERRAL** (reaffirmed, unamended) | Option C record §§2–6 (2026-10-13) |
| `CV-21` / `DQ-7a` | **CLOSED BY THIS DATED PA DISPOSITION** (A2) — disposition closure only | This record §1(2)–(3) |
| `R1` (ownership-source authority) | **DEFERRED** — R1.1 remains NOT ESTABLISHED; no candidate instrument created or named | Option C §2(1)–(5), §3 |
| `R2` (owner-binding contract shape) | **DEFERRED** — shape C (retain deferral) stands; no declaration, value act, or D-2 §8 contract approved | Option C §2(4)–(5), §3 |
| `R3` (pin/consumer admission) | **OPEN / NOT ADMITTED** — object as re-derived at §16.105 against the carried pin `2d9130e7…`, which declares no `./persistence` export; no IPD act, re-pin, or consumer admission authorized | Option C §2(6); §16.105 §2.3 |
| `F-7` (Reports qualification) | **NOT SATISFIED** — parts 1/2/4 unproven for any current-baseline contract; the committed reproducible separate-process restart harness F-7(4) requires does not exist | F-7 five-part bar; Gate B investigation §6.3 |
| Implementation authority | **NOT GRANTED / NOT AUTHORIZED** — historical NP-06-R1 remains spent and branch-scoped; no new authority is created | Option C §§5–6 |
| `CV-51` (route/UI enablement) | **BLOCKED** — no `/reports` mount, no Reports UI, no route activation; the `503` fence is retained | Tracker §16.4.4 |
| `CV-43` / `D115` | **CLOSED — RETAINED UNWIRED** (unchanged; wiring remains **PROHIBITED**; no Company Identity Authority designated) | PA disposition 2026-10-24 (§16.103) |
| Reports implementation / runtime surfaces | **Absent / unadmitted** on current `main`: no `frontend/server/reports/` domain; `/api/reports*` routed only to the fail-closed fence (known routes → `503 owner-context-unavailable`; bare/unknown → `404`; wrong method → `405`; source/test-definition level, per §16.105 `V576` baseline) | Tracker §§8–14; §16.105 §6 |

No deferred or open requirement in this table is claimed resolved, satisfied, waived, or unnecessary. The distinction between the *disposition* (now rendered) and each downstream *requirement* (each untouched) is the substance of this act.

## 3. The CV-21 / PKG-03 contradiction — resolved operatively, preserved as provenance

**The inconsistency of record.** Three loci previously disagreed on whether CV-21 had been answered:

1. **The register** (§16.4.2, §19) carried CV-21 as **DECISION REQUIRED**, with the smallest next action "one act: (i) out of v1, or (ii) commission, or (iii) keep deferral as-is" and completion criteria "an explicit, dated PA disposition recorded in §2 `REG-11`."
2. **The PKG-03 execution record** (`docs/integration/2026-10-19/PKG-03-REPORTS-SEQUENTIAL-EXECUTION-RECORD.md` §2, PR #150) declared "CV-21 is closed as a disposition task" on the basis of the pre-existing Option C — while §5 of the *same record* stated tracker reconciliation was interrupted and **not** included.
3. **The CAP-03 DQ packet** (§16.97; PROPOSED — NOT EFFECTIVE) continued to pose `DQ-7a` as unanswered, with a blank answer sheet.

Tracker §16.105 (§B-7) recorded this conflict and deliberately did not resolve it in either direction: under the program's own rule, an execution record does not move a register, so CV-21 stayed open.

**Operative resolution by this act.** The completion criterion in locus (1) is now met by an instrument of the required kind: *this* explicit, dated PA disposition, recorded in §2 `REG-11` (by dated annotation) and at §16.4.2/§16.106, rendering the (iii) answer — *keep deferral*. The register is therefore reconciled to **CV-21 CLOSED BY DATED PA DISPOSITION (A2)** with exactly one register-group movement (decision-required `2→1`; closed-by-disposition `4→5`; active outstanding `7→6`; total `35` unchanged).

**What this resolution does not do.** It does not retroactively validate locus (2)'s reasoning: Option C (2026-10-13) answered R1/R2 deferral; it did not answer DQ-7a's v1-surface question, and D-3-era acceptance never spoke to current-baseline admission. Locus (2)'s closure claim is superseded as the operative basis, not erased: the PKG-03 record's original text is preserved unamended, and the now-governing basis is this 2026-10-25 act. Likewise `DQ-7a` is answered by this act, not by editing the PROPOSED packet, whose answer sheet and recommendation remain as published. The historical inconsistency remains visible as provenance in all three loci.

## 4. Historical NP-06 evidence — preserved scope and reuse policy

The cross-repository reconciliation published with this act ([`NP06-REPORTS-CROSS-REPOSITORY-RECONCILIATION-2026-10-24.md`](NP06-REPORTS-CROSS-REPOSITORY-RECONCILIATION-2026-10-24.md)) establishes, from full-history all-branch inspection of both repositories (203 IRR + 82 IPD branch tips; 248 + 84 PRs scanned):

- NP-06 Reports **was implemented and qualified** at IRR `39dd43eb…` (tree `3fdc29d6…`) on `arena/01a0f1b3-iips-review-recovered` (tip `6a8afbb2…`, unchanged; not an ancestor of `main`): **32/32** requirements, **228/228** tracked tests, **14/14** `reportKey` golden vectors (NP-06-R2, 2026-10-02), accepted **branch-only** by D-3 (PR #40, 2026-10-06) with restart/live-IdP fenced as conditional/unproven.
- It reached `main` only via the unauthorized IRR PR #42 merge (`47edf6f3…`, 2026-10-06) and was removed by the PA-approved R4-B remediation (`20511502…`, PR #81, 2026-10-13); the global no-auth transition (PRs #61/#68, 2026-10-12) removed the authenticated-principal stack the qualification exercised.
- The carried IPD pin (`2d9130e7…`) declares **no `./persistence`** export and contains no NP-04 artifact store; the conforming store exists only on the diverged, reference-only NP-04 line `2e11fa3b…` (with the recorded correction that the "build emits only pit+d114" finding applies to the *current* pin — at `2e11fa3b…` the package build includes `src/persistence/package.ts`).
- The separate-process restart harness behind historical requirement 32 was **never committed**; that result is preserved as historical report-grade evidence and **cannot** be reused as current F-7(4) proof.

**Reuse policy recorded by this act:** (1) do not rebuild NP-06 from scratch and do not rerun the full historical qualification to reproduce recorded results; (2) reuse historical artifacts and results as evidence *for their original branch/tree, pin, and security model*, with applicability stated; (3) never treat them as proof of current-main admission, present-day (no-auth/F-3) security compliance, or F-7 completion; (4) F-7(4) may only ever be claimed on a committed reproducible harness executed against the then-current baseline and owner contract; (5) if Reports is ever commissioned by a separate PA act, scope new work to the then-authorized design and only the proofs that cannot validly be reused (reconciliation report §§9–10, §12/B).

A2 neither deletes nor deprecates the qualified branch, the 41 carrier branch tips holding the identical qualified domain blob, or the IPD NP-04 reference line; they remain citable historical evidence. Branch hygiene, if ever wanted, is a separate administrative act not authorized here.

## 5. Explicit non-authorizations

This act does **not**, and may not be read to: select A1 or B; exclude Reports from, or include Reports in, any v1 product-scope set; commission Reports in any form; grant or restore implementation authority (NP-06-R1 is not revived); restore, port, merge, or cherry-pick `arena/01a0f1b3…`, `promotion/governed-reports-candidate` (`4906a6b7…`/`47edf6f3…`), or IPD `np04-governed-persistence-windows`; admit the `./persistence` subpath, any pin, package, or consumer; change any dependency pin, lockfile, export map, or IPD object; satisfy or waive `R1`, `R2`, `R3`, or any part of `F-7`; create any ownership declaration, value act, D-2 §8 contract, identifier, or F-2/F-3 aliasing; lift, edit, or retire the `503` fence (blob `98147054…`) or any governed fence blob; enable `/api/reports`, `/reports`, navigation, or any UI; wire `D115`/`CV-43` or designate a Company Identity Authority; ratify IRR PR #42 or create retrospective authorization; amend Option C, D-1/D-2/D-3, AD-20, F-1…F-7, the PKG-03 records, the DQ packet, or any historical record's original text; claim qualification, acceptance, admission, promotion, production eligibility, or any live-deployment behavior.

## 6. Publication and verification

- **Changed paths (exactly three, all documentation):** this record (new); the reconciliation report published durably at `docs/integration/NP06-REPORTS-CROSS-REPOSITORY-RECONCILIATION-2026-10-24.md` (the 2026-10-24 workpaper, 371 lines, 15 sections preserved; the only edits are its dated publication overlay — header status, §13 supersession note, and footer — recording that durable publication was directed by this act; no evidence, conclusion, identifier, limitation, or provenance text is altered); and the master tracker (header row, §2 `REG-11` dated annotation, §5 `CHG-2026-10-25-01`, §16.4.2 `CV-21` row, §16.4.4 `CV-51` dated dependency note, §16.12 dated update + count cells, §19 Reports-row dated annotation, new §16.106).
- **Protected objects verified byte-identical at the change head:** fences `98147054…` / `51704c12…` / `cb8db45d…`; manifests `6274537a…` / `05ade78c…` (pins `2d9130e7…` / `70b24f02…`, no re-pin); `d115-runtime` `d9b546c9…` / `51bd4f68…`. Zero IPD mutations; zero code/test/route/runtime changes.
- **Verification:** tracker §16.106 rows `V577`–`V584`. PR number, merge commit, CI runs, and remote blob digests are established from the remote and recorded in the §16.106 publication receipt (anti-self-embedding rule §16.70.13); they are not asserted here.
- **Not performed:** no application feature test, live HTTP probe, database or environment read, Windows/PowerShell execution, deployment probe, or historical-suite rerun. Route behavior statements are source/test-definition level against the recorded §16.105 `V576` baseline.

---

*Recording agent: Arena Agent Mode — recording, publication, and verification support only; no authority rendered. Program Authority: Ramki. **Decision: A2 — REAFFIRM THE EXISTING REPORTS DEFERRAL (`REG-11` Option C retained).** Decision date 2026-10-25 (Asia/Calcutta), recorded on its actual date. Prepared against IRR `main@c0fbfb7c…`; IPD read-only at `main@4b5c65a7…`.*
