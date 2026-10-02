# NP-12 N4-A9 — Implementation Authority Decision

**Record identifier:** `NP-12-N4-A9`
**Record type:** Program Authority authority-decision record — approved decisions `A9-D01`, `A9-D02`, `A9-D03`
**Workstream:** NP-12 — Governed Screener
**Gate:** NP-12 N4-A9 — Implementation Authority Decision
**Program Authority / Signer:** Ramki (Ramakrishnan)
**Mode:** Authority determination only — **no implementation**
**Repository:** `ramkivs/iips-review-recovered` (IRR) — authoritative ref `refs/heads/main`
**IPD:** `ramkivs/iips-production-market-data` — reference-only, not accessed, zero mutations
**Production:** OUT OF SCOPE, zero mutations
**Implementation:** **NONE.** No source, test, fixture, runtime, engine, or `renorm()` change.
**Implementation authority:** **BOUNDED — INCREMENT 1 GRANTED** (`A9-D01`). Nothing beyond Section 11 is authorized; producer convergence remains **UNAUTHORIZED**.
**Publication status of this record:** **PUBLICATION AUTHORIZED** (`A9-D03`). Durable publication and independent remote verification are performed by the publishing session; until then this record is not effective. See §3.3 and §12.

---

## 1. Required output 1 — live authoritative baseline verification

### 1.1 Verification at gate entry (before the one authorized operation)

| Item | Expected | Observed live | Result |
|---|---|---|---|
| `refs/heads/main` | `0d00ac1fd6798d63c56eb7a0fe4da77034b21f2b` | `0d00ac1fd6798d63c56eb7a0fe4da77034b21f2b` (`git ls-remote`) | **MATCH** |
| `main` tree | — | `0b87b9770882e85b6ff793d0aa13e1ec109b6fff` | recorded |
| A6 artifact present on `main` | `NP-12-N4-A6-CONTRACT-SPECIFICATION.md` | present | **MATCH** |
| A6 blob | `3407ea22eaa15e508744f2e6c4f81097242e0dce` | `3407ea22eaa15e508744f2e6c4f81097242e0dce` | **MATCH** |
| A6 SHA-256 | `2c889c3c5dec346b6c2270c76c746f183804ad78af87d5d26393ba6cc3427531` | `2c889c3c5dec346b6c2270c76c746f183804ad78af87d5d26393ba6cc3427531` | **MATCH** |
| N4-A1 bound commit | `f2886a5af43ad8df8676589daef86836039150f5` | present (fetched explicitly) | **MATCH** |
| N4-A1 bound tree | `46c1a15bbcd1291701484457d1fe9815d8538888` | `46c1a15bbcd1291701484457d1fe9815d8538888` | **MATCH** |
| **A8 artifact on `main`** | (under check) | **ABSENT** | **discrepancy** — see §3 |

No expected value differed. The N4-A1 baseline is referenced, **not rebound**.

### 1.2 Durability verification after the one authorized operation

Program Authority authorized publication of the A8 artifact during this gate (§3.2). PR #21 was merged with a **merge commit** (no squash, no rewrite; artifact content unchanged), and durability was then verified **separately against the live remote**:

| Item | Value |
|---|---|
| New `refs/heads/main` | `5d78e302c38fa80867beb1bc10694fba40db8cbb` |
| New `main` tree | `32a69fa35c1a61b3f0fbc7049b93789865f65cad` |
| A8 artifact path on `main` | `NP-12-N4-A8-IMPLEMENTATION-READINESS-DETERMINATION.md` — **present** |
| A8 blob on `main` | `851783366c2a791aced31161948486a28022e866` — **identical to pre-merge** |
| A8 SHA-256 on `main` | `182e85e22c6b42abb530178011bd088c8d3858a0fb8b11a536ec0f4408d88979` — **identical to pre-merge** |
| A6 blob / SHA-256 on new `main` | `3407ea22…` / `2c889c3c…` — **unchanged** |

**A8 is now durably published and independently verified. Its publication act is effective from this gate.**

---

## 2. Required output 2 — A8 evidence verification

The A8 investigation was re-verified independently at the verified baseline. Findings were **not** taken on trust.

### 2.1 Re-verified as correct

| A8 finding | Independent re-verification | Result |
|---|---|---|
| Decimal: `828,619 / 1,030,301 = 80.4%` exact expansions exceed 6 fractional digits for the governed `(0.40, 0.35, 0.25)` weighting over integer band scores 0–100 | Recomputed by exact rational arithmetic over all 1,030,301 combinations | **828,619 (80.4249 %)** — **exact match**; max exact expansion observed **53 digits**; worked example `Fraction(0.35) = 3152519739159347/9007199254740992` |
| All 13 engines certified and frozen; D38 manifests carry pinned hashes; v1.1 replay baseline frozen at 13 sectors | Inspected `PROGRAM_v1.1_REPLAY_BASELINE.json` (13 sectors, `clock=fixed`, `idProvider=deterministic`), `IES-016/017/020_FREEZE_MANIFEST.json`, E2E-030 §12 | **confirmed** |
| `calibrationVersion` on runtime metadata for only 4 of 13 engines | Counted `calibrationVersion: this.calibration.version` occurrences across all 13 engine files (occurrences in Auto, Materials, Technology, Telecom only) | **confirmed (4 of 13)** |
| Five §8.3 preimage fields absent from `EngineOutput` | Inspected `EngineOutput` declaration: only `companyId`, `sector`, `composite`, `confidence`, `riskScore`/`qualityScore`/`growthScore`/`valuationScore`/`capitalEfficiency`/`franchiseScore`, `verdict` | **confirmed** — none of `engineId`, `engineVersion`, `calibrationVersion`, `snapshotId`, `evidenceId` is present |
| No engine emits a `companyId` | Repository-wide search: `companyId` occurs only in cross-sector types/consumers and the transport synthesis | **confirmed** |
| Producer outside both typechecked projects | `iips-platform/tsconfig.json` includes `src/**/*.ts`; `frontend/tsconfig.json` includes `["src","vite.config.ts"]` → `frontend/server/**` excluded from both | **confirmed** |
| No evaluator, serializer, or Screen runtime exists | Repository-wide search for `inputHash`, `executionId`, `resultId`, `evaluatorId`, `executionSemanticsVersion`, `NP12MBR`, `NP12EXE`, `NP12RES` across `iips-platform/src`, `frontend/src`, `frontend/server` | **confirmed — zero occurrences** |
| 13 engines; producer synthesises `${sector}-H1` (one member per sector) | Counted engine directories; inspected transport synthesis | **confirmed** |

