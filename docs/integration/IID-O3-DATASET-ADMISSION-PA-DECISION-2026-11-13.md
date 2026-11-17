# IID O3 — Dataset Admission: Program Authority Decision Record

**Decision identifier:** `O3` (existing identifier, preserved — **no new decision identifier is
invented by this record**)
**Decision:** **`ADMITTED`** — admitted as candidate inputs for local personal use
**Decision owner:** Ramki (sole decision owner — architectural, governance, authorization, acceptance
and implementation authority for this application)
**Application:** IIPS v3.0
**Operating model:** Local / Single User / Personal Use
**Production:** Explicitly **OUT OF SCOPE**
**Decision date:** 2026-11-13
**Repository:** `ramkivs/iips-review-recovered`
**Branch:** `arena/94a53bb3-iips-review-recovered`
**Baseline at decision:** `d1118df296b9f17e211a85ee91f8bb24c89ff947` (verified `ls-remote` == local)
**`origin/main` at decision:** `08411bcd6d782a601fe5c82cc9983d076831148d` — the branch is **diverged**:
ahead 8 / behind 2, merge base `a835d4af019ab4f677ab238ec42d44326f06a771` (see §9.1)
**IPD reference pin (read-only):** `a624d06f66c376f03a29571cb24c3f0f77f0c24d`
**Decision-time repository state observed at:** `2026-11-13T09:19:46Z` (UTC)

**Nature of this record:** governance recording of an operator decision. **Documentation only.**
No ingestion was executed. No dataset was installed, replaced, created or deleted. No source bundle or
manifest was modified. No `sourceRights` metadata was changed. No runtime data directory was touched.
The portfolio SQLite database was not opened, read or written. No IRR source, test, configuration or
dependency was changed. IPD was inspected **read-only**; zero IPD commits, branches, PRs or writes.

---

## 1. Authority and context

Ramki is the sole decision owner for all architectural, governance, authorization, acceptance and
implementation decisions concerning this personal IIPS application. There are no separate
organizational decision owners or production stakeholders.

The application deployment boundary is established and is recorded here as the operator stated it:

- **Single user.**
- **Hosted locally on the user's Windows laptop.**
- **Strictly for personal investment analysis.**
- **No production, SaaS, multi-user, or commercial deployment.**

This is the same operating model recorded by the existing personal-use governance precedent
(`docs/integration/PA-DECISION-PERSONAL-USE-ACCEPTANCE-AND-W1-RECONCILIATION-2026-11-08.md`:
*"Operating model: Local / Single User / Personal Use"*; *"Production: Explicitly **OUT OF SCOPE**"*).
That terminology is **preserved, not restated or reinterpreted** here.

No production authority, production eligibility, hosted operation or multi-user operation follows from
this decision or from any instrument it references.

---

## 2. The decision identifier `O3` — provenance and definition

### 2.1 Where `O3` is defined

`O3` is **not** an identifier invented by this record, and it is **not** freely floating: it is defined
in exactly one document in this repository's history.

| Property | Value |
|---|---|
| Defining document | `docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md` |
| Defining section | §28 — *Product-owner decision register* |
| Branch carrying it | `refs/heads/arena/iid-coverage-readiness-report-2026-11-11` |
| Commit (branch tip) | `31a9b01e574f2911cc2685e3d63dddcfb1194d62` |
| Blob | `e6f756238089c6795c8568b37321f3e55ba60cb2` (871 lines) |
| Verified reachable on the remote | **YES** — `git ls-remote origin refs/heads/arena/iid-coverage-readiness-report-2026-11-11` returns exactly `31a9b01e…` |
| Merged to `origin/main` | **NO** — 0 commits on `origin/main` touch that path |

**Provenance caveat, stated plainly because it is material.** The document that *defines* `O3` is
**unmerged**. It exists on a live remote branch and is fully retrievable, but the identifier `O3` does
not appear on `main`. Two consequences:

1. A reader on `main` alone will not find `O3`'s definition. This record therefore quotes it verbatim
   (§2.2) and pins it by repository + branch + commit + path + blob, following this repository's
   established practice of pinning out-of-tree authority by commit and blob.
2. **Recording this decision does not merge the defining assessment.** Nothing in this work item
   promotes `31a9b01e…` or its document to `main`.

### 2.2 The definition, quoted verbatim

From §28 of the defining document:

> | # | Decision | Why it is genuinely the owner's | Choices | Recommended | If deferred |
> |---|---|---|---|---|---|
> | O3 | **Admit evidence-derived OPERATOR_SUPPLIED datasets as operational inputs?** (Infosys REL-1/WI2/WI3;
> Marico WI7; KEC WI8 — single-issuer, transcribed, annual-only, empty CA table) | Only the owner can accept
> "real but thin" as fit for local personal use; the system will forever label it honestly, but acceptance is
> a judgement | admit all three / admit subset / reject | admit all three for local personal use with the
> caveats attached; re-issue on each restatement | nothing to assess or measure; INVESTMENT page stays NONE;
> cohort work (R-16) cannot start on real data |

And the register's own preamble, which governs how its "Recommended" column may be read:

> "Genuine owner decisions only — each one shapes the product or its data, none is engineering's to make.
> 'Recommended' is this investigation's recommendation, **never a pre-approval**."

`O3` is also named as a hard **prerequisite** of IID Stage 3 in the same document (§21, Stage 3):

> "**Prerequisites:** Stage 1; **O3 decision** (which issuer set; accept OPERATOR_SUPPLIED
> evidence-derived datasets as local operational inputs, with all caveats attached)."

### 2.3 `O3` is absent from the other candidate registers — verified

| Document searched | Word-boundary `O3` hits | Note |
|---|---|---|
| `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` (the authoritative IID roadmap, blob `a988194dc4a2…`, 1,393 lines) | **0** | The IID roadmap defines `IID-0`…`IID-6` and `R-1`…`R-17`. It contains **no** `O`-series decision identifiers at all. |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (22,535 lines, blob `89789b3e6c64…`) | **0** | Its register is the `REG-01`–`REG-13` **IRR/IPD Program Authority** series — a different identifier series covering a different subject. It does not carry IID owner decisions. |
| `governance/` (`ARENA_ONBOARDING.md`, `RELEASE_CHECKLIST.md`, `REPOSITORY_INFRASTRUCTURE.md`, `VERSIONING_POLICY.md`) | **0** | Repository-infrastructure governance, not product data-admission decisions. |
| `docs/integration/CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md` | 4 | All four are **citations of** the unmerged assessment's `O3`, not records of a decision. This file is protected evidence and was **not modified**. |
| `docs/integration/IID-STAGE-3-INVESTMENT-DATASET-READINESS-2026-11-13.md` | 18 | All are the **search for** an `O3` decision and the report that none was found (§10 below). |
| `docs/integration/NP-08-D08-MACRO-V-C5-D91-NOTICE-DECISION-RECORD-2026-10-15.md` | 1 | Unrelated `NP-08`/`D08` macro context. |

**No pre-existing `O3` admission record exists.** Nothing was duplicated and nothing was overwritten.

---

## 3. The decision

### 3.1 Operative text

> ## **O3 — `ADMITTED`**
>
> The operator explicitly confirms that the following evidence-derived bundles were obtained from
> sources the operator is permitted to use for personal, local investment analysis.
>
> **Decision: ADMITTED AS CANDIDATE INPUTS FOR LOCAL PERSONAL USE.**

### 3.2 Scope — exactly three named bundles

The admission covers **the three named issuer bundles and nothing else**:

| Issuer | Sector | Bundle |
|---|---|---|
| Infosys Limited | Technology | `REL-1-INFOSYS-2026-11-06` |
| Marico Limited | Consumer | `WI7-CONSUMER-MARICO-2026-11-07` |
| KEC International Limited | Industrials | `WI8-INDUSTRIALS-KEC-2026-11-07` |

This corresponds to the **"admit all three"** choice in the `O3` definition (§2.2).

**Not admitted by this decision.** The `O3` definition's own parenthetical also names `WI2`/`WI3`
(Infosys variants). This decision admits **only** the three bundles in the table above. `WI2` and `WI3`
are **not** within its scope, notwithstanding that `WI3-BORROWINGS-NIL-2026-11-06` is the input the
WI-13 head re-validation used. Seven further bundles under `evidence/real-issuer/` also carry an
`ingest-input/` directory and are likewise **not** admitted. Admission is per-bundle and explicit;
it is not inherited by association, by issuer, or by directory.

### 3.3 What "admitted as candidate inputs" means

The wording is the operator's and is preserved exactly. **"Candidate inputs"** is deliberate and is
narrower than "operational data":

- It authorises these three bundles to be **considered and used as ingestion inputs** for the local
  personal-use application.
- It **does not** itself install anything. Installation is a separate act (§11).
- It **does not** make the bundles market truth. The defining assessment's own caution stands:
  *"installing the evidence bundles **does not** make them market truth — single-issuer, transcribed,
  annual-only, no quarterly, corporate-action table empty. Every surface will keep saying so."*
- It carries **all caveats attached**, per the `O3` definition's recommended form, including the
  re-issue obligation on restatement (§8.4).

---

## 4. Permitted-use basis — explicit operator declaration

**Basis:** **explicit operator declaration** by the sole decision owner.

The operator declares that these bundles were obtained from sources the operator is **permitted to use
for personal, local investment analysis**.

### 4.1 Mandatory limitation on this basis

> ### This is the operator's declaration concerning permitted personal use.
> ### It is **NOT** independent legal verification of third-party licensing, publisher terms, or source rights.

This limitation is not a caveat added by engineering; it is the exact character of the instrument, and
it matches the vocabulary the product already uses. `manifest.ts:66-67` documents:

> "`OPERATOR_ASSERTED` is deliberately not named 'approved': an approval is a review somebody
> performed, and no such review is recorded by the ingestion path."

and `manifest.ts:73-75`:

> "The declaration itself. `basis` names where the operator's statement comes from (for example a terms
> URL or a named agreement). An empty basis is not a statement of rights: it is the same as `UNKNOWN`,
> and is rejected by `assertSourceRights`."

