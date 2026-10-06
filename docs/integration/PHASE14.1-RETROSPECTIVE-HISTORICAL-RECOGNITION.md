# PROGRAM v3.0 — Phase 14.1 Workflow Read Surface
# Retrospective Historical Recognition — Durable Governance Disposition

**Gate:** Phase 14.1 Retrospective Historical Recognition (governance disposition; read-only source
reconciliation — no implementation, no current certification, no promotion, no production)
**Date:** 2026-10-06
**Decision authority:** Program Authority — Ramki (explicit present-day authorization issued
2026-10-06). This record is the durable instrument of that decision.
**Authority decision:** **RETROSPECTIVELY RECOGNISED — HISTORICAL PHASE 14.1 IMPLEMENTATION, AT
HISTORICAL IMPLEMENTATION SCOPE**
**Authority boundary:** Historical governance disposition only. No implementation, recovery,
recreation, merge, cherry-pick, rebase, current-main integration, qualification, current
certification, persistence, security/D115, production or cross-repository implementation authority
is created (see §L, §M, §N, §O).
**Canonical baseline at disposition:** `iips-review-recovered` `main` =
`d0c6f80ef4b5732772b64a67ef15cdfc5a44e18a` (tree `a98000d3e5536a236bdca10e2265b3e14ad6a6cd`),
verified against the remote before publication.
**Evidence source (custody, not authority):** branch `phase14.1-recovery-deposit` @
`c115d1f49454a171c24ec61bab5e28f0ceea1df5` — exact coordinates in §F.

---

## A. Title

Program v3.0 — Phase 14.1 Workflow Read Surface — Retrospective Historical Recognition
(durable governance disposition of the historical implementation at its historical
implementation scope).

## B. Date

2026-10-06. The disposition is a present-day act: it is issued on this date, and it concerns
historical evidence whose implementation artefacts carry 2026-08-13 workspace timestamps and whose
import into the repository is dated 2026-08-14.

## C. Decision authority

**Program Authority — Ramki.** On 2026-10-06 the Program Authority explicitly authorized a single,
narrowly scoped governance decision: to **retrospectively recognise the historical Phase 14.1
implementation at its historical implementation scope**, based on the recovered, hash-verified
snapshot and the completed three-repository forensic investigation.

The authority granted is **only** the historical disposition and its durable governance record.
The following were explicitly **not** granted and are **not** created by this disposition:

- new implementation authority;
- implementation recovery / recreation authority;
- merge authority;
- cherry-pick authority;
- rebase authority;
- current-main integration authority;
- qualification authority;
- current certification authority;
- persistence authority;
- security/D115 certification authority;
- production authorization;
- production deployment authority;
- cross-repository implementation authority.

No authority beyond the explicit scope above may be inferred from this record, from the existence
of the recovery deposit, or from the presence of recovered source material.

**Preparation:** this record was prepared under the Program Authority's instruction, in a read-only
reconciliation session. The decision is the Program Authority's; the preparation of the record
confers no authority of its own.

## D. Scope — the historical implementation scope recognised

Recognised historical scope (and nothing wider):

- the **Phase 14.1 workflow implementation** as it existed in the recovered snapshot — a read-only
  workflow definition read surface;
- the endpoint **`GET /api/workflow`** (read-only; exact-match route; governed authority chain;
  no mutation, no execution history, no approvals, no configuration);
- the recovered **workflow transport** (`frontend/server/workflow-transport.ts`);
- the recovered **`WorkflowView`** (`frontend/src/features/workflow/WorkflowView.tsx`) and its
  client access module (`frontend/src/api/workflow.ts`);
- the recovered **workflow tests** (`frontend/server/workflow-transport.test.ts`,
  `frontend/src/features/workflow/WorkflowView.test.tsx`);
- the recovered **live-certification test**
  (`frontend/server/live/workflow-live-certification.test.ts`, real-Keycloak, conditional skip);
- the **four wired/modified files** identified by the historical report
  (`frontend/server/executive-transport.ts`, `frontend/src/app/App.tsx`,
  `frontend/src/app/navigation.ts`, `frontend/src/app/routes.ts`);
- the **recovered snapshot** as the evidentiary source of the above.

The recognition is **not** broadened to: the general workflow platform; current workflow
architecture; durable workflow persistence; current D115 architecture; production workflow; or
current platform certification. None of these are recognised, qualified, certified or authorised
here.

