# NP-12 — IMPLEMENTATION READINESS GATE

**Program:** IIPS v2.0 — NP-12 GOVERNED SCREERER
**Record type:** READINESS ASSESSMENT (READ-ONLY — NO IMPLEMENTATION)
**Follow-on to:** NP-12 — Sector-Reference Population Semantics Definition
**Date:** 2026-10-01
**Operating mode:** READINESS DETERMINATION ONLY

---

## A. Readiness Determination

> ### NOT READY — IMPLEMENTATION GAP ONLY

All eight governed semantic requirements are fully specified and mutually consistent. None is currently implemented. Five gaps exist, and **all five are implementable within existing architecture** (classification 2). No architectural governance decision is required.

**This gate grants NO implementation authority.**

---

## B. Environment Status and Repository Verification

### B.1 Environment at entry

`/home/user/iips-review-recovered` was **absent** from the workspace (carried over from the prior gate's finding).

### B.2 Restoration action — explicitly recorded

Per §D, restoration was performed **only to establish the readiness-verification environment**:

| Attribute | Record |
|---|---|
| Action | `git clone --no-checkout --depth 1` from `https://github.com/ramkivs/iips-review-recovered.git`, then `git checkout --detach bfe85a7ecaf690f4ff00f2878714eb594a3536b8` to materialise the working tree |
| Purpose | **Verification environment only** — explicitly authorised by §D |
| Content mutability | **Read-only with respect to repository content.** No source file, schema, test, fixture, or governance artifact was edited, added, or deleted |
| Pinning | **Pinned to the previously established baseline** `bfe85a7ecaf690f4ff00f2878714eb594a3536b8`, confirmed against `git ls-remote` before checkout |
| Authoritative repository state | **Unchanged.** No push, no commit, no branch creation, no tag, no reset, no fetch/pull into an existing repo, no rebase, no merge. The clone is a new local checkout of an existing public commit |
| Recorded | **Yes** — this section is the explicit record required by §D |

### B.3 IRR repository — verified

| Item | Value |
|---|---|
| Path | `/home/user/iips-review-recovered` |
| Remote | `https://github.com/ramkivs/iips-review-recovered.git` |
| Verified HEAD | **`bfe85a7ecaf690f4ff00f2878714eb594a3536b8`** |
| Matches previously established baseline | **YES** — exact |
| Matches authoritative remote (`git ls-remote` HEAD/main) | **YES** — exact |
| Detached at pinned commit | **YES** — `## HEAD (no branch)` |
| Working tree | **CLEAN** — **0** modified, **0** untracked |
| Working tree materialised | **YES** — full source tree present (verified: `OntologyMapper.ts`, `CrossSectorEngine.ts`, `CrossSectorEvidence.ts`, `RankingEngine.ts`, `PortfolioIntelligence.ts`, `executive-transport.ts`, `EngineRegistry.ts`, `PROGRAM_v1.1_REPLAY_BASELINE.json`) |

**Current IRR verification is therefore live and evidenced, not inherited.**

### B.4 Protected IPD lineage — untouched

| Item | Value |
|---|---|
| Path | `/home/user/iips-production-market-data` |
| Branch | `arena/01a0f64a-iips-production-market-data` |
| HEAD | **`4d3e1cdca3a33da0ec3be8b336b17128108a502c`** |
| Working tree | **CLEAN** — 0 modified, 0 untracked |
| Mutation | **NONE.** Not read into for this assessment; not substituted for IRR |

No IRR ↔ IPD dependency is introduced. IPD was **not** used as current authority at any point.

---

## C. Protected Governed Contract

Not reopened. Governing throughout.

| # | Requirement | Governed semantics |
|---|---|---|
| **E.1** | Identity level | **SECTOR-REFERENCE** — sector-analytics surface, not a company universe |
| **E.2** | Member identity | One member = `(normalized sector, reference identifier)` |
| **E.3** | Uniqueness | The composite pair must be **unique** within an evaluated population |
| **E.4** | Duplicate policy | Repeated `(normalized sector, reference identifier)` → **REJECTED** |
| **E.5** | Population identity | **MEMBERSHIP ONLY.** Member values are not identity. Caller/portfolioId, scenario, strategy, criteria, timestamp, snapshot context, and other evaluation context are not identity |
| **E.6** | Canonical ordering | `normalized sector`, then `reference identifier`. RankingEngine conviction order is **not** population-identity order |
| **E.7** | Comparison boundary | Identity comparison and uniqueness occur **after sector normalization**, on the composite |
| **E.8** | Sector canonicalization | 13-name vocabulary; case-insensitive; surrounding whitespace ignored; internal whitespace normalized; aliases rejected; unknown rejected; blank/empty rejected; normalized sector participates in identity. `TAXONOMY_RESOLOLVED` alias behaviour **not** inherited |
| **E.9** | Reference identifier | **Opaque.** No company identity semantics. No additional normalization governed by NP-12 |

---

## D. Requirement-by-Requirement Implementation Assessment

### D.1 F.1 — Duplicate rejection

> **Does the current population path reject a repeated `(normalized sector, reference identifier)`?**

**NO.**

Evidence at the verified HEAD:

| Artifact | Finding |
|---|---|
| `CrossSectorEngine.run()` (lines 56–95) | Ten sequential stages — ontology map, portfolio intelligence, ranking, allocation, diversification, opportunity, correlation, evidence, reporting. **No validation stage.** No rejection construct anywhere |
| `CrossSectorEngine.ts`, `OntologyMapper.ts`, `RankingEngine.ts`, `PortfolioIntelligence.ts` | Grep for `reject`, `duplicate`, `unique`, `already`, `seen`: **zero hits** |
| `PipelineInput` | `readonly outputs: readonly EngineOutput[]` — unvalidated, caller-supplied, no uniqueness constraint at the type level |

Confirmed by the six controlled cases reconstructed in the Closure gate: every repeated pair accepted with no throw, all retained and counted independently. Case 6 — same sector, same reference id, **different conviction** (80 vs 40) — retained with no conflict detected.

**Classification: 2 — IMPLEMENTABLE WITHIN EXISTING ARCHITECTURE.** `CrossSectorEngine.run()` is the single orchestration boundary through which every member passes; a rejection construct belongs at its head, before ontology mapping.

### D.2 F.2 — Uniqueness enforcement

> **Is uniqueness enforced before downstream evaluation?**

**NO.**

| Artifact | Finding |
|---|---|
| Entire `cross-sector/` tree | No uniqueness assertion, constraint, Map/Set keyed on the member discriminator, or validation of any kind |
| `CrossSectorEvidence.ts:59` | `[...new Set(ranking.map((r) => r.sector))].sort()` — the only Set construct. It dedups **sectors**, not members, and it is an evidence-presentation concern, not a population-validation construct |
| `types.ts` | `readonly companyId: string` — no uniqueness, no constraint, no provenance |

**Classification: 2 — IMPLEMENTABLE WITHIN EXISTING ARCHITECTURE.** Same boundary as D.1; enforcement is a precondition of rejection and belongs immediately before it.

### D.3 F.3 — Sector normalization

> **Does the population boundary enforce the governed canonicalization rules?**

**NO.**

| Artifact | Finding |
|---|---|
| `cross-sector/` tree, grep for `toLowerCase`, `toUpperCase`, `.trim()`, `normalize` | **Zero normalization hits.** The only `.toLowerCase()` in the tree is `AllocationEngine.ts:54` `strategy.toLowerCase()` — a rules-applied label string, unrelated to sector identity. The only other "normalized" tokens are prose comments and the words "normalized conviction" |
| `OntologyMapper.ts:36-41` | `ONTOLOGY_METADATA` carries **only 4** of the 13 certified sector names (`Banking`, `Insurance`, `Capital Markets`, `Healthcare`) with a permissive `??` fallback. It is a **dimension-key mapping**, not a canonical-sector vocabulary, and it does not validate membership |
| `EngineRegistry.ts` | Holds the 13-name vocabulary in `CERTIFIED_ENGINES[].sectorFamily` (verified identical as a set **and in order** to `PROGRAM_v1.1_REPLAY_BASELINE.json`). But it gates **engine admission by `engineId`**, not the Screening population boundary |
| `TAXONOMY_RESOLVED` | Engine-admission guard that **throws** on `IT`/`Chemicals`/`Realty`/`Real Estate`. Per E.8, its alias behaviour is **not** inherited |

**Classification: 2 — IMPLEMENTABLE WITHIN EXISTING ARCHITECTURE.** The governed vocabulary already exists in two governed artifacts (`EngineRegistry.CERTIFIED_ENGINES[].sectorFamily` and the v1.1 Replay Baseline), verified identical. No new vocabulary must be authored. The normalization step belongs at the same pre-evaluation boundary.

### D.4 F.4 — Population identity

> **Does the current architecture provide an identity that uniquely distinguishes the governed member set?**

**NO.** `evidenceId` remains insufficient.

`CrossSectorEvidence.ts:66`:

```typescript
evidenceId: `csip-evidence-${portfolioId}`,
```

| Test | Result |
|---|---|
| Keyed on `portfolioId` alone | **YES** |
| Distinguishes materially different populations | **NO** |
| Demonstrated collision | Three materially different populations share one id: `[Banking-H1, Banking-H1]` (2 members, 1 sector), `[Banking-H1, Insurance-H1]` (2 members, 2 sectors), `[BK-002, BK-001, BK-005]` (3 members, 1 sector) — all `csip-evidence-PF` |
| Depends on caller identity (forbidden by E.5) | **YES** — `portfolioId` is caller-supplied |

`portfolioId` is a `PipelineInput` field, caller-supplied, and per E.5 **explicitly excluded** from population identity. `evidenceId` therefore fails E.5 as well as E.6.

Per §F.4, **no replacement is designated** by this gate.

**Classification: 2 — IMPLEMENTABLE WITHIN EXISTING ARCHITECTURE.** A membership-only identity is derivable from the canonical post-rejection member set, which the architecture will hold after D.1–D.3 are satisfied. No new subsystem is required.

### D.5 F.5 — Ordering independence

> **Can the same governed member set supplied in different orders produce the same population identity?**

**NO.** The four distinct concerns, kept separate as §F.5 requires:

| Concern | Current state | Governed requirement |
|---|---|---|
| **Semantic population identity** | **None exists** (D.4) | Membership-only, ordering-independent |
| **Canonical representation** | **None exists.** `RankingEngine.ts:14-17` sorts by `conviction` desc then `sector` asc — a **presentation ranking** that depends on member *values*, which E.5 excludes. Not a canonical population order | Order by `normalized sector`, then `reference identifier` (E.6) |
| **Presentation / ranking order** | Exists, governed separately, value-dependent | **Not** population identity — correctly distinct |
| **Transport checksum** | **Order-sensitive** — measured `ee02f6fb` vs `ef68f3a7` for the same members in different order (N3-D11) | Would become stable once canonical representation is established; **not to be modified by this gate** |

Observable aggregate **values** are already order-insensitive (verified in the Closure gate: `holdings`, `avgConviction`, `avgQuality`, `avgRisk`, sorted sector list, exposure values all identical across input orders). The gap is confined to canonical representation and population identity, not to the aggregate computation.

**Classification: 2 — IMPLEMENTABLE WITHIN EXISTING ARCHITECTURE.** Canonical ordering by a total key over a post-rejection unique member set is deterministic by construction and requires no architectural decision.

### D.6 F.6 — Population identity inputs

> **Confirm that caller identity, portfolioId, scenario, strategy, criteria, timestamp, snapshot context, and member values are not inadvertently incorporated into the governed population identity.**

**CONFIRMED — by absence, not by conformance.**

| Input | Present in `PipelineInput`? | In the only existing identity? |
|---|---|---|
| `portfolioId` | **YES** | **YES** — `evidenceId` is keyed on it |
| `scenario` | **YES** | No |
| `strategy` | **YES** | No |
| `topN`, `reportTypes` | **YES** | No |
| Member values (`conviction`, `quality`, …) | **YES** (per member) | No |
| Criteria | **NO** — not present at this boundary | No |
| Timestamp | **NO** — absent from `PipelineInput` and `NormalizedHholding` | No |
| Snapshot context | **NO** — `snapshotId`/`replayId` carry zero `companyId` references | No |

**Finding:** the only existing identity incorporates `portfolioId`, which E.5 **explicitly excludes**. No population identity exists that correctly implements membership-only semantics. This is the **consequence** of D.4, not an independent defect.

**Classification: 2 — IMPLEMENTABLE WITHIN EXISTING ARCHITECTURE.**

---

## E. Architectural Boundary Assessment (G)

### E.1 Existing orchestration boundary

`CrossSectorEngine.run(input: PipelineInput): PipelineResult` is the **single orchestration point** through which every population member passes. Its stage sequence:

```
 1. OntologyMapper.mapAll([...outputs])     ← members enter here
 2. PortfolioIntelligence.compute(...)
 3. RankingEngine.rank(...)
 4. AllocationEngine.recommend(...)
 6. DiversificationAnalyzer.analyze(...)
 7. OpportunityEngine.top(...)
 8. CorrelationEngine.analyze(...)
 9. CrossSectorEvidence.build(...)
10. ReportingEngine.build(...)
```

The stage-1 boundary is where all five gaps concentrate: members enter unvalidated, un-normalized, and un-identified, and every downstream stage consumes them as supplied.

### E.2 Boundary fitness

| Candidate boundary | Fits which requirements | Assessment |
|---|---|---|
| **Population ingestion / `PipelineInput.outputs`** | F.3 sector normalization, F.2 uniqueness, F.1 duplicate rejection | **Appropriate and available.** The existing typed input boundary already declares the population; validation belongs at its head |
| **Normalization boundary** (`OntologyMapper`) | F.3 sector canonicalization | **Appropriate and available**, with one caveat recorded in §E.3 |
| **Population validation** | F.1, F.2 | **Appropriate and available** — a stage before ontology mapping in `run()` |
| **Population identity construction** | F.4, F.5, F.6 | **Appropriate and available** — derivable from the canonical post-rejection member set; no new subsystem required |
| **Downstream Screening evaluation** | — | **Not** the right boundary. Members must be validated before evaluation; retrofitting here would be inconsistent with fail-closed governance |
| **Transport / presentation** | — | **Not** the right boundary for identity. Transport is a presentation concern; the transport checksum is explicitly **not** to be modified by this gate |

### E.3 The one architectural caveat — recorded, not decided

`OntologyMapper.ts:36-41` currently carries **4** of the 13 certified sector names in `ONTOLOGY_METADATA`, with a permissive `??` fallback:

```typescript
const meta = ONTOLOGY_METADATA[output.sector] ?? { quality: 'qualityScore', risk: 'riskScore', moat: 'franchiseScore' };
```

This is a **dimension-key mapping**, not a canonical-sector vocabulary, and it is **not** a validation construct. The governed 13-name vocabulary exists in `EngineRegistry.CERTIFIED_ENGINES[].sectorFamily` and `PROGRAM_v1.1_REPLAY_BASELINE.json` — verified identical as a set and in order.

**Recorded for the implementation-authority decision:** the governed vocabulary should be sourced from those existing governed artifacts rather than authored anew, and the sector-normalization step should not be conflated with `ONTOLOGY_METADATA`'s permissive fallback. This is a **sourcing note**, not an architectural blocker — the requirement remains classification 2.

### E.4 No new architecture required

No registry, no SecurityMaster, no identity service, no persistence layer, no schema change, and no new subsystem is required by any governed requirement. All five gaps are satisfiable within the existing `CrossSectorEngine.run()` boundary using vocabulary already present in governed artifacts.

---

## F. Gap Classification Summary (H)

| # | Governed requirement | Current state | Classification |
|---|---|---|---|
| 1 | Sector normalization at population boundary (E.8, F.3) | Absent — zero normalization hits; no validation against the 13 | **2 — IMPLEMENTABLE WITHIN EXISTING ARCHITECTURE** |
| 2 | Uniqueness enforcement (E.3, F.2) | Absent — no assertion, constraint, or keyed structure anywhere | **2 — IMPLEMENTABLE WITHIN EXISTING ARCHITECTURE** |
| 3 | Duplicate rejection (E.4, F.1) | Absent — no rejection construct; all six controlled cases retained | **2 — IMPLEMENTABLE WITHIN EXISTING ARCHITECTURE** |
| 4 | Population identity — membership only (E.5, F.4, F.6) | Absent — `evidenceId` keyed on caller-supplied `portfolioId`; collides across materially different populations | **2 — IMPLEMENTABLE WITHIN EXISTING ARCHITECTURE** |
| 5 | Canonical ordering + ordering independence (E.6, F.5) | Absent — no canonical representation; transport checksum order-sensitive | **2 — IMPLEMENTABLE WITHIN EXISTING ARCHITECTURE** |

**No requirement is classified 1 (ALREADY CONFORMANT).** No requirement is classified 3 (ARCHITECTURAL DECISION REQUIRED). No requirement is classified 4 (BLOCKED BY ENVIRONMENT) — the IRR repository was restored and verified.

Per §H, no known implementation gap has been classified as conformant.

---

## G. Exact Implementation Gaps

| # | Gap | Governed requirement violated | Current behaviour | Required behaviour |
|---|---|---|---|---|
| **G1** | No sector normalization | E.8 | Sector values pass through un-normalized, un-validated, byte-compared | Canonicalize to the 13-name vocabulary (case-insensitive, trimmed, internal-whitespace-collapsed); reject aliases, unknown, blank |
| **G2** | No uniqueness enforcement | E.3 | Nothing detects a repeated `(sector, reference id)`; case 6 undetected | Enforce uniqueness on the composite before evaluation |
| **G3** | No duplicate rejection | E.4 | All repeated pairs retained and counted independently | Reject the population on a repeated pair (fail-closed) |
| **G4** | No membership-only population identity | E.5 | `evidenceId = csip-evidence-${portfolioId}` — caller-keyed, collides | Derive identity from the canonical post-rejection member set only |
| **G5** | No canonical ordering | E.6 | Ranking order is value-dependent; checksum order-sensitive | Canonical order by `(normalized sector, reference identifier)` |

### G.1 Gap dependencies

```
G1 (normalization)  ──►  G2 (uniqueness)  ──►  G3 (rejection)  ──►  G4 (population identity)
                                                      │                     │
                                                      └──────►  G5 (canonical ordering) ──┘
```

G1 is a **precondition** of G2 and G3: uniqueness and rejection operate on the **normalized** composite (E.7), so normalization must precede them. G5 depends on G3 because canonicalization orders a **post-rejection** set. G4 depends on G3 and G5.

**All five gaps are sequential and confined to the single pre-evaluation boundary** identified in §E.

---

## H. Architectural Blockers

> **NONE.**

No governed requirement requires an architectural governance decision before implementation. Every gap is implementable within the existing `CrossSectorEngine.run()` boundary using vocabulary already present in governed artifacts. The one caveat in §E.3 is a sourcing note for the implementation-authority decision, not a blocker.

---

## I. Readiness Determination (J)

> ### NOT READY — IMPLEMENTATION GAP ONLY

| Prerequisite for "READY FOR IMPLEMENTATION AUTHORITY" | Status |
|---|---|
| All governed semantics sufficiently specified | **YES** — eight of eight closed (E.1–E.9) |
| Semantics mutually consistent | **YES** — verified, no contradiction |
| Current IRR architecture provides appropriate implementation boundaries | **YES** — single orchestration boundary at `CrossSectorEngine.run()`; vocabulary already governed |
| Authoritative IRR repository verified | **YES** — restored and verified at the pinned baseline, clean |
| All governed requirements currently implemented | **NO** — five gaps (G1–G5) |

The result is **NOT READY — IMPLEMENTATION GAP ONLY**: semantics complete, architecture understood, five enumerated gaps unimplemented.

### I.1 What this result does and does not mean

Per §K:

> **This gate grants NO implementation authority.**

"NOT READY — IMPLEMENTATION GAP ONLY" means only that the prerequisites for a subsequent implementation-authority decision are satisfied **once the gaps are implemented**. It does not authorize implementing them.

---

## J. Implementation Authority Boundary

> **This gate grants NO implementation authority.**

This gate did **not**: modify source code; modify schemas; modify tests; add duplicate rejection; add uniqueness validation; add sector normalization; replace `evidenceId`; add population hashing; add canonical sorting; modify transport checksums; create registries; create a SecurityMaster; alter `companyId`; or commit, push, merge, rebase, reset, fetch, or pull into the authoritative repository.

The only repository action was the §D-authorised **restoration of the verification environment** (B.2), which is content-mutability-neutral and pinned.

---

## K. Acceptance Conditions (M)

| # | Condition | Met |
|---|---|---|
| 1 | Authoritative IRR repository verified (or gate explicitly blocked) | **YES** — restored and verified |
| 2 | Protected IPD lineage remains untouched | **YES** — §B.4 |
| 3 | Complete NP-12 semantic contract preserved | **YES** — §C |
| 4 | Every governed requirement has an explicit readiness classification | **YES** — §F, all classified |
| 5 | Existing implementation divergences not misrepresented as conformant | **YES** — zero requirements classified 1 |
| 6 | No implementation has occurred | **YES** — §J |
| 7 | No company identity semantics introduced | **YES** — §L |
| 8 | No additional broad investigation created | **YES** — §M |
| 9 | A precise next gate follows from the readiness determination | **YES** — §M |

---

## L. Company-Identity Exclusion

Preserved. This gate:

- introduced **no** company identity semantics;
- created **no** SecurityMaster, registry, identity service, or company resolution;
- reinterpreted **neither** `companyId` **nor** `` `${s.sector}-H1}` `` as company identity;
- treated the `(normalized sector, reference identifier)` discriminator strictly as a **sector-reference population discriminator**.

---

## M. Recommended Next Gate

> ### NP-12 IMPLEMENTATION-AUTHORITY DECISION — Sector-Reference Population Contract

The single gate that follows from this determination. Because the result is **NOT READY — IMPLEMENTATION GAP ONLY**, the next gate is the **implementation-authority decision** that authorizes closing G1–G5 in dependency order:

| Order | Gap | Scope |
|---|---|---|
| 1 | **G1** sector normalization | Canonicalize to the governed 13-name vocabulary; reject aliases, unknown, blank |
| 2 | **G2** uniqueness enforcement | Enforce uniqueness on the normalized composite before evaluation |
| 3 | **G3** duplicate rejection | Reject the population on a repeated pair |
| 4 | **G5** canonical ordering | Order by `(normalized sector, reference identifier)` |
| 5 | **G4** population identity | Derive membership-only identity from the canonical post-rejection set |

It must **not**: reopen E.1–E.9; introduce company identity; alter `companyId`; modify the transport checksum as a shortcut to ordering independence; or conflate the implementation-authority decision with implementation itself.

It must **not** be combined with any separate semantic decision — none remains open.

---

## N. Final Repository State

| Repository | Exact HEAD | Branch / state | Working tree | Mutation |
|---|---|---|---|---|
| `iips-review-recovered` | **`bfe85a7ecaf690f4ff00f2878714eb594a3536b8`** | Detached at pinned commit | **CLEAN** — 0 modified, 0 untracked | **None** to repository content |
| `iips-production-market-data` | **`4d3e1cdca3a33da0ec3be8b336b17128108a502c`** | `arena/01a0f64a-iips-production-market-data` | **CLEAN** — 0 modified, 0 untracked | **None** |

**Restoration action (recorded in §B.2):** IRR clone + pinned checkout, performed solely to establish the verification environment. No authoritative repository state was changed.

---

## O. Final Governance Statement

The governed sector-reference Screening contract is fully specified and internally consistent. The authoritative IRR repository was restored to and verified at the previously established baseline, and the assessment against it is live evidence rather than inherited claim. Five governed requirements are unimplemented, all confined to a single orchestration boundary and requiring no architectural decision. NP-12 is therefore **not ready** — by implementation gap only — and no implementation authority is granted.

> **NP-12 Implementation Readiness Gate determines whether the governed sector-reference Screening contract is sufficiently specified and architectically ready for a subsequent implementation-authority decision. It does not implement the contract and does not grant implementation authority.**
