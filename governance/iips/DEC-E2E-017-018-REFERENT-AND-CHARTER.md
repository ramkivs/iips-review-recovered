# DEC-E2E-017-018-REFERENT-AND-CHARTER

- **Record ID:** `DEC-E2E-017-018-REFERENT-AND-CHARTER`
- **Title:** E2E-017 (Engine Master Matrix) and E2E-018 (Screenshot-to-Certified-Product Parity Matrix) -- D1 Referent-and-Charter Decision: Option C, Chartered as New IES / Program v3.0 Artifacts
- **Class:** `DECISION / AUTHORITY - REFERENT AND CHARTER ONLY`
- **Status:** `RECORDED - D1 OPTION C SELECTED. E2E-017 AND E2E-018 CHARTERED AS NEW IES / PROGRAM v3.0 ARTIFACTS. REFERENT AND CHARTER ONLY. NEITHER MATRIX CREATED. NO CREATION, AMENDMENT, SCREENSHOT-CAPTURE, UI-EXECUTION, CERTIFICATION, STATUS OR IVM AUTHORITY GRANTED. NO A2 -> A1. NO PROMOTION. NO RELEASE/TAG. D7-TIER3-PARITY AND D7-TIER3-INDEPENDENCE REMAIN OPEN.`
- **Date/time:** 2026-09-03 (Asia/Calcutta, +05:30); exact recording time is the commit timestamp of this record
- **Authority relationship:** gate `E2E-017 / E2E-018 - D1 REFERENT-AND-CHARTER AUTHORITY RECORDING GATE`. The maintainer was presented, at the close of the completed read-only E2E-017 / E2E-018 discovery and reconciliation, with three D1-class outcomes for the referent question: (A) identify an authoritative external E2E store and reconcile against it; (B) record permanently that E2E-017 and E2E-018 have no referent in this programme; (C) charter both as new IES / Program v3.0 artifacts. The maintainer explicitly selected **C**. This record transcribes that selection and defines the charter. It is the D1-class decision anticipated by `DEC-E2E-013-BASELINE` section 4.1 item 2 ("D1 may be revisited by a further authority decision") and it resolves, prospectively only, the `INHERITED-WITH-NO-REFERENT` classification of `E2E-017`, `E2E-018` and `Engine Master Matrix` recorded by `DEC-D2-DANGLING-VOCABULARY`.
- **Scope:** (1) the referent decision; (2) the charter of the two new artifacts (identity, canonical path, ownership, coverage, content model, provenance classes, evidence pointers, non-promotion semantics); (3) preservation of the current evidence truth, the current E2E-017 / E2E-018 status and the supplied E2E inventory baseline; (4) the authority boundary. It creates neither matrix, captures no screenshot, executes no UI or browser, runs no test, amends no matrix, changes no status and authorizes no implementation.
- **Provenance:** newly recorded at this gate from (a) the completed read-only discovery and reconciliation performed against `phase13-next` `f8aa038e78373113858459c8136ba888cae6520c` and `arena/01a03e3b-iips-review-recovered` `037c9ba19522bb1f1c8c0cab2709fc9c6cd0e240`, and (b) the maintainer's explicit selection of option C and the E2E inventory baseline supplied by the maintainer at this gate. No historical provenance is claimed for either matrix. No issuer, issuance date, certification status or owner name is invented: this record names no issuer and issues nothing.
- **Supersession / revision relationship:** supersedes none; amends none. Extends `DEC-E2E-013-BASELINE` (D1(c)) by deciding the E2E-017 / E2E-018 referent question that record left open. Does not amend the text of `DEC-D2-DANGLING-VOCABULARY`, `AUTH-G-AI-IMPL`, `DEC-G-AI-IMPL-B1` or `DEC-G-AI-IMPL-CERTIFICATION`; the `AUTH-G-AI-IMPL` section 4 prohibition on changing "E2E-017 or the Engine Master Matrix" acquires a referent from this record onward and is honoured by it (nothing is changed). `DEC-D3-MATRIX-REBASELINE`, `DEC-D4-AI-ADVISORY-INTEGRATION`, `DEC-D5-EVIDENCE-MATURITY`, `DEC-D5-S1-REGRESSION-EVIDENCE`, `DEC-D5-S1-WORKLIST-DISCREPANCY`, `DEC-D5-S3-EVIDENCE-DEBT`, `DEC-D6-DURABLE-RECORDING-POLICY`, `DEC-D7-EVIDENCE-DEBT-DISPOSITION`, `DEC-D13-HIJ-EXECUTION-AUTHORITY`, `DEC-D25-TIER3-EVIDENTIARY-STANDARD`, `DEC-D36-TIER3-DOCUMENTATION-PARITY-AUTHORITY`, `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY`, `DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY`, `DEC-A2-A1-TIER3-EXECUTION-EVIDENCE-AND-IV-REFRESH` and `DEC-A2-A1-TIER3-FINAL-READINESS-ISSUANCE-AND-CONTENT-AUTHORITY` are unchanged and every exclusion they state remains in force.

