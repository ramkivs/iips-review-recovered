# IIPS v3.0 — G-2 — IRR Gate B adapter — **D12 re-baseline authority — ACT PREPARED FOR DECISION**

> ## STATUS: **PROPOSED — NOT APPROVED — NOT AUTHORITY TO EXECUTE**
> This artifact puts **one** matter to the Program Authority: **`D12` — authority to re-baseline the
> eight-file IRR Gate B adapter onto current `main`, under a new ref, and to record the
> implementation instruction `D-4` required.** It contains **no** rendered approval and **no** implied
> consent. Nothing in it may be executed or cited as authority.
>
> An `ACCEPT` authorizes **creating one new ref at one exact commit and, if so decided, opening one PR
> from it.** It does **not** merge anything, does **not** promote the adapter, does **not** make the
> adapter reachable at runtime, and does **not** open Gate C, Gate D, Gate E, `P-6`, `P-8`, writes,
> production, release or "Group 1 complete".
>
> **Investigation findings (§2) are factual and were verified read-only. Proposed decisions (§3) are
> the Authority's to accept, amend or decline. The two are kept separate throughout.**

| Field | Value |
|---|---|
| **Act identifier** | `IIPS-V3-G2-IRR-GATE-B-D12-REBASELINE-AUTHORITY-2026-10-17-01` |
| **Artifact type** | **Prepared authority act** — renders nothing |
| **Repository / branch (this record)** | `ramkivs/iips-review-recovered` / `arena/53704c04-iips-review-recovered` (this session branch) |
| **Authority capacity required to render** | **RAMKI — Program Authority**, acting in the **IRR capacity** |
| **Supersedes, as to baseline only** | `D-1`'s designation of `10584439…` (`D-1` is **not** revoked; it designated a baseline that has since been overtaken) |
| **Production status** | NON_PRODUCTION — one user, one personal laptop, `H-18` scope |
| **Prepared at** | `2026-10-17` (Asia/Calcutta), against the live remote |

---

## 1. Why an act is required — stated precisely

`D-4` was rendered against IRR `main` = `10584439f33dfa9192955c3f74879f20ccaf111e`. Its §6 names five
stop conditions. **Two have fired**, and either alone is sufficient:

| `D-4` §6 stop condition | Verified state | Fired |
|---|---|---|
| *"IRR `main` is no longer `10584439…`"* | `main` = **`4368a8d407f71dd84633a501ae1a003612fd28fe`** | **YES** |
| *"the designated ref no longer points at exactly `10584439…`"* | ref = **`6c654be728ef0c90c69f7184f3a5e1625e71057d`** | **YES** |
| either fence blob differs | both byte-identical on `main` | no |
| the paired IPD D-4 act is not rendered | rendered (IPD `d5c8192…`, transferred evidence) | no |
| required behaviour cannot fit the eight-file set | fits — see §2.2 | no |

`D-2` provides no alternative: it authorized **one** ref at `10584439…` and states **"no PR opened
from that ref by this act."** The adapter therefore cannot be re-based or published by relying on
`D-1`, `D-2` or `D-4`. **Only a new act can.**

---

## 2. INVESTIGATION FINDINGS (verified read-only — not decisions)

### 2.1 Authoritative baseline

| Item | Verified value |
|---|---|
| IRR `main` | **`4368a8d407f71dd84633a501ae1a003612fd28fe`** |
| IRR `main` tree | **`128eec64ed52d571377b27e2d15de68a44a614c0`** |
| `10584439…` ancestry | **ancestor of `main`** (18 commits behind) — verified in a **non-shallow** clone |
| `10584439… → main` delta | **10 paths, all documentation/evidence** — **zero** product, test, config, dependency, pin or fence files |
| Designated Gate B ref | `gate-b/local-principal-ipc-implementation` @ **`6c654be728ef0c90c69f7184f3a5e1625e71057d`**, **unmoved** |
| `6c654be…` parent / tree | sole parent **`10584439…`**; tree **`3af6d1bedd4acc8715d9a17090176afca52611bb`** |

### 2.2 The eight-file adapter set — content identities

Exactly the `D-4 §3.1` set. **All eight are new files; none modifies an existing file.** The
`10584439 → 6c654be` diff is **8 files, +1,703, −0**, and `package.json` / `package-lock.json` are
**not** in it (no new dependency).

