# VII — Valuation integrity: the associates/JV bridge is disclosed and the policy-default cap is declared (2026-11-06)

**Issuer:** Infosys Limited · CIN `L85110KA1981PLC013115` · ISIN `INE009A01021` (the only real issuer in scope).
**Baseline:** `origin/main` at `accf9c1055d5aa301ecae93f075f8c4c9676ca7e`; the Work Item 3 payload `83644bc6…`.
**Limitations closed:** `L-036` (associates/JV policy zero never stated) and `L-034` (policy-default confidence cap required by
the design and never implemented).
**Question:** the published intrinsic value rests on two things a reader cannot see — a zero substituted for the
associates/JV term, and a confidence figure with no penalty for being a policy-default value. Can both be corrected
without moving a single number?

**Answer in one sentence:** yes — the payload now states the associates/JV treatment with its policy version
(`L-036`) and declares the policy-default caps it does **not** apply, with the reason and the triggering methods
(`L-034`); intrinsic ₹875.34 / ₹1,088.97 / ₹1,399.81, margin of safety −8.42 % vs mid, band `FAIR` and confidence
`0.6736` are **byte-identical** to Work Item 3, and six payload paths changed, every one of them disclosure.

| Question | Work Item 3 | Now |
|---|---|---|
| Associates/JV treatment stated in the payload? | **no** — `NOT_COMPUTABLE: NOT_REPORTED`, nothing said about the bridge | **yes** — `capitalStructure.equityBridge` + the sentence on every enterprise-derived per-share figure + a `limitations` line |
| Policy-default cap implemented? | **no** — six unrelated caps, no policy-default penalty | **declared, not applied** — `confidence.assumptionCaps` names both caps, the trigger and `CAP_FACTOR_NOT_SET_IN_POLICY` |
| Intrinsic / MoS / band / confidence | 875.3394 / 1088.9723 / 1399.8105 · −8.4187 % · `FAIR` · 0.6736 | **identical** |
| Payload digest | `83644bc6…` | `6a328ef0…` (moved by disclosure only; the WI-3 digest is preserved, not overwritten) |
| Verdict published? | no | **no — decision support only; no unconditional valuation or investment claim** |

---

## 1. Dependency assessment (deliverable 1)

The two defects are **independent**. Neither module calls the other, they share no object, and neither fix can move the
other's output:

| | `L-036` | `L-034` |
|---|---|---|
| Module | `assessment/capitalStructure.ts` (+ `types.ts`) | `assessment/confidence.ts` (+ `types.ts`) |
| Payload member | `fundamentals.capitalStructure.equityBridge` | `confidence.assumptionCaps` |
| Input to | enterprise→equity conversion, then `perShare()` | the confidence combination, after the weighted mix |
| Can it move `confidence.combined`? | no — capital structure is not a confidence input | no factor exists, so the declaration cannot move it |
| Can it move intrinsic? | no — arithmetic is unchanged (`POLICY_ZERO` as before) | no — confidence is downstream of valuation |
| Shared code | `policy.ts` (two new, unrelated blocks) and `types.ts` (two unrelated interfaces) | same two files, different members |

`policy.ts` and `types.ts` are touched by both, but additively and in separate declarations; the only ordering fact is
that `engine.ts` emits both limitations. No sequencing constraint exists, no partial order is needed, and no part of one
fix had to be deferred to make the other correct. The combined regression therefore tests each fix on its own and then
together (§4), rather than assuming the combination.

## 2. `L-036` — the associates/JV treatment reaches the payload (deliverable 2)

**The defect was a lifecycle bug, not a missing sentence.** `equityValueFromEnterprise` built the sentence
*"associates/JV carrying value is not recorded in dataset schema v1; treated as zero by policy R-4.1 and disclosed"* and
attached it to the **intermediate equity observation**; `perShare()` then constructed a fresh observation for the
per-share figure, so the sentence died one step before composition. A test that stopped at the engine would have
passed while the defect was live.

**What changed, in the order a reader meets it**

1. `VALUATION_POLICY.associatesTreatment` — `policyVersion: 'associates-treatment/1.0.0'`, `basis: 'CARRYING_VALUE'`,
   `whenUnavailable: 'POLICY_ZERO'`. R-4.1 requires the policy version to be *recorded*, so it is a constant, not a
   string literal in a function.
2. `describeEquityBridge()` — one function that produces the formula, the treatment
   (`CARRYING_VALUE_REPORTED` / `POLICY_ZERO_UNAVAILABLE`), the substituted inputs (with presence, reason and
   `treatment: 'POLICY_ZERO'`) and the sentence. It is built at capital-structure time, so the disclosure exists even if
   no enterprise-value method runs.
