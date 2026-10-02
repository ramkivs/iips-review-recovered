# NP-12 N4-A8 — Implementation Authority / Readiness Determination

**Record identifier:** `NP-12-N4-A8`
**Record type:** Program Authority readiness determination record — durable publication act
**Workstream:** NP-12 — Governed Screener
**Gate:** NP-12 N4-A8 — Implementation Authority / Readiness Determination Gate
**Program Authority / Signer:** Ramki (Ramakrishnan) — **determination issued for Program Authority decision; not a grant**
**Mode:** Read-only investigation + authority determination
**Repository:** `ramkivs/iips-review-recovered` (IRR) — authoritative ref `refs/heads/main`
**IPD:** `ramkivs/iips-production-market-data` — reference-only, zero mutations
**Production:** OUT OF SCOPE, zero mutations
**Implementation authority:** **NOT GRANTED** — by this record or any predecessor
**Specification baseline consumed:** `NP-12-N4-A6-CONTRACT-SPECIFICATION.md`
**Implementation:** **NONE.** No runtime behaviour was implemented, modified, or executed.

---

## 1. Gate identity, scope and session provenance

### 1.1 Scope

This gate determines:

1. whether the durably published N4-A6 contract specification is **sufficiently complete and internally coherent to support implementation planning**;
2. **every remaining implementation-readiness gap**, component by component and dependency by dependency;
3. whether **N4-A6 publication constitutes implementation authority** (it does not, and this record does not create it).

It is a **read-only investigation and authority determination**. It implements nothing, authorizes nothing, and evaluates no member.

### 1.2 Session provenance — previous attempt not carried forward

A previous attempt at this gate halted at the §3 precondition: that session's pull request (#20, the N4-A6 publication) had been merged, which closed its remote GitHub access, and the gate correctly fail-closed under its own halt rule rather than verifying the baseline from cache.

**Nothing from that attempt is used as evidence here and nothing is inherited from it.**

| Item | Carried forward? |
|---|---|
| Prior investigation findings | **No** |
| Any `A6-IMPL-*` item assessment | **No** |
| `A6-IMPL-10` assessment | **No — and it is NOT treated as satisfied.** It is independently assessed for the first time in Section 7 of this record |
| Readiness determination | **No** |

This session performed the remote verification the previous session could not (Section 2) before any analysis.

---

## 2. Independent remote baseline verification — live query, not cached state

Every value below was obtained by querying the **authoritative remote** in this session. `git ls-remote` was used for the branch tip so that no remote-tracking ref was trusted; `git fetch origin main` was issued before the analysis and again for the artifact blobs; the frozen N4-A1 commit, which a shallow clone cannot contain, was fetched explicitly by object id as instructed.

### 2.1 Commands executed (read-only)

```text
git fetch origin main --force
git ls-remote origin refs/heads/main
git rev-parse FETCH_HEAD^{tree}
git rev-parse 0d00ac1f...:NP-12-N4-A6-CONTRACT-SPECIFICATION.md
git cat-file blob 0d00ac1f...:NP-12-N4-A6-CONTRACT-SPECIFICATION.md | sha256sum
git rev-parse 0d00ac1f...:NP-12-N4-A5-AUTHORITY-DECISION-RECORD.md
git fetch origin f2886a5af43ad8df8676589daef86836039150f5 --depth=1
git rev-parse f2886a5af43ad8df8676589daef86836039150f5^{tree}
```

### 2.2 Verification result

| Item | Expected | Observed on authoritative remote | Result |
|---|---|---|---|
| `refs/heads/main` | `0d00ac1fd6798d63c56eb7a0fe4da77034b21f2b` | `0d00ac1fd6798d63c56eb7a0fe4da77034b21f2b` (`ls-remote`) | **MATCH** |
| Tree | `0b87b9770882e85b6ff793d0aa13e1ec109b6fff` | `0b87b9770882e85b6ff793d0aa13e1ec109b6fff` | **MATCH** |
| A6 artifact present | `NP-12-N4-A6-CONTRACT-SPECIFICATION.md` | present at `main` | **MATCH** |
| A6 blob | `3407ea22eaa15e508744f2e6c4f81097242e0dce` | `3407ea22eaa15e508744f2e6c4f81097242e0dce` | **MATCH** |
| A6 SHA-256 | `2c889c3c5dec346b6c2270c76c746f183804ad78af87d5d26393ba6cc3427531` | `2c889c3c5dec346b6c2270c76c746f183804ad78af87d5d26393ba6cc3427531` | **MATCH** |
| A5 artifact blob | `0aaffdfaa9fcffb20255666d970ed9d1dad1d68e` | `0aaffdfaa9fcffb20255666d970ed9d1dad1d68e` | **MATCH** |
| N4-A1 bound commit | `f2886a5af43ad8df8676589daef86836039150f5` | present after explicit fetch; commit object type `commit` | **MATCH** |
| N4-A1 bound tree | `46c1a15bbcd1291701484457d1fe9815d8538888` | `46c1a15bbcd1291701484457d1fe9815d8538888` | **MATCH** |

**Reconciliation required by §3: none.** No expected value differed. The frozen N4-A1 baseline is **referenced and not rebound**; the N4-A6 publication is **consumed as the specification baseline** and is not reopened or reinterpreted.

**Repository state during this gate:** working tree clean at entry; the only mutation performed by this gate is the creation of this record (Section 11).

### 2.3 What the verified state does and does not confer

The verified state confirms that the A6 contract specification is **durably published authority-bound contract text**. It does **not** confer implementation authority, does not assert conformance by any engine, and does not make any `A6-IMPL-*` dependency resolved. Successful A6 publication is treated in this record strictly as specification authority.

---

## 3. Evidence discipline

| Rule | Observance |
|---|---|
| Read-only | No repository file other than this record was created, modified, or deleted |
| Tests and fixtures | **Not executed.** Inspected as evidence only. No test, fixture, frozen asset, or golden value was modified |
| Numerical claims | Where arithmetic is asserted, it was verified by independent exact-rational computation in a scratch environment **outside** the repository (`Fraction`-based analysis of IEEE-754 doubles); no repository code was executed to produce evidence |
| Remote claims | Taken only from live remote queries (Section 2) |
| IPD | Not accessed; zero mutations |
| Production | Not accessed; zero mutations |

