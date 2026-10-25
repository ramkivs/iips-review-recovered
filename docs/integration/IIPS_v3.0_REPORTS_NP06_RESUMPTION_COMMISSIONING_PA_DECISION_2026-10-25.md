# IIPS v3.0 — Reports NP-06 Resumption Commissioning: Program Authority Decision

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01` |
| **Existing work items** | `REG-11` (Option C preserved, not rewritten); `CV-21` / `DQ-7a` (remain closed by the A2 disposition; not reopened); `CV-51` (remains **BLOCKED**). No new CV, REG, or AD identifier is created. Tracker registration is `CV-CORR-89` / §16.107. |
| **Decision** | **COMMISSION bounded non-production resumption of NP-06 Reports.** This is not production admission, not deployment authority, and not final acceptance. |
| **Decision-maker** | Program Authority (PA) — Ramki |
| **Decision date** | `2026-10-25` (Asia/Calcutta) — actual date; not backdated |
| **Decision source** | The PA's explicit instruction of 2026-10-25, which is the separate commissioning act required by A2. That instruction is recorded here without addition, narrowing, or reinterpretation of A2 or of `REG-11` Option C. |
| **Recording agent** | Arena Agent Mode — recording, publication, and bounded execution support. **No authority is rendered by the agent.** |
| **Governing locus** | IRR `ramkivs/iips-review-recovered` only. IPD is not modified. |
| **IRR baseline at authoring** | Working branch `arena/46addf6b-iips-review-recovered`, then equal to `origin/main` `00eda5b390f18408689bf9cb632ce76a02093ac8` (tree `4aa8fa7426b1368dabdb2b196771a321d415b6e8`; merge of PR #253). This is a **branch-qualified baseline for this record**, not an admission of any historical Reports branch to `main`. |
| **IPD baseline re-verified read-only** | `main@4b5c65a731a66a6fa1260146a55df9ed772953a5` (tree `cf5e85856009360de3ffb9614970c383a26d73ba`; `2026-10-24T17:53:33Z`). **0** open IPD PRs. |
| **Tracker registration** | Master tracker §16.107 (`CV-CORR-89`, `CHG-2026-10-25-03`); dated annotations on §2 `REG-11`, §16.4.2 `CV-21`, §16.4.4 `CV-51`, §16.12, and §19 Reports. Verification rows `V585`–`V594`. |
| **Companion execution record** | [`IIPS_v3.0_REPORTS_NP06_RESUMPTION_EXECUTION_RECORD_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_RESUMPTION_EXECUTION_RECORD_2026-10-25.md) (`IIPS-V3-REPORTS-NP06-RESUMPTION-EXECUTION-2026-10-25-01`). The execution record reports what this commissioning permitted and what it did not discharge. It is not a second decision. |
| **Effectiveness** | The PA instruction is the act. This file is its durable transcription. It is effective as a register instrument upon publication to `refs/heads/main` and independent remote read-back, per program convention (§16.70.13). Until that publication, the operative register on `main` remains the A2 deferral. Publication coordinates are not self-embedded in this record. |

> **Rendered PA decision — NP-06 Reports: COMMISSION bounded non-production resumption.**
>
> A2 (`IIPS-V3-REPORTS-CV21-DQ7A-A2-PA-DISPOSITION-2026-10-25-01`) and `REG-11` **Option C — RETAIN DEFERRAL** are preserved and are not rewritten as invalid. This act is the separate explicit commissioning A2 required. It authorizes bounded non-production investigation, integration, implementation, testing, and qualification **within existing scope**. It does **not** admit Reports to production, does **not** authorize deployment, does **not** grant final acceptance, and does **not** discharge `R1`, `R2`, `R3`, `F-7`, or `CV-51`.

---

## 1. What this act is, and what it is not