3. `capitalStructure.equityBridge` — the block composition transcribes verbatim, so it is in the persisted payload.
4. `equityValueFromEnterprise` now *reads* the sentence from that block instead of building its own: the arithmetic and
   the disclosure cannot drift apart.
5. `perShare()` copies `note` onto the derived observation. This is the specific line that fixes the defect.
6. `engine.ts` adds the sentence to `limitations[]`.

**What the payload says now** (quoted from `artifact/assessment-payload-vii.json`):

> Associates/JV carrying value is not recorded in dataset schema v1 (`NOT_COMPUTABLE: NOT_REPORTED`), so the
> enterprise-to-equity bridge substitutes zero for that term under policy `associates-treatment/1.0.0`. This is a policy
> substitution, not an issuer-reported nil: equity value is understated by any associates/JV carrying value the issuer
> reports.

with `substitutedInputs: [{ input: 'associatesAndJV', presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED',
treatment: 'POLICY_ZERO' }]`. Three prohibitions are respected: the zero is **not silent** (it is named, with its
policy version), it is **not described as an issuer nil** (the block says the opposite, in those words), and nothing is
**fabricated or estimated** — no carrying value was invented, and the size of the understatement remains unquantified
because dataset schema v1 has no field for it.

**What did not change:** the arithmetic (`+ associatesAndJV`, zero when unavailable), the blocking reason for a
`MISSING`/`NOT_COMPUTABLE` *component* elsewhere in the bridge, the D-2 nil-by-disclosure semantics, and every
valuation figure. The register's own two options were "keep the note on the published per-share observation, or add an
explicit list to the method assumptions"; this takes the first and adds the structured block so the treatment is
nameable without parsing prose.

## 3. `L-034` — the policy-default cap is declared, and no factor is invented (deliverable 3)

**The authoritative requirement.** §R-4.3 says a `POLICY_DEFAULT` discount rate "caps confidence" (design line 1631) and
a `POLICY_DEFAULT` target multiple "caps confidence" (line 1634). It also names the caps
(`POLICY_DEFAULT_WACC`, `POLICY_DEFAULT_MULTIPLE`, lines 585/930) — and **states no magnitude anywhere**. The register
(§17.1) records the same reading and calls the factor "a policy decision, not an implementation detail".

**Therefore the minimum correct change is a declaration, not a penalty.** Inventing 0.9 (from `STALE_DATA`) or 0.95
(from `DIVIDEND_SOURCE_CONFLICT`) would have been exactly the fabrication the design forbids, and it would have changed
the published confidence of every assessment in the repository on the strength of a guess.

| Requirement | How it is met |
|---|---|
| Exact requirement identified | R-4.3, lines 1631/1634; cap names from 585/930 |
| Minimum correct change | one policy block, one function, one payload member, one formula clause, one limitation line |
| No invented cap value | `factor: null` in policy; `applied: false` in the payload; the reason is `CAP_FACTOR_NOT_SET_IN_POLICY` |
| Non-triggering behaviour preserved | no trigger → `assumptionCaps: []`; an `OPERATOR_SET` rate turns the WACC trigger off (test) |
| Existing penalties not weakened | `caps` is untouched and still lists only applied penalties; the three existing caps are asserted identical with and without the declaration |
| Deterministic and testable | trigger detection is a pure function of the published method assumptions; the factor path is unit-tested with a synthetic factor |
| Triggering assumptions documented | `triggers: [{ methodId: 'DCF_FCFF', assumption: 'discountRate' }, { methodId: 'PE_RELATIVE' | 'EV_EBITDA', assumption: 'targetMultiple' }]` in the payload, and the same list in `limitations[]` |

On this dataset both caps trigger: the WACC is the policy rate (Rf 6.9 %, ERP 5.5 %, β 1.0, 70/30 →
10.677961 %) and both multiples are flagged `POLICY_DEFAULT`. They are declared and not applied, so `combined` stays
`0.6736` and `caps` stays `['STALE_DATA', 'DILUTION_PROXY']`.

**The single unresolved decision, stated exactly.** The *factor* (and whether an all-default assessment should be capped
once or once per cap) is not in the design of record. `VALUATION_POLICY.policyDefaultAssumptionCaps.factor` is the one
place it would be set; setting it is a **model change** (R-13) that moves every published confidence figure, so it is
not taken here. Until it is set, the payload says so in words a reader cannot mistake for a penalty.

## 4. Combined regression on the committed Work Item 3 inputs (deliverable 4)

Inputs are the committed WI-3 evidence, byte for byte (`digests.json` → `inputs[*].matchesWorkItem3`, all six `true`);
the dataset rebuilds to the same `datasetVersion` `21cf2522…`; the run clock is the WI-3 clock so that the diff cannot
report a clock change. `artifact/payload-diff-vs-wi3.json` walks the two payloads structurally and **aborts on an
unattributed path**. It found **six** changed paths, `unattributedPathCount: 0`:

| # | Path | Cause | Effect on output |
|---|---|---|---|
| 1 | `fundamentals.capitalStructure.equityBridge` | `L036_BRIDGE_DISCLOSURE` | none — disclosure only |
| 2 | `valuation.methods[0].output.perShareMid.note` (DCF_FCFF) | `L036_NOTE_PROPAGATION` | none — a `note` member on an existing value |
| 3 | `valuation.methods[2].output.perShareMid.note` (EV_EBITDA) | `L036_NOTE_PROPAGATION` | none |
| 4 | `confidence.assumptionCaps` | `L034_CAP_DECLARATION` | none — `factor: null`, `applied: false` |
| 5 | `confidence.formula` | `L034_FORMULA_CLAUSE` | none — prose names the caps as not applied |
| 6 | `limitations` (4 → 6 entries) | `DISCLOSURE_PROSE` | none — one sentence per defect |

Verified unchanged, byte for byte (recorded in `numbersUnchanged`):

| Output | Before | After |
|---|---|---|
| intrinsic per share low / mid / high | 875.3394 / 1088.9723 / 1399.8105 | **identical** |
| margin of safety vs mid / band / refusal | −8.4187 % / `FAIR` / `null` | **identical** |
| confidence `combined` / `caps` | 0.6736 / `[STALE_DATA, DILUTION_PROXY]` | **identical** |
| net debt | −193,420,000,000 | **identical** |
| completeness / quality verdict | `SUFFICIENT` / `MATERIAL_CONCERNS` | **identical** |
| EV→equity bridge arithmetic | equity = EV − netDebt − NCI − pref + 0 | **identical** |

Each fix was also verified **on its own** before the combination: the L-036 unit tests assert the block, the note
propagation and the payload sentence without touching confidence; the L-034 unit tests assert declaration, trigger,
non-trigger, operator-set rate and the `factor ≠ null` activation path without touching capital structure. The combined
run then shows both in one payload with no interaction.

No verdict was manufactured. The payload publishes no recommendation; the disposition section remains absent for a
context-free company page; and the tests assert that the stored text contains no `BUY`/`SELL`/`HOLD`/`TARGET_PRICE`/
`RECOMMENDATION` token.

## 5. Preservation (deliverable 5)

| Item | State |
|---|---|
| `IID-0` … `IID-6` evidence | untouched; the two `IID-AC-X2-ZERO-SOCKET` files that the frontend suite rewrites are restored with `git checkout` and re-verified clean |
| `D-2` nil-by-disclosure, `D-3` reason codes | untouched; no nil semantics changed and no reason code added (`POLICY_ZERO` is a treatment label in the new block, not a `presence`) |
| Infosys Work Items 1, 2, 3 evidence | untouched; inputs re-used byte for byte, `83644bc6…` preserved in `preservedHistorical` |
| `L-001` … `L-035` | untouched; only `L-034` and `L-036` change status (§6 of the register update) |
| Historical payloads and digests | the WI-3 payload and digest are recorded unchanged; nothing was rewritten |

**One preservation item needs naming rather than hiding.** The assessment payload is a **closed grammar**: IID-5's O-9
inventory fails a member the grammar does not declare, and its O-1 reference digests are constants. Two new members
therefore required (a) the grammar decision O-9 asks for — `confidence.assumptionCaps` is now enumerated in
`ASSESSMENT_MEMBER_INVENTORY`, and `equityBridge` sits inside the already-open `capitalStructure` subtree — and (b) new
digest constants. Following the precedent D-3 set for exactly this situation, **both earlier layers are still
reproduced byte for byte** in `substantive-identity.test.ts`: the decision's published values
(`08ea8d4a…`, `fd9589e4…`, `34240407…`) through `preD3(undoDisclosure(…))`, and the post-D-3 values
(`6d295010…`, `19a08af3…`, `0032be68…`) through `undoDisclosure(…)`. A reconstruction test proves that undoing the
disclosure reproduces the pre-change payload exactly and that the six changed paths are the only difference. The new
post-disclosure values are `33c02caa…` (C1), `df2cacd8…` (C4), `7e4251bc…` (C5); the two **input** digests and the
disposition digest do **not** move, because the engine takes no new input. No stored artifact was rewritten: the
grammar's promise is that a later payload digests differently *because it says something new*, and that is what
happened.

## 6. Scope (deliverable 6)

