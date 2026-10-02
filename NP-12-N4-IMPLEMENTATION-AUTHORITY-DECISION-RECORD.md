# NP-12 N4 — Screen Definition Implementation-Authority Decision Record

**Record type:** Additive implementation-authority decision
**Commission:** NP-12 Governed Screener N4 — implementation-authority publication gate
**Decision authority:** Program Authority, as commissioned for this gate
**Decision:** IMPLEMENTATION AUTHORITY GRANTED FOR `N4-SD-IMPLEMENTATION` ONLY, effective only upon publication and independent verification on authoritative IRR `main`
**Production authority:** NONE
**Preparation date:** 2026-10-02

## 1. Authority and publication condition

The authoritative repository is `ramkivs/iips-review-recovered`, branch `main`. This is a new, additive decision; it neither edits the prior governance nor derives authority from the prior G1–G5 implementation-authority decision. An Arena draft, local commit, transfer package, push to a session branch, or open PR does **not** activate this decision. Implementation authority becomes effective only when this exact record is merged into authoritative `main`, remotely retrieved from that branch, and the prior governance and implementation paths are independently verified unchanged. If that verification fails, implementation remains unauthorized.

At preparation, authoritative GitHub `main` was freshly read through the remote Git object API, independently of the assigned checkout:

| Item | Remote reference at preparation |
|---|---|
| Commit | `3e56ef001a42946bbdf57b9b865c9c10fce5148c` |
| Tree | `73a960ba1918b5c32db1c30b65b242c60c17560a` |
| N3 criteria/operator/Boolean | `NP-12-SCREENING-CRITERIA-OPERATOR-BOOLEAN-GOVERNANCE.md` — `c2402d36b7610cb4ce52abf1d071d3d46f136f62` |
| Original N4 decisions | `NP-12-SCREEN-DEFINITION-GOVERNANCE-DECISIONS.md` — `8941acadfd01c3edf97a91bd012ff616abed311f` |
| N4 Program Authority follow-on | `NP-12-N4-PROGRAM-AUTHORITY-DECISION-RECORD.md` — `59debade35d11551ee5948376a8462e198589679` |
| G1–G5 population semantics | `NP-12-SECTOR-REFERENCE-POPULATION-SEMANTICS-DEFINITION.md` — `af732d754992e00557246e73d2ec2a99c939c73b` |
| Existing G1–G5-only implementation authority | `NP-12-IMPLEMENTATION-AUTHORITY-DECISION.md` — `316482cb0022657b3f5ef1f91a2f7cd4e042585d` |
| Earlier population readiness assessment | `NP-12-IMPLEMENTATION-READINESS-GATE-REPORT.md` — `10e8dc0099db848217966111a113255dd21d516b` |
| N4 identifier governance | `NP-12-N4-DEFINITION-IDENTIFIER-GOVERNANCE-DECISION-RECORD.md` — `97f39649d3b419dc4b70e29a7c45e18f43c97a39` |
| N4 canonical-byte grammar | `NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD.md` — **`6d823aeecc2a6047782f48dad33d61f26bbe89d8`** |

The canonical-byte blob above has 40 hexadecimal characters; the previously circulated 39-character transcription is not an object ID. The eight records were retrieved from authoritative remote and their Git blob hashes checked. From the preceding canonical-grammar baseline (`200c7a3ca478e496c9961f9ca9de8ca54b686d6a`) to the preparation baseline, only the canonical-byte record was added; implementation files did not change. No previously prepared authority draft or transfer package was available in this session; this record is reconstructed from the remote governance, not adopted from an unverified local blob.

Prior records' statements that they themselves grant **no N4 implementation authority** remain true. This is the separate explicit decision contemplated by those records. The existing G1–G5 population authority remains independently bounded to G1–G5; it is not expanded or replaced here.

## 2. Frozen contract that bounds this decision

- **Identity/lifecycle:** A Screen Definition Version is identified and retrievable by `(definitionId, version)`. A registered version is immutable; a semantic change creates a new version. Both components are opaque, non-empty, non-blank text with exact, case-sensitive textual equality and identity-significant spelling. Do not trim, normalize Unicode, alias, coerce, or interpret either as a number; `version` has no semver inference or numeric order, and `"1"` differs from `"01"`. The canonical-byte record specifies strict Unicode scalar validation and the exact fixed whitespace set for blank rejection.
- **N3:** Fields are exactly `conviction`, `quality`, `growth`; operators exactly `lt`, `lte`, `gt`, `gte`, `eq`; Boolean combination is flat AND only. Unavailable normalized growth fails every growth predicate, including at the `growth = 0` sentinel. No N3 decision is reopened.
- **Numeric operands:** Finite fixed-point decimal, at most six fractional digits, range 0–100 inclusive for the admitted fields. Excess precision rejects before removing zeroes; exponent notation, forbidden leading-zero forms, NaN, and either infinity reject. No rounding. Negative zero canonicalizes to `0`; trailing fractional zeroes are removed and an all-zero fractional part drops the point. Equivalence, duplicate detection, and numeric ordering use the exact scaled-integer value `q = 1,000,000 × x` from the grammar, not binary floating-point or lexical decimal ordering.
- **Predicates:** Shape `{ field, operator, operand }`; exact canonical duplicates are removed; contradictions and other non-identical predicates are retained without logical simplification. Sort by `field → operator → canonical operand`: exact ASCII field order `conviction < growth < quality`, operator order `eq < gt < gte < lt < lte`, then ascending numeric `q`. The empty collection is valid and matches the entire bound population; a missing collection is not empty.
- **Population binding:** Use the established G1–G5 `populationIdentity`, independently verified at the established population boundary. Definition references its exact verified identity text; it does not embed members or derive an alternate population identity. G1–G5 membership, normalization, uniqueness, duplicate rejection, canonical member ordering, and identity-input decisions are untouched. Neither `companyId` nor `portfolioId` substitutes for this binding.
- **Digest:** SHA-256 is only an integrity/equality aid, not Definition identity. Content consists of `definitionId`, `version`, `populationIdentity`, and the canonical predicate collection. `executionId`, `resultId`, `snapshotId`, `evidenceId`, timestamps, runtime metadata, population members, and result data are excluded.
- **Retention:** A Definition Version remains persistent/retrievable by `(definitionId, version)` after execution, with no automatic expiry, TTL, or fixed calendar duration. Deletion requires a separately governed lifecycle/deletion event. This decision neither implements persistence nor chooses storage technology nor changes retention.

