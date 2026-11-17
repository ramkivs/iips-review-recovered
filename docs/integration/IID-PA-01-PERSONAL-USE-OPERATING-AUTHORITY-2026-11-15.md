# IID PA-01 — Personal-Use Operating Authority

**Record type:** Operating policy amendment — governing for the IID personal-use path
**Date:** 2026-11-15 (UTC)
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Branch:** `arena/53ff9276-iips-review-recovered`
**Applies to:** the local, single-user, non-production Windows application and its operator
**Status:** IN FORCE on publication. Supersedes the governance requirements listed in §3.

---

## 1. The governing principle

> **The application owner is the sole operational authority for their personal, single-user,
> non-production environment.**

This is one person's own computer, running their own application, against their own data. There is no
committee, no change board, no acceptance authority and no second approver. Where an older IID record
requires one, that requirement is withdrawn by §3 of this document.

**The operator may directly authorize and execute**, without asking anyone:

| Operation | Mechanism that already exists |
|---|---|
| Dataset installation and replacement | `iips-platform/src/investment/cli/ingest.ts`; verified-package replacement (§5) |
| Local runtime configuration | `IIPS_DATA_DIR` and the documented environment variables (`docs/OPERATOR_RUNBOOK.md`) |
| Identity provisioning | `iips-platform/src/investment/cli/provision-identity.ts`; `tools/windows/IID-STAGE2-IDENTITY-PROVISION.ps1` |
| Local application testing | `npm test`, `npm run test:iid`, `npm run typecheck`, the Windows drivers |
| Backup and restoration | Ordinary file copy of the data domain, verified before use (§4) |
| Routine implementation and operational verification | `verify-installed-dataset.ts`, `iid-readiness`, the candidate drivers |

Doing any of these is **ordinary local operation**, not a governed act. No decision record, admission
decision, acceptance ceremony or owner-adjudication step is required first, and none should be created.

## 2. The test a safeguard must pass

**A safeguard stays only if it addresses a demonstrable technical risk.** Concretely, it must prevent
one of: losing the operator's data, publishing bytes that do not verify, silently dropping a source or
issuer, asserting a state the application cannot actually serve, or leaving a failed change with no way
back.

A requirement does **not** survive merely because it resembles enterprise change management. "Someone
must approve this", "this needs a decision record", "this is a separate governed act" and "an assessor
may not mint an owner decision" are process shapes, not risks. Applied to a single-user local
application they add latency and paperwork and remove nothing.

**Technical prerequisite vs approval requirement.** A missing dependency, an absent file, an unverified
digest, a refused guard or an unprovisioned peer is a **real blocker** — it stops the work until the
operator fixes it. An approval ceremony is **not** a blocker and must not be recorded as one. Every
"blocked" claim in the IID path must name the technical thing that is missing.

## 3. Governance requirements removed or simplified

Each row names the requirement, where it lives, and what replaces it. The historical records that
contain these statements are **not rewritten** — they remain accurate accounts of what was believed at
the time. This table is the prospective rule.

