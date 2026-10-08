# G-2 UI-Consumer — Durable Handoff / Remote Verification Record — 2026-10-08

**Gate:** G-2 UI-CONSUMER DURABLE HANDOFF / REMOTE VERIFICATION (user-issued execution prompt, 2026-10-08)
**Nature:** durability/verification only — **no implementation, no feature/architecture changes, no commits, no source mutations performed in this gate**
**Predecessor records:** `G2-UI-CONSUMER-IMPLEMENTATION-READINESS-2026-10-08.md` (§L scope), `G2-UI-CONSUMER-IMPLEMENTATION-2026-10-08.md` (implementation record)

---

## 1. Material finding — sandbox re-provisioning between gates

Between the implementation gate (prior turn) and this gate, the sandbox was **re-provisioned from a fresh clone** (local reflog: `clone: from https://github.com/ramkivs/iips-review-recovered.git` → checkout of the session branch). Consequences, all verified read-only:

- The local session branch is back at its base `17e234a1d6a5e1629cdf98b5c5f241a663cf9901`; the prior local commits are **gone from the object store** (`git cat-file -t 7f53ba34…` → "could not get object info"; `2df48a1` → "Not a valid object name").
- The **implementation content survived** in the persisted working tree (the Arena workspace snapshot restores files, not git objects): all 6 new files, both authorized modifications, and both G-2 records are present and verified (§4–§6 below).
- This is the same class of environment incident the Evidence Durability Gate recorded as material evidence of the durability invariant (`DURABILITY-RECORD.md`, PR #49): **only remote state is durable.**

## 2. §4 reconciliation (local, at gate start — no mutation)

| Item | Value |
|---|---|
| `git branch --show-current` | `arena/627f4e40-iips-review-recovered` |
| `git rev-parse HEAD` | `17e234a1d6a5e1629cdf98b5c5f241a663cf9901` (grafted, shallow) |
| `git rev-parse HEAD^{tree}` | `c6fb24d9093ee49e813561ba849c6c26d9da9805` |
| Local `main` / `origin/main` | `15b28e868a8ccf654cb0c7b5c7eeed50085947a7` (tree `e669595a…`) |
| Tracked modifications | exactly `frontend/src/app/App.tsx`, `frontend/src/app/navigation.ts` |
| Untracked | the 6 implementation files, 2 G-2 records, prior-gate records (`docs/integration/{P8,UI-*}.md`, `evidence/integration/`, `download/`) — all pre-existing |
| Unexpected modifications | **none** |

## 3. §5/§6 changeset integrity (working tree vs base `17e234a1`)

- Tracked diff: **exactly 2 files, +15/−0** (`App.tsx` +9/−0; `navigation.ts` +6/−0) — byte-identical to the authorized changes; post-image **blob hashes match the original implementation commit's diff exactly** (`App.tsx` → `c8b29bbf8e8553aca3947f7630d997a83f5880f0`, `navigation.ts` → `983c46192b6b443a1b99e44edc914fb460001fab`).
- New files: **exactly the 6 authorized** (sizes match the implementation record: 7628/4184/3730/5938/8531/6939 bytes; line counts match: 190/107/101/142/237/184).
- No server, contract, adapter, translation-boundary, authorization, IPD, D115, `iips-platform`, `/portfolio`, `PortfolioWorkspace`, Dhan, or production-config paths touched. **No unexpected tracked file. No STOP condition.**

### Blob-SHA manifest of the authorized implementation (verified working tree, 2026-10-08)

```
aaf0d39b8b8f994c4ceb60054a4acae3ea9b07a6  frontend/src/api/userPortfolios.ts
e608f315003904551f65fcdba936c32eddf65008  frontend/src/features/user-portfolios/UserPortfolioStates.tsx
ed4025f4b65274365af7f4583520913eef9600a2  frontend/src/features/user-portfolios/UserPortfolioList.tsx
049a8e193d3d901922bbc2f7ca2f79533fb5f329  frontend/src/features/user-portfolios/UserPortfolioDetail.tsx
fd7d847440c678d96ea14d59f94d3cf95909a13e  frontend/src/features/user-portfolios/UserPortfolioList.test.tsx
4a83e6f58200bf627610363651584c1aad187c26  frontend/src/features/user-portfolios/UserPortfolioDetail.test.tsx
c8b29bbf8e8553aca3947f7630d997a83f5880f0  frontend/src/app/App.tsx            (modified, +9/−0)
983c46192b6b443a1b99e44edc914fb460001fab  frontend/src/app/navigation.ts      (modified, +6/−0)
c370a1bd6cb4f6a38476d1cbb47ccec238de5240  docs/integration/G2-UI-CONSUMER-IMPLEMENTATION-READINESS-2026-10-08.md
7d2b05af6e4ac1c379b954657d6c38b48a6b4d41  docs/integration/G2-UI-CONSUMER-IMPLEMENTATION-2026-10-08.md
```

Base anchors: `17e234a1` tree `c6fb24d9093ee49e813561ba849c6c26d9da9805`; remote `main` `15b28e86` tree `e669595a7dc49bcdf3a1049e81f09f446a5daa38`.

## 4. §7 lineage determination

| Object | Reported (implementation record) | Status now |
|---|---|---|
| Implementation commit | `7f53ba34d16ccfd27936865746e9608604756c08` | **Lost locally** (object absent after re-provision); **absent remotely** (GitHub API `git/commits/7f53ba34…` → 404) — never published |
| Implementation parent | `17e234a1d6a5e1629cdf98b5c5f241a663cf9901` | Intact locally and remotely; **ancestor of remote main** (GitHub compare `17e234a1...15b28e86` → merge-base `17e234a1`; the local "diverged" reading is a shallow-graft artifact — both commits sit on the local graft boundary) |
| Implementation tree | `fc5f2c0f3ffaa6610a96da9e74acdc5ad9ead624` | Object lost; its content is the verified working tree (§3) |
| Record-correction commit | `2df48a1` (abbreviated; full SHA not captured in prior outputs) | Lost locally; absent remotely (API → "No commit found for SHA") |
| Prior session tip | `2df48a1` | Superseded by loss; current local session tip is the base `17e234a1` |

**Which tree contains the final authorized state?** No git tree object anywhere does. The final authorized state exists only as this workspace's verified working tree (manifest §3). The last trees that contained it were `fc5f2c0f` (implementation commit) and its unrecorded correction successor — both lost with the prior sandbox and never published.

## 5. §8 remote inspection evidence (GitHub REST API — the available verification mechanism)

- `git ls-remote origin` (both refs): **fails** — `gnutls_handshake() failed: The TLS connection was non-properly terminated` (the standing sandbox TLS closure; also the platform marks this session's remote channel closed).
- `GET /repos/ramkivs/iips-review-recovered/git/ref/heads/main` → **`15b28e868a8ccf654cb0c7b5c7eeed50085947a7`** (unchanged; PGP-verified merge "Merge PR #49: Evidence Durability Gate — add DURABILITY-RECORD.md"; tree `e669595a…`).
- `GET …/git/ref/heads/arena/627f4e40-iips-review-recovered` → exists, tip **`5e59910be370b2e62f3c80cab6387a2ce447e820`** ("Add Evidence Durability Record … (Gate 2026-10-07)", 2026-10-07T17:24:52Z, tree `e669595a…` = main's tree) — i.e. the remote session branch is the **pre-implementation Evidence Durability Gate head**.
- `GET …/git/commits/7f53ba34…` → **404 Not Found** (the implementation commit does not exist anywhere on the remote).
- `GET …/commits/2df48a1` → **no commit found** (correction commit never published).
- `GET …/contents/frontend/src/features/user-portfolios?ref=15b28e86` → **404**; `GET …/contents/frontend/src/api/userPortfolios.ts?ref=15b28e86` → **404** (implementation absent from main).
- `GET …/pulls?head=ramkivs:arena/627f4e40-iips-review-recovered&state=all` → exactly **one PR, #49** ("Evidence Durability Gate"), head `5e59910`, merged 2026-10-07T17:25:09Z as `15b28e86`. **No PR ever carried the G-2 implementation.**

## 6. §9–§10 push assessment

Remote publication from this sandbox is impossible: the git write channel is TLS-closed, and the platform session is closed (PR #49 lifecycle). Per §10, no re-commit was performed ("Do NOT create another implementation commit. Do NOT modify source merely to create a new hash") — the working tree was left byte-intact and **zero git objects/commits were created in this gate**.

## 7. §14 protected boundaries

Confirmed unchanged (remote main `15b28e86` tree `e669595a` + local diff §3): G-2 server, G-2 contract, G-2 adapter, translation boundary, authorization, IPD, D115, `iips-platform`, certified `/portfolio`, `PortfolioWorkspace`, Dhan integration, production configuration. Only the two authorized additive edits (`App.tsx`, `navigation.ts`) and the six new consumer files exist.

## 8. §15 final report

- **A. Starting authoritative main SHA:** `15b28e868a8ccf654cb0c7b5c7eeed50085947a7` (remote-verified unchanged at gate time).
- **B. Implementation commit SHA:** `7f53ba34d16ccfd27936865746e9608604756c08` (as reported; no longer resolvable anywhere — see §4).
- **C. Implementation parent SHA:** `17e234a1d6a5e1629cdf98b5c5f241a663cf9901` (intact; ancestor of main).
- **D. Implementation tree SHA:** `fc5f2c0f3ffaa6610a96da9e74acdc5ad9ead624` (as reported; object lost; content re-verified — §3 manifest).
- **E. Record-correction commit SHA:** `2df48a1` (abbreviated form only was recorded; object lost; never published).
- **F. Final session tip SHA:** prior reported tip `2df48a1` (lost); current local session branch tip `17e234a1d6a5e1629cdf98b5c5f241a663cf9901`; remote session branch tip `5e59910be370b2e62f3c80cab6387a2ce447e820` (pre-implementation).
- **G. Final session tree SHA:** local `17e234a1` → `c6fb24d9093ee49e813561ba849c6c26d9da9805`; remote session branch → `e669595a7dc49bcdf3a1049e81f09f446a5daa38`; no tree anywhere contains the implementation (§4).
- **H. Remote origin/main SHA:** `15b28e868a8ccf654cb0c7b5c7eeed50085947a7`.
- **I. Remote origin/main tree SHA:** `e669595a7dc49bcdf3a1049e81f09f446a5daa38`.
- **J. Exact changed-path inventory:** §3 manifest (8 code files + 2 records, with blob SHAs).
- **K. Remote verification evidence:** §5 (API citations; direct git channel failure documented).
- **L. No unauthorized files changed:** confirmed (§2–§3; scope audit of the working tree vs base matches the authorized §L set exactly).
- **M. No implementation added in this gate:** confirmed — verification only; zero commits; zero source mutations.
- **N. Durability disposition:** **C** (§9 below).

## 9. §16 disposition

**C — DURABILITY BLOCKED BY REPOSITORY/REMOTE CONDITION.**

Blocking conditions (both verified this gate):
1. **Repository condition:** the exact authorized git objects (`7f53ba34`, tree `fc5f2c0f`, `2df48a1`) were lost in the sandbox re-provisioning and were never published; §10 prohibits re-creating an implementation commit or minting a new hash from this side.
2. **Remote condition:** the git write channel is TLS-closed and the session's remote lifecycle is closed (PR #49, merged 2026-10-07, predates the implementation).

### Exact owner-side action required

1. From a machine with write access to `ramkivs/iips-review-recovered`, branch off current main `15b28e86` (e.g. `g2-ui-consumer/2026-10-08`). Since `17e234a1` (the implementation parent) is an ancestor of main, the change applies cleanly and the PR diff will be exactly the authorized scope.
2. Apply the authorized change set — the 6 new files + 2 additive edits + the 2 G-2 records — from this verified workspace (content fully specified by §3's manifest and the implementation record §B; the two edits are reproduced verbatim in the implementation record and this workspace's `git diff`).
3. Commit (new SHAs; disclose in the PR that they supersede the lost `7f53ba34`/`2df48a1`) and merge to main via PR per repository governance.
4. Post-publication verification (§11/§12 equivalent), e.g.:
   - `git ls-remote origin refs/heads/main` → record SHA; `git rev-parse origin/main^{tree}`.
   - For each §3 path: `git rev-parse origin/main:<path>` must equal the manifest blob SHA.
   - Confirm `frontend/src/features/user-portfolios/` contains exactly the 6 files' 5 feature files (+ the api client at its path) and that no path outside §3 changed (`git diff --name-status 15b28e86..origin/main` = the 10 paths).
   - Append a durability postscript to the implementation record with the new main SHA/tree.
5. Alternatively, the Program Authority may issue a new explicit gate authorizing a re-commit from this verified working tree (disclosed as a new SHA) — the push/PR would still be executed owner-side.

**Recommended next gate after successful publication:** G-2 USER-PORTFOLIO UI — WINDOWS NON-PRODUCTION ACCEPTANCE (per §16-A guidance; contingent on publication).