### 2.2 Conditions on the use of A8

**A8 is used as the factual readiness evidence.** It is **not** used as authority, and no A8 determination is treated as an authorization. A8's own header states `Implementation authority: NOT GRANTED`; that stands.

**One documented citation correction is recorded** (§9, `A8-S-01`): A8 §5.1 quotes `A6-IMPL-01` as saying `renorm()` is "non-terminating in decimal for most governed weightings". The published `A6-IMPL-01` register text (`NP-12-N4-A6-CONTRACT-SPECIFICATION.md` line 647) reads **"unrounded IEEE-754 quotient `Σ(s·w) / Σw`"** and does not contain that phrase; the phrase appears only in `NP-12-N4-A3-AUTHORITY-DECISION-RECORD.md:383` as "unrounded pillar values exceeding six decimal places". The substantive point is unaffected and the A8 quantification is correct, but the verbatim attribution is imprecise.

---

## 3. Required output 3 — A8 publication-authority status

### 3.1 Status at gate entry — DISCREPANCY CONFIRMED

| Check | Finding |
|---|---|
| A8 artifact present on authoritative `main` | **NO** |
| Pull request carrying it | **#21 — `OPEN`, unmerged**, head `arena/01a0fd58-iips-review-recovered` |
| Explicit Ramki publication authorization in the authoritative record at gate entry | **NONE FOUND** |

**The A8 gate expressly required separate publication authorization.** None existed. Accordingly, before the ruling in §3.2, the correct status was:

> `NP-12-N4-A8-IMPLEMENTATION-READINESS-DETERMINATION.md` was a **prepared artifact**. Its content was **investigation evidence**, not an authoritative governance act.

It was **not** silently ratified; the discrepancy is reported here explicitly. No amendment, deletion, or rewrite of the artifact was performed at any point — before or after publication.

### 3.2 Ramki's explicit ruling, recorded during this gate

> **"Authorize publication — merge PR #21 as-is."**

This is an **explicit Program Authority authorization**, given during N4-A9, satisfying the A8 gate's publication-authority requirement. It is recorded here as an authority act, and the required durability verification was performed **separately** (§1.2).

### 3.3 Effect

| Object | Status after this gate |
|---|---|
| The A8 **investigation** | Factual readiness evidence (unchanged use) |
| The A8 **artifact** | **AUTHORITATIVE GOVERNANCE ACT** — durably published on `refs/heads/main` at `5d78e302…`, blob `85178336…`, SHA-256 `182e85e2…` |
| Implementation authority conferred by A8 publication | **NONE** — unaffected by publication |
| This A9 record | **PUBLICATION AUTHORIZED** (`A9-D03`); prepared with `A9-D01`–`A9-D03` recorded as approved. Not yet effective — publication and independent durability verification are pending in the publishing session |

---

## 4. Required output 4 — D1–D10 decision analysis

Classification vocabulary: **G** = already governed; **I** = ordinary implementation design; **A** = requires explicit authority; **C** = certification-related.

### D1 — Producer conformance scope for the 13 engines

| | |
|---|---|
| **Factual issue** | No engine can supply the A6 member contract. Which engines' emission surfaces may change, and whether scoring arithmetic may change, is undecided. A6 §15.2 and A5-D06 §8.2 prohibit engine modification without separate bounded authorization. |
| **Classification** | **A + C** |
| **Implementation consequence** | Determines whether the Screen contract can be fed from the runtime at all, and whether certified numeric outputs change. |
| **Smallest authority scope** | Authority to modify the emission surface of a **named subset** of engines, additive-only, with a stated certification disposition. |
| **Ramki's ruling** | **Option B — bounded implementation increment, with non-conformant engines explicitly excluded from conformance/certification claims.** Full 13-engine convergence is **NOT** authorized in this gate. |

### D2 — Certification impact disposition

| | |
|---|---|
| **Factual issue** | Producer-side work lands inside active certification and freeze envelopes (E2E-030 10-engine LTS, the 13-engine delta, D38 manifests, v1.1 replay baseline). |
| **Classification** | **C** |
| **Implementation consequence** | Decides which certification artefacts are re-established, which are preserved, and on what evidence. |
| **Smallest authority scope** | A certification-disposition decision **attached to the specific incremental work**, not a blanket disposition. |
| **Ramki's ruling** | **Implicit and clean for the approved increment: Increment 1 touches no engine and no certified artefact, so no certification impact arises and no disposition is required.** A disposition remains mandatory for any producer-convergence increment. See §10. |

### D3 — Growth availability representation across the 13 engines

