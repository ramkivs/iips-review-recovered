# IIPS v3.0 — PA adoption: C-3 deferral, canonical repository and snapshot scope

**Act ID:** `IIPS-V3-PA-THREE-DECISION-ADOPTION-2026-11-06-01`
**PA:** Ramki — explicit PA instruction in the operating session, not Arena inference.
**Approval / decision date:** 2026-11-06 (Asia/Calcutta). **Effectiveness date:** 2026-11-06 upon §5 discharge.
**Status:** **PA DECISIONS RENDERED / ADOPTED.** Publication effectiveness is discharged by the exact-head/main
CI and independent merged readback receipt; no further PA approval is sought. This frozen instrument will not
be rewritten to embed its own future commit. The final publication PR comment records the immutable receipt.
**Governing locus:** IRR main, rebaselined at `6c49a065a5ae6d797f46482303e6804e478a3840`; branch `arena/eb43a2a5-iips-review-recovered`.
**Implementation authority granted:** **NONE**. Documentation reconciliation and next-readiness preparation only.

## 1. Express authority and immutable sources

The PA expressly states:

> I am the PA and explicitly approve the following three decisions from the published Prompt 6 docket:
>
> - G4-2: C-3 deferral.
> - D01: Designate `ramkivs/iips-production-market-data` as the canonical IIPS G-2 portfolio persistence repository.
> - D04: Confirm snapshot-only holdings scope, including contribution lineage, excluding trade, cash and tax-lot accounting.

The same instruction requires unique authority IDs, effective publication, a 12-entry pending register and a next
readiness package, forbids IPD mutation/implementation and explicitly excludes the IPO engine from IIPS tracking.
It is adopted only at that exact scope. This is the required express PA choice, not the earlier generic task
authorization. No signature, external identity attestation, platform message ID or precise approval time is fabricated.

- Full verbatim instruction captured at `evidence/integration/pa-three-decision-adoption-2026-11-06/PA-INSTRUCTION.txt`. **Git blob `b4de75b2bb014d481f5f75881bb291889464c118`**;
  SHA-256 **`88893a170091f2fecadcecb6c931927cc87ad3b024cec95bf3e1e8fcca9964e3`**, 3189 bytes. This content-addressed repository record is the
  immutable reference to the actual session instruction; publication commit/path is supplied by the final receipt.
