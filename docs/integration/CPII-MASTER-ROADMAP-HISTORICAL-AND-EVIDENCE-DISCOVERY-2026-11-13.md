# CPII Master Roadmap — Historical and Associated Evidence Discovery

**Record ID:** `IIPS-CPII-MASTER-ROADMAP-HISTORICAL-AND-EVIDENCE-DISCOVERY-2026-11-13`
**Work item:** CPII-01 follow-up — exhaustive historical and associated evidence discovery for
`IIPS-CPII-MASTER-ROADMAP-2026-11-12`
**Repositories searched:** IRR `ramkivs/iips-review-recovered` · IPD `ramkivs/iips-production-market-data`
(read-only; neither modified) · plus a **declared extension** to 9 associated repositories under the same owner (§7.3)
**Nature:** read-only investigation and documentation. No implementation, no provisioning, no configuration change,
no dependency-pin change, no merge, no governance decision altered.

## 1. Executive conclusion

**Classification: `NOT FOUND — EXHAUSTIVE SEARCH WITHIN DECLARED SCOPE`.**

`IIPS-CPII-MASTER-ROADMAP-2026-11-12` **does not exist, has never existed, and has never been referenced** in any
commit, tree, blob, branch, tag, pull-request head, pull-request body or comment, issue, release, release asset, tag
message, wiki, project board or gist of either repository.

The decisive evidence is a scan of **every object in both repositories' object databases**, not merely branch tips:

| | IRR | IPD |
|---|---|---|
| Refs enumerated (heads / tags / pull) | **1,010** (443 / 3 / 564) | **308** (147 / 6 / 155) |
| Unique commits reachable | **1,924** | **1,101** |
| Objects in database (commits / trees / blobs) | **15,592** (1,924 / 6,495 / 7,171) | **10,119** (1,101 / 4,331 / 4,685) |
| Blob bytes scanned | **1,366,601,286** | **203,086,207** |
| Paths ever matching `CPII` | **1** — this record's own predecessor, the CPII-01 report | **0** |
| Paths ever matching `MASTER-ROADMAP` or `PORTFOLIO-INVESTMENT-INTELLIGENCE` | **0** | **0** |
| Blobs whose content contains `CPII` as a standalone word | **2** — the CPII-01 report v1 (`5647be74…`) and v2 (`ccbf90cf…`) | **0** |
| Blobs whose content contains `MASTER-ROADMAP` / `MASTER ROADMAP` | **2** — the same two CPII-01 versions | **0** |
| Blobs containing `CPII-0n` work-item identifiers | **2** — the same two | **0** |

Every other `CPII` occurrence in either repository's entire history is the substring `C-P-I-I` inside
**`getCPIIndex`** — the MoSPI macro-indicator endpoint. In IRR that is **1,011 occurrences across 525 blobs**, in
**70 distinct surrounding contexts, every one of which was individually classified** (§3.3). In IPD it is exactly
**one** occurrence in one blob.

**What this means precisely, and what it does not mean.**

- It **does** mean: no repository record of this roadmap exists, and no repository record ever pointed at one. The
  CPII work-item series has no existence in either repository's history.
- It **does not** mean the operator never held such a document. §9 establishes a **direct in-repo precedent** of an
  authoritative dated roadmap — *"the accepted, corrected IIPS v3.0 E2E Completion Roadmap dated `2026-10-17`"* —
  cited on IRR `main` as the authority source for governance acts `D1` and `D12`, whose title appears in **431
  blobs**, and which was **never committed as a file under any name in either repository**. Absence from the
  repositories therefore cannot prove absence from the operator's own planning surface.
- The **only known reference** to `IIPS-CPII-MASTER-ROADMAP-2026-11-12` is the operator's CPII-01 work-item
  instruction, which is **not a repository record** and is cited here as external provenance only.

**Alternative authoritative roadmaps that do exist** (§8): IPD's `IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`
(W01–W20, on IPD `main`, cross-referenced from IRR `main`) and IRR's
`IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` (IID-0…IID-6, closed). **Neither uses a `CPII` identifier series,
neither mentions CPII, and neither is the named artefact.** No alternative was substituted for it, and nothing was
re-sequenced.

> **Date note.** The session run date is 2026-11-12 by the operator's local clock; GitHub records the CPII-01
> commits at `2026-11-12T19:46Z`/`2026-11-12T20:00Z` and this investigation ran while GitHub's `pushed_at` for IRR
> and IPD read `2026-11-13T04:14Z` and `2026-11-13T05:58Z`. The deliverable filename carries `2026-11-13` exactly as
> the work item specifies and is retained verbatim; it is not a claim about when the investigation ran.

---

## 2. Search methodology

CPII-01 §2.2 established absence over **branch-tip trees reachable from locally known refs**. That method has four
real blind spots, each closed here:

| Blind spot in the earlier method | Closed by |
|---|---|
| `git log --all` and `git grep` see only **locally fetched** refs | full `git clone --mirror` of both repositories into `/tmp` (outside the working repository) |
| branch **tips** only — not intermediate or superseded trees | `git rev-list --objects --all`, which enumerates **every path at every commit** on every ref |
| refs GitHub stops advertising after a branch is deleted | `refs/pull/*/head` and `refs/pull/*/merge`, fetched by the mirror: **561 of 561** IRR PR heads and **152 of 152** IPD PR heads are present, so commits from deleted branches are covered |
| objects unreachable from any ref | `git cat-file --batch-all-objects --batch`, which streams **every object the database holds**, reachable or not |

**Method, in order executed.**

1. **Mirror both repositories.** `git clone --mirror` to `/tmp/irr-mirror.git` (27 MB) and `/tmp/ipd-mirror.git`
   (47 MB). The working repository at `/home/user/iips-review-recovered` was **never** used as the search target for
   history, was never checked out to another commit, and never had a branch created, switched or deleted. Verified
   afterwards: `git status --porcelain` empty, `HEAD` still `arena/94a53bb3-iips-review-recovered` (§12).
2. **Enumerate refs and objects.** `for-each-ref` per ref namespace; `rev-list --all --count`;
   `cat-file --batch-all-objects --batch-check` for the object census.
3. **Enumerate every historical path.** `git rev-list --objects --all`, filtered for `CPII`,
   `MASTER[-_]ROADMAP`, `PORTFOLIO[-_]INVESTMENT[-_]INTELLIGENCE`, and `roadmap` generally.
4. **Scan every blob's content.** A streaming reader over `cat-file --batch-all-objects --batch` applied seven
   regular expressions to all 7,171 IRR and 4,685 IPD blobs (§3.2, §4.2), capturing the object SHA of every match.
5. **Classify every match context.** A second pass extracted **all** 12-character windows around every
   case-insensitive `CPII` occurrence in every blob and tallied the distinct contexts (§3.3), so that no genuine
   reference could hide among the `getCPIIndex` false positives.
6. **Pickaxe and message search.** `git log --all -S<token>` (content introduced or removed at any commit) and
   `git log --all --grep=<token> -i` (commit messages and metadata) for each token.
7. **Deletion and rename detection.** `git log --all --diff-filter=DR --name-status` filtered for roadmap paths.
8. **Enumerate the whole social layer.** All **713** pull requests (561 IRR + 152 IPD) via bulk GraphQL with
   `title`, `body`, `state`, `isDraft`, `mergedAt`, `headRefName`, up to 60 `comments` and 25 `reviews` each;
   all inline review comments via the paginated REST endpoint; all issues (2 IRR + 4 IPD) with bodies and comments;
   all releases and release assets; all tags; discussions; wikis; project boards; owner gists.
9. **Exact-phrase GitHub search** as an independent cross-check, distinct from the loose-token search whose
   hyphen-splitting produced false positives (§5.2, §10).