No review of any third party's licence, terms of use, publisher conditions or redistribution rights was
performed in producing this record, and none is claimed. **No third-party right is marked as
independently verified anywhere in this record.**

### 4.2 Supporting provenance already in the bundles (recorded, not re-verified as law)

The bundles' own committed provenance supports the operator's declaration as a matter of fact, and is
recorded here for completeness. It is **evidence of source**, not evidence of entitlement:

- **Infosys `REL-1`** — its `README.md` states the sources are the issuer's own Ind AS consolidated
  annual filings including the statutory auditor's report (Deloitte Haskins & Sills LLP, FRN
  117366W/W-100018) and board signatures, and that **nothing** was taken from aggregators, brokers or
  estimate services. Disposition **VALIDATED WITH QUALIFICATIONS**. It states plainly: *"No investment
  conclusion is stated in this bundle."*
- **Marico `WI7`** — `determination-wi7.json` records sector and issuer selection rationale and scopes
  the work as *"IRR only; no IPD writes, no policy change, no new persistence mechanism"*; `source/`
  commits FY23/FY24 annual-report page text extracted with `pdftotext -layout` (per `runs/commands.txt`).
- **KEC `WI8`** — `determination-wi8.json` likewise, scoped *"IRR only; no IPD writes, no policy change,
  no new persistence mechanism, no validator change"*; three consecutive audited consolidated periods
  taken from two documents (FY2025-26 and FY2024-25 reports).

All three are transcriptions of issuers' own published statutory filings.

---

## 5. Application boundary and deployment restrictions

The admission is **bounded by the application boundary** and does not travel outside it.

| Restriction | Statement |
|---|---|
| **Single user** | Admitted for one user's own analysis. No multi-user admission is made or implied. |
| **Local host only** | Admitted for the user's local Windows laptop. No hosted, cloud or remote-serving admission. |
| **Personal investment analysis only** | No commercial, advisory-to-third-parties, resale, or publication use is admitted. |
| **No production** | Production is explicitly **OUT OF SCOPE**. This decision confers **no** production authority or eligibility. |
| **No SaaS** | No SaaS or service-bureau deployment is admitted. |
| **No redistribution** | The bundles are transcriptions of third-party statutory filings whose redistribution terms were **not** reviewed (§4.1). The ingestion path already writes `licence: 'operator-supplied; not redistributable'`. **Redistribution of the bundles, of any dataset derived from them, or of any artifact computed from them is not authorised by this decision.** |
| **No re-licensing** | Nothing here grants, transfers or implies any licence to any other person or entity. |
| **Not transferable** | The declaration is personal to the operator. It cannot be relied on by another person, deployment or organisation. |

Consistent with the existing precedent's binding limitations, this decision:

1. Does **not** independently establish any authorization beyond the admission of these three bundles
   as candidate inputs.
2. Does **not** satisfy, replace or weaken any predicate elsewhere in the governance record. In
   particular the Gate 3 Act §7 requirement stands **verbatim and unaltered**:
   > "**No local flag, environment variable, test result, default configuration or operator assertion
   > substitutes for any predicate.**"
   This `O3` decision **is** the operator act that `O3` calls for; it is **not** an operator assertion
   offered in place of some other predicate, and it does not relax that sentence in any way.
3. Must **never** bypass identity, ownership, authority, revision or any other mandatory check.
4. Confers **no** production authority or eligibility.
5. Does **not** change any refusal vocabulary, status code, or store-effect guarantee.

---

## 6. Bundles admitted — identity, location and integrity evidence

All three bundles were **verified present at their committed locations** and their integrity evidence
was **independently recomputed read-only** for this record. No bundle file was modified: for each
bundle, the count of files tracked in Git equals the count on disk, and the working tree is clean.

### 6.1 Committed locations and file census

| Bundle | Committed path | Files tracked in Git | Files on disk | `ingest-input/` | Working-tree changes |
|---|---|---|---|---|---|
| `REL-1-INFOSYS-2026-11-06` | `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/` | 39 | 39 | present | **0** |
| `WI7-CONSUMER-MARICO-2026-11-07` | `evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/` | 35 | 35 | present | **0** |
| `WI8-INDUSTRIALS-KEC-2026-11-07` | `evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/` | 55 | 55 | present | **0** |

Key blob identities at the decision baseline (`d1118df2…`):

| Bundle | `digests.json` blob | `README.md` blob |
|---|---|---|
| `REL-1-INFOSYS-2026-11-06` | `9e59c024d912…` | `4f720d6c802b…` |
| `WI7-CONSUMER-MARICO-2026-11-07` | `c723f5bfff43…` | `897a4460495e…` |
| `WI8-INDUSTRIALS-KEC-2026-11-07` | `f16c4b62ec40…` | `acbb1f87462d…` |

### 6.2 Bundle integrity — every declared digest recomputed

Each bundle's own `digests.json` was recomputed from the bytes actually committed at the decision
baseline. **All entries match; there are no mismatches and no missing files.**

| Bundle | Digest entries | Match | Mismatch |
|---|---|---|---|
| `REL-1-INFOSYS-2026-11-06` | 37 | **37** | 0 |
| `WI7-CONSUMER-MARICO-2026-11-07` | 30 | **30** | 0 |
| `WI8-INDUSTRIALS-KEC-2026-11-07` | 54 | **54** | 0 |
| **Total** | **121** | **121** | **0** |

