# IIPS v3.0 — Gate 3 Amendment 01 (`G3-AMEND-01`): Program Authority Determination and Bounded Amendment to `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02`

> ## STATUS: **RENDERED — PROGRAM AUTHORITY DECISION RECORDED**
>
> - **Gate 3 overall status:** **`BLOCKED / NOT ACCEPTED`** as at this record's preparation. Acceptance is **not** granted, implied or automatic; §10 fixes the exact conditions under which a separate acceptance record may be rendered.
> - **Effect of this instrument:** the three `G3-AMEND-01` questions are **decided** (§4 `Q1-B`, §5 `Q2-A`, §6 `Q3-A`) and the merge of **IPD PR #41** is **expressly authorized** subject to the conditions at §7. The governing act `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` is **not rewritten**, not re-signed and not superseded: it remains byte-identical (blob `4744e6f44e0caea55e980756aeef90a5046ec87e`, SHA-256 `f4992f9ced681ffddd0d8eaf1f3de297f2262f1eb0b3131ce18b95805725abf5`, 51,662 B).
> - **Effectiveness:** this instrument is effective on publication of this exact content to `ramkivs/iips-review-recovered` `refs/heads/main` with green PR-head and post-merge CI plus remote SHA-256 read-back (§12). Until then it is **RENDERED — NOT EFFECTIVE** and authorizes nothing.
> - **Non-grants preserved:** no Gate A′ execution, no Gate 4 (`QE-1…QE-11`), no Gate C result, no Gate 4 result acceptance, no Gate 5 admission, no `503` lift, no `durable:true` claim, no production eligibility, no Row 26 change, no product-consumer integration (§11).

| Field | Value |
|---|---|
| **Instrument ID** | `IIPS-V3-G3-AMEND-01-2026-10-22-01` |
| **Instrument type** | Program Authority decision record + bounded, additive amendment to an existing effective Gate 3 authority act |
| **Act amended** | `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` — `docs/integration/IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_EFFECTIVE_2026-10-19-02.md`, blob `4744e6f44e0caea55e980756aeef90a5046ec87e`, SHA-256 `f4992f9ced681ffddd0d8eaf1f3de297f2262f1eb0b3131ce18b95805725abf5`, 51,662 B — **preserved byte-identical; not rewritten** |
| **Decision date** | `2026-10-22` (UTC). Recorded on its actual date; not backdated. |
| **Deciding authority** | **Ramki — Program Authority** (the single user of this single-user application), cross-repository capacity (`IRR` + `IPD`) |
| **Rendering basis** | Direct explicit selection by the Program Authority in the operating session of `2026-10-22`: **`Adopt Option Q1-B`**, **`Adopt Option Q2-A`**, **`Adopt Option Q3-A`**, with instruction to formalise the determination under the established PA decision-recording process, complete the amendment workflow, reconcile IPD PR #41, and verify the result remotely — one pass, no renewed approval for routine work |
| **Standing authorization read alongside** | `F-3` §1.2 grant, transcribed verbatim at `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2, blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02` — the grant, **not** the decision: the decision is the PA's direct selection recorded here |
| **Governing interpretation record** | `IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01` (`docs/integration/2026-10-21/DEC-06-PA-STANDING-AUTHORIZATION-AND-P11-MAIN-ADMISSION-AUTHORITY-RECONCILIATION-2026-10-21.md`, blob `4be3ea57…`), rules `R-1`…`R-9`, tracker §16.70 |
| **Decision packet superseded as *status* only** | `IIPS-V3-G3-AMEND-01-PREPARED-PACKET-2026-10-22-01` — `docs/integration/IIPS_v3.0_G3_AMEND_01_BASIS_DRIFT_AND_EVIDENCE_BOUNDARY_2026-10-22.md`, blob `94171ea…`, SHA-256 `45f132c7…` — retained byte-preserved as the prepared packet; this instrument is the rendered determination |
| **Recording agent** | Arena Agent Mode — verification, record preparation, IRR-only mutation, publication and remote verification. **No authority is rendered by the agent.** |
| **Mutation scope** | **IRR documentation only.** IPD is read-only except for the single merge expressly authorized at §7, to be executed only after this instrument is effective. |
| **Status** | **RENDERED / RECORDED — EFFECTIVE on publication (§12)** |

---

## 1. Formal rendering, provenance, and the PA-only boundary

### 1.1 What the Program Authority decided

The Program Authority answered, by direct explicit selection, the three questions the prepared packet isolated as PA-only:

| Question | Selection | Meaning recorded at |
|---|---|---|
| `G3-AMEND-01-Q1` | **`Q1-B` — Dual-Anchor Basis Reconciliation** | §4 |
| `G3-AMEND-01-Q2` | **`Q2-A` — Preserve `.github/workflows/ci.yml` byte-identical to the frozen anchor** | §5 |
| `G3-AMEND-01-Q3` | **`Q3-A` — Direct TAP is supplemental defect-remediation evidence only; Windows `npm test` recorded FAILED; hosted Linux CI is the Gate 3 criterion** | §6 |

The Program Authority further directed that the determination be formalised under the established PA decision-recording process, that the amendment workflow be completed in one pass, that IPD PR #41 be reconciled against live remote state, and that the result be committed, published and independently verified.

### 1.2 The established form in which this is recorded (and what is not claimed)

This project records Program Authority decisions in one established form, used repeatedly and consistently (`GC-D3`, `GC-D4`, `NP-18`, `D-06`, `IIPS-V3-Q1-PORTFOLIO-DECISION-ACT-2026-10-22`): **the Program Authority renders the decision by direct explicit selection in the operating session, and the operating session records exactly what was selected, on the actual date, without inventing anything about the decision's form.**

Accordingly, and without qualification or hedging:

- **The decision is the Program Authority's.** It was rendered by direct explicit selection on `2026-10-22`.
- **This record is the agent's recording function.** It adds no decision content of its own.
- **Nothing is fabricated.** No signature, no signed instrument, no approval ID, no approval timestamp, no spoken-selection quotation, no third-party confirmation, no external witness and no independently held agent jurisdiction is asserted. The date is the real date of the session. The agent claims no authority it does not have.
- **No authority was inferred from the grant.** The standing grant (blob `c4c9f7d7…`) is the basis for *recording, publishing and verifying* this determination — the covered classes under `DEC-06` `R-1`/`R-3` — and is **not** cited as the source of the `Q1-B`/`Q2-A`/`Q3-A` selections themselves. Those selections are the PA's express act.

