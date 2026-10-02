# NP-12 N4 — Screen Definition implementation evidence

Scope: `N4-SD-IMPLEMENTATION` only. This is implementation documentation, not a new governance decision. Production, IPD, persistence, and Screening execution are not authorized by this work.

## Pre-source authority and repository safety record (2026-10-02 UTC)

Authoritative `ramkivs/iips-review-recovered/main` was freshly retrieved using the GitHub branch, Git commit, recursive Git tree, and Git blob APIs, independently of the assigned checkout. `git ls-remote origin refs/heads/main` independently agreed with the branch API. Every retrieved record was decoded from the remote blob and its Git blob SHA-1 recalculated from the exact bytes.

- Authority publication commit: `06775f44d432f6df95a2f47bb78ef381352cf575`.
- Authority publication tree: `8786bc9a061b0e16d408a73dfb8230ce77e6a3fa`.
- `main` had not moved from the user's previously verified baseline.
- Comparison with the remotely retrieved authority preparation commit `3e56ef001a42946bbdf57b9b865c9c10fce5148c`, tree `73a960ba1918b5c32db1c30b65b242c60c17560a`, showed exactly one added path: the N4 implementation-authority record. All implementation paths and all eight prior governance blobs were unchanged.
- Gate: **N4 IMPLEMENTATION AUTHORITY = GRANTED — DURABLY PUBLISHED**, for the published bounded scope only.

| Remotely retrieved record | Verified blob |
|---|---|
| `NP-12-N4-IMPLEMENTATION-AUTHORITY-DECISION-RECORD.md` | `4ad5dd8a9fed0ca28016cfca8dc5ea9bc5d5a4f7` |
| `NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD.md` | `6d823aeecc2a6047782f48dad33d61f26bbe89d8` |
| `NP-12-N4-DEFINITION-IDENTIFIER-GOVERNANCE-DECISION-RECORD.md` | `97f39649d3b419dc4b70e29a7c45e18f43c97a39` |
| `NP-12-SCREENING-CRITERIA-OPERATOR-BOOLEAN-GOVERNANCE.md` | `c2402d36b7610cb4ce52abf1d071d3d46f136f62` |
| `NP-12-SCREEN-DEFINITION-GOVERNANCE-DECISIONS.md` | `8941acadfd01c3edf97a91bd012ff616abed311f` |
| `NP-12-N4-PROGRAM-AUTHORITY-DECISION-RECORD.md` | `59debade35d11551ee5948376a8462e198589679` |
| `NP-12-SECTOR-REFERENCE-POPULATION-SEMANTICS-DEFINITION.md` | `af732d754992e00557246e73d2ec2a99c939c73b` |
| `NP-12-IMPLEMENTATION-AUTHORITY-DECISION.md` | `316482cb0022657b3f5ef1f91a2f7cd4e042585d` |
| `NP-12-IMPLEMENTATION-READINESS-GATE-REPORT.md` | `10e8dc0099db848217966111a113255dd21d516b` |

Assigned checkout, recorded before source modification:

- Path: `/home/user/iips-review-recovered`.
- Branch: `arena/01a0fb16-iips-review-recovered` (all session work remains on this branch).
- HEAD: `06775f44d432f6df95a2f47bb78ef381352cf575`.
- Tree: `8786bc9a061b0e16d408a73dfb8230ce77e6a3fa`.
- Status: clean; no tracked modifications or untracked files at entry.
- No prior checkout or untracked authority draft was used as authority. No local work was cleaned, reset, renamed, or discarded.

## Architecture inspection and intended target paths

The existing platform is Node/CommonJS TypeScript, with `node:test` tests run by `tsx`. The G1–G5 population implementation is `src/sector-engines/cross-sector/population/ScreeningPopulation.ts`; `ScreeningPopulationGuard.fromOutputs()` is its established boundary. Its `ScreeningPopulation.identity` is the already-verified textual reference. The current cross-sector barrel exports that contract. Node's SHA-256 primitive is already used there, but population member serialization must not be reused for Definition bytes.

The narrow intended path inventory is:

1. Add `iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition.ts` — isolated runtime representation, validation, canonicalization, format-1 bytes, SHA-256.
2. Add one export to `iips-platform/src/sector-engines/cross-sector/index.ts` — expose the isolated representation, without wiring execution.
3. Add `iips-platform/tests/regression/fixtures/np12-n4-screen-definition-format1.json` — literal E01–E14 published conformance bytes/digests and source provenance.
4. Add `iips-platform/tests/regression/np12-n4-screen-definition.test.ts` — conformance and boundary tests.
5. Add this implementation evidence document.