The two `digests.json` shapes were both handled: `REL-1` is a chain structure (`schemaVersion`,
`bundle`, `issuerId`, `digestAlgorithm`, `excluded`, `chain`, `files`, `external`); `WI7`/`WI8` are flat
`{path: {sha256, bytes}}` maps.

### 6.3 Manifest and dataset-version references

Existing manifest and recorded dataset-version references, quoted as they stand. **None was modified.**

| Bundle | Reference | Value |
|---|---|---|
| `REL-1-INFOSYS-2026-11-06` | `dataset/manifest.json` → `datasetVersion` | `sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e` |
| `REL-1-INFOSYS-2026-11-06` | `dataset/manifest.json` → `sourceRights` | **ABSENT** |
| `REL-1-INFOSYS-2026-11-06` | `dataset-v1/manifest.json` → `datasetVersion` | `sha256:9be1a83ef198393b97465e104bef9270287bdc01a400c140a9f70927cdfa96e0` |
| `REL-1-INFOSYS-2026-11-06` | `dataset-v1/manifest.json` → `sourceRights` | **ABSENT** |
| `WI7-CONSUMER-MARICO-2026-11-07` | `runs/01-ingest.txt` → recorded `datasetVersion` | `sha256:04c96303e269108803b2a5efef565eae2940ecb649b4f34998d01106a9cc6bd0` |
| `WI8-INDUSTRIALS-KEC-2026-11-07` | `runs/01-ingest.txt` → recorded `datasetVersion` | `sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab` |

### 6.4 Issuer identity and sector as committed

Taken from each bundle's `ingest-input/roster.json`; each sector is an exact member of the closed
13-member `SectorName` union (`iips-platform/src/investment/contracts/operatingMetrics.ts:11-24`).

| Issuer | Issuer ID | Sector | Periods |
|---|---|---|---|
| Infosys Limited | `IN:CIN:L85110KA1981PLC013115` | `Technology` | FY2022, FY2023, FY2024 — annual, consolidated, `AS_FILED`, `INDAS`, `CRORE` |
| Marico Limited | `IN:CIN:L15140MH1988PLC049208` | `Consumer` | FY2022, FY2023, FY2024 — annual, consolidated, `AS_FILED`, `INDAS`, `CRORE` |
| KEC International Limited | `IN:CIN:L45200MH2005PLC152061` | `Industrials` | FY2024, FY2025, FY2026 — annual, consolidated, `AS_FILED`, `INDAS`, `CRORE` |

**Known limitations carried into the admission** (all recorded, none cured by this decision):
single-issuer per bundle; three consecutive **annual** periods only; **no quarterly data**; empty
corporate-action table; transcribed rather than machine-filed; Infosys and Marico keyed to
`dataAsOf = 2024-03-31` (approximately 19.5 months before this decision) while KEC is keyed to
`2026-03-31`; Infosys carries 33 of 52 closed line items with valuation, margin of safety, moat
classification and the risk aggregate **withheld**.

---

## 7. Relationship to existing source-rights and dataset-classification semantics

This section records how the decision relates to the product's existing vocabulary. **The vocabulary is
preserved exactly. No semantic was changed, widened or reinterpreted, and no code was touched.**

### 7.1 The closed vocabularies, as they stand at the decision baseline

`iips-platform/src/investment/fundamentals/manifest.ts:69`:

```ts
export const SOURCE_RIGHTS_STATES = ['SYNTHETIC', 'OPERATOR_ASSERTED', 'UNKNOWN'] as const;
```

`iips-platform/src/investment/fundamentals/datasetClass.ts:57`:

```ts
export type DatasetClass = 'SYNTHETIC_REFERENCE' | 'OPERATOR_SUPPLIED' | 'UNKNOWN';
```

The mapping (`classifyDataset`, rights evidence only — `provider` and `licence` strings are **not**
consulted):

| `sourceRights.state` | `DatasetClass` |
|---|---|
| `SYNTHETIC` | `SYNTHETIC_REFERENCE` |
| `OPERATOR_ASSERTED` | `OPERATOR_SUPPLIED` |
| `UNKNOWN`, **including a manifest written before the rights field existed** | `UNKNOWN` (fail-closed default) |

`SourceRightsDeclaration` is `{ state, basis, note }`, where `basis` is *"Why the operator holds the
right. Required and non-empty for `OPERATOR_ASSERTED`"* and is rejected by `assertSourceRights` if
empty.

### 7.2 What this decision does — and does not — change in that vocabulary

- **It supplies a citable `basis`.** `manifest.ts` says `basis` *"names where the operator's statement
  comes from (for example a terms URL or **a named agreement**)."* This record is that named instrument
  for the operator's declaration concerning these three bundles. Any future ingestion of an admitted
  bundle may cite this record as the source of the operator's statement.
- **It does not change any classification.** Classification is derived from the manifest's **declared
  rights evidence and from nothing else**. This record is not a manifest and writes no rights evidence.
  `classifyDataset` behaviour is unchanged by it.