| # | Requirement, as previously recorded | Where | Disposition |
|---|---|---|---|
| G-1 | Runtime installation is **"NOT AUTHORIZED"**; installing is a separate authorized act | Stage 4 register §7 addenda; S4-R3 reassessment §6/§8; Windows build procedure header and §12 | **REMOVED.** Installation is ordinary owner-directed local operation. The candidate-verification records still correctly say no installation *was performed* — that is a fact, not a prohibition |
| G-2 | Dataset replacement requires **"separate owner authorization and a governed replacement procedure"** | S4-R3 reassessment §8; `IID-STAGE3-WINDOWS-INSTALL.ps1` `dataset-absent` detail text | **SIMPLIFIED** to the engineering safeguards in §4–§5. The installer's refusal to overwrite is a *technical* guard and stays; what is removed is the approval layer around it |
| G-3 | **O1** — a recorded owner decision on identity population, eligibility rules and edit ownership, gating Stage 2 closure (`S2-R1`) | Stage 2 reassessment §2; Stage 4 register §7 `S2-R1`, §11; CPII-01 §8.2, §10.1 | **REMOVED as a gate.** The owner chooses their population by authoring the roster. No decision record is required and Stage 2 is not held open for one. Provenance and identifier-integrity rules are untouched |
| G-4 | **O3** — admitting committed bundles as operational inputs is "an owner decision, not an engineering call" | CPII-01 §8.1; Stage 3/4 stage tables | **SATISFIED AND CLOSED as a recurring gate.** The owner admits their own data by using it. The existing O3 records stand as history; no fresh admission decision is needed for each install |
| G-5 | **R-4** — formal owner adjudication of `L-041` / `L-042` | Stage 4 register §7 `R-4`, §11, §12.5 | **SIMPLIFIED.** These are two known technical disclosure defects. They stay listed as limitations; the owner fixes or accepts them in the normal course of maintenance. No adjudication ceremony, and they block nothing |
| G-6 | **S4-R5 / S4-R6** framed as OWNER decisions an assessor "may not mint" | Stage 4 register §7, §12.10 | **SIMPLIFIED** to ordinary maintenance choices the owner makes directly. The measurement-semantics question (S4-R5) and the operating-metrics question (S4-R6) remain real work items with real technical content |
| G-7 | **O5 / O10** — owner acceptance of the limits policy and of the Stage 1–6 track as preconditions | CPII-01 §10.1, §10.2 | **REMOVED as preconditions.** Stage 1–6 is adopted as the working sequence by this amendment. The limits policy is ordinary configuration the owner sets when they want caps enforced |
| G-8 | Stage acceptance framed as **multiple acceptance authorities** (OWNER + OPERATOR) for local acts | S4-R3 reassessment §4 rows; Stage 4 register §7 | **COLLAPSED to one authority: the owner/operator.** Evidence requirements become verification steps (§4), not sign-offs |
| G-9 | "Repeating the identity publication or reinstalling the dataset — **both prohibited**" | Stage 4 register §11 | **REMOVED.** Both are ordinary local operations. The reason given was that they are *evidence*; evidence is preserved by keeping the existing records, not by freezing the live system |
| G-10 | Dependency preparation / baseline acquisition described as a **"separate operator-governed act"** | Windows build procedure §7, §11 | **SIMPLIFIED** to plain instruction: run `npm ci`, obtain the baseline. The script still refuses to synchronize the repository automatically — a real safety property, kept |
| G-11 | **Production-style readiness** treated as a gate for personal use | Stage 4 register §11–§12; CPII-01 §8 | **RE-SCOPED.** `iid-readiness --strict` is a diagnostic that reports what the running application can serve. It is not a release gate. `ready:false` while IPD peers are absent is an accurate description of an incomplete integration, not a prohibition on using the parts that work |

**Not removed, because each names a real risk:** the installer's overwrite refusal and typed
confirmation; the candidate driver's refusal to reuse a build destination; the verifier's target guard
that refuses the portfolio store; `assertNoSilentSourceLoss`; staged-publication verification and
interrupted-publication recovery; the no-fetch/no-checkout rule in the Windows drivers. These are
engineering guards. They stay exactly as implemented.

## 4. The safeguards that replace approval

Seven, each tied to a mechanism that already exists. They are engineering steps, not sign-offs.

