# NP-18 — Windows Execution Deliverable

**Target:** branch `phase13-next` @ `1a602d849cc47331d4f61cc366ed0a343f80e287`
**Governing R-2 authority:** `abac36b2f0d1d3ac7f8aa9c16d471b634e166d1a`

This directory is a **delivery artifact**. It is not product source, not a governance record,
and not an authority act. It exists so the operator can obtain the NP-18 implementation script
from a durable, permanent URL instead of a sandbox preview that is destroyed every turn.

---

## Status — read before using

```text
NP-18                      : OPEN / COMMISSIONING
DURABLE                    : NO
QUALIFIED                  : NOT PERFORMED
RELEASE                    : NOT AUTHORIZED
PRODUCTION ACTIVE          : NO
phase13-next               : UNMOVED at 1a602d84… , untouched by this artifact
```

The script performs the mutation on your Windows checkout and then **stops**. It does **not**
commit and does **not** push.

---

## Files

| File | What it is |
|---|---|
| `NP18-Phase13Next-Implement.ps1` | **Revision 3**, CRLF-corrected. The script to run. |
| `NP18-W2-ANCHOR-FORENSICS.md` | Root-cause analysis of the failed Windows run. |
| `SHA256SUMS.txt` | Integrity manifest. |

---

## Revision 3 — what changed and why

Revision 2 failed on Windows at the first existing-file mutation:

```text
FAIL: frontend/src/app/App.tsx :: import ROUTES
anchor ABSENT
```

**Root cause: line endings, not bad anchors.** The repository has **no `.gitattributes`** and
`core.autocrlf` is unset, so Git for Windows' `autocrlf=true` default applies and the working
tree is checked out with **CRLF** — while every anchor in the script was authored with **LF**.

All 16 anchor *contents* were already correct: each occurs exactly once in the baseline.
14 of 16 failed to match a CRLF file purely because they cross a line boundary; the only 2
that matched are the 2 single-line anchors, which contain no embedded newline.

The blob gate passed while the anchor gate failed because `git hash-object` applies the clean
filter (normalising CRLF → LF before hashing) and therefore still equals the committed LF blob,
whereas a raw ordinal substring search performs no normalisation.

**The fix:** every file read is normalised CRLF → LF before any comparison, and the comparator
normalises again as a second line of defence. Reading is now regime-independent — the script
produces byte-identical committed content whether the checkout is LF or CRLF.

Also added in revision 3:

- **`Assert-LineEndings`** — prints a census of the six targets before any mutation and
  **refuses** a BOM or mixed line endings.
- **`Get-AnchorDiagnostic`** — on failure prints the file's actual CRLF/LF census and whether
  the anchor's first line is present at all, so a residual cause cannot hide behind a bare
  `anchor ABSENT`.

---

## How to run

