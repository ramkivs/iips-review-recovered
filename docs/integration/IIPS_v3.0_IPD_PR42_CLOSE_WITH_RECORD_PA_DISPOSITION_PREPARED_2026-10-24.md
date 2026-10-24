# IIPS v3.0 — IPD PR #42 / DQ-6a: Decision Rendered; IPD Publication and Closure **BLOCKED** at the Integration Boundary — Prepared Publication Text

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-IPD-PR42-PREPARED-PUBLICATION-IRR-MIRROR-2026-10-24-01` |
| **Rendered decision (authority)** | `IIPS-V3-IPD-PR42-CLOSE-WITH-RECORD-PA-DISPOSITION-2026-10-24-01` — PA-approved 2026-10-24 |
| **Status** | **DECISION RENDERED — IPD-LOCUS PUBLICATION BLOCKED — NOT EFFECTIVE IN THE GOVERNING LOCUS** |
| **Governing locus for the act** | **IPD `ramkivs/iips-production-market-data`** — *not* this repository. This file is a **mirror and a preserved publication text**, not the act |
| **Why this file exists** | The GitHub App installation used by this session holds **no write capability on IPD** (§2). The approved dispositions for `CV-23` and `CV-43` were executed in the IRR locus; this third disposition could not be published in its own locus or executed |
| **Closure executed?** | **NO.** IPD PR #42 remains `OPEN`, `merged: false`, `closed_at: null`, head `afa430900c3e928773bd35a3718bf3d6c94ccff5` — verified by independent remote read-back after both attempts |
| **What remains outstanding** | (a) publication of the Part A record to IPD `main`; (b) the PR close itself; (c) the closure receipt (Part B §5) |
| **Not a substitute for the act** | Nothing here is effective in the IPD locus. No gate, fence, pin, admission, acceptance or qualification moves by its existence |

## 1. What was rendered, and what was blocked

| Item | State |
|---|---|
| PA decision on IPD PR #42 (close as historical candidate, no admission path) | **RENDERED** 2026-10-24 by explicit PA authorization — text preserved verbatim in **Part A** |
| IPD decision-record publication | **BLOCKED** — no IPD write capability (§2) |
| IPD pull-request closure | **BLOCKED** — `403 Resource not accessible by integration` on both routes (§2) |
| Closure receipt in the IPD tracker | **BLOCKED** — same cause; text prepared in Part B §5 |
| IRR-side registration of the attempt | **COMPLETE** — tracker §16.103.10 (this repository) |

## 2. Blocker evidence (precise, reproduced, not inferred)

| # | Probe | Result |
|---|---|---|
| B1 | `git push origin arena/6ce5c3bd-iips-production-market-data` (full-history clone of IPD at `main@5a34fa88…`, one documentation-only commit) | **DENIED** — `remote: Permission to ramkivs/iips-production-market-data.git denied to ramkivs.` / `fatal: ... The requested URL returned error: 403` |
| B2 | `POST /repos/ramkivs/iips-production-market-data/git/blobs` | **`403 Resource not accessible by integration`** |
| B3 | `gh pr close 42 --repo … --comment …` | **DENIED** — `Message: Resource not accessible by integration` (exit 1) |
| B4 | `PATCH /repos/ramkivs/iips-production-market-data/pulls/42 -f state=closed` | **`403 Resource not accessible by integration`** |
| B5 | Read capability on the same repository | **WORKS** — repo, PR, commits, trees, blobs all readable; `permissions` reports the *user's* admin, which is **not** the installation's capability |
| B6 | Same capability class on IRR | **WORKS** — `contents:write` and `pull-requests:write` demonstrably function (IRR PRs #241–#246) |
| B7 | Post-attempt PR state | `state: open`, `merged: false`, `closed_at: null`, head `afa43090…` — **no partial mutation, nothing deleted, nothing forced** |

This is the pre-existing boundary already recorded in the IPD tracker ("Arena GitHub App external-repo integration boundary", *Resource not accessible by integration*). **It was not worked around, retried in a loop, or bypassed**; no credentials were requested and none are stored.

## 3. Exact execution path for an actor holding IPD write (no re-derivation needed)

1. On IPD, create the file at **`evidence/cross-repository/IIPS_V3_CAP03_PR42_CLOSE_WITH_RECORD_PA_DISPOSITION_2026-10-24.md`** with the **Part A** text below, verbatim.
2. Append the **Part B** text verbatim to `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md`.
3. Open one PR against IPD `main` (`5a34fa88…`); wait for green exact-head CI; merge with a merge commit.
4. **Close IPD PR #42 without merging**, posting the **Part C** text verbatim as the closure comment.
5. Independently read back: PR `state`/`merged`/`closed_at`; the merged record blob; the tracker blob.
6. Append the closure receipt to the tracker (§5 of Part B) with the verified values, then reconcile the IRR tracker §16.103.10 by dated receipt.

**Do not merge, rebase, cherry-pick, force-push or transfer any PR #42 content at any step.**

---

## Part A — prepared IPD-locus decision record (publish verbatim)

# IIPS v3.0 — IPD PR #42 Program Authority Disposition: Close With Record

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-IPD-PR42-CLOSE-WITH-RECORD-PA-DISPOSITION-2026-10-24-01` |
| **Subject** | IPD PR **#42** — `Gate 3: act-conformant IPC candidate with connection-slot release`, branch `arena/feda2d8c-iips-production-market-data`, head `afa430900c3e928773bd35a3718bf3d6c94ccff5`, tree `f0b27857574e651f42a848deb137bc050f0f2b74` |
| **Decision-maker** | Program Authority (PA) |
| **Decision date** | `2026-10-24` (Asia/Kolkata; no time-of-day supplied) |
| **Decision source** | The PA's explicit approved disposition, issued as a one-pass execution authorization to the operating session on 2026-10-24, prepared against decision package §3 of the same date and DQ-6a option **(i)** of `IIPS-V3-CAP03-PA-DECISION-PACKET-DQ1-DQ7-2026-10-24-01` |
| **Status** | **DECIDED — PR #42 TO BE CLOSED AS A HISTORICAL CANDIDATE; NO ADMISSION PATH OPENED** |
| **Governing locus** | **IPD `ramkivs/iips-production-market-data`** (this record + the IPD execution tracker). This is a *provider-locus* disposition and renders nothing in the IRR locus; IRR registers it by dated receipt only |
| **IPD baseline verified before preparation** | `main@5a34fa880c441cc21c1dee653784308beb2265d3` (tree `5e239c7338c2016ce12fc7d3ae9254cbdbfadd60`) — the instruction's baseline, zero drift |
| **Companion authority** | `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` (Gate 3 `ACCEPTED — bounded implementation scope only`) — **preserved unchanged** by this record; PR #41 merge `d15582d68167461e814ec8f7873dc18e3df5ab71` at `main@1cceacff…`, post-merge CI `39765365164` `success` (`784 / 783 / 0`) |

