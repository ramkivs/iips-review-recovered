# IIPS v3.0 — NP-07 Research — ACCEPTANCE AND BASELINE ADMISSION

**Record ID:** NP-07-ACCEPT-01
**Date:** 2026-10-04
**Repository:** `ramkivs/iips-review-recovered` (**IRR**)
**Ref:** `arena/01a0f351-iips-review-recovered`
**Status:** **ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**

> ### **NP-07 RESEARCH — ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**

---

## 1. Acceptance decision

The **NP-07 Research** capability, as qualified by `NP-07-QUAL-01`, is hereby **ACCEPTED INTO
THE ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**.

Acceptance is granted on the basis of a completed qualification, an implementation residing on
authoritative `main`, a regression profile showing no new failures, and explicit authorization by
the holder of feature-baseline membership jurisdiction.

---

## 2. Accepting authority

| Field | Value |
| --- | --- |
| **Accepting Authority** | **Program Authority — Ramki (Ramakrishnan)** |
| **Authority basis** | `NP-13-D0-01.md` (IRR `main`, `docs/integration/`) — **Signer: Ramki (Ramakrishnan), Program Authority; Status: D0 — ESTABLISHED / JURISDICTION DESIGNATED; Ratification: RATIFIED; 2026-10-02.** §1.3 vests **"Feature-baseline DEFINITION + COMPOSITION + MEMBERSHIP"** in the designated holder; §3.9 confirms *"Membership is within jurisdiction (§1.3, J-3) but no membership determination is made by this record"*; §8 establishes the holder (§2.1), the subject matters J-1 / J-2 / **J-3 membership**, and that **each exercise be its own explicit act** (§2.3) |
| **Nature of this act** | An exercise of **J-3 — baseline MEMBERSHIP**, made as its own explicit act |
| **Authorization** | Explicit acceptance authorization granted by Program Authority during `GATE-NP07-ACCEPTANCE-R1`, 2026-10-04 |
| **Decision date** | 2026-10-04 |

### 2.1 Scoping disclosure — NP-07 is not named in `NP-13-D0-01`

Recorded transparently, not asserted away: **`NP-13-D0-01` contains 0 occurrences of `NP-07`.**
Its §4.8 deferred enumeration lists membership determinations for **NP-09, NP-10, NP-11, NP-12,
NP-13 only**.

NP-07 is therefore **not explicitly enumerated** in that record. The grant at §1.3 is over *the
feature baseline's* membership generally rather than over a closed workstream list, so applying
J-3 to NP-07 is a sound reading — and it is recorded as **a reading**, not as an explicit
designation.

### 2.2 Governance disclosure — no dedicated NP-07 governance record exists

Unlike NP-10 (`NP-10-AUTH-01`, `f5a56477ade2d4bf629c7df614c1dd1505901f1f`) and NP-11
(`NP-11-AUTH-01`, `a75b346375e13e3c01a3d41a8bd8ef74567580f3`), **there is no dedicated NP-07
governance / product-contract / persistence-owner designation record** on any ref. The only
NP-07 artifact in the repository is the qualification record.

What does hold, and on what this acceptance rests:

* the NP-07 implementation resides on **authoritative IRR `main`**; and
* the qualification was executed under the explicitly-authorized NP-07 R3 exception
  (IRR `arena/01a0f351`, `docs/integration/`, NP-07 record only).

No instrument prohibits acceptance. This acceptance rests on the membership jurisdiction (§2)
and the `main`-hosted implementation — **not** on a governance record that does not exist.

### 2.3 Execution and provenance

| Role | Actor |
| --- | --- |
| **Acceptance decision (authority)** | Ramki (Ramakrishnan) — Program Authority |
| **Authorization recorded** | `GATE-NP07-ACCEPTANCE-R1` §2, and the authorization election of 2026-10-04 |
| **Investigation, verification, drafting, commit, push** | `arena-agent` — acting under that authorization, not as the authority |

The acceptance decision is **not** attributed to `arena-agent`. The agent holds no feature-baseline
membership jurisdiction and claims none.

---

