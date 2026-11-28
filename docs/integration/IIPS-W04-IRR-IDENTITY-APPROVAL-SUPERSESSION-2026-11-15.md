# Snapshot-to-Live W04 — identity provisioning approval: superseding approval `W04-D1-20261115-01` for the published P7 manifest

**Record ID:** `IIPS-W04-IRR-IDENTITY-APPROVAL-SUPERSESSION-2026-11-15`
**Date:** 2026-11-15 (UTC)
**Roadmap item:** W04, "Actual security and issuer coverage". The roadmap of record is IPD's `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`.
**Type:** governance record with validation evidence. No IRR source, test, workflow or data file is changed. **The approval record itself is not in this repository** (section 5.3).
**Repositories read:** IRR `ramkivs/iips-review-recovered` at `main` `08411bcd6d782a601fe5c82cc9983d076831148d`. IPD `ramkivs/iips-production-market-data` at `main` `901e4791e271cafdb777d56f9f66f6867b3f60c6`, read only, in scratch clones. Nothing was written to IPD.
**Evidence:** [`evidence/integration/w04-irr-identity-approval-supersession-2026-11-15/`](../../evidence/integration/w04-irr-identity-approval-supersession-2026-11-15/README.md)

**Superseding approval: established on the Principal's instruction and decisions.** Record `W04-D1-20261115-01`, approved at `2026-11-15T19:37:36Z`, valid until `2026-11-16T18:29:59Z`, record file SHA-256 `70d49544845120755adff9b5f39bc0de216c6a983fa0dbbdcd613ab9b26b440d`. Section 8 states how the making of this record departs from the approver's procedure.
**Check against the approval mechanism: PASS**, in a non-production preflight in the sandbox. Nothing was installed anywhere.
**Overall W04 is unchanged: PARTIALLY COMPLETE, not accepted.** This record does not claim W04 acceptance.

## 0. Summary

| Item | Result | Label |
|---|---|---|
| Where the approval mechanism is | IPD code. IRR has no approval mechanism and no approval record. | R |
| Existing approval `W04-D1-20261114-01` | Unchanged. The file is on the host; it was not read here. It lapsed at `2026-11-14T18:29:59Z`. | H |
| The Principal's authorization | An instruction and four decisions given in the session (section 4) | P |
| New approval | `W04-D1-20261115-01`, record file SHA-256 `70d49544…b440d`, 4,374 bytes | P, R |
| Difference from the original | P7 manifest digest and IPD tool commit. Also, necessarily, the identifier, the two times and the statement. Everything else is the same. | R against H |
| Record against a generation staged with the published manifest | `RESULT: PASS`, exit code 0 | R |
| Same record against a generation staged with the previous manifest | Refused, `GENERATION_MISMATCH`, exit code 7 | R |
| Independent re-run from fresh clones | `RESULT: PASS`; the review record is byte-identical with the first run | R |
| Installation | None. Not on the host, not in the sandbox. | R |
| Old-manifest `GENERATION_MISMATCH` dependency | Resolved in the preflight, under the conditions of section 7.2 | R |
| W04 | Not accepted | |

## 1. How to read this record

| Label | Meaning |
|---|---|
| **R** | Verified for this record: read from tracked repository content, or run in the sandbox. The transcripts are in the evidence directory. |
| **H** | Host fact as recorded in IPD's dated records, which state it as reported by the operator. Not re-read here. |
| **P** | Decided by the Principal in the session of 2026-11-15. |

## 2. Investigation: the mechanism, the record, the requirements

### 2.1 The approval check is IPD code (R)

