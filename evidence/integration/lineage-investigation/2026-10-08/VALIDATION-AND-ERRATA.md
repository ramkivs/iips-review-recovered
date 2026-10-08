# VALIDATION AND ERRATA — Capability Lineage Recovery Investigation (2026-10-08)

> **NON-AUTHORITATIVE INVESTIGATION OUTPUT.** This file records an Arena-run validation pass over `CAPABILITY-LINEAGE-RECOVERY-INVESTIGATION.md`. It is not a governance record, not a G0-B closure, not an authorization, not an implementation, and not an architecture decision. Arena output is never authoritative unless verified on the designated remote ref. Nothing here grants authority or establishes runtime route protection.

**Report validated:** `CAPABILITY-LINEAGE-RECOVERY-INVESTIGATION.md` — 52,672 bytes, SHA-256 `dd1daa8f7d79edf12ee25387f66f28d65536d8e0bef009d9f61a352d55895ef3`. The report body is **not edited** by this pass; corrections are recorded in section 3.

**Validation run:** session date 2026-10-08 UTC (2026-10-09 Asia/Calcutta). Read-only against scratch mirrors. No remote was written.

---

## 1. Result

The validation confirmed the report's baseline, ref and commit counts, merge and PR facts, path-universe and deletion figures, route line references, file sizes, and most presence and absence claims on `main` and on the branches the report names.

It found:

- **One material error (E1).** `frontend/server/reports-transport.ts` **is** on IRR `main`, and it is wired from the `/api/reports/` dispatch.
- **One overstatement (E2).** No dedicated Risk engine exists on IRR `main`.
- **One count that does not reproduce (E3).** The IRR `features/reports` pickaxe count is 0, not 7.
- **Two method-statement inconsistencies (E4, E5)** and **one status line (E6)**.

None of these changes the report's disposition (**B — substantially complete, limited gaps**) or its strict-L8 result (**none proven**). The errata below are the corrections to apply when reading the report.

---

## 2. Baseline at validation time

Mirrors: `git clone --mirror` of both repositories into scratch (`/tmp/inv/irr.git`, `/tmp/inv/ipd.git`), refreshed with `git remote update --prune` immediately before validation.

| Item | Value | Method |
|---|---|---|
| IRR `refs/heads/main` | `c19a905d9b7ff6f7faa5c966b59504063f3d45c1` (tree `83a8499f…`) | `ls-remote`; mirror |
| IPD `refs/heads/main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` (tree `db853dc2…`) | `ls-remote`; mirror |
| IPD `arena/01a0e6d9-iips-production-market-data` | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` | mirror |
| IPD `arena/01a0f308-iips-production-market-data` | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` | mirror |
| Ref counts IRR / IPD | heads 70 / 32; PR refs 50 / 6; tags 2 / 4; commits 427 / 618 | pass 4, P4-0a |
| Heads moved since investigation snapshot | IRR 0; IPD 0 | pass 4, P4-0b |
| Session branch on IRR remote | absent at validation | pass 4, P4-15 |

---

## 3. Errata (corrections to the report as read)

### E1 — MATERIAL. Report §B row 4 and §J K3

- **Report says:** row 4 — "No `reports-transport.ts` on main"; K3 — "`reports-transport.ts` absent on M", and P5 "overstated M scope".
- **Verified:** `frontend/server/reports-transport.ts` **is** on IRR `main` as blob `cdee7ed1…`. That blob is identical to the one on `arena/01a0f1b3`. It is wired: `frontend/server/executive-transport.ts` line 778 dispatches `/api/reports/`, and line 781 imports `./reports-transport`. Evidence: pass 2 S9 (blob equality, `SAME blob`) and pass 3 T7 (wiring lines).
- **Correct reading:** the Reports transport is present and wired on `main`. The NP-04 store is off-main (IPD `np04-governed-persistence-windows`). The Reports UI is absent on `main`. NP-06 qualification and its governance records remain on `arena/01a0f1b3` (unmerged). P5 row 3 — "consumer on main; store off-main" — is accurate. K3 should read "consistent; no overstatement".
- **Unchanged:** the "Partial" classification of the Reports API, the off-main store, the UI absence, and the NP-06 authority status.