## E. Evidence basis

The disposition rests on the completed three-repository forensic investigation. The following were
**re-verified in this session** against fresh reads of the repository and the artifact (not taken
from earlier reports):

| # | Established fact | Status in this session |
|---|---|---|
| A | The recovered Phase 14.1 implementation was real | Confirmed — all ten declared delta files present in the snapshot, each hash-identified (§F, §G) |
| B | The snapshot contains all six historically named Phase 14.1 files plus the four wired/modified files | Re-derived: **6 added + 4 modified** vs the import commit `c65d533` |
| C | The recovered implementation contains a genuine `GET /api/workflow` | Re-read: exact-match route `req.url !== '/api/workflow'` → 404; `authenticate` → 401; `authorize(p,'read','workflow.definitions',…)` → 403 + governed audit; DTO with `unavailable[]`; `WORKFLOW_READ_GATE = action === 'read'`; wired from `executive-transport.ts` |
| D | The snapshot matches the historical certification report's declared Phase 14.1 file delta | Confirmed file-for-file (§G) |
| E | Snapshot vs IRR import commit `c65d533` = 6 added + 4 modified + 1 deleted | **Re-derived exactly** (§G) |
| F | The ten-file Phase 14.1 delta was dropped during the import | Confirmed: the ten delta blobs are absent from the entire IRR object database (3,921 objects / 386 commits / 56 heads / 2 tags / 36 PR refs), from IPD and from IIPS (§G, §H) |
| G | The recovered snapshot is independently integrity-verified | Re-computed from the published blob: SHA-256 `6bafef5c…`, 719,726 bytes, Git blob `dae0a839…` — exact match (§F) |
| H | The recovery artifact is durably deposited | Re-verified on the remote: branch `phase14.1-recovery-deposit` @ `c115d1f`, parent `d0c6f80`, exactly +1 file (§F) |
| I | IIPS contains no Phase 14.1 corpus or delta blobs; IPD contains none; IRR contains the conflicting documentation; no constitutive authorization, acceptance, certification or closure act was recovered | Carried from the completed three-repository investigation (§H); the delta-blob absence was re-verified |
| J | Material contradiction in the historical records | Re-read the exact wording on IRR `main` (§J) |
| K | Historical existence established; execution/run evidence **not** independently established | Preserved as an explicit limitation (§K, §L.2, §L.3) |
| L | The recovered implementation predates later D115 / company-binding changes | Preserved as a limitation (§L.9) — no D115 compatibility claim is made |
| M | Workflow definitions are in-memory; durable workflow persistence was not established | Preserved (§L.8) — no persistence authority is created |
| N | The historical implementation is absent from current IRR `main` and IPD `main`; it has not been admitted into current convergence or current certification | Re-verified: the six named source paths are absent from IRR `main` (§M) |

The evidence supports the **historical existence and scope** of the implementation. It does **not**
independently support execution success, acceptance, certification or current status, and this
disposition does not claim otherwise.

## F. Recovery coordinates (recorded exactly)

```
Repository:  ramkivs/iips-review-recovered
Branch:      phase14.1-recovery-deposit
Commit:      c115d1f49454a171c24ec61bab5e28f0ceea1df5
Parent:      d0c6f80ef4b5732772b64a67ef15cdfc5a44e18a
Artifact:    artifacts/phase14.1-recovery-snapshot/v3.0-phase14.1-certified-snapshot.tar.gz
SHA-256:     6bafef5c7b76365d23f2a72f60aa7b395c86ab01be716c05e8de7a9d5f445f28
Git blob:    dae0a839adbabed306196face3a2ece0f774be7f
Size:        719,726 bytes
```

Deposit diff vs its parent: exactly one file added (the artifact above); no other change.
The deposit is **custody of the evidence**; it is not authorship, and it is not an authority
instrument. The historical base/import coordinate recorded alongside it is **`c65d533`**
(`c65d53373717aacc3a1dce12d47b5aeaf50541a5`, root import commit "Import recovered IIPS workspace",
2026-08-14, 906 files).

## G. Forensic lineage finding

Comparison of the recovered snapshot (911 files under `v141snap/`, workspace timestamps
2026-08-13) with the import commit `c65d533` (906 files), re-derived file-by-file and by blob hash:

**Added in the snapshot (6):**

