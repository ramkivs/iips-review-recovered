# DEC-06 — Standing PA Authorization ↔ P11 Main-Admission Governance: Authority Reconciliation

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01` |
| Date | **2026-10-21** (UTC). Recorded on its actual date; not backdated. |
| Record type | **Authority reconciliation and interpretation record.** It determines what the existing Program Authority (PA) standing authorization permits, reconciles IRR tracker §16.65.4 with that grant through the established decision-record process, and fixes the authority and the conditions for the next **IPD-only** execution. **It renders no admission, performs no IPD mutation, and creates no new PA approval.** |
| Owning repository / ref | `ramkivs/iips-review-recovered` (IRR) / `refs/heads/main` — the only repository this pass mutates |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — accessed **read-only** (`git ls-remote`, `gh api`, a read-only scratch clone in `/tmp`). **No IPD commit, ref, PR, issue or file was created or changed.** |
| Verified IRR baseline | `main@df16bedf19f2e56097c9a1dbebee2a35f33ea85e` (merge of IRR PR #172, `2026-10-21T16:16:04Z`), re-read live at the start of this pass; worktree clean |
| Verified IPD baseline (read-only) | `main@15465e45adfc1dd58fba17e80365b729599aef6b` (merge of IPD PR #37, `2026-10-21T15:57:34Z`), re-read live; **the DEC-06 package baseline `a6ad4a9…` is now an ancestor, not the tip** |
| Authority basis | The PA's **standing grant of global decision and execution authority** (transcribed at IRR `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2, blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`) **plus the current PA direction of 2026-10-21** (the DEC-06 tasking, quoted at §1.3 below), exercised in the **IRR** capacity for governance-record preparation, publication and remote verification |
| Recording agent | Arena Agent Mode — investigation, reconciliation, record preparation, IRR-only mutation, publication and remote verification. **No authority is rendered by the agent; no signature, spoken selection, approval ID or third-party confirmation is asserted or fabricated.** |
| Deciding question | Whether the existing standing authorization establishes the authority to proceed with the exact DEC-06 lineage, and exactly what remains for the next IPD-only execution |
| Status | **RECONCILED — AUTHORITY ESTABLISHED FOR THE EXACT LINEAGE; ADMISSION NOT PERFORMED, NOT CLAIMED AND NOT PROVEN** |

> **Bottom line, in one paragraph.** The global standing grant is a real, recorded grant of decision **and** execution authority "for this project", and it expressly forbids asking the PA to repeat approval for individual decisions or routine implementation steps. The three sentences that have been read as a standing-authorization *ceiling* — Gate C P-2 handoff §2, tracker §16.65.4, and `CHG-2026-10-15-04`'s use of the first — are either **record-scoped** (they bound what that one record may do, in its own words "the basis for this record and for nothing else") or state the **correct and still-binding** rule that a general authorization neither performs nor proves a *specific* admission. They do not limit the grant, and they were overtaken by explicit later practice in which the same grant was used to render bounded admission decisions and to merge (NP-18, 2026-10-16; IRR PR #124/#125/#126, 2026-10-17; the standing PR-lifecycle merge authorization `CHG-2026-10-18-02`, used through 2026-10-21). Bounded acceptance (§16.65) and main admission remain **distinct**: acceptance settles *what the capability claim is*, admission settles *whether this code may enter a named branch*, and admission must be its **own recorded act with its own evidence**. This record therefore establishes that the next IPD-only execution may render and execute that act for exactly `b6e6224… → 3eaec0e…` under the existing grant, subject to the conditions fixed at §8 — and it records that **nothing has been admitted by this record**: the candidate is still off IPD `main` as at `15465e45…`.

---

## 1. Authority, scope and what this record is not

### 1.1 Authority exercised

1. **The standing grant** — PA-granted on 2026-10-12, transcribed verbatim and unedited at the F-3 mechanism record §1.2 (blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`, re-read from the repository this pass). Its operative sentence is quoted at §4.1.
2. **The current PA direction (2026-10-21)** — the DEC-06 execution directive issued to this session, quoted at §1.3.
3. **The established IRR decision-record process** — additive dated records; preserved original text; no silent rewrite of a prior act (the pattern used by §§16.65, 16.67, 16.68 and 16.69).

### 1.2 Mutation scope

**IRR only.** This pass changes the IRR tracker and adds this record. IPD is read-only to it: the candidate branch was fetched into a **scratch clone under `/tmp`** to establish blob identities and to test mergeability, and that scratch clone is never pushed. No IPD issue, PR, ref, comment or file was touched. No ChatGPT Library artifact was used as an input or a dependency.

### 1.3 The current PA direction, quoted (2026-10-21)

> "The PA has reiterated the governing instruction: authorization is global and implicit. … proceed with reconciling the records and then act within the authority established by that reconciliation."
>
> "Proceed in one pass. Do not request repeated approval for routine work covered by the established standing authorization."
>
> "Do not interpret the absence of a separately named decision record as proof that PA authorization can never be exercised through an existing standing directive. Conversely, do not silently delete or disregard §16.65.4. Reconcile its meaning and scope explicitly."