| | |
|---|---|
| **Factual issue** | 5 engines destroy availability through `renorm()`; 2 emit fabricated neutral growth defaults (Insurance `50`, Capital Markets `60`); 1 is a constant placeholder (Banking `50`); 3 throw on missing input (Consumer, Energy, Utilities, Hospitality band lookups); 1 has no operative growth pillar (Healthcare — `bandGrowth` defined but never called); **0 of 13 carry explicit availability**. |
| **Classification** | **A** (producer-side) + **A** (the Banking placeholder classification) |
| **Implementation consequence** | Satisfying `A6-DR-01` requires a producer change that is **observable**, not additive: a fabricated neutral or a constant placeholder would have to become `UNAVAILABLE` for genuinely missing sources. |
| **Smallest authority scope** | Per-engine availability carriage for a named subset, with the neutral-default and placeholder dispositions stated explicitly. |
| **Ramki's ruling** | **Deferred.** Not authorized in this gate. The Banking placeholder is **explicitly deferred** to the producer-convergence gate (Option B). See §6. |

### D4 — Producer decimal determination rule (`A8-S-04`)

| | |
|---|---|
| **Factual issue** | No artefact pins how ≤ 6-fractional-digit text is derived from a value produced by binary arithmetic and binary rounding. A5-D02 §4.2 assigns "the exact producer-side normalization mechanism" to later implementation. |
| **Classification** | **I** (assigned by A5-D02) — but **C**-consequential |
| **Implementation consequence** | Decides whether existing certified numeric outputs may be re-expressed as text unchanged, or whether producer-side decimal arithmetic is introduced. |
| **Smallest authority scope** | Pin the rule inside the producer-convergence authorization, with the certification consequence stated. |
| **Ramki's ruling** | **Deferred** — belongs to the producer-convergence increment. **Does not block Increment 1** (§7). |

### D5 — `referenceId` runtime source

| | |
|---|---|
| **Factual issue** | No engine emits `companyId`; the sole producer synthesises `${sector}-H1`. At most one member per sector is sourceable from the runtime today. |
| **Classification** | **A** |
| **Implementation consequence** | Governs whether multi-member-per-sector populations are in scope, and what the opaque reference identifier actually denotes. |
| **Smallest authority scope** | Name the governed runtime artefact that supplies `referenceId`, and state whether multi-member populations are in scope for the increment. |
| **Ramki's ruling** | **Deferred** to the producer-convergence gate. Increment 1 consumes a **supplied** reference identifier and asserts nothing about its runtime origin. |

### D6 — Per-engine mapping to `conviction` / `quality` / `growth`

| | |
|---|---|
| **Factual issue** | No governed artefact defines which engine-produced quantity becomes which of the three admitted Screen values. The only in-repo mapping is the un-typechecked hardcoded `csipInputs` table in the transport, which reads fixtures. |
| **Classification** | **A** |
| **Implementation consequence** | Without a governed mapping, no producer can be conformant and no conformance claim is meaningful. |
| **Smallest authority scope** | Approve one mapping table per engine, scoped to the increment. |
| **Ramki's ruling** | **Deferred** to the producer-convergence gate. **Not required by Increment 1**, which accepts an already-composed Screen Member Evaluation Input. |

### D7 — Determinism of hash-bearing provenance (`A8-S-02`)

| | |
|---|---|
| **Factual issue** | `snapshotId` and `evidenceId` are **IN** the §8.3 member preimage, but A6 nowhere requires them to be deterministic. In the runtime both are clock-derived, and wall-clock (`createClock('system')`) and non-deterministic id (`createIdProvider('runtime')`) modes exist. |
| **Classification** | **A** (contract-completion) |
| **Implementation consequence** | A producer configured non-deterministically would emit a per-run-varying `inputHash`, in tension with A5-D09. |
| **Smallest authority scope** | Either pin the constraint in the authorization, or amend A6. |
| **Ramki's ruling** | **"Pin the determinism constraint in the grant — no A6 amendment."** Recorded as a **binding condition of Increment 1** (§11.5). A6 text is untouched. |

### D8 — `FAILED` result branch (`A8-S-03`)

| | |
|---|---|
| **Factual issue** | §10.2/§10.3 admit `executionStatus = "FAILED"` and place it in the preimage, while §10.5 states a structurally failed execution "fails before result identity; no partial result is canonical". Two readings are consistent with the text. |
| **Classification** | **A** (contract ambiguity requiring authority) |
| **Implementation consequence** | An implementer could reasonably emit either no canonical failed artifact, or a canonical zero-member `FAILED` envelope. Only one can be conformant. |
| **Smallest authority scope** | One sentence resolving whether a `FAILED` execution yields a canonical `resultId`. |
| **Ramki's ruling** | **"Defer — keep open as a governance gap."** Consequence recorded as a **binding exclusion**: no implementation that would emit or hash a `FAILED` result is authorized (§11.6). |

### D9 — Screen-input composition boundary owner + `evaluatorId` / `evaluatorVersion` / `executionSemanticsVersion`

| | |
|---|---|
| **Factual issue** | `A6-U-06` records that A5-D05 names no file or component; `A6-U-02/03/04` record that the three identity values are unassigned. |
| **Classification** | **G** — A6 §13 explicitly assigns all four to implementation authorization. |
| **Implementation consequence** | An implementer must choose the module and the three token values. |
| **Smallest authority scope** | Explicitly delegate the four choices to the implementer within the bounded scope, requiring each to be **recorded as a decision in the implementation record** with rationale — never chosen silently. |
| **Ramki's ruling** | **Delegated inside Increment 1.** §11.7 makes the recording mandatory. |

### D10 — Whole or incremental grant

