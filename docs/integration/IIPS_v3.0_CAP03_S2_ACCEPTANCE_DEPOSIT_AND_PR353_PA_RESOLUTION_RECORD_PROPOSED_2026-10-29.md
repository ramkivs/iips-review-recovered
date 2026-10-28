# CAP-03 — PA Resolution Record (PROPOSED — NOT ADOPTED): S2 acceptance at pin `a891802e`, raw-folder deposit disposition, PR #353 reconciliation boundary (2026-10-29)

**Classification.** `PROPOSED — NOT ADOPTED`. This record contains **no PA decision**. It states the verified decision boundary, the exact unresolved choices with their evidence and implications, and adoption-ready proposed wording for the PA's use. A prior assistant recommendation is not a PA ruling, and this document's publication is not one either. Nothing here grants implementation, host-operation, IPD-write, merge, or downstream-gate authority. Prepared in IRR `ramkivs/iips-review-recovered`; IPD read-only; no host operation attempted or requested.

## 1. Decision-boundary determination (verified by this pass)

**Determination: no explicit PA ruling is recorded for any of the three items.** Search set (all read 2026-10-28/29 UTC, outputs in `evidence/integration/cap03-pa-rulings-2026-10-29/01-ruling-boundary-readback.txt`):

- `main` = `9814a03e8200f34d88f6fefbbb87afa569cef3e4` — exactly the PR #355 merge (the decision-package pointer `§16.181`); zero sections beyond `§16.181`; zero adoption markers of the `S2 … ACCEPTED`/`PA RULING … ADOPTED` forms outside historical `NOT ADOPTED` vocabulary; `R-5` occurs once, in the unrelated 2026-10-23 `DEC-06` list (`§16.91` era) — **no S2-series `R-5` exists**;
- PR #355: sole comment is this agent's own post-merge verification receipt (20:27:37Z); no PA response;
- PR #353: head unchanged `ed020b0976b23897c73d33a75a0b6476e7b9976e` (last push 20:01:08Z); last comments are the sibling flow's own corrections passes (≤18:52:42Z); no PA instruction;
- issues: most recent activity 2026-10-24; evidence locus `docs/g3-d0-registration-2026-10-18` unchanged at `2cc5bc4302436f8ae6d84a9e657b8c1ed06b5478`;
- this task's own mandate expressly states it is **not** a grant of decision authority.

Consequence: all three decision items remain **open**; this record keeps every option visible and fabricates nothing. The smallest PA actions are in §§2–4 ("Proposed act" blocks).

## 2. Item A — formal S2 acceptance at the designated pin

**Unresolved choice.** `Option A` (conditional acceptance) vs `Option B` (defer pending bounded host-original read-back), as published in the decision package (`docs/integration/IIPS_v3.0_CAP03_S2_PIN_A891802E_ACCEPTANCE_AND_PR353_DISPOSITION_PA_DECISION_PACKAGE_2026-10-29.md`, blob `545b523a8a4c73a758144df687c2dafc50a21ccc`, re-read this pass — content unchanged on `main`).

**Conditions A-i…A-iv — exact published text, verified present and unmodified:** A-i accepted record is `RESULT.txt` `PASS` as sealed by `9D3C09DB…` at `2cc5bc4`, read back in `§16.180` + the verification folder; A-ii acceptance is *content-level* — Git copies are LF renderings whose digests reproduce under CRLF restoration, **Windows originals remain the byte authority** with retention as an operator obligation, and the `s2-00-run-log.txt` digest is accepted as *not reproducible from Git bytes*; A-iii scope fence verbatim — five commands + counts at the pin only, `V1295`/QE/Gates/`P-1`/`H-12`/`PF-15`/fences unmoved; A-iv the acceptance record is a **separate PA act** through the ordinary IRR PR route — this record, like the package, is not that act.

**Preservation audit (each required distinction, where it lives, status):**

| Must be preserved by acceptance | Carried by | Status |
|---|---|---|
| `D1` outstanding requirement | package §2 "question reserved" + `§16.180` reserved paragraph ("closure needs host-original evidence not in the repository") | preserved — Option A must state D1's disposition explicitly (sub-variant below); Option B defers on it |
| `R-1` separate unwaived residual (47-entry verification output, 2026-10-26 tooling) | package §2 criteria-conflict paragraph; `§16.180`; `§16.144` chain | preserved — neither option waives it; adoption text repeats non-waiver |
| Git-stored bytes ≠ Windows-original bytes | A-ii; package §3 table | preserved — "conditional acceptance must not imply the 13 LF-normalized transcripts are byte-identical to their originals" stated in the package and restated in the proposed act |
| `s2-00-run-log.txt` byte identity unproven (content cross-validates; size arithmetic consistent) | A-ii; package §3 last-limit row | preserved — recorded as a limit of proof, not cured |
| 2026-10-26 candidate-scoped `001c3c80` discrepancy | package §2; `§16.141`–`§16.144` | preserved — historical records distinct, unrevised, not conflated with this run |
| Windows originals as byte authority | run record §6 return list; A-ii | preserved — retention obligation restated in the proposed act |