### E2 — OVERSTATEMENT. Report §A, bullet on Opportunities, Risks, Rankings

- **Report says:** "the engines exist on IRR `main`" for Opportunities, Risks and Rankings.
- **Verified:** `OpportunityEngine.ts` and `RankingEngine.ts` are on `main` (pass 2 S3). **No dedicated Risk engine** exists on `main` (pass 3 T8: zero matching paths). Risk data reaches `main` only as the aggregate `avgRisk` field in `executive-transport.ts` (lines 277, 329, 507; pass 3 T8). Row 7 of §B already says "No dedicated Risk engine" and is correct.
- **Correct reading:** for Risks, only the aggregate field is on `main`. The Intelligence Risks UI exists only on `phase13-next`.

### E3 — COUNT NOT REPRODUCED. Report §G, pickaxe term `features/reports`

- **Report says:** IRR 7, IPD 4.
- **Verified:** IRR **0** (case-insensitive pickaxe across all refs and commits; pass 2 S1 and pass 3 T3). IRR path history for `frontend/src/features/reports` is **0** (pass 3 T3). IPD 4 reproduces.
- **Correct reading:** the IRR count of 7 is **not reproduced** and should be disregarded. The underlying finding — no `features/reports` UI in IRR history — is supported, and is stronger than the count implied.

### E4 — METHOD STATEMENT. Report §G, "pickaxe, case-insensitive"

- **Verified:** the D107 counts in §B row 2 and §G (IRR 0 / IPD 8) reproduce only **case-sensitively** (pass 3 T2). The case-insensitive search returns IRR **2** (commits `c65d533` and `7325aed`) and IPD 14.
- **Explanation:** the two IRR hits are lowercase hexadecimal fragments inside `ies-011-energy/IES-011_FREEZE_MANIFEST.json`. They are false positives. No `D107` token exists in IRR history.
- **Correct reading:** the §G header should say the D107 search was case-sensitive. The conclusion is unchanged.

### E5 — CLARIFICATION, not an error. Report §G term list

- Research Hub (IRR 2 / IPD 23) and Replay Studio (IPD 14) reproduce using the variants `Research ?Hub` and `Replay ?Studio` (pass 3 T1). These correspond to the `ResearchHub` and `ReplayStudio` entries in the report's own term list. Plain two-word searches return fewer hits, which is why pass 2 S1 flagged them. This is stated so that the variant basis is explicit.

### E6 — STATUS LINE. Report header

- **Report says:** "Not published to any repository".
- **Correct reading:** that sentence describes the state before this package was published. Publication is recorded in `MANIFEST.md`, on the session branch only. The report body is preserved byte-for-byte, so its SHA-256 matches the Arena workspace copy. No in-body correction was made, to avoid changing the hash.

---

## 4. Claim-by-claim results

`§B-n` means row n of the §B capability matrix. Verdicts: **PASS** — the mirror value matches the report; **FAIL** — the mirror value contradicts the report (errata reference given); **PASS (quote)** — the quoted text is present in the source at the stated location. Claims not listed in this table are in section 6.