| Path | Blob |
|---|---|
| `frontend/src/api/workflow.ts` | `976263d2a88f19efeac2b31b190a346babd1c0a2` |
| `frontend/server/workflow-transport.ts` | `286fd9d58c8a9932e9107ef1ecbeed74fd12b7bd` |
| `frontend/src/features/workflow/WorkflowView.tsx` | `7390566889c3003bacd44566fcc31f41b3b57167` |
| `frontend/src/features/workflow/WorkflowView.test.tsx` | `19210846badc4c12595fd78a734c3bd29c6b6a0f` |
| `frontend/server/workflow-transport.test.ts` | `41a98c0cd9469cecb9d31df060f8ee8950a2d1c1` |
| `frontend/server/live/workflow-live-certification.test.ts` | `5772ae42156bf8663a8454c52e856fa8cd92d435` |

**Modified in the snapshot (4):**

| Path | Import blob → snapshot blob |
|---|---|
| `frontend/server/executive-transport.ts` | `dd8fb224…` → `c65a93b348fc798c635e280169942551fe09c367` |
| `frontend/src/app/App.tsx` | `bac18e5e…` → `3f0fbce53e7b82e1dc58022c0f54afbf588593ae` |
| `frontend/src/app/navigation.ts` | `99175f1b…` → `30fefd1191a2278169a5e3cf4c2b62113195dd26` |
| `frontend/src/app/routes.ts` | `7e5d7ff4…` → `7671a3063552c18ee73cd101c6c0473b0e156afa` |

**One further difference, outside Phase 14.1 scope (recorded for completeness):** the import
contains `docs/v3.0/housekeeping-2026-08-13-size-prune.md` (blob `4ab6369f…`), which is not present
in the snapshot. This is a housekeeping document, not a Phase 14.1 implementation file; it is
**not** part of the ten-file Phase 14.1 delta.

**Lineage conclusions:**

1. The ten-file Phase 14.1 delta was **dropped at (or before) the import** represented by
   `c65d533`, and was never re-added: all ten delta blobs are **absent** from the entire IRR object
   database (3,921 objects; 386 commits; 56 heads; 2 tags; 36 PR refs) and from the object
   databases of IPD and IIPS.
2. No commit or tree in any of the three repositories binds the recovered delta. The deposit binds
   the delta only as archived content inside the artifact — custody, not authorship.
3. The **certification report survived the import** while the code delta did not: the report blob
   `5d23073cf2a91fc227b8d8cc71af501f91eae913` is identical at `c65d533`, in the snapshot, and on
   current `main`.
4. The recovered implementation was never subsequently recovered into source: the six named source
   paths are absent from current `main` (1,096 files).

## H. Three-repository investigation summary

- **`ramkivs/iips` (resolves to `ramkivs/IIPS`)** — an earlier, unrelated generation
  (`@iips/web` 0.1.0-sprint-0, created 2026-08-03; 5 commits, 1 branch, 0 tags, 830 files, no
  markdown/governance corpus). Contains **no** Phase 14.1 authority or evidence corpus, no delta
  blobs, and **zero shared Git objects** with IRR and with IPD. It contributes nothing to this
  disposition.
- **`ramkivs/iips-production-market-data` (IPD)** — contains no Phase 14.1 implementation and no
  Phase 14.1 authority chain (0 hits for `/api/workflow`, `Workflow Read Surface`, `Phase 14.1`
  across its history; delta blobs absent). IPD's separately-labelled `P14` acts are a **different
  gate** (UX/Visual/Browser scope; its own acceptance by A3) and are **not** transferred to, or
  from, this disposition.
- **`ramkivs/iips-review-recovered` (IRR)** — contains the historical certification report and the
  contradictory Phase 14 inspection/recommendation material, but **no** constitutive Phase 14.1
  authorization, acceptance, certification or closure act, in any ref or any commit of its full
  history.
- **Contradiction found and preserved:** the historical certification report states
  "✅ APPROVED" and "IMPLEMENTED + CERTIFIED", while the contemporaneous, co-located Phase 14
  inspection corpus states "Phase 14.1 implementation is NOT authorized" and "Phase 14
  implementation: NOT AUTHORIZED" (see §J). This disposition resolves the **governance status of
  the historical implementation** by an explicit present-day decision; it does **not** fabricate,
  and does not claim to have discovered, the missing historical acts.

## I. Historical implementation recognition

**The historical Phase 14.1 workflow implementation is RETROSPECTIVELY RECOGNISED at its historical
implementation scope, based on the recovered, hash-verified snapshot and the completed
three-repository forensic reconciliation.**

