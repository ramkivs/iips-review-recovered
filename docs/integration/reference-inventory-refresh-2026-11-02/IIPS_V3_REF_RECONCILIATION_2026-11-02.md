# IIPS V3 Git-reference reconciliation — 2026-11-02

## Executive result

The 443-row inventory has been refreshed against full, non-shallow mirrors of both remote repositories. Every original row and all 14 original columns are retained in the refreshed CSV; the original attachment is copied byte-for-byte alongside it. New columns record current ref resolution, raw ref object and peeled commit/tree, verified `main`/tree, ancestry/merge base, direct snapshot and branch-side deltas, duplicate targets/trees, current PR-head association, classification, evidence and action.

**No refs or product code were changed.** The only repository additions are these reconciliation deliverables. The original CSV was not modified. No PR case was re-investigated, and this is not the separate PR census or Prompt 82641's project-wide E2E audit.

| Repository | Verified current `main` | `main` tree | Remote heads | Remote tags |
|---|---|---|---:|---:|
| IRR — `ramkivs/iips-review-recovered` | `0468d68629481740ac28d71728beddeccd79d995` | `da48b8f3cc8499ccb3151dc4efb6f666fd198860` | 326 | 3 |
| IPD — `ramkivs/iips-production-market-data` | `56959fc33416ce53b142b39cbe4bd8a7ba5e077d` | `ee8b0d4f42d10e92b5811fcfffb5a80a9c09cc32` | 110 | 6 |

### What changed in reference status

- All **432 source remote-branch names** still resolve remotely; none is missing. Of those, only each repository's `main` target has advanced from the CSV's historical target.
- All **9 tags** still exist, and each current tag's peeled commit exactly matches the source CSV's `target_commit_sha`. Annotated-tag object SHAs are recorded separately from peeled commits. No tag was moved or changed in this task.
- The two source local/session records are preserved. IRR local `main` exists and now points to current main. The formerly `session-local` `arena/bfb7866b-iips-review-recovered` is no longer a local branch; it now exists remotely at `fe6b2d6da998667b1394552fca0a7991c42da7da`, is PR #431's merged head, and has one branch-side documentation change, no product-code delta. The #431/#36 history is already reconciled; it was not reopened.
- Current remote heads include four names not in the source's 432 `ref_kind=branch` rows. One (`arena/bfb7866b…`) was already present as a `session-local` row. The three other post-inventory heads are listed in `IIPS_V3_REMOTE_ONLY_REFS_2026-11-02.csv`: IRR `arena/75227efc-iips-review-recovered` and IPD `operator/ipd-b1r-stale-status-correction-20261102`, `operator/ipd-pr5-6-42-reconciliation-20261102`. These are not silently added to or substituted for the 443 source records.

### Refreshed branch ancestry

| Repository | Ancestor of main | Same as main | Divergent, common base | No common ancestor | Total branch rows |
|---|---:|---:|---:|---:|---:|
| IRR | 291 | 1 | 29 | 3 | 324 |
| IPD | 75 | 1 | 31 | 1 | 108 |
| **Total** | **366** | **2** | **60** | **4** | **432** |

The four unrelated histories are IRR `gai-impl-canonical`, `phase13-hardening-delivery`, `phase13-next`, and IPD `m1-ad4-repair`. They have no merge base with their current repository `main`; they are **not** “ahead/behind” branches. The refreshed CSV intentionally leaves branch-side commit counts/deltas unavailable for these refs and gives direct, directional tree/blob differences instead. Earlier notes that describe disconnected-history reachability counts as “ahead/behind” should not be used as merge-base evidence.

## Content-level findings and dispositions

The per-reference CSV has one row for each of the 443 inventory records, including a branch-by-branch record for all 432 branch rows and separate tag/local records. It compares exact Git trees and blob IDs, distinguishes paths only on the ref from paths only on current main, and records both direct snapshot differences and, where a merge base exists, changes from merge base to ref. The latter is the useful measure of branch-side contribution. A direct snapshot difference—especially for an old ancestor or an unrelated root—is **not** proof of a missing feature.

### IRR

- **Already represented in current main history:** 291 branch tips are ancestors of current `main`; the `main` row itself equals main. Their direct tree differences are later main evolution, not branch-only gaps.
- **Common-base divergences:** 29 refs. Ten have branch-side paths in the owned product-code/contract roots. The specific lineages and exact branch-side paths are in the findings CSV. The current code candidates are:
  - `arena/01a06af2` — 7 product paths; old shell/auth/executive transport changes. The auth/OIDC portion is out of scope under H-18; do not infer a missing current capability.
  - `arena/01a0f1b3` — 15 product paths; historical NP-06 Reports implementation. Current main has a later Reports-domain implementation; the UI/navigation was previously recorded as deferred. The historical branch is not a wholesale integration candidate.
  - `arena/01a0f351` — 23 product paths; collaboration, settings, watchlists and Evidence Landing branch versions. Current main has corresponding product areas, but branch blobs and branch-local acceptance records are not identical to current main or admission authority.
  - `arena/01a0f64b` — 2 Evidence Landing/navigation paths; current main contains the surface. The branch's NP-13 material does not authorize reserved snapshot exposure.
  - `arena/01a1079e` — 2 D115 runtime/secured-executor paths; branch-only completion record, not main admission or live host evidence.
  - `arena/01a10b3c` and `arena/01a10c0e` — macro source/disclosure lineage. PR #36's Finding E reconciliation is already preserved; no PR case was repeated.
  - `arena/a2df3b85` — 10 G-2/user-portfolio adapter and restart-proof paths. Branch-only candidate; current main's boundary is not the same as this persistence/consumer implementation.
  - `gate-b/local-principal-ipc-implementation` and `-r2` — 4 code paths each for the local-principal IPC seam. These are related variants, not two independently admitted capabilities.