**Proposed act (PA renders exactly one; wording adoption-ready).**

- **A-1 (conditional acceptance, D1 closed as a repository-sufficiency item):** "**S2 ACCEPTED — CONDITIONAL** (PA, `2026-10-29`, `S2-ACC-A1`): the native Windows run `s2-a891802e-20261028T192516Z` at designated pin `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` / tree `76f083d7058e170d8212455c03bad1033136ee68` is accepted at content level under conditions A-i…A-iv of `IIPS_v3.0_CAP03_S2_PIN_A891802E_ACCEPTANCE_AND_PR353_DISPOSITION_PA_DECISION_PACKAGE_2026-10-29.md` §2, unmodified. The acceptance covers the five S2 commands and their recorded counts at the pin only; it implies no byte-identity of Git copies with the Windows originals (which remain the byte authority and must be retained); it does not waive `R-1`, does not reopen or conflate the 2026-10-26 candidate-scoped records (`§16.144`, `001c3c80…`) or the failed baseline, and moves no gate (`V1295` NOT MET; QE `0/11`; Gate 4 `AUTHORIZED — NOT STARTED`; Gate 5 `NOT INITIATED / NOT ADMITTED`; `G14` AWAIT-PA; H-12 `NOT ADOPTED`; P-1 `NOT EXECUTED / UNSPENT / NOT AUTHORIZED`; PF-15/S3, DQ-4, 503 fences, production eligibility unchanged). `Q-S2-1`/`D1` is hereby closed as a repository-sufficiency item on the sealed published evidence plus the host-retention condition; the operator retention obligation survives the closure."
- **A-2 (conditional acceptance, D1 kept open until host read-back):** as A-1 but the final sentence replaces D1 closure with: "`D1` remains **open**: acceptance is rendered on repository evidence; the host-original read-back remains a standing condition to be recorded through the governed workflow before `D1` closes; no re-run or new capture is required or authorized."
- **B (defer):** "**S2 ACCEPTANCE DEFERRED** (PA, `2026-10-29`, `S2-ACC-B`): the run's technical `PASS` stands as verified (`§16.180`; re-run of the published verifier `2026-10-28T20:3xZ`: all checks match); formal acceptance is deferred until a PA-directed bounded host-original read-back is recorded: the operator zips the host folder and transcript as already required by run record §6, each SHA-256 is recomputed against the sealed manifest and rechecks, and the result is deposited as a new governed record (no S2 re-run, no new capture, no regeneration of published evidence). Until then the pin-scoped S2 status is `executed — PASS verified — acceptance deferred`; all gates and reservations stand as in A-1's list."

Implications: A-1 trades a reconstruction-grade proof for closure of D1 and removes all further host toil except retention; A-2 accepts now but keeps one bounded operator step open; B withholds acceptance — evidence, verification record, and retention obligation identical in all three.

## 3. Item B — raw-folder deposit

**Precise findings (from the governing texts, quoted in `01-ruling-boundary-readback.txt`):**
1. **Required?** Yes — the run record's own §6 status table binds `PASS` to "Deposit the evidence through the governed workflow (IRR PR; CI; read-back)" (run-record line 107 at `ed020b09`; precedent: 2026-10-26 PR #310 → `47133fe4…` on `main`, CI green).
2. **Was a second copy prohibited, or merely not created?** The admission record's sentence is "`this pass creates no second copy per its standing instruction`" (`§16.180`, `F-A-2`): a **scope instruction to that pass** — it neither prohibits a future governed deposit PR nor extinguishes the §6 obligation. Answer: **not created by that pass; future creation permitted and still owed.**
3. **Are D-B's components already-accepted satisfaction?** No. `§16.180` + verification folder are self-described as "the governed-workflow record of the publication in `main`" — i.e. *partly discharging* (CI + read-back on the governance record), while the raw folder itself is anchored on the docs branch with `0` CI (`F-A-2` re-confirmed this pass: still `0` check-runs). `R-5` **does not exist** in any record (only as the proposal in package §4), so there is nothing to read as an accepted residual; `D-B` is an unadopted recommendation.
4. **Mode status: UNRESOLVED remains the accurate characterization.** Obligation live; satisfaction shape awaiting the PA.

