# NP-12 N4 — Canonical Byte Grammar and Exact Digest Preimage Decision Record

**Record type:** Additive mechanical-design governance decision record  
**Commission:** NP-12 N4 Mechanical Canonical Byte-Grammar + Exact Digest Preimage Design Gate  
**Program Authority:** Ramki  
**Design status:** Fully specified; authoritative closure requires publication to IRR `main`  
**Implementation authority:** NOT GRANTED  
**Scope:** Specification only; no serializer, runtime type, evaluator, persistence, test, or production implementation  
**Preparation date:** 2026-10-01

## 1. Authority, remote baseline, and durability boundary

IRR is the primary authority. IPD is historical/reference lineage only and was not used to supply this grammar. Production is out of scope.

Before design analysis, authoritative GitHub `main` was read remotely. Its commit, tree, and records were checked against the commissioned baseline. Repository content was inspected in a separate, commit-pinned remote archive, not inferred from the assigned Arena checkout.

| Item | Remotely verified reference |
|---|---|
| Repository / authoritative branch | `ramkivs/iips-review-recovered` / `main` |
| Baseline commit | `200c7a3ca478e496c9961f9ca9de8ca54b686d6a` |
| Baseline tree | `363979378197c3138708a824aa8d7f00f16ca025` |
| Identifier-governance record | `NP-12-N4-DEFINITION-IDENTIFIER-GOVERNANCE-DECISION-RECORD.md` — blob `97f39649d3b419dc4b70e29a7c45e18f43c97a39` |
| N3 record | `NP-12-SCREENING-CRITERIA-OPERATOR-BOOLEAN-GOVERNANCE.md` — blob `c2402d36b7610cb4ce52abf1d071d3d46f136f62` |
| Original N4 record | `NP-12-SCREEN-DEFINITION-GOVERNANCE-DECISIONS.md` — blob `8941acadfd01c3edf97a91bd012ff616abed311f` |
| Follow-on N4 Program Authority record | `NP-12-N4-PROGRAM-AUTHORITY-DECISION-RECORD.md` — blob `59debade35d11551ee5948376a8462e198589679` |
| Population semantics | `NP-12-SECTOR-REFERENCE-POPULATION-SEMANTICS-DEFINITION.md` — blob `af732d754992e00557246e73d2ec2a99c939c73b` |
| Implementation-authority record | `NP-12-IMPLEMENTATION-AUTHORITY-DECISION.md` — blob `316482cb0022657b3f5ef1f91a2f7cd4e042585d` |
| Earlier implementation-readiness report | `NP-12-IMPLEMENTATION-READINESS-GATE-REPORT.md` — blob `10e8dc0099db848217966111a113255dd21d516b` |

Remote comparison established:

- From the preceding N4 baseline `45768643cafecc97c6e4a3f2d40c2a4e42e6fb6a` to the verified baseline, only the follow-on N4 Program Authority record and the identifier-governance record were added.
- From the preceding governance publication `c1febdebea90154c73bdc5d7f3798ac250e6e2dd` to the verified baseline, only the identifier-governance record was added: 211 additions, zero deletions, expected blob as above.
- No implementation file changed in either comparison. No unexpected baseline difference was found.
- The implementation-authority record grants only G1–G5 population implementation authority. It does **not** grant N4 Definition implementation authority.

The identifier record controls identifier semantics and already preserves the closed retention rules. Earlier records are not rewritten by this additive record. Displayed dates in earlier artifacts are preserved verbatim; commit ancestry and verified blobs, not displayed-date ordering, establish provenance.

This document contains the mechanical decisions commissioned by this gate. A local file, session-branch commit, or open pull request is **not** authoritative `main` publication. Until remote `main` contains this record, it is a complete transfer specification, not a completed durability gate. Even after publication, it grants no implementation authority.

## 2. Frozen semantic contract preserved

The encoding represents the governed canonical semantic tuple:

```text
definitionId, version, populationIdentity, canonical predicate set
```

It does not preserve discarded input order, duplicate occurrences, or non-canonical numeric spelling; those are already non-semantic under the closed canonicalization rules. “Lossless” and “injective” here concern the governed canonical semantic tuple, not the caller's raw representation.

The following remain unchanged:

- Definition identity and retrieval key are `(definitionId, version)`. Both are opaque, non-empty, non-blank text, compared exactly and case-sensitively. No trimming, normalization, aliases, coercion, numeric interpretation, or version-order inference is introduced. `"1"` and `"01"` remain different versions.
- Fields are exactly `conviction`, `quality`, and `growth`; operators are exactly `lt`, `lte`, `gt`, `gte`, and `eq`. No additional vocabulary is admitted.
- Boolean semantics are flat AND only. No OR, NOT, nesting, grouping, or expression tree is introduced.
- Predicate shape remains `{ field, operator, operand }`. Canonical key precedence is `field → operator → canonical operand`.
- Exact canonical duplicates are removed. No broader logical simplification is performed. Contradictions are permitted and retained.
- Empty predicates are valid and mean the entire bound population. Missing predicates are not an empty collection.
- Operands use finite fixed-point decimal semantics, at most six fractional decimal digits, range 0–100 inclusive, and the closed leading-zero and rejection rules. Excess precision rejects before trailing-zero removal; nothing is rounded. Exponents, NaN, and both infinities reject. Trailing fractional zeroes are removed; a zero fractional part has no decimal point; negative zero becomes `0`.
- Unavailable normalized growth does not satisfy any growth predicate; the N3 sentinel remains `growth = 0`. Encoding an operand zero does not change that evaluation rule.
- Population binding remains G1–G5. Definition references `populationIdentity`; it does not contain membership or recompute population identity. Company, portfolio, execution, snapshot, or timestamp identifiers are not substitutes.
- SHA-256 is an integrity/equality aid, not Definition identity. Runtime identifiers, timestamps, and metadata are excluded.
- Definition Versions remain persistent/retrievable, with no automatic expiry, TTL, or fixed calendar duration. Deletion requires a separately governed lifecycle/deletion event. Historical versions remain immutable; storage technology remains ungoverned.

## 3. Final read-only repository primitive investigation

The entire commit-pinned remote archive was searched using case-insensitive, hidden-file-inclusive, ignore-independent searches (`rg --no-ignore --hidden -n -i`). Search vocabulary included:

```text
TextEncoder; Buffer.from; utf8/UTF-8; byteLength; DataView; Uint8Array;
integer encoding; writeUInt; writeInt; length-prefix; varint; fixed-width;
little-endian; big-endian; endianness; canonical serialization;
canonical JSON; stable stringify; deterministic serialization;
SHA-256; createHash; digest; framing; tagged encoding;
binary encoding; decimal encoding.
```