---

## 1. AUTHORITATIVE BASELINE AT THIS GATE

| Item | Value |
|---|---|
| Product branch / tip | `phase13-next` @ `f8aa038e78373113858459c8136ba888cae6520c` (live `origin/phase13-next`, verified by `ls-remote`) |
| Product tip parent | `245be839e71975f79b675c861bdf3b3ea423722c` |
| Product tip subject | `A2-A1: add Tier-3 final-readiness certificates` (adds exactly three files; no other path) |
| Governance branch / tip before this record | `arena/01a03e3b-iips-review-recovered` @ `037c9ba19522bb1f1c8c0cab2709fc9c6cd0e240` (live, verified by `ls-remote`) |
| Product checkout | read-only for this gate; not modified |

### 1.1 Discovery findings this decision follows (read-only, completed before this gate)

| Finding | Evidence |
|---|---|
| No Engine Master Matrix artifact exists in either repository | full-tree `git ls-tree -r` and `git grep` at `f8aa038` (1,086 files) and `037c9ba1` (971 files); every occurrence of `Engine Master Matrix` is a prohibition clause or an absence finding |
| No Screenshot-to-Certified-Product Parity Matrix artifact exists in either repository | as above; every occurrence is a prohibition clause or an absence finding |
| `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` is a real, existing, separately authorized artifact and is explicitly distinct | blob `cada0451400409b0fe9ff0d62309b756c7b45e43`, SHA-256 `fa5758885cc9b214b9fb4957790e4274a24b4fbf30b56f6d5ac81813081aee66`, last modified `357b34d` (2026-08-28); `DEC-D2-DANGLING-VOCABULARY` section 5 item 6 and `DEC-D3-MATRIX-REBASELINE` forbid conflation |
| Screenshot evidence is ABSENT / UNVERIFIABLE | zero image files (`png`, `jpg`, `jpeg`, `gif`, `webp`) in the product tree at `f8aa038`; zero screenshot or visual-regression tooling references outside a lockfile; the only `screenshot` hits are the E2E-013 / E2E-018 reconciliation records; `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` section 3.2 records criterion J (live browser rendering) as NOT PERFORMED |
| Product-side reconciliation records exist and record ABSENT / NOT LOCATED | `governance/iips/E2E-013-CAPABILITY-GAP-RECONCILIATION.md` (`68633e7`, blob `e33ab60a`), `governance/iips/E2E-017-ENGINE-MASTER-MATRIX-RECONCILIATION.md` (`4f93ac0`, blob `926d9ef3`, SHA-256 `6c5e391d46977cab7a31fe4e7c007fe042b0a4149ef66b03287c1a61569f5c84`), `governance/iips/E2E-018-SCREENSHOT-CERTIFIED-PRODUCT-PARITY-RECONCILIATION.md` (`100a902`, blob `00f68753`, SHA-256 `96aa8e9ab6bcc0701031df79b687623a7db7221f9e6585dac5714e4ef34e31df`); all three are reconciliation records, not matrices, and all three predate `ff1c90e`, `245be839` and `f8aa038` |
| Governance records concerning either matrix | `DEC-E2E-013-BASELINE` (absence; D1(c) re-charter; external store neither affirmed nor denied), `DEC-D2-DANGLING-VOCABULARY` (`INHERITED-WITH-NO-REFERENT`), `DEC-D8-OPEN-ITEMS-DISPOSITION` (referent NONE), `DEC-D36-TIER3-DOCUMENTATION-PARITY-AUTHORITY` (excluded), `DEC-D5-S1-WORKLIST-DISCREPANCY` (excluded), `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY` (excluded), `DEC-A2-A1-TIER3-EXECUTION-EVIDENCE-AND-IV-REFRESH` (excluded), `DEC-A2-A1-TIER3-FINAL-READINESS-ISSUANCE-AND-CONTENT-AUTHORITY` (excluded); none defines, creates or authorizes either matrix |
| E2E-019 through E2E-024 | zero occurrences in either repository except `E2E-019` inside "does not close E2E-019" exclusion clauses |

