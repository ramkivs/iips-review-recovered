# DEC-A2-A1-TIER3-EXECUTION-EVIDENCE-AND-IV-REFRESH

- **Record ID:** `DEC-A2-A1-TIER3-EXECUTION-EVIDENCE-AND-IV-REFRESH`
- **Title:** A2 -> A1 Tier-3 Execution Evidence Recorded (IES-016/017/020, 87/87 at `ff1c90e`) and Exact-Scope Amend-in-Place Authority for the Three Tier-3 Independent-Verification Reports
- **Class:** `DECISION / EVIDENCE RECORD + AMENDMENT AUTHORITY`
- **Status:** `RECORDED - TIER-3 EXECUTION EVIDENCE DURABLY RECORDED. TIER-2 EXECUTION EVIDENCE DURABLY RECORDED. IV-REPORT AMENDMENT AUTHORIZED FOR THE THREE EXACT PATHS BELOW, NOT YET PERFORMED. NO A2 -> A1 STATUS FLIP. NO MATRIX AMENDMENT. NO MANIFEST AMENDMENT. NO CERTIFICATE. NO PROMOTION. NO RELEASE/TAG.`
- **Date/time:** 2026-09-02 (Asia/Calcutta, +05:30); exact recording time is the commit timestamp of this record
- **Authority relationship:** gate `A2 -> A1 TIER-3 EXECUTION-EVIDENCE RECORDING GATE`. Follows the D35 pattern (`DEC-D35-MAINTAINER-ISSUANCE-PERFORMED`): the performed act is recorded durably on `arena` first; the product-side amendment it enables is a separate, later gate. Execution was performed under `DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY` (arena `3dbc5bc55e029325024d4a82d38ed48835ee6db3`), section 6 and section 9 of which require a subsequent authority for durable recording of results; this record is that authority. The amendment path scope in section 3 is granted by reference to `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY` (arena `809ebf9c9face0679f3c7053232f756180b72c73`) section 3.3 (amend only); this record narrows, and does not extend, that scope. Recording authority for this record is scoped to `governance/iips/` on `arena/01a03e3b-iips-review-recovered` only (D6).
- **Scope:** (1) durable recording of the Tier-3 execution evidence of 2026-09-02 and of the earlier Tier-2 execution evidence; (2) definition of the exact, section-level amend-in-place scope for the three Tier-3 independent-verification reports. This record performs no product-side change, changes no capability status, amends no matrix or manifest, creates no certificate, and does not itself amend the three reports.
- **Provenance:** newly recorded at this gate from the execution evidence presented to the maintainer (console transcript retained outside the repository under evidence custody), the read-only discovery performed against `phase13-next` `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36` and `arena` `3dbc5bc55e029325024d4a82d38ed48835ee6db3`, and identities supplied by the maintainer at this gate. No historical provenance is claimed. No value in this record is inferred; values not present in the evidence are stated as not captured.
- **Supersession / revision relationship:** supersedes none; amends none. `DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY`, `DEC-A2-A1-TEST-EXECUTION-AUTHORITY`, `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY`, `DEC-A2-A1-CLOSURE-STRATEGY`, `DEC-A2-A1-TIER3-CREATION-AUTHORITY`, `DEC-D5-EVIDENCE-MATURITY`, `DEC-D5-S1-REGRESSION-EVIDENCE`, `DEC-D5-S3-EVIDENCE-DEBT`, `DEC-D6-DURABLE-RECORDING-POLICY`, `DEC-D15-VERIFICATION-METHODOLOGY`, `DEC-D16-TIER3-DOCUMENTATION-PARITY-EXECUTION`, `DEC-D25-TIER3-EVIDENTIARY-STANDARD`, `DEC-D28-FENCE-RELIEF-AUTHORIZATION`, `DEC-D35-MAINTAINER-ISSUANCE-PERFORMED`, `DEC-D36-TIER3-DOCUMENTATION-PARITY-AUTHORITY` and all other referenced records are unchanged. The three independent-verification reports of 2026-08-30 are not superseded by this record; they are superseded as current evidence only when amended under section 3.