- Published Prompt 6 docket: [docs/integration/FORMAL-PA-DECISION-ADOPTION-DOCKET-2026-11-06.md](https://github.com/ramkivs/iips-review-recovered/blob/6c49a065a5ae6d797f46482303e6804e478a3840/docs/integration/FORMAL-PA-DECISION-ADOPTION-DOCKET-2026-11-06.md);
  blob **`cdaa3e1162db36cd5351bddbe1c27d26aa3122d9`**, SHA-256 **`fecd58857aa7b946da70c9ccd058f6c090185e6dc544487cbff9886ae73c7c12`**. PR #472 is merged and independently verified.
- Baseline/provenance/ID census: `evidence/integration/pa-three-decision-adoption-2026-11-06/baseline.json`.
  All four new IDs had **zero** occurrences in tracked baseline content. Three stable source decision IDs are
  retained and linked below. Earlier rendered acts, original docket wording and prior evidence remain unchanged.

Concurrent IID-4 publication #473 (`6f24c8104a92ad825548fefd20aab2fc7c86198f`) added one
post-merge verification record while this adoption was prepared. It is integrated and byte-preserved; it
changes no authority or product source. Initial #472 approval baseline and immutable source references above
remain unchanged; actual integrated publication parent is captured in the final receipt.

## 2. Rendered decisions — operative, not recommendations

### G4-2 — `IIPS-V3-CAP03-G4-C3-DEFERRAL-2026-11-06-01`

**ADOPTED — PA approval 2026-11-06; effective under §5 on 2026-11-06.**

> Adopt C-3 deferral as defined in the published A-10/Prompt 6 docket: keep the new Gate 4 content pin undesignated until the CAP-03 chain produces C′. C′ alone does not designate a three-coordinate content basis or discharge the remaining alias, lineage, inventory or effectiveness obligations. No content pin or QE execution pin is designated. Gate 4 remains unaccepted; QE remains 0/11 and Gate C/U4 NOT RENDERED. This is deferral only, not C-1 scope acceptance, C-2 implementation authority, qualification execution or acceptance.

### D01 — `IIPS-V3-G2-PORTFOLIO-REPOSITORY-DESIGNATION-2026-11-06-01`

**ADOPTED — PA approval 2026-11-06; effective under §5 on 2026-11-06.**

> Designate ramkivs/iips-production-market-data (repository ID 1361385667) as the canonical IIPS G-2 portfolio domain and persistence repository. IRR remains its consumer. Keep ramkivs/ipo-screening-engine outside IIPS architecture and dependency tracking: it is not an IPD alias, alternative persistence repository, qualification input or implementation target. Preserve historical comparison evidence as historical only. Do not transfer ownership, rename or modify either repository. This designation grants no implementation, provisioning, migration or operational authority.

### D04 — `IIPS-V3-G2-SNAPSHOT-SCOPE-CONFIRMATION-2026-11-06-01`

**ADOPTED — PA approval 2026-11-06; effective under §5 on 2026-11-06.**

> Confirm durable holdings scope as holdings snapshots, including existing broker contribution lineage, atomically persisted through the existing IPD SQLite transaction architecture. Trade, cash and tax-lot accounting are excluded; do not infer accounting transactions from snapshot differences. No accounting-ledger extension or new storage technology is authorized. This scope confirmation grants no implementation, holdings writes, qualification execution, result acceptance or operation admission.

## 3. Authority consequences and exclusions

These three decisions are removed from the **current** pending register, not erased from historical snapshots.
The authoritative current view is `evidence/integration/pa-three-decision-adoption-2026-11-06/current-register.json`:
three adopted records plus **12 remaining pending** records. Prior Prompt 5/6 JSONs and zero-adoption statements
remain factual for their publication dates; the later explicit authority here supersedes only their current status.
Docket §8, consolidated paper §10, tracker §16.263, R2 §26 and WS-A-DM §6 point to this act/current view.

D01 removes repository ambiguity for D02/D03/D05/D06/A-6 planning; D04 bounds contracts, tests and any future
admission to snapshots/contribution lineage. D03 can advance exact **documentary** semantics and test-vector
preparation; it is not adopted. D05 can prepare a bounded IPD delta and host/backup plan, but separate explicit
implementation authority is still required. D06 can draft an operation-specific checklist, not admit operations:
accepted host results and a distinct admission act are still required. D02 owner extension remains unresolved.
C-3 supplies a decision to defer, not a content freeze or a release from the other three Gate 4 questions.

No holdings writes, operational DB access, provisioning, migration, IPD source mutation, D05 implementation,
A-6 D05 expansion, Gate 4 acceptance or content/QE execution pin, production deployment/activation, trade/cash/
tax-lot ledger or inferred transactions are authorized. W-1(3)/(4) remain hard-false; U6 NOT AUTHORIZED.
QE 0/11; Gate C/U4 NOT RENDERED; Gate 5 NOT INITIATED / NOT ADMITTED; DQ-4 8/10.

No ownership transfer, new DB/driver, tenant/auth/multiuser expansion, request-supplied owner, frozen-authority,
PF-1, retention/clearing implementation or security-control weakening. Canonical target remains owner-4dc756b3 /
irr-personal-073dd1c8; evidence authority alone does not extend it to holdings; SAIRAM is display-only.
Retained-copy/restore-resurrection and OS/filesystem limitations of completed retention/clearing remain intact.

## 4. Remaining decisions and bounded next work

Pending IDs: **G4-1, G4-3, G4-4, D02, D03, D05, D06, A-5, A-6, A-7, IID-DATA, IID-L016**.
Classes remain seven CONDITIONAL, two DEFERRED and three REQUIRES SEPARATE AUTHORIZATION. None is promoted
by this act. The eight prior effective/settled crosswalk entries remain preserved; they are not newly rendered acts.

Next work item **WS-A-DH-EXEC-READINESS-02-2026-11-06** is prepared in
`DURABLE-HOLDINGS-NEXT-EXECUTION-READINESS-PACKAGE-2026-11-06.md`. The item is documentary scope/test/authority
readiness, not an authorized engineering execution. D05 and A-6 need their distinct express instruments.

## 5. Effectiveness and independent acceptance of this publication

The PA decision is rendered by the quoted express instruction, not by a PR merge. Its public effectiveness
requires all of the following, to be completed end-to-end in this work item:

1. Governing IRR main contains this exact additive instrument, instruction, current register, readiness package
   and append-only overlays, with all protected prior source/authority and concurrent IID blobs preserved.
2. Exact source head and merged-main required CI green; targeted authority/ID/wording/register/scope/static/
   whitespace validation passes. No new PA choice, IPD mirror mutation or implementation is required by these
   IRR-locus documentary decisions; prior cross-repository acts' own mirror obligations remain unchanged.
3. Independent API readback verifies correct branch/head/merge/actual parent, exact file/blob/SHA-256 identities,
   three adopted versus 12 pending entries, append-only history and protected source/controls.
4. Final publication PR comment supplies the head/merge/date/check/readback proof and the instruction's immutable
   commit/path locator. It is the receipt discharging items 1–3, not a later approval or another adoption act.

On discharge the three authority records are **EFFECTIVE**, not recommended or PA-pending. If verification fails,
stop and resolve publication only; do not enable any implementation or operational path. Decision approval is not
re-requested. Workstream A / WS-A-DM remain NOT COMPLETE even after these decisions become effective.