> **Rendered PA decision — IPD PR #42: CLOSED AS A HISTORICAL CANDIDATE, WITHOUT MERGING.**
>
> No admission path is opened. Nothing in PR #42's content is transferred, merged, rebased or cherry-picked.

## 1. Identity and disambiguation (mandatory first section)

**This record concerns IPD PR #42 only.** Two distinct records carry the number *42*, and conflating them has caused recurring confusion:

| | **IPD PR #42 — this disposition** | **IRR historical PR #42 — NOT this disposition** |
|---|---|---|
| Repository | `ramkivs/iips-production-market-data` | `ramkivs/iips-review-recovered` |
| Subject | Gate 3 IPC candidate (22 files, `+5,137/−0`) | 2026-10-06 Reports-domain paths |
| State | `OPEN` / draft / `CONFLICTING` | merged 2026-10-06 **without effective authority** |
| Recorded disposition | **this record** | `R4-B` (CV-09) + the H-4/H-16 errata record (`9303ae5c…`, IRR PR #154 merge `c6240fa4…`, CI `39222216957` `SUCCESS`) — **CLOSED (documentary correction applied)** |
| Touched here | yes (close) | **no** — not re-opened, not amended, not re-litigated |

## 2. Decision

1. **IPD PR #42 is CLOSED, NOT MERGED.** Its head and tree — `afa430900c3e928773bd35a3718bf3d6c94ccff5` / `f0b27857574e651f42a848deb137bc050f0f2b74` — and its second commit `54123307dd0c5576f46a756bda26e2b74b9b85d8` are **preserved on the record** as historical candidate identity. The head is **not an ancestor** of `main` and, on close, remains reachable from the retained branch ref for audit.
2. **No rebase, cherry-pick, force-push, content transfer or re-creation** of any PR #42 byte is authorized. The branch is **not a basis for any work**.
3. **PR #42 contributed and contributes zero Gate 3 evidence.** It was never part of the accepted baseline (`IIPS-V3-G3-ACCEPTANCE-2026-10-22-01`). PR #41's native-Windows result does **not** transfer to any PR #42 head (`Q3-A`; two `§4.2` implementation files and three `§4.3` test files differ).
4. **No admission path is opened.** No file of PR #42 is admitted by this record, and closing the PR grants nothing.
5. **Conditional future trigger (recorded, not activated).** *If* Gate 4 host execution identifies a **Windows pipe-collision defect** attributable to the accepted line, the PA **may** authorize a **bounded port re-derived on current `main`** — limited to `src/ipc/endpoint.ts`, `src/ipc/entrypoint.ts` and the three corresponding test files, with fresh exact-head native-Windows validation — **under a separate PA act**. This record does not authorize that port, does not schedule it, and creates no expectation of it. Absent such an act, the default is **no action**.
6. **Preserved unchanged:** Gate 3 acceptance and the accepted Gate 3 implementation; PR #41 and PR #34 history; Gate A′ / Gate 4 (`AUTHORIZED — NOT STARTED`, `QE 0/11`) / Gate C / Gate 5; `SESSION_ONLY` / `durable:false`; `WRITE_NOT_AUTHORIZED`; all `503` fences; provisioning (not executed); H-12 (**NOT ADOPTED**); DR-2/DR-3/DR-4r (**UNRESOLVED**); DQ-1…DQ-7 (**PROPOSED — NOT EFFECTIVE**).
7. **DQ-6b is untouched.** The `iips-broker-import` alias pin `70b24f029842a7e9b7f615e4d9df7376fd4ff817` and the primary pin `2d9130e76bb0dc89daeefabaf297e27bdaa84250` are unchanged; the dual-pin question remains sequenced at the DQ-4 freeze and is **not** answered here.

## 3. Evidence basis (re-verified at this head; nothing re-investigated)

| # | Fact | Verified value (`2026-10-24`, read-only GitHub API + full-history clone) |
|---|---|---|
| E1 | PR state | `OPEN`, **draft**, `mergeable: CONFLICTING`, `mergeStateStatus: DIRTY`; `createdAt 2026-10-22T10:43:47Z`; `updatedAt 2026-10-22T10:53:06Z` — **no activity for two days** |
| E2 | Head / tree / parent | `afa430900c3e928773bd35a3718bf3d6c94ccff5` / `f0b27857574e651f42a848deb137bc050f0f2b74` / `54123307dd0c5576f46a756bda26e2b74b9b85d8` (2 commits, 22 files, `+5,137 / −0`) |
| E3 | Distance to `main` | **2 ahead / 89 behind** `main@5a34fa88…` (full history; the DQ packet recorded 2 / 79 — the gap has widened by 10) |
| E4 | Merge-base | `c0e1b56…` (2026-10-21) |
| E5 | Content identity vs **current** `main` | **12 of 22 blobs byte-identical** to `main`; **10 differ** (6 source + 4 test). §4 lists them |
| E6 | `main`-only files absent from #42 | `src/persistence/brokerImportPersistence.ts`, `gateAPrimeProvisioning.ts`, `gateAPrimeValidation.ts`, `migrations/004_portfolio_contribution_provenance.ts` |
| E7 | Unique residual substance | `main`'s `src/ipc/endpoint.ts` (`e565aa5b…`) **has** `EndpointCollisionError` but **no** `EACCES`/`EPERM`/`EBUSY` mapping; #42's `fe49c783…` adds that mapping (Windows named-pipe first-instance codes). This is the **only** clearly unique hardening, and it is observable only on a Windows host |
| E8 | Superseded content | #42's second commit already adopted PR #41's connection-slot release, which is **on `main`**. `binding.ts`, `portfolio_store.ts` and `durablePortfolioStorePort.ts` differ because **`main` advanced** (U7 `WRITE_NOT_AUTHORIZED`, CAP-02, contribution provenance), not because #42 leads |
| E9 | Evidence class | **Zero Gate 3 contribution**; native Windows **NOT RUN** for this head; hosted CI `39765282842` was green at that head — **diagnostic only**, never authority |
| E10 | Merge availability | Merging as-is is **prohibited**: `CONFLICTING`, outside any effective act, and duplicating accepted work (DQ-6a option **C** was recorded `Not available`) |

## 4. The exact ten-file boundary (`main@5a34fa88…` vs `afa4309…`)

| Path | `main` blob | PR #42 blob | Class |
|---|---|---|---|
| `src/ipc/dispatch.ts` | `27becc76…` | `6c8fcbc8…` | source (`main` advanced) |
| `src/ipc/endpoint.ts` | `e565aa5b…` | `fe49c783…` | source — **unique Windows collision-code hardening** |
| `src/ipc/entrypoint.ts` | `ae3edd12…` | `5189ac1a…` | source (`main` advanced) |
| `src/persistence/binding.ts` | `96d0079d…` | `4c5ea0d5…` | source (`main` advanced) |
| `src/persistence/durablePortfolioStorePort.ts` | `d95608d9…` | `97c5bc65…` | source (`main` advanced — U7) |
| `src/persistence/portfolio_store.ts` | `4a005b73…` | `2ee96301…` | source (`main` advanced) |
| `tests/g3_ipc_framing.test.ts` | `c4a4a88a…` | `87154445…` | test |
| `tests/g3_no_network_listener.test.ts` | `b1e48c70…` | `57b3381d…` | test |
| `tests/g3_portfolio_read_isolation.test.ts` | `69e36f68…` | `7b978625…` | test |
| `tests/g3_startup_validation.test.ts` | `edd0305e…` | `9514e4ce…` | test |

**Byte-identical (12):** `src/ipc/protocol.ts`, `src/persistence/audit.ts`, `connection.ts`, `migration_ledger.ts`, `migrations/001_initial_schema.ts`, `migrations/002_audit_event_sequence.ts`, `migrations/003_local_principal_bindings.ts`, `provisioning.ts`, `tests/g3_binding_resolution.test.ts`, `tests/g3_caller_authority.test.ts`, `tests/g3_durability_vocabulary.test.ts`, `tests/g3_write_gate.test.ts`.

## 5. Explicit non-grants

Not granted, implied or scheduled by this record: any merge or admission of PR #42 or of any of its blobs; any rebase, cherry-pick, force-push or content transfer; the conditional port (which requires its own act); any Gate 3/4/5 movement or re-acceptance; result acceptance; qualification; provisioning; H-12 adoption; `durable:true`; any `503` fence lift; production eligibility; any pin change (primary or alias) or any DQ answer — **DQ-6b remains open and untouched**; any IRR-locus change; any re-opening of the IRR historical PR #42 matter.

## 6. Effectiveness and the closure act

The disposition is **rendered by this record** and is effective on publication to IPD `main` with green exact-head CI and independent remote read-back, per the locus's own effectiveness terms. The **closure act** (setting PR #42 to `closed`, without merging) is executed by the operating session immediately after that publication and is recorded — with its verified post-state, timestamps and immutability evidence — in the tracker receipt of the same date. **A record is not effectiveness; the closure is not admission.**

## 7. Non-transfer to the IRR locus

This record renders **no** IRR decision. The IRR-side counterpart acts of the same date (`CV-23`, `CV-43`) are rendered in their own locus and are independent of this disposition. IRR's registration of this IPD act is by dated receipt only and imports no authority back.

---

*Prepared by Arena Agent Mode from the PA's approved disposition; recording, publication and closure execution only. No independent authority is rendered by the recording agent.*


---

## Part B — prepared IPD execution-tracker section (append verbatim)

## CAP-03 — IPD PR #42 Program Authority disposition: **CLOSED WITH RECORD** (2026-10-24)

**Status:** disposition rendered and published; **closure act executed and receipted in the addendum below**.
No merge, no rebase, no cherry-pick, no content transfer, no gate movement, no pin change, no admission.

### 1. Decision

The Program Authority's approved disposition of 2026-10-24 — recorded in
`IIPS-V3-IPD-PR42-CLOSE-WITH-RECORD-PA-DISPOSITION-2026-10-24-01`
(`evidence/cross-repository/IIPS_V3_CAP03_PR42_CLOSE_WITH_RECORD_PA_DISPOSITION_2026-10-24.md`) — is:

1. **PR #42 is closed as a historical candidate, without merging.** Head `afa430900c3e928773bd35a3718bf3d6c94ccff5`
   and tree `f0b27857574e651f42a848deb137bc050f0f2b74` are preserved on the record as candidate identity.
2. **No admission path is opened.** No byte of PR #42 is admitted; closing grants nothing.
3. **No rebase, cherry-pick, force-push or content transfer** is authorized; the branch is not a basis for any work.
4. **Conditional future trigger, not activated:** a bounded port **re-derived on current `main`** (limited to
   `src/ipc/endpoint.ts`, `src/ipc/entrypoint.ts` and the three corresponding tests) may be considered **only under a
   separate PA act** if Gate 4 host execution identifies a Windows pipe-collision defect. Not authorized, not scheduled.
5. **Preserved:** Gate 3 acceptance `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` and the accepted implementation; PR #41/#34
   history; Gate A′/4/5, Gate C; `SESSION_ONLY`/`durable:false`; `WRITE_NOT_AUTHORIZED`; all `503` fences;
   provisioning (not executed); H-12 (NOT ADOPTED); DR-2/DR-3/DR-4r (UNRESOLVED); DQ-1…DQ-7 (PROPOSED — NOT EFFECTIVE).
6. **DQ-6b untouched** — both package pins unchanged; the dual-pin question stays sequenced at the DQ-4 freeze.

### 2. Identity and disambiguation (recorded because it has caused confusion)

| | IPD PR #42 (this record) | IRR historical PR #42 (untouched) |
|---|---|---|
| Repo | `ramkivs/iips-production-market-data` | `ramkivs/iips-review-recovered` |
| Subject | Gate 3 IPC candidate, 22 files `+5,137/−0` | 2026-10-06 Reports-domain paths |
| Disposition | **closed with record (this act)** | `R4-B` (CV-09) + H-4/H-16 errata `9303ae5c…` (IRR PR #154 `c6240fa4…`) — CLOSED documentarily; **not re-opened** |

### 3. Step 0 — state re-verified before preparation (read-only)

| Item | Value |
|---|---|
| IPD `main` / `origin/main` | `5a34fa880c441cc21c1dee653784308beb2265d3`, tree `5e239c7338c2016ce12fc7d3ae9254cbdbfadd60` — instruction baseline, **zero drift** |
| PR #42 | `OPEN`, draft, `CONFLICTING`/`DIRTY`, head `afa43090…`, tree `f0b27857…`, `22` files `+5,137/−0`, 2 commits, created `2026-10-22T10:43:47Z`, last update `2026-10-22T10:53:06Z` |
| Distance | **2 ahead / 89 behind** `main@5a34fa88…` (full history); merge-base `c0e1b56…` |
| Content vs current `main` | **12 of 22 blobs byte-identical**; **10 differ** (6 source + 4 test); `main` carries 4 persistence files #42 lacks |
| Unique residual substance | `main`'s `src/ipc/endpoint.ts` `e565aa5b…` has `EndpointCollisionError` but **no** `EACCES`/`EPERM`/`EBUSY` mapping; #42's `fe49c783…` does — observable only on Windows |
| Evidence class | **Zero Gate 3 contribution**; native Windows **NOT RUN**; PR #41's Windows result **non-transferable** (`Q3-A`) |

### 4. What this disposition does and does not establish

**Establishes:** that PR #42 was a superseded candidate whose content is now 12/22 identical to `main`, whose remaining
differences are overwhelmingly `main`-side advancement, and whose only unique substance is Windows-specific collision-code
hardening that has never been validated on Windows; and that the candidate surface stops being misstated.

**Does not establish:** any admission, any gate or acceptance movement, any qualification, any Windows result, any pin
change, any answer to DQ-1…DQ-7 (including DQ-6b), or any authority in the IRR locus.

### 5. Closure act and receipt

*Appended additively below as the closure receipt after execution, with the verified post-state (`state`, `merged`,
`closedAt`, `mergedAt`, head/tree immutability) and remote read-back.*


---

## Part C — preserved closure comment (post verbatim when closing PR #42)

```text
Closing as a historical candidate under the Program Authority disposition of 2026-10-24
(IIPS-V3-IPD-PR42-CLOSE-WITH-RECORD-PA-DISPOSITION-2026-10-24-01), without merging.

Head afa430900c3e928773bd35a3718bf3d6c94ccff5 / tree f0b27857574e651f42a848deb137bc050f0f2b74
are preserved on the record as candidate identity. No rebase, cherry-pick, force-push or content
transfer is authorized; this branch is not a basis for any work. No admission path is opened and no
byte of this PR is admitted. Zero Gate 3 contribution; PR #41's native-Windows result is not
transferable to this head (Q3-A). Gate 3 acceptance IIPS-V3-G3-ACCEPTANCE-2026-10-22-01, PR #41/#34
history, all 503 fences, SESSION_ONLY/durable:false and WRITE_NOT_AUTHORIZED are unchanged.

Conditional future trigger (not activated): a bounded port re-derived on current main —
src/ipc/endpoint.ts, src/ipc/entrypoint.ts and the three corresponding tests — may be considered only
under a separate PA act if Gate 4 host execution identifies a Windows pipe-collision defect.

Unrelated to the historical IRR PR #42, which is not re-opened.
```

---

*Prepared by Arena Agent Mode from the PA's approved disposition. Recording and preservation only; the act remains unpublished in its governing locus and the closure remains unexecuted.*
