# Broker Import R01/F2 — IPD #131 closure receipt/addendum

**Date:** 2026-11-06. **Current R01/F2 status: CLOSED / VERIFIED — bounded v2 engineering deviation only.** This additive IRR receipt supersedes the #129/#130-era R01/F2 blocked/incomplete status, not the historical evidence or other workstream statuses. It is not a new PA act, operational qualification or runtime/pin change.

## 1. Inspected IRR basis and precise superseded records

IRR main inspected at `accf9c1055d5aa301ecae93f075f8c4c9676ca7e`, including concurrent WI2/WI3 work (unchanged). PR [#491](https://github.com/ramkivs/iips-review-recovered/pull/491) merged `e482cda4ae7add8f94db041048a172f9941475c9`. Its [final publication receipt](https://github.com/ramkivs/iips-review-recovered/pull/491#issuecomment-6686597212) was independently read again: exact-head CI42228745880/main CI42228881542 SUCCESS, eight paths, 2932 protected prior blobs. That receipt correctly described its then-current #130 baseline; its recommendation to execute R01 is now discharged by #131. It is not edited.

The following are historical statements, **not current R01/F2 blockers after this addendum**:

| Record | Precise stale R01/F2 assertion / effect now superseded |
|---|---|
| `PRE-QE-PREREQUISITE-CLOSURE-REPORT-2026-11-06.md` | §2 C05 residual; §3 R01 heading/discussion and outstanding-action/completion request; §5 H06/H10's R01 implementation dependency; §6 common blocker/QE10 “Resolve R01”; §7 point2 and §8 next executable R01 work. Implementation blocker closed, not those qualification rows. |
| `D06-OPERATION-ADMISSION-READINESS-ASSESSMENT-2026-11-06.md` | §4 F2 and §5 H06/H10; §7 QE10; appended #130 currency overlay still calling R01 residual blocked. Only R01/F2 implementation dependency discharged. |
| `WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md` | §28 current pointer's “F2 residual exact-settlement/cross-evidence proof remains blocked.” |
| `WS-A-DURABLE-USER-HOLDINGS-MILESTONE-DEFINITION-2026-11-05.md` | §7 pointer's residual-IPD dependency, insofar as it refers to R01/F2. Milestone criteria unchanged. |
| Master tracker | §16.267 F2 finding; §16.268 residual R01 BLOCKED and next executable R01 correction. New §16.269 supplies the present disposition. |
| `evidence/integration/pre-qe-prerequisite-closure-2026-11-06/reconciliation-evidence.json` | `F2: PARTIAL_CORRECTION_RESIDUAL_BLOCKED` remains the frozen #130 snapshot. Its validator is historical, not a current-status authority. Current machine status is the new `r01-ipd131-closure-2026-11-06/evidence.json`. Older D06-baseline evidence remains frozen too. |

Paths in the first four rows are under `docs/integration/`. Each receives a short additive current pointer, not a rewritten table/history. The prior receipt, evidence JSON, validators, decision records and unrelated statuses remain byte-preserved.

## 2. Authoritative IPD publication and evidence verified read-only

- IPD [PR #131](https://github.com/ramkivs/iips-production-market-data/pull/131) is **MERGED**. Head **`9e348adbd894c56584ce944d5cfe0964bb1c894e`**; merge **`58fc8fb7f033650f40d61078d70e951f21dd033f`**; tree **`9dee4bfd1491fb51756b3d5ad3a512c1cb0e9636`**.
- Exact-head [CI42236349898](https://github.com/ramkivs/iips-production-market-data/actions/runs/42236349898) **SUCCESS**; exact merged-main [CI42236557560](https://github.com/ramkivs/iips-production-market-data/actions/runs/42236557560) **SUCCESS**. Both typecheck/build/test and executed-test-count check-runs succeeded. Their independently fetched summaries report **1068 executed / 1067 passed / 0 failed**.
- Pinned implementation evidence: [`evidence/cross-repository/IIPS_V3_R01_IPD_RECONCILIATION_IMPLEMENTATION_EVIDENCE_2026-11-06.md`](https://github.com/ramkivs/iips-production-market-data/blob/58fc8fb7f033650f40d61078d70e951f21dd033f/evidence/cross-repository/IIPS_V3_R01_IPD_RECONCILIATION_IMPLEMENTATION_EVIDENCE_2026-11-06.md). §§3–4 record **R01-T1 through R01-T12 all PASS**, recovery suite18/18, guarded suite **1068 executed / 1067 passed / 0 failed / 1 skipped**, `[test-guard] OK`, typecheck/build/package-consumer PASS. The skip is the pre-existing Windows pipe test on Linux, not a new failure.
- Read-only GitHub API readback verified all six #131 changed source/test/evidence paths against their Git blob identities and SHA256 values. All four authoring digests declared in the evidence document match the fetched merged source/test/correction-document bytes. Full pinned identities and CI summaries are registered in `evidence/integration/r01-ipd131-closure-2026-11-06/evidence.json`. No IPD checkout, implementation, test rerun or DB operation occurred in IRR.
- Evidence honesty: the user reports successful clean-clone reproduction in the completion report. That separate report was **not independently retrieved**: the pinned implementation evidence §7 deliberately defers post-merge facts to a completion receipt, no separate R01 completion document was found in the accessible main tree, and PR131 had zero comments when inspected. Actions log download was unavailable from this environment (redirected results host returned EOF). Therefore this receipt does **not** claim to have re-executed or independently verified that clean-clone reproduction. The guarded results are independently recorded in the pinned artifact and corroborated by green exact-head/main checks and executed-count summaries. This provenance limitation does not negate the independently verified merged implementation/test publication used for the bounded engineering closure.

## 3. R01/F2 closure mapping — do not repeat completed implementation

IPD's P1–P8 evidence and named negative/positive tests discharge the bounded v2 deviation under its recorded authorization/D05 envelope:

| Prior residual | Published corrective evidence / named coverage |
|---|---|
| Same verdict strings could hide changed evidence | Intended-evidence fingerprint/deep serialized comparison across both passes. **T1 PASS**: same COMMITTED-looking verdict/different records stays UNRESOLVED. |
| Missing successor or independently well-formed foreign lineage/digest could yield COMMITTED | Mandatory expected successor/contribution/revision/actual snapshot; derivation from commit validation/identity/lineage/provenance; recomputed stored content_digest and provenance cross-binding. **T2/T3/T5/T6/T7 PASS**: foreign lineage, foreign digest, missing successor, foreign owner and different-import evidence rejected. |
| Actual holdings not compared | Row-exact intended/stored holdings equality; canonical stored ordering. **T4 PASS**: changed row UNRESOLVED, untouched twin COMMITTED. |
| Weak/missing/NULL evidence | Fail-closed stored reads with NULL preserved. **T11/T12 PASS**, including missing stored snapshot digest. |
| Probe availability incorrectly treated as proof | Probe now documented as quiescence-only, necessary-never-sufficient; no lock-through-read or new settlement/lock guarantee claimed. Evidence gaps never become COMMITTED; **T8 PASS**: failed probe stays UNRESOLVED. Conservative absent-only NOT_COMMITTED floor retained. |
| Reconcile might write or prompt resend | Zero-write readback, no resend/resubmit/retry. **T9/T10 PASS**: counts unchanged, same import remains ALREADY_IMPORTED_NO_OP. |
| Prior #130 correction narrative overstated completion | Append-only P8/§7 correction annotation published, prior historical content preserved. |

**Disposition:** R01/F2 is **CLOSED / VERIFIED** for the named v2 IPD implementation deviation. It must no longer be listed as outstanding IPD engineering or recommended for reimplementation. This is not an expanded guarantee of terminal settlement, all-copy durability, lock/fsync behavior, v1 reconciliation correctness or qualification. IPD explicitly retains the separate v1 PA finding outside this correction; it is neither closed nor reopened here. No new decision is rendered by IRR and no redundant approval is requested.

## 4. Strict non-propagation and authority

Only R01/F2 bounded engineering status changes. H01–H12 remain NOT QUALIFIED; resolving their R01 implementation subdependency does not complete H06/H10. QE remains0/11; QE10 still needs actual prescribed paired-process qualification. DQ4 remains8/10; GateC/U4 result acceptance, Gate4 acceptance, Gate5/D06 admission and U6 authorization remain as recorded. W1 stays hard-false. No other blocker, PA decision, host/provisioning/PF15, H-12, genuine-data, F3/F4, paired-consumer, IID or milestone status is reconsidered or changed here.

The user authorized this in-scope IRR status correction/publication, using existing recorded scope; the IPD evidence records its own PA-authorized D05-only implementation. This receipt adds no scope/act and changes no contracts, schemas, migrations, pins, runtime files, workflow guards or policy. No IPD changes, operational access/writes, provisioning, QE execution, production activation or gate admission.

## 5. Validation and publication

Targeted local validation covers exact scope, old-file prefix preservation, frozen prior evidence/receipts, complete twelve-test registry, pinned merge/CI identities, current CLOSED status and invariant non-propagation. Applicable existing IRR static/routing/classification checks are run; results are in the adjacent `validation.txt`. The publishing PR's final receipt records actual head/merge/main CI and independent eight-or-more-path blob readback after success; no self-referential future merge hash is invented here.

**Final current status: R01/F2 CLOSED / VERIFIED (bounded v2 engineering only).** The stale recommendation to execute R01 is withdrawn as completed. No further engineering work or unrelated status reconciliation is initiated by this receipt.