Copy the script into the operator checkout root and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\NP18-Phase13Next-Implement.ps1
```

`-RepoRoot` defaults to `$PSScriptRoot`; override explicitly if needed:
`.\NP18-Phase13Next-Implement.ps1 -RepoRoot 'G:\IIPS-Review-Recovered-NP18'`

**Requirements:** Windows PowerShell 5.1+ · `git` on PATH · `node` / `npm` on PATH.

**Verify integrity first:**

```powershell
Get-FileHash .\NP18-Phase13Next-Implement.ps1 -Algorithm SHA256
# compare against SHA256SUMS.txt
```

---

## What the script does

1. Repository identity — `origin` must be `ramkivs/iips-review-recovered`.
2. Branch must be `phase13-next`; `HEAD` must be exactly `1a602d84…`.
3. Remote `phase13-next` (via `git ls-remote`) must equal the same SHA.
4. Worktree must be clean before mutation.
5. All six modification targets exist **and** match their baseline blobs.
6. **Line-ending census** of the six targets; refuses BOM or mixed endings.
7. All six new targets absent; eight forbidden paths verified unchanged.
8. `node_modules` ensured (`npm ci` **before** any mutation).
9. Six new files created; six existing files modified via 16 exactly-once anchors.
10. Boundary asserted: **exactly** the authorized 12 paths changed, 0 unauthorized.
11. Validation: targeted NP-18 tests → typecheck → typecheck:server → full suite → build.
12. Boundary and forbidden paths re-verified after validation.
13. **No commit. No push.**

---

## Baseline pins

```text
BASELINE      = 1a602d849cc47331d4f61cc366ed0a343f80e287
R-2 AUTHORITY = abac36b2f0d1d3ac7f8aa9c16d471b634e166d1a
R-2 PARENT    = d44c5c7a   (original NP-18 authority act)
```

| Modification target | Size | Blob @ baseline |
|---|---|---|
| `frontend/src/app/App.tsx` | 4,864 B | `15e638ed5b6f9448fcbb4b787783acd252fe0094` |
| `frontend/src/app/navigation.ts` | 6,542 B | `03fcf14d7db9f3dc1c75c8a08efec54d4ee2d4c2` |
| `frontend/src/features/intelligence/IntelligenceHub.tsx` | 5,847 B | `25e215a40503108bb5821e92fd5f1582e9715cb1` |
| `frontend/src/app/navigation.test.ts` | 9,688 B | `41e4b06cebf634f68136b649965a37c58689a10a` |
| `frontend/src/app/Sidebar.test.tsx` | 5,973 B | `71c450b86f64718f51cd14be713595d63bd5c08c` |
| `frontend/src/features/intelligence/IntelligenceHub.test.tsx` | 8,467 B | `75458a96e02949f7d3b75be0fce2069436acf5c4` |

**Forbidden paths:** `routes.ts` · `api/crossSector.ts` · `server/executive-transport.ts` ·
`server/admin-transport.ts` · `app/Sidebar.tsx` · `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` ·
`api/macro.ts` · `features/research/MacroContext.tsx`

---

## D-1a as implemented

| View | Framing | Source (existing, 1:1) |
|---|---|---|
| Opportunities | Discovery / Action | `CrossSectorData.opportunity` |
| Risks | Portfolio Risk | `portfolio.avgRisk`, `diversification.flags`, `correlation.flags`, `correlation.concentrationSectors` |
| Rankings | Ordered Comparison | `CrossSectorData.ranking` |

All three call the existing `fetchCrossSectorData()` against the existing guarded
`/api/cross-sector` path. The governed read path and its `87f8b59` hardening are reused exactly
as they are — not re-created, widened or altered.

- **Opportunities** states verbatim that its rows are the **top-N subset of the same
  `RankedOpportunity[]`** the Rankings view renders in full — not an independent dataset.
- **Risks** renders **only** the four authorized aggregates. No per-company risk, no per-sector
  risk, no derived or reclassified risk.
- **Rankings** renders the certified slice in certified order and **never re-sorts**.

No new DTO · no new endpoint · no persistence · no provider · no fixture change.
Certified order preserved verbatim · `null` → `"unavailable"`, never `0` ·
provenance `SNAPSHOT` intact, never fabricated as LIVE.

---

## Verification performed on revision 3

```text
dual-regime dry-run (autocrlf=true clone, LF vs CRLF targets)
    anchors 16/16 in BOTH regimes · 12/12 output hashes identical · 0 CRLF in output
typecheck frontend / server : CLEAN / CLEAN
targeted NP-18 tests        : 6 files, 71 passed
FULL SUITE                  : 54 passed | 5 skipped · 677 passed | 32 skipped | 0 failed
BUILD                       : PASS
changed paths               : exactly 12
```

**Limitation, stated plainly:** no PowerShell host exists in the derivation environment, so the
script has **not** been executed as Windows PowerShell. Verification is byte-level simulation of
its exact emission plus a real test/build run of the emitted tree. Actual PowerShell execution
closes only on the next Windows run.