No existing population, engine orchestration, ranking, scoring, ontology, transport, UI, production, or governance path is an implementation target.

## Runtime boundary and usage

`ScreenDefinition.create(content, verifiedPopulation)` validates and returns an immutable canonical value with exactly the four semantic properties. The second argument is the identity-bearing view of the existing `ScreeningPopulation` contract: it must originate at `ScreeningPopulationGuard.fromOutputs()` or an independently verified result of that unchanged boundary. The serializer checks mechanical hex shape and exact textual equality against that binding; it does **not** claim that an arbitrary caller-created `{ identity }` object proves a population exists. Population verification remains the external G1–G5 trust boundary. There is no population registry, new identity derivation, member hashing, case alias, or member embedding in the new module.

```ts
import { ScreenDefinition, ScreeningPopulationGuard } from '../src/sector-engines/cross-sector';

const population = ScreeningPopulationGuard.fromOutputs(outputs);
const definition = ScreenDefinition.create({
  definitionId: ' my screen ',
  version: '01',
  populationIdentity: population.identity,
  predicates: [{ field: 'conviction', operator: 'gte', operand: '75.000000' }],
}, population);

// Exact opaque identifiers remain unchanged; operand canonicalizes to '75'.
const preimage: Buffer = definition.canonicalBytes();
const contentDigest: string = definition.sha256();
// Retrieval identity is still (definition.definitionId, definition.version).
```

The minimal operand runtime representation is lossless decimal **text**, not a binary number. Non-text operands reject rather than being stringified: otherwise original excess precision or exponent notation could disappear before admission. Validation checks source spelling before normalization. `BigInt` arithmetic realizes the governed integer scale `q` exactly; numeric comparison/deduplication never multiplies a binary floating-point decimal. Predicate records have exactly `{ field, operator, operand }`; Boolean/nesting extensions are rejected. The top-level runtime companion identifiers, timestamps, metadata, population members, results, and digest have no content position and are never inspected for serialization.

Identifiers use exact scalar validation and the fixed published White_Space list, without trimming or Unicode normalization. UTF-8 conversion occurs only after surrogate validation and byte-length capacity checks. Format-1 serialization writes the fixed nine-octet header, individual U32BE UTF-8 byte lengths, exact population identity text, count after canonical deduplication, and three text frames per predicate. The message ends at the last operand (or zero count); SHA-256 receives these octets, not their hex rendering. Cumulative arithmetic is checked; total message size is not artificially restricted to U32. Resource/allocation failures propagate without emitting alternate or truncated bytes.

The canonical value, predicate array, and predicates are frozen; returned byte buffers are fresh. This is local runtime content immutability, not persistence, historical registration, or lifecycle enforcement. There is no decoder, evaluator, growth-sentinel reconciliation, registry, version-order algorithm, or execution/result integration.

## Conformance fixture provenance

The JSON fixture contains all E01–E14 complete literal preimages and published digests from the independently retrieved canonical-byte record, with source commit/blob provenance. Input variants and canonical semantic expectations were transcribed from those examples; expected bytes/digests were **not** generated from the new serializer. The fixture extraction independently checked each literal preimage's length and Python SHA-256 against publication.

The focused suite rechecks the unchanged grammar's Git blob hash, all fourteen published literal hex blocks/digests, each input variant's canonical semantics, exact bytes, digest, and message boundary. The illustrative P0/P1 bindings are the explicit specification assumptions in §11, not invented or registered populations. A separate test uses the real unchanged G1–G5 guard and verifies exact binding, membership changes, order/value independence, and existing duplicate rejection.

Additional tests cover both identifiers' opaque/case/version/Unicode/whitespace distinctions, all frozen blank scalars, literal BOM/NUL/noncharacters/unassigned scalars, supplementary UTF-8 and unpaired surrogate rejection, byte lengths beyond one octet, numeric precision/range/syntax rejection, negative zero, exact duplicate removal, full field/operator/numeric ordering, valid empty predicates, contradictions/redundancies, exclusions, immutability, determinism, and 1,000 exact scaled-integer decimal samples.

## Validation (2026-10-02 UTC)