A supplementary source search covered `JSON.stringify`, serialization/checksum functions, `charCodeAt`, `Buffer.concat`, buffer allocation, integer reads/writes, and WebCrypto. Existing tests were read as evidence only; none were executed. No dependency installation, build, typecheck, or test command was run.

| Relevant precedent at the verified commit | Classification | Consequence |
|---|---|---|
| `iips-platform/src/sector-engines/cross-sector/population/ScreeningPopulation.ts:158–169`, `serializeMembers` | **DOMAIN-SPECIFIC** | Population count and string lengths are decimal text followed by `:`; `.length` is JavaScript UTF-16 code-unit length. This is the established population preimage, not a generic byte grammar. It is neither changed nor promoted into Definition framing. |
| Same file, `populationIdentity`, lines 173–182: `createHash('sha256').update(..., 'utf8').digest('hex')` | **REUSABLE PRIMITIVE ONLY** | Establishes SHA-256/UTF-8/hex library availability and current lowercase hexadecimal population output. Its member serialization is not reused. A future Definition hash call must receive the exact specified bytes, not this population payload. |
| `iips-platform/src/framework/transport/Transport.ts:33–45`, `serialize` | **DOMAIN-SPECIFIC** | Constructs a transport DTO and calls `JSON.stringify`. Nested maps and metadata are not a general canonical byte grammar. Runtime transport content and JSON behavior cannot enter the Definition preimage. |
| Same file, `checksum` and `transportHash`, lines 47–52 and 85–93 | **NOT APPLICABLE** | FNV-1a-ish hashing of JavaScript code units, including transport-domain content, is not SHA-256 or Definition framing. |
| `frontend/server/live/real-oidc-verifier.ts:68`, `TextEncoder` | **REUSABLE PRIMITIVE ONLY** | UTF-8 conversion primitive exists. Its JWT signed-message construction is not Definition framing. Any future use must first enforce this record's Unicode validity rules; replacement of lone surrogates is forbidden. |
| Same file, lines 27–35, `Buffer.from`, UTF-8 decoding, `Uint8Array` | **REUSABLE PRIMITIVE ONLY** | Byte storage/conversion primitives exist. Base64url decoding is specific to JWTs; its permissive text decoding is not canonical Definition validation. |
| Same file, lines 69–75 and 90–96, RS256/WebCrypto | **DOMAIN-SPECIFIC** | RSA/JWT signature verification is not a raw Definition content-digest construction. |
| `frontend/server/pit-transport.ts:78–82`, `Buffer.byteLength` | **REUSABLE PRIMITIVE ONLY** | Measures encoded byte length for HTTP content-length. It supplies no count width, endianness, component framing, or canonical grammar. |
| `frontend/server/admin-transport.ts:279–289`; `frontend/server/executive-transport.ts:613–618`; `frontend/server/engine-transport.test.ts:36`, `Buffer.concat(...).toString('utf8')` | **REUSABLE PRIMITIVE ONLY** | Byte concatenation primitive exists. HTTP-body JSON handling, including decoder replacement behavior, cannot be adopted as the Definition grammar. The existing test file was not run. |
| `frontend/server/executive-transport.ts:72–75, 96–104` and the matched platform integration/regression tests: UTF-8 file reads and `JSON.parse` | **NOT APPLICABLE** | File loading and JSON parsing are not deterministic canonicalization or framing. This includes all other test matches that merely read files as UTF-8. |
| `iips-platform/tests/regression/{consumer,industrials,technology,utilities}-wp4-validation.test.ts`: `createHash('sha256')` | **REUSABLE PRIMITIVE ONLY** | Demonstrates the hash API only. The raw-file-content preimages are domain-specific calibration integrity checks, not Definition preimages. These files were not run. |
| `iips-platform/tests/regression/np12-sector-reference-population.test.ts:207`, population length-prefix collision example | **DOMAIN-SPECIFIC** | Evidence about existing population framing only; not a reusable Definition grammar and not executed. |
| `iips-platform/src/infrastructure/IdProvider.ts:8–40` | **NOT APPLICABLE** | FNV-style identifier generation, uppercasing, character stripping, coercion, and runtime generation would violate the closed Definition identifier contract. |
| `iips-platform/src/distributed/AiAssistedRuntime.ts:41–49, 81–85`; `PluginMarketplace.ts:31–49, 74–78`; `V2Observability.ts:47–56` | **NOT APPLICABLE** | Advice/manifest/trace fingerprints and JSON-based equality are domain-specific FNV/runtime mechanisms, not canonical Definition bytes or SHA-256. |
| Matched freeze manifests/reports, certification assets, integration/durability documents, NP-12 governance prose, HTML charset declaration, and package-lock integrity strings | **NOT APPLICABLE** | Recorded hashes, charset declarations, and documentary requirements contain no independently reusable canonical byte grammar. Prior NP-12 requirements remain semantic authority, not an existing serializer. |

**DIRECTLY REUSABLE: none.** No directly reusable generic canonical grammar, strict Unicode framing primitive, integer-write format, canonical decimal byte encoder, or stable/canonical JSON implementation was found. No actual `DataView`, integer-write, varint, fixed-width, or endianness precedent was found. This gate therefore selects and records the complete mechanical grammar below instead of inferring it from a domain serializer.

## 4. Mechanical decisions selected by this gate

| Surface | Exact choice | Reason/consequence |
|---|---|---|
| Format/domain discriminator | Eight fixed magic octets plus one format-version octet | Separates this domain and mechanical format from opaque Definition `version`; all nine octets enter the digest. |
| Text encoding | Strict RFC 3629 UTF-8 over Unicode scalar sequences | Lossless, uniquely encoded Unicode text without normalization; invalid Unicode cannot collapse through replacement encoding. |
| Lengths and collection count | Unsigned 32-bit, fixed-width, big-endian | One representation, no varint/minimality alternatives, and independently implementable boundaries. Capacity/overflow are explicit, not inferred from runtime integers. |
| Field/operator representation | Exact governed ASCII token text, each length-prefixed | No arbitrary tag registry or risk of mistaking tag order for semantic order. More bytes than compact tags, but self-describing, stable, one-to-one vocabulary. |
| Operand representation | Canonical plain decimal ASCII text, length-prefixed | Directly preserves governed canonical decimal semantics; no floating-point or binary-number representation enters the preimage. |
| Population representation | **A — exact hexadecimal textual representation** | Preserves the already-verified textual reference; no hex decoding, case folding, or new population identity derivation. |
| Predicate sequence | Deduplicated and strictly ascending by the fixed comparators in §5 | Key precedence remains field, then operator, then canonical numeric operand. Encoded length prefixes do not control sorting. |
| Delimiters/tags | No component delimiters, field tags, operator tags, end marker, or padding | Boundaries come only from fixed widths, byte lengths, count, and known positional structure. The magic's fixed NUL octet is not a component delimiter. |

