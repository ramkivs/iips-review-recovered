# CAP-03 — PA rulings recorded, pass 2 (2026-10-28)

**Repository:** IRR `ramkivs/iips-review-recovered`. **Base:** `d895e547` (PR #353, open, not merged).
**Scope:** records rulings given in the sitting response and the consequences that follow under the existing authority. This record does not change Table 1 status, does not designate any commit, tree, or blob, and does not write to IPD.
**Standing status (unchanged):** P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED.

**Source of rulings.** Each ruling below is the user's answer to a precise question in the sitting response of this session (Arena ask_user, pass 2). Each question and its recommended option is quoted in the Ruling column. Where a ruling rests on a premise, the premise is checked in §3.

---

## 1. Matter A rulings

| Item | Question | Ruling recorded | Adoption | Consequence under existing authority |
|---|---|---|---|---|
| A-Q1 | Is the DR-2 record (IPD `bc144b9`, PR #89, DR-2/DQ-1 Option A) the further act that act §5.1 requires for `portfolio_store.ts`? | **YES** | Recorded ruling | Item 10 is an authorized change. Re-designation of the item-10 blob (observed `540d49f2`, not `4a005b73`) is for the A-Q5 IPD act. IRR does not write the IPD act. |
| A-Q2 | Which blob is designated for `tests/g3_startup_validation.test.ts` (item 12)? | **`edd0305e`** | Recorded ruling | The post-modification blob introduced by `c62dee8`, which act §5.1 row 4 authorizes. `9a5fd9e3` is not designated. Feeds the A-Q5 IPD act. |
| A-Q3 | Is "exhaustive" in act §5.1 repository-wide or workstream-scoped? | **Workstream-scoped** | Recorded ruling | Code paths are limited to the two PA-5 files. The 60 evidence paths and the PR #102 tracker change stay under their own records. |
| A-GAP1 | Which S1 text governs: act §6 row S1, or determination §12.2 ("12/12 resolve as designated")? | **Act §6 row S1 governs** | Recorded ruling | Determination §12.2 is superseded for S1 by pointer. A correction of §12.2 is an IPD action (IPD-S1), to be prepared as a separate IPD prompt. Not performed here. |

**Not ruled in this pass (remain open):** A-Q4 (authorizing record for the two PR #96 paths; candidate `521d5482`), A-Q5 mechanism and target commit (recommended A-O3 at C′ `a891802e`), A-Q6 (see §4).

## 2. S2 rulings

### Q-S2-1 — S2 acceptance (acceptance record `8eee2957`)

- **R-1 prerequisite: NOT ABSOLUTE.** Candidate-scoped acceptance stands and is not reverted to NOT RENDERED. Consequence: R-1 (the operator's 47-entry output) stays an open residual. The 47-entry PASS stays user-reported until the operator supplies the output (acceptance §5).
- **R-2 clearing route: CORROBORATING TRANSCRIPT** (`s2-post-run-pin.txt`). Consequence: the archive-original route is not required for R-2. The deposited copy of `s2-checkout-verification.txt` is unchanged.
- **D1 (open or closed): NOT RULED.** Remains a PA choice (package §5.1).

### Q-S2-2 — Gate 4 S2 Limb A route: **route (c) recorded**

- Route (c): PA designates a Gate 4 commit by separate act, then the native run. The user selected route (c) in the sitting response. The route is recorded. **No commit is designated by this record.**
- Route (c) requires a designation act that names the exact commit, tree, blobs, and purpose. That act has not been given. The operator native S2 run must not start until it has been given and the designated pin is fixed.
- Not chosen: route (a) (not supported by the record, because `001c3c80` is not the Limb A commit); route (b) (requires a designated Gate 4 commit first).

## 3. Premise check on the R-2 ruling (recorded before adoption)

The R-2 recommendation stated that the corroborating transcript's digest reproduces. Checked against the repository on this pass:

| Check | Result |
|---|---|
| `s2-post-run-pin.txt`, deposited blob (LF, 0 CR, 13 lines), SHA-256 | `2a611a7a…` |
| Manifest `SHA256SUMS.txt` line 45 for `s2-post-run-pin.txt` | `84E823AE…` |
| Same bytes with CRLF line endings, SHA-256 | `84e823ae…` (matches manifest) |
| `s2-checkout-verification.txt`, deposited blob (1,427 B), SHA-256 | `0df30bc6…` |
| Manifest `SHA256SUMS.txt` line 22 for `s2-checkout-verification.txt` | `3FD31FE6…` (does not match; carried from the reconciliation record) |

**Conclusion.** The transcript's manifest digest reproduces only when the file is restored to CRLF line endings. The deposited copy was normalized to LF. The R-2 ruling is therefore recorded on the corrected premise: the transcript corroborates the operator's Windows bytes (CRLF form), and the deposited copy is an LF rendering of the same content. The mismatch for `s2-checkout-verification.txt` (`0df30bc6…` deposited vs `3FD31FE6…` recorded) is **not** resolved by this ruling and stays open as an integrity note. Whether the R-2 route stands on the corrected premise is listed as a PA confirmation in §5.

## 4. Consequences and triggers

- **S2-IRRDOC (IRR, eligible):** dated pointer and R-2 status update, with no in-place rewrite of acceptance `8eee2957`. Applied in the same pass (see the commit).
- **S2-ORIG (operator):** not triggered by the R-2 ruling. Re-opens only if PA requires the original bytes.
- **G4-S2 (operator native run):** blocked until a route (c) designation act names the Gate 4 commit, tree, and blobs.
- **A-Q5 (IPD act, separate IPD prompt):** prepared, not performed. Requires the A-Q5 mechanism and target commit to be ruled (see §5).
- **A-Q6 (§8.2 stop):** not cleared by these rulings. Per the recommendation, it clears only when A-Q5 is executed as a fresh designation act.
- **IPD-S1 (IPD prompt):** eligible on A-GAP1 = act row S1 governs. Requires separate IPD authority.

## 5. Explicit PA choices still open

These are listed for the next sitting question only. They are not decided here.

1. **G4 pin designation (route (c) prerequisite).** Commit, tree, blobs, and purpose for the Gate 4 designation act.
2. **A-Q5 mechanism and target commit.** Whether the item 10 and item 12 designations are made by an IPD act at C′ `a891802e` (recommended) or another named commit.
3. **A-Q4.** Whether `521d5482` is the authorizing record for `scripts/verify-public-package.mjs` and `tests/portfolio_ui_package.test.ts`.
4. **R-2 premise.** Whether the corroborating-transcript route stands on the corrected CRLF premise (§3).
5. **D1 status** for Q-S2-1.
6. **PF10, E8 root and parent, D-Q method, ADP-D1, ADP-D2, QP1, B-Q1, G4-PIN** — as recorded in `06-recommendations.tsv`.

---

*Recorded from the user's sitting response. Table 1 unchanged. Register `01-sitting-decision-register.tsv` and its checks are unchanged (a snapshot of the 2026-10-28 sitting packet).*

---

## 6. Rulings recorded in rounds 3 and 4 (2026-10-28, pass 2)

Each is the user's answer to the precise question quoted in the sitting response. Recommended options were offered; the answer shown is the option selected.

| Item | Ruling recorded | Consequence under existing authority |
|---|---|---|
| D1 (Q-S2-1 remainder) | **Open pending operator read-back of host originals** | D1 not closed. Closure needs host-original evidence not in the repository. |
| PASS status (Q-S2-1 remainder) | **User-reported** (until the 47-entry output is supplied) | Consistent with acceptance §5. |
| PF10 (procedure line 147) | **KEEP the GATE_A_PRIME_* wildcard** | No change to line 147. KEEP requires D-INST (successor instrument identity, validation, and A6 before use). |
| D-Q (object and method) | **Object: store parent. Method: D-2, with D-1 as supporting evidence** | Triggers D-INST (new instrument revision, new identity under DB-B1, A6 before use). |
| ADP-D1 (final execution commit) | **Adopt IRR wording**: the P-1 execution commit is the designated B-1 commit `a891802e`; manifest regeneration applies only where Gate 4 §8 applies | Adopted. |
| ADP-D2 (receipt executing identity) | **Accept at `a891802e`, scoped to the P-1 receipt element** | Adopted for the receipt element. P1-F stays blocked by its other conditions. |
| QP1 (F2, F4, F5 literals) | **Approved as rendered in act -02, lines 28, 30, 31** | Approved. The -01 and -02 rows are byte-identical (recorded §3 of the designation record). |
| C-Q1 / C-Q2 | **MC-2**, with A6 confirmed commit-independent as written (blob-keyed raw-byte read) | Host qualification proceeds under its own operator authorization. Commit-keyed observations stay in the attempt session. |
| E7 (DC-C2 scope) | **Confirmed: next capture only** | Later captures still need the native PowerShell 5.1 run. |
| B-Q4 | **Resolved on existing formal text** (formal §4.6 step 5: L2a waits on H-12 at the designated commit) | No new authority. |
| E8 (root and parent) | **Parent: D:** (procedure default). **Root path: NOT YET GIVEN.** | E3 cannot apply the root text until the full path is named. |

**Still open:** the E8 root path (required for E3); the S2 native run and its results (operator); the IPD A-Q5 act and IPD-S1 pointer (IPD, separate authority).