| | |
|---|---|
| **Factual issue** | A8's determination was that a full-scope grant is premature. |
| **Classification** | **A** |
| **Implementation consequence** | Determines blast radius and whether any certification envelope is touched. |
| **Smallest authority scope** | One bounded increment, engine-free, with later increments gated separately. |
| **Ramki's ruling** | **Incremental — "Increment 1 only — engine-free Screen-side runtime."** |

### D1–D10 summary

| D | Subject | Class | Ruling | Effective now? |
|---|---|---|---|---|
| D1 | Producer conformance scope | A + C | Option B — bounded; engines excluded from claims | **Not granted** (deferred) |
| D2 | Certification impact disposition | C | No impact for Increment 1; required for producer work | **N/A now**; required later |
| D3 | Growth availability carriage | A | Deferred (Banking placeholder deferred) | **Not granted** |
| D4 | Producer decimal determination rule | I (+C) | Deferred to producer increment | **Not granted** |
| D5 | `referenceId` runtime source | A | Deferred | **Not granted** |
| D6 | Per-engine value mapping | A | Deferred | **Not granted** |
| D7 | Provenance determinism | A | **Pinned in the grant**, no A6 amendment | **Binding condition** |
| D8 | `FAILED` branch | A | **Deferred — open governance gap** | **Exclusion binding** |
| D9 | Boundary owner + three identity values | G | **Delegated within Increment 1** | **Granted-in-scope** |
| D10 | Whole vs incremental | A | **Incremental — Increment 1 only** | **Scope set** |

---

## 5. Required output 5 — A6-IMPL-10 (13-engine source convergence)

### 5.1 Factual issue, restated from verified evidence

1. **Mixed live/fixture production.** The sole non-test `EngineOutput[]` producer (`frontend/server/executive-transport.ts`) takes `composite`, `verdict`, `overridesApplied` from the **live** engine result and `qualityScore`/`riskScore`/`growthScore`/`franchiseScore`/`valuationScore`/`capitalEfficiency` from the **frozen `*-expected-outputs-1.0.0.json` fixtures**, and hardcodes `confidence: 0.8`. A5-D06 §8.3 makes this pattern inadmissible as an authoritative Screen member-value source.
2. **Producer outside both typechecked projects.** `frontend/server/**` is excluded by `iips-platform/tsconfig.json` and `frontend/tsconfig.json`; there is no root configuration and no CI workflow. The `A4-G13` `null`-into-`number` breach is invisible to `tsc`.
3. **No engine emits `companyId`.** The `${sector}-H1` identifier is transport-synthesised; at most one member per sector is sourceable.
4. **Fixture-derived quality/growth**, as in (1).
5. **Materially different growth behaviour across all 13 engines**, as in D3: five distinct regimes, zero availability carriage.

### 5.2 The three options, stated without preference

| Option | Statement |
|---|---|
| **A** | Require complete 13-engine convergence **before** any Screen implementation. |
| **B** | Permit a **bounded implementation increment** while explicitly excluding non-conformant engines from conformance/certification claims. |
| **C** | Another explicitly defined scope proposed by Ramki. |

### 5.3 Ramki's ruling — recorded

> **Option B.**

### 5.4 What Option B means, precisely

1. Screen-side work **may** proceed inside a bounded increment **independently of** producer convergence.
2. **No engine is claimed conformant.** No conformance statement, certification statement, or release claim may be made about the A6 contract for any engine, in any artefact produced by the increment.
3. The increment must consume a **supplied** Screen Member Evaluation Input and must assume nothing about where those values come from.
4. Producer convergence (D1, D3, D4, D5, D6) remains **unauthorized** and requires its own gate.
5. The inadmissible producer (`frontend/server/executive-transport.ts`) is **explicitly excluded** from the increment and is not to be "fixed" opportunistically.
6. The unbounded reading of Option B — "proceed and simply disclaim conformance while changing engines" — is **not** what is granted: no engine change is authorized at all.

---

## 6. Required output 6 — A6-IMPL-02 (growth availability preservation)

### 6.1 The governing question

Is fixing availability preservation (a) already within A6 implementation authority, (b) requiring a bounded implementation authorization, or (c) requiring additional governance?

### 6.2 Determination

| Sub-question | Determination |
|---|---|
| Does A6 grant authority to change engines? | **No.** A6 §15 item 2 prohibits modifying `renorm()` or any sector engine; §15.1 states that nothing in the required implementation is engine-side; A5-D06 §8.2 states that N4-A5 does not authorize modifying the engines. |
| Does A6 **require** the change? | **Yes** — `A6-DR-01` requires explicit availability at the Screen boundary, and A5-D03 requires the producer to preserve it. |
| Is the change **observable** (not additive)? | **Yes.** For Insurance and Capital Markets a fabricated neutral would become `UNAVAILABLE` (non-matchable) for genuinely missing sources; for Banking a constant placeholder must be classified `AVAILABLE` or `UNAVAILABLE`; for Consumer/Energy/Utilities/Hospitality a thrown execution would become a member-level availability state. |
| Is the classification of Banking's constant placeholder governed? | **No** — arguably neither "genuine calculated value" nor "missing/incomplete source". |
| Is there a governance gap? | **Not a new one.** A5-D03 already forbids collapsing unavailability into a bare numeric, and A6 §7.3 already defines the mapping table. The gap is authorizational, plus one bounded classification. |

> **DETERMINATION: fixing availability preservation is NOT within current implementation authority. It requires a bounded implementation authorization (producer-side), and the Banking constant-placeholder classification must be resolved within that authorization or by additional governance.**
>
> **Ramki's ruling: DEFERRED to the producer-convergence gate.** `renorm()` and all 13 engines were inspected only; **nothing was modified**.

### 6.3 Consequence for the approved increment

