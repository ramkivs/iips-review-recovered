# Schema proposal — associates/JV carrying value (`IIPS_INVESTMENT_FUNDAMENTALS_V2`) — 2026-11-06

**Status: PROPOSAL. Not accepted, not implemented, not authorised.** It records what a schema change *would* be so the
decision in `DR-036-2` can be taken on its merits. No file under `iips-platform/src/` is changed by this document.

**Why it exists.** `L-036` is `PARTIALLY RESOLVED`: the payload now *states* that the enterprise-to-equity bridge
substitutes a policy zero for the associates/JV term, but the term itself cannot be populated. The gap is not an
ingestion defect and not a mapping gap that a better filing would close — it is representational:

```
iips-platform/src/investment/assessment/capitalStructure.ts:197
  components.associatesAndJV = notComputable('NOT_REPORTED');
```

with `contracts/lineItems.ts` closing the `LineItemId` union at **52** members, none of which is an associates/JV
investment. A dataset author cannot supply the value, `ingestion/builder.ts` would reject the column as
`UNKNOWN_LINE_ITEM`, and `XBRL_TAG_MAP` (20 tags) has no tag that maps to one. See
`IIPS_V3_IID_VIII_VALUATION_DECISIONS_2026-11-06.md` §2.

**What it costs to leave alone (measured, not asserted).** On the committed Infosys Work Item 3 inputs the substitution
understates per-share intrinsic mid by **₹1.6888 per ₹1,000 crore** of carrying value — 0.155 % of mid and
+0.1679 percentage points of margin of safety — and the published band would not change below ₹1,77,654 crore. The
number is small; the *statement* is not: the payload cannot say how much of its own equity value is missing, and R-4.1
requires the term at carrying value.

---

## 1. The line item

| Property | Proposed value | Rationale |
|---|---|---|
| **Identifier** | `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` | Names the caption, not the policy. Consistent with the table's existing style (`CURRENT_INVESTMENTS`, `PREFERENCE_CAPITAL`) — no abbreviations, no `ASSOC` |
| **Statement** | `BS` | Schedule III, Division II balance sheet: non-current investments |
| **Duration** | `INSTANT` | a carrying amount at a date, not a flow |
| **Unit** | `INR` | the table's scale is absolute INR; `source_scale` (`CRORE`/`LAKH`/…) converts at ingestion, exactly as for every other item |
| **Sign** | `POSITIVE_MAGNITUDE` | see §2 |
| **`reported`** | `true` | it is an as-filed caption and may carry a nil declaration; a derived-only item may not (D-2, `NIL_ON_DERIVED_ITEM`) |
| **Semantics (one sentence)** | The carrying amount of the group's investments in associates and joint ventures, accounted for under the equity method (Ind AS 28 / Ind AS 111), as presented in the consolidated balance sheet at the period end. | R-4.1's word is "Share of associates/JV … included at carrying value" — the *carrying amount*, not market value, not the share of net assets, not the historical cost |
| **Excludes** | subsidiaries (consolidated, not investments), joint operations (proportionate interests in assets/liabilities, not an investment), financial instruments at FVTPL/FVOCI held as investments, and current investments | each is a different bridge role; excluding them is what keeps the term from double counting (§4) |
| **Currency** | INR only, as filed. A foreign-currency presentation is out of scope for V1/V2 (every other item has the same limitation) | no silent conversion |

### Why `POSITIVE_MAGNITUDE` and not `SIGNED`

Ind AS 28 limits the equity-method carrying amount: once an investor's share of losses has reduced the investment to
nil, further losses are recognised only to the extent of legal or constructive obligations. A negative carrying amount
is therefore not a figure the framework expects in this caption, and a `SIGNED` item would invite one the engine cannot
interpret (R-4.1 *adds* `associatesAndJV`, so a negative value would silently become a deduction from equity value). If
an issuer presents an obligation separately, that is a liability caption and a different item — not this one.

---

## 2. Observation status and missing-value semantics

The item inherits D-2 exactly; no new presence value is introduced. The four states and what each means for the bridge:

| Cell / condition | Observation | Bridge behaviour | Payload |
|---|---|---|---|
| a number in the period row | `PRESENT`, with the row's provenance | `+ value` | `equityBridge.treatment: CARRYING_VALUE_REPORTED`, note quoting the value and the policy version |
| `NIL: <the filer's words>` | `NIL_BY_DISCLOSURE`, note = the quoted wording | `+ 0`, recorded as a declared nil | `substitutedInputs: []`; the nil is a claim the filer made, not a policy zero |
| blank cell with the column present | `MISSING: NOT_REPORTED` | `+ 0` under policy `associates-treatment/1.0.0` | `POLICY_ZERO_UNAVAILABLE` with `NOT_REPORTED` |
| column absent from the dataset (all V1 datasets) | `NOT_COMPUTABLE: NOT_REPORTED` | `+ 0` under the same policy | `POLICY_ZERO_UNAVAILABLE` — **today's state, unchanged** |
| bare `NIL` or `NIL:` with no wording | **refused** (`NIL_WITHOUT_QUOTED_WORDING`) | — | ingestion error, dataset not built |
| `NIL` without a `filing_ref`/`filed_at` on the row | **refused** (`NIL_WITHOUT_PROVENANCE`) | — | ingestion error |
| a value on a `STANDALONE` row and a different one on `CONSOLIDATED` | two observations, scoped | the consolidated one is used for a consolidated assessment | both recorded, scope published |

