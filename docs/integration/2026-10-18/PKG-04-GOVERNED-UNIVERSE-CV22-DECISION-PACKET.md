# PKG-04 — CV-22 governed owner-universe decision packet

**Status:** decision input only; no universe change, implementation, or acceptance is made here.
**Date:** 2026-10-18.
**Owners:** IPD owns the D05 source; IRR owns the user-data product decision and consumer contract.

## Current evidence

- IRR user-owned watchlist boundary currently resolves only its 13-row governed reference set; out-of-universe requests are refused (`404 governed-row-not-found`).
- IPD `main` at packet preparation, `467eb529f52820032b17ea0212c92362a96dfe18`, contains the D05 broad-universe asset and manifest: 2,250 canonical entities, manifest checksum `7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5`, governed by `AUTH-D05-BROAD-UNIVERSE-MASTER-EXPANSION-ACT-2026-09-22-001`. Current IPD `main` is `9130c259ee753bad63611b256f67a470f715e37f`; the intervening PR #10/#11 changes are documentation-only, so the D05 source code/asset cited here is unchanged.
- IPD's current `BLOCK-3L-BROKER-CSV-FULL-RESOLUTION-AUDIT.md` identifies the composition as **52 real securities + 2,198 synthetic Tier-2 records**. D05 is an identity/security-master source, not live market coverage and not a promise of 2,250 real issuer records.
- The relevant existing CV-22 tracker record offers A: retain the 13-row governed universe; B: widen IRR to the existing D05 universe; C: commission real market coverage (provider entitlement/licensing). Current tracker recommendation is B, but the PA decision remains pending. No symbol fabrication or fuzzy identity matching is admissible.

## Decision materials to resolve

| Option | Scope | Consequence / dependency |
|---|---|---|
| A — retain 13 rows | Keep current honest boundary | Lowest change; real securities outside the 13 remain unavailable to owner surfaces. |
| B — widen to D05 | Consume already-governed D05 through an explicit IRR/IPD contract | Larger identity set, but only 52 real records and 2,198 synthetic; test and UI must distinguish them honestly. Requires a named cross-repository contract and acceptance. No new provider entitlement implied. |
| C — real-market coverage | Commission additional real coverage | Requires separate provider entitlement, licensing, identity-source authority, and scope; outside this non-production decision. |

## Acceptance proposal (not authorized by this packet)

If B is selected, name one real entity from D05 (for example `RELIANCE`) and define the exact mapping from that D05 canonical entity to the IRR user-surface identifier. Then test a watchlist add through the composed IRR route and verify the returned/persisted identity is exactly the governed D05 identity, with no fuzzy match or fabricated symbol. This is a proposal only: today’s IRR 13-row identifiers and D05 company identifiers are not assumed interchangeable. Keep the 13-row fallback until a separate decision and implementation/qualification are accepted.

No portfolio persistence or CV-20/CV-52 act is implied. Stage 7 is independent of portfolio Stages 4–6; this packet changes no code, data, tracker, or matrix.

## Additive PA disposition notice — 2026-10-19

The Program Authority has since selected the existing work item's disposition as **CV-22 — OPTION C — DEFER EXPANSION PENDING DEFINED PREREQUISITES**. The authoritative record is [`IIPS_v3.0_CV22_OPTION_C_PA_DECISION_2026-10-19.md`](../IIPS_v3.0_CV22_OPTION_C_PA_DECISION_2026-10-19.md). This notice is additive; the packet's 2026-10-18 alternatives and preparation-time statements remain preserved as history.

For clarity, this PA wording is not the earlier table's **Option C — commission real-market coverage**; that historical alternative is not selected. The current disposition preserves IRR's 13-row sector-reference behavior, does not reject D05 permanently, authorizes neither the full D05 universe nor a presumed real-only subset, and does not make `CV-22-D05-REAL-EQUITY-IDENTITY-PROBE` mandatory unless a later PA decision expressly does so. The separate identity/eligibility contract proposal is [`IIPS_v3.0_PLATFORM_IDENTITY_ELIGIBILITY_CONTRACT_PROPOSAL_2026-10-19.md`](../IIPS_v3.0_PLATFORM_IDENTITY_ELIGIBILITY_CONTRACT_PROPOSAL_2026-10-19.md) and is non-operative.

Per the latest instruction, the master tracker is not changed in this execution. Its CV-22 row/counts remain unreconciled; this notice and the separate PA decision record do not claim otherwise. No code, data, consumer integration, or acceptance is changed or implied.
