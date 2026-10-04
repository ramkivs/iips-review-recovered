# NP-08 / P-4 — GATE-Y CORPUS PLACEMENT DESIGNATION & C-1/C-2 DURABILITY RESOLUTION

> **Record identifier:** `NP-08-P4-GATE-Y-CORPUS-PLACEMENT-DESIGNATION`
> **Document type:** `AUTHORITY DECISION` — durable corpus placement designation
> **Workstream:** **NP-08 — Intelligence**
> **Governance path:** **GATE-Y — Intelligence Data Supply Designation / Selection**
> **Decision date (rendering):** 2026-10-04
> **Deciding authority:** **Ramki (Ramakrishnan), Program Authority**
> **Recording agent:** `arena-agent` — investigation, verification, and record-execution **only**. No decision rendered by the agent.
> **Repository scope:** **IRR** `ramkivs/iips-review-recovered` (durable destination) · **IPD** `ramkivs/iips-production-market-data` (source corpus; **read-only, unmutated**)
> **Production:** **OUT OF SCOPE**

---

## A. DECISION

> ## **C-1 IS SELECTED AS THE DURABILITY CONVENTION FOR GATE-Y CORPUS PLACEMENT.**
>
> ## **C-2 IS NOT SELECTED AS A DURABILITY MECHANISM.**

### A.1 Basis

| Element | Determination |
|---|---|
| C-1 | **Authoritative durability rule.** Source: `NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD` — *"authoritative closure requires publication to IRR `main`"*; *"A local file, session-branch commit, or open pull request is **not** authoritative `main` publication."* Ratified as the authoritative durability rule by **`Act B = B-i`** (`NP-13-PA-D2-C-REALIZATION-SEMANTICS-DECISION-01` §9.1, effective `2026-10-04T07:42:20Z`, blob `e4205a85…`), elements **B1**, **B2**, **B10**. |
| C-2 | **Not a durability mechanism.** Under B-i (elements **B3**, **B4**, **B5**), C-2 is a **historical / non-durability** placement and recording convention with **no durability effect** and **no prospective general force**. It therefore **cannot** establish authoritative placement and is **not selected**. |

### A.2 Why C-1 requires an explicit destination

C-1's canonical text names **IRR `main`**. The GATE-Y corpus is **IPD-native**. C-1 therefore cannot be satisfied by the corpus's existing IPD branch location, and the durable destination is **established explicitly by this act** rather than inferred.

### A.3 Scope of this resolution — **strictly bounded**

> ⚠️ **This resolution applies to GATE-Y corpus placement only.**
>
> It does **not** generalize to any unrelated artifact, workstream, or record. It does **not** amend `NP-13-D0-01` §6 `GAP-6`, does **not** amend the `NP-15` record, and does **not** modify the B-i record (`NP-13-PA-D2-C-REALIZATION-SEMANTICS-DECISION-01`, blob `e4205a85…`). Those records are left exactly as found; their statements remain accurate as to their own effective points.

---

## B. SOURCE CORPUS (AUTHORITATIVE ORIGINATING GOVERNANCE CORPUS)

| Field | Value |
|---|---|
| Repository | **`ramkivs/iips-production-market-data`** (IPD) |
| Ref | **`arena/01a0ddae-iips-production-market-data`** |
| Source HEAD | **`8c87317aacd12788a145d3e0fceecbd9282d2f6b`** |
| HEAD commit date | 2026-09-27T19:31:26Z |
| HEAD author | `ramkivs` |
| Corpus directory | `evidence/intelligence-data-supply-governance/` |
| Corpus file count | **10** |
| Corpus bytes | **466,579** |
| Role | **Originating GATE-Y governance corpus / source.** Complete and authoritative as to corpus content. |
| Status after this act | **INTACT — not deleted, not rewritten, not downgraded.** |

### B.1 Source corpus artifact identities (complete, verified)