---

## 1. TIER-3 EXECUTION EVIDENCE - RECORDED (2026-09-02)

### 1.1 Lineage and authority

- **Execution authority:** `DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY`, arena commit `3dbc5bc55e029325024d4a82d38ed48835ee6db3`
- **Product repository root:** `G:\IIPS\phase13-next-authority`
- **Branch:** `phase13-next`
- **Product HEAD (pre and post, unchanged):** `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36`
- **origin/phase13-next:** `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36`
- **Working directory:** `G:\IIPS\phase13-next-authority\iips-platform`

### 1.2 Identities

- **Executor:** `desktop-no0nhtp\user` (machine `DESKTOP-NO0NHTP`)
- **Verifier/reconciler:** `user` -- role-separated, not organizationally independent. The verifier/reconciler reconciled the execution transcript, the pre/post repository state and the twenty-two file hashes against the requirements of `DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY` sections 5 to 7. No external organization, certification body, third-party auditor or independent reviewer was engaged, and none is claimed (D15 section 1; D25; `DEC-A2-A1-TIER3-CREATION-AUTHORITY` section 3).

### 1.3 Command executed (exact)

```
npx --no-install tsx --test tests/regression/telecommunications-acceptance.test.ts tests/regression/telecommunications-framework-integration.test.ts tests/regression/telecommunications-reuse-verification.test.ts tests/regression/telecommunications-wp4-validation.test.ts tests/regression/automobile-acceptance.test.ts tests/regression/automobile-framework-integration.test.ts tests/regression/automobile-reuse-verification.test.ts tests/regression/automobile-wp4-validation.test.ts tests/regression/materials-metals-acceptance.test.ts tests/regression/materials-metals-framework-integration.test.ts tests/regression/materials-metals-reuse-verification.test.ts tests/regression/materials-metals-wp4-validation.test.ts
```

Twelve explicit paths; no globs; no `npm test`; no coverage, reporter-to-file or watch; `--no-install` honoured (no installation performed).

### 1.4 Files executed (byte-pinned; identical before and after execution)

| Standard | Path | Bytes | SHA-256 | Subtests |
|---|---|---:|---|:-:|
| IES-016 | `iips-platform/tests/regression/telecommunications-acceptance.test.ts` | 13693 | `2bf45b69cf58fd89c86cc8559bcb0801a37e2b2ca76acbe62808864d5de8ebf1` | 13 |
| IES-016 | `iips-platform/tests/regression/telecommunications-framework-integration.test.ts` | 12138 | `ded96a3929bfd583ab1099c28b28979c2a9a471432e920ea0b1951c9a07a3b61` | 7 |
| IES-016 | `iips-platform/tests/regression/telecommunications-reuse-verification.test.ts` | 10259 | `d8ec7b9411b72dad08aea162eada516f6ea07dc6e61728748ea604bbd49852a1` | 4 |
| IES-016 | `iips-platform/tests/regression/telecommunications-wp4-validation.test.ts` | 7401 | `60aa5d1e5c796bc7eaf4599d46000c5359f298e2591b8e646e1ebfa8042a4fc1` | 5 |
| IES-017 | `iips-platform/tests/regression/automobile-acceptance.test.ts` | 13183 | `35d8f133beb6df7a90ee06bbd272d52ed8f3690c95acdb545b2dabcd79bb0a87` | 13 |
| IES-017 | `iips-platform/tests/regression/automobile-framework-integration.test.ts` | 11970 | `188b8a281609ee2bc3a7515c75773fb0b7dc8d8956527f93fd7b9aeebd2480a4` | 7 |
| IES-017 | `iips-platform/tests/regression/automobile-reuse-verification.test.ts` | 10143 | `c52b2ad6cc7d75c0ffb389c3d3cbc4771774bf0d11416eec7fa663ad127b62bc` | 4 |
| IES-017 | `iips-platform/tests/regression/automobile-wp4-validation.test.ts` | 7245 | `b3f8e695e5103ed16e3ee63142edc56650dd893daf66e0f2e477e72954f2effc` | 5 |
| IES-020 | `iips-platform/tests/regression/materials-metals-acceptance.test.ts` | 13404 | `705e459d4af95e943a2d06e4aadebf2b89401b9fc0f7ffe07ac0c1cd1a097757` | 13 |
| IES-020 | `iips-platform/tests/regression/materials-metals-framework-integration.test.ts` | 12141 | `7cc13c1c178c33e715495d002c7fbec4ede493fe6fbb72467f4e8ecb85367bd9` | 7 |
| IES-020 | `iips-platform/tests/regression/materials-metals-reuse-verification.test.ts` | 10275 | `d360930970dbce9cd85bc67b40cb408a1060c3a974a3ebcddf0f5847e5857a14` | 4 |
| IES-020 | `iips-platform/tests/regression/materials-metals-wp4-validation.test.ts` | 7367 | `7daa7da3afbc6fe408ae15f63fc311ec6daff63977698bbd2ccc4f8a648307be` | 5 |

