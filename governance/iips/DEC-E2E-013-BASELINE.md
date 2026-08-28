# DEC-E2E-013-BASELINE — E2E-013 Baseline Authority Decision (D1)

- **Record ID:** `DEC-E2E-013-BASELINE`
- **Title:** E2E-013 Baseline Decision — Re-charter Against the Existing IES / Program v3.0 Artifacts
- **Class:** `DECISION` / `AUTHORITY`
- **Status:** `RECORDED — D1(c) AUTHORIZED`
- **Date:** 2026-08-28
- **Authority relationship:** gate `E2E-013 AUTHORITY-ACCEPTANCE GATE`. The maintainer was
  presented with outcomes **A / B / C / D** and explicitly selected **A — authorize D1(c)**.
  Separate and explicit recording authority (record + authority-only commit + push to
  `origin/arena/01a03e3b-iips-review-recovered`) was granted at the same gate. Recording
  authority was **not** inferred from the conversational decision.
- **Scope:** the E2E-013 program baseline question only. It authorizes **no**
  implementation, **no** merge, **no** certification change, **no** matrix amendment and
  **no** reopening of any closed item.

---

## 1. THE QUESTION

The read-only `E2E-013 — REMAINING CAPABILITY / GAP DISCOVERY` gate was chartered to
reconcile an authoritative E2E inventory baseline against live repository state. It
terminated in:

> **STOP — BASELINE / AUTHORITY STATE COULD NOT BE ESTABLISHED**

because the E2E program artifacts named in its charter do not exist in this repository.
D1 was raised to resolve that: what is the program-level reconciliation basis?

## 2. EVIDENCE (re-verified at the acceptance gate, 2026-08-28)

### 2.1 Absence of E2E authority artifacts

`git grep -il` across all five branch refs (`main`, `phase13-next`, `gai-impl-canonical`,
`arena/01a03e3b-iips-review-recovered`, `phase13-hardening-delivery`):

| Token | Files across all refs |
|---|---|
| `E2E-001` | **0** |
| `E2E-013` | **0** |
| `E2E-014` | **0** |
| `E2E-018` | **0** |
| `Parity Matrix` | **0** |
| `E2E-017` | 3 — `governance/iips/AUTH-G-AI-IMPL.md`, `DEC-G-AI-IMPL-B1.md`, `DEC-G-AI-IMPL-CERTIFICATION.md` |
| `Engine Master Matrix` | 3 — the same three files |
| tracked paths containing `e2e` at canonical `85bbd49` | **0** |

The three `E2E-017` / `Engine Master Matrix` occurrences are **prohibition clauses only**:

```
AUTH-G-AI-IMPL.md:103              - Any change to PC-4, N+5, E2E-017, or the Engine Master Matrix
DEC-G-AI-IMPL-B1.md:131            - No change to PC-4, N+5, E2E-017 or the Engine Master Matrix.
DEC-G-AI-IMPL-CERTIFICATION.md:193 | The engine master matrix, PC-4, N+5, E2E-017 | NOT CHANGED |
```

**A prohibition that names an artifact is not evidence the artifact exists.** No E2E
artifact was fabricated, and no IES artifact was renamed to stand in for one.

### 2.2 The authoritative artifacts that DO exist (canonical `85bbd49cd31c215a8fd0e7651b718861944dfe45`)

| Artifact | Blob | Role |
|---|---|---|
| `ROADMAP.md` | `b5485618f8db` | IES-005…IES-020 + CSIP delivery status; "Planned Engineering Standards: None — the sector-engine pipeline is exhausted" |
| `README.md` | `0d759fbdd751` | Names the repository `iips-engineering-standards (recovered as iips-review-recovered)`; declares the 14 published standards implemented, certified, runtime- and UI-integrated |
| `RELEASES.md` | `00fd3b18064c` | Release register |
| **`docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md`** | `4967b0232afc` | **The actual capability matrix.** 14 engines, classification A–F, per-engine implementation link, runtime link, certification evidence, UI surface |
| `governance/RELEASE_CHECKLIST.md` | `4eadb70be3bb` | Promotion procedure |
| `governance/VERSIONING_POLICY.md` | `703043c41e27` | Versioning policy |
| `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` | `63bcd350f2cd` | Frozen certified input baseline, 13 sectors |
| `docs/v3.0/housekeeping-option-a-prune.md` | `22be4071b435` | Recorded controlled prune explaining the absent `ies-005…009` documentation packs |