| Item | Value |
|---|---|
| Check | `src/identity/irr_identity_approval.ts` in IPD, function `evaluateIdentityApproval` |
| Record schema | `IPD_IRR_IDENTITY_APPROVAL_V2` |
| Policy | `IPD-IRR-IDENTITY-APPROVAL-POLICY-2`, decision `IIPS-W04-D1`, one approver: `PROGRAM_AUTHORITY_RAMKI` (`Ramki`) |
| Command line | `scripts/provision-irr-identity-sources.mjs`: `review`, `check-approval`, `install` |
| Governing records | IPD `docs/integration/IIPS-W04-IDENTITY-PROVISIONING-APPROVAL-ENFORCEMENT-2026-11-13.md` (revision 2) and `IIPS-W04-IDENTITY-PROVISIONING-DECISIONS-D1-D4-2026-11-13.md` |

It is called "IRR identity approval" because it approves the installation of IRR's identity sources. It is not in IRR.

### 2.2 IRR has no approval mechanism (R)

- IRR's identity loader, `iips-platform/src/investment/identity/sources.ts`, reads three files from `${IIPS_DATA_DIR}/investment/identity`: `eligible-roster.json`, `listing-map.json`, `corporate-actions.json`. It reads no approval, no receipt and no P7 manifest.
- A search of the tracked content of IRR at `08411bc` for `W04-D1`, `IDENTITY_APPROVAL`, `IIPS-W04`, `p7ManifestSha256` and `GENERATION_MISMATCH` returns nothing.
- `governance/` holds four engineering-standards documents. None defines an approval record.
- IRR names IPD's roadmap as the source of truth for the W items (`IIPS-CURRENT-PORTFOLIO-STAGE-2-IRR-RECORD-2026-11-10.md`, lines 4 and 5). IRR's own master tracker has no W04 entry.

### 2.3 The existing record is in no repository (H)

IPD's host-completion record of 2026-11-14 says of `W04-D1-20261114-01`: "The record is kept on the host outside both checkouts. Its content is not published." The sandbox cannot reach the host. The record was therefore not read, and nothing done here could change it.

### 2.4 Requirements that bear on a new record (R)

Sources: the enforcement record of IPD (sections 3, 4, 5, 8 and 9), the header of the command-line script, and the code of the check.

| # | Requirement | How this record stands to it |
|---|---|---|
| 1 | The schema is closed. Every field is required; an unknown field is refused as `APPROVAL_MALFORMED`. | Met. The record has the twelve fields of the schema and no other. |
| 2 | The scope is fixed by the policy. A record cannot widen it. | Met. The scope block equals the policy's. |
| 3 | One approver, Ramki. | Met. |
| 4 | The approver chooses the review date. Renewal is a new record. | Met. The Principal chose it (section 4.2). |
| 5 | The record names the IPD commit the tool runs from, and the IRR commit whose loader accepted the files. Any new commit of either host checkout needs a new record. | Met for the commits named in section 5.1. |
| 6 | The record is kept on the host, outside both checkouts. The install receipt carries its SHA-256. | Met. The Principal decided to keep the file off the repository (section 4.2, decision 4). |
| 7 | `check-approval --approval <record> --staging <staging>` must report `RESULT: PASS`. | Met (section 6). |
| 8 | No test holds a record in Ramki's name. | Met. The mechanism demonstration of section 6 uses IPD's fictitious test policy. |
| 9 | The review is run on the host, with the host checkouts at the commits that are to run. "The commit to state is the one `review` prints on the host at the time of the review". | **Departure.** The review was run in the sandbox. Section 8, D-1. |
| 10 | The approver writes the record. "No command creates, completes or infers an approval." The statement is in the approver's own words. | **Departure in form.** The agent typed the record from the Principal's decisions. The agent drafted the statement and the Principal adopted it. Section 8, D-2. |

### 2.5 What the instruction assumed, and what was found

The instruction speaks of an IRR approval mechanism, of an existing approval record to inspect, and of IRR conventions for such records. None of the three exists in IRR. The consequences:

- "Established conventions" are those of the IPD enforcement record. They were followed, with the two departures above.
- The record has no field for a supersession, for the P7 pipeline commit or for the Principal's authorization. These are recorded in this document and in [`principal-authorization.json`](../../evidence/integration/w04-irr-identity-approval-supersession-2026-11-15/principal-authorization.json).
- What IRR can hold is this record and the validation evidence. That is what is published here.

## 3. The existing approval, preserved

Values as IPD records them (H; host-completion record of 2026-11-14, sections 2.1 and 2.2):

| Item | Value |
|---|---|
| Identifier, status | `W04-D1-20261114-01`, `APPROVED` |
| Approver | `PROGRAM_AUTHORITY_RAMKI` |
| Approved at; review date | `2026-11-14T04:57:48Z`; `2026-11-14T18:29:59Z` |
| SHA-256 of the record file | `bf5d6918e1245d65fe3e26406537585e28aa5ba6b2e055c79da5c9975177ad69` |
| IPD tool commit | `fff4829db5f8cd2863965e64e4650a58f48f82b7` |
| IRR commit of the accepted gate | `08411bcd6d782a601fe5c82cc9983d076831148d` |
| P7 manifest SHA-256 | `13bd2ef18b3dc79ed3d78e78126c4c4ee431e83665847bcb948f6184e14078bc` |
| Accepted | Twelve limitations by name and two withheld records |

**It was not opened, edited, renewed, revoked, replaced or deleted.** Whether the file on the host still has the digest above was not verified; the host is not reachable from here.

It authorizes no new installation of a generation made with the published manifest, for three independent reasons. Each is a refusal of the unchanged check:

1. Its review date has passed: `APPROVAL_EXPIRED`.
2. It binds P7 digest `13bd2ef1…`, and such a generation carries `69a918f7…`: `GENERATION_MISMATCH`.
3. It binds tool commit `fff4829`, which tracks the previous manifest (R). A checkout that tracks the published manifest is at another commit: `IPD_TOOL_COMMIT_MISMATCH`.

It stays what it was: the record under which the installation of 2026-11-14 was made.

## 4. The Principal's authorization (P)

### 4.1 The instruction

Restated from the session; the instruction's own wording is not reproduced here.

- No separate authorization is required for this approval action. A new, superseding approval for the published P7 manifest is authorized.
- Published manifest: SHA-256 `69a918f78791114e8fb036ddfd2a2005facdddf785a7496bc28f541fd4964769`, pipeline commit `325266d684f857a377d55b147e7306e02c7a495a`, 4,680 qualified mappings.
- Existing approval: `W04-D1-20261114-01`, bound to `13bd2ef1…`. It is to be preserved unchanged.
- The scope, restrictions and conditions of the original are to be preserved except for the superseded manifest binding.
- Not authorized: inventing approval fields, bypassing validation or fail-closed behaviour, changing the manifest, modifying IPD, modifying portfolios, holdings or identity assignments, widening the scope, production provisioning or deployment, claiming W04 acceptance.

### 4.2 The blocker reported, and the four decisions

The record must state three things that no record supplies and only the approver can decide: the review date, the statement, and the IPD tool commit. The agent reported this before writing anything and put four questions. The answers arrived at `2026-11-15T19:37:36Z` (sandbox clock).

| # | Question | Decision | Effect |
|---|---|---|---|
| 1 | Review date | `2026-11-16T18:29:59Z`, the end of 16 November in IST. The original used the same pattern. | `reviewDateUtc` |
| 2 | IPD tool commit | `901e4791e271cafdb777d56f9f66f6867b3f60c6`, IPD `main` at the time | `subject.ipdToolCommit` |
| 3 | Approver statement | The full draft, adopted as shown | `approver.statement`; SHA-256 of the text `8204ae35d6270d78bb7c3c6346278e425a5468a840aaff8777c99a3247c111d8`, 927 characters. The text is not published. |
| 4 | Publication | "Keep the JSON off the repo": follow the existing convention and publish the document and evidence with the record's SHA-256 only | The record file is not committed. |

