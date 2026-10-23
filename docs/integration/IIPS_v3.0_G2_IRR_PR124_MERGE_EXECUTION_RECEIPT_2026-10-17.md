# IIPS v3.0 — IRR — **`D-IRR-124` EXECUTION RECEIPT** (`2026-10-17`)

> ## STATUS: **EXECUTED — MERGED AND VERIFIED**
> Records the Program Authority's `ACCEPT` of `D-IRR-124` and the resulting merge of **IRR PR #124**,
> with remote-verified coordinates. **Additive only.** It rewrites no prior evidence, adds no authority,
> and was **not** added to the PR branch before merging.
>
> **What this act authorized:** one merge of one documentation PR.
> **What it did not:** adapter implementation, adapter publication, any Gate B ref change, Gate C/D/E,
> promotion, admission, runtime-pin change, or any IPD mutation.

| Field | Value |
|---|---|
| **Receipt identifier** | `IIPS-V3-IRR-PR124-MERGE-EXECUTION-RECEIPT-2026-10-17-01` |
| **Artifact type** | Execution receipt for a rendered authority act |
| **Act rendered** | `IIPS-V3-IRR-PR124-MERGE-AUTHORITY-2026-10-17-01` — disposition **`ACCEPT`**, rendered by the Program Authority in the task channel on `2026-10-17` |
| **Repository** | `ramkivs/iips-review-recovered` |
| **Production status** | NON_PRODUCTION — `H-18` scope |

---

## 1. Pre-merge verification (live remote, read immediately before the merge)

| # | Precondition | Verified value |
|---|---|---|
| 1 | IRR `main` before merge | `4368a8d407f71dd84633a501ae1a003612fd28fe`, tree `128eec64ed52d571377b27e2d15de68a44a614c0` |
| 2 | **PR #124 head** | **`fb113de413c90a77454f2622c5ed8f23b1af6241`** — re-read live; **not** assumed from any earlier report |
| 3 | PR state | **OPEN**, `mergedAt` null, base `main` |
| 4 | Mergeability | `mergeable` **MERGEABLE**, `mergeStateStatus` **CLEAN** |
| 5 | Exact-head CI | run **`39038502910`**, job `117413058378`, `head_sha=fb113de…` — **`SUCCESS`** (`Typecheck · Test · Build`) |
| 6 | Content set | **exactly four documentation paths**, +817/−1 — see §2 |
| 7 | Product/test/config/dependency paths in the diff | **0** |
| 8 | Six protected-fence blobs at the PR head | `cb8db45d…`, `51704c12…`, `93f602fd…`, `d1c52fe6…`, `56fd4826…`, `98147054…` — **identical to `main`** |
| 9 | `frontend/package.json`, `frontend/package-lock.json` at the PR head | **identical to `main`** — runtime pin `2e11fa3b…` untouched |

## 2. The merged content set (exactly four files)

| Status | Path | Δ |
|---|---|---|
| M | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | +129/−1 |
| A | `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_D12_REBASELINE_ASSESSMENT_2026-10-17.md` | +269/−0 |
| A | `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_D12_REBASELINE_AUTHORITY_ACT_PROPOSED_2026-10-17.md` | +264/−0 |
| A | `docs/integration/IIPS_v3.0_G2_IRR_PR124_MERGE_AUTHORITY_ACT_PROPOSED_2026-10-17.md` | +155/−0 |

## 3. The merge

| Item | Value |
|---|---|
| **Method** | **Regular merge commit** (`gh pr merge 124 --merge`) — **not** squash, **not** rebase |
| **Pre-merge head** | `fb113de413c90a77454f2622c5ed8f23b1af6241` |
| **Merge commit** | **`2470cf57ccaee7a6e425fd89eeda609f01fbbd88`** |
| **Parents** | **`4368a8d407f71dd84633a501ae1a003612fd28fe`** + **`fb113de413c90a77454f2622c5ed8f23b1af6241`** |
| **Merged at** | `2026-10-17T14:06:15Z` |
| **New `main`** | `2470cf57ccaee7a6e425fd89eeda609f01fbbd88` |
| **Files changed by the merge** | **exactly 4**, +817/−1 — no product, test, config, dependency or evidence path |

## 4. Post-merge verification (remote)

| # | Check | Result |
|---|---|---|
| 1 | PR #124 state | **MERGED**, `mergedAt` `2026-10-17T14:06:15Z`, `mergeCommit` `2470cf57…` |
| 2 | Post-merge CI at the new `main` head | run **`39039324970`** at `2470cf57…` — **`success`** |
| 3 | `§16.43`, `§16.44`, `§16.45` present at `main` | **all present** (1 occurrence each) |
| 4 | Documentation blobs at `main` | assessment `c4803adc…`; PR-124 act `dda9f181…`; D12 act `96ec0a01…` |
| 5 | Six protected fences at `main` | `cb8db45d…`, `51704c12…`, `93f602fd…`, `d1c52fe6…`, `56fd4826…`, `98147054…` — **unchanged** |
| 6 | Files changed `4368a8d → 2470cf57` | the same four documentation paths; **0** product paths |

## 5. What this receipt does and does not do

**Does:** makes the Group 1A receipt (§16.43), the D12 assessment (§16.44) and the decision package
(§16.45) **durable on `main`**, and records that the merge occurred under a rendered act at a named
head.

**Does not:** authorize adapter implementation or publication; change the Gate B ref
(`gate-b/local-principal-ipc-implementation` remains `6c654be728ef0c90c69f7184f3a5e1625e71057d`);
advance Gate C, Gate D or Gate E; promote or admit anything; change the runtime pin `2e11fa3b…`;
touch IPD; or make any production or release claim.

**Note on the merge act's `PROPOSED` banner.** The merged document
`…PR124_MERGE_AUTHORITY_ACT_PROPOSED_2026-10-17.md` retains its `PROPOSED — NOT APPROVED` banner.
That is **correct and intentional**: the banner describes the artifact as prepared. **This receipt** is
the record of the Authority's subsequent `ACCEPT`, exactly as `D-GC` §1.3 preserved its own proposal
byte-unchanged. No merged text is rewritten to disguise that sequence.

**Sequencing note.** The Authority's decision was rendered in the task channel on `2026-10-17`; this
receipt is published **after** the merge, deliberately, so that the act was not inserted into the PR
branch to self-authorize.

*End of receipt `IIPS-V3-IRR-PR124-MERGE-EXECUTION-RECEIPT-2026-10-17-01` — EXECUTED · MERGED
`2470cf57…` · CI `39039324970` SUCCESS · FOUR DOCUMENTATION FILES · FENCES UNCHANGED · NON_PRODUCTION.*