Increment 1 assumes `growth` + `growthAvailability` are **supplied** correctly per A6 §7.3 and validates only that the supplied combination is internally consistent (availability `UNAVAILABLE` ⇒ no growth value; availability `AVAILABLE` ⇒ admissible canonical decimal text). It performs **no** reconstruction and **no** inference — as `A6-DR-01` mandates.

---

## 7. Required output 7 — A6-IMPL-01 (canonical decimal text)

### 7.1 Verification of the mathematical statement

The A8 quantification was **re-verified independently by exact rational arithmetic** over all 1,030,301 integer band-score combinations under the governed `(0.40, 0.35, 0.25)` weighting:

```text
total combinations                                   = 1,030,301
exact expansion exceeding 6 fractional digits        =   828,619   (80.4249 %)
exact expansion within 6 fractional digits           =   201,682
maximum exact fractional digits observed             =        53
worked example: renorm(0,1,0) → 0.35 (shortest form)
                exact = 3152519739159347/9007199254740992  → 53 digits
```

**The statement is arithmetically correct.** The value is a **near-miss**: the exact expansion ends in `…59375` and is *not* non-terminating; it is *too long*. Note further that `Fraction(0.35)` is **not** `7/20`, because the `number` `0.35` is not the rational `0.35` — this is precisely why the layer separation in §7.2 matters.

### 7.2 The five layers, distinguished

| Layer | What it is | Governing authority | Status |
|---|---|---|---|
| **(i) Canonical decimal representation** | The abstract governed decimal form: lexical shape, ≤ 6 fractional digits, exact fixed-point key `q = 1,000,000 × x` | **A6 §6.1–6.4** | **GOVERNED — complete.** Not altered by this gate. |
| **(ii) IEEE-754 runtime representation** | The binary `number` carried by engine pillars/composites (and by rounded values such as `71.6` whose exact value is `71.599999999999994315658113919198513031005859375`) | A5-D01 **excludes** it as a semantic decimal representation | **Not admissible as a member value** |
| **(iii) Exact rational / fixed-point calculation** | `q` as an exact mathematical key, base-10 integer arithmetic, bijective with (i) | **A6 §6.2/§6.3** | **GOVERNED.** Standard `bigint` arithmetic suffices. |
| **(iv) Producer serialization** | The step that turns a computed runtime value into (i) — **where the abstraction is chosen** | A5-D02 §4.2 assigns "the exact producer-side normalization mechanism" to later implementation; **`A8-S-04`** | **NOT PINNED — implementation design, deferred** |
| **(v) Screen admission** | Admission of text, rejection table (`MEMBER_VALUE_*`), conversion to `q` | **A6 §6.4/§6.5, §7.4**; A5-D02 fail-closed | **GOVERNED — complete.** The existing private `decimal()` routine implements it. |

**Critical distinction for the record:** the current engines produce values that *display* as ≤ 1 decimal place (via `r1h2e`/`r2`) but whose **exact binary values exceed six fractional digits** (e.g. `71.6`, `0.8`, `79.0`, and every `renorm` output). Layer (ii) is therefore **never** admissible at layer (v); text must be established at layer (iv). The A6 canonical decimal rule is **not** altered, relaxed, or reinterpreted by this gate.

### 7.3 Determination

> **Producer-side conversion is IMPLEMENTATION WORK, not a new governance decision** — A5-D02 §4.2 explicitly assigns the mechanism to implementation, and A6 §6.4/§6.5 fully constrain the target representation. It nevertheless requires a **bounded implementation authorization** because it changes engine output surfaces and is certification-consequential.
>
> **Ramki's ruling: DEFERRED to the producer-convergence increment. It does NOT block Increment 1** — Increment 1 receives text that is already canonical and only performs layer (v).

---

## 8. Required output 8 — A6-IMPL-03 (five missing §8.3 fields)

For each field: does its absence prevent implementation; require an implementation-side source mapping; require a new governance decision; or can it remain unresolved under A6?

| Field | Present on `EngineOutput`? | Existing governed source | Prevents implementation? | Source mapping needed? | New governance decision? | Can remain unresolved under A6? |
|---|---|---|---|---|---|---|
| `engineId` | **No** | `SectorPlugin.identity.engineId`, `PluginLoader`, `EngineRegistry` | **No** | **Yes** — bind the plugin/registry identity to the member record | **No** — a governed source already exists | **No** — §8.3 requires it; it is resolvable by implementation |
| `engineVersion` | **No** | `SectorPlugin.identity.engineVersion`, `EngineRegistry` | **No** | **Yes** | **No** | **No** |
| `calibrationVersion` | **No** | `EngineRegistry` (all 13, `'1.0.0'`); `ExecutionResult.metadata` for 4 of 13 | **No** | **Yes** — and the **authority as between registry and runtime metadata must be decided and recorded** (it is a divergence between two governed surfaces) | **No** — both are governed artefacts; the choice is implementation design and must be recorded | **No** |
| `snapshotId` | **No** | `ExecutionResult.snapshotRef` (declared **optional**; populated in practice by all 13) | **No** | **Yes** — including a fail-closed rule if the optional reference is absent | **No** | **No** |
| `evidenceId` | **No** | `ExecutionResult.evidenceRef` (declared **optional**; populated in practice by all 13) | **No** | **Yes** | **No** | **No** |

### 8.1 Determination

> **None of the five prevents implementation.** All five require an **implementation-side source mapping**, and **none requires a new governance decision**, because a governed source already exists for each. `calibrationVersion` carries one additional requirement: the registry-vs-runtime-metadata divergence must be **decided explicitly and recorded**, not resolved silently. All five are additionally bounded by the **D7 determinism pin**.
>
> **No provenance value is invented by this record.**