## 3. Qualification prerequisite

| Field | Value |
| --- | --- |
| **Qualification record** | `NP-07-QUAL-01` — `IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md` |
| **Qualification commits** | `1a0377481069b16257e341519dd8c4e701365f8e` (v1.0) → `45563a257c83cca7576ac2acc4f8bba6da49b21f` (addendum) |
| **Qualification artifact blob** | `6c2be92adc57b8a5b9e5e8183dc7d27ecbb251be` (18,310 bytes) |
| **Qualification result** | **QUALIFIED — NON-PRODUCTION / IRR** |

The qualification record was **remotely verified and re-read** from the authoritative ref prior to
this act. It states, verbatim:

> **"ACCEPTANCE IS NOT GRANTED by this record."** Acceptance requires a separate explicit acceptance act.
> **"CERTIFICATION IS NOT GRANTED by this record."**
> **"PROMOTION IS NOT GRANTED by this record."**
> **"PRODUCTION READINESS IS NOT GRANTED by this record."**

Acceptance is therefore a **new and separate act**, taken here.

---

## 4. Accepted coordinates (exact)

| Coordinate | Value |
| --- | --- |
| **Qualified implementation ref** | IRR **`refs/heads/main`** — **AUTHORITATIVE MAIN** |
| **Qualified implementation commit** | **`ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd`** |
| **Qualification record ref** | IRR `refs/heads/arena/01a0f351-iips-review-recovered` (`45563a25…`) |
| **Non-production scope** | NP-07 Research — Company Intelligence · Cross-Sector Intelligence · Engine Registry |

**NP-07 is a dual-ref capability:** the qualified implementation is on `main`; the qualification
record (and this acceptance record) are on the designated branch.

### 4.1 Implementation surface — blob identity verified

All eight NP-07 surface blobs were re-verified **IDENTICAL** between the qualified baseline
`main@ac8a751c…` and the current `main` tip `14928a21eeeafdeaf1d3959773b238fa38a2c8b8`:

| File | Blob |
| --- | --- |
| `frontend/src/features/company/CompanyIntelligence.tsx` | `116a45221d7388e0173c635ef3e7e55074477df1` |
| `frontend/src/features/company/CompanyIntelligence.test.tsx` | `de4031cec1c8…` |
| `frontend/src/features/cross-sector/CrossSectorIntelligence.tsx` | `d2ebcde14d08e3efcad2458826ace7ccd1a3fa1c` |
| `frontend/src/features/cross-sector/CrossSectorIntelligence.test.tsx` | `51112d7bada4…` |
| `frontend/src/features/engines/EngineRegistry.tsx` | `0ad0af7ee061aaebc8e0215e5e4fb662aed03e52` |
| `frontend/src/features/engines/EngineRegistry.test.tsx` | `01559565a726…` |
| `frontend/src/app/App.tsx` | `ee9222f91bed706ffdf867aee72ba0bee2780622` |
| `frontend/src/app/navigation.ts` | `d37d3363e8e12a313bbec30f754e05d2fd662762` |

**No source or test file was created, modified, or deleted by this acceptance act.**

---

## 5. Accepted scope and Research product boundary

Acceptance covers **exactly the scope qualified by `NP-07-QUAL-01`** — three capabilities, and
nothing beyond them.

| Surface | In scope | Route | Evidence |
| --- | --- | --- | --- |
| **Company Intelligence** | **YES** | `/research/company/:id` (`App.tsx` line 34) | **6/6 passed**, exit 0 |
| **Cross-Sector Intelligence** | **YES** | `/research/cross-sector` (`App.tsx` line 36) | **6/6 passed**, exit 0 |
| **Engine Registry** | **YES** | `/research/engines` (`App.tsx` line 37) | **10/10** = 4/4 (`EngineRegistry.test.tsx`) + 6/6 (`server/engine-transport.test.ts`) |
| **Combined** | — | — | **22/22 passed**, 0 failed, 0 skipped, exit 0 |

**Research product boundary:** the `/research/*` route set. `App.tsx` lines 33–37 on authoritative
`main` are the **complete** `/research` set. No feature is admitted merely because it exists in
the repository.

