# DEC-A2-A1-TIER3-GATE2-IVM-TRANSITION — 2026-09-05

- **Record ID:** `DEC-A2-A1-TIER3-GATE2-IVM-TRANSITION`
- **Class:** EXECUTION RECORD — **Gate 2 (C1) IVM A2→A1 transition**; the final mutation authorized by `DEC-A2-A1-TIER3-COMPOSITE-CLOSURE-AUTHORITY` (`73fb9183704ad983595051ed894c92370fd45265`)
- **Date:** 2026-09-05
- **Pre-gate product HEAD:** `c2dda91de8bd362d4766ed19d777a80e6976c9b5` (`phase13-next`, clean, remote identical)
- **New product HEAD:** `d1f8bf0da268f0eb85ff4222778edeba368b8346` (parent exactly `c2dda91de8bd362d4766ed19d777a80e6976c9b5`; branch `phase13-next`; worktree clean; remote identical after push)
- **Gate-1 certification record:** `b711e4c4531ed5cff71c9cfbcb6beba0af7a179a` (`DEC-A2-A1-TIER3-GATE1-CERTIFICATION-DETERMINATION-2026-09-05.md`, SHA-256 `64288c01d761cf560a938194016a08de4e0c44bfaf549e3c4b91a1a94cf9c219`) — D1 PASS ×3, certificates `IES-016-A1-2026-09-05` / `IES-017-A1-2026-09-05` / `IES-020-A1-2026-09-05`
- **Governance parent:** `b711e4c4531ed5cff71c9cfbcb6beba0af7a179a`

## 1. Executed mutation — exactly the C1-authorized transition

**File:** `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` (sole file touched; product commit `d1f8bf0da268f0eb85ff4222778edeba368b8346`; `1 file changed, 3 insertions(+), 3 deletions(-)`).

| Engine | IVM row (sector) | Before | After |
|---|---|---|---|
| IES-016 | `sector.telecommunications` | **A / A2** | **A / A1** |
| IES-017 | `sector.automobile` | **A / A2** | **A / A1** |
| IES-020 | `sector.materials-metals` | **A / A2** | **A / A1** |

Diff-purity verified programmatically before commit: exactly 3 changed lines, each a pure `**A2**`→`**A1**` single-cell substitution; no other change of any kind. Post-state verified: the three rows read `**A** | **A1**`; unrelated A2 rows (banking, insurance, capital-markets, healthcare) intact (4 cells, unchanged); engine IDs, implementation paths, calibration/expected-output blobs, methodology, scoring, rankings, frozen manifests, replay evidence, D7 parity evidence, D36 and E2E-018 all untouched (single-file delta). The §3.1 narrative classification counts (historical D5 population text) were intentionally left verbatim — updating them is outside the three-cell authorization.

## 2. Sequence compliance

Gate 1 preceded Gate 2: certification determination + maintainer issuance ×3 (`b711e4c4`) → this IVM transition for exactly the three certified engines. No IVM mutation occurred before certification determination (verified in Gate 1 and re-verified here).

## 3. D7 qualification inheritance (preserved verbatim)

`D7-TIER3-PARITY = SATISFIED WITH RECORDED QUALIFICATIONS`; Q5 = OUTSIDE CERTIFICATION CRITERION; DF-1 = NON-BLOCKING; 33/33 = NON-BLOCKING; IES-020 §28 Q1/Q2/Q3/Q5 = OUTSIDE, Q4 = NON-BLOCKING; IES-017 stale-pack = NON-BLOCKING; raw-pipe = NO EFFECT ON PARITY. **`D7-TIER3-INDEPENDENCE` remains OPEN / NEGATIVE — no independence claim is made or implied by the A1 sub-classification.** A1/A2 denotes evidence maturity only (DEC-D5); Class A capability status is unchanged.

## 4. Boundaries

Production/promotion/release: **NOT AUTHORIZED** (nothing granted). P3: not exercised, no authority created. No methodology, scoring, ranking, D36, E2E-018, live/UI-parity, or certification-scope change. No historical (main-lineage) authority revived, imported, merged, or cherry-picked; the transition was performed only on the phase13-next object.

## 5. Protected-ref integrity proof

Advertisement delta across this gate = exactly one ref: `refs/heads/phase13-next` `c2dda91d…` → `d1f8bf0d…` (fast-forward). All other heads/tags unchanged, including governance `arena/01a03e3b…` (advanced separately below by this record's commit only) and tags `program-v1.2.0`, `v3.0-phase12-certified`, `program-v1.1.0`-family.

## 6. Authority expiry

With Gate-2 execution complete and durably recorded herein, the composite A2→A1 closure authority (`73fb9183…`) is **EXPIRED / FULLY CONSUMED** per its own terms. **No further mutation, certification, transition, promotion, release, or P3 authority exists.** Any further act requires a new explicit authority instrument.

## 7. Append-only delta

This record is the sole staged governance delta: **1 added / 0 modified / 0 deleted**; parent `b711e4c4…`; no prior governance artifact modified.