| # | File | Bytes | Git blob | SHA-256 |
|---:|---|---:|---|---|
| 1 | `D06-D07-UI-INTEGRATION-AUTHORIZATION-ACT.md` | 54,384 | `61373a1ed305ce50af9f0460ced4a89b345af21f` | `14f2087cda36a09de81c3f53aba05e6241861361c5fde76237766abc9523527f` |
| 2 | `D06-M1-PROSPECTIVE-NSE-CORPORATE-DISCLOSURE-DATASET-COMMISSIONING-ACT.md` | 60,591 | `72810b71c0d43ad376b6cf0773c5130ed123b9e5` | `1afd882657f2db82c014899ddb5d820ad20b507d8667bf0c5172da3c212f7c5c` |
| 3 | `D06-M3-PROSPECTIVE-NSE-CORPORATE-DISCLOSURE-PROVENANCE-ACCEPTANCE-ACT.md` | 48,446 | `939ec6ffb4f48212296183d9c09560bbf91d4a8c` | `be04b2f13a3f9615aeb8373ec84166a5c14456fd63e4be3e8ac93f37e7884ce9` |
| 4 | `D07-M1-PROSPECTIVE-ESTIMATES-OBSERVATION-DATASET-COMMISSIONING-ACT.md` | 45,681 | `82c36b03dfda8c2c31299e8ab4f07eab9d8e1d15` | `9c0f2975af367da680edd303627cbb0ad9092b4dc37e5b3134052b2b49871e9d` |
| 5 | `D07-M3-PROSPECTIVE-ESTIMATES-PROVENANCE-ACCEPTANCE-ACT.md` | 28,969 | `0ba5a9f49468ae02a62015803ecd202ec224110b` | `7c6cffb8884cdc7723f3fc47155557835a0f6aec030aa95b07446553a90da24d` |
| 6 | `D8-D06-D07-SOURCE-PROVIDER-DESIGNATION-ACT.md` | 39,275 | `4dc2288a5b8277f5eebb31ba88d2b464778c9e79` | `2519cbe436f34b2c42e4cbdec0d9acc755dd5a4fa13d28d0b47e0aaed024bd98` |
| 7 | `D8-D06-NEWS-SOURCE-PROVIDER-DESIGNATION-ACT.md` | 129,700 | `02ca10791c7c4bc55e3b6b4a231296b60f8efef9` | `4fda6bfd306fe1dde11b543f14e2d74ff0764f48d49911097898d27953dff0c2` |
| 8 | `D8-INTELLIGENCE-DOMAIN-SCOPE-DETERMINATION-ACT.md` | 20,668 | `a2b4179fb323531b675ffe029415d8b3bdd3080b` | `6d4c27eae30d438cc0fd02f8d3b4a1c00be04c889c403c968457f4f73709cf36` |
| 9 | `GATE-Y-INTELLIGENCE-DATA-SUPPLY-DESIGNATION-AND-GATE-SELECTION-ACT.md` | 18,089 | `aa7746096f24c367322d10a6dcd216ea30fb5815` | `f4f67ca3f18a3573b4737fc77a160622689166f163d3862854fba79fd69504dc` |
| 10 | `GATE-Y-M2-INTELLIGENCE-DATA-AUTHORIZATION-ACT.md` | 20,776 | `bd3be4024d8910f62860ec46cc267d646c0bc454` | `7b4a658f496112b8d5f9b1ba52533f2d4a16f71f55951a20f19d542cc0d77f43` |

**Verification:** all 10 files re-read from the **remote** immediately before mutation; file count **10**, bytes **466,579**, all blob IDs and SHA-256 values as tabulated. Unchanged from the P-4 investigation.

---

## C. DURABLE DESTINATION (AUTHORITATIVE PUBLISHED STATE)

| Field | Value |
|---|---|
| Repository | **`ramkivs/iips-review-recovered`** (IRR) |
| Ref | **`main`** (`refs/heads/main`) |
| **Baseline commit BEFORE mutation** | **`f02ae1de3c16b3ed929e02edc66c6779a88fe3b`** |
| **Baseline tree BEFORE mutation** | **`5c9c3137a300af643c8949083b999b22a8edf3c8`** |
| Baseline tracked files | 1,051 |
| Designated corpus path | **`evidence/intelligence-data-supply-governance/`** |
| Role after this act | **Authoritative durable published IIPS review baseline for the GATE-Y corpus.** |

