# WI-10 / `L-035` — a nil declaration now names the statement section and line-item class it evidences

**Date:** 2026-11-07 · **Baseline:** `origin/main` `c95c048`, branch head at start `0ddf5c7` · **Scope:** IRR only,
local/single-user, non-production · **Outcome:** `L-035` **`RESOLVED`**.

## The requirement, in the register's words

> `NIL_BY_DISCLOSURE` guarantees three things mechanically — that wording was supplied, that a `filing_ref` and a
> period exist, and that the item is not a derived one. It does **not** check that the wording is *about* that
> component. … a later operator could declare, say, a nil long-term borrowing from a sentence about trade payables,
> and the ingester would accept it.
>
> **Required resolution / evidence:** a declaration grammar that binds a nil to a statement section and a line-item
> class (or a review step that records who accepted the mapping), plus acceptance tests for a mismatched
> section/component pair.

Both branches of that criterion are delivered: the grammar (with schema V3 requiring it) **and** a review record for
the four declarations Work Item 3 made before it existed.

## 1. Reproduced before it was fixed

At `0ddf5c7`, the Work Item 3 input with **one** cell changed — `LONG_TERM_BORROWINGS` quoting *"Trade payables are
settled within 45 days of the invoice date."* — ingested with **exit 0, zero errors**, and produced:

```
NIL_BY_DISCLOSURE / DECLARED_NIL_IN_SOURCE    note: "Trade payables are settled within 45 days of the invoice date."
```

Because a `NIL_BY_DISCLOSURE` component is counted as zero by the capital-structure aggregation contract, that cell
became **zero debt** — and therefore a higher equity value per share — on the strength of a sentence about payables.
The finding in register §17.2 is accurate, and it was reproducible. (`runs/01-reproduction-prefix.txt`)

## 2. The grammar

```
NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: The Group has no outstanding borrowings.
NIL[section=BS;class=PREFERENCE_SHARE_CAPITAL;scope=STANDALONE_COMPANY;acceptedBy=WI9-L035-review]: The Company has only one class of shares …
```

| member | vocabulary | checked against |
|---|---|---|
| `section` | `BS` \| `PNL` \| `CF` | the item's own statement |
| `class` | 15 closed classes, total over the line-item table | the item's own class |
| `scope` | `CONSOLIDATED_GROUP` \| `STANDALONE_COMPANY` | the row's statement scope — a different scope requires `acceptedBy` |
| `acceptedBy` | free token | stored on the observation when a cross-scope mapping is accepted |

Refusals: `NIL_BINDING_REQUIRED_IN_SCHEMA_V3`, `NIL_BINDING_MALFORMED`, `NIL_BINDING_INCOMPLETE`,
`NIL_BINDING_UNKNOWN_SECTION|CLASS|SCOPE`, **`NIL_BINDING_SECTION_MISMATCH`**, **`NIL_BINDING_CLASS_MISMATCH`**,
`NIL_SCOPE_NUANCE_UNACKNOWLEDGED`. On any of them the cell is **not a nil** — it becomes `MISSING: NOT_REPORTED`, the
ingest exits non-zero, and nothing is written. A valid binding is stored on the observation as `nilBinding` and is
therefore **published in the payload beside the quote**.

**Three schemas, three meanings.** `V1` and `V2` keep the legacy grammar exactly (nothing re-digested, nothing
backfilled); **`V3` is additive over V2 and requires the binding on every nil cell.** A build that does not know V3
refuses it rather than dropping the members, which is the rule already established for V2.

## 3. What that changes for the issuer, measured

| | dataset version | payload digest | `nilBinding` in payload |
|---|---|---|---|
| Work Item 3, V1 (**unchanged**) | `sha256:21cf2522…` | `9e7f621d…1cb518` | absent |
| same input, V2 | `sha256:21cf2522…` | — | absent |
| same four declarations, bound, V3 | `sha256:6afa2793…` | `f60fc5c8…` | present on all four |