### 1.2 Governance-chain note (disclosed, not a blocker)

The `A2 -> A1 TIER-3 FINAL-READINESS CERTIFICATE CREATION GATE` named as next gate by `DEC-A2-A1-TIER3-FINAL-READINESS-ISSUANCE-AND-CONTENT-AUTHORITY` section 10 is evidenced as performed by product commit `f8aa038` (three certificates, byte-identical to the authorized payloads: SHA-256 `18637cb3fbd873143837b02d783c48a68f5f6ce44ae35e0c65e655142326ca15`, `6b8a4caee2ef89b2c8e0f4c8e6ca639140943d31bbb6f9ae6622406ee87e7ed9`, `37e6fd09d6b80d70313e4182e6cc874ea05a902dbacbf5c38215cfcf55e501c5`). No governance closure record for that gate exists at `037c9ba1`. This record does not supply one; it only notes the gap.

## 2. THE D1 QUESTION AND THE SELECTED OUTCOME

**Question.** `E2E-017` and `E2E-018` were carried into this programme as vocabulary without a referent (`DEC-D2-DANGLING-VOCABULARY`). Do they have a referent, and if so what is it?

**Options presented:** (A) external store; (B) no referent, permanently; (C) charter as new artifacts.

# **SELECTED: C - CHARTERED AS NEW IES / PROGRAM v3.0 ARTIFACTS**

- **E2E-017 - Engine Master Matrix** is chartered as a new IES / Program v3.0 artifact.
- **E2E-018 - Screenshot-to-Certified-Product Parity Matrix** is chartered as a new IES / Program v3.0 artifact.

This is a charter. It establishes what each artifact is, where it will live, what it must contain and what it must never claim. It does not bring either artifact into existence, and it does not grant the authority to do so (section 10).

The possibility recorded by `DEC-E2E-013-BASELINE` section 4.1 item 2 that an external E2E store exists is neither affirmed nor denied by this record. If such a store is later identified, its E2E-017 / E2E-018 content may be reconciled against the artifacts chartered here by a further decision; nothing here forecloses that.

## 3. DISTINCTION FROM THE INTEGRATION VERIFICATION MATRIX

`docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` (the "IVM", blob `cada0451400409b0fe9ff0d62309b756c7b45e43`, seven A1 / seven A2) is a separate, existing, separately authorized artifact (`DEC-D3-MATRIX-REBASELINE`, `DEC-D4-AI-ADVISORY-INTEGRATION`).

- The IVM is **not** the Engine Master Matrix and is **not** the Screenshot-to-Certified-Product Parity Matrix.
- The IVM must **not** be renamed, moved, copied-and-relabelled, repurposed, conflated with, or silently amended to stand in for either chartered artifact.
- The chartered artifacts must **not** restate or alter the IVM's Class A-F classification, its A1 / A2 evidence-maturity split, or its D5-S1 standing. Where a chartered artifact needs those values it cites the IVM by path and blob.
- Any future IVM amendment remains governed by its own authority and is not granted or implied here.
- The IVM's stale evidence pointers for IES-016 / IES-017 / IES-020 (it predates the refreshed manifests, refreshed IV reports and the three final-readiness certificates) are recorded as **stale, not false**; correcting them is an IVM amendment and is outside this record.

## 4. CANONICAL PATHS (verified absent at `f8aa038`; creation NOT authorized here)

