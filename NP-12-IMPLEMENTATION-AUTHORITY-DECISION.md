# NP-12 — IMPLEMENTATION-AUTHORITY DECISION

**Program:** IIPS v2.0 — NP-12 GOVERNED SCREERER
**Record type:** PROGRAM AUTHORITY IMPLEMENTATION-AUTHORITY DECISION
**Follow-on to:** NP-12 — Implementation Readiness Gate (**NOT READY — IMPLEMENTATION GAP ONLY**)
**Date:** 2026-10-01

---

## A. Decision

```
IMPLEMENTATION AUTHORITY GRANTED
```

**Authority:** RAMKI — Program Authority

---

## B. Decision Record (M)

| Field | Value |
|---|---|
| **Decision** | **IMPLEMENTATION AUTHORITY GRANTED** |
| **Authority** | **RAMKI — Program Authority** |
| **Scope if granted** | **NP-12 G1–G5 only** |
| **Dependency order** | **G1 → G2 → G3 → G5 → G4** |
| **Semantic status** | **CLOSED** |
| **Architectural status** | **READY** |
| **Company identity** | **OUT OF SCOPE** |

This gate grants implementation authority **only** for the five enumerated gaps, in the established dependency order, bounded by §F. It authorizes **no** other work.

---

## C. Repository Safety Record (K) — Recorded Before Implementation

| Item | Value |
|---|---|
| **IRR path** | `/homeuser/iips-review-recovered` |
| **IRR HEAD** | **`bfe85a7ecaf690f4ff00f2878714eb594a3536b8`** |
| **IRR remote** | `https://github.com/ramkivs/iips-review-recovered.git` |
| **IRR remote HEAD (`git ls-remote`)** | **`bfe85a7ecaf690f4ff00f2878714eb594a3536b8`** — matches local |
| **IRR branch/state** | Detached at pinned commit — `## HEAD (no branch)` |
| **IRR working tree** | **CLEAN** — 0 modified, 0 untracked |
| **IPD path** | `/homeuser/iips-production-market-data` |
| **IPD HEAD** | **`4d3e1cdca3a33da0ec3be8b336b17128108a502c`** |
| **IPD branch** | `arena/01a0f64a-iips-production-market-data` |
| **IPD working tree** | **CLEAN** — 0 modified, 0 untracked |

### C.1 Baseline provenance

The IRR working tree was materialised in the preceding Readiness Gate by §D-authorised restoration, **pinned** to this exact commit and **read-only with respect to repository content**. No authoritative repository state was changed. The pre-decision record above is therefore verified against the authoritative remote, not inherited.

### C.2 IPD status

The protected IPD lineage is **untouched** and remains historical/reference lineage only. **No IRR ↔ IPD dependency is authorized** by this decision.

---

## D. Protected Governed Contract (D)

CLOSED. Not reopened by this decision and not to be reopened during implementation.

| # | Requirement | Governed semantics |
|---|---|---|
| **D.1** | Identity level | **SECTOR-REFERENCE** — a sector-analytics surface, not a company universe |
| **D.2** | Member identity | One member = **`(normalized sector, reference identifier)`** |
| **D.3** | Uniqueness | The composite pair must be **unique** within an evaluated population |
| **D.4** | Duplicate policy | Repeated `(normalized sector, reference identifier)` members must **REJECT** |
| **D.5** | Population identity | **MEMBERSHIP ONLY.** Member values and evaluation context are not population identity |
| **D.6** | Canonical ordering | Population representation ordered by **normalized sector, then reference identifier**. Ranking remains separate |
| **D.7** | Comparison boundary | Identity comparison occurs **after sector normalization** |
| **D.8** | Sector normalization | 13 canonical names: Banking, Insurance, Capital Markets, Healthcare, Hospitality, Energy, Utilities, Consumer, Industrials, Technology, Telecommunications, Automobile, Materials & Metals. Case-insensitive; surrounding whitespace ignored; internal whitespace normalized; aliases rejected; unknown rejected; blank rejected |
| **D.9** | Reference identifier | **Opaque.** No company identity semantics may be introduced |

---

## E. Authorized Implementation Scope (F)

Exactly five items. Nothing else.

### G1 — Sector normalization

Implement the governed sector canonicalization at the appropriate population boundary. Must enforce, without alteration:

- 13 canonical sector names;
- case-insensitive matching;
- surrounding whitespace normalization;
- internal whitespace normalization;
- **aliases rejected**;
- **unknown sector rejected**;
- **blank sector rejected**.

Constraints: **do not** import `TAXONOMY_RESOLVED` alias mappings; **do not** expand the sector vocabulary; **do not** change engine-admission semantics.

### G2 — Uniqueness enforcement

Enforce uniqueness on **`(normalized sector, reference identifier)`**. The comparison must occur **after G1 normalization**. No company identity lookup or registry is permitted.

### G3 — Duplicate rejection

Implement the governed **REJECT** behaviour for repeated `(normalized sector, reference identifier)` members.

Must **not**: retain duplicates; first-win; last-win; merge; average; silently deduplicate.

A duplicate is a **contract violation**. Rejection must occur **before downstream population evaluation**.

### G5 — Canonical ordering

Deterministic population representation using:

```
normalized sector ASC → reference identifier ASC
```

This is the **population canonical order**. It must **not** reuse the `conviction DESC → sector ASC` order from `RankingEngine`. Ranking remains a separate presentation/evaluation concern.

### G4 — Stable population identity

