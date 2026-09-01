# DEC-D3-MATRIX-REBASELINE â€” D3 Matrix Re-Baseline Decisions

- **Record ID:** `DEC-D3-MATRIX-REBASELINE`
- **Title:** D3 â€” Matrix Basis Convention, Evidence-Maturity Representation, Regression
  Threshold, AI Advisory Treatment and UI-Surface Column Semantics
- **Class:** `DECISION` / `AUTHORITY`
- **Status:** `RECORDED â€” D3-1â€¦D3-5 DECIDED. MATRIX AMENDMENT NOT AUTHORIZED.`
- **Date:** 2026-08-28
- **Authority relationship:** gate `PROGRAM v3.0 / IES CAPABILITY RE-BASELINE â€” D3 MATRIX
  RE-BASELINE AUTHORITY GATE`. Each decision was presented with options and explicitly
  selected by the maintainer: **D3-1 = B**, **D3-2 = minimal amendment + disposition the
  UI-surface column**, **D3-3 = A**, **D3-4 = defer to D4**. Recording authority (record +
  authority-only commit + push to `origin/arena/01a03e3b-iips-review-recovered`) was granted
  separately and explicitly; it was **not** inferred.
- **Scope:** the decisions only. **This record does NOT authorize modifying
  `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`.** A separate matrix-amendment execution
  gate is required, and none is granted here.

**Provenance:** pre-existing governance record; provenance reconstructed from the authoritative governance record and execution lineage available at the time of D33-C1 amendment. This metadata amendment records provenance only and does not alter the record's substantive decision, authorization, scope, or evidentiary determination.

---

## 1. EVIDENCE ESTABLISHED AT THE D3 DISCOVERY GATE

### 1.1 Matrix identity

| Item | Value |
|---|---|
| Path | `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` |
| Blob at canonical `85bbd49cd31c215a8fd0e7651b718861944dfe45` | `4967b0232afc5e4044951f03d141f4225e435693`, 9,239 bytes |
| Identical at `f63a9b493118643725568a95b86405a5835a30a0`? | **YES** |
| Present in the `arena` governance tree? | **NO** â€” canonical lineage only |
| Stated basis (verbatim, line 4) | *"**Basis:** canonical `phase13-next` @ `7f6b27d5e28ce3ec96b2b8c7fd00faecbd2445aa`"* |

### 1.2 Actual timeline â€” only two commits have ever touched the matrix

| Commit | Timestamp | Subject | Effect |
|---|---|---|---|
| `9a920150e8bdef54dc764282799aa41e8a7d525d` | 2026-08-17 23:19:39 +0530 | `docs: reconcile v3.0 integration status` | **CREATED** |
| `3514d47908afa560d6c733d815452adae8bd9e91` | 2026-08-20 23:32:20 +0530 | `docs: reconcile standards inventory for IES-016/017/020` | **LAST SUBSTANTIVE UPDATE** (+11/âˆ’8) |
| `85bbd49cd31c215a8fd0e7651b718861944dfe45` | 2026-08-25 | `feat: add P-2 notes surface` | canonical tip â€” matrix untouched |

**The matrix does not exist at its own stated basis:**
`git cat-file -e 7f6b27d5â€¦:docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` â†’ *fatal: path
exists on disk, but not in `7f6b27d5â€¦`*. At `7f6b27d5` the strings `IES-016`, `IES-017`,
`IES-020` occur **0** times (the file is absent); at canonical, **2** times each â€” added by
`3514d47`, whose header basis line was never advanced. The header is inaccurate twice over.

### 1.3 Drift

| Measure | Value |
|---|---|
| **Matrix content drift** `3514d47` â†’ `85bbd49` | **ZERO** â€” blob `4967b0232afcâ€¦` identical at both |
| Commits | 13 |
| Files changed, all | 41 |
| Files changed under `iips-platform/` | **0** |
| Files changed under `iips-platform/src/sector-engines/` | **0** |
| Files changed in the engine+transport surface | **1** â€” `frontend/server/executive-transport.ts` |
| Diff lines in that file touching `ENGINE_FACTORY` / `*_ENGINE_ID` / registration | **0** |

### 1.4 Capability claims all reconcile

14 engine directories Â· 13 `sector.*` engine IDs Â· `CrossSectorEngine.ts` present Â·
`ENGINE_FACTORY` = 13 entries Â· `runtime.execute` linkage unchanged Â· v1.1 replay baseline =
13 sectors. **No engine, platform or sector-engine claim is contradicted.**

### 1.5 D5 A1/A2 re-confirmed, 7 / 7

