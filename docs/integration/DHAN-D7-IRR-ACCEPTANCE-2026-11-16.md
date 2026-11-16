# D-7 — IRR Acceptance of the Provider State Model and Diagnostics Disclosure Policy

| Field | Value |
|---|---|
| Decision ID | `D-7` (IRR acceptance half) |
| Status | **ACCEPTED FOR IRR** by the Program Authority, 2026-11-16. Recorded on the PR branch; effectiveness on `main` follows the IRR governance convention below. This record changes no code and authorizes no implementation by itself. |
| Decision authority | Ramki (Ramakrishnan) — Program Authority / application owner, as identified by the authoritative H-18, G1 and NP-12 records on `origin/main` (`IIPS_v3.0_OWNER_CONTEXT_PROGRAM_AUTHORITY_DECISION.md`). |
| Acceptance event | Explicit Program Authority decision granted in the Arena task *"DHAN Live Integration — IRR D-7 Acceptance and W-07 Cross-Repository Coordination"* (2026-11-16), accepting D-7 for IRR exactly as adopted for IPD. The recording agent renders no decision on the Program Authority's behalf; this document records the decision the owner supplied. |
| Accepted specification | IPD decision record `docs/integration/DHAN-D7-PROVIDER-STATE-MODEL-AND-DIAGNOSTICS-POLICY-2026-11-12.md` (IPD candidate-line commit `bcfa6cbbcaff63a8c55f4d7395c4cbb5d0088d52`), adopted for IPD by the Program Authority on 2026-11-12, against roadmap v1.1 (`DHAN-LIVE-ROADMAP-2026-11-11`, IRR roadmap blob `4bea162db299cab844edf7d0d025dd5a56c81d0e`). |
| Controlling roadmap | `docs/integration/DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` v1.1, §5 D-7. Not modified by this record. |
| Effectiveness convention | Per IRR precedent (global no-auth decision: record published first, PA-authorized implementation merge following), this acceptance is recorded on PR #565's branch and becomes effective on `refs/heads/main` when the Program Authority merges that PR. Until then it is the authoritative decision-request-and-acceptance record for the IRR half of D-7. |
| Implementation | **NOT AUTHORIZED by this record.** W-07/W-08/W-09/W-10 each require their own bounded implementation task. |

## 1. What was investigated before acceptance

- On authoritative IRR `origin/main` (`08411bcd…`), the only DHAN D-7 material was the roadmap's
  own D-7 definition. No IRR acceptance record existed; definition, review or acknowledgement
  in planning documents is not acceptance under IRR governance.
- The IPD D-7 record (above) states **ADOPTED FOR IPD** (Program Authority, 2026-11-12) and
  explicitly leaves IRR acceptance outstanding (its §12, item U-1). Its content was verified
  in full: eight states with evidence rules and transitions, fail-closed derivation,
  V1/V2 verify semantics, exhaustive MAY/MUST NOT disclosure lists, named superseded
  behaviours, and the total IPD→IRR screen-state mapping (its §8).
- IPD publication note: the IPD record is published on IPD's diverged candidate line
  (`bcfa6cb…`, branch `arena/9015787b-iips-production-market-data`), **not** on IPD `main`
  (`901e479…`, where the path is absent). That is an IPD-side publication gap for IPD to close
  in its own repository; it does not alter the acceptance recorded here, and this record makes
  no IPD change.

## 2. The accepted model (identical for IRR)

**States (exactly these eight, no aliases):** `UNCONFIGURED`, `CONFIGURED`,
`CREDENTIALS_RESOLVED`, `AUTHENTICATED`, `OPERATIONAL`, plus off-ladder `EXPIRED`,
`DEGRADED`, `UNAVAILABLE`. `AUTHENTICATED` and `OPERATIONAL` require observed vendor
evidence (E4) in the current process lifetime; local readiness can never justify them;
`CREDENTIALS_RESOLVED` is the highest state reachable without a vendor call. Insufficient,
ambiguous or contradictory evidence reports the least capable applicable state.

**Verification semantics:** Status reads the last observed state and never calls the vendor
on screen open, poll or timer. A distinct operator-initiated "Verify connection" action is
V1 (local readiness; no network; highest justifiable state `CREDENTIALS_RESOLVED`) or V2
(exactly one authenticated vendor request; no retry, no loop, no credential re-read;
enumerated outcomes only, e.g. `VERIFIED_VENDOR_ACCEPTED`, `AUTH_REJECTED`,
`EXPIRED_LOCAL`, `FAILED_TRANSPORT`).

**Disclosure policy (normative; the MAY list is exhaustive):**
MAY expose — backend identifier; backend readiness; credential-resolution outcome as an
enumerated code; provider connectivity and qualification state (separately, never merged);
last successful interaction timestamp; last failure category; latency; request counters;
mapping count.
MUST NOT expose — secret values or tokens in any form or prefix; `vault://` references;
carrier-file paths or directories; secret-store metadata from which a sensitive local
location can be derived; raw child-process output that could contain credential material
(plus, per the IPD record §4.2: DPAPI ciphertext, environment dumps, unfiltered exception
text, and credential material in argv, temporary files or shell history).

**Superseded behaviours (accepted as superseded):** IPD `describeDhanConfig` rendering
`accessTokenKeyPath`/`clientIdKeyPath` (removal owned by IPD W-03) and IRR publishing
`secretRefPointers` via `secretRefPointersOf` in
`frontend/server/market-data/dhanHealthTransport.ts` (removal owned by IRR W-10). Until
those items land, no new surface may consume or republish those fields.