---

## 4. Specification completeness — component by component

For each required contract component the six readiness questions are answered from repository evidence: (a) is the specification authoritative; (b) is the representation fully defined; (c) is the producer/source identified; (d) is the runtime owner identifiable; (e) do the dependencies exist; (f) would implementation require a new policy decision.

### 4.1 Component readiness matrix

| Component | Specification authority | Representation fully defined | Producer / source identified | Runtime owner identifiable | Dependencies exist today | New policy decision required |
|---|---|---|---|---|---|---|
| Member identity `(canonical sector, referenceId)` | A6 §7.1; D-A2-1; G1–G5 | **Yes** — 13-name vocabulary, opaque verbatim reference id | Partially: `referenceId ← EngineOutput.companyId` is governed, but **no runtime producer emits a real `companyId`** (§6.10) | Yes — `ScreeningPopulationGuard` at `CrossSectorEngine.run()` head | Sector/normalization: **yes, implemented**. Reference-id source: **no** | No |
| Population identity (G4) | A6 §7.2, §8.3; G4 | **Yes** — membership-only SHA-256, 64 lowercase hex text octets | Yes — `ScreeningPopulationGuard.fromOutputs()` | Yes | **Implemented** (`populationIdentity()`) | No |
| `conviction`, `quality` (canonical decimal text) | A6 §6, §7.2; A5-D01/D02 | **Yes** — full lexical form, fixed-point key, canonicalization, rejection table | Source path named (authoritative runtime producer, A5-D06) but **no decimal text exists anywhere in the producer path**; no runtime mapping from engine pillars to these two fields is governed | Boundary owner unresolved (`A6-U-06`) | **No** | No new *governance* decision; the producer-side decimal determination rule must be pinned (Section 5.3, `A8-S-04`) |
| `growth` + `growthAvailability` | A6-DR-01; A6 §7.3, §8.2 | **Yes** — two-state vocabulary, producer→boundary mapping table, availability octet `00`/`01`, evaluation rule | Producer-side condition list is given, but **no engine emits or retains an availability state** (§6.2) | Same boundary as above | **No** | No |
| `inputHash` preimage (`NP12MBR` v01) | A6-DR-04/D06; A6 §8 | **Yes** — exact octet order, framing, exclusions, worked availability demonstration | Member fields identified; 5 of 13 preimage fields are absent from `EngineOutput` (§6.3) | Screen-input composition boundary (location unresolved, `A6-U-06`) | **No serializer exists** | No |
| `executionId` preimage (`NP12EXE` v01) | A6-DR-05/D06; A6 §9 | **Yes** — envelope + ordered member bindings, G5 order consumed verbatim | Definition binding available (`ScreenDefinition.sha256()`); evaluator/evaluator version/semantics version values unassigned | No ScreenExecution runtime exists | Partially (Definition digest **yes**); evaluator **no** | No — `A6-U-02/03/04` are explicitly "assigned at implementation authorization", i.e. bounded implementation-time naming, not reopened governance |
| `resultId` preimage (`NP12RES` v01) | A6-DR-06; A6 §10 | **Yes** — status vocabularies, counts, per-member result frames, invariants | No result producer exists | No ScreenResult runtime exists | **No** | No |
| Member/result ordering (G5) | A6 §12; D-A2-5 §8.2.3 | **Yes** — comparator named and frozen | Yes — `ScreeningPopulation.compareMembers` | Yes | **Implemented** | No |
| Provenance carriage (`timestamp`, `requestId`, seven-item minimum) | A6-DR-02/D03; A6 §7.2; D-A2-1 | **Yes** — field-by-field hash membership disposition | Partially — accessor surfaces exist (`ExecutionResult.snapshotRef/evidenceRef`, plugin identity, `EngineRegistry`), none is carried on the member record | Boundary unresolved (`A6-U-06`) | Partially | No — `provider`/`as-of`/`freshness`/`sourceRevision`/vintage remain expressly outside the contract (`A6-U-01`) |
| Execution-level validation and error semantics | A6 §7.4; D-A2-4, A5-D08 | **Yes** — six member error codes; six structural-failure conditions; separation of responsibilities stated | Member-value validity at the composition boundary; population/sector validity at G1–G5 (implemented) | Boundary unresolved; population guard implemented | Partially | No |
| Format discriminators `NP12MBR`/`NP12EXE`/`NP12RES` v01 | A6-DR-06 | **Yes** — headers, magic octets, version octet, framing | N/A (mechanical formats) | No serializer/decoder exists | **No** | No |

**Result:** every component required for implementation planning has an **authoritative, fully defined representation**. No component's normative content in A6 §§6–12 is missing, contradictory, or blocked on an unrecovered authority question. The dependency failures are all on the **producer/runtime side**, none in the contract text.

### 4.2 Internal coherence checks performed

| Check | Method | Result |
|---|---|---|
| Reuse of frozen `NP12DEF` vocabulary without new elementary encoding | Compared A6 §5 table against the byte-grammar concepts referenced (`U32BE`, `T(s)`, SHA-256, digest rendering) | **Coherent** — no new primitive introduced; header shapes are fixed-width octet sequences |
| Header consistency across formats | Recomputed the magic octets from the ASCII spellings | `NP12MBR` → `4e 50 31 32 4d 42 52`, `NP12EXE` → `4e 50 31 32 45 58 45`, `NP12RES` → `4e 50 31 32 52 45 53`; each `|| 00 || 01` — **coherent with §8.1/§9.1/§10.1** |
| Availability octet exclusivity | `GROWTH(member)` admits exactly `00`/`01`; `UNAVAILABLE` emits a single octet with no value frame | **Self-consistent**; the §8.3 worked example (`01 00 00 00 01 30` = `T("0")`) matches the §6.3 canonical text rule |
| Identity separation | Four identity-bearing concepts cross-checked against the four preimages; `inputHash` per-member only (`A6-DR-04`) | **Coherent**; no preimage contains its own digest; no timestamp in any preimage |
| Growth semantics vs N3 §7 | Evaluation rule (`AVAILABLE ∧ q ≠ 0 ∧ comparison`) against the stated N3 observable behaviour | **Coherent** — no zero growth, available or not, satisfies any growth predicate; no second sentinel |
| Ordering authority | G5 comparator vs ranking comparator vs byte-grammar token order | **Coherent**; §12 correctly identifies the UTF-16/UTF-8 divergence risk and prohibits re-sorting |
| Error/status vocabularies | §7.4 member codes vs §10.2 `memberErrorCode` domain | **Coherent** (`""` when status ≠ `INVALID_MEMBER`) |
| Count invariants | `matchedCount + nonMatchCount + invalidCount = totalPopulationCount` against §10.4/§10.5 | **Coherent** |
| Definition binding | `definitionDigest ← ScreenDefinition.sha256()` (64 lowercase hex) exists and is not substituted for `(definitionId, version)` | **Coherent** with §9.3.1 |
| Timestamp exclusion | §7.2 `timestamp` **EXCLUDED** from hash vs §7.4 "timestamp carried as provenance" | **Coherent** (`A6-DR-03`) |

