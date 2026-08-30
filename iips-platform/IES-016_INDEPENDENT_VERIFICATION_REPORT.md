# IES-016 — Independent Verification Report

**Standard:** IES-016 — Telecommunications Sector Engine
**Engine:** `sector.telecommunications`
**Executed:** 2026-08-30T18:02:53.309Z
**Executed against:** `phase13-next` @ `357b34dac1bd5cb555f38b2f9fa4cfa786fd65f9`
**Authority:** DEC-D28-FENCE-RELIEF-AUTHORIZATION (fence-4 relief) · DEC-D25-TIER3-EVIDENTIARY-STANDARD · DEC-D30-EXECUTION-LINEAGE-AND-ISSUANCE-AUTHORITY

---

## 1. Independence model — read this first

This verification is **role-separated, not organizationally independent**.

It was performed under the same engineering role that produced the implementation. No
external organization, certification body, third-party auditor, or independent reviewer
was engaged, and none is claimed. Per DEC-D25-TIER3-EVIDENTIARY-STANDARD and the
D7-TIER3-INDEPENDENCE determination, the independence available at Tier-3 is separation
of the verifying activity from the authoring activity within one role, supported by
mechanical re-execution against frozen reference assets.

Anything here that could read as third-party assurance should instead be read as:
*the frozen oracle was re-executed and the implementation agreed with it.*

## 2. What was verified, and how

Every command below was actually executed for this report. The numbers in section 3 are
the values those commands returned, not expectations.

| # | Check | Mechanism |
|---|---|---|
| 1 | Full platform typecheck | `npx tsc --noEmit` in `iips-platform/` |
| 2 | Framework integration (7 cases) | `tests/regression/telecommunications-framework-integration.test.ts` |
| 3 | Platform reuse verification (4 cases) | `tests/regression/telecommunications-reuse-verification.test.ts` |
| 4 | Pre-existing IES-016 regression evidence | `telecommunications-acceptance.test.ts`, `telecommunications-wp4-validation.test.ts` |
| 5 | Complete Tier-3 regression suite | all 12 Tier-3 regression files |
| 6 | Whole-platform regression suite | `npm test` |

Rows 2 and 3 are the regression kinds that were missing for IES-016 under the D5-S1
four-kind requirement. They were materialized under D28 fence-4 relief and were verified
by SHA-256 against the authoritative payload before this run; they were not rewritten.

## 3. Actual observed results

| Check | Result |
|---|---|
| `tsc --noEmit` | PASS (exit 0) |
| IES-016 new regression tests | 11 tests, 11 pass, 0 fail, 0 skipped |
| All six new Tier-3 regression tests | 33 tests, 33 pass, 0 fail |
| Complete Tier-3 regression suite (12 files) | 87 tests, 87 pass, 0 fail, 0 skipped |
| Full suite `npm test` | 606 tests, 606 pass, 0 fail, 0 skipped |

Golden-reference anchor reproduced by these tests: **TC-001 → composite 77.8, verdict "Buy"**,
taken from the frozen `telecommunications-expected-outputs-1.0.0.json` oracle rather than asserted
independently of it.

No test was marked PASS that did not run. No unavailable test was converted into a PASS.

## 4. Frozen-artifact provenance

`IES-016_FREEZE_MANIFEST.json` records SHA-256 digests computed from the artifacts as
they exist in this checkout at execution time. Re-verification returned
**10 verified / 0 bad**.

`releaseTag` is `null`. Per DEC-D31-MAINTAINER-ISSUANCE-AND-RELEASETAG-RESOLUTION a
releaseTag is not mandatory for Tier-3 A1 evidence; it is deferred, and **no Git tag was
created** by this work.

## 5. What was NOT verified — stated plainly

- **No organizational independence.** See section 1.
- **No architecture review.** No `IES-016_ARCHITECTURE_REVIEW.md` exists and none was
  created; architecture review is not a limb of the D27 relief scope and no such artifact
  is claimed in the freeze manifest.
- **No engineering-document set.** No `IES-016-D01..D19` set exists. The normative
  calculation contract is the discovery pack, not a D-numbered series.
- **Evidence maturity is unchanged.** This report does not promote IES-016 from A2 to
  A1. That promotion is a separate authority gate and was not exercised. The integration
  verification matrix was not modified.
- **Pre-existing certificate assertions were not corrected.** The readiness certificate
  carries a pre-existing `M1–M15 ACCEPTED` assertion that D28 did not authorize
  amending. It remains as found; this report neither endorses nor verifies it.
- **IES-020 aluminium placement** and other known open items were out of scope.

## 6. Conclusion

Under the role-separated independence model in section 1, the IES-016 engine
implementation on `phase13-next` reproduces its frozen expected outputs, integrates
through the shared framework services without platform change, coexists with the other
sector engines and CSIP, and is replay-deterministic. These results support the evidence
limbs of DEC-D25-TIER3-EVIDENTIARY-STANDARD. They do **not** establish organizational
independence and do **not** constitute an A2 → A1 promotion.