### 1.5 Observed result

| Item | Value |
|---|---|
| UTC start | `2026-09-02T17:48:05.4353267Z` |
| UTC end | `2026-09-02T17:48:09.5817815Z` |
| Node | `v24.14.0` |
| npm | `11.9.0` |
| tsx (resolved, no install) | `v4.23.9` |
| Process exit code | `0` |
| Subtests total | 87 |
| Passed | 87 |
| Failed | 0 |
| Cancelled | 0 |
| Skipped | 0 |
| Todo | 0 |
| IES-016 (4 files) | 29 / 29 |
| IES-017 (4 files) | 29 / 29 |
| IES-020 (4 files) | 29 / 29 |

The observed result equals the expected result stated in `DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY` section 6.

### 1.6 Repository invariants (reconciled)

- `git status --porcelain=v1 --untracked-files=all` pre-execution and post-execution: identical; exactly the ten authorized baseline entries (four `' M'` protected calibration files, six `??` Tier-2 test files); no other entry.
- Index (`git diff --cached --name-only`): empty before and after.
- HEAD: `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36` before and after.
- Twenty-two file hashes unchanged before and after: the twelve Tier-3 test files (section 1.4); the four protected calibration files (`ies-012-utilities/calibration/utilities-calibration-1.0.0.json` `cd60d644c92f999cc6484b31ae3842376ced07c7727fe5dd7b13a67a7f2f0ab8`; `ies-013-consumer/calibration/consumer-calibration-1.0.0.json` `2c25fa39cb85f4202eafb0f57c08996aa4c6cd0619c7f462f3a8ca118833b0c9`; `ies-014-industrials/calibration/industrials-calibration-1.0.0.json` `abaa02d0c96055febbc69a3175b28d354aed515fe9695acb089fd3f849ee05be`; `ies-015-technology/calibration/technology-calibration-1.0.0.json` `9be45e06c953711a7c3202ac8b4fc5d6337dc9c59189f0a2c5f45485d729a06d`); the six untracked Tier-2 test files (`banking-framework-integration.test.ts` `a8199e4c6759e99f63eca190cf0acb3746f279b0f9679084c87b4fc0ba9c6394`; `banking-reuse-verification.test.ts` `e18b7727c1f1051638596e0b6fb815d10f79c3cdeece35172ab924f889b66912`; `banking-wp4-validation.test.ts` `f226775dcad92220ff9e33b075931c46136f91ac3959c736dfec2afc5ecbe239`; `insurance-wp4-validation.test.ts` `2e101a69d42adf4b2ec3031f7eb8153460665960b610d2a5a1a3045236a3575f`; `capital-markets-wp4-validation.test.ts` `f21f57cc6edc17a53119e46adff460b539741bb0c589b5cb92b2a11938adf698`; `healthcare-wp4-validation.test.ts` `96666d53be25048a1a0e0130d08aac84509ba9a470727a66019693b59b76887e`; all under `iips-platform/tests/regression/`).
- No file was created, modified, staged, committed or pushed in the product repository by the execution.

