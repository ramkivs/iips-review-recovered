# IID O1 — Identity Governance: Program Authority Decision Record

**Decision identifier:** `O1` (existing identifier, preserved — **no new decision identifier is invented
by this record**)
**Decision:** **`DECIDED`** — the initial governed issuer population is the three admitted issuers, with
identity supported by the admitted identity records and eligibility reserved to the sole owner
**Decision owner:** Ramki (sole owner and decision-maker for issuer eligibility and future additions)
**Recording agent:** Arena Agent Mode — records the owner's stated decision, its provenance and its
verification. **No decision is rendered, extended or inferred by the agent**, and nothing here is an
assessor minting an owner act: the owner stated the five operative points in §3.1.
**Application:** IIPS v3.0 — IID path
**Operating model:** Local / Single User / Personal Use
**Production:** Explicitly **OUT OF SCOPE**
**Decision date:** 2026-11-16 (UTC)
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Branch:** `arena/53ff9276-iips-review-recovered`
**Baseline at decision:** `ad44838180265673e4b8df2a5a6d8b1fc62efe61` (remote head read back before
authoring; tree `260306c6cfc700d7e2bf42513564b6f41266a1fb`)
**`origin/main` at decision:** `08411bcd6d782a601fe5c82cc9983d076831148d`; the branch is **diverged**
(ahead 42 / behind 14)
**IPD reference (read-only):** `main` `10f326cb3c84794ee15666add982abc624d22f3a` — inspected through the
GitHub API, **zero IPD writes**

**Nature of this record:** governance recording of a single owner decision. **Documentation only.** No
identity file was created, published, replaced or edited. No installed file, dataset, carrier, database or
runtime directory was touched. No IRR source, test, configuration or dependency was changed. No IPD
commit, branch, PR, approval record or installation was made.

---

## 1. Authority and context

Ramki is the sole decision owner for all architectural, governance, authorization, acceptance and
implementation decisions concerning this personal IIPS application. It is **local, single-user and
non-production**. There is no committee, no second approver and no organisational hierarchy, and nothing
in this record introduces one.

`O1` is **not** an identifier invented here. It is defined in exactly one document, the 11 November 2026
readiness assessment, §28 — *Product-owner decision register* — which is on an **unmerged** branch:

| Property | Value |
|---|---|
| Defining document | `docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md` |
| Defining section | §28 |
| Branch carrying it | `refs/heads/arena/iid-coverage-readiness-report-2026-11-11` |
| Commit (branch tip, read from the remote for this record) | `31a9b01e574f2911cc2685e3d63dddcfb1194d62` |
| Definition as written | *“Identity roster authority, scope and refresh cadence (which issuers; eligibility rules; exclusion reasons; owner of edits)”* |
| Merged to `main` | **NO** |

The gate framing built on `O1` by later records is quoted, not restated:

- `CPII-01` §8.2: *“B-3 has a governance precondition, not just a file-placement step.”*
- `IID-STAGE-2-READINESS-REASSESSMENT-2026-11-14.md` §2.2: the act of publishing a roster evidences
  **which issuers** but not the eligibility rule, not edit ownership and not whether three *is* the
  intended population. §2.3: *“an owner decision, recorded as O3’s was.”*
- `IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` §7 (`S2-R1`): *“OPEN — unchanged.”*

### 1.1 Relationship to `IID-PA-01` (why this is not a duplicated gate)

`IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md` §3 row `G-3` **removed `O1` as a gate**:
*“The owner chooses their population by authoring the roster. No decision record is required and Stage 2
is not held open for one.”*

That disposition stands, and **this record does not reinstate the gate**. It is not created to unblock
anything, and nothing is blocked if it had not been written. The owner asked for the decision to be
stated. `PA-01` removes the *requirement* to record it; it does not write down *what* the owner decided.
This record writes that down, once, so the choice is not left implicit in the roster bytes.

`PA-01`'s engineering guards are untouched: the identity loader's fail-closed validation, the
provisioner's refusal of synthetic sources and duplicate records, staged publication and rollback, and
IPD's own approval enforcement (§6) all stay exactly as implemented.

---

## 2. Is there an equivalent decision already? — searched, and none exists

The instruction was to reuse an equivalent decision rather than create a duplicate. None exists. The
search is recorded so the negative result is auditable:

| Check | Method | Result |
|---|---|---|
| A dedicated `O1` decision record | filename walk of the tracked tree for `O1`, `ISSUER-POPULATION`, `IDENTITY-GOVERNANCE` | **none** |
| Decision-record body containing an `O1` act | `docs/`, `evidence/`, `tools/` searched for `O1` together with identity/roster/issuer language | **no record acts on `O1`**; every hit is a citation, a proposal or an unrelated series |
| `O1` in the authoritative IID roadmap | word-boundary grep at the baseline | **one** occurrence, in the `PA-01` removal row (§C, “Removed as gates”) — a removal, not a decision |
| `O1` in the master tracker / decision register | word-boundary grep | **0** |
| Same subject under another identifier | `IIPS_v3.0_PLATFORM_IDENTITY_ELIGIBILITY_CONTRACT_PROPOSAL_2026-10-19.md` | **NON-OPERATIVE PROPOSAL** — states that it creates no eligibility meaning and renders no decision |
| IPD side | IPD `IIPS-W04-IDENTITY-PROVISIONING-DECISIONS-D1-D4-2026-11-13.md` (`D1`) | governs **whether IPD's P04 export may be used as IRR's roster**, and is an IPD approval act, not the IRR population/eligibility/edit-ownership decision. Read-only reference, unchanged |

**No duplicate was created, and no existing record was overwritten.** The word “initial” in §3.1 is
deliberate: it states a starting population, not a permanent universe.

---

## 3. The decision

### 3.1 Operative text

> ## **O1 — `DECIDED`**
>
> 1. **Initial governed issuer population:** **Infosys Limited**, **Marico Limited** and **KEC
>    International Limited** — three issuers, and no others.
> 2. **Issuer identity must be supported by the admitted identity records.** An issuer is in the
>    population only where the admitted identity records carry its identifier, and no identifier is
>    invented, inferred, fuzzy-matched or widened to make an entry fit.
> 3. **Inclusion in the issuer population does not imply financial qualification.** Being in the
>    population is an identity statement. It is not a statement that the issuer's data is current,
>    sufficient, or fit for a valuation.
> 4. **Ramki is the sole owner and decision-maker for issuer eligibility and for future additions.**
>    Eligibility, exclusion and any addition are the owner's, exercised directly.
> 5. **IRR maintains the identity records. IPD retains its existing identity approval enforcement
>    responsibility.**

### 3.2 Limb-by-limb closure of `O1`'s four open questions

`IID-STAGE-2-READINESS-REASSESSMENT-2026-11-14.md` §2.3 named what an O1 record had to settle. This one
settles each:

| `O1` question | Answer recorded | Where |
|---|---|---|
| **Which issuers / intended population** | Exactly three: Infosys, Marico, KEC. Three **is** the intended initial population — not merely what happened to exist | §3.1 item 1, §4 |
| **Eligibility rule** | Identity must be supported by the admitted identity records; eligibility itself is the owner's decision, not a code rule. The source-supplied `status` values are adopted as they stand, because the owner's decision is that they are his | §3.1 items 2 and 4, §4.3 |
| **Exclusion reasons / who may edit** | The owner. IRR maintains the files; the provisioner and its guards decide nothing about eligibility | §3.1 items 4 and 5, §6 |
| **Refresh cadence** | *Not fixed by this decision.* Additions are the owner's and are made when he makes them; no cadence is promised and none is invented here | §7.2 |

### 3.3 What this decision does not decide

- It does **not** rank, score or qualify the three issuers financially (item 3).
- It does **not** admit any dataset. Dataset admission is `O3`
  (`IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md`), unchanged and relied upon.
- It does **not** widen the population to any issuer outside the three admitted records.
- It does **not** create, replace or re-publish an identity file (§8).
- It does **not** touch IPD, its approval mechanism, its security master or any IPD decision (§6).
- It does **not** change a single readiness finding, and it does **not** make overall IID readiness
  READY (§9).

---

## 4. Identity support — the admitted records, verified read-only

The three issuers are the `O3`-admitted bundles' own identity records. No record was invented and none
was edited. Every file below was hashed from the committed bytes at the decision baseline and its Git
blob was compared against the remote tree of `ad448381…`: **9 of 9 match**.

| Issuer | Admitted identity record directory | `eligible-roster.json` blob | bytes | sha256 |
|---|---|---|---|---|
| Infosys Limited | `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/identity` | `4d0550b7e9b951b027e5d6735c10236168864183` | 755 | `f38334a45fcee8bc81bd9902afae9deda659ec9373778d4e113c20151b876065` |
| Marico Limited | `evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/ingest-input/identity` | `565688d4f87ccb0a589b5475f31ba6b01d940cef` | 766 | `1641e72775a47564c9048383c80ac56365428e759763190a77b580dabb11de57` |
| KEC International Limited | `evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input/identity` | `e1a14e5b7de622f322b3a264503ed63907dd939e` | 794 | `31123077207b90f463266e264b3256cf4fc10f30b835ee60f62a29d6a615a333` |

