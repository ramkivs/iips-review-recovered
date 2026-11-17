# `L-041` — the read-model owner's confirmation: **no appointment is recorded, and the appointment question is not mine to decide**

**Date:** 2026-11-17
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Type:** ownership determination, contract-confirmation record, and blocker statement. **No decision made on the contract.** No code changed. No status changed. No rights granted, nothing installed, IPD not written, no PR merged.
**Base:** IID branch `arena/53ff9276-iips-review-recovered` at `552f1c74f2f5d63b6a19c7a547b64139e27788dd`
(the published `L-041` correction); IRR `main` at `5967902f7a6624a576ce790457788fb4dbbd32d5`.
**Follows:** [IID L-041 dataset-classifier reconciliation, 2026-11-17](IID-L041-DATASET-CLASSIFIER-RECONCILIATION-2026-11-17.md), §7

---

## 0. Result, stated first

| Question asked | Answer |
|---|---|
| Who is the read-model contract owner? | **No appointment is recorded anywhere in the repository.** The label `read-model owner` appears in the register status cell, in the `RIV` finding and in the bundle digests manifest, but **no record names a person or role that holds it**, and no record defines who may. |
| Was the five-point confirmation obtained? | **No.** Obtaining it requires a person holding that authority. None is identified. |
| Was approval manufactured or inferred? | **No.** Nothing here records an approval. The five contract properties are separately **verified as facts about the code** (§4), which is a different thing from a decision under §3.3. |
| What does repository evidence say the authority frame is? | The frame that created the "owner/operator → owner" split has since been **collapsed**: PA-01 G-8 reduces stage acceptance to one authority, and PA-01 G-5 addresses `R-4` (the adjudication step that `L-041` waited on) as **SIMPLIFIED — no adjudication ceremony** (§3). |
| What has the owner already decided about this contract? | **Substantively, all five points — on `main`, through `W05-D1` at `6ae09ac`** (§3.4). `L-041` on this branch is a *lagging copy* of an already-decided contract, not an undecided one. |
| Is the register-owner step unblocked? | **Partly.** The contract content no longer needs deciding — `main` decided it. What remains blocked is **who may act on this branch's register**, which is an appointment question, not an engineering one (§6). |

**The honest finding is uncomfortable and is not smoothed over:** the artifact this task asked for cannot be
produced by me without manufacturing authority. The one thing worse than recording "confirmation outstanding"
would be recording a confirmation nobody gave, on a contract whose entire defect was *inferred* authority over
dataset rights.

---

## 1. What was asked, and what was inspected

The five points confirmation had to cover:

1. `UNKNOWN` is an accepted, published dataset-classification vocabulary member, distinct from `NONE`.
2. Both assessment and coverage read-model paths delegate classification to `classifyDataset()`.
3. Missing or insufficient `sourceRights` remains fail-closed as `UNKNOWN`.
4. Provider labels, licence text or other free-text metadata must not independently promote a dataset to
   `OPERATOR_SUPPLIED`.
5. The historical `L-041` divergence evidence and its pinned digest remain preserved.

Inspected: the published correction `552f1c7`; `l041ClassifierReconciliation.test.ts`; the register's `L-041` entry
(§17.26, row, and status cell); `RIV` finding B and `digests.json`; `IID-PA-01`; the W05 qualification record; the
W05 status/reconciliation record; the W05 source-rights assessment; and the `L-041` reconciliation record itself.

### 1.1 Every occurrence of the label in the repository

| Location | Text | Names a holder? |
|---|---|---|
| Register §17.26 status cell | `OPEN (contract decision: read-model owner)` | **No** — a role, never a person |
| `RIV` finding B §"Why it was NOT corrected here" | "the register owner's / read-model owner's call" | **No** |
| `evidence/.../digests.json` | `"contract decision for read-model owner"` | **No** |
| `rivHeadRevalidation.test.ts:265` | asserts the cell text | **No** |
| `IID-L041-DATASET-CLASSIFIER-RECONCILIATION-2026-11-17.md` §7 | my own prior record | **No** |

**Searches that found nothing:** a `CODEOWNERS` or `OWNERS` file (none exists); any `ownership` or role-assignment
artifact; any sentence of the form "the read-model owner is …" or any designation of a person to that role. There is
**no role-assignment mechanism in this repository at all** — roles appear only as adjectives in prose.

### 1.2 Why "register owner" cannot be assumed to mean "read-model owner"

