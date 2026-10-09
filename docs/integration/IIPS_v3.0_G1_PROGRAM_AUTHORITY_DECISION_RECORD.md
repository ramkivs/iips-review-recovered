# IIPS v3.0 — G1 Program Authority Decision Record

| Field | Value |
|---|---|
| Record type | Program Authority decision record. Additive; no historical record is rewritten. |
| Gate | G1 — B1 product host; B2 domain/provider authority; B3 engine taxonomy |
| Decision status | **DECIDED:** B1 = A; B2 = capability-scoped admission; B3 = A |
| G1 closure status | **PARTIALLY CLOSED.** Decisions are recorded on the session branch. Closure requires durable publication to IRR `main` (§8). |
| Authority status of this copy | Session-branch copy only. **Not yet authoritative.** It becomes authoritative only when published to `ramkivs/iips-review-recovered` `refs/heads/main` and independently verified there. |
| Decision source | Requester instruction in this session, 2026-10-09 ("PROGRAM AUTHORITY DECISION IS NOW AUTHORIZED"), recorded in §3. No separate signed Program Authority artifact for these decisions was found in the repositories examined. None is asserted here. |
| Predecessor (unchanged) | `docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_BOUNDARY.md`, blob `5f341ac68f1307d77e9827bedb42ed5a136b2705` |
| Execution mode | NON_PRODUCTION. Production is out of scope. |
| Recorded | 2026-10-09 (Asia/Calcutta) |

## 1. Authoritative product objective (as stated by the requester)

Deliver ONE integrated IIPS non-production application containing all evidenced IIPS capabilities, functions, surfaces, engines and E2E flows. The IRR application host is the product foundation. The final UX must be the converged IIPS product, not merely the legacy IRR UI.

Scope is bounded to capabilities with recorded evidence. This record adds no capability.

## 2. Baseline verified for this record