1. **This is the separate PA commissioning act A2 required.** A2 §1(4) held that any future commissioning of Reports must be its own act, after which the established gates still apply in order. The 2026-10-25 instruction is that act. It is recorded here. It does not amend A2's original text, and it does not describe the 2026-10-13 deferral, or the 2026-10-25 reaffirmation of that deferral, as invalid, mistaken, or withdrawn.
2. **`REG-11` Option C remains the historical and still-operative deferral of the unbound owner contract.** Option C's §2 points (1)–(10) are not amended. In particular, this act does **not** establish an ownership-source authority, does **not** approve a D-2 §8 contract, does **not** alias the F-3 owner pair into Reports `(tenantId, userId)`, and does **not** admit a pin or consumer.
3. **`CV-21` / `DQ-7a` stay closed by the A2 disposition.** That closure remains a disposition closure, not a capability completion. This commissioning does not reopen `CV-21` and does not convert that closure into qualification, acceptance, or admission.
4. **Commissioning is not production admission, deployment, or final acceptance.** Those remain separate acts. A green unit test, a branch qualification, or publication of this record does not make Reports production-ready.
5. **The historically implemented baseline is acknowledged, not admitted.** Auth-era NP-06 was implemented and D-3-accepted **branch-only** at IRR `39dd43ebbd54767c4258513a5dfc2d9c1b861d28` (tree `3fdc29d6775022c8ea586c58cf9a6f0e613911d6`) on `arena/01a0f1b3-iips-review-recovered`, tip `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b`. That tip is not an ancestor of current `main`. Historical qualification counts (32/32, 228/228, 14/14) remain source-reported evidence for that branch, pin, and security model. They are not proof of current-`main` admission, and a missing artifact or pin mismatch is not proof that the historical work was defective.

## 2. Authority granted

Within existing NP-06 scope, and only as non-production work on an authorized IRR branch, this act authorizes:

1. Investigation of the historical implementation, the current tree, and the current IPD pin and export map, using remote objects rather than recollection.
2. Reuse of historically compatible implementation where it does not require an unsatisfied gate, a new persistence architecture, or a silent contract change. Compatible modules are restored byte-identical. Incompatible modules are not rebuilt from scratch to force a fit.
3. Bounded implementation and integration that does not invent an owner, a contract, or a semantic rule, and that does not expose a partial Reports capability on an active route.
4. Testing and qualification evidence for the work actually restored, recorded as what was executed. Historical counts are not re-labeled as fresh results.
5. Additive tracker registration that keeps historical implementation, current implementation, dependency integration, qualification, governance authorization, capability acceptance, and production admission as **separate statuses**.
6. Publication through the ordinary review path: working branch, focused commit, pull request, CI, merge when permitted, and independent remote verification.

Work that does not depend on a further PA decision proceeds in the same pass. Work that does depend on one is named in §4 and is not performed.

## 3. Authority not granted

This act does **not**, and may not be read to:

- amend, narrow, or invalidate A2, Option C, D-1, D-2, D-3, `CV-23`, or any historical record's original text;
- establish `R1`, approve an `R2` contract shape, or create a D-2 §8 contract, ownership declaration, value act, identifier, or F-2/F-3 alias;
- admit `R3`, re-pin `frontend/package.json` or the lockfile, add or remove an IPD export, merge or cherry-pick NP-04 `2e11fa3b…` or G24 `6828155e…`, or replace Gate 3 `src/persistence/*`;
- reopen Gate A. `CV-23` (`IIPS-V3-CV23-GATE-A-NOT-REQUIRED-PA-DISPOSITION-2026-10-24-01`) remains in force: no merge, cherry-pick, rebase, promotion, re-pin, branch deletion, or package-export addition is authorized by that record, and this commissioning does not supply the later express convergence act `CV-23` §5 requires;
- lift, edit, or retire the Reports HTTP fence (blob `981470541812a64c733309f1debec75455d85bee`) or any other governed fence blob;
- mount `/reports`, enable a Reports UI, or satisfy `CV-51`;
- treat unit tests or historical branch qualification as `F-7` satisfaction, capability acceptance, or production readiness;
- authorize production deployment, production admission, `durable:true`, or any live-deployment claim;
- delete historical evidence or decision records;
- mutate IPD.

The HTTP 503 fence stays until a replacement has passed both authorization and qualification. A partially integrated domain must not be exposed through active routes.

## 4. Further Principal decisions this act does not render

These remain open. Each is named so later work cannot treat silence as approval.