| Artifact | Canonical path (future) | Verified at `f8aa038` |
|---|---|---|
| E2E-017 Engine Master Matrix | `docs/v3.0/E2E-017_ENGINE_MASTER_MATRIX.md` | ABSENT (no tracked path matches `ENGINE_MASTER`; no tracked path under `docs/v3.0/` begins with `E2E-`) |
| E2E-018 Screenshot-to-Certified-Product Parity Matrix | `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md` | ABSENT (no tracked path matches `PARITY_MATRIX`) |
| E2E-018 screenshot evidence store (future; see section 6.5) | `docs/v3.0/e2e-018-screenshots/` | ABSENT (no such directory; zero image files anywhere in the tree) |

Both canonical files sit beside, and are distinct from, `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`. Neither path collides with any tracked path at `f8aa038`. No other existing artifact is reused, renamed or relabelled as either matrix. The product-side reconciliation records under `governance/iips/E2E-01x-*.md` remain reconciliation records and are not the chartered artifacts.

## 5. CHARTER - E2E-017 ENGINE MASTER MATRIX

### 5.1 Identity

- **Canonical identity:** `E2E-017`
- **Canonical title:** `E2E-017 - Engine Master Matrix`
- **Canonical path:** `docs/v3.0/E2E-017_ENGINE_MASTER_MATRIX.md`
- **Programme:** IES / Program v3.0 + CSIP, the program-level reconciliation basis established by `DEC-E2E-013-BASELINE` D1(c).
- **Ownership:** the maintainer authority of the governance chain on `arena/01a03e3b-iips-review-recovered` (the same authority that records this decision). No other owner is named and none is invented. Per-engine standard owners are unchanged.
- **Nature:** an evidence-index and status-representation artifact. It is not a certificate, not a certification instrument, not a release register and not a promotion mechanism.

### 5.2 Coverage

One row per engine capability, exactly the fourteen capabilities recognised by the IVM: IES-006.2A Banking, IES-007 Insurance, IES-008 Capital Markets, IES-009 Healthcare, IES-010 Hospitality, IES-011 Energy, IES-012 Utilities, IES-013 Consumer, IES-014 Industrials, IES-015 Technology, IES-016 Telecommunications, IES-017 Automobile, IES-020 Materials & Metals, and CSIP (cross-sector). Non-engine certified surfaces (for example AI Advisory, IVM section 3.2) are not engine rows; if represented at all they appear in a separate, clearly labelled section, never as a fifteenth engine row.

### 5.3 Required content per row

1. Engine ID (`sector.*` or CSIP), sector, IES identifier.
2. **Evidence maturity as cited from the IVM** (A1 or A2), by IVM path and blob, never restated independently and never altered.
3. **Pinned evidence pointers**, each as `path @ commit` with the file SHA-256 where a full hash is available in a durable record, covering as applicable: freeze manifest; independent-verification report; final-readiness certificate; implementation-readiness certificate; the four regression kinds (acceptance, framework-integration, reuse-verification, wp4-validation) with subtest counts; the execution-evidence record; D36 documentation set (architecture review, authority review, the nineteen-document set) with its D36 commit; D7 disclosures.
4. **Provenance class per pointer**, exactly one of: `RECOVERED-HISTORICAL`, `CURRENT-REPOSITORY`, `D36-NEW-EVIDENCE`, `ABSENT-UNVERIFIABLE` (the classes established by `DEC-D36-TIER3-DOCUMENTATION-PARITY-AUTHORITY` and used by the E2E-013 / E2E-017 / E2E-018 reconciliation records).
5. **Standing per requirement**, exactly one of: `CLOSED`, `OPEN`, `UNVERIFIABLE`, `EVIDENCE-ONLY`, `ABSENT` (the taxonomy of the reconciliation records). Absence of an artifact carries no negative inference.
6. **Open items** carried verbatim from the governing records, including for IES-016 / IES-017 / IES-020: `D7-TIER3-PARITY` OPEN, `D7-TIER3-INDEPENDENCE` OPEN, the `M1-M15 ACCEPTED` template defect (`DEC-D25-TIER3-EVIDENTIARY-STANDARD` section 9), the IES-020 aluminium-placement item, and the historical-only standing of the 2026-08-30 execution at `357b34da`.

