# Consolidated Gate 4, durable holdings and identity dependency reconciliation

**Record:** IRR-P5-CONSOLIDATED-READINESS-2026-11-06. **Type: decision preparation, not a PA act.**
**Authority status:** 15 pending decision/dependency entries, 8 preserved effective/settled crosswalk entries.
**Disposition of this work item:** investigation and decision preparation; publication effectiveness is evidenced
by this work item's exact-head and merged-main checks plus independent remote readback, not by this sentence.
**No new decision is rendered, no implementation authorized and no gate or limitation closed by publication.**

## 1. Read this before deciding

This is the **one consolidated PA paper**. It references, rather than republishes or replaces, A-10's four
ballots, D01–D06's detailed recommended text, the Dhan dependency paper and IID's authoritative Part B roadmap.
The full per-item register in §6 is mirrored mechanically in the accompanying JSON, not a second proposal.
Historical acts and papers remain unchanged. Recommendations are not effective decisions. Completed retention
and active-store-clearing implementation is not reopened. No new IID code belongs to this item.

**Recommended order:** preserve existing acts → resolve D01/D02/D03/D04 scope → render the exact D05 delta if
needed → decide all four Gate 4 content/alias/lineage questions → qualify exact authorized scope on the named
host → separately accept results and D06 operation admission. A-5 → authorized A-6 → A-7 is an external identity
lane; IID's real-data/R-16 and L-016 reconciliation are separate dependencies, not invented global PA vetoes.
Accepted IID design questions are not reopened. This order is a recommendation, not revised governance.

Recommend **C-3 deferral now**, with a scoped C-1 content alternative prepared only for explicit later PA choice.
C-2 (new Limb-A-only implementation) is not assumed authorized. This paper does **not** choose C-1/C-2/C-3 for PA.

### Source index (reuse, not replacement)

- [A-10, Gate 4 decisions 1–4](WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md), especially §§3,5–9.
- [Holdings readiness](SAIRAM-DURABLE-HOLDINGS-ARCHITECTURE-READINESS-2026-11-06.md), §§2–9 and H01–H12;
  [existing D01–D06 ballot](SAIRAM-DURABLE-HOLDINGS-PA-DECISION-PACKAGE-2026-11-06.md);
  [published receipt](SAIRAM-DURABLE-HOLDINGS-READINESS-PUBLICATION-RECEIPT-2026-11-06.md).
- [G-2 architecture](IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md), §§1–9;
  [implementation lineage](IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_IMPLEMENTATION_RECORD.md), §§1–5.
- [G-2 local-principal trust amendment](IIPS_v3.0_G2_IRR_DP1_IDENTITY_CREDENTIAL_TRUST_AMENDMENT_2026-10-16.md).
- [R5 adoption act](IIPS_v3.0_CAP03_G4_H12_R5_PA_ADOPTION_ACT_EFFECTIVE_2026-10-25.md), §3.2 and tracker §16.123.12;
  [DQ-6b Path A](IIPS_v3.0_CAP03_DQ6B_PA_DECISION_PATH_A_EFFECTIVE_2026-10-25.md) and the IPD mirror bound by the adoption act.
- [Dhan external dependency](WS-A-DHAN-DETAILED-HOLDINGS-EXTERNAL-DEPENDENCY-2026-11-05.md), including the symbol-space/ISIN-space qualification;
  [earlier source investigation](WS-A-DHAN-DETAILED-HOLDINGS-SOURCE-INVESTIGATION-2026-11-05.md) is historical, not evidence of tested unknown ISINs.
- [IID roadmap](IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md), **Part B prevails**;
  [cumulative limitations L-001–L-016](IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md).
- [Retention publication](WS-A-LIVE-EVIDENCE-RETENTION-PUBLICATION-RECEIPT-2026-11-05.md);
  [reset implementation receipt and closure](WS-A-OWNER-EVIDENCE-RESET-IMPLEMENTATION-RECEIPT-2026-11-06.md).
- [R2 §23/23.1 and appended §24](WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md);
  [WS-A-DM](WS-A-DURABLE-USER-HOLDINGS-MILESTONE-DEFINITION-2026-11-05.md).

## 2. Rebaseline, repositories and concurrent history

Remote API census started at **IRR main `80737d072829d942fb2f9ec76f6e9122e36530f7`** on
`arena/74604381-iips-review-recovered`. Full local history and independent remote objects were consulted.
No later main commit existed at census; no open PR existed. This does not claim unpublished local drafts do not exist.
The earlier `2a551108…` baseline is not the correct parent for holdings publication #468: concurrent IID #464 and
#467 were incorporated first. Current work preserves them. The first-parent sequence from that older report is:

| PR | Merge | Reconciliation |
|---|---|---|
| #464 | `f08da401dee12748581cbef5599d8c2e3758c84b` | IID-3 implementation, retained |
| #467 | `95b95cfe04bbb7f6be200bacce38efc804ace278` | IID-3 independent publication receipt, retained; actual #468 parent |
| #468 | `d37ac14e3e09009223de92f436c3dafbde27568f` | Holdings readiness and D01–D06; not implementation |
| #469 | `80737d072829d942fb2f9ec76f6e9122e36530f7` | Holdings publication receipt; last reported main |

The remote census records exact PR heads, merges, trees and returned CI checks. Ten source/evidence files were
independently API-read at the respective IID/holdings merge commits and compared byte-for-byte with Git objects.
For #468/#469, prior proofs and new API checks agree: head/main runs 42099000839/42099203142 and
42099964032/42100138142 succeeded. Neither PR rendered D01–D06.

| Repository | Identity and current immutable remote main | Ownership meaning |
|---|---|---|
| `ramkivs/iips-review-recovered` | ID `1333482008`; commit `80737d072829d942fb2f9ec76f6e9122e36530f7`; tree `e94bb275b43522ce1ea8cba111bd532a5337ac67` | IRR consumer/governance publication locus |
| `ramkivs/iips-production-market-data` | ID `1361385667`; commit `07e86a4f2c105651f3097a96cb519f8611945e30`; tree `7c08725665030730802b631e8cfdf751ea16202a` | G-2-cited portfolio source, SQLite and local IPC; read-only |
| `ramkivs/ipo-screening-engine` | ID `1405223378`; commit `d661b5ee99a782566fedcb9aa2b139e756948d27`; tree `d0fae7b5199ca5ca2e5d099cbfe31076f8af7ca6` | Distinct Python IPO-screening/research source; read-only, NOT silently the IPD portfolio owner |