| # | Safeguard | How it is actually done |
|---|---|---|
| 1 | **Preserve existing user data before a destructive change** | Copy the current `<IIPS_DATA_DIR>\investment\dataset` to a dated sibling outside the runtime path before replacing it |
| 2 | **Verify the backup before relying on it** | Read the copy back through `readDataset` / `verify-installed-dataset.ts --dataset-dir <backup>` and confirm its digest equals the digest of what is being replaced. An unverified copy is not a backup |
| 3 | **Verify candidate identity and content digests** | `verify-installed-dataset.ts --expect-version sha256:…`, or the S4-R3 driver `-VerifyOnly`. The content digest is the identity; raw manifest bytes may differ by audit path |
| 4 | **Change through supported application mechanisms** | The ingestion CLI, the identity provisioning CLI, the published Windows drivers. No hand-editing of dataset JSON, no bespoke copy scripts that bypass the writer's staging |
| 5 | **Verify the result with the actual application readers** | `verify-installed-dataset.ts` against the live directory (from `iips-platform`), then `npm run iid:readiness -- --data-dir <root>` (from `frontend`) and the served coverage route. Verification uses the product's own `readDataset` and `investmentCoverageFromLocalDataset`, never a reimplementation |
| 6 | **Roll back when a change fails** | Restore the verified backup through the same supported path and re-verify. The writer already stages, verifies, swaps and restores on a survived failure; `recoverInterruptedPublication` resolves markers at the start of the next ingestion |
| 7 | **Record the operation and its result concisely** | A short durable note: what changed, the digest before and after, the verification result, where the backup is. Facts and digests, not ceremony |

Safeguards 1, 2 and 6 are why the owner's data survives a bad change. Safeguards 3 and 5 are why the
application never serves bytes that do not verify. Safeguard 4 is why the change is reproducible.
Safeguard 7 is why the next session knows what happened. None of them needs a second person.

## 5. S4-R3 — the next step under this policy

**Position.** The candidate is built and verified. Windows read-only verification passed **46/46**
(`IID-S4-R3-WINDOWS-READONLY-VERIFICATION-EVIDENCE-2026-11-15.md`), wrapper 16/16, authoritative dataset
verifier 31/0, digest
`sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b`. Nothing is installed yet.

**What changed:** installing it is now an **ordinary owner-directed local dataset replacement**. There
is no approval step, no admission decision to re-mint, no acceptance authority and no adjudication.
The owner decides to do it and does it, protected by §4.

### 5.1 A real technical constraint, found while writing this policy

Re-running `ingest.ts` **into the live dataset directory** with the three S4-R3 inputs will be
**refused**, and correctly so. `assertNoSilentSourceLoss` compares the recorded provenance
`inputs[].inputDir` strings of the installed dataset against the inputs being supplied
(`iips-platform/src/investment/ingestion/multiInput.ts`, `findDroppedSources`). The installed Stage 3
dataset records the historical `WI7-CONSUMER-MARICO-2026-11-07` and `WI8-INDUSTRIALS-KEC-2026-11-07`
directories; the S4-R3 candidate supersedes them with the refresh `marico` and `kec` directories, and
its audit paths are absolute to the build worktree. The guard therefore sees dropped sources and stops
before writing anything.

This is a **technical blocker, not an approval blocker**, and it is the guard working as designed: it
exists to stop a run silently shrinking a dataset. The intended supersession is deliberate, so the
correct move is not to weaken the guard.

### 5.2 The supported replacement

Replace the installed dataset with the **already-verified candidate package**, rather than re-ingesting
over the live directory. The candidate's ten files are the exact bytes the authoritative verifier
passed; copying them preserves that digest exactly, whereas a fresh ingestion would produce new audit
paths.

Owner-executed outline — **not performed by this documentation task**:

1. **Backup.** Copy `C:\iips-data\investment\dataset` to a dated location outside the runtime path.
2. **Verify the backup.** Confirm it reads and its digest is the current installed digest
   `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`.
3. **Verify the candidate.** `IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1 -VerifyOnly` against
   `C:\iips-candidates\S4-R3-preflight-7ef0f10`; require `VERIFY-PASS` at `sha256:bdfb2527…`.
4. **Check for publication markers.** No `.iips-staging` or `.iips-previous` may be present at the
   destination. If one is, let the ingestion CLI's recovery resolve it; do not delete markers by hand.
5. **Replace** the destination directory's contents with the candidate's ten verified files, with the
   application stopped so no reader holds a handle inside it.