## 5. Semantic input validation and canonical predicate sequence

This section specifies mathematical canonicalization requirements, not a runtime type, API, or serializer implementation.

### 5.1 Before any bytes are accepted as an encoding

The four governed components must be present. `predicates` must be an explicitly supplied finite flat collection; missing, null, nested, or malformed predicates are not silently converted to `[]`. Each predicate must supply exactly its governed semantic field, operator, and operand. Runtime companion metadata has no position in this grammar and is never hashed.

Validate the already-governed text, vocabularies, numeric admission rules, and independently verified population binding. Reject non-text identifiers rather than coercing them. Do not infer validity from a successful UTF-8 conversion or from a successful hash invocation.

Numeric input validation occurs **before** canonical spelling is produced: in particular, excess fractional precision is rejected even if the excess digits are zero. `75.0000000` cannot become admissible merely by dropping zeroes. The existing leading-zero, exponent, finite-value, and range rules remain controlling. This record introduces no new caller syntax, numeric runtime type, coercion, or automatic trimming.

### 5.2 Exact numeric comparison key and canonical text

For an admitted value `x`, define the exact integer:

```text
q = 1,000,000 × x
0 ≤ q ≤ 100,000,000
q is an integer
```

This is an exact mathematical fixed-point key, **not** a binary floating-point multiplication or a second wire representation. Negative zero has `q = 0`.

Let `a = floor(q / 1,000,000)` and `r = q − 1,000,000 × a`.

- Write `a` as ordinary ASCII base-10 digits with no leading zeroes, except that integer zero is `0`.
- If `r = 0`, that integer text is the complete canonical operand.
- Otherwise write `r` as exactly six decimal digits with left zero-padding, remove trailing zeroes from that six-digit fractional sequence, and append `.` plus the remaining fractional digits to the integer text.

Thus the fractional sequence is non-empty and ends in `1`–`9`. This mapping never rounds and yields exactly one canonical text for every governed value. The reverse interpretation recovers `q` exactly using base-10 integer arithmetic. The scale key is used for equality/deduplication/ordering only; it is **not** serialized as an integer.

### 5.3 Exact total predicate order

The frozen key precedence remains:

```text
field → operator → canonical operand
```

This gate pins the comparison within those keys:

1. Compare exact field token spellings in ascending unsigned ASCII lexicographic order: compare octets at the first difference; a proper prefix precedes its extension. The resulting field order is **`conviction < growth < quality`**.
2. When fields are equal, compare exact operator token spellings by the same rule. The resulting operator order is **`eq < gt < gte < lt < lte`**.
3. When both are equal, compare exact canonical numeric values in ascending order by integer `q`. For example, `2 < 10`; do **not** lexicographically sort decimal text as `10 < 2`.

The vocabulary display order in prior records is not an ordering tag assignment. These comparators complete the mechanical total order for the already-frozen key sequence; they introduce no field priority, operator precedence, Boolean semantics, or Definition-version ordering.

Predicates are exact canonical duplicates iff field token, operator token, and `q` all agree. Remove duplicate occurrences, then sort the remaining predicates by the above total order. Predicate count is the number **after** deduplication. Do not sort framed bytes, object keys, locale-collation results, arbitrary tags, or original numeric spellings. Do not simplify redundancy or contradictions.

## 6. Octets, unsigned integers, text, and identifier framing

### 6.1 Notation

An octet is an integer 0–255. `||` means ordered octet-sequence concatenation; it adds no separator. Hexadecimal displays use two hex digits per octet. Formatting spaces, line breaks, code fences, labels, and quotes in this document are not encoded.

### 6.2 `U32BE(n)` — the only length/count integer format

For integer `0 ≤ n ≤ 4,294,967,295`, `U32BE(n)` is exactly four octets, in this order:

```text
floor(n / 16,777,216) mod 256
floor(n / 65,536)     mod 256
floor(n / 256)        mod 256
n                    mod 256
```

Examples:

| n | Octets, hex |
|---:|---|
| 0 | `00 00 00 00` |
| 1 | `00 00 00 01` |
| 2 | `00 00 00 02` |
| 6 | `00 00 00 06` |
| 10 | `00 00 00 0a` |
| 64 | `00 00 00 40` |
| 4,294,967,295 | `ff ff ff ff` |

There is no signed interpretation, varint, textual integer, little-endian option, alignment, or optional padding. Negative, non-integral, or overflowing encoder lengths/counts reject. They must never wrap, saturate, truncate, or be converted modulo 2³². Checked exact arithmetic is required for cumulative lengths and offsets; the total message is not itself constrained to fit a U32 merely because individual prefixes are U32.

A text payload can contain at most 4,294,967,295 octets in this format. This is a mechanical representation capacity, not a new semantic interpretation of an identifier. A larger value has **no format-1 encoding**; report inability to represent it rather than changing, trimming, hashing, or splitting its identity. Any larger-capacity format requires a separately governed format change.

Predicate count also has a U32 representation. Under the present vocabularies and scale, there are at most `3 × 5 × 100,000,001 = 1,500,000,015` distinct canonical predicates, so a canonical count cannot exceed that tighter domain bound. Do not silently impose a lower implementation-specific canonical count or length limit. Resource exhaustion is a failure to complete an operation, not permission to emit different bytes.

### 6.3 Strict Unicode and UTF-8

Text is a finite sequence of Unicode scalar values: U+0000–U+D7FF and U+E000–U+10FFFF. UTF-8 is exactly the shortest RFC 3629 encoding of each scalar, in sequence.

- No NFC, NFD, NFKC, NFKD, case folding, trimming, newline conversion, escaping, or transcoding normalization occurs.
- A UTF-16 runtime must reject unpaired high/low surrogates before encoding. A valid surrogate pair represents its single scalar normally.
- Strict decoding rejects isolated continuation bytes, bad continuation structure, truncated multibyte sequences, overlong encodings, surrogate scalar encodings, values above U+10FFFF, and invalid leading octets.
- Never replace malformed input with U+FFFD. A literally supplied valid U+FFFD scalar is ordinary text and must be distinguishable from rejected malformed input.
- Valid noncharacters and currently unassigned scalar values are not excluded by this byte grammar. No locale or platform text repair is permitted.
- No UTF-8 BOM is prepended. An actually supplied U+FEFF inside a text value is data, not a transport BOM, and is not removed.
- Length is the number of encoded **octets**, not characters, grapheme clusters, code points, UTF-16 code units, or a JavaScript `.length` value.