### 1.7 Transcript custody

The complete console transcript (stdout and stderr, TAP output) is retained outside the product repository under the evidence custody of the executor and verifier/reconciler. It is NOT added to the product repository and this record does not authorize adding it.

## 1b. TIER-2 EXECUTION EVIDENCE - RECORDED (earlier run)

- **Execution authority:** `DEC-A2-A1-TEST-EXECUTION-AUTHORITY`, arena commit `23cbbf8d9b24959d51ae04ff04372d5acb20a293`
- **Product HEAD (pre and post, unchanged):** `100a90237d4ac3db29d10019423b67afe99e2819` (`phase13-next`; `origin/phase13-next` equal at the time)
- **Working directory:** `G:\IIPS\phase13-next-authority\iips-platform`
- **Command:** `npx --no-install tsx --test` followed by the six explicit Tier-2 paths in the order recorded in `DEC-A2-A1-TEST-EXECUTION-AUTHORITY` section 4 (`banking-framework-integration`, `banking-reuse-verification`, `banking-wp4-validation`, `insurance-wp4-validation`, `capital-markets-wp4-validation`, `healthcare-wp4-validation`, all `iips-platform/tests/regression/*.test.ts`), byte-pinned to the SHA-256 values in section 1.6 above and in that authority's section 3.
- **Observed result:** 36 subtests, 36 passed, 0 failed, exit code 0.
- **Repository invariants (reconciled at the time):** exactly the four known protected calibration modifications and the six authorized untracked Tier-2 test files; no staged changes; authorized test hashes unchanged; protected calibration hashes unchanged; no additional execution-created change; HEAD unchanged.
- **Not captured in the supplied evidence for this run (stated, not inferred):** UTC start/end timestamps; Node, npm and resolved tsx versions; executor identity; machine identity; verifier/reconciler identity; per-kind cancelled/skipped/todo counts. These values are not asserted by this record.
- **Standing:** this evidence concerns IES-006.2A / IES-007 / IES-008 / IES-009 only and establishes nothing for IES-016 / IES-017 / IES-020. It is recorded here because no prior durable record of it existed.

## 2. EVIDENCE SEMANTICS (D16 / D15 / D25)

1. The evidence in sections 1 and 1b is **new evidence, dated at execution**; it is not recovered historical evidence and must not be represented as such (D16 section 8).
2. The verification model is **role separation plus reproducibility against the frozen, committed reference assets at a pinned HEAD** (D15 section 1). The execution took place in the authorized dirty worktree defined by the execution authority (four protected modifications, six untracked Tier-2 files), not in a fresh clone; this is disclosed and no clean-clone claim is made.
3. **Historical treatment of the 2026-08-30 run:** the three independent-verification reports currently at `ff1c90e` record an execution of `2026-08-30T18:02:53.309Z` against `phase13-next` `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9` (the parent of D28 commit `33838ac`; the six D28 files were at that instant uncommitted), reporting 11/11 per standard, 33/33 across the six D28 files, 87/87 across the twelve files, `tsc --noEmit` PASS and `npm test` 606/606. That run is retained as **history**. It is not current evidence for `ff1c90e`. Its `tsc --noEmit` and `npm test` results were **not** re-executed under `DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY` (which prohibits both) and must not be represented as current evidence.
4. Read-only discovery established that the source/test/package closure of the twelve files is byte-identical between `33838ac` and `ff1c90e` (the only differences `357b34da`..`ff1c90e` in that closure are the six D28 file additions). This is context, not a substitute for the current run; the current run in section 1 is the evidence.

