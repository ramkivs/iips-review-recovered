# IID — NP-04 first Infosys persistence completion and next roadmap determination

**Completion status:** NP-04 first Infosys persistence is **COMPLETE** on the owner's Windows local environment, as operator-reported execution evidence.
**Overall IID readiness:** **NOT READY**. This completion does not close IPD binding, IPC/live portfolio reads, browser acceptance, change-intelligence acceptance, or the whole IID programme.
**Date recorded:** 2026-11-15 (UTC), from the operator's operation directory `NP04-20261115T200134629Z`.
**Repository:** `ramkivs/iips-review-recovered` (IRR). **IPD was not modified.**
**Procedure executed:** `IID-NP04-PERSISTENCE-PREPARATION-2026-11-15.md` §§4A–4E.
**Tracker record:** `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.284.

## 1. Evidence class and access boundary

The Windows execution results below are **owner-supplied / operator-reported**. Arena did not execute the Windows procedure, open the Windows database, read the owner carrier, inspect the evidence directory, or repeat the mint.

Arena checked the following access paths and found them inaccessible from the Linux workspace:

- `C:\iips-backup\NP04-20261115T200134629Z` (checked as `/mnt/c/iips-backup/NP04-20261115T200134629Z` and the workspace literal);
- `H:\IIPS\runtime\np04\reports.sqlite` (checked as `/mnt/h/IIPS/runtime/np04/reports.sqlite`).

Therefore the evidence files are **named but not independently inspected**. Their contents, file hashes and JSON fields are not promoted to Arena-verified facts. The independently verified facts in this record are repository facts: the inspected IRR documents/blobs, the procedure contract, the roadmap/tracker text, and the publication read-back receipt in §8.

## 2. Operator-reported operation paths

| Object | Operator-reported value |
|---|---|
| Operation evidence directory | `C:\iips-backup\NP04-20261115T200134629Z` |
| NP-04 database | `H:\IIPS\runtime\np04\reports.sqlite` |
| Reports owner carrier | `H:\IIPS\runtime\reports-owner\reports-owner-context.json` |
| Issuer | `IN:CIN:L85110KA1981PLC013115` |
| Dataset version | `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` |

These are the first authoritative Windows literals for this operation. They supersede the preparation record's unresolved-path placeholder **for this completed operation only**; they do not authorize a different path, a second store, or a repeat mint.

## 3. Five operational sections — operator-reported results

| Section | Result | Operator-reported facts |
|---|---|---|
| §4A — source, owner and package validation | **PASS** | Source/owner/package gates passed before database open. |
| §4B — consistent SQLite backup and baseline inventory | **PASS** | Database bytes `49,152`; backup PASS; backup inventory PASS; active inventory PASS; backup/active comparison PASS; original artifact rows `2`; original chains `2`; Infosys heads `0`; baseline rows SHA-256 `483942b52d1392611d34a68183c38b13491d271116dcd15c56802be4eb7bad2d`. |
| §4C — initialization and migration verification | **PASS** | Migrations applied `0`; migration ledger entries `1`; existing rows preserved `2`; existing chains preserved `2`; Infosys heads `0`; rows SHA-256 unchanged from baseline. |
| §4D — first Infosys assessment persistence | **PASS / OK** | Outcome `CREATED`; wrote `true`; assessment `SUFFICIENT / MATERIAL_CONCERNS`; confidence `0.3210`; artifact version `1`; version count `1`. |
| §4E — independent chain read-back and preservation verification | **PASS** | Independent chain read-back PASS; canonical payload digest PASS; original records preserved `2`; new Infosys record `1`; total artifact rows `3`; total chains `3`; Infosys heads `1`; final rows SHA-256 `34443b9bdc840531c588fe25270a35f90d51d10e573c3ce26eedcdcbfc629d95`. |

## 4. Persisted artifact identity — operator-reported

| Field | Value |
|---|---|
| Report ID | `6b6e2316-d958-4187-9700-c47984a9a10a` |
| Artifact version | `1` |
| Version count | `1` |
| Report type | `investment.company-assessment` (procedure contract; operator reported the Infosys assessment mint) |
| Scope token | `co:IN:CIN:L85110KA1981PLC013115` (procedure contract for the reported issuer) |
| Dataset version | `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b` |
| Payload digest | `f80c25de6025aa6e38f64b6b303d78b4a5657ef39a44c863c625b0041f683084` |
| Input digest | `sha256:b7086ae2695e36ef0ea68a9a1f768a96ee2990ebca14520b0a533795b3508f99` |
| Assessment adequacy / quality | `SUFFICIENT / MATERIAL_CONCERNS` |
| Confidence | `0.3210` |

The report ID and digests are recorded exactly as supplied. They are not recomputed by Arena from the Windows payload.

## 5. Original-record preservation proof — operator-reported

| Checkpoint | Artifact rows | Chains | Infosys heads | Rows SHA-256 |
|---|---:|---:|---:|---|
| §4B baseline / backup inventory | 2 | 2 | 0 | `483942b52d1392611d34a68183c38b13491d271116dcd15c56802be4eb7bad2d` |
| §4C after initialization | 2 | 2 | 0 | unchanged from baseline |
| §4E after mint | 3 | 3 | 1 | `34443b9bdc840531c588fe25270a35f90d51d10e573c3ce26eedcdcbfc629d95` |

Operator-reported preservation result: original records preserved `2`, new Infosys record `1`, total rows `3`. The procedure's §4E gate requires every baseline per-row hash to remain present and exactly one new Infosys chain/version; the operator reports that gate PASS. Arena did not inspect the per-row inventory files.

## 6. Evidence directory inventory — named, not accessed

Expected files in `C:\iips-backup\NP04-20261115T200134629Z`:

- `initialization.json`
- `inventory-baseline.json`
- `inventory-active-before.json`
- `inventory-after-initialization.json`
- `infosys-preflight.json`
- `infosys-mint.json`
- `infosys-chain-readback.json`
- `infosys-payload.json`
- `inventory-after-mint.json`
- `identity-verify.json`
- `backup-result.json`
- `database-metadata.json`
- `owner-validation.json`
- `package-validation.json`

**Access status:** not accessible from Arena; not opened, hashed or parsed here. The directory and filenames are recorded so a later host review can locate them. The canonical payload and database backup remain local Windows evidence and are not committed.

## 7. What this completes, and what it does not

### 7.1 Completed / evidenced by this operation

- **NP-04 first Infosys persistence:** COMPLETE, operator-reported §§4A–4E PASS.
- **P6-A D2 / `np04-assessment-store`:** the configured Windows store was initialized/verified and populated with one Infosys assessment chain, operator-reported. A future host readiness capture should record the finding state; readiness itself still does not open the database.
- **P6-A D3 / `reports-owner-context`:** the Reports carrier passed the operation's owner gate, operator-reported.
- **P6-A D9 for IID-01 persistence:** at least one real-issuer assessment version is stored and read back in a separate process, operator-reported. This is company-assessment persistence evidence.
- **G-11 storage limb:** the prior “no assessment version exists anywhere operational” condition is no longer true for this Windows store. HTTP/browser service of the chain is **not** established by CLI read-back alone.

### 7.2 Explicitly not completed

- **Overall IID readiness:** remains **NOT READY**.
- **IID-03 change-intelligence acceptance:** one version is not a change comparison. A second comparable version and a validated change diff/read-back remain required where Stage 5 acceptance exercises change intelligence.
- **IPD D5 active binding and D6 IPC/live portfolio read:** not established by this operation.
- **D4 F-3 owner carrier / watchlist read context:** not evidenced by the NP-04 operation.
- **D10 / P6-B real-issuer browser acceptance:** not performed.
- **Stage 5 three-issuer mint scope:** Infosys v1 is complete; Marico and KEC v1 mints remain named Stage 5 operator work unless separately recorded complete. This task did not repeat or perform them.
- **R-1/R-2 host readiness and served-surface captures:** still required as host artefacts; the NP-04 operation is not a substitute for the served coverage/readiness captures.
- **Stage 4 residuals:** `G-4` operating metrics, `G-6`/`S4-R3` freshness, Infosys stale-source limitation, `L-041`, `L-042`, and `OPERATOR_ASSERTED` source rights remain unchanged. `SUFFICIENT / MATERIAL_CONCERNS` is not a freshness or source-rights closure.
- **G-10 JS-free HTML exception:** unchanged; browser acceptance must not silently treat the raw HTML identity-unavailable view as the SPA Investment Coverage surface.
- **NP-04 pagination hazard:** the preparation record's >200-chain stop remains a future technical boundary. The reported store has 3 chains, so it did not block this operation; no IPD fix was made.

## 8. Publication receipt

Initial documentation commit: **`3647be599147609cff0e093be4298c682b2e93cb`** on
`arena/53ff9276-iips-review-recovered`, parent `dda23a9614d9928c171d9ef4f32637b1477b2187`.
Remote read-back verified the commit parent/tree, the exact four-file change set, and every published
blob byte-for-byte against the local artifact:

| Path | Initial published blob | SHA-256 |
|---|---|---|
| `docs/integration/IID-NP04-FIRST-INFOSYS-PERSISTENCE-COMPLETION-2026-11-15.md` | `90f786ed7a71400447dba8860b1b8695080ae22c` | `6451de001c8b5ceb94f427546336f441c1cfcf6817dac40e9609ff57d259bae4` |
| `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` | `5642ab119f7caa20bdff6b524a9640807bf0d4f7` | `958bdda4135778c66850da34afe8c6ce9fc6a556e52745342b446666a360e4d8` |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | `cda5fe353cfd3410cc85c73a5296e4b289d0e310` | `cfddae660e157054c1a705e2077071a130968da346c87a625df538b2a2ba6998` |
| `docs/integration/IID-NP04-PERSISTENCE-PREPARATION-2026-11-15.md` | `dd663a87ec3d549361285859bce5099734376826` | `b75c27f72e84eb18cce421ef21ded8f0caa21474b40447ed14310533c0c1bb7f` |

Targeted documentation/consistency checks: **33/33 PASS** (append-only amendments, added-line
whitespace/EOL, required identifiers/digests/paths, tracker section uniqueness, roadmap/procedure
addenda, reference existence, and no overall-READY claim). This receipt section is then amended
forward by a follow-up receipt commit on the same branch; that follow-up changes only this completion
record. The final branch head and cumulative remote read-back are reported in the publishing session's
final response. No PR was merged.

## 9. Next authoritative roadmap work — determined, not implemented here

### 9.1 Next stage

The next explicitly adopted operational stage is **Stage 5 — end-to-end integration**, from the 11 November baseline §21, adopted by PA-01 and carried forward by `IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` §11:

> holdings → identity → dataset → assessment → disposition, and watchlist/finance disclosure, working as one loop on the host.

This is not Stage 6, not a new IID phase, and not a reordering. Stage 4 remains partially complete; its residual demo limbs are Stage-5-owned. PA-01 removes approval ceremonies, not technical dependencies.

### 9.2 Is IPD active binding verification the next prerequisite?

**Yes for the holdings/portfolio loop.** D5 is IPD-owned: IPD must provision the active owner binding through its own governed procedure. Only after IPD confirms may the operator set `IIPS_G3_IPC_BINDING_PROVISIONED=true`. IRR's declaration is not a verified binding; IPD adjudicates per request. This IRR documentation task does not implement or assert an IPD binding.

It is **not** a prerequisite for the already-completed company-scoped Infosys mint, and it does not become complete because NP-04 completed.

### 9.3 Remaining work, owners, prerequisites and closure evidence

| Activity | Repository / execution owner | Prerequisites | Exact closure evidence | Can proceed now? |
|---|---|---|---|---|
| D5 active binding provisioning/verification | **IPD** owns binding; operator sets declaration only after IPD confirmation | IPD governed procedure | IPD confirmation plus an actual portfolio read through the IRR transport resolving real holdings; readiness `ipd-binding-precondition` declared only after confirmation | IPD action required; IRR cannot substitute |
| D6 IPC endpoint + live peer | **IPD** peer; **user host** sets `IIPS_G2_IPC_ENDPOINT`; IRR client unchanged | D5; local Windows named pipe or absolute POSIX socket; transport restart after env change | Endpoint resolves; IPD listens; actual portfolio/holding read succeeds; no `503` on the read path. Readiness does not probe Windows pipe liveness, so a live read is required | Blocked on IPD peer + operator setting |
| D4 F-3 carrier / watchlist context | IRR materialiser/resolver; **user host** | Existing F-3 materialiser; distinct carrier file/pair | Resolver accepts carrier; watchlist/finance disclosure read works if exercised | Operator can proceed independently |
| R-1 host readiness capture | **Operator** | Host process environment | `iid:readiness --json` / `--strict` stdout from Windows; strict exit 0 is necessary but not sufficient for Stage 5 | Operator can proceed; expected not ready until D4/D5/D6 resolved |
| R-2 served coverage captures | **Operator** | Running transport | Host captures of `/api/investment/coverage/investment` and `/api/investment/coverage` | Operator can proceed for dataset surface; identity holdings surface remains blocked by D5/D6 |
| Remaining Stage 5 v1 mints (Marico, KEC) | IRR existing CLI; **operator** | Installed dataset/identity, Reports carrier, NP-04 path; no IPD needed for company scope | Existing generator summaries + separate-process chain/payload read-back; preservation proof | Operator may proceed under Stage 5/PA-01; not performed here |
| Second comparable version + change diff | IRR existing change intelligence; **operator** supplies genuine changed input | Existing chain; substantive input change, not a clock-only retry | Version 2 appended to same chain; version 1 intact; change diff validates and reads back | Blocked until a genuine comparable input change exists; do not force a duplicate |
| D10 / P6-B browser acceptance | IRR surface; **operator host** | P6-A §10: live portfolio read, valid identity, both carriers, stored/read-back assessment, dataset measured, host `--strict` exit 0; second version if change comparison is exercised | Recorded real browser journey: `/investment/company/IN:CIN:L85110KA1981PLC013115` renders chain; portfolio/identity/coverage surfaces honest; no 503 on accepted read path; change timeline if exercised | Blocked on D5/D6 and remaining host evidence |
| Stage 6 routine investment intelligence | Operator process; IRR surfaces | Stage 5; limits policy/review cadence | Baseline §21 Stage 6 evidence | Not next; blocked behind Stage 5 |

### 9.4 Existing blockers / incomplete decisions carried forward

- IPD binding/IPC remains the hard external blocker for Stage 5's portfolio loop.
- `IIPS-CPII-MASTER-ROADMAP-2026-11-12` remains absent; CPII-02…CPII-06 are not defined and are not invented here. PA-01 adopts the located Stage 1–6 working sequence, so O10 is not an approval gate for Stage 5.
- Stage 4 is still partially complete: freshness/operating-metric/source residuals remain open.
- `L-041`/`L-042` remain open; PR #562 remains open and unmerged. No merge is authorized by this record.
- The >200-chain NP-04 cursor hazard remains a recorded future boundary, not a reason to reopen this 3-chain operation.

## 10. Repository verification performed for this recording

- Current authoritative branch inspected: `arena/53ff9276-iips-review-recovered`, pre-publication head `dda23a9614d9928c171d9ef4f32637b1477b2187`.
- Inspected local copies of the roadmap, tracker, handover, NP-04 procedure, CPII-01, P6-A and Stage 4 records matched their remote blobs before amendment.
- The 11 November baseline was read from its recorded remote ref `31a9b01e` without checkout or repository synchronization.
- No application code, IPD repository, Windows database, evidence directory, carrier, dataset, identity directory or Personal Portfolio database was modified.
- Targeted documentation/consistency checks passed **33/33**; the initial remote publication read-back is recorded in §8. The follow-up receipt commit is verified cumulatively against the pre-task branch head before the final response.
