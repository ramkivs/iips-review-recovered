# IIPS v3.0 — Gate 3 `G3-AMEND-01`: Publication Receipt, Effectiveness Determination, and IPD PR #41 Merge-Capability Boundary

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-G3-AMEND-01-RECEIPT-2026-10-22-01` |
| **Record type** | Post-merge publication receipt + effectiveness determination + recorded capability boundary. **Renders no acceptance, executes no gate and grants nothing.** |
| **Instrument received** | `IIPS-V3-G3-AMEND-01-2026-10-22-01` — `docs/integration/IIPS_v3.0_G3_AMEND_01_AMENDMENT_AND_PA_DETERMINATION_2026-10-22.md`, blob `85ba78e6cbfe20ed146a53abbfa23a3350140fcf`, SHA-256 `cf6d72b50908c6859d7079b7c7197c88e9d4ed0b6a90813a0b304fcbbd65926a`, **47,104 B** — **left byte-identical** so its published hash stays independently verifiable (instrument §12.2 designates this receipt as the place where the read-back is completed; the instrument file itself is not rewritten) |
| **Date** | `2026-10-22` (UTC), actual |
| **Deciding authority received from** | **Ramki — Program Authority**, direct explicit selection of `Q1-B` / `Q2-A` / `Q3-A` in the operating session of `2026-10-22` (instrument §1) |
| **Recording agent** | Arena Agent Mode — verification, receipt, publication. No authority rendered |
| **Gate 3 status** | **`BLOCKED / NOT ACCEPTED`** — acceptance record **deliberately not rendered** (§4) |
| **IPD PR #41 status** | **`OPEN / UNMERGED`** — merge **authorized but capability-blocked** (§3) |

---

## 1. IRR publication coordinates (verified)

| Field | Verified value |
|---|---|
| Session branch | `arena/c0826cc8-iips-review-recovered` |
| Published commit (PR head) | **`4d0853135f189ebf45775a0b42d3b88fadd3b27f`** |
| IRR pull request | **#180** — "G3-AMEND-01: render PA determination (Q1-B / Q2-A / Q3-A) and bounded IPD PR #41 merge authority" — `state: MERGED`, `mergedAt: 2026-10-22T10:33:08Z` |
| PR-head CI | workflow `CI` run **`39763804561`** (`pull_request`, head `4d08531…`, `2026-10-22T10:31:59Z` → `10:32:51Z`) — **`success`**; check **`119774169080`** (`Typecheck · Test · Build`) `success` |
| Merge commit on `main` | **`c170c1713be703f55e3de148c9ba7a83a6fe0bc6`** (merge-commit form; second parent `4d08531…`) |
| Post-merge `main` CI | workflow `CI` run **`39763955446`** (`push`, head `c170c171…`, `2026-10-22T10:33:11Z` → `10:34:17Z`) — **`success`** |
| `git ls-remote origin refs/heads/main` | **`c170c1713be703f55e3de148c9ba7a83a6fe0bc6`** — agreed, twice |

### 1.1 Remote read-back at `main@c170c171…` (SHA-256 of the merged artifacts)

| Path | Blob | SHA-256 | Bytes |
|---|---|---|---|
| `docs/integration/IIPS_v3.0_G3_AMEND_01_AMENDMENT_AND_PA_DETERMINATION_2026-10-22.md` (**new**) | `85ba78e6cbfe20ed146a53abbfa23a3350140fcf` | `cf6d72b50908c6859d7079b7c7197c88e9d4ed0b6a90813a0b304fcbbd65926a` | 47,104 |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | `8f0c344a780c0f5307bf06f74b9c75aeeec4e2c0` | `0d552c041adf1223ead1cc25acf1cfc24078e5fe2bfaf33e68e0783ee1b9ecfe` | 1,184,822 |
| `docs/integration/2026-10-18/BASELINE-AND-DECISION-PACKET-INDEX.md` | `702e84488ffab05d81bc080b71a6534e5d6449ec` | `636c581085b7746992336f27afbc69c66633193a016da28f4b6cb5566870acbe` | 27,897 |
| `docs/integration/IIPS_v3.0_G3_AMEND_01_BASIS_DRIFT_AND_EVIDENCE_BOUNDARY_2026-10-22.md` | `a09b76ddd77fb24f24cfddeee46407e378fd0e9a` | `292c10f9a9dcd936ca10baac78a250a0fc62ac4dd625bfeb4d78cccca1766a30` | 31,269 |
| `docs/integration/IIPS_v3.0_G3_NATIVE_WINDOWS_EVIDENCE_AND_ACCEPTANCE_ELIGIBILITY_2026-10-22.md` | `2f5375d7151482bca791d7aa6c0c45878ba8bed9` | `11e7500c952e7e0e28b2bb497ef5fd11c10f9cfe147f4b733c8f4a55a394ac5f` | 21,272 |
| `docs/integration/IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_EFFECTIVE_2026-10-19-02.md` (**preserved**) | `4744e6f44e0caea55e980756aeef90a5046ec87e` | `f4992f9ced681ffddd0d8eaf1f3de297f2262f1eb0b3131ce18b95805725abf5` | 51,662 |

**Governing act unchanged by this publication** — identical blob, SHA-256 and size to its original published state.

### 1.2 Publication of this receipt (second, bounded lag — recorded so no coordinate is inferred)

| Field | Verified value |
|---|---|
| Receipt commit (PR head) | **`7ee9e7b1c2d568cc0bfab303ef691937dfa2fe19`** |
| IRR pull request | **#181** — `state: MERGED`, `mergedAt: 2026-10-22T10:36:54Z` |
| PR-head CI | workflow `CI` run **`39764240435`** (`pull_request`, `2026-10-22T10:35:28Z` → `10:36:46Z`) — **`success`**; check `119775613416` |
| Merge commit on `main` | **`588685d2827615475540dee514f6bca5087a4633`** |
| Post-merge `main` CI | workflow `CI` run **`39764425552`** (`push`, `2026-10-22T10:36:57Z` → `10:37:52Z`) — **`success`** |
| `git ls-remote origin refs/heads/main` | **`588685d2827615475540dee514f6bca5087a4633`** — agreed |
| This receipt at `main@588685d2…` | blob `d00704964056ca5264af004b434a8971eb070926`, SHA-256 `4242820daacda9aa2d16d072f2350dd6ea5305489f7e29a92257aed9f77c1f5e`, 13,615 B |
| Tracker at `main@588685d2…` | blob `16aea9682669d317e1ad38d6e8f4b2857ff565d2`, SHA-256 `558dccef95ad989a9002a7192a5e5e91be739b9786dbbb0731b6a8472bc065d9`, 1,191,594 B |
| Instrument at `main@588685d2…` | **unchanged** — blob `85ba78e6…`, SHA-256 `cf6d72b5…`, 47,104 B |
| Governing act at `main@588685d2…` | **unchanged** — blob `4744e6f4…`, SHA-256 `f4992f9c…`, 51,662 B |

**Bounded lag, stated rather than hidden.** Following the repository's established receipt convention, each receipt records the publication that preceded it. The publication of this coordinate update is the only unrecorded lag; it changes Markdown only and can add nothing to the instrument's effectiveness, which was already established at §2.

### 1.3 Diff shape of the publication

Five Markdown paths only — one new instrument, the tracker, the packet index, and two dated pointers whose bodies were preserved. **No** application, test, route, dependency, lockfile, workflow, listener, CORS, persistence, fence or configuration path changed. 0 register movements.

---

## 2. Effectiveness determination

Instrument §12.1 required all four of: (a) publication to IRR `main` through the PR workflow; (b) PR-head **and** post-merge CI passing; (c) remote read-back matching by SHA-256; (d) `git ls-remote` agreement with the merge commit. All four are satisfied and evidenced at §1.

> **`IIPS-V3-G3-AMEND-01-2026-10-22-01` is EFFECTIVE as from the completion of post-merge CI run `39763955446` (`2026-10-22T10:34:17Z` UTC), on publication at IRR `main@c170c1713be703f55e3de148c9ba7a83a6fe0bc6`.**

**Scope of effectiveness, stated exactly.** The instrument is effective **as an amendment and as a determination**: `Q1-B`, `Q2-A` and `Q3-A` now govern the application of act §2.1 (state), §4.1 (anchor duty) and §10.1 conditions 1 and 3 for Gate 3 evaluations performed on or after that instant; and the bounded merge authority of instrument §7 (`M-1`…`M-10`) for IPD PR #41 is live. **Nothing else is granted.** The governing act remains in force and byte-identical; Gate A′, Gate 4, Gate C, Gate 4 result acceptance, Gate 5, every `503` lift, any `durable:true` claim and production eligibility remain untouched and not granted.

---

## 3. IPD PR #41 — merge authority exercised, capability refused, exact failure recorded

### 3.1 Pre-merge re-validation (`M-3`), executed immediately before the attempt

| Check | Result |
|---|---|
| Head / base | `d15582d68167461e814ec8f7873dc18e3df5ab71` / `c0e1b5662264651246db1ccde2945eb5e13f3524` — **both unchanged** since the instrument was rendered |
| Mergeability | `mergeable: true`, `mergeable_state: "clean"`, **0** conflicts, `merged: false`, `merged_at: null`, 0 reviews |
| Merge preview | `refs/pull/41/merge` = `ce25a184d3dc22cd2d6e5c0ff9f277f3d541de5d` (tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`) — unchanged |
| `Q1-B.1` | `be32d8c9… → d15582d6…` = **22 `A`, 0 `M`, 0 `D`**; **10/10** §4.1 anchors at the head vs `be32d8c9…` — **PASS** |
| `Q1-B.2` | `c0e1b566… → ce25a184…` = **22 `A`, 0 `M`, 0 `D`**; **22/22** identical blobs; **10/10** anchors at the preview vs `c0e1b566…` — **PASS** |
| `Q2-A` | `ci.yml` = `aeee464feb76e2d1e9d104e1cae4e5dde37700ad` at the head — **PASS** |
| Channel-1 CI on the exact head | checks `119747608450` (`typecheck · build · test`) and `119747795175` (`executed test count`) both `success`; **784 / 783 / 0** — **PASS** |
| Merge base | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` — the pinned basis, unchanged |

**Every `M-1`…`M-6` condition was satisfied** at the instant of the attempt.

### 3.2 The attempt and the exact refusal

| Step | Command / endpoint | Result |
|---|---|---|
| 1 | `gh pr merge 41 --merge --repo ramkivs/iips-production-market-data` | **exit 1** — `Message: Resource not accessible by integration, Locations: [{Line:1 Column:58}]` |
| 2 | `PUT /repos/ramkivs/iips-production-market-data/pulls/41/merge` | **HTTP 403** — `{"message":"Resource not accessible by integration","status":"403"}` (`documentation_url: …/pulls#merge-a-pull-request`) |
| 3 | `git push --dry-run origin c0e1b566…:refs/heads/main` (earlier this pass) | `remote: Permission to ramkivs/iips-production-market-data.git denied to ramkivs.` / `fatal: … error: 403` |