---

## 6. Excluded Sector Intelligence scope

> **Sector Intelligence (`/research/sector/:id`) is EXCLUDED and is NOT accepted.**

| Field | Value |
| --- | --- |
| **Status** | **Not implemented** |
| **Evidence** | `frontend/src/features/` contains **no sector feature directory** |
| **Route state** | `/research/sector/:id` → `<FeaturePlaceholder surface="Sector" />` (`App.tsx` line 35, current `main`) |
| **Effect of this act** | Sector Intelligence is **not** qualified, **not** accepted, and is **not** brought into scope by this record |

---

## 7. IPD boundary

> ## **NO IPD DEPENDENCY ESTABLISHED**

| Check | Result |
| --- | --- |
| `NP-07` filename hits in IPD | **0** |
| `NP-07` token in IPD `main` content | **0** |
| `EngineRegistry` in IPD | **0** |
| NP-07 qualified blobs present in IPD | **0 / 3 — all absent** |
| IPD implementation files for Company / Cross-Sector | **0** |
| IPD `main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` — **unchanged, unmutated, 0 NP-07 mutations** |

### 7.1 Disclosed documentation discrepancy in `NP-07-QUAL-01` §5

Recorded per the Program Authority ruling of 2026-10-04 (**disclose in this act; leave the
qualification record untouched**).

**Before → Evidence → Correction → Reason**

| | |
| --- | --- |
| **Before** | `NP-07-QUAL-01` §5 table states: `CompanyIntelligence` in IPD = **0**; `CrossSectorIntelligence` in IPD = **0** |
| **Evidence** | On IPD `main` `4d3e1cdc…`, both tokens occur in **9 files each**. All occurrences are **historical / forensic text**. `frontend/src/features/research/ResearchSurface.tsx` states verbatim: *"The six historical Research child routes (ResearchHub / ResearchEvents / SectorIntelligence / MacroContext / CompanyIntelligence / CrossSectorIntelligence) remain **pruned and are NOT restored**."* There is **no** IPD implementation file, **no** shared blob, **no** `NP-07` token, and **no** `EngineRegistry` |
| **Correction** | The two rows are restated here as: **0 IPD implementation files · 0 shared blobs · 0 `NP-07` token · 0 `EngineRegistry`** — with **9 historical-reference occurrences each**, all describing the surfaces as pruned and not restored |
| **Reason** | The rows as written overstate the absence. The **operative conclusion is correct and unchanged**; only the supporting token counts were wrong |

**`NP-07-QUAL-01` is deliberately left unmutated.** No dependency is manufactured. IPD was not
modified.

---

## 8. Evidence basis for acceptance

| # | Evidence | Result |
| --- | --- | --- |
| 1 | Company Intelligence | **6/6 passed**, exit 0 |
| 2 | Cross-Sector Intelligence | **6/6 passed**, exit 0 |
| 3 | Engine Registry — `EngineRegistry.test.tsx` | **4/4 passed**, exit 0 |
| 4 | Engine Registry — `server/engine-transport.test.ts` | **6/6 passed**, exit 0 |
| 5 | All four files combined | **22/22 passed**, 0 failed, 0 skipped, exit 0 |
| 6 | Re-run on the record ref | **22/22 passed**, 0 failed, 0 skipped, exit 0 |
| 7 | Full frontend suite | **272 passed / 2 failed / 25 skipped** (299 total) — 2 failures pre-existing, **not NP-07-induced** |
| 8 | Typecheck | **PASS (exit 0)** |
| 9 | Build | **PASS (exit 0)** |
| 10 | Implementation blob identity | All 8 surface blobs **identical** between `main@ac8a751c…` and current `main@14928a21…` |
| 11 | Commits on `main` after the qualified baseline | **2** — `NP-13-PA-D2-B-REF-BINDING-EVIDENCE-DECISION-01.md`, `NP-13-PA-D2-C-REALIZATION-SEMANTICS-DECISION-01.md`. **Both documentation only; neither touches an NP-07 surface** |
| 12 | Sector Intelligence | Still a placeholder; no sector directory — **exclusion intact** |
| 13 | IPD | Unchanged; **no dependency established** (§7) |
| 14 | Acceptance-state sweep | **0** NP-07 acceptance or promotion acts across all 50 IRR + 32 IPD branches before this record |

