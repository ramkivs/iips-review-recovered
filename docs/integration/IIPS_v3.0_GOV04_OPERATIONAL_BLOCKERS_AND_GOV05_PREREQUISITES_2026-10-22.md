# GOV-04 operational blockers and GOV-05 prerequisite preparation

**Date:** 2026-10-22 UTC. **Capacity:** investigation, bounded correction and decision preparation only. No PA decision is rendered. No Gate 4/5 execution, admission, fence lift, production or `durable:true` claim.

## 1. Remote authority and publication read-back

At investigation, GitHub branch APIs and fetched repositories agree:

| Repository / evidence | Verified result |
|---|---|
| IRR authoritative `main` | `a3ca1f36f3ad74b96431cffefd7703676d19d46d`; push CI `39801594960` success |
| IPD authoritative `main` | `1cceacfff40f22dbc9cd64906bf26a5feac1075e`; tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`; push CI `39765365164` success |
| IRR GOV-03 evidence publication | PR #197 actually MERGED; merge `88481fcba606884b161c35f462b3a5dcaf89c3cb`; PR CI `39798817226`, post-merge CI `39800650641`, both success; artifacts present in fetched `main` |
| GOV-03 implementation publication | **NOT completed in IPD.** IPD `main` still lacks `brokerImportPersistence.ts` and the candidate read-wire corrections. Issue #44 open. Candidate `98e53b5cd5b1b3a1c7dc839d06f79064781d7ba0` / `15bf191e4032ad94d364fd5e9a6f23a318723d9a` cannot be retrieved by IPD commit API (422): do not cite them as remote commits. Their implementation is available as the IRR-published patch, SHA-256 `30501a166382a01582e573ab8e17ae1124909544ecff99fbd77c90c8b2ef1e05`. |
| IPD draft PR #42 | OPEN / DRAFT at `afa430900c3e928773bd35a3718bf3d6c94ccff5`; not merged, not a replacement baseline |
| IRR PR #114 | OPEN at `e331995a94b704e078b27a70a36cbc161311fd09`; not admitted |
| Historical G24 pin | Remote annotated tag `iips-pin-g24-6828155e`, tag object `dcdaaa94e8e050ba132a19813d2f22f214dca7d3`, peels to `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`. Reference inspection only; no promotion. |

Re-read on authoritative `main`: Q1, Q1-b, effective Gate 3 act `…2026-10-19-02`, Gate 3 acceptance `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01`, amendment/receipt, `PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md` D-1 §§11–15, G3-D5, CV-52, tracker §16.81 and §18.1 rows 28/30/32. Gate 3 acceptance is bounded implementation acceptance, not operational qualification. Q1-b's statements about absent implementation are historical snapshots, not the current code state. D-1 and G3-D5 still withhold promotion/admission of historical lineage; CV-52 remains BLOCKED / not granted.

## 2. Current ownership path: implementation exists, operational binding unproved

IPD startup uses `IIPS_G3_DATABASE_PATH` (absolute local database), `IIPS_G2_IPC_ENDPOINT`, and `IIPS_G3_LOCAL_STATE_DIR`; `src/ipc/entrypoint.ts` validates, connects, applies migrations 001–003, verifies the audit chain, then binds. It does **not** provision a binding. `dispatch.ts` validates the frame and rejects caller authority, then resolves the single ACTIVE binding and single ACTIVE membership afresh through `persistence/binding.ts`. Membership must attach to that binding. Store reads predicate on both canonical owner and tenant; foreign/missing resources are indistinguishable. No process-global owner cache is used.

The current migration 003 creates `local_principal_bindings` and **`local_principal_memberships`**, with partial-unique indexes enforcing one ACTIVE row each. Current provisioning is library-only: `provisionActiveBinding` requires a module-private symbol brand; no issuer exists. Forging the public `act` / `issuedAt` shape fails before SQL. Startup and IPC do not import provisioning. Setting IRR's `IIPS_G3_IPC_BINDING_PROVISIONED` affirmative value is only a local precondition, not evidence or authorization; default is false and prevents I/O. The public protected HTTP boundary never constructs this adapter and remains 503.

**Observed binding state is deliberately scoped:** a fresh disposable store has zero binding/membership rows and real IPC returns Class P / zero bytes. This environment has no access to the operator's Windows operational store; its current on-disk contents cannot be independently inspected here. There is no published applicable execution receipt proving an operational binding. Synthetic test rows are not operational provisioning.

### 2.1 Newly resolved discrepancy: the approved Gate A′ is not the current provisioning module

IPD `evidence/np04/IIPS_v3.0_G2_IPD_GATE_A_PRIME_PA_DECISION_RENDERED_2026-10-17.md` §§4.1–4.6 explicitly pins:

- Ref `gate-a/local-principal-enablement-2026-10-16` at `2ded0e981407b38c73bdea164153f53856aa7217`, tree `9069045d3daf22156020188696fc2f9c2f32bf27` (both remotely verified).
- Migration 003 blob `9ba884acc3c554c839a32ca41d0d16bda7e64690`; provision tool `b6f780f63278d333fd38c66e1abd2f3b64dcc2ea`; validator `550b9f4b83983d5d57aa29f565f371e5bcbed430`; binding service `710a47e22e5afc99c1744e11926719fc8356f20a`. All four remotely read back at that exact ref.
- Exactly one `application_users`, one ACTIVE **`tenant_memberships`**, one ACTIVE `local_principal_bindings`, two `local_principal_audit_events`; migrations 001–003; no other rows.
- Current IPD migration 003 is instead blob **`32b125bf962bb76a6ae59d3b262203dbbb988197`**; library-only `provisioning.ts` is **`dc844189a1c92f00acc3d7572c22f3e28e138eb6`**. Current initial schema explicitly excludes an application-user registry; current membership table is different. `src/gate_a` and `src/app_identity` are absent.

**Consequence:** do not execute current `provisioning.ts` under the old act, transplant old schema/rows, bypass the brand, or assume the old store is acceptable to current startup. The old act says **no substitution**, stop on differing identities. Q1 / G3-D4 authorize including provisioning code, not executing it or making its private brand mintable. Even successful old-tool execution would need an explicit compatibility disposition before serving current G3 reads. The Gate 4 proposal's D-5 sequencing treats Gate A′ as external, not a compatibility waiver.

### 2.2 Exact operator prerequisites and authority request (NOT rendered)

The existing Gate A′ permits **one** execution only on `desktop-no0nhtp`, Windows 11 Home Single Language build 26200, non-elevated `desktop-no0nhtp\\user`, SID `S-1-5-21-1872737340-673410177-2240931581-1001`, Node v24.14.0. Operator re-verifies host/account/SID/runtime. Rule P-1: record an absolute nonexistent target outside every Git tree, on local fixed NTFS, not TEMP/network/removable/synchronized storage; parent exists and operator can write without elevation. Stop on any mismatch. Record actor/context, exact basis ref/commit/tree/tool blobs, execution count, full invocation/result, six-object cardinality, V-A1…V-A8 and audit evidence. The approved tool uses `--execute`, `--actor`, `--context`, `--basis-ref`, `--basis-commit`, `--basis-tree`; its separate build-prerequisite decision also remains applicable. These requirements cannot be fulfilled on this Linux Arena host.

**Request to Ramki / PA:** resolve the demonstrated schema/tool incompatibility before attempting an operational binding for current G3. Either (a) explicitly retain old Gate A′ for its historical store and separately authorize a named, verified compatibility path to current G3, or (b) issue a bounded successor provisioning act against exact current IPD commits/schema/tool blobs, explicitly superseding the old execution basis for this purpose. Prefer (b), avoiding an unauthorized bridge and extra historical store. Name the executor, host/runtime/path rule, immutable migrations, generated identity rules, exact row/audit cardinalities, validation and rollback/stop conditions, evidence format and execution-count treatment. Explicitly authorize any narrowly manifested issuer/CLI implementation needed to make the currently unreachable mutator executable; do not merely set an environment flag or export the private brand. No endpoint admission, qualification, fence lift or production grant should be bundled. **No such decision is rendered by this request.**

## 3. Field-by-field contract reconciliation and bounded correction

Accepted IPD contract v1 §6 is at `evidence/cross-repository/IIPS_V3_G2_IPD_IRR_PORTFOLIO_CONSUMER_CONTRACT_V1_2026-10-18.md`; IRR consumer types are frozen by effective Gate 3 §5.2. The Q1 patch corrects wrappers/projections to v1; it cannot supply fields absent from v1.

| Result / field required by G2 | v1 supply | Least disruptive proposed treatment; PA approval required |
|---|---|---|
| View `isSaved` | absent | IPD-owned authoritative saved-state boolean; define INITIAL / save / RESET / tombstone semantics, not IRR inference from revision/nonempty holdings |
| Summary `weightSumPercentage` | absent | IPD projects persisted current-revision aggregate; no IRR recomputation |
| Summary `provenanceDigest` | absent | IPD projects current revision's authoritative digest, no IRR fabrication |
| Summary `isSaved` | absent | Same authoritative saved state as detail in a consistent snapshot |
| RevisionEntry `totalMarketValue` | absent | Project that revision's stored `total_market_value`, not today's value |
| RevisionEntry `provenanceDigest` | absent | Project that revision's stored `provenance_digest` |
| RevisionEntry `holdingsCount` | absent | Project that revision's stored `holdings_count` |

**Implemented correction in this pass:** the diagnostic `V1_TO_G2_ENVELOPE_GAP.renamedInV1` metadata incorrectly claimed v1 used `totalHoldingsCount` and `createdAt`. Accepted v1 §6 actually uses **`holdingsCount` and `committedAt`**, the same as G2. All three rename maps now correctly are empty; tests assert that. This corrects a demonstrated discrepancy, changes no wire/type contract and changes no refusal or HTTP behavior. Missing-field maps and refusal semantics remain intact. Historical implementation spellings are not contract definitions.

**Exact contract decision request to Ramki / PA:** authorize a versioned, additive IPD read-result contract revision supplying these seven required fields, their source-of-truth and lifecycle semantics, keeping frozen G2 interfaces and all fences unchanged. Record version negotiation/compatibility (current protocol version remains 1 until expressly decided), permitted producer/adapter/test manifests, absent/null/error policy, read consistency and historical-revision behavior. Explicitly authorize replacing the adapter's unconditional gap refusals only after validated required fields are received; adding producer fields alone is insufficient because the current adapter always refuses. Require malformed/missing fields still refuse without mutation or fabricated values. Address the separate v1 detail `durability`/`durable` requirements versus the pre-acceptance no-durability-claim boundary: the existing candidate omits them, so do not call its ten-field projection unconditionally full v1 detail conformance. No unsupported `durable:true` or synthetic flag is acceptable. A separate result-acceptance act must govern any durability-label activation.

This additive producer projection plus bounded adapter validation is less disruptive than replacing the frozen IRR type family or reviving G24. **Proposed only**: no new contract version, G2 type, saved-state rule, schema or adapter mapping is introduced here. Creation/save envelope semantics and write admission need their own complete reconciliation before any write-route lift; closing the seven read fields is not blanket write readiness. In particular G2's documented INITIAL revision 0 differs from G3's current INITIAL revision 1: do not silently change either.

## 4. New independent cross-repository diagnostic evidence

Executable artifact: `artifacts/gov04-cross-repository-read-probe.mjs`; machine-readable observations: `artifacts/gov04-cross-repository-read-results.json`. Run using IRR `frontend/node_modules/.bin/tsx`, after building the supplied IPD checkout. No HTTP route is wired; no injected transport is used. Both modes start the **actual IPD startup entrypoint**, connect with the **actual IRR socket client and adapter**, and use only a disposable database removed in `finally`.

| Diagnostic | Actual authoritative IPD baseline | Reconstructed Q1 candidate (scratch, unpublished) |
|---|---|---|
| Fresh store / forged provisioning act | zero rows; forged act refused before mutation; IPC Class P | same |
| Synthetic valid context, real socket read | IPD list succeeds, owner A only | same |
| Actual IRR adapter list/get/revisions | refuses wrapper/malformed projection | refuses exactly 3 / 1 / 3 missing G2 fields from §3 |
| Switch server-owned context A → B | next list B only; A get indistinguishable from missing | same |
| Revoke binding | next request Class P, zero bytes | same |

This closes the previous separation between IPD real-endpoint fixtures and IRR injected-transport tests, but **does not demonstrate an operational end-to-end admitted read**. A synthetic upstream read succeeds; an IRR read does not. No operational binding, host qualification, Gate 4 run or acceptance is claimed.

Validation in this pass (Linux / Node v22.22.3, supplementary only):

- IPD authoritative baseline: `npx tsc --noEmit`, `npm run build` pass; all eight `g3_*` suites: **198 tests / 197 pass / 0 fail / 1 skip**, including real-socket owner isolation, caller-authority rejection, binding revocation, framing, startup and W-1 write refusal.
- Published Q1 patch reapplies cleanly to a scratch copy of the exact IPD baseline; candidate `npx tsc --noEmit`, `npm run build`, guarded `npm test`: **802 / 801 / 0 / 1**. This does not establish a remote candidate commit or Windows qualification.
- IRR changed metadata/tests: `npm run typecheck`, `test:ci`, `.ci/assert-tests.js`, `npm run build` pass: **87 files / 1,077 passed / 0 failed**. Existing real-HTTP tests cover all twelve user-portfolio route-method pairs and protected report fences.
- Fence blobs unchanged: reports `981470541812a64c733309f1debec75455d85bee`, user portfolios `51704c12a467cd2f718a030b5036bc55c9afa73f`, unavailable response `cb8db45d668d28cee7e0a52721001d579a872733`. Frozen `userPortfolioContract.ts` unchanged.
- Initial direct IPD TypeScript test invocation failed resolving `.js` imports; corrected by compiling then running compiled tests, not counted as a product failure. Initial IRR dependency install hit certificate-chain verification; using the sandbox CA via `NODE_EXTRA_CA_CERTS` resolved it without disabling TLS verification or changing lockfiles.

## 5. Dependency-ordered checklist for later qualification, acceptance and admission

Uncreated future commits must be supplied by the responsible act, never guessed or replaced by the unpublished candidate SHAs.

| Order / prerequisite | Exact identifiers/artifacts the later record must name | Responsible authority / next action |
|---|---|---|
| 1. Publish authorized GOV-03 residual implementation | IPD base `1cceacfff40f22dbc9cd64906bf26a5feac1075e`, published IRR patch above; actual resulting PR/head/merge/tree/blob manifest and PR/post-merge CI, not inaccessible `15bf191e…` | IPD writer/operator, issue #44. Existing handoff records installation write denial; not bypassed. Verify ancestry/drift and complete tests before treating as landed. Do not merge draft #42 as a substitute. |
| 2. Resolve independent schema and read-contract decisions | Contribution-ledger / migration 004 determination from Q1 evidence §3; §3 seven-field/version/saved-state/durability and INITIAL mismatch decisions; exact authorized manifests and resulting producer/adapter commits | Ramki / PA decides; bounded implementation then tests/remote publication under the decision. Contribution-schema approval is not implied by a successful scratch run. Read work can be prepared independently of GOV-03 publication. |
| 3. Applicable provisioning authority and execution evidence | §2.2 compatibility/successor act; exact IPD tool/schema commit/tree/blobs; actual host/runtime/actor/path and invocation; binding/membership/audit/validation results; current IPC can resolve that store | PA for changed basis/tool authority; Windows operator for execution. The old act is already approved but does not authorize substituting current modules or this Linux host. No unnecessary re-approval of the unchanged historical act is requested. |
| 4. Qualified-read preparation complete | Operator-verified applicable store and binding; endpoint/ACL/config evidence; IRR local precondition affirmatively backed by that evidence; actual producer/consumer commits; raw successful reads and invalid/foreign/missing/revoked controls | Operator supplies external evidence; investigators can independently verify read behavior once authority/environment exist. Keep HTTP fences closed. Current fixture evidence is preparatory only. |
| 5. Effective Gate 4 qualification authority | Adopted (not proposed) target-host act with Act ID and all PA determinations; exact final IPD/IRR commits, runtime, executor, allowed tests/W-1 mechanisms, Gate A′ compatibility, QE-11 basis, digest set and run ID | Ramki / PA. Current final revision-3 proposal and D-1…D-12 packet are **PROPOSED — NOT EFFECTIVE**; no execution now. |
| 6. Recorded qualification result | Host `desktop-no0nhtp`; exact final qualified commits/trees; QE-1…QE-11 including Windows canonical test-wrapper remediation and supported Node patch floor, ACL/startup/crash/separate-process restart; create→persist→restart→read, idempotent earlier re-import, unresolved identity whole-request refusal; scripts/commands/raw logs/counts/digests and deviations; any expressly required Gate C results | Designated host operator under effective act. Failures/incomplete runs remain FAILED/INCONCLUSIVE; Linux diagnostics and old G24 evidence cannot replace them. Gate C remains NOT EXECUTED; Q5–Q8 deferred, not silently completed. |
| 7. Separate qualification-result acceptance act | Exact authority Act ID, run ID, immutable evidence packet/digests, qualified IPD/IRR commit/tree/blob manifest and tests; explicit disposition of every criterion/deviation and durability boundary | Ramki / PA. This is distinct from implementation acceptance and qualification authorization; no automatic acceptance from CI. |
| 8. Separate CV-52 admission act (later only) | Accepted result/acceptance IDs, qualified producer and consumer commits; exact operations and route-methods authorized, remaining fences, W-1 disposition if writes, durability boundaries, exclusions, implementation/publication procedure and verification | Ramki / PA. **Not initiated or drafted as an effective grant here.** Read-only preparation cannot authorize writes, reports, analytics, historical lineage, production or a generic route lift. |
| 9. Only after the applicable admission act | Actual admitted merge commits/trees, exact authorized fence changes, PR/main CI and remote read-back, evidence no drift from qualified bytes | Authorized executor in a later work group. Not performed here. |

**Current verdict:** GOV-04 remains operationally unproved and blocked on applicable provisioning, unpublished producer implementation, contract decision/remediation and qualified read evidence. GOV-05 remains BLOCKED / REFERENCE ONLY; Gate 5 NOT GRANTED / NOT STARTED. GOV-03 remains not complete. Gate A′ APPROVED — NOT EXECUTED; Gate C NOT EXECUTED; Gate 4 NOT AUTHORIZED / NOT STARTED. No capability/status count changes are supported.

Publication of this packet advances the compatibility determination, corrects false contract-rename metadata, supplies reproducible real cross-repository refusal/isolation evidence and gives exact decision requests; it is not a repetition-only status update. Publication coordinates for this pass are the containing PR, actual merge SHA and associated CI, verified separately rather than self-embedded.

---

**Correction appended `2026-10-22` (later pass; `CV-CORR-64`, tracker §16.82; `IIPS-V3-GOV03-MERGE-AND-GOV04-GOV05-RECONCILIATION-2026-10-22-01`).**

§3's closing paragraph and §4's statement that this pass "corrects false contract-rename metadata" are **withdrawn**. The premise they rest on — *"Accepted v1 §6 actually uses `holdingsCount` and `committedAt`, the same as G2"* — is true of contract v1 but **false of the frozen IRR types**, which are the binding consumer shape:

- `G2PortfolioSummary.totalHoldingsCount` (`frontend/server/user-portfolio/userPortfolioContract.ts` line 301) and `G2PortfolioView.totalHoldingsCount` (line 255) versus v1's `holdingsCount` — a **rename**, not a match;
- `G2RevisionEntry.createdAt` (line 315) versus v1's `committedAt` — a **rename**, not a match.

The `V1_TO_G2_ENVELOPE_GAP.renamedInV1` maps were therefore **restored** to `{holdingsCount → totalHoldingsCount}` (summary), `{holdingsCount → totalHoldingsCount}` (view) and `{committedAt → createdAt}` (revision entry), and the three test assertions that had locked in the empty maps were corrected. `V1_TO_G2_ENVELOPE_GAP` is exported diagnostic metadata only: no refusal path, message template, wire serializer or HTTP route reads it, so no behaviour changed (verified: `tsc --noEmit` 0; `ipcPortAdapter.test.ts` 46/46; full `npm test` 87 files / 1,077 passed / 0 failed; `npm run build` 0).

**Effect on the decision request in §3:** the gap is **seven missing fields plus three property renames (two distinct v1 properties)**, so it is **not** additive-only. An additive contract revision cannot close it by itself; an explicit IRR-side mapping authorisation is also required. The decision request stands with that addition. Nothing else in this record is superseded.
