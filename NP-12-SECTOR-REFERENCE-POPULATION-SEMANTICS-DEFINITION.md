# NP-12 — SECTOR-REFERENCE POPULATION SEMANTICS DEFINITION

**Program:** IIPS v2.0 — NP-12 GOVERNED SCREERER
**Record type:** GOVERNANCE-DEFINITION REPORT (Program Authority decisions)
**Follow-on to:** NP-12 — Sector-Reference Population Identity & Duplicate Semantics Closure
**Date:** 2026-10-01
**Operating mode:** GOVERNANCE-DEFINITION ONLY — NO IMPLEMENTATION

---

## A. Decision Summary

Program Authority has defined all three previously-undefined semantics through decisions K-1 … K-5:

| # | Area | Decision |
| --- | --- | --- |
| **K-1** | Population identity semantics | **MEMBERSHIP-ONLY** — identity of the governed member set |
| **K-2** | Canonical member ordering | **ORDERED BY (normalized sector, reference identifier)** |
| **K-3** | Member identity normalization boundary | **CONFIRMED** — comparison after sector normalization, on `(normalized sector, reference identifier)` |
| **K-4** | Sector canonicalization | **13 CERTIFIED NAMES; case-insensitive + trim; internal whitespace collapsed; aliases REJECTED; unknown/blank REJECTED** |
| **K-5** | Population identity inputs | **MEMBERSHIP ONLY** — members only; no values, no context |

**Authority:** RAMKI — Program Authority. **Scope:** NP-12 — Governed Screer. **Implementation authority: NONE.**

### A.1 Semantic-definition completeness (§H cross-cutting determination)

> **SUFFICIENT.** The three semantics are now defined and mutually consistent. Together they establish a deterministic sector-reference population identity. See §J.

### A.2 Implementation readiness

> **NP-12 remains NOT implementation-ready.**

The semantics are complete; the **implementation is non-conformant in five recorded ways** (§I). Implementation readiness remains a separate authority decision (§N).

---

## B. Repository Baseline and Cleanliness

| Repository | Role | Branch | Exact HEAD | Working tree | Provisioning action | Mutation |
|---|---|---|---|---|---|---|
| `ramkivs/iips-review-recovered` | Primary system of record | `main` | `bfe85a7ecaf690f4ff00f2878714eb594a3536b8` | **CLEAN** — 0 modified, 0 untracked | **None** — authoritative checkout already present | **None** |
| `ramkivs/iips-production-market-data` | Historical/reference lineage only | `arena/01a0f64a-iips-production-market-data` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | **CLEAN** — 0 modified, 0 untracked | **None** — pre-existing protected stale checkout, inspected read-only | **None** |

No IRR ↔ IPD dependency is introduced. No repository mutation is authorized or performed.

---

## C. Protected Prior Decisions

Not reopened. All remain governing.

| Decision | Governed outcome |
|---|---|
| **D.1 Identity level** | **SECTOR-REFERENCE** — a sector-analytics surface, not a company universe |
| **D.2 Member identity** | One member = one **`(sector, reference identifier)`** pair |
| **D.3 Uniqueness** | The pair must be **unique** within an evaluated population |
| **D.4 Duplicate policy** | A repeated pair is a governed violation and must be **REJECTED** |
| **D.5 Population identity** | An evaluated population requires a **stable identity** |
| **D.6 Population stability** | Equivalent member sets represent the **same population** regardless of input ordering |
| **D.7 Sector normalization** | Required for the **sector component**; the opaque reference identifier is not yet governed as requiring normalization |

### C.1 N3-D10 → N3-D15 and prior authority records — unchanged

| Record | Disposition | Status |
|---|---|---|
| N3-D10 | POPULATION CONTRACT INCOMPLETE | **PRESERVED** |
| N3-D11 | IDENTITY / DUPLICATE SEMANTICS INCOMPLETE | **PRESERVED** |
| N3-D12 | DUPLICATE POLICY INCOMPLETE | **PRESERVED** — superseded for the NP-12 sector-reference scope by D.4 |
| N3-D13 | COMPANY IDENTITY DISCRIMINATOR INCOMPLETE | **PRESERVED** |
| N3-D14 | COMPANYID SEMANTICS INCOMPLETE / NO GOVERNED AUTHORITY | **PRESERVED** |
| N3-D15 | IDENTITY LEVEL UNRESOLVED | **PRESERVED** as an evidentiary finding; governance branch committed by the Re-Submission (A) |
| Authority Decision (C) | IDENTITY INTENTIONALLY DEFERRED | **PRESERVED** — superseded |
| Authority Re-Submission (A) | SECTOR-REFERENCE | **PRESERVED** — authoritative product intent |
| Closure report (I-1 … I-6) | Member identity, uniqueness, duplicate, population identity, stability, sector normalization | **PRESERVED** |