### 4.3 Specification-level findings

Four bounded items were found. None blocks the deterministic reading of A6 §§6–12; none reopens closed governance; **none is resolved by this record** — each is recorded for Program Authority disposition.

| ID | Finding | Evidence | Severity | Effect on the contract |
|---|---|---|---|---|
| `A8-S-01` | **Wording imprecision in `A6-IMPL-01`.** The register states `renorm()` is "non-terminating in decimal for most governed weightings". Every finite IEEE-754 double has a terminating decimal expansion, so the literal statement is incorrect. The substantive defect is different and stronger: the exact decimal expansion of the computed quotient typically **exceeds** the ≤ 6 fractional digits the contract admits | Independent exact-rational analysis: for the governed three-constituent weighting (0.40, 0.35, 0.25) over integer band scores 0–100, **828,619 of 1,030,301** combinations (80.4 %) require more than six exact fractional digits; representative exact expansions require **45–54** digits (e.g. a value whose shortest round-trip form is `0.35` has the exact expansion `0.34999999999999997779553950749686919152736663818359375`, 53 digits). This is the same defect already recorded at `NP-12-N4-A3-AUTHORITY-DECISION-RECORD.md:383` | **LOW** (documentation precision only) | **None** on §§6–12; the register's conclusion (producer-side decimal text required) stands unchanged |
| `A8-S-02` | **Hash-bearing provenance determinism is not stated.** `snapshotId` and `evidenceId` are **IN** the member preimage (§8.3), but the contract nowhere requires them to be deterministic. In the current runtime both are clock-derived (`evidenceId = ev_${engineId}_${clock.now()}`; `snapshotId` seeded with `${engineId}|${clock.now()}`), and both a wall-clock mode (`createClock('system')`) and a non-deterministic id mode (`createIdProvider('runtime')`) exist | `iips-platform/src/framework/evidence/EvidencePipeline.ts:50`; `iips-platform/src/snapshot/SnapshotService.ts:36`; `iips-platform/src/infrastructure/Clock.ts:21`; `iips-platform/src/infrastructure/IdProvider.ts:39` | **MEDIUM** | A producer configured with the wall-clock/id modes would emit a **per-run-varying `inputHash`**, in tension with A5-D09. The certified runtime configuration is `fixed`/`deterministic`, so the requirement is satisfiable; the contract should state it explicitly |
| `A8-S-03` | **`FAILED` result branch has no defined identity.** §10.2 admits `executionStatus = "FAILED"` and §10.3 defines a preimage containing that token, while §10.5 states a structurally failed execution "fails before result identity; no partial result is canonical". Whether a `FAILED` execution ever yields a canonical `resultId` (and if so, its mandatory member-result section) is therefore not stated | A6 §10.2, §10.3, §10.5 | **LOW–MEDIUM** | An implementer could reasonably emit either (i) no canonical result artifact, or (ii) a canonical zero-member-result `FAILED` envelope. Both readings are consistent with the text; only one can be conformant |
| `A8-S-04` | **Producer-side decimal determination rule is not pinned.** A5-D01 requires precision to come from "the canonical decimal representation supplied by the producer"; A5-D02 §4.2 explicitly leaves "the exact producer-side normalization mechanism" to later implementation; A6 §6.4 prohibits silent rounding and §6.5 requires text. No artifact states how ≤ 6-digit text is derived from an engine value that is already the result of a binary `Math.round`-style rounding to one decimal place (as all thirteen engines apply at pillar/composite level) | A5-D01/D02; A6 §6.4/§6.5; `r1h2e`/`r2` rounding in all 13 score engines | **MEDIUM** | This rule decides whether the existing certified numeric outputs may be re-expressed as text unchanged, or whether producer-side decimal arithmetic must be introduced (with certification consequences). It is assigned to implementation, so this record does **not** treat it as an open governance decision — but it is a mandatory component of any implementation-authorization scope |

### 4.4 Specification completeness determination

> **The durably published N4-A6 contract specification is COMPLETE AND INTERNALLY COHERENT FOR IMPLEMENTATION PLANNING.**

All required representations are fully defined; all four identity-bearing constructions are byte-exact and mutually consistent; the ordering, framing, status, error, and count semantics are closed; and the unresolved register (`A6-U-01`…`A6-U-06`) and the implementation dependency register (`A6-IMPL-01`…`A6-IMPL-10`) are honestly carried rather than papered over. The four findings above are **precision/ambiguity items of bounded scope** that require an explicit statement at implementation authorization; none invalidates the specification, and none is a hidden policy decision.

**Specification completeness is not implementation readiness.** Section 5 addresses the latter.

---

## 5. Implementation dependency assessment — `A6-IMPL-01` … `A6-IMPL-10`

Each register entry is independently assessed below from repository evidence at the verified baseline. **This gate assesses; it does not resolve, and it does not authorize.**

### 5.1 `A6-IMPL-01` — Producer-side canonical decimal text (≤ 6 fractional digits)

**Register claim:** `renorm()` returns an unrounded IEEE-754 quotient; canonical decimal text is not emitted.

**Verified.** The producer surface is numeric-only, with no text path:

| Evidence | Finding |
|---|---|
| `iips-platform/src/sector-engines/cross-sector/ontology/OntologyMapper.ts:12–24` | `EngineOutput` declares `composite`, `confidence`, `qualityScore`, `riskScore`, `growthScore`, `valuationScore`, `capitalEfficiency`, `franchiseScore` — **all `number`** |
| `iips-platform/src/sector-engines/*/scoring/*ScoreEngine.ts` (13/13) | Pillars and composites are `number`, produced by binary arithmetic and binary rounding (`r1h2e` / `r2` / `Math.round` / `roundHalfEven`) |
| `iips-platform/src/sector-engines/{auto,industrials,materials,technology,telecom}/scoring/*ScoreEngine.ts` | `renorm(...)` divides a float weighted sum by a float weight sum with **no rounding**; returns `0` when no constituent is available |
| Repository-wide search | Zero occurrences of a producer-side decimal-text emitter; the only governed decimal routine is **module-private** inside `ScreenDefinition.ts:104` (`function decimal`, not exported) |

**Answers to the six readiness questions:** specification **authoritative**; representation **fully defined**; producer **identified but non-conforming**; runtime owner **identifiable** (the Screen-input composition boundary, `A6-U-06`); dependencies **do not exist**; **no new policy decision**, but the decimal determination rule must be pinned (`A8-S-04`).

**Determination:** **IMPLEMENTATION DEPENDENCY — OPEN.** The register entry stands as HIGH. Existing producers **cannot** supply canonical decimal text with ≤ 6 fractional digits, exact reversible conversion, no silent rounding, no exponent notation, and non-finite rejection, because they expose values **only as IEEE-754 `number`** and their exact expansions routinely exceed six fractional digits (`A8-S-01`). **No producer file was modified.**

### 5.2 `A6-IMPL-02` — Producer-side growth availability preservation

**Register claim:** `renorm()` returns a bare `0` when no constituents are available, destroying availability before any boundary.

**Verified and materially extended.** Inspection of all thirteen engines shows the gap is **wider than `renorm()` alone**: **no engine carries an availability state, and none of the five distinct failure modes preserves the distinction the contract requires.**

| # | Engine(s) | Growth pillar behaviour on missing source | Availability preserved? |
|---|---|---|---|
| 1 | Industrials, Technology, Telecom, Automobile, Materials | `renorm()` → bare `0` when every constituent is absent | **No — destroyed** (`A6-IMPL-02` as recorded) |
| 2 | Insurance, Capital Markets | Missing metric → neutral default (`50` / `60`) then combined arithmetically → a fabricated numeric value indistinguishable from a computed one | **No — never existed; a fabricated neutral is emitted** |
| 3 | Banking | Growth pillar is the **constant `50`** placeholder, independent of any input | **No — no data dependency at all** |
| 4 | Consumer, Energy, Utilities, Hospitality | Band lookup **throws** (`no band for <metric> value NaN`) when a source metric is absent → the *execution fails* rather than the member reporting unavailable growth | **No — converted into an execution failure** |
| 5 | Healthcare | **No growth pillar exists.** `bandGrowth` is defined at `HealthcareScoreEngine.ts:33` and **never called**; the healthcare pillar set contains no growth member (and the engine substitutes permissive defaults for other missing inputs, e.g. utilization → 75) | **No — absent by construction** |

**Consequence for the contract:** A6 §7.3's producer→boundary mapping table (rows for `growth = null`, `undefined`, absent pillar, and *incomplete/missing source components*) has **no counterpart in any current engine**. For cases 2–5 the required classification (`UNAVAILABLE`) is not merely missing; the current behaviour is a *different observable outcome* (a fabricated value, or a thrown execution).

**Determination:** **IMPLEMENTATION DEPENDENCY — OPEN, HIGH.** Required by `A6-DR-01`; it cannot be satisfied by a boundary-side change because the availability condition is destroyed (or never represented) *before* the boundary. **`renorm()` and every engine were left unmodified.**

### 5.3 `A6-IMPL-03` — Per-member provenance plumbing

**Register claim:** `snapshotRef`/`evidenceRef` are optional; `metadata` is an untyped record.

**Verified, and stronger than recorded.** The NP12MBR preimage (§8.3) requires thirteen per-member fields. Five of them have **no representation on `EngineOutput` at all**:

| Required by §8.3 | Present on `EngineOutput`? | Where it exists today |
|---|---|---|
| `sector` | Yes (normalized by G1) | `ScreeningPopulationGuard` |
| `referenceId` | Yes (`companyId`), but no governed runtime origin (§5.10) | transport synthesises `${sector}-H1` |
| `populationIdentity` | No (population scope) | `ScreeningPopulation.identity` |
| `conviction`, `quality`, `growth` | Field names exist; values are `number`, not admissible text | engines / fixtures |
| `engineId`, `engineVersion` | **No** | `SectorPlugin.identity`, `EngineRegistry` |
| `calibrationVersion` | **No** | `ExecutionResult.metadata` for 4 of 13; `EngineRegistry` for 13 |
| `snapshotId` | **No** | `ExecutionResult.snapshotRef` (declared optional) |
| `evidenceId` | **No** | `ExecutionResult.evidenceRef` (declared optional) |

Nuance recorded in the producer's favour: the *runtime behaviour* of all thirteen engines already populates `snapshotRef` and `evidenceRef` on every `COMPLETED` result, and the pillar values are recorded into the in-memory `SnapshotStore` for all thirteen (`recordSnapshot(engineId, metrics, score.pillars, verdict)`). The declared type contract is weaker than the observed behaviour, and the values are reachable only through the store instance, whose pillar keys are engine-specific and are not mapped to the three Screen fields by any governed artifact.

**Determination:** **IMPLEMENTATION DEPENDENCY — OPEN, HIGH.** The composition boundary must bind and carry seven provenance items per member that the member record does not currently hold. **Nothing was modified.**

### 5.4 `A6-IMPL-04` — `calibrationVersion` coverage

**Register claim:** exposed in runtime metadata by only 4 of 13 engines.