### 8.2 Consequence for the approved increment

Increment 1 composes the member record from **supplied** inputs and must **fail closed** when any §8.3 field is absent or the optional `snapshotRef`/`evidenceRef` is missing — never substituting a default. This is the engineering expression of "do not invent provenance values".

---

## 9. Required output 9 — `A8-S-01` … `A8-S-04` disposition

| ID | Subject | Classification | Ramki's ruling | Effect on A6 | Blocks Increment 1? |
|---|---|---|---|---|---|
| `A8-S-01` | A8's citation of `A6-IMPL-01` as saying "non-terminating in decimal" does not match the published register text (line 647 reads "unrounded IEEE-754 quotient") | **1 — editorial / documentation clarification** | Accepted as a citation correction, recorded in §2.2. Correcting the **A6 artifact itself** would be an amendment to a published authority artifact and is **not** performed or requested here** | **None** | **No** |
| `A8-S-02` | `snapshotId`/`evidenceId` are hash-bearing but their determinism is unstated; runtime values are clock-derived; wall-clock and non-deterministic id modes exist | **3 — material contract gap** (resolved by authority action short of amendment) | **"Pin the determinism constraint in the grant — no A6 amendment."** | **None** — A6 text untouched | **Yes — as a binding condition, not a blocker.** §11.5 |
| `A8-S-03` | `FAILED` branch: §10.2/§10.3 admit the token and hash it; §10.5 says failure precedes result identity | **3 — material contract ambiguity requiring authority** | **"Defer — keep open as a governance gap."** | **None** | **Yes — as a binding exclusion.** §11.6 |
| `A8-S-04` | Producer-side decimal determination rule is not pinned | **2 — implementation design** (A5-D02 §4.2 assigns it to implementation), **certification-consequential** | Accepted as implementation design; **deferred** to the producer-convergence increment | **None** | **No** (§7.3) |

**No A6 text was amended. No A6 decision was reopened.** The four frozen decisions (`A6-DR-01`…`A6-DR-06`) are consumed exactly as published.

---

## 10. Required output 10 — Certification disposition

### 10.1 What existing certification does and does not cover

| Covered by existing certification | Not covered by any existing certification |
|---|---|
| The E2E stack **Certified Engine → Engine API → Evidence/Provenance → Replay → CSIP → Product APIs → UI** for the 10-engine LTS scope and the 13-engine D42 delta | The **A6 Screen contract** in any respect |
| Each engine's reproduction of its **frozen expected outputs** and its engine-vs-baseline conformance | The **`NP12MBR` / `NP12EXE` / `NP12RES` v01** formats |
| Replay identity under `clock=fixed` / `idProvider=deterministic` for the frozen replay baseline | Any **Screen evaluator**, ScreenExecution, or ScreenResult runtime |
| Freeze integrity via pinned SHA-256 hashes in the D38 manifests | Any **Screen-input producer**, and any conformance of the three admitted Screen values |

### 10.2 The precise relationship

> **Existing engine certification does NOT certify the future Screen-input producer.** There is no transitive inference: certification attests to each engine's own frozen-output conformance and to the existing E2E stack — neither of which includes the A6 contract or the Screen boundary. The A6 contract has **zero certification coverage** today.

Conversely — and this is decisive for the approved increment —

> **Increment 1 cannot affect existing certification, because it changes no engine, no fixture, no producer, and no certified artefact.** It touches only new, uncertified Screen-side modules and new tests. Its certification impact is therefore **exactly zero**, and no certification disposition is required for it.

### 10.3 Determinations

1. **No revocation or modification of any existing certification** is performed, implied, or required by this gate. E2E-030 (10-engine LTS + 13-engine delta), the D38 freeze manifests, and the v1.1 replay baseline remain exactly as they are.
2. **Option B requires an explicit claim boundary.** Every artefact produced by Increment 1 must state that it confers **no conformance and no certification** on any engine, and that no engine is claimed conformant with A6.
3. **A separate certification gate IS required after any producer-convergence implementation**, to dispose of the impact on E2E-030, the D38 manifests, and the v1.1 replay baseline. It is **not** required for Increment 1.
4. Conformance of an engine to A6 becomes assertable only after both a producer-convergence implementation and that certification gate.

---

## 11. Required output 11 — Bounded implementation-authority scope (Increment 1) — APPROVED

> **This scope is APPROVED by `A9-D01` and constitutes the bounded implementation-authority grant. Nothing outside it is authorized.**

### 11.1 Repository

`ramkivs/iips-review-recovered` only. Publication route: session branch `arena/01a0fd58-iips-review-recovered` → pull request to `refs/heads/main`. **No checkout switch; no direct push to any other branch.** IPD and Production remain out of scope and untouched.

### 11.2 Permitted areas — new files only

| Path | Purpose |
|---|---|
| `iips-platform/src/sector-engines/cross-sector/screen/` (new directory) | Screen Member Evaluation Input type + admission/validation |
| `…/screen/ScreenMemberInput.ts` (new) | §7 contract: field disposition, `growthAvailability` vocabulary, member validation and error codes §7.4, fail-closed composition from **supplied** inputs |
| `…/screen/CanonicalFormats.ts` (new) | `NP12MBR` / `NP12EXE` / `NP12RES` v01 preimage writers, §8/§9/§10, G5 order consumed verbatim |
| `…/screen/ScreenEvaluator.ts` (new) | Predicate evaluation §7.3 for `lt`/`lte`/`gt`/`gte`/`eq` over the `conviction`/`quality`/`growth` fixed-point keys |
| `…/screen/ScreenExecution.ts` (new) | Execution envelope, G5-ordered member binding, `executionId` derivation §9 |
| `…/screen/ScreenResult.ts` (new) | Result model, status vocabularies §10.2, counts §10.4, `resultId` derivation §10 |
| `…/screen/index.ts` (new) | Module barrel |
| `iips-platform/tests/regression/np12-n4-a9-screen-runtime.test.ts` (new) | Conformance + determinism tests |
| `iips-platform/tests/regression/fixtures/…` (new files only) | New literal published vectors, frozen at authoring time |
| `NP-12-N4-A9-IMPLEMENTATION-RECORD.md` (new) | Implementation record incl. the §11.7 recorded decisions and the §11.8 claim boundary |

