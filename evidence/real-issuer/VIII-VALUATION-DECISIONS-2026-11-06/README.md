# VIII — Valuation decisions: the `L-034` cap and the `L-036` carrying value (2026-11-06)

**Issuer:** Infosys Limited · CIN `L85110KA1981PLC013115` · ISIN `INE009A01021` — the only real issuer in scope.
**Baseline:** `origin/main` at `e31fbc59d8597af1b834a994d7adab47cf62678c` (PR #495). The commit named in the work request,
`cba812b0…`, is **not reachable in this clone** (`git rev-list --count --all` → `1`); everything here is stated against
`e31fbc5`.
**What this bundle is:** the reproducible arithmetic behind the decision package
`docs/integration/IIPS_V3_IID_VIII_VALUATION_DECISIONS_2026-11-06.md`. It is **evidence of arithmetic and of absence**,
not a new source of record.
**What it is not:** a policy decision, a schema change, a new issuer value, or a valuation.

**Statuses, unchanged by this bundle:** `L-034` **`OPEN`** (factor and granularity undecided; no penalty applied) ·
`L-036` **`PARTIALLY RESOLVED`** (disclosure corrected; carrying value unrepresentable in dataset schema v1, none
present in the committed evidence; understatement unquantified).

## The two answers this bundle carries

| Question | Answer |
|---|---|
| What would a `POLICY_DEFAULT` cap do to the published confidence? | `0.6736 = round4(0.67356576 × 0.9 × 0.98)`, so a factor `f` would land on `round4(0.67356576 × f^k)` where `k` is the granularity: `1` (once), `2` (per cap type — **what the committed code does** once `factor ≠ null`), `3` (per triggering assumption). All three columns are tabulated for `f ∈ {0.98, 0.95, 0.9, 0.85, 0.8}` and **none is a recommendation**. |
| What would a rupee of associates/JV carrying value do? | `Δmid = 0.7 × CV / 4,144,888,607.99` — **₹1.6888 per share per ₹1,000 crore**, i.e. 0.155 % of mid and +0.1679 pp of margin of safety. The published band leaves `FAIR` only at ₹1,77,654 crore. No value is asserted: `quantified: false`, reason `NO_AUTHORITATIVE_ASSOCIATES_JV_CARRYING_VALUE_IN_COMMITTED_SOURCE_EVIDENCE`. |

## Reproduced baseline (identical to the frozen VII payload, `6a328ef0…`)

| Output | Value |
|---|---|
| intrinsic per share low / mid / high | 875.3394 / 1088.9723 / 1399.8105 (spread 48.16 %) |
| margin of safety vs mid / vs low / band / refusal | −8.4187 % / −34.8791 % / `FAIR` / `null` |
| confidence data / model / **combined** | 0.85 / 0.6342 / **0.6736**; caps `STALE_DATA`, `DILUTION_PROXY` |
| policy-default caps | 2 declared, **0 applied**, `CAP_FACTOR_NOT_SET_IN_POLICY` |
| triggers | 3 across 2 cap types — `DCF_FCFF/discountRate`, `PE_RELATIVE/targetMultiple`, `EV_EBITDA/targetMultiple` |
| diluted shares / period | 4,144,888,607.99 / 2024-03-31 |
| net debt / NCI / preference | −₹19,342 crore / ₹345 crore / `NIL_BY_DISCLOSURE` |
| associates/JV | `NOT_COMPUTABLE: NOT_REPORTED`, treatment `POLICY_ZERO_UNAVAILABLE`, substituted value 0 |
| bridge offset (`−netDebt − NCI − pref + assoc`) | ₹18,997 crore |
| weights · per-share mid | DCF 0.6 / PE 0.3 / EV-EBITDA 0.1 · 990.749 / 1,270.427 / 1,133.948 |

`runs/02-baseline-crosscheck.txt` compares 21 fields against the VII payload: all match, and the VII payload's bytes
hash to its recorded digest.

## Files

| Path | What it is |
|---|---|
| `artifact/valuation-decision-scenarios.json` | the scenario package: reproduced baseline, `L-034` alternatives and illustrative arithmetic, `L-036` unit sensitivity and hypothetical scenarios |
| `runs/01-scenarios.txt` | the generator run and its exit code |
| `runs/02-baseline-crosscheck.txt` | field-by-field comparison against the frozen VII payload |
| `runs/03-tests.txt` | `npm run test:iid` (441 passed) and `npm run typecheck` (exit 0) |
| `runs/commands.txt` | every command, verbatim, including what was not run and why |
| `digests.json` | input digests, artifact digest, and the preserved VII payload digest |

## Reproduction

```bash
cd iips-platform
npm ci --strict-ssl=false
npx tsx scripts/viii-valuation-decisions.ts \
  ../evidence/real-issuer/VIII-VALUATION-DECISIONS-2026-11-06/artifact
npx tsx --test tests/investment/viiiValuationDecisions.test.ts
```

Deterministic: the assessment clock is the constant `2026-11-06T14:05:00.000Z`, so the artifact is byte-reproducible
from the committed inputs. The generator **throws instead of writing** if the policy factor is no longer `null`, if any
policy-default cap is applied, if associates/JV is no longer `NOT_COMPUTABLE`, or if the reproduced intrinsic mid or
combined confidence drifts from the VII record — a stale package cannot be published as a fresh one.

## Scope

No `iips-platform/src/` change, no policy constant, no formula, no weight, no threshold, no schema, no payload, no
stored artifact, no historical evidence rewritten. The only executable additions are the generator script (outside
`tsconfig.include`, therefore not typechecked — validated by running it) and one guard test. No verdict, no target
price, no trade instruction.