All 14 previously investigated portfolio source/authority blobs still match current main. Reuse their exact
manifest and inspection instead of repeating implementation or opening an operational database. The named IPO
repository's prior four-file source inspection is also retained at unchanged `d661b5ee…`; no repository was
mutated, renamed, aliased, provisioned or transferred. Existing G-2 storage lineage has evolved from historical
better-sqlite3/HTTP details to current **node:sqlite / local OS IPC**, not a fresh technology choice.

## 3. Gate 4: fresh three-coordinate census, not an execution designation

The adopted R5 manifest is still blob `f4649e36a81c7013287810cd3202b99586dbd951`, raw SHA-256
`d0be8bef3281ae6a296b8700265fe134b5088dd84b102b77ca8a157c8275cb76`.
Its internal `CANDIDATE` text is unchanged; adoption effectiveness derives from its published act/receipt.
All **56 core entries (32 IPD + 24 IRR)** were freshly remote blob/SHA-256 verified. All three historical
commit/tree coordinates below resolve against the current repository's remote objects; they are **not** all
one repository's current main. This census does not regenerate/adopt supplemental inventories or execute QE.

| Adopted R5 coordinate role | Commit | Tree |
|---|---|---|
| `IPD_primary_qe_coordinate` | `8eec74ae27cda09f3c368b9c299895eae41554db` | `4eba29029f8d95cfe483e615a7047426b298ce50` |
| `IPD_broker_alias_compatibility_coordinate` | `70b24f029842a7e9b7f615e4d9df7376fd4ff817` | `cc0f0117822850f9046e9a51bd05c1d45f80cd57` |
| `IRR_qe_consumer` | `ba64b2d5927c2f872560710cf1474c25a5cde0d5` | `5e4262f1cd75bf13b76ced5b45058f31434b5dad` |

### 3.1 Current consumption is a separate census

- `iips-broker-import`: `github:ramkivs/iips-production-market-data#07e86a4f2c105651f3097a96cb519f8611945e30`.
- `iips-np04-governed-persistence`: `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`.
- `iips-production-market-data`: `github:ramkivs/iips-production-market-data#279d1eed184f5e23bbabe5c6411085e120ce9e41`.

A-10's previously live broker `7bcae35…` and main `6df748…` are stale observations, not current pins.
The broker now consumes `07e86a4…`; the primary dependency `279d1eed…` and NP-04 `2e11fa3b…` are distinct
runtime inputs and must appear in any future actual consumed/compiled inventory. A present main or lockfile
reference is not an H-12 designation. Do not infer that one IPD source coordinate covers every consumed artifact.