### 11.3 Admission rule — ZERO-TOUCH, APPROVED (`A9-D02`)

> **No existing file may be modified. In particular, the existing private N4-SD `decimal()` implementation MUST NOT be modified — not even to export it.**

The Screen-side canonical decimal handling is implemented inside the new Screen-side module (§11.2), independently scoped, with **byte-identical governed semantics**. This is the **approved and mandatory** mechanism, not an alternative.

**Prohibited:** adding `export` to `decimal()`; making it public; re-exporting it through the cross-sector barrel (`index.ts`); relocating or copying it into a shared module; or any other change to `iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition.ts` or to the N4-SD surface.

**Mandatory mitigation for the recorded risk.** The approved scope accepts the duplication risk — the same routine then exists in two places — and mitigates it **by evidence, not by refactoring**:

1. differential/parity testing of the Screen-side routine against the frozen N4-SD semantics over representative governed inputs (§11.10 item 6);
2. an explicit negative check that N4-SD is unmodified (§11.10 item 3).

**If the governed semantics cannot be reproduced without modifying the frozen N4-SD surface: STOP and report the blocker.** Do not make the modification.

### 11.4 Permitted work

Runtime implementation of the modules in §11.2; tests; new deterministic fixtures; implementation documentation; conformance evidence.

### 11.5 Binding condition — provenance determinism (D7 / `A8-S-02`)

`snapshotId` and `evidenceId` entering the §8.3 member preimage **MUST be invariant across runtime configuration** (clock mode and id-provider mode). Conformance evidence demonstrating this invariance is a required deliverable. A6 is **not** amended. No implementation that permits these values to vary with wall-clock time is authorized.

### 11.6 Binding exclusion — `FAILED` branch (D8 / `A8-S-03`)

No implementation that would **emit, define, or hash** an `executionStatus = "FAILED"` result is authorized. Increment 1 is limited to the **`COMPLETED`** branch only, which includes member-level `MATCH` / `NO_MATCH` / `INVALID_MEMBER` results, the counts of §10.4, and the required result shapes of §10.5 for the COMPLETED cases. The `FAILED` branch remains open until resolved.

### 11.7 Mandatory recorded decisions (D9)

The implementer must **record, with rationale**, in the implementation record: the composition boundary's owner and location (`A6-U-06`); the values of `evaluatorId`, `evaluatorVersion`, `executionSemanticsVersion` (`A6-U-02/03/04`); the `calibrationVersion` source chosen as between `EngineRegistry` and runtime metadata (§8 of this record); and the `snapshotRef`/`evidenceRef` fail-closed rule when the optional references are absent. **None of these may be chosen silently.** None may contradict a frozen rule.

### 11.8 Mandatory claim boundary (Option B)

Every artefact produced must state: **no engine is claimed conformant with the A6 contract; no certification is claimed for the Screen runtime; no engine, fixture, baseline, or certified artefact is modified or re-certified.** Increment 1's output is implementation and conformance evidence for the Screen-side contract only.

### 11.9 Explicit exclusions

**Engines and producers:** all 13 engine modules; `renorm()` in any engine; all scoring/calibration/decision/metrics code; `frontend/server/**` including `executive-transport.ts`; the `csipInputs` mapping; `${sector}-H1` synthesis.

**Existing contracts:** `EngineOutput`, `NormalizedHolding`, `OntologyMapper`, `ScreeningPopulation`/`ScreeningPopulationGuard`, `CrossSectorEngine`, `CrossSectorPlugin`, `EngineRegistry`, `EvidencePipeline`, `SnapshotService`, `SnapshotStore`, `Clock`, `IdProvider`, `PluginContract`, and `…/definition/ScreenDefinition.ts` — **all unmodified** (`A9-D02`, §11.3). The cross-sector barrel `index.ts` is unmodified.

**Frozen authority:** the `NP12DEF` / `01` byte grammar; A6 growth semantics (`A6-DR-01` Option C); G5 ordering; the A6 field orders and framing; CSIP ontology; N1, N2, N3, N4, N4-SD, the N4 definition-identifier governance, B0–B5, N4-A1…N4-A6 and `A6-DR-01`…`A6-DR-06` — **no reopening, no amendment, no reinterpretation**.

**Existing evidence:** all existing tests, fixtures, `*-expected-outputs-1.0.0.json`, golden references, `frozen-assets/`, `PROGRAM_v1.1_REPLAY_BASELINE.json`, freeze manifests, certification artefacts — **read-only, unmodified**.

**Out of scope:** production; IPD mutation; NSE; Dhan; provider integration; persistence; registry; API; transport; UI; deployment; release; any NP workstream other than NP-12; any certification or conformance claim.

**Not implementable now:** evaluator or runtime touching the `FAILED` branch; any producer-side change; any engine change.

### 11.10 Acceptance evidence required