- **It does not create an "approved" state.** There is deliberately no such state: `OPERATOR_ASSERTED`
  *"is deliberately not named 'approved': an approval is a review somebody performed, and no such review
  is recorded by the ingestion path."* Correspondingly, `APPROVED_LOCAL_INGESTION` was **removed** from
  the taxonomy — `datasetClass.ts:37`: *"THE VOCABULARY CHANGED DELIBERATELY. `APPROVED_LOCAL_INGESTION`
  is gone. It named an approval that no review produced."* **This record does not restore, imply or
  substitute any notion of "approved".** It records an admission decision by the owner, which is a
  different instrument from a rights review.
- **`sourceRights` metadata was NOT changed.** Explicitly prohibited for this work item and not
  performed. In particular the two committed `REL-1` manifests still carry **no** `sourceRights` field
  (§6.3) and therefore still classify `UNKNOWN`. That is their correct, honest classification and it was
  **not** edited to make any check pass.

### 7.3 The open `L-041` divergence is unaffected and remains open

`L-041` (`OPEN`, recorded by WI-13 in register §17.26) is the finding that two classifiers disagree on
the same committed manifests:

| Path | File | Rule | Answer for these manifests |
|---|---|---|---|
| Assessment | `fundamentals/datasetClass.ts` → `classifyDataset` | declared rights evidence, fail-closed | `UNKNOWN` |
| Investment coverage | `coverage/investmentCoverage.ts` → `financialClass()` | substring test on `provider`/`licence` | `OPERATOR_SUPPLIED` |

**This decision does not resolve, adjudicate, narrow or close `L-041`.** It is a data-admission decision,
not a classifier decision. The divergence remains **OPEN** and remains the owner's to adjudicate. Note
the practical consequence for any future Stage 3 acceptance: the coverage path would report
`OPERATOR_SUPPLIED` for **any** dataset regardless of rights evidence, so that surface's class label is
**not** evidence that this decision was recorded, and must not be cited as such.

`L-042` (`OPEN`) is likewise unaffected.

---

## 8. What this decision does **not** do

Recorded explicitly, because the risk of over-reading an admission decision is the reason `O3` exists.

1. **It does not install anything.** No dataset was created, installed, replaced or deleted. No
   ingestion was executed (§13).
2. **It does not touch any runtime location.** Neither `C:\iips-data`, nor
   `C:\iips-data\investment\dataset`, nor `C:\iips-data\iips\user-portfolio.sqlite` was read, written,
   created or opened (§11).
3. **It does not resolve `S3-D1`.** The demonstrated defect — sector spelling is not validated at
   runtime, so an out-of-vocabulary sector string ingests with exit code 0, no `ERROR`, no `WARN`, an
   empty `issues.json`, and **0 of 13 sectors measured** — remains **open and unfixed**. Admission does
   not make an unvalidated field validated.
4. **It does not resolve `S3-D2`.** The existing CLI reads one `roster.json` from one `--input`
   directory and `writeDataset` fully **replaces** the target, so the three-issuer / three-sector
   population is still **not reachable** from these per-issuer bundles without either a hand-authored
   combined input or an implementation change. **No combined-input bundle was created** and **the
   ingestion CLI was not changed.**
5. **It does not satisfy `local-personal-use-enablement`.** That readiness finding concerns the
   `IIPS_LOCAL_PERSONAL_USE` runtime **enablement** condition on the host, which the existing precedent
   classifies separately from authorization and describes as *"necessary but never sufficient"*. It
   remains `LOCAL_PERSONAL_USE_ABSENT` and is **not** discharged by a governance record.
6. **It does not discharge any other IID readiness dependency.** The other findings — `identity-files`,
   `reports-owner-context`, `np04-assessment-store`, `owner-context-carrier`,
   `ipd-binding-precondition`, `ipc-endpoint` — are unaffected and remain outstanding.
7. **It does not verify third-party rights** (§4.1).
8. **It does not make the data current, complete or market truth** (§3.3, §6.4).
9. **It does not merge the document that defines `O3`** (§2.1).
10. **It does not authorise any future restatement to be ingested silently.** See §8.4 below.

### 8.4 Re-issue obligation

The `O3` definition's recommended form carries the condition *"re-issue on each restatement"*. That
condition is **adopted as part of this decision**:

> If any admitted bundle is restated, re-transcribed, re-digested or otherwise superseded, **this
> admission does not automatically extend to the successor.** A fresh operator declaration is required,
> recording the new bundle identity and its new digests. The successor's digest will differ, and a
> digest that differs from the one admitted here is **not** the thing that was admitted.

The digests admitted by this decision are exactly those recorded in §6.2 and §6.3.

---

## 9. Branch divergence inspected before editing

Inspected as required, **before** any edit. No rebase, merge, reset, cherry-pick or overwrite of
unrelated changes was performed.

### 9.1 Observed divergence