### C.1 Path designation and its justification — **path preservation is mandatory for corpus coherence**

The corpus is published at the **same repository-relative path it occupies in IPD**: `evidence/intelligence-data-supply-governance/`.

This is **not** stylistic. Six of the ten acts contain in-repo integrity cross-references that verify sibling artifacts **by path, byte size, and SHA-256** — for example:

* `GATE-Y-M2-INTELLIGENCE-DATA-AUTHORIZATION-ACT.md` — *"GATE-Y designation act | PRESENT — `evidence/intelligence-data-supply-governance/GATE-Y-INTELLIGENCE-DATA-SUPPLY-DESIGNATION-AND-GATE-SELECTION-ACT.md` blob `aa774609…`"*
* `D06-M3-…PROVENANCE-ACCEPTANCE-ACT.md` — *"D06 provider-designation act: `evidence/intelligence-data-supply-governance/D8-D06-NEWS-SOURCE-PROVIDER-DESIGNATION-ACT.md` — 129700B SHA-256 `4fda6bfd…`"*
* `D06-M1-…COMMISSIONING-ACT.md`, `D07-M3-…PROVENANCE-ACCEPTANCE-ACT.md`, `D06-D07-UI-INTEGRATION-AUTHORIZATION-ACT.md` — equivalent path-anchored self-verification.

Relocating the directory would **falsify these references** and destroy the corpus's internal self-verifying property. Because the source artifacts may **not** be modified (§F.1), the only way to keep the corpus coherent is to **preserve its path**. This is the minimal path-level reconciliation strictly required.

### C.2 Corpus boundary — disclosed

The corpus acts cite **IPD-native antecedent records that lie outside the 10-file corpus** — e.g. `evidence/target-shell-integration/PHASE1C-INTELLIGENCE-PAYLOAD-FORENSIC-REPORT.md`, `evidence/persistence-payload-governance/A-1-PERSISTENCE-PAYLOAD-GOVERNANCE-WORKSTREAM-DESIGNATION.md`, `GATE-P-PERSISTENCE-GOVERNANCE-READ-ONLY-GATE-SELECTION.md`.

Those antecedents are **not** part of the GATE-Y corpus and were **not** imported. Their references remain **IPD-relative** by design. This is disclosed as a corpus boundary, not cured.

---

## D. CORPUS SCOPE — COMPLETE PUBLICATION

**All ten acts are published.** The nine acts previously absent from IRR are included.

| Act | Previously in IRR? | Published by this act |
|---|---|---|
| `D06-D07-UI-INTEGRATION-AUTHORIZATION-ACT.md` | ❌ absent | ✅ |
| `D06-M1-PROSPECTIVE-NSE-CORPORATE-DISCLOSURE-DATASET-COMMISSIONING-ACT.md` | ❌ absent | ✅ |
| `D06-M3-PROSPECTIVE-NSE-CORPORATE-DISCLOSURE-PROVENANCE-ACCEPTANCE-ACT.md` | ❌ absent | ✅ |
| `D07-M1-PROSPECTIVE-ESTIMATES-OBSERVATION-DATASET-COMMISSIONING-ACT.md` | ❌ absent | ✅ |
| `D07-M3-PROSPECTIVE-ESTIMATES-PROVENANCE-ACCEPTANCE-ACT.md` | ❌ absent | ✅ |
| `D8-D06-D07-SOURCE-PROVIDER-DESIGNATION-ACT.md` | ❌ absent | ✅ |
| `D8-D06-NEWS-SOURCE-PROVIDER-DESIGNATION-ACT.md` | ❌ absent | ✅ |
| `D8-INTELLIGENCE-DOMAIN-SCOPE-DETERMINATION-ACT.md` | ❌ absent | ✅ |
| `GATE-Y-INTELLIGENCE-DATA-SUPPLY-DESIGNATION-AND-GATE-SELECTION-ACT.md` | ⚠️ transport copy only | ✅ full corpus context |
| `GATE-Y-M2-INTELLIGENCE-DATA-AUTHORIZATION-ACT.md` | ❌ absent | ✅ |