Each directory holds exactly the three governed files (`eligible-roster.json`, `listing-map.json`,
`corporate-actions.json`), all `IIPS_INVESTMENT_IDENTITY_V1`. The `listing-map.json` and
`corporate-actions.json` blobs at the same baseline are `f28848af…`/`3b0f1c8e…` (Infosys),
`a513cb02…`/`1e5efa1d…` (Marico) and `5bc12e91…`/`d3f8cf8d…` (KEC).

### 4.1 Identifier evidence as committed — mechanically re-checked

For each issuer the record was parsed and validated read-only:

| Issuer | `issuerId` | CIN | Equity ISIN | ISIN check | Sector |
|---|---|---|---|---|---|
| Infosys Limited | `IN:CIN:L85110KA1981PLC013115` | `L85110KA1981PLC013115` | `INE009A01021` | **Luhn valid** | `Technology` |
| Marico Limited | `IN:CIN:L15140MH1988PLC049208` | `L15140MH1988PLC049208` | `INE196A01026` | **Luhn valid** | `Consumer` |
| KEC International Limited | `IN:CIN:L45200MH2005PLC152061` | `L45200MH2005PLC152061` | `INE389H01022` | **Luhn valid** | `Industrials` |

Also verified, for all three: the issuer id equals `IN:CIN:` + its own CIN; the CIN matches the
21-character Indian CIN shape; `issuerKeyBasis` is `CIN`; `status` is `ELIGIBLE` with
`statusReason` `null`; `foreignIssuer` is `false`; exactly one `ASSESSABLE` equity security exists per
issuer and its `securityId` equals `IN:ISIN:` + the ISIN; every listing-map entry points at that
issuer; and the corporate-action table holds **0** records for Infosys and Marico and an explicitly
empty table for KEC (558 B, with a note explaining why no action is claimed). The three CINs are
distinct, so the provisioner's duplicate-record refusal cannot be triggered by this set. Each roster's
own `rosterLabel` states it is operator-supplied, and none self-classifies as a fixture.

Sectors are exact members of the closed 13-member `SECTOR_NAMES` union, so the `G-7` spelling seam
cannot silently zero these three sectors.

**What this is not.** It is not a claim that the committed records are *complete* for the issuer, or that
the host's installed files equal these bytes. §7 and §8 state both limits.

### 4.2 The records these three issuers are *not* drawn from

Seven committed identity directories exist under `evidence/real-issuer/`. This decision names the three
above and **only** those. `WI3`, `WI5`, `WI6A-S2` and `WI7-L038` also carry identity records — including
two further real issuers (`eClerx Services Limited`, `Zensar Technologies Limited`) — and they are
**outside** this population. Admission is per bundle, as `O3` established; it is not inherited by issuer,
by directory or by resemblance.

---

## 5. Inclusion is not qualification

Item 3 of the decision is recorded as a standing constraint, not a caveat:

- The three issuers are **identified**. Nothing follows about whether their finances support a valuation.
  The persisted Infosys assessment is `SUFFICIENT / MATERIAL_CONCERNS` with confidence `0.3210` and
  carries `STALE_STATEMENTS` at the assessment clock; Marico and KEC carry the same freshness class.
- Operating metrics remain unentered, so 14 of 38 method slots stay withheld; corporate-action tables
  are empty; the admitted datasets are annual-only with no quarterly periods.
- A coverage row saying a method is computable is a statement about the data's shape, not a verdict on
  the company.
- Adding an issuer to the population therefore **adds no financial claim**. Removing one would not
  retract any.

No surface may read this decision as a qualification, ranking or recommendation, and none of the
existing limitation vocabulary is relaxed to accommodate it.

---

## 6. Ownership line: IRR maintains; IPD enforces its existing approval

Stated as fact, read-only, and unchanged by this record:

| Responsibility | Owner | Evidence |
|---|---|---|
| The governed identity records — their content, versions and maintenance | **IRR** | `iips-platform/src/investment/identity/sources.ts` loads `${IIPS_DATA_DIR}/investment/identity`; `identity/provision.ts` and `cli/provision-identity.ts` publish them with staging and rollback |
| Which issuers, and on what basis | **Ramki** (the owner) | §3.1 items 1, 2 and 4 |
| Approval enforcement for an installation of IRR's identity sources | **IPD, retained as-is** | IPD `src/identity/irr_identity_approval.ts` (`evaluateIdentityApproval`, schema `IPD_IRR_IDENTITY_APPROVAL_V2`, policy `IPD-IRR-IDENTITY-APPROVAL-POLICY-2`, single approver `PROGRAM_AUTHORITY_RAMKI`) and `scripts/provision-irr-identity-sources.mjs`; IPD record `IIPS-W04-IDENTITY-PROVISIONING-APPROVAL-ENFORCEMENT-2026-11-13.md` |

Two limits on that line, so it is not over-read:

- IRR's loader reads **three files and no approval artefact**. A search of IRR's tracked content for
  `IDENTITY_APPROVAL`, `irr_identity_approval`, `W04-D1`, `p7ManifestSha256`, `GENERATION_MISMATCH` and
  `IPD_IRR_IDENTITY_APPROVAL` returns **0** hits at this baseline. IRR neither implements nor duplicates
  IPD's check.
- Because IPD's mechanism approves an **installation**, this IRR-side decision neither requires nor
  creates an approval record. The two are different acts: this record says *who is in the population*;
  IPD's gate asks *may these exact files be installed*. Neither substitutes for the other, and `O1` does
  not relax IPD's gate for any future installation.

---

## 7. Status after this record

### 7.1 `O1` and `S2-R1`