| Property | Value (observed `2026-11-13T09:19:46Z`) |
|---|---|
| Current branch | `arena/94a53bb3-iips-review-recovered` |
| Local `HEAD` | `d1118df296b9f17e211a85ee91f8bb24c89ff947` |
| Upstream tracking | `d1118df296b9f17e211a85ee91f8bb24c89ff947` (in sync) |
| `origin/main` | `08411bcd6d782a601fe5c82cc9983d076831148d` |
| Ahead / behind `origin/main` | **8 / 2** |
| Merge base | `a835d4af019ab4f677ab238ec42d44326f06a771` |
| Working tree | clean, **0** changed files |

### 9.2 The two `main` commits this branch does not have

| Commit | Date | Subject |
|---|---|---|
| `08411bcd` | `2026-11-13T12:37:13+05:30` (`07:07:13Z`) | Merge pull request **#564** from `ramkivs/arena/5570860c-iips-review-recovered` |
| `9dbf4835` | `2026-11-13T12:26:06+05:30` | W11 dependency 1: read-only owner-bound portfolio capture utility |

PR #564 is **MERGED** (`mergedAt = 2026-11-13T07:07:13Z`). Its footprint, measured as
`merge-base..origin/main` (not a symmetric diff), is **12 files**:

```
M  .gitignore
A  docs/integration/W11-DEP1-OWNER-BOUND-PORTFOLIO-CAPTURE-UTILITY-2026-11-13.md
M  frontend/package.json
A  frontend/server/user-portfolio/capture/capture-owner-bound-portfolio.ts
A  frontend/server/user-portfolio/capture/captureOwnerBoundPortfolioCli.test.ts
A  frontend/server/user-portfolio/capture/captureOwnerBoundPortfolioScript.test.ts
A  frontend/server/user-portfolio/capture/ownerBoundPortfolioCapture.test.ts
A  frontend/server/user-portfolio/capture/ownerBoundPortfolioCapture.ts
A  frontend/server/user-portfolio/capture/testing/run-synthetic-peer.ts
A  frontend/server/user-portfolio/capture/testing/syntheticIpcPeer.ts
A  frontend/tsconfig.portfolio-capture.json
A  tools/windows/capture-owner-bound-portfolio.ps1
```

**Collision assessment: none.** PR #564 belongs to a different session's workstream (`W11` owner-bound
portfolio capture). It touches no IID decision record, no `evidence/real-issuer/` bundle, and does not
create the path this record occupies. Its `.gitignore` change is **append-only** (adds
`LOCAL-ONLY-DO-NOT-PUBLISH/`, `exact-owner-bound-portfolio-capture.json`,
`portfolio-candidates.json`); line 153 `.iips-data/` is present on **both** `origin/main` and this
branch, so the runtime-data ignore convention is unchanged.

**Action taken: none.** The divergence was left exactly as found. This record is added as a new file on
this branch only. Merging or rebasing this branch, or merging PR #562, is a separate owner act and was
**not** performed.

---

## 10. Authoritative location for this record — rationale

The instruction was explicit: *do not assume the existing Stage 3 report is itself the authoritative
decision register.* It is not, and this record is not written into it.

| Candidate location | Used? | Reason |
|---|---|---|
| **A new dedicated additive decision record in `docs/integration/`** | **YES — this file** | Matches the repository's dominant governance convention: **195** `.md` decision-record files live in `docs/integration/` (196 entries match the decision/ruling/disposition/authority naming pattern, the 196th being one `.ps1` completion script), including the closest precedent (`PA-DECISION-PERSONAL-USE-ACCEPTANCE-AND-W1-RECONCILIATION-2026-11-08.md`) and IID-specific decisions such as `IIPS_V3_IID_L014_SUBSTANTIVE_IDENTITY_DECISION_2026-11-06.md`. Decision records are additive, self-contained, and cite their own baseline. |
| `IID-STAGE-3-INVESTMENT-DATASET-READINESS-2026-11-13.md` | **NO** | It is a **readiness evidence record**, not a decision register — it investigates and reports; it does not hold owner acts. Writing the decision into it would also mean editing a published record. It is **not modified**; §10.1 records the relationship instead. |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | **NO** | Its register is the `REG-01`–`REG-13` **IRR/IPD Program Authority** series with **0** `O3` occurrences; `O3` belongs to a different identifier series (the IID owner-decision register `O1`–`O10`). It is a 22,535-line append-only historical register with a Completed-Work Protection List (§4); editing it to host an identifier from another series would conflate the two registers and risk historical evidence. |
| `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` | **NO** | The authoritative IID roadmap. It contains **no** `O`-series identifiers at all, and it is pinned protected evidence (blob `a988194dc4a2…`). |
| The unmerged 11 Nov assessment (§28) | **NO** | It *defines* `O3` but is unmerged and belongs to another branch (`31a9b01e…`). Writing to it would be writing outside this branch. |
| `governance/` | **NO** | Repository-infrastructure policy (onboarding, release checklist, versioning), not product data-admission decisions. |

### 10.1 Relationship to the Stage 3 readiness record — additive supersession

`IID-STAGE-3-INVESTMENT-DATASET-READINESS-2026-11-13.md` §6.2 concluded, as at its own authoring
baseline `7c25bc49…`:

> "**Conclusion: no O3 decision is recorded anywhere in the repository.**"