**Proposed act (one of):**
- **D-A:** "**RAW DEPOSIT REQUIRED AS GOVERNED PR** (PA, `2026-10-29`, `S2-DEP-A`): a bounded follow-up IRR PR copies `evidence/cap03-s2/s2-a891802e-20261028T192516Z/` and the sibling seal-recheck transcript from `2cc5bc4` **as-is and blob-identical** (no regeneration, rename, re-seal, or touch-up), through PR → exact-head CI → merge → per-blob read-back; on merge, the §6 deposit obligation is **discharged** and `F-A-2` **cured on `main`**; no `.gitattributes` change is bundled with it."
- **D-B:** "**BRANCH-ANCHORED DEPOSIT ACCEPTED** (PA, `2026-10-29`, `S2-DEP-B`): the raw folder's publication locus is recorded as `docs/g3-d0-registration-2026-10-18 @ 2cc5bc4…`; residual `R-5` **(S2 series — `§16.144` extension; distinct from the 2026-10-23 `DEC-06` R-5 list item)** is registered verbatim as: *'raw S2 folder published on the docs branch by direct push, 0 CI; Git copies of CRLF captures are LF renderings; Windows originals are the byte authority and retained per run record §6'*; `§16.180` + `evidence/integration/cap03-s2-a891802e-publication-verification-2026-10-28/` are the compensating record; `F-A-2` stands as an **accepted** residual, not cured; a later D-A remains available on the PA's direction without any re-run."

**Do not** read this record's neutrality as satisfaction: until D-A or D-B is rendered, the deposit obligation is **outstanding** and no duplicate copy is authorized.

## 4. Item C — PR #353 reconciliation (hold; plan, not action)

**Verified current state (this pass):** `OPEN`; head `ed020b09…` unchanged (20:01:08Z), 26 commits, base `main` (now `9814a03e`); head CI `SUCCESS` (`40759493433` — validated the pre-rebase head only; a rebased head needs fresh CI); GitHub mergeability now computed: **`CONFLICTING` / `mergeStateStatus DIRTY`** — the `§16.181` "near-certain conflict" forecast is now authoritative remote fact. Their tree additionally carries the run record (`PREPARED — NOT EXECUTED` header) and the procedure `.ps1` whose branch-side blob matches the recorded hash `BE952E25…` (40,274 B); neither file is on `main` (`F-A-3` re-confirmed: `main` has `1` `A891802E` path — the decision package — vs `2` on their head).

**Collision map (re-verified by content census of `ed020b09:$T` — their headings use the `### 16.1xx` style, which is why heading-level greps alone undercount):**

| Identifier claimed by PR #353 head | Occupied on `main`? | Disposition at their rebase |
|---|---|---|
| `§16.172`–`§16.179` (their sections) | gap intentionally reserved for them by `§16.180` | keep; re-anchor to current main text |
| their `§16.180` (corrections A–E) | **occupied** — S2 admission record | renumber to next free at rebase time; after this record that is **`§16.183`** |
| `CV-CORR-152`–`159` | free (reserved-by-claim for them) | keep |
| `CV-CORR-160` | **occupied** | → next free, **`CV-CORR-163`** |
| `CHG-2026-10-28-16`–`-22`, `CHG-2026-10-29-01` | free (their unmerged claims) | keep |
| `CHG-2026-10-29-02` (their line 389; claims `V1311`–`V1322` contiguous) | **occupied** | → next free, **`CHG-2026-10-29-05`** |
| `V1226`–`V1310` | free (theirs) | keep |
| `V1311`–`V1322` | **occupied** (`§16.180`) | → `V1340`+ |
| anything at `§16.181`/`CV-CORR-161`/`CHG-2026-10-29-03`/`V1323`–`V1339` | none present on their head (all counts `0`) | no further overlap after this record |