The Work Item 3 dataset **re-ingests to ten byte-identical files**, manifest included, and its payload digest is
**exactly the one Work Item 3 published and Work Item 9 re-verified**. With bindings declared, `reportKey`
(`ed1e54b03e5e…`), `confidence` (0.4378), gross debt (83,590,000,000 = lease liabilities), net debt
(−193,420,000,000) and every other published figure are identical: the binding adds **evidence**, not arithmetic.

One measured side effect, stated so it is not mistaken for the binding's doing: adopting V2 *or* V3 changes the
adequacy denominator from 52 to 53 permitted items, so balance-sheet coverage reads 0.6818 instead of 0.7143. V2 —
untouched by this work item — already behaves that way.

## 4. The review branch: the four historical declarations

`source/review-record.json` applies the new grammar to the four declarations Work Item 3 made in prose, citing (never
altering) the WI-3 bundle and re-verifying each quoted wording's sha256:

| component | section | class | scope | verdict |
|---|---|---|---|---|
| `LONG_TERM_BORROWINGS` | BS | `BORROWINGS` | `CONSOLIDATED_GROUP` | accepted, no qualification |
| `SHORT_TERM_BORROWINGS` | BS | `BORROWINGS` | `CONSOLIDATED_GROUP` | accepted, no qualification |
| `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | BS | `BORROWINGS` | `CONSOLIDATED_GROUP` | accepted, no qualification |
| `PREFERENCE_CAPITAL` | BS | `PREFERENCE_SHARE_CAPITAL` | `STANDALONE_COMPANY` | accepted **with a recorded scope nuance** |

The preference-capital mapping is exactly the case the register called interpretive — a parent-company sentence
applied to the consolidated block. It was correct, and now it is *checkable*: under the new grammar it is legal only
with `acceptedBy=…`, and this record is that acceptance.

## 5. What this does not claim

The grammar does not read English. An operator who declares `class=BORROWINGS` over a sentence about payables has made
a **false** declaration rather than an undetected one: the claim is recorded next to the quote, `acceptedBy` records
who accepted a cross-scope mapping, and the per-issuer evidence bundle must show the sentence. What changed is that the
link from sentence to component is now **machine-checked for consistency and published**, instead of living in prose.
And because V1/V2 datasets are never re-digested, an unbound nil remains readable in historical data — V3 is the schema
that closes the hole for new data, exactly as V2 was the schema that made an associates/JV carrying value
representable.

## Files

| path | what it is |
|---|---|
| `determination-l035.json` | the determination: requirement, reproduction, finding kind, resolution, accepted/rejected mappings, identities, impact, completion standard, boundaries |
| `source/grammar.txt` | the grammar, its closed vocabularies, its checks in order, and what it does not do |
| `source/review-record.json` | the review branch: the four historical declarations, bound, with the acceptance of each |
| `runs/01-reproduction-prefix.txt` | the defect, reproduced at `0ddf5c7` |
| `runs/02-v3-unbound-refused.txt` | V3 refuses an unbound nil |
| `runs/03-mismatch-refused.txt` | section/class/scope mismatches refused; nothing written |
| `runs/04-bound-accepted.txt` | the bound declarations accepted and published |
| `runs/05-wi3-byte-identity.txt` | ten files byte-identical; the legacy path is untouched |
| `runs/06-generate-persist-readback.txt` | persist + separate-process readback; V1 digest unchanged, V3 evidence-only |
| `runs/07-tests.txt`, `runs/08-typecheck.txt`, `runs/09-post-manifest-verification.txt`, `runs/10-clean-clone.txt` | verification |
| `runs/commands.txt` | every command, in order |
| `artifact/assessment-payload-l035-v3.json` | the bound V3 payload (the unchanged V1 payload is already committed in the WI-9 bundle) |
| `digests.json` | this bundle's manifest |

Guard: `iips-platform/tests/investment/nil-binding.test.ts` — 22 tests. Full platform suite 721/721 in 168 suites;
frontend investment suite 247/247 in 20 files; `tsc --noEmit` exit 0.