For a text value `s`, define:

```text
B(s) = strict UTF-8 octets of the exact scalar sequence s
T(s) = U32BE(number of octets in B(s)) || B(s)
```

`T` uses no terminator or escape syntax. An embedded NUL, colon, quote, pipe, newline, or header-like text has no framing role inside the stated byte length.

### 6.4 Non-empty/non-blank check and the two opaque identifiers

For the mechanical check of the frozen whitespace-only rejection rule, the whitespace set is the following explicit Unicode `White_Space` scalar set:

```text
U+0009–U+000D, U+0020, U+0085, U+00A0, U+1680,
U+2000–U+200A, U+2028, U+2029, U+202F, U+205F, U+3000
```

The list, not a changing runtime `trim`, regular-expression class, locale, or Unicode-property table, controls this check. Reject an empty scalar sequence or a sequence consisting entirely of members of that set. This is validation only: do not remove any of those characters from an otherwise non-blank admitted value. No additional printable-only restriction is introduced. U+FEFF is not in this explicit whitespace set and remains literal data.

The encoding is:

```text
definitionId component = T(exact admitted definitionId)
version component      = T(exact admitted version)
```

Each has its own four-octet byte-length prefix and payload. A zero prefix, whitespace-only identifier, non-text input, invalid Unicode, or overflowing encoded length is rejected; none denotes a missing/default identifier. Neither value is hashed separately or interpreted as a number, UUID, ULID, alias, or semver. Leading/trailing meaningful whitespace remains in its exact bytes. These rules are identical for the two identifiers but their positions are distinct.

## 7. Population identity representation — option A selected

**Select A only: encode the exact governed hexadecimal textual representation with `T(populationIdentity)`. Do not decode it to 32 raw digest bytes.**

The existing population boundary emits the 64 lowercase ASCII hexadecimal characters of its SHA-256 result (`digest('hex')`). Definition must reference the independently verified identity text from that established boundary; it does not derive another identity.

The mechanical hexadecimal shape is exactly 64 ASCII hexadecimal characters (`0`–`9`, `a`–`f`, `A`–`F`), with no `0x`, `sha256:`, spaces, or separators. The current producer's admitted outputs are lowercase. Allowing the mechanical recognition of uppercase hex is **not** authority to mint an uppercase alias: an exact supplied spelling must still pass the unchanged external population-binding verification. This grammar never converts case, infers equality by hex decoding, or broadens which populations the binding authority admits.

For every bound value its component is exactly:

```text
00 00 00 40 || 64 UTF-8/ASCII octets of the exact verified identity text
```

A different character or character case, when itself an admitted verified reference, yields different payload bytes. No textual identity distinction is lost. The framing is injective even across hexadecimal spellings because UTF-8 preserves the exact text, not merely the digest integer denoted by that text. Two implementations need only agree on the already-bound text and the specified UTF-8 framing; they need no hex-decoding/endian choice. This is deliberately less compact than raw digest bytes in order to avoid silently reinterpreting the established textual reference.

A 64-character illustrative hex value in §11 is a specification assumption about a bound reference, not a claim that such a population was actually registered or that its membership was calculated in this gate.

## 8. Exact field, operator, and numeric component bytes

### 8.1 Fields — text, no field tags

| Field | UTF-8 payload, hex | Length | Complete `T(field)`, hex |
|---|---|---:|---|
| `conviction` | `63 6f 6e 76 69 63 74 69 6f 6e` | 10 | `0000000a636f6e76696374696f6e` |
| `growth` | `67 72 6f 77 74 68` | 6 | `0000000667726f777468` |
| `quality` | `71 75 61 6c 69 74 79` | 7 | `000000077175616c697479` |

Only these exact token payloads are valid. No aliases, case variants, or additional fields are accepted. This mapping is one-to-one and stable; object-property order cannot affect it.

### 8.2 Operators — text, no operator tags

| Operator | UTF-8 payload, hex | Length | Complete `T(operator)`, hex |
|---|---|---:|---|
| `eq` | `65 71` | 2 | `000000026571` |
| `gt` | `67 74` | 2 | `000000026774` |
| `gte` | `67 74 65` | 3 | `00000003677465` |
| `lt` | `6c 74` | 2 | `000000026c74` |
| `lte` | `6c 74 65` | 3 | `000000036c7465` |

Only these exact token payloads are valid. There are no numeric operator tags or inferred aliases.

### 8.3 Canonical numeric text — no binary number on the wire

The operand component is `T(canonical decimal text derived in §5.2)`. Its characters are exclusively ASCII digits and, when needed, ASCII `.` (octet `2e`). No sign, exponent, whitespace, grouping separator, decimal comma, locale form, or numeric JSON representation appears in canonical bytes.

The lexical shape of canonical decimal text is an integer part `0` or a non-zero digit followed by zero or more digits, optionally followed by `.` and one through six fractional digits whose **last digit is non-zero**. Its exact base-10 value must additionally be 0–100 inclusive. These lexical and range conditions are both required; for example, `100.000001` is out of range even though it has the lexical shape. The maximum canonical operand payload length under this domain is nine octets.

| Semantic value / admitted source spelling | Canonical text | Payload hex | Complete component hex |
|---|---|---|---|
| `75`, `75.0`, `75.000000` | `75` | `37 35` | `000000023735` |
| `0.5`, `0.500000` | `0.5` | `30 2e 35` | `00000003302e35` |
| `75.123456` | `75.123456` | `37 35 2e 31 32 33 34 35 36` | `0000000937352e313233343536` |
| `-0`, `-0.0`, `-0.000000`, `0` | `0` | `30` | `0000000130` |
| `100`, `100.000000` | `100` | `31 30 30` | `00000003313030` |

`75.1234567`, `75.0000000`, `1e1`, forbidden leading-zero forms, NaN, and both infinities reject at semantic admission; they do not acquire an encoding by conversion or rounding. A decoder also rejects any non-canonical operand spelling on the wire, including `75.0`, `-0`, and `0.500000`. Encoder admission/canonicalization and canonical-byte validation are distinct (§13).

## 9. Overall framing, predicates, collection, and format compatibility

### 9.1 Exact nine-octet header