This is a PA instruction **applying and construing** an existing grant. It is not a new approval, and this record does not treat it as one.

### 1.4 What this record explicitly does **not** do

- It does **not** merge, rebase, cherry-pick or otherwise admit the P11 candidate, and it does **not** claim that the candidate is on IPD `main`.
- It does **not** render the IPD-side `D-06` disposition. `D-06` is a decision in the **IPD capacity** about IPD `main`; this record fixes the authority, conditions and evidence classes under which the next IPD-only execution renders and executes it.
- It does **not** create a PA signature, selection comment, approval ID or new authorisation instrument. NP-18 supplies the established form: an explicit, bounded, evidence-bound act recorded by the operating session **under** the standing grant, stating plainly that no independently held agent jurisdiction or new human signature is claimed.
- It does **not** generalise. The determination at §8 is expressly confined to the two named commits and the five named paths. It grants nothing for any other IPD implementation, and in particular nothing for IPD PR #34 (the Gate 3 candidate), which is a different lineage and is unaffected.
- It does **not** change any status in the IRR register, matrix, fence, gate or capability claim.

---

## 2. Authoritative records examined (all re-read this pass)

| # | Record | Coordinates at read time | What it establishes for this question |
|---|---|---|---|
| A | **The standing grant**, transcribed at `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2 | IRR `main` blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02` | The grant's own operative words: "global decision and execution authority for this project", "necessary decisions, governance records, implementation, testing, corrections, and publication **within the established scope**", "Do not request repeated approval for individual decisions or routine implementation steps"; and its four limits (no fabricated evidence, no weakened safeguards, no unrelated scope expansion, no unverified success claims) |
| B | **Tracker §16.65** (`CV-CORR-48`, 2026-10-20), including **§16.65.4** | IRR `main` (this file) | The PA-selected **bounded in-process IPD P11 library acceptance**, expressly "including the documented momentum propagation and effective input-to-output lineage fixes"; Row 26 E2E `NA` for that scope only; §16.65.3's open items; and §16.65.4's sentence that standing authorization "does **not** by itself authorize or prove main admission" |
| C | **Companion PA disposition** `docs/integration/IIPS_v3.0_P11_ROW26_BOUNDED_LIBRARY_ACCEPTANCE_PA_DISPOSITION_2026-10-20.md` | IRR `main`, blob `86700486fd8e1ab95c6ff0c53c7fd010c5e9321a` (as cited in the DEC-06 package §6) | The acceptance act itself and the statement that the remediation and annotation "remain on IPD task branch … **not** IPD `main`" — i.e. the acceptance was never represented as admission |
| D | **Gate C P-2 execution handoff §2** (2026-10-13) | IRR `main`, `docs/integration/IIPS_v3.0_GATE_C_P2_EXECUTION_HANDOFF_ARENA_TO_NON_PRODUCTION_HOST_2026-10-13.md` | The sentence §16.65.4 cites: standing authorization "covers **governance-record preparation, branch publication for review and read-only verification**; it is the basis for this record and **for nothing else**" |
| E | **`CHG-2026-10-15-04`** (`CV-CORR-13`, §16.25) | IRR `main`, tracker §5 change log | The earlier, broader reading: that handoff §2 sentence "**bounds the delegation**", used there to hold that a merge needed separate explicit authorization |
| F | **`NP-18-CURRENT-TARGET-MAIN-ADMISSION-DECISION-2026-10-16.md`** §1 | IRR `main`, `docs/integration/NP-18-CURRENT-TARGET-MAIN-ADMISSION-DECISION-2026-10-16.md` | The established **form**: the standing grant read as the "existing project-wide standing authorization"; a prospective, bounded **main-admission decision** rendered as its own explicit act against it, with exact coordinates, no new human signature claimed, and admission held **not** to be effective until publication and remote verification |
| G | **IRR PR #124 / #125 / #126 admission and merge receipts** (2026-10-17) | IRR `main`, `docs/integration/IIPS_v3.0_G2_IRR_PR12{4,5,6}_*` | Admission/merge acts whose recorded authority is "the existing PA global standing authorization (F-3 §1.2 …) **plus** the current named instruction, exercised in a separate rendered decision" — the same two-element basis used here |
| H | **`CHG-2026-10-18-02`** and its 2026-10-21 use | IRR `main`, tracker §5 and §§16.56/16.68 | The PA's 2026-10-18 instruction granting **standing PR-lifecycle execution authorization and authorized merging**; exercised for routine eligible merges (PR #167 `4cc936ad…`, PR #169 `b9d80034…`) with no fresh approval per PR |
| I | **Tracker §16.68** (`CV-CORR-51`, 2026-10-21) and §16.69 (`CV-CORR-52`) | IRR `main` (this file) | §16.68.2 records merging a report as "a documentation-publication act under the standing authorization"; §16.69.3 records that the candidate "is not admitted by this reconciliation" and that DEC-06 "remains a separate PA decision" |
| J | **The DEC-06 decision package** | IPD `main`, `evidence/cross-repository/IIPS_V3_DEC06_P11_MAIN_ADMISSION_DECISION_PACKAGE_2026-10-21.md`, landed by IPD PR #37 (`a713c89…` → merge `15465e45…`) | The exact lineage, its scope, the reproduced defect and the fix effect, the validation record, the **acceptance ≠ admission** finding, `D-06` with Options A–D, and §9's list of prohibited actions until the decision exists |
| K | **IPD PR #36** | OPEN, `MERGEABLE`/`CLEAN`, head `3eaec0edd4f89a806b301d647499ca860c2a1172`, base `a6ad4a9…`, 2 commits, 5 files, +145/−3, `mergedAt: null` | The review vehicle; still explicitly not for merge. Merging it **is** admission, so it must not be merged except by the act fixed at §8 |
| L | **IPD inventory + addenda A4/A5** | IPD `main`, `evidence/np04/IIPS_v3.0_IPD_IRR_CAPABILITY_INVENTORY_AND_TRACKER_RECONCILIATION_2026-10-17.md`, blob `65c80a04…` | The IPD-side state statements that a post-admission dated annotation must reconcile (see condition C-7) |

