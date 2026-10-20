# IIPS v3.0 — Program Authority Scope Disposition: IPD P11 / IRR Matrix Row 26

| Field | Value |
|---|---|
| Record type | Bounded product-scope disposition and Row 26 acceptance-boundary reconciliation |
| Decision date | 2026-10-20 (Asia/Calcutta) |
| Decision authority | Ramki — Program Authority, as identified in the canonical tracker header |
| Decision exercise / recorder | The current explicit PA instruction selects bounded in-process IPD P11 library acceptance. This record documents that disposition under the existing standing project authorization; no separate signature or independently spoken approval is asserted. |
| Scope | IRR E2E Master Tracker §18.1, Row 26; IPD WSD P11 library capability only |
| Status | **PA SCOPE DISPOSITION RECORDED — BOUNDED LIBRARY ACCEPTANCE** |
| Publication boundary | Published on the fixed IRR task branch for review. This record does not authorize direct `main` modification or merge; main admission remains subject to the repository’s separate PR-specific authorization convention. |

## 1. Decision and authority basis

**Selected scope: bounded, in-process IPD P11 library capability.** A specifically commissioned product-consumer integration is not part of this disposition.

The scope decision is exercised under the project-wide standing PA decision/execution authorization recorded in `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_IMPLEMENTATION_AND_QUALIFICATION_RECORD.md` §1.2 and cited in `docs/integration/NP-18-CURRENT-TARGET-MAIN-ADMISSION-DECISION-2026-10-16.md` §1. The canonical tracker identifies Ramki as Program Authority. Those records permit the necessary decisions and governance-record publication within the established scope; they do not grant unrelated authority or permit unverified claims.

This is a distinct, bounded scope disposition—not an inference from implementation ownership, repository access, tracker authorship, or the `EP` cell. The recording agent makes no independent PA decision. The repository’s `governance/REPOSITORY_INFRASTRUCTURE.md` and tracker §16.25 preserve the separate-PR / explicit-merge-authorization boundary. Accordingly, this branch publication is not represented as a change to authoritative `main`.

## 2. Accepted scope and explicit limits

For this disposition, the accepted claim is the existing **in-process IPD library capability**, limited to behavior supported by the implementation and its existing evidence: the P11 execution adapter, namespace and identity boundaries, governed defaults, frozen engine scoring, direct CSIP ranking, and recalculation-trigger recording.

The two published, bounded fixes in IPD commit `b6e622432cb0ca3e5452c4194bc683c496a688fc` address:

1. propagation of canonical `D01_QUOTES.pctChange` momentum into scoring, retaining the neutral-zero fallback when momentum is absent; and
2. binding the effective post-fallback scoring inputs, derived result, company/engine identity, version vector, and as-of context in the executor’s lineage hash.

The IPD reconciliation at `3eaec0edd4f89a806b301d647499ca860c2a1172` records the focused and full test results as historical evidence. They were not rerun for this IRR documentation task. The tests and implementation support these bounded library claims; this disposition does **not** claim that every P11 requirement, every P15 claim, or every possible use of P11 is satisfied.

The following are expressly **not** requirements of this bounded acceptance solely by virtue of Row 26:

- a named external/product consumer or a composed IPD-to-IRR call;
- an HTTP service, endpoint, or other cross-repository transport;
- a taxonomy bridge, mapping, or equivalence between IPD `FrozenEngines` and IRR canonical engines; or
- completed provider-to-UI/product E2E.

The historical phrase **“`CertifiedSectorEngineId` bridge”** in the tracker is not an accepted consumer contract and does not implicitly authorize or require one. “E2E `NA`” below means **not applicable to this bounded library acceptance boundary**. It is not a statement that broader IIPS product E2E is complete.

## 3. Row 26 reconciliation

For the bounded scope above, Row 26’s E2E dimension is **`NA`**. The row’s separate dimensions remain separate: no other status is upgraded because E2E is not applicable. The prior acceptance/qualification indicators are retained but explicitly bounded; they are not a blanket acceptance or qualification of all P11/P15 obligations.

The row’s library evidence is consistent with IPD inventory Row 13 in the IPD task-branch record at `3eaec0e`: Row 13 describes a library with no product route, marks its library E2E dimension `NA`, and limits its acceptance claim to library evidence. Its statement that a Row 26 authority decision was pending accurately described the state when that IPD record was published. This IRR disposition resolves that pending scope question **for IRR Row 26 only**; the dated IPD artifact is preserved unchanged and is not treated as the authority for IRR’s tracker.