### 5.4 Mandatory Tier-3 pointers at first creation (values at `f8aa038`)

| Pointer | IES-016 | IES-017 | IES-020 |
|---|---|---|---|
| Freeze manifest SHA-256 (`ies-0xx-*/IES-0xx_FREEZE_MANIFEST.json` @ `245be839`) | `3d2b53835efdb8df21d4cb1dc67e4e535833954c8921653a0c5de16f4086e69f` | `2ad4fcd9ed0a76b5ce186a4fe269bc7eef46a78656e65fd2e64ba66039038afe` | `648f26633ad87f9cd1f79185aba517bee8187c390e273663a0674603c84d6f60` |
| IV report SHA-256 (`iips-platform/IES0xx_INDEPENDENT_VERIFICATION_REPORT.md` @ `245be839`) | `ee449dbb6cc19885ac84763134252a6d94dd6a38ad2b3e1b1cb1048fa02e5695` | `4aeb29755a270ade01d95a65971687ddc90336d1f4657ada63e37d03db22427c` | `1bc164aae627bc8b9331d82b8df0841e9b544b4ac1109b4396a5f87c2aa33462` |
| Final-readiness certificate SHA-256 (`iips-platform/IES0xx_FINAL_READINESS_CERTIFICATE.md` @ `f8aa038`) | `18637cb3fbd873143837b02d783c48a68f5f6ce44ae35e0c65e655142326ca15` | `6b8a4caee2ef89b2c8e0f4c8e6ca639140943d31bbb6f9ae6622406ee87e7ed9` | `37e6fd09d6b80d70313e4182e6cc874ea05a902dbacbf5c38215cfcf55e501c5` |
| Implementation-readiness certificate SHA-256 (@ `245be839`) | `1c2a85630c7991d241346eab10ea0e0c5068e8a8d6689db868927f71768e6b01` | `8b6e685d9a79319cf36e739d75f556765984841be9b14038fd7f7f3b1d65cd6d` | `63222a258964079d844efa8c8c0aca20a4e4b0371a079a2cba4d0dd4b439bd37` |
| Regression evidence | 29/29 (13 + 7 + 4 + 5) | 29/29 (13 + 7 + 4 + 5) | 29/29 (13 + 7 + 4 + 5) |
| Execution evidence record | `governance/iips/DEC-A2-A1-TIER3-EXECUTION-EVIDENCE-AND-IV-REFRESH.md` @ `9da79251`, SHA-256 `639b87cba1256a007015deb94c540bc8e4bb5dd527a83f9bf99a668a2460157e` (87/87 at `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36`, role-separated) | same | same |
| Certificate content authority | `governance/iips/DEC-A2-A1-TIER3-FINAL-READINESS-ISSUANCE-AND-CONTENT-AUTHORITY.md` @ `037c9ba1`, SHA-256 `e7839aeaaa5a1c31a2d5f6e8e16469e970ce086c732999002c15357ec8f032d2` | same | same |
| D36 documentation set | `ies-016-telecommunications/docs/IES-016_01..19_*.md`, `IES-016_ARCHITECTURE_REVIEW.md`, `D16_AUTHORITY_REVIEW.md` @ `0a8e287` (`D36-NEW-EVIDENCE`) | `ies-017-automobile/...`, `D17_AUTHORITY_REVIEW.md` @ `0a8e287` | `ies-020-materials-metals/...`, `D20_AUTHORITY_REVIEW.md` @ `0a8e287` |
| D7 disclosures | `D7-TIER3-PARITY` OPEN; `D7-TIER3-INDEPENDENCE` OPEN | same | same |
| Evidence maturity (cited from IVM `cada0451`) | A2 | A2 | A2 |

Rows for IES-006.2A through IES-015 and CSIP take their pointers from the artifacts the IVM already cites (per-engine `reports*/`, `ies-0xx-*/`, `IES0xx_*` files, `iips-cross-sector/`), each pinned at creation time to the product commit then current. Tier-2 evidence (36/36 at `100a9023`, `DEC-A2-A1-TEST-EXECUTION-AUTHORITY`) concerns IES-006.2A / 007 / 008 / 009 only.

### 5.5 Non-promotion and non-release semantics (mandatory text in the artifact)