## 3. AMEND-IN-PLACE AUTHORITY - THREE INDEPENDENT-VERIFICATION REPORTS (NOT YET PERFORMED)

### 3.1 Exact paths and pre-hashes (at `ff1c90e`)

| Path | Bytes | SHA-256 (pre-amendment) |
|---|---:|---|
| `iips-platform/IES016_INDEPENDENT_VERIFICATION_REPORT.md` | 4864 | `f9262ecc14ea10cd4d295d91a6c5f0f114c3e34a18e7b5cbaa07cfdd91856dc4` |
| `iips-platform/IES017_INDEPENDENT_VERIFICATION_REPORT.md` | 4808 | `fb202516d67642f44ca73543227b6f38b3af760c7c5a947cbc4a9ebde24e9d2a` |
| `iips-platform/IES020_INDEPENDENT_VERIFICATION_REPORT.md` | 4859 | `0ba673249575f182ed69befc480d100dd2cb660c01fa714e9fedd96dfe50186a` |

Path authority: `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY` section 3.3 (amend only). Any amendment must begin from exactly these pre-hashes; a differing pre-hash voids the amendment gate.

### 3.2 Permitted section-level amendments (exhaustive)

For each report, and only these:

1. **Header:** replace the `Executed` timestamp and `Executed against` pin with the section 1.5 UTC window and `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36`; add `DEC-A2-A1-TIER3-TEST-EXECUTION-AUTHORITY` (`3dbc5bc5`) and this record to the authority line; add `Executor:` and `Verifier/reconciler:` fields with the section 1.2 values and the role-separated label.
2. **Section 2 (what was verified):** replace the mechanism table with the exact twelve-path command of section 1.3 and the four kinds per standard (acceptance 13, framework-integration 7, reuse-verification 4, wp4-validation 5) with their SHA-256 values; state that typecheck and `npm test` were not executed under the current authority; move the 2026-08-30 run to an explicitly labelled historical sub-section.
3. **Section 3 (observed results):** current results only: 29/29 for the standard, 87/87 across the twelve files, 0 failed / 0 cancelled / 0 skipped / 0 todo, exit 0, Node/npm/tsx versions, pre/post invariants of section 1.6; retain the golden-reference anchor line as reproduced by the acceptance test; state transcript custody per section 1.7.
4. **Section 4 (frozen-artifact provenance):** replace the "10 verified / 0 bad" statement with the factual manifest state at `ff1c90e` (twelve `documentHashes` entries; `architectureReview` and `authorityReview` in LF-blob convention; ten historical entries in CRLF-rendering convention, not recomputed; `hashNormalization` note present); state that no artifact re-hash was performed by the current execution; retain the `releaseTag` null / D31 statement.
5. **Section 5 (what was not verified):** correct the two statements made false by D36 commit `0a8e287` (an `IES-0xx_ARCHITECTURE_REVIEW.md` and an `IES-0xx-D01..D19` documentation set now exist, created under `DEC-D36-TIER3-DOCUMENTATION-PARITY-AUTHORITY` as new documentation, self-labelled, not recovered evidence and not an organizational review); retain no-organizational-independence, evidence-maturity-unchanged, matrix-not-modified and certificate-assertions-not-verified statements; add that `D7-TIER3-PARITY` and `D7-TIER3-INDEPENDENCE` remain open.
6. **Section 6 (conclusion):** re-date to the current run; retain the role-separated qualification; retain, verbatim in substance, that the report does not establish organizational independence and does not constitute an A2 -> A1 promotion.

Not permitted in the reports: any change to the title, Standard or Engine lines; any organizational-independence, certification, readiness, promotion or A1 language; any claim of current `tsc` or `npm test` results; any reference to a transcript file inside the repository. Encoding: the three reports are currently UTF-8 with BOM, LF, final newline; the amendment gate must either preserve that encoding exactly or state explicitly that it normalized it -- never silently.

