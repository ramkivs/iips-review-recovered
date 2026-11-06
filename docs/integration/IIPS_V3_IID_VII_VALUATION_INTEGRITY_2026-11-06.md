# VII — Valuation integrity: `L-036` disclosed, `L-034` declared (2026-11-06)

**Scope:** IRR repository only. **Issuer:** Infosys Limited (`IN:CIN:L85110KA1981PLC013115`), the one real issuer in
scope. **Baseline:** `origin/main` @ `accf9c1055d5aa301ecae93f075f8c4c9676ca7e`; Work Item 3 payload `83644bc6…`.
**Evidence:** `evidence/real-issuer/VII-VALUATION-INTEGRITY-2026-11-06/` (payload read back from the store, attributed
diff, run transcripts, verification log).
**Register:** §17.1 and §17.3 change status; §17.5 records the payload-grammar cost.

## 1. Two defects, two shapes

`L-036` was a **lifecycle** defect — the associates/JV disclosure was built, attached to the intermediate equity
observation, and then discarded by `perShare()` before composition. `L-034` was a **missing policy value** — the design
requires a cap for `POLICY_DEFAULT` assumptions and states no magnitude. Neither module calls the other, they share no
object, and neither fix can move the other's output: the dependency assessment is *none*, documented rather than
inferred (§1 of the bundle README).

## 2. What was implemented

| | `L-036` | `L-034` |
|---|---|---|
| Policy statement | `VALUATION_POLICY.associatesTreatment` — `associates-treatment/1.0.0`, basis `CARRYING_VALUE`, `whenUnavailable: POLICY_ZERO` | `VALUATION_POLICY.policyDefaultAssumptionCaps` — `confidence-policy-defaults/1.0.0`, `POLICY_DEFAULT_WACC`, `POLICY_DEFAULT_MULTIPLE`, **`factor: null`** |
| Code | `describeEquityBridge()`; `capitalStructure.equityBridge`; `equityValueFromEnterprise` reads the sentence instead of composing it; `perShare()` propagates `note` | `assumptionCapsOf()`; `confidence.assumptionCaps`; cap application runs behind `factor !== null` |
| Payload | treatment, policy version, substituted inputs, sentence; repeated on every enterprise-derived per-share figure and in `limitations[]` | per triggered cap: basis, `applied: false`, triggers, reason `CAP_FACTOR_NOT_SET_IN_POLICY`; formula clause; `limitations[]` |
| Arithmetic | unchanged (still a policy zero when the dataset has no carrying value) | unchanged (`combined` 0.6736; `caps` unchanged) |

The exact sentence published for the zero is: *"…so the enterprise-to-equity bridge substitutes zero for that term under
policy `associates-treatment/1.0.0`. This is a policy substitution, not an issuer-reported nil: equity value is
understated by any associates/JV carrying value the issuer reports."*

## 3. Combined regression

Six payload paths changed; every one is disclosure (`L036_BRIDGE_DISCLOSURE`, `L036_NOTE_PROPAGATION` ×2,
`L034_CAP_DECLARATION`, `L034_FORMULA_CLAUSE`, `DISCLOSURE_PROSE`); zero paths were unattributed. Intrinsic
₹875.3394 / ₹1088.9723 / ₹1399.8105, margin of safety −8.4187 % vs mid, band `FAIR`, confidence 0.6736, net debt
−₹19,342 crore, `SUFFICIENT` / `MATERIAL_CONCERNS` — all byte-identical to Work Item 3. The payload digest moves
`83644bc6…` → `6a328ef0…`, and the Work Item 3 digest is preserved, not overwritten.

## 4. The payload grammar (the cost)

Adding semantic members is a grammar decision, not a refactor. `confidence.assumptionCaps` is now enumerated in
`ASSESSMENT_MEMBER_INVENTORY` (AC-L14.10); `capitalStructure.equityBridge` sits inside the open `capitalStructure`
subtree. Substantive digests move and are re-published as constants, while **both** earlier layers are still reproduced
byte for byte by reconstruction (`preD3(undoDisclosure(…))` → the L-014 published values;
`undoDisclosure(…)` → the post-D-3 values). Input and disposition digests do not move. Detail: register §17.5.

## 5. What remains open

- **The cap factor.** R-4.3 requires a cap and states no magnitude; the register already called it a policy decision.
  `VALUATION_POLICY.policyDefaultAssumptionCaps.factor` is the single place to set it. Setting it is a **model change**
  (R-13) that moves every published confidence figure, and it was not guessed here.
- **The size of the associates/JV understatement.** Unquantified, because dataset schema v1 has no field for a carrying
  value; the payload now says so instead of holding a silent zero.
- `L-035` and every other limitation are untouched.

No investment verdict, recommendation, target price or trade instruction is published anywhere in this work item.