The Engine Master Matrix records evidence standing only. It does not certify, promote, release or tag any capability; it does not flip any A2 to A1; it does not amend the IVM; it does not close any D7 item; and it carries no authority beyond its own content. Prohibited content: `PRODUCTION READY`, `READY TO RELEASE`, `A1 ACHIEVED`, `release-ready`, `Release candidate`, `Release tag prepared`, any unqualified claim of organizational or third-party independence, any clean-clone claim not evidenced by a durable record, any current-evidence presentation of `606/606`, `10 verified / 0 bad` or `tsc` PASS, and any E2E status conversion.

### 5.6 Creation and amendment are future, separately authorized mutations

Creating `docs/v3.0/E2E-017_ENGINE_MASTER_MATRIX.md` is a product-branch mutation. It is **NOT granted by this record**. It requires a subsequent, separate creation authority naming the exact path, the product commit, the exact content, the pre/post invariants and a fail-closed recorder, followed by separate commit authorization. Every later amendment likewise requires its own authority.

### 5.7 Current status (preserved)

**E2E-017 = NOT STARTED** as an implemented matrix. The existence of this charter, of the reconciliation record at `4f93ac0`, and of all Tier-3 evidence does not advance that status.

## 6. CHARTER - E2E-018 SCREENSHOT-TO-CERTIFIED-PRODUCT PARITY MATRIX

### 6.1 Identity

- **Canonical identity:** `E2E-018`
- **Canonical title:** `E2E-018 - Screenshot-to-Certified-Product Parity Matrix`
- **Canonical path:** `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md`
- **Programme and ownership:** as section 5.1.
- **Nature:** a parity-evidence matrix mapping each certified product surface to captured UI evidence and recording whether the two agree. It is not a certificate and grants nothing.

### 6.2 Mapping model

One row per (certified surface, engine or non-engine capability) pair, drawn from: the IVM section 3 `UI surface` column for the fourteen engine rows (Admin registry, Executive, Company Intelligence, Cross-Sector Intelligence, Decision Matrix, Screener, auto-extended universe for IES-016 / 017 / 020), and the IVM section 3.2 non-engine certified surface (AI Advisory, embedded). Each row must map:

1. **Certified-product evidence (repository side):** the certification artifact(s) establishing the surface, pinned `path @ commit` with SHA-256 where available (IVM row; `DEC-G-AI-IMPL-CERTIFICATION` for AI Advisory; per-engine certification evidence as indexed by E2E-017 once it exists).
2. **Screenshot / UI evidence (live side):** the capture record(s) per section 6.5, or the explicit value `ABSENT`.
3. **Parity determination**, exactly one of: `PARITY-ESTABLISHED` (captured UI evidence agrees with the certified surface on the recorded observables), `PARITY-GAP` (captured evidence disagrees; the gap is described, never silently fixed), `UNVERIFIABLE` (capture exists but is insufficient to determine), `ABSENT` (no capture exists). No row may be `PARITY-ESTABLISHED` without a capture record.
4. **Provenance class** per side, from the four classes of section 5.3 item 4.

### 6.3 Repository evidence versus live UI evidence (mandatory distinction)

- **Repository evidence** is a file at a commit: deterministic, hashable, re-derivable by anyone with the repository.
- **Live UI evidence** is an observation of a running build in a specific environment at a specific time: it depends on the build commit, the browser and viewport, the authentication mode, the data baseline and the network state, and it is not re-derivable from the repository alone.
- The matrix must never present live UI evidence as repository evidence or vice versa, and must never infer parity from the existence of certificates, freeze manifests, readiness certificates or D36 documentation. Certificates establish the certified surface; they do not establish what the UI rendered.

### 6.4 Screenshot evidence requirements (for any future capture)

Each capture record must state: the product commit of the running build; the surface and route; the engine / capability under view; the environment (browser and version, viewport, operating system); the authentication mode actually used, with reference to IVM section 3.2 criteria H (authenticated live HTTP 200), I (real Keycloak authentication) and J (live browser rendering), each of which is currently recorded NOT PERFORMED (Option D) and must not be recorded as performed by a capture that did not perform it; the data baseline (for example `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json`); the capture UTC timestamp; the operator identity as supplied (never invented); the image file path and SHA-256; and the observables compared. Images are stored under `docs/v3.0/e2e-018-screenshots/` with deterministic names, one image per surface per capture, and are referenced from the matrix by path and SHA-256. Absent any of these, the capture is `UNVERIFIABLE`.

