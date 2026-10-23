# IIPS v3.0 — IRR — `D-IRR-125` Program Authority rendering (`2026-10-17`)

> **STATUS: RENDERED — ACCEPT (BOUNDED) — EXECUTION SUBJECT TO RECHECK.**
> This is the **separate** rendering of proposed act
> `IIPS-V3-IRR-PR125-MERGE-AUTHORITY-2026-10-17-01` for **IRR PR #125 only**.
> The Program Authority's current **“IRR GROUP 1 — ONE-PASS PR #125 MERGE AND DURABLE CLOSURE”**
> instruction expressly directs a conditional `ACCEPT` and same-pass execution when the proposal's
> precise conditions are met. This record fixes those conditions and the exact rendering coordinates;
> it is **not** a claim that a merge or post-merge validation has already occurred. The separate
> additive execution receipt records what actually happens.
>
> The prepared proposal retains its historical `PROPOSED — NOT APPROVED` banner and
> `HEAD_AT_RENDER: UNSET` **as prepared**. The following `HEAD_AT_RENDER` is the operative value of
> this **later rendering**, not an attempt to backdate or silently rewrite the proposal.

| Field | Rendered value |
|---|---|
| Act / disposition | **`IIPS-V3-IRR-PR125-MERGE-AUTHORITY-2026-10-17-01` — `ACCEPT`, bounded to §2** |
| Authority and source | RAMKI — Program Authority, **IRR** capacity; explicit one-pass instruction in the current task channel, `2026-10-17` (Asia/Calcutta) |
| Proposal as published | Git commit `7d9fb3228d0ba6049085f71b4489c8b5135de6cc`, blob `0fc8189a664014036fc52f715437d83851d80380`; complete text also at [PR #125 comment](https://github.com/ramkivs/iips-review-recovered/pull/125#issuecomment-6234985471) |
| **Target** | **Only** `ramkivs/iips-review-recovered` PR **#125** → `refs/heads/main` |
| **`HEAD_AT_RENDER`** | **`0f68c3ec2fb0f85be8baf26dad8bd1aca7cb637e`** (tree `b8bb258e6439ef34f5cfc11d6bb410276118400f`) |
| **`BASE_AT_RENDER`** | **`2470cf57ccaee7a6e425fd89eeda609f01fbbd88`**, tree **`102f971ba6fa390a6e718ad5a642d7eaf68d4e8e`** |
| **`CI_AT_RENDER`** | `CI` run **`39039642106`**, job **`117416315605`**, `head_sha=HEAD_AT_RENDER`, **completed / success** |
| Intended merge method | **Regular merge commit** (`gh pr merge 125 --merge`), **not** squash or rebase |
| Status of execution in this document | **Not yet recorded**; success must be independently proven in the subsequent execution receipt |

## 1. Findings immediately before rendering

The authoritative remote `main` ref/tree equal `BASE_AT_RENDER`. GitHub reports PR #125 **OPEN**,
not draft, `merged=false`, `merged_at=null`, base `main@BASE_AT_RENDER`, head exactly
`HEAD_AT_RENDER`, and `mergeable=true` / `mergeable_state=clean` (`MERGEABLE`/`CLEAN`). The
GitHub PR file API and the fetched Git tree agree: **exactly three documentation paths,
+286/−1**, with no product, test, workflow, configuration, dependency, manifest, lockfile,
protected-fence or evidence path. The diff passes `git diff --check`; its content is the
previously verified `D-IRR-124` merge receipt, `D12` rendered-ref receipt, and tracker
§16.46–§16.47 reconciliation. No existing act covered the merge of **#125**: `D-IRR-124`
was for **#124**, and `D12` was the separate `P-1` ref operation, not this PR merge.

**CI/test evidence, without an invented count.** The exact-head `Typecheck · Test · Build` job
completed successfully. Its checkout, install, typecheck, full Vitest suite, `assert-tests`
non-zero/zero-failure guard, and production-build steps all succeeded. The guard's byte-identical
source at `main` and the PR head (blob `fc26093b588be6e27a0568f117d91990fb5f3df3`)
rejects `numTotalTests=0`, non-integer totals, zero test files, unsuccessful summaries and any
`numFailedTests != 0`. Therefore the successful guard establishes **a positive number of
executed tests, at least one test file, and zero failed tests**. The accessible hosted
check/job summaries do **not** report the numeric count and the job-log download was
unavailable in this environment. The proposed act requires **successful exact-head CI and
this guard**, **not** a particular numeric count. The D12 adapter candidate's unrelated
`76 files / 868 tests` POSIX run is **not** substituted for this PR's CI. No unnecessary
full-suite rerun was performed.

## 2. The **only** accepted content set

| Status / delta | Exact path | Required final blob at `HEAD_AT_RENDER` |
|---|---|---|
| M, +49/−1 | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | `2f0a5b404122775f7f0efa1d2e2336a237e9ec4f` |
| A, +147/−0 | `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_D12_RENDERED_AND_EXECUTED_2026-10-17.md` | `0695d69e688b1638f356138fffe92ebac837f9b0` |
| A, +90/−0 | `docs/integration/IIPS_v3.0_G2_IRR_PR124_MERGE_EXECUTION_RECEIPT_2026-10-17.md` | `1e1ebf3ff137620962764b81ccb1ccce653081fe` |

**No fourth path** is authorized in PR #125. This rendered act, the proposal and the later
execution receipt are published **outside** the PR #125 branch; they are not backfilled into
its three-file merge. No adapter file or existing authority is amended by these receipts.

### Protected fences and manifests (Git blobs, identical at base and approved head)

| Path | Required blob |
|---|---|
| `frontend/server/owner-context-unavailable.ts` | `cb8db45d668d28cee7e0a52721001d579a872733` |
| `frontend/server/user-portfolio-transport.ts` | `51704c12a467cd2f718a030b5036bc55c9afa73f` |
| `frontend/server/user-portfolio/translationBoundary.ts` | `93f602fd7e78395d3cedb77ff504388a4e65012f` |
| `frontend/server/executive-transport.ts` | `d1c52fe678b34295820fea0f2eac5cf408365310` |
| `frontend/vite.config.ts` | `56fd482685203dc39ec03ccaa0315528a0352893` |
| `frontend/server/reports-transport.ts` | `981470541812a64c733309f1debec75455d85bee` |
| `frontend/package.json` | `db536bd09f01f37f55f5ce9f8d901a8c3fec0552` |
| `frontend/package-lock.json` | `4f068d98cfeb538e55fb937170c0c246f41c6b63` |

The two manifests still contain the runtime pin
`2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`. All eight blobs were compared between
remote-identified `main` and `HEAD_AT_RENDER`; all matched. This is content identity, not
qualification or permission to lift the `503 owner-context-unavailable` fence.

## 3. Conditioned execution and post-merge evidence

**Stop before the merge** if remote `main`/tree changes from `BASE_AT_RENDER`, if #125 is no
longer open and unmerged, if its base/head differ, if the three paths/blobs/receipt scope or
+286/−1 delta change, if exact-head required CI is not completed/success (including its
non-zero/zero-failure guard), if GitHub no longer reports `MERGEABLE`/`CLEAN`, if any of the
eight protected/manifest blobs changes, or if contrary authority appears. A new head does
**not** inherit this acceptance: re-evaluate and obtain a new exact-head rendering first.

When **all** conditions still pass, execute **one** regular merge of **#125** (`--merge`)
without force-pushing or changing its source branch. Then independently read back the remote:
record the actual merge SHA and both parents (pre-merge `main` first, `HEAD_AT_RENDER` second),
verify remote `main` points to that merge commit and its tree; the three paths at `main`
must have exactly the §2 blobs and tracker §16.46/§16.47 and both standalone records must be
present. Verify the merge delta is **only** §2 and no unrelated product, test, configuration,
workflow, dependency, pin, fence, evidence or authority file entered the merge. Confirm
hosted post-merge CI **at the resulting main SHA** succeeds, including the test guard;
re-read the six fence and both manifest blobs and the unchanged runtime pin on that remote
`main`. Publish an **additive, remote-verifiable execution receipt**, noting any remaining
numeric test-count limitation. If a postcondition fails, record the precise failure and do
not assert verified completion.

## 4. Non-grants and durable-record boundary

This **single documentation merge** grants no adapter implementation or adapter publication;
no `D12` expansion; no change to either Gate B ref; no Gate C Windows qualification or
result acceptance; no Gate D read admission, Gate E write policy, Q5–Q8 or portfolio durable
write; no `INV-04`/`D10` promotion, CV-52 admission, release, runtime-pin change, IPD
mutation or production authorization. The `503` fence stays in force. The IPD-owned `CV-25`
pin/tag act, IPD PR #8 `D2b` authority, owner broker-preview acceptance `D4`, and the
Windows Gate C run/result-acceptance dependency remain separate. **Group 1 is not complete.**

Publication of this rendering on the fixed IRR session branch and as a full PR comment
provides immutable Git/comment evidence **without changing #125's head**. The subsequently
recorded execution receipt belongs to the same additive IRR publication lineage, not to a
retroactive edit of the approved PR. Branch/comment publication alone is **not** falsely
described as admission to authoritative `main`.

*End of the separate `D-IRR-125` rendering — **ACCEPT FOR PR #125 AT
`0f68c3ec2fb0f85be8baf26dad8bd1aca7cb637e` ONLY, SUBJECT TO RECHECK · REGULAR MERGE ·
NO PRODUCTION AUTHORITY**.*