The questions as put, the options offered and the options selected are in `principal-authorization.json`.

### 4.3 Who did what

- **The Principal decided** that there is a new approval, what it supersedes, its review date, its tool commit, its statement and where the file is kept.
- **The tool supplied** every value of `subject`, `scope` and `accepted`: they were carried over from the review record it wrote for the staged generation, without retyping.
- **The agent** ran the review, typed the record, drafted the statement, and set two values by rules stated to the Principal with the questions: the identifier (the existing pattern, with the UTC date of approval and sequence 01) and `approvedAtUtc` (the second the answers arrived).
- The session runs under the repository owner's GitHub connection. The agent has no other means of identifying the person who answered.

## 5. The new approval

### 5.1 Values of record

| Item | Value |
|---|---|
| Identifier, status | `W04-D1-20261115-01`, `APPROVED` |
| Schema, policy, decision | `IPD_IRR_IDENTITY_APPROVAL_V2`, `IPD-IRR-IDENTITY-APPROVAL-POLICY-2`, `IIPS-W04-D1` |
| Approver | `PROGRAM_AUTHORITY_RAMKI` (`Ramki`), decision `APPROVED` |
| Approved at; review date | `2026-11-15T19:37:36Z`; `2026-11-16T18:29:59Z` |
| SHA-256 of the record file | `70d49544845120755adff9b5f39bc0de216c6a983fa0dbbdcd613ab9b26b440d`, 4,374 bytes, LF line ends, ASCII |
| P7 manifest SHA-256 | `69a918f78791114e8fb036ddfd2a2005facdddf785a7496bc28f541fd4964769` |
| IPD tool commit | `901e4791e271cafdb777d56f9f66f6867b3f60c6` |
| IRR commit of the accepted gate | `08411bcd6d782a601fe5c82cc9983d076831148d` |
| `eligible-roster.json` | `078e89cc1896d0f59e09e2ad05a12378e248cd81b97775ee7667b5f1e750e937`, 1,350,516 bytes |
| `listing-map.json` | `6a330123a2fea31e9e1dd54f01e5adbe13f9721f077a5a82a34ee7cd60bcf458`, 1,285,774 bytes |
| `corporate-actions.json` | `d6bc14d1b676260bb0f1c2280e62956d3f6a7e07b9b9265a73b49f821185ffcd`, 70 bytes |
| P04 source | `BATCH-D05-REPLACEMENT-AUTHENTICATED-UNIVERSE-2026-11-08-001`, authorization `AUTH-D05-REPLACEMENT-AUTHENTICATED-UNIVERSE-ACT-2026-11-08-001`, mode `OFFLINE_BOOTSTRAP`, 2,390 records, checksum `b555fd28589a03ea5cbb11c92f880468bcc4b63f449b853a18542aca5817d4c4` |
| Generation | Mapping `IPD-IRR-IDENTITY-EXPORT-MAPPING-1`; 2,388 issuers, 2,388 securities, 2,388 NSE listings, 0 corporate actions; 2 withheld; no issuer-key supplement; holdings coverage not counted |
| Scope | `LOCAL_SINGLE_USER_IIPS`, `IRR_INVESTMENT_IDENTITY_SOURCES`, `OPERATOR_SUPPLIED`; product-wide authoritative, production, hosted, multi-user and commercial use all `false` |
| Limitations accepted | `CIN_NOT_EXPORTED`, `SECTOR_UNCLASSIFIED`, `BSE_LISTINGS_NOT_EXPORTED`, `CORPORATE_ACTIONS_EMPTY`, `NO_SYMBOL_HISTORY`, `ELIGIBLE_MEANS_ACTIVE_NSE_LISTING`, `SERIES_FROM_UNIVERSE_DEFINITION`, `SOURCE_AUTHORITY_CONDITIONAL`, `NON_EQ_SERIES_HOLDINGS_UNRESOLVED`, `NSE_SOURCE_FILE_WITHOUT_RETRIEVAL_RECEIPT`, `ROSTER_LARGER_THAN_IID_DESIGN_DEFAULT`, `HOLDINGS_COVERAGE_NOT_MEASURED` |
| Withheld records accepted | `IN9175A01010` and `INE175A01038`, reason `ISSUER_SHARED_ACROSS_ISINS` |
| Revocation | none |

