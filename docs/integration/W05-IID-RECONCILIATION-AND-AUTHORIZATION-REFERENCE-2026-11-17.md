# Snapshot-to-Live W05 — the IID line is reconciled with `main`, and a dataset can name its `O3` record

**Date:** 2026-11-17
**Roadmap item:** W05, "Financial coverage and source rights" (IPD `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`)
**Type:** merge, code, tests and this record. No decision record, manifest or evidence file of the IID line is changed. No dataset was installed or downloaded; tests built datasets in scratch directories only. Nothing was run on the Windows host. IPD was not written.
**Base:** IRR `main` `2b61a50a7aa51e0fc4d5a1a3a208c08ca495823b`; IID branch `arena/53ff9276-iips-review-recovered` at `5bf1167d069a208a0dc3ca4e4df82559cd69d02f`.
**Commits on the branch that carries this record:** merge `4ff29cf560bb6ab1ee7b67478db10ce97fc18817`; authorization reference `37c8f602466e695745a228db72f334c6aa79a8fe`; then this record.
**Earlier record, kept as written:** [W05 status record, 2026-11-16](W05-FINANCIAL-COVERAGE-AND-SOURCE-RIGHTS-STATUS-2026-11-16.md). Items 1 and 2 of its section 8.1 are the work recorded here.
**Evidence folder:** [`evidence/integration/w05-iid-reconciliation-and-authorization-reference-2026-11-17/`](../../evidence/integration/w05-iid-reconciliation-and-authorization-reference-2026-11-17/README.md)

**Result.** Items 1 and 2 of section 8.1 are done in the repository. **W05 is still not complete and is not accepted.** No issuer of the portfolio has a financial dataset, no source's terms have been reviewed, and the two decisions of section 8.2 of the earlier record are open. Merging the branch is the Principal's act.

## 0. Summary

| Question | Answer | Section |
|---|---|---|
| Is the IID line reconciled with `main`? | Yes, by one merge commit: 45 commits, 133 files. Three files conflicted as text; three more places conflicted in meaning | 1 |
| Which classifier decides the dataset class? | `main`'s, from the manifest's rights declaration, on both coverage surfaces. The merged code has no test on provider or licence text | 1.2 |
| Were the rights records changed? | No. Both `O3` records, `PA-01`, both verification files, the candidate manifest and the limitation register are byte-identical to the IID branch | 1.4 |
| Can a manifest name the `O3` record? | Yes, when the operator asks for it and every input bundle is one the record admits, identified by the digest of its bytes | 2 |
| What cannot name it? | The five bundles outside `O3`, a refreshed bundle under the first record, a superseded bundle under the second, an admitted bundle with any byte changed, and any file that is not the record byte for byte | 2.4 |
| Does naming the record change the class, or what may be done with the data? | No. The state is `OPERATOR_ASSERTED`, the class is `OPERATOR_SUPPLIED`, and redistribution is not authorised | 2.5 |
| Are `L-041` and `L-042` closed? | No. Both are `OPEN` in the register, which is unchanged. The disagreement `L-041` describes no longer reproduces | 4 |

## 1. Reconciliation of the IID line

### 1.1 Scope

