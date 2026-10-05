# NP-13 — D2-B OPERATIONAL REF BINDING & INITIAL AUTHORITATIVE EVIDENCE DESIGNATION: EXPLICIT PA DECISION

> **Record identifier:** `NP-13-PA-D2-B-REF-BINDING-EVIDENCE-DECISION-01`
>
> **Gate:** NP-13 D2-B — Operational Ref Binding & Initial Authoritative Evidence Designation
>
> **Decision date:** 2026-10-03
>
> **Decision effective point (UTC):** `2026-10-03T17:28:00Z` (decision act rendered; durable effectiveness subject to `E-3 §6.2` item 3 durable recording on `refs/heads/main` and independent remote verification)
>
> **Program Authority:** Ramki (Ramakrishnan)
>
> **Decision:** **PA-D2-B-01 = A — BIND `ramkivs/iips-review-recovered` @ `refs/heads/main` AND DESIGNATE INITIAL PRIMARY EVIDENCE TREE `962d7ea322e4ade5cda61c3fc9335de616903daf` (SUPPORTING COMMIT PROVENANCE `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd`)**
>
> **Durability status:** **NOT DURABLE — publication pending separate authorization**

---

## 1. Explicit Program Authority Decision (`E-3` Act)

Ramki, as Program Authority, explicitly selected:

> **PA-D2-B-01 = A — Bind repository `ramkivs/iips-review-recovered` and mutable operational ref `refs/heads/main`; designate verified root Git tree `962d7ea322e4ade5cda61c3fc9335de616903daf` (with supporting commit provenance `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd`) as the initial authoritative evidence coordinate.**

This decision is an explicit Program Authority governance act under `NP-13-D0-01 §2.2–§2.3`, `NP-13-GO3B-DECISION-01 §2–§8` (`A`, `B-3`, `C-4`, `D-3`, `E-3`, `F-3`, `G-4/G-5`), `NP-13-D2-01-DEFINITION-01 §4.4`, `NP-13-PA-D2-ELIGIBILITY-01 §3`, and `NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01 §1–§4`. It is **not** inferred from implementation convenience, repository proximity, default-branch naming, current `HEAD`, or the fact that `ramkivs/iips-review-recovered` serves as the governance durability repository.

---

## 2. Governed Coordinate Tuple and Exact Relationship (`M1`, `B-3`, `C-4`, `F-3`, `G-4/G-5`)

Per `NP-13-D1-01 §2.1–§3.2`, `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01`, `NP-13-GO3B-DECISION-01 §2–§8`, and `NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01 §2–§3`, the exact relationship among the governed logical object and the three `B-3` coordinates established by this `D2-B` act is:

| Element | Governed Role (`B-3` / `C-4` / `F-3` / `G-4`) | Designated / Preserved Value | Mutability & Identity Rule |
|---|---|---|---|
| **Governed logical object** | Component (a) of `G-O-3`: authoritative logical representation (`NP-13-D1-01 §3.1`, `540` bytes, SHA-256 `29f2d5f6ab28d96d7a9e9466af5709afc94eddab95d3cbf1576708aa0b65dcc7`; governed by `D1-C #1–#10` lifecycle/identity rules; gate shorthand `IIPS-NP-FEATURE-BASELINE`) | The active non-production IIPS feature baseline (`D1-B` verbatim definition; epoch `1` per `D1-C #3`) | **Governed-object identity.** Independent of repository, operational ref, Git tree, Git commit, runtime, and implementation (`G-4 §8.2`). |
| **Bound repository** (`D2-B` output `a`; `B-3` element 1) | Required repository binding relationship under `G-O-3(b) A` and single-repository/ref baseline nature `M1` | `ramkivs/iips-review-recovered` (`https://github.com/ramkivs/iips-review-recovered.git`) | **Relationship, not identity** (`A §2.2`). Does not convert the repository into the governed object. |
| **Bound mutable operational ref** (`D2-B` output `b`; `B-3` element 2; `C-4` role 1) | **Governance / realization coordinate** under `M1` and `C-4 §4.2` | `refs/heads/main` (tracked as `origin/main` in `ramkivs/iips-review-recovered`) | **Mutable coordinate** (`B-3 §3.4`). Moves mechanically as Git commits/merges occur; movement does **not** change governed-object identity or automatically refresh authoritative evidence (`D-3 §5.2`). |
| **Initial authoritative evidence coordinate** (`D2-B` output `c`; `B-3` element 3; `C-4` role 2; `F-3` primary) | **Primary immutable content-addressed evidence coordinate** (`C-4 §4.2`, `F-3 §7.2`) | Git root tree SHA `962d7ea322e4ade5cda61c3fc9335de616903daf` | **Immutable content-addressed coordinate** (`B-3 §3.4`, `F-3 §7.3`). Establishes exact realization content at the initial designation point; changes only by a later explicit `D-3` evidence-refresh act. Never governed-object identity. |
| **Supporting commit provenance** (`D2-B` output `c`; `F-3` supporting provenance) | **Supporting provenance / history** about the designated primary evidence tree (`F-3 §7.2–§7.3`) | Git commit SHA `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` (first parent `59adbfd22df3f582fb7d1b399797f14a7e111f4d`, second parent `ae4645e2102808ff7f3a3b3186b2a787290f998b`, commit timestamp `2026-10-03T17:16:38Z`, subject `docs(np-13): publish D2-A M1 baseline nature decision`) | **Supporting provenance only** (`F-3 §7.3 rules 3, 4, 9`). Supplies authorship, timing, message, and parentage; not the primary evidence coordinate and never governed-object identity. |

### 2.1 Non-Collapse and Non-Equivalence Invariants Preserved

1. **Governed-object identity ≠ repository/ref identity (`GO3B §3 boundary 1`, `G-4 §8.2`):** Binding `ramkivs/iips-review-recovered` and `refs/heads/main` establishes a governance/evidence relationship (`A §2.2`); it does not equate the governed logical object with `ramkivs/iips-review-recovered` or `refs/heads/main`, and creates no new governed object (`G-4 §8.3–§8.4`).
2. **Mutable operational ref ≠ immutable evidence coordinate (`B-3 §3.3–§3.4`, `C-4 §4.4.1`):** `refs/heads/main` (the mutable governance/realization coordinate) and Git tree `962d7ea322e4ade5cda61c3fc9335de616903daf` (the immutable authoritative evidence coordinate) occupy deliberately separated roles and are non-interchangeable.
3. **Git tree primary evidence ≠ Git commit supporting provenance (`F-3 §7.2–§7.4`):** Evidence replay and content verification operate on the immutable Git tree `962d7ea322e4ade5cda61c3fc9335de616903daf`; commit `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` is recorded strictly as supporting provenance.
4. **Effect of subsequent mechanical ref advancement (`D-3 §5.2 rules 1–6`, `§5.3.1–§5.3.2`):** When this record (`NP-13-PA-D2-B-REF-BINDING-EVIDENCE-DECISION-01`) or any subsequent commit is published to `refs/heads/main`, `refs/heads/main` will advance mechanically to a new commit `C2` (`tree(C2)`), while the authoritative evidence coordinate designated here remains `962d7ea322e4ade5cda61c3fc9335de616903daf` (`tree(C1)`) until a separate explicit `D-3` evidence-refresh act is performed. Under `D-3 §5.2 rule 4`, `{ref=C2; evidence=tree(C1)}` is a valid, well-formed governance state and not a defect or automatic refresh trigger.

---

## 3. Closed-World D2-B Investigation Findings

### 3.1 Eligible Repository under the Authoritative NP-13 Corpus