**Post-attempt state re-verified — nothing changed:**

- IPD PR #41: `state: "open"`, `merged: false`, `merged_at: null`, `mergeable_state: "clean"`, head `d15582d6…`, base `c0e1b566…`.
- IPD `main`: **`c0e1b5662264651246db1ccde2945eb5e13f3524`** — unchanged.
- `refs/pull/41/head` = `d15582d6…`, `refs/pull/41/merge` = `ce25a184…` — unchanged.
- Superseded PR #34: `open`, `merged: false`, head `3eb13ed…` — untouched.

**No merge occurred. No merge is claimed.** The session's installation credential carries no write capability on `ramkivs/iips-production-market-data` (`Contents: write` / `Pull requests: write` absent for that repository), while the same credential writes `ramkivs/iips-review-recovered` normally (PR #180 is proof). The repository `GET` `permissions` object reports `push: true`; that object is **not** evidence of capability and is overridden by the three transport/API refusals above.

### 3.3 Minimum operator action (unchanged from instrument §12.3)

Either **(a)** execute the merge where write capability exists — `gh pr merge 41 --merge --repo ramkivs/iips-production-market-data` — **or (b)** grant this installation `Contents: Read & write` + `Pull requests: Read & write` on `ramkivs/iips-production-market-data` (or run an Arena session rooted on that repository) and re-execute the §3.1 re-validation first. In both cases the merge must be **merge-commit only**, at exactly head `d15582d68167461e814ec8f7873dc18e3df5ab71`, and the post-merge `main` push CI plus the 22/22 blob and 10/10 anchor read-back must be recorded before any acceptance record is rendered.