### 1.3 Is any mandatory formal PA requirement left unmet?

**No.** The mandatory formal requirement under the existing governance rules is that a PA-reserved determination be **rendered by the Program Authority** and **recorded accurately** (`DEC-06` `R-3`: *authorization ≠ act ≠ proof*; `R-7`: the IRR capacity determines and records, the IPD capacity acts and proves). Both limbs are satisfied for this instrument: the PA rendered the determination explicitly; the agent recorded it without embellishment. Verification of the *effect* (proof) is discharged separately and later, at §12 (publication + remote read-back) and §7 M-7 (post-merge IPD ancestry + blob equality). This instrument therefore claims **effectiveness pending publication**, and **no effect** before it.

### 1.4 What this instrument explicitly does **not** do

- It does **not** rewrite, re-issue, re-sign or supersede the governing act. Every byte of the act is preserved.
- It does **not** amend any manifest (act §4.1/§4.2/§4.3/§5.1/§5.2), any dependency boundary (act §8.2), the durability vocabulary (act §8.4), the W-1 guard (act §7), any restriction (act §9, §13), or any downstream act status (act §11).
- It does **not** accept Gate 3. Acceptance remains a distinct record with distinct conditions (§10).
- It does **not** authorize the merge of any IPD pull request other than **PR #41 at its exact head** (§7 M-1); in particular it does not merge, close or otherwise touch superseded **PR #34**.
- It does **not** authorize any change to `scripts/run-tests.mjs`, `ci.yml`, `package.json`, the lockfiles, the test runner, or any other path in either repository.

---

## 2. Record integrity at rendering

All values below were re-read from `IRR main @ 81f8ccfc8b098b122f1b12341549dc8074f2e0b2` and from a full, unshallowed fetch of `ramkivs/iips-production-market-data` during this pass (`2026-10-22`).

| Record | Blob (SHA-1) | SHA-256 | Bytes | Disposition |
|---|---|---|---|---|
| Governing act `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` | `4744e6f44e0caea55e980756aeef90a5046ec87e` | `f4992f9ced681ffddd0d8eaf1f3de297f2262f1eb0b3131ce18b95805725abf5` | 51,662 | **PRESERVED — byte-identical, unamended** |
| `DEC-06` authority reconciliation record | `4be3ea578a51a1a949337e5d218b89841c04892d` | `6475d3743189f27344ae7e2d56ddbf559da6450415df4db2b86e607186d4faa7` | 42,819 | **PRESERVED — byte-identical** |
| `G3-AMEND-01` prepared packet | `94171eaa2a519e3f3026b6e1e224028c2725061c` | `45f132c7112a803ffe36b91da35d07cf1cacd3aa90680ad38ada8350233c5361` | 30,242 | **PRESERVED** — packet retained; this instrument is the rendered determination |
| Native-Windows evidence record (`CV-CORR-55` §10) | `4ffbfd97cafa64e5ad0f5a5d9ea090bfc74373f1` | `fcd8266f2669efd695cabe992a3fa8a17816eef6d37e3dde9e6937e19af347b4` | 20,226 | **PRESERVED** — dated `Q3-A` pointer appended, no text rewritten |
| `F-3` §1.2 standing grant | `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02` | `3153d2fc554df08ed4fe3c0d9690ddccb9eaf21ab556c2c2c4f91dc57903e93b` | 27,619 | **PRESERVED** |
| `Q1` portfolio decision act | `de7860327091f76d4a1854d028221ca6cf91c07a` | `4a7ebb7f4551bd0bdc3164a0a48643ecc5dad8025d4d23dc8198fb71087eef39` | 5,795 | **PRESERVED** |
| `§16.71` disposition record | `3d820b3c2cf527d227a6bee32232df3a5bf2190e` | `8d57c2fc58411b5a9a6522bad133dd8d5a82078c6c49bba4c6c006869338dbee` | 13,425 | **PRESERVED** |
| `§16.73`/`CV-CORR-54` correction record | `70be5e650992fddbaa6cc2ff1ef136a6b939212c` | `dd48578119a1dc44e4edc0a15f3cac96d2b4c750e3c1cf264aef391612ba9a06` | 13,838 | **PRESERVED** |

**Factual correction recorded additively (no record rewritten).** The prepared packet cites the `Q1` act §3 as `2e7173acf4b22b5f2bab6cfa84a46b5cd3f152a3`. That string **does not resolve to any object** in either repository (`git cat-file -t` → `fatal: could not get object info`, checked against full IRR history and the full IPD object graph). The `Q1` act is cited henceforth by its verified blob `de786032…`; the unverifiable hash is recorded here as a citation defect in the packet, not carried forward, and not silently deleted from the packet.

---

## 3. Relationship between this instrument and the original authority act

**Model: additive amendment by a separate instrument; the original act is preserved byte-for-byte.**

1. **No textual amendment of the act.** This instrument does not edit, re-render, re-sign, append to, or replace `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02`. The act keeps blob `4744e6f4…` / SHA-256 `f4992f9c…`, so its merged hash remains independently verifiable — the same preservation discipline the act itself imposed at its §10.3 and that `PKG-02H-RB` honoured.
2. **Operative relationship.** The act remains **EFFECTIVE** and in force exactly as written. This instrument adds a bounded *operative rule set* that governs how three of the act's clauses are **applied** to a merge into IPD `main` performed on or after this instrument's effective date:
   - act §2.1 (the recorded "no material drift" premise) — **superseded as a statement of current state only**; the pinned basis is *not* re-pinned, and the act's immutable-basis text stands for every other purpose;
   - act §4.1 (the 10 frozen anchors) — **anchor-verification duty made dual** (§4 of this instrument);
   - act §10.1 condition 1 — **application rule replaced** (§4), condition 3 — **evidence-channel rule clarified** (§6).
3. **Precedence.** Where the act and this instrument differ *in how those clauses are applied*, this instrument governs for Gate 3 acceptance evaluations performed on or after its effective date. Where this instrument is silent, the act governs unchanged.
4. **Why an instrument was required at all.** The `Q1` act §3 recorded the fact plainly: *"The Gate 3 act contains no re-pinning or amendment mechanism."* This instrument supplies that mechanism, bounded to the three questions, in the same additive manner the project used for the G2 DP-1 amendments — and it does so as a **separate dated record**, never as a revision of the act's own text.
5. **Reversibility.** If this instrument is not published, or is later withdrawn by a further PA instrument, the act reverts to its unamended application with no residue: nothing in the act was changed, so nothing in the act needs restoring.