Implementation surface at canonical: **14** engine directories under
`iips-platform/src/sector-engines/` (13 sector engines + `cross-sector`), **9** `ies-*`
documentation packs, 1000 tracked files, 135 test files.

## 3. D1 OPTIONS AS PRESENTED

| Option | Content | Consequence |
|---|---|---|
| **D1(a)** | Establish a new E2E baseline in this repository: define the missing E2E inventory, artifacts, ownership, scope and authority model | Creates a second program structure alongside the existing IES one; largest scope; requires authoring artifacts whose content is not evidenced anywhere in this repository |
| **D1(b)** | Declare the E2E baseline unavailable / defer: keep E2E-013 blocked until the authoritative E2E repository or artifact store is identified | Honest but inert; leaves D2/D3/D4/D5 open and undecided indefinitely |
| **D1(c)** | **Re-charter E2E-013 against the existing IES / Program v3.0 artifacts**, while separately recording that an external E2E store may exist elsewhere | Uses artifacts that exist, are authoritative and are evidence-backed; unblocks reconciliation; forecloses nothing |

## 4. SELECTED AUTHORITY OUTCOME

# **A — D1(c) AUTHORIZED**

**E2E-013 is re-chartered.** Its program-level reconciliation basis is the existing
**IES / Program v3.0 + CSIP** body of work, under those artifacts' own names and authority.

### 4.1 What this decision does

1. Establishes `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` (`4967b0232afc`),
   `ROADMAP.md` (`b5485618f8db`), `README.md` (`0d759fbdd751`), the `ies-010…020` and
   `iips-cross-sector` packs, the engine/runtime implementation, and
   `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` (`63bcd350f2cd`) as the
   **program-level reconciliation basis** for E2E-013's successor work.
2. **Records separately and explicitly** that an authoritative external E2E repository or
   artifact store **may exist elsewhere**. Its existence is **neither affirmed nor denied**
   by this record; it cannot be determined from inside this repository. If it is later
   identified, this re-charter does not preclude reconciling against it, and D1 may be
   revisited by a further authority decision.
3. Carries forward the E2E-013 findings unaltered (§6).
4. Establishes the successor gate (§7).

### 4.2 What this decision expressly does NOT do

| Prohibited by the acceptance gate | Honouring |
|---|---|
| Fabricate missing E2E artifacts | **NOT DONE** — none created |
| Silently rename existing IES artifacts as E2E artifacts | **NOT DONE** — every artifact is referenced by its own name and path; nothing is relabelled |
| Retroactively create an E2E inventory | **NOT DONE** |
| Amend the Engine Master Matrix | **NOT DONE** — it does not exist in this repository to amend |
| Amend the Integration Verification Matrix | **NOT DONE** — blob `4967b0232afc` untouched |
| Merge AI Advisory | **NOT DONE** — `origin/gai-impl-canonical` unchanged at `f63a9b49` |
| Modify certification | **NOT DONE** — `v3.0-phase12-certified` unchanged; `DEC-G-AI-IMPL-CERTIFICATION` unchanged |
| Reopen P7 | **NOT DONE** |
| Implement anything | **NOT DONE** |
| Decide D2 / D3 / D4 / D5 | **NOT DONE** — each remains an explicit decision for the successor gate |

## 5. RATIONALE

1. **Evidence over assertion.** D1(c) is the only option whose basis can be verified in this
   repository today. D1(a) would require authoring artifacts with no evidentiary source
   here; D1(b) produces no reconciliation at all.
2. **The repository already has a complete program structure.** 14 engines, a functioning
   capability matrix with an A–F classification taxonomy, per-engine certification evidence,
   a frozen replay baseline, phase completion and certification records, and a release
   process. Substituting this for a nonexistent E2E baseline loses nothing and invents
   nothing.