---

## 4. Gate 3 acceptance — deliberately withheld, with the exact unmet conditions

Instrument §9/§10 make acceptance conditional on `AC-1`…`AC-8`. At this receipt's date:

| # | Condition | Status |
|---|---|---|
| `AC-1` | `Q1-B.1` + `Q1-B.2` both proved at the **actual merge commit** | **UNMET** — no merge commit exists; both limbs are proved only at the head and the GitHub preview |
| `AC-2` | IRR manifest present; §5.3 fence blobs byte-stable | **MET** — `cb8db45d…`, `51704c12…` unchanged; C8 lines intact |
| `AC-3` | IPD `tsc` / `build` / `npm test` ≥ 556, 0 failures on the `ubuntu-latest` channel, **including the post-merge `main` push CI** | **PARTIALLY MET** — satisfied on the PR-head run (`784 / 783 / 0`); **the post-merge `main` push run cannot exist until `main` contains the merge**, so the condition is **UNMET** |
| `AC-4` | IRR ≥ 814 tests, typecheck, `assert-tests`, build | **MET** — `87` files / **`1,077`** passed / `0` failed; typecheck `0`; `assert-tests: OK`; build `0`; plus hosted PR-head and post-merge CI `success` |
| `AC-5` | The 8 act §4.3 test files present and named | **MET** — 8/8 at `d15582d6…`, named in instrument §4.3 |
| `AC-6` | `SESSION_ONLY`/`durable:false`, 29-key guard, `503` fence, both fence blobs unchanged | **MET** — 10/10 anchors byte-stable |
| `AC-7` | Record states exact commits, commands, counts, CI run ids and the evidence-class disclaimers | **UNMET** — the acceptance record that must carry the post-merge coordinates does not exist, and cannot honestly be written |
| `AC-8` | Acceptance record `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` rendered **and** effective | **UNMET — deliberately not rendered** |

