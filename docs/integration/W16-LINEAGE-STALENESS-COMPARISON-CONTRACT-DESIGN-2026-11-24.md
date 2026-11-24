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