## 3. Frozen canonical bytes and digest preimage

The authoritative grammar is the entire `NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD.md` at the blob in §1; it is incorporated by reference **without amendment**. Its mechanical format is fixed: nine-octet header `4e5031324445460001` (eight magic octets `NP12DEF` plus NUL, then format-version octet `01`); strict, unnormalized RFC 3629 UTF-8; each textual component framed by its **UTF-8 byte length** as unsigned fixed four-octet big-endian `U32BE`, followed by exactly those bytes. Unpaired surrogates and malformed UTF-8 are rejected rather than replaced. There are no tags, delimiters, alternate integer widths, or terminators.

The exact preimage is:

```text
H || T(definitionId) || T(version) || T(populationIdentity)
  || U32BE(number of sorted, deduplicated predicates)
  || for each canonical predicate in order:
       T(exact field token) || T(exact operator token)
       || T(canonical plain-decimal ASCII operand)
```

Here `T(s) = U32BE(length in UTF-8 octets of s) || strict UTF-8 bytes of s`. Population identity is the **exact verified 64-character hexadecimal text**, framed with `00000040`; it is not decoded into 32 digest octets, case-folded, or rederived. Lexical hex shape alone does not prove binding. The predicate count follows deduplication; each predicate has three framed textual components and no enclosing predicate frame. Empty predicates have the exact collection bytes `00000000`, without a trailing byte. SHA-256 hashes **all and only** these preimage octets; its textual rendering is lowercase hex, never itself included in the preimage. The grammar's fourteen published worked examples E01–E14, including complete preimages and SHA-256 digests, are conformance fixtures; no newly invented examples replace them. A future grammar format or byte rewrite needs separate governance.

## 4. Explicitly authorized work — `N4-SD-IMPLEMENTATION` only

Implementation authority is **NOW EXPLICITLY GRANTED FOR `N4-SD-IMPLEMENTATION` ONLY**, subject to §1's remote publication and verification condition and strictly bounded by §§2–3. The authorized scope is exactly:

1. Screen Definition runtime types and the minimum runtime boundary required to represent the governed Screen Definition;
2. exact `definitionId` and `version` validation;
3. governed numeric admission and canonicalization;
4. predicate validation and canonicalization;
5. exact canonical duplicate removal;
6. governed canonical predicate ordering;
7. frozen format-1 canonical byte serialization;
8. SHA-256 over the exact preimage and lowercase hexadecimal digest generation; and
9. conformance tests for the above, including all fourteen published worked examples, exact preimage bytes/digests, identity and Unicode/whitespace distinctions, malformed inputs, and boundary conditions.

This grants a narrow mechanical implementation, not discretion to change semantic decisions, invent a new vocabulary, select an alternate byte representation, or implement unrelated Screening execution. Before source modification, inspect the existing architecture and identify exact target paths; make the narrowest compatible change. If an apparent requirement exceeds this boundary, **STOP** and report it as a governance dependency rather than deciding it in implementation.

## 5. Explicit exclusions and stop boundary

This decision does **not** authorize:

- persistence implementation, storage technology selection, retention changes, deletion lifecycle changes, execution/result persistence, or registry/database work;
- UI or screener UI; unrelated API or transport redesign; authentication, authorization, or tenancy redesign;
- IPD integration, production changes or deployment;
- `RankingEngine` changes, scoring changes, or ontology changes;
- population G1–G5 changes, sector/reference membership or normalization changes, portfolio identity changes, or `companyId` substitution;
- new screening fields or operators; OR, NOT, nesting, grouping, or expression-tree support;
- snapshot semantics or execution/result model implementation; or
- unrelated refactoring.

An implementation dependency on any of these must return to governance. An existing code path or historical IPD precedent does not override this decision.

## 6. Gate status and verification obligations

| Boundary | Status under this decision |
|---|---|
| Read-only investigation | COMPLETE |
| Governance | COMPLETE; prior decisions frozen |
| Canonical byte specification and exact digest preimage | COMPLETE; format 1 frozen |
| Implementation authority | **NOW EXPLICITLY GRANTED FOR `N4-SD-IMPLEMENTATION` ONLY, effective after authoritative `main` publication and independent remote verification** |
| Production authority | NONE |
| IPD authority | NONE |
| Persistence authority beyond already governed contracts | NONE |
| Authority to alter governance | NONE |

Before any implementation, retrieve this record from authoritative remote `main`, identify its commit/tree/blob, compare all eight prior governance blobs in §1 unchanged, and verify implementation directories unchanged since the preparation baseline. Only then can the gate be reported as **N4 IMPLEMENTATION AUTHORITY = GRANTED — DURABLY PUBLISHED**. Source changes, tests, and their eventual remote publication are separate subsequent steps; this record does not declare them completed. If this record cannot be published or verified remotely, it is only a draft/transfer artifact and confers **no active implementation authority**.

**End of N4 implementation-authority decision record.**
