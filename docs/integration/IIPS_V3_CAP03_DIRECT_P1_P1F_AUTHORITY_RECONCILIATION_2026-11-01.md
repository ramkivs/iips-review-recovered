# CAP-03 Direct P1 / P1-F authority reconciliation

- **Record ID:** `IIPS-V3-CAP03-DIRECT-P1-P1F-AUTHORITY-RECONCILIATION-2026-11-01-01`
- **Date:** 2026-11-01
- **Repository:** `ramkivs/iips-review-recovered`
- **Scope:** personal, local, single-user IIPS v3.0; reconciliation of the legacy P1-F records with the later Direct P1 provisioning path
- **Governing PA order:** `IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01`
- **Status:** Direct P1 provisioning is reported complete; P1-F history is preserved and explicitly separated; no P1-F execution is needed for Direct P1

## 1. Determination

The later **Direct P1** provisioning and the older **P1-F** operation are distinct execution paths governed within the same PA order, not one execution that can be counted for both:

1. The PA order's §2 records a fresh, one-attempt **P1-F Execute** authorization, with its own designated operation and historical consumption rules. The preceding P1-F attempt's consumption remains `NOT RECONCILED`; the order did not infer either consumed or unspent status for that earlier attempt.
2. The IPD PR #118 Direct P1 handoff names that same PA order as its governing authority, and expressly discontinues P1-F ceremony, P1-F claim/marker and retry-history controls, historical S2 pinning, standalone Preflight, and the old evidence-root workflow **as prerequisites for local P1 SQLite provisioning**. It also expressly preserves prior governance records unchanged.
3. The Direct P1 source at IPD commit `279d1eed184f5e23bbabe5c6411085e120ce9e41` is a separate provision/verify path (`src/persistence/directP1Provisioning.ts`, `scripts/Invoke-DirectP1Provisioning.ps1`), not the legacy P1-F Gate A′ Execute entrypoint pinned to IPD `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` / tree `76f083d7058e170d8212455c03bad1033136ee68`.
4. Accordingly, the user-reported Direct P1 run **does not consume, prove, or reconcile** a P1-F claim, marker, process-start, retry, or prior P1-F attempt. The old P1-F `UNSPENT` / `NOT RECONCILED` statements remain historical statements about that separate path. They are **not current prerequisites** for the Direct P1 database already reported provisioned.
5. No P1-F retry, fresh Execute, claim/marker handling, standalone Preflight, historical S2 pin checkout/build, or re-provisioning is required or to be initiated for Direct P1. This overlay does not revoke or retroactively rewrite the P1-F authority; it clarifies that P1-F work is not a prerequisite to Direct P1 local provisioning and makes no claim that the subsequent Windows IPC read has been observed.

There is **no unresolved authority question about using the Direct P1 path for the narrowly authorized local provisioning**: the PA order is identified by the IPD handoff, and the handoff expressly makes P1-F procedures non-prerequisites for that path. There **is** an unresolved historical evidence question about whether any separate prior P1-F attempt crossed its own marker/process-start commitment point; the designated Windows P1-F evidence root was not inspected here, and Direct P1 evidence cannot answer that question. There is also no Gate 4/G14 acceptance decision in this overlay: whether/how Direct P1 evidence is credited to broader qualification/admission remains outside this reconciliation and is not inferred.

## 2. P1-F and Direct P1 operation boundaries

| Attribute | Legacy P1-F | Direct P1 |
|---|---|---|
| Governing record | P1 authorization act `IIPS-V3-CAP03-P1-AUTHORIZATION-ACT-2026-10-29-01`, §6; subsequent PA order's §2 and later retry record | PA order `IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01`, as named by the merged IPD Direct P1 handoff |
| IPD implementation identity | Pinned Gate A′ operation at `a891802e…` / `76f083d7…`; `node dist/persistence/gateAPrimeProvisioning.js --mode execute` | Direct P1 implementation at merged IPD commit `279d1eed184f5e23bbabe5c6411085e120ce9e41` / tree `ee6a90a0c27c46c71e5b47df664e6c7d24ca5e20` |
| P1-F-only controls in historical records | Designated `H:\IIPS-P1-EVIDENCE`, per-attempt claim/marker, exact pinned checkout, retry-history checks, and related S2/Preflight handling | IPD handoff §1 expressly discontinues these as prerequisites to Direct P1 provisioning; they are not invoked by the Direct P1 provisioner |
| What the available Direct P1 report establishes | Nothing about P1-F marker/process-start or past P1-F consumption | User reports `SUCCESS / PROVISIONED` and independent DP-V1–DP-V9 verification for the Direct P1 operation |
| Current consequence | Preserve prior `NOT RECONCILED` / `RETRY_BLOCKED` P1-F evidence state. Do not attempt to resolve it by running P1-F. | Local database provisioning prerequisite is satisfied per user report; the P1-F state does not block Direct P1 provisioning. Actual Windows IPC runtime remains unverified |

Both paths use the same PA order identifier, but that does not make their entrypoints, pin identities, evidence or consumption rules interchangeable. The Direct P1 run is not a P1-F retry and must not be relabelled as one.

## 3. Evidence and provenance

### 3.1 Authority and source facts verified from repository/GitHub