**Not found, and recorded as a negative rather than inferred away:** no separately named PA instrument expressly styled as a "P11 main-admission decision" exists in either repository as at the baselines above. That absence is **not** treated as an absence of authority — it is the exact point the current PA direction addresses, and §4 explains why the grant can be exercised through the existing directive.

---

## 3. The ambiguity, stated exactly

Three recorded sentences, read together, appear to cap the standing grant at "records, branch publication and read-only verification". They do not, once each is read at its own scope and in chronological order.

| # | Sentence (verbatim) | Date | Scope it actually has |
|---|---|---|---|
| S1 | Grant: "…**global decision and execution authority for this project**. This standing authorization covers the necessary decisions, governance records, implementation, testing, corrections, and publication **within the established scope**. Do not request repeated approval for individual decisions or routine implementation steps…" | 2026-10-12 | **Project-wide, limited by established scope and four named exclusions.** This is the grant itself. Note that the *narrative* around it in the F-3 record says the authorization was "granted … for this workstream"; the **operative quoted text** says "for **this project**", and the F-3 record's "grants **no** authority beyond §4" is a statement about what *that record's own dispositions* add — not a cap on the PA's grant. |
| S2 | Handoff: "The attributed standing authorization … covers governance-record preparation, branch publication for review and read-only verification; **it is the basis for this record and for nothing else.**" | 2026-10-13 | **Record-scoped.** It says what *that handoff record* relied on and that the record is not a foundation for anything further. It renders no authority ("RENDERS NO AUTHORITY AND PERFORMS NO P-2 OPERATION", §1 of that record). Read as a general ceiling it would contradict S1's own words and every later application. |
| S3 | Tracker §16.65.4: "The standing-authorization execution ceiling recorded in the Gate C P2 handoff §2 covers governance-record preparation, branch publication for review, and read-only verification; it does **not** by itself authorize or prove main admission." | 2026-10-20 | **Two claims, one correct and one mis-scoped.** "Does not by itself **prove** main admission" is exactly right and remains binding forever: only remote coordinates prove admission. "Does not by itself **authorize**" is right only in the sense that a general grant is not a specific act: the grant authorises the *making of the specific act*, and does not substitute for it. It is **not** a rule that admission of an already-accepted lineage requires a fresh PA approval round. |

**What made the mis-scoping visible.** S3 was written in a pass whose own §16.65.4 then recorded PR #164 as **MERGED** — i.e. the very record that said standing authorization "does not by itself authorize … main admission" was itself admitted to IRR `main` by an authorized merge act, distinct from the record. The distinction §16.65.4 was reaching for is real and is preserved at R-3 / R-4 below; the ceiling it *attributed* is not.