---

## 4. `G3-AMEND-01-Q1` — **ADOPTED: `Q1-B`, Dual-Anchor Basis Reconciliation**

### 4.1 The operative rule (this is the amendment)

Act §10.1 condition 1 reads, literally: *"the IPD manifest of §4.2/§4.3 is present and **no path outside the §4 manifest** differs from `be32d8c9` (diff-stat proof)"*. On a merge into current `main` that literal reading is unsatisfiable, because `main` legitimately carries intervening, PA-authorized changes. `Q1-B` replaces the *application* of condition 1 with a **dual proof**, both limbs of which must pass:

> **`Q1-B.1` — Candidate-vs-Pinned-Basis proof.** `git diff --name-status be32d8c95a86b3f03bd382ccde5b6398efb351c6 <candidate-head>` must yield **exactly 22 additions (`A`), 0 modifications (`M`), 0 deletions (`D`)**, matching act §4.2 (14 `src/` implementation files) and act §4.3 (8 test files) path-for-path and blob-for-blob; **and** all **10** act §4.1 frozen anchors must equal their `be32d8c9` blobs at the candidate head.
>
> **`Q1-B.2` — Post-Merge-vs-Pre-Merge-`main` proof.** `git diff --name-status <pre-merge-main-head> <merge-commit>` must yield **the same 22 additions (`A`), 0 modifications, 0 deletions**, with **identical Git blobs** for all 22 paths; **and** all **10** act §4.1 frozen anchors at the merge commit must equal their blobs at the pre-merge `main` head.
>
> **`Q1-B.3` — Intervening-change recognition.** The residual difference between `be32d8c9` and the pre-merge `main` head is **not** attributed to the candidate. It is admitted only for the enumerated intervening, PA-authorized pull requests, and every intervening change to a §4.1 anchor must be shown **non-conflicting** with the candidate's 22 additions.
>
> **`Q1-B.4` — Conjunctive failure.** If either limb fails, or an intervening anchor change is shown to conflict, condition 1 is **not met** and no merge is authorized.

### 4.2 Verified evidence at rendering (independently re-executed this pass, not copied from the packet)