**That finding was correct when recorded and is now superseded by this record.** Following this
repository's convention for self-documenting records — a published record states what it observed at
its own baseline, and a later record supersedes it additively rather than retro-editing it — the Stage 3
report is **left byte-identical and unmodified**. This section, not an edit to that file, is the
supersession.

Effect on the Stage 3 blockers:

| Stage 3 ID | Blocker as recorded | Status after this decision |
|---|---|---|
| **S3-B1** | Operator decision O3 not recorded | **RESOLVED by this record.** `O3` = `ADMITTED` for the three named bundles. |
| **S3-B2** | No designated runtime data directory | **ADDRESSED by designation** (§11) — the operator has stated the designated paths. Not verified from this session (Linux sandbox) and not written to. |
| **S3-B3** | Environment mismatch — not the operator's Windows host | **CLARIFIED** — the designated root is a Windows path, confirming Stage 3 execution belongs on the host. Still **not executable from this session**. |
| **S3-D1** | Sector spelling not validated at runtime | **NOT RESOLVED.** Explicitly out of scope for this work item. |
| **S3-D2** | Three-issuer population not reachable via the existing CLI | **NOT RESOLVED.** Explicitly out of scope for this work item. |

---

## 11. Designated runtime locations — recorded, and **not touched**

The operator designated the following runtime paths. They are recorded here because a designated
runtime root is a prerequisite for any future Stage 3 installation, and until now none existed in the
repository record.

| Purpose | Designated path |
|---|---|
| Runtime data root | `C:\iips-data` |
| Personal portfolio database | `C:\iips-data\iips\user-portfolio.sqlite` |
| Intended Investment Coverage dataset directory | `C:\iips-data\investment\dataset` |

**Neither runtime location was touched during this governance-recording task.** Specifically:

- No file or directory was created, read, written, moved or deleted at any of these paths.
- The portfolio SQLite database was **not opened** — not for read, not for write.
- No `NP04` persistence configuration was changed; `IIPS_NP04_DATABASE_PATH` remains unconfigured in
  this session's environment and the `np04-assessment-store` finding remains `DATABASE_PATH_NOT_CONFIGURED`.
- `IIPS_DATA_DIR` was **not set, exported or persisted** by this work item, in any shell, file or
  configuration. Setting it on the host is an operator act belonging to the installation step, not to
  this record.

**Verification limitation, stated honestly.** These are Windows paths. This session ran on
`Linux e2b.local 6.1.158+ … x86_64` with no Windows filesystem mounted (`/mnt/c` and `/c` absent). The
existence, emptiness, permissions or current contents of any of these paths **could not be and were not
verified**. No claim is made about the state of the operator's host. They are recorded **as designated
by the operator**, which is exactly what a governance record should carry — not as inspected facts.

Consistency note: the designated root is compatible with the implementation's resolution order
(`port/localSnapshotStore.ts:41-45` — explicit option > `IIPS_DATA_DIR` > `<cwd>/.iips-data`), since
setting `IIPS_DATA_DIR=C:\iips-data` yields `C:\iips-data\investment\dataset` for the dataset directory.
It also avoids the fallback this record previously flagged as unsafe, which would have placed runtime
data inside the working tree.

---

## 12. Verification performed for this record

All verification was **read-only**. Exact commands and results:

| # | Check | Command / method | Result |
|---|---|---|---|
| V1 | Remote state fetched | `git fetch origin --prune` | ok |
| V2 | Branch, head, upstream, divergence | `git rev-parse`, `git rev-list --count`, `git merge-base` | ahead 8 / behind 2, base `a835d4af…`, tree clean (§9.1) |
| V3 | PR #564 footprint measured non-symmetrically | `git diff --name-status a835d4af..origin/main` | 12 files, no collision (§9.2) |
| V4 | `O3` in the authoritative IID roadmap | word-boundary grep of blob `a988194dc4a2…` | **0** occurrences (§2.3) |
| V5 | `O3` in the master tracker / decision register | word-boundary grep, 22,535 lines | **0** occurrences (§2.3) |
| V6 | `O3` defining document located and pinned | `git ls-remote` + `git rev-parse <tip>:<path>` | branch live at `31a9b01e…`, blob `e6f7562380…`, 871 lines, 12 `O3` occurrences, **unmerged** (§2.1) |
| V7 | No pre-existing `O3` admission record | word-boundary grep across `docs/integration/*.md` | none found; nothing duplicated or overwritten (§2.3) |
| V8 | Three bundle names and committed locations | `git ls-tree -r HEAD` + on-disk census | all three present; 39/35/55 files, tracked == on disk (§6.1) |
| V9 | Bundle integrity recomputed | sha256 of every path in each `digests.json` | **121/121 match, 0 mismatch** (§6.2) |
| V10 | Manifest / dataset-version references read | `manifest.json`, `runs/01-ingest.txt` | values quoted verbatim, none modified (§6.3) |
| V11 | Issuer identity and sector spelling | `ingest-input/roster.json` + `SectorName` union | all three sectors exact members of the closed 13-member union (§6.4) |
| V12 | Source-rights and classification semantics | `manifest.ts:65-99,132-158`; `datasetClass.ts:57,66-102` | vocabularies quoted verbatim; **unchanged** (§7) |
| V13 | Existing governance terminology | `PA-DECISION-PERSONAL-USE-ACCEPTANCE-AND-W1-RECONCILIATION-2026-11-08.md` | owner, operating-model, production-scope and binding-limitation language **preserved** (§1, §5) |
| V14 | IPD read-only pin | `gh api …/branches/main` | `a624d06f…`, unchanged; **zero** IPD writes |
| V15 | Working tree after all inspection | `git status --porcelain` | **0** changed files before this record was authored |

