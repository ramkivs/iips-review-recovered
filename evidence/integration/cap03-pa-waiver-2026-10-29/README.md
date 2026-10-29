# CAP-03 — PA waiver `PA-W-01` (`H-1`…`H-9`): execution and verification evidence

**Record:** `IIPS-V3-CAP03-H1-H9-BLOCKER-WAIVER-PA-DECISION-2026-10-29-01` (short form `PA-W-01`)
**Repository:** `ramkivs/iips-review-recovered` (IRR). **IRR-only pass.** No IPD file, branch, PR or tracker was written.
**Tracker record:** §16.202 (`CV-CORR-182`, `CHG-2026-10-29-24`, `V1488`–`V1495`)

## 1. What this pass did

Recorded the Program Authority's express, affirmative waiver of the consolidated CAP-03 decision package's operator/host evidence items **H-1 through H-9** as governance, documentary and workflow blockers; classified all nine as **PA-WAIVED — NOT A BLOCKER**; removed them from blocker counts, stop conditions and dependency chains; and reconciled the package's dependent decisions and execution sequence. No fact was upgraded and no gate, admission, authorization, pin, production or durability status moved.

| File | Change |
|---|---|
| `docs/integration/IIPS_v3.0_CAP03_CONSOLIDATED_PA_DECISION_PACKAGE_PROPOSED_2026-10-29.md` | Header ruling block; `PA-W-01` note on §0 item 4; §2 `Q-S2-1`/`E8`/`DC-C2` annotations; dated notes on `PA-06`, `PA-10`, `PA-12`, `PA-13`, `PA-14`; **new §4.1.1** post-waiver sequence; §5 re-titled with a supersession note and **new §5.1** status table; §6 `G4-S2` annotation; §7 coverage row; §8 boundary clause; **new §9** adopted ruling (identity, rationale, effect, non-effect, residuals, dependent decisions, register) |
| `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | `Last Updated` row; **new header status row** for the nine items; dated pointer on the `S2 evidence-publication state` row (`R-1`/`H-2`); dated pointers on §16.199 item 5e and §16.200 row E; **new §16.202** |
| `evidence/integration/cap03-pa-waiver-2026-10-29/check-docs.py` | Documentation-integrity checker (this folder) |

## 2. Documentation-integrity checks

Run from the repository root: `python3 evidence/integration/cap03-pa-waiver-2026-10-29/check-docs.py`.

```
C1 conflict markers: PASS
C2 headings unique: PASS
    tracker sections: 139 (max §16.202); package sections: ['0','1','2','3','4','5','6','7','8','9']
C3 identifiers unique: PASS
    IIPS_v3.0_CAP03_CONSOLIDATED_PA_DECISION_PACKAGE_PROPOSED_2026-10-29.md: 0 irregular table(s) present, 0 pre-existing at HEAD — no new one
    IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md: 8 irregular table(s) present, 8 pre-existing at HEAD — no new one
C4 table cell counts (no new irregular table): PASS
C5 PA identifiers defined: PASS
    24 referenced, 24 defined
C6 H-item mentions annotated: PASS
C7 link targets resolve: PASS
C8 ruling elements present: PASS
C9 adoption claims confined to the ruling: PASS

RESULT: PASS — all documentation-integrity checks clean
```

Notes on the checks, so they are not over-read:

- **C4** is baseline-aware. The tracker contains **8** pre-existing tables whose cell count is irregular (long historical rows using unescaped `|` inside code spans); they are enumerated and were present at `HEAD` before this pass. The check fails only on a **new** irregular table, and this pass adds none. Package tables: 0 irregular.
- **C6** requires every `H-1`…`H-9` mention in the package to sit inside the ruling sections (§4.1.1, §5/§5.1, §9), carry a waiver cue on its own line, or sit in a subsection carrying a `PA-W-01` dated note. It passes on the whole file, which is the mechanical form of "no contradictory statement still requiring the waived evidence".
- **C9** confines adoption claims to §9 and the header block, so no `PA-01`…`PA-18` item can be read as adopted.

## 3. What the checks prove and do not prove

**Proved mechanically:** identifiers are unique and defined once; no conflict markers; no new table breakage; every H-item reference is reconciled; the ruling records ID, date, authority, scope, rationale, exact effect, non-effect, residuals and dependent-decision consequences; every relative link resolves.

**Not claimed:** the checks say nothing about whether a waived item's underlying evidence exists. It does not: see §5.1 of the package and §4 below.

## 4. Facts preserved (not upgraded by the waiver)

`A6` **NOT RUN**; no D-2 effective-access result for the store parent exists; `DC-a`/`DC-b` results absent; `DC-C2` not performed for any capture; root state on `D:` unverified and unverifiable from the repository; the 47-entry `R-1` output is not in the repository and the 2026-10-26 `PASS` remains **user-reported**; the `H-3` digest mismatch (`3FD31FE6…` vs `0df30bc6…`) is **unresolved**; `P-1-C` **NOT ESTABLISHED**; `P-1-D` **NOT VERIFIED FOR THE ATTEMPT**; `H-12` **NOT REGENERATED** and **NOT ADOPTED** at `a891802e`; `S2a` **NOT ADOPTED**; `S2-DEP-A` closed **DEPOSITED — COMPLETE** (tracker §16.194). `H-10` is not waived.

## 5. Boundaries held

Gate A′/P-1 `NOT EXECUTED / UNSPENT / NOT AUTHORIZED`; Gate 5 (`CV-52`) `NOT INITIATED / NOT ADMITTED`; Gate 4 `AUTHORIZED — NOT STARTED`; QE `0/11`; result acceptance `NOT RENDERED`; DQ-4 no freeze; `H-12` not adopted; `WRITE_NOT_AUTHORIZED`; `SESSION_ONLY` / `durable:false`; all twelve `/api/user-portfolios*` `503` pairs; register counts (`35` / `9` / `51×17` / `17` / `8` / `11`); pins; IPD. No host action, no PowerShell, no `A6`, no `P-1-C`/`P-1-D` capture, no `D1` read-back, no S2 repeat run, no `H-12` regeneration, no code or test change, no dependency change.

## 6. Publication

The carrying PR, its exact-head CI result, the merge commit, the post-merge `main` CI run and the post-merge blob read-back are recorded on that PR's page (not self-embedded here, per this repository's convention).