### 5.2 Comparison with the original

The original's content is unpublished. The comparison is with the values IPD records for it (section 3).

| Field | `W04-D1-20261114-01` (H) | `W04-D1-20261115-01` (R) | |
|---|---|---|---|
| P7 manifest SHA-256 | `13bd2ef1…078bc` | `69a918f7…4769` | **Changed**: the authorized change |
| IPD tool commit | `fff4829…` | `901e479…` | **Changed**: required by the mechanism, see below |
| Identifier, approved at, review date, statement | of 14 November | of 15 November | Changed: a new record has its own |
| Three identity files | `078e89cc…`, `6a330123…`, `d6bc14d1…` | the same digests and sizes | Unchanged |
| P04 source | batch, 2,390 records, `b555fd28…` | the same | Unchanged |
| Exported and withheld counts | 2,388 / 2,388 / 0 / 0; 2 withheld | the same | Unchanged |
| IRR commit | `08411bc…` | `08411bc…` | Unchanged |
| Scope | local, single user, non-production, operator-supplied | the same; fixed by the policy | Unchanged |
| Limitations and withheld records | twelve; two | the same twelve; the same two | Unchanged |

**Why the tool commit also changes.** The instruction asks that nothing change but the manifest binding. The mechanism does not allow that. The Windows wrapper has no option for the P7 manifest: it generates with the manifest its own IPD checkout tracks. Commit `fff4829` tracks the previous manifest. Only a checkout at a commit that tracks the published manifest produces this generation, and the record must name that commit. The Principal chose it (decision 2). The tool commit is part of the subject of the record. It is not part of its scope, restrictions or conditions, and those are unchanged.

**What the review of the tool confirms (R).** The review record written for this generation differs from the review record of 2026-11-14, tracked in IPD, in three values of sixty: the P7 digest, and the tool commit in its two places.

### 5.3 Where the record is

On the host, by the Principal's decision 4. It is in no commit of IRR and in no commit of IPD. The agent delivered the file to the Principal in the session workspace, at a path that git ignores.

The SHA-256 above is that of the file as written. A transfer to Windows can change line ends or add a byte-order mark. The tool accepts such a file: it is the same record. The tool then prints another SHA-256, and the install receipt would carry that one (R, evidence file 04):

| File bytes | SHA-256 |
|---|---|
| As written: LF, no byte-order mark, 4,374 bytes | `70d49544845120755adff9b5f39bc0de216c6a983fa0dbbdcd613ab9b26b440d` |
| CRLF, 4,473 bytes | `39a438fa4979ba0ecb9b845f7190ee4c2bb2bcf4734d8fd2c2ecf1f1a4a32c78` |
| Byte-order mark and LF, 4,377 bytes | `0fd225eada16d71a0af1cb8abcb8d905819eabf7b4745e39a71a17f61a8c0d18` |
| Byte-order mark and CRLF, 4,476 bytes | `b077d671cd5d56c5e138049550e4c96949c0fee991625610dc631ad2eee71b50` |

### 5.4 The pipeline commit

The record has no field for the P7 pipeline commit, and a field added for it would be refused. It is bound through the manifest: the bytes with SHA-256 `69a918f7…4769` state `pipelineCommit` `325266d684f857a377d55b147e7306e02c7a495a` and hold 4,680 `QUALIFIED` records and 4,680 registry entries (R, read from IPD `main`). The approver's statement also names the pipeline commit; the tool does not compare statement text.

