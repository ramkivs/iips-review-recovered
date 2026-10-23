# IIPS v3.0 — IRR — `D-IRR-125`: proposed merge act for PR #125

> **STATUS: PROPOSED — NOT APPROVED — NOT AUTHORITY TO EXECUTE.**
> This is an IRR-owned request for a **separate Program Authority decision** about **PR #125 only**.
> It records no `ACCEPT`, identifies no approver as having accepted it, and authorizes **no merge**.
> A green check, a clean diff, a PR comment, or publication of this proposal is not a rendering.
> PR #125 must remain open until the Program Authority separately renders an explicit decision.

| Field | Value |
|---|---|
| Proposed act ID | `IIPS-V3-IRR-PR125-MERGE-AUTHORITY-2026-10-17-01` (`D-IRR-125`) |
| Decision maker | RAMKI — Program Authority, acting in the **IRR** capacity |
| Target | **Only** `ramkivs/iips-review-recovered` PR **#125**, base `main` |
| Artifact | A prepared merge-decision request, **not** the rendering or an execution receipt |
| Prepared | `2026-10-17` (Asia/Calcutta); remote state re-read immediately before drafting |
| `HEAD_AT_RENDER` | **UNSET** — a later, separate rendering must supply the full current 40-character PR head SHA; §3 defines the rule |
| Operating boundary | NON_PRODUCTION, single-user `H-18` scope; `503 owner-context-unavailable` fence remains |

## 1. Live evidence at preparation — observations, not standing permission

| Check | Independently re-read value |
|---|---|
| Authoritative IRR `main` | `2470cf57ccaee7a6e425fd89eeda609f01fbbd88`; tree `102f971ba6fa390a6e718ad5a642d7eaf68d4e8e` (remote ref and GitHub commit tree agree) |
| PR #125 | **OPEN**, not draft, `merged=false`, `merged_at=null`; base `main@2470cf57ccaee7a6e425fd89eeda609f01fbbd88` |
| PR source / observed head | `arena/53704c04-iips-review-recovered` / **`0f68c3ec2fb0f85be8baf26dad8bd1aca7cb637e`**, tree `b8bb258e6439ef34f5cfc11d6bb410276118400f` |
| Mergeability | GitHub `mergeable=true` / `mergeable_state=clean` (`MERGEABLE` / `CLEAN`) |
| Exact-head required CI | `CI` run **`39039642106`**, job **`117416315605`**, `head_sha=0f68c3ec2fb0f85be8baf26dad8bd1aca7cb637e`: **completed / success**. Install, typecheck, full Vitest suite, non-zero/zero-failure assertion, and build steps all **success**. The assertion checks an integer test count **> 0**, at least one test file, `summary.success=true`, and **0 failed**. The accessible check/job API does **not** expose the numeric count; the hosted job-log download is unavailable in this environment. Do **not** mislabel the D12 adapter candidate's separate `76 files / 868 tests` POSIX run as this PR's CI count. |
| Content | **Exactly 3 documentation paths, +286/−1**; §2 fixes all three final-file blob identities. `git diff --check` passes; **0** application, test, configuration, workflow, dependency, manifest, lockfile, fence or evidence paths changed. |
| Scope check | Tracker front-matter updates the latest historical receipt and appends **§16.46** (the already executed `D-IRR-124` merge) and **§16.47** (the separately rendered/executed `D12` ref act). The two added records give the remote-verified PR #124 receipt and D12 rendering/execution. They retain the prior proposed acts' banners as history; neither publishes an adapter nor grants a new gate. |
| Existing authority for **this** merge | **None found** in authoritative `main`, this PR's three files or the PR's pre-publication reviews/comments (none). `D-IRR-124` authorized **#124 only**; `D12` authorized the separate ref operation with `P-1` (no adapter PR). Neither covers the merge of **#125**. |

The historical checkpoint supplied for #125 (`0f68c3ec…`, three files, +286/−1,
run `39039642106`, clean/open) was **re-verified**, not assumed. These coordinates are an
observation at preparation, **not** `HEAD_AT_RENDER`. A later head or base movement must be
reconciled under §3 and recorded under §5; a check at an old head never suffices.

### 1.1 Protected bytes — authoritative `main` versus the observed PR head