### 6.5 Screenshot capture and UI execution require separate authority

No screenshot exists today. Capturing one requires starting the product, rendering it in a browser and, for authenticated surfaces, the H / I / J infrastructure that is recorded as unavailable. **None of that is authorized by this record.** Screenshot capture, live browser / UI execution, and creation of the `docs/v3.0/e2e-018-screenshots/` store each require an explicit, separate execution authority naming environment, operator, scope and invariants.

### 6.6 Non-promotion and non-release semantics (mandatory text in the artifact)

As section 5.5, applied to the parity matrix. In addition: a `PARITY-ESTABLISHED` row is a parity finding only; it certifies nothing, changes no IVM class or evidence maturity, and clears no H / I / J limitation.

### 6.7 Creation and amendment are future, separately authorized mutations

Creating `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md` is a product-branch mutation and is **NOT granted by this record**. It requires a subsequent, separate creation authority (as section 5.6). Note that a first creation may lawfully record every row as `ABSENT` if authorized before any capture exists; such a matrix would be an honest absence register, not evidence of parity.

### 6.8 Current status (preserved)

**E2E-018 = NOT STARTED / UNVERIFIABLE** as an implemented parity matrix: no matrix exists and no screenshot evidence exists against which parity could be determined. This charter does not advance that status.

## 7. CURRENT EVIDENCE TRUTH (preserved verbatim; nothing here is changed by this record)

| Fact | Standing at `f8aa038` / `037c9ba1` |
|---|---|
| IES-016 / IES-017 / IES-020 current Tier-3 evidence | PRESENT at `f8aa038`: refreshed freeze manifests (`ff1c90e`), refreshed IV reports (`245be839`), three final-readiness certificates (`f8aa038`) |
| Three Tier-3 final-readiness certificates | EXIST at `f8aa038`; Status `FINAL-READINESS EVIDENCE COMPLETE UNDER ROLE-SEPARATED VERIFICATION -- NOT AN A1 PROMOTION`; each states IES-0xx remains A2 |
| Tier-3 execution evidence | 87/87 (29 + 29 + 29), 0 failed / 0 cancelled / 0 skipped / 0 todo, exit 0, against `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36`, role-separated (`9da79251`) |
| D36 documentation set | EXISTS at `0a8e287` for all three engines (`D36-NEW-EVIDENCE`; new documentation, not recovered review evidence; architecture review is a header-only stub) |
| `D7-TIER3-PARITY` | **OPEN** |
| `D7-TIER3-INDEPENDENCE` | **OPEN** |
| Screenshot evidence | **NONE EXISTS** (ABSENT / UNVERIFIABLE) |
| E2E-017 matrix | **DOES NOT EXIST** |
| E2E-018 matrix | **DOES NOT EXIST** |
| Integration Verification Matrix | `cada0451`, seven A1 / seven A2, unchanged |
| Evidence maturity of IES-016 / IES-017 / IES-020 | **A2**, unchanged |

## 8. E2E INVENTORY BASELINE (recorded as supplied by the maintainer; preserved without downgrade)

| Item | Status | Mapping |
|---|---|---|
| E2E-019 | COMPLETED / CERTIFIED | Materials / IES-020 |
| E2E-020 | RESOLVED / TAXONOMY | IT -> IES-015 Technology |
| E2E-021 | RESOLVED / TAXONOMY | Chemicals -> IES-014 Industrials |
| E2E-022 | RESOLVED / TAXONOMY | Realty -> IES-015 Technology |
| E2E-023 | COMPLETED / CERTIFIED | Telecom / IES-016 |
| E2E-024 | COMPLETED / CERTIFIED | Auto / IES-017 |