**Before this act:** IRR held **1 of 10** acts (10% governance coverage).
**After this act:** IRR `main` holds **10 of 10** acts (100%).

**Of special note:** the **M-2 authorization act** (`bd3be402…`) — the artifact establishing M-2 as *Authorized* and underpinning the NP-08 *"PENDING, governance-layer-advanced"* determination — previously existed **only** in IPD on a branch 50 commits ahead of `main`, with **no IRR durable copy**. It is now durably published on IRR `main`.

**All ten artifacts are byte-identical to source.** Every Git blob ID and every SHA-256 in §B.1 reproduces exactly.

---

## E. BRANCH-AUTHORITY CONTRADICTION — HISTORICAL RECONCILIATION

### E.1 The contradiction, recorded without rewriting history

The corpus **contradicts itself** on which ref is authoritative:

| Act | Date | "Authoritative branch" as self-stated |
|---|---|---|
| `GATE-Y-INTELLIGENCE-DATA-SUPPLY-DESIGNATION-AND-GATE-SELECTION-ACT.md` (founding act) | 2026-09-27T15:27:27Z | `refs/heads/main` @ `4d3e1cdc…` **(UNCHANGED)** — with `arena/01a0ddae…` separately labelled **"Workstream branch"** |
| `D07-M3-PROSPECTIVE-ESTIMATES-PROVENANCE-ACCEPTANCE-ACT.md` | 2026-09-27T18:25:00Z | `refs/heads/arena/01a0ddae-iips-production-market-data` @ `62330df0…` |
| `D06-M3-PROSPECTIVE-NSE-CORPORATE-DISCLOSURE-PROVENANCE-ACCEPTANCE-ACT.md` | 2026-09-27T19:15:05Z | `refs/heads/arena/01a0ddae-iips-production-market-data` @ `0ac3f3c6…` |

The founding act reserves *"Authoritative branch"* for **IPD `main`** and calls `arena/01a0ddae` the **workstream** branch. The later acts **re-label the workstream branch as "Authoritative branch."** No act within the corpus acknowledges or reconciles this shift.

### E.2 Resulting interpretation — designated by this act

> 1. **`arena/01a0ddae-iips-production-market-data`** is designated the authoritative **GATE-Y source / workstream corpus ref**. It is the complete originating governance corpus. It is **not** the durable IIPS review baseline.
>
> 2. **IRR `main`** is designated the authoritative **durable published IIPS review baseline** for the GATE-Y corpus, effective from the publication commit of this act.
>
> 3. **The historical contradictory wording is retained as historical record and is NOT silently erased.** No GATE-Y source artifact is edited, corrected, or reworded by this act. The founding act's designation of IPD `main` as *"Authoritative branch"* and its label *"Workstream branch"* for `arena/01a0ddae` remain verbatim in the record. Later acts' contrary self-designation likewise remains verbatim. The contradiction is **reconciled by this supervening designation, not by retroactive edit**.

### E.3 What this act does not do

* It does **not** elevate `arena/01a0ddae` to `main`.
* It does **not** merge the IPD branch into IPD `main`.
* It does **not** alter IPD `main` (still `4d3e1cdc…`).
* It does **not** declare the IPD branch non-authoritative as to **corpus content** — it remains the originating source.
* It does **not** amend any GATE-Y act's text.

---

## F. DISPOSITIONS

### F.1 GATE-Y source artifacts — **UNMODIFIED**

All ten source artifacts are published **byte-identical**. **No GATE-Y act is altered, reworded, reformatted, or improved.** No historical act is edited for clarity.

### F.2 IRR transport staging (`arena/01a0e30f`) — **RETAINED AS HISTORICAL TRANSPORT EVIDENCE**

| Field | Value |
|---|---|
| Repository / ref | IRR `arena/01a0e30f-iips-review-recovered` |
| HEAD | `17c759cdccc6f7e1e3753c5215fcfa5d11ed4328` (2026-09-27T14:38:11Z, `ramkivs`) |
| Contents | 4 files — `GATE-Y-…DESIGNATION…ACT.md` (`aa774609…`), `0001-governance-GATE-Y-record-….patch` (`9c7fac3e…`), `HANDOFF-MANIFEST.txt` (`8cb1a3cf…`), `README-HANDOFF-EXPOSURE.txt` (`faa7294d…`) |