| # | Path (all `frontend/server/user-portfolio/`) | Blob at `6c654be…` | Bytes | Lines |
|---|---|---|---|---|
| 1 | `ipcClient.ts` | `e405051786ad93cf311ac69fb74d396730cebce7` | 15,114 | 358 |
| 2 | `ownerContextFromBinding.ts` | `172f1c7141afcddb6469ba7b0d6d1ced13240249` | 6,283 | 132 |
| 3 | `ipcPortAdapter.ts` | `74f0e652b7f0f2cf2c1ce34302b4035cbde1ad48` | 11,256 | 265 |
| 4 | `firstPartySignal.ts` | `7caf87d9a9d6c444c1ab4cec699b5c8ddae61aac` | 6,191 | 137 |
| 5 | `ipcClient.test.ts` | `abcb7efcc39cdeb30cbfa8f21633ddd615cf8bac` | 11,519 | 268 |
| 6 | `ownerContextFromBinding.test.ts` | `6ed6ba1b07302530ae952ca5ca82c21a27ca24cd` | 5,168 | 114 |
| 7 | `ipcPortAdapter.test.ts` | `80ba8931b937cf6773074ba0600106e21fa9deda` | 12,304 | 275 |
| 8 | `fenceUnchanged.test.ts` | `1f2d5f9d2619d46f5c8bc3ac73720ecdf9563ad4` | 6,820 | 154 |

Total **74,655 bytes / +1,703 lines**.

Read-only reuse of existing `main` modules (unchanged): `userPortfolioPort.ts` (`ba0001e8…`),
`userPortfolioContract.ts` (`0dec72eb…`), `translationBoundary.ts` (`93f602fd…`).

### 2.3 Candidate tree — re-established in this pass

| Step | Result |
|---|---|
| `git diff --binary 10584439… 6c654be…` → `git apply` onto a throwaway worktree at **`4368a8d`** | **clean**, 8/8 patches |
| Blobs after re-application vs `6c654be…` | **identical 8/8** |
| **Candidate tree** | **`ed54ced73a9f647dc0b047533ccb3fbdd9304c96`** — **reproduced exactly**, matching the earlier assessment |
| Content delta | `main` + 8 files, **+1,703 / −0** |
| All eight paths present on `main` before the check | **none — all ABSENT** (no overwrite risk) |
| Protected blobs after re-application | `cb8db45d…`, `51704c12…`, `93f602fd…`, `d1c52fe6…`, `56fd4826…` — all **unchanged** |

### 2.4 Evidence already available (reused, not re-run)

The candidate tree is **byte-identical** (`ed54ced7…`) to the tree on which these were observed in the
preceding pass, so the results remain valid and were **not** repeated:

| Check | Result | Classification |
|---|---|---|
| `npm ci` | success (188 packages) | environment |
| `tsc --noEmit` | **exit 0** | POSIX execution evidence |
| Focused: `ipcClient` 15, `ownerContextFromBinding` 8, `ipcPortAdapter` 21, `fenceUnchanged` 16 | **60/60** | POSIX execution evidence |
| Full suite | **76 files / 868 tests** (`808` at `main` + `60` new) | POSIX execution evidence |

**Under `D-GC-F` this is non-qualifying for Windows qualification.** It is **not** Gate C, not
Gate D, not an admission, and not an E2E claim. The `fenceUnchanged.test.ts` pass does establish,
from the working tree itself, that the five protected blobs are byte-identical and that every
owner-scoped route still answers **HTTP 503 `owner-context-unavailable`**.

### 2.5 Instruction-provenance finding (recorded, not adjudicated)

`D-4`'s rendered record states that implementation *"proceeds only under a separate, explicit
instruction."* The implementation commit exists:

| Fact | Value |
|---|---|
| Commit | `6c654be728ef0c90c69f7184f3a5e1625e71057d` |
| Author / committed | `2026-10-17T04:52:43Z` |
| Commit message | explicitly cites *"rendered act `6b2b897…`"* (the D-4 rendering) |
| `D-4` rendering (committed) | `2026-10-17T13:21:58Z` after rebase; authored earlier on the same day (original `6b2b897…`, PR #117 `updatedAt` `2026-10-16T21:09:02Z`) |

**Read carefully:** the rendering said *"implementation has NOT begun"* — true at rendering time — and
the commit is **later**, so there is **no chronological contradiction**. What is absent is a
**rendered repository record of the separate instruction itself**; the instruction appears to have
been given in the task channel. This is a **gap in the record, not a proven breach**, and it is for
the Authority to close (§3.5), not for this proposal to assume.

### 2.6 What exists, what does not

| Element | State |
|---|---|
| Implementation (D-4 scope) | **complete** — eight files at `6c654be…` |
| Re-application onto current `main` | **verified** — tree `ed54ced7…` |
| Recorded implementation instruction | **absent** (§2.5) |
| Authority to re-baseline or publish | **absent** — this act |
| Durable ref for the re-baselined content | **absent** — nothing points at `ed54ced7…` |
| Windows / cross-boundary qualification | **absent by design** — Gate C (IPD) and Gate D (IRR) |
| Promotion / admission | **absent** — `INV-04`/`D10`, CV-52 |

---

## 3. PROPOSED DECISIONS (the Authority's to render)

### 3.1 `D12-A` — Baseline designation

> IRR `main` = **`4368a8d407f71dd84633a501ae1a003612fd28fe`**, tree
> **`128eec64ed52d571377b27e2d15de68a44a614c0`**, is the designated **re-baseline** for the IRR Gate B
> adapter. **`D-1`'s designation of `10584439…` is superseded as to baseline only; `D-1` is not
> revoked, and the historical ref at `6c654be…` is preserved unchanged.**

### 3.2 `D12-B` — Content identity

> The re-baseline consists of **exactly** the eight files of `D-4 §3.1`, at the blob identities in
> §2.2, producing **tree `ed54ced73a9f647dc0b047533ccb3fbdd9304c96`**. **No other path may be added,
> removed or modified.** No dependency, manifest, lockfile, schema, migration or configuration change.
> Any content difference from §2.2 stops the act.

### 3.3 `D12-C` — Ref strategy (recommended option `C-1`)

| Option | Content | Assessment |
|---|---|---|
| **`C-1` (recommended)** | Create **one new ref** `refs/heads/gate-b/local-principal-ipc-implementation-r2` at a commit whose **sole parent is `4368a8d`** and whose **tree is `ed54ced7…`**. **`6c654be…` is preserved and never force-moved.** No other ref created, moved or deleted. | Preserves the designated ref exactly as the historical record and as a rollback target; produces a clean, single-parent, content-addressed object. |
| `C-2` | Force-move `gate-b/local-principal-ipc-implementation` to the new commit | **Not recommended.** Destroys the object `D-2`, `D-4` and the IPD records all cite by SHA; a force-move is exactly the branch-fragility this program treats as a defect (`I-9`/`CV-25`). |
| `C-3` | No new ref; tag `ed54ced7…` only | Workable but loses an implementation branch; a tag is a *durability* device, not an implementation base. Prefer `C-1` **+** optionally a tag. |

### 3.4 `D12-D` — Publication (the consequential decision)

`D-2` barred a PR from the Gate B ref. That bar does not automatically extend to a **new** ref, and
it does not automatically lift. **Two admissible options; the Authority must choose:**

| Option | Content | Consequence |
|---|---|---|
| **`P-1` (recommended)** | **No PR.** The new ref exists as a durable implementation base and evidence; publication to `main` is deferred to the **`INV-04`/`D10` promotion** act after Gate C | Keeps unadmitted runtime code off any merge path — the discipline that kept Gate B honest so far. Cost: no hosted CI on the re-baselined content (POSIX evidence only, as today). |
| `P-2` | **Open exactly one PR** from the new ref, base `main`, **explicitly not mergeable** without a further act; the PR exists to obtain exact-head hosted CI and review | Gains hosted CI on the re-baselined content. Risk: creates merge pressure on unadmitted code; must state "draft, no merge" in the act to be safe. |

**Recommendation: `P-1`.** It matches the `D-2` precedent, keeps the artifact durable and reviewable in
the repository, and avoids manufacturing a merge path ahead of Gate C. `P-2` is available if the
Authority wants hosted CI on the exact re-baselined bytes.

### 3.5 `D12-E` — Instruction provenance

> The Authority records **whether** the separate implementation instruction `D-4` required was given,
> and in what terms. Admissible renderings:
>
> - **`E-1`** — *"The instruction was given in the task channel on `2026-10-17`; the commit
>   `6c654be…`, which cites the rendered `D-4`, is the repository record of it."* **Ratifies the
>   existing content by reference.** *(Recommended — the commit message is unusually explicit about
>   the act, scope and eight paths.)*
> - **`E-2`** — *"No instruction is recorded; the content at `6c654be…` stands as unratified."*
>   Then `D12-B` must be read as authorizing the content **afresh**, and the provenance gap is recorded
>   as such rather than closed.
> - **`E-3`** — Require a fresh, dated instruction naming the eight paths and tree `ed54ced7…` before
>   `D12-C` executes. The act then stops until that instruction exists.

### 3.6 `D12-F` — Protected invariants

These must be **byte-identical** after the re-baseline, verified by `git hash-object` at the new commit
**and** compared against the remote:

| Path | Required blob |
|---|---|
| `frontend/server/owner-context-unavailable.ts` | `cb8db45d668d28cee7e0a52721001d579a872733` |
| `frontend/server/user-portfolio-transport.ts` | `51704c12a467cd2f718a030b5036bc55c9afa73f` |
| `frontend/server/user-portfolio/translationBoundary.ts` | `93f602fd7e78395d3cedb77ff504388a4e65012f` |
| `frontend/server/executive-transport.ts` | `d1c52fe678b34295820fea0f2eac5cf408365310` |
| `frontend/vite.config.ts` | `56fd482685203dc39ec03ccaa0315528a0352893` |
| `frontend/server/reports-transport.ts` | `981470541812a64c733309f1debec75455d85bee` |
| `frontend/package.json`, `frontend/package-lock.json` | unchanged; pin stays `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` |

`/api/user-portfolios*` and `/api/reports*` continue to answer **HTTP 503**; the IPC path remains
**unreachable at runtime**; no route, listen host, CORS or `allowedHosts` change.

### 3.7 `D12-G` — Required verification (before any ref is called complete)

| # | Check | Acceptance |
|---|---|---|
| 1 | `git apply` / tree construction | resulting **tree = `ed54ced7…`** exactly |
| 2 | Eight blobs vs §2.2 | **8/8 identical** |
| 3 | `git diff --name-only main..<new commit>` | **exactly 8 paths**, all additions, **−0** |
| 4 | `npm ci` | success |
| 5 | `npx tsc --noEmit` | **exit 0** |
| 6 | Focused suite (4 files) | **60/60** |
| 7 | Full suite | **868/868**, or a recorded explanation of any difference |
| 8 | Six invariant blobs | **all match** §3.6 |
| 9 | `grep` for forbidden authority fields on the wire | no principal / owner / tenant / scope field emitted |
| 10 | `fenceUnchanged.test.ts` | passes; 503 preserved; owner-scoped routes still unreachable to the IPC path |
| 11 | Remote ref read-back | new ref resolves to the expected commit on the remote |

**Acceptance of this evidence is itself a decision.** The results in §2.4 are **POSIX execution
evidence** and are **non-qualifying for Windows**; the act should state explicitly whether it accepts
them as the adapter's validation bar, or defers acceptance to Gate C.

### 3.8 `D12-H` — Stop conditions, non-grants, rollback

**Stop before any mutation if:** IRR `main` ≠ `4368a8d…`; any of the six invariant blobs differs;
any of the eight paths already exists on `main`; the constructed tree ≠ `ed54ced7…`; any required
change falls outside the eight paths; any dependency, manifest, schema, credential, store, listen
host, CORS or `allowedHosts` change appears necessary; a second store or any browser-supplied
identity is proposed; the paired IPD D-4 act is withdrawn.

**Explicit non-grants:** no Gate C execution, no Gate D route admission, no Gate E write policy, no
Q5–Q8, no `P-6`/`P-8`, no durable write, no successful-save claim, no promotion, no CV-52 admission,
no `CV-25` closure, no release, no production eligibility, no IPD change, no fence relaxation, no
change to `D-1`/`D-2`/`D-4` beyond the baseline supersession in `D12-A`.

**Rollback:** delete the new ref (and, under `P-2`, close the PR without merging). **`6c654be…`, `main`
and every fence are untouched by a rollback** — which is precisely why `C-1` is recommended over `C-2`.

---

## 4. Boundaries preserved by this preparation

- **No** adapter file modified; **no** ref created, moved or deleted; **no** PR opened from any Gate B
  ref; `gate-b/local-principal-ipc-implementation` still `6c654be…`.
- **No** merge authority — this act merges nothing; PR #124 is a **separate** act.
- **No** pin change; **no** IPD write (IPD read with `git ls-remote` only).
- **No** Windows/browser acceptance; **no** Gate C/D/E execution; **no** production or "Group 1
  complete" claim.
- `D12` remains **NOT GRANTED** until the Authority renders it.

*End of the prepared act `IIPS-V3-G2-IRR-GATE-B-D12-REBASELINE-AUTHORITY-2026-10-17-01` — PROPOSED ·
NOT APPROVED · NOT AUTHORITY TO EXECUTE · ADAPTER UNPUBLISHED · `503` FENCE IN FORCE ·
NON_PRODUCTION.*
