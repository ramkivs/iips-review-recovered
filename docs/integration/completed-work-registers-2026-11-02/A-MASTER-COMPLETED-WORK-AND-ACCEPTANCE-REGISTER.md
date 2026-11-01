<!-- IRR-owned record. Additive dated consolidation. No historical record is edited or deleted. -->
# Register A — Master Completed Work and Acceptance Register (IRR)

**Record ID:** `IIPS-V3-COMPLETED-WORK-AND-AUTHORITY-REGISTERS-IRR-2026-11-02-01`
**Date:** `2026-11-02` (Asia/Calcutta)
**Owning repository:** `ramkivs/iips-review-recovered` (IRR) — IRR-owned records only
**Cross-repository counterpart (IPD):** prepared at `evidence/cross-repository/completed-work-registers-2026-11-02/` — **publication status is recorded in `PUBLICATION-STATUS.md`; it is not claimed as published until an IPD merge and remote read-back are achieved**
**Tracker registration:** §16.248 / `CV-CORR-228` / `CHG-2026-11-01-27` / `V2011`–`V2022`
**Baselines re-censused at authoring time:** IRR `main@6f347a018dbfacbc7d5e62fe9f773b323ce9d69c` (PR #428); IPD `main@0a3b5f0f038e13305a3b927865acc349e19f043f` (PR #119); **0 open PRs in both repositories**

> **What this is.** A read-only consolidation of work that is already complete, evidence that is already accepted, waivers that are already effective, and decisions that are already rendered — published so that future reviews stop treating completed work as outstanding.
>
> **What this is not.** Not a PA decision, not an acceptance, not an admission, not a qualification result, not a waiver, and not an execution receipt. It creates no authority and moves no gate. Every row cites an existing published record; where the record is user-reported rather than repository-verified, the row says so.
>
> **Nothing was re-executed.** No S2 rerun, no P-2 re-establishment, no PF capture, no P1-F Execute or retry, and **no Direct P1 provisioning**. Direct P1 was already successfully executed by the user on Windows.

## Status vocabulary (controlled)

| Status | Meaning |
|---|---|
| `COMPLETE — EXECUTED` | The activity was performed; execution is evidenced. Says nothing by itself about acceptance. |
| `COMPLETE — ACCEPTED` | A competent authority accepted the result for the stated scope. |
| `COMPLETE — CONDITIONALLY ACCEPTED` | Accepted with explicit, surviving conditions or boundaries. The boundaries are part of the status. |
| `EFFECTIVE — AUTHORIZATION/WAIVER` | An authority or waiver is in force. **Not** evidence that anything was performed. |
| `COMPLETED — USER-REPORTED EXECUTION` | The operator reports execution. Arena did not observe the host. |
| `COMPLETED — REPOSITORY-VERIFIED` | Verified from repository/remote artifacts by Arena. Not a native-host observation. |
| `SUPERSEDED` | A later dated record governs. The original is preserved verbatim. |
| `DEFERRED` | An explicit decision defers or closes the item by scope. Not an open task. |
| `PARTIAL` | Some limbs satisfied, some not. The row states which. |
| `NOT STARTED` | Genuinely not begun. |
| `OPEN — GENUINELY OUTSTANDING` | A real residual. Appears in Register D with the reason no completion or waiver resolves it. |

**Reading rules that prevent the recurring errors**

1. A merged PR is not acceptance. Implementation, integration, qualification, acceptance, admission and publication are six different facts.
2. A waiver removes a *blocker*; it never converts an unperformed activity into a performed one unless the authority expressly says so.
3. An acceptance is bound to its exact commit/tree and scope. It does not transfer.
4. Implementation tests, unit tests, CI and synthetic-socket integration tests are **not** Windows UI E2E verification.
5. `COMPLETED — USER-REPORTED EXECUTION` and `COMPLETED — REPOSITORY-VERIFIED` are different provenance classes and are never merged.
6. A historical observation (for example a point-in-time PF capture) is not a completion of the stage that uses it.

## Scope of this register

63 IRR-owned items: IRR records, IRR-owned acceptance/authority decisions, and cross-repository items whose acceptance or authority locus is IRR.

**Repository-ownership boundary.** 22 purely IPD-owned records are published in the IPD counterpart register, not here. They are listed as cross-references in §A.X below so that this register remains a complete navigational entry point without writing IPD-owned content into IRR.

## Index

| Item ID | Workstream / category | Description | Consolidated status (controlled vocabulary) | Re-execution required? |
|---|---|---|---|---|
| CW-S2-01 | A — S2 canonical native-Windows verification | S2 five-command native Windows run at the designated pin | COMPLETE — CONDITIONALLY ACCEPTED | No — the run is executed and conditionally accepted at its pin. A rerun would create a second, different S2 and is expressly not required by S2-ACC-A1. |
| CW-S2-02 | A — S2 canonical native-Windows verification | PA decision act S2-ACC-A1 (formal conditional acceptance) | COMPLETE — ACCEPTED | No — the decision is rendered. Re-requesting S2 acceptance duplicates a completed PA act. |
| CW-S2-03 | A — S2 canonical native-Windows verification | S2-DEP-A governed raw-evidence deposit | COMPLETED — REPOSITORY-VERIFIED | No — the deposit is complete. Do not re-request the transfer or a second deposit. |
| CW-S2-04 | A — S2 canonical native-Windows verification | Independent S2 publication/integrity verification (seal, digests, LF/CRLF analysis) | COMPLETED — REPOSITORY-VERIFIED | No — verification is complete and re-runnable; a rerun adds nothing to acceptance. |
| CW-S2-05 | A — S2 canonical native-Windows verification | 2026-10-26 candidate-scoped S2 acceptance at 001c3c80 / tree 399fa44a | SUPERSEDED | No — historical; superseded, not outstanding. |
| CW-S2-06 | A — S2 canonical native-Windows verification | 2026-10-26 approved-baseline S2 attempt at 8eec74ae / tree 4eba2902 | SUPERSEDED | No — the failure is recorded history, not pending work. |
| CW-S2-07 | A — S2 canonical native-Windows verification | CAP-03 S2 original-dist recovery release (four assets) and hosted independent audit | COMPLETED — REPOSITORY-VERIFIED | No — asset verification is complete and reproducible in hosted CI. |
| CW-S2-08 | A — S2 canonical native-Windows verification | S04-compatible sealed recovery directory bundle + Windows read-back | OPEN — GENUINELY OUTSTANDING | Yes — but only the bundle assembly/read-back, and only by the operator on Windows. NOT an S2 rerun, NOT a rebuild, not a P1-F execution. |
| CW-P2-01 | B — P-2 / Gate C | Gate C P-2 trust-anchor establishment executed on the designated non-production host | COMPLETE — ACCEPTED | No — establishment is executed and closed for in-scope criteria. Re-running it would duplicate accepted operator evidence. |
| CW-P2-02 | B — P-2 / Gate C | GC-P2-SCOPE-CORR-01 — scope correction and F5R disposition | COMPLETE — ACCEPTED | No — the disposition is final for this product. |
| CW-P2-03 | B — P-2 / Gate C | GC-P2-DEPOSIT-DISPOSITION-01 — amended one-artifact deposit contract and its execution | COMPLETED — REPOSITORY-VERIFIED | No — the amended deposit contract is satisfied. The superseded four-artifact text is historical. |
| CW-P2-04 | B — P-2 / Gate C | P-2 designation package: GC-D4 (P2-A) and the ten execution designation values | COMPLETE — ACCEPTED | No — values are designated; do not re-request them. |
| CW-P2-05 | B — P-2 / Gate C | Owner→G24 binding chain P-4 / P-6 / P-8 | DEFERRED | No — closed by scope. Reopening requires a new PA decision, not a review finding. |
| CW-P2-06 | B — P-2 / Gate C | Gate C result acceptance for the QE-11 read-only subset (Q1–Q4 / Q9–Q11) | NOT STARTED | Yes — but only after the QE subset is actually executed under the effective Gate 4 pin; not before. |
| CW-PF-01 | C — PF-01…PF-17 host preflight | PF-01 — host identity | PARTIAL | No — not as a standalone task. Only inside a future authorized S3 session. |
| CW-PF-02 | C — PF-01…PF-17 host preflight | PF-02 — OS edition | PARTIAL | No — not standalone. Do not upgrade the host or spoof host facts to satisfy it. |
| CW-PF-03 | C — PF-01…PF-17 host preflight | PF-03 — non-elevation and account SID | PARTIAL | No — not standalone. |
| CW-PF-04 | C — PF-01…PF-17 host preflight | PF-04 — platform and runtime | PARTIAL | No — not standalone. |
| CW-PF-05 | C — PF-01…PF-17 host preflight | PF-05 — flag-free node:sqlite | PARTIAL | No — not standalone. |
| CW-PF-06 | C — PF-01…PF-17 host preflight | PF-06 — no runtime switch or install | PARTIAL | No — not standalone. |
| CW-PF-07 | C — PF-01…PF-17 host preflight | PF-07 — IPD clean tree at the designated pin | OPEN — GENUINELY OUTSTANDING | Yes — inside a future authorized S3/attempt session at the PA-designated pin, not before. |
| CW-PF-08 | C — PF-01…PF-17 host preflight | PF-08 — IRR clean tree at the consumer pin | PARTIAL | No — not standalone. |
| CW-PF-09 | C — PF-01…PF-17 host preflight | PF-09 — full history available | PARTIAL | No — not standalone. |
| CW-PF-10 | C — PF-01…PF-17 host preflight | PF-10 — no enabling flags | PARTIAL | No — not standalone. |
| CW-PF-11 | C — PF-01…PF-17 host preflight | PF-11 — store-path syntax and worktree exclusion | COMPLETE — CONDITIONALLY ACCEPTED | No — do not re-request the PF-11 method correction or a native harness rerun. Only the attempt-session observation remains, inside S3. |
| CW-PF-12 | C — PF-01…PF-17 host preflight | PF-12 — store absence | PARTIAL | No — never rerun to 'restore' absence. Deleting the provisioned store is prohibited. |
| CW-PF-13 | C — PF-01…PF-17 host preflight | PF-13 — parent location | PARTIAL | No — not standalone. |
| CW-PF-14 | C — PF-01…PF-17 host preflight | PF-14 — raw evidence location | PARTIAL | No — not standalone. |
| CW-PF-15 | C — PF-01…PF-17 host preflight | PF-15 — IPC endpoint / local-state designation | EFFECTIVE — AUTHORIZATION/WAIVER | No — the designation is effective. Do not re-render F1–F6 or re-request the designation. |
| CW-PF-16 | C — PF-01…PF-17 host preflight | PF-16 — authority text confirmation | OPEN — GENUINELY OUTSTANDING | Yes — only after PA-09 designates the pin, inside the authorized S3 session. |
| CW-PF-17 | C — PF-01…PF-17 host preflight | PF-17 — no prior P-1 consumption | PARTIAL | No — do not run P1-F, a retry, or a claim/marker action to resolve it. Only the operator's authorized Windows-side verifier can supply the missing positive proof. |
| CW-P1-02 | D — P1 provisioning | Direct P1 Windows provisioning run on the user's laptop | COMPLETED — USER-REPORTED EXECUTION | No — ALREADY SUCCESSFULLY EXECUTED BY THE USER. Do not request, schedule or perform another provisioning run. Do not reprovision, delete or overwrite the database. |
| CW-P1-04 | D — P1 provisioning | IRR read-only IPC composition of the Direct P1 store (three owner-scoped HTTP reads) | COMPLETED — REPOSITORY-VERIFIED | No — the IRR composition is complete and merged. Do not reimplement or re-test to reconstruct history. |
| CW-P1-05 | D — P1 provisioning | Windows named-pipe smoke test: start the already-provisioned IPD provider + IRR and read the list | OPEN — GENUINELY OUTSTANDING | Yes — one operator read-only smoke test on Windows. Explicitly NOT a reprovisioning run and NOT a write. |
| CW-P1-06 | D — P1 provisioning | P1-F legacy authorization act and its one-attempt semantics | EFFECTIVE — AUTHORIZATION/WAIVER | No — do not execute or retry P1-F. It is not a prerequisite for the completed Direct P1 path. |
| CW-P1-07 | D — P1 provisioning | P1-F retry-readiness determination and canonical historical IPD checkout recovery | COMPLETED — REPOSITORY-VERIFIED | No — the investigation is complete. Do not repeat the checkout recovery or the pin investigation. |
| CW-P1-08 | D — P1 provisioning | P-1-C preflight/capture integrity limb | OPEN — GENUINELY OUTSTANDING | No — not for Direct P1. Only inside a future separately authorized legacy attempt. |
| CW-P1-09 | D — P1 provisioning | P-1-D F4 store/parent designation limb | PARTIAL | No — do not re-verify by touching the store. Any legacy reuse of F4 needs an explicit PA disposition first. |
| CW-P1-10 | D — P1 provisioning | Q-EV evidence-root designation, operator read-only verification and existing-DACL acceptance | COMPLETED — USER-REPORTED EXECUTION | No — do not re-request the root verification or a second DACL acceptance. |
| CW-OT-02 | F — Other completed/accepted | REG-06 IRR-side independent verification and reconciliation | COMPLETED — REPOSITORY-VERIFIED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-04 | F — Other completed/accepted | Gate 3 bounded durable user-portfolio implementation and acceptance | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-05 | F — Other completed/accepted | Reports domain backend qualification and acceptance (NP-06 / F-7) | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-06 | F — Other completed/accepted | Reports UI exposure qualification and acceptance (CV-51) | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-07 | F — Other completed/accepted | Owner-context carrier, Class-C journal persistence and fail-closed owner fences (CV-04 / CV-10 / PF-1) | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-08 | F — Other completed/accepted | NP-18 intelligence destination surface admission and isolated-main merge | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-09 | F — Other completed/accepted | NP-12 Governed Screener producer acceptance and qualification | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-10 | F — Other completed/accepted | Stage A evidence snapshot/replay acceptance | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-11 | F — Other completed/accepted | PIT read seam admission (IRR ↔ IPD, CV-05 / Gate 43) | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-12 | F — Other completed/accepted | D115 runtime CompanyId boundary retained unwired (CV-43) | DEFERRED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-13 | F — Other completed/accepted | CV-23 — Gate A convergence recorded NOT REQUIRED for the current product | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-18 | F — Other completed/accepted | IPD DR-2 Option A provider read envelope and IRR Option A consumer | COMPLETED — REPOSITORY-VERIFIED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-19 | F — Other completed/accepted | O-06 package/ref durability of the three IPD specifiers — CLOSED | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-20 | F — Other completed/accepted | O-07 documentation re-scope and CV-05 pin narrative consolidation — CLOSED | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-21 | F — Other completed/accepted | Consolidated outstanding-items resolution P-11 / P-18 / P-19 / P-20 | COMPLETED — REPOSITORY-VERIFIED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-22 | F — Other completed/accepted | G14 current-state dependency audit and independent advancement reconciliation | COMPLETED — REPOSITORY-VERIFIED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-23 | F — Other completed/accepted | H-12 R5 manifest adoption for its recorded baseline | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-24 | F — Other completed/accepted | 51×17 capability matrix reconstruction, reassessment and verifier | COMPLETED — REPOSITORY-VERIFIED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-25 | F — Other completed/accepted | v1.2.0 release state | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-26 | F — Other completed/accepted | Operator runbook and server start path | COMPLETED — REPOSITORY-VERIFIED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-27 | F — Other completed/accepted | Sector surface bounded acceptance (PKG-08 row 4) | COMPLETE — CONDITIONALLY ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-28 | F — Other completed/accepted | Macro / D08 guarded read (NAS, CPI, IIP) acceptance at guarded-read scope | COMPLETE — CONDITIONALLY ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-29 | F — Other completed/accepted | IPD PR #42 closed with record under PA disposition | COMPLETE — ACCEPTED | No — complete work is published; reuse the recorded evidence. |
| CW-OT-30 | F — Other completed/accepted | Closed/superseded pull requests and branch-only lineages | SUPERSEDED | No — complete work is published; reuse the recorded evidence. |

## A.X — IPD-owned records (cross-reference only; authoritative bodies live in IPD)

| Item ID | Workstream / category | Description | Consolidated status (controlled vocabulary) | Owning repository | Authoritative record location |
|---|---|---|---|---|---|
| CW-P1-01 | D — P1 provisioning | Direct P1 local SQLite provisioning implementation (IPD-owned) | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-P1-01 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-P1-03 | D — P1 provisioning | IPD Direct P1 handoff read-shape correction and Windows IPC provider startup documentation | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-P1-03 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-OT-01 | F — Other completed/accepted | REG-06 Operator Drop product admission and durable PIT market-data implementation | COMPLETE — ACCEPTED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-OT-01 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-OT-03 | F — Other completed/accepted | O5-A bounded refusing-only durable broker-import consumer (IPD) | COMPLETE — CONDITIONALLY ACCEPTED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-OT-03 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-OT-14 | F — Other completed/accepted | IPD security master, instrument identity mapping and D05 quarantine | COMPLETE — ACCEPTED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-OT-14 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-OT-15 | F — Other completed/accepted | IPD engine adapters and CertifiedSectorEngineId bridge (WSD P11 bounded library) | COMPLETE — ACCEPTED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-OT-15 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-OT-16 | F — Other completed/accepted | IPD offline shell (data plane + UI) structure acceptance | COMPLETE — CONDITIONALLY ACCEPTED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-OT-16 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-OT-17 | F — Other completed/accepted | IPD guarded test runner (zero-test false-green closure) | COMPLETE — ACCEPTED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-OT-17 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-01 | F — Other completed/accepted (IPD-owned) | U2 Part A identity/atomicity implementation and criterion reconciliation | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-01 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-02 | F — Other completed/accepted (IPD-owned) | U2 Part B provenance/schema migration 004 | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-02 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-03 | F — Other completed/accepted (IPD-owned) | U2 write-port wrapper (authority and implementation merged, no write enabled) | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-03 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-04 | F — Other completed/accepted (IPD-owned) | U2 evidence gaps closed (governed-source rejection and T-U2-5 race upgrade) | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-04 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-05 | F — Other completed/accepted (IPD-owned) | U7 provider-side outcome mapping implementation | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-05 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-06 | F — Other completed/accepted (IPD-owned) | Gate A′ successor bounded implementation and Gate 4 Limb A | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-06 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-07 | F — Other completed/accepted (IPD-owned) | S1 identity-value determination and binding commit | COMPLETE — ACCEPTED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-07 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-08 | F — Other completed/accepted (IPD-owned) | Gate 4 H-12 membership amendment (Alternative A) | COMPLETE — ACCEPTED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-08 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-09 | F — Other completed/accepted (IPD-owned) | DR-2 Option A IPD provider read envelope | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-09 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-10 | F — Other completed/accepted (IPD-owned) | DQ-6b IPD-locus decision mirror receipt (effectiveness element 6) | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-10 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-11 | F — Other completed/accepted (IPD-owned) | S2 47-file independent hash verification (IPD-locus) | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-11 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-12 | F — Other completed/accepted (IPD-owned) | IPD 51×17 capability-matrix reconstruction publication | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-12 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-13 | F — Other completed/accepted (IPD-owned) | P-20 dated correction of the stale P-1 authorization footer in the IPD tracker | COMPLETED — REPOSITORY-VERIFIED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-13 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |
| CW-IPD-14 | F — Other completed/accepted (IPD-owned) | P-08 / REG-06 exhaustive all-branch re-verification and correction of one technical finding | SUPERSEDED | IPD (ramkivs/iips-production-market-data) | IPD `evidence/cross-repository/completed-work-registers-2026-11-02/A-IPD-COMPLETED-WORK-AND-ACCEPTANCE-REGISTER.md` — row CW-IPD-14 (prepared; IPD publication pending — see PUBLICATION-STATUS.md) |

## Full records (18 fields each)

### CW-S2-01 — S2 five-command native Windows run at the designated pin

**Status:** COMPLETE — CONDITIONALLY ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | A — S2 canonical native-Windows verification |
| Owning repository | IPD (ramkivs/iips-production-market-data) (execution locus); acceptance owned by IRR (ramkivs/iips-review-recovered) |
| Original authority | Gate 4 act IIPS-V3-G4-TARGET-HOST-QUALIFICATION-ACT-2026-10-23-01; PA-06 L2a admission (tracker §16.206); S2 operator runbook |
| Execution status | COMPLETE — EXECUTED on the designated Windows host s2-a891802e-20261028T192516Z, host DESKTOP-NO0NHTP, Windows 11 build 26300, non-elevated, Node v22.16.0 / npm 10.9.2, 2026-10-28T19:25:17Z–19:29:15Z |
| Acceptance status | COMPLETE — CONDITIONALLY ACCEPTED under PA act S2-ACC-A1 (2026-10-29), conditions A-i…A-iv |
| Effective scope | The five S2 commands and their recorded counts at pin a891802e2691bd9c65a67d6abff20d8ce0c26d7d / tree 76f083d7058e170d8212455c03bad1033136ee68 only: npm ci; npx tsc --noEmit; npm run build (dist 1,140); guarded npm test 930 executed / 926 passed / 0 failed / 4 skipped; npm run test:package-consumer PASS, pack shasum cc2aa701… |
| Limitations | Content-level acceptance only. Git copies are LF renderings; Windows originals remain the byte authority. s2-00-run-log.txt digest is not reproducible from Git bytes. Establishes no V1295/P-31 endpoint binding, no QE, no Gate 4/Gate 5 movement, no P-1 execution, no H-12 final pin. |
| Waiver / authorization | S2-ACC-A1 conditions A-i…A-iv; PA-19 waives the operator transfer/read-back blocker; PA-20 waives Windows/operator-evidence blockers. Neither waiver converts the run into whole-program qualification. |
| Evidence | docs/integration/IIPS_v3.0_CAP03_S2_ACC_A1_CONDITIONAL_ACCEPTANCE_DECISION_RECORD_2026-10-29.md; evidence/integration/cap03-s2-a891802e-publication-verification-2026-10-28/; docs/g3-d0-registration-2026-10-18 @ 2cc5bc4 (18 paths, seal 9D3C09DB…) |
| Commit / branch / PR | IPD pin a891802e2691bd9c65a67d6abff20d8ce0c26d7d / tree 76f083d7058e170d8212455c03bad1033136ee68; IRR tracker §§16.180, 16.183, 16.194; IRR PR #366 (deposit) |
| Cross-repository dependency | Acceptance is IRR-owned; the executed artefacts are IPD-built. Any future reuse must stay at this exact pin. |
| Remaining residual | Host originals must be retained by the operator (surviving obligation). S04-compatible sealed-directory bundle remains separate (see CW-S2-08 / RS-04). |
| Re-execution required? | No — the run is executed and conditionally accepted at its pin. A rerun would create a second, different S2 and is expressly not required by S2-ACC-A1. |
| Future analysis instruction | Cite S2-ACC-A1 and this row before proposing any S2 rerun. Do not transfer this acceptance to another commit/tree. Do not report S2 as an open execution gap. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-S2-02 — PA decision act S2-ACC-A1 (formal conditional acceptance)

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | A — S2 canonical native-Windows verification |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | PA (Ramki) explicit acceptance directive 2026-10-29 adopting published option S2-ACC-A1 verbatim |
| Execution status | COMPLETE — EXECUTED (decision rendered and published) |
| Acceptance status | COMPLETE — ACCEPTED as a PA act; it is itself the acceptance instrument |
| Effective scope | Renders S2 ACCEPTED — CONDITIONAL at the designated pin; closes Q-S2-1/D1 as a repository-sufficiency item |
| Limitations | Adds no condition, waives nothing beyond the quoted scope, decides nothing outside it. R-1 expressly unwaived by this act. Does not move V1295, QE, Gates, P-1, H-12, PF-15, DQ-4, fences or production eligibility. |
| Waiver / authorization | Is an authority act, not a waiver of technical evidence |
| Evidence | docs/integration/IIPS_v3.0_CAP03_S2_ACC_A1_CONDITIONAL_ACCEPTANCE_DECISION_RECORD_2026-10-29.md; package blob 545b523a8a4c73a758144df687c2dafc50a21ccc; resolution blob a019d83894… |
| Commit / branch / PR | IRR tracker §16.183 (CV-CORR-163; CHG-2026-10-29-05; V1340–V1349) |
| Cross-repository dependency | Applies to the IPD-built S2 artefacts at the designated pin |
| Remaining residual | None for the act itself |
| Re-execution required? | No — the decision is rendered. Re-requesting S2 acceptance duplicates a completed PA act. |
| Future analysis instruction | Treat S2 acceptance as decided. Any change requires a new, distinct PA act; never reinterpret A-i…A-iv. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-S2-03 — S2-DEP-A governed raw-evidence deposit

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | A — S2 canonical native-Windows verification |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | PA directive 2026-10-29 authorizing S2-DEP-A (byte-verbatim raw-folder deposit) |
| Execution status | COMPLETED — REPOSITORY-VERIFIED (deposit published and read back) |
| Acceptance status | COMPLETE — ACCEPTED as a completed deposit; the earlier OUTSTANDING/BLOCKED line is superseded by dated pointer |
| Effective scope | Governed deposit of the S2 raw evidence folder into IRR |
| Limitations | Deposit completion does not convert LF-rendered Git copies into Windows byte originals; the host-retention obligation survives. |
| Waiver / authorization | PA-19 (§16.202) — operator transfer and read-back items are PA-WAIVED — NOT A BLOCKER |
| Evidence | IRR tracker §16.194; evidence/integration/cap03-s2-dep-a-2026-10-29/; dated pointer in S2-ACC-A1 §7 |
| Commit / branch / PR | IRR PR #366, commit 078e50cb…; tracker §16.194 / §16.202 |
| Cross-repository dependency | Evidence originates from the IPD Windows build/run |
| Remaining residual | None outstanding for the deposit itself |
| Re-execution required? | No — the deposit is complete. Do not re-request the transfer or a second deposit. |
| Future analysis instruction | Read §16.194 and the §16.202 dated pointer before listing S2-DEP-A as blocked. The historical BLOCKED text is preserved and is not current. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-S2-04 — Independent S2 publication/integrity verification (seal, digests, LF/CRLF analysis)

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | A — S2 canonical native-Windows verification |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | S2-ACC-A1 condition A-i/A-ii verification requirement |
| Execution status | COMPLETED — REPOSITORY-VERIFIED; verifier re-run reported ALL CHECKS MATCH |
| Acceptance status | COMPLETE — ACCEPTED as the verification basis for A-i/A-ii |
| Effective scope | Seal SHA256SUMS.txt byte-exact vs host reproducing 9D3C09DB…; RESULT.txt and MANIFEST.json digests reproduce as stored; 13 transcripts reproduce host digests under uniform LF→CRLF restoration |
| Limitations | Establishes content-line identity, not full-file byte identity against host files. s2-00-run-log.txt host-byte identity remains unproven and rests on the host original. |
| Waiver / authorization | None required; this is verification, not a waiver |
| Evidence | evidence/integration/cap03-s2-a891802e-publication-verification-2026-10-28/ (verifier 0FDB3EF5…); tracker §16.180 |
| Commit / branch / PR | IRR tracker §16.180; deposit commit 2cc5bc4… |
| Cross-repository dependency | Verifies IPD-produced Windows captures held in IRR |
| Remaining residual | Run-log byte identity (bounded, accepted limitation under A-ii) |
| Re-execution required? | No — verification is complete and re-runnable; a rerun adds nothing to acceptance. |
| Future analysis instruction | Reuse the published verifier output. Do not describe the 13 transcripts as byte-identical to host originals. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-S2-05 — 2026-10-26 candidate-scoped S2 acceptance at 001c3c80 / tree 399fa44a

**Status:** SUPERSEDED

| Field | Value |
|---|---|
| Workstream / category | A — S2 canonical native-Windows verification |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | PA candidate-scoped disposition §16.143; acceptance act IIPS-V3-CAP03-S2-EVIDENCE-ACCEPTANCE-2026-10-26-01 |
| Execution status | COMPLETE — EXECUTED (candidate-scoped run and acceptance) |
| Acceptance status | SUPERSEDED as current S2 state by the designated-pin run and S2-ACC-A1; preserved verbatim as a distinct historical acceptance |
| Effective scope | Candidate coordinate 001c3c80…/399fa44a… only; residuals R-1…R-4 carried unwaived at that time |
| Limitations | Not interchangeable with the a891802e pin. Must never be conflated with the designated-pin acceptance or with the failed approved-baseline run. |
| Waiver / authorization | Historical; PA-19/PA-20 later waived associated governance blockers |
| Evidence | docs/integration/IIPS_v3.0_CAP03_S2_EVIDENCE_ACCEPTANCE_2026-10-26.md; tracker §§16.141–16.145; raw deposit PR #310 → 47133fe489e80de2af5f1b537d67865a6a7235b9 |
| Commit / branch / PR | IRR PR #310; tracker §16.144 (CV-CORR-124) |
| Cross-repository dependency | IPD candidate 001c3c80… (IPD PR #96) |
| Remaining residual | None — historical only |
| Re-execution required? | No — historical; superseded, not outstanding. |
| Future analysis instruction | Do not reopen the candidate-scoped record or use it as the current S2 basis. Cite CW-S2-01 for current state. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-S2-06 — 2026-10-26 approved-baseline S2 attempt at 8eec74ae / tree 4eba2902

**Status:** SUPERSEDED

| Field | Value |
|---|---|
| Workstream / category | A — S2 canonical native-Windows verification |
| Owning repository | IPD (ramkivs/iips-production-market-data) (execution); IRR (ramkivs/iips-review-recovered) (record) |
| Original authority | Original Gate 4 S2 designation at 8eec74ae |
| Execution status | COMPLETE — EXECUTED with a FAILED result (step 4 failed at the approved baseline) |
| Acceptance status | Not accepted; recorded as diagnostic history and never restated as passing |
| Effective scope | Historical failed baseline attempt only |
| Limitations | A failed run is not a pass and not an open task. It consumed no P-1 authorization. |
| Waiver / authorization | None |
| Evidence | Tracker §§16.141–16.144 (step-4 failure at the approved baseline; passing bytes candidate-scoped) |
| Commit / branch / PR | IRR tracker §16.141/§16.142/§16.144 |
| Cross-repository dependency | IPD baseline 8eec74ae… |
| Remaining residual | None — historical only |
| Re-execution required? | No — the failure is recorded history, not pending work. |
| Future analysis instruction | Never report this as a passing S2, and never list it as an outstanding rerun. The designated-pin run superseded it. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-S2-07 — CAP-03 S2 original-dist recovery release (four assets) and hosted independent audit

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | A — S2 canonical native-Windows verification |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | Tracker §16.232 recovery-release publication; §16.233 release-aligned S04 candidate; PA blanket act §3 |
| Execution status | COMPLETED — REPOSITORY-VERIFIED (release published; hosted audit independently hashed all four assets and all 1,140 ZIP payload entries against the original inventory) |
| Acceptance status | COMPLETE — ACCEPTED as release-asset verification; expressly NOT the S04 sealed-directory bundle |
| Effective scope | Original archive SHA-256 57656309d721a0c6f6a072f14f6a9067a2cc788737efa92f34aa0997fb5d2d48 and original inventory SHA-256 e077a349d3777403d426a0b0f338c53ac6f0e3942f75a9174a6a9b6e42854cbb verified; hosted audit run 41220038505 |
| Limitations | Four standalone release assets are not the canonical sealed S04 directory (MANIFEST.json + SHA256SUMS.txt + reports + recovered dist tree). Sandbox cannot download release-asset bytes; the hosted audit is the byte-verification locus. |
| Waiver / authorization | PA blanket act §3 waives the distinct original verification-output file as a procedural prerequisite; it does not certify S2 or establish P-1 readiness |
| Evidence | GitHub release cap03-s2-recovery-20261031-212225 @ 11f064a3add34ab237735191df47eb8bea59e013; docs/integration/cap03-s2/verify_recovery_release.py; tracker §16.232 |
| Commit / branch / PR | IRR PRs #398 / #400 / #402; tracker §§16.230, 16.232, 16.233 |
| Cross-repository dependency | Recovers the IPD-produced dist bytes; no IPD write |
| Remaining residual | S04 sealed-directory bundle creation/readback on Windows (CW-S2-08) |
| Re-execution required? | No — asset verification is complete and reproducible in hosted CI. |
| Future analysis instruction | Do not re-request the release assets or re-hash them locally. Do not describe the four-asset release as an S04 bundle PASS. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-S2-08 — S04-compatible sealed recovery directory bundle + Windows read-back

**Status:** OPEN — GENUINELY OUTSTANDING

| Field | Value |
|---|---|
| Workstream / category | A — S2 canonical native-Windows verification |
| Owning repository | IRR (ramkivs/iips-review-recovered) (procedure) / operator Windows host (execution) |
| Original authority | PA blanket act §3 (S04 evidence-formality waiver) and §4 (one-pass scope) |
| Execution status | NOT STARTED on the designated host — no Windows recovery wrapper execution or bundle read-back has been performed or claimed |
| Acceptance status | Not rendered; S04 retention acceptance remains PENDING |
| Effective scope | Creation and independent read-back of the sealed S04 directory from authentic available bytes |
| Limitations | The missing distinct original verification-output file is WAIVED and must not be reconstructed for formality. The transcript must never be relabelled as that output. Everything else in the S04 contract still applies. |
| Waiver / authorization | IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01 §3 — effective; removes the missing-output blocker only |
| Evidence | docs/integration/IIPS_v3.0_CAP03_S2_ORIGINAL_DIST_RECOVERY_2026-10-31.ps1; docs/integration/cap03-p1-f9/CAP03S2DistArtifacts.psm1 (waiver mode); tracker §16.233 V1839, §16.235 V1872 |
| Commit / branch / PR | IRR PRs #400/#402/#404; tracker §§16.233, 16.235–16.237 |
| Cross-repository dependency | Requires the operator's Windows host and the released IPD dist archive |
| Remaining residual | RS-04 — sealed bundle + read-back; genuinely outstanding, narrowed by the §3 waiver |
| Re-execution required? | Yes — but only the bundle assembly/read-back, and only by the operator on Windows. NOT an S2 rerun, NOT a rebuild, not a P1-F execution. |
| Future analysis instruction | Do not ask for the waived original verification-output file. Do not request an S2 rerun to satisfy S04. Scope any request to bundle assembly from already-verified bytes. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P2-01 — Gate C P-2 trust-anchor establishment executed on the designated non-production host

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | B — P-2 / Gate C |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | GC-D4 (P2-A package) + GC-D5/GC-D6 ten designation values; P-2 execution handoff §15.14 |
| Execution status | COMPLETED — USER-REPORTED EXECUTION (operator-transferred Windows evidence; Arena verified the reconciliation and artefacts, not the Windows execution) |
| Acceptance status | COMPLETE — ACCEPTED for in-scope criteria (§15.16 reconciliation; §15.19 closure) |
| Effective scope | Blocks A/C/D/E/F1–F4/F6 satisfied as operator-transferred; §7.3(1) loader fail-closed, (2) reachable JWKS, (3) round-trip, (4) configuration evidence, (5) label discipline |
| Limitations | Non-production, single-user, self-asserted delegation label is mandatory. F5.2 remains UNRESOLVED and preserved as history, not reclassified. This is NOT QE, NOT Gate 4, NOT Gate 5, and NOT the Gate C QE-11 subset acceptance. |
| Waiver / authorization | GC-P2-SCOPE-CORR-01 removed OIDC/JWKS/key/issuer and global-authentication work from scope; F5R CLOSED — OUT OF SCOPE |
| Evidence | docs/integration/IIPS_v3.0_GATE_C_P2_ESTABLISHMENT_EVIDENCE_RECONCILIATION_AND_TRANSFER_2026-10-14.md; evidence/integration/gate-c-p2-establishment-2026-10-14/ |
| Commit / branch / PR | IRR tracker §15.16, §15.19; PR #91 (evidence destination) |
| Cross-repository dependency | Used the pinned G24 non-production runtime ref 6828155e…; no IPD main mutation |
| Remaining residual | None for in-scope P-2 establishment. P-4/P-6/P-8 were closed by H-18 scope, not left pending. |
| Re-execution required? | No — establishment is executed and closed for in-scope criteria. Re-running it would duplicate accepted operator evidence. |
| Future analysis instruction | Never list P-2 establishment as outstanding. Never reopen F5.2 or F5R. Do not confuse this P-2 with CAP-03 P-1/P1-F or with the Gate C QE-11 result acceptance. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P2-02 — GC-P2-SCOPE-CORR-01 — scope correction and F5R disposition

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | B — P-2 / Gate C |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | PA scope correction recorded 2026-10-14 (IIPS-V3-REG12-GATE-C-P2-SCOPE-CORRECTION-F5R-DISPOSITION-2026-10-14-01) |
| Execution status | COMPLETE — EXECUTED (disposition rendered and published) |
| Acceptance status | COMPLETE — ACCEPTED; no in-scope P-2 acceptance condition remains open |
| Effective scope | Closes F5R as OUT OF SCOPE (not executed, not an active blocker); closes P-2 establishment for in-scope criteria |
| Limitations | Removes an out-of-scope condition; unlocks nothing. P-4 still required its own act; P-6 not granted; P-8 not done — all subsequently closed by H-18 scope. |
| Waiver / authorization | Is itself a scope-correction authority |
| Evidence | docs/integration/IIPS_v3.0_GATE_C_P2_SCOPE_CORRECTION_AND_F5R_DISPOSITION_2026-10-14.md; tracker §15.19 |
| Commit / branch / PR | IRR PR #92 (closed as superseded), published disposition at §15.19; matrix row 51 |
| Cross-repository dependency | None outstanding |
| Remaining residual | None |
| Re-execution required? | No — the disposition is final for this product. |
| Future analysis instruction | Do not re-request OIDC/JWKS/issuer debugging or an F5R execution. Row 51 of the 51×17 matrix is OOS/CLOSED. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P2-03 — GC-P2-DEPOSIT-DISPOSITION-01 — amended one-artifact deposit contract and its execution

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | B — P-2 / Gate C |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | PA execution directive 2026-10-14 under the standing authorization; transcribed at amended manifest §7 and tracker §15.21 |
| Execution status | COMPLETED — REPOSITORY-VERIFIED (single artifact deposited byte-for-byte and merged) |
| Acceptance status | COMPLETE — ACCEPTED with contract amendment; artifacts 2–4 removed from the required set as NEVER PRODUCED |
| Effective scope | Exactly one deposit artifact: p2-establishment-transcript.txt from the governed p2-establishment-transcript-2026-10-14.txt, with its actual coverage and limitations |
| Limitations | No complete-Blocks-A–F claim. The alternate …-014000 transcript is never substituted. Artifacts 2/3/4 must never be reconstructed, renamed or copied into the deposit set. |
| Waiver / authorization | GC-P2-DEPOSIT-DISPOSITION-01 amends the four-artifact contract to one artifact |
| Evidence | evidence/integration/gate-c-p2-establishment-2026-10-14/; docs/integration/IIPS_v3.0_GATE_C_P2_DEPOSIT_SOURCE_AUDIT_AND_ARTIFACT_DISPOSITION_REQUEST_2026-10-14.md; scope-correction §9 |
| Commit / branch / PR | Deposit commit 84a26d797d6a3a5729903a2813ecd178e8277590; parent bed03a4f798a4b9c9041db6596cd5f1bb361430c; IRR PR #96 merged f813354092b9e926ad93fb06080a7d64465aa4ae at 2026-10-14T09:20:37Z |
| Cross-repository dependency | None outstanding |
| Remaining residual | None — the amended deposit is complete |
| Re-execution required? | No — the amended deposit contract is satisfied. The superseded four-artifact text is historical. |
| Future analysis instruction | Never report the P-2 deposit as 0-of-4 incomplete. The governing contract is one artifact and it is deposited. Matrix row 50 records this as closed with no residual action. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P2-04 — P-2 designation package: GC-D4 (P2-A) and the ten execution designation values

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | B — P-2 / Gate C |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | PA acts GC-D4, GC-D5, GC-D6 (act corrected and closed at main@33bbb0f…) |
| Execution status | COMPLETE — EXECUTED (designations rendered) |
| Acceptance status | COMPLETE — ACCEPTED |
| Effective scope | P2-A option set plus ten execution values (issuer, JWKS URI, trust statement, key size, custody location, readers, generation/destruction method, rotation interval, subject, DB path) |
| Limitations | Designation authority only; it is not evidence that any runtime is configured today. |
| Waiver / authorization | Is an authority act |
| Evidence | docs/integration/IIPS_v3.0_GATE_C_P2_EXECUTION_DESIGNATION_ACT_P2-A-D1_2026-10-13.md; tracker §§15.12–15.14 |
| Commit / branch / PR | IRR tracker §15.14; act closed at main@33bbb0f… |
| Cross-repository dependency | G24 non-production runtime ref 6828155e… (reference-only) |
| Remaining residual | None |
| Re-execution required? | No — values are designated; do not re-request them. |
| Future analysis instruction | Do not report the ten P-2 values as outstanding. They were adopted in full on 2026-10-13. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P2-05 — Owner→G24 binding chain P-4 / P-6 / P-8

**Status:** DEFERRED

| Field | Value |
|---|---|
| Workstream / category | B — P-2 / Gate C |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | GC-D3 (DP-1 Option 1A′) prerequisite specification; H-18 single-user scope ceiling |
| Execution status | NOT STARTED — and closed by scope, not pending |
| Acceptance status | Out of scope / closed by decision (51×17 matrix row 33) |
| Effective scope | Historical prerequisite chain for a live owner→G24 binding |
| Limitations | The chain is retained as history. P-2 completed in scope; P-4/P-6/P-8 closed by H-18. No live binding exists and none is claimed. |
| Waiver / authorization | H-18 scope ceiling; D-2 Option B (no universal company-identity/tenant authority) |
| Evidence | Tracker §15.11–§15.19; 51×17 matrix row 33 (OOS — closed by decision); row 23 |
| Commit / branch / PR | IRR tracker §18 row 33; IPD G24 branch 6828155e… remains reference-only |
| Cross-repository dependency | G24 branch-only lineage; CV-52 admission never granted |
| Remaining residual | None as an active task. CV-52/G24 admission is tracked separately as RS-13. |
| Re-execution required? | No — closed by scope. Reopening requires a new PA decision, not a review finding. |
| Future analysis instruction | Do not list P-4/P-6/P-8 as outstanding work. Row 33 is OOS/CLOSED and must not be reopened by a reviewer. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P2-06 — Gate C result acceptance for the QE-11 read-only subset (Q1–Q4 / Q9–Q11)

**Status:** NOT STARTED

| Field | Value |
|---|---|
| Workstream / category | B — P-2 / Gate C |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | Gate E write policy rev 1 §4 QE-11; L-IPC-1 rev 2 §10; Gate 4 act |
| Execution status | NOT STARTED — no QE subset has been executed, so no subset acceptance can be rendered |
| Acceptance status | NOT RENDERED |
| Effective scope | A separate result-acceptance act over an executed QE-11 subset |
| Limitations | Distinct from Gate C P-2 establishment (CW-P2-01…04), which IS complete. A test PASS is not Gate C acceptance. |
| Waiver / authorization | None; no waiver covers this |
| Evidence | docs/integration/IIPS_v3.0_CAP02_QE_EXECUTION_MATRIX_AND_HOST_PREREQUISITES_2026-10-26.md §3 QE-11; pending register P-23 |
| Commit / branch / PR | IRR pending register P-23; tracker §16.247 G8/G10 |
| Cross-repository dependency | Requires IPD-side QE execution on the designated host |
| Remaining residual | RS-08 — genuinely outstanding, downstream of QE execution |
| Re-execution required? | Yes — but only after the QE subset is actually executed under the effective Gate 4 pin; not before. |
| Future analysis instruction | Keep this separate from the completed P-2 establishment. Do not mark it complete because P-2 closed, and do not mark P-2 open because this is open. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-01 — PF-01 — host identity

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | hostname exactly the PA-designated host (desktop-no0nhtp) |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. |
| Waiver / authorization | PA-20 waives Windows/operator-evidence blockers; it does not establish the host fact for a future session. |
| Evidence | Capture file 01; §16.148 V983 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Re-observation inside the authorized attempt session (part of RS-06 S3). |
| Re-execution required? | No — not as a standalone task. Only inside a future authorized S3 session. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-02 — PF-02 — OS edition

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | Windows 11 Home Single Language, build 10.0.26300 at capture |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. Separately, WV-02 records that the operator later observed Windows 10 Home Single Language for the F9-8 HOST check; that check remains BLOCKED and is waived only as a personal-scope policy prerequisite. |
| Waiver / authorization | PA-20; WV-02 (F9-8 host-edition policy prerequisite waived for personal non-production progression only — the Windows 11 requirement is NOT satisfied) |
| Evidence | Capture file 02; §16.148 V983; tracker §16.208.1 WV-02 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Edition drift between captures is a recorded fact, not a resolved item. Do not claim S01-PRODUCT passed. |
| Re-execution required? | No — not standalone. Do not upgrade the host or spoof host facts to satisfy it. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-03 — PF-03 — non-elevation and account SID

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | Administrator role False; current account SID recorded separately |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. |
| Waiver / authorization | PA-20 |
| Evidence | Capture file 02; §16.148 V983 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Re-observation in the attempt session. |
| Re-execution required? | No — not standalone. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-04 — PF-04 — platform and runtime

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | process.platform win32; Node v22.22.0; arch x64 at capture |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. The later S2 designated-pin run recorded Node v22.16.0; runtimes differ between sessions and neither substitutes for the other. |
| Waiver / authorization | PA-20 |
| Evidence | Capture file 03; §16.148 V983 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Re-observation in the attempt session. |
| Re-execution required? | No — not standalone. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-05 — PF-05 — flag-free node:sqlite

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | node:sqlite DatabaseSync loads without an experimental flag; ExperimentalWarning recorded verbatim |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. |
| Waiver / authorization | PA-20 |
| Evidence | Capture file 03; §16.148 V983 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Re-observation in the attempt session. |
| Re-execution required? | No — not standalone. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-06 — PF-06 — no runtime switch or install

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | Invoked node path inspected; no installation or switch evidenced |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. |
| Waiver / authorization | PA-20 |
| Evidence | Capture file 03; §16.148 V983 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Re-observation in the attempt session. |
| Re-execution required? | No — not standalone. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-07 — PF-07 — IPD clean tree at the designated pin

**Status:** OPEN — GENUINELY OUTSTANDING

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | NOT SATISFIED — affirmative wrong-pin finding (STOP, blocker T-1) |
| Effective scope | IPD HEAD/tree must equal the governing execution designation, with no tracked changes |
| Limitations | The capture evidenced a clean full-history checkout at the superseded baseline 8eec74ae…/4eba2902…, not the then-designated 001c3c80…/399fa44a…. Pins are not interchangeable. The current governing pin is itself undecided (PA-09). |
| Waiver / authorization | None — no waiver cures a wrong-pin capture |
| Evidence | Capture file 04; §16.148 V984; tracker §16.147 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | RS-06 / RS-09 — requires the effective PA-09 Gate 4 pin before any attempt-session PF-07 observation can pass. |
| Re-execution required? | Yes — inside a future authorized S3/attempt session at the PA-designated pin, not before. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-08 — PF-08 — IRR clean tree at the consumer pin

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | IRR ba64b2d5…/5e4262f1… exact and clean at capture |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. IRR main has advanced substantially since; the captured pin is historical. |
| Waiver / authorization | PA-20 |
| Evidence | Capture file 04; §16.148 V985 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Re-observation in the attempt session. |
| Re-execution required? | No — not standalone. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-09 — PF-09 — full history available

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | git rev-parse --is-shallow-repository = false |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. |
| Waiver / authorization | PA-20 |
| Evidence | Capture file 04; §16.148 V985 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Re-observation in the attempt session. |
| Re-execution required? | No — not standalone. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-10 — PF-10 — no enabling flags

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | Four IRR/IPD enabling flags plus five GATE_A_PRIME_* variables all absent (9/9) |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. |
| Waiver / authorization | PA-20 |
| Evidence | Capture file 05; §16.148 V983 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Re-observation in the attempt session. |
| Re-execution required? | No — not standalone. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-11 — PF-11 — store-path syntax and worktree exclusion

**Status:** COMPLETE — CONDITIONALLY ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | PARTIAL at capture (worktree limb enumerated-only); the root-safe ancestor-walk correction was later ACCEPTED by PA with its native-harness prerequisite WAIVED |
| Effective scope | Store path absolute, local fixed NTFS, non-synchronized, non-elevated-writable, outside every Git worktree. The corrected Find-GitWorktreeAncestor instrument (v2, blob 191f5828461286b0f6fcb688b023da5dfc68a265) is the accepted method. |
| Limitations | PA acceptance §16.158 is of the CORRECTION AND METHOD on a compatibility-assisted basis. The native Windows PowerShell 5.1 run 92d931fbb5204f74870aedf78610e29a remains NOT PASSED (exit 1) and is not relied on as a pass. The per-ancestor .git result for a real attempt session is still not captured. |
| Waiver / authorization | PA decision §16.158 option (B) — PF-11 ACCEPTED, native-harness prerequisite WAIVED by Program Authority (compatibility-assisted basis); §16.160 DC-C2 and §16.161 recovery reconciliation preserve the boundary |
| Evidence | Tracker §§16.154–16.161; evidence/integration/cap03-pf11-gate6-diagnosis-2026-10-28/; portable Python suite 8/8 OK |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Attempt-session ancestor-walk result only; the method itself is accepted and must not be re-litigated. |
| Re-execution required? | No — do not re-request the PF-11 method correction or a native harness rerun. Only the attempt-session observation remains, inside S3. |
| Future analysis instruction | Treat the PF-11 method as ACCEPTED with its native prerequisite WAIVED. Do not reopen it, do not demand a native harness pass, and do not describe the compatibility-assisted run as native. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-12 — PF-12 — store absence

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | Store and three sidecars absent at capture; write probe removed (ProbeFileRemains=False) |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. MATERIAL CHANGE: the user reports Direct P1 has since provisioned C:\iips-data\iips\user-portfolio.sqlite — the same literal designated by PF-15 F4. Store absence at that path can therefore no longer be assumed true. This does not invalidate the historical capture and isn't a Direct P1 defect; it means a legacy P1-F Execute at F4 would now meet its own S03-STORE-ABSENT stop. |
| Waiver / authorization | PA-20 for the capture; Direct P1 provisioning is separately authorized and complete as user-reported |
| Evidence | Capture file 06; §16.148 V987; PF-15 act F4; IPD src/persistence/directP1Provisioning.ts default destination |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | RS-19 — the F4 path now reportedly holds a provisioned database. Any future legacy P1-F/S3 use of F4 needs an explicit PA disposition; do not delete or overwrite the user's database. |
| Re-execution required? | No — never rerun to 'restore' absence. Deleting the provisioned store is prohibited. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-13 — PF-13 — parent location

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | Nearest existing ancestor on an NTFS Fixed volume, reparse-free (P-1-scope DISP-01) |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. StoreParentExists=True was a recorded premise delta versus §16.146's assumed absence; under DISP-01 existence is not a STOP. |
| Waiver / authorization | PA-20; DISP-01/DISP-02 |
| Evidence | Capture files 06/07; §16.148 V987 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Re-observation in the attempt session. |
| Re-execution required? | No — not standalone. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-14 — PF-14 — raw evidence location

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | Recorded SATISFIED AT CAPTURE in §16.148 — an assessment of operator-supplied capture files, not an Arena host observation |
| Effective scope | Evidence root absolute, writable, not the store path, NTFS Fixed, non-synchronized |
| Limitations | Point-in-time observation at the 2026-10-26T20:13Z capture only; session-bound. It is NOT an attempt-session capture and does NOT satisfy P-1-C. It is NOT S3 execution. S3 remains NOT STARTED and every PF item must be re-observed in the actual attempt session when S3 is eventually authorized. The governing evidence root was later designated H:\IIPS-P1-EVIDENCE by the Q-EV PA act (2026-10-30); the capture-time root is historical. |
| Waiver / authorization | PA-20; Q-EV root designation act IIPS-V3-CAP03-P1-QEV-RUN-RECORD-ROOT-PA-DESIGNATION-ACT-2026-10-30-01 |
| Evidence | Capture file 07; §16.148 V988; tracker §16.222/§16.223 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | Re-observation against the designated root in the attempt session. |
| Re-execution required? | No — not standalone. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-15 — PF-15 — IPC endpoint / local-state designation

**Status:** EFFECTIVE — AUTHORIZATION/WAIVER

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | COMPLETE — EXECUTED (PA designation rendered and published) |
| Acceptance status | COMPLETE — ACCEPTED as configuration authority; act …-02 EFFECTIVE |
| Effective scope | F1–F6 designated, including the explicit named-pipe endpoint \\.\pipe\iips-user-portfolio-v1 and store path C:\iips-data\iips\user-portfolio.sqlite. Act IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02, blob 3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d, 11,860 B, SHA-256 1f5c9e1d9d69cf15a51ec77e41bd70f07ba69516d6a944bf3a79678c6c19a033. |
| Limitations | Configuration authority only. It does not prove a Windows pipe exists, that a provider is running, or that host preflight passed. Residual Q-P1: §16.170 measured the -01 and -02 F2/F4/F5 bytes as IDENTICAL, so the stated 'excess backslashes' premise of the correction is not reproduced in committed bytes; only the PA can confirm the intended code points. That residual does not revoke the effective designation. |
| Waiver / authorization | Is itself the authority. Supersedes act …-01 for operative values; …-01 preserved as historical. |
| Evidence | docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md; tracker §16.137.6 receipt; §16.170 V1219/V1220 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | RS-20 — Q-P1 byte-level PA confirmation of F2/F4/F5, if any future host operation depends on those literals. |
| Re-execution required? | No — the designation is effective. Do not re-render F1–F6 or re-request the designation. |
| Future analysis instruction | Never report PF-15 as NOT DESIGNATED. It is DESIGNATED / EFFECTIVE and is no longer an undecided PA value. Keep the Q-P1 literal-confirmation residual distinct from the designation's effectiveness. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-16 — PF-16 — authority text confirmation

**Status:** OPEN — GENUINELY OUTSTANDING

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | NOT SATISFIED consequentially — fails on its pin element because PF-07 failed |
| Effective scope | Exact Act IDs, pins, store, order and adoption digest confirmed with no placeholder |
| Limitations | The failure is derivative of the undecided/wrong execution pin, not an independent missing document. PF-15 and the Gate 4 / H-12 R5 acts exist and are readable. |
| Waiver / authorization | None |
| Evidence | §16.148 (PF-16 fails consequentially on its pin element); tracker §16.247 G10 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | RS-09 — PA-09 effective Gate 4 QE/H-12 pin designation. |
| Re-execution required? | Yes — only after PA-09 designates the pin, inside the authorized S3 session. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-PF-17 — PF-17 — no prior P-1 consumption

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | C — PF-01…PF-17 host preflight |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CAP-03 host readiness packet §2; Gate 4 act §6 step S3 / §12 |
| Execution status | Historical observation recorded (not an execution of S3) |
| Acceptance status | INSUFFICIENT at capture — no dedicated transcript; register state itself confirmed UNSPENT from §§16.146.4/16.147 |
| Effective scope | Compare the PA consumption register/receipt with the act; execution must be unspent |
| Limitations | The register comparison was satisfied historically. The CURRENT P1-F consumption state is NOT RECONCILED / RETRY_BLOCKED (§§16.230, 16.233, 16.245) because the designated H:\IIPS-P1-EVIDENCE root has not been inspected. Direct P1 neither consumes nor reconciles P1-F. |
| Waiver / authorization | PA blanket act §2 grants one fresh P1-F Execute (UNSPENT) without inferring prior consumption; PA pre-start-retry act is separate and evidence-gated |
| Evidence | §16.148 V989; tracker §§16.230, 16.233, 16.241, 16.245, 16.246 |
| Commit / branch / PR | IRR tracker §16.148 (CV-CORR-128; V982–V992); capture files 01–08 held in the IRR evidence tree |
| Cross-repository dependency | Requires the operator's designated Windows host and the effective Gate 4 execution pin (PA-09 open) |
| Remaining residual | RS-05 — P1-F historical consumption reconciliation from raw host evidence. |
| Re-execution required? | No — do not run P1-F, a retry, or a claim/marker action to resolve it. Only the operator's authorized Windows-side verifier can supply the missing positive proof. |
| Future analysis instruction | Do not report this item as an unexplained gap or as S3 progress. Record it as a historical capture observation. Do not request a new capture merely to refresh it; a fresh observation is required only inside a future authorized S3/attempt session. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P1-02 — Direct P1 Windows provisioning run on the user's laptop

**Status:** COMPLETED — USER-REPORTED EXECUTION

| Field | Value |
|---|---|
| Workstream / category | D — P1 provisioning |
| Owning repository | Operator Windows host (user-owned); recorded in IRR (ramkivs/iips-review-recovered) and IPD (ramkivs/iips-production-market-data) |
| Original authority | IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01 §4; IPD Direct P1 handoff §1 |
| Execution status | COMPLETED — USER-REPORTED EXECUTION: SUCCESS / PROVISIONED; DP-V1…DP-V9 reported independently verified by the user |
| Acceptance status | Not separately accepted by a PA acceptance act; recorded as user-reported execution evidence. No Gate 4/G14 credit decided. |
| Effective scope | One local personal non-production SQLite database at C:\iips-data\iips\user-portfolio.sqlite, 102,400 bytes, SHA-256 e9b1d66c505eded34d1dd48ec86550026c930101709eb4901455ace6554b94f; reported integrity ok, four migrations verified, zero FK violations, Gate E write guard enforced, audit chain valid, active binding present, initially zero portfolios/revisions/holdings/contributions |
| Limitations | Arena did not access the Windows machine or database, did not run the command, and did not obtain the DP-V1…DP-V9 raw outputs. 'Independently verified' records the user's report, not an Arena verification. It does not consume, prove or reconcile any P1-F claim/marker/process-start. |
| Waiver / authorization | IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01 (governing order). The Direct P1 waiver does NOT waive P1-F, Gate A′, Gate 4 or Gate 5. |
| Evidence | docs/integration/IIPS_V3_DIRECT_P1_IRR_CONSUMPTION_RECORD_2026-11-01.md §2; docs/integration/IIPS_V3_CAP03_DIRECT_P1_P1F_AUTHORITY_RECONCILIATION_2026-11-01.md §3.2; tracker §16.246 |
| Commit / branch / PR | IRR PRs #425 / #426; tracker §16.246 (CV-CORR-226; V1983–V1994) |
| Cross-repository dependency | Executed against IPD PR #118 implementation at 279d1eed… |
| Remaining residual | None for provisioning. The separate Windows IPC smoke test is CW-P1-05 / RS-01. |
| Re-execution required? | No — ALREADY SUCCESSFULLY EXECUTED BY THE USER. Do not request, schedule or perform another provisioning run. Do not reprovision, delete or overwrite the database. |
| Future analysis instruction | Record as COMPLETED — USER-REPORTED EXECUTION. Never list Direct P1 provisioning as outstanding, never request a rerun, and never relabel it as a P1-F execution or as Gate 4 qualification evidence. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P1-04 — IRR read-only IPC composition of the Direct P1 store (three owner-scoped HTTP reads)

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | D — P1 provisioning |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01 §4 one-pass implementation/integration/publication scope |
| Execution status | COMPLETED — REPOSITORY-VERIFIED (implemented, tested, merged, exact-head CI green, remote read-back) |
| Acceptance status | COMPLETE — ACCEPTED as IRR code/test behaviour against synthetic IPC and the exact source pin; NOT accepted as a data-backed owner read |
| Effective scope | GET/HEAD /api/user-portfolios, /:portfolioId, /:portfolioId/revisions over the existing IpcUserPortfolioPort. Empty G2Scope; no Authorization/cookie/tenant-claim reads; IIPS_G3_IPC_BINDING_PROVISIONED is a fail-closed server precondition, not proof of binding. Context discovery and all writes remain 503 operation-not-admitted. No SQLite access, no second store, no network fallback. |
| Limitations | Validation used a synthetic contract-v1 Unix-socket peer. It does not use SQLite, run IPD provisioning, verify Windows named-pipe ACL behaviour, or prove the user's provider is running. Focused suite 11 files / 169 tests; full suite 109 files / 1,365 tests; both typechecks and build passed. |
| Waiver / authorization | IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01 §4; no write authorization inferred; Gate E W-1 unchanged |
| Evidence | docs/integration/IIPS_V3_DIRECT_P1_IRR_CONSUMPTION_RECORD_2026-11-01.md §§1–8; frontend/server/user-portfolio/userPortfolioDirectP1Integration.test.ts |
| Commit / branch / PR | IRR PR #424 merge abb5bdaf9dcae7586b2a2ab1b66c81461eca1f97, tree 20786750a3756cf16e816a48b1e919fafc45012a; PR head dcd9c27eb8ea0af66b8cab8d90221c8711e4ea99; exact-head CI 41329410819; earlier code snapshot 0e08b4c / CI 41329226260 |
| Cross-repository dependency | Pinned to IPD 279d1eed184f5e23bbabe5c6411085e120ce9e41 / tree ee6a90a0… |
| Remaining residual | Windows named-pipe smoke test (CW-P1-05 / RS-01) |
| Re-execution required? | No — the IRR composition is complete and merged. Do not reimplement or re-test to reconstruct history. |
| Future analysis instruction | Do not describe IRR's synthetic Unix-socket tests as Windows E2E verification. Do not request another IRR integration implementation. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P1-05 — Windows named-pipe smoke test: start the already-provisioned IPD provider + IRR and read the list

**Status:** OPEN — GENUINELY OUTSTANDING

| Field | Value |
|---|---|
| Workstream / category | D — P1 provisioning |
| Owning repository | Operator Windows host; procedure owned by IPD (ramkivs/iips-production-market-data) and IRR (ramkivs/iips-review-recovered) |
| Original authority | IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01 §4; IPD docs/DIRECT_P1_PROVISIONING.md §6; IRR consumption record §6 |
| Execution status | NOT STARTED — no Arena or repository observation of a live named-pipe response exists |
| Acceptance status | Not rendered |
| Effective scope | Start node <IPD_REPO_ROOT>\dist\src\ipc\entrypoint.js with IIPS_G3_DATABASE_PATH and IIPS_G2_IPC_ENDPOINT; start IRR with IIPS_G2_IPC_ENDPOINT, IIPS_G3_IPC_BINDING_PROVISIONED=true, EXEC_TRANSPORT_PORT=8787; request GET /api/user-portfolios and expect HTTP 200 {"portfolios":[]} |
| Limitations | This is a runtime read only. It is not provisioning, not a write, and not Gate 4 qualification. The provider must be launched from a local IPD checkout built with npm run build:tsc; it is not in the npm package. |
| Waiver / authorization | IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01 §4 covers local startup/verification; no new authority needed |
| Evidence | IRR consumption record §6 'Next action'; IPD docs/DIRECT_P1_PROVISIONING.md §6; tracker §16.247 §3.2 |
| Commit / branch / PR | IRR tracker §§16.246–16.247; IPD PR #119 |
| Cross-repository dependency | Depends on the already-provisioned database (CW-P1-02) and the merged IRR composition (CW-P1-04) |
| Remaining residual | RS-01 — genuinely outstanding operator runtime check; does not block unrelated work |
| Re-execution required? | Yes — one operator read-only smoke test on Windows. Explicitly NOT a reprovisioning run and NOT a write. |
| Future analysis instruction | Request only the smoke test, never reprovisioning. Record the result as operator-executed evidence with its provenance. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P1-06 — P1-F legacy authorization act and its one-attempt semantics

**Status:** EFFECTIVE — AUTHORIZATION/WAIVER

| Field | Value |
|---|---|
| Workstream / category | D — P1 provisioning |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | IIPS-V3-CAP03-P1-AUTHORIZATION-ACT-2026-10-29-01 §6; superseded for fresh authority by IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01 §2 |
| Execution status | NOT EXECUTED to a verified completion — consumption NOT RECONCILED |
| Acceptance status | No acceptance; authorization only |
| Effective scope | Legacy Gate A′ Execute entrypoint node dist/persistence/gateAPrimeProvisioning.js --mode execute at IPD a891802e…/76f083d7…, designated root H:\IIPS-P1-EVIDENCE, per-attempt claim/marker, one-use commitment at marker/process-start |
| Limitations | Authorization is not execution. The blanket act grants ONE fresh attempt (AUTHORIZED — ONE ATTEMPT ONLY — NOT EXECUTED — UNSPENT) and expressly does not infer whether the historical attempt was consumed. A pre-existing claim/marker remains a technical stop. |
| Waiver / authorization | IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01 §2 (fresh one-attempt authority); IIPS-V3-CAP03-PA-P1F-PRESTART-RETRY-AUTHORIZATION-2026-11-01-01 (pre-start retries only, evidence-gated) |
| Evidence | docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md; docs/integration/IIPS_v3.0_CAP03_PA_P1F_PRESTART_RETRY_AUTHORIZATION_2026-11-01.md; tracker §§16.206, 16.235, 16.241 |
| Commit / branch / PR | IRR tracker §§16.206, 16.235, 16.241; PRs #379/#404/#417 |
| Cross-repository dependency | Pinned to IPD a891802e2691bd9c65a67d6abff20d8ce0c26d7d / tree 76f083d7… |
| Remaining residual | RS-05 — historical consumption reconciliation |
| Re-execution required? | No — do not execute or retry P1-F. It is not a prerequisite for the completed Direct P1 path. |
| Future analysis instruction | Never treat P1-F UNSPENT/NOT RECONCILED/RETRY_BLOCKED as a blocker for Direct P1. Never run P1-F to resolve the historical question. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P1-07 — P1-F retry-readiness determination and canonical historical IPD checkout recovery

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | D — P1 provisioning |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | IIPS-V3-CAP03-PA-P1F-PRESTART-RETRY-AUTHORIZATION-2026-11-01-01; tracker §16.245 |
| Execution status | COMPLETE — EXECUTED (investigation and determination completed); result RETRY_BLOCKED |
| Acceptance status | COMPLETE — ACCEPTED as a bounded readiness determination; no execution authority consumed |
| Effective scope | Confirmed the canonical repository is ramkivs/iips-production-market-data (the requested ramkivs/ipo-screening-engine returned HTTP 422 for the exact commit); created a detached Linux sandbox checkout at /home/user/iips-p1f-execution-a891802e with matching tree and all 15 S02 blob IDs |
| Limitations | The sandbox checkout is NOT the designated Windows host checkout. H:\IIPS-P1-EVIDENCE is not mounted, so no failure summary, seal, claim, marker or process-start evidence was read. Missing host evidence is not a clean pre-start result. |
| Waiver / authorization | Pre-start-retry authority is effective but its positive sealed-evidence prerequisite is unmet |
| Evidence | docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_SOURCE_TO_SCRIPT_VERIFICATION_2026-10-29.md §S/§T; tracker §16.245 V1973–V1982 |
| Commit / branch / PR | IRR PR #422 merge fc2e609a5dbdd7194bcca985b9a671ac9dbb35d4, tree 7fc0b980…; PR #423 merge 24c5cc4a… |
| Cross-repository dependency | IPD a891802e… verified 34 ahead / 0 behind IPD main |
| Remaining residual | RS-05 — operator-side positive sealed proof for every prior attempt and retained claim |
| Re-execution required? | No — the investigation is complete. Do not repeat the checkout recovery or the pin investigation. |
| Future analysis instruction | Cite §16.245 for the repository-identity finding and the RETRY_BLOCKED basis. Do not re-derive them. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P1-08 — P-1-C preflight/capture integrity limb

**Status:** OPEN — GENUINELY OUTSTANDING

| Field | Value |
|---|---|
| Workstream / category | D — P1 provisioning |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | Tracker §16.140.4 / §16.151; successor act §8 step 0 |
| Execution status | NOT ESTABLISHED — no complete attempt-session capture with independent byte read-back exists |
| Acceptance status | Not accepted |
| Effective scope | A complete raw capture of step 0 and PF-01…PF-10, PF-14, PF-16, PF-17 taken in the attempt session immediately before the intended legacy P-1 attempt, with independent byte read-back |
| Limitations | Historical 2026-10-26/27 captures are session-bound and cannot satisfy a future attempt. Applies to the LEGACY P-1/P1-F route only; it is not a Direct P1 prerequisite. |
| Waiver / authorization | PA-20 waives the Windows/operator-evidence blocker in the governance sense; it does not establish the capture |
| Evidence | docs/integration/IIPS_v3.0_CAP03_P1C_P1D_ONE_PASS_RECONCILIATION_AND_PA_PACKET_2026-10-28.md §4; tracker §§16.148, 16.152 |
| Commit / branch / PR | IRR tracker §§16.148–16.152; §16.246 preserves the boundary |
| Cross-repository dependency | Legacy IPD Gate A′ route at a891802e… |
| Remaining residual | RS-05/RS-06 — only relevant if the legacy route is ever pursued again |
| Re-execution required? | No — not for Direct P1. Only inside a future separately authorized legacy attempt. |
| Future analysis instruction | Scope P-1-C strictly to the legacy P1-F route. Never present it as a blocker to Direct P1 or to unrelated documentation work. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P1-09 — P-1-D F4 store/parent designation limb

**Status:** PARTIAL

| Field | Value |
|---|---|
| Workstream / category | D — P1 provisioning |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | PF-15 corrected act …-02 row F4; tracker §16.151 |
| Execution status | DESIGNATED; NOT VERIFIED FOR THE ATTEMPT |
| Acceptance status | Designation accepted; attempt-level host verification not rendered |
| Effective scope | F4 store path C:\iips-data\iips\user-portfolio.sqlite is a stable PA designation |
| Limitations | Three host limbs were open at assessment: per-ancestor .git result, sync attestation, writability method. The user-reported Direct P1 database now occupies this same literal, which changes the store-absence premise for any legacy attempt. |
| Waiver / authorization | PF-15 act …-02; PF-11 method acceptance §16.158 |
| Evidence | docs/integration/IIPS_v3.0_CAP03_P1C_P1D_ONE_PASS_RECONCILIATION_AND_PA_PACKET_2026-10-28.md §5; PF-15 act F4 |
| Commit / branch / PR | IRR tracker §§16.137, 16.151–16.158 |
| Cross-repository dependency | Same literal used by the IPD Direct P1 provisioner default destination |
| Remaining residual | RS-19 — F4 occupancy by the provisioned Direct P1 database |
| Re-execution required? | No — do not re-verify by touching the store. Any legacy reuse of F4 needs an explicit PA disposition first. |
| Future analysis instruction | Do not request deletion, movement or re-creation of the F4 database. Record the occupancy interaction rather than treating it as a defect. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-P1-10 — Q-EV evidence-root designation, operator read-only verification and existing-DACL acceptance

**Status:** COMPLETED — USER-REPORTED EXECUTION

| Field | Value |
|---|---|
| Workstream / category | D — P1 provisioning |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | IIPS-V3-CAP03-P1-QEV-RUN-RECORD-ROOT-PA-DESIGNATION-ACT-2026-10-30-01; operator acceptance record …-DACL-ACCEPTANCE-2026-10-30-01 |
| Execution status | Root designation COMPLETE — EXECUTED; operator verification COMPLETED — USER-REPORTED EXECUTION |
| Acceptance status | COMPLETE — ACCEPTED for the stated personal, single-user, non-commercial laptop environment (operator acceptance of the existing DACL) |
| Effective scope | Designated root H:\IIPS-P1-EVIDENCE; operator-reported PASS on PowerShell 5.1 host, account DESKTOP-NO0NHTP\USER, SID S-1-5-21-1872737340-673410177-2240931581-1001, local fixed NTFS H:, no SUBST, canonical root exists, not a drive root, reparse/worktree/store separation, owner match, no prior execution state/claim/marker at the time checked |
| Limitations | Operator-supplied verification, not an Arena host observation; no raw transcript. Point-in-time absence of claim/marker is not a future-state guarantee and creates no authorization. PowerShell 5.1 verification PASS does not mean the Revision 7 script was parsed or executed. |
| Waiver / authorization | Q-EV PA designation act; operator's explicit DACL acceptance |
| Evidence | docs/integration/IIPS_v3.0_CAP03_P1_QEV_RUN_RECORD_ROOT_PA_ACT_2026-10-30.md; docs/integration/IIPS_v3.0_CAP03_P1_QEV_OPERATOR_VERIFICATION_DACL_ACCEPTANCE_2026-10-30.md |
| Commit / branch / PR | IRR tracker §§16.222–16.223 (V1712–V1737); PR #382 lineage |
| Cross-repository dependency | Root is on the operator's Windows host; not mounted in Arena |
| Remaining residual | None for the designation/acceptance. Later P1-F attempt evidence at this root was not inspectable (RS-05). |
| Re-execution required? | No — do not re-request the root verification or a second DACL acceptance. |
| Future analysis instruction | Treat the Q-EV root as designated and its DACL as operator-accepted. Do not re-request that evidence; the separate later retry-evidence gap is RS-05. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-02 — REG-06 IRR-side independent verification and reconciliation

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | IRR tracker §16.238 and §16.242; PA-19/PA-20 and the one-pass documentation scope |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED as a reconciliation record |
| Effective scope | Independent exact-clone verification of IPD PR #117 (987/986/0/1; focused 46/46; 151-entry pack) and dated correction of the stale IRR DEFERRED narrative |
| Limitations | Documentation/verification only; no IRR executable Operator Drop consumer, route, runtime registration or package-pin change |
| Waiver / authorization | One-pass documentation authority |
| Evidence | docs/integration/IIPS_v3.0_REG06_OPERATOR_DROP_IMPLEMENTATION_IRR_RECONCILIATION_2026-11-01.md; evidence/integration/reg06-operator-drop-implementation-reconciliation-2026-11-01/ |
| Commit / branch / PR | IRR PR #418 merge cf579305a6b6eebe715b08feccf544352f23ebef; receipt PR #419 merge 6e23d10049d8336b67ea75d5ca524f8835128520; tracker §16.242 |
| Cross-repository dependency | Verifies IPD PR #117 |
| Remaining residual | None |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not reopen the IRR REG-06 reconciliation or re-verify PR #117 from scratch. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-04 — Gate 3 bounded durable user-portfolio implementation and acceptance

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02; IIPS-V3-G3-AMEND-01-2026-10-22-01; acceptance IIPS-V3-G3-ACCEPTANCE-2026-10-22-01 |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED (bounded Gate 3 implementation scope only) |
| Effective scope | IPD durable store + IRR consumer/C8 set; read-only UI and contract/boundary seams on main, fenced at HTTP 503 |
| Limitations | Gate 4 host qualification, result acceptance, Gate 5 admission, runtime enablement, durable:true and any 503 lift remain NOT GRANTED |
| Waiver / authorization | Bounded implementation authority; not a qualification waiver |
| Evidence | docs/integration/IIPS_v3.0_G3_GATE3_ACCEPTANCE_RECORD_2026-10-22.md; 51×17 capability matrix (reassessed 2026-10-31), row 20/31 |
| Commit / branch / PR | IPD PR #41 merge 1cceacff…; IRR PR #157 merge 75680333…; tracker §16.77 |
| Cross-repository dependency | Cross-repository implementation pair |
| Remaining residual | Downstream Gate 4/5 (RS-07…RS-10) |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Gate 3 acceptance is complete and bounded. Do not re-request it or treat it as Gate 4 qualification. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-05 — Reports domain backend qualification and acceptance (NP-06 / F-7)

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | IIPS-V3-REPORTS-NP06-F7-QUALIFICATION-AND-ACCEPTANCE-2026-10-25-01 |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED — bounded non-production (backend) |
| Effective scope | frontend/server/reports/** (10 files) + reports-transport; F-7 qualification complete |
| Limitations | Bounded non-production backend scope. D-9 CLOSED under C4-2. Operator network-hardening evidence (P-13) is a separate non-blocking residual. |
| Waiver / authorization | CV-51 implementation authority; C4-2 header-claim clarification |
| Evidence | docs/integration/IIPS_v3.0_REPORTS_NP06_F7_QUALIFICATION_AND_CAPABILITY_ACCEPTANCE_2026-10-25.md; 51×17 capability matrix (reassessed 2026-10-31), row 35; evidence/integration/capability-matrix-51x17-reassessment-2026-10-31/IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv |
| Commit / branch / PR | IRR tracker §16.215 (D-9 closed); matrix row 35 |
| Cross-repository dependency | None outstanding for backend acceptance |
| Remaining residual | RS-16 — P-13 network hardening (non-blocking) |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Reports backend is ACCEPTED. Do not reopen F-7 or D-9. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-06 — Reports UI exposure qualification and acceptance (CV-51)

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01; IIPS-V3-REPORTS-NP06-CV51-POST-QUALIFICATION-PA-ACCEPTANCE-2026-10-25-01 |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED / CLOSED — bounded, non-production, read-only |
| Effective scope | frontend/src/features/reports/**; routes /reports and /reports/:reportId; browser qualification 92/92 source-recorded |
| Limitations | Read-only bounded scope; no write admission |
| Waiver / authorization | CV-51 Option CV51-A |
| Evidence | docs/integration/IIPS_v3.0_REPORTS_NP06_CV51_POST_QUALIFICATION_PA_ACCEPTANCE_RECORD_2026-10-25.md; 51×17 capability matrix (reassessed 2026-10-31), row 37 |
| Commit / branch / PR | IRR tracker matrix row 37; evidence/integration/cv51-reports-ui-qualification-2026-10-25/ |
| Cross-repository dependency | None |
| Remaining residual | None |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Reports UI is ACCEPTED/CLOSED. Do not re-request UI qualification. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-07 — Owner-context carrier, Class-C journal persistence and fail-closed owner fences (CV-04 / CV-10 / PF-1)

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | F-1/F-2 value acts; F-3 mechanism act; CV-04 and CV-10 acceptance |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED |
| Effective scope | Watchlists, Collaboration, Settings journal surfaces; owner-context carrier/resolver/unavailable; all twelve /api/user-portfolios* and reports fences fail closed at 503 |
| Limitations | Service-level restart qualification on Linux; owner-carrier HTTP E2E for journal surfaces (P-03) is a separate bounded residual. Acceptance is of fail-closed behaviour, not of a data-backed owner read. |
| Waiver / authorization | F-3 standing authorization for governance/implementation/publication |
| Evidence | frontend/server/persistence/persistence-service.ts; restart block 15/15; fence blobs 51704c12 / cb8db45d / 775d282b; 51×17 capability matrix (reassessed 2026-10-31), row 9–12, 34, 38 |
| Commit / branch / PR | IRR tracker §18 rows 9–12, 34, 38; evidence/integration/capability-matrix-51x17-reassessment-2026-10-31/IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv |
| Cross-repository dependency | None |
| Remaining residual | RS-15 — P-03 owner-carrier HTTP E2E (bounded) |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not report the fences as a defect; they are accepted-by-design. Do not reopen CV-04/CV-10. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-08 — NP-18 intelligence destination surface admission and isolated-main merge

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | NP-18 admission + qualification + isolated-main merge authorization |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED (bounded admission) |
| Effective scope | IntelligenceOpportunities/Risks/Rankings routes and bounded non-production qualification |
| Limitations | Bounded non-production scope only |
| Waiver / authorization | NP-18 isolated-main merge authorization |
| Evidence | evidence/integration/np18-admission/, np18-qualification/, np18-isolated-main/; 51×17 capability matrix (reassessed 2026-10-31), row 24 |
| Commit / branch / PR | IRR tracker §16.38; matrix row 24 |
| Cross-repository dependency | None |
| Remaining residual | None |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | NP-18 is admitted. Do not re-request admission. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-09 — NP-12 Governed Screener producer acceptance and qualification

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | IIPS-V3-NP12-GOVERNED-SCREENER-PRODUCT-ACCEPTANCE-AND-QUALIFICATION-RECORD-01; NP-12 screen-definition governance |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED (CV-03) |
| Effective scope | Screener surface + server/screener/**; certified N4 producer; live POST /api/screener 200 memberCount 13, 400 missing-definition, 422 client-members rejected |
| Limitations | Producer convergence A6-IMPL-10 is separately DEFERRED (Option B, recorded FINAL FOR THIS PRODUCT 2026-10-21) — the deferral is the accepted disposition |
| Waiver / authorization | NP-12 Option B deferral is an accepted disposition, not an open task |
| Evidence | docs/integration/IIPS_v3.0_NP12_GOVERNED_SCREENER_PRODUCT_ACCEPTANCE_AND_QUALIFICATION_RECORD.md; 51×17 capability matrix (reassessed 2026-10-31), row 7 and 8 |
| Commit / branch / PR | IRR tracker §16.68.5 (CV-CORR-51); matrix rows 7/8 |
| Cross-repository dependency | None |
| Remaining residual | None |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not list A6-IMPL-10 producer convergence as outstanding; Option B is final for this product. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-10 — Stage A evidence snapshot/replay acceptance

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | IIPS-V3-STAGE-A-EVIDENCE-SNAPSHOT-REPLAY-ACCEPTANCE-DECISION-2026-10-20-01 |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED at Stage A scope |
| Effective scope | ReplayExplorer route and server/replay/**; Stage A capture and replay services |
| Limitations | Stage A scope only; the v1.1 baseline is source-reported. The replay landing route is intentionally a reserved placeholder (OOS by PA Option A). |
| Waiver / authorization | PA Option A (direct-ID only, no landing product) |
| Evidence | docs/integration/IIPS_v3.0_STAGE_A_EVIDENCE_SNAPSHOT_REPLAY_PA_ACCEPTANCE_DECISION_2026-10-20.md; 51×17 capability matrix (reassessed 2026-10-31), row 15/16 |
| Commit / branch / PR | IRR tracker §16.66; matrix rows 15/16 |
| Cross-repository dependency | None |
| Remaining residual | None |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not report the replay landing placeholder as a gap; it is closed by decision. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-11 — PIT read seam admission (IRR ↔ IPD, CV-05 / Gate 43)

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | CV-05 seam admission; CV-32 API-only disposition |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED (admitted at non-production scope) |
| Effective scope | server/pit-transport.ts, server/pit/ipdPitReadAdapter.ts, nonProductionRuntimePitStore.ts; /api/pit/market-data |
| Limitations | API-only by decision; no PIT UI is intended. The historical pin anchor was reconciled by §16.179. |
| Waiver / authorization | CV-32 API-only disposition |
| Evidence | 51×17 capability matrix (reassessed 2026-10-31), row 20/21; evidence/integration/capability-matrix-51x17-reassessment-2026-10-31/IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv; tracker §16.179 |
| Commit / branch / PR | IRR matrix rows 20/21 |
| Cross-repository dependency | IRR package pin to IPD |
| Remaining residual | None |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not report the absent PIT UI as a gap; it is OOS by decision. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-12 — D115 runtime CompanyId boundary retained unwired (CV-43)

**Status:** DEFERRED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | IIPS-V3-CV43-D115-RETAIN-UNWIRED-PA-DISPOSITION-2026-10-24-01 |
| Execution status | COMPLETE — EXECUTED (disposition) |
| Acceptance status | COMPLETE — ACCEPTED as retained-unwired, not as an operational capability |
| Effective scope | server/d115-runtime.ts and its test retained on main without wiring |
| Limitations | Not qualified because not wired, by decision. Wiring requires a new PA commissioning. |
| Waiver / authorization | CV-43 retain-unwired disposition |
| Evidence | docs/integration/IIPS_v3.0_CV43_D115_RETAIN_UNWIRED_PA_DISPOSITION_2026-10-24.md; 51×17 capability matrix (reassessed 2026-10-31), row 22 |
| Commit / branch / PR | IRR matrix row 22; pending register P-05 (only if commissioned) |
| Cross-repository dependency | None |
| Remaining residual | None active |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | P-05 is DORMANT by disposition, not an open defect. Do not request wiring. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-13 — CV-23 — Gate A convergence recorded NOT REQUIRED for the current product

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | IIPS-V3-CV23-GATE-A-NOT-REQUIRED-PA-DISPOSITION-2026-10-24-01 |
| Execution status | COMPLETE — EXECUTED (disposition) |
| Acceptance status | COMPLETE — ACCEPTED |
| Effective scope | Convergence between the G24 and IPD-main persistence lines is not required for the current product |
| Limitations | Gate A is NOT passed, satisfied or waived — it is recorded as not required. Do not restate this as a Gate A pass. |
| Waiver / authorization | CV-23 disposition (not a waiver of Gate A) |
| Evidence | docs/integration/IIPS_v3.0_CV23_GATE_A_NOT_REQUIRED_PA_DISPOSITION_2026-10-24.md; tracker §16.103 |
| Commit / branch / PR | IRR tracker §16.103 |
| Cross-repository dependency | IPD G24 branch remains reference-only |
| Remaining residual | None |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not reopen convergence or describe Gate A as passed/waived. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-18 — IPD DR-2 Option A provider read envelope and IRR Option A consumer

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | DR-2 Option A determination; IPD provider act and IRR consumer implementation |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED as implementation; operational closure separate |
| Effective scope | Seven values + isSaved lifecycle, fail-closed provider envelope; matching IRR consumer |
| Limitations | Implementation complete; cross-repo operational closure (P-32 / DR-4r / DQ-3) waits on DQ-4 and Gate 5 |
| Waiver / authorization | None needed |
| Evidence | IPD evidence/cross-repository/IIPS_V3_CAP03_DR2_IPD_PROVIDER_ENVELOPE_VERIFICATION_2026-10-29.md; 51×17 capability matrix (reassessed 2026-10-31), row 31 |
| Commit / branch / PR | IPD PR #89 merge (provider) and PR #110 verification; IRR PR #265 merge e590ca40d950052e32b2813027f0d1027b9e65ec |
| Cross-repository dependency | Provider/consumer pair |
| Remaining residual | RS-12 — P-32 operational closure |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not reopen the provider/consumer implementation. Only operational closure remains. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-19 — O-06 package/ref durability of the three IPD specifiers — CLOSED

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | Tracker §16.211 (CV-CORR-191) |
| Execution status | COMPLETE — EXECUTED (investigation and closure) |
| Acceptance status | COMPLETE — ACCEPTED (criterion met) |
| Effective scope | All three frontend IPD specifiers are guarded in-tree; DQ-4 and DQ-6b Path A are the governing dispositions |
| Limitations | Package-reference durability is not a product-readiness claim. Alias modernization (P-17) is off the critical path and NOT AUTHORIZED. |
| Waiver / authorization | None needed |
| Evidence | IRR tracker §16.211; guard blobs 0a1e58de / 4f6024f0; 51×17 capability matrix (reassessed 2026-10-31), row 45 |
| Commit / branch / PR | IRR PR lineage at §16.211; matrix row 45 |
| Cross-repository dependency | IPD package exports |
| Remaining residual | None for O-06 |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | O-06 is CLOSED. Do not report an unguarded-alias defect. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-20 — O-07 documentation re-scope and CV-05 pin narrative consolidation — CLOSED

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | Tracker §16.207 (CV-CORR-187) |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED |
| Effective scope | §18.1 row 27 re-scoped; CV-05 pin narrative consolidated |
| Limitations | Closing a documentation item never captures host evidence; O-09 remains open |
| Waiver / authorization | One-pass documentation authority |
| Evidence | IRR tracker §16.207 |
| Commit / branch / PR | IRR §16.207 (CHG-2026-10-30-01; V1537–V1548) |
| Cross-repository dependency | None |
| Remaining residual | None |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | O-07 is CLOSED; do not reopen it or infer O-09 closure from it. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-21 — Consolidated outstanding-items resolution P-11 / P-18 / P-19 / P-20

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | IIPS-V3-CONSOLIDATED-OUTSTANDING-RESOLUTION-2026-10-31-01 |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED |
| Effective scope | P-11 PR #398 Windows CI fixture correction; P-18 runbook restamp (108 files / 1,377 tests); P-19 identifier allocation reconciliation; P-20 IPD PR #114 remote verification and IRR register closure |
| Limitations | These four are closed. P-33 (final G14) remains blocked and is tracked separately. |
| Waiver / authorization | One-pass documentation/verification authority |
| Evidence | docs/integration/IIPS_v3.0_CONSOLIDATED_OUTSTANDING_ITEMS_RESOLUTION_2026-10-31.md; evidence/integration/consolidated-outstanding-resolution-2026-10-31/ |
| Commit / branch / PR | IRR PR #398 merge 7fd824de30d8268ed3eca210bc664dc60749fa8c; IPD PR #114 merge 527f811b17edb02caa665b345d9f36102435e1e8 (tracker blob 5ceb5398…) |
| Cross-repository dependency | IPD PR #114 corrected the stale P-1 authorization limb |
| Remaining residual | None for P-11/P-18/P-19/P-20 |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Never re-list P-11, P-18, P-19 or P-20 as pending. The 40-row pending register already excludes them. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-22 — G14 current-state dependency audit and independent advancement reconciliation

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | IIPS-V3-CAP03-G14-INDEPENDENT-ADVANCEMENT-RECONCILIATION-2026-11-01-01 |
| Execution status | COMPLETE — EXECUTED (the audit) |
| Acceptance status | COMPLETE — ACCEPTED as a current-state overlay; final G14 NOT declared |
| Effective scope | G2–G13 status matrix, dependency edges, false-blocker corrections (PF-15 effective; H-12 R5 adopted; S2 conditionally accepted; PR #119 docs-only) |
| Limitations | The AUDIT is complete; the FINAL G14 reconciliation remains BLOCKED — NOT STARTED. Do not conflate the two. |
| Waiver / authorization | One-pass documentation authority |
| Evidence | docs/integration/IIPS_v3.0_CAP03_G14_INDEPENDENT_ADVANCEMENT_RECONCILIATION_2026-11-01.md; evidence/integration/cap03-g14-independent-advancement-2026-11-01/ |
| Commit / branch / PR | IRR PR #427 merge e62745cffa21c956eba9fab7144f6da828296b6f; receipt PR #428 merge 6f347a018dbfacbc7d5e62fe9f773b323ce9d69c; tracker §16.247 |
| Cross-repository dependency | Read-only IPD inspection at 0a3b5f0 |
| Remaining residual | RS-03 — final G14 blocked on G2–G11 |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not repeat the G14 dependency audit. Refresh it only when an upstream gate actually moves. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-23 — H-12 R5 manifest adoption for its recorded baseline

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | IIPS-V3-CAP03-G4-H12-R5-PA-ADOPTION-ACT (IRR f4649e36…, SHA-256 d0be8bef…) + bound amended-§8 supplement 6c777de6… |
| Execution status | COMPLETE — EXECUTED (adoption) |
| Acceptance status | COMPLETE — ACCEPTED for its recorded prior baseline |
| Effective scope | R5 adoption at its published pins with the IPD mirror receipt |
| Limitations | R5 adoption is NOT the final Gate 4 QE/H-12 pin. PA-09 remains open; no silent reuse of a891802e as the Gate 4 pin. |
| Waiver / authorization | Is an authority act |
| Evidence | docs/integration/IIPS_v3.0_CAP03_G4_H12_R5_PA_ADOPTION_ACT_EFFECTIVE_2026-10-25.md; IPD evidence/cross-repository/IIPS_V3_CAP03_G4_H12_R5_ADOPTION_IPD_MIRROR_RECEIPT_2026-10-25.md |
| Commit / branch / PR | IPD PRs #94/#95; IRR tracker §16.123 |
| Cross-repository dependency | IPD mirror receipt published |
| Remaining residual | RS-09 — PA-09 final pin |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | H-12 R5 is ADOPTED (not NOT ADOPTED). Older NOT ADOPTED text is superseded history. Do not regenerate H-12 without a PA-09 designation. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-24 — 51×17 capability matrix reconstruction, reassessment and verifier

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | IIPS-V3-CAPMATRIX-51X17-RECONSTRUCTION-2026-10-23-01; 2026-10-31 reassessment (CV-CORR-211) |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | SATISFIED — documentation-reconciliation scope only; not product acceptance |
| Effective scope | 51 rows × 17 dimensions, CSV/XLSX parity, 40-row genuinely-pending register, evidence-ID and checksum traceability; verifier re-run passed all checks on 2026-11-01 |
| Limitations | A matrix is an index, not an acceptance act. Row-level acceptance still rests on its cited act. |
| Waiver / authorization | One-pass documentation authority |
| Evidence | evidence/integration/capability-matrix-51x17-reassessment-2026-10-31/IIPS_V3_CAPABILITY_MATRIX_51x17_REASSESSED_2026-10-31.csv; evidence/integration/cap03-g14-independent-advancement-2026-11-01/01-capability-matrix-verification.txt |
| Commit / branch / PR | IPD PRs #64/#65/#66; IRR §16.231; matrix row 48 |
| Cross-repository dependency | Cross-repository index |
| Remaining residual | None for the artifact |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Reuse the published matrix and verifier. Do not rebuild it to answer a status question. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-25 — v1.2.0 release state

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | CV-11 |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED |
| Effective scope | Annotated tag program-v1.2.0 → commit 5decdca9… (tag object 4ec8812e…); GitHub Release published 2026-09-05, not draft/prerelease |
| Limitations | Release qualification recorded at its own date; it is not a claim about later commits |
| Waiver / authorization | CV-11 |
| Evidence | 51×17 capability matrix (reassessed 2026-10-31), row 49 |
| Commit / branch / PR | IRR tag program-v1.2.0 |
| Cross-repository dependency | None |
| Remaining residual | None |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not re-request the v1.2.0 release evidence. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-26 — Operator runbook and server start path

**Status:** COMPLETED — REPOSITORY-VERIFIED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | CV-CORR-04 procedure; P-18 restamp |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED with follow-ups; figure drift closed by the 2026-10-25/31 restamps |
| Effective scope | docs/OPERATOR_RUNBOOK.md restamped to 108 files / 1,377 tests at main@7fd824de…, frontend tree 67607e1de119a79cba4acfa9d2375493aa898bea; start path verified live |
| Limitations | Linux qualification; Windows is not claimed. Test counts drift as the suite grows — the runbook is a dated snapshot, not a live counter. |
| Waiver / authorization | One-pass documentation authority |
| Evidence | docs/OPERATOR_RUNBOOK.md; evidence receipts cited by P-18 |
| Commit / branch / PR | IRR PR #398; §16.234 P-18 |
| Cross-repository dependency | None |
| Remaining residual | None |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not report runbook count drift as a new defect without checking the dated restamp; and do not re-run the suite merely to restamp. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-27 — Sector surface bounded acceptance (PKG-08 row 4)

**Status:** COMPLETE — CONDITIONALLY ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | PKG-08-ROW4-ACCEPT-01; implementation authority PKG-08-ROW4-IMPL-AUTH-01 |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED (bounded) |
| Effective scope | frontend/src/features/sector/**; /api/sector/banking 404 by design |
| Limitations | Component/surface qualification only; operator browser E2E (P-01) remains pending |
| Waiver / authorization | None needed |
| Evidence | docs/integration/2026-10-20/PKG-08-ROW4-SECTOR-SURFACE-ACCEPTANCE-RECORD-2026-10-20.md; 51×17 capability matrix (reassessed 2026-10-31), row 4 |
| Commit / branch / PR | IRR matrix row 4; evidence/integration/sector-surface-row4-2026-10-20/ |
| Cross-repository dependency | None |
| Remaining residual | RS-15 — P-01 browser E2E |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Bounded acceptance is granted. Only the operator browser capture is pending. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-28 — Macro / D08 guarded read (NAS, CPI, IIP) acceptance at guarded-read scope

**Status:** COMPLETE — CONDITIONALLY ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR (ramkivs/iips-review-recovered) |
| Original authority | CV-32 disposition; NP-08 D08 macro acceptance records; tracker §§16.29/16.31 live E2E |
| Execution status | COMPLETE — EXECUTED |
| Acceptance status | COMPLETE — ACCEPTED at guarded-read scope |
| Effective scope | server/macro/** guarded read; offline refusal qualified; operator Windows live-source E2E established |
| Limitations | Browser live rendering not observed (P-04); sandbox MoSPI egress unavailable (P-35). Live GET in the sandbox returns 502 RETRY_BUDGET_EXHAUSTED by design. |
| Waiver / authorization | None needed |
| Evidence | 51×17 capability matrix (reassessed 2026-10-31), row 19; evidence/integration/mospi-live-e2e-windows-verification-2026-10-15/ |
| Commit / branch / PR | IRR tracker §§16.29/16.31; matrix row 19 |
| Cross-repository dependency | External MoSPI egress |
| Remaining residual | RS-15/RS-18 — P-04 / P-35 |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not report the sandbox 502 as a product defect; it is the designed offline refusal. Operator live E2E is already established. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-29 — IPD PR #42 closed with record under PA disposition

**Status:** COMPLETE — ACCEPTED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | IIPS-V3-IPD-PR42-CLOSE-WITH-RECORD-PA-DISPOSITION-2026-10-24-01 |
| Execution status | COMPLETE — EXECUTED (closed with record) |
| Acceptance status | COMPLETE — ACCEPTED |
| Effective scope | IPD PR #42 closed unmerged with a published disposition and receipt |
| Limitations | A closed-unmerged PR is a decision outcome, not missing work |
| Waiver / authorization | PA disposition |
| Evidence | docs/integration/IIPS_v3.0_IPD_PR42_CLOSE_WITH_RECORD_PA_DISPOSITION_RECEIPT_2026-10-24.md; IPD docs/integration/IIPS-V3-IPD-PR42-CLOSE-WITH-RECORD-PA-DISPOSITION-2026-10-24-01.md |
| Commit / branch / PR | IPD PRs #87/#88; IRR receipt |
| Cross-repository dependency | None |
| Remaining residual | None |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not report IPD PR #42 (or IRR #377/#204/#129/#93) as abandoned outstanding work; each was closed by decision or superseded. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |

### CW-OT-30 — Closed/superseded pull requests and branch-only lineages

**Status:** SUPERSEDED

| Field | Value |
|---|---|
| Workstream / category | F — Other completed/accepted |
| Owning repository | IRR + IPD (see owning-repository split in row) |
| Original authority | Respective closure/supersession records; full-clone ancestry censuses |
| Execution status | COMPLETE — EXECUTED (census and classification) |
| Acceptance status | COMPLETE — ACCEPTED as classification |
| Effective scope | IRR #377/#204/#129/#93 and IPD #42 closed unmerged; IRR arena/a2df3b85 tip 5eba01b6 (G-2 durable 470cc698 not an ancestor of main); historical Reports lineage 6a8afbb2bb; IPD G24 6828155e, Gate A 2ded0e98, Gate B cec70802 reference-only |
| Limitations | Branch-only code is NOT main capability and must not be counted as delivered. Equally it is not an open task unless a decision commissions promotion. |
| Waiver / authorization | H-18 / CV-23 / CV-52 boundaries |
| Evidence | 51×17 capability matrix (reassessed 2026-10-31), row 32, 36, 44; full-clone census recorded in the 2026-10-31 reassessment |
| Commit / branch / PR | IRR/IPD full-history censuses; matrix rows 32/36/44 |
| Cross-repository dependency | CV-52 admission never granted |
| Remaining residual | RS-13 — P-12 CV-52/G24 admission decision |
| Re-execution required? | No — complete work is published; reuse the recorded evidence. |
| Future analysis instruction | Do not propose merging branch-only lineages as routine cleanup. Promotion requires an explicit admission act. |
| Last verified (date + method) | 2026-11-02 — read-only re-read of published records at IRR main 6f347a0 / IPD main 0a3b5f0; GitHub API ref + PR state; no host access, no re-execution |
