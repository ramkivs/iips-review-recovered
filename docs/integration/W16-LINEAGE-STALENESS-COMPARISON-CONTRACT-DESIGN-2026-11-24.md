# W16 — Lineage, staleness and comparison: contract design proposal (2026-11-24)

**Status: PROPOSED contract design. Not approved methodology; not a replacement for any producer chain.
NP-04/NP-06 historical-chain semantics are preserved untouched. Baseline: readiness record tracker §16.332;
producers W09 (§16.324/§16.325), W11 (§16.327), W13 (§16.328), W15 (NP-04/NP-06 chains + `change/` module), B06 verified.**
Implementation artifact: `frontend/server/investment/lineage/provenanceEnvelope.ts` (pure mappers/classifiers,
no I/O, no producer changes) + `provenanceEnvelope.test.ts` (15 deterministic vectors, all passing; targeted
cluster 19 files / 388 tests pass, 2026-11-24).

---

## 1. Proposed common provenance envelope (`iips.w16.provenance-envelope/v1`)

| Field | Type | Meaning |
|---|---|---|
| `schema` | const | envelope schema id |
| `producer` | `W09_CAPTURE \| W11_EXECUTION \| W13_VALUATION \| W15_REPORT` | which producer shape this is |
| `artifactId` | string \| null | producer-assigned identity (W09 `portfolio@revision`, W11 `requestId`, W15 chain artifact id); null when the producer has none — identity is then the bytes |
| `chainRef` | string \| null | NP-04/NP-06 chain for W15; null otherwise |
| `sources` | `{kind, id, digest}[]` | capture / dataset / engine / quote-observation / report-type references |
| `revision` | number \| null | portfolio/producer revision when carried (W15 chain versions are NOT portfolio revisions → null) |
| `digest` | string \| null | content/provenance digest when carried |
| `timestamps` | `{observedAt, receivedAt, evaluatedAt, createdAt}` each string\|null | observation, receipt, evaluation, creation times |
| `providerQualification` / `freshnessVerdict` / `sourceClassification` | string \| null | echoed verbatim, never upgraded |
| `buildProvenance` | `{buildId, verification}` | verification ∈ HASH_VERIFIED / VERIFIED / HOST_OBSERVED / RECORDED_VERBATIM / NOT_ATTESTED / **UNKNOWN — unknown stays unknown** |
| `missing` | string[] | named absent provenance fields — reported, never defaulted |
| `extensions` | record | producer-specific fields preserved verbatim |

**Mappings (verified by vectors):** W09 `CapturedRevisionRef` → artifactId `portfolio@revision`, revision, digest, `createdAt=capturedAt`, build NOT_ATTESTED (v1 wire attests no build — §16.327 limitation C). W11 execution report → artifactId `requestId`, sources capture+dataset+per-engine digests, revision, `contentDigest`, `evaluatedAt=asOf`, build UNKNOWN. W13 valuation report → capture binding, first qualified observation's `asOf`/`receivedAt`/`freshnessVerdict`/`providerQualification`/`lineageHash` at envelope level, per-position observations in `extensions`, build NOT_ATTESTED. W15 report artifact → `chainRef`, `artifactId`, report-type + engine-output sources, `createdAt=generatedAt`, `revision=null`.

## 2. Proposed staleness semantics

- Recorded producer verdict (`GOOD`/`STALE`/`UNAVAILABLE`/`UNKNOWN` from IPD DHAN-P5, or IRR `Freshness` LIVE/SNAPSHOT/STALE/UNAVAILABLE/REPLAY) is carried **verbatim** in `recordedVerdict`/`classification`.
- Read-time status is evaluated **independently** from `ageSeconds` vs `thresholdSeconds` when both are computable: `FRESH` if age ≤ threshold, else `STALE`; if either is missing → `UNKNOWN` — **never fresh by default**.
- `UNKNOWN` (no observation exists) is never merged with `STALE` (an observation past threshold).
- Missing timestamps/incomplete provenance → `missing` lists them; classification degrades to `UNKNOWN`, not to a fresher class.

## 3. Proposed comparison contract

`classifyPair(a, b, {contentDigestsEqual, bReconstructed, positionDelta})`:

1. Different producers → `INCOMPARABLE`. Different artifact ids on a W15 governed chain → `INCOMPARABLE`.
2. `bReconstructed` → `RECONSTRUCTED` (a late explanation is never mistaken for contemporaneous — preserves the change-report semantics).
3. Equal content digests → `UNCHANGED` (the NP-04/NP-06 content-identical non-write, preserved).
4. Missing digest/revision on either side → `INCOMPARABLE` (never silently compared).
5. Later revision → `SUCCESSIVE_REVISION`; same revision with different digest → `SAME_REVISION_CONTENT_CHANGED`.
6. Source refs differ → `PRODUCER_OR_SOURCE_CHANGED`; position delta → `POSITIONS_ADDED_REMOVED` (PRESENCE delta); observation timestamps/verdicts differ → `OBSERVATION_CHANGED` (CATEGORICAL); output digests differ → `OUTPUT_CHANGED` (NUMERIC).

## 4. Compatibility findings (per producer)