**The inviolable rule, restated because it is the one that would be violated first:** a blank cell, an absent column
and an unmapped XBRL tag all mean **absent**. None of them means zero, and none of them means nil. `POLICY_ZERO` is a
*valuation-policy substitution for an absent input*, never a statement about what the issuer disclosed. Nil is only
ever `NIL_BY_DISCLOSURE` with the filer's words attached.

---

## 3. Provenance and source reference

No new provenance mechanism. The period row already carries it, and the item inherits it:

- `filing_ref` — the filing identifier for the row (e.g. `INFY-INDAS-CONSOL-FY24`)
- `filed_at` — the filing date
- `taxonomy` (`INDAS`) and `basis` (`AS_FILED`) — already required columns
- for a nil, additionally the **quoted wording** in the cell, which becomes the observation's note (D‑2)
- for an XBRL-derived value, the tag local name and the instance document's digest (existing path)

**What the proposal deliberately does not add:** a free-text "statement note number" field on the line item. The note
locator belongs in the evidence bundle that accompanies a dataset (as the Work Item 1/3 bundles already do with
extracted note text), not in the numeric table, where it would be unvalidatable prose. If the operator wants the note
locator machine-checkable, that is a separate, larger proposal about evidence references — not this one.

---

## 4. What it must not become (double-counting guards)

| Tempting reuse | Why it is wrong |
|---|---|
| mapping it onto `CURRENT_INVESTMENTS` | current investments are inside `cashAndInvestments` (a *subtraction* in net debt); associates/JV are an *addition* after debt. Conflating them would both inflate cash and lose the addition |
| mapping `NoncurrentInvestments` (the whole caption) | too broad: it mixes associates/JV with FVTPL/FVOCI instruments already reflected in the EV or in cash equivalents, and with subsidiaries' investments in some presentations |
| mapping the P&L `ShareOfProfitLossOfAssociatesAndJointVentures…` | that is the flow feeding the carrying amount, not the carrying amount; using it as the bridge term would be a category error and would double count the earnings |
| deriving it as `TOTAL_ASSETS − (everything else)` | a residual is a fabricated value; the closed table's purpose is to prevent exactly this |
| adding it to `netDebt` | wrong side of the bridge and wrong sign |

---

## 5. Ingestion: CSV and XBRL

**CSV.** A new optional column named exactly `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` on `periods.csv`. Because
`builder.ts` validates columns against the closed table, the item must exist in `LINE_ITEMS` **before** any dataset may
carry it — which is why this is a schema decision and not an ingestion tweak. Existing columns, required columns and
metadata columns are unchanged.

**XBRL.** Two mappings added to `XBRL_TAG_MAP` (extend there, never at the call site):

| Taxonomy local name | Maps to | Note |
|---|---|---|
| `InvestmentsInAssociates` | `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` | if the filer presents a single combined caption, this is the only fact present |
| `InvestmentsInJointVentures` | `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES` | **added** to the associates fact when both are presented |

**The aggregation rule needs a decision and is stated here so it is not discovered later:** two facts mapping to one
closed item must either be summed with a recorded composition note, or the second must be rejected. The existing
ingestion path takes one fact per item and does not sum. This proposal therefore recommends: **sum only when both
facts share the same context (period + scope) and record the composition in the observation note**; otherwise treat the
item as `MISSING` with a named reason rather than silently choosing one fact. If the operator prefers the stricter
reading, the item accepts a single fact and a dataset carrying both is an ingestion error — also defensible, and
cheaper. **Either way it is decided explicitly, not inherited.**

Tags remain ≤ the map: an unmapped associates-related tag continues to land in `unknownTags` and produce no figure.

---

## 6. Validation rules