| Item | Identifier | Verification |
|---|---|---|
| IRR `main` (authoritative target) | `8877382048802702484e4297eb73b900e40fa792` | `git ls-remote origin`, 2026-10-09. **This record is not on it.** |
| IRR session branch before this record | `44c76236df5b6ddfc9287c023ee1033f7070f570` | `git ls-remote origin`, 2026-10-09 |
| IRR tag `program-v1.2.0` | object `4ec8812ee23cd7f917ac55dc1ba9e51f8565a8d4`, commit `5decdca93e5d…` | `ls-remote`; ancestor of IRR `main` |
| IPD `main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | scratch mirror |
| IPD pin consumed by IRR `main` | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (branch `np04-governed-persistence-windows`) | `frontend/package.json` line 15 |
| IPD G-2 baseline | `0dab1221fb0f89e2e0601ea905d642bfe72d5f9c` | G-2 record on IRR `main`; ancestor of `6828155…`, not of `2e11fa3b…` |
| IPD G24 candidate tip | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (branches `arena/01a0e6d9-…`, `arena/01a0f308-…`) | candidate only |
| Lineage investigation package | 33 files under `evidence/integration/lineage-investigation/2026-10-08/` | not modified by this record |

## 3. Decisions

### B1 — Product host — DECISION: A

IRR `ramkivs/iips-review-recovered` `main` is the authoritative IIPS product/application host.

- **In scope:** application shell; product routing; product-level transports and orchestration; integrated IIPS UX; in-process `iips-platform` integration where applicable.
- **Not granted:** IRR is **not** authoritative for IPD-owned domain data or persistence. Host authority gives no provider, identity or taxonomy authority.

### B2 — Domain / provider authority — DECISION: CAPABILITY-SCOPED ADMISSION

1. **Reports / persistence boundary.** The PA-accepted Reports binding associated with IPD pin `2e11fa3b…` continues, strictly within the capability and scope for which it was accepted. That scope is governed Reports persistence through the `./persistence` export and `GovernedArtifactStore`. The acceptance status is ACCEPTED / BRANCH-ONLY.
2. **User-portfolio / durable-persistence domain.** The G-2 architectural direction associated with baseline `0dab1221…` and the G24 candidate line continues, strictly within the user-portfolio / durable-persistence capability scope covered by that decision.
3. These are **capability-scoped admissions. They are not a universal IPD provider designation.**
4. Neither IPD line is promoted to universal IPD authority.
5. IRR is **not** automatically re-pinned to G24. The pin remains `2e11fa3b…` unless a separate decision changes it.
6. No candidate provider implementation is merged or admitted merely because it contains more implementation.
7. Any future unification of these provider lines into one authoritative IPD baseline requires a separate, explicit authority decision.
8. Existing PA-accepted branch-only decisions remain bounded by their original scope.
9. Provider divergence is preserved as an explicit governance item (§6).

This adopts option (i) of the narrow B2 question in the boundary record (§3.4). The G-2 side is expressed as the baseline `0dab1221…` and the G24 candidate line. The requester did not designate `6828155…` as an admitted commit.

### B3 — Engine taxonomy — DECISION: A

- The current IIPS non-production convergence baseline is the **13-engine product taxonomy**.
- The historical **10-engine taxonomy remains historical/legacy evidence** and is preserved unchanged.
- No engine implementation and no certification suite is modified by this decision.
- The 10-vs-13 test reconciliation is a later convergence task. It is not started here.

## 4. Explicit statements: what is and is not granted

- **No universal IPD provider authority** is granted to any IPD line: `main` (`4d3e1cd…`), the pin (`2e11fa3b…`), the G24 tip (`6828155…`) or the baseline (`0dab1221…`).
- **No production authority** is granted. This covers live Dhan use, production readiness and production data.
- **No implementation authority** is granted beyond the convergence work expressly enabled in §5.
- **No candidate branch becomes authoritative merely by being referenced.** This includes `np04-governed-persistence-windows`, `arena/01a0e6d9-…`, `arena/01a0f308-…` and any other candidate.
- **Runtime acceptance and full-E2E acceptance remain a later gate.** This record claims neither.
- **Live IdP / OIDC / Keycloak certification remains a later, non-production certification concern.** This record claims none.
- **Route protection** is not accepted from source alone. Runtime route protection remains unproven.
- **Historical 10-engine evidence is preserved.**
- **No pin change, merge, provider selection or IPD write** is authorized by this record.
- **The B3 evidence-depth gaps in §6 are not closed** by this decision.

## 5. G2 authorization boundary: G2 Existing Capability Convergence

G2 is authorized to begin for:

- **(a) IRR product-host convergence:** IRR-owned application shell, product routing, product-level transports and orchestration, integrated IIPS UX, and in-process `iips-platform` integration where applicable.
- **(b) 13-engine product taxonomy convergence:** aligning product-level taxonomy, routing and surfaces to the 13-engine baseline. This does not authorize engine implementation or certification-suite changes. The 10-vs-13 test reconciliation is a later convergence task.
- **(c) Capability-scoped Reports/provider convergence** under the existing accepted binding (pin `2e11fa3b…`, export `./persistence`), within the accepted scope only.
- **(d) Capability-scoped user-portfolio / durable-persistence convergence** under the existing G-2 direction (baseline `0dab1221…`; G24 candidate line), within the user-portfolio / durable-persistence scope only.

**G2 MUST NOT:**

1. declare universal IPD provider authority;
2. silently change the IPD pin (IRR stays on `2e11fa3b…` unless a separate decision is recorded);
3. merge candidate G24 implementation, or any candidate IPD implementation, without a separate admission;
4. treat branch-only artifacts as main-authoritative. This includes the NP04 governance record, which exists only on candidate branches;
5. implement production functionality or claim production readiness;
6. take authority over IPD-owned domain data or persistence;
7. modify the published lineage-investigation package, historical records, certification suites, historical evidence or provider code;
8. extend the Reports or G-2 admissions to PIT / D114 surfaces, or to any other capability, without a separate decision (see §6, item 6);
9. claim runtime, full-E2E or live-IdP acceptance.

**Entry condition.** Each G2 step must name the baseline it starts from (currently IRR `main` `8877382…`) and record its scope and evidence. Each step is a convergence step, not a production or acceptance claim.

**Authorization status.** G2 is authorized by the requester's instruction. Durable authority for G2 depends on publication of this record to IRR `main`, which is also required for G1 closure. No G2 work was started in this task.

## 6. Unresolved items preserved (not closed by this decision)

### B2 — unresolved

1. **No universal IPD provider authority.** This is unresolved by design. Any unification requires a separate explicit decision.
2. **Two `src/persistence` implementations.** The pin `2e11fa3b…` and the G24 line `6828155…` differ in 17 files. The pin exports `./persistence`; the G24 line does not. Their relationship (parallel, fork or successor) is not established. No reconciliation is authorized.
3. **G-2 baseline designation conflict.** The G-2 record names `0dab1221…` as the IPD architecture baseline. IRR's G2 consumer and readiness records name `6828155…` as the G24 pinned upstream. Which commit is the admitted reference for IRR consumption is unresolved.
4. **IPD baseline designation conflict across IRR records.** The G2 readiness record names IPD `main` `4d3e1cd…` as the IPD baseline. The G-2 record names `0dab1221…`. This is unresolved.
5. **Branch-tip dependency.** IRR's dependency is a branch-tip pin (`2e11fa3b…`, branch `np04-governed-persistence-windows`), not an IPD `main` commit. Whether and when it becomes a main-authoritative dependency is unresolved.
6. **PIT and D114 surfaces have no recorded admission basis.** IRR `main` consumes `./pit` and `./d114-non-production` through the pin, from `frontend/server/pit/ipdPitReadAdapter.ts`, `nonProductionPitStore.ts` and `nonProductionRuntimePitStore.ts`. Neither B2 admission (Reports or G-2) names these surfaces. A targeted search of IRR docs that reference them found implementation, investigation or republication records (for example `NP-08-D115-IMPLEMENTATION-COMPLETION-RECORD.md` and the NP-15 records). None was found to be a PA admission for these surfaces. **A separate decision is required before any expansion of their use.**
7. **G24 candidate implementation is not admitted** for merge into any protected baseline. It includes the durable store, the HTTP server and the OIDC verifier at `6828155…`.
8. **NP04 governance record is candidate-only.** It is at `evidence/np04/NP04-GOVERNANCE-AUTHORITY-RECORD.md` on the G24 line and on two arena branches. It contains `[AI]`-tagged entries. It records the D115 recording location as "NOT ESTABLISHED", and it does not reference `2e11fa3b…`. It is not treated as an admission.
9. **Reports acceptance is branch-only.** Its scope is not universal persistence. Its identity and tenant contract is domain-scoped. Main publication of the Reports implementation is not recorded.
10. **Identity and tenant.** Reports identity does not equal G24 application-user identity. No cross-repo identity, tenant or CompanyId mapping is created here, and no runtimeCompanyId binding is created.
11. **D-2 §13 Durability** is `PENDING` on IRR `main`: PR and merge commit are both pending.
   *Errata E-1 (additive; see §10): superseded. D-2 is durably published by merge `f89f1904d619eb7bad01db0e2ead4bcb5c91414d`. Its PENDING fields are stale placeholders inside the D-2 file, not publication status.*
12. **Tenant authority.** The candidate NP04 record states that D115 tenancy "remains unresolved and authoritative tenant administration remains outside IPD." Treat this as candidate-recorded and unresolved.
13. **Runtime evidence is UNPROVEN.** This covers Reports fail-closed absence behaviour, separate-process restart and recovery, and live-IdP evidence. The Reports acceptance lists these as conditional or unproven.
   *Errata E-2 (additive; see §10): the attribution in this item to D-3 is superseded. D-3 §9 lists only separate-process restart/recovery and live-IdP evidence as conditional or unproven.*
14. **Candidate test suites** (pin and G24) were not executed in this decision workflow. The G24 test files are present but UNPROVEN as runtime evidence.

### Other preserved items (not B2)

- **Lineage-act Annex 2 items** remain as previously recorded and are not re-evaluated here.

- **Shell conflict.** The IPD BI08 plan §18 target shows `TopBar (tenant/role, NO OIDC)`. IRR `main` uses OIDC PKCE. This is a host-scope follow-up for G2 (a).
- **IPD-side open questions.** IPD plan OQ-1 and OQ-2 remain open in IPD. They are IPD-side and do not bind the IRR host.
- **Engine-level evidence depth (B3).** Banking has no engine-level readiness artefact located. Insurance, capital-markets and healthcare have Reports-level readiness reports only. Telecom (IES-016), auto (IES-017) and materials (IES-020) have `FREEZE_MANIFEST.json` only.
- **v1.2 publication state (B3).** Tag `program-v1.2.0` exists on origin. The certificate's publication-execution status line and the signer of its sign-off are not confirmed here.
- **10-vs-13 test reconciliation (B3).** This is a later convergence task. A scratch run recorded 29 `Unknown engine: sector.telecom` failures. That run is non-authoritative.

## 7. Evidence basis and limits

- Remote refs were read with `git ls-remote` against `github.com/ramkivs/iips-review-recovered`.
- IPD ancestry, tree and export comparisons were performed on a scratch mirror. No repository was modified.
- IRR `main` file reads were performed on a scratch mirror at `refs/heads/main`.
- Scratch test totals are NON-AUTHORITATIVE and are not acceptance evidence. They include IRR frontend vitest at 993 passed and 25 skipped, IPD compiled tests at 542 of 542, and 29 IRR platform telecom failures.
- Absence of a path or commit in one ref is not proof of absence in another ref.

## 8. Publication, durability and next gate

- **Session branch.** This file is committed on `arena/1dcbe88d-iips-review-recovered`. Its commit and blob identifiers appear in the completion report, not in this file, because a file cannot contain its own commit identifier.
- **IRR `main`: NOT PUBLISHED.** The operator session policy restricts pushes to `arena/1dcbe88d-iips-review-recovered`. The requester's closure criterion requires publication to `main`.
- **G1 closure criterion (requester).** G1 is CLOSED only when this record is durably published and independently verified on IRR `main`. Until then G1 is PARTIALLY CLOSED.
- **Next execution gate (G1-PUB).** Publish this record file together with its predecessor, the boundary record (`docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_BOUNDARY.md`, blob `5f341ac68f1307d77e9827bedb42ed5a136b2705`), and nothing else, to `refs/heads/main` by the requester or an authorized route. This keeps the predecessor reference resolvable on `main`. Then verify that `origin/main` contains it (commit, tree and blob), that local equals remote, and that the worktree is clean. G1 becomes CLOSED only after that verification.
- **After G1-PUB.** G2 steps cite the verified `main` baseline. Each G2 step is separately scoped and evidenced.

## 9. Historical records

The boundary record is not edited. This record is additive. Once it is published to IRR `main`, it is the operative G1 decision record, and the boundary record's "G1 status: OPEN" line is superseded by it. The lineage package under `evidence/integration/lineage-investigation/2026-10-08/` is not modified.

## 10. Errata and verification notes (additive; no new authority decision)

This section is additive. The original text above is retained, including the superseded statements, which are marked inline. No decision in §3, no scope in §§4–5, and no G2 boundary is changed. Nothing here is a new Program Authority decision.

### E-1 — D-2 durability status (corrects §6, item 11)

- **Superseded statement:** "D-2 §13 Durability is PENDING on IRR `main`: PR and merge commit are both pending."
- **Corrected status:** D-2 is durably published. The D-2 record (`docs/integration/IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md`) states "durably published" in its header. Its merge to IRR `main` is `f89f1904d619eb7bad01db0e2ead4bcb5c91414d` (PR #39, from `governance/d2-identity-tenant-option-b`), which adds the 197-line record and is an ancestor of `refs/heads/main`. The D-1 prerequisite merge `561cc85fdbc929e68e798b1e97dda76a64262b9e` is also an ancestor of `main`.
- **Stale placeholders, distinct from publication status:** the §13 "Durability" fields of the D-2 record (PR, merge commit, tree, blob, SHA-256) read `PENDING` in the file on `main`. They were written before the merge, and a file cannot record the identifiers of the merge commit that contains it. They are self-referential placeholders and do not indicate unpublished status. Updating them is record hygiene for the D-2 record's owner. It is not an open publication item.
- **Corroboration:** D-3 (`docs/integration/GOVERNED-REPORTS-ACCEPTANCE-DECISION.md`, introduced at `cade02dc4543a23a5a99be64c03ffa1dd3d67c7f`, an ancestor of `main`) cites `f89f1904…` as the D-2 `main` merge.
- **Unchanged:** D-2's authority, scope, and limits are unchanged. D-2 does not establish a durable or universal Company Identity Authority.

### E-2 — Reports runtime-evidence attribution (corrects §6, item 13)

- **Superseded statement:** "This covers Reports fail-closed absence behaviour, separate-process restart and recovery, and live-IdP evidence. The Reports acceptance lists these as conditional or unproven."
- **Corrected reading:** D-3 §9 lists only two items as CONDITIONAL / UNPROVEN: (1) separate-process restart/recovery evidence and (2) live-IdP evidence. D-3 does not list fail-closed absence behaviour as conditional or unproven. The lead sentence "Runtime evidence is UNPROVEN" is therefore narrower than written: it applies to those two items.
- **Source note:** the Reports branch qualification record cited by D-3 §4 (`docs/v3.0/g3-build/PROGRAM_v3.0_NP06_REPORTS_FINAL_QUALIFICATION.md`, branch-scoped, not on `main`) reports a fail-closed no-store case (HTTP 503) among the cases it lists as exercised over real HTTP. This record did not re-execute that case.

### V-1 — Reports basis check against the NP-04 transfer copy (verification note; no decision)

- **Question:** does the PA-accepted Reports decision (D-3) depend materially on the non-authoritative NP-04 persistence boundary transfer copy (`docs/integration/NP-04-PERSISTENCE-DOMAIN-BOUNDARY-ACT.md`, status "ARENA TRANSFER COPY — NOT AUTHORITATIVE")?
- **Finding:** no material dependency was found.
  1. D-3 does not cite the transfer copy's identifier, path, title, or status. Its persistence basis is "Under D-1", and its identity basis is "Under D-2". Both are durably published on `main`.
  2. D-1 (`docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`) does not cite the transfer copy. Its Artifact/Report domain section (§3) relies on the pinned branch and the `./persistence` export. Its one NP04-related reference (§2) points to a candidate-only governance record for the portfolio lineage. That reference does not bear on the Reports basis.
  3. D-2 does not cite the transfer copy.
  4. The only "np04" text in D-1 and D-3 is the IPD branch name `np04-governed-persistence-windows` (pin `2e11fa3b…`).
  5. The Reports branch qualification record uses "NP-04" to name the published persistence package and store that the Reports implementation consumes. Its authority is stated as NP-06-R1 and Ramki's qualification authorization. Its one dependency-like phrase is a residual: closing its recorded canonicalization-export limitation "requires NP-04 to publish the symbol under its own authority." That residual is recorded as non-blocking. The record does not say whether "its own authority" is the transfer copy, and this check did not resolve that.
- **Disposition (verification, not a PA decision):** independent. The Reports admission under B2 is not blocked by the transfer copy. The residual is a future closure condition for a non-blocking limitation.

### Publication set (as of this section)

This record, the boundary record (`docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_BOUNDARY.md`), and the B2 PIT/D114 admission record (`docs/integration/IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md`) are published together to `refs/heads/main`. Identifiers are in the completion report, not in this file.