### 8.1 The `10/10` figure is a test count, not an engine count

Preserved from the qualification record: *"Engine Registry 10/10"* is the **combined surface +
transport/discovery test population** (`4 + 6 = 10`). It is **not** the number of engines. The
current registry contract returns **13** certified engines
(`engine-transport.test.ts`: `expect(body.engines.length).toBe(13)`). E2E-030's "only 10" refers
to the 10-engine LTS set, not to the registry size.

### 8.2 E2E-030 is corroboration only

`docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` (on `main`) is used **only** as durable
corroboration of the test population. Per the qualification record §6:

> **E2E-030 does not constitute NP-07 product certification.**

This acceptance does not convert E2E-030 into NP-07 certification.

---

## 9. Known limitations

1. **Non-production.** The accepted capability is non-production.
2. **No dedicated NP-07 governance record exists** (§2.2). Acceptance rests on membership
   jurisdiction and the `main`-hosted implementation.
3. **Sector Intelligence is not implemented and remains excluded** (§6).
4. **Dual-ref durability.** Implementation is on `main`; this acceptance record is on
   `arena/01a0f351-iips-review-recovered`.
5. **E2E-030 is corroboration, not certification** (§8.2).
6. **The `10/10` figure is a test count, not an engine count** (§8.1).
7. **Two pre-existing full-suite failures remain open** (`product-transport` taxonomy;
   `pitRuntimeIntegration` IU5R-13). Neither is NP-07-induced; neither is closed by this act.
8. **`NP-07-QUAL-01` §5 carries an unrectified documentation discrepancy**, disclosed at §7.1 by
   Program Authority ruling.
9. **Placement convention unresolved.** Durability conventions **C-1** (`main` authoritative) and
   **C-2** (branch placement) remain **unreconciled** (`NP-13-D0-01` GAP-6). See §11.

---

## 10. Explicit exclusions

The following are **explicitly excluded** from this acceptance:

* **Sector Intelligence** `/research/sector/:id`
* **Production** deployment, production readiness, production release
* **Certification** of any kind — including any reading of E2E-030 as NP-07 certification
* **IPD admission** — no IPD artifact is admitted
* Unrelated Research or product surfaces
* Qualification or acceptance of any capability outside the three named surfaces
* Promotion of the implementation or this acceptance record to `main`
* Closure of GAP-6, G3, or the two pre-existing full-suite failures

---

## 11. Placement decision

| Field | Value |
| --- | --- |
| **Repository** | IRR `ramkivs/iips-review-recovered` |
| **Ref** | `arena/01a0f351-iips-review-recovered` |
| **Convention applied** | **C-2** (branch-now) |
| **Precedent** | `NP-09-PROMO-01`, `NP-10-QUAL-01`, `NP-11-QUAL-01`, `NP-10-ACCEPT-01`, `NP-11-ACCEPT-01` |
| **Authority decision** | Program Authority, 2026-10-04: **branch now; `main` publication deferred as a separate, separately-authorized act** |
| **Disclosed tension** | `NP-13-D0-01` §7.4: *"The authorized path aligns with convention C-1 (`main` as authoritative for publication). It is in tension with convention C-2."* **GAP-6: "Durability conventions C-1 and C-2 are unreconciled."** |

**This record does not resolve GAP-6 and does not claim `main`-authoritative closure.**

> **Publication location: `arena/01a0f351-iips-review-recovered` under the C-2 branch-now decision.**
> **IRR `main` publication is deferred and is not part of this acceptance act.**

---

## 12. Boundary statements (verbatim)

> This acceptance does not constitute certification, production readiness, or production release

> Promotion of the implementation or acceptance record to `main` is not granted by this act

### 12.1 Corollaries