10. **Associated-repository extension.** Enumerate every repository owned by `ramkivs`, tree-scan each for the
    tokens, and compare each repository's `pushed_at` against the roadmap's claimed date (§7.3).
11. **Token census.** Extract every distinct `*ROADMAP*` token appearing in any blob of either repository, to
    discover aliases that were not anticipated (§8).

**Search tokens.** `IIPS-CPII-MASTER-ROADMAP-2026-11-12`, `CPII-MASTER-ROADMAP`, `CPII`, `CPII-01`…`CPII-06`,
`MASTER-ROADMAP`, `MASTER_ROADMAP`, `MASTER ROADMAP`, `master roadmap`,
`PORTFOLIO-INVESTMENT-INTELLIGENCE` / `PORTFOLIO INVESTMENT INTELLIGENCE`, `IID-MASTER`,
`OPERATIONALISATION-ROADMAP` / `OPERATIONALIZATION-ROADMAP`, plus the open-ended `*ROADMAP*` census.

---

## 3. IRR historical Git findings

### 3.1 Coverage achieved

| Measure | Value |
|---|---|
| Remote branches (`refs/heads`) | **443** |
| Tags (`refs/tags`) | **3** (`v3.0-phase12-certified`, `program-v1.2.0`, `cap03-s2-recovery-20261031-212225`) |
| Pull refs | **564** = `refs/pull/*/head` **561** + `refs/pull/*/merge` **3** |
| Total refs | **1,010** |
| Unique commits reachable from all refs | **1,924** |
| Objects in database | **15,592** = 1,924 commits + 6,495 trees + 7,171 blobs |
| Blob bytes content-scanned | **1,366,601,286** (≈1.37 GB) |
| Commit date range examined | repository inception … `2026-11-13T04:14Z` |

**Every one of the 561 pull requests has its head commit present in the mirror**, so the trees and blobs of PRs whose
branches were deleted are inside the searched set. This is the specific gap CPII-01 §2.2 could not close.

### 3.2 Path and content results

