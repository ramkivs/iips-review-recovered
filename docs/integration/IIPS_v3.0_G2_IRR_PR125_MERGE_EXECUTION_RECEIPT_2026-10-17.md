# IIPS v3.0 — IRR — `D-IRR-125` merge execution receipt (`2026-10-17`)

> **STATUS: EXECUTED — PR #125 MERGED AND INDEPENDENTLY VERIFIED.**
> This is an **additive** record of the separately rendered, bounded Program Authority `ACCEPT`
> of `IIPS-V3-IRR-PR125-MERGE-AUTHORITY-2026-10-17-01` and its execution.
> The approved operation admitted **only three documentation paths** to IRR `main`.
> It does **not** render a new D12 act, qualify the adapter, change the IPD repository, or grant
> any product/gate/production authority. This receipt itself is published **after** the merge;
> publication of this record is **not** a fourth path retroactively included in PR #125.

| Field | Verified value |
|---|---|
| Receipt ID | `IIPS-V3-IRR-PR125-MERGE-EXECUTION-RECEIPT-2026-10-17-01` |
| Act rendered | `IIPS-V3-IRR-PR125-MERGE-AUTHORITY-2026-10-17-01` — **ACCEPT**, bounded to PR #125 at its exact head; the Program Authority's one-pass instruction is recorded in the [separate rendered act](IIPS_v3.0_G2_IRR_PR125_MERGE_AUTHORITY_PA_DECISION_RENDERED_2026-10-17.md) |
| Rendering evidence | Git commit `c9ef5914fa6610614f95ae69e1bb7519574ea783` / blob `4c44f3d223c50381a0326c65ba118b4f1cb33dc7`; [full-text PR comment](https://github.com/ramkivs/iips-review-recovered/pull/125#issuecomment-6235124436) |
| Prepared proposal (preserved) | `IIPS-V3-IRR-PR125-MERGE-AUTHORITY-2026-10-17-01` at commit `7d9fb3228d0ba6049085f71b4489c8b5135de6cc`, blob `0fc8189a664014036fc52f715437d83851d80380` — retains its `PROPOSED` banner by design; the separate rendered act supplies `HEAD_AT_RENDER` |
| Repository | `ramkivs/iips-review-recovered` (IRR) |
| Operating status | NON_PRODUCTION — `H-18` single-user scope, `503 owner-context-unavailable` fence in force |

## 1. Pre-merge verification — live remote, immediately before execution

| Condition | Verified value |
|---|---|
| `main` / tree | `2470cf57ccaee7a6e425fd89eeda609f01fbbd88` / `102f971ba6fa390a6e718ad5a642d7eaf68d4e8e` |
| **`HEAD_AT_RENDER`** / tree | **`0f68c3ec2fb0f85be8baf26dad8bd1aca7cb637e`** / `b8bb258e6439ef34f5cfc11d6bb410276118400f` |
| PR #125 | **OPEN**, unmerged, base `main` at the verified SHA; GitHub `MERGEABLE` / `CLEAN` |
| Content | **3 documentation paths, +286/−1**, exactly §2; no other path; `git diff --check` passed |
| Exact-head CI | `CI` run **`39039642106`**, job **`117416315605`** at `HEAD_AT_RENDER` — **completed/success**: checkout, install, typecheck, full Vitest, `assert-tests` guard, build |
| Test-execution proof | The passing guard (blob `fc26093b588be6e27a0568f117d91990fb5f3df3`, unchanged from base) rejects zero/non-integer total tests, zero test files, unsuccessful report, or nonzero failed tests. **>0 tests in ≥1 file, 0 failed** are established. Hosted check/job summaries omit the numeric count and the job log could not be retrieved in this environment. A specific count was **not** a precondition of the rendered act and is **not** invented here; the D12 candidate's separate `868` is not this PR's count. No needless suite rerun occurred. |
| Protected bytes | All six fences and both frontend manifests matched base (full blobs in §4); pin `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` unchanged |
| Authority/scope | `D-IRR-125` rendered separately with the full exact head, base, CI and blobs; no contrary act or scope expansion found; PR #125 was not changed to make the act convenient |

## 2. Exact content admitted to `main` (and nothing else)

| Status / delta | Path | Final Git blob — identical at PR head and merged `main` |
|---|---|---|
| M, +49/−1 | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | `2f0a5b404122775f7f0efa1d2e2336a237e9ec4f` |
| A, +147/−0 | `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_D12_RENDERED_AND_EXECUTED_2026-10-17.md` | `0695d69e688b1638f356138fffe92ebac837f9b0` |
| A, +90/−0 | `docs/integration/IIPS_v3.0_G2_IRR_PR124_MERGE_EXECUTION_RECEIPT_2026-10-17.md` | `1e1ebf3ff137620962764b81ccb1ccce653081fe` |

The tracker adds §16.46 (`D-IRR-124` merge receipt) and §16.47 (separate D12 ref-act
rendering/execution); the standalone documents contain those earlier receipts. No adapter
source or test, configuration, CI workflow, dependency, manifest, fence, route, evidence or
unrelated authority file was changed in PR #125. The merge commit's tree equals the approved
PR head's tree **exactly**; it did not add a hidden fourth path or rewrite the three blobs.

## 3. Execution and independent remote verification

| Check | Observed result |
|---|---|
| Operation | **Regular merge commit** (`gh pr merge 125 --merge`), not squash or rebase; exit `0` |
| PR state | **MERGED**, `merged_at=2026-10-17T14:32:50Z`, head still `0f68c3ec2fb0f85be8baf26dad8bd1aca7cb637e` |
| **Merge commit** | **`65593bdd382b8c8899221640fd07ade28882a431`** |
| Parents, in order | **`2470cf57ccaee7a6e425fd89eeda609f01fbbd88`** (`main` before merge) + **`0f68c3ec2fb0f85be8baf26dad8bd1aca7cb637e`** (approved head) |
| Tree | `b8bb258e6439ef34f5cfc11d6bb410276118400f` — byte-identical to approved PR head tree |
| Remote `main` | Git ref **and** GitHub branch endpoint resolve to the merge commit, with that same tree |
| Diff `main-before → merge` | The **same three** §2 documentation paths, +286/−1, no other changed path; their `main` blobs equal §2 |
| Intended records | §16.46 and §16.47 present on remote `main` (each once), and both standalone receipt records present with §2 blobs |
| **Post-merge hosted CI** | `CI` **run `39041217333`**, job **`117420936306`**, `event=push`, `head_branch=main`, `head_sha=65593bdd382b8c8899221640fd07ade28882a431` — **completed/success**. Typecheck, full Vitest, non-zero/zero-failure guard, production build all passed. The numeric count remains inaccessible; **>0 tests, 0 failed** are established by the passing guard. |
| Fences, manifests and pin | All eight §4 blobs at remote `main` equal pre-merge `main` and approved PR head; runtime pin unchanged |
| Gate B refs | `gate-b/local-principal-ipc-implementation` = `6c654be728ef0c90c69f7184f3a5e1625e71057d`; `…-r2` = `110e221fe7ca335c4571adb93d6c629c061f84e0` — neither moved |

**The post-merge CI result was read from the hosted run at the merge SHA**, not inferred
from the pre-merge check. The PR #125 merge is verified; this receipt's *own* subsequent
publication coordinates belong in the immutable follow-on commit/PR comment rather than
being self-embedded in the receipt.

## 4. Protected bytes rechecked after merge

| Path | Git blob at pre-merge `main`, PR head, and resulting remote `main` |
|---|---|
| `frontend/server/owner-context-unavailable.ts` | `cb8db45d668d28cee7e0a52721001d579a872733` |
| `frontend/server/user-portfolio-transport.ts` | `51704c12a467cd2f718a030b5036bc55c9afa73f` |
| `frontend/server/user-portfolio/translationBoundary.ts` | `93f602fd7e78395d3cedb77ff504388a4e65012f` |
| `frontend/server/executive-transport.ts` | `d1c52fe678b34295820fea0f2eac5cf408365310` |
| `frontend/vite.config.ts` | `56fd482685203dc39ec03ccaa0315528a0352893` |
| `frontend/server/reports-transport.ts` | `981470541812a64c733309f1debec75455d85bee` |
| `frontend/package.json` | `db536bd09f01f37f55f5ce9f8d901a8c3fec0552` |
| `frontend/package-lock.json` | `4f068d98cfeb538e55fb937170c0c246f41c6b63` |

## 5. Scope, outstanding dependencies and receipt-publication boundary

**Only the receipt/reconciliation documents became authoritative on `main`.** The `D12`
record reports an already executed new ref under `P-1` and explicitly **does not** publish
the adapter. This merge grants **no** adapter implementation or publication, D12 expansion,
Gate B ref change, Gate C Windows qualification or result acceptance, Gate D read admission,
Gate E write policy, Q5–Q8, durable portfolio write, `P-6`/`P-8`, `INV-04`/`D10` promotion,
CV-52 admission, release, runtime-pin change, IPD mutation or production authorization.
The `503 owner-context-unavailable` fences remain in force.

The IPD-owned `CV-25` pin/tag act, IPD PR #8 merge-authority item `D2b`, and the owner's
broker-preview acceptance `D4` remain independent; the designated **Windows Gate C host run**
and its separately governed result-acceptance act remain outstanding. **Group 1 is not
complete.** Nothing in this IRR receipt changes an IPD file, ref, tag, PR or decision.

This receipt is committed on the fixed IRR session branch **after** merging the new `main`
into that branch without rewriting either history, and is shared on the **already merged
PR #125** as a complete-text evidence comment. A follow-on, documentation-only PR may
carry the proposal, rendering and this receipt toward `main` **after** #125; it is not a
competing PR and may not be merged merely by citing `D-IRR-125`, which covers #125 only.
Until that separate main-admission route succeeds, this **receipt file** is remote-durable
on its branch/PR comment but is **not** misrepresented as present on authoritative `main`.
The three §2 records **are** present on `main` now.

*End of `IIPS-V3-IRR-PR125-MERGE-EXECUTION-RECEIPT-2026-10-17-01` — **PR #125 MERGED
`65593bdd382b8c8899221640fd07ade28882a431` · POST-MERGE CI SUCCESS · SIX FENCES
UNCHANGED · RECEIPT FILE MAIN ADMISSION SEPARATE · NON_PRODUCTION**.*