```text
Magic:          4e 50 31 32 44 45 46 00
Format version: 01
Header H:       4e 50 31 32 44 45 46 00 01
```

The seven printable magic octets spell ASCII `NP12DEF`; they are followed by one fixed NUL octet. The separate format version is a single unsigned octet whose **only admitted value is 1**. It is not `U32BE(1)` and not textual `"1"`. The first preimage octet is exactly **`4e`**. No BOM or other prefix precedes it.

All nine header octets enter the SHA-256 preimage. They are fixed format/domain constants, not runtime metadata.

Definition `version` remains an opaque identity component, encoded later with `T`. This mechanical format marker introduces no second semantic version axis, semver ordering, or relationship between a Definition's version spelling and the value `01` here.

Unknown magic or format-version octets reject; they are not guessed, downgraded, or parsed as format 1. There is no extension area, optional tag, alternate spelling, or field-skipping rule in format 1. Future grammar/vocabulary changes need separate explicit governance and a separately assigned format discriminator. Format 1 is frozen by this record. Re-encoding identical semantic content in a hypothetical future format can change its digest without changing identity; this record does not authorize such a format, migration, or historical byte/digest rewrite.

### 9.2 Predicate and collection framing

For one canonical predicate `p`, the exact predicate bytes are:

```text
P(p) = T(p.field) || T(p.operator) || T(canonical operand text)
```

There is no predicate-length wrapper or tag. Three framed components define the predicate boundary exactly; the end of the operand payload is its end.

For the sorted, deduplicated sequence `p₁ … pₙ`:

```text
C = U32BE(n) || P(p₁) || ... || P(pₙ)
```

Here the ellipsis denotes precisely the intervening predicates in sequence, not extra octets. The count is mandatory and measures predicates, not bytes or pre-deduplication input occurrences. After exactly `n` complete predicates, the collection is finished. Because the collection is the final top-level component, that boundary must also be the message end.

For `predicates = []`, the **entire collection component** is exactly:

```text
00 00 00 00
```

There are no predicate bytes after that count. Omitting the count is truncated/malformed, not another empty representation. A predicate whose field/operator/operand is empty is invalid, not an alternative empty collection. Empty semantics remain “entire bound population.”

## 10. Exact SHA-256 preimage — all and only these bytes

Let the identifiers and population reference be exact admitted texts and let `p₁ … pₙ` be the canonical predicate sequence from §5. Then:

```text
preimageBytes =
    4e 50 31 32 44 45 46 00 01
 || U32BE(UTF-8 byte length of definitionId)
 || strict UTF-8 bytes of definitionId
 || U32BE(UTF-8 byte length of version)
 || strict UTF-8 bytes of version
 || 00 00 00 40
 || 64 exact ASCII/UTF-8 bytes of populationIdentity hexadecimal text
 || U32BE(n)
 || for each canonical predicate, in sequence:
        U32BE(UTF-8 byte length of its exact field token)
     || exact field token UTF-8 bytes
     || U32BE(UTF-8 byte length of its exact operator token)
     || exact operator token UTF-8 bytes
     || U32BE(ASCII byte length of its canonical decimal operand text)
     || canonical decimal operand ASCII/UTF-8 bytes
```

The “for each” line describes concatenation of the specified components, not a literal string or newly written serializer.

Equivalently, using only the already-defined byte functions:

```text
preimageBytes = H || T(definitionId) || T(version)
                 || T(populationIdentity) || C

Definition content digest = SHA-256(preimageBytes)
```

No hexadecimal rendering of the preimage is hashed. No JSON text, object keys, quotes, whitespace between components, separator, byte-order mark, automatic NUL terminator, padding, total-message-length prefix, or digest field is appended. The fixed NUL in the header is the **only** structural NUL constant; NULs arising from U32 prefixes or literal identifier data have the specified roles already described.

The final byte boundary is exactly the end of the last operand payload, or the end of the four-octet zero count when empty. No final newline or trailer exists. The total byte length is:

```text
89 + byteLength(definitionId) + byteLength(version)
   + sum over canonical predicates of
       (12 + byteLength(field) + byteLength(operator)
           + byteLength(canonical operand text))
```

Population's 64 text octets are included in the constant 89; every text prefix and the count is four octets; the header is nine. No overall-length field is stored.

Excluded unconditionally: `executionId`, `resultId`, `snapshotId`, `evidenceId`, timestamps, runtime/caller execution metadata, population membership or member values, result data, and the digest itself. Implementation must not walk arbitrary object properties to decide preimage membership.

SHA-256 yields 32 digest octets under the standard SHA-256 algorithm. When rendered as text in this record, the digest is 64 lowercase hexadecimal characters, two per digest octet in output order, with no prefix. Digest rendering is not part of the preimage. Encoding injectivity does not assert SHA-256 collision impossibility (§12).

## 11. Complete worked specification examples

These are specification calculations, **not tests**. No Definition serializer or decoder was written or invoked. The preimages below were specified as literal hexadecimal octet sequences; their SHA-256 values were calculated using `sha256sum` and independently the OpenSSL SHA-256 invocation on those same literal bytes. No repository tests were added or run.

Notation for the exact illustrative bound population texts:

```text
P0 = 0000000000000000000000000000000000000000000000000000000000000000
P1 = 0000000000000000000000000000000000000000000000000000000000000001
```

Each is **64 text characters**, not 32 raw zero-valued bytes. The examples assume those exact references have been independently bound; they do not claim population registration or recompute G1–G5. A Definition written with `P0` or `P1` below means precisely that entire stated text. Operand spellings in input descriptions denote already-admitted exact decimal values, not an API type decision.

Every hex block is the **complete** preimage with no omitted or repeated-by-notation segment. Concatenate its lines and read two hex digits as one octet. Lines and code fences are presentation only.

### E01 — empty predicate collection

Governed Definition: `definitionId = "d"`, `version = "1"`, `populationIdentity = P0`, `predicates = []`.

Canonical predicate order: `[]`. Collection bytes are exactly `00000000`. Total: **91 octets**.

```text
4e50313244454600010000000164000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000000
```

SHA-256: `48ee9df1ac3918785b5500528aab8433ff349ffa8576cdcb03d9593dffeb0f77`

For clarity, zero-based byte offsets are: header 0–8; ID length 9–12; ID payload 13; version length 14–17; version payload 18; population length 19–22; population text 23–86; zero count 87–90. There is no byte 91.

### E02 — one numeric predicate, integer 75

Governed Definition: `definitionId = "d"`, `version = "1"`, `populationIdentity = P0`, predicates containing `{ field: conviction, operator: gte, operand: 75 }`.