| ID | Report location | Claim | Verdict | Evidence |
|---|---|---|---|---|
| C01 | §0 | IRR main `c19a905d`; IPD main `4d3e1cdc` | PASS | pass 1 V1–V2 |
| C02 | §0 | Refs 122 (IRR) and 42 (IPD); commits 427 and 618 | PASS | pass 4 P4-0a |
| C03 | §0 | Main commits 168 (IRR) and 94 (IPD) | PASS | pass 2 S0 |
| C04 | §0 | Unique trees 72 (IRR) and 33 (IPD) | PASS | pass 2 S0 |
| C05 | §0 | Heads merged/unmerged 51/19 (IRR) and 7/25 (IPD) | PASS | pass 2 S0 |
| C06 | §0 | Ahead-of-main: phase13-next 78, gai-impl-canonical 47, 01a0ddea 102, 01a0e30f 103, 01a0f1b3 28 | PASS | pass 2 S0 |
| C07 | §0 | PRs: IRR 50 all merged; IPD 6 all merged (4 to main, 2 to 01a0e6d9) | PASS | pass 2 PR-state line; pass 4 P4-0c; `raw/*_prs.json` |
| C08 | §0 | Merge commits of PRs #42, #44, #45, #46 are ancestors of IRR main | PASS | pass 3 T6 |
| C09 | §B-1, §G | "Command Center" zero hits in all trees and all commits | PASS | pass 1 V3–V4; pass 2 S1 |
| C10 | §B-2, §G | D107 IRR 0 / IPD 8 | PASS, case-sensitive basis (E4) | pass 3 T2 |
| C11 | §G | Widget IRR 2 / IPD 7; AG-5 IRR 3 / IPD 2; Decision Center IPD 14; Company Workspace IPD 15 | PASS | pass 2 S1 |
| C12 | §G | Research Hub 2 / 23; Replay Studio IPD 14 | PASS, variant basis (E5) | pass 3 T1 |
| C13 | §G | features/reports IRR 7 | **FAIL (E3)** | pass 3 T3 |
| C14 | §G | Path universe IRR 1,620 ever / 1,192 main; IPD 2,537 ever / 319 main | PASS | pass 3 T4 |
| C15 | §G | Deletions across history: 0 IRR, 0 IPD | PASS | pass 3 T5 |
| C16 | §B-4, §J K3 | `reports-transport.ts` absent on IRR main | **FAIL (E1)** | pass 2 S9; pass 3 T7 |
| C17 | §B-4 | `/api/reports/` dispatch on IRR main | PASS | pass 3 T7 |
| C18 | §B-4 | No `features/reports` UI on IRR main or in IRR path history | PASS | pass 2 S2; pass 3 T3 |
| C19 | §B-5, §C | App.tsx line 50 Research placeholder; line 52 `/research/sector/:id` placeholder | PASS | pass 2 S4 |
| C20 | §B-6, §B-14 | App.tsx line 57 `/intelligence/*`; lines 59–61 evidence routes | PASS | pass 2 S4 |
| C21 | §B-6 | Opportunities, Risks and Rankings UI absent on main; present on phase13-next with routes at lines 75–77 | PASS | pass 2 S2; pass 4 P4-1 |
| C22 | §A, §B-7 | "engines exist on IRR main" for Risks | **FAIL (E2)** | pass 3 T8 |
| C23 | §B-6, §B-8 | OpportunityEngine and RankingEngine on IRR main | PASS | pass 2 S3 |
| C24 | §B-9 | ResearchHub.tsx 3,799 B on phase13-next; absent on main | PASS | pass 2 S2; pass 3 T9 |
| C25 | §B-5 | SectorIntelligence.tsx 11,007 B on phase13-next; absent on main | PASS | pass 2 S2; pass 3 T9 |
| C26 | §B-1 | CommandPalette absent on main; "Command palette for power users" in `navigation-model.md` | PASS | pass 2 S2, S5 |
| C27 | §B-1 | CommandPalette 9,504 B on IPD `arena/01a0814b` family | PASS | pass 3 T9 |
| C28 | §B-1, §K8 | IPD main inventory row 7 "PRUNED" | PASS | pass 4 P4-2 |
| C29 | §B-12, §K2 | IPD main `ui01_replay_studio.ts` present; registry authorizes UI01 | PASS | pass 1 V18 |
| C30 | §B-12, §K2 | IPD `01a0d1d3` inventory line 36 "no implementation in any lineage" | PASS (quote) | pass 4 P4-3 |
| C31 | §B-13, §B-14 | Snapshot and Replay service modules on IRR main | PASS | pass 2 S3 |
| C32 | §B-16 | PortfolioIntelligence on IRR main and on IPD tags | PASS | pass 2 S3; pass 1 V17 |
| C33 | §B-17 | BI-07 modules and `bi07-final-certification.json` on IPD main | PASS | pass 2 S7 |
| C34 | §B-18 | ConsumerEngine and calibration files on IRR main (11 paths) | PASS | pass 4 P4-4 |
| C35 | §B-19, §K6 | csipCompanyId UUID absent from all IRR trees | PASS | pass 1 V8a |
| C36 | §B-19, §K6 | D115 release-authority record: `releaseAuthorization` GRANTED; `mappingReleased` NOT_YET_IMPLEMENTED; not activated, registered or loaded; not production-eligible | PASS | pass 1 V9 |
| C37 | §B-19, §F | P3 AG-5 "UNRESOLVED" at lines 44 and 106 | PASS (quote) | pass 1 V6; pass 4 P4-16 |
| C38 | §B-19 | AG-5 comment in `pit_read_service.ts` on `arena/01a0e6d9` | PASS | pass 1 V19 |
| C39 | §B-20, §C | G24 `src/app_identity/service.ts` present at 6828155 on 01a0e6d9 and 01a0f308; absent on IPD main | PASS | pass 1 V7; pass 2 S6; pass 4 P4-0d |
| C40 | §B-20, §C | G24 header: External Identity Mapping; key (issuer+subject) resolves to exactly one; lifecycle PENDING→APPROVED→ACTIVE→RETIRED | PASS (quote) | pass 4 P4-5 |
| C41 | §B-20, §J K5 | `translationBoundary.ts` on IRR main: IRR never supplies, selects or observes `applicationUserId` | PASS (quote) | pass 4 P4-6 |
| C42 | §J K5 | P5 row 12 quotes "governed `(issuer,subject)→applicationUserId`" | PASS (quote) | pass 4 P4-7 |
| C43 | §J K5, §B-20 | D-2 §6 "NO GOVERNED CROSS-REPO IDENTITY MAPPING ESTABLISHED" on IRR main | PASS (quote presence only) | pass 1 V5 |
| C44 | §C | NP-18 authority on `arena/01a0ddea` and `arena/01a0e30f`; absent on main | PASS | pass 1 V13 |
| C45 | §C, §J K7 | D107 record on `arena/01a0a438`; absent on IPD main | PASS | pass 1 V14; pass 2 S6 |
| C46 | §C | Phase 14.1 archive 719,726 bytes and 1,128 entries; no tracked `WorkflowView` on any IRR head | PASS | pass 2 S8; pass 4 P4-14 |
| C47 | §C | Notes and Notifications drawers on phase13-next; PF-2 roster and IdP sync on gai-impl-canonical; absent on main | PASS | pass 2 S2; pass 4 P4-8 |
| C48 | §C | E2E-018 screenshots on phase13-next | PASS (19 PNG files) | pass 4 P4-9 |
| C49 | §C | NP-06 final qualification and governance decisions on `arena/01a0f1b3`; absent on main | PASS | pass 4 P4-10 |
| C50 | §C | G3 tenant-membership and tenant-directory governance docs on `arena/01a0f1b3` (4 files); none on main | PASS | pass 4 P4-11 |
| C51 | §B-4 | D-3 "Governed Reports ACCEPTED at qualified branch scope" recorded on IRR main | PASS (quote) | pass 4 P4-12 |
| C52 | §B-6, §B-7, §B-8, §J K1 | IPD main inventory row 38 "none (never built)"; rows 39–40 "NEVER IMPLEMENTED" | PASS (quote) | pass 4 P4-13 |
| C53 | §0 | Session branch absent on IRR remote at snapshot | PASS at validation | pass 4 P4-15 |