| Rule | Behaviour | Why |
|---|---|---|
| V1 — closed table | a column/cell for the item is rejected until the item exists in `LINE_ITEMS` | unchanged mechanism; this proposal is the change |
| V2 — non-negative | a negative value is an ingestion error (`INVALID_SIGN` family) | §1, `POSITIVE_MAGNITUDE` |
| V3 — nil grammar | `NIL` requires quoted wording, and the row requires provenance | D-2, unchanged |
| V4 — no nil on a derived item | N/A — the item is `reported: true` | D-2 |
| V5 — scope/period | the value used by the bridge must be the same `periodEnd` as the other bridge components; a mixed-period block must be refused exactly as it is for debt | R-4.1 consistency; `buildCapitalStructure` already records `componentPeriods` |
| V6 — scale | `source_scale` conversion applies unchanged (`CRORE` × 10⁷) | consistency with every other item |
| V7 — duplicate facts | per the decision in §5 | prevents silent composition |
| V8 — totals do not have to reconcile | no check that the item is consistent with `TOTAL_ASSETS` | the table does not reconcile other captions either; inventing a reconciliation would reject genuine filings |

---

## 7. Version compatibility and historical datasets

**Proposed identifier: `IIPS_INVESTMENT_FUNDAMENTALS_V2`** (bump from `V1`).

| Question | Answer |
|---|---|
| Is the change additive? | **Yes** — one optional item; no existing item's name, unit, sign or semantics changes; no required column is added |
| Are V1 datasets still valid? | **Yes, unchanged.** A V1 dataset remains a valid V2 dataset with the item absent, yielding `NOT_COMPUTABLE: NOT_REPORTED` — which is precisely the state that produces `POLICY_ZERO_UNAVAILABLE` today |
| Must historical datasets be rewritten? | **No.** No backfill, no re-ingestion, no re-derivation. Their committed payloads and digests stay byte-identical |
| Does the dataset digest move for existing datasets? | **No**, unless the dataset is rebuilt (the digest is content-derived; content is unchanged) |
| Does the payload grammar change? | **No new member.** `fundamentals.capitalStructure` is already an open subtree (§17.5 of the register); only the *content* of `associatesAndJV` and `equityBridge` changes when a value exists |
| Does a judgment/attribution change? | **Yes, conditionally**: for a dataset that carries the item, intrinsic and possibly `modelConfidence` move. That is a `MODEL`-visible change and must be attributed under R-13 in the change report |
| Minimum engine change | one line (`capitalStructure.ts:197`); `describeEquityBridge` and `equityValueFromEnterprise` already implement both branches |
| Rollback | remove the column from the dataset (or keep V1 datasets); the engine returns to `POLICY_ZERO_UNAVAILABLE` with no code change needed |

**Versioning rule proposed:** the schema version is claimed by the *dataset*, not by the engine. An engine that knows
V2 must still accept V1 (it does, by construction: absence is a supported state). An engine that knows only V1 must
**reject** a V2 dataset rather than silently dropping the column — otherwise a real carrying value would be discarded
and replaced by a policy zero, which is the exact failure mode `L-036` exists to expose.

---

## 8. What this proposal does not do

- It does **not** supply a carrying value for any issuer. `DR-036-3` records that no source has been located.
- It does **not** change `associates-treatment/1.0.0`, the bridge formula, the treatment enum, or the zero policy.
- It does **not** touch IPD, ingestion ownership, or any vendor integration — `D-2` places ingestion with IPD as the
  target owner; this work item is IRR-only and explicitly does not modify IPD.
- It does **not** close `L-036`. Accepting it would make the value *representable*; closing the entry still requires a
  value, and for this issuer that requires an extracted note.
- It does **not** propose a second item for "share of profit of associates" or for non-current investments generally.

---

## 9. Acceptance criteria for the proposal itself

| Criterion | Test |
|---|---|
| S-1 item exists and is closed | `LINE_ITEM_IDS` contains it exactly once; `LINE_ITEMS[id]` is `BS`/`INSTANT`/`INR`/`POSITIVE_MAGNITUDE`/`reported: true` |
| S-2 a dataset carrying it produces a real bridge number | payload shows `treatment: CARRYING_VALUE_REPORTED` and `associatesAndJV.presence === 'PRESENT'`; intrinsic moves by `weight × CV / shares` |
| S-3 a V1 dataset is unaffected | the committed Work Item 3 payload reproduces byte for byte |
| S-4 nil is nil, absent is absent | `NIL: <wording>` ⇒ `NIL_BY_DISCLOSURE`; blank ⇒ `MISSING: NOT_REPORTED`; absent column ⇒ `NOT_COMPUTABLE: NOT_REPORTED`; none yields `PRESENT 0` |
| S-5 provenance | an XBRL-derived value carries the tag name and instance digest; a CSV value carries the row's `filing_ref`/`filed_at` |
| S-6 negative values refused | a negative cell is an ingestion error with a named code |
| S-7 an old engine rejects a V2 dataset | the version guard refuses rather than dropping the column |
| S-8 no double count | total assets and net debt are unchanged by the item's presence; only equity value moves |