**Verified exactly.** `calibrationVersion: this.calibration.version` appears inside the returned `ExecutionResult.metadata` for **Auto, Materials, Technology, Telecom only** (`AutoEngine.ts:113`, `MaterialsEngine.ts:115`, `TechnologyEngine.ts:124`, `TelecomEngine.ts:112`). The other nine engines pass it to the evidence builder but not to their result metadata. The governed `EngineRegistry.CERTIFIED_ENGINES` carries `calibrationVersion: '1.0.0'` for all thirteen, so the value exists in a governed artifact — but it is **not on the runtime member path**, and whether the registry or the runtime is authoritative for the hashed member field is a planning decision, not a resolved fact.

**Determination:** **IMPLEMENTATION DEPENDENCY — OPEN, HIGH (as recorded).** No file modified.

### 5.5 `A6-IMPL-05` — Member-value → fixed-point key conversion

**Register claim:** the governed decimal routine exists only inside the Definition module.

**Verified.** `decimal()` (`ScreenDefinition.ts:104`) is **not exported**; the module's public surface is `ScreeningField`, `ScreeningOperator`, `ScreeningPredicate`, `ScreenDefinitionInput`, `ScreenDefinitionErrorCode`, `ScreenDefinitionError`, `ScreenDefinition`. The routine implements exactly the A6 §6.1–6.3 rule (lexical form, ≤ 6 fractional digits, range `[0,100]`, bigint fixed-point key, canonical text, `-0` → `0`, rejection of negatives, exponent forms, and over-precision) and is proven by the N4-SD conformance fixtures. It is **reusable in principle** for member values, but it is neither exposed nor wired to a member boundary.

**Determination:** **IMPLEMENTATION DEPENDENCY — OPEN, MEDIUM (as recorded).** No file modified.

### 5.6 `A6-IMPL-06` — Screen evaluator with identity and version

**Verified:** repository-wide search finds **no** evaluator of any kind — no occurrence of `evaluatorId`, `executionSemanticsVersion`, `inputHash`, `executionId`, `resultId`, `NP12MBR`, `NP12EXE`, or `NP12RES` in `iips-platform/src`, `frontend/src`, or `frontend/server`. The only existing evaluation-like constructs are the per-engine *decision* engines (verdicts over a single sector) and the CSIP presentation pipeline — neither evaluates screening predicates over a population.

**Determination:** **IMPLEMENTATION DEPENDENCY — OPEN, HIGH.** Not implemented; `evaluatorId`, `evaluatorVersion`, and `executionSemanticsVersion` remain unassigned (`A6-U-02/03/04`) as explicitly recorded by A6.

### 5.7 `A6-IMPL-07` — ScreenExecution runtime

**Verified:** no ScreenExecution runtime, no execution envelope, no `NP12EXE` serializer, no member-binding accumulation anywhere in the repository. The `CrossSectorEngine` pipeline exists and already invokes the G1–G5 population guard, but it performs no member evaluation and produces no execution identity.

**Determination:** **IMPLEMENTATION DEPENDENCY — OPEN, HIGH.**

### 5.8 `A6-IMPL-08` — ScreenResult runtime and member-result model

**Verified:** no result model, no member-result status/error representation, no `NP12RES` serializer, and no count semantics implementation. `ExecutionResult.state` (`'COMPLETED' | 'FAILED' | 'CANCELLED'`) belongs to the plugin contract and is unrelated to `executionStatus`; the ScreenResult status vocabulary has no implementation.

**Determination:** **IMPLEMENTATION DEPENDENCY — OPEN, HIGH.**

### 5.9 `A6-IMPL-09` — Serialization must consume G5 order verbatim

**Verified.** `ScreeningPopulation.compareMembers` (`ScreeningPopulation.ts:152`) orders by `sector` then `referenceId` using JavaScript string comparison, i.e. **UTF-16 code-unit order**, exactly as A6 §12 states. No member serializer exists yet, so the UTF-16/UTF-8 divergence above U+FFFF is latent. No in-repository reference identifier contains a scalar above U+FFFF — the only producer synthesises ASCII `${sector}-H1` values — so the divergence is currently **unreachable**, but the constraint remains normative for any future reference-id source.

**Determination:** **IMPLEMENTATION CONSTRAINT — OPEN, LOW (as recorded).** Correctly classified. No file modified.

### 5.10 `A6-IMPL-10` — Source convergence across all 13 engines (CRITICAL)

> This item was **not assessed** by the halted previous attempt and must not be treated as satisfied. It is assessed here for the first time.

**Register claim:** the only in-repository `EngineOutput[]` producer mixes a live `composite` with frozen golden-fixture quality and growth — expressly inadmissible under A5-D06.

**Verified, and the finding is more severe than recorded.**

**(a) The producer is exactly as described.** `frontend/server/executive-transport.ts` `computeCertifiedPlatform()` is the **only** non-test `EngineOutput[]` producer in the repository (confirmed by repository-wide search; every other occurrence is a test fixture). For each of the 13 sectors it:
- runs the engine through the real runtime (`runtime.execute(...)`) and takes `composite`, `verdict`, and `overridesApplied` from the **live** result;
- takes `qualityScore`, `riskScore`, `growthScore`, `franchiseScore` from `csipInputs(sector, GOLDEN_PILLARS)`, i.e. from the **frozen `*-expected-outputs-1.0.0.json` fixtures** (`loadGoldenPillars()`, lines 96–121, 184–196);
- takes `valuationScore`/`capitalEfficiency` from the same fixtures;
- hardcodes `confidence: 0.8`;
- synthesises `companyId: \`${s.sector}-H1\``.

A5-D06 forbids precisely this combination as an authoritative Screen member-value source. The mixed-source pattern is confined to the member-**value** sourcing; `composite` is genuinely live.

**(b) No engine emits a company identifier at all.** `companyId` occurs **only** in the cross-sector types and their consumers; it appears in **no** sector-engine file and in no engine fixture. The `${sector}-H1` reference identifier is a transport-layer synthesis. The pipeline itself supports many reference identifiers within one sector (G1–G5 already enforce that), but the **only runtime producer emits exactly one member per sector** (13 members total), and `referenceId` has **no governed runtime source**. Any population containing two reference identifiers in one sector is unsourceable from the runtime path today. This is a *convergence* gap in the strict sense, not only a provenance gap.

