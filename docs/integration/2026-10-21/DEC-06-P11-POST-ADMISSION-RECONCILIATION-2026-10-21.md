# DEC-06 / IPD P11 — post-admission IRR reconciliation

**Date:** 2026-10-21 (UTC)  
**Record:** `IIPS-V3-DEC06-POST-ADMISSION-IRR-2026-10-21-01`  
**Status:** completed admission recorded; IRR-only documentation reconciliation.  
**Authority:** existing standing PA grant, tracker §16.70 and the current one-pass IRR publication direction. No further approval, new admission decision or implementation work is required by this record.

## 1. Evidence read and completed state

IRR baseline: `main@d89b785c6e7f91a0330d51f2d86b1efe8428ed18`. Read tracker §§16.65, 16.69, 16.70, the §16.70 companion authority record and publication receipt. IPD was read-only: current main, decision package, admission act, candidate reconciliation, inventory A4/A5/A6, PR metadata and admission CI.

| Event | Published evidence |
|---|---|
| Explicit D-06 ADMIT act, before admission | [IPD PR #38](https://github.com/ramkivs/iips-production-market-data/pull/38), merged `2026-10-21T16:42:23Z`, `6ff80d0cc5fb678367ba5fb2129b28ab854f2e52` |
| Integration merge, exact candidate IDs retained | `86c76538979f159c478bb5887d1c387f4ef2ddb3`, parents pre-admission main `6ff80d0c…` and candidate `3eaec0ed…` |
| Admission | [IPD PR #39](https://github.com/ramkivs/iips-production-market-data/pull/39), merged `2026-10-21T16:45:53Z` |
| **Admission merge commit** | **`ef634df108acc18ca028789169b20ae5a4473966`**, parents `6ff80d0c…` and `86c76538…` |
| **Admitted tree** | **`ddb5d2461453a0c8e895ed84382537d727cbab85`** |
| Post-admission A6 | [IPD PR #40](https://github.com/ramkivs/iips-production-market-data/pull/40), merged `2026-10-21T16:48:01Z` |
| **Final verified IPD main** | **`c0e1b5662264651246db1ccde2945eb5e13f3524`** |

The admitted lineage is `b6e622432cb0ca3e5452c4194bc683c496a688fc` → `3eaec0edd4f89a806b301d647499ca860c2a1172`. Both are now ancestors of final IPD main. Acceptance did not itself prove admission; the separately published act, actual merge and remote read-back now do.

Pinned IPD evidence (all at final main):

- [Admission act](https://github.com/ramkivs/iips-production-market-data/blob/c0e1b5662264651246db1ccde2945eb5e13f3524/evidence/cross-repository/IIPS_V3_DEC06_P11_MAIN_ADMISSION_ACT_2026-10-21.md).
- [Inventory, including A6](https://github.com/ramkivs/iips-production-market-data/blob/c0e1b5662264651246db1ccde2945eb5e13f3524/evidence/np04/IIPS_v3.0_IPD_IRR_CAPABILITY_INVENTORY_AND_TRACKER_RECONCILIATION_2026-10-17.md).
- [Bounded-library reconciliation](https://github.com/ramkivs/iips-production-market-data/blob/c0e1b5662264651246db1ccde2945eb5e13f3524/evidence/cross-repository/IPD_P11_BOUNDED_LIBRARY_SCOPE_AND_ROW26_RECONCILIATION_2026-10-20.md).

## 2. C-1 through C-9 — satisfied

| Condition | Completed evidence |
|---|---|
| C-1 | Explicit IPD D-06 act published by PR #38 before PR #39. |
| C-2 | Act names both commits, five candidate blobs, five-path scope and exclusions. |
| C-3 | Merge-commit mechanism; both candidate IDs preserved, no squash/rebase/cherry-pick/direct main commit. |
| C-4 | Definitive tree re-derived after the act: `ddb5d246…`; full and focused validation executed on that exact tree, which equals the admission commit's tree. |
| C-5 | Admitted inventory 722 lines, A4/A5 and row-13 annotation preserved. Inventory blob `eb1b6b94058f6cf1b5c2e1e034167dcaed4df099` is the required union, not candidate-parent equality. |
| C-6 | Remote admission commit and PR timestamp verified; both candidates ancestors; all five admitted blobs match the validated tree at admission. |
| C-7 | A6 published by PR #40, reconciling inventory A4/A4.4/A5, candidate publication boundary and row-13 authority wording additively. |
| C-8 | No product E2E, consumer integration, equivalence, qualification, gate, Row 26 or eligibility expansion. |
| C-9 | Admission execution IPD-only; this is the separately authorized, later dated IRR record. No IPD mutation in this pass. |

**Final-main blob distinction:** the executor `a22b3363…`, defaults `66a2debc…`, tests `afc5eb3a…` and bounded-scope record `384cf6a6…` are unchanged between admitted tree and final main. The inventory advances from the admitted union `eb1b6b94…` to **`d00cbb507312188c30f59a1d676b35454429ab16`** solely by appending A6. Verified that final content starts with the complete admitted content. Final main's whole tree is therefore not asserted to equal the admitted tree.

**Live PR #36 metadata correction:** A6 says this review vehicle “remains unmerged.” Live GitHub read-back instead reports **MERGED**, `mergedAt: 2026-10-21T16:45:55Z`, `mergeCommit: 86c76538979f159c478bb5887d1c387f4ef2ddb3`. This is the integration commit contained in PR #39's admission merge, not a separate admission after it. The event occurs two seconds after PR #39's merge. The graph and PR #39 establish the admission mechanism; GitHub's current PR #36 label must not be reported as OPEN/unmerged. Preserve A6 as dated evidence; this overlay reconciles the live metadata without changing IPD or inferring a second admission.

## 3. Validation and limitations

IPD A6 reports freshly executed validation on the exact admitted tree, not recycled candidate results:

- **586/586 tests passed**, 0 failed, cancelled or skipped; 52 files and nonzero-test guard; pre-admission baseline 584/584.
- Focused P11: **8/8 passed**.
- TypeScript (`tsc --noEmit`) and production build: **succeeded**, exit 0; lockfile install succeeded.
- PR #39 CI run `39637530790` and post-merge run [39637705534](https://github.com/ramkivs/iips-production-market-data/actions/runs/39637705534) succeeded. The latter's conclusion and admission SHA were independently read back in this IRR pass.

**Limitations retained:** Ubuntu/POSIX-only validation, no Windows host/operator/browser acceptance; the two new tests were authored alongside the fix, not independent acceptance tests; unit/library-level and behavioural rather than exhaustive coverage. No product-consumer, HTTP, IPD→IRR integration/equivalence or full P15 provider-to-score proof. Authority and admission do not erase these limitations. IPD tests were not rerun here.

## 4. Historical reconciliation and non-effects

The original §16.70 authority record and its receipt remain intact. Their off-main ancestry, preview trees, planned C-7 and “next authorized action” findings describe their earlier baselines, not outstanding execution today. The same applies to §16.65.4 and §16.69.3's earlier admission caveats. The anti-inference rule (acceptance/authorization is not proof of admission) remains permanent; only the state has advanced.

Tracker current banner, §16.70 current-state pointer/addendum, §17 overlay and §19 governance row now record completed admission. Historical banners, CHG rows, authority determination and receipt are retained. No new CV item or status/count change: 35 items, active outstanding 9, 51 §18 rows, 11 §19 rows, 17 XV, 8 stages and 7 work packages.

Row 26 remains `NA` for bounded library scope only. §16.65.3 obligations remain open, including P11-02 replay/recalculation/snapshot/ownership, CSIP_COMPOSITE, mode/governedIntelligenceInputs, UI05, mapping/equivalence and broader P15 lineage. Gate 3 BLOCKED / NOT ACCEPTED; no Gate 4/5 movement, qualification, release, operational eligibility or fence/deferral change.

**No unresolved IRR reconciliation item within this task.** IPD issues #16/#17 were read back OPEN. Their administrative closure is a separate outstanding IPD issue-write-permission task; it is neither implementation reopening nor an IRR reconciliation blocker. No issue-write or IPD modification was attempted.

## 5. IRR validation and publication

Read-only clone verification established final IPD tip, candidate/admission ancestry, exact admitted tree, five-path admission scope, four stable blobs and append-only A6 inventory; clone worktree clean. IRR documentation diff checks preserve historical text, table/matrix shape, counts and boundaries. Ordinary IRR CI supplies client/replay-server typechecks, full guarded tests and production build; its observed results and the final PR/merge/remote blob coordinates are reported after publication, without embedding a future self-referential commit claim.