6. **Verify the installed state** with the product's own reader:
   `tsx src/investment/cli/verify-installed-dataset.ts --data-dir C:\iips-data --expect-version sha256:bdfb2527… --expect-issuers 3 --expect-sectors 3 --expect-annual-periods 11 --expect-quarterly-periods 2 --expect-inputs 3`.
   Then run the readiness diagnostic and read the served coverage route.
7. **Roll back** to the verified backup and re-verify if step 6 fails.
8. **Record** the before/after digests, the verification result and the backup location.

**Update (2026-11-15): the supported command now exists.** Step 5 no longer requires a replacement outside
the writer. `iips-platform/src/investment/cli/install-verified-dataset.ts` publishes an already-verified
candidate through `writeDataset` itself, inheriting staging, verify-before-swap, move-aside restoration and
interrupted-publication recovery. It requires the expected digest, preserves `manifest.inputs` verbatim,
refuses unresolved markers unless `--recover` resolves them through the authoritative recovery mechanism,
and rolls back through the same writer if post-publication verification fails. `assertNoSilentSourceLoss`
is unchanged. The exact invocation and rollback procedure is
`IID-INSTALL-VERIFIED-DATASET-WINDOWS-PROCEDURE-2026-11-15.md`. Prefer that command over any manual copy.

**What this does not change.** Freshness stays open: all three issuers remain `STALE_STATEMENTS` /
`STALE_DATA` on the recorded clock, and installing newer bytes does not make stale statements current.
`G-4` operating metrics, `S4-R3-Infosys`, `L-041`, `L-042` and the IPD-owned Stage 5 dependencies are
untouched. Source rights remain `OPERATOR_ASSERTED`. Installing the candidate does not by itself make
the IID programme "ready", and nothing here claims it does.

## 6. Boundaries that remain, unchanged

These are engineering and ownership facts, not governance overhead:

- **Repository write boundaries.** IRR writes IRR. **IPD is not modified.** No other repository is touched.
- **No PR is merged without explicit instruction.** PR #562 stays open.
- **Source-data provenance and missing values.** An unreported input is never silently zero; derivations
  refuse rather than approximate; source excerpts and their locators are preserved.
- **Deterministic identity and dataset integrity.** Content digests, declared file hashes, the canonical
  sector vocabulary, issuer/security/listing resolution and the fail-closed identity loader are unchanged.
- **Backup and recovery capability.** Staged publication, verify-before-swap, restore-on-failure and
  interrupted-publication recovery all remain in force.
- **No fabricated evidence.** Sandbox results are never reported as host results. Operator-supplied
  transcripts are preserved verbatim. Unverified readiness is never claimed.
- **Scope.** Production, SaaS, multi-user and commercial deployment remain **out of scope**. This
  amendment grants no authority of those kinds and is not a licence or rights determination.

## 7. How to read the older records

The Stage 1–6 sequence, the remaining-action register and the completed evidence records stay as
published. Where they state a governance requirement listed in §3, **this document wins
prospectively**; where they state a technical finding, a measurement, a digest or a host result, they
stand unchanged. No historical transcript, evidence bundle or completed record is edited by this
amendment.

A future reader who finds "NOT AUTHORIZED", "owner decision required" or "separate governed act" in an
IID personal-use record should read it as **superseded by PA-01** unless it names a specific technical
risk that still applies.

## 8. Cross-references

- Roadmap: `IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` — Part C pointer.
- Stage sequence and blockers: `CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md` §8, §10.1.
- Remaining-action register: `IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` §7.
- Current S4-R3 position: `IID-STAGE4-S4-R3-READINESS-REASSESSMENT-2026-11-14.md` §9.
- Operator procedures: `docs/OPERATOR_RUNBOOK.md` §17.
- Candidate verification evidence: `IID-S4-R3-WINDOWS-READONLY-VERIFICATION-EVIDENCE-2026-11-15.md`.