This recognition establishes the historical existence and scope of the implementation as described
in §D. It is based on recovered source evidence and forensic lineage — **not** on a newly executed
implementation and **not** on a newly executed certification run. It is a present-day Program
Authority disposition concerning historical evidence; it is **not** a claim that the missing
historical authorization act was found.

## J. Historical certification-report treatment

The historical certification report
(`docs/v3.0/phase14/PROGRAM_v3.0_PHASE14.1_CERTIFICATION.md`, blob
`5d23073cf2a91fc227b8d8cc71af501f91eae913`, identical at `c65d533`, in the snapshot and on current
`main`) is **RETAINED AS HISTORICAL EVIDENCE**. Its declared Phase 14.1 file list matches the
recovered ten-file delta exactly, which is the principal corroboration of §G.

Its language — "✅ APPROVED", "✅ IMPLEMENTED + CERTIFIED", and the reported regression figures
(Platform 506/506; frontend offline 149 passed / 28 skipped; real-Keycloak 3/3; TypeScript strict
clean; production build succeeds) — is recorded here as **historical report language**, not as a
constitutive approval, acceptance or certification act, and not as independently reproduced
execution evidence. The report's own persistence note (recording that the report and the
implementation were previously lost and re-created, and designating "an external backup
(snapshot/bundle/remote)" as "the recovery authority") is likewise **descriptive**; no authority is
derived from it.

The contradictory contemporaneous records are retained on the same terms and are **not** withdrawn,
edited or superseded by this disposition:

- `docs/v3.0/phase14/README.md` — "This is the inspection gate; Phase 14.1 implementation is NOT
  authorized."
- `docs/v3.0/phase14/phase14-recommendation.md` — "Phase 14 implementation: NOT AUTHORIZED."
  (with "Inspection only — no implementation." as its stated basis)

**Contradiction reconciliation (recorded, not revised):**

| Item | Treatment |
|---|---|
| Historical implementation existence | **RECOGNISED** (§I) |
| Historical certification report | **RETAINED AS HISTORICAL EVIDENCE** (this section) |
| Historical authorization act | **NOT RECOVERED** |
| Historical acceptance act | **NOT RECOVERED** |
| Historical execution evidence | **NOT RECOVERED / NOT INDEPENDENTLY PROVEN** |

This disposition resolves the governance status of the historical implementation without
fabricating missing historical acts. It creates **no** new certification, and the historical
"APPROVED"/"IMPLEMENTED + CERTIFIED" wording does not become current certification by this act.

## K. Missing historical authorization / acceptance / run evidence

- Historical **authorization** of Phase 14.1: **not recovered** in any of the three repositories
  (all refs, all history, all content), and actively contradicted by the contemporaneous inspection
  corpus.
- Historical **acceptance**: **not recovered**.
- Historical **closure**: **not recovered**.
- Historical **execution/run evidence**: **not recovered**; no results artefacts (no junit/xml/tap/
  log/coverage artefacts) exist in the snapshot, and the report's test claims are not converted by
  this disposition into independently reproduced execution evidence.
- The recovered implementation **predates** later D115 / company-binding changes; no
  D115/company-binding compatibility conclusion is drawn.
- Workflow definitions in the recovered implementation are **in-memory**; durable workflow
  persistence was **not** established.

## L. Explicit limitations

This disposition **must** be read subject to all of the following, which it preserves:

1. Historical implementation existence is recognised.
2. Historical execution/run evidence remains **UNPROVEN**.
3. Historical test claims are **not** converted into independently reproduced execution evidence.
4. The historical "APPROVED" / "IMPLEMENTED + CERTIFIED" report language is recognised as historical
   evidence, but this disposition **must not** be represented as a new current certification.
5. No current IRR `main` certification is created.
6. No current IPD certification is created.
7. No production authorization is created.
8. No persistence authority is created.
9. No D115 / company-binding compatibility certification is created.
10. No current security certification is created.
11. No implementation recovery/recreation is authorized.
12. No merge / cherry-pick / rebase is authorized.
13. No current-main integration is authorized.
14. No promotion is authorized.
15. No production deployment is authorized.
16. The recovered implementation remains **historical evidence** unless a future, separately
    authorized gate changes its status.