## 3. Effect of acceptance

The roadmap's D-7 exit criterion — *model and disclosure policy accepted by both repos* — is
now satisfied by IPD adoption (2026-11-12) plus this IRR acceptance, subject to the
effectiveness convention above. **W-07, W-08 and W-09 are therefore unblocked at the
governance level** and may begin as separately authorized, repository-owned tasks. This
record does not start them, does not change any D-7 semantics, and does not advance W-10
or any other work item.

## 4. W-07 cross-repository coordination arrangement (agreed coordination, not implementation)

W-07 widens IPD `ServiceHealth.liveProviderConnectivity`/`.providerQualification` to the
D-7 vocabulary (retaining `NOT_CHECKED_PRE_ACCESS` and
`SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`, adding `CONNECTED_LIVE` and `LIVE_QUALIFIED`), adds
a contract version marker, and must keep old payloads parseable while rejecting unexpected
values fail-closed. IPD implements and publishes exclusively in IPD; IRR mirror work
exclusively in IRR; the two are linked as one coordinated W-07 delivery.

**IRR-side surfaces that will require modification (IRR-owned, identified now, not yet changed):**

| File | Current state | Required W-07 change |
|---|---|---|
| `frontend/server/market-data/dhanHealthTransport.ts` (`DhanTransportProbe.serviceHealth`, ~lines 137–142) | Literal types `NOT_CHECKED_PRE_ACCESS` / `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED` only | Widen to the full D-7 value sets; carry the contract version through the probe |
| `frontend/server/market-data/dhanHealthState.ts` (`DhanHealthEvidence`, ~lines 118–122; constants `DHAN_LIVE_CONNECTIVITY`, `DHAN_LIVE_QUALIFIED`) | Fields already widened to `string`; classifier treats unrecognized values as unproven (fail-safe) | Constrain to the governed value sets at the boundary; unknown values must be rejected/never upgrade state (fail-closed), preserving the not-attempted-vs-disconnected distinction |
| `frontend/server/market-data/dhanMarketDataTransport.ts` (`createIpdMarketDataTransportClient`) | Wraps the client from the pinned IPD package (`iips-production-market-data#af4460ee…`), whose `health()` currently rejects live values as `MALFORMED_RESPONSE` | No local client logic change; consume the widened client only via a deliberate pin bump after IPD publication |
| `frontend/src/api/dhanHealth.ts` (browser DTO) | Validates the five IRR screen states | No vocabulary change expected; regression-cover only |
| Tests: `dhanHealthTransport.test.ts`, `dhanHealthState.test.ts`, `dhanMarketDataTransport.test.ts`, `dhanSyntheticFixtures.ts` | Synthetic payloads use the two pre-access literals | Add per-value round-trip fixtures (old + every new value), unknown-value fail-closed cases, and version-marker present/absent cases |

**Compatibility and sequencing rules:**

1. **IRR widens first.** IRR mirror widening is additive: old payloads remain parseable, so
   publishing it cannot break the currently pinned consumer.
2. **IPD widens second**, retaining both legacy values, adding the new values and an explicit
   contract version marker (field name and value owned by IPD's change set and recorded in
   its PR). Consumers accept a payload with the marker absent (legacy) or at the agreed
   version; an unknown version or unknown connectivity/qualification value is fail-closed.
3. **Pin bump last, as its own IRR change:** IRR updates the `iips-production-market-data`
   pin to the IPD commit containing the widened client, in the same IRR PR that carries the
   mirror widening, explicitly cross-linked to the IPD PR (each PR names the other, the
   contract version, and the expected value sets).
4. **Neither repository publishes an incompatible contract:** IPD does not emit new values
   from the daemon until W-08 records real state (W-07 alone changes types, not emitted
   values beyond today's), and IRR does not bump the pin to a client that rejects values the
   widened daemon may emit.
5. **Cross-repository verification (required evidence):** IRR's joined synthetic path
   (`dhanIdentityJoined.test.tsx` pattern) plus health round-trip tests run against the
   *installed pinned package*: for each governed connectivity/qualification value, the
   pinned `MarketDataTransportClient.health()` accepts and IRR classifies without state
   upgrade on unknown values; an unexpected value is rejected fail-closed; a legacy
   (pre-W-07) payload still parses. IPD's contract-drift suite
   (`dhan_d3d_contract_drift.test.ts`, extended per roadmap W-07) passes in IPD. Both PRs
   record these results and the exact counterpart commit SHAs before either is merged;
   merge order is IRR-mirror first, IPD second, pin-bump verification recorded on the IRR PR.

**Residual risks:** the IPD D-7 record's candidate-line-only publication (Section 1) should
be regularized by IPD when W-07 is executed there; IRR's string-widened evidence fields
must not be mistaken for fail-closed validation until the W-07 boundary change lands;
the separately operated Windows daemon is never proven by the npm pin (unchanged from the
W-11 record).

## 5. Sign-off

- **Decision:** ACCEPTED for IRR, exactly as specified in the IPD D-7 record.
- **Accepted by:** Ramki (Ramakrishnan), Program Authority — explicit decision, 2026-11-16.
- **Recorded by:** Arena Agent Mode (recording only; no decision rendered on the owner's behalf).
- **Next step:** W-07 may begin, as a separately authorized IPD-led coordinated delivery
  under Section 4. W-08 follows W-07; W-09 follows W-08; IRR W-10 follows W-07/W-08.
  Nothing in this record merges PR #565 or any other PR.