---

## 13. Boundary confirmations

| Boundary | Confirmation |
|---|---|
| **Ingestion** | **NOT EXECUTED.** `src/investment/cli/ingest.ts` was not run. No `--input`, no `--dataset-dir`, no scratch reproduction, no dry run. |
| **Dataset installation** | **NOT STARTED.** No dataset created, installed, replaced, merged or deleted at any location. |
| **Source bundles and manifests** | **UNMODIFIED.** All three bundles: 0 working-tree changes, 0 changes in any commit of this work item, tracked file count == on-disk file count. Both committed `REL-1` manifests still verify and still carry no `sourceRights` (§6.3, §7.2). |
| **`sourceRights` metadata** | **NOT CHANGED** — not to make classification pass, not for any other reason. No manifest was written. |
| **Third-party rights** | **NOT marked as independently verified.** The opposite is recorded as a mandatory limitation (§4.1). |
| **Combined-input bundle** | **NOT CREATED.** No merged `roster.json`, no merged `periods.csv`, no staged input directory. |
| **Ingestion CLI** | **NOT CHANGED.** No source file was edited. |
| **S3-D1 / S3-D2** | **NOT FIXED.** Both remain open and are expressly out of scope (§8). |
| **Runtime data** | **NOT TOUCHED.** `C:\iips-data` and `C:\iips-data\investment\dataset` were neither read nor written (§11). No `.iips-data` directory was created anywhere in the repository. |
| **Portfolio SQLite database** | **NOT OPENED.** `C:\iips-data\iips\user-portfolio.sqlite` was not read, written or created. No `NP04` persistence configuration was changed. |
| **IID Stage 2** | **NOT STARTED.** No identity readiness work; no identity file created, staged or modified. |
| **IPD** | **ZERO writes.** Read-only pin `a624d06f…` unchanged. No IPD commit, branch, PR, binding or provisioning. No IPC peer configured or contacted. Only push remote configured is IRR. |
| **Production** | **No production work.** Production remains explicitly **OUT OF SCOPE**. |
| **Implementation / tests / dependencies** | **ZERO changes.** No source, test, configuration, `package.json` or lockfile was modified. No test suite was run for this governance record. |
| **Historical evidence** | **NOTHING OVERWRITTEN.** Protected records — CPII-01, the CPII master roadmap discovery record, the P6A assessment, the 2026-11-10 separation record, the Stage 3 readiness record, the IID roadmap, the limitation register, and all `evidence/real-issuer/` bundles — are byte-identical and unmodified. |
| **Decision identifier** | **NOT INVENTED.** The existing `O3` identifier is used, quoted from and pinned to its defining document (§2). |
| **Branch / PR** | **No new branch, no new PR.** Work is committed to the existing branch `arena/94a53bb3-iips-review-recovered`; existing PR #562. Nothing merged, closed, rebased or reset. No PR title, body, label or metadata changed. |

---

## 14. Status

| Item | Status |
|---|---|
| **`O3`** | **RECORDED** — `ADMITTED`, three named bundles, explicit operator declaration, local single-user personal use, all limitations attached. Evidence: §3 (operative text and scope), §4 (basis and its mandatory limitation), §6 (bundles and 121/121 digest verification), §2 (identifier provenance, quoted and pinned). |
| **Dataset installation** | **NOT STARTED** — §13. No ingestion executed; no runtime location touched. |
| **Other Stage 3 decisions** | **NOT RESOLVED BY THIS WORK ITEM** — `S3-D1` (runtime sector validation) and `S3-D2` (three-issuer reachability) remain open (§8); the freshness-expectation decision, the operating-metric entry decision, and the installation-route choice (committed `dataset/` classifying `UNKNOWN` versus a rebuild classifying `OPERATOR_SUPPLIED`) all remain outstanding; `L-041` and `L-042` remain **OPEN** (§7.3). |

### 14.1 What now follows, and what still does not

With `O3` recorded, the **governance** prerequisite for IID Stage 3 is satisfied for these three
bundles. Stage 3 installation remains **not started**, and remains blocked in practice by:

1. **Execution environment** — installation must occur where `C:\iips-data` exists, i.e. the operator's
   Windows host. It cannot be performed from this session (§11).
2. **`S3-D2`** — a single invocation installs one issuer; three measured sectors in one dataset is not
   reachable without a further owner decision (§8.4 of the Stage 3 record).
3. **`S3-D1`** — sector spelling is unvalidated, so an installation can silently produce zero
   measurements while reporting success.

**Overall IID readiness is not READY**, and recording `O3` does not make it so: seven further readiness
dependencies remain outstanding (§8 items 5–6).

---

*End of decision record.*
