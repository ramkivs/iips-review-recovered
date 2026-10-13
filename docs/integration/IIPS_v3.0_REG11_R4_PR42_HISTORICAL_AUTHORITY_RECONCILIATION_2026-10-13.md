# IIPS v3.0 — REG-11 R4 (`P1`): PR #42 Historical-Authority Reconciliation Record (`2026-10-13`)

> **Record ID:** `REG11-R4-PR42-HISTORICAL-AUTHORITY-RECONCILIATION-2026-10-13-01`
> **Record type:** Evidence / investigation record — documentation only; **non-executable**. This
> record grants, creates, ratifies, revokes, and retroactively authorizes **nothing**. It resolves
> the R4 **evidence question** and identifies the Program Authority (PA) decision that R4 still
> requires.
> **Date:** 2026-10-13 (UTC)
> **Authority context:** Investigation performed within the existing documentation-publication
> authority only. The deciding authority for R4 remains Ramki (Program Authority).
> **Recording agent:** Arena Agent Mode — investigation, verification and transcription only; no
> authority is rendered by the agent.
> **Authoritative repository:** `ramkivs/iips-review-recovered` (IRR)
> **Authoritative ref:** `refs/heads/main`
> **Governing disposition preserved unchanged:** REG-11 / Gate B / R1–R2 `OPTION C — RETAIN
> DEFERRAL` (`docs/integration/IIPS_v3.0_GATE_B_REPORTS_OPTION_C_DEFERRAL_PA_DECISION_2026-10-13.md`,
> durably published through PR #80, merge `721520cc059cd80ad16bd7fb68da5cd6ecbadd9b`).

---

## 1. Purpose and bounded scope

**Question resolved (R4 / `P1`):** does an existing, operative, appropriately scoped authority act
explicitly authorize (a) the historical change associated with IRR PR #42 — the 2026-10-06 merge of
the Governed Reports promotion candidate into IRR `main` — and (b) the associated
persistence-lineage admission (the physical re-pin of `iips-production-market-data` from
`0dab1221fb0f89e2e0601ea905d642bfe72d5f9c` to `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` with
`./persistence` consumption at the Reports boundary) — or is that authorization not established?

**In scope:** PR #42 event reconstruction from authoritative Git/GitHub evidence; a bounded but
comprehensive authority-act search across both repositories (boundary stated exactly in §4);
candidate-act coverage classification; reconciliation against D-1 and the current Option C
disposition; determination of the R4 outcome class (A/B/C/D).

**Out of scope (expressly):** any R4 disposition itself; any reopening of R1/R2; any R3
determination; any Gate A or Gate C matter; any revert, remediation, ratification, or retrospective
authorization; any code, pin, package, route, UI, runtime-configuration, IPD, or production change;
any live-deployment claim. A merged PR is **not** treated as proof of authorization; approval is
**not** inferred from technical compatibility, subsequent use, a related act, or shared purpose.

---

## 2. Verified baseline and exact ref identities

All refs verified this session (2026-10-13) directly against the remotes (`git ls-remote`, GitHub
API, and full read-only clones). **No ref movement against the last reported values.**

| Ref | Verified identity | Status |
|---|---|---|
| IRR `refs/heads/main` | `721520cc059cd80ad16bd7fb68da5cd6ecbadd9b` (merge of PR #80) | Matches expected baseline |
| IRR Option C decision record | `docs/integration/IIPS_v3.0_GATE_B_REPORTS_OPTION_C_DEFERRAL_PA_DECISION_2026-10-13.md` present at `main` | Present, unchanged |
| IRR canonical tracker | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` present at `main` | Present; updated additively by this publication only |
| IPD `refs/heads/main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | Unchanged |
| IPD `refs/heads/np04-governed-persistence-windows` (artifact/report pin lineage) | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | Unchanged |
| IPD `refs/heads/arena/01a0e6d9-iips-production-market-data` (G24 lineage) | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` | Unchanged |
| IPD `refs/heads/arena/01a0f308-iips-production-market-data` | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` | Unchanged (same tip) |
| IPD `refs/heads/arena/01a0f839-iips-production-market-data` (NP-04 act branch) | `12c480b5bf5cfbe0f296fcd12c9189328b915417` | Unchanged |

Prior work **reused, not re-derived:** the Gate B owner-binding investigation
(`IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_INVESTIGATION_2026-10-13.md`), the Gate B decision-input
record (§9 of the tracker), the R1/R2 PA decision request (§10), AD-20
(`IIPS_v3.0_AD20_PERSISTENCE_LINEAGE_IDENTITY_CONTRACT_DECISION_2026-10-13.md`), and the G2-2 R2
convergence record. No unrelated persistence implementation analysis was redone.

---

## 3. PR #42 event reconstruction (re-verified from authoritative evidence this session)

### 3.1 PR metadata (GitHub API, `gh pr view 42` / REST, 2026-10-13)

| Item | Verified value |
|---|---|
| Title | `Promotion candidate: Governed Reports onto current main (DO NOT MERGE without promotion act)` |
| Body | `Technical promotion candidate per the promotion-scope decision. Reconciled shared transports; isolated persistence pin. NOT authorized for merge — separate promotion act required.` |
| State | `MERGED` |
| Created | `2026-10-06T21:03:29Z` (author `ramkivs`) |
| Merged | `2026-10-06T21:09:33Z` — **6 minutes after creation**, merged by `ramkivs` (the PR author) |
| Base | `main` @ `0b961fecbe29ed643c86c1a223fc22ac6d30a115` (first parent of the merge) |
| Head | `promotion/governed-reports-candidate` @ `4906a6b71f5133d714f0f4c29c89dba22ded37f5` (single commit, authored `2026-10-06T20:58:41Z`) |
| Merge commit | `47edf6f3db79c6c443caed148121406f33a158b7` (parents `0b961fec…`, `4906a6b7…`; GitHub web merge, GPG-signed by GitHub) |
| Reviews | **0** (empty review list; empty review decision) |
| Comments | **0** |
| Linked records | Timeline carries **only post-hoc** cross-references: PR #51 (2026-10-09), documentation commits `280afd19…`, `810bb8a2…`, `6e99491b…`, `eb05e25f…` (2026-10-09/10), PRs #78/#79/#80 (2026-10-13). **No contemporaneous review, approval, or authority artifact exists on the PR.** |

The previously reported title/body warning and the zero-review/zero-comment state are hereby
**re-verified from the authoritative API**, not carried forward on trust.

### 3.2 Changed files and destination

23 paths, `+5,982/−22`, merged into IRR `refs/heads/main`. `47edf6f3…` is confirmed an ancestor of
current `main` `721520cc…` (GitHub compare: `ahead_by: 119, behind_by: 0`). **No revert,
cherry-pick, or repromotion of the merge or head commit exists on any searched IRR ref.**

- 13 Reports backend/domain/test paths (new): `frontend/server/reports/{artifact,canonical,composition,index,np04-adapter,persistence-port,persistence}.ts`, `frontend/server/reports/{reports-artifact,reports-canonical,reports-persistence}.test.ts`, `frontend/server/reports-transport.ts`, `frontend/server/reports-api.test.ts`, `frontend/server/reports-transport.test.ts`
- 10 shared/package/auth/tenant/PIT paths (modified or new): `frontend/package.json`, `frontend/package-lock.json`, `frontend/server/secured-executor.ts` (+181), `frontend/server/tenant-membership-store.ts` (new), `frontend/server/tenant-directory.test.ts` (new), `frontend/server/admin-transport.ts`, `frontend/server/admin-transport.test.ts`, `frontend/server/admin-live-composition.test.ts` (new), `frontend/server/executive-transport.ts`, `frontend/server/pit/ipdPitReadAdapter.ts` (`+6/−4`, comment-block text describing the re-pin — the previously recorded `K2` unreviewed diff)

### 3.3 The persistence-lineage admission performed by the merge

`frontend/package.json` dependency changed from
`github:ramkivs/iips-production-market-data#0dab1221fb0f89e2e0601ea905d642bfe72d5f9c` to
`github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (verified by
`git diff 47edf6f3^1 47edf6f3 -- frontend/package.json`). That pin is still the physical pin at
current `main` (`frontend/package.json:15`). The new Reports adapter
(`frontend/server/reports/np04-adapter.ts`) consumes the pin's published `./persistence` subpath
through `persistence-port.ts`. This is the "relevant persistence-lineage admission" examined here:
it is **physical presence created by this merge**, and (per the standing register) presence is not
authority.

### 3.4 Governance state operative at the moment of the merge (all ancestors of `47edf6f3…`)

Exact IRR `main` sequence on 2026-10-06 (UTC), re-derived from full history this session:

| UTC time | Event | Commit |
|---|---|---|
| 19:57:09 | **D-1** published to `main` (PR #38) — `docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md` | `561cc85…` |
| 20:11:59 | **D-2** published to `main` (PR #39) — `docs/integration/IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md` | `f89f190…` |
| 20:31:38 | **D-3** published to `main` (PR #40) — `docs/integration/GOVERNED-REPORTS-ACCEPTANCE-DECISION.md` | `e13e543…` |
| 20:49:21 | **Promotion-Scope Decision** published to `main` (PR #41) — `docs/integration/GOVERNED-REPORTS-PROMOTION-SCOPE-DECISION.md` (record commit `f4dab7d…`, 20:49:07Z) | `0b961fec…` |
| 20:58:41 | PR #42 head commit authored | `4906a6b7…` |
| 21:03:29 | PR #42 opened | — |
| 21:09:33 | **PR #42 merged to `main`** | `47edf6f3…` |

The merge's **own first parent** (`0b961fec…`) is the publication of the Promotion-Scope Decision.
Twenty minutes separated the operative "Main admission: NOT GRANTED … separate promotion execution
act required … Any violation fails closed: NO promotion" from the merge that performed the
admission.

### 3.5 Merge mechanics vs governance authorization (distinction preserved)

The GitHub merge was mechanically valid (permitted actor, signed web merge, clean merge). That
establishes **nothing** about governance authorization. Under the program's own operative records
(§3.4, §5), merge/promotion of this candidate required a separate promotion execution act. The
remainder of this record asks only whether such an act (or any other covering act) exists.

---

## 4. Authority inventory and search boundary

### 4.1 Search universe actually covered

**IPD (`ramkivs/iips-production-market-data`)** — full fresh clone, read-only, 2026-10-13:

- **Refs:** all 34 remote branches, all 6 `refs/pull/*/head` refs, all 4 tags
  (`p14-r7-65b78f7`, `portfolio-option-a-cb969b6`, `post-cleanup-baseline-b46b4f4`,
  `temporary-cleanup-caf73ba`) = **35 distinct commit tips**, plus the full reachable history of
  every tip (`git log --all`; 162 commits touching `evidence/`).
- **Tree search:** every blob of every distinct tip grepped for the decisive tokens
  `47edf6f` (merge SHA), `4906a6b` (head SHA), `pull/42`, `PR #42`, `governed-reports-candidate`,
  and `review-recovered` (IRR repository name).
- **Commit-message search:** `git log --all --grep` for the same tokens.
- **Act corpus:** the complete `evidence/np04/` directory across all refs — exactly **5 acts**, all
  on `arena/01a0f839…` (commits `f4ceecb1…` 16:32Z, `3a89c70e…` 16:48Z, `26061859…` 16:56Z,
  `61e8e593…` 17:10Z, `12c480b5…` 17:16Z — **all 2026-10-01**). Each read at its commit.
- **Temporal bound (decisive):** the most recent commit reachable from **any** IPD ref anywhere is
  `2e11fa3b…` (2026-10-02). **No IPD commit exists on or after 2026-10-06**, therefore no IPD act
  contemporaneous with, or subsequent to, the PR #42 merge exists to authorize, ratify, supersede,
  or revoke anything about it.

**IRR (`ramkivs/iips-review-recovered`)** — full fresh clone plus all PR head refs, read-only,
2026-10-13:

- **Refs:** all remote branches + all **80** `refs/pull/*/head` refs + tags = **107 distinct commit
  tips**, plus full reachable history (`git log --all`).
- **Tree search:** every blob of every distinct tip grepped for `47edf6f3db79c6c443caed148121406f33a158b7`;
  file-name inventory of every file that ever existed on any ref, matched against
  promotion-execution / ratification naming patterns.
- **Record search:** `git grep -i "promotion execution act" main` — the only hit is the
  Promotion-Scope Decision itself (the record that **requires** such an act).
- **PR #42 artifacts:** PR metadata, file manifest, commit list, reviews, comments, and full
  timeline via the GitHub API.
- **Reused:** the prior exhaustive readings of D-1/D-2/D-3, AD-20, G2-2 R2, the Gate B records, and
  act `26061859…` (§2), re-verified at the points material to R4.

### 4.2 Search results (facts)

1. **Zero** occurrences of the PR #42 merge SHA, head SHA, head branch name, or PR URL fragment in
   any blob reachable from any IPD ref, and zero in any IPD commit message.
2. The `review-recovered` hits in IPD are September-2026 program-history documents (CHECKPOINT-0x,
   D44/D45/D48/D50/D51, P00 charter/logs, IES certificates, P01/IU acceptance acts) that reference
   the IRR repository generally; all predate PR #42's existence and none addresses a Reports merge
   or any IRR PR.
3. In IRR, every file on any ref that mentions `47edf6f3…` is a **post-merge investigation or
   governance-preservation record** (D1-journal extension, G2-2 R2 record and its evidence annexes,
   the 2026-10-08 lineage investigation raw data, and the four Gate B records). None is an
   authorization; several expressly **prohibit** characterizing later acts as retrospective
   authorization (G2-2 R2 record, lines 275, 282, 370, 373, 405).
4. **No promotion-execution act artifact has ever existed on any searched ref of either
   repository** (file-name inventory over all refs and full history).

### 4.3 Search boundary and limitations (stated exactly)

- Searched: the two Git repositories' complete remote ref sets (including PR head refs and tags),
  full reachable commit histories, all reachable blobs at every distinct tip for the decisive
  tokens, all commit messages, the complete NP-04 act corpus, the named IRR decision records, and
  the GitHub PR #42 metadata/timeline.
- **Not searched / not searchable from this session:** unreferenced (dangling) objects not reachable
  from any remote ref; GitHub objects outside PR #42's own metadata (e.g. issues or discussions not
  cross-referenced on PR #42's timeline); and the separate evidence domains — Arena session
  archives, Windows/PowerShell hosts, and the Library. IRR, IPD, Arena, Windows/PowerShell, and
  Library are separate evidence domains; no access across them is assumed.
- Consequently this record claims **"NOT LOCATED within the stated boundary,"** not metaphysical
  proof of nonexistence. Note, however, that under the program's own durability rule (act
  `26061859…` §8: "A record that is only local is not durable"), an act not durably published to an
  authoritative remote ref could not be operative in any case.

---

## 5. Candidate-act coverage matrix

Classifications: `EXPLICITLY COVERS` / `EXPLICITLY EXCLUDES` / `DOES NOT ADDRESS` / `CONFLICTING` /
`NOT LOCATED` / `NOT VERIFIABLE`. No act is classified as covering PR #42 merely because it shares
a repository, package, persistence domain, or program.

| # | Candidate act / record | Identity (exact) | Issuer / status / date | Operation it authorizes | Coverage of PR #42 merge + admission | Classification |
|---|---|---|---|---|---|---|
| 1 | IPD `NP04-PROMOTION-AUTH-TARGET-DESIGNATION-AND-AUTHORITY-ACT.md` | commit `2606185923f6cbd3f4df5c3af200f54d40ed4bbc`, blob `832003c6e31999d05df44951038b97862fae9961`, branch `arena/01a0f839…` | RAMKI (PA), recorded 2026-10-01; operative at merge time | Fast-forward of exactly `0dab1221→8c996272→d4fdb33d→6828155e` into IPD `arena/01a0e6d9…`, under a separate execution gate | Grant universe is IPD refs only; §4 expressly withholds `main`, baseline promotion, and "Watchlists, **Reports**, Collaboration, Settings, Governed Screener persistence"; no IRR ref, PR, or commit appears anywhere in it. Satisfied at its own scope (`arena/01a0e6d9` = `6828155e`). | **DOES NOT ADDRESS** the IRR PR #42 operation; **EXPLICITLY EXCLUDES** Reports persistence from its own grant. (Prior `Q2` finding confirmed; also note the preserved nomenclature conflict: it labels `6828155…` "NP04 Phase-A" while D-1/AD-20 classify that ref as the G24 portfolio lineage — recorded, unchanged, no relabeling inferred.) |
| 2 | IPD `NP04-G29-FRESH-AUTHORITY-PHASE-A-ADOPTION-ACT.md` | commit `f4ceecb192f1d2e4ec7f67b6ac6615e71871eac8`, blob `111a380a…` | RAMKI (PA), 2026-10-01; operative | Phase-A adoption authority (IPD) | "GATE-P P-C — Reports: **NOT AUTHORIZED**" (line 201); "does **not** authorize … Reports persistence" (line 297) | **DOES NOT ADDRESS** PR #42; **EXPLICITLY EXCLUDES** Reports from grant |
| 3 | IPD `NP04-G31-PHASE-A-ACCEPTANCE-ACT.md` | commit `3a89c70e77a6172ee4f75aa9c5d2dc441f4543d0`, blob `614994da…` | RAMKI (PA), 2026-10-01; operative | Phase-A acceptance (IPD artifact) | "Explicitly excluded … Reports" (line 151) | **DOES NOT ADDRESS**; **EXPLICITLY EXCLUDES** |
| 4 | IPD `NP04-POST-PROMOTION-ACCEPTANCE-AUTHORITY-DESIGNATION-ACT.md` | commit `61e8e593316a8b58cb3b4ffff5c3261798ac776c` | RAMKI (PA), 2026-10-01; operative | A3 acceptance-authority designation (IPD) | Excludes "any **product surface** (Watchlists, Reports, …)" (line 145) | **DOES NOT ADDRESS**; **EXPLICITLY EXCLUDES** |
| 5 | IPD `NP04-POST-PROMOTION-ACCEPTANCE-ACT.md` | commit `12c480b5bf5cfbe0f296fcd12c9189328b915417` | RAMKI (PA), 2026-10-01; operative | Post-promotion acceptance bound to `6828155…` only | "does **not** accept, authorize, or adjudicate: Watchlists; Reports; …" (lines 246–248) | **DOES NOT ADDRESS**; **EXPLICITLY EXCLUDES** |
| 6 | IRR **D-1** `PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md` (Option C) | published `main` merge `561cc85…` (2026-10-06T19:57:09Z); **ancestor of `47edf6f3…`**; operative at merge time | Ramki (PA), 2026-10-06; operative, unsuperseded | Domain-ownership standing only (portfolio ↔ `6828155e…`; artifact/report ↔ `2e11fa3b…`) | §3: artifact lineage has "no Reports consumer contract; no qualification, acceptance, or promotion act; no main admission" (line 75). §11: "No promotion authority granted" (line 145). §12: "No mainline admission created" (line 149). §15: does NOT authorize "… package changes; dependency changes; … promotion; main capability admission; merge of implementation branches …" (lines 166–169). PR #42 performed a main merge of an implementation branch, a dependency/package change (the re-pin), and a de-facto main admission of Reports paths. | **EXPLICITLY EXCLUDES** the operations performed; **CONFLICTING** with the historical merge |
| 7 | IRR **D-2** `IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md` (Option B) | published `main` merge `f89f190…` (20:11:59Z); ancestor; operative | Ramki (PA), 2026-10-06 | Domain-scoped identity/tenant authority decision | No merge/promotion/admission provision engaged by PR #42 | **DOES NOT ADDRESS** |
| 8 | IRR **D-3** `GOVERNED-REPORTS-ACCEPTANCE-DECISION.md` | published `main` merge `e13e543…` (20:31:38Z); ancestor; operative | Ramki (PA), 2026-10-06 | Reports ACCEPTED at qualified **branch** scope only | §11 (lines 107–111): "Promotion authority: NOT GRANTED. **Promotion executed: NO.** Main admission: NOT GRANTED. … Any future promotion requires a separate governance act and separate authorization." | **EXPLICITLY EXCLUDES**; **CONFLICTING** (its §11 "Promotion executed: NO" is unreconciled with the merge — preserved `H-11`) |
| 9 | IRR `GOVERNED-REPORTS-PROMOTION-SCOPE-DECISION.md` | record commit `f4dab7d…` (20:49:07Z), published `main` merge `0b961fec…` (20:49:21Z) — **the merge's own first parent**; operative at merge time | Ramki (PA), 2026-10-06 | Future-promotion **bar** only; names IRR `main` as sole eligible future target | §2: "Promotion status: NOT EXECUTED. Main admission: NOT GRANTED. Implementation authority: NOT GRANTED." Fail-closed clause (lines 124–126): violation conditions include "the separate promotion execution act does not exist. Any violation fails closed: NO promotion." **No promotion execution act exists (§4.2(4)).** PR #42's body cites this very decision while performing the merge it withholds. | **EXPLICITLY EXCLUDES**; **CONFLICTING** (operative fail-closed bar violated by the merge 20 minutes later) |
| 10 | PR #42's own contemporaneous description | PR #42 title/body (GitHub API, re-verified) | Author's own record, 2026-10-06T21:03:29Z | Nothing — it is a self-declaration | "DO NOT MERGE without promotion act" / "NOT authorized for merge — separate promotion act required" | **CONFLICTING** with the merge event itself (contemporaneous evidence that authorization was known to be required and known to be absent) |
| 11 | G2-2 candidate **AD-01** (`IIPS_v3.0_G2_2_EXISTING_CAPABILITY_CONVERGENCE_DECISION_RECORD.md`) | PR #51 merge `eb05e25f…` (merged as draft), PR #53 `3064a90f…` (post-merge C01 fail) | Candidate; **operative effect NOT ESTABLISHED** (2026-10-09/10 — post-dates the merge) | Even as drafted: ratified-set recognition of the 13 Reports paths | Post-dated; operative effect not established; its own text forbids "any characterization of AD-01 as retrospective authorization for the PR #42 merge" (lines 282, 373, 405) and excludes the `ipdPitReadAdapter.ts` path from the ratified set (`K2`) | **DOES NOT ADDRESS** (no operative coverage; retrospective reading expressly prohibited by its own text) |
| 12 | **AD-02** (REG-02 narrow non-production admission) | `IIPS_v3.0_G1_B2_PIT_D114_CAPABILITY_ADMISSION_DECISION.md` (blob `2803c1c2…`), reconciled 2026-10-13 | PA; operative (as reconciled) | Non-production consumption of `./pit` and `./d114-non-production` at pin `2e11fa3b…` for 5 named files | Expressly excludes the PR #42 `+6/−4` diff (`K2`), `./persistence`, the P4 route, and production; admits pin consumption, not a merge, and "does not ratify PR #42's change" | **EXPLICITLY EXCLUDES** the relevant admission from its scope |
| 13 | **AD-20** bounded disposition; REG-02/03/05/06/09 reconciliation; Gate B records; **Option C** disposition | Tracker §6–§11 and their records (2026-10-13) | PA; operative | Various bounded dispositions | Each expressly **preserves** `P1`/R4 as open and creates no retrospective authorization (AD-20 row 9: coverage "UNPROVEN (NOT ESTABLISHED)"; Option C §11.4: R4 "OPEN — CONFLICTING / UNRESOLVED") | **DOES NOT ADDRESS** (each expressly declines to) |
| 14 | Any other covering act, in either repository | — | — | — | Decisive-token search over the complete ref/history universe in §4.1 returned zero authorization artifacts; no promotion-execution act has ever existed on any searched ref | **NOT LOCATED** (within the §4.3 boundary) |

**No candidate act classifies as `EXPLICITLY COVERS`.**

---

## 6. D-1 reconciliation (operative provisions vs the historical state)

Using D-1 as published at IRR `main` (`docs/integration/PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`,
operative, an ancestor of the merge, unsuperseded at `721520cc…`):

| D-1 provision | Operative content | Historical state created by PR #42 | Reconciliation |
|---|---|---|---|
| §2–§3 lineage identity/ownership | Portfolio domain ↔ G24 `6828155e…` (IPD-main admission prohibited by the recorded promotion-authority act); artifact/report domain ↔ pin `2e11fa3b…`, **branch-scoped**, "no Reports consumer contract; no … promotion act; no main admission" (line 75) | The artifact/report pin physically admitted to IRR `main` and consumed by a Reports adapter | Technical persistence-domain **fit** is consistent with D-1 (proven previously); the **admission** itself is exactly what §3 records as not existing |
| §6 separation ladder | `ACCEPTANCE ≠ PROMOTION ≠ MAIN ADMISSION ≠ CONVERGENCE`; `DOMAIN OWNERSHIP ≠ IMPLEMENTATION AUTHORITY` (lines 108–113) | The merge collapsed acceptance (D-3) directly into main admission in one unauthorized step | Direct conflict with the ladder |
| §11 promotion status | "No promotion authority granted. Neither persistence lineage is promoted by this decision, to any ref." (line 145) | A promotion-shaped merge to `main` | Conflict |
| §12 main status | "No mainline admission created by this decision." (line 149) | Mainline admission created mechanically | Conflict |
| §15 explicit exclusions | No authorization of "package changes; dependency changes; … promotion; main capability admission; merge of implementation branches" (lines 166–169) | Package/dependency change (re-pin), merge of an implementation branch, main capability admission | Conflict on all three |
| Technical presence vs authority | D-1 confers standing only | The 23 paths and the pin are present at `main` | Presence ≠ authority — preserved; nothing in this record converts presence into authority |
| Relationship to current IRR consumer use | D-1 proves persistence-domain fit only; Reports consumer admission is R3 (separate, open) | Current `main` still carries the pin (`frontend/package.json:15`) and the fail-closed Reports sources | Unchanged; R3 remains a separate open gate |

**Option C boundaries preserved (verified, unchanged):** Reports ownership binding remains deferred
(R1/R2 — not reopened here); R3 remains open and separate; Gate A and Gate C remain separate;
Reports and User Portfolios remain **fail-closed at source level** (recorded baseline `503
owner-context-unavailable`; no live-deployment claim); no implementation or product activation is
authorized by anything in this record. Resolving the R4 **evidence question** does **not** resolve
Reports owner binding (R1/R2) or consumer admission (R3), and this record does not imply otherwise.

---

## 7. Historical authorization vs technical merge (determination)

- **Technical merge:** PROVEN — PR #42 merged cleanly at `47edf6f3…`, is an ancestor of current
  `main`, and was never reverted.
- **Governance authorization:** **ESTABLISHED AS ABSENT AND AS EXPRESSLY CONFLICTED.** At the moment
  of the merge, three operative PA records — D-1 (§11/§12/§15), D-3 (§11), and the Promotion-Scope
  Decision (§2 + fail-closed clause) — all ancestors of the merge commit itself, withheld exactly
  the operations the merge performed, and the PR's own contemporaneous description declared the
  merge unauthorized pending a separate promotion act. The required promotion execution act has
  never existed on any searched ref of either repository, and no later operative act ratifies the
  merge (the only candidate, AD-01, is non-operative and self-prohibits that reading).

This is therefore **more than** "authority not established": the authoritative records do not
merely fail to cover the operation — the operative records in force at merge time **explicitly
withheld it**, and the program's own fail-closed promotion bar was violated by the event. No
assertion about any individual's intent or conduct is made; this is a records-level conflict
finding only, and a missing record is not converted into an accusation.

---

## 8. Evidence classification for each material claim

| # | Claim | Classification | Evidence |
|---|---|---|---|
| 1 | IRR `main` = `721520cc…`; Option C record and canonical tracker present | **PROVEN** | `git ls-remote`, tree read (§2) |
| 2 | IPD refs match all last-reported values; no movement | **PROVEN** | `git ls-remote` (§2) |
| 3 | PR #42 metadata as stated (title/body condition; 0 reviews; 0 comments; self-merge at `2026-10-06T21:09:33Z`; head `4906a6b7…`; merge `47edf6f3…`; 23 paths, +5,982/−22) | **PROVEN** | GitHub API + full-clone Git evidence (§3.1–§3.2) |
| 4 | `47edf6f3…` is an ancestor of `main@721520cc…`; never reverted | **PROVEN** | GitHub compare `ahead_by:119, behind_by:0`; revert search (§3.2, §4.2) |
| 5 | The merge performed the `0dab1221→2e11fa3b` re-pin; that pin persists at `main` | **PROVEN** | `git diff 47edf6f3^1 47edf6f3 -- frontend/package.json`; `main:frontend/package.json:15` (§3.3) |
| 6 | D-1, D-2, D-3 and the Promotion-Scope Decision were on `main` (ancestors) before the merge, in the stated order | **PROVEN** | Full-history commit timestamps and parentage (§3.4) |
| 7 | The operative records withheld promotion/main admission/package change, and required a separate promotion execution act | **PROVEN** (verbatim reads) | D-1 lines 75, 145, 149, 166–169; D-3 lines 107–111; Promotion-Scope Decision §2, lines 124–126 (§5 rows 6, 8, 9) |
| 8 | Act `26061859…` covers only the IPD G24 Phase-A fast-forward into `arena/01a0e6d9…` and expressly withholds `main` and Reports; it contains no IRR authorization | **PROVEN** (full re-read at its commit) | §5 row 1; act §§3–6 verbatim |
| 9 | No IPD commit exists on or after 2026-10-06 anywhere in the repository | **PROVEN** | `git log --all --since` over the complete clone (§4.1) |
| 10 | No act in either repository references PR #42's merge SHA, head SHA, branch, or URL as an authorized operation | **PROVEN within the §4.3 boundary** | Decisive-token search over 35 IPD + 107 IRR distinct tips and full histories (§4.1–§4.2) |
| 11 | No promotion-execution act artifact ever existed on any searched ref | **PROVEN within the §4.3 boundary** | All-refs full-history file-name inventory (§4.2(4)) |
| 12 | Coverage by an act outside the searched boundary (dangling objects, non-cross-referenced GitHub objects, Arena/Windows/Library domains) | **NOT VERIFIABLE** from this session | §4.3 |
| 13 | AD-01 operative effect | **NOT ESTABLISHED** (unchanged, preserved) | REG-11 register; §5 row 11 |
| 14 | IU-6 repin rationale recorded in any act | **UNPROVEN** (unchanged, preserved — none invented) | AD-20 (§5 row 13) |

---

## 9. Final outcome

### **Outcome B — Existing authority conflict established.**

Authoritative, operative, appropriately scoped records — D-1 §11/§12/§15, D-3 §11, and the
Promotion-Scope Decision (all Program Authority records, all published to IRR `main` **before** the
merge and ancestors of the merge commit) — **explicitly conflict** with the historical PR #42 merge
and the persistence-lineage admission it performed. The merge also violated the Promotion-Scope
Decision's express fail-closed condition (no promotion execution act exists). The PR's own
contemporaneous title/body corroborates that authorization was known to be required and absent. No
operative act explicitly covers the merge or the admission (`EXPLICITLY COVERS`: none; §5), and no
later operative act ratifies it.

Scope of the conflict (exact): the 2026-10-06T21:09:33Z merge of
`promotion/governed-reports-candidate@4906a6b7…` into IRR `refs/heads/main` at `47edf6f3…`,
comprising the 23 listed paths, including the 13 Reports paths' main admission, the
`frontend/package.json`/lockfile re-pin `0dab1221…→2e11fa3b…`, the shared-transport/security edits
(`secured-executor.ts` +181 and related), and the unreviewed `ipdPitReadAdapter.ts` `+6/−4` change
(`K2`).

Outcome A is excluded because no covering act exists. Outcome C is excluded because the evidence
establishes more than non-coverage: express, operative, pre-merge withholding. Outcome D is
excluded because no access limitation prevented a defensible conclusion at the stated boundary.

**No retroactive authorization is created, implied, or recommended by this outcome.**

---

## 10. Whether a PA decision is required

**YES.** The conflict is established as a records-level fact, but the **governance of the current
state** is undecided: the 23 paths and the pin are physically on `main` today, fenced fail-closed,
while the operative records say the operation that put them there was withheld. Only the Program
Authority can decide how the historical state is to be treated **going forward**. The evidence
cannot close R4 on its own; R4 therefore remains **OPEN** — with its evidence question **RESOLVED
(Outcome B)** — until the PA renders the disposition below.

---

## 11. Exact decision input required (the R4 PA disposition)

One explicit PA decision, rendered on its actual date and durably published, choosing exactly one
of the following forward-looking treatments of the PR #42 historical state (none is recommended
here; no option is pre-selected):

- **R4-A — Prospective regularization (not retroactive):** a new, explicit promotion/admission act
  that accepts the **current** `main` state at a named commit, at stated scope (which of the 23
  paths; whether the re-pin edge is included — noting R3 remains a separate gate for `./persistence`
  consumer admission), with the express statement that it operates prospectively and does not
  declare the 2026-10-06 merge to have been authorized.
- **R4-B — Remediation:** a PA-directed remediation plan (revert/extraction/re-candidacy through
  the Promotion-Scope Decision's own bar), with scope, sequencing, and its own gates.
- **R4-C — Recorded standing without regularization:** an explicit PA act recording that the
  historical state remains present-without-authority, fail-closed and non-buildable-upon
  (no implementation, no consumer admission, no activation may rely on it), until a future R4-A or
  R4-B act.

Whatever option is selected, the disposition must: state the exact commit/paths it governs; state
its relationship to D-1/D-3/the Promotion-Scope Decision (supersession or coexistence, explicitly);
leave R1/R2 (Option C) and R3 untouched unless it separately and explicitly addresses them; and
preserve the fail-closed source-level baseline unless a separate implementation gate changes it.

---

## 12. Non-authorization and implementation boundaries

This record does **not**: authorize, ratify, revert, or remediate the PR #42 merge; create,
extend, or imply any promotion, admission, consumer, identity, or security authority; reopen or
modify R1/R2 (Option C stands unchanged); advance or prejudge R3; touch Gate A or Gate C; authorize
any implementation, package, pin, route, UI, runtime-configuration, or production change; modify
any IPD code, test, record, pin, or branch; modify the Option C decision record or any historical
record; or assert anything about live deployment or runtime behaviour. Reports and User Portfolios
remain fail-closed at source level (recorded baseline: HTTP `503 owner-context-unavailable`).

---

## 13. Verification performed, reused, and not performed

| Category | Items |
|---|---|
| **Performed this session** | IRR/IPD remote ref verification (`git ls-remote`, full clones); PR #42 metadata/files/commits/reviews/comments/timeline via GitHub API; ancestry via GitHub compare; full-history reconstruction of the 2026-10-06 `main` sequence; full re-read of act `26061859…` and the other four NP-04 acts at their commits; decisive-token search over all 35 IPD and 107 IRR distinct ref tips and full histories; commit-message searches; all-refs file-name inventory; verbatim reads of D-1/D-3/Promotion-Scope Decision operative provisions; `frontend/package.json` diff at the merge and at current `main`; documentation-only scope check on the publication diff. |
| **Reused (not re-derived)** | Gate B investigation and decision-input findings (tracker §8–§9); AD-20 lineage/divergence analysis; G2-2 R2 `K2`/`H-11`/`H-16` findings; REG-02/REG-03 reconciliation; the F-3/F-7 and ownership-source findings underlying Option C. |
| **Not performed** | No application tests (documentation-only change); no live HTTP/runtime/database/deployment/environment checks (none claimed); no Windows/PowerShell, Arena-archive, or Library domain access; no IPD write of any kind; no search of dangling/unreferenced Git objects or non-cross-referenced GitHub objects (recorded limitation, §4.3). |
| **Mutation proof** | IPD: cloned read-only to a non-persistent location; zero pushes; refs re-verified unchanged after the investigation. IRR: the only changes are this record and the additive tracker update (§12 + change-log + REG-11 row), published via normal PR workflow from a branch created from `main@721520cc…`; PR #80's merged history is untouched; no second master tracker is created; the publication PR is **not** merged by the agent. |

---

*End of record `REG11-R4-PR42-HISTORICAL-AUTHORITY-RECONCILIATION-2026-10-13-01`. This record
resolves the R4 evidence question (Outcome B) and requests the §11 PA disposition. It decides
nothing.*