The IPD remediation and inventory annotation remain on IPD task branch `arena/21bc6f5f-iips-production-market-data` (tip `3eaec0e`), not IPD `main` (`3d44e0a`). Their publication location is not misrepresented as main admission.

## 4. Obligations and limitations preserved

This bounded disposition does not waive or mark complete the following matters:

| Matter | Disposition under this record |
|---|---|
| **P11-02 recalculation** | Trigger recording and affected-engine identification have library evidence. Actual recalculation, deterministic replay, snapshot retention, and responsibility allocation are not established by that evidence. Preserve as partially evidenced / unresolved; this record does not accept those broader claims. |
| **`CSIP_COMPOSITE` dispatch** | Direct collection ranking is distinct from `DataBoundExecutor` dispatch. No new dispatch semantics are defined or accepted here. Preserve as unresolved pending an applicable authoritative criterion. |
| **`mode` and `governedIntelligenceInputs`** | Their behavioral significance is not defined by this scope disposition. Preserve the requirement/acceptance ambiguity; no fallback, rejection, or execution contract is invented. |
| **Potential UI05 factor compatibility** | Outside the bounded library acceptance; no UI05/product-consumer compatibility is claimed. Revisit only under a separately commissioned consumer contract. |
| **IPD/IRR taxonomy mapping and equivalence** | Not required by this disposition and remains unverified. No mapping or equivalence claim is made. |
| **Broader P15 lineage and golden-digest statements** | Separate from executor-level input binding. The offline harness and recorded certification are not promoted to a cross-repository or live provider-to-score chain; broader claims remain limited to their actual historical assertions. |

The original P11 planning requirements remain the governing source for any later P11 claim. This disposition accepts only the bounded library scope described above; it does not silently supersede P11-02/P11-03 obligations or waive unmet requirements.

## 5. Evidence references

- IRR canonical tracker, `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`, §18.1 Row 26 and §18 dimension-separation note.
- IPD requirements: `IIPS_Production_Market_Data_Intelligence_Program_v1.0_SPEC_INTEGRATION_ALIGNED.docx`, P11 and integration/reuse sections; `IIPS_Production_Market_Data_Intelligence_Program_v1.0_TRACKER_INTEGRATION_ALIGNED.xlsx`, `INT-002` and P11-01…03.
- IPD bounded-scope reconciliation: `evidence/cross-repository/IPD_P11_BOUNDED_LIBRARY_SCOPE_AND_ROW26_RECONCILIATION_2026-10-20.md` at `3eaec0e`.
- IPD inventory: `evidence/np04/IIPS_v3.0_IPD_IRR_CAPABILITY_INVENTORY_AND_TRACKER_RECONCILIATION_2026-10-17.md`, Row 13, at `3eaec0e`.
- IPD implementation/test evidence: `src/engine_adapters/databound_executor.ts`, `sector_defaults.ts`, and `tests/wsd_p11_engine_adapters.test.ts` at `b6e6224`; the test results remain historical as recorded in the IPD reconciliation.
- IRR’s independent engine path: `iips-platform/src/integration/EngineRegistry.ts`, `EngineApiAdapter.ts`, `frontend/server/executive-transport.ts`, and `frontend/server/live/engine-execution-live-certification.test.ts`. These establish IRR’s path only, not an IPD call.
- Existing authority and publication boundaries: `IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2; `NP-18-CURRENT-TARGET-MAIN-ADMISSION-DECISION-2026-10-16.md` §1; `IIPS_v3.0_GATE_C_P2_EXECUTION_HANDOFF_ARENA_TO_NON_PRODUCTION_HOST_2026-10-13.md` §2; `governance/REPOSITORY_INFRASTRUCTURE.md`; tracker §16.25.

## 6. Non-effects

No product consumer, API, HTTP service, adapter, taxonomy mapping, engine-equivalence test, or cross-repository execution path is created or commissioned. No P11/P15 certification is recreated or broadened. No IPD source, inventory, or acceptance record is changed. No unrelated tracker row, governance decision, qualification, admission, release, or production status is changed. Row 26 remains independent from broader product E2E.