| Boundary | Status |
|---|---|
| IRR repository only; no IPD | respected — changes are in `iips-platform/src/investment/assessment/`, the IRR mirrors and tests |
| No new persistence mechanism | respected — the existing governed NP-04 store is used unchanged |
| No new issuer, sector or price observation | respected — one issuer, the same BSE price record, the same dataset |
| No D-2/D-3 semantic change | respected |
| No unrelated refactoring | respected — the diff is bounded to the two defects, their mirrors and their tests |
| No trade execution | respected — `disclosure.noTradeExecution` unchanged |
| No unconditional verdict | respected |
| No formula, weight, threshold or policy change | respected — no factor, weight or threshold moved; the two new policy blocks are declarations |

## 7. Acceptance criteria (deliverable 7)

| Criterion | Evidence |
|---|---|
| **AC-036.1** no silent zero | `tests/investment/assessment-valuation-integrity.test.ts` → *an unreported carrying value is a named policy zero, not a silent one* |
| **AC-036.2** not described as an issuer nil; nothing fabricated | same file → *the sentence says three things…* and *the substitution is recorded as a policy zero, never re-spelled as an issuer nil*; the payload contains no `NIL_BY_DISCLOSURE` in the block |
| **AC-036.3** disclosure is not confined to a discarded intermediate | `frontend/server/investment/cli/valuationIntegrity.test.ts` → *carries the same sentence on every enterprise-value per-share figure* (asserted on the **stored** payload) |
| **AC-036.4** final persisted payload exposes treatment and provenance | same file, first two tests: the payload read back through `readVersionWithPayload`, digest equal to the stored bytes |
| **AC-036.5** blocking reason preserved, methodology untouched, regression on the final payload | same file → *repeats the disclosure in the payload limitations*, *leaves the valuation and the margin of safety exactly where Work Item 3 left them*; `artifact/payload-diff-vs-wi3.json` |
| **AC-034.1** exact requirement identified | §3 table; design lines 1631/1634, 585/930 |
| **AC-034.2** no invented cap value | `policyDefaultAssumptionCaps.factor === null` asserted; `applied: false` and `CAP_FACTOR_NOT_SET_IN_POLICY` asserted |
| **AC-034.3** non-triggering behaviour preserved; existing penalties not weakened | `assessment-valuation-integrity.test.ts` → *policy carries no factor…*, *existing penalties are untouched…*, *an operator-supplied discount rate keeps the WACC trigger off* |
| **AC-034.4** deterministic and testable; triggering assumptions documented | *when policy does set a factor the same path applies it* (0.9 × 0.9, exact) and *the engine detects the trigger from the assumptions the methods publish* |
| **AC-034.5** the Infosys default configuration | `valuationIntegrity.test.ts` → the stored payload declares both caps for `DCF_FCFF/discountRate`, `PE_RELATIVE/targetMultiple`, `EV_EBITDA/targetMultiple` and applies none |
| **AC-C.1** every changed path attributed | `payload-diff-vs-wi3.json`: six paths, five causes, `unattributedPathCount: 0` |
| **AC-C.2** no intrinsic output moved | `numbersUnchanged` — intrinsic, MoS, band, confidence, net debt, completeness |
| **AC-C.3** each fix verified separately, then together | §4; separate unit suites, then the combined run |
| **AC-C.4** historical artifacts preserved | §5: WI-3 digest, IID evidence, D-2/D-3, `L-001`…`L-035`; `undoDisclosure` reproduces the earlier payloads byte for byte |
| **AC-C.5** no verdict manufactured | §4; token assertion on the stored payload |

## 8. The one decision this work item cannot take (deliverable 8)

**Unresolved:** the magnitude of the R-4.3 policy-default cap — and whether an assessment whose rate *and* multiples are
policy defaults is capped once or once per cap. The design of record names the caps and specifies no factor. It is
recorded in `VALUATION_POLICY.policyDefaultAssumptionCaps.factor` (`null` today), and setting it is a model change that
moves the published confidence of every assessment. Everything supportable without that decision is done and tested.

## 9. Files in this bundle

| Path | What it is |
|---|---|
| `artifact/assessment-payload-vii.json` | the payload **as the store returned it**, 54,481 bytes, digest `6a328ef0…` |
| `artifact/payload-diff-vs-wi3.json` | the attributed structural diff, the six paths, the eight unchanged headline outputs |
| `runs/01-ingest.txt` | dataset rebuild from the committed inputs |
| `runs/02-generate.txt` | the governed CLI run: assess → compose → validate → persist → verify |
| `runs/03-payload-readback.txt` | the read-back through `readVersionWithPayload` (digest = stored bytes) |
| `runs/04-replay.txt` | a second run into an empty store: same digest and report key |
| `runs/05-verification.txt` | every test and typecheck run, with exit codes, and the one suite that cannot run here |
| `runs/cli-vii-created.json`, `runs/cli-vii-replay.json` | the CLI summaries |
| `runs/commands.txt` | the commands, verbatim |
| `digests.json` | bundle manifest, input digests (all matching WI-3), the preserved WI-3 digest |