All rows below were produced live from the full IPD object graph: `B` = `be32d8c9…` (pinned basis), `H` = `d15582d68167461e814ec8f7873dc18e3df5ab71` (PR #41 head), `M` = `c0e1b5662264651246db1ccde2945eb5e13f3524` (pre-merge `main`), `P` = `ce25a184d3dc22cd2d6e5c0ff9f277f3d541de5d` (GitHub merge preview, `refs/pull/41/merge`).

| Check | Result |
|---|---|
| `git diff --name-status B H` | **22 `A`, 0 `M`, 0 `D`** — 14 under `src/ipc/`+`src/persistence/`, 8 under `tests/` |
| `git diff --name-status M P` | **22 `A`, 0 `M`, 0 `D`** — the same 22 paths |
| Blob equality of the 22 paths, `H` vs `P` | **22/22 identical** (every SHA-1 equal; table at §4.3) |
| Root trees | `B` = `24fe0b8e51bf26209fcd1b4a796e90046a29f031`; `H` = `5edb9fe79e7e907be661ea10c7021a96be762821`; `P` = `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9` |
| Merge base `M`…`H` | **`be32d8c95a86b3f03bd382ccde5b6398efb351c6`** = the pinned basis, exactly |
| `B` ancestor of `origin/main` | **true** — the pinned basis is intact in history |
| Act §4.1 anchors at `H` vs `B` | **10/10 identical** |
| Act §4.1 anchors at `P` vs `M` | **10/10 identical** (PR #41 changes **0** bytes of all 10 anchors) |
| Act §4.1 anchors differing `B` → `M` | **3 of 10** — enumerated and provenance-checked at §4.4 |
| Paths outside the §4 manifest changed by the candidate | **0** |

### 4.3 The 22 authorized additions, verified at `d15582d6` (blob / size / SHA-256)

| Path | Git blob | Bytes | SHA-256 |
|---|---|---|---|
| `src/ipc/dispatch.ts` | `6c8fcbc81a0e690f4cbb1e863e7ea6b6aea6905e` | 12,223 | `8466c704ec46046c8120cb718028e48f2abfc3c12eeb4551712be1c7e6f8dfda` |
| `src/ipc/endpoint.ts` | `e565aa5b343266f62ffd411d17d74c89b9f29324` | 13,292 | `e0675f46ebf8c1a06d665a942445662d3e304b81a6ba20d0706688b58399734e` |
| `src/ipc/entrypoint.ts` | `e3727bb5859381df3e91a57be83b4802ce6047b9` | 4,969 | `85b8730d82e754e1df3a832a55f320c713e55e2c3359730aa56ada6e6306a7b8` |
| `src/ipc/protocol.ts` | `f4dc72b12ed9d618d1cfde836160f992ff1be9a5` | 18,089 | `596afe131c81c45003b08c55a423564dfbd189cd3cea7724a1b169b518e63f7b` |
| `src/persistence/audit.ts` | `273ccd3be29d7aca971933b6a28a4b4703504bf2` | 3,851 | `3a11b42e18ec3116ef85e4333e06bb5f017f79b0e12adc4ee3695207db1f6525` |
| `src/persistence/binding.ts` | `4c5ea0d55ce2f9f4ec7dec124f9bfc122badef30` | 3,791 | `dd23d5090e997f19cfe4ad4040303cef538f8d2f0739f73fe2ea25a8ce688a1a` |
| `src/persistence/connection.ts` | `5169e402707cf1a73f16bfb15ffe0b1d395165ff` | 3,888 | `51beab4e7b06ce4c44043ca04d678c4b193dd43fe3a0e53e895e481365e38a67` |
| `src/persistence/durablePortfolioStorePort.ts` | `97c5bc652765e6fa1aebc7cd7469da2ee92a1c29` | 2,893 | `bf1cc33ffb66523beb72b045b6b5a8cb8e9b8f02e45efb89d402c36bc19f419d` |
| `src/persistence/migration_ledger.ts` | `88198b44531777bd6a42bdc4e1094b695c25c270` | 3,468 | `c4b702401c2ecdf23bcd13bf4431eee2a1d550a0e3b5999065df1ad9b6cf33f4` |
| `src/persistence/migrations/001_initial_schema.ts` | `f594a18264c45ccdcbfa2381592820a72d3c453b` | 3,548 | `6aaff75c60053feed639617f42025ef8d58e5a8c8f7d987dd1804e0e2bdab4d3` |
| `src/persistence/migrations/002_audit_event_sequence.ts` | `932af8e603c4be41c9f0d8a6b051f41836c1fee8` | 940 | `bac1fa890eb460c76e380f5e1d4e19067a5b48a9f2b002ca7449d9da484f6056` |
| `src/persistence/migrations/003_local_principal_bindings.ts` | `32b125bf962bb76a6ae59d3b262203dbbb988197` | 1,649 | `30b5eab65f24267e9b7f9992fc5a7fe2978f613a979f033265a228831656df28` |
| `src/persistence/portfolio_store.ts` | `2ee9630127316917d4a3541f6d6b2485f33e2b99` | 14,376 | `22e6065f25723b71cea5fc065b74ff45e06ec3d5d580ff21d31bc626a9ce0a3a` |
| `src/persistence/provisioning.ts` | `dc844189a1c92f00acc3d7572c22f3e28e138eb6` | 4,330 | `7f04f86a9c23bd0c94def29d829bb0c54033bed941a8c77e35365c30bdbdba30` |
| `tests/g3_binding_resolution.test.ts` | `c3e130a404b2cf43c368e672aeb7916dfb66f7d9` | 13,584 | `ffbce91821ec8b6a01e0c2e4c3d79899b28ab0543041c8c77c892522022dbd55` |
| `tests/g3_caller_authority.test.ts` | `ef76ad744e380aeeea01b7a41646b5defc348daf` | 5,990 | `378312ff41015749c2e81d4bd351973359553dd8bc597c17e91eb5ad6feadc78` |
| `tests/g3_durability_vocabulary.test.ts` | `8a87c33d6ee1a742ec6947ec6829254ff21dbb1c` | 4,472 | `d4acfdf26291a86dd0db97725dd752c4ce2dc18f7c7ab54f3d91edec31a3fd24` |
| `tests/g3_ipc_framing.test.ts` | `c4a4a88a88052451c69b5b2ae277fa5d85ee7ea5` | 30,969 | `6ae6a2ac41de1d05022bc8ebc1e950fed675cebe4a43e3512e45da7d5a3506b8` |
| `tests/g3_no_network_listener.test.ts` | `b1e48c70b111c5ef49db8924faeb2728ce093b5e` | 9,248 | `9f835f8be79f3cc1bee4d57ae479d9a293bc3316698a7bbede873e7c9d59e39f` |
| `tests/g3_portfolio_read_isolation.test.ts` | `7b978625bdac8041e2dc683201637d54789f2926` | 7,308 | `1b2251a67e0d7296cbcd9f555994ebff50b96353a9f46d602b46ab5f913822a6` |
| `tests/g3_startup_validation.test.ts` | `9a5fd9e3b22693e95304a1cd2df812bbf9ea2299` | 14,804 | `b853663f4edd3082515ab88eabd6f75bf3db3ba389df3fc8337dc8fd7e4cc41b` |
| `tests/g3_write_gate.test.ts` | `9035cbf129d4c1182d3a85f61eabc821b86433bc` | 9,054 | `7b8ed49990154525fb4d050ca3e46763a902ee0f5873daf2e996b863752dbd5d` |

### 4.4 The 10 frozen anchors across the four commits, with intervening-change provenance

| # | Act §4.1 anchor | `B` | `H` | `M` | `P` | Intervening provenance / conflict finding |
|---|---|---|---|---|---|---|
| 1 | `frontend/src/features/portfolio/portfolioStorePort.ts` | `d61f18dfdc` | `=` | `=` | `=` | Byte-identical across all four; 29-key guard and `SESSION_ONLY`/`durable:false` intact |
| 2 | `frontend/src/features/portfolio/portfolio-store.ts` | `3bf852b99e` | `=` | `b900a2481b` | `b900a2481b` | **Intervening `main` change** — PR #30 (`2bf4def`, merge `63b8bee`), 2 lines in the `computeLineageHash` provenance tag. **No contract/signature conflict** with `durablePortfolioStorePort.ts`; green under the candidate's hosted CI on `P` |
| 3 | `src/identity/mapping_store.ts` | `eec60c09e0` | `=` | `=` | `=` | Byte-identical across all four |
| 4 | `src/identity/security_master.ts` | `e260fd90d0` | `=` | `60030e0c17` | `60030e0c17` | **Intervening `main` change** — PRs #28/#30, additive optional `sourceRevision?: GovernedSourceRevision`. **No conflict** with `binding.ts` or any Gate 3 path |
| 5 | `src/identity/quarantine.ts` | `70c6f6580f` | `=` | `=` | `=` | Byte-identical across all four |
| 6 | `package.json` | `0a3eec22a3` | `=` | `=` | `=` | Byte-identical across all four; zero dependency/script/`engines`/`exports` change |
| 7 | `package-lock.json` | `d3d7b12b6f` | `=` | `98ae3c63f4` | `98ae3c63f4` | **Intervening `main` change** — PR #32 (`8499ab3`), 3-line transitive advisory patch. **No install-graph conflict**; `npm ci` green in hosted CI |
| 8 | `tsconfig.json` | `6d696ec21b` | `=` | `=` | `=` | Byte-identical across all four |
| 9 | `.github/workflows/ci.yml` | `aeee464feb` | `=` | `=` | `=` | Byte-identical across all four (see §5) |
| 10 | `vite.config.ts` | `5563e1bcfa` | `=` | `=` | `=` | Byte-identical across all four |

**IRR-side parallel recognition (`Q1-B.3`).** The `Q1` act §3.2 basis-reconciliation duty is additionally satisfied for the IRR consumer surface: post-PR-#157 movement of the act §5.7/§5.2 paths comes exclusively from the PA-accepted Stage A commit `c155b917…` (`CV-CORR-46`/`CV-CORR-47`, tracker §§16.63–16.64) — `frontend/package.json` (`db536bd0… → a6a0521c…`), `.github/workflows/ci.yml` (`2d25176d… → b95a502a…`), `frontend/server/executive-transport.ts` (`53bc5e37…`) — and the two §5.3 fence blobs remain **byte-identical** (`cb8db45d…`, `51704c12…`). No IRR manifest path is extended or re-scoped by this instrument.

### 4.5 What `Q1-B` does **not** do

- It does **not** re-pin the act's immutable basis `be32d8c9…`; §4.1's blobs remain the reference for `Q1-B.1`.
- It does **not** authorize any path outside the 22, in either direction.
- It does **not** treat intervening `main` state as candidate-authored evidence.
- It does **not** generalize to any other IPD lineage, branch, PR or future merge.
- It does **not** by itself satisfy any condition other than condition 1.

---

## 5. `G3-AMEND-01-Q2` — **ADOPTED: `Q2-A`, `ci.yml` Frozen Anchor Retention**

### 5.1 Determination

`.github/workflows/ci.yml` **must remain byte-identical** to act §4.1's frozen anchor `aeee464feb76e2d1e9d104e1cae4e5dde37700ad` on the candidate head **and** on the merged `main`. No unrelated source, test, runner, or configuration change is authorized, and the amendment adds **no** manifest path.

### 5.2 Verified evidence

| Check | Result |
|---|---|
| `ci.yml` blob at `B`, `H`, `M`, `P` | **`aeee464feb76e2d1e9d104e1cae4e5dde37700ad` at all four** |
| SHA-256 / size (LF, in Git) | `0f7cdc1b1e9805a0e2e66819a09e7f07d043b154ab239d6cc709bd9c587b342c`, **3,749 B** — identical at `H` and `P` |
| Unauthorized deviation found and corrected | `673ec75` changed `ci.yml` to `f5af260e656317ce61a82340e24915e36a0c075e` (a two-leg `ubuntu` + `windows` matrix, **+10/−2**); `3eb13ed` (PR #34 head) inherited it untouched; `d15582d6` restores the anchor (**−10/+2**) |
| PR #41's own diff vs the anchor | **0 bytes** — 22 additions only, `ci.yml` is in none of them |

### 5.3 Governance readings recorded

1. The `673ec75`/`3eb13ed` matrix edit was a **manifest-external modification of a frozen anchor** and therefore failed act §10.1 condition 1 outright (the same finding recorded at tracker §16.72.2). It is **not** ratified, adopted or blessed by this instrument; it is confined to the superseded lineage and is absent from the authorized head.
2. Hosted CI for Gate 3 remains **`ubuntu-latest`** (act §10.2). No Windows leg is added to the workflow, and none is authorized.
3. Because `ci.yml` is never executed by `node --test`, restoring it does not invalidate the operator's native Windows direct-TAP result — the executable files it ran were byte-identical (`8466c704…`, `6ae6a2ac…`, `ffbce918…`), which is why no Windows re-run is required by this instrument.
4. `scripts/run-tests.mjs` is **not** modified, and no authorization to modify it is granted here (§6.4).

---

## 6. `G3-AMEND-01-Q3` — **ADOPTED: `Q3-A`, Windows Evidence Boundary**

### 6.1 Determination

The three evidence channels are **strictly separated** and may never be substituted for one another. The canonical Windows `npm test` wrapper is recorded as **FAILED**. Direct TAP is accepted **only** as supplemental defect-remediation corroboration. The applicable authoritative Gate 3 CI evidence is the **hosted Linux (`ubuntu-latest`) CI** run.

### 6.2 The three channels

| Channel | Command / platform | Verified result | Exact scope and limit |
|---|---|---|---|
| **1 — Hosted GitHub Actions CI (authoritative for act §10.1 condition 3)** | `.github/workflows/ci.yml`: `npm ci` → `npx tsc --noEmit` → `npm run build` → `npm test`, **`ubuntu-latest`**, workflow run **`39755870871`** (`pull_request`, head `d15582d6…`), checks **`119747608450`** (`typecheck · build · test`, `success`, completed `2026-10-22T09:30:22Z`) and **`119747795175`** (`executed test count`, `success`, completed `2026-10-22T09:30:19Z`) on merge tree `ce25a184…` | **PASS — 784 executed, 783 passed, 0 failed, 1 `windowsOnly` skip** | Satisfies act §10.1(3)'s mechanism on the platform act §10.2 designates. Must be re-confirmed by the **post-merge `main` push CI** (§7 M-7). Establishes **no** Windows host behaviour. |
| **2 — Native Windows canonical `npm test`** | `npm test` (`node scripts/run-tests.mjs`) on the operator Windows host | **`FAILED` (`NON-PASSING`)** — the suite itself passed; the **summary parser** in `scripts/run-tests.mjs` (`^# tests (\d+)$` vs the Windows runner's summary) triggered the CV-35 zero-test guard | **Never to be represented as passing**, in any record, summary, tracker row, release note or report. Not repaired by this instrument. |
| **3 — Native Windows direct TAP** | `node --test --test-reporter=tap dist/tests/*.js` on the operator host, log `g3-connection-release-direct-tap-20261022-013113.log` | **PASS — 754 total, 750 passed, 0 failed, 4 skipped (`posixOnly`), exit 0** — **operator-supplied, not Arena-observed** | **Supplemental defect-remediation evidence only.** It corroborates the named-pipe slot-release fix on byte-identical code blobs. It is **not** a passing canonical test command, **not** a substitute for channel 1, runs on the pre-merge 754-test inventory (not the 784 executed in CI), and is **not** Gate 4 (`QE-1…QE-11`) host qualification. |

### 6.3 Why this separation is the correct reading

Act §10.1(3) names the *commands* and act §10.2 names the *platform*: both repositories' CI run `ubuntu-latest` only, and §10.2 states in terms that passing CI cannot establish restart durability, crash atomicity, Windows named-pipe/ACL behaviour, host zero-bytes, or revocation-after-restart. Those are Gate 4 / Gate C items executed by the operator on `desktop-no0nhtp`. `Q3-A` therefore does not lower the Gate 3 bar; it identifies which evidence meets it.

### 6.4 Deferrals fixed by this determination

1. Any bounded repair of `scripts/run-tests.mjs`'s Windows summary parsing is **deferred to a separate PA act within Gate 4**. It is **not** authorized here, and it may not be introduced as a Gate 3 manifest addition.
2. `QE-1…QE-11`, Gate C `Q1–Q4`/`Q9–Q11`, Windows named-pipe/ACL, C5.1/Q9 zero-bytes, restart durability and revocation-after-restart remain **NOT EXECUTED / NOT ACCEPTED**.
3. The operator-supplied Windows result remains **operator-supplied**: Arena has not observed that host, and this instrument does not claim otherwise.

---

## 7. IPD PR #41 — merge authority and conditions

### 7.1 The authorization

On this instrument becoming effective (§12), and subject to **every** condition below being verified **at merge time**, the merge of **IPD PR #41** into IPD `main` is **expressly authorized**. The default disposition is **MERGE**; it is deliberately **not** a merge-on-CI-alone and it is **void** if any condition fails.

| # | Condition | Content |
|---|---|---|
| **M-1** | **Exact identity** | Exactly **`d15582d68167461e814ec8f7873dc18e3df5ab71`** on `g3/windows-validated-20261022-145739`, tree `5edb9fe79e7e907be661ea10c7021a96be762821`, into IPD `main` `c0e1b5662264651246db1ccde2945eb5e13f3524`. **No** rebase, cherry-pick, squash, force-push, amend, re-derivation, or direct commit to `main`. If head or base has moved before merge, this authority **lapses** and re-derivation under a fresh determination is required. |
| **M-2** | **Form** | A **merge commit** created through the pull request (`--merge`). Not squash, not rebase. |
| **M-3** | **Pre-merge re-validation (live, at merge time)** | Head and base SHAs unchanged; PR `mergeable` / `clean` with zero conflicts; merge preview commit and tree re-read; `Q1-B.1` **and** `Q1-B.2` re-proved (22 `A` / 0 `M` / 0 `D` on both sides; 22/22 identical blobs; 10/10 anchors at head vs `be32d8c9`; 10/10 anchors at the merge commit vs pre-merge `main`); channel-1 CI checks both `success` on the head. |
| **M-4** | **DEC-06 boundary** | Satisfied as determined at §8 — this authority is independent of `DEC-06` and does not rely on or extend it. |
| **M-5** | **Evidence currency** | Channel 1 (§6.2) is `success` on the exact head; no newer commit on the branch exists; the 754→784 inventory difference is accounted for (8 Gate 3 suites × the intervening additions) and the executed count is non-zero with zero failures. |
| **M-6** | **No expansion** | No other PR is merged; no file outside the 22 is touched; `ci.yml`, `package.json`, both lockfiles, `tsconfig.json`, `vite.config.ts`, `scripts/run-tests.mjs` and `src/identity/*` are unchanged by the merge; no dependency, workflow or configuration change. |
| **M-7** | **Post-merge obligations** | After the merge: the post-merge `main` **push** CI must pass; and the record must state the **merge commit SHA**, **CI run id**, **executed/passed/failed counts**, `git merge-base --is-ancestor d15582d6 origin/main` = true, 22/22 blob equality at remote `main`, and 10/10 anchor equality at remote `main` vs pre-merge `main`. |
| **M-8** | **Fail-closed handling** | If the merge is refused (permission), conflicts, or CI fails: **do not force, do not approximate, do not substitute**. Record the exact failure, leave PR #41 **open and unmerged**, and report the minimum operator action. |
| **M-9** | **Superseded PR #34** | **Not merged, not modified, not closed** by this instrument. It remains an unrelated superseded lineage; closing it is an administrative action outside this authority. |
| **M-10** | **Scope of effect** | The merge establishes Gate 3 *implementation evidence* only. It grants no Gate A′ execution, no Gate 4/QE, no Gate C, no Gate 4 result acceptance, no Gate 5 admission, no `503` lift, no `durable:true` claim, no production eligibility, no Row 26 change and no product-consumer integration. |

### 7.2 Live state at rendering (re-verified this pass, not carried over)

| Field | Verified value |
|---|---|
| PR | `ramkivs/iips-production-market-data` **#41** — "Gate 3: Windows-validated IPC correction candidate" |
| State | `OPEN`, `draft: false`, `merged: false`, `merged_at: null`, **0 reviews**, 0 review comments, 3 commits |
| Head / tree | `g3/windows-validated-20261022-145739` @ `d15582d68167461e814ec8f7873dc18e3df5ab71`, tree `5edb9fe79e7e907be661ea10c7021a96be762821` |
| Base | `main` @ `c0e1b5662264651246db1ccde2945eb5e13f3524` (unchanged since the packet) |
| Mergeability / preview | **`MERGEABLE` / `clean`**, 0 conflicts; `refs/pull/41/merge` = `ce25a184d3dc22cd2d6e5c0ff9f277f3d541de5d`, tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9` |
| Diff | 22 files, `+4,696 / −0` — 22 `A`, 0 `M`, 0 `D` |
| Hosted CI | Workflow `CI` (id `387655277`) run **`39755870871`**, conclusion `success`; checks `119747608450` and `119747795175` both `success` — **784 executed, 783 passed, 0 failed** |
| Repository permissions reported to the session | `GET /repos/…` → `permissions: {admin: true, maintain: true, push: true, triage: true}`; `main.protected: false` |
| **Actual write capability** | **DENIED.** `git push --dry-run origin c0e1b566…:refs/heads/main` → `remote: Permission to ramkivs/iips-production-market-data.git denied to ramkivs.` / `fatal: … The requested URL returned error: 403`. The reported `permissions` object is **not** evidence of write capability; the observed git transport denial governs. |
| Superseded PR #34 | `OPEN`, `merged: false`, head `3eb13ed637ac61bd971da1a06883da4b4564447b`, base `3d44e0a1…`, `mergeable_state: clean` — **untouched** |

### 7.3 The consequence of the write boundary, stated exactly

Authority and capability are different things. This instrument supplies the **authority**; the session's credential supplies no **capability**. If the merge is attempted and the remote refuses it, that refusal is recorded verbatim at §12 as the binding outcome and PR #41 stays open. **No merge will be claimed that did not occur.** The minimum operator action is fixed at §12.3.

---

## 8. `DEC-06` boundary — expressly addressed

### 8.1 The exact text in issue

The governance record excludes the Gate 3 lineage from `DEC-06`'s determination. The operative text is:

- `DEC-06` record **§1.4**: *"It does not generalise. The determination at §8 is expressly confined to the two named commits and the five named paths. It grants nothing for any other IPD implementation, and in particular nothing for IPD PR #34 (the Gate 3 candidate), which is a different lineage and is unaffected."*
- `DEC-06` record **§6**: *"Gate 3 (`CV-39`): BLOCKED / NOT ACCEPTED … untouched. IPD PR #34 untouched."*
- Tracker **§16.70.8**, prohibition (6): *"no use of this record as authority for any other implementation, repository, or IRR product change"*.

**Citation correction (additive, no record rewritten).** The exclusion is **not** located at `DEC-06` §4.2. `DEC-06` §4.2 is rule `R-2` ("established scope is set by PA product decisions and governing boundaries"), which contains no exclusion of PR #34 or its successors. The exclusion is at §1.4, §6 and tracker §16.70.8(6). This instrument records the correct location and preserves the original text verbatim.

### 8.2 Determination

1. **The exclusion is a scope limit on `DEC-06`, not a prohibition on the Gate 3 lineage.** Read in its own words, `DEC-06` grants nothing for the Gate 3 candidate because that candidate was never within `DEC-06`'s subject matter (P11 main admission). A record that grants nothing about X does not forbid X; it forbids *relying on that record* for X. That is exactly what prohibition (6) says.
2. **`DEC-06` is resolved for PR #41 in the only way it can be — by independent authority, not by reinterpretation.** The authority for PR #41 is this instrument, rendered in the **Gate 3 capacity** under the governing Gate 3 act plus the Program Authority's `2026-10-22` determination. It **does not cite, rely on, extend, or borrow** `DEC-06`; it expressly records that `DEC-06` grants nothing for this lineage and that nothing here may be cited as `DEC-06` authority.
3. **Effect.** As of this instrument's effectiveness, **no `DEC-06` provision operates as a bar to the merge of PR #41**. `DEC-06`'s own text, its prohibitions, its completed P11 admission and its register position remain **byte-unchanged**. PR #34 remains untouched and unmerged.
4. **No widening.** The reverse direction is preserved with equal force: nothing in this instrument may be cited as authority for any other IPD lineage, for P11, for `src/engine_adapters/**`, for any product consumer, or for any IRR product change.

---

## 9. Amended Gate 3 acceptance conditions (`AC-1`…`AC-8`)

Act §10.1's seven conditions are preserved and re-read with `Q1-B` (§4) and `Q3-A` (§6) applied; `AC-8` states the acceptance-record requirement explicitly.

| # | Condition (as applied) | Status at rendering |
|---|---|---|
| `AC-1` | **`Q1-B.1` + `Q1-B.2`** both proved at the merge commit (22 `A` / 0 `M` / 0 `D` on both limbs; 10/10 anchors on both limbs; intervening changes enumerated and non-conflicting) | **`Q1-B.1` PASS** at `d15582d6`; **`Q1-B.2` PASS** on the merge preview `ce25a184`. **Must be re-proved at the actual merge commit** (§7 M-3/M-7) |
| `AC-2` | IRR manifest present; §5.3 fence blobs byte-stable (`cb8db45d…`, `51704c12…`) | **PASS** — both fence blobs unchanged; C8 lines intact |
| `AC-3` | IPD `npx tsc --noEmit`, `npm run build`, `npm test` pass, non-zero executed count, ≥ 556 tests, 0 failures — **on the `ubuntu-latest` channel (`Q3-A`)** | **PASS on PR #41 CI** (784 / 783 / 0). **Post-merge `main` push CI still required** (§7 M-7) |
| `AC-4` | IRR `npm run typecheck`, `npm run test:ci`, `node .ci/assert-tests.js`, `npm run build` pass, ≥ 814 tests, 0 failures | **PASS — freshly executed this pass** at IRR `81f8ccf…`: typecheck exit `0`; `87` files / **`1,077` passed** / `0` failed; `assert-tests: OK — 87 test file(s), 1077 test(s), 0 failed`; build exit `0` (94 modules) |
| `AC-5` | The 8 act §4.3 test files present in the executed set and named in the record | **PASS** — 8/8 present at `d15582d6`, all named in §4.3 |
| `AC-6` | `SESSION_ONLY` / `durable:false`, the 29-key guard, the `503` fence and both fence-file blobs unchanged | **PASS** — 10/10 anchors byte-stable; no fence file touched |
| `AC-7` | The record states exact commits, commands, counts and CI run identifiers — and states that no Windows, deployment-host, Gate A′, Gate C, `QE-1…QE-11`, Gate 4, result-acceptance, Gate 5 or production evidence is thereby established | **Satisfied by §10's acceptance record**, once rendered at the post-merge commit |
| `AC-8` | The **Gate 3 acceptance record** (ID `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01`) is rendered and **effective** — published to IRR `main` with green CI and remote SHA-256 read-back | **NOT YET RENDERED.** Gate 3 is therefore **NOT ACCEPTED** at this record's preparation |

---

## 10. Acceptance protocol — not automatic, and not implied

1. **On satisfaction** of `AC-1`…`AC-7` at the exact post-merge IPD `main` commit, and of the IRR-side conditions at the exact IRR commit, the **Gate 3 acceptance record** `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` shall be rendered as a **distinct record** under this instrument's authority, stating the exact commits, commands, counts, CI run identifiers, the dual-anchor proof at the merge commit, the three-channel evidence separation of §6, and the non-grants of §11.
2. **On any failure**, no acceptance record is rendered and Gate 3 remains `BLOCKED / NOT ACCEPTED`; this instrument's other determinations stand on their own terms.
3. **Gate 3 is accepted only when** that acceptance record is published to IRR `main` with green PR-head and post-merge CI plus remote read-back. Until then — including while this instrument alone is effective — **Gate 3 is NOT accepted**, and no record, tracker row, README, release note or report may say otherwise.
4. **This instrument accepts nothing.** It decides the three questions and authorizes one bounded merge.

---

## 11. Non-grants and preserved safeguards

- **Gate 3 is `BLOCKED / NOT ACCEPTED`** until §10 completes.
- **`SESSION_ONLY` / `durable:false`** is unchanged; **no `durable:true` claim** is permitted or made.
- **All `/api/user-portfolios*` IRR routes remain HTTP `503 owner-context-unavailable`** (`cb8db45d…` / `51704c12…`); no `503` lift is granted or implied.
- **Gate A′ provisioning** remains **`APPROVED / P-1 ADOPTED / NOT EXECUTED`**.
- **Gate 4 (`QE-1…QE-11`), Gate C, Gate 4 result acceptance, Gate 5 admission and production eligibility** remain **NOT EXECUTED / NOT GRANTED / NOT AUTHORIZED**.
- **Row 26, P11, `src/engine_adapters/**`, product-consumer integration and IPD/IRR equivalence** are untouched.
- **No dependency, lockfile, workflow, runner, script, tsconfig or Vite configuration change** is authorized in either repository.
- **No off-main lineage may be promoted**: the 2026-10-07 durable line, Gate B `cec70802`, G24 `6828155e` and the `better-sqlite3` implementation remain reference-only (act §9, G3-D5).
- **No fabricated evidence, no weakened safeguard, no unverified success claim.** Where this pass lacked capability, it says so (§7.3) instead of asserting success.

---

## 12. Publication, effectiveness and verification record

### 12.1 Effectiveness rule

This instrument is **effective** when **all** of the following hold: (a) this exact content is published to `ramkivs/iips-review-recovered` `refs/heads/main` through the repository's PR workflow; (b) the PR-head and post-merge CI runs pass; (c) remote read-back matches this file by SHA-256; (d) `git ls-remote origin refs/heads/main` agrees with the merge commit. Before all four, it is **RENDERED — NOT EFFECTIVE** and authorizes nothing. The governing act's own effectiveness is untouched by this rule.

### 12.2 Read-back (completed by the post-merge receipt)

| Field | Value |
|---|---|
| IRR PR | *recorded in the receipt commit / tracker `§16.75`* |
| PR head SHA | *as above* |
| PR-head CI run / result | *as above* |
| Merge commit on IRR `main` | *as above* |
| Post-merge `main` CI run / result | *as above* |
| Remote SHA-256 of this file | *as above* |
| IPD merge commit (if executed) | *as above, with post-merge `main` CI run id* |

### 12.3 Minimum operator action, if the IPD merge is capability-blocked

Either **(a)** execute the merge from a session whose credential has write capability on `ramkivs/iips-production-market-data` (`gh pr merge 41 --merge --repo ramkivs/iips-production-market-data`), **or** **(b)** grant this installation `Contents: Read & write` + `Pull requests: Read & write` on that repository and re-run the §7 M-3/M-7 verification. In either case the merge must be **merge-commit only**, at the exact head in §7.1 M-1, and the post-merge `main` push CI plus blob/ancestry read-back must be recorded before any acceptance record is rendered.

---

## 13. Verification index (this pass)

| ID | Check | Result |
|---|---|---|
| `A1` | IRR `main` resolved live: `81f8ccfc8b098b122f1b12341549dc8074f2e0b2`; local `HEAD` identical; worktree clean at pass start | **PASS** |
| `A2` | Full unshallowed IPD fetch; `main` `c0e1b566…`, `refs/pull/41/head` `d15582d6…`, `refs/pull/41/merge` `ce25a184…`, branch `g3/windows-validated-20261022-145739` `d15582d6…` | **PASS** |
| `A3` | `git diff --name-status be32d8c9 d15582d6` → 22 `A` / 0 `M` / 0 `D`; `git diff --name-status c0e1b566 ce25a184` → same 22 `A` / 0 `M` / 0 `D`; 22/22 blob equality `H` vs `P`; merge base `be32d8c9`; `B` ancestor of `main` | **PASS** (`Q1-B.1`, `Q1-B.2`) |
| `A4` | 10 act §4.1 anchors: 10/10 at `H` = `B`; 10/10 at `P` = `M`; 3 intervening `main` updates (`b900a248…`, `60030e0c…`, `98ae3c63…`) enumerated with PR provenance and found non-conflicting | **PASS** (`Q1-B.3`) |
| `A5` | `ci.yml` = `aeee464feb76e2d1e9d104e1cae4e5dde37700ad` at `B`, `H`, `M`, `P`; SHA-256 `0f7cdc1b…`; 3,749 B; `673ec75`'s `f5af260e…` deviation absent from the authorized head | **PASS** (`Q2-A`) |
| `A6` | Hosted CI run `39755870871` inspected: `event=pull_request`, `head_sha=d15582d6…`, `conclusion=success`; checks `119747608450` and `119747795175` both `success`; combined status `total_count 0` (no legacy statuses) | **PASS** (channel 1) |
| `A7` | PR #41 live state: `OPEN`, `draft:false`, `merged:false`, `mergeable:true`, `mergeable_state:clean`, 0 reviews, 3 commits, 22 files, `+4,696/−0`; PR #34 `OPEN`/`merged:false` at `3eb13ed…`, untouched | **PASS** |
| `A8` | IPD write capability: `git push --dry-run … :refs/heads/main` → `403 Permission … denied to ramkivs`; repository `permissions` object reports `push:true` but is **not** evidence of capability | **PASS (denial recorded)** |
| `A9` | Fresh IRR execution in `frontend/` at `81f8ccf`: `npm ci` (188 packages) → `tsc --noEmit` exit `0` → `test:ci` **87 files / 1,077 passed / 0 failed** → `assert-tests: OK` → `npm run build` exit `0` (94 modules) | **PASS** (`AC-4`) |
| `A10` | Preserved records re-hashed: act `4744e6f4…` / `f4992f9c…` / 51,662 B; `DEC-06` `4be3ea57…`; packet `94171eaa…`; native-Windows record `4ffbfd97…`; `§16.71` `3d820b3c…`; `§16.73` `70be5e65…`; `F-3` `c4c9f7d7…`; `Q1` `de786032…` | **PASS** |
| `A11` | Section and identifier uniqueness across the tracker: `16.55`…`16.74` each appear once; highest pre-existing `CV-CORR-*` = `CV-CORR-55`; highest pre-existing verification row = `V172`; `§16.75` / `CV-CORR-56` free and used once | **PASS** |
| `A12` | `DEC-06` exclusion located precisely (§1.4, §6, tracker §16.70.8(6)) and determined not to operate as a bar (§8); §4.2 mis-citation recorded and not carried forward | **PASS** |

---

## 14. Decision provenance summary

| Element | Value |
|---|---|
| Decision | `G3-AMEND-01` = `Q1-B` + `Q2-A` + `Q3-A`, plus bounded merge authority for IPD PR #41 |
| Decided by | **Ramki — Program Authority**, by direct explicit selection in the operating session, `2026-10-22` |
| Recorded by | Arena Agent Mode (recording, publication, verification only) |
| Recorded on | `2026-10-22` (UTC), its actual date |
| Recorded in | This instrument; tracker `§16.75` / `CV-CORR-56`; packet-index row; dated pointers in the prepared packet and the native-Windows record |
| Not claimed | Signature, signed instrument, approval ID, approval timestamp, spoken-selection quotation, third-party confirmation, external witness, agent-held jurisdiction |
| Effective on | Publication per §12.1 |
| Effect on the original act | **None textually** — byte-identical preservation; operative application of three clauses only, for evaluations on/after the effective date |

*End of `G3-AMEND-01`. Gate 3 remains `BLOCKED / NOT ACCEPTED` until the acceptance record of §10 is rendered and effective. This instrument authorizes one bounded merge and nothing else.*