| Content candidate only (NOT selected) | Commit | Tree |
|---|---|---|
| G4P1 | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` | `76f083d7058e170d8212455c03bad1033136ee68` |
| C1alternative | `001c3c80618f2ee1d40e9a90912237e1a06e7b58` | `399fa44a5f1953c0f61b452420fefb5985426ef1` |
| liveContentCandidateOnly | `07e86a4f2c105651f3097a96cb519f8611945e30` | `7c08725665030730802b631e8cfdf751ea16202a` |

IRR consumer current census candidate is `80737d0…`, tree `e94bb275b43522ce1ea8cba111bd532a5337ac67`.
None of these candidates is rendered PA-09 or a QE execution pin. Older G4-P4 at `7bcae35…` is not silently
relabelled as current G4-P4. A future content ballot must inventory and bind all three roles, the conditional
helper, amended-§8/supplemental sets, compiled outputs and the actual dependency split explicitly.

The fresh alias supplement census also verifies all **14 raw-source paths** at both historical IPD coordinates:
**10 identical / 4 divergent**, preserved as recorded. The current core footprint is **38/56 unchanged** relative
to the adopted blobs; the per-path current comparison is in the census, not an assertion that old digests apply.
Current committed broker profile still specifies **18 modules / 36 JS+declaration artifacts**, materialized
from `dist/package`. This is profile/source readback, not a new installed-package qualification.
C-3 retains A-10’s definition: keep undesignated until the CAP-03 chain produces C′. No candidate object alone
is asserted to prove or disprove C′ completion. Suggested sequencing adds no new governing authority gate.

### 3.2 Four decisions remain distinct

1. **PA-09/all-three-coordinate content designation** — pending, not supplied by current pins.
2. **C-1 / C-2 / C-3** — pending PA selection; recommendation C-3 now, not an effective selection.
3. **DQ-6b-class alias re-render** — historical Path A remains effective for its named coordinate; current
   published-output alias needs a separate disposition. No inferred re-render or Path B.
4. **Lineage classification** — remote mapper counts: historical alias `70b24f02…` **REAL ×3**; R5 primary
   `8eec74ae…` **UNCLASSIFIED ×3**; current broker `07e86a4…` **UNCLASSIFIED ×3**. These are hash inputs:
   historical DB-C1 lineage digests cannot be asserted reproducible at the live pin. A new explicit disposition,
   not a source toggle, is required. Restoring REAL needs new IPD implementation authority.

Gate 4 target-host act §3.2 remains blob `66b56fd1584890525a7250aadd7da449def621e5` in current IPD:
**merged + green + readback**; a separate final post-merge **Limb-A execution pin before preflight/QE-1**;
**before/after H-12 digests**; **non-document drift → stop and re-designate**. No execution pin is nominated here.
Content designation is not execution qualification. **QE 0/11; Gate C and Gate 4/U4 acceptance NOT RENDERED;
Gate 5 NOT INITIATED / NOT ADMITTED; DQ-4 8/10; U6 NOT AUTHORIZED.**
The last authoritative report says host `desktop-no0nhtp` was unreachable; no host access/reachability probe
was attempted by this documentary investigation. Historical host observations are not a fresh connectivity test.

## 4. Durable holdings and Dhan: reuse, precise deltas, honest identity evidence

**D01–D06 remain pending.** The original detailed ballot is not rewritten. D01 must resolve the named Python
IPO vs actual G-2 portfolio repository conflict. D02 must explicitly extend canonical owner
`owner-4dc756b3` / `irr-personal-073dd1c8` to holdings; evidence AMEND-01 excludes that domain. Existing IPD
`ipd-owner-ramki-personal` / `ipd-personal-local` bindings cannot be treated as equivalent or automatically
reassigned. SAIRAM is an opaque display partition label, never a credential; owner is never request-supplied.

Reuse the existing IPD store, transactions, trusted local binding, membership checks, per-portfolio contribution
sets and immutable lineage; preserve token/membership checks inside serialized mutations and W-16's revoked-data
protections. D03 covers **four-revision cap**, overflow/lifecycle, create **retry/unknown-outcome/duplicates**,
and the IRR **generic-success and non-empty holdings/contribution projection gaps**. Prefer existing minimal v1
receipt plus authorized readback, no invented fields or exactly-once claim. D04 distinguishes atomic snapshots
from a trade/cash/tax-lot ledger. D05 must bind exact files/pins/schema/tests, backups, restore and host scope;
D06 separately accepts qualification and admits named operations. H01–H12 supplement, never replace, existing QE.

**68 summary rows are not fully resolved:** existing evidence is 1 resolved / 67 unresolved, savedRows 0,
saveable false. Genuine `DHAN_DETAILED_HOLDINGS_V1` with the governed **11-column layout including ISIN and
Exchange**, provenance and raw digest is required. Source-cell traceability and independent identity
corroboration precede a new exact authorized D05 Wave-2 deposition. A-5 is external input; A-6 is **not started
and lacks new expansion authority**; A-7 follows authorized A-6. Neither IID-1 nor a package pin bypasses D05/P04.

**Evidence correction carried forward:** the earlier 0/67 probe measured **name/symbol-space** coverage plus a
composition inference. Missing genuine ISIN cells were not tested. Do not call 67 unknown ISINs tested-absent,
or claim a hypothetical detailed export already failed or succeeded. Genuine audited absence for particular
known identifiers does not turn that whole symbol-space observation into a complete row-level ISIN test.
No identifiers, mappings, files or real export were fabricated; no new D05 authorization was found in the
unchanged reviewed remote authority/source basis. A-5 does not guarantee resolution; after genuine input, publish
actual per-row residuals and perform A-6 only to its exact authorized scope.

## 5. IID: remote completion versus evidence and work not started

Status uses **Part B**, not the older PR #456 title's inherited “IID-0 … unmerged” wording.

| Item | Actual authoritative state and remote publication | Evidence boundary / next dependency |
|---|---|---|
| IID-1 | **REMOTELY IMPLEMENTED/MERGED**, #456 `bcc022ed…`; exact head `d0229a49…`. IID-0 foundations included. | 195 investment tests (104 new + 91 foundation), 42 NP12, typecheck; identity fixture 18 rows = 4 resolved, 9 unresolved, 4 ineligible, 1 out-of-scope. Browser modules typechecked, not a claimed browser runtime suite. Real 68-row Dhan/D05 resolution remains separate. |
| IID-2 | **REMOTELY IMPLEMENTED/MERGED**, #461 `34c8b39e…`; exact head `ac3bb6ba…`. | 275 investment tests (80 + 195), synthetic issuer payloads; no persistence/routes at this phase. Acceptance matrix and engine independently API-read at merge. |
| IID-3 | **REMOTELY IMPLEMENTED/MERGED**, #464 `f08da401…`, head `120b8a9c…`; independent receipt #467 `95b95cfe…`, head `7a32bdd9…`. | 76 frontend, 130 NP04 read-regression, 286 investment and 651 platform regression tests plus typechecks in its recorded evidence. GET/HEAD-only thin read slice and stable chain/UNCHANGED; injected NP04; static 503 with no substitute. Not a real issuer, full UI, holdings admission or IID-6 completion. |
| IID-4 | **NOT STARTED**, planned disposition engine per B.L; no open implementation PR at initial census. | HELD/CANDIDATE scope separation and existing identity/data/coverage contracts; no disposition capability inferred from thin slice. |
| IID-5 | **NOT STARTED**, planned change intelligence / M-2 per B.L. | Requires prior assessment/version and IID-4 inputs; synthetic M-1 is not M-2. |
| IID-6 | **NOT STARTED**, planned full product surface / M-3 per B.L. | Requires earlier phases and honest limitation rendering; thin IID-3 view is not full product. |

Implementation test counts above are **prior recorded executions**, not re-executed by this task. Census directly
returns green #456 head/main CI 42088935422/42090718155 and #464 head/main 42098111372/42098519223. For #461 and
#467, the queried exact head/merge check-runs API returned **no check entries**: do not invent CI results. Their
committed test/independent-verification artifacts are the cited evidence; #464's frontend CI is not evidence that
its platform suite ran in CI. Full objects/check URLs are in `remote-census.json`.

No IID-4–IID-6 item is promoted from proposal/not-started to implemented-unmerged. No open PR existed at census;
there is no inspected authoritative evidence of an implemented-but-unmerged IID phase. This is not a statement
about private/local unpublished drafts. **No IID implementation is authorized or performed by this paper.**

R-16 remains **3/13 synthetic sectors measured, 10 outstanding**, and the real **2 issuers × 5 years** leg is not
complete. L-001–L-016 remain open at their recorded scopes, including L-016 NP-04 prose/pin mismatch; no pin is
changed here. IID-DATA is an external/provenance dependency within accepted design, not a claim that PA owes a
new design decision on XBRL-first/CSV fallback. IID-L016 requires traceable reconciliation, not a speculative pin
advance. Existing roadmap authorization/settled design is preserved; future implementation work still needs its
proper scoped work item, not this documentary prompt.

## 6. Consolidated per-decision register

IDs G4-1–G4-4 map one-to-one to A-10 decisions 1–4; D01–D06 and A-5–A-7 preserve their existing identities.
IID-DATA and IID-L016 are dependency/reconciliation entries, **not new acts or invented PA approval gates**.
`ALREADY_EFFECTIVE_OR_SETTLED` entries preserve cited prior decisions; their “recommendation” is no change.
`PENDING` means this paper makes no new effective determination, including external/operator actions.

### G4-1

- **Exact question:** PA-09: which content commits, trees and blob inventories govern each of the three R5 coordinates?
- **Current authoritative status:** A-10 decision 1 pending; historical R5 adopted; live consumption drifted. No new designation.
- **Recommended disposition (not an act):** Retain historical R5 unchanged; defer a new designation until an explicit three-coordinate content ballot and scope are accepted. Recensused live 07e86a4/IRR 80737d0 are candidates only, never QE execution pins.
- **Rationale:** One commit cannot identify all three adopted coordinate roles; current dependency pins are not an adopted H-12 regeneration.
- **Alternatives / consequences:** C-1 may accept a measured mixed-content candidate with explicit scope; C-2 requires new Limb-A-only authority; deferral preserves the stop.
- **Accountable authority:** PA (Ramki)
- **Dependencies / evidence:** G4-2; G4-3; G4-4; D01; remote-census.json three R5 roles and current dependency inventory
- **Implementation impact:** Later separate designation and H-12 regeneration; no pin or code changes now.
- **Explicit acceptance criteria:** Act names all three roles with full commit/tree/blob identities, purpose and mixed-content scope; No QE execution pin asserted; exact effective publication/readback and regenerated digest acceptance required
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md §§3–8; Gate 4 act §3.2; remote-census.json

### G4-2

- **Exact question:** A-10 decision 2: select C-1, C-2 or C-3 for mixed non-Limb-A content?
- **Current authoritative status:** Pending; none selected by this work item.
- **Recommended disposition (not an act):** Recommend C-3: keep undesignated until the CAP-03 chain produces C′, as defined in A-10. Prepare a scoped C-1 alternative for explicit PA choice; dependency sequencing is a recommendation, not a new authority gate.
- **Rationale:** Avoid freezing a stale or scope-incomplete basis while durable-holdings amendments remain unresolved.
- **Alternatives / consequences:** C-1 accepts stated non-Limb-A content and requires regeneration/requalification; C-2 needs separately authorized IPD code and a new qualified basis; C-3 delays qualification without relaxing controls.
- **Accountable authority:** PA (Ramki)
- **Dependencies / evidence:** G4-1; D01; D02; D03
- **Implementation impact:** No implementation under C-3; C-1/C-2 require exact separate rendering and downstream work.
- **Explicit acceptance criteria:** Written selection and scope consequences; No inference that content choice implements Limb A or advances QE
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md §8.2; Formal decision record §§4.5–4.6

### G4-3

- **Exact question:** A-10 decision 3: how is the live broker alias coordinate re-rendered under a DQ-6b-class disposition?
- **Current authoritative status:** Historical Path A effective at 70b24f02; live alias is 07e86a4 published-output materialization. Fresh disposition pending.
- **Recommended disposition (not an act):** Recommend separate additive disposition for observed 07e86a4 alias and materialization/profile, with explicit primary/alias overlap inventory and conditions; do not rewrite Path A.
- **Rationale:** Authorized package advances are not automatically an updated qualification freeze.
- **Alternatives / consequences:** Retain historical alias for historical qualification only, or authorize modernized/rebased qualification with new acceptance; silently treating old Path A as current is invalid.
- **Accountable authority:** PA (Ramki)
- **Dependencies / evidence:** G4-1; current package/profile hashes; DQ-6b Path A and mirror
- **Implementation impact:** Future adopted profile/digest qualification; no dependency change here.
- **Explicit acceptance criteria:** Full alias commit/tree/blob and published-output/compiled-set inventory; Explicit source/primary overlap, lineage and qualification consequences; Independent readback; no implicit Path B
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md §§6.2,8.3; DQ-6b Path A act; remote-census.json currentDependencyPins

### G4-4

- **Exact question:** A-10 decision 4: accept which lineage classification and DB-C1 digest reproduction basis?
- **Current authoritative status:** Historical alias REAL x3; R5 primary and current broker pin UNCLASSIFIED x3. Disposition pending.
- **Recommended disposition (not an act):** Recommend acknowledge current UNCLASSIFIED as observed content and require explicit new DB-C1/digest acceptance if used for qualification; preserve old REAL evidence as historical.
- **Rationale:** Changing the classification changes computeLineageHash inputs; old digests cannot be promised reproducible.
- **Alternatives / consequences:** REAL restoration requires new IPD implementation authority; divergence-only acceptance must state non-reproducibility and cannot close missing qualification.
- **Accountable authority:** PA (Ramki)
- **Dependencies / evidence:** G4-3; DB-C1 historical lineage; fresh classification/blob census
- **Implementation impact:** No source toggle or reclassification performed; future re-baseline only after exact authority.
- **Explicit acceptance criteria:** Named classification, coordinate and digest impact; Old historical digests preserved; Any new DB-C1 result separately executed and accepted
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md §§6.4,8.4; remote-census.json lineageClassification

### D01

- **Exact question:** Which distinct GitHub repository is the canonical IPD portfolio owner?
- **Current authoritative status:** Pending; ipo-screening-engine and iips-production-market-data have distinct IDs and purposes.
- **Recommended disposition (not an act):** Retain the G-2-cited portfolio owner in iips-production-market-data; explicitly distinguish the IPO engine rather than aliasing repositories.
- **Rationale:** Reuse avoids duplicating the existing durable domain and IPC in a Python research repository.
- **Alternatives / consequences:** A relocation into ipo-screening-engine requires a new ownership/migration/interface decision and larger investigation; no relocation or rename now.
- **Accountable authority:** PA (Ramki)
- **Dependencies / evidence:** G-2 ownership decision; current repository ID/source census
- **Implementation impact:** Future correctly owned IPD PRs only after designation; IRR remains consumer.
- **Explicit acceptance criteria:** Explicit repository ID/name and immutable basis; No silent alias, ownership transfer or wrong-repository implementation
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/SAIRAM-DURABLE-HOLDINGS-PA-DECISION-PACKAGE-2026-11-06.md D01; remote-census.json repositories

### D02

- **Exact question:** How does canonical owner owner-4dc756b3 extend to durable holdings and existing IPD binding data?
- **Current authoritative status:** Pending holdings extension; evidence owner effective, but AMEND-01 explicitly excludes holdings. Existing source constants use ipd-owner-ramki-personal / ipd-personal-local.
- **Recommended disposition (not an act):** Adopt a separate governed holdings-owner extension and inventory-dependent offline mapping/provisioning disposition; SAIRAM remains display-only and IPD resolves trusted binding internally.
- **Rationale:** Evidence carrier or matching labels are not write credentials or cross-domain identity equivalence.
- **Alternatives / consequences:** Keep existing ownership pending decision; automatic reassignment or request-supplied identity is forbidden.
- **Accountable authority:** PA (Ramki); designated IPD owner/operator executes later
- **Dependencies / evidence:** D01; explicit authorized inventory if required; W-16 revoked-data rules
- **Implementation impact:** Possible bounded offline identity change; no DB opened and no IDs mutated in this work.
- **Explicit acceptance criteria:** Owner target and technical tenant explicitly rendered; Collision/revocation/original-data protection and no caller authority tests; Binding/membership rechecked in serialized mutation transaction
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/SAIRAM-DURABLE-HOLDINGS-PA-DECISION-PACKAGE-2026-11-06.md D02; AMEND-01 §§11(3),15; prior holdings source manifest

### D03

- **Exact question:** Which sustainable revision, create-retry and success/non-empty contribution contracts replace identified limitations?
- **Current authoritative status:** Pending; four-revision cap, non-request-idempotent create and generic IRR response/projection gaps remain.
- **Recommended disposition (not an act):** Recommend monotonic retained revisions with explicit overflow refusal; minimal v1 receipt plus authorized readback/projection amendment; preserve no-auto-retry create reconciliation before any manual retry.
- **Rationale:** Ongoing holdings need more than four revisions; fabricating absent receipt fields or exactly-once guarantees is unsafe.
- **Alternatives / consequences:** Keep caps/gaps and writes closed; or separately version request-idempotent create with explicit key/conflict/retention semantics.
- **Accountable authority:** PA for changed lifecycle/contract; IPD/IRR owners for later scoped engineering
- **Dependencies / evidence:** D01; D02; exact source/contract change envelope
- **Implementation impact:** Later bounded IPD lifecycle and IRR consumer changes; W-1 unchanged throughout unadmitted engineering.
- **Explicit acceptance criteria:** History retained without purge; Repeated imports/concurrent stale revision/unknown outcome tests; Non-empty contributions and commit readback match actual values
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/SAIRAM-DURABLE-HOLDINGS-PA-DECISION-PACKAGE-2026-11-06.md D03; readiness report §§3,5,8

### D04

- **Exact question:** Does transaction-capable mean atomic holdings snapshots or a trade/cash/lot ledger?
- **Current authoritative status:** Scope decision pending; database transactions already exist, accounting ledger not evidenced.
- **Recommended disposition (not an act):** Keep initial scope to holdings snapshots/contribution lineage in atomic SQLite transactions; defer trade/cash/tax-lot accounting.
- **Rationale:** Snapshot differences cannot lawfully reconstruct trades, cash or tax lots.
- **Alternatives / consequences:** A trade ledger requires a separate IPD domain/schema/precision/reversal/corporate-action contract and authority.
- **Accountable authority:** PA (Ramki)
- **Dependencies / evidence:** D01; G-2 existing domain
- **Implementation impact:** No new ledger or inferred transactions now.
- **Explicit acceptance criteria:** Explicit scope exclusion or separate approved ledger design; No trades inferred from CSV differences
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/SAIRAM-DURABLE-HOLDINGS-PA-DECISION-PACKAGE-2026-11-06.md D04; readiness report §§3,5

### D05

- **Exact question:** What exact bounded implementation, backup/recovery and host qualification scope is required?
- **Current authoritative status:** Existing G-2/G3 implementation authority retained; newly identified changes not authorized by this investigation.
- **Recommended disposition (not an act):** Approve only the exact owner/lifecycle/projection delta, pins/files/tests and data-dependent backup/migration boundaries once known; reuse existing unchanged authority.
- **Rationale:** Do not ask to re-adopt completed work, or infer permission for new scope from it.
- **Alternatives / consequences:** Defer; or authorize a precisely bounded delta. A blanket rewrite or new DB is unnecessary.
- **Accountable authority:** PA (Ramki); IPD/IRR maintainers/operator accountable for execution
- **Dependencies / evidence:** D01–D04; G4-1–G4-4; approved source/inventory and host/runtime/schema/digests
- **Implementation impact:** Later IPD-owned changes and IRR contract consumption; no operational access here.
- **Explicit acceptance criteria:** H01–H12 plus existing QE requirements in exact act; Verified consistent backup/restore without overwriting new history; Qualification pin/digest rules preserved; no provisional future SHA
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/SAIRAM-DURABLE-HOLDINGS-PA-DECISION-PACKAGE-2026-11-06.md D05 and candidate envelope; readiness report §§6–9

### D06

- **Exact question:** When and for which exact operations may qualified real-user writes be admitted?
- **Current authoritative status:** Pending result acceptance/admission; W-1(3)/(4) hard-false; Gate C/U4 not rendered.
- **Recommended disposition (not an act):** Separate accepted host results from exact-commit, operation-specific Gate 5/U6 admission; prefer minimal create/save/readback first.
- **Rationale:** A source inspection, fixture PASS or owner-extension act is not host qualification/admission.
- **Alternatives / consequences:** Remain closed; broader reset/delete admission would need all its own lifecycle/recovery evidence.
- **Accountable authority:** PA (Ramki)
- **Dependencies / evidence:** D05; accepted QE/host results; Gate C/U4 and DQ-4 completion under governing scope
- **Implementation impact:** Only a later effective act may authorize the named guard/fence changes.
- **Explicit acceptance criteria:** All four W-1 requirements individually met; QE and IRR/IPD exact commits accepted; No false saved state; readback and unknown-outcome reconciliation demonstrated
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/SAIRAM-DURABLE-HOLDINGS-PA-DECISION-PACKAGE-2026-11-06.md D06; Gate E W-1; WS-A-DM pillars 8–9

### A-5

- **Exact question:** What genuine external Dhan export is needed before reliable row-level assessment/deposition?
- **Current authoritative status:** BLOCKED-EXTERNAL; no later genuine detailed export located in reviewed authoritative evidence.
- **Recommended disposition (not an act):** Operator supplies provenance-bearing DHAN_DETAILED_HOLDINGS_V1 with actual ISIN and Exchange; preserve file/hash privately under existing authorized intake.
- **Rationale:** Summary 68 rows contain no genuine detailed identifiers; 1 resolved / 67 unresolved is not complete resolution.
- **Alternatives / consequences:** Wait for genuine export; synthetic/guessed identifiers or name inference cannot substitute.
- **Accountable authority:** Operator (Ramki), not a new PA data-fabrication decision
- **Dependencies / evidence:** genuine operator-held export; existing intake scope/privacy
- **Implementation impact:** No fabrication, new upload route, lookup or runtime test in this work.
- **Explicit acceptance criteria:** Exact governed columns, provenance and hash; Row/cell lineage retained; ISIN path only reported tested when actually exercised
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/WS-A-DHAN-DETAILED-HOLDINGS-EXTERNAL-DEPENDENCY-2026-11-05.md §§1–3

### A-6

- **Exact question:** Is a new D05 expansion/deposition authorized for the residual genuine identities?
- **Current authoritative status:** NOT STARTED / PENDING explicit expansion authority; existing bootstrap act is not a new Wave-2 grant.
- **Recommended disposition (not an act):** After A-5 and independent identity corroboration, seek the exact IPD-owned Wave-2 expansion act and integrity-bound deposition/test plan.
- **Rationale:** The old 0/67 symbol-space probe plus composition inference is not a tested ISIN-path negative result.
- **Alternatives / consequences:** No expansion; or exact authorized independently corroborated deposition. No fuzzy aliasing or old-act reuse.
- **Accountable authority:** PA for new expansion; designated IPD/operator for deposition
- **Dependencies / evidence:** A-5; independent corroboration; D01; new exact deposition authorization
- **Implementation impact:** Future IPD corpus/manifest/masterRevision/integrity test change only; none here.
- **Explicit acceptance criteria:** Every identifier traces to genuine source cell and corroboration; New act/drop/checksum/count/masterRevision and integrity tests; No bypass of P04/2F; no guessed ISINs
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/WS-A-DHAN-DETAILED-HOLDINGS-EXTERNAL-DEPENDENCY-2026-11-05.md §§3–5

### A-7

- **Exact question:** When may downstream consumption of newly resolved Dhan identities be accepted?
- **Current authoritative status:** BLOCKED by authorized A-6; no downstream success established.
- **Recommended disposition (not an act):** Keep strict A-5 -> A-6 -> A-7 order; re-assess exact original/approved detailed rows after authorized master change, then separately verify consumption/pin if required.
- **Rationale:** A pin choice, evidence retention or IID resolver implementation cannot supply missing identities.
- **Alternatives / consequences:** Stay blocked; skipping A-6 would silently bypass identity authority.
- **Accountable authority:** IRR/IPD maintainers within exact authority; PA for any pin/scope disposition
- **Dependencies / evidence:** completed authorized A-6; recorded before/after master revisions and row results
- **Implementation impact:** Future narrow consumption/assessment; no new implementation now.
- **Explicit acceptance criteria:** Per-row before/after results and quarantine; Exact approved pin and source revisions; No claim that newly resolved identities automatically authorize holdings writes
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/WS-A-DHAN-DETAILED-HOLDINGS-EXTERNAL-DEPENDENCY-2026-11-05.md §§4–6; WS-A-DM pillar 1

### IID-DATA

- **Exact question:** How will real approved issuer/filing data and R-16 coverage prerequisites be supplied?
- **Current authoritative status:** EXTERNAL EVIDENCE prerequisite; R-16 open, 3/13 sectors measured on synthetic reference set; no real issuer M-1 proof.
- **Recommended disposition (not an act):** Use already accepted XBRL-first/CSV fallback and operator-paced approved data, preserving all L-001–L-016 limitations until evidence closes each.
- **Rationale:** Implemented mechanisms and a synthetic persistence demonstration are not populated real-world coverage.
- **Alternatives / consequences:** Continue fixture-only honest disclosures; wider ingestion or sector qualification needs its own applicable scope, not invented approval.
- **Accountable authority:** Operator/data owners; IRR within existing accepted design; PA only for changed authority scope
- **Dependencies / evidence:** approved filings/data/provenance; existing ingestion scope; R-16 criteria
- **Implementation impact:** No scraping, ingestion expansion or IID implementation in Prompt 5.
- **Explicit acceptance criteria:** Real inputs provenance and reproducible normalized facts; Per-sector C-16.x evidence; No implied closure of unrelated limitations
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md §§B.J2–B.L; IID limitation register L-001,L-004,L-009

### IID-L016

- **Exact question:** How should existing NP-04 prose-vs-manifest pin discrepancy be reconciled?
- **Current authoritative status:** OPEN L-016; IID-3 changed no dependency pin.
- **Recommended disposition (not an act):** Trace actual dependency pin and corresponding contract/source first; correct prose under existing scope if documentary, otherwise obtain exact pin/boundary authority before any change.
- **Rationale:** One must not silently advance a persistence dependency to make text agree.
- **Alternatives / consequences:** Keep disclosed discrepancy; or separately scoped evidence-backed reconciliation. Do not rerun Q-1 without need.
- **Accountable authority:** IRR/IPD maintainers; PA only if a real pin/authority change is required
- **Dependencies / evidence:** current package pins; L-016 evidence and NP-04 contract
- **Implementation impact:** Documentation/contract reconciliation only here; no dependency/source change.
- **Explicit acceptance criteria:** Actual pins and prose mismatch explicitly reconciled; No unadmitted schema/boundary change; Published targeted verification for any later change
- **Effective vs pending:** PENDING
- **Traceability:** docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md §B.J4; IID limitation register L-016

### EFF-G2

- **Exact question:** Who owns durable portfolios?
- **Current authoritative status:** ACCEPTED G-2: IPD domain/store, IRR consumer; non-production first.
- **Recommended disposition (not an act):** Preserve existing ownership; D01 clarifies repository designation, not transfer.
- **Rationale:** Preserve effective or already-settled scope rather than duplicate governance.
- **Alternatives / consequences:** Changing accepted scope requires an explicit additive disposition; no change proposed here.
- **Accountable authority:** Existing accountable PA/domain owners
- **Dependencies / evidence:** cited effective record
- **Implementation impact:** None in this work item.
- **Explicit acceptance criteria:** Existing records remain byte-identical; No scope expansion or new gate advancement
- **Effective vs pending:** ALREADY_EFFECTIVE_OR_SETTLED
- **Traceability:** G-2 architectural decision §§1–9

### EFF-SQL

- **Exact question:** Is a fresh storage technology selection needed?
- **Current authoritative status:** Later authorized G24 SQLite reuse; current node:sqlite source confirmed unchanged.
- **Recommended disposition (not an act):** No fresh database choice; preserve current lineage and distinguish historical HTTP/driver details.
- **Rationale:** Preserve effective or already-settled scope rather than duplicate governance.
- **Alternatives / consequences:** Changing accepted scope requires an explicit additive disposition; no change proposed here.
- **Accountable authority:** Existing accountable PA/domain owners
- **Dependencies / evidence:** cited effective record
- **Implementation impact:** None in this work item.
- **Explicit acceptance criteria:** Existing records remain byte-identical; No scope expansion or new gate advancement
- **Effective vs pending:** ALREADY_EFFECTIVE_OR_SETTLED
- **Traceability:** G-2 implementation record §§2–5; prior holdings source manifest

### EFF-W1

- **Exact question:** Does accepted Gate E policy permit writes now?
- **Current authoritative status:** Gate E policy accepted; current guard hard-false while qualification/admission unmet.
- **Recommended disposition (not an act):** Preserve the four independent conditions; accepted policy is not active write permission.
- **Rationale:** Preserve effective or already-settled scope rather than duplicate governance.
- **Alternatives / consequences:** Changing accepted scope requires an explicit additive disposition; no change proposed here.
- **Accountable authority:** Existing accountable PA/domain owners
- **Dependencies / evidence:** cited effective record
- **Implementation impact:** None in this work item.
- **Explicit acceptance criteria:** Existing records remain byte-identical; No scope expansion or new gate advancement
- **Effective vs pending:** ALREADY_EFFECTIVE_OR_SETTLED
- **Traceability:** Gate E W-1–W-16; prior holdings source manifest

### EFF-R5

- **Exact question:** Is R5 adoption itself still awaiting a decision?
- **Current authoritative status:** R5 adoption effective in governing locus, unchanged manifest with all three historical coordinates.
- **Recommended disposition (not an act):** Do not re-adopt R5 or edit its candidate status string; new current-basis designation is distinct.
- **Rationale:** Preserve effective or already-settled scope rather than duplicate governance.
- **Alternatives / consequences:** Changing accepted scope requires an explicit additive disposition; no change proposed here.
- **Accountable authority:** Existing accountable PA/domain owners
- **Dependencies / evidence:** cited effective record
- **Implementation impact:** None in this work item.
- **Explicit acceptance criteria:** Existing records remain byte-identical; No scope expansion or new gate advancement
- **Effective vs pending:** ALREADY_EFFECTIVE_OR_SETTLED
- **Traceability:** R5 adoption act; tracker §16.123.12; remote-census.json

### EFF-DQ6B

- **Exact question:** Must historical Path A be decided again?
- **Current authoritative status:** Path A and mirror effectiveness recorded 6/6; historical guarded split preserved.
- **Recommended disposition (not an act):** Keep historical disposition; current alias requires G4-3, not silent rewrite.
- **Rationale:** Preserve effective or already-settled scope rather than duplicate governance.
- **Alternatives / consequences:** Changing accepted scope requires an explicit additive disposition; no change proposed here.
- **Accountable authority:** Existing accountable PA/domain owners
- **Dependencies / evidence:** cited effective record
- **Implementation impact:** None in this work item.
- **Explicit acceptance criteria:** Existing records remain byte-identical; No scope expansion or new gate advancement
- **Effective vs pending:** ALREADY_EFFECTIVE_OR_SETTLED
- **Traceability:** DQ-6b Path A act and mirror; A-10 §6.2

### EFF-RET

- **Exact question:** Is parsed evidence retention/retrieval complete?
- **Current authoritative status:** Effective AMEND-01/02; completed #448/#449 and #454/#455 evidence/retrieval publication.
- **Recommended disposition (not an act):** Closed implementation scope; retain isolation, original snapshot and no-holdings-authority limits.
- **Rationale:** Preserve effective or already-settled scope rather than duplicate governance.
- **Alternatives / consequences:** Changing accepted scope requires an explicit additive disposition; no change proposed here.
- **Accountable authority:** Existing accountable PA/domain owners
- **Dependencies / evidence:** cited effective record
- **Implementation impact:** None in this work item.
- **Explicit acceptance criteria:** Existing records remain byte-identical; No scope expansion or new gate advancement
- **Effective vs pending:** ALREADY_EFFECTIVE_OR_SETTLED
- **Traceability:** Live retention publication receipt; #454/#455

### EFF-CLEAR

- **Exact question:** Is owner-controlled active-store clearing complete?
- **Current authoritative status:** Effective owner reset act; #462/#463 and #465/#466 closure merged.
- **Recommended disposition (not an act):** Keep offline whole-active-only reset, verified retained copy, resurrection/no permanent-erasure and OS/quiescence limits.
- **Rationale:** Preserve effective or already-settled scope rather than duplicate governance.
- **Alternatives / consequences:** Changing accepted scope requires an explicit additive disposition; no change proposed here.
- **Accountable authority:** Existing accountable PA/domain owners
- **Dependencies / evidence:** cited effective record
- **Implementation impact:** None in this work item.
- **Explicit acceptance criteria:** Existing records remain byte-identical; No scope expansion or new gate advancement
- **Effective vs pending:** ALREADY_EFFECTIVE_OR_SETTLED
- **Traceability:** Owner reset implementation receipt later closure; #462/#463/#466

### EFF-IID

- **Exact question:** Are accepted IID design questions new PA blockers?
- **Current authoritative status:** Roadmap design answers D-1 and R-1–R-17 already settled; IID-1–3 delivered at cited scope.
- **Recommended disposition (not an act):** Preserve those answers; do not invent new approval needs or infer new implementation from Prompt 5.
- **Rationale:** Preserve effective or already-settled scope rather than duplicate governance.
- **Alternatives / consequences:** Changing accepted scope requires an explicit additive disposition; no change proposed here.
- **Accountable authority:** Existing accountable PA/domain owners
- **Dependencies / evidence:** cited effective record
- **Implementation impact:** None in this work item.
- **Explicit acceptance criteria:** Existing records remain byte-identical; No scope expansion or new gate advancement
- **Effective vs pending:** ALREADY_EFFECTIVE_OR_SETTLED
- **Traceability:** docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md §0 and Part B

## 7. Workstream A closure: preserve completed controls, keep real blockers visible

**Retention/retrieval and owner-controlled active-store clearing capability are completed, published work.**
A-10 §9's old A-8/A-9 pending wording and WS-A-DM's older retrieval-blocked/retention-bounded descriptions are
historical, superseded for status by effective AMEND-01/02 and their implementation receipts. This does not
reopen or edit their acts. Current retention is indefinite **until explicit authorized reset**; no expiry,
purge, compaction, selective record rewrite or background deletion. No unrelated controls are relaxed.

Clearing is the existing **offline, owner-only, quiescent, whole-active-journal** procedure, with a **verified
retained recovery copy** required by its protocol. Completed capability is not a claim this work executed a real
owner reset or activated deployment. Restoring that copy, or re-submitting imports, may resurrect evidence.
This is not permanent/all-copy erasure. OS/filesystem and process-quiescence limitations remain: no new ACL,
locking, fsync, power-loss or all-copy-erasure guarantees. No HTTP DELETE, remote destruction, raw CSV upload,
multiuser/auth expansion, per-record tombstones or automation is introduced.

Workstream A / WS-A-DM remain **NOT COMPLETE**. Open threads are real identity intake/A-6/A-7; holdings ownership,
lifecycle/non-empty projection/retry scope D01–D06; all four Gate 4 decisions; authorized host/QE execution,
result acceptance and operation-specific admission. Existing fixture persistence/recovery/isolation/fail-closed
success is not reopened, but it is not evidence of real-user durable saves. IID is a related dependency,
**not** a shortcut that completes holdings or the whole milestone. Do not mechanically promote entire WS-A-DM
pillars using this reconciliation: original criteria and independently evidenced scopes still govern.
Historical “H-12 NOT ADOPTED” is not evidence that R5 adoption is undone: R5 is adopted historically; the current
re-designated execution basis and its regenerated inventory/qualification are still pending.

## 8. Validation, publication and invariants

Technical attachments: `evidence/integration/gate4-holdings-identity-reconciliation-2026-11-06/` contains
`remote-census.json`, `history-and-iid-readback.json`, `decision-register.json`, `census.py`, and narrow scope /
register / independent publication validators. These are documentary evidence tools, not production code or
operator scripts. They do not access a database, provision/migrate, execute QE or accept a result.

Allowed changes are this paper, its evidence, and **append-only** tracker §16.261 / CV-CORR-241 /
CHG-2026-11-06-04 / V2136, R2 §24, IID roadmap B.M and WS-A-DM §5 overlays. All prior act/source/evidence bytes,
package pins, lockfiles, workflows, PF-1, retention/clearing implementation and concurrent IID code remain protected.
Targeted validation checks register field/ID completeness, counts, scope, exact prefixes and status consistency;
existing CAP-03 classification/static and whitespace validation remain applicable. No justification exists to
rerun the 1,512-test product suite for this documentary change.

Exact-head green checks precede merge. Independent API readback must verify branch, head, merge, paths and
bytes and all preserved blobs against the **actual merge first parent**, plus the starting baseline if concurrent
work intervenes. Final PR publication comment carries exact head/merge/CI/readback proof; no self-referential
receipt commit loop is needed. A published package is **not** PA adoption, Gate 4 acceptance, holdings readiness,
IID-4–IID-6 completion, real identity resolution, or WS-A completion.

**Prohibited actions performed: NONE.** W-1(3)/(4) remain hard-false; no holdings writes, operational DB access,
IPD/source/authority mutation, provisioning/migration, Gate 4 acceptance or execution-pin designation, D05 expansion,
fabrication/guessed mappings, PF-1/production activity, or weakened ownership/security/retention/clearing controls.


## 9. Formal PA adoption-workflow companion (`2026-11-06`; append-only)

The 15 pending entries above are now staged for formal PA disposition in
[FORMAL-PA-DECISION-ADOPTION-DOCKET-2026-11-06.md](FORMAL-PA-DECISION-ADOPTION-DOCKET-2026-11-06.md),
using immutable #470 main `6946bee09395364a8a06ffafb1c4ef91c866e340` as the authoritative baseline.
The companion is the single docket, not a replacement paper or effective act. Classifications: ADOPTABLE NOW
G4-2/D01/D04; CONDITIONAL G4-3/G4-4/D03/D06/A-5/A-7/IID-DATA; DEFERRED G4-1/IID-L016; REQUIRES SEPARATE
AUTHORIZATION D02/D05/A-6. Exact questions and eight effective/settled crosswalks are retained.
**No new explicit PA disposition supplied; newly adopted 0; no implementation authority.**
Tracker §16.262 / CV-CORR-242 / V2137 and R2 §25 register the workflow. Recommendations and classifications
remain Arena's, not PA choices. QE 0/11; Gate C/U4 NOT RENDERED; all D01–D06 still pending. A-5 genuine source,
A-6 exact authority and dependent A-7 remain unresolved; no unknown-ISIN absence claim. IID-1/2/3 MERGED; IID-4 NOT STARTED at #470, now MERGED via concurrent #471;
IID-5/6 NOT STARTED. Completed retention/clearing unchanged. W-1 hard-false and all safety boundaries above
remain. Workstream A / WS-A-DM NOT COMPLETE. Future real dispositions must append exact authority/scope and
meet effectiveness requirements; publishing this companion does not adopt them.

Concurrency reconciliation: #471 `bc0de0ea9702a4b6a34138db4fbe9ec81bc0f688` is the integration baseline;
all 42 concurrent paths preserved. IID-4 merged from separate work, not this docket; L-017–L-027 added,
L-001–L-016 remain open. No new PA choice of these 15 entries or IID implementation authority inferred.
