# IIPS v3.0 — IRR — `D-IRR-126`: PR #126 main-admission decision request

> **STATUS: PROPOSED — NOT APPROVED — NOT AUTHORITY TO EXECUTE OR MERGE.**
> This is **one** IRR-owned request for a separate Program Authority decision on admitting
> **PR #126 only**. It is not a rendered `ACCEPT`, a review approval, or an execution receipt.
> Neither successful CI nor `MERGEABLE`/`CLEAN`, the prior one-pass instruction, nor the
> accepted `D-IRR-125` act supplies authority to merge #126. **Do not merge #126 under this
> proposal.** Keep it open until a separately rendered, exact-head admission act exists.

| Field | Value |
|---|---|
| Proposed act ID | `IIPS-V3-IRR-PR126-MAIN-ADMISSION-AUTHORITY-2026-10-17-01` (`D-IRR-126`) |
| Authority required | RAMKI — Program Authority, **IRR** capacity |
| Target | Only [`ramkivs/iips-review-recovered` PR #126](https://github.com/ramkivs/iips-review-recovered/pull/126), base `refs/heads/main` |
| Purpose | Make the already published **proposal, separate D-IRR-125 rendering, and post-merge execution receipt** durable on authoritative IRR `main` — not to re-merge #125 or re-render D12 |
| Prepared | `2026-10-17` (Asia/Calcutta), against freshly re-read remote state |
| `HEAD_AT_RENDER` | **NOT SET BY THIS PROPOSAL** — the Program Authority must record the full current 40-character #126 SHA in a **separate rendering**, after this proposal's own publication (§4) |
| `ACT_BLOB_AT_RENDER` | **NOT SET BY THIS PROPOSAL** — the separate rendering must name the final Git blob of **this** proposed act as the fourth path (§2) |
| Effect now | Branch publication for review only; **no main admission and no new authority** |

## 1. Admissibility investigation (live remote before preparation)

| Subject | Verified observation |
|---|---|
| IRR `main` | `65593bdd382b8c8899221640fd07ade28882a431`, tree `b8bb258e6439ef34f5cfc11d6bb410276118400f` — remote ref and GitHub branch agree; **no later `main` commit** observed after #125 |
| #126 before this proposal | **OPEN**, unmerged, not draft, base `main@65593bdd382b8c8899221640fd07ade28882a431`, head `6549d519135e30f2f67f8eb34e2d71306a2a74bc`; `MERGEABLE`/`CLEAN`; **3 added documentation files, +390/−0**; no other path |
| #126 exact-head CI before proposal | `CI` run `39041406268`, job `117421485765`, `head_sha=6549d519135e30f2f67f8eb34e2d71306a2a74bc`, **completed/success** (typecheck, full Vitest, non-zero/zero-failure guard, build) |
| #126 commit ancestry | proposal commit `7d9fb322…`, bounded rendering `c9ef5914…`, **non-destructive merge** of already merged #125 `main` (`91a7f9eb…`; second parent `65593bdd…`), then execution-receipt commit `6549d519…`. Current `main` is an ancestor of #126; its three #125 files are **not** reintroduced by this diff. No rebase, force-push or competing implementation ref. |
| #125 merge | **MERGED** `2026-10-17T14:32:50Z`, regular merge `65593bdd382b8c8899221640fd07ade28882a431` (parents `2470cf57ccaee7a6e425fd89eeda609f01fbbd88` + `0f68c3ec2fb0f85be8baf26dad8bd1aca7cb637e`); tree equals the approved #125 head |
| #125 post-merge CI | `39041217333` at `65593bdd382b8c8899221640fd07ade28882a431` — **completed/success**, including full-suite and non-zero/zero-failure guard |
| Main presence | The #125 **three approved receipt/reconciliation files** and tracker §§16.46–16.47 are already on `main` at their approved blobs. The **three #126 files** in §2 are each **absent** from `main`; their full text is on #126 and the #125 evidence comments. Nothing is duplicated on `main`. |
| Diff health | `git diff --check main..#126` passes. No product, test, CI workflow, configuration, dependency, manifest, lockfile, protected fence, IPD or evidence path changed. |

The three existing #126 blobs were compared byte-for-byte with GitHub Git-blob responses
and with the fetched head; they match §2. Successful CI is evidence of validation, **not**
main-admission authority. Its passing guard proves **>0 executed tests in ≥1 file and zero
failed tests**; the accessible hosted job summaries do not expose an exact numeric count.
Do not substitute the D12 adapter candidate's unrelated `868` POSIX tests. This proposal
requires successful exact-head CI and its guard, **not** a particular test count. No
unnecessary suite rerun was performed.

### 1.1 Scope and temporal-status reconciliation

- The first record is a **historically prepared** `D-IRR-125` proposal and correctly keeps
  `PROPOSED` and `HEAD_AT_RENDER: UNSET`. The **second** record separately renders `ACCEPT`
  at #125 head `0f68c3ec…`; its statement that execution is *not yet recorded* describes
  the time of rendering. The **third**, later record proves that #125 actually merged at
  `65593bdd…` and passed post-merge CI. These are sequential records, **not** three rival
  decisions and **not** a fresh admission of D12 or of an adapter.
- The execution receipt's statement that its **file** is not yet on `main` is explicitly
  conditional on this separate publication route. At preparation it is true. A later merge
  would make the condition false prospectively; preserve the historical record and record
  the admission in **post-merge verification**, rather than editing the receipt to suggest
  that it was already on `main` when written.
- The authoritative tracker's latest *published tracker section* is §16.47 / `CV-CORR-30`.
  §§16.46–16.47 are present and accurate on current `main`. It does **not** claim the #125
  execution-receipt file is there or that Group 1 is complete; the newer receipt is pending
  under #126. This is a **known chronology/publication gap, not a false tracker assertion**.
  Do not manufacture a duplicate §16.48 or change a `CV-*` status simply to make this
  admission convenient. A later additive tracker pointer, if actually required, needs its
  own reviewed scope; it is **not** a hidden fifth path of this request.

## 2. Exact content set offered for main admission

**Before this proposal was added**, #126 contained exactly these three **new** documents:

| # | Purpose / temporal identity | Full path | Observed final Git blob |
|---|---|---|---|
| 1 | Prepared #125 merge proposal; grants nothing itself | `docs/integration/IIPS_v3.0_G2_IRR_PR125_MERGE_AUTHORITY_ACT_PROPOSED_2026-10-17.md` | `0fc8189a664014036fc52f715437d83851d80380` |
| 2 | Separately rendered bounded `D-IRR-125` `ACCEPT` at the exact #125 head; no wider grant | `docs/integration/IIPS_v3.0_G2_IRR_PR125_MERGE_AUTHORITY_PA_DECISION_RENDERED_2026-10-17.md` | `4c44f3d223c50381a0326c65ba118b4f1cb33dc7` |
| 3 | Additive, independently remote-verified #125 execution receipt; no new grant | `docs/integration/IIPS_v3.0_G2_IRR_PR125_MERGE_EXECUTION_RECEIPT_2026-10-17.md` | `a0eef28787a51d0353161208ebadd6916da71fcc` |
| 4 | **This prepared #126 admission request**; grants nothing itself | `docs/integration/IIPS_v3.0_G2_IRR_PR126_MAIN_ADMISSION_AUTHORITY_ACT_PROPOSED_2026-10-17.md` | **`ACT_BLOB_AT_RENDER`** — read from the final published PR #126 head in the later rendering, not self-embedded |

**The only contemplated publication change is path 4.** It adds an act for review to the
three-file #126 set; it does **not** change any of their three blobs or add tracker/product
scope. The exact four-path diff and fourth blob must be read back from GitHub after push.
A later renderer must name **all four** paths and blobs; if any differs, stop and amend the
proposal before deciding. The #125 approved three paths are **already on `main`** and are
**not** part of this four-path admission.

### 2.1 Protected fences and frontend manifests

All eight Git blobs were re-read at `main@65593bdd…` and at the pre-publication #126 head;
all matched. They must still match at the final head and immediately before any merge:

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

The manifests still pin `iips-production-market-data` to
`2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`. The two Gate B refs were also re-read
and unchanged (`6c654be728ef0c90c69f7184f3a5e1625e71057d` and
`110e221fe7ca335c4571adb93d6c629c061f84e0`). No IPD ref is created or moved here.

## 3. Authority determination: **no existing admission grant for #126**

The governing separation is explicit: **H-18 §8.3(b)** requires a separate merge
authorization; **G2-2 §10/P5** says effectiveness, published evidence, green CI and clean
mergeability do **not** grant it. The IRR PR #118 decision request §3 applies those rules
to a documentation-only PR and distinguishes governance-record preparation/branch
publication/read-only verification from main admission. The rendered `D-IRR-125` act names
**PR #125 only**, and its receipt §5 expressly says the follow-on PR *may not be merged
merely by citing `D-IRR-125`*. The only #126 comment is publication verification and
expressly **NOT MERGE AUTHORITY**; there are no reviews. Searches of the authoritative
`main` and #126 content found **no `D-IRR-126` rendering and no act naming #126's merge**.

**Result:** the three records are technically admissible *for review* within their stated
scope, but **main admission is NOT AUTHORIZED**. This document supplies the missing,
precisely bounded **decision request**; it cannot accept itself. No merge of #126 is
performed or implied by this determination.

## 4. The one decision requested of the Program Authority

> **`D-IRR-126` — `ACCEPT` / `DECLINE` / `ACCEPT WITH CHANGES` (specify the changes).**
> **No choice is selected here.** An affirmative rendering must separately cite the
> immutable published version of this proposal and record
> `HEAD_AT_RENDER = <full current remote PR #126 head SHA>`,
> `ACT_BLOB_AT_RENDER = <Git blob of path 4 at that head>`,
> `BASE_AT_RENDER = <full current main SHA/tree>`, and
> `CI_AT_RENDER = <successful run/job whose head_sha equals HEAD_AT_RENDER>`.
> It must approve **exactly** §2's four paths/blobs, **nothing else**.

The prior head `6549d519135e30f2f67f8eb34e2d71306a2a74bc` is a **pre-publication
checkpoint**, not an acceptable pre-filled `HEAD_AT_RENDER`. Publishing this proposal
on #126 necessarily moves the head, but cannot make the `HEAD_AT_RENDER` rule stale:
only the later **separate** rendering fixes it. A head move *after* rendering stops the
act, even if it is documentation-only. If `main` advances from `65593bdd…`, if the four
blobs/path set change, or if the receipt's semantic scope changes, re-evaluate the base,
content and checks and obtain a new explicit rendering before execution.

**Only a separate affirmative rendering** for that exact head/content set, followed by a
fresh check of **all** conditions below, would authorize **one** regular merge commit of
**PR #126** to IRR `main` (`gh pr merge 126 --merge` — never squash or rebase):

1. PR #126 is **OPEN**, unmerged, base `main` at `BASE_AT_RENDER`; its full remote head
   equals `HEAD_AT_RENDER` and its complete diff has **only** the four §2 documentation
   paths with the rendered final blobs, including `ACT_BLOB_AT_RENDER`. No duplicated
   receipt, tracker status change, product/test/config/workflow/dependency/pin/fence,
   evidence or IPD path may appear.
2. GitHub reports `MERGEABLE`/`CLEAN` at that head/base. The required
   `Typecheck · Test · Build` check at **that exact head** is **completed/success**,
   including the full suite and non-zero/zero-failure guard; an old-head or pending
   check is insufficient. No numeric test count is invented as a substitute.
3. All six fence and both manifest blobs still match authoritative `main` and §2.1;
   runtime pin and Gate B refs remain unchanged. No new contrary authority or
   historical-content discrepancy has appeared.

**Post-merge verification required if, and only if, separately authorized:** record
merge SHA and both parents (pre-merge `main`, then `HEAD_AT_RENDER`), independently
read remote `main` ref/tree, confirm **exactly four** approved docs at the rendered
blobs and no unexpected path, and check hosted CI **success at the new main SHA**
(including its guard). Confirm the three #125 records and the §2 proposal are present
once, compare six fence and both manifest blobs again, and verify no pin, IPD,
product or gate change. Record the actual result **additively** (e.g. a verification
comment on #126 with the immutable merge coordinates), without creating a recursively
self-referential or competing PR. Reconcile tracker status from the verified tree;
only an actual discrepancy and separate approved scope justifies editing it.

## 5. Non-grants, publication and amendment history

**Even an eventual bounded `ACCEPT` would only admit documentation.** It would not
authorize adapter implementation/publication/promotion beyond D12's `P-1` new-ref
scope; any Gate B ref change; Windows Gate C qualification or result acceptance; Gate D
READ, Gate E WRITE, Q5–Q8, portfolio admission or durable writes; `INV-04`/`D10`
promotion, CV-52 admission, release, runtime-pin change or tag creation; IPD mutation;
production use/eligibility; or a claim that Group 1 is complete. The IPD-owned `CV-25`
pin/tag act, IPD PR #8 `D2b` authority, owner broker-preview acceptance `D4` and
Windows Gate C host/result-acceptance dependency remain independent. The `503
owner-context-unavailable` fences stay in force.

This one new document is published on the **existing PR #126 branch**, preserving all
commits, with no force-push, no competing PR and no protected-ref change. The remote
read-back and PR comment must record the final head, the four-file list, all blobs and
final exact-head CI. That comment is **publication evidence, not approval**. Until the
Program Authority renders a **separate** `ACCEPT` at that final head, #126 remains OPEN.

| Checkpoint / amendment rule | Disposition |
|---|---|
| First remote observation | #126 `6549d519135e30f2f67f8eb34e2d71306a2a74bc`, **three** docs, +390/−0, CI `39041406268` success — a historical checkpoint, **superseded as a head/content count** by the publication of this fourth path, not silently replaced. The three document blobs remain the required identities in §2. |
| Publication/read-back | The fourth blob and resulting full head SHA are recorded **outside this self-referential file**, in an immutable-commit-linked #126 verification comment. The PA rendering must cite those final values, not this superseded checkpoint. |
| Any later change | Preserve old and new full SHAs, changed paths/blobs, CI runs and reason in an **additive amendment**; never infer permission to merge changed bytes. Material expansion stops this proposal. |

*End of `IIPS-V3-IRR-PR126-MAIN-ADMISSION-AUTHORITY-2026-10-17-01` — **PROPOSED ·
NOT APPROVED · NOT AUTHORITY TO MERGE PR #126 · HEAD_AT_RENDER RESERVED FOR THE PROGRAM
AUTHORITY · FENCES UNCHANGED · NON_PRODUCTION**.*