> **Gate 3 remains `BLOCKED / NOT ACCEPTED`.** The blocker is now **exactly one, and it is a capability blocker, not an authority or evidence blocker**: IPD PR #41 cannot be merged from this session. Every authority question the program had open on Gate 3 — basis drift, `ci.yml` conformance, Windows evidence treatment — has been **decided** by the effective instrument. No further PA decision is required to finish; only write capability (or an operator-executed merge) is.

**Anti-overclaim.** This receipt does not accept Gate 3, does not assert that Gate 3's substantive requirements are unmet, and does not assert that they *are* met. It records which conditions are evidenced and which cannot be evidenced until a merge exists. The instrument's `Q3-A` boundary binds here too: the Windows direct-TAP result is supplemental only, and the canonical Windows `npm test` wrapper remains recorded as **FAILED** on its summary parser.

---

## 5. Tracker reconciliation preserved

- `§16.69` / `CV-CORR-52` (CV-36 historical-snapshot reconciliation): **intact and unchanged**.
- `§16.73` / `CV-CORR-54` (Gate 3 IPC connection-release correction): **intact and unchanged**; its numbering note preserved.
- `§16.74` / `CV-CORR-55` (prepared packet, collision remediation, PR #41 reconciliation): **intact and unchanged**; superseded as *status* only.
- `§16.70` / `CV-CORR-53` (`DEC-06`): **intact and unchanged**, including the P11 admission it recorded.
- `§16.75` / `CV-CORR-56`: the rendered determination and the receipt.
- Section-declared `CV-CORR-*` identifiers remain **unique** (`§16.51…§16.75`, no duplicate declaration). The only textual repetition of `CV-CORR-52` is the preserved numbering note inside the `§16.73` heading — a reference, not a second declaration.
- Register movements: **none** (35 items, 9 active outstanding, 51 × 17 §18 matrix, 17 `XV`, 8 stages, 11 §19 rows).

---

## 6. Non-grants, restated so that nothing is inferred

No Gate A′ execution; no Gate 4 `QE-1…QE-11`; no Gate C result; no Gate 4 result acceptance; no Gate 5 admission; **no `503` lift** (`/api/user-portfolios*` remain `503 owner-context-unavailable` at `cb8db45d…` / `51704c12…`); **no `durable:true` claim** (`SESSION_ONLY`/`durable:false` unchanged); no production eligibility, release or certification; no Row 26 change; no product-consumer integration; no `scripts/run-tests.mjs` change; no dependency, workflow or configuration change; no IPD mutation of any kind; no promotion of off-main lineage; IPD PR #34 untouched.

*End of receipt. Gate 3 is `BLOCKED / NOT ACCEPTED`; the single open blocker is IPD write capability for PR #41.*