`L-041`'s cell names **two** different authorities joined by a slash — "the register owner's / read-model owner's
call" — which is exactly the ambiguity the finding left open. They cannot be treated as one: the register is an
append-only limitation record, while the read model is a published data contract consumed by other surfaces. Even if
the Principal is taken to hold the register, the finding itself distinguishes the read-model contract decision as a
*separate* call. Reading the slash as "either will do" would be inventing a delegation.

---

## 2. Where the label `read-model owner` came from, and why it is now the wrong reference

`L-041` was raised on 2026-11-12, under a governance frame that has since been superseded **twice on this branch
alone**. The label is a fossil of that frame.

1. The finding was written to defer a decision it believed needed **two** approval authorities.
2. `PA-01` (2026-11-15, published on this branch) **collapsed that frame** (§3.2).
3. The W05 line on `main` then **took the decision the label was deferring** — as an engineering defect fix, not a
   ceremony (§3.4).

So the register cell still points at an authority that the governing policy has already dissolved, for a question
the product has already answered. That is a **documentation defect in the register cell**, and naming it is a
finding of this record — but correcting the cell is precisely the act I must not perform, because the cell is the
register's.

---

## 3. The authority frame, from repository evidence

### 3.1 The governing principle (PA-01 §1)

> **The application owner is the sole operational authority for their personal, single-user, non-production
> environment.** […] There is no committee, no change board, no acceptance authority and no second approver.

### 3.2 PA-01 §3 — the two rows that bear on `L-041` directly

| Row | Requirement removed or simplified | Disposition |
|---|---|---|
| **G-5** | **`R-4`** — formal owner adjudication of `L-041` / `L-042` | **SIMPLIFIED.** "These are two known technical disclosure defects. They stay listed as limitations; the owner fixes or accepts them in the normal course of maintenance. **No adjudication ceremony, and they block nothing**" |
| **G-8** | Stage acceptance framed as multiple acceptance authorities (OWNER + OPERATOR) | **COLLAPSED to one authority: the owner/operator.** Evidence requirements become verification steps, not sign-offs |

`R-4` is the Stage 4 register row that held `L-041` open awaiting an adjudication. PA-01 removed that requirement —
so the register is still waiting for a ceremony that the governing policy deleted.

### 3.3 PA-01 §2 — the test a retained safeguard must pass

> A requirement does **not** survive merely because it resembles enterprise change management. "Someone must
> approve this", "this needs a decision record", "this is a separate governed act" and "an assessor may not mint an
> owner decision" are process shapes, not risks. […] **An approval ceremony is not a blocker and must not be recorded
> as one.**

This is the sharpest constraint in this record. It means I may **not** write "blocked pending read-model owner
approval" as if an approval ceremony were a technical blocker. So the blocker is stated for what it actually is
(§6): an **unassigned role**, which is a documentation gap in the register, not a missing sign-off.

### 3.4 The decision has already been taken — on `main`, as `W05-D1`

This is the finding that changes the shape of the whole task. The W05 qualification record describes the read-model
contract as a **reproducible IRR code defect** and names the fix:

> **`W05-D1` — Coverage surfaces bypassed `DatasetManifest.sourceRights` and inferred `datasetClass` from
> `provider`/`licence` strings** […] **Fix:** Wired both `investmentCoverage.ts` and `identity/coverage.ts` directly
> to `classifyDataset(manifest)` (`SYNTHETIC_REFERENCE -> 'SYNTHETIC_FIXTURE'`, `OPERATOR_SUPPLIED ->
> 'OPERATOR_SUPPLIED'`, `UNKNOWN -> 'UNKNOWN'`) […] Status: **`REMEDIATED & REGRESSION-GUARDED`**.

and the W05 status record places it precisely:

> The coverage read models and `/api/investment/coverage/investment` classify by the declaration, expose it, and fail
> closed on a malformed one (defect `W05-D1`) — **`6ae09ac` (PR #568, on `main` since 2026-11-16)**.

**Three consequences.**

1. `W05-D1` **is** the read-model contract decision. It answers the finding's own open question — fourth vocabulary
   member *or* route through `classifyDataset` — by doing **both**: the member exists and the rule is shared. That is
   not an inference I am drawing; it is what the merged code does.
2. It was rendered **as an engineering defect fix under the collapsed authority**, not as a ceremony. That is
   consistent with PA-01 G-5/G-8, and it is direct evidence for how this contract is actually decided here.
3. **Therefore this branch's `L-041` is not an open contract question. It is a branch behind `main`.** The W05 status
   record says so in its own words:

   > That branch still carries the classifier that `6ae09ac` replaced […] Its limitation `L-041`, open there and on
   > PR #562, describes exactly the disagreement that no longer exists on `main`.

   and lists as §8.1 item 1 — **"repository work that needs no decision"** — precisely: *"Reconcile branch
   `arena/53ff9276-iips-review-recovered` with `main`, keeping `classifyDataset` on both coverage surfaces, then
   record `L-041` as resolved."*

**This is the decisive point for the register-owner step.** The record that `L-041` waited on has already ruled that
the remaining work *needs no decision*. My `552f1c7` correction executed that work on this branch.

---

## 4. What I *can* verify, and did: the five properties as executed facts

Distinct from a decision, and never presented as one. Executed on the published head `552f1c7`, on a clean worktree.

| # | Property | Executed evidence | Result |
|---|---|---|---|
| 1 | `UNKNOWN` is a published member, distinct from `NONE` | both `datasetClass` unions read `'SYNTHETIC_FIXTURE' \| 'OPERATOR_SUPPLIED' \| 'UNKNOWN' \| 'NONE'`; probe: absent manifest → `NONE`, unestablished rights → `UNKNOWN` | ✅ |
| 2 | Both paths delegate to `classifyDataset()` | `coverage/investmentCoverage.ts:216` and `identity/coverage.ts:116` both `switch (classifyDataset(manifest))`; no substring test remains in any source path | ✅ |
| 3 | Missing/insufficient `sourceRights` stays fail-closed `UNKNOWN` | two independent shapes (`operator-file-input` + `operator-supplied; not redistributable`; `NSE` + `operator`) both → `UNKNOWN` on **all three** surfaces | ✅ |
| 4 | Free text cannot promote or demote | strings set **against** the declaration: `SYNTHETIC` rights under operator label → `SYNTHETIC_FIXTURE`; `OPERATOR_ASSERTED` under `synthetic-test-fixture` label → `OPERATOR_SUPPLIED` | ✅ |
| 5 | Historical evidence and digest preserved | `dataset-class-divergence.json` sha256 `ae45717f…e05477`; `limitation=L-041`, `status="OPEN — recorded, not corrected here"`, 3 rows, all `agree:false` | ✅ |

Every probe is on all three surfaces — assessment path, coverage report, identity-coverage disclosure — so a single
surface drifting cannot satisfy the check.

### 4.1 The correction is functionally identical to `main`'s decided fix

Verified side by side against `main`: both `financialClass()` implementations delegate to `classifyDataset()` with the
same three-way mapping, in both files, with the same widened union. I used `default:` where `main` enumerates
`case 'UNKNOWN':` — a stylistic difference inside a total switch, not a behavioural one. **The branch now implements
the contract `main` already decided.**

---

## 5. The blocker, stated exactly

Per PA-01 §2, this must name the *thing that is missing*, not an approval.

**Missing: an appointment.** No record in this repository assigns the `read-model owner` role to any person or
office, and no record establishes who may assign it. The register's status cell therefore references an authority
that cannot be located. This is a **documentation gap in the register cell**, not a technical prerequisite and not a
missing signature.

**Explicitly not blockers, and not to be recorded as such:**

- *The contract content.* Already decided on `main` as `W05-D1`/`6ae09ac`. Nothing about `UNKNOWN`, delegation or
  fail-closed behaviour is undetermined.
- *An approval ceremony.* PA-01 G-5 removed the `R-4` adjudication for `L-041` in terms: "no adjudication ceremony,
  and they block nothing."
- *Technical verification.* Complete and green (§7).

**A second, narrower limit on this record.** The regime that defines W05 is the `Snapshot-to-Live` roadmap, which
lives in the **IPD** repository (`docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`). IPD is
**unreadable here** — every call returns `403 Resource not accessible by integration`. So I could not check the
roadmap for a role definition. That is a **hard evidence limit**, recorded as such; it is not proof that no
appointment exists, only that no appointment is recorded *in IRR*, which is the only repository I am authorised to
work in.

---

## 6. Is the register-owner step now unblocked?

| Limb | Status | Basis |
|---|---|---|
| **The contract question** — is `UNKNOWN` accepted, must both paths delegate, must free text be inert, must evidence be preserved? | **No longer needs deciding.** | `main` decided it as `W05-D1` (`6ae09ac`, PR #568), and the W05 status record classifies the branch reconciliation, including "record `L-041` as resolved", as **§8.1 work that needs no decision** |
| **The evidence** — is the correction proved on this branch? | **Supplied.** | §4 above; 6/6 probes, all suites green |
| **The authority to act on this branch's register** | **Still unattributed.** | No appointment of a `read-model owner`, and no definition of who may appoint one; IPD roadmap unreadable |
| **The merge** | **Not authorised, not performed.** | Principal's act; three files conflict; out of scope here |

**So: the step is unblocked in substance and blocked in attribution.** What is needed is no longer an engineering
judgement or a contract decision — both exist. What is needed is for the register's own authority to be **named**:
either the Principal states that they hold the register-owner role for `L-041` (which PA-01's collapse of G-8 makes
the natural reading, and which `W05-FINANCIAL-COVERAGE-AND-SOURCE-RIGHTS-STATUS-2026-11-16.md` §8.2 already
presupposes by titling a section "Decisions of the Principal"), or an appointment record is created. I will not
supply that statement on the Principal's behalf.

**A register-cell defect is recorded here and left for its owner:** the `L-041` cell still reads
`OPEN (contract decision: read-model owner)`, which points at a role that PA-01 dissolved and describes a
`PARTIALLY RESOLVED` position while reporting the pre-fix status. Correcting it is the register owner's act.

---

## 7. Validation

Executed on a clean worktree at `552f1c7`, not transcribed.

| Gate | Command | Result |
|---|---|---|
| Five-property probe | inline script against all three surfaces + digest | **6 / 6 pass** |
| `L-041` regression guard | `npx tsx --test tests/investment/l041ClassifierReconciliation.test.ts` | **6 / 6 pass** |
| Coverage + endpoint | `npx tsx --test tests/investment/investment-coverage{,-endpoint}.test.ts` | **19 / 19 pass** |
| Platform IID (excl. path-sensitive suite) | `npx tsx --test $(ls tests/investment/*.test.ts \| grep -v s4R3CandidateBuild)` | **1243 / 1243 pass, 0 fail** |
| `L-041` generator + register pin | `npx vitest run server/investment/cli/rivHeadRevalidation.test.ts` | **12 / 12 pass** |
| **W05 rights classification** | `npx vitest run server/investment/cli/w05SourceRightsClassification.test.ts` | **5 / 5 pass** |
| Served coverage route | `npx vitest run server/investment/iidStage4ServedCoverageRoute.test.ts` | **11 / 11 pass** |
| Platform typecheck | `npx tsc --noEmit` | **exit 0** |

Re-reported for completeness, not worked around: `s4R3CandidateBuild.test.ts` fails only off the canonical checkout
path (its candidate manifest embeds an absolute `inputDir`), and two private IPD packages remain unfetchable in this
environment, so the full `frontend` suite is not a usable gate here. Neither is attributable to this change, and
neither was skipped silently.

---

## 8. Boundary confirmations

| Boundary | Confirmation |
|---|---|
| **`L-041` status** | **Unchanged — `OPEN`.** Register byte-untouched; the test that reads the cell still passes |
| **No approval manufactured** | **Correct.** No confirmation, sign-off, acceptance or appointment is recorded as given |
| **W05 status / rights** | **Unchanged.** W05 remains IN PROGRESS, NOT COMPLETE, NOT ACCEPTED |
| **`O3` / redistribution / installation** | **No authority granted.** No record, manifest, verification file or evidence bundle modified |
| **Historical `L-041` evidence** | **Not reopened, not rewritten.** Byte-identical and digest-pinned |
| **IPD** | **Read-only, zero writes; and unreadable (403).** Recorded as an evidence limit, not worked around |
| **PRs** | **None merged, none modified.** PR #562, #563 untouched |
| **Code** | **None changed by this record.** It is a determination and a blocker statement |

---

## 9. What would close this out

| # | Act | Who | Status |
|---|---|---|---|
| 1 | State who holds the `read-model owner` role for `L-041`, or record that the role is retired and the register owner acts | **Principal** | **OPEN — the blocker in §5** |
| 2 | Correct the `L-041` register cell to the `PARTIALLY RESOLVED` position and the retired-role reference | **register owner** | **OPEN**; evidence supplied by `552f1c7` and this record |
| 3 | Merge the branch so the correction reaches the delivered line | **Principal** | **OPEN**; three files conflict; PR #562 deliberately untouched |

Nothing in items 1–3 is an engineering gap. The five contract properties are already true of the code, already
guarded, and already decided on `main`.

---

*End of record. No confirmation was obtained, and none is claimed. The blocker is an unassigned role, evidenced; the
contract it was meant to approve was decided on `main` on 2026-11-16.*