- **No common ancestor:**
  - `gai-impl-canonical` has 42 ref-only owned-product paths; `phase13-hardening-delivery` has 20; `phase13-next` has 42. Each also lacks many later current-main product paths and has same-path/different-blob files. Consequently, the direct snapshot path counts do not identify unique feature contributions by themselves.
  - `phase13-next` carries the Opportunities/Risks/Rankings UI, Research Hub/Sector Intelligence, command palette and Notes/Notifications surfaces. The NP-18 records are branch-local; the prior lineage investigation records runtime/logical evidence but expressly does not grant implementation qualification, certification or admission to main. Current main has some underlying engines/APIs, not all branch UI surfaces.
  - `gai-impl-canonical` also carries PF-2 directory/IdP-sync modules, Notes/Notifications and a retired auth/admin stack. Prior review found the PF-2 code to be authority modules without a user-facing endpoint; the cited TD-4/TD-8a governing records were not located. The auth/OIDC stack is OOS under H-18.
  - `phase13-hardening-delivery` is a distinct August 2026 UI-hardening lineage (contrast, accessibility/navigation, responsive/loading changes) plus older auth/admin paths. No common ancestry or blanket acceptance mapping authorizes wholesale porting. Only a specific still-required acceptance gap should reopen an individual item.
- **Bottom line:** several user-facing capabilities are absent from current IRR main as code/surfaces, but these refs alone do not establish that they are authorized missing product requirements. They are **unintegrated, authority-bound candidates**, not confirmed release blockers. Current main's Reports backend is not the old NP-06 branch implementation; Reports UI remains deferred. The old auth stack is out of scope. Preserve history and require explicit per-surface decisions before integration.

### IPD

- **Already represented in current main history:** 75 branch tips are ancestors of current main; the main row equals main.
- **Common-base divergences:** 31 refs. Fifteen show branch-side owned product-code/contract paths under the stated IPD `src/**`/package/script rules. Three recovery refs (`arena/01a0cf86`, `arena/01a0d1d3`, `arena/01a0d33d`) also contain UI recovery assets under IPD `frontend/**`; those remain IPD-owned branch artifacts and are called out separately below rather than being moved or reclassified as IRR files. The product-bearing references fall into these reviewed families:
  - **IPD-owned recovered UI surfaces:** `arena/01a0cf86` executive, `arena/01a0d1d3` company/sector, and `arena/01a0d33d` sector/cross-sector/decision recovery. Their `frontend/**` trees and branch-side transport/package changes are distinct per ref. Prior records describe recovery as branch-only, partially verified/non-production; D115 implementation authority was not granted and AI advisory was deferred. Do not copy these IPD files into IRR; any desired IRR surface needs its own IRR decision and implementation.
  - **G24/local-principal/NP-04 persistence:** `arena/01a0e6d9`, `arena/01a0f308`, `gate-a`, `gate-b`, `np04-governed-persistence-windows`, and related pin refs. These are one related branch family, not independent deployments; the first two share an exact tree despite different commit histories. The `iips-pin-np04-2e11fa3b` tag peels to the branch commit; the IRR package pin is separate consumer evidence and does not make this implementation part of IPD main. Existing registers identify authority/promotion gates; no code or tag change is authorized here.
  - **Dhan D1/D2:** `arena/01a0d943` has provider foundation and qualification harness. Its latest commit labels the UI development-only/synthetic and the earlier foundation pre-access. This is not evidence of live Dhan operation.
  - **D06/D07:** `arena/01a0ddae` ends with presentation-only build-time wiring; prospective data/governance on a branch is not main admission or production data.
  - **Canonical identifier spec:** `arena/01a0e30c` contains a branch-only P01-01 contract module and offline tests. Its commit states acceptance/certification was not performed and P01-02 was not executed.
  - **D-PIT-WIRE-01:** `arena/01a0c440` has three branch-side Windows script/README paths. Repository inspection is not execution; native acceptance remains outstanding if the scripts remain in scope.
  - **Previously reconciled PR refs:** #5, #6 and #42, and the other user-listed completed PR cases, were not re-investigated. Current ref/tree/PR association only was refreshed.