---

## D. Semantic Analysis 1 — Population Identity (E)

### D.1 What the repository establishes about candidate identity inputs

| Candidate input | Evidence | Status |
|---|---|---|
| Member identities (`sector`, `companyId`) | Present on every `EngineOutput` / `NormalizedHolding` | **Available** |
| Member values (`conviction`, `confidence`, `quality`, `growth`, `risk`, `valuation`, `capitalEfficiency`, `moat`, `verdict`) | Present on every holding | **Available** |
| Input ordering | `PipelineInput.outputs` is an ordered array | **Available** |
| Caller identity (`portfolioId`) | `PipelineInput.portfolioId`, caller-supplied | **Available** |
| Evaluation context (`scenario`, `strategy`, `topN`, `reportTypes`) | All `PipelineInput` fields | **Available** |
| Evaluation timestamp | **No** timestamp field on `PipelineInput` or `NormalizedHholding` | **ABSENT** |
| Platform snapshot | `snapshotId` / `replayId` carry **zero** `companyId` references | **Not linked to population** |
| Criteria | No criteria field on `PipelineInput` (NP-12 Screening criteria are applied outside this boundary) | **ABSENT from this boundary** |

### D.2 The only existing "identity" — and why it fails

`CrossSectorEvidence.ts:66` constructs `evidenceId = csip-evidence-${portfolioId}`. It is keyed on **`portfolioId` alone**, so three materially different populations — `[Banking-H1, Banking-H1]` (2 members), `[Banking-H1, Insurance-H1]` (2 members, 2 sectors), and `[BK-002, BK-001, BK-005]` (3 members) — **share one evidenceId**. Per §I.3, `evidenceId` is **not** silently reinterpreted as the future population identity.

### D.3 The governed determination (K-1)

> **The identity of an evaluated NP-12 population is the identity of its governed member set: the ordered canonical set of unique `(normalized sector, reference identifier)` pairs.**

Consequences, per §E:

| §E question | Determination |
|---|---|
| 1. What semantic inputs constitute population identity? | **Governed membership only.** |
| 2. Does it depend on member identities? | **YES.** |
| 2. Member values? | **NO.** |
| 2. Ordering? | **NO** — ordering-independent by K-2. |
| 2. Portfolio/caller identity? | **NO.** |
| 2. Evaluation timestamp? | **NO.** |
| 2. Platform snapshot? | **NO.** |
| 2. Criteria? | **NO.** |
| 2. Any other context? | **NO.** |
| 3. Identical member identities, different values — same or different population? | **SAME population.** Values are the *evaluation output*, not the population. |
| 4. Is it an identity of the member set, the evaluated records, or the envelope? | **The member set.** |
| 5. Stable across repeated evaluation? | **YES** — membership is stable; values may vary without changing identity. |
| 6. Stable across different callers supplying the same governed population? | **YES** — caller identity is excluded. |
| 7. What distinguishes materially different populations? | **A different governed member set** — a member added, removed, or changed in `(normalized sector, reference identifier)`. |

### D.4 Why membership-only is internally consistent

The governed uniqueness rule (D.3) plus duplicate rejection (D.4) make the `(normalized sector, reference identifier)` pair a **total discriminator** across the population. Once duplicates are rejected, the member set is fully determined by its member identities — there is nothing left for values to add to *population* identity without conflating the population with its evaluation result.

Per §E, **no hashing algorithm, database key, or digest is designed.** This is the semantic requirement only.

---

## E. Semantic Analysis 2 — Ordering-Independent Canonicalization (F)

### E.1 "Equivalent member sets" — defined (K-2, K-3)

