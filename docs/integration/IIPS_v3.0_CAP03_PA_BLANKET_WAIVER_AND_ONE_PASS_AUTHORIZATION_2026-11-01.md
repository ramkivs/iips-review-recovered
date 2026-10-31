# IIPS v3.0 CAP-03 — Consolidated PA blanket waiver and one-pass completion authorization

- **Decision ID:** `IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01`
- **Decision date:** 2026-11-01 (Asia/Calcutta)
- **Decision-maker:** PA (Ramki; confirmed explicitly in this Arena session)
- **Scope:** IIPS v3.0 personal, local, single-user application only
- **Status:** **APPROVED — effective for the scope below; publication and operator execution records remain separate.**

## 1. Decision

The PA approves the consolidated blanket waiver and one-pass completion authorization requested in the decision packet supplied on 2026-11-01. Within the stated personal, local, single-user, non-production scope, this decision supersedes procedural stop requirements that would otherwise require a new approval between investigation, implementation, correction, testing, documentation, integration, publication, and verification. Existing PA-19/PA-20 decisions remain effective and are consolidated for this completion scope.

Routine in-scope work may proceed continuously. A pending administrative record or intermediate acceptance is not by itself a stop. Technical failures, data-integrity risks, or unavailable external dependencies must be recorded accurately; independent work continues. This act does not authorize fabrication, a false PASS, or treating an unknown observation as an observed fact.

## 2. P1-F authority, prior consumption, and S00

The prior P1-F attempt's consumption state remains historically **NOT RECONCILED**. This act does not infer that the previous attempt was consumed or unspent, and does not restate a historical report as a new finding.

To resolve the authority boundary without that historical inference, the PA grants **one fresh P1-F Execute authorization** under this decision. It is **AUTHORIZED — ONE ATTEMPT ONLY — NOT EXECUTED — UNSPENT** until an Execute claim/marker is created. The attempt is limited to the existing designated personal Windows host, exact designated evidence root, pinned IPD commit/tree, and existing single-user provisioning scope. A claim or `EXECUTE-MARKER.json` already present in the designated root remains a technical stop; this decision does not erase or overwrite prior evidence or permit a second attempt. A pre-marker stop does not authorize a retry. A marker/process-start is the one-use commitment point. No repeated P1-F attempt is authorized by this act.

**S00 is expressly addressed, not silently bypassed.** The corrected candidate may pass the consumption-status limb only when the effective decision ID above and its exact fresh-attempt status are present in the authoritative IRR `main` tracker pointer. The guard must continue to fail closed if that published authority or pointer is absent, stale, ambiguous, or revoked; and all unrelated S00 safety, identity, pin, path, evidence-root, marker, claim, freshness, and one-invocation controls remain in force. No procedure may infer prior consumption status from this new authorization.

This is not authority for Preflight, a second Execute, S2 rebuild, provisioning outside the designated operation, a production operation, or a write to the IPD Git repository. The separate capture-only Preflight decision is not needed for this one-pass scope and remains distinct.

## 3. S04 evidence-formality waiver

The PA waives the distinct original verification-output file as a procedural prerequisite for completion of the S04 recovery evidence bundle. It is not to be reconstructed solely for formality. The available authentic recovery record may consist of the original archive and original inventory, the published recovery JSON and Windows transcript, the hosted verification/audit result, and an explicit waiver record bound to this decision.

The Windows transcript remains a transcript. It must not be relabelled, copied, or represented as the distinct original verification output. No missing file may be fabricated. The bundle and its reports must state that the original verification-output file is absent and waived under this decision. The original archive and inventory bytes and the S2-DEP-A pin remain unchanged. The five historical admitted-map hash differences remain informational.

This waiver removes the missing output file as an administrative/formality blocker only. It does not claim Arena inspected the Windows filesystem, prove any unobserved host state, certify S2, or itself establish P-1 execution readiness. S04 must still validate the published archive/inventory identities and all 1,140 archive entries against the original inventory, preserve provenance, and retain/read back the resulting bundle.

## 4. One-pass completion scope

The completion team is authorized to reconcile the IRR state, resolve technical prerequisites, finalize and validate the P1-F package, complete the permitted S04 recovery/evidence handling, perform the single authorized P1-F operation through the designated host route, implement/integrate, test and correct defects, start and verify the local application, update documentation and the tracker, publish through the IRR PR route, and verify the remote authoritative artifacts. No new intermediate PA/A3/owner approval is required within this scope.

The authorization is not a claim that any of those actions has already occurred. No user acceptance of an intermediate report is needed. A single final report must distinguish completed actions, test results, and any unperformed action blocked by an external technical dependency.

## 5. Scope exclusions and repository boundary

This act applies only to the personal IIPS v3.0 application. It does not authorize production or public/multi-user deployment, unapproved IPD repository modifications, changes outside the designated IIPS repositories, or concealment of technical failures. IRR publication remains through an approved PR; no direct push to `main`. IPD Git write authority remains separate. The one fresh P1-F operation is the specific PA-authorized local operation described in section 2 and does not grant general IPD repository write access.

## 6. Operative status

The decision is effective upon the PA's explicit approval in this session. The repository record, candidate guard update, Windows S04 bundle creation/readback, and execution report are separate implementation/evidence steps. Until the decision and updated pointer are merged to IRR `main`, a candidate run must refuse at its authoritative-main freshness check. Arena has no access to the designated Windows filesystem; it must not claim to have performed the Windows recovery, readback, or P1-F Execute operation.