- Under `NP-13-D0-01 §2.2`, NP-13's bounded jurisdiction (`J-1` definition, `J-2` composition, `J-3` membership) is confined to the active non-production feature baseline in `ramkivs/iips-review-recovered` (`IRR`), while `ramkivs/iips-production-market-data` (`IPD`) and production are explicitly **OUT OF SCOPE / READ-ONLY** across all 16 predecessor NP-13 records (`NP-13-D0-01`, `NP-13-D1-01`, `NP-13-GO3B-01`, `NP-13-GO3B-DECISION-01 §11.6`, `NP-13-D2-01-DEFINITION-01 §1.6, §6.3, §12.2`, `NP-13-PA-D2-ELIGIBILITY-01`, `NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01`).
- Under `D2-A = M1` (`NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01`), the baseline is anchored to a **single repository/ref**.
- Accordingly, **`ramkivs/iips-review-recovered`** is the sole in-scope repository eligible for binding under `M1`. Its selection is established by Program Authority's explicit `E-3` act in §1, not inferred from durability storage.

### 3.2 Candidate Operational Refs Evaluated under `M1`

The investigation evaluated the mutable branch refs in `ramkivs/iips-review-recovered` referenced across the NP-13 corpus without pre-ranking them prior to the Program Authority decision:

1. **`refs/heads/main` (`origin/main`)** — commit `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd`, root tree `962d7ea322e4ade5cda61c3fc9335de616903daf`:
   - Repository default branch and authoritative durability destination under convention `C-1` (`NP-13-D1-01 §8.4`).
   - Carries all 16 durable NP-13 governance records (`NP-13-D0-01` through `NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01`), the NP-12 N4 governance records, and the NP-15 Phase-1 convergence declaration records.
   - **Selected by Program Authority (`PA-D2-B-01 = A`).**
2. **`refs/heads/arena/01a0f351-iips-review-recovered`** — commit `5fde821b376bcace00be50f573d6d79b54ae0f83`, root tree `2ca9bf168c416eee13613f6d1b9cb708cf826775`:
   - Session/implementation branch carrying `NP-13-AUTH-02`, `NP-13-AUTH-01`, `NP-09-PROMO-01`, and the canonical NP-13 implementation commit `034384fbd1d1c359a95afa1dad294507fdfd3269` (root tree `d15a6d08f3a8bdabefdf5565fb7814975a312957`), cited in `NP-13-D0-01` header as the pre-D0 NP-13 evidence coordinate under convention `C-2`, but lacking all 16 `NP-13-D0-01`..`NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01` governance records.
   - **Not selected as the bound operational ref at D2-B** (preserved unchanged as historical/lineage evidence for downstream `D2-C` and `D3` evaluation).
3. **Alternative initial-tree pairing (`{ref=refs/heads/main; evidence=tree(C1)}` under `D-3 §5.2 rule 4`) or deferral (`D2-B = NOT DECIDED`)**:
   - **Not selected.**

### 3.3 First Explicit Binding Act Confirmation

- Exhaustive verification across all 16 predecessor NP-13 records (`NP-13-D0-01 §9`, `NP-13-D1-01 §6.1, §7.5`, `NP-13-GO3B-01 §1.3, §5`, `NP-13-GO3B-DECISION-01 §2.3.4, §3.6, §15.1`, `NP-13-D2-01-DEFINITION-01 §4.4`, `NP-13-PA-D2-ELIGIBILITY-01 §6`, and `NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01 §3–§5`) confirms that **no prior record bound NP-13 to any repository or operational ref or designated an initial authoritative evidence coordinate for the governed baseline**.
- **This `D2-B` record is the first explicit `E-3` operational-ref binding and initial authoritative evidence designation act.**

### 3.4 Suitability and Contextual Disclosure for `refs/heads/main` Tree `962d7ea322e4ade5cda61c3fc9335de616903daf`