Two member sets are **equivalent** iff, after sector normalization and duplicate rejection, they contain the **same unique `(normalized sector, reference identifier)` members**. Input ordering carries **zero** semantic significance.

### E.2 Answers to the §F questions

| # | §F question | Determination |
|---|---|---|
| 1 | Are members identified exclusively by normalized `(sector, reference identifier)`? | **YES** (K-3 confirms). |
| 2 | Does member ordering have zero semantic significance? | **YES.** |
| 3 | Does the canonical representation sort members? | **YES** (K-2). |
| 4 | What governed ordering key is used? | **`(normalized sector, reference identifier)`** — normalized sector first, then reference identifier. |
| 5 | Sorting based on? | **`(normalized sector, reference identifier)`** — the same discriminator used for uniqueness, not the ranking order. |
| 6 | Are member values included in canonical population identity? | **NO** (K-1, K-5). |
| 7 | Does uniqueness rejection occur before canonicalization? | **YES.** Duplicate `(sector, reference id)` pairs are rejected (D.4); the canonical set is then a **set** of unique members. Canonicalization never has to resolve a duplicate. |
| 8 | Are duplicate populations invalid rather than canonicalized? | **YES.** A population containing a repeated pair is **rejected** as a violation (D.4), not collapsed. |
| 9 | Must serialization of the canonical population be deterministic? | **YES.** Ordering by a total key over a unique member set yields a deterministic sequence. |
| 10 | Does canonicalization alter the semantic population? | **NO.** It provides a **stable representation of the same population**. It does not create, remove, or change members. |

### E.3 The existing ranking order is NOT the canonical order

`RankingEngine.ts:14-17` sorts by **conviction descending, then sector ascending**. That is a **presentation ranking** order — it depends on member *values*, which K-1/K-5 exclude from population identity, and it is therefore **not** a candidate for the canonical population order. Per §F, this is implementation evidence, not the desired rule.

### E.4 What canonicalization makes deterministic

| Output | Before canonicalization | After the governed rule |
|---|---|---|
| Aggregate values (`holdings`, `avgConviction`, `avgQuality`, `avgRisk`) | Already order-insensitive (verified this gate) | Unchanged |
| Sorted sector list | Already order-insensitive | Unchanged |
| Exposure map **values** | Already order-insensitive | Unchanged |
| Exposure map **key order** | Follows input order (artifact) | Deterministic under canonical member order |
| Transport checksum | **Order-sensitive** (`ee02f6fb` vs `ef68f3a7`) | Would become order-sensitive to the **canonical** order, which is stable |

Per §F and §L, **the checksum is not modified and canonical sorting is not implemented.** This defines the semantic rule a future implementation must satisfy.

---

## F. Semantic Analysis 3 — Canonical Sector Normalization (G)

### F.1 The canonical vocabulary — established from two independent governed artifacts

The **13 certified sector display names**:

```
Banking   Insurance   Capital Markets   Healthcare   Hospitality   Energy
Utilities   Consumer   Industrials   Technology   Telecommunications
Automobile   Materials & Metals
```

**Verified this gate:** these 13 names are **identical as a set and in order** in two independent governed artifacts:

| Artifact | Source of authority |
|---|---|
| `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASASE.json` → `sectors[].sector` | Program v1.1 certification baseline (frozen, v1.1.0) |
| `iips-platform/src/integration/EngineRegistry.ts` → `CERTIFIED_ENGINES[].sectorFamily` | Certified-engine registry, whose header states values *"mirror the freeze manifests (IES-006…020) and PROGRAM_v1.1_REPLAY_BASELINE.json v1.1.0"* |

Set equality: **True**. Order equality: **True**. No name present in one and absent from the other.

### F.2 Answers to the §G questions