- **W09**: maps directly; no adapter. Missing digest already fails closed upstream.
- **W11**: maps directly; build provenance stays UNKNOWN (honest).
- **W13**: maps directly; per-position provenance lives in `extensions` (no flattening loss).
- **W15**: maps directly onto chain artifacts; `revision` deliberately null — chain versions ≠ portfolio revisions; UNCHANGED/RECONSTRUCTED semantics reused, not redefined.
- No existing consumer is affected: the module is additive and pure; immutable historical records are not touched.

## 5. Outstanding gaps (evidence, not design)

Common envelope does not yet exist at any producer (this is a proposal); read-time staleness is not universal across
producers; build digest stays UNKNOWN where unattested (limitation C, §16.327); final evidence needs actual artifacts
(W09/W11/W13/W15 + B02 host access). No acceptance is claimed.

---

## 6. Contract review (2026-11-24) — findings, corrections, adoption decision

**Review against the authoritative NP-04/NP-06 chain (`frontend/server/reports/artifact.ts`):**
`reportKey` = deterministic CONTENT identity (sha256 over canonical members); `reportId` = store-assigned
durable INSTANCE/chain identity (never the engine's content-derived form — validated and rejected);
`artifactVersion` = integer >= 1 per chain, `supersedesReportId` null iff version 1, contiguity enforced by
`validateArtifactChain`. **Finding 1 (corrected):** the first proposal compared W15 pairs via portfolio
`revision`, which is always null for W15 — successive chain versions would have been INCOMPARABLE. The
envelope now carries `chainVersion` (`artifactVersion`) and `supersedes` (`supersedesReportId`), W15 maps
`artifactId = reportId`, `digest = reportKey`, and `classifyPair` handles W15 on chain identity: different
chainRef/reportId → INCOMPARABLE; equal reportKey → UNCHANGED (content-identical non-write); later
artifactVersion → SUCCESSIVE_REVISION (chain-version sense); otherwise differing reportKey → OUTPUT_CHANGED.
**Finding 2 (corrected):** W11 reports have no single durable id — `artifactId` is now null for W11 and the
per-execution `requestId`s live in `extensions` (identity = report bytes, same rule as change reports).
**Classification precedence (final, documented in code):** 0 cross-producer → INCOMPARABLE; 1 W15 chain-identity
branch; 2 RECONSTRUCTED flag; 3 equal digests → UNCHANGED; 4 missing digest (non-W15: also revision) →
INCOMPARABLE; 5 revision ordering → SUCCESSIVE_REVISION / SAME_REVISION_CONTENT_CHANGED; 6 source refs →
PRODUCER_OR_SOURCE_CHANGED; 7 position delta → POSITIONS_ADDED_REMOVED (PRESENCE); 8 observation
timestamps/verdicts → OBSERVATION_CHANGED (CATEGORICAL); 9 output digests → OUTPUT_CHANGED (NUMERIC); 10
insufficient identity → INCOMPARABLE.

**Producer mapping review:** W09 direct (build NOT_ATTESTED, missing digest reported); W11 direct after Finding 2;
W13 direct (per-position observations preserved in `extensions`, no flattening loss); W15 direct after Finding 1
(`revision` deliberately null — chain versions are never conflated with portfolio revisions). No information
loss found; no unsupported assumptions remain in the mappers.

**Verification:** `provenanceEnvelope.test.ts` now 26 vectors (15 original + 11 review: R1–R6 W15 chain-version
cases, R7–R10 precedence boundaries) — **26/26 pass**; targeted cluster 19 files **399/399 pass**; scoped strict
`tsc --noEmit` clean on the module and tests.

**ADOPTION DECISION: ADOPTED AS THE PROPOSED W16 CONTRACT (design-level adoption only).** Rationale: the
corrected contract maps all four producer shapes without loss, preserves NP-04/NP-06 chain semantics
(UNCHANGED/RECONSTRUCTED, store-assigned identity, content identity), keeps recorded verdicts distinct from
read-time evaluation, and is pure/additive — no producer boundary is modified by this adoption, per task scope.
This adoption approves the CONTRACT DESIGN only; it is not methodology approval, not producer integration, and
not W16 acceptance (which still requires actual artifacts via B02).

## 7. Optional projection integration (2026-11-24)

Implemented as `frontend/server/investment/lineage/projections.ts` (pure, additive):

- `attachOptionalProvenanceEnvelope(output, envelope)` — returns a shallow copy carrying the
  optional `provenanceEnvelope` field; the producer output is never mutated, so existing consumers
  and contracts are unchanged and the projection is strictly optional (absent = not projected).
- Producer-boundary projections: `projectW09Capture` (capture ref), `projectW13Valuation` (valuation
  report), `projectW11Execution` (execution report, applied at the IRR consumer side of the
  iips-platform handoff — the envelope module stays in frontend, iips-platform must not import it),
  `projectW15Report` (NP-04/NP-06 artifact: chain identity/version preserved, `revision` stays null).
- Missing/unattested provenance stays in `missing` / `UNKNOWN`; no historical report, chain version
  or persisted artifact is modified.

Verification: `projections.test.ts` — 9 vectors (per-producer mapping, optionality/absence,
immutability of inputs and NP-04 artifacts, W15 successive-version classification, projection-failure
isolation) — 9/9 pass; targeted cluster 20 files / 408 tests pass; scoped strict tsc clean.
No producer output shape was changed; no wire contract touched; IPD untouched.