- **Cleanliness and stability:** Live `refs/heads/main` at commit `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` and root tree `962d7ea322e4ade5cda61c3fc9335de616903daf` is clean, immutable as a Git tree object, and independently verified across three mechanisms (§4.2).
- **Intervening NP-15 governance commits disclosed:** Between `NP-13-PA-D2-ELIGIBILITY-01` (`79483c8`) and `NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01` (`ac8a751`), commits `6dd5906262c9a94a87c8bcd321bc69b96c73707a`, `e3eefd8a0392286b607e88805b35407ad38d92be`, and `59adbfd22df3f582fb7d1b399797f14a7e111f4d` added three NP-15 governance records under `docs/integration/`. Those commits modified zero application/runtime files and zero NP-13 records, and explicitly disclaimed any NP-13 effect (*"Explicitly NOT resolved by NP-15: … NP-13"*).
- **Unmerged feature lineages disclosed without pre-deciding `D2-C` or `D3`:** As documented in `NP-13-D0-01 §6.2, §7.3`, the NP-09 / NP-10 / NP-11 / NP-13 feature implementation commits (`034384fbd1d1c359a95afa1dad294507fdfd3269`, `fa9862c9668f0deb9b1093415fdd9c551036240f`, etc.) reside on divergent branches (`arena/01a0f351-iips-review-recovered`, `arena/01a0f64b-iips-review-recovered`) and are not currently merged into `refs/heads/main`. Because `D2-B` establishes the institutional binding and initial authoritative evidence coordinate (`NP-13-D2-01-DEFINITION-01 §4.4`) — whereas realization semantics and `C-1`/`C-2` reconciliation belong to `D2-C` (`§4.5`) and baseline composition/membership belong to `D3` (`§5.1`) — designating `962d7ea322e4ade5cda61c3fc9335de616903daf` as the initial authoritative evidence coordinate does **not** exclude or include any workstream for `D3` and creates no contradiction.

---

## 4. Satisfaction of Required `E-3` Elements (`NP-13-GO3B-DECISION-01 §6.2`)

Per `NP-13-GO3B-DECISION-01 §6.2–§6.4`, an `E-3` binding / evidence-designation act requires five elements. Their exact status at this gate is:

| # | `E-3` Required Element (`NP-13-GO3B-DECISION-01 §6.2`) | Status at Decision Gate | Verification / Governance Basis |
|:---:|---|---|---|
| **1** | **Explicit governance act** | **SATISFIED** | Rendered explicitly by Ramki (Program Authority) selecting `PA-D2-B-01 = A` (§1). |
| **2** | **Successful target verification** | **SATISFIED** | Target repository `ramkivs/iips-review-recovered`, mutable operational ref `refs/heads/main`, primary evidence Git tree `962d7ea322e4ade5cda61c3fc9335de616903daf`, and supporting commit `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` verified live across three independent mechanisms in complete agreement (§4.2). |
| **3** | **Durable recording** | **PENDING SEPARATE PUBLICATION AUTHORIZATION & REMOTE VERIFICATION** | Prepared in this artifact (`docs/integration/NP-13-PA-D2-B-REF-BINDING-EVIDENCE-DECISION-01.md`). Per `C-1` and `E-3 §6.3.3–§6.4`, authoritative durability requires separate publication authorization, publication to `ramkivs/iips-review-recovered @ refs/heads/main`, and independent remote verification. |
| **4** | **Effective point / state** | **SPECIFIED** | Decision act rendered `2026-10-03T17:28:00Z` (UTC). Per `E-3 §6.4` fail-closed rule, the binding state is `DECISION RENDERED — PENDING DURABLE RECORDING` until element 3 is satisfied on `refs/heads/main`, upon which the binding becomes durably effective. |
| **5** | **Preservation of historical prior state** | **SATISFIED** | No prior repository/ref binding existed; the prior unbound state and all historical evidence/provenance pins across predecessor records are preserved unchanged without erasure (§4.3). |

### 4.1 Subtrees Verified Within Initial Primary Evidence Tree `962d7ea322e4ade5cda61c3fc9335de616903daf`