| # | §G question | Determination |
|---|---|---|
| 1 | What is the canonical sector vocabulary? | The **13 certified sector display names** above. |
| 2 | Are the 13 certified display names the authoritative vocabulary? | **YES** — doubly evidenced (certification baseline + certified-engine registry), identical as a set and in order. |
| 3 | Is matching case-insensitive? | **YES.** |
| 4 | Is surrounding whitespace ignored? | **YES.** |
| 5 | Are internal whitespace differences normalized? | **YES** — internal whitespace collapses to single spaces (e.g. `Capital  Markets` → `Capital Markets`). |
| 6 | Are aliases `IT`, `Chemicals`, `Realty`, `Real Estate` accepted? | **NO — REJECTED.** |
| 7 | If aliases were accepted, what canonical sector? | **Not applicable — rejected.** |
| 8 | Are unknown sector values rejected? | **YES.** |
| 9 | Are empty/blank sector values rejected? | **YES.** |
| 10 | Is normalization performed before member identity comparison? | **YES** (K-3). |
| 11 | Is the normalized sector value used in population identity? | **YES** (K-1, K-3, K-5). |
| 12 | Is the original submitted sector retained as provenance? | **Outside NP-12 semantics** — not decided here. |

### F.3 Why aliases are rejected rather than mapped

Per §G: *"Do not inherit taxonomy behaviour merely because it exists in `TAXONOMA_RESOLVED`."* The existing `TAXONOMA_RESOLVED` is:

| Key | Value |
|---|---|
| `IT` | `IES-015 Technology (sector.technology)` |
| `Chemicals` | `IES-014 Industrials (sector.industrials)` |
| `Realty` | `IES-015 Technology (sector.technology)` |
| `Real Estate` | `IES-015 Technology (sector.technology) — prompt-resolved` |

and it is consumed by `assertNotTaxonomyResolved()` (`EngineRegistry.ts:296-304`), which **throws** on those keys. Three reasons rejection is correct for NP-12:

1. **It is an engine-admission guard, not a population rule.** It throws to prevent creating a *separate engine* for an alias; it does not map a population member to a canonical sector.
2. **It is internally inconsistent and admittedly so.** Its own comment states *"Realty mapping is per prompt directive (even though cross-sector docs list Real Estate separately)"* — and `Realty` and `Real Estate` are **two keys with two different value strings** for the same target. Importing it would import a documented inconsistency into the Screening identity discriminator.
3. **It resolves to engine identifiers, not sector names.** Its values are `IES-015 Technology (sector.technology)` — compound strings, not the canonical sector vocabulary.

Per §G, EngineRegistry admission semantics are **not** assumed to govern Screening population semantics.

### F.4 Where the rule binds

The rule binds at the **Screening population boundary** — before member-identity comparison, uniqueness enforcement, duplicate rejection, and canonicalization. It does **not** bind at engine admission, which remains a separate governed concern (`assertNotTaxonomyResolved` unchanged).

---

## G. Program Authority Decision Matrix (K-1 … K-5)

| # | Decision | Authority | Scope |
|---|---|---|---|
| **K-1** | **Population identity = identity of the governed member set.** Identity inputs: member identities only. **Not** member values, not ordering, not portfolio/caller identity, not evaluation timestamp, not platform snapshot, not criteria. Identical member identities with different values are the **SAME** population. Stable across repeated evaluation and across different callers. | RAMKI | NP-12 |
| **K-2** | **Canonical population representation orders members by `(normalized sector, reference identifier)`** — the governed member discriminator. Input ordering has zero semantic significance. Uniqueness rejection precedes canonicalization; the canonical set is unique. Duplicate populations are **invalid**, not canonicalized. Serialization is deterministic. Canonicalization alters **representation only**, never the semantic population. | RAMKI | NP-12 |
| **K-3** | **Identity comparison occurs AFTER sector normalization, on `(normalized sector, reference identifier)`.** The opaque reference identifier is compared as supplied. | RAMKI | NP-12 |
| **K-4** | **Canonical vocabulary = the 13 certified sector display names.** Matching case-insensitive; surrounding whitespace ignored; internal whitespace collapsed to single spaces. **Aliases REJECTED** (`IT`, `Chemicals`, `Realty`, `Real Estate`). **Unknown sector values REJECTED.** **Empty/blank REJECTED.** Normalization precedes identity comparison; the normalized value is used in population identity. Retention of the original submitted value is **outside NP-12 semantics**. | RAMKI | NP-12 |
| **K-5** | **Population identity includes ONLY governed membership** — not member values, not caller/portfolio identity, not scenario/strategy/criteria, not evaluation timestamp, not platform snapshot. | RAMKI | NP-12 |

---

## H. Explicit Implementation Divergences (§I)

All preserved as **implementation gaps**. None are papered over.