> **The `arena/01a0e30f` location is NOT the authoritative GATE-Y corpus.**
>
> It is **incomplete transport staging** — it holds **1 of 10** governance acts plus three transport helper files (a `git format-patch`, an integrity manifest, and retrieval instructions). It was created solely because *"The Arena sandbox workspace is not downloadable by the maintainer"* so the prepared act could be retrieved on Windows and published to IPD. That handoff has since completed: Ramaki published the act to IPD under commit `95f36cf4324b1c218dcd47538741ef1b5960e181` (2026-09-27T15:27:27Z), producing the identical blob `aa774609…`.
>
> **Disposition: RETAINED unchanged as historical transport evidence. Not deleted.** Any future removal would require a separate, explicit authorization and is not performed here.

### F.3 IPD source corpus — **INTACT**

The IPD `arena/01a0ddae` corpus is **not deleted, rewritten, downgraded, or merged**. IPD `main` remains at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`. **Zero IPD mutation.**

### F.4 Other records — **UNTOUCHED**

Not modified: `NP-12` (`ae404dea…`), `NP-10` (`25f6766e…`), `NP-11` (`44090cad…`), `NP-07` (`1b2df7a7…`), `NP-13-D0-01` (`8caa2d3e…`), `NP-13-PA-D2-C` / B-i (`e4205a85…`), `NP-15` (`18572c53…`).

---

## G. AUTHORITY SEPARATION

> # This act establishes **durable corpus placement only**.
>
> It does **not** constitute **NP-08 qualification, certification, acceptance, implementation authorization, or production authorization.**

### G.1 Authority NOT granted, exercised, or inferable

| Not granted | |
|---|---|
| NP-08 implementation authority | ❌ NOT GRANTED |
| Qualification | ❌ NOT GRANTED |
| Certification | ❌ NOT GRANTED |
| Acceptance | ❌ NOT GRANTED |
| Production authority | ❌ NOT GRANTED |
| M-4 resolution (D115 / `runtimeCompanyId`) | ❌ NOT RESOLVED — remains `NOT ESTABLISHED / UNRESOLVED` |
| M-5 resolution (D91/D88 relief) | ❌ NOT RESOLVED — remains `CONDITIONAL`, relief not requested/granted |
| NP-13 activity | ❌ NONE |
| P-6 product / navigation work | ❌ NOT AUTHORIZED, NOT PERFORMED |

### G.2 What this act changes and does not change

**Changes:** the *location* at which the GATE-Y corpus is durably published, and the designation of that location.

**Does not change:** the *content, meaning, or authority effect* of any GATE-Y act; the M-series state; the NP-08 determination (**PENDING**, governance layer); or any acceptance/qualification/certification state anywhere in the program.

Publication of a governance corpus is **not** an advancement of the workstream it governs. The NP-08 determination remains **D — PENDING**.

### G.3 No inference

No broader authority may be inferred from this record's subject matter, length, structure, placement, or publication route. This act is bounded to placement designation and the publication strictly required to effect it.

---

## H. EXECUTION SUMMARY

| Step | Result |
|---|---|
| Pre-mutation source reverification | ✅ IPD `8c87317a…` unchanged; 10 files / 466,579 B confirmed remotely |
| Pre-mutation destination reverification | ✅ IRR `main` `f02ae1de…`, tree `5c9c3137…`, worktree clean, P-5 descendant |
| No superseding authority act found | ✅ B-i (`e4205a85…`) current; no later act contradicts |
| Corpus import | ✅ 10/10 files, byte-identical, all blob IDs reproduce |
| Path coherence | ✅ `evidence/intelligence-data-supply-governance/` preserved |
| Scope discipline | ✅ Only the 10 corpus files + this record |
| IPD mutation | ✅ **ZERO** |
| Staging mutation | ✅ **ZERO** (retained) |

---

*End of designation record. Placement designated under Ramki / Program Authority. Durable publication executed and independently remote-verified. NP-08 remains PENDING.*