| Path | Required Git blob at `main` **and** at PR head |
|---|---|
| `frontend/server/owner-context-unavailable.ts` | `cb8db45d668d28cee7e0a52721001d579a872733` |
| `frontend/server/user-portfolio-transport.ts` | `51704c12a467cd2f718a030b5036bc55c9afa73f` |
| `frontend/server/user-portfolio/translationBoundary.ts` | `93f602fd7e78395d3cedb77ff504388a4e65012f` |
| `frontend/server/executive-transport.ts` | `d1c52fe678b34295820fea0f2eac5cf408365310` |
| `frontend/vite.config.ts` | `56fd482685203dc39ec03ccaa0315528a0352893` |
| `frontend/server/reports-transport.ts` | `981470541812a64c733309f1debec75455d85bee` |
| `frontend/package.json` | `db536bd09f01f37f55f5ce9f8d901a8c3fec0552` |
| `frontend/package-lock.json` | `4f068d98cfeb538e55fb937170c0c246f41c6b63` |

All **eight** comparisons are blob-for-blob equal at the remote-resolved `main` and PR head.
The manifests still pin `iips-production-market-data` to
`2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`; this proposal makes no IPD ref or pin change.
The protected six include the owner-context fail-closed transport/route fences; equality is not
Gate C qualification or route admission.

## 2. Exact documentation content set proposed for admission

The following **whole-file identities** (Git blobs, not just path names or a broad description)
are the approved set *for consideration*. Their delta is against `main@2470cf57…`:

| Status / delta | Path | Final blob on PR head | Purpose |
|---|---|---|---|
| M, +49/−1 | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | `2f0a5b404122775f7f0efa1d2e2336a237e9ec4f` | Latest-update reconciliation plus **§16.46 / CV-CORR-29** (PR #124 merge receipt) and **§16.47 / CV-CORR-30** (D12 rendered/executed); prior sections retained |
| A, +147/−0 | `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_D12_RENDERED_AND_EXECUTED_2026-10-17.md` | `0695d69e688b1638f356138fffe92ebac837f9b0` | Separate rendered D12 decision and already executed, remotely checked **new ref** receipt; `P-1` no adapter PR, POSIX evidence explicitly non-qualifying |
| A, +90/−0 | `docs/integration/IIPS_v3.0_G2_IRR_PR124_MERGE_EXECUTION_RECEIPT_2026-10-17.md` | `1e1ebf3ff137620962764b81ccb1ccce653081fe` | Already executed **#124** merge and post-merge verification receipt, not authority for #125 |

**No fourth PR path; no new substantive implementation.** The D12 ref
`gate-b/local-principal-ipc-implementation-r2@110e221fe7ca335c4571adb93d6c629c061f84e0`
and historical Gate B ref
`gate-b/local-principal-ipc-implementation@6c654be728ef0c90c69f7184f3a5e1625e71057d`
are cited in the proposed-to-merge documentation, **not changed by this proposal**. The
D12 record says the adapter was **not** published and Gate C qualification remains outstanding.
The **receipt content** is what is being considered for admission, not a new D12 decision.

## 3. Decision to be rendered separately — `HEAD_AT_RENDER` rule

> Program Authority choices: **`ACCEPT`**, **`DECLINE`**, or **`ACCEPT WITH CHANGES`** (spell out
> the changes). **None is selected in this document.** A later affirmative rendering must cite
> this act ID and its immutable publication, and must explicitly record:
>
> `HEAD_AT_RENDER = <current full PR #125 head SHA>`;
> `BASE_AT_RENDER = <current full IRR main SHA and tree>`;
> `CI_AT_RENDER = <successful run/job ID, whose head_sha is HEAD_AT_RENDER>`;
> and the **three §2 paths with their exact blobs** (or expressly stop for amendment).

**The observed `0f68c3ec…` is not a pre-filled acceptance coordinate.** Publishing this act
must not turn an embedded checkpoint into a stale authorization. The rendering must be a
**different, explicit PA record**; it may use the above template only after a fresh remote read.
If the head moves *after* rendering, even for documentation, that rendering does not authorize
the new head. Stop and obtain a fresh rendering. If any §2 blob or path differs at rendering,
**stop and amend/reassess the content set before asking for a decision**; `HEAD_AT_RENDER` is not
permission to accept changed content automatically. If `main` moves from the baseline above,
stop and re-establish the base/diff/fences and seek an explicit updated decision rather than
silently carrying forward this proposal.

Only if the Program Authority separately renders `ACCEPT` for that exact PR/head/content set,
**all** of these preconditions pass immediately before execution, and no later head/base change
occurs, would the act authorize **one** operation: regular merge commit of **PR #125** into IRR
`main` (`gh pr merge 125 --merge`), **never** squash or rebase:

1. PR #125 is **open**, unmerged, with base `main`; the remote head equals the full
   `HEAD_AT_RENDER` and the base matches the rendered main coordinate.
2. Required `Typecheck · Test · Build` CI is **completed/success** at exactly that head,
   including full-suite execution and the non-zero/zero-failure guard; a pending, failed,
   skipped or old-head check stops the merge.
3. The complete diff is **only** the three §2 documentation paths with their **exact blob
   identities**, and the delta/semantics remain the receipt and reconciliation described there;
   no code, test, workflow, dependency, manifest, lockfile, evidence or fence path is added.
4. GitHub reports **`MERGEABLE` / `CLEAN`** at that same head/base; the six protected-fence
   blobs and both manifest blobs equal the authoritative `main` identities in §1.1.
5. No new contrary authority or changed scope has appeared. A CI pass or approval of a
   different PR supplies none of these conditions.

**Post-merge verification required if, and only if, that later act is accepted and executed:**
record the actual merge commit SHA and its **two parents** (first = checked pre-merge `main`,
second = `HEAD_AT_RENDER`); read back the remote `main` ref and tree and confirm it equals the
merge commit; verify the merge's changed-file set is exactly §2 and the three blobs at `main`
equal the rendered PR head. Confirm §16.46 and §16.47 and both standalone records are present,
with their historical/proposed banners preserved. Confirm hosted **post-merge CI at the merge
SHA** succeeds (including non-zero/zero-failure guard); if it does not, do **not** call the merge
verified. Recheck all six fence blobs, both manifest blobs and the runtime pin on that remote
`main`, and record the result in an **additive execution receipt** through the ordinary IRR
publication route. A receipt cannot self-contain its eventual merge SHA; no pre-merge text may
claim post-merge success.

## 4. Explicit non-grants and outstanding dependencies

This prepared request, and even a later bounded `ACCEPT` of its merge alone, grant **no**
adapter implementation or adapter publication; **no D12 expansion** or new Gate B baseline/ref
change; **no** Gate C qualification or Windows result acceptance, Gate D read admission, or
Gate E write policy; **no** Q5–Q8 qualification, durable write, `P-6`/`P-8`, route admission,
`INV-04`/`D10` promotion, CV-52 admission, release, runtime-pin change, IPD mutation or
production authorization. The `503 owner-context-unavailable` fence stays in force.

**Group 1 is not complete.** The IPD-owned durable pin/tag act (`CV-25`), the separate IPD
PR #8 merge-authority item (`D2b`), and the owner's broker-preview acceptance (`D4`) remain
independent outstanding items in the accepted roadmap; this act neither closes nor re-verifies
them. The designated **Windows Gate C host run** and its separate result-acceptance act remain
dependencies, not evidence supplied by this documentation-only PR. No IPD repository is written
by this preparation.

## 5. Publication transport and amendment history

The fixed IRR session branch for this preparation is
`arena/99a16b14-iips-review-recovered`, **not** PR #125's source branch. To avoid a competing
PR or a rewrite/mutation of #125's branch, this one-file proposal is committed and pushed on
that session branch, with its **complete text mirrored on PR #125 as a comment** and linked to
the immutable commit. The comment is a review/evidence location, **not** an approval. This
transport makes **zero changes to PR #125's head and three-file content set**. It does **not**
claim the proposal is already authoritative on `main`: admission of any later execution
receipt or this off-main artifact requires the normal, separately authorized IRR route.
The PR comment preserves the complete proposal even if the session branch is later removed;
the Git commit preserves its file history while the ref exists. Both must be read back.

| Date / revision | Checkpoint and disposition |
|---|---|
| `2026-10-17`, initial proposal | The previously reported head **`0f68c3ec2fb0f85be8baf26dad8bd1aca7cb637e`** / CI `39039642106` / three-path +286/−1 content set was re-verified against the remote. It is an **observed checkpoint, not `HEAD_AT_RENDER`**. No checkpoint SHA has been superseded yet. |
| Future amendment rule | If publication or another commit moves #125, preserve **both** the old and new full SHAs, old/new file lists/blobs, validation runs and the reason for movement in a dated **additive** amendment. Do not silently replace a checkpoint or treat this proposal's publication as an `ACCEPT`. Material new scope stops this request. |

*End of `IIPS-V3-IRR-PR125-MERGE-AUTHORITY-2026-10-17-01` — **PROPOSED · NOT APPROVED · NOT AUTHORITY TO EXECUTE · HEAD_AT_RENDER UNSET · PR #125 UNMERGED · NON_PRODUCTION**.*