- **No common ancestor — `m1-ad4-repair`:** the branch tip is a P15 E-12 closure report on a broad historical snapshot. Its root has no IPD `src/` tree/package product source. It has **zero ref-only IPD owned-product paths**; current IPD main has 146 such paths absent from the ref. Its large whole-tree difference is mostly documentation/evidence and unrelated snapshot content, not missing IPD implementation. This is consistent with the original row's `owned_product_code_delta_files=0`; it is not a candidate to restore. The tip itself says P15 certification, P16 authorization and production authorization were not granted.
- **Bottom line:** IPD main is missing the branch-only G24/NP-04 implementation family, Dhan provider, D06/D07 wiring and P01-01 contract as code. Their presence on refs is not proof of authorization, readiness or production behavior. D-PIT-WIRE-01 is a real branch-side script delta but requires a scope decision and native Windows evidence. `m1-ad4-repair` is not an IPD code gap.

## What is complete, missing, obsolete, or still needs integration

- **Complete:** full remote ref/name/target refresh; all 443 original records retained; exact current main/tree and tag peel verification; full-history ancestry/merge-base calculations; direct and branch-side path/blob comparisons; duplicate ref/tree and current PR-head associations; one-row-per-reference findings; capability and action registers; concise Prompt 82641 handoff.
- **Genuinely missing, in the strict authorized-product sense:** **none is proven by this reference inventory alone.** Current-main absences are documented separately from authorized requirements. For example, the IRR NP-18/Research/Notes surfaces and IPD Dhan/G24 functionality are absent from their respective current mains, but their authority/qualification/acceptance status is unresolved, deferred, prospective or branch-only. Do not relabel them as authorized release blockers based on ancestry or path counts.
- **Obsolete/superseded:** the IPD `m1-ad4-repair` snapshot is not IPD product source; the old IRR NP-06 Reports branch implementation is superseded by a later current-main implementation (UI remains deferred); the retired IRR auth/OIDC stack is OOS. Completed PR work remains preserved and is not reopened.
- **Requires owner integration/decision if still in approved scope:** per-surface IRR NP-18/Research/Notes/Notifications and G-2/D115 branches; IPD G24/NP-04/local-principal, Dhan, D06/D07, P01-01 and D-PIT-WIRE-01. The CSV action register assigns each item to its owning repository. Any cross-repo dependency is split into IRR consumer and IPD provider work; no cross-repository writes are proposed.
- **Windows-native verification still outstanding:** no Windows-native execution was performed in this run; this was Linux-side repository/Git inspection only. Native execution is required for Windows scripts/provider/runtime acceptance where applicable. Unit tests embedded in refs, branch reports or recorded past Windows claims are not new Windows verification.

## Method and boundaries

1. Fetched complete mirror histories read-only and confirmed neither mirror is shallow. Verified remote main tips and trees independently; current tips match the baselines supplied for this run.
2. Mapped each source row by repository + ref kind + exact name. Branch rows use remote heads; tags preserve raw ref object SHA and peeled commit; the two local/session labels are checked against current local and remote refs. Historical rows are not dropped if their current resolution differs.
3. Compared tree path/blob maps to current main. For common-base branches, `branch_side_*` compares merge base to the current target. `current_snapshot_*` compares the entire current target tree to current main. For unrelated histories, only directional tree/blob comparison is meaningful; no branch-side commit/delta is asserted.
4. Owned-product roots are repository-specific: IRR `frontend/src/**`, `frontend/server/**`, `scripts/windows/**`, and frontend package manifests; IPD `src/**`, `migrations/**`, `scripts/windows/**`, and package manifests. Tests/fixtures and docs/evidence are separate categories. IPD recovery refs also contain IPD-owned UI artifacts under `frontend/**`; these are explicitly described in the findings/capability register but are not silently reclassified as IRR or included in the IPD `src/**` path metric. A path count is a locator, not proof of a missing capability.
5. PR API metadata was used only to map inventory refs to current branch-name/head associations and state. The completed PR investigations named in the task were reused; no separate PR census, PR-body review, or project-wide E2E audit was run.

## Deliverables

- `SOURCE_IIPS_V3_REF_INVENTORY_2026-11-02.csv` — exact copy of the input.
- `IIPS_V3_REF_INVENTORY_2026-11-02.refreshed.csv` — all 443 rows, original 14 columns plus 39 refreshed fields.
- `IIPS_V3_REF_BRANCH_FINDINGS_2026-11-02.csv` — one row per reference (443 rows), with branch-by-branch ancestry, path/blob counts and content disposition.
- `IIPS_V3_CONSOLIDATED_CAPABILITY_REGISTER_2026-11-02.csv` — consolidated capability/status register.
- `IIPS_V3_OUTSTANDING_ACTION_REGISTER_2026-11-02.csv` — owner-separated next actions and evidence criteria.
- `PROMPT_82641_HANDOFF_2026-11-02.md` — concise next-prompt handoff.
- `IIPS_V3_REMOTE_VERIFICATION_2026-11-02.json` — machine-readable tips, ref counts, target verification and method.
- `IIPS_V3_REMOTE_ONLY_REFS_2026-11-02.csv` — current branch refs absent from all source branch-like rows.