- The operative PA record is `docs/integration/IIPS_v3.0_CAP03_PA_BLANKET_WAIVER_AND_ONE_PASS_AUTHORIZATION_2026-11-01.md`. Its §2 specifies the separate fresh P1-F attempt and preserves the prior P1-F consumption as `NOT RECONCILED`; §4 authorizes the bounded one-pass integration/publishing work.
- The IPD handoff at PR #118, `docs/integration/IIPS_V3_DIRECT_P1_PROVISIONING_AND_IRR_HANDOFF_2026-11-01.md`, §1 explicitly says the old P1-F procedures are discontinued as prerequisites for Direct P1 local provisioning while all old records remain intact. The handoff identifies IPD as owner of the database/provisioner/provider and IRR as IPC-only consumer.
- GitHub confirms IPD `main` at `279d1eed184f5e23bbabe5c6411085e120ce9e41`, tree `ee6a90a0c27c46c71e5b47df664e6c7d24ca5e20`. The Direct P1 provisioner source names the PA order and states that P1-F governance, claim/marker, retry, S2-pin, standalone-Preflight and external evidence-root workflows are not invoked or required.
- IRR PR #424 merged at `abb5bdaf9dcae7586b2a2ab1b66c81461eca1f97`; the current IRR `main` baseline before this overlay is `d451154994c6abf5682fa6b101438d255d79674d`, tree `f73fbd1f1cbfa96fc88349f33baa11ca9f9eef2a`. The merged IRR route is read-only same-host IPC; it does not open SQLite.

### 3.2 User-reported Windows execution evidence

The user reports a Direct P1 Windows run with status **`SUCCESS / PROVISIONED`**, and says **DP-V1 through DP-V9 were independently verified**. The prior Direct P1 consumption record identifies the reported target as `C:\iips-data\iips\user-portfolio.sqlite`, size 102,400 bytes, SHA-256 `e9b1d66c505eded34d1dd48ec86550026c930101709eb4901455ace6554b94f`, with integrity/migration/FK/write-guard/audit/binding checks and an initially empty portfolio state.

**Provenance limit:** this is operator/user-supplied evidence. Arena did not access the Windows host or database, obtain the DP-V1–DP-V9 raw outputs, inspect a Direct P1 diagnostic bundle, or observe the provider's IPC response. “Independently verified DP-V1–DP-V9” records the user's report of those checks; it is not an Arena verification claim. No Direct P1 evidence was rewritten as P1-F evidence.

## 4. Historical records inspected and preservation

The following records were reviewed for their P1-F status, dependencies and provenance. Their historical content is **not edited by this overlay**:

- `docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md` — P1-F entrypoint, designated `a891802e…` pin/tree, one-attempt semantics and original status.
- `docs/integration/IIPS_v3.0_CAP03_PA_BLANKET_WAIVER_AND_ONE_PASS_AUTHORIZATION_2026-11-01.md` — §2 fresh P1-F authorization and prior-consumption non-inference; §4 one-pass scope.
- `docs/integration/IIPS_v3.0_CAP03_PA_P1F_PRESTART_RETRY_AUTHORIZATION_2026-11-01.md` and the P1-F runner/retry modules — distinct P1-F retry policy and preserved technical stop conditions.
- `docs/integration/CAP03_P1_F_CONSOLIDATED_CORRECTION_2026-10-31.md`, `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-31.ps1`, `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_SOURCE_TO_SCRIPT_VERIFICATION_2026-10-29.md`, and `docs/integration/IIPS_v3.0_CAP03_P1_ONE_PASS_COMPLETION_2026-11-01.ps1` — candidate-specific procedure, pin and evidence boundaries.
- Master tracker §§16.206, 16.229, 16.235, 16.240–16.245 — original authorization, reported stops, retry authority, `RETRY_BLOCKED` finding and historical `UNSPENT` / `NOT RECONCILED` pointers.
- `docs/integration/IIPS_v3.0_CAP03_G14_DEPENDENCY_ASSESSMENT_2026-10-31.md`, `docs/integration/IIPS_v3.0_CONSOLIDATED_OUTSTANDING_ITEMS_RESOLUTION_2026-10-31.md`, and the 2026-10-31 pending-register CSV — dated G14/P-10/P-33/P-37 snapshots that predate this Direct P1 reconciliation.
- `docs/integration/IIPS_V3_DIRECT_P1_IRR_CONSUMPTION_RECORD_2026-11-01.md` — Direct P1 evidence provenance, IPD handoff/source discrepancy, IRR IPC boundary, and the separate pending Windows IPC smoke test.

The older `UNSPENT`, `NOT RECONCILED`, and `RETRY_BLOCKED` text remains findable as historical evidence. The current tracker pointer and this dated overlay clarify that it does not make P1-F a current prerequisite to the completed Direct P1 path. No S2 artifact, claim, marker, run record, or Windows evidence root was read, changed, moved, released, or deleted.

## 5. Current disposition and limits

- **Direct P1 local provisioning:** complete **as user-reported**. No reprovisioning is needed or requested.
- **P1-F legacy consumption:** **not reconciled** as a historical fact; do not infer consumed or unspent from Direct P1. Its authorization and evidence rules remain specific to the P1-F operation.
- **P1-F as a Direct P1 provisioning prerequisite:** **not applicable** under the IPD handoff's explicit §1 transition. Do not reactivate or execute P1-F, a retry, claim/marker, standalone Preflight, or historical S2-pin procedure for this purpose.
- **IRR Windows IPC runtime:** still **not verified by Arena**. The operator smoke test in the Direct P1 consumption record remains the next live-runtime check; DP-V1–DP-V9 provisioning checks do not prove IRR-to-IPD named-pipe communication.
- **Broader Gate 4/G14/Gate 5 status:** unchanged and not accepted by this overlay. Any later claim that Direct P1 satisfies a broader qualification/admission limb requires an explicit evidence mapping and the applicable separate acceptance/admission act. This record grants none.
- **Writes, production, multi-user scope, certified-reference-portfolio semantics and other owner-scoped routes:** unchanged; no authority is inferred.

**No further P1-F execution action is issued.**