This record consumes `§16.182`/`CV-CORR-162`/`CHG-2026-10-29-04`/`V1332`–`V1339`; nothing in it alters their branch (their flow renumbers itself — merged identifiers hold; their head still contains no reference to PR #354/#355 or `2cc5bc4`, authored `19:42:08Z` pre-merge: the racing-claim characterization in `§16.181` stands).

**Required additive overlay (proposed exact text; to be applied only by their flow):**
> `\n` `> 2026-10-29 — status overlay (additive; text above preserved as historical):` the native S2 run this record prepares for has since been executed and published: see tracker `§16.180` and `docs/g3-d0-registration-2026-10-18@2cc5bc4…` (sealed `RESULT.txt PASS`, run `s2-a891802e-20261028T192516Z`, `2026-10-28T19:25:17Z`–`19:29:15Z`). The `PREPARED — NOT EXECUTED` header describes this branch-side preparation and does not deny the published run. **This document must not be cited as evidence that execution occurred; the run of record is the sealed folder plus `§16.180`.** Formal acceptance remains PA-reserved (`S2-ACC-*`; see `docs/integration/IIPS_v3.0_CAP03_S2_ACCEPTANCE_DEPOSIT_AND_PR353_PA_RESOLUTION_RECORD_PROPOSED_2026-10-29.md` §2). The run's distinct relationship to the 2026-10-26 failed baseline and the completed `a891802e` run is as recorded in `§16.180`/`§16.181` — nothing is conflated.

Plus one dated line on their `§16.179`-style annotation region pointing the `§16.180`→`§16.183` renumbering, and reconciled manifest-`record` cross-ref wording: after their merge, `MANIFEST.json`'s `record` reference resolves on `main`; **until then it must be described as a PR-branch-resident record, never as a main record** (F-A-3).

**Reconciliation plan (their flow, all eight prerequisites):** rebase onto post-ruling `main`; keep their `§16.172`–`179` and renumber the `§16.180` set per the table; reconcile the four header/CHG/EOF conflict anchors additively (preserve previous summaries verbatim); add the overlay above without touching historical body text; preserve the three-record distinction (prepared run-record doc ≠ executed `a891802e` run ≠ 2026-10-26 failed baseline); re-run the applicable contract-test suites at the new head; full CI at the new head; request `gh pr view` mergeability `CLEAN` before any merge ask. **This pass performed none of these on their branch.**

**Merge disposition:** hold maintained. CI success does not authorize the merge; merge requires (a) PA rulings A and D rendered, (b) the plan above executed by their flow, (c) explicit merge authorization in their record. Smallest PA action here: none directly — Items A and B first; PR #353 then proceeds under its own flow.

## 5. Gate-preservation ledger (verbatim; unchanged by this pass)

`V1295` endpoint binding NOT MET (no test binds `\\.\pipe\iips-user-portfolio-v1`; PR #353-recorded finding F-S2-3 only — not an established `main` fact) · QE `0/11` · Gate 4 `AUTHORIZED — NOT STARTED` · Gate 5 `NOT INITIATED / NOT ADMITTED` · `G14` AWAIT-PA · H-12 `NOT ADOPTED` (R5 validated candidate only) · `P-1` `NOT EXECUTED / UNSPENT / NOT AUTHORIZED`; `P-1-C NOT ESTABLISHED`; `P-1-D DESIGNATED — NOT VERIFIED FOR THE ATTEMPT` · PF-15/S3 unopened · DQ-4 freeze NOT ESTABLISHED · twelve 503 fences and `WRITE_NOT_AUTHORIZED` semantics intact · production out of scope. **Separation of validation provenance, preserved:** evidence commit `2cc5bc4` has `0` CI (never retroactively validated by PR #354/#355 green CI, which validate the governance records only); host-run test results ≠ Git-object integrity checks ≠ host-original byte verification (the last remains unobservable from this sandbox); post-merge read-backs are the publication proof for `main` records.

## 6. Evidence index

`01-ruling-boundary-readback.txt` (boundary greps, adopted-marker census, `R-5` context, deposit-procedure quote) · `02-pr353-collision-map.txt` (head state, mergeability JSON, their-tree identifier census incl. heading-style note, docs-path counts) · `03-verification-rerun.txt` (published verifier, this pass) — in `evidence/integration/cap03-pa-rulings-2026-10-29/`, sealed by `SHA256SUMS.txt`. Upstream: package blob `545b523a…` on `main@9814a03e`; `§16.180`/`§16.181` as merged; evidence locus `2cc5bc4` (seal `9D3C09DB…`); PR #353 `ed020b09…`; IPD pin `a891802e…`/tree `76f083d7…` (strict ancestor of `main@c3cfb7e6…`; read-only this pass). Publication of this record travels by its own governed PR; post-merge read-back reported on the PR page, not self-certified.

*Prepared `2026-10-28T20:36–20:5xZ` UTC (IST `2026-10-29`). End of record. No decision rendered; nothing adopted.*