Canonical predicate order: `[(conviction, gte, 75)]`. Total: **118 octets**.

```text
4e50313244454600010000000164000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000001
0000000a636f6e76696374696f6e00000003677465000000023735
```

SHA-256: `fbad4144d5eddd15cc6e518f710d89d025076977536dd55ad0041af4cc055a20`

### E03 — fractional operand 0.5

Governed Definition: `definitionId = "d"`, `version = "1"`, `populationIdentity = P0`, predicates containing `{ field: growth, operator: gt, operand: 0.5 }`.

Canonical predicate order: `[(growth, gt, 0.5)]`. Total: **114 octets**.

```text
4e50313244454600010000000164000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000001
0000000667726f77746800000002677400000003302e35
```

SHA-256: `d2742f480b9b44b9f92b03fae82fd6571520c2eae563660f376b22c65588368a`

The admitted equivalent input `0.500000` produces these same bytes.

### E04 — six fractional digits, 75.123456

Governed Definition: `definitionId = "d"`, `version = "1"`, `populationIdentity = P0`, predicates containing `{ field: quality, operator: lte, operand: 75.123456 }`.

Canonical predicate order: `[(quality, lte, 75.123456)]`. Total: **122 octets**.

```text
4e50313244454600010000000164000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000001
000000077175616c697479000000036c74650000000937352e313233343536
```

SHA-256: `afcfba27d9adbfd3ef31e4c47480ae887eb1444d8fec15264fef2eca8c3869df`

### E05 — equivalent numeric spellings in separate inputs

Three input Definitions have identical `definitionId = "d"`, `version = "1"`, and `populationIdentity = P0`, each with exactly one `conviction/gte` predicate. Their operand spellings are respectively `75`, `75.0`, and `75.000000`.

All three governed canonical Definitions have operand value 75. All three canonical predicate orders are `[(conviction, gte, 75)]`. The following **complete** bytes and digest apply to each independently. Total: **118 octets**.

```text
4e50313244454600010000000164000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000001
0000000a636f6e76696374696f6e00000003677465000000023735
```

SHA-256 for each: `fbad4144d5eddd15cc6e518f710d89d025076977536dd55ad0041af4cc055a20`

### E06 — multiple predicates in different input orders

Both input Definitions have `definitionId = "d"`, `version = "1"`, and `populationIdentity = P0`.

Input A predicate sequence:

```text
(quality, lt, 75.123456)
(growth, gt, 0.5)
(conviction, gte, 75)
(growth, eq, 10)
(growth, eq, 2)
(growth, gt, 2)
```

Input B predicate sequence:

```text
(growth, gt, 2)
(growth, eq, 2)
(growth, eq, 10)
(conviction, gte, 75)
(growth, gt, 0.5)
(quality, lt, 75.123456)
```

Both govern the same predicate set. Canonical predicate order for both:

```text
(conviction, gte, 75)
(growth, eq, 2)
(growth, eq, 10)
(growth, gt, 0.5)
(growth, gt, 2)
(quality, lt, 75.123456)
```

The contradictory growth equalities and other logically redundant/conflicting predicates are deliberately retained; only exact duplicates could be removed. The `eq` operands demonstrate numeric `2 < 10`, not decimal-text lexical order. Total: **235 octets** for each input.

```text
4e50313244454600010000000164000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000006
0000000a636f6e76696374696f6e00000003677465000000023735
0000000667726f7774680000000265710000000132
0000000667726f777468000000026571000000023130
0000000667726f77746800000002677400000003302e35
0000000667726f7774680000000267740000000132
000000077175616c697479000000026c740000000937352e313233343536
```

SHA-256 for both: `5429e9c5c43a86267daad339782507af283d2ee2964d135289aa6a810679bc5d`

### E07 — exact canonical duplicate removal

Input Definition: `definitionId = "d"`, `version = "1"`, `populationIdentity = P0`; input predicates:

```text
(conviction, gte, 75)
(conviction, gte, 75)
(conviction, gte, 75.0)
(conviction, gte, 75.000000)
```

Governed canonical Definition has a single predicate; all four are exact canonical duplicates. Canonical predicate order: `[(conviction, gte, 75)]`. Encoded count is **1**, not 4. Total: **118 octets**.

```text
4e50313244454600010000000164000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000001
0000000a636f6e76696374696f6e00000003677465000000023735
```

SHA-256: `fbad4144d5eddd15cc6e518f710d89d025076977536dd55ad0041af4cc055a20`

### E08 — negative zero and zero

Inputs have `definitionId = "d"`, `version = "1"`, `populationIdentity = P0`, and one `growth/eq` predicate with operand spelling respectively `-0`, `-0.000000`, or `0`.

All govern the exact value zero. Canonical predicate order for each: `[(growth, eq, 0)]`. The operand payload is the single octet `30`. Total: **112 octets** for each.

```text
4e50313244454600010000000164000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000001
0000000667726f7774680000000265710000000130
```

SHA-256 for each: `4150290668fd82b4b220698ab396ca1afc6ea8d3d702febe303e08bd34464e8c`

### E09 — differing definitionId, including case significance

Governed Definition: `definitionId = "D"`, `version = "1"`, `populationIdentity = P0`, `predicates = []`.

Canonical predicate order: `[]`. Compared with E01, the ID payload changes from `64` to `44`; no case folding occurs. Total: **91 octets**.

```text
4e50313244454600010000000144000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000000
```

SHA-256: `9f175d838bda0b4d8000eb2a850369d7b8eaedd816b95eda09792d86b3f85adc`

### E10 — differing version, preserving "01"

Governed Definition: `definitionId = "d"`, `version = "01"`, `populationIdentity = P0`, `predicates = []`.

Canonical predicate order: `[]`. Compared with E01, version has length 2 and payload `30 31`; it is not numeric version 1. Total: **92 octets**.

```text
4e5031324445460001000000016400000002303100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000000
```

SHA-256: `b42a70659934fa88d76404eca9695703fd44fbcaf0bbf9c61c52bb33de02a485`

### E11 — differing populationIdentity

Governed Definition: `definitionId = "d"`, `version = "1"`, `populationIdentity = P1`, `predicates = []`.

Canonical predicate order: `[]`. Compared with E01, the final population **text** octet changes from `30` to `31`, not a raw digest octet from `00` to `01`. Total: **91 octets**.

```text
4e50313244454600010000000164000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303031
00000000
```

SHA-256: `d76606a436f01b640c0bfb12885ce26c2de48e0501ec865c282f32450a51f289`

### E12 — Unicode spelling, precomposed scalar