| Path in Root Tree `962d7ea322e4ade5cda61c3fc9335de616903daf` | Object Type | Verified SHA-1 |
|---|---|---|
| `/` (root tree of `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd`) | `tree` | `962d7ea322e4ade5cda61c3fc9335de616903daf` |
| `docs` | `tree` | `91fb999502d45a7bb47683e1f1ac8fdcf40687df` |
| `docs/integration` (containing all 16 durable NP-13 records) | `tree` | `cb89937e8dd40d84dbafdb0934fc9a2232c22cf9` |
| `iips-platform` (preserved in-repo tree pin) | `tree` | `27104015fc15ab21d8485be927e0202c584967a0` |

### 4.2 Independent-Mechanism Target Verification Evidence (`E-3 §6.3.2`)

All target coordinates were verified live on `2026-10-03` before the Program Authority decision act via three independent mechanisms:

| Verification Mechanism | Repository & Ref Queried | Observed Commit SHA | Observed Root Tree SHA | Result |
|---|---|---|---|---|
| **1. Live Git wire protocol (`git ls-remote origin refs/heads/main`)** | `https://github.com/ramkivs/iips-review-recovered.git` (`refs/heads/main`) | `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` | *(resolved via fetch)* | **AGREES** |
| **2. Local Git object inspection (`git rev-parse` / `git cat-file -p`)** | `/tmp/irr` synced to `origin/main` | `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` (parents `59adbfd22df3f582fb7d1b399797f14a7e111f4d`, `ae4645e2102808ff7f3a3b3186b2a787290f998b`) | `962d7ea322e4ade5cda61c3fc9335de616903daf` | **AGREES** |
| **3. Live GitHub REST API (`GET /repos/ramkivs/iips-review-recovered/commits/refs/heads/main`)** | `ramkivs/iips-review-recovered` (`refs/heads/main`) | `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` (`2026-10-03T17:16:38Z`) | `962d7ea322e4ade5cda61c3fc9335de616903daf` | **AGREES** |

### 4.3 Historical Preservation and Supersession Rules (`E-3 §6.3.5`, `F-3 §7.3`)

1. **Prior state preserved:** Prior to this act, the governed logical object had **no bound repository, no bound operational ref, and no designated authoritative evidence coordinate** (`NP-13-GO3B-DECISION-01 §2.3.4, §3.6`; `NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01 §3–§4`). That historical pre-binding state remains accurate as at all prior effective points and is not rewritten.
2. **Predecessor evidence pins preserved:** All historical evidence and provenance coordinates recorded in predecessor records — including `arena/01a0f351-iips-review-recovered @ 5fde821b376bcace00be50f573d6d79b54ae0f83` (tree `2ca9bf168c416eee13613f6d1b9cb708cf826775`), `034384fbd1d1c359a95afa1dad294507fdfd3269` (tree `d15a6d08f3a8bdabefdf5565fb7814975a312957`), `arena/01a0f64b-iips-review-recovered @ a7c421ae00de309687084fd05679c519c347d196` (tree `ae7b0e1ee6c10bc87e67d70aa0d431e2ce4bc0e3`), `fa9862c9668f0deb9b1093415fdd9c551036240f` (tree `59e28d0b1abe9cbcd81034ff69bf7e4a21e578bd`), and all `origin/main` pre-publication provenance pins in `NP-13-D0-01` through `NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01` — remain intact and valid as historical evidence of their respective records.
3. **Future refresh and rebinding rules:** Any subsequent refresh of the authoritative evidence coordinate requires a separate explicit Program Authority act under `D-3 §5.2 rule 5`, and any subsequent change of repository or operational-ref binding requires a separate explicit Program Authority act with target verification and historical preservation under `E-3 §6.2`. Both preserve governed-object identity under `G-4 §8.3` and `D1-C #5 / #7`.

---

## 5. Required Follow-On Boundaries and Explicit Non-Actions

This `D2-B` decision does **not**:

- reopen, amend, or reinterpret `D0`, `D1-A`, `D1-B`, `D1-C`, `G-O-3(b) A–G`, `CM-B`, `PA-D1-COMPLETION`, `D2-01-DEFINITION`, `PA-D2-ELIGIBILITY`, or `D2-A` (`M1`);
- change the governed logical object's identity (`D1-B` / `D1-C` / `G-4`) or advance its lifecycle epoch (`D1-C #3` remains at initial epoch `1`);
- resolve or harmonize the `IIPS` vs `IRR` terminology note (`NP-13-GO3B-DECISION-01 §2.4`; `NP-13-D2-01-DEFINITION-01 §5.1 row A-18`);
- decide `D2-C` realization semantics (what state of the operational ref or evidence coordinate establishes contribution membership, or how governance identity and runtime identity relate);
- reconcile durability conventions `C-1` and `C-2` (allocated to `D2-C` under `NP-13-D2-01-DEFINITION-01 §4.5`);
- declare `D2` complete (which requires `D2-C` completion plus a separate explicit `D2-CM-6` Program Authority completion act under `NP-13-D2-01-DEFINITION-01 §8.1`);
- define, convene, or execute `D3`, or make any `J-2` composition or `J-3` membership determination;
- determine the baseline membership status of `NP-09`, `NP-10`, `NP-11`, `NP-12` (`NP-12 STATUS = NOT DETERMINED` preserved verbatim), or `NP-13`;
- adjudicate the `NP-13` `034384fbd1d1c359a95afa1dad294507fdfd3269` vs `fa9862c9668f0deb9b1093415fdd9c551036240f` divergence or the `NP-09` special case (`A/B/C/D`);
- authorize or perform any code, test, configuration, runtime, persistence, API, UI, certification, release, or production activity (`IMPLEMENTATION AUTHORITY = NOT GRANTED`); or
- access or mutate `ramkivs/iips-production-market-data` (`IPD` = OUT OF SCOPE / 0 mutations).

---

## 6. Predecessor Preservation Verification at `origin/main` (`ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd`)

All 16 predecessor NP-13 governance records in `docs/integration/` on `ramkivs/iips-review-recovered @ refs/heads/main` (root tree `962d7ea322e4ade5cda61c3fc9335de616903daf`) were verified byte-identical prior to preparing this artifact:

| # | Predecessor Record | Path | Verified Blob SHA-1 | Status |
|---:|---|---|---|---|
| 1 | `NP-13-D0-01` | `docs/integration/NP-13-D0-01.md` | `8caa2d3e8f9564231a51ba053d08ccb19fdbd0bb` | **PRESERVED** |
| 2 | `NP-13-D1-01` | `docs/integration/NP-13-D1-01.md` | `3468cdaa4e72ce5d33ecfc219706877a2a319541` | **PRESERVED** (`D1-B` = `540` B, SHA-256 `29f2d5f6ab28d96d7a9e9466af5709afc94eddab95d3cbf1576708aa0b65dcc7`) |
| 3 | `NP-13-D1-C-01` | `docs/integration/NP-13-D1-C-01.md` | `8e9688ed102493a342ada1c6d9f1b3b6d6a58b04` | **PRESERVED** |
| 4 | `NP-13-D1-PREREQ-01` | `docs/integration/NP-13-D1-PREREQ-01.md` | `5fea4a54fbf81da8b5f6e4730f3da5727a7bf4e7` | **PRESERVED** |
| 5 | `NP-13-GO3B-01` | `docs/integration/NP-13-GO3B-01.md` | `89366b72bdf00d10950a1a90d33f16bd0c978acf` | **PRESERVED** |
| 6 | `NP-13-GO3B-DECISION-01` | `docs/integration/NP-13-GO3B-DECISION-01.md` | `58e0df8739cbfef823216c560573bb4d6f43b7e8` | **PRESERVED** |
| 7 | `NP-13-PA-D1-DECISION-01` | `docs/integration/NP-13-PA-D1-DECISION-01.md` | `596db534ec73607c69024b82ade542774d406eed` | **PRESERVED** |
| 8 | `NP-13-PA-D1C-DECISION-01` | `docs/integration/NP-13-PA-D1C-DECISION-01.md` | `7b5ca0be27dcc7e9e58208964da895dfa23aef46` | **PRESERVED** |
| 9 | `NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01` | `docs/integration/NP-13-PA-D1C-CURRENT-DECISION-CAPTURE-01.md` | `1dcc14af3bc4937c29b2b97d7f27dc7811bdbb91` | **PRESERVED** |
| 10 | `NP-13-D1-CM-B-DECISION-01` | `docs/integration/NP-13-D1-CM-B-DECISION-01.md` | `2cc757ec896171a89187a0acc00147b4d0149514` | **PRESERVED** |
| 11 | `NP-13-PA-D1C-SEMANTIC-RESOLUTION-01` | `docs/integration/NP-13-PA-D1C-SEMANTIC-RESOLUTION-01.md` | `068ae2a07c4551c7ce78185dbcd780bcb65fd599` | **PRESERVED** |
| 12 | `NP-13-PA-D1-COMPLETION-01` | `docs/integration/NP-13-PA-D1-COMPLETION-01.md` | `230059234abec84de123ce325a0cd8b5f6f70200` | **PRESERVED** |
| 13 | `NP-13-PA-D2-DECISION-01` | `docs/integration/NP-13-PA-D2-DECISION-01.md` | `153ab5df4c8e918e98facb42e1d8b2156959f856` | **PRESERVED** |
| 14 | `NP-13-D2-01-DEFINITION-01` | `docs/integration/NP-13-D2-01-DEFINITION-01.md` | `4143d2947107b5ab06c986b4d1b8579b5d242549` | **PRESERVED** |
| 15 | `NP-13-PA-D2-ELIGIBILITY-01` | `docs/integration/NP-13-PA-D2-ELIGIBILITY-01.md` | `a978cc73bbec8110510fc748e2d30587d0d1867a` | **PRESERVED** |
| 16 | `NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01` | `docs/integration/NP-13-PA-D2-A-BASELINE-NATURE-DECISION-01.md` | `a4f049dd369ff70871f1d2e9f78762ed6300c352` | **PRESERVED** |

---

## 7. Resulting Disposition and Durability Boundary

```text
D2-A = COMPLETE / DURABLE (M1 — SINGLE REPOSITORY/REF)
D2-B = DECISION ACT RENDERED (PA-D2-B-01 = A)
  BOUND REPOSITORY                  = ramkivs/iips-review-recovered
  BOUND MUTABLE OPERATIONAL REF     = refs/heads/main
  INITIAL PRIMARY EVIDENCE TREE     = 962d7ea322e4ade5cda61c3fc9335de616903daf
  SUPPORTING COMMIT PROVENANCE      = ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd
D2-B DURABILITY = NOT YET DURABLE (PENDING SEPARATE PUBLICATION AUTHORIZATION & REMOTE VERIFICATION)
D2-C = DEFINED / NOT DECIDED
D2 = NOT COMPLETE
D3 = NOT ELIGIBLE / NOT DEFINED
NP-12 STATUS = NOT DETERMINED
IMPLEMENTATION AUTHORITY = NOT GRANTED
```

Under `NP-13-GO3B-DECISION-01 §6.2–§6.4` (`E-3`) and `NP-13-D2-01-DEFINITION-01 §8.1` (`D2-CM-2`), the `D2-B` completion condition requiring a durably published `E-3` binding and initial evidence-designation record remains unsatisfied until separate publication authorization is granted, this artifact is published to `ramkivs/iips-review-recovered @ refs/heads/main`, and independent remote verification confirms its presence on `refs/heads/main`. **No publication authorization is granted or inferred by Ramki's `D2-B` decision selection.**
