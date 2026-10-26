# IIPS v3.0 — CAP-02: QE-8 revocation determination, published-record integrity repair, matrix corrections, and host-independent readiness

> **Disposition: CAP-02 remains PARTIAL / NOT COMPLETE.** U3 remains **AUTHORIZED — NOT STARTED** with QE
> **0/11**; U2-14 remains **BLOCKED / NOT STARTED**; U4 **NOT RENDERED**; U5 **NOT GRANTED / NOT
> INITIATED**; U6 writes **NOT AUTHORIZED**. This pass resolves the QE-8 *governance* question to the
> boundary of its authority — a **decision-ready request** is published, **no procedure is approved** —
> repairs a defect in a previously published CAP-02 record, corrects four statements in the QE matrix that
> the current implementation evidence contradicts, reconciles the provisioning/V-A2 checklist, and
> publishes the CAP-02 host execution runbook and evidence structure. No host command was dispatched, no
> store or binding exists or was touched, no QE item was executed, and zero IPD writes were made.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP02-QE8-MATRIX-INTEGRITY-RECONCILIATION-2026-10-26-01` (census: 0 prior occurrences in IRR and IPD) |
| Tracker registration | Master tracker §16.129; `CV-CORR-109`; `CHG-2026-10-26-05`; verification rows `V779`–`V793` |
| Date | 2026-10-26 (UTC) |
| Locus | IRR authoritative tracker/repository; IPD inspected **read-only** (zero IPD writes) |
| Scope | QE-8 authority determination (request only), published-record integrity repair, justified matrix corrections, QE-1…QE-11 re-audit, provisioning/V-A2 reconciliation, runbook and evidence structure, authorized host-independent checks. No decision, implementation, provisioning, host operation, gate movement, or IPD write. |
| Companion records | `IIPS-V3-CAP02-QE8-REVOCATION-PROCEDURE-DECISION-REQUEST-2026-10-26-01`; `IIPS-V3-CAP02-HOST-EXECUTION-RUNBOOK-AND-EVIDENCE-STRUCTURE-2026-10-26-01`; repair appendix of `IIPS-V3-CAP02-QE-EXECUTION-MATRIX-2026-10-26-01` |
| Evidence | `evidence/integration/cap02-qe8-revocation-and-matrix-integrity-2026-10-26/` |

## 1. Baseline re-verified at the start of this pass

| Repository/ref | Observed state (independently read) | Relevance |
|---|---|---|
| IRR `ramkivs/iips-review-recovered` `main` | `3cd61bcec11beaa96fafa351f8ca557bbfd41b22`, tree `0ff4e15c4cee0c9fbb48d3dfb659caacee7cb860`; 0 open PRs; PRs #285–#290 all `MERGED`; `main` CI run `40280401460` **success** (`2026-10-26T06:32:14Z`) | Current authority/tracker baseline. §16.127 (PR #287) remains the CAP-02 QE matrix authority; §16.128 (PR #289) is CAP-03-scoped. |
| IPD `ramkivs/iips-production-market-data` `main` | `f5eddbc20b944a098a9060a8e3349c6d10b7843e`, tree `5c93f1d1e6c4919fa632ff107569ac955f5e052e`; 0 open PRs; 566 blobs | Implementation/decision locus, read-only. |
| Designated pins | IPD `8eec74ae27cda09f3c368b9c299895eae41554db`/`4eba2902…`; IRR consumer `ba64b2d5927c2f872560710cf1474c25a5cde0d5`/`5e4262f1…` | Unchanged. The two persistence blobs this pass reasons about are **byte-identical at the pin and at `main`** (`portfolio_store.ts 540d49f2…`, `binding.ts 96d0079d…`), so no pin/`main` divergence affects any statement below. |
| Governing records re-read | Gate E rev 1 `4a9501bf…` (16,908 B); CAP-03 readiness packet `9d9c5970…` (20,923 B); Gate 4 act `66b56fd1…` (34,316 B); S1 determination `b7746b5e…` (35,936 B); Gate A′ successor act `528de6ae…` (29,856 B); IPD CAP-02 QE status matrix `e76d4a3e…` (11,343 B) | All identities match the values recorded in tracker §16.127.1. |
| Adopted H-12 R5 | manifest blob `f4649e36a81c7013287810cd3202b99586dbd951`, 143,813 B, SHA-256 `d0be8bef3281ae6a296b8700265fe134b5088dd84b102b77ca8a157c8275cb76` | Re-verified locally; unchanged. |

Evidence: `00-remote-state-and-ancestry.txt`.

## 2. QE-8 — determination, and why it stops at a request

**Status: `AWAITING PROGRAM AUTHORITY` — no procedure approved, nothing touched.** The full analysis,
minimum procedure, alternatives and requested determination text are in
`IIPS-V3-CAP02-QE8-REVOCATION-PROCEDURE-DECISION-REQUEST-2026-10-26-01`. Summary of the findings:

| # | Finding | Basis |
|---|---|---|
| 1 | QE-8 requires (i) a provisioned ACTIVE binding, (ii) a **defined** failure behaviour before qualification, and (iii) a **governed** action before retained data may become accessible again | Gate E §4 QE-8; **W-3**; G2-D5 points (4) and (5) (PA, 2026-10-18, approved in full) |
| 2 | **W-3 is implemented** at the designated pin: `withBrokerImportTransaction()` holds `BEGIN IMMEDIATE`, calls `resolveActiveBindingInCurrentTransaction()`, and refuses `ResourceUnavailableError` before mutation | `portfolio_store.ts 540d49f2…` L384–404; `binding.ts 96d0079d…` L70–95; effective U2 transaction/binding revalidation amendment |
| 3 | **No governed revocation operation exists**: 0 files/paths matching `/revok/i` in the 566-blob tree; no exported function, IPC operation, route, CLI or `package.json` script; the only revocation statements in either locus are **test-fixture SQL** | `05-…txt` |
| 4 | **Approval authority is not held by any preparing capacity**: "revoc…" occurs **0 times** in the Gate 4 act, the S1 determination and the Gate A′ successor act; the successor act §9 expressly non-grants *"purge, re-association or restoration of revoked-binding data"*; the Gate 4 §7 grant is **execution and recording only** | `01-…txt` §D–F |
| 5 | **The target is one-way** — after revocation `STORE_ALREADY_EXISTS`/`ALREADY_PROVISIONED` make the store unprovisionable and re-activation is a G2-D5(4) governed act that does not exist | `06-…txt` |

**Conclusion recorded: implementation authority, the Gate 4 execution grant, CI green, local revocation
tests and the readiness packet's phrase do not constitute approval.** The Program Authority must render
`RV-1` (packet §5) choosing Option A (disposable-copy revocation — recommended), B (authoritative
revocation, ordered last, irreversible), C (implement a governed revocation entrypoint first) or D (defer).
QE-8 therefore remains **`NOT EXECUTED — no approved revocation procedure`**, not a failure and not a
limitation of the implementer.

## 3. Published-record integrity defect — found, disclosed, repaired

The published CAP-02 QE matrix record (`IIPS-V3-CAP02-QE-EXECUTION-MATRIX-2026-10-26-01`) is **incomplete
as published**. Local file, `origin/main` blob and independent API read agree exactly: blob
`ab9451712df8e801f041f1139e3cb3f91ec84913`, 23,893 B, SHA-256
`6d32f261f23bc0e80c9ab3b1a78b610cc8c5055f4a58d9cf27d7beac740bd602`. The file terminates mid-sentence in
the §4 table with a literal `...[truncated 8223 chars]` marker at line 172; approximately 8.2 kB — the rest
of §4 and **§§5–8** — never reached the repository. §5 is referenced by the record's own text ("*see §5*")
for the PF-15 disposition.

Two distinct faults are recorded, not one:

1. **Authoring/pipeline fault** — the record body was written from a truncated read. Severe because it is
   silent: every downstream citation of the record cites sections that do not exist.
2. **Verification-design fault** — tracker §16.127.5 `V766` verified *identity* (blob, size, SHA-256,
   byte-comparison) and correctly passed. **Identity verification is not completeness verification.** A
   truncated artifact is byte-identical to itself.

**Repair (this pass).** The published bytes are preserved unchanged — the record is not rewritten, and no
lost sentence is invented. A clearly marked **repair appendix** is appended that (a) discloses the defect
with its exact identity, (b) states which sections were missing, (c) reconstructs the missing §4 rows from
the successor act §8 (steps 0–6 and V-A2-1…V-A2-8, each cited to the act) and §5–§8 from the registering
tracker §16.127.2–.5 and the governing acts, marked **RECONSTRUCTED AFTER DEFECT**, and (d) is itself
verified. A machine check (`03-matrix-row-audit.py`) now asserts sections 1–8, no truncation marker, 11
complete QE rows, the five-class vocabulary and the durability non-claim sentence; it fails on the
pre-repair artifact (23 PASS / 2 FAIL) and passes after repair.

## 4. Matrix corrections (justified by evidence; no status changes)

Each correction is a statement the record made that the current implementation or the effective
instruments contradict or do not support. None changes a gate, an item's executed/not-executed state, or
any acceptance.

| # | Item | As published | Corrected to | Evidence |
|---|---|---|---|---|
| **C1** | QE-8 tier/ceiling | "*Limitation finding* for write/revocation-race (**no binding re-read inside a write transaction**)" | **Stale.** W-3's in-transaction revalidation is implemented at the designated pin. The race limb is **Tier 2 component-executable** (disposable-copy store) and remains **component-level evidence only** — never a full-path PASS while W-1 refuses every operational write. The Gate 4 act §5 note predates the U2 amendment and is preserved as history. | `05-…txt`; blobs `540d49f2…`, `96d0079d…` |
| **C2** | QE-8 prerequisite provenance | Requirement attributed to "readiness §5" | **Re-grounded** in Gate E §4 QE-8 + **G2-D5 points (4) and (5)** (effective PA policy). The CAP-03 host readiness packet remains corroborative only; its CAP-03-scoped statements (no pins, H-12 not adopted, PF-15 not designated) are **not** imported into CAP-02. | `01-…txt` §C, §G |
| **C3** | QE-8 prerequisite completeness | P-1 binding + restart pattern + PA-approved procedure | **Adds**: no governed revocation operation exists in the product (0 paths; test SQL only), so the determination must cover both the **procedure** and the **mechanism** (act-specified statements vs a separate implementation act). Cross-referenced to the decision request. | `05-…txt`, `06-…txt` |
| **C4** | QE-8 target/irreversibility | "*the sole operator binding must never be revoked without express authority*" (correct but incomplete) | **Adds**: revocation of the sole binding is **one-way** (`STORE_ALREADY_EXISTS` + `ALREADY_PROVISIONED` on any row in any state; G2-D5(4) recovery act absent). The target — authoritative store vs disposable copy — is therefore a **PA decision**, not an operator choice. | `06-…txt` |
| **C5** | Record integrity | — | Repair appendix + completeness audit (§3 above); `V766`'s identity verification explicitly restated as identity-only. | `02-…txt`, `04a/04b-…txt` |

**Ambiguities found in the audit but not requiring correction** (recorded so the operator is not surprised
on the host):

- **A-1 (QE-4 wording).** "Component-level only" and "PASS: byte-for-byte equality" sit in the same row. Under Gate 4 §5 rules 2–4 a component-tier observation is never a full-path PASS; the intended reading is: the *commit* is Tier 2, the *post-restart read-back* may be Tier 1, and *durability fields* are measurement under the fixed non-claim sentence. No status change; the operator records tier per scenario.
- **A-2 (QE-1 fixtures).** "Security Master D05 coverage" is a host-side fixture requirement; repository-side D05 implementation (`src/identity/d05_*`) is implementation evidence only and cannot satisfy it. Unverified until the host session; not a defect.
- **A-3 (QE-8 ordering).** The row does not state that under Option B it must be the **last** binding-dependent item. The decision request makes this explicit (§3.2 precondition 4, §4).

## 5. QE-1…QE-11 re-audit against the governing acceptance criteria

Verified for every row against Gate E §4, L-IPC-1 §10 / D-GC mappings, and the Gate 4 act §§5/§7/§10/§11:
criterion text, execution tier(s), evidence ceiling, prerequisites, pass/fail terms, artifacts, and the
`HOST-ONLY` location. All eleven remain **HOST-ONLY for execution**; **none is completable without the
designated Windows session**, and no Linux, CI, mock or fixture result is claimable. Disposition remains
**NOT RUN — 0/11**. Findings: C1–C4 above. No row was found to relax a fence, admit an alternate host, or
substitute a prior CAP-03 artifact; no CAP-03 S2/P-1 result is credited to CAP-02.

## 6. Provisioning checklist and V-A2 reconciliation (U2-14, unchanged status)

U2-14 remains **BLOCKED / NOT STARTED**; P-1 is **NOT EXECUTED and unspent**. The checklist is re-derived
from the successor act §8 and §5 and now published in full (the truncated record omitted most of it):

| Layer | Verified statement |
|---|---|
| Steps 0–6 | 0) preflight capture (`hostname`, edition, non-elevation, `node -v`, flag-free `node:sqlite` probe, `git rev-parse HEAD HEAD^{tree}` = designated pin, clean `git status --porcelain`, sha256 of the three modules); 1) `$StorePath` absolute, outside every worktree, local fixed NTFS, not synchronized, writable non-elevated, **must not pre-exist**; 2) `--mode=validate` read-only pre-state (bindings = 0, memberships = 0); 3) single `--mode=execute` invocation with the four CLI values and `--actor`, verbatim capture + store sha256/size; 4) `--mode=validate` V-A2 report; 5) post-state checks; 6) evidence publication **before** any receipt. Stop on any mismatch. |
| V-A2-1 | `_migration_ledger` holds `001`–`004` with the basis-computed checksums; schema version 004; migration `001` blob `f594a182…` unchanged |
| V-A2-2 | exactly **one** binding row, `ACTIVE`, `revoked_at IS NULL`, `binding_id` = the deterministic id (`c5808abaffd072d6401ce63ad86c6ac0`) |
| V-A2-3 | exactly **one** membership row, `ACTIVE`, attached to V-A2-2, `tenant_id`/`canonical_owner_id` equal the act's named values (`membership_id d25dcc5370100b00766efc5166f65cf3`) |
| V-A2-4 | `portfolios`, `portfolio_revisions`, `portfolio_holdings`, `portfolio_contributions` all **0** |
| V-A2-5 | exactly **one** hash-chained audit row, `event_type='local_principal_binding.provisioned'`, `subject_type='local_principal_binding'`, `subject_id` = `principal_label`, detail = the owner pair, chain verifies |
| V-A2-6 | `resolveActiveBinding()` returns exactly the provisioned context; pre-provisioning throws `BindingAbsentError`; a second `ACTIVE` row is impossible at storage and refused by the resolver |
| V-A2-7 | refusal preservation: IPC still `WRITE_NOT_AUTHORIZED` before mutation; `evaluatePortSaveGuard()` still hard-false; no write became possible |
| V-A2-8 | a second invocation is refused and changes nothing; the act is recorded **consumed** (consumption is on completion whether the run succeeds or fails) |
| Ordering | S2 pass → **one** P-1 → **PF-15 designation** → S3 preflight → QE. A CAP-03 P-1 does not close CAP-02 U2-14; closure requires the V-A2 receipt to satisfy these CAP-02 prerequisites. |

## 7. Run-evidence structure and host-specific command checklist

Published as `IIPS-V3-CAP02-HOST-EXECUTION-RUNBOOK-AND-EVIDENCE-STRUCTURE-2026-10-26-01`: CAP-02-scoped
(rather than CAP-03's), with the CAP-02 pins, the ordered gate sequence, the exact PowerShell command list
for S2/P-1/S3, the per-QE scenario checklist with evidence filenames, the deposit layout
(`evidence/cross-repository/cap02_gate4_qe_<date>_<run-id>/`), the five-class status vocabulary, the
durability non-claim sentence, the stop/no-substitution table, and the QE-8 hold gate. It prepares and
executes nothing.

## 8. Authorized host-independent work performed in this pass

| Check | Result |
|---|---|
| Evidence-manifest schema self-test (`30-schema-self-test.py`) | **22/22 PASS** (run unchanged; template remains a PREPARED, non-authoritative artifact) |
| QE matrix structural/completeness audit (`03-matrix-row-audit.py`) | Pre-repair **23 PASS / 2 FAIL** (truncation + missing §§5–8); post-repair **25 PASS / 0 FAIL** |
| QE-8 criterion/authority trace, W-3 implementation evidence, provisioning-irreversibility derivation | Recorded in `01-`, `05-`, `06-` from read-only remote reads; no execution |
| IRR publication checks (`frontend/`) | typecheck, replay-server typecheck, `test:ci` + guard, `build` — see `10-publication-checks.txt` |
| Host reachability | Not attempted as a substitute; the designated host remains unavailable to this sandbox and no host command was dispatched |

## 9. What cannot be executed until the designated Windows session exists

S2 (5/5) · the single P-1 · PF-15 designation (a PA act, not an operator action) · S3 preflight ·
QE-1…QE-11 · **QE-8 additionally requires `RV-1`** before any revocation may be attempted · evidence
integrity/deposit · U4 acceptance (separate act) · U5 admission (separate act) · U6 writes (not
authorized).

## 10. Boundaries preserved

DB-C1, U0, B-1/B-1R, U1, U2-1…U2-12 and the bounded U7 contract remain **COMPLETE** at their authorized
boundaries; U2-13/W-1 **NOT AUTHORIZED**; U2-14 **BLOCKED / NOT STARTED**; U3 **AUTHORIZED — NOT STARTED**
(QE 0/11); U4 **NOT RENDERED**; U5 **NOT GRANTED / NOT INITIATED**; U6 **NOT AUTHORIZED**. Effective H-12
Alternative A, the S1 determination, the Gate 4 authority and H-12 R5 adoption are applied as written and
not reopened. `WRITE_NOT_AUTHORIZED`, `evaluatePortSaveGuard()` hard-false and all twelve
`/api/user-portfolios*` `503` fences are untouched. No IPD file was written.

## 11. Verification log

| ID | Check | Result |
|---|---|---|
| `V779` | IRR/IPD remote refs, open PRs, `main` CI; designated pins; governing blob identities; H-12 R5 digest | **PASS** — `00-…txt` |
| `V780` | QE-8 authority analysis: criterion, W-3, G2-D5, 0-match sweep of Gate 4/S1/successor acts, successor §9 non-grant | **PASS** — `01-…txt`; remote absence of any rendered approval re-read in `08-…txt` |
| `V781` | Decision request published as PROPOSED with four alternatives, minimum procedure, stop/recovery constraints, exact `RV-1` text | **PASS** — companion record §3–§5 |
| `V782` | Published-record integrity defect independently confirmed (local = `origin/main` = API blob, 23,893 B, marker line 172) | **PASS as defect evidence** — `02-…txt` |
| `V783` | Repair appendix appended; published bytes preserved; no lost text invented; reconstruction labelled and cited | **PASS** — matrix record repair appendix |
| `V784` | Corrections C1–C5 justified by blob-level evidence; ambiguity notes A-1…A-3 recorded; no status change | **PASS** |
| `V785` | QE-1…QE-11 re-audit against governing criteria; 11/11 HOST-ONLY; 0/11 executed; no substitution | **PASS** — matrix §3 + this record §5 |
| `V786` | Provisioning/V-A2 checklist re-derived from successor act §5/§8; U2-14 unchanged | **PASS** — this record §6 |
| `V787` | CAP-02 runbook/evidence structure published; preparation only | **PASS** — companion runbook |
| `V788` | Schema self-test 22/22; matrix audit 23/2 → 25/0 | **PASS** — `04a/04b-…txt` post-repair run |
| `V789` | Local IRR publication checks (`frontend/`) | **PASS** — `10-publication-checks.txt` |
| `V790` | New-identifier census: §16.129, `CV-CORR-109`, `CHG-2026-10-26-05`, `V779`–`V793`, three record IDs — 0 prior occurrences in both loci | **PASS** — `07-identifier-census.txt` |
| `V791` | Scope/non-grant audit: documentation/evidence only; 0 source/test/pin/route/fence/manifest changes; 0 IPD writes; no gate moved; QE 0/11 | **PASS** |
| `V792` | PR merge, exact-head and post-merge CI, commit/tree, remote blob read-back | **PASS** — coordinates in tracker §16.129.6–.7 |
| `V793` | Remote read-back completeness (not only identity): repair appendix and §§1–8 present at `main`; audit script re-run against the remote-fetched file | **PASS** — `04b-…txt`, tracker §16.129.6–.7 |

## 12. Attestation

This record renders one determination only: **that the QE-8 revocation procedure is not approved and the
determination belongs to the Program Authority** — and it therefore requests rather than assumes it. It
executes nothing, provisions nothing, revokes nothing, accepts nothing and admits nothing. It corrects
published statements only where evidence requires it, and it repairs a published artifact without
rewriting it.

*End of `IIPS-V3-CAP02-QE8-MATRIX-INTEGRITY-RECONCILIATION-2026-10-26-01`. CAP-02 remains PARTIAL; U3 is
AUTHORIZED — NOT STARTED (QE 0/11); QE-8 is AWAITING PROGRAM AUTHORITY; the binding has not been touched.*