Governed Definition: `definitionId = "é"` (exactly U+00E9), `version = "1"`, `populationIdentity = P0`, `predicates = []`.

Canonical predicate order: `[]`. ID UTF-8 payload is `c3 a9`, length 2. Total: **92 octets**.

```text
4e503132444546000100000002c3a9000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000000
```

SHA-256: `11691bded231712ef571b53c6dd9bad445861450a1ee955f8f1bde3a7463a5ed`

### E13 — distinct decomposed Unicode spelling

Governed Definition: `definitionId = "é"` (exactly U+0065 followed by U+0301), `version = "1"`, `populationIdentity = P0`, `predicates = []`.

Canonical predicate order: `[]`. ID UTF-8 payload is `65 cc 81`, length 3. No normalization to E12 occurs. Total: **93 octets**.

```text
4e50313244454600010000000365cc81000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000000
```

SHA-256: `893a595e3dd5ceb697c75705f1359b45014286dffeb3c431bebf93e610de5550`

### E14 — meaningful leading and trailing whitespace

Governed Definition: `definitionId = " d "` (U+0020, U+0064, U+0020), `version = "1"`, `populationIdentity = P0`, `predicates = []`.

Canonical predicate order: `[]`. ID UTF-8 payload is `20 64 20`, length 3; the otherwise non-blank value is not trimmed to E01. Total: **93 octets**.

```text
4e503132444546000100000003206420000000013100000040
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
30303030303030303030303030303030
00000000
```

SHA-256: `a12b6c0090ab451e5315119a05e59b8659faa31b4050ede694309a0a31ebdfd4`

## 12. Determinism, injectivity, and independent implementation obligations

### 12.1 Determinism under permitted input variation

- **Reordering:** sorting the same finite set by the explicit total comparator yields the same sequence. No caller order participates. E06 supplies two complete input orders with one preimage.
- **Deduplication:** duplicates are identified by the exact triple `(field, operator, q)`. Multiplicity disappears before the count is written. E02 and E07 therefore have the same count, bytes, and digest.
- **Numeric equivalence:** `75`, `75.0`, and `75.000000` have the same exact `q = 75,000,000`, hence the same canonical text `75`, framed operand, deduplication key, and sort position. E05 gives the complete resulting preimage.
- **Negative zero:** every admitted negative-zero spelling has `q = 0`, whose only canonical text is `0`. E08 demonstrates one resulting preimage for negative zero and zero.
- **Runtime independence:** the grammar explicitly reads the four semantic components in fixed positions and explicitly writes the three predicate components. Object-property enumeration, JSON serialization, caller metadata, locale, and runtime floating-point display cannot influence bytes.

### 12.2 Unique parsing and boundary safety

The fixed header occupies exactly nine octets. Each U32 prefix has exactly four octets and one unsigned value. Each text payload has exactly the declared number of octets and a unique strict UTF-8 decoding. Three such frames delimit a predicate. The count determines exactly how many predicates are present. Message end is required at the resulting collection boundary.

Thus a valid encoding has one parse. Payload text cannot consume part of a following component by imitating a delimiter or header. For example, `(definitionId="a", version="bc")` and `(definitionId="ab", version="c")` have different first length prefixes and cannot share bytes even though naive text concatenation would be `abc` for both.

### 12.3 Injectivity and losslessness on governed canonical content

Assume two format-1 valid encodings have identical octets. Unique parsing implies equal identifier, version, population, count, and predicate frames at every corresponding position. Strict UTF-8's one-to-one scalar encoding implies equal exact texts, including case, whitespace, and non-normalized Unicode spelling. Each field/operator token uniquely identifies its governed value. Each canonical operand text uniquely recovers exact `q`, and hence the governed numeric value. Strictly ordered, duplicate-free predicate sequences therefore recover the same canonical set.

Consequently, decoding is a mathematical left inverse of encoding on governed canonical content; equal bytes imply equal governed canonical tuples. Contrapositively, different admitted `definitionId`, `version`, or `populationIdentity` text cannot collide **under the encoding**, regardless of other components. Distinct canonical numeric values or distinct canonical predicate sets also cannot collide. Input spellings/order/multiplicity that are deliberately non-semantic are not claimed to be preserved.

This is **not** a claim that two distinct populations cannot share a population SHA-256 hash, or that two distinct Definition preimages cannot share a SHA-256 digest. SHA-256 maps arbitrary-length inputs to 256 bits; mathematical digest injectivity is not asserted. Exact identity remains `(definitionId, version)`; digest equality is an aid, not an identity authority or a substitute for exact-content verification where required.

### 12.4 Empty collection and independent implementations

An empty canonical collection has the single count encoding `00000000` and no predicate bytes. Missing count is malformed; a zero-length token is invalid; trailing bytes are invalid. There is exactly one empty-collection representation per otherwise fixed Definition content.

An independent implementation has no remaining byte-choice: scalar-preserving strict UTF-8, explicit blank check, explicit comparators, exact decimal canonicalization, fixed header, U32BE lengths/count, exact textual population binding, fixed component order, and exact termination are all specified. The unique canonical set and the specified elementary encodings determine every octet by composition. Standard SHA-256 on those same octets then determines the same digest. This establishes independent implementability by specification and mathematical reasoning, not by running a second serializer or a test suite.

## 13. Encoder semantic validation versus canonical-byte decoding

No decoder is implemented by this record. The expectations below define acceptance of format-1 canonical bytes, not a public API error taxonomy.

### 13.1 Semantic input boundary before encoding

| Condition | Required treatment |
|---|---|
| Missing identifier/version/population/predicate collection | Reject; no default or inferred component. |
| Non-text, empty, whitespace-only, or malformed-Unicode identifier/version | Reject without coercion, trimming, or replacement. |
| Meaningful case/whitespace/Unicode spelling differences | Preserve exactly; do not normalize. |
| Population reference with wrong hex shape or no valid established binding | Reject at the appropriate mechanical/binding boundary; do not invent identity or embed members. |
| Unknown field/operator, aliases, case variants, nested/OR/NOT predicates | Reject under the frozen vocabulary and flat-AND contract. |
| Invalid numeric spelling/value, excess precision, out of range, exponent, NaN, infinity | Reject under the existing numeric admission rules; never round or infer a sentinel. |
| Admitted non-canonical spelling such as `75.0` or negative zero | Canonicalize to its governed numeric representation before ordering/deduplication/encoding. |
| Reordered predicates or exact canonical duplicates | Canonicalize to the same ordered set; count after deduplication. |
| Contradictory or logically redundant non-duplicate predicates | Retain; no detector or simplifier. |
| Explicit empty flat collection | Admit; write four zero count octets. |
| Length/count exceeds format capacity or arithmetic cannot be exact | Fail to encode; no alternate spelling, truncation, or wrapped prefix. |
| Runtime identifiers/timestamps/metadata supplied alongside content | Excluded from preimage, irrespective of object-property order. |