| # | Divergence | Governance requires | Current implementation | Status |
|---|---|---|---|---|
| **I.1** | Duplicate handling | **REJECT** repeated `(sector, reference id)` (D.4) | **RETAINS** all duplicate members; verified across six controlled cases — no throw, no rejection | **NON-CONFORMANT** |
| **I.2** | Uniqueness enforcement | Uniqueness by `(sector, reference id)` (D.3) | **Nothing** enforces or detects it. Case 6 (same sector + same reference id + different conviction, 80 vs 40) retained with **no conflict detected** | **ABSENT** |
| **I.3** | Population identity | Stable identity distinguishing materially different populations (D.5, K-1) | `evidenceId = csip-evidence-${portfolioId}` — keyed on `portfolioId` alone; three materially different populations share one id | **INSUFFICIENT** — not reinterpreted |
| **I.4** | Ordering | Ordering-independent population identity (D.6, K-2) | Transport checksum is **order-sensitive** (`ee02f6fb` vs `ef68f3a7`); exposure-map key order follows input order | **NON-CONFORMANT** — does not change the decision |
| **I.5** | Sector normalization | Canonical sector normalization at the population boundary (D.7, K-4) | **Nothing** normalizes or validates sector at the population boundary. `EngineRegistry` admission semantics are **not** treated as Screening population validation | **ABSENT** |

---

## I. Company-Identity Exclusion

> **NP-12 is sector-reference Screening, not company Screening.**

Preserved explicitly:

- **No** SecurityMaster.
- **No** company resolution.
- **No** company-level duplicate policy.
- **No** company identity registry.
- **No** company identity authority.
- **No** reinterpretation of `companyId`.

The `(sector, reference identifier)` discriminator is a **sector-reference population discriminator**. It is **not** a company identity. `` `${s.sector}-H1}` `` remains an **opaque reference identifier** — assigned a semantic role as half the member discriminator, **not** retroactively governed as an identifier in itself.

---

## J. Cross-Cutting Determination (§H)

> **Are the defined semantics sufficient to establish a deterministic population identity?**

| Component | Governed by | Status |
|---|---|---|
| `normalized sector + opaque reference identifier → unique member` | D.2, D.3, K-3, K-4 | **DEFINED** |
| Duplicate rejection | D.4 | **DEFINED** |
| Order-independent canonical population representation | D.6, K-2 | **DEFINED** |
| Stable population identity derived from governed population semantics | D.5, K-1, K-5 | **DEFINED** |

> **DETERMINATION: SUFFICIENT.**

The four components are defined, mutually consistent, and jointly determine a deterministic sector-reference population identity:

> **Population identity = the canonically ordered, post-rejection set of unique `(normalized sector, reference identifier)` members, where sector is normalized to the 13-name certified vocabulary (case-insensitive, trimmed, internal-whitespace-collapsed; aliases and unknown/blank rejected).**

**No additional semantic decision is required.** No new broad investigation gate is created.

### J.1 The one residual semantic gap — recorded, not invented

K-4 decides the **semantic** normalization rule but does not decide whether the **original submitted sector value** is retained as provenance (§G.12). This is recorded as **outside NP-12 semantics** and is **not** a blocker for population identity — the governed discriminator uses the normalized value only. It becomes relevant only if a separate provenance authority is commissioned, which this gate does not do.

---

## K. Exact Remaining Blockers

| # | Blocker | Type | What is missing |
|---|---|---|---|
| **1** | Duplicate rejection not implemented | **Implementation** | Governance governs REJECT; implementation retains all. Requires implementation authority. |
| **2** | Uniqueness enforcement absent | **Implementation** | Governance requires uniqueness by `(sector, reference id)`; nothing enforces or detects it. Requires implementation authority. |
| **3** | Stable population identity not implemented | **Implementation** | Governance requires it; `evidenceId`/`portfolioId` is insufficient. Requires implementation authority. |
| **4** | Canonical ordering not implemented | **Implementation** | Governance requires `(normalized sector, reference identifier)` ordering; checksum is order-sensitive. Requires implementation authority. |
| **5** | Sector normalization not implemented at the population boundary | **Implementation** | Governance requires the 13-name canonical rule; nothing normalizes at that boundary. Requires implementation authority. |

**All five remaining blockers are implementation gaps. No semantic blocker remains.**