### 3.3 Product pre/post invariants for the amendment gate

- Pre: root `G:\IIPS\phase13-next-authority`; symbolic ref `refs/heads/phase13-next`; HEAD and `origin/phase13-next` = `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36`; status = exactly the ten baseline entries; index empty; the three report pre-hashes of section 3.1; the three refreshed freeze manifests at `3d2b53835efdb8df21d4cb1dc67e4e535833954c8921653a0c5de16f4086e69f` (IES-016), `2ad4fcd9ed0a76b5ce186a4fe269bc7eef46a78656e65fd2e64ba66039038afe` (IES-017), `648f26633ad87f9cd1f79185aba517bee8187c390e273663a0674603c84d6f60` (IES-020).
- Post: status = the ten baseline entries plus exactly three `' M'` entries for the three report paths; index empty; HEAD unchanged; the twenty-two hashes of section 1.6 and the three manifest hashes unchanged; `git diff --check` clean; no other path created or modified; no commit or push without separate authorization.
- Any deviation: stop; no automatic rollback; human review.

### 3.4 Role and identity requirements for the amendment

The amended reports must name the executor and the verifier/reconciler as in section 1.2, must label the verifier/reconciler as role-separated and not organizationally independent, and must not attribute the reconciliation to any external party.

## 4. EXPLICITLY PROHIBITED

This record does not authorize, and prohibits under its scope:

- any access to or mutation of the product checkout by this recording gate;
- test execution or re-execution;
- amendment of the three independent-verification reports by this record (a separate mutation gate is required);
- amendment of the three freeze manifests;
- creation or amendment of any final-readiness or implementation-readiness certificate;
- amendment of the Integration Verification Matrix, the Engine Master Matrix or the Screenshot-to-Certified-Product Parity Matrix;
- any A2 -> A1 status change; certification, promotion, release or tag;
- representing `tsc --noEmit` or `npm test` results as current evidence;
- modification of the four protected calibration files;
- modification, staging or execution of the six untracked Tier-2 test files;
- D36 / D36-A reopen; D5 / D5-S1 / D5-S3 reopen; E2E-019 changes; H / I / J; fence-9;
- adding any transcript or log file to the product repository;
- any path outside `governance/iips/DEC-A2-A1-TIER3-EXECUTION-EVIDENCE-AND-IV-REFRESH.md` for this gate, and outside the three paths of section 3.1 for the later amendment gate.

## 5. D7 BOUNDARY AND WHAT THIS RECORD DOES NOT DO

`D7-TIER3-PARITY` and `D7-TIER3-INDEPENDENCE` remain OPEN. The recorded execution satisfies the presence-and-passing condition of the D5-S1 four-kind regression limb for IES-016, IES-017 and IES-020 at `ff1c90e` under a role-separated model; it does not by itself satisfy any other A1 limb, does not close either D7 item, does not establish organizational independence and does not constitute an A2 -> A1 promotion. No matrix, manifest, certificate, test, calibration or implementation is changed by this record. The final-readiness certificates of `DEC-A2-A1-EVIDENCE-ARTIFACT-CREATION-AUTHORITY` section 3.4 remain gated by its section 6 and are not created or authorized for creation here.

## 6. NEXT GATE

Per the recording grant, the next gate is named here and is not executed by this record:

**A2 -> A1 TIER-3 IV-REPORT REFRESH MUTATION GATE** -- amend in place exactly the three paths of section 3.1 on `phase13-next` at `ff1c90e48f65c6ca22e0f87d9d0ebfd3c927ca36`, within the section 3.2 scope and section 3.3 invariants, followed by separate commit authorization.

# **DEC-A2-A1-TIER3-EXECUTION-EVIDENCE-AND-IV-REFRESH RECORDED - EVIDENCE DURABLE - IV AMENDMENT AUTHORIZED, NOT PERFORMED - STOP FOR COMMIT AUTHORIZATION**