A stable identity representing the governed population membership. It must derive from the **governed canonical population membership**.

It must **NOT** derive from:

- `portfolioId`;
- caller identity;
- `scenario`;
- `strategy`;
- criteria;
- evaluation timestamp;
- member values;
- presentation ranking;
- transport checksum semantics.

Must preserve:

> **same governed member set = same population identity**

> **different governed member set = different population identity**

Ordering differences must **not** produce different population identities. **Do not simply replace `evidenceId` with another caller-keyed identifier.**

---

## F. Implementation Boundary (G)

Implementation remains within the existing `CrossSectorEngine.run()` orchestration boundary through which all members pass — the boundary the readiness assessment identified — unless implementation itself proves an architectural decision is genuinely unavoidable.

Must **not** create: a new identity subsystem; a SecurityMaster; a company registry; a new population service; an unrelated persistence layer; an IPD dependency.

Scope must not expand beyond **G1–G5**.

---

## G. Preserved Separation of Concerns (H)

Implementation must preserve four distinct concerns:

| Concern | Governed semantics |
|---|---|
| **Population identity** | Membership-based and canonical |
| **Canonical population representation** | Ordered by `normalized sector → reference identifier` |
| **Ranking** | Existing value-dependent presentation/evaluation ordering — **separate** |
| **Transport checksum** | Separate transport concern |

Ranking order and the transport checksum must **not** be used as substitutes for population identity.

---

## H. Validation Requirements (I)

The implementation must demonstrate, at minimum:

### H.1 Sector normalization (I.1)

| # | Verify |
|---|---|
| 1 | Canonical sector accepted |
| 2 | Case variant resolves to canonical sector |
| 3 | Surrounding whitespace resolves to canonical sector |
| 4 | Internal whitespace normalization behaves per the governed rule |
| 5 | Alias rejected |
| 6 | Unknown rejected |
| 7 | Blank rejected |

### H.2 Identity comparison (I.2)

| # | Verify |
|---|---|
| 1 | Normalization occurs **before** identity comparison |
| 2 | `(sector, referenceId)` is the discriminator |
| 3 | Reference identifier remains opaque / byte-comparable |
| 4 | Company identity is never consulted |

### H.3 Duplicate handling (I.3)

| # | Verify |
|---|---|
| 1 | Exact duplicate **rejected** |
| 2 | Same sector + same reference id + different values **rejected** |
| 3 | Same reference id across **different** sectors remains **distinct** |
| 4 | Different reference ids within the **same** sector remain **distinct** |

### H.4 Canonical ordering (I.4)

| # | Verify |
|---|---|
| 1 | Input order A/B and B/A produce the **same** canonical population representation |
| 2 | Ordering uses normalized sector then reference identifier |
| 3 | Conviction/value changes do **not** alter population ordering |

### H.5 Population identity (I.5)

| # | Verify |
|---|---|
| 1 | Same governed member set → same identity |
| 2 | Reordered same member set → same identity |
| 3 | Different member set → different identity |
| 4 | Changed member values with identical member identities → **same** population identity |
| 5 | Different `portfolioId` with identical governed member set → **same** population identity |
| 6 | Same `portfolioId` with different governed member sets → **different** population identity |

---

## I. Non-Authorized Work (J)

Even with authority granted, this decision does **NOT** authorize:

- company identity work;
- SecurityMaster creation;
- company mapping;
- new Screening criteria;
- new operators;
- OR/NOT/nested expression support;
- valuation screening;
- risk screening;
- moat screening;
- capital-efficiency screening;
- verdict screening;
- changes to the certified ontology;
- changes to `RankingEngine` semantics;
- changes to production market-data routes;
- IPD integration;
- production deployment;
- production authentication;
- unrelated UI redesign.

**The authority is strictly limited to G1–G5.**

---

## J. Failure / Stop Conditions (L)

If implementation reveals any of the following is true:

- governed semantics cannot be represented by the existing architecture;
- population identity requires an ungoverned semantic;
- sector vocabulary is insufficient;
- reference identifier requires new identity semantics;
- implementation would require company identity;
- implementation would require changing a CLOSED governance decision;

**STOP.** Do **not** silently modify the contract. Return the exact conflict to Program Authority for governance.

---

## K. Post-Implementation Execution Obligations (K)

These belong to the subsequent **NP-12 Implementation Execution Gate**, and are **not** performed by this decision:

- implementation work **tested**;
- **typechecked** where applicable;
- inspected for **unintended scope**;
- **committed**;
- **pushed to the authoritative remote**;
- verified **local == remote**.

---

## L. Next Gate (N)

> ### NP-12 IMPLEMENTATION EXECUTION GATE — covering only G1 → G2 → G3 → G5 → G4

No additional semantic gate is required, unless implementation exposes a genuinely new governance conflict — in which case §L stop conditions apply and the conflict returns to Program Authority.

---

## M. Final Governance Statement

Program Authority has granted implementation authority for exactly the five enumerated gaps, in the established dependency order, bounded by the closed sector-reference semantic contract and by the existing `CrossSectorEngine.run()` orchestration boundary. Semantic status is CLOSED, architectural status is READY, and company identity is OUT OF SCOPE. No work outside G1–G5 is authorized, and no semantic decision is reopened.

> **NP-12 Implementation-Authority Decision governs authorization to implement the already-approved sector-reference population contract. It does not reopen semantic decisions, does not establish company identity, and does not authorize work outside G1–G5.**
