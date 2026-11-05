# WS-A A-10 — Gate 4 QE / H-12 pin designation: complete decision package

**Record:** `WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05`
**Type:** PREPARED DECISION PACKAGE FOR PROGRAM AUTHORITY. Investigation, measurement and
documentation only.
**Status:** **PREPARED — NOT EFFECTIVE. NOT A PA ACT. NOT A PIN DESIGNATION. NOT A GATE 4
EXECUTION. NOT AN ACCEPTANCE. NO PA ACT ID IS ASSIGNED OR CLAIMED BY THIS RECORD.**
**Owner repository:** `ramkivs/iips-review-recovered` (IRR). **Zero IPD writes.**
**Author:** IRR integration agent, `2026-11-05`, under the PA's written one-pass commission for
Workstream A action **A-10**.
**Governing question source:** `IIPS_v3.0_CAP03_CONSOLIDATED_PA_DECISION_PACKAGE_PROPOSED_2026-10-29.md`
§PA-09; `IIPS_v3.0_CAP03_P1_PA_FORMAL_DECISION_RECORD_2026-10-28.md` §4.5 and §4.6.

> **Boundary statement.** This package assembles evidence and renders the decision *ballot*. It does
> not decide. §4.6 obligation 4 of the formal decision record requires **a separate PA designation
> act** naming commit, tree and blob identities and their purpose. That act does not exist. Nothing
> in this document designates a pin, advances a gate, authorizes QE execution, or makes any
> qualification claim. Where this document states that an obligation is *satisfiable*, it means the
> evidence for it exists and has been measured — not that the obligation has been discharged by an
> authorized act.

---

## 1. The question, restated from the authoritative record

PA-09 asks which commit is the **Gate 4 QE and H-12 content pin**:

| Option | Definition in the authoritative record |
| :--- | :--- |
| **G4P-1** | IPD `a891802e2691bd9c65a67d6abff20d8ce0c26d7d`. IRR's recommendation, **with express scope acceptance of non-Limb-A content**. Its own source is under PA-01(i). |
| **G4P-2** | A Limb A-only QE commit. **Requires new IPD implementation authority, which is not granted.** |
| **G4P-3** | The third framing carried by the consolidated packet. |
| **Deferred** | Leave the pin undesignated. |

The packet's proposed PA wording is unfilled and is reproduced here unchanged so the decision can be
rendered against it:

> "PA-09: The Gate 4 QE and H-12 content pin is [G4P-1 `a891802e` / G4P-2 / G4P-3 / deferred].
> Commit `[ ]`, tree `[ ]`, blobs `[ ]`, purpose: Gate 4 Limb A, QE and H-12 content. Non-Limb-A
> content in scope: [accepted / not accepted]. Designation is not Gate 4 execution."

PA-01 pass-6 records: *"(iv) G4P-1: not established; the Gate 4 pin is undesignated."* PA-08c
scopes "final execution commit" to the **P-1 chain only**; the Gate 4 §8 coordinate remains a
separate PA-09 matter. PA-19/PA-20 waive Windows and operator evidence but **no Gate 4 decision**.

**What adoption would unlock:** H-12 regeneration (PA-10a) at the designated commit, and the route
(c) native run (PA-06). **What adoption would NOT unlock:** Gate 4 execution, QE 0/11 → 11/11,
result acceptance, or Gate 5.

---

## 2. Authoritative framework read (verbatim sources, no paraphrase of effect)

| Source | Bearing on PA-09 |
| :--- | :--- |
| Formal decision record **§4.5** | Renders the exact choice as **C-1** (accept the post-binding commit `C′`, or `001c3c80`, as the pin *with express scope acceptance of non-Limb-A content* and regenerate H-12 there), **C-2** (require a Limb A-only QE commit — needs new IPD implementation authority and a new pin; **not authorized**), or **C-3** (keep the pin undesignated until the CAP-03 chain produces `C′`, then decide C-1/C-2). The recorded conflict: the only post-binding commits also carry CAP-03 DR-2 and S2 content **outside** the Gate 4 §4.2 Limb A boundary. |
| Formal decision record **§4.6** | Six adopted pin-selection obligations, **all** required before any pin may be designated. Reproduced and evaluated item-by-item at §4 below. |
| Formal decision record **§3.1** (adopted PA-1) | H-12 adoption is **not** a prerequisite for P-1 provisioning, but **S2a must be complete before S3 preflight and before QE**. |
| **PA-10a / PA-10b / PA-10c** | PA-10a **NOT ADVANCED** (the T-3 artifact requirement survives the waivers); PA-10b **DEFERRED**; PA-10c **RESOLVED** by PA-1. |
| Gate 4 Target-Host Qualification Authority Act `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-23-01` **§3.2** | The four-part commit rule. **Load-bearing for this package; quoted at §3 below.** IPD blob `66b56fd1584890525a7250aadd7da449def621e5` — verified **byte-identical at `a891802e`, `7bcae35` and IPD `main` `6df748d3`**, so the rule has not drifted. |
| H-12 R5 adoption act `IIPS-V3-CAP03-G4-H12-R5-PA-ADOPTION-ACT-2026-10-25-01` | **ADOPTED — EFFECTIVE** in the governing IRR locus. Adopts `G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5` (blob `f4649e36a81c7013287810cd3202b99586dbd951`, 143,813 bytes) **byte-for-byte unmodified**. |
| DQ-6b Path A act `IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01` | **Effective, 6/6.** Admitted the split primary/alias baseline **as an interim, guarded configuration**; preserved the broker-import alias at `70b24f029842a7e9b7f615e4d9df7376fd4ff817`; expressly **declined Path B** (alias modernization). Quoted at §6.2 below. |
| S1 publication and dependency handoff record, **finding F3** | H-12 R5 binds `8eec74ae` (IPD) and `ba64b2d5` (IRR), which **differ from** the G4P-1 designated pin `a891802e`. |
| CAP-03 governance dependency reconciliation `2026-10-29` | Records the designation-vs-rulings conflict; item 4 **"Unverified"**. |
| G14 independent advancement reconciliation `2026-11-01` | **"Do not infer G4P-1…"** — no pin may be inferred from advancement. |

**Note on an apparent contradiction that is not one.** The R5 manifest JSON's own `status` field
reads `PROPOSED CANDIDATE — NOT ADOPTED; NOT AN EFFECTIVE QUALIFICATION BASELINE`, while the R5
adoption act reads `ADOPTED — EFFECTIVE`. These are consistent: the act adopted the candidate
**byte-for-byte unmodified**, so the candidate's internal status string was deliberately preserved
rather than edited. **Effectiveness is carried by the act, not by the manifest's own field.** This
is recorded so the package is not read as self-contradictory, and so no future pass "corrects" the
manifest and thereby breaks the adoption's byte-preservation premise.

---

## 3. The controlling rule: Gate 4 act §3.2, the four-part commit rule

Quoted verbatim from IPD blob `66b56fd1584890525a7250aadd7da449def621e5`:

> 1. **Merge + green + read-back.** Any commit cited as a qualification basis must be merged
>    `--merge`, have green PR-head and post-merge CI, and be `ls-remote`-agreed with remote blob
>    read-back.
> 2. **Designation before the run.** The IPD QE execution pin is the **final post-merge Limb A
>    commit**, and is recorded verbatim (commit, tree, blob identities) **before** host preflight and
>    **before** QE-1. No future SHA is asserted, guessed or inferred here.
> 3. **Before/after digests.** The adopted H-12 digest set is recorded at run start **and** run end;
>    any drift invalidates the run.
> 4. **Stop, never silent re-pin.** Any non-documentary drift in either pinned repository between
>    this act and execution is a **stop condition** requiring explicit PA re-designation.
>
> **Limitation.** The IPD QE pin cannot exist until Limb A is implemented and merged; until then no
> QE item may start.

### 3.1 Two distinct pins are in play, and the packet conflates them

§3.2(2) defines the **QE execution pin** as *"the final post-merge Limb A commit"*. PA-09 asks for
the **QE and H-12 content pin**. These are not the same object:

- The **content pin** fixes *what bytes the H-12 digest set and the QE criteria are measured
  against*. It can be designated now, from commits that exist.
- The **execution pin** fixes *what runs*. Per §3.2's own Limitation it **cannot exist until Limb A
  is implemented and merged**. Limb A is not implemented: Gate 4 is `AUTHORIZED — NOT STARTED`,
  QE is **0/11**, Gate C and U4 are **NOT RENDERED**, and §4.5's C-2 route to a Limb A-only commit
  requires IPD implementation authority that is **not granted**.

**Consequence for the ballot.** A PA-09 designation can validly fix the *content* pin and can
validly discharge §4.6 obligations 1–6 as to content. It **cannot** produce a QE execution pin, and
it must not be recorded as one. Any designation rendered under PA-09 should say so expressly; the
packet's draft wording already carries the sentence *"Designation is not Gate 4 execution"*, which
should be retained and strengthened with the §3.2 Limitation citation.

### 3.2 §3.2(4) is engaged in BOTH pinned repositories — measured

§3.2(4) makes **any non-documentary drift in either pinned repository** between the act and
execution a **stop condition requiring explicit PA re-designation**. Drift was measured against the
coordinates the act's own H-12 baseline binds (IPD `8eec74ae`; IRR `ba64b2d5`) and against G4P-1
(`a891802e`).

**IPD drift (`ramkivs/iips-production-market-data`), measured `2026-11-05`:**