Branch `arena/53ff9276-iips-review-recovered` held 45 commits that `main` did not have, on merge base `08411bcd6d782a601fe5c82cc9983d076831148d`: 133 files, 113 added and 20 modified. `main` had since gained the W05 classifier (commit `6ae09ac`), the identity validator (commit `7f3f7db`) and, on 2026-11-17, the W-10 DHAN status work (pull request #569). The branch was merged with a merge commit, so its 45 commits keep their identity. Of its 133 files, 119 are byte-identical to the branch on the merge commit. The other 14 are named in 1.2 and 1.3.

### 1.2 Conflicts in text

| File | Resolution |
|---|---|
| `iips-platform/src/investment/coverage/investmentCoverage.ts` | Two hunks conflicted, both on the period type. `main`'s form is kept: `QUARTER` and `QUARTERLY` both count as quarterly. The classifier did not conflict: `financialClass()` answers through `main`'s `classifyDataset()`, and the IID side's substring test on `provider` and `licence` is not restored anywhere. The IID off-vocabulary-sector disclosure is kept |
| `iips-platform/tests/investment/investment-coverage.test.ts` | Both sides' tests are kept |
| Master tracker | IID `§16.284` (NP-04) keeps its number and stands before `main`'s `§16.285`, as that section asks. `main`'s `§16.285` and `§16.286` are byte-identical. The IID `O1` section, also numbered `§16.285` on its branch, is `§16.287` and says so |

Git merged two more files that both sides had changed without a conflict: `docs/OPERATOR_RUNBOOK.md` and `iips-platform/src/investment/ingestion/builder.ts`.

Four IID documents cited the `O1` section as `§16.285`. Each now cites `§16.287` and states the old number: the `O1` decision record (section 10, one table cell), the Stage 2 reassessment (section 14), the Stage 4 coverage readiness record (section 13) and the IID roadmap (section C.3). Nothing else in those four documents changed.

### 1.3 Conflicts in meaning

These merged cleanly as text and failed tests.

| Where | What disagreed | Resolution |
|---|---|---|
| `iips-platform/src/investment/identity/provision.ts`, `iips-platform/tests/investment/identityProvision.test.ts` | `main`'s identity validator requires the `actions` list of `corporate-actions.json` and refuses an empty roster. The admitted `WI8` KEC source records an empty table as `entries: []` with no `actions` | The provisioner shows the validator an explicit empty `actions` for that exact shape only. The validator, the evidence file and the bytes that are digested and published are unchanged. A source with no issuer is now refused when it is read, not at the merge; one test was rewritten for that and one was added for the adapted shape and its limits |
| `iips-platform/scripts/riv-head-revalidation.ts`, `frontend/server/investment/cli/rivHeadRevalidation.test.ts` | Both pinned the `L-041` disagreement between two classifiers, which `main`'s classifier removed | The committed record of that observation, `verification/dataset-class-divergence.json`, is kept byte for byte and is no longer re-emitted; a test pins its SHA-256. At head both paths must answer `UNKNOWN` for the three committed manifests, and the generator refuses otherwise |
| `frontend/server/investment/iidStage4ServedCoverageRoute.test.ts` | It expected two notes; `main` adds the statement of the dataset class | It expects three and asserts the third |

### 1.4 Preserved byte for byte

Each file below has the same Git blob on the merge commit as on the IID branch.

| File | Git blob | SHA-256 |
|---|---|---|
| `docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` | `be627a990c13f6fd259819b9c4acda836870cd47` | `25d8ba88248c138ca41f82874dca10db4e8605cba19c690a7a8a3740b7ee55ca` |
| `docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md` | `e73a3f8cc526604970178193f2d6774bc94c1bf1` | `ab476ecb195b6081296c85f0fe4b34670ee1857b2c6fb8d8bd66d82be2e4daed` |
| `docs/integration/IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md` | `cd9198a0ba88f9158e7faf2ffda5e02c4eb11210` | `9f7f835b6e3139bff6c44bb35c5f7da001634a9ff16ba7508a459229dcb12148` |
| `docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` | `e3c2517f1d8ad9d86562ccbac313fd901c824b35` | `79e13cbeaf32259a86a140bba20129dab515f31c9c9c7a1aad5d2683c369f57d` |
| `evidence/integration/iid-o3-s4-r3-readmission-2026-11-14/verification.json` | `a9f4a297fc20bb39a5bea8258c9dd6152f1ccabb` | `c19e273f1e3badacc68231c02e5400c0f59ce08c074508ce112bcfd11ead856b` |
| `evidence/integration/iid-s4-r3-candidate-build-2026-11-14/verification.json` | `cf13f88d40a3a6d6f3207ba52203e333568ff5da` | `616521a2ffbae3c3ac70159d0c9e4cde7964312ed0d1718b7581447e9cc43b39` |
| `evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/runs/candidate-manifest.json` | `1b655f9739620dacb2d93a0b21a90e53bb612633` | `b921741942d4674ed968f2938917b588b07ae9dc6db12f2998cb7361727d90ba` |

The four bundle directories have the Git trees that the `O3` record of 2026-11-14 names: `S4-R3-FILING-REFRESH-2026-11-14` `0d77f2b026e905c0c66e9039e91596a11fe57139`, `REL-1-INFOSYS-2026-11-06` `c777e1e8a1a713028eb622a8b545857299dbef21`, `WI7-CONSUMER-MARICO-2026-11-07` `41888478a5008c22cce3d82095040d75ff4d67ea`, `WI8-INDUSTRIALS-KEC-2026-11-07` `b2cd94816f4e1968107402be8a44fb6e20bc82e4`. No authorization was added or re-issued.

### 1.5 Whitespace

Nine IID files carry trailing whitespace that `git diff --check` reports, and the static check runs it over every changed file. Five of the nine are evidence of the S4-R3 filing refresh whose SHA-256 the bundle's own ledger records, so their bytes cannot change. Two new files, `docs/integration/.gitattributes` and `evidence/real-issuer/.gitattributes`, exempt those nine exact paths from whitespace-error detection. No file content was edited for this, and the root `.gitattributes` is not touched.

### 1.6 Pull request #562

PR #562 holds the first 24 of the 45 commits. GitHub marks a pull request merged once its commits are on `main`, so it will show as merged when this branch is. Nothing was done to it.

**Correction, added on 2026-11-17 after the merge.** PR #562 is not shown as merged, and it does not hold the same commits as the IID branch. See section 8.2. The paragraph above is kept as it was written.

## 2. A dataset can name its `O3` record

### 2.1 The rule

The ingestion CLI takes one new option, `--authorization-record <file>`. It is optional and may be repeated. With it, the operator names the decision record the inputs rest on. The run then writes a rights declaration that names that record instead of the input directory. Before anything is read from or written to the destination, the run checks the claim:

1. **The named file must be one of the records the build lists, byte for byte.** The file is hashed; its name and location decide nothing.
2. **Every input bundle of the run must be an input a named record admits.** An input is identified by its input digest, which the run computes from the bytes of the files it consumed, and by nothing else.
3. **Where a record states the dataset that an admitted input produces alone, or that an admitted set of inputs produces together, the build must reproduce it.**
4. **Every named record must admit at least one bundle of the run.**

Nothing is matched by directory, issuer or provider text. A run that fails any of the four stops with exit status 1 and prints the refusal code. It does not fall back to the directory basis, because that would write a declaration the operator did not ask for.

Nothing is chosen either. Each named record is cited for every bundle of the run that it admits, so a bundle that two named records admit is listed under both. The references are written in the order of the record list. The declaration therefore depends on the inputs and on which records were named, and not on the order in which they were named.

Without the option the CLI writes exactly what it wrote before, byte for byte.

### 2.2 The records and what each admits

The list is `iips-platform/src/investment/fundamentals/authorizationRecords.ts`. It is closed, and it is a transcription that tests check against the committed records and bundles.

| Record | Pinned by SHA-256 | Inputs it admits | How the record fixes their bytes | Datasets it states |
|---|---|---|---|---|
| `O3`, 2026-11-13, `docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` | `25d8ba88…55ca` | Infosys `REL-1`, Marico `WI7`, KEC `WI8` | **Ledger.** Its section 6.1 names each bundle's ledger, `digests.json`, by Git blob. The ledger gives the SHA-256 of each input file, and the input digest is computed from those. The record states no input digest itself; the concept did not exist when it was written | Section 6.3: one for `WI7`, one for `WI8`, two for `REL-1` (`dataset` and `dataset-v1`), each for that bundle alone |
| `O3`, 2026-11-14, `docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md` | `ab476ecb…daed` | The Infosys `REL-1` input and the refreshed Marico and KEC inputs | **Stated.** Its section 3.2 states each input digest and the SHA-256 of each consumed file | Section 3.1: the S4-R3 candidate, for the three inputs together |

The tests prove each entry rather than trust it. For the first record they recompute each input digest from the ledger, check that the ledger in the repository has the Git blob the record names, and check that each bundle alone still produces a dataset the record states. For the second they recompute each input digest from the record's own file table and check that the three inputs together produce the candidate.

Four points about the list.

- **The Infosys input is in both lists.** The second record lists it among its "exact admitted identities" (section 3.2), retains it unchanged, and says it "remains covered by the original O3 admission". Both statements are carried: a run that names both records cites both for that bundle.
- **One digest the second record states is left out on purpose.** It quotes `sha256:3ad82918…` as a "historical host pin" and says it did not rebuild it. That is a mention, not an admission. This is why the admitted digests are transcribed and are not read from the record's prose at run time.
- **`PA-01` is not listed.** It is an operating policy. It admits nothing by digest and says of itself that it "is not a licence or rights determination".
- **A new decision record is added by a new entry, with its own test.** Which decision admitted a dataset is not inferred.

Because the two record files are pinned by their bytes, `docs/integration/.gitattributes` sets `text eol=lf` for those two exact names. A Windows checkout that converts line endings would otherwise rewrite them, and the CLI would refuse the rewritten file as `RECORD_NOT_KNOWN`. The blobs in the repository are unchanged by this.

### 2.3 What the manifest carries

For the S4-R3 candidate inputs and the record of 2026-11-14, the rights declaration reads as follows. The dataset version is `sha256:bdfb2527…`, the same as without the option, because the declaration is outside the content digest.

```json
"sourceRights": {
  "authorizationReferences": [
    {
      "decision": "O3",
      "decisionDate": "2026-11-14",
      "independentSourceRightsVerification": "NOT_CLAIMED",
      "inputDigests": ["sha256:da0253c8…", "sha256:31d8e503…", "sha256:22ea5018…"],
      "instrument": "OPERATOR_DECLARATION",
      "operativeText": "O3 — ADMITTED for local personal investment analysis.",
      "record": "docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md",
      "recordSha256": "ab476ecb195b6081296c85f0fe4b34670ee1857b2c6fb8d8bd66d82be2e4daed",
      "redistribution": "NOT_AUTHORISED",
      "restrictions": ["Local personal use only", "Single user; local host only.", "No commercial or production deployment.", "No SaaS, multi-user, hosted or service-bureau use.", "No redistribution", "No re-licensing or transfer"]
    }
  ],
  "basis": "operator’s declaration recorded as decision O3 of 2026-11-14 in docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md (sha256 ab476ecb…daed), which admits 3 input bundle(s) of this dataset by digest",
  "note": "operator attestation over the operator’s own input files; not an independent verification of any third party’s terms",
  "state": "OPERATOR_ASSERTED"
}
```

The digests are shortened here; the manifest carries them in full. `instrument`, `independentSourceRightsVerification` and `redistribution` each have one permitted value. They are written out because they are what a reader would otherwise have to assume, and they are closed so that a manifest cannot use this member to claim a verification, or a right to redistribute, that no record grants. The restrictions are the record's own labels, in the record's order. The declaration names no directory, so it is the same in every checkout.

With both records named, the same run writes two references: the record of 2026-11-13 with the Infosys input, and the record of 2026-11-14 with all three.

### 2.4 What is refused

| Case | Answer |
|---|---|
| A bundle outside `O3`: `WI2`, `WI3`, `WI5`, `WI6A-S2`, `WI7-L038`, under either record or both | Refused, `INPUT_NOT_ADMITTED` |
| A refreshed Marico or KEC input under the record of 2026-11-13 | Refused. That record says its admission does not extend to a successor |
| The superseded `WI7` or `WI8` input under the record of 2026-11-14 | Refused. That record admits the refreshed inputs |
| An admitted bundle with one reported figure changed | Refused under both records |
| An admitted bundle with any other byte changed, such as a trailing newline that leaves the dataset identical | Refused under both records. The bundle is re-digested, and both records ask for a fresh declaration then |
| An admitted bundle together with a bundle outside `O3` | The whole run is refused. There is no partial citation |
| An admitted input that does not produce the dataset a named record states | Refused, `DATASET_NOT_STATED`. It cannot happen with the committed bundles and the current build; the check is there for a later build |
| A file that is not a listed record: `PA-01`, an edited copy, a copy with rewritten line endings, a missing file | Refused, `RECORD_NOT_KNOWN` or `RECORD_UNREADABLE` |
| A record named twice | Refused, `RECORD_CITED_TWICE` |
| A record that admits none of the bundles of the run | Refused, `RECORD_ADMITS_NO_INPUT` |
| The option without a file | Usage error. The run is not silently treated as uncited |

In every case the destination is byte-identical afterwards and no publication marker is left. An existing dataset at the destination is untouched.

### 2.5 What does not change

- **The state and the class.** A cited record is the operator's own declaration, so the state is `OPERATOR_ASSERTED` and the class is `OPERATOR_SUPPLIED`. The class is decided by the state alone. Naming a record cannot raise it, and there is no "approved" or "verified" state.
- **Redistribution.** `licence` still reads `operator-supplied; not redistributable`. Each reference carries `redistribution: NOT_AUTHORISED` and the record's restriction "No redistribution". The decision of section 8.2, item 1, of the earlier record is as open as it was.
- **Installation.** Both records say that admission installs nothing. The option builds a dataset in the directory it is given, as the CLI always did. It is not evidence that anything was installed, and it relaxes no guard: `assertNoSilentSourceLoss` and the installer's expected digest apply to a cited dataset unchanged.
- **The output without the option.** A build of the candidate inputs without the option reproduces the committed candidate manifest byte for byte, apart from the checkout that its audit paths name.

### 2.6 Readers

A citation is checked when it is written and every time it is read. It is refused, never repaired.

- `assertSourceRights` carries a citation and refuses one that is malformed, names a record the build does not list, alters the record's identity, restrictions or fixed limits, cites an input the record does not admit, or is not in the order of the record list. Only `OPERATOR_ASSERTED` may cite, and the basis must be exactly the cited records.
- `sourceRightsOf` also refuses a citation that does not agree with the manifest that carries it. Every recorded bundle must be cited, and each reference must list every recorded bundle its record admits, in the recorded order; a single-bundle manifest has that one bundle under every reference. Where a record admits every input of the dataset and states the dataset those inputs produce, the manifest must be that dataset, whether or not another record is cited as well. The reader recomputes the dataset version from the files, so this check is bound to the content. A valid citation pasted onto another dataset is refused, also when the pasted manifest's provenance is rewritten to match.
- The coverage read model serves the citation with the declaration and adds one note after the class statement. A citation that does not check out is not served: the route answers 503.
- `verify-installed-dataset.ts` adds the check `authorization-references`, and `install-verified-dataset.ts` adds `candidate-authorization-references` and carries the citation verbatim. Both add the check only for a dataset that cites a record. A dataset that cites none reports exactly the checks it reported before.

Two limits are stated here because they bound what a reader can prove.

- **An input digest cannot be recomputed from a dataset**, because the inputs are not in it. Where no cited record states a dataset for the inputs, the citation is as reliable as the manifest that states it, like the manifest's other audit fields. That is the case for a subset of the candidate's inputs under the record of 2026-11-14, for several bundles together under the record of 2026-11-13, and for a dataset whose bundles rest on different records. The ingestion run itself is not in that position: it computes every digest from the bytes it reads.
- **The declared grammar is not part of the check.** `--dataset-schema` is outside the dataset version by the product's own digest scope, so the candidate inputs produce `sha256:bdfb2527…` under either grammar and can name the record under either. Both records admit "at the exact digest"; the record of 2026-11-14 also notes the candidate's schema as `IIPS_INVESTMENT_FUNDAMENTALS_V1`, and that note is not enforced.

### 2.7 The committed inputs

Computed by [`build-citation-matrix.mts`](../../evidence/integration/w05-iid-reconciliation-and-authorization-reference-2026-11-17/build-citation-matrix.mts) with the product's own loader, digests and check; output in [`citation-matrix.json`](../../evidence/integration/w05-iid-reconciliation-and-authorization-reference-2026-11-17/citation-matrix.json). Digests are shortened. "Ledger" and "stated" say how the record fixes the input's bytes (section 2.2). Each answer is for that input alone under that record alone.

| Input directory under `evidence/real-issuer/` | Input digest | Dataset version alone | `O3` 2026-11-13 | `O3` 2026-11-14 |
|---|---|---|---|---|
| `D2-NIL-BY-DISCLOSURE-2026-11-06/input` | `da0253c88139…` | `ca29c8357fd3…` | admitted (ledger) | admitted (stated) |
| `REL-1-INFOSYS-2026-11-06/ingest-input` | `da0253c88139…` | `ca29c8357fd3…` | admitted (ledger) | admitted (stated) |
| `S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec` | `22ea50186973…` | `65ad58cd3f80…` | refused | admitted (stated) |
| `S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico` | `31d8e5039c50…` | `4d2a54a97cbd…` | refused | admitted (stated) |
| `WI2-PRICE-OBSERVATION-2026-11-06/ingest-input` | `e82dffd91f95…` | `0ef4299dde50…` | refused | refused |
| `WI3-BORROWINGS-NIL-2026-11-06/ingest-input` | `470f388a3e23…` | `21cf25222fcd…` | refused | refused |
| `WI5-PREFERENCE-CAPITAL-2026-11-07/ingest-input` | `d071b95c91e1…` | `7aa6e3f90ef0…` | refused | refused |
| `WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07/ingest-input` | `3c816ca42529…` | `a71498daabb3…` | refused | refused |
| `WI7-CONSUMER-MARICO-2026-11-07/ingest-input` | `725e8eadc10b…` | `04c96303e269…` | admitted (ledger) | refused |
| `WI7-L038-DEBT-COMPLETENESS-2026-11-07/ingest-input` | `21d77ce775be…` | `433358f39686…` | refused | refused |
| `WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input` | `6a62f071ae17…` | `0df73eadcc3a…` | admitted (ledger) | refused |

Eleven directories hold a roster. Six can name a record and five cannot. `D2-NIL-BY-DISCLOSURE-2026-11-06/input` is a byte-identical copy of the `REL-1` input (the same two files, the same SHA-256 each), so it has the same input digest and the same answers. The identity of an input is its bytes, not its directory, in both directions.

## 3. Statements of the record of 2026-11-16 that this record replaces

The earlier record is not edited. These statements were correct for `main` at `0641953`. From the merge of this branch they read as follows.

| Section | Statement of 2026-11-16 | From the merge of this branch |
|---|---|---|
| 0, 3 | The `O3` records, `PA-01` and the candidate manifest are not on `main` | They are on `main`, at the blobs of section 1.4 |
| 2 | "The stamp does not distinguish … the CLI has no option to state another basis" | The CLI has `--authorization-record`. Without it the stamp is the same as before |
| 2 | Five dataset manifests are committed, all `UNKNOWN` | The five are unchanged and still `UNKNOWN`. A sixth manifest file is now on `main`, `S4-R3-FILING-REFRESH-2026-11-14/runs/candidate-manifest.json`. It is run output, not a dataset directory, and declares `OPERATOR_ASSERTED` with the directory basis |
| 2 | Eight `ingest-input` directories | Ten inputs under `ingest-input` directories, with the refreshed Marico and KEC inputs; eleven directories hold a roster (section 2.7) |
| 8.1, item 1 | Reconcile the branch with `main`, keeping `classifyDataset` on both coverage surfaces, "then record `L-041` as resolved" | Reconciled. `L-041` is not recorded as resolved (section 4) |
| 8.1, item 2 | Let the operator state the rights basis so a manifest can name the `O3` record | Done (section 2) |

Section 8.1 item 3, section 8.2 and section 8.3 of the earlier record stand as written.

## 4. `L-041` and `L-042`

The limitation register is byte-identical to the IID branch. Its status cells read `OPEN (contract decision: read-model owner)` for `L-041` and `OPEN (contract decision: register owner + identity-contract owner)` for `L-042`, and a test now reads them from the register.

`L-041` records that two classifiers disagreed on the same committed manifests: the assessment path answered `UNKNOWN` and the coverage path answered `OPERATOR_SUPPLIED`. On the merged code both paths go through `classifyDataset` and both answer `UNKNOWN` for those manifests. The observation is kept as recorded, and the disagreement no longer reproduces. Changing the status cell is a decision about the register. It is the Principal's, and it was not made here. `L-042` is not affected by this work.

## 5. What remains

| # | Item | Whose |
|---|---|---|
| 1 | Merge the branch | The Principal |
| 2 | Decide whether to close `L-041` in the register | The Principal |
| 3 | The installed dataset still has the directory basis. To make its manifest name the record, build a candidate with the option and publish it with the installer (`docs/OPERATOR_RUNBOOK.md` section 18.4). The dataset files and version are identical either way. Not performed | The operator, optional |
| 4 | The W05 dossier for the dataset installed on the host | Needs the host capture, IID item `R-2` |
| 5 | The two decisions of section 8.2 of the earlier record: the public repository against "not redistributable", and the source of statements for the portfolio's issuers | The Principal |
| 6 | `iips-platform/tests/investment/s4R3CandidateBuild.test.ts` compares one manifest that contains absolute paths, so its first test passes only in a checkout at the path where the candidate was recorded. This is unchanged from the IID line. Section 2.5, last point, is the same guarantee without the path | Repository, no decision needed |

## 6. Validation

All runs are in the sandbox, on the tree of commit `37c8f602`.

| Check | Result |
|---|---|
| `iips-platform` `npm run typecheck` | 0 errors |
| `iips-platform` `npm test` | 678 of 678 |
| `iips-platform` `npm run test:iid` | 1,450 of 1,450 in a checkout at the recorded path; 1,449 of 1,450 elsewhere (item 6 above) |
| `iips-platform` `npm run lint:rosters` | PASS |
| `frontend` `typecheck`, `typecheck:replay-server`, `typecheck:investment-server` | 0 errors each |
| `frontend` full Vitest suite | 3,073 passed, 1 skipped, 211 files |
| `frontend` `npm run build` | passes |
| New tests | `authorizationRecords.test.ts` 59, `authorizationReferenceIngestion.test.ts` 36, `w05AuthorizationReferenceCoverageRoute.test.ts` 4 |
| Fault injection | Twenty-eight deliberate faults in the implementation, one at a time: for example a record list that admits the historical host pin, a bundle matched without its digest, a bundle given to the first named record only, a citation dropped instead of refused, a restriction left unchecked. Twenty-seven failed at least one of the new tests, twenty of them at least two. The one that did not is the early copy, in the CLI, of the dataset check the writer repeats; no committed input can make the two differ. All were reverted |
| IRR static check, on the tree that carries this record | The validator compiles; the artifact-classification and workflow-trigger tests pass; the source, evidence and tracker validation passes; `git diff --check` against `main` is clean. The release-asset step needs the hosted runner |

`iips-platform` has no hosted check. The hosted `CI` and static checks run on the pull request.

## 7. What this record did not do

It did not change any decision record, manifest, dataset or evidence file of the IID line, and it issued no authorization. It did not close a limitation. It did not install, replace or verify anything on the Windows host, and it did not read or write `C:\iips-data`. It did not download anything. It did not write IPD. It did not merge a pull request.

## 8. Read-back on `main`, and one correction (added on 2026-11-17, after the merge)

A later commit added this section and the pointer at the end of section 1.6. Sections 0 to 7 are otherwise as merged. Everything below was read from GitHub on 2026-11-17 between 08:24 and 08:47 UTC, and from a full clone fetched in that time.

### 8.1 Pull request #574 on `main`

| Item | As read |
|---|---|
| Pull request | #574, merged on 2026-11-17 at 08:22:47 UTC by `ramkivs`, as a merge commit |
| Merge commit | `735770dfd30d6806fc97e348417da568b6b0ed33`, the tip of `main` when read. Its parents are `dc3e4f9a6559377391e32aabf9fa5586c37d0fcc`, which was `main` before, and `889ec4e1f44b50758b40d9e586d5a7a1a333a1fe`, the head of the pull request. GitHub reports its signature as verified |
| Tree | `b6a461a1bddd714a17912c5b27176513b9ccf480`. This is the tree of `refs/pull/574/merge` (`289a316ab21fbfe7d594f3f7d5403332f792a391`), the commit that both hosted checks of the pull request ran on |
| Commits | All 48 commits of the pull request are ancestors of `main`: the 45 IID commits, the merge `4ff29cf560bb6ab1ee7b67478db10ce97fc18817`, the authorization reference `37c8f602466e695745a228db72f334c6aa79a8fe` and this record's commit `889ec4e1f44b50758b40d9e586d5a7a1a333a1fe` |
| Tracker §16.288 | Present. The tracker is blob `f97a858efcf26b329f0bfeeba7c5dea4183989ee`, as at the head of the pull request. Its last line names §16.289 as the next free section |
| This record, as merged | Blob `ec70d67e9f0c66f1cdec8dbe69296b750bba0b4f`, as at the head of the pull request |
| Evidence folder | Tree `f96cd76e45c3d67ab981f124013051d370c13dab`, three files, as at the head of the pull request |
| `main` against the head of the pull request | Two documents differ. Both came with PR #572 and PR #573 (W-11), which `main` had before the merge |
| Hosted checks on the pull request, head `889ec4e1` | `CI`, run 44043819879: success. `CAP-03 Revision 7 IRR-only static checks`, run 44043819805: success |
| Hosted checks on the push to `main`, `735770df` | `CI`, run 44046231737: success. `CAP-03 Revision 7 IRR-only static checks`, run 44046231673: success |

The base at the top of this record, `2b61a50a7aa51e0fc4d5a1a3a208c08ca495823b`, is the commit the branch was made from. `main` had moved to `dc3e4f9a` by the time of the merge. The hosted checks of the pull request ran on the merge with that later `main`.

### 8.2 Correction: pull request #562 is not shown as merged

Section 1.6 and tracker §16.288 say that PR #562 holds the first 24 of the 45 commits and will show as merged. Both parts are wrong. PR #562 was read as `OPEN` after the merge, and it will not change by itself.

| Item | As read |
|---|---|
| PR #562 | `OPEN`, not merged. Head branch `arena/94a53bb3-iips-review-recovered` at `f98732e1861ff8b384183c30c11e4d1adbc2dc95`: 24 commits made from `a835d4af019ab4f677ab238ec42d44326f06a771`, 73 files |
| The IID branch | It does not contain those 24 commits. It contains the same 24 changes, made again from `08411bcd6d782a601fe5c82cc9983d076831148d`, as its commits `1a89d865` to `542e0fe4df84bc2e0dbc262da8ab2aa9ab0c05a7` |
| Same changes | `git range-diff a835d4af..f98732e1 08411bcd..542e0fe4` pairs the two series one to one, 24 of 24, with no difference in any patch. The 73 files have the same blobs at `f98732e1` and at `542e0fe4` |
| Why GitHub does not mark it | The commit ids differ because the parents differ. GitHub marks a pull request merged when its head commit can be reached from the base branch. `f98732e1` is not an ancestor of `main` |
| Is anything of PR #562 missing from `main`? | No. `main` descends from `542e0fe4`. Of the 73 files, 61 are byte-identical on `main`. The other 12 were changed by later commits, all of them on `main` |
| Can it still be merged? | No. GitHub reports `mergeable: false`, state `dirty`. A trial merge into `main`, computed and not written anywhere, conflicts in 10 files |

The IID record `IID-S4-R3-WINDOWS-HOST-BUILD-AND-VERIFICATION-EVIDENCE-2026-11-15.md`, section 7.1, had already recorded that the two branches have different lineage. Section 1.6 did not take it into account.

PR #562 is superseded in content and stays open until someone closes it. Nothing was done to it. Closing it is the Principal's act.

### 8.3 One IID commit is not on `main`

The IID branch gained commit `0f9b9ae47769976e6ee60d7c245870da5802a255` on 2026-11-17 at 08:13:58 UTC, after the branch of PR #574 was built and published. It is not part of PR #574 and it is not an ancestor of the merge commit. "45 commits" in this record means the IID branch at `5bf1167d069a208a0dc3ca4e4df82559cd69d02f`. It is the only commit of the IID branch that `main` does not have. It changes five files: two tests and three IID records of Stage 4. A separate pull request offers it. This record does not describe it.

### 8.4 What this section does not change

No decision record, manifest, dataset or evidence file is changed, and no authorization is issued. `L-041` and `L-042` are `OPEN` in the register. The tracker is not changed and no section number is used. W05 is in progress, not complete and not accepted. Nothing was run on the Windows host, and IPD was not written.