3. **No capability or implementation gap was found.** The E2E-013 discovery identified
   **zero** class-A capability gaps and **zero** class-B implementation gaps. Every finding
   was authority, evidence, reconciliation or parity — all of which are addressable against
   the IES artifacts.
4. **D1(c) forecloses nothing.** It records the possible existence of an external E2E store
   rather than denying it, and it does not bar a later reconciliation against that store.
5. **Cost and risk.** D1(a) would create a parallel governance structure with no evidence
   behind it — precisely the failure mode this program's no-inference rule exists to prevent.

## 6. FINDINGS CARRIED FORWARD (unaltered, and NOT decided here)

| ID | Finding | Evidence | Status after D1 |
|---|---|---|---|
| **D2 — Dangling vocabulary** | `PC-4`, `N+5`, `TRIM-S`, `TRIM-V`, `HARVEST`, `NO-DECISION`, `EXIT` have no authoritative referents in this repository beyond their appearance in governance prohibitions. `PC-4` appears in 4 `governance/iips/` files; `TRIM-S`, `TRIM-V`, `HARVEST`, `NO-DECISION` in 2 each; **0** occurrences at canonical | per-token `git grep` | **OPEN — for the successor gate. Semantics must NOT be inferred.** |
| **D3 — Matrix basis drift** | `INTEGRATION_VERIFICATION_MATRIX.md` states basis `7f6b27d5e28ce3ec96b2b8c7fd00faecbd2445aa`; the tip is `85bbd49cd31c215a8fd0e7651b718861944dfe45`. `7f6b27d5` **is an ancestor**, **35 commits** behind, with **34 files** differing in `iips-platform/src/sector-engines/**` + `frontend/server/executive-transport.ts`. The matrix **content** nonetheless reconciles MATCH on every dimension | `git merge-base --is-ancestor` YES; `git rev-list --count` 35; `git diff --name-only` 34 | **OPEN — for the successor gate.** |
| **D4 — AI Advisory parity** | The certified AI Advisory surface at `f63a9b493118643725568a95b86405a5835a30a0` is not represented in the Integration Verification Matrix and is not merged into `phase13-next` | matrix content vs `git ls-tree origin/gai-impl-canonical` | **OPEN — for the successor gate. Not merged by this decision.** |
| **D5 — IES-016 / IES-017 / IES-020 evidence asymmetry** | 12 tracked files and 3 cited evidence artifacts per pack, versus 46–56 files and 5–7 artifacts for IES-010…015. Class A asserts certification, yet these three lack the independent-verification report and final-readiness certificate the other ten carry | `git ls-tree` counts per `ies-*`; matrix §3 rows | **OPEN — requires an explicit authority/evidence decision before parity is treated as complete.** |
| **P7** | **No P7 artifact exists.** 0 occurrences in tracked non-lockfile files, in `ROADMAP.md`, in the Integration Verification Matrix, and in any governance record predating 2026-08-27. Already recorded in `DEC-G-AI-IMPL-CERTIFICATION` §7 | exhaustive `git grep` | **NOT REOPENED. NOT claimed as PASS. No P7 baseline exists to compare against.** |
| **Pruned IES-005…009 packs** | Absence of those documentation pack directories is explained by `docs/v3.0/housekeeping-option-a-prune.md` (COMPLETE 2026-08-11): durable external archive `iips-historical-reference_20260811_190608.tar.gz` SHA-256 `3880e1390d50245d9c3682c53f13f63cb0c1ed3a977a14c6637501ebd7b8a239`, annotated pre-prune tag `prune-pre-v3-phase12/option-a` on `a838bd5`, and a recorded over-prune correction `f9a78ac` restoring 7 certification-required baseline dirs. **The engines themselves are present** in `iips-platform/src/sector-engines/` | prune record + `git ls-tree` | **NOT a capability gap. Historical, already superseded, non-blocking.** |
| **Live-validation limitation (H/I/J)** | Recorded Option-D limitation in `DEC-G-AI-IMPL-CERTIFICATION` §5. No container runtime, no IdP, no browser | recorded | **OPEN as a recorded limitation. Not self-clearing. Not converted to PASS.** |