**Chronology that resolves the tension (verified from §2's records):**

```
2026-10-12  grant S1 (project-wide; decisions + execution; do not re-ask)
2026-10-13  S2 — record-scoped, one record, renders nothing
2026-10-15  CHG-2026-10-15-04 reads S2 as a general ceiling (historical reading)
2026-10-16  NP-18 — the same grant used to RENDER a bounded main-admission decision
2026-10-17  PR #124/#125/#126 — grant + named instruction, exercised in a rendered decision, merged
2026-10-18  CHG-2026-10-18-02 — PA instruction granting standing PR-lifecycle merge authorization
2026-10-20  §16.65 bounded P11 acceptance (expressly: not admission); S3 written
2026-10-20  PR #164 merged under the merge authorization (S3's own record)
2026-10-21  PR #167 / #169 merged under the same authorization; §16.68.2 calls it publication under the standing authorization
2026-10-21  PA direction (DEC-06 tasking) — authorization is global and implicit; reconcile, then act
```

Later explicit acts are the operative interpretation of an earlier general grant; a record-scoped sentence cannot silently amend the grant itself. That is the whole of the reconciliation.

---

## 4. Interpretation established (binding for this project)

### 4.1 R-1 — The grant is project-wide within established scope, and it is not re-asked per decision

The standing grant's own operative sentence is decisive. Its four limits are the only textual limits: no fabricated evidence; no weakened safeguards; **no unrelated scope expansion**; no claims of success without verification. Nothing in it requires a per-decision approval round, and it expressly forbids one for "individual decisions or routine implementation steps".

### 4.2 R-2 — "Established scope" is set by PA product decisions and governing boundaries, not by the agent's convenience

For P11, scope was established by the PA's own bounded-library disposition (§16.65 / record C) — which **expressly includes** "the documented momentum propagation and effective input-to-output lineage fixes", i.e. the very content of `b6e6224`. The candidate is therefore **in** established scope as to content. What the scope did not settle is branch membership of that content — and that is exactly what a bounded admission act settles.

### 4.3 R-3 — Authorization, act, and proof are three different things

| Element | What it is | Where it lives | What it proves |
|---|---|---|---|
| **Authorization** | The grant of authority to decide and execute within scope | The standing grant (record A); this reconciliation (§8) for the exact lineage | That the act below may be taken **without a new approval round** |
| **Act** | The specific decision, recorded | The IPD-side `D-06` record naming exact commits/scope/limits | That a disposition was taken, by whom, on what evidence |
| **Proof** | The remote state that the act was carried out | IPD PR merge + merge commit + ancestry + blob identity at IPD `main` | That admission **occurred** |

A general authorization never supplies element 3, and this is the enduring truth in §16.65.4. Equally, elements 1 and 2 are not interchangeable: the grant does not *perform* the act, and the act does not *create* authority it did not have.

### 4.4 R-4 — §16.65.4 is preserved, and its scope is fixed at its own two clauses

- **Preserved verbatim.** §16.65.4's text is not deleted, reworded or disregarded. Its correct clause — "does not by itself **prove** main admission" — is reaffirmed as permanent.
- **Clarified scope.** Its "does not by itself **authorize**" clause is an **anti-inference rule**, not an authority cap: it forbids reading a scope/acceptance record as an admission act (correct, and reaffirmed), and it forbids treating a general grant as a substitute for the specific act (correct, and reaffirmed). It does **not** require the PA to re-grant what the grant already covers, and to that extent only, its attribution of a "ceiling" to handoff §2 is **superseded** by this record.
- **Effect on `CHG-2026-10-15-04`.** Its reading of S2 is preserved as a dated historical reading and is **not** carried forward as a general rule; the acts it governed remain valid on their own grounds (each was separately authorized at the time, so nothing decided on that basis is disturbed). No historical record is rewritten.

### 4.5 R-5 — Acceptance ≠ admission (unchanged, and not relaxed)

§16.65 accepted a **capability claim** for a bounded in-process library scope; it said in terms that implementation, validation, acceptance, qualification and release-readiness remain separately bounded, and that the IPD remediation "remains on IPD task branch …, not IPD `main`" and is "not misrepresented as main admission". Nothing here converts acceptance into admission, and nothing here lowers the admission bar: the bar is an **explicit, evidence-bound act naming exact commits**, which is what §8 requires.

### 4.6 R-6 — A record cannot imply an admission it did not perform

§16.69.3's statement that the candidate "is not admitted by this reconciliation" was correct when written and remains correct for that record and for this one. It is **not** a holding that admission is unavailable; it is the anti-implication rule that keeps each record honest about its own limits. This record likewise claims no `main` membership of the candidate.

### 4.7 R-7 — Capacity matters: IRR records the authority, IPD records the admission

The admission concerns IPD `main`, so the act belongs to the **IPD capacity** and must be recorded in IPD. An IRR record may determine authority and fix conditions (this record does), but an IRR record that announced "IPD `main` now contains the candidate" would be asserting a fact in a repository that cannot prove it. Provenance therefore stays clean: IRR determines and cites; IPD acts and proves; the proof is remote ancestry plus blob identity.

### 4.8 R-8 — Restrictions are not broadened beyond what the governing authority requires

Per the PA direction: a restriction concerning admission must not be widened. Concretely: (i) S3's "prove" clause is not widened into "the PA must approve each merge"; (ii) §16.65's bounded-scope caveats are not widened into "nothing in P11 may enter `main`"; (iii) conversely, this determination is not widened into authority for other implementations, other repositories, product consumers, E2E, equivalence, gates or operational eligibility (§10).

### 4.9 R-9 — Where there is genuine uncertainty, name it rather than manufacture certainty

One matter genuinely cannot be settled by documents: **evidentiary weight** of library-level unit evidence authored alongside the fix, executed POSIX-only. That is a judgment the package itself flagged honestly (its Option A risk note). It is handled at §11 as a recorded limitation plus mandatory exact-tree re-validation — **not** as a disguised request for re-approval, and **not** asserted as settled by the grant.

---

## 5. The required questions, answered

### Q1. Does the global PA standing authorization cover routine implementation and publication of work within its established scope?

**Yes.** It covers "the necessary decisions, governance records, implementation, testing, corrections, and publication within the established scope", and it forbids asking for repeated approval for individual decisions or routine implementation steps (R-1). Publication through the repository's PR process — including merging eligible work — is within that coverage; the project has already recorded that reading and practised it (`CHG-2026-10-18-02`; PRs #167/#169; §16.68.2) as well as in the earlier admission-shaped acts (NP-18; PRs #124/#125/#126).

### Q2. What additional restrictions, if any, apply to main admission of the specific P11 candidate?

Four, and only four:

1. **Identity.** Admission covers exactly `b6e622432cb0ca3e5452c4194bc683c496a688fc` → `3eaec0edd4f89a806b301d647499ca860c2a1172` as a two-commit unit, content-identified by the five path blobs at §7.2. No rebase, no cherry-pick, no re-derivation that changes commit IDs, no direct commit to `main`.
2. **Form.** A merge commit onto then-current IPD `main`, preceded by an **explicit recorded `D-06` act** in IPD naming the commits, the scope and the limits.
3. **Validation currency.** The merged tree must be **re-derived and re-validated at admission time** — the package's `26dec9ac…` merge tree was computed against `a6ad4a9…` and is now stale (§7.3).
4. **Anti-expansion.** Admission establishes no product-consumer integration, no Row 26 E2E, no IPD/IRR equivalence, no qualification, no Gate 3/4/5 movement and no operational-eligibility change; the §16.65.3 open items stay open.

Acceptance status is **not** an additional restriction: §16.65 already accepted this content, so admission does not re-open the capability question.

### Q3. Does the existing PA direction resolve those restrictions?

**Yes for authority and form; no for proof.** The 2026-10-21 PA direction resolves the authority question outright (authorize globally, do not re-ask) and validates using the existing directive rather than demanding a new one. It cannot resolve **proof**: whether admission has occurred is a fact about a remote branch, established only by ancestry and blob identity (§9). The evidentiary-weight question at R-9 is neither resolved nor waived; it is carried as a recorded limitation with a defined re-validation duty.

### Q4. What authority has been established for the next IPD-only execution?

**The authority to render the `D-06` disposition and, on that record and on satisfaction of C-1…C-9 (§8), to execute the admission of exactly this lineage — without seeking further PA approval.** See §8 for the exact scope, the default disposition, the conditions and the capacity.

### Q5. What evidence must be produced to distinguish authorization, implementation, validation, publication, and completed admission?

The five classes and their required evidence are fixed at §9. In short: authorization is proven by this record on IRR `main`; the decision by the IPD `D-06` record; implementation by the candidate commit and its five blobs; validation by an executed run bound to the **exact merge tree**; publication by the merge commit and PR `mergedAt`; and completed admission only by `git merge-base --is-ancestor` plus blob equality at IPD `main`.

### Q6. What actions remain prohibited until the applicable conditions are met?

All of §10. In particular: no merging PR #36, no equivalent merge/cherry-pick/rebase/direct commit, no publishing `3eaec0e` alone, and no representation that the momentum defect is fixed on `main`, that P11 is complete, or that admission occurred — until remote ancestry proves it.

---

## 6. What did **not** change

- IRR **Row 26** and §16.65's bounded acceptance, its E2E `NA` scope and its §16.65.3 open items: unchanged.
- IRR register: **no item added, closed or moved**; the 35-item register, the 51-row matrix, the 17 `XV` records, the 8 stages and the 11 §19 rows are unchanged. `DEC-06` is an **IPD-side** register item and is not duplicated as a `CV` item.
- Gate 3 (`CV-39`): **BLOCKED / NOT ACCEPTED**, operator-owned native-Windows acceptance outstanding — untouched. IPD PR #34 untouched.
- Every `503` fence, DP-2 Option 2F, Reports Option C, `CV-22` Option C, `CV-40` finality, Stage A/A13 bounds, `program-v1.2.0` and `v3.0-phase12-certified` pins: unchanged.
- No product, test, route, dependency, workflow, fence, persistence or IPD path in the delta. Documentation-only.

---

## 7. Exact candidate lineage, scope and refreshed merge state (verified this pass)

### 7.1 Lineage

```
3d44e0a123f2495f3b88ce0ab8b47fbc5bf072db   merge base (IPD main at candidate creation; PR #33)
   └── b6e622432cb0ca3e5452c4194bc683c496a688fc   "Fix P11 momentum propagation and scoring lineage"   [implementation]
          └── 3eaec0edd4f89a806b301d647499ca860c2a1172   "Record bounded P11 library scope and Row 26 gap"   [documentation]
```

Branch `arena/21bc6f5f-iips-production-market-data` (remote head `3eaec0e…`). **Neither commit is an ancestor of IPD `main@15465e45…`** (verified: `git merge-base --is-ancestor` → not an ancestor; merge base `3d44e0a…`). IPD PR **#36 is OPEN**, `MERGEABLE` / `CLEAN`, 2 commits, 5 files, **+145 / −3**, `mergedAt: null`.

### 7.2 Scope, identified by blob (unchanged by main's advance)

| Path | IPD `main@15465e45` blob | Candidate `3eaec0e` blob |
|---|---|---|
| `src/engine_adapters/databound_executor.ts` | `4905a094cf046137535608ff6f8f1d25cdf0d0ee` | `a22b33630377e58125f4ea72a7384c01a72c2e7a` |
| `src/engine_adapters/sector_defaults.ts` | `d0351f679cfb3a8adc071cd326b3dcf736a5533b` | `66a2debc4baea7753f17653caedfbb0b749da1cf` |
| `tests/wsd_p11_engine_adapters.test.ts` | `6478c78a61fda0872a81e2d5107658b557f2b353` | `afc5eb3a4647028d48507739c96b98e753af61dd` |
| `evidence/cross-repository/IPD_P11_BOUNDED_LIBRARY_SCOPE_AND_ROW26_RECONCILIATION_2026-10-20.md` | **absent** | `384cf6a63f2c10867cdb02a2eb58e13c157cf87f` |
| `evidence/np04/IIPS_v3.0_IPD_IRR_CAPABILITY_INVENTORY_AND_TRACKER_RECONCILIATION_2026-10-17.md` | `65c80a04e4ddd2d4c43434643aa7fda2b166301b` | `735fde8ffbbc9b0bb914f4fb9fc878b0139ce560` |

Nothing outside these five paths is in the candidate (`git diff --stat 3d44e0a… 3eaec0e…` → 5 files, +145/−3).

### 7.3 Material refresh: the package's merge coordinates are **stale**, the lineage is not

The package computed GitHub's merge preview against `main@a6ad4a9…` → merge `0046adb1…`, tree **`26dec9ac…`**; its §7 requires "that the merge must produce tree `26dec9ac…`". **IPD `main` has since advanced to `15465e45…`** (PR #37 landed `a713c89…`, the DEC-06 package itself, plus addendum A5). A merge onto the current tip therefore produces a **different merge commit and a different tree**. Verified this pass in a `/tmp` scratch clone:

| Check | Result |
|---|---|
| `git merge 3eaec0e` onto `15465e45` (ort, no-commit) | **clean** — "Automatic merge went well"; no conflicts |
| Files changed by the merge | the same five paths |
| Resulting tree | **`56ac4796b7b68bd8c6081e136b5d3101e02ef77d`** (recomputed; supersedes `26dec9ac…` for a merge onto `15465e45…`) |
| Both sides preserved in the overlapping inventory file | **yes** — main's A4/A5 addenda present; the candidate's row-13 `P11-01`/`P11-03` annotation present; merged line count **722** |
| Candidate commit IDs | **unchanged** — the commit identity the act authorises is `3eaec0e`/`b6e6224`, and a merge commit does not alter it (a rebase would, and is prohibited) |

**Consequence, fixed as condition C-4:** the merge tree must be re-derived at execution time and validation re-executed against **that** tree. Tree `26dec9ac…` is historical and must not be quoted as the tree to be produced.

### 7.4 Documentation-accuracy residuals that admission creates (known now, fixed as condition C-7)

These are dated statements that will become false the moment the candidate lands. They are recorded **here, before admission**, so that the post-admission reconciliation is planned, not discovered:

| Location | Statement that becomes stale |
|---|---|
| `ipd:evidence/np04/…TRACKER_RECONCILIATION_2026-10-17.md` (A4/A4.4 table) | "IPD-side bounded P11 scope record … **Commit `3eaec0e` only — NOT on IPD `main`**" |
| same file, A4.4 §634 | "The IPD-side record of that scope is **NOT on `main`** … (**fast-forwardable**)" |
| same file, A5.1 | "the candidate is no longer fast-forwardable … requires a merge commit" (accurate pre-merge, stale post-merge) |
| `ipd:evidence/cross-repository/IPD_P11_BOUNDED_LIBRARY_SCOPE_AND_ROW26_RECONCILIATION_2026-10-20.md` §67 | "This record and the IPD inventory annotation are published on the IPD task branch only." |
| same file, row-13 annotation | "Row 26 authority decision pending" (IRR resolved this for IRR Row 26 on 2026-10-20, §16.65.2) |

The remedy is a **fresh dated addendum** (the package's own "irreproachable remedy"), never a silent rewrite of the dated record.

---

## 8. Authority established for the next IPD-only execution

### 8.1 The determination

Under the standing grant as construed at §4, the next **IPD-only** execution holds the authority to:

1. **Render the `D-06` disposition** for exactly `b6e622432cb0ca3e5452c4194bc683c496a688fc` → `3eaec0edd4f89a806b301d647499ca860c2a1172`, recorded in IPD as its own explicit act in the NP-18 form (it names the commits, the scope, the limits, and states that no new human signature or independently held agent jurisdiction is claimed); and
2. **Execute the admission** of that lineage by a **merge commit** onto then-current IPD `main`, and **verify** it remotely.

**Default disposition: ADMIT (package Option A), with the package's Option B conditions adopted as mandatory post-admission obligations** (C-7). Rationale, all from records: the content is already **PA-accepted** (§16.65, expressly including these fixes); the defect is documented and reproducible on `main` (§4 of the package, re-verified there, not re-derived here); admission is the routine implementation-publication step the grant covers; and every additional restriction in the package is preserved as a condition rather than as a reason to re-ask. **No further PA approval is required to take this action.**

### 8.2 Conditions of execution (all mandatory; none is an approval round)

| # | Condition |
|---|---|
| **C-1** | The `D-06` act is recorded **in IPD** before the merge, as its own explicit act; it is not inferred from this record, from green CI, or from the PR's mergeability. |
| **C-2** | The act names the two commits, their content-identity by the five §7.2 blobs, and the five-path scope; it states the exclusions of §10. |
| **C-3** | The merge is a **merge commit** on then-current `main` (no fast-forward-only constraint, no rebase, no squash, no cherry-pick, no direct commit). |
| **C-4** | The merge tree is **re-derived** at execution time; the full IPD suite and the focused P11 suite are **executed against that exact tree** and the results recorded with the tree hash. `26dec9ac…` is not quoted as the expected tree. |
| **C-5** | Both sides of the overlapping inventory file survive; the merged file's line count and the presence of main's A4/A5 addenda **and** the candidate's row-13 annotation are asserted. |
| **C-6** | Admission is verified remotely, not asserted: merge commit + `mergedAt`, then `git merge-base --is-ancestor 3eaec0e origin/main` **and** blob identity for all five paths at remote `main`. |
| **C-7** | A **post-admission dated addendum** in IPD reconciles the §7.4 residuals (inventory A4/A4.4/A5 and the candidate record §67/row-13 wording) — additively, without rewriting the dated records or changing the admitted commit IDs. |
| **C-8** | Nothing in §10 is claimed. In particular the execution must not state or imply product E2E, consumer integration, IPD/IRR equivalence, qualification, Gate 3/4/5 movement, Row 26 change, or operational-eligibility change. |
| **C-9** | The execution remains IPD-only. IRR is not mutated to accommodate it; if an IRR record is later wanted, it is a separate dated IRR record. |

### 8.3 If the PA issues a contrary instruction

A contrary instruction from the PA governs immediately and this determination yields without needing to be re-litigated. Conversely, **silence is not a request for approval**: absent a contrary instruction, the next IPD-only execution proceeds under §8.1 on the conditions above.

---

## 9. Evidence classes — what proves what

| Stage | What it is | Required evidence | Where it is verified |
|---|---|---|---|
| **Authorization** | Authority to act without re-approval | This record + tracker §16.70 on IRR `main`; the grant's blob `c4c9f7d7…` | IRR remote blob/commit |
| **Decision** | The `D-06` disposition | IPD record naming commits/scope/limits, in the NP-18 form | IPD commit + blob at the executed head |
| **Implementation** | The candidate as authored | Commits `b6e6224`/`3eaec0e` + the five candidate blobs (§7.2); ancestry proof that neither is on `main` before the act | Candidate branch + remote `main` |
| **Validation** | Executed tests on what will actually land | Full-suite + focused P11 counts, tie to the **re-derived merge tree** hash, environment and date; limitations (POSIX-only) stated | Execution log / hosted CI run bound to the tree |
| **Publication** | The irreversible step | PR `mergedAt` + merge commit; no direct commit to `main` | IPD PR + remote refs |
| **Completed admission** | The fact | `git merge-base --is-ancestor 3eaec0e origin/main` **and** blob equality for all five paths at remote `main` | IPD remote read-back |

**A capability acceptance is evidence of none of these.** That is the content of R-3/R-5 and of §16.65.4's correct clause, and it stays true.

---

## 10. Prohibitions that remain

Until `D-06` is recorded and remote ancestry proves the merge:

1. **PR #36 must not be merged** as a review vehicle, and no equivalent merge, cherry-pick, rebase-and-push or direct commit of `b6e6224`/`3eaec0e` (or their content) may be made to `main` by any agent acting outside the §8.2 conditions.
2. **`3eaec0e` must not be published alone** — that would land a record on `main` citing a remediation commit whose code is absent.
3. **No representation** that the momentum defect is fixed on `main`, that P11 is complete, that P11/P15 criteria are satisfied, or that admission occurred before C-6 is satisfied.
4. **No re-derivation** of the candidate (rebase onto a newer `main`) substituted for the authorised lineage; that would change the commit IDs the act names.
5. **No scope expansion**: no product consumer, no HTTP service, no IPD/IRR mapping or engine equivalence, no Row 26 E2E change, no Gate 3/4/5 movement, no fence or operational-eligibility change, no `CSIP_COMPOSITE` / `mode` / `governedIntelligenceInputs` / UI05 conclusions (all still open per §16.65.3).
6. **No use of this record** as authority for any other implementation, any other repository, or any IRR product change; and **no mutation of IPD** in this IRR-only pass.
7. **No rewriting of dated records.** Historical statements stay as written; corrections are dated addenda.

---

## 11. Residual matters — stated, not manufactured away

| # | Residual | Status after this record |
|---|---|---|
| 1 | **Evidentiary weight** — the fix's tests were authored alongside the fix and executed POSIX-only; Windows was not exercised. | **Not settled by authority.** Carried as a disclosed limitation of the validation evidence and mitigated by the C-4 exact-tree re-validation duty. If the PA requires independent test authorship or Windows evidence *before* any `src/engine_adapters/**` admission, that is a **new instruction** that would supersede §8; this record does not pretend the question is answered. |
| 2 | **The package's tree/commit coordinates** (`0046adb1…`, `26dec9ac…`) | **Superseded as coordinates, not as lineage.** C-3/C-4 make the re-derived merge tree the operative one. |
| 3 | **Documentation staleness created by admission** | **Planned**, not ignored: C-7. |
| 4 | **IPD issues #16/#17** | Still OPEN; the issue-write permission remains absent (`403`). Admission of the candidate does not close them and no issue write is authorized here. |
| 5 | **`CV-CORR-13`/`CHG-2026-10-15-04`'s broader reading** | Preserved as a dated historical reading; its general-ceiling inference is not carried forward (§4.4). Acts it governed are unaffected. |

---

## 12. Validation performed this pass (IRR side)

| # | Check | Result |
|---|---|---|
| 1 | IRR baseline and cleanliness | `main@df16bedf19f2e56097c9a1dbebee2a35f33ea85e`; worktree clean before and after the change |
| 2 | IPD baseline (read-only) | `main@15465e45adfc1dd58fba17e80365b729599aef6b`; PR #36 OPEN (`mergedAt: null`, head `3eaec0e…`) |
| 3 | Candidate ancestry against IPD `main` | **not an ancestor**; merge base `3d44e0a…` |
| 4 | Candidate scope | 5 paths, +145/−3; five blobs recorded at §7.2; nothing outside scope |
| 5 | Mergeability against the **current** tip | clean auto-merge; tree `56ac4796…`; both addenda and the row-13 annotation preserved; 722 lines |
| 6 | IRR document integrity | Markdown table shape and section numbering checked; §18 matrix remains 51 rows × 17 columns; only intended paths changed |
| 7 | Whitespace / diff hygiene | `git diff --check` clean |
| 8 | Register isolation | no `CV`/`XV` status or count changed; no new work item |
| 9 | IPD mutation | **none** — read-only (`ls-remote`, `gh api`, `/tmp` scratch clone, never pushed) |
| 10 | Publication | branch push → IRR PR → successful checks → merge; coordinates established by remote read-back and recorded post-merge, never self-embedded |

The IRR repository's ordinary PR CI supplies the typecheck / test / build checks for this documentation-only delta; no IPD test was executed in this pass, and none is claimed. **C-4 requires that execution in the IPD-only pass.**

---

## 13. Publication status

This record and the tracker update are published on the fixed session branch and proposed to `main` by IRR PR under the standing grant and `CHG-2026-10-18-02`. Exact publication coordinates (PR number, head, merge commit, post-merge CI, `main` blob identity) are deliberately **not self-embedded**; they are established from the PR and remote `main` and recorded post-merge in the tracker's publication-receipt addendum (the §§16.42.6/16.67.11/16.68.11/16.69.5 pattern).

**If the PR is not merged, this record stands as a branch-publication record only**, no `main` membership is claimed, and the determination at §8 is not effective from `main`.

---

## 14. Verification index

| ID | Check | Result |
|---|---|---|
| W1 | Standing grant re-read from the repository (blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`) | Verified |
| W2 | Gate C P-2 handoff §2 sentence located and read at its own record scope | Verified |
| W3 | §16.65 / §16.65.4 / §16.65.3 read in full | Verified |
| W4 | NP-18 admission-decision form and its authority paragraph read | Verified |
| W5 | PR #124/#125/#126 authority lines read | Verified |
| W6 | `CHG-2026-10-18-02` and its 2026-10-21 uses read | Verified |
| W7 | DEC-06 package read in full, including §9 prohibitions and §8 consequences | Verified |
| W8 | Search for any separately named P11 admission decision in IRR and IPD **at the baselines** | None found — recorded as a negative, not as an authority finding |
| W9 | IPD `main` refreshed; PR #36 state, base, head, counts | `15465e45…`; OPEN/MERGEABLE/CLEAN, `a6ad4a9…` base, `3eaec0e…` head, 2 commits / 5 files / +145−3 |
| W10 | Candidate ancestry vs IPD `main` | not an ancestor; merge base `3d44e0a…` |
| W11 | Merge dry-run onto current `main` (scratch clone) | clean; tree `56ac4796b7b68bd8c6081e136b5d3101e02ef77d`; A4/A5 + row-13 annotation both present; 722 lines |
| W12 | Five-path blob identities at `main` and at the candidate | recorded §7.2 |
| W13 | IPD mutation | none |

---

*This record determines authority; it does not admit code. The admission of `b6e6224… → 3eaec0e…` remains an act of the IPD capacity, to be recorded there and proven by remote ancestry — no more, and no less.*