**(c) An admissible source path exists but is not wired.** All thirteen engines record their full pillar set into the in-memory `SnapshotStore` on every execution, so the live runtime already holds quality- and growth-bearing values for all thirteen engines — keyed by engine-specific pillar names. What is absent is: (i) a declared accessor for those values at a composition boundary, (ii) a governed mapping from engine pillar names to the three Screen fields (`quality` and `growth` have no governed per-engine source mapping anywhere; the only in-repo mapping is the hardcoded `csipInputs` table, which covers 5 sectors explicitly and 8 by a `pick('quality')`/`pick('growth')` default, and reads fixtures), and (iii) durable carriage of the values and their provenance.

**(d) The producer file is outside every type-checked project.** `iips-platform/tsconfig.json` includes `src/**/*.ts`; `frontend/tsconfig.json` includes `["src", "vite.config.ts"]`. `frontend/server/**` is therefore **excluded from both typechecks**, and no root configuration or CI workflow exists. The known `EngineOutput` type breach recorded as `A4-G13` (`growthScore?: number` receiving `null` at line 191, `qualityScore: number` receiving `null` at line 189) is consequently invisible to `tsc`. The producer that the Screen contract depends on is **not type-checked**.

**Determination:** **IMPLEMENTATION DEPENDENCY — OPEN, CRITICAL, and INDEPENDENTLY CONFIRMED.** `A6-IMPL-10` remains open. **No engine, producer, fixture, test, or transport file was modified.**

### 5.11 Dependency register summary

| ID | Register severity | Independently verified? | Status after assessment |
|---|---|---|---|
| `A6-IMPL-01` | HIGH | Yes — confirmed and quantified (`A8-S-01`) | **OPEN** |
| `A6-IMPL-02` | HIGH | Yes — confirmed, **extended to 13/13 engines** with five distinct failure modes | **OPEN** |
| `A6-IMPL-03` | HIGH | Yes — confirmed, **extended: five §8.3 fields absent from `EngineOutput`** | **OPEN** |
| `A6-IMPL-04` | HIGH | Yes — confirmed exactly (4 of 13) | **OPEN** |
| `A6-IMPL-05` | MEDIUM | Yes — confirmed (routine private to the Definition module) | **OPEN** |
| `A6-IMPL-06` | HIGH | Yes — confirmed (no evaluator) | **OPEN** |
| `A6-IMPL-07` | HIGH | Yes — confirmed (no execution runtime) | **OPEN** |
| `A6-IMPL-08` | HIGH | Yes — confirmed (no result runtime) | **OPEN** |
| `A6-IMPL-09` | LOW | Yes — confirmed (UTF-16 comparator; divergence currently unreachable) | **OPEN (constraint)** |
| `A6-IMPL-10` | CRITICAL | Yes — confirmed, **extended**: mixed sources, no reference-id source, at most one member per sector, ungoverned field mapping, producer outside typecheck | **OPEN — NOT SATISFIED** |

**Resolved dependencies: none.** No `A6-IMPL-*` item is satisfied at this baseline.

---

## 6. Certification readiness — and the certification impact of `A6-IMPL-10`

A6 §20 requires this gate to address the `A6-IMPL-10` all-13-engine source convergence dependency **and its certification impact explicitly**.

### 6.1 Certification status of the affected surface

| Item | Status | Evidence |
|---|---|---|
| `IES-006…015` (10 engines) | **CERTIFIED** — E2E-030 10-engine LTS (certified at `286f3da`) | `docs/integration/IIPS_v3.0_E2E-030_CERTIFICATION.md` §§1–11 |
| `IES-016/017/020` (3 engines) | **CERTIFIED** — E2E-025→029 evidence complete; 13-engine E2E-030 **delta** certified 2026-09-04 | `docs/integration/IIPS_v3.0_E2E-025_029_DEFERRED_ENGINE_CERTIFICATION.md`; `…E2E-030_CERTIFICATION.md` §12 |
| All 13 engines | **FROZEN** — D38 freeze manifests with pinned SHA-256 hashes for calibration, golden dataset, expected outputs, and replay dataset (e.g. hospitality: `0869096c…`, `bcc0b9c9…`, `9615fc98…`, `9099bad9…`); `45/45 MATCH` for the deferred set | `ies-0*/IES-0*_FREEZE_MANIFEST.json` |
| Replay identity | `PROGRAM_v1.1_REPLAY_BASELINE.json` v1.1.0, 13 sectors, runtime configuration `clock= fixed`, `idProvider= deterministic`, `rounding= round-half-to-even at composite only`, `boundarySemantics= lower-inclusive/upper-exclusive` | `program-v1.1-certification/` |
| Per-engine acceptance evidence | Acceptance/regression suites reproduce each engine's frozen expected outputs (e.g. `technology-acceptance.test.ts` reproduces 13 frozen expected outputs) | `iips-platform/tests/regression/` |

### 6.2 Why the certification impact is **not** confined to metadata

The register describes `A6-IMPL-10` as a *source-selection* problem (live composite + fixture quality/growth). Section 5.2 shows the producer problem is **behavioural**, and this determines the certification impact:

1. **Five engines (`renorm`) destroy availability** — satisfying `A6-DR-01` requires them to expose an availability condition that currently exists only as an internal branch (`avail.length === 0`), i.e. a change to the engine emission surface.
2. **Two engines fabricate neutral growth for missing sources** (Insurance `50`, Capital Markets `60`). Under A6 §7.3 those producer conditions map to **`UNAVAILABLE`**, so a conforming producer would change a member's growth from a matchable numeric value to a non-matchable state for members whose source metrics are missing. This is an **observable outcome change**, not an added field.
3. **One engine's growth is a constant placeholder** (Banking `50`), which is neither "unavailable" nor "a genuine calculated value" under the vocabulary of `A6-DR-01`; assigning it a classification is a producer decision with observable Screen consequences.
4. **One engine has no growth pillar at all** (Healthcare), which the contract already handles as `UNAVAILABLE` (consistent with N3 §7 and A5-D07) — the only engine whose required classification is already known.
5. **Three engines convert missing source data into execution failure** (band `throw`), which the contract distinguishes from member-level unavailability.

