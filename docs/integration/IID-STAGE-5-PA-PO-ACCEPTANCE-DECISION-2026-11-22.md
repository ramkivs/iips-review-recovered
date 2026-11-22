# IID Stage 5 — PA/PO acceptance decision, evidence closure and Stage 6 transition

**Decision identifier:** Stage 5 acceptance under `IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md`
(no new decision-series identifier is invented; the baseline's `O10` — adoption of the Stage 1–6 track — was
already discharged by PA-01 §3 G-7, and this record is the Stage 5 instance of that track)
**Decision:** **Stage 5 — ACCEPTED by the PA/PO for the checks covered by the existing evidence; Stage 5
evidence collection — CLOSED; project advanced to Stage 6.**
**Decision owner:** Ramki — sole user and Principal Authority / Product Owner (PA/PO) of this local,
single-user, non-production IIPS application
**Recording agent:** Arena Agent Mode — records the owner's stated decision and the owner's final
verification verbatim. **No decision is rendered, extended or inferred by the agent.** No technical
observation is upgraded by this record; every limitation recorded in the evidence record stands.
**Decision date:** 2026-11-22 (UTC)
**Repository:** `ramkivs/iips-review-recovered` (IRR). **Base at authoring:** `main@03daa98272d5873431a90730541196dd5f93cd8d` (PR #620 merge)
**Delivery HEAD of the verified application:** `408f3afbb4780fed9f90ff6a3683c464714e57df` (PR #619 merge; evidence record §14.1)
**IPD reference (read-only):** pin `1ce6a829…` unchanged; IPD `main@cbb116d2…`. **Zero IPD writes.**
**Classification:** Local / Single User / Personal Use. Production, hosting, multi-user and commercial
deployment **explicitly out of scope** and unchanged by this record.

**Nature of this record:** governance recording of one owner decision plus the owner's final verification
observations. **Documentation only.** No application code, test, configuration or dependency changed; no
dataset, identity file, carrier, database, runtime directory or host setting touched; no mint; no IPD
commit, branch, PR or record.

---

## 1. Authority

PA-01 Part C of the roadmap: the owner is the sole operational authority; evidence requirements are
verification steps, not sign-offs (G-8); phase acceptance that is technical (AC-X1…AC-X7) is unchanged and
is not what this record decides. Stage acceptance for a local act is the owner's to give. The owner has
given it, in these terms (2026-11-22):

> Evidence collection for Stage 5 is CLOSED. No additional screenshots, browser checks, runtime observations,
> or evidence requests are authorised or required. Treat my personal verification as the PA/PO acceptance
> decision for the Stage 5 checks covered by the existing evidence. Publish this decision in the authoritative
> IRR documentation. Advance the project to Stage 6 in accordance with the existing roadmap.

This record is **not** a readiness assessment and does not re-assess anything.

## 2. What is accepted — and what the acceptance does not say

### 2.1 Scope of the acceptance

The acceptance covers the Stage 5 checks for which evidence exists in the IRR record on 2026-11-22:

| Check | Evidence | State at acceptance |
|---|---|---|
| D5 — active IPD owner binding | evidence record §§1–7, §11 | CONFIRMED (unchanged) |
| D6 — live portfolio IPC read | evidence record §§3–7, §11 | DEMONSTRATED (unchanged) |
| R-1 — contribution ledger in the transport environment | evidence record §12 | CLOSED GREEN (unchanged) |
| R-2 | evidence record §12 | CLOSED (unchanged) |
| D10 / P6-B — portfolio surfaces (list, `DHAN_PORTFOLIO` detail, 64 holdings, summary, valuation, weights, latest persisted revision) | evidence record §13.1 | browser-verified (first pass) |
| D10 / P6-B — Company-assessment bridge: navigation; fail-closed unavailable state | evidence record §13.2, §14.2 | navigation VERIFIED; content UNAVAILABLE (no stored chain for the tested issuer; nothing fabricated) |
| D10 / P6-B — Change-history bridge: navigation to IID-03; fail-closed empty history | evidence record §13.3, §14.3 | navigation VERIFIED — PASS; history UNAVAILABLE; comparison NOT AVAILABLE (nothing fabricated) |
| D10 / P6-B — second portfolio (procedure §6.7) | evidence record §15 (this decision's verification, §3 below) | PA/PO-verified: revision 2, 1 constituent, digest `9e5dc076ebcc…`, `UPDATED`, no import contributions |
| PR #619 delivery to the host | evidence record §14.1 | COMPLETE on HEAD `408f3afb…` |

### 2.2 What remains exactly as recorded (not upgraded, not erased)

- Assessment **content** was not rendered in any browser pass; the only stored chain is Infosys
  `IN:CIN:L85110KA1981PLC013115` report `6b6e2316-…` v1, and no browser pass reached a holding resolving to
  it. The evidence record says so and continues to say so.
- Version history and comparison were **UNAVAILABLE / NOT AVAILABLE** in every pass; no comparison was ever
  displayed and none is claimed. A comparison needs a second genuine version, which does not exist.
- The fail-closed behaviour (no cached assessment, no client-side recomputation, no reconstructed comparison,
  no fallback store) is what was verified — a correct refusal, recorded as such.
- Procedure rows **not collected** at closure: §6.6 steps 1–3 on an Infosys-resolving row (B2/B3), §6.4
  (404 path), §6.8 (console/network sweep), and the HTTP-status transcriptions of §9 rows A, C, F. They are
  **CLOSED — NOT COLLECTED, by PA/PO decision**, not passed and not failed.
- `contributionLedger` is passed through unrendered (recorded UI capability gap); peer authenticity remains
  `NOT_ATTESTED`; `IIPS_LOCAL_PERSONAL_USE` scope observation stands.
- The §13.2 issuer dispositions stand: Infosys → defect-class (no re-mint); Marico / KEC → operator CLI mint,
  not forced; any other issuer → 404 is the correct result, nothing minted.

### 2.3 Consequences for the status vocabulary

| Item | Before this record | After this record |
|---|---|---|
| P6-B / D10 | NOT ACCEPTED (awaiting remaining rows) | **ACCEPTED BY PA/PO for the covered checks; remaining rows CLOSED — NOT COLLECTED** |
| Stage 5 | IN PROGRESS — NOT ACCEPTED | **ACCEPTED (PA/PO, 2026-11-22) with the limitations of §2.2 recorded** |
| Stage 5 evidence collection | open | **CLOSED** |
| Current stage | Stage 5 | **Stage 6 — investment intelligence (IN PROGRESS; not complete)** |
| Overall IID readiness | NOT READY (Stage 5 open) | Stage 1–5 of the adopted track complete under PA-01; **Stage 6 in progress**; production NOT ADMITTED |
| IPD D02 publication | open, IPD-owned | unchanged — IPD-owned, not a Stage 5 condition for this owner |
| Marico / KEC v1 mints; second comparable version | open Stage 5 residuals, not forced | **carried into Stage 6** as its own "mint two versions per covered issuer" work (baseline §21 Stage 6); still not forced |

## 3. Final PA/PO verification — portfolio `TEST` (owner-reported, recorded verbatim in substance)

The owner verified the following directly in the running application (delivery HEAD `408f3afb…`). Arena
observed none of it. The figures are recorded because the owner directed that they be recorded; they
describe a one-row manual test portfolio.

**Portfolio status summary.** Portfolio `TEST`; Revision **2**; Total portfolio value **₹500.00**;
Constituents **1**; Weight allocation sum **100.0000 %**; Persistence status **`UPDATED`**; Digest
`9e5dc076ebcc…`; Last updated `2026-11-12T10:45:20.422Z`; Status basis: revision 2, operation **`REPLACE`**,
committed `2026-11-12T10:45:20.422Z`. The revision is a stored `REPLACE` over an existing portfolio;
`UPDATED` is the correct detail-page status (procedure §6.3 derivation: `REPLACE` at revision > 1 →
`UPDATED`). The valuation is the **persisted commit-time valuation, not a live market valuation**. The
current revision contains 1 persisted constituent — **0 active, 1 inactive**.

**Holding.** Symbol `AIIL`; Company `MANUAL:AIIL`; Quantity 1; Average buy price ₹462.00; Current price
₹500.00; Market value ₹500.00; Weight 100 %; Active **No**; Source `manual-personal`; Lineage
`e0e715ee5ff3…`. **Identity: unresolved** because the row carries neither an ISIN nor an exchange symbol;
company disposition and company/history resolution are therefore **unavailable**. This is the specified
result for such a row — **not a defect**; no company identity is inferred, invented or substituted.

**Import contributions.** None recorded for this portfolio.

**Distinction preserved.** The list page labels the portfolio **`Committed`** (`isSaved`); the detail page's
status summary shows **`UPDATED`** (derived from the stored operation of the latest revision). These are two
different fields with two different meanings, both correct; neither is a finding.

**Reconciliation to the record (Arena, repository only).** Revision 2 / 1 constituent / digest prefix
`9e5dc076` equal the transport baseline of record for the second listed portfolio id,
`PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2` (evidence record §5; procedure §5 and §6.7 expectations).
The display name `TEST` was reported by the owner; the name-to-id correspondence is owner context and is not
re-derived here. The `UPDATED` derivation matches `PortfolioStatusSummary.tsx` as described in procedure §6.3.

## 4. Stage 6 transition

### 4.1 Stage 6 as defined (authoritative text, adopted by reference)

Baseline `IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md` §21 *Stage 6 —
Investment intelligence* (branch `arena/iid-coverage-readiness-report-2026-11-11`, tip `31a9b01e…`; adopted
by CPII-01 §10.1 and by PA-01 / roadmap Part C as the working sequence):

- **Objective:** routine use — weekly review loop, change detection, dispositions on real holdings,
  persisted comparable reports.
- **Prerequisites:** Stage 5; limits policy authored for the local portfolio (operator; defaults are
  placeholders); review cadence chosen; staleness / operating-metric entry habit.
- **Existing:** IID-2/4/5 engines + UI, reports persistence (NP-04), change timeline.
- **Remaining:** operator limits policy (L-019); mint two versions per covered issuer per quarter; compare via
  ChangeTimeline / persisted reports; tune operating-metric entry per sector extension.
- **Acceptance:** a quarter of review notes referencing ≥ 2 assessment versions per holding; disposition
  rationale citations resolve (L-023); the user can answer "what changed since last review and what do we
  do about it" from the surfaces alone.
- **Evidence:** persisted report comparison outputs; disposition records with resolved citations.
- **Dependencies:** Stages 1–5 + operator process. **Independent:** no.

PA-01 G-7: the limits policy is **ordinary configuration the owner sets when they want caps enforced** — not
a gate and not an approval. Roadmap B.H: configuration path `${IIPS_DATA_DIR}/investment/policies/limits-policy.json`;
absent file ⇒ system defaults, disclosed as `limits.basis = SYSTEM_DEFAULT`. Runbook §15.3 gives the document
shape and the fail-closed rule for an invalid file.

### 4.2 First Stage 6 work item

| | |
|---|---|
| **Work item** | **S6-1 — Operator limits policy (L-019 / baseline O5)**: the owner authors the caps that encode their own risk appetite for the local portfolio |
| **Owner** | Ramki (PA/PO) — the values are the owner's; no agent may author them |
| **Prerequisites** | Stage 5 ACCEPTED (this record). `IIPS_DATA_DIR` known on the host (Stage 1). The runtime's reader for the documented path — see 4.3 |
| **Acceptance** | A disposition computed after the policy is in place reports `limits.basis = OPERATOR_CONFIG` with the owner's `policyVersion`, and the caps named in `disposition.capsApplied` / `limits.applied` are the owner's; an invalid file produces `policy_inputs_unavailable`, never silent defaults (runbook §15.3) |
| **Evidence** | one disposition record (or readback) showing `OPERATOR_CONFIG` and the policy version — host artefact, published in sanitised form |
| **Boundary** | host act on the Windows machine; IRR documentation records it; nothing IPD-owned |

Subsequent Stage 6 items, in baseline order, each awaiting the owner's election and none forced: S6-2 review
cadence chosen and recorded; S6-3 Marico / KEC v1 mints (widens the covered population reachable from the
holdings); S6-4 a second, genuinely different assessment version for a covered issuer (the only way the IID-03
comparison can show content) and the first persisted comparison; S6-5 operating-metric entry per sector
(S4-R6 / G-4 remains the open maintenance choice).

### 4.3 Prerequisite check performed for S6-1 (repository only) — a genuine open point

Before the owner relies on the documented file, one fact found in IRR `main@03daa982` must be stated:
`frontend/server/investment/dispositionService.ts` exports `resolveDispositionLimits({ policyText, asOf })`,
which parses operator policy text fail-closed exactly as the runbook describes — but a static search of
`frontend/server`, `frontend/src` and `iips-platform/src` finds **no runtime reader bound to
`${IIPS_DATA_DIR}/investment/policies/limits-policy.json`** (no reference to a `policies` directory or to
`limits-policy.json` outside documentation and tests), and no caller of `resolveDispositionLimits` outside its
own module. The documented path may therefore not yet be wired in the served application; every disposition
would continue to report `SYSTEM_DEFAULT`.

This is recorded as **S6-1 prerequisite — OPEN, IRR-owned**, not resolved here: wiring the reader is an
application change and requires **separate implementation authority**, which this record does not carry.
The first Stage 6 action therefore awaits the owner's instruction on one of: **(a)** authorise an IRR
implementation item to read the documented path (then author the policy); **(b)** proceed in Stage 6 on
`SYSTEM_DEFAULT` caps, disclosed as such, and defer L-019; **(c)** another owner-chosen path. Nothing is
pre-selected.

## 5. What this record does not do

No code change; no test run beyond the documentation validators; no mint; no synthetic or substituted data;
no change to production/hosting/multi-user/commercial scope; no IPD file written; no fetch, pull, checkout,
merge, rebase, reset or stash on the owner's Windows checkout (repository synchronisation there remains
manual and owner-controlled); no further Stage 5 evidence requested — Stage 5 evidence collection is
**CLOSED** and this record is the last Stage 5 entry.

## 6. Cross-references

| Record | Section |
|---|---|
| `IID-STAGE-5-D5-D6-WINDOWS-EXECUTION-EVIDENCE-2026-11-22.md` | §15 (final PA/PO verification, closure) and the §0 pointer |
| `IID-STAGE-5-D10-P6B-BROWSER-ACCEPTANCE-PROCEDURE-2026-11-22.md` | status line; §6.7 execution record; §9 final sheet; §10 note |
| `IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` | Part C §C.11 |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | §16.315 |
| `IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md` | authority (unchanged) |
| Baseline 2026-11-11 §21 Stage 6, §28 O5 / O10 | Stage 6 definition (unmerged branch; adopted by reference) |