| From → To | Commits | Non-evidence / non-doc paths | Classification |
| :--- | :--- | :--- | :--- |
| `a52b47b0` (Limb A pre-binding) → `a891802e` (G4P-1) | — | **7** (all `M`) | Non-documentary. Includes DR-2 Option A and PR #96 paths — **outside** the Limb A boundary (§4.5's recorded conflict, confirmed by measurement). |
| `a52b47b0` → `001c3c80` (C-1 alternative) | — | **7** (the same 7) | Non-documentary; identical path set to G4P-1. |
| `8eec74ae` (H-12 R5 primary) → `a891802e` (G4P-1) | — | **4** | Non-documentary: `scripts/verify-public-package.mjs`, `src/persistence/gateAPrimeProvisioning.ts`, `tests/g3_gate_a_prime_successor_provisioning.test.ts`, `tests/portfolio_ui_package.test.ts`. DR-2 is already inside `8eec74ae`. |
| `a891802e` (G4P-1) → `7bcae35` (IRR's live consumption pin) | — | **34** | Non-documentary. Spans WS-A broker identity, Direct P1 provisioning, REG-06 operator drop and the PIT durable store. |
| `a891802e` → `6df748d3` (IPD `main`) | **61 behind** | — | Non-documentary drift present. |

**IRR drift (`ramkivs/iips-review-recovered`), `ba64b2d5` → `bcf0670` (`main`), measured:**
**456 commits**, **817 paths changed**, of which **41** are under `frontend/` (excluding
`package-lock.json`) — **23 SOURCE** and **18 TEST/FIXTURE/DOC**. The 23 source paths include
`frontend/tsconfig.broker-import.json`, `frontend/tsconfig.replay-server.json`,
`frontend/server/reports/persist-real-reports.ts`, `frontend/package.json`, `frontend/vite.config.ts`,
`frontend/scripts/materialize-broker-import.mjs`, `frontend/broker-import-package-profile.json`,
`frontend/src/api/brokerHoldingsPreview.ts`, `frontend/server/executive-transport.ts`,
`frontend/server/user-portfolio-transport.ts`, `frontend/server/user-portfolio/firstPartySignal.ts`,
`ipcPortAdapter.ts`, `ownerContextFromBinding.ts`, `translationBoundary.ts`,
`userPortfolioBoundary.ts`, `userPortfolioPort.ts`, `frontend/src/api/userPortfolios.ts`, and three
new broker-import evidence modules.

**Determination.** §3.2(4)'s stop condition is **engaged, in both repositories, by measurement.**
It is not engaged by anything this workstream did improperly: every drift item traced to an
authorized act (the WS-A pin advance under the PA's written `2026-11-05` commission; the Direct P1
read integration at IRR `9202e7a`, `2026-11-01`). But §3.2(4) does not distinguish authorized from
unauthorized drift — it requires **explicit PA re-designation** on *any* non-documentary drift.
**PA-09 is therefore not merely an open preference; it is the re-designation that §3.2(4) demands.**

### 3.3 A preserved invariant worth recording positively

`frontend/server/broker-import/brokerImportHttp.ts` is **byte-identical** between `ba64b2d5` and
current `main` `bcf067061bff42c4b69416dbe33205909cd8ce85` — Git blob
**`cd0b42d1c7803f9451586194e42c0357135271d2`** at both coordinates, unchanged across **456
commits**. The closed two-route `/api/broker-import/` boundary has **not** drifted. This is
the compatibility premise relied on by the A-8 amendment package
(`WS-A-EVIDENCE-RETRIEVAL-ROUTE-U1-S8-AMENDMENT-PACKAGE-2026-11-05.md`), and it is verified here
rather than assumed.

---

## 4. §4.6 obligations evaluated one by one

The formal decision record §4.6 adopts **six** pin-selection obligations, all required before any
pin may be designated. Obligations **1–3 are IRR-executable**; **4–6 are PA/operator**.

### Obligation 1 — merged, exact-head **and** post-merge CI green, remote read-back

**SATISFIABLE at three candidates; NOT SATISFIABLE at the fourth.** Measured via
`gh api repos/ramkivs/iips-production-market-data/commits/<sha>/check-runs` and
`…/actions/runs?head_sha=<sha>`:

| Candidate | First-parent of `main`? | Check-runs at exact SHA | Workflow run at exact SHA | Obligation 1 |
| :--- | :--- | :--- | :--- | :--- |
| `a891802e` (G4P-1) | **YES** (merge, PR #100) | `executed test count=success ; typecheck · build · test=success` | `40640127958` — CI/**push** — success | **SATISFIABLE** |
| `8eec74ae` (H-12 R5 primary) | **YES** (merge, PR #91) | both success | `40196407747` — CI/**push** — success | **SATISFIABLE** |
| `7bcae35` (live pin) | **YES** (merge, PR #127) | both success | `41996684021` — CI — success | **SATISFIABLE** |
| `001c3c80` (C-1 alternative) | **NO** — single parent `8eec74ae`; brought in by merge `1e76f4cf` (PR #96) | both success | `40305148754` — CI/**pull_request** — success. **No post-merge run exists at this exact commit.** | **NOT SATISFIABLE as written** |

> **Finding I-1 (evidence gap).** §4.5's C-1 option names `001c3c80` as an acceptable pin. Obligation
> 1 requires **exact-head *and* post-merge** CI green. `001c3c80` is not a first-parent commit of
> `main`, so the post-merge run exists at `1e76f4cf`, **not at `001c3c80`**. Designating `001c3c80`
> would either fail obligation 1 literally, or require the PA to accept a post-merge run at a
> different commit than the designated pin — which is precisely the identity-severing practice
> §3.2's Rationale warns against (*"a stale pin severs the identity between what is tested and what
> runs"*). **If C-1 is chosen, the post-merge coordinate should be designated, not `001c3c80`.**

### Obligation 2 — non-evidence changed-path delta from the prior pin, classified in/out of scope

**EXECUTED.** Full measured classification at §3.2 above and §5 below. The material result: every
candidate's delta from its predecessor contains paths **outside** the Gate 4 §4.2 Limb A boundary,
which is why §4.5's express-scope-acceptance clause exists. **Out-of-scope content therefore
requires the §4.5 decision (C-1/C-2/C-3) to be rendered before, not after, designation.**

### Obligation 3 — designated tests run at the candidate

**PARTIALLY EXECUTABLE IRR-SIDE; NOT EXECUTED.** Linux CI results exist at every candidate
(obligation 1 table). What does **not** exist is a run of the **Gate 4 designated test set** at any
candidate: QE is **0/11**, and the QE-1…QE-11 matrix is
`PREPARED REFERENCE MATRIX — NOT AN AUTHORIZATION — NOT A QUALIFICATION RESULT`. Where the act
requires **native Windows** execution, no run exists and the host `desktop-no0nhtp` is
**unreachable**. **PA-19/PA-20 waive Windows and operator evidence but expressly do not waive any
Gate 4 decision**, so this gap cannot be closed by waiver.

### Obligation 4 — a separate PA designation act naming commit, tree, blob identities and purpose

**NOT EXECUTED — PA ONLY. THIS IS THE OUTSTANDING DECISION.** No such act exists. This package
supplies the identities to be named (§5) but does not name them as designated.

### Obligation 5 — fresh S2 evidence (L2a) and H-12 regeneration with full validation (L2c) at that commit

**NO ARTIFACT EXISTS AT ANY CANDIDATE.** This is the hardest blocker in the package:

- **PA-10a is NOT ADVANCED**, and its **T-3 artifact requirement survives the PA-19/PA-20 waivers.**
- H-12 R5 is effective **only at its own pins** (`8eec74ae` / `ba64b2d5`). It is *not* an H-12
  regeneration at `a891802e`, at `7bcae35`, or at any other candidate.
- Regenerating H-12 at a designated commit is **downstream** of designation (PA-10a's unlock), so it
  cannot be pre-supplied as evidence *for* designation. Obligation 5 is therefore **sequentially
  unsatisfiable before obligation 4** and must be recorded as a **post-designation obligation**, not
  as a pre-designation evidence gap. The PA should be told this explicitly, because as drafted §4.6
  reads as if all six obligations precede designation.

> **Finding I-2 (sequencing defect in the adopted text).** §4.6 states all six obligations are
> "required before any pin may be designated", but obligation 5 (fresh L2a S2 evidence and L2c H-12
> regeneration **at that commit**) is logically impossible before the commit is designated. Either
> obligation 5 is a **condition subsequent** — designation is effective, then L2a/L2c must be
> produced at the designated commit before QE may start — or no pin can ever be designated. The
> first reading is consistent with §3.1 (H-12 adoption is not a prerequisite for P-1 provisioning)
> and with PA-10a being the thing PA-09 *unlocks*. **This package recommends the condition-subsequent
> reading and flags that it needs PA confirmation, because the choice changes what "designated"
> means for QE readiness.**

### Obligation 6 — receipt, designation and evidence reference the same identities; the receipt's executing identity equals the designated pin

**NOT EXECUTED — depends on obligation 4.** Recorded here with the additional measured fact that
**F3 already documents an identity split**: H-12 R5 binds `8eec74ae`/`ba64b2d5` while G4P-1 names
`a891802e`. Any designation must state which identity set governs, or obligation 6 will fail on its
own terms at the moment a receipt is written.

### 4.1 Obligation roll-up

| Obligation | Owner | State at `2026-11-05` |
| :--- | :--- | :--- |
| 1 — merged, CI green, read-back | IRR | **SATISFIABLE** at `a891802e`, `8eec74ae`, `7bcae35`. **NOT** at `001c3c80` (finding I-1). |
| 2 — delta classified | IRR | **EXECUTED** (§3.2, §5). |
| 3 — designated tests at candidate | IRR / operator | **NOT EXECUTED.** QE 0/11; no native Windows run; host unreachable. |
| 4 — PA designation act | **PA** | **NOT EXECUTED — THE OUTSTANDING DECISION.** |
| 5 — L2a S2 + L2c H-12 at the commit | PA / operator | **NO ARTIFACT.** T-3 survives the waivers. Finding I-2: logically a condition subsequent. |
| 6 — single identity set across receipt/designation/evidence | PA / IRR | **NOT EXECUTED**; F3 identity split must be resolved by the act. |

---

## 5. Exact proposed identities for the designation act

Measured, not inferred. Every SHA below was resolved against a real clone of the remote
(`git rev-parse`, `git rev-list --first-parent`, `git ls-tree`) and cross-checked against
`git ls-remote`. **No SHA in this document is guessed.**

### 5.1 Candidate coordinates

| Label | Commit | Tree | Behind IPD `main` | Commit date | Subject |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **G4P-1 / PA-08a** | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` | `76f083d7058e170d8212455c03bad1033136ee68` | **61** | `2026-10-28T11:18:27+05:30` | Merge PR #100 |
| **DA-A1 step-0 / C-1 alternative** | `001c3c80618f2ee1d40e9a90912237e1a06e7b58` | `399fa44a5f1953c0f61b452420fefb5985426ef1` | 80 | `2026-10-26` | Fix Windows S2 package-consumer execution |
| **H-12 R5 IPD primary** | `8eec74ae27cda09f3c368b9c299895eae41554db` | `4eba29029f8d95cfe483e615a7047426b298ce50` | 81 | `2026-10-25` | Merge PR #91 |
| **Limb A pre-binding** | `a52b47b0f8ca448c8c9c195cf261e83ecf813ba3` | `1467802e9b9497f84acb1bc6bb3ddd386792499a` | 126 | `2026-10-23` | Merge PR #68 |
| **S1 binding** | `f9ec0c5fd4c689360264b4f7a8b85fdf823d4374` | `fcf7cb85ad7f53c20d5cfd8721bfecf7fc13a129` | 103 | `2026-10-24` | CAP-02: S1 identity-value determination and binding commit |
| **DR-2 Option A** | `bc144b95649aec88c3bfd0fc2a9c68e828d4839a` | — | — | `2026-10-25T13:01:02Z` | feat(cap03): DR-2 Option A IPD provider read envelope |
| **IRR live broker-import pin** | `7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc` | `37d3b4f3a567368df785ddf454740fae4a173446` | 5 | `2026-11-05` | Merge PR #127 |
| **IPD `main`** | `6df748d397daf965bd5b6e6e35df5043f7fa8c4d` | `1c3872bfe368e17245678d15daf1a241aa3602d3` | 0 | `2026-11-05` | Merge PR #126 |

**IRR side** (for obligation 6's single identity set): R5's `IRR_qe_consumer` is
`ba64b2d5927c2f872560710cf1474c25a5cde0d5`, tree `5e4262f1cd75bf13b76ced5b45058f31434b5dad`,
`2026-10-25T16:06:08Z`, merge of PR #276, CI `Typecheck · Test · Build=success`, and it is an
**ancestor** of IRR `main` — now **456 commits behind** `bcf067061bff42c4b69416dbe33205909cd8ce85`.

### 5.2 The H-12 R5 blob set as adopted (what obligation 5 would regenerate)

From `docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json`
(blob `f4649e36a81c7013287810cd3202b99586dbd951`):

- **Three pinned bases**, not one: `IPD_primary_qe_coordinate` `8eec74ae` / tree `4eba2902`;
  `IPD_broker_alias_compatibility_coordinate` **`70b24f029842a7e9b7f615e4d9df7376fd4ff817`** / tree
  `cc0f0117822850f9046e9a51bd05c1d45f80cd57`; `IRR_qe_consumer` `ba64b2d5` / tree `5e4262f1`.
- **56 entries** (32 IPD + 24 IRR), all `PRESENT`, `absent_required_or_future_count = 0`; **1**
  conditional entry (`scripts/test-summary-parser.mjs`); **9** `criteria_basis` references; **10**
  revalidated frozen Gate 3 anchors; `delta_from_r4` = 16 changed entries.
- Digest policy: Git blob bytes canonical; `git_blob_oid` SHA-1 and `raw_file_sha256` over the same
  unmodified bytes; **LF and CRLF byte-significant, no normalization**.
- Membership fixed by `G4-AMEND-01` **Alternative A**: 32 IPD + 24 IRR = 56, with the 7 post-Gate-3
  CAP-02 files in `post_g3_cap02_qualified_surface_entries` and compiled `dist/**` in
  `runtime_dist_set`.

**A designation act under PA-09 must state which of the three bases moves.** PA-09's draft wording
has a single `Commit [ ] / tree [ ] / blobs [ ]` triple, but the adopted manifest is a
**three-coordinate** instrument. Naming one commit does not designate the other two. This is
**finding I-3** and is the most likely way for a well-intentioned designation to fail obligation 6.

---

## 6. Material changes of fact since the packet was rendered (`2026-10-29`)

The consolidated packet's G4P-1/2/3 option set **predates the WS-A pin advance of `2026-11-05`**.
Six facts have changed. Each is measured, and each bears on the defensibility of the ballot.

### 6.1 G4P-1 no longer describes the code IRR consumes

`a891802e` is **61 commits behind** IPD `main` and **34 non-evidence paths** away from IRR's live
consumption pin `7bcae35`. Those 34 paths span:

- **WS-A broker identity** — `broker-identity-assessment.ts` (A), `broker-holdings-mapper.ts`,
  `broker-import-ingress.ts`, `types.ts`, `frontend/src/app/App.tsx` / `navigation.ts` / `routes.ts`,
  `src/ipc/brokerImportConsumer.ts` (A), `entrypoint.ts`,
  `tests/ws_a_dhan_broker_holdings_identity.test.ts` (A),
  `tests/q1_broker_import_consumer_wiring.test.ts` (A);
- **Direct P1 provisioning** — `src/persistence/directP1Provisioning.ts` (A),
  `scripts/Invoke-DirectP1Provisioning.ps1` (A), 2 new tests;
- **REG-06 operator drop** — `src/operator_drop/drop_ingestion.ts` / `package.ts` /
  `product_runtime.ts` (A) + 3 new tests;
- **PIT durable store** — `src/pit/pit_durable_store.ts` (A), `pit_store.ts`, `pit_read_service.ts`,
  `package.ts`, `tsconfig.pit-package.json`, `tests/reg06_durable_pit_store.test.ts` (A),
  `tests/iu6_recovered_d114_population_invariants.test.ts` (A);
- plus `gateAPrimeProvisioning.ts`, `verify-public-package.mjs`,
  `tests/portfolio_ui_package.test.ts`, `tests/cap02_pit_d114_package.test.ts`, `package.json`.

**Consequence.** Qualifying `a891802e` would **not** qualify the code IRR actually consumes for
durable holdings. The Gate 4 content pin and the WS-A consumption pin are now different objects with
a 34-path non-documentary delta between them. The packet offers no option that reconciles them.

### 6.2 DQ-6b Path A's interim scope has been exhausted by authorized alias modernization

Path A (`IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01`, effective, 6/6) states:

> *"Path A: permit the split primary/alias baseline as an **interim**, guarded configuration."*
> *"Broker-import alias: `70b24f029842a7e9b7f615e4d9df7376fd4ff817`"*
> *"Preserve the alias because it supports the live DB-C1 preview and required raw-source build."*
> *"Chosen option | **Path A** — admit the split baseline. **Path B (require alias modernization
> first, B-1 or B-2) is not selected**."*
> *"Alias movement | **None.** The alias is **not** re-pinned, **not** modernized, **not** retired by
> this act."*
> §3.1(1): *"Option **(i)** — re-pin the alias to the freeze commit and guard both — is
> **technically impossible**: `build:broker-import` fails `TS18003` because the modern package
> publishes only `dist/package` and supplies none of the 14 required raw sources."*
> §3.1(5): *"Effect of Path A on the critical path … **for the interim period only, and only while
> the guards hold.** … The modernization follow-on re-enters as a tracked, non-blocking item; if the
> guards are ever relaxed, or the alias is moved **without** authority, the freeze's premise fails
> and **DQ-4.4's STOP-and-re-designate rule applies**."*

Measured against the current remote state:

1. **The alias WAS moved — WITH authority.** The PA commissioned the advance in writing on
   `2026-11-05` (the RS-22 alias limb); IRR PR #436 executed it and merged as
   `51fdcd9567407db88626b3d5ae87e642f869205a`. The literal STOP trigger is *"moved **without**
   authority"*, so it is **not** met.
2. **The guards were NOT relaxed — they were strengthened.** The raw-source presence assertion was
   replaced by a raw-source **absence** assertion plus an 18-published-module identity requirement
   plus a manifest/lock/resolved triple pin.
3. **But option (i), declared "technically impossible", was executed.** PR #436 resolved `TS18003`
   IRR-side by materializing the pinned package's published `dist/package` into
   `.cache/broker-import` and repointing `tsconfig.broker-import.json`. The alias is now pinned to a
   **modern** commit and the build works. In substance, **PR #436 performed DQ-6b option (i)** —
   which Path A had declined as impossible.
4. **The interim period is therefore spent.** Path A's effectiveness was scoped *"for the interim
   period only, and only while the guards hold"*, and the guards it named are the V690–V695 facts
   evaluated at §6.3–6.5 below. Those facts have changed.

**Determination.** Path A is **not violated**. Its stated interim scope has been **exhausted by
authorized modernization**, so the **alias-coordinate disposition must be re-rendered** before any
Gate 4 pin designation can be defensible. This is a *new* decision requirement that the `2026-10-29`
packet does not contain, and it is **finding I-4**.

### 6.3 Guard V692 is factually superseded

V692 recorded: *"the alias is load-bearing: it supplies the 14 raw sources compiled by
`tsconfig.broker-import.json`, whose output backs the live DB-C1 preview"* — **PASS**, 14/14 present
at `70b24f02`.

Measured at all three coordinates, **the 14 raw-source paths are present in the tree at every one**:

| Coordinate | 14 alias raw sources present in tree |
| :--- | :--- |
| `70b24f02` (Path A alias) | **14/14** |
| `8eec74ae` (R5 primary) | **14/14** |
| `7bcae35` (live pin) | **14/14** |

So V692's *presence* fact still holds — but its **load-bearing characterization does not**. At
`7bcae35` the package publishes only `dist/package`, so the raw sources are **not reachable by IRR
through npm**; that is exactly the `TS18003` failure Path A cited. The live IRR build is supplied by
**published build output**, not raw sources. **V692 as a guard on the freeze premise is
superseded.**

### 6.4 Guard V694 is measured RESOLVED — a positive consequence

V694 recorded the overlap finding: `src/identity/security_master.ts` is **both** a qualified-tree
H-12 entry at the primary coordinate **and** a required alias raw source, with different bytes, so
*"the qualified IRR build contains **two distinct `SecurityMaster` byte-sets**"*.

Measured blob identities across the three coordinates:

| Path | `70b24f02` (Path A alias) | `8eec74ae` (R5 primary) | `7bcae35` (live pin) |
| :--- | :--- | :--- | :--- |
| `src/identity/security_master.ts` | `e260fd90d05e5bfcd4bdc037524722c6fccee16d` | `60030e0c17f8b2a31977ce598c80b18dc52d6727` | **`60030e0c17f8b2a31977ce598c80b18dc52d6727`** |
| `src/contracts/types.ts` | `11f86dca633bed33da738f525bb8e5c2bb435498` | `a644c83351b030b0e76d76642475420ea7ef07c0` | **`a644c83351b030b0e76d76642475420ea7ef07c0`** |
| `frontend/…/broker-holdings-mapper.ts` | `6c8ab71dc9230d22d0d3fe9a13e1809371f396e4` | `297e4a593bb575a5f3f8616788f3aa9e599707a4` | **`4d0e757b39e3776ad3701e50053696bc52b07b11`** |
| `frontend/…/broker-import-ingress.ts` | `12824fbb5bd7323e106616d0a03de76d408321fc` | `0742401fe2a9bf7a497e94e6bc3973e4327979e0` | **`c8ea9d8fa92b9f8a0ec3d67fbc5fa700e4080899`** |

**Two of the four divergences Path A had to guard are eliminated at the live pin**:
`security_master.ts` and `contracts/types.ts` are now **byte-identical to the R5 primary
coordinate**. The "two distinct `SecurityMaster` byte-sets" condition **no longer holds** for these
paths. Of the original 14 alias raw sources, 10 were byte-identical at both coordinates and 4
diverged; **2 of those 4 have now converged**.

**But two paths carry a THIRD distinct byte-set** at `7bcae35` — `broker-holdings-mapper.ts`
(`4d0e757b…`, differing from both `6c8ab71d…` and `297e4a59…`) and `broker-import-ingress.ts`
(`c8ea9d8f…`, differing from both `12824fbb…` and `0742401f…`). **Neither byte-set is bound by any
adopted H-12 manifest.** This is **finding I-5**.

### 6.5 Guard V695 is measured CHANGED — the most consequential finding in this package

V695 recorded: *"Lineage classification preserved: `REAL` at the alias, `UNCLASSIFIED` at the
primary, three sites each"* — **PASS**. Path A's decision table states: *"Lineage classification for
QE | **Preserved as-is.** The alias keeps `sourceClassification: 'REAL'` at the three mapper sites;
the primary keeps `'UNCLASSIFIED'`. **No reclassification, no re-acceptance, no requalification is
authorized or performed**."* And the R5 manifest's `lineage_note`: *"**REAL** is therefore the
lineage classification that the **DB-C1 preview exhibits**, and the primary-coordinate
classification is UNCLASSIFIED."*

Measured `sourceClassification` in `broker-holdings-mapper.ts`:

| Coordinate | `sourceClassification` at the three mapper sites |
| :--- | :--- |
| `70b24f02` (Path A alias) | **`'REAL'` ×3** (lines 262, 337, 360) |
| `8eec74ae` (R5 primary) | **`'UNCLASSIFIED'` ×3** |
| `7bcae35` (live pin) | **`'UNCLASSIFIED'` ×3** (lines 348, 425, 448) |

**The live consumption pin carries `UNCLASSIFIED`, not the `REAL` that Path A expressly preserved.**
Because the alias advance moved IRR's consumption to `7bcae35`, the classification the DB-C1 preview
exhibits is now the **primary-coordinate** classification.

**This is not cosmetic.** At all three sites `sourceClassification` is an argument to
`computeLineageHash(...)`:

```ts
const lineageDigest = computeLineageHash(holdingPayload, {
  sourceClassification: 'UNCLASSIFIED',   // 'REAL' at 70b24f02
  asOf,
  dataVersion: 'v1.0.0-bi03',
});
```

It therefore determines **every lineage digest** the mapper emits — the empty-provenance digest, the
per-holding `lineageDigest`, and the final digest. **Any lineage digest recorded from the DB-C1
preview at `70b24f02` is not reproducible at `7bcae35`.**

> **Finding I-6 (unrecorded material consequence).** The authorized pin advance changed a fact that
> an effective PA act expressly preserved, and changed digest-valued output. Verified documentation
> gap: the WS-A R2 report
> (`WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md`) contains **zero** occurrences of
> `sourceClassification`; `frontend/broker-import-package-profile.json` records no lineage or
> classification field; and **no IRR test asserts the value** — the only IRR occurrence of the token
> anywhere under `frontend/` is `frontend/server/pit/nonProductionPitStore.ts:67`
> (`'DERIVED'`), which is unrelated. The change therefore passed PR #436's full validation
> (`test:ci` 111 files / 1,386 tests / 0 failed) **silently**. The tracker records `REAL` →
> `UNCLASSIFIED` only as Path A's *historical* V684/V695 finding, never as a consequence of the
> `2026-11-05` advance.
>
> **This package records it and does not remedy it.** Remediation options — re-declaring the
> lineage classification for QE, re-accepting DB-C1, re-baselining recorded digests, or adding a
> classification assertion — are all **PA decisions**, and §4.5/Path A both state that *"no
> reclassification, no re-acceptance, no requalification is authorized or performed."* Nothing here
> authorizes any of them.

### 6.6 The fence baseline cited by WS-A records has been superseded (reads only; writes intact)

WS-A records — including the A-8 gap determination §1.3 and the R2 report — state that *"all twelve
`/api/user-portfolios*` route-method pairs return HTTP 503 with byte-stable fence blobs
(`fenceUnchanged.test.ts` re-asserts them)"*. That was true at `ba64b2d5`. It is **not** the current
state.

Measured: IRR commit **`9202e7a`** (`2026-11-01T16:56:53Z`, *"Integrate Direct P1 user portfolio
reads over IPC"*, preceded by `e9df332` `2026-10-31` *"Authorize one-pass CAP03 P1 completion"*)
rewrote `fenceUnchanged.test.ts` (**+128 / −462**) and `user-portfolio-transport.ts`
(**+152 / −25**). The test file's own current header states:

> *"The historical G-3 all-route 503 fence was **superseded for the explicitly authorized read-only
> list/detail/revision paths** by the Direct P1 IRR integration. This suite keeps the fail-closed
> owner precondition, no-identity, no-write, C8 loopback/CORS, and certified-route invariants; it no
> longer asserts that admitted IPC reads are unreachable."*

Current authoritative state at `main` `bcf067061bff42c4b69416dbe33205909cd8ce85`, read from the test
and the transport source (and re-verified as **unchanged** by PR #438, which merged as `bcf0670`:
`git diff --name-status 4162a9ea…bcf0670 -- frontend/server/user-portfolio/
frontend/server/broker-import/ frontend/server/user-portfolio-transport.ts frontend/vite.config.ts
frontend/server/executive-transport.ts` is **empty** — PR #438 touched neither the fence nor the
broker-import surface):

| Surface | Current behaviour |
| :--- | :--- |
| `GET`/`HEAD` `/api/user-portfolios`, `/api/user-portfolios/:portfolioId`, `/api/user-portfolios/:portfolioId/revisions` | **ADMITTED** as read-only IPC reads when the binding precondition is present; **503 `owner-context-unavailable`** when it is absent (still fail-closed, still no request identity read). |
| `POST /api/user-portfolios`, `DELETE /api/user-portfolios/:portfolioId`, `PUT /api/user-portfolios/:portfolioId/holdings`, `POST /api/user-portfolios/:portfolioId/reset`, `GET /api/user-portfolios/context` | **503 `operation-not-admitted` — unadmitted even WITH a binding assertion.** Writes and context discovery remain fenced. |
| `owner-context-unavailable.ts` | Blob **`cb8db45d668d28cee7e0a52721001d579a872733`** — asserted **byte-identical**, frozen, non-disclosing (no `applicationUserId`, `tenantId`, `principal`, `DEFAULT_PORTFOLIO`). |
| `user-portfolio-transport.ts` recorded blob `51704c12a467cd2f718a030b5036bc55c9afa73f` | **Assertion removed** — the file legitimately changed under the Direct P1 integration. |

**Determination.** This is **authorized, completed, preserved work by another session and is not
reopened, questioned or reverted here.** Its relevance to A-10 is narrow and specific: (a) it is
part of the IRR-side non-documentary drift that engages Gate 4 §3.2(4); and (b) the WS-A fence
premise needs an **additive currency correction**, because a designation act or an evidence-route
amendment that recites "twelve 503 pairs byte-stable" would recite a **superseded** baseline.

**The write fence, `W-1`, `evaluatePortSaveGuard()`, P04 quarantine, DP-2 Option 2F and Gate 5 are
UNAFFECTED.** No write path was admitted. `WRITE_NOT_AUTHORIZED` and `storeEffect 'NONE'` are
unchanged. The A-8 amendment package states the current baseline rather than the superseded one.

---

## 7. Inconsistencies and missing evidence preventing a defensible decision

Consolidated. **Each of I-1 … I-8 must be dispositioned by the PA before or within the designation
act.** None is remediable by IRR acting alone.

| # | Finding | Why it prevents a defensible designation | Disposition required |
| :--- | :--- | :--- | :--- |
| **I-1** | `001c3c80` has no post-merge CI run at its own SHA (only `pull_request` run `40305148754`; it is not a first-parent commit — merged via `1e76f4cf`, PR #96). | §4.6 obligation 1 requires exact-head **and** post-merge green. Designating `001c3c80` fails obligation 1 literally, or severs tested-identity from designated-identity against §3.2's Rationale. | If C-1 is chosen, designate a **first-parent post-merge** coordinate, or expressly waive the literal reading. |
| **I-2** | §4.6 obligation 5 (L2a S2 + L2c H-12 regeneration **at the designated commit**) is impossible before designation, yet §4.6 says all six obligations precede designation. | As drafted, no pin can ever be designated. | Confirm obligation 5 is a **condition subsequent**. |
| **I-3** | PA-09's draft wording carries a **single** commit/tree/blobs triple, but the adopted H-12 R5 manifest is a **three-coordinate** instrument (IPD primary, IPD broker alias, IRR consumer). | Naming one commit does not designate the other two; obligation 6 (single identity set) would fail the moment a receipt is written. | The act must name **all three** coordinates, or state which are unchanged. |
| **I-4** | DQ-6b Path A's interim scope is exhausted: the alias was moved **with** authority, option (i) declared "technically impossible" was executed by PR #436, and guards V692/V693/V694/V695 no longer hold as recorded. | Path A supplied the alias disposition the H-12 freeze depends on. That disposition is now spent, so the freeze has **no current alias-coordinate authority**. | Re-render the alias-coordinate disposition (a fresh DQ-6b-class decision) before or within PA-09. |
| **I-5** | `broker-holdings-mapper.ts` (`4d0e757b…`) and `broker-import-ingress.ts` (`c8ea9d8f…`) carry a **third** distinct byte-set at the live pin, bound by **no** adopted manifest. | The live consumption path contains unbound bytes. Any H-12 regeneration must decide whether these are in the qualified set, in the alias set, or in neither. | Name the two blobs' disposition in the act. |
| **I-6** | Lineage classification changed from the preserved `'REAL'` ×3 to `'UNCLASSIFIED'` ×3 at the live pin, feeding `computeLineageHash` at all three sites; undocumented in R2 (0 occurrences), unrecorded in the package profile, unasserted by any IRR test. | An effective act expressly preserved this value and stated that no reclassification is authorized. It changed anyway, as a consequence of an authorized move, and it changes digest values. Recorded DB-C1 lineage digests are not reproducible at the live pin. | PA to decide: re-declare the QE lineage classification, re-accept DB-C1, re-baseline recorded digests, or record the divergence as accepted. **Not remediable by IRR.** |
| **I-7** | G4P-1 `a891802e` is 61 behind IPD `main` and 34 non-evidence paths from IRR's live pin `7bcae35`. | Qualifying G4P-1 does not qualify the code IRR consumes. The packet's option set predates the advance and contains no option that reconciles the two. | PA to decide whether the Gate 4 content pin and the WS-A consumption pin are the same object or deliberately different ones — and if different, to record that expressly. |
| **I-8** | Obligation 3 has no artifact: QE **0/11**, the QE matrix is a prepared reference and not a result, no native Windows run, host `desktop-no0nhtp` **unreachable**; PA-19/PA-20 waive Windows/operator evidence but **no Gate 4 decision**. | A designation without any designated-test execution is defensible **as a content designation** but cannot be recorded as qualification readiness. | Record designation and execution-readiness as **separate** states. |

### 7.1 The option the packet does not contain

Measured facts make a fourth option arguable that the `2026-10-29` packet does not offer:

> **G4P-4 (not previously offered — flagged, not recommended).** Designate the **live consumption
> pin `7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`** (tree `37d3b4f3a567368df785ddf454740fae4a173446`,
> first-parent merge of IPD PR #127, CI green at exact SHA, run `41996684021`, 5 behind `main`).

Its merits and its costs, both measured:

- **For:** obligation 1 satisfiable; it is the code IRR actually consumes, so it resolves I-7; its
  `security_master.ts` and `contracts/types.ts` are byte-identical to the R5 primary, partially
  resolving I-5; it is only 5 commits behind IPD `main`, so §3.2(4) drift is minimal.
- **Against:** it is **61 commits past** G4P-1 and carries the 34-path delta, which is overwhelmingly
  **non-Limb-A** — so §4.5's express scope acceptance would have to cover far more content than the
  packet contemplated. It also post-dates the R5 adoption, so H-12 R5 would need full regeneration
  (obligation 5) rather than a coordinate substitution. And it is **not** a Limb A-only commit, so
  it does not satisfy C-2 either.

**This package flags G4P-4 as existing and measurable. It does not recommend it and does not treat
it as pre-decided.** Adding an option to a PA ballot is itself a PA prerogative; IRR's role here is
to ensure the ballot is not stale.

---

## 8. The exact PA decision still required

**Rendered so it can be taken without further investigation.** Act ID: **PENDING ASSIGNMENT**.
Status: **`PROPOSED — NOT EFFECTIVE`**. Nothing below is self-executing.

### 8.1 Decision 1 — PA-09 content-pin designation (the primary outstanding decision)

Fill the packet's own wording, extended to satisfy finding I-3's three-coordinate requirement:

> **PA-09:** The Gate 4 QE and H-12 **content** pin is **[G4P-1 `a891802e` / G4P-2 / G4P-3 / G4P-4
> `7bcae35` / deferred]**.
> IPD primary coordinate: commit `[ ]`, tree `[ ]`.
> IPD broker-alias coordinate: commit `[ ]`, tree `[ ]` — **required by finding I-4, since DQ-6b
> Path A's interim disposition is spent**.
> IRR consumer coordinate: commit `[ ]`, tree `[ ]`.
> Blobs: `[ ]` — **must include the disposition of `4d0e757b39e3776ad3701e50053696bc52b07b11` and
> `c8ea9d8fa92b9f8a0ec3d67fbc5fa700e4080899` per finding I-5**.
> Purpose: Gate 4 Limb A, QE and H-12 **content**.
> Non-Limb-A content in scope: **[accepted / not accepted]** — §4.5 C-1 requires express acceptance.
> Lineage classification for QE: **[`REAL` / `UNCLASSIFIED` / divergence accepted as recorded]** —
> **required by finding I-6.**
> Obligation 5 is a **condition subsequent**: **[confirmed / not confirmed]** — finding I-2.
> **Designation is not Gate 4 execution**, and per §3.2's Limitation **no QE execution pin exists
> until Limb A is implemented and merged.**

### 8.2 Decision 2 — §4.5 choice (must precede or accompany Decision 1)

**C-1** (accept a post-binding commit with express non-Limb-A scope acceptance, then regenerate
H-12 there) / **C-2** (require a Limb A-only QE commit — **needs new IPD implementation authority,
not granted**) / **C-3** (keep undesignated until the CAP-03 chain produces `C′`).

Note that Decision 1's option set and Decision 2 are coupled: choosing **C-2** makes G4P-1, G4P-4
and `001c3c80` all inadmissible, because none is Limb A-only.

### 8.3 Decision 3 — the alias-coordinate re-render (finding I-4)

A fresh DQ-6b-class disposition for the broker-import alias coordinate now that it stands at
`7bcae35` with published-output materialization rather than raw-source compilation. This is
**separate from** PA-09 and cannot be folded into it silently, because Path A is an effective act
and effective acts are not rewritten.

### 8.4 Decision 4 — the lineage-classification disposition (finding I-6)

One of: re-declare `'UNCLASSIFIED'` as the QE lineage classification; re-declare `'REAL'` (which
would require an IPD change and is therefore **not available without new IPD implementation
authority**); re-accept DB-C1 at the new classification; or record the divergence as accepted with
the non-reproducibility of pre-advance lineage digests stated expressly.

### 8.5 What is NOT required from the PA, and must not be inferred as required

Designation does **not** require, authorize or imply: Gate 4 execution; any QE item starting; QE
0/11 → 11/11; Gate C or U4 rendering; result acceptance; Gate 5 initiation or admission; any `W-1`
relaxation; any fence lift; any P04 quarantine change; any DP-2 Option 2F change; any real-user
durable save; any production scope; any IPD write; any dependency-pin change; or any D05 deposition.

---

## 9. Dependency and downstream consequences for A-11 … A-18

| Action | Depends on | Consequence of a PA-09 designation | Consequence of continued non-designation |
| :--- | :--- | :--- | :--- |
| **A-11** | A-10 | **UNBLOCKED to start** — H-12 regeneration (PA-10a) becomes renderable at the designated coordinate(s), subject to obligation 5 as a condition subsequent. | Stays `NOT STARTED`. No coordinate exists to regenerate against. |
| **A-12** | A-11 | Gate C / U4 rendering becomes addressable. Note Gate C and U4 are **NOT RENDERED** today and rendering is a separate authority. | Stays `NOT RENDERED`. |
| **A-13** | A-12 | DQ-4 **8/10 → 10/10** becomes reachable. The two outstanding DQ-4 limbs are designation-dependent. | Stays **8/10**. DQ-4.4's STOP-and-re-designate rule remains live and, per finding I-4, engaged in substance. |
| **A-14** | A-13 | Gate 5 initiation becomes *addressable* — **not** authorized. Gate 5 is `NOT INITIATED / NOT ADMITTED` and needs its own act. | Stays `NOT INITIATED`. |
| **A-15** | A-14 | U6 remains `NOT AUTHORIZED` regardless; A-15 needs its own effective authority. | Unchanged. |
| **A-16** | A-2 | **CLOSED / VERIFIED — not reopened by this package.** | n/a |
| **A-17** | A-16 | **CLOSED / VERIFIED — not reopened by this package.** | n/a |
| **A-18** | A-7 + A-9 + A-15 | The nine-pillar review can only conclude `NOT COMPLETE` until those three close. A-10 designation alone moves **pillar 8** from `AWAITING-AUTHORITY` toward addressable, but does not satisfy it. | Stays `NOT STARTED`. |
| **A-5 / A-6 / A-7** | external operator input | **Unaffected by PA-09.** The identity spine is blocked on the operator's Dhan detailed-holdings export, not on the pin. See `WS-A-DHAN-DETAILED-HOLDINGS-EXTERNAL-DEPENDENCY-2026-11-05.md`. | Unchanged — `BLOCKED-EXTERNAL`. |
| **A-8 / A-9** | PA route amendment | **Unaffected by PA-09.** The evidence route needs the U1 additive amendment, not a pin. See `WS-A-EVIDENCE-RETRIEVAL-ROUTE-U1-S8-AMENDMENT-PACKAGE-2026-11-05.md`. | Unchanged — `PENDING AUTHORITY`, blocker `WS-A-EV-ROUTE-1`. |

**Critical-path observation.** A-10 is the head of the `A-10 → A-11 → … → A-15` spine, so nothing
on that spine can advance without Decision 1. But the **other two spines are independent of it**:
`A-5 → A-6 → A-7` is blocked on an external operator input, and `A-8 → A-9` is blocked on a
different PA instrument. **WS-A-DM therefore has three independent outstanding authorities, and
discharging PA-09 alone would leave the milestone `NOT COMPLETE`.** This is stated so that a PA-09
designation is not mistaken for milestone completion.

---

## 10. What this package does not do

1. It **does not fabricate a PA act**, an effective authorization, a pin designation, an acceptance,
   or a Gate 4 result. No Act ID is assigned or claimed.
2. It **does not designate** any commit as the Gate 4 QE or H-12 pin. Every SHA is a *measured
   candidate*.
3. It **does not claim** QE progress. QE remains **0/11**. The QE-1…QE-11 matrix remains
   `PREPARED REFERENCE MATRIX — NOT AN AUTHORIZATION — NOT A QUALIFICATION RESULT`.
4. It **does not modify** the H-12 R5 manifest, the R5 adoption act, DQ-6b Path A, the Gate 4 act,
   the consolidated PA packet, or the formal decision record. All are preserved byte-for-byte.
   Effective acts are **not** rewritten; the currency findings at §6 are recorded **additively here**.
5. It **does not change** any dependency pin. `frontend/package.json` still pins broker-import at
   `7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`; production-market-data at `279d1eed…`; np04 at
   `2e11fa3b…`. **No pin was moved by this package.**
6. It **does not write to IPD.** Every IPD fact was obtained read-only (`git clone --filter=blob:none`,
   `git show`, `gh api`). Zero IPD writes; the prior HTTP 403 boundary is respected.
7. It **does not reopen** completed A-1 … A-4, A-16 or A-17, and does not touch IRR PR **#438**,
   which belongs to another session.
8. It **does not revert, question or reopen** the Direct P1 read integration at `9202e7a`. That is
   authorized completed work. §6.6 records only its consequence for a stale WS-A fence premise.
9. It **does not remedy** findings I-5 or I-6 in code. Both require PA decisions, and Path A states
   that no reclassification, re-acceptance or requalification is authorized.
10. It **does not implement** an HTTP route, initiate production work, perform a real-user save, or
    relax Gate E W-1, the P04 quarantine, Gate 4, Gate 5 or DP-2 Option 2F.

---

## 11. Evidence index — how every fact above was obtained

| Fact class | Method |
| :--- | :--- |
| Remote refs | `git ls-remote` on both repositories; IRR `main` = `bcf067061bff42c4b69416dbe33205909cd8ce85` (PR #438, merged `2026-11-05T16:39:30+05:30`; re-censused mid-pass after `4162a9ea…` moved); IPD `main` = `6df748d397daf965bd5b6e6e35df5043f7fa8c4d`. |
| IPD commit/tree/ancestry/distance | Blobless bare clone `/tmp/ipd-probe`; `git fetch origin '+refs/heads/*:refs/remotes/origin/*'`; `git rev-parse --disambiguate=<short>` (never a guessed SHA tail); `git rev-parse <sha>^{tree}`; `git merge-base --is-ancestor`; `git rev-list --count <sha>..origin/main`; `git rev-list --first-parent origin/main`. |
| Non-evidence delta classification | `git diff --name-status <from> <to>` with `evidence/` and `docs/` paths filtered out; path sets enumerated in full at §3.2 and §6.1. |
| CI status at exact SHAs | `gh api repos/ramkivs/iips-production-market-data/commits/<sha>/check-runs` and `…/actions/runs?head_sha=<sha>`. (`gh run list --commit` is unsupported in this `gh` version.) |
| Blob identity of the four divergent paths | `git rev-parse <sha>:<path>` at each of `70b24f02`, `8eec74ae`, `7bcae35`. |
| `sourceClassification` values | `git show <sha>:frontend/src/features/portfolio/import/broker-holdings-mapper.ts` piped to `grep -o "sourceClassification: *'[A-Z]*'"` with counts; context read via `grep -n -B3 -A2`. |
| Gate 4 act §3.2 text and blob stability | `git show <sha>:evidence/cross-repository/IIPS_V3_CAP02_GATE4_TARGET_HOST_QUALIFICATION_ACT_EFFECTIVE_2026-10-23.md` at three coordinates; blob `66b56fd1584890525a7250aadd7da449def621e5` identical at all three. |
| IRR drift `ba64b2d5` → `bcf0670` | Blobless clone `/tmp/irrprobe`; `git rev-list --count`; `git diff --name-only/--name-status`; `git rev-parse <sha>:<path>` for the seven key paths; `git log --format -- <path>` to attribute the fence change to `9202e7a` and `e9df332`. |
| IRR `ba64b2d5` identity and CI | `gh api repos/ramkivs/iips-review-recovered/commits/ba64b2d5…` and `…/compare/ba64b2d5…main` (local IRR clone is shallow at depth 1, so the API is authoritative there). |
| Frontend drift since PR #436 | `gh api …/compare/51fdcd95…4162a9ea` → **7 files changed, `0` under `frontend/`**; then `git diff --name-status 4162a9ea…bcf0670 -- frontend/` → **4 files**, all NP-06 Reports (`persist-real-reports.ts`, `real-report-persistence.test.ts`, `ReportsRealData.test.tsx`, `tsconfig.replay-server.json`), **none** in the broker-import or fence surface. PR #436's broker-import validation evidence therefore carries forward to current `main` without re-run. |
| H-12 R5 blob set | `docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json`, parsed as JSON; `pinned_bases`, `entry_count`, `conditional_entries`, `criteria_basis`, `split_baseline`, `delta_from_r4` read directly. |
| Documentation-gap check for I-6 | `grep -c sourceClassification` on the R2 report → **0**; `grep -rn sourceClassification frontend/` → single unrelated hit at `frontend/server/pit/nonProductionPitStore.ts:67`; `grep -n` on `frontend/broker-import-package-profile.json` → no lineage field. |

---

## 12. Action-register effect

| Action | Status before | Status after this package | Authority still outstanding |
| :--- | :--- | :--- | :--- |
| **A-10** | `OPEN — PA-09 pin designation required` | **`PREPARED — DECISION PACKAGE COMPLETE; BLOCKED ON PA`**. All IRR-executable investigation, measurement and documentation is done. Obligations 1 and 2 discharged; 3, 5 measured as gaps; 4 and 6 identified as PA-only. Eight findings I-1…I-8 rendered with required dispositions. | **PA (Ramki):** Decisions 1–4 at §8. Act ID **PENDING ASSIGNMENT**. |

**A-10 is NOT closed.** It moves from *open and unprepared* to *prepared and blocked on a named PA
decision*. **Workstream A and milestone WS-A-DM remain NOT COMPLETE.**