| Decision still required | Why this act does not render it | What may proceed without it |
|---|---|---|
| **R1 — Reports ownership-source act.** A dated PA act that either designates a located instrument as the Reports ownership source and states the semantic mapping from the current no-auth F-3 carrier, or creates that source. No such instrument was located on current `main`. Historical branch R2/C4 (`(tenantId, userId)` at tip `6a8afbb2…`) is authenticated and branch-scoped; it does not supply a no-auth owner source. | Option C §2(1)–(5) and this instruction both forbid inventing an owner, a contract, or a semantic rule, and forbid aliasing F-3 `OwnerContext` to NP-04 `AuthenticatedOwner`. | Domain modules that take an already-authenticated principal as an input and do not select or infer that principal. |
| **R2 — current-baseline contract-shape act.** After R1, a dated PA act approving the owner-binding contract shape for the no-auth baseline, covering the unresolved D-2 §8 elements. | The historical authenticated transport (`cdee7ed1…` on the qualified tree) cannot be restored onto the no-auth tree without that act. | No transport restoration. The fence remains the only HTTP behavior. |
| **R3 — persistence consumer-admission act.** A dated PA act that either (a) authorizes an IRR-only adapter plus an explicit specifier amendment that does not replace Gate 3 `src/persistence/*` and does not drop `./portfolio-ui`, `./pit`, or `./d114-non-production`, or (b) authorizes an IPD package act that keeps those three exports while publishing the historical governed store, with the migration-ledger reconciliation and re-pin path `CV-23` §5 requires. | Current pin `#2d9130e76bb0dc89daeefabaf297e27bdaa84250` declares no `./persistence` export. Pin `#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` exports `./persistence` and does not export `./portfolio-ui`; it is diverged from IPD `main`. Re-pinning, an export-map edit, or a silent specifier alias would be a contract or architecture change this act does not grant. A pin mismatch is a governance mismatch, not evidence that the historical store was defective. | No persistence module, no `./persistence` import, no pin or lockfile change. |
| **F-7 — current-baseline qualification, including a committed separate-process restart harness.** | Historical requirement 32 was reported and acceptance-fenced as unproven because the harness was never committed. Unit tests of restored modules are not the five-part F-7 bar. | Record the tests that were actually executed. Do not claim F-7. |
| **CV-51 — route and UI authorization.** | UI, navigation, and fence replacement require F-7 and acceptance first, then this separate act. | No UI, no route mount, no fence edit. |
| **Capability acceptance, then production admission.** | Distinct from commissioning. D-3 acceptance was branch-only and is not transferred. | Do not mark Reports accepted, admitted, or production-ready. |

## 5. Statuses this act distinguishes

| Status | After this act, before execution evidence is registered | After the companion execution record |
|---|---|---|
| Historical implementation | **IMPLEMENTED, branch-qualified, D-3-accepted branch-only** at `39dd43eb…` / tip `6a8afbb2…`. Not on current `main` by this act. | Unchanged. Not re-labeled as a current-`main` implementation. |
| Current implementation | Not yet moved by the decision text alone. | See the execution record. Domain restoration, if performed, is not a complete Reports capability. |
| Dependency integration | **NOT INTEGRATED.** `R2` unbound. `R3` not admitted. | Unchanged unless a later act discharges `R3`. |
| Qualification | **NOT QUALIFIED** on the current baseline. Historical counts remain source-reported. | Fresh results are recorded only for what was executed. `F-7` stays **NOT SATISFIED** until its own bar is met. |
| Governance authorization | **COMMISSIONED — bounded non-production only.** | Same. Not production authority. |
| Capability acceptance | **NOT ACCEPTED** on current `main`. | Unchanged. |
| Production admission | **NOT ADMITTED / NOT PRODUCTION-READY.** | Unchanged. |

## 6. Publication

Changed paths for the commissioning publication are the decision record, the execution record, the investigation report cited below as evidence and not as an authority instrument, the byte-identical restored modules named in the execution record, and this tracker's additive registration. Exact PR number, merge commit, CI run, and remote blob digests are established from the remote after merge and are not self-embedded here.

Evidence cited, not adopted as authority: [`NP06-REPORTS-HISTORICAL-COMPLETION-AND-DEFERRAL-RECONCILIATION-2026-10-25.md`](NP06-REPORTS-HISTORICAL-COMPLETION-AND-DEFERRAL-RECONCILIATION-2026-10-25.md). That report rendered no decision. Its read-only constraint applied to the investigation that produced it and is superseded only where this commissioning conflicts. Its findings are evidence.

---

*Recording agent: Arena Agent Mode — recording and publication support; no authority rendered. Program Authority: Ramki. **Decision: COMMISSION bounded non-production resumption of NP-06 Reports.** Decision date 2026-10-25 (Asia/Calcutta). A2 and `REG-11` Option C preserved. Not production admission, not deployment, not final acceptance.*