---

## 5. Notes on the validation scripts (not report errors)

- **Pass 1 V16** was labelled "(unexpected) on main" for `reports-transport.ts`. That label assumed absence. The printed result is the true state (present). It is resolved by pass 2 S9 and pass 3 T7 (see E1).
- **Pass 1 V21** is a heading probe, not a claim test.
- **Pass 2 S3** contains two guessed paths, `frontend/src/features/research/CompanyIntelligence.tsx` and `frontend/src/features/intelligence/DecisionMatrix.tsx`. The report cites `features/company/CompanyIntelligence.tsx` (present, pass 2 S3). The report gives no file path for DecisionMatrix.
- **Pass 2 S6** listed `src/identity/mapping_store.ts` in the absence list by mistake. The file is present on IPD main (pass 2 S7).
- **Pass 2 S1** FAIL lines: Replay Studio and Research Hub are term-variant differences (E5); D107 is a case-basis difference (E4); features/reports is E3. Pass 2 therefore prints 65 PASS and 7 FAIL lines, of which 4 are §G items (E3–E5), 2 are the guessed paths above, and 1 is the S6 script error.
- **Verdict method.** Pass 2 prints automated PASS/FAIL against the report's numbers. Passes 1, 3 and 4 print raw values, and their verdicts in section 4 were made by comparing those values with the report text. Each verdict can be re-checked from the logs.