The pipeline commit is not the tool commit. At `325266d` the tracked manifest is still the previous one; the published manifest was committed by its child, `371bf3b`.

### 5.5 Versioning and supersession

The schema has no version of a record and no field that names an earlier record. The enforcement record has one rule: renewal is a new record. The identifier follows the pattern of the existing one. The relation between the two records is therefore stated outside the checked fields:

- **`W04-D1-20261115-01` supersedes `W04-D1-20261114-01` for new installations.** It is the record to give to the tool from now until its review date.
- `W04-D1-20261114-01` is not withdrawn and not altered. It had lapsed by its own date.
- The same is said in the approver's statement inside the new record.

## 6. Validation against the approval check (non-production, R)

### 6.1 Environment

Sandbox, Linux, Node v22.22.3. IPD at `901e479`, installed with `npm ci` and built with `npm run build:tsc`; no tracked file changed. IRR at `08411bc`, `frontend` installed with `npm ci`; no file changed. Every run of the tool was made in a network namespace without interfaces. For the IRR install, Node was pointed at the system certificate store (`NODE_EXTRA_CA_CERTS`) so that it could verify the download of the pinned IPD packages; certificate verification was not switched off.

### 6.2 Runs and results

| # | Run | Result | Evidence |
|---|---|---|---|
| 1 | `review` with the manifest the checkout tracks (staging A) | Generation `PASS`. IRR loader gate `PASS`: three files accepted, class `OPERATOR_SUPPLIED`, 2,388 of 2,388 resolved by ISIN and by exchange and symbol. P7 digest `69a918f7…4769`. `REVIEW RESULT: COMPLETE`. Exit code 0. | `01-…` |
| 2 | Control: `review` with the previous manifest given by `--p7` (staging B) | The same three files. P7 digest `13bd2ef1…078bc`. Exit code 0. | `02-…` |
| 3 | Mechanism under IPD's fictitious test policy, records in memory only | A record that binds the previous digest is refused for staging A with `GENERATION_MISMATCH` and nothing else. A record that binds the published digest authorizes staging A and is refused for staging B. | `03-…` |
| 4 | `check-approval` of the real record, by itself and against the running tool | No failure. Exit code 0. | `04-…`, 1 |
| 5 | `check-approval` of the real record against staging A | **`RESULT: PASS`**: "the approval record authorizes exactly the staged files, their source and generation, the gated IRR commit and this tool". Compared with the tool, the staged files and the gated IRR commit. Exit code 0. | `04-…`, 2 |
| 6 | Negative control: the real record against staging B | Refused: `GENERATION_MISMATCH`, differing `p7ManifestSha256`. Exit code 7. | `04-…`, 3 |
| 7 | Independent re-run: fresh clones of both repositories, fresh installs and build, new staging directory (staging C) | Review `COMPLETE`; the review record is byte-identical with that of run 1. `check-approval` of the real record: **`RESULT: PASS`**. Exit code 0. | `05-…` |

Run 3 is the old-manifest dependency and its resolution, shown with the governed rules and a fictitious authority. Runs 5 to 7 are the same check with the governed policy and the real record.

### 6.3 Not run

- **`install`.** Nothing was installed, in the sandbox or on the host. No install receipt exists for this record.
- Anything on Windows, and the Windows wrapper.
- `verify-endpoint`. It needs a running IRR server and a portfolio.
- A refusal on account of the review date. It cannot be shown before the date; IPD's test `IAP-30` covers it.

## 7. Downstream status

### 7.1 The dependency

IPD's roadmap states that approval `W04-D1-20261114-01` binds the previous manifest digest, and that "a provisioning run staged against the published manifest is refused with `GENERATION_MISMATCH` until the Principal decides a new approval". Section 6 of IPD's host-verification record of 2026-11-15 records the same.