1. Byte-exact conformance tests for `NP12MBR` / `NP12EXE` / `NP12RES` v01 against **literal published vectors** that are not generated by the implementation under test (the N4-SD fixture discipline).
2. Determinism/replay-identity tests, including the §11.5 invariance demonstration.
3. A `git diff --stat`-based demonstration that **no excluded file changed**, explicitly including `iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition.ts` and the cross-sector `index.ts` barrel.
4. The §11.7 recorded decisions and the §11.8 claim boundary, present in the implementation record.
5. Preservation of the existing test suite (existing tests must continue to pass unmodified).
6. **Differential/parity evidence** for the Screen-side canonical decimal routine against the frozen N4-SD semantics: exact canonical text, exact fixed-point `q`, and identical rejection behaviour must agree on every representative governed input (§19 of the next gate), with N4-SD proven unmodified.

### 11.11 Stop conditions

Halt and return to Program Authority if: the `FAILED` branch must be resolved to proceed; any engine change appears necessary; the Screen-side canonical decimal semantics cannot be reproduced without modifying N4-SD; any §8.3 field has no source; `snapshotId`/`evidenceId` cannot be made configuration-invariant; or any conflict with a frozen rule is discovered. **A genuine conflict with a frozen rule returns to Program Authority rather than being resolved by the implementer.**

---

## 12. Required output 12 — Approved decisions (`A9-D01`, `A9-D02`, `A9-D03`)

The three decisions this gate previously held open have been **explicitly approved by the Program Authority** and are recorded here as **authority, not recommendation**.

| ID | Decision — exact scope | Status |
|---|---|---|
| **`A9-D01`** | **Increment 1 is the authorized implementation scope** — engine-free Screen-side runtime, exactly as bounded in §11: the `NP12MBR` / `NP12EXE` / `NP12RES` v01 serializers, canonical member validation, supplied Screen Member Evaluation Input consumption, the Screen evaluator, the assigned evaluator/version/semantics identity, deterministic canonical encoding and hashing, and the required tests/fixtures. **Nothing beyond §11 is authorized.** | **APPROVED** |
| **`A9-D02`** | **Zero-touch admission rule** — the Screen-side canonical decimal handling is implemented in the new Screen-side module (§11.3); the frozen N4-SD private `decimal()` **MUST NOT** be modified, exported, re-exported, or relocated. Differential/parity evidence is mandatory. | **APPROVED** |
| **`A9-D03`** | **Publication of this A9 record is authorized** — durable publication through the authoritative route and independent remote verification. | **APPROVED** |

**Consequent change of status.** Implementation authority is no longer "ready for approval"; it is **granted and bounded to §11** (§13). The grant confers **nothing** on producer convergence, engine change, fixture change, or certification.

**Already ruled in this gate (recorded, not re-requested):** A8 publication (granted and executed — §3.2); `A6-IMPL-10` scope (Option B); increment scope (Increment 1 only); `A8-S-02` (pinned in the grant, no A6 amendment); `A8-S-03` (deferred — open governance gap, and excluded from the increment); Banking growth placeholder (deferred).

**No decision remains open in this record.**

---

## 13. Required output 13 — Final A9 status

> ## **BOUNDED IMPLEMENTATION AUTHORITY GRANTED**

**Basis.** The Program Authority explicitly approved `A9-D01` (Increment 1 as the authorized scope), `A9-D02` (zero-touch admission rule), and `A9-D03` (publication of this record). The grant is defined and bounded by Section 11 in full: the permitted new modules, the zero-touch rule, binding conditions §11.5 and §11.6, mandatory recorded decisions §11.7, the claim boundary §11.8, explicit exclusions §11.9, acceptance evidence §11.10, and stop conditions §11.11.

**Scope of the grant — exactly Section 11, nothing more.** Producer convergence (D1, D3, D4, D5, D6) remains **UNAUTHORIZED**. No engine, `renorm()`, `EngineOutput`, producer, fixture, baseline, or certified artefact may change. No certification or conformance claim may be made.

**Effectiveness.** The grant takes effect on durable publication of this record and independent remote verification (§12, `A9-D03`).

**Next gate.** A controlled implementation gate limited exactly to Section 11. Per the governing rule, A9 analysis does not itself authorize anything; implementation proceeds only under that gate.

---

## 14. Non-actions and authority boundary

This gate:

1. implemented **no** code — no source, test, fixture, runtime, engine, or `renorm()` change;
2. executed **no** test and **no** Screen evaluation;
3. modified **no** engine, producer, fixture, golden value, freeze manifest, calibration profile, replay baseline, or certification artefact;
4. reopened **no** frozen decision (`A6-DR-01`…`A6-DR-06` all consumed as published) and amended **no** A6 text;
5. did **not** rebind the N4-A1 baseline (`f2886a5a…` / `46c1a15b…`) — referenced and verified only;
6. did **not** revoke, modify, or re-assert any existing certification;
7. performed **exactly one** write operation in the whole gate: the **authorized** merge of PR #21 publishing the A8 artifact (merge commit; no content change), followed by separate durability verification;
8. prepared this A9 record for publication under the `A9-D03` authorization. **The publication act itself — commit, push, merge, and the independent durability verification — is performed by the publishing session**, which holds the authoritative remote access; this recording session neither commits, pushes, nor merges it;
9. leaves IPD unaccessed and Production untouched.

---

## 15. Next-gate rule

`A9-D01` is approved, so the next gate is **NP-12 N4-A10 — Controlled Increment 1 Implementation**, limited **exactly** to Section 11 and to the decisions recorded in Section 12 — no more. If any material governance gap remains (`A8-S-03` is open), it must be resolved before any implementation that depends on it; Increment 1 explicitly does not depend on it.

> **Do not proceed into unrestricted implementation. Producer convergence requires separate authority, and none is implied here.**

**End of NP-12 N4-A9 implementation authority decision record.**
