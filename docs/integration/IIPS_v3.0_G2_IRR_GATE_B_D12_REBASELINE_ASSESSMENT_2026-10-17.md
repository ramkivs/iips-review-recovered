# IIPS v3.0 — G-2 — IRR Gate B adapter — **D12 re-baseline assessment**

> ## STATUS: **ASSESSMENT ONLY — NOT AN AUTHORITY ACT — NOT IMPLEMENTATION**
> This document performs the read-only re-baseline investigation that the accepted,
> corrected IIPS v3.0 E2E Completion Roadmap (`2026-10-17`) calls **D12**, and records
> the **exact instruction** a later act must contain. It **creates no ref, moves no ref,
> writes no adapter file, opens no PR from a Gate B ref, changes no dependency, changes no
> fence, and grants nothing.** It does not merge PR #117 or PR #124 and does not touch IPD.
>
> **No decision is rendered here.** The decision — `D12` — remains **NOT GRANTED**.

| Field | Value |
|---|---|
| **Artifact type** | Re-baseline **assessment** and drafted implementation instruction (records nothing operative) |
| **Repository / branch (this record)** | `ramkivs/iips-review-recovered` / `arena/53704c04-iips-review-recovered` (this session branch, published through open PR #124) |
| **Subject** | The eight-file IRR Gate B adapter implementation (`6c654be…`) whose **D-4** baseline `10584439…` is stale |
| **Authority required to render D12** | **RAMKI — Program Authority**, acting in the **IRR capacity** |
| **Production status** | NON_PRODUCTION — one user, one personal laptop, `H-18` scope |
| **Assessed at** | `2026-10-17` (Asia/Calcutta), against the live remote |

---

## 1. Why a re-baseline is required

`D-4` was rendered against IRR `main` = `10584439f33dfa9192955c3f74879f20ccaf111e` and states, in §6,
that implementation must **stop before any mutation** if *"IRR `main` is no longer
`10584439…`"* or *"the designated ref no longer points at exactly `10584439…`"*.

| Stop condition (D-4 §6) | Verified state | Fired? |
|---|---|---|
| IRR `main` is no longer `10584439…` | `main` = **`4368a8d407f71dd84633a501ae1a003612fd28fe`** | **YES** |
| The designated ref no longer points at `10584439…` | `gate-b/local-principal-ipc-implementation` = **`6c654be728ef0c90c69f7184f3a5e1625e71057d`** | **YES** |
| Either fence blob differs from `cb8db45d…` / `51704c12…` | both byte-identical on `main` | NO |
| The paired IPD D-4 act is not rendered | rendered (IPD `d5c8192…`, transferred evidence) | NO |
| Required behaviour cannot fit the §3 eight-file set | fits (see §3) | NO |

**Consequence.** Two of `D-4`'s five stop conditions have fired. `D-4` **cannot** be used for any
further mutation, and the roadmap's `A4`/`D12` finding is confirmed by the live remote rather than
by inference. Separately, `D-2` authorises creation of exactly one ref at `10584439…` and
**"no PR opened from that ref by this act"**, so the eight files cannot be published by relying on
`D-2` either.

`main` advanced because **PR #117 merged** (`4368a8d`, parents `8df609e` + `7c8a180`). Everything
between the old baseline and `main` is **documentation and evidence only** — see §4.1.

---

## 2. Verified state at assessment (live remote, read-only)

| # | Object | Verified value | How verified |
|---|---|---|---|
| 1 | IRR `main` | `4368a8d407f71dd84633a501ae1a003612fd28fe`, tree `128eec64ed52d571377b27e2d15de68a44a614c0` | `git ls-remote`; full clone; `rev-parse` |
| 2 | IRR `main` CI at the merge | run `39036388471` — **success** | hosted Actions |
| 3 | PR #117 | **MERGED** `2026-10-17T13:23:53Z`; head `7c8a180`; merge `4368a8d` | `gh pr view` |
| 4 | PR #124 | **OPEN** at re-verification: head `fc4f65f0b67b10c05e2168ff78f38087f39dd8d4`, 1 file, `CLEAN`/`MERGEABLE`, CI `39036652069` **success**, `mergedAt` null. This assessment and §16.44 are published through the **same** PR, which then carries two additive documents; **no merge act exists for either** | `gh pr view`; `gh pr list` |
| 5 | Designated Gate B ref | `6c654be728ef0c90c69f7184f3a5e1625e71057d` — **unmoved** | `git ls-remote` |
| 6 | D-4 baseline | `10584439…` — **is an ancestor of `main`** (18 commits back, full clone) | `merge-base --is-ancestor` in a **non-shallow** clone |
| 7 | `10584439… → main` changed paths | **10**, all documentation/evidence; **no product, test, config, dependency or pin file** | `git diff --name-status` |
| 8 | The eight adapter paths on `main` | **all ABSENT** | `git cat-file -e` on each |
| 9 | Five `D-4 §3.2` byte-unchanged blobs | `cb8db45d`, `51704c12`, `93f602fd`, `d1c52fe6`, `56fd4826` — all identical on `main` | `git rev-parse` |
| 10 | Runtime pin | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` at `frontend/package.json:17`; **no IPD tag contains it**; reachable only from `np04-governed-persistence-windows` | `ls-remote`; `git tag --contains` |
| 11 | IPD refs | `main` `70b24f0`, `gate-a` `2ded0e98`, `gate-b` `cec7080`, pin `2e11fa3b` — **all unmoved**; **no IPD write of any kind in this assessment** | `git ls-remote` |
| 12 | Authorising act for D12 / for merging PR #124 | **none exists** — `grep` for `D12` across `main`'s tracker and the Gate B records returns no act; no open PR other than #124 | `git grep`; `gh pr list` |

**Operational note (affects method, not conclusions).** The session workspace clone
`/home/user/iips-review-recovered` is **shallow** (`.git/shallow` present); `git merge-base
--is-ancestor` there returns a **false negative** for `10584439…`. All ancestry claims in this
record were re-taken in a **full clone**. This is recorded so that a later session does not repeat
the error.

---

## 3. The eight-file adapter set (content identities)

Exactly the `D-4 §3.1` set — **no path added or removed**; all eight are **new files** (no
modification of any existing file):

| # | Path (all under `frontend/server/user-portfolio/`) | Blob at `6c654be…` | Bytes | Lines |
|---|---|---|---|---|
| 1 | `ipcClient.ts` | `e405051786ad93cf311ac69fb74d396730cebce7` | 15,114 | 358 |
| 2 | `ownerContextFromBinding.ts` | `172f1c7141afcddb6469ba7b0d6d1ced13240249` | 6,283 | 132 |
| 3 | `ipcPortAdapter.ts` | `74f0e652b7f0f2cf2c1ce34302b4035cbde1ad48` | 11,256 | 265 |
| 4 | `firstPartySignal.ts` | `7caf87d9a9d6c444c1ab4cec699b5c8ddae61aac` | 6,191 | 137 |
| 5 | `ipcClient.test.ts` | `abcb7efcc39cdeb30cbfa8f21633ddd615cf8bac` | 11,519 | 268 |
| 6 | `ownerContextFromBinding.test.ts` | `6ed6ba1b07302530ae952ca5ca82c21a27ca24cd` | 5,168 | 114 |
| 7 | `ipcPortAdapter.test.ts` | `80ba8931b937cf6773074ba0600106e21fa9deda` | 12,304 | 275 |
| 8 | `fenceUnchanged.test.ts` | `1f2d5f9d2619d46f5c8bc3ac73720ecdf9563ad4` | 6,820 | 154 |

Total **74,655 bytes / 1,703 added lines / 0 modified / 0 deleted**. `package.json` and
`package-lock.json` are **not** in the set — the implementation adds **no dependency**.

**Dependencies of the set on existing `main` code** (read-only reuse, `D-4 §3.2`): imports resolve to
`./userPortfolioPort.js` (`ba0001e8…`), `./userPortfolioContract.js` (`0dec72eb…`),
`./translationBoundary.js` (`93f602fd…`), plus `node:net`/`node:http`. All are **present and
unchanged** on current `main`.

---

## 4. Re-baseline result

### 4.1 The delta between the old baseline and current `main`

`git diff --name-status 10584439… → 4368a8d` = **10 paths**:

| Kind | Paths |
|---|---|
| M | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`, `docs/OPERATOR_RUNBOOK.md` |
| A | `docs/integration/…GATE_B_AUTHORITY_BASIS_DETERMINATION…`, `…GATE_B_BASELINE_AND_REF_AUTHORITY_ACT…`, `…GATE_B_D4_IMPLEMENTATION_AUTHORITY_DECISION_RECORD…`, `…GATE_B_D4_IMPLEMENTATION_AUTHORITY_PA_DECISION_RENDERED…`, `…GATE_B_IMPLEMENTATION_AUTHORITY_DECISION_RECORD…`, `…GATE_B_IMPLEMENTATION_AUTHORITY_REQUEST…`, `…SINGLE_USER_LOCAL_PRINCIPAL_SECURITY_CONTRACT_DECISION_REQUEST…` |
| A | `evidence/integration/wp1-stage1-current-main-operability-2026-10-17/acceptance-evidence.md` |

**No product source, test, configuration, schema, dependency, pin or fence file changed.** The
eight-file adapter is therefore **orthogonal** to everything that moved: re-baselining it is a
content-preserving re-application, not a re-implementation.

### 4.2 Mechanical verification (performed in a throwaway clone — no repository or ref touched)

| Check | Result |
|---|---|
| `git apply --check` of the `10584439 → 6c654be` patch onto `4368a8d` | **clean** — all eight `Checking patch …` lines, no rejects, exit 0 |
| Eight paths present on `main` before the check | none (all `ABSENT`) ⇒ no overwrite risk |
| Eight blobs after re-application | **identical** to `6c654be` (`SAME` for all eight) |
| Resulting candidate **tree** (content identity) | **`ed54ced73a9f647dc0b047533ccb3fbdd9304c96`** — `main` + 8 files, **+1,703/−0** |
| `D-4 §3.2` byte-unchanged blobs after re-application | all five **unchanged**; `reports-transport.ts` `98147054…` also unchanged |
| Dependency surface after re-application | `package.json` / `package-lock.json` **untouched**; no new package |

The candidate **commit** object was materialised only in the throwaway clone (never on a ref, never
pushed); only its **tree** and the eight **blobs** are cited here, because they are the stable,
content-addressed facts a later act can verify.

### 4.3 Validation observed at the re-baselined candidate (execution evidence — **not** qualification)

Run in a disposable clone of `main` + the eight files, `frontend/`:

| Check | Result |
|---|---|
| `npm ci` | **success**, 188 packages (sandbox CA bundle exported; the environment-specific `UNABLE_TO_VERIFY_LEAF_SIGNATURE` failure is `XV-11`, not a repository defect) |
| `npx tsc --noEmit` | **exit 0** |
| Focused suite | **60/60** — `ipcPortAdapter.test.ts` 21, `ipcClient.test.ts` 15, `fenceUnchanged.test.ts` 16, `ownerContextFromBinding.test.ts` 8 |
| Full suite | **76 files / 868 tests passed** — reproduces the previously **source-reported** `868/868` (`808` at `main` + `60` new) as **locally observed** |
| Toolchain | Node `v22.22.3`, npm `10.9.8` |

**Classification (important).** This is **POSIX implementation/execution evidence**. Under
`D-GC-F` it is **non-qualifying for Windows qualification**, and it is **not** Gate C, Gate D, a
route admission, a write, or an E2E claim. The `fenceUnchanged.test.ts` passing does show, from the
working tree itself, that the five protected blobs are byte-identical and that every owner-scoped
route still answers **HTTP 503 `owner-context-unavailable`** — i.e. the fence is provably unmoved at
the candidate.

---

## 5. What exists, what is missing

| Element | State |
|---|---|
| **Implementation** | **Exists and is complete for the `D-4` scope** — eight files, `6c654be`, unchanged content |
| **Re-application to current `main`** | **Mechanically verified** — clean apply, identical blobs, tree `ed54ced7…`, tsc 0, 868/868 |
| **Publication of the adapter** | **DOES NOT EXIST** — no PR was ever opened from the Gate B ref (`D-2` bars it), and the eight paths are absent from `main` |
| **Authority to re-apply / publish** | **MISSING** — `D-4` is spent (two stop conditions fired); no `D12` act exists |
| **Durable ref for the re-baselined candidate** | **MISSING** — nothing points at `ed54ced7…`; the old ref still points at `6c654be` |
| **Windows / cross-boundary qualification** | **MISSING by design** — Gate C (IPD side) unexecuted; the IRR↔IPD connection is Gate D; no Windows run is claimed |
| **Tracker/register entry for this assessment** | Recorded in §16.44 of this session's tracker commit (published via PR #124, unmerged) |

---

## 6. The exact instruction a later `D12` act must contain

The following is drafted for the Authority to accept, amend, or decline. **None of it is in force.**

> **D12 — IRR Gate B adapter re-baseline and publication authority.**
>
> 1. **New baseline.** IRR `main` = `4368a8d407f71dd84633a501ae1a003612fd28fe`, tree
>    `128eec64ed52d571377b27e2d15de68a44a614c0`.
> 2. **Content.** Exactly the eight files of `D-4 §3.1`, at blobs `e4050517…`, `172f1c71…`,
>    `74f0e652…`, `7caf87d9…`, `abcb7efc…`, `6ed6ba1b…`, `80ba8931…`, `1f2d5f9d…`, producing tree
>    `ed54ced73a9f647dc0b047533ccb3fbdd9304c96`. **No other path may be added, removed or modified.**
> 3. **Ref.** Create **one** new ref `refs/heads/gate-b/local-principal-ipc-implementation-r2` at a
>    commit whose **sole parent is `4368a8d`** and whose tree is `ed54ced7…`. **`6c654be` is preserved
>    and never force-moved.** *(Alternative, requiring an explicit choice: authorise a PR from the new
>    ref. This is the open consequential decision — see §7.)*
> 4. **Publication.** *(Unresolved — the act must state either "no PR" like `D-2`, or explicitly
>    authorise a PR from the new ref, naming the reviewer and the merge act.)*
> 5. **Invariants that must remain byte-unchanged.** `cb8db45d…`, `51704c12…`, `93f602fd…`,
>    `d1c52fe6…`, `56fd4826…`; `/api/user-portfolios*` continues to answer **HTTP 503
>    `owner-context-unavailable`**; `package.json`, `package-lock.json` and the runtime pin
>    `2e11fa3b…` unchanged.
> 6. **Verification required of the executing step.** `npm ci`; `tsc --noEmit` = 0; the four adapter
>    test files = **60/60**; full suite unchanged or explained; `git hash-object` on the five invariant
>    files; remote blob comparison for the eight files.
> 7. **Stop conditions.** Stop if `main` ≠ `4368a8d`; if any of the five invariant blobs differs; if
>    any required change falls outside the eight paths; if any dependency, schema, credential, store,
>    listen-host, CORS or `allowedHosts` change appears necessary; if a second store or any browser
>    identity is proposed.
> 8. **Explicit non-grants.** No Gate C execution, Gate D route admission, Gate E write policy,
>    Q5–Q8, `P-6`/`P-8`, durable write, successful-save claim, promotion, CV-52 admission, production
>    eligibility, IPD change, or fence relaxation. Rollback = delete the new ref and the commit; the
>    old ref and `main` are untouched.

---

## 7. Consequential decisions this assessment does **not** infer

| # | Decision | Why it cannot be inferred |
|---|---|---|
| 1 | **New ref vs force-move vs no new ref** | `D-2` fixed exactly one ref and barred movement; `D-4 §6` rollback assumes the old ref persists. Choosing is the Authority's. |
| 2 | **Whether publication (a PR) is permitted** | `D-2` says "no PR opened from that ref by this act"; `D-4` is silent on PRs; no act authorises a PR for the re-baselined content. |
| 3 | **Whether the 60-test + 868 execution evidence is accepted as the adapter's validation bar** | It is POSIX execution evidence, explicitly non-qualifying for Windows; acceptance of evidence is a separate act (`D-GC` §3 act 3 precedent). |
| 4 | **Whether `D12` also carries the implementations instruction** | `D-4` required a *separate, explicit instruction* to begin implementation; the same separation should apply here. |

---

## 8. Boundaries preserved by this assessment

- **No** adapter file, product file, test, configuration, dependency, pin or fence was modified in the
  repository; the re-application existed only in a **throwaway clone** and produced **no ref**.
- **No** PR was opened from a Gate B ref; **no** ref was created, moved or deleted.
- **PR #124 is untouched as to merge state** — it remains **OPEN**; no merge act exists for it.
- **No** IPD write: IPD was read with `git ls-remote` and `git show` only; all four IPD refs unmoved.
- **No** Windows/browser acceptance performed or claimed; **no** Gate C/D/E execution; **no** production
  claim; **no** authority rendered or implied.
- Register statuses unchanged: `CV-20`…`CV-25`, `CV-32`, `CV-35`, `CV-36`, `CV-38`…`CV-43`, `CV-51`,
  `CV-52` and `INV-*` all stand exactly as recorded. `CV-25` stays `DECISION REQUIRED` while the pin
  remains untagged.

---

## Appendix — read-only commands used (reproducible)

```bash
# identities
git ls-remote origin refs/heads/main refs/heads/gate-b/local-principal-ipc-implementation
git rev-parse origin/main^{tree}

# ancestry (must be a FULL clone; the session workspace clone is shallow)
git merge-base --is-ancestor 10584439 origin/main

# the set and its blobs
git diff --name-status 10584439 origin/gate-b/local-principal-ipc-implementation
git rev-parse origin/gate-b/local-principal-ipc-implementation:<path>

# re-baseline feasibility (throwaway clone only)
git diff --binary 10584439 origin/gate-b/local-principal-ipc-implementation > /tmp/gateb8.patch
git apply --check /tmp/gateb8.patch          # onto a worktree at 4368a8d
```

*End of the D12 re-baseline assessment — ASSESSMENT ONLY · NO REF CREATED OR MOVED · NO ADAPTER FILE
WRITTEN · NO PR FROM A GATE B REF · `D12` NOT GRANTED · `503` FENCE IN FORCE · NON_PRODUCTION.*