| Distinction | Statement |
| --- | --- |
| **Acceptance ≠ Qualification** | Qualification was granted by `NP-07-QUAL-01`. Acceptance is granted by this record. Separate acts |
| **Acceptance ≠ Certification** | No certification is granted, implied, or delegated; E2E-030 is not NP-07 certification |
| **Acceptance ≠ Production readiness** | Accepted as **non-production** |
| **Acceptance ≠ Promotion** | Neither the implementation nor this record is promoted to `main` by this act |
| **Acceptance ≠ Sector Intelligence inclusion** | Sector Intelligence remains **excluded** |
| **Acceptance ≠ IPD admission** | No IPD artifact is admitted; **no IPD dependency established** |
| **Acceptance ≠ GAP-6 closure** | GAP-6 remains **open** |

---

## 13. Pre-acceptance recheck (all passed)

| # | Check | Result |
| --- | --- | --- |
| 1 | NP-07 qualification remotely verified | **PASS** — `45563a25…`, blob `6c2be92a…`, 18,310 bytes, re-read from remote |
| 2 | Implementation coordinate verified | **PASS** — `main@ac8a751c…`; all 8 surface blobs identical at current `main@14928a21…` |
| 3 | Qualification coordinate verified | **PASS** — `1a037748…` → `45563a25…` |
| 4 | Governance authority verified | **PASS** — Program Authority (Ramki), `NP-13-D0-01` §1.3 / §3.9 / §2.3; no dedicated NP-07 governance record exists (disclosed §2.2); explicit authorization received 2026-10-04 |
| 5 | No existing NP-07 acceptance act | **PASS** — 0 across 50 IRR + 32 IPD branches; target path 404 before publication |
| 6 | No superseding adverse disposition | **PASS** — 0 across all branches |
| 7 | Acceptance scope matches qualification | **PASS** — §5, §6 |
| 8 | IPD admission remains none | **PASS** — §7; §5 table discrepancy disclosed per Program Authority ruling |
| 9 | Sector Intelligence remains excluded | **PASS** — placeholder on `main` line 35; no sector directory |
| 10 | C-2 branch placement applicable | **PASS** — §11 |
| 11 | Intended branch verified | **PASS** — `arena/01a0f351-iips-review-recovered` @ `0d98d12d…` |
| 12 | Worktree clean | **PASS** — 0 tracked modifications, 0 staged |
| 13 | No unrelated modifications | **PASS** — untracked files were prior gate reports only |

---

## 14. Mutation summary of this acceptance act

| Item | Value |
| --- | --- |
| Files added | **1** — this acceptance record |
| Files modified | **0** |
| Source changes | **0** |
| Test changes | **0** |
| Commits | **1** |
| Pushes | **1** |
| Promotions to `main` | **0** |
| IPD changes | **0** |
| Changes to `NP-07-QUAL-01` | **0** (discrepancy disclosed at §7.1 by ruling) |

**This acceptance act carries no implementation change.** The accepted implementation is the
existing commit `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` on `main`. **Nothing under `frontend/`
was touched.**

---

## 15. References

| Ref | Coordinate |
| --- | --- |
| Qualification | `1a0377481069b16257e341519dd8c4e701365f8e` → `45563a257c83cca7576ac2acc4f8bba6da49b21f` — `IIPS_v3.0_NP07_RESEARCH_NON_PRODUCTION_QUALIFICATION.md` (blob `6c2be92adc57b8a5b9e5e8183dc7d27ecbb251be`) |
| Implementation | IRR `main` `ac8a751c3d80bc24f7d9a0a3cf4d4931ab9501bd` |
| Membership jurisdiction | `NP-13-D0-01.md` (IRR `main`) — §1.3, §2.1, §2.3, §3.9, §7.4, GAP-6 |
| Acceptance gate | `GATE-NP07-ACCEPTANCE-R1` |
| IPD reference baseline | `ramkivs/iips-production-market-data` @ `4d3e1cdca3a33da0ec3be8b336b17128108a502c` — reference only, 0 mutations |

---

**End of acceptance record `NP-07-ACCEPT-01`.**