| Search | Result |
|---|---|
| Paths ever matching `CPII` (any case), all refs, all history | **1** — `docs/integration/CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md` (this record's predecessor) |
| Paths ever matching `MASTER[-_]ROADMAP` | **0** |
| Paths ever matching `PORTFOLIO[-_]INVESTMENT[-_]INTELLIGENCE` | **0** |
| Paths ever matching `roadmap` (any) | **3** — `ROADMAP.md`; `docs/integration/DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md`; `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` |
| Blobs containing `CPII` as a standalone word (`(?<![A-Za-z])CPII(?![A-Za-z])`) | **2** — `5647be74fe4a…` (CPII-01 v1) and `ccbf90cf17e0…` (CPII-01 v2). Blob SHAs independently match the values GitHub reports for those two commits |
| Blobs containing `MASTER[-_ ]ROADMAP` | **2** — the same two |
| Blobs containing `CPII-0\d` | **2** — the same two |
| Blobs containing `PORTFOLIO[-_ ]INVESTMENT[-_ ]INTELLIGENCE` | **0** |
| Blobs containing `IID[-_ ]MASTER` | **0** |
| Blobs containing `OPERATIONALISATION/OPERATIONALIZATION[-_ ]ROADMAP` | **1** — CPII-01 v2 only |
| Deleted or renamed roadmap documents, all history (`--diff-filter=DR`) | **0** — no roadmap file was ever deleted, renamed or moved in IRR |

### 3.3 Every `CPII` context classified

All 12-character windows around every case-insensitive `CPII` match, across all 7,171 blobs:
**525 blobs matched; 70 distinct contexts.** The complete tally of the significant contexts:

| Occurrences | Context | Classification |
|---|---|---|
| 507 | `/api/cpi/getCPIIndex?limit=1` | MoSPI macro endpoint — false positive |
| 480 | `/api/cpi/getCPIIndex`, CPI's | MoSPI macro endpoint — false positive |
| 11 | `/api/cpi/getCPIIndex?base_ye` | MoSPI macro endpoint — false positive |
| 6 | `/api/cpi/getCPIIndex',` | MoSPI route table — false positive |
| 4 | `/api/cpi/getCPIIndex')).toBe` | test assertion — false positive |
| 2 | `/api/cpi/getCPIIndex');` | false positive |
| 1 | `/api/cpi/getCPIIndex` \| ✅ | false positive |
| **1,011 total** | | **all `getCPIIndex`** |

The remaining **59** distinct contexts each occur 1–3 times and every one is text from the CPII-01 report
itself. Reproduced in a fenced block because several contain literal Markdown backticks and pipes, which
cannot be escaped reliably inside a table cell:

```
  3 occurrences  uisites for CPII-02…CPII-0

  2 occurrences  # CPII-01 — Runt                     ID:** `IIPS-CPII-01-RUNTIME-
                 ork item:** CPII-01 — conf           ted (§11). CPII-02…CPII-0
                 CPII-01 names tw                     equired for CPII-02 … CPII
                 alytical.** CPII-02…CPII-0           ** by `IIPS-CPII-MASTER-ROAD
                 done:** no CPII-02…CPII-0            publish the CPII master road
                 ommit `IIPS-CPII-MASTER-ROAD        act outside CPII-01.
                 TA_DIR=/tmp/cpii01-probe/dat         (`/tmp/cpii01-probe/dat

  1 occurrence   ne named by CPII-01 | Search         | `IIPS-CPII-MASTER-ROAD
                 grep -l -i CPII`; `git log
```

Reading these: the three contexts containing `IIPS-CPII-MASTER-ROAD` are the CPII-01 report naming the
roadmap it was itself searching for; the contexts reading "publish the CPII master road" and "act outside
CPII-01." are its own prose; the two /tmp/cpii01-probe contexts are the temporary probe directory that CPII-01
§6 records creating and deleting; the remainder are its headings, its work-item label and its reproduction
commands.

**No context other than `getCPIIndex` and the CPII-01 report exists anywhere in IRR history.**

### 3.4 Pickaxe and commit-message results

| Search | Commits | Which |
|---|---|---|
| `log --all -S'IIPS-CPII-MASTER-ROADMAP-2026-11-12'` | **1** | `ec0aa26` (CPII-01 v1) |
| `log --all -S'CPII-MASTER-ROADMAP'` | **1** | `ec0aa26` |
| `log --all -S'MASTER-ROADMAP'` | **2** | `ec0aa26`, `431a5f5` |
| `log --all -S'PORTFOLIO-INVESTMENT-INTELLIGENCE'` | **0** | — |
| `log --all -S'CPII-02'` / `-S'CPII-06'` | **1** each | `ec0aa26` |
| `log --all -S'CPII'` | **10** | `431a5f5`, `ec0aa26` (mine) + `6515640`, `1c208f3`, `28517d7`, `37d430e`, `65e332b`, `630820f`, `b489efd`, `0cc00f2` — each verified to contain only `getCPIIndex` |
| `log --all --grep -i 'CPII'` | **2** | `431a5f5`, `ec0aa26` |
| `log --all --grep -i 'MASTER-ROADMAP'` | **1** | `431a5f5` |
| `log --all --grep -i 'master roadmap'` | **0** | — |
| `log --all --grep -i 'PORTFOLIO-INVESTMENT-INTELLIGENCE'` | **0** | — |

### 3.5 `*ROADMAP*` token census across all IRR blobs

Every distinct roadmap-bearing token ever written into any IRR blob, with occurrence counts — this is the alias
discovery mechanism, and it is exhaustive rather than guesswork:

| Occurrences | Token |
|---|---|
| 2,591 | `ROADMAP.md` (the IES engineering-standards roadmap) |
| 1,864 / 1,527 / 538 | `roadmap` / `ROADMAP` / `Roadmap` (prose) |
| 62 | `IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` |
| 47 | `roadmap.` (prose) |
| **8** | **`IIPS-CPII-MASTER-ROADMAP-2026-11-12`** — all eight inside the two CPII-01 report blobs |
| **8** | **`MASTER-ROADMAP`** — same |
| 7 | `IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md` (IPD's roadmap, cross-referenced from IRR — §8.1) |
| 4 | `roadmap-aligned` (CPII-01 prose) |
| 3 | `sustainability-roadmap-2026` (unrelated) |
| 2 | `DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` |
| 1 each | `IMPLEMENTATION_ROADMAP`, `DHAN-LIVE-ROADMAP-2026-11-11`, `DHAN-LIVE-ROADMAP`, `master-roadmap`, `PRODUCT_RECONCILIATION_AND_FUTURE_ROADMAP.md` |

**17 distinct tokens in total. None is a CPII roadmap other than this investigation's own subject string.**

### 3.6 Activity on the roadmap's claimed date

All commits dated `2026-11-12` or `2026-11-13` on any ref: **21 in IRR**. None creates or references a roadmap.
Subject matter: Personal Portfolio editor redesign and fail-closed read integration; PR #557/#554/#558/#559/#560/#561
merges; identity Phase 1 source-validation hardening; `6ae09ac` *"enforce W05 sourceRights dataset classification on
coverage surfaces"*; WI-13 head re-validation; `7755db9` W07 XBRL defect resolution; W10 mapping inventory and
handoff; `d10afbb` W11 engine execution; and the two CPII-01 commits `ec0aa26`/`431a5f5`.

**The live work sequence on the roadmap's claimed date is the W-series (W05, W07, W10, W11), not any CPII series.**

---

## 4. IPD historical Git findings

### 4.1 Coverage achieved

| Measure | Value |
|---|---|
| Remote branches | **147** |
| Tags | **6** (`temporary-cleanup-caf73ba`, `post-cleanup-baseline-b46b4f4`, `portfolio-option-a-cb969b6`, `p14-r7-65b78f7`, `iips-pin-np04-2e11fa3b`, `iips-pin-g24-6828155e`) |
| Pull refs | **155** = 152 `head` + 3 `merge` — **all 152 PRs covered** |
| Total refs | **308** |
| Unique commits | **1,101** |
| Objects in database | **10,119** = 1,101 commits + 4,331 trees + 4,685 blobs |
| Blob bytes content-scanned | **203,086,207** |

### 4.2 Results

| Search | Result |
|---|---|
| Paths ever matching `CPII` | **0** |
| Paths ever matching `MASTER[-_]ROADMAP` | **0** |
| Paths ever matching `PORTFOLIO[-_]INVESTMENT[-_]INTELLIGENCE` | **0** |
| Paths ever matching `roadmap` | **3** — `ROADMAP.md`; `docs/integration/IIPS-CONSOLIDATED-SNAPSHOT-TO-CURRENT-ARCHITECTURAL-AUDIT.md`; `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md` |
| Blobs containing `CPII` as a standalone word | **0** |
| Blobs containing `CPII` in any form | **1** — `5ccef665e82e`, the single context `/api/cpi/getCPIIndex',` |
| Blobs containing `MASTER[-_ ]ROADMAP` / `PORTFOLIO…INTELLIGENCE` / `CPII-0\d` / `IID[-_ ]MASTER` | **0** each |
| Pickaxe `-S` for all six roadmap tokens | **0** commits each |
| Pickaxe `-S'CPII'` | **3** commits — `8ae69cf`, `4b37e5b`, `0cc00f2`; each verified `getCPIIndex` only |
| `--grep -i` for `CPII`, `MASTER-ROADMAP`, `master roadmap`, `PORTFOLIO-INVESTMENT-INTELLIGENCE` | **0** commits each |
| Deleted or renamed roadmap documents | **0** |
| `*ROADMAP*` token census | **9** distinct tokens; largest are `roadmap` (313), `Roadmap` (107), `DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` (43), `ROADMAP` (26), `ROADMAP.md` (8), `IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md` (1). **No CPII token of any kind** |

`ROADMAP.md` was added on `2026-08-12` in `7325aed` (*"chore: establish durable Phase 12 certified baseline"*) and
now survives on only **one** ref; it is absent from IPD `main`. No deletion or rename of a roadmap file appears in
IPD history under `--diff-filter=DR`.

### 4.3 Activity on the roadmap's claimed date

**26 commits** in IPD dated `2026-11-12`/`2026-11-13`, all W-series or D-series: W-01 Windows DPAPI VaultProvider;
W-02 DPAPI secret-store backend, acceptance script, DACL idempotency, process runner, CI integration, executed
Windows acceptance 19/19 PASS; D-7 provider state model; W-03 daemon vault backend; W-04 credential provisioning and
rotation; D-6 operator token acquisition and Windows-host rehearsal; W-06 first authorised request and evidence gap;
and `a22a91b` (`2026-11-13T05:37Z`) *"docs(w11): record blocked actual owner-bound portfolio read (dependency 1)"*.
**No roadmap creation, and no CPII reference.**

---

## 5. Pull-request findings

### 5.1 Exhaustive enumeration (not search-index dependent)

All PRs of both repositories were enumerated through the GraphQL API with their titles, bodies, states, draft flags,
merge timestamps, head/base branch names, **all** issue comments and **all** reviews, then scanned locally.

| | IRR | IPD |
|---|---|---|
| PRs enumerated | **561 of 561** (12 pages) | **152 of 152** (4 pages) |
| State breakdown | 550 merged · 8 closed · 2 open · 1 open draft | 148 merged · 1 closed draft · 3 open |
| PR comments retrieved | **143** | **21** |
| PR reviews retrieved | **0** | **0** |
| Inline review comments (REST, fully paginated) | **0** | **0** |
| Text fields scanned | **1,265** | **325** |
| Characters scanned | **2,026,167** | **441,604** |

| Token | IRR hits | IPD hits |
|---|---|---|
| `CPII` (word-boundary) | **0** | **0** |
| `CPII` (any substring) | **1** — PR **#106** body: *"the same host+path the implementation declares (`/api/cpi/getCPIIndex`)"* — false positive | **0** |
| `CPII-0\d` | **0** | **0** |
| `MASTER-ROADMAP` / `MASTER_ROADMAP` | **0** | **0** |
| `master roadmap` (words) | **0** | **0** |
| `PORTFOLIO INVESTMENT INTELLIGENCE` | **0** | **0** |
| `IID-MASTER` | **0** | **0** |

**Changed filenames across every PR** required no separate enumeration: because all 713 PR head commits are inside
the mirrors, §3.2 and §4.2's path census **already covers every filename any PR ever touched**.

### 5.2 Loose-token search false positives, resolved

An initial GitHub search with **unquoted** hyphenated queries returned apparent hits: `MASTER-ROADMAP` → 1 IRR PR
(**#125**, *"docs(g2): D-IRR-124 execution receipt (§16.46) and D12 rendered act + execution (§16.47)"*), and
`PORTFOLIO-INVESTMENT-INTELLIGENCE` → 4 IRR PRs. These are **token-splitting artefacts**: GitHub splits hyphenated
terms and matches the fragments (`master`, `roadmap`, `portfolio`, `investment`, `intelligence`) independently.
Re-run as **exact phrases** (`%22…%22`), all six combinations return `total_count = 0`:

| Exact-phrase query | IRR `type:pr` | IRR `type:issue` | IPD `type:pr` | IPD `type:issue` |
|---|---|---|---|---|
| `"CPII"` | 0 | 0 | 0 | 0 |
| `"MASTER-ROADMAP"` | 0 | 0 | 0 | 0 |
| `"PORTFOLIO INVESTMENT INTELLIGENCE"` | 0 | 0 | 0 | 0 |

PR #125 is a Gate-B merge-authority receipt for `D12`; it is one of the records that **cite** the uncommitted
"IIPS v3.0 E2E Completion Roadmap dated 2026-10-17" (§9.1) and contains no CPII reference.

### 5.3 PRs that mention a roadmap at all (semantic sweep)

**IRR: 14 PRs** whose title or body contains "roadmap" — #98 (CV-CORR-01…05 register convergence), #456 (IID-1),
#461 (IID-2), #464 (IID-3), #471 (IID-4), #472 (PA adoption docket), #473 (IID-4 verification), #475 (L-014
decision), #480 (IID-5), #481 (IID-6), #483 (IID-0…IID-6 formal closure), #484 (AC-X2/AC-X6), #548
(*"Stage 2 (W03/W05/W07/W08/W09): source rights classification and the ISIN-path series bridge"*), #560
(*"docs(integration): Dhan live integration roadmap v1.1 + current-state investigation"*).
**IPD: 2 PRs** — #9 (CI workflow), #156 (*"W-01 + W-02: Windows VaultProvider, DPAPI backend…"*, open).

**None is a CPII roadmap PR.** #548 and #156 confirm the W-series is the active planning sequence; #560 is the
excluded-scope Dhan Live roadmap.

---

## 6. Issues and discussions findings

### 6.1 Issues — all enumerated, all read

Both repositories have very few true issues; they are listed exhaustively with bodies and comments.

**IRR — 2 issues, 0 comments:**

| # | State | Title | Relevance |
|---|---|---|---|
| #201 | closed | *[capability] CV-CORR-64 Group E pass — IRR `contents:write` denied; tracker/record/code change carried as a verified patch in IPD* | records a publication-permission boundary; no roadmap content |
| #200 | closed | *[capability] IRR `contents:write` denied — CV-CORR-64 tracker update prepared but unpublished* | capability probe; body is one sentence |

**IPD — 4 issues, 2 comments:**

| # | State | Title | Relevance |
|---|---|---|---|
| #44 | closed | *Land the Q1 Group E durable broker-import candidate on IPD main (patch artifact in IRR; agent push capability denied)* | operator handoff; no roadmap content |
| #43 | closed | *[capability probe — delete me]* | *"Agent write-capability probe for IPD publication. No work attached."* |
| #17 | closed, 1 comment | *Handoff (IRR session cca03e7d): CV-39 Gate 3 implementation-authority request draft + contract §5.1 residual key-count correction* | governance handoff; comment is a 2026-10-21 administrative closure note |
| #16 | closed, 1 comment | *PERMISSION-TEST-DELETE-ME* | body `test`; comment is a closure note |

**No issue in either repository mentions CPII, a master roadmap, CPII-01…CPII-06, or any roadmap-creation or
roadmap-publication decision.** There is no issue requesting, announcing, tracking or accepting a CPII roadmap.

### 6.2 Discussions

| Repository | Discussion categories | Discussions |
|---|---|---|
| IRR | **0** | **0** |
| IPD | **0** | **0** |

Discussions are **not enabled/populated** in either repository (GraphQL `discussionCategories.totalCount` and
`discussions.totalCount` both 0). There is no archived or hidden discussion content to search.

### 6.3 Project boards

| Surface | IRR | IPD |
|---|---|---|
| ProjectsV2 (GraphQL, repository scope) | **0** | **0** |
| ProjectsV2 (GraphQL, owner scope `ramkivs`) | **0** | — |
| Classic projects (REST `state=all`) | HTTP **404** | HTTP **404** |

`has_projects` reports `true` for both repositories, yet the classic-projects REST endpoint returns 404 and
ProjectsV2 counts are zero at both repository and owner scope. No planning board content was reachable (§10 L-3).

---

## 7. Releases, published documentation and external evidence

### 7.1 Releases and assets

| | IRR | IPD |
|---|---|---|
| Releases | **2** | **0** |
| Release 1 | `cap03-s2-recovery-20261031-212225` — *"CAP-03 S2 Original Artifact Recovery"*, published `2026-10-31T15:59:49Z`, **4 assets**: `CAP03-S2-Original-1140-Artifacts.zip`, `original-s2-sha256-inventory.txt`, `recovery-evidence.json`, `recovery-run-20261031-212225-35931ce8.txt` | — |
| Release 2 | `program-v1.2.0` — *"Program v1.2.0 — 13-Engine Successor LTS"*, published `2026-09-05T06:11:08Z`, **0 assets** | — |
| `CPII` / `MASTER-ROADMAP` occurrences in release bodies | **0** | **0** |
| Roadmap-bearing asset names | **0** | **0** |

No release publishes a roadmap, and no release asset is a planning document.

### 7.2 Wikis, gists, pages, repository metadata

| Surface | IRR | IPD |
|---|---|---|
| `has_wiki` | **false** | true |
| Wiki git repository (`<repo>.wiki.git`) | **not found** | **not found** — `has_wiki` is true but the wiki was never initialised, so it holds no content |
| `has_pages` | false | false |
| Owner gists (`users/ramkivs/gists`) | **0** (owner-wide) | **0** |
| Repository description | *"recovered from Arena on 14-08-2026"* | *(none)* |
| `homepage` field | none | none |
| `README.md` roadmap references | **0 lines** | **0 lines** |
| GitHub code search, default branch, exact aliases | **0** for `IIPS-CPII-MASTER-ROADMAP`, `CPII-MASTER-ROADMAP`, `PORTFOLIO-INVESTMENT-INTELLIGENCE` | **0** for all three |

### 7.3 Declared extension — associated repositories beyond IRR and IPD

The work item's declared scope is IRR and IPD. Evidence inside IRR `main` pointed outside that scope, so the search
was **extended and is labelled as an extension**: `evidence/integration/sairam-holdings-readiness-2026-11-06/named-repository-source-manifest.json`
(on IRR `main`, 30 lines) pins four sources in a **third** repository:

```json
{ "repository": "ramkivs/ipo-screening-engine",
  "commit":     "d661b5ee99a782566fedcb9aa2b139e756948d27",
  "path":       "docs/PRODUCT_RECONCILIATION_AND_FUTURE_ROADMAP.md",
  "blob":       "01d2a4efa2abe37a80eb0d85019ff891ec709d60",
  "sha256":     "61e440f7951450aaf9d42ac5bcabd6ef815ac32fc5b4f370db2b379a74de0fdb" }
```

The pinned blob **was verified to exist** (35,403 bytes) at the pinned commit (`d661b5ee`, `2026-11-04T16:59:10Z`,
*"Merge pull request #62"*). This establishes two things: a third repository participates in the programme's
evidence chain, and IRR's practice is to **pin cross-repository documents by commit + blob + sha256 rather than copy
them** — so a planning artefact can be authoritative for IRR without residing in IRR.

All 11 repositories owned by `ramkivs` were enumerated and the 9 outside declared scope were tree-scanned:

| Repository | Last push | `CPII`/`MASTER-ROADMAP` paths | Roadmap-ish paths |
|---|---|---|---|
| `iips-review-recovered` (IRR, in scope) | `2026-11-13T04:14Z` | 1 (this record's predecessor) | 3 |
| `iips-production-market-data` (IPD, in scope) | `2026-11-13T05:58Z` | 0 | 3 |
| `ipo-screening-engine` | `2026-11-04T16:59Z` | **0** | `docs/PRODUCT_RECONCILIATION_AND_FUTURE_ROADMAP.md` |
| `equity-market-data-engine` | `2026-11-04T06:15Z` | **0** | — |
| `finapp-authoritative` | `2026-11-03T12:30Z` | **0** | — |
| `CapStew-Engine` | `2026-11-03T14:11Z` | **0** | — |
| `finapp` | `2026-08-20T13:27Z` | **0** | — |
| `iips-engineering-standards-` | `2026-08-06T18:14Z` | **0** | `ROADMAP.md` |
| `IIPS` | `2026-08-03T18:29Z` | **0** | — |
| `Cockpit` | `2026-08-03T17:07Z` | **0** | — |
| `Portfolio_Analyzer` | `2026-07-11T14:23Z` | **0** | — |

**Decisive date argument.** A document dated `2026-11-12` cannot reside in a repository that has received no push
since `2026-11-04`. **All nine out-of-scope repositories were last pushed on or before `2026-11-04T16:59Z`** — eight
days before the roadmap's claimed date. Only IRR and IPD received pushes on or after `2026-11-12`, and both were
searched exhaustively.

**The one roadmap document found outside scope is not a candidate.** `ipo-screening-engine`'s
`docs/PRODUCT_RECONCILIATION_AND_FUTURE_ROADMAP.md` (400 lines, 35,403 bytes, *"IPO Screening Engine — Complete
Product Reconciliation & Future Roadmap"*, §10 "Future Product Roadmap") contains **0** mentions of `CPII`,
`MASTER-ROADMAP`, `2026-11-12`, `Identity Coverage`, `Investment Coverage`, `IID`, `iips-review-recovered` or
`iips-production-market-data`. It is a different product's roadmap and does not sequence IID coverage
operationalisation.

---

## 8. Alternative filenames and aliases investigated

### 8.1 Alternative authoritative planning artefacts that DO exist

| # | Artefact | Location and pin | Content | CPII? |
|---|---|---|---|---|
| A1 | **`IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`** | **IPD `main`**, `docs/integration/`, blob `bbd944c56c227160720a3804b92299d7b3236c84`, sha256 `b3a08f079a58ef3beced3235b0402519b598b2559c194b6062cd6cff6c91063f`, 289 lines / 57,999 bytes; committed `2026-11-10` across `a4f2d41` (*"docs: derive current-portfolio execution roadmap"*), `8d79b9f`, `50f7a9d`, `93ef9e9` | Self-describes as *"ROADMAP COMPLETE / AUTHORIZATION ESTABLISHED / EXECUTION READY FOR IDENTIFIED READ-ONLY STARTS / PRODUCT NOT ACCEPTED"* and *"the authoritative execution-plan companion to the consolidated architectural audit"*. Defines **W01–W20** (its own count line, **line 60**: *"Counts: 20 work items; 7 have a read-only start now (W01, W02, W10, W12, W16, W18, W19); 16 require external evidence/access for completion (W03–W17, W20)"*, source emphasis elided) plus decisions **GD-1…GD-7**, a readiness model and per-item predecessors. Mentions Identity Coverage (2×), Investment Coverage (1×), IID (25×) | **0** CPII, **0** `MASTER-ROADMAP`, **0** references to `2026-11-12`/`2026-11-13` |
| A2 | **`IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md`** | **IRR `main`**, `docs/integration/`, blob `a988194dc4a229e09fb929010429c79499de993f`, 1,393 lines / 101,349 bytes | The IID **implementation** roadmap: identifier series `IID-0`…`IID-6`, `IID-01/02/03`, requirements `R-1`…`R-17`, decision `D-1`, `NP-04`, `NP-12`; 9 references to append-only overlays | **0** CPII, **0** `MASTER-ROADMAP`, **0** `W01`, **0** references to `2026-11-12`, **0** "operationalisation roadmap" |
| A3 | **`ROADMAP.md`** (IRR) | IRR `main`, blob `ffc4725a7b94841b56a63e00e71782135750a080`, 124 lines / 3,826 bytes | *"IIPS Engineering Standards"* roadmap — repository `iips-engineering-standards`, IES-005/IES-006 status, IES-010…020. A different programme | **0** |
| A4 | **`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`** | IRR `main`, 22,535 lines / 4,095,022 bytes | The master tracker and IRR/IPD decision register — the largest planning record in the programme | **0** CPII as a word (its 2 case-insensitive hits are `getCPIIndex`); **0** `MASTER-ROADMAP` |
| A5 | `DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` | IRR (PR #560, merged) | Dhan Live integration roadmap v1.1 — **explicitly excluded from CPII-01 scope** | **0** |
| A6 | `IIPS-CONSOLIDATED-SNAPSHOT-TO-CURRENT-ARCHITECTURAL-AUDIT.md` | IPD | The audit that A1 is the *"execution-plan companion"* to | **0** |

**A1 is the strongest alternative candidate and is cross-repository.** It satisfies requirement 2.E.1 exactly — a
roadmap that exists in one repository and is referenced by the other: IRR `main` cites it at
`docs/integration/IIPS-CURRENT-PORTFOLIO-STAGE-2-IRR-RECORD-2026-11-10.md:5` —
*"`docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`, read in full before any change."* — and IRR's
Dhan Live roadmap also cites it (7 occurrences of its filename across IRR blobs). It is **not** the CPII roadmap:
different repository, different identifier series (W01–W20 vs CPII-01…06), different date, and zero CPII content.

### 8.2 Aliases searched and rejected

| Alias considered | Basis | Result |
|---|---|---|
| `CPII-MASTER-ROADMAP` (no `IIPS-` prefix) | prefix variation | 0 paths, 0 blobs outside this record's own subject string |
| `MASTER_ROADMAP`, `MASTER ROADMAP`, `master roadmap` | separator and case variants | 0 outside CPII-01 |
| `PORTFOLIO-INVESTMENT-INTELLIGENCE`, `PORTFOLIO INVESTMENT INTELLIGENCE` | a plausible expansion of the `CPII` acronym named in the work item | **0 occurrences in any blob, PR, issue, release or path in either repository** — so this expansion has no repository basis |
| `IID-MASTER` | IID-series master document | 0 |
| `OPERATIONALISATION-ROADMAP` / `OPERATIONALIZATION-ROADMAP` | the subject matter CPII-01 describes | 1 blob — CPII-01 v2 itself |
| `*COMPLETION*ROADMAP*`, `E2E-COMPLETION` as a **path** | the title cited in §9.1 | **0 paths** — the title exists only as prose |
| `IIPS-CPII-*`, `CPII_*` | underscore variant | 0 |
| any `2026-11-12`-dated path | the roadmap's claimed date | IRR: `IIPS_V3_IID_WI13_HEAD_REVALIDATION_2026-11-12.md`, `W05-ACTUAL-FINANCIAL-DATASET-QUALIFICATION-2026-11-12.md`, `W07-FINANCIAL-LIMITATION-RESOLUTION-2026-11-12.md`, `W10-COMPLETION/HANDOFF/ISSUER-TO-ENGINE-MAPPING-2026-11-12.md`, `W11-ISSUER-ENGINE-EXECUTION-2026-11-12.md`, plus the WI-13 evidence bundle and a lifecycle-regression evidence dir. IPD: eleven `DHAN-D6/D7/W01-W06` documents and `IIPS-W11-DEP1-ACTUAL-OWNER-BOUND-PORTFOLIO-EVIDENCE-2026-11-13.md`. **None is a roadmap; none mentions CPII** |
| any `2026-11-13`-dated path | this record's own date | IRR: the CPII-01 report only. IPD: `IIPS-W11-DEP1-…-2026-11-13.md` |

The **`*ROADMAP*` token census** (§3.5, §4.2) is the alias-discovery backstop: 17 distinct tokens in IRR and 9 in
IPD, enumerated mechanically from every blob rather than guessed. Every one is accounted for above. **No unexplained
roadmap alias exists in either repository.**

---

## 9. Evidence of any previous roadmap publication

Two distinct patterns of "authoritative roadmap that is not a committed file" were found. Both are reported because
they bound what this investigation's negative result can prove.

### 9.1 Precedent 1 — a dated roadmap cited as authority on IRR `main`, never committed

IRR `main` cites, as the authority source for governance acts, a document that exists in **no** tree of **either**
repository.

> **Quotation convention used below.** Quotations reproduce the source text verbatim with the source's Markdown
> emphasis markers (`**`) elided, because rendering them inside an italic quotation is ambiguous. Every quotation
> carries its exact source line number, so it can be located and byte-compared against the source.

- `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`, **line 3278**:
  *"Scope and authority. Executed under the accepted, corrected IIPS v3.0 E2E Completion Roadmap dated
  `2026-10-17`, act `D1` (merge authorization for IRR PR #117)."*  (source emphasis elided: the source bolds
  `**Scope and authority.**` and `**`D1`**`)
- `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_D12_REBASELINE_ASSESSMENT_2026-10-17.md`, **line 5**:
  *"corrected IIPS v3.0 E2E Completion Roadmap (`2026-10-17`) calls D12, and records"*  (source emphasis elided:
  the source bolds `**D12**`). The same document, **line 10**, records the outcome of that act:
  *"No decision is rendered here. The decision — `D12` — remains NOT GRANTED."*

Verification: **0 paths** in either repository match `COMPLETION[-_]ROADMAP` or `E2E[-_]COMPLETION`, across all refs
and all history. Yet the title appears in **431 IRR blobs**. So this roadmap is cited by title and date, treated as
authority for acts `D1` and `D12`, and is **not committed anywhere in either repository** — it is an operator-side
artefact.

### 9.2 Precedent 2 — a roadmap that lives in a third repository, pinned by blob and sha256

`docs/PRODUCT_RECONCILIATION_AND_FUTURE_ROADMAP.md` is named by IRR `main`'s evidence manifest (§7.3) with
repository, commit, path, blob and sha256 — and resides in `ramkivs/ipo-screening-engine`, not in IRR or IPD. **0
paths** match it in either in-scope repository's history. This shows the programme's evidence practice: an
authoritative document outside the repository is **pinned cryptographically** when relied upon.

### 9.3 Applied to the CPII master roadmap

| Question (work item 2.E) | Answer | Evidence |
|---|---|---|
| 1. Does it exist in one repository and get referenced by the other? | **No.** Neither repository contains it, and neither references it | §3.2, §4.2 — 0 paths, 0 blobs, 0 PR/issue text |
| 2. Does one repository hold an earlier or superseded version? | **No.** No CPII-named document of any version, date or spelling exists in either | §3.5, §4.2 token censuses; pickaxe `-S` 0 commits |
| 3. Does a PR or issue reference a document that was never merged? | **No PR or issue references it at all.** The analogous case that *does* exist is the 11 November IID readiness assessment — merged nowhere, living only on `arena/iid-coverage-readiness-report-2026-11-11`, and referenced by CPII-01 §2.1 | §5.1 (713 PRs, 0 hits), §6.1 (6 issues, 0 hits) |
| 4. Does it exist under another title? | **No title in either repository sequences CPII work items.** The nearest authoritative roadmaps are A1 (W01–W20) and A2 (IID-0…IID-6, closed) — neither mentions CPII | §8.1 |
| 5. Was it discussed but never authoritatively published? | **It was never discussed in any repository record.** There is no issue, PR, comment, review or commit proposing, requesting, announcing or accepting it | §5, §6 |
| 6. Was it published externally? | **Cannot be determined from repository evidence, and is not evidenced.** Wikis are empty, gists are 0, releases carry no planning document, project boards are empty/inaccessible. §9.1 proves operator-side roadmaps are a real pattern in this programme, so external existence is **possible but unevidenced** | §7.2, §6.3, §9.1 |

**No previous publication of a CPII master roadmap is evidenced anywhere.** The only trace of the identifier in
either repository's entire history is the CPII-01 report written by this investigation's predecessor.

---

## 10. Unresolved search limitations

Declared rather than glossed. None of these is large enough to change the classification, but each bounds it.

**L-1 — Server-side objects never transferred to a clone.** `git cat-file --batch-all-objects` scans every object the
**clone** holds, including objects unreachable from any fetched ref. A clone receives objects reachable from the refs
GitHub advertises: all heads, all tags, and all `refs/pull/*`. Objects that survive server-side but are reachable
only from a ref GitHub no longer advertises — for example an orphan left by a force-push on a branch that was then
deleted **with no PR** ever opened from it — would not be transferred and cannot be scanned from outside GitHub.
Mitigation achieved: all 713 PR head refs are present, which is the standard retention path for deleted-branch work.
Residual risk: force-push orphans on never-PR'd branches.

**L-2 — GitHub code search indexes the default branch only.** Used here solely as an independent cross-check
(§7.2), never as primary evidence. The primary evidence is the local object-database scan.

**L-3 — Classic project boards returned HTTP 404** for both repositories while `has_projects` reports `true`, and
ProjectsV2 counts are 0 at repository and owner scope. If classic boards exist but are gated from this token, their
cards were not inspectable. No board content of any kind was reachable.

**L-4 — IPD reports `has_wiki = true` but its wiki repository returns "Repository not found"**, i.e. never
initialised. There is no wiki content to read; this is a definitive empty, not an access failure. IRR reports
`has_wiki = false`.

**L-5 — Search API secondary rate limiting.** The loose-token search pass hit a `403` secondary rate limit part-way
through. Affected queries were re-run after reset as exact-phrase queries and are reported in §5.2. No reported
result depends on a rate-limited call.

**L-6 — Operator-side surfaces are outside repository evidence entirely.** The operator's Windows filesystem, chat
instructions, email and any external storage cannot be searched from here. **The sole known reference to
`IIPS-CPII-MASTER-ROADMAP-2026-11-12` is the CPII-01 work-item instruction, which is not a repository record.**
§9.1 proves that authoritative dated roadmaps in this programme can exist operator-side without ever being
committed, so this investigation **cannot** establish that no such document was ever written — only that no
repository record of one exists.

**L-7 — GitHub-internal records not accessible to this token:** the repository audit log, deleted repositories,
expired Actions artefacts, and any organisation-level planning surface. Not queried, because they are outside the
declared scope and outside this token's reach.

**L-8 — Branch-count drift, noted for accuracy.** CPII-01 §2.2 enumerated 442 unique branch tips; this
investigation counts **443** heads. The repository advanced between the two measurements. This is not a
contradiction; both counts are correct as of their execution.

**Not a limitation — coverage achieved.** Every ref, every reachable commit, every historical tree, every blob in
both object databases, every PR with its comments and reviews, every issue with its comments, every release and
asset, every tag, all discussions (none exist), both wikis (empty), all reachable project boards (none), and all
owner gists (none) were examined. No pagination cap was hit: IRR PR enumeration completed in 12 pages of 50 with
`hasNextPage = false`; IPD in 4 pages.

---

## 11. Reconciliation with CPII-01 §2.2

CPII-01 §2.2 concluded that the roadmap is absent. **That conclusion is CONFIRMED, and its evidence base is
materially strengthened.** Nothing in CPII-01 requires correction on this point.

| CPII-01 §2.2 claim | Status after this investigation |
|---|---|
| "no `CPII`/`MASTER-ROADMAP` path in either tree" (HEAD trees) | **Confirmed and extended**: 0 such paths in **any** tree at **any** commit on **any** of 1,318 refs across both repositories |
| "442 remote branches enumerated … all 440 distinct branch-tip trees read" | **Superseded by stronger coverage**: tips are a subset. This investigation scanned **all 1,924 + 1,101 commits** and **all 7,171 + 4,685 blobs**, including objects unreachable from any ref |
| "`git log --all --name-only` … no such path ever committed" | **Confirmed**, and the earlier caveat that this saw only locally fetched refs is now closed by the mirrors |
| "GitHub code search `CPII` → 13 matches, all `getCPIIndex`" | **Confirmed and quantified precisely**: 1,011 `getCPIIndex` occurrences across 525 IRR blobs in 70 distinct contexts, plus 1 in IPD; every context individually classified (§3.3) |
| "IPD repo CPII 0 / MASTER-ROADMAP 0" | **Confirmed** across all 308 IPD refs and all 10,119 objects |
| Requirement 6 and the roadmap-aligned next step are "blocked-on-absent-roadmap" | **Still blocked.** No CPII-02…CPII-06 definition exists anywhere; none was invented here |

**Three refinements this investigation adds to CPII-01's picture:**

1. **CPII-01's method had a real blind spot that this work item closes.** Its search could not see refs that had not
   been fetched locally. That blind spot is what caused CPII-01 v1 to miss the 11 November assessment (found on an
   unfetched branch and corrected in CPII-01 v2). The same blind spot **could** have hidden a CPII roadmap; the
   mirror-based search proves it did not. The two work items' corrections are therefore consistent: the assessment
   was missed and then found, while the roadmap was correctly reported absent and is now confirmed absent on
   exhaustive evidence.
2. **CPII-01 §2.2 noted the IID implementation roadmap exists and is closed.** This investigation adds its blob pin
   (`a988194d…`) and confirms it contains no CPII token, no `W01`, and no reference to `2026-11-12`.
3. **CPII-01 did not identify IPD's W01–W20 execution roadmap.** This investigation locates it, pins it, and records
   that IRR `main` instructs it be *"read in full before any change"* (§8.1 A1) — a live cross-repository planning
   authority that CPII-01's §12 next-step discussion did not have available.

**No protected artefact was altered** (§12.2).

---

## 12. Definitive classification

### 12.1 Classification

# `NOT FOUND — EXHAUSTIVE SEARCH WITHIN DECLARED SCOPE`

**Exact roadmap found:** NO — `IIPS-CPII-MASTER-ROADMAP-2026-11-12` does not exist in either repository, at any
commit, on any of 1,318 refs, in any of 25,711 objects, or in any PR, issue, release, tag, wiki, board or gist.

**Alternative authoritative roadmap found:** YES, two exist and are pinned — **but neither is the named artefact and
neither is offered as a substitute**:

- **A1** IPD `docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md` — IPD `main`, blob `bbd944c5…`, sha256
  `b3a08f07…`, W01–W20 + GD-1…GD-7, committed `2026-11-10`, cross-referenced from IRR `main`, and the sequence
  actually being executed on `2026-11-12`/`2026-11-13` per the commit census (§3.6, §4.3). **0 CPII content.**
- **A2** IRR `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` — IRR `main`, blob `a988194d…`,
  IID-0…IID-6 + R-1…R-17, implementation-complete and closed. **0 CPII content.**

The classification `FOUND — ALTERNATIVE AUTHORITATIVE ROADMAP` is **deliberately not used**, because it would assert
that an alternative *is* the CPII master roadmap under another title. No evidence supports that: neither artefact
mentions CPII, neither defines CPII-01…CPII-06, and neither is dated `2026-11-12`.

`REFERENCED — DOCUMENT NOT LOCATED` is **also not used**, because it would require a reference in a repository
record. There is none: **0** references across 2.47 million characters of PR text, 6 issues, 2 releases, all commit
messages and all blobs. The single known reference is the operator's work-item instruction, which is external to both
repositories and is recorded as provenance, not as repository evidence (§10 L-6).

`DISCUSSED — NEVER AUTHORITATIVELY PUBLISHED` is **not used**: no repository record discusses it.

`INCONCLUSIVE — SEARCH COVERAGE INCOMPLETE` is **not used**: coverage was completed on every surface reachable by
this token, with no pagination cap hit (§10, "Not a limitation"). The residual limitations L-1, L-3 and L-6 are
narrow, declared, and do not bear on the presence of a committed document.

### 12.2 Confirmation of read-only compliance and preserved evidence

- **No replacement roadmap created. No CPII-02…CPII-06 invented. No CPII identifier allocated.** No IID
  operationalisation stage re-sequenced. The baseline's Stage 1–6 and IPD's W01–W20 are reported **as found**, by
  reference, with no reordering and no substitution.
- **No implementation change, no provisioning, no configuration change, no dependency-pin change.**
- **No merge performed. No new PR created. No PR metadata changed.** PR #562 — base `main`, head
  `arena/94a53bb3-iips-review-recovered` — is **OPEN**, not draft, `mergeable = MERGEABLE`,
  `mergeStateStatus = CLEAN`, titled *"WI-13: head re-validation of Infosys — record L-041 + L-042, correct the
  L-002 notice count"*, with 0 labels, no milestone and no assignees. **All of those fields are unchanged** by this
  record and by the correction in this section. Verified against the GitHub API at
  `https://github.com/ramkivs/iips-review-recovered/pull/562`.

  The accurate statement of what happened to the PR is threefold, and the three must not be conflated:

  1. **No new pull request was created.** Exactly one open PR exists for this branch: #562.
  2. **The existing PR's head branch was advanced** by commits 4 and 5 in the table below — commit 4 carries this
     historical-discovery record, commit 5 carries this §12.2 correction. Advancing the head branch changes the set
     of commits the PR records, and therefore changes the PR's head SHA and commit count.
  3. **The PR's own metadata was not edited** — no title, body, base, head, label, milestone, assignee, draft-state
     or state change was made, and no merge or close was performed.

  The ordered commit list of PR #562, retrieved from
  `GET /repos/ramkivs/iips-review-recovered/pulls/562/commits` and reproduced with full SHAs:

| # | Full commit SHA | Committer date (UTC) | Subject |
|---|---|---|---|
| 1 | `3a818b5d0e1fcea6acc6d908d9256703b51b321d` | 2026-11-12T18:04:55Z | WI-13: re-validate Infosys at head a835d4a; record L-041 + L-042, correct the L-002 notice count |
| 2 | `ec0aa264373f0d4a211f50484206399b54b47834` | 2026-11-12T19:46:59Z | docs(integration): CPII-01 runtime topology and readiness boundary |
| 3 | `431a5f5ad5c0c00bb23675ec47e928d157349fb1` | 2026-11-12T20:00:07Z | docs(integration): CPII-01 v2 - correct the baseline-availability finding |
| 4 | `cd4e3c3fd7a320c1d51189511ae1ca561e587fd5` | 2026-11-13T06:16:06Z | docs(integration): CPII master roadmap — historical and associated evidence discovery — **the commit that published this record** |
| 5 | this correction — see the self-reference note below | 2026-11-13 | docs(integration): correct the stale PR publication metadata in §12.2 |

  **PR state and commit count at verification time.** Before this correction was authored, PR #562 stood at head
  `cd4e3c3fd7a320c1d51189511ae1ca561e587fd5` with **4 commits**, and this record was confirmed present at that head
  (blob `26513bc227c29e783003e0b6d116b394e84ab43c`, 55,327 bytes). Committing this correction makes the count **5**
  and makes commit 5 the PR head.

  > **Self-reference note.** A commit cannot embed its own SHA, so commit 5's SHA is not printed in the table it
  > appears in. It is the branch head at post-push verification; its full SHA, and the re-verified PR head SHA,
  > state and commit count, are recorded in the execution report for this correction and can be reproduced with
  > `gh api repos/ramkivs/iips-review-recovered/pulls/562/commits`.

  **Nature of this correction.** The bullet previously read *"No merge performed. No PR opened or changed. PR #562
  remains OPEN with exactly **3** commits (`3a818b5`, `ec0aa26`, `431a5f5`) — unchanged by this work item."* The
  three-commit count was true of the PR **as it stood while the historical investigation was being authored**, since
  commits 1–3 were the whole PR at that moment; it became stale the instant commit 4 was pushed, because this record
  is itself the fourth commit. The phrase *"No PR opened or changed"* was also imprecise: no PR was **opened**, and no
  PR field was **edited**, but the PR's recorded commits, head SHA and count did change when its head branch was
  advanced. Both defects are corrected here against the verified remote state. **No historical finding, search count,
  classification or governance statement is affected by this correction** — it touches publication metadata only.
- **The 11 November assessment was NOT merged.** It remains only on `arena/iid-coverage-readiness-report-2026-11-11`
  at `31a9b01e`, blob `e6f756238089c6795c8568b37321f3e55ba60cb2`. It was read from fetched objects; the branch was
  never checked out.
- **All four protected documents verified byte-unchanged:**

| Document | Blob at this record's HEAD | Status |
|---|---|---|
| `docs/integration/CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md` | `ccbf90cf17e0…` | unchanged since `431a5f5`; not on `origin/main` (branch-only, as published) |
| `docs/integration/IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09.md` | `eb941cf101…` | identical to `origin/main` |
| `docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-SEPARATION-2026-11-10.md` | `5274eceba6…` | identical to `origin/main` |
| `docs/integration/IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md` | `e6f7562380…` | unchanged on its own unmerged branch; **not merged** |

- **`origin/main` unchanged** at `a835d4af019ab4f677ab238ec42d44326f06a771` in IRR. **No IPD write of any kind**:
  IPD was cloned read-only into `/tmp` and queried through read-only API calls.
- **Working tree clean**; branch still `arena/94a53bb3-iips-review-recovered`. No branch was created, switched,
  renamed or deleted. The branch was pushed twice from this session's documentation work: once carrying commit 4
  (this record) and once carrying commit 5 (this §12.2 correction), both listed in the table above.
- All mirror clones, scratch corpora and downloaded artefacts were written to `/tmp`, outside the repository.

---

## 13. Governance implication — stated, not decided

**This record does not make the governance decision.** It states what the evidence establishes and what the
operator's options are.

**What the evidence establishes:**

1. The **CPII identifier series has no repository existence whatsoever** — no document, no reference, no work-item
   allocation, no PR, no issue, in either repository, at any point in history. CPII-01 is the first and only
   repository artefact to carry the identifier, and it carries it because the operator's instruction supplied it.
2. **Authoritative planning artefacts for this exact subject matter already exist and are current:**
   - **A1**, IPD's W01–W20 execution roadmap, on IPD `main`, which IRR `main` instructs be *"read in full before any
     change"*, which was committed `2026-11-10`, and whose W-series was the work **actually being executed on
     `2026-11-12` and `2026-11-13`** in both repositories (§3.6, §4.3);
   - **A2**, IRR's IID implementation roadmap, closed;
   - the **11 November IID readiness assessment's Stage 1–6**, an operationalisation sequence for exactly Identity
     and Investment Coverage, sitting unmerged on its own branch with its own decision **O10** (*"Acceptance of this
     report's Stage 1–6 as the operationalization track vs treating it as informational only"*) still unanswered.
3. **The programme has an established pattern of authoritative roadmaps that are not committed to these
   repositories** — the "IIPS v3.0 E2E Completion Roadmap dated `2026-10-17`" is cited on IRR `main` as authority for
   acts `D1` and `D12` and exists in no tree (§9.1), and IRR's evidence practice pins out-of-repository documents by
   commit + blob + sha256 (§9.2). So "not in the repository" is a normal state for an authoritative planning artefact
   here, and is **not** by itself evidence that no such artefact was ever written.

**The operator's options, as the evidence frames them — none selected here:**

- **(a)** Author and commit `IIPS-CPII-MASTER-ROADMAP-2026-11-12`, if a CPII series is genuinely intended. Nothing
  found here constrains its content, and no identifier is pre-allocated by this record.
- **(b)** Designate an **existing** artefact as the authoritative sequence for IID Identity/Investment Coverage
  operationalisation — the candidates evidenced above are A1 (W01–W20, live and cross-referenced) and the 11 November
  assessment's Stage 1–6 (subject-matter exact, unmerged, O10 unanswered). Designating either would make a CPII
  roadmap unnecessary, but would require the operator to state the designation, since neither currently claims
  CPII scope.
- **(c)** Record that the CPII identifiers are **session-local only** and were never an authorised repository
  work-item series, and rename or retire them accordingly.
- **(d)** If a CPII roadmap exists operator-side (the §9.1 pattern), **pin it** the way the programme already pins
  external documents — repository, commit, path, blob, sha256 — so that future investigations can verify it instead
  of re-searching for it.

**Two consequences the operator may wish to weigh, stated without recommendation:**

- Whichever option is chosen, **CPII-01's requirement 6 and its roadmap-aligned next step remain blocked until it is
  chosen.** This investigation cannot unblock them, because unblocking them would require inventing the sequence,
  which is excluded.
- A primary baseline that lives only on an unmerged branch (the 11 November assessment) is invisible to every
  default-branch search. That is precisely how CPII-01 v1 came to report it absent. Option (b) or a merge decision
  would both address that exposure; **merging it is the operator's act and was not performed here.**

---

## 14. Reproduction

All commands are read-only. Mirrors are written to `/tmp`, outside the repository.

```
# 1. mirror both repositories (includes refs/pull/*, so deleted-branch PR commits are covered)
git clone --mirror https://github.com/ramkivs/iips-review-recovered.git      /tmp/irr-mirror.git
git clone --mirror https://github.com/ramkivs/iips-production-market-data.git /tmp/ipd-mirror.git

# 2. ref, commit and object census
for G in /tmp/irr-mirror.git /tmp/ipd-mirror.git; do
  git --git-dir=$G for-each-ref refs/heads refs/tags refs/pull | wc -l
  git --git-dir=$G rev-list --all --count
  git --git-dir=$G cat-file --batch-all-objects --batch-check | wc -l
done

# 3. every path ever committed on any ref
git --git-dir=/tmp/irr-mirror.git rev-list --objects --all | grep -iE 'cpii|master[-_]roadmap|portfolio[-_]investment[-_]intelligence'

# 4. every blob's content, reachable or not  (script: seven regexes, prints matching object SHAs)
#    git cat-file --batch-all-objects --batch   → stream, match, record SHA
# 4b. classify every CPII context: extract 12-char windows around each match and tally distinct contexts

# 5. pickaxe and commit-message search
git --git-dir=/tmp/irr-mirror.git log --all -S'IIPS-CPII-MASTER-ROADMAP-2026-11-12' --oneline
git --git-dir=/tmp/irr-mirror.git log --all --grep='MASTER-ROADMAP' -i --oneline
git --git-dir=/tmp/irr-mirror.git log --all --diff-filter=DR --name-status | grep -i roadmap

# 6. the whole social layer (GraphQL, 50 PRs per page, paginate to hasNextPage=false)
#    repository{pullRequests{nodes{number title body state isDraft mergedAt headRefName
#                                  comments(first:60){nodes{body}} reviews(first:25){nodes{body}}}}}
gh api "repos/ramkivs/iips-review-recovered/pulls/comments?per_page=100" --paginate
gh api "search/issues?q=repo:ramkivs/iips-review-recovered+type:issue&per_page=20"
gh api "repos/ramkivs/iips-review-recovered/releases?per_page=100"

# 7. exact-phrase search (quote the phrase; unquoted hyphens split into tokens and produce false positives)
gh api "search/issues?q=repo:ramkivs/iips-review-recovered+%22MASTER-ROADMAP%22+type:pr&per_page=50"

# 8. associated repositories
gh api "users/ramkivs/repos?per_page=100&type=all" --jq '.[] | "\(.name) \(.pushed_at)"'
gh api "repos/ramkivs/<repo>/git/trees/HEAD?recursive=1" --jq '[.tree[].path|select(test("CPII|MASTER.?ROADMAP";"i"))]|length'
```
