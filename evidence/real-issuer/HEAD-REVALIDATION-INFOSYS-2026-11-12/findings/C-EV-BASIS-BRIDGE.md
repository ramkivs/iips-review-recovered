# Defect C — the EV method basis label names only the dominant bridge term

**Status:** OPEN — recorded as **`L-042`**, deliberately **not** corrected inside this validation work item.
**Found by:** reading the published `basis` string of the enterprise-value methods as an equation and checking it
against the per-share figure the same payload publishes.

## The demonstration (Infosys, FY24, this bundle's head payload)

`EV_EBITDA` publishes:

    basis: "mid-cycle EBITDA 375843333333 × 12 − net debt"
    perShareMid: 1133.9484469942438

The arithmetic that actually produced `perShareMid` is `equityValueFromEnterprise`
(`iips-platform/src/investment/assessment/capitalStructure.ts`), which converts an enterprise value with the
**whole** bridge:

    equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV

For this issuer the omitted terms are not all zero:

| term | value (₹) | presence |
|---|---|---|
| netDebt | −193,420,000,000 | PRESENT (net cash) |
| minorityInterest | 3,450,000,000 | PRESENT |
| preferenceCapital | — | NIL_BY_DISCLOSURE (contributes 0) |
| associatesAndJV | — | NOT_COMPUTABLE → POLICY_ZERO (contributes 0) |
| dilutedShares | 4,144,888,607.99 | DERIVED (REPORTED_EPS proxy) |

So reading the label as the equation it appears to be:

    EV               = 375,843,333,333 × 12      = 4,510,119,999,996
    label says equity = EV − netDebt              → per share 1134.780797467872
    full bridge       = EV − netDebt − minorityInterest (+0 +0)
                                                  → per share 1133.9484469932788  == published 1133.9484469942438

The label, taken literally, misses the published per-share figure by exactly `minorityInterest / dilutedShares`
= **₹0.8323504745930698/share**. `EV_REVENUE` carries the same label shape (`revenue × multiple − net debt`) and
the same defect; it is withheld for this issuer (`MANDATORY_METRIC_MISSING`), so only `EV_EBITDA` manifests here,
but the defect is in the shared code path. `DCF_FCFF` is unaffected — its basis describes the cash-flow inputs
(`FCFF base …, WACC …, g …, horizon`), not the bridge.

## Why the payload as a whole is NOT misleading

The complete, authoritative bridge is published beside the label in `capitalStructure.equityBridge`, with the
exact formula string

    equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV

pinned by `iips-platform/tests/investment/assessment-valuation-integrity.test.ts`. A reader who consults the
bridge (which the payload also cross-references in the per-share `note`) has the full conversion. The defect is
that the *method-level label*, read on its own as an equation, is incomplete — not that the artifact hides the
bridge.

## Why it was NOT corrected here

Correcting the label is a one-line string change that was **demonstrated and then reverted**, because its blast
radius is the product's payload-identity contract, not a disclosure:

- The `basis` string is valuation-method output, which is inside the **substantive projection**. Changing it moves
  the substantive digest of *every* assessment that publishes `EV_EBITDA` or `EV_REVENUE`.
- That immediately broke **16 tests across two core contract suites** — `substantive-identity.test.ts` (12) and
  `ac-l14.test.ts` (4). `substantive-identity.test.ts` pins the L-014 decision's five reference digests (C1–C5) as
  constants and states why: *"a change to the projection is a change of the meaning stored in every historical
  artifact."* AC-L14 idempotency (a same-clock re-run mints no version) also depends on the substantive digest being
  stable.
- It also moved the two `structuralDigest` values in the committed **IX closure artifact**
  (`IX-AUTHORIZED-VALUATION-POLICY-2026-11-06`), the reproducible record for `L-034`. (The IX bundle is a *living*
  reproduction — its own test requires it to regenerate from the current engine — so it was regenerated and then
  restored when the change was reverted; the L-034 arithmetic was untouched either way, only the two digests moved.)

There is no way to correct the label without moving the substantive digest: it cannot be excluded from the
projection (it is valuation output, not a clock/identity member), and adding a *separate* faithful field trips the
O-9 member-inventory guard (`ASSESSMENT_MEMBER_INVENTORY`), which makes any new payload member a deliberate test
failure rather than a silent identity change.

So correcting defect C means **re-baselining the L-014 substantive-identity decision and the AC-L14 idempotency
contract** — a coordinated disclosure-contract change owned by the register owner and the identity-contract owner,
not a narrow IRR fix inside a validation work item. It is recorded as `L-042` and pinned, not narrowed.

## What WAS done instead

- `iips-platform/src/investment/assessment/methods.ts`: a comment at both `EV_EBITDA` and `EV_REVENUE` records the
  defect, the demonstration, and why it is not corrected here. **No behaviour changed** — the diff is comment-only
  (13 lines added, 0 removed); the basis strings are byte-identical to the pre-work-item head.
- `iips-platform/tests/investment/assessment-valuation.test.ts`: a characterization test pins that the
  **authoritative full bridge formula stays published** in `capitalStructure.equityBridge` while the short label
  still names net debt. This is the guard that keeps the payload honest despite the imprecise label, and it makes a
  future fix a deliberate act that must also re-baseline the substantive-identity decision.

## Relation to the register

Recorded as **`L-042`** in the append-only overlay (§17.x). No entry in `L-001`…`L-041` was modified, closed,
renumbered or reinterpreted.

## Reproduction

    # the demonstration, from this bundle's persisted head payload:
    python3 - <<'PY'
    import json
    p=json.load(open('artifact/assessment-payload-head.json'))
    cs=p['fundamentals']['capitalStructure']; ev=[m for m in p['valuation']['methods'] if m['methodId']=='EV_EBITDA'][0]
    EV=ev['assumptions']['midCycleEbitda']*ev['assumptions']['targetMultiple']; sh=cs['dilutedShares']['value']
    print('label-as-equation per share:', (EV-cs['netDebt']['value'])/sh)
    print('published per share        :', ev['output']['perShareMid']['value'])
    print('gap = minorityInterest/sh  :', cs['minorityInterest']['value']/sh)
    PY
    # the guard that the full bridge stays published:
    cd iips-platform && npx tsx --test tests/investment/assessment-valuation.test.ts   # "authoritative bridge formula is published in full"
    # the contract a fix would have to re-baseline:
    cd frontend && npx vitest run server/investment/substantive-identity.test.ts server/investment/ac-l14.test.ts