**Authority-language distinction (required):** retrospective historical recognition is **not**
implementation authorization, **not** acceptance, **not** qualification, **not** certification,
**not** current authority, and **not** production authority. The Program Authority's present
authorization establishes the historical disposition record only.

## M. Current-status exclusion

- The historical implementation is **not** present on current IRR `main` and **not** present on
  IPD `main`; current `main` in all three repositories contains **none** of the recovered
  implementation.
- Nothing in this disposition is admitted into current convergence, current qualification, current
  certification, or any current baseline.
- Current IRR `main` (baseline `d0c6f80…`) and current IPD `main` remain **uncertified for Phase
  14.1** by this act; this disposition makes no claim about their status.
- The historical record's own approval language is not transferred forward as current status, and
  current certification is not transferred backward onto the recovered implementation.

## N. Production exclusion

No production authorization, production deployment authority, production workflow change or
production activity of any kind is created, implied or enabled by this disposition. Production
remains out of scope.

## O. Future-gate boundary

The recovered implementation remains historical evidence until a future, separately authorized
gate changes its status. Any such future step requires its own **explicit** authority and its own
record — including (non-exhaustively and without granting anything here):

- durability hardening of the evidence (e.g. an artifact manifest or an immutability tag for the
  deposit commit) — a separate authorization;
- any independent validation of the historical implementation — a separate authorization, and
  offline-only unless separately extended;
- any path toward current-main integration, D115/company-binding compatibility, persistence, or
  promotion — separate authorizations, each with its own scope and evidence;
- disposition of the historical contradiction retained in §J — part of the historical record, not
  to be edited retroactively.

No retroactive mutation is performed by this disposition: no source is recreated, no merge, tag,
promotion or certification of current `main` occurs, and no historical certification, acceptance
or inspection record is altered.

## P. Final disposition

The required, unambiguous statement of the decision:

> "The Phase 14.1 workflow implementation is retrospectively recognised at its historical
> implementation scope based on the recovered, hash-verified snapshot and the completed
> three-repository forensic reconciliation. This recognition establishes the historical existence
> and scope of the implementation. It does not establish independent execution evidence, current
> qualification, current certification, D115/company-binding compatibility, durable workflow
> persistence, current-main integration, production readiness, or production authorization. No
> implementation recovery, merge, promotion, or production action is authorised by this
> disposition."

This boundary is not to be weakened.

## Q. Integrity / publication proof

**Pre-publication verification (this gate):**

1. **Recovery artifact coordinates re-verified from the remote** — the deposit commit's parent is
   the recorded baseline, the commit adds exactly one file, and the artifact blob's byte content was
   re-hashed: SHA-256 `6bafef5c…`, size 719,726 bytes, blob `dae0a839…` — exact match with §F.
2. **Delta re-derived from first principles** — snapshot files hashed individually and compared with
   the `c65d533` tree (§G); result 6 added + 4 modified, matching both the historical report's
   declared file list and the recovered artefact's content.
3. **No-source-change verification before commit** — the only staged path is this record:
   `docs/integration/PHASE14.1-RETROSPECTIVE-HISTORICAL-RECOGNITION.md`. No source, runtime, test,
   package, manifest or existing governance record is modified; the recorded recovery artifact is
   not re-uploaded and remains byte-unchanged.
4. **Baseline and clean-tree verification** — the change is committed on top of
   `main@d0c6f80ef4b5732772b64a67ef15cdfc5a44e18a` from a clean worktree.

**Post-publication verification (remote):** the published ref was independently fetched from the
remote after push; the remote commit, its parent, its tree and this record's blob were re-verified
against the locally committed content. The exact remote coordinates (commit, parent, tree, record
blob) are recorded in the accompanying Programme Authority report and in the change request that
carries this record.

**Independent verification recipe** (any holder of the repository can reproduce it):

```bash
git fetch origin phase14.1-recovery-deposit
git cat-file blob dae0a839adbabed306196face3a2ece0f774be7f | sha256sum
#   expect 6bafef5c7b76365d23f2a72f60aa7b395c86ab01be716c05e8de7a9d5f445f28
git show --stat c115d1f49454a171c24ec61bab5e28f0ceea1df5   # exactly +1 file vs d0c6f80
git rev-parse main                                        # baseline at disposition
```

**No mutation performed by this gate:** no implementation, no source or test change, no merge,
cherry-pick or rebase, no branch rewrite, no tag, no promotion, and no production activity. This
record is additive governance documentation only.