Disclosure: these identifiers have no occurrence in either repository other than `E2E-019` inside exclusion clauses. The baseline is held on the maintainer's authority as the accepted inventory, consistent with `DEC-E2E-013-BASELINE` section 4.1 item 2. No repository artifact contradicts it. This record does not downgrade, reopen, close, re-certify or re-map any item; the absence of an E2E-017 or E2E-018 matrix is not a ground for downgrading E2E-019, E2E-023 or E2E-024. The chartered matrices, when created, must carry this baseline as supplied and classify its provenance honestly.

## 9. EXCLUSIONS PRESERVED (all remain in force)

This record performs, authorizes or implies none of the following:

- A2 -> A1 status flip for any capability;
- certification change of any kind;
- promotion;
- release;
- release tag or any Git tag;
- Integration Verification Matrix amendment (including its evidence-pointer staleness);
- E2E-019 reopening, closure or re-certification; any change to E2E-020 through E2E-024;
- closure of `D7-TIER3-PARITY` or `D7-TIER3-INDEPENDENCE`;
- screenshot capture;
- UI / browser execution; H / I / J execution;
- implementation or engine change;
- calibration change (the four protected calibration files remain outside every scope);
- test, `tsc` or `npm` execution;
- freeze-manifest, IV-report, readiness-certificate or final-readiness-certificate change;
- D36 / D36-A, D5 / D5-S1 / D5-S3 reopening; fence-9;
- creation of either chartered matrix or of the screenshot store;
- any product-branch mutation whatsoever.

## 10. AUTHORITY BOUNDARY

This decision establishes the **REFERENT** and the **CHARTER** only. It does **NOT** grant, and must not be cited as granting:

| Authority | Granted by this record |
|---|---|
| E2E-017 matrix creation | **NO** - separate creation authority required |
| E2E-017 matrix amendment | **NO** - separate amendment authority required |
| E2E-018 matrix creation | **NO** - separate creation authority required |
| E2E-018 matrix amendment | **NO** - separate amendment authority required |
| Screenshot capture | **NO** - separate execution authority required |
| Live browser / UI execution | **NO** - separate execution authority required |
| Certification or status change | **NO** |
| Integration Verification Matrix amendment | **NO** |
| Commit or push of this record | **NO** - separate commit authorization required |

Nothing in sections 5 and 6 is self-executing. Every "must" in the charter binds the content of a future artifact created under a future authority; it commands no action now.

## 11. RECORDING-GATE INVARIANTS (this record)

- Exactly one file created: `governance/iips/DEC-E2E-017-018-REFERENT-AND-CHARTER.md` on `arena/01a03e3b-iips-review-recovered` at `037c9ba19522bb1f1c8c0cab2709fc9c6cd0e240`.
- No other governance file changed; no product file changed; the product checkout not accessed for writing.
- Nothing staged, committed or pushed; HEAD unchanged; no reset, restore or checkout.
- ASCII only; UTF-8 without BOM; LF; exactly one final LF; no trailing whitespace; exactly one `Record ID` line.

## 12. NEXT GATES (each separate; none performed here)

1. **E2E-017 ENGINE MASTER MATRIX CREATION AUTHORITY RECORDING GATE** (governance-only): defines the exact content of `docs/v3.0/E2E-017_ENGINE_MASTER_MATRIX.md` at a named product commit, the pins, the invariants and the recorder; followed by a separate product-side creation mutation gate and separate commit authorization.
2. **E2E-018 PARITY MATRIX CREATION AUTHORITY RECORDING GATE** (governance-only): as above for `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md`; may authorize an all-`ABSENT` first creation. Any capture requires its own **SCREENSHOT CAPTURE EXECUTION AUTHORITY** gate (environment, operator, H / I / J standing), which this record neither schedules nor grants.
3. Optionally first: a closure / evidence record for the Tier-3 final-readiness certificate creation gate performed at `f8aa038` (section 1.2).

# **DEC-E2E-017-018-REFERENT-AND-CHARTER RECORDED - OPTION C - BOTH ARTIFACTS CHARTERED AS NEW - NEITHER CREATED - NO CREATION, CAPTURE, UI, STATUS OR IVM AUTHORITY GRANTED - E2E-017 NOT STARTED - E2E-018 NOT STARTED / UNVERIFIABLE - NO A2 -> A1 - D7 ITEMS OPEN - STOP FOR COMMIT AUTHORIZATION**