| Item | Before | After |
|---|---|---|
| `O1` substantive decision | **Unrecorded** — `PA-01` had removed it as a gate; no record of the choice existed | **`DECIDED`** — population, identity basis, non-qualification, edit ownership and the IRR/IPD line are recorded once (§3) |
| `S2-R1` (record the owner's O1 decision) | **OPEN** (`IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` §7) | **SATISFIED as a register act** by this record, which is the “O1 decision record” that row names as its exact evidence |
| Stage 2 governance gate | Outstanding per the Stage 2 and Stage 4 records | **Discharged by the recorded decision.** Stage 2's technical verdict is unchanged and is **not** re-asserted here |
| `O1` as a gate | Removed by `PA-01` §3 `G-3` | **Still removed.** This record adds content, not a gate |

`S2-R2` (host transcript detail) remains **OPEN** and optional; it is an evidence-transcription item, not a
blocker, and nothing in this record closes or re-scores it.

### 7.2 An observation this record does not resolve

While reading `O1`'s own sources, a divergence was found and is recorded rather than silently ignored.
IPD's `IIPS-W04-IDENTITY-PROVISIONING-HOST-COMPLETION-RECONCILIATION-2026-11-14.md` reports, as an
**operator-reported host fact**, that a **2,388-issuer** roster exported from IPD's P04 master was
installed as IRR's identity sources under IPD approval `W04-D1-20261114-01`
(`eligible-roster.json` `078e89cc…`, 1,350,516 bytes). That is a different population from the three
issuers decided here.

Three things follow, and only these:

1. **Which set the host currently holds is not verified by Arena.** Arena has no access to the Windows
   host or to `${IIPS_DATA_DIR}`. No file was read, written, re-published or compared on the host.
2. **This decision is the IRR-side population decision.** The IPD export is IPD-side provisioning under
   its own approval, and reconciling an installed set to this decision is an ordinary owner/operator act.
   It is **not** performed, and not authorized, by this record.
3. **`O1`'s future-addition limb covers this.** Population is the owner's to change, and item 4 already
   reserves that. Nothing here forecloses the 2,388 set; nothing here adopts it either. It remains an
   IPD-recorded host fact outside this decision's scope.

### 7.3 Refresh cadence

Not fixed here. The owner adds issuers when he chooses to. No scheduled review, no expiry and no
periodic re-admission is created, because none was asked for and none is needed for a single-user local
application. `PA-01`'s replacement for approval — verify after any change and keep a short durable note —
applies to future identity changes and is not weakened.

---

## 8. Boundary confirmations

| Boundary | Confirmation |
|---|---|
| **Identity files** | **NOT CREATED, PUBLISHED, REPLACED OR EDITED.** No `eligible-roster.json`, `listing-map.json` or `corporate-actions.json` was written anywhere, in the repository or outside it |
| **Installed files** | **NOT TOUCHED.** No `${IIPS_DATA_DIR}` location was read or written; `C:\iips-data` was not accessed. No re-provisioning, no `--execute`, no `--verify-only` |
| **Admitted dataset** | **NOT MODIFIED.** No dataset file, manifest or digest was written. No ingestion was run |
| **Identity / dataset / carrier / databases** | **NOT MODIFIED.** No Reports carrier, Personal Portfolio database, NP-04 store or evidence directory was opened |
| **IPD** | **ZERO writes.** `main` read through the API at `10f326cb…`; no commit, branch, PR, approval record, installation or configuration. IPD records are cited, not edited |
| **IRR source, tests, configuration** | **ZERO changes.** No `.ts`, test, `package.json`, lockfile or workflow was modified; no test suite was run for this governance record |
| **Decision identifier** | **NOT INVENTED.** The existing `O1` is used, quoted and pinned to its defining document (§1) |
| **Tracker identifiers** | No `CV-CORR` / `CHG` / `V` identifier consumed; the tracker section is a plain IID entry (§10) |
| **Completed work** | **NOT REOPENED.** NP-04 persistence is not re-run; the identity publication is not repeated; the dataset is not reinstalled |
| **PRs** | **Nothing merged, closed, rebased or reset.** PR #562, #563, #566 and #515 are untouched |
| **Historical records** | **NOTHING OVERWRITTEN.** Prior records are amended only by appended forward sections (§10), never retro-edited |

---

## 9. Readiness effect: none, and not READY

`IID-STAGE-2-READINESS-REASSESSMENT-2026-11-14.md` §2 predicted that recording `O1` would close Stage 2's
governance gate **and nothing else**. That prediction holds.

- **Overall IID readiness: NOT READY.** `ready` remains `false`. Taking the most recent IID records at
  their word rather than re-deriving them: `IID-NP04-FIRST-INFOSYS-PERSISTENCE-COMPLETION-2026-11-15.md`
  records the Reports carrier (D3) and the assessment store (D2), and IID-01 persistence (D9) for one
  Infosys version, as **operator-reported** discharged. That leaves the IPD active binding (D5), the IPC
  endpoint and peer (D6) and the F-3 owner-context carrier (D4) outstanding, plus IID-03 change
  comparison, browser acceptance and the Stage 4 data residuals. Recording an identity-population
  decision changes none of them, and this record claims no readiness capture of its own.
- **Identity Coverage still cannot be served** from IRR or the operator alone: `CPII-01` §8.2's `B-4`,
  `B-5` and `B-6` are independent, jointly fatal and IPD- or host-owned.
- **No holding has been shown to resolve to an issuer** on the running surface; a population decision is
  not a resolution result.
- **Stage 5 is not advanced** by this record: the portfolio loop still waits on IPD's binding and peer.

---

## 10. Where this decision is recorded, and the tracker update

| Location | Change |
|---|---|
| **This file** — `docs/integration/IID-O1-IDENTITY-GOVERNANCE-PA-DECISION-2026-11-16.md` | The decision of record. Additive; nothing else in the repository is required to read it |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | **§16.285** appended — an IID-only entry; no `CV-CORR`/`CHG`/`V` identifier consumed |
| `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` | **Part C §C.3** appended — a pointer recording that `O1` is decided and that nothing downstream moved |
| `docs/integration/IID-STAGE-2-READINESS-REASSESSMENT-2026-11-14.md` | Appended **§14** addendum — `§2`'s “O1 outstanding” is now satisfied; the file's own text is left byte-identical |
| `docs/integration/IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` | Appended **§13** addendum — `S2-R1` satisfied; the register row is left as written at its own baseline |

No `governance/` change, no code change, no schema and no new store.

---

## 11. Verification performed for this record

All read-only, at branch head `ad448381…` / tree `260306c6…`.

| # | Check | Result |
|---|---|---|
| V1 | Remote head and tree read back before authoring | `ad44838180265673e4b8df2a5a6d8b1fc62efe61`, tree `260306c6cfc700d7e2bf42513564b6f41266a1fb` |
| V2 | Divergence from `origin/main` | diverged, ahead 42 / behind 14 (±0 from the header) |
| V3 | The nine identity source files compared to the remote tree | **9/9 blob-identical** |
| V4 | Three `eligible-roster.json` parsed and validated (§4.1) | **all pass**: CIN shape, `IN:CIN:` composition, ISIN Luhn, single `ASSESSABLE` security, `ELIGIBLE`/`null` reason, `foreignIssuer: false`, sectors in `SECTOR_NAMES`, distinct CINs, no fixture self-classification |
| V5 | Listing maps and corporate-action tables | every entry keyed to its own issuer; 0 action records in all three |
| V6 | `O1` recorded anywhere already | **no** — §2's search; no duplicate created |
| V7 | `O1` in the roadmap / tracker at the baseline | 1 (the `PA-01` removal row) / 0 — neither is a decision |
| V8 | IRR approval-mechanism terms in IRR's tracked content | **0** hits for all six terms — IRR does not duplicate IPD's check |
| V9 | IPD cited files exist at the read-only pin | `src/identity/irr_identity_approval.ts` blob `8aced1fe…` (42,722 B); `scripts/provision-irr-identity-sources.mjs` blob `68f9a023…` (30,348 B) |
| V10 | `O3` bundles' own `digests.json` blobs unchanged since the O3 record | `9e59c024…` / `c723f5bf…` / `f16c4b62…` — identical |
| V11 | Untouched-file blob equality against remote, after editing | verified for every path this work did not intend to change |
| V12 | Changed documents | trailing whitespace **0**, tabs **0**, CR **0**; append-only against the remote blobs; no merge markers; every internal cross-reference resolves |

---

## 12. Status

| Item | Status |
|---|---|
| **`O1`** | **DECIDED.** Initial governed population = Infosys Limited, Marico Limited, KEC International Limited; identity supported by the admitted identity records; inclusion implies no financial qualification; Ramki is sole owner for eligibility and additions; IRR maintains the records and IPD retains its approval enforcement |
| **`S2-R1`** | **SATISFIED** as a register act by this record |
| **`S2-R2`** | **OPEN**, optional, unchanged |
| **Stage 2** | Governance gate discharged; the stage's recorded technical verdict is unchanged and not re-asserted |
| **Identity publication / dataset installation / NP-04 mint** | **NOT REPEATED** — nothing was re-provisioned, reinstalled or re-minted |
| **Overall IID readiness** | **NOT READY** |
| **PRs** | None merged, none opened by this work; #562, #563, #566, #515 untouched |

---

*End of decision record. Published additively; the records it cites are unchanged, byte for byte.*

---

## 13. Publication receipt

Published to `arena/53ff9276-iips-review-recovered` as commit
**`842a5ecaa1aa5482721f6363a9a91ba562fc46ee`** (tree `e83ced8f87f4e5a31211049721256bace7640aba`), parent
`ad44838180265673e4b8df2a5a6d8b1fc62efe61`. Published through the GitHub git-data API with `base_tree`
set to the parent tree and `force: false`, so the change is exactly the five intended paths and no local
commit was used.

| Path | Blob | Bytes | sha256 |
|---|---|---:|---|
| `docs/integration/IID-O1-IDENTITY-GOVERNANCE-PA-DECISION-2026-11-16.md` | `55dcaec15a0a847b5fc6e6e017c54b01bec07678` | 25,093 | `55debbda1c5ed9d7fc44bd2bc2b26c9a2a15f1c69ee4e9dc73146c83fa6e0752` |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | `33aec0dbfdaee9c457f0f9aa7f4ce3150ccf4263` | 4,102,267 | `625adac8a0944d3e0cee662deef3f504414f728e6d1acf87b1e8d040006a7852` |
| `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` | `38d8740784192d777b1cfdeeaaa0c889087b8f18` | 107,984 | `557dba0a45af5146592099de61f5f7d214f78c545da674b367b302e61d860f3e` |
| `docs/integration/IID-STAGE-2-READINESS-REASSESSMENT-2026-11-14.md` | `2ac752b8e23e2d5e864fce3a548c45a6d6ea30da` | 52,132 | `c24d2df2c7284b4a16f075f2911e661c41e365b0c71a71feec912e1b135e8898` |
| `docs/integration/IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` | `d9f49521f80d3285bac89e3fbfada8e80e71a362` | 53,143 | `8a80c99aa590c4ecec35b740bf14b805cdab766bc070c0f7ce4a5b740293e4c9` |

Remote read-back verified, independently of the writing session: the commit's parent and tree, the exact
five-file change set with every entry `added`/`modified` and none deleted, and every published blob
decoded from the remote and compared byte-for-byte with the local artifact — **all pass**. A
**second** commit then appends this receipt; it changes this one file and nothing else. The branch head
after both commits and the cumulative read-back are stated in the publishing session's final report.

**What the publication does not include:** no PR, no merge, no IPD change, no code change, no identity
file, no dataset, no approval record. PR #562, #563, #566 and #515 remain open and untouched.