Additionally, the *member identity* dimension is unserviceable today: with no engine-supplied `companyId`, the Screen population cannot exceed one member per sector from the runtime path.

**Certified replay outputs are not asserted to be at risk** for the frozen configurations, because the frozen replay inputs are complete: the divergence above manifests in the missing-source regime, which the replay baseline does not exercise. That qualification is a *reason for a bounded impact assessment*, not a licence to assume the impact benign — and the impact assessment is not performed by this gate.

### 6.3 Certification readiness determination

> **CERTIFICATION READINESS: NOT ESTABLISHED.**

- **Zero of thirteen** engines demonstrably satisfies the A6 contract. No engine emits canonical decimal text; no engine preserves growth availability; `calibrationVersion` is on the runtime metadata path for only four; the only `EngineOutput[]` producer is inadmissible under A5-D06 and outside both typechecked projects.
- Any producer-side change required for conformance lands inside at least one **active** certification envelope (E2E-030 10-engine LTS, the 13-engine delta, the D38 freeze manifests, and the v1.1 replay baseline), and per A6 §15 and A5-D06 §8.2 such changes are **not authorized** by any published record and must not modify existing fixtures or tests.
- Consequently the certification impact of `A6-IMPL-10` must be addressed by a **separate bounded authority decision that states explicitly which certification artefacts are to be re-established, which are preserved, and on what evidence** — rather than assumed.

---

## 7. Separation of the four readiness concepts (normative)

| Concept | Definition | Determination at this baseline |
|---|---|---|
| **Specification completeness** | Whether the contract text defines every required representation, producer, hash membership, ordering, and error semantic coherently enough to plan implementation | **COMPLETE FOR IMPLEMENTATION PLANNING** — with four bounded precision/ambiguity items (§4.3) |
| **Implementation readiness** | Whether the repository currently contains everything needed to implement the contract | **NOT READY** — ten open dependencies; none resolved; no member input, evaluator, execution, or result runtime exists |
| **Certification readiness** | Whether the engines/producers demonstrably conform, and whether the certification impact of conformance work is bounded | **NOT ESTABLISHED** — 0 of 13 conformant; certification envelopes actively constrain producer change |
| **Implementation authority** | Whether Program Authority has granted the right to write runtime behaviour | **NOT GRANTED** — and not grantable by this record |

These four are **not collapsed**. In particular: *specification completeness does not imply implementation readiness; implementation readiness would not imply certification readiness; and none of the three constitutes or confers implementation authority.* Successful A6 publication is **not** implementation authorization.

---

## 8. Readiness determination

> ## **SPECIFICATION READY FOR IMPLEMENTATION PLANNING — IMPLEMENTATION NOT READY — CERTIFICATION NOT ESTABLISHED — IMPLEMENTATION AUTHORITY NOT GRANTED**

| Prerequisite | Status |
|---|---|
| A6 contract durably published and remotely verified | **YES** (Section 2) |
| Contract representation fully defined for every required component | **YES** (Section 4.1) |
| Contract internally coherent and consistent with N1–N4/N4-SD/A3/A5/G1–G5 | **YES** (Section 4.2) |
| Bounded specification findings recorded rather than papered over | **YES** — `A8-S-01`…`A8-S-04` (Section 4.3) |
| Producers can supply the required member inputs today | **NO** — `A6-IMPL-01`, `-02`, `-03`, `-04`, `-10` open |
| Member-value → fixed-point conversion available for members | **NO** — routine exists but is private to the Definition module (`A6-IMPL-05`) |
| Screen evaluator exists | **NO** — `A6-IMPL-06` |
| ScreenExecution runtime exists | **NO** — `A6-IMPL-07` |
| ScreenResult runtime exists | **NO** — `A6-IMPL-08` |
| `A6-IMPL-10` `CRITICAL` source convergence addressed | **NO** — assessed for the first time here and **confirmed open** |
| Certification impact of producer conformance bounded by an authority decision | **NO** — not performed by this gate |
| Implementation authority granted | **NO** |

### 8.1 What this determination means

It means the **contract is ready to be planned against and is not yet implementable**, and that the remaining work is concentrated on the **producer and runtime side**, not in the specification. It is a determination, **not** an authorization: this record grants no implementation authority, and no predecessor record does either.

---

## 9. What the next authority decision must address

Per A6 §20, this gate was required to obtain an explicit grant of implementation authority from the Program Authority. **This record does not grant it, and its determination is that a grant would be premature in its full scope.** The following items are the complete decision surface for the next gate; each is bounded, and none reopens closed governance.

### 9.1 Items requiring explicit Program Authority decision

| # | Item | Why authority is required |
|---|---|---|
| D1 | **Producer conformance scope for the 13 engines** — which engines' emission surfaces may change, and whether scoring arithmetic may change | A6 §15.2 and A5-D06 §8.2 prohibit engine modification without separate bounded authorization |
| D2 | **Certification impact disposition** — which certification artefacts (E2E-030 10-engine, 13-engine delta, D38 freeze manifests, v1.1 replay baseline, per-engine acceptance evidence) are re-established, which are preserved, and on what evidence | Explicitly required by A6 §14.1/§20; cannot be assumed |
| D3 | **Growth availability representation across all 13 engines**, including disposition of Banking's constant placeholder, the fabricated neutrals in Insurance/Capital Markets, and the throw-on-missing behaviour in Consumer/Energy/Utilities/Hospitality | The producer→boundary mapping table of A6 §7.3 has no current counterpart; the change is observable, not additive |
| D4 | **Producer decimal determination rule** (`A8-S-04`) — the exact mechanism by which ≤ 6-fractional-digit canonical text is derived from a value produced by binary arithmetic | A5-D02 §4.2 assigns the mechanism to implementation; the choice determines whether certified numeric outputs stay numeric-identical |
| D5 | **`referenceId` runtime source** — which governed runtime artefact supplies the opaque reference identifier, and whether multi-member-per-sector populations are in scope | No engine emits one; the current producer synthesises `${sector}-H1` |
| D6 | **Per-engine mapping from engine-produced quantities to `conviction`/`quality`/`growth`** and the authority of that mapping | No governed artifact defines it; the only in-repo mapping is an un-typechecked hardcoded table reading fixtures |
| D7 | **Determinism requirement for hash-bearing provenance** (`A8-S-02`) — confirm that `snapshotId`/`evidenceId` entering the member preimage must be runtime-configuration-independent, and whether the contract text is amended or the constraint is pinned in the authorization | A5-D09 forbids nondeterministic runtime state in identity; A6 does not state the requirement for these two fields |
| D8 | **`FAILED` result branch** (`A8-S-03`) — whether a structurally failed execution yields a canonical `resultId` | §10.2/§10.3 versus §10.5 admit two readings |
| D9 | **Owner and location of the Screen-input composition boundary** (`A6-U-06`) and the assignment of `evaluatorId` / `evaluatorVersion` / `executionSemanticsVersion` (`A6-U-02/03/04`) | Explicitly deferred to implementation authorization by A6 §13 |
| D10 | **Whether authority is granted as a whole or incrementally**, and if incrementally, the first bounded increment and its acceptance evidence | This gate's determination is that the full-scope grant is premature; a bounded first increment is a Program Authority choice, not a gate finding |