```
A1 (7): IES-010, IES-011, IES-012, IES-013, IES-014, IES-015, CSIP
A2 (7): IES-006.2A, IES-007, IES-008, IES-009, IES-016, IES-017, IES-020
```
Identical to `DEC-D5-EVIDENCE-MATURITY`. The split is insensitive to the regression
threshold for any value 0â€“4, because every A2 member already fails at least one
non-regression limb.

---

## 2. D3-1 â€” BASIS CONVENTION â†’ **OPTION B AUTHORIZED**

**Decision:** the matrix basis is the commit at which the substantive reconciliation was
actually performed â€” **`3514d47908afa560d6c733d815452adae8bd9e91`** â€” with an **explicit
re-verification recorded at canonical `85bbd49cd31c215a8fd0e7651b718861944dfe45`**.

**Authorized wording for the amendment (to be applied at the execution gate):**

> **Basis:** reconciled at `3514d47908afa560d6c733d815452adae8bd9e91` (2026-08-20, *"reconcile
> standards inventory for IES-016/017/020"*); **re-verified unchanged** at
> `85bbd49cd31c215a8fd0e7651b718861944dfe45` (canonical `phase13-next`). Matrix content is
> byte-identical between the two (`4967b0232afcâ€¦`); `0` files changed under
> `iips-platform/`, and `0` diff lines touch engine registration.

**Rationale.** Both halves are backed by a real commit. Option A (basis = `85bbd49`) would
assert a reconciliation *at* `85bbd49` that has no commit behind it â€” repeating the original
defect in the opposite direction. Option C has no third evidenced candidate: the only two
commits that ever touched the matrix are `9a92015` (creation, pre-IES-016/017/020, which
would understate scope) and `3514d47`. Option D would leave the header inaccurate and block
the A1/A2 designations from landing alongside a corrected basis.

**Convention adopted (closes D3-G2):** *"Basis" means the commit at which the reconciliation
was performed. Where the artifact is later re-verified without content change, the
re-verification commit is recorded alongside it, not substituted for it.*

## 3. D3-2 â€” EVIDENCE-MATURITY REPRESENTATION â†’ **MINIMAL AMENDMENT + UI-SURFACE DISPOSITION**

### 3.1 Authorized amendment scope

The **minimum** amendment that represents D5 without redesigning the matrix:

1. **One added column**, `Evidence`, on the existing per-engine table, valued `A1` or `A2`.
   No row restructuring, no new tables, no change to the existing class column or to the
   Aâ€“F class key.
2. **The 7 / 7 designations** exactly as recorded in `DEC-D5-EVIDENCE-MATURITY` (Â§1.5).
3. **One explicit statement** with the classification key: *class **A** is unchanged for all
   14 capabilities; A1/A2 denotes evidence maturity only and does not alter capability
   status.*
4. **Evidence-depth provenance**: cite `DEC-D5-EVIDENCE-MATURITY` as the classification
   source, and name the artifact locations relied on â€” `iips-platform/IES0xx_*`,
   `iips-platform/reports*/`, `ies-0xx-*/IES-0xx_FREEZE_MANIFEST.json`,
   `iips-platform/tests/regression/`.
5. **The D5-S1 note** required by D3-3 (Â§4).
6. **The UI-surface column semantics and Screener determination** required by Â§5.

**Explicitly NOT authorized / not required:** re-deriving the tiers in the matrix,
restating the A1 definition, changing any capability class, altering the Aâ€“F key, or any
change beyond items 1â€“6.

### 3.2 Estimated amendment size

One column across 14 rows Â· two short prose blocks (class-A-unchanged, provenance) Â· one
D5-S1 note Â· one UI-semantics sentence Â· one cell change (Â§5.2). Nothing else.

## 4. D3-3 â€” D5-S1 REGRESSION THRESHOLD â†’ **OPTION A AUTHORIZED**

**Decision:** the A1 limb *"required regression evidence"* remains **explicitly
unquantified**. The matrix amendment must **state that it is unquantified**, citing D5-S1.

**Authorized wording:**

> The A1 limb *"required regression evidence"* has no authorized numeric threshold
> (`DEC-D5-EVIDENCE-MATURITY`, sub-gap **D5-S1**). The A1/A2 assignments above do not depend
> on it: every A2 capability already lacks at least one non-regression artifact, so the
> classification is identical for any regression threshold from 0 to 4.

**Rationale.** No threshold is authorized today. Authorizing one inside a *documentation*
amendment would smuggle a **methodology** change into a documentation change, and no
evidence in the discovery record supports any particular number. Nothing is blocked by
leaving it open, because the classification is provably threshold-insensitive across 0â€“4.
Option C was rejected only because it would leave the unquantified limb invisible to a
reader of the matrix, who might assume it had been evaluated.

**D5-S1 remains OPEN** and is referred to a separate methodology decision.

## 5. D3-5 â€” UI-SURFACE COLUMN SEMANTICS (arising from the discovery, dispositioned here)

### 5.1 The finding

The matrix's UI-surface column is a closed enumeration: `Admin registry + Executive +
Company Intelligence` for the 13 sector rows, `same` / `same (auto-extended universe)` for
most, and `Cross-Sector Intelligence + Executive + Decision Matrix` for CSIP. Since
`3514d47` four feature directories appeared â€” `screener`, `shell`, `notes`, `notifications`.
The matrix mentions `Screener`, `Macro`, `CommandPalette`, `NotesDrawer`,
`NotificationDrawer` **0 times** each.

### 5.2 Determination

**Column semantics adopted:**

> The UI-surface column enumerates the **primary per-engine presentation surfaces** on the
> 13 sector-engine rows. Surfaces that present a **composed cross-sector view** over
> per-sector engine details are recorded on the **CSIP row**, not repeated on each sector
> row.

**Screener belongs on the CSIP row, alongside Decision Matrix.** Evidence:

- `Screener.tsx` header: *"Engine-aware, read-only screening surface over the governed
  company universe. Composes the EXISTING certified Decision Matrix data
  (`fetchDecisionMatrixData`) â€” no new endpoint, no new authority, no persistence, no
  recomputation. Renders governed values 1:1 â€¦ a filter-and-navigate surface, NOT an
  analytics engine."*
- It is navigable and live: `frontend/src/app/navigation.ts:73` â€”
  `{ label: 'Screener', path: '/screener', minRole: 'viewer', status: 'implemented' }`.
- `computeCertifiedDecisionMatrix()` maps over `engineDetails` keyed by `d.sector`,
  producing **one row per sector** with `verdict`, `composite`, `quality` (via the
  `OntologyMapper` governed mapping) and `valuation` (null where the engine exposes no
  valuation pillar) â€” i.e. a **composed cross-sector table**, structurally identical to
  Decision Matrix, which is already recorded on the CSIP row.

**Authorized cell change:** the CSIP row UI-surface cell becomes
`Cross-Sector Intelligence + Executive + Decision Matrix + Screener`. **No change to any of
the 13 sector-engine rows.**

**Correctly excluded, with evidence:**

| Surface | Reason for exclusion |
|---|---|
| Macro (`/research/macro`, `navigation.ts:75`) | MoSPI national-statistics source (`server/macro/mospi-source.ts`) â€” external data, not engine output |
| CommandPalette (`features/shell`) | One client-side filter on a `sector` **string field** (`companies.filter((c) => c.sector.toLowerCase().includes(q))`) â€” not an engine call |
| NotesDrawer (`features/notes`) | 0 engine/sector references |
| NotificationDrawer (`features/notifications`) | 0 engine/sector references |

**No capability claim is created or altered by this determination.** It is a
documentation-semantics decision about which row an existing surface is recorded against.

## 6. D3-4 â€” AI ADVISORY â†’ **DEFERRED ENTIRELY TO D4**

**Decision:** D3 adds **no AI Advisory row and no reserved row**. It adds **one
forward-reference sentence**:

> A certified non-engine **AI Advisory** surface exists at
> `f63a9b493118643725568a95b86405a5835a30a0` on `gai-impl-canonical`
> (`DEC-G-AI-IMPL-CERTIFICATION`). It is not one of the 14 engine capabilities. Its
> treatment in this matrix â€” and whether it is merged into `phase13-next` â€” is decided
> separately under **D4**.

**Rationale.** AI Advisory is not one of the 14 capabilities, so a row for it is a **scope
change**, not a re-baseline. Its correct cell content depends on the merge decision
(citing `gai-impl-canonical` vs `phase13-next`), so reserving a row would pre-empt D4. Its
evidence maturity would be **A2-partial** (criteria Aâ€“F, K, L, M1â€“M3 PASS; H/I/J NOT
PERFORMED under Option D), and recording that here would import a certification statement
into a documentation gate.

**No merge. No `phase13-next` mutation. Neither is authorized by this record.**

---

## 7. DECISIONS SUMMARY

| ID | Question | Decision |
|---|---|---|
| **D3-1** | Basis convention | **B** â€” basis `3514d47908afa560d6c733d815452adae8bd9e91`, with explicit re-verification recorded at `85bbd49cd31c215a8fd0e7651b718861944dfe45`. Convention adopted: "Basis" = the commit reconciled against; a later no-content-change re-verification is recorded alongside, not substituted |
| **D3-2** | Evidence-maturity representation | **Minimal amendment** â€” one `Evidence` column (A1/A2), the 7/7 designations, an explicit "class A unchanged" statement, provenance citation to `DEC-D5-EVIDENCE-MATURITY`; **plus** the UI-surface disposition in Â§5 |
| **D3-3** | D5-S1 regression threshold | **A** â€” remains explicitly unquantified; the amendment must say so and note the classification is threshold-insensitive for 0â€“4. **D5-S1 stays OPEN** |
| **D3-4** | AI Advisory in D3 | **Deferred entirely to D4** â€” forward-reference sentence only; no row, no reserved row |
| **D3-5** | UI-surface column semantics | **Decided** â€” semantics defined; **Screener recorded on the CSIP row** alongside Decision Matrix; the 13 sector rows unchanged; Macro / CommandPalette / Notes / Notifications excluded with evidence |

## 8. WHAT THIS RECORD DOES NOT AUTHORIZE

| Item | Status |
|---|---|
| Modify `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` | **NOT AUTHORIZED** â€” requires a separate matrix-amendment execution gate |
| Modify `ROADMAP.md` or `README.md` | **NOT AUTHORIZED** |
| Create or modify evidence artifacts | **NOT AUTHORIZED** |
| Merge AI Advisory | **NOT AUTHORIZED** |
| Modify `phase13-next` | **NOT AUTHORIZED** |
| Modify any engine | **NOT AUTHORIZED** |
| Restore pruned `ies-005â€¦009` packs | **NOT AUTHORIZED** |
| Reopen P7 | **NOT DONE** â€” and P7 is not claimed as PASS |
| Alter certification | **NOT AUTHORIZED** |
| Promote a version or release | **NOT AUTHORIZED** |
| Authorize a regression threshold | **NOT DONE** â€” D5-S1 remains open |
| Decide D5-S3 (A2 â†’ A1) | **NOT DECIDED** |

## 9. DOWNSTREAM IMPACT

| Item | Impact |
|---|---|
| **D4** | Unblocked and unaffected. D3 adds no AI Advisory row, so D4 retains both decisions (merge, matrix row) intact, and now has a documented forward-reference hook |
| **D2** | Unaffected. Note for D2: `INTEGRATION_VERIFICATION_MATRIX.md` is a **real, existing** artifact, unlike the "Engine Master Matrix" named in the `governance/iips/` prohibitions â€” D2 must not conflate the two |
| **D5-S1** | Remains **OPEN**, now explicitly surfaced in the matrix amendment text |
| **D5-S2** | **CLOSED on execution** of the D3 amendment |
| **D5-S3** | **Sharpened, not resolved.** Once A1/A2 is visible per row, the seven A2 rows become visible standing debt |

## 10. STATE AT RECORDING

```
origin/arena/01a03e3b-iips-review-recovered  = aacff0604585d58ef9927245d0c56b6b7a9df157   (parent of this record)
origin/gai-impl-canonical                    = f63a9b493118643725568a95b86405a5835a30a0   UNCHANGED
origin/phase13-next                          = 85bbd49cd31c215a8fd0e7651b718861944dfe45   UNCHANGED
origin/main                                  = c65d53373717aacc3a1dce12d47b5aeaf50541a5   UNCHANGED
origin/phase13-hardening-delivery            = 254e47233e639d089c59f07f394e4a6b46d8970f   UNCHANGED
refs/tags/v3.0-phase12-certified             = a975b0dc5d91422a0fd4b24030fa4905712f82e4   UNCHANGED
matrix blob at canonical                     = 4967b0232afc5e4044951f03d141f4225e435693   UNCHANGED
ROADMAP.md / README.md at canonical          = b5485618f8db / 0d759fbdd751                  UNCHANGED
```

## 11. EXACT NEXT GATE

**`PROGRAM v3.0 / IES CAPABILITY RE-BASELINE â€” D3 MATRIX-AMENDMENT EXECUTION GATE`.**

Its authority must be explicit and must cover exactly: applying items 1â€“6 of Â§3.1 plus the
Â§5.2 cell change and the Â§6 forward-reference sentence to
`docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`, on the canonical line, as a
documentation-only commit â€” with verification that no capability class, Aâ€“F key, engine
claim, threshold or methodology text is altered.

**No mutation of the matrix was performed by this gate.**

## 12. CLASSIFICATION

# **D3-1â€¦D3-5 DECIDED â€” MATRIX AMENDMENT NOT YET AUTHORIZED**