The Principal has decided one. With record `W04-D1-20261115-01`, the check passes for a generation staged with the published manifest (runs 5 and 7). **The dependency is resolved in the preflight.** It is resolved for the commits and the period of section 7.2 and for nothing else.

### 7.2 Conditions under which the record authorizes an installation

All of them, checked by the tool at the time of installation:

- the IPD checkout the tool runs from is at exactly `901e4791e271cafdb777d56f9f66f6867b3f60c6`, with no tracked tool file changed and a build that is not older than its source;
- the IRR checkout given to the loader gate is at exactly `08411bcd6d782a601fe5c82cc9983d076831148d`, and the gate accepts the files;
- the staged files, the P04 source and the generation are those of section 5.1;
- the time is before `2026-11-16T18:29:59Z`.

Otherwise the tool refuses and installs nothing. In particular, a new commit of either host checkout needs a new record. That includes a merge of this document into IRR `main`, if the host IRR checkout is then updated to it.

### 7.3 Still open

- **Whether the host checkouts are at those commits is not known.** IPD's records say the Principal's Windows checkout was not read or synchronized. Bringing the host to these commits, running the review there and installing are the Principal's steps. None was authorized for this task, and none was done.
- **IPD's tracker still states the dependency as outstanding.** The W04 paragraph of the roadmap and section 6 of the host-verification record are IPD files. This task was not to modify IPD. They need an update from an IPD session, citing this record.
- **W04 is not accepted.** The other open points of the W04 paragraph of IPD's roadmap stand. Among them, as that paragraph states them: identity coverage of the actual holdings is not measured; the source versions served on the host are not established; the code that projects the IPD security identity is in IRR PR #563, which is unmerged.

## 8. Departures and limits

- **D-1. The review was not run on the host.** The enforcement record has the approver run `review` on the host and state the commit it prints there. For this record the review was run in the sandbox, at the IPD commit the Principal named and at IRR `08411bc`. The three files are generated deterministically from tracked content, and the host generated the same bytes on 2026-11-14 (H). If the review on the host prints another commit or another digest, the record does not authorize, and the tool says so.
- **D-2. The agent typed the record and drafted the statement.** The enforcement record has the approver enter the identifier, the times and a statement in the approver's own words. Here the Principal decided these in the session (section 4) and the agent wrote them down. The Principal read the statement in full and adopted it by selecting it; the Principal did not type it. No value of the record was inferred by a command, and none was set that section 4 does not account for.
- **D-3. The standing of the record rests on section 4.** If the Principal prefers the procedure to the letter, the file can be deleted and a record made on the host. Nothing has been installed under this record.
- The original record was not read. Section 5.2 compares with what IPD records about it.
- The time of approval is the sandbox clock at the arrival of the answers.
- The published manifest was read from IPD `main`. It was not regenerated, and nothing about it was changed.
- No portfolio, holding, identity assignment, provider, credential or host file was read or changed.

## 9. Files of this change

| File | Content |
|---|---|
| `docs/integration/IIPS-W04-IRR-IDENTITY-APPROVAL-SUPERSESSION-2026-11-15.md` | This record. |
| `evidence/integration/w04-irr-identity-approval-supersession-2026-11-15/README.md` | Index of the evidence. |
| `…/principal-authorization.json` | The Principal's instruction, restated, and the four decisions. Not an approval record. |
| `…/review-for-approval-901e479.json` | The review record the tool wrote for staging A. Not an approval record. |
| `…/01-review-run-published-manifest.txt` | Run 1. |
| `…/02-review-run-previous-manifest-control.txt` | Run 2. |
| `…/03-mechanism-demonstration-fictitious-authority.txt` and `.mjs` | Run 3 and its script. |
| `…/04-check-approval-W04-D1-20261115-01.txt` | Runs 4 to 6, and the transfer variants of section 5.3. |
| `…/05-independent-reverification-fresh-clones.txt` | Run 7. |

Not in this change: the approval record file, any IRR source or test, any IPD file.