### 9.2 What any grant must not authorize

Consistent with A6 §15.1 and §18, no implementation authorization may authorize an implementer to decide or change: member identity semantics; the availability vocabulary or its octet values; growth evaluation semantics; numeric admission or equivalence; field order; member order; framing; integer width, signedness or byte order; header or format-version octets; status token spellings; population representation or binding; digest membership; or message termination. Any genuine conflict with a frozen rule returns to Program Authority rather than being resolved by an implementer.

### 9.3 Recommended next gate

> **NEXT GATE: NP-12 N4-A9 — Implementation Authority Decision (producer convergence + Screen runtime)**

Its inputs are this record (determination and gap register), the A6 contract specification, and the Program Authority's answers to D1–D10. It must not reopen N1–N4, N4-SD, the N4 identifier governance, the frozen `NP12DEF`/`01` grammar, B0–B5, or N4-A1…N4-A6.

---

## 10. Authority boundary and non-actions

This record:

1. implements **no** runtime behaviour, and authorizes none;
2. creates **no** serializer, decoder, evaluator, execution runtime, or result runtime;
3. modifies **no** sector engine, **no** `renorm()`, **no** `EngineOutput`, `NormalizedHolding`, `OntologyMapper`, `ScreeningPopulationGuard`, or `ScreenDefinition`;
4. modifies **no** test, fixture, CSIP asset, golden value, calibration profile, freeze manifest, or replay baseline;
5. executes **no** test, no engine, and no Screen evaluation;
6. does **not** reopen or reinterpret N1, N2, N3, N4, N4-SD, the N4 definition identifier governance, the frozen `NP12DEF`/`01` byte grammar, B0–B5, or N4-A1 through N4-A6;
7. does **not** rebind the frozen N4-A1 baseline (`f2886a5a…` / `46c1a15b…`) — referenced only, and verified;
8. does **not** grant implementation authority, certification, conformance, acceptance, or release status to any engine, producer, or component;
9. treats **IPD** as reference-only (not accessed; zero mutations) and **Production** as out of scope;
10. performs exactly one repository mutation: **the creation of this record**.

---

## 11. Artifact provenance and publication metadata

| Item | Value |
|---|---|
| Artifact path | `NP-12-N4-A8-IMPLEMENTATION-READINESS-DETERMINATION.md` |
| Authoritative repository | `ramkivs/iips-review-recovered` |
| Authoritative ref | `refs/heads/main` |
| Specification baseline consumed | `NP-12-N4-A6-CONTRACT-SPECIFICATION.md`, blob `3407ea22eaa15e508744f2e6c4f81097242e0dce`, SHA-256 `2c889c3c5dec346b6c2270c76c746f183804ad78af87d5d26393ba6cc3427531` — **verified remotely at gate start** |
| Verified `origin/main` at gate start | `0d00ac1fd6798d63c56eb7a0fe4da77034b21f2b`, tree `0b87b9770882e85b6ff793d0aa13e1ec109b6fff` |
| N4-A5 predecessor artifact | `NP-12-N4-A5-AUTHORITY-DECISION-RECORD.md`, blob `0aaffdfaa9fcffb20255666d970ed9d1dad1d68e` — **verified remotely** |
| N4-A1 immutable bound baseline | commit `f2886a5af43ad8df8676589daef86836039150f5` / tree `46c1a15bbcd1291701484457d1fe9815d8538888` — fetched explicitly, **verified**, referenced, **not rebound** |
| Recording branch | `arena/01a0fd58-iips-review-recovered` |
| Permitted changed paths | exactly one: this artifact |
| Effectiveness condition | Authoritative `main` publication **and** independent remote verification of artifact path, blob, commit, tree, and byte content |

**Self-reference rule:** this record does not state its own commit, tree, or blob hash. Those are established by the publication receipt and independent remote verification, and are never fabricated inside the artifact.

**Durability rule:** local or Arena-only presence is **not** completion. Until authoritative `main` contains this record and it has been independently verified there, it is a prepared artifact and confers no authority.

---

## 12. Final governance statement

The durably published N4-A6 Screen contract specification was independently verified on the authoritative remote and consumed as the specification baseline. Assessed against repository evidence at that baseline, it is **complete, internally coherent, and sufficient to support implementation planning**, with four bounded precision/ambiguity findings recorded rather than resolved.

It is **not implemented, and not implementable today**. All ten implementation dependencies remain open; `A6-IMPL-10` — the CRITICAL all-13-engine source convergence dependency that the halted previous session never assessed — is independently confirmed open, and is broader than recorded: there is no admissible producer path, no governed reference identifier, no governed mapping from engine quantities to the three admitted Screen values, no growth-availability carriage in any engine, and the sole `EngineOutput[]` producer sits outside every typechecked project while mixing live and fixture-derived member values.

No engine is conformant; certification readiness is **not established**; the certification impact of producer-side conformance work is constrained by active certification and freeze envelopes and must be disposed of by a separate explicit authority decision.

> **Specification readiness is readiness for a separate implementation-authority decision only. Implementation authority is NOT GRANTED.**

**End of NP-12 N4-A8 implementation readiness determination record.**