### 13.2 Canonical bytes boundary when decoding

A canonical decoder must consume the complete input; it must not repair and then call the repaired bytes canonical.

| Byte-level condition | Required treatment |
|---|---|
| Wrong/truncated magic; absent or unsupported format-version octet | Reject. No legacy fallback or version inference. |
| Malformed length/count representation | A U32 is exactly four octets. Fewer available octets is truncation. All four-octet patterns decode unsigned; no varint, signed, textual, or alternate-width interpretation is allowed. Reject resulting component/count constraints that are not met. |
| Length extends beyond remaining bytes; truncated payload | Reject before reading past the boundary. Never pad, replace, or shorten. |
| Invalid UTF-8 or a length ending inside a multibyte scalar | Reject strictly; no U+FFFD replacement and no normalization. |
| Zero/blank identifier or version | Reject using §6.4, even though zero can be represented by U32. |
| Population length not 64, non-hex payload, or prefixed/normalized alternative | Reject mechanically. Actual bound-population existence/content verification remains the separate established semantic boundary; lexical validity alone does not establish it. |
| Invalid field/operator tag | There are **no field/operator tags**. Only the exact framed texts in §8 are valid; an alleged numeric tag or unknown token is invalid. |
| Invalid operand text | Reject invalid characters, non-canonical shape, excessive fractional precision, range violations, and any non-canonical spelling, including leading zeroes, trailing fractional zeroes, exponent, plus/minus signs, and negative zero. No wire canonicalization/rounding is permitted. |
| Invalid predicate count | Reject a count above 1,500,000,015, a truncated prefix, or an input that does not contain exactly that many complete valid predicates. Exact remaining-byte bounds may be checked before allocation; every predicate requires at least 21 octets. A purported negative count has no signed meaning. |
| Duplicate canonical predicates | Reject the byte stream as non-canonical; decoder must not silently deduplicate it. Encoder input deduplication is a different boundary. |
| Out-of-order predicates | Reject unless the sequence is strictly increasing by §5.3. Numeric text order or framed-byte order is not an alternative. |
| Unexpected bytes between components, unknown tags, delimiters, or padding | Reject; this grammar provides no such positions. |
| Trailing bytes after the stated collection, including newline, NUL, or a second message | Reject. A concatenated stream needs separate external framing; it is not one canonical Definition. |
| Zero count followed by any predicate or other byte | Reject as trailing bytes, not a second empty representation. |

Reaching the exact end establishes byte-level framing/canonicality only, not authorization, registration, historical immutability, retention enforcement, population verification, or evaluator correctness. Those remain governed boundaries outside this mechanical specification.

## 14. Delegation boundary and implementation authority

After authoritative publication and **only after a separate explicit implementation-authority decision**, the following choices are mechanical implementation work:

- allocation/streaming strategy and safe buffer management;
- strict UTF-8 conversion of already-validated exact scalar text;
- writing the specified four-octet unsigned big-endian integers;
- writing the exact fixed header and framed token/decimal/population bytes;
- exact integer/string arithmetic realizing the specified decimal canonicalization and comparator;
- concatenating or streaming the specified octet sequence without inserting bytes;
- invoking a standard SHA-256 implementation on exactly that sequence;
- presenting the resulting digest in the specified lowercase hex form, when text is needed.

An implementation agent **MUST NOT decide or change** identifier/version semantics, blank/Unicode rules, normalization, numeric admission/equivalence, field order, operator order, operand comparator, deduplication or simplification, framing, integer width/signedness/byte order, header/version bytes, field/operator representation or tag values, population representation/binding, digest membership, or message termination. All are fixed by this design and prior authority. There are no field/operator tag values to invent.

API/runtime types, persistence technology/schema, resource-management engineering, evaluator reconciliation, and deployment are not created or authorized here. Retention is not reopened. Any genuine conflict with a frozen rule must return to Program Authority rather than be resolved by a serializer.

**IMPLEMENTATION AUTHORITY: NOT GRANTED.** Specification readiness is readiness for a separate implementation-authority gate only. No serializer code, TypeScript type, test, persistence implementation, or production modification is part of this record.

## 15. Publication, transfer package, and post-publication audit obligations

### 15.1 Conversational findings versus durable decisions

Search findings and operational observations can be reported conversationally, but every choice affecting bytes/digest is a durable governance decision in this dedicated additive record. No prior artifact is amended. Worked examples, proof obligations, validation expectations, and delegation limits are part of this record rather than Arena-only attachments.

The exact artifact path is:

```text
NP-12-N4-CANONICAL-BYTE-GRAMMAR-DECISION-RECORD.md
```

Publication must add **only this governance artifact** to the verified authoritative tree. No implementation file may change. No cleanup, reset, fetch, pull, merge, or rebase of the assigned checkout is needed for baseline investigation or publication preparation. Session work remains on the assigned Arena branch; any pull request must originate there. Publication to `main`, if possible, must use the authorized remote publication path, not a checkout switch or a direct push to another branch.

### 15.2 If authoritative publication is blocked

Preserve this complete document and its Git blob in a transfer package on the assigned session branch, with a pull request to `main` if permitted. Record the exact baseline commit/tree, session commit/tree, artifact path/blob, changed-path inventory, preserved prior blobs, and publication blocker. Do not describe the gate as completed or implementation-ready in authoritative durability terms until `main` publication is verified. An open PR is loss-safety/transfer evidence, not authority. If access fails with authentication errors, the GitHub connection needs reconnection; credentials must not be requested in chat.

### 15.3 Required audit after publication (or a blocked-publication audit)

Read authoritative remote `main` again and record its commit and tree. From that exact remote tree, verify the new artifact path/blob and all prior blobs listed in §1. Compare the baseline tree with the publication tree and establish that the only changed path is this new governance record, with no implementation changes. If publication remains blocked, explicitly record that the new artifact is absent from `main` and locate the transfer copy remotely instead; never substitute the Arena working tree as authoritative evidence.

The publication receipt/audit must identify the actual remote commit/tree/blob; self-referential hashes are not fabricated inside this artifact. All completed governance artifacts must exist on authoritative `main` before the durability gate is closed. No completed byte decision or example may exist only in Arena.

**End of mechanical-design governance decision record.**