Environment: Node `v22.22.3`, npm `10.9.8`; locked TypeScript `5.9.3`, tsx `4.23.9`, `@types/node` `26.1.2`. `npm ci --no-audit --no-fund` installed the existing lockfile without changing package/lock/config files. Commands below run from `iips-platform`.

| Check | Result |
|---|---|
| Pre-source `npm run typecheck` | PASS |
| Pre-source `npm test` | **NON-GREEN**: 548 tests; 506 pass, 42 fail |
| `npx tsx --test tests/regression/np12-n4-screen-definition.test.ts` | PASS: 35 tests, including all E01–E14 and every published input variant |
| Post-change `npm run typecheck` | PASS |
| Explicit focused-test TypeScript command below | PASS (the existing project config includes source, not regression tests) |
| Relevant existing population/CSIP regression command below | PASS: 95 tests |
| Post-change `npm test` | **NON-GREEN**: 583 tests; 541 pass, 42 fail |
| Baseline/post-change failure comparison | Identical 42 test titles, locations, and errors; **zero new failures** |
| `git diff --check` | PASS |

Explicit test typecheck:

```sh
npx tsc --noEmit --strict --target ES2020 --module CommonJS --moduleResolution Node \
  --esModuleInterop --resolveJsonModule --types node --skipLibCheck \
  tests/regression/np12-n4-screen-definition.test.ts
```

Relevant regression command:

```sh
npx tsx --test tests/regression/np12-sector-reference-population.test.ts \
  tests/regression/cross-sector-*.test.ts \
  tests/regression/program-v1.1-track2-cross-sector-certification.test.ts \
  tests/regression/program-v1.1-track6-csip-certification.test.ts \
  tests/integration/csip-product-e2e.test.ts
```

### Failure classification — pre-existing, unrelated, not repaired

The full suite's same 42 failures occur in these unchanged `tests/regression/` files:

| File | Failures |
|---|---:|
| `program-v2.0-final-certification.test.ts` | 4 |
| `program-v2.0-wp0-constitutional-guard.test.ts` | 4 |
| `program-v2.0-wp1-distributed-runtime.test.ts` | 5 |
| `program-v2.0-wp10-observability.test.ts` | 1 |
| `program-v2.0-wp11-performance.test.ts` | 9 |
| `program-v2.0-wp12-data-governance.test.ts` | 1 |
| `program-v2.0-wp13-dr.test.ts` | 8 |
| `program-v2.0-wp14-migration.test.ts` | 5 |
| `program-v2.0-wp2-cloud-ha.test.ts` | 3 |
| `program-v2.0-wp3-live-data.test.ts` | 1 |
| `program-v2.0-wp4-enterprise.test.ts` | 1 |

Error signatures: 29 × `Unknown engine: sector.telecom`; 7 × `makeEngine is not a function`; 1 × `make is not a function`; 3 × `ENGINE_FACTORY[sec.engineId] is not a function`; 2 × `ENGINE_FACTORY[s.engineId] is not a function`. These were observed before source modification and exactly reproduced afterward. No existing expectation, governance example, engine registry, factory, or scoring behavior was changed to make the suite green.

## Scope audit, compatibility, and publication boundary

Actual inventory matches the five intended paths: four additions (module, fixture, focused test, this document) and one one-line barrel-export addition. There are no deletions. All previously tracked source except that barrel, and all governance blobs, remain untouched. No package-version or dependency/config change is made: this is a bounded additive runtime capability, not a production release or deployment. Existing execution paths do not call it.

Excluded: persistence/storage/registry/retention implementation; UI/API/transport redesign; execution/results/snapshot models; production/IPD integration or deployment; population algorithms or vocabulary changes; RankingEngine/scoring/ontology changes; new fields/operators; OR/NOT/nesting; logical simplification; unrelated refactoring and existing failure repair.

Publication must commit and push only `arena/01a0fb16-iips-review-recovered`, open a PR into authoritative `main`, and use the permitted PR merge workflow without bypassing protections. An Arena-local commit, transfer patch, pushed session branch, or unmerged PR is **not authoritatively complete**. Completion requires independent post-merge retrieval of `main`'s commit/tree, every changed file/blob, the authority record, and all eight unchanged prior governance blobs, plus a complete remote tree comparison. Actual implementation and publication commit/tree hashes belong in the post-publication receipt; they are not fabricated as self-referential fields in this document.