---

## L. Implementation-Readiness Test (§N)

| Required for implementation | Status |
|---|---|
| Member identity | **GOVERNED** — D.2, K-3 |
| Uniqueness discriminator | **GOVERNED** — D.3, K-3 |
| Duplicate policy | **GOVERNED** — D.4 |
| Population identity semantics | **GOVERNED** — D.5, K-1, K-5 |
| Population stability semantics | **GOVERNED** — D.6, K-2 |
| Sector normalization semantics | **GOVERNED** — D.7, K-4 |
| Identity comparison boundary | **GOVERNED** — K-3 |
| Population identity inputs | **GOVERNED** — K-5 |

> **All semantic prerequisites for NP-12 implementation are now governed.**

Per §N, implementation readiness nevertheless **remains a separate authority decision**. This gate does **not** authorize implementation, and declaring readiness is not done here.

---

## M. Acceptance Conditions

| # | Condition | Met |
|---|---|---|
| 1 | Stable population identity semantics explicitly defined | **YES** — K-1, K-5 |
| 2 | Ordering-independent canonicalization semantics explicitly defined | **YES** — K-2 |
| 3 | Sector normalization semantics explicitly defined | **YES** — K-4 |
| 4 | The identity comparison boundary explicitly defined | **YES** — K-3 |
| 5 | The inputs to population identity explicitly defined | **YES** — K-5 |
| 6 | Duplicate rejection remains the governed policy | **YES** — D.4, §H |
| 7 | `(sector + reference identifier)` remains the governed member discriminator | **YES** — D.2, K-3 |
| 8 | Company identity remains explicitly outside NP-12 | **YES** — §I |
| 9 | Existing implementation divergences remain recorded as implementation gaps | **YES** — §H |
| 10 | No implementation authority is granted | **YES** — §N |
| 11 | No additional broad investigation gate is created | **YES** — §N.1 |

---

## N. Recommended Next Gate

> ### NP-12 IMPLEMENTATION READINESS GATE

The single narrow gate remaining, determined solely from the resulting governance state: **all semantic prerequisites are governed; all five remaining blockers are implementation gaps.**

This gate must separately determine whether the defined semantics are sufficiently complete to authorize implementation — reconciling, as §N requires:

* duplicate rejection;
* uniqueness enforcement;
* sector normalization;
* deterministic population representation;
* stable population identity.

It must **not**: reopen any protected decision; introduce company identity; or be conflated with implementation itself. Implementation authority, if granted, must be a **separate** decision following it.

### N.1 Gates not opened

No further semantic-definition gate is created (the three semantics are complete). No broad investigation gate is created. No company-identity gate is created.

---

## O. Non-Actions

This gate did **not**: modify source code; modify tests; modify schemas; implement normalization; implement duplicate rejection; implement canonical sorting; implement population hashing; implement population IDs; alter `evidenceId`; create registries; commit; push; merge; rebase; reset; fetch; or pull. No repository mutation is authorized or performed.

---

## P. Final Repository State

| Repository | Exact HEAD | Branch | Working tree | Mutation |
|---|---|---|---|---|
| `iips-review-recovered` | `bfe85a7ecaf690f4ff00f2878714eb594a3536b8` | `main` | **CLEAN** | **None** |
| `iips-production-market-data` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | `arena/01a0f64a-iips-production-market-data` | **CLEAN** | **None** |

**No provisioning action was required. No repository mutation was performed.**

---

## Q. Final Governance Statement

Program Authority has now defined all three previously-undefined semantics. Population identity is the identity of the governed member set and of nothing else — not member values, not caller identity, not evaluation context. Canonical representation orders members by `(normalized sector, reference identifier)`, the same discriminator that governs uniqueness and rejection. Sector normalization binds to the 13 certified display names, case-insensitively and whitespace-collapsed, with aliases and unknown or blank values rejected rather than mapped. Together these establish a deterministic sector-reference population identity, and no further semantic decision is required.

The semantics are complete. The implementation is not conformant in five recorded ways, and implementing them is not authorized here.

> **NP-12 Sector-Reference Population Semantics Definition establishes the semantic rules required for deterministic sector-reference Screening population identity. It does not implement those rules, does not establish company identity, and does not grant implementation authority.**