---

## 6. Not verified in this pass — remains as the report states (UNPROVEN here)

- **Governance-record text.** NP-18 B-1, B-2 and B-3 status; EVID-NP-18 runtime PASS; NP-06 qualification wording; PF-2 TD-4 and TD-8a. Only presence and location were checked.
- **D115 contents** beyond the release-authority fields in C36 (proposal, allocation register, designation packet).
- **D-2 beyond §6.** §3.3 and §5–§8 were not re-read. They are reserved for the Phase B reconciliation, which has not begun.
- **Test counts.** G24 84/84 and suite 782/0 are cited from records. They were not re-run.
- **§G blob-level counts** (IRR 601; IPD 2,441). The report does not define the set, so they were not recomputed.
- **CAPABILITY-EVIDENCE classification "D"** on `arena/01a10cce`, which was not re-read.
- **`CrossSectorEngine.ts` divergence** between `main` and `phase13-next` (report U12). Not diffed.
- **`gai-impl-canonical`** commit classification (U13). PR bodies. Binary artifacts (PNG content, non-main xlsx and docx).
- **Runtime behaviour.** No tests were run, no service was started, and no route was rendered. Production, live Dhan and live OIDC are out of scope.

---

## 7. Authority and scope statement

- This validation is read-only. No remote was written. The only change to the authoritative worktree is the addition of this evidence folder on the session branch.
- Nothing here grants implementation authority, promotion, G0-B closure, or governance authority. Nothing here establishes runtime route protection.
- Windows-domain records (for example IPD `np04-governed-persistence-windows` and `windows/*` refs) were read as Git content only. They are not runtime evidence. No Windows evidence is included in this package.
- The application is a single-user personal non-production application. Nothing here introduces multi-user or enterprise architecture.

---

## 8. Reproduction

- Scripts: `supporting/validation/pass1-validate.sh` … `pass4-validate.sh`.
- Captured outputs: `supporting/validation/pass1-output.txt` … `pass4-output.txt`.
- The scripts expect scratch mirrors at `/tmp/inv/irr.git` and `/tmp/inv/ipd.git`, created with `git clone --mirror` of `ramkivs/iips-review-recovered` and `ramkivs/iips-production-market-data`, and refreshed with `git remote update --prune`.
- Method scripts used to produce `supporting/raw/`: `supporting/method/`.
- Pass 4 includes an `ls-remote` call (P4-15). Its output depends on the time it is run.