## 7. EXACT SUCCESSOR GATE

# **PROGRAM v3.0 / IES CAPABILITY RE-BASELINE AUTHORITY GATE**

**Purpose:** authority decisions only. **Not** an implementation gate. **Not** a
reconciliation-execution gate — it decides how each item is to be treated, and each item
remains a separate explicit decision.

**Agenda — each item must be decided separately:**

1. **D3 — matrix re-baselining.** Re-verify and refresh the stated basis of
   `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` from `7f6b27d5` to a current SHA, or
   record the staleness. Requires its own amendment authority; **not granted by this record**.
2. **D5 — evidence parity requirements.** Accept the IES-016/017/020 evidence depth, require
   the missing independent-verification and final-readiness certificates, or reclassify.
3. **D4 — AI Advisory matrix / merge treatment.** Whether to merge `gai-impl-canonical` @
   `f63a9b49` into `phase13-next`, and whether to add an AI Advisory row to the matrix.
   Requires separate merge authority; **not granted by this record**.
4. **D2 — dangling vocabulary treatment.** Identify the referents of `PC-4`, `N+5`,
   `TRIM-S`, `TRIM-V`, `HARVEST`, `NO-DECISION`, `EXIT`, or record them as inherited
   vocabulary with no referent. **Semantics must not be inferred.**
5. **Any remaining capability / evidence / authority gap** surfaced by re-baselining.

**Reconciliation scope the successor gate must cover** (as directed at this gate):

| # | Surface |
|---|---|
| 1 | `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` |
| 2 | current `ROADMAP.md` |
| 3 | IES-005 through IES-020 capability evidence |
| 4 | CSIP |
| 5 | engine / runtime implementation |
| 6 | UI / product integration |
| 7 | existing certification evidence |
| 8 | AI Advisory certified scope |
| 9 | IES-016 / IES-017 / IES-020 evidence asymmetry |
| 10 | matrix basis SHA |
| 11 | any remaining authority / evidence contradictions |

## 8. STATE AT RECORDING

```
origin/arena/01a03e3b-iips-review-recovered  = 79b043753aef50ea12fac09dd262c3d7b86fe7bc  (parent of this record)
origin/gai-impl-canonical                    = f63a9b493118643725568a95b86405a5835a30a0  UNCHANGED
origin/phase13-next                          = 85bbd49cd31c215a8fd0e7651b718861944dfe45  UNCHANGED
origin/main                                  = c65d53373717aacc3a1dce12d47b5aeaf50541a5  UNCHANGED
origin/phase13-hardening-delivery            = 254e47233e639d089c59f07f394e4a6b46d8970f  UNCHANGED
refs/tags/v3.0-phase12-certified             = a975b0dc5d91422a0fd4b24030fa4905712f82e4  UNCHANGED
```

## 9. STATUS FLAGS

| Item | Status |
|---|---|
| E2E-013 baseline | **RESOLVED — re-chartered against IES / Program v3.0 (D1(c))** |
| External E2E store | **UNRESOLVED — existence neither affirmed nor denied; recorded as possible** |
| Implementation authorized | **NO** |
| Merge authorized | **NO** |
| Matrix amendment authorized | **NO** |
| Certification change authorized | **NO** |
| P7 | **NOT REOPENED — and not claimed as PASS** |
| D2 / D3 / D4 / D5 | **OPEN — deferred to the successor gate, each as a separate decision** |

## 10. CLASSIFICATION

# **D1(c) — AUTHORIZED**

E2E-013's program-level reconciliation basis is the existing IES / Program v3.0 + CSIP
artifact body. No E2E artifact was fabricated, no IES artifact was renamed, no inventory was
retroactively created, and no downstream decision was pre-empted.

**E2E-013 BASELINE DECISION RECORDED — NO IMPLEMENTATION AUTHORIZED.**
